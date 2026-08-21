import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { getCourse, packageAllocation } from "../config/course-catalog.mjs";
import { REFUND_POLICY_VERSION, evaluateRefund } from "../lib/refund-policy.mjs";
import {
  HANDLED_STRIPE_EVENTS,
  STRIPE_METADATA_VALUE_LIMIT,
  asStripeParams,
  checkoutMetadata,
  decodeAllocation,
  encodeAllocation,
  reconcile,
  refundInstruction,
} from "../lib/stripe-contract.mjs";

/*
 * Stripe Integrity — the chain, exercised rather than asserted by reading source text.
 *
 *   catalog -> checkout -> Stripe metadata -> DB allocation -> refund calculation
 *            -> Stripe refund -> DB refund record
 *
 * The pieces that touch the network live in Netlify handlers, so the facts they exchange are
 * built by lib/stripe-contract.mjs, which is pure. That is what makes the chain testable end
 * to end: the test below runs the same functions the handlers run, on the same data, and
 * checks that a purchase, a partial refund, a full refund, a duplicate webhook and an
 * over-refund all come out the way the policy says they must.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COURSE_ID = "ca-real-estate-principles-45";
const MARCH_2 = "2026-03-02T15:00:00Z";

/* A course whose price does not depend on the environment, so the chain is deterministic. */
const course = { ...getCourse(COURSE_ID) };
const AMOUNT = 7900;

const purchase = (overrides = {}) => ({
  attemptId: "11111111-1111-4111-8111-111111111111",
  studentId: "22222222-2222-4222-8222-222222222222",
  course,
  amount: AMOUNT,
  allocation: [{ courseId: COURSE_ID, allocatedAmount: AMOUNT }],
  packageId: null,
  qaOnly: false,
  ...overrides,
});

/* ------------------------------------------------------------- allocation encoding */

test("an allocation survives the round trip through Stripe metadata", () => {
  const allocation = packageAllocation("ca-complete-path").allocated;
  const encoded = encodeAllocation(allocation);
  assert.ok(encoded.length <= STRIPE_METADATA_VALUE_LIMIT, `${encoded.length} characters exceeds Stripe's limit`);
  const decoded = decodeAllocation(encoded);
  assert.deepEqual(
    decoded.map((entry) => ({ courseId: entry.courseId, allocatedAmount: entry.allocatedAmount })),
    allocation.map((entry) => ({ courseId: entry.courseId, allocatedAmount: entry.allocatedAmount })),
  );
  /* Including the two complimentary components at zero — a student is entitled to see that
     what they bought includes them and that they carry no refundable value. */
  assert.equal(decoded.filter((entry) => entry.allocatedAmount === 0).length, 2);
});

test("a malformed or dishonest allocation is refused rather than encoded", () => {
  assert.throws(() => encodeAllocation([]), /non-empty array/);
  assert.throws(() => encodeAllocation([{ courseId: "a" }]), /integer allocatedAmount/);
  assert.throws(() => encodeAllocation([{ courseId: "a:b", allocatedAmount: 1 }]), /separator/);
  assert.throws(() => decodeAllocation(""), /non-empty string/);
  assert.throws(() => decodeAllocation("no-colon-here"), /malformed pair/);
});

/* ------------------------------------------------------------------ checkout -> Stripe */

test("checkout metadata carries the policy version, the package, the allocation and the amount", () => {
  const metadata = checkoutMetadata(purchase());
  assert.equal(metadata.refund_policy_version, REFUND_POLICY_VERSION);
  assert.equal(metadata.cancellation_policy_version, REFUND_POLICY_VERSION);
  assert.equal(metadata.course_allocation, `${COURSE_ID}:${AMOUNT}`);
  assert.equal(metadata.amount, String(AMOUNT));
  assert.equal(metadata.package_id, "");
  assert.equal(metadata.checkout_attempt_id, purchase().attemptId);
  assert.equal(metadata.course_id, COURSE_ID);
  assert.equal(metadata.state, "CA");

  /* And it flattens to the form the Stripe API takes, on the session and the intent alike. */
  const params = asStripeParams(metadata);
  assert.equal(params["metadata[refund_policy_version]"], REFUND_POLICY_VERSION);
  const intentParams = asStripeParams(metadata, "payment_intent_data[metadata]");
  assert.equal(intentParams["payment_intent_data[metadata][course_allocation]"], `${COURSE_ID}:${AMOUNT}`);
});

/*
 * The defect this catches is a divergence between what a student is charged and what the
 * refund engine will later divide. Catching it at the point of sale is the whole point:
 * afterwards it is a refund dispute.
 */
test("an allocation that does not total the charge is refused before the money moves", () => {
  assert.throws(
    () => checkoutMetadata(purchase({ allocation: [{ courseId: COURSE_ID, allocatedAmount: 7800 }] })),
    /allocation totals 7800 cents but the charge is 7900/,
  );
  assert.throws(() => checkoutMetadata(purchase({ amount: 0 })), /positive integer/);
  assert.throws(() => checkoutMetadata(purchase({ attemptId: null })), /attemptId and studentId/);
});

test("a package purchase carries its package id and its full allocation", () => {
  const allocated = packageAllocation("ca-complete-path").allocated;
  const metadata = checkoutMetadata(
    purchase({ amount: 29900, allocation: allocated, packageId: "ca-complete-path" }),
  );
  assert.equal(metadata.package_id, "ca-complete-path");
  assert.equal(metadata.amount, "29900");
  const decoded = decodeAllocation(metadata.course_allocation);
  assert.equal(decoded.reduce((sum, entry) => sum + entry.allocatedAmount, 0), 29900);
});

/* --------------------------------------------------------------------- reconciliation */

const record = {
  id: "33333333-3333-4333-8333-333333333333",
  amount: AMOUNT,
  refund_amount: 0,
  currency: "usd",
  stripe_payment_intent_id: "pi_test_1",
  stripe_charge_id: "ch_test_1",
};

test("matching records reconcile silently", () => {
  const mismatches = reconcile({
    record,
    stripeObject: { id: "pi_test_1", latest_charge: "ch_test_1", currency: "usd", amount: AMOUNT },
    expect: { amount: AMOUNT },
  });
  assert.deepEqual(mismatches, []);
});

test("every disagreement Stripe can have with the record is reported by name", () => {
  const wrongCharge = reconcile({ record, stripeObject: { id: "pi_test_1", latest_charge: "ch_other" } });
  assert.deepEqual(wrongCharge, [{ field: "charge", ours: "ch_test_1", theirs: "ch_other" }]);

  const wrongIntent = reconcile({ record, stripeObject: { id: "pi_other" } });
  assert.deepEqual(wrongIntent, [{ field: "payment_intent", ours: "pi_test_1", theirs: "pi_other" }]);

  const wrongAmount = reconcile({
    record,
    stripeObject: { id: "pi_test_1", amount: 5000 },
    expect: { amount: AMOUNT },
  });
  assert.deepEqual(wrongAmount, [{ field: "amount", ours: AMOUNT, theirs: 5000 }]);

  const wrongCurrency = reconcile({ record, stripeObject: { id: "pi_test_1", currency: "eur" } });
  assert.deepEqual(wrongCurrency, [{ field: "currency", ours: "usd", theirs: "eur" }]);

  const wrongStatus = reconcile({
    record,
    stripeObject: { id: "pi_test_1", status: "failed" },
    expect: { status: "succeeded" },
  });
  assert.deepEqual(wrongStatus, [{ field: "status", ours: "succeeded", theirs: "failed" }]);
});

test("a field neither side knows is not a disagreement", () => {
  /* A payment recorded before the charge column existed has a null charge. That is missing
     information, not a conflict, and reporting it would bury the real ones. */
  const partial = { ...record, stripe_charge_id: null };
  assert.deepEqual(reconcile({ record: partial, stripeObject: { id: "pi_test_1", latest_charge: "ch_x" } }), []);
});

/* --------------------------------------------------------------- refund, end to end */

const basis = (overrides = {}) => ({
  courseId: COURSE_ID,
  allocatedAmount: AMOUNT,
  alreadyRefunded: 0,
  enrolledAt: MARCH_2,
  firstAssignmentCompletedAt: "2026-03-04T10:00:00Z",
  requestReceivedAt: "2026-03-20T10:00:00Z",
  percentComplete: 20,
  finalExamAttempted: false,
  certificateIssued: false,
  ...overrides,
});

const payment = { ...record };

test("the whole chain agrees: catalog price, metadata, allocation, entitlement, refund params", () => {
  /* 1. Catalog and checkout. */
  const metadata = checkoutMetadata(purchase());
  const allocation = decodeAllocation(metadata.course_allocation);
  assert.equal(Number(metadata.amount), payment.amount);

  /* 2. The refund engine divides exactly what checkout allocated. */
  const decision = evaluateRefund([basis({ allocatedAmount: allocation[0].allocatedAmount })]);
  assert.equal(decision.policyVersion, metadata.refund_policy_version);
  assert.equal(decision.outcome, "partial");
  assert.equal(decision.amount, Math.round(AMOUNT * 0.8));

  /* 3. And Stripe is told exactly that, on the original payment method. */
  const instruction = refundInstruction({ payment, decision });
  assert.equal(instruction.amount, decision.amount);
  assert.equal(instruction.overridden, false);
  assert.equal(instruction.params.payment_intent, "pi_test_1");
  assert.equal(instruction.params.amount, decision.amount);
  assert.equal(instruction.params["metadata[refund_policy_version]"], REFUND_POLICY_VERSION);
  assert.equal(instruction.params["metadata[policy_amount]"], String(decision.amount));
  assert.equal("destination" in instruction.params, false, "a refund must go to the original payment method");
});

test("a full refund inside the cancellation period sends the whole amount", () => {
  const decision = evaluateRefund([
    basis({ requestReceivedAt: "2026-03-05T10:00:00Z", percentComplete: 6.67 }),
  ]);
  assert.equal(decision.outcome, "full");
  assert.equal(refundInstruction({ payment, decision }).amount, AMOUNT);
});

test("a second refund can only reach what remains after the first", () => {
  const already = 6320;
  const partlyRefunded = { ...payment, refund_amount: already };
  const decision = evaluateRefund([basis({ alreadyRefunded: already, percentComplete: 20 })]);
  const instruction = refundInstruction({ payment: partlyRefunded, decision });
  assert.ok(instruction.amount <= AMOUNT - already, `${instruction.amount} exceeds the ${AMOUNT - already} remaining`);
  /* And a fully refunded payment cannot be refunded again at all. */
  assert.throws(
    () => refundInstruction({ payment: { ...payment, refund_amount: AMOUNT }, decision }),
    /payment_fully_refunded/,
  );
});

test("more than the entitlement is refused, and an override is recorded rather than hidden", () => {
  const decision = evaluateRefund([basis({ percentComplete: 20 })]);
  assert.throws(
    () => refundInstruction({ payment, decision, requestedAmount: AMOUNT }),
    /exceeds_policy_entitlement/,
  );
  const overridden = refundInstruction({ payment, decision, requestedAmount: AMOUNT, overrideApproved: true });
  assert.equal(overridden.overridden, true);
  assert.equal(overridden.params["metadata[policy_overridden]"], "true");
  /* The policy's own figure travels with the override, so the divergence is visible in
     Stripe as well as in the database. */
  assert.equal(overridden.params["metadata[policy_amount]"], String(decision.amount));
});

test("a refund the policy denies cannot be sent without an override", () => {
  const denied = evaluateRefund([basis({ certificateIssued: true, percentComplete: 100 })]);
  assert.equal(denied.amount, 0);
  assert.throws(() => refundInstruction({ payment, decision: denied }), /no_refund_due_under_policy/);
  /* Naming an amount against a denied decision is an override, and is refused as one — the
     administrator is told the policy denied it rather than handed "invalid amount". */
  assert.throws(() => refundInstruction({ payment, decision: denied, requestedAmount: 100 }), /exceeds_policy_entitlement/);
  /* With the override it goes through, carrying the policy's zero so the divergence shows. */
  const forced = refundInstruction({ payment, decision: denied, requestedAmount: 100, overrideApproved: true });
  assert.equal(forced.overridden, true);
  assert.equal(forced.params["metadata[policy_amount]"], "0");
  /* Zero is not a refund. */
  assert.throws(
    () => refundInstruction({ payment, decision: evaluateRefund([basis({ percentComplete: 20 })]), requestedAmount: 0 }),
    /invalid_refund_amount/,
  );
});

/* ------------------------------------------------------------------- idempotency */

test("the webhook claims each event once, and a duplicate changes nothing", () => {
  const webhook = fs.readFileSync(path.join(root, "netlify/functions/stripe-webhook.mjs"), "utf8");
  /* One claim per event id, and a claim that fails returns 200 rather than retrying. */
  assert.match(webhook, /claim_stripe_event/);
  assert.match(webhook, /if \(claimed !== true\) return response\(200, \{ received: true, duplicate: true \}\)/);
  assert.match(webhook, /verifyStripeSignature/, "an unsigned webhook must not be processed");

  const migration = fs.readFileSync(path.join(root, "database/001_payments_enrollment.sql"), "utf8");
  /* A repeated paid session must not create a second enrollment: the function returns the
     existing one instead of inserting. */
  assert.match(migration, /if v_enrollment_id is not null then return v_enrollment_id; end if;/);
  /* A repeated refund event must not create a second refund row. */
  assert.match(migration, /on conflict \(stripe_refund_id\) do update/);
  /* And the amount and currency Stripe reports are checked against the attempt. */
  assert.match(migration, /raise exception 'checkout payment mismatch'/);
});

test("every event the contract names is handled by the webhook", () => {
  const webhook = fs.readFileSync(path.join(root, "netlify/functions/stripe-webhook.mjs"), "utf8");
  for (const eventName of HANDLED_STRIPE_EVENTS) {
    assert.match(webhook, new RegExp(`case "${eventName.replaceAll(".", "\\.")}"`), `${eventName} is not handled`);
  }
  /* The payment and refund events the requirement names, spelled out so the list above
     cannot be quietly shortened. */
  for (const required of [
    "checkout.session.completed",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "refund.created",
    "refund.updated",
    "refund.failed",
    "charge.refunded",
  ]) {
    assert.ok(HANDLED_STRIPE_EVENTS.includes(required), `${required} is missing from the contract`);
  }
});

test("Stripe and the database are reconciled by intent, charge, amount and status", () => {
  const webhook = fs.readFileSync(path.join(root, "netlify/functions/stripe-webhook.mjs"), "utf8");
  assert.match(webhook, /reconcileAgainstRecord/);
  assert.match(webhook, /record_stripe_reconciliation/);

  const migration = fs.readFileSync(path.join(root, "database/009_stripe_integrity.sql"), "utf8");
  assert.match(migration, /add column if not exists stripe_charge_id/);
  assert.match(migration, /create table if not exists stripe_reconciliation_events/);
  assert.match(migration, /create or replace function record_payment_charge/);
  assert.match(migration, /create or replace function record_charge_refund_total/);
  assert.match(migration, /create or replace view stripe_reconciliation_open/);

  /*
   * A disagreement is recorded, never raised. Raising fails the webhook, Stripe retries for
   * days, every retry finds the same disagreement, and the database never converges — the
   * discrepancy arrives as an outage instead of as a discrepancy.
   */
  assert.equal(
    /raise exception[^;]*mismatch/i.test(migration),
    false,
    "a reconciliation mismatch raises instead of being recorded",
  );
});

/*
 * A refund made by hand in the Stripe Dashboard. It has already been paid by the time the
 * webhook hears about it, so the system's job is to end up in the same financial state Stripe
 * is in, mark the refund as one it did not decide, and put a refund the policy would not have
 * allowed in front of a person.
 */
test("a Dashboard refund is recorded at Stripe's amount and never mistaken for a platform decision", () => {
  const webhook = fs.readFileSync(path.join(root, "netlify/functions/stripe-webhook.mjs"), "utf8");
  const migration = fs.readFileSync(path.join(root, "database/010_external_refunds.sql"), "utf8");
  assert.match(webhook, /classifyRefundOrigin/, "the webhook does not classify a refund's origin");
  assert.match(migration, /origin text not null default 'platform'/);
  assert.match(migration, /check \(origin in \('platform', 'external'\)\)/);
  /* Our figure follows Stripe's here, which is the opposite of the platform path. */
  assert.match(migration, /the ACTUAL amount Stripe reports, never a computed one/);
  /* And a refund the engine decided is never reclassified as external. */
  assert.match(migration, /A refund this system decided is never reclassified/);
});

/*
 * The separation the webhook must keep. Payment never determines study time, examination
 * eligibility, credit or a certificate — and the surest way to keep that true is for the
 * payment path not to read those records at all. The entitlement assessment therefore lives
 * outside the webhook, which also keeps a throwing calculation out of an endpoint Stripe
 * retries.
 */
test("the webhook records what Stripe did and assesses nothing against course progress", () => {
  const webhook = fs.readFileSync(path.join(root, "netlify/functions/stripe-webhook.mjs"), "utf8");
  assert.equal(/certificate_issued|percent_complete|final_exam_attempted/.test(webhook), false,
    "the webhook reads course progress");
  assert.equal(/evaluateRefund/.test(webhook), false, "the webhook computes a refund entitlement");
  /* It marks the entitlement unassessed rather than assuming it was fine. */
  assert.match(webhook, /Entitlement not yet assessed/);
  assert.match(webhook, /p_policy_amount: null/);

  const migration = fs.readFileSync(path.join(root, "database/010_external_refunds.sql"), "utf8");
  assert.match(migration, /external_entitlement_unassessed/);
  assert.match(migration, /A null entitlement is "not yet assessed", never "nothing was owed"/);
});

test("an external refund is assessed separately, and an excess reaches an administrator", () => {
  const assessor = fs.readFileSync(path.join(root, "netlify/functions/admin-refund-exceptions.mjs"), "utf8");
  const migration = fs.readFileSync(path.join(root, "database/010_external_refunds.sql"), "utf8");
  /* Assessed by the same engine the refund path uses, so the two numbers are comparable. */
  assert.match(assessor, /evaluateRefund/);
  assert.match(assessor, /assess_external_refund/);
  /* An entitlement that cannot be computed stays uncomputed rather than being guessed. */
  assert.match(assessor, /course_progress_incomplete/);
  assert.match(assessor, /unassessable/);
  /* The excess is recorded as an exception with its amount, and surfaced. */
  assert.match(migration, /policy_exception_amount = case when v_exceeds then v_refund\.amount - p_policy_amount/);
  assert.match(migration, /create or replace view refund_policy_exceptions_open/);
  assert.match(migration, /create or replace function review_refund_exception/);
  /* Nothing anywhere tries to take the money back. */
  assert.equal(
    /\b(reverse_refund|cancel_refund|void_refund|undo_refund)\b/.test(migration + assessor),
    false,
    "a code path attempts to reverse a refund that has already been paid",
  );
  assert.match(assessor, /is not altered by it/, "the assessor does not say plainly that it changes nothing");
});

test("checkout persists the allocation and sends the same facts to Stripe", () => {
  const checkout = fs.readFileSync(path.join(root, "netlify/functions/create-checkout.mjs"), "utf8");
  assert.match(checkout, /checkout_course_allocations/);
  assert.match(checkout, /checkoutMetadata\(/);
  assert.match(checkout, /asStripeParams\(metadata\)/);
  assert.match(checkout, /asStripeParams\(metadata, "payment_intent_data\[metadata\]"\)/);

  const refund = fs.readFileSync(path.join(root, "netlify/functions/request-refund.mjs"), "utf8");
  /* The order is the requirement: calculate, record, then call Stripe. */
  assert.ok(
    refund.indexOf("evaluateRefund") < refund.indexOf("refundInstruction"),
    "the refund amount must be decided before the Stripe instruction is built",
  );
  assert.ok(
    refund.indexOf("refundInstruction") < refund.indexOf('stripeRequest("/refunds"'),
    "the instruction must be built before Stripe is called",
  );
  assert.ok(
    refund.indexOf('stripeRequest("/refunds"') < refund.indexOf("record_refund_policy_decision"),
    "the policy decision must be recorded against the refund Stripe returned",
  );
});
