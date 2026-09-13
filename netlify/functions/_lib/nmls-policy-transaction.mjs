import { NMLS_SESSION_POLICY as POLICY } from '../../../config/nmls/session-policy.mjs';
import { startNmlsSessionPolicy, validateNmlsAnnualWindow } from '../../../lib/nmls-session-policy.mjs';
import { compactNmlsReviewOutcome, hydrateNmlsReviewOutcome } from '../../../lib/nmls-review-runtime.mjs';
import { digestNmlsCommand, validateNmlsReviewInput } from './nmls-review-service.mjs';
import { validateNmlsStudyReceipt } from '../../../lib/nmls-study-observer.mjs';

// INTERNAL SERVER TRANSPORT ONLY. Deliberately not wired into the public review
// handler: the combined engagement reducer, full ROCS renderer and learner
// horizon/idle UI must be integrated before policy-bound study is offered.
// `evaluate` is trusted server code, NEVER a browser payload or dynamic import.
export const NMLS_POLICY_DIGEST = digestNmlsCommand(POLICY);
const uuid = (s) => typeof s === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(s);
const sha = (s) => typeof s === 'string' && /^[a-f0-9]{64}$/.test(s);
const fail = (code) => { throw new Error(code); };
const policyKinds = new Set(['accept_rocs', 'begin_break', 'end_break', 'check_access', 'recover_observation']);

export function validateNmlsPolicyCommand(input) {
  if (!input || Array.isArray(input) || typeof input !== 'object' || !uuid(input.attemptId) || !uuid(input.eventId) ||
    !Number.isSafeInteger(input.expectedActorRevision) || input.expectedActorRevision < 0 ||
    !Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 0) fail('invalid_policy_request');
  if (input.studyReceipt !== undefined) validateNmlsStudyReceipt(input.studyReceipt);
  if (policyKinds.has(input.kind)) {
    const allowed = ['kind', 'attemptId', 'eventId', 'expectedActorRevision', 'expectedRevision', 'sessionId', 'studyReceipt'];
    if (input.kind === 'accept_rocs') allowed.push('version', 'documentDigest', 'acknowledged', 'presentationId');
    if (input.kind === 'recover_observation') {
      allowed.push('recoveryWindowId');
      if (!uuid(input.recoveryWindowId) || input.studyReceipt !== undefined) fail('invalid_policy_recovery');
    }
    if (Object.keys(input).some(k => !allowed.includes(k)) || !uuid(input.sessionId)) fail('invalid_policy_request');
    if (input.kind === 'accept_rocs' && (!uuid(input.presentationId) || input.version !== POLICY.rocsVersion ||
      !sha(input.documentDigest) || input.acknowledged !== true)) fail('invalid_policy_acknowledgment');
  } else {
    // Includes no clock, actor, offering, interval, replacement state or grade.
    const { expectedActorRevision, studyReceipt, ...review } = input;
    if (['start', 'list'].includes(review.kind)) fail('invalid_policy_request');
    validateNmlsReviewInput(review);
  }
  return input;
}

export function validateNmlsPolicyContext(context, studentId, course) {
  const binding = context?.binding, attempt = context?.attempt;
  if (!uuid(studentId) || attempt?.student_id !== studentId || binding?.grant_id !== attempt?.grant_id ||
    binding?.offering?.id !== attempt?.grant_id) fail('nmls_review_access_denied');
  if (binding.policy_id !== POLICY.id || binding.policy_digest !== NMLS_POLICY_DIGEST) fail('nmls_review_policy_version_conflict');
  if (attempt.course_key !== course.id || attempt.content_digest !== course.digest || binding.offering.contentDigest !== course.digest) {
    fail('nmls_review_content_changed');
  }
  validateNmlsAnnualWindow(binding.offering);
  const document = binding.offering.rocs;
  if (document?.version !== POLICY.rocsVersion || !sha(document.documentDigest) || document.fullDocumentVerified !== true ||
    typeof document.evidenceId !== 'string' || !document.evidenceId) fail('nmls_review_rocs_document_unverified');
  const row = context.actorPolicy;
  const ledger = row?.ledger ?? startNmlsSessionPolicy(studentId);
  if (row && (row.student_id !== studentId || row.policy_id !== POLICY.id || row.policy_digest !== NMLS_POLICY_DIGEST ||
    row.revision !== ledger.revision)) fail('nmls_review_policy_version_conflict');
  const at = Number(context.serverTimeMs);
  if (!Number.isSafeInteger(at) || at < 0 || at < ledger.lastReceiptMs || at < attempt.runtime.lastReceiptMs) fail('invalid_policy_server_evidence');
  return { ledger, offering: binding.offering, serverTimeMs: at };
}

export async function transactNmlsPolicyReview(input, studentId, { rpc, courseFor, evaluate, clockRetries = 1 }) {
  validateNmlsPolicyCommand(input);
  if (!uuid(studentId)) fail('invalid_authenticated_actor');
  if (typeof evaluate !== 'function') fail('nmls_policy_evaluator_not_connected');
  // Conservative response-time estimate: DB time plus the ENTIRE monotonic
  // request duration (including its initial roundtrip). Never extend a horizon
  // because a commit response or cold evaluator was slow; no browser clock.
  const requestStarted = performance.now();
  const context = await rpc('nmls_policy_context', { p_student_id: studentId, p_attempt_id: input.attemptId });
  const course = courseFor(context.attempt.course_key);
  const validated = validateNmlsPolicyContext(context, studentId, course);
  const { ledger, offering, serverTimeMs } = validated;
  let transition;
  // Exact retry is resolved in the locked SQL transaction BEFORE revision/lease
  // CAS. Do not re-evaluate a stale command, reissue a presentation or regrade.
  if (input.expectedActorRevision !== ledger.revision || input.expectedRevision !== context.attempt.revision) {
    transition = { ledger, runtime: context.attempt.runtime, outcome: {}, audit: {}, deliveryUntilMs: null };
  } else {
    const presentation = input.kind === 'accept_rocs' ? await rpc('nmls_policy_read_presentation', {
      p_student_id: studentId, p_attempt_id: input.attemptId, p_presentation_id: input.presentationId,
    }) : null;
    transition = await evaluate({ command: structuredClone(input), course,
      runtime: structuredClone(context.attempt.runtime), ledger: structuredClone(ledger),
      offering: structuredClone(offering), evidence: { actorId: studentId, receivedAtMs: serverTimeMs, presentation } });
  }
  let result;
  try {
    result = await rpc('nmls_policy_commit', {
      p_student_id: studentId, p_attempt_id: input.attemptId, p_event_id: input.eventId,
      // Only canonical user intent: no newly generated clock/evidence/UUID/state.
      p_command_digest: digestNmlsCommand(input), p_expected_revision: input.expectedRevision,
      p_expected_actor_revision: input.expectedActorRevision, p_expected_session_id: input.sessionId || null,
      p_evaluated_at_ms: serverTimeMs, p_policy_digest: NMLS_POLICY_DIGEST, p_content_digest: course.digest,
      p_initial_ledger: startNmlsSessionPolicy(studentId), p_ledger: transition.ledger, p_runtime: transition.runtime,
      p_outcome: compactNmlsReviewOutcome(transition.outcome), p_audit: transition.audit,
      p_delivery_until_ms: transition.deliveryUntilMs ?? null,
    });
  } catch (error) {
    if (clockRetries > 0 && String(error?.message).includes('nmls_review_clock_refresh_required')) {
      return transactNmlsPolicyReview(input, studentId, { rpc, courseFor, evaluate, clockRetries: clockRetries - 1 });
    }
    throw error;
  }
  const outcome = hydrateNmlsReviewOutcome(result.outcome, course);
  // Exact replay is historical, never a fresh delivery permit. Even before
  // HTTP integration, do not send old cached material after its horizon ends.
  const responseTimeUpperBound = serverTimeMs + Math.max(0, performance.now() - requestStarted);
  if (result.duplicate || outcome.deliveryAllowed !== true || !Number.isSafeInteger(outcome.deliveryUntilMs) ||
    outcome.deliveryUntilMs <= responseTimeUpperBound) {
    if (outcome.progress) { outcome.progress.lessons = []; outcome.progress.quiz = null; outcome.progress.feedback = null; }
    outcome.deliveryAllowed = false; outcome.deliveryUntilMs = null;
    if (Object.hasOwn(outcome, 'studyWindow')) outcome.studyWindow = null;
  }
  return { status: outcome.status, body: { ...outcome, attemptId: input.attemptId, duplicate: result.duplicate } };
}
