import { requireStudentSession, sessionCookies } from './_lib/student-session.mjs';
import { requireSameOrigin } from './_lib/http.mjs';
import { rpc } from './_lib/db.mjs';
import { getNmlsReviewCourse } from './_lib/nmls-review-content.mjs';
import { executeNmlsReview, nmlsReviewPublicError } from './_lib/nmls-review-service.mjs';

export const config = { path: '/api/student/nmls/review' };

export default async function handler(request: Request): Promise<Response> {
  const headers = new Headers({ 'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store, private', 'x-content-type-options': 'nosniff',
    'x-robots-tag': 'noindex, nofollow' });
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
  if (request.method !== 'POST') { headers.set('allow', 'POST'); return reply(405, { error: 'method_not_allowed' }); }
  try {
    const event = { headers: Object.fromEntries(request.headers.entries()) };
    requireSameOrigin(event);
    if (!/^application\/json(?:;|$)/i.test(request.headers.get('content-type') || '')) return reply(415, { error: 'json_required' });
    const length = Number(request.headers.get('content-length'));
    if (length > 16384) return reply(413, { error: 'review_request_too_large' });
    // Bound streamed/chunked bodies too; do not trust Content-Length alone.
    const reader = request.body?.getReader();
    if (!reader) return reply(400, { error: 'invalid_json' });
    const chunks: Uint8Array[] = []; let total = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > 16384) { await reader.cancel(); return reply(413, { error: 'review_request_too_large' }); }
      chunks.push(value);
    }
    let input;
    try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
    catch { return reply(400, { error: 'invalid_json' }); }
    const authenticated = await requireStudentSession(event);
    if (authenticated.refreshedSession) for (const cookie of sessionCookies(authenticated.refreshedSession)) headers.append('set-cookie', cookie);
    const result = await executeNmlsReview(input, authenticated.student.id, { rpc, courseFor: getNmlsReviewCourse });
    return reply(result.status, result.body);
  } catch (error) {
    const result = nmlsReviewPublicError(error);
    return reply(result.status, result.body);
  }
}
