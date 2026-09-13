import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  ALASKA_CONTACT_HOUR_MINUTES,
  ALASKA_MODULE_IDS,
  alaskaCreditedContactHours,
  getAlaskaAssessment,
  getAlaskaCourse,
  getAlaskaModule,
  publicAlaskaAssessment,
  scoreAlaskaAssessment
} from "../config/alaska-course-engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const courseConfig = JSON.parse(read("config/courses/alaska-salesperson-v1.json"));
const registry = JSON.parse(read("public/statecourse/data/state-registry.json"));
const alaska = registry.states.find((state) => state.state_code === "AK");

/* 12 AAC 64.063(c), as the Commission wrote it. The test states the rule independently
   of the engine so that an edit to the engine cannot quietly redefine the outline. */
const PRESCRIBED_OUTLINE = Object.freeze([
  ["module-01", 6],
  ["module-02", 4],
  ["module-03", 4],
  ["module-04", 4],
  ["module-05", 8],
  ["module-06", 6],
  ["module-07", 6],
  ["module-08", 2]
]);

test("the course delivers the outline 12 AAC 64.063(c) prescribes, hour for hour", () => {
  const course = getAlaskaCourse();
  assert.equal(course.requiredContactHours, 40);
  assert.equal(course.moduleCount, PRESCRIBED_OUTLINE.length);
  assert.equal(course.outlineCitation, "12 AAC 64.063(c)");
  for (const [moduleId, contactHours] of PRESCRIBED_OUTLINE) {
    const module = getAlaskaModule(moduleId);
    assert.ok(module, `${moduleId} is missing from the course`);
    assert.equal(module.contactHours, contactHours, `${moduleId} must carry ${contactHours} contact hours`);
    assert.equal(courseConfig.module_contact_hours[moduleId], contactHours, `${moduleId} disagrees with the catalogue`);
  }
  const total = PRESCRIBED_OUTLINE.reduce((sum, [, hours]) => sum + hours, 0);
  assert.equal(total, 40);
  assert.equal(courseConfig.required_hours, 40);
  assert.equal(alaska.prelicense_hours, 40);
});

test("a contact hour is fifty minutes and every module's floor follows from that", () => {
  /* 12 AAC 64.063(g)(1). If this number ever drifts, every hour claim in the submission
     package drifts with it, so it is asserted rather than assumed. */
  assert.equal(ALASKA_CONTACT_HOUR_MINUTES, 50);
  assert.equal(courseConfig.minutes_per_contact_hour, 50);
  for (const module of getAlaskaCourse().modules) {
    assert.equal(module.minimumMinutes, module.contactHours * 50, `${module.id} minimum minutes`);
  }
});

test("one instructional section per contact hour, with a worked checkpoint in each", () => {
  for (const module of getAlaskaCourse().modules) {
    const text = read(module.curriculumPath);
    const sections = [...text.matchAll(/^## \d+\. /gm)];
    assert.equal(
      sections.length,
      module.contactHours,
      `${module.id} has ${sections.length} sections for ${module.contactHours} contact hours`
    );
    const checkpoints = [...text.matchAll(/^#### Checkpoint /gm)];
    assert.equal(checkpoints.length, module.contactHours, `${module.id} checkpoint count`);
    const answers = [...text.matchAll(/^\*Answer:\*/gm)];
    assert.equal(answers.length, module.contactHours, `${module.id} every checkpoint must be worked`);
    assert.match(text, /## Learning objectives/, `${module.id} states no learning objectives`);
    assert.match(text, /## Module assessment/, `${module.id} has no module assessment`);
    assert.match(text, new RegExp(`12 AAC 64\\.063\\(c\\)\\(${module.sequence}\\)`), `${module.id} does not cite its topic`);
  }
});

test("every module states its contact hours and repeats the 50-minute definition or the outline total", () => {
  for (const module of getAlaskaCourse().modules) {
    const text = read(module.curriculumPath);
    assert.match(
      text,
      new RegExp(`\\*\\*Contact hours:\\*\\* ${module.contactHours}\\b`),
      `${module.id} does not state its contact hours in the header`
    );
    assert.match(
      text,
      new RegExp(`carries ${module.contactHours} of the 40 contact hours prescribed by 12 AAC 64\\.063\\(c\\)`),
      `${module.id} does not tie its hours back to the prescribed total`
    );
  }
});

test("no curriculum module claims Alaska certification", () => {
  for (const module of getAlaskaCourse().modules) {
    const text = read(module.curriculumPath);
    assert.match(text, /Not certified/, `${module.id} must carry the uncertified status line`);
    assert.doesNotMatch(text, /\bstate[- ]approved\b/i, `${module.id} must not claim approval`);
  }
  assert.equal(getAlaskaCourse().courseApprovalNumber, null);
  assert.equal(courseConfig.approval_number, null);
  assert.equal(courseConfig.enrollment_enabled, false);
  assert.equal(alaska.approval_status ?? null, null);
});

test("the mastery threshold is labelled a provider standard wherever it appears", () => {
  /* Alaska prescribes no passing score for in-course assessment. Every document stating
     80 percent has to say whose standard it is. */
  for (const module of getAlaskaCourse().modules) {
    const text = read(module.curriculumPath);
    assert.match(text, /80 percent/, `${module.id} states no mastery threshold`);
    assert.match(text, /StateCourse instructional standard/, `${module.id} does not name whose standard it is`);
    assert.match(
      text,
      /rather than an Alaska requirement|Alaska prescribes no passing score/,
      `${module.id} does not say Alaska prescribes no passing score`
    );
  }
});

test("every module has an applied item, five engagement items, and five remediation items", () => {
  for (const moduleId of ALASKA_MODULE_IDS) {
    const applied = getAlaskaAssessment(moduleId, "applied");
    const engagement = getAlaskaAssessment(moduleId, "engagement");
    const remediation = getAlaskaAssessment(moduleId, "remediation");
    assert.ok(applied && engagement && remediation, `${moduleId} is missing an assessment kind`);
    assert.equal(applied.items.length, 1, `${moduleId} applied`);
    assert.equal(engagement.items.length, 5, `${moduleId} engagement`);
    assert.equal(remediation.items.length, 5, `${moduleId} remediation`);
    assert.equal(applied.passingPercent, 100);
    assert.equal(engagement.passingPercent, 80);
    for (const item of [...applied.items, ...engagement.items, ...remediation.items]) {
      assert.equal(item.choices.length, 4, `${item.id} must offer four choices`);
      assert.equal(new Set(item.choices).size, 4, `${item.id} has duplicate choices`);
      assert.ok(item.rationale && item.rationale.length > 40, `${item.id} needs a real rationale`);
    }
  }
});

test("remediation items are different items, not the engagement items reordered", () => {
  for (const moduleId of ALASKA_MODULE_IDS) {
    const engagement = new Set(getAlaskaAssessment(moduleId, "engagement").items.map((item) => item.prompt));
    for (const item of getAlaskaAssessment(moduleId, "remediation").items) {
      assert.ok(!engagement.has(item.prompt), `${moduleId} remediation repeats an engagement prompt`);
    }
  }
});

test("choice order is permuted deterministically and the correct answer is not always first", () => {
  const firstIsCorrect = [];
  for (const moduleId of ALASKA_MODULE_IDS) {
    for (const kind of ["applied", "engagement", "remediation"]) {
      const once = getAlaskaAssessment(moduleId, kind);
      const twice = getAlaskaAssessment(moduleId, kind);
      assert.deepEqual(once.items.map((item) => item.choices), twice.items.map((item) => item.choices),
        `${moduleId} ${kind} must present the same order every time so a recorded selection keeps its meaning`);
      for (const item of once.items) firstIsCorrect.push(item.correctChoice === 0);
    }
  }
  const alwaysFirst = firstIsCorrect.every(Boolean);
  assert.equal(alwaysFirst, false, "authoring order must not survive into delivery");
});

test("the student payload never carries an answer key", () => {
  for (const moduleId of ALASKA_MODULE_IDS) {
    for (const kind of ["applied", "engagement", "remediation"]) {
      const serialized = JSON.stringify(publicAlaskaAssessment(getAlaskaAssessment(moduleId, kind)));
      const payload = JSON.parse(serialized);
      for (const item of payload.items) {
        const keys = Object.keys(item);
        assert.deepEqual(keys.sort(), ["choices", "id", "prompt"], `${item.id} exposes ${keys.join(", ")}`);
      }
    }
  }
});

test("scoring accepts only a complete, well-formed answer set", () => {
  const assessment = getAlaskaAssessment("module-05", "engagement");
  const correct = assessment.items.map((item) => item.correctChoice);
  const scored = scoreAlaskaAssessment(assessment, correct);
  assert.equal(scored.percent, 100);
  assert.equal(scored.passed, true);
  assert.equal(scoreAlaskaAssessment(assessment, correct.slice(1)), null, "short answer sets are rejected");
  assert.equal(scoreAlaskaAssessment(assessment, correct.map(() => 9)), null, "out-of-range choices are rejected");
  assert.equal(scoreAlaskaAssessment(assessment, correct.map(() => null)), null, "non-integers are rejected");

  const oneWrong = [...correct];
  oneWrong[0] = (oneWrong[0] + 1) % assessment.items[0].choices.length;
  const partial = scoreAlaskaAssessment(assessment, oneWrong);
  assert.equal(partial.percent, 80);
  assert.equal(partial.passed, true, "80 percent is the threshold, so 80 passes");

  const twoWrong = [...oneWrong];
  twoWrong[1] = (twoWrong[1] + 1) % assessment.items[1].choices.length;
  assert.equal(scoreAlaskaAssessment(assessment, twoWrong).passed, false);
});

test("credit is all-or-nothing per module and sums the Commission's own hour figures", () => {
  const none = alaskaCreditedContactHours([], {});
  assert.equal(none.creditedContactHours, 0);
  assert.equal(none.instructionComplete, false);

  /* module-05 alone is 8 hours; module-08 alone is 2. A count-times-a-constant model
     would get both wrong, which is why the engine sums. */
  assert.equal(alaskaCreditedContactHours([{ module_id: "module-05", status: "completed" }], {}).creditedContactHours, 8);
  assert.equal(alaskaCreditedContactHours([{ module_id: "module-08", status: "completed" }], {}).creditedContactHours, 2);

  const inProgress = ALASKA_MODULE_IDS.map((id) => ({ module_id: id, status: "in_progress" }));
  assert.equal(alaskaCreditedContactHours(inProgress, {}).creditedContactHours, 0,
    "a module part-done credits nothing");

  const all = ALASKA_MODULE_IDS.map((id) => ({ module_id: id, status: "completed" }));
  const complete = alaskaCreditedContactHours(all, {});
  assert.equal(complete.creditedContactHours, 40);
  assert.equal(complete.creditedMinimumMinutes, 2000);
  assert.equal(complete.instructionComplete, true);
});

test("finishing every module does not complete the course, because 12 AAC 64.430(b) requires an instructor", () => {
  const all = ALASKA_MODULE_IDS.map((id) => ({ module_id: id, status: "completed" }));

  const instructionOnly = alaskaCreditedContactHours(all, {});
  assert.equal(instructionOnly.instructionComplete, true);
  assert.equal(instructionOnly.courseComplete, false, "machine scoring cannot satisfy 12 AAC 64.430(b)");
  assert.equal(instructionOnly.certificateEligible, false);
  assert.match(instructionOnly.certificateBlockedBy, /12 AAC 64\.430\(b\)/);

  const graded = alaskaCreditedContactHours(all, { instructor_graded_instrument_status: "graded" });
  assert.equal(graded.courseComplete, true);
  assert.equal(graded.certificateEligible, false, "12 AAC 64.410(a)(8) evaluation is still outstanding");
  assert.match(graded.certificateBlockedBy, /12 AAC 64\.410\(a\)\(8\)/);

  const evaluated = alaskaCreditedContactHours(all, {
    instructor_graded_instrument_status: "graded",
    instructor_evaluation_status: "completed"
  });
  assert.equal(evaluated.certificateEligible, false, "no certificate without a course approval number");
  assert.match(evaluated.certificateBlockedBy, /12 AAC 64\.410\(a\)\(9\)/);

  const eligible = alaskaCreditedContactHours(all, {
    instructor_graded_instrument_status: "graded",
    instructor_evaluation_status: "completed",
    course_approval_number: "AK-EXAMPLE-0000"
  });
  assert.equal(eligible.certificateEligible, true);
  assert.equal(eligible.certificateBlockedBy, null);
});

test("no certificate can issue while the course is uncertified", () => {
  /* The catalogue holds no approval number, so the live configuration can never reach
     certificateEligible. This is the coupling that keeps the platform honest. */
  const all = ALASKA_MODULE_IDS.map((id) => ({ module_id: id, status: "completed" }));
  const live = alaskaCreditedContactHours(all, {
    instructor_graded_instrument_status: "graded",
    instructor_evaluation_status: "completed",
    course_approval_number: courseConfig.approval_number
  });
  assert.equal(courseConfig.approval_number, null);
  assert.equal(live.certificateEligible, false);
  assert.match(live.certificateBlockedBy, /12 AAC 64\.410\(a\)\(9\)/);
});

test("the catalogue does not describe the instructor-graded instrument as a state final examination", () => {
  assert.equal(courseConfig.completion_rules.final_exam_required_by_state, false);
  assert.equal(courseConfig.completion_rules.proctoring_required_by_state, false);
  assert.equal(courseConfig.completion_rules.instructor_graded_instrument_required, true);
  assert.match(courseConfig._completion_rules_notes.instructor_graded_instrument_required, /12 AAC 64\.430\(b\)/);
  assert.match(courseConfig._completion_rules_notes.final_exam_required_by_state, /different thing/);
});

test("the curriculum teaches AS 08.88.405 as written, since it is where Alaska departs from most states", () => {
  const module05 = read("alaska/ak-salesperson-prelicense-40-v1/curriculum/module-05.md");
  assert.match(module05, /AS 08\.88\.405/);
  assert.match(module05, /Notwithstanding AS 08\.08/);
  assert.match(module05, /may prepare real property contracts, earnest money agreements, leases/);
  /* and bounded by the duty to route legal questions */
  assert.match(module05, /AS 08\.88\.620\(3\)/);
});

test("the two foreclosure routes are taught with their actual Alaska consequences", () => {
  const module06 = read("alaska/ak-salesperson-prelicense-40-v1/curriculum/module-06.md");
  assert.match(module06, /AS 34\.20\.100/, "the deficiency prohibition must be cited");
  assert.match(module06, /AS 34\.20\.090\(a\)/, "the redemption default must be cited");
  assert.match(module06, /AS 09\.45\.180/, "judicial deficiency by execution must be cited");
  assert.match(module06, /AS 09\.35\.250/, "the 12-month redemption period must be cited");
});

test("the landlord tenant material carries the Alaska deposit figures and deadlines", () => {
  const module07 = read("alaska/ak-salesperson-prelicense-40-v1/curriculum/module-07.md");
  assert.match(module07, /AS 34\.03\.070\(a\)/);
  assert.match(module07, /two months' periodic rent/);
  assert.match(module07, /\$2,000 a month/);
  assert.match(module07, /12 AAC 64\.560/, "the licensee-specific consequence must be taught");
});

test("fair housing teaches the Alaska classes federal law does not reach", () => {
  const module08 = read("alaska/ak-salesperson-prelicense-40-v1/curriculum/module-08.md");
  assert.match(module08, /AS 18\.80\.240/);
  assert.match(module08, /marital status/i);
  assert.match(module08, /12 AAC 64\.130\(19\)/, "a fair housing violation is a licence matter");
  assert.match(module08, /2607/, "RESPA section 8 must be cited to the code");
});

test("no private authoring-bank reference or embedded correctChoice value reaches the shipped site", () => {
  const embeddedKey = /\bcorrectChoice["']?\s*[:=]\s*["']?\d+\b/;
  assert.ok(embeddedKey.test('{"correctChoice":2}'));
  assert.ok(!embeddedKey.test('render(item.correctChoice)'));
  const publicDir = path.join(root, "public/statecourse");
  const offenders = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(html|mjs|js|json|css|md|txt|map)$/.test(entry.name)) {
        const text = fs.readFileSync(full, "utf8");
        // The existing public non-credit practice intentionally includes solutions
        // and explanations. A separately authorized reviewer renderer is not an
        // embedded private authoring key. NMLS has its own stricter content gate.
        if (embeddedKey.test(text) || text.includes("module-question-bank")) offenders.push(full);
      }
    }
  };
  if (fs.existsSync(publicDir)) walk(publicDir);
  assert.deepEqual(offenders, [], "answer-key material must never be published");
});
