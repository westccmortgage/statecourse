import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {PGlite,installResultStore,connect} from './core-database.mjs';
import {PostgresResultStore} from '../store.mjs';
import {createReadOnlyApi} from '../api.mjs';
import {explainSnapshot} from '../engine.mjs';
import {IntegrationError,COURSE_ID} from '../contract.mjs';
import {snapshot,ACTOR,SESSION,ENROLLMENT,OTHER,ORGANIZATION,PROOF} from './fixtures.mjs';
import {executors} from './executors.mjs';
const KEY='66666666-6666-4666-8666-666666666666';
const scope={courseId:COURSE_ID,enrollmentId:ENROLLMENT};
const issue=()=>snapshot(t=>{t.access_grants=[];});
const context={organizationId:ORGANIZATION,actorId:ACTOR};
const storeFor=db=>new PostgresResultStore({connect:connect(db),expectedDatabaseName:'template1'});
const reserve=(store,over={})=>store.reserve({...context,idempotencyKey:KEY,scope,...over});
function request(path='',{method='POST',key=KEY,body=scope}={}) {return new Request('https://core.invalid/v1/statecourse/observations'+path,{method,
 headers:{origin:'https://statecourse.invalid',authorization:'Bearer fixture','x-statecourse-staff-proof':PROOF,'content-type':'application/json','idempotency-key':key},...(method==='POST'?{body:JSON.stringify(body)}:{})});}
function api(store,over={}) {return createReadOnlyApi({enabled:true,allowedOrigin:'https://statecourse.invalid',organizationId:ORGANIZATION,store,
 verifyAccessToken:async()=>({userId:ACTOR,sessionId:SESSION}),reader:{reauthorize:async()=>true,read:async()=>issue()},createExecutors:executors(),...over});}
test('result/snapshot and evidence survive actual database close/reopen; replay does not rerun providers',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'statecourse-result-store-'));let db=new PGlite(dir);
 try {
  await installResultStore(db);let calls=0;
  const factory=executors();
  const first=await api(storeFor(db),{createExecutors:async resolver=>{calls++;return factory(resolver);}})(request());
  assert.equal(first.status,200,await first.clone().text());const body=await first.json();assert.equal(body.status,'verified_observations');assert.equal(calls,1);
  await db.close();db=new PGlite(dir);
  const restarted=api(storeFor(db),{createExecutors:async()=>{throw new Error('provider must not rerun');},reader:{reauthorize:async()=>true,read:async()=>{throw new Error('source must not be recaptured');}}});
  const read=await restarted(request('/'+body.persistence.runId,{method:'GET'}));assert.equal(read.status,200);
  const saved=await read.json();assert.deepEqual(saved.observations,body.observations);assert.equal(saved.persistence.resultHash,body.persistence.resultHash);
  assert.deepEqual(saved.events.map(e=>e.kind),['reserved','captured','running','completed']);
  const retry=await restarted(request());assert.equal(retry.status,200);assert.equal((await retry.json()).persistence.runId,body.persistence.runId);
  const denied=api(storeFor(db),{verifyAccessToken:async()=>({userId:OTHER,sessionId:SESSION})});
  assert.equal((await denied(request('/'+body.persistence.runId,{method:'GET'}))).status,404);
  const revoked=api(storeFor(db),{reader:{reauthorize:async()=>{throw new IntegrationError('staff_scope_or_session_denied',403);}}});
  assert.equal((await revoked(request('/'+body.persistence.runId,{method:'GET'}))).status,403);
 } finally {await db.close();await rm(dir,{recursive:true,force:true});}
});
test('storage has immutable artifacts, identity/transition guards and actor/org RLS',async()=>{
 const db=new PGlite();try {
  await installResultStore(db);const store=storeFor(db),r=await reserve(store),ctx={...context,runId:r.run.id};
  assert.equal((await reserve(store)).created,false);
  await assert.rejects(()=>reserve(store,{scope:{...scope,enrollmentId:OTHER}}),/scope_conflict/);
  await assert.rejects(()=>store.start(ctx),/not_available/);
  await store.capture(ctx,issue());await store.start(ctx);
  const result=await explainSnapshot(issue(),{organizationId:ORGANIZATION,createExecutors:executors(),workflowId:ctx.runId});
  await store.complete(ctx,result);
  await assert.rejects(()=>store.get({...ctx,actorId:OTHER}),/not_found/);
  await assert.rejects(()=>store.get({...ctx,organizationId:OTHER}),/not_found/);
  await assert.rejects(()=>db.query("update core_readonly.artifacts set canonical_text='{}' where run_id=$1",[ctx.runId]),/immutable/);
  await assert.rejects(()=>db.query('delete from core_readonly.events where run_id=$1',[ctx.runId]),/immutable/);
  await assert.rejects(()=>db.query('update core_readonly.runs set enrollment_id=$1 where id=$2',[OTHER,ctx.runId]),/identity/);
  await assert.rejects(()=>db.query("update core_readonly.runs set status='running' where id=$1",[ctx.runId]),/illegal/);
  await db.exec('set role statecourse_core_store');
  assert.equal((await db.query('select * from core_readonly.runs')).rows.length,0,'missing scope must deny all rows');
  await assert.rejects(()=>db.query('delete from core_readonly.runs'),/permission denied/);
  await db.exec('reset role');
 } finally {await db.close();}
});
test('interrupted reservations never auto-replay, and evidence/result scope cannot be changed',async()=>{
 const db=new PGlite();try {
  await installResultStore(db);const store=storeFor(db);
  const response=await api(store,{createExecutors:async()=>{throw new Error('unknown provider outcome');}})(request());
  assert.equal(response.status,503);
  const r=await reserve(store),ctx={...context,runId:r.run.id};assert.equal(r.run.status,'interrupted');
  const retry=await api(store)(request());assert.equal(retry.status,409);
  const read=await api(store)(request('/'+ctx.runId,{method:'GET'}));assert.equal(read.status,202);assert.equal((await read.json()).status,'interrupted');
  const next=await reserve(store,{idempotencyKey:OTHER}),nextCtx={...context,runId:next.run.id};
  await assert.rejects(()=>store.capture(nextCtx,{...issue(),scope:{...scope,enrollmentId:OTHER}}),/integrity/);
  await store.capture(nextCtx,issue());await store.start(nextCtx);
  await assert.rejects(()=>store.complete(nextCtx,{snapshotHash:'0'.repeat(64),capturedAt:issue().capturedAt}),/snapshot_conflict/);
  assert.equal((await store.get(nextCtx)).run.status,'running');
  assert.equal((await api(store)(request('',{key:''}))).status,400);
 } finally {await db.close();}
});
test('migration and connector refuse a StateCourse source DB or wrong database name',async()=>{
 const db=new PGlite();try {
  await db.exec('create table public.enrollments(id uuid)');
  await assert.rejects(()=>installResultStore(db),/source_database_refused/);await db.exec('rollback');
  await assert.rejects(()=>reserve(storeFor(db)),/target_refused/);
  assert.equal((await db.query("select to_regclass('core_readonly.runs') as table_name")).rows[0].table_name,null);
  await assert.rejects(()=>reserve(new PostgresResultStore({connect:connect(db),expectedDatabaseName:'other'})),/target_refused/);
 } finally {await db.close();}
});
