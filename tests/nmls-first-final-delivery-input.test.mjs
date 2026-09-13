import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeFinalDeliveryFixture } from './helpers/nmls-final-delivery-fixture.mjs';
import { createNmlsFirstFinalDeliveryEvaluator } from '../lib/nmls-final-delivery.mjs';
import { digestNmlsCommand } from '../netlify/functions/_lib/nmls-review-service.mjs';
import { transactNmlsFirstFinalDelivery, validateNmlsFirstFinalDeliveryInput } from '../netlify/functions/_lib/nmls-first-final-delivery.mjs';

// Pure synthetic source/receipt fixture + fake RPC. These are adapter tests,
// NOT SQL atomicity, deployed sessions, learner attendance or CE credit.
async function harness() {
  const f = await makeFinalDeliveryFixture(), { input: i } = f;
  const context = { attempt: i.review, binding: i.binding, actorPolicy: i.actorPolicy, reservedFinal: i.reservedFinal,
    reservation: i.reservation, teachingEvent: i.teachingEvent, delivery: null, deliveryEvent: null,
    serverTimeMs: f.timeMs + 1, lease: i.teachingEvent.lease_after };
  const events = new Map(), calls = []; let evaluations = 0, elapsed = 0;
  const h = { f, context, calls, events, contextHook: null, commitHook: null, resultHook: null,
    get evaluations() { return evaluations; }, set elapsed(v) { elapsed = v; },
    input(kind = 'activate', extra = {}) { return { kind, eventId: randomUUID(), attemptId: i.review.id,
      finalAttemptId: i.reservedFinal.id, expectedSourceRevision: context.attempt.revision, expectedFinalRevision: 1,
      expectedRevision: context.delivery?.revision ?? 0, expectedActorRevision: context.actorPolicy.revision,
      sessionId: context.delivery?.runtime.sessionId ?? null,
      ...(context.actorPolicy.ledger.observationJournal.active ? { studyReceipt: {
        windowId: context.actorPolicy.ledger.observationJournal.active.id, visible: true } } : {}), ...extra }; },
  };
  h.rpc = async (name, args) => {
    calls.push({ name, args: structuredClone(args) });
    if (name === 'nmls_first_final_delivery_context') {
      const c = structuredClone(context), saved = events.get(args.p_event_id);
      c.deliveryEvent = saved ? { student_id: i.actorId, event_id: args.p_event_id, final_id: i.reservedFinal.id,
        review_attempt_id: i.review.id, command_digest: saved.digest, definition_digest: i.definition.digest,
        source_revision: saved.result.sourceRevision, final_revision: 1, delivery_revision: saved.result.runtime.revision,
        actor_revision: saved.result.outcome.actorRevision, runtime: structuredClone(saved.result.runtime),
        outcome: { ...structuredClone(saved.result.outcome), candidateMaterialAllowed: false,
          candidateUntilMs: null, candidateWindow: null } } : null;
      return h.contextHook ? h.contextHook(c) : c;
    }
    if (name === 'nmls_policy_read_presentation') return { id: args.p_presentation_id, actorId: i.actorId,
      offeringId: i.binding.offering.id, contentDigest: i.sourceCourse.digest,
      documentDigest: i.binding.offering.rocs.documentDigest, presentedAtMs: context.serverTimeMs };
    assert.equal(name, 'nmls_first_final_delivery_commit');
    if (h.commitHook) await h.commitHook(args);
    const old = events.get(args.p_event_id);
    if (old) {
      if (old.digest !== args.p_command_digest) throw Error('synthetic_idempotency_conflict');
      const result = { duplicate: true, outcome: { ...structuredClone(old.result.outcome), candidateMaterialAllowed: false,
        candidateUntilMs: null, candidateWindow: null }, runtime: structuredClone(old.result.runtime), sourceRevision: old.result.sourceRevision };
      return h.resultHook ? h.resultHook(result) : result;
    }
    if (args.p_expected_source_revision !== context.attempt.revision || args.p_expected_final_revision !== 1 ||
        args.p_expected_actor_revision !== context.actorPolicy.revision || args.p_expected_delivery_revision !== (context.delivery?.revision ?? 0)) {
      throw Error('synthetic_revision_conflict');
    }
    if (args.p_expected_session_id !== (context.delivery?.runtime.sessionId ?? null)) throw Error('synthetic_session_conflict');
    const t = args.p_transition;
    assert.equal(args.p_command_digest, digestNmlsCommand({ ...t.command, attemptId: i.review.id,
      finalAttemptId: i.reservedFinal.id, expectedSourceRevision: context.attempt.revision, expectedFinalRevision: 1 }));
    context.delivery = { final_id: i.reservedFinal.id, student_id: i.actorId, review_attempt_id: i.review.id,
      phase_scope: structuredClone(t.phase), revision: t.runtime.revision, runtime: structuredClone(t.runtime) };
    context.actorPolicy.ledger = structuredClone(t.ledger); context.actorPolicy.revision = t.ledger.revision;
    const result = { duplicate: false, outcome: structuredClone(t.outcome), runtime: structuredClone(t.runtime), sourceRevision: context.attempt.revision };
    events.set(args.p_event_id, { digest: args.p_command_digest, result: structuredClone(result) });
    return h.resultHook ? h.resultHook(result) : result;
  };
  h.deps = { rpc: h.rpc, courseFor: () => structuredClone(i.sourceCourse), definitionFor: () => structuredClone(i.definition),
    evaluate: c => { evaluations++; return createNmlsFirstFinalDeliveryEvaluator()(c); }, monotonicMs: () => elapsed };
  h.run = async (command = h.input(), overrides = {}) => transactNmlsFirstFinalDelivery(command, i.actorId, { ...h.deps, ...overrides });
  return h;
}
const noMaterial = r => { assert.equal(r.body.questions, null); assert.equal(r.body.deliveryAllowed, false);
  assert.equal(r.body.deliveryUntilMs, null); assert.equal(r.body.studyWindow, null); };

test('private input carries only intent and exact original/final/actor/sidecar revisions', async () => {
  const h = await harness(), valid = h.input(); assert.equal(validateNmlsFirstFinalDeliveryInput(valid), valid);
  for (const change of [{ actorId: randomUUID() }, { answers: {} }, { elapsedMs: 1000 }, { grade: 100 },
    { selection: h.f.input.reservedFinal.selection }, { ledger: h.context.actorPolicy.ledger }, { sourceCourse: {} },
    { expectedFinalRevision: 2 }, { expectedSourceRevision: 0 }, { finalAttemptId: valid.attemptId }, { phase: {} }]) {
    assert.throws(() => validateNmlsFirstFinalDeliveryInput({ ...valid, ...change }));
  }
  assert.throws(() => validateNmlsFirstFinalDeliveryInput(h.input('accept_rocs', { version: '4',
    documentDigest: 'c'.repeat(64), acknowledged: true })), /presentation_required/);
  const withPresentation = h.input('accept_rocs', { version: '4', documentDigest: 'c'.repeat(64), acknowledged: true, presentationId: randomUUID() });
  assert.equal(validateNmlsFirstFinalDeliveryInput(withPresentation), withPresentation);
});

test('only the successfully committed selected form is projected without keys, audit, private bank or replacement selection', async () => {
  const h = await harness(), original = structuredClone(h.f.input.reservedFinal);
  const r = await h.run(); assert.equal(r.status, 200); assert.equal(r.body.deliveryAllowed, true);
  assert.equal(r.body.questions.length, 25); assert.equal(r.body.studentDeliveryEnabled, false);
  assert.equal(r.body.creditIssuanceAllowed, false); assert.ok(r.body.sessionId); assert.ok(r.body.studyWindow);
  for (const q of r.body.questions) {
    assert.deepEqual(Object.keys(q).sort(), ['id', 'options', 'stem']);
    for (const option of q.options) assert.deepEqual(Object.keys(option).sort(), ['id', 'text']);
  }
  for (const key of ['audit', 'runtime', 'ledger', 'selection', 'definition', 'candidateMaterialAllowed', 'candidateUntilMs']) assert.equal(Object.hasOwn(r.body, key), false);
  assert.deepEqual(h.f.input.reservedFinal, original);
  assert.equal(h.calls.at(-1).name, 'nmls_first_final_delivery_commit');
});

test('lost-response retry is historical metadata only after later progress, without evaluator or fresh projection', async () => {
  const h = await harness(), intent = h.input(); await h.run(intent);
  h.context.serverTimeMs++; await h.run(h.input('heartbeat'));
  const before = structuredClone(h.context), count = h.evaluations;
  const r = await h.run(intent); noMaterial(r); assert.equal(r.body.duplicate, true);
  assert.equal(h.evaluations, count); assert.deepEqual(h.context, before);
  await assert.rejects(h.run({ ...intent, kind: 'pause' }), /idempotency_conflict/);
});

test('source, actor, sidecar and session conflicts reach locked resolution without evaluation or presentation reads', async () => {
  for (const patch of [{ expectedSourceRevision: 999 }, { expectedActorRevision: 999 }, { expectedRevision: 1 }, { sessionId: randomUUID() }]) {
    const h = await harness(); await assert.rejects(h.run(h.input('activate', patch)), /synthetic_.*conflict/);
    assert.equal(h.evaluations, 0); assert.equal(h.calls.some(c => c.name === 'nmls_policy_read_presentation'), false);
    assert.deepEqual(h.calls.at(-1).args.p_transition, {});
  }
});

test('original completion, paired reservation, current actor evidence and sidecar scope are checked before commit', async () => {
  for (const mutate of [c => c.attempt.runtime.completedUnitIds.pop(), c => c.reservation = null,
    c => c.teachingEvent.command_digest = 'a'.repeat(64), c => c.reservedFinal.selection.questionIds.reverse(),
    c => c.actorPolicy.revision--, c => c.binding.offering.id = randomUUID(), c => c.reservedFinal.revision = 2]) {
    const h = await harness(); h.contextHook = c => { mutate(c); return c; };
    await assert.rejects(h.run()); assert.equal(h.calls.some(c => c.name.endsWith('_commit')), false);
  }
  const h = await harness(); await h.run(); h.context.serverTimeMs++;
  h.contextHook = c => { c.delivery.phase_scope.finalAttemptId = randomUUID(); return c; };
  await assert.rejects(h.run(h.input('heartbeat')), /sidecar_scope/);
});

test('an altered trusted evaluator cannot commit forged usage, clocks, window, projection or audit', async () => {
  for (const mutate of [t => t.ledger.studySinceBreakMs = 0, t => t.runtime.lastActivityMs++,
    t => t.outcome.questions = [], t => t.outcome.candidateUntilMs++, t => t.audit.kind = 'submit',
    t => t.ledger.observationJournal.active.scope.finalPhase.finalAttemptId = randomUUID()]) {
    const h = await harness();
    await assert.rejects(h.run(h.input(), { evaluate: c => { const t = createNmlsFirstFinalDeliveryEvaluator()(c); mutate(t); return t; } }));
    assert.equal(h.calls.some(c => c.name.endsWith('_commit')), false);
  }
});

test('input mutation during an awaited context call cannot replace immutable logical intent', async () => {
  const h = await harness(), intent = h.input(), original = structuredClone(intent);
  h.contextHook = c => { intent.kind = 'logout'; intent.eventId = randomUUID(); intent.expectedActorRevision = 0; return c; };
  const result = await h.run(intent); assert.equal(result.body.deliveryAllowed, true);
  assert.equal(h.calls.at(-1).args.p_command_digest, digestNmlsCommand(original));
  assert.equal(h.calls.at(-1).args.p_transition.command.kind, 'activate');
});

test('one fresh-clock retry keeps original intent and saved selection; persistent or unrelated failures never expose questions', async () => {
  const h = await harness(), intent = h.input(), original = structuredClone(h.f.input.reservedFinal);
  let commits = 0;
  h.commitHook = () => { if (++commits === 1) { h.context.serverTimeMs += 100; throw Error('nmls_first_final_delivery_clock_refresh_required'); } };
  assert.equal((await h.run(intent)).body.deliveryAllowed, true); assert.equal(commits, 2);
  assert.deepEqual(h.f.input.reservedFinal, original);
  assert.equal(new Set(h.calls.filter(c => c.name.endsWith('_commit')).map(c => c.args.p_command_digest)).size, 1);
  for (const reason of ['nmls_first_final_delivery_clock_refresh_required', 'synthetic_access_denied']) {
    const x = await harness(); let count = 0; x.commitHook = () => { count++; throw Error(reason); };
    await assert.rejects(x.run(), new RegExp(reason)); assert.equal(count, reason.includes('clock') ? 2 : 1);
    assert.equal(x.context.delivery, null);
  }
});

test('response latency and broken monotonic clocks redact material after successful commit', async () => {
  for (const value of [30000, -1, NaN, Infinity]) {
    const h = await harness(); h.commitHook = () => { h.elapsed = value; };
    const result = await h.run(); noMaterial(result); assert.ok(h.context.delivery, 'redaction is not a rollback claim');
  }
  const h = await harness(); let call = 0;
  const result = await h.run(h.input(), { monotonicMs: () => [0, 1, 30000][call++] }); noMaterial(result);
});

test('malformed commit outputs cannot smuggle new questions, stale runtime or an uncommitted candidate', async () => {
  for (const mutate of [r => r.questions = [], r => r.outcome.deliveryAllowed = true, r => r.outcome.actorRevision++,
    r => r.runtime.sessionId = randomUUID(), r => r.sourceRevision++, r => r.duplicate = true]) {
    const h = await harness(); h.resultHook = r => { mutate(r); return r; };
    await assert.rejects(h.run(), /invalid_commit_response|invalid_outcome/);
  }
});

test('historical responses must match original intent revisions and exact immutable event, never arbitrary metadata', async () => {
  for (const mutate of [r => r.sourceRevision++, r => { r.runtime.revision++; r.outcome.revision++; },
    r => r.outcome.actorRevision++, r => r.outcome.code = 'PRIVATE RATIONALE INSERTED',
    r => r.outcome.policyCode = 'PRIVATE KEY INSERTED', r => r.outcome.observationCode = 'PRIVATE QUESTION INSERTED',
    r => r.outcome.code = 'final_paused', r => r.runtime.lastReceiptMs++, r => r.runtime.sessionId = randomUUID(),
    r => r.outcome.resumeNotBeforeMs = 123]) {
    const h = await harness(), intent = h.input(); await h.run(intent); const count = h.evaluations;
    h.resultHook = r => { mutate(r); return r; };
    await assert.rejects(h.run(intent), /invalid_commit_response|invalid_outcome/);
    assert.equal(h.evaluations, count, 'no replay evaluation');
  }
  const h = await harness(), intent = h.input(); await h.run(intent);
  let reads = 0;
  h.contextHook = c => { if (++reads === 1) c.deliveryEvent = null; return c; };
  const replay = await h.run(intent); noMaterial(replay); assert.equal(reads, 2, 'concurrent duplicate re-reads event');
  h.contextHook = c => { c.deliveryEvent = null; return c; };
  await assert.rejects(h.run(intent), /invalid_commit_response/);
  h.contextHook = c => { c.deliveryEvent.command_digest = 'f'.repeat(64); return c; };
  await assert.rejects(h.run(intent), /invalid_commit_response/);
});

test('authenticated ROCS presentation is loaded by ID only and the policy result remains content-free', async () => {
  const h = await harness(), presentationId = randomUUID();
  const r = await h.run(h.input('accept_rocs', { version: '4', documentDigest: 'c'.repeat(64), acknowledged: true, presentationId }));
  noMaterial(r); assert.equal(r.body.policyCode, 'rocs_already_accepted');
  const read = h.calls.find(c => c.name === 'nmls_policy_read_presentation');
  assert.deepEqual(read.args, { p_student_id: h.f.input.actorId, p_attempt_id: h.f.input.review.id, p_presentation_id: presentationId });
  assert.equal(h.calls.at(-1).args.p_transition.command.presentationId, presentationId);
});
