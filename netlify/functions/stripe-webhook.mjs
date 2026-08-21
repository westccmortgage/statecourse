import { stripeEnvironment } from "./_lib/env.mjs";
import { dbRequest, rpc } from "./_lib/db.mjs";
import { rawBody, verifyStripeSignature } from "./_lib/stripe.mjs";
import { handleError, method, response } from "./_lib/http.mjs";
import { HANDLED_STRIPE_EVENTS, reconcile } from "../../lib/stripe-contract.mjs";

const idOf = (value) => (typeof value === "string" ? value : value?.id ?? null);

async function processEvent(event, mode) {
  const object = event.data.object;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      if (object.payment_status !== "paid") return;
      {
      const promotionRef = object.discounts?.[0]?.promotion_code
        || object.total_details?.breakdown?.discounts?.[0]?.discount?.promotion_code;
      const promotionCode = typeof promotionRef === "string" ? promotionRef : promotionRef?.code || promotionRef?.id;
      await rpc("finalize_paid_checkout", {
        p_event_id: event.id,
        p_mode: mode,
        p_checkout_session_id: object.id,
        p_payment_intent_id: typeof object.payment_intent === "string" ? object.payment_intent : object.payment_intent?.id,
        p_customer_id: typeof object.customer === "string" ? object.customer : object.customer?.id,
        p_amount_total: object.amount_total,
        p_amount_subtotal: object.amount_subtotal,
        p_amount_tax: object.total_details?.amount_tax || 0,
        p_amount_discount: object.total_details?.amount_discount || 0,
        p_currency: object.currency,
        p_payment_date: new Date(event.created * 1000).toISOString(),
        p_customer_email: object.customer_details?.email || object.customer_email || null,
        p_coupon_code: promotionCode || null,
      });
      }
      break;
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired":
      await rpc("mark_checkout_failed", {
        p_checkout_session_id: object.id,
        p_status: event.type === "checkout.session.expired" ? "expired" : "payment_failed",
      });
      break;
    /* The PaymentIntent carries the charge, and the charge is how a refund is reconciled.
       Recording it here means a later refund event can be matched on either identifier rather
       than only on the payment intent. Neither event creates an enrollment: the paid Checkout
       Session is the only thing that does, so a PaymentIntent arriving first or twice changes
       nothing. */
    case "payment_intent.succeeded":
      await rpc("record_payment_charge", {
        p_payment_intent_id: object.id,
        p_charge_id: idOf(object.latest_charge),
        p_amount_received: object.amount_received ?? object.amount ?? null,
        p_status: object.status || "succeeded",
      });
      break;
    case "payment_intent.payment_failed":
      await rpc("record_payment_charge", {
        p_payment_intent_id: object.id,
        p_charge_id: idOf(object.latest_charge),
        p_amount_received: 0,
        p_status: object.status || "payment_failed",
      });
      break;
    case "charge.refunded":
      /* Stripe sends this alongside the refund events. It carries the charge and the running
         refunded total, which is what makes an independent check of our own arithmetic
         possible; the refund rows themselves are written by the refund.* events. */
      await rpc("record_charge_refund_total", {
        p_charge_id: object.id,
        p_payment_intent_id: idOf(object.payment_intent),
        p_amount_refunded: object.amount_refunded ?? 0,
        p_fully_refunded: object.refunded === true,
      });
      break;
    case "refund.created":
    case "refund.updated":
    case "refund.failed":
      await rpc("apply_refund_event", {
        p_stripe_refund_id: object.id,
        p_payment_intent_id: typeof object.payment_intent === "string" ? object.payment_intent : null,
        p_amount: object.amount,
        p_currency: object.currency,
        p_status: object.status || (event.type === "refund.failed" ? "failed" : "pending"),
        p_reason: object.reason || null,
      });
      await classifyRefundOrigin(object);
      break;
    default:
      break;
  }
}

/*
 * A refund issued outside this system — by hand in the Stripe Dashboard, typically.
 *
 * It has already been paid by the time we hear about it, so there is nothing to reject and
 * nothing to reverse. Two things must happen, and only one of them belongs here.
 *
 * HERE: record that the refund happened, at the amount Stripe reports, and that this system
 * did not decide it. That is a fact about Stripe, which is what a webhook is for.
 *
 * NOT HERE: deciding whether the amount exceeded what the policy would have allowed. That is
 * a judgement, it needs the student's course progress, and this handler must stay clear of
 * compliance state in both directions — payment must never determine study time, examination
 * eligibility, credit or a certificate, and the cleanest way to keep that true is for the
 * payment path not to read those records at all. It is also work that must not run inside an
 * endpoint Stripe retries: an entitlement calculation that throws would fail an event that
 * had already been recorded correctly.
 *
 * The assessment is done by admin-refund-exceptions.mjs, against the same policy engine the
 * refund path uses, and until it runs the refund is marked as external with its entitlement
 * unassessed rather than assumed to be fine.
 */
async function classifyRefundOrigin(refundObject) {
  const rows = await dbRequest(
    `refunds?stripe_refund_id=eq.${encodeURIComponent(refundObject.id)}&select=id,origin,policy_version,policy_amount&limit=1`,
  );
  const refund = rows?.[0];
  if (!refund) return;
  /* A refund the engine decided already carries its decision. */
  if (refund.policy_version && refund.origin === "platform" && refund.policy_amount != null) return;

  await rpc("mark_external_refund", {
    p_stripe_refund_id: refundObject.id,
    p_actual_amount: refundObject.amount,
    /* Null is "not yet assessed", not "nothing was owed". mark_external_refund records it as
       awaiting assessment rather than treating it as within the entitlement. */
    p_policy_amount: null,
    p_note: "Issued outside StateCourse and recorded at the amount Stripe reports. Entitlement not yet assessed.",
  });
}

/*
 * Compare Stripe's version of a payment against ours and record any disagreement.
 *
 * A mismatch is recorded and NOT thrown. Throwing would fail the event, Stripe would retry it
 * on a schedule of hours and days, and every retry would find the same disagreement — the
 * database would never converge and the alert would arrive as an outage rather than as a
 * discrepancy. It is written where an operator can look at it instead.
 *
 * The comparison is on identifiers and amounts only. It reads no course progress, because the
 * payment path must stay clear of compliance state in both directions.
 */
async function reconcileAgainstRecord(event, object) {
  const intentId = idOf(object.payment_intent) ?? (event.type.startsWith("payment_intent.") ? object.id : null);
  if (!intentId) return;
  const rows = await dbRequest(
    `payments?stripe_payment_intent_id=eq.${encodeURIComponent(intentId)}&select=id,amount,refund_amount,currency,stripe_payment_intent_id,stripe_charge_id&limit=1`,
  );
  const record = rows?.[0];
  if (!record) return;
  const mismatches = reconcile({ record, stripeObject: object });
  if (mismatches.length === 0) return;
  await rpc("record_stripe_reconciliation", {
    p_payment_id: record.id,
    p_event_id: event.id,
    p_event_type: event.type,
    p_mismatches: mismatches,
  });
}

export const handler = async (event) => {
  let stripeEvent;
  try {
    method(event, "POST");
    const { mode, webhookSecret } = stripeEnvironment();
    if (!webhookSecret) throw Object.assign(new Error("webhook_not_configured"), { statusCode: 503 });
    const payload = rawBody(event);
    const signature = event.headers?.["stripe-signature"] || event.headers?.["Stripe-Signature"];
    if (!verifyStripeSignature(payload, signature, webhookSecret)) {
      return response(400, { error: "invalid_signature" });
    }
    stripeEvent = JSON.parse(payload.toString("utf8"));
    const claimed = await rpc("claim_stripe_event", {
      p_event_id: stripeEvent.id,
      p_event_type: stripeEvent.type,
      p_mode: mode,
      p_object_id: stripeEvent.data?.object?.id || null,
      p_created_at: new Date(stripeEvent.created * 1000).toISOString(),
    });
    if (claimed !== true) return response(200, { received: true, duplicate: true });

    try {
      await processEvent(stripeEvent, mode);
      await reconcileAgainstRecord(stripeEvent, stripeEvent.data?.object ?? {});
      await rpc("complete_stripe_event", { p_event_id: stripeEvent.id });
      return response(200, { received: true });
    } catch (error) {
      await rpc("fail_stripe_event", { p_event_id: stripeEvent.id, p_error_code: "processing_failed" });
      throw error;
    }
  } catch (error) {
    return handleError(error);
  }
};

/* Exported so the integrity test and the webhook cannot disagree about which events are
   handled: an event missing from the switch leaves the database believing something Stripe
   has already moved on from. */
export const WEBHOOK_HANDLED_EVENTS = HANDLED_STRIPE_EVENTS;
