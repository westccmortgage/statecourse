import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeFinalDeliveryFixture } from './helpers/nmls-final-delivery-fixture.mjs';
import { makeNmlsFirstFinalDeliveryContext } from '../lib/nmls-final-delivery-context.mjs';
import { createNmlsFirstFinalDeliveryEvaluator, startNmlsFirstFinalDelivery } from '../lib/nmls-final-delivery.mjs';
import { createNmlsFirstFinalSubmissionEvaluator, validateNmlsFirstFinalSubmissionCommand } from '../lib/nmls-first-final-submission.mjs';
import { gradeNmlsDraftFinal, makeNmlsFinalRemediationCourse } from '../lib/nmls-final-assessment.mjs';
import { startNmlsCourseReview } from '../lib/nmls-review-runtime.mjs';
import { nmlsRestrictionUsage } from '../lib/nmls-uncertain-exposure.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { NMLS_OSS_REQUIREMENTS as R } from '../config/nmls/oss-policy.mjs';

// SYNTHETIC source completion, saved-form/ROCS row shapes and explicit clocks.
// Uses actual pure source/final reducers; no SQL, identity, actual learner
// attendance, delivery, regulatory timing, sealed attempt or credit is proved.
const clone = structuredClone;
async function harness() {
  const f = await makeFinalDeliveryFixture();
  let ledger = clone(f.ledger), now = f.timeMs;
  const branded = () => makeNmlsFirstFinalDeliveryContext({ ...f.input,
    actorPolicy: { ...f.input.actorPolicy, revision: ledger.revision, ledger } });
  let runtime = startNmlsFirstFinalDelivery(branded().finalPhase);
  const final = createNmlsFirstFinalDeliveryEvaluator();
  const h = { f, get now() { return now; }, get ledger() { return ledger; }, get runtime() { return runtime; },
    set ledger(value) { ledger = clone(value); }, set runtime(value) { runtime = clone(value); },
    answers(correct = 25) { return Object.fromEntries(f.input.reservedFinal.selection.questionIds.map((id, i) =>
      [id, i < correct ? f.input.definition.items.find(item => item.id === id).correctChoice : 'B'])); },
    context(kind = 'submit_first_final', extra = {}, at = now + 1, receipt = true) {
      return { ...branded(), sourceCourse: f.input.sourceCourse, runtime, ledger,
        command: { kind, eventId: randomUUID(), expectedRevision: runtime.revision, expectedActorRevision: ledger.revision,
          sessionId: runtime.sessionId, ...(kind === 'submit_first_final' ? { answers: h.answers() } : {}),
          ...(receipt && ledger.observationJournal.active ? { studyReceipt: {
            windowId: ledger.observationJournal.active.id, visible: true } } : {}), ...extra },
        evidence: { actorId: f.input.actorId, receivedAtMs: at } };
    },
    act(kind, extra = {}, at = now + 1, receipt = true) {
      const r = final(h.context(kind, extra, at, receipt));
      runtime = r.runtime; ledger = r.ledger; now = at; return r;
    },
    open() { h.act('activate'); h.act('heartbeat'); },
  };
  return h;
}
function evaluatorSpy() {
  let calls = 0;
  const evaluate = createNmlsFirstFinalSubmissionEvaluator({ grade(...args) { calls++; return gradeNmlsDraftFinal(...args); } });
  return { evaluate, get calls() { return calls; } };
}
function denied(r, code) {
  assert.deepEqual(r.submission, { submitted: false, code, answers: null, result: null, manifest: null, childRuntime: null });
  assert.equal(r.command.kind, 'pause'); assert.equal(Object.hasOwn(r.command, 'answers'), false);
  assert.equal(r.closing.outcome.candidateMaterialAllowed, false); assert.equal(r.closing.outcome.candidateUntilMs, null);
  assert.equal(r.closing.outcome.deliveryAllowed, false); assert.equal(r.closing.outcome.studentDeliveryEnabled, false);
  assert.equal(r.closing.outcome.creditIssuanceAllowed, false);
}

test('acknowledged final closes through actual pause and proposes only exact aggregate pass', async () => {
  const h = await harness(); h.open(); h.act('interaction', { visible: true }, h.now + 100);
  const c = h.context(), before = clone(c), inputs = clone(h.f.input), spy = evaluatorSpy();
  const r = spy.evaluate(c), expectedClose = createNmlsFirstFinalDeliveryEvaluator()({ ...c, command: r.command });
  assert.deepEqual(Object.keys(r).sort(), ['closing', 'command', 'submission']);
  assert.deepEqual(r.closing, expectedClose); assert.deepEqual(c, before); assert.deepEqual(h.f.input, inputs);
  assert.equal(spy.calls, 1); assert.equal(r.submission.submitted, true); assert.equal(r.submission.code, 'first_final_submission_allowed');
  assert.deepEqual(r.submission.answers, c.command.answers);
  assert.deepEqual(r.submission.result, gradeNmlsDraftFinal(c.definition, c.selection, c.command.answers));
  assert.equal(r.submission.result.passed, true); assert.equal(r.submission.manifest, null); assert.equal(r.submission.childRuntime, null);
  assert.equal(r.closing.runtime.status, 'paused'); assert.equal(r.closing.runtime.sessionId, h.runtime.sessionId);
  assert.equal(r.closing.runtime.lastActivityMs, h.runtime.lastActivityMs);
  assert.equal(r.closing.runtime.revision, h.runtime.revision + 1); assert.equal(r.closing.ledger.revision, h.ledger.revision + 1);
  assert.equal(r.closing.ledger.observationJournal.active, null); assert.equal(r.closing.ledger.observationJournal.unresolved, null);
  assert.equal(r.closing.audit.instructionalTimeAddedMs, 0); assert.equal(r.closing.audit.creditAddedMs, 0);
  assert.equal(r.submission.result.courseCompletionIssued, false); assert.equal(r.submission.result.assignedCreditSeconds, 0);
  assert.equal(r.closing.outcome.finalRevision, 1, 'pure close does not pretend the form is already sealed');
});

test('seventeen correct fails and initializes exact empty source-bound child; eighteen passes', async () => {
  for (const correct of [17, 18]) {
    const h = await harness(); h.open();
    const c = h.context('submit_first_final', { answers: h.answers(correct) });
    const r = createNmlsFirstFinalSubmissionEvaluator()(c);
    assert.equal(r.submission.result.correct, correct); assert.equal(r.submission.result.requiredCorrect, 18);
    assert.equal(r.submission.result.passed, correct === 18);
    if (correct === 18) { assert.equal(r.submission.childRuntime, null); assert.equal(r.submission.manifest, null); continue; }
    const child = makeNmlsFinalRemediationCourse(c.definition, c.sourceCourse, c.selection, c.command.answers);
    assert.deepEqual(r.submission.childRuntime, startNmlsCourseReview(child));
    assert.deepEqual(r.submission.manifest, { courseKey: child.id, contentDigest: child.digest,
      sourceCourseKey: c.sourceCourse.id, sourceContentDigest: c.sourceCourse.digest, definitionDigest: c.definition.digest,
      finalAttemptId: c.selection.id, reviewAttemptId: c.selection.reviewAttemptId,
      moduleIds: child.modules.map(m => m.id), unitIds: child.modules.flatMap(m => m.units.map(u => u.id)),
      completed: false, retakeEnabled: false });
    assert.notEqual(child.digest, c.sourceCourse.digest); assert.equal(r.submission.childRuntime.revision, 0);
    assert.equal(r.submission.childRuntime.status, 'logged_out'); assert.equal(r.submission.childRuntime.sessionId, null);
    assert.equal(r.submission.childRuntime.lastActivityMs, null); assert.equal(r.submission.childRuntime.lastReceiptMs, 0);
    assert.deepEqual(r.submission.childRuntime.completedUnitIds, []); assert.deepEqual(r.submission.childRuntime.passedModuleIds, []);
    assert.equal(r.submission.childRuntime.completedReviewMs, 0);
    assert.equal(Object.hasOwn(r.submission.childRuntime, 'bookmark'), false, 'exact existing starter shape, not fabricated keys');
    assert.deepEqual(child.modules[0], c.sourceCourse.modules[0], 'taught allocation and formative practice are inherited intact');
  }
});

test('already acknowledged same-millisecond submit needs no positive interval or invented minimum duration', async () => {
  const h = await harness(); h.open();
  const c = h.context('submit_first_final', {}, h.now), spy = evaluatorSpy(), r = spy.evaluate(c);
  assert.equal(r.submission.submitted, true); assert.equal(spy.calls, 1);
  assert.equal(r.closing.outcome.observationCode, 'receipt_continuous');
  assert.equal(Object.hasOwn(r.closing.audit.policy, 'observation'), false);
  assert.deepEqual(r.closing.ledger.studyIntervals, h.ledger.studyIntervals);
  assert.equal(r.closing.ledger.studySinceBreakMs, h.ledger.studySinceBreakMs);
});

test('successful pause never substitutes for activation or prior acknowledgment', async () => {
  for (const state of ['reserved', 'unacknowledged', 'paused']) {
    const h = await harness();
    if (state !== 'reserved') h.act('activate');
    if (state === 'paused') { h.act('heartbeat'); h.act('pause'); }
    const c = h.context(), spy = evaluatorSpy(), r = spy.evaluate(c);
    assert.equal(r.closing.outcome.ok, true); assert.equal(r.closing.outcome.code, 'final_paused');
    denied(r, 'first_final_policy_refused'); assert.equal(spy.calls, 0);
    if (state === 'unacknowledged') {
      assert.equal(r.closing.audit.observation.firstAcknowledgment, true);
      assert.deepEqual(r.closing.ledger.studyIntervals, h.ledger.studyIntervals);
      assert.equal(r.closing.ledger.uncertainExposure.lastBoundaryMs, c.evidence.receivedAtMs);
    }
  }
});

test('owner-loaded paused runtime with acknowledged active window fails separate prestate session gate', async () => {
  const h = await harness(); h.open(); h.runtime.status = 'paused'; // Explicit inconsistent-owner-state fixture.
  const spy = evaluatorSpy(), r = spy.evaluate(h.context());
  assert.equal(r.closing.outcome.code, 'final_paused'); assert.equal(r.closing.outcome.observationCode, 'receipt_continuous');
  denied(r, 'first_final_session_required'); assert.equal(spy.calls, 0);
});

test('missing, hidden, stale and late receipts retain actual hold without grading', async () => {
  for (const cause of ['missing', 'hidden', 'stale', 'late']) {
    const h = await harness(); h.open(); const w = clone(h.ledger.observationJournal.active);
    const extra = cause === 'hidden' ? { studyReceipt: { windowId: w.id, visible: false } } :
      cause === 'stale' ? { studyReceipt: { windowId: randomUUID(), visible: true } } : {};
    const c = h.context('submit_first_final', extra, cause === 'late' ? w.horizonMs + 1 : h.now + 1, cause !== 'missing');
    const spy = evaluatorSpy(), r = spy.evaluate(c);
    denied(r, 'first_final_policy_refused'); assert.equal(spy.calls, 0);
    assert.deepEqual(r.closing.ledger.observationJournal.unresolved.window, w);
    assert.equal(r.closing.ledger.observationJournal.active, null);
    assert.deepEqual(r.closing.ledger.studyIntervals, h.ledger.studyIntervals);
  }
});

test('unresolved hold is preserved and cannot be graded via a pause or recovery-shaped command', async () => {
  const h = await harness(); h.open(); h.act('interaction', { visible: false });
  const hold = clone(h.ledger.observationJournal.unresolved), spy = evaluatorSpy();
  const r = spy.evaluate(h.context()); denied(r, 'first_final_policy_refused');
  assert.deepEqual(r.closing.ledger.observationJournal.unresolved, hold); assert.equal(spy.calls, 0);
  assert.throws(() => spy.evaluate(h.context('submit_first_final', { recoveryWindowId: hold.window.id })), /invalid_command/);
});

test('strict original horizon excludes equality even when actual pause accepts the receipt', async () => {
  const h = await harness(); h.open(); const spy = evaluatorSpy();
  const r = spy.evaluate(h.context('submit_first_final', {}, h.ledger.observationJournal.active.horizonMs));
  assert.equal(r.closing.outcome.code, 'final_paused'); assert.equal(r.closing.outcome.ok, true);
  denied(r, 'first_final_exposure_review_required'); assert.equal(spy.calls, 0);
});

test('exact idle cutoff precedes otherwise allowed policy and never refreshes activity', async () => {
  const h = await harness(); h.open();
  h.runtime.lastActivityMs = h.now + 1 - R.idleLogoutMs; // Synthetic owner clock boundary, current window still timely.
  const spy = evaluatorSpy(), r = spy.evaluate(h.context());
  assert.equal(r.closing.outcome.policyCode, 'session_policy_allowed'); assert.equal(r.closing.outcome.code, 'inactivity_logout');
  assert.equal(r.closing.runtime.lastActivityMs, h.runtime.lastActivityMs);
  denied(r, 'first_final_policy_refused'); assert.equal(spy.calls, 0);
});

test('break/day/wall/year refusals retain actual accounting and no tentative grade', async () => {
  for (const boundary of ['break', 'daily', 'wall', 'year', 'pause']) {
    const h = await harness();
    if (boundary === 'year') h.f.input.binding.offering.closesAtMs = h.now + 10;
    h.open();
    if (boundary === 'break') h.ledger.studySinceBreakMs = P.breakAfterStudyMs - 1;
    if (boundary === 'daily') {
      h.ledger.studyIntervals = [{ start: h.now - P.rollingStudyLimitMs + 1, end: h.now }];
      h.ledger.lastStudyAtMs = h.now; h.ledger.studyBoundaryAtMs = h.now; h.ledger.studySinceBreakMs = 0;
    }
    if (boundary === 'wall') h.ledger.sessionStartedAtMs = h.now + 1 - P.sessionWallLimitMs;
    if (boundary === 'pause') h.ledger.breakStartedAtMs = h.now;
    const c = h.context('submit_first_final', {}, boundary === 'year' ? h.f.input.binding.offering.closesAtMs : h.now + 1);
    const spy = evaluatorSpy(), r = spy.evaluate(c);
    denied(r, 'first_final_policy_refused'); assert.equal(spy.calls, 0);
    if (boundary === 'year') assert.deepEqual(r.closing.ledger.observationJournal, h.ledger.observationJournal);
    assert.deepEqual(h.f.input.reservedFinal.answers, null);
  }
});

test('terminal observed-union lower bound refuses underreported scalar despite green pause', async () => {
  const h = await harness(); h.open();
  h.ledger.studyIntervals = [{ start: h.now - P.breakAfterStudyMs, end: h.now }];
  h.ledger.studyBoundaryAtMs = h.now - P.breakAfterStudyMs; h.ledger.studySinceBreakMs = 0;
  const spy = evaluatorSpy(), r = spy.evaluate(h.context());
  assert.equal(r.closing.outcome.code, 'final_paused'); assert.equal(r.closing.outcome.ok, true);
  assert.equal(r.closing.ledger.studySinceBreakMs, 1);
  denied(r, 'first_final_exposure_review_required'); assert.equal(spy.calls, 0);
});

test('uncertainty overlaps are not counted twice and successful submit preserves shared budgets', async () => {
  const h = await harness(); h.open(); h.act('interaction', { visible: true }, h.now + 1000);
  const last = h.ledger.studyIntervals.at(-1);
  h.ledger.uncertainExposure.intervals = [{ start: last.start, end: last.end }];
  h.ledger.uncertainExposure.lastBoundaryMs = last.end;
  const before = nmlsRestrictionUsage(h.ledger, h.now), r = createNmlsFirstFinalSubmissionEvaluator()(h.context());
  assert.equal(r.submission.submitted, true);
  assert.equal(nmlsRestrictionUsage(r.closing.ledger, h.now + 1).sinceBreakMs, before.sinceBreakMs + 1);
  assert.equal(r.closing.ledger.sessionStartedAtMs, h.ledger.sessionStartedAtMs);
  assert.equal(r.closing.ledger.studyBoundaryAtMs, h.ledger.studyBoundaryAtMs);
  assert.deepEqual(r.closing.ledger.uncertainExposure, h.ledger.uncertainExposure);
  assert.deepEqual(r.closing.ledger.acceptances, h.ledger.acceptances);
});

test('strict command and saved-answer-map validation rejects malformed payload before grade', async () => {
  const h = await harness(); h.open(); const c = h.context(), spy = evaluatorSpy();
  assert.equal(validateNmlsFirstFinalSubmissionCommand(c.command, c.selection), c.command);
  for (const mutate of [
    x => { x.command.kind = 'pause'; }, x => { x.command.eventId = 'bad'; }, x => { x.command.expectedRevision = -1; },
    x => { x.command.expectedActorRevision = 0.5; }, x => { x.command.sessionId = 'bad'; },
    x => { x.command.receivedAtMs = x.evidence.receivedAtMs; }, x => { x.command.result = {}; },
    x => { x.command.answers = null; }, x => { x.command.answers = []; },
    x => { delete x.command.answers[x.selection.questionIds[0]]; },
    x => { delete x.command.answers[x.selection.questionIds[0]]; x.command.answers['N26-FIN-F99'] = 'A'; },
    x => { x.command.answers[x.selection.questionIds[0]] = 0; }, x => { x.command.answers[x.selection.questionIds[0]] = 'a'; },
    x => { x.command.answers[x.selection.questionIds[0]] = 'E'; },
    x => { x.command.studyReceipt.visible = null; }, x => { x.command.studyReceipt.elapsedMs = 1; },
  ]) {
    const copy = { ...c, command: clone(c.command) }; mutate(copy);
    assert.throws(() => spy.evaluate(copy), /invalid_(command|answers|study_receipt)/);
  }
  assert.equal(spy.calls, 0);
  assert.throws(() => validateNmlsFirstFinalSubmissionCommand(c.command), /invalid_selection/);
});

test('source, definition, selection, phase, actor, clock and revision substitutions fail closed', async () => {
  const h = await harness(); h.open(); const c = h.context(), spy = evaluatorSpy();
  for (const mutate of [
    x => { x.sourceCourse = clone(c.sourceCourse); x.sourceCourse.modules[0].units[0].requiredSeconds++; },
    x => { x.sourceCourse = { ...c.sourceCourse, digest: 'f'.repeat(64) }; },
    x => { x.definition = clone(c.definition); x.definition.items[0].correctChoice = 'B'; },
    x => { x.selection = clone(c.selection); x.selection.optionOrder[x.selection.questionIds[0]].reverse(); },
    x => { x.finalPhase = clone(c.finalPhase); },
    x => { x.evidence = { ...c.evidence, actorId: randomUUID() }; },
    x => { x.evidence = { ...c.evidence, receivedAtMs: h.ledger.lastReceiptMs - 1 }; },
    x => { x.command = { ...c.command, expectedRevision: c.command.expectedRevision - 1 }; },
    x => { x.command = { ...c.command, expectedActorRevision: c.command.expectedActorRevision - 1 }; },
    x => { x.command = { ...c.command, sessionId: randomUUID() }; },
  ]) { const copy = { ...c }; mutate(copy); assert.throws(() => spy.evaluate(copy)); }
  assert.equal(spy.calls, 0);
});

test('injected grade must exactly match pinned grade and cannot mutate authoritative inputs', async () => {
  const h = await harness(); h.open(); const c = h.context(), before = clone(c);
  for (const wrong of [null, {}, { ...gradeNmlsDraftFinal(c.definition, c.selection, c.command.answers), passed: false },
    { ...gradeNmlsDraftFinal(c.definition, c.selection, c.command.answers), questions: [] },
    { ...gradeNmlsDraftFinal(c.definition, c.selection, c.command.answers), extra: undefined }]) {
    assert.throws(() => createNmlsFirstFinalSubmissionEvaluator({ grade: () => wrong })(c), /grade_changed/);
  }
  let calls = 0;
  const r = createNmlsFirstFinalSubmissionEvaluator({ grade(definition, selection, answers) {
    calls++; const exactGrade = gradeNmlsDraftFinal(definition, selection, answers);
    definition.items[0].stem = 'attempted mutation'; selection.questionIds.reverse(); answers[selection.questionIds[0]] = 'D';
    return exactGrade;
  } })(c);
  assert.equal(calls, 1); assert.equal(r.submission.submitted, true); assert.deepEqual(c, before);
  r.submission.answers[c.selection.questionIds[0]] = 'B'; r.submission.result.correct = 0;
  assert.deepEqual(c, before, 'returned proposal also owns its mutable payload');
  assert.throws(() => createNmlsFirstFinalSubmissionEvaluator({ grade: null }), /invalid_factory/);
});
