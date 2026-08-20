/**
 * Pennsylvania salesperson prelicensing — course engine.
 *
 * ONE ENGINE, TWO COURSES, because 49 Pa. Code § 35.272(b)(2) names two by title: "Credits will be
 * allowed for Real Estate Fundamentals and Real Estate Practice and all acceptable basic real estate
 * courses" — and assigns hours to NEITHER.
 *
 * THE NUMBER THIS PROJECT HAD TO CORRECT, and it is the most important thing in this file.
 * § 35.272(a)(2) requires "four credits, or 60 hours of instruction, in basic real estate courses."
 * § 35.201: "Credit — A period of 15 hours of instruction."
 * § 35.358(b)(1): "A prelicensure course must be assigned one credit for every 15 clock hours."
 *
 *   THE REGULATORY MINIMUM IS 60 HOURS / 4 CREDITS. IT IS NOT 75.
 *
 * The 75-hour figure in general circulation is the two named courses as providers commonly deliver them
 * — Fundamentals at 30 (2 credits) and Practice at 45 (3 credits) — which EXCEEDS the minimum by one
 * credit. This engine therefore asserts BOTH: that the delivered total is 75 / 5 credits, and that it
 * satisfies the 60 / 4 minimum with margin. The 30/45 split is recorded as a StateCourse decision
 * requiring Commission confirmation, NOT as a regulatory requirement, and a test asserts that the
 * payload keeps the two apart.
 *
 * TWO SUBMISSION GATES, BOTH IN § 35.358 AND BOTH UNSATISFIED IN THIS BUILD:
 *   (a)(2) "Instruction in a Commission required course shall conform to the content or the outline
 *          developed by the Commission for the course." THE COMMISSION'S OUTLINE WAS NOT OBTAINED.
 *   (a)(4) A distance education course "must have the delivery method approved by the Association of
 *          Real Estate License Law Officials or another certifying body with similar approval standards
 *          approved by the Commission." NO SUCH APPROVAL IS HELD.
 * SUBMISSION_GATES carries both into the payload so they travel with the course.
 *
 * A PENNSYLVANIA CLOCK HOUR. § 35.358(a)(1): "a clock hour is defined as a 60-minute period comprising
 * 50 minutes of instruction and a 10-minute break." Missouri's structure, not Maine's. The same
 * subsection caps instructor-led learning at 7.5 clock hours per day and forbids requiring attendance
 * for more than 90 consecutive minutes without a break.
 *
 * GRADING IS PROCTORED AND THE THRESHOLDS ARE NOT THE COMMISSION'S. § 35.358(b)(2): "A prelicensure
 * course must be graded by proctored examination." Chapter 35 prescribes NO in-module assessment and NO
 * in-module passing score, and — unlike Maine, Wisconsin, Missouri, Oklahoma and North Carolina — it
 * prescribes NO PASSING PERCENTAGE FOR THE COURSE EXAMINATION EITHER. So every percentage in this file
 * is a StateCourse standard, and the payload says so explicitly rather than leaving a reader to assume
 * a regulator set them.
 *
 * THE EDUCATION EXPIRES, AND THE ANCHOR IS UNUSUAL. § 35.272(b)(3): "Courses shall have been completed
 * within 10 years prior to the date of SUCCESSFUL COMPLETION OF THE LICENSING EXAMINATION." Not the
 * application, not the licence issue. pennsylvaniaEducationValidity computes it against that anchor.
 *
 * ATTENDANCE. § 35.358(a)(3) sets 80% physical presence for a classroom prelicensure course "unless the
 * course is taught by means of distance education" — and the text read states NO equivalent distance
 * standard. This engine therefore asserts none: attendanceMet is an input the provider sets under
 * whatever standard the Commission approves, and CLASSROOM_ATTENDANCE_PERCENT is recorded as applying
 * to classroom delivery only.
 *
 * WHAT WAS NOT READ. 49 Pa. Code Chapter 35 was read in full on 2026-08-20, current through 56 Pa.B.
 * 3438 (June 6, 2026). NOT obtained: the Real Estate Licensing and Registration Act (63 P.S.
 * §§ 455.101—455.902); 68 Pa.C.S. Chapter 73; the Commission's course content outlines; the verbatim
 * text of the §§ 35.336—35.339 consumer disclosure summaries; the itemised disclosures in § 35.335a;
 * the Pennsylvania Landlord and Tenant Act; the realty transfer tax statutes; the Municipalities
 * Planning Code; ARELLO's standards; any Commission examination content outline or candidate handbook;
 * USPAP; and TILA, RESPA, TRID, ECOA and the federal Fair Housing Act. Every RELRA citation in this file
 * is THE REGULATION'S citation, reproduced so a reader knows where to go — not a claim it was read.
 * UNREAD_SOURCES carries the list into the payload.
 *
 * Course version 1.0 submission draft — NOT APPROVED. No Pennsylvania prelicensing credit is available.
 */

import FUNDAMENTALS_BANK from "./pennsylvania/fundamentals-30-question-bank.mjs";
import PRACTICE_BANK from "./pennsylvania/practice-45-question-bank.mjs";

/* The Commission's figures. */
const HOURS_PER_CREDIT = 15;                      /* § 35.201 and § 35.358(b)(1) */
const MINIMUM_CREDITS = 4;                        /* § 35.272(a)(2) */
const MINIMUM_HOURS = MINIMUM_CREDITS * HOURS_PER_CREDIT;  /* 60 — the regulation's floor */
const MINUTES_PER_CLOCK_HOUR = 60;                /* § 35.358(a)(1) */
const MAX_BREAK_MINUTES_PER_CLOCK_HOUR = 10;
const MIN_INSTRUCTION_MINUTES_PER_CLOCK_HOUR = MINUTES_PER_CLOCK_HOUR - MAX_BREAK_MINUTES_PER_CLOCK_HOUR;
const MAX_INSTRUCTOR_LED_CLOCK_HOURS_PER_DAY = 7.5;
const MAX_CONSECUTIVE_MINUTES_WITHOUT_BREAK = 90;
const CLASSROOM_ATTENDANCE_PERCENT = 80;          /* § 35.358(a)(3) — classroom delivery only */
const EDUCATION_VALIDITY_YEARS = 10;              /* § 35.272(b)(3) */
const MINIMUM_AGE = 18;                           /* § 35.272(a)(1) */
const TRANSCRIPT_DEADLINE_DAYS = 30;              /* § 35.359(a) */
const PROVIDER_RECORD_RETENTION_YEARS = 10;       /* § 35.360(e)(2) */
const PROVIDER_CE_RECORD_RETENTION_YEARS = 4;     /* § 35.360(e)(1) */
const BROKER_TRANSACTION_RETENTION_YEARS = 3;     /* § 35.286(a) */
const BROKER_NOTICE_RETENTION_MONTHS = 6;         /* § 35.286(a)(1)—(4) */
const ESCROW_DEPOSIT_DEADLINE = "the end of the next business day following receipt in the office where the escrow records are maintained"; /* § 35.324(a) */
const MAX_LISTING_PERIOD_YEARS = 1;               /* § 35.332(c)(1) */
const CONTINUING_EDUCATION_HOURS = 14;            /* § 35.384(a) */
const CONTINUING_EDUCATION_MIN_INCREMENT_HOURS = 2;
const BPO_SALESPERSON_ACTIVE_LICENCE_YEARS = 3;   /* § 35.501(d) */
const BPO_CONTINUING_EDUCATION_HOURS = 3;         /* § 35.503(c) */

/* StateCourse standards. Chapter 35 prescribes no in-module assessment, no in-module score, and — for a
   prelicensure course — no passing percentage at all. It prescribes only that grading be PROCTORED. */
const ENGAGEMENT_PASSING_PERCENT = 80;
const APPLIED_PASSING_PERCENT = 100;
const COURSE_EXAM_PASSING_PERCENT = 75;

const COURSES = Object.freeze({
  "pa-real-estate-fundamentals-30-v1": Object.freeze({
    courseId: "pa-real-estate-fundamentals-30-v1",
    title: "Real Estate Fundamentals",
    /* Named by title in § 35.272(b)(2). The rule assigns it no hours. */
    namedInRule: true,
    ruleCitation: "49 Pa. Code § 35.272(b)(2)",
    hours: 30,
    credits: 2,
    curriculumDir: "pennsylvania/pa-real-estate-fundamentals-30-v1/curriculum",
    bank: FUNDAMENTALS_BANK,
    modules: Object.freeze([
      { id: "module-01", sequence: 1, title: "Pennsylvania licensure and the regulatory framework", hours: 5 },
      { id: "module-02", sequence: 2, title: "Real property, estates and interests", hours: 5 },
      { id: "module-03", sequence: 3, title: "Legal descriptions, land use control and environmental considerations", hours: 5 },
      { id: "module-04", sequence: 4, title: "Transfer of title, deeds and recording", hours: 5 },
      { id: "module-05", sequence: 5, title: "Contracts — general principles", hours: 5 },
      { id: "module-06", sequence: 6, title: "Real estate finance and valuation fundamentals", hours: 5 }
    ].map((item) => Object.freeze(item)))
  }),
  "pa-real-estate-practice-45-v1": Object.freeze({
    courseId: "pa-real-estate-practice-45-v1",
    title: "Real Estate Practice",
    namedInRule: true,
    ruleCitation: "49 Pa. Code § 35.272(b)(2)",
    hours: 45,
    credits: 3,
    curriculumDir: "pennsylvania/pa-real-estate-practice-45-v1/curriculum",
    bank: PRACTICE_BANK,
    modules: Object.freeze([
      { id: "module-01", sequence: 1, title: "Duties owed to every consumer — § 35.292", hours: 5 },
      { id: "module-02", sequence: 2, title: "Permitted relationships — §§ 35.311 to 35.316", hours: 5 },
      { id: "module-03", sequence: 3, title: "Disclosure of business relationships — §§ 35.284, 35.336 to 35.339", hours: 5 },
      { id: "module-04", sequence: 4, title: "Written agreements and listing agreements — §§ 35.281, 35.331, 35.332", hours: 5 },
      { id: "module-05", sequence: 5, title: "Agreements of sale and statements of estimated cost — §§ 35.333, 35.334", hours: 5 },
      { id: "module-06", sequence: 6, title: "Escrow — §§ 35.321 to 35.328", hours: 5 },
      { id: "module-07", sequence: 7, title: "Seller disclosure and material defects — §§ 35.284a, 35.335a", hours: 5 },
      { id: "module-08", sequence: 8, title: "Advertising, solicitation and prohibited practices — §§ 35.282, 35.283, 35.288, 35.301 to 35.308", hours: 5 },
      { id: "module-09", sequence: 9, title: "Valuation products, property management, records and risk management", hours: 5 }
    ].map((item) => Object.freeze(item)))
  })
});

const COURSE_IDS = Object.freeze(Object.keys(COURSES));

/* The five permitted relationships. Recorded structurally because ONE OF THEM IS NOT AN AGENCY, and a
   payload that listed them without saying so would misdescribe Pennsylvania. */
const PERMITTED_RELATIONSHIPS = Object.freeze([
  { id: "sellers-agent", name: "Seller's agent", rule: "49 Pa. Code § 35.312", isAgency: true, owesLoyalty: true, confidentiality: "full, except that a licensee has a duty to reveal known material defects about the property" },
  { id: "buyers-agent", name: "Buyer's agent", rule: "49 Pa. Code § 35.313", isAgency: true, owesLoyalty: true, confidentiality: "full, as the rule states it" },
  { id: "dual-agent", name: "Dual agent", rule: "49 Pa. Code § 35.314", isAgency: true, owesLoyalty: false, confidentiality: "full, except that a licensee is required to disclose known material defects about the property" },
  { id: "designated-agent", name: "Designated agent", rule: "49 Pa. Code § 35.315", isAgency: true, owesLoyalty: true, confidentiality: "reasonable care that confidential information is not disclosed or used" },
  { id: "transaction-licensee", name: "Transaction licensee", rule: "49 Pa. Code § 35.316", isAgency: false, owesLoyalty: false, confidentiality: "LIMITED — three listed items only, and nothing else is protected" }
].map((item) => Object.freeze(item)));

/* § 35.316(2)(i)—(iii). Three items. That is the whole of "limited confidentiality." */
const TRANSACTION_LICENSEE_LIMITED_CONFIDENTIALITY = Object.freeze([
  "That the seller/landlord will accept a price less than the asking/listing price.",
  "That the buyer/tenant will pay a price greater than the price submitted in a written offer.",
  "That the seller/landlord or buyer/tenant will agree to financing terms other than those offered."
]);

const SUBMISSION_GATES = Object.freeze([
  { id: "commission-content-outline", rule: "49 Pa. Code § 35.358(a)(2)", requirement: "Instruction in a Commission required course shall conform to the content or the outline developed by the Commission for the course.", satisfied: false, blockedBy: "The Commission's content outlines for Real Estate Fundamentals and Real Estate Practice have not been obtained by this project. The curriculum is written from 49 Pa. Code Chapter 35 itself and must be conformed to the Commission's outline before submission." },
  { id: "arello-distance-approval", rule: "49 Pa. Code § 35.358(a)(4)", requirement: "Courses delivered by distance education must have the delivery method approved by the Association of Real Estate License Law Officials or another certifying body with similar approval standards approved by the Commission.", satisfied: false, blockedBy: "No ARELLO or equivalent distance-delivery approval is held. This is a precondition to the course counting at all." },
  { id: "provider-approval", rule: "49 Pa. Code § 35.341", requirement: "Approval of the real estate education provider by the Commission.", satisfied: false, blockedBy: "No Commission approval of a real estate education provider is recorded." },
  { id: "consumer-disclosure-summaries", rule: "49 Pa. Code §§ 35.336 to 35.339", requirement: "Delivery of the four consumer disclosure summaries in the Commission's own words.", satisfied: false, blockedBy: "The verbatim text of the disclosure summaries and of the § 35.339 oral disclosure has not been obtained. No document in this build reproduces, describes or paraphrases any of them." },
  { id: "seller-disclosure-itemisation", rule: "49 Pa. Code § 35.335a and 68 Pa.C.S. Chapter 73", requirement: "The itemised disclosures a seller property disclosure statement must contain, and the Seller Disclosure Law itself.", satisfied: false, blockedBy: "Neither the itemised disclosures in § 35.335a nor 68 Pa.C.S. Chapter 73 has been obtained. The definition of a material defect and the four denials WERE read and are transcribed in the curriculum." },
  { id: "course-hour-assignment", rule: "49 Pa. Code § 35.272(b)(2)", requirement: "The Commission's own hour assignment for Real Estate Fundamentals and Real Estate Practice.", satisfied: false, blockedBy: "The rule names both courses and assigns hours to neither. The 30/45 split delivered here is a StateCourse decision requiring Commission confirmation." }
].map((item) => Object.freeze(item)));

const UNREAD_SOURCES = Object.freeze([
  "The Real Estate Licensing and Registration Act, 63 P.S. §§ 455.101—455.902 (RELRA), including § 455.201, § 455.604, §§ 455.606.1—455.606f, § 455.608, § 455.608f and the Real Estate Recovery Fund provisions",
  "68 Pa.C.S. Chapter 73 — the Real Estate Seller Disclosure Law",
  "The Commission's content outlines for Real Estate Fundamentals and Real Estate Practice",
  "The verbatim text of the consumer disclosure summaries in §§ 35.336, 35.337 and 35.338, and the oral disclosure in § 35.339",
  "The itemised disclosures set out in § 35.335a",
  "The Pennsylvania Landlord and Tenant Act (68 P.S. § 250.101 et seq.), including section 511.2",
  "Pennsylvania's realty transfer tax statutes and every local transfer tax ordinance",
  "The Municipalities Planning Code and every local zoning, subdivision and building ordinance",
  "Pennsylvania's recording, intestacy, foreclosure, tax sale, adverse possession, mechanics' lien, condominium and planned community statutes",
  "Pennsylvania's Statute of Frauds",
  "ARELLO's distance education certification standards",
  "Any Commission examination content outline or candidate handbook, and any licensing examination passing score, item count or time limit",
  "USPAP, and any Pennsylvania appraiser statute or board rule",
  "TILA and Regulation Z; RESPA and Regulation X; TRID; ECOA; FCRA; the federal Fair Housing Act; and the federal lead-based paint regulations"
]);

/* ---- Import-time invariants ---- */

if (COURSE_IDS.length !== 2) {
  throw new Error(`Pennsylvania course engine: § 35.272(b)(2) names two courses; ${COURSE_IDS.length} are defined.`);
}

let deliveredHours = 0;
let deliveredCredits = 0;
for (const courseId of COURSE_IDS) {
  const course = COURSES[courseId];

  const moduleHours = course.modules.reduce((sum, module) => sum + module.hours, 0);
  if (moduleHours !== course.hours) {
    throw new Error(`Pennsylvania course engine: ${courseId} modules total ${moduleHours} hours; the course is ${course.hours}.`);
  }

  /* § 35.358(b)(1) — one credit for every 15 clock hours. A course whose hours do not divide cleanly
     cannot be assigned credits under the rule. */
  if (course.hours % HOURS_PER_CREDIT !== 0) {
    throw new Error(`Pennsylvania course engine: ${courseId} is ${course.hours} hours, which is not a whole number of ${HOURS_PER_CREDIT}-hour credits. § 35.358(b)(1) assigns one credit for every ${HOURS_PER_CREDIT} clock hours.`);
  }
  if (course.hours / HOURS_PER_CREDIT !== course.credits) {
    throw new Error(`Pennsylvania course engine: ${courseId} claims ${course.credits} credits for ${course.hours} hours; § 35.201 defines a credit as ${HOURS_PER_CREDIT} hours of instruction.`);
  }

  const sequences = course.modules.map((module) => module.sequence);
  if (new Set(sequences).size !== sequences.length) {
    throw new Error(`Pennsylvania course engine: ${courseId} has two modules claiming the same sequence position.`);
  }
  for (let position = 1; position <= course.modules.length; position += 1) {
    if (!sequences.includes(position)) throw new Error(`Pennsylvania course engine: ${courseId} sequence position ${position} is claimed by no module.`);
  }

  for (const module of course.modules) {
    const bank = course.bank[module.id];
    if (!bank) throw new Error(`Pennsylvania course engine: ${courseId} ${module.id} has no question bank.`);
    if (bank.hours !== module.hours) {
      throw new Error(`Pennsylvania course engine: ${courseId} ${module.id} bank claims ${bank.hours} hours; the module table says ${module.hours}.`);
    }
  }

  deliveredHours += course.hours;
  deliveredCredits += course.credits;
}

/* THE ASSERTION THAT MATTERS MOST IN THIS FILE. The delivered total must SATISFY the regulatory
   minimum — it need not equal it, and it does not. A build that silently dropped below 60 hours would
   put every student's examination eligibility at risk. */
if (deliveredHours < MINIMUM_HOURS) {
  throw new Error(`Pennsylvania course engine: the two courses total ${deliveredHours} hours, below the ${MINIMUM_HOURS} hours (${MINIMUM_CREDITS} credits) § 35.272(a)(2) requires.`);
}
if (deliveredCredits < MINIMUM_CREDITS) {
  throw new Error(`Pennsylvania course engine: the two courses total ${deliveredCredits} credits, below the ${MINIMUM_CREDITS} § 35.272(a)(2) requires.`);
}
if (deliveredHours !== deliveredCredits * HOURS_PER_CREDIT) {
  throw new Error(`Pennsylvania course engine: ${deliveredHours} hours and ${deliveredCredits} credits are inconsistent with § 35.201's ${HOURS_PER_CREDIT}-hour credit.`);
}

if (MIN_INSTRUCTION_MINUTES_PER_CLOCK_HOUR + MAX_BREAK_MINUTES_PER_CLOCK_HOUR !== MINUTES_PER_CLOCK_HOUR) {
  throw new Error("Pennsylvania course engine: the clock-hour arithmetic does not match § 35.358(a)(1).");
}

if (PERMITTED_RELATIONSHIPS.length !== 5) {
  throw new Error(`Pennsylvania course engine: §§ 35.312 to 35.316 name five permitted relationships; ${PERMITTED_RELATIONSHIPS.length} are recorded.`);
}
const nonAgency = PERMITTED_RELATIONSHIPS.filter((relationship) => !relationship.isAgency);
if (nonAgency.length !== 1 || nonAgency[0].id !== "transaction-licensee") {
  throw new Error("Pennsylvania course engine: exactly one permitted relationship — the transaction licensee — is not an agency. § 35.316(1): the licensee \"is not acting as an agent or advocate for the consumer.\"");
}
if (TRANSACTION_LICENSEE_LIMITED_CONFIDENTIALITY.length !== 3) {
  throw new Error("Pennsylvania course engine: § 35.316(2) lists exactly three items a transaction licensee may not disclose. Limited confidentiality is a list, not a standard.");
}

/* Every submission gate must say what blocks it. An unsatisfied gate with no reason is an unexplained
   obstruction, and a satisfied gate that still names a blocker is a contradiction. */
for (const gate of SUBMISSION_GATES) {
  if (!gate.satisfied && !gate.blockedBy) {
    throw new Error(`Pennsylvania course engine: submission gate ${gate.id} is unsatisfied and does not say what blocks it.`);
  }
  if (gate.satisfied && gate.blockedBy) {
    throw new Error(`Pennsylvania course engine: submission gate ${gate.id} is marked satisfied but still names a blocker.`);
  }
}

const PASSING_PERCENT = Object.freeze({
  applied: APPLIED_PASSING_PERCENT,
  engagement: ENGAGEMENT_PASSING_PERCENT,
  remediation: ENGAGEMENT_PASSING_PERCENT
});

const COURSE_EXAM = Object.freeze({
  id: "prelicensure-course-examination",
  proctored: true,
  proctoringIsRequiredByRule: true,
  /* § 35.358(b)(2) — the ONLY exception the rule states. */
  exceptionForHandicapOrDisability: "except when a student's handicap or disability would make grading by examination impractical",
  passingPercent: COURSE_EXAM_PASSING_PERCENT,
  /* Stated explicitly. Chapter 35 requires PROCTORED grading and prescribes NO percentage. */
  passingPercentIsCommissionFigure: false,
  ruleCitation: "49 Pa. Code § 35.358(b)(2)"
});

function hashKey(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

/* Deterministic per item id, so the presented order is stable for as long as the item exists and a
   recorded selection keeps its meaning permanently. Authoring puts the correct answer first; no student
   ever sees that order. */
function permuteChoices(choices, correctChoice, key) {
  const order = choices.map((_, index) => index);
  let seed = hashKey(key) || 1;
  for (let index = order.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 48271) + 11) >>> 0;
    const swap = seed % (index + 1);
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  return { choices: order.map((index) => choices[index]), correctChoice: order.indexOf(correctChoice) };
}

export function getPennsylvaniaCourse(courseId) {
  const course = COURSES[courseId];
  if (!course) return null;
  return Object.freeze({
    courseId: course.courseId,
    title: course.title,
    version: "1.0-submission-draft",
    state: "PA",
    regulator: "Pennsylvania State Real Estate Commission",
    hours: course.hours,
    credits: course.credits,
    hoursPerCredit: HOURS_PER_CREDIT,
    namedInRule: course.namedInRule,
    ruleCitation: course.ruleCitation,
    modules: course.modules,
    courseExam: COURSE_EXAM,
    minutesPerClockHour: MINUTES_PER_CLOCK_HOUR,
    minInstructionMinutesPerClockHour: MIN_INSTRUCTION_MINUTES_PER_CLOCK_HOUR,
    maxBreakMinutesPerClockHour: MAX_BREAK_MINUTES_PER_CLOCK_HOUR,
    maxInstructorLedClockHoursPerDay: MAX_INSTRUCTOR_LED_CLOCK_HOURS_PER_DAY,
    maxConsecutiveMinutesWithoutBreak: MAX_CONSECUTIVE_MINUTES_WITHOUT_BREAK,
    classroomAttendancePercent: CLASSROOM_ATTENDANCE_PERCENT,
    classroomAttendanceAppliesToDistanceEducation: false,
    permittedRelationships: PERMITTED_RELATIONSHIPS,
    transactionLicenseeLimitedConfidentiality: TRANSACTION_LICENSEE_LIMITED_CONFIDENTIALITY,
    submissionGates: SUBMISSION_GATES,
    unreadSources: UNREAD_SOURCES,
    /* What the Commission fixes. */
    commissionRequirements: Object.freeze([
      `§ 35.272(a)(2): an examination candidate must have successfully completed four credits, or ${MINIMUM_HOURS} hours of instruction, in basic real estate courses. THE REGULATORY MINIMUM IS ${MINIMUM_HOURS} HOURS, NOT 75.`,
      `§ 35.201: "Credit — A period of ${HOURS_PER_CREDIT} hours of instruction."`,
      `§ 35.358(b)(1): a prelicensure course must be assigned one credit for every ${HOURS_PER_CREDIT} clock hours of instruction.`,
      "§ 35.272(b)(2): credits will be allowed for Real Estate Fundamentals and Real Estate Practice and all acceptable basic real estate courses, when offered by an accredited college or a provider approved under § 35.341. The rule assigns hours to neither named course.",
      `§ 35.272(b)(3): courses shall have been completed within ${EDUCATION_VALIDITY_YEARS} years prior to the DATE OF SUCCESSFUL COMPLETION OF THE LICENSING EXAMINATION.`,
      `§ 35.272(a)(1): the candidate must be ${MINIMUM_AGE} years of age or older.`,
      `§ 35.358(a)(1): a clock hour is a ${MINUTES_PER_CLOCK_HOUR}-minute period comprising ${MIN_INSTRUCTION_MINUTES_PER_CLOCK_HOUR} minutes of instruction and a ${MAX_BREAK_MINUTES_PER_CLOCK_HOUR}-minute break; instructor-led learning may not exceed ${MAX_INSTRUCTOR_LED_CLOCK_HOURS_PER_DAY} clock hours per day; and a student may not be required to attend for more than ${MAX_CONSECUTIVE_MINUTES_WITHOUT_BREAK} consecutive minutes without a break.`,
      "§ 35.358(a)(2): instruction in a Commission required course shall conform to the content or the outline developed by the Commission for the course.",
      `§ 35.358(a)(3): unless taught by distance education, a student shall be physically present during at least ${CLASSROOM_ATTENDANCE_PERCENT} percent of the classroom instruction for a prelicensure course to receive credit, and the provider is responsible for verifying attendance.`,
      "§ 35.358(a)(4): a distance education course must have its delivery method approved by ARELLO or another certifying body with similar approval standards approved by the Commission.",
      "§ 35.358(b)(2): a prelicensure course must be graded by PROCTORED examination, except where a student's handicap or disability would make grading by examination impractical.",
      `§ 35.359(a): within ${TRANSCRIPT_DEADLINE_DAYS} days after a course has been taught, the provider shall give each student an official course transcript containing the § 35.360(a)(5) information and signed by the director.`,
      `§ 35.360(e): continuing education records must be maintained for ${PROVIDER_CE_RECORD_RETENTION_YEARS} years; all other provider records must be retained for ${PROVIDER_RECORD_RETENTION_YEARS} years.`,
      "§ 35.357: each student must enter into an enrolment agreement itemising tuition and fees, stating the refund policy, and containing the Bureau's toll-free telephone number, (800) 822-2113, for information about filing a complaint against the provider.",
      "§ 35.341: the Commission must approve the real estate education provider."
    ]),
    /* What this school decided. */
    stateCourseDecisions: Object.freeze([
      `Delivering ${deliveredHours} hours / ${deliveredCredits} credits across the two courses the rule names, which EXCEEDS the ${MINIMUM_HOURS}-hour / ${MINIMUM_CREDITS}-credit minimum by one credit.`,
      "The 30/45 split between Real Estate Fundamentals and Real Estate Practice. § 35.272(b)(2) names both courses and assigns hours to neither, so the split requires Commission confirmation.",
      "The grouping of 49 Pa. Code Chapter 35 into fifteen five-hour modules.",
      `The ${ENGAGEMENT_PASSING_PERCENT} percent in-module engagement threshold and the ${APPLIED_PASSING_PERCENT} percent applied threshold. Chapter 35 prescribes no in-module assessment and no in-module passing score.`,
      `The ${COURSE_EXAM_PASSING_PERCENT} percent course examination passing grade. § 35.358(b)(2) requires the examination to be PROCTORED and prescribes NO passing percentage — so unlike several other states in this project, every percentage in this build is a StateCourse standard.`
    ]),
    passingPercentages: Object.freeze({
      courseExamination: Object.freeze({ percent: COURSE_EXAM_PASSING_PERCENT, examination: "the provider's proctored prelicensure course examination", rule: "49 Pa. Code § 35.358(b)(2) requires proctored grading but prescribes no percentage", isCommissionFigure: false }),
      inModuleEngagement: Object.freeze({ percent: ENGAGEMENT_PASSING_PERCENT, examination: "in-module engagement and remediation checks", rule: null, isCommissionFigure: false }),
      inModuleApplied: Object.freeze({ percent: APPLIED_PASSING_PERCENT, examination: "in-module applied scenario", rule: null, isCommissionFigure: false })
    }),
    educationValidityYears: EDUCATION_VALIDITY_YEARS,
    minimumAge: MINIMUM_AGE,
    approvalStatus: "Not approved. No Pennsylvania prelicensing credit is available for this course. § 35.341 requires Commission approval of a real estate education provider, and § 35.358(a)(4) requires ARELLO or equivalent approval of a distance delivery method. Neither is held, and the submission gates recorded in submissionGates are unsatisfied."
  });
}

/* The two courses together, because § 35.272(a)(2) is satisfied by the PAIR and not by either alone. */
export function getPennsylvaniaProgram() {
  return Object.freeze({
    state: "PA",
    regulator: "Pennsylvania State Real Estate Commission",
    version: "1.0-submission-draft",
    courses: Object.freeze(COURSE_IDS.map((id) => getPennsylvaniaCourse(id))),
    deliveredHours,
    deliveredCredits,
    minimumHours: MINIMUM_HOURS,
    minimumCredits: MINIMUM_CREDITS,
    hoursPerCredit: HOURS_PER_CREDIT,
    exceedsMinimumBy: Object.freeze({ hours: deliveredHours - MINIMUM_HOURS, credits: deliveredCredits - MINIMUM_CREDITS }),
    minimumIsRegulatory: true,
    deliveredTotalIsStateCourseDecision: true,
    note: `§ 35.272(a)(2) requires four credits, or ${MINIMUM_HOURS} hours. These two courses deliver ${deliveredCredits} credits / ${deliveredHours} hours, exceeding the minimum by one credit. The 75-hour figure in general circulation is the two named courses as commonly delivered, NOT a regulatory requirement, and the 30/45 split requires Commission confirmation.`,
    submissionGates: SUBMISSION_GATES,
    unreadSources: UNREAD_SOURCES,
    approvalStatus: "Not approved. No Pennsylvania prelicensing credit is available."
  });
}

export function getPennsylvaniaModule(courseId, moduleId) {
  const course = COURSES[courseId];
  if (!course) return null;
  return course.modules.find((item) => item.id === moduleId) ?? null;
}

export function getPennsylvaniaAssessment(courseId, moduleId, kind = "engagement") {
  const course = COURSES[courseId];
  if (!course) return null;
  const module = getPennsylvaniaModule(courseId, moduleId);
  const bank = course.bank[moduleId];
  if (!module || !bank) return null;
  const authored = kind === "applied" ? [bank.applied] : bank[kind];
  if (!Array.isArray(authored) || !authored.length || authored.some((item) => !item)) return null;
  return {
    id: `${courseId}:${moduleId}-${kind}`,
    kind,
    courseId,
    moduleId,
    passingPercent: PASSING_PERCENT[kind],
    items: authored.map((item, index) => {
      const id = `${moduleId}-${kind}-${String(index + 1).padStart(2, "0")}`;
      const presented = permuteChoices(item.choices, item.correctChoice, `${courseId}:${id}`);
      return { id, prompt: item.prompt, choices: presented.choices, correctChoice: presented.correctChoice, rationale: item.rationale };
    })
  };
}

/* The only shape that reaches a student. § 35.358(b)(2)'s proctored examination is a separate event and
   these items are not it. */
export function publicPennsylvaniaAssessment(assessment) {
  if (!assessment) return null;
  return {
    id: assessment.id,
    kind: assessment.kind,
    courseId: assessment.courseId,
    moduleId: assessment.moduleId,
    passingPercent: assessment.passingPercent,
    items: assessment.items.map((item) => ({ id: item.id, prompt: item.prompt, choices: [...item.choices] }))
  };
}

export function scorePennsylvaniaAssessment(assessment, answers) {
  if (!assessment) return null;
  if (!Array.isArray(answers) || answers.length !== assessment.items.length) return null;
  const results = [];
  for (const [index, item] of assessment.items.entries()) {
    /* Number(null), Number(""), Number(false) and Number([]) are all 0, so a coerced read would silently
       record choice 0 — a selection the student never made — into a permanent record. */
    const raw = answers[index];
    const selectedChoice = typeof raw === "number"
      ? raw
      : (typeof raw === "string" && /^\d+$/.test(raw.trim()) ? Number(raw.trim()) : Number.NaN);
    if (!Number.isInteger(selectedChoice) || selectedChoice < 0 || selectedChoice >= item.choices.length) return null;
    results.push({ itemId: item.id, selectedChoice, correct: selectedChoice === item.correctChoice, rationale: item.rationale });
  }
  const correctCount = results.filter((result) => result.correct).length;
  const percent = Math.round((correctCount / results.length) * 100);
  return { results, correctCount, total: results.length, percent, passed: percent >= assessment.passingPercent };
}

/**
 * Credit for ONE course.
 *
 * § 35.358(b)(2) makes the proctored examination the graded event. § 35.358(a)(3) sets the classroom
 * attendance standard and makes the provider responsible for verifying it — and states no distance
 * equivalent, so attendanceMet is an input rather than something this engine computes.
 *
 * The transcript gate sits above both: § 35.359(a) requires an official transcript containing the
 * § 35.360(a)(5) information, which includes the provider's COMMISSION APPROVAL NUMBER and the statement
 * that the course will be accepted by the Commission towards the education requirement. Without an
 * approval there is no approval number, and so no conforming transcript can issue.
 */
export function pennsylvaniaCourseCredit(courseId, moduleStates = [], options = {}) {
  const course = COURSES[courseId];
  if (!course) return null;
  const { courseExamPercent = null, attendanceMet = false, approvalNumber = null } = options;

  const completed = new Set(
    moduleStates.filter((state) => state?.status === "completed").map((state) => state.module_id ?? state.moduleId)
  );
  const credited = course.modules.filter((module) => completed.has(module.id));
  const creditedHours = credited.reduce((sum, module) => sum + module.hours, 0);
  const allModulesComplete = credited.length === course.modules.length;

  const examPassed = typeof courseExamPercent === "number" && courseExamPercent >= COURSE_EXAM_PASSING_PERCENT;
  const unsatisfiedGates = SUBMISSION_GATES.filter((gate) => !gate.satisfied);
  const courseComplete = allModulesComplete && Boolean(attendanceMet) && examPassed;

  return {
    courseId,
    completedModules: credited.length,
    totalModules: course.modules.length,
    creditedHours,
    courseHours: course.hours,
    courseCredits: course.credits,
    creditedMinInstructionMinutes: creditedHours * MIN_INSTRUCTION_MINUTES_PER_CLOCK_HOUR,
    allModulesComplete,
    attendanceMet: Boolean(attendanceMet),
    courseExamPassed: examPassed,
    courseExamPassingPercent: COURSE_EXAM_PASSING_PERCENT,
    courseExamPassingPercentIsCommissionFigure: false,
    courseComplete,
    transcriptEligible: courseComplete && Boolean(approvalNumber) && unsatisfiedGates.length === 0,
    transcriptBlockedBy: (() => {
      if (!allModulesComplete) {
        return `${credited.length} of ${course.modules.length} modules complete (${creditedHours} of ${course.hours} hours).`;
      }
      if (!attendanceMet) {
        return "The attendance requirement has not been recorded as met. § 35.358(a)(3) makes the provider responsible for verifying student attendance.";
      }
      if (!examPassed) {
        return courseExamPercent === null
          ? "The prelicensure course examination has not been taken. § 35.358(b)(2) requires the course to be graded by PROCTORED examination."
          : `The proctored course examination was scored at ${courseExamPercent} percent, below the ${COURSE_EXAM_PASSING_PERCENT} percent this school requires. § 35.358(b)(2) prescribes proctoring and no percentage.`;
      }
      if (!approvalNumber) {
        return "No Commission approval number is recorded for this provider. § 35.359(a) and § 35.360(a)(5) require the official transcript to carry the provider's Commission approval number and to state that the course will be accepted towards the education requirement — neither of which can be true without an approval.";
      }
      if (unsatisfiedGates.length) {
        return `${unsatisfiedGates.length} submission gates are unsatisfied. The first is — ${unsatisfiedGates[0].rule}: ${unsatisfiedGates[0].blockedBy}`;
      }
      return null;
    })()
  };
}

/**
 * Examination eligibility, computed across BOTH courses, because § 35.272(a)(2) is satisfied by the
 * total and not by either course alone.
 *
 * Nothing here decides eligibility for anything — that is the Commission's. This reports what the
 * school's own records show against the figures § 35.272 states.
 */
export function pennsylvaniaEducationReadiness(courseCredits = [], options = {}) {
  const { age = null } = options;
  const byCourse = new Map();
  for (const record of courseCredits) {
    if (!record || !COURSES[record.courseId]) continue;
    if (record.courseComplete) byCourse.set(record.courseId, record);
  }

  const completedCourses = [...byCourse.values()];
  const hours = completedCourses.reduce((sum, record) => sum + COURSES[record.courseId].hours, 0);
  const credits = completedCourses.reduce((sum, record) => sum + COURSES[record.courseId].credits, 0);
  const meetsHourRequirement = credits >= MINIMUM_CREDITS && hours >= MINIMUM_HOURS;
  const ageMet = typeof age === "number" ? age >= MINIMUM_AGE : null;

  return {
    completedCourseIds: Object.freeze(completedCourses.map((record) => record.courseId)),
    completedHours: hours,
    completedCredits: credits,
    minimumHours: MINIMUM_HOURS,
    minimumCredits: MINIMUM_CREDITS,
    meetsHourRequirement,
    minimumAge: MINIMUM_AGE,
    ageMet,
    /* Stated so nobody reads a "true" here as an eligibility determination. */
    determinationIsTheCommissions: true,
    blockedBy: (() => {
      if (!meetsHourRequirement) {
        return `§ 35.272(a)(2) requires four credits, or ${MINIMUM_HOURS} hours of instruction. The school's records show ${credits} credits / ${hours} hours completed.`;
      }
      if (ageMet === false) {
        return `§ 35.272(a)(1) requires the candidate to be ${MINIMUM_AGE} years of age or older.`;
      }
      return null;
    })()
  };
}

/**
 * § 35.272(b)(3): "Courses shall have been completed within 10 years prior to the DATE OF SUCCESSFUL
 * COMPLETION OF THE LICENSING EXAMINATION."
 *
 * The anchor is the examination, not the application and not the licence. completedOn and
 * examinationDate are ISO date strings.
 */
export function pennsylvaniaEducationValidity(completedOn, examinationDate = null) {
  if (typeof completedOn !== "string") return null;
  const completed = new Date(completedOn);
  if (Number.isNaN(completed.valueOf())) return null;

  const expiresOn = new Date(completed);
  expiresOn.setFullYear(expiresOn.getFullYear() + EDUCATION_VALIDITY_YEARS);

  let withinWindow = null;
  let examination = null;
  if (typeof examinationDate === "string") {
    const parsed = new Date(examinationDate);
    if (!Number.isNaN(parsed.valueOf())) {
      examination = parsed;
      withinWindow = parsed <= expiresOn;
    }
  }

  return {
    completedOn: completed.toISOString().slice(0, 10),
    validityYears: EDUCATION_VALIDITY_YEARS,
    expiresOn: expiresOn.toISOString().slice(0, 10),
    examinationDate: examination ? examination.toISOString().slice(0, 10) : null,
    withinWindow,
    measuredTo: "the date of successful completion of the licensing examination — 49 Pa. Code § 35.272(b)(3)",
    blockedBy: withinWindow === false
      ? `The course was completed on ${completed.toISOString().slice(0, 10)}. Under § 35.272(b)(3) it counts only towards an examination successfully completed by ${expiresOn.toISOString().slice(0, 10)}.`
      : null
  };
}

export const PENNSYLVANIA_COURSE_IDS = COURSE_IDS;
export const PENNSYLVANIA_COURSES = COURSES;
export const PENNSYLVANIA_PERMITTED_RELATIONSHIPS = PERMITTED_RELATIONSHIPS;
export const PENNSYLVANIA_SUBMISSION_GATES = SUBMISSION_GATES;
export const PENNSYLVANIA_UNREAD_SOURCES = UNREAD_SOURCES;
export const PENNSYLVANIA_MINIMUM_HOURS = MINIMUM_HOURS;
export const PENNSYLVANIA_MINIMUM_CREDITS = MINIMUM_CREDITS;
export const PENNSYLVANIA_HOURS_PER_CREDIT = HOURS_PER_CREDIT;
export const PENNSYLVANIA_DELIVERED_HOURS = deliveredHours;
export const PENNSYLVANIA_DELIVERED_CREDITS = deliveredCredits;
export const PENNSYLVANIA_EDUCATION_VALIDITY_YEARS = EDUCATION_VALIDITY_YEARS;
export const PENNSYLVANIA_CLASSROOM_ATTENDANCE_PERCENT = CLASSROOM_ATTENDANCE_PERCENT;
export const PENNSYLVANIA_BROKER_TRANSACTION_RETENTION_YEARS = BROKER_TRANSACTION_RETENTION_YEARS;
export const PENNSYLVANIA_BROKER_NOTICE_RETENTION_MONTHS = BROKER_NOTICE_RETENTION_MONTHS;
export const PENNSYLVANIA_ESCROW_DEPOSIT_DEADLINE = ESCROW_DEPOSIT_DEADLINE;
export const PENNSYLVANIA_MAX_LISTING_PERIOD_YEARS = MAX_LISTING_PERIOD_YEARS;
export const PENNSYLVANIA_CONTINUING_EDUCATION_HOURS = CONTINUING_EDUCATION_HOURS;
export const PENNSYLVANIA_CONTINUING_EDUCATION_MIN_INCREMENT_HOURS = CONTINUING_EDUCATION_MIN_INCREMENT_HOURS;
export const PENNSYLVANIA_BPO_SALESPERSON_ACTIVE_LICENCE_YEARS = BPO_SALESPERSON_ACTIVE_LICENCE_YEARS;
export const PENNSYLVANIA_BPO_CONTINUING_EDUCATION_HOURS = BPO_CONTINUING_EDUCATION_HOURS;
