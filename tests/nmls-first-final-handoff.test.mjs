import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { setTimeout as pause } from 'node:timers/promises';
import { makeNmlsFirstFinalSubmissionSqlFixture } from './helpers/nmls-first-final-submission-sql-fixture.mjs';
import { transactNmlsFirstFinalHandoff } from '../netlify/functions/_lib/nmls-first-final-handoff.mjs';
import { transactNmlsFirstFinalSubmission } from '../netlify/functions/_lib/nmls-first-final-submission.mjs';
import { makeNmlsFinalRemediationCourse } from '../lib/nmls-final-assessment.mjs';
import { digestNmlsCommand } from '../netlify/functions/_lib/nmls-review-service.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';

// LOCAL DISPOSABLE SQL023→037 ONLY. The real adapters traverse the explicitly
// SYNTHETIC one-unit/ONE-SECOND source and17/25 first-final submission. No
// completed source, grade, child or handoff is seeded. Owner-only damage and
// deadline faults below are labeled; they are neither supported writers nor
// human attendance, CE completion, learner release or real concurrency proof.

function noMaterial(response) {
  assert.equal(response.status, response.body.status);
  for (const flag of ['studentDeliveryEnabled', 'creditIssuanceAllowed', 'deliveryAllowed', 'retakeEnabled']) {
    assert.equal(response.body[flag], false);
  }
  for (const key of ['questions', 'answers', 'runtime', 'ledger', 'audit', 'selection', 'definition',
    'childRuntime', 'progress', 'lessons', 'quiz', 'feedback', 'studyWindow']) {
    assert.equal(Object.hasOwn(response.body, key), false);
  }
  assert.doesNotMatch(JSON.stringify(response.body), /PRIVATE SYNTHETIC|correctChoice|questionIds|optionOrder|rationale/);
}

test('private first-final handoff through actual SQL023–037 (synthetic only)', {
  skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'PGlite required; skipped SQL is not verified.',
}, async t => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite(); t.after(() => db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table students(id uuid primary key);');
  for (const name of ['023_nmls_review_runtime.sql', '024_nmls_review_discovery.sql', '025_nmls_review_session_policy.sql',
    '026_nmls_private_final_history.sql', '027_nmls_policy_exposure_guards.sql', '028_nmls_private_final_remediation.sql',
    '029_nmls_initial_exposure.sql', '030_nmls_phase_write_fences.sql', '031_nmls_teaching_exposure_guards.sql',
    '032_nmls_joint_teaching.sql', '033_nmls_final_reservation.sql', '034_nmls_final_delivery_guards.sql',
    '035_nmls_first_final_delivery.sql', '036_nmls_first_final_submission.sql', '037_nmls_first_final_handoff.sql', '038_nmls_second_final_reservation.sql', '039_nmls_second_final_delivery.sql', '040_nmls_second_final_submission.sql', '041_nmls_learning_snapshot.sql']) {
    await db.exec(readFileSync(new URL(`../database/nmls-private/${name}`, import.meta.url), 'utf8'));
  }
  const rpc = async (name, args) => {
    assert.match(name, /^nmls_[a-z_]+$/);
    const keys = Object.keys(args); assert.ok(keys.every(key => /^p_[a-z_]+$/.test(key)));
    try {
      return (await db.query(`select public.${name}(${keys.map((key, i) => `${key}=>$${i + 1}`).join(',')}) as result`, Object.values(args))).rows[0].result;
    } catch (error) { error.message += ` [${name}${error.where ? `: ${error.where}` : ''}]`; throw error; }
  };
  const tables = ['nmls_review_access_grants', 'nmls_review_attempts', 'nmls_review_actor_policy', 'nmls_review_study_leases',
    'nmls_review_attempt_events', 'nmls_review_actor_policy_events', 'nmls_private_finals', 'nmls_private_final_events',
    'nmls_private_remediations', 'nmls_private_remediation_events', 'nmls_teaching_phase_bindings', 'nmls_teaching_events',
    'nmls_final_reservation_events', 'nmls_first_final_deliveries', 'nmls_first_final_delivery_events',
    'nmls_first_final_submission_events', 'nmls_first_final_handoff_events'];
  async function snapshot(h) {
    const out = {};
    for (const table of tables) {
      const where = table === 'nmls_review_attempt_events' ? 'attempt_id=$1' : 'student_id=$1';
      out[table] = (await db.query(`select * from ${table} where ${where} order by to_jsonb(${table})::text`,
        [table === 'nmls_review_attempt_events' ? h.attemptId : h.actor])).rows;
    }
    return out;
  }
  const fixture = options => makeNmlsFirstFinalSubmissionSqlFixture({ db, rpc, ...options });
  async function command(h, extra = {}) {
    const r = await h.rows(), w = await h.workflow();
    return { kind: 'start_first_remediation', attemptId: h.attemptId, finalAttemptId: h.finalId,
      eventId: randomUUID(), expectedSourceRevision: r.source.revision, expectedFinalRevision: 2,
      expectedDeliveryRevision: r.delivery.revision, expectedWorkflowRevision: w?.revision ?? 1,
      expectedRevision: w?.runtime.revision ?? 0, expectedActorRevision: r.actor.revision,
      sessionId: r.delivery.runtime.sessionId, ...extra };
  }
  const run = (h, input, options = {}) => transactNmlsFirstFinalHandoff(input, h.actor, { ...h.deps, ...options });
  const context = (h, eventId) => rpc('nmls_first_final_handoff_context', {
    p_student_id: h.actor, p_attempt_id: h.attemptId, p_final_id: h.finalId, p_event_id: eventId,
  });
  async function capture(h, input) {
    let args;
    await assert.rejects(() => run(h, input, { rpc: async (name, values) => {
      if (name === 'nmls_first_final_handoff_commit') { args = structuredClone(values); throw Error('CAPTURE_HANDOFF_ONLY'); }
      return rpc(name, values);
    } }), /CAPTURE_HANDOFF_ONLY/);
    assert.ok(args); return args;
  }
  const childContext = h => rpc('nmls_teaching_context', { p_student_id: h.actor, p_attempt_id: h.attemptId,
    p_phase_kind: 'remediation', p_phase_owner_id: h.finalId });
  async function childCommand(h, kind, extra = {}) {
    const c = await childContext(h), r = c.workflow.runtime;
    return { kind, attemptId: h.attemptId, phaseKind: 'remediation', phaseOwnerId: h.finalId, eventId: randomUUID(),
      expectedSourceRevision: c.attempt.revision, expectedWorkflowRevision: c.workflow.revision,
      expectedRevision: r.revision, expectedActorRevision: c.actorPolicy.revision, sessionId: r.sessionId,
      ...(c.actorPolicy.ledger.observationJournal.active ? { studyReceipt: {
        windowId: c.actorPolicy.ledger.observationJournal.active.id, visible: true } } : {}),
      ...(kind === 'interaction' ? { observation: 'keyboard' } : {}), ...extra };
  }
  const childAct = async (h, kind, extra = {}, options = {}) => h.teach(await childCommand(h, kind, extra), options);
  async function delayedReceipt(seconds, work) {
    await db.exec(`create function delay_first_final_handoff() returns trigger language plpgsql as $$ begin
      perform pg_sleep(${seconds}); return new; end $$;
      create trigger delay_first_final_handoff after insert on nmls_first_final_handoff_events
        for each row execute function delay_first_final_handoff();`);
    try { await work(); }
    finally { await db.exec('drop trigger delay_first_final_handoff on nmls_first_final_handoff_events; drop function delay_first_final_handoff();'); }
  }

  await t.test('exact failed036 seal hands off once through real032 with no material or invented study; child can traverse its real lesson and quiz', async () => {
    const h = await fixture(), before = await h.rows(), beforeWorkflow = await h.workflow(), input = await command(h);
    const sourceEvents = (await snapshot(h)).nmls_teaching_events;
    await db.exec('set role service_role'); let response;
    try { response = await run(h, input); } finally { await db.exec('reset role'); }
    noMaterial(response); assert.equal(response.body.handedOff, true); assert.equal(response.body.duplicate, false);
    assert.equal(response.body.code, 'private_first_remediation_handed_off');
    assert.equal(response.body.teachingCode, 'review_session_started');
    const after = await h.rows(), w = await h.workflow(), c = await context(h, input.eventId);
    assert.deepEqual(after.source, before.source); assert.deepEqual(after.reservedFinal, before.reservedFinal);
    assert.deepEqual(after.delivery, before.delivery, 'sealed final sidecar is immutable during child handoff');
    assert.equal(after.actor.revision, before.actor.revision + 1); assert.equal(w.revision, 2);
    assert.equal(w.runtime.revision, 1); assert.equal(w.runtime.status, 'active');
    assert.notEqual(w.runtime.sessionId, before.delivery.runtime.sessionId);
    assert.equal(response.body.sessionId, w.runtime.sessionId);
    assert.equal(w.runtime.current, null); assert.equal(w.runtime.quiz, null);
    assert.deepEqual(w.runtime.completedUnitIds, []); assert.deepEqual(w.runtime.passedModuleIds, []);
    assert.equal(w.runtime.completedReviewMs, 0); assert.deepEqual(w.manifest, beforeWorkflow.manifest);
    for (const key of ['studyIntervals', 'studySinceBreakMs', 'sessionStartedAtMs', 'sessionOpen', 'studyBoundaryAtMs',
      'lastStudyAtMs', 'uncertainExposure', 'breakStartedAtMs', 'acceptances']) {
      assert.deepEqual(after.actor.ledger[key], before.actor.ledger[key], `handoff does not rewrite ${key}`);
    }
    assert.equal(after.actor.ledger.observationJournal.active, null);
    assert.equal(after.actor.ledger.observationJournal.unresolved, null);
    assert.equal(after.lease.phase_kind, 'remediation'); assert.equal(after.lease.phase_owner_id, h.finalId);
    assert.equal(after.lease.session_id, w.runtime.sessionId); assert.equal(after.lease.phase_active, true);
    assert.ok(c.handoffEvent); assert.ok(c.handoffTeachingEvent);
    assert.equal(c.handoffEvent.event_id, input.eventId); assert.equal(c.handoffEvent.genesis_event_id, h.submissionCommand.eventId);
    assert.equal(c.handoffEvent.command_digest, digestNmlsCommand(input));
    for (const key of ['student_id', 'event_id', 'review_attempt_id', 'source_revision', 'workflow_revision',
      'runtime_revision', 'actor_revision', 'transaction_id']) assert.equal(c.handoffEvent[key], c.handoffTeachingEvent[key], key);
    assert.equal(c.handoffTeachingEvent.phase_kind, 'remediation'); assert.equal(c.handoffTeachingEvent.phase_owner_id, h.finalId);
    assert.equal(c.handoffTeachingEvent.outcome.code, 'review_session_started');
    assert.deepEqual(c.handoffTeachingEvent.outcome.progress.lessons, []);
    assert.equal(c.handoffTeachingEvent.outcome.progress.quiz, null);
    const { duplicate, ...outcome } = response.body; assert.deepEqual(c.handoffEvent.outcome, outcome);
    const allEvents = (await snapshot(h)).nmls_teaching_events;
    assert.equal(allEvents.length, sourceEvents.length + 1);
    assert.deepEqual(allEvents.filter(event => event.phase_kind === 'source'), sourceEvents);

    const childCourse = makeNmlsFinalRemediationCourse(h.definition, h.course, after.reservedFinal.selection, h.submissionCommand.answers);
    const unit = childCourse.modules[0].units[0];
    const opened = await childAct(h, 'open_unit', { unitId: unit.id });
    assert.equal(opened.body.deliveryAllowed, true); assert.equal(opened.body.progress.lessons.length, 1);
    assert.equal(opened.body.progress.lessons[0].content, unit.content);
    await childAct(h, 'interaction', { visible: true });
    await pause(1100);
    await childAct(h, 'heartbeat', { visible: true });
    await childAct(h, 'unit_action', { choice: unit.actionQuestion.correctChoice });
    assert.equal((await childAct(h, 'complete_unit')).body.code, 'unit_review_complete');
    await childAct(h, 'quiz_start', { moduleId: childCourse.modules[0].id });
    await childAct(h, 'interaction', { visible: true });
    const quiz = (await childContext(h)).workflow.runtime.quiz;
    const answers = Object.fromEntries(quiz.questionIds.map(id => [id, childCourse.modules[0].quiz.bank.find(q => q.id === id).correctChoice]));
    const completed = await childAct(h, 'quiz_submit', { quizId: quiz.id, answers });
    assert.equal(completed.body.code, 'module_review_passed'); assert.equal(completed.body.deliveryAllowed, false);
    assert.equal(completed.body.progress.status, 'review_complete'); assert.equal(completed.body.progress.creditIssuanceAllowed, false);
    assert.deepEqual(completed.body.progress.lessons, []); assert.equal(completed.body.progress.quiz, null);
    const terminal = await h.rows(), terminalWorkflow = await h.workflow();
    assert.deepEqual(terminal.source, before.source); assert.deepEqual(terminal.reservedFinal, before.reservedFinal);
    assert.deepEqual(terminal.delivery, before.delivery); assert.equal(terminalWorkflow.runtime.completedReviewMs, 1000);
    for (const key of ['second_id', 'second_selection', 'second_answers', 'second_result', 'second_issued_at', 'second_submitted_at']) {
      assert.equal(terminalWorkflow[key], null);
    }
    assert.equal(terminalWorkflow.manifest.retakeEnabled, false);
    const sealedSnapshot = await snapshot(h);
    const replay = await run(h, input, { evaluate: () => { throw Error('MUST_NOT_EVALUATE_HANDOFF_REPLAY'); } });
    noMaterial(replay); assert.equal(replay.body.duplicate, true);
    assert.deepEqual(replay.body, { ...response.body, duplicate: true });
    assert.deepEqual(await snapshot(h), sealedSnapshot, 'historical child-start replay cannot rewind completed work or lease');
    const submissionReplay = await transactNmlsFirstFinalSubmission(h.submissionCommand, h.actor, {
      ...h.deps, evaluate: () => { throw Error('MUST_NOT_EVALUATE_SUBMISSION_REPLAY'); },
    });
    assert.equal(submissionReplay.body.duplicate, true); assert.equal(submissionReplay.body.result.correct, 17);
    assert.deepEqual(await snapshot(h), sealedSnapshot);
  });

  await t.test('all source/final/delivery/workflow/runtime/actor/session pins and foreign actor fail without writes', async () => {
    const h = await fixture(), input = await command(h), before = await snapshot(h);
    for (const patch of [{ expectedSourceRevision: input.expectedSourceRevision - 1 }, { expectedFinalRevision: 1 },
      { expectedDeliveryRevision: input.expectedDeliveryRevision - 1 }, { expectedWorkflowRevision: 2 },
      { expectedRevision: 1 }, { expectedActorRevision: input.expectedActorRevision - 1 }, { sessionId: randomUUID() }]) {
      await assert.rejects(() => run(h, { ...input, eventId: randomUUID(), ...patch }, {
        evaluate: () => { throw Error('MUST_NOT_EVALUATE_CONFLICT'); },
      }), /revision|session|invalid_request|invalid_command/);
      assert.deepEqual(await snapshot(h), before);
    }
    const foreign = randomUUID(); await db.query('insert into students values($1)', [foreign]);
    await assert.rejects(() => transactNmlsFirstFinalHandoff(input, foreign, h.deps), /access_denied|scope|not_found/);
    assert.deepEqual(await snapshot(h), before);
  });

  await t.test('an18/25 passed seal has no child-handoff authority', async () => {
    const h = await fixture({ correctCount: 18 }), input = await command(h), before = await snapshot(h);
    await assert.rejects(() => run(h, input), /handoff|remediation|child|not_found/);
    assert.deepEqual(await snapshot(h), before); assert.equal(await h.workflow(), undefined);
  });

  await t.test('037 cannot adopt prior032/033/035/036 events; exact derived032 replay cannot bypass the outer namespace', async () => {
    const h = await fixture(), input = await command(h), before = await snapshot(h);
    for (const eventId of [h.priorSourceCommand.eventId, h.reservationCommand.eventId, h.activationCommand.eventId, h.submissionCommand.eventId]) {
      await assert.rejects(() => run(h, { ...input, eventId }), /idempotency_conflict/);
      assert.deepEqual(await snapshot(h), before);
    }
    const args = await capture(h, input), response = await run(h, input), after = await snapshot(h);
    noMaterial(response);
    await assert.rejects(() => h.teach(args.p_transition.command), /idempotency_conflict/);
    await assert.rejects(() => run(h, { ...input, sessionId: randomUUID() }), /idempotency_conflict/);
    await assert.rejects(() => run(h, { ...input, eventId: randomUUID() }), /already|revision|handoff/);
    await assert.rejects(() => h.sourceAct('resume'), /session_conflict|phase/);
    await assert.rejects(() => h.run({ ...h.activationCommand, eventId: input.eventId }), /idempotency_conflict|submitted|sealed|phase|first_not_reserved/);
    assert.deepEqual(await snapshot(h), after);
  });

  await t.test('missing or modified036 genesis and a legacy-looking orphan child never authorize a handoff', async () => {
    for (const fault of ['missing_genesis', 'genesis_transaction', 'non_pristine_child']) {
      const h = await fixture(), input = await command(h), args = await capture(h, input);
      // Owner-only damage of genuine036 output: removing its sole provenance
      // leaves a child that must not be treated as an authorized legacy child.
      if (fault === 'missing_genesis') {
        await db.exec('alter table nmls_first_final_submission_events disable trigger nmls_first_final_submission_event_immutable');
        try { await db.query('delete from nmls_first_final_submission_events where student_id=$1', [h.actor]); }
        finally { await db.exec('alter table nmls_first_final_submission_events enable trigger nmls_first_final_submission_event_immutable'); }
      } else if (fault === 'genesis_transaction') {
        await db.exec('alter table nmls_first_final_submission_events disable trigger nmls_first_final_submission_event_immutable');
        try { await db.query('update nmls_first_final_submission_events set transaction_id=transaction_id+1 where student_id=$1', [h.actor]); }
        finally { await db.exec('alter table nmls_first_final_submission_events enable trigger nmls_first_final_submission_event_immutable'); }
      } else {
        // Disable only the private workflow immutability guard for this fault.
        await db.exec('alter table nmls_private_remediations disable trigger user');
        try { await db.query("update nmls_private_remediations set runtime=jsonb_set(runtime,'{lastReceiptMs}','1') where first_final_id=$1", [h.finalId]); }
        finally { await db.exec('alter table nmls_private_remediations enable trigger user'); }
      }
      const damaged = await snapshot(h);
      await assert.rejects(() => rpc('nmls_first_final_handoff_commit', args), /handoff|genesis|submission|child/);
      assert.deepEqual(await snapshot(h), damaged);
      await assert.rejects(() => run(h, input), /handoff|genesis|submission|child|workflow/);
      assert.deepEqual(await snapshot(h), damaged);
    }
  });

  await t.test('current original-grant authority and original ROCS receipts are required before fresh commit and historical replay', async () => {
    for (const handedOff of [false, true]) {
      const h = await fixture(), input = await command(h); if (handedOff) await run(h, input);
      const originalLedger = (await h.rows()).actor.ledger;
      for (const field of ['actorId', 'presentationId']) {
        // Explicit owner-only receipt corruption; no acceptance is forged.
        const damaged = structuredClone(originalLedger); damaged.acceptances[0][field] = randomUUID();
        await db.query('update nmls_review_actor_policy set ledger=$2 where student_id=$1', [h.actor, damaged]);
        try { const before = await snapshot(h); await assert.rejects(() => run(h, input), /invalid_rocs_receipt/); assert.deepEqual(await snapshot(h), before); }
        finally { await db.query('update nmls_review_actor_policy set ledger=$2 where student_id=$1', [h.actor, originalLedger]); }
      }
      await db.query("update nmls_review_access_grants set status='revoked' where id=$1", [h.grant]);
      // A different new grant is not authority to switch the sealed original.
      await db.query(`insert into nmls_review_access_grants(id,student_id,course_key,content_digest,expires_at,granted_by,evidence)
        values($1,$2,$3,$4,clock_timestamp()+interval '1 day',$2,'SYNTHETIC different grant, no original authority')`,
      [randomUUID(), h.actor, h.course.id, h.course.digest]);
      const revoked = await snapshot(h);
      await assert.rejects(() => run(h, input), /access_denied/); assert.deepEqual(await snapshot(h), revoked);
    }
  });

  await t.test('retained break and rolling budgets stay restrictive on the child after the content-free handoff', async () => {
    for (const limit of ['mandatory_break', 'rolling_limit']) {
      const h = await fixture();
      // Deliberate owner-loaded budget boundary, not simulated human study.
      if (limit === 'mandatory_break') await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{studySinceBreakMs}',to_jsonb($2::bigint)) where student_id=$1`, [h.actor, P.breakAfterStudyMs]);
      else await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{studyIntervals}',
        public.nmls_policy_interval_union(ledger->'studyIntervals',jsonb_build_array(jsonb_build_object(
          'start',floor(extract(epoch from clock_timestamp())*1000)::bigint-$2::bigint-2000,
          'end',floor(extract(epoch from clock_timestamp())*1000)::bigint-1000)))) where student_id=$1`, [h.actor, P.rollingStudyLimitMs]);
      const before = await h.rows(), input = await command(h), response = await run(h, input);
      noMaterial(response); assert.equal(response.body.handedOff, true);
      assert.equal(response.body.policyCode, limit === 'mandatory_break' ? 'mandatory_break_required' : 'rolling_study_limit');
      const after = await h.rows();
      assert.deepEqual(after.actor.ledger.studyIntervals, before.actor.ledger.studyIntervals);
      assert.equal(after.actor.ledger.studySinceBreakMs, before.actor.ledger.studySinceBreakMs);
      assert.equal(after.actor.ledger.sessionStartedAtMs, before.actor.ledger.sessionStartedAtMs);
      const opened = await childAct(h, 'open_unit', { unitId: 'F01-U01' });
      assert.equal(opened.body.deliveryAllowed, false); assert.deepEqual(opened.body.progress.lessons, []);
      assert.equal(opened.body.progress.quiz, null); assert.equal((await h.rows()).actor.ledger.observationJournal.active, null);
      assert.deepEqual((await h.rows()).reservedFinal, before.reservedFinal);
    }
  });

  await t.test('pending actor exposure cannot be erased to acquire the child, and damaged historical handoff metadata cannot replay', async () => {
    const h = await fixture(), input = await command(h), original = await h.rows();
    const genesis = await h.submissionContext();
    for (const field of ['active', 'unresolved']) {
      const args = await capture(h, input);
      // Owner-only damaged history: reintroduce a genuine old final window as
      // unresolved/active exposure. Handoff must not silently erase it.
      const damaged = structuredClone(original.actor.ledger);
      damaged.observationJournal[field] = structuredClone(genesis.deliveryEvent.audit.observation.windowBefore);
      await db.query('update nmls_review_actor_policy set ledger=$2 where student_id=$1', [h.actor, damaged]);
      try {
        const before = await snapshot(h);
        await assert.rejects(() => rpc('nmls_first_final_handoff_commit', args), /initial_state_required|observation|exposure/);
        assert.deepEqual(await snapshot(h), before);
        await assert.rejects(() => run(h, input), /observation_history/);
        assert.deepEqual(await snapshot(h), before);
      } finally { await db.query('update nmls_review_actor_policy set ledger=$2 where student_id=$1', [h.actor, original.actor.ledger]); }
    }
    await run(h, input);
    const event = (await context(h, input.eventId)).handoffEvent;
    for (const column of ['runtime', 'outcome']) {
      const altered = structuredClone(event[column]);
      if (column === 'runtime') altered.sessionId = randomUUID();
      else altered.code = 'SYNTHETIC_DAMAGED_METADATA';
      await db.exec('alter table nmls_first_final_handoff_events disable trigger nmls_first_final_handoff_event_immutable');
      try { await db.query(`update nmls_first_final_handoff_events set ${column}=$3 where student_id=$1 and event_id=$2`, [h.actor, input.eventId, altered]); }
      finally { await db.exec('alter table nmls_first_final_handoff_events enable trigger nmls_first_final_handoff_event_immutable'); }
      try {
        const before = await snapshot(h); await assert.rejects(() => run(h, input), /idempotency_conflict|invalid_commit_response/);
        assert.deepEqual(await snapshot(h), before);
      } finally {
        await db.exec('alter table nmls_first_final_handoff_events disable trigger nmls_first_final_handoff_event_immutable');
        try { await db.query(`update nmls_first_final_handoff_events set ${column}=$3 where student_id=$1 and event_id=$2`, [h.actor, input.eventId, event[column]]); }
        finally { await db.exec('alter table nmls_first_final_handoff_events enable trigger nmls_first_final_handoff_event_immutable'); }
      }
    }
  });

  await t.test('post-write child, binding, teaching-event, handoff-event and lease faults roll back the whole pair; exact retry works', async () => {
    for (const [table, when] of [['nmls_private_remediations', 'after update'], ['nmls_teaching_phase_bindings', 'after insert'],
      ['nmls_teaching_events', 'after insert'], ['nmls_first_final_handoff_events', 'after insert'], ['nmls_review_study_leases', 'after update']]) {
      const h = await fixture(), input = await command(h), before = await snapshot(h);
      await db.exec(`create function fail_first_final_handoff() returns trigger language plpgsql as $$ begin
        raise exception 'SYNTHETIC_HANDOFF_WRITE_FAILURE'; end $$;
        create trigger fail_first_final_handoff ${when} on ${table} for each row execute function fail_first_final_handoff();`);
      try { await assert.rejects(() => run(h, input), /SYNTHETIC_HANDOFF_WRITE_FAILURE/); assert.deepEqual(await snapshot(h), before); }
      finally { await db.exec(`drop trigger fail_first_final_handoff on ${table}; drop function fail_first_final_handoff();`); }
      const response = await run(h, input); noMaterial(response); assert.equal(response.body.handedOff, true);
      assert.equal((await h.rows()).actor.revision, input.expectedActorRevision + 1);
      assert.equal((await snapshot(h)).nmls_first_final_handoff_events.length, 1);
    }
  });

  await t.test('direct037 rejects NULL pins, material-bearing transitions, changed phase and invented progress or policy resets atomically', async () => {
    const h = await fixture(), input = await command(h), before = await snapshot(h);
    const corruptions = [
      args => { args.p_expected_source_revision = null; },
      args => { args.p_expected_final_revision = null; },
      args => { args.p_expected_delivery_revision = null; },
      args => { args.p_expected_workflow_revision = null; },
      args => { args.p_expected_runtime_revision = null; },
      args => { args.p_expected_actor_revision = null; },
      args => { args.p_expected_session_id = null; },
      args => { args.p_evaluated_at_ms = null; },
      args => { args.p_command_digest = null; },
      args => { args.p_definition_digest = null; },
      args => { args.p_intent.sessionId = randomUUID(); },
      args => { args.p_transition.phase.ownerId = randomUUID(); },
      args => { args.p_transition.command.kind = 'open_unit'; },
      args => { args.p_transition.runtime.sessionId = input.sessionId; },
      args => { args.p_transition.runtime.sessionId = randomUUID(); },
      args => { args.p_transition.runtime.lastActivityMs -= 1; },
      args => { args.p_transition.runtime.completedReviewMs = 1; },
      args => { args.p_transition.runtime.creditIssuanceAllowed = true; },
      args => { args.p_transition.ledger.studySinceBreakMs = 0; },
      args => { args.p_transition.ledger.studyIntervals = []; },
      args => { args.p_transition.ledger.sessionStartedAtMs = args.p_evaluated_at_ms; },
      args => { args.p_transition.outcome.progress.lessons = [{ id: 'F01-U01' }]; },
      args => { args.p_transition.outcome.progress.quiz = { id: randomUUID(), questions: [] }; },
      args => { args.p_transition.layout[0].units[0].requiredMs = 0; },
      args => { args.p_transition.audit.policy.actorId = randomUUID(); },
      args => { args.p_transition.audit.review.atMs -= 1; },
      args => { args.p_transition.audit.observation.windowBefore = { id: randomUUID() }; },
    ];
    for (const corrupt of corruptions) {
      const args = await capture(h, input); corrupt(args);
      await assert.rejects(() => rpc('nmls_first_final_handoff_commit', args), /nmls_/, String(corrupt));
      assert.deepEqual(await snapshot(h), before);
    }
    assert.equal((await run(h, input)).body.handedOff, true);
  });

  await t.test('post-write wall-session and grant deadlines roll back tentative handoff; freshness retries never create a second pair', async () => {
    for (const boundary of ['wall', 'grant', 'freshness']) {
      const h = await fixture();
      // Explicit owner-only retained session/grant deadline, crossed by a real
      // SQL wait inside037. This does not pretend another transaction ran.
      if (boundary === 'grant') await db.query("update nmls_review_access_grants set expires_at=clock_timestamp()+interval '600 milliseconds' where id=$1", [h.grant]);
      if (boundary === 'wall') await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{sessionStartedAtMs}',
        to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint-43200000+600)) where student_id=$1`, [h.actor]);
      const input = await command(h), before = await snapshot(h);
      await delayedReceipt(boundary === 'freshness' ? 1.1 : 0.7, async () => {
        await assert.rejects(() => run(h, input, { clockRetries: 0 }), /clock_refresh_required|access_denied/);
        assert.deepEqual(await snapshot(h), before);
      });
      if (boundary === 'grant') await assert.rejects(() => run(h, input), /access_denied/);
      else {
        const result = await run(h, input); noMaterial(result); assert.equal(result.body.handedOff, true);
        if (boundary === 'wall') assert.equal(result.body.policyCode, 'session_wall_limit');
        assert.equal((await snapshot(h)).nmls_first_final_handoff_events.length, 1);
        assert.equal((await h.rows()).actor.revision, input.expectedActorRevision + 1);
      }
    }
  });

  await t.test('the original short annual cutoff clips real final delivery and prevents a handoff from bridging the year boundary', async () => {
    const h = await fixture({ beforeActivation: async reserved => {
      // Owner-only synthetic annual deadline set BEFORE any final window is
      // issued. All035/036 historical windows are then genuine and clipped;
      // no immutable receipt is rewritten to manufacture a boundary case.
      await db.query(`update nmls_review_policy_bindings set offering=jsonb_set(offering,'{closesAtMs}',
        to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint+600)) where grant_id=$1`, [reserved.grant]);
    } });
    const input = await command(h), before = await snapshot(h);
    await delayedReceipt(0.7, async () => {
      await assert.rejects(() => run(h, input, { clockRetries: 0 }), /clock_refresh_required/);
      assert.deepEqual(await snapshot(h), before);
    });
    const result = await run(h, input); noMaterial(result); assert.equal(result.body.handedOff, true);
    assert.equal(result.body.policyCode, 'delivery_window_closed');
    assert.equal(result.body.runtimeStatus, 'logged_out'); assert.equal(result.body.sessionId, null);
    const after = await h.rows(); assert.equal(after.lease.phase_kind, 'remediation'); assert.equal(after.lease.phase_active, false);
    assert.deepEqual(after.source, before.nmls_review_attempts[0]);
    assert.deepEqual(after.reservedFinal, before.nmls_private_finals[0]);
    assert.equal(after.actor.ledger.observationJournal.active, null);
    const opened = await childAct(h, 'resume');
    assert.equal(opened.body.deliveryAllowed, false); assert.deepEqual(opened.body.progress.lessons, []);
    const checkpoint = await snapshot(h), replay = await run(h, input);
    noMaterial(replay); assert.equal(replay.body.duplicate, true); assert.equal(replay.body.policyCode, 'delivery_window_closed');
    assert.deepEqual(await snapshot(h), checkpoint);
  });

  await t.test('browser roles cannot hand off and service cannot mutate receipts or call owner-only delegates', async () => {
    const h = await fixture(), input = await command(h); await run(h, input);
    for (const role of ['anon', 'authenticated', 'service_role']) {
      await db.exec(`set role ${role}`);
      try {
        await assert.rejects(() => db.query('select * from nmls_first_final_handoff_events'), /permission denied/);
        await assert.rejects(() => db.query('delete from nmls_first_final_handoff_events'), /permission denied/);
      } finally { await db.exec('reset role'); }
      const functions = (await db.query(`select p.oid::regprocedure::text as signature,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        where n.nspname='public' and (p.proname like 'nmls_first_final_handoff_%' or p.proname like '%pre_handoff_internal')`)).rows;
      assert.ok(functions.some(fn => fn.proname === 'nmls_first_final_handoff_commit'));
      for (const fn of functions) {
        const allowed = (await db.query("select has_function_privilege($1,$2,'execute') as allowed", [role, fn.signature])).rows[0].allowed;
        assert.equal(allowed, role === 'service_role' && ['nmls_first_final_handoff_context', 'nmls_first_final_handoff_commit'].includes(fn.proname), fn.signature);
      }
    }
    const before = await snapshot(h);
    await assert.rejects(() => db.query('delete from nmls_first_final_handoff_events where student_id=$1', [h.actor]), /immutable/);
    await assert.rejects(() => db.query('update nmls_first_final_handoff_events set outcome=outcome where student_id=$1', [h.actor]), /immutable/);
    assert.deepEqual(await snapshot(h), before);
  });
});
