import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { makeNmlsSourceTeachingContext, makeNmlsRemediationTeachingContext } from '../lib/nmls-teaching-phase.mjs';
import { createNmlsObservedPolicyReviewEvaluator } from '../lib/nmls-study-observer.mjs';
import { startNmlsCourseReview } from '../lib/nmls-review-runtime.mjs';
import { startNmlsSessionPolicy } from '../lib/nmls-session-policy.mjs';
import { defineNmlsDraftFinal, drawNmlsDraftFinal, gradeNmlsDraftFinal, makeNmlsFinalRemediationCourse } from '../lib/nmls-final-assessment.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { nmlsRestrictionUsage } from '../lib/nmls-uncertain-exposure.mjs';

// SYNTHETIC one-unit/20-second engineering course and invented ROCS evidence.
// Explicit clocks/presentations and the failed-first seal are synthetic fixtures.
// Every positive transition comes from the actual observer/policy/review reducers
// and then passes the real031 SQL guard before the in-memory state is advanced.
// This is NOT the032 atomic persistence test, human timing/identity validation,
// a real ROCS archive, a final delivery path or credit. No wall-clock sleeps.
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

function harness(guard) {
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
      await guard(c, result);
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
async function remediation(guard) { const h = harness(guard); await h.begin(); await finish(h); h.failFirst(); return h; }
function closed(result) {
  assert.equal(result.outcome.deliveryAllowed, false); assert.equal(result.deliveryUntilMs, null);
  assert.deepEqual(result.outcome.progress.lessons, []); assert.equal(result.outcome.progress.quiz, null);
  assert.equal(result.outcome.progress.feedback, null); assert.equal(result.outcome.studyWindow, null);
}


test('031 exposure guard against actual synthetic source/child reducer transitions (local SQL only)', {
  skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'PGlite required; a skip is not verification.',
}, async t => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite(); t.after(() => db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table students(id uuid primary key);');
  for (const file of ['023_nmls_review_runtime.sql', '024_nmls_review_discovery.sql', '025_nmls_review_session_policy.sql',
    '026_nmls_private_final_history.sql', '027_nmls_policy_exposure_guards.sql', '028_nmls_private_final_remediation.sql',
    '029_nmls_initial_exposure.sql', '030_nmls_phase_write_fences.sql', '031_nmls_teaching_exposure_guards.sql']) {
    await db.exec(readFileSync(new URL(`../database/nmls-private/${file}`, import.meta.url), 'utf8'));
  }
  const query = 'select public.nmls_teaching_guard_exposure($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)';
  const transitions = [];
  const argsFor = (c, result) => [c.ledger, result.ledger, c.runtime, result.runtime, result.outcome, result.audit,
    c.offering, c.evidence.actorId, c.command.attemptId, c.command.eventId, c.evidence.receivedAtMs,
    result.deliveryUntilMs, c.teachingPhase.scope, c.course.digest];
  async function guard(c, result) {
    const args = structuredClone(argsFor(c, result));
    try { await db.query(query, args); }
    catch (error) {
      // Include only operation/guard context, never the manuscript or answers.
      error.message = `${c.command.kind}/${result.outcome.code}: ${error.message}`;
      throw error;
    }
    transitions.push({ kind: c.command.kind, args });
  }

  await t.test('source and child traversal account separately, share restrictions and close terminal material', async () => {
    const h = await remediation(guard), source = structuredClone(h.input.review), first = structuredClone(h.input.firstFinal);
    const sourceTerminal = transitions.find(x => x.args[3].status === 'review_complete');
    assert.ok(sourceTerminal); assert.equal(sourceTerminal.args[4].deliveryAllowed, false);
    assert.equal(sourceTerminal.args[1].observationJournal.active, null);
    assert.equal(sourceTerminal.args[1].observationJournal.unresolved, null);
    await h.act('resume'); closed(await finish(h)); closed(await h.act('check_access'));
    assert.deepEqual(h.input.review, source); assert.deepEqual(h.input.firstFinal, first);
    assert.equal(h.runtime.status, 'review_complete'); assert.equal(h.runtime.completedReviewMs, 20000);
    assert.equal(h.ledger.observationJournal.active, null); assert.equal(h.ledger.observationJournal.unresolved, null);
    const initial = transitions.find(x => x.args[5].observation.initialExposure);
    assert.ok(initial); assert.deepEqual(initial.args[1].studyIntervals, initial.args[0].studyIntervals);
    assert.equal(initial.args[1].studySinceBreakMs, initial.args[0].studySinceBreakMs);
    assert.equal(initial.args[5].observation.initialExposure.observedStudyAddedMs, 0);
    assert.equal(initial.args[5].observation.initialExposure.creditAddedMs, 0);
    assert.equal(initial.args[1].uncertainExposure.lastBoundaryMs, initial.args[10]);
  });

  await t.test('hidden child window is held; same-owner recovery preserves quiz and requires a fresh pause', async () => {
    const h = await remediation(guard), source = structuredClone(h.input.review);
    await h.act('resume'); await unit(h); await h.act('quiz_start', { moduleId: 'F01' });
    await h.act('interaction', { visible: true });
    const quiz = structuredClone(h.runtime.quiz), observed = structuredClone(h.ledger.studyIntervals);
    closed(await h.act('check_access', { visible: false }));
    const held = structuredClone(h.ledger.observationJournal.unresolved);
    assert.equal(held.reason, 'study_visibility_interrupted');
    const recovered = await h.act('recover_observation', { recoveryWindowId: held.window.id }); closed(recovered);
    assert.equal(recovered.outcome.code, 'study_observation_recovered');
    assert.deepEqual(recovered.audit.observation.recovery.original, held);
    assert.deepEqual(h.ledger.studyIntervals, observed);
    assert.equal(h.ledger.breakStartedAtMs, h.now);
    assert.equal(recovered.outcome.resumeNotBeforeMs, h.now + P.minimumBreakMs);
    assert.equal(h.ledger.observationJournal.unresolved, null);
    closed(await h.act('resume'));
    assert.equal((await h.act('resume', {}, recovered.outcome.resumeNotBeforeMs)).outcome.status, 401);
    await h.act('resume'); await h.act('end_break'); await h.act('quiz_start', { moduleId: 'F01' });
    assert.deepEqual(h.runtime.quiz, quiz); assert.deepEqual(h.input.review, source);
    const usage = h.ledger.studySinceBreakMs;
    await h.act('heartbeat', { visible: true });
    assert.equal(h.ledger.studySinceBreakMs, usage, 'first restored receipt earns zero observed time');
  });

  await t.test('correct terminal answers at break/daily/idle/year boundaries remain actual reducer denials', async t => {
    for (const kind of ['break', 'daily', 'idle', 'year']) await t.test(kind, async () => {
      const h = await remediation(guard);
      await h.act('resume'); await unit(h); await h.act('quiz_start', { moduleId: 'F01' });
      await h.act('interaction', { visible: true });
      const quiz = h.runtime.quiz, answers = quizAnswers(h), ledger = structuredClone(h.ledger);
      let at = h.now + 1;
      // Deliberately synthetic quota/clock starting points, not invented allowed
      // outcomes. The actual reducer decides the refusal, then SQL validates it.
      if (kind === 'break') ledger.studySinceBreakMs += P.breakAfterStudyMs - nmlsRestrictionUsage(ledger, h.now).sinceBreakMs - 1;
      if (kind === 'daily') {
        ledger.studyIntervals = [{ start: h.now - P.rollingStudyLimitMs + 1, end: h.now }];
        ledger.lastStudyAtMs = h.now;
      }
      if (kind === 'idle') at = h.runtime.lastActivityMs + 360000;
      if (kind === 'year') at = h.input.binding.offering.closesAtMs;
      h.ledger = ledger;
      const result = await h.act('quiz_submit', { quizId: quiz.id, answers }, at); closed(result);
      assert.equal(result.outcome.teachingPhaseComplete, false);
      assert.notEqual(h.runtime.status, 'review_complete'); assert.deepEqual(h.runtime.passedModuleIds, []);
      assert.equal(h.runtime.completedReviewMs, 20000); assert.ok(h.runtime.quizReservation);
      if (kind === 'year') assert.equal(result.outcome.policyCode, 'delivery_window_closed');
      if (kind === 'idle') assert.equal(result.outcome.status, 401);
      if (kind === 'break') assert.equal(result.outcome.policyCode, 'mandatory_break_required');
      if (kind === 'daily') assert.equal(result.outcome.policyCode, 'rolling_study_limit');
    });
    assert.equal(transitions.length, 128, '128 genuine reducer transitions were accepted by031');
  });

  // Negative proposals below are explicit mutations of captured real accepted
  // transitions. None is used as positive evidence or a fabricated green flag.
  const find = predicate => {
    const found = transitions.find(predicate); assert.ok(found, 'captured actual transition exists');
    return structuredClone(found.args);
  };
  async function rejected(args, mutate, pattern = /nmls_review_(invalid_|initial_exposure_required|observation_)/) {
    const proposal = structuredClone(args); mutate(proposal);
    await assert.rejects(() => db.query(query, proposal), pattern);
  }

  await t.test('continuous acknowledgment cannot omit settlement or erase its observed interval', async () => {
    const actual = find(x => x.args[5].policy.observation?.code === 'study_interval_recorded' &&
      x.args[1].studySinceBreakMs > x.args[0].studySinceBreakMs);
    await rejected(actual, a => {
      a[1].studyIntervals = structuredClone(a[0].studyIntervals);
      a[1].studySinceBreakMs = a[0].studySinceBreakMs; a[1].lastStudyAtMs = a[0].lastStudyAtMs;
      delete a[5].policy.observation;
    });
    await rejected(actual, a => { a[1].studyIntervals = structuredClone(a[0].studyIntervals); });
    await rejected(actual, a => { a[5].observation.windowBefore.runtimeRevision++; });
    const initial = find(x => x.args[5].observation.initialExposure);
    await rejected(initial, a => {
      delete a[5].observation.initialExposure;
      a[1].uncertainExposure = structuredClone(a[0].uncertainExposure);
    });
    await rejected(initial, a => { a[1].uncertainExposure = structuredClone(a[0].uncertainExposure); });
  });

  await t.test('actual phase provenance rejects forged owners/digests, old versions and missing child journals', async () => {
    const childWindow = find(x => x.args[12].kind === 'remediation' && x.args[0].observationJournal?.active);
    await rejected(childWindow, a => { a[12].ownerId = randomUUID(); });
    await rejected(childWindow, a => { a[0].observationJournal.active.scope.teachingPhase.ownerId = randomUUID(); });
    await rejected(childWindow, a => { a[0].observationJournal.active.scope.contentDigest = a[6].contentDigest; });
    await rejected(childWindow, a => { a[0].observationJournal.active.scope.teachingPhase.runtimeRevision = 7; });
    await rejected(childWindow, a => { a[0].observationJournal.version = 'nmls-study-windows-v2'; });
    const childResume = find(x => x.kind === 'resume' && x.args[12].kind === 'remediation');
    await rejected(childResume, a => { delete a[0].observationJournal; });
    const originalWindow = find(x => x.args[12].kind === 'source' && x.args[0].observationJournal?.active);
    await rejected(childResume, a => {
      a[0].observationJournal.active = structuredClone(originalWindow[0].observationJournal.active);
      // Even matching actor/offering/session labels cannot adopt source phase.
      Object.assign(a[0].observationJournal.active.scope, {
        actorId: a[7], attemptId: a[8], offeringId: a[6].id, sessionId: randomUUID(),
      });
    });
    const sourceBootstrap = find(x => x.args[12].kind === 'source' && !Object.hasOwn(x.args[0], 'observationJournal'));
    await rejected(sourceBootstrap, a => { a[0].revision = 1; });
    await rejected(sourceBootstrap, a => { a[2].revision = 1; });
  });

  await t.test('terminal closure and numeric limits do not trust a captured allowed-policy label', async () => {
    const terminal = find(x => x.args[3].status === 'review_complete' && x.args[2].status !== 'review_complete');
    assert.equal(terminal[4].policyCode, 'session_policy_allowed'); assert.equal(terminal[11], null);
    await rejected(terminal, a => { a[5].observation.closedWindow = structuredClone(a[0].observationJournal.active); });
    await rejected(terminal, a => {
      const added = a[1].studySinceBreakMs - a[0].studySinceBreakMs;
      a[0].studySinceBreakMs = P.breakAfterStudyMs - added;
      a[1].studySinceBreakMs = P.breakAfterStudyMs;
    });
    await rejected(terminal, a => {
      const start = a[10] - P.rollingStudyLimitMs, priorEnd = a[0].observationJournal.active.lastObservedAtMs;
      a[0].studyIntervals = [{ start, end: priorEnd }]; a[0].lastStudyAtMs = priorEnd;
      a[1].studyIntervals = [{ start, end: a[10] }]; a[1].lastStudyAtMs = a[10];
    });
    await rejected(terminal, a => {
      a[0].sessionStartedAtMs = a[10] - P.sessionWallLimitMs;
      a[1].sessionStartedAtMs = a[0].sessionStartedAtMs;
    });
  });

  await t.test('recovery cannot erase its original hold/debt or reuse an earlier pause boundary', async () => {
    const recovery = find(x => x.args[5].observation.recovery);
    await rejected(recovery, a => { a[5].observation.recovery.original.window.scope.teachingPhase.ownerId = randomUUID(); });
    await rejected(recovery, a => { a[1].uncertainExposure = structuredClone(a[0].uncertainExposure); });
    await rejected(recovery, a => {
      a[1].breakStartedAtMs = a[10] - P.minimumBreakMs;
      a[4].resumeNotBeforeMs = a[10];
    });
    const endBreak = find(x => x.args[5].policy.code === 'break_completed');
    await rejected(endBreak, a => { a[1].studyBoundaryAtMs = null; });
  });

  await t.test('031 helper is owner-only, including against the service role', async () => {
    const signature = 'public.nmls_teaching_guard_exposure(jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,uuid,uuid,uuid,bigint,bigint,jsonb,text)';
    for (const role of ['anon', 'authenticated', 'service_role']) {
      assert.equal((await db.query('select has_function_privilege($1,$2,\'EXECUTE\') as allowed', [role, signature])).rows[0].allowed, false);
    }
  });
});
