import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { TrainingClient, isTrainingSnapshot, postTraining } from '../public/statecourse/student/nmls-training/training-client.mjs';
import { executeNmlsTraining } from '../netlify/functions/_lib/nmls-training-service.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { getNmlsDraftFinalDefinition } from '../lib/nmls-final-authoring-content.mjs';
import { NMLS_TRAINING_COURSE as identity } from '../config/nmls-course-identity.mjs';

const settle = async () => { for (let i = 0; i < 4; i++) await new Promise(r => setImmediate(r)); };
function body(enrollmentId, revision = 0) {
  return { mode: 'free_training', creditIssuanceAllowed: false, nmlsCreditEligible: false, courseCompletionIssued: false,
    enrollmentId, course: { id: identity.id, version: identity.version, title: 'Free mortgage training' }, revision, phase: 'source',
    progress: { mode: 'free_training', status: 'active', sessionId: randomUUID(), completedPracticeMs: 0, provisionalPracticeMs: 0,
      completedUnitIds: [], passedModuleIds: [], modules: [], lessons: [], quiz: null }, assessment: null, result: null };
}
test('same-origin request carries no browser actor, credential storage or independent endpoint', async () => {
  let seen;
  const input = { operation: 'snapshot', command: { enrollmentId: randomUUID() } };
  await postTraining(input, async (url, options) => { seen = { url, options }; return new Response('{}'); });
  assert.equal(seen.url, '/api/student/nmls/training'); assert.equal(seen.options.credentials, 'same-origin');
  assert.equal(seen.options.cache, 'no-store'); assert.deepEqual(JSON.parse(seen.options.body), input);
});
test('initial snapshot is read-only; missing or invalid enrollment never sends a request', async () => {
  const calls = [], id = randomUUID();
  const client = new TrainingClient({ transport: async input => { calls.push(input); return { status: 200, body: body(id) }; } });
  await client.open(null); await client.open('//external'); assert.equal(calls.length, 0);
  await client.open(id); assert.deepEqual(calls, [{ operation: 'snapshot', command: { enrollmentId: id } }]);
  assert.equal(client.view.phase, 'ready'); assert.equal(client.view.snapshot.revision, 0);
  await client.open(id.toUpperCase()); assert.equal(client.view.phase, 'ready'); assert.equal(calls.at(-1).command.enrollmentId, id);
});
test('serializes writes behind a poll and binds the next command to acknowledged top-level revision', async () => {
  const id = randomUUID(), calls = []; let release, count = 0;
  const client = new TrainingClient({ transport: async input => {
    calls.push(input); if (input.operation === 'snapshot') return { status: 200, body: body(id, 7) };
    if (++count === 1) await new Promise(resolve => release = resolve);
    return { status: 200, body: body(id, 7 + count) };
  } });
  await client.open(id);
  const poll = client.teach('heartbeat', { visible: true }, { background: true });
  const action = client.teach('unit_action', { choice: 'A' });
  assert.equal(calls.length, 2); assert.equal(client.view.foregroundPending, true);
  assert.deepEqual(await client.teach('heartbeat', { visible: true }, { background: true }), { coalesced: true });
  release(); await poll; await action;
  assert.equal(calls[1].command.expectedRevision, 7); assert.equal(calls[2].command.expectedRevision, 8);
  assert.notEqual(calls[1].command.eventId, calls[2].command.eventId); assert.equal(client.view.snapshot.revision, 9);
});
test('lost assessment response retries byte-identical ID, answers and revision; no automatic redraw', async () => {
  const id = randomUUID(), calls = []; let lost = true;
  const client = new TrainingClient({ transport: async input => {
    calls.push(input); if (input.operation === 'snapshot') return { status: 200, body: body(id, 1) };
    if (lost) { lost = false; throw Error('after server commit'); }
    return { status: 200, body: { ...body(id, 2), phase: 'passed' } };
  } });
  await client.open(id);
  const answers = { original: 'A' }, promise = client.send('submit_assessment', { assessmentId: randomUUID(), answers });
  answers.original = 'B'; await settle();
  assert.equal(client.view.phase, 'uncertain'); assert.equal(calls.length, 2);
  assert.deepEqual(await client.send('issue_assessment'), { cancelled: true });
  await client.retry(); await promise;
  assert.deepEqual(calls[1], calls[2]); assert.equal(calls[2].command.answers.original, 'A');
  assert.equal(client.view.snapshot.phase, 'passed');
});
test('replayed poll without a lease cancels a queued answer and requires a new explicit Resume', async () => {
  const id = randomUUID(), calls = []; let rejectPoll, first = true;
  const client = new TrainingClient({ transport: async input => {
    calls.push(structuredClone(input));
    if (input.operation === 'snapshot') return { status: 200, body: body(id, 2) };
    if (first) { first = false; await new Promise((_, reject) => rejectPoll = reject); }
    const replay = body(id, 3); replay.progress.sessionId = null; replay.progress.resumeRequired = true;
    return { status: 200, body: { ...replay, replayed: true } };
  } });
  await client.open(id);
  const poll = client.teach('heartbeat', { visible: true }, { background: true });
  const queued = client.teach('unit_action', { choice: 'A' });
  rejectPoll(Error('response lost')); await settle(); assert.equal(client.view.phase, 'uncertain');
  await client.retry(); await poll; assert.deepEqual(await queued, { cancelled: true });
  assert.equal(calls.length, 3); assert.equal(calls.some(call => call.command.action?.kind === 'unit_action'), false);
  assert.equal(client.view.snapshot.progress.sessionId, null);
  assert.deepEqual(await client.teach('complete_unit'), { cancelled: true });
});
test('replayed responses cannot regress saved progress and wrong course identities cannot be accepted', async () => {
  const id = randomUUID(); let wrong = false;
  const client = new TrainingClient({ transport: async input => ({ status: 200, body: input.operation === 'snapshot' ? body(id, 4)
    : wrong ? { ...body(id, 5), enrollmentId: randomUUID() } : body(id, 2) }) });
  await client.open(id); await client.teach('heartbeat', { visible: true }); assert.equal(client.view.snapshot.revision, 4);
  wrong = true; const request = client.teach('heartbeat', { visible: true }); await settle();
  assert.equal(client.view.phase, 'uncertain'); assert.equal(client.view.snapshot.revision, 4);
  client.stop(); await request;
  assert.equal(isTrainingSnapshot({ ...body(id), creditIssuanceAllowed: true }, id), false);
  assert.equal(isTrainingSnapshot({ ...body(id), course: { id: 'ca-principles' } }, id), false);
});
test('auth, revoked access and revision conflict clear all private progress and cancel queued writes', async () => {
  for (const [status, error, phase] of [[401, 'authentication_required', 'auth'], [403, 'nmls_training_access_denied', 'denied'], [409, 'nmls_training_revision_conflict', 'recover']]) {
    const id = randomUUID();
    const client = new TrainingClient({ transport: async input => input.operation === 'snapshot' ? { status: 200, body: body(id) } : { status, body: { error } } });
    await client.open(id); await client.teach('unit_action', { choice: 'A' });
    assert.equal(client.view.phase, phase); assert.equal(client.view.snapshot, null);
  }
});
test('render failure cancels promises and clears private state; late response after stop is ignored', async () => {
  const id = randomUUID(); let release, renderFail = false;
  const client = new TrainingClient({ onChange() { if (renderFail) throw Error('DOM fault'); }, transport: async input => {
    if (input.operation !== 'snapshot') await new Promise(resolve => release = resolve);
    return { status: 200, body: body(id) };
  } });
  await client.open(id); const pending = client.teach('heartbeat', { visible: true }); client.stop(); release(); await pending; await settle();
  assert.equal(client.view.snapshot, null); assert.equal(client.view.phase, 'idle');
  renderFail = true; await client.open(id); assert.equal(client.view.phase, 'render_error'); assert.equal(client.view.snapshot, null);
});
test('actual service projections for initial/resume/first real lesson meet browser contract without answer keys', async () => {
  const enrollment = randomUUID(), actor = randomUUID(), course = getNmlsReviewCourse(identity.contentKey), definition = getNmlsDraftFinalDefinition(course.id);
  let runtime = null, revision = 0; const events = new Map();
  const context = eventId => ({ enrollmentId: enrollment, studentId: actor, courseId: identity.id, courseVersion: identity.version,
    reviewRole: null, contentDigest: course.digest, definitionDigest: definition.digest, revision, runtime, serverTimeMs: 1_790_000_000_000, event: events.get(eventId) || null });
  const rpc = async (name, p) => {
    if (name === 'nmls_training_commit') { runtime = p.p_runtime; revision++; events.set(p.p_event_id, { command_digest: p.p_command_digest, audit: p.p_audit }); return { ...context(p.p_event_id), replayed: false }; }
    return context(p.p_event_id);
  };
  const client = new TrainingClient({ transport: input => executeNmlsTraining(input, actor, { rpc }) });
  await client.open(enrollment); assert.equal(client.view.snapshot.phase, 'not_started');
  await client.teach('resume'); await client.teach('open_unit', { unitId: course.modules[0].units[0].id });
  assert.equal(client.view.phase, 'ready');
  assert.equal(client.view.snapshot.progress.lessons[0].content, course.modules[0].units[0].content);
  assert.doesNotMatch(JSON.stringify(client.view.snapshot), /"(?:correctChoice|definitionDigest|selection|sourcePayloadDigest)":/);
});
test('actual regulator projection is strictly read-only; every client write is cancelled before transport', async () => {
  const enrollment = randomUUID(), actor = randomUUID(), course = getNmlsReviewCourse(identity.contentKey), definition = getNmlsDraftFinalDefinition(course.id), calls = [];
  const rpc = async name => {
    assert.equal(name, 'nmls_training_context', 'Regulator snapshot must not call a commit RPC');
    return { enrollmentId: enrollment, studentId: actor, courseId: identity.id, courseVersion: identity.version, reviewRole: 'regulator_reviewer',
      contentDigest: course.digest, definitionDigest: definition.digest, revision: 0, runtime: null, serverTimeMs: 1_790_000_000_000, event: null };
  };
  const client = new TrainingClient({ transport: input => { calls.push(input); return executeNmlsTraining(input, actor, { rpc }); } });
  await client.open(enrollment);
  const s = client.view.snapshot;
  assert.equal(client.view.phase, 'ready'); assert.equal(isTrainingSnapshot(s, enrollment), true);
  assert.equal(s.phase, 'read_only_review'); assert.equal(s.progress, null);
  assert.equal(s.review.modules.flatMap(m => m.lessons).length, 45);
  assert.doesNotMatch(JSON.stringify(s), /"(?:correctChoice|rationale|definitionDigest|selection|sourcePayloadDigest)":/);
  for (const kind of ['resume', 'open_unit', 'unit_action', 'heartbeat', 'logout']) assert.deepEqual(await client.teach(kind), { cancelled: true });
  for (const operation of ['issue_assessment', 'submit_assessment', 'start_remediation']) assert.deepEqual(await client.send(operation), { cancelled: true });
  assert.equal(calls.length, 1);
  for (const patch of [{ readOnly: false }, { accessMode: 'student' }, { phase: 'source' }, { progress: {} }, { creditIssuanceAllowed: true }, { assessment: {} }]) {
    assert.equal(isTrainingSnapshot({ ...s, ...patch }, enrollment), false);
  }
});
