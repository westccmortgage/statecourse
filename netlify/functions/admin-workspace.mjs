import { dbRequest, rpc } from './_lib/db.mjs';
import { requireStaff, STAFF_ROLES, logConsoleAction } from './_lib/staff-session.mjs';
import { sessionCookies } from './_lib/student-session.mjs';
import { assessSnapshot, courseFor, fail, globalOwner, KEY, PAGE_SIZE, readRows, snapshot, studentDetail, UUID } from './_lib/console-operations.mjs';
import { contentWorkspace, screenText, saveContent, reviewContent, publishContent } from './_lib/console-content.mjs';

function eventFrom(req) { return { httpMethod:req.method,headers:Object.fromEntries(req.headers),queryStringParameters:Object.fromEntries(new URL(req.url).searchParams) }; }
function response(body,status=200,cookies=[]) {
  const headers=new Headers({'content-type':'application/json','cache-control':'no-store, private','x-content-type-options':'nosniff'});
  for(const cookie of cookies) headers.append('set-cookie',cookie);
  return new Response(JSON.stringify(body),{status,headers});
}
function roleList(operation) {
  if(operation==='team' || operation==='binding') return ['owner'];
  if(['save_draft','publish','task_create','task_update','health_run'].includes(operation)) return ['owner','administrator'];
  if(operation==='review') return ['owner','administrator','instructor'];
  if(['payments','health','audit','messages','settings'].includes(operation)) return ['owner','administrator'];
  if(['course','screen'].includes(operation)) return ['owner','administrator','instructor','regulator_reviewer','video_producer'];
  return ['owner','administrator','instructor','regulator_reviewer','support'];
}
function requireGlobal(staff) { if(staff.scopeStates) fail('unscoped_administration_required',403); }
function environmentStatus() {
  const get=k=>String(globalThis.Netlify?.env.get(k)||'').trim();
  return { stripeMode:get('STRIPE_MODE')||'not_configured',liveEnabled:get('STATECOURSE_LIVE_PAYMENTS_ENABLED')==='true',
    stripeTestConnected:Boolean(get('STRIPE_SECRET_KEY_TEST')&&get('STRIPE_WEBHOOK_SECRET_TEST')),
    cloudflareUploadConfigured:Boolean(get('CLOUDFLARE_ACCOUNT_ID')&&get('CLOUDFLARE_STREAM_API_TOKEN')),
    cloudflareSigningConfigured:Boolean(get('CLOUDFLARE_STREAM_KEY_ID')&&get('CLOUDFLARE_STREAM_SIGNING_JWK')&&get('CLOUDFLARE_STREAM_CUSTOMER_CODE')),
    googleConnected:false,weeklySchedule:'Monday 16:00 UTC',secretsExposed:false };
}
export default async function handler(req) {
  let cookies=[];
  try {
    if(!['GET','POST'].includes(req.method)) fail('method_not_allowed',405);
    const event=eventFrom(req), query=event.queryStringParameters;
    let input={};
    if(req.method==='POST') {
      const base=globalThis.Netlify?.env.get('STATECOURSE_BASE_URL');
      if(!base) fail('base_url_not_configured',503);
      if(req.headers.get('origin')!==new URL(base).origin) fail('origin_not_allowed',403);
      if(!req.headers.get('content-type')?.startsWith('application/json')) fail('json_required',415);
      const text=await req.text(); if(text.length>550000) fail('request_too_large',413);
      try { input=JSON.parse(text); } catch { fail('invalid_json'); }
      if(!input || typeof input!=='object'||Array.isArray(input)) fail('invalid_request');
    }
    const operation=req.method==='POST'?input.action:(query.view||'overview');
    const staff=await requireStaff(event,roleList(operation));
    cookies=staff.auth.refreshedSession?sessionCookies(staff.auth.refreshedSession):[];
    let result;
    if(req.method==='GET') {
      if(operation==='overview') result=await snapshot(staff);
      else if(operation==='course') result=await contentWorkspace(staff,query.course_id);
      else if(operation==='screen') result=await screenText(staff,query.course_id,query.delivery_id,query.screen_id);
      else if(operation==='student') result=await studentDetail(staff,query.enrollment_id);
      else if(operation==='settings') { requireGlobal(staff); result=environmentStatus(); }
      else if(operation==='team') {
        if(!globalOwner(staff)) fail('unscoped_owner_required',403);
        const bindings=await readRows('current_staff_actor_bindings?select=*&order=recorded_at.desc&limit=1001');
        const ids=[...new Set(bindings.rows.map(b=>b.auth_user_id).filter(id=>UUID.test(id)))];
        const people=await readRows("students?select=id,email,first_name,last_name&order=email.asc&limit=1001");
        result={bindings,people,roles:STAFF_ROLES};
      }
      else if(operation==='health') { requireGlobal(staff); result=await readRows('console_health_runs?select=*&order=checked_at.desc&limit=20'); }
      else if(operation==='audit') { requireGlobal(staff); result=await readRows('admin_console_actions?select=*&order=occurred_at.desc,id.desc&limit=201'); }
      else if(operation==='messages') { requireGlobal(staff); result={outbox:await readRows('notification_outbox?select=*&order=created_at.desc&limit=201'),authEmailDelivery:'not_available_from_outbox',automaticStudentMessagesEnabled:false}; }
      else if(operation==='payments') {
        let filter='';
        if(staff.scopeStates) filter=`&state=in.(${staff.scopeStates.join(',')})`;
        const offset=Math.max(0,Number.parseInt(query.offset||'0',10)||0);
        result=await readRows(`admin_payment_ledger?select=*&order=payment_date.desc&limit=${PAGE_SIZE+1}&offset=${offset}${filter}`);
        result.hasMore=result.rows.length>PAGE_SIZE; result.rows=result.rows.slice(0,PAGE_SIZE);result.offset=offset;
      } else fail('unknown_workspace_view',404);
    } else {
      if(operation==='save_draft') result=await saveContent(staff,input);
      else if(operation==='review') result=await reviewContent(staff,input);
      else if(operation==='publish') result=await publishContent(staff,input);
      else if(operation==='health_run') {
        requireGlobal(staff);
        const report=assessSnapshot(await snapshot(staff),environmentStatus());
        // Durable reports contain diagnostics and counts, not student or payment records.
        const summary={checkedAt:report.checkedAt,outcome:report.outcome,findings:report.findings,sources:Object.fromEntries(Object.entries(report.datasets).map(([k,v])=>[k,{available:v.available,truncated:v.truncated,rows:v.rows.length}]))};
        await dbRequest('console_health_runs',{method:'POST',prefer:'return=minimal',body:{trigger_kind:'manual',outcome:report.outcome,report:summary,recorded_by:staff.auth.student.id}});
        result=summary;
      }
      else if(operation==='task_create') {
        await courseFor(staff,input.courseId);
        const title=String(input.title||'').trim();if(title.length<3||title.length>200) fail('task_title_required');
        const priority=String(input.priority||'normal');if(!['normal','high','blocking'].includes(priority)) fail('invalid_priority');
        result=await dbRequest('console_tasks',{method:'POST',prefer:'return=representation',body:{course_id:input.courseId,title,detail:String(input.detail||'').slice(0,10000),priority,created_by:staff.auth.student.id,updated_by:staff.auth.student.id}});
      }
      else if(operation==='task_update') {
        if(!UUID.test(input.id||'')) fail('invalid_task_id');
        const task=(await dbRequest(`console_tasks?id=eq.${input.id}&select=*&limit=1`))?.[0];
        if(!task) fail('task_not_found',404);await courseFor(staff,task.course_id);
        if(!Number.isInteger(input.expectedRevision)) fail('expected_revision_required');
        const patch={};
        if(input.status!=null){if(!['open','in_progress','needs_verification','closed'].includes(input.status))fail('invalid_task_status');patch.status=input.status;}
        if(input.assignedTo!==undefined){if(input.assignedTo!==null&&!UUID.test(input.assignedTo))fail('invalid_assignee');patch.assigned_to=input.assignedTo;}
        if(input.dueDate!==undefined){if(input.dueDate!==null&&!/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate))fail('invalid_due_date');patch.due_date=input.dueDate;}
        if(String(input.note||'').trim().length<10)fail('task_change_reason_required');
        result=await rpc('console_update_task',{p_id:input.id,p_expected:input.expectedRevision,p_patch:patch,p_actor:staff.auth.student.id,p_note:String(input.note).trim().slice(0,5000)});
      }
      else if(operation==='binding') {
        if(!globalOwner(staff)) fail('unscoped_owner_required',403);
        if(!UUID.test(input.userId||'')||!STAFF_ROLES.includes(input.role)) fail('invalid_staff_binding');
        if(!['active','revoked'].includes(input.status))fail('invalid_binding_status');
        const scope=input.scopeState||null;if(scope&&!/^[A-Z]{2}$/.test(scope))fail('invalid_state');
        if(input.userId===staff.auth.student.id && input.role==='owner')fail('cannot_change_own_owner_binding',409);
        if(String(input.note||'').trim().length<10)fail('binding_reason_required');
        const person=(await dbRequest(`students?id=eq.${input.userId}&select=id&limit=1`))?.[0];
        if(!person)fail('existing_account_required',404);
        let expires=null;if(input.expiresAt){const time=Date.parse(input.expiresAt);if(!Number.isFinite(time)||time<=Date.now())fail('future_expiry_required');expires=new Date(time).toISOString();}
        result=await dbRequest('staff_actor_binding_events',{method:'POST',prefer:'return=representation',body:{auth_user_id:person.id,actor_role:input.role,scope_state:scope,binding_status:input.status,effective_at:new Date().toISOString(),expires_at:expires,evidence:{note:String(input.note).trim().slice(0,5000)},recorded_by:staff.auth.student.id}});
      } else fail('unknown_workspace_action');
      await logConsoleAction(staff,`workspace.${operation}`,input.courseId||input.id||input.userId||null,{action:operation});
    }
    return response({result,checkedAt:new Date().toISOString()},200,cookies);
  } catch(error) {
    const conflict=/revision_conflict|review_required|verification_step_required/.test(error?.message||'');
    const status=conflict?409:Number(error.statusCode)||500;
    if(status>=500)console.error('Administration workspace unavailable',error?.message);
    return response({error:status>=500?'workspace_data_unavailable':error.message},status,cookies);
  }
}
export const config={path:'/api/admin/workspace'};
