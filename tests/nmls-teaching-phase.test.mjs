import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { makeNmlsSourceTeachingContext, makeNmlsRemediationTeachingContext } from '../lib/nmls-teaching-phase.mjs';
import { createNmlsObservedPolicyReviewEvaluator } from '../lib/nmls-study-observer.mjs';
import { createNmlsPolicyReviewEvaluator } from '../lib/nmls-policy-review.mjs';
import { startNmlsCourseReview } from '../lib/nmls-review-runtime.mjs';
import { startNmlsSessionPolicy } from '../lib/nmls-session-policy.mjs';
import { defineNmlsDraftFinal, drawNmlsDraftFinal, gradeNmlsDraftFinal, makeNmlsFinalRemediationCourse } from '../lib/nmls-final-assessment.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { nmlsRestrictionUsage } from '../lib/nmls-uncertain-exposure.mjs';

// SYNTHETIC one-unit/20-second engineering course and invented ROCS evidence.
// In-memory joint updates below are NOT a database transaction, learner timing
// validation, real ROCS/BioSig acceptance, a final delivery path or credit.
const base = Date.parse('2026-06-01T12:00:00Z');
const canonical = x => Array.isArray(x) ? x.map(canonical) : x && typeof x === 'object' ?
  Object.fromEntries(Object.keys(x).sort().map(k => [k, canonical(x[k])])) : x;
const hash = x => createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');
const course = structuredClone(getNmlsReviewCourse('nmls-2026-f01-private-review'));
course.id = 'synthetic-phase-review';
course.modules[0].units = [{ ...course.modules[0].units[0], requiredSeconds: 20 }];
delete course.digest;
course.digest = createHash('sha256').update(JSON.stringify(course)).digest('hex');
const items = Array.from({ length: 50 }, (_, i) => ({
  id: `N26-FIN-F${String(i + 1).padStart(2, '0')}`, category: 'federal', moduleId: 'F01',
  objective: 'Synthetic phase fixture.', stem: `Synthetic problem ${i + 1}?`,
  options: ['A', 'B', 'C', 'D'].map(id => ({ id, text: `Synthetic answer ${id}.` })), correctChoice: 'A',
  rationale: 'Synthetic private rationale.', independenceNote: 'Engineering fixture only.',
  distractorRationales: { B: 'Wrong synthetic answer.', C: 'Wrong synthetic answer.', D: 'Wrong synthetic answer.' },
  sourceRefs: [{ url: 'https://www.consumerfinance.gov/rules-policy/regulations/', locator: 'Synthetic test',
    supports: 'No legal assertion.', checkedOn: '2026-09-12' }],
  remediation: { unitIds: ['F01-U01'], focus: 'Synthetic practice.' },
}));
const definition = defineNmlsDraftFinal(course, { id: 'synthetic-phase-final', items, moduleQuotas: { F01: 25 } });

function harness() {
  const actorId = randomUUID(), grantId = randomUUID();
  const input = { actorId, sourceCourse: structuredClone(course),
    review: { id: randomUUID(), student_id: actorId, grant_id: grantId, course_key: course.id,
      content_digest: course.digest, revision: 0, runtime: startNmlsCourseReview(course) },
    binding: { grant_id: grantId, policy_id: P.id, policy_digest: hash(P), offering: {
      id: grantId, contentDigest: course.digest, year: 2026, educationType: 'annual_ce', timeZone: 'UTC',
      deadlineBasisId: 'synthetic-only', opensAtMs: Date.UTC(2026, 0, 1), closesAtMs: Date.UTC(2027, 0, 1),
      rocs: { version: '4', documentDigest: 'c'.repeat(64), fullDocumentVerified: true, evidenceId: 'synthetic-not-a-document' },
    } } };
  let ledger = startNmlsSessionPolicy(actorId), time = base;
  const evaluate = createNmlsObservedPolicyReviewEvaluator();
  const h = { input, evaluate, get ledger() { return ledger; }, set ledger(v) { ledger = structuredClone(v); },
    get now() { return time; }, get runtime() { return input.workflow?.runtime ?? input.review.runtime; },
    teaching() { return input.workflow ? makeNmlsRemediationTeachingContext(input) : makeNmlsSourceTeachingContext(input); },
    context(kind, extra = {}, at = ++time, receipt = true) {
      const teaching = h.teaching();
      return { ...teaching, ledger, command: { kind, eventId: randomUUID(), attemptId: input.review.id,
        expectedRevision: teaching.runtime.revision, expectedActorRevision: ledger.revision,
        expectedSourceRevision: input.review.revision, expectedWorkflowRevision: input.workflow?.revision ?? null,
        sessionId: teaching.runtime.sessionId,
        ...(receipt && ledger.observationJournal?.active ? { studyReceipt: { windowId: ledger.observationJournal.active.id, visible: true } } : {}), ...extra },
      evidence: { actorId, receivedAtMs: at, presentation: { id: randomUUID(), actorId, offeringId: grantId,
        contentDigest: course.digest, documentDigest: input.binding.offering.rocs.documentDigest, presentedAtMs: at } } };
    },
    async act(kind, extra = {}, at = ++time, receipt = true) {
      time = at;
      const c = h.context(kind, extra, at, receipt), before = structuredClone(c), result = await evaluate(c);
      assert.deepEqual(c, before, 'pure evaluator cannot mutate any authoritative input');
      assert.equal(result.ledger.revision, ledger.revision + 1);
      assert.equal(result.runtime.revision, h.runtime.revision + 1);
      ledger = result.ledger;
      if (input.workflow) { input.workflow.runtime = result.runtime; input.workflow.revision++; }
      else { input.review.runtime = result.runtime; input.review.revision++; }
      return result;
    },
    async begin() {
      await h.act('resume');
      await h.act('accept_rocs', { version: '4', documentDigest: input.binding.offering.rocs.documentDigest, acknowledged: true });
      await h.act('resume');
    },
    failFirst() {
      assert.equal(input.review.runtime.status, 'review_complete');
      input.definition = definition;
      const id = randomUUID(), selection = drawNmlsDraftFinal(definition,
        { id, reviewAttemptId: input.review.id, reviewState: input.review.runtime }, { draw: () => 0 });
      const answers = Object.fromEntries(selection.questionIds.map(id => [id, 'B']));
      const child = makeNmlsFinalRemediationCourse(definition, input.sourceCourse, selection, answers);
      const manifest = { courseKey: child.id, contentDigest: child.digest, sourceCourseKey: course.id,
        sourceContentDigest: course.digest, definitionDigest: definition.digest, finalAttemptId: id,
        reviewAttemptId: input.review.id, moduleIds: child.modules.map(m => m.id),
        unitIds: child.modules.flatMap(m => m.units.map(u => u.id)), completed: false, retakeEnabled: false };
      input.firstFinal = { id, student_id: input.actorId, review_attempt_id: input.review.id, revision: 2,
        submitted_at: new Date(++time).toISOString(), course_key: course.id, content_digest: course.digest,
        definition_digest: definition.digest, selection, answers, result: gradeNmlsDraftFinal(definition, selection, answers),
        remediation_manifest: structuredClone(manifest) };
      input.workflow = { first_final_id: id, student_id: input.actorId, review_attempt_id: input.review.id,
        definition_digest: definition.digest, manifest, revision: 1, status: 'remediating', runtime: startNmlsCourseReview(child),
        second_id: null, second_selection: null, second_answers: null, second_result: null,
        second_issued_at: null, second_submitted_at: null };
      return child;
    },
  };
  return h;
}

async function unit(h) {
  await h.act('open_unit', { unitId: 'F01-U01' });
  await h.act('interaction', { visible: true });
  await h.act('heartbeat', { visible: true }, h.now + 20000);
  await h.act('unit_action', { choice: course.modules[0].units[0].actionQuestion.correctChoice });
  assert.equal((await h.act('complete_unit')).outcome.code, 'unit_review_complete');
}
const quizAnswers = h => Object.fromEntries(h.runtime.quiz.questionIds.map(id =>
  [id, course.modules[0].quiz.bank.find(q => q.id === id).correctChoice]));
async function finish(h) {
  await unit(h); await h.act('quiz_start', { moduleId: 'F01' });
  await h.act('interaction', { visible: true });
  const q = h.runtime.quiz;
  const result = await h.act('quiz_submit', { quizId: q.id, answers: quizAnswers(h) });
  assert.equal(result.outcome.code, 'module_review_passed');
  return result;
}
async function remediation() { const h = harness(); await h.begin(); await finish(h); h.failFirst(); return h; }
function closed(result) {
  assert.equal(result.outcome.deliveryAllowed, false); assert.equal(result.deliveryUntilMs, null);
  assert.deepEqual(result.outcome.progress.lessons, []); assert.equal(result.outcome.progress.quiz, null);
  assert.equal(result.outcome.progress.feedback, null); assert.equal(result.outcome.studyWindow, null);
}

test('observed source → sealed failure → separate remediation shares restrictions, closes terminal teaching', async () => {
  const h = harness(); await h.begin(); const sourceDone = await finish(h); closed(sourceDone);
  assert.equal(sourceDone.outcome.teachingPhaseComplete, true);
  assert.equal(h.ledger.observationJournal.active, null); assert.equal(h.ledger.observationJournal.unresolved, null);
  const original = structuredClone(h.input.review), sourceUsage = structuredClone(h.ledger);
  const child = h.failFirst(), first = structuredClone(h.input.firstFinal);
  assert.notEqual(child.digest, course.digest); assert.equal(h.teaching().offering.contentDigest, course.digest);
  assert.deepEqual(h.runtime.completedUnitIds, []); assert.equal(h.runtime.completedReviewMs, 0);
  assert.deepEqual(h.ledger, sourceUsage, 'child creation cannot reset actor usage or ROCS');
  assert.equal((await h.act('resume')).outcome.policyCode, 'session_policy_allowed');
  const done = await finish(h); closed(done);
  assert.equal(h.runtime.completedReviewMs, 20000); assert.equal(h.runtime.status, 'review_complete');
  assert.equal(h.ledger.acceptances.length, 1); assert.ok(h.ledger.studySinceBreakMs > sourceUsage.studySinceBreakMs);
  assert.deepEqual(h.input.review, original); assert.deepEqual(h.input.firstFinal, first);
  for (const kind of ['resume', 'check_access', 'open_unit']) closed(await h.act(kind, { unitId: 'F01-U01' }));
  assert.equal(h.runtime.status, 'review_complete'); assert.equal(h.ledger.observationJournal.active, null);
  assert.equal(h.runtime.creditIssuanceAllowed, false);
});

test('trusted phase is pinned to runtime, source/workflow revisions, actor and ORIGINAL offering', async () => {
  const h = await remediation();
  for (const mutate of [c => c.teachingPhase = structuredClone(c.teachingPhase), c => c.teachingPhase = { ...c.teachingPhase },
    c => c.teachingPhase = Object.create(c.teachingPhase), c => c.command.expectedSourceRevision++,
    c => c.command.expectedWorkflowRevision++, c => c.command.expectedRevision++, c => c.command.expectedActorRevision++,
    c => c.command.attemptId = h.input.firstFinal.id, c => c.evidence.actorId = randomUUID(),
    c => c.offering.contentDigest = c.course.digest, c => c.runtime.completedReviewMs++,
    c => c.course = { ...c.course, title: 'changed after brand' },
    c => c.evidence.receivedAtMs = Date.parse(h.input.firstFinal.submitted_at) - 1]) {
    const c = h.context('resume'); mutate(c);
    await assert.rejects(h.evaluate(c), /nmls_teaching_phase_|revision_conflict/);
  }
  const c = h.context('resume'); delete c.teachingPhase; c.allowContentDigestMismatch = true;
  await assert.rejects(createNmlsPolicyReviewEvaluator()(c), /invalid_policy_server_evidence/);
});

test('source payload and terminal/current requirements cannot drift behind matching digest/status labels', async () => {
  const h = harness();
  const changed = structuredClone(h.input); changed.sourceCourse.modules[0].units[0].requiredSeconds = 1;
  assert.throws(() => makeNmlsSourceTeachingContext(changed), /source_changed/);
  const empty = structuredClone(h.input); empty.review.runtime.status = 'review_complete';
  assert.throws(() => makeNmlsSourceTeachingContext(empty), /runtime_completion/);
  await h.begin(); await h.act('open_unit', { unitId: 'F01-U01' });
  for (const mutate of [r => r.current.requiredMs = 1, r => r.current.requiredActionIds = [],
    r => r.current.sessionId = randomUUID(), r => r.current.provisionalMs = 20001,
    r => r.current.lastReceiptMs = r.lastReceiptMs + 1]) {
    const x = structuredClone(h.input); mutate(x.review.runtime);
    assert.throws(() => makeNmlsSourceTeachingContext(x), /continuity_invalid|runtime_shape/);
  }
  // Actual source-loader output still validates, with no digest rehash/relabel.
  for (const key of ['nmls-2026-f01-private-review', 'nmls-2026-national-comprehensive-private-review-v3']) {
    const x = harness().input, c = getNmlsReviewCourse(key); x.sourceCourse = c;
    Object.assign(x.review, { course_key: c.id, content_digest: c.digest, runtime: startNmlsCourseReview(c) });
    x.binding.offering.contentDigest = c.digest;
    assert.equal(makeNmlsSourceTeachingContext(x).course.digest, c.digest);
  }
});

test('child constructor rejects inconsistent first-final seals, manifests, terminal states and progress', async () => {
  const h = await remediation();
  for (const mutate of [x => x.firstFinal.selection.id = randomUUID(), x => x.firstFinal.selection.reviewAttemptId = randomUUID(),
    x => x.firstFinal.submitted_at = null, x => delete x.firstFinal.submitted_at, x => x.firstFinal.submitted_at = '',
    x => x.firstFinal.result.correct++, x => x.firstFinal.answers[x.firstFinal.selection.questionIds[0]] = 'A',
    x => x.firstFinal.remediation_manifest.completed = true, x => x.workflow.manifest.unitIds = [],
    x => x.workflow.status = 'second_issued', x => x.workflow.second_id = randomUUID(), x => delete x.workflow.second_issued_at,
    x => x.workflow.runtime.status = 'review_complete', x => x.workflow.runtime.revision = x.workflow.revision,
    x => x.review.runtime.completedUnitIds = [], x => x.review.runtime.completedUnitIds.push('F01-U01'),
    x => x.review.runtime.current = false, x => x.review.runtime.quiz = 0,
    x => x.review.runtime.bookmark = false, x => x.review.runtime.quizReservation = 0,
    x => x.workflow.runtime.completedReviewMs = 20000]) {
    const x = structuredClone(h.input); mutate(x);
    assert.throws(() => makeNmlsRemediationTeachingContext(x), /nmls_teaching_phase_|nmls_final_|continuity_invalid/);
  }
});

test('child cannot bootstrap a missing/old journal or accept ROCS under its derived digest', async () => {
  const h = await remediation(), original = structuredClone(h.ledger);
  for (const version of [null, 'nmls-study-windows-v2']) {
    const l = structuredClone(original);
    if (version === null) delete l.observationJournal; else l.observationJournal.version = version;
    h.ledger = l; await assert.rejects(h.evaluate(h.context('resume')), /bootstrap_requires_clean_attempt|invalid_study_observation/);
  }
  h.ledger = original;
  const l = structuredClone(h.ledger); l.acceptances.forEach(a => a.contentDigest = h.teaching().course.digest); h.ledger = l;
  const denied = await h.act('resume'); closed(denied); assert.equal(denied.outcome.policyCode, 'rocs_required');
  const c = h.context('accept_rocs', { version: '4', documentDigest: h.input.binding.offering.rocs.documentDigest, acknowledged: true });
  c.evidence.presentation.contentDigest = c.course.digest;
  const wrong = await h.evaluate(c); closed(wrong); assert.equal(wrong.outcome.ok, false);
  assert.deepEqual(h.ledger.acceptances, l.acceptances);
});

test('later content-free original receipt does not invalidate a sealed first-final timestamp', async () => {
  const h = await remediation(), workflow = h.input.workflow, first = structuredClone(h.input.firstFinal);
  delete h.input.workflow;
  const checked = await h.act('check_access'); closed(checked);
  assert.ok(h.input.review.runtime.lastReceiptMs > Date.parse(first.submitted_at));
  h.input.workflow = workflow;
  assert.equal(h.teaching().teachingPhase.sourceRevision, h.input.review.revision);
  assert.equal((await h.act('resume')).outcome.policyCode, 'session_policy_allowed');
  assert.deepEqual(h.input.firstFinal, first);
});

test('old source window is held exactly, never adopted, cleared or recovered by child', async () => {
  const h = harness(); await h.begin(); await unit(h); await h.act('quiz_start', { moduleId: 'F01' });
  const old = structuredClone(h.ledger.observationJournal.active), q = h.runtime.quiz;
  await h.act('quiz_submit', { quizId: q.id, answers: quizAnswers(h) }); h.failFirst();
  // Simulates unresolved historical state arriving from persistence. It is not
  // a valid atomic handoff and must never be re-scoped to the child.
  const l = structuredClone(h.ledger); l.observationJournal.active = old; h.ledger = l;
  const r = await h.act('resume'); closed(r);
  assert.deepEqual(h.ledger.observationJournal.unresolved.window, old);
  assert.equal(r.outcome.studyRecovery, null);
  const held = structuredClone(h.ledger.observationJournal.unresolved), usage = h.ledger.studySinceBreakMs;
  const blocked = await h.act('recover_observation', { recoveryWindowId: old.id }); closed(blocked);
  assert.deepEqual(h.ledger.observationJournal.unresolved, held); assert.equal(h.ledger.studySinceBreakMs, usage);
  assert.deepEqual(h.runtime.completedUnitIds, []);
});

test('child windows and bookmarks keep stable phase identity across workflow revisions and clean resume', async () => {
  const h = await remediation(); await h.act('resume'); await h.act('open_unit', { unitId: 'F01-U01' });
  const id = h.ledger.observationJournal.active.id, phase = structuredClone(h.ledger.observationJournal.active.scope.teachingPhase);
  await h.act('interaction', { visible: true }); await h.act('heartbeat', { visible: true }, h.now + 10000);
  assert.equal(h.ledger.observationJournal.active.id, id); assert.deepEqual(h.ledger.observationJournal.active.scope.teachingPhase, phase);
  assert.equal(phase.ownerId, h.input.firstFinal.id); assert.equal(h.runtime.current.provisionalMs, 10000);
  const oldSession = h.runtime.sessionId; await h.act('logout'); const bookmark = structuredClone(h.runtime.bookmark);
  assert.equal(bookmark.scope.attemptId, h.input.firstFinal.id);
  const bad = structuredClone(h.input); bad.workflow.runtime.bookmark.scope.attemptId = h.input.review.id;
  assert.throws(() => makeNmlsRemediationTeachingContext(bad), /continuity_invalid/);
  await h.act('resume', {}, h.now + 20000); assert.notEqual(h.runtime.sessionId, oldSession);
  assert.equal(h.runtime.current.provisionalMs, 10000); assert.equal(h.runtime.current.previousEngaged, false);
  assert.notEqual(h.ledger.observationJournal.active.id, id);
  await h.act('heartbeat', { visible: true }); assert.equal(h.runtime.current.provisionalMs, 10000);
  await h.act('heartbeat', { visible: true }, h.now + 10000);
  await h.act('unit_action', { choice: course.modules[0].units[0].actionQuestion.correctChoice }); await h.act('complete_unit');
  await h.act('quiz_start', { moduleId: 'F01' }); const q = structuredClone(h.runtime.quiz);
  await h.act('logout'); await h.act('resume'); assert.deepEqual(h.runtime.quiz, q);
  await h.act('quiz_start', { moduleId: 'F01' }); assert.deepEqual(h.runtime.quiz, q);
});

test('same-child uncertain recovery preserves quiz, requires fresh pause and cannot credit the gap', async () => {
  const h = await remediation(), original = structuredClone(h.input.review);
  await h.act('resume'); await unit(h); await h.act('quiz_start', { moduleId: 'F01' });
  await h.act('interaction', { visible: true });
  const q = structuredClone(h.runtime.quiz), observed = structuredClone(h.ledger.studyIntervals);
  const hidden = await h.act('check_access', { visible: false }); closed(hidden);
  const held = structuredClone(h.ledger.observationJournal.unresolved);
  const recovered = await h.act('recover_observation', { recoveryWindowId: held.window.id }); closed(recovered);
  assert.equal(recovered.outcome.code, 'study_observation_recovered');
  assert.deepEqual(h.ledger.studyIntervals, observed, 'gap is not observed study');
  assert.deepEqual(recovered.audit.observation.recovery.original, held);
  assert.equal(h.ledger.observationJournal.unresolved, null);
  assert.ok(recovered.outcome.resumeNotBeforeMs >= h.now + P.minimumBreakMs);
  closed(await h.act('resume'));
  const pauseEnd = recovered.outcome.resumeNotBeforeMs;
  assert.equal((await h.act('resume', {}, pauseEnd)).outcome.status, 401, 'idle cleanup precedes renewed lease');
  await h.act('resume'); await h.act('end_break'); await h.act('quiz_start', { moduleId: 'F01' });
  assert.deepEqual(h.runtime.quiz, q); assert.deepEqual(h.input.review, original);
  const usage = h.ledger.studySinceBreakMs;
  await h.act('heartbeat', { visible: true });
  assert.equal(h.ledger.studySinceBreakMs, usage, 'first fresh receipt earns no observed study');
  assert.equal(h.runtime.completedReviewMs, 20000);
});

test('ordered progress validation rejects skipped units/modules in a synthetic multi-module source', () => {
  const x = harness().input, c = structuredClone(getNmlsReviewCourse('nmls-2026-national-comprehensive-private-review-v3'));
  c.id = 'synthetic-phase-two-modules'; c.modules = c.modules.filter(m => ['F01', 'E01'].includes(m.id));
  for (const m of c.modules) m.units = [{ ...m.units[0], requiredSeconds: 20 }];
  delete c.digest; c.digest = createHash('sha256').update(JSON.stringify(c)).digest('hex');
  x.sourceCourse = c; x.review.course_key = c.id; x.review.content_digest = c.digest; x.binding.offering.contentDigest = c.digest;
  x.review.revision = 1; x.review.runtime = { ...startNmlsCourseReview(c), revision: 1, status: 'active',
    sessionId: randomUUID(), lastActivityMs: base, lastReceiptMs: base,
    completedUnitIds: ['F01-U01'], passedModuleIds: ['F01'], completedReviewMs: 20000 };
  assert.equal(makeNmlsSourceTeachingContext(x).runtime.completedReviewMs, 20000);
  for (const mutate of [r => r.completedUnitIds = ['E01-U01'], r => r.passedModuleIds = ['E01'],
    r => { r.completedUnitIds.push('E01-U01'); r.completedReviewMs = 40000; r.passedModuleIds = []; },
    r => { r.completedUnitIds.push('E01-U01'); r.completedReviewMs = 40000; r.passedModuleIds.push('E01'); }]) {
    const changed = structuredClone(x); mutate(changed.review.runtime);
    assert.throws(() => makeNmlsSourceTeachingContext(changed), /runtime_progress|runtime_completion/);
  }
});

test('correct child final-module submission at break/daily/idle/year limit cannot complete', async t => {
  for (const kind of ['break', 'daily', 'idle', 'year']) await t.test(kind, async () => {
    const h = await remediation(); await h.act('resume'); await unit(h); await h.act('quiz_start', { moduleId: 'F01' });
    await h.act('interaction', { visible: true });
    const q = h.runtime.quiz, answers = quizAnswers(h), l = structuredClone(h.ledger); let at = h.now + 1;
    if (kind === 'break') l.studySinceBreakMs += P.breakAfterStudyMs - nmlsRestrictionUsage(l, h.now).sinceBreakMs - 1;
    if (kind === 'daily') { l.studyIntervals = [{ start: h.now - P.rollingStudyLimitMs + 1, end: h.now }]; l.lastStudyAtMs = h.now; }
    if (kind === 'idle') at = h.runtime.lastActivityMs + 360000;
    if (kind === 'year') at = h.input.binding.offering.closesAtMs;
    h.ledger = l; const r = await h.act('quiz_submit', { quizId: q.id, answers }, at); closed(r);
    assert.equal(r.outcome.teachingPhaseComplete, false); assert.deepEqual(h.runtime.passedModuleIds, []);
    assert.equal(h.runtime.completedReviewMs, 20000, 'completed units preserved, not recredited');
    assert.notEqual(h.runtime.status, 'review_complete'); assert.ok(h.runtime.quizReservation, 'ungraded selection retained');
  });
});
