import { requireStudentSession, sessionCookies } from './_lib/student-session.mjs';
import { requireSameOrigin } from './_lib/http.mjs';
import { dbRequest, rpc } from './_lib/db.mjs';
import { reviewerOnlyRpc } from './_lib/nmls-credit-review.mjs';
import { checkpointD3, createChallengeStore, dueCheckpoint } from './_lib/biosig/checkpoints.mjs';
import { buildNmlsArgumentString, requestBiosigRedirect } from './_lib/biosig/sso.mjs';
import { resolveBiosigUid } from './_lib/biosig/identifier.mjs';
import { biosigConfig } from '../../config/nmls/biosig.mjs';
import { NMLS_CREDIT_CHECKPOINTS, nmlsCheckpointMode } from '../../config/nmls/credit-review.mjs';

// Starts one BioSig-ID identity check for the reviewers' credit course and returns the
// address BSI wants the student sent to. The server decides which checkpoint is owed;
// the browser supplies only the enrollment. Passing the check is recorded solely by
// BSI's own callback (biosig-callback.mts), never by this endpoint or by the page.
export const config = { path: '/api/student/nmls/identity-check' };
const MAX_BYTES = 2048;
const uuid = (value: unknown) => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);

export default async function handler(request: Request): Promise<Response> {
  const headers = new Headers({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store, private',
    'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex, nofollow' });
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
  if (request.method !== 'POST') { headers.set('allow', 'POST'); return reply(405, { error: 'method_not_allowed' }); }
  try {
    const event = { headers: Object.fromEntries(request.headers) };
    requireSameOrigin(event);
    if (!/^application\/json(?:\s*;\s*charset="?utf-8"?)?\s*$/i.test(request.headers.get('content-type') || '')) return reply(415, { error: 'json_required' });
    const text = await request.text();
    if (text.length > MAX_BYTES) return reply(413, { error: 'request_too_large' });
    let input: { enrollmentId?: unknown; inSession?: unknown };
    try { input = JSON.parse(text); } catch { return reply(400, { error: 'invalid_json' }); }
    if (!input || typeof input !== 'object' || !uuid(input.enrollmentId)) return reply(400, { error: 'enrollment_required' });
    const enrollmentId = String(input.enrollmentId).toLowerCase();

    const auth = await requireStudentSession(event);
    if (auth.refreshedSession) for (const cookie of sessionCookies(auth.refreshedSession)) headers.append('set-cookie', cookie);
    // Inert unless the owner has switched real checks on and supplied every BSI value.
    const bsi = biosigConfig();
    if (nmlsCheckpointMode() !== 'biosig' || !bsi.ready) return reply(409, { error: 'nmls_identity_check_unavailable' });

    const studentId = String(auth.student.id).toLowerCase();
    const context = await reviewerOnlyRpc(rpc)('nmls_training_context', { p_student_id: studentId, p_enrollment_id: enrollmentId, p_event_id: null });
    if (context.reviewRole !== 'student_reviewer' || context.enrollmentId !== enrollmentId) return reply(403, { error: 'nmls_course_review_access_required' });

    const store = createChallengeStore();
    const { rows, passed } = await store.history(enrollmentId);
    const due = dueCheckpoint(context.runtime, passed), step = NMLS_CREDIT_CHECKPOINTS.find(item => item.id === due)!;
    if (store.usable(rows, due)) return reply(200, { ready: true, checkpoint: { id: due, d3: step.d3, label: step.label } });

    const profile = (await dbRequest(`students?id=eq.${encodeURIComponent(studentId)}&select=email,first_name,last_name,nmls_id&limit=1`))?.[0];
    // Only reviewer accounts can open this course today, and a reviewer account is a test
    // account: it is never sent to BSI under a number that could be a real NMLS ID.
    const testAccount = context.reviewRole === 'student_reviewer';
    const uid = await resolveBiosigUid(bsi, { studentId, nmlsId: profile?.nmls_id, testAccount });
    if (!uid) return reply(409, { error: testAccount ? 'nmls_identity_check_unavailable' : 'nmls_id_required' });
    // "Returning" labels the stop for BSI only; it opens nothing. The page says whether the
    // student reached this checkpoint inside a running study session.
    const d3 = checkpointD3(due, { returning: input.inSession !== true && passed.has('begin') });

    const challenge = await store.create({ enrollmentId, studentId, checkpoint: due, uid, d3 });
    try {
      const args = buildNmlsArgumentString(bsi, { email: profile?.email || auth.student.email, firstName: profile?.first_name, lastName: profile?.last_name,
        uid, d3, challengeId: challenge.id });
      const redirect = await requestBiosigRedirect(bsi, args);
      console.info('BioSig-ID check started', { checkpoint: d3, challenge: challenge.id });
      return reply(200, { ready: false, redirect, checkpoint: { id: due, d3, label: step.label } });
    } catch (error) {
      await store.fail(challenge.id).catch(() => null);
      // Enough to diagnose, nothing sensitive: the checkpoint and BSI's response code only.
      console.error('BioSig-ID check could not start', { checkpoint: d3, challenge: challenge.id, reason: String((error as Error)?.message || 'unknown').slice(0, 40) });
      return reply(409, { error: 'nmls_identity_check_unavailable' });
    }
  } catch (error) {
    const code = String((error as Error)?.message || '');
    if (code === 'nmls_course_review_access_required' || code === 'nmls_training_access_denied' || code === 'origin_not_allowed') return reply(403, { error: code });
    if (['student_auth_required', 'invalid_student_session'].includes(code)) return reply(401, { error: code });
    console.error('BioSig-ID check endpoint failed');
    return reply(503, { error: 'nmls_identity_check_unavailable' });
  }
}
