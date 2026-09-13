import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { makeNmlsCompletedRemediationSqlFixture } from './helpers/nmls-completed-remediation-sql-fixture.mjs';
import { transactNmlsSecondFinalReservation } from '../netlify/functions/_lib/nmls-second-final-reservation.mjs';
import { transactNmlsFirstFinalHandoff } from '../netlify/functions/_lib/nmls-first-final-handoff.mjs';
import { transactNmlsFirstFinalSubmission } from '../netlify/functions/_lib/nmls-first-final-submission.mjs';
import { digestNmlsCommand } from '../netlify/functions/_lib/nmls-review-service.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';

// LOCAL actual SQL023→038, no HTTP/live service. Genuine032 source→033→035→
//036 failed first→037→032 child completion uses ONE-SECOND SYNTHETIC units.
// No successful progress, failure, child or completion is owner-seeded. Labeled
// damage/deadline faults are adversarial test fixtures, not supported writes,
// human400-minute attendance, real identity, CE credit or concurrency proofs.

function privateMetadata(response) {
  assert.equal(response.status, response.body.status);
  for (const field of ['deliveryAllowed', 'studentDeliveryEnabled', 'creditIssuanceAllowed', 'retakeEnabled']) assert.equal(response.body[field], false);
  for (const field of ['questions', 'answers', 'result', 'runtime', 'ledger', 'selection', 'definition', 'audit',
    'lessons', 'progress', 'studyWindow', 'deliveryUntilMs']) assert.equal(Object.hasOwn(response.body, field), false);
  assert.doesNotMatch(JSON.stringify(response.body), /PRIVATE SYNTHETIC|correctChoice|questionIds|optionOrder|rationale/);
}

test('private second-final reservation through actual SQL023–038 (synthetic only)', {
  skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'PGlite required; skipped SQL is not verified.',
}, async t => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite(); t.after(() => db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table students(id uuid primary key);');
  for (const name of ['023_nmls_review_runtime.sql', '024_nmls_review_discovery.sql', '025_nmls_review_session_policy.sql',
    '026_nmls_private_final_history.sql', '027_nmls_policy_exposure_guards.sql', '028_nmls_private_final_remediation.sql',
    '029_nmls_initial_exposure.sql', '030_nmls_phase_write_fences.sql', '031_nmls_teaching_exposure_guards.sql',
    '032_nmls_joint_teaching.sql', '033_nmls_final_reservation.sql', '034_nmls_final_delivery_guards.sql',
    '035_nmls_first_final_delivery.sql', '036_nmls_first_final_submission.sql', '037_nmls_first_final_handoff.sql',
    '038_nmls_second_final_reservation.sql', '039_nmls_second_final_delivery.sql', '040_nmls_second_final_submission.sql', '041_nmls_learning_snapshot.sql']) await db.exec(readFileSync(new URL(`../database/nmls-private/${name}`, import.meta.url), 'utf8'));
  const rpc = async (name, args) => {
    assert.match(name, /^nmls_[a-z_]+$/); const keys = Object.keys(args);
    assert.ok(keys.every(key => /^p_[a-z_]+$/.test(key)));
    try { return (await db.query(`select public.${name}(${keys.map((key, i) => `${key}=>$${i + 1}`).join(',')}) as result`, Object.values(args))).rows[0].result; }
    catch (error) { error.message += ` [${name}${error.where ? `: ${error.where}` : ''}]`; throw error; }
  };
  const tables = ['nmls_review_access_grants', 'nmls_review_attempts', 'nmls_review_actor_policy', 'nmls_review_study_leases',
    'nmls_review_attempt_events', 'nmls_review_actor_policy_events', 'nmls_private_finals', 'nmls_private_final_events',
    'nmls_private_remediations', 'nmls_private_remediation_events', 'nmls_teaching_phase_bindings', 'nmls_teaching_events',
    'nmls_final_reservation_events', 'nmls_first_final_deliveries', 'nmls_first_final_delivery_events',
    'nmls_first_final_submission_events', 'nmls_first_final_handoff_events', 'nmls_second_final_reservation_events'];
  async function snapshot(h) {
    const out = {};
    for (const table of tables) {
      const old = table === 'nmls_review_attempt_events';
      out[table] = (await db.query(`select * from ${table} where ${old ? 'attempt_id' : 'student_id'}=$1 order by to_jsonb(${table})::text`, [old ? h.attemptId : h.actor])).rows;
    }
    return out;
  }
  const fixture = options => makeNmlsCompletedRemediationSqlFixture({ db, rpc, ...options });
  async function command(h, extra = {}) {
    const r = await h.rows(), w = await h.workflow();
    return { kind: 'reserve_second_final', attemptId: h.attemptId, firstFinalId: h.finalId, eventId: randomUUID(),
      expectedSourceRevision: r.source.revision, expectedFinalRevision: 2, expectedWorkflowRevision: w.revision,
      expectedRevision: w.runtime.revision, expectedActorRevision: r.actor.revision, sessionId: w.runtime.sessionId, ...extra };
  }
  const run = (h, input, options = {}) => transactNmlsSecondFinalReservation(input, h.actor, { ...h.deps, ...options });
  const context = (h, eventId) => rpc('nmls_second_final_reservation_context', {
    p_student_id: h.actor, p_attempt_id: h.attemptId, p_first_final_id: h.finalId, p_event_id: eventId,
  });
  async function capture(h, input) {
    let args;
    await assert.rejects(() => run(h, input, { rpc: async (name, values) => {
      if (name === 'nmls_second_final_reservation_commit') { args = structuredClone(values); throw Error('CAPTURE_SECOND_RESERVATION_ONLY'); }
      return rpc(name, values);
    } }), /CAPTURE_SECOND_RESERVATION_ONLY/);
    assert.ok(args); return args;
  }
  const noSecond = async h => {
    const w = await h.workflow();
    for (const key of ['second_id', 'second_selection', 'second_answers', 'second_result', 'second_issued_at', 'second_submitted_at']) assert.equal(w[key], null);
    assert.equal(w.status, 'remediating');
  };
  async function delayedReceipt(seconds, work) {
    await db.exec(`create function delay_second_final_reservation() returns trigger language plpgsql as $$ begin
      perform pg_sleep(${seconds}); return new; end $$;
      create trigger delay_second_final_reservation after insert on nmls_second_final_reservation_events
        for each row execute function delay_second_final_reservation();`);
    try { await work(); }
    finally { await db.exec('drop trigger delay_second_final_reservation on nmls_second_final_reservation_events; drop function delay_second_final_reservation();'); }
  }

  await t.test('genuine completed child reserves exactly25 disjoint questions once, metadata-only and without activation/exposure', async () => {
    const h = await fixture(), before = await h.rows(), w0 = await h.workflow(), input = await command(h), beforeHistory = await snapshot(h);
    await db.exec('set role service_role'); let response;
    try { response = await run(h, input); } finally { await db.exec('reset role'); }
    privateMetadata(response); assert.equal(response.body.reserved, true); assert.equal(response.body.duplicate, false);
    assert.equal(response.body.code, 'private_second_final_reserved');
    const after = await h.rows(), w = await h.workflow();
    assert.deepEqual(after.source, before.source); assert.deepEqual(after.reservedFinal, before.reservedFinal);
    assert.deepEqual(after.delivery, before.delivery); assert.deepEqual(after.lease, before.lease);
    assert.equal(after.actor.revision, before.actor.revision + 1); assert.equal(w.revision, w0.revision + 2);
    assert.equal(w.runtime.revision, w0.runtime.revision + 1); assert.equal(w.status, 'second_issued');
    assert.equal(w.second_id, response.body.secondFinalId); assert.ok(w.second_issued_at);
    assert.equal(w.second_selection.id, w.second_id); assert.equal(w.second_selection.number, 2);
    assert.equal(w.second_selection.reviewAttemptId, h.attemptId); assert.equal(w.second_selection.definitionDigest, h.definition.digest);
    assert.equal(w.second_selection.questionIds.length, 25); assert.equal(new Set(w.second_selection.questionIds).size, 25);
    assert.ok(w.second_selection.questionIds.every(id => !before.reservedFinal.selection.questionIds.includes(id)));
    assert.ok(w.second_selection.questionIds.every(id => h.definition.items.some(item => item.id === id)));
    assert.deepEqual(Object.keys(w.second_selection.optionOrder).sort(), [...w.second_selection.questionIds].sort());
    for (const ids of Object.values(w.second_selection.optionOrder)) assert.deepEqual([...ids].sort(), ['A', 'B', 'C', 'D']);
    for (const key of ['second_answers', 'second_result', 'second_submitted_at']) assert.equal(w[key], null);
    for (const key of ['completedUnitIds', 'passedModuleIds', 'completedReviewMs', 'lastActivityMs', 'sessionId']) assert.deepEqual(w.runtime[key], w0.runtime[key]);
    for (const key of ['studyIntervals', 'studySinceBreakMs', 'sessionStartedAtMs', 'studyBoundaryAtMs', 'lastStudyAtMs',
      'uncertainExposure', 'acceptances']) assert.deepEqual(after.actor.ledger[key], before.actor.ledger[key]);
    assert.equal(after.actor.ledger.observationJournal.active, null); assert.equal(after.actor.ledger.observationJournal.unresolved, null);
    const afterHistory = await snapshot(h), events = afterHistory.nmls_second_final_reservation_events;
    assert.equal(events.length, 1); assert.equal(events[0].command_digest, digestNmlsCommand(input));
    assert.equal(events[0].second_id, w.second_id);
    const paired = afterHistory.nmls_teaching_events.find(event => event.event_id === input.eventId);
    assert.ok(paired); assert.equal(paired.transaction_id, events[0].transaction_id);
    assert.equal(paired.actor_revision, after.actor.revision); assert.equal(paired.runtime_revision, w.runtime.revision);
    assert.equal(paired.workflow_revision, w0.revision + 1); assert.equal(paired.audit.review.kind, 'check_access');
    assert.equal(paired.outcome.deliveryAllowed, false); assert.deepEqual(paired.outcome.progress.lessons, []);
    assert.deepEqual(afterHistory.nmls_private_final_events, beforeHistory.nmls_private_final_events);
    assert.deepEqual(afterHistory.nmls_private_remediation_events, beforeHistory.nmls_private_remediation_events);
    const replay = await run(h, input, { evaluate: () => { throw Error('MUST_NOT_DRAW_REPLAY'); } });
    privateMetadata(replay); assert.deepEqual(replay.body, { ...response.body, duplicate: true });
    assert.deepEqual(await snapshot(h), afterHistory);
    const oldHandoff = await transactNmlsFirstFinalHandoff(h.handoffCommand, h.actor, { ...h.deps, evaluate: () => { throw Error('MUST_NOT_RESTART_CHILD'); } });
    assert.equal(oldHandoff.body.duplicate, true);
    const oldSubmission = await transactNmlsFirstFinalSubmission(h.submissionCommand, h.actor, { ...h.deps, evaluate: () => { throw Error('MUST_NOT_REGRADE_FIRST'); } });
    assert.equal(oldSubmission.body.duplicate, true); assert.deepEqual(await snapshot(h), afterHistory);
    await assert.rejects(() => run(h, { ...input, eventId: randomUUID() }), /already|revision|issued|reservation/);
    assert.deepEqual(await snapshot(h), afterHistory);
  });

  await t.test('a mere child handoff is not completed remediation and cannot draw a form', async () => {
    const h = await fixture({ through: 'active' }), input = await command(h), before = await snapshot(h);
    await assert.rejects(() => run(h, input), /complet|prerequisite|reservation/);
    assert.deepEqual(await snapshot(h), before); await noSecond(h);
    await h.completeChild();
    assert.equal((await run(h, await command(h))).body.reserved, true);
  });

  await t.test('all CAS/session/actor selectors and cross-namespace event reuse refuse without mutation', async () => {
    const h = await fixture(), input = await command(h), before = await snapshot(h);
    for (const patch of [{ expectedSourceRevision: input.expectedSourceRevision - 1 }, { expectedFinalRevision: 1 },
      { expectedWorkflowRevision: input.expectedWorkflowRevision - 1 }, { expectedRevision: input.expectedRevision - 1 },
      { expectedActorRevision: input.expectedActorRevision - 1 }, { sessionId: randomUUID() }]) {
      await assert.rejects(() => run(h, { ...input, eventId: randomUUID(), ...patch }, { evaluate: () => { throw Error('MUST_NOT_DRAW_STALE'); } }), /revision|session|invalid_command|invalid_request/);
      assert.deepEqual(await snapshot(h), before);
    }
    const other = randomUUID(); await db.query('insert into students values($1)', [other]);
    await assert.rejects(() => transactNmlsSecondFinalReservation(input, other, h.deps), /access_denied|scope|not_found/);
    for (const eventId of [h.priorSourceCommand.eventId, h.reservationCommand.eventId, h.activationCommand.eventId,
      h.submissionCommand.eventId, h.handoffCommand.eventId, h.completionCommand.eventId]) {
      await assert.rejects(() => run(h, { ...input, eventId }), /idempotency_conflict/);
      assert.deepEqual(await snapshot(h), before);
    }
    const args = await capture(h, input); await run(h, input); const issued = await snapshot(h);
    await assert.rejects(() => h.teach(args.p_transition.command), /idempotency_conflict|not_remediating|phase/);
    await assert.rejects(() => run(h, { ...input, sessionId: randomUUID() }), /idempotency_conflict/);
    assert.deepEqual(await snapshot(h), issued);
  });

  await t.test('real break and numerical break/rolling/wall limits persist canonical refusal with no second form', async () => {
    for (const limit of ['break', 'mandatory_break', 'rolling_limit', 'wall']) {
      const h = await fixture();
      if (limit === 'break') await h.childAct('begin_break');
      // The remaining limits are explicitly owner-loaded numerical boundaries,
      // not fabricated human attendance or an alternate production writer.
      if (limit === 'mandatory_break') await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{studySinceBreakMs}',to_jsonb($2::bigint)) where student_id=$1`, [h.actor, P.breakAfterStudyMs]);
      if (limit === 'rolling_limit') await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{studyIntervals}',
        public.nmls_policy_interval_union(ledger->'studyIntervals',jsonb_build_array(jsonb_build_object(
        'start',floor(extract(epoch from clock_timestamp())*1000)::bigint-$2::bigint-2000,
        'end',floor(extract(epoch from clock_timestamp())*1000)::bigint-1000)))) where student_id=$1`, [h.actor, P.rollingStudyLimitMs]);
      if (limit === 'wall') await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{sessionStartedAtMs}',
        to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint-43200000)) where student_id=$1`, [h.actor]);
      const input = await command(h), before = await h.rows(), w0 = await h.workflow(), response = await run(h, input);
      privateMetadata(response); assert.equal(response.body.reserved, false); assert.equal(response.body.secondFinalId, null);
      assert.equal(response.body.code, 'private_second_final_reservation_refused'); await noSecond(h);
      assert.equal(response.body.policyCode, { break: 'break_in_progress', mandatory_break: 'mandatory_break_required', rolling_limit: 'rolling_study_limit', wall: 'session_wall_limit' }[limit]);
      const after = await h.rows(), w = await h.workflow();
      assert.equal(after.actor.revision, before.actor.revision + 1); assert.equal(w.revision, w0.revision + 1);
      assert.equal(w.runtime.revision, w0.runtime.revision + 1); assert.deepEqual(after.lease, before.lease);
      assert.deepEqual(after.source, before.source); assert.deepEqual(after.reservedFinal, before.reservedFinal);
      const saved = await snapshot(h), replay = await run(h, input, { evaluate: () => { throw Error('MUST_NOT_DRAW_DENIAL_REPLAY'); } });
      privateMetadata(replay); assert.equal(replay.body.duplicate, true); assert.equal(replay.body.reserved, false);
      assert.deepEqual(await snapshot(h), saved);
    }
  });

  await t.test('original grant/ROCS evidence applies before fresh writes and replay, with no adoption of replacement grants', async () => {
    for (const issued of [false, true]) {
      const h = await fixture(), input = await command(h); if (issued) await run(h, input);
      const original = (await h.rows()).actor.ledger;
      for (const field of ['actorId', 'presentationId']) {
        const damaged = structuredClone(original); damaged.acceptances[0][field] = randomUUID();
        await db.query('update nmls_review_actor_policy set ledger=$2 where student_id=$1', [h.actor, damaged]);
        try { const before = await snapshot(h); await assert.rejects(() => run(h, input), /invalid_rocs_receipt/); assert.deepEqual(await snapshot(h), before); }
        finally { await db.query('update nmls_review_actor_policy set ledger=$2 where student_id=$1', [h.actor, original]); }
      }
      await db.query("update nmls_review_access_grants set status='revoked' where id=$1", [h.grant]);
      await db.query(`insert into nmls_review_access_grants(id,student_id,course_key,content_digest,expires_at,granted_by,evidence)
        values($1,$2,$3,$4,clock_timestamp()+interval '1 day',$2,'SYNTHETIC replacement is not original authority')`, [randomUUID(), h.actor, h.course.id, h.course.digest]);
      const before = await snapshot(h); await assert.rejects(() => run(h, input), /access_denied/); assert.deepEqual(await snapshot(h), before);
    }
  });

  await t.test('a saved numerical denial remains denied after a later distinct successful reservation', async () => {
    const h = await fixture(), originalCounter = (await h.rows()).actor.ledger.studySinceBreakMs;
    // Owner-only high-counter fault and repair to the original retained value;
    // no real observed/uncertain interval, time or break evidence is erased.
    await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{studySinceBreakMs}',to_jsonb($2::bigint)) where student_id=$1`, [h.actor, P.breakAfterStudyMs]);
    const deniedInput = await command(h), denied = await run(h, deniedInput); assert.equal(denied.body.reserved, false);
    await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{studySinceBreakMs}',to_jsonb($2::bigint)) where student_id=$1`, [h.actor, originalCounter]);
    assert.equal((await run(h, await command(h))).body.reserved, true);
    const before = await snapshot(h), replay = await run(h, deniedInput, { evaluate: () => { throw Error('MUST_NOT_DRAW_OLD_DENIAL'); } });
    privateMetadata(replay); assert.deepEqual(replay.body, { ...denied.body, duplicate: true });
    assert.deepEqual(await snapshot(h), before);
  });

  await t.test('missing037 or terminal032 provenance and impossible historical windows cannot authorize a second form', async () => {
    for (const fault of ['handoff', 'terminal', 'oversized_terminal_window']) {
      const h = await fixture(), input = await command(h), args = await capture(h, input);
      // Owner-only deletion of immutable provenance leaves genuine completed
      // rows but cannot manufacture authority for an otherwise legacy child.
      const table = fault === 'handoff' ? 'nmls_first_final_handoff_events' : 'nmls_teaching_events';
      const trigger = fault === 'handoff' ? 'nmls_first_final_handoff_event_immutable' : 'nmls_teaching_event_immutable';
      const eventId = fault === 'handoff' ? h.handoffCommand.eventId : h.completionCommand.eventId;
      await db.exec(`alter table ${table} disable trigger ${trigger}`);
      try {
        if (fault === 'oversized_terminal_window') {
          // Preserve all other genuine evidence and coherently alter both
          // window halves. The90-second span is impossible under the actual
          //30-second observer; a valid terminal result cannot excuse it.
          const audit = structuredClone((await h.completionEvent()).audit);
          audit.observation.windowBefore.horizonMs += 60000;
          audit.observation.closedWindow.horizonMs = audit.observation.windowBefore.horizonMs;
          await db.query(`update ${table} set audit=$3 where student_id=$1 and event_id=$2`, [h.actor, eventId, audit]);
        } else await db.query(`delete from ${table} where student_id=$1 and event_id=$2`, [h.actor, eventId]);
      }
      finally { await db.exec(`alter table ${table} enable trigger ${trigger}`); }
      const before = await snapshot(h);
      await assert.rejects(() => rpc('nmls_second_final_reservation_commit', args), /nmls_/);
      assert.deepEqual(await snapshot(h), before); await noSecond(h);
      await assert.rejects(() => run(h, input), /origin|history|terminal|complet|handoff|child_event/);
      assert.deepEqual(await snapshot(h), before);
    }
  });

  await t.test('NULL authority, forged progress/audit and non-disjoint/malformed selections are rejected independently by038', async () => {
    const h = await fixture(), input = await command(h), before = await snapshot(h);
    const corruptions = [
      args => { args.p_expected_source_revision = null; }, args => { args.p_expected_final_revision = null; },
      args => { args.p_expected_workflow_revision = null; }, args => { args.p_expected_runtime_revision = null; },
      args => { args.p_expected_actor_revision = null; }, args => { args.p_expected_session_id = null; },
      args => { args.p_evaluated_at_ms = null; }, args => { args.p_command_digest = null; },
      args => { args.p_definition_digest = null; }, args => { args.p_definition = null; },
      args => { args.p_definition.items[0].correctChoice = 'D'; },
      args => { args.p_second_id = input.firstFinalId; }, args => { args.p_second_id = null; },
      args => { args.p_selection.questionIds[0] = h.reserved.body.finalAttemptId; },
      args => { args.p_selection.questionIds.pop(); },
      args => { args.p_selection.questionIds[0] = args.p_selection.questionIds[1]; },
      args => { args.p_selection.number = 1; }, args => { args.p_selection.id = randomUUID(); },
      args => { args.p_selection.optionOrder[args.p_selection.questionIds[0]] = ['A', 'A', 'B', 'C']; },
      args => { args.p_transition.runtime.completedReviewMs += 1; },
      args => { args.p_transition.runtime.lastActivityMs = args.p_evaluated_at_ms; },
      args => { args.p_transition.ledger.studySinceBreakMs = 0; },
      args => { args.p_transition.outcome.progress.lessons = [{ id: 'F01-U01' }]; },
      args => { args.p_transition.audit.policy.actorId = randomUUID(); },
      args => { args.p_transition.audit.review.atMs -= 1; },
    ];
    const first = (await h.rows()).reservedFinal.selection;
    corruptions.push(args => {
      // Coherent bank member and option map, but illegally reused from first.
      const old = args.p_selection.questionIds[0], reused = first.questionIds[0];
      args.p_selection.questionIds[0] = reused; delete args.p_selection.optionOrder[old];
      args.p_selection.optionOrder[reused] = [...first.optionOrder[reused]];
    });
    for (const corrupt of corruptions) {
      const args = await capture(h, input); corrupt(args);
      await assert.rejects(() => rpc('nmls_second_final_reservation_commit', args), /nmls_/, String(corrupt));
      assert.deepEqual(await snapshot(h), before); await noSecond(h);
    }
    assert.equal((await run(h, input)).body.reserved, true);
  });

  await t.test('failure after child update,038 receipt,032 receipt or lease update rolls the entire reservation back', async () => {
    for (const [table, when, condition = ''] of [['nmls_private_remediations', 'after update'],
      ['nmls_private_remediations', 'after update', "when (new.status='second_issued')"], ['nmls_second_final_reservation_events', 'after insert'],
      ['nmls_teaching_events', 'after insert'], ['nmls_review_study_leases', 'after update']]) {
      const h = await fixture(), input = await command(h), before = await snapshot(h);
      await db.exec(`create function fail_second_final_reservation() returns trigger language plpgsql as $$ begin raise exception 'SYNTHETIC_SECOND_WRITE_FAILURE'; end $$;
        create trigger fail_second_final_reservation ${when} on ${table} for each row ${condition} execute function fail_second_final_reservation();`);
      try { await assert.rejects(() => run(h, input), /SYNTHETIC_SECOND_WRITE_FAILURE/); assert.deepEqual(await snapshot(h), before); await noSecond(h); }
      finally { await db.exec(`drop trigger fail_second_final_reservation on ${table}; drop function fail_second_final_reservation();`); }
      assert.equal((await run(h, input)).body.reserved, true);
      assert.equal((await snapshot(h)).nmls_second_final_reservation_events.length, 1);
    }
  });

  await t.test('post-write grant/wall/freshness boundaries roll back and retry without resetting progress or emitting a tentative form', async () => {
    for (const boundary of ['grant', 'wall', 'freshness']) {
      const h = await fixture();
      // Owner-only deadlines crossed inside real SQL; not parallel scheduling.
      if (boundary === 'grant') await db.query("update nmls_review_access_grants set expires_at=clock_timestamp()+interval '600 milliseconds' where id=$1", [h.grant]);
      if (boundary === 'wall') await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{sessionStartedAtMs}',
        to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint-43200000+600)) where student_id=$1`, [h.actor]);
      const input = await command(h), before = await snapshot(h);
      await delayedReceipt(boundary === 'freshness' ? 1.1 : 0.7, async () => {
        await assert.rejects(() => run(h, input, { clockRetries: 0 }), /clock_refresh_required|access_denied/);
        assert.deepEqual(await snapshot(h), before); await noSecond(h);
      });
      if (boundary === 'grant') await assert.rejects(() => run(h, input), /access_denied/);
      else {
        const retried = await run(h, input); privateMetadata(retried);
        assert.equal(retried.body.reserved, boundary === 'freshness');
        if (boundary === 'wall') { assert.equal(retried.body.policyCode, 'session_wall_limit'); await noSecond(h); }
      }
    }
  });

  await t.test('roles cannot read private forms/receipts or bypass the internal writers', async () => {
    const h = await fixture(); await run(h, await command(h));
    for (const role of ['anon', 'authenticated', 'service_role']) {
      await db.exec(`set role ${role}`);
      try {
        for (const table of ['nmls_second_final_reservation_events', 'nmls_private_remediations']) {
          await assert.rejects(() => db.query(`select * from ${table}`), /permission denied/);
          await assert.rejects(() => db.query(`delete from ${table}`), /permission denied/);
        }
      } finally { await db.exec('reset role'); }
      const functions = (await db.query(`select p.oid::regprocedure::text as signature,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        where n.nspname='public' and (p.proname like 'nmls_second_final_reservation_%' or p.proname like '%pre_second_reservation_internal')`)).rows;
      assert.ok(functions.some(fn => fn.proname === 'nmls_second_final_reservation_commit'));
      for (const fn of functions) assert.equal((await db.query("select has_function_privilege($1,$2,'execute') as allowed", [role, fn.signature])).rows[0].allowed,
        role === 'service_role' && ['nmls_second_final_reservation_context', 'nmls_second_final_reservation_commit'].includes(fn.proname), fn.signature);
    }
    const before = await snapshot(h);
    await assert.rejects(() => db.query('delete from nmls_second_final_reservation_events where student_id=$1', [h.actor]), /immutable/);
    assert.deepEqual(await snapshot(h), before);
  });

  await t.test('original annual cutoff crossed after tentative reservation leaves no second form and retries as a closed-window refusal', async () => {
    const h = await fixture({ beforeActivation: async reserved => {
      // Synthetic offering cutoff is set BEFORE final activation. Genuine035,
      //036,037 and child032 all record their own correctly clipped histories.
      await db.query(`update nmls_review_policy_bindings set offering=jsonb_set(offering,'{closesAtMs}',
        to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint+3500)) where grant_id=$1`, [reserved.grant]);
    } });
    // Wait while the completed child has no material or exposure window. This
    // SQL clock delay is not browser time and awards no instructional time.
    await db.query(`select pg_sleep(greatest(0,((offering->>'closesAtMs')::bigint-
      floor(extract(epoch from clock_timestamp())*1000)::bigint-500)/1000.0)) from nmls_review_policy_bindings where grant_id=$1`, [h.grant]);
    const input = await command(h), before = await snapshot(h);
    await delayedReceipt(0.7, async () => {
      await assert.rejects(() => run(h, input, { clockRetries: 0 }), /clock_refresh_required/);
      assert.deepEqual(await snapshot(h), before); await noSecond(h);
    });
    const denied = await run(h, input); privateMetadata(denied); assert.equal(denied.body.reserved, false);
    assert.equal(denied.body.policyCode, 'delivery_window_closed'); await noSecond(h);
    const checkpoint = await snapshot(h), replay = await run(h, input);
    privateMetadata(replay); assert.equal(replay.body.duplicate, true); assert.equal(replay.body.reserved, false);
    assert.deepEqual(await snapshot(h), checkpoint);
  });
});
