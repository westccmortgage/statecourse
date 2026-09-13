import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { validateNmlsTeachingInput, transactNmlsTeaching } from '../netlify/functions/_lib/nmls-teaching-transaction.mjs';
import { digestNmlsCommand } from '../netlify/functions/_lib/nmls-review-service.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { NMLS_POLICY_DIGEST } from '../netlify/functions/_lib/nmls-policy-transaction.mjs';
import { NMLS_SESSION_POLICY as POLICY } from '../config/nmls/session-policy.mjs';
import { startNmlsCourseReview } from '../lib/nmls-review-runtime.mjs';
import { startNmlsSessionPolicy } from '../lib/nmls-session-policy.mjs';
import { createNmlsObservedPolicyReviewEvaluator } from '../lib/nmls-study-observer.mjs';
import { defineNmlsDraftFinal, drawNmlsDraftFinal, gradeNmlsDraftFinal,
  makeNmlsFinalRemediationCourse } from '../lib/nmls-final-assessment.mjs';

// Synthetic in-memory transport ONLY. This verifies adapter composition/input,
// not SQL locks, persistence, actual learners, ROCS, approval or duration.
const base = Date.parse('2026-06-01T12:00:00Z');
const sourceCourse = structuredClone(getNmlsReviewCourse('nmls-2026-f01-private-review'));
sourceCourse.id = 'synthetic-teaching-transport';
sourceCourse.modules[0].units = [{ ...sourceCourse.modules[0].units[0], requiredSeconds: 20 }];
delete sourceCourse.digest;
sourceCourse.digest = createHash('sha256').update(JSON.stringify(sourceCourse)).digest('hex');
const definition = defineNmlsDraftFinal(sourceCourse, { id: 'synthetic-teaching-final', moduleQuotas: { F01: 25 },
  items: Array.from({ length: 50 }, (_, i) => ({ id: `N26-FIN-F${String(i + 1).padStart(2, '0')}`,
    category: 'federal', moduleId: 'F01', objective: 'Synthetic adapter check.', stem: `Synthetic decision ${i + 1}?`,
    options: ['A', 'B', 'C', 'D'].map(id => ({ id, text: `Synthetic choice ${id}.` })), correctChoice: 'A',
    rationale: 'Synthetic rationale.', distractorRationales: { B: 'Synthetic wrong.', C: 'Synthetic wrong.', D: 'Synthetic wrong.' },
    independenceNote: 'Engineering fixture only.', sourceRefs: [{ url: 'https://www.consumerfinance.gov/rules-policy/regulations/',
      locator: 'Synthetic fixture.', supports: 'No legal assertion.', checkedOn: '2026-09-12' }],
    remediation: { unitIds: ['F01-U01'], focus: 'Synthetic practice.' },
  })) });

function harness() {
  const actor = randomUUID(), grant = randomUUID(), attemptId = randomUUID();
  const context = { attempt: { id: attemptId, student_id: actor, grant_id: grant,
    course_key: sourceCourse.id, content_digest: sourceCourse.digest, revision: 0, runtime: startNmlsCourseReview(sourceCourse) },
    binding: { grant_id: grant, policy_id: POLICY.id, policy_digest: NMLS_POLICY_DIGEST, offering: {
      id: grant, contentDigest: sourceCourse.digest, year: 2026, educationType: 'annual_ce', timeZone: 'UTC',
      deadlineBasisId: 'synthetic-only', opensAtMs: Date.UTC(2026, 0, 1), closesAtMs: Date.UTC(2027, 0, 1),
      rocs: { version: '4', documentDigest: 'c'.repeat(64), fullDocumentVerified: true, evidenceId: 'synthetic-only' },
    } }, actorPolicy: null, lease: null, firstFinal: null, workflow: null, serverTimeMs: base };
  let phaseKind = 'source';
  const calls = [], events = new Map(), evaluateReal = createNmlsObservedPolicyReviewEvaluator();
  let evaluations = 0, commitHook = null, contextHook = null;
  const h = { actor, context, calls, events, get evaluations() { return evaluations; },
    set commitHook(fn) { commitHook = fn; }, set contextHook(fn) { contextHook = fn; },
    get runtime() { return phaseKind === 'source' ? context.attempt.runtime : context.workflow.runtime; },
    get ledger() { return context.actorPolicy?.ledger ?? startNmlsSessionPolicy(actor); },
    advance(ms) { context.serverTimeMs += ms; },
    input(kind, extra = {}) {
      return { kind, attemptId, eventId: randomUUID(), expectedRevision: h.runtime.revision,
        expectedActorRevision: h.ledger.revision, sessionId: h.runtime.sessionId,
        phaseKind, phaseOwnerId: phaseKind === 'source' ? attemptId : context.firstFinal.id,
        expectedSourceRevision: context.attempt.revision,
        expectedWorkflowRevision: phaseKind === 'source' ? null : context.workflow.revision,
        ...(h.ledger.observationJournal?.active ? { studyReceipt: { windowId: h.ledger.observationJournal.active.id, visible: true } } : {}),
        ...extra };
    },
    async act(kind, extra) { context.serverTimeMs++; return transactNmlsTeaching(h.input(kind, extra), actor, h.options); },
    async begin() {
      await h.act('resume');
      await h.act('accept_rocs', { presentationId: randomUUID(), version: '4', documentDigest: 'c'.repeat(64), acknowledged: true });
      await h.act('resume');
    },
    child() {
      const review = context.attempt, id = randomUUID(), selection = drawNmlsDraftFinal(definition,
        { id, reviewAttemptId: attemptId, reviewState: review.runtime }, { draw: () => 0 });
      const answers = Object.fromEntries(selection.questionIds.map(id => [id, 'B']));
      const course = makeNmlsFinalRemediationCourse(definition, sourceCourse, selection, answers);
      const manifest = { courseKey: course.id, contentDigest: course.digest, sourceCourseKey: sourceCourse.id,
        sourceContentDigest: sourceCourse.digest, definitionDigest: definition.digest, finalAttemptId: id,
        reviewAttemptId: attemptId, moduleIds: course.modules.map(m => m.id), unitIds: course.modules.flatMap(m => m.units.map(u => u.id)),
        completed: false, retakeEnabled: false };
      context.firstFinal = { id, student_id: actor, review_attempt_id: attemptId, revision: 2,
        course_key: sourceCourse.id, content_digest: sourceCourse.digest, definition_digest: definition.digest,
        selection, answers, result: gradeNmlsDraftFinal(definition, selection, answers),
        submitted_at: new Date(++context.serverTimeMs).toISOString(), remediation_manifest: structuredClone(manifest) };
      context.workflow = { student_id: actor, review_attempt_id: attemptId, first_final_id: id,
        definition_digest: definition.digest, manifest, revision: 1, status: 'remediating', runtime: startNmlsCourseReview(course),
        second_id: null, second_selection: null, second_answers: null, second_result: null, second_issued_at: null, second_submitted_at: null };
      phaseKind = 'remediation'; return course;
    },
  };
  h.rpc = async (name, args) => {
    calls.push({ name, args: structuredClone(args) });
    if (name === 'nmls_teaching_context') {
      const value = structuredClone(context);
      if (args.p_phase_kind === 'source') { value.firstFinal = null; value.workflow = null; }
      return contextHook ? contextHook(value) : value;
    }
    if (name === 'nmls_policy_read_presentation') return { id: args.p_presentation_id, actorId: actor, offeringId: grant,
      contentDigest: sourceCourse.digest, documentDigest: 'c'.repeat(64), presentedAtMs: context.serverTimeMs };
    if (name !== 'nmls_teaching_commit') throw new Error(`unexpected_rpc_${name}`);
    if (commitHook) await commitHook(args);
    if (events.has(args.p_event_id)) {
      const prior = events.get(args.p_event_id);
      if (prior.digest !== args.p_command_digest) throw new Error('synthetic_idempotency_conflict');
      return { ...structuredClone(prior.result), duplicate: true };
    }
    if (args.p_expected_source_revision !== context.attempt.revision || args.p_expected_actor_revision !== h.ledger.revision ||
        args.p_expected_runtime_revision !== h.runtime.revision || args.p_expected_workflow_revision !== (context.workflow?.revision ?? null)) {
      throw new Error('synthetic_revision_conflict');
    }
    if (args.p_phase.kind === 'source') { context.attempt.runtime = structuredClone(args.p_runtime); context.attempt.revision++; }
    else { context.workflow.runtime = structuredClone(args.p_runtime); context.workflow.revision++; }
    context.actorPolicy = { student_id: actor, policy_id: POLICY.id, policy_digest: NMLS_POLICY_DIGEST,
      revision: args.p_ledger.revision, ledger: structuredClone(args.p_ledger) };
    const result = { duplicate: false, outcome: structuredClone(args.p_outcome), sourceRevision: context.attempt.revision,
      workflowRevision: context.workflow?.revision ?? null };
    events.set(args.p_event_id, { digest: args.p_command_digest, result: structuredClone(result) }); return result;
  };
  h.options = { rpc: h.rpc, courseFor: key => { assert.equal(key, sourceCourse.id); return sourceCourse; },
    definitionFor: key => { assert.equal(key, sourceCourse.id); return definition; },
    evaluate: async c => { evaluations++; return evaluateReal(c); } };
  return h;
}

async function finish(h) {
  await h.act('open_unit', { unitId: 'F01-U01' });
  await h.act('interaction', { visible: true, observation: 'keyboard' });
  h.advance(20000); await h.act('heartbeat', { visible: true });
  await h.act('unit_action', { choice: sourceCourse.modules[0].units[0].actionQuestion.correctChoice });
  await h.act('complete_unit'); await h.act('quiz_start', { moduleId: 'F01' });
  const quiz = h.runtime.quiz;
  return h.act('quiz_submit', { quizId: quiz.id, answers: Object.fromEntries(quiz.questionIds.map(id =>
    [id, sourceCourse.modules[0].quiz.bank.find(q => q.id === id).correctChoice])) });
}

test('teaching intent accepts only policy fields plus exact phase/revision selectors', () => {
  const h = harness(), source = h.input('resume'); assert.equal(validateNmlsTeachingInput(source), source);
  const child = { ...source, phaseKind: 'remediation', phaseOwnerId: randomUUID(), expectedWorkflowRevision: 1 };
  assert.equal(validateNmlsTeachingInput(child), child);
  for (const extra of [{ phaseKind: 'final' }, { phaseOwnerId: randomUUID() }, { expectedWorkflowRevision: 0 },
    { expectedSourceRevision: -1 }, { expectedSourceRevision: 1.5 }, { sessionId: {} },
    { ledger: {} }, { runtime: {} }, { layout: [] }, { sourceCourse: {} }, { teachingPhase: {} },
    { receivedAtMs: base }, { actorId: h.actor }, { offering: {} }, { grade: 100 }, { allowContentDigestMismatch: true }]) {
    assert.throws(() => validateNmlsTeachingInput({ ...source, ...extra }));
  }
  for (const extra of [{ phaseOwnerId: source.attemptId }, { expectedWorkflowRevision: null }, { expectedWorkflowRevision: 0 }]) {
    assert.throws(() => validateNmlsTeachingInput({ ...child, ...extra }));
  }
  const missing = { ...source }; delete missing.expectedWorkflowRevision;
  assert.throws(() => validateNmlsTeachingInput(missing));
  for (const kind of ['start', 'list', 'start_remediation', 'issue_first', 'issue_second', 'submit_second']) {
    assert.throws(() => validateNmlsTeachingInput({ ...source, kind }));
  }
});

test('source adapter uses branded original context, trusted presentation and compact commit layout', async () => {
  const h = harness(); await h.begin();
  const output = await h.act('open_unit', { unitId: 'F01-U01' });
  assert.equal(output.body.deliveryAllowed, true); assert.ok(output.body.progress.lessons[0].content);
  const committed = h.calls.at(-1).args;
  assert.equal(committed.p_phase.kind, 'source'); assert.equal(committed.p_phase.ownerId, h.context.attempt.id);
  assert.equal(committed.p_teaching_digest, sourceCourse.digest);
  assert.deepEqual(committed.p_layout, [{ id: 'F01', units: [{ id: 'F01-U01', requiredMs: 20000,
    requiredActionIds: [sourceCourse.modules[0].units[0].actionQuestion.id] }], passPercent: 80, questionsPerAttempt: 5 }]);
  assert.deepEqual(committed.p_outcome.progress.lessons, [{ id: 'F01-U01' }]);
  assert.equal(committed.p_ledger.creditIssuanceAllowed, false);
  assert.equal(committed.p_ledger.observationJournal.version, 'nmls-study-windows-v3-phase');
  assert.ok(h.calls.some(c => c.name === 'nmls_policy_read_presentation' && c.args.p_attempt_id === h.context.attempt.id));
  for (const key of ['binding', 'ledger', 'runtime', 'firstFinal', 'workflow', 'audit', 'sourceCourse', 'layout']) assert.equal(Object.hasOwn(output.body, key), false);
});

test('terminal source/child transitions preserve private feedback without delivering it or changing original authority', async () => {
  const h = harness(); await h.begin(); const finished = await finish(h);
  assert.equal(finished.body.teachingPhaseComplete, true); assert.equal(finished.body.deliveryAllowed, false);
  assert.deepEqual(finished.body.progress.lessons, []); assert.equal(finished.body.progress.feedback, null);
  assert.equal(h.runtime.feedback.passed, true, 'private terminal feedback survives proposed-context validation');
  const source = structuredClone(h.context.attempt), child = h.child(), first = structuredClone(h.context.firstFinal);
  await h.act('resume');
  const childFinished = await finish(h);
  assert.equal(childFinished.body.teachingPhaseComplete, true); assert.equal(childFinished.body.deliveryAllowed, false);
  assert.equal(childFinished.body.progress.contentDigest, child.digest);
  assert.deepEqual(h.context.attempt, source); assert.deepEqual(h.context.firstFinal, first);
  assert.equal(h.calls.at(-1).args.p_phase.sourceContentDigest, sourceCourse.digest);
  assert.equal(h.calls.at(-1).args.p_teaching_digest, child.digest);
  assert.equal(h.ledger.acceptances.length, 1); assert.equal(h.ledger.acceptances[0].contentDigest, sourceCourse.digest);
});

test('exact stale replay skips evaluation and presentation reads; SQL remains the CAS/idempotency authority', async () => {
  const h = harness(); await h.begin();
  const command = h.input('open_unit', { unitId: 'F01-U01' });
  const first = await transactNmlsTeaching(command, h.actor, h.options);
  assert.equal(first.body.deliveryAllowed, true);
  const count = h.evaluations, replay = await transactNmlsTeaching(command, h.actor, h.options);
  assert.equal(h.evaluations, count); assert.equal(replay.body.duplicate, true);
  assert.equal(replay.body.deliveryAllowed, false); assert.equal(replay.body.deliveryUntilMs, null);
  assert.equal(replay.body.studyWindow, null); assert.deepEqual(replay.body.progress.lessons, []);
  assert.equal(replay.body.progress.quiz, null); assert.equal(replay.body.progress.feedback, null);
  assert.deepEqual(h.calls.at(-1).args.p_outcome, {});
  const changed = { ...command, phaseOwnerId: randomUUID(), phaseKind: 'remediation', expectedWorkflowRevision: 1 };
  assert.notEqual(digestNmlsCommand(changed), digestNmlsCommand(command));
  const acknowledgment = h.input('accept_rocs', { presentationId: randomUUID(), version: '4', documentDigest: 'c'.repeat(64), acknowledged: true });
  acknowledgment.expectedSourceRevision++;
  const calls = h.calls.length;
  await assert.rejects(transactNmlsTeaching(acknowledgment, h.actor, h.options), /revision_conflict/);
  assert.equal(h.evaluations, count);
  assert.deepEqual(h.calls.slice(calls).map(c => c.name), ['nmls_teaching_context', 'nmls_teaching_commit']);
});

test('source/child context drift and missing or unverified authority fail before commit', async () => {
  for (const mutate of [c => c.attempt.id = randomUUID(), c => c.attempt.student_id = randomUUID(),
    c => c.binding.offering.rocs.fullDocumentVerified = false, c => c.binding.offering.contentDigest = 'd'.repeat(64),
    c => c.binding.policy_digest = 'd'.repeat(64), c => c.attempt.runtime.contentDigest = 'd'.repeat(64),
    c => c.workflow = {}, c => c.firstFinal = {}]) {
    const h = harness(); h.contextHook = c => { mutate(c); return c; };
    await assert.rejects(h.act('resume')); assert.equal(h.calls.some(c => c.name === 'nmls_teaching_commit'), false);
  }
  const h = harness(); await h.begin(); await finish(h); h.child();
  h.contextHook = c => { c.firstFinal.result.correct++; return c; };
  const count = h.calls.length; await assert.rejects(h.act('resume'), /first_result/);
  assert.equal(h.calls.slice(count).some(c => c.name === 'nmls_teaching_commit'), false);
});

test('proposed runtime/source/actor drift is rejected without committing', async () => {
  const actual = createNmlsObservedPolicyReviewEvaluator();
  for (const mutate of [r => r.runtime.contentDigest = 'd'.repeat(64), r => r.runtime.revision++,
    r => r.runtime.completedReviewMs++, r => r.ledger.actorId = randomUUID(), r => r.ledger.revision++,
    r => r.outcome.progress.contentDigest = 'd'.repeat(64), r => r.outcome.privateKey = 'no leak']) {
    const h = harness(); h.options.evaluate = async c => { const r = await actual(c); mutate(r); return r; };
    await assert.rejects(h.act('resume')); assert.equal(h.calls.some(c => c.name === 'nmls_teaching_commit'), false);
  }
});

test('clock refresh is bounded, reloads context and keeps canonical intent unchanged', async () => {
  const h = harness(), command = h.input('resume'); let failures = 0;
  h.commitHook = () => { if (failures++ === 0) { h.advance(1); throw new Error('nmls_teaching_clock_refresh_required'); } };
  await transactNmlsTeaching(command, h.actor, h.options);
  assert.equal(h.evaluations, 2);
  const commits = h.calls.filter(c => c.name === 'nmls_teaching_commit').map(c => c.args);
  assert.equal(commits.length, 2); assert.equal(commits[0].p_command_digest, commits[1].p_command_digest);
  assert.equal(commits[1].p_evaluated_at_ms, commits[0].p_evaluated_at_ms + 1);
  const blocked = harness(); blocked.commitHook = () => { throw new Error('nmls_review_clock_refresh_required'); };
  await assert.rejects(blocked.act('resume'), /clock_refresh_required/);
  assert.equal(blocked.calls.filter(c => c.name === 'nmls_teaching_commit').length, 2);
  await assert.rejects(transactNmlsTeaching(h.input('resume'), h.actor, { ...h.options, clockRetries: 2 }), /invalid_dependencies/);
});

test('input mutation during context load cannot alter the committed logical command', async () => {
  const h = harness(), command = h.input('resume'), digest = digestNmlsCommand(command);
  h.contextHook = value => { command.eventId = randomUUID(); command.expectedActorRevision = 123; return value; };
  await transactNmlsTeaching(command, h.actor, h.options);
  const commit = h.calls.at(-1).args;
  assert.equal(commit.p_command_digest, digest); assert.equal(commit.p_expected_actor_revision, 0);
});

test('response latency cannot deliver material after the committed horizon', async () => {
  const h = harness(); await h.begin();
  // Synthetic near-limit history provides a one-millisecond delivery budget.
  // This is a response-sanitization test, not a SQL provenance/seat-time test.
  h.context.actorPolicy.ledger.studySinceBreakMs = POLICY.breakAfterStudyMs - 1;
  h.commitHook = () => new Promise(resolve => setTimeout(resolve, 15));
  const output = await h.act('open_unit', { unitId: 'F01-U01' });
  assert.equal(h.calls.at(-1).args.p_delivery_until_ms, h.context.serverTimeMs + 1);
  assert.equal(output.body.duplicate, false); assert.equal(output.body.deliveryAllowed, false);
  assert.equal(output.body.deliveryUntilMs, null); assert.equal(output.body.studyWindow, null);
  assert.deepEqual(output.body.progress.lessons, []); assert.equal(output.body.progress.quiz, null);
  assert.equal(output.body.progress.feedback, null);
});

test('deadline crossing during hydration withholds lessons, quiz and feedback without another RPC or runtime change', async t => {
  for (const material of ['lesson', 'quiz', 'feedback']) {
    const h = harness(); await h.begin();
    let kind = 'open_unit', extra = { unitId: 'F01-U01' };
    if (material !== 'lesson') {
      await h.act('open_unit', { unitId: 'F01-U01' });
      await h.act('interaction', { visible: true, observation: 'keyboard' });
      if (material === 'quiz') {
        h.advance(20000); await h.act('heartbeat', { visible: true });
        await h.act('unit_action', { choice: sourceCourse.modules[0].units[0].actionQuestion.correctChoice });
        await h.act('complete_unit'); kind = 'quiz_start'; extra = { moduleId: 'F01' };
      } else {
        kind = 'unit_action'; extra = { choice: ['A', 'B', 'C', 'D'].find(choice =>
          choice !== sourceCourse.modules[0].units[0].actionQuestion.correctChoice) };
      }
    }
    const beforeCalls = h.calls.length, session = h.runtime.sessionId;
    // Only the adapter reads this monotonic clock. The pre-hydration read is
    // before the real committed30s horizon; the post-hydration read hits it.
    // No browser time, sleep, weakened lease or production dependency hook.
    const times = [1000, 1001, 1000 + POLICY.maximumObservationMs]; let reads = 0;
    const clock = t.mock.method(performance, 'now', () => {
      assert.ok(reads < times.length, 'unexpected monotonic read'); return times[reads++];
    });
    let output;
    try { output = await h.act(kind, extra); } finally { clock.mock.restore(); }
    assert.equal(reads, 3, material);
    const committed = h.calls.at(-1).args, saved = h.events.get(committed.p_event_id).result.outcome;
    assert.equal(committed.p_delivery_until_ms, h.context.serverTimeMs + POLICY.maximumObservationMs);
    assert.equal(saved.deliveryAllowed, true, `${material}: the genuine commit remains permitted`);
    if (material === 'lesson') assert.ok(saved.progress.lessons.length > 0);
    if (material === 'quiz') assert.ok(saved.progress.quiz?.questions.length > 0);
    if (material === 'feedback') assert.ok(saved.progress.feedback);
    assert.equal(output.body.deliveryAllowed, false); assert.equal(output.body.deliveryUntilMs, null);
    assert.equal(output.body.studyWindow, null); assert.deepEqual(output.body.progress.lessons, []);
    assert.equal(output.body.progress.quiz, null); assert.equal(output.body.progress.feedback, null);
    assert.equal(output.body.duplicate, false); assert.equal(h.runtime.status, 'active');
    assert.equal(h.runtime.sessionId, session); assert.deepEqual(h.runtime, committed.p_runtime);
    assert.deepEqual(h.calls.slice(beforeCalls).map(c => c.name), ['nmls_teaching_context', 'nmls_teaching_commit']);
  }
});

test('each stale CAS dimension skips reduction and changed intent cannot replay another event', async () => {
  for (const key of ['expectedSourceRevision', 'expectedRevision', 'expectedActorRevision']) {
    const h = harness(), command = h.input('resume'); command[key]++;
    await assert.rejects(transactNmlsTeaching(command, h.actor, h.options), /revision_conflict/);
    assert.equal(h.evaluations, 0); assert.deepEqual(h.calls.at(-1).args.p_outcome, {});
  }
  const h = harness(); await h.begin(); await finish(h); h.child();
  const stale = h.input('resume'); stale.expectedWorkflowRevision++;
  const before = h.evaluations;
  await assert.rejects(transactNmlsTeaching(stale, h.actor, h.options), /revision_conflict/);
  assert.equal(h.evaluations, before);
  const command = h.input('resume'); await transactNmlsTeaching(command, h.actor, h.options);
  await assert.rejects(transactNmlsTeaching({ ...command, expectedSourceRevision: command.expectedSourceRevision + 1 }, h.actor, h.options), /idempotency_conflict/);
});
