/**
 * FREC Course I — what Florida actually requires of the course, computed rather than asserted.
 *
 * WHY THE ARITHMETIC IS IN CODE AND NOT IN A SENTENCE. The hour and item numbers below could all
 * have been written as constants with a citation beside each one. They are computed instead,
 * because the interesting failures in this area are not wrong citations — they are numbers that
 * were right in isolation and did not add up together. A course can carry a correct 63, a correct
 * 60, a correct 3 and a correct 100 and still be non-compliant, and no amount of re-reading the
 * citations reveals it. Only doing the addition does. So the addition is done here, once, and the
 * Florida foundation test asserts the totals rather than trusting them.
 *
 * THE ONE PIECE OF ARITHMETIC THAT MATTERS MOST, WORKED IN FULL.
 *
 *   s. 475.17(2)(a)1, Fla. Stat. and Rule 61J2-3.008(1), F.A.C. both say the same thing: 63 hours
 *   of 50 minutes each, INCLUSIVE of examination. That is 3,150 minutes for everything.
 *
 *   The Commission's own syllabus, page 2, splits it: "the overall course is 60-hours of
 *   instruction with 3-hour end-of-course examination."
 *
 *   Those two statements only reconcile if the syllabus's "hour" is the rule's 50-minute hour, and
 *   read that way they reconcile exactly: 60 x 50 = 3,000 minutes of instruction, 3 x 50 = 150
 *   minutes of examination, 3,150 minutes in total, which is 63 x 50 with nothing left over. Read
 *   the examination as three CLOCK hours instead and the course becomes 3,180 minutes, which is
 *   63.6 fifty-minute hours and breaches the statutory ceiling that says the course "shall not
 *   exceed" 63. The 50-minute reading is not a preference; it is the only reading under which the
 *   Commission's syllabus and the Legislature's cap can both be true.
 *
 * WHAT FLORIDA DOES NOT DECIDE, AND WHAT THAT LEAVES TO STATECOURSE. The syllabus allocates no
 * hours to any of its nineteen sections. Its instruction is "Allocate your time based upon the
 * complexity of the material." So the per-section hour budget is StateCourse's design decision —
 * and, under Rule 61J2-3.008(4)(b)3.e, StateCourse's burden to prove: the school "must present
 * evidence by means of an objective study that the stated course hours are consistent with actual
 * hours required to complete the course." No allocation appears in this file for that reason. An
 * allocation invented before the curriculum exists is exactly the assertion that rule forbids, and
 * writing one down now would mean the time study was reverse-engineered to match it later.
 *
 * WHAT IS DELIBERATELY NOT CARRIED ACROSS FROM ANOTHER STATE. Nothing here is derived from
 * California's or Texas's timing, assessment design, or progression rules. Florida's 70% pass mark,
 * its 30-day retake wait, its one-retake-per-year cap, its 8-hour absence ceiling, its ban on hint,
 * back and retry, and its requirement that examination order NOT follow course order are all
 * Florida-specific and several of them differ from both neighbours. Where a number here happens to
 * match another state's, it is because Florida says so, not because a pattern was reused.
 */

import MANIFEST from "./regulatory-manifest.mjs";
import ASSESSMENT_ARCHITECTURE from "./assessment-architecture.mjs";

const COURSE = MANIFEST.PROGRAMS[0];

/* ── time ─────────────────────────────────────────────────────────────────────────────────────
   Everything derives from two numbers Florida fixes — 63 hours, 50 minutes to the hour — and the
   syllabus's 60/3 split. Nothing below is typed twice. */

const MINUTES_PER_HOUR = COURSE.hourIsMinutes;          // 50 — Rule 61J2-3.008(1), F.A.C.
const TOTAL_HOURS = COURSE.totalHours;                  // 63 — s. 475.17(2)(a)1, Fla. Stat.
const INSTRUCTION_HOURS = COURSE.instructionHours;      // 60 — FREC Course I syllabus, p. 2
const EXAMINATION_HOURS = COURSE.examinationHours;      //  3 — FREC Course I syllabus, p. 2

export const TIME = Object.freeze({
  minutesPerHour: MINUTES_PER_HOUR,
  totalHours: TOTAL_HOURS,
  instructionHours: INSTRUCTION_HOURS,
  examinationHours: EXAMINATION_HOURS,

  totalMinutes: TOTAL_HOURS * MINUTES_PER_HOUR,                 // 3150
  instructionMinutes: INSTRUCTION_HOURS * MINUTES_PER_HOUR,     // 3000
  examinationMinutes: EXAMINATION_HOURS * MINUTES_PER_HOUR,     //  150

  /* The reconciliation itself, exposed so a test can assert it rather than a reader having to
     trust the comment above. True only under the 50-minute reading of the syllabus's hours. */
  splitReconciles:
    INSTRUCTION_HOURS * MINUTES_PER_HOUR + EXAMINATION_HOURS * MINUTES_PER_HOUR
    === TOTAL_HOURS * MINUTES_PER_HOUR,

  /* Rule 61J2-3.008(4)(b)3.2: a 50-minute distance hour is the equivalent of a 50-minute classroom
     hour, and 3.1 requires distance study "on a classroom hour per classroom hour basis". Online
     delivery therefore buys no discount on time; it is the same 3,150 minutes. */
  distanceHourEqualsClassroomHour: true,

  /* s. 475.17(2)(a)1, Fla. Stat. carries an eight-classroom-hour absence ceiling. It is not a
     permission for an asynchronous learner to omit eight hours: Rule 61J2-3.008(4)(b)3.i separately
     bars the final until every syllabus session is satisfactorily completed. StateCourse therefore
     requires 100% session completion and asks only how DBPR wants the classroom-language measured
     or reported for asynchronous delivery. */
  maximumAbsenceHours: 8,
  absenceMeasurementInDistanceCourseSettled: false,
  allSyllabusSessionsRequired: true,

  /* Rule 61J2-3.008(4)(b)3.d: the submission must include a detailed course time-line, and the
     school must make that timeline available to students BEFORE they enrol. Not after payment. */
  timelinePublishedBeforeEnrolment: true,

  /* Rule 61J2-3.008(4)(b)3.e. The obligation that shapes the whole build: the hours StateCourse
     states must be shown, by objective study, to be the hours the course actually takes. */
  objectiveTimeStudyRequired: true,
  objectiveTimeStudyHeld: false,

  /* Deliberately absent: any per-section hour allocation. See the module docstring. */
  perSectionHoursPrescribedByFlorida: false,
});

/* ── assessment ───────────────────────────────────────────────────────────────────────────────
   Moved out. The examination requirements now live in config/florida/assessment-architecture.mjs,
   which separates what Florida CONFIRMS from what StateCourse CHOOSES from what remains an OPEN
   question for DBPR. That separation is the whole point and could not survive in a flat object: the
   first version of this file carried a single `plannedItemCount: 126` with no way for a later reader
   to see that 126 was a judgement rather than a rule. ASSESSMENT below is a flattened convenience
   view over the three tiers, and every value it exposes carries its tier alongside it.

   Consumers that care about the difference — and the assessment engine will — should import
   assessment-architecture.mjs directly rather than reading these flattened values. */

const CONFIRMED = ASSESSMENT_ARCHITECTURE.REGULATORY_MINIMUM_CONFIRMED;
const POLICY = ASSESSMENT_ARCHITECTURE.STATECOURSE_CONSERVATIVE_POLICY;

export const ASSESSMENT = Object.freeze({
  /* confirmed by primary authority */
  passingScorePercent: CONFIRMED.passingScorePercent.value,
  regulatoryMinimumItems: null,
  itemCountCandidates: ASSESSMENT_ARCHITECTURE.ITEM_COUNT_QUESTION.candidates,
  itemCountSettled: ASSESSMENT_ARCHITECTURE.ITEM_COUNT_QUESTION.settled,
  regulatoryMinimumFormCount: CONFIRMED.minimumFormCount.value,
  maximumCrossFormDuplicationPercent: CONFIRMED.maximumCrossFormDuplicationPercent.value,
  minimumApplicationLevelPercent: CONFIRMED.minimumApplicationLevelPercent.value,
  maximumKnowledgeLevelPercent: CONFIRMED.maximumKnowledgeLevelPercent.value,
  answerChoicesPerItem: CONFIRMED.answerChoicesPerItem.value,
  maximumMinutesPerItem: CONFIRMED.maximumMinutesPerItem.value,
  answerKeyUniquePerForm: CONFIRMED.answerKeyUniquePerForm.value,
  answerKeyCitesSourcePages: CONFIRMED.answerKeyCitesSourcePages.value,
  examinationOrderMustNotFollowCourseOrder: CONFIRMED.orderMustNotFollowCourseOrder.value,
  sufficientBankRequired: CONFIRMED.sufficientBankRequired.value,
  examinationAidsProhibited: CONFIRMED.aidsProhibited.value,
  allSyllabusSessionsRequiredBeforeExamination: CONFIRMED.allSessionsBeforeExamination.value,
  duplicationPreventionRequired: CONFIRMED.duplicationPreventionRequired.value,
  examinationMustBeTimed: CONFIRMED.examinationMustBeTimed.value,
  retakeWaitDays: CONFIRMED.retakeWaitDays.value,
  retakesPermittedWithinOneYear: CONFIRMED.retakesWithinOneYear.value,
  differentFormOnRetakeOrRepeat: CONFIRMED.differentFormOnRetakeOrRepeat.value,
  itemsMayNotReferToCourseMaterial: true,

  /* proctoring: NOT REQUIRED and NOT PROHIBITED — the difference decides what may be built */
  proctoringRequired: ASSESSMENT_ARCHITECTURE.PROCTORING.required,
  proctoringProhibited: ASSESSMENT_ARCHITECTURE.PROCTORING.prohibited,
  centralizedLocationRequired: false,
  proctoringAuthority: ASSESSMENT_ARCHITECTURE.PROCTORING.cite,

  /* StateCourse policy — NOT regulatory minima */
  plannedItemCount: POLICY.itemCount.value,
  plannedItemCountIsProviderPolicy: true,
  plannedFormCount: POLICY.formCount.value,
  plannedFormCountIsProviderPolicy: false,
  allottedMinutes: POLICY.allottedMinutes.value,

  /* computed */
  minutesPerItemAsPlanned: ASSESSMENT_ARCHITECTURE.COMPUTED.minutesPerItemAsPlanned,
  withinTimeCeiling: ASSESSMENT_ARCHITECTURE.COMPUTED.withinTimeCeilingAsPlanned,

  /* still unsettled */
  itemFloorSettledByRule: false,
  openQuestionIds: Object.freeze(ASSESSMENT_ARCHITECTURE.OPEN_DBPR_QUESTIONS.map((q) => q.id)),
});

/* ── periodic assessment during instruction ───────────────────────────────────────────────────
   Rule 61J2-3.008(4)(b)3.h requires the school to "describe the method of assessment of the
   student's performance periodically throughout the course of instruction". Florida requires that
   the assessment EXIST and be described. It does not prescribe its form, and in particular it
   nowhere requires written reflection, an essay, or a minimum character count. So the StateCourse
   product rule stands unchanged in Florida: periodic assessment is real and required, written
   reflection stays optional, and no artificial length minimum is imposed on anything a student
   writes. This is recorded here so that a later reading of "assessment" does not quietly import a
   requirement Florida never made. */
export const PERIODIC_ASSESSMENT = Object.freeze({
  required: true,
  mustBeDescribedInSubmission: true,
  formPrescribedByFlorida: false,
  writtenReflectionRequiredByAuthority: false,
  minimumCharacterCountRequiredByAuthority: false,
});

/* ── distance delivery ────────────────────────────────────────────────────────────────────────
   Rule 61J2-3.008(4)(b)3, sub-items 1-3 and a-j, and s. 475.451(9). Each entry is an obligation the
   school carries, phrased as what must be true rather than as a topic. `held` is what StateCourse
   can demonstrate today; every one is false because no Florida course exists yet. */
const obligation = (record) => Object.freeze({ held: false, ...record });

export const DISTANCE_DELIVERY = Object.freeze([
  obligation({ id: "hour-per-hour", cite: "61J2-3.008(4)(b)3.1", requirement: "Distance learning study is offered on a classroom hour per classroom hour basis." }),
  obligation({ id: "interactive", cite: "61J2-3.008(4)(b)3.2", requirement: "The course is interactive and provides for the interchange of information between the student and the instructor." }),
  obligation({ id: "registration-evaluation-monitoring-verification", cite: "61J2-3.008(4)(b)3.2", requirement: "The course provides for registration, evaluation, monitoring and verification of pre-license education." }),
  obligation({ id: "not-correspondence", cite: "61J2-3.008(4)(b)3.3", requirement: "The pre-licence course is not offered by correspondence methods, except by reason of a hardship defined by rule." }),
  obligation({ id: "equivalent-competency", cite: "61J2-3.008(4)(b)3.3", requirement: "The school demonstrates that distance students acquire knowledge, skills and competencies at least equivalent to classroom students." }),
  obligation({ id: "technical-processes-work", cite: "61J2-3.008(4)(b)3.a", requirement: "The technical processes used to deliver the course operate correctly and support the instructional strategies used." }),
  obligation({ id: "continuity-plan", cite: "61J2-3.008(4)(b)3.b", requirement: "Alternative plans exist for uninterrupted learner services and technical support if the primary system fails." }),
  obligation({ id: "identity-verification", cite: "61J2-3.008(4)(b)3.c", requirement: "Policies and technical processes verify and document student identity at enrolment, during course participation, and at course completion — all three, not only at sign-up." }),
  obligation({ id: "published-timeline", cite: "61J2-3.008(4)(b)3.d", requirement: "A detailed course timeline is submitted and made available to students prior to enrolment." }),
  obligation({ id: "objective-time-study", cite: "61J2-3.008(4)(b)3.e", requirement: "An objective study evidences that the stated course hours match the hours the course actually takes." }),
  obligation({ id: "examination-time-control", cite: "61J2-3.008(4)(b)3.f", requirement: "An objective method ensures students receive only the allotted time to complete the end-of-course examination, and that method is described in detail." }),
  obligation({ id: "instructor-availability", cite: "61J2-3.008(4)(b)3.g", requirement: "Permitted instructors and technical staff are available during normal business hours, and that availability is posted in a prominent location." }),
  obligation({ id: "syllabus-conformance-and-order", cite: "61J2-3.008(4)(b)3.h", requirement: "The course conforms to and follows the ORDER of the Course I syllabus, and carries learning objectives for each session." }),
  obligation({ id: "periodic-assessment-described", cite: "61J2-3.008(4)(b)3.h", requirement: "The method of assessing student performance periodically throughout instruction is described." }),
  obligation({ id: "no-examination-aids", cite: "61J2-3.008(4)(b)3.i", requirement: "The end-of-course examination offers no hint, back or retry function, and a reasonable method prevents duplication of it." }),
  obligation({ id: "gate-examination-on-completion", cite: "61J2-3.008(4)(b)3.i", requirement: "No student reaches the end-of-course examination without satisfactorily completing all sessions of the syllabus." }),
  obligation({ id: "student-certification-statement", cite: "61J2-3.008(4)(b)3.j", requirement: "The student submits the Commission's certification statement before taking the final examination." }),
  obligation({ id: "named-permitted-instructor", cite: "61J2-3.008(5)(b)", requirement: "Students are given the address, e-mail address and telephone number of a PERMITTED INSTRUCTOR registered with the school, and are told the times that instructor is available." }),
  obligation({ id: "standards-at-commencement", cite: "61J2-3.008(5)(a)", requirement: "Each student is informed of the standards and requirements at the commencement of the course." }),
  obligation({ id: "course-number-and-expiry-at-enrolment", cite: "61J2-3.008(4)(c)", requirement: "Students are notified of the course number and the course expiration date upon enrolment." }),
  obligation({ id: "anti-recruiting-statement", cite: "61J2-17.015(2)", requirement: "The Commission's anti-recruiting statement is posted and is read at the beginning of the course." }),
]);

/* ── statements Florida puts words in the school's mouth ──────────────────────────────────────
   Quoted exactly. Each is prescribed text, not a paraphrase, and a build that reworded any of them
   would be non-compliant however much better the rewording read. */

/** Rule 61J2-3.008(4)(b)3.j — the student submits this before taking the final examination. */
export const CERTIFICATION_STATEMENT =
  "I certify that I personally completed all assignments and have not duplicated any portion of the end-of-course examination prior to the taking of the final examination.";

/** Rule 61J2-17.015(2) — posted in every classroom and administrative area, and read at the
    beginning of each course. In an asynchronous course "posted" and "read at the beginning" have to
    be given real effect: a surface the student actually meets at course start, not a footer. */
export const ANTI_RECRUITING_STATEMENT =
  "Recruiting for employment opportunities for any real estate brokerage firm must be accomplished outside the prescribed instructional time. Noncompliance should be reported to the Commission.";

/** Rule 61J2-3.015(6)(f) — carried on every course completion certificate. */
export const COMPLETION_CERTIFICATE_STATEMENT =
  "The student named in this certificate has completed the referenced course in accordance with the requirements of the Florida Real Estate Commission. The original course completion certificate is to be given to the student and a copy retained by the school for a minimum of five (5) years following the date the course was completed.";

/* ── completion and records ───────────────────────────────────────────────────────────────────
   Rule 61J2-3.015 and s. 475.451(8), Fla. Stat. Note that Florida sets TWO different retention
   periods over two different sets of records, and a build that applied one to both would be wrong
   in one direction or the other. */
export const COMPLETION = Object.freeze({
  /* Rule 61J2-3.015(6)(a) — the fields, in the Commission's own order. */
  certificateFields: Object.freeze([
    "Name of School",
    "School License Number",
    "Address of School",
    "Course Title: Course I",
    "Course Number",
    "Start Date",
    "Finish Date",
    "Exam Date",
    "Student Name",
    "Student Address",
    "Authorized Signature for the School",
  ]),
  /* Rule 61J2-3.015(5) and (7) — electronic delivery to the student is expressly permitted, and the
     school's copy may be kept in any readily retrievable electronic or digital format. Florida does
     not force paper here, which matters for an online school. */
  electronicDeliveryToStudentPermitted: true,
  electronicRetentionPermitted: true,

  /* Rule 61J2-3.015(6)(f) — the school's copy of the completion certificate. */
  certificateRetentionYears: 5,
  /* s. 475.451(8), Fla. Stat. — registration records, course rosters, attendance records, a file
     copy of each examination and progress test, and all student answer sheets. A different set of
     records and a different period. */
  schoolRecordsRetentionYears: 3,
  schoolRecordsCovered: Object.freeze([
    "registration records",
    "course rosters",
    "attendance records",
    "a file copy of each examination and progress test",
    "all student answer sheets",
  ]),
  schoolRecordsProducibleToDepartment: true,

  /* Rule 61J2-3.015(1) — the certificate is what the candidate presents at the state examination.
     It is the course's actual output, which is why nothing about it may be decorative. */
  presentedAtStateExamination: true,
});

/* ── approval lifecycle ───────────────────────────────────────────────────────────────────────
   Rule 61J2-3.008(4)(b) and (4)(c). These are the dates that make a Florida course a maintained
   thing rather than a delivered one. */
export const APPROVAL_LIFECYCLE = Object.freeze({
  approvalPeriodMonths: 24,
  renewalWindowDaysBeforeExpiry: 120,
  renewalMustIncludeCourseMaterials: true,
  renewalMustIncludeEndOfCourseExaminations: true,
  renewalMustIncludeSummaryOfUpdates: true,
  gradingGraceDaysAfterExpiry: 15,
  studentsNotifiedOfCourseNumberAndExpiryAtEnrolment: true,
  significantChangeApprovalLeadDays: 60,
  /* Rule 61J2-3.008(4)(b): a primary school develops the material under its own name; a secondary
     school submits another school's material under authority of a letter from the primary school.
     StateCourse would file as a primary school, which sets the re-evaluation cadence: primary
     schools submit every new edition and in no event more than four years after original approval. */
  statecourseWouldFileAs: "primary school",
  primarySchoolMaximumYearsBetweenEvaluations: 4,
});

/* ── who does not have to take the course ─────────────────────────────────────────────────────
   Rule 61J2-3.008(8) and (9), and Rule 61J2-3.012. Recorded because an enrolment funnel that sells
   the course to somebody Florida exempts is not merely unhelpful; under s. 475.4511(2), Fla. Stat.
   the school's publicity has to rest on relevant facts. */
export const EXEMPTIONS = Object.freeze([
  Object.freeze({ cite: "61J2-3.008(8)", who: "An active member in good standing of The Florida Bar who is otherwise qualified under the real estate license law." }),
  Object.freeze({ cite: "61J2-3.008(9)", who: "An applicant holding a 4-year degree or higher in real estate from an accredited institution of higher education." }),
  Object.freeze({ cite: "61J2-3.012(1)", who: "A person who has satisfactorily completed real estate courses covering substantially the same subject matter, classroom hours and completion standards at an accredited institution or a Florida-registered real estate school." }),
]);

/* ── the questions Florida's own rules do not answer ──────────────────────────────────────────
   Kept here, next to the requirements, rather than in a document that gets read once. Each is a
   written question for FREC and none may be treated as settled by any downstream consumer. */
export const OPEN_QUESTIONS = Object.freeze([
  /* The examination questions live in assessment-architecture.mjs as OPEN_DBPR_QUESTIONS, together
     with the readings and the drafted letter. Referenced rather than restated so there is one
     place to answer them. */
  Object.freeze({
    id: "see-assessment-architecture",
    question: "The live school, instructor, item-count, location, asynchronous-delivery, reporting, form-identity and review-cycle questions are carried in config/florida/assessment-architecture.mjs.",
    cite: "Rule 61J2-3.008(4)(d), F.A.C.; current Education-page-linked DBPR RE 18",
    plannedPending: "see OPEN_DBPR_QUESTIONS and DRAFT_QUESTION_TO_DBPR",
  }),
  Object.freeze({
    id: "absence-in-a-distance-course",
    question: "How is the 8-classroom-hour absence ceiling measured in an asynchronous distance course, where there is no class to be absent from?",
    cite: "s. 475.17(2)(a)1, Fla. Stat.; Rule 61J2-3.008(4)(a), F.A.C.",
    plannedPending: "require satisfactory completion of every syllabus session; ask only how DBPR wants the separate eight-hour language measured or reported asynchronously",
  }),
  Object.freeze({
    id: "pre-licence-hardship",
    question: "Rule 61J2-3.008(4)(b)3.3 permits a pre-licence correspondence course 'by reason of a hardship as defined by rule', and s. 475.17(2)(a)3 requires the route to exist, but Rule 61J2-3.013 defines hardship only for post-licensing and reactivation education. What definition governs a pre-licence hardship request?",
    cite: "Rule 61J2-3.013, F.A.C.",
    plannedPending: "no hardship route is built or advertised until the definition is identified",
  }),
  Object.freeze({
    id: "posting-in-an-online-school",
    question: "Rule 61J2-17.015(2) requires the anti-recruiting statement to be posted 'in every classroom and administrative area' and read at the beginning of each course, and Rule 61J2-3.008(4)(b)3.g requires instructor availability to be 'posted in a prominent location'. What satisfies posting and reading for a school with no physical classroom?",
    cite: "Rules 61J2-17.015(2) and 61J2-3.008(4)(b)3.g, F.A.C.",
    plannedPending: "surface both at course start and in a persistent, reachable place in the course itself, not in a footer",
  }),
]);

export default Object.freeze({
  TIME,
  ASSESSMENT,
  PERIODIC_ASSESSMENT,
  DISTANCE_DELIVERY,
  COMPLETION,
  APPROVAL_LIFECYCLE,
  EXEMPTIONS,
  OPEN_QUESTIONS,
  CERTIFICATION_STATEMENT,
  ANTI_RECRUITING_STATEMENT,
  COMPLETION_CERTIFICATE_STATEMENT,
});
