import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import MODULE_BANK from "../config/north-carolina/module-question-bank.mjs";
import {
  NORTH_CAROLINA_FINAL_EXAM_ITEM_COUNT,
  NORTH_CAROLINA_FINAL_EXAM_PASSING_PERCENT,
  NORTH_CAROLINA_FINAL_EXAM_TIME_LIMIT_MINUTES,
  NORTH_CAROLINA_FINAL_EXAM_VERSION,
  NORTH_CAROLINA_PROTECTED_FINAL_FORMS,
  prepareNorthCarolinaFinalExam,
  validateNorthCarolinaProtectedFinal,
} from "../config/north-carolina/protected-final/final-exam.mjs";

const normalize = (value) => String(value ?? "").normalize("NFKC").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function answerKeyFor(exam) {
  const authored = new Map(NORTH_CAROLINA_PROTECTED_FINAL_FORMS[exam.form].map((item) => [item.id, item.choices[0]]));
  return Object.fromEntries(exam.questions.map((item) => [item.id, item.choices.indexOf(authored.get(item.id))]));
}

test("the protected bank has two comprehensive 48-item provider forms", () => {
  assert.deepEqual(validateNorthCarolinaProtectedFinal(), {
    forms: 2,
    itemsPerForm: 48,
    totalItems: 96,
    sectionsPerForm: 16,
    itemsPerSection: 3,
    passingPercent: 75,
    timeLimitMinutes: 180,
  });
  assert.equal(NORTH_CAROLINA_FINAL_EXAM_ITEM_COUNT, 48);
  assert.equal(NORTH_CAROLINA_FINAL_EXAM_PASSING_PERCENT, 75);
  assert.equal(NORTH_CAROLINA_FINAL_EXAM_TIME_LIMIT_MINUTES, 180);
  assert.match(NORTH_CAROLINA_FINAL_EXAM_VERSION, /^NC-FINAL-DRAFT-/);
  for (const form of Object.values(NORTH_CAROLINA_PROTECTED_FINAL_FORMS)) {
    const counts = new Map();
    for (const item of form) counts.set(item.section, (counts.get(item.section) ?? 0) + 1);
    assert.equal(counts.size, 16);
    assert.ok([...counts.values()].every((count) => count === 3));
  }
});

test("the protected source hash is frozen in the review audit", () => {
  const source = readFileSync(new URL("../config/north-carolina/protected-final/final-exam.mjs", import.meta.url));
  const audit = readFileSync(new URL("../north-carolina/submission/22-protected-final-exam-audit.md", import.meta.url), "utf8");
  const hash = createHash("sha256").update(source).digest("hex");
  assert.match(audit, new RegExp(hash));
});

test("no final item repeats a formative prompt or another final prompt", () => {
  const formative = new Set(Object.values(MODULE_BANK).flatMap((module) => [module.applied, ...module.engagement, ...module.remediation].map((item) => normalize(item.prompt))));
  const finalPrompts = new Set();
  for (const item of Object.values(NORTH_CAROLINA_PROTECTED_FINAL_FORMS).flat()) {
    assert.equal(formative.has(normalize(item.prompt)), false, item.id);
    assert.equal(finalPrompts.has(normalize(item.prompt)), false, item.id);
    finalPrompts.add(normalize(item.prompt));
  }
  assert.equal(finalPrompts.size, 96);
});

test("an attempt requires a persisted seed and never serializes the key or rationale", () => {
  for (const bad of [undefined, null, "", "short", 123]) {
    assert.throws(() => prepareNorthCarolinaFinalExam({ form: "A", attemptSeed: bad }));
  }
  assert.throws(() => prepareNorthCarolinaFinalExam({ form: "C", attemptSeed: "attempt-seed-000001" }));
  const exam = prepareNorthCarolinaFinalExam({ form: "A", attemptSeed: "attempt-seed-000001" });
  const serialized = JSON.stringify(exam);
  assert.doesNotMatch(serialized, /correctChoice|rationale|curriculumReference/);
  for (const item of exam.questions) assert.deepEqual(Object.keys(item).sort(), ["choices", "id", "prompt", "section"]);
});

test("the same seed replays exactly and a different seed changes the presentation", () => {
  const first = prepareNorthCarolinaFinalExam({ form: "B", attemptSeed: "attempt-seed-000001" });
  const replay = prepareNorthCarolinaFinalExam({ form: "B", attemptSeed: "attempt-seed-000001" });
  const different = prepareNorthCarolinaFinalExam({ form: "B", attemptSeed: "attempt-seed-000002" });
  assert.deepEqual(first.questions, replay.questions);
  assert.notDeepEqual(first.questions, different.questions);
});

test("each attempt balances displayed answer positions exactly", () => {
  for (const form of ["A", "B"]) {
    const exam = prepareNorthCarolinaFinalExam({ form, attemptSeed: `answer-balance-${form}-0001` });
    const answers = answerKeyFor(exam);
    const counts = [0, 0, 0, 0];
    for (const answer of Object.values(answers)) counts[answer] += 1;
    assert.deepEqual(counts, [12, 12, 12, 12]);
  }
});

test("36 of 48 passes at 75 percent and 35 does not", () => {
  const exam = prepareNorthCarolinaFinalExam({ form: "A", attemptSeed: "scoring-boundary-0001" });
  const perfect = answerKeyFor(exam);
  assert.deepEqual(exam.grade(perfect), { correct: 48, total: 48, percent: 100, passed: true, missed: [] });

  const ids = exam.questions.map((item) => item.id);
  const thirtySix = { ...perfect };
  for (const id of ids.slice(0, 12)) thirtySix[id] = (thirtySix[id] + 1) % 4;
  const boundary = exam.grade(thirtySix);
  assert.equal(boundary.correct, 36);
  assert.equal(boundary.total, 48);
  assert.equal(boundary.percent, 75);
  assert.equal(boundary.passed, true);
  assert.deepEqual([...boundary.missed].sort(), ids.slice(0, 12).sort());

  const thirtyFive = { ...thirtySix, [ids[12]]: (thirtySix[ids[12]] + 1) % 4 };
  const failed = exam.grade(thirtyFive);
  assert.equal(failed.correct, 35);
  assert.equal(failed.percent, 73);
  assert.equal(failed.passed, false);
});

test("grading refuses incomplete, extra, and invalid answers", () => {
  const exam = prepareNorthCarolinaFinalExam({ form: "B", attemptSeed: "invalid-answer-set-0001" });
  const answers = answerKeyFor(exam);
  const [first] = exam.questions;
  const missing = { ...answers };
  delete missing[first.id];
  assert.throws(() => exam.grade(missing));
  assert.throws(() => exam.grade({ ...answers, unexpected: 0 }));
  assert.throws(() => exam.grade({ ...answers, [first.id]: "0" }));
  assert.throws(() => exam.grade({ ...answers, [first.id]: 4 }));
});

test("public application code does not import the protected examination", () => {
  const appFiles = [
    "../app/page.tsx",
    "../app/api/course/route.ts",
    "../public/statecourse/app.js",
  ];
  for (const relative of appFiles) {
    const text = readFileSync(new URL(relative, import.meta.url), "utf8");
    assert.doesNotMatch(text, /north-carolina\/protected-final|north-carolina-final-exam/i, relative);
  }
});

test("the public North Carolina framework matches the controlling 72-plus-3 course structure", () => {
  const frameworks = JSON.parse(readFileSync(new URL("../public/statecourse/data/launch-course-frameworks.json", import.meta.url), "utf8"));
  const course = frameworks.courses.find((candidate) => candidate.course_id === "nc-broker-prelicensing-75-v1");
  assert.ok(course);
  const instruction = course.modules.filter((module) => module.id !== "NCB-FINAL");
  const final = course.modules.find((module) => module.id === "NCB-FINAL");
  assert.equal(instruction.length, 16);
  assert.equal(instruction.reduce((sum, module) => sum + module.hours, 0), 72);
  assert.deepEqual(instruction.map((module) => module.syllabus_section), ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"]);
  assert.equal(instruction.find((module) => module.id === "NCB-16").integrated_across_sections, true);
  assert.equal(final.hours, 3);
  assert.equal(final.inside_required_total, true);
  assert.equal(final.passing_percent, 75);
  assert.equal(final.provider_draft_items_per_form, 48);
  assert.equal(instruction.reduce((sum, module) => sum + module.licence_exam_items, 0), 140);
});
