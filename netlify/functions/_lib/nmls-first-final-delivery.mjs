import { createNmlsFirstFinalDeliveryEvaluator, startNmlsFirstFinalDelivery,
  validateNmlsFirstFinalDeliveryCommand } from '../../../lib/nmls-final-delivery.mjs';
import { makeNmlsFirstFinalDeliveryContext, nmlsFinalDeliveryScope } from '../../../lib/nmls-final-delivery-context.mjs';
import { projectNmlsDraftFinal } from '../../../lib/nmls-final-assessment.mjs';
import { getNmlsDraftFinalDefinition } from '../../../lib/nmls-final-authoring-content.mjs';
import { getNmlsReviewCourse } from './nmls-review-content.mjs';
import { digestNmlsCommand } from './nmls-review-service.mjs';
import { validateNmlsPolicyContext } from './nmls-policy-transaction.mjs';

// PRIVATE SERVER ADAPTER ONLY; no HTTP handler imports this module. SQL035
// must commit final sidecar + shared actor ledger + receipt + lease together.
// Only a fresh positive nonduplicate commit can project selected stems/options.
// No browser activation, approval, attendance, final grading or credit is added.
const plain = v => v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;
const uuid = v => typeof v === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
const integer = v => Number.isSafeInteger(v) && v >= 0;
const exact = (v, keys) => plain(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
const same = (a, b) => digestNmlsCommand(a) === digestNmlsCommand(b);
const fail = code => { throw new Error(`nmls_first_final_delivery_${code}`); };
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

export function validateNmlsFirstFinalDeliveryInput(input) {
  if (!plain(input) || !uuid(input.attemptId) || !uuid(input.finalAttemptId) || input.attemptId === input.finalAttemptId ||
      !integer(input.expectedSourceRevision) || input.expectedSourceRevision < 1 || input.expectedFinalRevision !== 1) fail('invalid_request');
  const { attemptId, finalAttemptId, expectedSourceRevision, expectedFinalRevision, ...command } = input;
  validateNmlsFirstFinalDeliveryCommand(command);
  if (command.kind === 'accept_rocs' && !uuid(command.presentationId)) fail('presentation_required');
  return input;
}

function outcomeShape(o, finalId) {
  if (!exact(o, outcomeKeys) || typeof o.ok !== 'boolean' || !outcomeCodes.has(o.code) ||
      ![200, 401, 409].includes(o.status) || o.finalAttemptId !== finalId || o.finalRevision !== 1 ||
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
  if (!exact(runtime, runtimeKeys) || runtime.version !== 'nmls-first-final-delivery-v1' ||
      runtime.finalAttemptId !== phase.finalAttemptId || runtime.phaseDigest !== digestNmlsCommand(phase) ||
      !integer(runtime.revision) || !integer(runtime.lastReceiptMs) || runtime.creditIssuanceAllowed !== false ||
      !['reserved', 'active', 'paused', 'logged_out'].includes(runtime.status) ||
      runtime.sessionId !== null && !uuid(runtime.sessionId) || runtime.lastActivityMs !== null &&
        (!integer(runtime.lastActivityMs) || runtime.lastActivityMs > runtime.lastReceiptMs) ||
      (runtime.sessionId === null) !== (runtime.lastActivityMs === null) ||
      runtime.status === 'reserved' && runtime.sessionId !== null || runtime.status === 'active' && runtime.sessionId === null) fail('invalid_runtime');
}

export async function transactNmlsFirstFinalDelivery(input, studentId, {
  rpc, courseFor = getNmlsReviewCourse, definitionFor = getNmlsDraftFinalDefinition,
  evaluate = createNmlsFirstFinalDeliveryEvaluator(), clockRetries = 1, monotonicMs = () => performance.now(),
} = {}) {
  validateNmlsFirstFinalDeliveryInput(input);
  if (!uuid(studentId)) fail('invalid_authenticated_actor');
  if ([rpc, courseFor, definitionFor, evaluate, monotonicMs].some(fn => typeof fn !== 'function') ||
      !integer(clockRetries) || clockRetries > 1) fail('invalid_dependencies');
  const intent = structuredClone(input), commandDigest = digestNmlsCommand(intent);
  const { attemptId, finalAttemptId, expectedSourceRevision, expectedFinalRevision, ...command } = intent;
  const requestStarted = monotonicMs();
  if (!Number.isFinite(requestStarted) || requestStarted < 0) fail('invalid_server_clock');
  for (let retry = 0; ; retry++) {
    const context = structuredClone(await rpc('nmls_first_final_delivery_context', {
      p_student_id: studentId, p_attempt_id: attemptId, p_final_id: finalAttemptId, p_event_id: command.eventId,
    }));
    if (!plain(context) || context.attempt?.id !== attemptId || context.reservedFinal?.id !== finalAttemptId ||
        !Object.hasOwn(context, 'delivery') || !Object.hasOwn(context, 'deliveryEvent') ||
        context.delivery !== null && !plain(context.delivery) || context.deliveryEvent !== null && !plain(context.deliveryEvent)) fail('context_scope');
    const sourceCourse = structuredClone(courseFor(context.attempt.course_key));
    const { ledger, serverTimeMs: at } = validateNmlsPolicyContext(context, studentId, sourceCourse);
    const final = makeNmlsFirstFinalDeliveryContext({ actorId: studentId, review: context.attempt, binding: context.binding,
      sourceCourse, definition: structuredClone(definitionFor(sourceCourse.id)), reservedFinal: context.reservedFinal,
      reservation: context.reservation, teachingEvent: context.teachingEvent, actorPolicy: context.actorPolicy });
    const phase = nmlsFinalDeliveryScope(final.finalPhase);
    const row = context.delivery;
    if (row && (row.final_id !== finalAttemptId || row.student_id !== studentId || row.review_attempt_id !== attemptId ||
        !same(row.phase_scope, phase) || !integer(row.revision) || row.revision < 1 || row.runtime?.revision !== row.revision)) fail('sidecar_scope');
    const runtime = structuredClone(row?.runtime ?? startNmlsFirstFinalDelivery(final.finalPhase));
    runtimeShape(runtime, phase);
    const stale = context.deliveryEvent !== null || expectedSourceRevision !== context.attempt.revision ||
      expectedFinalRevision !== context.reservedFinal.revision || command.expectedRevision !== runtime.revision ||
      command.expectedActorRevision !== ledger.revision || command.sessionId !== runtime.sessionId;
    let transition = null, payload = {};
    if (!stale) {
      const presentation = command.kind === 'accept_rocs' ? structuredClone(await rpc('nmls_policy_read_presentation', {
        p_student_id: studentId, p_attempt_id: attemptId, p_presentation_id: command.presentationId,
      })) : null;
      const evaluationContext = { ...final, runtime, ledger, command,
        evidence: { actorId: studentId, receivedAtMs: at, presentation } };
      // Trusted injected evaluators receive detached inputs. The exact original
      // domain computation, with their proposed UUIDs only, verifies the result
      // before SQL's independent guard. No caller-selected clocks or modules.
      transition = await evaluate({ ...final, runtime: structuredClone(runtime), ledger: structuredClone(ledger),
        command: structuredClone(command), evidence: structuredClone(evaluationContext.evidence) });
      if (!exact(transition, ['runtime', 'ledger', 'outcome', 'audit'])) fail('invalid_transition');
      const expected = createNmlsFirstFinalDeliveryEvaluator({
        newSessionId: () => transition.runtime?.sessionId,
        newWindowId: () => transition.ledger?.observationJournal?.active?.id,
      })(evaluationContext);
      if (!same(transition, expected)) fail('invalid_transition');
      outcomeShape(transition.outcome, finalAttemptId); runtimeShape(transition.runtime, phase);
      payload = { phase, command, runtime: transition.runtime, ledger: transition.ledger, outcome: transition.outcome, audit: transition.audit };
    }
    let result;
    try {
      result = await rpc('nmls_first_final_delivery_commit', {
        p_student_id: studentId, p_attempt_id: attemptId, p_final_id: finalAttemptId, p_event_id: command.eventId,
        p_command_digest: commandDigest, p_expected_source_revision: expectedSourceRevision,
        p_expected_final_revision: expectedFinalRevision, p_expected_delivery_revision: command.expectedRevision,
        p_expected_actor_revision: command.expectedActorRevision, p_expected_session_id: command.sessionId,
        p_evaluated_at_ms: at, p_definition_digest: final.definition.digest, p_transition: payload,
      });
    } catch (error) {
      if (retry < clockRetries && /nmls_(?:first_final_delivery|final_delivery|review)_clock_refresh_required/.test(String(error?.message))) continue;
      throw error;
    }
    if (!exact(result, ['duplicate', 'outcome', 'runtime', 'sourceRevision']) || typeof result.duplicate !== 'boolean' ||
        !integer(result.sourceRevision) || result.sourceRevision < 1) fail('invalid_commit_response');
    outcomeShape(result.outcome, finalAttemptId); runtimeShape(result.runtime, phase);
    if (result.runtime.revision !== result.outcome.revision || result.runtime.status !== result.outcome.runtimeStatus ||
        (result.duplicate ? result.outcome.candidateMaterialAllowed !== false : !transition ||
          result.sourceRevision !== expectedSourceRevision || !same(result.outcome, transition.outcome) || !same(result.runtime, transition.runtime))) {
      fail('invalid_commit_response');
    }
    if (result.duplicate) {
      if (result.sourceRevision !== expectedSourceRevision || result.runtime.revision !== command.expectedRevision + 1 ||
          result.outcome.actorRevision !== command.expectedActorRevision + 1) fail('invalid_commit_response');
      // A concurrent exact request may have committed after the original read.
      // Resolve its stored immutable event, never reconstruct/reduce a replay.
      const event = context.deliveryEvent ?? (await rpc('nmls_first_final_delivery_context', {
        p_student_id: studentId, p_attempt_id: attemptId, p_final_id: finalAttemptId, p_event_id: command.eventId,
      }))?.deliveryEvent;
      if (!plain(event) || event.student_id !== studentId || event.event_id !== command.eventId ||
          event.final_id !== finalAttemptId || event.review_attempt_id !== attemptId || event.command_digest !== commandDigest ||
          event.definition_digest !== final.definition.digest || event.source_revision !== expectedSourceRevision ||
          event.final_revision !== 1 || event.delivery_revision !== result.runtime.revision ||
          event.actor_revision !== result.outcome.actorRevision || !plain(event.runtime) || !plain(event.outcome) || !same(event.runtime, result.runtime) ||
          !same(event.outcome, result.outcome)) fail('invalid_commit_response');
    }
    const outcome = structuredClone(result.outcome);
    let end = monotonicMs();
    let allowed = !result.duplicate && outcome.candidateMaterialAllowed && Number.isFinite(end) && end >= requestStarted &&
      outcome.candidateUntilMs > at + (end - requestStarted);
    // Crucially, no question projection occurs before a successful commit.
    let questions = allowed ? projectNmlsDraftFinal(final.definition, final.selection).questions : null;
    const afterProjection = monotonicMs();
    if (!Number.isFinite(afterProjection) || afterProjection < end ||
        outcome.candidateUntilMs <= at + (afterProjection - requestStarted)) { allowed = false; questions = null; }
    const { candidateMaterialAllowed, candidateUntilMs, candidateWindow, ...metadata } = outcome;
    return { status: outcome.status, body: { ...metadata, mode: 'private_authoring_review',
      attemptId, finalAttemptId, sourceRevision: result.sourceRevision, sessionId: result.runtime.sessionId,
      duplicate: result.duplicate, deliveryAllowed: allowed, deliveryUntilMs: allowed ? candidateUntilMs : null,
      studyWindow: allowed ? candidateWindow : null, questions } };
  }
}
