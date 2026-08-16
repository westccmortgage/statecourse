import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  VIRGINIA_COURSE_RULES, applyHeartbeat, canAccessHour, finalizeHour, hourRequirements,
  markSectionViewed, newHourProgress, submitPrimaryAssessment, submitRemediationAssessment,
} from "../lib/course-compliance.mjs";

function completeInstruction(progress) {
  progress = markSectionViewed(progress, "objectives");
  progress = markSectionViewed(progress, "instruction");
  progress = markSectionViewed(progress, "sequence");
  return { ...progress, activityComplete: true };
}

function accrueFiftyActiveMinutes(progress) {
  let previous = { at: 0 };
  for (let index = 1; index <= 150; index += 1) {
    const current = { at: index * 20_000, role: "student", complianceCreditEligible: true, visible: true, focused: true, connected: true, secondsSinceInteraction: 0 };
    progress = applyHeartbeat(progress, previous, current);
    previous = current;
  }
  return progress;
}

test("Student A: a 30-minute idle gap receives no backfilled active credit", () => {
  let progress = newHourProgress(1);
  const previous = { at: 0 };
  progress = applyHeartbeat(progress, previous, { at: 1_800_000, role: "student", complianceCreditEligible: true, visible: true, focused: true, connected: true, secondsSinceInteraction: 1_800 });
  assert.equal(progress.activeSeconds, 0);
  assert.equal(hourRequirements(progress).completed, false);
});

test("Student B: instruction, activity, 50 active minutes, and correct check complete Hour 01 and unlock Hour 02", () => {
  let progress = completeInstruction(newHourProgress(1));
  progress = accrueFiftyActiveMinutes(progress);
  progress = submitPrimaryAssessment(progress, true);
  progress = finalizeHour(progress, "2026-08-16T00:00:00.000Z");
  assert.equal(progress.activeSeconds, 3_000);
  assert.ok(progress.completedAt);
  assert.equal(canAccessHour({ role: "student", requestedHour: 2, completedHours: [1], currentHour: 2 }), true);
  assert.equal(canAccessHour({ role: "student", requestedHour: 37, completedHours: [1], currentHour: 2 }), false);
});

test("Student C: missed check triggers remediation; viewed explanation plus correct alternate item completes Hour 01", () => {
  let progress = accrueFiftyActiveMinutes(completeInstruction(newHourProgress(1)));
  progress = submitPrimaryAssessment(progress, false);
  assert.equal(progress.remediationTriggered, true);
  assert.equal(hourRequirements(progress).completed, false);
  progress = { ...progress, remediationContentViewed: true };
  progress = submitRemediationAssessment(progress, true);
  progress = finalizeHour(progress, "2026-08-16T00:00:00.000Z");
  assert.ok(progress.completedAt);
});

test("Regulator can open any hour, bypasses time, and never receives completion credit", () => {
  let progress = newHourProgress(37);
  progress = applyHeartbeat(progress, { at: 0 }, { at: 20_000, role: "regulator", complianceCreditEligible: false, visible: true, focused: true, connected: true, secondsSinceInteraction: 0 });
  assert.equal(progress.activeSeconds, 0);
  assert.equal(canAccessHour({ role: "regulator", requestedHour: 60, completedHours: [], currentHour: 1 }), true);
  assert.equal(finalizeHour(progress).completedAt, null);
});

test("Virginia rules are course scoped and preserve the exact course version", async () => {
  const config = JSON.parse(await readFile(new URL("../config/courses/virginia-salesperson-v1.json", import.meta.url), "utf8"));
  assert.equal(config.course_id, VIRGINIA_COURSE_RULES.courseId);
  assert.equal(config.course_version, VIRGINIA_COURSE_RULES.courseVersion);
  assert.equal(config.completion_rules.required_instructional_minutes_per_hour, 50);
  assert.match(config.configuration_scope, /Virginia only/);
  const route = await readFile(new URL("../app/api/course/route.ts", import.meta.url), "utf8");
  assert.match(route, /APPROVAL_STATUS === "approved"/);
});

test("student interface has no manual preview-completion control and hides expected rationale before submission", async () => {
  const app = await readFile(new URL("../public/statecourse/app.js", import.meta.url), "utf8");
  assert.match(app, /isStudent\(\) \? \"\" : .*Mark as previewed/);
  assert.match(app, /questionOnly/);
  assert.doesNotMatch(app, /Expected answer and rationale:/);
  assert.match(app, /Next hour locked/);
  assert.match(app, /Regulatory Review Mode/);
});
