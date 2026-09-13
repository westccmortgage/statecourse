import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeFinalDeliveryFixture } from './helpers/nmls-final-delivery-fixture.mjs';
import { makeNmlsFirstFinalDeliveryContext, nmlsFinalDeliveryScope } from '../lib/nmls-final-delivery-context.mjs';
import { createNmlsFirstFinalDeliveryEvaluator, startNmlsFirstFinalDelivery } from '../lib/nmls-final-delivery.mjs';
import { createNmlsFirstFinalSubmissionEvaluator } from '../lib/nmls-first-final-submission.mjs';
import { digestNmlsCommand } from '../netlify/functions/_lib/nmls-review-service.mjs';
import { transactNmlsFirstFinalSubmission, validateNmlsFirstFinalSubmissionInput } from '../netlify/functions/_lib/nmls-first-final-submission.mjs';

// FAKE RPC, explicit synthetic source/authority/clock fixtures. Source completion
// and final activation/acknowledgment use actual pure reducers. The row pairs
// below mimic036 but are NOT SQL transactions, authentic identity, attendance,
// real delivery, irreversible history, concurrency verification or CE credit.
const clone = structuredClone;
async function harness({ acknowledge = true } = {}) {
  const f = await makeFinalDeliveryFixture(), i = f.input;
  const context = { attempt: clone(i.review), binding: clone(i.binding), actorPolicy: clone(i.actorPolicy),
    reservedFinal: clone(i.reservedFinal), reservation: clone(i.reservation), teachingEvent: clone(i.teachingEvent),
    delivery: null, deliveryEvent: null, submissionEvent: null, workflow: null,
    lease: clone(i.teachingEvent.lease_after), serverTimeMs: f.timeMs };
  const events = new Map(), deliveryOnly = new Map(), calls = []; let evaluations = 0;
  const phaseContext = () => makeNmlsFirstFinalDeliveryContext({ actorId: i.actorId,
    review: context.attempt, binding: context.binding, actorPolicy: context.actorPolicy, sourceCourse: i.sourceCourse,
    definition: i.definition, reservedFinal: context.reservedFinal, reservation: context.reservation, teachingEvent: context.teachingEvent });
  const h = { f, context, events, deliveryOnly, calls, contextHook: null, commitHook: null, resultHook: null,
    get evaluations() { return evaluations; },
    answers(correct = 25) { return Object.fromEntries(context.reservedFinal.selection.questionIds.map((id, n) => [id,
      n < correct ? i.definition.items.find(item => item.id === id).correctChoice : 'B'])); },
    input(extra = {}) { return { kind: 'submit_first_final', attemptId: i.review.id, finalAttemptId: i.reservedFinal.id,
      eventId: randomUUID(), expectedSourceRevision: context.attempt.revision, expectedFinalRevision: 1,
      expectedRevision: context.delivery?.revision ?? 0, expectedActorRevision: context.actorPolicy.revision,
      sessionId: context.delivery?.runtime.sessionId ?? null, answers: h.answers(),
      ...(context.actorPolicy.ledger.observationJournal.active ? { studyReceipt: {
        windowId: context.actorPolicy.ledger.observationJournal.active.id, visible: true } } : {}), ...extra }; },
    act(kind, extra = {}, at = context.serverTimeMs + 1) {
      const c = phaseContext(), ledger = context.actorPolicy.ledger;
      const runtime = context.delivery?.runtime ?? startNmlsFirstFinalDelivery(c.finalPhase);
      const command = { kind, eventId: randomUUID(), expectedRevision: runtime.revision, expectedActorRevision: ledger.revision,
        sessionId: runtime.sessionId, ...(ledger.observationJournal.active ? { studyReceipt: {
          windowId: ledger.observationJournal.active.id, visible: true } } : {}), ...extra };
      const r = createNmlsFirstFinalDeliveryEvaluator()({ ...c, runtime, ledger, command,
        evidence: { actorId: i.actorId, receivedAtMs: at } });
      context.delivery = { final_id: i.reservedFinal.id, student_id: i.actorId, review_attempt_id: i.review.id,
        phase_scope: nmlsFinalDeliveryScope(c.finalPhase), revision: r.runtime.revision, runtime: r.runtime };
      context.actorPolicy.revision = r.ledger.revision; context.actorPolicy.ledger = r.ledger;
      context.lease = { student_id: i.actorId, attempt_id: i.review.id, session_id: r.runtime.sessionId,
        phase_kind: 'final', phase_owner_id: i.reservedFinal.id, phase_active: r.runtime.status === 'active' };
      context.serverTimeMs = at; return r;
    },
  };
  h.act('activate'); if (acknowledge) h.act('heartbeat'); context.serverTimeMs++;
  h.rpc = async (name, args) => {
    calls.push({ name, args: clone(args) });
    if (name === 'nmls_first_final_submission_context') {
      const saved = events.get(args.p_event_id), c = clone(context);
      c.submissionEvent = saved ? clone(saved.submissionEvent) : null;
      c.deliveryEvent = saved ? clone(saved.deliveryEvent) : clone(deliveryOnly.get(args.p_event_id) ?? null);
      return h.contextHook ? h.contextHook(c, args) : c;
    }
    assert.equal(name, 'nmls_first_final_submission_commit');
    if (h.commitHook) await h.commitHook(args);
    const saved = events.get(args.p_event_id);
    if (saved) {
      if (saved.submissionEvent.command_digest !== args.p_command_digest) throw Error('synthetic_idempotency_conflict');
      const result = { duplicate: true, outcome: clone(saved.submissionEvent.outcome) };
      return h.resultHook ? h.resultHook(result) : result;
    }
    if (deliveryOnly.has(args.p_event_id)) throw Error('synthetic_event_pair_conflict');
    if (args.p_expected_source_revision !== context.attempt.revision || args.p_expected_final_revision !== context.reservedFinal.revision ||
        args.p_expected_delivery_revision !== context.delivery.revision || args.p_expected_actor_revision !== context.actorPolicy.revision) {
      throw Error('synthetic_revision_conflict');
    }
    if (args.p_expected_session_id !== context.delivery.runtime.sessionId) throw Error('synthetic_session_conflict');
    assert.equal(args.p_command_digest, digestNmlsCommand(args.p_intent));
    const t = args.p_transition, s = t.submission, beforeLease = clone(context.lease), recordedAt = new Date(context.serverTimeMs).toISOString();
    const deliveryIntent = { ...t.command, attemptId: i.review.id, finalAttemptId: i.reservedFinal.id,
      expectedSourceRevision: args.p_expected_source_revision, expectedFinalRevision: 1 };
    const deliveryDigest = digestNmlsCommand(deliveryIntent), transactionId = 100 + events.size;
    context.delivery = { ...context.delivery, revision: t.runtime.revision, runtime: clone(t.runtime) };
    context.actorPolicy.revision = t.ledger.revision; context.actorPolicy.ledger = clone(t.ledger);
    context.lease = { ...beforeLease, phase_active: false };
    if (s.submitted) {
      context.reservedFinal = { ...context.reservedFinal, revision: 2, answers: clone(s.answers), result: clone(s.result),
        remediation_manifest: clone(s.manifest), submitted_at: recordedAt };
      if (s.childRuntime) context.workflow = { first_final_id: i.reservedFinal.id, student_id: i.actorId,
        review_attempt_id: i.review.id, definition_digest: i.definition.digest, manifest: clone(s.manifest),
        revision: 1, status: 'remediating', runtime: clone(s.childRuntime), second_id: null, second_selection: null,
        second_answers: null, second_result: null, second_issued_at: null, second_submitted_at: null };
    }
    const outcome = { ok: s.submitted, code: s.submitted ? 'private_first_final_submitted' : 'private_first_final_submission_refused',
      status: s.submitted ? 200 : t.outcome.status === 401 ? 401 : 409, submitted: s.submitted,
      finalAttemptId: i.reservedFinal.id, finalRevision: s.submitted ? 2 : 1, sourceRevision: context.attempt.revision,
      actorRevision: t.ledger.revision, deliveryRevision: t.runtime.revision, submissionCode: s.code,
      deliveryCode: t.outcome.code, policyCode: t.outcome.policyCode, observationCode: t.outcome.observationCode,
      result: clone(s.result), remediation: clone(s.manifest), workflowRevision: s.childRuntime ? 1 : null,
      mode: 'private_authoring_review', deliveryAllowed: false, studentDeliveryEnabled: false,
      creditIssuanceAllowed: false, retakeEnabled: false };
    const deliveryEvent = { student_id: i.actorId, event_id: args.p_event_id, final_id: i.reservedFinal.id,
      review_attempt_id: i.review.id, command_digest: deliveryDigest, definition_digest: i.definition.digest,
      source_revision: context.attempt.revision, final_revision: 1, delivery_revision: t.runtime.revision,
      actor_revision: t.ledger.revision, lease_before: beforeLease, lease_after: clone(context.lease),
      runtime: clone(t.runtime), outcome: clone(t.outcome), audit: clone(t.audit), transaction_id: transactionId, recorded_at: recordedAt };
    const submissionEvent = { student_id: i.actorId, event_id: args.p_event_id, final_id: i.reservedFinal.id,
      review_attempt_id: i.review.id, command_digest: args.p_command_digest, delivery_command_digest: deliveryDigest,
      definition_digest: i.definition.digest, source_revision: context.attempt.revision, final_revision: outcome.finalRevision,
      delivery_revision: t.runtime.revision, actor_revision: t.ledger.revision, workflow_revision: outcome.workflowRevision,
      submitted: s.submitted, submission_payload_digest: digestNmlsCommand(s), outcome: clone(outcome),
      transaction_id: transactionId, recorded_at: recordedAt };
    events.set(args.p_event_id, { deliveryEvent, submissionEvent });
    const result = { duplicate: false, outcome };
    return h.resultHook ? h.resultHook(result) : result;
  };
  h.deps = { rpc: h.rpc, courseFor: () => clone(i.sourceCourse), definitionFor: () => clone(i.definition),
    evaluate: c => { evaluations++; return createNmlsFirstFinalSubmissionEvaluator()(c); } };
  h.run = (input = h.input(), overrides = {}, actorId = i.actorId) => transactNmlsFirstFinalSubmission(input, actorId, { ...h.deps, ...overrides });
  return h;
}
function noLeak(r) {
  for (const k of ['questions', 'answers', 'selection', 'definition', 'audit', 'ledger', 'runtime', 'childRuntime', 'sourceCourse', 'candidateUntilMs']) {
    assert.equal(Object.hasOwn(r.body, k), false, k);
  }
  for (const k of ['deliveryAllowed', 'studentDeliveryEnabled', 'creditIssuanceAllowed', 'retakeEnabled']) assert.equal(r.body[k], false);
  assert.doesNotMatch(JSON.stringify(r.body), /correctChoice|optionOrder|questionIds|Synthetic final problem|Synthetic final answer/);
}

test('submission transport accepts only immutable intent and exact25 answer values', async () => {
  const h = await harness(), valid = h.input(); assert.equal(validateNmlsFirstFinalSubmissionInput(valid), valid);
  for (const change of [{ kind: 'pause' }, { actorId: randomUUID() }, { expectedFinalRevision: 2 }, { expectedSourceRevision: 0 },
    { finalAttemptId: valid.attemptId }, { expectedRevision: -1 }, { expectedActorRevision: NaN }, { sessionId: 'bad' },
    { answers: null }, { answers: [] }, { result: {} }, { ledger: {} }, { phase: {} }, { selection: {} },
    { sourceCourse: {} }, { receivedAtMs: 0 }, { submission: {} }, { recoveryWindowId: randomUUID() }]) {
    assert.throws(() => validateNmlsFirstFinalSubmissionInput({ ...valid, ...change }));
  }
  for (const mutate of [a => { delete a[Object.keys(a)[0]]; }, a => { a.EXTRA = 'A'; },
    a => { a[Object.keys(a)[0]] = 0; }, a => { a[Object.keys(a)[0]] = 'a'; }, a => { a[Object.keys(a)[0]] = 'E'; }]) {
    const answers = clone(valid.answers); mutate(answers); assert.throws(() => validateNmlsFirstFinalSubmissionInput({ ...valid, answers }));
  }
  await assert.rejects(h.run(valid, {}, 'not-an-actor')); assert.equal(h.calls.length, 0);
});

test('fresh committed success returns sealed aggregate only and original intent is separate from derived pause', async () => {
  for (const correct of [18, 17]) {
    const h = await harness(), intent = h.input({ answers: h.answers(correct) }), source = clone(h.context.attempt), selection = clone(h.context.reservedFinal.selection);
    const r = await h.run(intent); noLeak(r); assert.equal(r.status, 200); assert.equal(r.body.duplicate, false);
    assert.equal(r.body.submitted, true); assert.equal(r.body.result.correct, correct); assert.equal(r.body.result.passed, correct === 18);
    assert.equal(r.body.finalRevision, 2); assert.equal(r.body.workflowRevision, correct === 17 ? 1 : null);
    assert.deepEqual(h.context.attempt, source); assert.deepEqual(h.context.reservedFinal.selection, selection);
    const commit = h.calls.at(-1).args;
    assert.deepEqual(commit.p_intent, intent); assert.equal(commit.p_command_digest, digestNmlsCommand(intent));
    assert.equal(commit.p_transition.command.kind, 'pause'); assert.equal(Object.hasOwn(commit.p_transition.command, 'answers'), false);
    assert.notEqual(commit.p_command_digest, digestNmlsCommand(commit.p_transition.command));
    assert.deepEqual(Object.keys(commit.p_transition).sort(), ['audit', 'command', 'ledger', 'outcome', 'phase', 'runtime', 'submission']);
    assert.equal(h.evaluations, 1);
  }
});

test('first-ack denial commits real close with null grade/child and never leaks submitted answers', async () => {
  const h = await harness({ acknowledge: false }), r = await h.run(); noLeak(r);
  assert.equal(r.status, 409); assert.equal(r.body.submitted, false); assert.equal(r.body.result, null); assert.equal(r.body.remediation, null);
  assert.equal(r.body.workflowRevision, null); assert.equal(h.context.reservedFinal.revision, 1);
  assert.equal(h.context.reservedFinal.answers, null); assert.equal(h.context.workflow, null);
  assert.deepEqual(h.calls.at(-1).args.p_transition.submission, { submitted: false, code: 'first_final_policy_refused',
    answers: null, result: null, manifest: null, childRuntime: null });
});

test('sealed revision2 replay bypasses constructor/evaluation and returns original result unchanged', async () => {
  const h = await harness(), intent = h.input({ answers: h.answers(17) }), first = await h.run(intent), before = clone(h.context);
  const r = await h.run(intent, { evaluate: () => { throw Error('MUST_NOT_REGRADE_REPLAY'); } });
  noLeak(r); assert.equal(r.body.duplicate, true); assert.deepEqual(r.body.result, first.body.result);
  assert.deepEqual(r.body.remediation, first.body.remediation); assert.deepEqual(h.context, before); assert.equal(h.evaluations, 1);
  assert.deepEqual(h.calls.at(-1).args.p_transition, {});
  const changed = { ...intent, answers: { ...intent.answers, [Object.keys(intent.answers)[0]]: 'D' } };
  await assert.rejects(h.run(changed, { evaluate: () => { throw Error('MUST_NOT_REGRADE_CHANGED_REPLAY'); } }));
});

test('old denied receipt remains content-free after a later successful submission', async () => {
  const h = await harness({ acknowledge: false }), old = h.input(); await h.run(old);
  h.act('resume'); h.act('heartbeat'); h.context.serverTimeMs++;
  assert.equal((await h.run()).body.submitted, true);
  const before = clone(h.context), count = h.evaluations, replay = await h.run(old);
  noLeak(replay); assert.equal(replay.body.duplicate, true); assert.equal(replay.body.submitted, false);
  assert.equal(replay.body.finalRevision, 1); assert.equal(replay.body.result, null); assert.equal(replay.body.remediation, null);
  assert.deepEqual(h.context, before); assert.equal(h.evaluations, count);
});

test('delivery-only event collision cannot append a submission receipt or invoke evaluation', async () => {
  const h = await harness({ acknowledge: false }), intent = h.input(); await h.run(intent);
  const pair = h.events.get(intent.eventId);
  h.deliveryOnly.set(intent.eventId, clone(pair.deliveryEvent)); h.events.delete(intent.eventId);
  const before = clone(h.context), count = h.evaluations;
  await assert.rejects(h.run(intent), /event_pair_conflict|invalid_commit_response/);
  assert.equal(h.evaluations, count); assert.deepEqual(h.context, before); assert.equal(h.events.size, 0);
});

test('every stale revision/session reaches locked resolution without evaluator or tentative grade', async () => {
  for (const patch of [{ expectedSourceRevision: 999 }, { expectedActorRevision: 999 }, { expectedRevision: 999 }, { sessionId: randomUUID() }]) {
    const h = await harness(); await assert.rejects(h.run(h.input(patch)), /synthetic_.*conflict/);
    assert.equal(h.evaluations, 0); assert.deepEqual(h.calls.at(-1).args.p_transition, {});
  }
  const h = await harness(); await h.run();
  await assert.rejects(h.run(h.input()), /revision_conflict|already_submitted|sealed/); assert.equal(h.evaluations, 1);
});

test('snapshot detaches nested answers, receipt, IDs and revisions before awaited context read', async () => {
  const h = await harness(), intent = h.input({ answers: h.answers(17) }), original = clone(intent);
  h.contextHook = c => { intent.answers[Object.keys(intent.answers)[0]] = 'D'; intent.kind = 'pause';
    intent.eventId = randomUUID(); intent.expectedActorRevision = 0; intent.studyReceipt.visible = false; return c; };
  const r = await h.run(intent); assert.equal(r.body.result.correct, 17);
  assert.deepEqual(h.calls.at(-1).args.p_intent, original); assert.equal(h.calls.at(-1).args.p_command_digest, digestNmlsCommand(original));
});

test('mutating RPC context arguments cannot replace original selectors for commit or retry', async () => {
  const h = await harness(), intent = h.input();
  h.contextHook = (c, args) => { args.p_event_id = randomUUID(); args.p_attempt_id = randomUUID(); return c; };
  await h.run(intent);
  const args = h.calls.at(-1).args;
  assert.equal(args.p_event_id, intent.eventId); assert.equal(args.p_attempt_id, intent.attemptId);
  assert.deepEqual(args.p_intent, intent);
});

test('a syntactically valid25-map containing unselected saved-bank IDs cannot reach commit', async () => {
  const h = await harness(), intent = h.input(), ids = Object.keys(intent.answers);
  const unselected = h.f.input.definition.items.find(item => !ids.includes(item.id)).id;
  delete intent.answers[ids[0]]; intent.answers[unselected] = 'A';
  assert.equal(validateNmlsFirstFinalSubmissionInput(intent), intent, 'transport cannot invent a selected form');
  await assert.rejects(h.run(intent), /invalid_answers/);
  assert.equal(h.calls.some(call => call.name.endsWith('_commit')), false);
});

test('source, definition, pair and sidecar substitutions fail before commit', async () => {
  for (const mutate of [c => c.attempt.runtime.completedUnitIds.pop(), c => c.reservation = null,
    c => c.teachingEvent.command_digest = 'a'.repeat(64), c => c.reservedFinal.selection.questionIds.reverse(),
    c => c.actorPolicy.revision--, c => c.binding.offering.id = randomUUID(),
    c => c.delivery.phase_scope.finalAttemptId = randomUUID(), c => c.delivery.runtime.revision++,
    c => c.reservedFinal.definition_digest = 'f'.repeat(64), c => c.attempt.student_id = randomUUID()]) {
    const h = await harness(); h.contextHook = c => { mutate(c); return c; };
    await assert.rejects(h.run()); assert.equal(h.calls.some(c => c.name.endsWith('_commit')), false);
  }
  const h = await harness();
  await assert.rejects(h.run(h.input(), { courseFor: () => { const c = clone(h.f.input.sourceCourse); c.modules[0].units[0].requiredSeconds++; return c; } }));
  await assert.rejects(h.run(h.input(), { definitionFor: () => { const d = clone(h.f.input.definition); d.items[0].correctChoice = 'D'; return d; } }));
  assert.equal(h.calls.some(c => c.name.endsWith('_commit')), false);
});

test('context shape and finite clocks are mandatory; missing receipt fields are not repaired', async () => {
  for (const mutate of [c => { delete c.submissionEvent; }, c => { delete c.deliveryEvent; }, c => { delete c.workflow; },
    c => { c.submissionEvent = []; }, c => { c.workflow = []; }, c => { delete c.delivery; },
    c => { c.serverTimeMs = NaN; }, c => { c.serverTimeMs = Infinity; }, c => { c.serverTimeMs = -1; }]) {
    const h = await harness(); h.contextHook = c => { mutate(c); return c; };
    await assert.rejects(h.run()); assert.equal(h.calls.some(c => c.name.endsWith('_commit')), false);
  }
});

test('altered evaluator proposals cannot commit grade, source, policy or child substitutions', async () => {
  for (const mutate of [r => r.submission.result.correct = 0, r => r.submission.result.questions = [],
    r => r.submission.answers[Object.keys(r.submission.answers)[0]] = 'D', r => r.submission.code = 'PRIVATE KEY',
    r => r.closing.ledger.studySinceBreakMs = 0, r => r.closing.runtime.lastActivityMs++,
    r => r.closing.audit.kind = 'submit_first_final', r => r.command.eventId = randomUUID(),
    r => r.submission.manifest.contentDigest = 'f'.repeat(64), r => r.submission.childRuntime.completedReviewMs = 1,
    r => r.submission.childRuntime.contentDigest = r.submission.manifest.sourceContentDigest]) {
    const h = await harness();
    await assert.rejects(h.run(h.input({ answers: h.answers(17) }), { evaluate: c => {
      const r = createNmlsFirstFinalSubmissionEvaluator()(c); mutate(r); return r;
    } }));
    assert.equal(h.calls.some(c => c.name.endsWith('_commit')), false);
  }
});

test('one bounded clock retry preserves intent and reevaluates only fresh unchanged CAS', async () => {
  const h = await harness(), intent = h.input(), original = clone(intent); let commits = 0;
  h.commitHook = () => { if (++commits === 1) { h.context.serverTimeMs += 100; throw Error('nmls_first_final_submission_clock_refresh_required'); } };
  assert.equal((await h.run(intent)).body.submitted, true); assert.equal(commits, 2); assert.equal(h.evaluations, 2);
  assert.ok(h.calls.filter(c => c.name.endsWith('_commit')).every(c => c.args.p_command_digest === digestNmlsCommand(original)));
  for (const c of h.calls.filter(c => c.name.endsWith('_commit'))) assert.deepEqual(c.args.p_intent, original);
  for (const reason of ['nmls_first_final_submission_clock_refresh_required', 'synthetic_network_failure']) {
    const x = await harness(); let count = 0; x.commitHook = () => { count++; throw Error(reason); };
    await assert.rejects(x.run(), new RegExp(reason)); assert.equal(count, reason.includes('clock') ? 2 : 1);
    assert.equal(x.context.reservedFinal.revision, 1); assert.equal(x.events.size, 0);
  }
  const x = await harness(); let count = 0;
  x.commitHook = () => { if (++count === 1) { x.act('heartbeat'); throw Error('nmls_first_final_submission_clock_refresh_required'); } };
  await assert.rejects(x.run(), /synthetic_revision_conflict/); assert.equal(x.evaluations, 1);
});

test('invalid dependencies and retry budgets fail before any RPC', async () => {
  for (const deps of [{ rpc: null }, { courseFor: null }, { definitionFor: null }, { evaluate: null },
    { clockRetries: -1 }, { clockRetries: 2 }, { clockRetries: NaN }, { clockRetries: Infinity }]) {
    const h = await harness(); await assert.rejects(h.run(h.input(), deps)); assert.equal(h.calls.length, 0);
  }
});

test('malformed fresh RPC results and modified commit arguments cannot leak a forged grade', async () => {
  for (const mutate of [r => r.questions = [], r => r.outcome.answers = {}, r => r.outcome.deliveryAllowed = true,
    r => r.outcome.actorRevision++, r => r.outcome.finalRevision = 1, r => r.outcome.result.correct = 0,
    r => r.outcome.submissionCode = 'PRIVATE RATIONALE', r => r.outcome.result.remediation.push({ key: 'PRIVATE' }),
    r => r.duplicate = null]) {
    const h = await harness(); h.resultHook = r => { mutate(r); return r; };
    await assert.rejects(h.run());
  }
  const h = await harness(); h.commitHook = args => {
    args.p_transition.submission.result.correct = 24; args.p_transition.submission.result.percent = 96;
  };
  await assert.rejects(h.run(), /invalid_commit_response|invalid_outcome|invalid_result/);
});

test('historical event pair, digests and immutable outcome constrain replay without evaluation', async () => {
  for (const mutate of [c => c.submissionEvent.command_digest = 'f'.repeat(64),
    c => c.submissionEvent.delivery_command_digest = 'f'.repeat(64), c => c.submissionEvent.submission_payload_digest = 'f'.repeat(64),
    c => c.submissionEvent.definition_digest = 'f'.repeat(64), c => c.submissionEvent.student_id = randomUUID(),
    c => c.submissionEvent.source_revision++, c => c.submissionEvent.delivery_revision++, c => c.submissionEvent.actor_revision++,
    c => c.submissionEvent.transaction_id++, c => c.deliveryEvent.command_digest = 'f'.repeat(64),
    c => c.deliveryEvent.runtime.lastActivityMs++, c => c.submissionEvent.outcome.result.correct = 0,
    c => c.reservedFinal.answers[Object.keys(c.reservedFinal.answers)[0]] = 'D']) {
    const h = await harness(), intent = h.input(); await h.run(intent); const count = h.evaluations;
    h.contextHook = c => { mutate(c); return c; };
    await assert.rejects(h.run(intent)); assert.equal(h.evaluations, count);
  }
  for (const mutate of [r => r.outcome.result.correct = 0, r => r.outcome.sourceRevision++,
    r => r.outcome.policyCode = 'PRIVATE KEY', r => r.outcome.observationCode = 'PRIVATE QUESTION', r => r.outcome.deliveryCode = 'PRIVATE TEXT']) {
    const h = await harness(), intent = h.input(); await h.run(intent); const count = h.evaluations;
    h.resultHook = r => { mutate(r); return r; };
    await assert.rejects(h.run(intent)); assert.equal(h.evaluations, count);
  }
});

test('concurrent exact replay rereads immutable pair once; a missing half cannot append or repair', async () => {
  const h = await harness(), intent = h.input(); await h.run(intent); let reads = 0;
  h.contextHook = c => { if (++reads === 1) { c.submissionEvent = null; c.deliveryEvent = null; } return c; };
  const r = await h.run(intent, { evaluate: () => { throw Error('MUST_NOT_EVALUATE_SEALED_CONCURRENT_REPLAY'); } });
  assert.equal(r.body.duplicate, true); noLeak(r); assert.equal(reads, 2);
  for (const half of ['deliveryEvent', 'submissionEvent']) {
    h.contextHook = c => { c[half] = null; return c; };
    await assert.rejects(h.run(intent, { evaluate: () => { throw Error('MUST_NOT_EVALUATE_BROKEN_PAIR'); } }));
  }
});

test('RPC outcome is detached before an awaited replay reread can mutate already-validated metadata', async () => {
  const h = await harness(), intent = h.input(); await h.run(intent);
  let reads = 0, returned;
  h.resultHook = result => { returned = result; return result; };
  h.contextHook = c => {
    if (++reads === 1) { c.submissionEvent = null; c.deliveryEvent = null; }
    else {
      // A mutating fake dependency retains its previous returned object. It
      // must not change the adapter's already-validated result across await.
      returned.outcome.questions = ['PRIVATE QUESTION MUST NOT LEAK'];
      c.submissionEvent.outcome.questions = ['PRIVATE QUESTION MUST NOT LEAK'];
    }
    return c;
  };
  await assert.rejects(h.run(intent), /invalid_commit_response|invalid_outcome/);
  assert.equal(reads, 2);
});
