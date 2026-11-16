import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

import { A1_BLOCKS } from "../config/california/mortgage-a1-blocks.mjs";
import {
  earlierDeliveryPosition,
  firstUnmetStudyGate,
  screenStudyGate,
  timedScreens,
} from "../config/california-block-study-gates.mjs";

test("a three-hour California assignment is distributed across every teaching and assessment screen", () => {
  const screens = timedScreens(A1_BLOCKS);
  assert.equal(screens.length, 37);
  const gates = screens.map((screen) => screenStudyGate(A1_BLOCKS, 180, screen.screenId, 0));
  assert.equal(gates.reduce((sum, gate) => sum + gate.allocatedSeconds, 0), 180 * 60);
  assert.equal(gates.at(-1).requiredCumulativeSeconds, 180 * 60);
  assert.ok(gates.every((gate) => gate.allocatedSeconds >= 291 && gate.allocatedSeconds <= 292));
});

test("two minutes cannot unlock the first screen or the second block retrieval check", () => {
  const first = screenStudyGate(A1_BLOCKS, 180, "a1-b1-s1", 120);
  const secondBlockCheck = screenStudyGate(A1_BLOCKS, 180, "a1-b2-s5", 120);
  assert.equal(first.ready, false);
  assert.equal(first.remainingSeconds, 172);
  assert.equal(secondBlockCheck.ready, false);
  assert.equal(secondBlockCheck.remainingSeconds, 2508);
  assert.deepEqual(
    firstUnmetStudyGate(A1_BLOCKS, 180, 120),
    { blockId: "a1-b1", screenId: "a1-b1-s1", ...first },
  );
});

test("the next screen opens only when its cumulative active-study threshold is reached", () => {
  const firstAtThreshold = screenStudyGate(A1_BLOCKS, 180, "a1-b1-s1", 292);
  const secondAtSameTime = screenStudyGate(A1_BLOCKS, 180, "a1-b1-s2", 292);
  assert.equal(firstAtThreshold.ready, true);
  assert.equal(secondAtSameTime.ready, false);
  assert.equal(firstUnmetStudyGate(A1_BLOCKS, 180, 292).screenId, "a1-b1-s2");
});

test("resume position never skips either unfinished evidence or an unmet time gate", () => {
  const evidence = { blockId: "a1-b2", screenId: "a1-b2-s3" };
  const time = { blockId: "a1-b1", screenId: "a1-b1-s2" };
  assert.equal(earlierDeliveryPosition(A1_BLOCKS, evidence, time), time);
  assert.equal(earlierDeliveryPosition(A1_BLOCKS, time, evidence), time);
});

test("client and both server completion paths enforce the same time gate", async () => {
  const [client, blocksApi, courseApi] = await Promise.all([
    fs.readFile("public/statecourse/student/course/blocks/block-player.js", "utf8"),
    fs.readFile("netlify/functions/student-blocks.mjs", "utf8"),
    fs.readFile("netlify/functions/student-course.mjs", "utf8"),
  ]);
  assert.match(client, /Continue unlocks after/);
  assert.match(client, /next\.disabled = needsAction \|\| currentStudyGateRemaining\(\) > 0/);
  assert.match(blocksApi, /assertStudyGate\(ctx, delivery, nav, regulatory, screen\)/);
  assert.match(blocksApi, /assertStudyGate\(ctx, delivery, nav, regulatory, retrievalScreen\)/);
  assert.match(blocksApi, /status\.status === "MASTERED" && !blockTimeReady \? "IN_PROGRESS"/);
  assert.match(courseApi, /assertAssessmentStudyGate\(ctx, assignmentId, row, kind\)/);
  assert.match(courseApi, /activeTimeSatisfied/);
});
