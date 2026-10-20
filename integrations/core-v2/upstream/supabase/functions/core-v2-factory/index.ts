// Server-to-server factory adapter. Dormant without its OWN secret and fixed
// tenant mapping. No provider credentials, spending, publishing or human approval.
import '../_shared/core-v2/install-node-globals.ts';
import {EdgeDatabase} from '../_shared/core-v2/deno-postgres.ts';
import {routeToRecord,isRouteProblem} from '../_shared/core-v2/route.ts';
import {workOrderOperation,WORK_ORDER_OPERATIONS} from '../_shared/core-v2/work-orders.ts';
import {verify} from '../../../workers/core-v2-runner/ceo-admin/signature.ts';
import {isUuid} from '../../../workers/core-v2/kernel/ids.ts';
import {WorkOrderRefusal} from '../../../workers/core-v2/work-orders/contract.ts';
import {getWorkOrder,createWorkOrder,listWorkOrders} from '../../../workers/core-v2/work-orders/store.ts';
import {prepareRecovery,finishRecovery,MASTER_CRITERIA,MASTER_DELIVERABLE} from '../../../workers/core-v2-runner/recovery/coordinator.ts';
import {evaluateConfiguration, type Facts} from '../../../workers/core-v2/domains/studio-configuration/pack.ts';
const json=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
Deno.serve(async request=>{
  if(request.method!=='POST')return json(405,{refused:'post_required'});
  const raw=await request.text();if(raw.length>150000)return json(413,{refused:'bounded_request_required'});
  if(verify(Deno.env.get('CORE_V2_FACTORY_DOOR_SECRET'),request.headers.get('x-core-factory-timestamp'),
    request.headers.get('x-core-factory-signature'),raw,Math.floor(Date.now()/1000)))return json(401,{refused:'factory_signature_required'});
  const organization=Deno.env.get('CORE_V2_FACTORY_ORGANIZATION'),user=Deno.env.get('CORE_V2_FACTORY_SUBMITTER');
  if(!isUuid(organization)||!isUuid(user))return json(503,{refused:'factory_tenant_not_configured'});
  let body:Record<string,unknown>;
  try{body=JSON.parse(raw);}catch{return json(400,{refused:'invalid_json'});}
  if(!body||Array.isArray(body)||typeof body!=='object')return json(400,{refused:'invalid_request'});
  // Tenant, surface and submitter are never selected by caller-supplied JSON.
  const route=routeToRecord('CORE_V2_RUNNER',name=>Deno.env.get(name));
  if(isRouteProblem(route))return json(503,{refused:'record_not_configured'});
  let db:EdgeDatabase|null=null;
  try{
    db=await EdgeDatabase.connect(route.url,'core-v2-factory');
    if(!(await db.query('select 1 from organization_members where organization_id=$1 and user_id=$2',[organization,user])).rows.length)
      return json(403,{refused:'factory_membership_required'});
    const op=String(body.op);
    if(op==='create_existing_master_order')return json(201,await createWorkOrder(db,organization,user,'markevita',{
      idempotency_key:body.idempotency_key,source:body.source,
      goal:'Verify or repair the existing episode master without generating new media',
      requested_deliverable:MASTER_DELIVERABLE,acceptance_criteria:MASTER_CRITERIA}));
    if(body.work_order_id){
      const order=await getWorkOrder(db,organization,body.work_order_id);
      if(order.initiating_surface!=='markevita')return json(403,{refused:'factory_surface_required'});
    }
    if(op==='plan_studio_configuration')return json(200,await evaluateConfiguration(body.facts as Facts));
    if(op==='list_work_orders')return json(200,await listWorkOrders(db,organization,user,'markevita'));
    if(['observe_incident','prepare_recovery','verify_recovery'].includes(op)
      &&(body.facts as Record<string,unknown>|null)?.application!=='markevita')return json(403,{refused:'factory_surface_required'});
    if(WORK_ORDER_OPERATIONS.includes(op)){
      const result=await workOrderOperation(db,organization,user,'markevita',body);return json(result.status,result.body);
    }
    if(op==='observe_incident'||op==='prepare_recovery')return json(200,await prepareRecovery(db,organization,
      String(body.work_order_id),body.facts,op==='prepare_recovery'));
    if(op==='verify_recovery')return json(200,await finishRecovery(db,organization,
      String(body.recovery_id),String(body.fence_token),body.facts));
    return json(400,{refused:'unknown_operation'});
  }catch(error){
    if(error instanceof WorkOrderRefusal)return json(409,{refused:error.code,detail:error.message});
    return json(503,{refused:'record_operation_failed',detail:'The durable operation did not return a verified outcome; reopen the existing work order before retrying.'});
  }finally{if(db)await db.end();}
});
