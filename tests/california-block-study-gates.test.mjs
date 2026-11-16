import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

import { A1_BLOCKS } from "../config/california/mortgage-a1-blocks.mjs";
import {
  getCourseConfiguration,
  getCourseDelivery,
  renderableCourseIds,
} from "../config/course-registry.mjs";
import {
  earlierDeliveryPosition,
  firstUnmetStudyGate,
  screenStudyGate,
  timedScreens,
} from "../config/california-block-study-gates.mjs";

test("a three-hour California assignment puts time on learning screens, not one-question checks", () => {
  const screens = timedScreens(A1_BLOCKS);
  assert.equal(screens.length, 37);
  const gates = screens.map((screen) => screenStudyGate(A1_BLOCKS, 180, screen.screenId, 0));
  assert.equal(gates.reduce((sum, gate) => sum + gate.allocatedSeconds, 0), 180 * 60);
  assert.equal(gates.at(-1).requiredCumulativeSeconds, 180 * 60);
  const retrievalGates = screens
    .map((screen, index) => ({ screen, gate: gates[index] }))
    .filter(({ screen }) => screen.screenType === "retrieval")
    .map(({ gate }) => gate);
  assert.equal(retrievalGates.length, 6);
  assert.ok(retrievalGates.every((gate) => gate.allocatedSeconds === 120));
  assert.ok(gates[0].allocatedSeconds > retrievalGates[0].allocatedSeconds);
});

test("two minutes cannot unlock instruction, and each reached retrieval check needs only two minutes", () => {
  const first = screenStudyGate(A1_BLOCKS, 180, "a1-b1-s1", 120);
  const firstCheck = screenStudyGate(A1_BLOCKS, 180, "a1-b1-s4", 0);
  assert.equal(first.ready, false);
  assert.ok(first.remainingSeconds > 120);
  assert.equal(firstCheck.allocatedSeconds, 120);
  assert.equal(firstCheck.requiredCumulativeSeconds,
    screenStudyGate(A1_BLOCKS, 180, "a1-b1-s3", 0).requiredCumulativeSeconds + 120);
  assert.deepEqual(
    firstUnmetStudyGate(A1_BLOCKS, 180, 120),
    { blockId: "a1-b1", screenId: "a1-b1-s1", ...first },
  );
});

test("mortgage pages use measured reading and task effort instead of equal time by screen type", () => {
  const first = screenStudyGate(A1_BLOCKS, 180, "a1-b1-s1", 0);
  const short = screenStudyGate(A1_BLOCKS, 180, "a1-b2-s2", 0);
  const current = screenStudyGate(A1_BLOCKS, 180, "a1-b1-s3", 0);
  const long = screenStudyGate(A1_BLOCKS, 180, "a1-b6-s4", 0);
  assert.ok(short.allocatedSeconds < first.allocatedSeconds);
  assert.ok(current.allocatedSeconds >= 195 && current.allocatedSeconds <= 215);
  assert.ok(long.allocatedSeconds > current.allocatedSeconds);
  assert.equal(screenStudyGate(A1_BLOCKS, 180, "a1-b7-s3", 0).allocatedSeconds, 180);
  assert.equal(screenStudyGate(A1_BLOCKS, 180, "a1-b7-s4", 0).allocatedSeconds, 600);
});

test("the next screen opens only when its cumulative active-study threshold is reached", () => {
  const first = screenStudyGate(A1_BLOCKS, 180, "a1-b1-s1", 0);
  const firstAtThreshold = screenStudyGate(A1_BLOCKS, 180, "a1-b1-s1", first.allocatedSeconds);
  const secondAtSameTime = screenStudyGate(A1_BLOCKS, 180, "a1-b1-s2", first.allocatedSeconds);
  assert.equal(firstAtThreshold.ready, true);
  assert.equal(secondAtSameTime.ready, false);
  assert.equal(firstUnmetStudyGate(A1_BLOCKS, 180, first.allocatedSeconds).screenId, "a1-b1-s2");
});

test("every California assignment keeps its full time while every retrieval check stays at two minutes", () => {
  for (const courseId of renderableCourseIds()) {
    const course = getCourseConfiguration(courseId);
    if (course?.state !== "CA") continue;
    for (const assignment of course.assignments) {
      const delivery = getCourseDelivery(courseId, assignment.id);
      const screens = timedScreens(delivery);
      const gates = screens.map((screen) => screenStudyGate(delivery, assignment.expectedMinutes, screen.screenId, 0));
      assert.equal(gates.reduce((sum, gate) => sum + gate.allocatedSeconds, 0), assignment.expectedMinutes * 60,
        `${courseId} ${assignment.id} total`);
      assert.equal(gates.at(-1).requiredCumulativeSeconds, assignment.expectedMinutes * 60,
        `${courseId} ${assignment.id} cumulative total`);
      screens.forEach((screen, index) => {
        if (screen.screenType === "retrieval") {
          assert.equal(gates[index].allocatedSeconds, 120, `${courseId} ${assignment.id} ${screen.screenId}`);
        }
      });
    }
  }
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
  assert.match(client, /setInterval\(tickVisualTimer, 1000\)/);
  assert.match(client, /visualGateRemaining\(\) === 0 && currentStudyGateRemaining\(\) > 0/);
  assert.match(client, /Confirming recorded study time/);
  assert.match(client, /for \(const block of blocks\(\)\) for \(const screen of block\.screens\)/);
  assert.match(client, /next\.disabled = needsAction \|\| currentStudyGateRemaining\(\) > 0/);
  assert.match(blocksApi, /assertStudyGate\(ctx, delivery, nav, regulatory, screen\)/);
  assert.match(blocksApi, /assertStudyGate\(ctx, delivery, nav, regulatory, retrievalScreen\)/);
  assert.match(blocksApi, /status\.status === "MASTERED" && !blockTimeReady \? "IN_PROGRESS"/);
  assert.match(courseApi, /assertAssessmentStudyGate\(ctx, assignmentId, row, kind\)/);
  assert.match(courseApi, /activeTimeSatisfied/);
});
