import { createChallengeStore, CALLBACK_CLOCK_DRIFT_MS } from './_lib/biosig/checkpoints.mjs';
import { buildSsoResponseXml, CHALLENGE_ARGUMENT, decryptCallbackArgs, validationSucceeded } from './_lib/biosig/sso.mjs';
import { biosigConfig } from '../../config/nmls/biosig.mjs';
import { NMLS_CREDIT_REVIEW, nmlsCheckpointMode } from '../../config/nmls/credit-review.mjs';

// BioSig-ID's completion callback (BSI's server -> ours). This is the only place an
// identity check can be marked passed. It trusts nothing in the request except a value
// that decrypts with our BSI key, names a check that is still waiting, for the same
// identifier, and says vs=true. It answers with the SSO_RESPONSE XML BSI expects, whose
// REDIRECT is where BSI then sends the student.
export const config = { path: '/api/biosig/callback' };
const MAX_BYTES = 16_384;

export default async function handler(request: Request): Promise<Response> {
  const plain = (status: number) => new Response('Not Found', { status, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });
  const bsi = biosigConfig();
  // Until real checks are switched on and configured, this address does not exist.
  if (nmlsCheckpointMode() !== 'biosig' || !bsi.ready) return plain(404);
  if (!['GET', 'POST'].includes(request.method)) return plain(405);

  const site = String(process.env.STATECOURSE_BASE_URL || '').trim().replace(/\/$/, '');
  const xml = (ok: boolean, redirect: string) => new Response(buildSsoResponseXml(ok ? 'Success' : 'Failure', ok ? '100' : '110', ok ? 'None' : 'Validation failed', redirect),
    { status: 200, headers: { 'content-type': 'text/xml; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' } });
  const course = (enrollmentId: string) => `${site}${NMLS_CREDIT_REVIEW.route}?enrollment_id=${encodeURIComponent(enrollmentId)}`;
  const refused = () => xml(false, `${site}/student/`);
  try {
    const url = new URL(request.url);
    let args = url.searchParams.get('args');
    if (!args && request.method === 'POST') {
      const body = await request.text();
      if (body.length > MAX_BYTES) return refused();
      args = new URLSearchParams(body).get('args');
    }
    const keyed = decryptCallbackArgs(bsi, args);
    if (!keyed) return refused();
    // A timestamp, when BSI sends one, must be recent. The waiting check's own expiry
    // bounds the callback either way.
    if (keyed.ts !== undefined && !(Math.abs(Date.now() - Date.parse(keyed.ts)) <= CALLBACK_CLOCK_DRIFT_MS)) return refused();
    const verified = validationSucceeded(keyed);
    const row = await createChallengeStore().answer(keyed[CHALLENGE_ARGUMENT], { uid: keyed.uid, verified });
    if (!row) return refused();
    return xml(row.status === 'verified', course(row.enrollment_id));
  } catch {
    console.error('BioSig-ID callback could not be processed');
    return refused();
  }
}
