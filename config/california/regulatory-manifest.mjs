/*
 * The California regulatory manifest.
 *
 * One place where every regulated fact about the California filing lives: the legal
 * authorities and when each was last verified, the exact revision and content hash of every
 * Department form held, the school's legal identity, the course names and hours, the delivery
 * method, the academic timing limits, the instructor identity, the prices, the refund policy
 * version, and the BPPE exemption basis.
 *
 * WHY IT EXISTS
 *
 * Two defects in this project were the same defect. The BPPE exemption cited a code section
 * that the Bureau's own evidentiary rule made unprovable, and an RE 306 instruction carried a
 * contact title — "Managing Member" — that no source anywhere states. Neither was caught by
 * reading the document. Both would have been caught by a rule that a regulated fact must have
 * exactly one home and a source behind it.
 *
 * So: RE 306, RE 313, RE 336, the course catalog, the website and the tests all read from
 * here. They cannot drift apart, because there is nothing to drift from.
 *
 * WHAT MAY GO IN
 *
 * A fact with a source. Every legal authority carries the text it stands for and the date it
 * was last read. Every form carries its printed revision and the SHA-256 of the file held, so
 * a Department revision that changes the form is detectable rather than assumed away.
 *
 * WHAT MAY NOT
 *
 * Anything asserting approval. No sponsor id, no course approval number, no "approved
 * provider", no "approved instructor". Those are the Department's to assign, and until it
 * does, this project's public and filed material says only that approval is being sought.
 *
 * VERIFICATION
 *
 * `verifiedAsOf` on an authority is the date its text was last read from the publisher. It is
 * not the date someone remembered reading it. scripts/regulatory-source-lock.mjs re-checks the
 * authorities and the form hashes and fails when one has gone stale, moved, or changed.
 */

import { COURSE_DESIGN, COURSES, FINAL_EXAM, INSTRUCTOR, PRICING, PROVIDER } from "./submission-facts.mjs";

/* How long a reading stays good before the source lock demands it be taken again. Ninety days
   is short enough that a mid-year form revision or a statutory amendment is caught before a
   filing goes out, and long enough that the check is not noise. */
export const VERIFICATION_MAX_AGE_DAYS = 90;

/*
 * The legal authorities this filing rests on.
 *
 * `states` is what the authority actually says, in a sentence, so a reader can tell at a
 * glance whether a claim made elsewhere is stronger than its source. That comparison is what
 * the source lock performs.
 */
export const AUTHORITIES = Object.freeze([
  Object.freeze({
    id: "ccr-3000",
    citation: "10 CCR § 3000 (Commissioner's Regulations, Article 24)",
    obtainedVia: "RE 307, Regulation Excerpts (Private Vocational Schools), Rev. 7/18",
    url: "https://www.dre.ca.gov/files/pdf/forms/re307.pdf",
    verifiedAsOf: "2026-08-21",
    states:
      "An attended course must provide at least 45 periods of classroom instruction of not less than 50 minutes each; a correspondence course shall consist of not less than 15 separate lesson assignments. A correspondence course's final examination is administered and supervised by a person the school designates, the school sends the materials to that person, and that person returns the completed examination. The school maintains records sufficient to produce a duplicate certificate, uses no deceptive advertising, and delivers the completion document within 15 days.",
  }),
  Object.freeze({
    id: "ccr-3002",
    citation: "10 CCR § 3002 (application, fee, and material change)",
    obtainedVia: "RE 307, Rev. 7/18",
    url: "https://www.dre.ca.gov/files/pdf/forms/re307.pdf",
    verifiedAsOf: "2026-08-21",
    states:
      "The application carries the course type, title, a complete outline or syllabus with a time schedule, the textbooks and student materials, and evidence of private vocational school approval or registration if the sponsor is not otherwise exempt. Any material change to an approved course must be submitted for approval prior to use.",
  }),
  Object.freeze({
    id: "re303-timing",
    citation: "RE 303, Statutory/Pre-License Course Approval packet, pages 3-4",
    obtainedVia: "california/dre-sources/RE303.pdf",
    url: "https://www.dre.ca.gov/files/pdf/forms/re303.pdf",
    verifiedAsOf: "2026-08-21",
    states:
      "A school may not offer a single correspondence course to be completed in less than two and a half weeks, and no more than two courses may be completed in a five-week period, measured from the date the student receives access to the material to the date the final examination is passed, regardless of how many schools the student attends. All courses require completion within one year of registration. The final examination is not less than 100 multiple choice or fill-in questions with a passing score of 60 percent or greater, one retake on different questions is permitted, and the examination is never furnished directly to the student.",
  }),
  Object.freeze({
    id: "edc-94874f",
    citation: "California Education Code § 94874(f)",
    obtainedVia: "leginfo.legislature.ca.gov",
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=94874.&lawCode=EDC",
    verifiedAsOf: "2026-08-21",
    states:
      "An institution that does not award degrees and that solely provides educational programs for total charges of two thousand five hundred dollars or less is exempt from the Private Postsecondary Education Act, when no part of the total charges is paid from state or federal student financial aid programs.",
  }),
  Object.freeze({
    id: "bppe-71395",
    citation: "5 CCR § 71395 (Application; Fees), effective 1 July 2026",
    obtainedVia: "bppe.ca.gov published regulations",
    url: "https://bppe.ca.gov/lawsregs/regs.pdf",
    verifiedAsOf: "2026-08-21",
    states:
      "An institution claiming an exemption under Education Code § 94874(d)(2) must supply a letter from the approving entity indicating the validity of that approval. An institution claiming § 94874(f) must supply the total institutional charges for the educational program and whether it is approved to offer federal financial assistance.",
  }),
  Object.freeze({
    id: "bppe-70000d",
    citation: "5 CCR § 70000(d) (Cancellation Period), effective 1 July 2026",
    obtainedVia: "bppe.ca.gov published regulations",
    url: "https://bppe.ca.gov/lawsregs/regs.pdf",
    verifiedAsOf: "2026-08-21",
    states:
      "Cancellation Period means the period from the signing of the enrollment agreement either through the student's attendance at the first class session, or the seventh business day after enrollment, whichever is later.",
  }),
  Object.freeze({
    id: "gov-6700",
    citation: "California Government Code §§ 6700 and 6701",
    obtainedVia: "leginfo.legislature.ca.gov",
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=6700.&lawCode=GOV",
    verifiedAsOf: "2026-08-21",
    states:
      "Section 6700 lists the holidays in this state. Section 6701 provides that where certain of them fall on a Sunday the following Monday is a holiday, and that where November 11 falls on a Saturday the preceding Friday is a holiday.",
  }),
  Object.freeze({
    id: "handbook-sb1495",
    citation: "DRE Course Provider Handbook, Rev. 01/2026 — SB 1495 course content",
    obtainedVia: "california/dre-sources/Course_Provider_Handbook.pdf",
    url: "https://www.dre.ca.gov/files/pdf/faqs/Course%20Provider%20Handbook.pdf",
    verifiedAsOf: "2026-08-21",
    states:
      "Effective January 1, 2024, all real estate practice courses must contain a component on implicit bias and a component on federal and state fair housing laws that includes an interactive participatory component during which the applicant role plays as both a consumer and a real estate professional.",
  }),
]);

/*
 * Every Department form held, with the revision printed on its face and the SHA-256 of the
 * file. The hash is the point: a form the Department has revised is a different document, and
 * filing on a superseded revision is a deficiency that reads as carelessness. Comparing the
 * printed revision alone would miss a re-issue that kept the revision string.
 */
export const DRE_FORMS = Object.freeze([
  Object.freeze({ id: "RE303", title: "Statutory/Pre-License Course Approval packet", revision: "Rev. 1/26", file: "california/dre-sources/RE303.pdf", sha256Prefix: "c2f38d72fafc3067" }),
  Object.freeze({ id: "RE306", title: "Statutory/Pre-License Course Approval Application", revision: "Rev. 1/26", file: "california/dre-sources/RE306.pdf", sha256Prefix: "7c44a760e5f567b4" }),
  Object.freeze({ id: "RE307", title: "Regulation Excerpts (Private Vocational Schools)", revision: "Rev. 7/18", file: "california/dre-sources/RE307.pdf", sha256Prefix: "76d888137adb3f37" }),
  Object.freeze({ id: "RE311", title: "Statutory/Pre-License Course Completion Certificate", revision: "Rev 1/26", file: "california/dre-sources/RE311.pdf", sha256Prefix: "457b312a89de3851" }),
  Object.freeze({ id: "RE313", title: "Statutory/Pre-License General Information Page", revision: "Rev 1/26", file: "california/dre-sources/re313.doc", sha256Prefix: "d0633fc86e3d0e55" }),
  Object.freeze({ id: "RE336", title: "Statutory/Pre-License Instructor Certification", revision: "Rev. 2/23", file: "california/dre-sources/RE336.pdf", sha256Prefix: "d21a7eccee34308c" }),
  Object.freeze({ id: "RE304", title: "Consent to Service of Process", revision: "Rev. 7/18", file: "california/dre-sources/re304.pdf", sha256Prefix: "78c279fa93812da7" }),
  Object.freeze({ id: "RE318A", title: "Course & Instructor Evaluation", revision: "Rev. 1/26", file: "california/dre-sources/re318a.pdf", sha256Prefix: "8ae4b7a3c77cf91b" }),
  Object.freeze({ id: "RE206E", title: "Fee schedule", revision: "Rev. 7/26", file: "california/dre-sources/RE206E.pdf", sha256Prefix: "b32869686f1adc93" }),
  Object.freeze({ id: "RE909", title: "Credit Card Payment", revision: "Rev. 5/25", file: "california/dre-sources/re909.pdf", sha256Prefix: "ba4625050902e497" }),
  Object.freeze({ id: "HANDBOOK", title: "Course Provider Handbook", revision: "Rev. 01/2026", file: "california/dre-sources/Course_Provider_Handbook.pdf", sha256Prefix: "a35e47fef70028ff" }),
]);

/*
 * Academic controls, as numbers rather than prose.
 *
 * These are the limits RE 303 and Regulation 3000 fix, and they are enforced by the platform
 * rather than described by it. A course a student could finish in a weekend would not be the
 * course that was approved, whatever the outline said.
 */
export const ACADEMIC_CONTROLS = Object.freeze({
  minimumHoursPerCourse: 45,
  minimumLessonAssignments: 15,
  minutesPerClassroomPeriod: 50,
  /* Two and a half weeks, as hours, measured from access to a passed final examination. */
  minimumElapsedHoursPerCourse: 420,
  minimumElapsedDescription:
    "two and a half weeks from the date the student receives access to the course material to the date the final examination is successfully passed",
  /* No more than two courses completed in any five-week window, across all schools. */
  maximumCoursesPerWindow: 2,
  windowDays: 35,
  crossSchoolRule: true,
  maximumCompletionDays: 365,
  finalExamMinimumQuestions: 100,
  finalExamPassingPercent: 60,
  finalExamMaximumAttempts: 2,
  finalExamRetakeMustDiffer: true,
  finalExamNeverFurnishedToStudent: true,
  certificateDeliveryDays: 15,
  thirdPartyRecordedMaterialCapPercent: null,
  authorities: Object.freeze(["ccr-3000", "re303-timing"]),
});

/*
 * Figures that are StateCourse LLC's own rather than the Department's. Named here so that no
 * document can present one as a regulatory requirement, and so that a reader can see the whole
 * list in one place.
 */
export const PROVIDER_DECISIONS = Object.freeze({
  finalExamMinutes: FINAL_EXAM.minutes,
  finalExamMinutesBasis:
    "No document read states any time limit for the final examination. This is a StateCourse LLC decision.",
  businessDayConvention:
    "Monday through Friday excluding Government Code § 6700 holidays with § 6701 observance rules. 5 CCR §§ 70000-76245 use 'business day' throughout and define it nowhere; the convention is StateCourse LLC's own.",
  inCourseAssessmentThresholds: "100 percent on the applied item, 80 percent on engagement and remediation items.",
});

export const BPPE_EXEMPTION = Object.freeze({
  basis: "California Education Code § 94874(f)",
  authorityId: "edc-94874f",
  evidenceRule: "bppe-71395",
  highestProgramChargeUsd: PRICING.completePath.usd,
  thresholdUsd: 2500,
  awardsDegrees: false,
  acceptsFinancialAid: false,
  withdrawnBasis: "California Education Code § 94874(d)(2)(A)",
  withdrawnReason:
    "These are statutory qualifying education courses required before an applicant may sit the examination, not licence examination preparation; and 5 CCR § 71395(b)(7) requires a letter from the approving agency, which is the approval this application is seeking.",
});

export const SCHOOL = Object.freeze({
  legalName: PROVIDER.legalName,
  entityType: PROVIDER.entityType,
  secretaryOfStateFileNumber: PROVIDER.secretaryOfStateFileNumber,
  secretaryOfStateFiledOn: PROVIDER.secretaryOfStateFiledOn,
  fictitiousBusinessName: null,
  contactName: INSTRUCTOR.name,
  contactTitle: INSTRUCTOR.contactTitle,
  instructorLicense: INSTRUCTOR.dreBrokerLicense,
  /* The only statement of status that is true until DRE says otherwise. */
  approvalStatus: "Approval sought. No course, provider or instructor approval has been issued.",
  sponsorId: null,
});

export const PROGRAMS = Object.freeze(
  Object.entries(COURSES).map(([courseId, course]) =>
    Object.freeze({
      courseId,
      title: course.title,
      hours: COURSE_DESIGN.hours,
      lessonAssignments: COURSE_DESIGN.lessonAssignments,
      deliveryMethod: COURSE_DESIGN.methodOfPresentation,
      priceUsd: PRICING.singleCourse.usd,
      approvalNumber: null,
      sb1495: /practice/i.test(course.title),
    }),
  ),
);

/*
 * Claims a generated document may never make, whatever the context.
 *
 * These are not style preferences. Each would be a false statement to a consumer and, under
 * Regulation 3000(a)(5), a deceptive advertising violation — which is a ground for withdrawing
 * course approval, so making the claim before approval could cost the approval it claims.
 */
export const FORBIDDEN_CLAIMS = Object.freeze([
  Object.freeze({ pattern: /\bDRE[- ]approved\b/i, why: "no DRE approval has been issued" }),
  Object.freeze({ pattern: /\bstate[- ]approved\b/i, why: "no state approval has been issued" }),
  Object.freeze({ pattern: /\bapproved (provider|instructor|school|course)\b/i, why: "no approval of any kind has been issued" }),
  Object.freeze({ pattern: /\bstate\s+course\s+LLC\b/i, why: "the legal name is StateCourse LLC" }),
  Object.freeze({ pattern: /\bS\d{4,}\b/, why: "a sponsor number appears that DRE has not assigned" }),
  Object.freeze({ pattern: /\bTBD\b|\bTODO\b|\bXXX\b|\bLorem ipsum\b|\bPLACEHOLDER\b/i, why: "a placeholder survives in a filing document" }),
]);

export const MANIFEST_VERSION = "CA-MANIFEST-2026-08-21-v1";

export function authority(id) {
  return AUTHORITIES.find((entry) => entry.id === id) ?? null;
}

/** Authorities whose reading is older than the maximum age, as of a given day. */
export function staleAuthorities(asOf = new Date()) {
  const cutoff = new Date(asOf.getTime() - VERIFICATION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
  return Object.freeze(
    AUTHORITIES.filter((entry) => new Date(`${entry.verifiedAsOf}T00:00:00Z`) < cutoff).map((entry) => entry.id),
  );
}
