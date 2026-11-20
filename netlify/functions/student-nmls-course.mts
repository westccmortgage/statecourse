import { withNmlsMedia } from './_lib/nmls-media.mjs';
import { requireStudentSession, sessionCookies } from './_lib/student-session.mjs';
import { requireSameOrigin } from './_lib/http.mjs';
import { rpc } from './_lib/db.mjs';
import { executeNmlsTraining, nmlsTrainingPublicError } from './_lib/nmls-training-service.mjs';
import { creditReviewPresentation, reviewerOnlyRpc } from './_lib/nmls-credit-review.mjs';
import { createChallengeStore, identityGate, identityStatus } from './_lib/biosig/checkpoints.mjs';
import { biosigConfig } from '../../config/nmls/biosig.mjs';
import { nmlsCheckpointMode } from '../../config/nmls/credit-review.mjs';

// The credit version of the national mortgage course, for NMLS reviewer accounts only.
// It runs the same pinned course and the same saved progress as free training, and
// refuses any enrollment that was not provisioned with a reviewer role before a single
// further read or write. It cannot create purchases, approvals, certificates or credit,
// With NMLS_CREDIT_CHECKPOINTS=biosig it also refuses to continue past a checkpoint until
// BSI's callback has verified the student; it never contacts BSI itself.
export const config = { path: '/api/student/nmls/course' };
const MAX_BYTES = 16_384;

export default async function handler(request: Request): Promise<Response> {
  const headers = new Headers({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store, private',
    'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex, nofollow' });
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
  if (request.method !== 'POST') { headers.set('allow', 'POST'); return reply(405, { error: 'method_not_allowed' }); }
  try {
    const event = { headers: Object.fromEntries(request.headers) };
    requireSameOrigin(event);
    if (!/^application\/json(?:\s*;\s*charset="?utf-8"?)?\s*$/i.test(request.headers.get('content-type') || '')) return reply(415, { error: 'json_required' });
    if (Number(request.headers.get('content-length')) > MAX_BYTES) return reply(413, { error: 'request_too_large' });
    const chunks: Uint8Array[] = [], reader = request.body?.getReader(); let total = 0, input: unknown;
    try {
      if (reader) while (true) {
        const { done, value } = await reader.read(); if (done) break;
        total += value.byteLength;
        if (total > MAX_BYTES) { await reader.cancel().catch(() => {}); return reply(413, { error: 'request_too_large' }); }
        chunks.push(value);
      }
      input = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
    } catch { return reply(400, { error: 'invalid_json' }); }
    finally { reader?.releaseLock(); }
    const auth = await requireStudentSession(event);
    if (auth.refreshedSession) for (const cookie of sessionCookies(auth.refreshedSession)) headers.append('set-cookie', cookie);
    let context: { reviewRole?: string } | null = null;
    const reviewer = reviewerOnlyRpc(rpc);
    const read = async (name: string, args: unknown) => { const value = await reviewer(name, args); if (name === 'nmls_training_context') context = value; return value; };
    const identity = nmlsCheckpointMode() === 'biosig' ? { store: createChallengeStore(), config: biosigConfig() } : null;
    const result = await executeNmlsTraining(input, auth.student.id, { rpc: identity ? identityGate(read, input, identity) : read });
    const body = creditReviewPresentation(await withNmlsMedia(result.body));
    if (identity && body?.creditReview && (input as { operation?: string })?.operation === 'snapshot') body.creditReview.checkpoints.identity = await identityStatus(context, identity);
    return reply(result.status, body);
  } catch (error) {
    const code = (error as Error)?.message;
    if (code === 'nmls_course_review_access_required') return reply(403, { error: code });
    // 409 so the page keeps the saved course on screen and shows the identity step.
    if (code === 'nmls_identity_check_required' || code === 'nmls_identity_check_unavailable') return reply(409, { error: code });
    const result = nmlsTrainingPublicError(error); return reply(result.status, result.body);
  }
}
