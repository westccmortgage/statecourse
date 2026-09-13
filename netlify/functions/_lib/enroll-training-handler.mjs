import { dbRequest } from "./db.mjs";
import { parseJson, requireSameOrigin } from "./http.mjs";
import { requireStudentSession, sessionCookies, sessionResponse } from "./student-session.mjs";
import { ensureTrainingEnrollment } from "./training-access.mjs";
import { governanceFor, representationCopy } from "./offering-governance.mjs";
import { NMLS_TRAINING_COURSE as nmls, isNmlsTrainingCourse } from '../../../config/nmls-course-identity.mjs';

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

export const handleTrainingEnrollment = async (event) => {
  let cookies = [];
  try {
    if (event.httpMethod !== "POST") fail("method_not_allowed", 405);
    requireSameOrigin(event);
    const auth = await requireStudentSession(event);
    cookies = auth.refreshedSession ? sessionCookies(auth.refreshedSession) : [];
    const input = parseJson(event);
    if(!input||typeof input!=='object'||Array.isArray(input)||typeof input.courseId!=='string')fail('invalid_course_id');
    const courseId = String(input.courseId || "").trim();
    if (!courseId) fail("invalid_course_id");

    const status = await governanceFor(courseId);
    if (status.training_access_enabled !== true) {
      throw Object.assign(new Error("training_access_not_enabled_for_this_offering"), {
        statusCode: 403,
        detail: { courseId, approvalStatus: status.approval_status },
      });
    }
    if(isNmlsTrainingCourse(courseId)&&(status.offering_id!==nmls.id||status.offering_kind!=='course'||status.state!==nmls.state||status.discipline!==nmls.discipline))fail('nmls_training_governance_mismatch',403);

    const course = (await dbRequest(
      `courses?id=eq.${encodeURIComponent(courseId)}&select=id,state,name,current_version,product_type&limit=1`,
    ))?.[0];
    if (!course) fail("unknown_course", 404);

    const { enrollment, existing } = await ensureTrainingEnrollment(auth.student.id,course);
    if(enrollment.enrollment_origin!=='training')return sessionResponse(200,{
      enrollmentId:enrollment.id,courseId,courseName:course.name,state:course.state,
      origin:enrollment.enrollment_origin,existing:true,creditEligible:Boolean(enrollment.compliance_credit_eligible),
      href:`/student-course.html?enrollment_id=${encodeURIComponent(enrollment.id)}`,
    },cookies);

    const copy = representationCopy({representation:"training_only"});
    return sessionResponse(200, {
      enrollmentId: enrollment.id,
      courseId,
      courseName: course.name,
      state: course.state,
      origin: enrollment.enrollment_origin,
      existing,
      href: `${isNmlsTrainingCourse(courseId)?nmls.studentRoute:'/student-course.html'}?enrollment_id=${encodeURIComponent(enrollment.id)}`,
      /* Repeated on the response so a page showing it cannot quietly omit it. */
      creditEligible: false,
      representation: copy.representation,
      badge: copy.badge,
      statement: copy.statement,
      paidNothing: true,
    }, cookies);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Training enrolment unavailable");
    return sessionResponse(status, {
      error: status >= 500 ? "training_enrolment_unavailable" : error.message,
      ...(status < 500 && error?.detail ? { detail: error.detail } : {}),
    }, cookies);
  }
};
