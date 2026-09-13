import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { getNmlsLearningSnapshot } from '../netlify/functions/_lib/nmls-learning-snapshot.mjs';
import { makeNmlsSecondFinalSubmissionSqlFixture } from './helpers/nmls-second-final-submission-sql-fixture.mjs';
import { makeNmlsFirstFinalSubmissionSqlFixture } from './helpers/nmls-first-final-submission-sql-fixture.mjs';

const unavailable = { status: 503, body: { ok: false, code: 'nmls_learning_snapshot_unavailable', advisory: true,
  deliveryAllowed: false, studentDeliveryEnabled: false, creditIssuanceAllowed: false } };
const publicKeys = ['ok', 'code', 'version', 'mode', 'advisory', 'deliveryAllowed', 'studentDeliveryEnabled',
  'creditIssuanceAllowed', 'phase', 'status', 'hold', 'course', 'cursor', 'progress'];
const assertSafe = response => {
  assert.equal(response.status, 200); assert.deepEqual(Object.keys(response.body).sort(), publicKeys.sort());
  assert.equal(response.body.version, 'nmls-learning-snapshot-v1'); assert.equal(response.body.advisory, true);
  for (const k of ['deliveryAllowed', 'studentDeliveryEnabled', 'creditIssuanceAllowed']) assert.equal(response.body[k], false);
  assert.deepEqual(Object.keys(response.body.course).sort(), ['id', 'title']);
  assert.doesNotMatch(JSON.stringify(response.body), /sessionId|session_id|questionIds|optionOrder|correctChoice|rationale|rocs|documentDigest|evidenceId|"answers"|"audit"|"ledger"|"runtime"|PRIVATE SYNTHETIC/);
};

test('snapshot exact input, separate actor and sanitized transport failures', async () => {
  const actor = randomUUID(), grantId = randomUUID(); let calls = 0;
  const rpc = async (name, args) => {
    calls++; assert.equal(name, 'nmls_learning_snapshot');
    assert.deepEqual(args, { p_student_id: actor, p_grant_id: grantId }); throw Error('PRIVATE transport details');
  };
  for (const input of [null, [], {}, { grantId: 'no' }, { grantId, sessionId: randomUUID() },
    { grantId, studentId: actor }, { grantId, answers: {} }, Object.assign(Object.create({ inherited: true }), { grantId })]) {
    assert.equal((await getNmlsLearningSnapshot(input, actor, { rpc })).status, 400);
  }
  assert.equal((await getNmlsLearningSnapshot({ grantId }, 'no', { rpc })).status, 403); assert.equal(calls, 0);
  assert.deepEqual(await getNmlsLearningSnapshot({ grantId }, actor, { rpc }), unavailable); assert.equal(calls, 1);
  for (const [message, status] of [['nmls_learning_snapshot_access_denied', 403], ['nmls_learning_snapshot_requires_review', 409],
    ['nmls_review_invalid_rocs_receipt', 409]]) {
    const r = await getNmlsLearningSnapshot({ grantId }, actor, { rpc: async () => { throw Error(message); } });
    assert.equal(r.status, status); assert.doesNotMatch(JSON.stringify(r), /PRIVATE/);
  }
  for (const e of [Error('raw nmls_learning_snapshot_access_denied PRIVATE'), Error('nmls_unrecognized'),
    Error('nmls_learning_snapshot_requires_review: detail'), 'nmls_learning_snapshot_access_denied',
    Object.create({ message: 'nmls_learning_snapshot_access_denied' }),
    Object.defineProperty({}, 'message', { get() { throw Error('MUST_NOT_READ_GETTER'); } })]) {
    assert.deepEqual(await getNmlsLearningSnapshot({ grantId }, actor, { rpc: async () => { throw e; } }), unavailable);
  }
});

test('read-only snapshot genuine local023–041 lifecycle; synthetic units, not attendance', {
  skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'PGlite required; skipped SQL is not verified.',
}, async t => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite(); t.after(() => db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table students(id uuid primary key);');
  const directory = new URL('../database/nmls-private/', import.meta.url);
  for (const name of readdirSync(directory).filter(n => /^(02[3-9]|03[0-9]|04[01])_/.test(n)).sort()) {
    await db.exec(readFileSync(new URL(name, directory), 'utf8'));
  }
  const rpc = async (name, args) => {
    assert.match(name, /^nmls_[a-z_]+$/); assert.ok(Object.keys(args).every(k => /^p_[a-z_]+$/.test(k)));
    return (await db.query(`select public.${name}(${Object.keys(args).map((k, i) => `${k}=>$${i + 1}`).join(',')}) as result`, Object.values(args))).rows[0].result;
  };
  const stored = [], watched = new Map();
  const observeRpc = async (name, args) => {
    const result = await rpc(name, args);
    if (name === 'nmls_policy_bind') watched.set(args.p_student_id, args.p_grant_id);
    if (name.endsWith('_commit') || name === 'nmls_policy_bind' || name === 'nmls_policy_start') {
      const grant = watched.get(args.p_student_id);
      if (grant) {
        stored.push({ after: name, value: await rpc('nmls_learning_snapshot', { p_student_id: args.p_student_id, p_grant_id: grant }) });
        if (name === 'nmls_policy_bind') {
          for (const table of ['nmls_review_attempts', 'nmls_review_study_leases', 'nmls_review_actor_policy']) {
            assert.equal((await db.query(`select count(*)::int as n from ${table} where student_id=$1`, [args.p_student_id])).rows[0].n, 0);
          }
        }
      }
    }
    return result;
  };
  const h = await makeNmlsSecondFinalSubmissionSqlFixture({ db, rpc: observeRpc });
  const get = (input = { grantId: h.grant }, actor = h.actor, deps = {}) =>
    getNmlsLearningSnapshot(input, actor, { rpc, courseFor: h.deps.courseFor, ...deps });
  const tables = (await db.query("select tablename from pg_tables where schemaname='public' and tablename like 'nmls_%' order by tablename")).rows.map(x => x.tablename);
  const rows = async () => Object.fromEntries(await Promise.all(tables.map(async name => [name,
    (await db.query(`select to_jsonb(x) as row from ${name} x order by to_jsonb(x)::text`)).rows])));
  const original = await rows();

  await t.test('all six phases and genuine source/child cursors are content-free and advisory', async () => {
    const phases = new Set();
    for (const { after, value } of stored) {
      const response = await get({ grantId: value.grant.id }, value.grant.studentId, { rpc: async () => value });
      assert.equal(response.status, 200, `${after}: ${JSON.stringify(response)}`); assertSafe(response);
      phases.add(response.body.phase);
      assert.equal(response.body.course.id, h.course.id);
      assert.ok(response.body.progress.completedUnitCount <= response.body.progress.totalUnitCount);
      if (value.phase === 'not_started') {
        assert.equal(response.body.cursor.attemptId, null); assert.equal(response.body.progress.completedUnitCount, 0);
      }
      if (value.phase === 'remediation' && value.cursor.workflowRevision === 1) {
        assert.equal(response.body.cursor.runtimeRevision, 0); assert.equal(response.body.progress.completedUnitCount, 0);
      }
    }
    assert.deepEqual([...phases].sort(), ['first_final', 'not_started', 'remediation', 'second_final', 'source']);
    const current = await get(); assertSafe(current); assert.equal(current.body.phase, 'second_final');
    assert.equal(current.body.status, 'active'); assert.equal(current.body.cursor.secondFinalId, h.secondId);
    assert.equal(current.body.progress.completedUnitCount, 1); assert.deepEqual(await rows(), original);
  });

  await t.test('read calls do not refresh activity, revise rows, bootstrap missing state or release questions', async () => {
    await db.exec('set role service_role');
    try { for (let i = 0; i < 3; i++) assertSafe(await get()); } finally { await db.exec('reset role'); }
    assert.deepEqual(await rows(), original);
    const unstarted = stored.find(x => x.value.phase === 'not_started').value;
    assert.equal(unstarted.cursor.attemptId, null); assert.equal(unstarted.cursor.actorRevision, null);
    assert.doesNotMatch(JSON.stringify(unstarted), /sessionId|questionIds|optionOrder|"answers"|"audit"|"runtime"/);
  });

  await t.test('private RPC envelope/source/cursor/progress corruption and unexpected fields fail closed', async () => {
    const value = await rpc('nmls_learning_snapshot', { p_student_id: h.actor, p_grant_id: h.grant });
    const mutate = [v => { v.questions = ['SECRET']; }, v => { v.cursor.sessionId = randomUUID(); },
      v => { v.grant.studentId = randomUUID(); }, v => { v.binding.policyDigest = '0'.repeat(64); },
      v => { v.sourceProgress.completedUnitIds = []; }, v => { v.teachingProgress.completedUnitIds.push('invented'); },
      v => { v.teachingLayout[0].units[0].requiredMs = 1; }, v => { v.status = 'arbitrary private text'; },
      v => { v.phase = 'terminal'; v.status = 'invented'; }, v => { v.cursor.firstFinalId = v.cursor.secondFinalId; },
      v => { v.cursor.runtimeRevision = 0; },
      v => { v.teachingProgress.quizModuleId = 'UNKNOWN'; }, v => { v.sourceProgress.currentUnitId = 'UNKNOWN'; }];
    for (const change of mutate) {
      const bad = structuredClone(value); change(bad);
      const r = await get(undefined, undefined, { rpc: async () => bad });
      assert.equal(r.status, 409, change.toString()); assert.equal(Object.hasOwn(r.body, 'progress'), false);
    }
    const r = await get(undefined, undefined, { courseFor: () => ({ ...h.course, title: 'Changed under copied digest' }) });
    assert.equal(r.status, 409); assert.deepEqual(await rows(), original);
    for (const predicate of [v => v.phase === 'source' && v.cursor.sourceRevision === 0,
      v => v.phase === 'remediation' && v.cursor.workflowRevision === 1]) {
      const bad = structuredClone(stored.find(x => predicate(x.value)).value);
      bad.status = 'active'; bad.teachingProgress.status = 'active';
      if (bad.phase === 'source') bad.sourceProgress.status = 'active';
      assert.equal((await get(undefined, undefined, { rpc: async () => bad })).status, 409);
    }
  });

  await t.test('input and RPC objects are detached before awaits and errors never leak evidence', async () => {
    const input = { grantId: h.grant }, value = await rpc('nmls_learning_snapshot', { p_student_id: h.actor, p_grant_id: h.grant });
    const response = await get(input, h.actor, { rpc: async (name, args) => {
      input.grantId = randomUUID(); assert.equal(args.p_grant_id, h.grant); return value;
    }, courseFor: async key => {
      value.cursor.secondFinalId = randomUUID(); return h.deps.courseFor(key);
    } });
    assertSafe(response); assert.equal(response.body.cursor.grantId, h.grant); assert.equal(response.body.cursor.secondFinalId, h.secondId);
  });

  const damage = async (sql, params, expected = 409, setup = null) => {
    // Explicit owner-only damage inside a rollback-only disposable transaction.
    await db.exec('begin; set local session_replication_role=replica;');
    try { if (setup) await db.exec(setup);
      await db.query(sql, params); const before = await rows(); await db.exec('savepoint snapshot_read');
      const response = await get(); await db.exec('rollback to savepoint snapshot_read');
      assert.equal(response.status, expected, sql); assert.deepEqual(await rows(), before);
    } finally { await db.exec('rollback'); }
  };
  await t.test('missing lifecycle receipts and source/runtime ownership contradictions are held without repair', async () => {
    for (const table of ['nmls_final_reservation_events', 'nmls_first_final_submission_events', 'nmls_first_final_handoff_events',
      'nmls_second_final_reservation_events', 'nmls_second_final_delivery_events']) {
      await damage(`delete from ${table} where student_id=$1`, [h.actor]);
    }
    await damage("delete from nmls_teaching_events where student_id=$1 and phase_kind='remediation' and audit#>>'{review,kind}'='quiz_submit'", [h.actor]);
    await damage("delete from nmls_teaching_events where student_id=$1 and phase_kind='source' and runtime_revision=2", [h.actor]);
    await damage("update nmls_review_attempts set course_key='wrong' where id=$1", [h.attemptId]);
    await damage("update nmls_private_remediations set runtime=jsonb_set(runtime,'{completedUnitIds}','[]') where first_final_id=$1", [h.finalId]);
    await damage("update nmls_review_actor_policy set policy_digest=$1 where student_id=$2", ['0'.repeat(64), h.actor]);
    await damage("update nmls_teaching_phase_bindings set phase_scope=jsonb_set(phase_scope,'{ownerId}',to_jsonb($1::text)) where student_id=$2 and phase_kind='source'", [randomUUID(), h.actor]);
    await damage("update nmls_teaching_events set audit=jsonb_set(audit,'{policy,offeringId}',to_jsonb($1::text)) where student_id=$2 and phase_kind='remediation'", [randomUUID(), h.actor]);
    // A saved039 receipt must retain the original definition pin. Matching
    // sidecar/event runtime bytes also cannot hide a revision disagreement
    // with their relational revision counters. These are owner-only faults.
    await damage(`update nmls_second_final_delivery_events set definition_digest=$1 where second_id=$2
      and delivery_revision=(select revision from nmls_second_final_deliveries where second_id=$2)`, ['0'.repeat(64), h.secondId]);
    // The table already rejects this counter fault. Temporarily remove its
    // exact CHECK inside this rollback-only transaction to independently test
    // the snapshot's guard; the transaction restores the CHECK afterwards.
    await damage(`with changed as (
      update nmls_second_final_deliveries set runtime=jsonb_set(runtime,'{revision}',to_jsonb(revision+1))
        where second_id=$1 returning runtime,revision
      ) update nmls_second_final_delivery_events e set runtime=c.runtime from changed c
        where e.second_id=$1 and e.delivery_revision=c.revision`, [h.secondId], 409,
      'alter table nmls_second_final_deliveries drop constraint nmls_second_final_deliveries_check');
    // Keep actual saved039 receipts while removing their sidecar under the
    // rollback-only FK/immutability bypass: never relabel that as reserved0.
    await damage('delete from nmls_second_final_deliveries where second_id=$1', [h.secondId]);
    assert.deepEqual(await rows(), original);
  });

  await t.test('own active grant required; revocation, expiry, unbound grants and other actors cannot discover progress', async () => {
    assert.equal((await get(undefined, randomUUID())).status, 403);
    assert.equal((await get({ grantId: randomUUID() })).status, 403);
    await damage("update nmls_review_access_grants set status='revoked' where id=$1", [h.grant], 403);
    await damage("update nmls_review_access_grants set expires_at=clock_timestamp()-interval '1 second' where id=$1", [h.grant], 403);
    await damage('delete from nmls_review_policy_bindings where grant_id=$1', [h.grant]);
    assert.deepEqual(await rows(), original);
  });

  await t.test('closed/not-open offering can report held metadata without resolving or resetting anything', async () => {
    const source = stored.find(x => x.value.phase === 'not_started').value;
    for (const [at, expected] of [[source.binding.offering.opensAtMs - 1, 'offering_not_open'],
      [source.binding.offering.closesAtMs, 'offering_closed']]) {
      const value = structuredClone(source); value.serverTimeMs = at; value.grant.expiresAtMs = at + 1000;
      const response = await get({ grantId: value.grant.id }, value.grant.studentId, { rpc: async () => value });
      assertSafe(response); assert.equal(response.body.hold, expected);
    }
    assert.deepEqual(await rows(), original);
  });

  await t.test('actual second failure ends in staff review with no new action/material or third form', async () => {
    const input = await h.secondSubmitCommand(17), result = await h.secondSubmit(input);
    assert.equal(result.body.workflowStatus, 'staff_review_required');
    const before = await rows(), response = await get(); assertSafe(response);
    assert.equal(response.body.phase, 'terminal'); assert.equal(response.body.status, 'staff_review_required');
    assert.equal(response.body.cursor.workflowRevision, result.body.workflowRevision); assert.deepEqual(await rows(), before);
    await damage('delete from nmls_second_final_submission_events where student_id=$1', [h.actor]);
  });

  await t.test('genuine first pass reports terminal saved progress without a child or second cursor', async () => {
    const pass = await makeNmlsFirstFinalSubmissionSqlFixture({ db, rpc, correctCount: 18 });
    const before = await rows(), response = await getNmlsLearningSnapshot({ grantId: pass.grant }, pass.actor, pass.deps);
    assertSafe(response); assert.equal(response.body.phase, 'terminal'); assert.equal(response.body.status, 'passed');
    assert.equal(response.body.cursor.secondFinalId, null); assert.equal(response.body.cursor.workflowRevision, null);
    assert.deepEqual(await rows(), before);
  });

  await t.test('genuine second pass reports the sealed terminal workflow, not course credit', async () => {
    const pass = await makeNmlsSecondFinalSubmissionSqlFixture({ db, rpc });
    const submission = await pass.secondSubmit(await pass.secondSubmitCommand(18));
    assert.equal(submission.body.workflowStatus, 'passed');
    const before = await rows(), response = await getNmlsLearningSnapshot({ grantId: pass.grant }, pass.actor, pass.deps);
    assertSafe(response); assert.equal(response.body.phase, 'terminal'); assert.equal(response.body.status, 'passed');
    assert.equal(response.body.cursor.secondFinalId, pass.secondId);
    assert.equal(response.body.cursor.workflowRevision, submission.body.workflowRevision);
    assert.deepEqual(await rows(), before);
  });

  await t.test('only service role may execute snapshot; no helper or direct history table is exposed', async () => {
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`set role ${role}`);
      try { await assert.rejects(() => rpc('nmls_learning_snapshot', { p_student_id: h.actor, p_grant_id: h.grant }), /permission denied/); }
      finally { await db.exec('reset role'); }
    }
    await db.exec('set role service_role');
    try {
      await assert.rejects(() => db.query("select nmls_learning_progress('{}')"), /permission denied/);
      await assert.rejects(() => db.query('select * from nmls_second_final_deliveries'), /permission denied/);
      assertSafe(await get());
    } finally { await db.exec('reset role'); }
  });
});
