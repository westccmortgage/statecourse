import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import MODULE_BANK from "../config/oklahoma/module-question-bank.mjs";
import {
  OKLAHOMA_AREAS_OF_STUDY,
  OKLAHOMA_COURSE_FINAL_PASSING_PERCENT,
  OKLAHOMA_COURSE_ID,
  OKLAHOMA_MODULE_IDS,
  OKLAHOMA_REQUIRED_CLOCK_HOURS,
  OKLAHOMA_STATE_EXAM_PASSING_PERCENT,
  getOklahomaAssessment,
  getOklahomaCourse,
  getOklahomaModule,
  oklahomaCreditedClockHours,
  oklahomaEducationValidity,
  publicOklahomaAssessment,
  scoreOklahomaAssessment
} from "../config/oklahoma-course-engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const course = getOklahomaCourse();
const allComplete = OKLAHOMA_MODULE_IDS.map((id) => ({ module_id: id, status: "completed" }));
const kinds = ["applied", "engagement", "remediation"];

/* Curriculum and readings prose is markdown: it line-wraps, carries blockquote markers, and uses
   ** for emphasis — all of which can fall in the middle of a quoted statutory phrase. Normalise
   before matching, or a test fails on typography rather than on content. */
const prose = (text) => text
  .replace(/^\s*>\s?/gm, "")
  .replace(/\*\*/g, "")
  .replace(/\s+/g, " ");

test("the course is the ninety clock hours 605:10-3-1(a)(1) requires", () => {
  assert.equal(course.clockHours, 90);
  assert.equal(OKLAHOMA_REQUIRED_CLOCK_HOURS, 90);
  assert.equal(course.modules.reduce((sum, m) => sum + m.hours, 0), 90);
  assert.equal(getOklahomaCourse("ok-advanced-90-v1"), null);
  assert.equal(getOklahomaCourse(OKLAHOMA_COURSE_ID).courseId, OKLAHOMA_COURSE_ID);
});

test("an Oklahoma clock hour is 60 minutes with at most 10 of break", () => {
  /* 605:10-5-1(i)(5). Missouri's structure, not Maine's or Wisconsin's sixty minutes of instruction. */
  assert.equal(course.minutesPerClockHour, 60);
  assert.equal(course.maxBreakMinutesPerClockHour, 10);
  assert.equal(course.minInstructionMinutesPerClockHour, 50);
  for (const module of course.modules) {
    assert.equal(module.minInstructionMinutes, module.hours * 50, `${module.id}: instruction minutes`);
    assert.equal(module.clockMinutes, module.hours * 60, `${module.id}: clock minutes`);
  }
});

test("the hours run 1 through 90 exactly once each", () => {
  const claimed = [];
  for (const module of course.modules) {
    assert.equal(module.lastHour, module.firstHour + module.hours - 1, `${module.id}: lastHour`);
    for (let hour = module.firstHour; hour <= module.lastHour; hour += 1) claimed.push(hour);
  }
  claimed.sort((a, b) => a - b);
  assert.deepEqual(claimed, Array.from({ length: 90 }, (_, i) => i + 1));
});

test("all twenty-two areas of study are transcribed and every one is carried by a module", () => {
  assert.equal(OKLAHOMA_AREAS_OF_STUDY.length, 22);
  assert.deepEqual(OKLAHOMA_AREAS_OF_STUDY.map((a) => a.code), "ABCDEFGHIJKLMNOPQRSTUV".split(""));
  const covered = new Set(course.modules.flatMap((m) => m.areas));
  assert.equal(covered.size, 22, "an area of study is carried by no module");
  const known = new Set(OKLAHOMA_AREAS_OF_STUDY.map((a) => a.code));
  assert.deepEqual([...covered].filter((c) => !known.has(c)), [], "a module claims an area the rule does not list");
  /* And the rule's own words, spot-checked against the transcription. */
  assert.equal(OKLAHOMA_AREAS_OF_STUDY.find((a) => a.code === "V").area, "Law of Agency");
  assert.equal(OKLAHOMA_AREAS_OF_STUDY.find((a) => a.code === "E").area, "Title Search, Encumbrances, and Land Use Control");
});

test("the bank's area tags agree with the module table", () => {
  for (const module of course.modules) {
    assert.deepEqual(MODULE_BANK[module.id].commissionTopics, module.areas,
      `${module.id}: bank tags and module table disagree`);
  }
});

test("the three regulator percentages stay distinct, and the engagement threshold is not one of them", () => {
  /* Oklahoma's most dangerous confusion: 75 is the course final, 70 is the state examination, 80 is
     an instructor applicant. A document naming one without its examination misstates the regulator. */
  const p = course.passingPercentages;
  assert.equal(p.courseFinalExamination.percent, 75);
  assert.equal(p.courseFinalExamination.rule, "605:10-5-3(f)");
  assert.equal(p.courseFinalExamination.isCommissionFigure, true);

  assert.equal(p.stateLicensingExamination.percent, 70);
  assert.equal(p.stateLicensingExamination.rule, "605:10-3-5(f)");
  assert.equal(p.stateLicensingExamination.isCommissionFigure, true);

  assert.equal(p.instructorQualifyingExamination.percent, 80);
  assert.equal(p.instructorQualifyingExamination.rule, "605:10-5-1(f)");

  assert.equal(p.inModuleEngagement.percent, 80);
  assert.equal(p.inModuleEngagement.rule, null);
  assert.equal(p.inModuleEngagement.isCommissionFigure, false,
    "the in-module engagement threshold is a StateCourse standard and must not be attributed to the Commission");

  assert.notEqual(OKLAHOMA_COURSE_FINAL_PASSING_PERCENT, OKLAHOMA_STATE_EXAM_PASSING_PERCENT);
  /* Each entry names its own examination, so the figure can never travel without it. */
  for (const entry of Object.values(p)) {
    assert.ok(entry.examination && entry.examination.length > 10, "every percentage must name its examination");
  }
});

test("the final examination records the 150-item minimum and the no-reuse rule", () => {
  /* 605:10-5-3(e). A build shipping one fixed reusable final should fail here, not at submission. */
  assert.equal(course.finalExam.minimumItems, 150);
  assert.equal(course.finalExam.passingPercent, 75);
  assert.equal(course.finalExam.itemsMayNotRepeatPreviouslyUsedQuestions, true);
  assert.equal(course.finalExam.answerKeyMayNotBeProvidedToStudent, true);
  assert.equal(course.finalExam.retakeWithoutRepeatingInstructionPermitted, true);
  assert.equal(course.finalExam.prescribedByRule, true);
});

test("the course is recorded as Part I of a two part series", () => {
  /* 605:10-5-3(j). A student who thinks ninety hours is the whole of their education has been misled. */
  assert.equal(course.partOfSeries.part, 1);
  assert.equal(course.partOfSeries.of, 2);
  assert.equal(course.partOfSeries.ruleCitation, "605:10-5-3(j)");
  assert.match(course.partOfSeries.nextPart, /Provisional Postlicense/);
  assert.match(course.partOfSeries.note, /PROVISIONAL sales associate/);
  assert.match(course.title, /Part I of II/);
});

test("the payload separates what the Commission fixes from what StateCourse decided", () => {
  const commission = course.commissionRequirements.join(" ");
  assert.match(commission, /twenty-two areas of study/);
  assert.match(commission, /90 clock hours/);
  assert.match(commission, /150 questions/);
  assert.match(commission, /may not be the same as any previously used questions/);
  assert.match(commission, /3 years from the date the school certified/);
  assert.doesNotMatch(commission, /StateCourse/, "a Commission requirement must not describe a StateCourse decision");

  const decisions = course.stateCourseDecisions.join(" ");
  assert.match(decisions, /allocates no hours/, "the hour allocation must be recorded as a StateCourse decision");
  assert.match(decisions, /prescribes no in-module assessment/);
  assert.match(decisions, /80 percent/);
});

test("the course claims no approval and no credit", () => {
  assert.match(course.approvalStatus, /Not approved/);
  assert.match(course.approvalStatus, /No Oklahoma pre-license credit is available/);
  assert.match(course.approvalStatus, /endorsed, recommended or accredited/);
  assert.equal(course.version, "1.0-submission-draft");
});

test("every module has a curriculum file with the right hour heading", () => {
  for (const module of course.modules) {
    const file = path.join(root, module.curriculumPath);
    assert.ok(fs.existsSync(file), `${module.curriculumPath} is missing`);
    const text = fs.readFileSync(file, "utf8");
    const heading = text.match(/^## Hours (\d{1,2})[–-](\d{1,2}) · /m);
    assert.ok(heading, `${module.curriculumPath}: no '## Hours N–M ·' heading`);
    assert.equal(Number(heading[1]), module.firstHour, `${module.curriculumPath}: first hour`);
    assert.equal(Number(heading[2]), module.lastHour, `${module.curriculumPath}: last hour`);
  }
});

test("the curriculum carries exactly ninety hour headings, one per hour, none repeated", () => {
  const hours = [];
  for (const module of course.modules) {
    const text = fs.readFileSync(path.join(root, module.curriculumPath), "utf8");
    for (const match of text.matchAll(/^## Hour (\d{1,2}) /gm)) hours.push(Number(match[1]));
  }
  hours.sort((a, b) => a - b);
  assert.deepEqual(hours, Array.from({ length: 90 }, (_, i) => i + 1),
    "the curriculum's hour headings do not cover 1..90 exactly once");
});

test("every curriculum file carries the 605:10-5-3(i)(6) legal advice statement", () => {
  /* "Each course must include a statement that the information presented in the course should not be
     used as a substitute for competent legal advice." */
  for (const module of course.modules) {
    const text = prose(fs.readFileSync(path.join(root, module.curriculumPath), "utf8"));
    assert.match(text, /should not be used as a substitute for competent legal advice/,
      `${module.curriculumPath}: missing the 605:10-5-3(i)(6) statement`);
  }
});

test("every curriculum file states the course is not approved and carries no credit", () => {
  for (const module of course.modules) {
    const text = fs.readFileSync(path.join(root, module.curriculumPath), "utf8");
    assert.match(text, /Not approved/, `${module.curriculumPath}: no approval-status line`);
    assert.match(text, /No Oklahoma pre-license credit is available/, `${module.curriculumPath}: no credit disclaimer`);
  }
});

test("every curriculum file names its areas of study and attributes the hour allocation", () => {
  for (const module of course.modules) {
    const text = prose(fs.readFileSync(path.join(root, module.curriculumPath), "utf8"));
    assert.match(text, /Commission areas? of study covered:/, `${module.curriculumPath}: no areas line`);
    for (const code of module.areas) {
      assert.match(text, new RegExp(`605:10-3-1\\(a\\)\\(1\\)\\(${code}\\)|· \\(${code}\\) `),
        `${module.curriculumPath}: does not name area (${code})`);
    }
    assert.match(text, /StateCourse proposal for Commission review/, `${module.curriculumPath}: hour allocation not attributed`);
    assert.match(text, /allocates no hours/, `${module.curriculumPath}: the no-hour-allocation fact must be stated`);
  }
});

test("the agency module states that Oklahoma abrogated common-law agency", () => {
  /* If this ever stops being true in the file, the course is teaching Oklahoma agency wrongly. */
  const text = prose(fs.readFileSync(path.join(root, "oklahoma/curriculum/module-03.md"), "utf8"));
  assert.match(text, /858-360/);
  assert.match(text, /replace and abrogate the fiduciary or other duties/);
  assert.match(text, /shall not be an agent, subagent, or dual agent/);
  assert.match(text, /an offer of subagency shall not be made/);
});

test("the bank has sixteen modules and eleven items in each, correct answer at index 0", () => {
  assert.equal(Object.keys(MODULE_BANK).length, 16);
  for (const id of OKLAHOMA_MODULE_IDS) {
    const bank = MODULE_BANK[id];
    assert.ok(bank, `${id}: no bank`);
    assert.ok(bank.applied, `${id}: no applied item`);
    assert.equal(bank.engagement.length, 5, `${id}: engagement count`);
    assert.equal(bank.remediation.length, 5, `${id}: remediation count`);
    for (const item of [bank.applied, ...bank.engagement, ...bank.remediation]) {
      assert.equal(item.choices.length, 4, `${id}: not four choices`);
      assert.equal(new Set(item.choices).size, 4, `${id}: a choice repeats`);
      assert.equal(item.correctChoice, 0, `${id}: authored answer not at index 0`);
      assert.ok(item.prompt.trim().length > 20, `${id}: prompt too short`);
      assert.ok(item.rationale.trim().length > 40, `${id}: rationale too short`);
    }
  }
});

test("bank subjects match the engine's module titles", () => {
  for (const module of course.modules) {
    assert.equal(MODULE_BANK[module.id].subject, module.title,
      `${module.id}: bank subject and module title disagree`);
  }
});

test("delivery permutes the choices and the correct index moves with them", () => {
  for (const id of OKLAHOMA_MODULE_IDS) {
    for (const kind of kinds) {
      const assessment = getOklahomaAssessment(id, kind);
      const authored = kind === "applied" ? [MODULE_BANK[id].applied] : MODULE_BANK[id][kind];
      assessment.items.forEach((item, index) => {
        assert.equal(item.choices[item.correctChoice], authored[index].choices[0],
          `${item.id}: permuted correct index does not point at the authored answer`);
      });
    }
  }
});

test("the correct answer's delivered position is spread across all four indices", () => {
  const landings = [0, 0, 0, 0];
  let total = 0;
  for (const id of OKLAHOMA_MODULE_IDS) {
    for (const kind of kinds) {
      for (const item of getOklahomaAssessment(id, kind).items) {
        landings[item.correctChoice] += 1;
        total += 1;
      }
    }
  }
  assert.equal(total, 176);
  assert.ok(landings[0] < total * 0.45, `the correct answer stays at index 0 in ${landings[0]} of ${total}`);
  for (const [index, count] of landings.entries()) {
    assert.ok(count > 0, `no item delivers its correct answer at index ${index}`);
  }
});

test("the permutation is stable across calls", () => {
  const first = getOklahomaAssessment("module-11", "engagement");
  const second = getOklahomaAssessment("module-11", "engagement");
  assert.deepEqual(first.items.map((i) => i.choices), second.items.map((i) => i.choices));
  assert.deepEqual(first.items.map((i) => i.correctChoice), second.items.map((i) => i.correctChoice));
});

test("the public assessment carries no answer key — 605:10-5-3(i)(3)", () => {
  for (const id of OKLAHOMA_MODULE_IDS) {
    for (const kind of kinds) {
      const view = publicOklahomaAssessment(getOklahomaAssessment(id, kind));
      const serialised = JSON.stringify(view);
      assert.doesNotMatch(serialised, /correctChoice/, `${id} ${kind}: exposes correctChoice`);
      assert.doesNotMatch(serialised, /rationale/, `${id} ${kind}: exposes a rationale`);
      for (const item of view.items) {
        assert.equal(Object.keys(item).sort().join(","), "choices,id,prompt");
      }
    }
  }
});

test("scoring rejects coercible non-answers rather than recording choice 0", () => {
  const assessment = getOklahomaAssessment("module-03", "engagement");
  for (const bad of [null, "", false, [], undefined, {}, "1.5", " ", "0x1", NaN, 1.5, -1, 4]) {
    const answers = new Array(assessment.items.length).fill(0);
    answers[2] = bad;
    assert.equal(scoreOklahomaAssessment(assessment, answers), null,
      `scoring accepted ${String(bad)} as a selection`);
  }
  assert.equal(scoreOklahomaAssessment(assessment, [0, 1]), null);
  assert.equal(scoreOklahomaAssessment(assessment, "0,1,2,3,4"), null);
  assert.equal(scoreOklahomaAssessment(null, [0]), null);
});

test("scoring accepts a numeric string, because a form field returns one", () => {
  const assessment = getOklahomaAssessment("module-01", "engagement");
  const scored = scoreOklahomaAssessment(assessment, assessment.items.map((i) => String(i.correctChoice)));
  assert.equal(scored.percent, 100);
  assert.equal(scored.passed, true);
});

test("the engagement threshold is 80 percent and the applied threshold is 100", () => {
  const engagement = getOklahomaAssessment("module-13", "engagement");
  assert.equal(engagement.passingPercent, 80);
  const answers = engagement.items.map((i) => i.correctChoice);
  answers[0] = (answers[0] + 1) % 4;
  assert.equal(scoreOklahomaAssessment(engagement, answers).percent, 80);
  assert.equal(scoreOklahomaAssessment(engagement, answers).passed, true);
  answers[1] = (answers[1] + 1) % 4;
  assert.equal(scoreOklahomaAssessment(engagement, answers).passed, false);

  const applied = getOklahomaAssessment("module-16", "applied");
  assert.equal(applied.passingPercent, 100);
  assert.equal(applied.items.length, 1);
  assert.equal(scoreOklahomaAssessment(applied, [(applied.items[0].correctChoice + 1) % 4]).passed, false);
});

test("partial completion credits only the hours actually completed", () => {
  const three = oklahomaCreditedClockHours(
    ["module-01", "module-02", "module-03"].map((id) => ({ module_id: id, status: "completed" }))
  );
  assert.equal(three.creditedClockHours, 5 + 6 + 7);
  assert.equal(three.creditedMinInstructionMinutes, 18 * 50);
  assert.equal(three.allModulesComplete, false);
  assert.match(three.certificateBlockedBy, /605:10-3-1\(d\) requires completion of all modules: 3 of 16/);
});

test("a module in progress is not credited", () => {
  const mixed = oklahomaCreditedClockHours([
    { module_id: "module-01", status: "completed" },
    { module_id: "module-02", status: "in_progress" },
    { module_id: "module-03", status: null },
    { module_id: "module-04" }
  ]);
  assert.equal(mixed.completedModules, 1);
  assert.equal(mixed.creditedClockHours, 5);
});

test("all modules complete is not course completion — the end-of-course examination gates it", () => {
  const modulesOnly = oklahomaCreditedClockHours(allComplete);
  assert.equal(modulesOnly.allModulesComplete, true);
  assert.equal(modulesOnly.creditedClockHours, 90);
  assert.equal(modulesOnly.courseComplete, false);
  assert.match(modulesOnly.certificateBlockedBy, /end-of-course examination has not been taken/);

  const failed = oklahomaCreditedClockHours(allComplete, { finalExamPercent: 74 });
  assert.equal(failed.courseComplete, false);
  assert.match(failed.certificateBlockedBy, /74 percent, below the 75 percent required by 605:10-5-3\(f\)/);
  assert.match(failed.certificateBlockedBy, /without repeating instruction/,
    "the 605:10-5-3(f) retake permission should be surfaced to the student");

  assert.equal(oklahomaCreditedClockHours(allComplete, { finalExamPercent: 75 }).finalExamPassed, true);
});

test("the state examination's 70 percent does not pass this course's final", () => {
  /* The confusion this guards against is real: a student who passes the state examination at 70 has
     not thereby passed the course final, which 605:10-5-3(f) sets at 75. */
  const at70 = oklahomaCreditedClockHours(allComplete, { finalExamPercent: OKLAHOMA_STATE_EXAM_PASSING_PERCENT });
  assert.equal(at70.finalExamPassed, false);
  assert.equal(at70.courseComplete, false);
});

test("course completion is still not a certificate without a Commission approval number", () => {
  const complete = oklahomaCreditedClockHours(allComplete, { finalExamPercent: 88 });
  assert.equal(complete.courseComplete, true);
  assert.equal(complete.certificateEligible, false);
  assert.match(complete.certificateBlockedBy, /no approved course of study to certify/);

  const approved = oklahomaCreditedClockHours(allComplete, { finalExamPercent: 88, approvalNumber: "OREC-EXAMPLE-0000" });
  assert.equal(approved.certificateEligible, true);
  assert.equal(approved.certificateBlockedBy, null);
});

test("a non-numeric final examination score does not pass the gate", () => {
  for (const bad of ["100", null, undefined, true, {}, [100]]) {
    const result = oklahomaCreditedClockHours(allComplete, { finalExamPercent: bad, approvalNumber: "X" });
    assert.equal(result.finalExamPassed, false, `a ${typeof bad} score passed the gate`);
    assert.equal(result.certificateEligible, false);
  }
});

test("completing all sixteen modules covers all twenty-two areas of study", () => {
  const complete = oklahomaCreditedClockHours(allComplete, { finalExamPercent: 90, approvalNumber: "X" });
  assert.equal(complete.areasCovered.length, 22);
  assert.deepEqual(complete.areasCovered, "ABCDEFGHIJKLMNOPQRSTUV".split(""));
});

test("the three-year education clock runs from the school's certification date", () => {
  /* 59 O.S. § 858-302(A). Not from the last module and not from the application. */
  const stale = oklahomaEducationValidity("2023-02-10", "2026-08-20");
  assert.equal(stale.expiresOn, "2026-02-10");
  assert.equal(stale.withinWindow, false);
  assert.match(stale.blockedBy, /further ninety clock hours/);
  assert.match(stale.measuredFrom, /the date the school certified/);
  assert.equal(stale.validityYears, 3);

  const fresh = oklahomaEducationValidity("2026-03-01", "2026-08-20");
  assert.equal(fresh.expiresOn, "2029-03-01");
  assert.equal(fresh.withinWindow, true);
  assert.equal(fresh.blockedBy, null);

  /* On the last day of the window it is still valid. */
  const boundary = oklahomaEducationValidity("2023-08-20", "2026-08-20");
  assert.equal(boundary.withinWindow, true);
});

test("education validity reports an unknown window rather than guessing", () => {
  const noDate = oklahomaEducationValidity("2026-03-01");
  assert.equal(noDate.withinWindow, null);
  assert.equal(noDate.applicationDate, null);
  assert.equal(noDate.blockedBy, null);
  assert.equal(oklahomaEducationValidity(null), null);
  assert.equal(oklahomaEducationValidity("not a date"), null);
  assert.equal(oklahomaEducationValidity(20230210), null);
});

test("getOklahomaModule and getOklahomaAssessment refuse unknown ids", () => {
  assert.equal(getOklahomaModule("module-17"), null);
  assert.equal(getOklahomaModule(""), null);
  assert.equal(getOklahomaAssessment("module-17", "engagement"), null);
  assert.equal(getOklahomaAssessment("module-01", "final-exam"), null);
  assert.ok(getOklahomaModule("module-16"));
});

test("no authored answer states a figure from a source this project did not read", () => {
  /* The Residential Property Condition Disclosure Act, the promulgated forms, §§ 858-208, 858-301.1
     and 858-4000.1, the deed theft notification form, and Oklahoma's trust account, foreclosure,
     landlord-tenant, probate, lien, tax, subdivision and mineral provisions. A distractor may of
     course state a figure — that is what makes it wrong. */
  const unread = /Residential Property Condition Disclosure Act|promulgated form|858-208|858-301\.1|858-4000\.1|foreclosure|landlord-tenant|probate|mechanic's lien|mineral title|escrow (deadline|procedure)/i;
  /* Periods that WERE read and may legitimately appear. */
  const readPeriods = /three years|3 years|one year|1 year|fifteen days|15 days|thirty days|30 days|five years|5 years|six months|6 months|ten minutes|10 minutes|sixty minutes|60 minutes|thirty-six months|36 months/i;
  for (const id of OKLAHOMA_MODULE_IDS) {
    const bank = MODULE_BANK[id];
    for (const item of [bank.applied, ...bank.engagement, ...bank.remediation]) {
      const authored = `${item.choices[0]} ${item.rationale}`;
      if (!unread.test(authored)) continue;
      /* A QUANTIFIED period only — digits or a number word. Without this the pattern catches
         ordinary English ("taking months", "the same day") and reports typography as a finding. */
      const quantified = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|thirty|thirty-six|sixty|ninety)[\s-]+(business\s+)?(days?|years?|months?)\b/gi;
      const asserts = (authored.match(quantified) || []).filter((phrase) => !readPeriods.test(phrase));
      assert.deepEqual(asserts, [],
        `${id}: an authored answer touching an unread source states a period: ${asserts.join(", ")}`);
    }
  }
});

test("the routing language is actually present where a source was not read", () => {
  /* The negative test above passes trivially if nothing mentions the unread sources at all. */
  const serialised = JSON.stringify(MODULE_BANK);
  assert.match(serialised, /not read from primary text for this project/);
  assert.match(serialised, /Residential Property Condition Disclosure Act/);
  assert.match(serialised, /promulgated/);
  assert.match(serialised, /deed theft/i);
});

test("no authored answer treats Oklahoma as an agency state", () => {
  /* § 858-360(B): a broker shall not be an agent, subagent, or dual agent. An item teaching dual
     agency consent, subagency offers or fiduciary duties would be teaching another state's law. */
  const serialised = JSON.stringify(MODULE_BANK);
  assert.match(serialised, /858-360/, "the abrogation provision must appear in the bank");
  for (const id of OKLAHOMA_MODULE_IDS) {
    const bank = MODULE_BANK[id];
    for (const item of [bank.applied, ...bank.engagement, ...bank.remediation]) {
      const authored = `${item.choices[0]} ${item.rationale}`;
      /* Negated statements are the point of several items — "there is no dual agency consent to
         obtain because § 858-360(B)". Only an AFFIRMATIVE instruction is a finding. */
      const affirmsAgency = /(?<!no )(?<!not )(obtain|secure|execute|sign) (a )?dual agency consent|you must obtain dual agency|an offer of subagency may be made|the broker owes fiduciary duties/i;
      assert.doesNotMatch(authored, affirmsAgency,
        `${id}: an authored answer treats Oklahoma as an agency state`);
    }
  }
});

test("no authored answer describes the course as approved", () => {
  /* Only the AUTHORED answer and its rationale. A distractor saying "endorsed by the Commission" is
     the item doing its job — 605:10-5-1(d) forbids exactly that claim, so it is a good wrong answer. */
  for (const id of OKLAHOMA_MODULE_IDS) {
    const bank = MODULE_BANK[id];
    for (const item of [bank.applied, ...bank.engagement, ...bank.remediation]) {
      assert.doesNotMatch(`${item.choices[0]} ${item.rationale}`,
        /this course is approved|state[- ]approved|approved for credit|endorsed by the Commission/i,
        `${id}: an authored answer describes the course as approved`);
    }
  }
});

test("the primary-text readings file records the twenty-two areas and the abrogation", () => {
  const readings = prose(fs.readFileSync(path.join(root, "oklahoma/regulatory/primary-text-readings.md"), "utf8"));
  assert.match(readings, /605:10-3-1\(a\)\(1\)/);
  assert.match(readings, /Basic Course of Real Estate, Part I of II/);
  for (const area of OKLAHOMA_AREAS_OF_STUDY) {
    assert.match(readings, new RegExp(`\\(${area.code}\\) ${area.area.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
      `the readings file does not transcribe area (${area.code}) ${area.area}`);
  }
  assert.match(readings, /replace and abrogate the fiduciary or other duties/);
  assert.match(readings, /shall not be an agent, subagent, or dual agent/);
  assert.match(readings, /shall be the only information considered confidential/);
  assert.match(readings, /may not be the same as any previously used questions/);
  assert.match(readings, /three \(3\) years from the date the school certified/);
  assert.match(readings, /What was NOT read/);
});
