/*
 * The examination gates, held in the test suite.
 *
 * scripts/exam-integrity.mjs is where the gates are implemented and where a reader goes to see
 * what each one means. This file runs it, and then adds the assertions that are about the
 * gates themselves rather than about the banks — that every required gate exists, that none has been
 * softened into a percentage, and that the two defects the gates were built to find would be
 * found again.
 *
 * Both defects were real. Every examination document filed with the Department named the
 * provider "StateCourse" rather than StateCourse LLC, a fortnight after RE 336 was corrected
 * for exactly that. And eight topics across the three courses were taught in the lessons and
 * examined on neither form — a student could complete an assignment on property management
 * agreements, or on loan-to-value, and never be asked about it.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { ACADEMIC_CONTROLS, PROGRAMS } from "../config/california/regulatory-manifest.mjs";
import { PROVIDER } from "../config/california/submission-facts.mjs";
import { getCaliforniaFinalExam, publicAssessment } from "../config/california-course-engine.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");

const report = (() => {
  try {
    return JSON.parse(execFileSync("node", ["scripts/exam-integrity.mjs", "--json"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
  } catch (error) {
    return JSON.parse(error.stdout);
  }
})();

const GATE_NAMES = [
  "NO_UNSOURCED_EXAM_QUESTIONS",
  "NO_DUPLICATE_A_B_QUESTIONS",
  "NO_FORMATIVE_FINAL_OVERLAP",
  "100_PERCENT_ANSWER_KEY_TRACEABILITY",
  "100_PERCENT_REQUIRED_TOPIC_COVERAGE",
  "EXAM_DOCUMENTS_MATCH_THE_BANK",
];

test("every required examination gate exists, including formative/final separation", () => {
  for (const name of GATE_NAMES) {
    assert.ok(Object.hasOwn(report.gates, name), `${name} is no longer reported`);
  }
});

test("every gate passes", () => {
  for (const name of GATE_NAMES) {
    assert.ok(report.gates[name].pass, `${name}:\n  ${report.gates[name].failures.join("\n  ")}`);
  }
});

test("a gate is a pass or a fail, never a percentage", () => {
  /* "97 percent traceable" is three items a reviewer can ask about and nobody can answer. The
     gates are named for the property they hold, and a property either holds or it does not. */
  for (const name of GATE_NAMES) {
    assert.equal(typeof report.gates[name].pass, "boolean");
  }
});

test("the gates read every authored item across every form", () => {
  const expected = PROGRAMS.length * 2 * ACADEMIC_CONTROLS.finalExamMinimumQuestions;
  assert.equal(report.counts.items, expected, `${report.counts.items} items read against ${expected} authored`);
  assert.equal(report.counts.forms, PROGRAMS.length * 2);
});

test("every examination document names the provider by its legal name", () => {
  /* The defect: "StateCourse" is not an entity. Eighteen documents carried it into a filing
     package while RE 336 next to them carried "StateCourse LLC". */
  assert.equal(PROVIDER.legalName, "StateCourse LLC");
  for (const program of PROGRAMS) {
    for (const name of ["form-a-student", "form-a-answer-key", "form-b-student", "form-b-answer-key", "student-instructions", "proctor-instructions"]) {
      const file = path.join(ROOT, `california/${program.courseId}/submission/final-exam-${name}.md`);
      const text = fs.readFileSync(file, "utf8");
      assert.match(text, /\*\*Provider:\*\* StateCourse LLC/, `${program.title} ${name} does not name the provider correctly`);
    }
  }
});

test("the generator reads the legal name rather than carrying a copy of it", () => {
  const source = fs.readFileSync(path.join(ROOT, "scripts/generate-california-final-exam-package.mjs"), "utf8");
  assert.match(source, /\$\{PROVIDER\.legalName\}/);
  assert.doesNotMatch(source, /`\*\*Provider:\*\* State/, "the provider name is typed into the generator again");
});

test("the retake is a different examination, not the same one reordered", () => {
  /* RE 303 permits one retake "on different questions". A form that reordered the same hundred
     items would satisfy a naive check and none of the purpose: the retake exists so a student
     who failed has to know the material rather than remember which letter they chose. */
  for (const program of PROGRAMS) {
    const formA = getCaliforniaFinalExam(program.catalogId, "A");
    const formB = getCaliforniaFinalExam(program.catalogId, "B");
    assert.ok(formA && formB, `${program.title} does not serve both forms`);
    const prompts = new Set(formA.items.map((item) => item.prompt));
    for (const item of formB.items) {
      assert.ok(!prompts.has(item.prompt), `${program.title}: form B repeats a form A question`);
    }
  }
});

test("every served item carries its source, and the student is served none of it", () => {
  for (const program of PROGRAMS) {
    for (const form of ["A", "B"]) {
      const exam = getCaliforniaFinalExam(program.catalogId, form);
      for (const item of exam.items) {
        assert.ok(item.source?.assignment && item.source?.section, `${program.title} ${form} ${item.id} lost its source at serve time`);
      }
      const served = publicAssessment(exam);
      const encoded = JSON.stringify(served);
      assert.doesNotMatch(encoded, /"source"/, "the student payload carries the answer key reference");
      assert.doesNotMatch(encoded, /"rationale"/, "the student payload carries the rationale");
      assert.doesNotMatch(encoded, /"correctChoice"/, "the student payload carries the correct answer");
    }
  }
});

test("permutation moves the correct answer off index 0 without changing which choice is correct", () => {
  /* The banks author the correct answer first; the engine permutes per item id. If the two ever
     disagreed the printed key would name a different choice from the one scored. */
  for (const program of PROGRAMS) {
    const exam = getCaliforniaFinalExam(program.catalogId, "A");
    const positions = new Set(exam.items.map((item) => item.correctChoice));
    assert.ok(positions.size > 1, `${program.title}: every correct answer is served at the same index`);
    for (const item of exam.items) {
      assert.ok(item.correctChoice >= 0 && item.correctChoice < item.choices.length);
    }
  }
});

test("the answer key document names the same subsection the bank does", () => {
  /* The printed instructor version is generated from the same engine call the portal makes, so
     the two cannot drift — but "cannot" is a claim, and this is the check of it. */
  for (const program of PROGRAMS) {
    for (const form of ["A", "B"]) {
      const exam = getCaliforniaFinalExam(program.catalogId, form);
      const file = path.join(ROOT, `california/${program.courseId}/submission/final-exam-form-${form.toLowerCase()}-answer-key.md`);
      const text = fs.readFileSync(file, "utf8");
      const printed = [...text.matchAll(/Found in the course material at:\*\* Assignment (\d\d) \([^)]*\), section ([\d.]+)/g)];
      assert.equal(printed.length, exam.items.length, `${program.title} form ${form}: ${printed.length} references for ${exam.items.length} items`);
      for (const [index, item] of exam.items.entries()) {
        assert.equal(`assignment-${printed[index][1]}`, item.source.assignment, `${program.title} ${form} item ${index + 1}: assignment reference differs`);
        assert.equal(printed[index][2], String(item.source.section), `${program.title} ${form} item ${index + 1}: section reference differs`);
      }
    }
  }
});

test("no answer key reaches the published site", () => {
  const build = fs.readFileSync(path.join(ROOT, "site/build.sh"), "utf8");
  assert.match(build, /final-exam-bank\|answer-key/, "the build no longer refuses to publish an answer key");
});
