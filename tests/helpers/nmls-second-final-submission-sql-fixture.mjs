import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeNmlsSecondFinalDeliverySqlFixture } from './nmls-second-final-delivery-sql-fixture.mjs';
import { transactNmlsSecondFinalDelivery } from '../../netlify/functions/_lib/nmls-second-final-delivery.mjs';
import { transactNmlsSecondFinalSubmission } from '../../netlify/functions/_lib/nmls-second-final-submission.mjs';

// Actual local023–040 plus real private adapters. Synthetic one-second course
// units and evidence; never attendance, identity, approval or CE-credit proof.
export async function makeNmlsSecondFinalSubmissionSqlFixture({ db, rpc, through = 'acknowledged', ...options } = {}) {
  const h = await makeNmlsSecondFinalDeliverySqlFixture({ db, rpc, ...options });
  h.secondCommand = async (kind, extra = {}, receipt = true) => {
    const c = await h.secondContext();
    return { kind, attemptId: h.attemptId, firstFinalId: h.finalId, secondFinalId: h.secondId,
      eventId: randomUUID(), expectedSourceRevision: c.attempt.revision, expectedFinalRevision: 2,
      expectedWorkflowRevision: c.workflow.revision, expectedRevision: c.secondDelivery?.revision ?? 0,
      expectedActorRevision: c.actorPolicy.revision, sessionId: c.secondDelivery?.runtime.sessionId ?? null,
      ...(receipt && c.actorPolicy.ledger.observationJournal.active ? { studyReceipt: {
        windowId: c.actorPolicy.ledger.observationJournal.active.id, visible: true } } : {}), ...extra };
  };
  h.secondAdapterAct = async (kind, extra = {}, receipt = true, deps = {}) => {
    const command = await h.secondCommand(kind, extra, receipt);
    return { command, response: await transactNmlsSecondFinalDelivery(command, h.actor, { ...h.deps, ...deps }) };
  };
  h.secondAnswers = async (correct = 18) => {
    const w = await h.workflow();
    return Object.fromEntries(w.second_selection.questionIds.map((id, n) => {
      const answer = h.definition.items.find(q => q.id === id).correctChoice;
      return [id, n < correct ? answer : ['A', 'B', 'C', 'D'].find(choice => choice !== answer)];
    }));
  };
  h.secondSubmitCommand = async (correct = 18, extra = {}, receipt = true) =>
    h.secondCommand('submit_second_final', { answers: await h.secondAnswers(correct), ...extra }, receipt);
  h.secondSubmit = (input, deps = {}) => transactNmlsSecondFinalSubmission(input, h.actor, { ...h.deps, ...deps });
  h.secondSubmissionContext = eventId => rpc('nmls_second_final_submission_context', {
    p_student_id: h.actor, p_attempt_id: h.attemptId, p_first_final_id: h.finalId,
    p_second_final_id: h.secondId, p_event_id: eventId,
  });
  if (through !== 'reserved') {
    h.secondActivation = await h.secondAdapterAct('activate');
    assert.equal(h.secondActivation.response.body.deliveryAllowed, true);
    assert.equal(h.secondActivation.response.body.questions.length, 25);
    if (through === 'acknowledged') {
      h.secondAcknowledgment = await h.secondAdapterAct('heartbeat');
      assert.equal(h.secondAcknowledgment.response.body.deliveryAllowed, true);
    } else assert.equal(through, 'active');
  }
  return h;
}
