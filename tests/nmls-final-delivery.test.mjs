import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeFinalDeliveryFixture } from './helpers/nmls-final-delivery-fixture.mjs';
import { makeNmlsFirstFinalDeliveryContext } from '../lib/nmls-final-delivery-context.mjs';
import { createNmlsFirstFinalDeliveryEvaluator, startNmlsFirstFinalDelivery, validateNmlsFirstFinalDeliveryCommand } from '../lib/nmls-final-delivery.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { NMLS_OSS_REQUIREMENTS as R } from '../config/nmls/oss-policy.mjs';
import { nmlsRestrictionUsage } from '../lib/nmls-uncertain-exposure.mjs';

// All rows, identity/document evidence and clocks are SYNTHETIC. This is pure
// domain coverage, not a SQL transaction, actual exam delivery, identity test,
// credit, human timing validation or proof of cross-device concurrency.
async function harness(mutate = () => {}, options = {}) {
  const f = await makeFinalDeliveryFixture(); mutate(f);
  const source = makeNmlsFirstFinalDeliveryContext(f.input), evaluate = createNmlsFirstFinalDeliveryEvaluator(options);
  let runtime = startNmlsFirstFinalDelivery(source.finalPhase), ledger = structuredClone(f.ledger), now = f.timeMs;
  return { f, source, evaluate, get runtime() { return runtime; }, get ledger() { return ledger; }, get now() { return now; },
    set ledger(v) { ledger = v; }, set runtime(v) { runtime = v; },
    context(kind, extra = {}, at = now + 1, receipt = true) {
      // Like a future server adapter, reload/rebrand current actor authority
      // per request; an old token must not authorize a different ledger.
      const current = makeNmlsFirstFinalDeliveryContext({ ...f.input,
        actorPolicy: { ...f.input.actorPolicy, revision: ledger.revision, ledger } });
      return { ...current, runtime, ledger, command: { kind, eventId: randomUUID(), expectedRevision: runtime.revision,
        expectedActorRevision: ledger.revision, sessionId: runtime.sessionId,
        ...(receipt && ledger.observationJournal?.active ? { studyReceipt: { windowId: ledger.observationJournal.active.id, visible: true } } : {}), ...extra },
      evidence: { actorId: f.input.actorId, receivedAtMs: at } };
    },
    act(kind, extra = {}, at = now + 1, receipt = true) {
      const c = this.context(kind, extra, at, receipt), before = structuredClone(c);
      const r = evaluate(c);
      assert.deepEqual(c, before, 'never mutate authoritative inputs');
      assert.equal(r.runtime.revision, runtime.revision + 1); assert.equal(r.ledger.revision, ledger.revision + 1);
      assert.equal(r.outcome.deliveryAllowed, false); assert.equal(r.outcome.studentDeliveryEnabled, false);
      assert.equal(r.outcome.creditIssuanceAllowed, false); assert.equal(r.audit.instructionalTimeAddedMs, 0);
      assert.equal(r.outcome.finalRevision, 1);
      for (const k of ['questions', 'answers', 'selection', 'result', 'grade', 'rationale', 'correctChoice']) {
        assert.equal(Object.hasOwn(r, k), false); assert.equal(Object.hasOwn(r.outcome, k), false);
      }
      runtime = r.runtime; ledger = r.ledger; now = at; return r;
    } };
}
const closed = r => {
  assert.equal(r.outcome.candidateMaterialAllowed, false); assert.equal(r.outcome.candidateUntilMs, null);
  assert.equal(r.outcome.candidateWindow, null); assert.equal(r.outcome.deliveryAllowed, false);
};

test('first-final candidate uses own session and preserves source, reservation and exact form across clean resume', async () => {
  const h = await harness(), original = structuredClone(h.f.input), oldLedger = structuredClone(h.ledger);
  const opened = h.act('activate', {}, h.now + R.idleLogoutMs + 1);
  assert.equal(opened.outcome.candidateMaterialAllowed, true, 'completed source activity clock is not the final clock');
  assert.equal(h.runtime.lastActivityMs, h.now); assert.notEqual(h.runtime.sessionId, h.f.input.review.runtime.sessionId);
  assert.equal(h.ledger.sessionStartedAtMs, oldLedger.sessionStartedAtMs, 'not a new actor allowance');
  assert.equal(h.ledger.studySinceBreakMs, oldLedger.studySinceBreakMs); assert.deepEqual(h.ledger.acceptances, oldLedger.acceptances);
  h.act('heartbeat'); h.act('interaction', { visible: true });
  const session = h.runtime.sessionId, window = h.ledger.observationJournal.active.id;
  closed(h.act('pause')); assert.equal(h.runtime.status, 'paused');
  const next = h.act('resume'); assert.equal(next.outcome.candidateMaterialAllowed, true);
  assert.notEqual(h.runtime.sessionId, session); assert.notEqual(h.ledger.observationJournal.active.id, window);
  assert.equal(h.ledger.observationJournal.active.materialDigest, h.source.finalPhase.scope.selectionDigest);
  assert.deepEqual(h.f.input, original); assert.deepEqual(h.source.selection, original.reservedFinal.selection);
});

test('first acknowledgment budgets only restriction exposure; subsequent visible interaction records activity without instructional credit', async () => {
  const h = await harness(); h.act('activate'); const activatedAt = h.now, prior = structuredClone(h.ledger);
  const first = h.act('interaction', { visible: true }, h.now + 5000);
  assert.equal(first.outcome.candidateMaterialAllowed, true);
  assert.equal(h.runtime.lastActivityMs, activatedAt, 'first receipt is not a new gesture');
  assert.deepEqual(h.ledger.studyIntervals, prior.studyIntervals); assert.equal(h.ledger.lastStudyAtMs, prior.lastStudyAtMs);
  assert.equal(h.ledger.studySinceBreakMs, prior.studySinceBreakMs);
  assert.equal(nmlsRestrictionUsage(h.ledger, h.now).sinceBreakMs - nmlsRestrictionUsage(prior, activatedAt).sinceBreakMs, 5000);
  const follow = h.act('interaction', { visible: true }, h.now + 2000);
  assert.equal(h.runtime.lastActivityMs, h.now); assert.equal(h.ledger.studySinceBreakMs, prior.studySinceBreakMs + 2000);
  assert.equal(follow.audit.policy.observation.code, 'study_interval_recorded');
  assert.equal(h.source.sourceRuntime.completedReviewMs, h.f.input.review.runtime.completedReviewMs);
});

test('polling never refreshes six-minute activity; exact boundary logs out before a requested resume', async () => {
  const h = await harness(); h.act('activate'); const started = h.now;
  for (let offset = 20000; offset < R.idleLogoutMs; offset += 20000) {
    const r = h.act('heartbeat', {}, started + offset);
    assert.equal(r.outcome.candidateMaterialAllowed, true); assert.equal(h.runtime.lastActivityMs, started);
  }
  const oldSession = h.runtime.sessionId;
  const expired = h.act('resume', {}, started + R.idleLogoutMs);
  closed(expired); assert.equal(expired.outcome.status, 401); assert.equal(expired.outcome.code, 'inactivity_logout');
  assert.equal(h.runtime.sessionId, oldSession); assert.equal(h.runtime.lastActivityMs, started);
  assert.equal(h.ledger.observationJournal.active, null);
  assert.equal(h.act('resume').outcome.candidateMaterialAllowed, true);
  assert.notEqual(h.runtime.sessionId, oldSession);
});

test('hidden material retains its original window; recovery budgets the entire gap and requires a fresh full pause', async () => {
  const h = await harness(); h.act('activate'); h.act('heartbeat');
  const w = structuredClone(h.ledger.observationJournal.active), source = structuredClone(h.f.input);
  const hidden = h.act('interaction', { visible: false }, h.now + 1000);
  closed(hidden); assert.equal(h.runtime.status, 'paused'); assert.equal(hidden.outcome.observationCode, 'visibility_interrupted');
  assert.deepEqual(h.ledger.observationJournal.unresolved.window, w);
  closed(h.act('begin_break')); closed(h.act('end_break', {}, h.now + P.minimumBreakMs));
  assert.ok(h.ledger.observationJournal.unresolved, 'a break never washes out held exposure');
  const timeBefore = h.ledger.studySinceBreakMs, intervalsBefore = structuredClone(h.ledger.studyIntervals);
  const recovered = h.act('recover_observation', { recoveryWindowId: w.id }); closed(recovered);
  assert.equal(recovered.outcome.code, 'observation_recovered'); assert.equal(h.ledger.observationJournal.unresolved, null);
  assert.equal(h.ledger.studySinceBreakMs, timeBefore); assert.deepEqual(h.ledger.studyIntervals, intervalsBefore);
  assert.equal(recovered.audit.observation.recovery.debitStartMs, w.lastObservedAtMs);
  assert.equal(recovered.audit.observation.recovery.debitEndMs, h.now);
  assert.equal(recovered.outcome.resumeNotBeforeMs, h.now + P.minimumBreakMs);
  closed(h.act('resume')); closed(h.act('end_break'));
  h.act('end_break', {}, recovered.outcome.resumeNotBeforeMs);
  assert.equal(h.act('resume').outcome.candidateMaterialAllowed, true);
  assert.deepEqual(h.f.input, source);
});

test('lost response and late/missing receipts cannot redraw, reset activity, or resume past an unresolved window', async () => {
  for (const cause of ['missing', 'late', 'stale']) {
    const h = await harness(); h.act('activate'); const activity = h.runtime.lastActivityMs, selection = structuredClone(h.source.selection);
    const extra = cause === 'stale' ? { studyReceipt: { windowId: randomUUID(), visible: true } } : {};
    const r = h.act('resume', extra, h.now + (cause === 'late' ? P.maximumObservationMs + 1 : 1), cause !== 'missing');
    closed(r); assert.ok(h.ledger.observationJournal.unresolved); assert.equal(h.runtime.lastActivityMs, activity);
    closed(h.act('resume')); assert.ok(h.ledger.observationJournal.unresolved);
    assert.deepEqual(h.source.selection, selection); assert.equal(h.runtime.status, 'paused');
  }
});

test('material revision and rejected observation settlement remain review holds, not eligible recovery', async () => {
  for (const cause of ['revision', 'settlement']) {
    const h = await harness(); h.act('activate'); h.act('heartbeat');
    if (cause === 'revision') h.ledger.observationJournal.active.runtimeRevision--;
    else h.ledger.lastStudyAtMs = h.now + 10; // explicit corrupt-history fault fixture
    const r = h.act('heartbeat', {}, h.now + 20); closed(r);
    assert.equal(r.outcome.recovery, null);
    const w = h.ledger.observationJournal.unresolved.window;
    const hold = h.act('recover_observation', { recoveryWindowId: w.id }); closed(hold);
    assert.equal(hold.outcome.code, 'recovery_review_required'); assert.ok(h.ledger.observationJournal.unresolved);
  }
});

test('actor break, daily and wall limits survive activation instead of receiving a fresh exam allowance', async () => {
  for (const [reason, mutate] of [
    ['mandatory_break_required', l => { l.studySinceBreakMs = P.breakAfterStudyMs; }],
    ['rolling_study_limit', (l, t) => { l.studyIntervals = [{ start: t - P.rollingStudyLimitMs, end: t }];
      l.studyBoundaryAtMs = t; l.studySinceBreakMs = 0; l.lastStudyAtMs = t; }],
    ['session_wall_limit', (l, t) => { l.sessionStartedAtMs = t - P.sessionWallLimitMs; l.lastStudyAtMs = t; }],
    ['break_in_progress', (l, t) => { l.breakStartedAtMs = t; }],
  ]) {
    const h = await harness(); mutate(h.ledger, h.now); const session = h.ledger.sessionStartedAtMs;
    const r = h.act('activate'); closed(r); assert.equal(r.outcome.policyCode, reason);
    assert.equal(h.runtime.sessionId, null); assert.equal(h.runtime.lastActivityMs, null);
    assert.equal(h.ledger.sessionStartedAtMs, session);
  }
});

test('first-ack restriction debit reaches the break boundary without awarding study or renewing material', async () => {
  const h = await harness();
  const existingUncertainty = nmlsRestrictionUsage(h.ledger, h.now).sinceBreakMs - h.ledger.studySinceBreakMs;
  h.ledger.studySinceBreakMs = P.breakAfterStudyMs - 20 - existingUncertainty;
  h.act('activate'); const study = h.ledger.studySinceBreakMs;
  const r = h.act('heartbeat', {}, h.now + 20); closed(r);
  assert.equal(r.outcome.policyCode, 'mandatory_break_required'); assert.equal(h.ledger.studySinceBreakMs, study);
  assert.equal(h.ledger.observationJournal.unresolved, null, 'timely boundary acknowledgment is not a gap');
});

test('annual cutoff clamps candidate horizon and preserves unacknowledged evidence outside the original offering', async () => {
  const h = await harness(f => { f.input.binding.offering.closesAtMs = f.timeMs + 100; });
  const r = h.act('activate'); assert.equal(r.outcome.candidateUntilMs, h.source.offering.closesAtMs);
  const prior = structuredClone(h.ledger), activity = h.runtime.lastActivityMs;
  const shut = h.act('heartbeat', {}, h.source.offering.closesAtMs); closed(shut);
  assert.equal(shut.outcome.policyCode, 'delivery_window_closed'); assert.equal(h.runtime.status, 'logged_out');
  assert.equal(h.runtime.lastActivityMs, activity); assert.deepEqual(h.ledger.observationJournal, prior.observationJournal);
  assert.deepEqual(h.ledger.studyIntervals, prior.studyIntervals); assert.deepEqual(h.ledger.uncertainExposure, prior.uncertainExposure);
});

test('foreign source, child, final and offering windows are held without modifying either input', async () => {
  for (const kind of ['source', 'remediation', 'final', 'offering']) {
    const h = await harness(); h.act('activate');
    const w = h.ledger.observationJournal.active;
    if (['source', 'remediation'].includes(kind)) { delete w.scope.finalPhase; w.scope.teachingPhase = { kind }; }
    else if (kind === 'final') w.scope.finalPhase = { ...w.scope.finalPhase, finalAttemptId: randomUUID() };
    else w.scope.offeringId = randomUUID();
    const c = h.context('heartbeat'), before = structuredClone(c);
    assert.throws(() => h.evaluate(c), /foreign_observation_window/); assert.deepEqual(c, before);
  }
});

test('malformed commands cannot inject answers, clocks, credit, unknown action or forged recovery receipts', async () => {
  const h = await harness(), valid = h.context('activate').command;
  for (const patch of [{ kind: 'submit' }, { answers: {} }, { elapsedMs: 1000 }, { receivedAtMs: h.now },
    { actorId: randomUUID() }, { creditIssuanceAllowed: true }, { expectedRevision: -1 }, { eventId: 'bad' },
    { studyReceipt: { windowId: randomUUID(), visible: true, elapsedMs: 1 } }, { recoveryWindowId: randomUUID() }]) {
    assert.throws(() => validateNmlsFirstFinalDeliveryCommand({ ...valid, ...patch }), /invalid_command|invalid_study_receipt/);
  }
  const recover = { ...valid, kind: 'recover_observation', recoveryWindowId: randomUUID(), studyReceipt: { windowId: randomUUID(), visible: true } };
  assert.throws(() => validateNmlsFirstFinalDeliveryCommand(recover), /invalid_command/);
});

test('CAS, actor, session, brand and monotonic server-clock conflicts never create a candidate', async () => {
  const h = await harness(); h.act('activate');
  for (const mutate of [c => c.command.expectedRevision--, c => c.command.expectedActorRevision--,
    c => c.command.sessionId = randomUUID(), c => c.evidence.actorId = randomUUID(),
    c => c.evidence.receivedAtMs = h.now - 1, c => c.finalPhase = structuredClone(c.finalPhase),
    c => c.offering = { ...c.offering, closesAtMs: c.offering.closesAtMs + 1 }]) {
    const c = h.context('heartbeat'); mutate(c); const before = structuredClone(c);
    assert.throws(() => h.evaluate(c), /nmls_final_delivery_/); assert.deepEqual(c, before);
  }
  assert.throws(() => h.act('activate'), /activation_sequence/);
});

test('missing old journal and contradictory sidecar cannot silently bootstrap clean budgets', async () => {
  for (const mutate of [h => delete h.ledger.observationJournal, h => h.ledger.observationJournal.version = 'nmls-study-windows-v2',
    h => h.ledger.observationJournal.actorId = randomUUID(), h => h.runtime.phaseDigest = '0'.repeat(64),
    h => h.runtime.creditIssuanceAllowed = true]) {
    const h = await harness(); mutate(h); assert.throws(() => h.act('activate'), /nmls_final_delivery_/);
  }
  const h = await harness(); h.act('activate'); h.ledger.observationJournal.active = null;
  assert.throws(() => h.act('heartbeat'), /active_window_missing/);
});

test('ROCS refusal keeps the reserved form content-free; controls cannot bootstrap without evidence', async () => {
  const h = await harness(); h.ledger.acceptances = []; const original = structuredClone(h.source.selection);
  const denial = h.act('activate'); closed(denial); assert.equal(denial.outcome.policyCode, 'rocs_required');
  const noPresentation = h.act('accept_rocs', { version: '4', documentDigest: h.source.offering.rocs.documentDigest, acknowledged: true });
  closed(noPresentation); assert.equal(noPresentation.outcome.policyCode, 'rocs_presentation_required');
  assert.deepEqual(h.source.selection, original); assert.equal(h.runtime.status, 'reserved');
});

test('preactivation logout is harmless and bad UUID factories cannot create material/session states', async () => {
  const h = await harness(); closed(h.act('logout')); assert.equal(h.runtime.status, 'reserved');
  assert.equal(h.act('activate').outcome.candidateMaterialAllowed, true);
  const badSession = await harness(() => {}, { newSessionId: () => 'bad' });
  assert.throws(() => badSession.act('activate'), /invalid_new_session/);
  const badWindow = await harness(() => {}, { newWindowId: () => 'bad' });
  assert.throws(() => badWindow.act('activate'), /invalid_new_window/);
});

test('exhausted actor or sidecar revision cannot produce an unsafe next revision or eligible candidate', async () => {
  for (const target of ['ledger', 'runtime']) {
    const h = await harness(); h[target].revision = Number.MAX_SAFE_INTEGER;
    const c = h.context('activate'), before = structuredClone(c);
    assert.throws(() => h.evaluate(c), /revision_exhausted/); assert.deepEqual(c, before);
  }
});

test('a valid phase cannot be reused with rolled-back, replaced, or under-budgeted actor evidence', async () => {
  const h = await harness(), c = h.context('activate');
  for (const mutate of [l => l.revision--, l => l.studySinceBreakMs = 0, l => l.studyIntervals = [],
    l => l.acceptances = [], l => l.uncertainExposure.intervals = []]) {
    const bad = { ...c, ledger: structuredClone(c.ledger) }; mutate(bad.ledger);
    assert.throws(() => h.evaluate(bad), /context_changed/);
  }
  assert.throws(() => h.evaluate({ ...c, evidence: { ...c.evidence, receivedAtMs: h.f.timeMs - 1 } }), /context_changed/);
});
