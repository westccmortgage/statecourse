import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { makeNmlsSecondFinalSubmissionSqlFixture } from './helpers/nmls-second-final-submission-sql-fixture.mjs';
import { digestNmlsCommand } from '../netlify/functions/_lib/nmls-review-service.mjs';
import { createNmlsSecondFinalSubmissionEvaluator } from '../lib/nmls-second-final-submission.mjs';
import { gradeNmlsDraftFinal } from '../lib/nmls-final-assessment.mjs';

// LOCAL023–040 plus real PRIVATE039/040 adapters. Actual original source,
// first failure, required child, second reservation and second session all run
// with ONE-SECOND SYNTHETIC units. No production attendance, identity, approval
// or CE credit is claimed. Owner mutations below are labeled damage fixtures.
test('second-final submission actual SQL023–040 and private adapters', {
  skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'PGlite required; skipped SQL is not verified.',
}, async t => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite(); t.after(() => db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table students(id uuid primary key);');
  const dir = new URL('../database/', import.meta.url);
  for (const name of readdirSync(dir).filter(x => /^(02[3-9]|03[0-9]|040)_/.test(x)).sort()) {
    await db.exec(readFileSync(new URL(name, dir), 'utf8'));
  }
  const rpc = async (name, args) => {
    assert.match(name, /^nmls_[a-z_]+$/); assert.ok(Object.keys(args).every(k => /^p_[a-z_]+$/.test(k)));
    try { return (await db.query(`select public.${name}(${Object.keys(args).map((k, i) => `${k}=>$${i + 1}`).join(',')}) as result`, Object.values(args))).rows[0].result; }
    catch (e) { e.message += ` [${name}: ${e.where ?? ''}]`; throw e; }
  };
  const fixture = options => makeNmlsSecondFinalSubmissionSqlFixture({ db, rpc, ...options });
  const commit = args => rpc('nmls_second_final_submission_commit', args);
  const tables = ['nmls_review_attempts', 'nmls_review_actor_policy', 'nmls_review_study_leases', 'nmls_private_finals',
    'nmls_private_final_events', 'nmls_private_remediations', 'nmls_private_remediation_events', 'nmls_teaching_events',
    'nmls_first_final_deliveries', 'nmls_first_final_delivery_events', 'nmls_first_final_submission_events',
    'nmls_first_final_handoff_events', 'nmls_second_final_reservation_events', 'nmls_second_final_deliveries',
    'nmls_second_final_delivery_events', 'nmls_second_final_submission_events'];
  const snapshot = async h => Object.fromEntries(await Promise.all(tables.map(async table => [table,
    (await db.query(`select * from ${table} where student_id=$1 order by to_jsonb(${table})::text`, [h.actor])).rows])));
  const metadata = r => {
    assert.equal(r.status, r.body.status); assert.equal(Object.keys(r.body).length, 24);
    for (const k of ['deliveryAllowed', 'studentDeliveryEnabled', 'creditIssuanceAllowed', 'retakeEnabled']) assert.equal(r.body[k], false);
    for (const k of ['questions', 'answers', 'runtime', 'ledger', 'selection', 'definition', 'audit', 'childRuntime', 'studyWindow']) {
      assert.equal(Object.hasOwn(r.body, k), false);
    }
    assert.doesNotMatch(JSON.stringify(r.body), /correctChoice|optionOrder|PRIVATE SYNTHETIC/);
  };
  const capture = async (h, input) => {
    let captured;
    await assert.rejects(() => h.secondSubmit(input, { rpc: async (name, args) => {
      if (name === 'nmls_second_final_submission_commit') { captured = structuredClone(args); throw Error('CAPTURE_ONLY'); }
      return rpc(name, args);
    } }), /CAPTURE_ONLY/);
    assert.ok(captured); return captured;
  };
  const noGrade = createNmlsSecondFinalSubmissionEvaluator({ grade: () => { throw Error('MUST_NOT_GRADE_DENIAL'); } });
  const rehash = args => { args.p_command_digest = digestNmlsCommand(args.p_intent); };
  const derived = args => {
    const { answers, ...intent } = args.p_intent;
    const { p_intent, ...rest } = args;
    return { ...rest, p_command_digest: digestNmlsCommand({ ...intent, kind: 'pause' }),
      p_transition: Object.fromEntries(Object.entries(args.p_transition).filter(([k]) => k !== 'submission')) };
  };
  const unchanged = (before, after) => {
    for (const key of ['nmls_review_attempts', 'nmls_private_finals', 'nmls_private_final_events', 'nmls_private_remediation_events',
      'nmls_teaching_events', 'nmls_first_final_deliveries', 'nmls_first_final_delivery_events',
      'nmls_first_final_submission_events', 'nmls_first_final_handoff_events', 'nmls_second_final_reservation_events']) {
      assert.deepEqual(after[key], before[key], key);
    }
  };

  for (const correct of [18, 17]) await t.test(`${correct}/25 seals exactly once with no third form or rewritten child/first history`, async () => {
    const h = await fixture(), input = await h.secondSubmitCommand(correct), before = await snapshot(h), w0 = await h.workflow();
    await db.exec('set role service_role'); let response;
    try { response = await h.secondSubmit(input); } finally { await db.exec('reset role'); }
    metadata(response); assert.equal(response.body.submitted, true); assert.equal(response.body.duplicate, false);
    assert.equal(response.body.workflowStatus, correct === 18 ? 'passed' : 'staff_review_required');
    assert.deepEqual(response.body.result, gradeNmlsDraftFinal(h.definition, w0.second_selection, input.answers));
    const after = await snapshot(h), w = await h.workflow(); unchanged(before, after);
    assert.deepEqual(w.runtime, w0.runtime); assert.deepEqual(w.manifest, w0.manifest); assert.deepEqual(w.second_selection, w0.second_selection);
    assert.equal(w.revision, w0.revision + 1); assert.equal(w.second_id, w0.second_id); assert.deepEqual(w.second_issued_at, w0.second_issued_at);
    assert.deepEqual(w.second_answers, input.answers); assert.deepEqual(w.second_result, response.body.result);
    assert.equal(after.nmls_private_remediations.length, 1);
    const e = after.nmls_second_final_submission_events[0], de = after.nmls_second_final_delivery_events.find(x => x.event_id === input.eventId);
    assert.equal(e.transaction_id, de.transaction_id); assert.equal(e.workflow_before_revision, w0.revision);
    assert.equal(e.workflow_revision, w.revision); assert.equal(de.workflow_revision, w0.revision);
    assert.equal(e.command_digest, digestNmlsCommand(input));
    const { answers, ...pause } = input;
    assert.equal(e.delivery_command_digest, digestNmlsCommand({ ...pause, kind: 'pause' }));
    assert.equal(de.audit.kind, 'pause'); assert.equal(de.runtime.status, 'paused'); assert.equal(de.runtime.sessionId, input.sessionId);
    const lease = after.nmls_review_study_leases[0];
    assert.equal(lease.phase_kind, 'second_final'); assert.equal(lease.phase_owner_id, h.secondId); assert.equal(lease.phase_active, false);
    const replay = await h.secondSubmit(input, { evaluate: () => { throw Error('MUST_NOT_REGRADE_REPLAY'); } });
    metadata(replay); assert.deepEqual(replay.body, { ...response.body, duplicate: true }); assert.deepEqual(await snapshot(h), after);
    await assert.rejects(() => h.secondSubmit({ ...input, eventId: randomUUID() }, { evaluate: () => { throw Error('MUST_NOT_GRADE_THIRD'); } }), /already_submitted/);
    await assert.rejects(() => h.secondAdapterAct('resume'), /not_reserved|sidecar_scope|context|not_active/);
    await assert.rejects(() => db.query('delete from nmls_second_final_submission_events where student_id=$1', [h.actor]), /immutable/);
    await assert.rejects(() => db.query('update nmls_private_remediations set revision=revision+1 where first_final_id=$1', [h.finalId]), /immutable/);
    assert.deepEqual(await snapshot(h), after);
  });

  await t.test('canonical refusal paths never grade and never seal a result or create another workflow', async () => {
    const cases = [
      ['no activation', 'reserved', async () => {}, {}, true],
      ['first acknowledgement only', 'active', async () => {}, {}, true],
      ['receipt missing', 'acknowledged', async () => {}, {}, false],
      ['hidden receipt', 'acknowledged', async h => {}, { hidden: true }, true],
      ['already paused', 'acknowledged', async h => { await h.secondAdapterAct('pause'); }, {}, true],
      ['break', 'acknowledged', async h => { await h.secondAdapterAct('begin_break'); }, {}, true],
      ['wall limit', 'acknowledged', async h => { await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{sessionStartedAtMs}',
        to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint-43200001)) where student_id=$1`, [h.actor]); }, {}, true],
    ];
    for (const [label, through, prepare, flags, receipt] of cases) {
      const h = await fixture({ through }); await prepare(h);
      let input = await h.secondSubmitCommand(18, {}, receipt);
      if (flags.hidden) input.studyReceipt.visible = false;
      const before = await snapshot(h), w = await h.workflow();
      const response = await h.secondSubmit(input, { evaluate: noGrade }); metadata(response);
      assert.equal(response.body.submitted, false, label); assert.equal(response.body.result, null); assert.equal(response.body.workflowStatus, 'second_issued');
      assert.deepEqual(await h.workflow(), w); const after = await snapshot(h); unchanged(before, after);
      assert.equal(after.nmls_second_final_submission_events.length, 1); assert.equal(after.nmls_second_final_submission_events[0].submitted, false);
      const replay = await h.secondSubmit(input, { evaluate: () => { throw Error('MUST_NOT_EVALUATE_DENIAL_REPLAY'); } });
      assert.deepEqual(replay.body, { ...response.body, duplicate: true }); assert.deepEqual(await snapshot(h), after);
    }
  });

  await t.test('earlier refusal remains exact metadata after a later successful terminal seal', async () => {
    const h = await fixture({ through: 'active' }), deniedInput = await h.secondSubmitCommand(), denied = await h.secondSubmit(deniedInput, { evaluate: noGrade });
    assert.equal(denied.body.observationCode, 'material_acknowledged');
    await h.secondAdapterAct('resume'); await h.secondAdapterAct('heartbeat');
    const input = await h.secondSubmitCommand(17); await h.secondSubmit(input); const sealed = await snapshot(h);
    const replay = await h.secondSubmit(deniedInput, { evaluate: () => { throw Error('NO_REGRADE'); } });
    assert.deepEqual(replay.body, { ...denied.body, duplicate: true }); assert.deepEqual(await snapshot(h), sealed);
    const changed = structuredClone(deniedInput), id = Object.keys(changed.answers)[0];
    changed.answers[id] = ['A', 'B', 'C', 'D'].find(x => x !== changed.answers[id]);
    await assert.rejects(() => h.secondSubmit(changed, { evaluate: () => { throw Error('NO_REGRADE'); } }), /idempotency_conflict/);
    assert.deepEqual(await snapshot(h), sealed);
  });

  await t.test('retained observed union defeats an underreported scalar without grading or erasing history', async () => {
    const h = await fixture(), c = await h.secondContext(), before = structuredClone(c.actorPolicy.ledger);
    // Deliberate owner-only contradictory ledger fixture. No course progress,
    // result, identity or completion is manufactured; the proposed score stays absent.
    const end = Date.now() - 2000, start = end - 12000000;
    const union = (await db.query('select nmls_policy_interval_union($1::jsonb,$2::jsonb) as value',
      [before.studyIntervals, [{ start, end }]])).rows[0].value;
    const damaged = { ...before, studyIntervals: union, studySinceBreakMs: 0,
      studyBoundaryAtMs: start, sessionStartedAtMs: start };
    await db.query('update nmls_review_actor_policy set ledger=$2 where student_id=$1', [h.actor, damaged]);
    const input = await h.secondSubmitCommand(), w = await h.workflow();
    const response = await h.secondSubmit(input, { evaluate: noGrade });
    assert.equal(response.body.submitted, false); assert.equal(response.body.result, null);
    assert.ok(['second_final_exposure_review_required', 'second_final_policy_refused'].includes(response.body.submissionCode));
    assert.deepEqual(await h.workflow(), w);
    const after = (await h.rows()).actor.ledger;
    assert.ok(after.studyIntervals.some(x => x.start <= start && x.end >= end));
    assert.equal(after.sessionStartedAtMs, start); assert.equal(after.studyBoundaryAtMs, start);
  });

  await t.test('stale revisions, sessions and both-way pause ownership cannot reach grading or mutation', async () => {
    const h = await fixture(), input = await h.secondSubmitCommand(), before = await snapshot(h);
    for (const patch of [{ expectedSourceRevision: input.expectedSourceRevision - 1 }, { expectedWorkflowRevision: input.expectedWorkflowRevision - 1 },
      { expectedRevision: input.expectedRevision - 1 }, { expectedActorRevision: input.expectedActorRevision - 1 }, { sessionId: randomUUID() }]) {
      await assert.rejects(() => h.secondSubmit({ ...input, ...patch }, { evaluate: () => { throw Error('NO_STALE_GRADE'); } }), /revision_conflict|session_conflict/);
      assert.deepEqual(await snapshot(h), before);
    }
    const args = await capture(h, input), pauseArgs = derived(args);
    await rpc('nmls_second_final_delivery_commit', pauseArgs); const orphan = await snapshot(h);
    await assert.rejects(() => h.secondSubmit(input, { evaluate: () => { throw Error('NO_ORPHAN_GRADE'); } }), /idempotency_conflict/);
    assert.deepEqual(await snapshot(h), orphan);
    const h2 = await fixture({ through: 'active' }), i2 = await h2.secondSubmitCommand(), a2 = await capture(h2, i2);
    await h2.secondSubmit(i2, { evaluate: noGrade }); const paired = await snapshot(h2);
    await assert.rejects(() => rpc('nmls_second_final_delivery_commit', { ...derived(a2), p_transition: {} }), /idempotency_conflict/);
    assert.deepEqual(await snapshot(h2), paired);
  });

  await t.test('direct SQL rejects corrupted phase, material, budgets, result shape and invented third workflow', async () => {
    const h = await fixture();
    const cases = [
      ['null transition', a => { a.p_transition = null; }],
      ['first phase', a => { a.p_transition.phase.version = 'nmls-first-final-phase-v1'; }],
      ['wrong selection', a => { a.p_transition.phase.finalAttemptId = h.finalId; }],
      ['non-pause', a => { a.p_transition.command.kind = 'heartbeat'; }],
      ['lost interval', a => { a.p_transition.ledger.studyIntervals = []; }],
      ['reset budget', a => { a.p_transition.ledger.studySinceBreakMs = 0; }],
      ['lost acknowledgment', a => { a.p_transition.audit.observation.firstAcknowledgment = true; }],
      ['manufactured credit', a => { a.p_transition.submission.result.creditIssuanceAllowed = true; }],
      ['false arithmetic', a => { a.p_transition.submission.result.percent = 100; }],
      ['wrong disposition', a => { a.p_transition.submission.result.disposition = 'remediation_required'; }],
      ['third workflow', a => { a.p_transition.submission.childRuntime = {}; }],
      ['wrong terminal', a => { a.p_transition.submission.terminalStatus = 'remediating'; }],
      ['payload answers', a => { a.p_transition.submission.answers = {}; }],
      ['public material', a => { a.p_transition.outcome.candidateMaterialAllowed = true; }],
      ['wrong result total', a => { a.p_transition.submission.result.total = 24; }],
      ['invented identity', a => { a.p_transition.audit.policy.actorId = randomUUID(); }],
      ['new session', a => { a.p_transition.runtime.sessionId = randomUUID(); }],
    ];
    for (const [label, mutate] of cases) {
      const input = await h.secondSubmitCommand(), args = await capture(h, input), before = await snapshot(h); mutate(args);
      await assert.rejects(() => commit(args), /nmls_/, label); assert.deepEqual(await snapshot(h), before, label);
    }
    const input = await h.secondSubmitCommand(), base = await capture(h, input), before = await snapshot(h);
    for (const id of [h.priorSourceCommand.eventId, h.reservationCommand.eventId, h.submissionCommand.eventId,
      h.handoffCommand.eventId, h.completionCommand.eventId, h.secondReservationCommand.eventId]) {
      const args = structuredClone(base); args.p_event_id = id; args.p_intent.eventId = id; args.p_transition = {}; rehash(args);
      await assert.rejects(() => commit(args), /idempotency_conflict/); assert.deepEqual(await snapshot(h), before);
    }
  });

  await t.test('four partial-write faults roll back ledger, pause, workflow seal and040 receipt together', async () => {
    const h = await fixture();
    for (const [table, action] of [['nmls_second_final_deliveries', 'update'], ['nmls_second_final_delivery_events', 'insert'],
      ['nmls_private_remediations', 'update'], ['nmls_second_final_submission_events', 'insert']]) {
      const input = await h.secondSubmitCommand(), args = await capture(h, input), before = await snapshot(h);
      await db.exec(`create function second_submission_fault() returns trigger language plpgsql as $$ begin raise exception 'SECOND_SUBMISSION_FAULT'; end $$;
        create trigger second_submission_fault after ${action} on ${table} for each row execute function second_submission_fault();`);
      try { await assert.rejects(() => commit(args), /SECOND_SUBMISSION_FAULT/); }
      finally { await db.exec(`drop trigger second_submission_fault on ${table}; drop function second_submission_fault();`); }
      assert.deepEqual(await snapshot(h), before);
    }
    const input = await h.secondSubmitCommand(); assert.equal((await h.secondSubmit(input)).body.submitted, true);
    assert.equal((await h.secondSubmit(input)).body.duplicate, true);
  });

  await t.test('post-write freshness, grant and actor wall cutoffs leave no grade sealed', async () => {
    for (const kind of ['freshness', 'grant', 'wall']) {
      const h = await fixture();
      if (kind === 'grant') await db.query("update nmls_review_access_grants set expires_at=clock_timestamp()+interval '400 milliseconds' where student_id=$1", [h.actor]);
      if (kind === 'wall') await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{sessionStartedAtMs}',
        to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint-43200000+400)) where student_id=$1`, [h.actor]);
      const input = await h.secondSubmitCommand(), args = await capture(h, input), before = await snapshot(h);
      assert.equal(args.p_transition.submission.submitted, true);
      await db.exec(`create function second_submission_delay() returns trigger language plpgsql as $$ begin perform pg_sleep(${kind === 'freshness' ? 1.1 : 0.6}); return new; end $$;
        create trigger second_submission_delay after insert on nmls_second_final_submission_events for each row execute function second_submission_delay();`);
      try { await assert.rejects(() => commit(args), /clock_refresh_required|access_denied/); }
      finally { await db.exec('drop trigger second_submission_delay on nmls_second_final_submission_events; drop function second_submission_delay();'); }
      assert.deepEqual(await snapshot(h), before); assert.equal((await h.workflow()).status, 'second_issued');
    }
  });

  await t.test('original annual cutoff crosses after tentative seal, then preserves refused ungraded history', async () => {
    const h = await fixture({ beforeActivation: async reserved => {
      await db.query(`update nmls_review_policy_bindings set offering=jsonb_set(offering,'{closesAtMs}',
        to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint+4500)) where grant_id=$1`, [reserved.grant]);
    } });
    await db.query(`select pg_sleep(greatest(0,((offering->>'closesAtMs')::bigint-
      floor(extract(epoch from clock_timestamp())*1000)::bigint-500)/1000.0)) from nmls_review_policy_bindings where grant_id=$1`, [h.grant]);
    const input = await h.secondSubmitCommand(), args = await capture(h, input), before = await snapshot(h);
    assert.equal(args.p_transition.submission.submitted, true);
    await db.exec(`create function second_submission_year() returns trigger language plpgsql as $$ begin perform pg_sleep(0.7); return new; end $$;
      create trigger second_submission_year after insert on nmls_second_final_submission_events for each row execute function second_submission_year();`);
    try { await assert.rejects(() => commit(args), /clock_refresh_required/); }
    finally { await db.exec('drop trigger second_submission_year on nmls_second_final_submission_events; drop function second_submission_year();'); }
    assert.deepEqual(await snapshot(h), before);
    const denied = await h.secondSubmit(input, { evaluate: noGrade });
    assert.equal(denied.body.submitted, false); assert.equal(denied.body.policyCode, 'delivery_window_closed');
    assert.equal((await h.workflow()).status, 'second_issued');
    assert.equal((await h.secondSubmit(input, { evaluate: () => { throw Error('NO_REGRADE'); } })).body.duplicate, true);
  });

  await t.test('original ROCS and grant authority precede sealed replay, and service cannot access internal writers/tables', async () => {
    const h = await fixture(), input = await h.secondSubmitCommand(), args = await capture(h, input);
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`set role ${role}`);
      try { await assert.rejects(() => commit(args), /permission denied/); await assert.rejects(() => h.secondSubmissionContext(input.eventId), /permission denied/); }
      finally { await db.exec('reset role'); }
    }
    await db.exec('set role service_role');
    try {
      await assert.rejects(() => db.query('select * from nmls_second_final_submission_events'), /permission denied/);
      await assert.rejects(() => rpc('nmls_second_final_delivery_pre_submission_internal', derived(args)), /permission denied/);
      await assert.rejects(() => rpc('nmls_second_final_submission_payload_guard', { p_payload: {}, p_answers: {}, p_definition: {} }), /permission denied/);
      assert.equal((await commit(args)).outcome.submitted, true);
    } finally { await db.exec('reset role'); }
    const before = await snapshot(h), ledger = (await h.rows()).actor.ledger, bad = structuredClone(ledger);
    bad.acceptances[0].presentationId = randomUUID();
    await db.query('update nmls_review_actor_policy set ledger=$2 where student_id=$1', [h.actor, bad]);
    await assert.rejects(() => commit({ ...args, p_transition: {} }), /rocs|receipt/);
    await db.query('update nmls_review_actor_policy set ledger=$2 where student_id=$1', [h.actor, ledger]);
    assert.deepEqual(await snapshot(h), before);
    await db.query("update nmls_review_access_grants set status='revoked' where student_id=$1", [h.actor]);
    await assert.rejects(() => commit({ ...args, p_transition: {} }), /access_denied/);
  });
});
