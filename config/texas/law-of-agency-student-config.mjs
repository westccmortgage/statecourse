import { COURSE, MODULES } from "./law-of-agency-course.mjs";
import { deliveriesForCourse } from "../course-screen-index.mjs";

/**
 * Texas Law of Agency, in the shape the student path already understands.
 *
 * The student path was not really California-specific: SB 1495 participation already
 * self-conditions on the course id, and timing comes from the course record. What was
 * California-specific was the lookup — one hard-coded state check and one hard-coded
 * config function. This supplies the same fields from the Texas course record so the
 * lookup has something to find.
 *
 * What it deliberately does not do is inherit California's regulatory posture. Texas
 * carries its own, and its own says: not approved, no credit reporting, no certificate,
 * and a final examination that exists but may not be administered. Those flags come
 * straight from the frozen course record rather than being restated here, so this file
 * cannot quietly grant something the course record refuses.
 */

const CONTENT_ROOT = "/content/texas/tx-law-of-agency-30-v1";

/*
 * A Texas module is an assignment. The field names match California's because the student
 * path reads them by name; the values are Texas's own — prescribedMinutes is the time TREC's
 * form allocates to that topic, not a figure invented to fill the field.
 */
const ASSIGNMENTS = Object.freeze(MODULES.map((module, index) => Object.freeze({
  id: module.module,
  sequence: index + 1,
  title: module.topic,
  expectedMinutes: module.prescribedMinutes,
  sectionCount: module.units,
  contentPath: `${CONTENT_ROOT}/${module.file}`,
  topicCode: module.topicCode,
  scopeNote: module.scopeNote,
})));

const TOTAL_MINUTES = ASSIGNMENTS.reduce((total, item) => total + item.expectedMinutes, 0);

export const TEXAS_LAW_OF_AGENCY_STUDENT_CONFIG = Object.freeze({
  courseId: COURSE.courseId,
  title: COURSE.title,
  version: COURSE.contentFreeze,
  state: "TX",
  regulator: "Texas Real Estate Commission",
  requiredHours: COURSE.hours,
  assignmentCount: ASSIGNMENTS.length,
  /* Averaged for display only. Gating uses each assignment's own expectedMinutes. */
  expectedMinutesPerAssignment: Math.round(TOTAL_MINUTES / ASSIGNMENTS.length),
  /* TREC prescribes 30 clock hours. The elapsed-time floor is the course's own total, not
     California's rule applied to a Texas course. */
  minimumElapsedHours: COURSE.hours,
  assignments: ASSIGNMENTS,

  /* Straight from the frozen record. Nothing here may be true unless it is true there. */
  approvalStatus: COURSE.trecApprovalStatus,
  enrollmentEnabled: COURSE.enrollmentEnabled,
  creditReportingEnabled: COURSE.creditReportingEnabled,
  certificateIssuanceEnabled: COURSE.certificateIssuanceEnabled,
  finalExaminationAdministrable: COURSE.finalExaminationAdministrable,
  /* Delivery units the block player can serve, for callers that need to enumerate them
     without reaching into the screen index. */
  deliveryUnits: Object.freeze(deliveriesForCourse(COURSE.courseId).map((unit) => unit.deliveryId)),
});

export default TEXAS_LAW_OF_AGENCY_STUDENT_CONFIG;
