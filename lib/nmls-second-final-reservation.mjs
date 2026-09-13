import { createHash, randomUUID } from 'node:crypto';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { validateNmlsFirstFinalHandoffHistory } from './nmls-first-final-handoff.mjs';
import { makeNmlsRemediationTeachingContext } from './nmls-teaching-phase.mjs';
import { drawNmlsDraftFinal, projectNmlsDraftFinal } from './nmls-final-assessment.mjs';
import { startNmlsCourseReview, projectNmlsReview, compactNmlsReviewOutcome } from './nmls-review-runtime.mjs';
import { createNmlsObservedPolicyReviewEvaluator } from './nmls-study-observer.mjs';
import { nmlsRestrictionUsage, unionNmlsExposureIntervals, nmlsExposureInRange } from './nmls-uncertain-exposure.mjs';

// PRIVATE pure reservation candidates, not activation, delivery, submission or
// credit. Reconstruct from authenticated server-loaded immutable histories.
// SQL must establish their origin, serialize the actor lease and save the real
// child check plus second form atomically. No old course/first-final is edited.
const tokens = new WeakMap();
const plain = x => x !== null && typeof x === 'object' && Object.getPrototypeOf(x) === Object.prototype;
const integer = x => Number.isSafeInteger(x) && x >= 0;
const instant = x => integer(x) && x <= 8.64e15;
const uuid = x => typeof x === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(x);
const sha = x => typeof x === 'string' && /^[a-f0-9]{64}$/.test(x);
const date = x => typeof x === 'string' && Number.isFinite(Date.parse(x));
const exact = (x, keys) => plain(x) && Object.keys(x).length === keys.length && keys.every(k => Object.hasOwn(x, k));
const stable = x => Array.isArray(x) ? x.map(stable) : plain(x) ? Object.fromEntries(Object.keys(x).sort().map(k => [k, stable(x[k])])) : x;
const hash = x => createHash('sha256').update(JSON.stringify(stable(x))).digest('hex');
const same = (a, b) => a !== undefined && b !== undefined && hash(a) === hash(b);
const freeze = x => { if (x && typeof x === 'object') { for (const v of Object.values(x)) freeze(v); Object.freeze(x); } return x; };
const fail = code => { throw new Error(`nmls_second_final_reservation_${code}`); };
const leaseFor = (i, sessionId, active) => ({ student_id: i.actorId, attempt_id: i.review.id,
  session_id: sessionId, phase_kind: 'remediation', phase_owner_id: i.firstFinal.id, phase_active: active });
const projected = (r, course) => ({ ...compactNmlsReviewOutcome({ progress: projectNmlsReview(r, course) }).progress,
  lessons: [], quiz: null, feedback: null });
const layoutFor = course => course.modules.map(m => ({ id: m.id, units: m.units.map(u => ({ id: u.id,
  requiredMs: u.requiredSeconds * 1000, requiredActionIds: [u.actionQuestion.id] })),
  passPercent: m.quiz.passPercent, questionsPerAttempt: m.quiz.questionsPerAttempt }));

function childFromSource(i) {
  const s = i.sourceCourse, f = i.firstFinal, m = f.remediation_manifest;
  // Exact existing child construction, WITHOUT grading on a historical read.
  // Source payload and immutable saved failed-result/manifest were checked by
  // validateNmlsFirstFinalHandoffHistory. Verify the derived bytes, not labels.
  const child = { id: `${s.id}-remediation-${f.id}`, title: 'Private final review — targeted module practice',
    mode: 'non_credit_review', salesAuthorized: false, approvalId: null,
    modules: structuredClone(s.modules.filter(module => m.moduleIds.includes(module.id))),
    editorial: { completeCourse: false, finalExamIncluded: false, validatedDuration: false,
      sourceCourseKey: s.id, sourceCourseDigest: s.digest, definitionDigest: i.definition.digest,
      finalAttemptId: f.id, reviewAttemptId: i.review.id, studentDeliveryEnabled: false, creditIssuanceAllowed: false,
      notice: 'Provider-selected draft remediation. Reuses taught lessons and formative practice, not final answers. No new CE credit.' } };
  if (child.id !== m.courseKey || hash(child) !== m.contentDigest) fail('child_digest');
  return { ...child, digest: m.contentDigest };
}

function eventScope(e, i) {
  if (!plain(e) || e.student_id !== i.actorId || !uuid(e.event_id) || e.review_attempt_id !== i.review.id ||
      e.phase_kind !== 'remediation' || e.phase_owner_id !== i.firstFinal.id || !sha(e.command_digest) ||
      !integer(e.source_revision) || e.source_revision < 1 || e.source_revision > i.review.revision ||
      !integer(e.workflow_revision) || e.workflow_revision < 2 || e.workflow_revision > i.workflow.revision ||
      !integer(e.runtime_revision) || e.runtime_revision < 1 || e.runtime_revision > i.workflow.runtime.revision ||
      !integer(e.actor_revision) || e.actor_revision < 1 || e.actor_revision > i.actorPolicy.revision ||
      !integer(e.transaction_id) || e.transaction_id < 1 || !date(e.recorded_at) ||
      !plain(e.outcome) || e.outcome.actorRevision !== e.actor_revision ||
      !plain(e.audit?.review) || !instant(e.audit.review.atMs) ||
      Math.abs(Date.parse(e.recorded_at) - e.audit.review.atMs) > 1000) fail('child_event');
}

function handoffOrigin(i, child, phase) {
  const h = i.handoffOrigin, t = i.handoffOriginTeachingEvent;
  eventScope(t, i);
  if (!plain(h) || h.student_id !== i.actorId || h.event_id !== t.event_id || h.final_id !== i.firstFinal.id ||
      h.review_attempt_id !== i.review.id || h.genesis_event_id !== i.submissionEvent.event_id ||
      h.definition_digest !== i.definition.digest || h.teaching_digest !== child.digest || !same(h.phase_scope, phase) ||
      h.source_revision !== t.source_revision || h.final_revision !== 2 || h.delivery_revision !== i.delivery.revision ||
      h.workflow_revision !== 2 || t.workflow_revision !== 2 || h.runtime_revision !== 1 || t.runtime_revision !== 1 ||
      h.actor_revision !== t.actor_revision || h.actor_revision <= i.submissionEvent.actor_revision ||
      h.transaction_id !== t.transaction_id || !date(h.recorded_at)) fail('handoff_origin');
  const r = h.runtime, o = h.outcome, at = t.audit.review.atMs;
  const active = r?.status === 'active', outside = ['delivery_not_open', 'delivery_window_closed'].includes(o?.policyCode);
  if (!plain(r) || !['active', 'logged_out'].includes(r.status) || !instant(r.lastReceiptMs) || r.lastReceiptMs !== at ||
      at < Date.parse(i.firstFinal.submitted_at) || Date.parse(h.recorded_at) < at ||
      (active ? !uuid(r.sessionId) || r.sessionId === i.delivery.runtime.sessionId : r.sessionId !== null) ||
      !same(r, { ...startNmlsCourseReview(child), revision: 1, status: r.status, sessionId: r.sessionId,
        lastReceiptMs: at, lastActivityMs: active ? at : null })) fail('handoff_origin');
  const intent = { kind: 'start_first_remediation', attemptId: i.review.id, finalAttemptId: i.firstFinal.id,
    eventId: h.event_id, expectedSourceRevision: h.source_revision, expectedFinalRevision: 2,
    expectedDeliveryRevision: h.delivery_revision, expectedWorkflowRevision: 1, expectedRevision: 0,
    expectedActorRevision: h.actor_revision - 1, sessionId: i.delivery.runtime.sessionId };
  const command = { kind: 'resume', attemptId: i.review.id, eventId: h.event_id, phaseKind: 'remediation', phaseOwnerId: i.firstFinal.id,
    expectedSourceRevision: h.source_revision, expectedWorkflowRevision: 1, expectedRevision: 0,
    expectedActorRevision: h.actor_revision - 1, sessionId: null };
  const before = { ...leaseFor(i, intent.sessionId, false), phase_kind: 'final' }, after = leaseFor(i, r.sessionId ?? intent.sessionId, active);
  const codes = ['delivery_not_open', 'delivery_window_closed', 'rocs_document_unverified', 'rocs_required',
    'session_policy_allowed', 'break_in_progress', 'mandatory_break_required', 'rolling_study_limit', 'session_wall_limit'];
  if (!codes.includes(o?.policyCode) || active !== (!outside && o.policyCode !== 'rocs_document_unverified') ||
      h.command_digest !== hash(intent) || h.teaching_command_digest !== hash(command) || t.command_digest !== h.teaching_command_digest ||
      !same(h.lease_before, before) || !same(t.lease_before, before) || !same(h.lease_after, after) || !same(t.lease_after, after) ||
      !same(o, { ok: true, code: 'private_first_remediation_handed_off', status: 200, handedOff: true,
        finalAttemptId: i.firstFinal.id, finalRevision: 2, sourceRevision: h.source_revision, deliveryRevision: h.delivery_revision,
        workflowRevision: 2, runtimeRevision: 1, actorRevision: h.actor_revision, sessionId: r.sessionId, runtimeStatus: r.status,
        teachingOk: active, teachingStatus: active ? 200 : 401, teachingCode: active ? 'review_session_started' : 'course_logout_required',
        policyCode: o.policyCode, observationCode: outside ? 'outside_window_no_settlement' : 'study_observation_ready',
        mode: 'private_authoring_review', deliveryAllowed: false, studentDeliveryEnabled: false, creditIssuanceAllowed: false, retakeEnabled: false }) ||
      t.outcome.ok !== active || t.outcome.status !== o.teachingStatus || t.outcome.code !== o.teachingCode ||
      t.outcome.policyCode !== o.policyCode || t.outcome.observationCode !== o.observationCode ||
      t.outcome.observationReady !== !outside || t.outcome.deliveryAllowed !== false || t.outcome.deliveryUntilMs !== null ||
      t.outcome.studyWindow !== null || t.outcome.studyRecovery !== null || t.outcome.teachingPhaseComplete !== false ||
      !same(t.outcome.progress, projected(r, child)) ||
      !same(t.audit, { review: { kind: 'resume', atMs: at, ...(active ? { reason: 'explicit_resume_current_unit_restart',
        invalidatedMs: 0, invalidatedUnitId: null, abandonedQuizId: null } : {}) },
        policy: { kind: 'open_session', code: o.policyCode, atMs: at, actorId: i.actorId, offeringId: i.binding.offering.id,
          contentDigest: i.sourceCourse.digest, policyId: i.binding.policy_id },
        observation: outside ? { reason: 'outside_window_preserved' } : { reason: 'no_prior_material', code: 'study_observation_ready' } })) fail('handoff_origin');
  return Math.max(at, Date.parse(h.recorded_at), Date.parse(t.recorded_at));
}

function completeRuntime(r, course) {
  const units = course.modules.flatMap(m => m.units);
  if (!plain(r) || r.mode !== 'non_credit_review' || r.creditIssuanceAllowed !== false || r.courseKey !== course.id ||
      r.contentDigest !== course.digest || r.status !== 'review_complete' || !uuid(r.sessionId) || !integer(r.revision) ||
      !instant(r.lastReceiptMs) || !instant(r.lastActivityMs) || r.lastActivityMs > r.lastReceiptMs ||
      r.current !== null || r.quiz !== null || r.bookmark != null || r.quizReservation != null ||
      !same(r.completedUnitIds, units.map(u => u.id)) || !same(r.passedModuleIds, course.modules.map(m => m.id)) ||
      r.completedReviewMs !== units.reduce((sum, u) => sum + u.requiredSeconds * 1000, 0)) fail('child_incomplete');
}

function terminalOrigin(i, child, phase, handoffAt) {
  const e = i.terminalChildEvent, last = i.latestChildEvent, r = i.workflow.runtime;
  eventScope(e, i); eventScope(last, i); completeRuntime(r, child);
  const a = e.audit, at = a.review.atMs, o = e.outcome, m = child.modules.at(-1), w = a.observation?.windowBefore;
  if (e.workflow_revision <= 2 || e.actor_revision <= i.handoffOrigin.actor_revision || at < handoffAt ||
      e.runtime_revision >= e.workflow_revision || o.ok !== true || o.status !== 200 || o.code !== 'module_review_passed' ||
      o.policyCode !== 'session_policy_allowed' || o.observationReady !== true || o.teachingPhaseComplete !== true ||
      o.deliveryAllowed !== false || o.deliveryUntilMs !== null || o.studyWindow !== null || o.studyRecovery !== null ||
      !same(o.progress, projected({ ...r, revision: e.runtime_revision }, child)) ||
      a.review.kind !== 'quiz_submit' || a.review.moduleId !== m.id || !uuid(a.review.quizId) || a.review.passed !== true ||
      a.review.total !== m.quiz.questionsPerAttempt || !integer(a.review.correct) || a.review.correct > a.review.total ||
      a.review.correct * 100 < m.quiz.passPercent * a.review.total || r.lastActivityMs !== at ||
      at < i.binding.offering.opensAtMs || at >= i.binding.offering.closesAtMs ||
      !same(e.lease_before, leaseFor(i, r.sessionId, true)) || !same(e.lease_after, leaseFor(i, r.sessionId, false))) fail('terminal_origin');
  if (!exact(w, ['id', 'scope', 'materialDigest', 'runtimeRevision', 'openingEventId', 'issuedAtMs', 'horizonMs', 'lastObservedAtMs']) ||
      !uuid(w.id) || !uuid(w.openingEventId) || !sha(w.materialDigest) || w.runtimeRevision !== e.runtime_revision - 1 ||
      !same(w.scope, { actorId: i.actorId, attemptId: i.review.id, offeringId: i.binding.offering.id,
        contentDigest: child.digest, sessionId: r.sessionId, teachingPhase: phase }) ||
      !instant(w.issuedAtMs) || !instant(w.horizonMs) || w.issuedAtMs > at || w.horizonMs < at ||
      w.horizonMs <= w.issuedAtMs || w.horizonMs - (w.lastObservedAtMs ?? w.issuedAtMs) > P.maximumObservationMs ||
      w.issuedAtMs < handoffAt || w.horizonMs > i.binding.offering.closesAtMs ||
      w.lastObservedAtMs !== null && (!instant(w.lastObservedAtMs) || w.lastObservedAtMs < w.issuedAtMs || w.lastObservedAtMs > at) ||
      at - (w.lastObservedAtMs ?? w.issuedAtMs) > P.maximumObservationMs ||
      !same(a.observation.closedWindow, { ...w, lastObservedAtMs: at })) fail('terminal_window');
  const first = w.lastObservedAtMs === null, observationCode = first ? 'study_material_acknowledged' : 'study_receipt_continuous';
  const policy = { kind: 'check_access', code: 'session_policy_allowed', atMs: at, actorId: i.actorId,
    offeringId: i.binding.offering.id, contentDigest: i.sourceCourse.digest, policyId: i.binding.policy_id };
  if (!same(a, { review: { kind: 'quiz_submit', atMs: at, quizId: a.review.quizId, moduleId: m.id,
      correct: a.review.correct, total: a.review.total, passed: true },
    policy: { ...policy, ...(!first && at > w.lastObservedAtMs ? { observation: { ...policy, kind: 'observe_study', code: 'study_interval_recorded' } } : {}) },
    observation: { windowBefore: w, firstAcknowledgment: first, signal: 'authenticated_material_receipt_not_identity_proof',
      ...(first ? { initialExposure: { method: 'initial_material_gap_restriction_only_v1', windowId: w.id,
        debitStartMs: w.issuedAtMs, debitEndMs: at, observedStudyAddedMs: 0, creditAddedMs: 0 } } : {}),
      closedWindow: { ...w, lastObservedAtMs: at }, code: observationCode } }) || o.observationCode !== observationCode) fail('terminal_audit');
  if (last.workflow_revision < e.workflow_revision || last.runtime_revision < e.runtime_revision || last.actor_revision < e.actor_revision ||
      last.audit.review.atMs < at || last.runtime_revision !== r.revision ||
      last.outcome.teachingPhaseComplete !== true || last.outcome.deliveryAllowed !== false || last.outcome.deliveryUntilMs !== null ||
      last.outcome.studyWindow !== null || last.outcome.studyRecovery !== null || !same(last.outcome.progress, projected(r, child)) ||
      last.audit.review.atMs !== r.lastReceiptMs || !same(last.lease_after, leaseFor(i, r.sessionId, false))) fail('latest_child_event');
  return Math.max(at, Date.parse(e.recorded_at), Date.parse(last.recorded_at));
}

export function validateNmlsSecondFinalReservationSelection(selection, { definition, firstSelection, reviewAttemptId, expectedId }) {
  if (!exact(selection, ['schema', 'id', 'reviewAttemptId', 'definitionDigest', 'number', 'questionIds', 'optionOrder']) ||
      !uuid(selection.id) || selection.id !== expectedId || selection.id === firstSelection.id || selection.id === reviewAttemptId ||
      selection.number !== 2 || selection.reviewAttemptId !== reviewAttemptId || selection.definitionDigest !== definition.digest ||
      !Array.isArray(selection.questionIds) || selection.questionIds.some(id => firstSelection.questionIds.includes(id))) fail('invalid_selection');
  projectNmlsDraftFinal(definition, selection);
  return selection;
}

// No grading, draw or transition occurs here.037 origin and the actual terminal
//032 event are necessary even if a current row merely says review_complete.
export function validateNmlsSecondFinalReservationHistory(input) {
  const origin = validateNmlsFirstFinalHandoffHistory(input), course = childFromSource(input);
  const phase = { version: 'nmls-teaching-phase-v1', kind: 'remediation', ownerId: input.firstFinal.id,
    sourceCourseKey: input.sourceCourse.id, sourceContentDigest: input.sourceCourse.digest, teachingCourseKey: course.id,
    policyDigest: input.binding.policy_digest, definitionDigest: input.definition.digest, manifestDigest: hash(input.workflow.manifest) };
  const pin = input.childBinding;
  if (!plain(pin) || pin.student_id !== input.actorId || pin.review_attempt_id !== input.review.id ||
      pin.phase_kind !== 'remediation' || pin.phase_owner_id !== input.firstFinal.id || !same(pin.phase_scope, phase) ||
      pin.teaching_digest !== course.digest || !same(pin.layout, layoutFor(course))) fail('child_binding');
  const handoffAt = handoffOrigin(input, course, phase), terminalAt = terminalOrigin(input, course, phase, handoffAt);
  if (input.workflow.status === 'remediating') {
    if (['second_id', 'second_selection', 'second_answers', 'second_result', 'second_issued_at', 'second_submitted_at']
      .some(k => input.workflow[k] !== null)) fail('second_history');
  } else {
    validateNmlsSecondFinalReservationSelection(input.workflow.second_selection, { definition: input.definition,
      firstSelection: input.firstFinal.selection, reviewAttemptId: input.review.id, expectedId: input.workflow.second_id });
    if (!date(input.workflow.second_issued_at) || Date.parse(input.workflow.second_issued_at) < input.terminalChildEvent.audit.review.atMs ||
        (input.workflow.status === 'second_issued' ? input.workflow.second_answers !== null || input.workflow.second_result !== null ||
          input.workflow.second_submitted_at !== null : !exact(input.workflow.second_answers, input.workflow.second_selection.questionIds) ||
          Object.values(input.workflow.second_answers).some(v => !['A', 'B', 'C', 'D'].includes(v)) ||
          !plain(input.workflow.second_result) || input.workflow.second_result.passed !== (input.workflow.status === 'passed') ||
          input.workflow.second_result.creditIssuanceAllowed !== false || input.workflow.second_result.courseCompletionIssued !== false ||
          input.workflow.second_result.assignedCreditSeconds !== 0 || !date(input.workflow.second_submitted_at) ||
          Date.parse(input.workflow.second_submitted_at) < Date.parse(input.workflow.second_issued_at))) fail('second_history');
  }
  return freeze({ phase, course, notBeforeMs: Math.max(origin.notBeforeMs, handoffAt, terminalAt, input.workflow.runtime.lastReceiptMs) });
}

export function makeNmlsSecondFinalReservationContext(input) {
  const history = validateNmlsSecondFinalReservationHistory(input);
  if (input.workflow.status !== 'remediating' || ['second_id', 'second_selection', 'second_answers', 'second_result', 'second_issued_at', 'second_submitted_at']
    .some(k => input.workflow[k] !== null) || input.workflow.revision !== input.latestChildEvent.workflow_revision ||
    !same(input.lease, leaseFor(input, input.workflow.runtime.sessionId, false))) fail('not_reservable');
  const j = input.actorPolicy.ledger.observationJournal;
  if (!exact(j, ['version', 'actorId', 'lastReceiptMs', 'active', 'unresolved', 'creditIssuanceAllowed']) ||
      j.version !== 'nmls-study-windows-v3-phase' || j.actorId !== input.actorId || j.creditIssuanceAllowed !== false ||
      !instant(j.lastReceiptMs) || j.lastReceiptMs < input.terminalChildEvent.audit.review.atMs || j.lastReceiptMs > input.actorPolicy.ledger.lastReceiptMs ||
      j.active !== null || j.unresolved !== null) fail('observation_history');
  const teaching = makeNmlsRemediationTeachingContext(input);
  if (!same(teaching.course, history.course)) fail('child_digest');
  const reservationPhase = Object.freeze({});
  const result = { reservationPhase, ...teaching, ledger: structuredClone(input.actorPolicy.ledger),
    sourceCourse: structuredClone(input.sourceCourse), definition: structuredClone(input.definition),
    sourceRuntime: structuredClone(input.review.runtime), firstSelection: structuredClone(input.firstFinal.selection),
    firstAnswers: structuredClone(input.firstFinal.answers) };
  tokens.set(reservationPhase, { teachingPhase: teaching.teachingPhase,
    payloadHash: hash(Object.fromEntries(Object.entries(result).filter(([k]) => !['reservationPhase', 'teachingPhase'].includes(k)))),
    actorId: input.actorId, attemptId: input.review.id, firstId: input.firstFinal.id,
    sourceRevision: input.review.revision, workflowRevision: input.workflow.revision, runtimeRevision: input.workflow.runtime.revision,
    actorRevision: input.actorPolicy.revision, sessionId: input.workflow.runtime.sessionId, notBeforeMs: history.notBeforeMs });
  return freeze(result);
}

export function validateNmlsSecondFinalReservationCommand(command) {
  if (!exact(command, ['kind', 'attemptId', 'firstFinalId', 'eventId', 'expectedSourceRevision', 'expectedFinalRevision',
    'expectedWorkflowRevision', 'expectedRevision', 'expectedActorRevision', 'sessionId']) || command.kind !== 'reserve_second_final' ||
      !uuid(command.attemptId) || !uuid(command.firstFinalId) || command.attemptId === command.firstFinalId ||
      !uuid(command.eventId) || !uuid(command.sessionId) || command.expectedFinalRevision !== 2 ||
      !integer(command.expectedSourceRevision) || command.expectedSourceRevision < 1 ||
      !integer(command.expectedWorkflowRevision) || command.expectedWorkflowRevision < 3 ||
      !integer(command.expectedRevision) || command.expectedRevision < 2 ||
      !integer(command.expectedActorRevision) || command.expectedActorRevision < 1) fail('invalid_command');
  return command;
}

export function createNmlsSecondFinalReservationEvaluator({ newId = randomUUID, draw = drawNmlsDraftFinal } = {}) {
  if (typeof newId !== 'function' || typeof draw !== 'function') fail('invalid_factory');
  const evaluate = createNmlsObservedPolicyReviewEvaluator();
  return async context => {
    const pinned = tokens.get(context?.reservationPhase);
    if (!pinned) fail('untrusted_context');
    const intent = structuredClone(validateNmlsSecondFinalReservationCommand(context.command));
    const keys = ['course', 'runtime', 'offering', 'ledger', 'sourceCourse', 'definition', 'sourceRuntime', 'firstSelection', 'firstAnswers'];
    const values = Object.fromEntries(keys.map(k => [k, context[k]]));
    if (context.teachingPhase !== pinned.teachingPhase || hash(values) !== pinned.payloadHash || context.evidence?.actorId !== pinned.actorId ||
        !instant(context.evidence.receivedAtMs) || context.evidence.receivedAtMs < pinned.notBeforeMs) fail('context_changed');
    if (intent.attemptId !== pinned.attemptId || intent.firstFinalId !== pinned.firstId ||
        intent.expectedSourceRevision !== pinned.sourceRevision || intent.expectedWorkflowRevision !== pinned.workflowRevision ||
        intent.expectedRevision !== pinned.runtimeRevision || intent.expectedActorRevision !== pinned.actorRevision ||
        intent.sessionId !== pinned.sessionId) fail('revision_or_session_conflict');
    const c = structuredClone(values), at = context.evidence.receivedAtMs;
    const command = { kind: 'check_access', attemptId: intent.attemptId, eventId: intent.eventId, phaseKind: 'remediation',
      phaseOwnerId: intent.firstFinalId, expectedSourceRevision: intent.expectedSourceRevision,
      expectedWorkflowRevision: intent.expectedWorkflowRevision, expectedRevision: intent.expectedRevision,
      expectedActorRevision: intent.expectedActorRevision, sessionId: intent.sessionId };
    const r = await evaluate({ teachingPhase: context.teachingPhase, course: c.course, runtime: c.runtime, offering: c.offering,
      ledger: c.ledger, command, evidence: { actorId: pinned.actorId, receivedAtMs: at } });
    completeRuntime(r.runtime, c.course);
    if (r.runtime.sessionId !== c.runtime.sessionId || r.runtime.lastActivityMs !== c.runtime.lastActivityMs ||
        r.outcome.deliveryAllowed !== false || r.outcome.deliveryUntilMs !== null || r.outcome.studyWindow !== null || r.outcome.studyRecovery !== null ||
        r.outcome.progress.lessons.length || r.outcome.progress.quiz !== null || r.outcome.progress.feedback !== null ||
        r.ledger.observationJournal.active !== null || r.ledger.observationJournal.unresolved !== null || r.audit.policy.observation !== undefined) fail('unexpected_teaching');
    let allowed = r.outcome.ok === true && r.outcome.status === 200 && r.outcome.policyCode === 'session_policy_allowed' &&
      r.outcome.observationReady === true && r.outcome.observationCode === 'study_observation_ready';
    let code = allowed ? 'second_final_reservation_allowed' : 'second_final_policy_refused';
    if (allowed) {
      const usage = nmlsRestrictionUsage(r.ledger, at), union = unionNmlsExposureIntervals(r.ledger.studyIntervals, r.ledger.uncertainExposure.intervals);
      const since = Math.max(usage.sinceBreakMs, nmlsExposureInRange(union, r.ledger.studyBoundaryAtMs ?? at, at));
      allowed = at >= c.offering.opensAtMs && at < c.offering.closesAtMs && instant(r.ledger.sessionStartedAtMs) &&
        at < r.ledger.sessionStartedAtMs + P.sessionWallLimitMs && r.ledger.breakStartedAtMs === null &&
        since < P.breakAfterStudyMs && usage.rollingMs < P.rollingStudyLimitMs;
      // Contradictory scalar/union accounting is invalid server state, not a
      // genuine policy refusal. Do not persist an invented mixed audit/result.
      if (!allowed) fail('exposure_review_required');
    }
    let selection = null;
    if (allowed) {
      const id = newId();
      selection = structuredClone(await draw(structuredClone(c.definition), { id, reviewAttemptId: pinned.attemptId,
        reviewState: structuredClone(c.sourceRuntime), previous: { attempt: structuredClone(c.firstSelection),
          answers: structuredClone(c.firstAnswers), remediationState: structuredClone(c.runtime) } }, { course: structuredClone(c.sourceCourse) }));
      validateNmlsSecondFinalReservationSelection(selection, { definition: c.definition, firstSelection: c.firstSelection,
        reviewAttemptId: pinned.attemptId, expectedId: id });
    }
    return { command, runtime: r.runtime, ledger: r.ledger, outcome: r.outcome, audit: r.audit,
      reservation: { reserved: allowed, code, selection } };
  };
}
