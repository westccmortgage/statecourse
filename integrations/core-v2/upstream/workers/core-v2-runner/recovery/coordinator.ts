// Persist and fence the existing Runtime Governor's decisions. The factory
// supplies measured facts and implements local operations; it supplies no rules.
import type {TransactionalClient,Queryable} from '../../core-v2/postgres/wire.ts';
import {entityId,canonical} from '../../core-v2/kernel/ids.ts';
import {getWorkOrder} from '../../core-v2/work-orders/store.ts';
import {WorkOrderRefusal} from '../../core-v2/work-orders/contract.ts';
import {diagnose,flagsOf} from '../../core-v2/domains/runtime-incident/policy.ts';
import {incidentSignature,evidenceFingerprint,boundaryOf,OPERATIONS,type IncidentFacts} from '../../core-v2/domains/runtime-incident/records.ts';
import {verifyRecovery} from '../../core-v2/domains/runtime-incident/verifiers.ts';
import {saveWorkOrderCompletion} from '../../core-v2/work-orders/completion.ts';
import {alreadyInTransaction} from '../start.ts';

export const MASTER_DELIVERABLE='A technically verified existing master; creative acceptance is separate';
export const MASTER_CRITERIA=['Master exists, decodes and matches duration and dimensions',
  'Current master passes independently repeated QA','Existing selected assets and provider ledger are unchanged'];

const refuse=(code:string,message:string):never=>{throw new WorkOrderRefusal(code,message);};
const LOCAL=new Set(['rerun_assembly','rerun_qa','rebuild_master_from_paid_assets']);
const parse=(value:unknown)=>typeof value==='string'?JSON.parse(value):value;
const array=(items:string[])=>`{${items.map(s=>'"'+s.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"').join(',')}}`;
const spend=(f:IncidentFacts)=>f.ledger.settled+f.ledger.held+f.ledger.reserved;
export function measuredFacts(value:unknown):IncidentFacts {
  if(!value||typeof value!=='object'||Array.isArray(value)||canonical(value).length>100000)return refuse('invalid_facts','Bounded measured facts required');
  const f=value as IncidentFacts;
  for(const key of ['application','workflowId','failingStage','exceptionClass','errorCode','stage','qaState','policyVersion','engineVersion'] as const)
    if(typeof f[key]!=='string'||!f[key]||f[key].length>500)return refuse('invalid_facts',`Missing ${key}`);
  if(f.policyVersion!=='runtime-incident.policy.1')return refuse('policy_version','Unknown runtime policy');
  for(const key of ['completedStages','paidStages','continuationStages'] as const)
    if(!Array.isArray(f[key])||f[key].length>100||f[key].some(s=>typeof s!=='string'||s.length>100))return refuse('invalid_facts',`Invalid ${key}`);
  if(!f.ledger||Object.values(f.ledger).some(n=>typeof n!=='number'||!Number.isFinite(n)||n<0)
    ||['settled','held','reserved','authority'].some(k=>typeof (f.ledger as unknown as Record<string,unknown>)[k]!=='number'))
    return refuse('unknown_price','A missing ledger amount cannot be treated as zero');
  if(!f.probes||typeof f.probes!=='object'||Object.values(f.probes).some(v=>!['string','number','boolean'].includes(typeof v)))return refuse('invalid_facts','Invalid probes');
  for(const key of ['artifacts','providerCalls','selectedTakes'] as const)if(!Array.isArray(f[key])||f[key].length>500)return refuse('invalid_facts',`Invalid ${key}`);
  if(f.artifacts.some(a=>typeof a.kind!=='string'||!/^[a-f0-9]{64}$/.test(a.digest))
    ||f.selectedTakes.some(a=>typeof a.subject!=='string'||typeof a.takeId!=='string'||!/^[a-f0-9]{64}$/.test(a.digest))
    ||f.providerCalls.some(c=>typeof c.provider!=='string'||typeof c.requestId!=='string'||!['succeeded','failed','outcome_unknown'].includes(c.state)))
    return refuse('invalid_facts','Invalid artifact or call identity');
  if(f.checkpoint!==null&&typeof f.checkpoint!=='string'||f.checkpointDigest!==null&&!/^[a-f0-9]{64}$/.test(f.checkpointDigest))return refuse('invalid_facts','Invalid checkpoint');
  return f;
}
const transition=(tx:Queryable,id:string,from:string,to:string,reason:string|null=null,rule:string|null=null,cause:string|null=null)=>tx.query(
  'select id from public.core_v2_incident_transition($1,$2,$3,$4,$5,$6)',[id,to,from,reason,rule,cause]);

export async function prepareRecovery(db:TransactionalClient,organization:string,orderId:string,value:unknown,execute=false){
  const facts=measuredFacts(value),signature=await incidentSignature(facts),fingerprint=await evidenceFingerprint(facts);
  const id=entityId('work-order-incident',organization,orderId,fingerprint),decision=diagnose(facts,signature);
  return db.transaction(async tx=>{
    // Serialize all recovery claims for this order, including changed facts
    // after an executor completed but its acknowledgement was lost.
    await tx.query('select id from core_v2_work_orders where id=$1::uuid and organization_id=$2::uuid for update',[orderId,organization]);
    const order=await getWorkOrder(tx,organization,orderId);
    if(order.initiating_surface!==facts.application)return refuse('wrong_surface','The incident belongs to another surface');
    if(order.current_state==='COMPLETED')return refuse('terminal_work_order','A delivered order cannot start another recovery');
    const pending=(await tx.query(`select r.id,r.fence_token,r.before_fingerprint,i.id as incident_id,i.facts
      from runtime_incident_recoveries r join runtime_incidents i on i.id=r.incident_id
      where i.organization_id=$1 and i.facts->>'work_order_id'=$2 and r.state in ('claimed','executed')
      order by r.created_at limit 1`,[organization,orderId])).rows[0];
    if(pending){
      const prior=parse(pending.facts).observed;
      if(prior.application!==facts.application||prior.workflowId!==facts.workflowId)
        return refuse('changed_runtime','An unsettled recovery belongs to another runtime');
      return {incident_id:pending.incident_id,work_order_id:orderId,state:'recovering',repeated:true,
        dispatch:false,recovery_id:pending.id,fence_token:pending.fence_token,before_fingerprint:pending.before_fingerprint};
    }
    await tx.query(`insert into runtime_incidents(id,organization_id,workflow_id,application,incident_signature,evidence_fingerprint,
      failing_stage,exception_class,error_code,facts,policy_version,engine_version)
      values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12) on conflict(id) do nothing`,
      [id,organization,order.workflow_id,facts.application,signature,fingerprint,facts.failingStage,facts.exceptionClass,facts.errorCode,
        JSON.stringify({work_order_id:orderId,observed:facts}),facts.policyVersion,facts.engineVersion]);
    let incident=(await tx.query('select * from runtime_incidents where id=$1 for update',[id])).rows[0];
    if(incident.state==='detected'){
      await transition(tx,id,'detected','evidence_collected');
      await transition(tx,id,'evidence_collected','diagnosed',null,decision.ruleId,decision.cause);
      incident={...incident,state:'diagnosed'};
    }
    const response={incident_id:id,work_order_id:orderId,decision,before_fingerprint:fingerprint};
    if(incident.state!=='diagnosed'){
      const held=incident.state==='recovering'?(await tx.query(`select id,fence_token from runtime_incident_recoveries
        where incident_id=$1 and state in ('claimed','executed') order by created_at desc limit 1`,[id])).rows[0]:null;
      // A lost preparation reply allows readback/settlement only, never a
      // second execution of the operation whose outcome is now uncertain.
      return {...response,state:incident.state,repeated:true,dispatch:false,recovery_id:held?.id,fence_token:held?.fence_token};
    }
    if(decision.exit){
      await transition(tx,id,'diagnosed',decision.exit,decision.because);
      return {...response,state:decision.exit,dispatch:false,human_decision:decision.exit==='awaiting_human'};
    }
    if(!decision.operation||decision.authority!=='automatic'||!LOCAL.has(decision.operation.id)){
      // Unclassified technical incidents first need engineering/recovery, not
      // an owner asked to diagnose parsers or missing independence coverage.
      await transition(tx,id,'diagnosed','blocked',decision.because);
      return {...response,state:'blocked',dispatch:false,human_decision:false};
    }
    if(!execute)return {...response,state:'diagnosed',dispatch:false,human_decision:false};
    const count=(await tx.query(`select count(*) n from runtime_incident_recoveries r join runtime_incidents i on i.id=r.incident_id
      where i.organization_id=$1 and i.facts->>'work_order_id'=$2`,[organization,orderId])).rows[0];
    if(Number(count.n)>=3){await transition(tx,id,'diagnosed','blocked','Three local recovery attempts exhausted');return {...response,state:'blocked',dispatch:false};}
    const op=decision.operation;
    await transition(tx,id,'diagnosed','recovery_proposed');await transition(tx,id,'recovery_proposed','recovery_authorized');
    const recovery=(await tx.query(`select id,fence_token from core_v2_claim_recovery($1,$2,$3,'automatic','no_external_spend',
      $4::text[],$5::text[],$6,$7,$8,'shared-factory-adapter',600000,null)`,
      [id,organization,op.id,array([...flagsOf(facts)]),array(boundaryOf(op,facts)),fingerprint,facts.providerCalls.length,spend(facts)])).rows[0];
    await transition(tx,id,'recovery_authorized','recovering');
    return {...response,state:'recovering',dispatch:true,recovery_id:recovery.id,fence_token:recovery.fence_token,
      operation:op.id,execution_boundary:boundaryOf(op,facts)};
  });
}

export async function finishRecovery(db:TransactionalClient,organization:string,recoveryId:string,fence:string,value:unknown){
  const after=measuredFacts(value),afterFingerprint=await evidenceFingerprint(after);
  return db.transaction(async tx=>{
    const row=(await tx.query(`select r.*,i.facts,i.incident_signature,i.policy_version,i.engine_version,i.state as incident_state
      from runtime_incident_recoveries r join runtime_incidents i on i.id=r.incident_id
      where r.id=$1 and r.organization_id=$2 for update of r,i`,[recoveryId,organization])).rows[0];
    if(!row||row.fence_token!==fence)return refuse('recovery_fence','Unknown recovery or wrong fence');
    if(['verified','failed'].includes(String(row.state))){
      if(row.after_fingerprint!==afterFingerprint)return refuse('different_receipt','This recovery has a different settled receipt');
      return {state:row.state,recovered:row.recovered==='t',repeated:true};
    }
    const before=measuredFacts(parse(row.facts).observed),op=OPERATIONS[String(row.operation_id)];
    if(after.application!==before.application||after.workflowId!==before.workflowId||after.engineVersion!==before.engineVersion
      ||after.policyVersion!==before.policyVersion)return refuse('changed_runtime','The evidence belongs to another runtime');
    const verification=verifyRecovery(op,{before,after,beforeFingerprint:String(row.before_fingerprint),afterFingerprint});
    if(verification.providerCallDelta!==0||verification.incrementalSpend!==0)return refuse('recovery_spent','No-spend boundary violated; preserve the evidence for engineering review');
    await transition(tx,String(row.incident_id),'recovering','verifying');
    for(const check of verification.results)await tx.query(`insert into runtime_incident_verifications(organization_id,recovery_id,verifier_name,passed,detail,evidence)
      values($1,$2,$3,$4,$5,$6::jsonb)`,[organization,recoveryId,check.name,check.pass,check.detail,JSON.stringify(check.evidence)]);
    await tx.query('select id from core_v2_settle_recovery($1,$2,$3,$4,$5,$6,$7,$8)',
      [recoveryId,fence,op.id,afterFingerprint,0,0,verification.recovered,verification.because]);
    await transition(tx,String(row.incident_id),'verifying',verification.recovered?'recovered':'blocked',verification.because);
    if(verification.recovered)await tx.query('select id from core_v2_record_recovery_knowledge($1,$2,$3,$4)',
      [recoveryId,row.incident_signature,row.policy_version,row.engine_version]);
    const orderId=parse(row.facts).work_order_id;
    const order=await getWorkOrder(tx,organization,orderId);
    let completion=null;
    if(verification.recovered&&op.id==='rerun_qa'&&order.requested_deliverable===MASTER_DELIVERABLE
      &&canonical(order.acceptance_criteria)===canonical(MASTER_CRITERIA)){
      const digest=after.artifacts.find(a=>a.kind==='master')?.digest??null;
      const probes=['master_exists','master_decodes','duration_expected','dimensions_expected','qa_passed','artifact_digest_matches'];
      const unchanged=canonical(before.selectedTakes)===canonical(after.selectedTakes);
      if(digest&&probes.every(p=>after.probes[p]===true)&&unchanged){
        completion=await saveWorkOrderCompletion(alreadyInTransaction(tx),organization,orderId,order.revision,{
          outcomeRequired:MASTER_DELIVERABLE,artifactExists:true,artifactDigest:digest,decisionBoundDigest:digest,
          readBackSucceeded:true,verifiedBy:'independent_verifier',acceptanceGates:MASTER_CRITERIA.map(name=>({
            name,required:true,passed:true,evidence:canonical({recovery_id:recoveryId,after_fingerprint:afterFingerprint,
              master_sha256:digest,probes:after.probes,selected_assets_unchanged:unchanged,provider_call_delta:0,incremental_spend:0})}))});
      }
    }
    return {state:verification.recovered?'recovered':'blocked',recovered:verification.recovered,verification,
      work_order_state:completion?.current_state??order.current_state};
  });
}
