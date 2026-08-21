import { requireAdmin } from "./_lib/auth.mjs";
import { dbRequest, rpc } from "./_lib/db.mjs";
import { handleError, method, parseJson, response } from "./_lib/http.mjs";
import { REFUND_POLICY_VERSION, evaluateRefund } from "../../lib/refund-policy.mjs";

/*
 * External refunds: assessing what the policy would have allowed, and surfacing the gap.
 *
 * A refund made by hand in the Stripe Dashboard has already been paid. Nothing here reverses
 * it and nothing here should — the money moved, the student has it, and the only question left
 * is whether our record says what Stripe's says and whether a person needs to look at it.
 *
 * The webhook records the refund at Stripe's amount and marks it external with its entitlement
 * unassessed. This does the assessment, because it needs the student's course progress and the
 * webhook must stay clear of compliance records in both directions: payment never determines
 * study time, examination eligibility, credit or a certificate, and the surest way to keep that
 * true is for the payment path not to read those records at all.
 *
 * GET  — the two lists an administrator needs: refunds awaiting assessment, and refunds that
 *        exceeded the entitlement and are awaiting a human decision.
 * POST — assess the unassessed. Computes each entitlement from the same engine the refund path
 *        uses, so "what we would have allowed" is a comparable number and not a second opinion.
 */
export const handler = async (event) => {
  try {
    requireAdmin(event);

    if ((event.httpMethod || "").toUpperCase() === "GET") {
      const [unassessed, exceptions] = await Promise.all([
        dbRequest("external_refunds_unassessed?select=*&order=created_at.asc"),
        dbRequest("refund_policy_exceptions_open?select=*&order=created_at.asc"),
      ]);
      return response(200, {
        policyVersion: REFUND_POLICY_VERSION,
        unassessed: unassessed ?? [],
        exceptions: exceptions ?? [],
      });
    }

    method(event, "POST");
    const input = parseJson(event);
    const pending = await dbRequest("external_refunds_unassessed?select=stripe_refund_id,payment_id,actual_amount");
    const targets = input.stripeRefundId
      ? (pending ?? []).filter((row) => row.stripe_refund_id === input.stripeRefundId)
      : (pending ?? []);
    if (input.stripeRefundId && targets.length === 0) {
      throw Object.assign(new Error("refund_not_awaiting_assessment"), { statusCode: 404 });
    }

    const assessed = [];
    const unassessable = [];
    for (const row of targets) {
      let basisRows;
      try {
        basisRows = await rpc("california_refund_basis", { p_payment_id: row.payment_id });
      } catch (error) {
        unassessable.push({ stripeRefundId: row.stripe_refund_id, reason: error.message });
        continue;
      }
      /* An entitlement that cannot be computed is left unassessed and reported as such. A
         guessed figure would put a number in front of an administrator that nothing stands
         behind, and they would act on it. */
      if (!Array.isArray(basisRows) || basisRows.length === 0 || basisRows.some((basis) => basis.percent_complete == null)) {
        unassessable.push({ stripeRefundId: row.stripe_refund_id, reason: "course_progress_incomplete" });
        continue;
      }

      /* The effective date for a refund nobody requested through us is the date it was made,
         which is the only date there is. alreadyRefunded is zero on purpose: the question is
         what the student was entitled to at that moment, not what remains payable now. */
      const decision = evaluateRefund(
        basisRows.map((basis) => ({
          courseId: basis.course_id,
          allocatedAmount: Number(basis.allocated_amount),
          alreadyRefunded: 0,
          enrolledAt: basis.enrolled_at,
          firstAssignmentCompletedAt: basis.first_assignment_completed_at ?? null,
          requestReceivedAt: input.effectiveDate ? new Date(input.effectiveDate) : new Date(),
          percentComplete: Number(basis.percent_complete),
          finalExamAttempted: basis.final_exam_attempted === true,
          certificateIssued: basis.certificate_issued === true,
        })),
      );

      await rpc("assess_external_refund", {
        p_stripe_refund_id: row.stripe_refund_id,
        p_policy_amount: decision.amount,
        p_note: `Assessed against ${decision.policyVersion}: ${decision.courses.map((course) => `${course.courseId}: ${course.reason}`).join(" ")}`,
      });
      assessed.push({
        stripeRefundId: row.stripe_refund_id,
        actualAmount: Number(row.actual_amount),
        entitlement: decision.amount,
        exceedsBy: Math.max(0, Number(row.actual_amount) - decision.amount),
        outcome: decision.outcome,
      });
    }

    return response(200, {
      policyVersion: REFUND_POLICY_VERSION,
      assessed,
      unassessable,
      /* Stated rather than implied: an assessment records a discrepancy. It does not and
         cannot undo a refund that has already been paid. */
      note: "Assessment records the discrepancy for review. A refund that has already been paid is not altered by it.",
    });
  } catch (error) {
    return handleError(error);
  }
};
