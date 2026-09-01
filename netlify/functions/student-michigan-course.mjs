import { createHash } from "node:crypto";

import { dbRequest, rpc } from "./_lib/db.mjs";
import { parseJson, requireSameOrigin } from "./_lib/http.mjs";
import {
  requireStudentSession,
  sessionCookies,
  sessionResponse,
} from "./_lib/student-session.mjs";

const COURSE_ID = "mi-salesperson-prelicensure-40-v1";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MODULE = /^module-(0[1-9]|10)$/;
const ATTESTATION_VERSION = "MI-ASYNC-1.0-submission-draft";

function fail(message, statusCode = 400) {
  throw Object.assign(new Error(message), { statusCode });
}

function encode(value) {
  return encodeURIComponent(String(value));
}

async function michiganRpc(name, args) {
  try {
    return await rpc(name, args);
  } catch (error) {
    if (/michigan_/i.test(String(error?.message || ""))) {
      throw Object.assign(new Error(error.message), {
        statusCode: /authority_blocked|access_denied/i.test(error.message) ? 403 : 409,
      });
    }
    throw error;
  }
}

async function contextFor(studentId, enrollmentId) {
  if (!UUID.test(enrollmentId || "")) fail("invalid_enrollment", 400);
  const rows = await dbRequest(
    `enrollments?id=eq.${encode(enrollmentId)}&student_id=eq.${encode(studentId)}`
      + `&course_id=eq.${COURSE_ID}&state=eq.MI&select=*&limit=1`,
  );
  const enrollment = rows?.[0];
  if (!enrollment) fail("michigan_enrollment_not_found", 404);
  return enrollment;
}

async function memoSummary(enrollmentId) {
  const versions = await dbRequest(
    `michigan_applied_memo_versions?enrollment_id=eq.${encode(enrollmentId)}`
      + "&select=id,module_id,submission_version,content_sha256,submitted_at"
      + "&order=module_id.asc,submission_version.asc",
  );
  const ids = (versions || []).map((version) => version.id).filter((id) => UUID.test(id));
  const reviews = ids.length
    ? await dbRequest(
      "michigan_applied_memo_reviews?"
        + `submission_id=in.(${ids.join(",")})`
        + "&select=submission_id,rubric_version,total_points,outcome,criterion_feedback,reviewed_at",
    )
    : [];
  const reviewBySubmission = new Map((reviews || []).map((review) => [review.submission_id, review]));
  return (versions || []).map((version) => ({
    moduleId: version.module_id,
    version: version.submission_version,
    contentDigest: version.content_sha256,
    submittedAt: version.submitted_at,
    review: reviewBySubmission.get(version.id) || null,
  }));
}

export const handler = async (event) => {
  try {
    const auth = await requireStudentSession(event);
    const cookies = auth.refreshedSession ? sessionCookies(auth.refreshedSession) : [];
    const enrollmentId = String(
      event.queryStringParameters?.enrollment_id
        || (event.httpMethod === "POST" ? parseJson(event).enrollmentId : "")
        || "",
    );
    const enrollment = await contextFor(auth.student.id, enrollmentId);

    if (event.httpMethod === "GET") {
      const [status, memos] = await Promise.all([
        michiganRpc("michigan_operational_status", { p_enrollment_id: enrollment.id }),
        memoSummary(enrollment.id),
      ]);
      return sessionResponse(200, {
        enrollment: {
          id: enrollment.id,
          status: enrollment.status,
          creditEligible: Boolean(enrollment.compliance_credit_eligible),
          courseId: enrollment.course_id,
          courseVersion: enrollment.course_version,
        },
        status,
        memos,
      }, cookies);
    }

    if (event.httpMethod !== "POST") fail("method_not_allowed", 405);
    requireSameOrigin(event);
    const input = parseJson(event);
    const eventType = String(input.eventType || "");

    if (eventType === "submit_memo") {
      const moduleId = String(input.moduleId || "");
      if (!MODULE.test(moduleId)) fail("unknown_michigan_module", 404);
      const responseText = String(input.responseText || "");
      if (!responseText.trim() || responseText.length > 100_000) fail("invalid_michigan_memo_response");
      const result = await michiganRpc("submit_michigan_applied_memo", {
        p_enrollment_id: enrollment.id,
        p_student_id: auth.student.id,
        p_module_id: moduleId,
        p_response_text: responseText,
      });
      return sessionResponse(200, { ok: true, submission: result }, cookies);
    }

    if (eventType === "sign_asynchronous_attestation") {
      const signedLegalName = String(input.signedLegalName || "").trim();
      if (!signedLegalName || input.consent !== true) fail("signed_attestation_required");
      if (input.statementVersion !== ATTESTATION_VERSION || input.clockHours !== 40) {
        fail("invalid_michigan_asynchronous_attestation");
      }
      const signedAt = new Date().toISOString();
      const retainedSignatureRecord = JSON.stringify({
        enrollmentId: enrollment.id,
        studentId: auth.student.id,
        signedLegalName,
        statementVersion: ATTESTATION_VERSION,
        clockHours: 40,
        consent: true,
        signedAt,
      });
      const signatureDigest = createHash("sha256")
        .update(retainedSignatureRecord, "utf8")
        .digest("hex");
      const result = await michiganRpc("sign_michigan_asynchronous_attestation", {
        p_enrollment_id: enrollment.id,
        p_student_id: auth.student.id,
        p_signed_legal_name: signedLegalName,
        p_statement_version: ATTESTATION_VERSION,
        p_clock_hours: 40,
        p_signature_evidence_sha256: signatureDigest,
      });
      return sessionResponse(200, {
        ok: true,
        attestation: result,
        retainedSignatureRecord: { ...JSON.parse(retainedSignatureRecord), signatureDigest },
      }, cookies);
    }

    fail("invalid_michigan_course_event");
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Michigan student course endpoint error", error?.message);
    return sessionResponse(status, {
      error: status >= 500 ? "michigan_course_unavailable" : error.message,
    });
  }
};
