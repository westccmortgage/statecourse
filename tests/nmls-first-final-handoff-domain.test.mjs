import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeFirstFinalHandoffFixture } from './helpers/nmls-first-final-handoff-fixture.mjs';
import { makeNmlsFirstFinalHandoffContext, createNmlsFirstFinalHandoffEvaluator,
  validateNmlsFirstFinalHandoffCommand, validateNmlsFirstFinalHandoffHistory } from '../lib/nmls-first-final-handoff.mjs';
import { createNmlsObservedPolicyReviewEvaluator } from '../lib/nmls-study-observer.mjs';
import { nmlsTeachingPhaseScope, makeNmlsRemediationTeachingContext } from '../lib/nmls-teaching-phase.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { NMLS_OSS_REQUIREMENTS as R } from '../config/nmls/oss-policy.mjs';

// Actual pure transitions with explicitly synthetic row-shaped history only.
// No SQL atomicity, authentic identity, learner delivery or credit is proved.
const clone = structuredClone;
const context = f => ({ ...makeNmlsFirstFinalHandoffContext(f.input), command: f.command, evidence: f.evidence });
function contentFree(r) {
  assert.equal(r.runtime.current, null); assert.equal(r.runtime.quiz, null); assert.equal(r.runtime.feedback, null);
  assert.equal(r.runtime.completedReviewMs, 0); assert.deepEqual(r.runtime.completedUnitIds, []);
  assert.deepEqual(r.runtime.passedModuleIds, []); assert.deepEqual(r.outcome.progress.lessons, []);
  assert.equal(r.outcome.progress.quiz, null); assert.equal(r.outcome.progress.feedback, null);
  assert.equal(r.ledger.observationJournal.active, null); assert.equal(r.ledger.observationJournal.unresolved, null);
  assert.equal(r.runtime.creditIssuanceAllowed, false); assert.equal(r.ledger.creditIssuanceAllowed, false);
  assert.equal(Object.hasOwn(r.audit.policy, 'observation'), false);
}

test('exact failed genesis composes real child resume under unchanged original offering', async () => {
  const f = await makeFirstFinalHandoffFixture(), before = clone(f), c = context(f), id = randomUUID();
  const r = await createNmlsFirstFinalHandoffEvaluator({ newId: () => id })(c);
  const actual = await createNmlsObservedPolicyReviewEvaluator({ runtimeOptions: { newId: () => id } })({ ...c, command: r.command });
  assert.deepEqual(Object.keys(r).sort(), ['audit', 'command', 'ledger', 'outcome', 'runtime']);
  for (const key of ['runtime', 'ledger', 'outcome', 'audit']) assert.deepEqual(r[key], actual[key]);
  assert.deepEqual(f, before); assert.equal(r.command.kind, 'resume'); assert.equal(r.command.sessionId, null);
  assert.equal(r.command.attemptId, f.input.review.id); assert.equal(r.command.phaseOwnerId, f.input.firstFinal.id);
  assert.equal(c.offering.contentDigest, f.input.sourceCourse.digest); assert.notEqual(c.course.digest, c.offering.contentDigest);
  assert.equal(nmlsTeachingPhaseScope(c.teachingPhase).kind, 'remediation');
  assert.equal(r.runtime.revision, 1); assert.equal(r.runtime.sessionId, id); assert.equal(r.runtime.status, 'active');
  assert.equal(r.runtime.lastActivityMs, f.evidence.receivedAtMs); assert.equal(r.ledger.revision, f.command.expectedActorRevision + 1);
  assert.equal(r.outcome.policyCode, 'session_policy_allowed'); assert.equal(r.outcome.deliveryAllowed, true);
  assert.ok(r.outcome.deliveryUntilMs > f.evidence.receivedAtMs); assert.equal(r.outcome.studyWindow, null);
  contentFree(r);
});

test('a passing first final never mints failed-child handoff authority', async () => {
  const f = await makeFirstFinalHandoffFixture({ correct: 25 });
  assert.equal(f.input.firstFinal.result.passed, true); assert.equal(f.input.workflow, null);
  assert.throws(() => context(f), /first_result/);
});

test('acknowledged same-millisecond submission history needs no invented positive final duration', async () => {
  const f = await makeFirstFinalHandoffFixture({ submissionElapsedMs: 0 });
  assert.equal(Object.hasOwn(f.input.deliveryEvent.audit.policy, 'observation'), false);
  const r = await createNmlsFirstFinalHandoffEvaluator()(context(f));
  assert.equal(r.outcome.policyCode, 'session_policy_allowed'); contentFree(r);
});

test('saved result, manifest, source payload and child genesis cannot be rewritten or relabeled', async () => {
  const base = await makeFirstFinalHandoffFixture();
  for (const change of [
    i => { i.firstFinal.result.correct++; }, i => { i.firstFinal.answers[i.firstFinal.selection.questionIds[0]] = 'A'; },
    i => { i.sourceCourse.modules[0].units[0].requiredSeconds++; },
    i => { i.definition.sourcePayloadDigest = 'f'.repeat(64); },
    i => { i.firstFinal.remediation_manifest.contentDigest = i.sourceCourse.digest; },
    i => { i.workflow.runtime.contentDigest = i.sourceCourse.digest; }, i => { i.workflow.revision = 2; },
    i => { i.workflow.runtime.lastReceiptMs = 1; }, i => { i.workflow.runtime.bookmark = null; },
    i => { i.workflow.second_id = randomUUID(); }, i => { i.review.runtime.status = 'active'; },
  ]) {
    const f = clone(base); change(f.input); assert.throws(() => context(f), /nmls_/);
  }
});

test('036/035 and original033 receipt halves, hashes, revisions and owner pins are mandatory', async () => {
  const base = await makeFirstFinalHandoffFixture();
  for (const change of [
    i => { i.submissionEvent = null; }, i => { i.deliveryEvent = null; }, i => { i.reservation = null; },
    i => { i.teachingEvent = null; }, i => { i.submissionEvent.submitted = false; },
    i => { i.submissionEvent.transaction_id++; }, i => { i.deliveryEvent.event_id = randomUUID(); },
    i => { i.submissionEvent.command_digest = 'f'.repeat(64); }, i => { i.submissionEvent.delivery_command_digest = 'f'.repeat(64); },
    i => { i.submissionEvent.submission_payload_digest = 'f'.repeat(64); },
    i => { i.deliveryEvent.command_digest = 'f'.repeat(64); }, i => { i.submissionEvent.source_revision++; },
    i => { i.submissionEvent.actor_revision++; }, i => { i.submissionEvent.workflow_revision = 2; },
    i => { i.submissionEvent.outcome.result.correct++; }, i => { i.submissionEvent.student_id = randomUUID(); },
    i => { i.reservation.selection_digest = 'f'.repeat(64); }, i => { i.teachingEvent.lease_after.phase_active = true; },
  ]) {
    const f = clone(base); change(f.input); assert.throws(() => context(f), /nmls_/);
  }
});

test('paused final sidecar, original acknowledged closure and dormant final lease must agree', async () => {
  const base = await makeFirstFinalHandoffFixture();
  for (const change of [
    i => { i.delivery.runtime.lastActivityMs++; }, i => { i.delivery.revision++; },
    i => { i.delivery.phase_scope.contentDigest = i.workflow.runtime.contentDigest; },
    i => { i.lease.phase_kind = 'remediation'; }, i => { i.lease.phase_active = true; },
    i => { i.lease.session_id = randomUUID(); }, i => { i.deliveryEvent.lease_before.phase_active = false; },
    i => { i.deliveryEvent.audit.observation.firstAcknowledgment = true; },
    i => { i.deliveryEvent.audit.observation.closedWindow.lastObservedAtMs--; },
    i => { i.deliveryEvent.audit.observation.windowBefore.scope.actorId = randomUUID(); },
    i => { i.deliveryEvent.audit.observation.windowBefore.horizonMs = i.deliveryEvent.audit.atMs; },
    i => { i.deliveryEvent.outcome.candidateMaterialAllowed = true; },
    i => { i.deliveryEvent.audit.creditAddedMs = 1; },
    i => { delete i.deliveryEvent.audit.policy.observation; },
    i => { i.deliveryEvent.audit.policy.observation.observedOutsidePolicy = true; },
    i => { i.submissionEvent.recorded_at = new Date(i.deliveryEvent.audit.atMs - 1).toISOString(); },
  ]) {
    const f = clone(base); change(f.input); assert.throws(() => context(f), /nmls_/);
  }
});

test('existing v3 empty journal is required; held or foreign evidence cannot be cleared by handoff', async () => {
  const base = await makeFirstFinalHandoffFixture();
  for (const kind of ['missing', 'v2', 'active', 'hold']) {
    const f = clone(base), ledger = f.input.actorPolicy.ledger;
    if (kind === 'missing') delete ledger.observationJournal;
    if (kind === 'v2') ledger.observationJournal.version = 'nmls-study-windows-v2';
    if (kind === 'active') ledger.observationJournal.active = clone(f.input.deliveryEvent.audit.observation.windowBefore);
    if (kind === 'hold') ledger.observationJournal.unresolved = { window: clone(f.input.deliveryEvent.audit.observation.windowBefore),
      reason: 'receipt_missing_or_stale', eventId: randomUUID(), detectedAtMs: ledger.lastReceiptMs };
    const before = clone(ledger); assert.throws(() => context(f), /observation_history/); assert.deepEqual(ledger, before);
  }
});

test('brand rejects clone, input mutations, actor-ledger rollback and time before current authority', async () => {
  const f = await makeFirstFinalHandoffFixture(), c = context(f), evaluate = createNmlsFirstFinalHandoffEvaluator();
  await assert.rejects(() => evaluate({ ...c, handoffPhase: clone(c.handoffPhase) }), /untrusted_context/);
  for (const change of [
    x => { x.ledger.studySinceBreakMs = 0; }, x => { x.ledger.revision--; }, x => { x.runtime.lastReceiptMs = 1; },
    x => { x.offering.contentDigest = x.course.digest; }, x => { x.evidence.actorId = randomUUID(); },
    x => { x.evidence.receivedAtMs = f.input.actorPolicy.ledger.lastReceiptMs - 1; },
  ]) {
    const x = { ...c, ledger: clone(c.ledger), runtime: clone(c.runtime), offering: clone(c.offering), evidence: clone(c.evidence) };
    change(x); await assert.rejects(() => evaluate(x), /context_changed/);
  }
  assert.ok(Object.isFrozen(makeNmlsFirstFinalHandoffContext(f.input)));
  assert.ok(Object.isFrozen(c.course)); assert.ok(Object.isFrozen(c.ledger));
});

test('strict original intent pins all CAS/session selectors and does not accept study receipts or answers', async () => {
  const f = await makeFirstFinalHandoffFixture(), c = context(f), evaluate = createNmlsFirstFinalHandoffEvaluator();
  assert.equal(validateNmlsFirstFinalHandoffCommand(f.command), f.command);
  for (const extra of [{ expectedRevision: 1 }, { expectedFinalRevision: 1 }, { expectedWorkflowRevision: 2 },
    { studyReceipt: { windowId: randomUUID(), visible: true } }, { answers: {} }, { kind: 'resume' }, { sessionId: null }]) {
    await assert.rejects(() => evaluate({ ...c, command: { ...f.command, ...extra } }), /invalid_command/);
  }
  for (const extra of [{ expectedActorRevision: f.command.expectedActorRevision + 1 },
    { expectedSourceRevision: f.command.expectedSourceRevision + 1 }, { expectedDeliveryRevision: f.command.expectedDeliveryRevision + 1 },
    { sessionId: randomUUID() }, { finalAttemptId: randomUUID() }, { attemptId: randomUUID() }]) {
    await assert.rejects(() => evaluate({ ...c, command: { ...f.command, ...extra } }), /revision_or_session_conflict/);
  }
});

test('old final idle and closed material horizon are historical, not the new child activity clock', async () => {
  const f = await makeFirstFinalHandoffFixture();
  f.evidence.receivedAtMs += R.idleLogoutMs + 1;
  const r = await createNmlsFirstFinalHandoffEvaluator()(context(f));
  assert.equal(r.outcome.policyCode, 'session_policy_allowed'); assert.equal(r.runtime.status, 'active');
  assert.equal(r.runtime.lastActivityMs, f.evidence.receivedAtMs); assert.notEqual(r.runtime.sessionId, f.command.sessionId);
  assert.equal(r.ledger.sessionStartedAtMs, f.input.actorPolicy.ledger.sessionStartedAtMs); contentFree(r);
});

test('actual break, rolling, wall and annual denials remain content-free without fake policy flags', async () => {
  const base = await makeFirstFinalHandoffFixture();
  for (const kind of ['break_in_progress', 'mandatory_break_required', 'rolling_study_limit', 'session_wall_limit', 'delivery_window_closed']) {
    const f = clone(base), l = f.input.actorPolicy.ledger, at = f.evidence.receivedAtMs;
    // Explicit synthetic owner-state restrictions, not actual elapsed teaching.
    if (kind === 'break_in_progress') l.breakStartedAtMs = l.lastReceiptMs;
    if (kind === 'mandatory_break_required') l.studySinceBreakMs = P.breakAfterStudyMs;
    if (kind === 'rolling_study_limit') {
      l.studyIntervals = [{ start: at - P.rollingStudyLimitMs - 1, end: at - 1 }];
      l.studyBoundaryAtMs = at - 1; l.studySinceBreakMs = 0;
    }
    if (kind === 'session_wall_limit') l.sessionStartedAtMs = at - P.sessionWallLimitMs;
    if (kind === 'delivery_window_closed') f.evidence.receivedAtMs = f.input.binding.offering.closesAtMs;
    const r = await createNmlsFirstFinalHandoffEvaluator()(context(f));
    assert.equal(r.outcome.policyCode, kind); assert.equal(r.outcome.deliveryAllowed, false);
    assert.equal(r.outcome.deliveryUntilMs, null); contentFree(r);
    assert.equal(r.runtime.status, kind === 'delivery_window_closed' ? 'logged_out' : 'active');
    assert.equal(r.outcome.ok, kind !== 'delivery_window_closed', 'resume-control success is not permission to study');
    assert.deepEqual(f.input.lease, base.input.lease, 'pure candidate does not transfer or remove a sticky lease');
  }
});

test('current actor revisions may advance but cannot precede immutable submission provenance', async () => {
  const f = await makeFirstFinalHandoffFixture(), old = clone(f.input.submissionEvent);
  f.input.actorPolicy.revision++;
  f.input.actorPolicy.ledger.revision++;
  f.input.actorPolicy.ledger.lastReceiptMs += 100;
  f.input.actorPolicy.ledger.observationJournal.lastReceiptMs += 100;
  f.command.expectedActorRevision++;
  f.evidence.receivedAtMs = f.input.actorPolicy.ledger.lastReceiptMs + 1;
  const r = await createNmlsFirstFinalHandoffEvaluator()(context(f));
  assert.equal(r.ledger.revision, f.command.expectedActorRevision + 1);
  assert.deepEqual(f.input.submissionEvent, old); contentFree(r);
  f.input.actorPolicy.revision = old.actor_revision - 1;
  f.input.actorPolicy.ledger.revision = old.actor_revision - 1;
  assert.throws(() => context(f), /actor_policy/);
});

test('current original-offering ROCS is checked anew without borrowing child digest acceptance', async () => {
  const base = await makeFirstFinalHandoffFixture();
  for (const kind of ['rocs_required', 'rocs_document_unverified']) {
    const f = clone(base);
    if (kind === 'rocs_required') {
      f.input.actorPolicy.ledger.acceptances[0].contentDigest = f.input.workflow.runtime.contentDigest;
    } else f.input.binding.offering.rocs.fullDocumentVerified = false;
    const r = await createNmlsFirstFinalHandoffEvaluator()(context(f));
    assert.equal(r.outcome.policyCode, kind); assert.equal(r.outcome.deliveryAllowed, false); contentFree(r);
  }
});

test('handoff cannot reset actor usage without actual full rest, including uncertainty boundary', async () => {
  const base = await makeFirstFinalHandoffFixture();
  for (const recentUncertainty of [false, true]) {
    const f = clone(base), l = f.input.actorPolicy.ledger;
    f.evidence.receivedAtMs += P.minimumNewSessionRestMs + 1;
    if (recentUncertainty) {
      l.lastReceiptMs = f.evidence.receivedAtMs - 1;
      l.uncertainExposure.lastBoundaryMs = l.lastReceiptMs;
    }
    const r = await createNmlsFirstFinalHandoffEvaluator()(context(f));
    assert.equal(r.outcome.policyCode, recentUncertainty ? 'session_wall_limit' : 'session_policy_allowed');
    assert.equal(r.ledger.sessionStartedAtMs, recentUncertainty ? l.sessionStartedAtMs : f.evidence.receivedAtMs);
    if (recentUncertainty) assert.equal(r.ledger.studySinceBreakMs, l.studySinceBreakMs);
    contentFree(r);
  }
});

test('resume factory must produce a fresh UUID and caller mutation during await cannot alter candidate', async () => {
  const f = await makeFirstFinalHandoffFixture(), c = context(f);
  for (const bad of ['bad-session', f.command.sessionId]) {
    await assert.rejects(() => createNmlsFirstFinalHandoffEvaluator({ newId: () => bad })(c), /unexpected_teaching/);
  }
  const id = randomUUID(), mutable = { ...c, course: clone(c.course), offering: clone(c.offering),
    runtime: clone(c.runtime), ledger: clone(c.ledger), command: clone(c.command), evidence: clone(c.evidence) };
  const pending = createNmlsFirstFinalHandoffEvaluator({ newId: () => id })(mutable);
  mutable.course.modules[0].title = 'Caller changed this while awaiting';
  mutable.offering.rocs.fullDocumentVerified = false;
  mutable.command.eventId = randomUUID(); mutable.ledger.studySinceBreakMs = 0;
  const r = await pending, expected = await createNmlsFirstFinalHandoffEvaluator({ newId: () => id })(c);
  assert.deepEqual(r, expected); contentFree(r);
});

test('no-grade history validates saved failed genesis but does not mint a teaching or handoff token', async () => {
  const f = await makeFirstFinalHandoffFixture(), before = clone(f);
  const history = validateNmlsFirstFinalHandoffHistory(f.input);
  assert.deepEqual(Object.keys(history), ['phase', 'notBeforeMs']);
  assert.deepEqual(history.phase, f.input.delivery.phase_scope);
  assert.ok(history.notBeforeMs <= f.evidence.receivedAtMs); assert.ok(Object.isFrozen(history));
  assert.deepEqual(f, before);
  const passed = await makeFirstFinalHandoffFixture({ correct: 25 });
  assert.throws(() => validateNmlsFirstFinalHandoffHistory(passed.input), /first_history/);
});

test('no-grade historical mode accepts actual handoff and later child work without resetting it', async () => {
  const f = await makeFirstFinalHandoffFixture(), original = clone(f.input.firstFinal);
  function save(r) {
    f.input.workflow.revision++; f.input.workflow.runtime = clone(r.runtime);
    f.input.actorPolicy.revision = r.ledger.revision; f.input.actorPolicy.ledger = clone(r.ledger);
    f.input.lease = { ...f.input.lease, phase_kind: 'remediation', session_id: r.runtime.sessionId, phase_active: true };
  }
  save(await createNmlsFirstFinalHandoffEvaluator()(context(f)));
  assert.doesNotThrow(() => validateNmlsFirstFinalHandoffHistory(f.input));
  const observed = createNmlsObservedPolicyReviewEvaluator();
  for (const kind of ['open_unit', 'interaction']) {
    const teaching = makeNmlsRemediationTeachingContext(f.input), ledger = f.input.actorPolicy.ledger;
    const command = { kind, attemptId: f.input.review.id, eventId: randomUUID(), phaseKind: 'remediation',
      phaseOwnerId: f.input.firstFinal.id, expectedSourceRevision: f.input.review.revision,
      expectedWorkflowRevision: f.input.workflow.revision, expectedRevision: teaching.runtime.revision,
      expectedActorRevision: ledger.revision, sessionId: teaching.runtime.sessionId,
      ...(kind === 'open_unit' ? { unitId: teaching.course.modules[0].units[0].id } :
        { visible: true, studyReceipt: { windowId: ledger.observationJournal.active.id, visible: true } }) };
    save(await observed({ ...teaching, ledger, command, evidence: { actorId: f.input.actorId, receivedAtMs: ++f.evidence.receivedAtMs } }));
  }
  assert.ok(f.input.workflow.runtime.current); assert.ok(f.input.actorPolicy.ledger.observationJournal.active);
  const before = clone(f.input), history = validateNmlsFirstFinalHandoffHistory(f.input);
  assert.equal(history.phase.finalAttemptId, original.id); assert.deepEqual(f.input, before);
  assert.deepEqual(f.input.firstFinal, original);
  assert.throws(() => makeNmlsFirstFinalHandoffContext(f.input), /lease_scope|submission_origin/,
    'historical consistency is not a second fresh handoff grant');
});

test('no-grade history rejects replay origin mutations without reconstructing a pristine current workflow', async () => {
  const base = await makeFirstFinalHandoffFixture();
  // A later row is deliberately retained as-is; history validation must not
  // rewrite it to genesis merely to reuse the fresh-only constructor.
  base.input.workflow.revision = 8; base.input.workflow.runtime.revision = 7;
  base.input.lease.phase_kind = 'remediation';
  for (const change of [
    i => { i.firstFinal.result.correct = 1; i.firstFinal.result.percent = 4; },
    i => { i.firstFinal.answers[i.firstFinal.selection.questionIds[0]] = 'C'; },
    i => { i.submissionEvent.command_digest = '0'.repeat(64); },
    i => { i.submissionEvent.submission_payload_digest = '0'.repeat(64); },
    i => { i.deliveryEvent.student_id = randomUUID(); }, i => { i.deliveryEvent.transaction_id++; },
    i => { delete i.reservation; }, i => { delete i.teachingEvent; },
    i => { i.firstFinal.remediation_manifest.completed = true; },
    i => { i.workflow.manifest.contentDigest = i.sourceCourse.digest; },
    i => { i.deliveryEvent.audit.policy.actorId = randomUUID(); },
    i => { i.deliveryEvent.lease_after.phase_active = true; },
  ]) {
    const f = clone(base); change(f.input);
    assert.throws(() => validateNmlsFirstFinalHandoffHistory(f.input), /nmls_/);
  }
});

test('no-grade history requires current source and actor ownership and genesis revision floors', async () => {
  const base = await makeFirstFinalHandoffFixture();
  for (const change of [
    i => { i.actorPolicy.revision = 0; i.actorPolicy.ledger.revision = 0; },
    i => { i.actorPolicy.student_id = randomUUID(); }, i => { i.actorPolicy.ledger.actorId = randomUUID(); },
    i => { i.lease.student_id = randomUUID(); }, i => { i.workflow.revision = 0; },
    i => { i.review.runtime.completedUnitIds = []; }, i => { i.review.student_id = randomUUID(); },
    i => { i.firstFinal.student_id = randomUUID(); }, i => { i.sourceCourse.modules[0].title = 'Changed source'; },
  ]) {
    const f = clone(base); change(f.input); assert.throws(() => validateNmlsFirstFinalHandoffHistory(f.input), /nmls_/);
  }
});
