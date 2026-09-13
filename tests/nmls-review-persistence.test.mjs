import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { executeNmlsReview } from '../netlify/functions/_lib/nmls-review-service.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { reduceNmlsReview } from '../lib/nmls-review-runtime.mjs';

// Optional isolated PostgreSQL-engine integration. No production credentials or
// production DB, and no added application dependency. Example:
// NMLS_TEST_PGLITE_MODULE=/tmp/test-runtime/node_modules/@electric-sql/pglite/dist/index.js node --test tests/nmls-review-persistence.test.mjs
test('NMLS private review SQL + domain + service integration (PostgreSQL/PGlite)', {
  skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'Set NMLS_TEST_PGLITE_MODULE to an isolated PGlite installation; not a passing persistence assertion.',
}, async (t) => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table public.students(id uuid primary key);');
  await db.exec(readFileSync(new URL('../database/nmls-private/023_nmls_review_runtime.sql', import.meta.url), 'utf8'));
  await db.exec(readFileSync(new URL('../database/nmls-private/024_nmls_review_discovery.sql', import.meta.url), 'utf8'));
  const actor = randomUUID(), other = randomUUID();
  await db.query('insert into public.students(id) values($1),($2)', [actor, other]);
  const course = getNmlsReviewCourse('nmls-2026-f01-private-review');
  const rpc = async (name, args) => {
    assert.ok(['nmls_review_list', 'nmls_review_start', 'nmls_review_context', 'nmls_review_commit'].includes(name));
    const keys = Object.keys(args);
    const rows = await db.query(`select public.${name}(${keys.map((key, i) => `${key} => $${i + 1}`).join(',')}) as result`, Object.values(args));
    return rows.rows[0].result;
  };
  async function newGrant() {
    const id = randomUUID();
    await db.query(`insert into public.nmls_review_access_grants(id,student_id,course_key,content_digest,expires_at,granted_by,evidence)
      values($1,$2,$3,$4,now()+interval '1 day',$2,'Synthetic integration fixture only')`, [id, actor, course.id, course.digest]);
    return id;
  }
  const run = (input, who = actor) => executeNmlsReview(input, who, { rpc, courseFor: getNmlsReviewCourse });
  let grant = await newGrant();
  let response = await run({ kind: 'start', grantId: grant, courseKey: course.id });
  const attemptId = response.body.attemptId;
  let progress = response.body.progress;
  const command = (kind, fields = {}) => ({ kind, eventId: randomUUID(), attemptId,
    expectedRevision: progress.revision, sessionId: progress.sessionId, ...fields });
  async function act(kind, fields = {}) {
    const input = command(kind, fields);
    const result = await run(input); progress = result.body.progress; return { input, result };
  }
  const snapshot = async () => (await rpc('nmls_review_context', { p_student_id: actor, p_attempt_id: attemptId })).attempt;

  await t.test('no browser table/RPC privileges; RLS on all four tables', async () => {
    const q = await db.query(`select tablename, rowsecurity from pg_tables where schemaname='public' and tablename like 'nmls_review_%'`);
    assert.equal(q.rows.length, 4); assert.ok(q.rows.every((r) => r.rowsecurity));
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`set role ${role}`);
      try {
        await assert.rejects(() => db.query('select * from public.nmls_review_attempts'), /permission denied/);
        await assert.rejects(() => rpc('nmls_review_context', { p_student_id: actor, p_attempt_id: attemptId }), /permission denied/);
        await assert.rejects(() => rpc('nmls_review_list', { p_student_id: actor }), /permission denied/);
      } finally { await db.exec('reset role'); }
    }
  });
  await t.test('discovery is own-grant only; no evidence, lease, question or raw runtime leaks', async () => {
    const list = await run({ kind: 'list' });
    assert.equal(list.body.reviews.length, 1); assert.equal(list.body.reviews[0].grantId, grant);
    assert.equal(list.body.reviews[0].available, true);
    assert.deepEqual((await run({ kind: 'list' }, other)).body.reviews, []);
    assert.deepEqual(await rpc('nmls_review_list', { p_student_id: null }), []);
    assert.ok(!/Synthetic integration|sessionId|correctChoice|runtime|student_id|granted_by/.test(JSON.stringify(list.body)));
    await assert.rejects(() => run({ kind: 'list', studentId: other }), /invalid_review_request/);
    const expiredGrant = await newGrant();
    await db.query("update public.nmls_review_access_grants set expires_at=now()-interval '1 day' where id=$1", [expiredGrant]);
    assert.equal((await run({ kind: 'list' })).body.reviews.length, 1);
    await db.query('update public.nmls_review_access_grants set content_digest=$1 where id=$2', ['e'.repeat(64), grant]);
    assert.equal((await run({ kind: 'list' })).body.reviews[0].available, false);
    await db.query('update public.nmls_review_access_grants set content_digest=$1 where id=$2', [course.digest, grant]);
  });
  await t.test('ownership and NULL actor denied by database, independently of HTTP', async () => {
    await assert.rejects(() => rpc('nmls_review_context', { p_student_id: other, p_attempt_id: attemptId }), /access_denied/);
    await assert.rejects(() => rpc('nmls_review_context', { p_student_id: null, p_attempt_id: attemptId }), /access_denied/);
    await assert.rejects(() => run({ kind: 'start', grantId: grant, courseKey: course.id }, other), /access_denied/);
  });
  await t.test('start is idempotent but does not disclose an active session to a new tab', async () => {
    await act('resume'); assert.match(progress.sessionId, /^[a-f0-9-]{36}$/);
    const resumed = progress.sessionId;
    const second = await run({ kind: 'start', grantId: grant, courseKey: course.id });
    assert.equal(second.body.attemptId, attemptId); assert.equal(second.body.progress.sessionId, null);
    assert.equal((await snapshot()).runtime.sessionId, resumed);
  });
  await t.test('unit events save; exact duplicate returns original outcome and changed payload conflicts', async () => {
    const { input, result } = await act('open_unit', { unitId: 'F01-U01' });
    await act('interaction', { visible: true, observation: 'keyboard' });
    const newerRevision = progress.revision;
    const duplicate = await run(input);
    assert.equal(duplicate.body.duplicate, true);
    assert.deepEqual(duplicate.body.progress, result.body.progress);
    assert.equal((await snapshot()).revision, newerRevision);
    const saved = await db.query('select outcome from public.nmls_review_attempt_events where attempt_id=$1 and event_id=$2', [attemptId, input.eventId]);
    assert.deepEqual(saved.rows[0].outcome.progress.lessons, [{ id: 'F01-U01' }]);
    await assert.rejects(() => run({ ...input, unitId: 'F01-U02' }), /idempotency_conflict/);
  });
  await t.test('concurrent stale-revision commands cannot both write', async () => {
    const results = await Promise.allSettled([
      run(command('heartbeat', { visible: true })), run(command('heartbeat', { visible: false })),
    ]);
    assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
    assert.match(results.find((r) => r.status === 'rejected').reason.message, /revision_conflict/);
    progress = results.find((r) => r.status === 'fulfilled').value.body.progress;
  });
  await t.test('wrong lease is a controlled conflict, not a write or a 503 invalid-state path', async () => {
    await assert.rejects(() => run(command('heartbeat', { visible: true, sessionId: randomUUID() })), /session_conflict/);
  });
  await t.test('SQL itself rejects stale clock, NULL revision and a forged grant of credit', async () => {
    const context = await rpc('nmls_review_context', { p_student_id: actor, p_attempt_id: attemptId });
    const input = command('heartbeat', { visible: true });
    const reduced = reduceNmlsReview(context.attempt.runtime, input, course, Number(context.serverTimeMs));
    const args = { p_student_id: actor, p_attempt_id: attemptId, p_event_id: input.eventId,
      p_command_digest: 'a'.repeat(64), p_expected_revision: progress.revision,
      p_expected_session_id: progress.sessionId, p_evaluated_at_ms: Number(context.serverTimeMs),
      p_content_digest: course.digest, p_runtime: reduced.state, p_outcome: reduced.outcome, p_audit: reduced.audit };
    await assert.rejects(() => rpc('nmls_review_commit', { ...args, p_expected_revision: null }), /revision_conflict/);
    await assert.rejects(() => rpc('nmls_review_commit', { ...args, p_evaluated_at_ms: Number(context.serverTimeMs) - 2000 }), /clock_refresh_required/);
    await assert.rejects(() => rpc('nmls_review_commit', { ...args, p_runtime: { ...reduced.state, creditIssuanceAllowed: true } }), /invalid_state/);
    assert.equal((await snapshot()).revision, progress.revision);
  });
  await t.test('expiry on an otherwise valid completion commits invalidation despite HTTP401', async () => {
    const a = await snapshot(); const expired = Number(Date.now()) - 360001;
    a.runtime.lastActivityMs = expired; a.runtime.current.lastActivityMs = expired;
    a.runtime.current.provisionalMs = 179000;
    await db.query('update public.nmls_review_attempts set runtime=$1 where id=$2', [a.runtime, attemptId]);
    const { result } = await act('complete_unit');
    assert.equal(result.status, 401); assert.equal(result.body.code, 'course_logout_required');
    assert.equal((await snapshot()).runtime.current, null); assert.equal((await snapshot()).runtime.status, 'logged_out');
    const events = await db.query('select audit from public.nmls_review_attempt_events where attempt_id=$1 order by resulting_revision desc limit 1', [attemptId]);
    assert.equal(events.rows[0].audit.invalidatedMs, 179000);
  });
  await t.test('different grants for same student cannot study concurrently', async () => {
    await act('resume'); const oldSession = progress.sessionId;
    const grant2 = await newGrant(); const r2 = await run({ kind: 'start', grantId: grant2, courseKey: course.id });
    await run({ kind: 'resume', attemptId: r2.body.attemptId, eventId: randomUUID(), expectedRevision: 0 });
    await assert.rejects(() => run(command('open_unit', { unitId: 'F01-U01', sessionId: oldSession })), /session_conflict/);
    await act('resume'); assert.notEqual(progress.sessionId, oldSession);
  });
  await t.test('content changes and revoked grants deny access and duplicate replay', async () => {
    const priorDigest = course.digest;
    await db.query('update public.nmls_review_access_grants set content_digest=$1 where id=$2', ['b'.repeat(64), grant]);
    await assert.rejects(() => run(command('open_unit', { unitId: 'F01-U01' })), /content_changed/);
    await db.query('update public.nmls_review_access_grants set content_digest=$1,status=$2 where id=$3', [priorDigest, 'revoked', grant]);
    await assert.rejects(() => run(command('open_unit', { unitId: 'F01-U01' })), /access_denied/);
  });
  await t.test('migration creates no approval, enrollment, commerce or certificate tables', async () => {
    const rows = await db.query("select tablename from pg_tables where schemaname='public'");
    assert.deepEqual(rows.rows.map((r) => r.tablename).sort(), [
      'students', 'nmls_review_access_grants', 'nmls_review_attempts', 'nmls_review_attempt_events', 'nmls_review_study_leases',
    ].sort());
  });
});
