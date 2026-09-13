import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { startNmlsSessionPolicy, applyNmlsSessionPolicy } from '../lib/nmls-session-policy.mjs';
import { startNmlsCourseReview, reduceNmlsReview } from '../lib/nmls-review-runtime.mjs';
import { createNmlsPolicyReviewEvaluator } from '../lib/nmls-policy-review.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { transactNmlsPolicyReview, NMLS_POLICY_DIGEST } from '../netlify/functions/_lib/nmls-policy-transaction.mjs';

const start = Date.parse('2026-06-01T12:00:00Z');
const real = getNmlsReviewCourse('nmls-2026-f01-private-review');
function offering(course, id = randomUUID()) { return { id, contentDigest: course.digest, year: 2026,
  educationType: 'annual_ce', timeZone: 'UTC', deadlineBasisId: 'synthetic-test-only',
  opensAtMs: Date.UTC(2026, 0, 1), closesAtMs: Date.UTC(2027, 0, 1),
  rocs: { version: '4', documentDigest: 'c'.repeat(64), fullDocumentVerified: true, evidenceId: 'synthetic-not-a-document' } }; }
function harness({ observerReady = false } = {}) {
  const course = structuredClone(real);
  course.id = 'synthetic-policy-composition'; course.digest = 'a'.repeat(64);
  course.modules[0].units = [{ ...course.modules[0].units[0], requiredSeconds: 20 }];
  const actorId = randomUUID(), o = offering(course), attemptId = randomUUID();
  let runtime = startNmlsCourseReview(course), ledger = startNmlsSessionPolicy(actorId), at = start, interval = null;
  // Deliberately supplied test observations, NOT a production collector or
  // evidence of actual attendance. An absent observer must fail closed.
  const evaluate = createNmlsPolicyReviewEvaluator({ observe: observerReady ? () => ({ ready: true, studyInterval: interval }) : null });
  const h = { course, offering: o, actorId, attemptId, get runtime() { return runtime; }, get ledger() { return ledger; },
    replaceRuntime(r) { runtime = r; }, replaceLedger(l) { ledger = l; },
    async act(kind, when = at, fields = {}, observed = null) {
      at = when; interval = observed;
      const before = structuredClone({ runtime, ledger });
      const command = { kind, eventId: randomUUID(), attemptId, sessionId: runtime.sessionId,
        expectedRevision: runtime.revision, expectedActorRevision: ledger.revision, ...fields };
      const presentation = kind === 'accept_rocs' ? { id: randomUUID(), actorId, offeringId: o.id,
        contentDigest: course.digest, documentDigest: o.rocs.documentDigest, presentedAtMs: at } : null;
      const r = await evaluate({ command, course, runtime, ledger, offering: o, evidence: { actorId, receivedAtMs: at, presentation } });
      assert.deepEqual({ runtime, ledger }, before, 'neither input mutated');
      assert.equal(r.runtime.revision, runtime.revision + 1); assert.equal(r.ledger.revision, ledger.revision + 1);
      assert.equal(r.runtime.lastReceiptMs, at); assert.equal(r.ledger.lastReceiptMs, at);
      assert.equal(r.outcome.progress.creditIssuanceAllowed, false);
      runtime = r.runtime; ledger = r.ledger; return r;
    },
    accept(when = at) { return h.act('accept_rocs', when, { version: '4', documentDigest: o.rocs.documentDigest, acknowledged: true }); },
    async begin() { await h.act('resume'); await h.accept(); return h.act('resume'); },
  }; return h;
}
const noMaterial = r => {
  assert.equal(r.outcome.deliveryAllowed, false); assert.equal(r.deliveryUntilMs, null);
  assert.deepEqual(r.outcome.progress.lessons, []); assert.equal(r.outcome.progress.quiz, null); assert.equal(r.outcome.progress.feedback, null);
};

test('content-free lease bootstrap allows ROCS, but missing observer never opens lessons', async () => {
  const h = harness();
  const boot = await h.act('resume'); noMaterial(boot);
  assert.equal(boot.outcome.policyCode, 'rocs_required'); assert.ok(h.runtime.sessionId);
  assert.equal(h.ledger.sessionStartedAtMs, null);
  const accepted = await h.accept(); noMaterial(accepted);
  assert.equal(accepted.outcome.code, 'rocs_accepted'); assert.equal(h.ledger.acceptances.length, 1);
  await h.act('resume');
  const blocked = await h.act('open_unit', start, { unitId: 'F01-U01' }); noMaterial(blocked);
  assert.equal(blocked.outcome.code, 'study_observation_not_connected'); assert.equal(h.runtime.current, null);
});

test('a settled observation and control have one revision, one receipt, and separate exposure audit', async () => {
  const h = harness({ observerReady: true }); await h.begin();
  await h.act('open_unit', start, { unitId: 'F01-U01' });
  const r = await h.act('begin_break', start + 10000, {}, { start, end: start + 10000 });
  noMaterial(r); assert.equal(r.outcome.code, 'break_started');
  assert.equal(h.ledger.studySinceBreakMs, 10000); assert.equal(h.ledger.breakStartedAtMs, start + 10000);
  assert.equal(r.audit.policy.observation.code, 'study_interval_recorded');
  assert.equal(h.runtime.current, null); assert.equal(h.runtime.completedReviewMs, 0);
});

test('bounded study exposure includes cap excess, wrong answers and quizzes without creating seat time', async () => {
  const h = harness({ observerReady: true }); await h.begin();
  await h.act('open_unit', start, { unitId: 'F01-U01' });
  await h.act('interaction', start, { visible: true });
  await h.act('heartbeat', start + 20000, { visible: true }, { start, end: start + 20000 });
  await h.act('heartbeat', start + 40000, { visible: true }, { start: start + 20000, end: start + 40000 });
  assert.equal(h.runtime.current.provisionalMs, 20000); assert.equal(h.ledger.studySinceBreakMs, 40000);
  const question = h.course.modules[0].units[0].actionQuestion;
  const wrong = question.options.find(o => o.id !== question.correctChoice).id;
  const feedback = await h.act('unit_action', start + 45000, { choice: wrong }, { start: start + 40000, end: start + 45000 });
  assert.equal(feedback.outcome.deliveryAllowed, true); assert.equal(feedback.outcome.progress.feedback.correct, false);
  assert.equal(h.runtime.current.provisionalMs, 20000); assert.equal(h.ledger.studySinceBreakMs, 45000);
  await h.act('unit_action', start + 45001, { choice: question.correctChoice });
  await h.act('complete_unit', start + 45002);
  await h.act('quiz_start', start + 45003, { moduleId: 'F01' });
  const quizId = h.runtime.quiz.id;
  const checked = await h.act('check_access', start + 50003, {}, { start: start + 45003, end: start + 50003 });
  assert.equal(checked.outcome.code, 'review_policy_checked'); assert.equal(h.runtime.quiz.id, quizId);
  assert.equal(h.runtime.completedReviewMs, 20000); assert.equal(h.ledger.studySinceBreakMs, 50000);
  const answers = Object.fromEntries(h.runtime.quiz.questionIds.map(id => [id, h.course.modules[0].quiz.bank.find(q => q.id === id).correctChoice]));
  const passed = await h.act('quiz_submit', start + 50004, { quizId, answers });
  assert.equal(passed.outcome.code, 'module_review_passed'); assert.equal(passed.outcome.deliveryAllowed, true);
  assert.equal(h.runtime.status, 'review_complete'); assert.equal(h.runtime.creditIssuanceAllowed, false);
  const pause = await h.act('begin_break', start + 50005); noMaterial(pause);
  assert.equal(pause.outcome.ok, true); assert.equal(pause.outcome.code, 'break_started');
  assert.equal(h.runtime.status, 'review_complete'); assert.equal(h.ledger.breakStartedAtMs, start + 50005);
  const finishBreak = await h.act('end_break', start + 50005 + P.minimumBreakMs); noMaterial(finishBreak);
  assert.equal(finishBreak.outcome.code, 'break_completed'); assert.equal(h.runtime.completedReviewMs, 20000);
});

test('protocol/sequence refusal redacts material and stops unfinished-unit continuity', async () => {
  const h = harness({ observerReady: true }); await h.begin();
  await h.act('open_unit', start, { unitId: 'F01-U01' });
  await h.act('interaction', start, { visible: true });
  await h.act('heartbeat', start + 10000, { visible: true }, { start, end: start + 10000 });
  const denied = await h.act('open_unit', start + 10001, { unitId: 'forged-next-unit' }); noMaterial(denied);
  assert.equal(denied.outcome.code, 'unit_sequence_blocked'); assert.equal(h.runtime.current, null);
  assert.equal(denied.audit.review.invalidatedMs, 10000); assert.equal(h.ledger.studySinceBreakMs, 10000);
  await h.act('open_unit', start + 10002, { unitId: 'F01-U01' });
  await h.act('heartbeat', start + 10003, { visible: true });
  assert.equal(h.runtime.current.provisionalMs, 0);
});

test('settlement reaching the exact break boundary refuses grading and preserves exposure after invalidation', async () => {
  const h = harness({ observerReady: true }); await h.begin();
  await h.act('open_unit', start, { unitId: 'F01-U01' });
  h.ledger.studySinceBreakMs = P.breakAfterStudyMs - 1000;
  const r = await h.act('unit_action', start + 1000, { choice: h.course.modules[0].units[0].actionQuestion.correctChoice },
    { start, end: start + 1000 });
  assert.equal(r.outcome.code, 'mandatory_break_required'); noMaterial(r);
  assert.equal(h.ledger.studySinceBreakMs, P.breakAfterStudyMs); assert.equal(h.runtime.current, null);
  await h.act('resume', start + 1001); assert.equal(h.ledger.studySinceBreakMs, P.breakAfterStudyMs);
});

test('idle ROCS and break commands first log out without accepting or resetting the actor', async () => {
  const h = harness(); await h.act('resume');
  const late = await h.accept(start + 360000); noMaterial(late);
  assert.equal(late.outcome.status, 401); assert.equal(h.ledger.acceptances.length, 0);
  assert.equal(h.runtime.status, 'logged_out');
  await h.act('resume'); await h.accept(); await h.act('resume');
  h.ledger.studySinceBreakMs = 12345;
  const at = start + 360000;
  await h.act('begin_break', at);
  const ended = await h.act('end_break', at + P.minimumBreakMs);
  assert.equal(ended.outcome.status, 401); assert.equal(h.ledger.studySinceBreakMs, 12345);
  assert.equal(h.ledger.breakStartedAtMs, at);
  await h.act('resume'); const successful = await h.act('end_break');
  assert.equal(successful.outcome.code, 'break_completed'); assert.equal(h.ledger.studySinceBreakMs, 0);
});

test('policy-only polls never extend human activity; horizon respects idle deadline to the millisecond', async () => {
  const h = harness({ observerReady: true }); await h.begin();
  await h.act('open_unit', start, { unitId: 'F01-U01' });
  const r = await h.act('check_access', start + 359999);
  assert.equal(r.deliveryUntilMs, start + 360000); assert.equal(h.runtime.lastActivityMs, start);
  const idle = await h.act('check_access', start + 360000); noMaterial(idle);
  assert.equal(idle.outcome.status, 401); assert.equal(h.runtime.current, null);
});

test('outside-window resume stops its lease without a new session, acceptance or counter reset', async () => {
  const h = harness({ observerReady: true }); await h.begin();
  h.offering.closesAtMs = start + 100;
  await h.act('open_unit', start + 99, { unitId: 'F01-U01' });
  const before = structuredClone(h.ledger);
  const closed = await h.act('resume', start + 100); noMaterial(closed);
  assert.equal(closed.outcome.code, 'delivery_window_closed'); assert.equal(h.runtime.sessionId, null);
  const omitReceipt = ({ revision, lastReceiptMs, ...rest }) => rest;
  assert.deepEqual(omitReceipt(h.ledger), omitReceipt(before));
});

test('untrusted revisions/leases fail before observation, and rejected intervals cannot change counters', async () => {
  const h = harness({ observerReady: true }); await h.begin();
  await assert.rejects(() => h.act('check_access', start, { expectedActorRevision: 0 }), /policy_revision_conflict/);
  await assert.rejects(() => h.act('check_access', start, { sessionId: randomUUID() }), /session_conflict/);
  const r = await h.act('check_access', start + 30001, {}, { start, end: start + 30001 });
  noMaterial(r); assert.equal(r.outcome.code, 'invalid_study_interval'); assert.equal(h.ledger.studySinceBreakMs, 0);
  const previous = structuredClone(h.ledger);
  assert.throws(() => applyNmlsSessionPolicy(previous, { kind: 'forged', expectedRevision: previous.revision }, h.offering,
    { actorId: h.actorId, receivedAtMs: start + 30002, studyInterval: { start, end: start + 30002 } }), /invalid_policy_command/);
  assert.deepEqual(previous, h.ledger);
});

test('legacy runtime output stays identical when trusted policy options are absent', () => {
  const c = structuredClone(real), opts = { newId: () => 'deterministic', selectQuestions: (bank, count) => bank.slice(0, count).map(q => q.id) };
  let a = startNmlsCourseReview(c), b = structuredClone(a);
  for (const [kind, at, extra] of [['resume', start, {}], ['open_unit', start + 1, { unitId: 'F01-U01' }],
    ['interaction', start + 2, { visible: true }], ['heartbeat', start + 10002, { visible: true }], ['logout', start + 10003, {}]]) {
    const cmd = { kind, expectedRevision: a.revision, sessionId: a.sessionId, eventId: `event-${at}`, ...extra };
    const left = reduceNmlsReview(a, cmd, c, at, opts);
    const right = reduceNmlsReview(b, cmd, c, at, { ...opts, policyControl: null, policyCheck: false });
    assert.deepEqual(left, right); a = left.state; b = right.state;
  }
});

test('real composed evaluator persists content-free bootstrap/ROCS/idle/break atomically in disposable SQL', {
  skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'PGlite required; a skip is not verification.',
}, async t => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite(); t.after(() => db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table public.students(id uuid primary key);');
  for (const f of ['023_nmls_review_runtime.sql', '024_nmls_review_discovery.sql', '025_nmls_review_session_policy.sql']) {
    await db.exec(readFileSync(new URL(`../database/${f}`, import.meta.url), 'utf8'));
  }
  const actor = randomUUID(), grant = randomUUID(), o = offering(real, grant);
  const year = Number((await db.query("select extract(year from clock_timestamp() at time zone 'UTC')::int as year")).rows[0].year);
  Object.assign(o, { year, opensAtMs: Date.UTC(year, 0, 1), closesAtMs: Date.UTC(year + 1, 0, 1) });
  await db.query('insert into public.students(id) values($1)', [actor]);
  await db.query(`insert into public.nmls_review_access_grants(id,student_id,course_key,content_digest,expires_at,granted_by,evidence)
    values($1,$2,$3,$4,clock_timestamp()+interval '1 day',$2,'synthetic composition only')`, [grant, actor, real.id, real.digest]);
  const rpc = async (name, args) => (await db.query(`select public.${name}(${Object.keys(args).map((k, i) => `${k}=>$${i + 1}`).join(',')}) as result`, Object.values(args))).rows[0].result;
  await rpc('nmls_policy_bind', { p_student_id: actor, p_grant_id: grant, p_policy_id: P.id, p_policy_digest: NMLS_POLICY_DIGEST, p_offering: o });
  const started = await rpc('nmls_policy_start', { p_student_id: actor, p_grant_id: grant, p_course_key: real.id,
    p_content_digest: real.digest, p_initial_runtime: startNmlsCourseReview(real) });
  const attempt = started.attempt.id;
  const context = () => rpc('nmls_policy_context', { p_student_id: actor, p_attempt_id: attempt });
  const evaluate = createNmlsPolicyReviewEvaluator(); // no collector, therefore NO instructional delivery
  async function act(kind, extra = {}) {
    const c = await context();
    const input = { kind, attemptId: attempt, eventId: randomUUID(), expectedRevision: c.attempt.revision,
      expectedActorRevision: c.actorPolicy?.revision ?? 0, sessionId: c.attempt.runtime.sessionId, ...extra };
    const r = await transactNmlsPolicyReview(input, actor, { rpc, courseFor: getNmlsReviewCourse, evaluate });
    assert.equal(r.body.deliveryAllowed, false); return { input, result: r };
  }
  await act('resume'); assert.ok((await context()).attempt.runtime.sessionId);
  const p = await rpc('nmls_policy_present_rocs', { p_student_id: actor, p_attempt_id: attempt, p_document_digest: o.rocs.documentDigest });
  const accepted = await act('accept_rocs', { version: '4', documentDigest: o.rocs.documentDigest, acknowledged: true, presentationId: p.id });
  assert.equal(accepted.result.body.code, 'rocs_accepted');
  const duplicate = await transactNmlsPolicyReview(accepted.input, actor, { rpc, courseFor: getNmlsReviewCourse, evaluate });
  assert.equal(duplicate.body.duplicate, true); assert.equal((await context()).actorPolicy.ledger.acceptances.length, 1);
  await act('resume'); assert.equal((await act('open_unit', { unitId: 'F01-U01' })).result.body.code, 'study_observation_not_connected');
  const broken = await act('begin_break'); assert.equal(broken.result.body.code, 'break_started');
  assert.equal((await act('end_break')).result.body.code, 'break_incomplete');
  const ctx = await context(); ctx.attempt.runtime.lastActivityMs = Number(ctx.serverTimeMs) - 360001;
  await db.query('update public.nmls_review_attempts set runtime=$1 where id=$2', [ctx.attempt.runtime, attempt]);
  assert.equal((await act('check_access')).result.status, 401);
  const final = await context(); assert.equal(final.attempt.runtime.status, 'logged_out');
  assert.equal(final.actorPolicy.ledger.breakStartedAtMs, Number(broken.result.body.resumeNotBeforeMs) - P.minimumBreakMs);
  assert.equal(final.attempt.revision, final.actorPolicy.revision);
  assert.equal((await db.query('select count(*)::int as n from public.nmls_review_actor_policy_events')).rows[0].n, final.actorPolicy.revision);
});
