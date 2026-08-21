import { randomUUID } from "node:crypto";
import { requireAdmin } from "./_lib/auth.mjs";
import { dbRequest, rpc } from "./_lib/db.mjs";
import { stripeRequest } from "./_lib/stripe.mjs";
import { stripeEnvironment } from "./_lib/env.mjs";
import { handleError, method, parseJson, response } from "./_lib/http.mjs";
import { REFUND_POLICY_VERSION, evaluateRefund } from "../../lib/refund-policy.mjs";

/*
 * Refunds under California policy CA-2026-08-20-v1.
 *
 * What changed and why: this endpoint used to refund whatever amount an administrator
 * passed, gated on a boolean called policyReviewApproved. That made the policy a claim
 * rather than a control — nothing computed what the student was actually owed, and nothing
 * could reproduce the figure afterwards. The policy now decides the amount. An
 * administrator may still refund LESS than the policy allows, because a smaller refund
 * cannot harm the student; refunding MORE is an override and must be asked for explicitly,
 * and either way the policy's own decision is recorded next to the amount that was sent.
 *
 * The policy is not implemented here. It lives in lib/refund-policy.mjs, which has no
 * database and no Stripe in it and is therefore testable directly; this function fetches
 * facts, calls it, and executes the result.
 */
export const handler = async (event) => {
  try {
    method(event, "POST");
    requireAdmin(event);
    const input = parseJson(event);
    if (!String(input.reason || "").trim()) {
      throw Object.assign(new Error("reason_required"), { statusCode: 400 });
    }
    if (!input.paymentId) {
      throw Object.assign(new Error("payment_id_required"), { statusCode: 400 });
    }
    const rows = await dbRequest(
      `payments?id=eq.${encodeURIComponent(input.paymentId)}&select=id,stripe_payment_intent_id,amount,refund_amount,currency,stripe_mode,state&limit=1`,
    );
    const payment = rows?.[0];
    if (!payment) throw Object.assign(new Error("payment_not_found"), { statusCode: 404 });
    if (payment.stripe_mode !== stripeEnvironment().mode) {
      throw Object.assign(new Error("payment_environment_mismatch"), { statusCode: 409 });
    }
    const remaining = payment.amount - payment.refund_amount;
    if (remaining <= 0) throw Object.assign(new Error("payment_fully_refunded"), { statusCode: 409 });

    /* The effective date the policy uses is the date the request was received, not the date
       an administrator got round to processing it. A caller may supply the received date for
       a request that arrived by email; absent one, the request is being made now. */
    const requestReceivedAt = input.requestReceivedAt ? new Date(input.requestReceivedAt) : new Date();
    if (Number.isNaN(requestReceivedAt.getTime())) {
      throw Object.assign(new Error("invalid_request_received_at"), { statusCode: 400 });
    }

    const basisRows = await rpc("california_refund_basis", { p_payment_id: payment.id });
    if (!Array.isArray(basisRows) || basisRows.length === 0) {
      throw Object.assign(new Error("refund_basis_unavailable"), { statusCode: 409 });
    }

    /* A null percent_complete means the course has no assignment definitions to measure
       against. It is NOT zero. Zero is the most refund-favourable value the policy has, and
       coercing an unknown into it would refund in full on missing data. */
    const decision = evaluateRefund(
      basisRows.map((row) => {
        if (row.percent_complete == null) {
          throw Object.assign(new Error(`refund_progress_unknown_for_${row.course_id}`), { statusCode: 409 });
        }
        return {
          courseId: row.course_id,
          allocatedAmount: Number(row.allocated_amount),
          alreadyRefunded: Number(row.already_refunded ?? 0),
          enrolledAt: row.enrolled_at,
          firstAssignmentCompletedAt: row.first_assignment_completed_at ?? null,
          requestReceivedAt,
          percentComplete: Number(row.percent_complete),
          finalExamAttempted: row.final_exam_attempted === true,
          certificateIssued: row.certificate_issued === true,
        };
      }),
    );

    const requested = input.amount == null ? decision.amount : Number(input.amount);
    if (!Number.isSafeInteger(requested) || requested <= 0) {
      throw Object.assign(new Error("invalid_refund_amount"), { statusCode: 400 });
    }
    if (requested > remaining) throw Object.assign(new Error("invalid_refund_amount"), { statusCode: 400 });

    const overridden = requested > decision.amount;
    if (overridden && input.policyOverrideApproved !== true) {
      throw Object.assign(
        Object.assign(new Error("exceeds_policy_entitlement"), {
          policyVersion: decision.policyVersion,
          policyAmount: decision.amount,
          courses: decision.courses,
        }),
        { statusCode: 409 },
      );
    }
    if (decision.amount === 0 && !overridden) {
      throw Object.assign(
        Object.assign(new Error("no_refund_due_under_policy"), {
          policyVersion: decision.policyVersion,
          courses: decision.courses,
        }),
        { statusCode: 409 },
      );
    }

    const requestId = randomUUID();
    /* Stripe returns a refund to the original payment method by default; the policy requires
       it, so no destination is passed and none may be. */
    const refund = await stripeRequest("/refunds", {
      method: "POST",
      idempotencyKey: `refund-${requestId}`,
      params: {
        payment_intent: payment.stripe_payment_intent_id,
        amount: requested,
        "metadata[statecourse_payment_id]": payment.id,
        "metadata[refund_policy_version]": decision.policyVersion,
        "metadata[policy_amount]": String(decision.amount),
        "metadata[policy_overridden]": overridden ? "true" : "false",
      },
    });
    await rpc("record_refund_request", {
      p_request_id: requestId,
      p_payment_id: payment.id,
      p_stripe_refund_id: refund.id,
      p_amount: requested,
      p_currency: payment.currency,
      p_status: refund.status || "pending",
      p_reason: String(input.reason).slice(0, 500),
    });
    await rpc("record_refund_policy_decision", {
      p_stripe_refund_id: refund.id,
      p_policy_version: decision.policyVersion,
      p_policy_outcome: decision.outcome,
      p_policy_amount: decision.amount,
      p_policy_reason: decision.courses.map((course) => `${course.courseId}: ${course.reason}`).join(" "),
      p_overridden: overridden,
    });
    return response(202, {
      refundId: refund.id,
      status: refund.status,
      amount: requested,
      currency: payment.currency,
      policy: {
        version: decision.policyVersion,
        outcome: decision.outcome,
        entitlement: decision.amount,
        overridden,
        courses: decision.courses,
      },
    });
  } catch (error) {
    return handleError(error);
  }
};

export const REFUND_ENDPOINT_POLICY_VERSION = REFUND_POLICY_VERSION;
