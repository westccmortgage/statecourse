import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeSecondFinalDeliveryFixture } from './helpers/nmls-second-final-delivery-fixture.mjs';
import { createNmlsSecondFinalDeliveryEvaluator } from '../lib/nmls-second-final-delivery.mjs';
import { gradeNmlsDraftFinal } from '../lib/nmls-final-assessment.mjs';
import { digestNmlsCommand } from '../netlify/functions/_lib/nmls-review-service.mjs';
import { transactNmlsSecondFinalDelivery, validateNmlsSecondFinalDeliveryInput } from '../netlify/functions/_lib/nmls-second-final-delivery.mjs';

// Actual pure source→first final→child→second reservation fixture, with explicitly
// synthetic authority, clocks and fake RPC. This does NOT establish SQL atomicity,
// durable record authenticity, browser identity, learner time or CE credit.
const clone = structuredClone;
const redact = outcome => ({ ...clone(outcome), candidateMaterialAllowed: false, candidateUntilMs: null, candidateWindow: null });
async function harness() {
  const f = await makeSecondFinalDeliveryFixture(), i = f.input;
  const context = { attempt: clone(i.review), binding: clone(i.binding), actorPolicy: clone(i.actorPolicy),
    reservedFinal: clone(i.firstFinal), workflow: clone(i.workflow), lease: clone(i.lease), delivery: clone(i.delivery),
    genesisEvent: clone(i.submissionEvent), genesisDeliveryEvent: clone(i.deliveryEvent),
    submissionEvent: null, deliveryEvent: null, reservation: clone(i.reservation), teachingEvent: clone(i.teachingEvent),
    handoffOrigin: clone(i.handoffOrigin), handoffOriginTeachingEvent: clone(i.handoffOriginTeachingEvent),
    terminalChildEvent: clone(i.terminalChildEvent), latestChildEvent: clone(i.latestChildEvent), childBinding: clone(i.childBinding),
    secondReservationEvent: null, secondReservationTeachingEvent: null,
    secondReservationOrigin: clone(i.secondReservationEvent), secondReservationOriginTeachingEvent: clone(i.secondReservationTeachingEvent),
    secondDelivery: null, secondDeliveryEvent: null, serverTimeMs: f.timeMs + 1 };
  const calls = [], events = new Map(); let evaluations = 0, elapsed = 0, transaction = 101;
  const h = { f, context, calls, events, contextHook: null, commitHook: null, resultHook: null, contextArgsHook: null,
    get evaluations() { return evaluations; }, set elapsed(v) { elapsed = v; },
    input(kind = 'activate', extra = {}) {
      return { kind, eventId: randomUUID(), attemptId: i.review.id, firstFinalId: i.firstFinal.id,
        secondFinalId: i.workflow.second_id, expectedSourceRevision: context.attempt.revision, expectedFinalRevision: 2,
        expectedWorkflowRevision: context.workflow.revision, expectedRevision: context.secondDelivery?.revision ?? 0,
        expectedActorRevision: context.actorPolicy.revision, sessionId: context.secondDelivery?.runtime.sessionId ?? null,
        ...(context.actorPolicy.ledger.observationJournal.active ? { studyReceipt: {
          windowId: context.actorPolicy.ledger.observationJournal.active.id, visible: true } } : {}), ...extra };
    },
  };
  h.rpc = async (name, args) => {
    calls.push({ name, args: clone(args) });
    if (name === 'nmls_second_final_delivery_context') {
      const eventId = args.p_event_id;
      if (h.contextArgsHook) await h.contextArgsHook(args);
      const c = clone(context); c.secondDeliveryEvent = clone(events.get(eventId)?.event ?? null);
      return h.contextHook ? h.contextHook(c) : c;
    }
    if (name === 'nmls_policy_read_presentation') return { id: args.p_presentation_id, actorId: i.actorId,
      offeringId: i.binding.offering.id, contentDigest: i.sourceCourse.digest,
      documentDigest: i.binding.offering.rocs.documentDigest, presentedAtMs: context.serverTimeMs };
    assert.equal(name, 'nmls_second_final_delivery_commit');
    if (h.commitHook) await h.commitHook(args);
    const saved = events.get(args.p_event_id);
    if (saved) {
      if (saved.digest !== args.p_command_digest) throw Error('synthetic_idempotency_conflict');
      const r = { ...clone(saved.result), duplicate: true, outcome: redact(saved.result.outcome) };
      return h.resultHook ? h.resultHook(r) : r;
    }
    if (args.p_expected_source_revision !== context.attempt.revision || args.p_expected_final_revision !== 2 ||
        args.p_expected_workflow_revision !== context.workflow.revision || args.p_expected_actor_revision !== context.actorPolicy.revision ||
        args.p_expected_delivery_revision !== (context.secondDelivery?.revision ?? 0)) throw Error('synthetic_revision_conflict');
    if (args.p_expected_session_id !== (context.secondDelivery?.runtime.sessionId ?? null)) throw Error('synthetic_session_conflict');
    if (context.workflow.status !== 'second_issued') throw Error('synthetic_not_reserved');
    const t = clone(args.p_transition), beforeLease = clone(context.lease);
    const beforeRuntime = clone(context.secondDelivery?.runtime ?? { version: 'nmls-second-final-delivery-v1',
      finalAttemptId: i.workflow.second_id, phaseDigest: digestNmlsCommand(t.phase), revision: 0, status: 'reserved',
      sessionId: null, lastActivityMs: null, lastReceiptMs: 0, creditIssuanceAllowed: false });
    assert.equal(args.p_command_digest, digestNmlsCommand({ ...t.command, attemptId: i.review.id,
      firstFinalId: i.firstFinal.id, secondFinalId: i.workflow.second_id, expectedSourceRevision: context.attempt.revision,
      expectedFinalRevision: 2, expectedWorkflowRevision: context.workflow.revision }));
    context.secondDelivery = { second_id: i.workflow.second_id, first_final_id: i.firstFinal.id,
      student_id: i.actorId, review_attempt_id: i.review.id, phase_scope: clone(t.phase), revision: t.runtime.revision, runtime: clone(t.runtime) };
    context.actorPolicy.ledger = clone(t.ledger); context.actorPolicy.revision = t.ledger.revision;
    if (t.runtime.sessionId) context.lease = { student_id: i.actorId, attempt_id: i.review.id,
      phase_kind: 'second_final', phase_owner_id: i.workflow.second_id, phase_active: t.runtime.status === 'active', session_id: t.runtime.sessionId };
    const result = { duplicate: false, outcome: clone(t.outcome), runtime: clone(t.runtime),
      sourceRevision: context.attempt.revision, workflowRevision: context.workflow.revision };
    const event = { student_id: i.actorId, event_id: args.p_event_id, second_id: i.workflow.second_id,
      first_final_id: i.firstFinal.id, review_attempt_id: i.review.id, reservation_event_id: i.secondReservationEvent.event_id,
      command_digest: args.p_command_digest, definition_digest: i.definition.digest, source_revision: context.attempt.revision,
      final_revision: 2, workflow_revision: context.workflow.revision, delivery_revision: t.runtime.revision,
      actor_revision: t.ledger.revision, command: clone(t.command), runtime_before: beforeRuntime, runtime: clone(t.runtime),
      lease_before: beforeLease, lease_after: clone(context.lease), outcome: redact(t.outcome), audit: clone(t.audit),
      transaction_id: transaction++, recorded_at: new Date(context.serverTimeMs).toISOString() };
    events.set(args.p_event_id, { digest: args.p_command_digest, result: clone(result), event });
    return h.resultHook ? h.resultHook(result) : result;
  };
  h.deps = { rpc: h.rpc, courseFor: () => clone(i.sourceCourse), definitionFor: () => clone(i.definition),
    evaluate: c => { evaluations++; return createNmlsSecondFinalDeliveryEvaluator()(c); }, monotonicMs: () => elapsed };
  h.run = (command = h.input(), overrides = {}) => transactNmlsSecondFinalDelivery(command, i.actorId, { ...h.deps, ...overrides });
  return h;
}
const noMaterial = r => {
  assert.equal(r.body.questions, null); assert.equal(r.body.deliveryAllowed, false);
  assert.equal(r.body.deliveryUntilMs, null); assert.equal(r.body.studyWindow, null);
};

test('second input is a closed intent vocabulary with all original/workflow/sidecar fences', async () => {
  const h = await harness(), valid = h.input(); assert.equal(validateNmlsSecondFinalDeliveryInput(valid), valid);
  for (const patch of [{ actorId: randomUUID() }, { answers: {} }, { elapsedMs: 1 }, { grade: 100 }, { sourceCourse: {} },
    { ledger: h.context.actorPolicy.ledger }, { selection: h.f.input.workflow.second_selection }, { phase: {} },
    { finalAttemptId: valid.secondFinalId }, { expectedFinalRevision: 1 }, { expectedSourceRevision: 0 },
    { expectedWorkflowRevision: 0 }, { secondFinalId: valid.firstFinalId }, { firstFinalId: valid.attemptId },
    { kind: 'submit_second_final' }, { expectedActorRevision: NaN }, { sessionId: 'bad' }]) {
    assert.throws(() => validateNmlsSecondFinalDeliveryInput({ ...valid, ...patch }));
  }
  assert.throws(() => validateNmlsSecondFinalDeliveryInput(h.input('accept_rocs', {
    version: '4', documentDigest: 'c'.repeat(64), acknowledged: true })), /presentation_required/);
});

test('fresh committed projection is exactly the saved second form, never first items or answer material', async () => {
  const h = await harness(), before = clone(h.f.input), r = await h.run();
  assert.equal(r.status, 200); assert.equal(r.body.deliveryAllowed, true); assert.equal(r.body.questions.length, 25);
  assert.equal(r.body.studentDeliveryEnabled, false); assert.equal(r.body.creditIssuanceAllowed, false);
  assert.deepEqual(r.body.questions.map(q => q.id), h.f.input.workflow.second_selection.questionIds);
  assert.equal(r.body.questions.some(q => h.f.input.firstFinal.selection.questionIds.includes(q.id)), false);
  for (const q of r.body.questions) {
    assert.deepEqual(Object.keys(q).sort(), ['id', 'options', 'stem']);
    assert.deepEqual(q.options.map(o => o.id), h.f.input.workflow.second_selection.optionOrder[q.id]);
    for (const option of q.options) assert.deepEqual(Object.keys(option).sort(), ['id', 'text']);
  }
  for (const key of ['audit', 'runtime', 'ledger', 'selection', 'definition', 'candidateMaterialAllowed', 'candidateUntilMs', 'result']) {
    assert.equal(Object.hasOwn(r.body, key), false);
  }
  assert.deepEqual(h.f.input, before); assert.equal(h.calls.at(-1).name, 'nmls_second_final_delivery_commit');
});

test('lost-response duplicate after later sidecar activity returns metadata without evaluation or projection', async () => {
  const h = await harness(), intent = h.input(); await h.run(intent);
  h.context.serverTimeMs++; await h.run(h.input('heartbeat'));
  const before = clone(h.context), count = h.evaluations, r = await h.run(intent);
  noMaterial(r); assert.equal(r.body.duplicate, true); assert.equal(h.evaluations, count); assert.deepEqual(h.context, before);
  await assert.rejects(h.run({ ...intent, kind: 'pause' }), /idempotency_conflict/);
});

test('replay after later terminal workflow is no-grade history only, never a third attempt', async () => {
  for (const pass of [true, false]) {
    const h = await harness(), intent = h.input(); await h.run(intent);
    const i = h.f.input, w = h.context.workflow;
    w.second_answers = Object.fromEntries(w.second_selection.questionIds.map(id => { const correct = i.definition.items.find(q => q.id === id).correctChoice;
      return [id, pass ? correct : ['A', 'B', 'C', 'D'].find(choice => choice !== correct)]; }));
    w.second_result = gradeNmlsDraftFinal(i.definition, w.second_selection, w.second_answers);
    w.status = pass ? 'passed' : 'staff_review_required'; w.second_submitted_at = new Date(++h.context.serverTimeMs).toISOString(); w.revision++;
    const count = h.evaluations, r = await h.run(intent); noMaterial(r); assert.equal(r.body.duplicate, true); assert.equal(h.evaluations, count);
    await assert.rejects(h.run(h.input('heartbeat')), /not_reserved/); assert.equal(h.evaluations, count);
  }
});

test('stale original/workflow/actor/sidecar/session requests skip evaluation and ROCS loading', async () => {
  for (const patch of [{ expectedSourceRevision: 999 }, { expectedWorkflowRevision: 999 }, { expectedActorRevision: 999 },
    { expectedRevision: 1 }, { sessionId: randomUUID() }]) {
    const h = await harness(); await assert.rejects(h.run(h.input('activate', patch)), /synthetic_.*conflict/);
    assert.equal(h.evaluations, 0); assert.deepEqual(h.calls.at(-1).args.p_transition, {});
    assert.equal(h.calls.some(c => c.name === 'nmls_policy_read_presentation'), false);
  }
});

test('source/first/child/038/current actor and sidecar scope are validated before any commit', async () => {
  for (const mutate of [c => c.attempt.runtime.completedUnitIds.pop(), c => c.reservation = null,
    c => c.genesisEvent.submitted = false, c => c.terminalChildEvent = null,
    c => c.secondReservationOrigin = null, c => c.secondReservationOriginTeachingEvent = null,
    c => c.secondReservationOrigin.selection_digest = '0'.repeat(64), c => c.workflow.second_selection.questionIds.reverse(),
    c => c.workflow.runtime.completedReviewMs = 0, c => c.actorPolicy.revision--, c => c.binding.offering.id = randomUUID()]) {
    const h = await harness(); h.contextHook = c => { mutate(c); return c; };
    await assert.rejects(h.run()); assert.equal(h.calls.some(c => c.name.endsWith('_commit')), false);
  }
  const h = await harness(); await h.run(); h.context.serverTimeMs++;
  h.contextHook = c => { c.secondDelivery.phase_scope.firstFinalAttemptId = randomUUID(); return c; };
  await assert.rejects(h.run(h.input('heartbeat')), /sidecar_scope|context_scope/);
});

test('a mutated evaluator proposal cannot forge budgets, second identity, clocks, windows or private output', async () => {
  for (const mutate of [t => t.ledger.studySinceBreakMs = 0, t => t.runtime.lastActivityMs++,
    t => t.runtime.version = 'nmls-first-final-delivery-v1', t => t.outcome.questions = [],
    t => t.outcome.candidateUntilMs++, t => t.audit.kind = 'submit',
    t => t.ledger.observationJournal.active.scope.finalPhase.firstFinalAttemptId = randomUUID()]) {
    const h = await harness(); await assert.rejects(h.run(h.input(), { evaluate: c => {
      const t = createNmlsSecondFinalDeliveryEvaluator()(c); mutate(t); return t;
    } })); assert.equal(h.calls.some(c => c.name.endsWith('_commit')), false);
  }
});

test('intent and context-argument mutation across awaits cannot change logical selectors', async () => {
  const h = await harness(), intent = h.input(), original = clone(intent);
  h.contextHook = c => { intent.kind = 'logout'; intent.eventId = randomUUID(); intent.firstFinalId = randomUUID(); return c; };
  h.contextArgsHook = args => { args.p_student_id = randomUUID(); args.p_attempt_id = randomUUID(); args.p_event_id = randomUUID(); };
  const r = await h.run(intent); assert.equal(r.body.deliveryAllowed, true);
  const commit = h.calls.at(-1).args;
  assert.equal(commit.p_command_digest, digestNmlsCommand(original)); assert.equal(commit.p_attempt_id, original.attemptId);
  assert.equal(commit.p_student_id, h.f.input.actorId); assert.equal(commit.p_event_id, original.eventId);
  assert.equal(commit.p_transition.command.kind, 'activate');
});

test('commit callback cannot mutate the expected candidate to launder a different response', async () => {
  const h = await harness(); h.commitHook = args => { args.p_transition.outcome.code = 'final_paused'; };
  await assert.rejects(h.run(), /invalid_commit_response|invalid_outcome/);
});

test('finite clock retry keeps same intent/form, and persistent or unrelated errors return no questions', async () => {
  const h = await harness(), intent = h.input(), original = clone(h.f.input.workflow.second_selection); let calls = 0;
  h.commitHook = () => { if (++calls === 1) { h.context.serverTimeMs += 100; throw Error('nmls_review_clock_refresh_required'); } };
  assert.equal((await h.run(intent)).body.deliveryAllowed, true); assert.equal(calls, 2);
  assert.deepEqual(h.f.input.workflow.second_selection, original);
  assert.equal(new Set(h.calls.filter(c => c.name.endsWith('_commit')).map(c => c.args.p_command_digest)).size, 1);
  for (const error of ['nmls_review_clock_refresh_required', 'synthetic_access_denied']) {
    const x = await harness(); let count = 0; x.commitHook = () => { count++; throw Error(error); };
    await assert.rejects(x.run(), new RegExp(error)); assert.equal(count, error.includes('clock') ? 2 : 1);
    assert.equal(x.context.secondDelivery, null);
  }
});

test('response latency and invalid monotonic readings redact material despite successful persistence', async () => {
  for (const value of [30000, -1, NaN, Infinity]) {
    const h = await harness(); h.commitHook = () => { h.elapsed = value; };
    noMaterial(await h.run()); assert.ok(h.context.secondDelivery);
  }
  const h = await harness(); let count = 0;
  noMaterial(await h.run(h.input(), { monotonicMs: () => [0, 1, 30000][count++] }));
});

test('bad RPC output and closed vocabularies cannot leak tentative material or arbitrary metadata', async () => {
  for (const mutate of [r => r.questions = [], r => r.outcome.deliveryAllowed = true, r => r.outcome.actorRevision++,
    r => r.runtime.sessionId = randomUUID(), r => r.sourceRevision++, r => r.workflowRevision++, r => r.duplicate = true,
    r => r.outcome.code = 'PRIVATE ANSWER', r => r.outcome.policyCode = 'PRIVATE KEY', r => r.outcome.observationCode = 'PRIVATE STEM']) {
    const h = await harness(); h.resultHook = r => { mutate(r); return r; };
    await assert.rejects(h.run(), /invalid_commit_response|invalid_outcome/);
  }
});

test('metadata replay requires exact immutable event, original intent and historical clocks', async () => {
  for (const mutate of [r => r.sourceRevision++, r => r.workflowRevision++, r => r.outcome.actorRevision++,
    r => r.outcome.code = 'final_paused', r => r.runtime.lastReceiptMs++, r => r.runtime.sessionId = randomUUID(),
    r => r.outcome.resumeNotBeforeMs = 123, r => r.outcome.questions = []]) {
    const h = await harness(), intent = h.input(); await h.run(intent); const count = h.evaluations;
    h.resultHook = r => { mutate(r); return r; }; await assert.rejects(h.run(intent), /invalid_commit_response|invalid_outcome/);
    assert.equal(h.evaluations, count);
  }
  for (const mutate of [c => c.secondDeliveryEvent.command_digest = '0'.repeat(64),
    c => c.secondDeliveryEvent.audit.phase.firstFinalAttemptId = randomUUID(),
    c => c.secondDeliveryEvent.lease_before.phase_kind = 'final', c => c.secondDeliveryEvent.runtime_before.lastActivityMs = 1,
    c => c.secondDeliveryEvent.recorded_at = new Date(c.serverTimeMs + 5000).toISOString()]) {
    const h = await harness(), intent = h.input(); await h.run(intent); const count = h.evaluations;
    h.contextHook = c => { mutate(c); return c; }; await assert.rejects(h.run(intent)); assert.equal(h.evaluations, count);
  }
});

test('concurrent duplicate re-reads immutable event; missing history is never adopted', async () => {
  const h = await harness(), intent = h.input(); await h.run(intent); let reads = 0;
  h.contextHook = c => { if (++reads === 1) c.secondDeliveryEvent = null; return c; };
  const r = await h.run(intent); noMaterial(r); assert.equal(reads, 2); assert.equal(r.body.duplicate, true);
  h.contextHook = c => { c.secondDeliveryEvent = null; return c; };
  await assert.rejects(h.run(intent), /invalid_commit_response/);
});

test('concurrent replay reread must revalidate original history and current actor/sidecar authority', async () => {
  for (const mutate of [c => c.secondReservationOrigin = null, c => c.reservedFinal.result.passed = true,
    c => c.actorPolicy.student_id = randomUUID(), c => c.secondDelivery.phase_scope.finalAttemptId = randomUUID()]) {
    const h = await harness(), intent = h.input(); await h.run(intent); let reads = 0;
    h.contextHook = c => { if (++reads === 1) c.secondDeliveryEvent = null; else mutate(c); return c; };
    await assert.rejects(h.run(intent)); assert.equal(reads, 2);
  }
});

test('ROCS control loads only authenticated presentation ID and returns no second questions', async () => {
  const h = await harness(), presentationId = randomUUID();
  const r = await h.run(h.input('accept_rocs', { version: '4', documentDigest: h.f.input.binding.offering.rocs.documentDigest,
    acknowledged: true, presentationId })); noMaterial(r);
  assert.equal(r.body.policyCode, 'rocs_already_accepted');
  assert.deepEqual(h.calls.find(c => c.name === 'nmls_policy_read_presentation').args,
    { p_student_id: h.f.input.actorId, p_attempt_id: h.f.input.review.id, p_presentation_id: presentationId });
  assert.equal(h.calls.at(-1).args.p_transition.command.presentationId, presentationId);
});
