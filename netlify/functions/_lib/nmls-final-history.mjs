import { randomUUID } from 'node:crypto';
import { drawNmlsDraftFinal, gradeNmlsDraftFinal, makeNmlsFinalRemediationCourse, requireNmlsFinalReviewCompletion } from '../../../lib/nmls-final-assessment.mjs';
import { getNmlsDraftFinalDefinition } from '../../../lib/nmls-final-authoring-content.mjs';
import { getNmlsReviewCourse } from './nmls-review-content.mjs';
import { digestNmlsCommand } from './nmls-review-service.mjs';

// INTERNAL ONLY; intentionally absent from HTTP routes and build included_files.
// No selected stems/options are returned. Not a final delivery/session protocol.
// The authenticated actor and dependencies must be supplied by trusted server
// code, never from browser JSON. SQL rejects policy-bound review attempts.
const fail = code => { throw new Error(`nmls_final_${code}`); };
const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
const plain = value => value && Object.getPrototypeOf(value) === Object.prototype;

export function validateNmlsFinalHistoryInput(input) {
  if (!plain(input) || !['issue','submit'].includes(input.kind) || !uuid(input.reviewAttemptId) || !uuid(input.eventId)
    || !Number.isSafeInteger(input.expectedReviewRevision) || input.expectedReviewRevision < 0
    || !Number.isSafeInteger(input.expectedFinalRevision) || input.expectedFinalRevision < 0) fail('invalid_request');
  const allowed = ['kind','reviewAttemptId','eventId','expectedReviewRevision','expectedFinalRevision'];
  if (input.kind === 'submit') {
    allowed.push('finalAttemptId','answers');
    if (!uuid(input.finalAttemptId) || !plain(input.answers) || Object.keys(input.answers).length !== 25
      || Object.keys(input.answers).some(id => !/^N26-FIN-[FENG]\d{2}$/.test(id))
      || Object.values(input.answers).some(value => !['A','B','C','D'].includes(value))) fail('invalid_answers');
  }
  if (Object.keys(input).some(key => !allowed.includes(key))) fail('invalid_request');
  return input;
}

export async function transactNmlsFinalHistory(input, studentId, {
  rpc, courseFor = getNmlsReviewCourse, definitionFor = getNmlsDraftFinalDefinition,
  draw = drawNmlsDraftFinal, grade = gradeNmlsDraftFinal, clockRetries = 1,
}) {
  validateNmlsFinalHistoryInput(input);
  if (!uuid(studentId)) fail('invalid_authenticated_actor');
  const context = await rpc('nmls_private_final_context', {
    p_student_id: studentId, p_review_attempt_id: input.reviewAttemptId, p_event_id: input.eventId,
  });
  const review = context?.attempt, row = context?.final;
  if (review?.id !== input.reviewAttemptId || review?.student_id !== studentId) fail('access_denied');
  const course = courseFor(review.course_key), definition = definitionFor(review.course_key);
  if (course.id !== review.course_key || course.digest !== review.content_digest || definition.courseKey !== course.id
    || definition.contentDigest !== course.digest || definition.sourcePayloadDigest !== digestNmlsCommand(course)) fail('content_changed');
  if (row && (row.review_attempt_id !== review.id || row.student_id !== studentId || row.course_key !== course.id
    || row.content_digest !== course.digest || row.definition_digest !== definition.digest)) fail('history_scope_conflict');
  const now = Number(context.serverTimeMs);
  if (!Number.isSafeInteger(now) || now < 0) fail('invalid_server_time');
  let selection = null, answers = null, result = null, manifest = null;
  let finalId = row?.id ?? null;
  // Exact event retries and stale CAS are resolved under SQL locks. Do not draw
  // again or call grading even once when the prior submission is already saved.
  const current = !context.event && review.revision === input.expectedReviewRevision
    && (row?.revision ?? 0) === input.expectedFinalRevision;
  if (current) {
    requireNmlsFinalReviewCompletion(definition, review.runtime);
    if (input.kind === 'issue') {
      if (row) fail('already_issued');
      finalId = randomUUID();
      selection = draw(definition, { id: finalId, reviewAttemptId: review.id, reviewState: review.runtime });
    } else {
      if (!row || row.id !== input.finalAttemptId) fail('attempt_scope');
      if (row.revision !== 1 || row.submitted_at !== null || row.result !== null) fail('already_submitted');
      answers = structuredClone(input.answers);
      result = grade(definition, row.selection, answers);
      if (!result.passed) {
        const remediation = makeNmlsFinalRemediationCourse(definition, course, row.selection, answers);
        manifest = { courseKey: remediation.id, contentDigest: remediation.digest,
          sourceCourseKey: course.id, sourceContentDigest: course.digest, definitionDigest: definition.digest,
          finalAttemptId: row.id, reviewAttemptId: review.id,
          moduleIds: remediation.modules.map(module => module.id),
          unitIds: remediation.modules.flatMap(module => module.units.map(unit => unit.id)), completed: false, retakeEnabled: false };
      }
    }
  }
  try {
    // No grade, selection, remediation or provisional outcome is returned before
    // this transaction succeeds. A CAS loser receives no aggregate-score oracle.
    return await rpc('nmls_private_final_commit', {
      p_student_id: studentId, p_review_attempt_id: review.id, p_event_id: input.eventId,
      p_command_digest: digestNmlsCommand(input), p_kind: input.kind,
      p_expected_review_revision: input.expectedReviewRevision, p_expected_final_revision: input.expectedFinalRevision,
      p_evaluated_at_ms: now, p_content_digest: course.digest, p_definition_digest: definition.digest,
      p_final_id: input.kind === 'submit' ? input.finalAttemptId : finalId,
      p_selection: selection, p_answers: answers, p_result: result, p_remediation_manifest: manifest,
    });
  } catch (error) {
    if (clockRetries > 0 && String(error?.message).includes('nmls_final_clock_refresh_required')) {
      return transactNmlsFinalHistory(input, studentId, { rpc, courseFor, definitionFor, draw, grade, clockRetries: clockRetries - 1 });
    }
    throw error;
  }
}
