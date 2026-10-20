import type {Queryable} from '../core-v2/postgres/wire.ts';
import type {RoutingObservation} from '../core-v2/kernel/outcomes.ts';
// Bounded, same tenant and exact domain version. Existing append-only records are
// the memory; this query creates no alternate learning database or model.
export async function readRoutingHistory(db:Queryable,organization:string,pack:string,version:string):Promise<RoutingObservation[]>{
  const rows=(await db.query(`select a.id,a.role_key,a.role_version,a.executor_family,a.model_configuration,a.state,
    r.price_basis->>'provider_id' as provider,r.price_basis->>'model' as model,a.error_code,a.provider_duration_ms,
    r.settled_cost,a.attempt_no,
    case when exists(select 1 from evidence_claims c join claim_assessments v on v.claim_id=c.id
      join agent_attempts critic on critic.id=v.attempt_id
      where c.attempt_id=a.id and v.assessment='contradicts' and critic.independence_domain<>a.independence_domain) then 'fail'
    when exists(select 1 from evidence_claims c join claim_assessments v on v.claim_id=c.id
      join agent_attempts critic on critic.id=v.attempt_id
      where c.attempt_id=a.id and c.status='accepted' and v.assessment='supports'
        and critic.state='succeeded' and critic.independence_domain<>a.independence_domain) then 'pass' else null end as quality,
    exists(select 1 from core_v2_task_completions c where c.workflow_id=a.workflow_id and c.state='DELIVERED') as final_accepted
    from agent_attempts a join intelligence_workflows w on w.id=a.workflow_id
    left join attempt_cost_reservations r on r.attempt_id=a.id
    where a.organization_id=$1::uuid and w.domain_pack=$2 and w.domain_pack_version=$3
      and w.state in ('completed','partial','failed','cancelled') and a.executor_kind='model'
      and a.created_at>now()-interval '30 days'
    order by a.created_at desc,a.id desc limit 200`,[organization,pack,version])).rows;
  return rows.map(r=>({attemptId:String(r.id),roleKey:String(r.role_key),roleVersion:String(r.role_version),
    family:String(r.executor_family),configuration:String(r.model_configuration),provider:r.provider as string|null,model:r.model as string|null,
    state:String(r.state),verifiedQuality:r.quality as 'pass'|'fail'|null,failureType:r.error_code as string|null,
    latencyMs:r.provider_duration_ms==null?null:Number(r.provider_duration_ms),actualCost:r.settled_cost==null?null:Number(r.settled_cost),
    repairRequired:Number(r.attempt_no)>1,finalAccepted:r.final_accepted==='t'}));
}
