import { createHash, randomBytes } from 'node:crypto';
import { rpc } from './db.mjs';
import { authRequest, requireStudentSession } from './student-session.mjs';
import { requireSameOrigin } from './http.mjs';

export const ADMIN_ROLES = Object.freeze(['owner', 'administrator', 'instructor', 'video_producer', 'support']);
export const PROOF_COOKIE = '__Host-sc_staff';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const fail = (message, statusCode = 403) => { throw Object.assign(new Error(message), {statusCode}); };
export const digest = value => createHash('sha256').update(value).digest('hex');
const opaque = () => randomBytes(32).toString('base64url');

// Call only with the result of requireStudentSession: /auth/v1/user has validated
// this exact JWT. Decoding an unvalidated browser JWT is never authentication.
export function verifiedSession(auth) {
  let claims;
  try { claims = JSON.parse(Buffer.from(auth.accessToken.split('.')[1], 'base64url').toString()); }
  catch { fail('invalid_staff_session', 401); }
  if (claims.sub !== auth.student.id || !UUID.test(claims.session_id || '')
    || !Number.isFinite(claims.exp) || claims.exp <= Date.now()/1000
    || !auth.user?.email_confirmed_at) fail('invalid_staff_session', 401);
  return {user_id:auth.student.id, session_id:claims.session_id, aal:claims.aal,
    password_at:claims.amr?.find(m => m.method === 'password')?.timestamp};
}

export function proofCookie(proof = '') {
  return `${PROOF_COOKIE}=${proof}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${proof ? 900 : 0}`;
}
function cookie(event, name) {
  return String(event.headers?.cookie || '').split(';').map(v => v.trim())
    .find(v => v.startsWith(name+'='))?.slice(name.length+1) || '';
}
export function canonicalAdminPath(path) {
  const aliases = {'/api/admin/refunds':'request-refund', '/api/admin/compliance/missouri-completion-times':'admin-missouri-completion-report'};
  if (aliases[path]) return '/.netlify/functions/'+aliases[path];
  if (path.startsWith('/api/admin/') && path !== '/api/admin/workspace') return '/.netlify/functions/admin-'+path.slice('/api/admin/'.length);
  return path === '/.netlify/functions/admin-workspace' ? '/api/admin/workspace' : path;
}
export function requestIntent(event) {
  const method = String(event.httpMethod || '').toUpperCase();
  let path = event.rawUrl ? new URL(event.rawUrl).pathname : (event.path || '');
  path = canonicalAdminPath(path);
  if (!path.startsWith('/api/') && !path.startsWith('/.netlify/functions/')) fail('admin_request_path_required', 400);
  const query = new URLSearchParams(Object.entries(event.queryStringParameters || {}).sort()).toString();
  const body = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '');
  return digest(JSON.stringify([method, path, query, body]));
}
export function needsFreshAction(event) {
  if (!['GET','HEAD'].includes(event.httpMethod)) return true;
  const path = canonicalAdminPath(event.path || '');
  const q = event.queryStringParameters || {};
  return /export|report/.test(path) || ['export','report','download'].some(k => k in q)
    || ['export','report','download'].includes(q.view);
}
export async function security(op, payload = {}) {
  const result = await rpc('statecourse_staff_security', {op, payload});
  if (!result || result.ok !== true) fail(result?.error || 'staff_security_unavailable', result?.status || 503);
  return result;
}
export async function limit(event, bucket, identifier = '') {
  // Netlify supplies this header; do not use client-controlled X-Forwarded-For.
  const ip = event.headers?.['x-nf-client-connection-ip'] || 'unknown';
  await security('rate', {key:digest(`${bucket}:ip:${ip}`), limit:bucket === 'request' ? 240 : 20});
  if (identifier) await security('rate', {key:digest(`${bucket}:actor:${identifier}`), limit:bucket === 'request' ? 120 : 8});
}
export async function audit(event, outcome, auth = null) {
  await security('audit', {event, outcome, user_id:auth?.student?.id || null});
}
export async function staffContext(auth) {
  return security('context', verifiedSession(auth));
}
export async function requirePrivilege(event, auth) {
  const session = verifiedSession(auth);
  if (session.aal !== 'aal2') fail('staff_step_up_required');
  await limit(event, 'request', session.user_id);
  if (!['GET','HEAD'].includes(event.httpMethod)) requireSameOrigin(event);
  const proof = cookie(event, PROOF_COOKIE);
  if (!/^[A-Za-z0-9_-]{43}$/.test(proof)) fail('staff_step_up_required', 403);
  const fresh = needsFreshAction(event);
  const action = event.headers?.['x-statecourse-action-proof'] || '';
  return security('check', {...session, proof_hash:digest(proof),
    intent:fresh ? requestIntent(event) : null,
    action_hash:fresh && /^[A-Za-z0-9_-]{43}$/.test(action) ? digest(action) : null});
}

export async function stepUp(event, input) {
  await limit(event, 'mfa');
  const auth = await requireStudentSession(event);
  const session = verifiedSession(auth);
  await limit(event, 'factor', session.user_id);
  const context = await staffContext(auth);
  const factor = auth.user.factors?.find(f => f.id === input.factor_id && f.factor_type === 'totp');
  if (!factor || !UUID.test(factor.id) || !/^\d{6}$/.test(input.code || '')) fail('verified_mfa_factor_required');
  if (factor.status !== 'verified') await security('enrollment_check', {...session, factor_id:factor.id});
  // Fresh server challenge for every request, never browser-supplied AAL/AMR.
  const challenge = await authRequest(`factors/${factor.id}/challenge`, {method:'POST', token:auth.accessToken, body:{}});
  if (!UUID.test(challenge.id || '')) fail('mfa_challenge_unavailable', 503);
  let upgraded;
  try {
    upgraded = await authRequest(`factors/${factor.id}/verify`, {method:'POST', token:auth.accessToken,
      body:{challenge_id:challenge.id, code:input.code}});
  } catch {
    await audit('admin_mfa', 'denied', auth);
    fail('mfa_verification_failed', 403);
  }
  const verified = await requireStudentSession({headers:{authorization:`Bearer ${upgraded.access_token}`}});
  const next = verifiedSession(verified);
  if (next.user_id !== session.user_id || next.session_id !== session.session_id || next.aal !== 'aal2') fail('mfa_session_mismatch');
  const proof = opaque();
  const params = {...next, factor_id:factor.id, proof_hash:digest(proof)};
  let actionProof, ownerTicket;
  if (input.intent) {
    if (!/^[0-9a-f]{64}$/.test(input.intent)) fail('invalid_action_intent', 400);
    actionProof = opaque(); params.intent = input.intent; params.action_hash = digest(actionProof);
  }
  if (input.owner_connect) {
    if (!context.bindings.some(b => b.actor_role === 'owner' && b.scope_state === null)) fail('unscoped_owner_required');
    ownerTicket = opaque(); params.owner_ticket_hash = digest(ownerTicket); params.owner_connect = input.owner_connect;
  }
  await security('mint', params);
  return {auth:verified, session:upgraded, proof, actionProof, ownerTicket};
}

// First-factor enrollment is a bootstrap action, never admin authorization.
// It requires a current staff ledger entry and a password reauthentication less
// than five minutes old. Existing verified factors must use normal MFA instead.
export async function enrollFirstFactor(event) {
  await limit(event, 'enroll');
  const auth=await requireStudentSession(event), session=verifiedSession(auth);
  await limit(event, 'enroll_actor', session.user_id);
  await staffContext(auth);
  if (auth.user.factors?.some(f => f.status === 'verified')) fail('existing_mfa_required');
  const now=Date.now()/1000;
  if (!Number.isFinite(session.password_at) || session.password_at < now-300 || session.password_at > now+5) fail('fresh_password_sign_in_required');
  await audit('admin_mfa_enrollment','started',auth);
  const result=await authRequest('factors',{method:'POST',token:auth.accessToken,body:{factor_type:'totp',friendly_name:'StateCourse staff authenticator'}});
  if (!UUID.test(result.id || '') || !result.totp?.secret) fail('mfa_enrollment_unavailable',503);
  await security('enrollment_begin',{...session,factor_id:result.id});
  return {factor_id:result.id,secret:result.totp.secret};
}
