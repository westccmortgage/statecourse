import { stripeRequest } from "./_lib/stripe.mjs";
import { dbRequest } from "./_lib/db.mjs";
import { handleError, method, response } from "./_lib/http.mjs";

export const handler = async (event) => {
  try {
    method(event, "GET");
    const sessionId = event.queryStringParameters?.session_id || "";
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
      throw Object.assign(new Error("invalid_session_id"), { statusCode: 400 });
    }
    const session = await stripeRequest(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
    const rows = await dbRequest(
      `payments?stripe_checkout_session_id=eq.${encodeURIComponent(sessionId)}&select=id,status,enrollment_id,course_id,state,amount,currency,refund_status,refund_amount,qa_only&limit=1`,
    );
    const payment = rows?.[0] || null;
    return response(200, {
      paymentStatus: session.payment_status,
      checkoutStatus: session.status,
      courseId: session.metadata?.course_id || payment?.course_id || null,
      enrollmentId: payment?.enrollment_id || null,
      enrollmentStatus: payment ? (payment.qa_only ? "qa_non_credit" : "active") : "pending_webhook",
      amount: session.amount_total,
      currency: session.currency,
      refundStatus: payment?.refund_status || "none",
    });
  } catch (error) {
    return handleError(error);
  }
};
