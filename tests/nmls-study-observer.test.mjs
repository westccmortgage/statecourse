import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { startNmlsSessionPolicy } from '../lib/nmls-session-policy.mjs';
import { createNmlsPolicyReviewEvaluator } from '../lib/nmls-policy-review.mjs';
import { startNmlsCourseReview } from '../lib/nmls-review-runtime.mjs';
import { createNmlsObservedPolicyReviewEvaluator, validateNmlsStudyReceipt } from '../lib/nmls-study-observer.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { transactNmlsPolicyReview, validateNmlsPolicyCommand, NMLS_POLICY_DIGEST } from '../netlify/functions/_lib/nmls-policy-transaction.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { createNmlsDeliveryLifecycle } from '../lib/nmls-delivery-lifecycle.mjs';
import { nmlsRestrictionUsage } from '../lib/nmls-uncertain-exposure.mjs';

const base = Date.parse('2026-06-01T12:00:00Z');
const real = getNmlsReviewCourse('nmls-2026-f01-private-review');
const offering = (course, id = randomUUID()) => ({ id, contentDigest: course.digest, year: 2026,
  educationType: 'annual_ce', timeZone: 'UTC', deadlineBasisId: 'synthetic-test-only',
  opensAtMs: Date.UTC(2026, 0, 1), closesAtMs: Date.UTC(2027, 0, 1),
  rocs: { version: '4', documentDigest: 'c'.repeat(64), fullDocumentVerified: true, evidenceId: 'synthetic-not-a-document' } });

function harness(runtimeOptions = {}) {
  const course = structuredClone(real); course.id = 'synthetic-observation-course'; course.digest = 'a'.repeat(64);
  course.modules[0].units = [{ ...course.modules[0].units[0], requiredSeconds: 20 }];
  const actorId = randomUUID(), attemptId = randomUUID(), o = offering(course);
  let runtime = startNmlsCourseReview(course), ledger = startNmlsSessionPolicy(actorId);
  const evaluate = createNmlsObservedPolicyReviewEvaluator({ runtimeOptions });
  const h = { course, offering: o, actorId, attemptId, evaluate,
    get runtime() { return runtime; }, get ledger() { return ledger; },
    setRuntime(s) { runtime = structuredClone(s); }, setLedger(s) { ledger = structuredClone(s); },
    context(kind, at = base, extra = {}, receipt = true) {
      return { course, runtime, ledger, offering: o,
        command: { kind, eventId: randomUUID(), attemptId, expectedRevision: runtime.revision,
          expectedActorRevision: ledger.revision, sessionId: runtime.sessionId,
          ...(receipt && ledger.observationJournal?.active ? { studyReceipt: { windowId: ledger.observationJournal.active.id, visible: true } } : {}), ...extra },
        evidence: { actorId, receivedAtMs: at, presentation: { id: randomUUID(), actorId, offeringId: o.id,
          contentDigest: course.digest, documentDigest: o.rocs.documentDigest, presentedAtMs: at } } };
    },
    async act(kind, at = base, extra = {}, receipt = true) {
      const c = h.context(kind, at, extra, receipt), before = structuredClone(c), r = await evaluate(c);
      assert.deepEqual(c, before, 'pure evaluator cannot consume evidence before CAS');
      assert.equal(r.ledger.revision, ledger.revision + 1); assert.equal(r.runtime.revision, runtime.revision + 1);
      assert.equal(r.ledger.creditIssuanceAllowed, false);
      runtime = r.runtime; ledger = r.ledger; return r;
    },
    async begin() {
      await h.act('resume'); await h.act('accept_rocs', base, { version: '4', documentDigest: o.rocs.documentDigest, acknowledged: true });
      await h.act('resume'); return h.act('open_unit', base, { unitId: 'F01-U01' });
    },
  }; return h;
}

async function partialUnit(h = harness()) {
  await h.begin(); await h.act('interaction', base + 1000, { visible: true });
  await h.act('heartbeat', base + 11000, { visible: true });
  await h.act('unit_action', base + 11001, { choice: h.course.modules[0].units[0].actionQuestion.correctChoice });
  return h;
}

test('clean voluntary stop bookmarks exact work, resumes on fresh lease/window, never bridges absence', async () => {
  const h = await partialUnit(), before = structuredClone(h.runtime.current), oldLease = h.runtime.sessionId;
  const oldWindow = h.ledger.observationJournal.active.id;
  const stopped = await h.act('logout', base + 11002);
  assert.deepEqual(h.runtime.bookmark.current, before);
  assert.equal(h.runtime.current, null); assert.equal(h.runtime.quiz, null); assert.equal(h.runtime.sessionId, null);
  assert.deepEqual(stopped.outcome.progress.lessons, []); assert.equal(stopped.outcome.progress.resumeRequired, true);
  assert.equal(stopped.outcome.progress.bookmark, undefined); assert.equal(stopped.outcome.progress.quizReservation, undefined);
  assert.equal(h.ledger.observationJournal.active, null); assert.equal(h.ledger.observationJournal.unresolved, null);
  const exposure = h.ledger.studySinceBreakMs;
  const resumed = await h.act('resume', base + 61002);
  assert.equal(resumed.outcome.deliveryAllowed, true); assert.equal(h.runtime.bookmark, undefined);
  assert.notEqual(h.runtime.sessionId, oldLease); assert.notEqual(h.ledger.observationJournal.active.id, oldWindow);
  assert.equal(h.runtime.current.attemptId, before.attemptId); assert.equal(h.runtime.current.provisionalMs, before.provisionalMs);
  assert.deepEqual(h.runtime.current.completedActionIds, before.completedActionIds);
  assert.equal(h.runtime.current.previousEngaged, false); assert.equal(h.ledger.studySinceBreakMs, exposure);
  await h.act('heartbeat', base + 61003, { visible: true });
  assert.equal(h.runtime.current.provisionalMs, before.provisionalMs); assert.equal(h.ledger.studySinceBreakMs, exposure);
  await h.act('heartbeat', base + 71003, { visible: true });
  assert.equal(h.runtime.current.provisionalMs, before.provisionalMs + 10000);
  const stale = h.context('heartbeat', base + 71004, { sessionId: oldLease, visible: true });
  await assert.rejects(h.evaluate(stale), /session_conflict/);
});

test('explicit break preserves pending work through content-free bootstrap and idle, restores only after allowed resume', async () => {
  const h = await partialUnit();
  await h.act('begin_break', base + 11002);
  const bookmark = structuredClone(h.runtime.bookmark), studyIntervals = structuredClone(h.ledger.studyIntervals);
  assert.ok(bookmark); assert.equal(h.runtime.current, null);
  const blocked = await h.act('resume', base + 11003);
  assert.equal(blocked.outcome.policyCode, 'break_in_progress'); assert.equal(blocked.outcome.deliveryAllowed, false);
  assert.deepEqual(h.runtime.bookmark, bookmark); assert.equal(h.runtime.current, null);
  const end = base + 11003 + P.minimumBreakMs;
  assert.equal((await h.act('resume', end)).outcome.status, 401, 'bootstrap inactivity logs out without deleting paused work');
  await h.act('resume', end + 1); await h.act('end_break', end + 2);
  const cannotSkipResume = await h.act('open_unit', end + 3, { unitId: 'F01-U01' });
  assert.equal(cannotSkipResume.outcome.code, 'review_resume_required'); assert.equal(cannotSkipResume.outcome.deliveryAllowed, false);
  assert.deepEqual(h.runtime.bookmark, bookmark);
  await h.act('resume', end + 4);
  assert.equal(h.runtime.current.provisionalMs, bookmark.current.provisionalMs);
  assert.deepEqual(h.ledger.studyIntervals, studyIntervals); assert.equal(h.ledger.studySinceBreakMs, 0, 'only actual end_break resets break budget');
  assert.equal(h.runtime.current.previousEngaged, false);
});

test('exactly exhausted break/daily budget permits clean saving, never renewed teaching or a counter reset', async t => {
  for (const kind of ['break', 'daily']) await t.test(kind, async () => {
    const h = await partialUnit(); await h.act('interaction', base + 11002, { visible: true });
    const partial = structuredClone(h.runtime.current), ledger = structuredClone(h.ledger), at = base + 11002;
    // Prior usage is synthetic; the tested closing millisecond is settled by
    // the actual observed composer, not supplied as earned instructional time.
    if (kind === 'break') ledger.studySinceBreakMs = P.breakAfterStudyMs - 1 -
      (nmlsRestrictionUsage(ledger, at).sinceBreakMs - ledger.studySinceBreakMs);
    else { ledger.studyIntervals = [{ start: at - P.rollingStudyLimitMs + 1, end: at }]; ledger.lastStudyAtMs = at; }
    h.setLedger(ledger);
    const result = await h.act('logout', at + 1);
    assert.equal(result.outcome.policyCode, kind === 'break' ? 'mandatory_break_required' : 'rolling_study_limit');
    assert.equal(result.audit.policy.observation.code, 'study_interval_recorded');
    assert.deepEqual(h.runtime.bookmark.current, partial); assert.equal(h.runtime.current, null);
    assert.equal(result.outcome.deliveryAllowed, false); assert.equal(result.outcome.studyWindow, null);
    assert.equal(h.ledger.studySinceBreakMs, ledger.studySinceBreakMs + 1);
    await h.act('resume', at + 1);
    assert.deepEqual(h.runtime.bookmark.current, partial); assert.equal(h.runtime.current, null);
  });
});

test('logout label cannot bookmark missing, hidden, stale, expired, unsettled or idle material', async t => {
  for (const kind of ['missing', 'hidden', 'stale', 'expired', 'settlement', 'idle']) await t.test(kind, async () => {
    const h = await partialUnit();
    let at = base + 11002, extra = {}, receipt = true;
    if (kind === 'missing') receipt = false;
    if (kind === 'hidden') extra.visible = false;
    if (kind === 'stale') extra.studyReceipt = { windowId: randomUUID(), visible: true };
    if (kind === 'expired') at += 31000;
    if (kind === 'idle') at = h.runtime.lastActivityMs + 360000;
    if (kind === 'settlement') {
      await h.act('interaction', at, { visible: true }); at++;
      const ledger = structuredClone(h.ledger); ledger.studyBoundaryAtMs = at + 1; h.setLedger(ledger);
    }
    const result = await h.act('logout', at, extra, receipt);
    assert.equal(result.outcome.deliveryAllowed, false); assert.equal(h.runtime.current, null);
    assert.equal(h.runtime.bookmark, undefined); assert.deepEqual(h.runtime.completedUnitIds, []);
    if (kind === 'idle') assert.equal(result.outcome.status, 401);
  });
});

test('pending bookmarks are scoped, structurally checked and cannot bypass denied policies or legacy runtime', async t => {
  for (const kind of ['attempt', 'offering', 'actor', 'digest', 'excess-time', 'wrong-action', 'wrong-unit', 'missing-observer']) await t.test(kind, async () => {
    const h = await partialUnit(); await h.act('logout', base + 11002);
    const c = h.context('resume', base + 11003); c.runtime = structuredClone(c.runtime);
    if (kind === 'attempt') c.runtime.bookmark.scope.attemptId = randomUUID();
    if (kind === 'offering') c.runtime.bookmark.scope.offeringId = randomUUID();
    if (kind === 'actor') c.runtime.bookmark.scope.actorId = randomUUID();
    if (kind === 'digest') c.runtime.bookmark.scope.contentDigest = 'f'.repeat(64);
    if (kind === 'excess-time') c.runtime.bookmark.current.provisionalMs = 999999;
    if (kind === 'wrong-action') c.runtime.bookmark.current.completedActionIds = ['not-in-source'];
    if (kind === 'wrong-unit') c.runtime.bookmark.current.unitId = 'F01-U99';
    await assert.rejects(kind === 'missing-observer' ? createNmlsPolicyReviewEvaluator()(c) : h.evaluate(c), /continuity_invalid/);
  });
  for (const deny of ['rocs', 'daily', 'wall', 'outside']) await t.test(deny, async () => {
    const h = await partialUnit(); await h.act('logout', base + 11002);
    const b = structuredClone(h.runtime.bookmark), ledger = structuredClone(h.ledger);
    let at = base + 11003;
    if (deny === 'rocs') ledger.acceptances = [];
    if (deny === 'daily') { at += P.rollingStudyLimitMs; ledger.studyIntervals = [{ start: at - P.rollingStudyLimitMs, end: at }]; ledger.lastStudyAtMs = at; }
    if (deny === 'wall') { at = ledger.sessionStartedAtMs + P.sessionWallLimitMs; ledger.lastStudyAtMs = at; }
    if (deny === 'outside') at = h.offering.closesAtMs;
    h.setLedger(ledger);
    const r = await h.act('resume', at);
    assert.equal(r.outcome.deliveryAllowed, false); assert.equal(h.runtime.current, null);
    assert.deepEqual(h.runtime.bookmark, b); assert.equal(r.outcome.studyWindow, null);
  });
});

test('ungraded quiz selection survives clean resume/logout and uncertain recovery; only submission permits a new draw', async () => {
  let draws = 0;
  const h = harness({ selectQuestions(bank, count) { draws++; return bank.slice(0, count).map(q => q.id); } });
  await partialUnit(h); await h.act('interaction', base + 11002, { visible: true });
  await h.act('heartbeat', base + 21002, { visible: true }); await h.act('complete_unit', base + 21003);
  await h.act('quiz_start', base + 21004, { moduleId: 'F01' });
  const quiz = structuredClone(h.runtime.quiz);
  const reordered = structuredClone(h.runtime);
  reordered.quiz = { questionIds: quiz.questionIds, moduleId: quiz.moduleId, id: quiz.id }; h.setRuntime(reordered);
  await h.act('resume', base + 21005); assert.deepEqual(h.runtime.quiz, quiz);
  await h.act('logout', base + 21006); await h.act('resume', base + 21007);
  assert.deepEqual(h.runtime.quiz, quiz); assert.equal(draws, 1);
  await h.act('check_access', base + 21008, {}, false);
  assert.equal(h.runtime.quiz, null); assert.deepEqual(h.runtime.quizReservation.quiz, quiz);
  await h.act('recover_observation', base + 21009, { recoveryWindowId: h.ledger.observationJournal.unresolved.window.id });
  let at = base + 21010 + P.minimumBreakMs;
  await h.act('resume', at++); await h.act('resume', at++); await h.act('end_break', at++);
  await h.act('quiz_start', at++, { moduleId: 'F01' });
  assert.deepEqual(h.runtime.quiz, quiz); assert.equal(draws, 1);
  at = h.runtime.lastActivityMs + 360000;
  assert.equal((await h.act('resume', at++)).outcome.status, 401);
  assert.deepEqual(h.runtime.quizReservation.quiz, quiz);
  await h.act('resume', at++);
  await h.act('recover_observation', at++, { recoveryWindowId: h.ledger.observationJournal.unresolved.window.id });
  at += P.minimumBreakMs;
  await h.act('resume', at++); await h.act('resume', at++); await h.act('end_break', at++);
  await h.act('quiz_start', at++, { moduleId: 'F01' });
  assert.deepEqual(h.runtime.quiz, quiz); assert.equal(draws, 1, 'idle also cannot redraw an ungraded quiz');
  await h.act('quiz_submit', at++, { quizId: quiz.id, answers: {} });
  assert.deepEqual(h.runtime.quizReservation.quiz, quiz, 'malformed submission does not retire selection');
  await h.act('quiz_start', at++, { moduleId: 'F01' });
  const answers = Object.fromEntries(quiz.questionIds.map(id => {
    const q = h.course.modules[0].quiz.bank.find(x => x.id === id);
    return [id, q.options.find(x => x.id !== q.correctChoice).id];
  }));
  await h.act('quiz_submit', at++, { quizId: quiz.id, answers });
  assert.equal(h.runtime.quizReservation, undefined);
  await h.act('quiz_start', at++, { moduleId: 'F01' });
  assert.equal(draws, 2); assert.notEqual(h.runtime.quiz.id, quiz.id);
});

test('client cannot authorize continuity; historical unreserved quiz is held instead of silently redrawn', async () => {
  const h = harness();
  for (const key of ['bookmark', 'quizReservation', 'continuity', 'continuityScope', 'saveAllowed', 'restoreAllowed']) {
    assert.throws(() => validateNmlsPolicyCommand({ ...h.context('resume').command, [key]: true }), /unsupported_review_field/);
  }
  await partialUnit(h); await h.act('interaction', base + 11002, { visible: true });
  await h.act('heartbeat', base + 21002, { visible: true }); await h.act('complete_unit', base + 21003);
  await h.act('quiz_start', base + 21004, { moduleId: 'F01' });
  const historical = structuredClone(h.runtime); delete historical.quizReservation; h.setRuntime(historical);
  for (const kind of ['logout', 'resume', 'heartbeat']) {
    await assert.rejects(h.act(kind, base + 21005), /continuity_invalid/);
  }
});

test('first acknowledgment budgets initial gap only as restrictions; continuous receipts settle observed intervals', async () => {
  const h = harness(), opened = await h.begin();
  assert.ok(opened.outcome.studyWindow.id); assert.equal(h.ledger.studySinceBreakMs, 0);
  const first = await h.act('interaction', base + 1000, { visible: true });
  assert.equal(first.outcome.observationCode, 'study_material_acknowledged'); assert.equal(h.ledger.studySinceBreakMs, 0);
  assert.equal(first.audit.observation.firstAcknowledgment, true);
  assert.deepEqual(h.ledger.uncertainExposure.intervals, [{ start: base, end: base + 1000 }]);
  assert.equal(h.ledger.breakStartedAtMs, null, 'timely acknowledgment is not interrupted-window recovery');
  assert.equal(h.runtime.current.provisionalMs, 0);
  assert.equal(nmlsRestrictionUsage(h.ledger, base + 1000).sinceBreakMs, 1000);
  const next = await h.act('heartbeat', base + 21000, { visible: true });
  assert.equal(h.ledger.studySinceBreakMs, 20000); assert.equal(h.runtime.current.provisionalMs, 20000);
  assert.equal(nmlsRestrictionUsage(h.ledger, base + 21000).rollingMs, 21000);
  assert.equal(next.audit.policy.observation.code, 'study_interval_recorded');
  await h.act('check_access', base + 26000);
  await h.act('heartbeat', base + 31000, { visible: true });
  assert.equal(h.ledger.studySinceBreakMs, 30000); assert.equal(h.runtime.current.provisionalMs, 20000, 'budget exposure is not unit credit');
});

test('first receipt cannot bridge instructional time across replacement feedback or repeated verified answers', async () => {
  const h = harness(); await h.begin();
  const correct = h.course.modules[0].units[0].actionQuestion.correctChoice;
  const wrong = h.course.modules[0].units[0].actionQuestion.options.find(x => x.id !== correct).id;
  await h.act('interaction', base + 1000, { visible: true });
  await h.act('unit_action', base + 2000, { choice: correct });
  await h.act('unit_action', base + 3000, { choice: wrong });
  await h.act('heartbeat', base + 4000, { visible: true });
  const activity = h.runtime.lastActivityMs, unitActivity = h.runtime.current.lastActivityMs;
  const repeat = await h.act('unit_action', base + 5000, { choice: correct });
  assert.equal(repeat.outcome.code, 'action_already_verified');
  assert.equal(h.runtime.current.previousEngaged, false);
  assert.equal(h.runtime.lastActivityMs, activity); assert.equal(h.runtime.current.lastActivityMs, unitActivity);
  const first = await h.act('heartbeat', base + 6000, { visible: true });
  assert.equal(first.audit.observation.firstAcknowledgment, true);
  assert.equal(h.runtime.current.provisionalMs, 0);
  assert.equal(nmlsRestrictionUsage(h.ledger, base + 6000).rollingMs, 6000);
  await h.act('heartbeat', base + 7000, { visible: true });
  assert.equal(h.runtime.current.provisionalMs, 1000);
});

test('first gap at the exact rolling limit stops material without awarding study or resetting usage', async () => {
  const h = harness();
  await h.act('resume'); await h.act('accept_rocs', base, { version: '4', documentDigest: h.offering.rocs.documentDigest, acknowledged: true });
  await h.act('resume');
  const ledger = structuredClone(h.ledger);
  ledger.studyIntervals = [{ start: base - P.rollingStudyLimitMs + 1000, end: base }]; // synthetic prior actor exposure
  h.setLedger(ledger);
  const opened = await h.act('open_unit', base, { unitId: 'F01-U01' });
  assert.equal(opened.outcome.deliveryUntilMs, base + 1000);
  const first = await h.act('heartbeat', base + 1000, { visible: true });
  assert.equal(first.outcome.policyCode, 'rolling_study_limit'); assert.equal(first.outcome.deliveryAllowed, false);
  assert.deepEqual(first.outcome.progress.lessons, []); assert.equal(first.outcome.progress.provisionalReviewMs, 0);
  assert.deepEqual(h.ledger.studyIntervals, ledger.studyIntervals); assert.equal(h.ledger.studySinceBreakMs, 0);
  assert.equal(nmlsRestrictionUsage(h.ledger, base + 1000).rollingMs, P.rollingStudyLimitMs);
  assert.equal(h.ledger.breakStartedAtMs, null);
});

test('an almost exhausted break budget is consumed by first gap before any renewed delivery', async () => {
  const h = harness();
  await h.act('resume'); await h.act('accept_rocs', base, { version: '4', documentDigest: h.offering.rocs.documentDigest, acknowledged: true });
  await h.act('resume');
  const ledger = structuredClone(h.ledger);
  ledger.studySinceBreakMs = P.breakAfterStudyMs - 1000; h.setLedger(ledger); // explicit synthetic budget fixture
  const opened = await h.act('open_unit', base, { unitId: 'F01-U01' });
  assert.equal(opened.outcome.deliveryUntilMs, base + 1000);
  const first = await h.act('heartbeat', base + 999, { visible: true });
  assert.equal(first.outcome.deliveryUntilMs, base + 1000);
  assert.equal(h.runtime.current.provisionalMs, 0);
  const stopped = await h.act('check_access', base + 1000);
  assert.equal(stopped.outcome.policyCode, 'mandatory_break_required');
  assert.equal(stopped.outcome.deliveryAllowed, false);
  assert.equal(nmlsRestrictionUsage(h.ledger, base + 1000).sinceBreakMs, P.breakAfterStudyMs);
});

test('repeated acknowledged opening and logout cannot omit initial gaps or count them as observed time', async () => {
  const h = harness(); await h.begin();
  for (let i = 0; i < 3; i++) {
    const at = base + i * 1000;
    await h.act('logout', at + 900);
    assert.equal(h.ledger.studySinceBreakMs, 0);
    assert.equal(nmlsRestrictionUsage(h.ledger, at + 900).rollingMs, (i + 1) * 900);
    if (i < 2) await h.act('resume', at + 1000);
  }
  assert.deepEqual(h.ledger.studyIntervals, []);
  assert.equal(h.runtime.bookmark.current.provisionalMs, 0);
});

test('v1 journal and absent journal after any prior runtime/actor transition require explicit reconciliation', async () => {
  const h = harness(); await h.begin();
  for (const version of ['nmls-study-windows-v1', 'invented']) {
    const c = h.context('check_access', base + 1); c.ledger = structuredClone(c.ledger);
    c.ledger.observationJournal.version = version;
    await assert.rejects(h.evaluate(c), /invalid_study_observation_state/);
  }
  const legacy = createNmlsPolicyReviewEvaluator({ observe: () => ({ ready: true }) });
  const k = harness();
  for (const [kind, at, extra] of [['resume', base, {}], ['accept_rocs', base, { version: '4', documentDigest: k.offering.rocs.documentDigest, acknowledged: true }],
    ['resume', base, {}], ['open_unit', base, { unitId: 'F01-U01' }], ['logout', base + 20000, {}]]) {
    const r = await legacy(k.context(kind, at, extra, false)); k.setRuntime(r.runtime); k.setLedger(r.ledger);
  }
  assert.equal(k.runtime.current, null); assert.deepEqual(k.ledger.studyIntervals, []);
  await assert.rejects(k.act('resume', base + 21000), /bootstrap_requires_clean_attempt/);
});

test('valid receipt settles old material before feedback, replacement, break and resume without bridging', async () => {
  const h = harness(); await h.begin(); await h.act('interaction', base, { visible: true });
  const q = h.course.modules[0].units[0].actionQuestion;
  const wrong = await h.act('unit_action', base + 10000, { choice: q.options.find(x => x.id !== q.correctChoice).id });
  assert.equal(wrong.outcome.progress.feedback.correct, false); assert.equal(h.ledger.studySinceBreakMs, 10000);
  assert.equal(h.ledger.observationJournal.active.lastObservedAtMs, null, 'changed feedback begins a distinct material window');
  await h.act('interaction', base + 10001, { visible: true });
  const pause = await h.act('begin_break', base + 20001);
  assert.equal(pause.outcome.code, 'break_started'); assert.equal(h.ledger.studySinceBreakMs, 20000);
  assert.equal(h.ledger.observationJournal.active, null); assert.equal(h.ledger.observationJournal.unresolved, null);
  assert.equal(h.runtime.current, null); assert.equal(pause.outcome.studyWindow, null);
  assert.equal((await h.act('end_break', base + 20001 + P.minimumBreakMs)).outcome.status, 401);
  await h.act('resume', base + 20002 + P.minimumBreakMs);
  await h.act('end_break', base + 20003 + P.minimumBreakMs);
  await h.act('resume', base + 20004 + P.minimumBreakMs);
  assert.equal(h.ledger.observationJournal.active.lastObservedAtMs, null);
  assert.equal(h.ledger.studyIntervals.reduce((n, x) => n + x.end - x.start, 0), 20000);
});

test('missing/stale/hidden/expired receipts preserve unresolved evidence and refuse reset by controls', async t => {
  for (const [name, delay, extra, receipt, expected] of [
    ['missing', 1, {}, false, 'study_receipt_missing_or_stale'],
    ['stale', 1, { studyReceipt: { windowId: randomUUID(), visible: true } }, true, 'study_receipt_missing_or_stale'],
    ['hidden', 1, { visible: false }, true, 'study_visibility_interrupted'],
    ['expired', 31000, {}, true, 'study_horizon_expired'],
  ]) await t.test(name, async () => {
    const h = harness(); await h.begin(); await h.act('interaction', base, { visible: true });
    const prior = structuredClone(h.ledger.observationJournal.active);
    const r = await h.act(name === 'hidden' ? 'heartbeat' : 'check_access', base + delay, extra, receipt);
    assert.equal(r.outcome.observationCode, expected); assert.equal(r.outcome.deliveryAllowed, false);
    assert.equal(h.ledger.studySinceBreakMs, 0); assert.deepEqual(h.ledger.observationJournal.unresolved.window, prior);
    const unresolved = structuredClone(h.ledger.observationJournal.unresolved);
    await h.act('resume', base + delay + 1); await h.act('begin_break', base + delay + 2);
    const stopped = await h.act('end_break', base + delay + 2 + P.minimumBreakMs);
    assert.equal(stopped.outcome.deliveryAllowed, false); assert.deepEqual(h.ledger.observationJournal.unresolved, unresolved);
    await h.act('resume', base + delay + 3 + P.minimumBreakMs);
    const ended = await h.act('end_break', base + delay + 4 + P.minimumBreakMs);
    assert.equal(ended.outcome.code, 'break_completed'); assert.equal(ended.outcome.deliveryAllowed, false);
    assert.deepEqual(h.ledger.observationJournal.unresolved, unresolved);
  });
});

test('cross-offering/attempt/lease and new attempts of the same unit cannot adopt a window', async t => {
  for (const kind of ['offering', 'attempt', 'lease', 'unit-attempt', 'revision']) await t.test(kind, async () => {
    const h = harness(); await h.begin(); await h.act('interaction', base, { visible: true });
    const c = h.context('check_access', base + 1000), old = structuredClone(h.ledger.observationJournal.active);
    if (kind === 'offering') c.offering = offering(h.course);
    if (kind === 'attempt') c.command.attemptId = randomUUID();
    if (kind === 'lease') { c.runtime = structuredClone(c.runtime); c.runtime.sessionId = c.command.sessionId = randomUUID(); }
    if (kind === 'unit-attempt') { c.runtime = structuredClone(c.runtime); c.runtime.current.attemptId = randomUUID(); }
    if (kind === 'revision') { c.runtime = structuredClone(c.runtime); c.runtime.revision++; c.command.expectedRevision++; }
    const r = await h.evaluate(c);
    assert.equal(r.outcome.deliveryAllowed, false); assert.equal(r.ledger.studySinceBreakMs, 0);
    assert.deepEqual(r.ledger.observationJournal.unresolved.window, old);
  });
});

test('outside-year checks preserve journal; rejected policy settlement cannot consume a receipt', async () => {
  const h = harness(); await h.begin(); await h.act('interaction', base, { visible: true });
  const old = structuredClone(h.ledger.observationJournal), c = h.context('check_access', h.offering.closesAtMs);
  const closed = await h.evaluate(c);
  assert.deepEqual(closed.ledger.observationJournal, old); assert.equal(closed.outcome.studyWindow, null);
  const ledger = structuredClone(h.ledger); ledger.studyBoundaryAtMs = base + 5000; h.setLedger(ledger);
  const rejected = await h.act('heartbeat', base + 10000, { visible: true });
  assert.equal(rejected.outcome.observationCode, 'study_settlement_rejected'); assert.equal(rejected.outcome.deliveryAllowed, false);
  assert.equal(h.ledger.studySinceBreakMs, 0); assert.deepEqual(h.ledger.observationJournal.unresolved.window, old.active);
});

test('quiz and repeated incorrect work remain exposure, distinct quiz instances cannot share a window', async () => {
  const h = harness(); await h.begin(); await h.act('interaction', base, { visible: true });
  await h.act('heartbeat', base + 20000, { visible: true });
  const q = h.course.modules[0].units[0].actionQuestion;
  await h.act('unit_action', base + 20000, { choice: q.correctChoice });
  await h.act('complete_unit', base + 20000);
  await h.act('quiz_start', base + 20000, { moduleId: 'F01' });
  const firstQuizWindow = h.ledger.observationJournal.active.id;
  await h.act('interaction', base + 20000, { visible: true });
  await h.act('heartbeat', base + 30000, { visible: true });
  const answers = Object.fromEntries(h.runtime.quiz.questionIds.map(id => {
    const item = h.course.modules[0].quiz.bank.find(x => x.id === id);
    return [id, item.options.find(x => x.id !== item.correctChoice).id];
  }));
  const failed = await h.act('quiz_submit', base + 35000, { quizId: h.runtime.quiz.id, answers });
  assert.equal(failed.outcome.code, 'module_review_retry'); assert.equal(h.ledger.studySinceBreakMs, 35000);
  assert.equal(h.runtime.completedReviewMs, 20000); assert.deepEqual(h.runtime.passedModuleIds, []);
  await h.act('quiz_start', base + 35000, { moduleId: 'F01' });
  assert.notEqual(h.ledger.observationJournal.active.id, firstQuizWindow);
  assert.equal(h.ledger.observationJournal.active.lastObservedAtMs, null);
  assert.equal(h.ledger.studySinceBreakMs, 35000);
});

test('exact final permitted interval persists before mandatory break stops delivery', async () => {
  const h = harness(); await h.begin();
  const ledger = structuredClone(h.ledger); ledger.studySinceBreakMs = P.breakAfterStudyMs - 30000; h.setLedger(ledger);
  await h.act('interaction', base, { visible: true });
  const r = await h.act('heartbeat', base + 30000, { visible: true });
  assert.equal(r.outcome.policyCode, 'mandatory_break_required'); assert.equal(r.outcome.deliveryAllowed, false);
  assert.equal(h.ledger.studySinceBreakMs, P.breakAfterStudyMs);
  assert.equal(h.ledger.observationJournal.active, null); assert.equal(h.ledger.observationJournal.unresolved, null);
  assert.equal(r.audit.policy.observation.code, 'study_interval_recorded'); assert.equal(h.runtime.current, null);
});

test('no silent journal bootstrap after prior instruction; receipts cannot supply clocks, grades or state', async () => {
  const h = harness(); await h.begin();
  const ledger = structuredClone(h.ledger); delete ledger.observationJournal; h.setLedger(ledger);
  await assert.rejects(h.act('check_access'), /bootstrap_requires_clean_attempt/);
  for (const field of ['receivedAtMs', 'start', 'end', 'grade', 'earnedMs', 'actorId', 'state', 'initialExposure', 'initialMaterialAcknowledgment']) {
    assert.throws(() => validateNmlsStudyReceipt({ windowId: randomUUID(), visible: true, [field]: 1 }), /invalid_study_receipt/);
  }
  const input = { kind: 'check_access', attemptId: randomUUID(), eventId: randomUUID(), sessionId: randomUUID(),
    expectedRevision: 1, expectedActorRevision: 2, studyReceipt: { windowId: randomUUID(), visible: true } };
  assert.equal(validateNmlsPolicyCommand(input), input);
  assert.throws(() => validateNmlsPolicyCommand({ ...input, studyInterval: { start: 1, end: 2 } }), /invalid_policy_request/);
  assert.throws(() => validateNmlsPolicyCommand({ ...input, initialExposure: { start: 1, end: 2 } }), /invalid_policy_request/);
  assert.throws(() => validateNmlsPolicyCommand({ ...input, initialMaterialAcknowledgment: true }), /invalid_policy_request/);
  const recovery = { ...input, kind: 'recover_observation', recoveryWindowId: randomUUID() }; delete recovery.studyReceipt;
  assert.equal(validateNmlsPolicyCommand(recovery), recovery);
  for (const extra of [{ eligibleAtMs: 1 }, { actorId: randomUUID() }, { studyInterval: { start: 1, end: 2 } },
    { ledger: {} }, { observedStudyMs: 0 }, { acknowledged: true }]) {
    assert.throws(() => validateNmlsPolicyCommand({ ...recovery, ...extra }), /invalid_policy_request/);
  }
  assert.throws(() => validateNmlsPolicyCommand({ ...recovery, studyReceipt: input.studyReceipt }), /invalid_policy_recovery/);
  assert.throws(() => validateNmlsPolicyCommand({ ...recovery, recoveryWindowId: 'invalid' }), /invalid_policy_recovery/);
});

async function interruptedHarness(delay = 1000) {
  const h = harness(); await h.begin(); await h.act('interaction', base, { visible: true });
  await h.act('check_access', base + delay, {}, false);
  const unresolved = structuredClone(h.ledger.observationJournal.unresolved);
  const r = await h.act('check_access', base + delay + 1);
  return { h, unresolved, recovery: { recoveryWindowId: unresolved.window.id },
    eligible: r.outcome.studyRecovery.eligibleAtMs };
}

test('short-gap recovery adds restriction-only debit and a fresh pause, preserving observed history and progress', async () => {
  const { h, unresolved, recovery, eligible } = await interruptedHarness();
  assert.equal(eligible, unresolved.detectedAtMs);
  const recoveredAt = eligible + 2;
  const before = structuredClone(h.ledger), runtimeBefore = structuredClone(h.runtime);
  const cleared = await h.act('recover_observation', recoveredAt, recovery);
  assert.equal(cleared.outcome.code, 'study_observation_recovered'); assert.equal(cleared.outcome.ok, true);
  assert.equal(cleared.outcome.deliveryAllowed, false); assert.equal(cleared.outcome.studyWindow, null);
  assert.equal(cleared.outcome.studyRecovery, null); assert.deepEqual(cleared.outcome.progress.lessons, []);
  assert.equal(h.ledger.observationJournal.unresolved, null);
  assert.deepEqual(cleared.audit.observation.recovery.original, unresolved);
  assert.equal(cleared.audit.observation.recovery.observedStudyAddedMs, 0);
  assert.equal(cleared.audit.observation.recovery.creditAddedMs, 0);
  assert.equal(cleared.audit.observation.recovery.debitStartMs, base);
  assert.equal(cleared.audit.observation.recovery.debitEndMs, recoveredAt);
  assert.deepEqual(h.ledger.uncertainExposure.intervals, [{ start: base, end: recoveredAt }]);
  assert.equal(h.ledger.breakStartedAtMs, recoveredAt);
  assert.equal(cleared.outcome.resumeNotBeforeMs, recoveredAt + P.minimumBreakMs);
  for (const key of ['studyIntervals', 'studySinceBreakMs', 'lastStudyAtMs', 'sessionStartedAtMs',
    'studyBoundaryAtMs', 'acceptances']) assert.deepEqual(h.ledger[key], before[key]);
  for (const key of ['completedReviewMs', 'completedUnitIds', 'passedModuleIds']) assert.deepEqual(h.runtime[key], runtimeBefore[key]);
  await assert.rejects(h.act('recover_observation', recoveredAt + 1, recovery), /study_recovery_window_conflict/);
  assert.equal((await h.act('open_unit', recoveredAt + 1, { unitId: 'F01-U01' })).outcome.deliveryAllowed, false);
  const end = recoveredAt + P.minimumBreakMs;
  assert.equal((await h.act('resume', end - 2)).outcome.status, 401);
  await h.act('resume', end - 1);
  assert.equal((await h.act('end_break', end - 1)).outcome.code, 'break_incomplete');
  assert.equal((await h.act('end_break', end)).outcome.code, 'break_completed');
  const opened = await h.act('open_unit', end + 1, { unitId: 'F01-U01' });
  assert.notEqual(opened.outcome.studyWindow.id, unresolved.window.id);
  const ack = await h.act('interaction', end + 2, { visible: true });
  assert.equal(ack.outcome.observationCode, 'study_material_acknowledged');
  assert.equal(h.ledger.studySinceBreakMs, 0); assert.equal(h.runtime.current.provisionalMs, 0);
});

test('recovery budgets through the explicit server reset, not old horizon, detection or earlier breaks', async () => {
  const { h, unresolved, recovery, eligible } = await interruptedHarness(2 * P.maximumObservationMs);
  assert.equal(eligible, unresolved.detectedAtMs);
  await h.act('begin_break', eligible + 2);
  const later = eligible + P.minimumBreakMs + 10;
  await h.act('resume', later); await h.act('resume', later + 1);
  await h.act('end_break', later + 2);
  const poll = await h.act('check_access', later + 3);
  assert.equal(poll.outcome.studyRecovery.eligibleAtMs, eligible);
  assert.deepEqual(h.ledger.observationJournal.unresolved, unresolved);
  const next = await h.act('recover_observation', later + 4, recovery);
  assert.equal(next.outcome.resumeNotBeforeMs, later + 4 + P.minimumBreakMs);
  assert.deepEqual(h.ledger.uncertainExposure.intervals, [{ start: base, end: later + 4 }]);
  assert.equal(h.ledger.breakStartedAtMs, later + 4, 'pre-resolution break cannot satisfy new pause');
  assert.equal((await h.act('end_break', later + 5)).outcome.code, 'break_incomplete');
  assert.equal(h.ledger.studySinceBreakMs, 0, 'conservative debit is not observed study');
});

test('completed lessons remain progress, not a live window that can permanently prevent recovery', async () => {
  const h = harness(); await h.begin(); await h.act('interaction', base, { visible: true });
  await h.act('heartbeat', base + 20000, { visible: true });
  await h.act('unit_action', base + 20000, { choice: h.course.modules[0].units[0].actionQuestion.correctChoice });
  await h.act('complete_unit', base + 20000);
  await h.act('quiz_start', base + 20000, { moduleId: 'F01' });
  const hold = await h.act('check_access', base + 20001, {}, false);
  const eligible = hold.outcome.studyRecovery.eligibleAtMs + 1;
  assert.deepEqual(h.runtime.completedUnitIds, ['F01-U01']); assert.equal(h.runtime.completedReviewMs, 20000);
  const original = structuredClone(h.ledger.observationJournal.unresolved);
  const r = await h.act('recover_observation', eligible, { recoveryWindowId: original.window.id });
  assert.equal(r.outcome.code, 'study_observation_recovered'); assert.equal(r.outcome.deliveryAllowed, false);
  assert.deepEqual(r.outcome.progress.lessons, []); assert.equal(r.outcome.progress.quiz, null);
  assert.deepEqual(h.runtime.completedUnitIds, ['F01-U01']); assert.equal(h.runtime.completedReviewMs, 20000);
  assert.deepEqual(h.runtime.passedModuleIds, []); assert.deepEqual(r.audit.observation.recovery.original, original);
  const end = eligible + P.minimumBreakMs;
  await h.act('resume', end); await h.act('resume', end + 1); await h.act('end_break', end + 2);
  const restarted = await h.act('quiz_start', end + 3, { moduleId: 'F01' });
  assert.ok(restarted.outcome.studyWindow); assert.notEqual(restarted.outcome.studyWindow.id, original.window.id);
  assert.equal(h.ledger.observationJournal.active.lastObservedAtMs, null);
});

test('bounded recovery cannot bypass idle logout, ROCS authority, original scope or annual cutoff', async t => {
  for (const variant of ['idle', 'offering', 'attempt', 'content', 'unaccepted', 'unverified', 'cutoff']) await t.test(variant, async () => {
    const { h, unresolved, recovery, eligible } = await interruptedHarness();
    const c = h.context('recover_observation', variant === 'idle' ? base + 360000 : eligible + 2, recovery);
    if (variant === 'offering') c.offering = offering(h.course);
    if (variant === 'attempt') c.command.attemptId = randomUUID();
    if (variant === 'content') {
      c.course = { ...c.course, digest: 'b'.repeat(64) };
      c.runtime = { ...c.runtime, contentDigest: c.course.digest };
      c.offering = { ...c.offering, contentDigest: c.course.digest };
    }
    if (variant === 'unaccepted') { c.ledger = structuredClone(c.ledger); c.ledger.acceptances = []; }
    if (variant === 'unverified') c.offering = { ...c.offering, rocs: { ...c.offering.rocs, fullDocumentVerified: false } };
    if (variant === 'cutoff') c.evidence.receivedAtMs = c.offering.closesAtMs;
    const r = await h.evaluate(c);
    assert.equal(r.outcome.ok, false); assert.equal(r.outcome.deliveryAllowed, false);
    assert.deepEqual(r.ledger.observationJournal.unresolved, unresolved);
    assert.equal(r.audit.observation.recovery, undefined);
    if (variant === 'cutoff') assert.deepEqual(r.ledger.observationJournal, c.ledger.observationJournal);
  });
});

test('recovery intent cannot discard an active window or address a different unresolved ID', async () => {
  const h = harness(); await h.begin();
  const before = structuredClone(h.ledger);
  await assert.rejects(h.act('recover_observation', base + 1, { recoveryWindowId: before.observationJournal.active.id }, false), /study_recovery_window_conflict/);
  assert.deepEqual(h.ledger, before);
  await h.act('check_access', base + 1, {}, false);
  await assert.rejects(h.act('recover_observation', base + 2, { recoveryWindowId: randomUUID() }), /study_recovery_window_conflict/);
  const uninstrumented = await createNmlsPolicyReviewEvaluator()(h.context('recover_observation', base + 3,
    { recoveryWindowId: h.ledger.observationJournal.unresolved.window.id }));
  assert.equal(uninstrumented.outcome.ok, false); assert.equal(uninstrumented.outcome.deliveryAllowed, false);
  assert.equal(uninstrumented.outcome.code, 'study_recovery_observer_required');
  assert.deepEqual(uninstrumented.ledger.observationJournal, h.ledger.observationJournal);
});

test('a lost first response uses its original issue time for debit, not a nonexistent acknowledgment', async () => {
  const h = harness(); await h.begin();
  const original = structuredClone(h.ledger.observationJournal.active);
  await h.act('check_access', base + 15000, {}, false);
  const result = await h.act('recover_observation', base + 15001, { recoveryWindowId: original.id });
  assert.equal(result.outcome.code, 'study_observation_recovered');
  assert.deepEqual(h.ledger.uncertainExposure.intervals, [{ start: original.issuedAtMs, end: base + 15001 }]);
  assert.equal(result.audit.observation.recovery.original.window.lastObservedAtMs, null);
  assert.deepEqual(h.ledger.studyIntervals, []); assert.equal(h.runtime.completedReviewMs, 0);
});

test('material inconsistency or rejected settlement cannot be cleared through ordinary reconnect', async () => {
  for (const reason of ['study_material_interrupted', 'study_settlement_rejected', 'unknown_future_reason']) {
    const { h, unresolved, recovery } = await interruptedHarness();
    const ledger = structuredClone(h.ledger); ledger.observationJournal.unresolved.reason = reason; h.setLedger(ledger);
    const result = await h.act('recover_observation', base + 1002, recovery);
    assert.equal(result.outcome.code, 'study_recovery_review_required');
    assert.equal(result.outcome.deliveryAllowed, false); assert.equal(result.outcome.studyRecovery, null);
    assert.deepEqual(h.ledger.observationJournal.unresolved.window, unresolved.window);
    assert.deepEqual(h.ledger.uncertainExposure.intervals, []);
    assert.equal(result.audit.observation.recovery, undefined);
  }
});

test('multi-day observer gap remains restricted after recovery and cannot erase daily usage by reopening', async () => {
  const { h, recovery } = await interruptedHarness(25 * 60 * 60000);
  const reset = base + 25 * 60 * 60000 + 3;
  await h.act('resume', reset - 1);
  const r = await h.act('recover_observation', reset, recovery);
  assert.equal(r.outcome.code, 'study_observation_recovered');
  assert.deepEqual(h.ledger.uncertainExposure.intervals, [{ start: base, end: reset }]);
  assert.equal(h.ledger.studySinceBreakMs, 0); assert.deepEqual(h.ledger.studyIntervals, []);
  let when = reset + P.minimumBreakMs;
  await h.act('resume', when); await h.act('resume', ++when); await h.act('end_break', ++when);
  const blocked = await h.act('open_unit', ++when, { unitId: 'F01-U01' });
  assert.equal(blocked.outcome.policyCode, 'rolling_study_limit'); assert.equal(blocked.outcome.studyWindow, null);
  when = reset + P.rollingWindowMs - P.rollingStudyLimitMs;
  await h.act('resume', when - 2); await h.act('resume', when - 1);
  assert.equal((await h.act('open_unit', when, { unitId: 'F01-U01' })).outcome.policyCode, 'rolling_study_limit');
  const available = await h.act('open_unit', when + 1, { unitId: 'F01-U01' });
  assert.equal(available.outcome.deliveryAllowed, true);
  assert.equal(available.deliveryUntilMs, when + 2, 'only the newly remaining millisecond is reserved');
  assert.equal(h.ledger.uncertainExposure.lastBoundaryMs, reset);
  assert.deepEqual(h.ledger.studyIntervals, []); assert.equal(h.runtime.completedReviewMs, 0);
});

test('synthetic client/server recovery clears before request, fences delayed material and requires fresh pause/ack', async () => {
  const h = harness(); let now = 0, surface = null, timerId = 0;
  const timers = new Map();
  const client = createNmlsDeliveryLifecycle({ now: () => now,
    setTimer(fn, delay) { const id = ++timerId; timers.set(id, { fn, end: now + delay }); return id; },
    clearTimer: id => timers.delete(id), stopMedia: () => {}, clearMaterial: () => { surface = null; },
    renderMaterial: value => { surface = value; } });
  const sent = client.beginRequest(), opened = await h.begin();
  // This test adapter derives a relative budget from the server evaluation
  // timestamp, not the client's wall clock. There is no real HTTP/browser here.
  const payload = (result, evaluatedAt) => ({ deliveryAllowed: result.outcome.deliveryAllowed,
    relativeBudgetMs: result.deliveryUntilMs === null ? 0 : result.deliveryUntilMs - evaluatedAt,
    material: result.outcome.progress });
  assert.equal(client.acceptResponse(sent, payload(opened, base)).accepted, true);
  await h.act('interaction', base, { visible: true });
  now = 5000;
  const oldToken = client.beginRequest(), oldResponse = await h.act('heartbeat', base + now, { visible: true });
  // Old response arrives only after recovery started. No receipt was received
  // for its updated runtime/window horizon, so interruption retains evidence.
  now = 5001;
  const held = await h.act('check_access', base + now, {}, false);
  const original = structuredClone(h.ledger.observationJournal.unresolved);
  now = 5002;
  const recovering = client.recover({ send() {
    assert.equal(surface, null, 'material is cleared before the server boundary');
    assert.equal(client.acceptResponse(oldToken, payload(oldResponse, base + 5000)).accepted, false);
    return h.act('recover_observation', base + now, { recoveryWindowId: held.outcome.studyRecovery.windowId });
  } });
  const recovered = await recovering.result;
  assert.equal(client.acceptResponse(recovering.token, payload(recovered, base + now)).accepted, false);
  assert.equal(surface, null); assert.equal(recovered.outcome.code, 'study_observation_recovered');
  assert.deepEqual(h.ledger.studyIntervals, [{ start: base, end: base + 5000 }]);
  assert.deepEqual(h.ledger.uncertainExposure.intervals, [{ start: base + 5000, end: base + 5002 }]);
  assert.deepEqual(recovered.audit.observation.recovery.original, original);
  now += P.minimumBreakMs;
  await h.act('resume', base + now); await h.act('resume', base + now + 1); await h.act('end_break', base + now + 2);
  now += 3;
  const freshToken = client.beginRequest(), reopened = await h.act('open_unit', base + now, { unitId: 'F01-U01' });
  assert.equal(client.acceptResponse(freshToken, payload(reopened, base + now)).accepted, true);
  assert.notEqual(reopened.outcome.studyWindow.id, original.window.id);
  const acknowledged = await h.act('interaction', base + now + 1, { visible: true });
  assert.equal(acknowledged.outcome.observationCode, 'study_material_acknowledged');
  assert.equal(h.ledger.studySinceBreakMs, 0); assert.equal(h.runtime.current.provisionalMs, 0);
  client.dispose(); assert.equal(surface, null); assert.equal(timers.size, 0);
});

test('real025+027+029+030 transaction persists window/actor/attempt atomically, replays once, and rolls back failed CAS', {
  skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'PGlite required; skipping is not verification.',
}, async t => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite(); t.after(() => db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table public.students(id uuid primary key);');
  for (const f of ['023_nmls_review_runtime.sql', '024_nmls_review_discovery.sql', '025_nmls_review_session_policy.sql',
    '026_nmls_private_final_history.sql','027_nmls_policy_exposure_guards.sql','028_nmls_private_final_remediation.sql',
    '029_nmls_initial_exposure.sql','030_nmls_phase_write_fences.sql','031_nmls_teaching_exposure_guards.sql','032_nmls_joint_teaching.sql',
    '033_nmls_final_reservation.sql','034_nmls_final_delivery_guards.sql','035_nmls_first_final_delivery.sql','036_nmls_first_final_submission.sql','037_nmls_first_final_handoff.sql','038_nmls_second_final_reservation.sql', '039_nmls_second_final_delivery.sql', '040_nmls_second_final_submission.sql']) {
    await db.exec(readFileSync(new URL(`../database/${f}`, import.meta.url), 'utf8'));
  }
  const actor = randomUUID(), grant = randomUUID(), o = offering(real, grant);
  const year = Number((await db.query("select extract(year from clock_timestamp() at time zone 'UTC')::int as year")).rows[0].year);
  Object.assign(o, { year, opensAtMs: Date.UTC(year, 0, 1), closesAtMs: Date.UTC(year + 1, 0, 1) });
  await db.query('insert into public.students(id) values($1)', [actor]);
  await db.query(`insert into public.nmls_review_access_grants(id,student_id,course_key,content_digest,expires_at,granted_by,evidence)
    values($1,$2,$3,$4,clock_timestamp()+interval '1 day',$2,'synthetic observation test')`, [grant, actor, real.id, real.digest]);
  const rpc = async (name, args) => (await db.query(`select public.${name}(${Object.keys(args).map((k, i) => `${k}=>$${i + 1}`).join(',')}) as result`, Object.values(args))).rows[0].result;
  await rpc('nmls_policy_bind', { p_student_id: actor, p_grant_id: grant, p_policy_id: P.id, p_policy_digest: NMLS_POLICY_DIGEST, p_offering: o });
  const started = await rpc('nmls_policy_start', { p_student_id: actor, p_grant_id: grant, p_course_key: real.id,
    p_content_digest: real.digest, p_initial_runtime: startNmlsCourseReview(real) });
  const attempt = started.attempt.id, evaluate = createNmlsObservedPolicyReviewEvaluator();
  const context = () => rpc('nmls_policy_context', { p_student_id: actor, p_attempt_id: attempt });
  const options = { rpc, evaluate, courseFor: getNmlsReviewCourse };
  const inputFor = async (kind, extra = {}) => {
    const c = await context(), active = c.actorPolicy?.ledger.observationJournal?.active;
    return { kind, attemptId: attempt, eventId: randomUUID(), expectedRevision: c.attempt.revision,
      expectedActorRevision: c.actorPolicy?.revision ?? 0, sessionId: c.attempt.runtime.sessionId,
      ...(active ? { studyReceipt: { windowId: active.id, visible: true } } : {}), ...extra };
  };
  const act = async (kind, extra) => transactNmlsPolicyReview(await inputFor(kind, extra), actor, options);
  const rejectForgedCommit = async (kind, extra, mutate, expected) => {
    const before = await context(); let args;
    const capture = async (name, value) => {
      if (name !== 'nmls_policy_commit') return rpc(name, value);
      args = structuredClone(value); throw new Error('capture_for_guard_rejection');
    };
    const input = await inputFor(kind, extra);
    await assert.rejects(transactNmlsPolicyReview(input, actor, { ...options, rpc: capture }), /capture_for_guard_rejection/);
    mutate(args);
    await assert.rejects(rpc('nmls_policy_commit', args), expected);
    const after = await context();
    assert.deepEqual(after.actorPolicy, before.actorPolicy); assert.deepEqual(after.attempt, before.attempt);
    assert.equal((await db.query('select count(*)::int as n from public.nmls_review_actor_policy_events where student_id=$1 and event_id=$2',
      [actor,input.eventId])).rows[0].n,0);
  };
  await act('resume');
  const p = await rpc('nmls_policy_present_rocs', { p_student_id: actor, p_attempt_id: attempt, p_document_digest: o.rocs.documentDigest });
  await act('accept_rocs', { version: '4', documentDigest: o.rocs.documentDigest, acknowledged: true, presentationId: p.id });
  await act('resume'); await act('open_unit', { unitId: 'F01-U01' });
  const acknowledgedInput = await inputFor('interaction', { visible: true, observation: 'keyboard' });
  await transactNmlsPolicyReview(acknowledgedInput, actor, options);
  const saved = await context(); assert.ok(saved.actorPolicy.ledger.observationJournal.active.lastObservedAtMs);
  assert.equal(saved.actorPolicy.ledger.studySinceBreakMs, 0);
  await rejectForgedCommit('check_access', {}, a => { a.p_ledger.observationJournal.active=null; }, /invalid_delivery/);
  const duplicate = await transactNmlsPolicyReview(acknowledgedInput, actor, options);
  assert.equal(duplicate.body.duplicate, true); assert.equal(duplicate.body.deliveryAllowed, false); assert.equal(duplicate.body.studyWindow, null);
  assert.deepEqual(await context().then(c => c.actorPolicy), saved.actorPolicy);
  const stale = await inputFor('heartbeat', { visible: true }); await act('check_access');
  const current = await context();
  await assert.rejects(transactNmlsPolicyReview(stale, actor, options), /revision_conflict/);
  assert.deepEqual(await context().then(c => c.actorPolicy), current.actorPolicy);
  const failed = await inputFor('heartbeat', { visible: true });
  // Throw after the actual attempt UPDATE, proving actor/window/attempt/event
  // transaction rollback rather than simulating a pre-commit network failure.
  await db.exec(`create function public.test_observation_failure() returns trigger language plpgsql as $$
    begin raise exception 'synthetic_after_attempt_write'; end $$;
    create trigger test_observation_failure after update on public.nmls_review_attempts
    for each row execute function public.test_observation_failure();`);
  await assert.rejects(transactNmlsPolicyReview(failed, actor, options), /synthetic_after_attempt_write/);
  const after = await context(); assert.deepEqual(after.actorPolicy, current.actorPolicy); assert.deepEqual(after.attempt, current.attempt);
  await db.exec('drop trigger test_observation_failure on public.nmls_review_attempts;');
  await transactNmlsPolicyReview(failed, actor, options);
  const result = await context();
  assert.equal(result.actorPolicy.ledger.studySinceBreakMs,
    result.actorPolicy.ledger.observationJournal.active.lastObservedAtMs - saved.actorPolicy.ledger.observationJournal.active.lastObservedAtMs);
  assert.equal(result.actorPolicy.revision, result.attempt.revision);

  await t.test('clean bookmark/lease/window/audits commit together; denied restore is rejected by real SQL', async () => {
    await db.query('select pg_sleep(0.01)');
    await act('heartbeat', { visible: true });
    await act('unit_action', { choice: real.modules[0].units[0].actionQuestion.correctChoice });
    const before = await context(), partial = before.attempt.runtime.current;
    assert.ok(partial.provisionalMs > 0, 'milliseconds of synthetic fixture activity, not course-duration evidence');
    assert.ok(partial.completedActionIds.length);
    const lease = async () => (await db.query('select * from public.nmls_review_study_leases where student_id=$1', [actor])).rows[0];
    const beforeLease = await lease(), stop = await inputFor('logout');
    const counts = async () => (await db.query(`select
      (select count(*)::int from public.nmls_review_attempt_events where attempt_id=$1 and event_id=$2) as review,
      (select count(*)::int from public.nmls_review_actor_policy_events where student_id=$3 and event_id=$2) as policy`,
      [attempt, stop.eventId, actor])).rows[0];
    await db.exec(`create function public.test_bookmark_failure() returns trigger language plpgsql as $$
      begin raise exception 'synthetic_after_policy_event'; end $$;
      create trigger test_bookmark_failure after insert on public.nmls_review_actor_policy_events
      for each row execute function public.test_bookmark_failure();`);
    await assert.rejects(transactNmlsPolicyReview(stop, actor, options), /synthetic_after_policy_event/);
    let c = await context();
    assert.deepEqual(c.attempt, before.attempt); assert.deepEqual(c.actorPolicy, before.actorPolicy);
    assert.deepEqual(await lease(), beforeLease); assert.deepEqual(await counts(), { review: 0, policy: 0 });
    await db.exec('drop trigger test_bookmark_failure on public.nmls_review_actor_policy_events;');
    await transactNmlsPolicyReview(stop, actor, options);
    c = await context();
    assert.deepEqual(c.attempt.runtime.bookmark.current, partial);
    assert.equal(c.attempt.runtime.current, null); assert.equal(c.actorPolicy.ledger.observationJournal.active, null);
    assert.equal(c.actorPolicy.ledger.observationJournal.unresolved, null);
    assert.equal(c.attempt.revision, before.attempt.revision + 1); assert.equal(c.actorPolicy.revision, before.actorPolicy.revision + 1);
    assert.equal((await lease()).session_id, null); assert.equal((await lease()).attempt_id, null);
    assert.deepEqual(await counts(), { review: 1, policy: 1 });
    const restored = await act('resume'); assert.equal(restored.body.deliveryAllowed, true);
    c = await context();
    assert.notEqual(c.attempt.runtime.sessionId, beforeLease.session_id);
    assert.equal(c.attempt.runtime.current.attemptId, partial.attemptId);
    assert.equal(c.attempt.runtime.current.provisionalMs, partial.provisionalMs);
    assert.equal(c.attempt.runtime.current.previousEngaged, false);
    const exposure = c.actorPolicy.ledger.studySinceBreakMs;
    await act('heartbeat', { visible: true }); c = await context();
    assert.equal(c.attempt.runtime.current.provisionalMs, partial.provisionalMs);
    assert.equal(c.actorPolicy.ledger.studySinceBreakMs, exposure);
    const replay = await transactNmlsPolicyReview(stop, actor, options);
    assert.equal(replay.body.duplicate, true); assert.equal(replay.body.deliveryAllowed, false);
    assert.deepEqual((await context()).attempt, c.attempt); assert.deepEqual((await context()).actorPolicy, c.actorPolicy);

    await act('logout'); c = await context();
    const pending = structuredClone(c.attempt.runtime.bookmark);
    // Synthetic owner-only setup of a current break, not a real learner pause.
    const paused = { ...c.actorPolicy.ledger, breakStartedAtMs: c.serverTimeMs };
    await db.query('update public.nmls_review_actor_policy set ledger=$1 where student_id=$2', [paused, actor]);
    let deniedArgs;
    const capture = async (name, args) => {
      if (name !== 'nmls_policy_commit') return rpc(name, args);
      deniedArgs = structuredClone(args); throw new Error('capture_denied_resume');
    };
    await assert.rejects(transactNmlsPolicyReview(await inputFor('resume'), actor, { ...options, rpc: capture }), /capture_denied_resume/);
    assert.equal(deniedArgs.p_outcome.policyCode, 'break_in_progress'); assert.equal(deniedArgs.p_outcome.deliveryAllowed, false);
    const forbidden = structuredClone(deniedArgs); forbidden.p_runtime.current = pending.current;
    await assert.rejects(rpc('nmls_policy_commit', forbidden), /nmls_review_invalid_delivery/);
    await rpc('nmls_policy_commit', deniedArgs);
    c = await context();
    assert.deepEqual(c.attempt.runtime.bookmark, pending); assert.equal(c.attempt.runtime.current, null);
    assert.equal(c.actorPolicy.ledger.observationJournal.active, null);
    // Restore only the synthetic fixture's break flag for remaining regressions.
    await db.query('update public.nmls_review_actor_policy set ledger=$1 where student_id=$2',
      [{ ...c.actorPolicy.ledger, breakStartedAtMs: null }, actor]);
    await act('resume');
  });

  const missing = await inputFor('check_access'); delete missing.studyReceipt;
  await transactNmlsPolicyReview(missing, actor, options);
  const interrupted = await context(); assert.ok(interrupted.actorPolicy.ledger.observationJournal.unresolved);
  await act('resume'); assert.deepEqual((await context()).actorPolicy.ledger.observationJournal.unresolved,
    interrupted.actorPolicy.ledger.observationJournal.unresolved);

  await t.test('SQL independently refuses erasing a hold or falsifying original recovery evidence', async () => {
    await rejectForgedCommit('check_access', {}, a => { a.p_ledger.observationJournal.unresolved=null; }, /invalid_observation_transition/);
    await rejectForgedCommit('check_access', {}, a => { a.p_ledger.observationJournal.unresolved.reason=null; }, /invalid_observation_transition/);
    const recovery = { recoveryWindowId: interrupted.actorPolicy.ledger.observationJournal.unresolved.window.id };
    await rejectForgedCommit('recover_observation', recovery, a => { a.p_ledger.uncertainExposure.intervals=[]; }, /invalid_recovery/);
    await rejectForgedCommit('recover_observation', recovery, a => { a.p_audit.observation.recovery.debitStartMs++; }, /invalid_recovery/);
    await rejectForgedCommit('recover_observation', recovery, a => { a.p_ledger.breakStartedAtMs=null; }, /invalid_recovery/);
    await rejectForgedCommit('recover_observation', recovery, a => { a.p_audit.review.kind='check_access'; }, /invalid_recovery/);
  });

  await t.test('bounded recovery uses real atomic commit, retains audit, rejects expired authority and exact/stale replay', async () => {
    const fixture = structuredClone((await context()).actorPolicy.ledger);
    const u = fixture.observationJournal.unresolved;
    const original = structuredClone(u), extra = { recoveryWindowId: u.window.id };
    const staleRecovery = await inputFor('recover_observation', extra); await act('check_access');
    const beforeStale = await context();
    await assert.rejects(transactNmlsPolicyReview(staleRecovery, actor, options), /revision_conflict/);
    assert.deepEqual((await context()).actorPolicy, beforeStale.actorPolicy);
    const recoveryInput = await inputFor('recover_observation', extra), before = await context();
    const eventCount = async () => (await db.query('select count(*)::int as count from public.nmls_review_actor_policy_events where student_id=$1', [actor])).rows[0].count;
    const countBefore = await eventCount();
    await db.exec(`create trigger test_observation_failure after update on public.nmls_review_attempts
      for each row execute function public.test_observation_failure();`);
    await assert.rejects(transactNmlsPolicyReview(recoveryInput, actor, options), /synthetic_after_attempt_write/);
    const rolledBack = await context();
    assert.deepEqual(rolledBack.actorPolicy, before.actorPolicy); assert.deepEqual(rolledBack.attempt, before.attempt);
    assert.equal(await eventCount(), countBefore);
    await db.exec('drop trigger test_observation_failure on public.nmls_review_attempts;');
    // Expired original grant denies the whole transport before recovery. Test
    // restores only its synthetic fixture so the same logical request can run.
    const expires = (await db.query('select expires_at from public.nmls_review_access_grants where id=$1', [grant])).rows[0].expires_at;
    await db.query("update public.nmls_review_access_grants set expires_at=clock_timestamp()-interval '1 second' where id=$1", [grant]);
    await assert.rejects(transactNmlsPolicyReview(recoveryInput, actor, options), /access_denied|expired/);
    await db.query('update public.nmls_review_access_grants set expires_at=$1 where id=$2', [expires, grant]);
    assert.deepEqual((await context()).actorPolicy, before.actorPolicy);
    const recovered = await transactNmlsPolicyReview(recoveryInput, actor, options), savedRecovery = await context();
    assert.equal(recovered.body.code, 'study_observation_recovered'); assert.equal(recovered.body.deliveryAllowed, false);
    assert.equal(recovered.body.studyWindow, null); assert.equal(savedRecovery.actorPolicy.ledger.observationJournal.unresolved, null);
    for (const key of ['studyIntervals', 'studySinceBreakMs', 'lastStudyAtMs', 'sessionStartedAtMs',
      'studyBoundaryAtMs', 'acceptances']) {
      assert.deepEqual(savedRecovery.actorPolicy.ledger[key], before.actorPolicy.ledger[key]);
    }
    assert.equal(savedRecovery.attempt.runtime.completedReviewMs, before.attempt.runtime.completedReviewMs);
    const audit = (await db.query('select audit from public.nmls_review_actor_policy_events where student_id=$1 and event_id=$2',
      [actor, recoveryInput.eventId])).rows[0].audit;
    assert.deepEqual(audit.observation.recovery.original, original);
    assert.equal(audit.observation.recovery.creditAddedMs, 0);
    assert.equal(savedRecovery.actorPolicy.ledger.breakStartedAtMs, audit.observation.recovery.debitEndMs);
    assert.equal(savedRecovery.actorPolicy.ledger.uncertainExposure.lastBoundaryMs, audit.observation.recovery.debitEndMs);
    const replay = await transactNmlsPolicyReview(recoveryInput, actor, options);
    assert.equal(replay.body.duplicate, true); assert.equal(replay.body.deliveryAllowed, false);
    assert.equal(await eventCount(), countBefore + 1);
    assert.deepEqual((await context()).actorPolicy, savedRecovery.actorPolicy);
    assert.deepEqual((await context()).attempt, savedRecovery.attempt);
    // A committed recovery starts a fresh pause, not a fresh teaching permit.
    await act('resume'); const reopen = await act('open_unit', { unitId: 'F01-U01' });
    assert.equal(reopen.body.studyWindow, null); assert.equal(reopen.body.deliveryAllowed, false);
    assert.equal(reopen.body.policyCode, 'break_in_progress');
    assert.deepEqual((await context()).actorPolicy.ledger.uncertainExposure, savedRecovery.actorPolicy.ledger.uncertainExposure);
    await rejectForgedCommit('check_access', {}, a => { a.p_ledger.uncertainExposure.intervals=[]; }, /invalid_exposure_transition/);
    await rejectForgedCommit('check_access', {}, a => { a.p_ledger.breakStartedAtMs=null; }, /invalid_pause_transition/);
    await rejectForgedCommit('check_access', {}, a => { a.p_ledger.lastStudyAtMs--; }, /invalid_pause_transition/);
  });

  await t.test('lost first delivery cannot be replayed into a fresh window or silently recovered', async () => {
    const otherActor = randomUUID(), otherGrant = randomUUID(), otherOffering = { ...o, id: otherGrant };
    await db.query('insert into public.students(id) values($1)', [otherActor]);
    await db.query(`insert into public.nmls_review_access_grants(id,student_id,course_key,content_digest,expires_at,granted_by,evidence)
      values($1,$2,$3,$4,clock_timestamp()+interval '1 day',$2,'synthetic lost-response test')`, [otherGrant, otherActor, real.id, real.digest]);
    await rpc('nmls_policy_bind', { p_student_id: otherActor, p_grant_id: otherGrant, p_policy_id: P.id,
      p_policy_digest: NMLS_POLICY_DIGEST, p_offering: otherOffering });
    const opened = await rpc('nmls_policy_start', { p_student_id: otherActor, p_grant_id: otherGrant,
      p_course_key: real.id, p_content_digest: real.digest, p_initial_runtime: startNmlsCourseReview(real) });
    const otherAttempt = opened.attempt.id;
    const read = () => rpc('nmls_policy_context', { p_student_id: otherActor, p_attempt_id: otherAttempt });
    const command = async (kind, extra = {}) => {
      const c = await read();
      return { kind, attemptId: otherAttempt, eventId: randomUUID(), expectedRevision: c.attempt.revision,
        expectedActorRevision: c.actorPolicy?.revision ?? 0, sessionId: c.attempt.runtime.sessionId, ...extra };
    };
    const run = async (kind, extra) => transactNmlsPolicyReview(await command(kind, extra), otherActor, options);
    await run('resume');
    const shown = await rpc('nmls_policy_present_rocs', { p_student_id: otherActor, p_attempt_id: otherAttempt,
      p_document_digest: o.rocs.documentDigest });
    await run('accept_rocs', { version: '4', documentDigest: o.rocs.documentDigest, acknowledged: true, presentationId: shown.id });
    await run('resume');
    const lostInput = await command('open_unit', { unitId: 'F01-U01' });
    await transactNmlsPolicyReview(lostInput, otherActor, options); // response deliberately discarded
    const committed = await read(); assert.ok(committed.actorPolicy.ledger.observationJournal.active);
    const replayed = await transactNmlsPolicyReview(lostInput, otherActor, options);
    assert.equal(replayed.body.duplicate, true); assert.equal(replayed.body.studyWindow, null);
    assert.deepEqual(replayed.body.progress.lessons, []);
    assert.deepEqual((await read()).actorPolicy, committed.actorPolicy);
    await run('check_access'); // learner did not receive the newly issued ID
    const final = await read();
    assert.deepEqual(final.actorPolicy.ledger.observationJournal.unresolved.window,
      committed.actorPolicy.ledger.observationJournal.active);
    assert.equal(final.actorPolicy.ledger.observationJournal.unresolved.reason, 'study_receipt_missing_or_stale');
    assert.equal(final.actorPolicy.ledger.studySinceBreakMs, 0);
  });
});
