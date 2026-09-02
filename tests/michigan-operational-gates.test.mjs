import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  MICHIGAN_ATTESTATION_VERSION,
  MICHIGAN_AUTHORITY_KINDS,
  MICHIGAN_MEMO_CRITERIA,
  MICHIGAN_MEMO_RUBRIC_VERSION,
  MICHIGAN_MODULE_IDS,
  MICHIGAN_OPERATIONAL_COURSE_ID,
  MICHIGAN_OPERATIONAL_VERSION,
  configuredMichiganOperationalStatus,
  evaluateMichiganAuthority,
  evaluateMichiganCertificateGate,
  evaluateMichiganCourseCompletion,
  evaluateMichiganModuleGate,
  evaluateMichiganReviewCapacity,
  evaluateMichiganReportGate,
  michiganProviderBusinessDeadline,
  recordMichiganAttestation,
  recordMichiganIdentity,
  reviewMichiganMemo,
  submitMichiganMemo,
} from "../lib/michigan-operational-gates.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const fixedClock = () => new Date("2026-09-01T16:00:00.000Z");
const reviewerId = "instructor-fixture-001";

function securityDefinerSignatures(body) {
  return [...body.matchAll(
    /create or replace function\s+([a-z0-9_]+)\s*\(([\s\S]*?)\)\s*returns\s+([\s\S]*?)\s+as\s+\$\$/gi,
  )]
    .filter(([, , , attributes]) => /security\s+definer/i.test(attributes))
    .map(([, name, parameters]) => {
      const parameterTypes = parameters.split(",")
        .map((parameter) => parameter.trim())
        .filter(Boolean)
        .map((parameter) => parameter.split(/\s+/)[1]);
      return `${name}(${parameterTypes.join(",")})`;
    });
}

function activeAuthority(overrides = {}) {
  return Object.fromEntries(MICHIGAN_AUTHORITY_KINDS.map((kind) => [kind, {
    status: "active",
    identifier: `TEST-${kind.toUpperCase()}-NOT-A-REGULATOR-ID`,
    effectiveAt: "2026-08-01T00:00:00.000Z",
    expiresAt: "2027-08-01T00:00:00.000Z",
    ...(kind === "instructor" ? { subjectId: reviewerId } : {}),
    ...(overrides[kind] || {}),
  }]));
}

const goodScores = Object.freeze({
  law_accuracy: 2,
  fact_analysis: 2,
  professional_boundary: 2,
  action_and_timing: 1,
  record_and_communication: 1,
});

const feedback = Object.freeze(Object.fromEntries(
  MICHIGAN_MEMO_CRITERIA.map((criterion) => [criterion, `Criterion feedback for ${criterion}.`]),
));

function acceptedMemo(moduleId, authority = activeAuthority()) {
  let history = submitMichiganMemo([], {
    enrollmentId: "enrollment-fixture-001",
    studentId: "student-fixture-001",
    moduleId,
    responseText: `Written Michigan analysis for ${moduleId}.`,
    authority,
  }, { clock: fixedClock });
  history = reviewMichiganMemo(history, {
    moduleId,
    version: 1,
    reviewerId,
    scores: goodScores,
    feedback,
    authority,
  }, { clock: fixedClock });
  return history;
}

function completedModule(moduleId, authority = activeAuthority()) {
  return {
    moduleId,
    viewedSections: [1, 2, 3, 4, 5, 6],
    activeSeconds: 14_400,
    memoHistory: acceptedMemo(moduleId, authority),
    appliedConfirmationPassed: true,
    engagementCheckComplete: true,
    remediationStatus: "not_required",
  };
}

function completedCourseInput(authority = activeAuthority()) {
  const enrollment = {
    id: "enrollment-fixture-001",
    studentId: "student-fixture-001",
    state: "MI",
    courseId: MICHIGAN_OPERATIONAL_COURSE_ID,
    courseVersion: MICHIGAN_OPERATIONAL_VERSION,
    status: "active",
    creditEligible: true,
    reviewRole: null,
  };
  const identity = recordMichiganIdentity({
    enrollmentId: enrollment.id,
    studentId: enrollment.studentId,
    legalName: "Morgan Student",
    method: "government photo identification fixture",
    evidenceReference: "fixture://identity/001",
    verifiedBy: "staff-fixture-001",
    authorizedVerifier: true,
  }, { clock: fixedClock });
  const attestation = recordMichiganAttestation({
    enrollmentId: enrollment.id,
    studentId: enrollment.studentId,
    signedName: "Morgan Student",
    statementVersion: MICHIGAN_ATTESTATION_VERSION,
    clockHours: 40,
    signatureEvidence: "fixture-signature-record-001",
    modulesComplete: true,
  }, { clock: fixedClock });
  return {
    authority,
    enrollment,
    modules: MICHIGAN_MODULE_IDS.map((moduleId) => completedModule(moduleId, authority)),
    identity,
    attestation,
  };
}

test("the checked-in Michigan course remains closed with every external authority pending", () => {
  const config = JSON.parse(read("config/courses/michigan-salesperson-v1.json"));
  const status = configuredMichiganOperationalStatus(config, { clock: fixedClock });
  assert.equal(config.operational_activation_status, "preactivation_only");
  assert.equal(config.enrollment_enabled, false);
  assert.equal(status.enrollmentEnabled, false);
  assert.equal(status.authority.active, false);
  assert.equal(status.operationallyActivated, false);
  assert.deepEqual(
    status.authority.reasons,
    MICHIGAN_AUTHORITY_KINDS.map((kind) => `${kind}_authority_pending`),
  );
  assert.equal(config.certificate_configuration.identifier_requirements_confirmed, false);
  assert.equal(config.reporting_configuration.requirements_confirmed, false);
  for (const kind of MICHIGAN_AUTHORITY_KINDS) {
    assert.equal(config.operational_authority[kind].identifier, null);
  }
});

test("one authority decision kills enrollment, credited instruction, completion, certificate, and reporting together", () => {
  const authority = activeAuthority({ surety: { status: "expired" } });
  const result = evaluateMichiganAuthority(authority, { clock: fixedClock });
  assert.equal(result.active, false);
  assert.deepEqual(result.reasons, ["surety_authority_expired"]);
  assert.deepEqual(result.permissions, {
    enrollment: false,
    creditedInstruction: false,
    completion: false,
    certificate: false,
    completionReport: false,
  });

  const expiresAtBoundary = activeAuthority({
    surety: { status: "active", expiresAt: "2026-09-01T16:00:00.000Z" },
  });
  assert.deepEqual(
    evaluateMichiganAuthority(expiresAtBoundary, { clock: fixedClock }).reasons,
    ["surety_authority_expired"],
    "authority is inactive at, not after, its expiration instant",
  );
});

test("the provider business calendar skips weekends and recorded closed dates", () => {
  assert.equal(
    michiganProviderBusinessDeadline("2026-09-04T16:00:00.000Z", {
      businessDays: 1,
      closedDates: ["2026-09-07"],
      calendarConfirmedThrough: "2026-09-30",
    }),
    "2026-09-08T16:00:00.000Z",
  );
  assert.throws(
    () => michiganProviderBusinessDeadline("2026-09-04T16:00:00.000Z", {
      businessDays: 1,
      closedDates: ["2026-09-07"],
      calendarConfirmedThrough: "2026-09-07",
    }),
    /michigan_business_calendar_unconfirmed/,
  );
});

test("capacity, review SLA, checkout, enrollment, and the no-charge wait list use one decision", () => {
  const policy = {
    status: "active",
    activeStudentCap: 25,
    reviewSlaBusinessDays: 1,
    instructorAvailable: true,
    waitlistEnabled: true,
    calendarConfirmedThrough: "2026-09-30",
    closedDates: [],
  };
  const ready = {
    courseApproved: true,
    courseVersionApproved: true,
    enrollmentEnabled: true,
    authority: activeAuthority(),
    activeStudents: 24,
    pendingReviews: [],
    policy,
  };
  assert.deepEqual(
    evaluateMichiganReviewCapacity(ready, { clock: fixedClock }).reasons,
    [],
  );
  assert.equal(evaluateMichiganReviewCapacity(ready, { clock: fixedClock }).checkoutAllowed, true);

  const atCapacity = evaluateMichiganReviewCapacity({ ...ready, activeStudents: 25 }, { clock: fixedClock });
  assert.equal(atCapacity.checkoutAllowed, false);
  assert.equal(atCapacity.enrollmentAllowed, false);
  assert.equal(atCapacity.waitlistAllowed, true);
  assert.equal(atCapacity.waitlistChargeAllowed, false);
  assert.deepEqual(atCapacity.reasons, ["active_student_capacity_reached"]);

  const overdue = evaluateMichiganReviewCapacity({
    ...ready,
    pendingReviews: [{ submittedAt: "2026-08-31T15:00:00.000Z", dueAt: "2026-09-01T15:59:59.000Z" }],
  }, { clock: fixedClock });
  assert.equal(overdue.checkoutAllowed, false);
  assert.equal(overdue.waitlistAllowed, true);
  assert.deepEqual(overdue.reasons, ["memo_review_sla_missed"]);

  const unapprovedVersion = evaluateMichiganReviewCapacity({
    ...ready,
    courseVersionApproved: false,
  }, { clock: fixedClock });
  assert.equal(unapprovedVersion.checkoutAllowed, false);
  assert.equal(unapprovedVersion.waitlistAllowed, false);
  assert.ok(unapprovedVersion.reasons.includes("course_version_not_approved"));
});

test("memo submission is append-only and cannot route around an authority lapse", () => {
  assert.throws(() => submitMichiganMemo([], {
    enrollmentId: "enrollment-fixture-001",
    studentId: "student-fixture-001",
    moduleId: "module-01",
    responseText: "A response.",
    authority: {},
  }, { clock: fixedClock }), /michigan_authority_blocked/);

  let history = submitMichiganMemo([], {
    enrollmentId: "enrollment-fixture-001",
    studentId: "student-fixture-001",
    moduleId: "module-01",
    responseText: "Version one analysis.",
    authority: activeAuthority(),
  }, { clock: fixedClock });
  assert.equal(history.length, 1);
  assert.equal(history[0].version, 1);
  assert.match(history[0].contentDigest, /^[0-9a-f]{64}$/);
  assert.throws(() => { history[0].responseText = "mutated"; }, TypeError);
  assert.throws(() => submitMichiganMemo(history, {
    enrollmentId: "enrollment-fixture-001",
    studentId: "student-fixture-001",
    moduleId: "module-01",
    responseText: "An overwrite attempt.",
    authority: activeAuthority(),
  }, { clock: fixedClock }), /memo_review_pending/);
});

test("only the active assigned instructor can review, and the rubric derives the outcome", () => {
  let history = submitMichiganMemo([], {
    enrollmentId: "enrollment-fixture-001",
    studentId: "student-fixture-001",
    moduleId: "module-02",
    responseText: "Initial Michigan transaction analysis.",
    authority: activeAuthority(),
  }, { clock: fixedClock });
  assert.throws(() => reviewMichiganMemo(history, {
    moduleId: "module-02",
    version: 1,
    reviewerId: "different-instructor",
    scores: goodScores,
    feedback,
    authority: activeAuthority(),
  }, { clock: fixedClock }), /reviewer_not_authorized_instructor/);

  const boundaryFailure = {
    law_accuracy: 2,
    fact_analysis: 2,
    professional_boundary: 0,
    action_and_timing: 2,
    record_and_communication: 2,
  };
  history = reviewMichiganMemo(history, {
    moduleId: "module-02",
    version: 1,
    reviewerId,
    scores: boundaryFailure,
    feedback,
    authority: activeAuthority(),
    outcome: "satisfactory",
  }, { clock: fixedClock });
  assert.equal(history[0].review.total, 8);
  assert.equal(history[0].review.outcome, "needs_revision", "caller-supplied outcome is ignored");
  assert.equal(history[0].review.rubricVersion, MICHIGAN_MEMO_RUBRIC_VERSION);
  assert.throws(() => reviewMichiganMemo(history, {
    moduleId: "module-02",
    version: 1,
    reviewerId,
    scores: goodScores,
    feedback,
    authority: activeAuthority(),
  }, { clock: fixedClock }), /memo_review_immutable/);
});

test("resubmission preserves every earlier version and closes only after a satisfactory current review", () => {
  let history = submitMichiganMemo([], {
    enrollmentId: "enrollment-fixture-001",
    studentId: "student-fixture-001",
    moduleId: "module-03",
    responseText: "Version one.",
    authority: activeAuthority(),
  }, { clock: fixedClock });
  history = reviewMichiganMemo(history, {
    moduleId: "module-03",
    version: 1,
    reviewerId,
    scores: { ...goodScores, law_accuracy: 0, record_and_communication: 2 },
    feedback,
    authority: activeAuthority(),
  }, { clock: fixedClock });
  history = submitMichiganMemo(history, {
    enrollmentId: "enrollment-fixture-001",
    studentId: "student-fixture-001",
    moduleId: "module-03",
    responseText: "Version two corrects the Michigan-law analysis.",
    authority: activeAuthority(),
  }, { clock: fixedClock });
  history = reviewMichiganMemo(history, {
    moduleId: "module-03",
    version: 2,
    reviewerId,
    scores: goodScores,
    feedback,
    authority: activeAuthority(),
  }, { clock: fixedClock });
  assert.equal(history.length, 2);
  assert.equal(history[0].responseText, "Version one.");
  assert.equal(history[0].review.outcome, "needs_revision");
  assert.equal(history[1].review.outcome, "satisfactory");
  assert.throws(() => submitMichiganMemo(history, {
    enrollmentId: "enrollment-fixture-001",
    studentId: "student-fixture-001",
    moduleId: "module-03",
    responseText: "Unnecessary version three.",
    authority: activeAuthority(),
  }, { clock: fixedClock }), /memo_already_satisfactory/);
});

test("a module earns four hours only after all evidence, including the current memo review", () => {
  const moduleEvidence = completedModule("module-04");
  const ready = evaluateMichiganModuleGate(moduleEvidence);
  assert.equal(ready.complete, true);
  assert.equal(ready.creditedClockHours, 4);

  const shortTime = evaluateMichiganModuleGate({ ...moduleEvidence, activeSeconds: 14_399 });
  assert.equal(shortTime.complete, false);
  assert.equal(shortTime.creditedClockHours, 0);
  assert.ok(shortTime.reasons.includes("four_active_clock_hours_required"));

  const missingConfirmation = evaluateMichiganModuleGate({ ...moduleEvidence, appliedConfirmationPassed: false });
  assert.ok(missingConfirmation.reasons.includes("applied_confirmation_must_pass_100_percent"));
  const remediationOpen = evaluateMichiganModuleGate({ ...moduleEvidence, remediationStatus: "required" });
  assert.ok(remediationOpen.reasons.includes("remediation_not_satisfied"));
});

test("identity is staff-verified and the signed attestation cannot predate complete coursework", () => {
  assert.throws(() => recordMichiganIdentity({
    enrollmentId: "enrollment-fixture-001",
    studentId: "student-fixture-001",
    legalName: "Morgan Student",
    method: "government photo identification",
    evidenceReference: "evidence://001",
    verifiedBy: "staff-fixture-001",
    authorizedVerifier: false,
  }, { clock: fixedClock }), /identity_verifier_not_authorized/);
  assert.throws(() => recordMichiganAttestation({
    enrollmentId: "enrollment-fixture-001",
    studentId: "student-fixture-001",
    signedName: "Morgan Student",
    statementVersion: MICHIGAN_ATTESTATION_VERSION,
    clockHours: 40,
    signatureEvidence: "signature-record",
    modulesComplete: false,
  }, { clock: fixedClock }), /attestation_before_coursework_complete/);
});

test("completion requires ten modules, 40 hours, identity, attestation, and every active authority", () => {
  const input = completedCourseInput();
  const result = evaluateMichiganCourseCompletion(input, { clock: fixedClock });
  assert.equal(result.eligible, true);
  assert.equal(result.completedModules, 10);
  assert.equal(result.creditedClockHours, 40);
  assert.equal(result.civilRightsClockHours, 4);

  const reviewer = evaluateMichiganCourseCompletion({
    ...input,
    enrollment: { ...input.enrollment, reviewRole: "regulator_reviewer" },
  }, { clock: fixedClock });
  assert.equal(reviewer.eligible, false);
  assert.ok(reviewer.reasons.includes("review_enrollment_cannot_complete"));

  const mismatch = evaluateMichiganCourseCompletion({
    ...input,
    attestation: { ...input.attestation, signedName: "Different Person" },
  }, { clock: fixedClock });
  assert.ok(mismatch.reasons.includes("attestation_identity_name_mismatch"));
});

test("certificate and report gates remain closed until separate agency answers and identifiers exist", () => {
  const input = {
    ...completedCourseInput(),
    completionRecord: { status: "complete" },
  };
  const certificateBlocked = evaluateMichiganCertificateGate(input, { clock: fixedClock });
  assert.equal(certificateBlocked.eligible, false);
  assert.ok(certificateBlocked.reasons.includes("certificate_identifier_requirements_not_confirmed"));
  assert.ok(certificateBlocked.reasons.includes("pssSchoolNumber_missing"));
  assert.ok(certificateBlocked.reasons.includes("bplSponsorNumber_missing"));
  assert.ok(certificateBlocked.reasons.includes("bplCourseNumber_missing"));

  const reportBlocked = evaluateMichiganReportGate(input, { clock: fixedClock });
  assert.equal(reportBlocked.eligible, false);
  assert.ok(reportBlocked.reasons.includes("report_identifier_requirements_not_confirmed"));
  assert.ok(reportBlocked.reasons.includes("reporting_requirements_not_confirmed"));
  assert.ok(reportBlocked.reasons.includes("reporting_channel_missing"));
  assert.ok(reportBlocked.reasons.includes("reporting_format_missing"));

  assert.equal(evaluateMichiganCertificateGate({
    ...input,
    identifierRequirementsConfirmed: true,
    certificateIdentifiers: {
      pssSchoolNumber: "TEST-PSS",
      bplSponsorNumber: "TEST-SPONSOR",
      bplCourseNumber: "TEST-COURSE",
    },
  }, { clock: fixedClock }).eligible, true);
  assert.equal(evaluateMichiganReportGate({
    ...input,
    identifierRequirementsConfirmed: true,
    certificateIdentifiers: {
      pssSchoolNumber: "TEST-PSS",
      bplSponsorNumber: "TEST-SPONSOR",
      bplCourseNumber: "TEST-COURSE",
    },
    reportingRequirementsConfirmed: true,
    reportingChannel: "TEST-CHANNEL",
    reportingFormat: "TEST-FORMAT",
  }, { clock: fixedClock }).eligible, true);
});

test("an authority expiration after completion re-closes certificate and report output", () => {
  const authority = activeAuthority({
    surety: { expiresAt: "2026-09-02T00:00:00.000Z" },
  });
  const input = {
    ...completedCourseInput(authority),
    completionRecord: { status: "complete" },
    identifierRequirementsConfirmed: true,
    certificateIdentifiers: {
      pssSchoolNumber: "TEST-PSS",
      bplSponsorNumber: "TEST-SPONSOR",
      bplCourseNumber: "TEST-COURSE",
    },
    reportingRequirementsConfirmed: true,
    reportingChannel: "TEST-CHANNEL",
    reportingFormat: "TEST-FORMAT",
  };
  const afterExpiration = () => new Date("2026-09-02T00:00:00.000Z");
  assert.equal(evaluateMichiganCertificateGate(input, { clock: afterExpiration }).eligible, false);
  assert.equal(evaluateMichiganReportGate(input, { clock: afterExpiration }).eligible, false);
  assert.ok(evaluateMichiganCertificateGate(input, { clock: afterExpiration }).reasons.includes("surety_authority_expired"));
});

test("the database migration stores evidence, enforces append-only history, and guards direct writes", () => {
  const sql = read("database/015_michigan_operational_gates.sql");
  for (const table of [
    "michigan_authority_events",
    "michigan_runtime_configuration_events",
    "michigan_applied_memo_versions",
    "michigan_applied_memo_reviews",
    "michigan_identity_verification_events",
    "michigan_asynchronous_attestation_events",
    "michigan_completion_reports",
    "michigan_completion_certificates",
  ]) {
    assert.match(sql, new RegExp(`create table if not exists ${table}`));
    assert.match(sql, new RegExp(`alter table ${table} enable row level security`));
  }
  assert.match(sql, /michigan_compliance_records_are_append_only/);
  assert.match(sql, /create trigger michigan_credited_time_guard/);
  assert.match(sql, /create trigger michigan_assignment_instruction_guard/);
  assert.match(sql, /create trigger michigan_assessment_instruction_guard/);
  assert.match(sql, /create trigger michigan_remediation_instruction_guard/);
  assert.match(sql, /create trigger michigan_assignment_completion_guard/);
  assert.match(sql, /create trigger michigan_direct_memo_submission_guard/);
  assert.match(sql, /create trigger michigan_direct_memo_review_guard/);
  assert.match(sql, /create trigger michigan_direct_attestation_guard/);
  assert.match(sql, /create trigger michigan_direct_completion_guard/);
  assert.match(sql, /create trigger michigan_direct_certificate_guard/);
  assert.match(sql, /create trigger michigan_direct_report_guard/);
  assert.match(sql, /michigan_module_requires_four_active_hours/);
  assert.match(sql, /michigan_satisfactory_written_memo_required/);
  assert.match(sql, /review_michigan_applied_memo/);
  assert.match(sql, /record_michigan_identity_verification/);
  assert.match(sql, /sign_michigan_asynchronous_attestation/);
  assert.match(sql, /record_michigan_completion/);
  assert.match(sql, /issue_michigan_completion_certificate/);
  assert.match(sql, /build_michigan_completion_report/);
  assert.match(sql, /'submission_draft',false/);
  assert.match(sql, /'development',40,false,false/);
  assert.doesNotMatch(sql, /'approved',true,true/);
  assert.doesNotMatch(sql, /jsonb_object_length/, "PostgreSQL has no jsonb_object_length function");
  assert.match(sql, /jsonb_object_keys\(p_scores\)/);
});

test("student and admin server paths expose only the gated RPC workflow", () => {
  const student = read("netlify/functions/student-michigan-course.mjs");
  const admin = read("netlify/functions/admin-michigan-course.mjs");
  assert.match(student, /requireStudentSession/);
  assert.match(student, /requireSameOrigin/);
  assert.match(student, /submit_michigan_applied_memo/);
  assert.match(student, /sign_michigan_asynchronous_attestation/);
  assert.match(student, /retainedSignatureRecord/);
  assert.doesNotMatch(student, /correctChoice|answer_key|approval_number/);
  assert.match(admin, /requireStudentSession/);
  assert.match(admin, /michigan_current_staff_actor_bindings/);
  assert.match(admin, /browser_actor_identity_not_accepted/);
  assert.doesNotMatch(admin, /requireAdmin|STATECOURSE_ADMIN_API_TOKEN/);
  assert.match(admin, /review_michigan_applied_memo/);
  assert.match(admin, /record_michigan_identity_verification/);
  assert.match(admin, /record_michigan_authority_event/);
  assert.match(admin, /issue_michigan_completion_certificate/);
  assert.match(admin, /build_michigan_completion_report/);
});

test("every Michigan SECURITY DEFINER function has an exact-signature browser-role revoke", () => {
  const migration015 = read("database/015_michigan_operational_gates.sql");
  const migration016 = read("database/016_michigan_review_capacity.sql");
  const signatures015 = [
    "michigan_authority_summary(text,text,timestamptz)",
    "michigan_require_active_authority(text,text)",
    "initialize_michigan_enrollment()",
    "initialize_michigan_enrollment_records()",
    "michigan_credited_time_guard()",
    "michigan_instruction_evidence_guard()",
    "michigan_assignment_completion_guard()",
    "michigan_direct_memo_submission_guard()",
    "michigan_direct_memo_review_guard()",
    "michigan_direct_attestation_guard()",
    "submit_michigan_applied_memo(uuid,uuid,text,text)",
    "review_michigan_applied_memo(uuid,uuid,jsonb,jsonb)",
    "record_michigan_identity_verification(uuid,uuid,text,text,text,text,uuid)",
    "sign_michigan_asynchronous_attestation(uuid,uuid,text,text,integer,text)",
    "michigan_operational_status(uuid)",
    "michigan_direct_certificate_guard()",
    "michigan_direct_report_guard()",
    "record_michigan_completion(uuid)",
    "issue_michigan_completion_certificate(uuid)",
    "build_michigan_completion_report(uuid)",
    "michigan_direct_completion_guard()",
    "record_michigan_authority_event(text,text,text,uuid,timestamptz,timestamptz,jsonb,uuid)",
    "record_michigan_runtime_configuration(boolean,text,text,text,boolean,text,text,jsonb,uuid)",
  ];
  const signatures016 = [
    "michigan_business_deadline(timestamptz,integer,date,jsonb)",
    "michigan_capacity_status(timestamptz)",
    "michigan_checkout_capacity_guard()",
    "initialize_michigan_enrollment()",
    "join_michigan_waitlist(uuid,text)",
    "record_michigan_operational_policy(text,integer,integer,boolean,boolean,date,jsonb,jsonb,uuid)",
  ];
  for (const [body, signatures] of [[migration015, signatures015], [migration016, signatures016]]) {
    assert.deepEqual(
      securityDefinerSignatures(body).sort(),
      [...signatures].sort(),
      "the exact-signature revoke inventory must cover every SECURITY DEFINER declaration",
    );
    for (const signature of signatures) {
      const escaped = signature.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      assert.match(
        body,
        new RegExp(`revoke execute on function ${escaped} from public,anon,authenticated;`, "i"),
        `missing exact browser-role revoke for ${signature}`,
      );
    }
    for (const grant of body.matchAll(/grant execute on function\s+[^;]+\s+to\s+([^;]+);/gi)) {
      assert.equal(grant[1].trim().toLowerCase(), "service_role");
    }
  }
  assert.match(migration015, /revoke all on michigan_current_authority,[\s\S]*from public,anon,authenticated;/);
  assert.match(migration016, /revoke all on michigan_current_operational_policy,[\s\S]*from public,anon,authenticated;/);
  assert.match(migration016, /grant execute on function michigan_business_deadline\(timestamptz,integer,date,jsonb\) to service_role;/);
});

test("Michigan operational pages use named sessions and contain no shared-token workflow", () => {
  const files = [
    read("public/statecourse/admin/michigan-course/index.html"),
    read("public/statecourse/admin/michigan-course/michigan-course.js"),
    read("public/statecourse/admin/michigan-review/index.html"),
    read("public/statecourse/admin/michigan-review/michigan-review.js"),
  ];
  const combined = files.join("\n");
  assert.match(combined, /Named staff session|Named review session/);
  assert.match(combined, /credentials:\s*"same-origin"/);
  assert.match(combined, /\/student\/sign-in\//);
  assert.doesNotMatch(combined, /Administrator token|Protected review token|sessionStorage|statecourse:admin-api-token/);
  assert.doesNotMatch(combined, /authorization\s*:/i);
  assert.doesNotMatch(combined, /style=/i, "the production CSP rejects inline style attributes");
});

test("both regulator inquiries preserve the sent record without implying a response", () => {
  const records = [
    ["PSS-prefiling-inquiry.md", "PSS@michigan.gov", "1a05da0d0be621df"],
    ["BPL-prefiling-inquiry.md", "BPLHelp@michigan.gov", "1a05da60b7e3db2b"],
  ];
  for (const [name, recipient, messageId] of records) {
    const inquiry = read(`michigan/submission/regulator-inquiries/${name}`);
    assert.match(inquiry, /Sent 2026-09-01/);
    assert.ok(inquiry.includes(recipient));
    assert.match(inquiry, /From:\*\* westccmortgage@gmail\.com/i);
    assert.match(inquiry, /Reply-To:\*\* info@statecourse\.com/i);
    assert.ok(inquiry.includes(messageId));
    assert.match(inquiry, /does not record a regulator response, acceptance, authorization, or approval/i);
    assert.doesNotMatch(inquiry, /Not Sent/i);
  }
});
