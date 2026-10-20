import {withLambda} from '@netlify/aws-lambda-compat';
import { stripeEnvironment } from "./_lib/env.mjs";
import { dbRequest, rpc } from "./_lib/db.mjs";
import { rawBody, stripeRequest, verifyStripeSignature } from "./_lib/stripe.mjs";
import { handleError, method, response } from "./_lib/http.mjs";
import { HANDLED_STRIPE_EVENTS, reconcile } from "../../lib/stripe-contract.mjs";

const idOf = (value) => (typeof value === "string" ? value : value?.id ?? null);
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AI_EVENT_TYPES=new Set([
  "checkout.session.completed","checkout.session.async_payment_succeeded","checkout.session.async_payment_failed","checkout.session.expired",
  "customer.subscription.created","customer.subscription.updated","customer.subscription.deleted",
  "invoice.paid","invoice.payment_failed"
]);

async function loadSubscription(id){
  if(!id) return null;
  return stripeRequest(`/subscriptions/${encodeURIComponent(id)}?expand[]=items.data.price`);
}

async function detectAiEvent(event){
  if(!AI_EVENT_TYPES.has(event.type)) return { isAi:false, subscription:null };
  const object=event.data?.object||{};
  if(event.type.startsWith("customer.subscription.")){
    return { isAi:object.metadata?.product_type==="ai_subscription",subscription:object };
  }
  if(event.type.startsWith("checkout.session.")){
    return { isAi:object.mode==="subscription"&&object.metadata?.product_type==="ai_subscription",subscription:null };
  }
  const subscriptionId=idOf(object.subscription)||idOf(object.parent?.subscription_details?.subscription);
  const subscription=await loadSubscription(subscriptionId);
  return { isAi:subscription?.metadata?.product_type==="ai_subscription",subscription };
}

async function processAiEvent(event,mode,preloadedSubscription){
  const object=event.data.object;
  const attemptId=object.metadata?.checkout_attempt_id||preloadedSubscription?.metadata?.checkout_attempt_id||null;
  if(["checkout.session.async_payment_failed","checkout.session.expired"].includes(event.type)){
    if(UUID.test(attemptId||"")){
      await dbRequest(`ai_checkout_attempts?id=eq.${encodeURIComponent(attemptId)}`,{
        method:"PATCH",prefer:"return=minimal",
        body:{status:event.type==="checkout.session.expired"?"expired":"payment_failed",updated_at:new Date().toISOString()}
      });
      await rpc("release_ai_founding_slot",{p_checkout_attempt_id:attemptId});
    }
    return;
  }

  let subscription=preloadedSubscription;
  if(!subscription){
    const subscriptionId=idOf(object.subscription)||(event.type.startsWith("customer.subscription.")?object.id:null);
    subscription=event.type.startsWith("customer.subscription.")?object:await loadSubscription(subscriptionId);
  }
  if(!subscription) return;

  const studentId=subscription.metadata?.student_id||object.metadata?.student_id;
  const checkoutAttemptId=subscription.metadata?.checkout_attempt_id||object.metadata?.checkout_attempt_id;
  if(!UUID.test(studentId||"")||!UUID.test(checkoutAttemptId||"")) throw new Error("ai_subscription_metadata_invalid");

  if(event.type.startsWith("invoice.")){
    await dbRequest("ai_payments?on_conflict=stripe_invoice_id",{
      method:"POST",prefer:"resolution=merge-duplicates,return=minimal",
      body:{
        stripe_invoice_id:object.id,
        student_id:studentId,
        stripe_subscription_id:subscription.id,
        stripe_mode:mode,
        amount_paid:object.amount_paid||0,
        currency:String(object.currency||"usd").toLowerCase(),
        status:event.type==="invoice.paid"?"paid":"payment_failed",
        paid_at:event.type==="invoice.paid"?new Date(event.created*1000).toISOString():null,
        updated_at:new Date().toISOString()
      }
    });
  }

  const priceId=idOf(subscription.items?.data?.[0]?.price);
  if(!priceId) throw new Error("ai_subscription_price_missing");

  let status=subscription.status;
  if(event.type==="invoice.payment_failed") status="past_due";
  if(event.type==="customer.subscription.deleted") status="canceled";
  const periodEnd=subscription.current_period_end
    ? new Date(subscription.current_period_end*1000).toISOString()
    : null;

  await rpc("apply_ai_subscription_state",{
    p_event_created:event.created,
    p_student_id:studentId,
    p_checkout_attempt_id:checkoutAttemptId,
    p_mode:mode,
    p_subscription_id:subscription.id,
    p_customer_id:idOf(subscription.customer),
    p_price_id:priceId,
    p_status:status,
    p_current_period_end:periodEnd,
    p_cancel_at_period_end:subscription.cancel_at_period_end===true
  });
}

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
      /* A package session carries its package id in metadata, written at checkout. Which
         finalizer runs is decided by that rather than by counting allocation rows, so a
         single-course purchase can never take the package path by accident. */
      const packageId = object.metadata?.package_id || null;
      await rpc(packageId ? "finalize_paid_package" : "finalize_paid_checkout", {
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
        ...(packageId ? { p_package_id: packageId } : {}),
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

const handler = async (event) => {
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
    // Verify the signed Event's mode, not client metadata, before claiming or writing it.
    if (typeof stripeEvent?.livemode !== "boolean") {
      return response(400, { error: "stripe_event_mode_required" });
    }
    if (stripeEvent.livemode !== (mode === "live")) {
      return response(400, { error: "stripe_event_mode_mismatch" });
    }
    const ai=await detectAiEvent(stripeEvent);
    const claimed = ai.isAi
      ? await rpc("claim_ai_stripe_event", {
          p_event_id:stripeEvent.id,p_event_type:stripeEvent.type,p_mode:mode,
          p_object_id:stripeEvent.data?.object?.id||null,p_event_created:stripeEvent.created
        })
      : await rpc("claim_stripe_event", {
          p_event_id: stripeEvent.id,
          p_event_type: stripeEvent.type,
          p_mode: mode,
          p_object_id: stripeEvent.data?.object?.id || null,
          p_created_at: new Date(stripeEvent.created * 1000).toISOString(),
        });
    if (claimed !== true) return response(200, { received: true, duplicate: true });

    try {
      if(ai.isAi) await processAiEvent(stripeEvent,mode,ai.subscription);
      else {
        await processEvent(stripeEvent, mode);
        await reconcileAgainstRecord(stripeEvent, stripeEvent.data?.object ?? {});
      }
      await rpc(ai.isAi?"complete_ai_stripe_event":"complete_stripe_event", ai.isAi?{p_event_id:stripeEvent.id}:{p_event_id:stripeEvent.id});
      return response(200, { received: true });
    } catch (error) {
      if(ai.isAi) await rpc("fail_ai_stripe_event",{p_event_id:stripeEvent.id,p_error_category:"processing_failed"});
      else await rpc("fail_stripe_event", { p_event_id: stripeEvent.id, p_error_code: "processing_failed" });
      throw error;
    }
  } catch (error) {
    return handleError(error);
  }
};

/* Exported so the integrity test and the webhook cannot disagree about which events are
   handled: an event missing from the switch leaves the database believing something Stripe
   has already moved on from. */
export const WEBHOOK_HANDLED_EVENTS = Object.freeze([...new Set([...HANDLED_STRIPE_EVENTS,...AI_EVENT_TYPES])]);

// Keep the existing Lambda handler contract on the modern Netlify runtime.
export {handler as legacyHandler};
export default withLambda(handler);
