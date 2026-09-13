import { NMLS_SESSION_POLICY as POLICY } from '../../../config/nmls/session-policy.mjs';
import { startNmlsSessionPolicy } from '../../../lib/nmls-session-policy.mjs';
import { validateNmlsUncertainExposure } from '../../../lib/nmls-uncertain-exposure.mjs';
import { createNmlsObservedPolicyReviewEvaluator } from '../../../lib/nmls-study-observer.mjs';
import { makeNmlsSourceTeachingContext, makeNmlsRemediationTeachingContext,
  nmlsTeachingPhaseScope } from '../../../lib/nmls-teaching-phase.mjs';
import { compactNmlsReviewOutcome, hydrateNmlsReviewOutcome, projectNmlsReview } from '../../../lib/nmls-review-runtime.mjs';
import { getNmlsDraftFinalDefinition } from '../../../lib/nmls-final-authoring-content.mjs';
import { getNmlsReviewCourse } from './nmls-review-content.mjs';
import { digestNmlsCommand } from './nmls-review-service.mjs';
import { NMLS_POLICY_DIGEST, validateNmlsPolicyCommand, validateNmlsPolicyContext } from './nmls-policy-transaction.mjs';

// PRIVATE SERVER ADAPTER, intentionally not imported by an endpoint. Contexts
// are advisory; only the joint teaching RPC may authorize/commit a transition.
// No grant, first-final, remediation-child, second-form or credit creation here.
// Dependencies are trusted server/test injection, never request-selected code.
const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
const plain = value => value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
const integer = value => Number.isSafeInteger(value) && value >= 0;
const same = (a, b) => digestNmlsCommand(a) === digestNmlsCommand(b);
const fail = code => { throw new Error(`nmls_teaching_${code}`); };
const outcomeKeys = ['ok', 'code', 'status', 'progress', 'actorRevision', 'policyCode', 'observationReady',
  'deliveryAllowed', 'deliveryUntilMs', 'resumeNotBeforeMs', 'teachingPhaseComplete', 'observationCode',
  'studyWindow', 'studyRecovery'];
const progressKeys = ['mode', 'creditIssuanceAllowed', 'courseKey', 'title', 'contentDigest', 'revision', 'status',
  'sessionId', 'completedUnitIds', 'passedModuleIds', 'completedReviewMs', 'provisionalReviewMs', 'currentUnitId',
  'resumeRequired', 'currentUnitActionComplete', 'modules', 'lessons', 'quiz', 'feedback', 'notice'];

export function validateNmlsTeachingInput(input) {
  if (!plain(input) || !['source', 'remediation'].includes(input.phaseKind) || !uuid(input.phaseOwnerId) ||
      !integer(input.expectedSourceRevision) || !Object.hasOwn(input, 'expectedWorkflowRevision') ||
      (input.phaseKind === 'source' ? input.phaseOwnerId !== input.attemptId || input.expectedWorkflowRevision !== null :
        input.phaseOwnerId === input.attemptId || !integer(input.expectedWorkflowRevision) || input.expectedWorkflowRevision < 1)) {
    fail('invalid_request');
  }
  const { phaseKind, phaseOwnerId, expectedSourceRevision, expectedWorkflowRevision, ...policyCommand } = input;
  validateNmlsPolicyCommand(policyCommand);
  // The legacy resume validator intentionally ignores its prior lease. Keep
  // that rotation semantic, but never accept a non-UUID object as a SQL input.
  if (input.sessionId !== undefined && input.sessionId !== null && !uuid(input.sessionId)) fail('invalid_request');
  if (input.kind === 'quiz_submit' && (!plain(input.answers) ||
      Object.entries(input.answers).some(([id, choice]) => !/^[A-Za-z0-9-]{1,80}$/.test(id) || !['A', 'B', 'C', 'D'].includes(choice)))) {
    fail('invalid_answers');
  }
  return input;
}

function makeContext(context, studentId, sourceCourse, definition, phaseKind) {
  const input = { actorId: studentId, review: context.attempt, binding: context.binding, sourceCourse };
  return phaseKind === 'source' ? makeNmlsSourceTeachingContext(input) : makeNmlsRemediationTeachingContext({
    ...input, definition, firstFinal: context.firstFinal, workflow: context.workflow,
  });
}

function ledgerShape(ledger, studentId) {
  if (!plain(ledger) || ledger.actorId !== studentId || ledger.policyId !== POLICY.id ||
      ledger.creditIssuanceAllowed !== false || !integer(ledger.revision) || !integer(ledger.lastReceiptMs)) fail('invalid_actor_ledger');
  validateNmlsUncertainExposure(ledger.uncertainExposure);
}

// Deliberately tiny, source-derived SQL layout: no manuscript, answer key or
// client-selected timing. SQL uses this alongside the immutable teaching hash.
function layoutFor(course) {
  return course.modules.map(module => ({ id: module.id,
    units: module.units.map(unit => ({ id: unit.id, requiredMs: unit.requiredSeconds * 1000,
      requiredActionIds: [unit.actionQuestion.id] })),
    passPercent: module.quiz.passPercent, questionsPerAttempt: module.quiz.questionsPerAttempt,
  }));
}

function outcomeShape(outcome, course) {
  if (!plain(outcome) || Object.keys(outcome).some(key => !outcomeKeys.includes(key)) ||
      typeof outcome.ok !== 'boolean' || typeof outcome.code !== 'string' ||
      !Number.isInteger(outcome.status) || outcome.status < 200 || outcome.status > 599 ||
      !integer(outcome.actorRevision) || typeof outcome.deliveryAllowed !== 'boolean' ||
      typeof outcome.teachingPhaseComplete !== 'boolean' || !plain(outcome.progress)) fail('invalid_outcome');
  const progress = outcome.progress;
  if (Object.keys(progress).some(key => !progressKeys.includes(key)) ||
      progress.mode !== 'non_credit_review' || progress.creditIssuanceAllowed !== false ||
      progress.courseKey !== course.id || progress.contentDigest !== course.digest ||
      !integer(progress.revision) || !Array.isArray(progress.lessons)) fail('invalid_outcome');
}

function withholdMaterial(outcome) {
  outcome.progress.lessons = []; outcome.progress.quiz = null; outcome.progress.feedback = null;
  outcome.deliveryAllowed = false; outcome.deliveryUntilMs = null; outcome.studyWindow = null;
}

function validateTransition(transition, context, teaching, studentId, sourceCourse, definition, phaseKind, at, ledger) {
  if (!plain(transition) || !plain(transition.runtime) || !plain(transition.audit) ||
      transition.runtime.revision !== teaching.runtime.revision + 1 || transition.runtime.lastReceiptMs !== at) fail('invalid_transition');
  ledgerShape(transition.ledger, studentId);
  if (transition.ledger.revision !== ledger.revision + 1 || transition.ledger.lastReceiptMs !== at) fail('invalid_transition');
  const next = structuredClone(context);
  if (phaseKind === 'source') {
    next.attempt.runtime = transition.runtime; next.attempt.revision++;
  } else {
    next.workflow.runtime = transition.runtime; next.workflow.revision++;
  }
  next.actorPolicy = { student_id: studentId, policy_id: POLICY.id, policy_digest: NMLS_POLICY_DIGEST,
    revision: transition.ledger.revision, ledger: transition.ledger };
  // Validate ORIGINAL authority even when the proposed runtime is a child.
  validateNmlsPolicyContext(next, studentId, sourceCourse);
  const proposed = makeContext(next, studentId, sourceCourse, definition, phaseKind);
  if (!same(nmlsTeachingPhaseScope(proposed.teachingPhase), nmlsTeachingPhaseScope(teaching.teachingPhase)) ||
      proposed.course.digest !== teaching.course.digest) fail('transition_scope_changed');
  outcomeShape(transition.outcome, teaching.course);
  const outcome = transition.outcome;
  if (outcome.actorRevision !== transition.ledger.revision || outcome.teachingPhaseComplete !==
      (transition.runtime.status === 'review_complete') || outcome.deliveryUntilMs !== transition.deliveryUntilMs ||
      (outcome.deliveryAllowed ? !integer(transition.deliveryUntilMs) || transition.deliveryUntilMs <= at ||
        transition.deliveryUntilMs > Math.min(at + POLICY.maximumObservationMs, teaching.offering.closesAtMs) ||
        outcome.teachingPhaseComplete : transition.deliveryUntilMs !== null)) fail('invalid_transition');
  const expected = projectNmlsReview(transition.runtime, teaching.course);
  if (!outcome.deliveryAllowed) { expected.lessons = []; expected.quiz = null; expected.feedback = null; }
  // Terminal private grading feedback may remain in runtime/audit; only the
  // learner projection is blank. Do not erase it or reject valid completion.
  if (!same(compactNmlsReviewOutcome({ progress: expected }).progress,
      compactNmlsReviewOutcome(outcome).progress)) fail('outcome_runtime_changed');
}

export async function transactNmlsTeaching(input, studentId, {
  rpc, courseFor = getNmlsReviewCourse, definitionFor = getNmlsDraftFinalDefinition,
  evaluate = createNmlsObservedPolicyReviewEvaluator(), clockRetries = 1,
} = {}) {
  validateNmlsTeachingInput(input);
  if (!uuid(studentId)) fail('invalid_authenticated_actor');
  if ([rpc, courseFor, definitionFor, evaluate].some(fn => typeof fn !== 'function') ||
      !Number.isInteger(clockRetries) || clockRetries < 0 || clockRetries > 1) fail('invalid_dependencies');
  // Snapshot before any await: caller mutation cannot change canonical intent
  // between evaluation, SQL idempotency and response metadata.
  const command = structuredClone(input), commandDigest = digestNmlsCommand(command);
  const requestStarted = performance.now();
  for (let retry = 0; ; retry++) {
    const context = structuredClone(await rpc('nmls_teaching_context', { p_student_id: studentId,
      p_attempt_id: command.attemptId, p_phase_kind: command.phaseKind, p_phase_owner_id: command.phaseOwnerId }));
    if (!plain(context) || context.attempt?.id !== command.attemptId ||
        (command.phaseKind === 'source' ? context.firstFinal !== null || context.workflow !== null :
          context.firstFinal?.id !== command.phaseOwnerId || !plain(context.workflow))) fail('context_scope');
    const sourceCourse = courseFor(context.attempt.course_key);
    const { ledger, offering, serverTimeMs: at } = validateNmlsPolicyContext(context, studentId, sourceCourse);
    ledgerShape(ledger, studentId);
    const definition = command.phaseKind === 'remediation' ? definitionFor(sourceCourse.id) : null;
    const teaching = makeContext(context, studentId, sourceCourse, definition, command.phaseKind);
    if (at < teaching.runtime.lastReceiptMs) fail('invalid_server_time');
    const phase = nmlsTeachingPhaseScope(teaching.teachingPhase);
    if (phase.kind !== command.phaseKind || phase.ownerId !== command.phaseOwnerId) fail('context_scope');
    const stale = command.expectedSourceRevision !== context.attempt.revision ||
      command.expectedWorkflowRevision !== (context.workflow?.revision ?? null) ||
      command.expectedRevision !== teaching.runtime.revision || command.expectedActorRevision !== ledger.revision ||
      command.kind !== 'resume' && command.sessionId !== teaching.runtime.sessionId;
    let transition = { ledger, runtime: teaching.runtime, outcome: {}, audit: {}, deliveryUntilMs: null };
    if (!stale) {
      const presentation = command.kind === 'accept_rocs' ? await rpc('nmls_policy_read_presentation', {
        p_student_id: studentId, p_attempt_id: command.attemptId, p_presentation_id: command.presentationId,
      }) : null;
      transition = await evaluate({ teachingPhase: teaching.teachingPhase,
        command: structuredClone(command), course: structuredClone(teaching.course), runtime: structuredClone(teaching.runtime),
        ledger: structuredClone(ledger), offering: structuredClone(offering),
        evidence: { actorId: studentId, receivedAtMs: at, presentation: structuredClone(presentation) } });
      validateTransition(transition, context, teaching, studentId, sourceCourse, definition, command.phaseKind, at, ledger);
    }
    let result;
    try {
      result = await rpc('nmls_teaching_commit', {
        p_student_id: studentId, p_attempt_id: command.attemptId, p_event_id: command.eventId,
        p_command_digest: commandDigest, p_phase: phase, p_teaching_digest: teaching.course.digest,
        p_layout: layoutFor(teaching.course), p_expected_source_revision: command.expectedSourceRevision,
        p_expected_workflow_revision: command.expectedWorkflowRevision, p_expected_runtime_revision: command.expectedRevision,
        p_expected_actor_revision: command.expectedActorRevision, p_expected_session_id: command.sessionId ?? null,
        p_evaluated_at_ms: at, p_initial_ledger: startNmlsSessionPolicy(studentId),
        p_ledger: transition.ledger, p_runtime: transition.runtime,
        p_outcome: compactNmlsReviewOutcome(transition.outcome), p_audit: transition.audit,
        p_delivery_until_ms: transition.deliveryUntilMs,
      });
    } catch (error) {
      if (retry < clockRetries && /nmls_(?:review|teaching)_clock_refresh_required/.test(String(error?.message))) continue;
      throw error;
    }
    if (!plain(result) || typeof result.duplicate !== 'boolean' || !integer(result.sourceRevision) ||
        (command.phaseKind === 'source' ? result.workflowRevision !== null : !integer(result.workflowRevision))) fail('invalid_commit_response');
    outcomeShape(result.outcome, teaching.course);
    const outcome = structuredClone(result.outcome);
    // DB time + ENTIRE monotonic request duration intentionally overestimates
    // response time, including context/presentation/commit and one clock retry.
    const beforeHydration = performance.now();
    const responseTimeUpperBound = at + Math.max(0, beforeHydration - requestStarted);
    if (result.duplicate || outcome.deliveryAllowed !== true || !integer(outcome.deliveryUntilMs) ||
        !Number.isFinite(beforeHydration) || beforeHydration < requestStarted ||
        outcome.deliveryUntilMs <= responseTimeUpperBound) {
      withholdMaterial(outcome);
    }
    // Hydrate only committed, still-permitted references, never tentative work
    // or private source/first-final/workflow rows returned by context.
    const hydrated = hydrateNmlsReviewOutcome(outcome, teaching.course);
    // Hydration is part of this same request, not free time after permission.
    // Recheck the original DB time plus the ENTIRE monotonic duration, including
    // any clock refresh. Redaction changes only the response, never saved state.
    const afterHydration = performance.now();
    if (!Number.isFinite(afterHydration) || afterHydration < beforeHydration ||
        !integer(hydrated.deliveryUntilMs) || hydrated.deliveryUntilMs <= at + Math.max(0, afterHydration - requestStarted)) {
      withholdMaterial(hydrated);
    }
    return { status: outcome.status, body: { ...hydrated,
      attemptId: command.attemptId, phaseKind: command.phaseKind, phaseOwnerId: command.phaseOwnerId,
      sourceRevision: result.sourceRevision, workflowRevision: result.workflowRevision, duplicate: result.duplicate } };
  }
}
