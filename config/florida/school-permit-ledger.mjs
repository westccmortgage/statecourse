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
 * CURRENT OWNER SELECTION. Anatoliy still pursues Florida broker licensure personally through RE 2
 * endorsement [2501/1047]. DBPR's 2 September 2026 written response makes that personal objective
 * independent from the school's critical path: StateCourse can pursue RE 3 [1010], the instructor
 * examination and an instructor permit now, then use that permit on RE 5. The two tracks therefore
 * run in parallel. This file does not assert eligibility, examination admission or approval.
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
    cite: "s. 455.213(15), Fla. Stat.",
    authorityClass: AUTHORITY_CLASS.STATUTE,
    quote:
      "Before denying licensure by reciprocity or endorsement, the board or department must find whether the other-jurisdiction basis license is substantially equivalent or otherwise sufficient. If the finding is adverse and no other denial ground exists, the applicant may request secretary review within 7 business days after notice; the secretary has 7 business days to review it.",
    note: "Condensed without changing the operative deadlines; the official statute controls. This is a review right, not an approval guarantee.",
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

export const SELECTED_BROKER_ROUTE = Object.freeze({
  selected: true,
  form: "DBPR RE 2",
  transactionCode: "2501/1047",
  label: "Broker License by Endorsement",
  publishedThreshold:
    "Current and valid real estate broker license held for at least five years in another U.S. jurisdiction; active now or active within the last two years.",
  applicantFactStatus:
    "Repository/user facts report active California broker licensure since 2009; the issued RE 293 must prove the facts and DBPR/FREC must approve substantial equivalence or sufficiency.",
  certifiedHistoryHeld: false,
  scopeLawAttachmentRequired: true,
  requiredCourseOnPublishedChecklist: false,
  requiredCourseFinding:
    "The live endorsement checklist and RE 2 page-one endorsement-specific checklist do not list the 72-hour broker pre-license course, but RE 2's later generic instructions say every broker applicant must complete it. Treat that as an official-document conflict and obtain DBPR's written transaction-specific direction; do not buy the course preemptively.",
  genericRe2InstructionsConflict: true,
  courseRequirementWrittenConfirmationPending: true,
  equivalencyApprovalAsserted: false,
  expectedExam: "Florida Real Estate Laws and Rules",
  examAssignmentConfirmedForTransaction: false,
  fallback: Object.freeze({
    transactionCode: "2501/1012",
    label: "Out of State Experience",
    selected: false,
    activationCondition: "Final endorsement denial after any timely review, followed by a deliberate owner decision",
    course: "72-hour Florida broker pre-license course from an approved school",
    exam: "Full Florida broker examination — 100 questions, 210 minutes, pass 75",
  }),
});

export const ENDORSEMENT_LAW_EXAM = Object.freeze({
  selected: true,
  assignmentConfirmedForTransaction: false,
  assignmentStatus:
    "Expected from the live [2501/1047] checklist's CIB link and s. 455.2135(1)(f), but the checklist does not name the examination and the CIB describes nonresident licensure under s. 475.180. Verify the DBPR authorization notice or written response before scheduling.",
  source: "DBPR Florida Real Estate Law Candidate Information Booklet",
  administrator: "Pearson VUE / Pearson Professional Assessments",
  delivery: "computer based at a physical Pearson test center after DBPR authorization",
  closedBook: true,
  itemCount: 40,
  allottedMinutes: 90,
  passingCorrect: 30,
  passingPercent: 75,
  currentFeeVerified: false,
  optionalPrep: Object.freeze({
    vendor: "Larson Educational Services",
    advertisedPrice: 99,
    dbprCreditHours: 0,
    requiredByFrec: false,
    priceRecheckRequired: true,
  }),
});

/* ── what StateCourse holds today ─────────────────────────────────────────────────────────────── */
export const APPLICANT = Object.freeze({
  legalName: "StateCourse LLC",
  formationState: "CA",
  secretaryOfStateFileNumber: "B20260376786",
  principal: "Anatoliy Kanevsky",
  principalLicence: "California real estate broker licence 01385024",
  reportedCaliforniaBrokerSince: 2009,
  californiaCertifiedHistoryHeld: false,
  selectedBrokerTransaction: "2501/1047",
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
    status: STATUS.AVAILABLE,
    selectedRoute: true,
    routeRole: "selected parallel personal-broker track; not a prerequisite to the school filing",
    stateCoursePosition:
      "SELECTED PERSONAL TRACK, NOT HELD. Apply for a Florida broker license through RE 2 endorsement [2501/1047] when RE 293 arrives. Repository/user facts report active California broker licensure since 2009 and therefore appear to meet the five-year duration threshold, but DBPR/FREC must determine substantial equivalence or sufficiency. DBPR confirmed in writing on 2 September 2026 that this broker license is not required solely to qualify for the school permit when the instructor-permit branch is used. No approval or present eligibility is asserted.",
    owner: OWNER.HUMAN,
  }),
  Object.freeze({
    row: 2,
    subject: "FREC-approved instructor-examination route to school permitholder",
    authority: "s. 475.451(2)(a), Fla. Stat.; DBPR RE 5 checkbox 2; DBPR RE 6 'Passing the Instructors Exam'",
    requirement:
      "Have passed an instructor's examination approved by the Commission. On DBPR RE 5 this is captured as 'Holder of a Florida Instructor's License' with the instructor permit number.",
    status: STATUS.AVAILABLE,
    selectedRoute: true,
    routeRole: "selected school-launch track, running in parallel with personal broker endorsement",
    stateCoursePosition:
      "SELECTED SCHOOL-LAUNCH TRACK, NOT HELD. DBPR confirmed in writing on 2 September 2026 that an individual need not hold a Florida broker license if the individual otherwise qualifies through RE 3 [1010], passes the required examination and receives the instructor permit; the issued permit may then be used on RE 5. Nothing along this route is held, and nobody is asserted eligible.",
    owner: OWNER.HUMAN,
  }),
  Object.freeze({
    row: 3,
    subject: "Instructor permit",
    authority: "s. 475.451(2)(b)1., Fla. Stat.; Rule 61J2-17.011(1), F.A.C.; DBPR RE 3 Section I",
    requirement:
      "An instructor permit by one of three routes: (a) business-related bachelor's degree + valid Florida broker's licence; (b) bachelor's degree + extensive real estate experience + valid Florida broker's licence; (c) pass a Commission-approved instructor's examination. Route (c) requires no broker licence.",
    status: STATUS.AVAILABLE,
    selectedRoute: true,
    stateCoursePosition:
      "SELECTED FOR SCHOOL LAUNCH: route (c), administered by RE 3 [1010], followed by the instructor examination and issuance of the permit. Personal broker endorsement continues separately; after broker issuance, [1030] remains a possible alternative basis but is not on the school critical path. The current CIB's request for a prelicensing completion certificate conflicts with the RE 3 checklist and must be clarified before test-center admission. No permit is held.",
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
      "The selected school-launch plan obtains the RE 3 [1010] instructor permit before filing RE 5 on the instructor-permit basis and before teaching. No instruction begins before the permit and any required school/instructor registration exist.",
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
      "Run two tracks in parallel. School: clarify the CIB certificate inconsistency; file RE 3 Instructor Exam [1010] with $62.75 and fingerprints; obtain authorization; pass the 100-question, 3.5-hour examination at 75; receive the instructor permit; resolve Florida foreign-LLC treatment with the Division of Corporations; file RE 5 on the instructor-permit basis with $109 using the real California physical address; use no RE 9 for a registered-agent-only address; complete any required RE 6 step; then file current RE 18. Personal broker: receive/inspect RE 293; file RE 2 endorsement [2501/1047], fingerprints and the assigned examination. Neither track authorizes enrollment before all school and course approvals.",
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
    selected: true,
    routeRole: "selected school-launch route in parallel with personal broker endorsement",
  }),
  Object.freeze({
    id: "degree-business-related",
    statutoryCite: "s. 475.451(2)(b)1.a., Fla. Stat.",
    formCode: "1030",
    formLabel: "Specific Degree & Broker's License",
    requirement: "A bachelor's degree in a business-related subject and a valid Florida broker's licence.",
    requiresFloridaBrokerLicence: true,
    openToStateCourse: true,
    selected: false,
    routeRole: "optional post-broker alternative; not on the school critical path",
    currentlySatisfied: false,
    unresolved:
      "Florida broker license not yet issued; DBPR must accept the foreign Finance degree/equivalency evidence and broker status.",
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
    selected: false,
  }),
]);

export const INSTRUCTOR_EXAM = Object.freeze({
  selected: true,
  routeRole: "selected RE 3 [1010] school-launch route",
  source: "DBPR Real Estate Instructor Examination Candidate Information Booklet, effective February 2025",
  administrator: "Pearson VUE / Pearson Professional Assessments",
  delivery: "computer based at a physical Pearson test center",
  prerequisite: "DBPR approval/authorization after filing the instructor application; the candidate identification number is used to reserve",
  closedBook: true,
  itemCount: 100,
  itemType: "multiple choice, four options",
  equallyWeighted: true,
  allottedMinutes: 210,
  passingPoints: 75,
  prelicensingCertificateConflict:
    "The RE 3 [1010] checklist and qualification section require no prelicensing course certificate, but the February 2025 Instructor CIB's generic What to Bring section tells candidates to bring one. Obtain written DBPR/Pearson clarification before test-center admission; do not invent a course prerequisite.",
  schedulingPhone: "888-204-6289",
  schedulingOnline: true,
  cancellationNotice: "two full calendar days under the current Pearson portal",
  currentFeeVerified: false,
  legacyLinkedFee: 36.75,
  legacyLinkedFeeAsOf: "2017 fact sheet still linked by the current portal; do not quote as current without checkout confirmation",
  contentWeights: Object.freeze({
    brokerageBusiness: 44,
    valuation: 10,
    listingAndSelling: 6,
    contracts: 7,
    financing: 6,
    closingTransactions: 15,
    federalIncomeTax: 2,
    investment: 5,
    zoningAndPlanning: null,
    environmentalIssues: 1,
    propertyManagement: 1,
    realEstateMarket: 3,
  }),
  outlineAmbiguity:
    "Zoning and Planning is printed as content area IX without a percentage. The other eleven printed percentages total 100; no 0% is inferred.",
});

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
    "StateCourse selected RE 3 [1010] and the instructor-permit branch for the school launch while Anatoliy separately continues the personal broker-endorsement track. DBPR confirmed in writing on 2 September 2026 that the instructor permit may qualify its holder as RE 5 permitholder without an additional Florida broker license. Nothing is yet held.",
  constraint:
    "The permitholder is responsible for directing the overall operation of the school, so this is a real role with real duties under Rules 61J2-17.015 and 61J2-3.008(3)(b), not a name on a form.",
});

/* ── outstanding deliverables ─────────────────────────────────────────────────────────────────
   Now verified against the actual applications, which the first version could not do. */
const item = (record) => Object.freeze({ verifiedAgainstApplication: true, held: false, draftHeld: false, ...record });

export const DELIVERABLES = Object.freeze([
  item({ id: "ca-certified-history", section: "Broker", owner: OWNER.HUMAN, cite: "DBPR endorsement checklist; DBPR RE 2", title: "Receive and inspect current DRE RE 293 history proving the endorsement duration/status facts", note: "The live checklist says current; use a conservative 30-day filing control. The document is reportedly requested but not held." }),
  item({ id: "ca-broker-scope-packet", section: "Broker", owner: OWNER.BUILD, cite: "DBPR RE 2 endorsement instructions", title: "Attach fresh official California statutes/rules defining broker scope, indexed by submission appendix 06", draftHeld: true, note: "The cover/index exists; fresh official pages and filing identifiers are added at filing." }),
  item({ id: "re2-endorsement-filed", section: "Broker", owner: OWNER.HUMAN, cite: "DBPR RE 2 [2501/1047]", title: "File Broker License by Endorsement [2501/1047] with certified history, scope packet and $70 fee" }),
  item({ id: "broker-fingerprints", section: "Broker", owner: OWNER.HUMAN, cite: "DBPR endorsement checklist", title: "Complete registered fingerprints immediately after RE 2 and retain TCN/receipt" }),
  item({ id: "endorsement-equivalency-approved", section: "Broker", owner: OWNER.REGULATOR, cite: "s. 455.213(15), Fla. Stat.", title: "DBPR/FREC finds the California basis license substantially equivalent or otherwise sufficient", note: "If an adverse equivalency finding is the only denial ground, protect the 7-business-day secretary-review request deadline. No outcome is asserted." }),
  item({ id: "endorsement-law-exam-passed", section: "Broker", owner: OWNER.HUMAN, cite: "DBPR endorsement checklist; s. 455.2135(1)(f); DBPR Florida Real Estate Law CIB", title: "Verify the authorization notice's assigned examination, then pass it; expected Laws and Rules format is 40 questions, 90 minutes, 30 correct", note: "The checklist links the CIB but does not name the exam, and the CIB cites s. 475.180 rather than [1047]. Current Pearson fee is unverified. Optional Larson $99 prep is non-credit and not required." }),
  item({ id: "florida-broker-license-issued", section: "Broker", owner: OWNER.REGULATOR, cite: "DBPR RE 2; s. 475.451(2)(a), Fla. Stat.", title: "Florida broker license issued; verify number, dates and exact status" }),
  item({ id: "re3-certificate-conflict-clarified", section: "Instructor", owner: OWNER.REGULATOR, cite: "DBPR RE 3 [1010]; February 2025 Instructor CIB", title: "Clarify whether an exam-route candidate must bring any prelicensing course completion certificate", note: "RE 3 does not list one; the CIB's generic What to Bring section does. Do not convert that conflict into an invented prerequisite." }),
  item({ id: "re3-filed", section: "Instructor", owner: OWNER.HUMAN, cite: "DBPR RE 3 [1010]", title: "File RE 3 Real Estate Instructor Exam [1010] with $62.75 and electronic fingerprints", note: "Apply on the examination basis; no Florida broker license or degree packet is used for this transaction." }),
  item({ id: "instructor-exam-passed", section: "Instructor", owner: OWNER.HUMAN, cite: "February 2025 Instructor CIB", title: "After DBPR authorization, pass the closed-book 100-question instructor examination within 3.5 hours with at least 75 points" }),
  item({ id: "instructor-permit-issued", section: "Instructor", owner: OWNER.REGULATOR, cite: "s. 475.451(2)(b), Fla. Stat.", title: "Instructor permit issued by the Department" }),
  item({ id: "fl-entity-treatment-resolved", section: "School", owner: OWNER.HUMAN, cite: "DBPR correspondence dated 2026-09-02; Florida Division of Corporations", title: "Confirm and complete any Florida foreign-LLC registration required for StateCourse LLC before RE 5", note: "DBPR did not decide corporate registration; RE 5 business information must match the Division of Corporations record." }),
  item({ id: "re5-filed", section: "School", owner: OWNER.HUMAN, cite: "DBPR RE 5; DBPR correspondence dated 2026-09-02", title: "After instructor permit issuance, file DBPR RE 5 on the Florida-instructor-permit qualification with the permit number and $109 fee", note: "Use the actual California physical business address. A registered-agent-only address does not require RE 9." }),
  item({ id: "school-permit-issued", section: "School", owner: OWNER.REGULATOR, cite: "s. 475.451(1), Fla. Stat.", title: "School permit issued by the Department" }),
  item({ id: "re6-instructor-registered", section: "School", owner: OWNER.HUMAN, cite: "DBPR RE 6", title: "Register the permitted instructor to the school via DBPR RE 6 (Add/Terminate – Instructor)" }),
  item({ id: "course-timed-outline", section: "Course", owner: OWNER.BUILD, cite: "DBPR RE 18 Section V.1", title: "Course timed outline specifying subjects, major topics and subtopics", draftHeld: true }),
  item({ id: "learning-objectives-3-per-hour", section: "Course", owner: OWNER.BUILD, cite: "DBPR RE 18 Section V.2; FREC Distance Education Checklist", title: "Learning objectives at three per hour", draftHeld: true }),
  item({ id: "course-materials", section: "Course", owner: OWNER.BUILD, cite: "DBPR RE 18 Section V.3", title: "Course materials including an explanation of the delivery method", draftHeld: true, note: "All 19 sections and the delivery explanation exist; independent legal/content review and time-study revision remain before this can be marked submission-held." }),
  item({ id: "course-access-for-review", section: "Course", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(b), F.A.C.", title: "Access to the course in the format in which it will be offered to students" }),
  item({ id: "examination-forms", section: "Course", owner: OWNER.BUILD, cite: "current DBPR RE 18 Section V.7; Rule 61J2-3.008(4)(d)", title: "Two end-of-course examination forms for distance pre-license education; 126 items per form pending DBPR's item-count answer" }),
  item({ id: "answer-keys-page-referenced", section: "Course", owner: OWNER.BUILD, cite: "current DBPR RE 18 Section V.8", title: "An answer key per form, referencing the final stable page numbers each question and correct answer rest on" }),
  item({ id: "objective-time-study", section: "Course", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(b)3.e, F.A.C.", title: "Objective study evidencing the stated hours are the actual hours", draftHeld: true, note: "Protocol held; participant observations not collected, so the deliverable is not held." }),
  item({ id: "identity-verification-policy", section: "Course", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(b)3.c, F.A.C.", title: "Identity verification at enrolment, during participation, and at completion", draftHeld: true }),
  item({ id: "continuity-plan", section: "Course", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(b)3.b, F.A.C.", title: "Alternative plans for uninterrupted learner services on primary system failure", draftHeld: true }),
  item({ id: "re18-filed", section: "Course", owner: OWNER.HUMAN, cite: "DBPR RE 18", title: "File DBPR RE 18 — NEW, Sales Associate Pre-Licensure, Distance — $0 for a permitted school" }),
  item({ id: "re18-current-form-gate", section: "Course", owner: OWNER.REGULATOR, cite: "current DBPR Education page; FAR Vol. 52 No. 138", title: "Confirm the current Education-page-linked June 2026 RE 18 remains operative immediately before signature and filing", verifiedAgainstApplication: false }),
  item({ id: "cie-institution-exemption", section: "School", owner: OWNER.REGULATOR, cite: "s. 1005.06(1)(b), Fla. Stat.", title: "Retain the DBPR school permit as the institution-level approval supporting expected CIE exemption; course approval alone is insufficient", verifiedAgainstApplication: false }),
  item({ id: "records-retention-3yr", section: "Operating", owner: OWNER.BUILD, cite: "s. 475.451(8), Fla. Stat.", title: "Three-year retention of rosters, attendance, examination copies and answer sheets", draftHeld: true }),
  item({ id: "certificate-retention-5yr", section: "Operating", owner: OWNER.BUILD, cite: "Rule 61J2-3.015(6)(f), F.A.C.", title: "Five-year retention of each course completion certificate", draftHeld: true }),
  item({ id: "anti-recruiting-statement", section: "Operating", owner: OWNER.BUILD, cite: "Rule 61J2-17.015(2), F.A.C.", title: "The Commission's anti-recruiting statement posted and read at course start", draftHeld: true }),
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
    draftHeldCount: DELIVERABLES.filter((d) => d.draftHeld).length,
    selectedBrokerRoute: SELECTED_BROKER_ROUTE.transactionCode,
    selectedInstructorRoute: "1010",
    lawfulRouteToSchoolPermitExists: availableRoutes.some((r) => r.row === 1 || r.row === 2),
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
      "Two selected tracks now run in parallel: RE 3 [1010] for the school launch and RE 2 [2501/1047] for Anatoliy's personal Florida broker objective. The applications, examinations, licenses, permits and approvals are not held. No person is asserted eligible and no approval is asserted.",
  });
}

export default Object.freeze({
  OWNER,
  AUTHORITY_CLASS,
  CONTROLLING_TEXTS,
  SELECTED_BROKER_ROUTE,
  ENDORSEMENT_LAW_EXAM,
  APPLICANT,
  ELIGIBILITY_MATRIX,
  INSTRUCTOR_PERMIT_ROUTES,
  INSTRUCTOR_EXAM,
  INSTRUCTOR_PERMIT_MAINTENANCE,
  DESIGNATION_ANALYSIS,
  DELIVERABLES,
  floridaReadiness,
});
