import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (relative) => readFile(new URL(relative, root), "utf8");

test("Michigan is visible in production while approval and enrollment remain closed", async () => {
  const [catalogUi, enrollmentUi, statePage, coursePage] = await Promise.all([
    read("public/statecourse/catalog.js"),
    read("public/statecourse/enrollment.js"),
    read("public/statecourse/real-estate/michigan/index.html"),
    read("public/statecourse/real-estate/michigan/pre-license/principles-of-real-estate/index.html"),
  ]);

  assert.match(catalogUi, /MI: "Real Estate Salesperson Pre-License · 40 hours"/);
  assert.match(enrollmentUi, /mi-salesperson-prelicensure-40-v1/);
  assert.match(enrollmentUi, /Principles of Real Estate - Michigan Salesperson Prelicensure/);
  assert.match(enrollmentUi, /Michigan LARA Bureau of Professional Licensing and Michigan LEO Post Secondary Schools/);
  assert.match(coursePage, /Principles of Real Estate - Michigan Salesperson Prelicensure/);
  assert.match(coursePage, /Enrollment, study time, credit, and certificates remain unavailable/i);
  assert.match(coursePage, /StateCourse LLC/);
  assert.match(coursePage, /407 N Pacific Coast Highway, Unit 1028/);
  assert.match(coursePage, /PSS school licensure\/program approval and LARA BPL course\/instructor approval are pending/);
  assert.match(coursePage, /No account is needed/);
  assert.match(statePage, /No account or payment is required/);
  assert.match(coursePage, /development and regulatory-status record\. Enrollment is unavailable\./);
  assert.doesNotMatch(coursePage, /course record and enrollment path/i);
  assert.doesNotMatch(coursePage, /student\/register\/\?(?:state=MI|course=mi-salesperson)|Create (?:a )?Free Account|account can track/i);
  assert.doesNotMatch(statePage, /student\/register\/\?state=MI|Create (?:a )?Free Account|follow the Michigan course record/i);
  assert.doesNotMatch(coursePage, /return_to=(?:%2F|\/)enroll/i);
  assert.doesNotMatch(coursePage, /Complete Stripe Checkout|Open the purchased course|Continue to enrollment/);
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
  assert.match(worker, /await servePublicAssets\(request, env\.ASSETS\)/);
  const { servePublicAssets } = await import("../worker/public-assets.mjs");
  for (const prefix of ["", "/statecourse"]) {
    let actualPath;
    const result = await servePublicAssets(new Request(`https://statecourse-course.crdpartners2020.chatgpt.site${prefix}/real-estate/michigan/`), {
      fetch: async (request) => { actualPath = new URL(request.url).pathname; return new Response("Michigan course page"); },
    });
    assert.equal(actualPath, "/statecourse/real-estate/michigan/index.html");
    assert.equal(await result.text(), "Michigan course page");
  }
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
