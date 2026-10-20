// The original Studio is a domain adapter to the same completion predicate.
// This verifier reads durable evidence; no model or request may declare PASS.
import type {Queryable} from '../core-v2/postgres/wire.ts';
import {canonical,sha256} from '../core-v2/kernel/ids.ts';
import {getWorkOrder} from '../core-v2/work-orders/store.ts';
import {saveWorkOrderCompletion} from '../core-v2/work-orders/completion.ts';
import {alreadyInTransaction} from './start.ts';
import {readAnalysisResults} from './analysis-results.ts';
import {readAnalysis,manifestOfAnalysis} from './analysis.ts';
export const ANALYSIS_DELIVERABLE='A verified analysis tied to the submitted source revisions';
export const ANALYSIS_CRITERIA=['Every accepted finding is supported by current source anchors',
  'Independent source verification passed and the saved result can be reopened'];
type Snapshot=NonNullable<Awaited<ReturnType<typeof readAnalysisResults>>>;

// Caller holds a repeatable-read transaction. Terminal results only; no cost,
// human adjudication or source revisions are altered by this readback.
export async function verifyAnalysisDelivery(tx:Queryable,organization:string,analysisId:string,snapshot:Snapshot){
  if(!snapshot.workflowId)return {state:'NOT_STARTED'};
  const found=(await tx.query(`select id from core_v2_work_orders where organization_id=$1::uuid
    and workflow_id=$2::uuid and initiating_surface='measured-decision' order by created_at limit 1`,
    [organization,snapshot.workflowId])).rows[0];
  if(!found)return {state:'WORK_ORDER_NOT_LINKED'};
  await tx.query('select id from core_v2_work_orders where id=$1::uuid for update',[found.id]);
  const order=await getWorkOrder(tx,organization,found.id);
  const resultDigest=sha256(canonical(snapshot));
  if(order.current_state==='COMPLETED')return {state:order.final_outcome?.artifact_digest===resultDigest?'COMPLETED':'SOURCE_RESULT_CHANGED',
    work_order_id:order.work_order_id,artifact_digest:order.final_outcome?.artifact_digest};
  if(order.requested_deliverable!==ANALYSIS_DELIVERABLE||canonical(order.acceptance_criteria)!==canonical(ANALYSIS_CRITERIA))
    return {state:'CUSTOM_ACCEPTANCE_REQUIRED',work_order_id:order.work_order_id};
  if(order.execution_state!=='completed')return {state:order.current_state,work_order_id:order.work_order_id};
  const unfinished=(await tx.query(`select
    (select count(*) from disagreements where workflow_id=$1 and state not in ('resolved','superseded')) as disputes,
    (select count(*) from agent_attempts where workflow_id=$1 and state='outcome_unknown') as unknown_attempts,
    (select coalesce(sum(reserved),0) from workflow_cost_budgets where workflow_id=$1) as reserved`,[snapshot.workflowId])).rows[0];
  if(Number(unfinished.disputes)||Number(unfinished.unknown_attempts)||Number(unfinished.reserved))
    return {state:'UNSETTLED_EVIDENCE',work_order_id:order.work_order_id};
  const accepted=snapshot.subjects.length>0&&snapshot.unpaired===0&&snapshot.subjects.every(s=>
    s.section!=='needsCheck'&&s.taskStates.every(state=>state==='completed')&&s.readings.some(r=>r.status==='accepted'));
  if(!accepted)return {state:'VERIFICATION_INCOMPLETE',work_order_id:order.work_order_id};
  const analysis=await readAnalysis(tx,analysisId);
  if(!analysis||analysis.organizationId!==organization)return {state:'SOURCE_UNAVAILABLE',work_order_id:order.work_order_id};
  const manifest=manifestOfAnalysis(analysis,snapshot.workflowId);
  const sources=(await tx.query('select uri,content_hash from workflow_sources where workflow_id=$1 order by ordinal',[snapshot.workflowId])).rows;
  const revisionsMatch=sources.length===manifest.sources.length&&manifest.sources.every(s=>
    sources.some(row=>row.uri===s.uri&&row.content_hash===s.contentHash));
  const missing=(await tx.query(`select c.id from evidence_claims c where c.workflow_id=$1
    and c.status='accepted' and c.predicate='finding' and c.observation_basis='observed' and not exists(
      select 1 from evidence_anchors a join source_segments s on s.id=a.segment_id
      join workflow_sources w on w.id=s.source_id
      join analysis_files f on f.analysis_id=$2 and w.uri='mdai://analysis/'||$2::text||'/file/'||f.ordinal::text
      join analysis_parts p on p.file_id=f.id and p.content_sha256=s.content_hash and p.ordinal=s.ordinal
      where a.claim_id=c.id and a.workflow_id=c.workflow_id and s.workflow_id=c.workflow_id
        and a.quoted_text is not null and length(a.quoted_text)>0)`,[snapshot.workflowId,analysisId])).rows;
  if(!revisionsMatch||missing.length)return {state:'SOURCE_EVIDENCE_MISMATCH',work_order_id:order.work_order_id};
  // Open the actual saved result again before binding the completion. Store the
  // complete small snapshot as gate evidence, so the accepted version survives
  // later product changes without inventing a second artifact store.
  const reopened=await readAnalysisResults(tx,organization,analysisId);
  if(!reopened||sha256(canonical(reopened))!==resultDigest)return {state:'RESULT_READBACK_MISMATCH',work_order_id:order.work_order_id};
  if(canonical(reopened).length>1000000)return {state:'RESULT_REQUIRES_EXPORT',work_order_id:order.work_order_id};
  const completed=await saveWorkOrderCompletion(alreadyInTransaction(tx),organization,order.work_order_id,order.revision,{
    outcomeRequired:ANALYSIS_DELIVERABLE,artifactExists:true,artifactDigest:resultDigest,decisionBoundDigest:resultDigest,
    readBackSucceeded:true,verifiedBy:'independent_verifier',acceptanceGates:[
      {name:ANALYSIS_CRITERIA[0],required:true,passed:true,evidence:canonical({sources,missing_anchors:0})},
      {name:ANALYSIS_CRITERIA[1],required:true,passed:true,evidence:canonical({result:reopened,artifact_digest:resultDigest})}]});
  return {state:completed.current_state,work_order_id:order.work_order_id,artifact_digest:resultDigest};
}
