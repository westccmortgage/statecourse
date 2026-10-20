// Called by trusted domain adapters AFTER their independent readback. This is
// deliberately not a public API accepting a model's boolean claim of success.
import { completionOf,type CompletionEvidence } from '../kernel/completion.ts';
import type { TransactionalClient } from '../postgres/wire.ts';
import { getWorkOrder } from './store.ts';
import { WorkOrderRefusal } from './contract.ts';

export async function saveWorkOrderCompletion(db:TransactionalClient,organization:string,id:string,expected:number,evidence:CompletionEvidence) {
  return db.transaction(async(tx)=>{
    await tx.query('select id from public.core_v2_work_orders where id=$1::uuid and organization_id=$2::uuid for update',[id,organization]);
    const order=await getWorkOrder(tx,organization,id);
    if(order.revision!==expected)throw new WorkOrderRefusal('stale_work_order','Completion was verified against an older work order');
    if(evidence.outcomeRequired!==order.requested_deliverable)throw new WorkOrderRefusal('wrong_outcome','Evidence concerns a different deliverable');
    for(const criterion of order.acceptance_criteria as string[]){
      if(!evidence.acceptanceGates.some((g)=>g.name===criterion&&g.required===true))
        throw new WorkOrderRefusal('missing_acceptance_gate','Every original acceptance criterion needs its own gate');
    }
    const completion=completionOf(evidence);
    const previous=(await tx.query(`select state from public.core_v2_task_completions where organization_id=$1::uuid
      and application='work-order' and task_key=$2`,[organization,id])).rows[0];
    const stored=(await tx.query(`select id from public.core_v2_record_completion($1::uuid,'work-order',$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::text[],$12,
      'runtime-incident.policy.1','core-v2.work-order.1',$13::uuid,$14)`,[organization,id,completion.state,evidence.outcomeRequired,
      evidence.artifactExists,evidence.artifactDigest,evidence.decisionBoundDigest,evidence.readBackSucceeded,evidence.verifiedBy,
      JSON.stringify(evidence.acceptanceGates),`{${completion.unmet.map((s)=>'"'+s.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"').join(',')}}`,
      completion.because,order.workflow_id as string|null,previous?.state??null])).rows[0];
    await tx.query('update public.core_v2_work_orders set completion_id=$2::uuid,revision=revision+1,updated_at=now() where id=$1::uuid',[id,stored.id]);
    await tx.query(`insert into public.core_v2_work_order_events(work_order_id,revision,kind,detail)
      values($1::uuid,$2,'completion_verified',$3::jsonb)`,[id,expected+1,JSON.stringify({completion_id:stored.id,state:completion.state,
      artifact_digest:evidence.artifactDigest,unmet:completion.unmet})]);
    return getWorkOrder(tx,organization,id);
  });
}
