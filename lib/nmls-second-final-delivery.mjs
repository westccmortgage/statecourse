import { createHash, randomUUID } from 'node:crypto';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { NMLS_OSS_REQUIREMENTS as R } from '../config/nmls/oss-policy.mjs';
import { applyNmlsSessionPolicy } from './nmls-session-policy.mjs';
import { addNmlsInitialExposureDebit, addNmlsRecoveryDebit, validateNmlsUncertainExposure } from './nmls-uncertain-exposure.mjs';
import { validateNmlsStudyReceipt } from './nmls-study-observer.mjs';
import { validateNmlsSecondFinalReservationHistory, validateNmlsSecondFinalReservationSelection } from './nmls-second-final-reservation.mjs';
import { compactNmlsReviewOutcome, projectNmlsReview } from './nmls-review-runtime.mjs';

// Actual second-form038 provenance is reconstructed without grading or drawing.
// The immutable first final, source and completed child are never rewritten.
// Trusted row origin, current grant/lease authorization and durable CAS remain
// the joint writer's responsibility; these in-process brands are not permits.
const secondTokens = new WeakMap();
const same = (a, b) => a !== undefined && b !== undefined && hash(a) === hash(b);
const without = (v, keys) => Object.fromEntries(Object.entries(v).filter(([k]) => !keys.includes(k)));
const dateMs = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? Date.parse(value) : NaN;
const freeze = value => { if (value && typeof value === 'object') { for (const v of Object.values(value)) freeze(v); Object.freeze(value); } return value; };

export function validateNmlsSecondFinalDeliveryHistory(input) {
  if (!plain(input)) fail('invalid_context');
  const history = validateNmlsSecondFinalReservationHistory(input);
  const { actorId, review, firstFinal: first, workflow: workflow, definition, binding, actorPolicy } = input;
  const r = input.secondReservationEvent, t = input.secondReservationTeachingEvent;
  const selection = workflow.second_selection;
  validateNmlsSecondFinalReservationSelection(selection, { definition, firstSelection: first.selection,
    reviewAttemptId: review.id, expectedId: workflow.second_id });
  const selectionDigest = hash(selection);
  if (!plain(r) || !plain(t) || !uuid(r.event_id) || r.student_id !== actorId || t.student_id !== actorId ||
      r.event_id !== t.event_id || r.first_final_id !== first.id || r.review_attempt_id !== review.id ||
      t.review_attempt_id !== review.id || r.handoff_event_id !== input.handoffOrigin.event_id ||
      r.terminal_event_id !== input.terminalChildEvent.event_id || r.reserved !== true ||
      r.second_id !== workflow.second_id || r.selection_digest !== selectionDigest ||
      r.definition_digest !== definition.digest || r.teaching_digest !== history.course.digest ||
      !same(r.phase_scope, history.phase) || r.final_revision !== 2 ||
      !revision(r.source_revision) || r.source_revision < 1 || r.source_revision > review.revision ||
      !revision(r.workflow_before_revision) || r.workflow_before_revision < 3 ||
      !revision(r.runtime_before_revision) || r.runtime_before_revision < 2 ||
      !revision(r.actor_before_revision) || r.actor_before_revision < 1 ||
      r.teaching_workflow_revision !== r.workflow_before_revision + 1 || r.workflow_revision !== r.workflow_before_revision + 2 ||
      r.runtime_revision !== r.runtime_before_revision + 1 || r.actor_revision !== r.actor_before_revision + 1 ||
      workflow.revision < r.workflow_revision || actorPolicy.revision < r.actor_revision ||
      !uuid(r.session_id) || !revision(r.transaction_id) || r.transaction_id < 1 ||
      t.transaction_id !== r.transaction_id || t.phase_kind !== 'remediation' || t.phase_owner_id !== first.id ||
      t.source_revision !== r.source_revision || t.workflow_revision !== r.teaching_workflow_revision ||
      t.runtime_revision !== r.runtime_revision || t.actor_revision !== r.actor_revision ||
      !same(input.latestChildEvent, t)) fail('reservation_origin');
  const intent = { kind: 'reserve_second_final', attemptId: review.id, firstFinalId: first.id, eventId: r.event_id,
    expectedSourceRevision: r.source_revision, expectedFinalRevision: 2,
    expectedWorkflowRevision: r.workflow_before_revision, expectedRevision: r.runtime_before_revision,
    expectedActorRevision: r.actor_before_revision, sessionId: r.session_id };
  const command = { kind: 'check_access', attemptId: review.id, eventId: r.event_id, phaseKind: 'remediation',
    phaseOwnerId: first.id, expectedSourceRevision: r.source_revision, expectedWorkflowRevision: r.workflow_before_revision,
    expectedRevision: r.runtime_before_revision, expectedActorRevision: r.actor_before_revision, sessionId: r.session_id };
  const lease = { student_id: actorId, attempt_id: review.id, phase_kind: 'remediation', phase_owner_id: first.id,
    phase_active: false, session_id: r.session_id };
  const runtime = r.runtime, old = r.runtime_before, at = runtime?.lastReceiptMs;
  if (r.command_digest !== hash(intent) || r.teaching_command_digest !== hash(command) || t.command_digest !== r.teaching_command_digest ||
      !same(r.lease_before, lease) || !same(r.lease_after, lease) || !same(t.lease_before, lease) || !same(t.lease_after, lease) ||
      !plain(runtime) || !plain(old) || !same(runtime, workflow.runtime) || runtime.revision !== r.runtime_revision ||
      old.revision !== r.runtime_before_revision || runtime.sessionId !== r.session_id || old.sessionId !== r.session_id ||
      !instant(at) || !instant(old.lastReceiptMs) || old.lastReceiptMs > at ||
      old.lastReceiptMs < input.terminalChildEvent.audit.review.atMs ||
      !same(without(runtime, ['revision', 'lastReceiptMs']), without(old, ['revision', 'lastReceiptMs'])) ||
      at < binding.offering.opensAtMs || at >= binding.offering.closesAtMs ||
      !Number.isFinite(dateMs(r.recorded_at)) || !Number.isFinite(dateMs(t.recorded_at)) ||
      Math.abs(dateMs(r.recorded_at) - at) > 1000 || Math.abs(dateMs(t.recorded_at) - at) > 1000 ||
      !Number.isFinite(dateMs(workflow.second_issued_at)) ||
      Math.abs(dateMs(workflow.second_issued_at) - at) > 1000) fail('reservation_history');
  const audit = { review: { kind: 'check_access', atMs: at },
    policy: { kind: 'check_access', code: 'session_policy_allowed', atMs: at, actorId,
      offeringId: binding.offering.id, contentDigest: input.sourceCourse.digest, policyId: binding.policy_id },
    observation: { reason: 'no_prior_material', code: 'study_observation_ready' } };
  const progress = compactNmlsReviewOutcome({ progress: projectNmlsReview(runtime, history.course) }).progress;
  Object.assign(progress, { lessons: [], quiz: null, feedback: null });
  if (!same(t.audit, audit) || !plain(t.outcome) || t.outcome.ok !== true || t.outcome.status !== 200 ||
      t.outcome.code !== 'review_policy_checked' || t.outcome.policyCode !== 'session_policy_allowed' ||
      t.outcome.actorRevision !== r.actor_revision || t.outcome.observationReady !== true ||
      t.outcome.observationCode !== 'study_observation_ready' || t.outcome.teachingPhaseComplete !== true ||
      t.outcome.deliveryAllowed !== false || t.outcome.deliveryUntilMs !== null ||
      t.outcome.studyWindow !== null || t.outcome.studyRecovery !== null || !same(t.outcome.progress, progress) ||
      !same(r.outcome, { ok: true, code: 'private_second_final_reserved', status: 200, reserved: true,
        firstFinalId: first.id, secondFinalId: selection.id, finalRevision: 2, sourceRevision: r.source_revision,
        workflowRevision: r.workflow_revision, runtimeRevision: r.runtime_revision, actorRevision: r.actor_revision,
        sessionId: r.session_id, teachingCode: 'review_policy_checked', policyCode: 'session_policy_allowed',
        observationCode: 'study_observation_ready', mode: 'private_authoring_review', deliveryAllowed: false,
        studentDeliveryEnabled: false, creditIssuanceAllowed: false, retakeEnabled: false })) fail('reservation_outcome');
  const ledger = actorPolicy.ledger;
  if (!plain(ledger) || ledger.actorId !== actorId || ledger.policyId !== binding.policy_id ||
      actorPolicy.policy_id !== binding.policy_id || actorPolicy.policy_digest !== binding.policy_digest ||
      actorPolicy.student_id !== actorId || ledger.revision !== actorPolicy.revision ||
      !revision(actorPolicy.revision) || !instant(ledger.lastReceiptMs) || ledger.lastReceiptMs < at ||
      ledger.creditIssuanceAllowed !== false) fail('actor_policy');
  const phase = { version: 'nmls-second-final-phase-v1', actorId, reviewAttemptId: review.id,
    firstFinalAttemptId: first.id, finalAttemptId: selection.id, courseKey: input.sourceCourse.id,
    contentDigest: input.sourceCourse.digest, definitionDigest: definition.digest, selectionDigest, offeringId: binding.offering.id };
  return freeze({ phase, course: structuredClone(history.course), notBeforeMs: Math.max(history.notBeforeMs,
    ledger.lastReceiptMs, dateMs(r.recorded_at), dateMs(t.recorded_at), dateMs(workflow.second_issued_at)) });
}

export function makeNmlsSecondFinalDeliveryContext(input) {
  const history = validateNmlsSecondFinalDeliveryHistory(input), w = input.workflow;
  if (w.status !== 'second_issued' || ['second_answers', 'second_result', 'second_submitted_at'].some(k => w[k] !== null)) {
    fail('not_reserved');
  }
  const lease = input.lease;
  const childLease = { student_id: input.actorId, attempt_id: input.review.id, phase_kind: 'remediation',
    phase_owner_id: input.firstFinal.id, phase_active: false, session_id: w.runtime.sessionId };
  if (!same(lease, childLease) && (!exact(lease, Object.keys(childLease)) || lease.student_id !== input.actorId ||
      lease.attempt_id !== input.review.id || lease.phase_kind !== 'second_final' || lease.phase_owner_id !== w.second_id ||
      typeof lease.phase_active !== 'boolean' || !uuid(lease.session_id))) fail('lease_scope');
  const finalPhase = Object.freeze({ scope: history.phase });
  const result = { finalPhase, definition: structuredClone(input.definition), selection: structuredClone(w.second_selection),
    sourceRuntime: structuredClone(input.review.runtime), offering: structuredClone(input.binding.offering) };
  secondTokens.set(finalPhase, { actorId: input.actorId, definitionHash: hash(result.definition),
    selectionHash: hash(result.selection), offeringHash: hash(result.offering),
    ledgerHash: hash(input.actorPolicy.ledger), actorRevision: input.actorPolicy.revision, notBeforeMs: history.notBeforeMs,
    priorSessionIds: [input.review.runtime.sessionId, input.delivery.runtime.sessionId, w.runtime.sessionId] });
  return freeze(result);
}

export function nmlsSecondFinalDeliveryScope(finalPhase) {
  if (!secondTokens.has(finalPhase)) fail('untrusted_phase');
  return finalPhase.scope;
}

export function assertNmlsSecondFinalDeliveryPhase(finalPhase, context) {
  const pinned = secondTokens.get(finalPhase);
  if (!pinned) fail('untrusted_phase');
  if (!plain(context) || context.actorId !== pinned.actorId || hash(context.definition) !== pinned.definitionHash ||
      hash(context.selection) !== pinned.selectionHash || hash(context.offering) !== pinned.offeringHash ||
      !plain(context.ledger) || context.ledger.revision !== pinned.actorRevision || hash(context.ledger) !== pinned.ledgerHash ||
      !instant(context.receivedAtMs) || context.receivedAtMs < pinned.notBeforeMs) fail('context_changed');
  return finalPhase.scope;
}

// Separately scoped instance of the reviewed035 control/accounting algorithm.
// Never translate a second window, selection or runtime into a first identity.
// PRIVATE PURE TRANSITION CANDIDATES ONLY. This module performs no HTTP, SQL
// write or question projection. A result is NOT a delivery permit. A
// joint writer must authorize the original grant, serialize the shared actor
// lease, and commit sidecar + ledger + immutable receipt atomically BEFORE
// considering a fresh, response-time-bounded projection of the reserved form.
// Final selection/result rows and source instructional progress never change.
const VERSION = 'nmls-second-final-delivery-v1';
const JOURNAL = 'nmls-study-windows-v3-phase';
const uuid = v => typeof v === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
const instant = v => Number.isSafeInteger(v) && v >= 0 && v <= 8.64e15;
const revision = v => Number.isSafeInteger(v) && v >= 0;
const plain = v => v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;
const exact = (v, keys) => plain(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
const canonical = v => Array.isArray(v) ? v.map(canonical) : plain(v) ?
  Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v;
const hash = v => createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const fail = code => { throw new Error(`nmls_second_final_delivery_${code}`); };
const controls = new Set(['accept_rocs', 'begin_break', 'end_break', 'recover_observation']);
const recoverable = new Set(['receipt_missing_or_stale', 'visibility_interrupted', 'horizon_expired',
  'receipt_gap', 'session_interrupted']);
const commonKeys = ['kind', 'eventId', 'expectedRevision', 'expectedActorRevision', 'sessionId'];
const extraKeys = {
  activate: [], resume: [], heartbeat: [], check_access: [], pause: [], logout: [],
  interaction: ['visible'], begin_break: [], end_break: [],
  accept_rocs: ['version', 'documentDigest', 'acknowledged'], recover_observation: ['recoveryWindowId'],
};

export function validateNmlsSecondFinalDeliveryCommand(command) {
  if (!plain(command) || !Object.hasOwn(extraKeys, command.kind)) fail('invalid_command');
  const keys = [...commonKeys, ...extraKeys[command.kind]];
  if (command.kind === 'accept_rocs' && Object.hasOwn(command, 'presentationId')) {
    if (!uuid(command.presentationId)) fail('invalid_command');
    keys.push('presentationId');
  }
  if (Object.hasOwn(command, 'studyReceipt') && command.kind !== 'recover_observation') keys.push('studyReceipt');
  if (!exact(command, keys) || !uuid(command.eventId) || !revision(command.expectedRevision) ||
      !revision(command.expectedActorRevision) || command.sessionId !== null && !uuid(command.sessionId) ||
      command.kind === 'interaction' && typeof command.visible !== 'boolean' ||
      command.kind === 'recover_observation' && !uuid(command.recoveryWindowId) ||
      command.kind === 'accept_rocs' && (command.version !== '4' ||
        !/^[a-f0-9]{64}$/.test(command.documentDigest) || typeof command.acknowledged !== 'boolean')) fail('invalid_command');
  if (Object.hasOwn(command, 'studyReceipt')) validateNmlsStudyReceipt(command.studyReceipt);
  return command;
}

export function startNmlsSecondFinalDelivery(finalPhase) {
  const phase = nmlsSecondFinalDeliveryScope(finalPhase);
  return startNmlsRuntimeShape(phase);
}

function validateRuntime(runtime, phase) {
  if (!exact(runtime, ['version', 'finalAttemptId', 'phaseDigest', 'revision', 'status', 'sessionId',
    'lastActivityMs', 'lastReceiptMs', 'creditIssuanceAllowed']) || runtime.version !== VERSION ||
    runtime.finalAttemptId !== phase.finalAttemptId || runtime.phaseDigest !== hash(phase) || !revision(runtime.revision) ||
    !['reserved', 'active', 'paused', 'logged_out'].includes(runtime.status) || !instant(runtime.lastReceiptMs) ||
    runtime.creditIssuanceAllowed !== false || runtime.sessionId !== null && !uuid(runtime.sessionId) ||
    runtime.lastActivityMs !== null && (!instant(runtime.lastActivityMs) || runtime.lastActivityMs > runtime.lastReceiptMs) ||
    (runtime.sessionId === null) !== (runtime.lastActivityMs === null) ||
    runtime.status === 'active' && runtime.sessionId === null ||
    runtime.status === 'reserved' && runtime.sessionId !== null ||
    runtime.revision === 0 && hash(runtime) !== hash(startNmlsRuntimeShape(phase))) fail('invalid_runtime');
}

function startNmlsRuntimeShape(phase) {
  return { version: VERSION, finalAttemptId: phase.finalAttemptId, phaseDigest: hash(phase), revision: 0,
    status: 'reserved', sessionId: null, lastActivityMs: null, lastReceiptMs: 0, creditIssuanceAllowed: false };
}

function scopeFor(phase, runtime) {
  return { actorId: phase.actorId, attemptId: phase.reviewAttemptId, offeringId: phase.offeringId,
    contentDigest: phase.contentDigest, sessionId: runtime.sessionId, finalPhase: phase };
}

function validateWindow(w, phase, offering, journalAt) {
  if (!exact(w, ['id', 'scope', 'materialDigest', 'runtimeRevision', 'openingEventId', 'issuedAtMs', 'horizonMs', 'lastObservedAtMs']) ||
      !exact(w.scope, ['actorId', 'attemptId', 'offeringId', 'contentDigest', 'sessionId', 'finalPhase'])) {
    // A teaching window must be handled by its own owner; never clear, debit,
    // upgrade, or reinterpret a foreign source/remediation/final window here.
    fail('foreign_observation_window');
  }
  if (hash(w.scope.finalPhase) !== hash(phase) || w.scope.actorId !== phase.actorId ||
      w.scope.attemptId !== phase.reviewAttemptId || w.scope.offeringId !== phase.offeringId ||
      w.scope.contentDigest !== phase.contentDigest) fail('foreign_observation_window');
  if (!uuid(w.id) || !uuid(w.scope.sessionId) || !uuid(w.openingEventId) || !revision(w.runtimeRevision) ||
      w.materialDigest !== phase.selectionDigest || !instant(w.issuedAtMs) || !instant(w.horizonMs) ||
      w.horizonMs <= w.issuedAtMs || w.issuedAtMs > journalAt || w.issuedAtMs < offering.opensAtMs ||
      w.horizonMs > offering.closesAtMs || w.lastObservedAtMs !== null &&
        (!instant(w.lastObservedAtMs) || w.lastObservedAtMs < w.issuedAtMs || w.lastObservedAtMs > w.horizonMs ||
         w.lastObservedAtMs > journalAt) ||
      w.horizonMs - (w.lastObservedAtMs ?? w.issuedAtMs) > P.maximumObservationMs) fail('invalid_observation_window');
}

function journalFor(ledger, phase, offering) {
  const j = ledger.observationJournal;
  if (!exact(j, ['version', 'actorId', 'lastReceiptMs', 'active', 'unresolved', 'creditIssuanceAllowed']) ||
      j.version !== JOURNAL || j.actorId !== phase.actorId || j.creditIssuanceAllowed !== false ||
      !instant(j.lastReceiptMs) || j.lastReceiptMs > ledger.lastReceiptMs || j.active !== null && j.unresolved !== null) {
    fail('observation_history_required');
  }
  if (j.active !== null) validateWindow(j.active, phase, offering, j.lastReceiptMs);
  if (j.unresolved !== null) {
    const u = j.unresolved;
    if (!exact(u, ['window', 'reason', 'detectedAtMs', 'eventId']) || typeof u.reason !== 'string' ||
        !uuid(u.eventId) || !instant(u.detectedAtMs) || u.detectedAtMs > j.lastReceiptMs) fail('invalid_observation_hold');
    validateWindow(u.window, phase, offering, j.lastReceiptMs);
    if (u.detectedAtMs < (u.window.lastObservedAtMs ?? u.window.issuedAtMs)) fail('invalid_observation_hold');
  }
  return structuredClone(j);
}

function interrupt(journal, w, reason, command, at) {
  journal.active = null;
  journal.unresolved = { window: structuredClone(w), reason, detectedAtMs: at, eventId: command.eventId };
  return { journal, ready: false, code: reason, audit: { interrupted: structuredClone(journal.unresolved) } };
}

function receive(journal, phase, runtime, command, at) {
  journal.lastReceiptMs = at;
  if (command.kind === 'recover_observation' && (journal.active !== null ||
      journal.unresolved?.window.id !== command.recoveryWindowId)) fail('recovery_window_conflict');
  if (journal.unresolved) {
    if (command.studyReceipt) fail('receipt_during_hold');
    return { journal, ready: false, code: 'observation_unresolved', audit: { unresolvedPreserved: true } };
  }
  const w = journal.active, receipt = command.studyReceipt;
  if (!w) {
    if (receipt) fail('receipt_without_window');
    if (runtime.status === 'active') fail('active_window_missing');
    return { journal, ready: true, code: 'observation_ready', audit: { noPriorMaterial: true } };
  }
  if (w.scope.sessionId !== runtime.sessionId) return interrupt(journal, w, 'session_interrupted', command, at);
  if (w.runtimeRevision !== runtime.revision) return interrupt(journal, w, 'material_revision_interrupted', command, at);
  if (!receipt || receipt.windowId !== w.id) return interrupt(journal, w, 'receipt_missing_or_stale', command, at);
  if (!receipt.visible || command.visible === false) return interrupt(journal, w, 'visibility_interrupted', command, at);
  if (at > w.horizonMs) return interrupt(journal, w, 'horizon_expired', command, at);
  if (at - (w.lastObservedAtMs ?? w.issuedAtMs) > P.maximumObservationMs) return interrupt(journal, w, 'receipt_gap', command, at);
  const start = w.lastObservedAtMs, audit = { windowBefore: structuredClone(w), firstAcknowledgment: start === null,
    signal: 'authenticated_material_receipt_not_identity_proof' };
  w.lastObservedAtMs = at;
  return { journal, ready: true, code: start === null ? 'material_acknowledged' : 'receipt_continuous', audit,
    ...(start === null ? { initialExposure: { start: w.issuedAtMs, end: at } } : {}),
    ...(start !== null && start < at ? { studyInterval: { start, end: at } } : {}) };
}

export function createNmlsSecondFinalDeliveryEvaluator({ newSessionId = randomUUID, newWindowId = randomUUID } = {}) {
  if (typeof newSessionId !== 'function' || typeof newWindowId !== 'function') fail('invalid_factory');
  return context => {
    const { finalPhase, definition, selection, offering, evidence } = context;
    assertNmlsSecondFinalDeliveryPhase(finalPhase, { actorId: evidence?.actorId, definition, selection, offering,
      ledger: context.ledger, receivedAtMs: evidence?.receivedAtMs });
    const phase = nmlsSecondFinalDeliveryScope(finalPhase), command = structuredClone(validateNmlsSecondFinalDeliveryCommand(context.command));
    const runtime = structuredClone(context.runtime), ledger = structuredClone(context.ledger), at = evidence.receivedAtMs;
    validateRuntime(runtime, phase);
    if (!plain(ledger) || ledger.actorId !== phase.actorId || ledger.policyId !== P.id || ledger.creditIssuanceAllowed !== false ||
        !revision(ledger.revision) || !instant(ledger.lastReceiptMs) || ledger.revision === 0 ||
        !instant(at) || at < ledger.lastReceiptMs || at < runtime.lastReceiptMs) fail('invalid_server_context');
    validateNmlsUncertainExposure(ledger.uncertainExposure);
    if (runtime.revision === Number.MAX_SAFE_INTEGER || ledger.revision === Number.MAX_SAFE_INTEGER) fail('revision_exhausted');
    if (command.expectedRevision !== runtime.revision || command.expectedActorRevision !== ledger.revision) fail('revision_conflict');
    if (command.sessionId !== runtime.sessionId) fail('session_conflict');
    if (command.kind === 'activate' && runtime.status !== 'reserved' || command.kind === 'resume' && runtime.sessionId === null) fail('activation_sequence');
    let journal = journalFor(ledger, phase, offering);
    if (runtime.status === 'reserved' && (journal.active || journal.unresolved)) fail('activation_requires_empty_journal');
    const outside = at < offering.opensAtMs || at >= offering.closesAtMs;
    const idle = runtime.status === 'active' && at - runtime.lastActivityMs >= R.idleLogoutMs;
    let decision = outside ? { journal, ready: false, code: 'outside_window_no_settlement', audit: { outsideWindowPreserved: true } } :
      receive(journal, phase, runtime, command, at);
    let accounted = ledger;
    if (decision.initialExposure) accounted = addNmlsInitialExposureDebit(ledger, decision.initialExposure.start, at);
    // An unresolved window may not be used to establish a new wall session or
    // a fresh activity clock. Recovery and its new pause happen separately.
    const opening = ['activate', 'resume'].includes(command.kind);
    const policyKind = idle ? 'check_access' : command.kind === 'recover_observation' ? 'check_recovery' :
      opening && decision.ready ? 'open_session' : controls.has(command.kind) ? command.kind : 'check_access';
    const policyCommand = { kind: policyKind, expectedRevision: ledger.revision };
    if (policyKind === 'accept_rocs') Object.assign(policyCommand, { version: command.version,
      documentDigest: command.documentDigest, acknowledged: command.acknowledged });
    const policyEvidence = { actorId: phase.actorId, receivedAtMs: at, presentation: evidence.presentation };
    let policy = applyNmlsSessionPolicy(accounted, policyCommand, offering,
      { ...policyEvidence, ...(decision.studyInterval ? { studyInterval: decision.studyInterval } : {}) });
    if (decision.studyInterval && policy.audit.observation?.code !== 'study_interval_recorded' &&
        policy.audit.observation?.observedOutsidePolicy !== true) {
      decision = interrupt(journal, decision.audit.windowBefore, 'settlement_rejected', command, at);
      policy = applyNmlsSessionPolicy(ledger, { kind: 'check_access', expectedRevision: ledger.revision }, offering, policyEvidence);
    }
    journal = decision.journal;
    const state = structuredClone(runtime);
    state.revision++; state.lastReceiptMs = at;
    let ok = false, code = !policy.ok ? policy.code : !decision.ready ? decision.code : 'session_required', status = 409;
    let eligible = false, until = null, resumeNotBeforeMs = policy.resumeNotBeforeMs ?? null;
    if (outside) { state.status = state.sessionId === null ? 'reserved' : 'logged_out'; }
    else if (idle) { state.status = 'logged_out'; code = 'inactivity_logout'; status = 401; }
    else if (command.kind === 'recover_observation') {
      const unresolved = journal.unresolved;
      if (policy.ok && policy.code === 'recovery_context_allowed' && runtime.status !== 'active' &&
          unresolved && recoverable.has(unresolved.reason)) {
        const start = unresolved.window.lastObservedAtMs ?? unresolved.window.issuedAtMs;
        const debit = addNmlsRecoveryDebit(policy.state, start, at);
        policy.state = debit.state; resumeNotBeforeMs = debit.resumeNotBeforeMs;
        decision.audit.recovery = { original: structuredClone(unresolved), debitStartMs: start, debitEndMs: at,
          method: 'conservative_gap_debit_no_instruction_awarded', clientProtocolRequired: 'clear-before-recovery-v1',
          observedStudyAddedMs: 0, instructionalTimeAddedMs: 0, creditAddedMs: 0 };
        journal.unresolved = null; ok = true; code = 'observation_recovered'; status = 200;
      } else if (policy.ok) code = 'recovery_review_required';
      state.status = state.sessionId === null ? 'reserved' : 'paused';
    } else if (command.kind === 'logout' || command.kind === 'pause') {
      state.status = state.sessionId === null ? 'reserved' : command.kind === 'logout' ? 'logged_out' : 'paused';
      // Stopping always clears candidate delivery. A clean stop is distinct
      // from a held/late/hidden stop and cannot forgive unresolved exposure.
      ok = decision.ready && policy.ok; status = ok ? 200 : 409;
      if (ok) code = command.kind === 'logout' ? 'final_logged_out' : 'final_paused';
    } else if (controls.has(command.kind)) {
      state.status = state.sessionId === null ? 'reserved' : 'paused';
      ok = policy.ok; status = ok ? 200 : 409; code = policy.code;
    } else if (policy.ok && policy.code === 'session_policy_allowed' && decision.ready) {
      if (opening) {
        const sessionId = newSessionId();
        if (!uuid(sessionId) || sessionId === state.sessionId || secondTokens.get(finalPhase).priorSessionIds.includes(sessionId)) fail('invalid_new_session');
        state.sessionId = sessionId; state.lastActivityMs = at; state.status = 'active';
      }
      if (state.status === 'active') {
        // Polls and first acknowledgments are not new human activity. Only a
        // timely visible interaction after initial acknowledgment refreshes it.
        if (command.kind === 'interaction' && command.visible && !decision.initialExposure) state.lastActivityMs = at;
        eligible = true; ok = true; status = 200;
        code = opening ? 'final_session_opened' : 'final_activity_checked';
        until = Math.min(at + policy.maxNextStudyMs, state.lastActivityMs + R.idleLogoutMs);
        if (!instant(until) || until <= at || until - at > P.maximumObservationMs) fail('invalid_candidate_horizon');
      }
    }
    if (!eligible && state.status === 'active') state.status = 'paused';
    if (!outside) {
      if (eligible) {
        const scope = scopeFor(phase, state), old = journal.active;
        if (old && hash(old.scope) === hash(scope)) {
          old.runtimeRevision = state.revision; old.horizonMs = until;
        } else {
          if (old) decision.audit.closedWindow = structuredClone(old);
          const id = newWindowId();
          if (!uuid(id) || id === old?.id || id === context.ledger.observationJournal.unresolved?.window.id) fail('invalid_new_window');
          journal.active = { id, scope, materialDigest: phase.selectionDigest, runtimeRevision: state.revision,
            openingEventId: command.eventId, issuedAtMs: at, horizonMs: until, lastObservedAtMs: null };
        }
        validateWindow(journal.active, phase, offering, at);
      } else if (journal.active) {
        decision.audit.closedWindow = structuredClone(journal.active); journal.active = null;
      }
      policy.state.observationJournal = journal;
    }
    const recovery = journal.unresolved && recoverable.has(journal.unresolved.reason) ?
      { windowId: journal.unresolved.window.id, eligibleAtMs: journal.unresolved.detectedAtMs } : null;
    validateRuntime(state, phase);
    return { runtime: state, ledger: policy.state, outcome: { ok, code, status,
      finalAttemptId: phase.finalAttemptId, finalRevision: 2, revision: state.revision, actorRevision: policy.state.revision,
      runtimeStatus: state.status, candidateMaterialAllowed: eligible, candidateUntilMs: until,
      candidateWindow: eligible ? { id: journal.active.id, expiresAtMs: until } : null,
      recovery: outside ? null : recovery, resumeNotBeforeMs, policyCode: policy.code, observationCode: decision.code,
      mode: 'private_transition_candidate', deliveryAllowed: false, studentDeliveryEnabled: false, creditIssuanceAllowed: false },
    audit: { eventId: command.eventId, kind: command.kind, atMs: at, phase,
      runtimeBeforeRevision: runtime.revision, policy: policy.audit, observation: decision.audit,
      ...(eligible ? { windowAfter: structuredClone(journal.active) } : {}),
      instructionalTimeAddedMs: 0, creditAddedMs: 0 } };
  };
}
