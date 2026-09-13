import { createHash, randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { makeSecondFinalReservationFixture } from './nmls-second-final-reservation-fixture.mjs';
import { makeNmlsSecondFinalReservationContext, createNmlsSecondFinalReservationEvaluator,
  validateNmlsSecondFinalReservationHistory } from '../../lib/nmls-second-final-reservation.mjs';
import { makeNmlsSecondFinalDeliveryContext, startNmlsSecondFinalDelivery,
  createNmlsSecondFinalDeliveryEvaluator } from '../../lib/nmls-second-final-delivery.mjs';
import { compactNmlsReviewOutcome } from '../../lib/nmls-review-runtime.mjs';

// SYNTHETIC authority, identity evidence, clocks and row envelopes. Actual pure
// source/first-final/handoff/child/reservation reducers produce every state.
// No SQL durability, production identity, attendance or learner timing claimed.
const clone = structuredClone;
const stable = x => Array.isArray(x) ? x.map(stable) : x && typeof x === 'object' ?
  Object.fromEntries(Object.keys(x).sort().map(k => [k, stable(x[k])])) : x;
const hash = x => createHash('sha256').update(JSON.stringify(stable(x))).digest('hex');

export async function makeSecondFinalDeliveryFixture() {
  const f = await makeSecondFinalReservationFixture(), input = clone(f.input);
  const before = clone(input.workflow), history = validateNmlsSecondFinalReservationHistory(input);
  const proposal = await createNmlsSecondFinalReservationEvaluator()({ ...makeNmlsSecondFinalReservationContext(input),
    command: f.command, evidence: f.evidence });
  assert.equal(proposal.reservation.reserved, true);
  const at = f.evidence.receivedAtMs, selection = proposal.reservation.selection, recordedAt = new Date(at).toISOString();
  input.workflow = { ...before, revision: before.revision + 2, runtime: clone(proposal.runtime),
    status: 'second_issued', second_id: selection.id, second_selection: clone(selection), second_issued_at: recordedAt };
  input.actorPolicy.revision = proposal.ledger.revision; input.actorPolicy.ledger = clone(proposal.ledger);
  const t = { student_id: input.actorId, event_id: f.command.eventId, review_attempt_id: input.review.id,
    phase_kind: 'remediation', phase_owner_id: input.firstFinal.id, command_digest: hash(proposal.command),
    source_revision: input.review.revision, workflow_revision: before.revision + 1, runtime_revision: proposal.runtime.revision,
    actor_revision: proposal.ledger.revision, transaction_id: 100, recorded_at: recordedAt,
    lease_before: clone(input.lease), lease_after: clone(input.lease),
    outcome: compactNmlsReviewOutcome(proposal.outcome), audit: clone(proposal.audit) };
  input.latestChildEvent = clone(t); input.secondReservationTeachingEvent = clone(t);
  input.secondReservationEvent = { student_id: input.actorId, event_id: f.command.eventId, first_final_id: input.firstFinal.id,
    review_attempt_id: input.review.id, handoff_event_id: input.handoffOrigin.event_id,
    terminal_event_id: input.terminalChildEvent.event_id, command_digest: hash(f.command),
    teaching_command_digest: hash(proposal.command), definition_digest: input.definition.digest,
    teaching_digest: history.course.digest, phase_scope: clone(history.phase), source_revision: input.review.revision,
    final_revision: 2, workflow_before_revision: before.revision, runtime_before_revision: before.runtime.revision,
    actor_before_revision: f.command.expectedActorRevision, teaching_workflow_revision: before.revision + 1,
    workflow_revision: before.revision + 2, runtime_revision: proposal.runtime.revision,
    actor_revision: proposal.ledger.revision, session_id: before.runtime.sessionId,
    lease_before: clone(input.lease), lease_after: clone(input.lease), runtime_before: clone(before.runtime), runtime: clone(proposal.runtime),
    reserved: true, second_id: selection.id, selection_digest: hash(selection), transaction_id: t.transaction_id, recorded_at: recordedAt,
    outcome: { ok: true, code: 'private_second_final_reserved', status: 200, reserved: true,
      firstFinalId: input.firstFinal.id, secondFinalId: selection.id, finalRevision: 2, sourceRevision: input.review.revision,
      workflowRevision: before.revision + 2, runtimeRevision: proposal.runtime.revision, actorRevision: proposal.ledger.revision,
      sessionId: proposal.runtime.sessionId, teachingCode: proposal.outcome.code, policyCode: proposal.outcome.policyCode,
      observationCode: proposal.outcome.observationCode, mode: 'private_authoring_review', deliveryAllowed: false,
      studentDeliveryEnabled: false, creditIssuanceAllowed: false, retakeEnabled: false } };
  return { input, ledger: clone(proposal.ledger), timeMs: at };
}

export async function makeSecondFinalDeliveryHarness({ mutate = () => {}, ...factories } = {}) {
  const f = await makeSecondFinalDeliveryFixture(); mutate(f);
  let ledger = clone(f.ledger), now = f.timeMs, lease = clone(f.input.lease);
  const branded = () => makeNmlsSecondFinalDeliveryContext({ ...f.input, lease,
    actorPolicy: { ...f.input.actorPolicy, revision: ledger.revision, ledger } });
  let runtime = startNmlsSecondFinalDelivery(branded().finalPhase);
  const evaluate = createNmlsSecondFinalDeliveryEvaluator(factories);
  const h = { f, evaluate, get ledger() { return ledger; }, get runtime() { return runtime; }, get now() { return now; },
    set ledger(value) { ledger = clone(value); }, set runtime(value) { runtime = clone(value); },
    answers(correct = 25) { return Object.fromEntries(f.input.workflow.second_selection.questionIds.map((id, n) => {
      const answer = f.input.definition.items.find(q => q.id === id).correctChoice;
      return [id, n < correct ? answer : ['A', 'B', 'C', 'D'].find(choice => choice !== answer)];
    })); },
    context(kind, extra = {}, at = now + 1, receipt = true) {
      return { ...branded(), sourceCourse: f.input.sourceCourse, runtime, ledger,
        command: { kind, eventId: randomUUID(), expectedRevision: runtime.revision, expectedActorRevision: ledger.revision,
          sessionId: runtime.sessionId, ...(kind === 'submit_second_final' ? { answers: h.answers() } : {}),
          ...(receipt && ledger.observationJournal.active ? { studyReceipt: {
            windowId: ledger.observationJournal.active.id, visible: true } } : {}), ...extra },
        evidence: { actorId: f.input.actorId, receivedAtMs: at } };
    },
    act(kind, extra = {}, at = now + 1, receipt = true) {
      const context = h.context(kind, extra, at, receipt), before = clone(context), r = evaluate(context);
      assert.deepEqual(context, before); runtime = r.runtime; ledger = r.ledger; now = at;
      if (runtime.sessionId) lease = { student_id: f.input.actorId, attempt_id: f.input.review.id,
        phase_kind: 'second_final', phase_owner_id: f.input.workflow.second_id, phase_active: runtime.status === 'active',
        session_id: runtime.sessionId };
      return r;
    },
    open() { h.act('activate'); h.act('heartbeat'); },
  };
  return h;
}
