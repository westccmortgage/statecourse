/**
 * Arizona salesperson prelicensing — tests.
 *
 * Four things these tests exist to hold.
 *
 * ONE: NINETY-SIX, NOT NINETY. A.R.S. § 32-2124(B) requires 90 hours and § 32-2124(L) requires a further
 * six "AFTER COMPLETING THE REQUIREMENTS OF SUBSECTION B", certified at the time of application. A test
 * fails if the six are folded into the ninety or if the total drifts from 96.
 *
 * TWO: THE UNWAIVABLE 27. § 32-2124(B)'s closing sentence and A.A.C. R4-28-401(A)(2) both except the
 * 27-hour Arizona-specific course from any waiver. Modules 10 through 13 are that block, a test asserts
 * their hours total exactly 27, and a test asserts that a granted waiver does NOT relieve an applicant of
 * them.
 *
 * THREE: ARIZONA IS A FIDUCIARY STATE. A.A.C. R4-28-1101(A) says so in its first sentence. This project
 * has built courses for Washington, whose statute makes its duties statutory and NOT fiduciary, and for
 * Oklahoma, which abrogated the common-law fiduciary duties. A test asserts the payload records Arizona's
 * standard as fiduciary and that R4-28-1101(I) is recorded as an AFFIRMATIVE duty to obtain information.
 *
 * FOUR: DRAFTING IS NOT READING. § 32-2124(L) requires "PARTICIPATION BY THE APPLICANT IN DRAFTING
 * CONTRACTS TO PURCHASE REAL PROPERTY, LISTING AGREEMENTS AND LEASE AGREEMENTS." A test asserts the engine
 * refuses to credit the six-hour course until all three drafts are recorded, and that no in-module
 * assessment claims to satisfy the requirement.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import PRELICENSE_BANK from "../config/arizona/prelicense-90-question-bank.mjs";
import CONTRACT_WRITING_BANK from "../config/arizona/contract-writing-6-question-bank.mjs";
import {
  getArizonaCourse,
  getArizonaProgram,
  getArizonaModule,
  getArizonaAssessment,
  publicArizonaAssessment,
  scoreArizonaAssessment,
  arizonaCourseCredit,
  arizonaEducationReadiness,
  arizonaEducationValidity,
  ARIZONA_COURSE_IDS,
  ARIZONA_LICENSEE_DUTIES,
  ARIZONA_REQUIRED_DRAFTS,
  ARIZONA_SUBMISSION_GATES,
  ARIZONA_UNREAD_SOURCES,
  ARIZONA_PRELICENSE_HOURS,
  ARIZONA_CONTRACT_WRITING_HOURS,
  ARIZONA_TOTAL_REQUIRED_HOURS,
  ARIZONA_SPECIFIC_UNWAIVABLE_HOURS_TOTAL,
  ARIZONA_COURSE_EXAM_PASSING_PERCENT,
  ARIZONA_EDUCATION_VALIDITY_YEARS,
  ARIZONA_RECORDED_MATERIAL_MAX_PERCENT,
  ARIZONA_SCHOOL_RECORD_RETENTION_YEARS,
  ARIZONA_PROPERTY_NEGOTIATION_UNAVAILABILITY_HOURS,
  ARIZONA_COMPENSATION_SHARING_DISCLOSURE_DAYS,
  ARIZONA_RESCISSION_DAYS_UNIMPROVED_LOT,
  ARIZONA_RESCISSION_DAYS_TIMESHARE,
  ARIZONA_UNINSPECTED_LOT_INSPECTION_MONTHS,
  ARIZONA_ACRE_MINIMUM_SQUARE_FEET
} from "../config/arizona-course-engine.mjs";

const PRELICENSE = "az-salesperson-prelicense-90-v1";
const CONTRACT_WRITING = "az-contract-writing-6-v1";

const prose = (text) => text
  .replace(/^\s*>\s?/gm, "")
  .replace(/\*\*/g, "")
  .replace(/\s+/g, " ");

const CURRICULUM_DIR = {
  [PRELICENSE]: "arizona/az-salesperson-prelicense-90-v1/curriculum",
  [CONTRACT_WRITING]: "arizona/az-contract-writing-6-v1/curriculum"
};

const readModule = (courseId, moduleId) =>
  prose(readFileSync(new URL(`../${CURRICULUM_DIR[courseId]}/${moduleId}.md`, import.meta.url), "utf8"));
const readings = prose(readFileSync(new URL("../arizona/regulatory/primary-text-readings.md", import.meta.url), "utf8"));

const allModuleIds = (courseId) => getArizonaCourse(courseId).modules.map((m) => m.id);
const BANKS = [[PRELICENSE, PRELICENSE_BANK], [CONTRACT_WRITING, CONTRACT_WRITING_BANK]];
const allItems = function* () {
  for (const [courseId, bank] of BANKS) {
    for (const id of allModuleIds(courseId)) {
      const entry = bank[id];
      for (const item of [entry.applied, ...entry.engagement, ...entry.remediation]) yield [courseId, id, item];
    }
  }
};

/* ---- 96, not 90 ---- */

test("Arizona is 96 hours: 90 under subsection (B) plus 6 under subsection (L)", () => {
  assert.equal(ARIZONA_PRELICENSE_HOURS, 90);
  assert.equal(ARIZONA_CONTRACT_WRITING_HOURS, 6);
  assert.equal(ARIZONA_TOTAL_REQUIRED_HOURS, 96);
  const program = getArizonaProgram();
  assert.equal(program.deliveredHours, 96);
  assert.equal(program.requiredHours, 96);
  assert.equal(getArizonaCourse(PRELICENSE).hours, 90);
  assert.equal(getArizonaCourse(CONTRACT_WRITING).hours, 6);
});

test("the six hours are recorded as ADDITIONAL to the ninety, not part of them", () => {
  const program = getArizonaProgram();
  assert.equal(program.contractWritingIsAdditional, true);
  assert.equal(getArizonaCourse(CONTRACT_WRITING).isAdditionalToPrelicenseHours, true);
  assert.equal(getArizonaCourse(PRELICENSE).isAdditionalToPrelicenseHours, false);
  assert.match(program.note, /after completing the requirements of subsection B/i);
  assert.match(program.note, /at the time of application/i);
});

test("each course cites the subsection it satisfies", () => {
  assert.equal(getArizonaCourse(PRELICENSE).satisfiesSubsection, "B");
  assert.equal(getArizonaCourse(CONTRACT_WRITING).satisfiesSubsection, "L");
  assert.match(getArizonaCourse(PRELICENSE).statuteCitation, /32-2124\(B\)/);
  assert.match(getArizonaCourse(CONTRACT_WRITING).statuteCitation, /32-2124\(L\)/);
});

test("each course's module hours sum to the course total", () => {
  for (const courseId of ARIZONA_COURSE_IDS) {
    const course = getArizonaCourse(courseId);
    assert.equal(course.modules.reduce((sum, m) => sum + m.hours, 0), course.hours, courseId);
  }
});

/* ---- The unwaivable 27 ---- */

test("the Arizona-specific block is exactly 27 hours and sits inside the 90-hour course", () => {
  assert.equal(ARIZONA_SPECIFIC_UNWAIVABLE_HOURS_TOTAL, 27);
  const course = getArizonaCourse(PRELICENSE);
  assert.equal(course.carriesArizonaSpecificBlock, true);
  const specific = course.modules.filter((m) => m.arizonaSpecific);
  assert.equal(specific.reduce((sum, m) => sum + m.hours, 0), 27);
  assert.deepEqual(specific.map((m) => m.id), ["module-10", "module-11", "module-12", "module-13"]);
  assert.deepEqual(specific.map((m) => m.hours), [7, 7, 7, 6]);
  assert.equal(getArizonaCourse(CONTRACT_WRITING).carriesArizonaSpecificBlock, false);
});

test("the general modules are the remaining 63 hours", () => {
  const course = getArizonaCourse(PRELICENSE);
  const general = course.modules.filter((m) => !m.arizonaSpecific);
  assert.equal(general.length, 9);
  assert.equal(general.reduce((sum, m) => sum + m.hours, 0), 63);
});

test("each Arizona-specific module says so on its first page and cites the waiver exception", () => {
  for (const id of ["module-10", "module-11", "module-12", "module-13"]) {
    const text = readModule(PRELICENSE, id);
    assert.match(text, /Arizona-specific: ★ YES/, id);
    assert.match(text, /27-hour Arizona-specific course/i, id);
    assert.match(text, /may not be waived/i, id);
    assert.match(text, /R4-28-401\(A\)\(2\)/, id);
  }
});

test("a granted waiver does NOT relieve an applicant of the 27 hours", () => {
  const prelicense = {
    courseId: PRELICENSE,
    courseComplete: false,
    creditedArizonaSpecificHours: 27
  };
  const contract = { courseId: CONTRACT_WRITING, courseComplete: true };
  const withBlock = arizonaEducationReadiness([prelicense, contract], { waiverGranted: true, age: 30 });
  assert.equal(withBlock.arizonaSpecificRequirementMet, true);

  const short = arizonaEducationReadiness(
    [{ ...prelicense, creditedArizonaSpecificHours: 20 }, contract],
    { waiverGranted: true, age: 30 }
  );
  assert.equal(short.arizonaSpecificRequirementMet, false);
  assert.equal(short.meetsHourRequirement, false);
  assert.match(short.blockedBy, /OTHER THAN THE 27-HOUR ARIZONA-SPECIFIC COURSE/i);
  assert.match(short.blockedBy, /20 of 27/);
});

/* ---- Arizona is a fiduciary state ---- */

test("the payload records a fiduciary standard, in the rule's own words", () => {
  for (const courseId of ARIZONA_COURSE_IDS) {
    assert.equal(getArizonaCourse(courseId).dutiesAreFiduciary, true, courseId);
  }
  assert.equal(getArizonaProgram().dutiesAreFiduciary, true);
  const dutyA = ARIZONA_LICENSEE_DUTIES.find((d) => d.subsection === "(A)");
  assert.match(dutyA.duty, /FIDUCIARY DUTY/);
  assert.match(dutyA.duty, /DEAL FAIRLY with all other parties/);
  assert.equal(dutyA.owedTo, "client and all other parties");
});

test("R4-28-1101 is recorded subsection by subsection, (A) through (K)", () => {
  assert.equal(ARIZONA_LICENSEE_DUTIES.length, 11);
  assert.deepEqual(
    ARIZONA_LICENSEE_DUTIES.map((d) => d.subsection),
    ["(A)", "(B)", "(C)", "(D)", "(E)", "(F)", "(G)", "(H)", "(I)", "(J)", "(K)"]
  );
});

test("subsection (B) runs to all other parties, and names either party's inability to perform", () => {
  const dutyB = ARIZONA_LICENSEE_DUTIES.find((d) => d.subsection === "(B)");
  assert.equal(dutyB.owedTo, "all other parties");
  assert.match(dutyB.duty, /seller or lessor is or may be unable to perform/i);
  assert.match(dutyB.duty, /buyer or lessee is, or may be, unable to perform/i);
});

test("subsection (I) is recorded as an affirmative duty to OBTAIN information", () => {
  const dutyI = ARIZONA_LICENSEE_DUTIES.find((d) => d.subsection === "(I)");
  assert.match(dutyI.duty, /OBTAINS information material/);
  assert.match(dutyI.duty, /assist the client in confirming its accuracy/i);
});

test("(F) requires consent and (G) requires acknowledgement, and (G) carries the broker-to-broker carve-out", () => {
  const dutyF = ARIZONA_LICENSEE_DUTIES.find((d) => d.subsection === "(F)");
  const dutyG = ARIZONA_LICENSEE_DUTIES.find((d) => d.subsection === "(G)");
  assert.match(dutyF.duty, /PRIOR WRITTEN CONSENT of all parties/);
  assert.doesNotMatch(dutyF.duty, /ACKNOWLEDGEMENT/);
  assert.match(dutyG.duty, /PRIOR WRITTEN ACKNOWLEDGEMENT/);
  assert.match(dutyG.duty, /paid to a broker by a broker who represents a party/i);
});

test("the curriculum contrasts Arizona with the statutory-duty states rather than blurring them", () => {
  const module11 = readModule(PRELICENSE, "module-11");
  assert.match(module11, /A licensee owes a fiduciary duty to the client/i);
  assert.match(module11, /Washington/);
  assert.match(module11, /Oklahoma/);
  assert.match(module11, /statutory duties and not fiduciary duties/i);
});

/* ---- Drafting is not reading ---- */

test("A.R.S. § 32-2124(L)'s three document types are recorded as required drafts", () => {
  assert.equal(ARIZONA_REQUIRED_DRAFTS.length, 3);
  assert.deepEqual(
    ARIZONA_REQUIRED_DRAFTS.map((d) => d.id),
    ["purchase-contract", "listing-agreement", "lease-agreement"]
  );
  for (const draft of ARIZONA_REQUIRED_DRAFTS) {
    assert.equal(draft.courseId, CONTRACT_WRITING, draft.id);
    assert.match(draft.statute, /32-2124\(L\)/, draft.id);
  }
  assert.equal(getArizonaCourse(CONTRACT_WRITING).requiresDrafting, true);
  assert.equal(getArizonaCourse(PRELICENSE).requiresDrafting, false);
  assert.equal(getArizonaCourse(PRELICENSE).requiredDrafts.length, 0);
});

test("the six-hour course is not credited until all three drafts are recorded", () => {
  const modules = [
    { module_id: "module-01", status: "completed" },
    { module_id: "module-02", status: "completed" }
  ];
  const base = { courseExamPercent: 90, courseExamProctoredInPerson: true, attendanceMet: true };

  const none = arizonaCourseCredit(CONTRACT_WRITING, modules, base);
  assert.equal(none.allModulesComplete, true);
  assert.equal(none.draftingRequirementMet, false);
  assert.equal(none.courseComplete, false);
  assert.equal(none.outstandingDraftIds.length, 3);
  assert.match(none.certificateBlockedBy, /PARTICIPATION BY THE APPLICANT IN DRAFTING/i);

  const two = arizonaCourseCredit(CONTRACT_WRITING, modules, {
    ...base,
    completedDraftIds: ["purchase-contract", "listing-agreement"]
  });
  assert.equal(two.courseComplete, false);
  assert.deepEqual(two.outstandingDraftIds, ["lease-agreement"]);
  assert.match(two.certificateBlockedBy, /Lease agreements/);

  const all = arizonaCourseCredit(CONTRACT_WRITING, modules, {
    ...base,
    completedDraftIds: ["purchase-contract", "listing-agreement", "lease-agreement"]
  });
  assert.equal(all.draftingRequirementMet, true);
  assert.equal(all.courseComplete, true);
  assert.deepEqual(all.outstandingDraftIds, []);
});

test("an unrecognised draft id does not satisfy anything", () => {
  const credit = arizonaCourseCredit(CONTRACT_WRITING, [
    { module_id: "module-01", status: "completed" },
    { module_id: "module-02", status: "completed" }
  ], {
    courseExamPercent: 90,
    courseExamProctoredInPerson: true,
    attendanceMet: true,
    completedDraftIds: ["purchase-contract", "some-other-document", "another-one"]
  });
  assert.equal(credit.courseComplete, false);
  assert.deepEqual(credit.completedDraftIds, ["purchase-contract"]);
  assert.deepEqual(credit.outstandingDraftIds, ["listing-agreement", "lease-agreement"]);
});

test("the prelicense course carries no drafting requirement to satisfy", () => {
  const credit = arizonaCourseCredit(PRELICENSE, allModuleIds(PRELICENSE).map((id) => ({ module_id: id, status: "completed" })), {
    courseExamPercent: 80,
    courseExamProctoredInPerson: true,
    attendanceMet: true
  });
  assert.equal(credit.draftingRequirementMet, true);
  assert.equal(credit.courseComplete, true);
  assert.equal(credit.creditedArizonaSpecificHours, 27);
});

test("no in-module assessment claims to satisfy the drafting requirement", () => {
  for (const courseId of ARIZONA_COURSE_IDS) {
    for (const id of allModuleIds(courseId)) {
      for (const kind of ["applied", "engagement", "remediation"]) {
        const assessment = getArizonaAssessment(courseId, id, kind);
        assert.equal(assessment.satisfiesDraftingRequirement, false, `${courseId} ${id} ${kind}`);
        assert.equal(publicArizonaAssessment(assessment).satisfiesDraftingRequirement, false, `${courseId} ${id} ${kind}`);
      }
    }
  }
});

test("both contract writing modules record a drafting exercise in the bank", () => {
  assert.equal(CONTRACT_WRITING_BANK["module-01"].draftingExercise, "purchase-contract");
  assert.equal(CONTRACT_WRITING_BANK["module-02"].draftingExercise, "listing-and-lease");
});

/* ---- The proctored examination and the two percentages ---- */

test("the course examination is the Department's 75 percent, proctored in person", () => {
  assert.equal(ARIZONA_COURSE_EXAM_PASSING_PERCENT, 75);
  for (const courseId of ARIZONA_COURSE_IDS) {
    const exam = getArizonaCourse(courseId).courseExamination;
    assert.equal(exam.passingPercent, 75, courseId);
    assert.equal(exam.passingPercentIsRegulatorFigure, true, courseId);
    assert.equal(exam.proctoredInPerson, true, courseId);
    assert.match(exam.ruleCitation, /R4-28-401\(A\)\(1\)/, courseId);
    assert.match(exam.ruleCitation, /32-2124\(B\)/, courseId);
  }
});

test("examination time is not instruction time, and no item count is claimed for the regulator", () => {
  for (const courseId of ARIZONA_COURSE_IDS) {
    const exam = getArizonaCourse(courseId).courseExamination;
    assert.equal(exam.examinationTimeCountsAsInstruction, false, courseId);
    assert.equal(exam.itemCountStatedByRegulator, false, courseId);
  }
});

test("the Department's percentage and this school's are separately labelled", () => {
  const percentages = getArizonaCourse(PRELICENSE).passingPercentages;
  assert.equal(percentages.courseExamination.percent, 75);
  assert.equal(percentages.courseExamination.isRegulatorFigure, true);
  assert.equal(percentages.inModuleEngagement.percent, 80);
  assert.equal(percentages.inModuleEngagement.isRegulatorFigure, false);
  assert.equal(percentages.inModuleEngagement.rule, null);
  assert.equal(percentages.inModuleApplied.percent, 100);
  assert.equal(percentages.inModuleApplied.isRegulatorFigure, false);
});

test("an examination that is not proctored in person does not complete a course", () => {
  const modules = allModuleIds(PRELICENSE).map((id) => ({ module_id: id, status: "completed" }));
  const credit = arizonaCourseCredit(PRELICENSE, modules, {
    courseExamPercent: 95,
    courseExamProctoredInPerson: false,
    attendanceMet: true
  });
  assert.equal(credit.courseExamPassed, true);
  assert.equal(credit.courseComplete, false);
  assert.match(credit.certificateBlockedBy, /PROCTORED IN PERSON/i);
});

test("an examination below 75 percent does not complete a course", () => {
  const modules = allModuleIds(PRELICENSE).map((id) => ({ module_id: id, status: "completed" }));
  const credit = arizonaCourseCredit(PRELICENSE, modules, {
    courseExamPercent: 74,
    courseExamProctoredInPerson: true,
    attendanceMet: true
  });
  assert.equal(credit.courseComplete, false);
  assert.match(credit.certificateBlockedBy, /74 percent, below the 75 percent/);
});

test("passing an examination is recorded as not being a licence", () => {
  assert.equal(getArizonaCourse(PRELICENSE).passingExaminationIsNotALicense, true);
  assert.equal(arizonaEducationReadiness([], {}).passingExaminationIsNotALicense, true);
  assert.equal(arizonaEducationReadiness([], {}).determinationIsTheDepartments, true);
});

/* ---- Certificates and approval ---- */

test("no course claims approval, and every course states no credit is available", () => {
  for (const courseId of ARIZONA_COURSE_IDS) {
    const course = getArizonaCourse(courseId);
    assert.match(course.approvalStatus, /^Not approved\./, courseId);
    assert.match(course.approvalStatus, /No Arizona prelicensure credit is available/i, courseId);
    assert.equal(course.version, "1.0-submission-draft", courseId);
  }
  assert.match(getArizonaProgram().approvalStatus, /^Not approved\./);
});

test("every module states its regulatory status on the first page", () => {
  for (const courseId of ARIZONA_COURSE_IDS) {
    for (const module of getArizonaCourse(courseId).modules) {
      const text = readModule(courseId, module.id);
      assert.match(text, /Regulatory status: Development\. Not approved\./, `${courseId} ${module.id}`);
    }
  }
});

test("no certificate can issue without both a school certification number and a course approval number", () => {
  const modules = allModuleIds(PRELICENSE).map((id) => ({ module_id: id, status: "completed" }));
  const complete = arizonaCourseCredit(PRELICENSE, modules, {
    courseExamPercent: 90,
    courseExamProctoredInPerson: true,
    attendanceMet: true
  });
  assert.equal(complete.courseComplete, true);
  assert.equal(complete.certificateEligible, false);
  assert.match(complete.certificateBlockedBy, /32-2135/);

  const numbered = arizonaCourseCredit(PRELICENSE, modules, {
    courseExamPercent: 90,
    courseExamProctoredInPerson: true,
    attendanceMet: true,
    schoolCertificationNumber: "S-0000",
    courseApprovalNumber: "C-0000"
  });
  /* Numbers alone are not enough: the submission gates still stand. */
  assert.equal(numbered.certificateEligible, false);
  assert.match(numbered.certificateBlockedBy, /submission gates are unsatisfied/);
});

test("attendance is a provider input and no percentage is asserted", () => {
  const modules = allModuleIds(PRELICENSE).map((id) => ({ module_id: id, status: "completed" }));
  const credit = arizonaCourseCredit(PRELICENSE, modules, {
    courseExamPercent: 90,
    courseExamProctoredInPerson: true,
    attendanceMet: false
  });
  assert.equal(credit.courseComplete, false);
  assert.match(credit.certificateBlockedBy, /A\.A\.C\. R4-28-404 states no attendance percentage/);
});

test("every submission gate is unsatisfied and says what blocks it", () => {
  assert.ok(ARIZONA_SUBMISSION_GATES.length >= 10);
  for (const gate of ARIZONA_SUBMISSION_GATES) {
    assert.equal(gate.satisfied, false, gate.id);
    assert.ok(gate.blockedBy && gate.blockedBy.length > 20, gate.id);
    assert.ok(gate.rule && gate.rule.length > 5, gate.id);
  }
  const ids = ARIZONA_SUBMISSION_GATES.map((g) => g.id);
  for (const id of ["department-prescribed-content", "arizona-specific-content", "proctored-examination", "drafting-assessment", "records-retention"]) {
    assert.ok(ids.includes(id), `no gate for ${id}`);
  }
});

/* ---- The ten-year window ---- */

test("education validity is ten years, measured to the application", () => {
  assert.equal(ARIZONA_EDUCATION_VALIDITY_YEARS, 10);
  const validity = arizonaEducationValidity("2020-03-01", "2026-08-20");
  assert.equal(validity.validityYears, 10);
  assert.equal(validity.expiresOn, "2030-03-01");
  assert.equal(validity.withinWindow, true);
  assert.equal(validity.blockedBy, null);
  assert.match(validity.measuredTo, /the date of the application/i);

  const stale = arizonaEducationValidity("2010-03-01", "2026-08-20");
  assert.equal(stale.withinWindow, false);
  assert.match(stale.blockedBy, /32-2124\(B\)/);

  assert.equal(arizonaEducationValidity(null), null);
  assert.equal(arizonaEducationValidity("not a date"), null);
  assert.equal(arizonaEducationValidity("2020-03-01").withinWindow, null);
});

/* ---- Readiness across both courses ---- */

test("readiness requires BOTH courses, because § 32-2124 requires both", () => {
  const prelicense = { courseId: PRELICENSE, courseComplete: true, creditedArizonaSpecificHours: 27 };
  const contract = { courseId: CONTRACT_WRITING, courseComplete: true };

  const onlyPrelicense = arizonaEducationReadiness([prelicense], { age: 30 });
  assert.equal(onlyPrelicense.meetsHourRequirement, false);
  assert.match(onlyPrelicense.blockedBy, /32-2124\(L\)/);
  assert.match(onlyPrelicense.blockedBy, /at the time of application/i);

  const onlyContract = arizonaEducationReadiness([contract], { age: 30 });
  assert.equal(onlyContract.meetsHourRequirement, false);
  assert.match(onlyContract.blockedBy, /32-2124\(B\)/);

  const both = arizonaEducationReadiness([prelicense, contract], { age: 30 });
  assert.equal(both.meetsHourRequirement, true);
  assert.equal(both.completedHours, 96);
  assert.equal(both.blockedBy, null);
});

test("the minimum age is 18 and an underage applicant is blocked", () => {
  const prelicense = { courseId: PRELICENSE, courseComplete: true, creditedArizonaSpecificHours: 27 };
  const contract = { courseId: CONTRACT_WRITING, courseComplete: true };
  const young = arizonaEducationReadiness([prelicense, contract], { age: 17 });
  assert.equal(young.ageMet, false);
  assert.match(young.blockedBy, /32-2124\(D\)/);
  assert.equal(arizonaEducationReadiness([prelicense, contract], {}).ageMet, null);
});

test("an incomplete course record is not counted toward readiness", () => {
  const readiness = arizonaEducationReadiness([
    { courseId: PRELICENSE, courseComplete: false, creditedArizonaSpecificHours: 27 },
    { courseId: CONTRACT_WRITING, courseComplete: true }
  ], { age: 30 });
  assert.equal(readiness.prelicenseComplete, false);
  assert.equal(readiness.meetsHourRequirement, false);
});

/* ---- The banks ---- */

test("15 modules carry 165 items — one applied, five engagement, five remediation each", () => {
  let total = 0;
  let moduleCount = 0;
  for (const [courseId, bank] of BANKS) {
    for (const id of allModuleIds(courseId)) {
      const entry = bank[id];
      assert.ok(entry.applied, `${courseId} ${id}`);
      assert.equal(entry.engagement.length, 5, `${courseId} ${id}`);
      assert.equal(entry.remediation.length, 5, `${courseId} ${id}`);
      total += 11;
      moduleCount += 1;
    }
  }
  assert.equal(moduleCount, 15);
  assert.equal(total, 165);
});

test("every authored item has four choices, the answer at index 0, a real prompt and a rationale", () => {
  for (const [courseId, id, item] of allItems()) {
    assert.equal(item.choices.length, 4, `${courseId} ${id}: ${item.prompt}`);
    assert.equal(item.correctChoice, 0, `${courseId} ${id}: ${item.prompt}`);
    assert.equal(new Set(item.choices).size, 4, `${courseId} ${id} duplicate choices: ${item.prompt}`);
    assert.ok(item.prompt.length >= 25, `${courseId} ${id} prompt too short: ${item.prompt}`);
    assert.ok(item.rationale && item.rationale.length >= 40, `${courseId} ${id} rationale too short: ${item.prompt}`);
  }
});

test("every bank module's hours and Arizona-specific flag match the module table", () => {
  for (const courseId of ARIZONA_COURSE_IDS) {
    const bank = courseId === PRELICENSE ? PRELICENSE_BANK : CONTRACT_WRITING_BANK;
    for (const module of getArizonaCourse(courseId).modules) {
      assert.equal(bank[module.id].hours, module.hours, `${courseId} ${module.id}`);
      if (courseId === PRELICENSE) {
        assert.equal(bank[module.id].arizonaSpecific, module.arizonaSpecific, `${courseId} ${module.id}`);
      }
    }
  }
});

test("delivery permutes deterministically and the recorded selection keeps its meaning", () => {
  const first = getArizonaAssessment(PRELICENSE, "module-11", "engagement");
  const second = getArizonaAssessment(PRELICENSE, "module-11", "engagement");
  assert.deepEqual(first.items.map((i) => i.choices), second.items.map((i) => i.choices));
  for (const [index, item] of first.items.entries()) {
    assert.equal(item.choices[item.correctChoice], PRELICENSE_BANK["module-11"].engagement[index].choices[0]);
  }
});

test("the two courses' identically-named modules permute independently", () => {
  /* The permutation key is `courseId:itemId`, so the two courses' module-01 and module-02 are permuted
     independently. Two independent permutations of five items can coincide, so the assertion is that they
     do not BOTH coincide. */
  const differs = ["module-01", "module-02"].some((id) => {
    const prelicense = getArizonaAssessment(PRELICENSE, id, "engagement");
    const contract = getArizonaAssessment(CONTRACT_WRITING, id, "engagement");
    return JSON.stringify(prelicense.items.map((i) => i.correctChoice))
      !== JSON.stringify(contract.items.map((i) => i.correctChoice));
  });
  assert.equal(differs, true);
});

test("at least one delivered order differs from the authored order", () => {
  const moved = ARIZONA_COURSE_IDS.some((courseId) =>
    allModuleIds(courseId).some((id) =>
      getArizonaAssessment(courseId, id, "engagement").items.some((item) => item.correctChoice !== 0)));
  assert.equal(moved, true);
});

test("the public shape carries no answer key and no rationale", () => {
  for (const courseId of ARIZONA_COURSE_IDS) {
    for (const id of allModuleIds(courseId)) {
      for (const kind of ["applied", "engagement", "remediation"]) {
        const serialised = JSON.stringify(publicArizonaAssessment(getArizonaAssessment(courseId, id, kind)));
        assert.doesNotMatch(serialised, /correctChoice/, `${courseId} ${id} ${kind}`);
        assert.doesNotMatch(serialised, /rationale/, `${courseId} ${id} ${kind}`);
      }
    }
  }
});

test("no in-module assessment presents itself as the proctored course examination", () => {
  for (const courseId of ARIZONA_COURSE_IDS) {
    for (const id of allModuleIds(courseId)) {
      for (const kind of ["applied", "engagement", "remediation"]) {
        const assessment = getArizonaAssessment(courseId, id, kind);
        assert.equal(assessment.isTheProctoredCourseExamination, false, `${courseId} ${id} ${kind}`);
        assert.equal(publicArizonaAssessment(assessment).isTheProctoredCourseExamination, false, `${courseId} ${id} ${kind}`);
      }
    }
  }
});

test("scoring rejects coerced non-answers rather than recording a selection nobody made", () => {
  const assessment = getArizonaAssessment(PRELICENSE, "module-10", "engagement");
  const valid = assessment.items.map((item) => item.correctChoice);
  assert.equal(scoreArizonaAssessment(assessment, valid).percent, 100);
  for (const bad of [null, "", false, [], undefined, {}, "1.5", " ", "abc", -1, 4, 1.5, NaN]) {
    const answers = [...valid];
    answers[0] = bad;
    assert.equal(scoreArizonaAssessment(assessment, answers), null, `accepted ${JSON.stringify(bad)}`);
  }
  assert.equal(scoreArizonaAssessment(assessment, valid.slice(1)), null);
  assert.equal(scoreArizonaAssessment(null, valid), null);
});

test("scoring is against the school's threshold, not the Department's", () => {
  const assessment = getArizonaAssessment(PRELICENSE, "module-01", "engagement");
  assert.equal(assessment.passingPercent, 80);
  const applied = getArizonaAssessment(PRELICENSE, "module-01", "applied");
  assert.equal(applied.passingPercent, 100);
  const answers = assessment.items.map((item, index) => (index === 0 ? (item.correctChoice + 1) % 4 : item.correctChoice));
  const result = scoreArizonaAssessment(assessment, answers);
  assert.equal(result.percent, 80);
  assert.equal(result.passed, true);
});

test("unknown courses, modules and assessments return null rather than a guess", () => {
  assert.equal(getArizonaCourse("nope"), null);
  assert.equal(getArizonaModule("nope", "module-01"), null);
  assert.equal(getArizonaModule(PRELICENSE, "module-99"), null);
  assert.equal(getArizonaAssessment("nope", "module-01"), null);
  assert.equal(getArizonaAssessment(PRELICENSE, "module-99"), null);
  assert.equal(arizonaCourseCredit("nope", []), null);
  assert.equal(publicArizonaAssessment(null), null);
});

/* ---- What the sources say, and what they do not ---- */

test("the readings file records what was read and what was not", () => {
  assert.match(readings, /32-2124/);
  assert.match(readings, /R4-28-1101/);
  assert.match(readings, /2026 ADRE Law Book/i);
  assert.match(readings, /NOT obtained|not read/i);
  assert.ok(ARIZONA_UNREAD_SOURCES.length >= 12);
  const joined = ARIZONA_UNREAD_SOURCES.join(" | ");
  for (const source of ["PRESCRIBED PRELICENSURE COURSE CONTENT", "32-2151.01", "32-2153", "landlord-tenant", "statute of frauds", "unauthorised practice of law", "public report", "listing agreement duration", "32-2101(2)", "RESPA"]) {
    assert.ok(joined.includes(source), `unread list does not name ${source}`);
  }
});

test("every module names what it did not read", () => {
  for (const courseId of ARIZONA_COURSE_IDS) {
    for (const module of getArizonaCourse(courseId).modules) {
      const text = readModule(courseId, module.id);
      assert.match(text, /[Nn]ot read|[Nn]ot obtained/, `${courseId} ${module.id} names no gap`);
    }
  }
});

test("no transaction records retention period is stated anywhere in the build", () => {
  const module13 = readModule(PRELICENSE, "module-13");
  assert.match(module13, /32-2151\.01/);
  assert.match(module13, /neither was read|NEITHER of which was read|neither statute was read/i);
  const gate = ARIZONA_SUBMISSION_GATES.find((g) => g.id === "records-retention");
  assert.ok(gate);
  assert.match(gate.blockedBy, /no transaction records retention period is stated/i);
});

test("the school record retention period IS stated, because R4-28-404 was read", () => {
  assert.equal(ARIZONA_SCHOOL_RECORD_RETENTION_YEARS, 5);
  assert.match(readModule(PRELICENSE, "module-10"), /five-year school record|five years/i);
});

test("no item claims Department approval of this course", () => {
  for (const [courseId, id, item] of allItems()) {
    const text = `${item.choices[0]} ${item.rationale}`;
    assert.doesNotMatch(text, /this course is (Department[- ])?approved/i, `${courseId} ${id}`);
    assert.doesNotMatch(text, /state[- ]approved/i, `${courseId} ${id}`);
  }
});

test("no item states a period the sources read do not state", () => {
  const permitted = [
    /\b(three|3) calendar days?\b/i, /\b(seven|7)th? calendar day\b/i, /\b(ten|10)th? calendar day\b/i,
    /\b(six|6) months?\b/i, /\b(ten|10) years?\b/i, /\b(five|5) years?\b/i, /\b(three|3) years?\b/i,
    /\b(eighteen|18) years?\b/i, /\b(twenty[- ]four|24) hours?\b/i, /\b(sixty|60) days?\b/i,
    /\b(thirty|30) days?\b/i, /\b(three|3) days?\b/i, /\b(seven|7) days?\b/i, /\b(ten|10) days?\b/i,
    /\b(one|1) year\b/i, /\b(two|2) years?\b/i, /\b(twelve|12) months?\b/i, /\b(360|365)[- ]day\b/i,
    /\b(eight|8) years?\b/i, /\b(nine|9) days?\b/i, /\b(eight|8) days?\b/i, /\b(two|2) weekends?\b/i,
    /\b(four|4) years?\b/i, /\b(three|3) months?\b/i, /\b(one|1) month\b/i, /\b(six|6) weeks?\b/i,
    /\b27[- ]hours?\b/i, /\b(six|6) hours?\b/i, /\b(ninety|90) hours?\b/i, /\b(ninety[- ]six|96) hours?\b/i,
    /\b(seven|7) hours?\b/i, /\b(sixty[- ]three|63) hours?\b/i
  ];
  const quantified = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|sixteen|eighteen|twenty|thirty|forty|sixty|ninety)[\s-]+(business\s+|banking\s+|calendar\s+)?(days?|years?|months?|weeks?|weekends?|hours?)\b/gi;
  for (const [courseId, id, item] of allItems()) {
    /* The statute's own phrase is "TWENTY-SEVEN-HOUR ARIZONA-SPECIFIC COURSE". Normalise it to 27-hour so
       the sweep reads it as the one figure it is rather than as a stray "seven hour". */
    const text = `${item.choices[0]} ${item.rationale}`.replace(/twenty[- ]seven[- ]hour/gi, "27-hour");
    for (const match of text.match(quantified) ?? []) {
      const normalised = match.replace(/-/g, " ");
      assert.ok(
        permitted.some((pattern) => pattern.test(match) || pattern.test(normalised)),
        `${courseId} ${id} states a period the sources read do not: "${match}" in "${item.prompt}"`
      );
    }
  }
});

/* ---- The figures that came from a rule, each with its rule ---- */

test("the transcribed figures are the rules' own", () => {
  assert.equal(ARIZONA_RECORDED_MATERIAL_MAX_PERCENT, 20);
  assert.equal(ARIZONA_PROPERTY_NEGOTIATION_UNAVAILABILITY_HOURS, 24);
  assert.equal(ARIZONA_COMPENSATION_SHARING_DISCLOSURE_DAYS, 3);
  assert.equal(ARIZONA_RESCISSION_DAYS_UNIMPROVED_LOT, 7);
  assert.equal(ARIZONA_RESCISSION_DAYS_TIMESHARE, 10);
  assert.equal(ARIZONA_UNINSPECTED_LOT_INSPECTION_MONTHS, 6);
  assert.equal(ARIZONA_ACRE_MINIMUM_SQUARE_FEET, 43560);
});

test("the two rescission periods are kept distinct in the curriculum", () => {
  const module13 = readModule(PRELICENSE, "module-13");
  assert.match(module13, /seventh calendar day/i);
  assert.match(module13, /tenth calendar day/i);
  assert.match(module13, /unimproved subdivided lot/i);
  assert.match(module13, /time-share interval/i);
  assert.match(module13, /six months to inspect|SIX MONTHS TO INSPECT/i);
});

test("the advertising rule's artificial intelligence and no-scroll provisions are carried into the course", () => {
  const module12 = readModule(PRELICENSE, "module-12");
  assert.match(module12, /artificial intelligence/i);
  assert.match(module12, /without the need to scroll/i);
  assert.match(module12, /43,560 square feet/);
  assert.match(module12, /owner\/agent/i);
  assert.match(module12, /progressive disciplinary policy/i);
});

test("the 24-hour rule and its written waiver are carried into the course", () => {
  const module11 = readModule(PRELICENSE, "module-11");
  assert.match(module11, /24 hours/);
  assert.match(module11, /waive or alter this requirement by issuing written instructions/i);
  assert.match(module11, /R4-28-1102/);
});

test("the offer-submission duty is recorded as surviving acceptance", () => {
  const module13 = readModule(PRELICENSE, "module-13");
  assert.match(module13, /is not released from this duty by the client's acceptance of an offer/i);
  const module04 = readModule(PRELICENSE, "module-04");
  assert.match(module04, /R4-28-802/);
  const item = PRELICENSE_BANK["module-04"].applied;
  assert.match(item.choices[0], /is not released from this duty by the client's acceptance of an offer/i);
});

/* ---- The regulator's requirements and this school's decisions stay separate ---- */

test("regulator requirements and StateCourse decisions are separately labelled", () => {
  for (const courseId of ARIZONA_COURSE_IDS) {
    const course = getArizonaCourse(courseId);
    assert.ok(course.regulatorRequirements.length >= 15, courseId);
    assert.ok(course.stateCourseDecisions.length >= 4, courseId);
    for (const line of course.regulatorRequirements) {
      assert.match(line, /A\.R\.S\.|A\.A\.C\./, `${courseId} regulator line cites nothing: ${line}`);
    }
    for (const line of course.stateCourseDecisions) {
      assert.doesNotMatch(line, /^A\.R\.S\.|^A\.A\.C\./, `${courseId} decision line reads as a rule: ${line}`);
    }
  }
});

test("the module structure is recorded as this school's decision, not the statute's", () => {
  const decisions = getArizonaCourse(PRELICENSE).stateCourseDecisions.join(" | ");
  assert.match(decisions, /thirteen modules/i);
  assert.match(decisions, /states no module structure and no content for them/i);
  assert.match(decisions, /80 percent/);
});

test("the requirement that all three drafts be recorded is labelled a school decision", () => {
  const decisions = getArizonaCourse(CONTRACT_WRITING).stateCourseDecisions.join(" | ");
  assert.match(decisions, /all three drafts/i);
  assert.match(decisions, /this school's/i);
});
