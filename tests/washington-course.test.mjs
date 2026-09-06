/**
 * Washington broker prelicensing — tests.
 *
 * Three things these tests exist to hold.
 *
 * ONE: the statutory fair housing block. RCW 18.85.101(1)(c) requires the fundamentals course to include
 * "three hours of instruction on fair housing and consumer protection issues." This build delivers it as
 * one auditable 3.0-hour module inside Fundamentals, and a test fails if it is missing, mis-sized, split,
 * or moved to Practices.
 *
 * TWO: the examination size rule that SCALES. WAC 308-124H-820(8) requires "no fewer than three questions
 * per clock hour with a minimum of 90 questions" for a course of 30 clock hours or more. Fundamentals needs
 * >= 180 and Practices >= 90, and the engine computes that from hours rather than hard-coding it.
 *
 * THREE: that Washington is not a common-law fiduciary state. RCW 18.86.110 makes the duties STATUTORY and
 * supersedes the fiduciary duties. A test asserts the payload says so, and that a limited dual agent is not
 * recorded as owing loyalty — because RCW 18.86.060 does not name it.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import FUNDAMENTALS_BANK from "../config/washington/fundamentals-60-question-bank.mjs";
import PRACTICES_BANK from "../config/washington/practices-30-question-bank.mjs";
import {
  getWashingtonCourse,
  getWashingtonProgram,
  getWashingtonModule,
  getWashingtonAssessment,
  publicWashingtonAssessment,
  scoreWashingtonAssessment,
  washingtonCourseCredit,
  washingtonEducationReadiness,
  washingtonEducationValidity,
  washingtonRequiredExaminationItems,
  WASHINGTON_COURSE_IDS,
  WASHINGTON_STATUTORY_RELATIONSHIPS,
  WASHINGTON_UNWAIVABLE_DUTIES,
  WASHINGTON_CERTIFICATE_REQUIRED_ITEMS,
  WASHINGTON_DISTANCE_EDUCATION_CRITERIA,
  WASHINGTON_SUBMISSION_GATES,
  WASHINGTON_UNREAD_SOURCES,
  WASHINGTON_REQUIRED_TOTAL_HOURS,
  WASHINGTON_STATUTORY_FAIR_HOUSING_HOURS,
  WASHINGTON_MINUTES_PER_CLOCK_HOUR,
  WASHINGTON_COURSE_EXAM_PASSING_PERCENT,
  WASHINGTON_EDUCATION_VALIDITY_YEARS,
  WASHINGTON_BUYER_SERVICES_AGREEMENT_DEFAULT_TERM_DAYS
} from "../config/washington-course-engine.mjs";

const FUNDAMENTALS = "wa-real-estate-fundamentals-60-v1";
const PRACTICES = "wa-real-estate-practices-30-v1";

const prose = (text) => text
  .replace(/^\s*>\s?/gm, "")
  .replace(/\*\*/g, "")
  .replace(/\s+/g, " ");

const CURRICULUM_DIR = {
  [FUNDAMENTALS]: "washington/wa-real-estate-fundamentals-60-v1/curriculum",
  [PRACTICES]: "washington/wa-real-estate-practices-30-v1/curriculum"
};

const readModule = (courseId, moduleId) =>
  prose(readFileSync(new URL(`../${CURRICULUM_DIR[courseId]}/${moduleId}.md`, import.meta.url), "utf8"));
const readings = prose(readFileSync(new URL("../washington/regulatory/primary-text-readings.md", import.meta.url), "utf8"));

const allModuleIds = (courseId) => getWashingtonCourse(courseId).modules.map((m) => m.id);
const allText = WASHINGTON_COURSE_IDS
  .flatMap((courseId) => allModuleIds(courseId).map((id) => readModule(courseId, id)))
  .join("\n\n");

/* ---- The statutory 90 hours, and the split ---- */

test("the two course metadata allocations total the planned statutory 90 hours, without proving delivery", () => {
  assert.equal(WASHINGTON_REQUIRED_TOTAL_HOURS, 90);
  const program = getWashingtonProgram();
  assert.equal(program.deliveredHours, 90);
  assert.equal(program.requiredHours, 90);
  assert.equal(getWashingtonCourse(FUNDAMENTALS).hours, 60);
  assert.equal(getWashingtonCourse(PRACTICES).hours, 30);
});

test("each course's module hours sum to the course total", () => {
  for (const courseId of WASHINGTON_COURSE_IDS) {
    const course = getWashingtonCourse(courseId);
    const sum = course.modules.reduce((total, m) => total + m.hours, 0);
    assert.equal(sum, course.hours, courseId);
  }
});

test("the 60/30 split is fixed by the current DOL prescribed curricula", () => {
  const program = getWashingtonProgram();
  assert.equal(program.hourAllocationIsStateCourseDecision, false);
  assert.match(program.note, /DOL prescribed curricula fix 60 hours/i);
  const gate = WASHINGTON_SUBMISSION_GATES.find((g) => g.id === "course-hour-allocation");
  assert.ok(gate);
  assert.equal(gate.satisfied, true);
  const course = getWashingtonCourse(FUNDAMENTALS);
  assert.ok(course.stateCourseDecisions.some((line) => /module-level allocation/.test(line)));
});

test("both courses are recorded as named by the statute", () => {
  for (const courseId of WASHINGTON_COURSE_IDS) {
    const course = getWashingtonCourse(courseId);
    assert.equal(course.namedInStatute, true, courseId);
    assert.match(course.statuteCitation, /18\.85\.101\(1\)\(c\)/, courseId);
  }
  assert.equal(getWashingtonCourse(FUNDAMENTALS).title, "Real Estate Fundamentals");
  assert.equal(getWashingtonCourse(PRACTICES).title, "Real Estate Practices");
});

/* ---- The statutory fair housing block ---- */

test("Fundamentals allocates a planned three-hour fair housing block without proving actual instruction time", () => {
  assert.equal(WASHINGTON_STATUTORY_FAIR_HOUSING_HOURS, 3);
  const fundamentals = getWashingtonCourse(FUNDAMENTALS);
  assert.equal(fundamentals.carriesStatutoryFairHousingBlock, true);
  assert.equal(fundamentals.statutoryFairHousingHours, 3);
  const blocks = fundamentals.modules.filter((m) => m.isStatutoryFairHousingBlock);
  assert.equal(blocks.length, 1, "the block must be one auditable module");
  assert.equal(blocks[0].hours, 3);
  const practices = getWashingtonCourse(PRACTICES);
  assert.equal(practices.carriesStatutoryFairHousingBlock, false);
  assert.equal(practices.statutoryFairHousingHours, 0);
  assert.equal(practices.modules.filter((m) => m.isStatutoryFairHousingBlock).length, 0);
});

test("the fair housing bank module agrees with the module table", () => {
  const block = getWashingtonCourse(FUNDAMENTALS).modules.find((m) => m.isStatutoryFairHousingBlock);
  assert.equal(FUNDAMENTALS_BANK[block.id].isStatutoryFairHousingBlock, true);
  assert.equal(FUNDAMENTALS_BANK[block.id].hours, 3);
});

test("the fair housing module names its statutory basis and its submission gate", () => {
  const block = getWashingtonCourse(FUNDAMENTALS).modules.find((m) => m.isStatutoryFairHousingBlock);
  const text = readModule(FUNDAMENTALS, block.id);
  assert.match(text, /RCW 18\.85\.101\(1\)\(c\)/);
  assert.match(text, /three hours of instruction on fair housing and consumer protection issues/i);
  assert.match(text, /308-124A-802/);
  assert.match(text, /only primary providers/i);
});

/* ---- The examination size rule that scales ---- */

test("WAC 308-124H-820(8) is computed from hours, not hard-coded", () => {
  assert.equal(washingtonRequiredExaminationItems(60), 180);
  assert.equal(washingtonRequiredExaminationItems(30), 90);
  assert.equal(washingtonRequiredExaminationItems(45), 135);
  /* The 90-question floor binds below 30 questions-per-hour worth of hours. */
  assert.equal(washingtonRequiredExaminationItems(31), 93);
  /* Below the 30-clock-hour threshold the rule does not apply. */
  assert.equal(washingtonRequiredExaminationItems(29), 0);
  assert.equal(washingtonRequiredExaminationItems(3), 0);
});

test("each course carries its rule-computed examination requirement and the director's 70 percent", () => {
  const fundamentals = getWashingtonCourse(FUNDAMENTALS).courseExamination;
  assert.equal(fundamentals.requiredByRule, true);
  assert.equal(fundamentals.minimumItems, 180);
  assert.equal(fundamentals.questionsPerClockHour, 3);
  assert.equal(fundamentals.absoluteMinimumItems, 90);
  assert.equal(fundamentals.passingPercent, 70);
  assert.equal(fundamentals.passingPercentIsRegulatorFigure, true);
  assert.match(fundamentals.ruleCitation, /308-124H-820\(8\)/);

  const practices = getWashingtonCourse(PRACTICES).courseExamination;
  assert.equal(practices.minimumItems, 90);
  assert.equal(practices.passingPercent, 70);

  assert.equal(getWashingtonProgram().totalRequiredExaminationItems, 270);
  assert.equal(WASHINGTON_COURSE_EXAM_PASSING_PERCENT, 70);
});

test("the 70 percent is labelled the regulator's and the 80 percent is labelled this school's", () => {
  for (const courseId of WASHINGTON_COURSE_IDS) {
    const p = getWashingtonCourse(courseId).passingPercentages;
    assert.equal(p.courseExamination.percent, 70);
    assert.equal(p.courseExamination.isRegulatorFigure, true);
    assert.match(p.courseExamination.rule, /308-124H-820\(8\)/);
    assert.equal(p.inModuleEngagement.percent, 80);
    assert.equal(p.inModuleEngagement.isRegulatorFigure, false);
    assert.equal(p.inModuleEngagement.rule, null);
    assert.equal(p.inModuleApplied.percent, 100);
    assert.equal(p.inModuleApplied.isRegulatorFigure, false);
  }
});

test("an in-module assessment says on its face that it is not the comprehensive examination", () => {
  const assessment = getWashingtonAssessment(PRACTICES, "module-01", "engagement");
  assert.equal(assessment.isTheComprehensiveCourseExamination, false);
  assert.equal(publicWashingtonAssessment(assessment).isTheComprehensiveCourseExamination, false);
});

/* ---- The Washington clock hour ---- */

test("a Washington clock hour is 50 minutes of ACTUAL INSTRUCTION", () => {
  assert.equal(WASHINGTON_MINUTES_PER_CLOCK_HOUR, 50);
  assert.equal(getWashingtonCourse(FUNDAMENTALS).instructionMinutes, 3000);
  assert.equal(getWashingtonCourse(PRACTICES).instructionMinutes, 1500);
  assert.equal(getWashingtonProgram().instructionMinutes, 4500);
});

/* ---- Statutory, not fiduciary ---- */

test("the payload records that the duties are statutory and not fiduciary", () => {
  for (const courseId of WASHINGTON_COURSE_IDS) {
    assert.equal(getWashingtonCourse(courseId).dutiesAreStatutoryNotFiduciary, true, courseId);
  }
  const requirements = getWashingtonCourse(PRACTICES).regulatorRequirements.join(" | ");
  assert.match(requirements, /STATUTORY duties and NOT fiduciary duties/i);
  assert.match(requirements, /supersedes the common-law fiduciary duties/i);
});

test("three statutory relationships, and a limited dual agent is not recorded as owing loyalty", () => {
  assert.equal(WASHINGTON_STATUTORY_RELATIONSHIPS.length, 3);
  const dual = WASHINGTON_STATUTORY_RELATIONSHIPS.find((r) => r.id === "limited-dual-agent");
  assert.equal(dual.owesLoyalty, false);
  const sellers = WASHINGTON_STATUTORY_RELATIONSHIPS.find((r) => r.id === "sellers-agent");
  const buyers = WASHINGTON_STATUTORY_RELATIONSHIPS.find((r) => r.id === "buyers-agent");
  assert.equal(sellers.owesLoyalty, true);
  assert.equal(buyers.owesLoyalty, true);
  /* Buyer agency arises by default; seller agency by appointment. */
  assert.match(buyers.arisesBy, /DEFAULT/i);
  assert.match(sellers.arisesBy, /appointment/i);
  /* Washington's confidentiality exceptions are exactly two. */
  for (const relationship of WASHINGTON_STATUTORY_RELATIONSHIPS) {
    assert.match(relationship.confidentialityExceptions, /subpoena or court order/i, relationship.id);
    assert.match(relationship.confidentialityExceptions, /survives termination/i, relationship.id);
  }
});

test("the seven unwaivable duties are recorded, including the 'regardless' clause", () => {
  assert.equal(WASHINGTON_UNWAIVABLE_DUTIES.length, 7);
  const joined = WASHINGTON_UNWAIVABLE_DUTIES.join(" | ");
  assert.match(joined, /reasonable skill and care/i);
  assert.match(joined, /honestly and in good faith/i);
  assert.match(joined, /regardless of whether the property is subject to an existing contract/i);
  assert.match(joined, /not agreed to investigate/i);
  assert.match(joined, /account in a timely manner/i);
  assert.match(joined, /pamphlet/i);
  assert.match(joined, /Agency Disclosure/);
});

/* ---- Certificate, distance education and submission gates ---- */

test("the certificate carries nine items, two of them department-issued numbers", () => {
  assert.equal(WASHINGTON_CERTIFICATE_REQUIRED_ITEMS.length, 9);
  const joined = WASHINGTON_CERTIFICATE_REQUIRED_ITEMS.join(" | ");
  assert.match(joined, /School's name and identification number issued by the department/);
  assert.match(joined, /Course identification number issued by the department/);
  assert.match(joined, /course commencement date and completion date/i);
});

test("the distance education criteria are recorded and every unsatisfied one says what blocks it", () => {
  assert.equal(WASHINGTON_DISTANCE_EDUCATION_CRITERIA.length, 9);
  const unsatisfied = WASHINGTON_DISTANCE_EDUCATION_CRITERIA.filter((c) => !c.satisfied);
  assert.ok(unsatisfied.length > 0, "this build has unsatisfied distance criteria");
  for (const criterion of WASHINGTON_DISTANCE_EDUCATION_CRITERIA) {
    if (!criterion.satisfied) assert.ok(criterion.blockedBy && criterion.blockedBy.length > 20, criterion.id);
  }
  const joined = WASHINGTON_DISTANCE_EDUCATION_CRITERIA.map((c) => c.requirement).join(" | ");
  assert.match(joined, /automatic shutdown after a period of inactivity/i);
  assert.match(joined, /both the school and the student must certify in writing/i);
  assert.match(joined, /individual remediation/i);
});

test("every unsatisfied submission gate says what blocks it", () => {
  assert.ok(WASHINGTON_SUBMISSION_GATES.length >= 8);
  for (const gate of WASHINGTON_SUBMISSION_GATES) {
    if (!gate.satisfied) assert.ok(gate.blockedBy && gate.blockedBy.length > 20, gate.id);
    if (gate.satisfied) assert.equal(gate.blockedBy, undefined, gate.id);
  }
  const curriculum = WASHINGTON_SUBMISSION_GATES.find((g) => g.id === "department-prescribed-curriculum");
  assert.equal(curriculum.satisfied, false);
  assert.match(curriculum.rule, /308-124H-810/);
  assert.match(curriculum.requirement, /most recent department-prescribed curricula/i);
  const exams = WASHINGTON_SUBMISSION_GATES.find((g) => g.id === "comprehensive-examinations");
  assert.equal(exams.satisfied, false);
  assert.match(exams.blockedBy, /180 items for Fundamentals/);
});

/* ---- Credit, readiness and the two-year window ---- */

test("each completion condition blocks the certificate and names itself", () => {
  const complete = allModuleIds(PRACTICES).map((id) => ({ module_id: id, status: "completed" }));

  const noModules = washingtonCourseCredit(PRACTICES, [], { courseExamPercent: 100, courseExamItemCount: 90, attendanceMet: true, schoolIdentificationNumber: "S", courseIdentificationNumber: "C" });
  assert.match(noModules.certificateBlockedBy, /0 of 6 modules complete/);

  const noAttendance = washingtonCourseCredit(PRACTICES, complete, { courseExamPercent: 100, courseExamItemCount: 90, attendanceMet: false });
  assert.match(noAttendance.certificateBlockedBy, /attendance requirement/i);

  const noExam = washingtonCourseCredit(PRACTICES, complete, { courseExamPercent: null, courseExamItemCount: null, attendanceMet: true });
  assert.match(noExam.certificateBlockedBy, /at least 90 items/);

  const shortExam = washingtonCourseCredit(PRACTICES, complete, { courseExamPercent: 100, courseExamItemCount: 60, attendanceMet: true });
  assert.equal(shortExam.examSizeSufficient, false);
  assert.match(shortExam.certificateBlockedBy, /carried 60 items/);

  const failedExam = washingtonCourseCredit(PRACTICES, complete, { courseExamPercent: 69, courseExamItemCount: 90, attendanceMet: true });
  assert.equal(failedExam.courseExamPassed, false);
  assert.match(failedExam.certificateBlockedBy, /69 percent/);
});

test("69 fails and 70 passes the director's threshold", () => {
  const complete = allModuleIds(PRACTICES).map((id) => ({ module_id: id, status: "completed" }));
  assert.equal(washingtonCourseCredit(PRACTICES, complete, { courseExamPercent: 69, courseExamItemCount: 90 }).courseExamPassed, false);
  assert.equal(washingtonCourseCredit(PRACTICES, complete, { courseExamPercent: 70, courseExamItemCount: 90 }).courseExamPassed, true);
});

test("a Fundamentals examination of 179 items is short of the rule; 180 satisfies it", () => {
  const complete = allModuleIds(FUNDAMENTALS).map((id) => ({ module_id: id, status: "completed" }));
  const short = washingtonCourseCredit(FUNDAMENTALS, complete, { courseExamPercent: 100, courseExamItemCount: 179, attendanceMet: true });
  assert.equal(short.examSizeSufficient, false);
  assert.equal(short.requiredExaminationItems, 180);
  const ok = washingtonCourseCredit(FUNDAMENTALS, complete, { courseExamPercent: 100, courseExamItemCount: 180, attendanceMet: true });
  assert.equal(ok.examSizeSufficient, true);
  assert.equal(ok.courseComplete, true);
});

test("no certificate issues without BOTH department-issued numbers, or while gates are unsatisfied", () => {
  const complete = allModuleIds(PRACTICES).map((id) => ({ module_id: id, status: "completed" }));
  const options = { courseExamPercent: 100, courseExamItemCount: 90, attendanceMet: true };

  const noNumbers = washingtonCourseCredit(PRACTICES, complete, options);
  assert.equal(noNumbers.courseComplete, true);
  assert.equal(noNumbers.certificateEligible, false);
  assert.match(noNumbers.certificateBlockedBy, /identification numbers issued by the department/i);

  const oneNumber = washingtonCourseCredit(PRACTICES, complete, { ...options, schoolIdentificationNumber: "S" });
  assert.equal(oneNumber.certificateEligible, false);

  const both = washingtonCourseCredit(PRACTICES, complete, { ...options, schoolIdentificationNumber: "S", courseIdentificationNumber: "C" });
  assert.equal(both.certificateEligible, false, "submission gates still block it");
  assert.match(both.certificateBlockedBy, /submission gates are unsatisfied/i);
});

test("readiness requires BOTH named courses, not merely 90 hours", () => {
  const fundamentals = washingtonCourseCredit(FUNDAMENTALS, allModuleIds(FUNDAMENTALS).map((id) => ({ module_id: id, status: "completed" })), { courseExamPercent: 80, courseExamItemCount: 180, attendanceMet: true });
  const practices = washingtonCourseCredit(PRACTICES, allModuleIds(PRACTICES).map((id) => ({ module_id: id, status: "completed" })), { courseExamPercent: 80, courseExamItemCount: 90, attendanceMet: true });

  const onlyFundamentals = washingtonEducationReadiness([fundamentals], { age: 30, highSchoolDiploma: true });
  assert.equal(onlyFundamentals.completedHours, 60);
  assert.equal(onlyFundamentals.practicesComplete, false);
  assert.equal(onlyFundamentals.meetsHourRequirement, false);
  assert.match(onlyFundamentals.blockedBy, /practices not complete/i);

  const both = washingtonEducationReadiness([fundamentals, practices], { age: 30, highSchoolDiploma: true });
  assert.equal(both.completedHours, 90);
  assert.equal(both.fundamentalsComplete, true);
  assert.equal(both.practicesComplete, true);
  assert.equal(both.meetsHourRequirement, true);
  assert.equal(both.blockedBy, null);
  assert.equal(both.determinationIsTheDepartments, true);
});

test("age and the high school diploma block readiness under RCW 18.85.101(1)(a) and (b)", () => {
  const fundamentals = washingtonCourseCredit(FUNDAMENTALS, allModuleIds(FUNDAMENTALS).map((id) => ({ module_id: id, status: "completed" })), { courseExamPercent: 80, courseExamItemCount: 180, attendanceMet: true });
  const practices = washingtonCourseCredit(PRACTICES, allModuleIds(PRACTICES).map((id) => ({ module_id: id, status: "completed" })), { courseExamPercent: 80, courseExamItemCount: 90, attendanceMet: true });

  const young = washingtonEducationReadiness([fundamentals, practices], { age: 17, highSchoolDiploma: true });
  assert.equal(young.ageMet, false);
  assert.match(young.blockedBy, /18 years of age or older/);

  const noDiploma = washingtonEducationReadiness([fundamentals, practices], { age: 30, highSchoolDiploma: false });
  assert.equal(noDiploma.diplomaMet, false);
  assert.match(noDiploma.blockedBy, /high school diploma or its equivalent/i);
});

test("the two-year window is measured to the date of APPLYING FOR THE EXAMINATION", () => {
  assert.equal(WASHINGTON_EDUCATION_VALIDITY_YEARS, 2);
  const inside = washingtonEducationValidity("2026-08-20", "2028-01-15");
  assert.equal(inside.expiresOn, "2028-08-20");
  assert.equal(inside.withinWindow, true);
  assert.match(inside.measuredTo, /applying for the broker's license examination/i);

  const outside = washingtonEducationValidity("2026-08-20", "2028-09-01");
  assert.equal(outside.withinWindow, false);
  assert.match(outside.blockedBy, /2028-08-20/);

  assert.equal(washingtonEducationValidity(null), null);
  assert.equal(washingtonEducationValidity("not a date"), null);
});

/* ---- Assessment mechanics ---- */

test("18 modules carry 198 items — one applied, five engagement, five remediation each", () => {
  let total = 0;
  let moduleCount = 0;
  for (const [bank, ids] of [[FUNDAMENTALS_BANK, allModuleIds(FUNDAMENTALS)], [PRACTICES_BANK, allModuleIds(PRACTICES)]]) {
    for (const id of ids) {
      const entry = bank[id];
      assert.ok(entry.applied, id);
      assert.equal(entry.engagement.length, 5, id);
      assert.equal(entry.remediation.length, 5, id);
      total += 11;
      moduleCount += 1;
    }
  }
  assert.equal(moduleCount, 18);
  assert.equal(total, 198);
});

test("every authored item has four choices, the answer at index 0, a real prompt and a rationale", () => {
  for (const [courseId, bank] of [[FUNDAMENTALS, FUNDAMENTALS_BANK], [PRACTICES, PRACTICES_BANK]]) {
    for (const id of allModuleIds(courseId)) {
      const entry = bank[id];
      for (const item of [entry.applied, ...entry.engagement, ...entry.remediation]) {
        assert.equal(item.choices.length, 4, `${courseId} ${id}: ${item.prompt}`);
        assert.equal(item.correctChoice, 0, `${courseId} ${id}: ${item.prompt}`);
        assert.equal(new Set(item.choices).size, 4, `${courseId} ${id} duplicate choices: ${item.prompt}`);
        assert.ok(item.prompt.length >= 25, `${courseId} ${id} prompt too short: ${item.prompt}`);
        assert.ok(item.rationale && item.rationale.length >= 40, `${courseId} ${id} rationale too short: ${item.prompt}`);
      }
    }
  }
});

test("delivery permutes deterministically and the recorded selection keeps its meaning", () => {
  const first = getWashingtonAssessment(PRACTICES, "module-04", "engagement");
  const second = getWashingtonAssessment(PRACTICES, "module-04", "engagement");
  assert.deepEqual(first.items.map((i) => i.choices), second.items.map((i) => i.choices));
  for (const [index, item] of first.items.entries()) {
    assert.equal(item.choices[item.correctChoice], PRACTICES_BANK["module-04"].engagement[index].choices[0]);
  }
});

test("the two courses' identically-named modules permute differently", () => {
  const fundamentals = getWashingtonAssessment(FUNDAMENTALS, "module-01", "engagement");
  const practices = getWashingtonAssessment(PRACTICES, "module-01", "engagement");
  assert.notDeepEqual(
    fundamentals.items.map((i) => i.correctChoice),
    practices.items.map((i) => i.correctChoice)
  );
});

test("at least one delivered order differs from the authored order", () => {
  const moved = WASHINGTON_COURSE_IDS.some((courseId) =>
    allModuleIds(courseId).some((id) =>
      getWashingtonAssessment(courseId, id, "engagement").items.some((item) => item.correctChoice !== 0)));
  assert.equal(moved, true);
});

test("the public shape carries no answer key and no rationale", () => {
  for (const courseId of WASHINGTON_COURSE_IDS) {
    for (const id of allModuleIds(courseId)) {
      for (const kind of ["applied", "engagement", "remediation"]) {
        const serialised = JSON.stringify(publicWashingtonAssessment(getWashingtonAssessment(courseId, id, kind)));
        assert.doesNotMatch(serialised, /correctChoice/, `${courseId} ${id} ${kind}`);
        assert.doesNotMatch(serialised, /rationale/, `${courseId} ${id} ${kind}`);
      }
    }
  }
});

test("scoring rejects coerced non-answers rather than recording a selection nobody made", () => {
  const assessment = getWashingtonAssessment(FUNDAMENTALS, "module-01", "engagement");
  const valid = assessment.items.map((item) => item.correctChoice);
  assert.equal(scoreWashingtonAssessment(assessment, valid).percent, 100);
  for (const bad of [null, "", false, [], undefined, {}, "1.5", " ", "abc", -1, 4, 1.5, NaN]) {
    const answers = [...valid];
    answers[0] = bad;
    assert.equal(scoreWashingtonAssessment(assessment, answers), null, `accepted ${JSON.stringify(bad)}`);
  }
  assert.equal(scoreWashingtonAssessment(assessment, valid.slice(1)), null);
  assert.equal(scoreWashingtonAssessment(null, valid), null);
});

test("a numeric string answer is accepted, because a form field is a string", () => {
  const assessment = getWashingtonAssessment(PRACTICES, "module-01", "engagement");
  const answers = assessment.items.map((item) => String(item.correctChoice));
  assert.equal(scoreWashingtonAssessment(assessment, answers).percent, 100);
});

test("unknown ids return null rather than a partially built object", () => {
  assert.equal(getWashingtonCourse("wa-something-else"), null);
  assert.equal(getWashingtonModule(FUNDAMENTALS, "module-99"), null);
  assert.equal(getWashingtonModule("nope", "module-01"), null);
  assert.equal(getWashingtonAssessment(FUNDAMENTALS, "module-99", "engagement"), null);
  assert.equal(getWashingtonAssessment(FUNDAMENTALS, "module-01", "nonsense"), null);
  assert.equal(washingtonCourseCredit("nope", []), null);
});

/* ---- The curriculum ---- */

test("every module file exists, states its hours and its regulatory status", () => {
  for (const courseId of WASHINGTON_COURSE_IDS) {
    for (const module of getWashingtonCourse(courseId).modules) {
      const text = readModule(courseId, module.id);
      assert.match(text, /Instructional hours:/, `${courseId} ${module.id}`);
      assert.match(text, new RegExp(`${module.hours}\\.0`), `${courseId} ${module.id} does not state its hours`);
      assert.match(text, /Regulatory status: Development\. Not approved\./, `${courseId} ${module.id}`);
      assert.match(text, /Instructor source note/i, `${courseId} ${module.id}`);
    }
  }
});

test("no module claims approval or offers clock hours", () => {
  assert.doesNotMatch(allText, /\bState Approved\b/i);
  assert.doesNotMatch(allText, /\bEnroll Now\b/i);
});

test("the curriculum uses Washington's own word — broker, not salesperson", () => {
  /* A Washington "salesperson" does not exist. The phrase may appear only where the course is explaining
     that Washington does not use it. */
  const offending = /Washington (real estate )?salesperson(?!.{0,120}(does not|not a|no such|rather than|instead of))/i;
  assert.doesNotMatch(allText, offending);
  const first = readModule(FUNDAMENTALS, "module-01");
  assert.match(first, /Washington licenses a BROKER, not a salesperson/i);
});

test("RCW 18.86.110's supersession is stated in the curriculum, not just the engine", () => {
  const text = readModule(PRACTICES, "module-01");
  assert.match(text, /statutory duties and not fiduciary duties/i);
  assert.match(text, /supersedes the fiduciary duties of an agent to a principal under the common law/i);
  assert.match(text, /construed broadly/i);
});

test("the 'regardless' clause and the disclosure proviso are stated", () => {
  const text = readModule(PRACTICES, "module-01");
  assert.match(text, /regardless of whether the property is subject to an existing contract for sale/i);
  assert.match(text, /not agreed to investigate/i);
  assert.match(text, /may not be waived/i);
});

test("the material fact negative list and its limiting clause are stated", () => {
  const text = readModule(PRACTICES, "module-01");
  assert.match(text, /murder, suicide or other death/i);
  assert.match(text, /political or religious activity/i);
  assert.match(text, /not adversely affecting the physical condition of or title to the property/i);
});

test("the five-part confidential information test is stated", () => {
  const text = readModule(PRACTICES, "module-01");
  assert.match(text, /five-part/i);
  assert.match(text, /personally would not be obligated to disclose/i);
});

test("the services agreement contents, including the 60-day buyer default, are stated", () => {
  const text = readModule(PRACTICES, "module-02");
  assert.match(text, /default term of 60 days/i);
  assert.match(text, /checkbox options/i);
  assert.match(text, /separately initialed/i);
  assert.match(text, /may not advocate terms favorable to one principal to the detriment of the other/i);
  assert.equal(WASHINGTON_BUYER_SERVICES_AGREEMENT_DEFAULT_TERM_DAYS, 60);
});

test("RCW 18.86.080(7)(b) — the show-without-compensation term — is stated", () => {
  const text = readModule(PRACTICES, "module-04");
  assert.match(text, /whether the appointed broker agrees to show the buyer properties if there is no agreement or offer/i);
  assert.match(text, /does not establish an agency relationship/i);
});

test("RCW 18.86.130 is transcribed with its condition, exception and final sentence", () => {
  const text = readModule(PRACTICES, "module-05");
  assert.match(text, /concurrently marketed to the general public and all other brokers/i);
  assert.match(text, /health or safety of the owner or occupant/i);
  assert.match(text, /does not require an owner to allow access/i);
  assert.match(text, /18\.86\.031/);
});

test("RCW 18.86.100 and 18.86.090 are stated in Module WA-P-03", () => {
  const text = readModule(PRACTICES, "module-03");
  assert.match(text, /does not have knowledge or notice of any facts known by an agent/i);
  assert.match(text, /highly probable that the claimant would be unable to enforce a judgment/i);
  assert.match(text, /is a limited dual agent/i);
});

/* ---- What was NOT read ---- */

test("the readings file names remaining source gaps and the engine carries them", () => {
  assert.match(readings, /NOT obtained|not read/i);
  assert.ok(WASHINGTON_UNREAD_SOURCES.length >= 10);
  const joined = WASHINGTON_UNREAD_SOURCES.join(" | ");
  for (const source of ["Objective-level", "18.86.120 pamphlet", "RCW 64.06", "RCW 59.18", "RCW 49.60", "RCW 82.45", "ARELLO"]) {
    assert.ok(joined.includes(source), `unread list does not name ${source}`);
  }
});

test("every module names what it did not read", () => {
  for (const courseId of WASHINGTON_COURSE_IDS) {
    for (const module of getWashingtonCourse(courseId).modules) {
      const text = readModule(courseId, module.id);
      assert.match(text, /[Nn]ot (read|obtained)/, `${courseId} ${module.id} names no gap`);
    }
  }
});

test("no item states a period the sources read do not state", () => {
  const permitted = [
    /\b2 years?\b/i, /\btwo years?\b/i, /\b3 years?\b/i, /\bthree years?\b/i, /\b60 days?\b/i, /\bsixty days?\b/i,
    /\b30 days?\b/i, /\b1 year\b/i, /\bone year\b/i, /\b2[- ]year\b/i, /\btwo[- ]year\b/i, /\b30[- ]day\b/i,
    /\b360[- ]day\b/i, /\b365[- ]day\b/i, /\bone month\b/i, /\b(eight|8) months?\b/i, /\b(sixteen|16) days?\b/i,
    /\b(twelve|12) days?\b/i, /\b(eighteen|18) days?\b/i, /\b18 years?\b/i, /\beighteen years?\b/i,
    /\b(thirty|30) years?\b/i, /\b(eleven|11) years?\b/i, /\b(forty|40) years?\b/i, /\bfifteen years?\b/i,
    /\b(five|5) years?\b/i, /\b(two|2) weekends?\b/i, /\b(six|6) months?\b/i
  ];
  const quantified = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|sixteen|eighteen|twenty|thirty|forty|sixty|ninety)[\s-]+(business\s+|banking\s+|calendar\s+)?(days?|years?|months?|weeks?|weekends?)\b/gi;
  for (const [courseId, bank] of [[FUNDAMENTALS, FUNDAMENTALS_BANK], [PRACTICES, PRACTICES_BANK]]) {
    for (const id of allModuleIds(courseId)) {
      const entry = bank[id];
      for (const item of [entry.applied, ...entry.engagement, ...entry.remediation]) {
        const text = `${item.choices[0]} ${item.rationale}`;
        for (const match of text.match(quantified) ?? []) {
          const normalised = match.replace(/-/g, " ");
          assert.ok(
            permitted.some((pattern) => pattern.test(match) || pattern.test(normalised)),
            `${courseId} ${id} states a period the sources read do not: "${match}" in "${item.prompt}"`
          );
        }
      }
    }
  }
});

test("no item claims Department approval of this course", () => {
  for (const [courseId, bank] of [[FUNDAMENTALS, FUNDAMENTALS_BANK], [PRACTICES, PRACTICES_BANK]]) {
    for (const id of allModuleIds(courseId)) {
      const entry = bank[id];
      for (const item of [entry.applied, ...entry.engagement, ...entry.remediation]) {
        const text = `${item.choices[0]} ${item.rationale}`;
        assert.doesNotMatch(text, /this course is (Department[- ])?approved/i, `${courseId} ${id}`);
      }
    }
  }
});

/* ---- Engine defences ---- */

test("the payload separates what the regulator fixed from what this school decided", () => {
  const course = getWashingtonCourse(FUNDAMENTALS);
  assert.ok(course.regulatorRequirements.length >= 15);
  assert.ok(course.stateCourseDecisions.length >= 4);
  /* The engagement threshold must never appear as the regulator's. */
  assert.ok(!course.regulatorRequirements.some((line) => /80 percent in-module/i.test(line)));
  assert.ok(course.stateCourseDecisions.some((line) => /80 percent in-module/i.test(line)));
  /* The 70 percent must appear as the regulator's. */
  assert.ok(course.regulatorRequirements.some((line) => /70 percent/.test(line)));
});

test("the frozen payload cannot be mutated by a caller", () => {
  const course = getWashingtonCourse(FUNDAMENTALS);
  assert.throws(() => { course.hours = 99; }, TypeError);
  assert.throws(() => { course.modules[0].hours = 99; }, TypeError);
  assert.equal(course.hours, 60);
});

test("both courses state their approval status plainly and claim nothing", () => {
  for (const courseId of WASHINGTON_COURSE_IDS) {
    const status = getWashingtonCourse(courseId).approvalStatus;
    assert.match(status, /Not approved/);
    assert.match(status, /No Washington clock hours are available/);
    assert.doesNotMatch(status, /\bState Approved\b/i);
  }
});

test("the payload uses Washington's licence title", () => {
  assert.equal(getWashingtonProgram().licenseTitle, "broker");
  for (const courseId of WASHINGTON_COURSE_IDS) {
    assert.equal(getWashingtonCourse(courseId).licenseTitle, "broker");
  }
});
