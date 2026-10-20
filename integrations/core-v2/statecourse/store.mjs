import { randomUUID } from 'node:crypto';
import { canonical, digest, freeze, IntegrationError, requestInput, UUID, VERSION } from './contract.mjs';
import { verifySnapshot } from './findings.mjs';

// This writer MUST lease Core connections, never StateCourse source connections.
export class PostgresResultStore {
 constructor({connect,expectedDatabaseName}) {
  if(typeof connect!=='function' || !expectedDatabaseName) throw new Error('explicit_core_storage_connection_required');
  this.connect=connect;this.expectedDatabaseName=expectedDatabaseName;
 }
 async transaction(organizationId,actorId,work) {
  if(!UUID.test(organizationId??'') || !UUID.test(actorId??'')) throw new IntegrationError('invalid_storage_scope');
  const c=await this.connect();
  try {
   await c.query('BEGIN');
   const guard=await c.query("select current_database() as database_name,to_regclass('public.enrollments') is null as isolated");
   if(guard.rows[0]?.database_name!==this.expectedDatabaseName || guard.rows[0]?.isolated!==true) throw new IntegrationError('core_storage_target_refused',503);
   await c.query('SET LOCAL ROLE statecourse_core_store');
   await c.query("select set_config('core_readonly.organization_id',$1,true),set_config('core_readonly.actor_id',$2,true)",[organizationId,actorId]);
   await c.query("SET LOCAL statement_timeout='5s'");
   const result=await work(c);await c.query('COMMIT');return result;
  } catch(error) {try{await c.query('ROLLBACK');}catch{/* never expose connection details */}throw error;}
  finally {await c.release();}
 }
 async reserve({organizationId,actorId,idempotencyKey,scope}) {
  scope=requestInput(scope);
  if(!UUID.test(idempotencyKey??'')) throw new IntegrationError('idempotency_key_required');
  const requestHash=digest({contractVersion:VERSION,scope});
  return this.transaction(organizationId,actorId,async c=>{
   const made=await c.query(`insert into core_readonly.runs(id,organization_id,actor_id,idempotency_key,course_id,enrollment_id,request_hash)
    values($1,$2,$3,$4,$5,$6,$7) on conflict(organization_id,actor_id,idempotency_key) do nothing returning *`,
    [randomUUID(),organizationId,actorId,idempotencyKey,scope.courseId,scope.enrollmentId,requestHash]);
   const row=made.rows[0]??(await c.query('select * from core_readonly.runs where organization_id=$1 and actor_id=$2 and idempotency_key=$3',[organizationId,actorId,idempotencyKey])).rows[0];
   if(!row || row.request_hash!==requestHash) throw new IntegrationError('idempotency_scope_conflict',409);
   return {created:made.rows.length===1,run:row};
  });
 }
 async get({organizationId,actorId,runId}) {
  if(!UUID.test(runId??'')) throw new IntegrationError('result_not_found',404);
  return this.transaction(organizationId,actorId,async c=>{
   const row=(await c.query('select * from core_readonly.runs where organization_id=$1 and actor_id=$2 and id=$3',[organizationId,actorId,runId])).rows[0];
   if(!row) throw new IntegrationError('result_not_found',404);
   const artifacts=(await c.query('select kind,content_hash,canonical_text from core_readonly.artifacts where organization_id=$1 and run_id=$2',[organizationId,runId])).rows;
   for(const artifact of artifacts) if(digest(artifact.canonical_text)!==artifact.content_hash) throw new IntegrationError('stored_result_integrity_failed',503);
   const snapshotArtifact=artifacts.find(a=>a.kind==='snapshot'),result=artifacts.find(a=>a.kind==='result');
   const captured=snapshotArtifact?JSON.parse(snapshotArtifact.canonical_text):null;
   if(captured) {verifySnapshot(captured);if(captured.scope.courseId!==row.course_id || captured.scope.enrollmentId!==row.enrollment_id) throw new IntegrationError('stored_result_integrity_failed',503);}
   if(row.status==='completed' && (!result || !captured)) throw new IntegrationError('stored_result_integrity_failed',503);
   if(result && (!captured || JSON.parse(result.canonical_text).snapshotHash!==captured.snapshotHash)) throw new IntegrationError('stored_result_integrity_failed',503);
   const events=(await c.query('select kind,recorded_at from core_readonly.events where organization_id=$1 and run_id=$2 order by id',[organizationId,runId])).rows;
   return freeze({run:row,events,result:result?JSON.parse(result.canonical_text):null,resultHash:result?.content_hash??null});
  });
 }
 // Internal worker access only; snapshots are never returned by the public API.
 async getCaptured(context) {
  return this.transaction(context.organizationId,context.actorId,async c=>{
   const run=await this.lock(c,context);
   if(run.status!=='captured')throw new IntegrationError('run_not_available_for_execution',409);
   const row=(await c.query("select canonical_text,content_hash from core_readonly.artifacts where organization_id=$1 and run_id=$2 and kind='snapshot'",[context.organizationId,context.runId])).rows[0];
   if(!row || digest(row.canonical_text)!==row.content_hash)throw new IntegrationError('snapshot_integrity_failed',503);
   const snapshot=JSON.parse(row.canonical_text);verifySnapshot(snapshot);
   if(snapshot.scope.courseId!==run.course_id || snapshot.scope.enrollmentId!==run.enrollment_id)throw new IntegrationError('snapshot_scope_conflict',409);
   return freeze(snapshot);
  });
 }
 async capture(context,snapshot) {
  verifySnapshot(snapshot);
  return this.transaction(context.organizationId,context.actorId,async c=>{
   const run=await this.lock(c,context);
   if(run.status!=='reserved' || run.course_id!==snapshot.scope.courseId || run.enrollment_id!==snapshot.scope.enrollmentId) throw new IntegrationError('snapshot_scope_conflict',409);
   await this.artifact(c,context,'snapshot',snapshot);
   await c.query("update core_readonly.runs set status='captured' where id=$1 and organization_id=$2",[context.runId,context.organizationId]);
  });
 }
 async start(context) {return this.transition(context,'captured','running');}
 async interrupt(context) {
  return this.transaction(context.organizationId,context.actorId,async c=>{
   const run=await this.lock(c,context);
   if(['reserved','captured','running'].includes(run.status)) await c.query("update core_readonly.runs set status='interrupted' where id=$1 and organization_id=$2",[context.runId,context.organizationId]);
  });
 }
 async transition(context,from,to) {
  return this.transaction(context.organizationId,context.actorId,async c=>{
   const run=await this.lock(c,context);
   if(run.status!==from) throw new IntegrationError('run_not_available_for_execution',409);
   await c.query('update core_readonly.runs set status=$1 where id=$2 and organization_id=$3',[to,context.runId,context.organizationId]);
  });
 }
 async complete(context,result) {
  return this.transaction(context.organizationId,context.actorId,async c=>{
   const run=await this.lock(c,context);
   if(run.status!=='running') throw new IntegrationError('run_not_available_for_completion',409);
   const stored=(await c.query("select canonical_text,content_hash from core_readonly.artifacts where organization_id=$1 and run_id=$2 and kind='snapshot'",[context.organizationId,context.runId])).rows[0];
   if(!stored || digest(stored.canonical_text)!==stored.content_hash) throw new IntegrationError('snapshot_integrity_failed',503);
   const snapshot=JSON.parse(stored.canonical_text);verifySnapshot(snapshot);
   if(result.workflowId && result.workflowId!==context.runId) throw new IntegrationError('result_workflow_conflict',409);
   if(result.snapshotHash!==snapshot.snapshotHash || result.capturedAt!==snapshot.capturedAt) throw new IntegrationError('result_snapshot_conflict',409);
   await this.artifact(c,context,'result',result);
   await c.query("update core_readonly.runs set status='completed' where id=$1 and organization_id=$2",[context.runId,context.organizationId]);
   return digest(canonical(result));
  });
 }
 async lock(c,{organizationId,actorId,runId}) {
  const row=(await c.query('select * from core_readonly.runs where id=$1 and organization_id=$2 and actor_id=$3 for update',[runId,organizationId,actorId])).rows[0];
  if(!row) throw new IntegrationError('result_not_found',404);return row;
 }
 async artifact(c,context,kind,value) {
  const text=canonical(value);
  if(Buffer.byteLength(text)>16*1024*1024) throw new IntegrationError('artifact_too_large',422);
  await c.query('insert into core_readonly.artifacts(organization_id,run_id,kind,content_hash,canonical_text) values($1,$2,$3,$4,$5)',[context.organizationId,context.runId,kind,digest(text),text]);
 }
}
