import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { evaluateCheckoutEligibility, getCourseCatalog } from "../config/course-catalog.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("regulated courses default to disabled server-authoritative checkout", () => {
  assert.equal(getCourseCatalog().length, 19);
  for (const course of getCourseCatalog()) {
    assert.equal(course.enrollmentEnabled, false);
    assert.equal(course.approvalStatus, "submission_draft");
    assert.equal(course.price.test, null);
    assert.equal(course.price.live, null);
    assert.equal(evaluateCheckoutEligibility(course, "test").allowed, false);
    assert.equal(evaluateCheckoutEligibility(course, "live").allowed, false);
  }
});

test("Missouri reporting remains in the LMS compliance layer", async () => {
  const migration = await read("../database/002_regulatory_courses_reporting.sql");
  const reportFunction = await read("../netlify/functions/admin-missouri-completion-report.mjs");
  assert.match(migration, /build_missouri_completion_time_report/);
  assert.match(migration, /percent_below_submitted_course_time/);
  assert.match(migration, /threshold_review_required/);
  assert.match(reportFunction, /requireAdmin/);
  assert.doesNotMatch(reportFunction, /stripe|payment_intent|checkout/i);
});

test("checkout authenticates the student and never accepts a browser price", async () => {
  const checkout = await read("../netlify/functions/create-checkout.mjs");
  assert.match(checkout, /resolveCheckoutStudent/);
  assert.match(checkout, /const amount = course\.price\[mode\]/);
  assert.doesNotMatch(checkout, /input\.amount|input\.price/);
  assert.match(checkout, /customer_email: student\.email/);
});

test("webhook verification and LMS compliance state stay separate", async () => {
  const webhook = await read("../netlify/functions/stripe-webhook.mjs");
  const stripe = await read("../netlify/functions/_lib/stripe.mjs");
  const migration = await read("../database/001_payments_enrollment.sql");
  assert.match(webhook, /const payload = rawBody\(event\)/);
  assert.match(stripe, /timingSafeEqual/);
  assert.match(stripe, /createHmac\("sha256", secret\)/);
  assert.match(migration, /create table if not exists (?:public\.)?lms_compliance_state/i);
  assert.doesNotMatch(webhook, /study_time|exam_eligibility|certificate_issued|regulatory_credit/i);
});

test("public payment UI contains no raw card or CVV fields", async () => {
  const enrollment = await read("../public/statecourse/enroll/index.html");
  assert.doesNotMatch(enrollment, /<input[^>]+(?:name|type)=["'][^"']*(?:card|cvv|cvc)/i);
  assert.match(enrollment, /Stripe-hosted payment/);
  assert.match(enrollment, /Stripe Checkout/);
});
