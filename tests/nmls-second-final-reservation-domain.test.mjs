import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeSecondFinalReservationFixture } from './helpers/nmls-second-final-reservation-fixture.mjs';
import { makeNmlsSecondFinalReservationContext, createNmlsSecondFinalReservationEvaluator,
  validateNmlsSecondFinalReservationHistory, validateNmlsSecondFinalReservationCommand,
  validateNmlsSecondFinalReservationSelection } from '../lib/nmls-second-final-reservation.mjs';
import { createNmlsObservedPolicyReviewEvaluator } from '../lib/nmls-study-observer.mjs';
import { drawNmlsDraftFinal, gradeNmlsDraftFinal } from '../lib/nmls-final-assessment.mjs';
import { compactNmlsReviewOutcome } from '../lib/nmls-review-runtime.mjs';
import { createHash } from 'node:crypto';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { NMLS_OSS_REQUIREMENTS as R } from '../config/nmls/oss-policy.mjs';

// Actual pure source/first/child transitions with synthetic history envelopes.
// These tests do not prove SQL provenance, identity, attendance or CE timing.
const clone = structuredClone;
const context = f => ({ ...makeNmlsSecondFinalReservationContext(f.input), command: f.command, evidence: f.evidence });
const stable = x => Array.isArray(x) ? x.map(stable) : x && typeof x === 'object' ?
  Object.fromEntries(Object.keys(x).sort().map(k => [k, stable(x[k])])) : x;
const hash = x => createHash('sha256').update(JSON.stringify(stable(x))).digest('hex');
function saveCheck(f, r) {
  const before = clone(f.input.lease), at = f.evidence.receivedAtMs;
  f.input.workflow.runtime = clone(r.runtime); f.input.workflow.revision++;
  f.input.actorPolicy.ledger = clone(r.ledger); f.input.actorPolicy.revision = r.ledger.revision;
  f.input.latestChildEvent = { student_id: f.input.actorId, event_id: r.command.eventId, review_attempt_id: f.input.review.id,
    phase_kind: 'remediation', phase_owner_id: f.input.firstFinal.id, command_digest: hash(r.command),
    actor_revision: r.ledger.revision, source_revision: f.input.review.revision, workflow_revision: f.input.workflow.revision,
    runtime_revision: r.runtime.revision, lease_before: before, lease_after: clone(before),
    outcome: compactNmlsReviewOutcome(r.outcome), audit: clone(r.audit), transaction_id: 100, recorded_at: new Date(at).toISOString() };
  Object.assign(f.command, { eventId: randomUUID(), expectedWorkflowRevision: f.input.workflow.revision,
    expectedRevision: r.runtime.revision, expectedActorRevision: r.ledger.revision });
  f.evidence.receivedAtMs++;
}

test('completed real child reserves a disjoint second form through genuine content-free check_access', async () => {
  const f = await makeSecondFinalReservationFixture(), before = clone(f), c = context(f);
  const r = await createNmlsSecondFinalReservationEvaluator()(c);
  const actual = await createNmlsObservedPolicyReviewEvaluator()({ ...c, command: r.command });
  for (const key of ['runtime', 'ledger', 'outcome', 'audit']) assert.deepEqual(r[key], actual[key]);
  assert.deepEqual(f, before); assert.equal(r.reservation.reserved, true); assert.equal(r.reservation.selection.number, 2);
  assert.equal(r.reservation.selection.questionIds.length, 25);
  assert.ok(r.reservation.selection.questionIds.every(id => !c.firstSelection.questionIds.includes(id)));
  assert.equal(r.runtime.lastActivityMs, c.runtime.lastActivityMs); assert.equal(r.runtime.sessionId, c.runtime.sessionId);
  assert.equal(r.runtime.revision, c.runtime.revision + 1); assert.equal(r.ledger.revision, c.ledger.revision + 1);
  assert.equal(r.outcome.deliveryAllowed, false); assert.equal(r.outcome.deliveryUntilMs, null);
  assert.deepEqual(r.outcome.progress.lessons, []); assert.equal(r.outcome.progress.quiz, null); assert.equal(r.outcome.progress.feedback, null);
  assert.equal(r.ledger.observationJournal.active, null); assert.equal(r.ledger.observationJournal.unresolved, null);
});

test('original033/035/036, paired037 and source-derived child binding are all required', async () => {
  const base = await makeSecondFinalReservationFixture();
  for (const change of [
    i => { i.reservation = null; }, i => { i.teachingEvent = null; }, i => { i.submissionEvent.command_digest = '0'.repeat(64); },
    i => { i.deliveryEvent.student_id = randomUUID(); }, i => { i.handoffOrigin = null; },
    i => { i.handoffOriginTeachingEvent = null; }, i => { i.handoffOrigin.transaction_id++; },
    i => { i.handoffOrigin.command_digest = '0'.repeat(64); }, i => { i.handoffOriginTeachingEvent.audit.policy.actorId = randomUUID(); },
    i => { i.handoffOriginTeachingEvent.outcome.progress.completedReviewMs = 1; },
    i => { i.childBinding.layout[0].units[0].requiredMs = 1; }, i => { i.childBinding.phase_scope.sourceContentDigest = i.workflow.runtime.contentDigest; },
    i => { i.sourceCourse.modules[0].units[0].requiredSeconds++; },
    i => { i.firstFinal.result.passed = true; }, i => { i.workflow.manifest.contentDigest = i.sourceCourse.digest; },
  ]) {
    const f = clone(base); change(f.input); assert.throws(() => validateNmlsSecondFinalReservationHistory(f.input), /nmls_/);
  }
});

test('genuine terminal first-acknowledgment receipt stays restriction-only and is not rejected by an invented quiz duration', async () => {
  const f = await makeSecondFinalReservationFixture({ acknowledgeQuiz: false });
  assert.equal(f.input.terminalChildEvent.outcome.observationCode, 'study_material_acknowledged');
  assert.equal(f.input.terminalChildEvent.audit.observation.firstAcknowledgment, true);
  assert.equal(Object.hasOwn(f.input.terminalChildEvent.audit.policy, 'observation'), false);
  assert.doesNotThrow(() => validateNmlsSecondFinalReservationHistory(f.input));
  const r = await createNmlsSecondFinalReservationEvaluator()(context(f)); assert.equal(r.reservation.reserved, true);
});

test('review_complete alone cannot replace genuine terminal032 provenance or latest current event', async () => {
  const base = await makeSecondFinalReservationFixture();
  for (const change of [
    i => { i.terminalChildEvent = null; }, i => { i.terminalChildEvent = clone(i.handoffOriginTeachingEvent); },
    i => { i.terminalChildEvent.outcome.code = 'review_policy_checked'; },
    i => { i.terminalChildEvent.audit.review.passed = false; }, i => { i.terminalChildEvent.audit.review.moduleId = 'F99'; },
    i => { i.terminalChildEvent.audit.review.correct = 0; }, i => { i.terminalChildEvent.audit.observation.windowBefore.scope.contentDigest = i.sourceCourse.digest; },
    i => { i.terminalChildEvent.audit.observation.closedWindow.lastObservedAtMs--; },
    i => { i.terminalChildEvent.lease_before.phase_active = false; }, i => { i.latestChildEvent.runtime_revision--; },
    i => { i.latestChildEvent.outcome.progress.completedReviewMs = 0; }, i => { i.workflow.runtime.completedReviewMs = 0; },
    i => { i.workflow.runtime.completedUnitIds = []; }, i => { i.workflow.runtime.lastActivityMs++; },
    i => { i.workflow.runtime.status = 'active'; },
  ]) {
    const f = clone(base); change(f.input); assert.throws(() => makeNmlsSecondFinalReservationContext(f.input), /nmls_/);
  }
});

test('strict intent and brand fence every actor/session/revision and forbid caller form or time', async () => {
  const f = await makeSecondFinalReservationFixture(), c = context(f), evaluate = createNmlsSecondFinalReservationEvaluator();
  assert.equal(validateNmlsSecondFinalReservationCommand(f.command), f.command);
  for (const patch of [{ kind: 'reserve_first_final' }, { expectedFinalRevision: 1 }, { sessionId: null },
    { selection: {} }, { secondFinalId: randomUUID() }, { studyReceipt: {} }, { atMs: 1 }]) {
    await assert.rejects(() => evaluate({ ...c, command: { ...c.command, ...patch } }), /invalid_command/);
  }
  for (const patch of [{ expectedSourceRevision: c.command.expectedSourceRevision + 1 },
    { expectedWorkflowRevision: c.command.expectedWorkflowRevision + 1 }, { expectedRevision: c.command.expectedRevision + 1 },
    { expectedActorRevision: c.command.expectedActorRevision + 1 }, { sessionId: randomUUID() }, { firstFinalId: randomUUID() }]) {
    await assert.rejects(() => evaluate({ ...c, command: { ...c.command, ...patch } }), /revision_or_session_conflict/);
  }
  await assert.rejects(() => evaluate({ ...c, reservationPhase: clone(c.reservationPhase) }), /untrusted_context/);
  await assert.rejects(() => evaluate({ ...c, ledger: { ...c.ledger, studySinceBreakMs: 0 } }), /context_changed/);
  await assert.rejects(() => evaluate({ ...c, evidence: { ...c.evidence, receivedAtMs: 1 } }), /context_changed/);
});

test('current dormant child lease and empty v3 journal cannot be borrowed from final/source or a hold', async () => {
  const base = await makeSecondFinalReservationFixture();
  for (const change of [i => { i.lease.phase_kind = 'final'; }, i => { i.lease.phase_active = true; },
    i => { i.lease.session_id = randomUUID(); }, i => { i.actorPolicy.ledger.observationJournal.active = clone(i.terminalChildEvent.audit.observation.windowBefore); },
    i => { i.actorPolicy.ledger.observationJournal.unresolved = {}; }, i => { delete i.actorPolicy.ledger.observationJournal; },
    i => { i.actorPolicy.ledger.observationJournal.version = 'nmls-study-windows-v2'; }]) {
    const f = clone(base); change(f.input); assert.throws(() => context(f), /not_reservable|observation_history/);
  }
});

test('real policy denials do not draw and preserve completed child activity/session/progress', async () => {
  const base = await makeSecondFinalReservationFixture();
  for (const kind of ['break_in_progress', 'mandatory_break_required', 'rolling_study_limit', 'session_wall_limit', 'delivery_window_closed', 'rocs_required']) {
    const f = clone(base), l = f.input.actorPolicy.ledger, at = f.evidence.receivedAtMs;
    // Explicit owner-state restriction faults, not fabricated teaching time.
    if (kind === 'break_in_progress') l.breakStartedAtMs = l.lastReceiptMs;
    if (kind === 'mandatory_break_required') l.studySinceBreakMs = P.breakAfterStudyMs;
    if (kind === 'rolling_study_limit') { l.studyIntervals = [{ start: at - P.rollingStudyLimitMs - 1, end: at - 1 }]; l.studyBoundaryAtMs = at - 1; l.studySinceBreakMs = 0; }
    if (kind === 'session_wall_limit') l.sessionStartedAtMs = at - P.sessionWallLimitMs;
    if (kind === 'delivery_window_closed') f.evidence.receivedAtMs = f.input.binding.offering.closesAtMs;
    if (kind === 'rocs_required') l.acceptances = [];
    const r = await createNmlsSecondFinalReservationEvaluator({ draw: () => { throw Error('NO_DRAW'); }, newId: () => { throw Error('NO_ID'); } })(context(f));
    assert.equal(r.outcome.ok, false); assert.equal(r.outcome.policyCode, kind);
    assert.deepEqual(r.reservation, { reserved: false, code: 'second_final_policy_refused', selection: null });
    assert.equal(r.runtime.status, 'review_complete'); assert.equal(r.runtime.lastActivityMs, f.input.workflow.runtime.lastActivityMs);
    assert.equal(r.runtime.sessionId, f.input.workflow.runtime.sessionId);
    assert.deepEqual(r.runtime.completedUnitIds, f.input.workflow.runtime.completedUnitIds);
  }
});

test('contradictory green scalar versus observed union is hard-refused without a draw or invented denial', async () => {
  const f = await makeSecondFinalReservationFixture(), l = f.input.actorPolicy.ledger, end = l.lastReceiptMs;
  l.studyIntervals = [{ start: end - P.breakAfterStudyMs, end }]; l.studyBoundaryAtMs = end - P.breakAfterStudyMs; l.studySinceBreakMs = 0;
  await assert.rejects(() => createNmlsSecondFinalReservationEvaluator({ draw: () => { throw Error('NO_DRAW'); } })(context(f)), /exposure_review_required/);
});

test('completed child older than six minutes neither expires nor starts a new instructional clock', async () => {
  const f = await makeSecondFinalReservationFixture(), before = clone(f.input.workflow.runtime);
  f.evidence.receivedAtMs += R.idleLogoutMs + 1;
  const r = await createNmlsSecondFinalReservationEvaluator()(context(f));
  assert.equal(r.reservation.reserved, true); assert.equal(r.runtime.lastActivityMs, before.lastActivityMs);
  assert.equal(r.runtime.sessionId, before.sessionId); assert.equal(r.ledger.sessionStartedAtMs, f.input.actorPolicy.ledger.sessionStartedAtMs);
});

test('retained valid second selection is deterministically reusable; invalid quota/order/overlap forms fail', async () => {
  const f = await makeSecondFinalReservationFixture(), c = context(f), first = await createNmlsSecondFinalReservationEvaluator()(c);
  const candidate = first.reservation.selection;
  const repeat = await createNmlsSecondFinalReservationEvaluator({ newId: () => candidate.id, draw: () => clone(candidate) })(c);
  assert.deepEqual(repeat, first);
  assert.equal(validateNmlsSecondFinalReservationSelection(candidate, { definition: c.definition, firstSelection: c.firstSelection,
    reviewAttemptId: f.command.attemptId, expectedId: candidate.id }), candidate);
  for (const change of [s => { s.number = 1; }, s => { s.id = c.firstSelection.id; }, s => { s.questionIds[0] = c.firstSelection.questionIds[0]; },
    s => { s.questionIds[0] = s.questionIds[1]; }, s => { s.optionOrder[s.questionIds[0]] = ['A', 'B', 'C', 'C']; },
    s => { s.extra = null; }, s => { s.definitionDigest = '0'.repeat(64); }]) {
    const bad = clone(candidate); change(bad);
    await assert.rejects(() => createNmlsSecondFinalReservationEvaluator({ newId: () => candidate.id, draw: () => bad })(c), /invalid_/);
  }
});

test('a saved genuine denied check may be latest event while terminal provenance remains unchanged', async () => {
  const f = await makeSecondFinalReservationFixture(), terminal = clone(f.input.terminalChildEvent);
  f.input.actorPolicy.ledger.breakStartedAtMs = f.input.actorPolicy.ledger.lastReceiptMs;
  const r = await createNmlsSecondFinalReservationEvaluator()(context(f)); saveCheck(f, r);
  assert.equal(f.input.latestChildEvent.outcome.code, 'break_in_progress'); assert.equal(f.input.workflow.runtime.feedback, null);
  assert.doesNotThrow(() => validateNmlsSecondFinalReservationHistory(f.input));
  const repeat = await createNmlsSecondFinalReservationEvaluator({ draw: () => { throw Error('NO_DRAW'); } })(context(f));
  assert.equal(repeat.reservation.reserved, false); assert.deepEqual(f.input.terminalChildEvent, terminal);
});

test('repeated closed-year denials preserve the older empty journal without blocking history reconstruction', async () => {
  const f = await makeSecondFinalReservationFixture(), journal = clone(f.input.actorPolicy.ledger.observationJournal);
  f.evidence.receivedAtMs = f.input.binding.offering.closesAtMs;
  const evaluate = createNmlsSecondFinalReservationEvaluator({ draw: () => { throw Error('NO_DRAW'); } });
  const first = await evaluate(context(f)); saveCheck(f, first);
  assert.deepEqual(f.input.actorPolicy.ledger.observationJournal, journal);
  assert.ok(f.input.workflow.runtime.lastReceiptMs > journal.lastReceiptMs);
  const second = await evaluate(context(f));
  assert.equal(second.reservation.reserved, false); assert.equal(second.outcome.policyCode, 'delivery_window_closed');
  assert.deepEqual(second.ledger.observationJournal, journal);
});

test('no-grade history supports second-issued/later terminal statuses but cannot authorize a third form', async () => {
  const f = await makeSecondFinalReservationFixture(), r = await createNmlsSecondFinalReservationEvaluator()(context(f));
  const at = f.evidence.receivedAtMs; saveCheck(f, r);
  const w = f.input.workflow; w.revision++; w.status = 'second_issued'; w.second_id = r.reservation.selection.id;
  w.second_selection = clone(r.reservation.selection); w.second_issued_at = new Date(at).toISOString();
  const before = clone(f.input); assert.doesNotThrow(() => validateNmlsSecondFinalReservationHistory(f.input));
  assert.deepEqual(f.input, before); assert.throws(() => context(f), /not_reservable/);
  for (const passed of [true, false]) {
    const later = clone(f.input), x = later.workflow;
    x.revision++; x.status = passed ? 'passed' : 'staff_review_required';
    x.second_answers = Object.fromEntries(x.second_selection.questionIds.map(id => [id, passed ? 'A' : 'B']));
    x.second_result = gradeNmlsDraftFinal(later.definition, x.second_selection, x.second_answers);
    x.second_submitted_at = new Date(at + 1).toISOString();
    assert.doesNotThrow(() => validateNmlsSecondFinalReservationHistory(later));
    assert.throws(() => makeNmlsSecondFinalReservationContext(later), /not_reservable/);
  }
});

test('injected selector cannot mutate pinned inputs or add fields through a retained output', async () => {
  const f = await makeSecondFinalReservationFixture(), c = context(f), before = clone(f), id = randomUUID();
  let retained;
  const r = await createNmlsSecondFinalReservationEvaluator({ newId: () => id, draw: (definition, request, options) => {
    retained = clone(drawNmlsDraftFinal(definition, request, options));
    definition.items[0].stem = 'Caller changed selector input'; request.previous.answers = {}; options.course.modules = [];
    return retained;
  } })(c);
  retained.questionIds.length = 0; assert.equal(r.reservation.selection.questionIds.length, 25); assert.deepEqual(f, before);
});
