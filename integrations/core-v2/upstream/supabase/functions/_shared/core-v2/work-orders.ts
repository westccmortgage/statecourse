import type { EdgeDatabase } from './deno-postgres.ts';
import { createWorkOrder,getWorkOrder,listWorkOrders,recordContext } from '../../../../workers/core-v2/work-orders/store.ts';
import { WorkOrderRefusal,type Surface } from '../../../../workers/core-v2/work-orders/contract.ts';

export async function workOrderOperation(db:EdgeDatabase,organization:string,user:string,surface:Surface,
  body:Record<string,unknown>):Promise<{status:number;body:Record<string,unknown>}> {
  try {
    const input=body.input&&typeof body.input==='object'&&!Array.isArray(body.input)?body.input as Record<string,unknown>:{};
    if(body.op==='create_work_order')return {status:201,body:await createWorkOrder(db,organization,user,surface,input)};
    if(body.op==='list_work_orders')return {status:200,body:await listWorkOrders(db,organization,user)};
    if(body.op==='record_work_order_context')return {status:200,body:await recordContext(db,organization,body.work_order_id,body.expected_revision,body.observations)};
    return {status:200,body:await getWorkOrder(db,organization,body.work_order_id)};
  } catch(error) {
    if(error instanceof WorkOrderRefusal)return {status:error.code==='work_order_not_found'?404:409,body:{refused:error.code,detail:error.message}};
    throw error;
  }
}
export const WORK_ORDER_OPERATIONS=['create_work_order','get_work_order','get_work_order_status','get_work_order_result','list_work_orders','record_work_order_context'];
