import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { COURSE_STATUS, SECTION_PLANS, TOTALS, verifyCurriculumPlan } from "../config/florida/course-i-curriculum.mjs";
import { MODULE_MASTERY_POLICY, PERIODIC_ASSESSMENTS } from "../config/florida/periodic-assessment-bank.mjs";
import { BANK_STATUS, SECURE_FINAL_DRAFT_ITEMS } from "../config/florida/secure-final-bank-draft.mjs";
import { CONTINUITY_PLAN, IDENTITY_STAGES, PROGRESSION, RECORDS, releaseFailures } from "../config/florida/distance-course-engine.mjs";
import { INSTRUCTOR_EXAM } from "../config/florida/school-permit-ledger.mjs";
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

test("current official instructor CIB resolves the former logistics gap", () => {
  assert.equal(INSTRUCTOR_EXAM.administrator, "Pearson VUE / Pearson Professional Assessments");
  assert.match(INSTRUCTOR_EXAM.delivery, /physical Pearson test center/);
  assert.equal(INSTRUCTOR_EXAM.closedBook, true);
  assert.equal(INSTRUCTOR_EXAM.itemCount, 100);
  assert.equal(INSTRUCTOR_EXAM.allottedMinutes, 210);
  assert.equal(INSTRUCTOR_EXAM.passingPoints, 75);
  assert.equal(INSTRUCTOR_EXAM.currentFeeVerified, false);
  assert.equal(INSTRUCTOR_EXAM.contentWeights.zoningAndPlanning, null);
  assert.match(INSTRUCTOR_EXAM.outlineAmbiguity, /no 0% is inferred/);
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
