import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PRICING } from "../config/california/submission-facts.mjs";
import {
  CALIFORNIA_COMPLIMENTARY_COMPONENTS,
  COMPLIMENTARY_DISCLOSURE,
  getCourse,
  getPackage,
  packageAllocation,
} from "../config/course-catalog.mjs";
import {
  FULL_REFUND_BUSINESS_DAYS,
  PRO_RATA_CEILING_PERCENT,
  REFUND_POLICY_CLAUSES,
  REFUND_POLICY_TEXT,
  REFUND_POLICY_VERSION,
  addBusinessDays,
  allocatePackagePrice,
  evaluateCourseRefund,
  evaluateRefund,
} from "../lib/refund-policy.mjs";

/*
 * California refund and cancellation policy CA-2026-08-20-v1.
 *
 * The work order's requirement is that RE 313, the enrollment acknowledgment, Terms and
 * refund administration all carry ONE policy version and ONE text. Four documents that each
 * paraphrase the same rule is how a filed document ends up saying something the platform
 * does not do, so the first group of tests below compares the actual rendered artefacts
 * rather than four constants that happen to agree.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CALIFORNIA_COURSE_IDS = [
  "ca-real-estate-principles-45",
  "ca-real-estate-practice-45",
  "ca-mortgage-loan-brokering-lending-45",
];

/* Markdown and HTML each carry the text with their own punctuation and escaping. Comparing
   the words rather than the bytes is the only way to prove the four sources agree. */
const words = (text) =>
  text
    .replaceAll(/<[^>]+>/g, " ")
    .replaceAll("&#039;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll(/&#8220;|&#8221;/g, '"')
    .replaceAll(/[*_>]/g, "")
    .replaceAll(/\s+/g, " ")
    /* Stripping a tag leaves a space where the markup was, so a linked email followed by a
       full stop becomes "…com ." — normalise the space before punctuation rather than let
       markup decide whether two identical sentences compare equal. */
    .replaceAll(/\s+([.,;:])/g, "$1")
    .trim();

const POLICY_WORDS = words(REFUND_POLICY_TEXT);

test("the policy has one version, and it is the adopted one", () => {
  assert.equal(REFUND_POLICY_VERSION, "CA-2026-08-20-v1");
  assert.equal(REFUND_POLICY_VERSION, PRICING.refundPolicy.version);
  assert.equal(REFUND_POLICY_TEXT, PRICING.refundPolicy.policyText);
});

test("every California course carries the adopted version as both its refund and cancellation policy", () => {
  for (const courseId of CALIFORNIA_COURSE_IDS) {
    const course = getCourse(courseId);
    assert.ok(course, `${courseId} is not in the catalog`);
    assert.equal(course.versions.refundPolicy, REFUND_POLICY_VERSION, `${courseId} refund version`);
    assert.equal(course.versions.cancellationPolicy, REFUND_POLICY_VERSION, `${courseId} cancellation version`);
    /* One document, so one text. */
    assert.equal(course.policyText.refund, REFUND_POLICY_TEXT, `${courseId} refund text`);
    assert.equal(course.policyText.cancellation, REFUND_POLICY_TEXT, `${courseId} cancellation text`);
  }
});

test("a state with no adopted policy returns no policy text rather than California's", () => {
  for (const courseId of ["va-salesperson", "me-sales-agent", "ok-basic-prelicense-90"]) {
    const course = getCourse(courseId);
    assert.equal(course.policyText.refund, null, `${courseId} must not carry California's policy`);
    assert.notEqual(course.versions.refundPolicy, REFUND_POLICY_VERSION, `${courseId} must not claim the California version`);
  }
});

test("the RE 313 answer sheet for every California course carries the policy verbatim", () => {
  const submissionRoot = path.join(root, "california/submission");
  const packets = fs
    .readdirSync(submissionRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d\d_/.test(entry.name))
    .map((entry) => path.join(submissionRoot, entry.name, "06-re313-general-information-page.md"))
    .filter((file) => fs.existsSync(file));
  assert.equal(packets.length, 3, `expected three RE 313 answer sheets, found ${packets.length}`);

  for (const file of packets) {
    const text = fs.readFileSync(file, "utf8");
    const name = path.relative(root, file);
    assert.ok(words(text).includes(POLICY_WORDS), `${name} does not carry the adopted policy text`);
    assert.match(text, new RegExp(REFUND_POLICY_VERSION), `${name} does not name the policy version`);
    /* The superseded state of this field — "no policy has been decided" — must not return. */
    assert.equal(
      /no policy has been decided|enter at signing/i.test(text),
      false,
      `${name} still says the refund field is undecided`,
    );
  }
});

/*
 * The Terms state the policy clause by clause and RE 313's field states it as one paragraph,
 * because a form field takes a paragraph and a legal page takes clauses. Those are two
 * renderings of one policy, not two policies — so the Terms are checked against every clause
 * rather than against the condensed paragraph, and every clause must appear verbatim.
 */
test("the published Terms carry every clause of the policy verbatim, and its version", () => {
  const terms = words(fs.readFileSync(path.join(root, "public/statecourse/terms/index.html"), "utf8"));
  for (const [clause, text] of Object.entries(REFUND_POLICY_CLAUSES)) {
    assert.ok(words(text).length > 0, `${clause} is empty`);
    assert.ok(terms.includes(words(text)), `the Terms do not carry the ${clause} clause verbatim`);
  }
  assert.ok(terms.includes(REFUND_POLICY_VERSION), "the Terms do not name the policy version");
});

test("the enrollment flow shows the policy text, not only its version number", () => {
  const enrollment = fs.readFileSync(path.join(root, "public/statecourse/enrollment.js"), "utf8");
  /* The acknowledgment must render the text the config endpoint supplies. */
  assert.match(enrollment, /policyText\?\.refund/, "the refund acknowledgment does not read the policy text");
  assert.match(enrollment, /policyText\?\.cancellation/, "the cancellation acknowledgment does not read the policy text");
  assert.match(enrollment, /ack-policy/, "there is no element to display the policy in");

  const config = fs.readFileSync(path.join(root, "netlify/functions/payment-config.mjs"), "utf8");
  assert.match(config, /policyText: course\.policyText/, "the config endpoint does not serve the policy text");
});

test("checkout refuses a stale or missing policy acceptance, and records the version it accepted", () => {
  const checkout = fs.readFileSync(path.join(root, "netlify/functions/create-checkout.mjs"), "utf8");
  assert.match(checkout, /missing_or_stale_\$\{key\}/, "checkout does not reject a stale acknowledgment version");
  assert.match(checkout, /refund_policy_version: course\.versions\.refundPolicy/, "checkout does not record the refund policy version");
  assert.match(checkout, /cancellation_policy_version: course\.versions\.cancellationPolicy/, "checkout does not record the cancellation policy version");
  /* And the allocation the pro-rata calculation later depends on. */
  assert.match(checkout, /checkout_course_allocations/, "checkout does not persist a per-course allocation");
});

/* ------------------------------------------------------------------ the calculation */

const MARCH_2 = "2026-03-02T15:00:00Z"; /* a Monday */
const base = {
  courseId: "ca-real-estate-principles-45",
  allocatedAmount: 7900,
  alreadyRefunded: 0,
  enrolledAt: MARCH_2,
  firstAssignmentCompletedAt: null,
  requestReceivedAt: MARCH_2,
  percentComplete: 0,
  finalExamAttempted: false,
  certificateIssued: false,
};

test("seven business days skips weekends and California holidays", () => {
  /* Monday 2 March 2026 plus seven business days is Wednesday 11 March: no holiday falls in
     that span, so only the weekend moves it. */
  assert.equal(addBusinessDays(new Date(MARCH_2), FULL_REFUND_BUSINESS_DAYS).toISOString().slice(0, 10), "2026-03-11");
  /* Tuesday 10 February 2026 crosses three holidays — 12 February Lincoln Day, 16 February
     the third Monday, 17 February Lunar New Year — so seven business days reaches 24
     February rather than 19 February. Excluding them lengthens the student's window. */
  assert.equal(
    addBusinessDays(new Date(Date.UTC(2026, 1, 10)), FULL_REFUND_BUSINESS_DAYS).toISOString().slice(0, 10),
    "2026-02-24",
  );
  assert.equal(addBusinessDays(new Date(MARCH_2), 0).toISOString(), new Date(MARCH_2).toISOString());
  assert.throws(() => addBusinessDays(new Date(MARCH_2), -1), RangeError);
});

test("the full-refund window stays open until BOTH anchors have passed", () => {
  /* Inside seven business days, first assignment already done: still full. */
  const early = evaluateCourseRefund({
    ...base,
    firstAssignmentCompletedAt: "2026-03-03T10:00:00Z",
    requestReceivedAt: "2026-03-05T10:00:00Z",
    percentComplete: 6.67,
  });
  assert.equal(early.outcome, "full");
  assert.equal(early.amount, 7900);

  /* Past seven business days, first assignment NOT done: still full, because the window
     closes at the LATER of the two and that anchor has not occurred. */
  const noAssignment = evaluateCourseRefund({
    ...base,
    requestReceivedAt: "2026-03-20T10:00:00Z",
    percentComplete: 0,
  });
  assert.equal(noAssignment.outcome, "full");
  assert.equal(noAssignment.amount, 7900);

  /* Both anchors passed: the window has closed and pro rata applies. */
  const closed = evaluateCourseRefund({
    ...base,
    firstAssignmentCompletedAt: "2026-03-04T10:00:00Z",
    requestReceivedAt: "2026-03-20T10:00:00Z",
    percentComplete: 20,
  });
  assert.equal(closed.outcome, "pro_rata");
});

test("the pro-rata amount is the unearned tuition and the boundary is 60 percent inclusive", () => {
  const after = { ...base, firstAssignmentCompletedAt: "2026-03-04T10:00:00Z", requestReceivedAt: "2026-03-20T10:00:00Z" };

  const atCeiling = evaluateCourseRefund({ ...after, percentComplete: PRO_RATA_CEILING_PERCENT });
  assert.equal(atCeiling.outcome, "pro_rata", "60 percent exactly is inside the pro-rata window");
  assert.equal(atCeiling.refundablePercent, 40);
  assert.equal(atCeiling.amount, 3160); /* 7900 * 40% */

  const overCeiling = evaluateCourseRefund({ ...after, percentComplete: 60.01 });
  assert.equal(overCeiling.outcome, "none", "above 60 percent no refund is due");
  assert.equal(overCeiling.amount, 0);

  /* Fifteen assignments: the ninth is 60 percent exactly, the tenth is past it. */
  assert.equal(evaluateCourseRefund({ ...after, percentComplete: (9 / 15) * 100 }).outcome, "pro_rata");
  assert.equal(evaluateCourseRefund({ ...after, percentComplete: (10 / 15) * 100 }).outcome, "none");
});

test("the three disqualifiers end eligibility whichever occurs first, even inside the full window", () => {
  for (const [field, label] of [
    ["finalExamAttempted", "a final examination attempt"],
    ["certificateIssued", "an issued certificate"],
  ]) {
    const decision = evaluateCourseRefund({ ...base, [field]: true });
    assert.equal(decision.outcome, "none", `${label} must end eligibility`);
    assert.equal(decision.amount, 0);
  }
  /* Over 60 percent while the full-refund window is technically still open. */
  const overrun = evaluateCourseRefund({ ...base, percentComplete: 75 });
  assert.equal(overrun.outcome, "none");
});

test("a refund already paid is deducted, and no calculation can exceed what remains", () => {
  const partial = evaluateCourseRefund({ ...base, alreadyRefunded: 2000 });
  assert.equal(partial.outcome, "full");
  assert.equal(partial.amount, 5900);

  const proRata = evaluateCourseRefund({
    ...base,
    alreadyRefunded: 7000,
    firstAssignmentCompletedAt: "2026-03-04T10:00:00Z",
    requestReceivedAt: "2026-03-20T10:00:00Z",
    percentComplete: 10,
  });
  assert.ok(proRata.amount <= 900, `pro rata ${proRata.amount} exceeded the 900 cents remaining`);
});

/*
 * The coercion guard every engine in this project carries. Number(null), Number(""),
 * Number(false) and Number([]) are all 0, and 0 percent complete is the most
 * refund-favourable value the policy has. Missing progress must stop the calculation.
 */
test("missing or unreadable progress throws rather than becoming a full refund", () => {
  for (const value of [null, undefined, "", "0", false, [], {}, Number.NaN]) {
    assert.throws(
      () => evaluateCourseRefund({ ...base, percentComplete: value }),
      /percentComplete/,
      `percentComplete ${JSON.stringify(value)} was accepted`,
    );
  }
  assert.throws(() => evaluateCourseRefund({ ...base, percentComplete: 101 }), RangeError);
  assert.throws(() => evaluateCourseRefund({ ...base, percentComplete: -1 }), RangeError);
  assert.throws(() => evaluateCourseRefund({ ...base, finalExamAttempted: "no" }), /finalExamAttempted/);
  assert.throws(() => evaluateCourseRefund({ ...base, certificateIssued: null }), /certificateIssued/);
  assert.throws(() => evaluateCourseRefund({ ...base, enrolledAt: "not a date" }), /enrolledAt/);
});

test("a package is decided course by course, and a finished course does not reduce an unstarted one", () => {
  const after = { firstAssignmentCompletedAt: "2026-03-04T10:00:00Z", requestReceivedAt: "2026-03-20T10:00:00Z" };
  const decision = evaluateRefund([
    { ...base, ...after, courseId: "ca-real-estate-principles-45", allocatedAmount: 6634, certificateIssued: true, percentComplete: 100 },
    { ...base, ...after, courseId: "ca-real-estate-practice-45", allocatedAmount: 6633, percentComplete: 20 },
    { ...base, ...after, courseId: "ca-mortgage-loan-brokering-lending-45", allocatedAmount: 6633, percentComplete: 0 },
  ]);
  assert.equal(decision.policyVersion, REFUND_POLICY_VERSION);
  assert.equal(decision.courses[0].outcome, "none");
  assert.equal(decision.courses[1].outcome, "pro_rata");
  assert.equal(decision.courses[1].amount, Math.round(6633 * 0.8));
  assert.equal(decision.courses[2].outcome, "pro_rata");
  assert.equal(decision.courses[2].amount, 6633);
  assert.equal(decision.amount, decision.courses.reduce((sum, course) => sum + course.amount, 0));
  assert.equal(decision.outcome, "partial");
  assert.throws(() => evaluateRefund([]), /at least one course/);
});

/* ------------------------------------------------------------------- the allocation */

test("a package allocation sums to the package price exactly, with no cent lost or invented", () => {
  for (const packageId of ["ca-required-education-135", "ca-complete-path"]) {
    const { allocated } = packageAllocation(packageId);
    assert.equal(
      allocated.reduce((sum, entry) => sum + entry.allocatedAmount, 0),
      getPackage(packageId).priceCents,
      `${packageId} allocation does not sum to its price`,
    );
    /* Deterministic: the same package always allocates the same way, or a pro-rata refund
       computed today and re-checked next year would not agree. */
    assert.deepEqual(packageAllocation(packageId).allocated, allocated, `${packageId} is not deterministic`);
  }
});

/*
 * The Complete Licensing Path is the case the rule was written for. Its price also includes
 * Exam Prep and the Licensing Navigator, which carry no DRE credit; they are complimentary
 * and take no tuition, so the whole $299 goes to the three DRE-credit courses.
 */
test("the complete path allocates its whole price to the three DRE-credit courses", () => {
  const { allocated } = packageAllocation("ca-complete-path");
  const byId = Object.fromEntries(allocated.map((entry) => [entry.courseId, entry]));
  assert.equal(byId["ca-real-estate-principles-45"].allocatedAmount, 9967);
  assert.equal(byId["ca-real-estate-practice-45"].allocatedAmount, 9967);
  assert.equal(byId["ca-mortgage-loan-brokering-lending-45"].allocatedAmount, 9966);
  assert.equal(byId["ca-exam-prep"].allocatedAmount, 0);
  assert.equal(byId["ca-licensing-navigator"].allocatedAmount, 0);
  /* Complimentary components stay in the record rather than being dropped, so a student can
     see that what they bought includes them and that they carry no refundable value. */
  assert.equal(byId["ca-exam-prep"].complimentary, true);
  assert.equal(byId["ca-licensing-navigator"].complimentary, true);
  assert.equal(byId["ca-real-estate-principles-45"].complimentary, false);
  assert.equal(allocated.reduce((sum, entry) => sum + entry.allocatedAmount, 0), 29900);
});

test("an indivisible price distributes the remainder rather than dropping it", () => {
  for (const total of [19900, 10000, 1, 7, 99999, 100001]) {
    const allocation = allocatePackagePrice(total, [
      { courseId: "a", listAmount: 7900 },
      { courseId: "b", listAmount: 7900 },
      { courseId: "c", listAmount: 7900 },
    ]);
    assert.equal(allocation.reduce((sum, entry) => sum + entry.allocatedAmount, 0), total, `total ${total}`);
  }
  /* Unequal list prices split unequally, in proportion. */
  const weighted = allocatePackagePrice(30000, [
    { courseId: "cheap", listAmount: 5000 },
    { courseId: "dear", listAmount: 25000 },
  ]);
  assert.deepEqual(weighted.map((entry) => entry.allocatedAmount), [5000, 25000]);
  /* The stated rule: the first n-1 take the rounded share, the last takes the remainder. */
  const equal = allocatePackagePrice(29900, [
    { courseId: "a", listAmount: 7900 },
    { courseId: "b", listAmount: 7900 },
    { courseId: "c", listAmount: 7900 },
  ]);
  assert.deepEqual(equal.map((entry) => entry.allocatedAmount), [9967, 9967, 9966]);
  assert.throws(() => allocatePackagePrice(100, []), /at least one component/);
  assert.throws(() => allocatePackagePrice(100, [{ courseId: "a", listAmount: 0 }]), /total zero/);
});

test("an unknown package is refused rather than allocated", () => {
  assert.equal(packageAllocation("no-such-package").allocated, null);
  assert.equal(packageAllocation("no-such-package").reason, "unknown_package");
});

test("the complimentary components are disclosed rather than silently priced at zero", () => {
  assert.equal(CALIFORNIA_COMPLIMENTARY_COMPONENTS.length, 2);
  for (const component of CALIFORNIA_COMPLIMENTARY_COMPONENTS) {
    assert.ok(COMPLIMENTARY_DISCLOSURE.includes(component.name), `${component.name} is not named in the disclosure`);
  }
  assert.match(COMPLIMENTARY_DISCLOSURE, /no additional charge/i);
  assert.match(COMPLIMENTARY_DISCLOSURE, /no Department of Real Estate course credit/i);
  assert.match(COMPLIMENTARY_DISCLOSURE, /no separately allocated tuition/i);
});

test("neither California package is purchasable yet, and each says why", () => {
  for (const packageId of ["ca-required-education-135", "ca-complete-path"]) {
    const bundle = getPackage(packageId);
    assert.equal(bundle.purchasable, false, `${packageId} must not be purchasable before package enrollment fan-out exists`);
    assert.match(bundle.notPurchasableReason, /one enrollment per component course/i, `${packageId} does not say why`);
    /* The blocker is the fan-out, not an undecided price: both allocate. */
    assert.ok(packageAllocation(packageId).allocated, `${packageId} must allocate`);
  }
});

/* ------------------------------------------------------- the administration endpoint */

test("refund administration decides from the policy and records what it decided", () => {
  const endpoint = fs.readFileSync(path.join(root, "netlify/functions/request-refund.mjs"), "utf8");
  assert.match(endpoint, /evaluateRefund/, "the endpoint does not call the policy");
  assert.match(endpoint, /california_refund_basis/, "the endpoint does not read the refund basis");
  assert.match(endpoint, /record_refund_policy_decision/, "the endpoint does not record the policy decision");
  assert.match(endpoint, /refund_progress_unknown_for_/, "the endpoint does not stop on unknown progress");
  /* The refusals live in lib/stripe-contract.mjs, which the endpoint delegates to, so that
     what may be sent to Stripe is decided in one place rather than in each caller. */
  assert.match(endpoint, /refundInstruction\(/, "the endpoint does not build its Stripe instruction from the contract");
  const contract = fs.readFileSync(path.join(root, "lib/stripe-contract.mjs"), "utf8");
  assert.match(contract, /exceeds_policy_entitlement/, "nothing refuses to exceed the entitlement");
  assert.match(contract, /no_refund_due_under_policy/, "nothing refuses a refund the policy denies");
  assert.match(contract, /payment_fully_refunded/, "nothing refuses a refund against a fully refunded payment");

  /* The superseded gate: policyReviewApproved alone must no longer authorise an amount. */
  assert.equal(
    /input\.policyReviewApproved !== true/.test(endpoint),
    false,
    "the endpoint still authorises refunds on the old policyReviewApproved boolean alone",
  );
  /* And the refund must reach the original payment method, so no destination is passed. */
  for (const [name, text] of [["the endpoint", endpoint], ["the Stripe contract", contract]]) {
    assert.equal(
      /"destination"|refund_destination/.test(text),
      false,
      `${name} sends a refund somewhere other than the original payment method`,
    );
  }
});

test("the migration records the allocation and the policy decision, and computes no amount", () => {
  const migration = fs.readFileSync(path.join(root, "database/008_california_refund_policy.sql"), "utf8");
  assert.match(migration, /create table if not exists checkout_course_allocations/);
  assert.match(migration, /create or replace function california_refund_basis/);
  assert.match(migration, /create or replace function record_refund_policy_decision/);
  /* Percent complete is assignments, not clock time — Regulation 3000(a)(1)'s unit. */
  assert.match(migration, /completed_assignments/);
  assert.match(migration, /required_assignments/);
  assert.equal(/active_seconds/.test(migration), false, "the basis measures progress in seconds rather than assignments");
  /* A voided examination session is not something the student did. */
  assert.match(migration, /'in_progress','submitted','expired'/);
  assert.equal(/'voided'/.test(migration.match(/final_exam_sessions[\s\S]{0,400}/)?.[0] ?? ""), false);
});
