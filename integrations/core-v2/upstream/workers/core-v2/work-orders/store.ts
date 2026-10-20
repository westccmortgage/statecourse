import type { Queryable, TransactionalClient } from '../postgres/wire.ts';
import { makeWorkOrder, workOrderFingerprint, WorkOrderRefusal, contextMatches, type ContextRequirement, type MemoryReference, type Surface, type WorkOrder } from './contract.ts';
import { canonical,sha256 } from '../kernel/ids.ts';

const object=(value:unknown):Record<string,unknown>=>typeof value==='string'?JSON.parse(value):value as Record<string,unknown>;

export async function createWorkOrder(db:TransactionalClient, organization:string,user:string,surface:Surface,input:Record<string,unknown>) {
  const contract=makeWorkOrder(organization,user,surface,input);
  const fingerprint=workOrderFingerprint(contract);
  return await db.transaction(async(tx)=>{
    const inserted=await tx.query(`insert into public.core_v2_work_orders(id,organization_id,initiating_surface,initiating_user,
      idempotency_key,input_sha256,contract,workflow_id) values($1::uuid,$2::uuid,$3,$4,$5,$6,$7::jsonb,$8::uuid)
      on conflict(id) do nothing returning id`,[contract.work_order_id,organization,surface,user,
      String(input.idempotency_key),fingerprint,JSON.stringify(contract),contract.workflow_id]);
    const saved=(await tx.query('select input_sha256 from public.core_v2_work_orders where id=$1::uuid',[contract.work_order_id])).rows[0];
    if(saved?.input_sha256!==fingerprint)throw new WorkOrderRefusal('idempotency_conflict','This key belongs to different intent or source versions');
    if(inserted.rows.length)await tx.query(`insert into public.core_v2_work_order_events(work_order_id,revision,kind,detail)
      values($1::uuid,1,'requested',$2::jsonb)`,[contract.work_order_id,JSON.stringify({protocol:contract.protocol,source:contract.source,
      requested_deliverable:contract.requested_deliverable,authority:'PROPOSE',provider_calls:0})]);
    const order=await getWorkOrder(tx,organization,contract.work_order_id);
    return {...order,repeated:inserted.rows.length===0};
  });
}

export async function getWorkOrder(db:Queryable, organization:string,id:unknown) {
  if(typeof id!=='string'||!/^[0-9a-f-]{36}$/i.test(id))throw new WorkOrderRefusal('invalid_work_order','Invalid work order id');
  const row=(await db.query(`select o.*,w.state as workflow_state,
      exists(select 1 from public.disagreements d where d.workflow_id=o.workflow_id and d.state='needs_human'
        and coalesce(d.subject_signature->>'reason','')<>'independence_unavailable') as human_decision_owed,
      c.state as completion_state,c.artifact_digest,c.acceptance_gates,c.because,
      (select i.state from public.runtime_incidents i where i.organization_id=o.organization_id
        and i.facts->>'work_order_id'=o.id::text order by i.created_at desc,i.id desc limit 1) as recovery_state,
      (select coalesce(jsonb_agg(h.item order by h.created_at),'[]') from (
        select i.created_at,jsonb_build_object('incident_id',i.id,'state',i.state,'rule',i.rule_id,
          'cause',i.cause,'exit_reason',i.exit_reason,'evidence_fingerprint',i.evidence_fingerprint,
          'recoveries',(select coalesce(jsonb_agg(jsonb_build_object('recovery_id',r.id,'operation',r.operation_id,
            'authority',r.authority,'state',r.state,'verified',r.recovered,'after_fingerprint',r.after_fingerprint)
            order by r.created_at),'[]') from public.runtime_incident_recoveries r where r.incident_id=i.id)) as item
        from public.runtime_incidents i where i.organization_id=o.organization_id and i.facts->>'work_order_id'=o.id::text
        order by i.created_at desc,i.id desc limit 20) h) as incidents,
      (select jsonb_build_object('currency',b.currency,'authorized',b.authorized_maximum,'reserved',b.reserved,
        'settled',b.settled,'ledger_reference',b.workflow_id) from public.workflow_cost_budgets b
        where b.workflow_id=o.workflow_id) as execution_budget,
      (select coalesce(jsonb_agg(jsonb_build_object('revision',e.revision,'kind',e.kind,'detail',e.detail,'at',e.created_at)
        order by e.revision),'[]') from public.core_v2_work_order_events e where e.work_order_id=o.id) as events
    from public.core_v2_work_orders o left join public.intelligence_workflows w on w.id=o.workflow_id
      left join public.core_v2_task_completions c on c.id=o.completion_id
    where o.id=$1::uuid and o.organization_id=$2::uuid`,[id,organization])).rows[0];
  if(!row)throw new WorkOrderRefusal('work_order_not_found','No work order in this organization');
  const contract=object(row.contract) as unknown as WorkOrder;
  const contextEvidence=object(row.context_evidence) as unknown as Record<string,unknown>[];
  const contextRequirements=(contract.context_requirements as ContextRequirement[]).map((required)=>({...required,
    status:contextEvidence.some((e)=>contextMatches(required,e.reference as MemoryReference))?'available':'required'}));
  const completed=row.completion_state==='DELIVERED';
  const state=completed?'COMPLETED':row.completion_state==='FAILED_VERIFIED'?'BLOCKED':row.completion_state==='AWAITING_AUTHORITY'?'HUMAN DECISION REQUIRED'
    :row.completion_state==='BLOCKED_EXTERNAL'?'BLOCKED':row.workflow_state==='partial'?'PARTIAL'
    :row.completion_state==='REPAIRING'?'REPAIRING'
    :['recovering','verifying','recovery_authorized'].includes(String(row.recovery_state))?'REPAIRING'
    :row.recovery_state==='awaiting_human'?'HUMAN DECISION REQUIRED'
    :['blocked','unknown_paid_outcome','engineering_defect','unrecoverable'].includes(String(row.recovery_state))?'BLOCKED'
    :row.workflow_state==='needs_person'?(row.human_decision_owed==='t'?'HUMAN DECISION REQUIRED':'BLOCKED')
    :['failed','cancelled'].includes(String(row.workflow_state))?'BLOCKED'
    :row.workflow_state==='completed'||row.recovery_state==='recovered'?'VERIFYING':row.workflow_id?'RUNNING'
    :contextRequirements.some((r)=>r.status==='required')?'CONTEXT_INSUFFICIENT':'REQUESTED';
  return {...contract,work_order_id:String(row.id),context_requirements:contextRequirements,context_evidence:contextEvidence,
    revision:Number(row.revision),workflow_id:row.workflow_id,current_state:state,
    // Workflow traversal alone does not prove delivery of the requested product.
    final_outcome:completed?{completion_id:row.completion_id,artifact_digest:row.artifact_digest,
      acceptance_gates:object(row.acceptance_gates),because:row.because}:null,
    execution_state:row.workflow_state??null,events:object(row.events),
    execution_budget:row.execution_budget?object(row.execution_budget):null,
    incidents:object(row.incidents),
    next_requirement:completed?null:!row.workflow_id?'Prepare approved domain context and use the existing domain submission/authority path'
      :!row.completion_id?'Independently verify and bind final delivery to this work order':row.because,
    created_at:row.created_at,updated_at:row.updated_at};
}

export async function recordContext(db:TransactionalClient,organization:string,id:unknown,expected:unknown,observations:unknown) {
  if(typeof id!=='string'||!Number.isInteger(expected)||!Array.isArray(observations)||observations.length>50)
    throw new WorkOrderRefusal('invalid_context','Bounded context observations and an exact revision are required');
  return db.transaction(async(tx)=>{
    await tx.query('select id from public.core_v2_work_orders where id=$1::uuid and organization_id=$2::uuid for update',[id,organization]);
    const order=await getWorkOrder(tx,organization,id);
    const requirements=order.context_requirements as ContextRequirement[];
    const evidence=observations.map((value)=>{
      const observation=value as {reference:MemoryReference;material:unknown};
      if(!requirements.some((r)=>contextMatches(r,observation?.reference)))
        throw new WorkOrderRefusal('context_scope_refused','Only specifically requested context may be attached');
      const material=canonical(observation.material);
      if(material.length>100000)throw new WorkOrderRefusal('context_too_large','Split the requested context into bounded references');
      return {reference:observation.reference,material:observation.material,sha256:sha256(material),
        // Source content remains untrusted, including instructions inside an email.
        authority:'source_material',semantic_verification:'pending'};
    });
    const merged=[...(order.context_evidence as Record<string,unknown>[])];
    for(const entry of evidence){
      const index=merged.findIndex((e)=>canonical(e.reference)===canonical(entry.reference));
      if(index<0)merged.push(entry);else merged[index]=entry;
    }
    if(canonical(merged)===canonical(order.context_evidence))return {...order,repeated:true};
    if(order.revision!==Number(expected))throw new WorkOrderRefusal('stale_work_order','Context was collected against an older revision');
    await tx.query('update public.core_v2_work_orders set context_evidence=$2::jsonb,revision=revision+1,updated_at=now() where id=$1::uuid',[id,JSON.stringify(merged)]);
    await tx.query(`insert into public.core_v2_work_order_events(work_order_id,revision,kind,detail)
      values($1::uuid,$2,'context_observed',$3::jsonb)`,[id,Number(expected)+1,JSON.stringify(evidence.map((e)=>({reference:e.reference,sha256:e.sha256})))]);
    return {...await getWorkOrder(tx,organization,id),repeated:false};
  });
}

export async function listWorkOrders(db:Queryable,organization:string,user:string,surface?:Surface) {
  const rows=(await db.query(`select id from public.core_v2_work_orders where organization_id=$1::uuid
    and initiating_user=$2 and ($3::text is null or initiating_surface=$3) order by created_at desc limit 20`,[organization,user,surface??null])).rows;
  const orders=[];
  for(const row of rows)orders.push(await getWorkOrder(db,organization,row.id));
  return {work_orders:orders};
}

// Called inside the EXISTING submission transaction. A work order never
// creates a competing runner or bypasses that submission's authority check.
export async function attachWorkflow(db:Queryable,organization:string,id:unknown,workflow:string,expected:unknown) {
  if(id==null)return;
  if(typeof id!=='string'||!Number.isInteger(expected)||Number(expected)<1)
    throw new WorkOrderRefusal('stale_work_order','An exact work order revision is required');
  const row=(await db.query('select revision,workflow_id from public.core_v2_work_orders where id=$1::uuid and organization_id=$2::uuid for update',[id,organization])).rows[0];
  if(!row)throw new WorkOrderRefusal('work_order_not_found','No work order in this organization');
  if(row.workflow_id===workflow)return;
  if(row.workflow_id||Number(row.revision)!==Number(expected))throw new WorkOrderRefusal('stale_work_order','The work order changed or already names another workflow');
  await db.query('update public.core_v2_work_orders set workflow_id=$2::uuid,revision=revision+1,updated_at=now() where id=$1::uuid',[id,workflow]);
  await db.query(`insert into public.core_v2_work_order_events(work_order_id,revision,kind,detail)
    values($1::uuid,$2,'workflow_attached',$3::jsonb)`,[id,Number(expected)+1,JSON.stringify({workflow_id:workflow,authority:'existing_submission_record'})]);
}
