import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import MODULE_BANK from "../config/maine/module-question-bank.mjs";
import {
  MAINE_COMMISSION_PASSING_PERCENT,
  MAINE_COURSE_ID,
  MAINE_MODULE_IDS,
  MAINE_TOPICS,
  getMaineAssessment,
  getMaineCourse,
  getMaineModule,
  maineCreditedMinutes,
  publicMaineAssessment,
  scoreMaineAssessment
} from "../config/maine-course-engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const course = getMaineCourse();
const allModules = MAINE_MODULE_IDS.map((id) => ({ module_id: id, status: "completed" }));
const fullyDone = {
  quizzesPassed: ["quiz-1", "quiz-2", "quiz-3"],
  caseStudiesComplete: ["case-study-1", "case-study-2"],
  finalExamPercent: 80
};

test("the Commission's arithmetic holds: 55 clock hours of 60 minutes, 3,000 + 300", () => {
  assert.equal(course.minutesPerClockHour, 60, "a Maine clock hour is 60 minutes, not the 50 Virginia and Alaska use");
  assert.equal(course.instructionalMinutes, 3000);
  assert.equal(course.assessmentMinutes, 300);
  assert.equal(course.clockHours, 55);
  assert.equal(course.modules.reduce((sum, m) => sum + m.minutes, 0), 3000);
});

test("assessment time stays under the Commission's 10 percent ceiling", () => {
  assert.equal(course.assessmentCeilingPercent, 10);
  assert.equal(course.assessmentSharePercent, 9.09);
  assert.ok(course.assessmentSharePercent <= course.assessmentCeilingPercent);
});

test("the ten Commission topics are transcribed and reconcile", () => {
  assert.equal(MAINE_TOPICS.length, 10);
  assert.equal(MAINE_TOPICS.reduce((sum, t) => sum + t.weightPercent, 0), 100);
  assert.equal(MAINE_TOPICS.reduce((sum, t) => sum + t.minutes, 0), 3000);
  assert.equal(MAINE_TOPICS.reduce((sum, t) => sum + t.finalExamItems, 0), 80);
  assert.equal(MAINE_TOPICS.find((t) => t.code === "T05").topic, "Product Knowledge");
  assert.equal(MAINE_TOPICS.find((t) => t.code === "T05").weightPercent, 28);
});

test("every Commission topic is carried by a module and no module invents one", () => {
  const covered = new Set(course.modules.flatMap((m) => m.topics));
  for (const topic of MAINE_TOPICS) {
    assert.ok(covered.has(topic.code), `${topic.code} ${topic.topic} is carried by no module`);
  }
  for (const code of covered) {
    assert.ok(MAINE_TOPICS.some((t) => t.code === code), `a module claims ${code}, which is not a Commission topic`);
  }
});

test("Product Knowledge splits across two modules and the halves reconcile to 840", () => {
  /* The split is mid-Hour-15 and mid-Hour-29, not at an hour boundary. The first version of the
     module table assumed otherwise and was 30 minutes short; the engine's import-time check caught
     it, which is why this test exists. */
  const product = course.modules.filter((m) => m.topics.includes("T05"));
  assert.equal(product.length, 2);
  assert.equal(product.reduce((sum, m) => sum + m.minutes, 0), 840);
  assert.equal(MAINE_TOPICS.find((t) => t.code === "T05").minutes, 840);
});

test("the curriculum file for every module exists and states the regulatory status", () => {
  for (const module of course.modules) {
    const file = path.join(root, module.curriculumPath);
    assert.ok(fs.existsSync(file), `${module.curriculumPath} is missing`);
    const text = fs.readFileSync(file, "utf8");
    assert.match(text, /Not approved\. No Maine sales agent credit is available/, `${module.id} does not state its status`);
    assert.doesNotMatch(text, /\bCommission[- ]approved course\b/i, `${module.id} makes an approval claim`);
    assert.doesNotMatch(text, /\bapproval (?:has been|was) (?:granted|issued)\b/i, `${module.id} makes an approval claim`);
  }
});

test("the curriculum module headers state the same minutes as the engine", () => {
  /* Two files state each module's length. If they disagree, one of them is misleading a reviewer —
     and this is the exact drift that produced the 30-minute error. */
  for (const module of course.modules) {
    const text = fs.readFileSync(path.join(root, module.curriculumPath), "utf8");
    const row = text.match(/^\| \*\*Total\*\* \| \*\*(\d+)\*\* \|/m);
    assert.ok(row, `${module.id} has no timed-sequence total row`);
    assert.equal(Number(row[1]), module.minutes,
      `${module.id}: curriculum says ${row[1]} minutes, engine says ${module.minutes}`);
  }
});

test("the 75 percent passing grade is attributed to the Commission, not to StateCourse", () => {
  /* Maine is the inverse of Virginia and Michigan. There the passing standard is this school's and
     every document must say so; here it is the regulator's and must be attributed to it. */
  assert.equal(MAINE_COMMISSION_PASSING_PERCENT, 75);
  assert.equal(course.commissionPassingPercent, 75);
  const commission = course.commissionRequirements.join(" ");
  assert.match(commission, /75 percent passing grade is the Commission's/);
  assert.match(commission, /percentage weights are the Commission's/);
  const ours = course.stateCourseDecisions.join(" ");
  assert.match(ours, /which the Commission does not prescribe/);
  assert.doesNotMatch(ours, /passing grade/i, "the passing grade must not appear as a StateCourse decision");
});

test("the Commission's assessment structure is recorded", () => {
  assert.equal(course.quizzes.length, 3);
  for (const quiz of course.quizzes) {
    assert.equal(quiz.items, 20);
    assert.equal(quiz.passingPercent, 75);
  }
  assert.deepEqual(course.quizzes.map((q) => q.afterHour), [15, 34, 46]);
  assert.equal(course.finalExam.items, 80);
  assert.equal(course.finalExam.passingPercent, 75);
  assert.equal(course.finalExam.afterAllInstruction, true);
  assert.deepEqual(course.finalExam.deliveredAcrossHours, [53, 54, 55]);
  assert.equal(course.caseStudies.length, 2);
});

test("every module has an applied item, five engagement items, and five remediation items", () => {
  assert.equal(Object.keys(MODULE_BANK).length, 9);
  for (const id of MAINE_MODULE_IDS) {
    const bank = MODULE_BANK[id];
    assert.ok(bank, `${id} has no bank`);
    assert.ok(bank.applied?.prompt, `${id} has no applied item`);
    assert.equal(bank.engagement.length, 5);
    assert.equal(bank.remediation.length, 5);
  }
});

test("every authored item is well formed and its rationale teaches something", () => {
  for (const [id, bank] of Object.entries(MODULE_BANK)) {
    for (const item of [bank.applied, ...bank.engagement, ...bank.remediation]) {
      assert.ok(item.prompt.length > 20, `${id}: prompt too short`);
      assert.equal(item.choices.length, 4, `${id}: four choices`);
      assert.equal(new Set(item.choices).size, 4, `${id}: duplicate choice text`);
      assert.equal(item.correctChoice, 0, `${id}: authored correct answer sits at index 0`);
      assert.ok(item.rationale.length > 40, `${id}: rationale too short`);
      assert.notEqual(item.rationale.trim(), item.choices[0].trim(), `${id}: rationale repeats the answer`);
    }
  }
});

test("where a figure has not been read, the authored answer is the navigation and not a number", () => {
  /* The VRLTA deadlines, the records retention schedule and the Maine Human Rights Act
     protected-class list are all unread from primary text for this project. An item whose CORRECT
     answer supplied one of them would be teaching a figure this course does not know.

     The check is on the authored correct answer at index 0, not on the whole bank: a wrong-answer
     distractor may legitimately state "24 hours" or "three years", and a rationale may legitimately
     say the course states no such figure. Testing the serialised bank flagged both, which is why
     this test targets index 0. */
  const correctAnswers = Object.entries(MODULE_BANK).flatMap(([id, bank]) =>
    [bank.applied, ...bank.engagement, ...bank.remediation].map((item) => ({ id, text: item.choices[0] })));

  for (const { id, text } of correctAnswers) {
    assert.doesNotMatch(text, /security deposit (?:maximum|of \$|must be returned within)/i,
      `${id}: a correct answer states a Maine security deposit figure`);
    assert.doesNotMatch(text, /retention (?:period|schedule) (?:is|of) \d/i,
      `${id}: a correct answer states a Maine retention period`);
    assert.doesNotMatch(text, /Maine protects the following classes/i,
      `${id}: a correct answer prints the Maine protected-class list`);
  }

  /* And the items that touch those areas route the student to the source. */
  const routing = correctAnswers.map((entry) => entry.text).join("\n");
  assert.match(routing, /Read it from the current text of 14 M\.R\.S\./,
    "the landlord-tenant item must answer with the navigation");
  assert.match(routing, /must be read from the Act directly/,
    "the protected-class item must answer with the navigation");
  assert.match(routing, /delegates the required records and the retention schedule to the Commission's rules/,
    "the retention item must answer with the delegation");
});

test("delivery permutes the choices, spreads them, and is stable", () => {
  const landings = [0, 0, 0, 0];
  let total = 0;
  for (const id of MAINE_MODULE_IDS) {
    for (const kind of ["applied", "engagement", "remediation"]) {
      for (const item of getMaineAssessment(id, kind).items) {
        landings[item.correctChoice] += 1;
        total += 1;
      }
    }
  }
  assert.equal(total, 99, "nine modules of one applied, five engagement and five remediation items");
  assert.ok(landings[0] < total * 0.45, `${landings[0]} of ${total} correct answers stayed at index 0`);
  for (const [index, count] of landings.entries()) {
    assert.ok(count > 0, `no correct answer was presented at index ${index}`);
  }
  const first = getMaineAssessment("module-02", "engagement");
  const second = getMaineAssessment("module-02", "engagement");
  assert.deepEqual(first.items.map((i) => i.choices), second.items.map((i) => i.choices));
});

test("the student payload carries no answer key", () => {
  for (const id of MAINE_MODULE_IDS) {
    for (const kind of ["applied", "engagement", "remediation"]) {
      const serialised = JSON.stringify(publicMaineAssessment(getMaineAssessment(id, kind)));
      assert.doesNotMatch(serialised, /correctChoice/, `${id}/${kind} leaks correctChoice`);
      assert.doesNotMatch(serialised, /rationale/, `${id}/${kind} leaks rationale`);
    }
  }
});

test("scoring rejects an answer that was never given rather than coercing it to choice 0", () => {
  const assessment = getMaineAssessment("module-01", "engagement");
  for (const bad of [null, "", false, [], undefined, {}, "1.5", "-1", NaN]) {
    const answers = assessment.items.map(() => 0);
    answers[1] = bad;
    assert.equal(scoreMaineAssessment(assessment, answers), null, `scoring accepted ${JSON.stringify(bad)}`);
  }
  assert.equal(scoreMaineAssessment(assessment, [0]), null);
  assert.equal(scoreMaineAssessment(null, [0]), null);
});

test("scoring reads a digit string and applies the in-module threshold", () => {
  const assessment = getMaineAssessment("module-01", "engagement");
  const allRight = assessment.items.map((i) => String(i.correctChoice));
  assert.equal(scoreMaineAssessment(assessment, allRight).percent, 100);
  const fourOfFive = assessment.items.map((item, index) =>
    index === 0 ? (item.correctChoice + 1) % item.choices.length : item.correctChoice);
  const near = scoreMaineAssessment(assessment, fourOfFive);
  assert.equal(near.percent, 80);
  assert.equal(near.passed, true);
});

test("finishing every module completes the instruction but not the course", () => {
  const credit = maineCreditedMinutes(allModules);
  assert.equal(credit.creditedInstructionalMinutes, 3000);
  assert.equal(credit.creditedClockHoursOfInstruction, 50);
  assert.equal(credit.instructionComplete, true);
  assert.equal(credit.courseComplete, false);
  assert.equal(credit.topicsCovered.length, 10);
  assert.match(credit.certificateBlockedBy, /case studies/i);
});

test("the Commission's gates apply in order: cases, quizzes, final, approval", () => {
  const cases = maineCreditedMinutes(allModules, { caseStudiesComplete: ["case-study-1", "case-study-2"] });
  assert.match(cases.certificateBlockedBy, /three Commission-required quizzes/);

  const quizzes = maineCreditedMinutes(allModules, {
    caseStudiesComplete: ["case-study-1", "case-study-2"],
    quizzesPassed: ["quiz-1", "quiz-2", "quiz-3"]
  });
  assert.match(quizzes.certificateBlockedBy, /final examination.*has not been taken/);

  const failed = maineCreditedMinutes(allModules, { ...fullyDone, finalExamPercent: 74 });
  assert.equal(failed.finalExamPassed, false);
  assert.match(failed.certificateBlockedBy, /74 percent, below the Commission's 75 percent/);

  const passed = maineCreditedMinutes(allModules, fullyDone);
  assert.equal(passed.courseComplete, true);
  assert.equal(passed.certificateEligible, false);
  assert.match(passed.certificateBlockedBy, /Chapter 360 bars conducting classes for licensing credit/);

  const approved = maineCreditedMinutes(allModules, { ...fullyDone, approvalNumber: "PENDING-EXAMPLE" });
  assert.equal(approved.certificateEligible, true);
  assert.equal(approved.certificateBlockedBy, null);
});

test("exactly 75 passes and 74 does not, because the boundary is the Commission's", () => {
  assert.equal(maineCreditedMinutes(allModules, { ...fullyDone, finalExamPercent: 75 }).finalExamPassed, true);
  assert.equal(maineCreditedMinutes(allModules, { ...fullyDone, finalExamPercent: 74.9 }).finalExamPassed, false);
});

test("partial completion credits only the completed modules and names the shortfall", () => {
  const partial = maineCreditedMinutes(allModules.slice(0, 4), { ...fullyDone, approvalNumber: "X" });
  assert.equal(partial.completedModules, 4);
  assert.equal(partial.creditedInstructionalMinutes, 450 + 390 + 435 + 405);
  assert.equal(partial.instructionComplete, false);
  assert.equal(partial.certificateEligible, false);
  assert.match(partial.certificateBlockedBy, /1680 of 3000/);
});

test("a module state that is not 'completed' credits nothing", () => {
  const inProgress = MAINE_MODULE_IDS.map((id) => ({ module_id: id, status: "in_progress" }));
  assert.equal(maineCreditedMinutes(inProgress).creditedInstructionalMinutes, 0);
  assert.equal(maineCreditedMinutes([]).creditedInstructionalMinutes, 0);
  assert.equal(maineCreditedMinutes(undefined).creditedInstructionalMinutes, 0);
});

test("the approval status quotes the Chapter 360 prohibition", () => {
  assert.match(course.approvalStatus, /Not approved/);
  assert.match(course.approvalStatus, /advertising as approved, enrolling for licensing credit, or conducting classes for credit before written approval/);
});

test("unknown identifiers return nothing rather than a default", () => {
  assert.equal(getMaineCourse("va-salesperson-principles-v1"), null);
  assert.equal(getMaineModule("module-99"), null);
  assert.equal(getMaineAssessment("module-99", "engagement"), null);
  assert.equal(getMaineAssessment("module-01", "not-a-kind"), null);
  assert.equal(publicMaineAssessment(null), null);
  assert.equal(MAINE_COURSE_ID, "me-sales-agent-55-v1");
});
