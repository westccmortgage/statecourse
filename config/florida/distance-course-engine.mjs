/** Florida-specific distance-delivery controls. Nothing here enables enrolment or publication. */
import { COURSE_STATUS, SECTION_PLANS, TOTALS } from "./course-i-curriculum.mjs";

export const IDENTITY_STAGES = Object.freeze([
  Object.freeze({ stage: "enrolment", evidence: ["government-ID review result", "name/date-of-birth match", "timestamp", "reviewer/system decision"] }),
  Object.freeze({ stage: "participation", evidence: ["step-up verification challenge", "session/device record", "timestamp", "challenge result"] }),
  Object.freeze({ stage: "completion", evidence: ["final identity re-verification", "certification statement", "timestamp", "completion decision"] }),
]);

export const EVENT_TYPES = Object.freeze([
  "identity.enrolment", "identity.participation", "identity.completion", "section.opened",
  "reading.completed", "source.activity.submitted", "application.submitted", "assessment.attempted",
  "remediation.assigned", "remediation.completed", "section.completed", "final.unlocked",
  "final.started", "final.submitted", "certificate.issued",
]);

export const PROGRESSION = Object.freeze({
  sectionOrder: Object.freeze(SECTION_PLANS.map((s) => s.number)),
  sequential: true,
  elapsedTimeAloneCompletesNothing: true,
  requiredForSectionCompletion: Object.freeze(["assigned reading", "primary-source activity", "application lab", "periodic assessment", "remediation if assigned"]),
  finalUnlock: Object.freeze({ everySectionCompleted: true, unresolvedRemediation: 0, identityParticipationVerified: true, prescribedCertificationSubmitted: true }),
  finalAids: Object.freeze({ hint: false, back: false, retry: false }),
  finalMinutes: 150,
  finalEnabled: false,
  finalDisabledReason: "secure forms and page-referenced keys are not yet regulator-ready; no school/course approval is held",
});

export const CONTINUITY_PLAN = Object.freeze({
  primaryFailureDetectionMinutes: 5,
  learnerStatusPage: true,
  redundantReadOnlyCourseCopy: true,
  queuedSubmissionPreservation: true,
  instructorSupportFallback: Object.freeze(["telephone", "email"]),
  restorationEvidence: Object.freeze(["incident start/end", "affected sessions", "lost-work check", "learner notifications", "remedy"]),
  noCreditForUnavailableTime: true,
});

export const RECORDS = Object.freeze({
  schoolRecordYears: 3,
  completionCertificateYears: 5,
  preserveFirstAttempt: true,
  appendOnlyAuditEvents: true,
  exports: Object.freeze(["registration", "roster", "attendance/participation", "progress assessments", "exam form identifier", "answer record", "completion certificate"]),
});

export function releaseFailures() {
  const failures = [];
  if (!COURSE_STATUS.schoolPermitHeld) failures.push("Florida school permit not held");
  if (!COURSE_STATUS.instructorPermitHeld) failures.push("Florida instructor permit not held");
  if (!COURSE_STATUS.regulatorApproved) failures.push("FREC course approval not held");
  if (!COURSE_STATUS.enrolmentEnabled) failures.push("Florida enrolment deliberately disabled");
  if (!PROGRESSION.finalEnabled) failures.push(PROGRESSION.finalDisabledReason);
  return Object.freeze(failures);
}

export default Object.freeze({ IDENTITY_STAGES, EVENT_TYPES, PROGRESSION, CONTINUITY_PLAN, RECORDS, TOTALS, releaseFailures });
