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
 * A source record.
 *
 * The schema is deliberately larger than a citation. A citation tells you where something was
 * read; it does not tell you whether what you read is still what is there, or which of this
 * project's claims would fall if it changed. Those are the two questions that matter when a
 * publisher reissues a document, and answering them after the fact means re-reading everything.
 *
 * So each record carries, alongside the citation: who published it, the revision printed on it,
 * when that revision took effect, when we last read it, the hash of the copy held on disk where
 * one is held, and — the field that does the work — the discrete material claims taken from it,
 * each naming what relies on it.
 *
 * `states` is derived rather than written. A record's prose summary and its enumerated claims
 * cannot disagree, because there is only one of them.
 */
const source = (record) =>
  Object.freeze({
    ...record,
    materialClaims: Object.freeze(record.materialClaims.map((claim) => Object.freeze({ ...claim, reliedOnBy: Object.freeze(claim.reliedOnBy) }))),
    states: record.materialClaims.map((claim) => claim.claim).join(" "),
  });

/*
 * The legal authorities this filing rests on.
 *
 * `materialClaims` is what the authority actually says, claim by claim, so a reader can tell at
 * a glance whether a statement made elsewhere is stronger than its source. That comparison is
 * what the source lock performs.
 */
export const AUTHORITIES = Object.freeze([
  source({
    id: "ccr-3000",
    citation: "10 CCR § 3000 (Commissioner's Regulations, Article 24)",
    title: "Private Vocational School and Course Approval — Regulation 3000",
    publisher: "California Department of Real Estate",
    revision: "Rev. 7/18 (as excerpted on RE 307)",
    effectiveDate: null,
    obtainedVia: "RE 307, Regulation Excerpts (Private Vocational Schools), Rev. 7/18",
    url: "https://www.dre.ca.gov/files/pdf/forms/re307.pdf",
    localCopy: "california/dre-sources/RE307.pdf",
    contentHash: "76d888137adb3f37",
    verifiedAsOf: "2026-08-21",
    materialClaims: [
      {
        id: "ccr-3000-hours",
        claim:
          "An attended course must provide at least 45 periods of classroom instruction of not less than 50 minutes each; a correspondence course shall consist of not less than 15 separate lesson assignments.",
        reliedOnBy: ["ACADEMIC_CONTROLS.minimumHoursPerCourse", "ACADEMIC_CONTROLS.minimumLessonAssignments", "ACADEMIC_CONTROLS.minutesPerClassroomPeriod"],
      },
      {
        id: "ccr-3000-proctoring",
        claim:
          "A correspondence course's final examination is administered and supervised by a person the school designates, the school sends the materials to that person, and that person returns the completed examination.",
        reliedOnBy: ["deliverable:exam-instructions-proctor"],
      },
      {
        id: "ccr-3000-records",
        claim:
          "The school maintains records sufficient to produce a duplicate certificate, uses no deceptive advertising, and delivers the completion document within 15 days.",
        reliedOnBy: ["ACADEMIC_CONTROLS.certificateDeliveryDays", "FORBIDDEN_CLAIMS"],
      },
    ],
  }),
  source({
    id: "ccr-3002",
    citation: "10 CCR § 3002 (application, fee, and material change)",
    title: "Application for Course Approval — Regulation 3002",
    publisher: "California Department of Real Estate",
    revision: "Rev. 7/18 (as excerpted on RE 307)",
    effectiveDate: null,
    obtainedVia: "RE 307, Rev. 7/18",
    url: "https://www.dre.ca.gov/files/pdf/forms/re307.pdf",
    localCopy: "california/dre-sources/RE307.pdf",
    contentHash: "76d888137adb3f37",
    verifiedAsOf: "2026-08-21",
    materialClaims: [
      {
        id: "ccr-3002-contents",
        claim:
          "The application carries the course type, title, a complete outline or syllabus with a time schedule, the textbooks and student materials, and evidence of private vocational school approval or registration if the sponsor is not otherwise exempt.",
        reliedOnBy: ["deliverable:timed-outline", "deliverable:instructional-materials", "deliverable:bppe-position"],
      },
      {
        id: "ccr-3002-material-change",
        claim: "Any material change to an approved course must be submitted for approval prior to use.",
        reliedOnBy: ["docs/california/change-control.md"],
      },
    ],
  }),
  source({
    id: "re303-timing",
    citation: "RE 303, Statutory/Pre-License Course Approval packet, pages 3-4",
    title: "Statutory/Pre-License Course Approval — instructions and required items",
    publisher: "California Department of Real Estate",
    revision: "Rev. 1/26",
    effectiveDate: null,
    obtainedVia: "california/dre-sources/RE303.pdf",
    url: "https://www.dre.ca.gov/files/pdf/forms/re303.pdf",
    localCopy: "california/dre-sources/RE303.pdf",
    contentHash: "c2f38d72fafc3067",
    verifiedAsOf: "2026-08-21",
    materialClaims: [
      {
        id: "re303-pace",
        claim:
          "A school may not offer a single correspondence course to be completed in less than two and a half weeks, and no more than two courses may be completed in a five-week period, measured from the date the student receives access to the material to the date the final examination is passed, regardless of how many schools the student attends.",
        reliedOnBy: ["ACADEMIC_CONTROLS.minimumElapsedHoursPerCourse", "ACADEMIC_CONTROLS.maximumCoursesPerWindow", "ACADEMIC_CONTROLS.crossSchoolRule"],
      },
      {
        id: "re303-completion-year",
        claim: "All courses require completion within one year of registration.",
        reliedOnBy: ["ACADEMIC_CONTROLS.maximumCompletionDays"],
      },
      {
        id: "re303-final-exam",
        claim:
          "The final examination is not less than 100 multiple choice or fill-in questions with a passing score of 60 percent or greater, one retake on different questions is permitted, and the examination is never furnished directly to the student.",
        reliedOnBy: [
          "ACADEMIC_CONTROLS.finalExamMinimumQuestions",
          "ACADEMIC_CONTROLS.finalExamPassingPercent",
          "ACADEMIC_CONTROLS.finalExamMaximumAttempts",
          "ACADEMIC_CONTROLS.finalExamRetakeMustDiffer",
          "deliverable:final-exam-student",
        ],
      },
    ],
  }),
  source({
    id: "edc-94874f",
    citation: "California Education Code § 94874(f)",
    title: "Exemptions from the California Private Postsecondary Education Act of 2009",
    publisher: "California Legislature (leginfo.legislature.ca.gov)",
    revision: null,
    effectiveDate: null,
    obtainedVia: "leginfo.legislature.ca.gov",
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=94874.&lawCode=EDC",
    localCopy: null,
    contentHash: null,
    contentHashBasis: "The section is served as generated HTML from a query interface; no stable byte-for-byte copy is held, so drift is detected by re-reading rather than by hash.",
    verifiedAsOf: "2026-08-21",
    materialClaims: [
      {
        id: "edc-94874f-elements",
        claim:
          "An institution that does not award degrees and that solely provides educational programs for total charges of two thousand five hundred dollars or less is exempt from the Private Postsecondary Education Act, when no part of the total charges is paid from state or federal student financial aid programs.",
        reliedOnBy: ["BPPE_EXEMPTION.basis", "california/submission/00_administrative/A4-bppe-exemption-statement.md"],
      },
    ],
  }),
  source({
    id: "bppe-71395",
    citation: "5 CCR § 71395 (Application; Fees)",
    title: "Bureau for Private Postsecondary Education regulations",
    publisher: "California Bureau for Private Postsecondary Education",
    revision: null,
    effectiveDate: "2026-07-01",
    obtainedVia: "bppe.ca.gov published regulations",
    url: "https://bppe.ca.gov/lawsregs/regs.pdf",
    localCopy: null,
    contentHash: null,
    contentHashBasis: "The Bureau publishes the consolidated regulations as one document covering §§ 70000-76245; no copy is held in this repository, so drift is detected by re-reading rather than by hash.",
    verifiedAsOf: "2026-08-21",
    materialClaims: [
      {
        id: "bppe-71395-b7",
        claim:
          "An institution claiming an exemption under Education Code § 94874(d)(2) must supply a letter from the approving entity indicating the validity of that approval.",
        reliedOnBy: ["BPPE_EXEMPTION.withdrawnReason"],
      },
      {
        id: "bppe-71395-b9",
        claim:
          "An institution claiming § 94874(f) must supply the total institutional charges for the educational program and whether it is approved to offer federal financial assistance.",
        reliedOnBy: ["BPPE_EXEMPTION.highestProgramChargeUsd", "BPPE_EXEMPTION.acceptsFinancialAid"],
      },
    ],
  }),
  source({
    id: "bppe-70000d",
    citation: "5 CCR § 70000(d) (Cancellation Period)",
    title: "Bureau for Private Postsecondary Education regulations — definitions",
    publisher: "California Bureau for Private Postsecondary Education",
    revision: null,
    effectiveDate: "2026-07-01",
    obtainedVia: "bppe.ca.gov published regulations",
    url: "https://bppe.ca.gov/lawsregs/regs.pdf",
    localCopy: null,
    contentHash: null,
    contentHashBasis: "As for § 71395: no local copy is held; drift is detected by re-reading.",
    verifiedAsOf: "2026-08-21",
    materialClaims: [
      {
        id: "bppe-70000d-window",
        claim:
          "Cancellation Period means the period from the signing of the enrollment agreement either through the student's attendance at the first class session, or the seventh business day after enrollment, whichever is later.",
        reliedOnBy: ["lib/refund-policy.mjs FULL_REFUND_BUSINESS_DAYS"],
      },
      {
        id: "bppe-70000d-silence",
        claim:
          "Nothing in §§ 70000-76245 defines what a business day is, so the counting convention is not the Bureau's and no document may present it as the Bureau's or the Department's.",
        reliedOnBy: ["PROVIDER_DECISIONS.businessDayConvention"],
      },
    ],
  }),
  source({
    id: "gov-6700",
    citation: "California Government Code §§ 6700 and 6701",
    title: "Holidays in this state",
    publisher: "California Legislature (leginfo.legislature.ca.gov)",
    revision: null,
    effectiveDate: null,
    obtainedVia: "leginfo.legislature.ca.gov",
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=6700.&lawCode=GOV",
    localCopy: null,
    contentHash: null,
    contentHashBasis: "Served as generated HTML; drift is detected by re-reading.",
    verifiedAsOf: "2026-08-21",
    materialClaims: [
      {
        id: "gov-6700-list",
        claim: "Section 6700 lists the holidays in this state.",
        reliedOnBy: ["config/california/business-day-calendar.mjs"],
      },
      {
        id: "gov-6701-observance",
        claim:
          "Section 6701 provides that where certain of them fall on a Sunday the following Monday is a holiday, and that where November 11 falls on a Saturday the preceding Friday is a holiday.",
        reliedOnBy: ["config/california/business-day-calendar.mjs"],
      },
    ],
  }),
  source({
    id: "handbook-sb1495",
    citation: "DRE Course Provider Handbook — SB 1495 course content",
    title: "Course Provider Handbook",
    publisher: "California Department of Real Estate",
    revision: "Rev. 01/2026",
    effectiveDate: "2024-01-01",
    obtainedVia: "california/dre-sources/Course_Provider_Handbook.pdf",
    url: "https://www.dre.ca.gov/files/pdf/faqs/Course%20Provider%20Handbook.pdf",
    localCopy: "california/dre-sources/Course_Provider_Handbook.pdf",
    contentHash: "a35e47fef70028ff",
    verifiedAsOf: "2026-08-21",
    materialClaims: [
      {
        id: "sb1495-components",
        claim:
          "Effective January 1, 2024, all real estate practice courses must contain a component on implicit bias and a component on federal and state fair housing laws that includes an interactive participatory component during which the applicant role plays as both a consumer and a real estate professional.",
        reliedOnBy: ["deliverable:sb1495-traceability", "PROGRAMS[].sb1495"],
      },
    ],
  }),
  source({
    id: "handbook-required-items",
    citation: "DRE Course Provider Handbook — items required with a pre-license course application",
    title: "Course Provider Handbook",
    publisher: "California Department of Real Estate",
    revision: "Rev. 01/2026",
    effectiveDate: null,
    obtainedVia: "california/dre-sources/Course_Provider_Handbook.pdf",
    url: "https://www.dre.ca.gov/files/pdf/faqs/Course%20Provider%20Handbook.pdf",
    localCopy: "california/dre-sources/Course_Provider_Handbook.pdf",
    contentHash: "a35e47fef70028ff",
    verifiedAsOf: "2026-08-22",
    materialClaims: [
      {
        id: "handbook-item-list",
        claim:
          "A pre-license course approval submission consists of the completed RE 306 and fee, corporation documents and a fictitious business name statement if applicable, RE 304 if the school is out of state, copies of all student instructional materials with copyright authorizations, a textbook certification letter from a college or university professor, RE 336 with supporting documentation, a General Information Page, a timed course outline, student final examination instructions, examination proctor instructions, the student version of the final examination, the instructor version with its answer key, student and regulator log-ins for a course offered online, and a course completion certificate.",
        reliedOnBy: ["REQUIRED_DELIVERABLES"],
      },
      {
        id: "handbook-first-filing",
        claim:
          "A first-time applicant is advised to submit one course first, so that a deficiency is not repeated across every course filed at once.",
        reliedOnBy: ["FIRST_FILING"],
      },
    ],
  }),
  source({
    id: "faq-sb1495",
    citation: "DRE, Frequently Asked Questions Associated with New SB 1495 Education Requirements for Exam Applicants, New 05/2023",
    title: "FAQ — SB 1495 education requirements for exam applicants",
    publisher: "California Department of Real Estate",
    revision: "New 05/2023",
    effectiveDate: "2024-01-01",
    obtainedVia: "california/dre-sources/FAQ_SB1495.pdf",
    url: "https://www.dre.ca.gov/files/pdf/faqs/FAQ_SB1495.pdf",
    localCopy: "california/dre-sources/FAQ_SB1495.pdf",
    contentHash: "ba8de6871ed4ec51",
    verifiedAsOf: "2026-08-22",
    materialClaims: [
      {
        id: "sb1495-implicit-bias",
        claim:
          "The real estate practice course must include a component on implicit bias, including education regarding the impact of implicit bias, explicit bias, and systemic bias on consumers, the historical and social impacts of those biases, and actionable steps students can take to recognize and address their own implicit biases.",
        reliedOnBy: ["SB1495.implicitBias"],
      },
      {
        id: "sb1495-fair-housing",
        claim:
          "The course must include a component on federal and state fair housing laws as those laws apply to the practice of real estate, and that component shall include an interactive participatory component during which the applicant shall role play as both a consumer and real estate professional.",
        reliedOnBy: ["SB1495.fairHousing", "SB1495.roles"],
      },
      {
        id: "sb1495-not-severable",
        claim:
          "The fair housing and implicit bias components cannot be completed independently of the real estate practice course itself; a student who previously took a non-compliant practice course may not complete the two components alone.",
        reliedOnBy: ["SB1495.severable"],
      },
      {
        id: "sb1495-evidence",
        claim:
          "An applicant must have completed, and show evidence of completing, a practice course compliant with these requirements, irrespective of any practice course completed before January 1, 2024.",
        reliedOnBy: ["SB1495.completionEvidence"],
      },
    ],
  }),
]);

/*
 * Every Department form held, with the revision printed on its face and the SHA-256 of the
 * file. The hash is the point: a form the Department has revised is a different document, and
 * filing on a superseded revision is a deficiency that reads as carelessness. Comparing the
 * printed revision alone would miss a re-issue that kept the revision string.
 */
/* A form record carries the same shape as a source record where the fields mean the same
   thing, so that one drift report can list both without special-casing either. */
const form = (record) =>
  Object.freeze({ publisher: "California Department of Real Estate", urlBasis: null, verifiedAsOf: "2026-08-21", ...record });

export const DRE_FORMS = Object.freeze([
  form({ id: "RE303", title: "Statutory/Pre-License Course Approval packet", revision: "Rev. 1/26", file: "california/dre-sources/RE303.pdf", url: "https://www.dre.ca.gov/files/pdf/forms/re303.pdf", sha256Prefix: "c2f38d72fafc3067" }),
  form({ id: "RE306", title: "Statutory/Pre-License Course Approval Application", revision: "Rev. 1/26", file: "california/dre-sources/RE306.pdf", url: "https://www.dre.ca.gov/files/pdf/forms/re306.pdf", sha256Prefix: "7c44a760e5f567b4" }),
  form({ id: "RE307", title: "Regulation Excerpts (Private Vocational Schools)", revision: "Rev. 7/18", file: "california/dre-sources/RE307.pdf", url: "https://www.dre.ca.gov/files/pdf/forms/re307.pdf", sha256Prefix: "76d888137adb3f37" }),
  form({ id: "RE311", title: "Statutory/Pre-License Course Completion Certificate", revision: "Rev 1/26", file: "california/dre-sources/RE311.pdf", url: "https://www.dre.ca.gov/files/pdf/forms/re311.pdf", sha256Prefix: "457b312a89de3851" }),
  /* The Department serves RE 313 as a Word template rather than a PDF, and the forms area does
     not expose it at the /files/pdf/forms/ path every other form uses. The copy held was taken
     from the Department; its canonical URL is not recorded because none was read, and inventing
     one is exactly the class of defect this manifest exists to prevent. */
  form({ id: "RE313", title: "Statutory/Pre-License General Information Page", revision: "Rev 1/26", file: "california/dre-sources/re313.doc", url: null, urlBasis: "no canonical URL read; the file was obtained from the Department as a Word template", sha256Prefix: "d0633fc86e3d0e55" }),
  form({ id: "RE336", title: "Statutory/Pre-License Instructor Certification", revision: "Rev. 2/23", file: "california/dre-sources/RE336.pdf", url: "https://www.dre.ca.gov/files/pdf/forms/re336.pdf", sha256Prefix: "d21a7eccee34308c" }),
  form({ id: "RE304", title: "Consent to Service of Process", revision: "Rev. 7/18", file: "california/dre-sources/re304.pdf", url: "https://www.dre.ca.gov/files/pdf/forms/re304.pdf", sha256Prefix: "78c279fa93812da7" }),
  form({ id: "RE318A", title: "Course & Instructor Evaluation", revision: "Rev. 1/26", file: "california/dre-sources/re318a.pdf", url: "https://www.dre.ca.gov/files/pdf/forms/re318a.pdf", sha256Prefix: "8ae4b7a3c77cf91b" }),
  form({ id: "RE206E", title: "Fee schedule", revision: "Rev. 7/26", file: "california/dre-sources/RE206E.pdf", url: "https://www.dre.ca.gov/files/pdf/forms/re206e.pdf", sha256Prefix: "b32869686f1adc93" }),
  form({ id: "RE909", title: "Credit Card Payment", revision: "Rev. 5/25", file: "california/dre-sources/re909.pdf", url: "https://www.dre.ca.gov/files/pdf/forms/re909.pdf", sha256Prefix: "ba4625050902e497" }),
  form({ id: "FAQ-SB1495", title: "FAQ — SB 1495 education requirements", revision: "New 05/2023", file: "california/dre-sources/FAQ_SB1495.pdf", url: "https://www.dre.ca.gov/files/pdf/faqs/FAQ_SB1495.pdf", sha256Prefix: "ba8de6871ed4ec51", verifiedAsOf: "2026-08-22" }),
  form({ id: "HANDBOOK", title: "Course Provider Handbook", revision: "Rev. 01/2026", file: "california/dre-sources/Course_Provider_Handbook.pdf", url: "https://www.dre.ca.gov/files/pdf/faqs/Course%20Provider%20Handbook.pdf", sha256Prefix: "a35e47fef70028ff" }),
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
  COURSES.map((course) =>
    Object.freeze({
      courseId: course.courseId,
      catalogId: course.catalogId,
      packageDir: course.packageDir,
      title: course.title,
      /* The form filenames the RE 336 generator writes, and the equivalence certifications that
         will come back from a professor, are named after the course rather than the packet. */
      slug: course.title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      hours: COURSE_DESIGN.hours,
      lessonAssignments: COURSE_DESIGN.lessonAssignments,
      deliveryMethod: COURSE_DESIGN.methodOfPresentation,
      priceUsd: PRICING.singleCourse.usd,
      approvalNumber: null,
      /* SB 1495 attaches to a real estate practice course. The facts file already records which
         course carries the interactive participatory component; reading it here rather than
         matching on the title keeps one home for the answer. */
      sb1495: course.interactiveParticipatory === true,
    }),
  ),
);

/** The program a course id, catalog id or packet directory names. */
export function program(key) {
  return (
    PROGRAMS.find((entry) => entry.courseId === key || entry.catalogId === key || entry.packageDir === key) ?? null
  );
}

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

/*
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *  SB 1495 — the requirement, broken into the elements the Department actually states
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * "Compliant with SB 1495" is a sentence anybody can type. What makes it true is four pieces
 * of implicit bias content, two pieces of fair housing content, and a participatory component
 * in which the student takes BOTH roles — and, the part that is a platform property rather
 * than a curriculum property, a course that a student cannot finish having taken only one.
 *
 * Each element below is one thing the FAQ says, phrased so that it can be looked for. The
 * traceability matrix at california/submission/02_Real_Estate_Practice/07-sb1495-traceability.md
 * is generated from this list against the lesson text, the assessment banks and the final
 * examination banks; nothing in it is typed by hand, so it cannot claim coverage that the
 * course does not have.
 *
 * `severable: false` is Q7. A student who took a non-compliant practice course elsewhere may
 * not come here and complete the two components alone, and nothing in this platform may offer
 * them separately from the course.
 */
export const SB1495 = Object.freeze({
  statement: "Compliant with SB 1495",
  authorityId: "faq-sb1495",
  effectiveDate: "2024-01-01",
  courseId: "ca-real-estate-practice-45",
  contentFolder: "ca-real-estate-practice-45-v1",
  packageDir: "02_Real_Estate_Practice",
  assignmentId: "assignment-14",
  severable: false,
  severableAuthority: "sb1495-not-severable",
  implicitBias: Object.freeze([
    Object.freeze({ id: "impact-on-consumers", requirement: "the impact of implicit bias, explicit bias, and systemic bias on consumers", find: ["implicit bias", "explicit bias", "systemic bias"] }),
    Object.freeze({ id: "historical-impacts", requirement: "the historical impacts of those biases", find: ["redlining", "restrictive covenant"] }),
    Object.freeze({ id: "social-impacts", requirement: "the social impacts of those biases", find: ["segregated", "housing wealth"] }),
    Object.freeze({ id: "actionable-steps", requirement: "actionable steps students can take to recognize and address their own implicit biases", find: ["interruption practices", "recognize"] }),
  ]),
  fairHousing: Object.freeze([
    Object.freeze({ id: "federal-law", requirement: "federal fair housing law as it applies to the practice of real estate", find: ["Fair Housing Act", "3604"] }),
    Object.freeze({ id: "state-law", requirement: "state fair housing law as it applies to the practice of real estate", find: ["Unruh", "Fair Employment and Housing Act", "12955"] }),
  ]),
  /* The two roles, and the words the platform, the database and the documents all use for
     them. A role named one way in a table and another way in a document is a role a reviewer
     cannot follow from one to the other. */
  roles: Object.freeze([
    Object.freeze({ id: "consumer", label: "consumer", topic: "4", requirement: "the applicant shall role play as a consumer" }),
    Object.freeze({ id: "licensee", label: "real estate professional", topic: "5", requirement: "the applicant shall role play as a real estate professional" }),
  ]),
  /* The properties that make the participatory component real rather than described. Each is
     asserted by a test against the migration and the study path, not by a document. */
  enforcement: Object.freeze([
    "a response is persisted for each role, with the text the student wrote",
    "assignment-14 cannot reach completed with either role missing",
    "final examination eligibility reports the interactive requirement from the submissions, not from the assignment count",
    "the completion record carries the evidence that both roles were taken",
  ]),
});

export const MANIFEST_VERSION = "CA-MANIFEST-2026-08-22-v1";

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

/*
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *  REQUIRED_DELIVERABLES — what a submission consists of, whether or not it exists yet
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * This list exists because the release gate was answering the wrong question.
 *
 * It ran seventeen checks, every one passed, and it printed GRANTED — while the SB 1495
 * traceability, the complete instructional print volume, and the working review credentials
 * did not exist at all. Nothing was wrong with any check. The defect was that a gate built
 * only from checks can only ever report on what someone remembered to write a check for, and
 * a missing deliverable has no check to fail. Absence was indistinguishable from success.
 *
 * So the ledger comes first and the checks come second. A gate is GRANTED when every mandatory
 * deliverable EXISTS and every check over it PASSES — never when the checks alone pass.
 *
 * The list is the Department's, not ours. Its entries are the items the Course Provider
 * Handbook states must accompany a pre-license course approval application, in the Handbook's
 * order, each quoted in `handbookItem`. Where the remediation work order adds a requirement
 * beyond the Handbook's list, `handbookItem` is null and `section` names the work order
 * section that adds it.
 *
 * `owner` is the honest part. "build" is something this repository can produce and therefore
 * must. "human" is a signature, a notarisation, a letter on someone else's letterhead, or an
 * envelope — work no amount of code finishes. Both block: an unsigned RE 306 is not ready to
 * mail. But they block differently, and a gate that did not separate them would tell a reader
 * to go on writing code when what is actually outstanding is a professor's signature.
 *
 * `evidence` is what must exist on disk. A string is a path; an object is a path together with
 * text that must appear in it, which is how a requirement of substance — "the General
 * Information Page must state that the course is compliant with SB 1495" — is checked rather
 * than assumed from the presence of a file. `{packet}` is the submission packet directory and
 * `{folder}` the course content folder, substituted per program for a per-course deliverable.
 */

/* DRE advises a first-time applicant to file one course rather than all of them, so that a
   deficiency is found once instead of three times. Real Estate Principles is that course. */
export const FIRST_FILING = Object.freeze({
  courseId: "ca-real-estate-principles-45-v1",
  packageDir: "01_Real_Estate_Principles",
  title: "Real Estate Principles",
  authorityId: "handbook-required-items",
  claimId: "handbook-first-filing",
});

const deliverable = (record) =>
  Object.freeze({
    handbookItem: null,
    nextAction: null,
    scope: "per-course",
    mandatory: true,
    note: null,
    ...record,
    evidence: Object.freeze(record.evidence.map((item) => (typeof item === "string" ? Object.freeze({ path: item, mustContain: Object.freeze([]) }) : Object.freeze({ ...item, mustContain: Object.freeze(item.mustContain ?? []) })))),
  });

export const REQUIRED_DELIVERABLES = Object.freeze([
  deliverable({
    id: "re306",
    nextAction: "Transcribe the answer sheet onto the official RE 306 (Rev. 1/26) and attach the continuation sheets it references.",
    label: "RE 306 course approval application",
    handbookItem: "Completed Pre-License Course Approval Application (RE 306).",
    section: "§2",
    owner: "build",
    evidence: ["california/submission/{packet}/01-re306-answer-sheet.md"],
  }),
  deliverable({
    id: "fee",
    nextAction: "Confirm the current fee on DRE's website on the day of filing, then prepare the cheque or RE 909.",
    label: "course approval fee instructions",
    handbookItem: "Appropriate fee(s) — check DRE's website prior to submitting.",
    section: "§11",
    owner: "build",
    evidence: ["california/submission/{packet}/02-fee-reference.md"],
  }),
  deliverable({
    id: "entity-documents",
    nextAction: "Order a current Certificate of Status from the California Secretary of State and insert it behind the Articles of Organization.",
    label: "Secretary of State entity documents",
    handbookItem: "Corporation Documents, if applicable, as filed with the Secretary of State.",
    section: "§9",
    owner: "human",
    scope: "once",
    evidence: [
      "california/submission/00_administrative/A2-entity-documentation.md",
      "california/dre-sources/ca-articles-of-organization-B20260376786.pdf",
    ],
    note: "The Articles of Organization are held. A current Certificate of Status must be ordered from the Secretary of State and inserted before mailing; it is dated and cannot be prepared in advance.",
  }),
  deliverable({
    id: "fbns",
    nextAction: "None. The determination stands: the public and legal name is the same, so no fictitious business name statement is filed.",
    label: "fictitious business name position",
    handbookItem: "Fictitious Business Name Statement (FBNS), if applicable, as filed with the County Clerk's office.",
    section: "§10",
    owner: "build",
    scope: "once",
    evidence: ["california/submission/00_administrative/A5-fbns-determination.md"],
  }),
  deliverable({
    id: "re304",
    nextAction: "None. RE 304 is required only of an out-of-state school; StateCourse LLC is a California domestic LLC.",
    label: "RE 304 consent to service of process",
    handbookItem: "Consent to Service of Process (RE 304) if the school is out of state.",
    section: "§9",
    owner: "build",
    scope: "once",
    evidence: ["california/submission/00_administrative/A6-re304-determination.md"],
  }),
  deliverable({
    id: "bppe-position",
    nextAction: "None. The exemption relied on is Education Code § 94874(f) and item 8 states it.",
    label: "BPPE exemption position",
    handbookItem: null,
    section: "§2",
    owner: "build",
    scope: "once",
    evidence: [
      { path: "california/submission/00_administrative/A4-bppe-exemption-statement.md", mustContain: ["94874(f)"] },
    ],
    note: "Regulation 3002(a)(2)(E) requires evidence of private vocational school approval or registration unless the sponsor is otherwise exempt; this states the exemption relied on.",
  }),
  deliverable({
    id: "instructional-materials",
    nextAction: "Print and bind one copy of the course volume for the course being filed.",
    label: "complete student-viewable instructional volume",
    handbookItem: "Copies of all student instructional materials and copyright authorizations as necessary.",
    section: "§5",
    owner: "build",
    evidence: [
      "california/print/{folder}-course-text.pdf",
      "california/submission/{packet}/04-instructional-material-manifest.md",
    ],
  }),
  deliverable({
    id: "textbook-certification",
    nextAction: "Send the dossier and the draft letter to a qualified college instructor in the field of study, and obtain a signed certification on official letterhead.",
    label: "college or university professor equivalence certification",
    handbookItem: "Textbook Certification letter from a college/university professor.",
    section: "§8",
    owner: "human",
    evidence: ["california/dre-sources/instructor-equivalence/{slug}-signed-certification.pdf"],
    note: "A drafted request letter is not a certification. The filing is blocked until a qualified college instructor in the field of study signs one on official letterhead.",
  }),
  /*
   * The Handbook asks for "Pre-License Instructor Certification (RE 336) WITH supporting
   * documentation", and those are two deliverables that fail in different ways. The form can be
   * generated correctly from the Department's own PDF and still be filed behind qualification
   * evidence nobody assembled. Kept as one entry, a complete form would have closed the
   * requirement while the evidence behind it was outstanding.
   */
  deliverable({
    id: "re336",
    nextAction: "Regenerate from the Department's PDF if re336-data.json changes; otherwise none until signing.",
    label: "RE 336 instructor certification form, one per course",
    handbookItem: "Pre-License Instructor Certification (RE 336) with supporting documentation.",
    section: "§3",
    owner: "build",
    evidence: ["california/dre-sources/generated/RE336-{slug}.pdf"],
  }),
  deliverable({
    id: "instructor-qualifications",
    nextAction: "None. The qualification route and its substantiation are stated; approval is the Commissioner's to give.",
    label: "instructor qualification evidence supporting RE 336",
    handbookItem: null,
    section: "§7A",
    owner: "build",
    scope: "once",
    evidence: [
      { path: "california/submission/00_administrative/A7-instructor-package.md", mustContain: ["3000(a)(8)", "01385024"] },
      "california/dre-sources/instructor-qualification-package-draft.pdf",
    ],
    note: "Regulation 3000(a)(8) route relied on is teaching qualifications evidenced by education and experience in combination. No community college credential is claimed. Instructor approval is the Commissioner's to give and has not been given.",
  }),
  deliverable({
    id: "re313",
    nextAction: "Type the values into the official RE 313 Word template and print it. Do not rebuild the form.",
    label: "RE 313 General Information Page",
    handbookItem: "General Information Page (RE 313 serves as a template).",
    section: "§1",
    owner: "build",
    evidence: ["california/submission/{packet}/06-re313-general-information-page.md"],
  }),
  deliverable({
    id: "timed-outline",
    nextAction: "None. Regenerate if any lesson's timed sequence changes.",
    label: "timed course outline",
    handbookItem: "Timed Course Outline.",
    section: "§5",
    owner: "build",
    evidence: ["california/{folder}/submission/timed-course-outline.md"],
  }),
  deliverable({
    id: "exam-instructions-student",
    nextAction: "None. Regenerate if the examination configuration changes.",
    label: "student final examination instructions",
    handbookItem: "Student Final Exam Instructions.",
    section: "§6",
    owner: "build",
    evidence: ["california/{folder}/submission/final-exam-student-instructions.md"],
  }),
  deliverable({
    id: "exam-instructions-proctor",
    nextAction: "None. Regenerate if the examination configuration changes.",
    label: "examination proctor instructions",
    handbookItem: "Exam Proctor/monitor Instructions.",
    section: "§6",
    owner: "build",
    evidence: ["california/{folder}/submission/final-exam-proctor-instructions.md"],
  }),
  deliverable({
    id: "final-exam-student",
    nextAction: "None. Regenerate from the banks if any item changes.",
    label: "student version of the final examination, forms A and B",
    handbookItem: "Student Version of the Final Exam.",
    section: "§6",
    owner: "build",
    evidence: [
      "california/{folder}/submission/final-exam-form-a-student.md",
      "california/{folder}/submission/final-exam-form-b-student.md",
    ],
  }),
  deliverable({
    id: "final-exam-instructor",
    nextAction: "None. Regenerate from the banks if any item changes.",
    label: "instructor version and answer key, forms A and B",
    handbookItem: "Instructor Version of the Final Exam along with corresponding answer key.",
    section: "§6",
    owner: "build",
    evidence: [
      "california/{folder}/submission/final-exam-form-a-answer-key.md",
      "california/{folder}/submission/final-exam-form-b-answer-key.md",
    ],
  }),
  /*
   * Reviewer access is not instructor qualification. One is how the Department reaches an
   * internet course to inspect it; the other is who is qualified to teach it. They were filed
   * under one section number and a reader could reasonably have taken either for the other.
   */
  deliverable({
    id: "reviewer-access",
    nextAction: "Write scripts/provision-california-review-accounts.mjs, provision one student and one regulator account against the live database, verify both reach the course and the examination, and write the credentials to a private filing sheet outside the repository.",
    label: "working student and regulator log-ins for the online course",
    handbookItem: "Student AND Regulator log-in and password for courses/final exams offered online/mobile app.",
    section: "§7B",
    owner: "build",
    evidence: [
      "california/submission/{packet}/14-login-instructions.md",
      "scripts/provision-california-review-accounts.mjs",
    ],
    note: "The accounts must exist and work. The credentials themselves are never committed; the provisioning script writes a private filing sheet outside the repository for insertion before mailing.",
  }),
  deliverable({
    id: "re311",
    nextAction: "None. The RE 311 sample is submitted unchanged as the specimen.",
    label: "RE 311 course completion certificate specimen",
    handbookItem: "Pre-License Course Completion Certificate (RE 311 serves as a template).",
    section: "§1",
    owner: "build",
    evidence: ["california/submission/{packet}/15-re311-certificate-specimen.md"],
  }),
  /* Added by the work order rather than by the Handbook's list. */
  deliverable({
    id: "sb1495-traceability",
    nextAction: "None. Regenerate if the practicum, the banks or the printed volume change.",
    label: "SB 1495 implicit bias and fair housing role-play traceability",
    handbookItem: null,
    section: "§4",
    owner: "build",
    scope: "sb1495-course",
    evidence: [
      { path: "california/submission/{packet}/06-re313-general-information-page.md", mustContain: ["Compliant with SB 1495"] },
      { path: "california/submission/{packet}/15-re311-certificate-specimen.md", mustContain: ["Compliant with SB 1495"] },
      { path: "california/submission/{packet}/07-sb1495-traceability.md", mustContain: ["implicit bias", "role", "item 23B"] },
    ],
  }),
  deliverable({
    id: "signatures",
    nextAction: "Produce the per-packet signature sheet listing every signature line, who signs it and in what order, then obtain the signatures on paper at filing.",
    label: "original signatures and dates on RE 306 and RE 336",
    handbookItem: null,
    section: "§11",
    owner: "human",
    evidence: ["california/submission/{packet}/16-signature-sheet.md"],
    note: "The sheet lists every signature line, who signs it and in what order. The signatures themselves are made on paper.",
  }),
]);

/** The deliverables that apply to a given program, with {packet} and {folder} substituted. */
export function deliverablesFor(programKey) {
  const entry = program(programKey);
  if (!entry) throw new Error(`no California program named "${programKey}"`);
  const fill = (value) =>
    value.replaceAll("{packet}", entry.packageDir).replaceAll("{folder}", entry.courseId).replaceAll("{slug}", entry.slug);
  return Object.freeze(
    REQUIRED_DELIVERABLES.filter((item) => item.scope !== "sb1495-course" || entry.sb1495).map((item) =>
      Object.freeze({
        ...item,
        program: entry.courseId,
        programTitle: entry.title,
        evidence: Object.freeze(item.evidence.map((file) => Object.freeze({ ...file, path: fill(file.path) }))),
      }),
    ),
  );
}

/** Every deliverable across every program, with the once-only items counted once. */
export function allDeliverables() {
  const seen = new Set();
  const list = [];
  for (const entry of PROGRAMS) {
    for (const item of deliverablesFor(entry.courseId)) {
      if (item.scope === "once") {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
      }
      list.push(item);
    }
  }
  return Object.freeze(list);
}
