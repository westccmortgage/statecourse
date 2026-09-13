import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeNmlsCompletedRemediationSqlFixture } from './nmls-completed-remediation-sql-fixture.mjs';
import { transactNmlsSecondFinalReservation } from '../../netlify/functions/_lib/nmls-second-final-reservation.mjs';
import { digestNmlsCommand } from '../../netlify/functions/_lib/nmls-review-service.mjs';
import { makeNmlsSecondFinalDeliveryContext, startNmlsSecondFinalDelivery,
  createNmlsSecondFinalDeliveryEvaluator, nmlsSecondFinalDeliveryScope } from '../../lib/nmls-second-final-delivery.mjs';

// Actual local023–039 writer fixture, synthetic ONE-SECOND teaching units.
// No real identity, attendance, approval or credit is established by this test.
export async function makeNmlsSecondFinalDeliverySqlFixture({ db, rpc, beforeActivation, reservationClockSkewMs = 0 } = {}) {
  const h = await makeNmlsCompletedRemediationSqlFixture({ db, rpc, beforeActivation });
  const before = await h.rows(), w = await h.workflow();
  h.secondReservationCommand = { kind: 'reserve_second_final', attemptId: h.attemptId, firstFinalId: h.finalId,
    eventId: randomUUID(), expectedSourceRevision: before.source.revision, expectedFinalRevision: 2,
    expectedWorkflowRevision: w.revision, expectedRevision: w.runtime.revision,
    expectedActorRevision: before.actor.revision, sessionId: w.runtime.sessionId };
  h.secondReservation = await transactNmlsSecondFinalReservation(h.secondReservationCommand, h.actor, {
    ...h.deps, rpc: async (name, args) => {
      const result = await rpc(name, args);
      // Explicit transport-clock fixture inside the existing SQL±1000ms bound.
      return name === 'nmls_second_final_reservation_context' && reservationClockSkewMs ?
        { ...result, serverTimeMs: result.serverTimeMs + reservationClockSkewMs } : result;
    },
  });
  assert.equal(h.secondReservation.body.reserved, true);
  h.secondId = h.secondReservation.body.secondFinalId;
  h.secondContext = (eventId = randomUUID()) => rpc('nmls_second_final_delivery_context', {
    p_student_id: h.actor, p_attempt_id: h.attemptId, p_first_final_id: h.finalId,
    p_second_final_id: h.secondId, p_event_id: eventId,
  });
  h.secondInput = c => ({ actorId: h.actor, sourceCourse: h.course, definition: h.definition,
    review: c.attempt, binding: c.binding, firstFinal: c.reservedFinal, workflow: c.workflow,
    actorPolicy: c.actorPolicy, lease: c.lease, delivery: c.delivery,
    submissionEvent: c.genesisEvent, deliveryEvent: c.genesisDeliveryEvent,
    reservation: c.reservation, teachingEvent: c.teachingEvent,
    handoffOrigin: c.handoffOrigin, handoffOriginTeachingEvent: c.handoffOriginTeachingEvent,
    terminalChildEvent: c.terminalChildEvent, latestChildEvent: c.latestChildEvent, childBinding: c.childBinding,
    secondReservationEvent: c.secondReservationOrigin,
    secondReservationTeachingEvent: c.secondReservationOriginTeachingEvent });
  h.secondProposal = async (kind, extra = {}, { receipt = true, evaluate = createNmlsSecondFinalDeliveryEvaluator() } = {}) => {
    const eventId = randomUUID(), c = await h.secondContext(eventId), context = makeNmlsSecondFinalDeliveryContext(h.secondInput(c));
    const runtime = c.secondDelivery?.runtime ?? startNmlsSecondFinalDelivery(context.finalPhase);
    const ledger = c.actorPolicy.ledger;
    const command = { kind, eventId, expectedRevision: runtime.revision, expectedActorRevision: ledger.revision,
      sessionId: runtime.sessionId, ...(receipt && ledger.observationJournal.active ? {
        studyReceipt: { windowId: ledger.observationJournal.active.id, visible: true } } : {}), ...extra };
    const intent = { ...command, attemptId: h.attemptId, firstFinalId: h.finalId, secondFinalId: h.secondId,
      expectedSourceRevision: c.attempt.revision, expectedFinalRevision: 2, expectedWorkflowRevision: c.workflow.revision };
    const result = evaluate({ ...context, runtime, ledger,
      evidence: { actorId: h.actor, receivedAtMs: c.serverTimeMs }, command });
    const args = { p_student_id: h.actor, p_attempt_id: h.attemptId, p_first_final_id: h.finalId,
      p_second_final_id: h.secondId, p_event_id: eventId, p_command_digest: digestNmlsCommand(intent),
      p_expected_source_revision: c.attempt.revision, p_expected_final_revision: 2,
      p_expected_workflow_revision: c.workflow.revision, p_expected_delivery_revision: runtime.revision,
      p_expected_actor_revision: ledger.revision, p_expected_session_id: runtime.sessionId,
      p_evaluated_at_ms: c.serverTimeMs, p_definition_digest: h.definition.digest, p_definition: h.definition,
      p_transition: { phase: nmlsSecondFinalDeliveryScope(context.finalPhase), command,
        runtime: result.runtime, ledger: result.ledger, outcome: result.outcome, audit: result.audit } };
    return { c, context, runtime, ledger, command, intent, result, args };
  };
  h.secondAct = async (kind, extra, options) => {
    const p = await h.secondProposal(kind, extra, options);
    const response = await rpc('nmls_second_final_delivery_commit', p.args);
    assert.deepEqual(response, { duplicate: false, outcome: p.result.outcome, runtime: p.result.runtime,
      sourceRevision: p.c.attempt.revision, workflowRevision: p.c.workflow.revision });
    return { ...p, response };
  };
  return h;
}
