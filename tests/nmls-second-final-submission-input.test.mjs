import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeSecondFinalDeliveryFixture } from './helpers/nmls-second-final-delivery-fixture.mjs';
import { makeNmlsSecondFinalDeliveryContext, nmlsSecondFinalDeliveryScope,
  createNmlsSecondFinalDeliveryEvaluator, startNmlsSecondFinalDelivery } from '../lib/nmls-second-final-delivery.mjs';
import { createNmlsSecondFinalSubmissionEvaluator } from '../lib/nmls-second-final-submission.mjs';
import { digestNmlsCommand as hash } from '../netlify/functions/_lib/nmls-review-service.mjs';
import { transactNmlsSecondFinalSubmission, validateNmlsSecondFinalSubmissionInput } from '../netlify/functions/_lib/nmls-second-final-submission.mjs';

// Genuine pure source/first/child/reservation/second reducers with synthetic
// authority, clocks and fake RPC039/040 envelopes. Not SQL, identity, learner
// timing, irreversible submission, browser delivery or CE credit evidence.
const clone = structuredClone;
async function harness({ acknowledge = true } = {}) {
  const f = await makeSecondFinalDeliveryFixture(), i = f.input;
  const context = { attempt: clone(i.review), binding: clone(i.binding), actorPolicy: clone(i.actorPolicy),
    reservedFinal: clone(i.firstFinal), workflow: clone(i.workflow), lease: clone(i.lease), delivery: clone(i.delivery),
    genesisEvent: clone(i.submissionEvent), genesisDeliveryEvent: clone(i.deliveryEvent), reservation: clone(i.reservation),
    teachingEvent: clone(i.teachingEvent), handoffOrigin: clone(i.handoffOrigin), handoffOriginTeachingEvent: clone(i.handoffOriginTeachingEvent),
    terminalChildEvent: clone(i.terminalChildEvent), latestChildEvent: clone(i.latestChildEvent), childBinding: clone(i.childBinding),
    secondReservationOrigin: clone(i.secondReservationEvent), secondReservationOriginTeachingEvent: clone(i.secondReservationTeachingEvent),
    secondDelivery: null, secondDeliveryEvent: null, secondSubmissionEvent: null, serverTimeMs: f.timeMs };
  const events = new Map(), deliveryOnly = new Map(), calls = []; let evaluations = 0;
  const branded = () => makeNmlsSecondFinalDeliveryContext({ ...i, review: context.attempt, binding: context.binding,
    firstFinal: context.reservedFinal, workflow: context.workflow, actorPolicy: context.actorPolicy, lease: context.lease });
  const h = { f, context, events, deliveryOnly, calls, contextHook: null, commitHook: null, resultHook: null,
    get evaluations() { return evaluations; },
    answers(correct = 25) { return Object.fromEntries(context.workflow.second_selection.questionIds.map((id, n) => {
      const answer = i.definition.items.find(q => q.id === id).correctChoice;
      return [id, n < correct ? answer : ['A', 'B', 'C', 'D'].find(choice => choice !== answer)];
    })); },
    input(extra = {}) { return { kind: 'submit_second_final', attemptId: i.review.id, firstFinalId: i.firstFinal.id,
      secondFinalId: i.workflow.second_id, eventId: randomUUID(), expectedSourceRevision: context.attempt.revision,
      expectedFinalRevision: 2, expectedWorkflowRevision: context.workflow.revision, expectedRevision: context.secondDelivery?.revision ?? 0,
      expectedActorRevision: context.actorPolicy.revision, sessionId: context.secondDelivery?.runtime.sessionId ?? null, answers: h.answers(),
      ...(context.actorPolicy.ledger.observationJournal.active ? { studyReceipt: {
        windowId: context.actorPolicy.ledger.observationJournal.active.id, visible: true } } : {}), ...extra }; },
    act(kind, extra = {}, at = context.serverTimeMs + 1) {
      const c = branded(), ledger = context.actorPolicy.ledger, runtime = context.secondDelivery?.runtime ?? startNmlsSecondFinalDelivery(c.finalPhase);
      const command = { kind, eventId: randomUUID(), expectedRevision: runtime.revision, expectedActorRevision: ledger.revision,
        sessionId: runtime.sessionId, ...(ledger.observationJournal.active ? { studyReceipt: {
          windowId: ledger.observationJournal.active.id, visible: true } } : {}), ...extra };
      const r = createNmlsSecondFinalDeliveryEvaluator()({ ...c, runtime, ledger, command, evidence: { actorId: i.actorId, receivedAtMs: at } });
      context.secondDelivery = { second_id: i.workflow.second_id, first_final_id: i.firstFinal.id, student_id: i.actorId,
        review_attempt_id: i.review.id, phase_scope: clone(nmlsSecondFinalDeliveryScope(c.finalPhase)), revision: r.runtime.revision, runtime: r.runtime };
      context.actorPolicy.revision = r.ledger.revision; context.actorPolicy.ledger = r.ledger;
      context.lease = { student_id: i.actorId, attempt_id: i.review.id, phase_kind: 'second_final', phase_owner_id: i.workflow.second_id,
        phase_active: r.runtime.status === 'active', session_id: r.runtime.sessionId };
      context.serverTimeMs = at; return r;
    },
  };
  h.act('activate'); if (acknowledge) h.act('heartbeat'); context.serverTimeMs++;
  h.rpc = async (name, args) => {
    calls.push({ name, args: clone(args) });
    if (name === 'nmls_second_final_submission_context') {
      const saved = events.get(args.p_event_id), c = clone(context);
      c.secondSubmissionEvent = clone(saved?.submissionEvent ?? null);
      c.secondDeliveryEvent = clone(saved?.deliveryEvent ?? deliveryOnly.get(args.p_event_id) ?? null);
      return h.contextHook ? h.contextHook(c, args) : c;
    }
    assert.equal(name, 'nmls_second_final_submission_commit');
    if (h.commitHook) await h.commitHook(args);
    const saved = events.get(args.p_event_id);
    if (saved) {
      if (saved.submissionEvent.command_digest !== args.p_command_digest) throw Error('synthetic_idempotency_conflict');
      const r = { duplicate: true, outcome: clone(saved.submissionEvent.outcome) }; return h.resultHook ? h.resultHook(r) : r;
    }
    if (deliveryOnly.has(args.p_event_id)) throw Error('synthetic_event_pair_conflict');
    if (args.p_expected_source_revision !== context.attempt.revision || args.p_expected_final_revision !== 2 ||
        args.p_expected_workflow_revision !== context.workflow.revision || args.p_expected_delivery_revision !== context.secondDelivery.revision ||
        args.p_expected_actor_revision !== context.actorPolicy.revision) throw Error('synthetic_revision_conflict');
    if (args.p_expected_session_id !== context.secondDelivery.runtime.sessionId) throw Error('synthetic_session_conflict');
    if (context.workflow.status !== 'second_issued') throw Error('synthetic_already_sealed');
    assert.equal(args.p_command_digest, hash(args.p_intent));
    const t = clone(args.p_transition), s = t.submission, beforeLease = clone(context.lease), beforeRuntime = clone(context.secondDelivery.runtime);
    const workflowBefore = context.workflow.revision, recordedAt = new Date(context.serverTimeMs).toISOString(), tx = 101 + events.size;
    const deliveryIntent = { ...t.command, attemptId: i.review.id, firstFinalId: i.firstFinal.id, secondFinalId: i.workflow.second_id,
      expectedSourceRevision: context.attempt.revision, expectedFinalRevision: 2, expectedWorkflowRevision: workflowBefore };
    const deliveryDigest = hash(deliveryIntent);
    context.secondDelivery = { ...context.secondDelivery, revision: t.runtime.revision, runtime: clone(t.runtime) };
    context.actorPolicy.revision = t.ledger.revision; context.actorPolicy.ledger = clone(t.ledger);
    context.lease = { ...beforeLease, phase_active: false };
    if (s.submitted) Object.assign(context.workflow, { revision: workflowBefore + 1, status: s.terminalStatus,
      second_answers: clone(s.answers), second_result: clone(s.result), second_submitted_at: recordedAt });
    const outcome = { ok: s.submitted, code: s.submitted ? 'private_second_final_submitted' : 'private_second_final_submission_refused',
      status: s.submitted ? 200 : t.outcome.status === 401 ? 401 : 409, submitted: s.submitted,
      firstFinalId: i.firstFinal.id, secondFinalId: i.workflow.second_id, sourceRevision: context.attempt.revision, finalRevision: 2,
      workflowRevision: context.workflow.revision, runtimeRevision: t.runtime.revision, actorRevision: t.ledger.revision,
      sessionId: t.runtime.sessionId, submissionCode: s.code, deliveryCode: t.outcome.code, policyCode: t.outcome.policyCode,
      observationCode: t.outcome.observationCode, result: clone(s.result), workflowStatus: context.workflow.status,
      mode: 'private_authoring_review', deliveryAllowed: false, studentDeliveryEnabled: false, creditIssuanceAllowed: false, retakeEnabled: false };
    const common = { student_id: i.actorId, event_id: args.p_event_id, first_final_id: i.firstFinal.id, second_id: i.workflow.second_id,
      review_attempt_id: i.review.id, reservation_event_id: i.secondReservationEvent.event_id, definition_digest: i.definition.digest,
      source_revision: context.attempt.revision, final_revision: 2, delivery_revision: t.runtime.revision,
      actor_revision: t.ledger.revision, transaction_id: tx, recorded_at: recordedAt };
    const deliveryEvent = { ...common, command_digest: deliveryDigest, workflow_revision: workflowBefore, command: clone(t.command),
      runtime_before: beforeRuntime, runtime: clone(t.runtime), lease_before: beforeLease, lease_after: clone(context.lease),
      audit: clone(t.audit), outcome: { ...clone(t.outcome), candidateMaterialAllowed: false, candidateUntilMs: null, candidateWindow: null } };
    const submissionEvent = { ...common, command_digest: args.p_command_digest, delivery_command_digest: deliveryDigest,
      workflow_before_revision: workflowBefore, workflow_revision: context.workflow.revision, session_id: t.runtime.sessionId,
      submitted: s.submitted, submission_payload_digest: hash(s), outcome: clone(outcome) };
    events.set(args.p_event_id, { deliveryEvent, submissionEvent });
    const r = { duplicate: false, outcome }; return h.resultHook ? h.resultHook(r) : r;
  };
  h.deps = { rpc: h.rpc, courseFor: () => clone(i.sourceCourse), definitionFor: () => clone(i.definition),
    evaluate: c => { evaluations++; return createNmlsSecondFinalSubmissionEvaluator()(c); } };
  h.run = (input = h.input(), overrides = {}, actorId = i.actorId) => transactNmlsSecondFinalSubmission(input, actorId, { ...h.deps, ...overrides });
  return h;
}
function noLeak(r) {
  for (const k of ['questions', 'answers', 'selection', 'definition', 'audit', 'ledger', 'runtime', 'childRuntime', 'sourceCourse', 'candidateUntilMs', 'manifest']) {
    assert.equal(Object.hasOwn(r.body, k), false, k);
  }
  for (const k of ['deliveryAllowed', 'studentDeliveryEnabled', 'creditIssuanceAllowed', 'retakeEnabled']) assert.equal(r.body[k], false);
  assert.doesNotMatch(JSON.stringify(r.body), /correctChoice|optionOrder|questionIds/);
}

test('strict second submission intent rejects injected authority, state, timing and malformed answer maps', async () => {
  const h = await harness(), valid = h.input(); assert.equal(validateNmlsSecondFinalSubmissionInput(valid), valid);
  for (const patch of [{ kind: 'pause' }, { actorId: randomUUID() }, { expectedFinalRevision: 1 }, { expectedWorkflowRevision: 0 },
    { secondFinalId: valid.firstFinalId }, { expectedRevision: -1 }, { sessionId: 'bad' }, { answers: null }, { answers: [] },
    { result: {} }, { ledger: {} }, { phase: {} }, { selection: {} }, { sourceCourse: {} }, { receivedAtMs: 0 }, { submission: {} }]) {
    assert.throws(() => validateNmlsSecondFinalSubmissionInput({ ...valid, ...patch }));
  }
  const bad = clone(valid); delete bad.answers[Object.keys(bad.answers)[0]];
  assert.throws(() => validateNmlsSecondFinalSubmissionInput(bad));
  await assert.rejects(h.run(valid, {}, 'invalid')); assert.equal(h.calls.length, 0);
});

test('eligible pass/failure expose only committed aggregate and terminal status without another child', async () => {
  for (const correct of [17, 18]) {
    const h = await harness(), input = h.input({ answers: h.answers(correct) }), before = clone(h.f.input);
    const r = await h.run(input); noLeak(r); assert.equal(r.body.submitted, true); assert.equal(r.body.result.correct, correct);
    assert.equal(r.body.workflowStatus, correct === 18 ? 'passed' : 'staff_review_required');
    assert.equal(r.body.workflowRevision, input.expectedWorkflowRevision + 1); assert.equal(r.body.finalRevision, 2);
    assert.deepEqual(h.f.input, before); assert.deepEqual(h.context.reservedFinal, before.firstFinal);
    assert.deepEqual(h.context.workflow.runtime, before.workflow.runtime); assert.deepEqual(h.context.workflow.second_selection, before.workflow.second_selection);
    const commit = h.calls.at(-1).args; assert.deepEqual(commit.p_intent, input); assert.equal(commit.p_command_digest, hash(input));
    assert.equal(commit.p_transition.command.kind, 'pause'); assert.equal(Object.hasOwn(commit.p_transition.command, 'answers'), false);
    assert.deepEqual(Object.keys(commit.p_transition.submission).sort(), ['answers', 'code', 'result', 'submitted', 'terminalStatus']);
  }
});

test('unacknowledged first receipt retains real close but stores no second answers or tentative grade', async () => {
  const h = await harness({ acknowledge: false }), before = clone(h.context.workflow), r = await h.run(); noLeak(r);
  assert.equal(r.body.submitted, false); assert.equal(r.body.result, null); assert.equal(r.body.workflowStatus, 'second_issued');
  assert.deepEqual(h.context.workflow, before);
  assert.deepEqual(h.calls.at(-1).args.p_transition.submission, { submitted: false, code: 'second_final_policy_refused',
    answers: null, result: null, terminalStatus: null });
});

test('sealed pass and second failure replay exact paired result without reevaluation or a third attempt', async () => {
  for (const correct of [0, 25]) {
    const h = await harness(), input = h.input({ answers: h.answers(correct) }), first = await h.run(input), before = clone(h.context);
    const r = await h.run(input, { evaluate: () => { throw Error('MUST_NOT_REGRADE'); } }); noLeak(r);
    assert.equal(r.body.duplicate, true); assert.deepEqual(r.body.result, first.body.result); assert.deepEqual(h.context, before);
    assert.deepEqual(h.calls.at(-1).args.p_transition, {});
    await assert.rejects(h.run(h.input()), /already_sealed/); assert.equal(h.evaluations, 1);
    const changed = clone(input), id = Object.keys(changed.answers)[0]; changed.answers[id] = changed.answers[id] === 'A' ? 'B' : 'A';
    await assert.rejects(h.run(changed, { evaluate: () => { throw Error('MUST_NOT_REGRADE'); } }), /idempotency_conflict/);
  }
});

test('old denied receipt stays denied after later successful seal without returning later answers/grade', async () => {
  const h = await harness({ acknowledge: false }), old = h.input(); await h.run(old);
  h.act('resume'); h.act('heartbeat'); h.context.serverTimeMs++; assert.equal((await h.run()).body.submitted, true);
  const before = clone(h.context), count = h.evaluations, r = await h.run(old); noLeak(r);
  assert.equal(r.body.duplicate, true); assert.equal(r.body.submitted, false); assert.equal(r.body.result, null);
  assert.deepEqual(h.context, before); assert.equal(h.evaluations, count);
});

test('stale selectors and039-only collision never evaluate, append a040 receipt or grade', async () => {
  for (const patch of [{ expectedSourceRevision: 999 }, { expectedWorkflowRevision: 999 }, { expectedRevision: 999 },
    { expectedActorRevision: 999 }, { sessionId: randomUUID() }]) {
    const h = await harness(); await assert.rejects(h.run(h.input(patch)), /synthetic_.*conflict/);
    assert.equal(h.evaluations, 0); assert.deepEqual(h.calls.at(-1).args.p_transition, {});
  }
  const h = await harness({ acknowledge: false }), input = h.input(); await h.run(input);
  h.deliveryOnly.set(input.eventId, clone(h.events.get(input.eventId).deliveryEvent)); h.events.delete(input.eventId);
  const count = h.evaluations; await assert.rejects(h.run(input), /event_pair_conflict/); assert.equal(h.evaluations, count);
});

test('unselected first-form answer IDs and changed original histories fail before commit', async () => {
  const h = await harness(), input = h.input(); delete input.answers[Object.keys(input.answers)[0]];
  input.answers[h.f.input.firstFinal.selection.questionIds[0]] = 'A';
  assert.equal(validateNmlsSecondFinalSubmissionInput(input), input); await assert.rejects(h.run(input), /invalid_answers/);
  assert.equal(h.calls.some(c => c.name.endsWith('_commit')), false);
  for (const mutate of [c => c.secondReservationOrigin = null, c => c.terminalChildEvent = null,
    c => c.reservedFinal.result.passed = true, c => c.actorPolicy.revision--,
    c => c.workflow.second_selection.questionIds.reverse(), c => c.secondDelivery.phase_scope.firstFinalAttemptId = randomUUID()]) {
    const x = await harness(); x.contextHook = c => { mutate(c); return c; };
    await assert.rejects(x.run()); assert.equal(x.calls.some(c => c.name.endsWith('_commit')), false);
  }
});

test('answers and selector snapshots survive awaited context and RPC argument mutation', async () => {
  const h = await harness(), input = h.input({ answers: h.answers(17) }), before = clone(input);
  h.contextHook = (c, args) => { input.answers[Object.keys(input.answers)[0]] = 'D'; input.eventId = randomUUID();
    input.studyReceipt.visible = false; args.p_attempt_id = randomUUID(); args.p_event_id = randomUUID(); return c; };
  const r = await h.run(input); assert.equal(r.body.result.correct, 17);
  const commit = h.calls.at(-1).args; assert.deepEqual(commit.p_intent, before); assert.equal(commit.p_command_digest, hash(before));
  assert.equal(commit.p_event_id, before.eventId); assert.equal(commit.p_attempt_id, before.attemptId);
});

test('mutated proposals or commit callback cannot replace grade, terminal state, actor accounting or close', async () => {
  for (const mutate of [p => p.submission.result.correct--, p => p.submission.terminalStatus = 'remediating',
    p => p.submission.childRuntime = {}, p => p.closing.ledger.studySinceBreakMs = 0,
    p => p.closing.audit.kind = 'activate', p => p.closing.outcome.candidateMaterialAllowed = true]) {
    const h = await harness(); await assert.rejects(h.run(h.input(), { evaluate: c => { const p = createNmlsSecondFinalSubmissionEvaluator()(c); mutate(p); return p; } }), /invalid_transition/);
    assert.equal(h.calls.some(c => c.name.endsWith('_commit')), false);
  }
  const h = await harness(); h.commitHook = args => { args.p_transition.submission.result = { ...args.p_transition.submission.result, correct: 0 }; };
  await assert.rejects(h.run(), /invalid_outcome|invalid_commit_response/);
});

test('no result is exposed on failed commit, clock retries are bounded and preserve exact intent', async () => {
  for (const reason of ['synthetic_access_denied', 'nmls_review_clock_refresh_required']) {
    const h = await harness(); let count = 0; h.commitHook = () => { count++; throw Error(reason); };
    await assert.rejects(h.run(), new RegExp(reason)); assert.equal(count, reason.includes('clock') ? 2 : 1);
    assert.equal(h.events.size, 0); assert.equal(h.context.workflow.second_answers, null);
  }
  const h = await harness(), input = h.input(); let count = 0;
  h.commitHook = () => { if (++count === 1) { h.context.serverTimeMs += 10; throw Error('nmls_review_clock_refresh_required'); } };
  assert.equal((await h.run(input)).body.submitted, true); assert.equal(count, 2);
  assert.equal(new Set(h.calls.filter(c => c.name.endsWith('_commit')).map(c => c.args.p_command_digest)).size, 1);
});

test('closed result vocabulary and response identity reject leaked or uncommitted grades', async () => {
  for (const mutate of [r => r.questions = [], r => r.outcome.answers = {}, r => r.outcome.creditIssuanceAllowed = true,
    r => r.outcome.result.correct--, r => r.outcome.workflowRevision++, r => r.outcome.actorRevision++,
    r => r.outcome.secondFinalId = randomUUID(), r => r.outcome.policyCode = 'PRIVATE KEY', r => r.duplicate = null]) {
    const h = await harness(); h.resultHook = r => { mutate(r); return r; };
    await assert.rejects(h.run(), /invalid_outcome|invalid_commit_response/);
  }
});

test('replay validates both immutable hashes/transactions and actual sealed answers/result', async () => {
  for (const mutate of [c => c.secondSubmissionEvent.submission_payload_digest = '0'.repeat(64),
    c => c.secondSubmissionEvent.delivery_command_digest = '0'.repeat(64), c => c.secondDeliveryEvent.transaction_id++,
    c => c.secondDeliveryEvent.audit.phase.finalAttemptId = randomUUID(), c => c.secondDeliveryEvent.runtime.sessionId = randomUUID(),
    c => c.workflow.second_result.correct--, c => c.workflow.second_answers[Object.keys(c.workflow.second_answers)[0]] = 'D']) {
    const h = await harness(), input = h.input(); await h.run(input); const count = h.evaluations;
    h.contextHook = c => { mutate(c); return c; }; await assert.rejects(h.run(input), mutate.toString()); assert.equal(h.evaluations, count);
  }
});

test('historical close must retain exact pause command, lease and bounded saved timestamps', async () => {
  for (const mutate of [c => c.secondDeliveryEvent.command.kind = 'logout',
    c => c.secondDeliveryEvent.lease_before.phase_kind = 'final', c => c.secondDeliveryEvent.runtime_before.sessionId = randomUUID(),
    c => c.secondSubmissionEvent.recorded_at = 'invalid', c => c.secondDeliveryEvent.recorded_at = new Date(c.serverTimeMs + 5000).toISOString(),
    c => c.secondDeliveryEvent.audit.policy.actorId = randomUUID()]) {
    const h = await harness(), input = h.input(); await h.run(input); const count = h.evaluations;
    h.contextHook = c => { mutate(c); return c; }; await assert.rejects(h.run(input), mutate.toString()); assert.equal(h.evaluations, count);
  }
});

test('concurrent duplicate reload must validate complete current history, not just matching event pair', async () => {
  for (const mutate of [c => c.secondReservationOrigin = null, c => c.reservedFinal.result.passed = true,
    c => c.actorPolicy.student_id = randomUUID(), c => c.secondDelivery.phase_scope.finalAttemptId = randomUUID()]) {
    const h = await harness(), input = h.input(); await h.run(input); let reads = 0;
    h.contextHook = c => { if (++reads === 1) { c.secondSubmissionEvent = null; c.secondDeliveryEvent = null; } else mutate(c); return c; };
    await assert.rejects(h.run(input)); assert.equal(reads, 2);
  }
});
