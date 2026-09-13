import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { startNmlsSessionPolicy } from '../lib/nmls-session-policy.mjs';
import { startNmlsCourseReview } from '../lib/nmls-review-runtime.mjs';
import { addNmlsInitialExposureDebit, nmlsRestrictionUsage } from '../lib/nmls-uncertain-exposure.mjs';
import { createNmlsObservedPolicyReviewEvaluator } from '../lib/nmls-study-observer.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';

const at = Date.UTC(2026, 5, 1, 12);
test('initial restriction helper preserves observed work/pause, unions overlap, validates exact server gap', () => {
  const s = startNmlsSessionPolicy(randomUUID());
  Object.assign(s, { lastReceiptMs: at, sessionStartedAtMs: at, studyBoundaryAtMs: at,
    studySinceBreakMs: 500, studyIntervals: [{ start: at, end: at + 500 }] });
  const before = structuredClone(s), r = addNmlsInitialExposureDebit(s, at, at + 1000);
  assert.deepEqual(s, before);
  assert.equal(r.revision, s.revision); assert.deepEqual(r.studyIntervals, s.studyIntervals);
  assert.equal(r.studySinceBreakMs, s.studySinceBreakMs); assert.equal(r.lastStudyAtMs, s.lastStudyAtMs);
  assert.equal(r.breakStartedAtMs, null); assert.equal(nmlsRestrictionUsage(r, at + 1000).sinceBreakMs, 1000);
  assert.equal(r.creditIssuanceAllowed, false);
  for (const [start, end] of [[at - 1, at], [at, at - 1], [at, at + P.maximumObservationMs + 1], [at, NaN], [at, Infinity]]) {
    assert.throws(() => addNmlsInitialExposureDebit(s, start, end), /invalid_initial_exposure/);
  }
  const zero = addNmlsInitialExposureDebit(s, at, at);
  assert.deepEqual(zero.uncertainExposure.intervals, []);
  assert.equal(zero.uncertainExposure.lastBoundaryMs, at); assert.equal(zero.breakStartedAtMs, null);
  assert.equal(P.initialExposureAccounting, 'initial-material-gap-restriction-only-v1');
});

test('SQL029 checks exact initial gaps and original history without opening helper bypasses', {
  skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'PGlite required; skipping is not verification.',
}, async t => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite(); t.after(() => db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table public.students(id uuid primary key);');
  for (const file of ['023_nmls_review_runtime.sql','024_nmls_review_discovery.sql','025_nmls_review_session_policy.sql',
    '027_nmls_policy_exposure_guards.sql','029_nmls_initial_exposure.sql']) {
    await db.exec(readFileSync(new URL(`../database/nmls-private/${file}`, import.meta.url), 'utf8'));
  }
  const course = getNmlsReviewCourse('nmls-2026-f01-private-review'), actor = randomUUID(), attempt = randomUUID();
  const offering = { id: randomUUID(), contentDigest: course.digest, year: 2026,
    educationType: 'annual_ce', timeZone: 'UTC', deadlineBasisId: 'synthetic-only',
    opensAtMs: Date.UTC(2026, 0, 1), closesAtMs: Date.UTC(2027, 0, 1),
    rocs: { version: '4', documentDigest: 'c'.repeat(64), fullDocumentVerified: true, evidenceId: 'synthetic-only' } };
  const evaluate = createNmlsObservedPolicyReviewEvaluator();
  const context = (ledger, runtime, kind, now, extra = {}) => ({ ledger, runtime, course, offering,
    command: { kind, eventId: randomUUID(), attemptId: attempt, sessionId: runtime.sessionId,
      expectedRevision: runtime.revision, expectedActorRevision: ledger.revision,
      ...(ledger.observationJournal?.active ? { studyReceipt: { windowId: ledger.observationJournal.active.id, visible: true } } : {}), ...extra },
    evidence: { actorId: actor, receivedAtMs: now, presentation: { id: randomUUID(), actorId: actor, offeringId: offering.id,
      contentDigest: course.digest, documentDigest: offering.rocs.documentDigest, presentedAtMs: now } } });
  let ledger = startNmlsSessionPolicy(actor), runtime = startNmlsCourseReview(course);
  for (const [kind, extra] of [['resume', {}], ['accept_rocs', { version: '4', documentDigest: offering.rocs.documentDigest, acknowledged: true }],
    ['resume', {}], ['open_unit', { unitId: 'F01-U01' }]]) {
    const r = await evaluate(context(ledger, runtime, kind, at, extra)); ledger = r.ledger; runtime = r.runtime;
  }
  const fixture = async (kind = 'heartbeat', delay = 1000, extra = {}) => {
    const c = context(ledger, runtime, kind, at + delay, kind === 'heartbeat' ? { visible: true, ...extra } : extra);
    return { c: structuredClone(c), r: await evaluate(c) };
  };
  const guard = f => db.query('select public.nmls_policy_guard_exposure($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
    [f.c.ledger,f.r.ledger,f.c.runtime,f.r.runtime,f.r.outcome,f.r.audit,offering,actor,attempt,
      f.c.command.eventId,f.c.evidence.receivedAtMs,f.r.deliveryUntilMs]);

  await t.test('positive and zero gaps, clean controls, replacement and holds follow the real evaluator', async () => {
    for (const [kind, delay, extra] of [['heartbeat', 1000, {}], ['heartbeat', 0, {}], ['logout', 1000, {}],
      ['resume', 1000, {}], ['begin_break', 1000, {}], ['unit_action', 1000, { choice: course.modules[0].units[0].actionQuestion.correctChoice }],
      ['heartbeat', 31000, {}], ['heartbeat', 1000, { visible: false }]]) {
      await guard(await fixture(kind, delay, extra));
    }
  });
  await t.test('forged first-debit metadata, state, scope or counter additions are rejected', async () => {
    for (const mutate of [
      f => { delete f.r.audit.observation.initialExposure; },
      f => { f.r.audit.observation.firstAcknowledgment = null; },
      f => { f.r.audit.observation.initialExposure.debitStartMs++; },
      f => { f.r.audit.observation.initialExposure.debitEndMs = null; },
      f => { f.r.audit.observation.initialExposure.creditAddedMs = 1; },
      f => { f.r.audit.observation.windowBefore.materialDigest = 'b'.repeat(64); },
      f => { f.r.ledger.uncertainExposure.intervals = []; },
      f => { f.r.ledger.uncertainExposure.lastBoundaryMs--; },
      f => { f.r.ledger.studySinceBreakMs++; },
      f => { f.r.ledger.studyIntervals = [{ start: at, end: at + 1000 }]; },
      f => { f.r.ledger.lastStudyAtMs = at + 1000; },
      f => { f.r.ledger.observationJournal.active.lastObservedAtMs = null; },
      f => { f.c.runtime.sessionId = randomUUID(); },
      f => { f.c.ledger.observationJournal.version = 'nmls-study-windows-v1'; },
      f => { f.r.ledger.observationJournal.version = 'nmls-study-windows-v1'; },
      f => { f.c.ledger.uncertainExposure.intervals = [{ start: at - 10, end: at }]; },
      f => { f.c.ledger.uncertainExposure.lastBoundaryMs = -1; },
    ]) {
      const f = await fixture(); mutate(f); await assert.rejects(guard(f), /nmls_review_/);
    }
  });
  await t.test('old counters and first gap jointly cap renewed horizon and cannot fake new-session rest', async () => {
    const c = context(ledger, runtime, 'heartbeat', at + 1000, { visible: true });
    c.ledger = structuredClone(c.ledger); c.ledger.studySinceBreakMs = P.breakAfterStudyMs - 1100;
    const f = { c, r: await evaluate(c) };
    assert.equal(f.r.deliveryUntilMs, at + 1100); await guard(f);
    f.r.deliveryUntilMs++; f.r.outcome.deliveryUntilMs++; f.r.outcome.studyWindow.expiresAtMs++;
    f.r.ledger.observationJournal.active.horizonMs++;
    await assert.rejects(guard(f), /invalid_delivery/);
    const reset = await fixture('resume');
    reset.r.ledger.sessionStartedAtMs = at + 1000; reset.r.ledger.studyBoundaryAtMs = at + 1000;
    await assert.rejects(guard(reset), /invalid_initial_exposure/);
  });
  await t.test('missing journal after prior delivery cannot bootstrap as a clean actor', async () => {
    const f = await fixture(); delete f.c.ledger.observationJournal;
    delete f.r.audit.observation.initialExposure;
    await assert.rejects(guard(f), /bootstrap_requires_clean_attempt/);
  });
  await t.test('new wrapper and old helper remain owner-only; service retains only original RPC', async () => {
    const rows = (await db.query(`select proname,has_function_privilege('service_role',oid,'EXECUTE') as service,
      has_function_privilege('anon',oid,'EXECUTE') as anon,has_function_privilege('authenticated',oid,'EXECUTE') as student
      from pg_proc where pronamespace='public'::regnamespace and proname in
      ('nmls_policy_guard_exposure','nmls_policy_guard_pre_initial_internal','nmls_policy_commit')`)).rows;
    assert.equal(rows.length, 3);
    for (const row of rows) { assert.equal(row.service, row.proname === 'nmls_policy_commit'); assert.equal(row.anon, false); assert.equal(row.student, false); }
  });
});
