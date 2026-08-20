import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import MODULE_BANK from "../config/wisconsin/module-question-bank.mjs";
import {
  WISCONSIN_COURSE_ID,
  WISCONSIN_MODULE_IDS,
  WISCONSIN_REQUIRED_CLOCK_HOURS,
  WISCONSIN_TOPICS,
  getWisconsinAssessment,
  getWisconsinCourse,
  getWisconsinModule,
  publicWisconsinAssessment,
  scoreWisconsinAssessment,
  wisconsinCreditedClockHours
} from "../config/wisconsin-course-engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const course = getWisconsinCourse();
const allComplete = WISCONSIN_MODULE_IDS.map((id) => ({ module_id: id, status: "completed" }));

test("the course is the 72 hours REEB 25.033 requires, in 60-minute clock hours", () => {
  assert.equal(course.clockHours, 72);
  assert.equal(WISCONSIN_REQUIRED_CLOCK_HOURS, 72);
  assert.equal(course.minutesPerClockHour, 60);
  assert.equal(course.instructionalMinutes, 72 * 60);
  assert.equal(course.modules.reduce((sum, m) => sum + m.hours, 0), 72);
});

test("the hours run 1 through 72 exactly once each, with no gap and no overlap", () => {
  const claimed = [];
  for (const module of course.modules) {
    assert.equal(module.lastHour, module.firstHour + module.hours - 1, `${module.id}: lastHour disagrees with hours`);
    for (let hour = module.firstHour; hour <= module.lastHour; hour += 1) claimed.push(hour);
  }
  claimed.sort((a, b) => a - b);
  assert.deepEqual(claimed, Array.from({ length: 72 }, (_, i) => i + 1));
});

test("all nineteen REEB 25.033 topics are transcribed and every one is carried by a module", () => {
  assert.equal(WISCONSIN_TOPICS.length, 19);
  for (const topic of WISCONSIN_TOPICS) {
    assert.match(topic.subsection, /^REEB 25\.033\(\d{1,2}\)$/, `${topic.code}: subsection citation shape`);
  }
  const covered = new Set(course.modules.flatMap((m) => m.topics));
  const uncovered = WISCONSIN_TOPICS.filter((t) => !covered.has(t.code));
  assert.deepEqual(uncovered.map((t) => t.subsection), [], "a Board topic is carried by no module");
  const known = new Set(WISCONSIN_TOPICS.map((t) => t.code));
  assert.deepEqual([...covered].filter((c) => !known.has(c)), [], "a module claims a topic the rule does not list");
});

test("the payload separates what the Board fixes from what StateCourse decided", () => {
  /* This is the whole point of the Wisconsin engine. The rule fixes 72 hours and nineteen topics
     and nothing else, so every allocation and every threshold must be attributed to this school. */
  assert.ok(course.boardRequirements.some((line) => /72 hours/.test(line)));
  assert.ok(course.boardRequirements.some((line) => /nineteen topics/.test(line)));
  const decisions = course.stateCourseDecisions.join(" ");
  assert.match(decisions, /allocates no hours/, "the hour allocation must be recorded as a StateCourse decision");
  assert.match(decisions, /prescribes no assessment and no passing score/);
  assert.match(decisions, /requires no final examination/);
  for (const line of course.boardRequirements) {
    assert.doesNotMatch(line, /StateCourse/, "a Board requirement must not describe a StateCourse decision");
  }
});

test("the final examination is marked as not prescribed by rule", () => {
  assert.equal(course.finalExam.prescribedByRule, false);
  assert.equal(course.finalExam.passingPercent, 75);
  assert.equal(course.finalExam.afterAllInstruction, true);
});

test("the course claims no approval and no credit", () => {
  assert.match(course.approvalStatus, /Not approved/);
  assert.match(course.approvalStatus, /No Wisconsin pre-license credit is available/);
  assert.equal(course.version, "1.0-submission-draft");
});

test("getWisconsinCourse returns nothing for another course id", () => {
  assert.equal(getWisconsinCourse("wi-salesperson-72-v2"), null);
  assert.equal(getWisconsinCourse("me-sales-agent-55-v1"), null);
  assert.equal(getWisconsinCourse(WISCONSIN_COURSE_ID).courseId, WISCONSIN_COURSE_ID);
});

test("every module has a curriculum file that exists on disk", () => {
  for (const module of course.modules) {
    const file = path.join(root, module.curriculumPath);
    assert.ok(fs.existsSync(file), `${module.id}: ${module.curriculumPath} is missing`);
  }
});

test("each curriculum file states its own hour count and matches the engine", () => {
  for (const module of course.modules) {
    const text = fs.readFileSync(path.join(root, module.curriculumPath), "utf8");
    const heading = text.match(/^## Hours (\d{1,2})–(\d{1,2}) · /m);
    assert.ok(heading, `${module.id}: no '## Hours N–M ·' heading`);
    assert.equal(Number(heading[1]), module.firstHour, `${module.id}: first hour disagrees with the engine`);
    assert.equal(Number(heading[2]), module.lastHour, `${module.id}: last hour disagrees with the engine`);
  }
});

test("every curriculum file states the course is not approved and carries no credit", () => {
  for (const module of course.modules) {
    const text = fs.readFileSync(path.join(root, module.curriculumPath), "utf8");
    assert.match(text, /Not approved/, `${module.id}: no approval-status line`);
    assert.match(text, /No Wisconsin pre-license credit is available/, `${module.id}: no credit disclaimer`);
  }
});

test("every curriculum file records that the hour allocation is a StateCourse proposal", () => {
  /* A file that stated an hour figure without this line would read as though the Board had set it. */
  for (const module of course.modules) {
    const text = fs.readFileSync(path.join(root, module.curriculumPath), "utf8");
    assert.match(text, /StateCourse proposal for Board review/, `${module.id}: hour allocation not attributed`);
  }
});

test("the bank has thirteen modules and eleven items in each", () => {
  assert.equal(Object.keys(MODULE_BANK).length, 13);
  for (const id of WISCONSIN_MODULE_IDS) {
    const bank = MODULE_BANK[id];
    assert.ok(bank, `${id}: no bank`);
    assert.ok(bank.applied, `${id}: no applied item`);
    assert.equal(bank.engagement.length, 5, `${id}: engagement count`);
    assert.equal(bank.remediation.length, 5, `${id}: remediation count`);
  }
});

test("every authored item has four distinct choices with the correct answer at index 0", () => {
  for (const id of WISCONSIN_MODULE_IDS) {
    const bank = MODULE_BANK[id];
    for (const item of [bank.applied, ...bank.engagement, ...bank.remediation]) {
      assert.equal(item.choices.length, 4, `${id}: an item does not have four choices`);
      assert.equal(new Set(item.choices).size, 4, `${id}: an item repeats a choice`);
      assert.equal(item.correctChoice, 0, `${id}: the authored correct answer is not at index 0`);
      assert.ok(item.prompt.trim().length > 20, `${id}: an item prompt is too short to be a question`);
      assert.ok(item.rationale.trim().length > 40, `${id}: an item rationale is too short to teach anything`);
    }
  }
});

test("the bank's subjects match the engine's module titles", () => {
  for (const module of course.modules) {
    assert.equal(MODULE_BANK[module.id].subject, module.title, `${module.id}: bank subject and engine title disagree`);
  }
});

test("delivery permutes the choices and the correct index moves with them", () => {
  for (const id of WISCONSIN_MODULE_IDS) {
    for (const kind of ["applied", "engagement", "remediation"]) {
      const assessment = getWisconsinAssessment(id, kind);
      const authored = kind === "applied" ? [MODULE_BANK[id].applied] : MODULE_BANK[id][kind];
      assessment.items.forEach((item, index) => {
        assert.equal(item.choices[item.correctChoice], authored[index].choices[0],
          `${item.id}: the permuted correct index does not point at the authored answer`);
      });
    }
  }
});

test("the correct answer does not land at index 0 across the bank", () => {
  /* Not per item — with four choices about a quarter of items land at 0 by chance. The claim is
     that the delivered position is spread, which is what a student could otherwise exploit. */
  const landings = [0, 0, 0, 0];
  let total = 0;
  for (const id of WISCONSIN_MODULE_IDS) {
    for (const kind of ["applied", "engagement", "remediation"]) {
      for (const item of getWisconsinAssessment(id, kind).items) {
        landings[item.correctChoice] += 1;
        total += 1;
      }
    }
  }
  assert.equal(total, 143);
  assert.ok(landings[0] < total * 0.45, `the correct answer stays at index 0 in ${landings[0]} of ${total} items`);
  for (const [index, count] of landings.entries()) {
    assert.ok(count > 0, `no item delivers its correct answer at index ${index}`);
  }
});

test("the permutation is stable across calls, so a recorded selection keeps its meaning", () => {
  const first = getWisconsinAssessment("module-06", "engagement");
  const second = getWisconsinAssessment("module-06", "engagement");
  assert.deepEqual(first.items.map((i) => i.choices), second.items.map((i) => i.choices));
  assert.deepEqual(first.items.map((i) => i.correctChoice), second.items.map((i) => i.correctChoice));
});

test("the public assessment carries no answer key", () => {
  for (const id of WISCONSIN_MODULE_IDS) {
    for (const kind of ["applied", "engagement", "remediation"]) {
      const publicView = publicWisconsinAssessment(getWisconsinAssessment(id, kind));
      const serialised = JSON.stringify(publicView);
      assert.doesNotMatch(serialised, /correctChoice/, `${id} ${kind}: the public view exposes correctChoice`);
      assert.doesNotMatch(serialised, /rationale/, `${id} ${kind}: the public view exposes a rationale`);
      for (const item of publicView.items) {
        assert.equal(Object.keys(item).sort().join(","), "choices,id,prompt");
      }
    }
  }
});

test("scoring rejects coercible non-answers rather than recording choice 0", () => {
  /* Number(null), Number(""), Number(false) and Number([]) are all 0. A coerced read would record a
     selection the student never made, permanently, and it would look like a real answer. */
  const assessment = getWisconsinAssessment("module-01", "engagement");
  for (const bad of [null, "", false, [], undefined, {}, "1.5", " ", "0x1", NaN, 1.5, -1, 4]) {
    const answers = new Array(assessment.items.length).fill(0);
    answers[2] = bad;
    assert.equal(scoreWisconsinAssessment(assessment, answers), null,
      `scoring accepted ${JSON.stringify(bad) ?? String(bad)} as a selection`);
  }
  assert.equal(scoreWisconsinAssessment(assessment, [0, 1]), null, "scoring accepted the wrong number of answers");
  assert.equal(scoreWisconsinAssessment(assessment, "0,1,2,3,4"), null, "scoring accepted a string for the answer array");
  assert.equal(scoreWisconsinAssessment(null, [0]), null);
});

test("scoring accepts a numeric string, because a form field returns one", () => {
  const assessment = getWisconsinAssessment("module-01", "engagement");
  const answers = assessment.items.map((item) => String(item.correctChoice));
  const scored = scoreWisconsinAssessment(assessment, answers);
  assert.equal(scored.percent, 100);
  assert.equal(scored.passed, true);
});

test("the engagement threshold is 80 percent and four of five does not pass", () => {
  const assessment = getWisconsinAssessment("module-02", "engagement");
  assert.equal(assessment.passingPercent, 80);
  const answers = assessment.items.map((item) => item.correctChoice);
  assert.equal(scoreWisconsinAssessment(assessment, answers).passed, true);
  answers[0] = (answers[0] + 1) % 4;
  const four = scoreWisconsinAssessment(assessment, answers);
  assert.equal(four.correctCount, 4);
  assert.equal(four.percent, 80);
  assert.equal(four.passed, true, "four of five is 80 percent and meets the threshold");
  answers[1] = (answers[1] + 1) % 4;
  const three = scoreWisconsinAssessment(assessment, answers);
  assert.equal(three.percent, 60);
  assert.equal(three.passed, false);
});

test("the applied item must be answered correctly — 100 percent, one item", () => {
  const assessment = getWisconsinAssessment("module-10", "applied");
  assert.equal(assessment.passingPercent, 100);
  assert.equal(assessment.items.length, 1);
  const wrong = (assessment.items[0].correctChoice + 1) % 4;
  assert.equal(scoreWisconsinAssessment(assessment, [wrong]).passed, false);
  assert.equal(scoreWisconsinAssessment(assessment, [assessment.items[0].correctChoice]).passed, true);
});

test("partial instruction credits only the hours actually completed", () => {
  const three = wisconsinCreditedClockHours(
    ["module-01", "module-02", "module-03"].map((id) => ({ module_id: id, status: "completed" }))
  );
  assert.equal(three.completedModules, 3);
  assert.equal(three.creditedClockHours, 5 + 7 + 5);
  assert.equal(three.creditedMinutes, 17 * 60);
  assert.equal(three.instructionComplete, false);
  assert.match(three.certificateBlockedBy, /Not all 72 clock hours completed \(17 of 72\)/);
});

test("a module in progress is not credited", () => {
  const mixed = wisconsinCreditedClockHours([
    { module_id: "module-01", status: "completed" },
    { module_id: "module-02", status: "in_progress" },
    { module_id: "module-03", status: null },
    { module_id: "module-04" }
  ]);
  assert.equal(mixed.completedModules, 1);
  assert.equal(mixed.creditedClockHours, 5);
});

test("all instruction is not course completion — the final examination still gates it", () => {
  const instructionOnly = wisconsinCreditedClockHours(allComplete);
  assert.equal(instructionOnly.instructionComplete, true);
  assert.equal(instructionOnly.creditedClockHours, 72);
  assert.equal(instructionOnly.courseComplete, false);
  assert.match(instructionOnly.certificateBlockedBy, /final examination.*has not been taken/);
});

test("a failing final examination blocks completion and says the score", () => {
  const failed = wisconsinCreditedClockHours(allComplete, { finalExamPercent: 74 });
  assert.equal(failed.finalExamPassed, false);
  assert.equal(failed.courseComplete, false);
  assert.match(failed.certificateBlockedBy, /scored at 74 percent, below the 75 percent standard/);
  assert.equal(wisconsinCreditedClockHours(allComplete, { finalExamPercent: 75 }).finalExamPassed, true);
});

test("course completion is still not a certificate without a Board approval number", () => {
  const complete = wisconsinCreditedClockHours(allComplete, { finalExamPercent: 88 });
  assert.equal(complete.courseComplete, true);
  assert.equal(complete.certificateEligible, false);
  assert.match(complete.certificateBlockedBy, /no pre-license credit exists to certify/);

  const approved = wisconsinCreditedClockHours(allComplete, { finalExamPercent: 88, approvalNumber: "REEB-EXAMPLE-0000" });
  assert.equal(approved.certificateEligible, true);
  assert.equal(approved.certificateBlockedBy, null);
});

test("a non-numeric final examination score does not pass the gate", () => {
  for (const bad of ["100", null, undefined, true, {}, [100]]) {
    const result = wisconsinCreditedClockHours(allComplete, { finalExamPercent: bad, approvalNumber: "X" });
    assert.equal(result.finalExamPassed, false, `a ${typeof bad} final score passed the gate`);
    assert.equal(result.certificateEligible, false);
  }
});

test("completing all thirteen modules covers all nineteen Board topics", () => {
  const complete = wisconsinCreditedClockHours(allComplete, { finalExamPercent: 90, approvalNumber: "X" });
  assert.equal(complete.topicsCovered.length, 19);
  assert.deepEqual(complete.topicsCovered, WISCONSIN_TOPICS.map((t) => t.code).sort());
});

test("getWisconsinModule and getWisconsinAssessment refuse unknown ids", () => {
  assert.equal(getWisconsinModule("module-14"), null);
  assert.equal(getWisconsinModule(""), null);
  assert.equal(getWisconsinAssessment("module-14", "engagement"), null);
  assert.equal(getWisconsinAssessment("module-01", "final-exam"), null);
  assert.ok(getWisconsinModule("module-13"));
});

test("no item asks a student to recall a figure from a source this project has not read", () => {
  /* ATCP 134, ch. 766, ch. REEB 15 through 24, ch. 709, ch. 779, ch. 74, ch. 77 and s. 224.71 were
     not read from primary text. Where the curriculum routes instead of stating a figure, the
     AUTHORED correct answer must be the routing — a distractor may of course state a figure, since
     that is what makes it wrong. */
  const routed = /ATCP 134|ch\. 766|REEB 1[5-8]|ch\. 709|ch\. 779|ch\. 74|ch\. 77|224\.71|ch\. 236|ch\. 893/;
  for (const id of WISCONSIN_MODULE_IDS) {
    const bank = MODULE_BANK[id];
    for (const item of [bank.applied, ...bank.engagement, ...bank.remediation]) {
      const authored = `${item.choices[0]} ${item.rationale}`;
      if (!routed.test(authored)) continue;
      /* The authored answer touches an unread source. It must not assert a figure from it. */
      const asserts = authored.match(/\b\d+\s*(days?|business days?|years?|months?|percent)\b/gi) || [];
      assert.deepEqual(asserts, [],
        `${id}: an authored answer touching an unread source states a period or percentage: ${asserts.join(", ")}`);
    }
  }
});

test("the routing language is actually present where a source was not read", () => {
  /* The negative test above passes trivially if nothing mentions the unread sources at all. */
  const serialised = JSON.stringify(MODULE_BANK);
  assert.match(serialised, /has not been read from primary text for this project/);
  assert.match(serialised, /ATCP 134/);
  assert.match(serialised, /ch\. 766/i);
  assert.match(serialised, /REEB 18/);
});

test("no authored answer describes the course as approved", () => {
  const serialised = JSON.stringify(MODULE_BANK);
  assert.doesNotMatch(serialised, /Board[- ]approved course|state[- ]approved|is approved for credit/i);
});
