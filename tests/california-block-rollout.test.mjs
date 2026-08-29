/**
 * CA-BLOCK rollout tests — every registered delivery, one contract.
 *
 * The pilot suite (california-block-learning.test.mjs) proves the model on Assignment 1 and the
 * shared player/endpoint/database apparatus. This suite proves each ROLLED-OUT assignment against
 * the same invariants by iterating the registry, so registering assignment N automatically brings
 * it under test: full coverage of its frozen lesson, sections mapped one-to-one, practice
 * problems 1–8 each owned by exactly one screen, and a complete formative retrieval bank.
 * The regulatory layer is asserted untouched by the pilot suite and stays out of scope here.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { assertCoverage, sliceLessonRange } from "../config/california-block-engine.mjs";
import { BLOCK_DELIVERIES, RETRIEVAL_BANKS } from "../config/california/california-block-registry.mjs";
import { MORTGAGE_BLOCK_SPECS } from "../config/california/mortgage-block-specs.mjs";
import { PRINCIPLES_BLOCK_SPECS } from "../config/california/principles-block-specs.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const COURSE_ID = "ca-mortgage-loan-brokering-lending-45";

/* Every California course this rollout can reach, keyed by its own hand-authored spec module —
   generalized so this suite proves each registered course against the same invariants, exactly
   like it already does across assignments within one course. Practice joins this map once its own
   *-block-specs.mjs exists (task: author Practice's block specs and retrieval banks). */
const SPECS_BY_COURSE = {
  [COURSE_ID]: MORTGAGE_BLOCK_SPECS,
  "ca-real-estate-principles-45": PRINCIPLES_BLOCK_SPECS,
};

const lessonFor = (delivery) => {
  const number = delivery.assignmentId.replace("assignment-", "");
  const file = path.join(ROOT, "california", `${delivery.courseId}-v1`, "curriculum", `lesson-${number}.md`);
  return fs.readFileSync(file, "utf8");
};

/* Generated deliveries are Mortgage assignments 2+; the Mortgage pilot keeps its own hand-authored
   shape. Every Principles/Practice assignment (including its "assignment-01") is generated the
   same way the rest of the rollout is — there is no separate hand-typed pilot format for them. */
const generated = BLOCK_DELIVERIES.filter((delivery) => !(delivery.courseId === COURSE_ID && delivery.assignmentId === "assignment-01"));

test("the registry registers the pilot plus only generated deliveries with a hand-authored spec, in order per course", () => {
  assert.ok(BLOCK_DELIVERIES.length >= 2, "rollout must extend past the pilot");
  for (const courseId of new Set(BLOCK_DELIVERIES.map((delivery) => delivery.courseId))) {
    const ids = BLOCK_DELIVERIES.filter((delivery) => delivery.courseId === courseId).map((delivery) => delivery.assignmentId);
    assert.deepEqual(ids, [...ids].sort(), `${courseId}: deliveries registered in assignment order`);
  }
  for (const delivery of BLOCK_DELIVERIES) assert.ok(SPECS_BY_COURSE[delivery.courseId], `${delivery.courseId} is not a recognized California course id`);
  for (const delivery of generated) {
    const number = Number(delivery.assignmentId.replace("assignment-", ""));
    assert.ok(SPECS_BY_COURSE[delivery.courseId][number], `${delivery.assignmentId} registered without a hand-authored spec`);
  }
});

test("every registered delivery tiles its entire frozen lesson — no content disappears", () => {
  for (const delivery of BLOCK_DELIVERIES) {
    const lesson = lessonFor(delivery);
    const coverage = assertCoverage(delivery, lesson);
    assert.equal(coverage.lines, lesson.replace(/\r/g, "").split("\n").length, delivery.assignmentId);
    for (const block of delivery.blocks) {
      for (const screen of block.screens) {
        if (screen.content) {
          assert.ok(sliceLessonRange(lesson, screen.content, screen.id).trim().length > 0, `${screen.id} slices empty content`);
        }
      }
    }
  }
});

test("every generated delivery maps the six lesson sections one-to-one and closes with B7 synthesis", () => {
  for (const delivery of generated) {
    const prefix = delivery.blocks[0].id.replace(/-b\d+$/, ""); /* course-agnostic: "a2", "pr1", etc. */
    assert.deepEqual(delivery.blocks.map((block) => block.sequence), delivery.blocks.map((_, index) => index + 1), delivery.assignmentId);
    const sections = delivery.blocks.flatMap((block) => block.sourceSections || []);
    assert.deepEqual([...sections].sort(), [1, 2, 3, 4, 5, 6], `${delivery.assignmentId}: sections must each belong to exactly one block`);
    const last = delivery.blocks[delivery.blocks.length - 1];
    assert.equal(last.id, `${prefix}-b7`, `${delivery.assignmentId} must close with the synthesis block`);
    assert.equal(last.regulatoryMastery, true, `${last.id} must derive mastery from the regulatory assignment record`);
    for (const block of delivery.blocks) {
      assert.ok(block.id.startsWith(`${prefix}-b`), block.id);
      assert.doesNotMatch(block.id, /^assignment-/);
      assert.ok(block.learningObjective.length > 40, `${block.id} has no real learning objective`);
    }
  }
});

test("practice problems 1–8 each belong to exactly one screen of each generated delivery", () => {
  for (const delivery of generated) {
    const problems = delivery.blocks
      .flatMap((block) => block.screens)
      .filter((screen) => screen.type === "practice")
      .map((screen) => screen.practiceProblem);
    assert.deepEqual([...problems].sort(), [1, 2, 3, 4, 5, 6, 7, 8], `${delivery.assignmentId}: eight problems, one owner each`);
  }
});

test("every substantive block of every delivery has a complete formative retrieval pair", () => {
  for (const delivery of BLOCK_DELIVERIES) {
    for (const block of delivery.blocks) {
      if (block.regulatoryMastery) continue;
      const retrieval = block.screens.filter((screen) => screen.type === "retrieval");
      assert.equal(retrieval.length, 1, `${block.id}: exactly one retrieval screen`);
      const primary = RETRIEVAL_BANKS[retrieval[0].questionId];
      const replacement = RETRIEVAL_BANKS[primary.replacementId];
      const screenIds = new Set(block.screens.map((screen) => screen.id));
      for (const item of [primary, replacement]) {
        assert.equal(item.blockId, block.id);
        assert.equal(item.correctChoice, 0, `${item.blockId}: correct answer authored at index 0`);
        assert.equal(item.choices.length, 4, `${item.blockId}: four choices`);
        assert.ok(screenIds.has(item.remediationScreen), `${item.blockId}: remediation screen must exist in the block`);
        assert.ok(item.rationale.length > 80, `${item.blockId}: rationale too thin to teach`);
      }
      assert.equal(primary.concept, replacement.concept, `${block.id}: replacement must test the same concept`);
      assert.notEqual(primary.prompt, replacement.prompt, `${block.id}: replacement must be a different question`);
    }
  }
});

test("retrieval prompts are unique across the whole rollout — no recycled questions", () => {
  const prompts = Object.values(RETRIEVAL_BANKS).map((item) => item.prompt);
  assert.equal(new Set(prompts).size, prompts.length);
});
