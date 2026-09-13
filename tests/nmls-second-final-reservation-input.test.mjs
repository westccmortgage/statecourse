import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeSecondFinalReservationFixture } from './helpers/nmls-second-final-reservation-fixture.mjs';
import { createNmlsSecondFinalReservationEvaluator } from '../lib/nmls-second-final-reservation.mjs';
import { transactNmlsSecondFinalReservation, validateNmlsSecondFinalReservationInput } from '../netlify/functions/_lib/nmls-second-final-reservation.mjs';
import { digestNmlsCommand } from '../netlify/functions/_lib/nmls-review-service.mjs';

// FAKE RPC protocol tests with genuine pure child traversal. These synthetic
// row envelopes are not SQL persistence, permissions or human timing proof.
const clone = structuredClone;
async function harness() {
  const f = await makeSecondFinalReservationFixture(), i = f.input;
  const context = { attempt: clone(i.review), binding: clone(i.binding), reservedFinal: clone(i.firstFinal),
    workflow: clone(i.workflow), actorPolicy: clone(i.actorPolicy), lease: clone(i.lease), delivery: clone(i.delivery),
    genesisEvent: clone(i.submissionEvent), genesisDeliveryEvent: clone(i.deliveryEvent), reservation: clone(i.reservation),
    teachingEvent: clone(i.teachingEvent), handoffOrigin: clone(i.handoffOrigin), handoffOriginTeachingEvent: clone(i.handoffOriginTeachingEvent),
    latestChildEvent: clone(i.latestChildEvent), terminalChildEvent: clone(i.terminalChildEvent), childBinding: clone(i.childBinding),
    secondReservationEvent: null, secondReservationTeachingEvent: null, serverTimeMs: f.evidence.receivedAtMs };
  const events = new Map(), calls = []; let evaluations = 0;
  const h = { f, context, events, calls, contextHook: null, commitHook: null, resultHook: null,
    get evaluations() { return evaluations; }, input: (extra = {}) => ({ ...clone(f.command), ...extra }) };
  h.rpc = async (name, args) => {
    calls.push({ name, args: clone(args) });
    if (name === 'nmls_second_final_reservation_context') {
      const c = clone(context), saved = events.get(args.p_event_id);
      if (saved) { c.secondReservationEvent = clone(saved.e); c.secondReservationTeachingEvent = clone(saved.t); }
      return h.contextHook ? h.contextHook(c, args) : c;
    }
    assert.equal(name, 'nmls_second_final_reservation_commit');
    if (h.commitHook) await h.commitHook(args);
    const old = events.get(args.p_event_id);
    if (old) {
      if (old.e.command_digest !== args.p_command_digest) throw Error('synthetic_idempotency_conflict');
      const response = { duplicate: true, outcome: clone(old.e.outcome) };
      return h.resultHook ? h.resultHook(response) : response;
    }
    if (args.p_expected_actor_revision !== context.actorPolicy.revision || args.p_expected_source_revision !== context.attempt.revision ||
        args.p_expected_workflow_revision !== context.workflow.revision || args.p_expected_runtime_revision !== context.workflow.runtime.revision ||
        args.p_expected_session_id !== context.lease.session_id || context.workflow.status !== 'remediating') throw Error('synthetic_revision_or_session_conflict');
    const p = args.p_transition, reserved = p.outcome.ok, before = clone(context.lease), runtimeBefore = clone(context.workflow.runtime);
    const outcome = { ok: reserved, code: reserved ? 'private_second_final_reserved' : 'private_second_final_reservation_refused',
      status: reserved ? 200 : 409, reserved, firstFinalId: args.p_first_final_id, secondFinalId: args.p_second_id,
      finalRevision: 2, sourceRevision: args.p_expected_source_revision,
      workflowRevision: args.p_expected_workflow_revision + (reserved ? 2 : 1), runtimeRevision: p.runtime.revision,
      actorRevision: p.ledger.revision, sessionId: args.p_expected_session_id, teachingCode: p.outcome.code,
      policyCode: p.outcome.policyCode, observationCode: p.outcome.observationCode, mode: 'private_authoring_review',
      deliveryAllowed: false, studentDeliveryEnabled: false, creditIssuanceAllowed: false, retakeEnabled: false };
    const e = { student_id: i.actorId, event_id: args.p_event_id, review_attempt_id: args.p_attempt_id, first_final_id: args.p_first_final_id,
      handoff_event_id: context.handoffOrigin.event_id, terminal_event_id: context.terminalChildEvent.event_id,
      command_digest: args.p_command_digest, teaching_command_digest: digestNmlsCommand(p.command), definition_digest: args.p_definition_digest,
      teaching_digest: p.teachingDigest, phase_scope: clone(p.phase), source_revision: outcome.sourceRevision, final_revision: 2,
      workflow_before_revision: args.p_expected_workflow_revision, workflow_revision: outcome.workflowRevision,
      runtime_before_revision: args.p_expected_runtime_revision, runtime_revision: outcome.runtimeRevision,
      actor_before_revision: args.p_expected_actor_revision, teaching_workflow_revision: args.p_expected_workflow_revision + 1,
      session_id: args.p_expected_session_id,
      actor_revision: outcome.actorRevision, second_id: args.p_second_id, reserved,
      selection_digest: reserved ? digestNmlsCommand(args.p_selection) : null,
      runtime_before: runtimeBefore, runtime: clone(p.runtime), lease_before: before, lease_after: clone(before),
      outcome: clone(outcome), transaction_id: 100, recorded_at: new Date(context.serverTimeMs).toISOString() };
    const t = { student_id: i.actorId, event_id: args.p_event_id, review_attempt_id: args.p_attempt_id,
      phase_kind: 'remediation', phase_owner_id: args.p_first_final_id, command_digest: e.teaching_command_digest,
      source_revision: e.source_revision, workflow_revision: args.p_expected_workflow_revision + 1,
      runtime_revision: e.runtime_revision, actor_revision: e.actor_revision, lease_before: clone(before), lease_after: clone(before),
      outcome: clone(p.outcome), audit: clone(p.audit), transaction_id: 100, recorded_at: e.recorded_at };
    events.set(args.p_event_id, { e, t }); context.latestChildEvent = clone(t);
    context.workflow.runtime = clone(p.runtime); context.workflow.revision = e.workflow_revision;
    context.actorPolicy.revision = p.ledger.revision; context.actorPolicy.ledger = clone(p.ledger);
    if (reserved) {
      context.workflow.status = 'second_issued'; context.workflow.second_id = args.p_second_id;
      context.workflow.second_selection = clone(args.p_selection); context.workflow.second_issued_at = e.recorded_at;
    }
    const response = { duplicate: false, outcome: clone(outcome) };
    return h.resultHook ? h.resultHook(response) : response;
  };
  h.deps = { rpc: h.rpc, courseFor: () => clone(i.sourceCourse), definitionFor: () => clone(i.definition),
    evaluate: c => { evaluations++; return createNmlsSecondFinalReservationEvaluator()(c); } };
  h.run = (intent = h.input(), deps = {}, actor = i.actorId) => transactNmlsSecondFinalReservation(intent, actor, { ...h.deps, ...deps });
  return h;
}
function noMaterial(r) {
  assert.equal(r.status, r.body.status);
  for (const k of ['deliveryAllowed', 'studentDeliveryEnabled', 'creditIssuanceAllowed', 'retakeEnabled']) assert.equal(r.body[k], false);
  for (const k of ['questions', 'answers', 'selection', 'runtime', 'ledger', 'audit', 'progress', 'definition', 'result', 'layout']) assert.equal(Object.hasOwn(r.body, k), false);
  assert.doesNotMatch(JSON.stringify(r.body), /correctChoice|questionIds|optionOrder|rationale/);
}
test('second reservation accepts only exact scoped intent, no answers or server evidence', async () => {
  const h = await harness(), good = h.input(); assert.equal(validateNmlsSecondFinalReservationInput(good), good);
  for (const patch of [{ kind: 'issue_second' }, { firstFinalId: good.attemptId }, { expectedFinalRevision: 1 },
    { expectedSourceRevision: 0 }, { expectedWorkflowRevision: 2 }, { expectedRevision: 1 }, { expectedActorRevision: 0 },
    { sessionId: null }, { eventId: 'bad' }, { answers: {} }, { studyReceipt: {} }, { actorId: randomUUID() }, { receivedAtMs: 0 }]) {
    assert.throws(() => validateNmlsSecondFinalReservationInput({ ...good, ...patch }));
  }
  await assert.rejects(() => h.run(good, {}, 'bad')); assert.equal(h.calls.length, 0);
});
test('fresh second reservation carries genuine check and pinned new form privately; response metadata only', async () => {
  const h = await harness(), before = clone(h.context), r = await h.run(); noMaterial(r);
  assert.equal(r.body.reserved, true); assert.equal(r.body.duplicate, false);
  assert.deepEqual(h.context.attempt, before.attempt); assert.deepEqual(h.context.reservedFinal, before.reservedFinal);
  assert.deepEqual(h.context.delivery, before.delivery); assert.deepEqual(h.context.lease, before.lease);
  const p = h.calls.at(-1).args;
  assert.equal(p.p_transition.command.kind, 'check_access'); assert.deepEqual(p.p_intent, h.input());
  assert.equal(p.p_definition.digest, h.f.input.definition.digest); assert.equal(p.p_selection.number, 2);
  assert.ok(p.p_selection.questionIds.every(id => !before.reservedFinal.selection.questionIds.includes(id)));
  assert.equal(h.context.workflow.revision, before.workflow.revision + 2);
  assert.equal(h.context.workflow.runtime.completedReviewMs, before.workflow.runtime.completedReviewMs);
  assert.equal(h.context.workflow.runtime.sessionId, before.workflow.runtime.sessionId);
});
test('break or closed year commits actual policy refusal without drawing a second form', async () => {
  for (const condition of ['break', 'year']) {
    const h = await harness();
    if (condition === 'break') h.context.actorPolicy.ledger.breakStartedAtMs = h.context.actorPolicy.ledger.lastReceiptMs;
    else h.context.serverTimeMs = h.context.binding.offering.closesAtMs;
    const r = await h.run(); noMaterial(r); assert.equal(r.body.reserved, false); assert.equal(r.status, 409);
    assert.equal(h.calls.at(-1).args.p_selection, null); assert.equal(h.calls.at(-1).args.p_second_id, null);
    assert.equal(h.context.workflow.status, 'remediating'); assert.equal(h.context.workflow.second_id, null);
  }
});
test('paired replay after second_issued is historical and does not redraw, reevaluate or rewind', async () => {
  const h = await harness(), intent = h.input(), first = await h.run(intent), before = clone(h.context);
  const r = await h.run(intent, { evaluate: () => { throw Error('MUST_NOT_REEVALUATE'); } }); noMaterial(r);
  assert.deepEqual(r.body, { ...first.body, duplicate: true }); assert.deepEqual(h.context, before);
});
test('stale actor/workflow/runtime/source/session sends empty proposal, never evaluates', async () => {
  for (const patch of [{ expectedActorRevision: 1 }, { expectedWorkflowRevision: 3 }, { expectedRevision: 2 },
    { expectedSourceRevision: 1 }, { sessionId: randomUUID() }]) {
    const h = await harness();
    await assert.rejects(() => h.run(h.input(patch), { evaluate: () => { throw Error('MUST_NOT_EVALUATE'); } }), /revision_or_session/);
    assert.deepEqual(h.calls.at(-1).args.p_transition, {});
  }
});
test('clock refresh is bounded to one and retains originally drawn form and request intent', async () => {
  const h = await harness(), proposals = []; let first = true;
  h.commitHook = args => { proposals.push(clone(args)); if (first) { first = false; h.context.serverTimeMs += 1; throw Error('nmls_second_final_reservation_clock_refresh_required'); } };
  const r = await h.run(); assert.equal(r.body.reserved, true); assert.equal(proposals.length, 2);
  assert.deepEqual(proposals[0].p_selection, proposals[1].p_selection); assert.equal(proposals[0].p_second_id, proposals[1].p_second_id);
  assert.deepEqual(proposals[0].p_intent, proposals[1].p_intent); assert.equal(proposals[1].p_evaluated_at_ms, proposals[0].p_evaluated_at_ms + 1);
  const other = await harness(); other.commitHook = () => { throw Error('network timeout'); };
  await assert.rejects(() => other.run(), /network timeout/); assert.equal(other.calls.filter(c => c.name.endsWith('_commit')).length, 1);
});
test('invalid evaluator output never reaches commit, including reused questions and exposed material', async () => {
  for (const mutate of [p => { p.runtime.completedReviewMs++; }, p => { p.ledger.studyIntervals = []; },
    p => { p.outcome.progress.lessons = [{}]; }, p => { p.reservation.selection.number = 1; },
    p => { p.reservation.selection.questionIds[0] = 'N26-FIN-F99'; }, p => { p.command.sessionId = randomUUID(); }]) {
    const h = await harness();
    await assert.rejects(() => h.run(h.input(), { evaluate: async c => { const p = await createNmlsSecondFinalReservationEvaluator()(c); mutate(p); return p; } }));
    assert.equal(h.calls.filter(c => c.name.endsWith('_commit')).length, 0);
  }
});
test('caller inputs and mutable RPC arguments cannot rewrite expected intent or committed metadata', async () => {
  const h = await harness(), intent = h.input(), original = clone(intent);
  h.contextHook = c => { intent.sessionId = randomUUID(); intent.expectedActorRevision = 900; return c; };
  const r = await h.run(intent); assert.equal(r.body.sessionId, original.sessionId);
  assert.deepEqual(h.calls.at(-1).args.p_intent, original);
  const other = await harness(); other.commitHook = args => { args.p_intent.sessionId = randomUUID(); args.p_expected_actor_revision++; };
  await assert.rejects(() => other.run());
});
test('unrecognized or material-bearing commit metadata is rejected', async () => {
  for (const mutate of [r => { r.outcome.questions = []; }, r => { r.outcome.creditIssuanceAllowed = true; },
    r => { r.outcome.secondFinalId = randomUUID(); }, r => { r.outcome.actorRevision++; }, r => { r.extra = true; }]) {
    const h = await harness(); h.resultHook = r => { mutate(r); return r; }; await assert.rejects(() => h.run(), /invalid_commit_response/);
  }
});
test('changed original or child histories reject before a fresh write', async () => {
  for (const mutate of [c => { c.genesisEvent.submission_payload_digest = '0'.repeat(64); }, c => { c.reservedFinal.student_id = randomUUID(); },
    c => { c.handoffOriginTeachingEvent.transaction_id++; }, c => { c.terminalChildEvent.audit.review.passed = false; },
    c => { c.childBinding.layout[0].units[0].requiredMs = 0; }, c => { c.latestChildEvent.outcome.progress.completedReviewMs++; }]) {
    const h = await harness(); h.contextHook = c => { mutate(c); return c; }; await assert.rejects(() => h.run());
    assert.equal(h.calls.filter(c => c.name.endsWith('_commit')).length, 0);
  }
});
test('malformed replay pair cannot leak or resurrect altered reservation evidence', async () => {
  for (const mutate of [c => { c.secondReservationTeachingEvent.transaction_id++; }, c => { c.secondReservationEvent.command_digest = 'f'.repeat(64); },
    c => { c.secondReservationEvent.selection_digest = 'f'.repeat(64); }, c => { c.secondReservationEvent.runtime.sessionId = randomUUID(); },
    c => { c.secondReservationTeachingEvent.audit.policy.offeringId = randomUUID(); }, c => { c.secondReservationEvent.lease_after.phase_active = true; }]) {
    const h = await harness(), intent = h.input(); await h.run(intent); h.contextHook = c => { mutate(c); return c; };
    await assert.rejects(() => h.run(intent, { evaluate: () => { throw Error('MUST_NOT_EVALUATE'); } }), /invalid_commit_response/);
  }
});
test('historical policy denial remains exactly replayable after a later successful reservation', async () => {
  const h = await harness(), intent = h.input();
  h.context.actorPolicy.ledger.breakStartedAtMs = h.context.actorPolicy.ledger.lastReceiptMs;
  const denied = await h.run(intent); assert.equal(denied.body.reserved, false);
  assert.deepEqual((await h.run(intent)).body, { ...denied.body, duplicate: true });
  // Explicit mock-only policy edit; real SQL uses the actual break-end path.
  h.context.actorPolicy.ledger.breakStartedAtMs = null; h.context.serverTimeMs++;
  const current = h.input({ eventId: randomUUID(), expectedWorkflowRevision: h.context.workflow.revision,
    expectedRevision: h.context.workflow.runtime.revision, expectedActorRevision: h.context.actorPolicy.revision });
  assert.equal((await h.run(current)).body.reserved, true);
  const before = clone(h.context);
  assert.deepEqual((await h.run(intent)).body, { ...denied.body, duplicate: true });
  assert.deepEqual(h.context, before);
});
test('coherently future-dated paired receipt cannot overtake current runtime, actor or server clocks', async () => {
  const h = await harness(), intent = h.input(); await h.run(intent);
  h.contextHook = c => {
    const future = c.serverTimeMs + 5000, e = c.secondReservationEvent, t = c.secondReservationTeachingEvent;
    e.runtime.lastReceiptMs = future; e.recorded_at = t.recorded_at = new Date(future).toISOString();
    t.audit.review.atMs = t.audit.policy.atMs = future;
    return c;
  };
  await assert.rejects(() => h.run(intent), /invalid_commit_response/);
});
test('concurrent receipt readback rechecks owner and cannot mutate the detached commit response', async () => {
  for (const corrupt of ['owner', 'response']) {
    const h = await harness(), intent = h.input(); await h.run(intent);
    let reads = 0, retained;
    h.resultHook = r => { retained = r; return r; };
    h.contextHook = c => {
      if (++reads === 1) { c.secondReservationEvent = null; c.secondReservationTeachingEvent = null; }
      else if (corrupt === 'owner') c.attempt.student_id = randomUUID();
      else retained.outcome.secondFinalId = randomUUID();
      return c;
    };
    if (corrupt === 'owner') await assert.rejects(() => h.run(intent), /access_denied|context|scope/);
    else assert.equal((await h.run(intent)).body.secondFinalId, h.context.workflow.second_id);
    assert.equal(reads, 2);
  }
});
