import assert from 'node:assert/strict';
import { makeNmlsFirstFinalSqlFixture } from './nmls-first-final-sql-fixture.mjs';
import { transactNmlsFirstFinalSubmission } from '../../netlify/functions/_lib/nmls-first-final-submission.mjs';
import { digestNmlsCommand } from '../../netlify/functions/_lib/nmls-review-service.mjs';
import { gradeNmlsDraftFinal, makeNmlsFinalRemediationCourse } from '../../lib/nmls-final-assessment.mjs';
import { startNmlsCourseReview } from '../../lib/nmls-review-runtime.mjs';

// LOCAL DISPOSABLE SQL TEST FIXTURE ONLY. Caller owns a DB with the actual
// migrations023–036, students/roles, RPC transport and teardown. The inherited
// one-unit/ONE-SECOND source, final bank and ROCS evidence are SYNTHETIC. Real
// source teaching, reservation, activation, acknowledgment and submission are
// traversed; this helper NEVER inserts completed progress, a grade or a child.
// No human attendance, CE completion, live release or real concurrency proof.
// It stops after036. No handoff, child activation or second draw is performed.

function immutableFirst(row) {
  const { revision, answers, result, remediation_manifest, submitted_at, ...immutable } = row;
  return immutable;
}

/**
 * Produce an actual sealed first final:17 correct (default) creates a pristine
 * required child,18 correct passes with no child. The caller supplies db/rpc.
 *
 * Returns the inherited first-final fixture plus submissionCommand/submission,
 * workflow() (current private child row or undefined) and submissionContext()
 * (current private036 context; optional eventId defaults to the sealed event).
 * Inherited command/run/act are OLD final-delivery helpers, not child authority.
 * Raw private rows/contexts and synthetic answers must never become a UI body.
 * Optional beforeActivation(h) installs explicitly labeled test-only deadlines
 * after genuine reservation but BEFORE any final delivery window exists. It
 * must not fabricate progress, a grade, a child, acceptance or a final receipt.
 */
export async function makeNmlsFirstFinalSubmissionSqlFixture({ db, rpc, correctCount = 17, beforeActivation } = {}) {
  assert.ok(correctCount === 17 || correctCount === 18, 'fixture exercises the exact17/18 threshold only');
  assert.ok(beforeActivation === undefined || typeof beforeActivation === 'function');
  const h = await makeNmlsFirstFinalSqlFixture({ db, rpc, through: beforeActivation ? 'reserved' : 'acknowledged' });
  if (beforeActivation) { await beforeActivation(h); await h.activate(); await h.acknowledge(); }
  const before = await h.rows();
  const sourceEvents = (await db.query('select * from nmls_teaching_events where student_id=$1 order by actor_revision', [h.actor])).rows;
  const reservations = (await db.query('select * from nmls_final_reservation_events where student_id=$1 order by actor_revision', [h.actor])).rows;
  const previousDeliveries = (await db.query('select * from nmls_first_final_delivery_events where student_id=$1 order by actor_revision', [h.actor])).rows;
  assert.equal(before.delivery.runtime.status, 'active');
  assert.ok(Number.isSafeInteger(before.actor.ledger.observationJournal.active.lastObservedAtMs));

  const submissionCommand = await h.command('submit_first_final', {
    expectedFinalRevision: 1, answers: await h.answersFor(correctCount),
  });
  const submission = await transactNmlsFirstFinalSubmission(submissionCommand, h.actor, h.deps);
  assert.equal(submission.status, 200); assert.equal(submission.body.status, 200);
  assert.equal(submission.body.duplicate, false); assert.equal(submission.body.submitted, true);
  assert.equal(submission.body.code, 'private_first_final_submitted');
  for (const flag of ['studentDeliveryEnabled', 'creditIssuanceAllowed', 'deliveryAllowed', 'retakeEnabled']) {
    assert.equal(submission.body[flag], false);
  }
  for (const key of ['questions', 'answers', 'runtime', 'ledger', 'audit', 'selection', 'definition', 'childRuntime']) {
    assert.equal(Object.hasOwn(submission.body, key), false);
  }
  assert.doesNotMatch(JSON.stringify(submission.body), /PRIVATE SYNTHETIC|correctChoice|questionIds|optionOrder|rationale/);

  const workflow = async () => (await db.query(`select * from nmls_private_remediations
    where first_final_id=$1 and student_id=$2 and review_attempt_id=$3`, [h.finalId, h.actor, h.attemptId])).rows[0];
  const submissionContext = (eventId = submissionCommand.eventId) => rpc('nmls_first_final_submission_context', {
    p_student_id: h.actor, p_attempt_id: h.attemptId, p_final_id: h.finalId, p_event_id: eventId,
  });
  const after = await h.rows();
  assert.deepEqual(after.source, before.source, 'the original source is never rewritten by submission');
  assert.deepEqual(immutableFirst(after.reservedFinal), immutableFirst(before.reservedFinal));
  assert.equal(after.reservedFinal.revision, 2); assert.ok(after.reservedFinal.submitted_at);
  assert.deepEqual(after.reservedFinal.answers, submissionCommand.answers);
  const expected = gradeNmlsDraftFinal(h.definition, after.reservedFinal.selection, submissionCommand.answers);
  assert.deepEqual(after.reservedFinal.result, expected); assert.deepEqual(submission.body.result, expected);
  assert.equal(expected.correct, correctCount); assert.equal(expected.requiredCorrect, 18);
  assert.equal(expected.passed, correctCount === 18); assert.equal(expected.assignedCreditSeconds, 0);
  assert.equal(expected.courseCompletionIssued, false);
  assert.equal(after.actor.revision, before.actor.revision + 1);
  assert.equal(after.delivery.revision, before.delivery.revision + 1);
  assert.equal(after.delivery.runtime.status, 'paused');
  assert.equal(after.delivery.runtime.sessionId, before.delivery.runtime.sessionId);
  assert.equal(after.delivery.runtime.lastActivityMs, before.delivery.runtime.lastActivityMs);
  assert.equal(after.lease.phase_kind, 'final'); assert.equal(after.lease.phase_owner_id, h.finalId);
  assert.equal(after.lease.phase_active, false); assert.equal(after.lease.session_id, before.lease.session_id);
  assert.equal(after.actor.ledger.observationJournal.active, null);
  assert.equal(after.actor.ledger.observationJournal.unresolved, null);

  const context = await submissionContext(), event = context.submissionEvent, closing = context.deliveryEvent;
  assert.ok(event); assert.ok(closing);
  assert.equal(event.student_id, h.actor); assert.equal(event.review_attempt_id, h.attemptId);
  assert.equal(event.final_id, h.finalId); assert.equal(event.event_id, submissionCommand.eventId);
  assert.equal(event.submitted, true); assert.equal(event.final_revision, 2);
  assert.equal(event.source_revision, before.source.revision); assert.equal(event.definition_digest, h.definition.digest);
  assert.equal(event.command_digest, digestNmlsCommand(submissionCommand));
  const { answers, ...pauseIntent } = submissionCommand;
  assert.equal(event.delivery_command_digest, digestNmlsCommand({ ...pauseIntent, kind: 'pause' }));
  assert.equal(closing.command_digest, event.delivery_command_digest);
  for (const field of ['student_id', 'event_id', 'final_id', 'review_attempt_id', 'definition_digest',
    'source_revision', 'delivery_revision', 'actor_revision', 'transaction_id']) assert.equal(closing[field], event[field]);
  assert.equal(closing.final_revision, 1); assert.ok(Number.isSafeInteger(event.transaction_id));
  assert.equal(event.actor_revision, after.actor.revision); assert.equal(event.delivery_revision, after.delivery.revision);
  assert.deepEqual(closing.runtime, after.delivery.runtime);
  assert.equal(closing.outcome.candidateMaterialAllowed, false);
  assert.equal(closing.outcome.candidateUntilMs, null); assert.equal(closing.outcome.candidateWindow, null);
  const { duplicate, ...outcome } = submission.body;
  assert.deepEqual(event.outcome, outcome);
  assert.deepEqual((await db.query('select * from nmls_teaching_events where student_id=$1 order by actor_revision', [h.actor])).rows, sourceEvents);
  assert.deepEqual((await db.query('select * from nmls_final_reservation_events where student_id=$1 order by actor_revision', [h.actor])).rows, reservations);
  const deliveries = (await db.query('select * from nmls_first_final_delivery_events where student_id=$1 order by actor_revision', [h.actor])).rows;
  assert.equal(deliveries.length, previousDeliveries.length + 1);
  assert.deepEqual(deliveries.slice(0, -1), previousDeliveries);
  assert.equal((await db.query('select count(*)::int as n from nmls_first_final_submission_events where student_id=$1', [h.actor])).rows[0].n, 1);
  for (const table of ['nmls_private_final_events', 'nmls_private_remediation_events']) {
    assert.deepEqual((await db.query(`select * from ${table} where student_id=$1`, [h.actor])).rows, [], 'no026/028 mirrored submission event');
  }

  const child = await workflow();
  if (correctCount === 18) {
    assert.equal(child, undefined); assert.equal(context.workflow, null);
    assert.equal(after.reservedFinal.remediation_manifest, null);
    assert.equal(submission.body.remediation, null); assert.equal(submission.body.workflowRevision, null);
  } else {
    const childCourse = makeNmlsFinalRemediationCourse(h.definition, h.course, after.reservedFinal.selection, submissionCommand.answers);
    assert.equal(child.first_final_id, h.finalId); assert.equal(child.student_id, h.actor);
    assert.equal(child.review_attempt_id, h.attemptId); assert.equal(child.definition_digest, h.definition.digest);
    assert.equal(child.revision, 1); assert.equal(child.status, 'remediating');
    assert.deepEqual(child.runtime, startNmlsCourseReview(childCourse));
    assert.deepEqual(child.manifest, after.reservedFinal.remediation_manifest);
    assert.deepEqual(submission.body.remediation, child.manifest); assert.equal(submission.body.workflowRevision, 1);
    assert.equal(child.manifest.completed, false); assert.equal(child.manifest.retakeEnabled, false);
    // JSON RPC timestamps are strings; a direct SQL driver may return Date.
    // Compare the same instant without changing either returned private row.
    const { started_at: contextStarted, ...contextChild } = context.workflow;
    const { started_at: rowStarted, ...rowChild } = child;
    assert.deepEqual(contextChild, rowChild);
    assert.ok(Number.isFinite(new Date(contextStarted).getTime()));
    assert.equal(new Date(contextStarted).getTime(), new Date(rowStarted).getTime());
    for (const field of ['second_id', 'second_selection', 'second_answers', 'second_result', 'second_issued_at', 'second_submitted_at']) {
      assert.equal(child[field], null);
    }
  }
  return { ...h, submissionCommand, submission, workflow, submissionContext };
}
