import { randomUUID } from "node:crypto";
import { getCourse, evaluateCheckoutEligibility } from "../../config/course-catalog.mjs";
import { baseUrl, stripeEnvironment } from "./_lib/env.mjs";
import { dbRequest } from "./_lib/db.mjs";
import { stripeRequest } from "./_lib/stripe.mjs";
import { handleError, method, parseJson, requireSameOrigin, response } from "./_lib/http.mjs";
import { resolveCheckoutStudent } from "./_lib/student-auth.mjs";

export const handler = async (event) => {
  try {
    method(event, "POST");
    requireSameOrigin(event);
    const input = parseJson(event);
    const course = getCourse(input.courseId);
    const { mode } = stripeEnvironment();
    const eligibility = evaluateCheckoutEligibility(course, mode);
    if (!eligibility.allowed) throw Object.assign(new Error(eligibility.reason), { statusCode: 409 });
    if (input.state !== course.state) throw Object.assign(new Error("course_state_mismatch"), { statusCode: 400 });

    const accepted = input.acceptedVersions || {};
    for (const [key, version] of Object.entries(course.versions)) {
      if (accepted[key] !== version) throw Object.assign(new Error(`missing_or_stale_${key}`), { statusCode: 409 });
    }

    const attemptId = randomUUID();
    const amount = course.price[mode];
    const qaOnly = Boolean(eligibility.qaOnly);
    const student = await resolveCheckoutStudent(event, input, { qaOnly });
    await dbRequest("checkout_attempts", {
      method: "POST",
      prefer: "return=minimal",
      body: {
        id: attemptId,
        student_id: student.id,
        course_id: course.id,
        state: course.state,
        stripe_mode: mode,
        amount,
        currency: course.currency,
        status: "creating",
        regulatory_acknowledgment_version: course.versions.regulatoryAcknowledgment,
        terms_version: course.versions.terms,
        refund_policy_version: course.versions.refundPolicy,
        cancellation_policy_version: course.versions.cancellationPolicy,
        qa_only: qaOnly,
      },
    });

    /* CA-2026-08-20-v1 calculates a refund course by course, so every purchase records how
       many cents belong to each course before the student is sent to Stripe. A single-course
       purchase is one row for the whole amount; the row is written anyway, so the refund
       path has one shape rather than two and the package case is not the only one exercised
       by a code path nobody runs. */
    await dbRequest("checkout_course_allocations", {
      method: "POST",
      prefer: "return=minimal",
      body: {
        checkout_attempt_id: attemptId,
        course_id: course.id,
        allocated_amount: amount,
        list_amount: amount,
        package_id: null,
        policy_version: course.versions.refundPolicy,
      },
    });

    const origin = baseUrl();
    const session = await stripeRequest("/checkout/sessions", {
      method: "POST",
      idempotencyKey: `checkout-${attemptId}`,
      params: {
        mode: "payment",
        customer_creation: "always",
        customer_email: student.email,
        client_reference_id: attemptId,
        allow_promotion_codes: "true",
        billing_address_collection: "required",
        "automatic_tax[enabled]": process.env.STATECOURSE_STRIPE_AUTOMATIC_TAX_ENABLED === "true" ? "true" : "false",
        "line_items[0][quantity]": 1,
        "line_items[0][price_data][currency]": course.currency,
        "line_items[0][price_data][unit_amount]": amount,
        "line_items[0][price_data][product_data][name]": course.name,
        success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/enroll?course=${encodeURIComponent(course.id)}&checkout=cancelled`,
        "metadata[checkout_attempt_id]": attemptId,
        "metadata[student_id]": student.id,
        "metadata[course_id]": course.id,
        "metadata[state]": course.state,
        "metadata[qa_only]": qaOnly ? "true" : "false",
        "metadata[regulatory_acknowledgment_version]": course.versions.regulatoryAcknowledgment,
        "metadata[terms_version]": course.versions.terms,
        "metadata[refund_policy_version]": course.versions.refundPolicy,
        "metadata[cancellation_policy_version]": course.versions.cancellationPolicy,
        "payment_intent_data[metadata][checkout_attempt_id]": attemptId,
        "payment_intent_data[metadata][course_id]": course.id,
      },
    });

    await dbRequest(`checkout_attempts?id=eq.${attemptId}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: { stripe_checkout_session_id: session.id, status: "checkout_created" },
    });
    return response(200, { checkoutUrl: session.url, sessionId: session.id, mode, qaOnly });
  } catch (error) {
    return handleError(error);
  }
};
