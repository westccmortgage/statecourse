import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (relative) => readFile(new URL(relative, root), "utf8");

test("Michigan is visible in production while approval and enrollment remain closed", async () => {
  const [catalogUi, enrollmentUi, coursePage] = await Promise.all([
    read("public/statecourse/catalog.js"),
    read("public/statecourse/enrollment.js"),
    read("public/statecourse/real-estate/michigan/pre-license/principles-of-real-estate/index.html"),
  ]);

  assert.match(catalogUi, /MI: "Real Estate Salesperson Pre-License · 40 hours"/);
  assert.match(enrollmentUi, /mi-salesperson-prelicensure-40-v1/);
  assert.match(coursePage, /Michigan Principles of Real Estate/);
  assert.match(coursePage, /cannot accept a credit-eligible enrollment/i);
  assert.doesNotMatch(coursePage, /Michigan[- ]approved|Approved by Michigan|Enroll Now/i);
});

test("Michigan server catalog is a non-purchasable regulatory draft by default", async () => {
  const { getCourse, evaluateCheckoutEligibility } = await import("../config/course-catalog.mjs");
  const course = getCourse("mi-salesperson-prelicensure-40-v1");
  assert.ok(course);
  assert.equal(course.state, "MI");
  assert.equal(course.approvalStatus, "submission_draft");
  assert.equal(course.enrollmentEnabled, false);
  assert.equal(course.price.live, null);
  assert.deepEqual(evaluateCheckoutEligibility(course, "live"), {
    allowed: false,
    reason: "price_not_configured",
  });
});

test("Sites resolves generated StateCourse directory routes through their index files", async () => {
  const worker = await read("worker/index.ts");
  assert.match(worker, /url\.pathname\.startsWith\("\/statecourse\/"\)/);
  assert.match(worker, /assetUrl\.pathname = .*index\.html/);
  assert.match(worker, /env\.ASSETS\.fetch/);
  assert.match(worker, /assetResponse\.status !== 404/);
});

test("Sites keeps account actions on the canonical operational student portal", async () => {
  const [generator, studentRoute, signInRoute, registerRoute] = await Promise.all([
    read("scripts/generate-national-platform.mjs"),
    read("app/student/page.tsx"),
    read("app/student/sign-in/page.tsx"),
    read("app/student/register/page.tsx"),
  ]);

  assert.match(generator, /const studentPortalUrl = "https:\/\/statecourse\.com\/student\/sign-in\/"/);
  assert.match(generator, /const studentRegisterUrl = "https:\/\/statecourse\.com\/student\/register\/"/);
  assert.match(studentRoute, /redirect\("https:\/\/statecourse\.com\/student\/sign-in\/"\)/);
  assert.match(signInRoute, /redirect\("https:\/\/statecourse\.com\/student\/sign-in\/"\)/);
  assert.match(registerRoute, /redirect\("https:\/\/statecourse\.com\/student\/register\/"\)/);
});
