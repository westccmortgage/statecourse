import { randomUUID } from 'node:crypto';
import { drawNmlsDraftFinal, gradeNmlsDraftFinal, makeNmlsFinalRemediationCourse,
  requireNmlsFinalReviewCompletion } from '../../../lib/nmls-final-assessment.mjs';
import { startNmlsCourseReview, reduceNmlsReview } from '../../../lib/nmls-review-runtime.mjs';
import { getNmlsDraftFinalDefinition } from '../../../lib/nmls-final-authoring-content.mjs';
import { getNmlsReviewCourse } from './nmls-review-content.mjs';
import { digestNmlsCommand, validateNmlsReviewInput } from './nmls-review-service.mjs';

// PRIVATE authoring workflow, deliberately not imported by an HTTP endpoint.
// Its child-session fence is NOT an actor-wide teaching permit. SQL rejects all
// policy-bound grants until phase-aware observed delivery is integrated.
const fail = code => { throw new Error(`nmls_remediation_${code}`); };
const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
const plain = value => Boolean(value && Object.getPrototypeOf(value) === Object.prototype);
const same = (a, b) => digestNmlsCommand(a) === digestNmlsCommand(b);
const kinds = ['start_remediation', 'remediation_event', 'issue_second', 'submit_second'];
const actionKinds = ['resume','logout','open_unit','heartbeat','interaction','unit_action','complete_unit','quiz_start','quiz_submit'];

export function validateNmlsRemediationInput(input) {
  if (!plain(input) || !kinds.includes(input.kind) || !uuid(input.reviewAttemptId) || !uuid(input.firstFinalId)
    || !uuid(input.eventId) || !Number.isSafeInteger(input.expectedReviewRevision) || input.expectedReviewRevision < 0
    || !Number.isSafeInteger(input.expectedWorkflowRevision) || input.expectedWorkflowRevision < 0) fail('invalid_request');
  const allowed = ['kind','reviewAttemptId','firstFinalId','eventId','expectedReviewRevision','expectedWorkflowRevision'];
  if (input.kind === 'remediation_event') {
    allowed.push('action');
    if (!plain(input.action) || !actionKinds.includes(input.action.kind)
      || ['attemptId','eventId','expectedRevision'].some(key => Object.hasOwn(input.action,key))) fail('invalid_action');
    validateNmlsReviewInput({ ...input.action, attemptId: input.firstFinalId, eventId: input.eventId, expectedRevision: 0 });
  }
  if (input.kind === 'submit_second') {
    allowed.push('secondFinalId','answers');
    if (!uuid(input.secondFinalId) || !plain(input.answers) || Object.keys(input.answers).length !== 25
      || Object.keys(input.answers).some(id => !/^N26-FIN-[FENG]\d{2}$/.test(id))
      || Object.values(input.answers).some(value => !['A','B','C','D'].includes(value))) fail('invalid_answers');
  }
  if (Object.keys(input).some(key => !allowed.includes(key))) fail('invalid_request');
  return input;
}

function reconstruct(definition, course, first) {
  if (first.revision !== 2 || first.selection?.number !== 1 || first.submitted_at === null) fail('first_not_sealed');
  const result = gradeNmlsDraftFinal(definition, first.selection, first.answers);
  if (!same(result, first.result)) fail('first_result_changed');
  if (result.passed) fail('already_passed');
  const remediation = makeNmlsFinalRemediationCourse(definition, course, first.selection, first.answers);
  const manifest = { courseKey: remediation.id, contentDigest: remediation.digest,
    sourceCourseKey: course.id, sourceContentDigest: course.digest, definitionDigest: definition.digest,
    finalAttemptId: first.id, reviewAttemptId: first.review_attempt_id,
    moduleIds: remediation.modules.map(module => module.id),
    unitIds: remediation.modules.flatMap(module => module.units.map(unit => unit.id)), completed: false, retakeEnabled: false };
  if (!same(manifest, first.remediation_manifest)) fail('manifest_changed');
  return { remediation, manifest };
}

function completed(runtime, remediation) {
  const sorted = values => [...values].sort();
  if (runtime?.courseKey !== remediation.id || runtime.contentDigest !== remediation.digest
    || runtime.status !== 'review_complete' || runtime.mode !== 'non_credit_review' || runtime.creditIssuanceAllowed !== false
    || runtime.current || runtime.quiz || runtime.bookmark || runtime.quizReservation
    || !Array.isArray(runtime.completedUnitIds) || !Array.isArray(runtime.passedModuleIds)
    || !same(sorted(runtime.completedUnitIds), sorted(remediation.modules.flatMap(module => module.units.map(unit => unit.id))))
    || !same(sorted(runtime.passedModuleIds), sorted(remediation.modules.map(module => module.id)))) fail('incomplete');
}

export async function transactNmlsFinalRemediation(input, studentId, {
  rpc, courseFor = getNmlsReviewCourse, definitionFor = getNmlsDraftFinalDefinition,
  reduce = reduceNmlsReview, draw = drawNmlsDraftFinal, grade = gradeNmlsDraftFinal, clockRetries = 1,
}) {
  validateNmlsRemediationInput(input);
  if (!uuid(studentId)) fail('invalid_authenticated_actor');
  const context = await rpc('nmls_private_remediation_context', { p_student_id: studentId,
    p_review_attempt_id: input.reviewAttemptId, p_first_final_id: input.firstFinalId, p_event_id: input.eventId });
  const review = context?.attempt, first = context?.final, workflow = context?.workflow;
  if (review?.id !== input.reviewAttemptId || review.student_id !== studentId || first?.id !== input.firstFinalId
    || first.review_attempt_id !== review.id || first.student_id !== studentId) fail('access_denied');
  const course = courseFor(review.course_key), definition = definitionFor(review.course_key);
  if (course.id !== review.course_key || course.digest !== review.content_digest || definition.courseKey !== course.id
    || definition.contentDigest !== course.digest || definition.sourcePayloadDigest !== digestNmlsCommand(course)
    || first.course_key !== course.id || first.content_digest !== course.digest || first.definition_digest !== definition.digest) fail('content_changed');
  const { remediation, manifest } = reconstruct(definition, course, first);
  if (workflow && (workflow.first_final_id !== first.id || workflow.student_id !== studentId
    || workflow.review_attempt_id !== review.id || !same(workflow.manifest, manifest)
    || workflow.definition_digest !== definition.digest)) fail('workflow_scope');
  const now = Number(context.serverTimeMs);
  if (!Number.isSafeInteger(now) || now < 0) fail('invalid_server_time');
  let runtime = null, audit = null, reviewOutcome = null, selection = null, answers = null, result = null, secondId = null;
  // Advisory context may straddle a concurrent commit. Replay/CAS adjudication
  // belongs to SQL; no reduction/draw/second grading on stale or saved intent.
  if (!context.event && !context.finalEvent && review.revision === input.expectedReviewRevision
    && (workflow?.revision ?? 0) === input.expectedWorkflowRevision) {
    requireNmlsFinalReviewCompletion(definition, review.runtime);
    if (input.kind === 'start_remediation') {
      if (workflow) fail('already_started');
      runtime = startNmlsCourseReview(remediation);
    } else {
      if (!workflow) fail('not_started');
      if (input.kind === 'remediation_event') {
        if (workflow.status !== 'remediating') fail('phase_closed');
        const command = { ...input.action, attemptId: first.id, eventId: input.eventId, expectedRevision: workflow.runtime.revision };
        const reduced = reduce(workflow.runtime, command, remediation, now, {
          // Reservation only: never asserts observer readiness, a clean saved
          // interruption, or permission to restore partial instructional time.
          continuity: { scope: { actorId: studentId, attemptId: first.id, offeringId: review.grant_id,
            courseKey: remediation.id, contentDigest: remediation.digest }, saveAllowed: false, restoreAllowed: false },
        });
        runtime = reduced.state; audit = reduced.audit;
        reviewOutcome = { ok: reduced.outcome.ok, code: reduced.outcome.code, status: reduced.outcome.status };
      } else {
        completed(workflow.runtime, remediation);
        if (input.kind === 'issue_second') {
          if (workflow.status !== 'remediating' || workflow.second_id !== null) fail('already_issued');
          secondId = randomUUID();
          selection = draw(definition, { id: secondId, reviewAttemptId: review.id, reviewState: review.runtime,
            previous: { attempt: first.selection, answers: first.answers, remediationState: workflow.runtime } }, { course });
        } else {
          if (workflow.status !== 'second_issued' || workflow.second_id !== input.secondFinalId) fail('second_unavailable');
          answers = structuredClone(input.answers);
          result = grade(definition, workflow.second_selection, answers);
        }
      }
    }
  }
  try {
    return await rpc('nmls_private_remediation_commit', { p_student_id: studentId, p_review_attempt_id: review.id,
      p_first_final_id: first.id, p_event_id: input.eventId, p_command_digest: digestNmlsCommand(input), p_kind: input.kind,
      p_expected_review_revision: input.expectedReviewRevision, p_expected_workflow_revision: input.expectedWorkflowRevision,
      p_evaluated_at_ms: now, p_definition_digest: definition.digest, p_manifest: manifest,
      p_action_kind: input.action?.kind ?? null, p_expected_session_id: input.action?.sessionId ?? null,
      p_runtime: runtime, p_audit: audit, p_review_outcome: reviewOutcome,
      p_second_id: input.kind === 'submit_second' ? input.secondFinalId : secondId,
      p_selection: selection, p_answers: answers, p_result: result });
  } catch (error) {
    if (clockRetries > 0 && String(error?.message).includes('nmls_remediation_clock_refresh_required')) {
      return transactNmlsFinalRemediation(input, studentId, { rpc, courseFor, definitionFor, reduce, draw, grade, clockRetries: clockRetries - 1 });
    }
    throw error;
  }
}
