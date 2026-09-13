import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { setTimeout as pause } from 'node:timers/promises';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { transactNmlsTeaching } from '../netlify/functions/_lib/nmls-teaching-transaction.mjs';
import { transactNmlsFinalReservation } from '../netlify/functions/_lib/nmls-final-reservation.mjs';
import { transactNmlsFirstFinalDelivery } from '../netlify/functions/_lib/nmls-first-final-delivery.mjs';
import { digestNmlsCommand } from '../netlify/functions/_lib/nmls-review-service.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { startNmlsCourseReview } from '../lib/nmls-review-runtime.mjs';
import { defineNmlsDraftFinal, projectNmlsDraftFinal } from '../lib/nmls-final-assessment.mjs';

// LOCAL PGlite + actual source/observer/policy/reservation/final reducers. The
// one-unit/one-second manuscript, final bank, ROCS evidence and labeled owner
// faults are SYNTHETIC. Positive source completion is traversed, never seeded.
// These tests prove neither human attendance nor real PostgreSQL concurrency.
const course = structuredClone(getNmlsReviewCourse('nmls-2026-f01-private-review'));
course.id = 'synthetic-first-final-delivery';
course.modules[0].units = [{ ...course.modules[0].units[0], requiredSeconds: 1 }];
delete course.digest;
course.digest = createHash('sha256').update(JSON.stringify(course)).digest('hex');
const items = Array.from({ length: 50 }, (_, i) => ({
  id: `N26-FIN-F${String(i + 1).padStart(2, '0')}`, category: 'federal', moduleId: 'F01',
  objective: 'Synthetic first-final delivery fixture.', stem: `PRIVATE SYNTHETIC FINAL QUESTION ${i + 1}?`,
  options: ['A', 'B', 'C', 'D'].map(id => ({ id, text: `PRIVATE SYNTHETIC OPTION ${id}` })),
  correctChoice: 'A', rationale: 'PRIVATE SYNTHETIC RATIONALE', independenceNote: 'Engineering only.',
  distractorRationales: { B: 'Wrong.', C: 'Wrong.', D: 'Wrong.' },
  sourceRefs: [{ url: 'https://www.consumerfinance.gov/rules-policy/regulations/', locator: 'Synthetic',
    supports: 'No legal assertion.', checkedOn: '2026-09-12' }],
  remediation: { unitIds: ['F01-U01'], focus: 'Synthetic practice.' },
}));
const definition = defineNmlsDraftFinal(course, { id: 'synthetic-delivery-final', items, moduleQuotas: { F01: 25 } });
const noMaterial = response => {
  assert.equal(response.body.deliveryAllowed, false);
  assert.equal(response.body.deliveryUntilMs, null);
  assert.equal(response.body.studyWindow, null);
  assert.equal(response.body.questions, null);
  assert.doesNotMatch(JSON.stringify(response.body), /PRIVATE SYNTHETIC|correctChoice|rationale|questionIds|optionOrder|"lessons"/);
};
const privateOnly = response => {
  assert.equal(response.body.studentDeliveryEnabled, false);
  assert.equal(response.body.creditIssuanceAllowed, false);
  assert.equal(response.status, response.body.status);
  for (const key of ['runtime', 'ledger', 'audit', 'selection', 'definition',
    'candidateMaterialAllowed', 'candidateUntilMs', 'candidateWindow']) assert.equal(Object.hasOwn(response.body, key), false);
  assert.doesNotMatch(JSON.stringify(response.body), /correctChoice|rationale|"answers"|"result"|"grade"/);
};

test('joint first-final delivery through real source and reservation SQL (private synthetic only)', {
  skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'PGlite required; skipped SQL is not verified.',
}, async t => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite(); t.after(() => db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table students(id uuid primary key);');
  for (const file of [
    '023_nmls_review_runtime.sql', '024_nmls_review_discovery.sql', '025_nmls_review_session_policy.sql',
    '026_nmls_private_final_history.sql', '027_nmls_policy_exposure_guards.sql', '028_nmls_private_final_remediation.sql',
    '029_nmls_initial_exposure.sql', '030_nmls_phase_write_fences.sql', '031_nmls_teaching_exposure_guards.sql',
    '032_nmls_joint_teaching.sql', '033_nmls_final_reservation.sql', '034_nmls_final_delivery_guards.sql',
    '035_nmls_first_final_delivery.sql', '036_nmls_first_final_submission.sql', '037_nmls_first_final_handoff.sql', '038_nmls_second_final_reservation.sql', '039_nmls_second_final_delivery.sql', '040_nmls_second_final_submission.sql',
  ]) await db.exec(readFileSync(new URL(`../database/${file}`, import.meta.url), 'utf8'));
  const rpc = async (name, args) => {
    assert.match(name, /^nmls_[a-z_]+$/);
    const keys = Object.keys(args); assert.ok(keys.every(key => /^p_[a-z_]+$/.test(key)));
    try {
      return (await db.query(`select public.${name}(${keys.map((key, i) => `${key}=>$${i + 1}`).join(',')}) as result`, Object.values(args))).rows[0].result;
    } catch (error) {
      error.message += ` [${name}${error.where ? `: ${error.where}` : ''}]`;
      throw error;
    }
  };
  const deps = { rpc, courseFor: key => { assert.equal(key, course.id); return structuredClone(course); },
    definitionFor: key => { assert.equal(key, course.id); return definition; } };
  const tables = ['nmls_review_access_grants', 'nmls_review_attempts', 'nmls_review_actor_policy', 'nmls_review_study_leases',
    'nmls_private_finals', 'nmls_private_final_events', 'nmls_private_remediations', 'nmls_private_remediation_events',
    'nmls_teaching_phase_bindings', 'nmls_teaching_events', 'nmls_final_reservation_events',
    'nmls_first_final_deliveries', 'nmls_first_final_delivery_events'];
  async function snapshot(actor) {
    const out = {};
    for (const table of tables) out[table] = (await db.query(`select * from ${table} where student_id=$1 order by to_jsonb(${table})::text`, [actor])).rows;
    return out;
  }
  const original = async h => {
    const s = await snapshot(h.actor);
    return Object.fromEntries(['nmls_review_attempts', 'nmls_private_finals', 'nmls_private_final_events',
      'nmls_private_remediations', 'nmls_private_remediation_events', 'nmls_teaching_events', 'nmls_final_reservation_events']
      .map(key => [key, s[key]]));
  };
  const rows = async h => ({
    source: (await db.query('select * from nmls_review_attempts where id=$1', [h.attemptId])).rows[0],
    actor: (await db.query('select * from nmls_review_actor_policy where student_id=$1', [h.actor])).rows[0],
    delivery: (await db.query('select * from nmls_first_final_deliveries where final_id=$1', [h.finalId])).rows[0],
    lease: (await db.query('select * from nmls_review_study_leases where student_id=$1', [h.actor])).rows[0],
  });
  async function fixture() {
    const actor = randomUUID(), grant = randomUUID();
    await db.query('insert into students values($1)', [actor]);
    await db.query(`insert into nmls_review_access_grants(id,student_id,course_key,content_digest,expires_at,granted_by,evidence)
      values($1,$2,$3,$4,clock_timestamp()+interval '1 day',$2,'SYNTHETIC final delivery fixture')`, [grant, actor, course.id, course.digest]);
    await rpc('nmls_policy_bind', { p_student_id: actor, p_grant_id: grant, p_policy_id: P.id, p_policy_digest: digestNmlsCommand(P),
      p_offering: { id: grant, contentDigest: course.digest, year: 2026, educationType: 'annual_ce', timeZone: 'UTC',
        deadlineBasisId: 'SYNTHETIC-ONLY', opensAtMs: Date.UTC(2026, 0, 1), closesAtMs: Date.UTC(2027, 0, 1),
        rocs: { version: '4', documentDigest: 'c'.repeat(64), fullDocumentVerified: true, evidenceId: 'SYNTHETIC-NOT-REAL-ROCS' } } });
    const started = await rpc('nmls_policy_start', { p_student_id: actor, p_grant_id: grant, p_course_key: course.id,
      p_content_digest: course.digest, p_initial_runtime: startNmlsCourseReview(course) });
    const h = { actor, grant, attemptId: started.attempt.id };
    h.sourceContext = () => rpc('nmls_teaching_context', { p_student_id: actor, p_attempt_id: h.attemptId,
      p_phase_kind: 'source', p_phase_owner_id: h.attemptId });
    h.sourceCommand = async (kind, extra = {}) => {
      const c = await h.sourceContext(), r = c.attempt.runtime;
      return { kind, attemptId: h.attemptId, phaseKind: 'source', phaseOwnerId: h.attemptId, eventId: randomUUID(),
        expectedRevision: r.revision, expectedSourceRevision: c.attempt.revision, expectedWorkflowRevision: null,
        expectedActorRevision: c.actorPolicy?.revision ?? 0, sessionId: r.sessionId,
        ...(c.actorPolicy?.ledger.observationJournal?.active ? { studyReceipt: { windowId: c.actorPolicy.ledger.observationJournal.active.id, visible: true } } : {}),
        ...(kind === 'interaction' ? { observation: 'keyboard' } : {}), ...extra };
    };
    h.teach = input => transactNmlsTeaching(input, actor, deps);
    h.sourceAct = async (kind, extra = {}) => h.teach(await h.sourceCommand(kind, extra));
    await h.sourceAct('resume');
    const shown = await rpc('nmls_policy_present_rocs', { p_student_id: actor, p_attempt_id: h.attemptId, p_document_digest: 'c'.repeat(64) });
    await h.sourceAct('accept_rocs', { presentationId: shown.id, version: '4', documentDigest: 'c'.repeat(64), acknowledged: true });
    await h.sourceAct('resume'); await h.sourceAct('open_unit', { unitId: 'F01-U01' });
    await h.sourceAct('interaction', { visible: true }); await pause(1100);
    await h.sourceAct('heartbeat', { visible: true });
    await h.sourceAct('unit_action', { choice: course.modules[0].units[0].actionQuestion.correctChoice });
    assert.equal((await h.sourceAct('complete_unit')).body.code, 'unit_review_complete');
    await h.sourceAct('quiz_start', { moduleId: 'F01' }); await h.sourceAct('interaction', { visible: true });
    const quiz = (await h.sourceContext()).attempt.runtime.quiz;
    const answers = Object.fromEntries(quiz.questionIds.map(id => [id, course.modules[0].quiz.bank.find(q => q.id === id).correctChoice]));
    const completed = await h.sourceAct('quiz_submit', { quizId: quiz.id, answers });
    assert.equal(completed.body.code, 'module_review_passed'); assert.equal(completed.body.deliveryAllowed, false);
    assert.deepEqual(completed.body.progress.lessons, []);
    // Preserve an ordinary teaching event for cross-namespace collision probes.
    h.priorSourceCommand = await h.sourceCommand('check_access'); await h.teach(h.priorSourceCommand);
    const c = await h.sourceContext();
    h.reservationCommand = { kind: 'reserve_first_final', attemptId: h.attemptId, eventId: randomUUID(),
      expectedSourceRevision: c.attempt.revision, expectedActorRevision: c.actorPolicy.revision,
      expectedFinalRevision: 0, sessionId: c.attempt.runtime.sessionId };
    h.reserved = await transactNmlsFinalReservation(h.reservationCommand, actor, deps);
    assert.equal(h.reserved.body.reserved, true); h.finalId = h.reserved.body.finalAttemptId;
    h.command = async (kind, extra = {}, receipt = true) => {
      const current = await rows(h), runtime = current.delivery?.runtime;
      return { kind, eventId: randomUUID(), attemptId: h.attemptId, finalAttemptId: h.finalId,
        expectedRevision: runtime?.revision ?? 0, expectedSourceRevision: current.source.revision,
        expectedFinalRevision: 1, expectedActorRevision: current.actor.revision, sessionId: runtime?.sessionId ?? null,
        ...(receipt && current.actor.ledger.observationJournal?.active ? { studyReceipt: { windowId: current.actor.ledger.observationJournal.active.id, visible: true } } : {}), ...extra };
    };
    h.run = (input, options = {}) => transactNmlsFirstFinalDelivery(input, actor, { ...deps, ...options });
    h.act = async (kind, extra = {}, options = {}, receipt = true) => {
      const input = await h.command(kind, extra, receipt), result = await h.run(input, options);
      const after = await rows(h);
      assert.equal(result.body.duplicate, false);
      assert.equal(after.delivery.revision, input.expectedRevision + 1, `${kind}: exactly one sidecar revision`);
      assert.equal(after.actor.revision, input.expectedActorRevision + 1, `${kind}: exactly one actor revision`);
      assert.equal(after.source.revision, input.expectedSourceRevision, `${kind}: source remains immutable`);
      privateOnly(result);
      return result;
    };
    h.capture = async input => {
      let captured;
      await assert.rejects(() => h.run(input, { rpc: async (name, args) => {
        if (name === 'nmls_first_final_delivery_commit') { captured = structuredClone(args); throw Error('CAPTURE_ONLY'); }
        return rpc(name, args);
      } }), /CAPTURE_ONLY/);
      assert.ok(captured); return captured;
    };
    return h;
  }

  await t.test('activation, first acknowledgment, continuous final exposure and clean resume preserve original source and form', async () => {
    const h = await fixture(), before = await original(h), initial = await rows(h), input = await h.command('activate');
    assert.equal(input.sessionId, null); assert.equal(initial.lease.phase_kind, 'source'); assert.equal(initial.lease.phase_active, false);
    await db.exec('set role service_role'); let activated;
    try { activated = await h.run(input); } finally { await db.exec('reset role'); }
    privateOnly(activated); assert.equal(activated.body.deliveryAllowed, true);
    const first = (await original(h)).nmls_private_finals[0];
    assert.deepEqual(activated.body.questions, projectNmlsDraftFinal(definition, first.selection).questions);
    assert.equal(activated.body.questions.length, 25);
    let current = await rows(h);
    assert.notEqual(current.delivery.runtime.sessionId, initial.source.runtime.sessionId);
    assert.equal(current.lease.phase_kind, 'final'); assert.equal(current.lease.phase_owner_id, h.finalId);
    assert.equal(current.lease.phase_active, true);
    const atActivation = structuredClone(current.actor.ledger), activity = current.delivery.runtime.lastActivityMs;
    await pause(20); const acknowledged = await h.act('heartbeat'); privateOnly(acknowledged);
    current = await rows(h);
    assert.deepEqual(current.actor.ledger.studyIntervals, atActivation.studyIntervals, 'first acknowledgment is restriction-only');
    assert.equal(current.actor.ledger.studySinceBreakMs, atActivation.studySinceBreakMs);
    assert.equal(current.delivery.runtime.lastActivityMs, activity, 'automatic polling is not activity');
    await pause(20); await h.act('interaction', { visible: true });
    current = await rows(h); assert.ok(current.actor.ledger.studySinceBreakMs > atActivation.studySinceBreakMs);
    assert.ok(current.delivery.runtime.lastActivityMs > activity);
    const session = current.delivery.runtime.sessionId, window = current.actor.ledger.observationJournal.active.id;
    noMaterial(await h.act('pause')); current = await rows(h);
    assert.equal(current.actor.ledger.observationJournal.active, null); assert.equal(current.lease.phase_active, false);
    const resumed = await h.act('resume'); privateOnly(resumed); assert.equal(resumed.body.deliveryAllowed, true);
    current = await rows(h); assert.notEqual(current.delivery.runtime.sessionId, session);
    assert.notEqual(current.actor.ledger.observationJournal.active.id, window);
    assert.deepEqual(resumed.body.questions, activated.body.questions);
    assert.deepEqual(await original(h), before, 'no original review, form, source receipt or child changes');
  });

  await t.test('lost-response and historical replay never reevaluate, redraw, reproject or revert later state', async () => {
    const h = await fixture(), input = await h.command('activate'), made = await h.run(input);
    assert.equal(made.body.deliveryAllowed, true); await h.act('heartbeat'); await h.act('pause');
    const before = await snapshot(h.actor), replay = await h.run(input, { evaluate: () => { throw Error('MUST_NOT_EVALUATE'); } });
    privateOnly(replay); noMaterial(replay); assert.equal(replay.body.duplicate, true);
    assert.equal(replay.body.finalAttemptId, h.finalId); assert.deepEqual(await snapshot(h.actor), before);
    await assert.rejects(() => h.run({ ...input, kind: 'logout' }), /idempotency_conflict/);
    assert.deepEqual(await snapshot(h.actor), before);
    const reservationReplay = await transactNmlsFinalReservation(h.reservationCommand, h.actor, {
      ...deps, evaluate: () => { throw Error('MUST_NOT_EVALUATE'); }, draw: () => { throw Error('MUST_NOT_DRAW'); },
    });
    assert.equal(reservationReplay.body.duplicate, true); assert.equal(reservationReplay.body.finalAttemptId, h.finalId);
    assert.deepEqual(await snapshot(h.actor), before);
  });

  await t.test('preactivation controls and break denial preserve the dormant source lease without manufacturing a final session', async () => {
    const h = await fixture(), initial = await rows(h), source = await original(h);
    const started = await h.act('begin_break'); noMaterial(started);
    assert.equal(started.body.policyCode, 'break_started');
    let current = await rows(h);
    assert.equal(current.delivery.runtime.status, 'reserved'); assert.equal(current.delivery.runtime.sessionId, null);
    assert.deepEqual(current.lease, initial.lease);
    const blocked = await h.act('activate'); noMaterial(blocked); assert.equal(blocked.body.policyCode, 'break_in_progress');
    noMaterial(await h.act('logout')); current = await rows(h);
    assert.equal(current.delivery.runtime.status, 'reserved'); assert.equal(current.delivery.runtime.lastActivityMs, null);
    assert.deepEqual(current.lease, initial.lease);
    assert.equal(current.actor.ledger.observationJournal.active, null);
    assert.deepEqual(await original(h), source);
  });

  await t.test('final phase fences source, child and new reservations even after pause/logout; event namespaces cannot be reused', async () => {
    const h = await fixture();
    for (const eventId of [h.reservationCommand.eventId, h.priorSourceCommand.eventId]) {
      const before = await snapshot(h.actor);
      await assert.rejects(async () => h.run(await h.command('activate', { eventId })), /idempotency_conflict/);
      assert.deepEqual(await snapshot(h.actor), before);
    }
    const input = await h.command('activate'); await h.run(input); await h.act('heartbeat');
    for (const stop of ['pause', 'logout']) {
      noMaterial(await h.act(stop)); const before = await snapshot(h.actor), current = await rows(h);
      const source = { ...h.priorSourceCommand, eventId: randomUUID(), expectedRevision: current.source.revision,
        expectedSourceRevision: current.source.revision, expectedActorRevision: current.actor.revision };
      await assert.rejects(() => h.teach(source), /phase|session_conflict|final_delivery/);
      await assert.rejects(() => rpc('nmls_teaching_context', { p_student_id: h.actor, p_attempt_id: h.attemptId,
        p_phase_kind: 'remediation', p_phase_owner_id: h.finalId }), /phase|remediation|access_denied|first/);
      await assert.rejects(() => transactNmlsFinalReservation({ ...h.reservationCommand, eventId: randomUUID(),
        expectedSourceRevision: current.source.revision, expectedActorRevision: current.actor.revision }, h.actor, deps), /phase|already_issued|session_conflict/);
      await assert.rejects(() => h.teach({ ...source, eventId: input.eventId }), /idempotency_conflict|phase/);
      await assert.rejects(() => transactNmlsFinalReservation({ ...h.reservationCommand, eventId: input.eventId,
        expectedSourceRevision: current.source.revision, expectedActorRevision: current.actor.revision }, h.actor, deps), /idempotency_conflict/);
      assert.deepEqual(await snapshot(h.actor), before);
      if (stop === 'pause') { await h.act('resume'); await h.act('heartbeat'); }
    }
  });

  await t.test('stale source/sidecar/actor/final revisions, wrong actor/session and revoked authority cannot obtain material', async () => {
    const h = await fixture(), input = await h.command('activate'); await h.run(input);
    const before = await snapshot(h.actor);
    for (const patch of [{ expectedRevision: 0 }, { expectedSourceRevision: input.expectedSourceRevision - 1 },
      { expectedActorRevision: input.expectedActorRevision }, { expectedFinalRevision: 2 }, { sessionId: randomUUID() }]) {
      await assert.rejects(async () => h.run(await h.command('heartbeat', patch)), /revision|session_conflict|invalid_request/);
      assert.deepEqual(await snapshot(h.actor), before);
    }
    const foreign = randomUUID(); await db.query('insert into students values($1)', [foreign]);
    await assert.rejects(async () => transactNmlsFirstFinalDelivery(await h.command('heartbeat'), foreign, deps), /access_denied|scope/);
    await db.query("update nmls_review_access_grants set status='revoked' where id=$1", [h.grant]);
    const revoked = await snapshot(h.actor);
    await assert.rejects(() => h.run(input), /access_denied/); assert.deepEqual(await snapshot(h.actor), revoked);
  });

  await t.test('original ROCS actor and persisted presentation ownership are rechecked on commit and historical replay', async () => {
    const h = await fixture(), input = await h.command('activate'), captured = await h.capture(input);
    async function corruptedReceipt(field, check) {
      const originalLedger = (await rows(h)).actor.ledger, faulty = structuredClone(originalLedger);
      faulty.acceptances[0][field] = randomUUID();
      // Explicit owner-only corruption of an existing receipt is an adversarial
      // fixture fault, never an invented acceptance or supported writer path.
      await db.query('update nmls_review_actor_policy set ledger=$2 where student_id=$1', [h.actor, faulty]);
      try { const before = await snapshot(h.actor); await check(); assert.deepEqual(await snapshot(h.actor), before); }
      finally { await db.query('update nmls_review_actor_policy set ledger=$2 where student_id=$1', [h.actor, originalLedger]); }
    }
    for (const field of ['actorId', 'presentationId']) await corruptedReceipt(field,
      () => assert.rejects(() => rpc('nmls_first_final_delivery_commit', captured), /invalid_rocs_receipt/));
    await h.run(input); await h.act('heartbeat'); await h.act('pause');
    for (const field of ['actorId', 'presentationId']) await corruptedReceipt(field,
      () => assert.rejects(() => h.run(input, { evaluate: () => { throw Error('MUST_NOT_EVALUATE'); } }), /invalid_rocs_receipt/));
  });

  await t.test('sidecar, actor, final lease and event all roll back when any new write fails; exact retry works', async () => {
    for (const [table, event] of [['nmls_first_final_deliveries', 'after insert'],
      ['nmls_first_final_delivery_events', 'after insert'], ['nmls_review_study_leases', 'after update']]) {
      const h = await fixture(), input = await h.command('activate'), before = await snapshot(h.actor);
      await db.exec(`create function fail_first_final_delivery() returns trigger language plpgsql as $$ begin
        raise exception 'SYNTHETIC_FINAL_WRITE_FAILURE'; end $$;
        create trigger fail_first_final_delivery ${event} on ${table} for each row execute function fail_first_final_delivery();`);
      try { await assert.rejects(() => h.run(input), /SYNTHETIC_FINAL_WRITE_FAILURE/); assert.deepEqual(await snapshot(h.actor), before); }
      finally { await db.exec(`drop trigger fail_first_final_delivery on ${table}; drop function fail_first_final_delivery();`); }
      const retried = await h.run(input); assert.equal(retried.body.deliveryAllowed, true);
      assert.equal((await snapshot(h.actor)).nmls_first_final_delivery_events.length, 1);
      assert.equal((await rows(h)).actor.revision, before.nmls_review_actor_policy[0].revision + 1);
    }
  });

  await t.test('hidden receipt keeps original owned evidence and recovery imposes a fresh content-free pause', async () => {
    const h = await fixture(); await h.act('activate'); await h.act('heartbeat');
    const previous = await rows(h), oldWindow = structuredClone(previous.actor.ledger.observationJournal.active);
    const hidden = await h.act('interaction', { visible: false }); noMaterial(hidden);
    let current = await rows(h); assert.equal(current.delivery.runtime.status, 'paused');
    assert.deepEqual(current.actor.ledger.observationJournal.unresolved.window, oldWindow);
    assert.equal(current.actor.ledger.observationJournal.active, null);
    const before = await snapshot(h.actor);
    await assert.rejects(async () => h.run(await h.command('recover_observation', { recoveryWindowId: randomUUID() })), /recovery_window/);
    assert.deepEqual(await snapshot(h.actor), before);
    const study = current.actor.ledger.studySinceBreakMs, intervals = structuredClone(current.actor.ledger.studyIntervals);
    const recovered = await h.act('recover_observation', { recoveryWindowId: oldWindow.id }); noMaterial(recovered);
    assert.equal(recovered.body.code, 'observation_recovered'); current = await rows(h);
    assert.equal(current.actor.ledger.observationJournal.unresolved, null);
    assert.equal(current.actor.ledger.studySinceBreakMs, study); assert.deepEqual(current.actor.ledger.studyIntervals, intervals);
    assert.equal(recovered.body.resumeNotBeforeMs, current.actor.ledger.breakStartedAtMs + P.minimumBreakMs);
    assert.ok(current.actor.ledger.uncertainExposure.intervals.some(interval => interval.start <= oldWindow.lastObservedAtMs));
    noMaterial(await h.act('resume')); assert.equal((await rows(h)).actor.ledger.breakStartedAtMs, current.actor.ledger.breakStartedAtMs);
  });

  await t.test('response-time erosion suppresses questions even after a committed positive candidate', async () => {
    const h = await fixture(); let calls = 0;
    const result = await h.act('activate', {}, { monotonicMs: () => calls++ === 0 ? 0 : 100000 });
    noMaterial(result); privateOnly(result);
    const current = await rows(h); assert.equal(current.delivery.runtime.status, 'active');
    assert.ok(current.actor.ledger.observationJournal.active, 'committed outstanding evidence is not silently discarded');
  });

  await t.test('six-minute inactivity overrides a timely receipt and cannot be refreshed by an automatic poll', async () => {
    const h = await fixture(); await h.act('activate'); await h.act('heartbeat');
    const originalState = await original(h);
    // Explicit owner-only boundary fault: preserve the actual recent receipt
    // and final ownership, but move the activity clock to the idle threshold.
    // This tests the server guard, not six minutes of simulated attendance.
    await db.exec('alter table nmls_first_final_deliveries disable trigger nmls_first_final_delivery_scope_immutable');
    try {
      await db.query(`update nmls_first_final_deliveries set runtime=jsonb_set(runtime,'{lastActivityMs}',
        to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint-360000)) where final_id=$1`, [h.finalId]);
    } finally { await db.exec('alter table nmls_first_final_deliveries enable trigger nmls_first_final_delivery_scope_immutable'); }
    const before = await rows(h), stopped = await h.act('heartbeat');
    noMaterial(stopped); assert.equal(stopped.status, 401); assert.equal(stopped.body.code, 'inactivity_logout');
    const after = await rows(h);
    assert.equal(after.delivery.runtime.status, 'logged_out'); assert.equal(after.lease.phase_active, false);
    assert.equal(after.delivery.runtime.lastActivityMs, before.delivery.runtime.lastActivityMs);
    assert.equal(after.actor.ledger.observationJournal.active, null);
    assert.equal(after.delivery.revision, before.delivery.revision + 1);
    assert.equal(after.actor.revision, before.actor.revision + 1);
    assert.deepEqual(await original(h), originalState);
    const restored = await h.act('resume'); assert.equal(restored.body.deliveryAllowed, true);
    assert.notEqual(restored.body.sessionId, stopped.body.sessionId);
  });

  await t.test('direct joint RPC rejects malformed or foreign proposed state before any durable mutation', async () => {
    const h = await fixture(), input = await h.command('activate'), before = await snapshot(h.actor);
    // Bypass the adapter deliberately: the owner invokes the actual same
    // service RPC with corrupted candidates. No alternative writer is used.
    const corruptions = [
      args => { args.p_expected_source_revision = null; },
      args => { args.p_expected_final_revision = null; },
      args => { args.p_expected_delivery_revision = null; },
      args => { args.p_expected_actor_revision = null; },
      args => { args.p_evaluated_at_ms = null; },
      args => { args.p_command_digest = null; },
      args => { args.p_transition = null; },
      args => { args.p_transition.runtime = null; },
      args => { args.p_transition.runtime.status = null; },
      args => { args.p_transition.outcome.candidateMaterialAllowed = null; },
      args => { args.p_transition.ledger.revision += 1; },
      args => { args.p_transition.ledger.observationJournal.active.scope.finalPhase.actorId = randomUUID(); },
      args => { args.p_transition.ledger.observationJournal.active.materialDigest = '0'.repeat(64); },
      args => { args.p_transition.audit.eventId = randomUUID(); },
      args => { args.p_transition.command.eventId = randomUUID(); },
    ];
    for (const corrupt of corruptions) {
      const args = await h.capture(input); corrupt(args);
      await assert.rejects(() => rpc('nmls_first_final_delivery_commit', args), /nmls_/);
      assert.deepEqual(await snapshot(h.actor), before);
    }
    const accepted = await h.run(input); assert.equal(accepted.body.deliveryAllowed, true);
    assert.equal((await rows(h)).delivery.revision, 1);
  });

  await t.test('post-write grant, annual and wall-session boundaries roll back all tentative material authority', async () => {
    for (const boundary of ['grant', 'annual', 'session']) {
      const h = await fixture();
      // Owner-only short-deadline faults are installed BEFORE evaluation. The
      // subsequent SQL clock crosses them during an event insert, not by a
      // concurrent lock-bypassing grant edit or simulated human study.
      if (boundary === 'grant') await db.query("update nmls_review_access_grants set expires_at=clock_timestamp()+interval '600 milliseconds' where id=$1", [h.grant]);
      else if (boundary === 'annual') await db.query(`update nmls_review_policy_bindings set offering=jsonb_set(offering,'{closesAtMs}',
        to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint+600)) where grant_id=$1`, [h.grant]);
      else await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{sessionStartedAtMs}',
        to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint-43200000+600)) where student_id=$1`, [h.actor]);
      const input = await h.command('activate'), before = await snapshot(h.actor);
      await db.exec(`create function expire_first_final_delivery() returns trigger language plpgsql as $$ begin perform pg_sleep(0.7); return new; end $$;
        create trigger expire_first_final_delivery after insert on nmls_first_final_delivery_events for each row execute function expire_first_final_delivery();`);
      try { await assert.rejects(() => h.run(input, { clockRetries: 0 }), /access_denied|clock_refresh_required/); assert.deepEqual(await snapshot(h.actor), before); }
      finally { await db.exec('drop trigger expire_first_final_delivery on nmls_first_final_delivery_events; drop function expire_first_final_delivery();'); }
      if (boundary === 'grant') await assert.rejects(() => h.run(input), /access_denied/);
      else { const denied = await h.run(input); noMaterial(denied); assert.equal(denied.body.policyCode, boundary === 'annual' ? 'delivery_window_closed' : 'session_wall_limit'); }
    }
  });

  await t.test('post-write freshness failure rolls back; retry keeps the reserved question and option order', async () => {
    const h = await fixture(), input = await h.command('activate'), before = await snapshot(h.actor);
    await db.exec(`create function stale_first_final_delivery() returns trigger language plpgsql as $$ begin perform pg_sleep(1.1); return new; end $$;
      create trigger stale_first_final_delivery after insert on nmls_first_final_delivery_events for each row execute function stale_first_final_delivery();`);
    try { await assert.rejects(() => h.run(input, { clockRetries: 0 }), /clock_refresh_required/); assert.deepEqual(await snapshot(h.actor), before); }
    finally { await db.exec('drop trigger stale_first_final_delivery on nmls_first_final_delivery_events; drop function stale_first_final_delivery();'); }
    const result = await h.run(input); assert.equal(result.body.deliveryAllowed, true);
    assert.deepEqual(result.body.questions, projectNmlsDraftFinal(definition, before.nmls_private_finals[0].selection).questions);
    assert.deepEqual((await snapshot(h.actor)).nmls_private_finals, before.nmls_private_finals);
  });

  await t.test('browser roles cannot read/write history or invoke RPCs; service cannot bypass the joint writer', async () => {
    const h = await fixture(); await h.act('activate');
    for (const role of ['anon', 'authenticated', 'service_role']) {
      await db.exec(`set role ${role}`);
      try {
        for (const table of ['nmls_first_final_deliveries', 'nmls_first_final_delivery_events']) {
          await assert.rejects(() => db.query(`select * from ${table}`), /permission denied/);
          await assert.rejects(() => db.query(`delete from ${table}`), /permission denied/);
        }
      } finally { await db.exec('reset role'); }
      const functions = (await db.query(`select p.oid::regprocedure::text as signature,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        where n.nspname='public' and (p.proname like 'nmls_first_final_delivery_%' or p.proname='nmls_final_delivery_guard'
          or p.proname in ('nmls_teaching_pre_final_delivery_internal','nmls_final_reservation_pre_delivery_internal',
            'nmls_review_pre_final_delivery_fence_internal','nmls_review_legacy_write_fence','nmls_review_lease_phase_integrity'))`)).rows;
      assert.ok(functions.some(fn => fn.proname === 'nmls_first_final_delivery_commit'));
      for (const fn of functions) {
        const allowed = (await db.query("select has_function_privilege($1,$2,'execute') as allowed", [role, fn.signature])).rows[0].allowed;
        assert.equal(allowed, role === 'service_role' && ['nmls_first_final_delivery_context', 'nmls_first_final_delivery_commit'].includes(fn.proname), fn.signature);
      }
    }
    const before = await snapshot(h.actor);
    await assert.rejects(() => db.query('delete from nmls_first_final_delivery_events where student_id=$1', [h.actor]), /immutable/);
    assert.deepEqual(await snapshot(h.actor), before);
  });
});
