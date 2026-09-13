import { createHash } from 'node:crypto';
import { isDeepStrictEqual as same } from 'node:util';
import { makeNmlsSecondFinalReservationContext, createNmlsSecondFinalReservationEvaluator,
  validateNmlsSecondFinalReservationCommand, validateNmlsSecondFinalReservationHistory,
  validateNmlsSecondFinalReservationSelection } from '../../../lib/nmls-second-final-reservation.mjs';
import { nmlsTeachingPhaseScope } from '../../../lib/nmls-teaching-phase.mjs';
import { compactNmlsReviewOutcome, projectNmlsReview } from '../../../lib/nmls-review-runtime.mjs';
import { getNmlsDraftFinalDefinition } from '../../../lib/nmls-final-authoring-content.mjs';
import { getNmlsReviewCourse } from './nmls-review-content.mjs';
import { digestNmlsCommand } from './nmls-review-service.mjs';
import { validateNmlsPolicyContext } from './nmls-policy-transaction.mjs';

// PRIVATE composition only. No HTTP route imports this module. Reserving the
// second form does not activate an examination, expose a question, mint a
// session, authorize a third attempt, or issue CE credit. Original identity,
// source, completed child and actor policy are rechecked under038's locks.
const plain = v => v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;
const integer = v => Number.isSafeInteger(v) && v >= 0;
const uuid = v => typeof v === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
const exact = (v, keys) => plain(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
const without = (v, keys) => Object.fromEntries(Object.entries(v).filter(([k]) => !keys.includes(k)));
const fail = code => { throw new Error(`nmls_second_final_reservation_${code}`); };
const outcomeKeys = ['ok', 'code', 'status', 'reserved', 'firstFinalId', 'secondFinalId', 'finalRevision',
  'sourceRevision', 'workflowRevision', 'runtimeRevision', 'actorRevision', 'sessionId', 'teachingCode', 'policyCode',
  'observationCode', 'mode', 'deliveryAllowed', 'studentDeliveryEnabled', 'creditIssuanceAllowed', 'retakeEnabled'];
const policyCodes = new Set(['delivery_not_open', 'delivery_window_closed', 'rocs_document_unverified', 'rocs_required',
  'session_policy_allowed', 'break_in_progress', 'session_required', 'session_wall_limit', 'mandatory_break_required', 'rolling_study_limit']);
export const validateNmlsSecondFinalReservationInput = validateNmlsSecondFinalReservationCommand;

function derivedCommand(i) {
  return { kind: 'check_access', attemptId: i.attemptId, eventId: i.eventId, phaseKind: 'remediation',
    phaseOwnerId: i.firstFinalId, expectedSourceRevision: i.expectedSourceRevision,
    expectedWorkflowRevision: i.expectedWorkflowRevision, expectedRevision: i.expectedRevision,
    expectedActorRevision: i.expectedActorRevision, sessionId: i.sessionId };
}
function metadata(i, teaching, secondId) {
  const reserved = teaching.ok;
  return { ok: reserved, code: reserved ? 'private_second_final_reserved' : 'private_second_final_reservation_refused',
    status: reserved ? 200 : 409, reserved, firstFinalId: i.firstFinalId, secondFinalId: secondId,
    finalRevision: 2, sourceRevision: i.expectedSourceRevision,
    workflowRevision: i.expectedWorkflowRevision + (reserved ? 2 : 1), runtimeRevision: i.expectedRevision + 1,
    actorRevision: i.expectedActorRevision + 1, sessionId: i.sessionId, teachingCode: teaching.code,
    policyCode: teaching.policyCode, observationCode: teaching.observationCode, mode: 'private_authoring_review',
    deliveryAllowed: false, studentDeliveryEnabled: false, creditIssuanceAllowed: false, retakeEnabled: false };
}
function outcomeShape(o, i) {
  if (!exact(o, outcomeKeys) || typeof o.reserved !== 'boolean' || o.ok !== o.reserved ||
      o.code !== (o.reserved ? 'private_second_final_reserved' : 'private_second_final_reservation_refused') ||
      o.status !== (o.reserved ? 200 : 409) || o.firstFinalId !== i.firstFinalId ||
      (o.reserved ? !uuid(o.secondFinalId) || [i.firstFinalId, i.attemptId].includes(o.secondFinalId) : o.secondFinalId !== null) ||
      o.finalRevision !== 2 || o.sourceRevision !== i.expectedSourceRevision ||
      o.workflowRevision !== i.expectedWorkflowRevision + (o.reserved ? 2 : 1) ||
      o.runtimeRevision !== i.expectedRevision + 1 || o.actorRevision !== i.expectedActorRevision + 1 ||
      !integer(o.workflowRevision) || !integer(o.runtimeRevision) || !integer(o.actorRevision) || o.sessionId !== i.sessionId ||
      !policyCodes.has(o.policyCode) || o.reserved !== (o.policyCode === 'session_policy_allowed') ||
      (o.reserved ? !['review_policy_checked', 'session_policy_allowed'].includes(o.teachingCode) : o.teachingCode !== o.policyCode) ||
      !['study_observation_ready', 'outside_window_no_settlement'].includes(o.observationCode) ||
      ['delivery_not_open', 'delivery_window_closed'].includes(o.policyCode) !== (o.observationCode === 'outside_window_no_settlement') ||
      o.mode !== 'private_authoring_review' || o.deliveryAllowed !== false || o.studentDeliveryEnabled !== false ||
      o.creditIssuanceAllowed !== false || o.retakeEnabled !== false) fail('invalid_commit_response');
}
function layoutFor(course) {
  return course.modules.map(m => ({ id: m.id, units: m.units.map(u => ({ id: u.id,
    requiredMs: u.requiredSeconds * 1000, requiredActionIds: [u.actionQuestion.id] })),
    passPercent: m.quiz.passPercent, questionsPerAttempt: m.quiz.questionsPerAttempt }));
}
function historyInput(c, actorId, sourceCourse, definition) {
  return { actorId, sourceCourse, definition, review: c.attempt, binding: c.binding, firstFinal: c.reservedFinal,
    workflow: c.workflow, actorPolicy: c.actorPolicy, lease: c.lease, delivery: c.delivery,
    submissionEvent: c.genesisEvent, deliveryEvent: c.genesisDeliveryEvent, reservation: c.reservation,
    teachingEvent: c.teachingEvent, handoffOrigin: c.handoffOrigin, handoffOriginTeachingEvent: c.handoffOriginTeachingEvent,
    terminalChildEvent: c.terminalChildEvent, latestChildEvent: c.latestChildEvent, childBinding: c.childBinding };
}
function basicContext(c, actor, i, source, definition) {
  if (!plain(c) || c.attempt?.id !== i.attemptId || c.reservedFinal?.id !== i.firstFinalId ||
      !plain(c.actorPolicy) || !plain(c.workflow) || !plain(c.lease) ||
      ['secondReservationEvent', 'secondReservationTeachingEvent'].some(k => !Object.hasOwn(c, k) || c[k] !== null && !plain(c[k]))) fail('context_scope');
  const policy = validateNmlsPolicyContext(c, actor, source);
  const { digest, ...payload } = source;
  if (createHash('sha256').update(JSON.stringify(payload)).digest('hex') !== digest ||
      definition.sourcePayloadDigest !== digestNmlsCommand(source)) fail('source_changed');
  const history = validateNmlsSecondFinalReservationHistory(historyInput(c, actor, source, definition));
  if (policy.serverTimeMs < history.notBeforeMs || policy.serverTimeMs < c.workflow.runtime.lastReceiptMs) fail('invalid_server_time');
  return { ...policy, ...history };
}

function verifyReplay(c, result, actor, i, definition, history) {
  const e = c.secondReservationEvent, t = c.secondReservationTeachingEvent, o = result.outcome;
  if (!plain(e) || !plain(t) || e.student_id !== actor || e.event_id !== i.eventId ||
      e.review_attempt_id !== i.attemptId || e.first_final_id !== i.firstFinalId ||
      e.handoff_event_id !== c.handoffOrigin.event_id || e.terminal_event_id !== c.terminalChildEvent.event_id ||
      e.command_digest !== digestNmlsCommand(i) || e.teaching_command_digest !== digestNmlsCommand(derivedCommand(i)) ||
      e.definition_digest !== definition.digest || !same(e.phase_scope, history.phase) ||
      e.teaching_digest !== history.course.digest || !same(e.outcome, o) ||
      e.source_revision !== o.sourceRevision || e.final_revision !== 2 || e.workflow_before_revision !== i.expectedWorkflowRevision ||
      e.runtime_before_revision !== i.expectedRevision || e.actor_before_revision !== i.expectedActorRevision ||
      e.teaching_workflow_revision !== i.expectedWorkflowRevision + 1 || e.workflow_revision !== o.workflowRevision ||
      e.runtime_revision !== o.runtimeRevision || e.actor_revision !== o.actorRevision || e.session_id !== i.sessionId ||
      e.reserved !== o.reserved || e.second_id !== o.secondFinalId || !o.reserved && e.selection_digest !== null ||
      !integer(e.transaction_id) || e.transaction_id < 1 || t.student_id !== actor || t.event_id !== i.eventId ||
      t.review_attempt_id !== i.attemptId || t.phase_kind !== 'remediation' || t.phase_owner_id !== i.firstFinalId ||
      t.command_digest !== e.teaching_command_digest || t.transaction_id !== e.transaction_id ||
      t.source_revision !== o.sourceRevision || t.workflow_revision !== i.expectedWorkflowRevision + 1 ||
      t.runtime_revision !== o.runtimeRevision || t.actor_revision !== o.actorRevision ||
      !same(metadata(i, t.outcome ?? {}, o.secondFinalId), o) ||
      !same(t.lease_before, e.lease_before) || !same(t.lease_after, e.lease_after) ||
      c.attempt.revision < o.sourceRevision || c.workflow.revision < o.workflowRevision ||
      c.workflow.runtime.revision < o.runtimeRevision || c.actorPolicy.revision < o.actorRevision) fail('invalid_commit_response');
  const r = e.runtime, before = e.lease_before, old = e.runtime_before;
  if (!plain(r) || r.revision !== o.runtimeRevision || r.status !== 'review_complete' || r.sessionId !== i.sessionId ||
      !integer(r.lastReceiptMs) || r.lastReceiptMs < c.terminalChildEvent.audit.review.atMs ||
      r.lastReceiptMs > c.workflow.runtime.lastReceiptMs || r.lastReceiptMs > c.actorPolicy.ledger.lastReceiptMs ||
      r.lastReceiptMs > c.serverTimeMs ||
      !plain(old) || old.revision !== i.expectedRevision || !integer(old.lastReceiptMs) ||
      old.lastReceiptMs < c.terminalChildEvent.audit.review.atMs || old.lastReceiptMs > r.lastReceiptMs ||
      !same(without(old, ['revision', 'lastReceiptMs', 'feedback']), without(r, ['revision', 'lastReceiptMs', 'feedback'])) ||
      !same(without(r, ['revision', 'lastReceiptMs', 'feedback']), without(c.workflow.runtime, ['revision', 'lastReceiptMs', 'feedback'])) ||
      !same(r.feedback, o.reserved ? old.feedback : null) ||
      typeof e.recorded_at !== 'string' || typeof t.recorded_at !== 'string' ||
      !Number.isFinite(Date.parse(e.recorded_at)) || !Number.isFinite(Date.parse(t.recorded_at)) ||
      Date.parse(e.recorded_at) > c.serverTimeMs || Date.parse(t.recorded_at) > c.serverTimeMs ||
      Math.abs(Date.parse(e.recorded_at) - r.lastReceiptMs) > 1000 || Math.abs(Date.parse(t.recorded_at) - r.lastReceiptMs) > 1000 ||
      before?.student_id !== actor || before.attempt_id !== i.attemptId || before.session_id !== i.sessionId ||
      before.phase_kind !== 'remediation' || before.phase_owner_id !== i.firstFinalId || before.phase_active !== false ||
      !same(e.lease_after, before) || t.audit?.review?.kind !== 'check_access' ||
      t.audit.review.atMs !== r.lastReceiptMs || t.audit.policy?.kind !== 'check_access' ||
      t.audit.policy.atMs !== r.lastReceiptMs || t.audit.policy.actorId !== actor ||
      t.audit.policy.offeringId !== c.binding.offering.id || t.audit.policy.contentDigest !== c.attempt.content_digest ||
      t.audit.policy.policyId !== c.binding.policy_id || t.audit.policy.code !== o.policyCode ||
      Object.hasOwn(t.audit.policy, 'observation') || t.outcome.deliveryAllowed !== false || t.outcome.deliveryUntilMs !== null ||
      t.outcome.studyWindow !== null || t.outcome.studyRecovery !== null || t.outcome.teachingPhaseComplete !== true) fail('invalid_commit_response');
  const p = projectNmlsReview(r, history.course); p.lessons = []; p.quiz = null; p.feedback = null;
  const outside = o.observationCode === 'outside_window_no_settlement';
  const audit = { review: { kind: 'check_access', atMs: r.lastReceiptMs, ...(!o.reserved ? {
    reason: 'policy_delivery_stopped', invalidatedMs: 0, invalidatedUnitId: null, abandonedQuizId: null,
  } : {}) },
    policy: { kind: 'check_access', code: o.policyCode, atMs: r.lastReceiptMs, actorId: actor,
      offeringId: c.binding.offering.id, contentDigest: c.attempt.content_digest, policyId: c.binding.policy_id },
    observation: outside ? { reason: 'outside_window_preserved' } : { reason: 'no_prior_material', code: 'study_observation_ready' } };
  if (!same(t.outcome.progress, compactNmlsReviewOutcome({ progress: p }).progress) ||
      t.outcome.observationReady !== !outside || !same(t.audit, audit)) fail('invalid_commit_response');
  if (o.reserved) {
    validateNmlsSecondFinalReservationSelection(c.workflow.second_selection, { definition,
      firstSelection: c.reservedFinal.selection, reviewAttemptId: i.attemptId, expectedId: o.secondFinalId });
    if (c.workflow.second_id !== o.secondFinalId || e.selection_digest !== digestNmlsCommand(c.workflow.second_selection)) fail('invalid_commit_response');
  }
}

export async function transactNmlsSecondFinalReservation(input, studentId, {
  rpc, courseFor = getNmlsReviewCourse, definitionFor = getNmlsDraftFinalDefinition,
  evaluate = createNmlsSecondFinalReservationEvaluator(), clockRetries = 1,
} = {}) {
  validateNmlsSecondFinalReservationInput(input);
  if (!uuid(studentId)) fail('invalid_authenticated_actor');
  if ([rpc, courseFor, definitionFor, evaluate].some(fn => typeof fn !== 'function') || !integer(clockRetries) || clockRetries > 1) fail('invalid_dependencies');
  const intent = structuredClone(input), commandDigest = digestNmlsCommand(intent);
  const contextArgs = { p_student_id: studentId, p_attempt_id: intent.attemptId,
    p_first_final_id: intent.firstFinalId, p_event_id: intent.eventId };
  let candidate = null, candidateScope = null;
  for (let retry = 0; ; retry++) {
    const c = structuredClone(await rpc('nmls_second_final_reservation_context', structuredClone(contextArgs)));
    const source = structuredClone(courseFor(c?.attempt?.course_key));
    const definition = structuredClone(definitionFor(source.id));
    const history = basicContext(c, studentId, intent, source, definition), at = history.serverTimeMs;
    const stale = c.secondReservationEvent !== null || c.secondReservationTeachingEvent !== null ||
      c.attempt.revision !== intent.expectedSourceRevision || c.reservedFinal.revision !== 2 ||
      c.workflow.revision !== intent.expectedWorkflowRevision || c.workflow.runtime.revision !== intent.expectedRevision ||
      c.actorPolicy.revision !== intent.expectedActorRevision || c.workflow.status !== 'remediating' ||
      c.workflow.second_id !== null || c.workflow.runtime.sessionId !== intent.sessionId ||
      c.lease.attempt_id !== intent.attemptId || c.lease.phase_kind !== 'remediation' ||
      c.lease.phase_owner_id !== intent.firstFinalId || c.lease.session_id !== intent.sessionId || c.lease.phase_active !== false;
    let transition = {}, selection = null, expectedOutcome = null;
    if (!stale) {
      const context = makeNmlsSecondFinalReservationContext(historyInput(c, studentId, source, definition));
      const evidence = { actorId: studentId, receivedAtMs: at };
      // Isolate private loader/RPC/input references across awaits. The branded
      // phase tokens themselves must retain identity for the genuine evaluator.
      const evaluation = () => ({ ...context, course: structuredClone(context.course), runtime: structuredClone(context.runtime),
        ledger: structuredClone(context.ledger), offering: structuredClone(context.offering),
        sourceCourse: structuredClone(context.sourceCourse), definition: structuredClone(context.definition),
        sourceRuntime: structuredClone(context.sourceRuntime), firstSelection: structuredClone(context.firstSelection),
        firstAnswers: structuredClone(context.firstAnswers), command: structuredClone(intent), evidence: structuredClone(evidence) });
      const proposal = structuredClone(await evaluate(evaluation()));
      const form = proposal?.reservation?.selection;
      const expected = await createNmlsSecondFinalReservationEvaluator({ newId: () => form?.id,
        draw: () => structuredClone(form) })(evaluation());
      if (!same(proposal, expected) || proposal.reservation.reserved !== proposal.outcome.ok ||
          !same(proposal.command, derivedCommand(intent)) ||
          !same(nmlsTeachingPhaseScope(context.teachingPhase), history.phase)) fail('invalid_transition');
      const scope = digestNmlsCommand({ source, definition, intent, childRuntime: c.workflow.runtime });
      if (proposal.reservation.reserved) {
        if (candidateScope !== scope) { candidate = structuredClone(form); candidateScope = scope; }
        selection = structuredClone(candidate);
      }
      transition = { phase: history.phase, command: proposal.command, teachingDigest: context.course.digest,
        layout: layoutFor(context.course), runtime: proposal.runtime, ledger: proposal.ledger,
        outcome: compactNmlsReviewOutcome(proposal.outcome), audit: proposal.audit };
      expectedOutcome = structuredClone(metadata(intent, proposal.outcome, selection?.id ?? null));
      outcomeShape(expectedOutcome, intent);
    }
    let result;
    try {
      result = structuredClone(await rpc('nmls_second_final_reservation_commit', { ...contextArgs,
        p_command_digest: commandDigest, p_expected_source_revision: intent.expectedSourceRevision, p_expected_final_revision: 2,
        p_expected_workflow_revision: intent.expectedWorkflowRevision, p_expected_runtime_revision: intent.expectedRevision,
        p_expected_actor_revision: intent.expectedActorRevision, p_expected_session_id: intent.sessionId,
        p_evaluated_at_ms: at, p_definition_digest: definition.digest, p_definition: structuredClone(definition),
        p_intent: structuredClone(intent), p_second_id: selection?.id ?? null, p_selection: structuredClone(selection),
        p_transition: structuredClone(transition) }));
    } catch (error) {
      if (retry < clockRetries && /nmls_(?:second_final_reservation|first_final_handoff|first_final_submission|teaching|review)_clock_refresh_required/.test(String(error?.message))) continue;
      throw error;
    }
    if (!exact(result, ['duplicate', 'outcome']) || typeof result.duplicate !== 'boolean') fail('invalid_commit_response');
    outcomeShape(result.outcome, intent);
    if (!result.duplicate) {
      if (!expectedOutcome || !same(expectedOutcome, result.outcome)) fail('invalid_commit_response');
    } else {
      const historical = c.secondReservationEvent ? c : structuredClone(await rpc('nmls_second_final_reservation_context', structuredClone(contextArgs)));
      const validated = basicContext(historical, studentId, intent, source, definition);
      if (!same(validated.phase, history.phase)) fail('invalid_commit_response');
      verifyReplay(historical, result, studentId, intent, definition, validated);
    }
    return { status: result.outcome.status, body: { ...structuredClone(result.outcome), duplicate: result.duplicate } };
  }
}
