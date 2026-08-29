/**
 * TX-BLOCK tests — the Texas Principles of Real Estate I block-delivery data layer.
 *
 * Scope matches what actually exists: a content/data-layer build with no student-facing route and
 * no regulatory course engine wired to it yet (enrollmentEnabled: false — see
 * config/texas/regulatory-manifest.mjs). These tests prove the registry's own invariants, that the
 * generated block maps tile their frozen module files with no content lost, that every unit block
 * carries a complete formative retrieval pair, and that the engine's mastery derivation is sound —
 * the same guarantees california-block-learning.test.mjs proves for California, scoped to what
 * Texas has actually built so far.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertCoverage, sliceLessonRange, getBlockDelivery, hasBlockDelivery,
  getBlockQuestion, publicBlockQuestion, scoreBlockQuestion, deriveBlockStatus, derivePosition,
} from "../config/texas-block-engine.mjs";
import { BLOCK_DELIVERIES, RETRIEVAL_BANKS } from "../config/texas/texas-block-registry.mjs";
import { UNIT_TRACE } from "../config/texas/principles-i-course.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const COURSE_ID = "tx-principles-real-estate-i-30-v1";

const lessonFor = (delivery) => {
  const file = path.join(ROOT, "texas", `${COURSE_ID}`, "curriculum", `${delivery.moduleId}.md`);
  return fs.readFileSync(file, "utf8");
};

test("the registry registers exactly the nine Principles I modules, in order", () => {
  assert.equal(BLOCK_DELIVERIES.length, 9);
  assert.deepEqual(
    BLOCK_DELIVERIES.map((d) => d.moduleId),
    Array.from({ length: 9 }, (_, i) => `module-${String(i + 1).padStart(2, "0")}`),
  );
  for (const delivery of BLOCK_DELIVERIES) assert.equal(delivery.courseId, COURSE_ID);
});

test("getBlockDelivery / hasBlockDelivery resolve by courseId + moduleId, and refuse unknown ids", () => {
  assert.ok(hasBlockDelivery(COURSE_ID, "module-01"));
  assert.equal(getBlockDelivery(COURSE_ID, "module-01").moduleId, "module-01");
  assert.equal(hasBlockDelivery(COURSE_ID, "module-99"), false);
  assert.equal(getBlockDelivery("some-other-course", "module-01"), null);
});

test("every module's screen ranges tile its entire frozen file — no source content disappears", () => {
  for (const delivery of BLOCK_DELIVERIES) {
    const lesson = lessonFor(delivery);
    const coverage = assertCoverage(delivery, lesson);
    assert.equal(coverage.lines, lesson.replace(/\r/g, "").split("\n").length, delivery.moduleId);
    for (const block of delivery.blocks) {
      for (const screen of block.screens) {
        if (screen.content) {
          assert.ok(sliceLessonRange(lesson, screen.content, screen.id).trim().length > 0, `${screen.id} slices empty content`);
        }
      }
    }
  }
});

test("every unit block matches a PRINS1-1 unit code, in file order, with a real learning objective", () => {
  const unitBlockCount = BLOCK_DELIVERIES.reduce(
    (sum, d) => sum + d.blocks.filter((b) => !b.id.endsWith("-recap")).length, 0,
  );
  assert.equal(unitBlockCount, UNIT_TRACE.length, "one block per PRINS1-1 unit, no more, no fewer");
  for (const delivery of BLOCK_DELIVERIES) {
    const unitBlocks = delivery.blocks.filter((b) => !b.id.endsWith("-recap"));
    for (const [index, block] of unitBlocks.entries()) {
      assert.equal(block.sequence, index + 1, block.id);
      assert.equal(block.id, block.code.toLowerCase(), `${block.id}: block id must be the lowercased unit code`);
      assert.ok(block.learningObjective.length > 30, `${block.id} has no real learning objective`);
    }
    const last = delivery.blocks[delivery.blocks.length - 1];
    assert.ok(last.id.endsWith("-recap"), `${delivery.moduleId} must close with a recap block`);
    assert.equal(last.screens.filter((s) => s.type === "retrieval").length, 0, "recap block carries no retrieval screen");
  }
});

test("every unit block has a complete formative retrieval pair", () => {
  for (const delivery of BLOCK_DELIVERIES) {
    for (const block of delivery.blocks) {
      const retrieval = block.screens.filter((screen) => screen.type === "retrieval");
      if (block.id.endsWith("-recap")) continue;
      assert.equal(retrieval.length, 1, `${block.id}: exactly one retrieval screen`);
      const primary = RETRIEVAL_BANKS[retrieval[0].questionId];
      const replacement = RETRIEVAL_BANKS[primary.replacementId];
      const screenIds = new Set(block.screens.map((screen) => screen.id));
      for (const item of [primary, replacement]) {
        assert.equal(item.blockId, block.id);
        assert.equal(item.correctChoice, 0, `${item.blockId}: correct answer authored at index 0`);
        assert.equal(item.choices.length, 4, `${item.blockId}: four choices`);
        assert.ok(screenIds.has(item.remediationScreen), `${item.blockId}: remediation screen must exist in the block`);
        assert.ok(item.rationale.length > 60, `${item.blockId}: rationale too thin to teach`);
      }
      assert.equal(primary.concept, replacement.concept, `${block.id}: replacement must test the same concept`);
      assert.notEqual(primary.prompt, replacement.prompt, `${block.id}: replacement must be a different question`);
    }
  }
});

test("retrieval prompts are unique across the whole bank — no recycled questions", () => {
  const prompts = Object.values(RETRIEVAL_BANKS).map((item) => item.prompt);
  assert.equal(new Set(prompts).size, prompts.length);
});

test("getBlockQuestion permutes choices deterministically and hides the key from the public payload", () => {
  const question = getBlockQuestion(COURSE_ID, "t01u1-q1");
  assert.equal(question.choices.length, 4);
  const again = getBlockQuestion(COURSE_ID, "t01u1-q1");
  assert.deepEqual(again.choices, question.choices, "same courseId+questionId permutes the same way every time");
  const publicPayload = publicBlockQuestion(question);
  assert.equal(publicPayload.correctChoice, undefined);
  assert.equal(publicPayload.rationale, undefined);
});

test("scoreBlockQuestion grades against the permuted position, not the authored index", () => {
  const question = getBlockQuestion(COURSE_ID, "t01u1-q1");
  const correctResult = scoreBlockQuestion(question, question.correctChoice);
  assert.equal(correctResult.correct, true);
  const wrongIndex = (question.correctChoice + 1) % question.choices.length;
  const wrongResult = scoreBlockQuestion(question, wrongIndex);
  assert.equal(wrongResult.correct, false);
  assert.equal(scoreBlockQuestion(question, "not-a-number"), null);
});

test("deriveBlockStatus: NOT_STARTED with no evidence, RETRIEVAL_REQUIRED once content is done", () => {
  const block = getBlockDelivery(COURSE_ID, "module-01").blocks[0];
  assert.equal(deriveBlockStatus(block, {}).status, "NOT_STARTED");
  const contentScreenIds = block.screens.filter((s) => s.type !== "retrieval").map((s) => s.id);
  assert.equal(deriveBlockStatus(block, { completedScreens: contentScreenIds }).status, "RETRIEVAL_REQUIRED");
});

test("deriveBlockStatus: a correct primary answer masters the block outright", () => {
  const block = getBlockDelivery(COURSE_ID, "module-01").blocks[0];
  const contentScreenIds = block.screens.filter((s) => s.type !== "retrieval").map((s) => s.id);
  const retrievalScreen = block.screens.find((s) => s.type === "retrieval");
  const attempts = [{ question_id: retrievalScreen.questionId, kind: "retrieval", correct: true }];
  assert.equal(deriveBlockStatus(block, { completedScreens: contentScreenIds, attempts }).status, "MASTERED");
});

test("mutation: an incorrect primary answer triggers remediation pointing at the exact instruction screen", () => {
  const block = getBlockDelivery(COURSE_ID, "module-01").blocks[0];
  const contentScreenIds = block.screens.filter((s) => s.type !== "retrieval").map((s) => s.id);
  const retrievalScreen = block.screens.find((s) => s.type === "retrieval");
  const attempts = [{ question_id: retrievalScreen.questionId, kind: "retrieval", correct: false }];
  const derived = deriveBlockStatus(block, { completedScreens: contentScreenIds, attempts });
  assert.equal(derived.status, "REMEDIATION_REQUIRED");
  assert.equal(derived.activeRemediation.remediationScreen, RETRIEVAL_BANKS[retrievalScreen.questionId].remediationScreen);
});

test("mutation: the replacement question is not even offered before the remediation review is recorded", () => {
  const block = getBlockDelivery(COURSE_ID, "module-01").blocks[0];
  const contentScreenIds = block.screens.filter((s) => s.type !== "retrieval").map((s) => s.id);
  const retrievalScreen = block.screens.find((s) => s.type === "retrieval");
  const primary = RETRIEVAL_BANKS[retrievalScreen.questionId];
  const beforeReview = deriveBlockStatus(block, {
    completedScreens: contentScreenIds,
    attempts: [{ question_id: retrievalScreen.questionId, kind: "retrieval", correct: false }],
  });
  assert.equal(beforeReview.activeRemediation.replacementQuestionId, null, "replacement id must not open before the review is recorded");
  const afterReview = deriveBlockStatus(block, {
    completedScreens: contentScreenIds,
    attempts: [
      { question_id: retrievalScreen.questionId, kind: "retrieval", correct: false },
      { kind: "remediation_review", screen_id: retrievalScreen.id },
    ],
  });
  assert.equal(afterReview.activeRemediation.replacementQuestionId, primary.replacementId);
});

test("mutation: reviewing remediation then answering the replacement correctly masters the block", () => {
  const block = getBlockDelivery(COURSE_ID, "module-01").blocks[0];
  const contentScreenIds = block.screens.filter((s) => s.type !== "retrieval").map((s) => s.id);
  const retrievalScreen = block.screens.find((s) => s.type === "retrieval");
  const primary = RETRIEVAL_BANKS[retrievalScreen.questionId];
  const attempts = [
    { question_id: retrievalScreen.questionId, kind: "retrieval", correct: false },
    { kind: "remediation_review", screen_id: retrievalScreen.id },
    { question_id: primary.replacementId, kind: "replacement", correct: true },
  ];
  assert.equal(deriveBlockStatus(block, { completedScreens: contentScreenIds, attempts }).status, "MASTERED");
});

test("mutation: dropping a screen range breaks the coverage invariant loudly", () => {
  const delivery = getBlockDelivery(COURSE_ID, "module-01");
  const lesson = lessonFor(delivery);
  const mutated = { ...delivery, blocks: delivery.blocks.slice(1) };
  assert.throws(() => assertCoverage(mutated, lesson), /coverage does not start at the top/);
});

test("derivePosition resumes at the first unmastered block, or at the remediation screen when one is active", () => {
  const delivery = getBlockDelivery(COURSE_ID, "module-01");
  const notStarted = new Map(delivery.blocks.map((b) => [b.id, { status: "NOT_STARTED", activeRemediation: null }]));
  const freshPosition = derivePosition(delivery, notStarted, new Map());
  assert.equal(freshPosition.blockId, delivery.blocks[0].id);
  assert.equal(freshPosition.screenId, delivery.blocks[0].screens[0].id);

  const remediationScreenId = RETRIEVAL_BANKS[delivery.blocks[0].screens.find((s) => s.type === "retrieval").questionId].remediationScreen;
  const withRemediation = new Map(delivery.blocks.map((b, i) => [
    b.id,
    i === 0
      ? { status: "REMEDIATION_REQUIRED", activeRemediation: { screenId: `${b.id}-remediation`, remediationScreen: remediationScreenId, reviewed: false, replacementQuestionId: null } }
      : { status: "NOT_STARTED", activeRemediation: null },
  ]));
  const remediationPosition = derivePosition(delivery, withRemediation, new Map());
  assert.equal(remediationPosition.remediation, true);
  assert.equal(remediationPosition.screenId, remediationScreenId);
});

test("no item in the bank claims TREC approval or enrollment/credit status", () => {
  for (const item of Object.values(RETRIEVAL_BANKS)) {
    const text = `${item.prompt} ${item.rationale}`.toLowerCase();
    assert.doesNotMatch(text, /trec[- ]approved|approved by trec|texas real estate commission has approved/);
  }
});
