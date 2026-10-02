import { requireStudentSession, sessionCookies } from './student-session.mjs';
import { requireStaff } from './staff-session.mjs';
import { requireSameOrigin } from './http.mjs';
import { rpc } from './db.mjs';
import { executePe03, pe03PublicError } from './nmls-pe-service.mjs';
// Dependency injection is local-test only; production exports use these exact defaults.
export function createPe03Handler(role, deps = {}) {
  const authenticate = deps.authenticate || (role === 'student' ? requireStudentSession : async event => (await requireStaff(event,['instructor'])).auth);
  const callRpc = deps.rpc || rpc;
  const enabled = deps.enabled || (() => process.env.STATECOURSE_PE03_COHORT_ENABLED === 'true');
  const origin = deps.sameOrigin || requireSameOrigin;
  return async request => {
    const headers = new Headers({ 'content-type':'application/json; charset=utf-8','cache-control':'no-store, private','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow' });
    const reply = (status,body) => new Response(JSON.stringify(body),{status,headers});
    if (!enabled()) return reply(404,{error:'pe03_disabled'});
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
      return reply(200,await executePe03(input,auth.student.id,role,{rpc:callRpc}));
    } catch(error) {const result=pe03PublicError(error);return reply(result.status,result.body);}
  };
}
