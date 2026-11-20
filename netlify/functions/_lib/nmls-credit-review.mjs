import { NMLS_CREDIT_REVIEW, NMLS_CREDIT_CHECKPOINTS, nmlsCheckpointMode } from '../../../config/nmls/credit-review.mjs';

const fail = (message, statusCode) => { throw Object.assign(new Error(message), { statusCode }); };

// Own keys only: a role name such as "toString" must not resolve to an inherited property.
export const nmlsCreditReviewRole = role => typeof role === 'string' && Object.hasOwn(NMLS_CREDIT_REVIEW.roles, role) ? NMLS_CREDIT_REVIEW.roles[role] : null;

// Only an enrollment the owner provisioned with a reviewer role qualifies. An ordinary
// free-training enrollment in the same course never does.
export function isNmlsCreditReviewEnrollment(enrollment) {
  return enrollment?.course_id === NMLS_CREDIT_REVIEW.courseId && enrollment.enrollment_origin === 'training' &&
    nmlsCreditReviewRole(enrollment.review_role) !== null;
}

// Dashboard card for a reviewer: the submitted course name and the course route. The
// free-training summary's "no credit" wording is replaced by neutral course wording;
// nothing here states that credit, a certificate or a payment exists.
export function asCreditReviewCourse(enrollment) {
  if (!isNmlsCreditReviewEnrollment(enrollment)) return enrollment;
  const open = nmlsCreditReviewRole(enrollment.review_role) === 'open';
  const available = enrollment.nmls_training?.available === true;
  return { ...enrollment, course_name: NMLS_CREDIT_REVIEW.title, credit_review: { version: open ? 'open' : 'closed', applicationId: NMLS_CREDIT_REVIEW.applicationId },
    resume_path: available ? `${NMLS_CREDIT_REVIEW.route}?enrollment_id=${encodeURIComponent(enrollment.enrollment_id)}` : null,
    remaining_requirements: !available ? ['Course access and saved progress could not be verified.']
      : open ? ['Open review version: every lesson and module quiz can be browsed in any order.']
        : (enrollment.remaining_requirements || []).map(courseWording) };
}
const courseWording = text => ({
  'Start the first training lesson.': 'Start the first lesson.',
  'Complete the remaining lessons and practice checks.': 'Complete the remaining lessons and module quizzes.',
  'Complete the first practice assessment.': 'Complete the final examination.',
  'Complete the assigned targeted practice before a second assessment.': 'Complete the assigned review lessons before the second final examination.',
  'Complete the assigned targeted practice.': 'Complete the assigned review lessons.',
  'Complete the second practice assessment.': 'Complete the second final examination.',
  'Training practice passed. No NMLS CE credit or certificate is awarded.': 'Final examination passed.',
}[text] || text);

// Wraps the database call the training service makes first on every request. A caller
// whose enrollment is not a reviewer enrollment is refused there, before any further
// read or write, so the course route cannot be used to relabel ordinary free training.
export function reviewerOnlyRpc(callRpc) {
  return async (name, args) => {
    const result = await callRpc(name, args);
    if (name === 'nmls_training_context' && nmlsCreditReviewRole(result?.reviewRole) === null) fail('nmls_course_review_access_required', 403);
    return result;
  };
}

// Added to every course response. `mode` is "off" or "placeholder"; there is no live mode.
export function creditReviewPresentation(body, env = process.env) {
  if (!body || typeof body !== 'object' || body.error) return body;
  const role = nmlsCreditReviewRole(body.accessMode);
  if (role === null) fail('nmls_course_review_access_required', 403);
  return { ...body, creditReview: { applicationId: NMLS_CREDIT_REVIEW.applicationId, title: NMLS_CREDIT_REVIEW.title, version: role,
    checkpoints: { mode: nmlsCheckpointMode(env), connected: false, sequence: NMLS_CREDIT_CHECKPOINTS } } };
}
