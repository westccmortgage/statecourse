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

test("Practice Assignments 01 through 05 are editorially rewritten content", () => {
  const first = fs.readFileSync("california/ca-real-estate-practice-45-v1/curriculum/lesson-01.md", "utf8");
  const second = fs.readFileSync("california/ca-real-estate-practice-45-v1/curriculum/lesson-02.md", "utf8");
  const third = fs.readFileSync("california/ca-real-estate-practice-45-v1/curriculum/lesson-03.md", "utf8");
  const fourth = fs.readFileSync("california/ca-real-estate-practice-45-v1/curriculum/lesson-04.md", "utf8");
  const fifth = fs.readFileSync("california/ca-real-estate-practice-45-v1/curriculum/lesson-05.md", "utf8");
  assert.match(first, /Business and Professions Code section 10131/);
  assert.match(first, /Commissioner’s Regulation 2725/);
  assert.match(first, /Unlicensed administrative assistants/);
  assert.match(second, /Business and Professions Code section 10140\.6/);
  assert.match(second, /team name/);
  assert.match(second, /antitrust/i);
  assert.match(second, /digitally altered property images/i);
  assert.match(third, /Civil Code section 2079\.14/);
  assert.match(third, /dual agency/i);
  assert.match(third, /2079\.21/);
  assert.match(fourth, /24 months/);
  assert.match(fourth, /12 months/);
  assert.match(fourth, /listing agreement/i);
  assert.match(fourth, /open house/i);
  assert.match(fifth, /price per square foot/i);
  assert.match(fifth, /Bureau of Real Estate Appraisers/);
  assert.match(fifth, /Business and Professions Code section 11345\.4/);
  assert.match(fifth, /valuation bias/i);
  assert.match(fifth, /seller net/i);
  assert.doesNotMatch(first + second + third + fourth + fifth, /is studied as an operating concept, not as a vocabulary label/);
});
