import { createHash } from 'node:crypto';
import { startNmlsCourseReview, projectNmlsReview, reduceNmlsReview,
  compactNmlsReviewOutcome, hydrateNmlsReviewOutcome } from '../../../lib/nmls-review-runtime.mjs';

const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const errors = new Set(['nmls_review_access_denied', 'nmls_review_content_changed', 'nmls_review_revision_conflict',
  'nmls_review_idempotency_conflict', 'nmls_review_session_conflict', 'nmls_review_course_not_found', 'nmls_review_clock_refresh_required',
  'nmls_review_policy_flow_required', 'nmls_review_teaching_phase_requires_joint_commit']);
const fail = (code, statusCode = 400) => { throw Object.assign(new Error(code), { statusCode }); };
const common = ['attemptId', 'eventId', 'expectedRevision', 'sessionId', 'kind'];
const fields = {
  resume: [], logout: [], open_unit: ['unitId'], heartbeat: ['visible'],
  interaction: ['visible', 'observation'], unit_action: ['choice'], complete_unit: [],
  quiz_start: ['moduleId'], quiz_submit: ['quizId', 'answers'],
};
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((k) => [k, stable(value[k])]));
  return value;
}
export function digestNmlsCommand(input) { return createHash('sha256').update(JSON.stringify(stable(input))).digest('hex'); }

export function validateNmlsReviewInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('invalid_review_request');
  if (input.kind === 'list') {
    if (Object.keys(input).length !== 1) fail('invalid_review_request');
    return input;
  }
  if (input.kind === 'start') {
    if (Object.keys(input).some((k) => !['kind', 'grantId', 'courseKey'].includes(k)) ||
      !UUID.test(input.grantId || '') || typeof input.courseKey !== 'string' || input.courseKey.length > 160) fail('invalid_review_request');
    return input;
  }
  if (!Object.hasOwn(fields, input.kind)) fail('invalid_review_command');
  if (Object.keys(input).some((k) => ![...common, ...fields[input.kind]].includes(k))) fail('unsupported_review_field');
  if (!UUID.test(input.attemptId || '') || !UUID.test(input.eventId || '') ||
    !Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 0 ||
    (input.kind !== 'resume' && !UUID.test(input.sessionId || ''))) fail('invalid_review_request');
  if (['heartbeat', 'interaction'].includes(input.kind) && typeof input.visible !== 'boolean') fail('invalid_review_observation');
  if (input.kind === 'interaction' && !['pointer', 'keyboard', 'scroll'].includes(input.observation)) fail('invalid_review_observation');
  if (['open_unit', 'quiz_start'].includes(input.kind) && !/^[A-Z0-9-]{1,50}$/.test(input.unitId || input.moduleId || '')) fail('invalid_review_target');
  if (input.kind === 'unit_action' && !/^[A-D]$/.test(input.choice || '')) fail('invalid_review_answer');
  if (input.kind === 'quiz_submit' && (!UUID.test(input.quizId || '') || !input.answers || Array.isArray(input.answers) ||
    typeof input.answers !== 'object' || Object.keys(input.answers).length > 10)) fail('invalid_review_answer_set');
  return input;
}

export function nmlsReviewPublicError(error) {
  const message = String(error?.message || '');
  const known = [...errors].find((code) => message.includes(code));
  if (known) return { status: known === 'nmls_review_access_denied' ? 403 : known === 'nmls_review_course_not_found' ? 404 : 409, body: { error: known } };
  if (Number(error?.statusCode) >= 400 && Number(error?.statusCode) < 500 && /^[a-z_]{3,80}$/.test(message)) {
    return { status: error.statusCode, body: { error: message } };
  }
  return { status: 503, body: { error: 'nmls_review_unavailable' } };
}

export async function executeNmlsReview(input, studentId, { rpc, courseFor, clockRetries = 1 }) {
  validateNmlsReviewInput(input);
  if (!UUID.test(studentId || '')) fail('invalid_authenticated_actor', 401);
  if (input.kind === 'list') {
    const grants = await rpc('nmls_review_list', { p_student_id: studentId });
    if (!Array.isArray(grants)) throw new Error('invalid_review_grants_response');
    return { status: 200, body: { reviews: grants.map((grant) => {
      let course;
      try { course = courseFor(grant.courseKey); }
      catch (error) { if (error.message !== 'nmls_review_course_not_found') throw error; }
      const available = Boolean(course && course.digest === grant.contentDigest);
      // Explicit allowlist: never disclose evidence, actors, leases or raw state.
      return { grantId: grant.grantId, courseKey: grant.courseKey,
        title: course?.title || 'Private course review', expiresAt: grant.expiresAt,
        status: available ? grant.status : 'content_unavailable', available,
        mode: 'non_credit_review', creditIssuanceAllowed: false };
    }) } };
  }
  if (input.kind === 'start') {
    const course = courseFor(input.courseKey);
    const result = await rpc('nmls_review_start', { p_student_id: studentId, p_grant_id: input.grantId,
      p_course_key: course.id, p_content_digest: course.digest, p_initial_runtime: startNmlsCourseReview(course) });
    const progress = projectNmlsReview(result.attempt.runtime, course);
    // Reload/another tab cannot silently acquire the active lease. The caller
    // retains its existing session locally or explicitly resumes/takes over.
    progress.sessionId = null;
    return { status: 200, body: { attemptId: result.attempt.id, progress } };
  }
  const context = await rpc('nmls_review_context', { p_student_id: studentId, p_attempt_id: input.attemptId });
  const course = courseFor(context.attempt.course_key);
  if (context.attempt.content_digest !== course.digest) throw new Error('nmls_review_content_changed');
  // On a duplicate retry, the stored state may have moved beyond this command.
  // Commit's idempotency check runs before CAS; it retrieves the exact original
  // outcome without recomputing a grade or overwriting the newer state.
  let reduced;
  try { reduced = reduceNmlsReview(context.attempt.runtime, input, course, Number(context.serverTimeMs)); }
  catch (error) {
    if (!['nmls_review_revision_conflict', 'nmls_review_session_conflict'].includes(error.message)) throw error;
    reduced = { state: context.attempt.runtime, outcome: {}, audit: {} };
  }
  let result;
  try { result = await rpc('nmls_review_commit', {
    p_student_id: studentId, p_attempt_id: input.attemptId, p_event_id: input.eventId,
    p_command_digest: digestNmlsCommand(input), p_expected_revision: input.expectedRevision,
    p_expected_session_id: input.sessionId || null, p_evaluated_at_ms: Number(context.serverTimeMs),
    p_content_digest: course.digest, p_runtime: reduced.state,
    // Store immutable lesson references, not the full manuscript on every
    // heartbeat. Hydration uses the grant-pinned content digest on every replay.
    p_outcome: compactNmlsReviewOutcome(reduced.outcome), p_audit: reduced.audit,
  }); } catch (error) {
    if (clockRetries > 0 && String(error?.message).includes('nmls_review_clock_refresh_required')) {
      return executeNmlsReview(input, studentId, { rpc, courseFor, clockRetries: clockRetries - 1 });
    }
    throw error;
  }
  return { status: result.outcome.status, body: { ...hydrateNmlsReviewOutcome(result.outcome, course), attemptId: input.attemptId, duplicate: result.duplicate } };
}
