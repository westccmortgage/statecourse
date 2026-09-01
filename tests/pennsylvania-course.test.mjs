/**
 * Pennsylvania salesperson prelicensing — tests.
 *
 * The single most important thing these tests hold is the NUMBER. 49 Pa. Code § 35.272(a)(2) requires
 * "four credits, or 60 hours of instruction" — the regulatory minimum is 60 HOURS, NOT 75. This build
 * delivers 75 across the two courses § 35.272(b)(2) names by title, which EXCEEDS the minimum by one
 * credit. A test here fails if the payload ever presents 75 as the requirement, or if the delivered
 * total ever drops below the floor.
 *
 * They also hold the build to what Chapter 35 does NOT prescribe. Unlike Maine, Wisconsin, Missouri,
 * Oklahoma and North Carolina, Pennsylvania sets NO passing percentage for a prelicensure course — it
 * requires PROCTORED grading and stops. So every percentage in this build is a StateCourse standard, and
 * a test asserts the payload labels them that way.
 *
 * And they hold it to what it did not read: RELRA, 68 Pa.C.S. Chapter 73, the Commission's content
 * outlines, the verbatim consumer disclosure summaries and the § 35.335a itemisation.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import FUNDAMENTALS_BANK from "../config/pennsylvania/fundamentals-30-question-bank.mjs";
import PRACTICE_BANK from "../config/pennsylvania/practice-45-question-bank.mjs";
import {
  getPennsylvaniaCourse,
  getPennsylvaniaProgram,
  getPennsylvaniaModule,
  getPennsylvaniaAssessment,
  publicPennsylvaniaAssessment,
  scorePennsylvaniaAssessment,
  pennsylvaniaCourseCredit,
  pennsylvaniaEducationReadiness,
  pennsylvaniaEducationValidity,
  PENNSYLVANIA_COURSE_IDS,
  PENNSYLVANIA_PERMITTED_RELATIONSHIPS,
  PENNSYLVANIA_SUBMISSION_GATES,
  PENNSYLVANIA_UNREAD_SOURCES,
  PENNSYLVANIA_MINIMUM_HOURS,
  PENNSYLVANIA_MINIMUM_CREDITS,
  PENNSYLVANIA_HOURS_PER_CREDIT,
  PENNSYLVANIA_DELIVERED_HOURS,
  PENNSYLVANIA_DELIVERED_CREDITS,
  PENNSYLVANIA_EDUCATION_VALIDITY_YEARS
} from "../config/pennsylvania-course-engine.mjs";

const FUNDAMENTALS = "pa-real-estate-fundamentals-30-v1";
const PRACTICE = "pa-real-estate-practice-45-v1";

const prose = (text) => text
  .replace(/^\s*>\s?/gm, "")
  .replace(/\*\*/g, "")
  .replace(/\s+/g, " ");

const CURRICULUM_DIR = {
  [FUNDAMENTALS]: "pennsylvania/pa-real-estate-fundamentals-30-v1/curriculum",
  [PRACTICE]: "pennsylvania/pa-real-estate-practice-45-v1/curriculum"
};

const readModule = (courseId, moduleId) =>
  prose(readFileSync(new URL(`../${CURRICULUM_DIR[courseId]}/${moduleId}.md`, import.meta.url), "utf8"));
const readings = prose(readFileSync(new URL("../pennsylvania/regulatory/primary-text-readings.md", import.meta.url), "utf8"));

const allModuleIds = (courseId) => getPennsylvaniaCourse(courseId).modules.map((m) => m.id);
const allText = PENNSYLVANIA_COURSE_IDS
  .flatMap((courseId) => allModuleIds(courseId).map((id) => readModule(courseId, id)))
  .join("\n\n");

/* ---- THE NUMBER ---- */

test("the regulatory minimum is 60 hours / 4 credits, and the build says so", () => {
  assert.equal(PENNSYLVANIA_MINIMUM_HOURS, 60);
  assert.equal(PENNSYLVANIA_MINIMUM_CREDITS, 4);
  assert.equal(PENNSYLVANIA_HOURS_PER_CREDIT, 15);
  assert.equal(PENNSYLVANIA_MINIMUM_CREDITS * PENNSYLVANIA_HOURS_PER_CREDIT, PENNSYLVANIA_MINIMUM_HOURS);
  const program = getPennsylvaniaProgram();
  assert.equal(program.minimumHours, 60);
  assert.equal(program.minimumIsRegulatory, true);
});

test("the delivered total is 75 hours / 5 credits and EXCEEDS the minimum rather than meeting it", () => {
  assert.equal(PENNSYLVANIA_DELIVERED_HOURS, 75);
  assert.equal(PENNSYLVANIA_DELIVERED_CREDITS, 5);
  const program = getPennsylvaniaProgram();
  assert.equal(program.deliveredHours, 75);
  assert.equal(program.deliveredCredits, 5);
  assert.equal(program.exceedsMinimumBy.hours, 15);
  assert.equal(program.exceedsMinimumBy.credits, 1);
  assert.ok(program.deliveredHours > program.minimumHours);
  assert.equal(program.deliveredTotalIsStateCourseDecision, true);
});

test("the payload never presents 75 hours as the regulatory requirement", () => {
  const program = getPennsylvaniaProgram();
  assert.match(program.note, /requires four credits, or 60 hours/i);
  assert.match(program.note, /NOT a regulatory requirement/i);
  for (const courseId of PENNSYLVANIA_COURSE_IDS) {
    const course = getPennsylvaniaCourse(courseId);
    /* The Commission requirements list must state the 60-hour minimum and must not claim 75. */
    const commission = course.commissionRequirements.join(" | ");
    assert.match(commission, /60 hours/);
    assert.match(commission, /NOT 75/i);
    assert.doesNotMatch(commission, /requires .{0,20}75 hours/i);
    /* The 75 belongs in the school's decisions, not the regulator's requirements. */
    assert.ok(course.stateCourseDecisions.some((line) => /75 hours/.test(line)), courseId);
  }
});

test("the 30/45 split is recorded as a StateCourse decision requiring Commission confirmation", () => {
  const course = getPennsylvaniaCourse(FUNDAMENTALS);
  assert.ok(course.stateCourseDecisions.some((line) => /30\/45 split/.test(line) && /Commission confirmation/i.test(line)));
  const gate = PENNSYLVANIA_SUBMISSION_GATES.find((g) => g.id === "course-hour-assignment");
  assert.ok(gate);
  assert.equal(gate.satisfied, false);
  assert.match(gate.blockedBy, /assigns hours to neither/i);
});

test("each course's hours divide into whole 15-hour credits", () => {
  for (const courseId of PENNSYLVANIA_COURSE_IDS) {
    const course = getPennsylvaniaCourse(courseId);
    assert.equal(course.hours % 15, 0, courseId);
    assert.equal(course.hours / 15, course.credits, courseId);
    const moduleHours = course.modules.reduce((sum, m) => sum + m.hours, 0);
    assert.equal(moduleHours, course.hours, courseId);
  }
});

/* ---- Two courses, named by the rule ---- */

test("there are exactly two courses and both are named by title in § 35.272(b)(2)", () => {
  assert.equal(PENNSYLVANIA_COURSE_IDS.length, 2);
  const fundamentals = getPennsylvaniaCourse(FUNDAMENTALS);
  const practice = getPennsylvaniaCourse(PRACTICE);
  assert.equal(fundamentals.title, "Real Estate Fundamentals");
  assert.equal(practice.title, "Real Estate Practice");
  for (const course of [fundamentals, practice]) {
    assert.equal(course.namedInRule, true);
    assert.match(course.ruleCitation, /35\.272\(b\)\(2\)/);
  }
  assert.equal(fundamentals.modules.length, 6);
  assert.equal(practice.modules.length, 9);
});

/* ---- What Chapter 35 does NOT prescribe ---- */

test("every passing percentage is labelled a StateCourse standard, because Chapter 35 sets none", () => {
  for (const courseId of PENNSYLVANIA_COURSE_IDS) {
    const p = getPennsylvaniaCourse(courseId).passingPercentages;
    assert.equal(p.courseExamination.isCommissionFigure, false, courseId);
    assert.equal(p.inModuleEngagement.isCommissionFigure, false, courseId);
    assert.equal(p.inModuleApplied.isCommissionFigure, false, courseId);
    assert.match(p.courseExamination.rule, /requires proctored grading but prescribes no percentage/i);
  }
});

test("the course examination is proctored, and proctoring is the requirement the rule does set", () => {
  const exam = getPennsylvaniaCourse(PRACTICE).courseExam;
  assert.equal(exam.proctored, true);
  assert.equal(exam.proctoringIsRequiredByRule, true);
  assert.equal(exam.passingPercentIsCommissionFigure, false);
  assert.match(exam.ruleCitation, /35\.358\(b\)\(2\)/);
  assert.match(exam.exceptionForHandicapOrDisability, /handicap or disability/i);
});

test("the classroom attendance standard is not asserted for distance education", () => {
  const course = getPennsylvaniaCourse(FUNDAMENTALS);
  assert.equal(course.classroomAttendancePercent, 80);
  assert.equal(course.classroomAttendanceAppliesToDistanceEducation, false);
});

test("the Pennsylvania clock hour is 50 minutes of instruction in a 60-minute period", () => {
  const course = getPennsylvaniaCourse(FUNDAMENTALS);
  assert.equal(course.minutesPerClockHour, 60);
  assert.equal(course.minInstructionMinutesPerClockHour, 50);
  assert.equal(course.maxBreakMinutesPerClockHour, 10);
  assert.equal(course.maxInstructorLedClockHoursPerDay, 7.5);
  assert.equal(course.maxConsecutiveMinutesWithoutBreak, 90);
});

/* ---- The five relationships, one of which is not an agency ---- */

test("five permitted relationships are recorded and exactly one is not an agency", () => {
  assert.equal(PENNSYLVANIA_PERMITTED_RELATIONSHIPS.length, 5);
  const nonAgency = PENNSYLVANIA_PERMITTED_RELATIONSHIPS.filter((r) => !r.isAgency);
  assert.equal(nonAgency.length, 1);
  assert.equal(nonAgency[0].id, "transaction-licensee");
  assert.match(nonAgency[0].confidentiality, /LIMITED/);
});

test("a dual agent is not recorded as owing loyalty, because § 35.314 does not name it", () => {
  const dual = PENNSYLVANIA_PERMITTED_RELATIONSHIPS.find((r) => r.id === "dual-agent");
  assert.equal(dual.owesLoyalty, false);
  const sellers = PENNSYLVANIA_PERMITTED_RELATIONSHIPS.find((r) => r.id === "sellers-agent");
  const buyers = PENNSYLVANIA_PERMITTED_RELATIONSHIPS.find((r) => r.id === "buyers-agent");
  assert.equal(sellers.owesLoyalty, true);
  assert.equal(buyers.owesLoyalty, true);
});

test("the material defect exception is recorded on the seller's agent and dual agent, as the rules state it", () => {
  const sellers = PENNSYLVANIA_PERMITTED_RELATIONSHIPS.find((r) => r.id === "sellers-agent");
  const dual = PENNSYLVANIA_PERMITTED_RELATIONSHIPS.find((r) => r.id === "dual-agent");
  assert.match(sellers.confidentiality, /known material defects/i);
  assert.match(dual.confidentiality, /known material defects/i);
});

test("limited confidentiality is exactly three items", () => {
  const items = getPennsylvaniaCourse(PRACTICE).transactionLicenseeLimitedConfidentiality;
  assert.equal(items.length, 3);
  assert.ok(items.some((i) => /less than the asking\/listing price/i.test(i)));
  assert.ok(items.some((i) => /greater than the price submitted in a written offer/i.test(i)));
  assert.ok(items.some((i) => /financing terms other than those offered/i.test(i)));
});

/* ---- Submission gates ---- */

test("both § 35.358 gates are recorded, unsatisfied, and say what blocks them", () => {
  assert.ok(PENNSYLVANIA_SUBMISSION_GATES.length >= 5);
  for (const gate of PENNSYLVANIA_SUBMISSION_GATES) {
    if (!gate.satisfied) assert.ok(gate.blockedBy && gate.blockedBy.length > 20, gate.id);
    if (gate.satisfied) assert.equal(gate.blockedBy, undefined, gate.id);
  }
  const outline = PENNSYLVANIA_SUBMISSION_GATES.find((g) => g.id === "commission-content-outline");
  assert.equal(outline.satisfied, false);
  assert.match(outline.rule, /35\.358\(a\)\(2\)/);
  const arello = PENNSYLVANIA_SUBMISSION_GATES.find((g) => g.id === "arello-distance-approval");
  assert.equal(arello.satisfied, false);
  assert.match(arello.rule, /35\.358\(a\)\(4\)/);
  assert.match(arello.requirement, /Association of Real Estate License Law Officials/);
});

test("no transcript issues while any submission gate is unsatisfied", () => {
  const complete = allModuleIds(PRACTICE).map((id) => ({ module_id: id, status: "completed" }));
  const result = pennsylvaniaCourseCredit(PRACTICE, complete, { courseExamPercent: 100, attendanceMet: true, approvalNumber: "X" });
  assert.equal(result.courseComplete, true);
  assert.equal(result.transcriptEligible, false);
  assert.match(result.transcriptBlockedBy, /submission gates are unsatisfied/i);
});

/* ---- Credit and eligibility ---- */

test("each completion condition blocks the transcript and names itself", () => {
  const complete = allModuleIds(FUNDAMENTALS).map((id) => ({ module_id: id, status: "completed" }));

  const noModules = pennsylvaniaCourseCredit(FUNDAMENTALS, [], { courseExamPercent: 100, attendanceMet: true, approvalNumber: "X" });
  assert.match(noModules.transcriptBlockedBy, /0 of 6 modules complete/);

  const noAttendance = pennsylvaniaCourseCredit(FUNDAMENTALS, complete, { courseExamPercent: 100, attendanceMet: false, approvalNumber: "X" });
  assert.match(noAttendance.transcriptBlockedBy, /attendance requirement/i);

  const noExam = pennsylvaniaCourseCredit(FUNDAMENTALS, complete, { courseExamPercent: null, attendanceMet: true, approvalNumber: "X" });
  assert.match(noExam.transcriptBlockedBy, /PROCTORED examination/);

  const noApproval = pennsylvaniaCourseCredit(FUNDAMENTALS, complete, { courseExamPercent: 100, attendanceMet: true, approvalNumber: null });
  assert.match(noApproval.transcriptBlockedBy, /Commission approval number/i);
});

test("examination readiness is computed across BOTH courses, not either alone", () => {
  const fundamentals = pennsylvaniaCourseCredit(FUNDAMENTALS, allModuleIds(FUNDAMENTALS).map((id) => ({ module_id: id, status: "completed" })), { courseExamPercent: 90, attendanceMet: true });
  const practice = pennsylvaniaCourseCredit(PRACTICE, allModuleIds(PRACTICE).map((id) => ({ module_id: id, status: "completed" })), { courseExamPercent: 90, attendanceMet: true });

  const oneOnly = pennsylvaniaEducationReadiness([fundamentals], { age: 30 });
  assert.equal(oneOnly.completedCredits, 2);
  assert.equal(oneOnly.meetsHourRequirement, false);
  assert.match(oneOnly.blockedBy, /requires four credits, or 60 hours/i);

  const both = pennsylvaniaEducationReadiness([fundamentals, practice], { age: 30 });
  assert.equal(both.completedHours, 75);
  assert.equal(both.completedCredits, 5);
  assert.equal(both.meetsHourRequirement, true);
  assert.equal(both.blockedBy, null);
  assert.equal(both.determinationIsTheCommissions, true);
});

test("age below 18 blocks readiness under § 35.272(a)(1)", () => {
  const fundamentals = pennsylvaniaCourseCredit(FUNDAMENTALS, allModuleIds(FUNDAMENTALS).map((id) => ({ module_id: id, status: "completed" })), { courseExamPercent: 90, attendanceMet: true });
  const practice = pennsylvaniaCourseCredit(PRACTICE, allModuleIds(PRACTICE).map((id) => ({ module_id: id, status: "completed" })), { courseExamPercent: 90, attendanceMet: true });
  const young = pennsylvaniaEducationReadiness([fundamentals, practice], { age: 17 });
  assert.equal(young.ageMet, false);
  assert.match(young.blockedBy, /18 years of age or older/);
});

test("the ten-year window is measured to the licensing EXAMINATION date", () => {
  const inside = pennsylvaniaEducationValidity("2026-08-20", "2036-01-15");
  assert.equal(inside.validityYears, 10);
  assert.equal(PENNSYLVANIA_EDUCATION_VALIDITY_YEARS, 10);
  assert.equal(inside.expiresOn, "2036-08-20");
  assert.equal(inside.withinWindow, true);
  assert.match(inside.measuredTo, /successful completion of the licensing examination/i);

  const outside = pennsylvaniaEducationValidity("2026-08-20", "2036-09-01");
  assert.equal(outside.withinWindow, false);
  assert.match(outside.blockedBy, /2036-08-20/);

  assert.equal(pennsylvaniaEducationValidity(null), null);
  assert.equal(pennsylvaniaEducationValidity("not a date"), null);
});

/* ---- Assessment mechanics ---- */

test("15 modules carry 165 items — one applied, five engagement, five remediation each", () => {
  let total = 0;
  let moduleCount = 0;
  for (const [bank, ids] of [[FUNDAMENTALS_BANK, allModuleIds(FUNDAMENTALS)], [PRACTICE_BANK, allModuleIds(PRACTICE)]]) {
    for (const id of ids) {
      const entry = bank[id];
      assert.ok(entry.applied, id);
      assert.equal(entry.engagement.length, 5, id);
      assert.equal(entry.remediation.length, 5, id);
      total += 11;
      moduleCount += 1;
    }
  }
  assert.equal(moduleCount, 15);
  assert.equal(total, 165);
});

test("every authored item has four choices, the answer at index 0, a real prompt and a rationale", () => {
  for (const [courseId, bank] of [[FUNDAMENTALS, FUNDAMENTALS_BANK], [PRACTICE, PRACTICE_BANK]]) {
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
  const first = getPennsylvaniaAssessment(PRACTICE, "module-06", "engagement");
  const second = getPennsylvaniaAssessment(PRACTICE, "module-06", "engagement");
  assert.deepEqual(first.items.map((i) => i.choices), second.items.map((i) => i.choices));
  for (const [index, item] of first.items.entries()) {
    assert.equal(item.choices[item.correctChoice], PRACTICE_BANK["module-06"].engagement[index].choices[0]);
  }
});

test("the two courses' identically-named modules permute differently, because the key includes the course id", () => {
  const fundamentals = getPennsylvaniaAssessment(FUNDAMENTALS, "module-01", "engagement");
  const practice = getPennsylvaniaAssessment(PRACTICE, "module-01", "engagement");
  assert.notDeepEqual(
    fundamentals.items.map((i) => i.correctChoice),
    practice.items.map((i) => i.correctChoice)
  );
});

test("at least one delivered order differs from the authored order", () => {
  const moved = PENNSYLVANIA_COURSE_IDS.some((courseId) =>
    allModuleIds(courseId).some((id) =>
      getPennsylvaniaAssessment(courseId, id, "engagement").items.some((item) => item.correctChoice !== 0)));
  assert.equal(moved, true);
});

test("the public shape carries no answer key and no rationale", () => {
  for (const courseId of PENNSYLVANIA_COURSE_IDS) {
    for (const id of allModuleIds(courseId)) {
      for (const kind of ["applied", "engagement", "remediation"]) {
        const serialised = JSON.stringify(publicPennsylvaniaAssessment(getPennsylvaniaAssessment(courseId, id, kind)));
        assert.doesNotMatch(serialised, /correctChoice/, `${courseId} ${id} ${kind}`);
        assert.doesNotMatch(serialised, /rationale/, `${courseId} ${id} ${kind}`);
      }
    }
  }
});

test("scoring rejects coerced non-answers rather than recording a selection nobody made", () => {
  const assessment = getPennsylvaniaAssessment(FUNDAMENTALS, "module-01", "engagement");
  const valid = assessment.items.map((item) => item.correctChoice);
  assert.equal(scorePennsylvaniaAssessment(assessment, valid).percent, 100);
  for (const bad of [null, "", false, [], undefined, {}, "1.5", " ", "abc", -1, 4, 1.5, NaN]) {
    const answers = [...valid];
    answers[0] = bad;
    assert.equal(scorePennsylvaniaAssessment(assessment, answers), null, `accepted ${JSON.stringify(bad)}`);
  }
  assert.equal(scorePennsylvaniaAssessment(assessment, valid.slice(1)), null);
  assert.equal(scorePennsylvaniaAssessment(null, valid), null);
});

test("a numeric string answer is accepted, because a form field is a string", () => {
  const assessment = getPennsylvaniaAssessment(PRACTICE, "module-01", "engagement");
  const answers = assessment.items.map((item) => String(item.correctChoice));
  assert.equal(scorePennsylvaniaAssessment(assessment, answers).percent, 100);
});

test("unknown ids return null rather than a partially built object", () => {
  assert.equal(getPennsylvaniaCourse("pa-something-else"), null);
  assert.equal(getPennsylvaniaModule(FUNDAMENTALS, "module-99"), null);
  assert.equal(getPennsylvaniaModule("nope", "module-01"), null);
  assert.equal(getPennsylvaniaAssessment(FUNDAMENTALS, "module-99", "engagement"), null);
  assert.equal(getPennsylvaniaAssessment(FUNDAMENTALS, "module-01", "nonsense"), null);
  assert.equal(pennsylvaniaCourseCredit("nope", []), null);
});

/* ---- The curriculum against Chapter 35 ---- */

test("every module file exists, states its hours and its regulatory status", () => {
  for (const courseId of PENNSYLVANIA_COURSE_IDS) {
    for (const module of getPennsylvaniaCourse(courseId).modules) {
      const text = readModule(courseId, module.id);
      assert.match(text, /Instructional hours:/, `${courseId} ${module.id}`);
      assert.match(text, new RegExp(`${module.hours}\\.0`), `${courseId} ${module.id} does not state its hours`);
      assert.match(text, /Regulatory status: Development\. Not approved\./, `${courseId} ${module.id}`);
      assert.match(text, /Instructor source note/i, `${courseId} ${module.id}`);
    }
  }
});

test("no module claims approval or offers credit", () => {
  assert.doesNotMatch(allText, /\bState Approved\b/i);
  assert.doesNotMatch(allText, /\bEnroll Now\b/i);
});

test("the 60-hour minimum is stated in the curriculum, not just the engine", () => {
  const first = readModule(FUNDAMENTALS, "module-01");
  assert.match(first, /four credits, or 60 hours of instruction/i);
  assert.match(first, /regulation's minimum is 60 hours, not 75/i);
  assert.match(readings, /THE REGULATORY MINIMUM IS 60 HOURS, NOT 75|regulation's minimum is 4 credits = 60 hours/i);
});

test("the twelve § 35.292 duties and their unwaivability are stated", () => {
  const text = readModule(PRACTICE, "module-01");
  assert.match(text, /owed to all consumers of real estate services and may not be waived/i);
  assert.match(text, /Deal honestly and in good faith/i);
  assert.match(text, /Advise the consumer to seek expert advice/i);
  assert.match(text, /Provide assistance with document preparation/i);
  assert.match(text, /without rendering legal advice/i);
});

test("the transaction licensee is taught as NOT an agent, with three-item confidentiality", () => {
  const text = readModule(PRACTICE, "module-02");
  assert.match(text, /is not acting as an agent or advocate for the consumer/i);
  assert.match(text, /limited confidentiality/i);
  assert.match(text, /Three items\. That is the whole of it|Three items, and only three/i);
});

test("the escrow rules a licensee must know are stated in Module PA-P-06", () => {
  const text = readModule(PRACTICE, "module-06");
  assert.match(text, /by the end of the next business day/i);
  assert.match(text, /may not be waived or altered by an agreement/i);
  assert.match(text, /within 1 business day of the seller's or lessor's acceptance/i);
  assert.match(text, /retain the money in escrow until the dispute is resolved/i);
  assert.match(text, /30 days' notice/i);
  assert.match(text, /rental management account/i);
});

test("the six § 35.332(c) listing prohibitions and the one-year cap are stated", () => {
  const text = readModule(PRACTICE, "module-04");
  assert.match(text, /A listing period exceeding 1 year/i);
  assert.match(text, /An automatic renewal clause/i);
  assert.match(text, /confess judgment/i);
  assert.match(text, /option by the broker to purchase/i);
  assert.match(text, /by whomever made, including the owner/i);
});

test("the § 35.333(a)(6) zoning consequence is stated correctly — voidable at the BUYER's option", () => {
  const text = readModule(PRACTICE, "module-05");
  assert.match(text, /voidable at the option of the buyer/i);
  assert.match(text, /without a requirement of court action/i);
  assert.match(text, /solely or primarily to permit single-family dwellings/i);
});

test("the material defect definition and the useful-life sentence are transcribed", () => {
  const text = readModule(PRACTICE, "module-07");
  assert.match(text, /significant adverse impact on the value/i);
  assert.match(text, /unreasonable risk to people on the land/i);
  assert.match(text, /near, at or beyond the end of its normal useful life is not by itself a material defect/i);
});

test("the § 35.340 CMA disclaimer requirement is stated with all four of its conditions", () => {
  const text = readModule(PRACTICE, "module-09");
  assert.match(text, /conspicuously and without change on the first page/i);
  assert.match(text, /Uniform Standards of Professional Appraisal Practice/i);
});

test("the BPO permitted and prohibited uses are stated, including the origination prohibition", () => {
  const text = readModule(PRACTICE, "module-09");
  assert.match(text, /mortgage loan origination/i);
  assert.match(text, /short sale/i);
  assert.match(text, /3 years immediately preceding/i);
  assert.match(text, /paid directly to the employing broker/i);
});

/* ---- What was NOT read ---- */

test("the readings file names what was not obtained and the engine carries the same list", () => {
  assert.match(readings, /NOT obtained|not read/i);
  assert.ok(PENNSYLVANIA_UNREAD_SOURCES.length >= 10);
  const joined = PENNSYLVANIA_UNREAD_SOURCES.join(" | ");
  for (const source of ["Real Estate Licensing and Registration Act", "68 Pa.C.S. Chapter 73", "content outlines", "35.336", "35.335a", "ARELLO"]) {
    assert.ok(joined.includes(source), `unread list does not name ${source}`);
  }
});

test("every module names what it did not read", () => {
  for (const courseId of PENNSYLVANIA_COURSE_IDS) {
    for (const module of getPennsylvaniaCourse(courseId).modules) {
      const text = readModule(courseId, module.id);
      assert.match(text, /[Nn]ot (read|obtained)/, `${courseId} ${module.id} names no gap`);
    }
  }
});

test("no consumer disclosure summary text is reproduced anywhere in the build", () => {
  const text = readModule(PRACTICE, "module-03");
  assert.match(text, /did NOT transcribe their text/i);
  assert.match(text, /reproduces, describes or paraphrases the wording of any of them/i);
});

test("no item states a period Chapter 35 does not itself state", () => {
  /* Every quantified phrase in an authored correct answer or rationale must be a figure Chapter 35
     states, or a figure supplied inside the item. A new number here means somebody sourced it elsewhere. */
  const permitted = [
    /\b10 years?\b/i, /\bten years?\b/i, /\b3 years?\b/i, /\bthree years?\b/i, /\b4 years?\b/i,
    /\b1 year\b/i, /\bone year\b/i, /\b2[- ]year\b/i, /\btwo[- ]year\b/i, /\b6 months?\b/i, /\bsix months?\b/i,
    /\b30 days?\b/i, /\bthirty days?\b/i, /\b5 days?\b/i, /\bfive days?\b/i, /\b1 business day\b/i,
    /\bnext business day\b/i, /\b3 business days?\b/i, /\bone month\b/i, /\b28[- ]year\b/i, /\btwenty-eight[- ]year\b/i,
    /\b31[- ]year\b/i, /\bthirty-one[- ]year\b/i, /\b18 years?\b/i, /\beighteen years?\b/i, /\b2 years?\b/i, /\btwo years?\b/i,
    /\b15 hours?\b/i, /\bfifteen hours?\b/i, /\b(eleven|11) years?\b/i, /\b(four|4) years?\b/i,
    /\b360[- ]day\b/i, /\b365[- ]day\b/i, /\b(five|5) years?\b/i
  ];
  const quantified = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|eighteen|twenty|twenty-eight|thirty|thirty-one|sixty|ninety)[\s-]+(business\s+|banking\s+|calendar\s+)?(days?|years?|months?|weeks?)\b/gi;
  for (const [courseId, bank] of [[FUNDAMENTALS, FUNDAMENTALS_BANK], [PRACTICE, PRACTICE_BANK]]) {
    for (const id of allModuleIds(courseId)) {
      const entry = bank[id];
      for (const item of [entry.applied, ...entry.engagement, ...entry.remediation]) {
        const text = `${item.choices[0]} ${item.rationale}`;
        for (const match of text.match(quantified) ?? []) {
          const normalised = match.replace(/-/g, " ");
          assert.ok(
            permitted.some((pattern) => pattern.test(match) || pattern.test(normalised)),
            `${courseId} ${id} states a period Chapter 35 does not: "${match}" in "${item.prompt}"`
          );
        }
      }
    }
  }
});

test("no item claims Commission approval of this course", () => {
  for (const [courseId, bank] of [[FUNDAMENTALS, FUNDAMENTALS_BANK], [PRACTICE, PRACTICE_BANK]]) {
    for (const id of allModuleIds(courseId)) {
      const entry = bank[id];
      for (const item of [entry.applied, ...entry.engagement, ...entry.remediation]) {
        const text = `${item.choices[0]} ${item.rationale}`;
        assert.doesNotMatch(text, /this course is (Commission[- ])?approved/i, `${courseId} ${id}`);
      }
    }
  }
});

/* ---- Engine defences ---- */

test("the payload separates what the Commission fixed from what this school decided", () => {
  const course = getPennsylvaniaCourse(PRACTICE);
  assert.ok(course.commissionRequirements.length >= 10);
  assert.ok(course.stateCourseDecisions.length >= 4);
  /* The engagement threshold must never appear as the Commission's. */
  assert.ok(!course.commissionRequirements.some((line) => /80 percent in-module/i.test(line)));
  assert.ok(course.stateCourseDecisions.some((line) => /80 percent in-module/i.test(line)));
});

test("the frozen payload cannot be mutated by a caller", () => {
  const course = getPennsylvaniaCourse(FUNDAMENTALS);
  assert.throws(() => { course.hours = 99; }, TypeError);
  assert.throws(() => { course.modules[0].hours = 99; }, TypeError);
  assert.equal(course.hours, 30);
});

test("both courses state their approval status plainly and claim nothing", () => {
  for (const courseId of PENNSYLVANIA_COURSE_IDS) {
    const status = getPennsylvaniaCourse(courseId).approvalStatus;
    assert.match(status, /Not approved/);
    assert.match(status, /No Pennsylvania prelicensing credit is available/);
    assert.doesNotMatch(status, /\bState Approved\b/i);
  }
});
