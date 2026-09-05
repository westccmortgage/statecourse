/**
 * Washington broker prelicensing — course engine.
 *
 * ONE ENGINE, TWO COURSES, because RCW 18.85.101(1)(c) names two: instruction "must include courses as
 * prescribed by the director including FUNDAMENTALS, which shall include THREE HOURS OF INSTRUCTION ON FAIR
 * HOUSING AND CONSUMER PROTECTION ISSUES, and PRACTICES." The current DOL prescribed curricula allocate
 * 60 clock hours to Fundamentals (Rev. 5/2022) and 30 to Practices (effective 03-18-2009).
 *
 * WASHINGTON LICENSES A BROKER, NOT A SALESPERSON. RCW 18.86.010(3): "'Broker' means broker, managing
 * broker, and designated broker, collectively." The payload uses Washington's own words.
 *
 * THE STATUTORY FAIR HOUSING BLOCK IS ASSERTED, NOT ASSUMED. RCW 18.85.101(1)(c) requires three hours on
 * fair housing and consumer protection INSIDE FUNDAMENTALS. This build delivers it as its own module at
 * exactly 3.0 hours so a reviewer can audit it in one place, and the invariants below throw if it is
 * missing, mis-sized, delivered outside Fundamentals, or split across modules.
 *
 * THE EXAMINATION SIZE IS SET BY RULE AND IT SCALES. WAC 308-124H-820(8): "Courses of 30 clock hours or
 * more ... must include a comprehensive examination(s) and answer key(s) of NO FEWER THAN THREE QUESTIONS
 * PER CLOCK HOUR with a MINIMUM OF 90 QUESTIONS, and a requirement of passing course grade of AT LEAST 70
 * PERCENT." So Fundamentals needs >= 180 items and Practices >= 90. The engine computes the requirement
 * from each course's hours rather than hard-coding it, so a change in hours changes the requirement.
 *
 * UNLIKE PENNSYLVANIA, THE PASSING GRADE HERE IS A REGULATOR FIGURE. 70 percent is the director's, stated
 * in WAC 308-124H-820(8). The 80 percent in-module engagement threshold is a StateCourse standard and the
 * payload labels each accordingly.
 *
 * A WASHINGTON CLOCK HOUR IS 50 MINUTES OF ACTUAL INSTRUCTION — WAC 308-124H-820(4). Note the difference
 * from Missouri, Oklahoma and Pennsylvania, where the rule describes a 60-minute PERIOD containing 50
 * minutes. Washington states the instruction time directly, so 90 clock hours is 4,500 minutes.
 *
 * THE EDUCATION WINDOW IS TWO YEARS AND ITS ANCHOR IS UNUSUAL. RCW 18.85.101(1)(c): "Each course must be
 * completed WITHIN TWO YEARS BEFORE APPLYING FOR THE BROKER'S LICENSE EXAMINATION." Not the licence
 * application, not the licence issue. washingtonEducationValidity computes it against that anchor.
 *
 * ATTENDANCE. The reviewed prelicensing and distance rules do not state an attendance percentage. The engine
 * therefore asserts NO attendance percentage: attendanceMet is a provider input.
 * (The distance-education criteria in WAC 308-124H-840 require the provider to show HOW it knows a student
 * completed the required clock hours, and require BOTH the school and the student to certify it in
 * writing — recorded in DISTANCE_EDUCATION_CRITERIA rather than converted into a number.)
 *
 * SOURCE BASELINE. The current DOL prescribed curricula, education forms, reciprocity guidance, fee schedule,
 * Chapters 308-124A and 308-124H WAC, and controlling statutes were reverified on 2026-09-04. Remaining
 * curriculum-level sources not yet incorporated are carried in UNREAD_SOURCES; see the regulatory manifest
 * for URL, authority class, retrieval date, pinpoint, evidence and PDF byte locks.
 *
 * Course version 1.0 submission draft — NOT APPROVED. No Washington clock hours are available.
 */

import FUNDAMENTALS_BANK from "./washington/fundamentals-60-question-bank.mjs";
import PRACTICES_BANK from "./washington/practices-30-question-bank.mjs";

/* The regulator's figures. */
const REQUIRED_TOTAL_HOURS = 90;                  /* RCW 18.85.101(1)(c) */
const STATUTORY_FAIR_HOUSING_HOURS = 3;           /* RCW 18.85.101(1)(c), inside fundamentals */
const MINUTES_PER_CLOCK_HOUR = 50;                /* WAC 308-124H-820(4) — actual instruction */
const MIN_COURSE_CLOCK_HOURS = 3;                 /* WAC 308-124H-820(4) */
const EXAM_THRESHOLD_CLOCK_HOURS = 30;            /* WAC 308-124H-820(8) — the rule applies at and above */
const EXAM_QUESTIONS_PER_CLOCK_HOUR = 3;          /* WAC 308-124H-820(8) */
const EXAM_MINIMUM_QUESTIONS = 90;                /* WAC 308-124H-820(8) — the floor */
const COURSE_EXAM_PASSING_PERCENT = 70;           /* WAC 308-124H-820(8) — the DIRECTOR'S figure */
const EDUCATION_VALIDITY_YEARS = 2;               /* RCW 18.85.101(1)(c) */
const MINIMUM_AGE = 18;                           /* RCW 18.85.101(1)(a) */
const HIGH_SCHOOL_DIPLOMA_REQUIRED = true;        /* RCW 18.85.101(1)(b) */
const FIRST_RENEWAL_HOURS = 90;                   /* RCW 18.85.101(2) */
const BUYER_SERVICES_AGREEMENT_DEFAULT_TERM_DAYS = 60;  /* RCW 18.86.020(2)(b)(i) */

/* StateCourse standards. Neither RCW 18.85.101 nor WAC 308-124H prescribes an in-module assessment or an
   in-module score. What IS prescribed is the comprehensive course examination above. */
const ENGAGEMENT_PASSING_PERCENT = 80;
const APPLIED_PASSING_PERCENT = 100;

/* WAC 308-124H-855 — the nine items a certificate of course completion must contain. Two of them are
   department-issued numbers, which is why no conforming certificate can issue without approval. */
const CERTIFICATE_REQUIRED_ITEMS = Object.freeze([
  "Student's name",
  "School's name and identification number issued by the department",
  "The course commencement date and completion date",
  "Course title",
  "Clock hours for the course",
  "School administrator's signature",
  "Course identification number issued by the department",
  "Instructor name and number",
  "Completion of a required examination, if applicable"
]);

/* WAC 308-124H-840 — what a distance education delivery method application must demonstrate. Recorded
   structurally because these are build requirements, not background. */
const DISTANCE_EDUCATION_CRITERIA = Object.freeze([
  { id: "learning-objectives", requirement: "Specify course learning objectives for each learning unit, covering the subject matter and relating to the practice of real estate, specific enough to ensure mastery.", satisfied: true },
  { id: "mastery-structure", requirement: "Divide the material into major learning units and modules, specify learning objectives for each, and specify an objective, quantitative criterion for mastery with a structured learning method.", satisfied: true },
  { id: "equivalent-content", requirement: "Demonstrate the same or reasonably similar informational content as a classroom course qualifying for the same clock hours, and how the provider will know the student completed the required clock hours.", satisfied: false, blockedBy: "The clock-hour completion mechanism has not been built or documented for submission." },
  { id: "interactive-events", requirement: "Describe consistent and regular interactive events supporting achievement of the stated learning objectives, identifying each and how it contributes.", satisfied: true },
  { id: "individual-remediation", requirement: "Provide a mechanism of individual remediation to correct deficiencies identified during instruction and assessment.", satisfied: true },
  { id: "progress-measurement", requirement: "Measure progress toward mastery at regular intervals; for computer-based instruction, include automatic shutdown after a period of inactivity.", satisfied: false, blockedBy: "Automatic shutdown after inactivity has not been implemented or documented." },
  { id: "instructor-availability", requirement: "Demonstrate that approved instructors are available to answer questions at reasonable times and by reasonable means.", satisfied: false, blockedBy: "No Washington-approved instructor is engaged for this build." },
  { id: "identity-security", requirement: "Demonstrate reasonable security that the student receiving credit is the student who enrolled and completed; both the school and the student must certify in writing that the student completed the course and the required clock hours.", satisfied: false, blockedBy: "No identity assurance mechanism and no dual written certification process is in place." },
  { id: "technology-description", requirement: "Provide a complete description of the hardware, software or other technology used by the provider and needed by the student.", satisfied: true }
].map((item) => Object.freeze(item)));

const COURSES = Object.freeze({
  "wa-real-estate-fundamentals-60-v1": Object.freeze({
    courseId: "wa-real-estate-fundamentals-60-v1",
    title: "Real Estate Fundamentals",
    namedInStatute: true,
    statuteCitation: "RCW 18.85.101(1)(c)",
    hours: 60,
    carriesStatutoryFairHousingBlock: true,
    curriculumDir: "washington/wa-real-estate-fundamentals-60-v1/curriculum",
    bank: FUNDAMENTALS_BANK,
    modules: Object.freeze([
      { id: "module-01", sequence: 1, title: "The Washington licensing framework, and the rules governing this course", hours: 5 },
      { id: "module-02", sequence: 2, title: "Real property, estates and interests", hours: 5 },
      { id: "module-03", sequence: 3, title: "Legal descriptions, encumbrances of record and land use control", hours: 5 },
      { id: "module-04", sequence: 4, title: "Transfer of title, deeds, recording and title assurance", hours: 5 },
      { id: "module-05", sequence: 5, title: "Contract law fundamentals", hours: 5 },
      { id: "module-06", sequence: 6, title: "Real estate finance I — instruments, parties and loan types", hours: 5 },
      { id: "module-07", sequence: 7, title: "Real estate finance II — lending practice and federal regulation", hours: 5 },
      { id: "module-08", sequence: 8, title: "Valuation and market analysis", hours: 5 },
      { id: "module-09", sequence: 9, title: "Fair housing and consumer protection", hours: 3, isStatutoryFairHousingBlock: true },
      { id: "module-10", sequence: 10, title: "Property management, leasing and landlord-tenant concepts", hours: 5 },
      { id: "module-11", sequence: 11, title: "Environmental issues and property condition", hours: 5 },
      { id: "module-12", sequence: 12, title: "Taxes, settlement statements and real estate mathematics", hours: 7 }
    ].map((item) => Object.freeze(item)))
  }),
  "wa-real-estate-practices-30-v1": Object.freeze({
    courseId: "wa-real-estate-practices-30-v1",
    title: "Real Estate Practices",
    namedInStatute: true,
    statuteCitation: "RCW 18.85.101(1)(c)",
    hours: 30,
    carriesStatutoryFairHousingBlock: false,
    curriculumDir: "washington/wa-real-estate-practices-30-v1/curriculum",
    bank: PRACTICES_BANK,
    modules: Object.freeze([
      { id: "module-01", sequence: 1, title: "Statutory duties under RCW 18.86 — the duties owed to everyone", hours: 5 },
      { id: "module-02", sequence: 2, title: "Agency relationships, services agreements and the pamphlet", hours: 5 },
      { id: "module-03", sequence: 3, title: "Limited dual agency, duration, imputed knowledge and vicarious liability", hours: 5 },
      { id: "module-04", sequence: 4, title: "Compensation — RCW 18.86.080", hours: 5 },
      { id: "module-05", sequence: 5, title: "Listing, marketing and advertising — including RCW 18.86.130", hours: 5 },
      { id: "module-06", sequence: 6, title: "Transaction practice, funds, records and risk management", hours: 5 }
    ].map((item) => Object.freeze(item)))
  })
});

const COURSE_IDS = Object.freeze(Object.keys(COURSES));

/* RCW 18.86 recognises three relationships and RCW 18.86.110 makes the duties STATUTORY, not fiduciary.
   Recorded structurally so a payload cannot present Washington as a common-law fiduciary state. */
const STATUTORY_RELATIONSHIPS = Object.freeze([
  { id: "sellers-agent", name: "Seller's agent", statute: "RCW 18.86.040", owesLoyalty: true, arisesBy: "appointment by the firm under a services agreement with the seller", confidentialityExceptions: "subpoena or court order only, and the duty survives termination" },
  { id: "buyers-agent", name: "Buyer's agent", statute: "RCW 18.86.050", owesLoyalty: true, arisesBy: "DEFAULT, from performing brokerage services for a buyer — RCW 18.86.020(1)", confidentialityExceptions: "subpoena or court order only, and the duty survives termination" },
  { id: "limited-dual-agent", name: "Limited dual agent", statute: "RCW 18.86.060", owesLoyalty: false, arisesBy: "written consent of both parties set forth in the services agreement, separately initialed", confidentialityExceptions: "subpoena or court order only, as to either party, and the duty survives termination" }
].map((item) => Object.freeze(item)));

/* RCW 18.86.030(1) — owed to the principal AND to all parties, and may not be waived. */
const UNWAIVABLE_DUTIES = Object.freeze([
  "To exercise reasonable skill and care",
  "To deal honestly and in good faith",
  "To present all written offers, written notices and other written communications to and from either party in a timely manner, regardless of whether the property is subject to an existing contract for sale or the buyer is already a party to an existing contract to purchase",
  "To disclose all existing material facts known by the broker and not apparent or readily ascertainable to a party, provided that this shall not be construed to imply any duty to investigate matters that the broker has not agreed to investigate",
  "To account in a timely manner for all money and property received from or on behalf of either party",
  "To provide a pamphlet in the form prescribed by RCW 18.86.120 and obtain an acknowledgment of receipt by the party",
  "To disclose in writing, before the broker's principal signs an offer, the broker's role in a separate paragraph titled \"Agency Disclosure\", and any terms of compensation offered by a party or a real estate firm to a real estate firm representing another party"
]);

const SUBMISSION_GATES = Object.freeze([
  { id: "department-prescribed-curriculum", rule: "WAC 308-124H-810; DOL Fundamentals Rev. 5/2022; DOL Practices effective 03-18-2009", requirement: "Use the most recent department-prescribed curricula and trace every required topic and objective to submitted materials.", satisfied: false, blockedBy: "Both current prescribed curricula are obtained and byte-locked, but the existing modules have not passed objective-level traceability. Practices has material gaps in business skills, valuation, negotiation, purchase agreements, finance/closing and math." },
  { id: "course-hour-allocation", rule: "DOL prescribed curricula", requirement: "Deliver the prescribed 60-hour Real Estate Fundamentals and 30-hour Real Estate Practices courses.", satisfied: true },
  { id: "fair-housing-curriculum", rule: "RCW 18.85.101(1)(c); DOL Fundamentals Rev. 5/2022", requirement: "Include three hours of fair housing and consumer-protection instruction within Fundamentals and align it to the prescribed Fundamentals objectives.", satisfied: false, blockedBy: "The build allocates three hours inside Fundamentals, but objective-level conformity to the current prescribed Fundamentals fair-housing section has not been signed off. No claim is made that this prelicense block is the separate WAC 308-124A-802 continuing-education course." },
  { id: "core-curriculum", rule: "WAC 308-124H-820(12)", requirement: "Do not claim that these two prelicense courses contain the separate prescribed CORE curriculum.", satisfied: true },
  { id: "course-approval", rule: "WAC 308-124H-805 and -820", requirement: "Department approval of the course for clock hours, including director-approved textbook or instructional materials kept accurate and current.", satisfied: false, blockedBy: "No Department course approval is recorded and no course identification number has been issued." },
  { id: "school-approval", rule: "WAC 308-124H-880", requirement: "Department approval of the school and the school administrator.", satisfied: false, blockedBy: "No Department school approval is recorded and no school identification number has been issued." },
  { id: "instructor-approval", rule: "WAC 308-124H-820(6) and -945", requirement: "An instructor approved to teach the topic area, available to respond to specific questions on an immediate or reasonably delayed basis.", satisfied: false, blockedBy: "No Washington-approved instructor is engaged for this build." },
  { id: "distance-delivery-approval", rule: "WAC 308-124H-840 and -845", requirement: "Approval of the distance education delivery method, or ARELLO certification with a clock hour enforcement mechanism in place.", satisfied: false, blockedBy: "No delivery method application has been submitted and no ARELLO certification is held. Four of the nine WAC 308-124H-840 criteria are unsatisfied." },
  { id: "comprehensive-examinations", rule: "WAC 308-124H-820(8)", requirement: "A comprehensive examination and answer key of no fewer than three questions per clock hour with a minimum of 90 questions, and a passing course grade of at least 70 percent, for each course of 30 clock hours or more.", satisfied: false, blockedBy: "The comprehensive examinations required by rule — at least 180 items for Fundamentals and at least 90 for Practices — have not been authored. The in-module banks are not those examinations." },
  { id: "pamphlet-text", rule: "RCW 18.86.030(1)(f) and 18.86.120", requirement: "Provision of the pamphlet in the form prescribed by RCW 18.86.120, with acknowledgment of receipt.", satisfied: false, blockedBy: "The current prescribed pamphlet text has not yet been incorporated as a controlled course artifact." },
  { id: "pvs-determination", rule: "RCW 28C.10.030; Washington Workforce Board current guidance", requirement: "Obtain a written Private Vocational School applicability determination before enrollment.", satisfied: false, blockedBy: "No blanket real-estate-school exemption was located and no written Workforce Board determination exists." },
  { id: "entity-and-ubi", rule: "RE-623-121 (R/12/25); WAC 308-124H-890", requirement: "Provide the legal entity record and 16-digit UBI/Business ID/Location ID accepted by DOL.", satisfied: false, blockedBy: "DOL has not confirmed whether the California distance-only LLC must foreign-register in Washington or which UBI record to submit." }
].map((item) => Object.freeze(item)));

const UNREAD_SOURCES = Object.freeze([
  "Objective-level primary-authority readings needed to support every learning objective in the two current DOL prescribed curricula",
  "The full text of the RCW 18.86.120 pamphlet",
  "RCW 64.06 and the Washington seller disclosure statement",
  "RCW 59.18, the Residential Landlord-Tenant Act, and the unlawful detainer statutes",
  "RCW 49.60, the Washington Law Against Discrimination, and the federal Fair Housing Act",
  "RCW 82.45 and every local real estate excise tax ordinance; Washington's property tax statutes",
  "RCW 61.24, the Deeds of Trust Act; Washington's recording, intestacy, community property, condominium, adverse possession and mechanics' lien statutes",
  "Washington's Growth Management Act and every local zoning, subdivision, critical areas and shoreline ordinance",
  "ARELLO's distance education certification standards",
  "Any Department examination content outline or candidate handbook, and any broker's license examination item count, passing score or time limit",
  "USPAP and Washington's appraiser licensing statutes and rules",
  "TILA and Regulation Z; RESPA and Regulation X; TRID; ECOA; and the federal lead-based paint regulations"
]);

/* WAC 308-124H-820(8) — computed from hours rather than hard-coded, so a change in hours changes the
   requirement. Courses below the 30-hour threshold carry no rule-imposed examination. */
function requiredExaminationItems(clockHours) {
  if (clockHours < EXAM_THRESHOLD_CLOCK_HOURS) return 0;
  return Math.max(EXAM_MINIMUM_QUESTIONS, clockHours * EXAM_QUESTIONS_PER_CLOCK_HOUR);
}

/* ---- Import-time invariants ---- */

if (COURSE_IDS.length !== 2) {
  throw new Error(`Washington course engine: RCW 18.85.101(1)(c) names two courses; ${COURSE_IDS.length} are defined.`);
}

let deliveredHours = 0;
let statutoryFairHousingHoursFound = 0;
let fairHousingModuleCount = 0;

for (const courseId of COURSE_IDS) {
  const course = COURSES[courseId];

  const moduleHours = course.modules.reduce((sum, module) => sum + module.hours, 0);
  if (moduleHours !== course.hours) {
    throw new Error(`Washington course engine: ${courseId} modules total ${moduleHours} hours; the course is ${course.hours}.`);
  }
  if (course.hours < MIN_COURSE_CLOCK_HOURS) {
    throw new Error(`Washington course engine: ${courseId} is ${course.hours} clock hours; WAC 308-124H-820(4) requires a minimum of ${MIN_COURSE_CLOCK_HOURS}.`);
  }

  const sequences = course.modules.map((module) => module.sequence);
  if (new Set(sequences).size !== sequences.length) {
    throw new Error(`Washington course engine: ${courseId} has two modules claiming the same sequence position.`);
  }
  for (let position = 1; position <= course.modules.length; position += 1) {
    if (!sequences.includes(position)) throw new Error(`Washington course engine: ${courseId} sequence position ${position} is claimed by no module.`);
  }

  for (const module of course.modules) {
    const bank = course.bank[module.id];
    if (!bank) throw new Error(`Washington course engine: ${courseId} ${module.id} has no question bank.`);
    if (bank.hours !== module.hours) {
      throw new Error(`Washington course engine: ${courseId} ${module.id} bank claims ${bank.hours} hours; the module table says ${module.hours}.`);
    }
    if (module.isStatutoryFairHousingBlock) {
      fairHousingModuleCount += 1;
      statutoryFairHousingHoursFound += module.hours;
      if (!course.carriesStatutoryFairHousingBlock) {
        throw new Error(`Washington course engine: ${courseId} ${module.id} is flagged as the statutory fair housing block, but the course is not the one RCW 18.85.101(1)(c) places it in.`);
      }
      if (bank.isStatutoryFairHousingBlock !== true) {
        throw new Error(`Washington course engine: ${courseId} ${module.id} is the statutory fair housing block in the module table but the bank does not say so.`);
      }
    }
  }

  deliveredHours += course.hours;
}

/* THE STATUTORY TOTAL. RCW 18.85.101(1)(c) fixes 90 hours exactly. */
if (deliveredHours !== REQUIRED_TOTAL_HOURS) {
  throw new Error(`Washington course engine: the two courses total ${deliveredHours} hours; RCW 18.85.101(1)(c) requires ${REQUIRED_TOTAL_HOURS} hours of instruction in real estate.`);
}

/* THE STATUTORY FAIR HOUSING BLOCK. Three hours, inside fundamentals, in ONE auditable place. */
if (fairHousingModuleCount !== 1) {
  throw new Error(`Washington course engine: the statutory fair housing and consumer protection block must be delivered as exactly one auditable module; ${fairHousingModuleCount} modules claim it.`);
}
if (statutoryFairHousingHoursFound !== STATUTORY_FAIR_HOUSING_HOURS) {
  throw new Error(`Washington course engine: the statutory fair housing and consumer protection block is ${statutoryFairHousingHoursFound} hours; RCW 18.85.101(1)(c) requires ${STATUTORY_FAIR_HOUSING_HOURS} hours of instruction on fair housing and consumer protection issues within fundamentals.`);
}
const fairHousingCourse = COURSE_IDS.find((id) => COURSES[id].carriesStatutoryFairHousingBlock);
if (!fairHousingCourse || COURSES[fairHousingCourse].title !== "Real Estate Fundamentals") {
  throw new Error("Washington course engine: RCW 18.85.101(1)(c) places the three-hour fair housing and consumer protection block inside FUNDAMENTALS.");
}

/* THE EXAMINATION REQUIREMENT. Assert the arithmetic of WAC 308-124H-820(8) itself, so a refactor cannot
   quietly drop below it. */
if (requiredExaminationItems(60) !== 180) {
  throw new Error("Washington course engine: WAC 308-124H-820(8) requires no fewer than three questions per clock hour, so a 60-hour course requires at least 180 items.");
}
if (requiredExaminationItems(30) !== 90) {
  throw new Error("Washington course engine: WAC 308-124H-820(8) sets a floor of 90 questions, which a 30-hour course meets exactly at three per clock hour.");
}
if (requiredExaminationItems(20) !== 0) {
  throw new Error("Washington course engine: WAC 308-124H-820(8) applies to courses of 30 clock hours or more.");
}

if (STATUTORY_RELATIONSHIPS.length !== 3) {
  throw new Error(`Washington course engine: RCW 18.86 recognises three relationships; ${STATUTORY_RELATIONSHIPS.length} are recorded.`);
}
const dual = STATUTORY_RELATIONSHIPS.find((relationship) => relationship.id === "limited-dual-agent");
if (!dual || dual.owesLoyalty !== false) {
  throw new Error("Washington course engine: RCW 18.86.060 does not name loyalty among a limited dual agent's duties. In its place stands the duty to take no action adverse or detrimental to either party.");
}
if (UNWAIVABLE_DUTIES.length !== 7) {
  throw new Error(`Washington course engine: RCW 18.86.030(1) lists seven duties owed to all parties; ${UNWAIVABLE_DUTIES.length} are recorded.`);
}
if (CERTIFICATE_REQUIRED_ITEMS.length !== 9) {
  throw new Error(`Washington course engine: WAC 308-124H-855 lists nine certificate items; ${CERTIFICATE_REQUIRED_ITEMS.length} are recorded.`);
}

for (const gate of SUBMISSION_GATES) {
  if (!gate.satisfied && !gate.blockedBy) {
    throw new Error(`Washington course engine: submission gate ${gate.id} is unsatisfied and does not say what blocks it.`);
  }
  if (gate.satisfied && gate.blockedBy) {
    throw new Error(`Washington course engine: submission gate ${gate.id} is marked satisfied but still names a blocker.`);
  }
}
for (const criterion of DISTANCE_EDUCATION_CRITERIA) {
  if (!criterion.satisfied && !criterion.blockedBy) {
    throw new Error(`Washington course engine: distance education criterion ${criterion.id} is unsatisfied and does not say what blocks it.`);
  }
}

/* The director's percentage and this school's must remain distinct. */
if (COURSE_EXAM_PASSING_PERCENT === ENGAGEMENT_PASSING_PERCENT) {
  throw new Error("Washington course engine: the director's course examination passing grade and this school's in-module engagement threshold are different figures for different purposes and must not be equal.");
}

const PASSING_PERCENT = Object.freeze({
  applied: APPLIED_PASSING_PERCENT,
  engagement: ENGAGEMENT_PASSING_PERCENT,
  remediation: ENGAGEMENT_PASSING_PERCENT
});

function hashKey(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

/* Deterministic per item id, so the presented order is stable for as long as the item exists and a recorded
   selection keeps its meaning permanently. Authoring puts the correct answer first; no student ever sees
   that order. */
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

export function getWashingtonCourse(courseId) {
  const course = COURSES[courseId];
  if (!course) return null;
  const examItems = requiredExaminationItems(course.hours);
  return Object.freeze({
    courseId: course.courseId,
    title: course.title,
    version: "1.0-submission-draft",
    state: "WA",
    regulator: "Washington State Department of Licensing",
    /* Washington's own word. The entry-level licence is a BROKER. */
    licenseTitle: "broker",
    hours: course.hours,
    minutesPerClockHour: MINUTES_PER_CLOCK_HOUR,
    instructionMinutes: course.hours * MINUTES_PER_CLOCK_HOUR,
    namedInStatute: course.namedInStatute,
    statuteCitation: course.statuteCitation,
    modules: course.modules,
    carriesStatutoryFairHousingBlock: course.carriesStatutoryFairHousingBlock,
    statutoryFairHousingHours: course.carriesStatutoryFairHousingBlock ? STATUTORY_FAIR_HOUSING_HOURS : 0,
    courseExamination: Object.freeze({
      requiredByRule: examItems > 0,
      ruleCitation: "WAC 308-124H-820(8)",
      minimumItems: examItems,
      questionsPerClockHour: EXAM_QUESTIONS_PER_CLOCK_HOUR,
      absoluteMinimumItems: EXAM_MINIMUM_QUESTIONS,
      passingPercent: COURSE_EXAM_PASSING_PERCENT,
      /* Unlike Pennsylvania, this IS the regulator's figure. */
      passingPercentIsRegulatorFigure: true,
      answerKeyRequired: true,
      essayKeyMustIdentifyMaterialAndPoints: true
    }),
    statutoryRelationships: STATUTORY_RELATIONSHIPS,
    unwaivableDuties: UNWAIVABLE_DUTIES,
    dutiesAreStatutoryNotFiduciary: true,
    certificateRequiredItems: CERTIFICATE_REQUIRED_ITEMS,
    distanceEducationCriteria: DISTANCE_EDUCATION_CRITERIA,
    submissionGates: SUBMISSION_GATES,
    unreadSources: UNREAD_SOURCES,
    /* What the regulator fixes. */
    regulatorRequirements: Object.freeze([
      `RCW 18.85.101(1)(c): the applicant must have successfully completed ${REQUIRED_TOTAL_HOURS} hours of instruction in real estate, including courses as prescribed by the director — fundamentals, which shall include ${STATUTORY_FAIR_HOUSING_HOURS} hours of instruction on fair housing and consumer protection issues, and practices.`,
      `RCW 18.85.101(1)(c): each course must be completed WITHIN ${EDUCATION_VALIDITY_YEARS} YEARS BEFORE APPLYING FOR THE BROKER'S LICENSE EXAMINATION, and be approved by the director.`,
      "RCW 18.85.101(1)(c): the applicant must pass a course examination, approved by the director, FOR EACH COURSE used to satisfy the requirement — separately from the broker's license examination in (1)(d).",
      `RCW 18.85.101(1)(a) and (b): the applicant must be ${MINIMUM_AGE} years of age or older and have a high school diploma or its equivalent.`,
      `RCW 18.85.101(2): the first renewal requires a further ${FIRST_RENEWAL_HOURS} hours as prescribed by the director, including real estate law with ${STATUTORY_FAIR_HOUSING_HOURS} hours on fair housing and consumer protection issues, advance practices, and continuing education.`,
      "RCW 18.85.101(3): the broker is licensed to one firm at a time and is supervised by a designated or managing broker.",
      `WAC 308-124H-820(4): a clock hour is a period of ${MINUTES_PER_CLOCK_HOUR} minutes of ACTUAL INSTRUCTION, and a course must have a minimum of ${MIN_COURSE_CLOCK_HOURS} hours.`,
      `WAC 308-124H-820(8): a course of ${EXAM_THRESHOLD_CLOCK_HOURS} clock hours or more must include a comprehensive examination and answer key of no fewer than ${EXAM_QUESTIONS_PER_CLOCK_HOUR} questions per clock hour with a minimum of ${EXAM_MINIMUM_QUESTIONS} questions, and a passing course grade of at least ${COURSE_EXAM_PASSING_PERCENT} percent.`,
      "WAC 308-124H-820(7): mechanical office and business skills, standardized software programs, orientation courses, motivation courses, courses serving other professions, personal finance and etiquette courses, and product promotion may not be approved for clock hours — and no clock hours are awarded for time devoted to meals or transportation.",
      "WAC 308-124H-820(9): the course must include textbook or instructional materials approved by the director, kept accurate and current.",
      "WAC 308-124H-810: an approved school must utilize the most recent course curriculum prescribed by the department, must include \"real estate\" in the course title, and may not use the eight prescribed core curricula phrases in other course titles.",
      "WAC 308-124H-830, -835 and -840: a distance education course must be interactive — expressly excluding courses that only provide passive delivery — and its delivery method must be approved, demonstrating mastery structure, individual remediation, progress measurement, automatic shutdown after inactivity, instructor availability, and identity security with written certification by both the school and the student.",
      "WAC 308-124H-845: ARELLO certification of the delivery method substitutes for the delivery method application, provided a clock hour enforcement mechanism is in place.",
      "WAC 308-124H-855: the certificate of course completion must contain nine items, two of which are department-issued identification numbers.",
      "RCW 18.86.110: the duties under chapter 18.86 RCW are STATUTORY duties and NOT fiduciary duties, and the chapter supersedes the common-law fiduciary duties of an agent to a principal.",
      "RCW 18.86.030(1): seven duties are owed to the broker's principal AND to all parties in a transaction, and they MAY NOT BE WAIVED.",
      `RCW 18.86.020(2)(b)(i): a buyer's services agreement carries a default term of ${BUYER_SERVICES_AGREEMENT_DEFAULT_TERM_DAYS} days with the option of a longer term.`,
      "RCW 18.86.080(7): to receive compensation for rendering brokerage services from any party or firm, a firm must have a services agreement containing the stated compensation terms — including, for a buyer, whether the broker will show properties where no party or firm is offering to compensate the firm.",
      "RCW 18.86.130: a broker may not market residential real estate to a limited or exclusive group of buyers or brokers unless it is concurrently marketed to the general public and all other brokers, except as reasonably necessary to protect health or safety."
    ]),
    /* What this school decided. */
    stateCourseDecisions: Object.freeze([
      `The module-level allocation of the DOL-prescribed ${COURSES["wa-real-estate-fundamentals-60-v1"].hours}/${COURSES["wa-real-estate-practices-30-v1"].hours} hours. DOL fixes each course total; StateCourse decides how those hours are distributed across modules.`,
      `Delivering the statutory ${STATUTORY_FAIR_HOUSING_HOURS}-hour fair housing and consumer protection block as its own auditable module rather than distributing it, so a reviewer can verify it in one place.`,
      "The grouping of RCW 18.85, RCW 18.86 and WAC 308-124H into eighteen modules.",
      `The ${ENGAGEMENT_PASSING_PERCENT} percent in-module engagement threshold and the ${APPLIED_PASSING_PERCENT} percent applied threshold. Neither RCW 18.85.101 nor WAC 308-124H prescribes an in-module assessment or an in-module score.`
    ]),
    passingPercentages: Object.freeze({
      courseExamination: Object.freeze({ percent: COURSE_EXAM_PASSING_PERCENT, examination: "the comprehensive course examination", rule: "WAC 308-124H-820(8)", isRegulatorFigure: true }),
      inModuleEngagement: Object.freeze({ percent: ENGAGEMENT_PASSING_PERCENT, examination: "in-module engagement and remediation checks", rule: null, isRegulatorFigure: false }),
      inModuleApplied: Object.freeze({ percent: APPLIED_PASSING_PERCENT, examination: "in-module applied scenario", rule: null, isRegulatorFigure: false })
    }),
    educationValidityYears: EDUCATION_VALIDITY_YEARS,
    minimumAge: MINIMUM_AGE,
    highSchoolDiplomaRequired: HIGH_SCHOOL_DIPLOMA_REQUIRED,
    approvalStatus: "Not approved. No Washington clock hours are available for this course. Current prescribed curricula have been obtained, but school, course, instructor and distance-method approvals are not held and objective-level curriculum conformity is incomplete."
  });
}

export function getWashingtonProgram() {
  return Object.freeze({
    state: "WA",
    regulator: "Washington State Department of Licensing",
    licenseTitle: "broker",
    version: "1.0-submission-draft",
    courses: Object.freeze(COURSE_IDS.map((id) => getWashingtonCourse(id))),
    deliveredHours,
    requiredHours: REQUIRED_TOTAL_HOURS,
    statutoryFairHousingHours: STATUTORY_FAIR_HOUSING_HOURS,
    minutesPerClockHour: MINUTES_PER_CLOCK_HOUR,
    instructionMinutes: deliveredHours * MINUTES_PER_CLOCK_HOUR,
    hourAllocationIsStateCourseDecision: false,
    totalRequiredExaminationItems: COURSE_IDS.reduce((sum, id) => sum + requiredExaminationItems(COURSES[id].hours), 0),
    note: `RCW 18.85.101(1)(c) requires ${REQUIRED_TOTAL_HOURS} hours; the current DOL prescribed curricula fix ${COURSES["wa-real-estate-fundamentals-60-v1"].hours} hours for Fundamentals and ${COURSES["wa-real-estate-practices-30-v1"].hours} hours for Practices. The statutory ${STATUTORY_FAIR_HOUSING_HOURS}-hour fair housing and consumer-protection block remains inside Fundamentals.`,
    submissionGates: SUBMISSION_GATES,
    unreadSources: UNREAD_SOURCES,
    approvalStatus: "Not approved. No Washington clock hours are available."
  });
}

export function getWashingtonModule(courseId, moduleId) {
  const course = COURSES[courseId];
  if (!course) return null;
  return course.modules.find((item) => item.id === moduleId) ?? null;
}

export function getWashingtonAssessment(courseId, moduleId, kind = "engagement") {
  const course = COURSES[courseId];
  if (!course) return null;
  const module = getWashingtonModule(courseId, moduleId);
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
    /* Stated on every assessment so nobody mistakes an in-module check for the rule's examination. */
    isTheComprehensiveCourseExamination: false,
    items: authored.map((item, index) => {
      const id = `${moduleId}-${kind}-${String(index + 1).padStart(2, "0")}`;
      const presented = permuteChoices(item.choices, item.correctChoice, `${courseId}:${id}`);
      return { id, prompt: item.prompt, choices: presented.choices, correctChoice: presented.correctChoice, rationale: item.rationale };
    })
  };
}

export function publicWashingtonAssessment(assessment) {
  if (!assessment) return null;
  return {
    id: assessment.id,
    kind: assessment.kind,
    courseId: assessment.courseId,
    moduleId: assessment.moduleId,
    passingPercent: assessment.passingPercent,
    isTheComprehensiveCourseExamination: assessment.isTheComprehensiveCourseExamination,
    items: assessment.items.map((item) => ({ id: item.id, prompt: item.prompt, choices: [...item.choices] }))
  };
}

export function scoreWashingtonAssessment(assessment, answers) {
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
 * The graded event is the comprehensive course examination WAC 308-124H-820(8) requires — at least three
 * questions per clock hour with a floor of 90, passed at at least 70 percent. RCW 18.85.101(1)(c)
 * separately requires that examination to be APPROVED BY THE DIRECTOR.
 *
 * The certificate gate sits above it: WAC 308-124H-855 requires the certificate to carry the SCHOOL'S and
 * the COURSE'S department-issued identification numbers. Without approval there are no such numbers, and so
 * no conforming certificate can issue.
 *
 * WAC 308-124H states no attendance percentage, and WAC 308-124 was not obtained, so attendanceMet is an
 * input the provider sets rather than a figure this engine asserts.
 */
export function washingtonCourseCredit(courseId, moduleStates = [], options = {}) {
  const course = COURSES[courseId];
  if (!course) return null;
  const {
    courseExamPercent = null,
    courseExamItemCount = null,
    attendanceMet = false,
    schoolIdentificationNumber = null,
    courseIdentificationNumber = null
  } = options;

  const completed = new Set(
    moduleStates.filter((state) => state?.status === "completed").map((state) => state.module_id ?? state.moduleId)
  );
  const credited = course.modules.filter((module) => completed.has(module.id));
  const creditedHours = credited.reduce((sum, module) => sum + module.hours, 0);
  const allModulesComplete = credited.length === course.modules.length;

  const requiredItems = requiredExaminationItems(course.hours);
  const examSizeSufficient = requiredItems === 0
    || (typeof courseExamItemCount === "number" && courseExamItemCount >= requiredItems);
  const examPassed = typeof courseExamPercent === "number" && courseExamPercent >= COURSE_EXAM_PASSING_PERCENT;

  const unsatisfiedGates = SUBMISSION_GATES.filter((gate) => !gate.satisfied);
  const courseComplete = allModulesComplete && Boolean(attendanceMet) && examSizeSufficient && examPassed;
  const hasBothNumbers = Boolean(schoolIdentificationNumber) && Boolean(courseIdentificationNumber);

  return {
    courseId,
    completedModules: credited.length,
    totalModules: course.modules.length,
    creditedClockHours: creditedHours,
    courseClockHours: course.hours,
    creditedInstructionMinutes: creditedHours * MINUTES_PER_CLOCK_HOUR,
    allModulesComplete,
    attendanceMet: Boolean(attendanceMet),
    requiredExaminationItems: requiredItems,
    courseExamItemCount,
    examSizeSufficient,
    courseExamPassed: examPassed,
    courseExamPassingPercent: COURSE_EXAM_PASSING_PERCENT,
    courseExamPassingPercentIsRegulatorFigure: true,
    courseComplete,
    certificateEligible: courseComplete && hasBothNumbers && unsatisfiedGates.length === 0,
    certificateBlockedBy: (() => {
      if (!allModulesComplete) {
        return `${credited.length} of ${course.modules.length} modules complete (${creditedHours} of ${course.hours} clock hours).`;
      }
      if (!attendanceMet) {
        return "The provider has not recorded the attendance requirement as met. WAC 308-124H states no attendance percentage and WAC 308-124 was not obtained for this build, so no standard is asserted here.";
      }
      if (!examSizeSufficient) {
        return courseExamItemCount === null
          ? `No comprehensive course examination has been recorded. WAC 308-124H-820(8) requires at least ${requiredItems} items for a ${course.hours}-clock-hour course.`
          : `The comprehensive course examination carried ${courseExamItemCount} items; WAC 308-124H-820(8) requires at least ${requiredItems} for a ${course.hours}-clock-hour course — no fewer than ${EXAM_QUESTIONS_PER_CLOCK_HOUR} per clock hour with a minimum of ${EXAM_MINIMUM_QUESTIONS}.`;
      }
      if (!examPassed) {
        return courseExamPercent === null
          ? "The comprehensive course examination has not been taken."
          : `The comprehensive course examination was scored at ${courseExamPercent} percent, below the ${COURSE_EXAM_PASSING_PERCENT} percent WAC 308-124H-820(8) requires.`;
      }
      if (!hasBothNumbers) {
        return "WAC 308-124H-855 requires the certificate of course completion to carry both the school's and the course's identification numbers issued by the department. Without approval there are no such numbers.";
      }
      if (unsatisfiedGates.length) {
        return `${unsatisfiedGates.length} submission gates are unsatisfied. The first is — ${unsatisfiedGates[0].rule}: ${unsatisfiedGates[0].blockedBy}`;
      }
      return null;
    })()
  };
}

/**
 * Examination readiness, computed across BOTH courses, because RCW 18.85.101(1)(c)'s 90 hours is satisfied
 * by the pair and not by either alone — and because the statute requires BOTH fundamentals AND practices.
 *
 * Nothing here decides eligibility for anything. That is the Department's. This reports what the school's
 * own records show against the figures RCW 18.85.101 states.
 */
export function washingtonEducationReadiness(courseCredits = [], options = {}) {
  const { age = null, highSchoolDiploma = null } = options;
  const byCourse = new Map();
  for (const record of courseCredits) {
    if (!record || !COURSES[record.courseId]) continue;
    if (record.courseComplete) byCourse.set(record.courseId, record);
  }

  const completed = [...byCourse.values()];
  const hours = completed.reduce((sum, record) => sum + COURSES[record.courseId].hours, 0);
  const fundamentalsComplete = completed.some((record) => COURSES[record.courseId].title === "Real Estate Fundamentals");
  const practicesComplete = completed.some((record) => COURSES[record.courseId].title === "Real Estate Practices");
  const meetsHourRequirement = hours >= REQUIRED_TOTAL_HOURS && fundamentalsComplete && practicesComplete;
  const ageMet = typeof age === "number" ? age >= MINIMUM_AGE : null;
  const diplomaMet = typeof highSchoolDiploma === "boolean" ? highSchoolDiploma : null;

  return {
    completedCourseIds: Object.freeze(completed.map((record) => record.courseId)),
    completedHours: hours,
    requiredHours: REQUIRED_TOTAL_HOURS,
    fundamentalsComplete,
    practicesComplete,
    meetsHourRequirement,
    minimumAge: MINIMUM_AGE,
    ageMet,
    highSchoolDiplomaRequired: HIGH_SCHOOL_DIPLOMA_REQUIRED,
    diplomaMet,
    determinationIsTheDepartments: true,
    blockedBy: (() => {
      if (!fundamentalsComplete || !practicesComplete) {
        const missing = [!fundamentalsComplete && "fundamentals", !practicesComplete && "practices"].filter(Boolean).join(" and ");
        return `RCW 18.85.101(1)(c) requires courses as prescribed by the director INCLUDING fundamentals and practices. The school's records show ${missing} not complete.`;
      }
      if (!meetsHourRequirement) {
        return `RCW 18.85.101(1)(c) requires ${REQUIRED_TOTAL_HOURS} hours of instruction in real estate. The school's records show ${hours} hours completed.`;
      }
      if (ageMet === false) return `RCW 18.85.101(1)(a) requires the applicant to be ${MINIMUM_AGE} years of age or older.`;
      if (diplomaMet === false) return "RCW 18.85.101(1)(b) requires a high school diploma or its equivalent.";
      return null;
    })()
  };
}

/**
 * RCW 18.85.101(1)(c): "Each course must be completed WITHIN TWO YEARS BEFORE APPLYING FOR THE BROKER'S
 * LICENSE EXAMINATION."
 *
 * The anchor is the APPLICATION TO SIT THE EXAMINATION — not the licence application and not the licence
 * issue. completedOn and examinationApplicationDate are ISO date strings.
 */
export function washingtonEducationValidity(completedOn, examinationApplicationDate = null) {
  if (typeof completedOn !== "string") return null;
  const completed = new Date(completedOn);
  if (Number.isNaN(completed.valueOf())) return null;

  const expiresOn = new Date(completed);
  expiresOn.setFullYear(expiresOn.getFullYear() + EDUCATION_VALIDITY_YEARS);

  let withinWindow = null;
  let application = null;
  if (typeof examinationApplicationDate === "string") {
    const parsed = new Date(examinationApplicationDate);
    if (!Number.isNaN(parsed.valueOf())) {
      application = parsed;
      withinWindow = parsed <= expiresOn;
    }
  }

  return {
    completedOn: completed.toISOString().slice(0, 10),
    validityYears: EDUCATION_VALIDITY_YEARS,
    expiresOn: expiresOn.toISOString().slice(0, 10),
    examinationApplicationDate: application ? application.toISOString().slice(0, 10) : null,
    withinWindow,
    measuredTo: "the date of applying for the broker's license examination — RCW 18.85.101(1)(c)",
    blockedBy: withinWindow === false
      ? `The course was completed on ${completed.toISOString().slice(0, 10)}. Under RCW 18.85.101(1)(c) it counts only towards an application to sit the broker's license examination made by ${expiresOn.toISOString().slice(0, 10)}.`
      : null
  };
}

export const WASHINGTON_COURSE_IDS = COURSE_IDS;
export const WASHINGTON_COURSES = COURSES;
export const WASHINGTON_STATUTORY_RELATIONSHIPS = STATUTORY_RELATIONSHIPS;
export const WASHINGTON_UNWAIVABLE_DUTIES = UNWAIVABLE_DUTIES;
export const WASHINGTON_CERTIFICATE_REQUIRED_ITEMS = CERTIFICATE_REQUIRED_ITEMS;
export const WASHINGTON_DISTANCE_EDUCATION_CRITERIA = DISTANCE_EDUCATION_CRITERIA;
export const WASHINGTON_SUBMISSION_GATES = SUBMISSION_GATES;
export const WASHINGTON_UNREAD_SOURCES = UNREAD_SOURCES;
export const WASHINGTON_REQUIRED_TOTAL_HOURS = REQUIRED_TOTAL_HOURS;
export const WASHINGTON_STATUTORY_FAIR_HOUSING_HOURS = STATUTORY_FAIR_HOUSING_HOURS;
export const WASHINGTON_MINUTES_PER_CLOCK_HOUR = MINUTES_PER_CLOCK_HOUR;
export const WASHINGTON_COURSE_EXAM_PASSING_PERCENT = COURSE_EXAM_PASSING_PERCENT;
export const WASHINGTON_EDUCATION_VALIDITY_YEARS = EDUCATION_VALIDITY_YEARS;
export const WASHINGTON_BUYER_SERVICES_AGREEMENT_DEFAULT_TERM_DAYS = BUYER_SERVICES_AGREEMENT_DEFAULT_TERM_DAYS;
export const washingtonRequiredExaminationItems = requiredExaminationItems;
