/**
 * Colorado broker prelicensing — tests.
 *
 * Five things these tests exist to hold.
 *
 * ONE: 168 HOURS, AND THE ASYMMETRY INSIDE IT. C.R.S. § 12-10-203(4)(a) fixes 48 and 48 exactly and then "a
 * total of seventy-two hours" from four named subjects, allocating NONE among the four. Rule 2.1.A.2 makes
 * that allocation, stating the first two as EXACT figures and the other four as FLOORS. A test fails if the
 * total drifts, if the four-subject group drifts from 72, or if an exact figure is recorded as a floor or
 * the reverse.
 *
 * TWO: THE CONTRACTS COURSE SURVIVES EVERY WAIVER. § 12-10-203(4)(b) relieves an out-of-state BROKER of
 * everything except contracts and closings; (4)(c) relieves an out-of-state SALESPERSON of everything except
 * contracts and the whole 72-hour group. A test asserts the contracts course is in all three required sets
 * and that the set sizes are 6, 2 and 5.
 *
 * THREE: DUAL AGENCY IS PROHIBITED AND THE DEFAULT IS THE NON-AGENCY RELATIONSHIP. § 12-10-406 is one
 * sentence with no consent mechanism, and § 12-10-403(2) makes a broker a transaction-broker unless single
 * agency is established in writing. This project has built for Washington, which permits limited dual agency
 * with separately initialed consent and makes buyer agency the default, and for Arizona, which permits dual
 * representation with prior written consent. Tests assert Colorado is recorded as neither.
 *
 * FOUR: THE COMMISSION'S COMPLETION REQUIREMENTS ARE NOT SATISFIED BY READING. Six brokerage relationship
 * families and four sales contract families with related forms and three financing structures; eight closing
 * problems of which three from prepared contracts; and the practical exercises. Tests assert the engine
 * refuses credit until each is recorded.
 *
 * FIVE: THE OUTLINES DIFFER AND THE BUILD DOES NOT FLATTEN THEM. Five outlines state hours per topic and
 * CURRENT LEGAL ISSUES STATES NONE, so that course's module hours are this school's and every one of its
 * modules says so. Two outlines require a written examination in capitals, three state that testing is
 * required, and CURRENT LEGAL ISSUES STATES NO EXAMINATION REQUIREMENT — which this build does not invent.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import LAW_AND_PRACTICE_BANK from "../config/colorado/law-and-practice-48-question-bank.mjs";
import CONTRACTS_BANK from "../config/colorado/contracts-and-regulations-48-question-bank.mjs";
import CLOSINGS_BANK from "../config/colorado/closings-24-question-bank.mjs";
import TRUST_ACCOUNTS_BANK from "../config/colorado/trust-accounts-8-question-bank.mjs";
import CURRENT_LEGAL_ISSUES_BANK from "../config/colorado/current-legal-issues-8-question-bank.mjs";
import PRACTICAL_APPLICATIONS_BANK from "../config/colorado/practical-applications-32-question-bank.mjs";
import {
  getColoradoCourse,
  getColoradoProgram,
  getColoradoModule,
  getColoradoAssessment,
  publicColoradoAssessment,
  scoreColoradoAssessment,
  coloradoCourseCredit,
  coloradoEducationReadiness,
  coloradoExaminationScoreValidity,
  coloradoRequiredCourses,
  COLORADO_COURSE_IDS,
  COLORADO_STATUTORY_SUBJECTS,
  COLORADO_STATUTORY_RELATIONSHIPS,
  COLORADO_REQUIRED_FORM_COMPLETIONS,
  COLORADO_REQUIRED_FINANCING_STRUCTURES,
  COLORADO_REQUIRED_CLOSING_PROBLEMS,
  COLORADO_REQUIRED_PREPARED_CONTRACT_PROBLEMS,
  COLORADO_REQUIRED_PRACTICAL_EXERCISES,
  COLORADO_SUBMISSION_GATES,
  COLORADO_UNREAD_SOURCES,
  COLORADO_REQUIRED_TOTAL_HOURS,
  COLORADO_FOUR_SUBJECT_GROUP_HOURS,
  COLORADO_CONTRACTS_COURSE_ID,
  COLORADO_CLOSINGS_COURSE_ID,
  COLORADO_STATE_EXAMINATION_PASSING_PERCENT,
  COLORADO_EXAMINATION_SCORE_VALIDITY_YEARS,
  COLORADO_TRANSACTION_FILE_RETENTION_YEARS,
  COLORADO_RELATIONSHIP_BACKSTOP_YEARS,
  COLORADO_INDEPENDENT_PRACTICE_YEARS,
  COLORADO_BROKERAGE_ADMINISTRATION_HOURS,
  COLORADO_OTHER_MONEY_DEPOSIT_BUSINESS_DAYS,
  COLORADO_PROPERTY_MANAGEMENT_DEPOSIT_BUSINESS_DAYS,
  COLORADO_DEPOSIT_STATUS_DISCLOSURE_DAYS,
  COLORADO_DEPOSIT_TRANSFER_DAYS,
  COLORADO_BENEFICIARY_REPORT_DAYS,
  COLORADO_EXPIRED_LISTING_REMOVAL_DAYS,
  COLORADO_DUAL_AGENCY_PROHIBITED,
  COLORADO_DEFAULT_RELATIONSHIP
} from "../config/colorado-course-engine.mjs";

const LAW_AND_PRACTICE = "co-real-estate-law-and-practice-48-v1";
const CONTRACTS = "co-contracts-and-regulations-48-v1";
const CLOSINGS = "co-closings-24-v1";
const TRUST_ACCOUNTS = "co-trust-accounts-and-record-keeping-8-v1";
const CURRENT_LEGAL_ISSUES = "co-current-legal-issues-8-v1";
const PRACTICAL_APPLICATIONS = "co-practical-applications-32-v1";

const prose = (text) => text
  .replace(/^\s*>\s?/gm, "")
  .replace(/\*\*/g, "")
  .replace(/\s+/g, " ");

const BANKS = Object.freeze({
  [LAW_AND_PRACTICE]: LAW_AND_PRACTICE_BANK,
  [CONTRACTS]: CONTRACTS_BANK,
  [CLOSINGS]: CLOSINGS_BANK,
  [TRUST_ACCOUNTS]: TRUST_ACCOUNTS_BANK,
  [CURRENT_LEGAL_ISSUES]: CURRENT_LEGAL_ISSUES_BANK,
  [PRACTICAL_APPLICATIONS]: PRACTICAL_APPLICATIONS_BANK
});

const readModule = (courseId, moduleId) =>
  prose(readFileSync(new URL(`../${getColoradoCourse(courseId).modules && ""}${COURSE_DIR[courseId]}/${moduleId}.md`, import.meta.url), "utf8"));

const COURSE_DIR = {
  [LAW_AND_PRACTICE]: "colorado/co-real-estate-law-and-practice-48-v1/curriculum",
  [CONTRACTS]: "colorado/co-contracts-and-regulations-48-v1/curriculum",
  [CLOSINGS]: "colorado/co-closings-24-v1/curriculum",
  [TRUST_ACCOUNTS]: "colorado/co-trust-accounts-and-record-keeping-8-v1/curriculum",
  [CURRENT_LEGAL_ISSUES]: "colorado/co-current-legal-issues-8-v1/curriculum",
  [PRACTICAL_APPLICATIONS]: "colorado/co-practical-applications-32-v1/curriculum"
};

const readings = prose(readFileSync(new URL("../colorado/regulatory/primary-text-readings.md", import.meta.url), "utf8"));

const allModuleIds = (courseId) => getColoradoCourse(courseId).modules.map((m) => m.id);
const allModuleStates = (courseId) => allModuleIds(courseId).map((id) => ({ module_id: id, status: "completed" }));
const allItems = function* () {
  for (const courseId of COLORADO_COURSE_IDS) {
    const bank = BANKS[courseId];
    for (const id of allModuleIds(courseId)) {
      const entry = bank[id];
      for (const item of [entry.applied, ...entry.engagement, ...entry.remediation]) yield [courseId, id, item];
    }
  }
};

/* ---- 168 hours, and the asymmetry inside it ---- */

test("the six courses deliver exactly the statutory 168 hours", () => {
  assert.equal(COLORADO_REQUIRED_TOTAL_HOURS, 168);
  const program = getColoradoProgram();
  assert.equal(program.deliveredHours, 168);
  assert.equal(program.requiredHours, 168);
  assert.equal(program.courses.length, 6);
  assert.equal(program.moduleCount, 29);
});

test("the four-subject group totals exactly the seventy-two hours the statute requires", () => {
  assert.equal(COLORADO_FOUR_SUBJECT_GROUP_HOURS, 72);
  const program = getColoradoProgram();
  assert.equal(program.fourSubjectGroupHours, 72);
  const group = COLORADO_COURSE_IDS.filter((id) => getColoradoCourse(id).inFourSubjectGroup);
  assert.deepEqual(group.sort(), [CLOSINGS, CURRENT_LEGAL_ISSUES, PRACTICAL_APPLICATIONS, TRUST_ACCOUNTS].sort());
  assert.equal(group.reduce((sum, id) => sum + getColoradoCourse(id).hours, 0), 72);
});

test("Rule 2.1.A.2 states two courses as exact figures and four as floors", () => {
  assert.equal(COLORADO_STATUTORY_SUBJECTS.length, 6);
  const exact = COLORADO_STATUTORY_SUBJECTS.filter((s) => s.hoursAreExact);
  const floors = COLORADO_STATUTORY_SUBJECTS.filter((s) => !s.hoursAreExact);
  assert.equal(exact.length, 2);
  assert.equal(floors.length, 4);
  assert.deepEqual(exact.map((s) => s.hours).sort(), [48, 48]);
  assert.deepEqual(floors.map((s) => s.hours).sort((a, b) => a - b), [8, 8, 24, 32]);
  assert.equal(floors.reduce((sum, s) => sum + s.hours, 0), 72);
  assert.equal(getColoradoCourse(LAW_AND_PRACTICE).hoursAreExact, true);
  assert.equal(getColoradoCourse(CONTRACTS).hoursAreExact, true);
  assert.equal(getColoradoCourse(CLOSINGS).hoursAreFloor, true);
  assert.equal(getColoradoCourse(TRUST_ACCOUNTS).hoursAreFloor, true);
});

test("every statutory subject cites both its statute paragraph and its rule paragraph", () => {
  for (const subject of COLORADO_STATUTORY_SUBJECTS) {
    assert.match(subject.statuteCitation, /12-10-203\(4\)\(a\)/, subject.courseId);
    assert.match(subject.ruleCitation, /Rule 2\.1\.A\.2\./, subject.courseId);
    assert.ok(getColoradoCourse(subject.courseId), subject.courseId);
  }
});

test("each course's module hours sum to the course total", () => {
  for (const courseId of COLORADO_COURSE_IDS) {
    const course = getColoradoCourse(courseId);
    const sum = course.modules.reduce((total, m) => total + m.hours, 0);
    assert.ok(Math.abs(sum - course.hours) < 1e-9, `${courseId}: ${sum} vs ${course.hours}`);
  }
});

/* ---- The contracts course survives every waiver ---- */

test("the contracts course is required of every applicant, however licensed elsewhere", () => {
  for (const status of ["none", "broker", "salesperson"]) {
    assert.ok(coloradoRequiredCourses(status).includes(CONTRACTS), status);
  }
  assert.equal(getColoradoProgram().contractsCourseRequiredOfEveryApplicant, true);
});

test("§ 12-10-203(4)(b) leaves an out-of-state broker with contracts and closings", () => {
  const required = coloradoRequiredCourses("broker");
  assert.equal(required.length, 2);
  assert.deepEqual([...required].sort(), [CLOSINGS, CONTRACTS].sort());
});

test("§ 12-10-203(4)(c) leaves an out-of-state salesperson with contracts and the four-subject group", () => {
  const required = coloradoRequiredCourses("salesperson");
  assert.equal(required.length, 5);
  assert.ok(required.includes(CONTRACTS));
  for (const id of [CLOSINGS, TRUST_ACCOUNTS, CURRENT_LEGAL_ISSUES, PRACTICAL_APPLICATIONS]) {
    assert.ok(required.includes(id), id);
  }
  assert.ok(!required.includes(LAW_AND_PRACTICE));
});

test("an applicant with no out-of-state licence completes all six", () => {
  assert.equal(coloradoRequiredCourses("none").length, 6);
  assert.equal(coloradoRequiredCourses().length, 6);
});

test("readiness applies the waiver and names the section that supplied it", () => {
  const complete = (id) => ({ courseId: id, courseComplete: true });
  const brokerReady = coloradoEducationReadiness([complete(CONTRACTS), complete(CLOSINGS)], { outOfStateLicence: "broker", age: 30 });
  assert.equal(brokerReady.meetsCourseRequirement, true);
  assert.equal(brokerReady.requiredHours, 72);
  assert.equal(brokerReady.blockedBy, null);

  const brokerShort = coloradoEducationReadiness([complete(CONTRACTS)], { outOfStateLicence: "broker", age: 30 });
  assert.equal(brokerShort.meetsCourseRequirement, false);
  assert.match(brokerShort.blockedBy, /12-10-203\(4\)\(b\)/);
  assert.match(brokerShort.blockedBy, /Closings/);

  const salespersonShort = coloradoEducationReadiness([complete(CLOSINGS)], { outOfStateLicence: "salesperson", age: 30 });
  assert.equal(salespersonShort.contractsCourseComplete, false);
  assert.match(salespersonShort.blockedBy, /12-10-203\(4\)\(c\)/);
});

test("a degree with a major course of study in real estate is an alternative to the courses", () => {
  const readiness = coloradoEducationReadiness([], { age: 30, degreeInRealEstate: true });
  assert.equal(readiness.degreeInRealEstate, true);
  assert.equal(readiness.meetsCourseRequirement, true);
  assert.equal(readiness.blockedBy, null);
});

/* ---- Dual agency prohibited; the default is the non-agency relationship ---- */

test("dual agency is recorded as prohibited outright", () => {
  assert.equal(COLORADO_DUAL_AGENCY_PROHIBITED, true);
  assert.equal(getColoradoProgram().dualAgencyProhibited, true);
  for (const courseId of COLORADO_COURSE_IDS) {
    assert.equal(getColoradoCourse(courseId).dualAgencyProhibited, true, courseId);
  }
  assert.ok(!COLORADO_STATUTORY_RELATIONSHIPS.some((r) => r.id === "dual-agent"));
});

test("the transaction-broker is the single default and is not an agent", () => {
  assert.equal(COLORADO_DEFAULT_RELATIONSHIP, "transaction-broker");
  const defaults = COLORADO_STATUTORY_RELATIONSHIPS.filter((r) => r.isDefault);
  assert.equal(defaults.length, 1);
  assert.equal(defaults[0].id, "transaction-broker");
  assert.equal(defaults[0].isAgent, false);
  assert.match(defaults[0].arisesBy, /12-10-403\(2\)/);
});

test("the transaction-broker's confidential list is six and each single agent's is five", () => {
  const tb = COLORADO_STATUTORY_RELATIONSHIPS.find((r) => r.id === "transaction-broker");
  assert.equal(tb.confidentialItems, 6);
  for (const id of ["sellers-agent", "buyers-agent"]) {
    assert.equal(COLORADO_STATUTORY_RELATIONSHIPS.find((r) => r.id === id).confidentialItems, 5, id);
  }
});

test("confidentiality survives termination for a single agent and the transaction-broker carries accounting only", () => {
  const tb = COLORADO_STATUTORY_RELATIONSHIPS.find((r) => r.id === "transaction-broker");
  assert.match(tb.survivesTermination, /accounting only/i);
  assert.match(tb.survivesTermination, /12-10-409\(3\)/);
  for (const id of ["sellers-agent", "buyers-agent"]) {
    const agent = COLORADO_STATUTORY_RELATIONSHIPS.find((r) => r.id === id);
    assert.match(agent.survivesTermination, /confidentiality/i, id);
  }
});

test("the curriculum contrasts Colorado against the states that permit dual agency", () => {
  const module02 = readModule(CONTRACTS, "module-02");
  assert.match(module02, /A broker shall not establish dual agency with any seller, landlord, buyer, or tenant/);
  assert.match(module02, /Washington/);
  assert.match(module02, /Arizona/);
  const module03 = readModule(LAW_AND_PRACTICE, "module-03");
  assert.match(module03, /transaction-broker/i);
  assert.match(module03, /12-10-406/);
});

/* ---- The Commission's completion requirements ---- */

test("the Contracts outline's six families and four sales contract families are recorded", () => {
  assert.equal(COLORADO_REQUIRED_FORM_COMPLETIONS.length, 10);
  assert.equal(COLORADO_REQUIRED_FORM_COMPLETIONS.filter((f) => f.group === "brokerage-relationship").length, 6);
  assert.equal(COLORADO_REQUIRED_FORM_COMPLETIONS.filter((f) => f.group === "sales-contract").length, 4);
  for (const form of COLORADO_REQUIRED_FORM_COMPLETIONS) {
    assert.equal(form.courseId, CONTRACTS, form.id);
  }
  assert.deepEqual([...COLORADO_REQUIRED_FINANCING_STRUCTURES], ["new-financing", "loan-assumption", "owner-carry"]);
});

test("the contracts course is not credited until every form and financing structure is recorded", () => {
  const base = { attendanceMet: true, examinationRecorded: true };
  const none = coloradoCourseCredit(CONTRACTS, allModuleStates(CONTRACTS), base);
  assert.equal(none.allModulesComplete, true);
  assert.equal(none.formRequirementMet, false);
  assert.equal(none.courseComplete, false);
  assert.equal(none.outstandingFormIds.length, 10);
  assert.match(none.certificateBlockedBy, /COMPLETE these forms/i);

  const formsOnly = coloradoCourseCredit(CONTRACTS, allModuleStates(CONTRACTS), {
    ...base,
    completedFormIds: COLORADO_REQUIRED_FORM_COMPLETIONS.map((f) => f.id)
  });
  assert.equal(formsOnly.courseComplete, false);
  assert.deepEqual([...formsOnly.outstandingFinancingStructures], ["new-financing", "loan-assumption", "owner-carry"]);
  assert.match(formsOnly.certificateBlockedBy, /owner carry financing/i);

  const all = coloradoCourseCredit(CONTRACTS, allModuleStates(CONTRACTS), {
    ...base,
    completedFormIds: COLORADO_REQUIRED_FORM_COMPLETIONS.map((f) => f.id),
    completedFinancingStructures: [...COLORADO_REQUIRED_FINANCING_STRUCTURES]
  });
  assert.equal(all.formRequirementMet, true);
  assert.equal(all.courseComplete, true);
});

test("the closings course requires eight problems of which three from prepared contracts", () => {
  assert.equal(COLORADO_REQUIRED_CLOSING_PROBLEMS, 8);
  assert.equal(COLORADO_REQUIRED_PREPARED_CONTRACT_PROBLEMS, 3);
  const base = { attendanceMet: true, examinationRecorded: true };

  const seven = coloradoCourseCredit(CLOSINGS, allModuleStates(CLOSINGS), { ...base, completedClosingProblems: 7, completedPreparedContractProblems: 3 });
  assert.equal(seven.courseComplete, false);
  assert.match(seven.certificateBlockedBy, /minimum of 8 closing problems/i);

  const twoPrepared = coloradoCourseCredit(CLOSINGS, allModuleStates(CLOSINGS), { ...base, completedClosingProblems: 8, completedPreparedContractProblems: 2 });
  assert.equal(twoPrepared.courseComplete, false);
  assert.match(twoPrepared.certificateBlockedBy, /3 shall use samples of prepared contracts/i);

  const both = coloradoCourseCredit(CLOSINGS, allModuleStates(CLOSINGS), { ...base, completedClosingProblems: 8, completedPreparedContractProblems: 3 });
  assert.equal(both.closingProblemRequirementMet, true);
  assert.equal(both.courseComplete, true);
});

test("more prepared-contract problems than total problems is rejected", () => {
  const credit = coloradoCourseCredit(CLOSINGS, allModuleStates(CLOSINGS), {
    attendanceMet: true, examinationRecorded: true, completedClosingProblems: 8, completedPreparedContractProblems: 9
  });
  assert.equal(credit.closingProblemRequirementMet, false);
  assert.equal(credit.courseComplete, false);
});

test("the record keeping course requires all four practical exercises", () => {
  assert.equal(COLORADO_REQUIRED_PRACTICAL_EXERCISES.length, 4);
  const base = { attendanceMet: true, examinationRecorded: true };
  const two = coloradoCourseCredit(TRUST_ACCOUNTS, allModuleStates(TRUST_ACCOUNTS), {
    ...base, completedExerciseIds: ["broker-closed-sale", "property-manager-reconciliation"]
  });
  assert.equal(two.courseComplete, false);
  assert.equal(two.outstandingExerciseIds.length, 2);
  assert.match(two.certificateBlockedBy, /Topic II\.B\.4/);

  const all = coloradoCourseCredit(TRUST_ACCOUNTS, allModuleStates(TRUST_ACCOUNTS), {
    ...base, completedExerciseIds: COLORADO_REQUIRED_PRACTICAL_EXERCISES.map((e) => e.id)
  });
  assert.equal(all.practicalExerciseRequirementMet, true);
  assert.equal(all.courseComplete, true);
});

test("an unrecognised form or exercise id satisfies nothing", () => {
  const credit = coloradoCourseCredit(CONTRACTS, allModuleStates(CONTRACTS), {
    attendanceMet: true, examinationRecorded: true,
    completedFormIds: ["open-listing", "some-other-form"],
    completedFinancingStructures: ["new-financing", "cash"]
  });
  assert.equal(credit.courseComplete, false);
  assert.equal(credit.outstandingFormIds.length, 9);
  assert.ok(credit.outstandingFinancingStructures.includes("loan-assumption"));
});

test("no in-module assessment claims to satisfy a completion or examination requirement", () => {
  for (const courseId of COLORADO_COURSE_IDS) {
    for (const id of allModuleIds(courseId)) {
      for (const kind of ["applied", "engagement", "remediation"]) {
        const assessment = getColoradoAssessment(courseId, id, kind);
        assert.equal(assessment.satisfiesCompletionRequirement, false, `${courseId} ${id} ${kind}`);
        assert.equal(assessment.satisfiesOutlineExaminationRequirement, false, `${courseId} ${id} ${kind}`);
        assert.equal(assessment.isTheStateExamination, false, `${courseId} ${id} ${kind}`);
        const pub = publicColoradoAssessment(assessment);
        assert.equal(pub.satisfiesCompletionRequirement, false);
        assert.equal(pub.isTheStateExamination, false);
      }
    }
  }
});

/* ---- The outlines differ, and the build does not flatten them ---- */

test("five outlines state hours per topic and Current Legal Issues states none", () => {
  for (const courseId of COLORADO_COURSE_IDS) {
    const course = getColoradoCourse(courseId);
    assert.equal(course.writtenToCommissionOutline, true, courseId);
    assert.equal(course.moduleHoursAreCommissions, courseId !== CURRENT_LEGAL_ISSUES, courseId);
  }
  assert.equal(getColoradoProgram().writtenToCommissionOutlines, true);
});

test("every Current Legal Issues module records its hours as a StateCourse decision, and no other module does", () => {
  for (const courseId of COLORADO_COURSE_IDS) {
    const bank = BANKS[courseId];
    for (const id of allModuleIds(courseId)) {
      const expected = courseId === CURRENT_LEGAL_ISSUES;
      assert.equal(Boolean(bank[id].hoursAreStateCourseDecision), expected, `${courseId} ${id}`);
    }
  }
});

test("the 8.1 heading discrepancy is recorded and not adopted", () => {
  const course = getColoradoCourse(CURRENT_LEGAL_ISSUES);
  assert.equal(course.hours, 8);
  assert.equal(course.outlineHeadingHours, 8.1);
  const gate = COLORADO_SUBMISSION_GATES.find((g) => g.id === "current-legal-issues-hours");
  assert.ok(gate);
  assert.equal(gate.satisfied, false);
  assert.match(gate.blockedBy, /8\.0/);
  assert.match(gate.blockedBy, /open question for the Division/i);
  assert.match(readModule(CURRENT_LEGAL_ISSUES, "module-01"), /8\.1/);
});

test("the outline examination requirements are recorded as they differ", () => {
  assert.equal(getColoradoCourse(CLOSINGS).outlineExaminationRequirement, "written-examination-required");
  assert.equal(getColoradoCourse(TRUST_ACCOUNTS).outlineExaminationRequirement, "written-examination-required");
  assert.equal(getColoradoCourse(LAW_AND_PRACTICE).outlineExaminationRequirement, "testing-required");
  assert.equal(getColoradoCourse(CONTRACTS).outlineExaminationRequirement, "testing-required");
  assert.equal(getColoradoCourse(PRACTICAL_APPLICATIONS).outlineExaminationRequirement, "test-required");
  assert.equal(getColoradoCourse(CURRENT_LEGAL_ISSUES).outlineExaminationRequirement, "none-stated");
});

test("Current Legal Issues is credited without an examination the Commission did not require", () => {
  const credit = coloradoCourseCredit(CURRENT_LEGAL_ISSUES, allModuleStates(CURRENT_LEGAL_ISSUES), { attendanceMet: true });
  assert.equal(credit.examinationRequired, false);
  assert.equal(credit.examinationRequirementMet, true);
  assert.equal(credit.courseComplete, true);
});

test("a course whose outline requires an examination is not credited without one", () => {
  const credit = coloradoCourseCredit(CLOSINGS, allModuleStates(CLOSINGS), {
    attendanceMet: true, completedClosingProblems: 8, completedPreparedContractProblems: 3
  });
  assert.equal(credit.examinationRequired, true);
  assert.equal(credit.courseComplete, false);
  assert.match(credit.certificateBlockedBy, /WRITTEN EXAMINATION/i);
});

test("Current Legal Issues records that its content is supplied by Commission staff", () => {
  assert.equal(getColoradoCourse(CURRENT_LEGAL_ISSUES).contentSuppliedByCommissionStaff, true);
  for (const id of COLORADO_COURSE_IDS.filter((c) => c !== CURRENT_LEGAL_ISSUES)) {
    assert.equal(getColoradoCourse(id).contentSuppliedByCommissionStaff, false, id);
  }
  const gate = COLORADO_SUBMISSION_GATES.find((g) => g.id === "current-legal-issues-content");
  assert.ok(gate);
  assert.match(gate.blockedBy, /RECURS/i);
});

/* ---- The state examination ---- */

test("the state examination has two parts, a third party testing service, and no passing score stated", () => {
  assert.equal(COLORADO_STATE_EXAMINATION_PASSING_PERCENT, null);
  assert.equal(getColoradoProgram().stateExaminationPassingPercent, null);
  for (const courseId of COLORADO_COURSE_IDS) {
    const exam = getColoradoCourse(courseId).stateExamination;
    assert.deepEqual([...exam.parts], ["national", "Colorado"], courseId);
    assert.match(exam.administeredBy, /third party testing service/i, courseId);
    assert.equal(exam.passingPercent, null, courseId);
    assert.equal(exam.passingPercentIsRegulatorFigure, false, courseId);
    assert.equal(exam.educationCompletedAndProofFiledFirst, true, courseId);
    assert.equal(exam.includesClosingStatementPreparation, true, courseId);
  }
});

test("an examination score is valid for one year, measured to a complete application", () => {
  assert.equal(COLORADO_EXAMINATION_SCORE_VALIDITY_YEARS, 1);
  const good = coloradoExaminationScoreValidity("2026-03-01", "2026-08-20");
  assert.equal(good.expiresOn, "2027-03-01");
  assert.equal(good.withinWindow, true);
  assert.equal(good.blockedBy, null);
  assert.match(good.measuredTo, /complete application/i);

  const stale = coloradoExaminationScoreValidity("2024-03-01", "2026-08-20");
  assert.equal(stale.withinWindow, false);
  assert.match(stale.blockedBy, /Rule 2\.2\.F/);

  assert.equal(coloradoExaminationScoreValidity(null), null);
  assert.equal(coloradoExaminationScoreValidity("not a date"), null);
  assert.equal(coloradoExaminationScoreValidity("2026-03-01").withinWindow, null);
});

test("education comes before the examination", () => {
  const readiness = coloradoEducationReadiness([], {});
  assert.equal(readiness.educationBeforeExamination, true);
  assert.match(readiness.examinationRuleCitation, /Rule 2\.2\.C/);
  assert.equal(readiness.determinationIsTheCommissions, true);
});

/* ---- Approval, gates and honesty ---- */

test("no course claims approval and every course states no hours are available", () => {
  for (const courseId of COLORADO_COURSE_IDS) {
    const course = getColoradoCourse(courseId);
    assert.match(course.approvalStatus, /^Not approved\./, courseId);
    assert.match(course.approvalStatus, /No Colorado qualifying education hours are available/i, courseId);
    assert.equal(course.version, "1.0-submission-draft", courseId);
  }
  assert.match(getColoradoProgram().approvalStatus, /^Not approved\./);
});

test("every module states its regulatory status on the first page", () => {
  for (const courseId of COLORADO_COURSE_IDS) {
    for (const module of getColoradoCourse(courseId).modules) {
      assert.match(readModule(courseId, module.id), /Regulatory status: Development\. Not approved\./, `${courseId} ${module.id}`);
    }
  }
});

test("no certificate can issue without both a school and a course approval number", () => {
  const complete = coloradoCourseCredit(CURRENT_LEGAL_ISSUES, allModuleStates(CURRENT_LEGAL_ISSUES), { attendanceMet: true });
  assert.equal(complete.courseComplete, true);
  assert.equal(complete.certificateEligible, false);
  assert.match(complete.certificateBlockedBy, /12-10-203\(4\)\(a\)/);

  const numbered = coloradoCourseCredit(CURRENT_LEGAL_ISSUES, allModuleStates(CURRENT_LEGAL_ISSUES), {
    attendanceMet: true, schoolApprovalNumber: "S-0000", courseApprovalNumber: "C-0000"
  });
  assert.equal(numbered.certificateEligible, false);
  assert.match(numbered.certificateBlockedBy, /submission gates are unsatisfied/);
});

test("attendance is a provider input and no percentage is asserted", () => {
  const credit = coloradoCourseCredit(CURRENT_LEGAL_ISSUES, allModuleStates(CURRENT_LEGAL_ISSUES), { attendanceMet: false });
  assert.equal(credit.courseComplete, false);
  assert.match(credit.certificateBlockedBy, /no Colorado statute or rule read for this build states an attendance percentage/i);
});

test("every submission gate is unsatisfied and says what blocks it", () => {
  assert.ok(COLORADO_SUBMISSION_GATES.length >= 10);
  for (const gate of COLORADO_SUBMISSION_GATES) {
    assert.equal(gate.satisfied, false, gate.id);
    assert.ok(gate.blockedBy && gate.blockedBy.length > 20, gate.id);
    assert.ok(gate.rule && gate.rule.length > 5, gate.id);
  }
  const ids = COLORADO_SUBMISSION_GATES.map((g) => g.id);
  for (const id of ["commission-approved-forms", "current-legal-issues-content", "position-statements", "transaction-file-checklist", "online-course-approval-checklist", "errors-and-omissions-insurance", "state-examination-passing-score"]) {
    assert.ok(ids.includes(id), `no gate for ${id}`);
  }
});

test("the Commission-approved forms gate is recorded as the largest", () => {
  const gate = COLORADO_SUBMISSION_GATES.find((g) => g.id === "commission-approved-forms");
  assert.match(gate.blockedBy, /largest submission gate/i);
  assert.match(gate.rule, /12-10-403\(4\)\(c\)/);
  assert.match(gate.rule, /Rule 7\.1\.A/);
});

/* ---- The banks ---- */

test("29 modules carry 319 items — one applied, five engagement, five remediation each", () => {
  let total = 0;
  let count = 0;
  for (const courseId of COLORADO_COURSE_IDS) {
    const bank = BANKS[courseId];
    for (const id of allModuleIds(courseId)) {
      const entry = bank[id];
      assert.ok(entry.applied, `${courseId} ${id}`);
      assert.equal(entry.engagement.length, 5, `${courseId} ${id}`);
      assert.equal(entry.remediation.length, 5, `${courseId} ${id}`);
      total += 11;
      count += 1;
    }
  }
  assert.equal(count, 29);
  assert.equal(total, 319);
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

test("every bank module's hours and Commission topic match the module table", () => {
  for (const courseId of COLORADO_COURSE_IDS) {
    const bank = BANKS[courseId];
    for (const module of getColoradoCourse(courseId).modules) {
      assert.ok(Math.abs(bank[module.id].hours - module.hours) < 1e-9, `${courseId} ${module.id}`);
      assert.equal(bank[module.id].commissionTopic, module.commissionTopic, `${courseId} ${module.id}`);
    }
  }
});

test("delivery permutes deterministically and the recorded selection keeps its meaning", () => {
  const first = getColoradoAssessment(CONTRACTS, "module-02", "engagement");
  const second = getColoradoAssessment(CONTRACTS, "module-02", "engagement");
  assert.deepEqual(first.items.map((i) => i.choices), second.items.map((i) => i.choices));
  for (const [index, item] of first.items.entries()) {
    assert.equal(item.choices[item.correctChoice], CONTRACTS_BANK["module-02"].engagement[index].choices[0]);
  }
});

test("identically-named modules across courses permute independently", () => {
  const differs = COLORADO_COURSE_IDS.some((a) => COLORADO_COURSE_IDS.some((b) => {
    if (a >= b) return false;
    const first = getColoradoAssessment(a, "module-01", "engagement");
    const second = getColoradoAssessment(b, "module-01", "engagement");
    if (!first || !second) return false;
    return JSON.stringify(first.items.map((i) => i.correctChoice)) !== JSON.stringify(second.items.map((i) => i.correctChoice));
  }));
  assert.equal(differs, true);
});

test("at least one delivered order differs from the authored order", () => {
  const moved = COLORADO_COURSE_IDS.some((courseId) =>
    allModuleIds(courseId).some((id) =>
      getColoradoAssessment(courseId, id, "engagement").items.some((item) => item.correctChoice !== 0)));
  assert.equal(moved, true);
});

test("the public shape carries no answer key and no rationale", () => {
  for (const courseId of COLORADO_COURSE_IDS) {
    for (const id of allModuleIds(courseId)) {
      for (const kind of ["applied", "engagement", "remediation"]) {
        const serialised = JSON.stringify(publicColoradoAssessment(getColoradoAssessment(courseId, id, kind)));
        assert.doesNotMatch(serialised, /correctChoice/, `${courseId} ${id} ${kind}`);
        assert.doesNotMatch(serialised, /rationale/, `${courseId} ${id} ${kind}`);
      }
    }
  }
});

test("scoring rejects coerced non-answers rather than recording a selection nobody made", () => {
  const assessment = getColoradoAssessment(TRUST_ACCOUNTS, "module-02", "engagement");
  const valid = assessment.items.map((item) => item.correctChoice);
  assert.equal(scoreColoradoAssessment(assessment, valid).percent, 100);
  for (const bad of [null, "", false, [], undefined, {}, "1.5", " ", "abc", -1, 4, 1.5, NaN]) {
    const answers = [...valid];
    answers[0] = bad;
    assert.equal(scoreColoradoAssessment(assessment, answers), null, `accepted ${JSON.stringify(bad)}`);
  }
  assert.equal(scoreColoradoAssessment(assessment, valid.slice(1)), null);
  assert.equal(scoreColoradoAssessment(null, valid), null);
});

test("scoring is against this school's thresholds, not a regulator figure", () => {
  const engagement = getColoradoAssessment(LAW_AND_PRACTICE, "module-01", "engagement");
  assert.equal(engagement.passingPercent, 80);
  assert.equal(getColoradoAssessment(LAW_AND_PRACTICE, "module-01", "applied").passingPercent, 100);
  const answers = engagement.items.map((item, index) => (index === 0 ? (item.correctChoice + 1) % 4 : item.correctChoice));
  const result = scoreColoradoAssessment(engagement, answers);
  assert.equal(result.percent, 80);
  assert.equal(result.passed, true);
  const percentages = getColoradoCourse(LAW_AND_PRACTICE).passingPercentages;
  assert.equal(percentages.inModuleEngagement.isRegulatorFigure, false);
  assert.equal(percentages.stateExamination.isRegulatorFigure, false);
  assert.equal(percentages.stateExamination.percent, null);
});

test("unknown courses, modules and assessments return null rather than a guess", () => {
  assert.equal(getColoradoCourse("nope"), null);
  assert.equal(getColoradoModule("nope", "module-01"), null);
  assert.equal(getColoradoModule(CONTRACTS, "module-99"), null);
  assert.equal(getColoradoAssessment("nope", "module-01"), null);
  assert.equal(getColoradoAssessment(CONTRACTS, "module-99"), null);
  assert.equal(coloradoCourseCredit("nope", []), null);
  assert.equal(publicColoradoAssessment(null), null);
});

/* ---- What the sources say, and what they do not ---- */

test("the readings file records what was read and what was not", () => {
  assert.match(readings, /12-10-203/);
  assert.match(readings, /4 CCR 725-1/);
  assert.match(readings, /12355/);
  assert.match(readings, /2026-08-20/);
  assert.match(readings, /NOT obtained|not read/i);
  assert.ok(COLORADO_UNREAD_SOURCES.length >= 12);
  const joined = COLORADO_UNREAD_SOURCES.join(" | ");
  for (const source of ["COMMISSION-APPROVED FORM", "Transaction File Checklist", "CP 41", "Conway-Bogue", "12-10-217", "38-12-101", "water law", "RESPA", "Common Interest Ownership Act", "38-35.5-101"]) {
    assert.ok(joined.includes(source), `unread list does not name ${source}`);
  }
});

test("every module names what it did not read", () => {
  for (const courseId of COLORADO_COURSE_IDS) {
    for (const module of getColoradoCourse(courseId).modules) {
      assert.match(readModule(courseId, module.id), /[Nn]ot read|[Nn]ot obtained/, `${courseId} ${module.id} names no gap`);
    }
  }
});

test("no item claims Commission approval of this course", () => {
  for (const [courseId, id, item] of allItems()) {
    const text = `${item.choices[0]} ${item.rationale}`;
    assert.doesNotMatch(text, /this course is (Commission[- ])?approved/i, `${courseId} ${id}`);
    assert.doesNotMatch(text, /state[- ]approved/i, `${courseId} ${id}`);
  }
});

test("the build records that Colorado publishes its outlines where Arizona and Washington do not", () => {
  assert.match(readings, /the regulator publishes its own course outlines/i);
  assert.match(readings, /Arizona/);
  assert.match(readings, /Washington/);
});

test("no market figure is stated in the Practical Applications trends module", () => {
  const module07 = readModule(PRACTICAL_APPLICATIONS, "module-07");
  assert.match(module07, /no market figure of any kind is stated/i);
  assert.match(module07, /Schools discretion/);
  const bank = PRACTICAL_APPLICATIONS_BANK["module-07"];
  assert.equal(bank.statesNoMarketFigure, true);
});

test("no item states a period the sources read do not state", () => {
  const permitted = [
    /\b(one|1) years?\b/i, /\b(two|2) years?\b/i, /\b(three|3) years?\b/i, /\b(four|4) years?\b/i,
    /\b(five|5) years?\b/i, /\b(ten|10) years?\b/i, /\b(three|3) business days?\b/i, /\b(five|5) business days?\b/i,
    /\b(three|3) days?\b/i, /\b(five|5) days?\b/i, /\b(thirty|30) days?\b/i, /\b(sixty|60) days?\b/i,
    /\b(ninety|90) days?\b/i, /\b(twenty[- ]four|24) hours?\b/i, /\b(twenty[- ]four|24) clock hours?\b/i,
    /\b(one|1) months?\b/i, /\b(six|6) months?\b/i, /\b(twelve|12) months?\b/i, /\b(eight|8) months?\b/i,
    /\b(360|365)[- ]days?\b/i, /\b(360|365) days?\b/i, /\b(240|270|180|90|104|261|11|19) days?\b/i,
    /\b(eight|8) years?\b/i, /\b(fourteen|14) months?\b/i, /\b(two|2) months?\b/i, /\b(four|4) months?\b/i,
    /\b(one|1) weeks?\b/i, /\b(three|3) weeks?\b/i, /\b(4\.0|four) months?\b/i,
    /\b(three|3) months?\b/i,
    /* Course hour figures transcribed from Rule 2.1.A.2 and § 12-10-203(4)(a), not periods. */
    /\b(48|24|32|8|168|72|90|180) hours?\b/i, /\b(twenty[- ]four|24) clock hours?\b/i,
    /\b(sixteen|16|four|4|seven|7|ten|10|twelve|12|six|6|three|3|two|2|one|1) hours?\b/i
  ];
  /* The lookbehind stops a decimal such as "4.0 months" being read as a bare "0 months". */
  const quantified = /(?<![\d.])\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|eighteen|twenty|thirty|forty|sixty|ninety)[\s-]+(business\s+|banking\s+|calendar\s+|clock\s+)?(days?|years?|months?|weeks?|hours?)\b/gi;
  for (const [courseId, id, item] of allItems()) {
    const text = `${item.choices[0]} ${item.rationale}`;
    for (const match of text.match(quantified) ?? []) {
      const normalised = match.replace(/-/g, " ");
      assert.ok(
        permitted.some((pattern) => pattern.test(match) || pattern.test(normalised)),
        `${courseId} ${id} states a period the sources read do not: "${match}" in "${item.prompt}"`
      );
    }
  }
});

/* ---- The transcribed figures, each with its rule ---- */

test("the transcribed figures are the statute's and the rules' own", () => {
  assert.equal(COLORADO_TRANSACTION_FILE_RETENTION_YEARS, 4);
  assert.equal(COLORADO_RELATIONSHIP_BACKSTOP_YEARS, 1);
  assert.equal(COLORADO_INDEPENDENT_PRACTICE_YEARS, 2);
  assert.equal(COLORADO_BROKERAGE_ADMINISTRATION_HOURS, 24);
  assert.equal(COLORADO_OTHER_MONEY_DEPOSIT_BUSINESS_DAYS, 3);
  assert.equal(COLORADO_PROPERTY_MANAGEMENT_DEPOSIT_BUSINESS_DAYS, 5);
  assert.equal(COLORADO_DEPOSIT_STATUS_DISCLOSURE_DAYS, 30);
  assert.equal(COLORADO_DEPOSIT_TRANSFER_DAYS, 60);
  assert.equal(COLORADO_BENEFICIARY_REPORT_DAYS, 30);
  assert.equal(COLORADO_EXPIRED_LISTING_REMOVAL_DAYS, 3);
});

test("Rule 6.12's notice is quoted verbatim in the curriculum and in a bank item", () => {
  const notice = /This evaluation was prepared by a licensed real estate broker and is not an appraisal\. This evaluation cannot be used for the purposes of obtaining financing\./;
  assert.match(readModule(LAW_AND_PRACTICE, "module-02"), notice);
  const item = LAW_AND_PRACTICE_BANK["module-02"].engagement[0];
  assert.match(item.choices[0], notice);
});

test("the two ledger rules are carried into the curriculum absolutely", () => {
  const module02 = readModule(TRUST_ACCOUNTS, "module-02");
  assert.match(module02, /No ledger may ever be allowed to have a negative cash balance/i);
  assert.match(module02, /must agree AT ALL TIMES with the corresponding journal/i);
  assert.match(module02, /Journal Balance \+ Sum of Ledger Balances = Bank Balance = Transaction File Liabilities/);
});

test("Rule 6.19's closing responsibility provisions are carried into the curriculum", () => {
  const module01 = readModule(CLOSINGS, "module-01");
  assert.match(module01, /responsible for the proper closing of the transaction/i);
  assert.match(module01, /ACCURATE, COMPLETE AND DETAILED/i);
  assert.match(module01, /SIGNED BY THE BROKER/i);
  assert.match(module01, /must not disburse or authorize disbursement/i);
});

test("Rule 6.10's advertising provisions are carried into the curriculum", () => {
  const module02 = readModule(PRACTICAL_APPLICATIONS, "module-02");
  assert.match(module02, /Realty/);
  assert.match(module02, /independently owned and operated/i);
  assert.match(module02, /EACH VIEWABLE PAGE/i);
  assert.match(module02, /first click of the mouse/i);
  assert.match(module02, /three \(3\) days|THREE DAYS|three days/i);
});

/* ---- Regulator requirements and StateCourse decisions stay separate ---- */

test("regulator requirements cite a statute or rule and decisions do not read as rules", () => {
  for (const courseId of COLORADO_COURSE_IDS) {
    const course = getColoradoCourse(courseId);
    assert.ok(course.regulatorRequirements.length >= 20, courseId);
    assert.ok(course.stateCourseDecisions.length >= 5, courseId);
    for (const line of course.regulatorRequirements) {
      assert.match(line, /C\.R\.S\.|4 CCR 725-1|§ 12-10-/, `${courseId} regulator line cites nothing: ${line}`);
    }
    for (const line of course.stateCourseDecisions) {
      assert.doesNotMatch(line, /^C\.R\.S\.|^4 CCR 725-1/, `${courseId} decision line reads as a rule: ${line}`);
    }
  }
});

test("the Current Legal Issues hour division is recorded as this school's decision", () => {
  const decisions = getColoradoCourse(CURRENT_LEGAL_ISSUES).stateCourseDecisions.join(" | ");
  assert.match(decisions, /3\.0 \/ 3\.0 \/ 2\.0/);
  assert.match(decisions, /StateCourse decision/i);
  assert.match(decisions, /8\.0 hours for Current Legal Issues/);
});

test("delivering four practical exercises where the outline requires two is recorded as a decision", () => {
  const decisions = getColoradoCourse(TRUST_ACCOUNTS).stateCourseDecisions.join(" | ");
  assert.match(decisions, /FOUR practical exercises/i);
  assert.match(decisions, /minimum of two/i);
});
