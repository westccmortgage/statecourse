import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeSecondFinalDeliveryFixture, makeSecondFinalDeliveryHarness as harness } from './helpers/nmls-second-final-delivery-fixture.mjs';
import { makeNmlsSecondFinalDeliveryContext, validateNmlsSecondFinalDeliveryHistory,
  nmlsSecondFinalDeliveryScope, assertNmlsSecondFinalDeliveryPhase,
  validateNmlsSecondFinalDeliveryCommand, createNmlsSecondFinalDeliveryEvaluator } from '../lib/nmls-second-final-delivery.mjs';
import { gradeNmlsDraftFinal } from '../lib/nmls-final-assessment.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { NMLS_OSS_REQUIREMENTS as R } from '../config/nmls/oss-policy.mjs';
import { nmlsRestrictionUsage } from '../lib/nmls-uncertain-exposure.mjs';

// Synthetic rows, clocks and identity evidence; genuine pure reducers. These
// tests do not prove durable SQL, browser delivery, human identity or duration.
const clone = structuredClone;
const closed = r => {
  assert.equal(r.outcome.candidateMaterialAllowed, false); assert.equal(r.outcome.candidateUntilMs, null);
  assert.equal(r.outcome.candidateWindow, null); assert.equal(r.outcome.deliveryAllowed, false);
};

test('genuine038 reserves the actual second selection and distinct stable identity without altering original histories', async () => {
  const f = await makeSecondFinalDeliveryFixture(), before = clone(f.input), c = makeNmlsSecondFinalDeliveryContext(f.input);
  const phase = nmlsSecondFinalDeliveryScope(c.finalPhase);
  assert.deepEqual(Object.keys(phase).sort(), ['actorId', 'contentDigest', 'courseKey', 'definitionDigest', 'finalAttemptId',
    'firstFinalAttemptId', 'offeringId', 'reviewAttemptId', 'selectionDigest', 'version']);
  assert.equal(phase.version, 'nmls-second-final-phase-v1'); assert.equal(phase.finalAttemptId, f.input.workflow.second_id);
  assert.equal(phase.firstFinalAttemptId, f.input.firstFinal.id); assert.notEqual(phase.finalAttemptId, phase.firstFinalAttemptId);
  assert.deepEqual(c.selection, f.input.workflow.second_selection); assert.equal(c.selection.number, 2);
  assert.equal(c.selection.questionIds.some(id => f.input.firstFinal.selection.questionIds.includes(id)), false);
  assert.deepEqual(f.input, before); assert.deepEqual(c.sourceRuntime, f.input.review.runtime);
});

test('every immutable038 pair, original source/child and completed-terminal origin is required', async () => {
  const f = await makeSecondFinalDeliveryFixture();
  for (const mutate of [
    i => i.secondReservationEvent = null, i => i.secondReservationTeachingEvent = null,
    i => i.secondReservationEvent.reserved = false, i => i.secondReservationEvent.second_id = randomUUID(),
    i => i.secondReservationEvent.command_digest = '0'.repeat(64),
    i => i.secondReservationEvent.teaching_command_digest = '0'.repeat(64),
    i => i.secondReservationEvent.phase_scope.ownerId = randomUUID(),
    i => i.secondReservationEvent.selection_digest = '0'.repeat(64),
    i => i.secondReservationEvent.runtime_before.lastReceiptMs = i.secondReservationEvent.runtime.lastReceiptMs + 1,
    i => i.secondReservationEvent.runtime_before.completedReviewMs = 0,
    i => i.secondReservationTeachingEvent.transaction_id++,
    i => i.secondReservationTeachingEvent.outcome.deliveryAllowed = true,
    i => i.secondReservationTeachingEvent.audit.policy.observation = {},
    i => i.secondReservationEvent.recorded_at = 'invalid',
    i => i.secondReservationEvent.recorded_at = new Date(f.timeMs + 1001).toISOString(),
    i => i.workflow.second_issued_at = new Date(f.timeMs - 1001).toISOString(),
    i => i.workflow.second_selection.number = 1,
    i => i.workflow.second_selection.questionIds[0] = i.firstFinal.selection.questionIds[0],
    i => i.workflow.runtime.completedUnitIds = [], i => i.terminalChildEvent = null,
    i => i.firstFinal.result.passed = true, i => i.reservation.selection_digest = '0'.repeat(64),
    i => i.childBinding.teaching_digest = i.sourceCourse.digest,
    i => i.sourceCourse.modules[0].units[0].requiredSeconds++,
  ]) { const input = clone(f.input); mutate(input); assert.throws(() => makeNmlsSecondFinalDeliveryContext(input)); }
});

test('no-grade history survives terminal workflow status but cannot brand a third or submitted form', async () => {
  const h = await harness(), input = clone(h.f.input);
  for (const correct of [0, 25]) {
    input.workflow.second_answers = h.answers(correct);
    input.workflow.second_result = gradeNmlsDraftFinal(input.definition, input.workflow.second_selection, input.workflow.second_answers);
    input.workflow.status = correct ? 'passed' : 'staff_review_required'; input.workflow.revision++;
    input.workflow.second_submitted_at = new Date(h.now + 1).toISOString();
    assert.equal(validateNmlsSecondFinalDeliveryHistory(input).phase.finalAttemptId, input.workflow.second_id);
    assert.throws(() => makeNmlsSecondFinalDeliveryContext(input), /not_reserved/);
  }
});

test('brand pins current actor ledger and refuses clones, mutated definition/selection/offering, old time or borrowed lease', async () => {
  const h = await harness(), c = h.context('activate');
  const checked = { actorId: c.evidence.actorId, receivedAtMs: c.evidence.receivedAtMs,
    definition: c.definition, selection: c.selection, offering: c.offering, ledger: c.ledger };
  assert.deepEqual(assertNmlsSecondFinalDeliveryPhase(c.finalPhase, checked), c.finalPhase.scope);
  assert.throws(() => nmlsSecondFinalDeliveryScope(clone(c.finalPhase)), /untrusted_phase/);
  for (const mutate of [
    x => x.command.expectedRevision++, x => x.command.expectedActorRevision--,
    x => x.command.sessionId = randomUUID(), x => x.evidence.actorId = randomUUID(),
    x => x.evidence.receivedAtMs = h.now - 1, x => x.finalPhase = clone(x.finalPhase),
    x => x.definition = { ...x.definition, passPercent: 0 }, x => x.selection = { ...x.selection, number: 1 },
    x => x.offering = { ...x.offering, closesAtMs: x.offering.closesAtMs + 1 },
    x => x.ledger.studySinceBreakMs = 0, x => x.ledger.studyIntervals = [], x => x.ledger.acceptances = [],
  ]) { const bad = { ...c, command: clone(c.command), evidence: clone(c.evidence), ledger: clone(c.ledger) };
    mutate(bad); assert.throws(() => h.evaluate(bad)); }
  for (const mutate of [i => i.lease.phase_owner_id = i.firstFinal.id, i => i.lease.phase_kind = 'source',
    i => i.lease.session_id = null, i => i.lease.attempt_id = randomUUID()]) {
    const input = clone(h.f.input); input.lease.phase_kind = 'second_final'; input.lease.phase_owner_id = input.workflow.second_id;
    mutate(input);
    assert.throws(() => makeNmlsSecondFinalDeliveryContext(input), /lease_scope/);
  }
});

test('activation uses own session after old child inactivity, retaining source/first/child and shared actor allowance', async () => {
  const h = await harness(), before = clone(h.f.input), prior = clone(h.ledger);
  const r = h.act('activate', {}, h.now + R.idleLogoutMs + 1), w = h.ledger.observationJournal.active;
  assert.equal(r.outcome.candidateMaterialAllowed, true); assert.equal(r.outcome.finalRevision, 2);
  assert.equal(r.runtime.version, 'nmls-second-final-delivery-v1'); assert.equal(r.runtime.finalAttemptId, h.f.input.workflow.second_id);
  for (const sid of [before.review.runtime.sessionId, before.delivery.runtime.sessionId, before.workflow.runtime.sessionId]) {
    assert.notEqual(r.runtime.sessionId, sid);
  }
  assert.equal(w.scope.finalPhase.finalAttemptId, before.workflow.second_id);
  assert.equal(w.scope.contentDigest, before.sourceCourse.digest); assert.notEqual(w.scope.contentDigest, before.workflow.runtime.contentDigest);
  assert.equal(w.materialDigest, h.context('heartbeat').finalPhase.scope.selectionDigest);
  assert.equal(h.ledger.sessionStartedAtMs, prior.sessionStartedAtMs); assert.equal(h.ledger.studySinceBreakMs, prior.studySinceBreakMs);
  assert.deepEqual(h.f.input, before); assert.deepEqual(h.ledger.acceptances, prior.acceptances);
  assert.equal(r.audit.instructionalTimeAddedMs, 0); assert.equal(r.audit.creditAddedMs, 0);
  assert.equal(r.outcome.deliveryAllowed, false); assert.equal(r.outcome.studentDeliveryEnabled, false);
  assert.equal(JSON.stringify(r).includes('correctChoice'), false); assert.equal(Object.hasOwn(r.outcome, 'questions'), false);
});

test('second first acknowledgment debits initial restriction gap but neither activity nor instructional time', async () => {
  const h = await harness(); h.act('activate'); const at = h.now, before = clone(h.ledger), activity = h.runtime.lastActivityMs;
  const first = h.act('interaction', { visible: true }, h.now + 5000);
  assert.equal(first.outcome.observationCode, 'material_acknowledged'); assert.equal(h.runtime.lastActivityMs, activity);
  assert.deepEqual(h.ledger.studyIntervals, before.studyIntervals); assert.equal(h.ledger.studySinceBreakMs, before.studySinceBreakMs);
  assert.equal(nmlsRestrictionUsage(h.ledger, h.now).sinceBreakMs - nmlsRestrictionUsage(before, at).sinceBreakMs, 5000);
  const next = h.act('interaction', { visible: true }, h.now + 1000);
  assert.equal(h.runtime.lastActivityMs, h.now); assert.equal(next.audit.policy.observation.code, 'study_interval_recorded');
  assert.equal(h.ledger.studySinceBreakMs, before.studySinceBreakMs + 1000);
});

test('second polling cannot refresh six-minute activity or override idle with resume', async () => {
  const h = await harness(); h.act('activate'); const started = h.now;
  for (let n = 20000; n < R.idleLogoutMs; n += 20000) h.act('heartbeat', {}, started + n);
  const session = h.runtime.sessionId, r = h.act('resume', {}, started + R.idleLogoutMs);
  closed(r); assert.equal(r.outcome.code, 'inactivity_logout'); assert.equal(r.outcome.status, 401);
  assert.equal(h.runtime.sessionId, session); assert.equal(h.runtime.lastActivityMs, started);
  assert.equal(h.act('resume').outcome.candidateMaterialAllowed, true); assert.notEqual(h.runtime.sessionId, session);
});

test('hidden/missing/late second windows retain original evidence and recovery imposes a new full pause', async () => {
  for (const cause of ['hidden', 'missing', 'late', 'stale']) {
    const h = await harness(); h.open(); const w = clone(h.ledger.observationJournal.active);
    const extra = cause === 'hidden' ? { visible: false } : cause === 'stale' ? { studyReceipt: { windowId: randomUUID(), visible: true } } : { visible: true };
    if (cause === 'stale') extra.visible = true;
    closed(h.act('interaction', extra, cause === 'late' ? w.horizonMs + 1 : h.now + 1, cause !== 'missing'));
    assert.deepEqual(h.ledger.observationJournal.unresolved.window, w);
    assert.throws(() => h.act('recover_observation', { recoveryWindowId: randomUUID() }), /recovery_window_conflict/);
    closed(h.act('begin_break')); closed(h.act('end_break', {}, h.now + P.minimumBreakMs));
    const before = clone(h.ledger), r = h.act('recover_observation', { recoveryWindowId: w.id }); closed(r);
    assert.equal(r.outcome.code, 'observation_recovered'); assert.equal(r.outcome.resumeNotBeforeMs, h.now + P.minimumBreakMs);
    assert.equal(r.audit.observation.recovery.debitStartMs, w.lastObservedAtMs); assert.deepEqual(h.ledger.studyIntervals, before.studyIntervals);
    assert.equal(h.ledger.studySinceBreakMs, before.studySinceBreakMs); closed(h.act('resume'));
    h.act('end_break', {}, r.outcome.resumeNotBeforeMs); assert.equal(h.act('resume').outcome.candidateMaterialAllowed, true);
  }
});

test('first/source/child/foreign second material is never translated, cleared or adopted', async () => {
  for (const scope of ['first', 'source', 'child', 'offering', 'selection']) {
    const h = await harness(); h.open(); const w = h.ledger.observationJournal.active;
    if (scope === 'first') w.scope.finalPhase = clone(h.f.input.delivery.phase_scope);
    if (scope === 'source' || scope === 'child') { delete w.scope.finalPhase; w.scope.teachingPhase = { kind: scope }; }
    if (scope === 'offering') w.scope.offeringId = randomUUID();
    if (scope === 'selection') w.materialDigest = h.f.input.reservation.selection_digest;
    const c = h.context('heartbeat'), before = clone(c);
    assert.throws(() => h.evaluate(c), /foreign_observation_window|invalid_observation_window/); assert.deepEqual(c, before);
  }
});

test('break/rolling/wall/ROCS restrictions survive second activation without a new allowance', async () => {
  for (const [code, mutate] of [
    ['mandatory_break_required', l => l.studySinceBreakMs = P.breakAfterStudyMs],
    ['break_in_progress', (l, at) => l.breakStartedAtMs = at],
    ['session_wall_limit', (l, at) => { l.sessionStartedAtMs = at - P.sessionWallLimitMs; l.lastStudyAtMs = at; }],
    ['rolling_study_limit', (l, at) => { l.studyIntervals = [{ start: at - P.rollingStudyLimitMs, end: at }];
      l.studyBoundaryAtMs = at; l.studySinceBreakMs = 0; l.lastStudyAtMs = at; }],
    ['rocs_required', l => l.acceptances = []],
  ]) {
    const h = await harness(); mutate(h.ledger, h.now); const before = h.ledger.sessionStartedAtMs;
    const r = h.act('activate'); closed(r); assert.equal(r.outcome.policyCode, code);
    assert.equal(h.runtime.sessionId, null); assert.equal(h.ledger.sessionStartedAtMs, before);
  }
});

test('original year cutoff clips second horizon and preserves outside-window evidence', async () => {
  const h = await harness(); h.f.input.binding.offering.closesAtMs = h.now + 60000;
  const r = h.act('activate', {}, h.f.input.binding.offering.closesAtMs - 100);
  assert.equal(r.outcome.candidateUntilMs, h.f.input.binding.offering.closesAtMs);
  const before = clone(h.ledger), closedYear = h.act('heartbeat', {}, h.f.input.binding.offering.closesAtMs);
  closed(closedYear); assert.equal(closedYear.outcome.policyCode, 'delivery_window_closed');
  assert.deepEqual(h.ledger.observationJournal, before.observationJournal); assert.deepEqual(h.ledger.uncertainExposure, before.uncertainExposure);
});

test('strict second commands, runtime and UUID factories reject bypass flags and borrowed sessions', async () => {
  const h = await harness(), valid = h.context('activate').command;
  for (const patch of [{ kind: 'submit_second_final' }, { answers: {} }, { actorId: randomUUID() }, { creditIssuanceAllowed: true },
    { expectedRevision: -1 }, { receivedAtMs: h.now }, { studyReceipt: { windowId: randomUUID(), visible: true, elapsedMs: 1 } }]) {
    assert.throws(() => validateNmlsSecondFinalDeliveryCommand({ ...valid, ...patch }));
  }
  for (const mutate of [x => x.runtime.version = 'nmls-first-final-delivery-v1', x => x.runtime.finalAttemptId = x.f.input.firstFinal.id,
    x => x.runtime.phaseDigest = '0'.repeat(64), x => x.runtime.creditIssuanceAllowed = true,
    x => delete x.ledger.observationJournal, x => x.ledger.observationJournal.version = 'nmls-study-windows-v2']) {
    const bad = await harness(); mutate(bad); assert.throws(() => bad.act('activate'));
  }
  for (const session of [h.f.input.review.runtime.sessionId, h.f.input.delivery.runtime.sessionId, h.f.input.workflow.runtime.sessionId, 'invalid']) {
    assert.throws(() => createNmlsSecondFinalDeliveryEvaluator({ newSessionId: () => session })(h.context('activate')), /invalid_new_session/);
  }
  assert.throws(() => createNmlsSecondFinalDeliveryEvaluator({ newWindowId: () => 'invalid' })(h.context('activate')), /invalid_new_window/);
});
