import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { setTimeout as pause } from 'node:timers/promises';
import { makeNmlsSecondFinalDeliverySqlFixture } from './helpers/nmls-second-final-delivery-sql-fixture.mjs';
import { digestNmlsCommand } from '../netlify/functions/_lib/nmls-review-service.mjs';

// DISPOSABLE LOCAL023–039. Genuine032→033→035→036→037→032→038 history,
// synthetic ONE-SECOND units and private evidence. This is not attendance,
// real identity, regulatory approval, live rollout or CE-credit verification.
test('second-final delivery actual SQL023–039 (private synthetic fixtures)', {
  skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'PGlite required; skipped SQL is not verified.',
}, async t => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite(); t.after(() => db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table students(id uuid primary key);');
  const directory = new URL('../database/', import.meta.url);
  for (const f of readdirSync(directory).filter(f => /^(02[3-9]|03[0-9])_/.test(f)).sort()) {
    const helperIds = f.startsWith('039_') ? (await db.query(`select oid::int from pg_proc where proname in
      ('nmls_first_final_delivery_prior_write_fence','nmls_review_legacy_write_fence') order by proname`)).rows : null;
    await db.exec(readFileSync(new URL(f, directory), 'utf8'));
    if (helperIds) assert.deepEqual((await db.query(`select oid::int from pg_proc where proname in
      ('nmls_first_final_delivery_prior_write_fence','nmls_review_legacy_write_fence') order by proname`)).rows, helperIds);
  }
  const rpc = async (name, args) => {
    assert.match(name, /^nmls_[a-z_]+$/); assert.ok(Object.keys(args).every(k => /^p_[a-z_]+$/.test(k)));
    try { return (await db.query(`select public.${name}(${Object.keys(args).map((k, i) => `${k}=>$${i + 1}`).join(',')}) as result`, Object.values(args))).rows[0].result; }
    catch (e) { e.message += ` [${name}: ${e.where ?? ''}]`; throw e; }
  };
  const fixture = options => makeNmlsSecondFinalDeliverySqlFixture({ db, rpc, ...options });
  const commit = args => rpc('nmls_second_final_delivery_commit', args);
  const oldTeaching = (h, eventId) => rpc('nmls_teaching_commit', { p_student_id: h.actor, p_attempt_id: h.attemptId,
    p_event_id: eventId, p_command_digest: 'a'.repeat(64), p_phase: {}, p_teaching_digest: 'b'.repeat(64), p_layout: [],
    p_expected_source_revision: 0, p_expected_workflow_revision: 0, p_expected_runtime_revision: 0,
    p_expected_actor_revision: 0, p_expected_session_id: null, p_evaluated_at_ms: Date.now(),
    p_initial_ledger: null, p_ledger: {}, p_runtime: {}, p_outcome: {}, p_audit: {}, p_delivery_until_ms: null });
  const tables = ['nmls_review_attempts', 'nmls_review_actor_policy', 'nmls_review_study_leases', 'nmls_private_finals',
    'nmls_private_remediations', 'nmls_first_final_deliveries', 'nmls_first_final_delivery_events',
    'nmls_first_final_submission_events', 'nmls_first_final_handoff_events', 'nmls_second_final_reservation_events',
    'nmls_teaching_events', 'nmls_second_final_deliveries', 'nmls_second_final_delivery_events'];
  const snapshot = async h => Object.fromEntries(await Promise.all(tables.map(async table => [table,
    (await db.query(`select * from ${table} where student_id=$1 order by to_jsonb(${table})::text`, [h.actor])).rows])));
  const unchangedProgress = async (h, before) => {
    const after = await h.rows();
    for (const key of ['source', 'reservedFinal', 'delivery']) assert.deepEqual(after[key], before[key]);
  };
  function materialRedacted(o) {
    assert.equal(o.candidateMaterialAllowed, false); assert.equal(o.candidateUntilMs, null); assert.equal(o.candidateWindow, null);
    for (const key of ['deliveryAllowed', 'studentDeliveryEnabled', 'creditIssuanceAllowed']) assert.equal(o[key], false);
    for (const key of ['questions', 'answers', 'result', 'selection', 'definition']) assert.equal(Object.hasOwn(o, key), false);
  }
  const rehash = args => { args.p_command_digest = digestNmlsCommand({ ...args.p_transition.command, attemptId: args.p_attempt_id,
    firstFinalId: args.p_first_final_id, secondFinalId: args.p_second_final_id, expectedSourceRevision: args.p_expected_source_revision,
    expectedFinalRevision: args.p_expected_final_revision, expectedWorkflowRevision: args.p_expected_workflow_revision }); };

  await t.test('distinct actual second lifecycle, no first/source/child mutations, no credit and metadata-only replay', async () => {
    const h = await fixture(), before = await h.rows(), workflow = await h.workflow();
    const opened = await h.secondAct('activate');
    assert.equal(opened.response.outcome.candidateMaterialAllowed, true); assert.equal(opened.response.outcome.finalRevision, 2);
    assert.equal(opened.result.runtime.version, 'nmls-second-final-delivery-v1');
    assert.equal(opened.result.audit.phase.version, 'nmls-second-final-phase-v1');
    assert.equal(opened.result.audit.phase.firstFinalAttemptId, h.finalId);
    assert.equal(opened.result.audit.phase.finalAttemptId, h.secondId);
    const ids = [before.source.runtime.sessionId, before.delivery.runtime.sessionId, workflow.runtime.sessionId];
    assert.ok(!ids.includes(opened.result.runtime.sessionId));
    assert.deepEqual(opened.result.ledger.studyIntervals, before.actor.ledger.studyIntervals);
    const ack = await h.secondAct('heartbeat');
    assert.equal(ack.result.outcome.observationCode, 'material_acknowledged');
    assert.deepEqual(ack.result.ledger.studyIntervals, opened.result.ledger.studyIntervals);
    await pause(25);
    const seen = await h.secondAct('interaction', { visible: true });
    assert.equal(seen.result.outcome.observationCode, 'receipt_continuous');
    assert.ok(seen.result.ledger.studySinceBreakMs > ack.result.ledger.studySinceBreakMs);
    const closed = await h.secondAct('pause'), reopened = await h.secondAct('resume');
    assert.notEqual(reopened.result.runtime.sessionId, opened.result.runtime.sessionId);
    assert.deepEqual(closed.result.ledger.observationJournal.active, null);
    assert.equal((await h.rows()).lease.phase_kind, 'second_final');
    assert.equal((await h.rows()).lease.phase_owner_id, h.secondId);
    await unchangedProgress(h, before); assert.deepEqual(await h.workflow(), workflow);
    const saved = await snapshot(h);
    for (const event of saved.nmls_second_final_delivery_events) {
      materialRedacted(event.outcome); assert.equal(event.runtime.creditIssuanceAllowed, false);
      assert.equal(event.audit.instructionalTimeAddedMs, 0); assert.equal(event.audit.creditAddedMs, 0);
      assert.equal(event.reservation_event_id, h.secondReservationCommand.eventId);
    }
    for (const p of [opened, ack, seen, closed, reopened]) {
      const replay = await commit({ ...p.args, p_transition: {}, p_evaluated_at_ms: Date.now() });
      assert.equal(replay.duplicate, true); materialRedacted(replay.outcome);
      assert.deepEqual(replay.runtime, p.result.runtime); assert.deepEqual(await snapshot(h), saved);
    }
  });

  await t.test('preactivation controls never claim second ownership or reset the original actor budgets', async () => {
    const h = await fixture(), before = await h.rows(), child = await h.workflow();
    await h.secondAct('begin_break'); const denied = await h.secondAct('activate');
    assert.equal(denied.result.outcome.candidateMaterialAllowed, false); assert.equal(denied.result.outcome.policyCode, 'break_in_progress');
    assert.equal(denied.result.runtime.sessionId, null); await h.secondAct('logout');
    const after = await h.rows(); assert.deepEqual(after.lease, before.lease); assert.deepEqual(await h.workflow(), child);
    for (const key of ['studyIntervals', 'studySinceBreakMs', 'sessionStartedAtMs', 'studyBoundaryAtMs', 'uncertainExposure']) {
      assert.deepEqual(after.actor.ledger[key], before.actor.ledger[key]);
    }
  });

  await t.test('genuine038 allowed clock skew reaches the real second phase after the clock catches up', async () => {
    const h = await fixture({ reservationClockSkewMs: 500 }), c = await h.secondContext();
    const r = c.secondReservationOrigin, issued = Date.parse(c.workflow.second_issued_at);
    assert.ok(issued < r.runtime.lastReceiptMs);
    assert.ok(r.runtime.lastReceiptMs - issued <= 1000);
    // The SQL origin and actual brand share the existing±1000ms receipt
    // tolerance; no row or scope is rewritten to make this history pass.
    await pause(Math.max(0, r.runtime.lastReceiptMs - Date.now()) + 10);
    const checked = await rpc('nmls_second_final_delivery_origin_guard', { p_actor: h.actor, p_attempt: h.attemptId,
      p_first: h.finalId, p_second: h.secondId, p_definition_digest: h.definition.digest,
      p_definition: h.definition, p_at: Date.now() });
    assert.deepEqual(checked, r);
    assert.equal((await h.secondContext()).secondDelivery, null);
    const opened = await h.secondAct('activate');
    assert.equal(opened.result.outcome.candidateMaterialAllowed, true);
    assert.equal(opened.result.runtime.finalAttemptId, h.secondId);
  });

  await t.test('CAS and event namespaces fail closed before malformed transition evaluation', async () => {
    const h = await fixture(), p = await h.secondProposal('activate'), before = await snapshot(h);
    for (const patch of [{ p_expected_source_revision: p.args.p_expected_source_revision - 1 },
      { p_expected_workflow_revision: p.args.p_expected_workflow_revision - 1 },
      { p_expected_delivery_revision: 1 }, { p_expected_actor_revision: p.args.p_expected_actor_revision - 1 },
      { p_expected_session_id: randomUUID() }]) {
      await assert.rejects(() => commit({ ...p.args, ...patch, p_transition: {} }), /revision_conflict|session_conflict/);
      assert.deepEqual(await snapshot(h), before);
    }
    for (const eventId of [h.priorSourceCommand.eventId, h.reservationCommand.eventId, h.activationCommand.eventId,
      h.submissionCommand.eventId, h.handoffCommand.eventId, h.completionCommand.eventId, h.secondReservationCommand.eventId]) {
      await assert.rejects(() => commit({ ...p.args, p_event_id: eventId, p_transition: {} }), /idempotency_conflict/);
    }
    await h.secondAct('activate'); const active = await snapshot(h);
    const freshChild = await h.childCommand('check_access');
    await assert.rejects(() => h.teach(freshChild), /not_remediating|session_conflict|workflow_scope/);
    await assert.rejects(() => oldTeaching(h, freshChild.eventId), /session_conflict/);
    assert.deepEqual(await snapshot(h), active);
    const openedEvent = active.nmls_second_final_delivery_events[0];
    await assert.rejects(() => oldTeaching(h, openedEvent.event_id), /idempotency_conflict/);
    assert.deepEqual(await snapshot(h), active);
  });

  await t.test('independent guard rejects altered identities, clocks, credit, receipt and history arithmetic', async () => {
    const h = await fixture(); await h.secondAct('activate'); await h.secondAct('heartbeat');
    const variants = [
      ['first scope', a => { a.p_transition.phase.version = 'nmls-first-final-phase-v1'; }],
      ['foreign first', a => { a.p_transition.phase.firstFinalAttemptId = randomUUID(); }],
      ['foreign final', a => { a.p_transition.phase.finalAttemptId = h.finalId; }],
      ['old runtime version', a => { a.p_transition.runtime.version = 'nmls-first-final-delivery-v1'; }],
      ['credit', a => { a.p_transition.runtime.creditIssuanceAllowed = true; }],
      ['ledger reset', a => { a.p_transition.ledger.studyIntervals = []; a.p_transition.ledger.studySinceBreakMs = 0; }],
      ['actor clock reset', a => { a.p_transition.ledger.sessionStartedAtMs = a.p_evaluated_at_ms; }],
      ['lost window', a => { a.p_transition.ledger.observationJournal.active = null; }],
      ['first revision', a => { a.p_transition.outcome.finalRevision = 1; }],
      ['false delivery', a => { a.p_transition.outcome.deliveryAllowed = true; }],
      ['foreign window', a => { a.p_transition.ledger.observationJournal.active.scope.finalPhase.finalAttemptId = h.finalId; }],
      ['lost debit', a => { a.p_transition.ledger.uncertainExposure.intervals = []; }],
      ['invented credit', a => { a.p_transition.audit.creditAddedMs = 1; }],
      ['foreign policy', a => { a.p_transition.audit.policy.actorId = randomUUID(); }],
      ['wrong receipt', a => { a.p_transition.command.studyReceipt.windowId = randomUUID(); rehash(a); }],
      ['null ledger', a => { a.p_transition.ledger = null; }],
      ['private payload', a => { a.p_transition.questions = []; }],
    ];
    for (const [label, mutate] of variants) {
      const p = await h.secondProposal('interaction', { visible: true }), args = structuredClone(p.args), before = await snapshot(h);
      mutate(args);
      await assert.rejects(() => commit(args), /nmls_/, label);
      assert.deepEqual(await snapshot(h), before, label);
    }
    await h.secondAct('interaction', { visible: true });
  });

  await t.test('coherent source/first/child session UUID reuse is rejected by SQL itself', async () => {
    const h = await fixture(), rows = await h.rows(), w = await h.workflow();
    for (const id of [rows.source.runtime.sessionId, rows.delivery.runtime.sessionId, w.runtime.sessionId]) {
      const p = await h.secondProposal('activate'), args = structuredClone(p.args), fresh = p.result.runtime.sessionId;
      args.p_transition = JSON.parse(JSON.stringify(args.p_transition).replaceAll(fresh, id));
      const before = await snapshot(h);
      await assert.rejects(() => commit(args), /session_reused/); assert.deepEqual(await snapshot(h), before);
    }
    await h.secondAct('activate');
  });

  await t.test('missing acknowledgement recovery retains original evidence and debits uncertainty without observed time', async () => {
    const h = await fixture(); await h.secondAct('activate');
    const before = await h.rows(), refused = await h.secondAct('heartbeat', {}, { receipt: false });
    assert.equal(refused.result.outcome.candidateMaterialAllowed, false);
    assert.deepEqual(refused.result.ledger.studyIntervals, before.actor.ledger.studyIntervals);
    assert.ok(refused.result.ledger.observationJournal.unresolved); assert.equal(refused.result.ledger.observationJournal.active, null);
    const evidence = structuredClone(refused.result.ledger.observationJournal.unresolved);
    await h.secondAct('resume'); await h.secondAct('begin_break');
    assert.deepEqual((await h.rows()).actor.ledger.observationJournal.unresolved, evidence);
    const recover = await h.secondAct('recover_observation', { recoveryWindowId: evidence.window.id });
    assert.equal(recover.result.outcome.candidateMaterialAllowed, false);
    assert.equal(recover.result.ledger.observationJournal.unresolved, null);
    assert.deepEqual(recover.result.audit.observation.recovery.original, evidence);
    assert.deepEqual(recover.result.ledger.studyIntervals, before.actor.ledger.studyIntervals);
    assert.ok(recover.result.ledger.uncertainExposure.intervals.length > 0);
  });

  await t.test('current original authority and complete reservation provenance are rechecked on replay', async () => {
    const h = await fixture(), opened = await h.secondAct('activate'), before = await snapshot(h);
    const old = (await h.rows()).actor.ledger, bad = structuredClone(old);
    bad.acceptances[0].actorId = randomUUID();
    await db.query('update nmls_review_actor_policy set ledger=$2 where student_id=$1', [h.actor, bad]);
    await assert.rejects(() => commit({ ...opened.args, p_transition: {} }), /rocs|receipt|scope|authority/);
    await db.query('update nmls_review_actor_policy set ledger=$2 where student_id=$1', [h.actor, old]);
    const args = { ...opened.args, p_transition: {}, p_definition: { ...h.definition, label: 'TAMPERED' } };
    await assert.rejects(() => commit(args), /definition|content/); assert.deepEqual(await snapshot(h), before);
    const oldIssued = (await h.workflow()).second_issued_at;
    // Explicit immutable-history corruption fixture, never an application path.
    await db.exec('alter table nmls_private_remediations disable trigger nmls_private_remediation_immutable');
    try {
      await db.query('update nmls_private_remediations set second_issued_at=$2 where first_final_id=$1',
        [h.finalId, new Date(Date.parse(oldIssued) + 5000).toISOString()]);
      await assert.rejects(() => commit({ ...opened.args, p_transition: {} }), /reservation_required/);
    } finally {
      await db.query('update nmls_private_remediations set second_issued_at=$2 where first_final_id=$1', [h.finalId, oldIssued]);
      await db.exec('alter table nmls_private_remediations enable trigger nmls_private_remediation_immutable');
    }
    assert.deepEqual(await snapshot(h), before);
    await db.query("update nmls_review_access_grants set status='revoked' where student_id=$1", [h.actor]);
    await assert.rejects(() => commit({ ...opened.args, p_transition: {} }), /access_denied/);
  });

  await t.test('each post-write fault rolls back sidecar, actor, receipt and lease; exact retry commits once', async () => {
    const h = await fixture();
    for (const [table, action] of [['nmls_second_final_deliveries', 'insert'], ['nmls_review_actor_policy', 'update'],
      ['nmls_second_final_delivery_events', 'insert'], ['nmls_review_study_leases', 'update']]) {
      const p = await h.secondProposal('activate'), before = await snapshot(h);
      await db.exec(`create function second_delivery_fault() returns trigger language plpgsql as $$ begin raise exception 'SECOND_DELIVERY_FAULT'; end $$;
        create trigger second_delivery_fault after ${action} on ${table} for each row execute function second_delivery_fault();`);
      try { await assert.rejects(() => commit(p.args), /SECOND_DELIVERY_FAULT/); }
      finally { await db.exec(`drop trigger second_delivery_fault on ${table}; drop function second_delivery_fault();`); }
      assert.deepEqual(await snapshot(h), before);
    }
    const p = await h.secondProposal('activate'); await commit(p.args);
    assert.equal((await commit({ ...p.args, p_transition: {} })).duplicate, true);
    assert.equal((await snapshot(h)).nmls_second_final_delivery_events.length, 1);
  });

  await t.test('post-write server freshness and original grant expiry roll back', async () => {
    for (const [seconds, expire] of [[1.1, false], [0.2, true]]) {
      const h = await fixture();
      if (expire) await db.query("update nmls_review_access_grants set expires_at=clock_timestamp()+interval '150 milliseconds' where student_id=$1", [h.actor]);
      const p = await h.secondProposal('activate'), before = await snapshot(h);
      await db.exec(`create function second_delivery_delay() returns trigger language plpgsql as $$ begin perform pg_sleep(${seconds}); return new; end $$;
        create trigger second_delivery_delay after insert on nmls_second_final_delivery_events for each row execute function second_delivery_delay();`);
      try { await assert.rejects(() => commit(p.args), /clock_refresh_required|access_denied/); }
      finally { await db.exec('drop trigger second_delivery_delay on nmls_second_final_delivery_events; drop function second_delivery_delay();'); }
      assert.deepEqual(await snapshot(h), before);
    }
  });

  await t.test('original annual cutoff rolls back tentative material and subsequent closed-year controls preserve the ledger', async () => {
    const h = await fixture({ beforeActivation: async reserved => {
      // Deadline is established BEFORE any first/child/second window exists.
      // Every subsequent historical window is clipped by its real writer.
      await db.query(`update nmls_review_policy_bindings set offering=jsonb_set(offering,'{closesAtMs}',
        to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint+4500)) where grant_id=$1`, [reserved.grant]);
    } });
    await db.query(`select pg_sleep(greatest(0,((offering->>'closesAtMs')::bigint-
      floor(extract(epoch from clock_timestamp())*1000)::bigint-500)/1000.0)) from nmls_review_policy_bindings where grant_id=$1`, [h.grant]);
    const p = await h.secondProposal('activate'), before = await snapshot(h), old = p.ledger;
    assert.equal(p.result.outcome.candidateMaterialAllowed, true);
    await db.exec(`create function second_delivery_cutoff() returns trigger language plpgsql as $$ begin perform pg_sleep(0.7); return new; end $$;
      create trigger second_delivery_cutoff after insert on nmls_second_final_delivery_events for each row execute function second_delivery_cutoff();`);
    try { await assert.rejects(() => commit(p.args), /clock_refresh_required/); }
    finally { await db.exec('drop trigger second_delivery_cutoff on nmls_second_final_delivery_events; drop function second_delivery_cutoff();'); }
    assert.deepEqual(await snapshot(h), before);
    const denied = await h.secondAct('activate');
    assert.equal(denied.result.outcome.policyCode, 'delivery_window_closed');
    assert.equal(denied.result.outcome.candidateMaterialAllowed, false); assert.equal(denied.result.runtime.sessionId, null);
    for (const key of ['studyIntervals', 'studySinceBreakMs', 'sessionStartedAtMs', 'studyBoundaryAtMs', 'uncertainExposure', 'observationJournal']) {
      assert.deepEqual(denied.result.ledger[key], old[key]);
    }
    const saved = await snapshot(h);
    assert.equal((await commit({ ...denied.args, p_transition: {} })).duplicate, true);
    assert.deepEqual(await snapshot(h), saved);
  });

  await t.test('actor wall budget crossing after writes rolls back without a new actor clock', async () => {
    const h = await fixture();
    // Adversarial owner-only budget fixture: no runtime/progress/grade seeded.
    await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{sessionStartedAtMs}',
      to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint-43200000+400)) where student_id=$1`, [h.actor]);
    const p = await h.secondProposal('activate'), before = await snapshot(h);
    assert.equal(p.result.outcome.candidateMaterialAllowed, true);
    await db.exec(`create function second_delivery_wall() returns trigger language plpgsql as $$ begin perform pg_sleep(0.6); return new; end $$;
      create trigger second_delivery_wall after insert on nmls_second_final_delivery_events for each row execute function second_delivery_wall();`);
    try { await assert.rejects(() => commit(p.args), /clock_refresh_required/); }
    finally { await db.exec('drop trigger second_delivery_wall on nmls_second_final_delivery_events; drop function second_delivery_wall();'); }
    assert.deepEqual(await snapshot(h), before);
    const denied = await h.secondAct('activate');
    assert.equal(denied.result.outcome.policyCode, 'session_wall_limit');
    assert.equal(denied.result.runtime.sessionId, null);
    assert.equal(denied.result.ledger.sessionStartedAtMs, p.ledger.sessionStartedAtMs);
  });

  await t.test('real31-second disconnected gap is held then conservatively debited, never called observed study', async () => {
    const h = await fixture(); await h.secondAct('activate'); const ack = await h.secondAct('heartbeat');
    await pause(31000);
    const refused = await h.secondAct('heartbeat');
    assert.equal(refused.result.outcome.candidateMaterialAllowed, false);
    const held = refused.result.ledger.observationJournal.unresolved;
    assert.ok(held); assert.equal(held.reason, 'horizon_expired');
    assert.deepEqual(refused.result.ledger.studyIntervals, ack.result.ledger.studyIntervals);
    const recovered = await h.secondAct('recover_observation', { recoveryWindowId: held.window.id });
    assert.equal(recovered.result.outcome.code, 'observation_recovered');
    assert.deepEqual(recovered.result.audit.observation.recovery.original, held);
    assert.deepEqual(recovered.result.ledger.studyIntervals, ack.result.ledger.studyIntervals);
    assert.equal(recovered.result.audit.observation.recovery.observedStudyAddedMs, 0);
    assert.ok(recovered.result.audit.observation.recovery.debitEndMs - recovered.result.audit.observation.recovery.debitStartMs >= 31000);
    assert.equal(recovered.result.ledger.sessionStartedAtMs, ack.result.ledger.sessionStartedAtMs);
    assert.equal(recovered.result.outcome.candidateMaterialAllowed, false);
    await h.secondAct('resume');
    assert.equal((await h.workflow()).second_id, h.secondId);
  });

  await t.test('only private service RPCs are executable; tables and internal guards deny service direct access', async () => {
    const h = await fixture(), p = await h.secondProposal('activate');
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`set role ${role}`);
      try { await assert.rejects(() => commit(p.args), /permission denied/); await assert.rejects(() => h.secondContext(), /permission denied/); }
      finally { await db.exec('reset role'); }
    }
    await db.exec('set role service_role');
    try {
      for (const table of ['nmls_second_final_deliveries', 'nmls_second_final_delivery_events']) {
        await assert.rejects(() => db.query(`select * from ${table}`), /permission denied/);
        await assert.rejects(() => db.query(`delete from ${table}`), /permission denied/);
      }
      await assert.rejects(() => rpc('nmls_second_final_delivery_runtime_guard', { p_runtime: {}, p_phase: {}, p_at: 0 }), /permission denied/);
      assert.equal((await commit(p.args)).duplicate, false);
    } finally { await db.exec('reset role'); }
  });
});
