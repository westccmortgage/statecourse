import { requireStudentSession, sessionCookies } from './student-session.mjs';
import { requireStaff } from './staff-session.mjs';
import { requireSameOrigin } from './http.mjs';
import { rpc } from './db.mjs';
import {executePeFinal} from './nmls-pe-final-service.mjs';
import {definePeFinalBank} from '../../../lib/nmls-pe-final-domain.mjs';
import candidate from '../../../config/nmls/pe-final/bank-candidate.json' with {type:'json'};
import review from '../../../config/nmls/pe-final/source-review.json' with {type:'json'};
// Dependency injection is local-test only; production exports use these exact defaults.
export function createPeFinalHandler(role, deps = {}) {
  const authenticate = deps.authenticate || (role === 'student' ? requireStudentSession : async event => (await requireStaff(event,['instructor'])).auth);
  const callRpc = deps.rpc || rpc;
  const enabled = deps.enabled || (() => process.env.STATECOURSE_PE_FINAL_ENABLED === 'true' && process.env.STATECOURSE_PE_COURSE_ENABLED === 'true');
  const origin = deps.sameOrigin || requireSameOrigin;
  return async request => {
    const headers = new Headers({ 'content-type':'application/json; charset=utf-8','cache-control':'no-store, private','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow' });
    const reply = (status,body) => new Response(JSON.stringify(body),{status,headers});
    if (!enabled()) return reply(404,{error:'pe_final_disabled'});
    if (request.method !== 'POST') { headers.set('allow','POST'); return reply(405,{error:'method_not_allowed'}); }
    try {
      const url = new URL(request.url);
      const event = { httpMethod:request.method, path:url.pathname, rawUrl:request.url,
        queryStringParameters:Object.fromEntries(url.searchParams), headers:Object.fromEntries(request.headers) };
      origin(event);
      if (!/^application\/json(?:\s*;\s*charset="?utf-8"?)?\s*$/i.test(request.headers.get('content-type')||'')) return reply(415,{error:'json_required'});
      if (Number(request.headers.get('content-length')) > 32768) return reply(413,{error:'request_too_large'});
      const reader = request.body?.getReader(); const chunks=[]; let bytes=0; let input;
      try {
        if(reader) while(true) { const {done,value}=await reader.read(); if(done)break; bytes+=value.byteLength; if(bytes>32768){await reader.cancel();return reply(413,{error:'request_too_large'});} chunks.push(value); }
        event.body=new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks));
        input=JSON.parse(event.body);
      } catch { return reply(400,{error:'invalid_json'}); } finally {reader?.releaseLock();}
      const auth=await authenticate(event);
      if(auth.refreshedSession) for(const cookie of sessionCookies(auth.refreshedSession)) headers.append('set-cookie',cookie);
      return reply(200,await executePeFinal(input,auth.student.id,role,{rpc:callRpc,bank:deps.bank||definePeFinalBank(candidate,{review})}));
    } catch(error) {const result=peFinalPublicError(error);return reply(result.status,result.body);}
  };
}


function peFinalPublicError(error){
 const code=error?.message;
 const status=['student_auth_required','invalid_student_session','invalid_staff_session'].includes(code)?401
 :['origin_not_allowed','pe_final_access_denied','staff_binding_required','staff_role_not_authorized','staff_mfa_required','staff_session_required','staff_step_up_required','fresh_action_authorization_required'].includes(code)?403
 :['pe_final_invalid_request','pe_final_invalid_answers','pe_final_answers_invalid'].includes(code)?400
 :code==='pe_final_disabled'?404
 :['pe_final_prerequisites_required','pe_final_window_closed','pe_final_content_changed','pe_final_revision_conflict','pe_final_idempotency_conflict','pe_final_teaching_required','pe_final_check_conflict','pe_final_review_pending','pe_final_attempt_locked','pe_final_attempt_active','pe_final_attempt_conflict','pe_final_attempt_expired'].includes(code)?409:503;
 return {status,body:{error:status===503?'pe_final_unavailable':code}};
}
