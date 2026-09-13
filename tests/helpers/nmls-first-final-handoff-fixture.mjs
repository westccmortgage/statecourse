import { createHash, randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { makeFinalDeliveryFixture } from './nmls-final-delivery-fixture.mjs';
import { makeNmlsFirstFinalDeliveryContext, nmlsFinalDeliveryScope } from '../../lib/nmls-final-delivery-context.mjs';
import { createNmlsFirstFinalDeliveryEvaluator, startNmlsFirstFinalDelivery } from '../../lib/nmls-final-delivery.mjs';
import { createNmlsFirstFinalSubmissionEvaluator } from '../../lib/nmls-first-final-submission.mjs';

// SYNTHETIC row-shaped history and invented authority/ROCS/clock evidence.
// Actual pure reducers complete the source, activate/acknowledge the final and
// propose its failed submission. These receipts are NOT SQL-backed history,
// authentic identity, attendance, delivery, regulatory timing or CE credit.
const clone = structuredClone;
const stable = x => Array.isArray(x) ? x.map(stable) : x && typeof x === 'object' ?
  Object.fromEntries(Object.keys(x).sort().map(k => [k, stable(x[k])])) : x;
const hash = x => createHash('sha256').update(JSON.stringify(stable(x))).digest('hex');

export async function makeFirstFinalHandoffFixture({ correct = 0, submissionElapsedMs = 1 } = {}) {
  const f = await makeFinalDeliveryFixture(), i = f.input;
  let ledger = clone(f.ledger), now = f.timeMs, runtime;
  const finalContext = () => makeNmlsFirstFinalDeliveryContext({ ...i,
    actorPolicy: { ...i.actorPolicy, revision: ledger.revision, ledger } });
  runtime = startNmlsFirstFinalDelivery(finalContext().finalPhase);
  const evaluate = createNmlsFirstFinalDeliveryEvaluator();
  function context(kind, extra = {}, elapsed = 1) {
    return { ...finalContext(), sourceCourse: i.sourceCourse, runtime, ledger,
      command: { kind, eventId: randomUUID(), expectedRevision: runtime.revision, expectedActorRevision: ledger.revision,
        sessionId: runtime.sessionId, ...(ledger.observationJournal.active ? {
          studyReceipt: { windowId: ledger.observationJournal.active.id, visible: true } } : {}), ...extra },
      evidence: { actorId: i.actorId, receivedAtMs: now += elapsed } };
  }
  for (const kind of ['activate', 'heartbeat']) {
    const r = evaluate(context(kind)); runtime = r.runtime; ledger = r.ledger;
  }
  const answers = Object.fromEntries(i.reservedFinal.selection.questionIds.map((id, n) => [id,
    n < correct ? i.definition.items.find(item => item.id === id).correctChoice : 'B']));
  const c = context('submit_first_final', { answers }, submissionElapsedMs);
  const result = createNmlsFirstFinalSubmissionEvaluator()(c), t = result.closing, s = result.submission;
  assert.equal(s.submitted, true); assert.equal(s.result.correct, correct);
  const phase = clone(nmlsFinalDeliveryScope(c.finalPhase));
  const oldLease = { student_id: i.actorId, attempt_id: i.review.id, session_id: runtime.sessionId,
    phase_kind: 'final', phase_owner_id: i.reservedFinal.id, phase_active: true };
  const lease = { ...oldLease, phase_active: false }, recordedAt = new Date(now).toISOString();
  const pause = { ...result.command, attemptId: i.review.id, finalAttemptId: i.reservedFinal.id,
    expectedSourceRevision: i.review.revision, expectedFinalRevision: 1 };
  const outcome = { ok: true, code: 'private_first_final_submitted', status: 200, submitted: true,
    finalAttemptId: i.reservedFinal.id, finalRevision: 2, sourceRevision: i.review.revision,
    actorRevision: t.ledger.revision, deliveryRevision: t.runtime.revision, submissionCode: s.code,
    deliveryCode: t.outcome.code, policyCode: t.outcome.policyCode, observationCode: t.outcome.observationCode,
    result: clone(s.result), remediation: clone(s.manifest), workflowRevision: s.childRuntime ? 1 : null,
    mode: 'private_authoring_review', deliveryAllowed: false, studentDeliveryEnabled: false,
    creditIssuanceAllowed: false, retakeEnabled: false };
  const firstFinal = { ...clone(i.reservedFinal), revision: 2, answers: clone(s.answers), result: clone(s.result),
    remediation_manifest: clone(s.manifest), submitted_at: recordedAt };
  const deliveryEvent = { student_id: i.actorId, event_id: c.command.eventId, final_id: firstFinal.id,
    review_attempt_id: i.review.id, command_digest: hash(pause), definition_digest: i.definition.digest,
    source_revision: i.review.revision, final_revision: 1, delivery_revision: t.runtime.revision,
    actor_revision: t.ledger.revision, lease_before: clone(oldLease), lease_after: clone(lease), runtime: clone(t.runtime),
    outcome: clone(t.outcome), audit: clone(t.audit), transaction_id: 2, recorded_at: recordedAt };
  const submissionEvent = { student_id: i.actorId, event_id: c.command.eventId, final_id: firstFinal.id,
    review_attempt_id: i.review.id, command_digest: hash({ ...pause, kind: 'submit_first_final', answers }),
    delivery_command_digest: hash(pause), definition_digest: i.definition.digest, source_revision: i.review.revision,
    final_revision: 2, delivery_revision: t.runtime.revision, actor_revision: t.ledger.revision,
    workflow_revision: outcome.workflowRevision, submitted: true, submission_payload_digest: hash(s), outcome: clone(outcome),
    transaction_id: 2, recorded_at: recordedAt };
  const workflow = s.childRuntime ? { student_id: i.actorId, review_attempt_id: i.review.id, first_final_id: firstFinal.id,
    definition_digest: i.definition.digest, manifest: clone(s.manifest), status: 'remediating', revision: 1,
    runtime: clone(s.childRuntime), second_id: null, second_selection: null, second_answers: null, second_result: null,
    second_issued_at: null, second_submitted_at: null } : null;
  const { reservedFinal, ...source } = i;
  const input = { ...clone(source), firstFinal, workflow, lease, submissionEvent, deliveryEvent,
    actorPolicy: { ...clone(i.actorPolicy), revision: t.ledger.revision, ledger: clone(t.ledger) },
    delivery: { final_id: firstFinal.id, student_id: i.actorId, review_attempt_id: i.review.id,
      phase_scope: phase, revision: t.runtime.revision, runtime: clone(t.runtime) } };
  const command = { kind: 'start_first_remediation', attemptId: i.review.id, finalAttemptId: firstFinal.id,
    eventId: randomUUID(), expectedSourceRevision: i.review.revision, expectedFinalRevision: 2,
    expectedDeliveryRevision: t.runtime.revision, expectedWorkflowRevision: 1, expectedRevision: 0,
    expectedActorRevision: t.ledger.revision, sessionId: t.runtime.sessionId };
  return { input, command, evidence: { actorId: i.actorId, receivedAtMs: now + 1 } };
}
