/* An envelope over the existing workflow, incident and completion records.
 * It is not a scheduler and never calls a provider or grants spending authority. */
import { canonical, entityId, sha256 } from '../kernel/ids.ts';

export const WORK_ORDER_PROTOCOL = 'core-v2.work-order.1';
export const SURFACES = ['measured-decision', 'ceo-admin', 'markevita'] as const;
export type Surface = typeof SURFACES[number];
export const AUTHORITY = ['OBSERVE','PROPOSE','EXECUTE_REVERSIBLE','EXECUTE_CONSEQUENTIAL_REQUIRES_APPROVAL','FORBIDDEN'] as const;
export type Authority = typeof AUTHORITY[number];
export type MemoryReference = { system: Surface; type: string; identifier: string; revision: string | null };
export type ContextRequirement = MemoryReference & { reason: string; scope: string; status: 'required' | 'available' };
export type PlannedAction = { id: string; capability: string; executor: string; authority: Authority;
  source: MemoryReference; parameters: Record<string,unknown>; dependencies: string[]; verification: string[] };
export type WorkOrder = {
  protocol: typeof WORK_ORDER_PROTOCOL; work_order_id: string; organization: string;
  project: MemoryReference | null; initiating_surface: Surface; initiating_user: string;
  source: MemoryReference; goal: string; requested_deliverable: string;
  context_requirements: ContextRequirement[]; acceptance_criteria: string[];
  authority: { ceiling: 'PROPOSE'; record: string | null };
  budget: { currency: 'USD'; authorized: 0; ledger_reference: string | null };
  dependencies: MemoryReference[]; planned_actions: PlannedAction[];
  verification_rules: string[]; recovery_policy: { policy: string; no_blind_retry: true; preserve_unknown_outcomes: true };
  workflow_id: string | null; current_state: string; final_outcome: null;
};
export class WorkOrderRefusal extends Error {
  code: string;
  constructor(code: string, message: string) { super(message); this.code=code; }
}
const refuse=(message:string):never=>{throw new WorkOrderRefusal('invalid_work_order',message);};
const text=(v:unknown,max:number,label:string):string=> typeof v==='string'&&v.trim().length&&v.length<=max ? v.trim() : refuse(`Invalid ${label}`);
const uuid=(v:unknown):string=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v)?v:refuse('Invalid identity');
function reference(value:unknown):MemoryReference {
  if(!value||typeof value!=='object'||Array.isArray(value))return refuse('Invalid source reference');
  const r=value as Record<string,unknown>;
  if(!SURFACES.includes(r.system as Surface))return refuse('Unknown source system');
  return {system:r.system as Surface,type:text(r.type,80,'reference type'),identifier:text(r.identifier,500,'reference identifier'),
    revision:r.revision==null?null:text(r.revision,128,'source revision')};
}
export function makeWorkOrder(organization:string, user:string, surface:Surface, input:Record<string,unknown>):WorkOrder {
  uuid(organization);text(user,200,'initiator');
  if(!SURFACES.includes(surface))return refuse('Unknown initiating surface');
  const key=text(input.idempotency_key,128,'idempotency key');
  if(!/^[A-Za-z0-9_-]{16,128}$/.test(key))return refuse('Idempotency key must be 16–128 safe characters');
  const goal=text(input.goal,20000,'goal');
  const criteria=input.acceptance_criteria;
  if(!Array.isArray(criteria)||criteria.length<1||criteria.length>30)return refuse('Supply 1–30 checkable acceptance criteria');
  const refs=input.context_requirements??[];
  if(!Array.isArray(refs)||refs.length>50)return refuse('Too many context requirements');
  const requirements=refs.map((v)=>{
    const r=v as Record<string,unknown>;
    return {...reference(r),reason:text(r.reason,500,'context reason'),scope:text(r.scope,500,'context scope'),status:'required' as const};
  });
  return {protocol:WORK_ORDER_PROTOCOL,work_order_id:entityId('work-order',organization,surface,user,key),organization,
    project:input.project==null?null:reference(input.project),initiating_surface:surface,initiating_user:user,
    source:input.source?reference(input.source):{system:surface,type:'owner_intent',identifier:key,revision:null},
    goal,requested_deliverable:text(input.requested_deliverable??goal,20000,'deliverable'),
    context_requirements:requirements,acceptance_criteria:criteria.map((c)=>text(c,1000,'acceptance criterion')),
    authority:{ceiling:'PROPOSE',record:null},budget:{currency:'USD',authorized:0,ledger_reference:null},
    dependencies:[],planned_actions:[],verification_rules:['independent_readback','current_source_revision','all_required_gates'],
    recovery_policy:{policy:'runtime-incident.policy.1',no_blind_retry:true,preserve_unknown_outcomes:true},
    workflow_id:input.workflow_id==null?null:uuid(input.workflow_id),
    current_state:requirements.length?'CONTEXT_INSUFFICIENT':'REQUESTED',final_outcome:null};
}
export const workOrderFingerprint=(order:WorkOrder):string=>sha256(canonical(order));

// Classify by effects. Product names and model confidence confer no authority.
export function authorityForEffects(effects:{observes?:boolean;proposes?:boolean;reversible?:boolean;external?:boolean;
  destructive?:boolean;paid?:boolean;publishes?:boolean;forbidden?:boolean}):Authority {
  if(effects.forbidden)return 'FORBIDDEN';
  if(effects.external||effects.destructive||effects.paid||effects.publishes)return 'EXECUTE_CONSEQUENTIAL_REQUIRES_APPROVAL';
  if(effects.reversible)return 'EXECUTE_REVERSIBLE';
  if(effects.proposes)return 'PROPOSE';
  return effects.observes?'OBSERVE':'FORBIDDEN';
}

// Expanding scope is a new request, never implicit permission to read a mailbox/library.
export function contextMatches(required:ContextRequirement, supplied:MemoryReference):boolean {
  return required.system===supplied.system&&required.type===supplied.type&&required.identifier===supplied.identifier
    && (required.revision===null||required.revision===supplied.revision);
}
