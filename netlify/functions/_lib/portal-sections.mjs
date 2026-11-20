import { isNmlsCreditReviewEnrollment } from './nmls-credit-review.mjs';

// Which part of the student portal an enrollment belongs to.
//
// Free training (enrollment_origin "training") is practice without licensing credit and
// lives in its own section. Everything else — purchases, review access to a credit
// course, and the NMLS reviewer accounts' credit version — belongs to My StateCourse.
// Nothing is filtered out: every enrollment lands in exactly one section, so moving
// free training never hides or resets an existing enrollment or its progress.
export function portalSection(enrollment) {
  if (isNmlsCreditReviewEnrollment(enrollment)) return 'main';
  return enrollment?.enrollment_origin === 'training' ? 'free-training' : 'main';
}

export function splitPortalEnrollments(enrollments = []) {
  const main = [], freeTraining = [];
  for (const enrollment of enrollments) (portalSection(enrollment) === 'main' ? main : freeTraining).push(enrollment);
  return { main, freeTraining };
}
