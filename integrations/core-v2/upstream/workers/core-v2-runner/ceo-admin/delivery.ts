import type {TransactionalClient} from '../../core-v2/postgres/wire.ts';
import {canonical,sha256,isUuid} from '../../core-v2/kernel/ids.ts';
import {getWorkOrder} from '../../core-v2/work-orders/store.ts';
import {WorkOrderRefusal} from '../../core-v2/work-orders/contract.ts';
import {saveWorkOrderCompletion} from '../../core-v2/work-orders/completion.ts';
import {alreadyInTransaction} from '../start.ts';
import {readResultsSnapshot} from './results.ts';
export const AUDIT_DELIVERABLE='A current decision audit and approval-gated action proposals for the submitted desk batch';
export const AUDIT_CRITERIA=['Every accepted finding has source evidence and verification',
  'The complete decision audit and proposals are read back from CEO Admin'];
// Receipt is accepted only at the authenticated server-to-server Admin door.
// It describes independent SQL readback, not owner authority or action execution.
export async function confirmAdminDelivery(db:TransactionalClient,organization:string,owner:string,workflow:unknown,value:unknown){
  if(!isUuid(workflow)||!value||typeof value!=='object'||Array.isArray(value))throw new WorkOrderRefusal('invalid_receipt','A current projection receipt is required');
  const receipt=value as Record<string,unknown>;
  if(receipt.protocol!=='ceo-admin.projection-readback.1'||receipt.verified!==true||receipt.workflow_id!==workflow
    ||receipt.owner_id!==owner||!Array.isArray(receipt.problems)||receipt.problems.length
    ||!['revision','projection_sha256'].every(k=>/^[a-f0-9]{64}$/.test(String(receipt[k])))
    ||!['subjects','outputs','inputs','proposals'].every(k=>Number.isInteger(receipt[k])&&Number(receipt[k])>=0))
    throw new WorkOrderRefusal('invalid_receipt','Admin must independently verify the complete projection');
  return db.transaction(async tx=>{
    await tx.query('set transaction isolation level repeatable read');
    const result=await readResultsSnapshot(tx,organization,workflow);
    if(!result||result.revision!==receipt.revision||result.batchId!==receipt.batch_id||result.subjects.length!==receipt.subjects)
      throw new WorkOrderRefusal('stale_receipt','The receipt does not describe the current engine result');
    const row=(await tx.query(`select id from core_v2_work_orders where organization_id=$1 and workflow_id=$2
      and initiating_surface='ceo-admin' and initiating_user=$3 order by created_at limit 1 for update`,[organization,workflow,owner])).rows[0];
    if(!row)return {state:'WORK_ORDER_NOT_LINKED'};
    const order=await getWorkOrder(tx,organization,row.id);
    if(order.requested_deliverable!==AUDIT_DELIVERABLE||canonical(order.acceptance_criteria)!==canonical(AUDIT_CRITERIA))
      return {state:'CUSTOM_ACCEPTANCE_REQUIRED',work_order_id:order.work_order_id};
    const digest=sha256(canonical({revision:result.revision,projection_sha256:receipt.projection_sha256}));
    if(order.current_state==='COMPLETED')return {state:order.final_outcome?.artifact_digest===digest?'COMPLETED':'PROJECTION_CHANGED',work_order_id:order.work_order_id};
    if(result.state!=='completed')return {state:order.current_state,work_order_id:order.work_order_id};
    const gaps=(await tx.query(`select
      (select count(*) from disagreements where workflow_id=$1 and state not in ('resolved','superseded')) as disputes,
      (select count(*) from agent_attempts where workflow_id=$1 and state='outcome_unknown') as unknown_attempts,
      (select coalesce(sum(reserved),0) from workflow_cost_budgets where workflow_id=$1) as reserved,
      (select count(*) from evidence_claims c where c.workflow_id=$1 and c.status='accepted' and c.observation_basis='observed'
        and not exists(select 1 from evidence_anchors a where a.claim_id=c.id and a.workflow_id=c.workflow_id
          and a.quoted_text is not null and length(a.quoted_text)>0)) as missing_anchors`,[workflow])).rows[0];
    if(Object.values(gaps).some(n=>Number(n)>0)||!result.subjects.some(s=>s.accepted.length))return {state:'UNSETTLED_EVIDENCE',work_order_id:order.work_order_id};
    const completed=await saveWorkOrderCompletion(alreadyInTransaction(tx),organization,order.work_order_id,order.revision,{
      outcomeRequired:AUDIT_DELIVERABLE,artifactExists:true,artifactDigest:digest,decisionBoundDigest:digest,
      readBackSucceeded:true,verifiedBy:'independent_verifier',acceptanceGates:[
        {name:AUDIT_CRITERIA[0],required:true,passed:true,evidence:canonical({workflow_id:workflow,revision:result.revision,checks:gaps})},
        {name:AUDIT_CRITERIA[1],required:true,passed:true,evidence:canonical(receipt)}]});
    return {state:completed.current_state,work_order_id:order.work_order_id,artifact_digest:digest};
  });
}
