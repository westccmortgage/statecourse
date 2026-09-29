import { requireSameOrigin } from './_lib/http.mjs';
import { requireStudentSession, sessionCookies } from './_lib/student-session.mjs';
import { enrollFirstFactor, limit, proofCookie, requirePrivilege, staffContext, stepUp } from './_lib/staff-security.mjs';

export default async function handler(request) {
  const url = new URL(request.url);
  const event = {httpMethod:request.method,path:url.pathname,headers:Object.fromEntries(request.headers),
    queryStringParameters:Object.fromEntries(url.searchParams)};
  const headers = new Headers({'content-type':'application/json','cache-control':'no-store, private','x-content-type-options':'nosniff'});
  try {
    if (request.method === 'GET') {
      await limit(event,'request');
      const auth = await requireStudentSession(event);
      const context = await staffContext(auth);
      if (url.searchParams.get('check') === '1') await requirePrivilege(event,auth);
      if (auth.refreshedSession) for (const cookie of sessionCookies(auth.refreshedSession)) headers.append('set-cookie',cookie);
      return new Response(JSON.stringify({ok:true, factors:(auth.user.factors || [])
        .filter(f => f.status === 'verified' && f.factor_type === 'totp').map(f => ({id:f.id,name:f.friendly_name || 'Authenticator'})),
        owner:context.bindings.some(b => b.actor_role === 'owner' && b.scope_state === null)}), {headers});
    }
    if (request.method !== 'POST') return new Response('{}',{status:405,headers});
    requireSameOrigin(event);
    if (!request.headers.get('content-type')?.startsWith('application/json')) return new Response('{}',{status:415,headers});
    const raw = await request.text(); if (raw.length > 4096) return new Response('{}',{status:413,headers});
    const input=JSON.parse(raw);
    if (input.action === 'enroll_first_factor') {
      const enrollment=await enrollFirstFactor(event);
      return new Response(JSON.stringify(enrollment),{headers});
    }
    const result = await stepUp(event,input);
    for (const cookie of [...sessionCookies(result.session),proofCookie(result.proof)]) headers.append('set-cookie',cookie);
    return new Response(JSON.stringify({ok:true, actionProof:result.actionProof, ownerTicket:result.ownerTicket}),{headers});
  } catch (error) {
    return new Response(JSON.stringify({error:error.statusCode && error.statusCode < 500 ? error.message : 'staff_security_unavailable'}),
      {status:error.statusCode || 503,headers});
  }
}
export const config = {path:'/api/staff/security'};
