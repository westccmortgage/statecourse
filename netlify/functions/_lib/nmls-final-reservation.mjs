import { randomUUID } from 'node:crypto';
import { NMLS_SESSION_POLICY as POLICY } from '../../../config/nmls/session-policy.mjs';
import { startNmlsSessionPolicy } from '../../../lib/nmls-session-policy.mjs';
import { validateNmlsUncertainExposure } from '../../../lib/nmls-uncertain-exposure.mjs';
import { createNmlsObservedPolicyReviewEvaluator } from '../../../lib/nmls-study-observer.mjs';
import { makeNmlsSourceTeachingContext, nmlsTeachingPhaseScope } from '../../../lib/nmls-teaching-phase.mjs';
import { compactNmlsReviewOutcome, projectNmlsReview } from '../../../lib/nmls-review-runtime.mjs';
import { drawNmlsDraftFinal, projectNmlsDraftFinal, requireNmlsFinalReviewCompletion } from '../../../lib/nmls-final-assessment.mjs';
import { getNmlsDraftFinalDefinition } from '../../../lib/nmls-final-authoring-content.mjs';
import { getNmlsReviewCourse } from './nmls-review-content.mjs';
import { digestNmlsCommand } from './nmls-review-service.mjs';
import { NMLS_POLICY_DIGEST, validateNmlsPolicyContext } from './nmls-policy-transaction.mjs';

// PRIVATE SERVER COMPOSITION ONLY, not imported by any HTTP handler. A reserved
// form is NOT an exam activation or delivery permit. No question projection,
// answers, grade, child workflow, new session, attendance or credit leaves here.
const fail = code => { throw new Error(`nmls_final_${code}`); };
const plain = value => value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
const integer = value => Number.isSafeInteger(value) && value >= 0;
const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
const same = (a, b) => digestNmlsCommand(a) === digestNmlsCommand(b);
const without = (value, keys) => Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
const exact = (value, keys) => plain(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const inputKeys = ['kind', 'attemptId', 'eventId', 'expectedSourceRevision', 'expectedActorRevision', 'expectedFinalRevision', 'sessionId'];
const outcomeKeys = ['ok', 'code', 'status', 'reserved', 'finalAttemptId', 'finalRevision', 'sourceRevision', 'actorRevision',
  'mode', 'studentDeliveryEnabled', 'creditIssuanceAllowed'];
const denialCodes = ['delivery_not_open', 'delivery_window_closed', 'rocs_document_unverified', 'rocs_required',
  'break_in_progress', 'session_required', 'session_wall_limit', 'mandatory_break_required', 'rolling_study_limit'];
const teachingOutcomeKeys = ['ok', 'code', 'status', 'progress', 'actorRevision', 'policyCode', 'observationReady',
  'deliveryAllowed', 'deliveryUntilMs', 'resumeNotBeforeMs', 'teachingPhaseComplete', 'observationCode', 'studyWindow', 'studyRecovery'];

export function validateNmlsFinalReservationInput(input) {
  if (!exact(input, inputKeys) || input.kind !== 'reserve_first_final' || !uuid(input.attemptId) || !uuid(input.eventId) ||
      !uuid(input.sessionId) || !integer(input.expectedSourceRevision) || !integer(input.expectedActorRevision) ||
      input.expectedFinalRevision !== 0) fail('invalid_request');
  return input;
}

function actorShape(ledger, actor) {
  if (!plain(ledger) || ledger.actorId !== actor || ledger.policyId !== POLICY.id || ledger.creditIssuanceAllowed !== false ||
      !integer(ledger.revision) || !integer(ledger.lastReceiptMs)) fail('invalid_actor_ledger');
  validateNmlsUncertainExposure(ledger.uncertainExposure);
}

function emptyJournal(ledger, actor) {
  const journal = ledger.observationJournal;
  if (!plain(journal) || journal.version !== 'nmls-study-windows-v3-phase' || journal.actorId !== actor ||
      journal.active !== null || journal.unresolved !== null) fail('observation_hold');
}

function layoutFor(course) {
  return course.modules.map(module => ({ id: module.id,
    units: module.units.map(unit => ({ id: unit.id, requiredMs: unit.requiredSeconds * 1000,
      requiredActionIds: [unit.actionQuestion.id] })),
    passPercent: module.quiz.passPercent, questionsPerAttempt: module.quiz.questionsPerAttempt,
  }));
}

function validateTransition(transition, context, source, teaching, definition, actor, at, ledger) {
  if (!plain(transition) || !plain(transition.runtime) || !plain(transition.audit) ||
      transition.runtime.revision !== teaching.runtime.revision + 1 || transition.runtime.lastReceiptMs !== at ||
      !same(without(transition.runtime, ['revision', 'lastReceiptMs', 'feedback']),
        without(teaching.runtime, ['revision', 'lastReceiptMs', 'feedback']))) fail('invalid_transition');
  actorShape(transition.ledger, actor); emptyJournal(transition.ledger, actor);
  if (transition.ledger.revision !== ledger.revision + 1 || transition.ledger.lastReceiptMs !== at ||
      !same(without(transition.ledger, ['revision', 'lastReceiptMs', 'studyIntervals', 'uncertainExposure', 'observationJournal']),
        without(ledger, ['revision', 'lastReceiptMs', 'studyIntervals', 'uncertainExposure', 'observationJournal']))) fail('invalid_transition');
  const next = structuredClone(context);
  next.attempt.runtime = transition.runtime; next.attempt.revision++;
  next.actorPolicy = { student_id: actor, policy_id: POLICY.id, policy_digest: NMLS_POLICY_DIGEST,
    revision: transition.ledger.revision, ledger: transition.ledger };
  validateNmlsPolicyContext(next, actor, source);
  const proposed = makeNmlsSourceTeachingContext({ actorId: actor, review: next.attempt, binding: next.binding, sourceCourse: source });
  requireNmlsFinalReviewCompletion(definition, proposed.runtime);
  if (!same(nmlsTeachingPhaseScope(proposed.teachingPhase), nmlsTeachingPhaseScope(teaching.teachingPhase))) fail('context_changed');
  const outcome = transition.outcome;
  if (!plain(outcome) || Object.keys(outcome).some(key => !teachingOutcomeKeys.includes(key)) ||
      teachingOutcomeKeys.filter(key => key !== 'resumeNotBeforeMs').some(key => !Object.hasOwn(outcome, key)) ||
      Object.hasOwn(outcome, 'resumeNotBeforeMs') && !integer(outcome.resumeNotBeforeMs) ||
      outcome.actorRevision !== transition.ledger.revision ||
      outcome.deliveryAllowed !== false || outcome.deliveryUntilMs !== null || transition.deliveryUntilMs !== null ||
      outcome.studyWindow !== null || outcome.studyRecovery !== null || outcome.teachingPhaseComplete !== true) fail('invalid_transition');
  const expected = projectNmlsReview(transition.runtime, source);
  expected.lessons = []; expected.quiz = null; expected.feedback = null;
  if (!same(compactNmlsReviewOutcome({ progress: expected }).progress, outcome.progress)) fail('invalid_projection');
  if (outcome.ok === true) {
    if (outcome.status !== 200 || !['review_policy_checked', 'session_policy_allowed'].includes(outcome.code) ||
        outcome.policyCode !== 'session_policy_allowed' || outcome.observationReady !== true ||
        !same(transition.runtime.feedback, teaching.runtime.feedback)) fail('invalid_reservation_access');
  } else if (outcome.ok !== false || outcome.status !== 409 || !denialCodes.includes(outcome.code) ||
      outcome.policyCode !== outcome.code || transition.runtime.feedback !== null) fail('invalid_reservation_denial');
}

function validateResult(result, command) {
  if (!exact(result, ['duplicate', 'outcome']) || typeof result.duplicate !== 'boolean' || !exact(result.outcome, outcomeKeys)) {
    fail('invalid_commit_response');
  }
  const o = result.outcome;
  if (o.mode !== 'private_authoring_review' || o.studentDeliveryEnabled !== false || o.creditIssuanceAllowed !== false ||
      !integer(o.sourceRevision) || o.sourceRevision < 1 || !integer(o.actorRevision) || o.actorRevision < 1 ||
      (!result.duplicate && (o.sourceRevision !== command.expectedSourceRevision + 1 || o.actorRevision !== command.expectedActorRevision + 1)) ||
      (o.reserved === true ? o.ok !== true || o.status !== 200 || o.code !== 'private_final_reserved' || !uuid(o.finalAttemptId) || o.finalRevision !== 1 :
        o.reserved !== false || o.ok !== false || o.status !== 409 || !denialCodes.includes(o.code) || o.finalAttemptId !== null || o.finalRevision !== null)) {
    fail('invalid_commit_response');
  }
}

export async function transactNmlsFinalReservation(input, studentId, {
  rpc, courseFor = getNmlsReviewCourse, definitionFor = getNmlsDraftFinalDefinition,
  evaluate = createNmlsObservedPolicyReviewEvaluator(), draw = drawNmlsDraftFinal, clockRetries = 1,
} = {}) {
  validateNmlsFinalReservationInput(input);
  if (!uuid(studentId)) fail('invalid_authenticated_actor');
  if ([rpc, courseFor, definitionFor, evaluate, draw].some(fn => typeof fn !== 'function') ||
      !integer(clockRetries) || clockRetries > 1) fail('invalid_dependencies');
  const command = structuredClone(input), commandDigest = digestNmlsCommand(command);
  let candidate = null;
  for (let retry = 0; ; retry++) {
    const context = structuredClone(await rpc('nmls_final_reservation_context', { p_student_id: studentId,
      p_attempt_id: command.attemptId, p_event_id: command.eventId }));
    if (!plain(context) || context.attempt?.id !== command.attemptId || context.firstFinal !== null || context.workflow !== null ||
        ['reservedFinal', 'reservation', 'teachingEvent'].some(key => !Object.hasOwn(context, key) ||
          context[key] !== null && !plain(context[key]))) fail('context_scope');
    const source = structuredClone(courseFor(context.attempt.course_key));
    const { ledger, offering, serverTimeMs: at } = validateNmlsPolicyContext(context, studentId, source);
    actorShape(ledger, studentId);
    const teaching = makeNmlsSourceTeachingContext({ actorId: studentId, review: context.attempt, binding: context.binding, sourceCourse: source });
    const definition = structuredClone(definitionFor(source.id));
    if (definition?.courseKey !== source.id || definition.contentDigest !== source.digest ||
        definition.sourcePayloadDigest !== digestNmlsCommand(source)) fail('content_changed');
    requireNmlsFinalReviewCompletion(definition, teaching.runtime);
    const row = context.reservedFinal;
    if (row && (row.review_attempt_id !== command.attemptId || row.student_id !== studentId || row.course_key !== source.id ||
        row.content_digest !== source.digest || row.definition_digest !== definition.digest)) fail('history_scope_conflict');
    // Advisory history/stale snapshots never draw, reduce or repair history.
    // SQL checks paired immutable receipts BEFORE CAS and rejects any half-pair.
    const stale = context.reservation !== null || context.teachingEvent !== null || row !== null ||
      context.attempt.revision !== command.expectedSourceRevision || ledger.revision !== command.expectedActorRevision ||
      teaching.runtime.sessionId !== command.sessionId;
    let payload = {}, finalId = null, selection = null;
    if (!stale) {
      emptyJournal(ledger, studentId);
      const check = { kind: 'check_access', attemptId: command.attemptId, eventId: command.eventId,
        expectedRevision: command.expectedSourceRevision, expectedSourceRevision: command.expectedSourceRevision,
        expectedWorkflowRevision: null, expectedActorRevision: command.expectedActorRevision, sessionId: command.sessionId };
      const transition = await evaluate({ teachingPhase: teaching.teachingPhase, command: check,
        course: structuredClone(source), runtime: structuredClone(teaching.runtime), ledger: structuredClone(ledger),
        offering: structuredClone(offering), evidence: { actorId: studentId, receivedAtMs: at, presentation: null } });
      validateTransition(transition, context, source, teaching, definition, studentId, at, ledger);
      payload = { phase: nmlsTeachingPhaseScope(teaching.teachingPhase), teachingDigest: source.digest, layout: layoutFor(source),
        initialLedger: startNmlsSessionPolicy(studentId), ledger: transition.ledger, runtime: transition.runtime,
        outcome: compactNmlsReviewOutcome(transition.outcome), audit: transition.audit, deliveryUntilMs: null };
      if (transition.outcome.ok) {
        const scope = digestNmlsCommand({ source, definition, reviewId: command.attemptId, revision: command.expectedSourceRevision });
        if (candidate?.scope !== scope) {
          const id = randomUUID();
          const form = structuredClone(draw(definition, { id, reviewAttemptId: command.attemptId, reviewState: teaching.runtime }));
          if (!exact(form, ['schema', 'id', 'reviewAttemptId', 'definitionDigest', 'number', 'questionIds', 'optionOrder']) ||
              form.id !== id || form.reviewAttemptId !== command.attemptId || form.number !== 1) fail('invalid_selection');
          // Validate all bank IDs, quotas and options server-side. Discard the
          // projection immediately: it is never returned or persisted in receipts.
          projectNmlsDraftFinal(definition, form);
          candidate = { scope, id, form };
        }
        finalId = candidate.id; selection = structuredClone(candidate.form);
      }
    }
    let result;
    try {
      result = await rpc('nmls_final_reservation_commit', { p_student_id: studentId, p_attempt_id: command.attemptId,
        p_event_id: command.eventId, p_command_digest: commandDigest, p_expected_source_revision: command.expectedSourceRevision,
        p_expected_actor_revision: command.expectedActorRevision, p_expected_session_id: command.sessionId,
        p_evaluated_at_ms: at, p_definition_digest: definition.digest, p_final_id: finalId, p_selection: selection, p_transition: payload });
    } catch (error) {
      if (retry < clockRetries && /nmls_(?:final|review|teaching)_clock_refresh_required/.test(String(error?.message))) continue;
      throw error;
    }
    validateResult(result, command);
    return { status: result.outcome.status, body: { ...structuredClone(result.outcome), attemptId: command.attemptId, duplicate: result.duplicate } };
  }
}
