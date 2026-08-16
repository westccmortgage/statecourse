import { randomUUID } from "node:crypto";
import { requireAdmin } from "./_lib/auth.mjs";
import { dbRequest, rpc } from "./_lib/db.mjs";
import { stripeRequest } from "./_lib/stripe.mjs";
import { stripeEnvironment } from "./_lib/env.mjs";
import { handleError, method, parseJson, response } from "./_lib/http.mjs";

export const handler = async (event) => {
  try {
    method(event, "POST");
    requireAdmin(event);
    const input = parseJson(event);
    if (!input.paymentId || input.policyReviewApproved !== true || !String(input.reason || "").trim()) {
      throw Object.assign(new Error("policy_review_and_reason_required"), { statusCode: 400 });
    }
    const rows = await dbRequest(
      `payments?id=eq.${encodeURIComponent(input.paymentId)}&select=id,stripe_payment_intent_id,amount,refund_amount,currency,stripe_mode&limit=1`,
    );
    const payment = rows?.[0];
    if (!payment) throw Object.assign(new Error("payment_not_found"), { statusCode: 404 });
    if (payment.stripe_mode !== stripeEnvironment().mode) {
      throw Object.assign(new Error("payment_environment_mismatch"), { statusCode: 409 });
    }
    const remaining = payment.amount - payment.refund_amount;
    const amount = input.amount == null ? remaining : Number(input.amount);
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > remaining) {
      throw Object.assign(new Error("invalid_refund_amount"), { statusCode: 400 });
    }
    const requestId = randomUUID();
    const refund = await stripeRequest("/refunds", {
      method: "POST",
      idempotencyKey: `refund-${requestId}`,
      params: {
        payment_intent: payment.stripe_payment_intent_id,
        amount,
        "metadata[statecourse_payment_id]": payment.id,
        "metadata[admin_policy_review]": "approved",
      },
    });
    await rpc("record_refund_request", {
      p_request_id: requestId,
      p_payment_id: payment.id,
      p_stripe_refund_id: refund.id,
      p_amount: amount,
      p_currency: payment.currency,
      p_status: refund.status || "pending",
      p_reason: String(input.reason).slice(0, 500),
    });
    return response(202, { refundId: refund.id, status: refund.status, amount, currency: payment.currency });
  } catch (error) {
    return handleError(error);
  }
};
