import { createHash, randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { makeFirstFinalHandoffFixture } from './nmls-first-final-handoff-fixture.mjs';
import { makeNmlsFirstFinalHandoffContext, createNmlsFirstFinalHandoffEvaluator } from '../../lib/nmls-first-final-handoff.mjs';
import { makeNmlsRemediationTeachingContext, nmlsTeachingPhaseScope } from '../../lib/nmls-teaching-phase.mjs';
import { createNmlsObservedPolicyReviewEvaluator } from '../../lib/nmls-study-observer.mjs';
import { compactNmlsReviewOutcome } from '../../lib/nmls-review-runtime.mjs';

// SYNTHETIC pure fixture, not real SQL/authentication/attendance. Actual source,
// first-final, handoff and child reducers generate every runtime/outcome here;
// fake immutable row envelopes mimic032/037 and include032 stored no-delivery
// redaction. No completed child, grade or elapsed teaching is directly seeded.
const clone = structuredClone;
const stable = x => Array.isArray(x) ? x.map(stable) : x && typeof x === 'object' ?
  Object.fromEntries(Object.keys(x).sort().map(k => [k, stable(x[k])])) : x;
const hash = x => createHash('sha256').update(JSON.stringify(stable(x))).digest('hex');

export async function makeSecondFinalReservationFixture({ acknowledgeQuiz = true } = {}) {
  const f = await makeFirstFinalHandoffFixture(), input = clone(f.input);
  let now = f.evidence.receivedAtMs, transaction = 3;
  const handoff = makeNmlsFirstFinalHandoffContext(input), phase = clone(nmlsTeachingPhaseScope(handoff.teachingPhase));
  const initialLease = clone(input.lease);
  const start = await createNmlsFirstFinalHandoffEvaluator()({ ...handoff, command: clone(f.command), evidence: clone(f.evidence) });
  function save(result, command) {
    const before = clone(input.lease);
    input.workflow.revision++; input.workflow.runtime = clone(result.runtime);
    input.actorPolicy.revision = result.ledger.revision; input.actorPolicy.ledger = clone(result.ledger);
    input.lease = { ...before, phase_kind: 'remediation', phase_owner_id: input.firstFinal.id,
      session_id: result.runtime.sessionId ?? before.session_id, phase_active: result.runtime.status === 'active' };
    const outcome = { ...compactNmlsReviewOutcome(result.outcome), deliveryAllowed: false, deliveryUntilMs: null };
    const e = { student_id: input.actorId, event_id: command.eventId, review_attempt_id: input.review.id,
      phase_kind: 'remediation', phase_owner_id: input.firstFinal.id, command_digest: hash(command),
      actor_revision: result.ledger.revision, source_revision: input.review.revision,
      workflow_revision: input.workflow.revision, runtime_revision: result.runtime.revision,
      lease_before: before, lease_after: clone(input.lease), outcome, audit: clone(result.audit),
      transaction_id: transaction++, recorded_at: new Date(now).toISOString() };
    input.latestChildEvent = clone(e);
    if (result.runtime.status === 'review_complete' && result.audit.review.kind === 'quiz_submit') input.terminalChildEvent = clone(e);
    return e;
  }
  const t = save(start, start.command), r = start.runtime, o = start.outcome;
  input.handoffOriginTeachingEvent = clone(t);
  input.handoffOrigin = { student_id: input.actorId, event_id: f.command.eventId, final_id: input.firstFinal.id,
    review_attempt_id: input.review.id, genesis_event_id: input.submissionEvent.event_id,
    command_digest: hash(f.command), teaching_command_digest: hash(start.command), definition_digest: input.definition.digest,
    teaching_digest: handoff.course.digest, phase_scope: phase, source_revision: input.review.revision,
    final_revision: 2, delivery_revision: input.delivery.revision, workflow_revision: 2, runtime_revision: 1,
    actor_revision: start.ledger.revision, lease_before: initialLease, lease_after: clone(input.lease), runtime: clone(r),
    outcome: { ok: true, code: 'private_first_remediation_handed_off', status: 200, handedOff: true,
      finalAttemptId: input.firstFinal.id, finalRevision: 2, sourceRevision: input.review.revision,
      deliveryRevision: input.delivery.revision, workflowRevision: 2, runtimeRevision: 1,
      actorRevision: start.ledger.revision, sessionId: r.sessionId, runtimeStatus: r.status,
      teachingOk: o.ok, teachingStatus: o.status, teachingCode: o.code, policyCode: o.policyCode, observationCode: o.observationCode,
      mode: 'private_authoring_review', deliveryAllowed: false, studentDeliveryEnabled: false, creditIssuanceAllowed: false, retakeEnabled: false },
    transaction_id: t.transaction_id, recorded_at: t.recorded_at };
  input.childBinding = { student_id: input.actorId, review_attempt_id: input.review.id, phase_kind: 'remediation',
    phase_owner_id: input.firstFinal.id, phase_scope: phase, teaching_digest: handoff.course.digest,
    layout: handoff.course.modules.map(m => ({ id: m.id, units: m.units.map(u => ({ id: u.id,
      requiredMs: u.requiredSeconds * 1000, requiredActionIds: [u.actionQuestion.id] })),
      passPercent: m.quiz.passPercent, questionsPerAttempt: m.quiz.questionsPerAttempt })) };
  const evaluate = createNmlsObservedPolicyReviewEvaluator();
  async function act(kind, extra = {}, elapsed = 1) {
    now += elapsed;
    const teaching = makeNmlsRemediationTeachingContext(input), ledger = input.actorPolicy.ledger;
    const command = { kind, attemptId: input.review.id, eventId: randomUUID(), phaseKind: 'remediation', phaseOwnerId: input.firstFinal.id,
      expectedSourceRevision: input.review.revision, expectedWorkflowRevision: input.workflow.revision,
      expectedRevision: teaching.runtime.revision, expectedActorRevision: ledger.revision, sessionId: teaching.runtime.sessionId,
      ...(ledger.observationJournal.active ? { studyReceipt: { windowId: ledger.observationJournal.active.id, visible: true } } : {}), ...extra };
    const result = await evaluate({ ...teaching, ledger, command, evidence: { actorId: input.actorId, receivedAtMs: now } });
    assert.equal(result.outcome.ok, true, `${kind}: ${result.outcome.code}`);
    save(result, command); return result;
  }
  for (const module of handoff.course.modules) {
    for (const unit of module.units) {
      await act('open_unit', { unitId: unit.id }); await act('interaction', { visible: true });
      await act('heartbeat', { visible: true }, unit.requiredSeconds * 1000);
      await act('unit_action', { choice: unit.actionQuestion.correctChoice }); await act('complete_unit');
    }
    await act('quiz_start', { moduleId: module.id });
    if (acknowledgeQuiz) await act('interaction', { visible: true });
    const quiz = input.workflow.runtime.quiz;
    await act('quiz_submit', { quizId: quiz.id, answers: Object.fromEntries(quiz.questionIds.map(id =>
      [id, module.quiz.bank.find(q => q.id === id).correctChoice])) });
  }
  assert.equal(input.workflow.runtime.status, 'review_complete'); assert.ok(input.terminalChildEvent);
  const command = { kind: 'reserve_second_final', attemptId: input.review.id, firstFinalId: input.firstFinal.id,
    eventId: randomUUID(), expectedSourceRevision: input.review.revision, expectedFinalRevision: 2,
    expectedWorkflowRevision: input.workflow.revision, expectedRevision: input.workflow.runtime.revision,
    expectedActorRevision: input.actorPolicy.revision, sessionId: input.workflow.runtime.sessionId };
  return { input, command, evidence: { actorId: input.actorId, receivedAtMs: now + 1 } };
}
