/**
 * North Carolina Broker Prelicensing Course (75 hours) — course engine.
 *
 * WHAT THE COMMISSION FIXES, AND IT IS MORE THAN ANY OTHER REGULATOR IN THIS PROJECT. The Commission's
 * Prelicensing Course Syllabus (Student Version), March 2024 Edition amended May 2026, states: "The
 * Prelicensing Course must be taught as prescribed by the Commission in this Syllabus." It fixes:
 *
 *   - SIXTEEN sections and their order
 *   - a recommended hour table
 *   - an INSTRUCTIONAL LEVEL for every section and for many individual subtopics
 *   - REQUIRED ACTIVITIES which "must be completed"
 *   - the licence examination item count for every section, split state and national
 *   - three course completion conditions
 *   - the end-of-course examination's form and passing grade
 *
 * THE HOUR ARITHMETIC IS DIFFERENT FROM EVERY OTHER STATE IN THIS PROJECT. The Commission's
 * recommended table totals 72.0 INSTRUCTIONAL hours PLUS an End-of-course Examination of 3.0 hours =
 * 75 TOTAL. In Maine, Wisconsin and Oklahoma the examination sits OUTSIDE the required hours; here it
 * sits INSIDE them. A build that added 3.0 to 75 would overstate the course by an examination, and a
 * build that dropped the examination from the total would understate it. The invariants below assert
 * 72.0 + 3.0 = 75.0 and throw on drift in either direction.
 *
 * SECTION XVI CARRIES ZERO STANDALONE HOURS AND THAT IS THE COMMISSION'S OWN INSTRUCTION:
 * "Instruction on relevant mathematical functions is to be provided under the appropriate subject
 * areas rather than as a separate arithmetic course section... Consideration was given to the amount
 * of mathematics involved in each subject area when establishing the recommended number of
 * instructional hours for subject areas." So a zero here is a compliance fact, not a gap, and
 * MATH_SECTION_IS_INTEGRATED records it so nobody later "fixes" it by inventing hours.
 *
 * THE THREE INSTRUCTIONAL LEVELS are Bloom-based and providers are "REQUIRED to comply" with them.
 * Every module carries the Commission's Level. The engine asserts every Level is 1, 2 or 3 and that
 * every module carries one.
 *
 * THE LICENCE EXAMINATION IS 140 ITEMS: 60 STATE + 80 NATIONAL. Every section's count is the
 * Commission's. The engine asserts both halves and the total, because a drifting count would
 * misdescribe the examination to a student deciding where to study.
 *
 * ONE PASSING PERCENTAGE FROM THE COMMISSION, ONE FROM THIS SCHOOL, kept apart deliberately:
 *   END_OF_COURSE_PASSING_PERCENT  75  Commission Rule 58H .0207, as the Syllabus states it
 *   ENGAGEMENT_PASSING_PERCENT     80  a StateCourse standard for in-module progression
 * The Commission prescribes no in-module score. The payload keeps them apart and a test asserts it.
 *
 * ITEM SECURITY. Rule 58H .0304(b), as the Syllabus quotes it: "Instructors shall not obtain, use, or
 * attempt to obtain or use, in any manner or form, North Carolina real estate license examination
 * questions." That prohibition reaches the ATTEMPT and reaches use "in any manner or form." No item in
 * this build is, paraphrases, or is derived from a licence examination question. The end-of-course
 * examination must be COMPREHENSIVE, CLOSED-BOOK and PROCTORED; publicNorthCarolinaAssessment strips
 * correctChoice and rationale, and a test proves it.
 *
 * THE COURSE EXPIRES. The Syllabus states the Prelicensing Course is valid for THREE YEARS from the
 * COURSE COMPLETION DATE shown on the certificate. northCarolinaEducationValidity computes it.
 *
 * THREE COMPLETION CONDITIONS, not one. The Syllabus: "For successful completion of the course,
 * students must 1) satisfactorily complete any required activities and homework exercises, 2) meet
 * attendance requirements, and 3) pass the end-of-course examination." REQUIRED ACTIVITIES ARE A
 * COMPLETION CONDITION IN THEIR OWN RIGHT, so northCarolinaCreditedHours gates on all three and
 * reports which one is blocking.
 *
 * PHASE 0 SUPERSEDES THE ORIGINAL SOURCE LIMITATION. Current Chapter 93A and the controlling 21 NCAC
 * 58A/58H rules were inspected on 2026-09-04 and are traced in the regulatory manifest. The 2026-09-06
 * capture log distinguishes retained handbook/form PDFs from inaccessible rule/syllabus PDFs. Current
 * forms, copyrighted practice documents, Required Activity artifacts and the regulator-format time
 * ledger also remain open dependencies. OPEN_SOURCE_DEPENDENCIES carries only those live gaps.
 *
 * Course version 1.0 submission draft — NOT APPROVED. No North Carolina prelicensing credit is
 * available, and this course may not be delivered for credit until the Commission approves it and the
 * outstanding Required Activities recorded below are satisfied.
 */

import MODULE_BANK from "./north-carolina/module-question-bank.mjs";
import { NC_BLOCKERS, NC_CONTROL_DATE, NC_MANIFEST_VERSION } from "./north-carolina/regulatory-manifest.mjs";

const COURSE_ID = "nc-broker-prelicensing-75-v1";

/* The Commission's figures. */
const REQUIRED_TOTAL_HOURS = 75;
const REQUIRED_INSTRUCTIONAL_HOURS = 72;
const END_OF_COURSE_EXAM_HOURS = 3;
const END_OF_COURSE_PASSING_PERCENT = 75;      /* Rule 58H .0207, as the Syllabus states it */
const LICENCE_EXAM_STATE_ITEMS = 60;
const LICENCE_EXAM_NATIONAL_ITEMS = 80;
const LICENCE_EXAM_TOTAL_ITEMS = LICENCE_EXAM_STATE_ITEMS + LICENCE_EXAM_NATIONAL_ITEMS;
const COURSE_VALIDITY_YEARS = 3;               /* from the course completion date on the certificate */
const SECTION_COUNT = 16;

/* StateCourse standards. The Syllabus prescribes no in-module assessment and no in-module score. */
const ENGAGEMENT_PASSING_PERCENT = 80;
const APPLIED_PASSING_PERCENT = 100;

/* The Commission's own instruction: mathematics is taught inside the other sections, and the hours
   were already allocated with that mathematics in mind. Section XVI's zero is prescribed. */
const MATH_SECTION_IS_INTEGRATED = true;
const MATH_SECTION = "XVI";

/* The three Instructional Levels, with the Commission's own definitions. Providers are REQUIRED to
   comply with them. */
const INSTRUCTIONAL_LEVELS = Object.freeze({
  1: Object.freeze({ level: 1, name: "Knowledge and comprehension", demand: "The student can recall and restate." }),
  2: Object.freeze({ level: 2, name: "Application", demand: "The student can use the concept in a situation." }),
  3: Object.freeze({ level: 3, name: "Analysis and evaluation", demand: "The student can break a problem apart and judge it." })
});

/* The sixteen sections. Titles, Instructional Levels, examination categories and examination item
   counts are ALL the Commission's, transcribed from its Syllabus. The hour allocation within the
   Commission's recommended table is a StateCourse proposal for review. */
const MODULES = Object.freeze([
  { id: "module-01", sequence: 1, section: "I", title: "NC Real Estate Licensure", level: 1, examCategory: "state", examItems: 3, hours: 2.0 },
  { id: "module-02", sequence: 2, section: "II", title: "Broker Supervision & Compensation", level: 3, examCategory: "state", examItems: 4, hours: 2.0 },
  { id: "module-03", sequence: 3, section: "III", title: "Real Property Characteristics, Legal Descriptions & Property Use", level: 1, examCategory: "national", examItems: 9, hours: 5.0 },
  { id: "module-04", sequence: 4, section: "IV", title: "Property Taxes & Insurance", level: 2, examCategory: "state", examItems: 4, hours: 4.0 },
  { id: "module-05", sequence: 5, section: "V", title: "Property Disclosures & Environmental Issues", level: 1, examCategory: "national", examItems: 8, hours: 4.0 },
  { id: "module-06", sequence: 6, section: "VI", title: "Forms of Ownership, Transfer & Recording of Title", level: 2, examCategory: "national", examItems: 8, hours: 6.0 },
  { id: "module-07", sequence: 7, section: "VII", title: "Real Estate Contracts & Agency", level: 3, examCategory: "national", examItems: 16, hours: 6.0 },
  { id: "module-08", sequence: 8, section: "VIII", title: "Agency in NC", level: 3, examCategory: "state", examItems: 16, hours: 7.0 },
  { id: "module-09", sequence: 9, section: "IX", title: "Real Estate Practice", level: 2, examCategory: "national", examItems: 14, hours: 4.0 },
  { id: "module-10", sequence: 10, section: "X", title: "Brokerage Practices in NC", level: 2, examCategory: "state", examItems: 12, hours: 4.0 },
  { id: "module-11", sequence: 11, section: "XI", title: "Contracts & Closing in NC", level: 2, examCategory: "state", examItems: 7, hours: 8.0 },
  { id: "module-12", sequence: 12, section: "XII", title: "Financing & Settlement", level: 1, examCategory: "national", examItems: 7, hours: 7.0 },
  { id: "module-13", sequence: 13, section: "XIII", title: "Property Valuation & Appraisal", level: 1, examCategory: "national", examItems: 11, hours: 6.0 },
  { id: "module-14", sequence: 14, section: "XIV", title: "NC Landlord & Tenant Concepts", level: 2, examCategory: "state", examItems: 3, hours: 2.5 },
  { id: "module-15", sequence: 15, section: "XV", title: "Other Relevant NC Laws", level: 2, examCategory: "state", examItems: 11, hours: 4.5 },
  { id: "module-16", sequence: 16, section: "XVI", title: "Real Estate Math Calculations", level: 3, examCategory: "national", examItems: 7, hours: 0.0 }
].map((item) => Object.freeze({
  ...item,
  instructionalLevel: INSTRUCTIONAL_LEVELS[item.level],
  integratedAcrossSections: item.section === MATH_SECTION && MATH_SECTION_IS_INTEGRATED,
  curriculumPath: `north-carolina/curriculum/${item.id}.md`
})));

/* The Required Activities the Commission prescribes, with the delivery status of each. Completing
   them is one of the THREE course completion conditions, so an outstanding activity is a submission
   gate and not a nice-to-have. Each outstanding one names the artefact this project did not obtain. */
const REQUIRED_ACTIVITIES = Object.freeze([
  { section: "III", moduleId: "module-03", activity: "Use pictures to help students recognize items that might be fixtures.", status: "delivered", evidencePath: "public/statecourse/media/nc-fixture-decision-lab.svg" },
  { section: "III", moduleId: "module-03", activity: "Provide a deed and a survey that illustrate description by metes and bounds.", status: "outstanding", blockedBy: "A clearly labelled teaching facsimile is prepared, but a rights-safe deed and licensed survey acceptable for Commission review have not been obtained." },
  { section: "III", moduleId: "module-03", activity: "Provide a visual illustration of an accompanying government survey description.", status: "delivered", evidencePath: "public/statecourse/media/nc-government-survey-grid.svg" },
  { section: "III", moduleId: "module-03", activity: "Provide a copy of an approved subdivision plat map.", status: "outstanding", blockedBy: "No rights-safe approved North Carolina subdivision plat map has been obtained by this project." },
  { section: "III", moduleId: "module-03", activity: "Provide a copy of a residential property survey.", status: "outstanding", blockedBy: "No rights-safe licensed residential property survey has been obtained by this project." },
  { section: "III", moduleId: "module-03", activity: "Provide examples of each zoning concept.", status: "delivered", evidencePath: "north-carolina/curriculum/module-03.md#required-zoning-examples" },
  { section: "V", moduleId: "module-05", activity: "Review the Lead-Based Paint or Lead-Based Paint Hazard disclosure.", status: "outstanding", blockedBy: "The Commission-prescribed current NCAR Form 2A9-T has not been obtained; the federal HUD/EPA form and rules do not substitute for that specific Required Activity." },
  { section: "VI", moduleId: "module-06", activity: "Provide real world examples of each type of estate, and explain real world use of each type of lease.", status: "delivered", evidencePath: "north-carolina/curriculum/module-06.md#a-estates-in-real-property" },
  { section: "VI", moduleId: "module-06", activity: "Provide real world examples of each way real property is transferred, voluntarily and involuntarily.", status: "delivered", evidencePath: "north-carolina/curriculum/module-06.md#c-methods-of-transferring-title-level-1" },
  { section: "VI", moduleId: "module-06", activity: "Provide an assessment to determine whether the student can differentiate the deed types.", status: "delivered", evidencePath: "north-carolina/curriculum/module-06.md#d3-deed-types--the-missing-required-activity-instruction" },
  { section: "VII", moduleId: "module-07", activity: "Provide real world examples of each way a real estate contract may be declared void or voidable.", status: "delivered", evidencePath: "north-carolina/curriculum/module-07.md#c5-required-activity-evidence--void-and-voidable-fact-pattern-lab" },
  { section: "VII", moduleId: "module-07", activity: "Provide real world examples of each way a real estate contract is terminated and distinguish contract termination from offer termination.", status: "delivered", evidencePath: "north-carolina/curriculum/module-07.md#d2a-required-activity-evidence--contract-termination-versus-offer-termination" },
  { section: "VII", moduleId: "module-07", activity: "Use real world examples to illustrate each agency duty.", status: "delivered", evidencePath: "north-carolina/curriculum/module-07.md#g8a-required-activity-evidence--six-agency-duty-scenarios" },
  { section: "VII", moduleId: "module-07", activity: "Provide examples of agency terminations and exceptions.", status: "delivered", evidencePath: "north-carolina/curriculum/module-07.md#g9a-required-activity-evidence--termination-and-surviving-duty-lab" },
  { section: "VIII", moduleId: "module-08", activity: "Provide the WWREA Disclosure and the Questions & Answers brochure.", status: "outstanding", blockedBy: "Current NCREC guidance and the public Q&A route were inspected, but the current WWREA disclosure form has not been retained and page-reviewed as a filing artifact." },
  { section: "VIII", moduleId: "module-08", activity: "Provide examples of when first substantial contact occurs.", status: "delivered", evidencePath: "north-carolina/curriculum/module-08.md#b2a-required-activity-evidence--first-substantial-contact-lab" },
  { section: "VIII", moduleId: "module-08", activity: "Compare and contrast duties owed to clients vs. third parties.", status: "delivered", evidencePath: "north-carolina/curriculum/module-08.md#d3-required-activity-evidence--clientcustomer-duty-lab" },
  { section: "VIII", moduleId: "module-08", activity: "Assign math practice problems, and assign practice problems.", status: "delivered", evidencePath: "north-carolina/curriculum/module-08.md#f3a-required-activity-evidence--calculation-set" },
  { section: "VIII", moduleId: "module-08", activity: "Discuss factors that may and may not be considered due to Fair Housing.", status: "delivered", evidencePath: "north-carolina/curriculum/module-08.md#h1a-required-activity-evidence--tenant-screening-decision-matrix" },
  { section: "VIII", moduleId: "module-08", activity: "Clarify the characteristics that make the three listing types different.", status: "delivered", evidencePath: "north-carolina/curriculum/module-08.md#f4a-required-activity-evidence--distinguish-the-three-listing-types" },
  { section: "IX", moduleId: "module-09", activity: "Discuss factors that may and may not be considered due to Fair Housing.", status: "delivered", evidencePath: "north-carolina/curriculum/module-09.md#b4a-required-activity-evidence--neutral-tenant-screening-matrix" },
  { section: "IX", moduleId: "module-09", activity: "Discuss various ways brokerage fees are determined.", status: "delivered", evidencePath: "north-carolina/curriculum/module-09.md#b6a-required-activity-evidence--compensation-method-lab" },
  { section: "IX", moduleId: "module-09", activity: "Provide examples of each type of discrimination.", status: "delivered", evidencePath: "north-carolina/curriculum/module-09.md#c2a-required-activity-evidence--discrimination-examples" },
  { section: "IX", moduleId: "module-09", activity: "Compare and contrast duties owed to clients vs. third parties.", status: "delivered", evidencePath: "north-carolina/curriculum/module-09.md#d1a-required-activity-evidence--client-versus-third-party-duties" },
  { section: "X", moduleId: "module-10", activity: "Compare and contrast duties owed to clients vs. third parties.", status: "delivered", evidencePath: "north-carolina/curriculum/module-10.md#b0a-required-activity-evidence--client-versus-third-party-disclosure" },
  { section: "XI", moduleId: "module-11", activity: "Provide Form 2-T, the Guidelines for Completing the Offer to Purchase and Contract Form, and the commonly used standard addenda, and conduct a detailed paragraph-by-paragraph review.", status: "outstanding", blockedBy: "Form 2-T, the Guidelines and the standard addenda have not been obtained by this project. No document in this build reproduces, describes or paraphrases any provision of them." },
  { section: "XI", moduleId: "module-11", activity: "Use various scenarios to explore initial and additional earnest money deposit handling and escrow delivery timing.", status: "delivered", evidencePath: "north-carolina/curriculum/module-11.md#ddf-and-emd-are-different-money" },
  { section: "XI", moduleId: "module-11", activity: "Discuss the advantages and disadvantages of possession at a time other than Closing.", status: "delivered", evidencePath: "north-carolina/curriculum/module-11.md#b5a-required-activity-evidence--possession-away-from-closing" },
  { section: "XII", moduleId: "module-12", activity: "Integrate mathematical calculations related to mortgage finance into the teaching of the essential concepts and terminology.", status: "delivered" },
  { section: "XII", moduleId: "module-12", activity: "Review a completed sample Loan Estimate form.", status: "delivered", evidencePath: "north-carolina/curriculum/module-12.md#required-activities-in-this-section--all-four-must-be-completed" },
  { section: "XII", moduleId: "module-12", activity: "Review a completed sample Borrower Closing Disclosure form.", status: "delivered", evidencePath: "north-carolina/curriculum/module-12.md#required-activities-in-this-section--all-four-must-be-completed" },
  { section: "XII", moduleId: "module-12", activity: "Show examples of both a HUD-1 and an ALTA settlement statement.", status: "delivered", evidencePath: "north-carolina/curriculum/module-12.md#required-activities-in-this-section--all-four-must-be-completed" },
  { section: "XIII", moduleId: "module-13", activity: "Provide examples of how each force and factor affects value.", status: "delivered" },
  { section: "XIII", moduleId: "module-13", activity: "Provide an example of each economic principle of value.", status: "delivered" },
  { section: "XIII", moduleId: "module-13", activity: "Provide examples of how adjustments are made to the sales prices of superior and inferior comps.", status: "delivered" },
  { section: "XIII", moduleId: "module-13", activity: "Use a sample appraisal completed on a Uniform Residential Appraisal Report (URAR) form for illustration.", status: "delivered", evidencePath: "north-carolina/curriculum/module-13.md#d4a-required-activity-evidence--completed-urar-walkthrough" },
  { section: "XIII", moduleId: "module-13", activity: "Show students on the URAR form where the appraiser reconciles the approaches to a single opinion of value.", status: "delivered", evidencePath: "north-carolina/curriculum/module-13.md#d4a-required-activity-evidence--completed-urar-walkthrough" },
  { section: "XV", moduleId: "module-15", activity: "Provide current RPOADS and MOG disclosure forms, and discuss the purpose of each and how to advise owners about completion and delivery.", status: "delivered", evidencePath: "north-carolina/curriculum/module-15.md#e5-licence-law-is-unaffected" },
  { section: "XV", moduleId: "module-15", activity: "Thoroughly review the NCREC Residential Square Footage Guidelines and assign at least one practice problem.", status: "delivered", evidencePath: "north-carolina/curriculum/module-15.md#i4-square-footage" },
  { section: "XV", moduleId: "module-15", activity: "Provide a timeline example of how mechanics' liens may take priority over other recorded liens.", status: "delivered", evidencePath: "north-carolina/curriculum/module-15.md#i9-liens-against-the-real-property" },
  { section: "XVI", moduleId: "module-16", activity: "Calculate various sales commissions and property management fees based on typical ways they are determined.", status: "delivered" },
  { section: "XVI", moduleId: "module-16", activity: "Calculate excise tax for multiple properties across the four prescribed scenario types.", status: "delivered", evidencePath: "north-carolina/curriculum/module-04.md#required-four-scenario-practice" },
  { section: "XVI", moduleId: "module-16", activity: "Explain and demonstrate proration math for HOA dues, monthly rent and annual real estate taxes, across early and late closing dates and paid and unpaid tax bills, with multiple practice problems.", status: "delivered" },
  { section: "XVI", moduleId: "module-16", activity: "Perform multiple annual property tax calculations, with and without city taxes.", status: "delivered" },
  { section: "XVI", moduleId: "module-16", activity: "Have students prepare a CMA including superior and inferior comps to arrive at a range for probable sales price.", status: "delivered" },
  { section: "XVI", moduleId: "module-16", activity: "Provide examples of estimating replacement cost by the square foot method, and produce a whole-property value by the cost approach with age/life depreciation.", status: "delivered" },
  { section: "XVI", moduleId: "module-16", activity: "Provide an example using the Direct Capitalization Formula with the CAP rate given. There will be no calculations using a GRM.", status: "delivered" }
].map((item) => Object.freeze(item)));

/* Live source/material dependencies after the 2026-09-04 official-statute/rule Phase 0 pass. */
const OPEN_SOURCE_DEPENDENCIES = Object.freeze([
  "NCAR/NCBA Offer to Purchase and Contract Standard Form 2-T, its Guidelines, and all standard addenda",
  "The NCREC Working With Real Estate Agents Questions & Answers brochure; the public WWREA form itself is retained and page-reviewed",
  "The NCREC Residential Subdivisions and Planned Communities Questions & Answers brochure",
  "Complete current North Carolina building-code tables and project-specific local amendments beyond Module NC-15's OSFM current-code boundary",
  "Remaining course-by-course reconciliation against individual statutes and administrative rules outside the completed Modules NC-01 through NC-15 slices",
  "Dodd-Frank statutory history and federal finance provisions beyond Module NC-12's reviewed current Regulation Z, Regulation X, Regulation B and Regulation V slices",
  "Complete FHA, VA and USDA underwriting handbooks and Fannie Mae, Freddie Mac and Ginnie Mae seller/servicer guides beyond Module NC-12's current official-program overview",
  "The full copyrighted USPAP text and North Carolina Appraisal Board rules beyond Module NC-13's reviewed statutory and official-overview boundaries",
  "TCPA/FCC implementation and the remaining Module NC-09 common-law and policy-form sources; federal and North Carolina Fair Housing authorities are reconciled"
]);

const TIMING_EVIDENCE = Object.freeze({
  instructionalMinutesPerHour: 50,
  requiredInstructionalMinutes: REQUIRED_INSTRUCTIONAL_HOURS * 50,
  commissionReadingRateWordsPerMinute: 225,
  curriculumBaselineWords: 68779,
  curriculumBaselineMinutes: Number((68779 / 225).toFixed(2)),
  measuredOn: "2026-09-07",
  mediaDurationLedgerMinutes: 0,
  regulatorFormatOutlineComplete: false,
  validated: false,
  ruleCitation: "21 NCAC 58H .0101(7); .0401(c)(6) and (f)(2)",
  note: "Source-word counts include nonstudent text and are upper-bound audit signals only. Seventy-two non-exam instructional hours require 3600 instructional minutes; breaks and final-exam allocation have separate ledgers. No student-visible time is validated."
});

/* ---- Import-time invariants ---- */

if (MODULES.length !== SECTION_COUNT) {
  throw new Error(`North Carolina course engine: the Syllabus prescribes ${SECTION_COUNT} sections; ${MODULES.length} modules are defined.`);
}

const instructionalHours = Number(MODULES.reduce((sum, module) => sum + module.hours, 0).toFixed(2));
if (instructionalHours !== REQUIRED_INSTRUCTIONAL_HOURS) {
  throw new Error(`North Carolina course engine: modules total ${instructionalHours} instructional hours; the Commission's recommended table totals ${REQUIRED_INSTRUCTIONAL_HOURS}.`);
}

/* The examination is INSIDE the 75, unlike every other state in this project. */
if (instructionalHours + END_OF_COURSE_EXAM_HOURS !== REQUIRED_TOTAL_HOURS) {
  throw new Error(`North Carolina course engine: ${instructionalHours} instructional hours plus ${END_OF_COURSE_EXAM_HOURS} examination hours must equal ${REQUIRED_TOTAL_HOURS}. The end-of-course examination is INSIDE the required total, not additional to it.`);
}

/* Section XVI's zero is the Commission's instruction. Assert it stays zero AND stays flagged, so a
   later reader cannot mistake it for an omission and cannot silently give it hours. */
const mathModule = MODULES.find((module) => module.section === MATH_SECTION);
if (!mathModule) {
  throw new Error(`North Carolina course engine: Section ${MATH_SECTION} is missing.`);
}
if (MATH_SECTION_IS_INTEGRATED && mathModule.hours !== 0) {
  throw new Error(`North Carolina course engine: Section ${MATH_SECTION} carries ${mathModule.hours} standalone hours. The Commission directs that mathematics be provided under the appropriate subject areas rather than as a separate section, and states the subject-area hours already account for it — giving Section ${MATH_SECTION} its own hours double-counts them.`);
}
if (!mathModule.integratedAcrossSections) {
  throw new Error(`North Carolina course engine: Section ${MATH_SECTION} must be flagged as integrated across sections.`);
}

const stateItems = MODULES.filter((m) => m.examCategory === "state").reduce((sum, m) => sum + m.examItems, 0);
const nationalItems = MODULES.filter((m) => m.examCategory === "national").reduce((sum, m) => sum + m.examItems, 0);
if (stateItems !== LICENCE_EXAM_STATE_ITEMS) {
  throw new Error(`North Carolina course engine: state examination items total ${stateItems}; the Commission's counts total ${LICENCE_EXAM_STATE_ITEMS}.`);
}
if (nationalItems !== LICENCE_EXAM_NATIONAL_ITEMS) {
  throw new Error(`North Carolina course engine: national examination items total ${nationalItems}; the Commission's counts total ${LICENCE_EXAM_NATIONAL_ITEMS}.`);
}
if (stateItems + nationalItems !== LICENCE_EXAM_TOTAL_ITEMS) {
  throw new Error(`North Carolina course engine: the licence examination is ${LICENCE_EXAM_TOTAL_ITEMS} items; the section counts total ${stateItems + nationalItems}.`);
}

for (const module of MODULES) {
  if (!INSTRUCTIONAL_LEVELS[module.level]) {
    throw new Error(`North Carolina course engine: ${module.id} carries Instructional Level ${module.level}; the Commission defines only 1, 2 and 3.`);
  }
  if (module.examCategory !== "state" && module.examCategory !== "national") {
    throw new Error(`North Carolina course engine: ${module.id} carries examination category "${module.examCategory}"; the Commission uses only state and national.`);
  }
}

const sequences = MODULES.map((module) => module.sequence);
if (new Set(sequences).size !== sequences.length) {
  throw new Error("North Carolina course engine: two modules claim the same sequence position.");
}
for (let position = 1; position <= SECTION_COUNT; position += 1) {
  if (!sequences.includes(position)) throw new Error(`North Carolina course engine: sequence position ${position} is claimed by no module.`);
}

const sections = MODULES.map((module) => module.section);
if (new Set(sections).size !== sections.length) {
  throw new Error("North Carolina course engine: two modules claim the same Syllabus section.");
}

const bankless = MODULES.filter((module) => !MODULE_BANK[module.id]);
if (bankless.length) {
  throw new Error(`North Carolina course engine: modules with no question bank: ${bankless.map((m) => m.id).join(", ")}`);
}

/* The bank's own metadata must agree with the module table, or the two could drift apart while each
   looked complete on its own. Section, Level, examination category and item count are all the
   Commission's figures and a disagreement means one of the two is misstating the regulator. */
for (const module of MODULES) {
  const bank = MODULE_BANK[module.id];
  if (bank.syllabusSection !== module.section) {
    throw new Error(`North Carolina course engine: ${module.id} bank claims Section ${bank.syllabusSection}; the module table says ${module.section}.`);
  }
  if (bank.instructionalLevel !== module.level) {
    throw new Error(`North Carolina course engine: ${module.id} bank claims Instructional Level ${bank.instructionalLevel}; the module table says ${module.level}.`);
  }
  if (bank.examCategory !== module.examCategory) {
    throw new Error(`North Carolina course engine: ${module.id} bank claims the ${bank.examCategory} examination category; the module table says ${module.examCategory}.`);
  }
  if (bank.examItems !== module.examItems) {
    throw new Error(`North Carolina course engine: ${module.id} bank claims ${bank.examItems} examination items; the module table says ${module.examItems}.`);
  }
  if (bank.hours !== module.hours) {
    throw new Error(`North Carolina course engine: ${module.id} bank claims ${bank.hours} hours; the module table says ${module.hours}.`);
  }
}

/* Every Required Activity must name a module that exists, and every outstanding one must say what
   blocks it. An outstanding activity with no reason is an unexplained gate. */
for (const activity of REQUIRED_ACTIVITIES) {
  if (!MODULES.some((module) => module.id === activity.moduleId)) {
    throw new Error(`North Carolina course engine: Required Activity for Section ${activity.section} names unknown module ${activity.moduleId}.`);
  }
  if (activity.status !== "delivered" && activity.status !== "outstanding") {
    throw new Error(`North Carolina course engine: Required Activity for Section ${activity.section} has status "${activity.status}"; only delivered and outstanding are recognised.`);
  }
  if (activity.status === "outstanding" && !activity.blockedBy) {
    throw new Error(`North Carolina course engine: an outstanding Required Activity for Section ${activity.section} does not say what blocks it.`);
  }
}

/* The Commission's percentage and this school's must remain distinct. A refactor that collapsed them
   would present a StateCourse standard as the regulator's, or the reverse. */
if (END_OF_COURSE_PASSING_PERCENT === ENGAGEMENT_PASSING_PERCENT) {
  throw new Error("North Carolina course engine: the Commission's end-of-course passing grade and this school's in-module engagement threshold are different figures for different purposes and must not be equal.");
}

const PASSING_PERCENT = Object.freeze({
  applied: APPLIED_PASSING_PERCENT,
  engagement: ENGAGEMENT_PASSING_PERCENT,
  remediation: ENGAGEMENT_PASSING_PERCENT
});

const FINAL_EXAM = Object.freeze({
  id: "end-of-course-examination",
  hours: END_OF_COURSE_EXAM_HOURS,
  hoursAreInsideRequiredTotal: true,
  passingPercent: END_OF_COURSE_PASSING_PERCENT,
  comprehensive: true,
  closedBook: true,
  proctored: true,
  /* "EPs, at their option, may require a higher passing grade and/or other assessments." */
  providerMayRequireHigherGrade: true,
  /* "EPs and instructors shall safeguard the integrity and confidentiality of examinations at all times." */
  integrityAndConfidentialityMustBeSafeguarded: true,
  /* Rule 58H .0304(b) — reaches the attempt, and reaches use "in any manner or form." */
  licenceExaminationQuestionsMayNotBeObtainedOrUsed: true,
  prescribedByRule: true,
  ruleCitation: "Commission Rule 58H .0207, and Rule 58H .0304(b) for item security, as the Syllabus states them"
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
   recorded selection keeps its meaning permanently. Authoring puts the correct answer first; no
   student ever sees that order. */
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

export function getNorthCarolinaCourse(courseId = COURSE_ID) {
  if (courseId !== COURSE_ID) return null;
  return Object.freeze({
    courseId: COURSE_ID,
    title: "North Carolina Broker Prelicensing Course",
    version: "1.0-submission-draft",
    state: "NC",
    regulator: "North Carolina Real Estate Commission",
    totalHours: REQUIRED_TOTAL_HOURS,
    instructionalHours: REQUIRED_INSTRUCTIONAL_HOURS,
    endOfCourseExamHours: END_OF_COURSE_EXAM_HOURS,
    /* Stated explicitly because this is where North Carolina differs from every other state in this
       project, and a reader coming from those states will assume otherwise. */
    examinationHoursAreInsideTotal: true,
    sectionCount: SECTION_COUNT,
    instructionalLevels: INSTRUCTIONAL_LEVELS,
    modules: MODULES,
    finalExam: FINAL_EXAM,
    requiredActivities: REQUIRED_ACTIVITIES,
    licenceExamination: Object.freeze({
      totalItems: LICENCE_EXAM_TOTAL_ITEMS,
      stateItems: LICENCE_EXAM_STATE_ITEMS,
      nationalItems: LICENCE_EXAM_NATIONAL_ITEMS,
      note: "Item counts per section are the Commission's, published in its Syllabus. This course does not administer the licence examination and no item in this build is, paraphrases or is derived from a licence examination question."
    }),
    mathematicsInstruction: Object.freeze({
      section: MATH_SECTION,
      integratedAcrossSections: MATH_SECTION_IS_INTEGRATED,
      standaloneHours: 0,
      basicArithmeticIsOutOfScope: true,
      commissionInstruction: "Instruction on relevant mathematical functions is to be provided under the appropriate subject areas rather than as a separate arithmetic course section. Consideration was given to the amount of mathematics involved in each subject area when establishing the recommended number of instructional hours for subject areas. Instruction in basic mathematics concepts such as decimals, fractions, percentages, multiplication, division, etc. is not included in this course syllabus."
    }),
    /* What the Commission fixes. */
    commissionRequirements: Object.freeze([
      "\"The Prelicensing Course must be taught as prescribed by the Commission in this Syllabus.\"",
      `The Syllabus prescribes ${SECTION_COUNT} sections in a fixed order, with a recommended hour table totalling ${REQUIRED_INSTRUCTIONAL_HOURS} instructional hours plus ${END_OF_COURSE_EXAM_HOURS} hours of End-of-course Examination = ${REQUIRED_TOTAL_HOURS} total.`,
      "Three Instructional Levels based on Bloom's Taxonomy are assigned to every section and to many subtopics, and providers are REQUIRED to comply with them.",
      "Required Activities prescribed throughout the Syllabus \"must be completed.\"",
      `The licence examination is ${LICENCE_EXAM_TOTAL_ITEMS} items — ${LICENCE_EXAM_STATE_ITEMS} state and ${LICENCE_EXAM_NATIONAL_ITEMS} national — and the Syllabus publishes the item count for every section.`,
      "Course completion requires all three of: satisfactory completion of any required activities and homework exercises; meeting attendance requirements; and passing the end-of-course examination.",
      `Rule 58H .0207: the end-of-course examination must be comprehensive, closed-book and proctored, with a minimum passing grade of ${END_OF_COURSE_PASSING_PERCENT} percent. Providers may require a higher grade or other assessments, and must safeguard examination integrity and confidentiality at all times.`,
      "Rule 58H .0304(b): \"Instructors shall not obtain, use, or attempt to obtain or use, in any manner or form, North Carolina real estate license examination questions.\"",
      `The Prelicensing Course is valid for ${COURSE_VALIDITY_YEARS} years from the course completion date shown on the certificate.`,
      "Mathematics is to be taught inside the subject areas rather than as a separate section, and basic arithmetic instruction is expressly outside this course.",
      "Regarding homework exercises, instructional time should only be used for the introduction, and review upon completion, of the assignments."
    ]),
    /* What this school decided. */
    stateCourseDecisions: Object.freeze([
      `The allocation of the Commission's ${REQUIRED_INSTRUCTIONAL_HOURS} instructional hours among the ${SECTION_COUNT} sections, within the Commission's recommended table. The Syllabus's table is expressly RECOMMENDED.`,
      `The ${ENGAGEMENT_PASSING_PERCENT} percent in-module engagement threshold and the ${APPLIED_PASSING_PERCENT} percent applied threshold. The Syllabus prescribes no in-module assessment and no in-module passing score. The ${END_OF_COURSE_PASSING_PERCENT} percent that IS prescribed applies to the end-of-course examination.`,
      "The eleven-item shape of each module's engagement check — one applied, five engagement, five remediation.",
      "Which modules deliver each of Section XVI's required calculations, since the Commission directs integration but does not assign the calculations to sections."
    ]),
    passingPercentages: Object.freeze({
      endOfCourseExamination: Object.freeze({ percent: END_OF_COURSE_PASSING_PERCENT, examination: "the provider's comprehensive, closed-book, proctored end-of-course examination", rule: "Commission Rule 58H .0207", isCommissionFigure: true }),
      inModuleEngagement: Object.freeze({ percent: ENGAGEMENT_PASSING_PERCENT, examination: "in-module engagement and remediation checks", rule: null, isCommissionFigure: false }),
      inModuleApplied: Object.freeze({ percent: APPLIED_PASSING_PERCENT, examination: "in-module applied scenario", rule: null, isCommissionFigure: false })
    }),
    courseValidityYears: COURSE_VALIDITY_YEARS,
    sourceManifest: Object.freeze({ version: NC_MANIFEST_VERSION, controlDate: NC_CONTROL_DATE }),
    openSourceDependencies: OPEN_SOURCE_DEPENDENCIES,
    /* Backwards-compatible field name; contents are now the post-Phase-0 open dependencies. */
    unreadSources: OPEN_SOURCE_DEPENDENCIES,
    timingEvidence: TIMING_EVIDENCE,
    regulatoryBlockers: NC_BLOCKERS,
    enrollmentStatus: "closed",
    paymentStatus: "disabled",
    creditAvailability: "none",
    approvalStatus: "Not approved. No North Carolina prelicensing credit is available for this course. It may not be offered, advertised, delivered for credit, or enrolled until all provider, course, instructor, source, timing, proctoring, and operational gates are satisfied."
  });
}

export function getNorthCarolinaModule(moduleId) {
  return MODULES.find((item) => item.id === moduleId) ?? null;
}

export function getNorthCarolinaAssessment(moduleId, kind = "engagement") {
  const module = getNorthCarolinaModule(moduleId);
  const bank = MODULE_BANK[moduleId];
  if (!module || !bank) return null;
  const authored = kind === "applied" ? [bank.applied] : bank[kind];
  if (!Array.isArray(authored) || !authored.length || authored.some((item) => !item)) return null;
  return {
    id: `${moduleId}-${kind}`,
    kind,
    moduleId,
    section: module.section,
    instructionalLevel: module.level,
    passingPercent: PASSING_PERCENT[kind],
    items: authored.map((item, index) => {
      const id = `${moduleId}-${kind}-${String(index + 1).padStart(2, "0")}`;
      const presented = permuteChoices(item.choices, item.correctChoice, `${COURSE_ID}:${id}`);
      return { id, prompt: item.prompt, choices: presented.choices, correctChoice: presented.correctChoice, rationale: item.rationale };
    })
  };
}

/* The Commission requires providers and instructors to "safeguard the integrity and confidentiality
   of examinations at all times." This is the only shape that reaches a student. */
export function publicNorthCarolinaAssessment(assessment) {
  if (!assessment) return null;
  return {
    id: assessment.id,
    kind: assessment.kind,
    moduleId: assessment.moduleId,
    section: assessment.section,
    instructionalLevel: assessment.instructionalLevel,
    passingPercent: assessment.passingPercent,
    items: assessment.items.map((item) => ({ id: item.id, prompt: item.prompt, choices: [...item.choices] }))
  };
}

export function scoreNorthCarolinaAssessment(assessment, answers) {
  if (!assessment) return null;
  if (!Array.isArray(answers) || answers.length !== assessment.items.length) return null;
  const results = [];
  for (const [index, item] of assessment.items.entries()) {
    /* Number(null), Number(""), Number(false) and Number([]) are all 0, so a coerced read would
       silently record choice 0 — a selection the student never made — into a permanent record. */
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
 * Credit and completion.
 *
 * THREE conditions, all of them the Commission's: "For successful completion of the course, students
 * must 1) satisfactorily complete any required activities and homework exercises, 2) meet attendance
 * requirements, and 3) pass the end-of-course examination."
 *
 * So this function gates on all three and names which one is blocking. Required Activities are a
 * completion condition IN THEIR OWN RIGHT — a student who attended every hour and passed the
 * examination has still not completed the course if a Required Activity was not delivered to them.
 * That is why an outstanding activity in REQUIRED_ACTIVITIES blocks the certificate for everyone.
 *
 * The certificate gate sits above all three: without a Commission approval there is no approved
 * course of study and so nothing to certify.
 */
export function northCarolinaCreditedHours(moduleStates = [], options = {}) {
  const {
    finalExamPercent = null,
    attendanceMet = false,
    requiredActivitiesCompleted = null,
    approvalNumber = null,
    providerCertificationNumber = null,
    instructorApprovalNumber = null,
    timingEvidenceValidated = false,
    finalExamSecurityValidated = false
  } = options;

  const completed = new Set(
    moduleStates.filter((state) => state?.status === "completed").map((state) => state.module_id ?? state.moduleId)
  );
  const credited = MODULES.filter((module) => completed.has(module.id));
  const creditedHours = Number(credited.reduce((sum, module) => sum + module.hours, 0).toFixed(2));
  const allModulesComplete = credited.length === MODULES.length;

  const outstandingActivities = REQUIRED_ACTIVITIES.filter((activity) => activity.status === "outstanding");
  /* If the caller does not assert otherwise, the build's own record governs: activities the course
     cannot yet deliver are not completed by anyone. */
  const activitiesComplete = requiredActivitiesCompleted === null
    ? outstandingActivities.length === 0
    : Boolean(requiredActivitiesCompleted) && outstandingActivities.length === 0;

  const finalPassed = typeof finalExamPercent === "number" && finalExamPercent >= END_OF_COURSE_PASSING_PERCENT;
  const courseComplete = allModulesComplete && activitiesComplete && Boolean(attendanceMet) && finalPassed;

  return {
    completedModules: credited.length,
    totalModules: MODULES.length,
    creditedInstructionalHours: creditedHours,
    requiredInstructionalHours: REQUIRED_INSTRUCTIONAL_HOURS,
    requiredTotalHours: REQUIRED_TOTAL_HOURS,
    endOfCourseExamHours: END_OF_COURSE_EXAM_HOURS,
    sectionsCovered: Object.freeze(credited.map((module) => module.section)),
    allModulesComplete,
    requiredActivitiesComplete: activitiesComplete,
    outstandingRequiredActivities: Object.freeze(outstandingActivities.map((activity) => `Section ${activity.section}: ${activity.activity}`)),
    attendanceMet: Boolean(attendanceMet),
    endOfCourseExamPassed: finalPassed,
    endOfCoursePassingPercent: END_OF_COURSE_PASSING_PERCENT,
    courseComplete,
    certificateEligible: courseComplete
      && Boolean(providerCertificationNumber)
      && Boolean(approvalNumber)
      && Boolean(instructorApprovalNumber)
      && Boolean(timingEvidenceValidated)
      && Boolean(finalExamSecurityValidated),
    certificateBlockedBy: (() => {
      if (!allModulesComplete) {
        return `${credited.length} of ${MODULES.length} sections complete (${creditedHours} of ${REQUIRED_INSTRUCTIONAL_HOURS} instructional hours).`;
      }
      if (!activitiesComplete) {
        return outstandingActivities.length
          ? `Completion condition 1 is not met: ${outstandingActivities.length} Required Activities cannot yet be delivered by this course. The first is — Section ${outstandingActivities[0].section}: ${outstandingActivities[0].activity} (${outstandingActivities[0].blockedBy})`
          : "Completion condition 1 is not met: the Required Activities and homework exercises have not been recorded as satisfactorily completed.";
      }
      if (!attendanceMet) {
        return "Completion condition 2 is not met: the attendance requirement has not been recorded as met.";
      }
      if (!finalPassed) {
        return finalExamPercent === null
          ? "Completion condition 3 is not met: the end-of-course examination has not been taken. It must be comprehensive, closed-book and proctored."
          : `Completion condition 3 is not met: the end-of-course examination was scored at ${finalExamPercent} percent, below the ${END_OF_COURSE_PASSING_PERCENT} percent minimum under Commission Rule 58H .0207.`;
      }
      if (!providerCertificationNumber) {
        return "No North Carolina Real Estate Commission education-provider certification is recorded.";
      }
      if (!approvalNumber) {
        return "No North Carolina Real Estate Commission course approval is recorded, so there is no approved course of study to certify.";
      }
      if (!instructorApprovalNumber) {
        return "No North Carolina Real Estate Commission instructor approval is recorded for the delivering instructor.";
      }
      if (!timingEvidenceValidated) {
        return "The self-paced distance course has not demonstrated its required time under 21 NCAC 58H .0401 at 225 words per minute plus actual media duration.";
      }
      if (!finalExamSecurityValidated) {
        return "The comprehensive final-examination bank and identity/no-material proctoring workflow have not been validated.";
      }
      return null;
    })()
  };
}

/**
 * The Syllabus: the Prelicensing Course is valid for THREE YEARS from the COURSE COMPLETION DATE shown
 * on the certificate. Not from enrolment, and not from the licence application.
 *
 * completedOn and applicationDate are ISO date strings. Nothing here decides eligibility for a
 * licence — that is the Commission's. This reports what the school's own record shows.
 */
export function northCarolinaEducationValidity(completedOn, applicationDate = null) {
  if (typeof completedOn !== "string") return null;
  const completed = new Date(completedOn);
  if (Number.isNaN(completed.valueOf())) return null;

  const expiresOn = new Date(completed);
  expiresOn.setFullYear(expiresOn.getFullYear() + COURSE_VALIDITY_YEARS);

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
    validityYears: COURSE_VALIDITY_YEARS,
    expiresOn: expiresOn.toISOString().slice(0, 10),
    applicationDate: application ? application.toISOString().slice(0, 10) : null,
    withinWindow,
    measuredFrom: "the course completion date shown on the certificate",
    blockedBy: withinWindow === false
      ? `The course completion date on the certificate is ${completed.toISOString().slice(0, 10)}. The Prelicensing Course was valid until ${expiresOn.toISOString().slice(0, 10)}; the course must be taken again.`
      : null
  };
}

export const NORTH_CAROLINA_COURSE_ID = COURSE_ID;
export const NORTH_CAROLINA_MODULE_IDS = Object.freeze(MODULES.map((item) => item.id));
export const NORTH_CAROLINA_MODULES = MODULES;
export const NORTH_CAROLINA_REQUIRED_ACTIVITIES = REQUIRED_ACTIVITIES;
export const NORTH_CAROLINA_INSTRUCTIONAL_LEVELS = INSTRUCTIONAL_LEVELS;
export const NORTH_CAROLINA_OPEN_SOURCE_DEPENDENCIES = OPEN_SOURCE_DEPENDENCIES;
export const NORTH_CAROLINA_UNREAD_SOURCES = OPEN_SOURCE_DEPENDENCIES;
export const NORTH_CAROLINA_TIMING_EVIDENCE = TIMING_EVIDENCE;
export const NORTH_CAROLINA_END_OF_COURSE_PASSING_PERCENT = END_OF_COURSE_PASSING_PERCENT;
export const NORTH_CAROLINA_REQUIRED_TOTAL_HOURS = REQUIRED_TOTAL_HOURS;
export const NORTH_CAROLINA_REQUIRED_INSTRUCTIONAL_HOURS = REQUIRED_INSTRUCTIONAL_HOURS;
export const NORTH_CAROLINA_END_OF_COURSE_EXAM_HOURS = END_OF_COURSE_EXAM_HOURS;
