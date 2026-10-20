import {withLambda} from '@netlify/aws-lambda-compat';
import { parseJson, requireSameOrigin } from './_lib/http.mjs';
import { clearSessionCookies, requireStudentSession, sessionCookies, sessionResponse, signInStudent, signOutStudent } from './_lib/student-session.mjs';
import { requireStaff } from './_lib/staff-session.mjs';
import { ADMIN_ROLES, audit, digest, limit, proofCookie, security, staffContext } from './_lib/staff-security.mjs';

const handler = async event => {
  try {
    if (event.httpMethod === 'GET') {
      const staff = await requireStaff(event, ADMIN_ROLES);
      return sessionResponse(200, {user:staff.auth.student, roles:staff.roles,
        bindings:staff.bindings.map(b => ({actorRole:b.actor_role, scopeState:b.scope_state})), grantsApproval:false},
      staff.auth.refreshedSession ? sessionCookies(staff.auth.refreshedSession) : []);
    }
    requireSameOrigin(event);
    if (event.httpMethod === 'POST') {
      const input = parseJson(event);
      await limit(event, 'login', String(input.email || '').trim().toLowerCase());
      let result;
      try { result = await signInStudent(input.email, input.password); }
      catch { await audit('admin_login','denied'); throw Object.assign(new Error('admin_sign_in_failed'),{statusCode:403}); }
      const auth = await requireStudentSession({headers:{authorization:`Bearer ${result.session.access_token}`}});
      await staffContext(auth);
      await audit('admin_login','mfa_required',auth);
      return sessionResponse(200, {mfaRequired:true, grantsApproval:false}, [...sessionCookies(result.session),proofCookie()]);
    }
    if (event.httpMethod === 'DELETE') {
      const match = String(event.headers?.cookie || '').match(/(?:^|;\s*)__Host-sc_staff=([A-Za-z0-9_-]{43})(?:;|$)/);
      if (match) await security('revoke',{proof_hash:digest(match[1])});
      await signOutStudent(event);
      return sessionResponse(200,{ok:true},[...clearSessionCookies(),proofCookie()]);
    }
    return sessionResponse(405,{error:'method_not_allowed'});
  } catch (error) {
    const status = error.statusCode || 503;
    return sessionResponse(status,{error:status >= 500 ? 'admin_session_unavailable' : error.message});
  }
};

// Keep the existing Lambda handler contract on the modern Netlify runtime.
export {handler as legacyHandler};
export default withLambda(handler);
