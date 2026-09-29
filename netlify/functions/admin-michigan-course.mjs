import { requireStaff } from "./_lib/staff-session.mjs";
import { dbRequest, rpc } from "./_lib/db.mjs";
import { parseJson, requireSameOrigin } from "./_lib/http.mjs";
import {
  requireStudentSession,
  sessionCookies,
  sessionResponse,
} from "./_lib/student-session.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[0-9a-f]{64}$/;

function fail(message, statusCode = 400) {
  throw Object.assign(new Error(message), { statusCode });
}

function uuid(value, name) {
  const result = String(value || "");
  if (!UUID.test(result)) fail(`invalid_${name}`);
  return result;
}

function optionalDate(value, name) {
  if (value == null || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) fail(`invalid_${name}`);
  return date.toISOString();
}

function rejectBrowserActorIdentity(input) {
  for (const field of [
    "reviewerInstructorId",
    "reviewer_instructor_id",
    "verifiedBy",
    "verified_by",
    "recordedBy",
    "recorded_by",
    "studentId",
    "student_id",
    "subjectId",
    "subject_id",
    "instructorId",
    "instructor_id",
    "authUserId",
    "auth_user_id",
  ]) {
    if (Object.hasOwn(input, field)) fail("browser_actor_identity_not_accepted");
  }
}

async function staffBinding(authUserId, allowedRoles) {
  const rows = await dbRequest(
    `michigan_current_staff_actor_bindings?auth_user_id=eq.${encodeURIComponent(authUserId)}`
      + "&select=auth_user_id,actor_role,instructor_id,binding_status,effective_at,expires_at&limit=1",
  );
  const binding = rows?.[0];
  const now = Date.now();
  const effective = binding?.effective_at ? new Date(binding.effective_at).valueOf() : null;
  const expires = binding?.expires_at ? new Date(binding.expires_at).valueOf() : null;
  if (!binding
    || binding.binding_status !== "active"
    || !allowedRoles.includes(binding.actor_role)
    || (effective != null && effective > now)
    || (expires != null && expires <= now)) {
    fail("michigan_named_staff_binding_required", 403);
  }
  if (binding.actor_role === "instructor" && !UUID.test(binding.instructor_id || "")) {
    fail("michigan_instructor_binding_invalid", 403);
  }
  return binding;
}

async function currentInstructorSubject() {
  const rows = await dbRequest(
    "michigan_current_staff_actor_bindings?actor_role=eq.instructor"
      + "&binding_status=eq.active&select=instructor_id,effective_at,expires_at",
  );
  const now = Date.now();
  const instructorIds = [...new Set((rows || []).filter((binding) => {
    const effective = binding.effective_at ? new Date(binding.effective_at).valueOf() : null;
    const expires = binding.expires_at ? new Date(binding.expires_at).valueOf() : null;
    return UUID.test(binding.instructor_id || "")
      && (effective == null || effective <= now)
      && (expires == null || expires > now);
  }).map((binding) => binding.instructor_id))];
  if (instructorIds.length !== 1) fail("michigan_unique_current_instructor_binding_required", 409);
  return instructorIds[0];
}

async function michiganRpc(name, args) {
  try {
    return await rpc(name, args);
  } catch (error) {
    if (/michigan_/i.test(String(error?.message || ""))) {
      throw Object.assign(new Error(error.message), { statusCode: 409 });
    }
    throw error;
  }
}

async function evidenceFor(enrollmentId) {
  const enrollment = (await dbRequest(
    `enrollments?id=eq.${enrollmentId}&course_id=eq.mi-salesperson-prelicensure-40-v1&select=id,student_id,course_id,course_version,status,compliance_credit_eligible,created_at,completed_at&limit=1`,
  ))?.[0];
  if (!enrollment) fail("michigan_enrollment_not_found", 404);
  const versions = await dbRequest(
    `michigan_applied_memo_versions?enrollment_id=eq.${enrollmentId}`
      + "&select=id,module_id,submission_version,response_text,content_sha256,submitted_at"
      + "&order=module_id.asc,submission_version.asc",
  );
  const submissionIds = (versions || []).map((item) => item.id).filter((id) => UUID.test(id));
  const [reviews, modules, identity, attestation, certificates, reports, status, capacity] = await Promise.all([
    submissionIds.length ? dbRequest(
      `michigan_applied_memo_reviews?submission_id=in.(${submissionIds.join(",")})`
        + "&select=submission_id,rubric_version,criterion_scores,criterion_feedback,total_points,outcome,reviewed_at",
    ) : [],
    dbRequest(`lms_assignment_state?enrollment_id=eq.${enrollmentId}&select=assignment_id,status,viewed_sections,applied_exercise_complete,engagement_check_complete,remediation_status,active_seconds,completed_at&order=assignment_id.asc`),
    dbRequest(`michigan_identity_verification_events?enrollment_id=eq.${enrollmentId}&select=id,verification_status,legal_name,verification_method,evidence_reference,evidence_sha256,recorded_at&order=recorded_at.asc`),
    dbRequest(`michigan_asynchronous_attestation_events?enrollment_id=eq.${enrollmentId}&select=id,attestation_status,statement_version,signed_legal_name,clock_hours,signature_evidence_sha256,recorded_at&order=recorded_at.asc`),
    dbRequest(`michigan_completion_certificates?enrollment_id=eq.${enrollmentId}&select=id,certificate_identifier,completed_at,issued_at,status,pss_school_number,bpl_sponsor_number,bpl_course_number`),
    dbRequest(`michigan_completion_reports?enrollment_id=eq.${enrollmentId}&select=id,report_version,reporting_channel,reporting_format,payload_sha256,status,generated_at,submitted_at`),
    michiganRpc("michigan_operational_status", { p_enrollment_id: enrollmentId }),
    michiganRpc("michigan_capacity_status", {}),
  ]);
  const reviewBySubmission = new Map((reviews || []).map((item) => [item.submission_id, item]));
  return {
    enrollment,
    modules,
    memos: (versions || []).map((item) => ({ ...item, review: reviewBySubmission.get(item.id) || null })),
    identity,
    attestation,
    certificates,
    reports,
    status,
    capacity,
    readOnly: true,
    approvalClaim: false,
  };
}

async function studentForEnrollment(enrollmentId) {
  const enrollment = (await dbRequest(
    `enrollments?id=eq.${enrollmentId}&course_id=eq.mi-salesperson-prelicensure-40-v1&select=id,student_id&limit=1`,
  ))?.[0];
  if (!enrollment) fail("michigan_enrollment_not_found", 404);
  return enrollment.student_id;
}

export const handler = async (event) => {
  let cookies = [];
  try {
    const { auth } = await requireStaff(event, ["owner", "administrator", "instructor"], {state:"MI"});
    cookies = auth.refreshedSession ? sessionCookies(auth.refreshedSession) : [];

    if (event.httpMethod === "GET") {
      const view = String(event.queryStringParameters?.view || "queue");
      if (view === "queue") {
        const binding = await staffBinding(auth.student.id, ["instructor"]);
        const [records, capacity] = await Promise.all([
          dbRequest("michigan_memo_review_queue?select=*&order=submitted_at.asc"),
          michiganRpc("michigan_capacity_status", {}),
        ]);
        return sessionResponse(200, {
          records: records || [],
          capacity,
          actorRole: binding.actor_role,
          approvalClaim: false,
        }, cookies);
      }
      if (view === "evidence") {
        await staffBinding(auth.student.id, ["instructor", "administrator", "regulator_reviewer"]);
        const enrollmentId = uuid(event.queryStringParameters?.enrollment_id, "enrollment_id");
        return sessionResponse(200, { evidence: await evidenceFor(enrollmentId) }, cookies);
      }
      fail("invalid_michigan_admin_view");
    }

    if (event.httpMethod !== "POST") fail("method_not_allowed", 405);
    requireSameOrigin(event);
    const input = parseJson(event);
    rejectBrowserActorIdentity(input);
    const eventType = String(input.eventType || "");
    let result;

    if (eventType === "review_memo") {
      const binding = await staffBinding(auth.student.id, ["instructor"]);
      result = await michiganRpc("review_michigan_applied_memo", {
        p_submission_id: uuid(input.submissionId, "submission_id"),
        p_reviewer_instructor_id: binding.instructor_id,
        p_scores: input.scores,
        p_feedback: input.feedback,
      });
    } else if (eventType === "verify_identity") {
      await staffBinding(auth.student.id, ["administrator"]);
      if (!SHA256.test(String(input.evidenceSha256 || ""))) fail("invalid_identity_evidence_digest");
      const enrollmentId = uuid(input.enrollmentId, "enrollment_id");
      result = await michiganRpc("record_michigan_identity_verification", {
        p_enrollment_id: enrollmentId,
        p_student_id: await studentForEnrollment(enrollmentId),
        p_legal_name: String(input.legalName || ""),
        p_method: String(input.method || ""),
        p_evidence_reference: String(input.evidenceReference || ""),
        p_evidence_sha256: input.evidenceSha256,
        p_verified_by: auth.student.id,
      });
    } else if (eventType === "record_authority") {
      await staffBinding(auth.student.id, ["administrator"]);
      const authorityKind = String(input.authorityKind || "");
      result = await michiganRpc("record_michigan_authority_event", {
        p_authority_kind: authorityKind,
        p_authority_status: String(input.authorityStatus || ""),
        p_identifier: input.identifier == null ? null : String(input.identifier),
        p_subject_id: authorityKind === "instructor" ? await currentInstructorSubject() : null,
        p_effective_at: optionalDate(input.effectiveAt, "effective_at"),
        p_expires_at: optionalDate(input.expiresAt, "expires_at"),
        p_evidence: input.evidence || {},
        p_recorded_by: auth.student.id,
      });
    } else if (eventType === "configure_outputs") {
      await staffBinding(auth.student.id, ["administrator"]);
      result = await michiganRpc("record_michigan_runtime_configuration", {
        p_identifier_requirements_confirmed: input.identifierRequirementsConfirmed === true,
        p_pss_school_number: input.pssSchoolNumber == null ? null : String(input.pssSchoolNumber),
        p_bpl_sponsor_number: input.bplSponsorNumber == null ? null : String(input.bplSponsorNumber),
        p_bpl_course_number: input.bplCourseNumber == null ? null : String(input.bplCourseNumber),
        p_reporting_requirements_confirmed: input.reportingRequirementsConfirmed === true,
        p_reporting_channel: input.reportingChannel == null ? null : String(input.reportingChannel),
        p_reporting_format: input.reportingFormat == null ? null : String(input.reportingFormat),
        p_evidence: input.evidence || {},
        p_recorded_by: auth.student.id,
      });
    } else if (eventType === "record_operational_policy") {
      await staffBinding(auth.student.id, ["administrator"]);
      result = await michiganRpc("record_michigan_operational_policy", {
        p_policy_status: String(input.policyStatus || ""),
        p_active_student_cap: Number(input.activeStudentCap),
        p_review_sla_business_days: Number(input.reviewSlaBusinessDays),
        p_instructor_available: input.instructorAvailable === true,
        p_waitlist_enabled: input.waitlistEnabled === true,
        p_calendar_confirmed_through: input.calendarConfirmedThrough || null,
        p_closed_dates: Array.isArray(input.closedDates) ? input.closedDates : [],
        p_evidence: input.evidence || {},
        p_recorded_by: auth.student.id,
      });
    } else if (eventType === "record_completion") {
      await staffBinding(auth.student.id, ["administrator"]);
      result = await michiganRpc("record_michigan_completion", {
        p_enrollment_id: uuid(input.enrollmentId, "enrollment_id"),
      });
    } else if (eventType === "issue_certificate") {
      await staffBinding(auth.student.id, ["administrator"]);
      result = await michiganRpc("issue_michigan_completion_certificate", {
        p_enrollment_id: uuid(input.enrollmentId, "enrollment_id"),
      });
    } else if (eventType === "build_completion_report") {
      await staffBinding(auth.student.id, ["administrator"]);
      result = await michiganRpc("build_michigan_completion_report", {
        p_enrollment_id: uuid(input.enrollmentId, "enrollment_id"),
      });
    } else if (eventType === "status") {
      await staffBinding(auth.student.id, ["instructor", "administrator", "regulator_reviewer"]);
      result = await michiganRpc("michigan_operational_status", {
        p_enrollment_id: uuid(input.enrollmentId, "enrollment_id"),
      });
    } else {
      fail("invalid_michigan_admin_event");
    }

    return sessionResponse(200, { ok: true, result }, cookies);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Michigan admin course endpoint error", error?.message);
    return sessionResponse(status, {
      error: status >= 500 ? "michigan_admin_course_unavailable" : error.message,
    }, cookies);
  }
};

