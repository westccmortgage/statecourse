/**
 * North Carolina Broker Prelicensing Course — tests.
 *
 * These tests hold the build to the Commission's own Syllabus. What they assert is the Commission's:
 * sixteen sections, 72.0 + 3.0 = 75.0 hours with the EXAMINATION INSIDE the total, three Instructional
 * Levels providers are REQUIRED to comply with, 140 licence examination items split 60 state / 80
 * national, three course completion conditions, a 75 percent proctored closed-book comprehensive
 * end-of-course examination, and Required Activities that must be completed.
 *
 * They also hold the original curriculum to its source boundaries. Phase 0 has since inspected the
 * current governing statutes/rules, while forms, manuals and topic-level curriculum reconciliation
 * remain explicit dependencies.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import BANK from "../config/north-carolina/module-question-bank.mjs";
import {
  getNorthCarolinaCourse,
  getNorthCarolinaModule,
  getNorthCarolinaAssessment,
  publicNorthCarolinaAssessment,
  scoreNorthCarolinaAssessment,
  northCarolinaCreditedHours,
  northCarolinaEducationValidity,
  NORTH_CAROLINA_COURSE_ID,
  NORTH_CAROLINA_MODULE_IDS,
  NORTH_CAROLINA_MODULES,
  NORTH_CAROLINA_REQUIRED_ACTIVITIES,
  NORTH_CAROLINA_UNREAD_SOURCES,
  NORTH_CAROLINA_OPEN_SOURCE_DEPENDENCIES,
  NORTH_CAROLINA_TIMING_EVIDENCE,
  NORTH_CAROLINA_END_OF_COURSE_PASSING_PERCENT,
  NORTH_CAROLINA_REQUIRED_TOTAL_HOURS,
  NORTH_CAROLINA_REQUIRED_INSTRUCTIONAL_HOURS,
  NORTH_CAROLINA_END_OF_COURSE_EXAM_HOURS
} from "../config/north-carolina-course-engine.mjs";

/* The Syllabus quotations in the curriculum are heavily blockquoted and emphasised, and prose is
   line-wrapped. Normalise before matching, or a test fails on typography rather than on content. */
const prose = (text) => text
  .replace(/^\s*>\s?/gm, "")
  .replace(/\*\*/g, "")
  .replace(/\s+/g, " ");

const readModule = (id) => prose(readFileSync(new URL(`../north-carolina/curriculum/${id}.md`, import.meta.url), "utf8"));
const readings = prose(readFileSync(new URL("../north-carolina/regulatory/primary-text-readings.md", import.meta.url), "utf8"));
const allModules = NORTH_CAROLINA_MODULE_IDS.map(readModule).join("\n\n");

/* ---- The Commission's structure ---- */

test("the course is 75 hours and the examination is INSIDE that total, not additional to it", () => {
  const course = getNorthCarolinaCourse();
  assert.equal(course.totalHours, 75);
  assert.equal(course.instructionalHours, 72);
  assert.equal(course.endOfCourseExamHours, 3);
  assert.equal(course.instructionalHours + course.endOfCourseExamHours, course.totalHours);
  assert.equal(course.examinationHoursAreInsideTotal, true);
  assert.equal(NORTH_CAROLINA_REQUIRED_INSTRUCTIONAL_HOURS + NORTH_CAROLINA_END_OF_COURSE_EXAM_HOURS, NORTH_CAROLINA_REQUIRED_TOTAL_HOURS);
});

test("the module hours sum to exactly 72.0", () => {
  const total = Number(NORTH_CAROLINA_MODULES.reduce((sum, m) => sum + m.hours, 0).toFixed(2));
  assert.equal(total, 72);
});

test("there are sixteen sections, in the Commission's order, each claimed once", () => {
  assert.equal(NORTH_CAROLINA_MODULES.length, 16);
  const sections = NORTH_CAROLINA_MODULES.map((m) => m.section);
  assert.deepEqual(sections, ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"]);
  assert.equal(new Set(sections).size, 16);
  assert.deepEqual(NORTH_CAROLINA_MODULES.map((m) => m.sequence), Array.from({ length: 16 }, (_, i) => i + 1));
});

test("Section XVI carries zero standalone hours and is flagged integrated, because the Commission says so", () => {
  const math = NORTH_CAROLINA_MODULES.find((m) => m.section === "XVI");
  assert.equal(math.hours, 0);
  assert.equal(math.integratedAcrossSections, true);
  const course = getNorthCarolinaCourse();
  assert.equal(course.mathematicsInstruction.standaloneHours, 0);
  assert.equal(course.mathematicsInstruction.integratedAcrossSections, true);
  assert.equal(course.mathematicsInstruction.basicArithmeticIsOutOfScope, true);
  assert.match(course.mathematicsInstruction.commissionInstruction, /rather than as a separate arithmetic course section/);
});

test("the licence examination is 140 items, 60 state and 80 national, and the sections sum to it", () => {
  const course = getNorthCarolinaCourse();
  assert.equal(course.licenceExamination.totalItems, 140);
  assert.equal(course.licenceExamination.stateItems, 60);
  assert.equal(course.licenceExamination.nationalItems, 80);
  const state = NORTH_CAROLINA_MODULES.filter((m) => m.examCategory === "state").reduce((s, m) => s + m.examItems, 0);
  const national = NORTH_CAROLINA_MODULES.filter((m) => m.examCategory === "national").reduce((s, m) => s + m.examItems, 0);
  assert.equal(state, 60);
  assert.equal(national, 80);
  assert.equal(state + national, 140);
});

test("Sections VII and VIII are the heaviest, at 16 items each — one national, one state", () => {
  const seven = NORTH_CAROLINA_MODULES.find((m) => m.section === "VII");
  const eight = NORTH_CAROLINA_MODULES.find((m) => m.section === "VIII");
  assert.equal(seven.examItems, 16);
  assert.equal(eight.examItems, 16);
  assert.equal(seven.examCategory, "national");
  assert.equal(eight.examCategory, "state");
  const max = Math.max(...NORTH_CAROLINA_MODULES.map((m) => m.examItems));
  assert.equal(max, 16);
});

test("every module carries one of the Commission's three Instructional Levels, with its definition", () => {
  const course = getNorthCarolinaCourse();
  assert.deepEqual(Object.keys(course.instructionalLevels).sort(), ["1", "2", "3"]);
  assert.match(course.instructionalLevels[1].name, /Knowledge and comprehension/);
  assert.match(course.instructionalLevels[2].name, /Application/);
  assert.match(course.instructionalLevels[3].name, /Analysis and evaluation/);
  for (const module of NORTH_CAROLINA_MODULES) {
    assert.ok([1, 2, 3].includes(module.level), `${module.id} has level ${module.level}`);
    assert.equal(module.instructionalLevel.level, module.level);
  }
});

test("the bank's metadata agrees with the module table on every Commission figure", () => {
  for (const module of NORTH_CAROLINA_MODULES) {
    const bank = BANK[module.id];
    assert.ok(bank, `${module.id} has no bank`);
    assert.equal(bank.syllabusSection, module.section, module.id);
    assert.equal(bank.instructionalLevel, module.level, module.id);
    assert.equal(bank.examCategory, module.examCategory, module.id);
    assert.equal(bank.examItems, module.examItems, module.id);
    assert.equal(bank.hours, module.hours, module.id);
  }
});

/* ---- Completion, examination and certification ---- */

test("the end-of-course examination is comprehensive, closed-book, proctored and 75 percent", () => {
  const exam = getNorthCarolinaCourse().finalExam;
  assert.equal(exam.comprehensive, true);
  assert.equal(exam.closedBook, true);
  assert.equal(exam.proctored, true);
  assert.equal(exam.passingPercent, 75);
  assert.equal(NORTH_CAROLINA_END_OF_COURSE_PASSING_PERCENT, 75);
  assert.equal(exam.providerMayRequireHigherGrade, true);
  assert.equal(exam.integrityAndConfidentialityMustBeSafeguarded, true);
  assert.equal(exam.hoursAreInsideRequiredTotal, true);
});

test("Rule 58H .0304(b) is carried as a structural prohibition reaching the attempt", () => {
  assert.equal(getNorthCarolinaCourse().finalExam.licenceExaminationQuestionsMayNotBeObtainedOrUsed, true);
  assert.match(readings, /shall not obtain, use, or attempt to obtain or use/i);
  assert.match(readings, /in any manner or form/i);
});

test("the Commission's 75 percent and this school's 80 percent are kept apart and labelled", () => {
  const p = getNorthCarolinaCourse().passingPercentages;
  assert.equal(p.endOfCourseExamination.percent, 75);
  assert.equal(p.endOfCourseExamination.isCommissionFigure, true);
  assert.match(p.endOfCourseExamination.rule, /58H \.0207/);
  assert.equal(p.inModuleEngagement.percent, 80);
  assert.equal(p.inModuleEngagement.isCommissionFigure, false);
  assert.equal(p.inModuleEngagement.rule, null);
  assert.equal(p.inModuleApplied.percent, 100);
  assert.equal(p.inModuleApplied.isCommissionFigure, false);
  assert.notEqual(p.endOfCourseExamination.percent, p.inModuleEngagement.percent);
});

test("all three completion conditions gate the certificate, and each names itself when blocking", () => {
  const all = NORTH_CAROLINA_MODULE_IDS.map((id) => ({ module_id: id, status: "completed" }));

  const noModules = northCarolinaCreditedHours([], { finalExamPercent: 90, attendanceMet: true, requiredActivitiesCompleted: true, approvalNumber: "X" });
  assert.equal(noModules.certificateEligible, false);
  assert.match(noModules.certificateBlockedBy, /0 of 16 sections complete/);

  const noActivities = northCarolinaCreditedHours(all, { finalExamPercent: 90, attendanceMet: true, requiredActivitiesCompleted: false, approvalNumber: "X" });
  assert.equal(noActivities.certificateEligible, false);
  assert.match(noActivities.certificateBlockedBy, /Completion condition 1/);

  const noAttendance = northCarolinaCreditedHours(all, { finalExamPercent: 90, attendanceMet: false, requiredActivitiesCompleted: true, approvalNumber: "X" });
  assert.equal(noAttendance.certificateEligible, false);
  assert.match(noAttendance.certificateBlockedBy, /Completion condition 1|Completion condition 2/);

  const failedExam = northCarolinaCreditedHours(all, { finalExamPercent: 74, attendanceMet: true, requiredActivitiesCompleted: true, approvalNumber: "X" });
  assert.equal(failedExam.certificateEligible, false);
  assert.equal(failedExam.endOfCourseExamPassed, false);
});

test("74 percent fails and 75 percent passes the Commission's end-of-course threshold", () => {
  const all = NORTH_CAROLINA_MODULE_IDS.map((id) => ({ module_id: id, status: "completed" }));
  assert.equal(northCarolinaCreditedHours(all, { finalExamPercent: 74 }).endOfCourseExamPassed, false);
  assert.equal(northCarolinaCreditedHours(all, { finalExamPercent: 75 }).endOfCourseExamPassed, true);
});

test("outstanding Required Activities block the certificate for everyone while they remain outstanding", () => {
  const all = NORTH_CAROLINA_MODULE_IDS.map((id) => ({ module_id: id, status: "completed" }));
  const result = northCarolinaCreditedHours(all, { finalExamPercent: 100, attendanceMet: true, requiredActivitiesCompleted: true, approvalNumber: "X" });
  assert.ok(result.outstandingRequiredActivities.length > 0, "this build still has outstanding Required Activities");
  assert.equal(result.requiredActivitiesComplete, false);
  assert.equal(result.certificateEligible, false);
  assert.match(result.certificateBlockedBy, /Completion condition 1/);
});

test("even a fully complete student gets no certificate without a recorded Commission approval", () => {
  const all = NORTH_CAROLINA_MODULE_IDS.map((id) => ({ module_id: id, status: "completed" }));
  const result = northCarolinaCreditedHours(all, { finalExamPercent: 100, attendanceMet: true, requiredActivitiesCompleted: true, approvalNumber: null });
  assert.equal(result.certificateEligible, false);
});

test("the course states its own approval status plainly and claims nothing", () => {
  const status = getNorthCarolinaCourse().approvalStatus;
  assert.match(status, /Not approved/);
  assert.match(status, /No North Carolina prelicensing credit is available/);
  assert.doesNotMatch(status, /\bState Approved\b/i);
});

test("the three-year course validity runs from the course completion date on the certificate", () => {
  const inside = northCarolinaEducationValidity("2026-08-20", "2029-01-15");
  assert.equal(inside.validityYears, 3);
  assert.equal(inside.expiresOn, "2029-08-20");
  assert.equal(inside.withinWindow, true);
  assert.equal(inside.blockedBy, null);
  assert.match(inside.measuredFrom, /course completion date shown on the certificate/);

  const outside = northCarolinaEducationValidity("2026-08-20", "2029-09-01");
  assert.equal(outside.withinWindow, false);
  assert.match(outside.blockedBy, /valid until 2029-08-20/);

  assert.equal(northCarolinaEducationValidity(null), null);
  assert.equal(northCarolinaEducationValidity("not a date"), null);
});

/* ---- Assessment mechanics ---- */

test("every module has one applied, five engagement and five remediation items — 176 in all", () => {
  let total = 0;
  for (const id of NORTH_CAROLINA_MODULE_IDS) {
    const bank = BANK[id];
    assert.ok(bank.applied, `${id} has no applied item`);
    assert.equal(bank.engagement.length, 5, id);
    assert.equal(bank.remediation.length, 5, id);
    total += 1 + bank.engagement.length + bank.remediation.length;
  }
  assert.equal(total, 176);
});

test("every authored item has four choices, the correct answer at index 0, a real prompt and a rationale", () => {
  for (const id of NORTH_CAROLINA_MODULE_IDS) {
    const bank = BANK[id];
    for (const item of [bank.applied, ...bank.engagement, ...bank.remediation]) {
      assert.equal(item.choices.length, 4, `${id}: ${item.prompt}`);
      assert.equal(item.correctChoice, 0, `${id}: ${item.prompt}`);
      assert.equal(new Set(item.choices).size, 4, `${id} has duplicate choices: ${item.prompt}`);
      assert.ok(item.prompt.length >= 25, `${id} prompt too short: ${item.prompt}`);
      assert.ok(item.rationale && item.rationale.length >= 40, `${id} rationale too short: ${item.prompt}`);
    }
  }
});

test("delivery permutes choices deterministically and the recorded selection keeps its meaning", () => {
  const first = getNorthCarolinaAssessment("module-08", "engagement");
  const second = getNorthCarolinaAssessment("module-08", "engagement");
  assert.deepEqual(first.items.map((i) => i.choices), second.items.map((i) => i.choices));
  assert.deepEqual(first.items.map((i) => i.correctChoice), second.items.map((i) => i.correctChoice));
  for (const [index, item] of first.items.entries()) {
    assert.equal(item.choices[item.correctChoice], BANK["module-08"].engagement[index].choices[0]);
  }
});

test("at least one module's delivered order actually differs from the authored order", () => {
  const moved = NORTH_CAROLINA_MODULE_IDS.some((id) => {
    const assessment = getNorthCarolinaAssessment(id, "engagement");
    return assessment.items.some((item) => item.correctChoice !== 0);
  });
  assert.equal(moved, true, "the permutation is not doing anything");
});

test("the public shape carries no answer key and no rationale", () => {
  for (const id of NORTH_CAROLINA_MODULE_IDS) {
    for (const kind of ["applied", "engagement", "remediation"]) {
      const serialised = JSON.stringify(publicNorthCarolinaAssessment(getNorthCarolinaAssessment(id, kind)));
      assert.doesNotMatch(serialised, /correctChoice/, `${id} ${kind}`);
      assert.doesNotMatch(serialised, /rationale/, `${id} ${kind}`);
    }
  }
});

test("the public shape still carries the section and Instructional Level a student needs", () => {
  const pub = publicNorthCarolinaAssessment(getNorthCarolinaAssessment("module-13", "engagement"));
  assert.equal(pub.section, "XIII");
  assert.equal(pub.instructionalLevel, 1);
  assert.equal(pub.passingPercent, 80);
});

test("scoring rejects coerced non-answers rather than recording a selection nobody made", () => {
  const assessment = getNorthCarolinaAssessment("module-01", "engagement");
  const valid = assessment.items.map((item) => item.correctChoice);
  assert.equal(scoreNorthCarolinaAssessment(assessment, valid).percent, 100);
  for (const bad of [null, "", false, [], undefined, {}, "1.5", " ", "abc", -1, 4, 1.5, NaN]) {
    const answers = [...valid];
    answers[0] = bad;
    assert.equal(scoreNorthCarolinaAssessment(assessment, answers), null, `accepted ${JSON.stringify(bad)}`);
  }
  assert.equal(scoreNorthCarolinaAssessment(assessment, valid.slice(1)), null);
  assert.equal(scoreNorthCarolinaAssessment(null, valid), null);
});

test("a numeric string answer is accepted, because a form field is a string", () => {
  const assessment = getNorthCarolinaAssessment("module-01", "engagement");
  const answers = assessment.items.map((item) => String(item.correctChoice));
  assert.equal(scoreNorthCarolinaAssessment(assessment, answers).percent, 100);
});

test("the applied item requires 100 percent and engagement requires 80", () => {
  assert.equal(getNorthCarolinaAssessment("module-11", "applied").passingPercent, 100);
  assert.equal(getNorthCarolinaAssessment("module-11", "engagement").passingPercent, 80);
  assert.equal(getNorthCarolinaAssessment("module-11", "remediation").passingPercent, 80);
});

test("unknown course and module ids return null rather than a partially built object", () => {
  assert.equal(getNorthCarolinaCourse("nc-something-else"), null);
  assert.equal(getNorthCarolinaModule("module-99"), null);
  assert.equal(getNorthCarolinaAssessment("module-99", "engagement"), null);
  assert.equal(getNorthCarolinaAssessment("module-01", "nonsense"), null);
});

/* ---- The curriculum against the Syllabus ---- */

test("every module file exists, carries its section, its Level and its examination weight", () => {
  for (const module of NORTH_CAROLINA_MODULES) {
    const text = readModule(module.id);
    assert.match(text, new RegExp(`Section ${module.section} ·`), `${module.id} does not name its section`);
    assert.match(text, /Instructional Level:/, module.id);
    assert.match(text, /Licence examination weight:/, module.id);
    assert.match(text, new RegExp(`${module.examItems} items?`), `${module.id} does not carry its item count`);
    assert.match(text, /Regulatory status: Development\. Not approved\./, module.id);
  }
});

test("Module NC-01 teaches the current official licensing workflow rather than historical source excuses", () => {
  const one = readModule("module-01");
  for (const required of [
    /at least 18 years old/i,
    /75-hour North Carolina Broker Prelicensing Course/i,
    /three years preceding the license application/i,
    /six months before the application is filed/i,
    /180-calendar-day examination eligibility period/i,
    /National \| 80 \| 5/,
    /State \| 60 \| 5/,
    /\$105/,
    /\$53/,
    /90 instructional hours.*within 18 months/is,
    /June 10/,
    /June 30/,
    /does not authorize the practice of law/i
  ]) assert.match(one, required);

  assert.match(one, /Commission determines comparable status/i);
  assert.match(one, /waive the NC State section.*provisional broker status/is);
  assert.match(one, /G\.S\. 93A-4/);
  assert.match(one, /21 NCAC 58A \.0511/);
  assert.match(one, /RELINC/);
  for (const stale of [
    /This course states no age requirement/i,
    /This course states no postlicensing hour requirement/i,
    /Neither was obtained for this project/i,
    /governing statute and rules were not read/i
  ]) assert.doesNotMatch(one, stale);
});

test("Module NC-02 teaches current supervision and compensation controls", () => {
  const two = readModule("module-02");
  for (const required of [
    /Rule 58A \.0506/,
    /30 days of the date shown on the form/i,
    /10 days after termination/i,
    /Rule 58A \.0110/,
    /two years of brokerage experience.*previous five years/is,
    /12-hour BIC Course/i,
    /Rule 58A \.0109/,
    /does not set commission rates or arbitrate private fee and split disputes/i,
    /Rule 58A \.0120\(b\)/,
    /current BIC or the person who served as BIC at the time of the transaction/i
  ]) assert.match(two, required);

  for (const stale of [
    /This course states no BIC eligibility requirement/i,
    /Commission Rules 58A \.0109.*none obtained/is,
    /this course states no compensation rule/i
  ]) assert.doesNotMatch(two, stale);
});

test("Module NC-03 uses the prescribed four-part fixture test and supplies the delivered activity evidence", () => {
  const three = readModule("module-03");
  for (const criterion of [
    /Intent of the annexor/i,
    /Relationship of the annexor to the property/i,
    /Method of annexation/i,
    /Adaptation to the real estate/i
  ]) assert.match(three, criterion);
  assert.match(three, /all four.*must be present/is);
  assert.match(BANK["module-03"].engagement[0].choices[0], /All four stated criteria/i);

  const activities = NORTH_CAROLINA_REQUIRED_ACTIVITIES.filter((a) => a.section === "III");
  assert.equal(activities.length, 6);
  const delivered = activities.filter((a) => a.status === "delivered");
  assert.equal(delivered.length, 3);
  for (const activity of delivered) assert.ok(activity.evidencePath, `no evidence path: ${activity.activity}`);
  for (const asset of ["nc-fixture-decision-lab.svg", "nc-government-survey-grid.svg", "nc-metes-bounds-training-exhibit.svg"]) {
    assert.equal(existsSync(new URL(`../public/statecourse/media/${asset}`, import.meta.url)), true, asset);
    assert.match(three, new RegExp(`/media/${asset.replaceAll(".", "\\.")}`));
  }
});

test("Module NC-03 gives every prescribed zoning concept an example without claiming a statewide code", () => {
  const three = readModule("module-03");
  for (const concept of [
    "Nonconforming use", "Illegal use", "Zoning amendment", "Variance", "Special-use or conditional-use permit",
    "Overlay district", "Historic preservation zoning", "Aesthetic zoning", "Spot zoning", "Cluster zoning", "Buffer zone"
  ]) assert.match(three, new RegExp(`\\| ${concept.replace("-", "[-‑]")} \\|`, "i"));
  assert.match(three, /do not state that any particular North Carolina ordinance allows the result/i);
});

test("Module NC-04 corrects the obsolete fourth-year adjustment and teaches current tax statutes", () => {
  const four = readModule("module-04");
  for (const required of [
    /G\.S\. 105-286 requires advancement/i,
    /repealed subsections 105-286\(b\) and \(c\).*July 1, 2009/is,
    /G\.S\. 105-228\.30 requires the transferor/i,
    /\$1(?:\.00)? (?:on|for) each \$500.*fractional part/i,
    /consideration or value of the interest conveyed/i,
    /one free report every 12 months/i,
    /general maximum exclusion is \$250,000/i,
    /\$500,000.*joint-return requirements/is
  ]) assert.match(four, required);
  assert.doesNotMatch(four, /Horizontal reappraisal by a municipality is possible in the 4th year/i);

  const exciseActivity = NORTH_CAROLINA_REQUIRED_ACTIVITIES.find((a) => a.activity.startsWith("Calculate excise tax"));
  assert.equal(exciseActivity.status, "delivered");
  assert.match(exciseActivity.evidencePath, /module-04/);
  assert.doesNotMatch(JSON.stringify(BANK["module-04"]), /statute setting it was not obtained|states no North Carolina excise tax rate/i);
});

test("no module claims approval or offers credit", () => {
  assert.doesNotMatch(allModules, /\bState Approved\b/i);
  assert.doesNotMatch(allModules, /\bEnroll Now\b/i);
  assert.doesNotMatch(allModules, /credit is available for this course\b(?! until)/i);
});

test("the North Carolina departures from the national rules are stated in the curriculum", () => {
  const six = readModule("module-06");
  const fifteen = readModule("module-15");
  /* Survivorship is NOT automatic in a NC joint tenancy. */
  assert.match(fifteen, /In NC, survivorship not automatic/i);
  assert.match(fifteen, /Attorney must draft exact wording/i);
  /* But it IS automatic, unwaivable and will-overriding in a tenancy by the entirety. */
  assert.match(fifteen, /Automatic right of survivorship that cannot be waived; overrides a will/i);
  /* Unequal interests are permitted. */
  assert.match(fifteen, /percentage of ownership interest can be unequal/i);
  assert.match(six, /survivorship/i);
});

test("the two contract-structure facts a broker cannot get wrong are stated in Module NC-11", () => {
  const eleven = readModule("module-11");
  assert.match(eleven, /NO FINANCING OR APPRAISAL CONTINGENCIES/i);
  assert.match(eleven, /[Dd]ue [Dd]iligence/);
  assert.match(eleven, /Settlement/);
  assert.match(eleven, /Closing/);
});

test("the material fact rules that run against intuition are stated in Modules NC-10 and NC-15", () => {
  const ten = readModule("module-10");
  const fifteen = readModule("module-15");
  /* Material even after remediation. */
  assert.match(ten, /EIFS|synthetic stucco/i);
  assert.match(ten, /polybutylene/i);
  /* Not material. */
  assert.match(fifteen, /haunted/i);
  assert.match(fifteen, /not a material fact in NC unless questioned by the buyer/i);
  assert.match(fifteen, /Square footage is not a material fact in NC, but must be accurate if reported/i);
  /* Material. */
  assert.match(fifteen, /Responsibility for street maintenance is a material fact/i);
});

test("the Connor Act is described as a pure race statute with its correct limit", () => {
  const fifteen = readModule("module-15");
  assert.match(fifteen, /pure race statute/i);
  assert.match(fifteen, /Failure to record does not affect the validity of the document between the parties/i);
});

test("the fair housing structure — identical prohibitions, different exemptions — is stated", () => {
  const fifteen = readModule("module-15");
  assert.match(fifteen, /virtually identical/i);
  assert.match(fifteen, /substantially different/i);
  assert.match(fifteen, /more restrictive law applies/i);
});

test("the landlord-tenant rules a property manager must know are stated in Module NC-14", () => {
  const fourteen = readModule("module-14");
  assert.match(fourteen, /is defined as .the landlord. under the Act/i);
  assert.match(fourteen, /Waiver of Act is prohibited/i);
  assert.match(fourteen, /Self-help eviction is prohibited in NC/i);
  assert.match(fourteen, /prohibited from unilaterally withholding the rent/i);
  assert.match(fourteen, /service animal is not a pet/i);
});

test("the two proration methods and the North Carolina settlement-date rule are stated", () => {
  const twelve = readModule("module-12");
  assert.match(twelve, /365-Day Year Method/i);
  assert.match(twelve, /360-Day Year ?\/ ?30-Day Month Method|360-day\/30-day/i);
  assert.match(twelve, /in NC, the seller .owns. the date of settlement/i);
  assert.match(twelve, /Always a double entry/i);
});

test("the GRM discrepancy is flagged openly rather than papered over, and the Commission's exclusion is carried", () => {
  const thirteen = readModule("module-13");
  assert.match(thirteen, /not algebraically consistent/i);
  assert.match(thirteen, /flagged for the Commission's reviewer/i);
  assert.match(thirteen, /There will be no calculations using a GRM/i);
  const sixteen = readModule("module-16");
  assert.match(sixteen, /There will be no calculations using a GRM/i);
});

test("Module NC-16 records its zero hours as the Commission's instruction, not as an omission", () => {
  const sixteen = readModule("module-16");
  assert.match(sixteen, /rather than as a separate arithmetic course section/i);
  assert.match(sixteen, /0\.0 as a standalone block/i);
  assert.match(sixteen, /double-count/i);
});

/* ---- Source and timing boundaries ---- */

test("Phase 0 supersedes the original statute/rule gap while carrying live course-material dependencies", () => {
  assert.match(readings, /2026-09-04 Phase 0 supersession notice/i);
  assert.strictEqual(NORTH_CAROLINA_UNREAD_SOURCES, NORTH_CAROLINA_OPEN_SOURCE_DEPENDENCIES);
  assert.ok(NORTH_CAROLINA_OPEN_SOURCE_DEPENDENCIES.length >= 10);
  const joined = NORTH_CAROLINA_OPEN_SOURCE_DEPENDENCIES.join(" | ");
  for (const source of ["Form 2-T", "REC 4.22", "REC 4.25", "Residential Square Footage Guidelines", "URAR"]) {
    assert.ok(joined.includes(source), `open dependency list does not name ${source}`);
  }
  assert.doesNotMatch(joined, /^NCGS Chapter 93A \(Real Estate License Law\)/);
  assert.doesNotMatch(joined, /^21 NCAC 58A, 58B and 58H in their own text/);
});

test("planned module labels do not masquerade as validated self-paced timing", () => {
  assert.equal(NORTH_CAROLINA_TIMING_EVIDENCE.validated, false);
  assert.equal(NORTH_CAROLINA_TIMING_EVIDENCE.commissionReadingRateWordsPerMinute, 225);
  assert.equal(NORTH_CAROLINA_TIMING_EVIDENCE.instructionalMinutesPerHour, 50);
  assert.equal(NORTH_CAROLINA_TIMING_EVIDENCE.requiredInstructionalMinutes, 3600);
  assert.ok(NORTH_CAROLINA_TIMING_EVIDENCE.curriculumBaselineMinutes < 300);
  assert.equal(getNorthCarolinaCourse().enrollmentStatus, "closed");
  assert.equal(getNorthCarolinaCourse().paymentStatus, "disabled");
});

test("every module carries an instructor source note and an explicit source boundary", () => {
  for (const module of NORTH_CAROLINA_MODULES) {
    const text = readModule(module.id);
    assert.match(text, /Instructor source note/i, module.id);
    assert.match(text, /([Nn]ot (read|obtained)|dependency|limitation)/, `${module.id} does not name its source boundary`);
  }
});

test("no module reproduces or paraphrases Form 2-T, which was never obtained", () => {
  const eleven = readModule("module-11");
  assert.match(eleven, /has NOT obtained Form 2-T/i);
  assert.match(eleven, /reproduces, describes, paraphrases or explains any provision of Form/i);
  /* A paragraph-numbered reference to the form would mean somebody read it. */
  assert.doesNotMatch(allModules, /Form 2-T,? [Pp]aragraph \d/);
});

test("every period in an authored answer or rationale is on the reviewed-source allowlist", () => {
  /* This allowlist includes figures from the prescribed Syllabus and the current official sources
     identified in the relevant module source notes. A new period requires a source-note update. */
  const permitted = [
    /\b3[- ](business[- ])?years?\b/i, /\bthree[- ]years?\b/i, /\b7[- ]day\b/i, /\bseven[- ]day\b/i,
    /\b20 years?\b/i, /\btwenty years?\b/i, /\b7 years?\b/i, /\bseven years?\b/i,
    /\b3 years?\b/i, /\b1 year\b/i, /\bone year\b/i, /\b12[- ]month\b/i, /\btwelve[- ]month\b/i,
    /\b3 banking days?\b/i, /\bthree banking days?\b/i, /\b3 business days?\b/i, /\bthree business days?\b/i,
    /\b120 days?\b/i, /\b5 (separated )?times?\b/i, /\bfive (separated )?times?\b/i,
    /\b5 years?\b/i, /\bfive years?\b/i, /\b30-?year\b/i, /\b33 ?- ?38 years?\b/i,
    /\b3 ?- ?5 years?\b/i, /\b10-day\b/i, /\b10 days?\b/i, /\bten-day\b/i, /\b60 minutes?\b/i, /\b30-day\b/i, /\b360-day\b/i, /\b365-day\b/i,
    /\b30 days?\b/i, /\b3[- ]day\b/i, /\bthree[- ]day\b/i, /\b3\.0 hours?\b/i,
    /\b(eight|8) months?\b/i, /\b(sixteen|16) days?\b/i, /\b(one|1) month\b/i, /\b(nine|9) months?\b/i,
    /\b(six|6) months?\b/i, /\b18 months?\b/i, /\b180[- ](calendar[- ])?days?\b/i, /\b(two|2) years?\b/i
  ];
  const quantified = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|sixty|ninety|hundred|hundred and twenty)[\s-]+(business\s+|banking\s+|calendar\s+)?(days?|years?|months?|weeks?)\b/gi;
  for (const id of NORTH_CAROLINA_MODULE_IDS) {
    const bank = BANK[id];
    for (const item of [bank.applied, ...bank.engagement, ...bank.remediation]) {
      const text = `${item.choices[0]} ${item.rationale}`;
      for (const match of text.match(quantified) ?? []) {
        /* Hyphenated and spaced forms are the same figure — "3-year" and "3 years" both. */
        const normalised = match.replace(/-/g, " ");
        assert.ok(
          permitted.some((pattern) => pattern.test(match) || pattern.test(normalised)),
          `${id} states an unapproved period: "${match}" in "${item.prompt}"`
        );
      }
    }
  }
});

test("no item claims Commission approval or endorsement in its authored answer", () => {
  for (const id of NORTH_CAROLINA_MODULE_IDS) {
    const bank = BANK[id];
    for (const item of [bank.applied, ...bank.engagement, ...bank.remediation]) {
      const text = `${item.choices[0]} ${item.rationale}`;
      assert.doesNotMatch(text, /this course is (Commission[- ])?approved/i, `${id}: ${item.prompt}`);
      assert.doesNotMatch(text, /endorsed by the Commission/i, `${id}: ${item.prompt}`);
    }
  }
});

/* ---- Required Activities ---- */

test("every Required Activity names a real module and every outstanding one says what blocks it", () => {
  assert.ok(NORTH_CAROLINA_REQUIRED_ACTIVITIES.length >= 30);
  for (const activity of NORTH_CAROLINA_REQUIRED_ACTIVITIES) {
    assert.ok(NORTH_CAROLINA_MODULE_IDS.includes(activity.moduleId), activity.activity);
    assert.ok(["delivered", "outstanding"].includes(activity.status), activity.activity);
    if (activity.status === "outstanding") {
      assert.ok(activity.blockedBy && activity.blockedBy.length > 20, `no reason given: ${activity.activity}`);
    }
  }
});

test("the Required Activities that depend on unobtained forms are recorded as outstanding, not delivered", () => {
  const byText = (needle) => NORTH_CAROLINA_REQUIRED_ACTIVITIES.find((a) => a.activity.includes(needle));
  for (const needle of ["Form 2-T", "RPOADS", "Square Footage Guidelines", "Uniform Residential Appraisal Report", "sample Loan Estimate", "HUD-1"]) {
    const activity = byText(needle);
    assert.ok(activity, `no Required Activity mentions ${needle}`);
    assert.equal(activity.status, "outstanding", `${needle} is recorded as delivered but the artefact was never obtained`);
  }
});

test("unobtained North Carolina property exhibits are not recorded as delivered", () => {
  const byText = (needle) => NORTH_CAROLINA_REQUIRED_ACTIVITIES.find((a) => a.activity.includes(needle));
  for (const needle of ["deed and a survey", "approved subdivision plat map", "residential property survey"]) {
    const activity = byText(needle);
    assert.ok(activity, `no Required Activity mentions ${needle}`);
    assert.equal(activity.status, "outstanding", `${needle} is recorded as delivered without an acceptable exhibit`);
  }
});

test("Section XIV has no Required Activity, which is a fact about the Syllabus and is recorded as such", () => {
  const fourteen = NORTH_CAROLINA_REQUIRED_ACTIVITIES.filter((a) => a.section === "XIV");
  assert.equal(fourteen.length, 0);
  assert.match(readModule("module-14"), /Commission prescribes no Required Activity for Section XIV/i);
});

/* ---- The engine's own defences ---- */

test("the payload separates what the Commission fixed from what this school decided", () => {
  const course = getNorthCarolinaCourse();
  assert.ok(course.commissionRequirements.length >= 8);
  assert.ok(course.stateCourseDecisions.length >= 3);
  assert.ok(course.commissionRequirements.some((line) => /must be taught as prescribed by the Commission/i.test(line)));
  assert.ok(course.stateCourseDecisions.some((line) => /80 percent in-module engagement threshold/i.test(line)));
  /* The engagement threshold must never be presented as the Commission's. */
  assert.ok(!course.commissionRequirements.some((line) => /80 percent in-module/i.test(line)));
});

test("the frozen payload cannot be mutated by a caller", () => {
  const course = getNorthCarolinaCourse();
  assert.throws(() => { course.totalHours = 90; }, TypeError);
  assert.throws(() => { course.modules[0].hours = 99; }, TypeError);
  assert.equal(course.totalHours, 75);
});

test("the course id is stable and every module id is unique", () => {
  assert.equal(NORTH_CAROLINA_COURSE_ID, "nc-broker-prelicensing-75-v1");
  assert.equal(new Set(NORTH_CAROLINA_MODULE_IDS).size, 16);
  assert.equal(getNorthCarolinaCourse().courseId, NORTH_CAROLINA_COURSE_ID);
});
