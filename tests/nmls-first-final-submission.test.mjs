import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { makeNmlsFirstFinalSqlFixture } from './helpers/nmls-first-final-sql-fixture.mjs';
import { transactNmlsFirstFinalSubmission } from '../netlify/functions/_lib/nmls-first-final-submission.mjs';
import { createNmlsFirstFinalSubmissionEvaluator } from '../lib/nmls-first-final-submission.mjs';
import { gradeNmlsDraftFinal, makeNmlsFinalRemediationCourse } from '../lib/nmls-final-assessment.mjs';
import { startNmlsCourseReview } from '../lib/nmls-review-runtime.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';

// Actual local SQL023→036 and adapters, with the explicitly SYNTHETIC one-unit,
// ONE-SECOND source fixture. Original completion is traversed, not fabricated.
// Labeled owner-only corruption/deadline faults below test fail-closed behavior;
// they are not supported writers, human attendance or real concurrency proofs.

const noRelease = response => {
  assert.equal(response.status, response.body.status);
  for (const flag of ['studentDeliveryEnabled', 'creditIssuanceAllowed', 'deliveryAllowed', 'retakeEnabled']) {
    assert.equal(response.body[flag], false);
  }
  for (const key of ['questions', 'answers', 'runtime', 'ledger', 'audit', 'selection', 'definition', 'childRuntime']) {
    assert.equal(Object.hasOwn(response.body, key), false);
  }
  assert.doesNotMatch(JSON.stringify(response.body), /PRIVATE SYNTHETIC|correctChoice|questionIds|optionOrder|rationale/);
};
const refusal = response => {
  noRelease(response);
  assert.equal(response.body.submitted, false);
  assert.equal(response.body.code, 'private_first_final_submission_refused');
  assert.equal(response.body.result, null);
  assert.equal(response.body.remediation, null);
  assert.equal(response.body.workflowRevision, null);
};

test('private first-final submission through actual SQL023–036 (synthetic only)', {
  skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'PGlite required; skipped SQL is not verified.',
}, async t => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite(); t.after(() => db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table students(id uuid primary key);');
  for (const name of ['023_nmls_review_runtime.sql', '024_nmls_review_discovery.sql', '025_nmls_review_session_policy.sql',
    '026_nmls_private_final_history.sql', '027_nmls_policy_exposure_guards.sql', '028_nmls_private_final_remediation.sql',
    '029_nmls_initial_exposure.sql', '030_nmls_phase_write_fences.sql', '031_nmls_teaching_exposure_guards.sql',
    '032_nmls_joint_teaching.sql', '033_nmls_final_reservation.sql', '034_nmls_final_delivery_guards.sql',
    '035_nmls_first_final_delivery.sql', '036_nmls_first_final_submission.sql', '037_nmls_first_final_handoff.sql', '038_nmls_second_final_reservation.sql', '039_nmls_second_final_delivery.sql', '040_nmls_second_final_submission.sql']) {
    await db.exec(readFileSync(new URL(`../database/${name}`, import.meta.url), 'utf8'));
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
    'nmls_first_final_submission_events'];
  async function snapshot(h) {
    const out = {};
    for (const table of tables) {
      // Original 023 attempt events have ownership through the attempt FK.
      const where = table === 'nmls_review_attempt_events' ? 'attempt_id=$1' : 'student_id=$1';
      out[table] = (await db.query(`select * from ${table} where ${where} order by to_jsonb(${table})::text`,
        [table === 'nmls_review_attempt_events' ? h.attemptId : h.actor])).rows;
    }
    return out;
  }
  const fixture = options => makeNmlsFirstFinalSqlFixture({ db, rpc, ...options });
  const command = async (h, correct = 25, extra = {}, receipt = true) => h.command('submit_first_final', {
    answers: await h.answersFor(correct), expectedFinalRevision: 1, ...extra,
  }, receipt);
  const run = (h, input, options = {}) => transactNmlsFirstFinalSubmission(input, h.actor, { ...h.deps, ...options });
  const submit = async (h, correct = 25, extra = {}, options = {}, receipt = true) => run(h, await command(h, correct, extra, receipt), options);
  const noGrade = createNmlsFirstFinalSubmissionEvaluator({ grade: () => { throw Error('MUST_NOT_GRADE_DENIAL'); } });
  const child = async h => (await db.query('select * from nmls_private_remediations where first_final_id=$1', [h.finalId])).rows[0];
  async function unsealed(h) {
    const r = await h.rows(); assert.equal(r.reservedFinal.revision, 1);
    for (const key of ['answers', 'result', 'remediation_manifest', 'submitted_at']) assert.equal(r.reservedFinal[key], null);
    assert.equal(await child(h), undefined);
  }
  async function capture(h, input) {
    let args;
    await assert.rejects(() => run(h, input, { rpc: async (name, values) => {
      if (name === 'nmls_first_final_submission_commit') { args = structuredClone(values); throw Error('CAPTURE_SUBMISSION_ONLY'); }
      return rpc(name, values);
    } }), /CAPTURE_SUBMISSION_ONLY/);
    assert.ok(args); return args;
  }
  async function faultActivity(h, millisecondsUntilIdle) {
    // Explicit owner-only fault; real delivery receipt and its scope stay intact.
    await db.exec('alter table nmls_first_final_deliveries disable trigger nmls_first_final_delivery_scope_immutable');
    try {
      await db.query(`update nmls_first_final_deliveries set runtime=jsonb_set(runtime,'{lastActivityMs}',
        to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint-360000+$2::bigint)) where final_id=$1`,
      [h.finalId, millisecondsUntilIdle]);
    } finally { await db.exec('alter table nmls_first_final_deliveries enable trigger nmls_first_final_delivery_scope_immutable'); }
  }
  async function delayedReceipt(seconds, work) {
    await db.exec(`create function delay_first_final_submission() returns trigger language plpgsql as $$ begin
      perform pg_sleep(${seconds}); return new; end $$;
      create trigger delay_first_final_submission after insert on nmls_first_final_submission_events
        for each row execute function delay_first_final_submission();`);
    try { await work(); }
    finally { await db.exec('drop trigger delay_first_final_submission on nmls_first_final_submission_events; drop function delay_first_final_submission();'); }
  }

  await t.test('18/25 passes and 17/25 fails exactly once, preserving source/form and initializing only a pristine required child', async () => {
    for (const correct of [18, 17]) {
      const h = await fixture(), before = await snapshot(h), input = await command(h, correct);
      await db.exec('set role service_role'); let response;
      try { response = await run(h, input); } finally { await db.exec('reset role'); }
      noRelease(response); assert.equal(response.body.submitted, true);
      assert.equal(response.body.code, 'private_first_final_submitted');
      const r = await h.rows(), after = await snapshot(h);
      const expected = gradeNmlsDraftFinal(h.definition, r.reservedFinal.selection, input.answers);
      assert.deepEqual(response.body.result, expected); assert.equal(expected.correct, correct);
      assert.equal(expected.passed, correct === 18); assert.equal(expected.requiredCorrect, 18);
      assert.equal(r.reservedFinal.revision, 2); assert.ok(r.reservedFinal.submitted_at);
      assert.deepEqual(r.reservedFinal.answers, input.answers); assert.deepEqual(r.reservedFinal.result, expected);
      assert.deepEqual(r.reservedFinal.selection, before.nmls_private_finals[0].selection);
      assert.deepEqual(after.nmls_review_attempts, before.nmls_review_attempts);
      assert.deepEqual(after.nmls_teaching_events, before.nmls_teaching_events);
      assert.deepEqual(after.nmls_final_reservation_events, before.nmls_final_reservation_events);
      assert.deepEqual(after.nmls_private_final_events, before.nmls_private_final_events, 'no026 mirror');
      assert.deepEqual(after.nmls_private_remediation_events, before.nmls_private_remediation_events, 'no028 mirror');
      assert.equal(r.delivery.revision, input.expectedRevision + 1);
      assert.equal(r.actor.revision, input.expectedActorRevision + 1);
      assert.equal(r.delivery.runtime.status, 'paused'); assert.equal(r.lease.phase_kind, 'final');
      assert.equal(r.lease.phase_owner_id, h.finalId); assert.equal(r.lease.phase_active, false);
      assert.equal(r.actor.ledger.observationJournal.active, null);
      assert.equal(after.nmls_first_final_submission_events.length, 1);
      assert.equal(after.nmls_first_final_delivery_events.length, before.nmls_first_final_delivery_events.length + 1);
      const pauseEvent = after.nmls_first_final_delivery_events.find(event => event.event_id === input.eventId);
      assert.ok(pauseEvent, 'same-transaction035 closing receipt accompanies sole036 submission receipt');
      assert.equal(pauseEvent.actor_revision, r.actor.revision);
      assert.equal(after.nmls_first_final_submission_events[0].actor_revision, r.actor.revision);
      if (correct === 18) {
        assert.equal(await child(h), undefined); assert.equal(response.body.remediation, null);
        assert.equal(response.body.workflowRevision, null); assert.equal(r.reservedFinal.remediation_manifest, null);
      } else {
        const w = await child(h), course = makeNmlsFinalRemediationCourse(h.definition, h.course, r.reservedFinal.selection, input.answers);
        assert.equal(w.revision, 1); assert.equal(w.status, 'remediating');
        assert.deepEqual(w.runtime, startNmlsCourseReview(course));
        assert.deepEqual(w.manifest, r.reservedFinal.remediation_manifest);
        assert.deepEqual(response.body.remediation, w.manifest); assert.equal(response.body.workflowRevision, 1);
        for (const key of ['second_id', 'second_selection', 'second_answers', 'second_result', 'second_issued_at', 'second_submitted_at']) {
          assert.equal(w[key], null);
        }
        assert.equal(w.manifest.completed, false); assert.equal(w.manifest.retakeEnabled, false);
      }
      const sealed = await snapshot(h);
      const replay = await run(h, input, { evaluate: () => { throw Error('MUST_NOT_EVALUATE_REPLAY'); } });
      noRelease(replay); assert.equal(replay.body.duplicate, true);
      assert.deepEqual(replay.body.result, response.body.result); assert.deepEqual(await snapshot(h), sealed);
      await assert.rejects(() => run(h, { ...input, answers: Object.fromEntries(Object.entries(input.answers).map(([id]) => [id, 'D'])) }), /idempotency_conflict/);
      await assert.rejects(() => submit(h), /already|sealed|revision|finalized/);
      await assert.rejects(() => h.act('resume'), /reserved|submitted|sealed|final|phase/);
      await assert.rejects(() => h.sourceAct('resume'), /session_conflict|phase/);
      if (correct === 17) {
        const w = await child(h);
        await assert.rejects(() => h.teach({ kind: 'resume', eventId: randomUUID(), attemptId: h.attemptId,
          phaseKind: 'remediation', phaseOwnerId: h.finalId, expectedRevision: w.runtime.revision,
          expectedSourceRevision: r.source.revision, expectedWorkflowRevision: w.revision,
          expectedActorRevision: r.actor.revision, sessionId: w.runtime.sessionId }), /session_conflict|phase/);
      }
      assert.deepEqual(await snapshot(h), sealed);
    }
  });

  await t.test('no acknowledgment, paused, hidden, missing receipt, idle and policy limits refuse without storing any grade or child', async () => {
    for (const reason of ['unacknowledged', 'paused', 'hidden', 'receipt_missing', 'idle', 'break', 'mandatory_break', 'rolling_limit']) {
      const h = await fixture({ through: reason === 'unacknowledged' ? 'active' : 'acknowledged' });
      if (reason === 'paused') await h.act('pause');
      if (reason === 'hidden') await h.act('interaction', { visible: false });
      if (reason === 'idle') await faultActivity(h, 0);
      if (reason === 'break') await h.act('begin_break');
      if (reason === 'mandatory_break') await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{studySinceBreakMs}',to_jsonb($2::bigint)) where student_id=$1`, [h.actor, P.breakAfterStudyMs]);
      if (reason === 'rolling_limit') {
        // Explicit owner-only retained-use boundary, not simulated attendance.
        await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{studyIntervals}',
          public.nmls_policy_interval_union(ledger->'studyIntervals',jsonb_build_array(jsonb_build_object(
          'start',floor(extract(epoch from clock_timestamp())*1000)::bigint-$2::bigint-2000,
          'end',floor(extract(epoch from clock_timestamp())*1000)::bigint-1000)))) where student_id=$1`, [h.actor, P.rollingStudyLimitMs]);
      }
      const before = await h.rows(), response = await submit(h, 25, {}, { evaluate: noGrade }, reason !== 'receipt_missing');
      refusal(response); await unsealed(h);
      const after = await h.rows(); assert.equal(after.delivery.revision, before.delivery.revision + 1);
      assert.equal(after.actor.revision, before.actor.revision + 1); assert.equal(after.actor.ledger.observationJournal.active, null);
      const event = (await snapshot(h)).nmls_first_final_submission_events[0];
      assert.doesNotMatch(JSON.stringify(event), /"answers"\s*:\s*\{|"correct"\s*:\s*25|PRIVATE SYNTHETIC/);
    }
  });

  await t.test('never-activated revision0 final refuses canonically without manufacturing a final session or grade', async () => {
    const h = await fixture({ through: 'reserved' }), before = await h.rows(), input = await command(h);
    assert.equal(input.expectedRevision, 0); assert.equal(input.sessionId, null);
    assert.equal(Object.hasOwn(input, 'studyReceipt'), false); assert.equal(before.delivery, undefined);
    const response = await run(h, input, { evaluate: noGrade });
    refusal(response); assert.equal(response.body.submissionCode, 'first_final_policy_refused');
    assert.equal(response.body.deliveryCode, 'final_paused'); assert.equal(response.body.policyCode, 'session_policy_allowed');
    assert.equal(response.body.observationCode, 'observation_ready');
    await unsealed(h);
    const after = await h.rows(), history = await snapshot(h);
    assert.equal(after.delivery.revision, 1); assert.equal(after.delivery.runtime.status, 'reserved');
    assert.equal(after.delivery.runtime.sessionId, null); assert.equal(after.delivery.runtime.lastActivityMs, null);
    assert.equal(after.actor.revision, before.actor.revision + 1);
    assert.deepEqual(after.lease, before.lease); assert.deepEqual(after.source, before.source);
    assert.deepEqual(after.actor.ledger.studyIntervals, before.actor.ledger.studyIntervals);
    assert.equal(after.actor.ledger.studySinceBreakMs, before.actor.ledger.studySinceBreakMs);
    assert.equal(history.nmls_first_final_submission_events.length, 1);
    assert.equal(history.nmls_first_final_delivery_events.length, 1);
    assert.deepEqual(history.nmls_private_final_events, []); assert.deepEqual(history.nmls_private_remediation_events, []);
  });

  await t.test('retained observed union defeats an underreported scalar even when ordinary closing policy is allowed', async () => {
    const h = await fixture(), initial = await h.rows();
    const retainedEnd = initial.actor.ledger.observationJournal.active.lastObservedAtMs;
    const retainedStart = retainedEnd - P.breakAfterStudyMs - 1;
    // Explicit owner-loaded damaged-counter fixture, not recorded human study.
    // Keep original source/selection/receipt and retained observed coverage; only
    // install historical exposure plus the deliberately underreported scalar.
    await db.query(`update nmls_review_actor_policy set ledger=ledger||jsonb_build_object(
      'studyIntervals',public.nmls_policy_interval_union(ledger->'studyIntervals',jsonb_build_array(
        jsonb_build_object('start',$2::bigint,'end',$3::bigint))),
      'studyBoundaryAtMs',$2::bigint,'studySinceBreakMs',0) where student_id=$1`, [h.actor, retainedStart, retainedEnd]);
    const input = await command(h, 17), before = await snapshot(h), args = await capture(h, input);
    assert.equal(args.p_transition.outcome.ok, true);
    assert.equal(args.p_transition.outcome.code, 'final_paused');
    assert.equal(args.p_transition.outcome.policyCode, 'session_policy_allowed');
    assert.equal(args.p_transition.outcome.observationCode, 'receipt_continuous');
    assert.deepEqual(args.p_transition.submission, { submitted: false, code: 'first_final_exposure_review_required',
      answers: null, result: null, manifest: null, childRuntime: null });
    // Use the real private grader/child creator, then corrupt ONLY eligibility
    // in the submission proposal. No claim that SQL independently has a key.
    const first = initial.reservedFinal, childCourse = makeNmlsFinalRemediationCourse(h.definition, h.course, first.selection, input.answers);
    args.p_transition.submission = { submitted: true, code: 'first_final_submission_allowed',
      answers: structuredClone(input.answers), result: gradeNmlsDraftFinal(h.definition, first.selection, input.answers),
      manifest: { courseKey: childCourse.id, contentDigest: childCourse.digest, sourceCourseKey: h.course.id,
        sourceContentDigest: h.course.digest, definitionDigest: h.definition.digest, finalAttemptId: h.finalId,
        reviewAttemptId: h.attemptId, moduleIds: childCourse.modules.map(module => module.id),
        unitIds: childCourse.modules.flatMap(module => module.units.map(unit => unit.id)), completed: false, retakeEnabled: false },
      childRuntime: startNmlsCourseReview(childCourse) };
    // This error occurs AFTER actual035/034 accepts the clean pause, proving
    // the independent036 exposure decision rejects the forged eligible result.
    await assert.rejects(() => rpc('nmls_first_final_submission_commit', args), /nmls_first_final_submission_decision_conflict/);
    assert.deepEqual(await snapshot(h), before); await unsealed(h);
    const response = await run(h, input, { evaluate: noGrade });
    refusal(response); assert.equal(response.body.submissionCode, 'first_final_exposure_review_required');
    assert.equal(response.body.policyCode, 'session_policy_allowed'); assert.equal(response.body.deliveryCode, 'final_paused');
    const after = await h.rows(); await unsealed(h);
    assert.ok(after.actor.ledger.studySinceBreakMs < P.breakAfterStudyMs);
    const used = (await db.query('select public.nmls_policy_exposure_in_range($1::jsonb,$2::bigint,$3::bigint) as used',
      [after.actor.ledger.studyIntervals, after.actor.ledger.studyBoundaryAtMs, after.actor.ledger.lastReceiptMs])).rows[0].used;
    assert.ok(used > P.breakAfterStudyMs); assert.deepEqual(after.source, initial.source);
    assert.equal((await snapshot(h)).nmls_first_final_submission_events.length, 1);
  });

  await t.test('a refused event replays its original null result after a later successful submission', async () => {
    const h = await fixture({ through: 'active' }), deniedInput = await command(h), denied = await run(h, deniedInput, { evaluate: noGrade });
    refusal(denied); await unsealed(h);
    await h.act('resume'); await h.acknowledge();
    const submitted = await submit(h, 18); assert.equal(submitted.body.submitted, true);
    const before = await snapshot(h), replay = await run(h, deniedInput, { evaluate: () => { throw Error('MUST_NOT_EVALUATE_REPLAY'); } });
    refusal(replay); assert.equal(replay.body.duplicate, true); assert.deepEqual(await snapshot(h), before);
  });

  await t.test('all CAS/session/actor conflicts and changed answer sets are adjudicated without grading or mutation', async () => {
    const h = await fixture(), valid = await command(h), before = await snapshot(h);
    for (const patch of [{ expectedSourceRevision: valid.expectedSourceRevision - 1 }, { expectedRevision: valid.expectedRevision - 1 },
      { expectedActorRevision: valid.expectedActorRevision - 1 }, { expectedFinalRevision: 2 }, { sessionId: randomUUID() }]) {
      await assert.rejects(() => run(h, { ...valid, eventId: randomUUID(), ...patch }, { evaluate: () => { throw Error('MUST_NOT_EVALUATE_CONFLICT'); } }), /revision|session|invalid_request/);
      assert.deepEqual(await snapshot(h), before);
    }
    const foreign = randomUUID(); await db.query('insert into students values($1)', [foreign]);
    await assert.rejects(() => transactNmlsFirstFinalSubmission(valid, foreign, h.deps), /access_denied|scope/);
    for (const answers of [{}, { ...valid.answers, EXTRA: 'A' }, { ...valid.answers, [Object.keys(valid.answers)[0]]: 'Z' }]) {
      await assert.rejects(() => run(h, { ...valid, answers }), /invalid_answers|invalid_request/);
      assert.deepEqual(await snapshot(h), before);
    }
  });

  await t.test('035 and036 namespaces cannot adopt each other, including an independently committed orphan pause', async () => {
    const h = await fixture(), oldEvent = h.activationCommand.eventId, before = await snapshot(h);
    await assert.rejects(() => submit(h, 25, { eventId: oldEvent }), /idempotency_conflict/);
    assert.deepEqual(await snapshot(h), before);
    const pauseCommand = await h.command('pause'); await h.run(pauseCommand);
    const orphan = await snapshot(h);
    await assert.rejects(() => submit(h, 25, { eventId: pauseCommand.eventId }), /idempotency_conflict/);
    assert.deepEqual(await snapshot(h), orphan); await unsealed(h);
    const deniedInput = await command(h), denied = await run(h, deniedInput); refusal(denied);
    const afterDenial = await snapshot(h);
    const { answers: deniedAnswers, ...derivedPause } = deniedInput;
    await assert.rejects(() => h.run({ ...derivedPause, kind: 'pause' }), /idempotency_conflict/);
    await assert.rejects(async () => h.run(await h.command('resume', { eventId: deniedInput.eventId })), /idempotency_conflict/);
    assert.deepEqual(await snapshot(h), afterDenial);
  });

  await t.test('current grant and original ROCS ownership apply to new submission and immutable historical replay', async () => {
    for (const submitted of [false, true]) {
      const h = await fixture(), input = await command(h); if (submitted) await run(h, input);
      const originalLedger = (await h.rows()).actor.ledger;
      for (const field of ['actorId', 'presentationId']) {
        const altered = structuredClone(originalLedger); altered.acceptances[0][field] = randomUUID();
        await db.query('update nmls_review_actor_policy set ledger=$2 where student_id=$1', [h.actor, altered]);
        try { const before = await snapshot(h); await assert.rejects(() => run(h, input), /invalid_rocs_receipt/); assert.deepEqual(await snapshot(h), before); }
        finally { await db.query('update nmls_review_actor_policy set ledger=$2 where student_id=$1', [h.actor, originalLedger]); }
      }
      await db.query("update nmls_review_access_grants set status='revoked' where id=$1", [h.grant]);
      const revoked = await snapshot(h); await assert.rejects(() => run(h, input), /access_denied/); assert.deepEqual(await snapshot(h), revoked);
    }
  });

  await t.test('failure at final sealing, child insertion or authoritative receipt rolls all state back; exact retry finalizes once', async () => {
    for (const [table, when] of [['nmls_private_finals', 'after update'], ['nmls_private_remediations', 'after insert'],
      ['nmls_first_final_submission_events', 'after insert']]) {
      const h = await fixture(), input = await command(h, 17), before = await snapshot(h);
      await db.exec(`create function fail_first_final_submission() returns trigger language plpgsql as $$ begin raise exception 'SYNTHETIC_SUBMISSION_WRITE_FAILURE'; end $$;
        create trigger fail_first_final_submission ${when} on ${table} for each row execute function fail_first_final_submission();`);
      try { await assert.rejects(() => run(h, input), /SYNTHETIC_SUBMISSION_WRITE_FAILURE/); assert.deepEqual(await snapshot(h), before); }
      finally { await db.exec(`drop trigger fail_first_final_submission on ${table}; drop function fail_first_final_submission();`); }
      const result = await run(h, input); assert.equal(result.body.submitted, true); assert.equal(result.body.result.correct, 17);
      assert.equal((await snapshot(h)).nmls_first_final_submission_events.length, 1);
      assert.equal((await h.rows()).actor.revision, input.expectedActorRevision + 1);
    }
  });

  await t.test('direct036 rejects NULL authority, changed answer intent and non-pristine child proposals atomically', async () => {
    const h = await fixture(), input = await command(h, 17), before = await snapshot(h);
    // Deliberately bypass the adapter with captured real candidates. These
    // shape/arithmetic/scope checks do not assert SQL possesses the answer key.
    const corruptions = [
      args => { args.p_expected_source_revision = null; },
      args => { args.p_expected_final_revision = null; },
      args => { args.p_expected_delivery_revision = null; },
      args => { args.p_expected_actor_revision = null; },
      args => { args.p_evaluated_at_ms = null; },
      args => { args.p_command_digest = null; },
      args => { args.p_intent.answers[Object.keys(args.p_intent.answers)[0]] = 'D'; },
      args => { args.p_transition.submission.submitted = null; },
      args => { args.p_transition.submission.result.total = 26; },
      args => { args.p_transition.submission.result.requiredCorrect = 17; },
      args => { args.p_transition.submission.result.percent = 69; },
      args => { args.p_transition.submission.manifest.retakeEnabled = true; },
      args => { args.p_transition.submission.childRuntime.completedReviewMs = 1; },
      args => { args.p_transition.submission.childRuntime.creditIssuanceAllowed = true; },
      args => { args.p_transition.submission.answers[Object.keys(args.p_transition.submission.answers)[0]] = 'D'; },
      args => { args.p_transition.phase.actorId = randomUUID(); },
    ];
    for (const corrupt of corruptions) {
      const args = await capture(h, input); corrupt(args);
      await assert.rejects(() => rpc('nmls_first_final_submission_commit', args), /nmls_/);
      assert.deepEqual(await snapshot(h), before); await unsealed(h);
    }
    assert.equal((await run(h, input)).body.submitted, true);
  });

  await t.test('post-write horizon, annual, idle, wall-session and grant boundaries prevent tentative grading from escaping', async () => {
    for (const boundary of ['horizon', 'annual', 'idle', 'wall', 'grant']) {
      const h = await fixture();
      // Explicit owner-only deadlines before evaluation; real SQL time crosses
      // the deadline inside the final receipt insert. No concurrent edit claim.
      if (boundary === 'grant') await db.query("update nmls_review_access_grants set expires_at=clock_timestamp()+interval '600 milliseconds' where id=$1", [h.grant]);
      if (boundary === 'idle') await faultActivity(h, 600);
      if (boundary === 'wall') await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{sessionStartedAtMs}',
        to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint-43200000+600)) where student_id=$1`, [h.actor]);
      if (boundary === 'horizon' || boundary === 'annual') {
        const deadline = (await db.query('select floor(extract(epoch from clock_timestamp())*1000)::bigint+600 as value')).rows[0].value;
        await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{observationJournal,active,horizonMs}',to_jsonb($2::bigint)) where student_id=$1`, [h.actor, deadline]);
        if (boundary === 'annual') await db.query("update nmls_review_policy_bindings set offering=jsonb_set(offering,'{closesAtMs}',to_jsonb($2::bigint)) where grant_id=$1", [h.grant, deadline]);
      }
      const input = await command(h), before = await snapshot(h);
      await delayedReceipt(0.7, async () => {
        await assert.rejects(() => run(h, input, { clockRetries: 0 }), /clock_refresh_required|access_denied/);
        assert.deepEqual(await snapshot(h), before); await unsealed(h);
      });
      if (boundary === 'grant') await assert.rejects(() => run(h, input), /access_denied/);
      else { refusal(await run(h, input, { evaluate: noGrade })); await unsealed(h); }
    }
  });

  await t.test('post-write freshness failure is atomic and the retry keeps the same answer/form pair', async () => {
    const h = await fixture(), input = await command(h, 18), before = await snapshot(h);
    await delayedReceipt(1.1, async () => {
      await assert.rejects(() => run(h, input, { clockRetries: 0 }), /clock_refresh_required/);
      assert.deepEqual(await snapshot(h), before); await unsealed(h);
    });
    const result = await run(h, input); assert.equal(result.body.submitted, true);
    assert.deepEqual((await h.rows()).reservedFinal.selection, before.nmls_private_finals[0].selection);
    assert.deepEqual((await h.rows()).reservedFinal.answers, input.answers);
  });

  await t.test('browser roles have no submission authority and service cannot bypass immutable receipt or guard', async () => {
    const h = await fixture(); await submit(h, 17);
    for (const role of ['anon', 'authenticated', 'service_role']) {
      await db.exec(`set role ${role}`);
      try {
        for (const table of ['nmls_first_final_submission_events', 'nmls_private_finals', 'nmls_private_remediations']) {
          await assert.rejects(() => db.query(`select * from ${table}`), /permission denied/);
          await assert.rejects(() => db.query(`delete from ${table}`), /permission denied/);
        }
      } finally { await db.exec('reset role'); }
      const functions = (await db.query(`select p.oid::regprocedure::text as signature,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        where n.nspname='public' and (p.proname like 'nmls_first_final_submission_%' or p.proname like '%pre_submission_internal')`)).rows;
      assert.ok(functions.some(fn => fn.proname === 'nmls_first_final_submission_commit'));
      for (const fn of functions) {
        const allowed = (await db.query("select has_function_privilege($1,$2,'execute') as allowed", [role, fn.signature])).rows[0].allowed;
        assert.equal(allowed, role === 'service_role' && ['nmls_first_final_submission_context', 'nmls_first_final_submission_commit'].includes(fn.proname), fn.signature);
      }
    }
    const before = await snapshot(h);
    await assert.rejects(() => db.query('delete from nmls_first_final_submission_events where student_id=$1', [h.actor]), /immutable/);
    assert.deepEqual(await snapshot(h), before);
  });
});
