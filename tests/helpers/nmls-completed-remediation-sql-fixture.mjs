import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { setTimeout as pause } from 'node:timers/promises';
import { makeNmlsFirstFinalSubmissionSqlFixture } from './nmls-first-final-submission-sql-fixture.mjs';
import { transactNmlsFirstFinalHandoff } from '../../netlify/functions/_lib/nmls-first-final-handoff.mjs';
import { makeNmlsFinalRemediationCourse } from '../../lib/nmls-final-assessment.mjs';
import { digestNmlsCommand } from '../../netlify/functions/_lib/nmls-review-service.mjs';

// LOCAL DISPOSABLE SQL TEST FIXTURE ONLY. Caller owns DB/roles/students/RPC and
// actual023–037 (or later additive) migrations. The inherited source and child
// each have ONE SYNTHETIC ONE-SECOND unit. No completed source, final result,
// child or child completion is owner-seeded: real032→033→035→036→037→032 run.
// Real short waits exercise engineering clocks, not human attendance, genuine
// ROCS/BioSig,400-minute timing, concurrency, approval or CE credit. Private
// rows, synthetic answers and helper controls must never become a UI payload.

/**
 * Build a genuine failed-first/child lifecycle and complete the child by
 * default. `through:'active'` stops just after037 for prerequisite-denial tests;
 * `completeChild()` may then run the actual lesson/action/quiz exactly once.
 * `beforeActivation` is the inherited explicitly test-only deadline hook.
 * Inherited command/run/act remain OLD first-delivery helpers, not retake APIs.
 */
export async function makeNmlsCompletedRemediationSqlFixture({ db, rpc, through = 'completed', beforeActivation } = {}) {
  assert.ok(['active', 'completed'].includes(through));
  const h = await makeNmlsFirstFinalSubmissionSqlFixture({ db, rpc, correctCount: 17, beforeActivation });
  const before = await h.rows(), initialWorkflow = await h.workflow();
  h.childCourse = makeNmlsFinalRemediationCourse(h.definition, h.course, before.reservedFinal.selection, h.submissionCommand.answers);
  assert.equal(h.childCourse.modules.length, 1); assert.equal(h.childCourse.modules[0].units.length, 1);
  assert.equal(h.childCourse.modules[0].units[0].requiredSeconds, 1);
  h.handoffCommand = { kind: 'start_first_remediation', attemptId: h.attemptId, finalAttemptId: h.finalId,
    eventId: randomUUID(), expectedSourceRevision: before.source.revision, expectedFinalRevision: 2,
    expectedDeliveryRevision: before.delivery.revision, expectedWorkflowRevision: initialWorkflow.revision,
    expectedRevision: initialWorkflow.runtime.revision, expectedActorRevision: before.actor.revision,
    sessionId: before.delivery.runtime.sessionId };
  h.handoff = await transactNmlsFirstFinalHandoff(h.handoffCommand, h.actor, h.deps);
  assert.equal(h.handoff.body.handedOff, true); assert.equal(h.handoff.body.duplicate, false);
  assert.equal(h.handoff.body.teachingCode, 'review_session_started');
  for (const flag of ['deliveryAllowed', 'studentDeliveryEnabled', 'creditIssuanceAllowed', 'retakeEnabled']) {
    assert.equal(h.handoff.body[flag], false);
  }
  h.handoffContext = (eventId = h.handoffCommand.eventId) => rpc('nmls_first_final_handoff_context', {
    p_student_id: h.actor, p_attempt_id: h.attemptId, p_final_id: h.finalId, p_event_id: eventId,
  });
  h.childContext = () => rpc('nmls_teaching_context', { p_student_id: h.actor, p_attempt_id: h.attemptId,
    p_phase_kind: 'remediation', p_phase_owner_id: h.finalId });
  h.childCommand = async (kind, extra = {}) => {
    const c = await h.childContext(), r = c.workflow.runtime;
    return { kind, attemptId: h.attemptId, phaseKind: 'remediation', phaseOwnerId: h.finalId, eventId: randomUUID(),
      expectedSourceRevision: c.attempt.revision, expectedWorkflowRevision: c.workflow.revision,
      expectedRevision: r.revision, expectedActorRevision: c.actorPolicy.revision, sessionId: r.sessionId,
      ...(c.actorPolicy.ledger.observationJournal.active ? { studyReceipt: {
        windowId: c.actorPolicy.ledger.observationJournal.active.id, visible: true } } : {}),
      ...(kind === 'interaction' ? { observation: 'keyboard' } : {}), ...extra };
  };
  h.childAct = async (kind, extra = {}, options = {}) => {
    const input = await h.childCommand(kind, extra), response = await h.teach(input, options);
    const rows = await h.rows(), workflow = await h.workflow();
    assert.equal(response.body.duplicate, false); assert.equal(response.body.progress.creditIssuanceAllowed, false);
    assert.equal(rows.actor.revision, input.expectedActorRevision + 1);
    assert.equal(workflow.revision, input.expectedWorkflowRevision + 1);
    assert.equal(workflow.runtime.revision, input.expectedRevision + 1);
    assert.deepEqual(rows.source, before.source); assert.deepEqual(rows.reservedFinal, before.reservedFinal);
    assert.deepEqual(rows.delivery, before.delivery);
    return response;
  };
  h.completionEvent = async () => h.completionCommand ? (await db.query(`select * from nmls_teaching_events
    where student_id=$1 and event_id=$2`, [h.actor, h.completionCommand.eventId])).rows[0] : undefined;

  const afterHandoff = await h.rows(), activeWorkflow = await h.workflow(), pair = await h.handoffContext();
  assert.equal(activeWorkflow.revision, 2); assert.equal(activeWorkflow.runtime.revision, 1);
  assert.equal(activeWorkflow.runtime.status, 'active'); assert.equal(activeWorkflow.runtime.current, null);
  assert.equal(activeWorkflow.runtime.quiz, null); assert.equal(activeWorkflow.runtime.completedReviewMs, 0);
  assert.notEqual(activeWorkflow.runtime.sessionId, before.delivery.runtime.sessionId);
  assert.equal(afterHandoff.actor.revision, before.actor.revision + 1);
  assert.deepEqual(afterHandoff.source, before.source); assert.deepEqual(afterHandoff.reservedFinal, before.reservedFinal);
  assert.deepEqual(afterHandoff.delivery, before.delivery);
  assert.equal(afterHandoff.lease.phase_kind, 'remediation'); assert.equal(afterHandoff.lease.phase_owner_id, h.finalId);
  assert.equal(afterHandoff.lease.phase_active, true); assert.equal(afterHandoff.lease.session_id, activeWorkflow.runtime.sessionId);
  assert.equal(pair.handoffEvent.transaction_id, pair.handoffTeachingEvent.transaction_id);
  assert.equal(pair.handoffEvent.genesis_event_id, h.submissionCommand.eventId);
  assert.equal(pair.handoffEvent.command_digest, digestNmlsCommand(h.handoffCommand));
  assert.equal(pair.handoffEvent.actor_revision, afterHandoff.actor.revision);
  assert.equal(afterHandoff.actor.ledger.observationJournal.active, null);
  assert.equal(afterHandoff.actor.ledger.observationJournal.unresolved, null);
  for (const field of ['studyIntervals', 'studySinceBreakMs', 'sessionStartedAtMs', 'studyBoundaryAtMs',
    'lastStudyAtMs', 'uncertainExposure', 'acceptances']) assert.deepEqual(afterHandoff.actor.ledger[field], before.actor.ledger[field]);

  h.completeChild = async () => {
    assert.equal(h.completion, undefined, 'fixture completion runs only once; replay uses saved command');
    assert.equal((await h.workflow()).runtime.status, 'active');
    const unit = h.childCourse.modules[0].units[0], module = h.childCourse.modules[0];
    const opened = await h.childAct('open_unit', { unitId: unit.id });
    assert.equal(opened.body.deliveryAllowed, true); assert.equal(opened.body.progress.lessons.length, 1);
    assert.equal(opened.body.progress.lessons[0].content, unit.content);
    await h.childAct('interaction', { visible: true });
    await pause(1100);
    await h.childAct('heartbeat', { visible: true });
    await h.childAct('unit_action', { choice: unit.actionQuestion.correctChoice });
    assert.equal((await h.childAct('complete_unit')).body.code, 'unit_review_complete');
    await h.childAct('quiz_start', { moduleId: module.id });
    await h.childAct('interaction', { visible: true });
    const quiz = (await h.childContext()).workflow.runtime.quiz;
    const answers = Object.fromEntries(quiz.questionIds.map(id => [id, module.quiz.bank.find(q => q.id === id).correctChoice]));
    h.completionCommand = await h.childCommand('quiz_submit', { quizId: quiz.id, answers });
    h.completion = await h.teach(h.completionCommand);
    assert.equal(h.completion.body.code, 'module_review_passed'); assert.equal(h.completion.body.duplicate, false);
    assert.equal(h.completion.body.deliveryAllowed, false); assert.equal(h.completion.body.teachingPhaseComplete, true);
    assert.equal(h.completion.body.progress.status, 'review_complete');
    assert.equal(h.completion.body.progress.creditIssuanceAllowed, false);
    assert.deepEqual(h.completion.body.progress.lessons, []); assert.equal(h.completion.body.progress.quiz, null);
    const rows = await h.rows(), workflow = await h.workflow(), event = await h.completionEvent();
    assert.deepEqual(rows.source, before.source); assert.deepEqual(rows.reservedFinal, before.reservedFinal);
    assert.deepEqual(rows.delivery, before.delivery); assert.deepEqual(workflow.manifest, initialWorkflow.manifest);
    assert.equal(workflow.status, 'remediating'); assert.equal(workflow.runtime.status, 'review_complete');
    assert.equal(workflow.runtime.completedReviewMs, 1000);
    assert.deepEqual(workflow.runtime.completedUnitIds, [unit.id]); assert.deepEqual(workflow.runtime.passedModuleIds, [module.id]);
    for (const field of ['current', 'quiz']) assert.equal(workflow.runtime[field], null);
    assert.equal(workflow.runtime.bookmark ?? null, null); assert.equal(workflow.runtime.quizReservation ?? null, null);
    for (const field of ['second_id', 'second_selection', 'second_answers', 'second_result', 'second_issued_at', 'second_submitted_at']) {
      assert.equal(workflow[field], null);
    }
    assert.equal(workflow.manifest.completed, false); assert.equal(workflow.manifest.retakeEnabled, false);
    assert.equal(rows.actor.revision, h.completionCommand.expectedActorRevision + 1);
    assert.equal(workflow.revision, h.completionCommand.expectedWorkflowRevision + 1);
    assert.equal(workflow.runtime.revision, h.completionCommand.expectedRevision + 1);
    assert.equal(rows.actor.ledger.observationJournal.active, null); assert.equal(rows.actor.ledger.observationJournal.unresolved, null);
    assert.equal(rows.lease.phase_kind, 'remediation'); assert.equal(rows.lease.phase_owner_id, h.finalId);
    assert.equal(rows.lease.session_id, workflow.runtime.sessionId); assert.equal(rows.lease.phase_active, false);
    assert.equal(event.command_digest, digestNmlsCommand(h.completionCommand));
    assert.equal(event.actor_revision, rows.actor.revision); assert.equal(event.workflow_revision, workflow.revision);
    assert.equal(event.runtime_revision, workflow.runtime.revision); assert.equal(event.source_revision, rows.source.revision);
    assert.equal(event.audit.review.kind, 'quiz_submit'); assert.equal(event.audit.review.passed, true);
    assert.equal(event.outcome.teachingPhaseComplete, true); assert.equal(event.outcome.policyCode, 'session_policy_allowed');
    assert.equal(event.outcome.deliveryAllowed, false); assert.deepEqual(event.outcome.progress.lessons, []);
    assert.equal(event.outcome.progress.quiz, null); assert.equal(event.outcome.progress.feedback, null);
    assert.equal((await db.query('select count(*)::int as n from nmls_first_final_handoff_events where student_id=$1', [h.actor])).rows[0].n, 1);
    return h.completion;
  };
  if (through === 'completed') await h.completeChild();
  return h;
}
