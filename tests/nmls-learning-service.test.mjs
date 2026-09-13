import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { executeNmlsLearningReview, nmlsLearningPublicError } from '../netlify/functions/_lib/nmls-learning-service.mjs';
import { makeFinalDeliveryFixture } from './helpers/nmls-final-delivery-fixture.mjs';
import { digestNmlsCommand } from '../netlify/functions/_lib/nmls-review-service.mjs';

// Application routing over actual adapter validators/reducers with fake RPC.
// These tests do not exercise HTTP identity, SQL, live grants or CE delivery.
const clone = structuredClone;
function cases() {
  const attemptId = randomUUID(), finalAttemptId = randomUUID(), secondFinalId = randomUUID(), sessionId = randomUUID();
  const common = { attemptId, eventId: randomUUID(), expectedRevision: 0, expectedActorRevision: 1, sessionId: null };
  const first = { ...common, finalAttemptId, expectedSourceRevision: 1, expectedFinalRevision: 1 };
  const second = { ...common, firstFinalId: finalAttemptId, secondFinalId, expectedSourceRevision: 1, expectedFinalRevision: 2, expectedWorkflowRevision: 5 };
  const answers = Object.fromEntries(Array.from({ length: 25 }, (_, i) => [`N26-FIN-F${String(i + 1).padStart(2, '0')}`, 'A']));
  return [
    ['teaching', { ...common, kind: 'resume', phaseKind: 'source', phaseOwnerId: attemptId,
      expectedSourceRevision: 0, expectedWorkflowRevision: null }, 'nmls_teaching_context'],
    ['reserve_first_final', { kind: 'reserve_first_final', attemptId, eventId: common.eventId, expectedSourceRevision: 1,
      expectedActorRevision: 1, expectedFinalRevision: 0, sessionId }, 'nmls_final_reservation_context'],
    ['first_final_delivery', { ...first, kind: 'activate' }, 'nmls_first_final_delivery_context'],
    ['submit_first_final', { ...first, kind: 'submit_first_final', expectedRevision: 2, sessionId, answers }, 'nmls_first_final_submission_context'],
    ['handoff_remediation', { ...first, kind: 'start_first_remediation', expectedFinalRevision: 2,
      expectedDeliveryRevision: 3, expectedWorkflowRevision: 1, sessionId }, 'nmls_first_final_handoff_context'],
    ['reserve_second_final', { kind: 'reserve_second_final', attemptId, firstFinalId: finalAttemptId, eventId: common.eventId,
      expectedSourceRevision: 1, expectedFinalRevision: 2, expectedWorkflowRevision: 3,
      expectedRevision: 2, expectedActorRevision: 1, sessionId }, 'nmls_second_final_reservation_context'],
    ['second_final_delivery', { ...second, kind: 'activate' }, 'nmls_second_final_delivery_context'],
    ['submit_second_final', { ...second, kind: 'submit_second_final', expectedRevision: 2, sessionId, answers }, 'nmls_second_final_submission_context'],
    ['snapshot', { grantId: randomUUID() }, 'nmls_learning_snapshot'],
  ];
}
const invalid = error => { assert.equal(nmlsLearningPublicError(error).status, 400); return true; };

test('all nine operations use their existing matching adapter and separately authenticated actor', async () => {
  const actor = randomUUID();
  for (const [operation, command, expectedRpc] of cases()) {
    const calls = [], marker = Error('SYNTHETIC_ROUTE_STOP');
    const pending = executeNmlsLearningReview({ operation, command }, actor, { rpc: async (name, args) => {
      calls.push({ name, args: clone(args) }); throw marker;
    } });
    if (operation === 'snapshot') {
      const unavailable = await pending; assert.equal(unavailable.status, 503);
      assert.equal(unavailable.body.code, 'nmls_learning_snapshot_unavailable');
    } else await assert.rejects(pending, error => error === marker);
    assert.equal(calls.length, 1, operation); assert.equal(calls[0].name, expectedRpc, operation);
    assert.equal(calls[0].args.p_student_id, actor, operation);
    if (operation === 'snapshot') assert.equal(calls[0].args.p_grant_id, command.grantId);
    else assert.equal(calls[0].args.p_attempt_id, command.attemptId);
    assert.doesNotMatch(calls[0].name, /_start$|_bind$|_present_rocs$|nmls_private_/);
  }
});

test('envelope is exact and unknown or legacy operations never reach RPC', async () => {
  const actor = randomUUID(), [operation, command] = cases()[0]; let calls = 0;
  const deps = { rpc: async () => { calls++; throw Error('MUST_NOT_CALL'); } };
  for (const value of [null, [], {}, { operation }, { command }, { operation, command, actorId: actor },
    { operation, command, rpc: 'injected' }, { operation, command, token: 'PRIVATE' },
    { operation, command: null }, { operation, command: [] }, { operation: ['teaching'], command }]) {
    await assert.rejects(executeNmlsLearningReview(value, actor, deps), invalid);
  }
  for (const op of ['constructor', '__proto__', 'toString', 'start', 'list', 'bind', 'present_rocs',
    'provision', 'nmls_teaching_commit', 'transactNmlsTeaching', 'executeNmlsReview', 'Teaching', 'teaching ']) {
    await assert.rejects(executeNmlsLearningReview({ operation: op, command }, actor, deps), invalid);
  }
  assert.equal(calls, 0);
});

test('every command rejects injected runtime, authority, evaluators, clocks and extra selectors before RPC', async () => {
  const actor = randomUUID(); let calls = 0;
  const deps = { rpc: async () => { calls++; throw Error('MUST_NOT_CALL'); } };
  for (const [operation, command] of cases()) {
    for (const [key, value] of Object.entries({ actorId: actor, studentId: actor, rpc: 'injected', evaluate: 'injected',
      ledger: {}, runtime: {}, phase: {}, policy: {}, offering: {}, history: {}, definition: {}, course: {},
      selection: {}, result: {}, receivedAtMs: 0, clockRetries: 0, deliveryAllowed: true })) {
      await assert.rejects(executeNmlsLearningReview({ operation, command: { ...command, [key]: value } }, actor, deps), invalid);
    }
  }
  assert.equal(calls, 0);
});

test('operations cannot switch to a different final or legacy command kind', async () => {
  const actor = randomUUID(); let calls = 0;
  for (const [operation, command] of cases()) {
    const changed = { ...command, kind: operation === 'snapshot' ? 'list' : 'start' };
    await assert.rejects(executeNmlsLearningReview({ operation, command: changed }, actor,
      { rpc: async () => { calls++; } }), invalid);
  }
  const [operation, command] = cases()[0];
  for (const kind of ['list', 'accept_identity', 'record_study', 'open_session']) {
    await assert.rejects(executeNmlsLearningReview({ operation, command: { ...command, kind } }, actor,
      { rpc: async () => { calls++; } }), invalid);
  }
  assert.equal(calls, 0);
});

test('non-JSON inputs, getters, cycles and resource-sized arrays are rejected without executing request code', async () => {
  const actor = randomUUID(), [operation, command] = cases()[0]; let calls = 0, getters = 0;
  const deps = { rpc: async () => { calls++; } }, valid = () => ({ operation, command: clone(command) });
  const accessor = valid(); Object.defineProperty(accessor.command, 'kind', { enumerable: true, get() { getters++; return 'resume'; } });
  const hidden = valid(); Object.defineProperty(hidden, 'private', { value: true });
  const symbol = valid(); symbol[Symbol('private')] = true;
  const cycle = valid(); cycle.command.extra = cycle;
  const inherited = Object.assign(Object.create({ actorId: actor }), valid());
  const nullPrototype = Object.assign(Object.create(null), valid());
  const array = []; array.length = 1000000000;
  for (const value of [accessor, hidden, symbol, cycle, inherited, nullPrototype,
    { operation, command: { ...command, extra: array } }, { operation, command: new Date() },
    ...[undefined, NaN, Infinity, 1n, () => {}, new Map(), /x/].map(extra => ({ operation, command: { ...command, extra } }))]) {
    await assert.rejects(executeNmlsLearningReview(value, actor, deps), invalid);
  }
  assert.equal(calls, 0); assert.equal(getters, 0);
});

test('authenticated actor is required independently of request and dependency contents', async () => {
  const [operation, command] = cases()[0]; let calls = 0;
  for (const actor of [null, undefined, '', 'invalid', 12, { id: randomUUID() }]) {
    await assert.rejects(executeNmlsLearningReview({ operation, command }, actor, { rpc: async () => { calls++; } }), error => {
      assert.deepEqual(nmlsLearningPublicError(error), { status: 401, body: { error: 'nmls_learning_authentication_required' } }); return true;
    });
  }
  assert.equal(calls, 0);
});

test('trusted dependencies are closed and never selected from a request', async () => {
  const actor = randomUUID(), [operation, command] = cases()[0]; let calls = 0, getters = 0;
  const rpc = async () => { calls++; }, base = { rpc }, badGetter = {};
  Object.defineProperty(badGetter, 'rpc', { enumerable: true, get() { getters++; return rpc; } });
  for (const deps of [undefined, null, [], {}, badGetter, { rpc: null }, { rpc, courseFor: undefined },
    { rpc, definitionFor: {} }, ...['evaluate', 'draw', 'clockRetries', 'monotonicMs', 'routes', 'studentId', 'snapshot']
      .map(key => ({ ...base, [key]: () => {} }))]) {
    await assert.rejects(executeNmlsLearningReview({ operation, command }, actor, deps), error => {
      assert.equal(nmlsLearningPublicError(error).status, 503); return true;
    });
  }
  assert.equal(calls, 0); assert.equal(getters, 0);
});

async function deliveryFixture() {
  const f = await makeFinalDeliveryFixture(), i = f.input;
  const context = { attempt: clone(i.review), binding: clone(i.binding), actorPolicy: clone(i.actorPolicy),
    reservedFinal: clone(i.reservedFinal), reservation: clone(i.reservation), teachingEvent: clone(i.teachingEvent),
    delivery: null, deliveryEvent: null, serverTimeMs: f.timeMs + 1 };
  const command = { kind: 'activate', attemptId: i.review.id, finalAttemptId: i.reservedFinal.id, eventId: randomUUID(),
    expectedSourceRevision: i.review.revision, expectedFinalRevision: 1, expectedRevision: 0,
    expectedActorRevision: i.actorPolicy.revision, sessionId: null };
  const calls = [], h = { f, context, command, calls, contextHook: null, commitHook: null };
  h.deps = { courseFor: key => { assert.equal(key, i.sourceCourse.id); return clone(i.sourceCourse); },
    definitionFor: key => { assert.equal(key, i.sourceCourse.id); return clone(i.definition); },
    rpc: async (name, args) => {
      calls.push({ name, args: clone(args) }); assert.equal(args.p_student_id, i.actorId);
      if (name === 'nmls_first_final_delivery_context') return h.contextHook ? h.contextHook(clone(context)) : clone(context);
      assert.equal(name, 'nmls_first_final_delivery_commit');
      if (h.commitHook) await h.commitHook(args);
      const p = args.p_transition;
      return { duplicate: false, outcome: clone(p.outcome), runtime: clone(p.runtime), sourceRevision: i.review.revision };
    } };
  h.run = envelope => executeNmlsLearningReview(envelope ?? { operation: 'first_final_delivery', command }, i.actorId, h.deps);
  return h;
}

test('real adapter projects only the saved form after commit; dispatcher makes no later RPC or grade call', async () => {
  const h = await deliveryFixture(); let release, commitEntered;
  const entered = new Promise(resolve => { commitEntered = resolve; });
  h.commitHook = () => { commitEntered(); return new Promise(resolve => { release = resolve; }); };
  let settled = false; const pending = h.run().then(result => { settled = true; return result; });
  await entered; await Promise.resolve(); assert.equal(settled, false);
  release(); const result = await pending;
  assert.equal(result.status, 200); assert.equal(result.body.deliveryAllowed, true);
  assert.deepEqual(result.body.questions.map(q => q.id), h.f.input.reservedFinal.selection.questionIds);
  assert.equal(result.body.questions.length, 25); assert.equal(result.body.studentDeliveryEnabled, false);
  assert.equal(result.body.creditIssuanceAllowed, false);
  assert.doesNotMatch(JSON.stringify(result), /correctChoice|rationale|optionOrder|sourcePayloadDigest/);
  assert.deepEqual(h.calls.map(c => c.name), ['nmls_first_final_delivery_context', 'nmls_first_final_delivery_commit']);
});

test('original input, operation and trusted loader references are pinned before the first await', async () => {
  const h = await deliveryFixture(), envelope = { operation: 'first_final_delivery', command: clone(h.command) }, original = clone(envelope);
  let release; h.contextHook = context => new Promise(resolve => { release = () => resolve(context); });
  const pending = h.run(envelope);
  envelope.operation = 'submit_second_final'; envelope.command.kind = 'logout'; envelope.command.eventId = randomUUID();
  envelope.command.attemptId = randomUUID(); envelope.command.answers = { PRIVATE: 'A' };
  h.deps.courseFor = () => { throw Error('MUTATED_DEPENDENCY'); };
  h.deps.definitionFor = () => { throw Error('MUTATED_DEPENDENCY'); };
  h.deps.rpc = () => { throw Error('MUTATED_DEPENDENCY'); };
  release(); const result = await pending;
  assert.equal(result.body.deliveryAllowed, true);
  const saved = h.calls.at(-1).args;
  assert.equal(saved.p_command_digest, digestNmlsCommand(original.command));
  assert.equal(saved.p_event_id, original.command.eventId); assert.equal(saved.p_attempt_id, original.command.attemptId);
  assert.equal(saved.p_transition.command.kind, 'activate');
});

test('failed committed workflow emits no tentative questions and is not retried by dispatcher', async () => {
  const h = await deliveryFixture(), marker = Error('PRIVATE_DATABASE_DETAIL'); let commits = 0;
  h.commitHook = () => { commits++; throw marker; };
  await assert.rejects(h.run(), error => error === marker); assert.equal(commits, 1);
  assert.deepEqual(nmlsLearningPublicError(marker), { status: 503, body: { error: 'nmls_learning_unavailable' } });
});

test('public error vocabulary distinguishes only explicitly recognized authorization, revision and request failures', () => {
  const categories = new Map([
    [401, ['nmls_learning_authentication_required', 'student_auth_required', 'invalid_student_session']],
    [400, ['nmls_learning_invalid_request', 'nmls_learning_snapshot_invalid_request']],
    [403, ['origin_not_allowed', 'nmls_review_access_denied', 'nmls_final_access_denied', 'nmls_first_final_delivery_access_denied',
      'nmls_first_final_submission_access_denied', 'nmls_first_final_handoff_access_denied',
      'nmls_second_final_access_denied', 'nmls_second_final_delivery_access_denied',
      'nmls_second_final_submission_access_denied', 'nmls_learning_snapshot_access_denied']],
    [409, ['nmls_review_revision_conflict', 'nmls_final_revision_conflict', 'nmls_review_session_conflict',
      'nmls_review_idempotency_conflict', 'nmls_review_clock_refresh_required', 'nmls_final_clock_refresh_required',
      'nmls_final_already_issued', 'nmls_first_final_submission_already_submitted',
      'nmls_first_final_handoff_already_recorded', 'nmls_first_final_handoff_first_not_failed',
      'nmls_second_final_already_reserved', 'nmls_second_final_remediation_incomplete',
      'nmls_second_final_submission_already_submitted', 'nmls_learning_snapshot_requires_review']],
  ]);
  for (const [status, codes] of categories) for (const code of codes) {
    assert.deepEqual(nmlsLearningPublicError(Object.assign(Error(code), { detail: 'PRIVATE', hint: 'PRIVATE', statusCode: 201 })),
      { status, body: { error: code } });
    for (const text of [`${code}: PRIVATE`, `ERROR: ${code}`, ` ${code}`, `${code}\n`, `${code}_PRIVATE`]) {
      assert.equal(nmlsLearningPublicError(Error(text)).status, 503);
    }
  }
});

test('raw PostgreSQL errors, unknown code families, forged statuses and message getters are opaque', () => {
  let getters = 0; const accessor = { get message() { getters++; return 'nmls_review_access_denied'; } };
  const expected = { status: 503, body: { error: 'nmls_learning_unavailable' } };
  for (const error of [null, undefined, 'nmls_review_access_denied', accessor,
    { code: 'nmls_review_access_denied', message: 'PRIVATE SQL' },
    { message: 'PRIVATE', statusCode: 400 }, { message: 'nmls_future_access_denied', statusCode: 403 },
    { message: 'nmls_first_final_submission_invalid_transition', statusCode: 400 },
    { message: 'duplicate key value violates unique constraint PRIVATE', code: '23505', detail: 'PRIVATE' },
    Error('nmls_learning_invalid_dependencies'), Error('nmls_final_delivery_underreported_exposure'),
    ...['student_auth_not_configured', 'student_auth_unavailable', 'base_url_not_configured', 'database_not_configured'].map(code => Error(code))]) {
    assert.deepEqual(nmlsLearningPublicError(error), expected);
  }
  assert.equal(getters, 0);
});
