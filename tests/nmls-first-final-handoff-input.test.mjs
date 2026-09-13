import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeFirstFinalHandoffFixture } from './helpers/nmls-first-final-handoff-fixture.mjs';
import { createNmlsFirstFinalHandoffEvaluator } from '../lib/nmls-first-final-handoff.mjs';
import { transactNmlsFirstFinalHandoff, validateNmlsFirstFinalHandoffInput } from '../netlify/functions/_lib/nmls-first-final-handoff.mjs';
import { digestNmlsCommand } from '../netlify/functions/_lib/nmls-review-service.mjs';

// FAKE RPC protocol tests. Source/final reducers are genuine, while history,
// authority, timestamps and transactions are explicit synthetic row fixtures.
// The separate SQL suite, not this mock, verifies persistence and rollback.
const clone = structuredClone;
async function harness(options) {
  const f = await makeFirstFinalHandoffFixture(options), i = f.input;
  const context = { attempt: clone(i.review), binding: clone(i.binding), actorPolicy: clone(i.actorPolicy),
    reservedFinal: clone(i.firstFinal), reservation: clone(i.reservation), teachingEvent: clone(i.teachingEvent),
    workflow: clone(i.workflow), delivery: clone(i.delivery), lease: clone(i.lease),
    genesisEvent: clone(i.submissionEvent), genesisDeliveryEvent: clone(i.deliveryEvent),
    deliveryEvent: null, submissionEvent: null, handoffEvent: null, handoffTeachingEvent: null,
    serverTimeMs: f.evidence.receivedAtMs };
  const events = new Map(), calls = []; let evaluations = 0;
  const h = { f, context, events, calls, contextHook: null, commitHook: null, resultHook: null,
    get evaluations() { return evaluations; }, input(extra = {}) { return { ...clone(f.command), ...extra }; } };
  h.rpc = async (name, args) => {
    calls.push({ name, args: clone(args) });
    if (name === 'nmls_first_final_handoff_context') {
      const c = clone(context), saved = events.get(args.p_event_id);
      if (saved) { c.handoffEvent = clone(saved.e); c.handoffTeachingEvent = clone(saved.t); }
      return h.contextHook ? h.contextHook(c, args) : c;
    }
    assert.equal(name, 'nmls_first_final_handoff_commit');
    if (h.commitHook) await h.commitHook(args);
    const old = events.get(args.p_event_id);
    if (old) {
      if (old.e.command_digest !== args.p_command_digest) throw Error('synthetic_idempotency_conflict');
      const result = { duplicate: true, outcome: clone(old.e.outcome) };
      return h.resultHook ? h.resultHook(result) : result;
    }
    if (args.p_expected_actor_revision !== context.actorPolicy.revision || args.p_expected_source_revision !== context.attempt.revision ||
        args.p_expected_delivery_revision !== context.delivery.revision || context.workflow?.revision !== 1 ||
        context.workflow?.runtime?.revision !== 0 || args.p_expected_session_id !== context.lease.session_id ||
        context.lease.phase_kind !== 'final') throw Error('synthetic_revision_or_session_conflict');
    const p = args.p_transition, r = p.runtime, o = p.outcome, before = clone(context.lease);
    assert.ok(r, 'new commit must carry real proposal');
    const after = { ...before, phase_kind: 'remediation', phase_owner_id: args.p_final_id,
      phase_active: r.status === 'active', session_id: r.sessionId ?? before.session_id };
    const outcome = { ok: true, code: 'private_first_remediation_handed_off', status: 200, handedOff: true,
      finalAttemptId: args.p_final_id, finalRevision: 2, sourceRevision: args.p_expected_source_revision,
      deliveryRevision: args.p_expected_delivery_revision, workflowRevision: 2, runtimeRevision: 1,
      actorRevision: p.ledger.revision, sessionId: r.sessionId, runtimeStatus: r.status,
      teachingOk: o.ok, teachingStatus: o.status, teachingCode: o.code, policyCode: o.policyCode,
      observationCode: o.observationCode, mode: 'private_authoring_review', deliveryAllowed: false,
      studentDeliveryEnabled: false, creditIssuanceAllowed: false, retakeEnabled: false };
    const e = { student_id: i.actorId, event_id: args.p_event_id, final_id: args.p_final_id,
      review_attempt_id: args.p_attempt_id, genesis_event_id: context.genesisEvent.event_id,
      command_digest: args.p_command_digest, teaching_command_digest: digestNmlsCommand(p.command),
      definition_digest: args.p_definition_digest, teaching_digest: p.teachingDigest, phase_scope: clone(p.phase),
      source_revision: args.p_expected_source_revision, final_revision: 2, delivery_revision: args.p_expected_delivery_revision,
      workflow_revision: 2, runtime_revision: 1, actor_revision: p.ledger.revision,
      lease_before: before, lease_after: after, runtime: clone(r), outcome: clone(outcome), transaction_id: 3,
      recorded_at: new Date(context.serverTimeMs).toISOString() };
    const t = { student_id: i.actorId, event_id: args.p_event_id, review_attempt_id: args.p_attempt_id,
      phase_kind: 'remediation', phase_owner_id: args.p_final_id, command_digest: e.teaching_command_digest,
      source_revision: e.source_revision, workflow_revision: 2, runtime_revision: 1, actor_revision: e.actor_revision,
      lease_before: clone(before), lease_after: clone(after), outcome: { ...clone(o),
        deliveryAllowed: false, deliveryUntilMs: null, studyWindow: null }, audit: clone(p.audit),
      transaction_id: 3, recorded_at: e.recorded_at };
    events.set(args.p_event_id, { e, t });
    context.workflow.runtime = clone(r); context.workflow.revision = 2;
    context.actorPolicy.ledger = clone(p.ledger); context.actorPolicy.revision = p.ledger.revision;
    context.lease = clone(after);
    const result = { duplicate: false, outcome: clone(outcome) };
    return h.resultHook ? h.resultHook(result) : result;
  };
  h.deps = { rpc: h.rpc, courseFor: () => clone(i.sourceCourse), definitionFor: () => clone(i.definition),
    evaluate: c => { evaluations++; return createNmlsFirstFinalHandoffEvaluator()(c); } };
  h.run = (intent = h.input(), deps = {}, actor = i.actorId) => transactNmlsFirstFinalHandoff(intent, actor, { ...h.deps, ...deps });
  return h;
}
function noMaterial(r) {
  assert.equal(r.status, 200);
  for (const flag of ['deliveryAllowed', 'studentDeliveryEnabled', 'creditIssuanceAllowed', 'retakeEnabled']) assert.equal(r.body[flag], false);
  for (const key of ['result', 'answers', 'questions', 'progress', 'runtime', 'ledger', 'audit', 'phase', 'selection', 'definition', 'layout']) {
    assert.equal(Object.hasOwn(r.body, key), false, key);
  }
  assert.doesNotMatch(JSON.stringify(r.body), /Synthetic final|correctChoice|questionIds|optionOrder|rationale/);
}

test('handoff input is exact immutable intent with separate old-final session fence', async () => {
  const h = await harness(), good = h.input(); assert.equal(validateNmlsFirstFinalHandoffInput(good), good);
  for (const patch of [{ kind: 'resume' }, { expectedFinalRevision: 1 }, { expectedWorkflowRevision: 2 },
    { expectedRevision: 1 }, { expectedSourceRevision: 0 }, { expectedActorRevision: 0 }, { expectedDeliveryRevision: 0 },
    { sessionId: null }, { sessionId: {} }, { finalAttemptId: good.attemptId }, { eventId: 'bad' },
    { actorId: randomUUID() }, { phaseKind: 'remediation' }, { runtime: {} }, { answers: {} }, { studyReceipt: {} }, { receivedAtMs: 0 }]) {
    assert.throws(() => validateNmlsFirstFinalHandoffInput({ ...good, ...patch }));
  }
  await assert.rejects(h.run(good, {}, 'not-actor')); assert.equal(h.calls.length, 0);
});

test('new committed handoff contains session metadata but no course material or credit', async () => {
  const h = await harness(), intent = h.input(), source = clone(h.context.attempt), final = clone(h.context.reservedFinal), delivery = clone(h.context.delivery);
  const r = await h.run(intent); noMaterial(r);
  assert.equal(r.body.duplicate, false); assert.equal(r.body.handedOff, true); assert.equal(r.body.teachingOk, true);
  assert.equal(r.body.runtimeStatus, 'active'); assert.notEqual(r.body.sessionId, intent.sessionId);
  assert.equal(r.body.policyCode, 'session_policy_allowed');
  const p = h.calls.at(-1).args;
  assert.deepEqual(p.p_intent, intent); assert.equal(p.p_command_digest, digestNmlsCommand(intent));
  assert.equal(p.p_expected_session_id, intent.sessionId); assert.equal(p.p_transition.command.sessionId, null);
  assert.equal(p.p_transition.command.kind, 'resume'); assert.equal(p.p_transition.command.phaseOwnerId, intent.finalAttemptId);
  assert.equal(p.p_transition.outcome.deliveryAllowed, true, 'actual032 control outcome is preserved');
  assert.deepEqual(p.p_transition.outcome.progress.lessons, []); assert.equal(p.p_transition.outcome.studyWindow, null);
  assert.deepEqual(h.context.attempt, source); assert.deepEqual(h.context.reservedFinal, final); assert.deepEqual(h.context.delivery, delivery);
});

test('break and outside-window controls do not become material permission', async () => {
  for (const condition of ['break', 'outside']) {
    const h = await harness();
    if (condition === 'break') h.context.actorPolicy.ledger.breakStartedAtMs = h.context.actorPolicy.ledger.lastReceiptMs;
    else h.context.serverTimeMs = h.context.binding.offering.closesAtMs;
    const r = await h.run(); noMaterial(r);
    assert.equal(r.body.handedOff, true); assert.equal(r.body.teachingOk, condition === 'break');
    assert.equal(r.body.policyCode, condition === 'break' ? 'break_in_progress' : 'delivery_window_closed');
    assert.equal(r.body.runtimeStatus, condition === 'break' ? 'active' : 'logged_out');
    assert.equal(h.calls.at(-1).args.p_transition.outcome.deliveryAllowed, false);
  }
});

test('historical paired replay skips evaluation and cannot rewind later child state', async () => {
  const h = await harness(), intent = h.input(), first = await h.run(intent);
  h.context.workflow.revision = 8; h.context.workflow.runtime.revision = 7;
  h.context.actorPolicy.revision += 6; h.context.actorPolicy.ledger.revision += 6;
  const before = clone(h.context), r = await h.run(intent, { evaluate: () => { throw Error('NO_REEVALUATION'); } });
  noMaterial(r); assert.deepEqual(r.body, { ...first.body, duplicate: true }); assert.deepEqual(h.context, before);
  assert.deepEqual(h.calls.at(-1).args.p_transition, {}); assert.equal(h.evaluations, 1);
});

test('stale source/actor/final-sidecar/session intents go to locked resolution without reduction', async () => {
  for (const patch of [{ expectedSourceRevision: 999 }, { expectedActorRevision: 999 },
    { expectedDeliveryRevision: 999 }, { sessionId: randomUUID() }]) {
    const h = await harness(); await assert.rejects(h.run(h.input(patch)), /synthetic_revision_or_session_conflict/);
    assert.equal(h.evaluations, 0); assert.deepEqual(h.calls.at(-1).args.p_transition, {});
  }
});

test('passed final, missing genesis and mutated source are not handoff authority', async () => {
  const passed = await harness({ correct: 18 }); await assert.rejects(passed.run()); assert.equal(passed.evaluations, 0);
  for (const change of [c => { c.genesisEvent = null; }, c => { c.genesisDeliveryEvent.runtime.status = 'active'; },
    c => { c.reservedFinal.student_id = randomUUID(); }, c => { c.binding.offering.contentDigest = '0'.repeat(64); }]) {
    const h = await harness(); h.contextHook = c => { change(c); return c; }; await assert.rejects(h.run());
    assert.equal(h.calls.some(call => call.name.endsWith('_commit')), false);
  }
});

test('input and RPC selector mutation during awaits cannot change logical intent', async () => {
  const h = await harness(), intent = h.input(), original = clone(intent);
  h.contextHook = (c, args) => { intent.eventId = randomUUID(); intent.sessionId = randomUUID(); intent.expectedActorRevision = 1;
    args.p_final_id = randomUUID(); args.p_event_id = randomUUID(); return c; };
  noMaterial(await h.run(intent));
  assert.deepEqual(h.calls.at(-1).args.p_intent, original);
  assert.equal(h.calls.at(-1).args.p_event_id, original.eventId); assert.equal(h.calls.at(-1).args.p_final_id, original.finalAttemptId);
});

test('modified evaluation result is rejected before commit even when its metadata looks allowed', async () => {
  for (const corrupt of [r => { r.runtime.completedReviewMs = 1; }, r => { r.ledger.studySinceBreakMs = 0; },
    r => { r.outcome.progress.lessons = [{ id: 'F01-U01' }]; }, r => { r.command.sessionId = randomUUID(); },
    r => { r.extra = undefined; }, r => { r.runtime.sessionId = 'bad'; }]) {
    const h = await harness(); await assert.rejects(h.run(h.input(), { evaluate: async c => {
      const r = await createNmlsFirstFinalHandoffEvaluator()(c); corrupt(r); return r;
    } }));
    assert.equal(h.calls.some(call => call.name.endsWith('_commit')), false);
  }
});

test('malformed commit envelope, forged flags and arbitrary metadata are refused', async () => {
  for (const corrupt of [r => { r.questions = []; }, r => { r.duplicate = 'true'; },
    r => { r.outcome.deliveryAllowed = true; }, r => { r.outcome.teachingCode = 'PRIVATE_KEY'; },
    r => { r.outcome.actorRevision++; }, r => { r.outcome.result = { passed: true }; }]) {
    const h = await harness(); h.resultHook = r => { corrupt(r); return r; }; await assert.rejects(h.run(), /invalid_/);
  }
});

test('all historical receipt selectors and paired runtime metadata are checked', async () => {
  for (const corrupt of [p => { p.e.command_digest = '0'.repeat(64); }, p => { p.e.genesis_event_id = randomUUID(); },
    p => { p.e.teaching_command_digest = '0'.repeat(64); }, p => { p.e.actor_revision++; },
    p => { p.t.transaction_id++; }, p => { p.t.lease_before.session_id = randomUUID(); },
    p => { p.e.runtime.current = {}; }, p => { p.t.outcome.progress.lessons = [{ id: 'F01-U01' }]; },
    p => { p.t.audit.review.kind = 'open_unit'; }, p => { p.t.audit.policy.actorId = randomUUID(); },
    p => { p.t.outcome.progress.completedReviewMs = 12345; }, p => { p.t.outcome.deliveryAllowed = true; }]) {
    const h = await harness(), intent = h.input(); await h.run(intent); corrupt(h.events.get(intent.eventId));
    await assert.rejects(h.run(intent), /invalid_commit_response|synthetic_idempotency_conflict/);
  }
});

test('replay rechecks original immutable genesis and current actor/workflow revision floors without grading', async () => {
  for (const corrupt of [c => { c.reservedFinal.result.correct = 1; }, c => { c.genesisEvent.command_digest = '0'.repeat(64); },
    c => { c.genesisDeliveryEvent.student_id = randomUUID(); }, c => { delete c.reservation; delete c.teachingEvent; },
    c => { c.workflow.revision = 1; c.workflow.runtime.revision = 0; },
    c => { c.actorPolicy.revision = 0; c.actorPolicy.ledger.revision = 0; }]) {
    const h = await harness(), intent = h.input(); await h.run(intent); corrupt(h.context);
    await assert.rejects(h.run(intent, { evaluate: () => { throw Error('NO_REEVALUATION'); } }));
    assert.equal(h.evaluations, 1);
  }
});

test('concurrent replay verification reread must retain original authenticated ownership', async () => {
  const h = await harness(), intent = h.input(); await h.run(intent); let reads = 0;
  h.contextHook = c => { if (++reads === 1) { c.handoffEvent = null; c.handoffTeachingEvent = null; }
    else { c.reservedFinal.student_id = randomUUID(); c.actorPolicy.student_id = randomUUID(); } return c; };
  await assert.rejects(h.run(intent)); assert.equal(reads, 2);
});

test('concurrent receipt absent in initial context is read once after duplicate result', async () => {
  const h = await harness(), intent = h.input(), expected = await h.run(intent); let reads = 0;
  h.contextHook = c => { if (++reads === 1) { c.handoffEvent = null; c.handoffTeachingEvent = null; } return c; };
  const r = await h.run(intent); assert.equal(reads, 2); assert.deepEqual(r.body, { ...expected.body, duplicate: true });
  assert.equal(h.evaluations, 1);
});

test('retained RPC result cannot add content during awaited replay verification', async () => {
  const h = await harness(), intent = h.input(); await h.run(intent); let reads = 0, retained;
  h.resultHook = r => { retained = r; return r; };
  h.contextHook = c => { if (++reads === 1) { c.handoffEvent = null; c.handoffTeachingEvent = null; }
    else retained.outcome.questions = ['PRIVATE KEY']; return c; };
  const r = await h.run(intent); noMaterial(r); assert.equal(Object.hasOwn(r.body, 'questions'), false);
});

test('one explicit clock refresh retries the same intent; unknown network failure does not retry', async () => {
  const h = await harness(), intent = h.input(); let commits = 0;
  h.commitHook = () => { if (++commits === 1) { h.context.serverTimeMs++; throw Error('nmls_first_final_handoff_clock_refresh_required'); } };
  noMaterial(await h.run(intent)); assert.equal(commits, 2);
  const writes = h.calls.filter(c => c.name.endsWith('_commit'));
  assert.deepEqual(writes[0].args.p_intent, writes[1].args.p_intent);
  assert.equal(writes[0].args.p_command_digest, writes[1].args.p_command_digest);
  const bad = await harness(); bad.commitHook = () => { throw Error('connection_lost'); };
  await assert.rejects(bad.run(), /connection_lost/); assert.equal(bad.calls.filter(c => c.name.endsWith('_commit')).length, 1);
});
