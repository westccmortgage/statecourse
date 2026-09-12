import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import {
  getCourseConfiguration, getCourseDelivery, hasCourseDelivery, renderableCourseIds,
} from "../config/course-registry.mjs";
import { applyConsoleVideos } from "../netlify/functions/_lib/console-video-overlay.mjs";

/*
 * A student path that is not California-only.
 *
 * What was actually wrong: the machinery generalised fine, the lookup did not. So these
 * assert that the lookup resolves each state to its own configuration, that California is
 * unchanged by the change, and above all that Texas did not inherit California's
 * regulatory posture on the way through.
 */

test("both states resolve, and each to its own configuration", { concurrency: false }, () => {
  const tx = getCourseConfiguration("tx-law-of-agency-30-v1");
  const ca = getCourseConfiguration("ca-real-estate-principles-45");
  assert.equal(tx.state, "TX");
  assert.equal(ca.state, "CA");
  assert.equal(tx.regulator, "Texas Real Estate Commission");
  assert.equal(tx.requiredHours, 30);
  assert.equal(ca.requiredHours, 45);
  assert.equal(tx.assignments.length, 12);
  assert.equal(ca.assignments.length, 15);
});

test("Texas did not inherit California's regulatory posture", { concurrency: false }, () => {
  const tx = getCourseConfiguration("tx-law-of-agency-30-v1");
  /* Straight from the frozen Texas record. Rendering a course for study must not switch
     on credit, certificates or the examination. */
  assert.equal(tx.approvalStatus, "NOT_SUBMITTED_NOT_APPROVED");
  assert.equal(tx.enrollmentEnabled, false);
  assert.equal(tx.creditReportingEnabled, false);
  assert.equal(tx.certificateIssuanceEnabled, false);
  assert.equal(tx.finalExaminationAdministrable, false);
});

test("Texas timing comes from TREC's own allocation, not California's rule", { concurrency: false }, () => {
  const tx = getCourseConfiguration("tx-law-of-agency-30-v1");
  const total = tx.assignments.reduce((sum, a) => sum + a.expectedMinutes, 0);
  assert.equal(total, 1500, "TREC prescribes 30 clock hours across the twelve topics");
  assert.equal(tx.minimumElapsedHours, 30);
  /* Each topic keeps its own prescribed minutes rather than an average. */
  assert.equal(tx.assignments[0].expectedMinutes, 130);
  assert.equal(tx.assignments[1].expectedMinutes, 125);
});

test("every Texas assignment resolves a delivery unit and a lesson file", { concurrency: false }, async () => {
  const tx = getCourseConfiguration("tx-law-of-agency-30-v1");
  for (const assignment of tx.assignments) {
    assert.ok(hasCourseDelivery(tx.courseId, assignment.id), `${assignment.id} has no delivery`);
    const delivery = getCourseDelivery(tx.courseId, assignment.id);
    assert.equal(delivery.assignmentId, assignment.id, "callers read assignmentId whichever state answered");
    assert.ok(delivery.blocks.length > 0);
    assert.match(assignment.contentPath, /^\/content\/texas\/tx-law-of-agency-30-v1\/module-\d{2}\.md$/);
    const onDisk = new URL(`../texas/tx-law-of-agency-30-v1/curriculum/${assignment.id}.md`, import.meta.url);
    assert.ok((await readFile(onDisk, "utf8")).length > 0, `${assignment.id}.md is empty`);
  }
});

test("California still resolves exactly as before", { concurrency: false }, () => {
  for (const courseId of [
    "ca-real-estate-principles-45", "ca-real-estate-practice-45", "ca-mortgage-loan-brokering-lending-45",
  ]) {
    const config = getCourseConfiguration(courseId);
    assert.equal(config.state, "CA");
    assert.ok(hasCourseDelivery(courseId, "assignment-01"));
    assert.ok(getCourseDelivery(courseId, "assignment-01").blocks.length > 0);
  }
});

test("an unknown course resolves to nothing rather than to a default", { concurrency: false }, () => {
  assert.equal(getCourseConfiguration("no-such-course"), null);
  assert.equal(hasCourseDelivery("no-such-course", "module-01"), false);
  assert.equal(getCourseDelivery("tx-law-of-agency-30-v1", "module-99"), null);
});

test("the enrolment's state must agree with its course", { concurrency: false }, async () => {
  const source = await readFile(new URL("../netlify/functions/student-course.mjs", import.meta.url), "utf8");
  /* Stricter than the check it replaced: a row whose state and course disagree is refused
     rather than served under the wrong jurisdiction's rules. */
  assert.match(source, /enrollment\.state !== course\.state/);
  assert.match(source, /enrollment_state_does_not_match_course/);
  assert.equal(source.includes('enrollment.state !== "CA"'), false);
  assert.equal(source.includes("getCaliforniaCourse(enrollment.course_id)"), false);
});

test("the loading shell does not label a non-California course as California", { concurrency: false }, async () => {
  const [html, client] = await Promise.all([
    readFile(new URL("../public/statecourse/student/course/index.html", import.meta.url), "utf8"),
    readFile(new URL("../public/statecourse/student/course/student-course.js", import.meta.url), "utf8"),
  ]);
  assert.match(html, /<small>Student course<\/small>/);
  assert.match(html, /Opening your course record…/);
  assert.match(client, /Opening your course record…/);
  assert.equal(html.includes("California student course"), false);
  assert.equal((html + client).includes("Opening your California course record"), false);
});

test("the block player resolves delivery through the registry, not California", { concurrency: false }, async () => {
  const source = await readFile(new URL("../netlify/functions/student-blocks.mjs", import.meta.url), "utf8");
  assert.match(source, /getCourseDelivery\(ctx\.course\.courseId, assignmentId\)/);
  assert.equal(/getBlockDelivery\(ctx\.course\.courseId/.test(source), false);
});

test("a placed video overlays a Texas screen the same way it overlays a California one", { concurrency: false }, () => {
  const delivery = getCourseDelivery("tx-law-of-agency-30-v1", "module-02");
  const entry = {
    provider: "cloudflare-stream", assetKey: "tx-iabs-1-2-document-overview",
    label: "IABS overview", duration: "3:15", required: false, nonBlocking: true, autoplay: false,
  };
  const merged = applyConsoleVideos(delivery.blocks, new Map([["t02u5-s1", entry]]));
  const screen = merged.flatMap((b) => b.screens).find((s) => s.id === "t02u5-s1");
  assert.equal(screen.videos.length, 1);
  assert.equal(screen.videos[0].assetKey, "tx-iabs-1-2-document-overview");
});

test("the renderable set is the courses that actually have both halves", { concurrency: false }, () => {
  const ids = renderableCourseIds();
  assert.ok(ids.includes("tx-law-of-agency-30-v1"));
  assert.equal(ids.length, 4);
  for (const id of ids) {
    assert.ok(getCourseConfiguration(id), `${id} claims to render with no configuration`);
  }
});
