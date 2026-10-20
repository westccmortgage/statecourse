import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {withThrowawayDatabase} from '../../core-v2/tests/postgres-harness.mjs';
import {createWorkOrder,getWorkOrder} from '../../core-v2/work-orders/store.ts';
import {prepareRecovery,finishRecovery,measuredFacts} from '../recovery/coordinator.ts';
export async function proveSharedRecovery({client,organizationId,userId}){
  const order=await createWorkOrder(client,organizationId,userId,'markevita',{idempotency_key:'synthetic_shared_recovery_20260929',
    goal:'Verify the existing synthetic master',acceptance_criteria:['Master QA is measured and persisted']});
  const facts={application:'markevita',workflowId:'synthetic/episode',failingStage:'qa',exceptionClass:'none',errorCode:'quality_gate_failed',
    completedStages:['assemble'],artifacts:[{kind:'master',digest:'a'.repeat(64)}],providerCalls:[],
    ledger:{settled:0,held:0,reserved:0,authority:0},probes:{master_exists:true,qa_report_written:false},
    checkpoint:null,checkpointDigest:null,selectedTakes:[],stage:'qa',qaState:'unmeasured',
    paidStages:['generate'],continuationStages:['qa'],policyVersion:'runtime-incident.policy.1',engineVersion:'synthetic.1'};
  assert.throws(()=>measuredFacts({...facts,ledger:{...facts.ledger,reserved:null}}),/missing ledger/);
  const observe=await prepareRecovery(client,organizationId,order.work_order_id,facts);
  assert.equal(observe.dispatch,false);assert.equal(observe.decision.operation.id,'rerun_qa');
  const claim=await prepareRecovery(client,organizationId,order.work_order_id,facts,true);
  assert.equal(claim.dispatch,true);assert.equal(claim.operation,'rerun_qa');
  assert.equal((await getWorkOrder(client,organizationId,order.work_order_id)).current_state,'REPAIRING');
  assert.equal((await prepareRecovery(client,organizationId,order.work_order_id,facts,true)).dispatch,false);
  const after={...facts,probes:{master_exists:true,qa_report_written:true,qa_passed:true},qaState:'passed',stage:'deliver'};
  const lostReply=await prepareRecovery(client,organizationId,order.work_order_id,after,true);
  assert.equal(lostReply.dispatch,false);assert.equal(lostReply.recovery_id,claim.recovery_id);
  assert.equal(Number((await client.query('select count(*) n from runtime_incident_recoveries where incident_id=$1',[claim.incident_id])).rows[0].n),1);
  await assert.rejects(()=>finishRecovery(client,organizationId,claim.recovery_id,'wrong',after),/wrong fence/);
  const verified=await finishRecovery(client,organizationId,claim.recovery_id,claim.fence_token,after);
  assert.equal(verified.recovered,true);assert.equal(verified.verification.providerCallDelta,0);
  assert.equal((await finishRecovery(client,organizationId,claim.recovery_id,claim.fence_token,after)).repeated,true);
  assert.equal(Number((await client.query('select count(*) n from runtime_recovery_knowledge where recovery_id=$1',[claim.recovery_id])).rows[0].n),1);
  const held={...facts,providerCalls:[{provider:'synthetic',requestId:'unknown',state:'outcome_unknown'}],ledger:{settled:0,held:0.4,reserved:0,authority:1}};
  const unknown=await prepareRecovery(client,organizationId,order.work_order_id,held,true);
  assert.equal(unknown.dispatch,false);assert.equal(unknown.state,'unknown_paid_outcome');assert.equal(unknown.human_decision,false);
  const blocked=await getWorkOrder(client,organizationId,order.work_order_id);
  assert.equal(blocked.current_state,'BLOCKED');assert.equal(blocked.incidents.length,2);
  assert.equal(JSON.parse((await client.query('select facts from runtime_incidents where id=$1',[unknown.incident_id])).rows[0].facts).observed.ledger.held,0.4);
  console.log('ALL OK: shared recovery SQL fences, duplicate, restart, fresh verification, memory, unknown-money preservation');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await withThrowawayDatabase(proveSharedRecovery);
