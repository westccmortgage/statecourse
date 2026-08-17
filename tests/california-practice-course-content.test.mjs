import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { getCaliforniaAssessment, publicAssessment } from "../config/california-course-engine.mjs";
import { PRACTICE_ASSESSMENT_COUNT } from "../config/california-practice-assessments.mjs";

test("California Real Estate Practice uses 45 assignment-specific assessment items", () => {
  assert.equal(PRACTICE_ASSESSMENT_COUNT, 45);
  const prompts = new Set();
  for (let sequence = 1; sequence <= 15; sequence += 1) {
    const assignmentId = `assignment-${String(sequence).padStart(2, "0")}`;
    for (const kind of ["applied", "engagement", "remediation"]) {
      const assessment = getCaliforniaAssessment("ca-real-estate-practice-45", assignmentId, kind);
      assert.ok(assessment.prompt.length > 45);
      assert.equal(assessment.choices.length, 4);
      assert.ok(assessment.correctChoice >= 0 && assessment.correctChoice <= 3);
      assert.ok(assessment.rationale.length > 45);
      assert.equal(new Set(assessment.choices).size, 4);
      prompts.add(assessment.prompt);
      const student = publicAssessment(assessment);
      assert.equal("correctChoice" in student, false);
      assert.equal("rationale" in student, false);
    }
  }
  assert.equal(prompts.size, 45);
});

test("Practice Assignments 01 and 02 are editorially rewritten content", () => {
  const first = fs.readFileSync("california/ca-real-estate-practice-45-v1/curriculum/lesson-01.md", "utf8");
  const second = fs.readFileSync("california/ca-real-estate-practice-45-v1/curriculum/lesson-02.md", "utf8");
  assert.match(first, /Business and Professions Code section 10131/);
  assert.match(first, /Commissioner’s Regulation 2725/);
  assert.match(first, /Unlicensed administrative assistants/);
  assert.match(second, /Business and Professions Code section 10140\.6/);
  assert.match(second, /team name/);
  assert.match(second, /antitrust/i);
  assert.match(second, /digitally altered property images/i);
  assert.doesNotMatch(first + second, /is studied as an operating concept, not as a vocabulary label/);
});
