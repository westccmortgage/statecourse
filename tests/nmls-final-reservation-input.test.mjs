import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { validateNmlsFinalReservationInput, transactNmlsFinalReservation } from '../netlify/functions/_lib/nmls-final-reservation.mjs';
import { digestNmlsCommand } from '../netlify/functions/_lib/nmls-review-service.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { NMLS_POLICY_DIGEST } from '../netlify/functions/_lib/nmls-policy-transaction.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { startNmlsCourseReview } from '../lib/nmls-review-runtime.mjs';
import { startNmlsSessionPolicy } from '../lib/nmls-session-policy.mjs';
import { createNmlsObservedPolicyReviewEvaluator } from '../lib/nmls-study-observer.mjs';
import { makeNmlsSourceTeachingContext } from '../lib/nmls-teaching-phase.mjs';
import { defineNmlsDraftFinal, drawNmlsDraftFinal } from '../lib/nmls-final-assessment.mjs';

// Pure reducers with a synthetic clock and fake transport. NOT SQL, human
// timing, real ROCS/identity, approved education or an exposed final session.
const course = structuredClone(getNmlsReviewCourse('nmls-2026-f01-private-review'));
course.id = 'synthetic-final-reservation-input';
course.modules[0].units = [{ ...course.modules[0].units[0], requiredSeconds: 20 }];
delete course.digest; course.digest = createHash('sha256').update(JSON.stringify(course)).digest('hex');
const definition = defineNmlsDraftFinal(course, { id: 'synthetic-reservation-final', moduleQuotas: { F01: 25 },
  items: Array.from({ length: 50 }, (_, i) => ({ id: `N26-FIN-F${String(i + 1).padStart(2, '0')}`,
    category: 'federal', moduleId: 'F01', objective: 'Synthetic adapter fixture.', stem: `Synthetic ${i + 1}?`,
    options: ['A', 'B', 'C', 'D'].map(id => ({ id, text: `Synthetic choice ${id}.` })), correctChoice: 'A',
    rationale: 'Synthetic rationale.', distractorRationales: { B: 'Wrong.', C: 'Wrong.', D: 'Wrong.' },
    independenceNote: 'Engineering only.', sourceRefs: [{ url: 'https://www.consumerfinance.gov/rules-policy/regulations/',
      locator: 'Synthetic.', supports: 'No legal claim.', checkedOn: '2026-09-12' }],
    remediation: { unitIds: ['F01-U01'], focus: 'Synthetic practice.' },
  })) });

async function harness() {
  const actor = randomUUID(), grant = randomUUID(), attemptId = randomUUID(), actual = createNmlsObservedPolicyReviewEvaluator();
  const context = { attempt: { id: attemptId, student_id: actor, grant_id: grant, course_key: course.id,
    content_digest: course.digest, revision: 0, runtime: startNmlsCourseReview(course) },
    binding: { grant_id: grant, policy_id: P.id, policy_digest: NMLS_POLICY_DIGEST, offering: {
      id: grant, contentDigest: course.digest, year: 2026, educationType: 'annual_ce', timeZone: 'UTC',
      deadlineBasisId: 'SYNTHETIC-ONLY', opensAtMs: Date.UTC(2026, 0, 1), closesAtMs: Date.UTC(2027, 0, 1),
      rocs: { version: '4', documentDigest: 'c'.repeat(64), fullDocumentVerified: true, evidenceId: 'SYNTHETIC' },
    } }, actorPolicy: null, firstFinal: null, workflow: null, reservedFinal: null, reservation: null, teachingEvent: null,
    serverTimeMs: Date.UTC(2026, 5, 1, 12) };
  const calls = [], events = new Map(); let evaluations = 0, draws = 0;
  const h = { actor, context, calls, events, actual, contextHook: null, commitHook: null,
    get evaluations() { return evaluations; }, get draws() { return draws; },
    get ledger() { return context.actorPolicy?.ledger ?? startNmlsSessionPolicy(actor); },
    input(extra = {}) { return { kind: 'reserve_first_final', attemptId, eventId: randomUUID(),
      expectedSourceRevision: context.attempt.revision, expectedActorRevision: h.ledger.revision,
      expectedFinalRevision: 0, sessionId: context.attempt.runtime.sessionId, ...extra }; },
    install(runtime, ledger) { context.attempt.runtime = structuredClone(runtime); context.attempt.revision = runtime.revision;
      context.actorPolicy = { student_id: actor, policy_id: P.id, policy_digest: NMLS_POLICY_DIGEST, revision: ledger.revision, ledger: structuredClone(ledger) }; },
    async teach(kind, extra = {}) {
      context.serverTimeMs++;
      const teaching = makeNmlsSourceTeachingContext({ actorId: actor, review: context.attempt, binding: context.binding, sourceCourse: course });
      const command = { kind, attemptId, eventId: randomUUID(), expectedRevision: context.attempt.revision,
        expectedSourceRevision: context.attempt.revision, expectedWorkflowRevision: null, expectedActorRevision: h.ledger.revision,
        sessionId: context.attempt.runtime.sessionId,
        ...(h.ledger.observationJournal?.active ? { studyReceipt: { windowId: h.ledger.observationJournal.active.id, visible: true } } : {}), ...extra };
      const transition = await actual({ teachingPhase: teaching.teachingPhase, command, course, runtime: teaching.runtime,
        ledger: h.ledger, offering: context.binding.offering, evidence: { actorId: actor, receivedAtMs: context.serverTimeMs,
          presentation: kind === 'accept_rocs' ? { id: command.presentationId, actorId: actor, offeringId: grant,
            contentDigest: course.digest, documentDigest: 'c'.repeat(64), presentedAtMs: context.serverTimeMs } : null } });
      h.install(transition.runtime, transition.ledger); return transition.outcome;
    },
  };
  h.rpc = async (name, args) => {
    calls.push({ name, args: structuredClone(args) });
    if (name === 'nmls_final_reservation_context') {
      const value = structuredClone(context), old = events.get(args.p_event_id);
      value.reservation = old ? { event_id: args.p_event_id } : null;
      value.teachingEvent = old ? { event_id: args.p_event_id } : null;
      return h.contextHook ? h.contextHook(value) : value;
    }
    assert.equal(name, 'nmls_final_reservation_commit');
    if (h.commitHook) await h.commitHook(args);
    const old = events.get(args.p_event_id);
    if (old) {
      assert.equal(old.digest, args.p_command_digest, 'synthetic event conflict');
      return { duplicate: true, outcome: structuredClone(old.outcome) };
    }
    if (args.p_expected_source_revision !== context.attempt.revision || args.p_expected_actor_revision !== h.ledger.revision) throw Error('synthetic_revision_conflict');
    if (args.p_expected_session_id !== context.attempt.runtime.sessionId) throw Error('synthetic_session_conflict');
    if (context.reservedFinal) throw Error('synthetic_already_issued');
    if (!args.p_transition.runtime) throw Error('synthetic_history_conflict');
    const reserved = args.p_final_id !== null;
    h.install(args.p_transition.runtime, args.p_transition.ledger);
    if (reserved) context.reservedFinal = { id: args.p_final_id, review_attempt_id: attemptId, student_id: actor,
      course_key: course.id, content_digest: course.digest, definition_digest: definition.digest, revision: 1, selection: args.p_selection };
    const outcome = { ok: reserved, code: reserved ? 'private_final_reserved' : args.p_transition.outcome.code,
      status: reserved ? 200 : 409, reserved, finalAttemptId: args.p_final_id, finalRevision: reserved ? 1 : null,
      sourceRevision: context.attempt.revision, actorRevision: h.ledger.revision, mode: 'private_authoring_review',
      studentDeliveryEnabled: false, creditIssuanceAllowed: false };
    events.set(args.p_event_id, { digest: args.p_command_digest, outcome: structuredClone(outcome) });
    return { duplicate: false, outcome };
  };
  h.options = { rpc: h.rpc, courseFor: () => course, definitionFor: () => definition,
    evaluate: value => { evaluations++; return actual(value); },
    draw: (d, c) => { draws++; return drawNmlsDraftFinal(d, c, { draw: () => 0 }); } };
  h.run = (command = h.input(), options = {}) => transactNmlsFinalReservation(command, actor, { ...h.options, ...options });
  await h.teach('resume');
  await h.teach('accept_rocs', { presentationId: randomUUID(), version: '4', documentDigest: 'c'.repeat(64), acknowledged: true });
  await h.teach('resume'); await h.teach('open_unit', { unitId: 'F01-U01' });
  await h.teach('interaction', { observation: 'keyboard', visible: true }); context.serverTimeMs += 20000;
  await h.teach('heartbeat', { visible: true }); await h.teach('unit_action', { choice: course.modules[0].units[0].actionQuestion.correctChoice });
  await h.teach('complete_unit'); await h.teach('quiz_start', { moduleId: 'F01' });
  const quiz = context.attempt.runtime.quiz;
  assert.equal((await h.teach('quiz_submit', { quizId: quiz.id, answers: Object.fromEntries(quiz.questionIds.map(id =>
    [id, course.modules[0].quiz.bank.find(q => q.id === id).correctChoice])) })).ok, true);
  assert.equal(context.attempt.runtime.status, 'review_complete'); return h;
}

test('reservation intent excludes clocks, activity, answer/selection and caller authority', async () => {
  const h = await harness(), valid = h.input(); assert.equal(validateNmlsFinalReservationInput(valid), valid);
  for (const key of Object.keys(valid)) { const missing = { ...valid }; delete missing[key]; assert.throws(() => validateNmlsFinalReservationInput(missing)); }
  for (const extra of [{ kind: 'issue' }, { expectedSourceRevision: -1 }, { expectedActorRevision: null }, { expectedActorRevision: 1.5 },
    { expectedFinalRevision: 1 }, { sessionId: null }, { attemptId: {} }, { eventId: 'bad' }, { phaseKind: 'final' },
    { answers: {} }, { selection: {} }, { finalId: randomUUID() }, { receivedAtMs: 1 }, { actorId: h.actor },
    { studyReceipt: {} }, { ledger: {} }, { source: {} }, { deliveryUntilMs: 1 }, { bypass: true }]) {
    assert.throws(() => validateNmlsFinalReservationInput({ ...valid, ...extra }));
  }
  await assert.rejects(h.run(valid, { clockRetries: 2 }), /invalid_dependencies/);
});

test('actual completed check reserves privately without activity, observed time or material', async () => {
  const h = await harness(), before = structuredClone(h.context), command = h.input(), result = await h.run(command);
  assert.equal(result.body.reserved, true); assert.equal(result.body.studentDeliveryEnabled, false);
  assert.equal(h.evaluations, 1); assert.equal(h.draws, 1);
  const args = h.calls.at(-1).args;
  assert.equal(args.p_transition.audit.review.kind, 'check_access'); assert.equal(args.p_command_digest, digestNmlsCommand(command));
  assert.equal(args.p_transition.outcome.code, 'review_policy_checked');
  assert.equal(Object.hasOwn(args.p_transition.outcome, 'resumeNotBeforeMs'), false);
  assert.equal(h.context.attempt.runtime.lastActivityMs, before.attempt.runtime.lastActivityMs);
  assert.equal(h.context.attempt.runtime.sessionId, before.attempt.runtime.sessionId);
  assert.equal(h.context.attempt.runtime.completedReviewMs, 20000);
  assert.deepEqual(h.ledger.studyIntervals, before.actorPolicy.ledger.studyIntervals);
  assert.deepEqual(h.ledger.uncertainExposure.intervals, before.actorPolicy.ledger.uncertainExposure.intervals);
  for (const key of ['questions', 'selection', 'answers', 'grade', 'result', 'progress', 'ledger', 'runtime', 'audit', 'studyWindow', 'deliveryUntilMs']) {
    assert.equal(Object.hasOwn(result.body, key), false);
  }
});

test('break, wall and annual denials use actual checks and draw nothing', async () => {
  for (const cause of ['break', 'wall', 'annual']) {
    const h = await harness();
    if (cause === 'break') await h.teach('begin_break');
    if (cause === 'wall') h.context.serverTimeMs += P.sessionWallLimitMs;
    if (cause === 'annual') h.context.serverTimeMs = Date.UTC(2027, 0, 1);
    const r = await h.run(); assert.equal(r.body.reserved, false); assert.equal(h.draws, 0);
    assert.equal(r.body.code, { break: 'break_in_progress', wall: 'session_wall_limit', annual: 'delivery_window_closed' }[cause]);
    assert.equal(r.body.finalAttemptId, null); assert.equal(h.context.reservedFinal, null);
  }
});

test('completed source older than six minutes is not a new session or idle activity', async () => {
  const h = await harness(), activity = h.context.attempt.runtime.lastActivityMs;
  h.context.serverTimeMs += 360001;
  assert.equal((await h.run()).body.reserved, true);
  assert.equal(h.context.attempt.runtime.lastActivityMs, activity);
});

test('replay and every stale selector skip reduction and draw', async () => {
  const h = await harness(), command = h.input(), first = await h.run(command);
  await h.teach('check_access'); const runtime = structuredClone(h.context.attempt.runtime);
  const replay = await h.run(command); assert.equal(replay.body.duplicate, true);
  assert.equal(replay.body.finalAttemptId, first.body.finalAttemptId); assert.equal(h.draws, 1); assert.equal(h.evaluations, 1);
  assert.deepEqual(h.context.attempt.runtime, runtime); assert.deepEqual(h.calls.at(-1).args.p_transition, {});
  for (const key of ['expectedSourceRevision', 'expectedActorRevision', 'sessionId']) {
    const x = await harness(), stale = x.input({ [key]: key === 'sessionId' ? randomUUID() : 999 });
    await assert.rejects(x.run(stale), /conflict/); assert.equal(x.draws, 0); assert.equal(x.evaluations, 0);
  }
});

test('context, source, definition and current history drift stop before evaluation', async () => {
  for (const mutate of [c => c.attempt.id = randomUUID(), c => c.attempt.student_id = randomUUID(),
    c => c.binding.policy_digest = 'f'.repeat(64), c => c.binding.offering.rocs.fullDocumentVerified = false,
    c => c.attempt.runtime.completedReviewMs++, c => c.firstFinal = {}, c => delete c.reservation,
    c => c.reservedFinal = { student_id: randomUUID() }, c => c.actorPolicy.ledger.actorId = randomUUID()]) {
    const h = await harness(); h.contextHook = c => { mutate(c); return c; };
    await assert.rejects(h.run()); assert.equal(h.evaluations, 0); assert.equal(h.draws, 0);
    assert.equal(h.calls.some(c => c.name === 'nmls_final_reservation_commit'), false);
  }
  const h = await harness(), edited = structuredClone(course); edited.title = 'Changed without new digest';
  await assert.rejects(h.run(undefined, { courseFor: () => edited }), /source_changed/);
  await assert.rejects(h.run(undefined, { definitionFor: () => ({ ...definition, sourcePayloadDigest: 'f'.repeat(64) }) }), /content_changed/);
});

test('invalid proposed transition, material projection and private-bank selection never commit', async () => {
  for (const mutate of [r => r.runtime.lastActivityMs++, r => r.runtime.completedReviewMs++, r => r.ledger.studySinceBreakMs++,
    r => r.ledger.actorId = randomUUID(), r => r.outcome.privateKeys = [], r => r.outcome.deliveryAllowed = true,
    r => r.outcome.progress.lessons = [{ id: 'F01-U01' }], r => r.outcome.resumeNotBeforeMs = 'tomorrow']) {
    const h = await harness();
    await assert.rejects(h.run(undefined, { evaluate: async c => { const r = await h.actual(c); mutate(r); return r; } }));
    assert.equal(h.calls.some(c => c.name === 'nmls_final_reservation_commit'), false);
  }
  const h = await harness();
  await assert.rejects(h.run(undefined, { draw: (d, c) => {
    const r = structuredClone(drawNmlsDraftFinal(d, c)); r.questionIds[0] = 'N26-FIN-G99'; return r;
  } }));
  assert.equal(h.calls.some(c => c.name === 'nmls_final_reservation_commit'), false);
});

test('one clock refresh preserves immutable user intent and tentative form; other errors do not retry', async () => {
  const h = await harness(), command = h.input(), digest = digestNmlsCommand(command); let count = 0;
  h.contextHook = c => { command.eventId = randomUUID(); command.expectedActorRevision = 999; return c; };
  h.commitHook = () => { if (count++ === 0) { h.context.serverTimeMs++; throw Error('nmls_final_clock_refresh_required'); } };
  await h.run(command); const commits = h.calls.filter(c => c.name.endsWith('_commit')).map(c => c.args);
  assert.equal(commits.length, 2); assert.equal(h.evaluations, 2); assert.equal(h.draws, 1);
  assert.ok(commits.every(c => c.p_command_digest === digest)); assert.deepEqual(commits[0].p_selection, commits[1].p_selection);
  assert.equal(commits[0].p_event_id, commits[1].p_event_id);
  for (const message of ['nmls_final_clock_refresh_required', 'network unavailable']) {
    const x = await harness(); x.commitHook = () => { throw Error(message); };
    await assert.rejects(x.run()); assert.equal(x.calls.filter(c => c.name.endsWith('_commit')).length, message.includes('clock') ? 2 : 1);
  }
});

test('unexpected commit fields, credit or delivery cannot leak through the response', async () => {
  for (const mutate of [r => r.outcome.questions = [], r => r.outcome.creditIssuanceAllowed = true,
    r => r.outcome.studentDeliveryEnabled = true, r => r.outcome.actorRevision++, r => r.selection = {}]) {
    const h = await harness();
    await assert.rejects(h.run(undefined, { rpc: async (name, args) => { const r = await h.rpc(name, args); if (name.endsWith('_commit')) mutate(r); return r; } }), /invalid_commit_response/);
  }
});
