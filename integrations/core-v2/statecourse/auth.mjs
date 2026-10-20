import { IntegrationError, UUID, digest } from './contract.mjs';
// The auth server validates the original bearer before its claims are consumed.
// No user_metadata, email address, body-supplied actor, or shared admin token is authority.
export function createSupabaseVerifier({ url, publishableKey, fetch: transport = globalThis.fetch }) {
  const base = new URL(url);
  if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || base.pathname !== '/') throw new Error('fixed_https_auth_origin_required');
  return async token => {
    if (typeof token !== 'string' || token.length > 8192 || token.split('.').length !== 3) throw new IntegrationError('authentication_required', 401);
    const response = await transport(new URL('/auth/v1/user', base), { method: 'GET', redirect: 'error', cache: 'no-store',
      headers: { apikey: publishableKey, authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new IntegrationError('authentication_required', 401);
    const user = await response.json();
    let claims;
    try { claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8')); } catch { throw new IntegrationError('authentication_required', 401); }
    if (!UUID.test(user.id ?? '') || claims.sub !== user.id || !UUID.test(claims.session_id ?? '') || claims.aal !== 'aal2'
        || !Number.isFinite(claims.exp) || claims.exp * 1000 <= Date.now()) throw new IntegrationError('current_mfa_session_required', 403);
    return Object.freeze({ userId: user.id, sessionId: claims.session_id });
  };
}
export async function authenticate(headers, verifyAccessToken) {
  const bearer = headers.get('authorization');
  const proof = headers.get('x-statecourse-staff-proof');
  if (!bearer?.startsWith('Bearer ') || !/^[A-Za-z0-9_-]{43}$/.test(proof ?? '')) throw new IntegrationError('authentication_required', 401);
  const identity = await verifyAccessToken(bearer.slice(7));
  if (!UUID.test(identity?.userId ?? '') || !UUID.test(identity?.sessionId ?? '')) throw new IntegrationError('authentication_required', 401);
  return Object.freeze({ ...identity, proofHash: digest(proof) });
}
