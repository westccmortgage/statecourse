/* Derivation of the two regulatory lines shown in the "Jurisdiction record" panel on
   every state page: the course approval line and the enrollment line.

   These lines used to be hardcoded to "Not yet approved" and "Closed until approval".
   That was accidentally correct only because nothing is approved yet — the page read
   neither the approval record nor the enrollment flag. Two things were wrong with it:
   an approval, once recorded, would never have surfaced, so California DRE Regulation
   §3004(b) (advertising for an approved course must carry the Department's course
   approval number) had no surface to appear on; and the reassuring "Closed until
   approval" was a claim about state the page never checked.

   Both lines are derived here instead, in one place, so the generator cannot drift
   from the catalog and so the safety coupling below is testable on its own.

   The coupling: enrollment is reported open only for a course carrying BOTH a
   non-empty approval number AND enrollment_enabled === true. Either alone leaves it
   closed. A flag flipped ahead of an approval therefore cannot make a public page
   advertise an open enrollment, which is the direction of the mistake that matters. */

const approvalNumberOf = (course) => {
  const value = course?.approval_number;
  return typeof value === "string" && value.trim() ? value.trim() : null;
};

export function deriveJurisdictionRecord(stateCourses = []) {
  const courses = Array.isArray(stateCourses) ? stateCourses : [];
  const approvedCourses = courses
    .map((course) => ({ course, approvalNumber: approvalNumberOf(course) }))
    .filter((entry) => entry.approvalNumber)
    .map((entry) => ({
      courseTitle: String(entry.course.course_title ?? ""),
      approvalNumber: entry.approvalNumber,
      enrollmentEnabled: entry.course.enrollment_enabled === true,
    }));
  const enrollmentOpen = approvedCourses.some((entry) => entry.enrollmentEnabled);
  return {
    hasCourseRecord: courses.length > 0,
    approvalState: !courses.length ? "no-course-record" : approvedCourses.length ? "approved" : "not-yet-approved",
    approvedCourses,
    enrollmentOpen,
    enrollmentLine: enrollmentOpen ? "Open for approved courses" : "Closed until approval",
  };
}

export const JURISDICTION_APPROVAL_LABELS = Object.freeze({
  "no-course-record": "No course record",
  "not-yet-approved": "Not yet approved",
});
