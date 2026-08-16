import { stripeEnvironment } from "./_lib/env.mjs";
import { rpc } from "./_lib/db.mjs";
import { rawBody, verifyStripeSignature } from "./_lib/stripe.mjs";
import { handleError, method, response } from "./_lib/http.mjs";

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
      break;
    default:
      break;
  }
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
