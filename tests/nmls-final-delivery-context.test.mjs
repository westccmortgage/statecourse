import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { makeNmlsFirstFinalDeliveryContext, nmlsFinalDeliveryScope,
  assertNmlsFinalDeliveryPhase } from '../lib/nmls-final-delivery-context.mjs';
import { makeFinalDeliveryFixture } from './helpers/nmls-final-delivery-fixture.mjs';

// These tests validate private domain consistency, not SQL authenticity,
// current grants, an activated exam, real identity/attendance or regulatory time.
const clone = structuredClone;
const stable = x => Array.isArray(x) ? x.map(stable) : x && typeof x === 'object' ?
  Object.fromEntries(Object.keys(x).sort().map(k => [k, stable(x[k])])) : x;
const hash = x => createHash('sha256').update(JSON.stringify(stable(x))).digest('hex');
const assertionInput = (context, actorId, ledger, receivedAtMs) => ({ actorId, definition: context.definition,
  selection: context.selection, offering: context.offering, ledger, receivedAtMs });

test('actual pure completion and check_access produce a private reserved-first context with exact stable scope', async () => {
  const { input, ledger, timeMs } = await makeFinalDeliveryFixture(), before = clone(input);
  const context = makeNmlsFirstFinalDeliveryContext(input), scope = nmlsFinalDeliveryScope(context.finalPhase);
  assert.deepEqual(input, before, 'constructor must not mutate loaded authority/history');
  assert.deepEqual(Object.keys(context).sort(), ['definition', 'finalPhase', 'offering', 'selection', 'sourceRuntime']);
  assert.deepEqual(scope, { version: 'nmls-first-final-phase-v1', actorId: input.actorId,
    reviewAttemptId: input.review.id, finalAttemptId: input.reservedFinal.id, courseKey: input.sourceCourse.id,
    contentDigest: input.sourceCourse.digest, definitionDigest: input.definition.digest,
    selectionDigest: hash(input.reservedFinal.selection), offeringId: input.binding.offering.id });
  assert.equal(assertNmlsFinalDeliveryPhase(context.finalPhase, assertionInput(context, input.actorId, ledger, timeMs)), scope);
  assert.equal(context.sourceRuntime.status, 'review_complete');
  assert.equal(Object.hasOwn(input.reservedFinal, 'status'), false, 'actual026 row has no in_progress status column');
  assert.equal(input.reservedFinal.revision, 1); assert.equal(input.reservedFinal.result, null);
  assert.equal(ledger.observationJournal.active, null); assert.equal(ledger.observationJournal.unresolved, null);
  assert.equal(input.teachingEvent.audit.review.atMs, timeMs);
  for (const key of ['questions', 'deliveryAllowed', 'deliveryUntilMs', 'studyWindow', 'sessionId', 'creditIssuanceAllowed'])
    assert.equal(Object.hasOwn(context, key), false, `${key} is not an activation grant`);
});

test('higher source and actor revisions do not change stable identity or require adoption of the old activity clock', async () => {
  const { input, timeMs } = await makeFinalDeliveryFixture();
  const original = nmlsFinalDeliveryScope(makeNmlsFirstFinalDeliveryContext(input).finalPhase);
  input.review.revision += 3; input.review.runtime.revision += 3; input.review.runtime.lastReceiptMs += 800000;
  input.actorPolicy.revision += 9; input.actorPolicy.ledger.revision += 9; input.actorPolicy.ledger.lastReceiptMs += 800000;
  const context = makeNmlsFirstFinalDeliveryContext(input);
  assert.deepEqual(nmlsFinalDeliveryScope(context.finalPhase), original);
  assert.ok(context.sourceRuntime.lastActivityMs < timeMs + 800000 - 360000);
  assert.equal(context.sourceRuntime.lastActivityMs, input.review.runtime.lastActivityMs);
  for (const key of ['sourceRevision', 'actorRevision', 'sessionId', 'lastActivityMs']) assert.equal(Object.hasOwn(original, key), false);
});

test('brand cannot be reconstructed by cloning, spreading or wrapping a valid token', async () => {
  const { input, ledger, timeMs } = await makeFinalDeliveryFixture(), context = makeNmlsFirstFinalDeliveryContext(input);
  const args = assertionInput(context, input.actorId, ledger, timeMs);
  for (const forged of [clone(context.finalPhase), { ...context.finalPhase }, { scope: context.finalPhase.scope },
    new Proxy(context.finalPhase, {}), null, {}]) {
    assert.throws(() => nmlsFinalDeliveryScope(forged), /untrusted_phase/);
    assert.throws(() => assertNmlsFinalDeliveryPhase(forged, args), /untrusted_phase/);
  }
});

test('detached deeply frozen outputs cannot mutate validated completion, and assert rejects altered payloads', async () => {
  const { input, ledger, timeMs } = await makeFinalDeliveryFixture(), context = makeNmlsFirstFinalDeliveryContext(input);
  const args = assertionInput(context, input.actorId, ledger, timeMs), snapshot = clone(context);
  input.sourceCourse.title = 'changed caller copy'; input.definition.items[0].stem = 'changed caller definition';
  input.reservedFinal.selection.questionIds.reverse(); input.review.runtime.completedUnitIds.length = 0;
  assert.deepEqual(clone(context), snapshot);
  assert.throws(() => context.sourceRuntime.completedUnitIds.pop(), TypeError);
  assert.throws(() => { context.finalPhase.scope.actorId = randomUUID(); }, TypeError);
  assert.throws(() => { context.selection.optionOrder[context.selection.questionIds[0]][0] = 'X'; }, TypeError);
  for (const mutate of [x => { x.actorId = randomUUID(); }, x => { x.definition.items[0].stem = 'changed'; },
    x => x.selection.questionIds.reverse(), x => x.selection.optionOrder[x.selection.questionIds[0]].reverse(),
    x => { x.offering.rocs.documentDigest = 'd'.repeat(64); }, x => { x.offering.closesAtMs--; },
    x => { x.ledger.studySinceBreakMs = 0; }, x => { x.receivedAtMs--; }]) {
    const changed = clone(args); mutate(changed);
    assert.throws(() => assertNmlsFinalDeliveryPhase(context.finalPhase, changed), /context_changed/);
  }
});

test('brand pins the complete current actor ledger and all reservation/evaluation receipt time floors', async () => {
  const fixture = await makeFinalDeliveryFixture(), { input, ledger, timeMs } = fixture;
  const context = makeNmlsFirstFinalDeliveryContext(input), args = assertionInput(context, input.actorId, ledger, timeMs);
  const old = clone(ledger);
  Object.assign(old, { revision: 1, lastReceiptMs: timeMs - 1, studySinceBreakMs: 0, studyIntervals: [] });
  old.uncertainExposure = { version: 'nmls-uncertain-exposure-v1', intervals: [], lastBoundaryMs: null };
  assert.throws(() => assertNmlsFinalDeliveryPhase(context.finalPhase, { ...args, ledger: old }), /context_changed/);
  for (const receivedAtMs of [timeMs - 1, undefined, null, NaN, timeMs + 0.5, 8.64e15 + 1])
    assert.throws(() => assertNmlsFinalDeliveryPhase(context.finalPhase, { ...args, receivedAtMs }), /context_changed/);
  assert.throws(() => assertNmlsFinalDeliveryPhase(context.finalPhase, { ...args, ledger: undefined }), /context_changed/);
  assert.equal(assertNmlsFinalDeliveryPhase(context.finalPhase, { ...args, receivedAtMs: timeMs + 1000 }), context.finalPhase.scope);
  for (const [row, field] of [['reservedFinal', 'issued_at'], ['teachingEvent', 'recorded_at'], ['reservation', 'recorded_at']]) {
    const delayed = clone(input); delayed[row][field] = new Date(timeMs + 500).toISOString();
    const later = makeNmlsFirstFinalDeliveryContext(delayed), check = assertionInput(later, input.actorId, ledger, timeMs + 499);
    assert.throws(() => assertNmlsFinalDeliveryPhase(later.finalPhase, check), /context_changed/);
    assert.equal(assertNmlsFinalDeliveryPhase(later.finalPhase, { ...check, receivedAtMs: timeMs + 500 }), later.finalPhase.scope);
  }
  const current = clone(input); current.actorPolicy.ledger.lastReceiptMs += 1000;
  const rebuilt = makeNmlsFirstFinalDeliveryContext(current);
  assert.deepEqual(nmlsFinalDeliveryScope(rebuilt.finalPhase), nmlsFinalDeliveryScope(context.finalPhase));
  assert.throws(() => assertNmlsFinalDeliveryPhase(rebuilt.finalPhase,
    assertionInput(rebuilt, input.actorId, current.actorPolicy.ledger, timeMs + 999)), /context_changed/);
  assert.equal(assertNmlsFinalDeliveryPhase(rebuilt.finalPhase,
    assertionInput(rebuilt, input.actorId, current.actorPolicy.ledger, timeMs + 1000)), rebuilt.finalPhase.scope);
});

test('incomplete or malformed source progress cannot become final authority', async () => {
  const { input } = await makeFinalDeliveryFixture();
  for (const mutate of [x => x.review.runtime.completedUnitIds.pop(), x => x.review.runtime.passedModuleIds.pop(),
    x => { x.review.runtime.completedReviewMs--; }, x => { x.review.runtime.status = 'active'; },
    x => { x.review.runtime.current = {}; }, x => { x.review.runtime.quiz = {}; },
    x => { x.review.runtime.bookmark = {}; }, x => { x.review.runtime.quizReservation = {}; },
    x => { x.review.revision--; }, x => { x.review.runtime.creditIssuanceAllowed = true; }]) {
    const changed = clone(input); mutate(changed); assert.throws(() => makeNmlsFirstFinalDeliveryContext(changed));
  }
});

test('source bytes and actual full definition payload must match, not just copied digest labels', async () => {
  const { input } = await makeFinalDeliveryFixture();
  for (const mutate of [x => { x.sourceCourse.modules[0].units[0].content += ' changed'; },
    x => { x.definition.sourcePayloadDigest = 'a'.repeat(64); }, x => { x.definition.items[0].correctChoice = 'D'; },
    x => { x.sourceCourse.digest = 'b'.repeat(64); }, x => { x.reservedFinal.content_digest = 'b'.repeat(64); }]) {
    const changed = clone(input); mutate(changed); assert.throws(() => makeNmlsFirstFinalDeliveryContext(changed));
  }
});

test('only the original unsubmitted number1 form qualifies, with all SQL null fields present', async () => {
  const { input } = await makeFinalDeliveryFixture();
  for (const mutate of [x => { x.reservedFinal.revision = 2; }, x => { x.reservedFinal.student_id = randomUUID(); },
    x => { x.reservedFinal.review_attempt_id = randomUUID(); }, x => { x.reservedFinal.id = x.review.id; },
    x => { x.reservedFinal.selection.number = 2; }, x => { x.reservedFinal.answers = {}; },
    x => { x.reservedFinal.result = { passed: true }; }, x => { x.reservedFinal.remediation_manifest = {}; },
    x => { x.reservedFinal.submitted_at = x.reservedFinal.issued_at; }, x => { delete x.reservedFinal.submitted_at; },
    x => { x.reservedFinal.issued_at = 'not a date'; }]) {
    const changed = clone(input); mutate(changed); assert.throws(() => makeNmlsFirstFinalDeliveryContext(changed));
  }
});

test('selection bank membership, exact option sets and immutable selection digest are independently checked', async () => {
  const { input } = await makeFinalDeliveryFixture();
  for (const mutate of [x => { x.reservedFinal.selection.questionIds[0] = 'N26-FIN-F99'; },
    x => { x.reservedFinal.selection.questionIds[0] = x.reservedFinal.selection.questionIds[1]; },
    x => { x.reservedFinal.selection.questionIds[0] = null; },
    x => { x.reservedFinal.selection.optionOrder[x.reservedFinal.selection.questionIds[0]] = ['A', 'A', 'C', 'D']; },
    x => { delete x.reservedFinal.selection.optionOrder[x.reservedFinal.selection.questionIds[0]]; },
    x => { x.reservedFinal.selection.answers = {}; },
    x => x.reservedFinal.selection.optionOrder[x.reservedFinal.selection.questionIds[0]].reverse(),
    x => { x.reservation.selection_digest = 'a'.repeat(64); }]) {
    const changed = clone(input); mutate(changed); assert.throws(() => makeNmlsFirstFinalDeliveryContext(changed));
  }
});

test('missing, denied or cross-actor/source reservation halves cannot be adopted', async () => {
  const { input } = await makeFinalDeliveryFixture();
  for (const mutate of [x => { x.reservation = null; }, x => { x.teachingEvent = null; },
    x => { x.reservation.reserved = false; }, x => { x.reservation.final_id = randomUUID(); },
    x => { x.reservation.event_id = randomUUID(); }, x => { x.teachingEvent.command_digest = 'b'.repeat(64); },
    x => { x.teachingEvent.student_id = randomUUID(); }, x => { x.teachingEvent.review_attempt_id = randomUUID(); },
    x => { x.teachingEvent.phase_kind = 'remediation'; }, x => { x.teachingEvent.workflow_revision = 1; },
    x => { x.reservation.definition_digest = 'b'.repeat(64); }, x => { x.reservation.recorded_at = null; }]) {
    const changed = clone(input); mutate(changed); assert.throws(() => makeNmlsFirstFinalDeliveryContext(changed), /reservation_pair/);
  }
});

test('receipt metadata and current source/actor revision lineage cannot claim a future or mismatched commit', async () => {
  const { input } = await makeFinalDeliveryFixture();
  for (const mutate of [x => { x.reservation.source_revision++; }, x => { x.teachingEvent.runtime_revision++; },
    x => { x.teachingEvent.actor_revision++; }, x => { x.actorPolicy.revision--; x.actorPolicy.ledger.revision--; },
    x => { x.actorPolicy.ledger.revision++; }, x => { x.actorPolicy.student_id = randomUUID(); },
    x => { x.actorPolicy.policy_digest = 'a'.repeat(64); }, x => { x.actorPolicy.ledger.actorId = randomUUID(); },
    x => { x.actorPolicy.ledger.creditIssuanceAllowed = true; }, x => { x.actorPolicy.ledger.lastReceiptMs = 0; },
    x => { x.reservation.outcome.finalRevision = 2; }, x => { x.reservation.outcome.studentDeliveryEnabled = true; },
    x => { x.reservation.outcome.questions = []; }]) {
    const changed = clone(input); mutate(changed); assert.throws(() => makeNmlsFirstFinalDeliveryContext(changed));
  }
});

test('original successful content-free source event, audit and dormant lease must agree', async () => {
  const { input } = await makeFinalDeliveryFixture();
  for (const mutate of [x => { x.teachingEvent.outcome.policyCode = 'rocs_required'; },
    x => { x.teachingEvent.outcome.observationReady = false; }, x => { x.teachingEvent.outcome.deliveryAllowed = true; },
    x => { x.teachingEvent.outcome.progress.lessons = [{ id: 'F01-U01' }]; },
    x => { x.teachingEvent.outcome.progress.completedReviewMs--; }, x => { x.teachingEvent.outcome.progress.sessionId = randomUUID(); },
    x => { x.teachingEvent.audit.review.kind = 'resume'; }, x => { x.teachingEvent.audit.policy.atMs--; },
    x => { x.teachingEvent.audit.policy.observation = {}; }, x => { x.teachingEvent.audit.observation.reason = 'recovered'; },
    x => { x.teachingEvent.lease_before.phase_active = true; }, x => { x.teachingEvent.lease_after.phase_owner_id = randomUUID(); }]) {
    const changed = clone(input); mutate(changed); assert.throws(() => makeNmlsFirstFinalDeliveryContext(changed));
  }
});

test('replacement or revoked-original scope cannot be relabeled, but context is not a current grant check', async () => {
  const { input, timeMs } = await makeFinalDeliveryFixture();
  const replacement = clone(input), newGrant = randomUUID();
  replacement.review.grant_id = newGrant; replacement.binding.grant_id = newGrant; replacement.binding.offering.id = newGrant;
  assert.throws(() => makeNmlsFirstFinalDeliveryContext(replacement), /teaching_audit/);
  const outsideAtReservation = clone(input); outsideAtReservation.binding.offering.closesAtMs = timeMs;
  assert.throws(() => makeNmlsFirstFinalDeliveryContext(outsideAtReservation), /teaching_audit/);
  // No grant row, status, expiry or current clock is accepted by this API.
  // A historically consistent snapshot still needs SQL authorization later.
  const historical = clone(input); historical.binding.offering.closesAtMs = timeMs + 86400000;
  const context = makeNmlsFirstFinalDeliveryContext(historical);
  assert.equal(context.offering.closesAtMs, timeMs + 86400000);
  assert.equal(Object.hasOwn(context, 'authorized'), false);
});
