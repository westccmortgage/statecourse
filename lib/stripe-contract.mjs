/*
 * The contract between StateCourse's record and Stripe's.
 *
 * Stripe is part of this architecture rather than an integration bolted on after the fact,
 * and the thing that makes it part of it is that both sides carry the same facts and can be
 * compared. Every purchase writes the policy version, the package, the full per-course
 * allocation and the amount into Stripe metadata; every refund is decided here first and
 * sent second; and every webhook is reconciled against what the database already believes.
 *
 * This module is pure. It builds the metadata, it compares two records, and it decides what
 * a refund call may contain — no network, no database — so the whole chain
 *
 *     catalog -> checkout -> Stripe metadata -> DB allocation -> refund calculation
 *              -> Stripe refund -> DB refund record
 *
 * is exercisable in a test rather than asserted by reading source text.
 */

/* Stripe caps a metadata value at 500 characters and a key at 40, and silently rejects the
   whole call if either is exceeded. The allocation is the only value that can grow, so it is
   measured rather than assumed to fit. */
export const STRIPE_METADATA_VALUE_LIMIT = 500;
export const STRIPE_METADATA_KEY_LIMIT = 40;

/**
 * Encode a per-course allocation compactly enough to survive Stripe's 500-character limit.
 *
 * Course ids are long ("ca-mortgage-loan-brokering-lending-45"), so a JSON array of objects
 * would not fit three of them with room to spare. The encoding is `courseId:cents` pairs
 * separated by semicolons — reversible, obvious in the Stripe dashboard, and short.
 */
export function encodeAllocation(allocation) {
  if (!Array.isArray(allocation) || allocation.length === 0) {
    throw new TypeError("encodeAllocation: allocation must be a non-empty array");
  }
  return allocation
    .map((entry) => {
      if (typeof entry?.courseId !== "string" || !entry.courseId) {
        throw new TypeError("encodeAllocation: every entry needs a courseId");
      }
      if (!Number.isSafeInteger(entry.allocatedAmount) || entry.allocatedAmount < 0) {
        throw new TypeError(`encodeAllocation: ${entry.courseId} has no integer allocatedAmount`);
      }
      if (entry.courseId.includes(";") || entry.courseId.includes(":")) {
        throw new TypeError(`encodeAllocation: ${entry.courseId} contains a separator character`);
      }
      return `${entry.courseId}:${entry.allocatedAmount}`;
    })
    .join(";");
}

export function decodeAllocation(encoded) {
  if (typeof encoded !== "string" || encoded.trim() === "") {
    throw new TypeError("decodeAllocation: expected a non-empty string");
  }
  return Object.freeze(
    encoded.split(";").map((pair) => {
      const index = pair.lastIndexOf(":");
      if (index <= 0) throw new TypeError(`decodeAllocation: malformed pair "${pair}"`);
      const courseId = pair.slice(0, index);
      const allocatedAmount = Number(pair.slice(index + 1));
      if (!Number.isSafeInteger(allocatedAmount) || allocatedAmount < 0) {
        throw new TypeError(`decodeAllocation: ${courseId} has no integer amount`);
      }
      return Object.freeze({ courseId, allocatedAmount });
    }),
  );
}

/**
 * The metadata a Checkout Session must carry.
 *
 * The allocation total is written alongside the allocation itself and asserted to equal the
 * charged amount here, at the point of sale. A mismatch between what a student is charged
 * and what the refund engine will later divide is the defect this catches, and it catches it
 * before the money moves rather than after.
 */
export function checkoutMetadata({
  attemptId,
  studentId,
  course,
  amount,
  allocation,
  packageId = null,
  qaOnly = false,
}) {
  if (!attemptId || !studentId) throw new TypeError("checkoutMetadata: attemptId and studentId are required");
  if (!course?.id || !course?.state) throw new TypeError("checkoutMetadata: a course with an id and state is required");
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new TypeError("checkoutMetadata: amount must be a positive integer of cents");

  const allocated = allocation.reduce((sum, entry) => sum + entry.allocatedAmount, 0);
  if (allocated !== amount) {
    throw new Error(`checkoutMetadata: allocation totals ${allocated} cents but the charge is ${amount}`);
  }
  const encoded = encodeAllocation(allocation);
  if (encoded.length > STRIPE_METADATA_VALUE_LIMIT) {
    throw new Error(
      `checkoutMetadata: the encoded allocation is ${encoded.length} characters, over Stripe's ${STRIPE_METADATA_VALUE_LIMIT}-character limit`,
    );
  }

  const metadata = {
    checkout_attempt_id: attemptId,
    student_id: studentId,
    course_id: course.id,
    state: course.state,
    qa_only: qaOnly ? "true" : "false",
    amount: String(amount),
    package_id: packageId ?? "",
    course_allocation: encoded,
    regulatory_acknowledgment_version: course.versions.regulatoryAcknowledgment,
    terms_version: course.versions.terms,
    refund_policy_version: course.versions.refundPolicy,
    cancellation_policy_version: course.versions.cancellationPolicy,
  };
  for (const [key, value] of Object.entries(metadata)) {
    if (key.length > STRIPE_METADATA_KEY_LIMIT) throw new Error(`checkoutMetadata: key "${key}" exceeds Stripe's limit`);
    if (String(value).length > STRIPE_METADATA_VALUE_LIMIT) {
      throw new Error(`checkoutMetadata: value for "${key}" exceeds Stripe's ${STRIPE_METADATA_VALUE_LIMIT}-character limit`);
    }
  }
  return Object.freeze(metadata);
}

/** Flatten to the `metadata[key]` form the Stripe form-encoded API takes. */
export function asStripeParams(metadata, prefix = "metadata") {
  return Object.fromEntries(Object.entries(metadata).map(([key, value]) => [`${prefix}[${key}]`, String(value)]));
}

const idOf = (value) => (typeof value === "string" ? value : value?.id ?? null);

/**
 * Compare what Stripe says against what the database already believes.
 *
 * Returns the list of disagreements, empty when the two records match. It reports rather than
 * throws, so a caller can log a mismatch it must not act on and still return 200 to Stripe —
 * a webhook that 500s on a disagreement gets retried forever and fixes nothing.
 */
export function reconcile({ record, stripeObject, expect = {} }) {
  const mismatches = [];
  const compare = (field, ours, theirs) => {
    if (ours == null || theirs == null) return;
    if (ours !== theirs) mismatches.push({ field, ours, theirs });
  };
  compare("payment_intent", record.stripe_payment_intent_id, idOf(stripeObject.payment_intent) ?? stripeObject.id);
  compare("charge", record.stripe_charge_id, idOf(stripeObject.charge ?? stripeObject.latest_charge));
  compare("currency", record.currency, stripeObject.currency?.toLowerCase());
  if (expect.amount != null) compare("amount", expect.amount, stripeObject.amount ?? stripeObject.amount_total);
  if (expect.status != null) compare("status", expect.status, stripeObject.status);
  if (expect.refundId != null) compare("refund_id", expect.refundId, stripeObject.id);
  return Object.freeze(mismatches);
}

/**
 * What a refund call to Stripe may contain.
 *
 * The entitlement is decided by the policy before this is called; this refuses to build an
 * instruction that exceeds it, refuses to send more than remains on the payment, and refuses
 * to name a destination — the policy requires the original payment method, which is what
 * Stripe does when no destination is given.
 */
export function refundInstruction({ payment, decision, requestedAmount, overrideApproved = false }) {
  if (!payment?.stripe_payment_intent_id) throw new TypeError("refundInstruction: the payment has no payment intent");
  const remaining = payment.amount - payment.refund_amount;
  if (remaining <= 0) throw Object.assign(new Error("payment_fully_refunded"), { statusCode: 409 });

  const amount = requestedAmount == null ? decision.amount : requestedAmount;
  const overridden = amount > decision.amount;

  /* The policy's own answer comes first. An administrator who asks for a refund the policy
     denies must be told that, not handed "invalid amount" — the entitlement being zero is a
     decision with a reason behind it, and the reason is what makes it reviewable. */
  if (decision.amount === 0 && !overridden) {
    throw Object.assign(new Error("no_refund_due_under_policy"), { statusCode: 409, policyAmount: 0 });
  }
  if (overridden && overrideApproved !== true) {
    throw Object.assign(new Error("exceeds_policy_entitlement"), { statusCode: 409, policyAmount: decision.amount });
  }
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw Object.assign(new Error("invalid_refund_amount"), { statusCode: 400 });
  }
  if (amount > remaining) throw Object.assign(new Error("invalid_refund_amount"), { statusCode: 400 });

  return Object.freeze({
    amount,
    overridden,
    params: Object.freeze({
      payment_intent: payment.stripe_payment_intent_id,
      amount,
      "metadata[statecourse_payment_id]": payment.id,
      "metadata[refund_policy_version]": decision.policyVersion,
      "metadata[policy_amount]": String(decision.amount),
      "metadata[policy_outcome]": decision.outcome,
      "metadata[policy_overridden]": overridden ? "true" : "false",
    }),
  });
}

/* The Stripe events this system must handle. Named here so the webhook and its test cannot
   disagree about the list: a webhook that silently ignores refund.updated leaves the database
   believing a refund is pending forever. */
export const HANDLED_STRIPE_EVENTS = Object.freeze([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "refund.created",
  "refund.updated",
  "refund.failed",
  "charge.refunded",
]);
