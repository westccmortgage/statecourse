import { requireStudentSession, sessionCookies } from './_lib/student-session.mjs';
import { requireSameOrigin } from './_lib/http.mjs';
import { rpc } from './_lib/db.mjs';
import { executeNmlsLearningReview, nmlsLearningPublicError } from './_lib/nmls-learning-service.mjs';

// Private, explicitly assigned non-credit review only. This route does not
// provision access, accept identity evidence, grant credit, or open enrollment.
export const config = { path: '/api/student/nmls/learning-review' };
const MAX_BYTES = 16_384;

export default async function handler(request: Request): Promise<Response> {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store, private',
    'x-content-type-options': 'nosniff',
    'x-robots-tag': 'noindex, nofollow',
  });
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
  if (request.method !== 'POST') {
    headers.set('allow', 'POST');
    return reply(405, { error: 'method_not_allowed' });
  }
  try {
    const event = { headers: Object.fromEntries(request.headers) };
    // Same-origin is enforced even for a bearer request. No CORS exception or
    // alternate actor supplied in a body/header can impersonate another learner.
    requireSameOrigin(event);
    if (!/^application\/json(?:\s*;\s*charset="?utf-8"?)?\s*$/i.test(request.headers.get('content-type') || '')) {
      return reply(415, { error: 'json_required' });
    }
    if (Number(request.headers.get('content-length')) > MAX_BYTES) {
      return reply(413, { error: 'request_too_large' });
    }
    const chunks: Uint8Array[] = [];
    const reader = request.body?.getReader();
    let total = 0;
    let input: unknown;
    try {
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          total += value.byteLength;
          if (total > MAX_BYTES) {
            await reader.cancel().catch(() => {});
            return reply(413, { error: 'request_too_large' });
          }
          chunks.push(value);
        }
      }
      // Reject malformed UTF-8 instead of silently changing a submitted answer
      // or an event identifier through replacement characters.
      input = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
    } catch {
      return reply(400, { error: 'invalid_json' });
    } finally {
      reader?.releaseLock();
    }
    const auth = await requireStudentSession(event);
    if (auth.refreshedSession) {
      for (const cookie of sessionCookies(auth.refreshedSession)) headers.append('set-cookie', cookie);
    }
    const result = await executeNmlsLearningReview(input, auth.student.id, { rpc });
    // No additional network work after the adapter's final lease/deadline check.
    return reply(result.status, result.body);
  } catch (error) {
    const result = nmlsLearningPublicError(error);
    return reply(result.status, result.body);
  }
}
