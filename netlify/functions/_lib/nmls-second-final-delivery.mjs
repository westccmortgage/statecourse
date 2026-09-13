import { isDeepStrictEqual as same } from 'node:util';
import { createNmlsSecondFinalDeliveryEvaluator, startNmlsSecondFinalDelivery,
  validateNmlsSecondFinalDeliveryCommand, makeNmlsSecondFinalDeliveryContext,
  validateNmlsSecondFinalDeliveryHistory } from '../../../lib/nmls-second-final-delivery.mjs';
import { projectNmlsDraftFinal } from '../../../lib/nmls-final-assessment.mjs';
import { getNmlsDraftFinalDefinition } from '../../../lib/nmls-final-authoring-content.mjs';
import { getNmlsReviewCourse } from './nmls-review-content.mjs';
import { digestNmlsCommand } from './nmls-review-service.mjs';
import { validateNmlsPolicyContext } from './nmls-policy-transaction.mjs';

// PRIVATE039 adapter: no HTTP import, no approved student delivery or credit.
// Only the committed second sidecar can yield a fresh, bounded form projection.
// Original source, sealed first final and completed child never change here.
const plain = v => v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;
const uuid = v => typeof v === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
const integer = v => Number.isSafeInteger(v) && v >= 0;
const exact = (v, keys) => plain(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
const fail = code => { throw new Error(`nmls_second_final_delivery_${code}`); };
const outcomeKeys = ['ok', 'code', 'status', 'finalAttemptId', 'finalRevision', 'revision', 'actorRevision', 'runtimeStatus',
  'candidateMaterialAllowed', 'candidateUntilMs', 'candidateWindow', 'recovery', 'resumeNotBeforeMs', 'policyCode',
  'observationCode', 'mode', 'deliveryAllowed', 'studentDeliveryEnabled', 'creditIssuanceAllowed'];
const runtimeKeys = ['version', 'finalAttemptId', 'phaseDigest', 'revision', 'status', 'sessionId', 'lastActivityMs', 'lastReceiptMs', 'creditIssuanceAllowed'];
// Closed protocol vocabulary: historical metadata is not a free-text channel.
const policyCodes = new Set(['delivery_not_open', 'delivery_window_closed', 'rocs_document_unverified',
  'rocs_acknowledgment_required', 'rocs_already_accepted', 'rocs_presentation_required', 'rocs_accepted', 'rocs_required',
  'recovery_context_allowed', 'break_started', 'break_not_started', 'break_incomplete', 'break_completed', 'break_in_progress',
  'session_required', 'session_wall_limit', 'mandatory_break_required', 'rolling_study_limit', 'session_policy_allowed',
  'invalid_study_interval', 'overlapping_study_interval', 'study_interval_recorded']);
const observationCodes = new Set(['observation_unresolved', 'observation_ready', 'material_acknowledged', 'receipt_continuous',
  'outside_window_no_settlement', 'session_interrupted', 'material_revision_interrupted', 'receipt_missing_or_stale',
  'visibility_interrupted', 'horizon_expired', 'receipt_gap', 'settlement_rejected']);
const outcomeCodes = new Set([...policyCodes, ...observationCodes, 'inactivity_logout', 'observation_recovered',
  'recovery_review_required', 'final_logged_out', 'final_paused', 'final_session_opened', 'final_activity_checked']);

export function validateNmlsSecondFinalDeliveryInput(input) {
  if (!plain(input) || !uuid(input.attemptId) || !uuid(input.firstFinalId) || !uuid(input.secondFinalId) ||
      new Set([input.attemptId, input.firstFinalId, input.secondFinalId]).size !== 3 ||
      !integer(input.expectedSourceRevision) || input.expectedSourceRevision < 1 || input.expectedFinalRevision !== 2 ||
      !integer(input.expectedWorkflowRevision) || input.expectedWorkflowRevision < 1) fail('invalid_request');
  const { attemptId, firstFinalId, secondFinalId, expectedSourceRevision, expectedFinalRevision, expectedWorkflowRevision, ...command } = input;
  validateNmlsSecondFinalDeliveryCommand(command);
  if (command.kind === 'accept_rocs' && !uuid(command.presentationId)) fail('presentation_required');
  return input;
}

function outcomeShape(o, finalId) {
  if (!exact(o, outcomeKeys) || typeof o.ok !== 'boolean' || !outcomeCodes.has(o.code) ||
      ![200, 401, 409].includes(o.status) || o.finalAttemptId !== finalId || o.finalRevision !== 2 ||
      !integer(o.revision) || o.revision < 1 || !integer(o.actorRevision) || o.actorRevision < 1 ||
      !['reserved', 'active', 'paused', 'logged_out'].includes(o.runtimeStatus) ||
      typeof o.candidateMaterialAllowed !== 'boolean' || o.deliveryAllowed !== false ||
      o.mode !== 'private_transition_candidate' || o.studentDeliveryEnabled !== false || o.creditIssuanceAllowed !== false ||
      !policyCodes.has(o.policyCode) || !observationCodes.has(o.observationCode) ||
      o.resumeNotBeforeMs !== null && !integer(o.resumeNotBeforeMs) ||
      o.recovery !== null && (!exact(o.recovery, ['windowId', 'eligibleAtMs']) || !uuid(o.recovery.windowId) || !integer(o.recovery.eligibleAtMs)) ||
      (o.candidateMaterialAllowed ? o.ok !== true || o.status !== 200 || o.runtimeStatus !== 'active' ||
        !integer(o.candidateUntilMs) || !exact(o.candidateWindow, ['id', 'expiresAtMs']) || !uuid(o.candidateWindow.id) ||
        o.candidateWindow.expiresAtMs !== o.candidateUntilMs || o.recovery !== null :
        o.candidateUntilMs !== null || o.candidateWindow !== null)) fail('invalid_outcome');
}

function runtimeShape(runtime, phase) {
  if (!exact(runtime, runtimeKeys) || runtime.version !== 'nmls-second-final-delivery-v1' ||
      runtime.finalAttemptId !== phase.finalAttemptId || runtime.phaseDigest !== digestNmlsCommand(phase) ||
      !integer(runtime.revision) || !integer(runtime.lastReceiptMs) || runtime.creditIssuanceAllowed !== false ||
      !['reserved', 'active', 'paused', 'logged_out'].includes(runtime.status) ||
      runtime.sessionId !== null && !uuid(runtime.sessionId) || runtime.lastActivityMs !== null &&
        (!integer(runtime.lastActivityMs) || runtime.lastActivityMs > runtime.lastReceiptMs) ||
      (runtime.sessionId === null) !== (runtime.lastActivityMs === null) ||
      runtime.status === 'reserved' && runtime.sessionId !== null || runtime.status === 'active' && runtime.sessionId === null) fail('invalid_runtime');
}


function historyInput(context, studentId, sourceCourse, definition) {
  return { actorId: studentId, sourceCourse, definition, review: context.attempt, binding: context.binding,
    firstFinal: context.reservedFinal, workflow: context.workflow, actorPolicy: context.actorPolicy, lease: context.lease,
    delivery: context.delivery, submissionEvent: context.genesisEvent, deliveryEvent: context.genesisDeliveryEvent,
    reservation: context.reservation, teachingEvent: context.teachingEvent,
    handoffOrigin: context.handoffOrigin, handoffOriginTeachingEvent: context.handoffOriginTeachingEvent,
    terminalChildEvent: context.terminalChildEvent, latestChildEvent: context.latestChildEvent, childBinding: context.childBinding,
    secondReservationEvent: context.secondReservationOrigin,
    secondReservationTeachingEvent: context.secondReservationOriginTeachingEvent };
}

export async function transactNmlsSecondFinalDelivery(input, studentId, {
  rpc, courseFor = getNmlsReviewCourse, definitionFor = getNmlsDraftFinalDefinition,
  evaluate = createNmlsSecondFinalDeliveryEvaluator(), clockRetries = 1, monotonicMs = () => performance.now(),
} = {}) {
  validateNmlsSecondFinalDeliveryInput(input);
  if (!uuid(studentId)) fail('invalid_authenticated_actor');
  if ([rpc, courseFor, definitionFor, evaluate, monotonicMs].some(fn => typeof fn !== 'function') ||
      !integer(clockRetries) || clockRetries > 1) fail('invalid_dependencies');
  const intent = structuredClone(input), commandDigest = digestNmlsCommand(intent);
  const { attemptId, firstFinalId, secondFinalId, expectedSourceRevision, expectedFinalRevision, expectedWorkflowRevision, ...command } = intent;
  const args = { p_student_id: studentId, p_attempt_id: attemptId, p_first_final_id: firstFinalId,
    p_second_final_id: secondFinalId, p_event_id: command.eventId };
  const started = monotonicMs();
  if (!Number.isFinite(started) || started < 0) fail('invalid_server_clock');
  for (let retry = 0; ; retry++) {
    const context = structuredClone(await rpc('nmls_second_final_delivery_context', structuredClone(args)));
    if (!plain(context) || context.attempt?.id !== attemptId || context.reservedFinal?.id !== firstFinalId ||
        context.workflow?.second_id !== secondFinalId || !integer(context.workflow?.revision) ||
        ['secondDelivery', 'secondDeliveryEvent'].some(k => !Object.hasOwn(context, k) ||
          context[k] !== null && !plain(context[k]))) fail('context_scope');
    const sourceCourse = structuredClone(courseFor(context.attempt.course_key));
    const definition = structuredClone(definitionFor(sourceCourse.id));
    const { ledger, serverTimeMs: at } = validateNmlsPolicyContext(context, studentId, sourceCourse);
    const history = historyInput(context, studentId, sourceCourse, definition);
    // Stale/replayed delivery remains readable after the workflow is terminal.
    // History verification never evaluates, regrades, draws or opens a session.
    const { phase } = validateNmlsSecondFinalDeliveryHistory(history);
    const row = context.secondDelivery;
    if (row && (row.second_id !== secondFinalId || row.first_final_id !== firstFinalId || row.student_id !== studentId ||
        row.review_attempt_id !== attemptId || !same(row.phase_scope, phase) || !integer(row.revision) ||
        row.revision < 1 || row.runtime?.revision !== row.revision)) fail('sidecar_scope');
    if (row) runtimeShape(row.runtime, phase);
    const stale = context.secondDeliveryEvent !== null || expectedSourceRevision !== context.attempt.revision ||
      expectedFinalRevision !== context.reservedFinal.revision || expectedWorkflowRevision !== context.workflow.revision ||
      command.expectedRevision !== (row?.revision ?? 0) || command.expectedActorRevision !== ledger.revision ||
      command.sessionId !== (row?.runtime.sessionId ?? null) || context.workflow.status !== 'second_issued';
    let transition = null, payload = {}, expectedFresh = null;
    if (!stale) {
      const final = makeNmlsSecondFinalDeliveryContext(history);
      const runtime = structuredClone(row?.runtime ?? startNmlsSecondFinalDelivery(final.finalPhase));
      runtimeShape(runtime, phase);
      const presentation = command.kind === 'accept_rocs' ? structuredClone(await rpc('nmls_policy_read_presentation', {
        p_student_id: studentId, p_attempt_id: attemptId, p_presentation_id: command.presentationId,
      })) : null;
      const evidence = { actorId: studentId, receivedAtMs: at, presentation };
      transition = structuredClone(await evaluate({ ...final, runtime: structuredClone(runtime), ledger: structuredClone(ledger),
        command: structuredClone(command), evidence: structuredClone(evidence) }));
      if (!exact(transition, ['runtime', 'ledger', 'outcome', 'audit'])) fail('invalid_transition');
      const expected = createNmlsSecondFinalDeliveryEvaluator({
        newSessionId: () => transition.runtime?.sessionId,
        newWindowId: () => transition.ledger?.observationJournal?.active?.id,
      })({ ...final, runtime, ledger, command, evidence });
      if (!same(transition, expected)) fail('invalid_transition');
      outcomeShape(transition.outcome, secondFinalId); runtimeShape(transition.runtime, phase);
      payload = { phase, command, ...transition };
      expectedFresh = structuredClone(transition);
    }
    let result;
    try {
      result = structuredClone(await rpc('nmls_second_final_delivery_commit', {
        ...args, p_command_digest: commandDigest, p_expected_source_revision: expectedSourceRevision,
        p_expected_final_revision: expectedFinalRevision, p_expected_workflow_revision: expectedWorkflowRevision,
        p_expected_delivery_revision: command.expectedRevision, p_expected_actor_revision: command.expectedActorRevision,
        p_expected_session_id: command.sessionId, p_evaluated_at_ms: at, p_definition_digest: definition.digest,
        p_definition: structuredClone(definition), p_transition: structuredClone(payload),
      }));
    } catch (error) {
      if (retry < clockRetries && /nmls_(?:second_final_delivery|first_final_delivery|final_delivery|review)_clock_refresh_required/.test(String(error?.message))) continue;
      throw error;
    }
    if (!exact(result, ['duplicate', 'outcome', 'runtime', 'sourceRevision', 'workflowRevision']) ||
        typeof result.duplicate !== 'boolean' || result.sourceRevision !== expectedSourceRevision ||
        result.workflowRevision !== expectedWorkflowRevision) fail('invalid_commit_response');
    outcomeShape(result.outcome, secondFinalId); runtimeShape(result.runtime, phase);
    if (result.runtime.revision !== command.expectedRevision + 1 || result.outcome.actorRevision !== command.expectedActorRevision + 1 ||
        result.runtime.revision !== result.outcome.revision || result.runtime.status !== result.outcome.runtimeStatus) fail('invalid_commit_response');
    if (!result.duplicate) {
      if (!expectedFresh || !same(result.outcome, expectedFresh.outcome) || !same(result.runtime, expectedFresh.runtime)) fail('invalid_commit_response');
    } else {
      const replay = context.secondDeliveryEvent ? context : structuredClone(
        await rpc('nmls_second_final_delivery_context', structuredClone(args)));
      validateNmlsPolicyContext(replay, studentId, sourceCourse);
      const replayHistory = validateNmlsSecondFinalDeliveryHistory(historyInput(replay, studentId, sourceCourse, definition));
      if (!same(replayHistory.phase, phase)) fail('invalid_commit_response');
      const current = replay.secondDelivery;
      if (!plain(current) || current.second_id !== secondFinalId || current.first_final_id !== firstFinalId ||
          current.student_id !== studentId || current.review_attempt_id !== attemptId || !same(current.phase_scope, phase) ||
          !integer(current.revision) || current.revision < 1 || current.runtime?.revision !== current.revision) fail('invalid_commit_response');
      runtimeShape(current.runtime, phase);
      const e = replay?.secondDeliveryEvent;
      if (!plain(e) || e.student_id !== studentId || e.event_id !== command.eventId || e.second_id !== secondFinalId ||
          e.first_final_id !== firstFinalId || e.review_attempt_id !== attemptId ||
          e.reservation_event_id !== context.secondReservationOrigin?.event_id || e.command_digest !== commandDigest ||
          e.definition_digest !== definition.digest || e.source_revision !== expectedSourceRevision ||
          e.final_revision !== 2 || e.workflow_revision !== expectedWorkflowRevision ||
          e.delivery_revision !== result.runtime.revision || e.actor_revision !== result.outcome.actorRevision ||
          !integer(e.transaction_id) || e.transaction_id < 1 || !same(e.command, command) ||
          !same(e.runtime, result.runtime) || !same(e.outcome, result.outcome) || !plain(e.runtime_before) ||
          e.runtime_before.revision !== command.expectedRevision || e.runtime_before.sessionId !== command.sessionId ||
          e.audit?.eventId !== command.eventId || e.audit?.kind !== command.kind || !same(e.audit?.phase, phase) ||
          e.audit?.runtimeBeforeRevision !== command.expectedRevision ||
          e.audit?.atMs !== result.runtime.lastReceiptMs || result.outcome.candidateMaterialAllowed !== false ||
          typeof e.recorded_at !== 'string' || !Number.isFinite(Date.parse(e.recorded_at)) ||
          Math.abs(Date.parse(e.recorded_at) - result.runtime.lastReceiptMs) > 1000 ||
          result.runtime.lastReceiptMs > replay.serverTimeMs || result.runtime.lastReceiptMs > replay.actorPolicy?.ledger?.lastReceiptMs ||
          result.runtime.revision > replay.secondDelivery?.revision) fail('invalid_commit_response');
      runtimeShape(e.runtime_before, phase);
      const childLease = { student_id: studentId, attempt_id: attemptId, phase_kind: 'remediation',
        phase_owner_id: firstFinalId, phase_active: false, session_id: history.workflow.runtime.sessionId };
      const finalLease = r => ({ student_id: studentId, attempt_id: attemptId, phase_kind: 'second_final',
        phase_owner_id: secondFinalId, phase_active: r.status === 'active', session_id: r.sessionId });
      const beforeLease = e.runtime_before.sessionId === null ? childLease : finalLease(e.runtime_before);
      const afterLease = e.runtime.sessionId === null ? beforeLease : finalLease(e.runtime);
      if (!same(e.lease_before, beforeLease) || !same(e.lease_after, afterLease)) fail('invalid_commit_response');
    }
    const outcome = structuredClone(result.outcome), end = monotonicMs();
    let allowed = !result.duplicate && outcome.candidateMaterialAllowed && Number.isFinite(end) && end >= started &&
      outcome.candidateUntilMs > at + (end - started);
    let questions = allowed ? projectNmlsDraftFinal(definition, history.workflow.second_selection).questions : null;
    const after = monotonicMs();
    if (!Number.isFinite(after) || after < end || outcome.candidateUntilMs <= at + (after - started)) {
      allowed = false; questions = null;
    }
    const { candidateMaterialAllowed, candidateUntilMs, candidateWindow, ...metadata } = outcome;
    return { status: outcome.status, body: { ...metadata, mode: 'private_authoring_review',
      attemptId, firstFinalId, secondFinalId, sourceRevision: result.sourceRevision, workflowRevision: result.workflowRevision,
      sessionId: result.runtime.sessionId, duplicate: result.duplicate, deliveryAllowed: allowed,
      deliveryUntilMs: allowed ? candidateUntilMs : null, studyWindow: allowed ? candidateWindow : null, questions } };
  }
}
