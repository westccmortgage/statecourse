/**
 * Florida — school permitholder, instructor, school and course eligibility.
 *
 * THIS FILE EXISTS IN ITS CURRENT FORM BECAUSE THE FIRST VERSION GOT THE LAW WRONG. It reported
 * that a Florida broker's licence was mandatory for the school permitholder, that no individual
 * associated with StateCourse could sign a Florida school permit application, and that the whole
 * Florida programme was blocked on that. That conclusion was wrong, and the way it went wrong is
 * worth recording, because it is a mistake that can be made again by anyone reading carefully but
 * in the wrong order.
 *
 * WHAT HAPPENED. Rule 61J2-17.011(2), F.A.C. reads, in full:
 *
 *     "(2) A person shall qualify to be a school permit holder by meeting the qualifications for
 *     practice set forth in Section 475.25(2)(a), F.S. The licensee must be a holder of a Florida
 *     Broker's license in order to satisfy the Broker license requirement in Section 475.25(2)(a),
 *     F.S."
 *
 * The first version read the second sentence as "a school permitholder must hold a Florida broker's
 * licence" and treated it as closing the door. Read again, the sentence does not say that. It is
 * CONDITIONAL and SCOPED: it says that a licensee must hold a FLORIDA broker's licence *in order to
 * satisfy the Broker license requirement*. It answers the question "which broker's licence counts?"
 * — a Florida one, not an out-of-state one. It says nothing whatever about the applicant who is not
 * satisfying the broker-licence requirement at all, because they qualified another way.
 *
 * AND THE STATUTE EXPRESSLY PROVIDES ANOTHER WAY. Section 475.451(2)(a), Fla. Stat.:
 *
 *     "A school permitholder must be the holder of a license as a broker, either active or
 *     voluntarily inactive, OR must have passed an instructor's examination approved by the
 *     commission."
 *
 * That is a disjunction, in the controlling statute. A rule may not repeal it. Section 120.52(8)(c),
 * Fla. Stat. makes a rule that enlarges, modifies or contravenes the law it implements an invalid
 * exercise of delegated legislative authority — and Rule 61J2-17.011's own rulemaking authority is
 * cited as "475.05, 475.451(2)(b)1.b. FS.", which is the INSTRUCTOR experience provision that
 * subsection (1) implements. Nothing in the cited authority would support narrowing the
 * permitholder alternatives in s. 475.451(2)(a).
 *
 * THE CROSS-REFERENCE IS ALSO DEFECTIVE, AND THAT IS A SEPARATE POINT. Rule 61J2-17.011(2) sends the
 * reader to "Section 475.25(2)(a), F.S." twice. Section 475.25(2) is the provision permitting a
 * licence to be revoked or cancelled if it was issued through the mistake or inadvertence of the
 * commission. It has no paragraph (a), and states no qualification for practice. The provision the
 * rule is plainly reaching for is s. 475.451(2)(a). The defect is recorded. It is NOT allowed to
 * erase the alternative the statute expressly states — a non-resolving citation cannot repeal a
 * statute by accident.
 *
 * AND THE DEPARTMENT AGREES. This is not a clever reading against the regulator's practice; it is
 * the regulator's practice. Three of DBPR's own instruments carry the alternative on their face:
 *
 *   DBPR RE 5 (School Permit), "METHOD OF QUALIFICATION" — two checkboxes:
 *       "Holding a license as a Florida Broker, either active or voluntarily inactive" [Florida
 *       Broker License Number ____]  or  "Holder of a Florida Instructor's License" [Instructor
 *       Permit Number ____]
 *   DBPR RE 6 (Change of School Permit Holder) — "Qualified to hold school permit through: Holding
 *       a license as a broker, either active or voluntarily inactive, or; Passing the Instructors
 *       Exam"
 *   DBPR RE 3 (Instructor Permit), Section I — three qualification bases, the first being
 *       "Real Estate Instructor Exam [1010]", which requires no broker licence at all.
 *
 * WHAT THIS FILE THEREFORE DOES NOT SAY. It does not say Anatoliy is eligible, or approved, or that
 * anything has been applied for. It says a statutory examination route APPEARS AVAILABLE, subject
 * to satisfying the general qualifications, passing the Commission-approved instructor examination,
 * filing the application, and the Department issuing the permit. Every one of those is outstanding.
 *
 * AUTHORITY CLASSIFICATION USED THROUGHOUT:
 *   STATUTE   — controlling.
 *   RULE      — controlling so far as consistent with and authorised by the statute.
 *   FORM      — administrative guidance and application evidence; strong evidence of the
 *               Department's own reading; cannot create a requirement the law does not support nor
 *               remove an alternative the statute grants.
 */

export const OWNER = Object.freeze({ BUILD: "build", HUMAN: "human", REGULATOR: "regulator" });

export const AUTHORITY_CLASS = Object.freeze({
  STATUTE: "statute — controlling",
  RULE: "rule — controlling so far as consistent with and authorised by the statute",
  FORM: "DBPR form or checklist — administrative guidance and application evidence, not a substitute for statute or rule",
});

/* ── the controlling texts, quoted rather than summarised ─────────────────────────────────────── */
export const CONTROLLING_TEXTS = Object.freeze([
  Object.freeze({
    cite: "s. 475.451(2)(a), Fla. Stat.",
    authorityClass: AUTHORITY_CLASS.STATUTE,
    quote:
      "“School permitholder” means the individual who is responsible for directing the overall operation of a proprietary real estate school. A school permitholder must be the holder of a license as a broker, either active or voluntarily inactive, or must have passed an instructor’s examination approved by the commission. A school permitholder must also meet the requirements of a school instructor if actively engaged in teaching.",
  }),
  Object.freeze({
    cite: "s. 475.451(2)(b)1., Fla. Stat.",
    authorityClass: AUTHORITY_CLASS.STATUTE,
    quote:
      "Before commencing to provide such instruction, the applicant must certify the applicant’s competency and obtain an instructor permit by meeting one of the following requirements: a. Hold a bachelor’s degree in a business-related subject, such as real estate, finance, accounting, business administration, or its equivalent and hold a valid broker’s license in this state. b. Hold a bachelor’s degree, have extensive real estate experience, as defined by rule, and hold a valid broker’s license in this state. c. Pass an instructor’s examination approved by the commission.",
  }),
  Object.freeze({
    cite: "Rule 61J2-17.011(2), F.A.C.",
    authorityClass: AUTHORITY_CLASS.RULE,
    quote:
      "A person shall qualify to be a school permit holder by meeting the qualifications for practice set forth in Section 475.25(2)(a), F.S. The licensee must be a holder of a Florida Broker’s license in order to satisfy the Broker license requirement in Section 475.25(2)(a), F.S.",
    interactionWithStatute:
      "Scoped, not exclusive. The operative sentence conditions HOW the broker-licence branch is satisfied — the licence must be a Florida one — and does not address the statutory alternative of passing a Commission-approved instructor's examination. It therefore narrows the broker branch and leaves the examination branch untouched.",
    defect:
      "The cross-reference does not resolve. Section 475.25(2) concerns revocation or cancellation of a licence issued through the mistake or inadvertence of the commission; it has no paragraph (a) and states no qualification for practice. The provision the rule is reaching for is s. 475.451(2)(a). Recorded as a defect; it does not and cannot erase the statutory alternative.",
    rulemakingAuthorityCited: "475.05, 475.451(2)(b)1.b. FS.",
    rulemakingAuthorityNote:
      "The cited authority is the instructor 'extensive real estate experience' provision, which subsection (1) implements. Nothing in it would authorise narrowing the permitholder alternatives in s. 475.451(2)(a).",
  }),
]);

/* ── what StateCourse holds today ─────────────────────────────────────────────────────────────── */
export const APPLICANT = Object.freeze({
  legalName: "StateCourse LLC",
  formationState: "CA",
  secretaryOfStateFileNumber: "B20260376786",
  principal: "Anatoliy Kanevsky",
  principalLicence: "California real estate broker licence 01385024",
  principalHoldsFloridaBrokerLicence: false,
  principalPassedFrecInstructorExamination: false,
  principalHoldsFloridaInstructorPermit: false,
  floridaSchoolPermitNumber: null,
  floridaInstructorPermitNumber: null,
  floridaCourseNumber: null,
  applicationFiled: false,
  eligibilityAsserted: false,
  approvalAsserted: false,
});

/* ── the status matrix ────────────────────────────────────────────────────────────────────────
   Seven rows, replacing the "no qualified person exists" blocker the first version carried. Status
   values are deliberately plain: AVAILABLE means a lawful route exists and is open; NOT_HELD means
   the thing does not exist yet; NOT_MET means a stated condition is unsatisfied. Nothing here says
   anyone is eligible — eligibility is a determination the Department makes on an application. */
const STATUS = Object.freeze({
  AVAILABLE: "AVAILABLE — a lawful route exists and is open",
  NOT_HELD: "NOT HELD — does not exist yet",
  NOT_MET: "NOT MET — a stated condition is unsatisfied",
  CONDITIONAL: "CONDITIONAL — applies only in a stated case",
});

export const ELIGIBILITY_MATRIX = Object.freeze([
  Object.freeze({
    row: 1,
    subject: "Florida broker-licence route to school permitholder",
    authority: "s. 475.451(2)(a), Fla. Stat.; Rule 61J2-17.011(2), F.A.C.; DBPR RE 5 checkbox 1",
    requirement: "Hold a licence as a Florida broker, either active or voluntarily inactive.",
    status: STATUS.NOT_MET,
    stateCoursePosition:
      "The principal holds California broker licence 01385024. Rule 61J2-17.011(2) requires a FLORIDA broker's licence to satisfy this branch, so an out-of-state licence does not. This route is closed unless a Florida broker licence is obtained or a Florida-licensed broker is engaged.",
    owner: OWNER.HUMAN,
  }),
  Object.freeze({
    row: 2,
    subject: "FREC-approved instructor-examination route to school permitholder",
    authority: "s. 475.451(2)(a), Fla. Stat.; DBPR RE 5 checkbox 2; DBPR RE 6 'Passing the Instructors Exam'",
    requirement:
      "Have passed an instructor's examination approved by the Commission. On DBPR RE 5 this is captured as 'Holder of a Florida Instructor's License' with the instructor permit number.",
    status: STATUS.AVAILABLE,
    stateCoursePosition:
      "APPEARS AVAILABLE and is not yet taken. It is subject to satisfying the general qualifications for practice in s. 475.17(1), passing the Commission-approved instructor examination, obtaining the instructor permit, filing DBPR RE 5, and the Department issuing the school permit. Nothing about it is held, and nobody is asserted to be eligible.",
    owner: OWNER.HUMAN,
  }),
  Object.freeze({
    row: 3,
    subject: "Instructor permit",
    authority: "s. 475.451(2)(b)1., Fla. Stat.; Rule 61J2-17.011(1), F.A.C.; DBPR RE 3 Section I",
    requirement:
      "An instructor permit by one of three routes: (a) business-related bachelor's degree + valid Florida broker's licence; (b) bachelor's degree + extensive real estate experience + valid Florida broker's licence; (c) pass a Commission-approved instructor's examination. Route (c) requires no broker licence.",
    status: STATUS.AVAILABLE,
    stateCoursePosition:
      "Route (c) is open. Routes (a) and (b) are closed on the same facts as row 1. Also required: electronic fingerprints, and the $62.75 fee. No permit is held.",
    owner: OWNER.HUMAN,
  }),
  Object.freeze({
    row: 4,
    subject: "School permit",
    authority: "s. 475.451(1), Fla. Stat.; DBPR RE 5",
    requirement:
      "A permit from the Department before commencing or continuing to offer a Commission-prescribed course. Offering without one is a second-degree misdemeanour under s. 475.451(4). Fee $109.00.",
    status: STATUS.NOT_HELD,
    stateCoursePosition:
      "Not held and not applied for. Obtainable once row 2 or row 1 is satisfied, since DBPR RE 5 requires one of those two qualification bases to be checked.",
    owner: OWNER.REGULATOR,
  }),
  Object.freeze({
    row: 5,
    subject: "Additional requirement where the school permitholder personally teaches",
    authority: "s. 475.451(2)(a), Fla. Stat. final sentence; DBPR RE 5 note",
    requirement:
      "“A school permitholder must also meet the requirements of a school instructor if actively engaged in teaching.” DBPR RE 5 states it as: “If permit holder is also teaching, the applicant must meet requirements of school instructor.”",
    status: STATUS.CONDITIONAL,
    stateCoursePosition:
      "Collapses into row 3 on the examination route. A permitholder who qualified under row 2 by passing the instructor examination and holding an instructor permit already meets the school-instructor requirement, because that permit is what the requirement asks for. The condition bites only on someone who qualified as permitholder by broker licence alone and then also teaches.",
    owner: OWNER.HUMAN,
  }),
  Object.freeze({
    row: 6,
    subject: "What StateCourse currently holds in Florida",
    authority: "n/a — statement of fact",
    requirement: "n/a",
    status: STATUS.NOT_HELD,
    stateCoursePosition:
      "No Florida broker licence. No FREC instructor examination passed. No Florida instructor permit. No Florida school permit. No FREC course approval. No course number. No application filed. Florida enrolment disabled.",
    owner: OWNER.HUMAN,
  }),
  Object.freeze({
    row: 7,
    subject: "What remains pending",
    authority: "n/a — statement of work",
    requirement: "n/a",
    status: STATUS.NOT_HELD,
    stateCoursePosition:
      "In order: identify the FREC-approved instructor examination and its candidate materials; sit and pass it; file DBPR RE 3 with fingerprints and fee; receive the instructor permit; file DBPR RE 5 naming the instructor permit as the qualification basis; receive the school permit; register the instructor to the school on DBPR RE 6; then file DBPR RE 18 for FREC Course I with the course materials, timed outline, learning objectives and end-of-course examinations.",
    owner: OWNER.HUMAN,
  }),
]);

/* ── instructor permit routes, as the statute and the Department's form both state them ────────── */
export const INSTRUCTOR_PERMIT_ROUTES = Object.freeze([
  Object.freeze({
    id: "instructor-examination",
    statutoryCite: "s. 475.451(2)(b)1.c., Fla. Stat.",
    formCode: "1010",
    formLabel: "Real Estate Instructor Exam",
    requirement: "Pass an instructor's examination approved by the Commission.",
    requiresFloridaBrokerLicence: false,
    openToStateCourse: true,
  }),
  Object.freeze({
    id: "degree-business-related",
    statutoryCite: "s. 475.451(2)(b)1.a., Fla. Stat.",
    formCode: "1030",
    formLabel: "Specific Degree & Broker's License",
    requirement: "A bachelor's degree in a business-related subject and a valid Florida broker's licence.",
    requiresFloridaBrokerLicence: true,
    openToStateCourse: false,
  }),
  Object.freeze({
    id: "degree-plus-experience",
    statutoryCite: "s. 475.451(2)(b)1.b., Fla. Stat.; Rule 61J2-17.011(1), F.A.C.",
    formCode: "1040",
    formLabel: "Degree, Extensive Experience, & Broker's License",
    requirement: "A bachelor's degree, extensive real estate experience, and a valid Florida broker's licence.",
    extensiveExperienceMeans:
      "a minimum of three years of full-time experience as a broker, including having participated in closing at least five real estate transactions as a licensee or as the employing broker of licensees, within the 12-month period immediately preceding the filing of the instructor application",
    requiresFloridaBrokerLicence: true,
    openToStateCourse: false,
  }),
]);

export const INSTRUCTOR_PERMIT_MAINTENANCE = Object.freeze({
  cite: "s. 475.451(2)(b)3, Fla. Stat.; Rules 61J2-17.016 and 61J2-3.011, F.A.C.",
  renewalCycle: "biennial, on the schedule in Rule 61-6.001, F.A.C.",
  continuingEducationHoursPerRenewal: 7,
  unrenewedBecomes: "involuntarily inactive",
  expiresAfterInactiveYears: 2,
});

/* ── may the school designate someone else? ───────────────────────────────────────────────────── */
export const DESIGNATION_ANALYSIS = Object.freeze({
  question: "May StateCourse designate an individual other than its principal as school permitholder?",
  answer: "Yes. Nothing in the statute ties the permitholder to ownership.",
  reasoning:
    "Section 475.451(2)(a) defines the school permitholder functionally — “the individual who is responsible for directing the overall operation of a proprietary real estate school” — and imposes qualifications on that individual, not on the entity's owners. DBPR RE 5 collects the permitholder's personal details in Section I and the company's details separately under SCHOOL INFORMATION, which is the Department administering the same separation. DBPR RE 6 provides a Change of School Permit Holder transaction expressly to “transfer the school permit from one person to another”, which would be incoherent if the permitholder had to be an owner.",
  practicalEffect:
    "StateCourse has two independent routes rather than one: qualify its own principal by examination (row 2), or engage a qualified individual — a Florida broker, or an existing Florida instructor permitholder — to serve as school permitholder. Neither is taken.",
  constraint:
    "The permitholder is responsible for directing the overall operation of the school, so this is a real role with real duties under Rules 61J2-17.015 and 61J2-3.008(3)(b), not a name on a form.",
});

/* ── outstanding deliverables ─────────────────────────────────────────────────────────────────
   Now verified against the actual applications, which the first version could not do. */
const item = (record) => Object.freeze({ verifiedAgainstApplication: true, held: false, ...record });

export const DELIVERABLES = Object.freeze([
  item({ id: "instructor-exam-passed", section: "Instructor", owner: OWNER.HUMAN, cite: "s. 475.451(2)(b)1.c., Fla. Stat.", title: "Pass the Commission-approved real estate instructor examination", verifiedAgainstApplication: false, note: "The examination's administrator, content outline, fee and candidate materials were not located on the Department's education or forms pages. Open item." }),
  item({ id: "re3-filed", section: "Instructor", owner: OWNER.HUMAN, cite: "DBPR RE 3", title: "File DBPR RE 3 under basis [1010] with electronic fingerprints and the $62.75 fee" }),
  item({ id: "instructor-permit-issued", section: "Instructor", owner: OWNER.REGULATOR, cite: "s. 475.451(2)(b), Fla. Stat.", title: "Instructor permit issued by the Department" }),
  item({ id: "re5-filed", section: "School", owner: OWNER.HUMAN, cite: "DBPR RE 5", title: "File DBPR RE 5 naming the instructor permit number as the method of qualification, with the $109.00 fee" }),
  item({ id: "school-permit-issued", section: "School", owner: OWNER.REGULATOR, cite: "s. 475.451(1), Fla. Stat.", title: "School permit issued by the Department" }),
  item({ id: "re6-instructor-registered", section: "School", owner: OWNER.HUMAN, cite: "DBPR RE 6", title: "Register the permitted instructor to the school via DBPR RE 6 (Add/Terminate – Instructor)" }),
  item({ id: "course-timed-outline", section: "Course", owner: OWNER.BUILD, cite: "DBPR RE 18 Section V.1", title: "Course timed outline specifying subjects, major topics and subtopics" }),
  item({ id: "learning-objectives-3-per-hour", section: "Course", owner: OWNER.BUILD, cite: "DBPR RE 18 Section V.2; FREC Distance Education Checklist", title: "Learning objectives at three per hour" }),
  item({ id: "course-materials", section: "Course", owner: OWNER.BUILD, cite: "DBPR RE 18 Section V.3", title: "Course materials including an explanation of the delivery method" }),
  item({ id: "course-access-for-review", section: "Course", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(b), F.A.C.", title: "Access to the course in the format in which it will be offered to students" }),
  item({ id: "examination-forms", section: "Course", owner: OWNER.BUILD, cite: "DBPR RE 18 Section V.6; Rule 61J2-3.008(4)(d)", title: "End-of-course examination forms — five per the current application, two per the rule floor and the checklist" }),
  item({ id: "answer-keys-page-referenced", section: "Course", owner: OWNER.BUILD, cite: "DBPR RE 18 Section V.7", title: "An answer key per form, referencing the page numbers each question and correct answer rest on" }),
  item({ id: "objective-time-study", section: "Course", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(b)3.e, F.A.C.", title: "Objective study evidencing the stated hours are the actual hours" }),
  item({ id: "identity-verification-policy", section: "Course", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(b)3.c, F.A.C.", title: "Identity verification at enrolment, during participation, and at completion" }),
  item({ id: "continuity-plan", section: "Course", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(b)3.b, F.A.C.", title: "Alternative plans for uninterrupted learner services on primary system failure" }),
  item({ id: "re18-filed", section: "Course", owner: OWNER.HUMAN, cite: "DBPR RE 18", title: "File DBPR RE 18 — NEW, Sales Associate Pre-Licensure, Distance — $0 for a permitted school" }),
  item({ id: "re19-question", section: "Course", owner: OWNER.REGULATOR, cite: "DBPR RE 18 Section V.4", title: "Confirm whether a permitted school filing Course I must also file DBPR RE 19", verifiedAgainstApplication: false }),
  item({ id: "records-retention-3yr", section: "Operating", owner: OWNER.BUILD, cite: "s. 475.451(8), Fla. Stat.", title: "Three-year retention of rosters, attendance, examination copies and answer sheets" }),
  item({ id: "certificate-retention-5yr", section: "Operating", owner: OWNER.BUILD, cite: "Rule 61J2-3.015(6)(f), F.A.C.", title: "Five-year retention of each course completion certificate" }),
  item({ id: "anti-recruiting-statement", section: "Operating", owner: OWNER.BUILD, cite: "Rule 61J2-17.015(2), F.A.C.", title: "The Commission's anti-recruiting statement posted and read at course start" }),
  item({ id: "advertising-evidence", section: "Operating", owner: OWNER.BUILD, cite: "s. 475.4511(2), Fla. Stat.", title: "Every publicity claim rests on relevant facts supported by evidence establishing their truth" }),
]);

/* ── readiness ────────────────────────────────────────────────────────────────────────────────
   Still NOT READY, and still incapable of reporting otherwise — but for accurate reasons now. The
   difference between this and the first version is that "blocked, no route exists" has become
   "route exists, nothing along it has been done", which is a different project. */
export function floridaReadiness() {
  const outstanding = DELIVERABLES.filter((d) => !d.held);
  const unverified = DELIVERABLES.filter((d) => !d.verifiedAgainstApplication);
  const availableRoutes = ELIGIBILITY_MATRIX.filter((r) => r.status === STATUS.AVAILABLE);
  return Object.freeze({
    status: "NOT READY",
    deliverables: DELIVERABLES.length,
    outstanding: outstanding.length,
    heldCount: DELIVERABLES.length - outstanding.length,
    lawfulRouteToSchoolPermitExists: availableRoutes.some((r) => r.row === 2),
    lawfulRouteToInstructorPermitExists: availableRoutes.some((r) => r.row === 3),
    anyPersonAssertedEligible: APPLICANT.eligibilityAsserted,
    anyApprovalAsserted: APPLICANT.approvalAsserted,
    ledgerVerifiedAgainstApplication: unverified.length === 0,
    itemsNotVerifiedAgainstApplication: unverified.map((d) => d.id),
    byOwner: Object.freeze({
      build: outstanding.filter((d) => d.owner === OWNER.BUILD).length,
      human: outstanding.filter((d) => d.owner === OWNER.HUMAN).length,
      regulator: outstanding.filter((d) => d.owner === OWNER.REGULATOR).length,
    }),
    reason:
      "A lawful route to both permits exists and no step along it has been taken. Nothing is held, nothing is filed, and no person is asserted to be eligible.",
  });
}

export default Object.freeze({
  OWNER,
  AUTHORITY_CLASS,
  CONTROLLING_TEXTS,
  APPLICANT,
  ELIGIBILITY_MATRIX,
  INSTRUCTOR_PERMIT_ROUTES,
  INSTRUCTOR_PERMIT_MAINTENANCE,
  DESIGNATION_ANALYSIS,
  DELIVERABLES,
  floridaReadiness,
});
