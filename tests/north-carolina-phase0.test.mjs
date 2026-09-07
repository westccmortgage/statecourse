import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import { getNorthCarolinaCourse, northCarolinaCreditedHours, NORTH_CAROLINA_MODULE_IDS } from "../config/north-carolina-course-engine.mjs";
import { NC_BLOCKERS, NC_CLAIMS, NC_CONTROL_DATE, NC_MANIFEST_VERSION, NC_SOURCES, northCarolinaSourceById } from "../config/north-carolina/regulatory-manifest.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("manifest has a dated stable identity and only allowed claim statuses", () => {
  assert.equal(NC_CONTROL_DATE, "2026-09-07");
  assert.match(NC_MANIFEST_VERSION, /^NC-PHASE0-2026-09-07-v\d+$/);
  assert.ok(NC_SOURCES.length >= 25);
  assert.ok(NC_CLAIMS.length >= 20);
  for (const claim of NC_CLAIMS) assert.ok(["confirmed", "interpretation", "needs-regulator-confirmation"].includes(claim.status), claim.id);
});

test("every source carries required provenance and verification fields", () => {
  const ids = new Set();
  for (const source of NC_SOURCES) {
    assert.ok(!ids.has(source.id), source.id);
    ids.add(source.id);
    for (const field of ["authorityClass", "title", "url", "effectiveOrRevisionDate", "retrievedOn", "pinpoint", "evidence", "supersessionCheck", "verification"]) assert.ok(source[field], `${source.id}:${field}`);
    assert.equal(new URL(source.url).protocol, "https:");
    assert.equal(source.verification.publisherConfirmed, true);
    assert.equal(source.verification.contentAnchorConfirmed, true);
  }
});

test("every controlling claim resolves only to manifest sources", () => {
  for (const claim of NC_CLAIMS) {
    assert.ok(claim.sourceIds.length, claim.id);
    assert.ok(claim.pinpoint && claim.evidence && claim.reliedOnBy.length, claim.id);
    for (const sourceId of claim.sourceIds) assert.ok(northCarolinaSourceById(sourceId), `${claim.id}:${sourceId}`);
  }
});

test("broker path preserves both Rule .0511 elections and does not promise comparable status", () => {
  const path = read("north-carolina/regulatory/personal-broker-path.md");
  const plain = path.replace(/\*\*/g, "").replace(/\s+/g, " ");
  assert.match(plain, /\.0511\(b\)\(1\) State-section route/);
  assert.match(plain, /provisional status without that exam/i);
  assert.match(plain, /not yet established that NCREC will map a California Broker/i);
  assert.match(plain, /written NCREC confirmation/i);
});

test("broker application records the current fee, criminal report, and no invented fingerprint step", () => {
  const path = read("north-carolina/regulatory/personal-broker-path.md");
  assert.match(path, /\$105/);
  assert.match(path, /criminal records report/i);
  assert.match(path, /does \*\*not\*\* identify a fingerprint submission/i);
  assert.match(path, /seven years/);
  assert.match(path, /three years/);
});

test("instructor dossier contains every current Rule .0302 prerequisite", () => {
  const dossier = read("north-carolina/submission/03-instructor-candidate-dossier.md");
  for (const item of ["nonprovisional", "activation CE", "60 college semester hours", "instructor approval examination", "New Instructor Seminar", "90%", "15-minute", "Consent to Service"]) assert.match(dossier, new RegExp(item, "i"), item);
  assert.match(dossier, /at least one year in North Carolina/i);
  assert.match(dossier, /unresolved/i);
});

test("provider packet separates education certification from brokerage firm/BIC licensing", () => {
  const path = read("north-carolina/regulatory/personal-broker-path.md");
  assert.match(path, /Education-provider certification is not an NC brokerage firm license/i);
  assert.match(read("north-carolina/submission/01-provider-application-datasheet.md"), /\$200/);
  assert.match(read("north-carolina/submission/01-provider-application-datasheet.md"), /foreign-entity consent/i);
});

test("foreign LLC route is a fact-dependent legal gate, not an invented certainty", () => {
  const filing = read("north-carolina/submission/00-filing-index.md");
  assert.match(filing, /whether StateCourse LLC's exact.*operations require foreign-LLC authority/is);
  assert.match(filing, /Form L-09/);
  assert.match(filing, /\$250/);
  assert.match(filing, /less than six months old/i);
});

test("course application matrix contains every distance-specific Rule .0401 attachment", () => {
  const sheet = read("north-carolina/submission/02-course-approval-datasheet.md");
  for (const item of ["full course", "attendance method", "hardware/software", "technical support", "reviewer hardware/software", "225-wpm", "proctoring", "material-possession"]) assert.match(sheet, new RegExp(item, "i"), item);
});

test("PPD draft includes Rule .0204 topics and cannot accept enrollment or payment", () => {
  const ppd = read("north-carolina/submission/05-policies-procedures-disclosure-draft.md");
  for (const item of ["Commission", "not discriminate", "All-inclusive tuition", "refund", "materials", "hardware/software", "technical support", "end-of-course", "signed acknowledgment", "Performance Record"]) assert.match(ppd, new RegExp(item, "i"), item);
  assert.match(ppd, /Enrollment:\*\* closed/);
  assert.match(ppd, /payment remain disabled/i);
});

test("distance plan requires orientation, persistent navigation, sequential assessment and regulator access", () => {
  const plan = read("north-carolina/submission/06-distance-education-control-plan.md");
  for (const item of ["orientation", "persistent navigation", "next unit remains locked", "225 wpm", "identity", "proctoring", "reviewer access", "180-day", "three years"]) assert.match(plan, new RegExp(item, "i"), item);
});

test("timing report fails the present course instead of trusting planned-hour labels", () => {
  const report = read("north-carolina/submission/09-timing-evidence-report.md");
  assert.match(report, /57,677/);
  assert.match(report, /810,000/);
  assert.match(report, /must not be submitted or advertised as 75 hours/i);
  const timing = getNorthCarolinaCourse().timingEvidence;
  assert.equal(timing.validated, false);
  assert.equal(timing.commissionReadingRateWordsPerMinute, 225);
  assert.equal(timing.curriculumBaselineWords, 57677);
  assert.equal(timing.curriculumBaselineMinutes, 256.34);
});

test("certificate gate now requires every provider-level approval and operational proof", () => {
  const all = NORTH_CAROLINA_MODULE_IDS.map((module_id) => ({ module_id, status: "completed" }));
  const result = northCarolinaCreditedHours(all, { finalExamPercent: 100, attendanceMet: true, requiredActivitiesCompleted: true, providerCertificationNumber: "P", approvalNumber: "C", instructorApprovalNumber: "I", timingEvidenceValidated: true, finalExamSecurityValidated: true });
  assert.equal(result.certificateEligible, false, "outstanding Required Activities must still block issuance");
  assert.ok(result.outstandingRequiredActivities.length > 0);
});

test("engine release posture is unambiguously closed and unapproved", () => {
  const course = getNorthCarolinaCourse();
  assert.equal(course.enrollmentStatus, "closed");
  assert.equal(course.paymentStatus, "disabled");
  assert.equal(course.creditAvailability, "none");
  assert.match(course.approvalStatus, /Not approved/);
  assert.equal(course.regulatoryBlockers.length, NC_BLOCKERS.length);
});

test("record SOP carries exact completion, monthly, and retention deadlines", () => {
  const sop = read("north-carolina/submission/08-recordkeeping-reporting-sop.md");
  assert.match(sop, /within seven calendar days/i);
  assert.match(sop, /by the fifth day/i);
  assert.match(sop, /three years/i);
  assert.match(sop, /June 11-30/);
});

test("product roadmap distinguishes prelicense, three postlicense courses, elective and live Update", () => {
  const roadmap = read("north-carolina/submission/10-product-roadmap.md");
  for (const item of ["75-hour", "301 Broker Relationships", "302 Contracts", "303 NC Law", "CE electives", "in-person or synchronous distance", "81,587"]) assert.match(roadmap, new RegExp(item, "i"), item);
});

test("all required Phase 0 and submission-draft artifacts exist", () => {
  for (const path of ["north-carolina/regulatory/official-sources.md", "north-carolina/regulatory/personal-broker-path.md", "north-carolina/regulatory/requirements-traceability.md", "north-carolina/submission/00-filing-index.md", "north-carolina/submission/05-policies-procedures-disclosure-draft.md", "north-carolina/submission/09-timing-evidence-report.md", "north-carolina/HANDOFF.md"]) assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), path);
});
