import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { COURSE_STATUS, SECTION_PLANS, TOTALS, verifyCurriculumPlan } from "../config/florida/course-i-curriculum.mjs";
import { MODULE_MASTERY_POLICY, PERIODIC_ASSESSMENTS } from "../config/florida/periodic-assessment-bank.mjs";
import { BANK_STATUS, SECURE_FINAL_DRAFT_ITEMS } from "../config/florida/secure-final-bank-draft.mjs";
import { CONTINUITY_PLAN, IDENTITY_STAGES, PROGRESSION, RECORDS, releaseFailures } from "../config/florida/distance-course-engine.mjs";
import { ENDORSEMENT_LAW_EXAM, INSTRUCTOR_EXAM } from "../config/florida/school-permit-ledger.mjs";
import { CANDIDATES, TOTALS as VIDEO_TOTALS } from "../config/florida/video-instruction-plan.mjs";
import { sourceById } from "../config/florida/regulatory-manifest.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COURSE = "florida/fl-sales-associate-course-i-63-v1";
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("authored curriculum plan covers all incorporated objectives and exact required time", () => {
  assert.deepEqual(verifyCurriculumPlan(), { ok: true, failures: [] });
  assert.equal(TOTALS.sections, 19);
  assert.equal(TOTALS.objectives, 180);
  assert.equal(TOTALS.instructionMinutes, 3000);
  assert.equal(TOTALS.examinationMinutes, 150);
  assert.equal(TOTALS.courseMinutes, 3150);
});

test("all nineteen curriculum files exist in syllabus order", () => {
  const files = fs.readdirSync(path.join(ROOT, COURSE, "curriculum")).filter((f) => f.endsWith(".md")).sort();
  assert.equal(files.length, 19);
  files.forEach((f, i) => assert.ok(f.startsWith(String(i + 1).padStart(2, "0")), f));
  for (const section of SECTION_PLANS) {
    const file = `${String(section.number).padStart(2, "0")}-${section.slug}.md`;
    const text = read(`${COURSE}/curriculum/${file}`);
    assert.match(text, new RegExp(`Section ${section.number}:`));
    assert.match(text, new RegExp(`\\*\\*${section.plannedMinutes}\\*\\*`));
    for (const o of section.learningObjectives) {
      assert.ok(text.includes(`**${section.number}.${o.n}** ${o.text}`));
    }
  }
});

test("per-section time components reconcile and are labelled provider design", () => {
  for (const s of SECTION_PLANS) {
    assert.equal(s.components.reading + s.components.sourceWork + s.components.application + s.components.assessment, s.plannedMinutes);
    assert.match(s.allocationStatus, /STATECOURSE DESIGN BASELINE/);
  }
});

test("periodic assessment bank maps one-to-one to all 180 objectives", () => {
  assert.equal(PERIODIC_ASSESSMENTS.length, 180);
  assert.equal(new Set(PERIODIC_ASSESSMENTS.map((q) => q.id)).size, 180);
  assert.equal(new Set(PERIODIC_ASSESSMENTS.map((q) => q.objective)).size, 180);
  assert.deepEqual([...new Set(PERIODIC_ASSESSMENTS.map((q) => q.section))], Array.from({ length: 19 }, (_, i) => i + 1));
  for (const q of PERIODIC_ASSESSMENTS) {
    assert.equal(q.formativeOnly, true);
    assert.equal(q.eligibleForEndCourseExam, false);
    assert.equal(q.rubric.length, 4);
  }
});

test("module mastery is provider policy with preserved remediation", () => {
  assert.equal(MODULE_MASTERY_POLICY.thresholdPercent, 80);
  assert.equal(MODULE_MASTERY_POLICY.isFloridaMinimum, false);
  assert.equal(MODULE_MASTERY_POLICY.remediationRequiredBelowThreshold, true);
  assert.match(MODULE_MASTERY_POLICY.remediation, /without replacing the first attempt/);
});

test("secure final bank is a truthful incomplete development slice", () => {
  assert.equal(SECURE_FINAL_DRAFT_ITEMS.length, 19);
  assert.equal(BANK_STATUS.complete, false);
  assert.equal(BANK_STATUS.usableFormGenerated, false);
  assert.equal(BANK_STATUS.currentRequiredForms, 2);
  assert.equal(BANK_STATUS.currentPlannedSlots, 252);
  assert.equal(BANK_STATUS.remainingAuthoringSlots, 233);
  assert.equal(BANK_STATUS.remainingAuthoringSlotsIf100ItemsConfirmed, 181);
  assert.equal(new Set(SECURE_FINAL_DRAFT_ITEMS.map((q) => q.section)).size, 19);
  for (const q of SECURE_FINAL_DRAFT_ITEMS) {
    assert.equal(q.level, "application");
    assert.equal(q.choices.length, 4);
    assert.equal(new Set(q.choices).size, 4);
    assert.ok(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4);
    assert.ok(q.rationale.length > 25);
  }
});

test("page map supports every objective exactly once", () => {
  const map = JSON.parse(read(`${COURSE}/curriculum-page-map.json`));
  assert.equal(map.pages.length, 180);
  assert.equal(new Set(map.pages.map((p) => p.objective)).size, 180);
  assert.equal(new Set(map.pages.map((p) => p.curriculumPage)).size, 180);
  for (const q of SECURE_FINAL_DRAFT_ITEMS) assert.ok(map.pages.some((p) => p.objective === q.objective));
});

test("distance engine verifies identity at all three required moments", () => {
  assert.deepEqual(IDENTITY_STAGES.map((x) => x.stage), ["enrolment", "participation", "completion"]);
  assert.equal(PROGRESSION.elapsedTimeAloneCompletesNothing, true);
  assert.equal(PROGRESSION.sequential, true);
  assert.equal(PROGRESSION.finalUnlock.prescribedCertificationSubmitted, true);
  assert.deepEqual(PROGRESSION.sectionOrder, Array.from({ length: 19 }, (_, i) => i + 1));
});

test("final exam and launch remain disabled for concrete reasons", () => {
  assert.equal(PROGRESSION.finalEnabled, false);
  assert.equal(COURSE_STATUS.enrolmentEnabled, false);
  assert.equal(COURSE_STATUS.publicationEnabled, false);
  assert.ok(releaseFailures().length >= 5);
  assert.match(releaseFailures().join(" "), /school permit|instructor permit|course approval|secure forms/i);
});

test("continuity and retention controls are explicit", () => {
  assert.equal(CONTINUITY_PLAN.learnerStatusPage, true);
  assert.equal(CONTINUITY_PLAN.queuedSubmissionPreservation, true);
  assert.equal(CONTINUITY_PLAN.noCreditForUnavailableTime, true);
  assert.equal(RECORDS.schoolRecordYears, 3);
  assert.equal(RECORDS.completionCertificateYears, 5);
  assert.equal(RECORDS.preserveFirstAttempt, true);
});

test("the two formerly missing video sources are now held", () => {
  for (const id of ["FL-V06", "FL-V07"]) {
    const v = CANDIDATES.find((x) => x.id === id);
    assert.equal(v.sourceHeld, true);
    assert.ok(v.sourceLocalCopy);
  }
  assert.equal(VIDEO_TOTALS.blockedOnSourceAcquisition, 0);
});

test("2026 homestead treatment is locked to current DOR and controlling provisions", () => {
  const dor = sourceById("FL-DOR-2026-NAL-EXEMPT");
  const adjustment = sourceById("FL-DOR-CPI-HOMESTEAD-2026");
  assert.ok(dor);
  assert.ok(adjustment);
  assert.ok(dor.materialClaims.some((c) => /\$26,411/.test(c.claim) && /not school/i.test(c.claim)));
  assert.ok(adjustment.materialClaims.some((c) => /\$26,411/.test(c.claim) && /2\.7%/.test(c.claim)));
  for (const id of ["FL-CONST-ART-VII", "FL-CONST-ART-X", "FS-193", "FS-196", "FS-222", "FS-732"]) {
    assert.ok(sourceById(id), `${id} must remain held`);
  }
  assert.match(read(`${COURSE}/curriculum/18-taxes-affecting-real-estate.md`), /additional \$26,411 slice/);
});

test("Closing Disclosure instruction locks current federal forms and the CIB-linked specimen", () => {
  for (const id of ["REG-Z-APPENDIX-H", "CFPB-CLOSING-DISCLOSURE-H25A", "CFPB-CLOSING-DISCLOSURE-H25B", "CFPB-CLOSING-DISCLOSURE-SPECIMEN"]) {
    assert.ok(sourceById(id), `${id} must remain held`);
  }
  const specimen = sourceById("CFPB-CLOSING-DISCLOSURE-SPECIMEN");
  assert.ok(specimen.materialClaims.some((c) => /CIB prints this exact specimen URL/.test(c.claim)));
  const section = read(`${COURSE}/curriculum/14-computations-and-closing.md`);
  assert.match(section, /H-25\(A\).*blank model form/);
  assert.match(section, /H-25\(B\).*completed fixed-rate sample/);
  assert.match(section, /201311 CFPB specimen/);
});

test("current official instructor CIB controls the selected school-launch exam route", () => {
  assert.equal(INSTRUCTOR_EXAM.selected, true);
  assert.equal(INSTRUCTOR_EXAM.administrator, "Pearson VUE / Pearson Professional Assessments");
  assert.match(INSTRUCTOR_EXAM.delivery, /physical Pearson test center/);
  assert.equal(INSTRUCTOR_EXAM.closedBook, true);
  assert.equal(INSTRUCTOR_EXAM.itemCount, 100);
  assert.equal(INSTRUCTOR_EXAM.allottedMinutes, 210);
  assert.equal(INSTRUCTOR_EXAM.passingPoints, 75);
  assert.match(INSTRUCTOR_EXAM.prelicensingCertificateConflict, /RE 3.*require no prelicensing course certificate/i);
  assert.equal(INSTRUCTOR_EXAM.currentFeeVerified, false);
  assert.equal(INSTRUCTOR_EXAM.contentWeights.zoningAndPlanning, null);
  assert.match(INSTRUCTOR_EXAM.outlineAmbiguity, /no 0% is inferred/);
});

test("selected endorsement route records the expected shorter exam without pretending assignment", () => {
  assert.equal(ENDORSEMENT_LAW_EXAM.selected, true);
  assert.equal(ENDORSEMENT_LAW_EXAM.assignmentConfirmedForTransaction, false);
  assert.match(ENDORSEMENT_LAW_EXAM.assignmentStatus, /expected/i);
  assert.match(ENDORSEMENT_LAW_EXAM.assignmentStatus, /authorization notice/i);
  assert.equal(ENDORSEMENT_LAW_EXAM.itemCount, 40);
  assert.equal(ENDORSEMENT_LAW_EXAM.allottedMinutes, 90);
  assert.equal(ENDORSEMENT_LAW_EXAM.passingCorrect, 30);
  assert.equal(ENDORSEMENT_LAW_EXAM.optionalPrep.requiredByFrec, false);
});

test("reviewer submission package exists and refuses unsupported readiness", () => {
  for (const file of [
    "timed-course-outline.md", "delivery-method-and-controls.md", "objective-time-study-protocol.md",
    "records-identity-attendance-sop.md", "end-course-assessment-build-status.md", "exam-form-blueprint.md",
    "completion-certificate-template.md",
  ]) assert.ok(fs.existsSync(path.join(ROOT, COURSE, "submission", file)), file);
  assert.match(read(`${COURSE}/submission/objective-time-study-protocol.md`), /participant observations not yet collected/i);
  assert.match(read(`${COURSE}/submission/end-course-assessment-build-status.md`), /NO-GO for form assembly/);
});

test("filing-control package locks the current form, human sequence, and honest authoring volume", () => {
  const filingFiles = [
    "florida/submission/00-filing-index.md",
    "florida/submission/01-regulatory-route-and-cie-memo.md",
    "florida/submission/02-owner-action-and-form-data-checklist.md",
    "florida/submission/03-current-re18-form-control.md",
    "florida/submission/04-course-submission-manifest.md",
    "florida/submission/05-anatoliy-filing-runbook.md",
    "florida/submission/06-california-broker-scope-appendix.md",
    "florida/submission/regulator-inquiries/dbpr-broker-endorsement-and-degree-inquiry.md",
    "florida/submission/regulator-inquiries/dbpr-frec-prefiling-inquiry.md",
    "florida/submission/regulator-inquiries/dbpr-instructor-school-response-2026-09-02.md",
    "florida/submission/regulator-inquiries/pearson-instructor-exam-inquiry.md",
    "florida/submission/regulator-inquiries/transmission-log.md",
    `${COURSE}/submission/curriculum-review-and-expansion-ledger.md`,
  ];
  for (const file of filingFiles) assert.ok(fs.existsSync(path.join(ROOT, file)), file);

  const index = read("florida/submission/00-filing-index.md");
  assert.match(index, /two tracks now run in parallel/i);
  assert.match(index, /RE 3 Instructor Exam `\[1010\]`/);
  assert.match(index, /no Florida broker license is required solely for the school/i);
  assert.match(index, /closed book, 100 questions, 3\.5 hours, pass 75/i);
  assert.match(index, /RE 2 endorsement `\[2501\/1047\]`/);
  assert.match(index, /Out of State Experience `\[2501\/1012\]`[\s\S]*fallback/i);
  assert.match(index, /actual California physical business address/i);
  assert.match(index, /registered-agent-only address does not require RE 9/i);

  const formControl = read("florida/submission/03-current-re18-form-control.md");
  assert.match(formControl, /two forms for distance pre\/post-license/i);
  assert.match(formControl, /Superseded source - never file/i);

  const courseManifest = read("florida/submission/04-course-submission-manifest.md");
  assert.match(courseManifest, /233 additional slots/);
  assert.match(courseManifest, /181 remain/);
  assert.match(courseManifest, /Exam authoring is not allowed to overtake pagination/);

  const cieMemo = read("florida/submission/01-regulatory-route-and-cie-memo.md");
  assert.match(cieMemo, /course approval alone is insufficient/i);
  assert.match(cieMemo, /RE 5 school permit is expected to be the institution-level basis/i);

  const transmission = read("florida/submission/regulator-inquiries/transmission-log.md");
  assert.match(transmission, /westccmortgage@gmail\.com/);
  assert.match(transmission, /Reply-To[\s\S]*info@statecourse\.com/);
  assert.match(transmission, /DREEducation@myfloridalicense\.com/);
  assert.match(transmission, /Giuvanna\.Corona@myfloridalicense\.com/);
  assert.match(transmission, /1a05dda4f56a8d19/);
  assert.match(transmission, /1a05de8775c72589/);
  assert.match(transmission, /1a0608df533b3e4f/);
  assert.match(transmission, /No message was sent directly to Pearson/);
  const endorsementInquiry = read("florida/submission/regulator-inquiries/dbpr-broker-endorsement-and-degree-inquiry.md");
  assert.match(endorsementInquiry, /SENT 2026-09-01/);
  assert.match(endorsementInquiry, /No application has been submitted, and no eligibility or approval is assumed/);
  const historicalExamInquiry = read("florida/submission/regulator-inquiries/pearson-instructor-exam-inquiry.md");
  assert.match(historicalExamInquiry, /Historical\/fallback record only/);
  assert.match(historicalExamInquiry, /SENT TO DBPR BET; NOT SENT DIRECTLY TO PEARSON/);
});
