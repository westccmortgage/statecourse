import { requireAdmin } from "./_lib/auth.mjs";
import { rpc } from "./_lib/db.mjs";
import { parseJson, response } from "./_lib/http.mjs";

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

function optionalUuid(value, name) {
  return value == null || value === "" ? null : uuid(value, name);
}

function optionalDate(value, name) {
  if (value == null || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) fail(`invalid_${name}`);
  return date.toISOString();
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

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") fail("method_not_allowed", 405);
    requireAdmin(event);
    const input = parseJson(event);
    const eventType = String(input.eventType || "");
    let result;

    if (eventType === "review_memo") {
      result = await michiganRpc("review_michigan_applied_memo", {
        p_submission_id: uuid(input.submissionId, "submission_id"),
        p_reviewer_instructor_id: uuid(input.reviewerInstructorId, "reviewer_instructor_id"),
        p_scores: input.scores,
        p_feedback: input.feedback,
      });
    } else if (eventType === "verify_identity") {
      if (!SHA256.test(String(input.evidenceSha256 || ""))) fail("invalid_identity_evidence_digest");
      result = await michiganRpc("record_michigan_identity_verification", {
        p_enrollment_id: uuid(input.enrollmentId, "enrollment_id"),
        p_student_id: uuid(input.studentId, "student_id"),
        p_legal_name: String(input.legalName || ""),
        p_method: String(input.method || ""),
        p_evidence_reference: String(input.evidenceReference || ""),
        p_evidence_sha256: input.evidenceSha256,
        p_verified_by: uuid(input.verifiedBy, "verified_by"),
      });
    } else if (eventType === "record_authority") {
      result = await michiganRpc("record_michigan_authority_event", {
        p_authority_kind: String(input.authorityKind || ""),
        p_authority_status: String(input.authorityStatus || ""),
        p_identifier: input.identifier == null ? null : String(input.identifier),
        p_subject_id: optionalUuid(input.subjectId, "subject_id"),
        p_effective_at: optionalDate(input.effectiveAt, "effective_at"),
        p_expires_at: optionalDate(input.expiresAt, "expires_at"),
        p_evidence: input.evidence || {},
        p_recorded_by: uuid(input.recordedBy, "recorded_by"),
      });
    } else if (eventType === "configure_outputs") {
      result = await michiganRpc("record_michigan_runtime_configuration", {
        p_identifier_requirements_confirmed: input.identifierRequirementsConfirmed === true,
        p_pss_school_number: input.pssSchoolNumber == null ? null : String(input.pssSchoolNumber),
        p_bpl_sponsor_number: input.bplSponsorNumber == null ? null : String(input.bplSponsorNumber),
        p_bpl_course_number: input.bplCourseNumber == null ? null : String(input.bplCourseNumber),
        p_reporting_requirements_confirmed: input.reportingRequirementsConfirmed === true,
        p_reporting_channel: input.reportingChannel == null ? null : String(input.reportingChannel),
        p_reporting_format: input.reportingFormat == null ? null : String(input.reportingFormat),
        p_evidence: input.evidence || {},
        p_recorded_by: uuid(input.recordedBy, "recorded_by"),
      });
    } else if (eventType === "record_completion") {
      result = await michiganRpc("record_michigan_completion", {
        p_enrollment_id: uuid(input.enrollmentId, "enrollment_id"),
      });
    } else if (eventType === "issue_certificate") {
      result = await michiganRpc("issue_michigan_completion_certificate", {
        p_enrollment_id: uuid(input.enrollmentId, "enrollment_id"),
      });
    } else if (eventType === "build_completion_report") {
      result = await michiganRpc("build_michigan_completion_report", {
        p_enrollment_id: uuid(input.enrollmentId, "enrollment_id"),
      });
    } else if (eventType === "status") {
      result = await michiganRpc("michigan_operational_status", {
        p_enrollment_id: uuid(input.enrollmentId, "enrollment_id"),
      });
    } else {
      fail("invalid_michigan_admin_event");
    }

    return response(200, { ok: true, result });
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Michigan admin course endpoint error", error?.message);
    return response(status, {
      error: status >= 500 ? "michigan_admin_course_unavailable" : error.message,
    });
  }
};
