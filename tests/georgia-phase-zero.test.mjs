import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import PHASE_ZERO, {
  APPLICANT,
  BROKER_ROUTE,
  COURSE_ROUTE,
  GNPEC_ROUTE,
  INSTRUCTOR_ROUTE,
  MARKET,
  OPEN_QUESTIONS,
  RELEASE_GATES,
  SCHOOL_ROUTE,
  SOURCE_CLAIM_IDS,
  georgiaReadiness,
} from "../config/georgia/phase-zero.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const lock = JSON.parse(read("georgia/regulatory/source-lock.json"));
const verifier = path.join(root, "scripts/verify-georgia-source-lock.mjs");

test("Georgia Phase 0 selects inactive broker reciprocity without promising issuance", () => {
  assert.equal(BROKER_ROUTE.selected, true);
  assert.match(BROKER_ROUTE.target, /inactive/);
  assert.equal(BROKER_ROUTE.feeDollars, 170);
  assert.equal(BROKER_ROUTE.licenseTermYears, 4);
  assert.equal(BROKER_ROUTE.approvalGuaranteed, false);
  assert.equal(APPLICANT.georgiaBrokerLicenseHeld, false);
});

test("broker certifications cover every licensing jurisdiction and every Rule 520-1-.04 element", () => {
  const certifications = BROKER_ROUTE.certifiedHistories;
  assert.equal(certifications.requiredFromEveryRealEstateLicensingJurisdiction, true);
  assert.equal(certifications.maximumAgeMonths, 12);
  assert.equal(certifications.mustShow.length, 5);
  assert.ok(certifications.mustShow.some((item) => /prelicense/.test(item)));
  assert.ok(certifications.mustShow.some((item) => /continuing-education/.test(item)));
  assert.ok(certifications.mustShow.some((item) => /good standing/.test(item)));
  assert.ok(certifications.mustShow.some((item) => /disciplinary/.test(item)));
});

test("criminal-history handling includes both FBI escalation triggers", () => {
  assert.equal(BROKER_ROUTE.criminalHistory.maximumAgeDays, 60);
  assert.equal(BROKER_ROUTE.criminalHistory.fbiEscalationTriggers.length, 2);
  assert.ok(BROKER_ROUTE.criminalHistory.fbiEscalationTriggers.some((item) => /another jurisdiction/.test(item)));
  assert.ok(BROKER_ROUTE.criminalHistory.fbiEscalationTriggers.some((item) => /cannot obtain/.test(item)));
});

test("Florida residence is a legal-residence fork and its conflicting fee stays unset", () => {
  const fork = BROKER_ROUTE.floridaResidentFork;
  assert.match(fork.trigger, /legal resident/);
  assert.equal(fork.ordinaryReciprocalFormAvailable, false);
  assert.match(fork.requiredPath, /Law and Practice supplement/);
  assert.equal(fork.currentExamFeeDollars, null);
  assert.match(fork.reasonFeeUnset, /\$121/);
  assert.match(fork.reasonFeeUnset, /\$175/);
});

test("inactive issuance stays separate from affiliation, qualifying-broker, and foreign-LLC firm routes", () => {
  const options = BROKER_ROUTE.activeStatusOptions;
  assert.equal(options.affiliateAsAssociateBroker.requiresActiveGeorgiaBroker, true);
  assert.equal(options.affiliateAsAssociateBroker.reciprocalApplicationSectionCCompletedAndSignedByGeorgiaBroker, true);
  assert.equal(options.affiliateAsAssociateBroker.georgiaBrokerCertifiesWrittenAffiliationAgreement, true);
  assert.match(options.qualifyingBrokerOfExistingFirm.form, /Change of Qualifying Broker/);
  assert.equal(options.qualifyingBrokerOfExistingFirm.entitySpecificRoleRequired, true);
  assert.deepEqual(options.qualifyingBrokerOfExistingFirm.eligibleLlcRoles, ["member", "manager"]);
  assert.equal(options.qualifyingBrokerOfExistingFirm.authorityToBindFirmInContestedCaseRequired, true);
  assert.equal(options.openForeignLlcFirm.georgiaCertificateOfAuthorityRequired, true);
  assert.equal(options.openForeignLlcFirm.secretaryOfStatePublishedFeeDollars, 235);
  assert.equal(options.openForeignLlcFirm.openFirmFormFeeDollars, 275);
  assert.equal(options.openForeignLlcFirm.currentRuleArithmeticDollars, 200);
  assert.equal(options.openForeignLlcFirm.feeConflictOpen, true);
});

test("instructor 53-55 range is recomputable and all inputs remain unverified", () => {
  const worksheet = INSTRUCTOR_ROUTE.worksheet;
  const sections = worksheet.sections;
  const assumptions = worksheet.preliminaryAssumptions;
  const licensePoints = Math.min(
    assumptions.activeLicenseYears * sections.realEstateLicensure.activeLicenseYears.pointsPerYear,
    sections.realEstateLicensure.activeLicenseYears.maximumPoints,
  ) + assumptions.brokerLicensePoints;
  const experiencePoints = Math.min(
    assumptions.eligibleBrokerageTransactions * sections.realEstateExperience.brokerageTransactions.pointsPerTransaction,
    sections.realEstateExperience.brokerageTransactions.maximumPoints,
  ) + Math.min(
    assumptions.auxiliaryFieldYears * sections.realEstateExperience.auxiliaryFieldYears.pointsPerYear,
    sections.realEstateExperience.auxiliaryFieldYears.maximumPoints,
  );
  const computedRange = assumptions.degreePointsRange.map((degree) => licensePoints + assumptions.teachingPoints + degree + experiencePoints);
  assert.deepEqual(computedRange, worksheet.preliminaryKnownProfileRange);
  assert.deepEqual(computedRange.map((score) => worksheet.favorableReviewThresholdPoints - score).reverse(), worksheet.estimatedGapRange);
  assert.equal(assumptions.allDocumentarilyVerified, false);
  assert.equal(INSTRUCTOR_ROUTE.prerequisitesAwardWorksheetPoints, false);
  assert.match(worksheet.caveat, /unverified assumptions/);
});

test("instructor worksheet maxima and renewal controls match current sources", () => {
  const sections = INSTRUCTOR_ROUTE.worksheet.sections;
  assert.deepEqual([
    sections.realEstateLicensure.maximumPoints,
    sections.teachingExperience.maximumPoints,
    sections.formalGeneralEducation.maximumPoints,
    sections.realEstateExperience.maximumPoints,
  ], [20, 40, 5, 35]);
  assert.equal(sections.realEstateExperience.brokerageTransactions.pointsPerTransaction, 0.3);
  assert.equal(sections.realEstateExperience.brokerageTransactions.maximumPoints, 30);
  assert.equal(INSTRUCTOR_ROUTE.renewal.controllingRuleTeachingHours, 60);
  assert.equal(INSTRUCTOR_ROUTE.renewal.controllingRuleInstructorEducationHours, 36);
  assert.equal(INSTRUCTOR_ROUTE.renewal.minimumAnnualGrecMeetingHours, 12);
  assert.equal(INSTRUCTOR_ROUTE.renewal.staleFormInstructorEducationHours, 24);
});

test("school and GNPEC remain separate gates with fee conflicts visible", () => {
  assert.equal(SCHOOL_ROUTE.publishedDecisionWindowDaysAfterCompleteApplication, 60);
  assert.equal(SCHOOL_ROUTE.abandonmentDaysAfterInformationRequest, 120);
  assert.equal(SCHOOL_ROUTE.initialFeeConflict.applicationFormDollars, 175);
  assert.equal(SCHOOL_ROUTE.initialFeeConflict.currentRuleArithmeticDollars, 200);
  assert.equal(SCHOOL_ROUTE.initialFeeConflict.resolved, false);
  assert.equal(SCHOOL_ROUTE.renewalFeeConflict.formPaperDollars, 125);
  assert.equal(SCHOOL_ROUTE.renewalFeeConflict.formOnlineDollars, 100);
  assert.equal(SCHOOL_ROUTE.renewalFeeConflict.ruleOnlineClauseExpresslyNamesSchools, false);
  assert.equal(GNPEC_ROUTE.exemptionAutomatic, false);
  assert.equal(GNPEC_ROUTE.fullAuthorizationRequiredConfirmed, false);
  assert.equal(GNPEC_ROUTE.enrollmentAndAdvertisingGate, true);
  assert.ok(SCHOOL_ROUTE.minimumPackage.some((item) => /criminal-history report/.test(item)));
  assert.ok(SCHOOL_ROUTE.minimumPackage.some((item) => /Lawful Presence/.test(item)));
  assert.ok(SCHOOL_ROUTE.minimumPackage.some((item) => /media\/equipment/.test(item)));
  assert.ok(SCHOOL_ROUTE.minimumPackage.some((item) => /learning-environment/.test(item)));
  assert.ok(SCHOOL_ROUTE.continuingObligations.some((item) => /every calendar year/.test(item)));
});

test("the future course records all 15 fixed subjects and non-negotiable learning controls", () => {
  assert.equal(COURSE_ROUTE.hours, 75);
  assert.equal(COURSE_ROUTE.distanceHourMinutes, 60);
  assert.equal(COURSE_ROUTE.curriculumAuthoringAuthorized, false);
  assert.equal(COURSE_ROUTE.methodologyApprovalRequiredBeforeDevelopment, true);
  assert.equal(COURSE_ROUTE.fixedSalespersonSubjects.length, 15);
  assert.equal(new Set(COURSE_ROUTE.fixedSalespersonSubjects).size, 15);
  assert.equal(COURSE_ROUTE.contentControls.ethicsIntegratedThroughout, true);
  assert.equal(COURSE_ROUTE.contentControls.outOfClassReadingForEveryUnit, true);
  assert.equal(COURSE_ROUTE.contentControls.extensiveGradedWrittenWork, true);
  assert.deepEqual(COURSE_ROUTE.contentControls.proficiencyDemonstrations, ["contracts", "pricing forms", "financing and cost-estimation forms"]);
});

test("only the three format elements are the exam-submission safe harbor", () => {
  const exam = COURSE_ROUTE.finalExam;
  assert.equal(exam.safeHarbor.minimumItems, 100);
  assert.equal(exam.safeHarbor.minimumChoicesPerItem, 4);
  assert.equal(exam.safeHarbor.everyConditionRequiredToAvoidSubmission, true);
  assert.equal(exam.safeHarbor.failureOfAnyConditionRequiresPriorCommissionApproval, true);
  assert.deepEqual(Object.keys(exam.safeHarbor).sort(), [
    "everyConditionRequiredToAvoidSubmission",
    "failureOfAnyConditionRequiresPriorCommissionApproval",
    "minimumChoicesPerItem",
    "minimumItems",
    "multipleChoiceRequired",
  ]);
  assert.equal(exam.fixedSubjectBuckets.length, 13);
  assert.equal(new Set(exam.fixedSubjectBuckets).size, 13);
  assert.equal(exam.conditionalAdditionalMattersBucket, true);
  assert.equal(exam.secureForms, 2);
  assert.equal(exam.proctored, true);
  assert.equal(exam.numericPassingScoreConfirmed, false);
});

test("the pilot names license classes and requires varied skills", () => {
  assert.equal(COURSE_ROUTE.pilot.participants, 9);
  assert.equal(COURSE_ROUTE.pilot.minimumUnlicensed, 3);
  assert.equal(COURSE_ROUTE.pilot.minimumLicensedSalespersonsOrCommunityAssociationManagers, 3);
  assert.equal(COURSE_ROUTE.pilot.minimumNonEducators, 6);
  assert.equal(COURSE_ROUTE.pilot.varyingComputerAndRealEstateSkillLevelsRequired, true);
  assert.equal("minimumLicensees" in COURSE_ROUTE.pilot, false);
});

test("market numbers are decision evidence but never mislabeled as active licenses or students", () => {
  assert.equal(MARKET.decision, "Georgia Phase 0 GO");
  assert.equal(MARKET.population2025Estimate, 11_302_748);
  assert.equal(MARKET.totalLicenseRecordsFY2025, 118_387);
  assert.equal(MARKET.newLicensesFY2025, 3_452);
  assert.match(MARKET.newLicenseCaveat, /not a count of unique 75-hour students/);
  assert.match(MARKET.demandDecision, /license-record base/);
  assert.doesNotMatch(MARKET.demandDecision, /active-license base/);
});

test("every operational unknown stays open and every filing/commerce gate stays closed", () => {
  assert.ok(OPEN_QUESTIONS.length >= 13);
  assert.equal(RELEASE_GATES.research, "GO");
  for (const [name, status] of Object.entries(RELEASE_GATES)) {
    if (name !== "research") assert.equal(status, "NO-GO", `${name} must remain closed`);
  }
  const readiness = georgiaReadiness();
  assert.equal(readiness.applicationsFiled, false);
  assert.equal(readiness.approvalsAsserted, false);
  assert.equal(readiness.enrollmentEnabled, false);
});

test("source lock uses an allowlist, exact binary controls, and unique claim IDs", () => {
  assert.equal(lock.version, "GA-PHASE0-2026-09-02-v3");
  assert.equal(lock.verified_as_of, "2026-09-02");
  assert.ok(lock.sources.length >= 20);
  assert.deepEqual([...lock.allowed_domains].sort(), [
    "gnpec.georgia.gov",
    "grec.state.ga.us",
    "rules.sos.ga.gov",
    "sos.ga.gov",
    "test-takers.psiexams.com",
    "www2.census.gov",
  ]);
  assert.deepEqual(Object.keys(lock.release_gates).sort(), [
    "advertising",
    "broker_filing",
    "course_development",
    "credit_reporting",
    "enrollment",
    "instructor_filing",
    "payment",
    "school_filing",
  ]);
  assert.ok(Object.values(lock.release_gates).every((state) => state === "CLOSED"));
  const allowed = new Set(lock.allowed_domains);
  const sourceIds = new Set();
  const claimIds = new Set();
  for (const source of lock.sources) {
    assert.equal(allowed.has(new URL(source.url).hostname), true, `${source.id} domain is not allowlisted`);
    assert.equal(sourceIds.has(source.id), false, `duplicate source id ${source.id}`);
    sourceIds.add(source.id);
    assert.ok(source.materialClaims.length > 0, `${source.id} has no material claims`);
    if (source.kind === "binary") {
      assert.match(source.expected.sha256, /^[a-f0-9]{64}$/);
      assert.ok(source.expected.bytes >= source.expected.minimumBytes);
      assert.equal(new URL(source.finalUrl).protocol, "https:");
      assert.equal(allowed.has(new URL(source.finalUrl).hostname), true, `${source.id} final URL domain is not allowlisted`);
    } else {
      assert.ok(source.expected.requiredPhrases.length >= 2);
    }
    for (const claim of source.materialClaims) {
      assert.equal(claimIds.has(claim.id), false, `duplicate claim id ${claim.id}`);
      claimIds.add(claim.id);
      assert.ok(claim.reliedOnBy.includes("config/georgia/phase-zero.mjs"), `${claim.id} is not traced to the control record`);
    }
  }
  const declaredClaims = new Set(Object.values(SOURCE_CLAIM_IDS));
  assert.deepEqual([...declaredClaims].sort(), [...claimIds].sort(), "control record and source lock must declare the same material claims");
  const routedClaims = new Set([
    ...BROKER_ROUTE.sourceClaimIds,
    ...INSTRUCTOR_ROUTE.sourceClaimIds,
    ...SCHOOL_ROUTE.sourceClaimIds,
    ...GNPEC_ROUTE.sourceClaimIds,
    ...COURSE_ROUTE.sourceClaimIds,
    ...MARKET.sourceClaimIds,
  ]);
  assert.deepEqual([...routedClaims].sort(), [...declaredClaims].sort(), "every material claim must be consumed by a route");
});

test("every reliedOnBy path exists inside the repository", () => {
  for (const source of lock.sources) {
    for (const claim of source.materialClaims) {
      assert.ok(claim.locator && claim.claim, `${claim.id} lacks content or locator`);
      assert.ok(claim.reliedOnBy.length > 0, `${claim.id} has no consumers`);
      for (const relative of claim.reliedOnBy) {
        const absolute = path.resolve(root, relative);
        assert.ok(absolute.startsWith(`${root}${path.sep}`), `${relative} escapes repository`);
        assert.equal(fs.existsSync(absolute), true, `${relative} does not exist`);
        assert.ok(read(relative).includes(claim.id), `${relative} does not declare its reliance on ${claim.id}`);
      }
    }
  }
});

test("offline verification is explicitly unverified and cannot open a gate", () => {
  const run = spawnSync(process.execPath, [verifier, "--offline", "--json"], { encoding: "utf8", cwd: root });
  assert.equal(run.status, 2);
  const result = JSON.parse(run.stdout);
  assert.equal(result.status, "OFFLINE_UNVERIFIED");
  assert.equal(result.filingAndCommerceGatesClosed, true);
  assert.notEqual(result.status, "LOCKED");
});

test("a generic network failure cannot borrow a manual reading to appear locked", () => {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "ga-lock-network-test-"));
  try {
    const testLock = {
      jurisdiction: "Georgia",
      version: "GA-PHASE0-2026-09-02-v997",
      verified_as_of: new Date().toISOString().slice(0, 10),
      maximum_age_days: 45,
      allowed_domains: ["127.0.0.1"],
      release_gates: { filing: "CLOSED", enrollment: "CLOSED" },
      sources: [{
        id: "TEST-NETWORK",
        title: "unreachable test fixture",
        authority: "test only",
        url: "https://127.0.0.1:1/unreachable",
        kind: "html",
        expected: { minimumBytes: 1, mimeTypes: ["text/html"], requiredPhrases: ["one", "two"] },
        manualVerification: { status: "verified", date: new Date().toISOString().slice(0, 10), method: "test fixture" },
        materialClaims: [{ id: "test-network-claim", locator: "test", claim: "test", reliedOnBy: ["georgia/PHASE-0-REPORT.md"] }],
      }],
    };
    const lockPath = path.join(temporaryDirectory, "lock.json");
    fs.writeFileSync(lockPath, JSON.stringify(testLock));
    const run = spawnSync(process.execPath, [verifier, "--lock", lockPath, "--json"], { encoding: "utf8", cwd: root });
    assert.equal(run.status, 2);
    const result = JSON.parse(run.stdout);
    assert.equal(result.status, "UNVERIFIED");
    assert.notEqual(result.status, "LOCKED_WITH_MANUAL_VERIFICATION");
    assert.equal(result.filingAndCommerceGatesClosed, true);
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});

test("a binary final URL outside the official allowlist breaks the lock", () => {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "ga-lock-redirect-test-"));
  try {
    const testLock = {
      jurisdiction: "Georgia",
      version: "GA-PHASE0-2026-09-02-v996",
      verified_as_of: new Date().toISOString().slice(0, 10),
      maximum_age_days: 45,
      allowed_domains: ["grec.state.ga.us"],
      release_gates: { filing: "CLOSED", enrollment: "CLOSED" },
      sources: [{
        id: "TEST-REDIRECT",
        title: "redirect test fixture",
        authority: "test only",
        url: "https://grec.state.ga.us/test.pdf",
        finalUrl: "https://example.com/test.pdf",
        kind: "binary",
        expected: { sha256: "0".repeat(64), bytes: 1, minimumBytes: 1, mimeTypes: ["application/pdf"], magicHex: "25" },
        manualVerification: { status: "verified", date: new Date().toISOString().slice(0, 10), method: "test fixture" },
        materialClaims: [{ id: "test-redirect-claim", locator: "test", claim: "test", reliedOnBy: ["georgia/PHASE-0-REPORT.md"] }],
      }],
    };
    const lockPath = path.join(temporaryDirectory, "lock.json");
    fs.writeFileSync(lockPath, JSON.stringify(testLock));
    const run = spawnSync(process.execPath, [verifier, "--lock", lockPath, "--offline", "--json"], { encoding: "utf8", cwd: root });
    assert.equal(run.status, 1);
    const result = JSON.parse(run.stdout);
    assert.equal(result.status, "BROKEN");
    assert.ok(result.checks.some((check) => /final HTTPS URL on the official-source allowlist/.test(check.detail)));
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});

test("content drift produces BROKEN and leaves filing/commerce gates closed", () => {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "ga-lock-drift-test-"));
  try {
    const fixturePath = path.join(temporaryDirectory, "source.pdf");
    const fixture = Buffer.from("%PDF-1.4\nmaterially different content\n", "utf8");
    fs.writeFileSync(fixturePath, fixture);
    const testLock = {
      jurisdiction: "Georgia",
      version: "GA-PHASE0-2026-09-02-v999",
      verified_as_of: new Date().toISOString().slice(0, 10),
      maximum_age_days: 45,
      allowed_domains: ["grec.state.ga.us"],
      release_gates: { filing: "CLOSED", enrollment: "CLOSED" },
      sources: [{
        id: "TEST-PDF",
        title: "test fixture",
        authority: "test only",
        url: "https://grec.state.ga.us/test-fixture.pdf",
        finalUrl: "https://grec.state.ga.us/test-fixture.pdf",
        kind: "binary",
        expected: { sha256: "0".repeat(64), bytes: fixture.length, minimumBytes: 1, mimeTypes: ["application/pdf"], magicHex: "25504446" },
        manualVerification: { status: "verified", date: new Date().toISOString().slice(0, 10), method: "test fixture" },
        materialClaims: [{ id: "test-claim", locator: "test", claim: "test", reliedOnBy: ["georgia/PHASE-0-REPORT.md"] }],
      }],
    };
    const lockPath = path.join(temporaryDirectory, "lock.json");
    fs.writeFileSync(lockPath, JSON.stringify(testLock));
    const run = spawnSync(process.execPath, [verifier, "--lock", lockPath, "--fixture", `TEST-PDF=${fixturePath}`, "--json"], { encoding: "utf8", cwd: root });
    assert.equal(run.status, 1);
    const result = JSON.parse(run.stdout);
    assert.equal(result.status, "BROKEN");
    assert.equal(result.filingAndCommerceGatesClosed, true);
    assert.ok(result.checks.some((check) => /content drift/.test(check.detail)));
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});

test("soft-404 HTML produces BROKEN even when HTTP and phrases appear valid", () => {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "ga-lock-soft404-test-"));
  try {
    const fixturePath = path.join(temporaryDirectory, "source.html");
    fs.writeFileSync(fixturePath, "<html><title>404 Page Not Found</title><h1>Page Not Found</h1></html>");
    const testLock = {
      jurisdiction: "Georgia",
      version: "GA-PHASE0-2026-09-02-v998",
      verified_as_of: new Date().toISOString().slice(0, 10),
      maximum_age_days: 45,
      allowed_domains: ["grec.state.ga.us"],
      release_gates: { filing: "CLOSED", enrollment: "CLOSED" },
      sources: [{
        id: "TEST-HTML",
        title: "test fixture",
        authority: "test only",
        url: "https://grec.state.ga.us/test-fixture",
        kind: "html",
        expected: { minimumBytes: 1, mimeTypes: ["text/html"], requiredPhrases: ["Page", "Not Found"] },
        manualVerification: { status: "verified", date: new Date().toISOString().slice(0, 10), method: "test fixture" },
        materialClaims: [{ id: "test-claim", locator: "test", claim: "test", reliedOnBy: ["georgia/PHASE-0-REPORT.md"] }],
      }],
    };
    const lockPath = path.join(temporaryDirectory, "lock.json");
    fs.writeFileSync(lockPath, JSON.stringify(testLock));
    const run = spawnSync(process.execPath, [verifier, "--lock", lockPath, "--fixture", `TEST-HTML=${fixturePath}`, "--json"], { encoding: "utf8", cwd: root });
    assert.equal(run.status, 1);
    const result = JSON.parse(run.stdout);
    assert.equal(result.status, "BROKEN");
    assert.equal(result.filingAndCommerceGatesClosed, true);
    assert.ok(result.checks.some((check) => /soft-404/.test(check.detail)));
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});

test("the complete filing package exists and never claims approval", () => {
  const files = [
    "georgia/PHASE-0-REPORT.md",
    "georgia/HANDOFF.md",
    "georgia/regulatory/official-sources.md",
    "georgia/regulatory/compliance-baseline.md",
    "georgia/submission/00-filing-index.md",
    "georgia/submission/01-broker-reciprocity-runbook.md",
    "georgia/submission/02-instructor-approval-map.md",
    "georgia/submission/03-instructor-points-working-sheet.md",
    "georgia/submission/04-school-approval-map.md",
    "georgia/submission/05-distance-course-approval-map.md",
    "georgia/submission/06-owner-action-checklist.md",
    "georgia/submission/07-market-evidence.md",
    "georgia/submission/regulator-inquiries/GREC-prefiling-inquiry.md",
    "georgia/submission/regulator-inquiries/GNPEC-exemption-inquiry.md",
  ];
  for (const file of files) {
    assert.equal(fs.existsSync(path.join(root, file)), true, `${file} missing`);
    assert.doesNotMatch(read(file), /StateCourse (?:is|has been) approved/i, `${file} asserts approval`);
  }
  assert.equal(PHASE_ZERO.APPLICANT.approvalAsserted, false);
});
