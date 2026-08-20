import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import MODULE_BANK from "../config/virginia/module-question-bank.mjs";
import { VIRGINIA_COURSE_RULES } from "../lib/course-compliance.mjs";
import {
  VIRGINIA_COURSE_ID,
  VIRGINIA_MODULE_IDS,
  VIRGINIA_REQUIRED_SUBJECTS,
  VIRGINIA_RETENTION_YEARS,
  getVirginiaAssessment,
  getVirginiaCourse,
  getVirginiaModule,
  getVirginiaModuleForHour,
  publicVirginiaAssessment,
  scoreVirginiaAssessment,
  virginiaCreditedClassHours
} from "../config/virginia-course-engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const curriculumDir = path.join(root, "virginia/curriculum");
const course = getVirginiaCourse();
const allComplete = VIRGINIA_MODULE_IDS.map((id) => ({ module_id: id, status: "completed" }));

test("the course delivers the 60 class hours 18VAC135-20-400 requires, as 3,000 minutes", () => {
  assert.equal(course.requiredClassHours, 60);
  assert.equal(course.minutesPerClassHour, 50);
  assert.equal(course.instructionalMinutes, 3000);
  const summed = course.modules.reduce((total, module) => total + module.classHours, 0);
  assert.equal(summed, 60, "the modules must total the hours the course claims");
});

test("every hour from 1 to 60 belongs to exactly one module", () => {
  const seen = new Map();
  for (const module of course.modules) {
    for (const hour of module.hours) {
      assert.ok(!seen.has(hour), `hour ${hour} appears in ${seen.get(hour)} and ${module.id}`);
      seen.set(hour, module.id);
    }
  }
  for (let hour = 1; hour <= 60; hour += 1) {
    assert.ok(seen.has(hour), `hour ${hour} belongs to no module`);
    assert.equal(getVirginiaModuleForHour(hour)?.id, seen.get(hour));
  }
  assert.equal(getVirginiaModuleForHour(61), null);
});

test("all twenty-five 18VAC135-20-400 subjects are transcribed and covered", () => {
  /* The regulation's own list. A course that drops one does not satisfy the section, and the
     engine throws at import rather than loading — so this asserts the transcription too. */
  assert.equal(VIRGINIA_REQUIRED_SUBJECTS.length, 25);
  const codes = VIRGINIA_REQUIRED_SUBJECTS.map((item) => item.code);
  assert.deepEqual(codes, Array.from({ length: 25 }, (_, index) => `T${String(index + 1).padStart(2, "0")}`));
  assert.equal(VIRGINIA_REQUIRED_SUBJECTS.find((item) => item.code === "T24").subject, "Fair housing statutes");

  const covered = new Set(course.modules.flatMap((module) => module.subjects));
  const missing = codes.filter((code) => !covered.has(code));
  assert.deepEqual(missing, [], "a required subject is covered by no module");
});

test("the curriculum file for every module exists and carries its four hour headings", () => {
  for (const module of course.modules) {
    const file = path.join(root, module.curriculumPath);
    assert.ok(fs.existsSync(file), `${module.curriculumPath} is missing`);
    const text = fs.readFileSync(file, "utf8");
    for (const hour of module.hours) {
      const heading = new RegExp(`^## Hour ${String(hour).padStart(2, "0")} — `, "m");
      assert.match(text, heading, `${module.id} does not carry a heading for hour ${hour}`);
    }
  }
});

test("the curriculum carries exactly 60 hour headings and 60 engagement checks", () => {
  /* The student portal refuses to load on any other number, and a submission that claims 60
     hours must deliver 60. Counted across the files rather than per file so a rebalanced
     module cannot pass by accident. */
  const files = fs.readdirSync(curriculumDir).filter((name) => /^module-\d\d\.md$/.test(name));
  assert.equal(files.length, 15);
  const text = files.map((name) => fs.readFileSync(path.join(curriculumDir, name), "utf8")).join("\n");
  assert.equal((text.match(/^## Hour \d\d — /gm) ?? []).length, 60);
  assert.equal((text.match(/^### Hour \d\d engagement check/gm) ?? []).length, 60);
});

test("no curriculum file claims the course is approved or carries credit", () => {
  const forbidden = [
    /\bstate[- ]approved\b/i,
    /\bboard[- ]approved course\b/i,
    /\bapproval (?:has been|was) (?:granted|issued)\b/i,
    /\bcarries Virginia pre-?licen[cs]e credit\b/i
  ];
  for (const name of fs.readdirSync(curriculumDir).filter((file) => file.endsWith(".md"))) {
    const text = fs.readFileSync(path.join(curriculumDir, name), "utf8");
    for (const pattern of forbidden) {
      assert.doesNotMatch(text, pattern, `${name} makes an approval claim`);
    }
    assert.match(text, /Not approved\. No Virginia pre-license credit is available/,
      `${name} does not state the course's regulatory status`);
  }
});

test("every module has an applied item, five engagement items, and five remediation items", () => {
  assert.equal(Object.keys(MODULE_BANK).length, 15);
  for (const id of VIRGINIA_MODULE_IDS) {
    const bank = MODULE_BANK[id];
    assert.ok(bank, `${id} has no bank`);
    assert.ok(bank.applied?.prompt, `${id} has no applied item`);
    assert.equal(bank.engagement.length, 5, `${id} engagement count`);
    assert.equal(bank.remediation.length, 5, `${id} remediation count`);
  }
});

test("every authored item is well formed and its rationale is not a restatement of the answer", () => {
  for (const [id, bank] of Object.entries(MODULE_BANK)) {
    for (const item of [bank.applied, ...bank.engagement, ...bank.remediation]) {
      assert.ok(item.prompt.length > 20, `${id}: prompt too short`);
      assert.equal(item.choices.length, 4, `${id}: every item carries four choices`);
      assert.equal(new Set(item.choices).size, 4, `${id}: duplicate choice text`);
      assert.equal(item.correctChoice, 0, `${id}: authored correct answer must sit at index 0`);
      assert.ok(item.rationale.length > 40, `${id}: rationale too short to teach anything`);
      assert.notEqual(item.rationale.trim(), item.choices[0].trim(), `${id}: rationale merely repeats the answer`);
    }
  }
});

test("delivery permutes the choices and the permutation is stable", () => {
  /* Authoring puts the correct answer first. If delivery did not move it, every answer would
     be the first option and the assessment would measure nothing. */
  const landings = [0, 0, 0, 0];
  let total = 0;
  for (const id of VIRGINIA_MODULE_IDS) {
    for (const kind of ["applied", "engagement", "remediation"]) {
      for (const item of getVirginiaAssessment(id, kind).items) {
        landings[item.correctChoice] += 1;
        total += 1;
      }
    }
  }
  assert.equal(total, 165, "the bank is 15 modules of one applied, five engagement and five remediation items");
  /* With four choices an even permutation leaves about a quarter of the correct answers at
     index 0. What this asserts is that delivery permutes at all and spreads across every
     position — not that the hash produces a perfectly flat distribution. */
  assert.ok(landings[0] < total * 0.45, `${landings[0]} of ${total} correct answers stayed at index 0`);
  for (const [index, count] of landings.entries()) {
    assert.ok(count > 0, `no item's correct answer was presented at index ${index}`);
  }

  const first = getVirginiaAssessment("module-06", "engagement");
  const second = getVirginiaAssessment("module-06", "engagement");
  assert.deepEqual(first.items.map((item) => item.choices), second.items.map((item) => item.choices),
    "the presented order must be stable, or a recorded selected_choice loses its meaning");
});

test("the student payload carries no answer key", () => {
  for (const id of VIRGINIA_MODULE_IDS) {
    for (const kind of ["applied", "engagement", "remediation"]) {
      const payload = publicVirginiaAssessment(getVirginiaAssessment(id, kind));
      const serialised = JSON.stringify(payload);
      assert.doesNotMatch(serialised, /correctChoice/, `${id}/${kind} leaks correctChoice`);
      assert.doesNotMatch(serialised, /rationale/, `${id}/${kind} leaks rationale`);
    }
  }
});

test("scoring rejects an answer that was never given rather than coercing it to choice 0", () => {
  /* Number(null), Number(""), Number(false) and Number([]) are all 0. A coerced read would
     write a selection the student never made into a permanent record. */
  const assessment = getVirginiaAssessment("module-01", "engagement");
  for (const bad of [null, "", false, [], undefined, {}, "2.5", "-1", NaN]) {
    const answers = assessment.items.map(() => 0);
    answers[2] = bad;
    assert.equal(scoreVirginiaAssessment(assessment, answers), null,
      `scoring accepted ${JSON.stringify(bad)} as a selection`);
  }
  assert.equal(scoreVirginiaAssessment(assessment, [0, 0]), null, "wrong answer count must be rejected");
  assert.equal(scoreVirginiaAssessment(null, [0]), null);
});

test("scoring reads a digit string from a form post and applies the 80 percent threshold", () => {
  const assessment = getVirginiaAssessment("module-01", "engagement");
  const allRight = assessment.items.map((item) => String(item.correctChoice));
  const perfect = scoreVirginiaAssessment(assessment, allRight);
  assert.equal(perfect.percent, 100);
  assert.equal(perfect.passed, true);

  const fourOfFive = assessment.items.map((item, index) =>
    index === 0 ? (item.correctChoice + 1) % item.choices.length : item.correctChoice);
  const near = scoreVirginiaAssessment(assessment, fourOfFive);
  assert.equal(near.percent, 80);
  assert.equal(near.passed, true, "80 percent is the StateCourse threshold and must pass");

  const threeOfFive = assessment.items.map((item, index) =>
    index < 2 ? (item.correctChoice + 1) % item.choices.length : item.correctChoice);
  assert.equal(scoreVirginiaAssessment(assessment, threeOfFive).passed, false);
});

test("finishing every module completes the instruction but not the course", () => {
  /* The monitored final is administered after the sixtieth hour and outside instructional
     time. A student who has finished the instruction has not finished the course, and
     collapsing the two is how a certificate issues for something that did not happen. */
  const credit = virginiaCreditedClassHours(allComplete);
  assert.equal(credit.creditedClassHours, 60);
  assert.equal(credit.creditedInstructionalMinutes, 3000);
  assert.equal(credit.instructionComplete, true);
  assert.equal(credit.courseComplete, false);
  assert.equal(credit.certificateEligible, false);
  assert.match(credit.certificateBlockedBy, /monitored final assessment/);
  assert.deepEqual(credit.subjectsCovered.length, 25);
});

test("the approval gate stands above the final assessment", () => {
  const passed = virginiaCreditedClassHours(allComplete, { finalAssessmentPassed: true });
  assert.equal(passed.courseComplete, true);
  assert.equal(passed.certificateEligible, false);
  assert.match(passed.certificateBlockedBy, /no Virginia Real Estate Board course approval number/i);

  const approved = virginiaCreditedClassHours(allComplete, { finalAssessmentPassed: true, approvalNumber: "PENDING-EXAMPLE" });
  assert.equal(approved.certificateEligible, true);
  assert.equal(approved.certificateBlockedBy, null);
});

test("partial completion credits only the completed modules and names the shortfall", () => {
  const partial = virginiaCreditedClassHours(allComplete.slice(0, 9), { finalAssessmentPassed: true, approvalNumber: "X" });
  assert.equal(partial.completedModules, 9);
  assert.equal(partial.creditedClassHours, 36);
  assert.equal(partial.instructionComplete, false);
  assert.equal(partial.certificateEligible, false);
  assert.match(partial.certificateBlockedBy, /36 of 60/);
});

test("a module state that is not 'completed' credits nothing", () => {
  const inProgress = VIRGINIA_MODULE_IDS.map((id) => ({ module_id: id, status: "in_progress" }));
  assert.equal(virginiaCreditedClassHours(inProgress).creditedClassHours, 0);
  assert.equal(virginiaCreditedClassHours([]).creditedClassHours, 0);
  assert.equal(virginiaCreditedClassHours(undefined).creditedClassHours, 0);
});

test("the course payload separates Board requirements from StateCourse decisions", () => {
  /* 18VAC135-20-400 allocates no hours and sets no passing score. A reviewer reading the JSON
     must not mistake either for a Board requirement. */
  assert.equal(course.contentAuthority, "18VAC135-20-400");
  assert.ok(course.stateCourseDecisions.length >= 3);
  const joined = course.stateCourseDecisions.join(" ");
  assert.match(joined, /allocates no hours among them/);
  assert.match(joined, /prescribes no passing score/);
  assert.match(course.approvalStatus, /Not approved/);
});

test("the retention periods are recorded with their sources and are all three years", () => {
  const entries = Object.values(VIRGINIA_RETENTION_YEARS);
  assert.equal(entries.length, 4);
  for (const entry of entries) {
    assert.equal(entry.years, 3);
    assert.ok(entry.source, "every retention period must name the section it comes from");
  }
  assert.equal(VIRGINIA_RETENTION_YEARS.brokerageAgreements.source, "18VAC135-20-185 C 1");
  assert.equal(VIRGINIA_RETENTION_YEARS.relationshipDisclosures.source, "§ 54.1-2138 D");
  assert.equal(VIRGINIA_RETENTION_YEARS.supervisionRecords.source, "§ 54.1-2110.1 B 7");
});

test("unknown identifiers return nothing rather than a default course", () => {
  assert.equal(getVirginiaCourse("mi-salesperson-prelicensure-40-v1"), null);
  assert.equal(getVirginiaModule("module-99"), null);
  assert.equal(getVirginiaAssessment("module-99", "engagement"), null);
  assert.equal(getVirginiaAssessment("module-01", "not-a-kind"), null);
  assert.equal(publicVirginiaAssessment(null), null);
  assert.equal(VIRGINIA_COURSE_ID, "va-salesperson-principles-v1");
});

test("the delivery rules and the course engine cannot drift apart", () => {
  /* Two files state the course's shape: config/virginia-course-engine.mjs, which is the
     regulatory model, and lib/course-compliance.mjs, which the portal enforces per hour. If
     they disagree, one of them is lying to a reviewer. */
  assert.equal(VIRGINIA_COURSE_RULES.courseId, VIRGINIA_COURSE_ID);
  assert.equal(VIRGINIA_COURSE_RULES.courseVersion, course.version);
  assert.equal(VIRGINIA_COURSE_RULES.requiredHours, course.requiredClassHours);
  assert.equal(
    VIRGINIA_COURSE_RULES.requiredActiveSeconds,
    course.minutesPerClassHour * 60,
    "the per-hour active-time requirement must equal a Virginia class hour of 50 minutes"
  );
  assert.equal(VIRGINIA_COURSE_RULES.approvalStatus, "submission_draft");
  assert.equal(VIRGINIA_COURSE_RULES.finalExamRequiresAllHours, true,
    "the monitored final is administered after the sixtieth hour");
});
