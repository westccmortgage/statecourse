import { dbRequest } from "./_lib/db.mjs";
import { parseJson, requireSameOrigin } from "./_lib/http.mjs";
import { requireStudentSession, sessionCookies, sessionResponse } from "./_lib/student-session.mjs";
import { governanceFor, representationCopy } from "./_lib/offering-governance.mjs";

/*
 * Free training enrolment.
 *
 * Deliberately not a checkout with the price set to zero. It creates no checkout attempt,
 * no payment row and no Stripe object, because none of those things happened; the payment
 * ledger stays a record of money and nothing else.
 *
 * What a student gets is study access. What they do not get is credit: the enrolment is
 * written with enrollment_origin 'training', and the database refuses to mark such a row
 * credit-eligible. The response says so in the same words the offering's public status
 * uses, so a page cannot describe this as licensing education.
 */

function fail(message, statusCode = 400) {
  throw Object.assign(new Error(message), { statusCode });
}

export const handler = async (event) => {
  let cookies = [];
  try {
    if (event.httpMethod !== "POST") fail("method_not_allowed", 405);
    requireSameOrigin(event);
    const auth = await requireStudentSession(event);
    cookies = auth.refreshedSession ? sessionCookies(auth.refreshedSession) : [];
    const input = parseJson(event);
    const courseId = String(input.courseId || "").trim();
    if (!courseId) fail("invalid_course_id");

    const status = await governanceFor(courseId);
    if (status.training_access_enabled !== true) {
      throw Object.assign(new Error("training_access_not_enabled_for_this_offering"), {
        statusCode: 403,
        detail: { courseId, approvalStatus: status.approval_status },
      });
    }

    const course = (await dbRequest(
      `courses?id=eq.${encodeURIComponent(courseId)}&select=id,state,name&limit=1`,
    ))?.[0];
    if (!course) fail("unknown_course", 404);

    /* One training enrolment per student per course; a second request returns the first
       rather than creating a parallel enrolment. */
    const existing = (await dbRequest(
      `enrollments?student_id=eq.${encodeURIComponent(auth.student.id)}`
        + `&course_id=eq.${encodeURIComponent(courseId)}&select=id,status,enrollment_origin,compliance_credit_eligible&limit=1`,
    ))?.[0];

    let enrollment = existing;
    if (!enrollment) {
      const created = await dbRequest("enrollments", {
        method: "POST",
        prefer: "return=representation",
        body: {
          student_id: auth.student.id,
          course_id: courseId,
          state: course.state,
          status: "active",
          /* Never true for training. The database refuses it as well. */
          compliance_credit_eligible: false,
          enrollment_origin: "training",
          checkout_attempt_id: null,
        },
      });
      enrollment = Array.isArray(created) ? created[0] : created;
      if (!enrollment?.id) fail("training_enrolment_failed", 503);
    }

    const grant = (await dbRequest(
      `access_grants?enrollment_id=eq.${encodeURIComponent(enrollment.id)}&select=id,status&limit=1`,
    ))?.[0];
    if (!grant) {
      await dbRequest("access_grants", {
        method: "POST",
        prefer: "return=minimal",
        body: {
          enrollment_id: enrollment.id,
          student_id: auth.student.id,
          course_id: courseId,
          status: "active",
        },
      });
    }

    const copy = representationCopy(status);
    return sessionResponse(200, {
      enrollmentId: enrollment.id,
      courseId,
      courseName: course.name,
      state: course.state,
      origin: "training",
      /* Repeated on the response so a page showing it cannot quietly omit it. */
      creditEligible: false,
      representation: copy.representation,
      badge: copy.badge,
      statement: copy.statement,
      paidNothing: true,
    }, cookies);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Training enrolment error", error?.message);
    return sessionResponse(status, {
      error: status >= 500 ? "training_enrolment_unavailable" : error.message,
      ...(status < 500 && error?.detail ? { detail: error.detail } : {}),
    }, cookies);
  }
};
