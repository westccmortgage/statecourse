import { createHash } from "node:crypto";

/**
 * Michigan prelicensure operational policy.
 *
 * This module is deliberately independent from payment and public-course routing. It
 * describes and exercises the records that must exist before Michigan credit,
 * completion, reporting, or a certificate can be produced. The live course remains
 * closed in config/courses/michigan-salesperson-v1.json; these functions do not open it
 * and do not supply any regulator approval or identifier.
 */

export const MICHIGAN_OPERATIONAL_COURSE_ID = "mi-salesperson-prelicensure-40-v1";
export const MICHIGAN_OPERATIONAL_VERSION = "1.0-submission-draft";
export const MICHIGAN_ATTESTATION_VERSION = "MI-ASYNC-1.0-submission-draft";
export const MICHIGAN_MEMO_RUBRIC_VERSION = "MI-MEMO-1.0-submission-draft";

export const MICHIGAN_AUTHORITY_KINDS = Object.freeze([
  "school",
  "program",
  "course",
  "instructor",
  "surety",
]);

export const MICHIGAN_MEMO_CRITERIA = Object.freeze([
  "law_accuracy",
  "fact_analysis",
  "professional_boundary",
  "action_and_timing",
  "record_and_communication",
]);

export const MICHIGAN_MODULE_IDS = Object.freeze(
  Array.from({ length: 10 }, (_, index) => `module-${String(index + 1).padStart(2, "0")}`),
);

const REQUIRED_CERTIFICATE_IDENTIFIERS = Object.freeze([
  "pssSchoolNumber",
  "bplSponsorNumber",
  "bplCourseNumber",
]);

function fail(code, statusCode = 409) {
  throw Object.assign(new Error(code), { code, statusCode });
}

function iso(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.valueOf())) fail("invalid_timestamp", 400);
  return date.toISOString();
}

function nowFrom(clock) {
  return iso(typeof clock === "function" ? clock() : (clock ?? new Date()));
}

function nonempty(value, code) {
  const result = String(value ?? "").trim();
  if (!result) fail(code, 400);
  return result;
}

function clone(value) {
  return value == null ? value : structuredClone(value);
}

function unique(values) {
  return [...new Set(values)];
}

function digest(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function freezeMemoRecord(record) {
  const review = record.review
    ? Object.freeze({
      ...record.review,
      scores: Object.freeze({ ...record.review.scores }),
      feedback: Object.freeze({ ...record.review.feedback }),
    })
    : null;
  return Object.freeze({ ...record, review });
}

function validModule(moduleId) {
  if (!MICHIGAN_MODULE_IDS.includes(moduleId)) fail("unknown_michigan_module", 404);
  return moduleId;
}

/**
 * One result is consumed by enrollment, credited instruction, completion,
 * certificate, and report gates. A missing/expired gate therefore cannot be treated
 * differently by five callers.
 */
export function evaluateMichiganAuthority(authority = {}, { clock } = {}) {
  const at = nowFrom(clock);
  const gates = Object.fromEntries(MICHIGAN_AUTHORITY_KINDS.map((kind) => {
    const record = authority[kind] ?? null;
    let reason = null;
    if (!record) reason = `${kind}_authority_missing`;
    else if (record.status !== "active") reason = `${kind}_authority_${record.status || "inactive"}`;
    else if (!String(record.identifier ?? "").trim()) reason = `${kind}_identifier_missing`;
    else if (record.effectiveAt && Number.isNaN(new Date(record.effectiveAt).valueOf())) reason = `${kind}_authority_invalid_effective_at`;
    else if (record.expiresAt && Number.isNaN(new Date(record.expiresAt).valueOf())) reason = `${kind}_authority_invalid_expiration`;
    else if (record.effectiveAt && new Date(record.effectiveAt).valueOf() > new Date(at).valueOf()) reason = `${kind}_authority_not_effective`;
    else if (record.expiresAt && new Date(record.expiresAt).valueOf() <= new Date(at).valueOf()) reason = `${kind}_authority_expired`;
    return [kind, Object.freeze({
      active: reason === null,
      reason,
      identifier: record?.identifier ?? null,
      subjectId: record?.subjectId ?? null,
      effectiveAt: record?.effectiveAt ?? null,
      expiresAt: record?.expiresAt ?? null,
    })];
  }));
  const reasons = MICHIGAN_AUTHORITY_KINDS.map((kind) => gates[kind].reason).filter(Boolean);
  const active = reasons.length === 0;
  return Object.freeze({
    at,
    active,
    reasons: Object.freeze(reasons),
    gates: Object.freeze(gates),
    permissions: Object.freeze({
      enrollment: active,
      creditedInstruction: active,
      completion: active,
      certificate: active,
      completionReport: active,
    }),
  });
}

export function assertMichiganInstructionAuthorized(authority, { clock } = {}) {
  const result = evaluateMichiganAuthority(authority, { clock });
  if (!result.active) fail(`michigan_authority_blocked:${result.reasons.join(",")}`, 403);
  return result;
}

/**
 * A new memo is append-only. A pending version cannot be silently replaced, and a
 * satisfactory version closes the workflow. Resubmission starts only after an
 * instructor has recorded needs-revision feedback.
 */
export function submitMichiganMemo(history = [], input = {}, { clock } = {}) {
  const moduleId = validModule(nonempty(input.moduleId, "module_required"));
  const enrollmentId = nonempty(input.enrollmentId, "enrollment_required");
  const studentId = nonempty(input.studentId, "student_required");
  const responseText = nonempty(input.responseText, "memo_response_required");
  if (responseText.length > 100_000) fail("memo_response_too_long", 400);
  assertMichiganInstructionAuthorized(input.authority, { clock });

  const records = clone(history) ?? [];
  const sameModule = records
    .filter((item) => item.moduleId === moduleId)
    .sort((a, b) => a.version - b.version);
  const latest = sameModule.at(-1);
  if (latest && !latest.review) fail("memo_review_pending");
  if (latest?.review?.outcome === "satisfactory") fail("memo_already_satisfactory");
  if (latest?.review && latest.review.outcome !== "needs_revision") fail("invalid_prior_memo_state");

  const submittedAt = nowFrom(clock);
  const record = Object.freeze({
    enrollmentId,
    studentId,
    courseId: MICHIGAN_OPERATIONAL_COURSE_ID,
    courseVersion: MICHIGAN_OPERATIONAL_VERSION,
    moduleId,
    version: (latest?.version ?? 0) + 1,
    responseText,
    contentDigest: digest(responseText),
    submittedAt,
    review: null,
  });
  return Object.freeze([...records, record].map(freezeMemoRecord));
}

function normalizeRubricMap(input, name, validator) {
  const supplied = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const keys = Object.keys(supplied).sort();
  const expected = [...MICHIGAN_MEMO_CRITERIA].sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
    fail(`${name}_criteria_mismatch`, 400);
  }
  return Object.fromEntries(MICHIGAN_MEMO_CRITERIA.map((criterion) => [
    criterion,
    validator(supplied[criterion], criterion),
  ]));
}

/** Review outcome is derived from the filed rubric; callers cannot choose it. */
export function reviewMichiganMemo(history = [], input = {}, { clock } = {}) {
  const moduleId = validModule(nonempty(input.moduleId, "module_required"));
  const version = Number(input.version);
  if (!Number.isInteger(version) || version < 1) fail("invalid_memo_version", 400);
  const reviewerId = nonempty(input.reviewerId, "reviewer_required");
  const authority = assertMichiganInstructionAuthorized(input.authority, { clock });
  const instructor = authority.gates.instructor;
  if (!instructor.active) fail(`instructor_review_blocked:${instructor.reason}`, 403);
  if (!instructor.subjectId || instructor.subjectId !== reviewerId) fail("reviewer_not_authorized_instructor", 403);

  const scores = normalizeRubricMap(input.scores, "score", (value) => {
    const score = Number(value);
    if (!Number.isInteger(score) || score < 0 || score > 2) fail("invalid_rubric_score", 400);
    return score;
  });
  const feedback = normalizeRubricMap(input.feedback, "feedback", (value) => nonempty(value, "criterion_feedback_required"));
  const records = clone(history) ?? [];
  const index = records.findIndex((item) => item.moduleId === moduleId && item.version === version);
  if (index < 0) fail("memo_submission_not_found", 404);
  if (records[index].review) fail("memo_review_immutable");
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const satisfactory = total >= 8 && scores.law_accuracy > 0 && scores.professional_boundary > 0;
  const reviewedAt = nowFrom(clock);
  const review = Object.freeze({
    rubricVersion: MICHIGAN_MEMO_RUBRIC_VERSION,
    reviewerId,
    scores: Object.freeze(scores),
    feedback: Object.freeze(feedback),
    total,
    outcome: satisfactory ? "satisfactory" : "needs_revision",
    reviewedAt,
  });
  records[index] = Object.freeze({ ...records[index], review });
  return Object.freeze(records.map(freezeMemoRecord));
}

export function evaluateMichiganMemo(history = [], moduleId) {
  validModule(moduleId);
  const versions = history
    .filter((item) => item.moduleId === moduleId)
    .sort((a, b) => a.version - b.version);
  const latest = versions.at(-1) ?? null;
  const satisfactory = latest?.review?.outcome === "satisfactory";
  return Object.freeze({
    complete: satisfactory,
    reasons: Object.freeze(satisfactory ? [] : [latest ? (latest.review ? "memo_needs_revision" : "memo_review_pending") : "memo_not_submitted"]),
    versionCount: versions.length,
    latestVersion: latest?.version ?? null,
    latestOutcome: latest?.review?.outcome ?? null,
    versions: Object.freeze(versions.map(freezeMemoRecord)),
  });
}

export function recordMichiganIdentity(input = {}, { clock } = {}) {
  const enrollmentId = nonempty(input.enrollmentId, "enrollment_required");
  const studentId = nonempty(input.studentId, "student_required");
  const verifiedBy = nonempty(input.verifiedBy, "identity_verifier_required");
  const method = nonempty(input.method, "identity_method_required");
  const evidenceReference = nonempty(input.evidenceReference, "identity_evidence_required");
  const legalName = nonempty(input.legalName, "legal_name_required");
  if (!input.authorizedVerifier) fail("identity_verifier_not_authorized", 403);
  return Object.freeze({
    enrollmentId,
    studentId,
    legalName,
    method,
    evidenceReference,
    evidenceDigest: digest(evidenceReference),
    verifiedBy,
    verifiedAt: nowFrom(clock),
    revokedAt: null,
  });
}

export function recordMichiganAttestation(input = {}, { clock } = {}) {
  const enrollmentId = nonempty(input.enrollmentId, "enrollment_required");
  const studentId = nonempty(input.studentId, "student_required");
  const signedName = nonempty(input.signedName, "attestation_signed_name_required");
  const signatureEvidence = nonempty(input.signatureEvidence, "attestation_signature_evidence_required");
  if (input.statementVersion !== MICHIGAN_ATTESTATION_VERSION) fail("attestation_version_mismatch", 400);
  if (input.clockHours !== 40) fail("attestation_clock_hours_must_equal_40", 400);
  if (!input.modulesComplete) fail("attestation_before_coursework_complete");
  return Object.freeze({
    enrollmentId,
    studentId,
    signedName,
    clockHours: 40,
    statementVersion: MICHIGAN_ATTESTATION_VERSION,
    signatureDigest: digest(signatureEvidence),
    signedAt: nowFrom(clock),
    revokedAt: null,
  });
}

/** One four-hour module earns no partial credit. */
export function evaluateMichiganModuleGate(input = {}) {
  const moduleId = validModule(nonempty(input.moduleId, "module_required"));
  const reasons = [];
  const sections = unique((Array.isArray(input.viewedSections) ? input.viewedSections : [])
    .map(Number)
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 6));
  if (sections.length !== 6) reasons.push("all_six_sections_required");
  if (Number(input.activeSeconds ?? 0) < 14_400) reasons.push("four_active_clock_hours_required");
  const memo = evaluateMichiganMemo(input.memoHistory ?? [], moduleId);
  reasons.push(...memo.reasons);
  if (input.appliedConfirmationPassed !== true) reasons.push("applied_confirmation_must_pass_100_percent");
  if (input.engagementCheckComplete !== true) reasons.push("engagement_check_required");
  const remediationSatisfied = input.remediationStatus === "not_required" || input.remediationStatus === "satisfied";
  if (!remediationSatisfied) reasons.push("remediation_not_satisfied");
  return Object.freeze({
    moduleId,
    complete: reasons.length === 0,
    creditedClockHours: reasons.length === 0 ? 4 : 0,
    reasons: Object.freeze(unique(reasons)),
    memo,
  });
}

export function evaluateMichiganCourseCompletion(input = {}, { clock } = {}) {
  const reasons = [];
  const authority = evaluateMichiganAuthority(input.authority, { clock });
  reasons.push(...authority.reasons);
  if (input.enrollment?.state !== "MI") reasons.push("michigan_enrollment_required");
  if (input.enrollment?.courseId !== MICHIGAN_OPERATIONAL_COURSE_ID) reasons.push("michigan_course_required");
  if (input.enrollment?.courseVersion !== MICHIGAN_OPERATIONAL_VERSION) reasons.push("michigan_course_version_mismatch");
  if (input.enrollment?.status !== "active") reasons.push("active_enrollment_required");
  if (input.enrollment?.creditEligible !== true) reasons.push("credit_eligible_enrollment_required");
  if (input.enrollment?.reviewRole) reasons.push("review_enrollment_cannot_complete");

  const moduleResults = MICHIGAN_MODULE_IDS.map((moduleId) => {
    const supplied = (input.modules ?? []).find((item) => item.moduleId === moduleId) ?? { moduleId };
    return evaluateMichiganModuleGate(supplied);
  });
  const completedModules = moduleResults.filter((item) => item.complete).length;
  if (completedModules !== 10) reasons.push("all_ten_modules_required");
  const creditedClockHours = moduleResults.reduce((sum, item) => sum + item.creditedClockHours, 0);
  if (creditedClockHours !== 40) reasons.push("forty_credited_clock_hours_required");

  const identity = input.identity;
  if (!identity || identity.revokedAt) reasons.push("active_identity_verification_required");
  else if (identity.enrollmentId !== input.enrollment?.id || identity.studentId !== input.enrollment?.studentId) reasons.push("identity_record_mismatch");
  const attestation = input.attestation;
  if (!attestation || attestation.revokedAt) reasons.push("signed_asynchronous_attestation_required");
  else {
    if (attestation.enrollmentId !== input.enrollment?.id || attestation.studentId !== input.enrollment?.studentId) reasons.push("attestation_record_mismatch");
    if (attestation.statementVersion !== MICHIGAN_ATTESTATION_VERSION || attestation.clockHours !== 40 || !attestation.signatureDigest) reasons.push("invalid_asynchronous_attestation");
    if (identity && !identity.revokedAt && attestation.signedName !== identity.legalName) reasons.push("attestation_identity_name_mismatch");
  }

  return Object.freeze({
    eligible: reasons.length === 0,
    reasons: Object.freeze(unique(reasons)),
    completedModules,
    creditedClockHours,
    civilRightsClockHours: moduleResults.find((item) => item.moduleId === "module-07")?.complete ? 4 : 0,
    authority,
    moduleResults: Object.freeze(moduleResults),
  });
}

export function evaluateMichiganCertificateGate(input = {}, { clock } = {}) {
  const completion = evaluateMichiganCourseCompletion(input, { clock });
  const reasons = [...completion.reasons];
  if (!input.completionRecord || input.completionRecord.status !== "complete") reasons.push("permanent_completion_record_required");
  if (input.identifierRequirementsConfirmed !== true) reasons.push("certificate_identifier_requirements_not_confirmed");
  for (const key of REQUIRED_CERTIFICATE_IDENTIFIERS) {
    if (!String(input.certificateIdentifiers?.[key] ?? "").trim()) reasons.push(`${key}_missing`);
  }
  return Object.freeze({
    eligible: reasons.length === 0,
    reasons: Object.freeze(unique(reasons)),
    completion,
  });
}

export function evaluateMichiganReportGate(input = {}, { clock } = {}) {
  const completion = evaluateMichiganCourseCompletion(input, { clock });
  const reasons = [...completion.reasons];
  if (!input.completionRecord || input.completionRecord.status !== "complete") reasons.push("permanent_completion_record_required");
  if (input.identifierRequirementsConfirmed !== true) reasons.push("report_identifier_requirements_not_confirmed");
  for (const key of REQUIRED_CERTIFICATE_IDENTIFIERS) {
    if (!String(input.certificateIdentifiers?.[key] ?? "").trim()) reasons.push(`${key}_missing`);
  }
  if (input.reportingRequirementsConfirmed !== true) reasons.push("reporting_requirements_not_confirmed");
  if (!String(input.reportingChannel ?? "").trim()) reasons.push("reporting_channel_missing");
  if (!String(input.reportingFormat ?? "").trim()) reasons.push("reporting_format_missing");
  return Object.freeze({
    eligible: reasons.length === 0,
    reasons: Object.freeze(unique(reasons)),
    completion,
  });
}

export function configuredMichiganOperationalStatus(courseConfig, { clock } = {}) {
  const authority = courseConfig?.operational_authority ?? {};
  const authorityResult = evaluateMichiganAuthority(authority, { clock });
  return Object.freeze({
    courseId: courseConfig?.course_id ?? null,
    courseVersion: courseConfig?.course_version ?? null,
    enrollmentEnabled: courseConfig?.enrollment_enabled === true,
    authority: authorityResult,
    certificateIdentifiersConfirmed: courseConfig?.certificate_configuration?.identifier_requirements_confirmed === true,
    reportingRequirementsConfirmed: courseConfig?.reporting_configuration?.requirements_confirmed === true,
    operationallyActivated: courseConfig?.enrollment_enabled === true
      && authorityResult.active
      && courseConfig?.certificate_configuration?.identifier_requirements_confirmed === true
      && courseConfig?.reporting_configuration?.requirements_confirmed === true,
  });
}

export const MICHIGAN_REQUIRED_CERTIFICATE_IDENTIFIERS = REQUIRED_CERTIFICATE_IDENTIFIERS;
