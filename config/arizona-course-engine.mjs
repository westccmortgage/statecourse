/**
 * Arizona salesperson prelicensing — course engine.
 *
 * ONE ENGINE, TWO COURSES, AND NINETY-SIX HOURS — NOT NINETY. A.R.S. § 32-2124(B) requires 90 hours of
 * prelicensure instruction. § 32-2124(L) then requires, "AFTER COMPLETING THE REQUIREMENTS OF SUBSECTION B
 * of this section," a further SIX HOURS OF INSTRUCTION IN REAL ESTATE CONTRACT LAW AND CONTRACT WRITING,
 * certified to the Department AT THE TIME OF APPLICATION. The six are a SEPARATE, ADDITIONAL requirement
 * and not a segment of the ninety. The invariants below assert 90 + 6 = 96 and refuse to let the six be
 * counted inside the ninety.
 *
 * TWENTY-SEVEN OF THE NINETY MAY NOT BE WAIVED, AND THE ENGINE ASSERTS EXACTLY THAT NUMBER. § 32-2124(B)'s
 * closing sentence permits the commissioner to waive the prelicensure course requirement for an
 * out-of-state licensee "OTHER THAN THE TWENTY-SEVEN-HOUR ARIZONA-SPECIFIC COURSE," and A.A.C.
 * R4-28-401(A)(2) repeats it. Modules 10 through 13 carry arizonaSpecific: true, and an invariant throws if
 * their hours do not total 27 — so an hour cannot drift out of the unwaivable block unnoticed.
 *
 * ARIZONA IS A FIDUCIARY STATE AND THE PAYLOAD RECORDS IT STRUCTURALLY. A.A.C. R4-28-1101(A): "A licensee
 * owes a FIDUCIARY DUTY to the client and shall protect and promote the client's interests. The licensee
 * shall also DEAL FAIRLY with all other parties to a transaction." This project has built courses for
 * Washington, whose statute provides its duties are statutory and NOT fiduciary, and for Oklahoma, which
 * abrogated the common-law fiduciary duties. dutiesAreFiduciary is true here and an invariant enforces it,
 * so a payload cannot present Arizona as a statutory-duty state.
 *
 * THE SIX HOURS ARE NOT A LECTURE, AND THE ENGINE WILL NOT CREDIT THEM AS ONE. § 32-2124(L): "This
 * instruction shall include PARTICIPATION BY THE APPLICANT IN DRAFTING CONTRACTS TO PURCHASE REAL PROPERTY,
 * LISTING AGREEMENTS AND LEASE AGREEMENTS." Three document types, all named in the statute. The engine
 * requires THREE RECORDED DRAFTS and arizonaCourseCredit returns courseComplete: false for the contract
 * writing course until all three are recorded, whatever the module states say.
 *
 * THE COURSE EXAMINATION IS PROCTORED IN PERSON AND ITS SCORE IS THE DEPARTMENT'S. A.A.C. R4-28-401(A)(1)
 * sets 75 PERCENT; § 32-2124(B) requires the examination be PROCTORED IN PERSON. The 80 percent in-module
 * engagement threshold and the 100 percent applied threshold are STATECOURSE STANDARDS, and the payload
 * labels each accordingly. A.A.C. R4-28-403(C) provides that qualifying to take or passing a licence
 * examination is NOT a waiver of the Commissioner's right to deny issuance — so passing is not a licence,
 * and no payload here says otherwise.
 *
 * EXAMINATION TIME IS NOT INSTRUCTION TIME. A.A.C. R4-28-404 excludes examination time from credit hours
 * and limits third-party recorded material to 20 PERCENT of instructional time. Both are recorded, and
 * unlike North Carolina — where the 3-hour examination sits INSIDE the 75 — Arizona's examination time sits
 * outside the hours entirely.
 *
 * THE TEN-YEAR WINDOW. § 32-2124(B) requires course work completed within the ten years immediately
 * preceding the application. arizonaEducationValidity computes against the APPLICATION date.
 *
 * WHAT WAS READ. A.R.S. §§ 32-2124 and 32-2135 at azleg.gov, and the 2026 ADRE Law Book at re.az.gov — 292
 * pages carrying A.R.S. Title 32 Chapter 20 and A.A.C. R4-28 — from which R4-28-401, -403, -404, -502,
 * -503, -701, -802, -803, -804, -1101, -1102 and -1103 are transcribed. All read 2026-08-20.
 *
 * WHAT WAS NOT READ. UNREAD_SOURCES carries the list into the payload, and the largest entry is the
 * Department's own PRESCRIBED PRELICENSURE COURSE CONTENT, which R4-28-401(D) says the Department will
 * provide on request and which § 32-2124(B) requires a course to follow. Conforming this build to it is the
 * first submission gate.
 *
 * Course version 1.0 submission draft — NOT APPROVED. No Arizona prelicensure credit is available.
 */

import PRELICENSE_BANK from "./arizona/prelicense-90-question-bank.mjs";
import CONTRACT_WRITING_BANK from "./arizona/contract-writing-6-question-bank.mjs";

/* The regulator's figures. */
const PRELICENSE_HOURS = 90;                       /* A.R.S. § 32-2124(B) */
const CONTRACT_WRITING_HOURS = 6;                  /* A.R.S. § 32-2124(L) */
const TOTAL_REQUIRED_HOURS = 96;                   /* (B) + (L), and (L) says "after completing (B)" */
const ARIZONA_SPECIFIC_UNWAIVABLE_HOURS = 27;      /* § 32-2124(B) closing sentence; A.A.C. R4-28-401(A)(2) */
const COURSE_EXAM_PASSING_PERCENT = 75;            /* A.A.C. R4-28-401(A)(1) — the DEPARTMENT'S figure */
const COURSE_EXAM_PROCTORED_IN_PERSON = true;      /* A.R.S. § 32-2124(B) */
const EDUCATION_VALIDITY_YEARS = 10;               /* A.R.S. § 32-2124(B) */
const MINIMUM_AGE = 18;                            /* A.R.S. § 32-2124(D) */
const RECORDED_MATERIAL_MAX_PERCENT = 20;          /* A.A.C. R4-28-404 — third-party recorded material */
const SCHOOL_RECORD_RETENTION_YEARS = 5;           /* A.A.C. R4-28-404 */
const EXAMINATION_TIME_COUNTS_AS_INSTRUCTION = false; /* A.A.C. R4-28-404 */
const PROPERTY_NEGOTIATION_UNAVAILABILITY_HOURS = 24; /* A.A.C. R4-28-1102(A) and (B) */
const COMPENSATION_SHARING_DISCLOSURE_DAYS = 3;    /* A.A.C. R4-28-701 — CALENDAR days before closing */
const RESCISSION_DAYS_UNIMPROVED_LOT = 7;          /* A.A.C. R4-28-804(A) — calendar, to midnight */
const RESCISSION_DAYS_TIMESHARE = 10;              /* A.A.C. R4-28-804(B) — calendar, to midnight */
const UNINSPECTED_LOT_INSPECTION_MONTHS = 6;       /* A.A.C. R4-28-804(A) */
const ACRE_MINIMUM_SQUARE_FEET = 43560;            /* A.A.C. R4-28-502(H) */

/* StateCourse standards. Neither § 32-2124 nor A.A.C. R4-28 prescribes an in-module assessment or an
   in-module score. What IS prescribed is the proctored course examination at 75 percent above. */
const ENGAGEMENT_PASSING_PERCENT = 80;
const APPLIED_PASSING_PERCENT = 100;

/* A.R.S. § 32-2124(L) — the three document types the statute names by name. Each requires the applicant's
   PARTICIPATION IN DRAFTING, so each is a recorded artefact and not a reading. */
const REQUIRED_DRAFTS = Object.freeze([
  { id: "purchase-contract", documentType: "Contracts to purchase real property", statute: "A.R.S. § 32-2124(L)", courseId: "az-contract-writing-6-v1", moduleId: "module-01" },
  { id: "listing-agreement", documentType: "Listing agreements", statute: "A.R.S. § 32-2124(L)", courseId: "az-contract-writing-6-v1", moduleId: "module-02" },
  { id: "lease-agreement", documentType: "Lease agreements", statute: "A.R.S. § 32-2124(L)", courseId: "az-contract-writing-6-v1", moduleId: "module-02" }
].map((item) => Object.freeze(item)));

/* A.A.C. R4-28-1101 — the duties, recorded subsection by subsection so a payload cannot blur them. */
const LICENSEE_DUTIES = Object.freeze([
  { subsection: "(A)", duty: "A licensee owes a FIDUCIARY DUTY to the client and shall protect and promote the client's interests. The licensee shall also DEAL FAIRLY with all other parties to a transaction.", owedTo: "client and all other parties" },
  { subsection: "(B)", duty: "Disclose IN WRITING to ALL OTHER PARTIES any information the licensee possesses that materially or adversely affects the consideration to be paid by any party — including that the seller or lessor is or may be unable to perform; that the buyer or lessee is, or may be, unable to perform; any known adverse material fact or material defect in the property; and the existence of a lien or encumbrance.", owedTo: "all other parties" },
  { subsection: "(C)", duty: "Expeditiously perform all acts required by the holding of a license, without delaying performance either intentionally OR THROUGH NEGLECT — and expeditiously notify the designated broker of any inability to perform.", owedTo: "the transaction and the designated broker" },
  { subsection: "(D)", duty: "Not allow a controversy with another licensee to jeopardize, delay or interfere with a transaction on behalf of a client — which does not oblige the licensee to alter compensation terms or relinquish the right to maintain an action.", owedTo: "client" },
  { subsection: "(E)", duty: "Disclose a present or prospective interest or conflict IN WRITING and BEFORE the parties enter any binding agreement — including that the licensee is acting as a principal; that the purchaser or seller is in the licensee's or the DESIGNATED BROKER'S immediate family; that the purchaser or seller has ownership in or is an employee of the licensee's employing broker; or that the licensee or their immediate family has a financial interest other than compensation for the real estate services.", owedTo: "all other parties" },
  { subsection: "(F)", duty: "Not accept compensation from, or represent, more than one party to a transaction without the PRIOR WRITTEN CONSENT of all parties.", owedTo: "all parties" },
  { subsection: "(G)", duty: "Not accept any compensation, including rebate or other consideration, directly or indirectly, for goods or services related to or resulting from a real estate transaction without that person's PRIOR WRITTEN ACKNOWLEDGEMENT — not applying to compensation paid to a broker by a broker who represents a party.", owedTo: "the person to whom the goods or services were provided" },
  { subsection: "(H)", duty: "Provide services conforming to the standards of practice and competence recognised in the professional community, and not undertake services outside the licensee's field of competence without engaging a competent person, unless the lack of expertise is disclosed to the client IN WRITING FIRST and the client SUBSEQUENTLY employs the licensee.", owedTo: "client" },
  { subsection: "(I)", duty: "Exercise reasonable care in ensuring that the licensee OBTAINS information material to a client's interests and relevant to the contemplated transaction, accurately communicates it, and takes reasonable steps to assist the client in confirming its accuracy.", owedTo: "client" },
  { subsection: "(J)", duty: "Not permit or facilitate access to or occupancy in a person's real property without PRIOR WRITTEN AUTHORIZATION FROM THE OWNER, and not deliver possession prior to closing unless expressly instructed by the owner of the property or property interest being transferred.", owedTo: "the owner" },
  { subsection: "(K)", duty: "Recommend to a client that the client seek appropriate counsel from INSURANCE, LEGAL, TAX AND ACCOUNTING professionals regarding the risks of pre-possession or post-possession of a property.", owedTo: "client" }
].map((item) => Object.freeze(item)));

const COURSES = Object.freeze({
  "az-salesperson-prelicense-90-v1": Object.freeze({
    courseId: "az-salesperson-prelicense-90-v1",
    title: "Real Estate Salesperson Prelicense",
    statuteCitation: "A.R.S. § 32-2124(B)",
    hours: PRELICENSE_HOURS,
    satisfiesSubsection: "B",
    carriesArizonaSpecificBlock: true,
    requiresDrafting: false,
    curriculumDir: "arizona/az-salesperson-prelicense-90-v1/curriculum",
    bank: PRELICENSE_BANK,
    modules: Object.freeze([
      { id: "module-01", sequence: 1, title: "Real property, ownership and interests", hours: 7, arizonaSpecific: false },
      { id: "module-02", sequence: 2, title: "Legal descriptions, encumbrances of record and land use control", hours: 7, arizonaSpecific: false },
      { id: "module-03", sequence: 3, title: "Transfer of title, deeds and recording", hours: 7, arizonaSpecific: false },
      { id: "module-04", sequence: 4, title: "Contract law principles", hours: 7, arizonaSpecific: false },
      { id: "module-05", sequence: 5, title: "Agency principles", hours: 7, arizonaSpecific: false },
      { id: "module-06", sequence: 6, title: "Real estate finance", hours: 7, arizonaSpecific: false },
      { id: "module-07", sequence: 7, title: "Valuation and market analysis", hours: 7, arizonaSpecific: false },
      { id: "module-08", sequence: 8, title: "Fair housing, environmental issues and property condition", hours: 7, arizonaSpecific: false },
      { id: "module-09", sequence: 9, title: "Property management, leasing and real estate mathematics", hours: 7, arizonaSpecific: false },
      { id: "module-10", sequence: 10, title: "Arizona real estate licensing and the Department", hours: 7, arizonaSpecific: true },
      { id: "module-11", sequence: 11, title: "Arizona licensee duties and conflicts", hours: 7, arizonaSpecific: true },
      { id: "module-12", sequence: 12, title: "Arizona broker supervision, employment and advertising", hours: 7, arizonaSpecific: true },
      { id: "module-13", sequence: 13, title: "Arizona documents, disclosures, rescission and public reports", hours: 6, arizonaSpecific: true }
    ].map((item) => Object.freeze(item)))
  }),
  "az-contract-writing-6-v1": Object.freeze({
    courseId: "az-contract-writing-6-v1",
    title: "Real Estate Contract Law and Contract Writing",
    statuteCitation: "A.R.S. § 32-2124(L)",
    hours: CONTRACT_WRITING_HOURS,
    satisfiesSubsection: "L",
    carriesArizonaSpecificBlock: false,
    requiresDrafting: true,
    curriculumDir: "arizona/az-contract-writing-6-v1/curriculum",
    bank: CONTRACT_WRITING_BANK,
    modules: Object.freeze([
      { id: "module-01", sequence: 1, title: "Contract law, and drafting a contract to purchase real property", hours: 3, arizonaSpecific: false },
      { id: "module-02", sequence: 2, title: "Drafting listing agreements and lease agreements", hours: 3, arizonaSpecific: false }
    ].map((item) => Object.freeze(item)))
  })
});

const COURSE_IDS = Object.freeze(Object.keys(COURSES));

const SUBMISSION_GATES = Object.freeze([
  { id: "department-prescribed-content", rule: "A.A.C. R4-28-401(D) and A.R.S. § 32-2124(B)", requirement: "The prelicensure course must follow the course content prescribed by the Department, which R4-28-401(D) provides the Department will furnish on request.", satisfied: false, blockedBy: "The Department's prescribed prelicensure course content has not been obtained. This build is written from A.R.S. §§ 32-2124 and 32-2135 and A.A.C. R4-28 and must be conformed to the Department's content before submission." },
  { id: "arizona-specific-content", rule: "A.R.S. § 32-2124(B) and A.A.C. R4-28-401(A)(2)", requirement: "The content of the 27-hour Arizona-specific course, which neither the statute nor the rule states.", satisfied: false, blockedBy: "No Department outline for the 27-hour Arizona-specific course has been obtained. Modules 10 through 13 are built from the statute and the rules read, and their conformity to the Department's own content is unverified." },
  { id: "school-approval", rule: "A.R.S. § 32-2135(A)", requirement: "Department certification of the real estate school.", satisfied: false, blockedBy: "No Department school certification is recorded and no school number has been issued." },
  { id: "course-approval", rule: "A.A.C. R4-28-404(B)", requirement: "Department approval of each course, on an application containing the matters the rule lists.", satisfied: false, blockedBy: "No Department course approval is recorded for either course." },
  { id: "instructor-approval", rule: "A.A.C. R4-28-404 and A.R.S. § 32-2135", requirement: "An instructor approved by the Department for the subject taught.", satisfied: false, blockedBy: "No Arizona-approved instructor is engaged for this build." },
  { id: "proctored-examination", rule: "A.R.S. § 32-2124(B) and A.A.C. R4-28-401(A)(1)", requirement: "A course examination PROCTORED IN PERSON, passed at 75 percent.", satisfied: false, blockedBy: "No in-person proctoring arrangement exists and the proctored course examinations have not been authored. The in-module banks are not those examinations." },
  { id: "weekly-examinations", rule: "A.A.C. R4-28-403", requirement: "Weekly examinations, reported as 'passed' or 'did not pass', with a candidate who did not pass shown the score and the relative score for each content area.", satisfied: false, blockedBy: "The weekly examination schedule and the content-area score reporting required for a candidate who did not pass have not been built." },
  { id: "certificate-of-attendance", rule: "A.R.S. § 32-2135(B)", requirement: "A certificate of course attendance issued by a certified school for an approved course.", satisfied: false, blockedBy: "Neither the school nor the courses are approved, so no certificate of course attendance can issue and no Arizona prelicensure credit is available." },
  { id: "enrolment-agreement", rule: "A.A.C. R4-28-404", requirement: "The enrolment agreement in the form the rule requires, including its bold-capitals provisions.", satisfied: false, blockedBy: "The conforming enrolment agreement has not been drafted for either course." },
  { id: "drafting-assessment", rule: "A.R.S. § 32-2124(L)", requirement: "Participation by the applicant in drafting contracts to purchase real property, listing agreements and lease agreements, with each draft assessed and recorded.", satisfied: false, blockedBy: "The drafting exercises are specified in the curriculum but the assessment rubric and the recording mechanism for the three drafts have not been built." },
  { id: "records-retention", rule: "A.A.C. R4-28-802(C), A.R.S. §§ 32-2151.01 and 32-2174", requirement: "The transaction records retention period, which R4-28-802(C) states its own list is 'in addition to'.", satisfied: false, blockedBy: "A.R.S. §§ 32-2151.01 and 32-2174 have not been read, so no transaction records retention period is stated anywhere in this build." }
].map((item) => Object.freeze(item)));

const UNREAD_SOURCES = Object.freeze([
  "The Department's PRESCRIBED PRELICENSURE COURSE CONTENT, which A.A.C. R4-28-401(D) says the Department will provide on request and which A.R.S. § 32-2124(B) requires a course to follow",
  "Any Department outline for the 27-hour Arizona-specific course, or for the six-hour contract law and contract writing course",
  "A.R.S. §§ 32-2151, 32-2151.01 and 32-2174 — Arizona's trust account and records-retention statutes, including every retention period",
  "A.R.S. § 32-2153 and every disciplinary ground, penalty, fine and sanction; the licence pre-determination statute",
  "Arizona's residential seller disclosure statutes and any statutory list of facts a licensee need not disclose",
  "The subdivided land, unsubdivided land and time-share statutes in A.R.S. Title 32 Chapter 20, including when a public report is required and what one contains",
  "Arizona's statute of frauds; its statutes on capacity, entity authority, trusts and probate; and its electronic transactions statute",
  "Arizona's residential and commercial landlord-tenant statutes in their entirety — including every deposit limit, return period, notice period, entry notice, habitability standard and eviction procedure",
  "Any Arizona statute or rule on listing agreement duration",
  "A.R.S. § 32-2101(2)'s definition of advertising, which A.A.C. R4-28-502(J) cites",
  "Any Arizona authority on the boundary between real estate practice and the unauthorised practice of law",
  "Any Department substantive policy statement, advisory or guidance document, and any Arizona case law",
  "Any Department form, approved contract, listing or lease form, examination content outline or candidate handbook, and any state examination item count, time limit or fee",
  "Arizona's fair housing statutes and the federal Fair Housing Act; RESPA, TILA, TRID and ECOA; and the federal lead-based paint regulations",
  "Arizona's appraisal licensing statutes and USPAP; Arizona's foreclosure, recording, community property, condominium, adverse possession and mechanics' lien statutes"
]);

/* ---- Import-time invariants ---- */

if (COURSE_IDS.length !== 2) {
  throw new Error(`Arizona course engine: A.R.S. § 32-2124 requires two separate courses — subsection (B)'s 90 hours and subsection (L)'s 6; ${COURSE_IDS.length} are defined.`);
}

let deliveredHours = 0;
let arizonaSpecificHours = 0;
let draftingCourseCount = 0;

for (const courseId of COURSE_IDS) {
  const course = COURSES[courseId];

  const moduleHours = course.modules.reduce((sum, module) => sum + module.hours, 0);
  if (moduleHours !== course.hours) {
    throw new Error(`Arizona course engine: ${courseId} modules total ${moduleHours} hours; the course is ${course.hours}.`);
  }

  const sequences = course.modules.map((module) => module.sequence);
  if (new Set(sequences).size !== sequences.length) {
    throw new Error(`Arizona course engine: ${courseId} has two modules claiming the same sequence position.`);
  }
  for (let position = 1; position <= course.modules.length; position += 1) {
    if (!sequences.includes(position)) throw new Error(`Arizona course engine: ${courseId} sequence position ${position} is claimed by no module.`);
  }

  for (const module of course.modules) {
    const bank = course.bank[module.id];
    if (!bank) throw new Error(`Arizona course engine: ${courseId} ${module.id} has no question bank.`);
    if (bank.hours !== module.hours) {
      throw new Error(`Arizona course engine: ${courseId} ${module.id} bank claims ${bank.hours} hours; the module table says ${module.hours}.`);
    }
    if (module.arizonaSpecific) {
      arizonaSpecificHours += module.hours;
      if (!course.carriesArizonaSpecificBlock) {
        throw new Error(`Arizona course engine: ${courseId} ${module.id} is flagged Arizona-specific, but the course is not the one § 32-2124(B) places the 27-hour block in.`);
      }
      if (bank.arizonaSpecific !== true) {
        throw new Error(`Arizona course engine: ${courseId} ${module.id} is Arizona-specific in the module table but the bank does not say so.`);
      }
    } else if (course.carriesArizonaSpecificBlock && bank.arizonaSpecific === true) {
      throw new Error(`Arizona course engine: ${courseId} ${module.id} claims to be Arizona-specific in the bank but not in the module table.`);
    }
  }

  if (course.requiresDrafting) draftingCourseCount += 1;
  deliveredHours += course.hours;
}

/* NINETY-SIX, AND THE SIX ARE NOT INSIDE THE NINETY. */
if (COURSES["az-salesperson-prelicense-90-v1"].hours !== PRELICENSE_HOURS) {
  throw new Error(`Arizona course engine: A.R.S. § 32-2124(B) requires ${PRELICENSE_HOURS} hours of prelicensure instruction.`);
}
if (COURSES["az-contract-writing-6-v1"].hours !== CONTRACT_WRITING_HOURS) {
  throw new Error(`Arizona course engine: A.R.S. § 32-2124(L) requires ${CONTRACT_WRITING_HOURS} hours of instruction in real estate contract law and contract writing.`);
}
if (PRELICENSE_HOURS + CONTRACT_WRITING_HOURS !== TOTAL_REQUIRED_HOURS) {
  throw new Error(`Arizona course engine: subsection (L) requires its hours AFTER the requirements of subsection (B), so the total is ${PRELICENSE_HOURS} + ${CONTRACT_WRITING_HOURS} = ${TOTAL_REQUIRED_HOURS}.`);
}
if (deliveredHours !== TOTAL_REQUIRED_HOURS) {
  throw new Error(`Arizona course engine: the two courses total ${deliveredHours} hours; A.R.S. § 32-2124(B) and (L) together require ${TOTAL_REQUIRED_HOURS}.`);
}

/* THE UNWAIVABLE 27. */
if (arizonaSpecificHours !== ARIZONA_SPECIFIC_UNWAIVABLE_HOURS) {
  throw new Error(`Arizona course engine: the Arizona-specific modules total ${arizonaSpecificHours} hours; A.R.S. § 32-2124(B) and A.A.C. R4-28-401(A)(2) name a ${ARIZONA_SPECIFIC_UNWAIVABLE_HOURS}-HOUR Arizona-specific course that may not be waived.`);
}
if (arizonaSpecificHours >= PRELICENSE_HOURS) {
  throw new Error("Arizona course engine: the Arizona-specific block is part of the 90 hours, not the whole of them.");
}

/* THE THREE DRAFTS. */
if (draftingCourseCount !== 1) {
  throw new Error(`Arizona course engine: A.R.S. § 32-2124(L) attaches the drafting requirement to the six-hour course alone; ${draftingCourseCount} courses claim it.`);
}
if (REQUIRED_DRAFTS.length !== 3) {
  throw new Error(`Arizona course engine: A.R.S. § 32-2124(L) names three document types — contracts to purchase real property, listing agreements and lease agreements; ${REQUIRED_DRAFTS.length} are recorded.`);
}
for (const draft of REQUIRED_DRAFTS) {
  const course = COURSES[draft.courseId];
  if (!course || !course.requiresDrafting) {
    throw new Error(`Arizona course engine: required draft ${draft.id} is attached to a course that does not carry the § 32-2124(L) drafting requirement.`);
  }
  if (!course.modules.some((module) => module.id === draft.moduleId)) {
    throw new Error(`Arizona course engine: required draft ${draft.id} names module ${draft.moduleId}, which does not exist in ${draft.courseId}.`);
  }
  const bank = course.bank[draft.moduleId];
  if (!bank || typeof bank.draftingExercise !== "string") {
    throw new Error(`Arizona course engine: ${draft.courseId} ${draft.moduleId} carries a required draft but its bank records no drafting exercise.`);
  }
}

/* THE FIDUCIARY STANDARD. R4-28-1101(A) is the first sentence of the duty rule and the payload records it
   structurally so Arizona cannot be presented as a statutory-duty state. */
if (LICENSEE_DUTIES.length !== 11) {
  throw new Error(`Arizona course engine: A.A.C. R4-28-1101 runs from (A) to (K) — eleven subsections; ${LICENSEE_DUTIES.length} are recorded.`);
}
const dutyA = LICENSEE_DUTIES.find((duty) => duty.subsection === "(A)");
if (!dutyA || !/FIDUCIARY DUTY/.test(dutyA.duty)) {
  throw new Error("Arizona course engine: A.A.C. R4-28-1101(A) states that a licensee owes a FIDUCIARY DUTY to the client. Arizona is not a statutory-duty state and no payload may present it as one.");
}
const dutyB = LICENSEE_DUTIES.find((duty) => duty.subsection === "(B)");
if (!dutyB || dutyB.owedTo !== "all other parties") {
  throw new Error("Arizona course engine: A.A.C. R4-28-1101(B) runs to ALL OTHER PARTIES, not to the client.");
}
const dutyI = LICENSEE_DUTIES.find((duty) => duty.subsection === "(I)");
if (!dutyI || !/OBTAINS/.test(dutyI.duty)) {
  throw new Error("Arizona course engine: A.A.C. R4-28-1101(I) is an AFFIRMATIVE duty to obtain information, unlike states whose statutes expressly remove any duty to investigate.");
}

/* Examination time is outside the hours — unlike North Carolina, where the exam sits inside the total. */
if (EXAMINATION_TIME_COUNTS_AS_INSTRUCTION !== false) {
  throw new Error("Arizona course engine: A.A.C. R4-28-404 excludes examination time from credit hours.");
}

/* The Department's percentage and this school's must remain distinct. */
if (COURSE_EXAM_PASSING_PERCENT === ENGAGEMENT_PASSING_PERCENT) {
  throw new Error("Arizona course engine: the Department's course examination passing score and this school's in-module engagement threshold are different figures for different purposes and must not be equal.");
}

/* The two rescission periods must stay distinct, and the seven-day right is not extended by the six-month
   inspection right — they are separate rights triggered by different facts. */
if (RESCISSION_DAYS_UNIMPROVED_LOT === RESCISSION_DAYS_TIMESHARE) {
  throw new Error("Arizona course engine: A.A.C. R4-28-804(A) and (B) state two DIFFERENT rescission periods — the seventh calendar day for an unimproved subdivided lot or unsubdivided land, and the tenth for a time-share interval.");
}

for (const gate of SUBMISSION_GATES) {
  if (!gate.satisfied && !gate.blockedBy) {
    throw new Error(`Arizona course engine: submission gate ${gate.id} is unsatisfied and does not say what blocks it.`);
  }
  if (gate.satisfied && gate.blockedBy) {
    throw new Error(`Arizona course engine: submission gate ${gate.id} is marked satisfied but still names a blocker.`);
  }
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

export function getArizonaCourse(courseId) {
  const course = COURSES[courseId];
  if (!course) return null;
  return Object.freeze({
    courseId: course.courseId,
    title: course.title,
    version: "1.0-submission-draft",
    state: "AZ",
    regulator: "Arizona Department of Real Estate",
    licenseTitle: "salesperson",
    hours: course.hours,
    statuteCitation: course.statuteCitation,
    satisfiesSubsection: course.satisfiesSubsection,
    isAdditionalToPrelicenseHours: course.satisfiesSubsection === "L",
    modules: course.modules,
    carriesArizonaSpecificBlock: course.carriesArizonaSpecificBlock,
    arizonaSpecificUnwaivableHours: course.carriesArizonaSpecificBlock ? ARIZONA_SPECIFIC_UNWAIVABLE_HOURS : 0,
    arizonaSpecificModuleIds: Object.freeze(course.modules.filter((module) => module.arizonaSpecific).map((module) => module.id)),
    requiresDrafting: course.requiresDrafting,
    requiredDrafts: course.requiresDrafting ? REQUIRED_DRAFTS : Object.freeze([]),
    courseExamination: Object.freeze({
      requiredByRule: true,
      ruleCitation: "A.R.S. § 32-2124(B) and A.A.C. R4-28-401(A)(1)",
      passingPercent: COURSE_EXAM_PASSING_PERCENT,
      passingPercentIsRegulatorFigure: true,
      proctoredInPerson: COURSE_EXAM_PROCTORED_IN_PERSON,
      /* A.A.C. R4-28-404 — examination time is NOT instruction time. */
      examinationTimeCountsAsInstruction: EXAMINATION_TIME_COUNTS_AS_INSTRUCTION,
      /* A.A.C. R4-28-403 — the Department states no item count and this build states none. */
      itemCountStatedByRegulator: false
    }),
    dutiesAreFiduciary: true,
    licenseeDuties: LICENSEE_DUTIES,
    submissionGates: SUBMISSION_GATES,
    unreadSources: UNREAD_SOURCES,
    /* What the regulator fixes. */
    regulatorRequirements: Object.freeze([
      `A.R.S. § 32-2124(B): ${PRELICENSE_HOURS} hours of prelicensure instruction, with a course examination PROCTORED IN PERSON, completed within the ${EDUCATION_VALIDITY_YEARS} years immediately preceding the application.`,
      `A.R.S. § 32-2124(B), closing sentence: the commissioner may waive all or a portion of the prelicensure course requirement, OTHER THAN THE ${ARIZONA_SPECIFIC_UNWAIVABLE_HOURS}-HOUR ARIZONA-SPECIFIC COURSE, for an applicant who holds a current real estate license in another state.`,
      `A.R.S. § 32-2124(L): after completing the requirements of subsection (B), ${CONTRACT_WRITING_HOURS} hours of instruction in real estate contract law and contract writing, certified to the department AT THE TIME OF APPLICATION — including PARTICIPATION BY THE APPLICANT IN DRAFTING contracts to purchase real property, listing agreements and lease agreements.`,
      `A.R.S. § 32-2124(D): the applicant must be at least ${MINIMUM_AGE} years of age.`,
      "A.R.S. § 32-2124(E): what the state examination must establish.",
      `A.A.C. R4-28-401(A)(1): a passing score of ${COURSE_EXAM_PASSING_PERCENT} percent on the course examination.`,
      `A.A.C. R4-28-401(A)(2): an applicant may, EXCEPT FOR THE ${ARIZONA_SPECIFIC_UNWAIVABLE_HOURS}-HOUR ARIZONA-SPECIFIC COURSE, apply for and be granted a waiver of the prelicensure courses.`,
      "A.A.C. R4-28-403: weekly examinations; results reported as 'passed' or 'did not pass'; a candidate who did not pass is also shown the score and the relative score for each content area; and qualifying to take or passing a license examination does NOT constitute a waiver of the Commissioner's right to deny issuance of a license.",
      `A.A.C. R4-28-404: examination time is EXCLUDED from credit hours; third-party recorded material may not exceed ${RECORDED_MATERIAL_MAX_PERCENT} percent of instructional time; school records are retained for ${SCHOOL_RECORD_RETENTION_YEARS} years; and the enrolment agreement carries the bold-capitals provisions the rule states.`,
      "A.R.S. § 32-2135: certification of real estate schools, approval of courses and instructors, and the certificate of course attendance.",
      "A.A.C. R4-28-1101(A): a licensee owes a FIDUCIARY DUTY to the client and shall protect and promote the client's interests, and shall also DEAL FAIRLY with all other parties to a transaction.",
      "A.A.C. R4-28-1101(B): written disclosure to ALL OTHER PARTIES of information materially or adversely affecting the consideration to be paid — including that either party is or may be unable to perform.",
      "A.A.C. R4-28-1101(E): conflicts disclosed in writing BEFORE the parties enter any binding agreement.",
      "A.A.C. R4-28-1101(F) and (G): prior written CONSENT of all parties for multiple representation or compensation; prior written ACKNOWLEDGEMENT for compensation for related goods or services, excepting broker-to-broker compensation.",
      "A.A.C. R4-28-1101(I): an AFFIRMATIVE duty to obtain information material to the client's interests, communicate it accurately, and assist the client in confirming its accuracy.",
      `A.A.C. R4-28-1102: a licensee may not contact a principal represented by another licensee unless the designated broker, a broker representative with delegated authority, and the licensee are unavailable for ${PROPERTY_NEGOTIATION_UNAVAILABILITY_HOURS} hours — and a principal may waive or alter the requirement by written instructions.`,
      "A.A.C. R4-28-1103: an employing and a designated broker shall exercise reasonable supervision and control, including establishment AND ENFORCEMENT of written policies; the monitoring system must include a PROGRESSIVE DISCIPLINARY POLICY and failure to enforce it is itself a violation; and an employing broker is responsible for the acts of all licensees and other employees.",
      `A.A.C. R4-28-701: written disclosure to all the parties, at least ${COMPENSATION_SHARING_DISCLOSURE_DAYS} CALENDAR DAYS BEFORE CLOSING, of the name of each employing broker who represents a party and will receive compensation.`,
      "A.A.C. R4-28-802: expeditious delivery of a legible copy of each signed document to each party signing; prompt submission of all offers, NOT released by the client's acceptance of an offer unless the client instructs IN WRITING to cease or the listing agreement, lease or purchase contract provides otherwise.",
      "A.A.C. R4-28-803: the public report legend where a public report is required; the contract must indicate where earnest money will be deposited and name the depository; and where money is paid directly to the seller and not into neutral escrow, conspicuous disclosure, the purchaser's signature or initials on the provision, and the bold or large-print warning.",
      `A.A.C. R4-28-804: rescission by midnight of the ${RESCISSION_DAYS_UNIMPROVED_LOT}th calendar day for an unimproved subdivided lot or unsubdivided land, with ${UNINSPECTED_LOT_INSPECTION_MONTHS} months to inspect and a unilateral right to rescind at inspection where the purchaser did not inspect before execution; and by midnight of the ${RESCISSION_DAYS_TIMESHARE}th calendar day for a time-share interval.`,
      `A.A.C. R4-28-502: advertising requirements, including the employing broker's legal or certificate dba name clear and prominent; 'owner/agent' where the licensee is the property owner; no use of 'acre' alone or modified below ${ACRE_MINIMUM_SQUARE_FEET} square feet; prior written owner consent for signs and electronic publication; the designated broker's responsibility for all advertising; and that an electronic medium including ARTIFICIAL INTELLIGENCE targeting residents of this State is the dissemination of advertising, with all requirements satisfied WITHOUT THE NEED TO SCROLL.`,
      "A.A.C. R4-28-503: no premium at no or reduced cost may be called an 'award' or 'prize' or similar term; terms, costs, conditions, restrictions and expiration date disclosed in writing before participation; and no lottery contest, drawing or game of chance to solicit or sell an interest in a development unless otherwise provided by law."
    ]),
    /* What this school decided. */
    stateCourseDecisions: Object.freeze([
      `The division of the ${PRELICENSE_HOURS} hours into thirteen modules, nine general at 7 hours and four Arizona-specific at 7, 7, 7 and 6. The statute fixes ${ARIZONA_SPECIFIC_UNWAIVABLE_HOURS} hours as Arizona-specific and states no module structure and no content for them.`,
      `The division of the ${CONTRACT_WRITING_HOURS} hours into two modules of 3 hours each, with the purchase contract drafted in the first and the listing agreement and lease agreement in the second. The statute names the three document types and states no allocation.`,
      `The ${ENGAGEMENT_PASSING_PERCENT} percent in-module engagement threshold and the ${APPLIED_PASSING_PERCENT} percent applied threshold. Neither § 32-2124 nor A.A.C. R4-28 prescribes an in-module assessment or an in-module score.`,
      "Requiring all three drafts to be recorded complete before the six-hour course is credited. The statute requires participation in drafting and names three document types; the requirement that each be separately recorded is this school's."
    ]),
    passingPercentages: Object.freeze({
      courseExamination: Object.freeze({ percent: COURSE_EXAM_PASSING_PERCENT, examination: "the proctored, in-person course examination", rule: "A.A.C. R4-28-401(A)(1)", isRegulatorFigure: true }),
      inModuleEngagement: Object.freeze({ percent: ENGAGEMENT_PASSING_PERCENT, examination: "in-module engagement and remediation checks", rule: null, isRegulatorFigure: false }),
      inModuleApplied: Object.freeze({ percent: APPLIED_PASSING_PERCENT, examination: "in-module applied scenario", rule: null, isRegulatorFigure: false })
    }),
    educationValidityYears: EDUCATION_VALIDITY_YEARS,
    minimumAge: MINIMUM_AGE,
    /* A.A.C. R4-28-403(C). Passing is not a licence, and no payload here says otherwise. */
    passingExaminationIsNotALicense: true,
    approvalStatus: "Not approved. No Arizona prelicensure credit is available for this course. A.R.S. § 32-2135(A) requires Department certification of the school, A.A.C. R4-28-404(B) requires course approval, and A.R.S. § 32-2124(B) requires the course to follow the Department's prescribed content. None is held."
  });
}

export function getArizonaProgram() {
  return Object.freeze({
    state: "AZ",
    regulator: "Arizona Department of Real Estate",
    licenseTitle: "salesperson",
    version: "1.0-submission-draft",
    courses: Object.freeze(COURSE_IDS.map((id) => getArizonaCourse(id))),
    deliveredHours,
    requiredHours: TOTAL_REQUIRED_HOURS,
    prelicenseHours: PRELICENSE_HOURS,
    contractWritingHours: CONTRACT_WRITING_HOURS,
    contractWritingIsAdditional: true,
    arizonaSpecificUnwaivableHours: ARIZONA_SPECIFIC_UNWAIVABLE_HOURS,
    dutiesAreFiduciary: true,
    requiredDrafts: REQUIRED_DRAFTS,
    note: `A.R.S. § 32-2124(B) requires ${PRELICENSE_HOURS} hours and § 32-2124(L) requires a further ${CONTRACT_WRITING_HOURS} "after completing the requirements of subsection B", certified at the time of application — so Arizona is ${TOTAL_REQUIRED_HOURS} hours, not ${PRELICENSE_HOURS}. Of the ${PRELICENSE_HOURS}, ${ARIZONA_SPECIFIC_UNWAIVABLE_HOURS} are the Arizona-specific course the commissioner may NOT waive for an out-of-state licensee.`,
    submissionGates: SUBMISSION_GATES,
    unreadSources: UNREAD_SOURCES,
    approvalStatus: "Not approved. No Arizona prelicensure credit is available."
  });
}

export function getArizonaModule(courseId, moduleId) {
  const course = COURSES[courseId];
  if (!course) return null;
  return course.modules.find((item) => item.id === moduleId) ?? null;
}

export function getArizonaAssessment(courseId, moduleId, kind = "engagement") {
  const course = COURSES[courseId];
  if (!course) return null;
  const module = getArizonaModule(courseId, moduleId);
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
    /* Stated on every assessment so nobody mistakes an in-module check for the proctored examination. */
    isTheProctoredCourseExamination: false,
    /* And so nobody mistakes an engagement check for the § 32-2124(L) drafting requirement. */
    satisfiesDraftingRequirement: false,
    items: authored.map((item, index) => {
      const id = `${moduleId}-${kind}-${String(index + 1).padStart(2, "0")}`;
      const presented = permuteChoices(item.choices, item.correctChoice, `${courseId}:${id}`);
      return { id, prompt: item.prompt, choices: presented.choices, correctChoice: presented.correctChoice, rationale: item.rationale };
    })
  };
}

export function publicArizonaAssessment(assessment) {
  if (!assessment) return null;
  return {
    id: assessment.id,
    kind: assessment.kind,
    courseId: assessment.courseId,
    moduleId: assessment.moduleId,
    passingPercent: assessment.passingPercent,
    isTheProctoredCourseExamination: assessment.isTheProctoredCourseExamination,
    satisfiesDraftingRequirement: assessment.satisfiesDraftingRequirement,
    items: assessment.items.map((item) => ({ id: item.id, prompt: item.prompt, choices: [...item.choices] }))
  };
}

export function scoreArizonaAssessment(assessment, answers) {
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
 * Three gates for the prelicense course: every module complete, attendance recorded by the provider, and the
 * PROCTORED, IN-PERSON course examination passed at A.A.C. R4-28-401(A)(1)'s 75 percent.
 *
 * A FOURTH gate for the contract writing course: all three drafts A.R.S. § 32-2124(L) names must be
 * recorded complete. Reading does not satisfy the statute and this engine does not credit it as though it
 * did.
 *
 * The certificate gate sits above all of them. A.R.S. § 32-2135(B) permits a certificate of course
 * attendance to be issued by a CERTIFIED school for an APPROVED course; neither is held, so no conforming
 * certificate can issue.
 *
 * A.A.C. R4-28-404 states no attendance percentage, so attendanceMet is a provider input rather than a
 * figure this engine asserts.
 */
export function arizonaCourseCredit(courseId, moduleStates = [], options = {}) {
  const course = COURSES[courseId];
  if (!course) return null;
  const {
    courseExamPercent = null,
    courseExamProctoredInPerson = false,
    attendanceMet = false,
    completedDraftIds = [],
    schoolCertificationNumber = null,
    courseApprovalNumber = null
  } = options;

  const completed = new Set(
    moduleStates.filter((state) => state?.status === "completed").map((state) => state.module_id ?? state.moduleId)
  );
  const credited = course.modules.filter((module) => completed.has(module.id));
  const creditedHours = credited.reduce((sum, module) => sum + module.hours, 0);
  const allModulesComplete = credited.length === course.modules.length;

  const creditedArizonaSpecificHours = credited
    .filter((module) => module.arizonaSpecific)
    .reduce((sum, module) => sum + module.hours, 0);

  const examPassed = typeof courseExamPercent === "number" && courseExamPercent >= COURSE_EXAM_PASSING_PERCENT;
  const examProctoringMet = Boolean(courseExamProctoredInPerson);

  const recordedDrafts = new Set(Array.isArray(completedDraftIds) ? completedDraftIds : []);
  const outstandingDrafts = course.requiresDrafting
    ? REQUIRED_DRAFTS.filter((draft) => !recordedDrafts.has(draft.id))
    : [];
  const draftingRequirementMet = !course.requiresDrafting || outstandingDrafts.length === 0;

  const unsatisfiedGates = SUBMISSION_GATES.filter((gate) => !gate.satisfied);
  const courseComplete = allModulesComplete
    && Boolean(attendanceMet)
    && examPassed
    && examProctoringMet
    && draftingRequirementMet;
  const hasBothNumbers = Boolean(schoolCertificationNumber) && Boolean(courseApprovalNumber);

  return {
    courseId,
    completedModules: credited.length,
    totalModules: course.modules.length,
    creditedHours,
    courseHours: course.hours,
    creditedArizonaSpecificHours,
    arizonaSpecificUnwaivableHours: course.carriesArizonaSpecificBlock ? ARIZONA_SPECIFIC_UNWAIVABLE_HOURS : 0,
    allModulesComplete,
    attendanceMet: Boolean(attendanceMet),
    courseExamPassed: examPassed,
    courseExamProctoredInPerson: examProctoringMet,
    courseExamPassingPercent: COURSE_EXAM_PASSING_PERCENT,
    courseExamPassingPercentIsRegulatorFigure: true,
    requiresDrafting: course.requiresDrafting,
    requiredDraftIds: Object.freeze(course.requiresDrafting ? REQUIRED_DRAFTS.map((draft) => draft.id) : []),
    completedDraftIds: Object.freeze([...recordedDrafts].filter((id) => REQUIRED_DRAFTS.some((draft) => draft.id === id))),
    outstandingDraftIds: Object.freeze(outstandingDrafts.map((draft) => draft.id)),
    draftingRequirementMet,
    courseComplete,
    certificateEligible: courseComplete && hasBothNumbers && unsatisfiedGates.length === 0,
    certificateBlockedBy: (() => {
      if (!allModulesComplete) {
        return `${credited.length} of ${course.modules.length} modules complete (${creditedHours} of ${course.hours} hours).`;
      }
      if (!attendanceMet) {
        return "The provider has not recorded the attendance requirement as met. A.A.C. R4-28-404 states no attendance percentage, so no standard is asserted here.";
      }
      if (!examPassed) {
        return courseExamPercent === null
          ? `No course examination has been recorded. A.A.C. R4-28-401(A)(1) requires a passing score of ${COURSE_EXAM_PASSING_PERCENT} percent.`
          : `The course examination was scored at ${courseExamPercent} percent, below the ${COURSE_EXAM_PASSING_PERCENT} percent A.A.C. R4-28-401(A)(1) requires.`;
      }
      if (!examProctoringMet) {
        return "A.R.S. § 32-2124(B) requires the course examination be PROCTORED IN PERSON, and no in-person proctoring has been recorded for this examination.";
      }
      if (!draftingRequirementMet) {
        return `A.R.S. § 32-2124(L) requires PARTICIPATION BY THE APPLICANT IN DRAFTING contracts to purchase real property, listing agreements and lease agreements. ${outstandingDrafts.length} of ${REQUIRED_DRAFTS.length} drafts are not recorded complete: ${outstandingDrafts.map((draft) => draft.documentType).join("; ")}.`;
      }
      if (!hasBothNumbers) {
        return "A.R.S. § 32-2135 permits a certificate of course attendance to be issued by a CERTIFIED school for an APPROVED course. No school certification number and no course approval number has been issued.";
      }
      if (unsatisfiedGates.length) {
        return `${unsatisfiedGates.length} submission gates are unsatisfied. The first is — ${unsatisfiedGates[0].rule}: ${unsatisfiedGates[0].blockedBy}`;
      }
      return null;
    })()
  };
}

/**
 * Education readiness across BOTH courses, because A.R.S. § 32-2124 requires both — subsection (B)'s 90
 * hours and subsection (L)'s 6 — and subsection (L) is proved AT THE TIME OF APPLICATION.
 *
 * Nothing here decides eligibility for anything. That is the Department's, and A.A.C. R4-28-403(C) makes
 * the point from the other direction: qualifying to take or passing a licence examination does not waive
 * the Commissioner's right to deny issuance.
 */
export function arizonaEducationReadiness(courseCredits = [], options = {}) {
  const { age = null, waiverGranted = false } = options;
  const byCourse = new Map();
  for (const record of courseCredits) {
    if (!record || !COURSES[record.courseId]) continue;
    if (record.courseComplete) byCourse.set(record.courseId, record);
  }

  const completed = [...byCourse.values()];
  /* The Arizona-specific hours are read from ANY prelicense record, complete or not: where a waiver is
     granted the course as a whole is not completed, but § 32-2124(B) still requires the 27 hours. */
  const prelicenseRecord = courseCredits.find((record) => record?.courseId === "az-salesperson-prelicense-90-v1") ?? null;
  const contractWritingRecord = byCourse.get("az-contract-writing-6-v1") ?? null;
  const prelicenseComplete = byCourse.has("az-salesperson-prelicense-90-v1");
  const contractWritingComplete = Boolean(contractWritingRecord);
  const hours = completed.reduce((sum, record) => sum + COURSES[record.courseId].hours, 0);

  /* THE WAIVER DOES NOT REACH THE 27. § 32-2124(B) and A.A.C. R4-28-401(A)(2). Where a waiver is granted,
     the Arizona-specific hours must still be recorded as delivered. */
  const arizonaSpecificDelivered = prelicenseRecord?.creditedArizonaSpecificHours ?? 0;
  const arizonaSpecificRequirementMet = arizonaSpecificDelivered >= ARIZONA_SPECIFIC_UNWAIVABLE_HOURS;
  const prelicenseRequirementMet = waiverGranted ? arizonaSpecificRequirementMet : prelicenseComplete;

  const meetsHourRequirement = prelicenseRequirementMet && contractWritingComplete;
  const ageMet = typeof age === "number" ? age >= MINIMUM_AGE : null;

  return {
    completedCourseIds: Object.freeze(completed.map((record) => record.courseId)),
    completedHours: hours,
    requiredHours: TOTAL_REQUIRED_HOURS,
    prelicenseHours: PRELICENSE_HOURS,
    contractWritingHours: CONTRACT_WRITING_HOURS,
    prelicenseComplete,
    contractWritingComplete,
    waiverGranted: Boolean(waiverGranted),
    arizonaSpecificUnwaivableHours: ARIZONA_SPECIFIC_UNWAIVABLE_HOURS,
    arizonaSpecificHoursDelivered: arizonaSpecificDelivered,
    arizonaSpecificRequirementMet,
    meetsHourRequirement,
    minimumAge: MINIMUM_AGE,
    ageMet,
    determinationIsTheDepartments: true,
    passingExaminationIsNotALicense: true,
    blockedBy: (() => {
      if (waiverGranted && !arizonaSpecificRequirementMet) {
        return `A.R.S. § 32-2124(B) permits the commissioner to waive the prelicensure course requirement OTHER THAN THE ${ARIZONA_SPECIFIC_UNWAIVABLE_HOURS}-HOUR ARIZONA-SPECIFIC COURSE, and A.A.C. R4-28-401(A)(2) repeats it. The school's records show ${arizonaSpecificDelivered} of ${ARIZONA_SPECIFIC_UNWAIVABLE_HOURS} Arizona-specific hours delivered.`;
      }
      if (!prelicenseRequirementMet) {
        return `A.R.S. § 32-2124(B) requires ${PRELICENSE_HOURS} hours of prelicensure instruction. The school's records do not show that course complete.`;
      }
      if (!contractWritingComplete) {
        return `A.R.S. § 32-2124(L) requires ${CONTRACT_WRITING_HOURS} hours of instruction in real estate contract law and contract writing, certified to the department AT THE TIME OF APPLICATION and including participation by the applicant in drafting contracts to purchase real property, listing agreements and lease agreements. The school's records do not show that course complete.`;
      }
      if (ageMet === false) return `A.R.S. § 32-2124(D) requires the applicant to be at least ${MINIMUM_AGE} years of age.`;
      return null;
    })()
  };
}

/**
 * A.R.S. § 32-2124(B): course work must have been completed within the TEN YEARS immediately preceding the
 * APPLICATION. completedOn and applicationDate are ISO date strings.
 */
export function arizonaEducationValidity(completedOn, applicationDate = null) {
  if (typeof completedOn !== "string") return null;
  const completed = new Date(completedOn);
  if (Number.isNaN(completed.valueOf())) return null;

  const expiresOn = new Date(completed);
  expiresOn.setFullYear(expiresOn.getFullYear() + EDUCATION_VALIDITY_YEARS);

  let withinWindow = null;
  let application = null;
  if (typeof applicationDate === "string") {
    const parsed = new Date(applicationDate);
    if (!Number.isNaN(parsed.valueOf())) {
      application = parsed;
      withinWindow = parsed <= expiresOn;
    }
  }

  return {
    completedOn: completed.toISOString().slice(0, 10),
    validityYears: EDUCATION_VALIDITY_YEARS,
    expiresOn: expiresOn.toISOString().slice(0, 10),
    applicationDate: application ? application.toISOString().slice(0, 10) : null,
    withinWindow,
    measuredTo: "the date of the application — A.R.S. § 32-2124(B), the ten years immediately preceding it",
    blockedBy: withinWindow === false
      ? `The course was completed on ${completed.toISOString().slice(0, 10)}. Under A.R.S. § 32-2124(B) it counts only towards an application made by ${expiresOn.toISOString().slice(0, 10)}.`
      : null
  };
}

export const ARIZONA_COURSE_IDS = COURSE_IDS;
export const ARIZONA_COURSES = COURSES;
export const ARIZONA_LICENSEE_DUTIES = LICENSEE_DUTIES;
export const ARIZONA_REQUIRED_DRAFTS = REQUIRED_DRAFTS;
export const ARIZONA_SUBMISSION_GATES = SUBMISSION_GATES;
export const ARIZONA_UNREAD_SOURCES = UNREAD_SOURCES;
export const ARIZONA_PRELICENSE_HOURS = PRELICENSE_HOURS;
export const ARIZONA_CONTRACT_WRITING_HOURS = CONTRACT_WRITING_HOURS;
export const ARIZONA_TOTAL_REQUIRED_HOURS = TOTAL_REQUIRED_HOURS;
export const ARIZONA_SPECIFIC_UNWAIVABLE_HOURS_TOTAL = ARIZONA_SPECIFIC_UNWAIVABLE_HOURS;
export const ARIZONA_COURSE_EXAM_PASSING_PERCENT = COURSE_EXAM_PASSING_PERCENT;
export const ARIZONA_EDUCATION_VALIDITY_YEARS = EDUCATION_VALIDITY_YEARS;
export const ARIZONA_RECORDED_MATERIAL_MAX_PERCENT = RECORDED_MATERIAL_MAX_PERCENT;
export const ARIZONA_SCHOOL_RECORD_RETENTION_YEARS = SCHOOL_RECORD_RETENTION_YEARS;
export const ARIZONA_PROPERTY_NEGOTIATION_UNAVAILABILITY_HOURS = PROPERTY_NEGOTIATION_UNAVAILABILITY_HOURS;
export const ARIZONA_COMPENSATION_SHARING_DISCLOSURE_DAYS = COMPENSATION_SHARING_DISCLOSURE_DAYS;
export const ARIZONA_RESCISSION_DAYS_UNIMPROVED_LOT = RESCISSION_DAYS_UNIMPROVED_LOT;
export const ARIZONA_RESCISSION_DAYS_TIMESHARE = RESCISSION_DAYS_TIMESHARE;
export const ARIZONA_UNINSPECTED_LOT_INSPECTION_MONTHS = UNINSPECTED_LOT_INSPECTION_MONTHS;
export const ARIZONA_ACRE_MINIMUM_SQUARE_FEET = ACRE_MINIMUM_SQUARE_FEET;
