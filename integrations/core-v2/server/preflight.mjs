import {AUTH_SQL,QUERIES} from '../statecourse/adapter.mjs';
import {UUID,COURSE_ID} from '../statecourse/contract.mjs';
const EMPTY='00000000-0000-4000-8000-000000000000';

// Catalog/plan checks only. This is not authentication, a business-data export,
// a complete RLS visibility proof or permission to activate the service.
export async function inspectConnections({connectSource,connectCore,organizationId}) {
 if(!UUID.test(organizationId||''))throw new Error('explicit_core_organization_required');
 async function inspect(connect,checks) {
  let c;const results=[];
  try {
   c=await connect();await c.query('BEGIN READ ONLY');await c.query("SET LOCAL statement_timeout='5s'");
   for(const [name,check] of checks) {
    // One missing privilege must not abort the remaining independent diagnostics.
    await c.query('SAVEPOINT readiness_check');
    try{results.push({check:name,passed:await check(c)});await c.query('RELEASE SAVEPOINT readiness_check');}
    catch {await c.query('ROLLBACK TO SAVEPOINT readiness_check');await c.query('RELEASE SAVEPOINT readiness_check');results.push({check:name,passed:false});}
   }
   await c.query('ROLLBACK');
  } catch {results.push({check:'connection_or_transaction',passed:false});try{await c?.query('ROLLBACK');}catch{/* no driver details */}}
  finally {await c?.release();}
  return results;
 }
 const source=await inspect(connectSource,[
  ['source_role_has_no_admin_or_allowlisted_write_privileges',async c=>{
   const relations=[...Object.keys(QUERIES).map(t=>'public.'+t),'public.staff_actor_binding_events','statecourse_staff_private.proofs'];
   const {rows}=await c.query(`select not (select rolsuper or rolbypassrls or rolcreaterole or rolcreatedb from pg_roles where rolname=current_user)
    and not exists(select 1 from unnest($1::text[]) t(name) where has_table_privilege(current_user,name,'INSERT,UPDATE,DELETE,TRUNCATE')
     or has_any_column_privilege(current_user,name,'INSERT,UPDATE'))
    and not has_function_privilege(current_user,'public.statecourse_staff_security(text,jsonb)','EXECUTE') as allowed`,[relations]);
   return rows[0]?.allowed===true;
  }],
  ['current_staff_authorization_query_can_plan',async c=>{await c.query('EXPLAIN '+AUTH_SQL,['0'.repeat(64),EMPTY,EMPTY]);return true;}],
  ...Object.entries(QUERIES).map(([table,sql])=>['source_query_'+table,async c=>{await c.query('EXPLAIN '+sql,[EMPTY,COURSE_ID]);return true;}]),
 ]);
 const core=await inspect(connectCore,[
  ['original_core_schema_and_budget_tables_present',async c=>{
   const names=['public.organizations','public.intelligence_workflows','public.workflow_sources','public.workflow_tasks','public.agent_attempts','public.evidence_claims','public.claim_assessments','public.workflow_cost_budgets','public.attempt_cost_reservations'];
   return (await c.query('select bool_and(to_regclass(name) is not null) as present from unnest($1::text[]) t(name)',[names])).rows[0]?.present===true;
  }],
  ['configured_core_organization_exists',async c=>{
   await c.query('SET LOCAL ROLE service_role');
   const present=(await c.query('select exists(select 1 from public.organizations where id=$1::uuid) as present',[organizationId])).rows[0]?.present===true;
   await c.query('RESET ROLE');return present;
  }],
  ['backend_worker_role_and_claim_context_available',async c=>{
   await c.query('SET LOCAL ROLE service_role');
   await c.query("select set_config('request.jwt.claim.role','service_role',true)");
   const {rows}=await c.query("select current_user='service_role' and current_setting('request.jwt.claim.role',true)='service_role' as allowed");
   await c.query('RESET ROLE');return rows[0]?.allowed===true;
  }],
  ['scoped_result_store_role_and_tables_readable',async c=>{
   await c.query('SET LOCAL ROLE statecourse_core_store');
   await c.query("select set_config('core_readonly.organization_id',$1,true),set_config('core_readonly.actor_id',$2,true)",[organizationId,EMPTY]);
   for(const name of ['runs','artifacts','events'])await c.query(`select 1 from core_readonly.${name} where false`);
   await c.query('RESET ROLE');return true;
  }],
 ]);
 return {catalogChecksPassed:[...source,...core].every(r=>r.passed),source,core,
  activation:'not_verified',limitations:['No StateCourse business records read or written','No auth/MFA end-to-end validation','RLS completeness and provider worker privileges require separate verification','No provider calls or schema changes']};
}
