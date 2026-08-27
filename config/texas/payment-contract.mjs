/**
 * Texas payment contract — WRITTEN BEFORE STRIPE, SO STRIPE CANNOT DIVERGE FROM IT.
 *
 * WHY THIS FILE EXISTS AT ALL WHEN TEXAS CANNOT TAKE MONEY. Because the order in which these two
 * things are built decides which one wins. If Stripe is wired first, the enrolment agreement ends
 * up describing whatever Stripe happens to do. Written first, the contract is the thing Stripe has
 * to satisfy, and the refusals below become conditions a future implementation must clear rather
 * than conditions it must be persuaded to add.
 *
 * CHECKOUT IS DISABLED AND THE SWITCH IS NOT A CONFIGURATION VALUE. It is a constant in source, and
 * the Texas release gate reads this file to confirm it. There are no live Stripe products for Texas
 * and none may be created.
 */

export const CHECKOUT_ENABLED = false;

/** Metadata every future Texas Checkout Session and PaymentIntent must carry. */
export const REQUIRED_METADATA = Object.freeze([
  "state",                        /* always "TX" */
  "package_id",                   /* the pathway, where a bundle was bought; null for a single course */
  "course_id",                    /* one of the six; never the pathway */
  "provider_approval_number",
  "course_approval_number",
  "policy_version",
  "enrollment_agreement_version",
  "student_acceptance_timestamp",
  "per_course_allocation",
  "amount",
  "currency",
  "order_id",
]);

/**
 * Every condition that must be FALSE for a Texas checkout to open. Each is a refusal in its own
 * right: satisfying the others does not excuse any one of them.
 */
export const REFUSALS = Object.freeze([
  Object.freeze({ id: "no-provider-approval", test: (ctx) => !ctx.providerApprovalNumber, because: "the provider has no written TREC approval" }),
  Object.freeze({ id: "no-course-approval", test: (ctx) => !ctx.courseApprovalNumber, because: "the course has no written TREC approval" }),
  Object.freeze({ id: "enrollment-disabled", test: (ctx) => ctx.enrollmentEnabled !== true, because: "enrolment is disabled for this course" }),
  Object.freeze({ id: "course-approval-expired", test: (ctx) => ctx.courseApprovalExpiresOn != null && ctx.asOf > ctx.courseApprovalExpiresOn, because: "the course approval has expired" }),
  Object.freeze({ id: "provider-inactive", test: (ctx) => ctx.providerStatus !== "active", because: "the provider is not active" }),
  Object.freeze({ id: "no-policy-acceptance", test: (ctx) => !ctx.studentAcceptanceTimestamp || !ctx.enrollmentAgreementVersion, because: "the student has not accepted a versioned enrolment agreement" }),
  Object.freeze({
    id: "allocation-mismatch",
    test: (ctx) => Math.round((ctx.perCourseAllocation ?? []).reduce((sum, line) => sum + line.amount, 0)) !== Math.round(ctx.amount ?? -1),
    because: "the per-course allocation does not equal the amount charged",
  }),
]);

/** @returns {{allowed: boolean, refusals: string[]}} — never throws, so a caller cannot swallow it. */
export function mayOpenCheckout(context) {
  if (!CHECKOUT_ENABLED) return Object.freeze({ allowed: false, refusals: Object.freeze(["texas checkout is disabled in config/texas/payment-contract.mjs"]) });
  const hit = REFUSALS.filter((refusal) => refusal.test(context)).map((refusal) => refusal.because);
  return Object.freeze({ allowed: hit.length === 0, refusals: Object.freeze(hit) });
}

/**
 * One versioned policy source, used by the enrolment UI, the Terms, the acceptance record, the
 * Stripe metadata, the refund record and the submission specimen alike. A refund computed from one
 * source and disclosed from another is how a provider ends up disclosing a policy it does not run.
 */
export const POLICY_SOURCE = Object.freeze({
  path: "texas/submission/pre-enrollment-agreement.md",
  version: "TX-ENROLLMENT-DRAFT-2026-08-27-v0",
  status: "DRAFT — no commercial price and no refund formula is set. Both are business decisions and neither is invented here.",
});

export default Object.freeze({ CHECKOUT_ENABLED, REQUIRED_METADATA, REFUSALS, mayOpenCheckout, POLICY_SOURCE });
