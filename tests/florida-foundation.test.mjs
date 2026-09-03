/*
 * Florida — the foundation, and the rule that no Florida content may exist without its authority.
 *
 * WHAT THESE TESTS ARE ABOUT. Florida is the first state in this repository whose authorities could
 * all be read, so the failures worth guarding against are not missing sources. They are numbers that
 * were each correct and did not add up together, transcriptions that drifted, and — the one that
 * actually happened — a conclusion that survived review because it was stated confidently.
 *
 * PHASE 0 v1 GOT THE ELIGIBILITY LAW WRONG, AND THAT SHAPES THIS FILE. It reported that Rule
 * 61J2-17.011(2), F.A.C. made a Florida broker's licence mandatory for the school permitholder and
 * that no StateCourse individual could sign an application. Section 475.451(2)(a), Fla. Stat. says
 * in terms that a permitholder "must be the holder of a license as a broker ... or must have passed
 * an instructor's examination approved by the commission", and DBPR's own RE 5, RE 6 and RE 3 all
 * carry that alternative on their face. An administrative rule with a cross-reference that does not
 * even resolve had been allowed to override a statute. Several tests below exist specifically so
 * that the corrected reading cannot quietly revert.
 *
 * FOUR KINDS OF TEST, AND THE LAST TWO MATTER MOST.
 *
 *   FIXED — what is true now: one 63-hour course, 19 sections, 180 objectives, nothing approved,
 *   nothing enrolling, no credential number anywhere.
 *
 *   ARITHMETIC — the totals, computed rather than trusted. A course can carry a correct 63, a
 *   correct 60, a correct 3 and a correct 100 and still be non-compliant.
 *
 *   HONESTY — that what is not known is still recorded as not known, and that what is StateCourse's
 *   choice is still labelled a choice rather than a rule. These fail when somebody upgrades a
 *   judgement to a fact, which is the likeliest way this work gets undone.
 *
 *   CONDITIONAL — vacuous today, binding the moment a Florida curriculum file appears.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import MANIFEST, { AUTHORITY_CLASS, FORBIDDEN_CLAIMS, SCHOOL, SOURCES, REACHABILITY } from "../config/florida/regulatory-manifest.mjs";
import SYLLABUS, { SECTIONS, SYLLABUS_REFERENCE } from "../config/florida/frec-course-i-syllabus.mjs";
import REQUIREMENTS, { ASSESSMENT, COMPLETION, DISTANCE_DELIVERY, PERIODIC_ASSESSMENT, TIME } from "../config/florida/course-i-requirements.mjs";
import ARCH, { ITEM_COUNT_QUESTION, OPEN_DBPR_QUESTIONS, PROCTORING, REGULATORY_MINIMUM_CONFIRMED, RESOLVED_DBPR_QUESTIONS, STATECOURSE_CONSERVATIVE_POLICY, TIER } from "../config/florida/assessment-architecture.mjs";
import LEDGER, { ELIGIBILITY_MATRIX, INSTRUCTOR_PERMIT_ROUTES, SELECTED_BROKER_ROUTE, ENDORSEMENT_LAW_EXAM, floridaReadiness } from "../config/florida/school-permit-ledger.mjs";
import PACKAGE, { EXAMINATION_FORM_COUNT_RESOLUTION, FORMS } from "../config/florida/dbpr-application-package.mjs";
import MATRIX, { DELIVERY_MATRIX } from "../config/florida/distance-delivery-matrix.mjs";
import VIDEO, { CANDIDATES, REJECTED } from "../config/florida/video-instruction-plan.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const registry = JSON.parse(read("public/statecourse/data/state-registry.json"));
const florida = registry.states.find((s) => s.state_code === "FL");

const CURRICULUM_DIR = "florida/fl-sales-associate-course-i-63-v1/curriculum";
const curriculumExists = () => fs.existsSync(path.join(ROOT, CURRICULUM_DIR));
const curriculumFiles = () =>
  (curriculumExists() ? fs.readdirSync(path.join(ROOT, CURRICULUM_DIR)).filter((f) => f.endsWith(".md")) : []);
const curriculum = () => curriculumFiles().map((f) => read(`${CURRICULUM_DIR}/${f}`)).join("\n");

/* ── the programme shape ─────────────────────────────────────────────────────────────────────── */

test("Florida is ONE 63-hour course to sales associate licensure", () => {
  assert.equal(MANIFEST.PROGRAMS.length, 1);
  const course = MANIFEST.PROGRAMS[0];
  assert.equal(course.totalHours, 63, "s. 475.17(2)(a)1, Fla. Stat.; Rule 61J2-3.008(1), F.A.C.");
  assert.equal(course.hourIsMinutes, 50, "Florida hours are 50 minutes, not 60");
  assert.equal(course.hoursIncludeExamination, true);
  assert.equal(MANIFEST.PATHWAY.courseAloneConfersLicence, false, "Rule 61J2-3.008(3)(a)");
});

/* ── arithmetic ──────────────────────────────────────────────────────────────────────────────── */

test("the hour split reconciles to the minute, and only under the 50-minute reading", () => {
  assert.equal(TIME.totalMinutes, 3150);
  assert.equal(TIME.instructionMinutes, 3000);
  assert.equal(TIME.examinationMinutes, 150);
  assert.equal(TIME.instructionMinutes + TIME.examinationMinutes, TIME.totalMinutes);
  assert.equal(TIME.splitReconciles, true);

  const clockHourReading = TIME.instructionMinutes + TIME.examinationHours * 60;
  assert.ok(clockHourReading > TIME.totalMinutes,
    "a clock-hour examination would exceed the s. 475.17(2)(a)1 ceiling — this is why the 50-minute reading is the only coherent one");
});

test("online delivery buys no discount on time", () => {
  assert.equal(TIME.distanceHourEqualsClassroomHour, true, "Rule 61J2-3.008(4)(b)3.1 and 3.2");
});

/* ── the syllabus lock ───────────────────────────────────────────────────────────────────────── */

test("the syllabus is nineteen sections in the Commission's own order", () => {
  assert.equal(SECTIONS.length, 19);
  assert.deepEqual(SYLLABUS.prescribedOrder(), Array.from({ length: 19 }, (_, i) => i + 1),
    "Rule 61J2-3.008(4)(b)3.h makes the ORDER a compliance property");
  assert.equal(SECTIONS[0].title, "Course Overview: The Real Estate Business");
});

test("the syllabus carries 180 verified objectives and the sum matches the total", () => {
  /* 180, not the 181 or 182 that two OCR passes produced. And 180 is corroborated rather than
     merely counted: DBPR RE 18 requires learning objectives at three per hour, and 3 x 60 = 180. */
  assert.equal(SYLLABUS.TOTAL_LEARNING_OBJECTIVES, 180);
  const summed = SECTIONS.reduce((n, s) => n + s.learningObjectives.length, 0);
  assert.equal(summed, SYLLABUS.TOTAL_LEARNING_OBJECTIVES, "declared total must equal the sum of the section counts");
  assert.deepEqual(SECTIONS.map((s) => s.learningObjectiveCount),
    [7, 11, 7, 10, 9, 9, 10, 8, 9, 10, 11, 9, 10, 10, 6, 16, 8, 9, 11]);
});

test("the syllabus lock's own verify() passes on all four failure conditions", () => {
  /* total != sum of sections; an objective without a page reference; an objective left OCR-only;
     section order departing from the incorporated syllabus. */
  assert.deepEqual(SYLLABUS.verify(), []);
});

test("every learning objective carries the printed page it appears on", () => {
  for (const s of SECTIONS) {
    for (const o of s.learningObjectives) {
      assert.ok(Number.isInteger(o.page) && o.page >= 1 && o.page <= 59,
        `section ${s.number} objective ${o.n} must carry a usable page reference`);
      assert.ok(o.text && o.text.trim().length > 3, `section ${s.number} objective ${o.n} must carry text`);
    }
  }
});

test("no objective rests on OCR alone", () => {
  assert.equal(SYLLABUS_REFERENCE.objectivesVerifiedAgainstSource, true);
  assert.equal(SYLLABUS_REFERENCE.transcribedCopy.hasTextLayer, true,
    "the transcription source must be the copy with a real text layer, not the scan");
  assert.equal(SYLLABUS_REFERENCE.citedCopy.hasTextLayer, false,
    "the copy the rule cites is the scan — recorded so the difference is never lost");
  assert.ok(fs.existsSync(path.join(ROOT, SYLLABUS_REFERENCE.citedCopy.localCopy)));
  assert.ok(fs.existsSync(path.join(ROOT, SYLLABUS_REFERENCE.transcribedCopy.localCopy)));
});

test("the OCR reconciliation record survives and resolves every disagreement", () => {
  const rec = JSON.parse(read("florida/frec-sources/extracted/syllabus-reconciliation.json"));
  assert.equal(rec.verifiedTotal, 180);
  assert.equal(rec.ocrTotal, 181, "the OCR cross-check total, kept so the discrepancy is visible");
  assert.equal(rec.sections.length, 19);
  const disagreed = rec.sections.filter((s) => s.discrepancy);
  assert.deepEqual(disagreed.map((s) => s.number), [1, 3, 6, 7, 15]);
  for (const s of disagreed) {
    assert.ok(s.resolution && s.resolution.length > 40, `section ${s.number} discrepancy must carry a written resolution`);
  }
  for (const s of rec.sections) {
    assert.equal(s.objectives.length, s.verifiedObjectiveCount);
    for (const o of s.objectives) assert.ok(o.page, "every reconciled objective carries a page");
  }
});

test("Florida prescribes no per-section hours, so none is invented", () => {
  assert.equal(TIME.perSectionHoursPrescribedByFlorida, false);
  for (const s of SECTIONS) {
    assert.equal(s.hours, undefined,
      `section ${s.number} must not carry an hour allocation — Rule 61J2-3.008(4)(b)3.e makes any allocation something StateCourse must prove by objective study`);
  }
});

/* ── eligibility: the correction ─────────────────────────────────────────────────────────────── */

test("the statute's examination alternative is recorded, and no rule is allowed to erase it", () => {
  const statute = LEDGER.CONTROLLING_TEXTS.find((t) => t.cite === "s. 475.451(2)(a), Fla. Stat.");
  assert.ok(statute, "the controlling statutory text must be quoted in full");
  assert.match(statute.quote, /or must have passed an instructor’s examination approved by the commission/);
  assert.equal(statute.authorityClass, LEDGER.AUTHORITY_CLASS.STATUTE);

  const rule = LEDGER.CONTROLLING_TEXTS.find((t) => t.cite === "Rule 61J2-17.011(2), F.A.C.");
  assert.ok(rule.defect, "the non-resolving cross-reference must stay recorded");
  assert.match(rule.defect, /475\.25\(2\)/);
  assert.match(rule.interactionWithStatute, /Scoped, not exclusive/,
    "the rule conditions the broker branch; it does not close the examination branch");
});

test("there is no blocking gate, and nobody is asserted eligible", () => {
  assert.equal(SCHOOL.blockingGate, null, "the v1 blocking gate rested on a misreading and must not return");
  assert.equal(SCHOOL.lawfulRouteToSchoolPermitExists, true);
  assert.equal(SCHOOL.lawfulRouteToInstructorPermitExists, true);
  assert.equal(SCHOOL.routeTaken, false);
  assert.match(SCHOOL.selectedPersonalRoute, /2501\/1047/);
  assert.match(SCHOOL.selectedSchoolLaunchRoute, /RE 3.*1010/);
  assert.equal(SCHOOL.anyPersonAssertedEligible, false, "eligibility is the Department's determination, not this repository's");
  assert.equal(LEDGER.APPLICANT.eligibilityAsserted, false);
  assert.equal(LEDGER.APPLICANT.approvalAsserted, false);
});

test("the eligibility matrix carries all seven rows with honest statuses", () => {
  assert.equal(ELIGIBILITY_MATRIX.length, 7);
  assert.deepEqual(ELIGIBILITY_MATRIX.map((r) => r.row), [1, 2, 3, 4, 5, 6, 7]);
  const byRow = Object.fromEntries(ELIGIBILITY_MATRIX.map((r) => [r.row, r]));
  assert.match(byRow[1].status, /^AVAILABLE/, "the selected broker-endorsement route exists but is not held");
  assert.equal(byRow[1].selectedRoute, true);
  assert.match(byRow[1].stateCoursePosition, /No approval or present eligibility is asserted/);
  assert.match(byRow[2].status, /^AVAILABLE/, "the examination route is the selected school-launch route");
  assert.equal(byRow[2].selectedRoute, true);
  assert.match(byRow[2].stateCoursePosition, /DBPR confirmed in writing/);
  assert.match(byRow[3].status, /^AVAILABLE/, "the selected instructor route exists");
  assert.equal(byRow[3].selectedRoute, true);
  assert.match(byRow[4].status, /^NOT HELD/);
  assert.match(byRow[5].status, /^CONDITIONAL/, "the teaching permitholder requirement applies only in a stated case");
  for (const r of ELIGIBILITY_MATRIX) {
    assert.ok(r.subject && r.status && r.stateCoursePosition, `row ${r.row} must be complete`);
  }
});

test("the broker endorsement route is selected while the generic RE 2 conflict stays explicit", () => {
  assert.equal(SELECTED_BROKER_ROUTE.selected, true);
  assert.equal(SELECTED_BROKER_ROUTE.transactionCode, "2501/1047");
  assert.equal(SELECTED_BROKER_ROUTE.certifiedHistoryHeld, false);
  assert.equal(SELECTED_BROKER_ROUTE.scopeLawAttachmentRequired, true);
  assert.equal(SELECTED_BROKER_ROUTE.requiredCourseOnPublishedChecklist, false);
  assert.equal(SELECTED_BROKER_ROUTE.genericRe2InstructionsConflict, true);
  assert.equal(SELECTED_BROKER_ROUTE.courseRequirementWrittenConfirmationPending, true);
  assert.match(SELECTED_BROKER_ROUTE.requiredCourseFinding, /generic instructions/i);
  assert.equal(SELECTED_BROKER_ROUTE.equivalencyApprovalAsserted, false);
  assert.equal(SELECTED_BROKER_ROUTE.fallback.transactionCode, "2501/1012");
  assert.equal(SELECTED_BROKER_ROUTE.fallback.selected, false);
  assert.match(SELECTED_BROKER_ROUTE.fallback.activationCondition, /Final endorsement denial/);

  assert.equal(ENDORSEMENT_LAW_EXAM.selected, true);
  assert.equal(ENDORSEMENT_LAW_EXAM.assignmentConfirmedForTransaction, false);
  assert.match(ENDORSEMENT_LAW_EXAM.assignmentStatus, /expected/i);
  assert.match(ENDORSEMENT_LAW_EXAM.assignmentStatus, /475\.180/);
  assert.equal(ENDORSEMENT_LAW_EXAM.closedBook, true);
  assert.equal(ENDORSEMENT_LAW_EXAM.itemCount, 40);
  assert.equal(ENDORSEMENT_LAW_EXAM.allottedMinutes, 90);
  assert.equal(ENDORSEMENT_LAW_EXAM.passingCorrect, 30);
  assert.equal(ENDORSEMENT_LAW_EXAM.passingPercent, 75);
  assert.equal(ENDORSEMENT_LAW_EXAM.currentFeeVerified, false);
  assert.equal(ENDORSEMENT_LAW_EXAM.optionalPrep.advertisedPrice, 99);
  assert.equal(ENDORSEMENT_LAW_EXAM.optionalPrep.requiredByFrec, false);
});

test("the exam route is selected for the school while the degree-plus-broker route is optional", () => {
  const exam = INSTRUCTOR_PERMIT_ROUTES.find((r) => r.id === "instructor-examination");
  assert.equal(exam.requiresFloridaBrokerLicence, false);
  assert.equal(exam.openToStateCourse, true);
  assert.equal(exam.formCode, "1010", "DBPR RE 3 Section I basis code");
  assert.equal(exam.selected, true);
  assert.match(exam.routeRole, /school-launch/i);

  const selected = INSTRUCTOR_PERMIT_ROUTES.find((r) => r.formCode === "1030");
  assert.equal(selected.selected, false);
  assert.equal(selected.openToStateCourse, true);
  assert.equal(selected.currentlySatisfied, false);
  assert.match(selected.routeRole, /post-broker alternative/i);
  assert.match(selected.unresolved, /foreign Finance degree/);

  const extensive = INSTRUCTOR_PERMIT_ROUTES.find((r) => r.formCode === "1040");
  assert.equal(extensive.selected, false);
  assert.equal(extensive.openToStateCourse, false);
});

test("the school may designate someone other than its principal as permitholder", () => {
  assert.match(LEDGER.DESIGNATION_ANALYSIS.answer, /^Yes/);
  assert.ok(LEDGER.DESIGNATION_ANALYSIS.reasoning.includes("475.451(2)(a)"));
  assert.ok(LEDGER.DESIGNATION_ANALYSIS.constraint, "the role carries real duties and that must be said");
});

test("readiness reports NOT READY for accurate reasons", () => {
  const r = floridaReadiness();
  assert.equal(r.status, "NOT READY");
  assert.equal(r.selectedBrokerRoute, "2501/1047");
  assert.equal(r.selectedInstructorRoute, "1010");
  assert.equal(r.lawfulRouteToSchoolPermitExists, true);
  assert.equal(r.anyPersonAssertedEligible, false);
  assert.equal(r.anyApprovalAsserted, false);
  assert.equal(r.heldCount, 0);
  assert.doesNotMatch(r.reason, /blocked/i, "the reason must not describe a blocker that does not exist");
});

/* ── the DBPR application package ────────────────────────────────────────────────────────────── */

test("the current DBPR forms are held, with verified numbers and titles", () => {
  const byId = Object.fromEntries(FORMS.map((f) => [f.id, f]));
  assert.equal(byId["RE-3"].titleOnForm, "Application for Real Estate Instructor Permit");
  assert.equal(byId["RE-5"].titleOnForm, "Application for School Permit");
  assert.equal(byId["RE-9"].titleOnForm, "Application for Additional School Location");
  assert.equal(byId["RE-18"].titleOnForm, "Education Course Approval Application");
  for (const f of FORMS) {
    assert.ok(f.number.startsWith("DBPR RE "), `${f.id} must carry its DBPR number`);
    assert.ok(fs.existsSync(path.join(ROOT, f.localCopy)), `${f.id} must be held on disk`);
    assert.ok(f.url.startsWith("https://www2.myfloridalicense.com/"), `${f.id} must record where it came from`);
  }
  assert.equal(PACKAGE.FORMS_ADOPTED_BY.rule, "Rule 61-35.027, F.A.C.",
    "form numbers must be traceable to the rule that adopts them, not to recollection");
});

test("DBPR's own forms carry the examination route on their face", () => {
  const re5 = PACKAGE.formById("RE-5");
  assert.equal(re5.qualificationRoutesOnForm.length, 2);
  assert.ok(re5.qualificationRoutesOnForm.some((r) => r.requiresFloridaBrokerLicence === false),
    "RE 5 must offer a route that does not require a broker licence");
  assert.match(re5.noteOnForm, /must meet requirements of school instructor/);

  const re3 = PACKAGE.formById("RE-3");
  assert.equal(re3.qualificationRoutesOnForm[0].code, "1010");
  assert.equal(re3.qualificationRoutesOnForm[0].requiresFloridaBrokerLicence, false);

  const re6 = PACKAGE.formById("RE-6");
  assert.ok(re6.qualificationRoutesOnForm.some((r) => /Instructors Exam/i.test(r.label)));
});

test("RE 18 governs Course I despite its misleading running header", () => {
  const re18 = PACKAGE.formById("RE-18");
  assert.equal(re18.headerTitleIsMisleading, true);
  assert.ok(re18.courseTypesOnForm.includes("Sales Associate Pre-Licensure"));
  assert.ok(re18.deliveryMechanismsOnForm.includes("Distance"));
  assert.ok(re18.initialApprovalAttachments.some((a) => /[Tt]hree per hour/.test(a)),
    "the three-objectives-per-hour requirement must be recorded");
  assert.match(re18.localCopy, /CURRENT\.pdf$/);
  assert.ok(re18.initialApprovalAttachments.some((a) => /Two end of course examinations/.test(a)));
  assert.equal(PACKAGE.formById("RE-19").appliesToStateCourse, false);
});

test("the current RE 18 resolves two forms for distance pre-license and blacklists the legacy form", () => {
  const c = EXAMINATION_FORM_COUNT_RESOLUTION;
  assert.equal(c.ruleMinimum, 2);
  assert.equal(c.checklistSays, 2);
  assert.equal(c.currentApplicationSaysForPrePostLicense, 2);
  assert.equal(c.currentApplicationSaysForContinuingEducation, 5);
  assert.equal(c.legacyUseForFiling, false);
  assert.equal(c.openQuestion, false);
  assert.match(c.stateCourseposture, /Build and file two forms/i);
});

/* ── assessment: three tiers, never mixed ────────────────────────────────────────────────────── */

test("every confirmed assessment value carries the CONFIRMED tier and a citation", () => {
  for (const [key, entry] of Object.entries(REGULATORY_MINIMUM_CONFIRMED)) {
    assert.equal(entry.tier, TIER.CONFIRMED, `${key} must be in the confirmed tier`);
    assert.ok(entry.cite, `${key} must carry a citation`);
    assert.ok(entry.quote, `${key} must carry the quoted authority`);
  }
});

test("the item-count text remains open and 126 is conservative provider policy", () => {
  assert.deepEqual(ITEM_COUNT_QUESTION.candidates, [100, 120, 126]);
  assert.equal(ITEM_COUNT_QUESTION.tier, TIER.OPEN);
  assert.equal(ITEM_COUNT_QUESTION.settled, false);
  assert.equal(STATECOURSE_CONSERVATIVE_POLICY.itemCount.value, 126);
  assert.equal(STATECOURSE_CONSERVATIVE_POLICY.itemCount.tier, TIER.POLICY);
  assert.equal(STATECOURSE_CONSERVATIVE_POLICY.itemCount.isNotARegulatoryMinimum, true,
    "126 must never be presented as something Florida requires");
  assert.deepEqual(STATECOURSE_CONSERVATIVE_POLICY.itemCount.regulatoryTextCandidates, [100, 120, 126]);
  assert.equal(STATECOURSE_CONSERVATIVE_POLICY.itemCount.configurable, true,
    "the engine must stay configurable until DBPR answers");
  assert.ok(STATECOURSE_CONSERVATIVE_POLICY.itemCount.costOfThisChoice,
    "a conservative choice with a cost must state the cost");

  assert.equal(ASSESSMENT.plannedItemCountIsProviderPolicy, true);
  assert.equal(ASSESSMENT.regulatoryMinimumItems, null);
  assert.equal(ASSESSMENT.itemCountSettled, false);
});

test("two examination forms matches the rule and current RE 18", () => {
  assert.equal(REGULATORY_MINIMUM_CONFIRMED.minimumFormCount.value, 2);
  assert.equal(STATECOURSE_CONSERVATIVE_POLICY.formCount.value, 2);
  assert.equal(STATECOURSE_CONSERVATIVE_POLICY.formCount.isNotARegulatoryMinimum, false);
  assert.equal(STATECOURSE_CONSERVATIVE_POLICY.formCount.configurable, false);
});

test("the examination fits its time ceiling at both the planned count and the minimum", () => {
  const C = ARCH.COMPUTED;
  assert.equal(C.allottedMinutes, 150);
  assert.ok(C.withinTimeCeilingAsPlanned, `${C.plannedItems} items in 150 minutes must sit under 1.8 min/item`);
  assert.ok(C.withinTimeCeilingAt100ItemCandidate);
  assert.ok(C.minutesPerItemAsPlanned < C.minutesPerItemAt100ItemCandidate,
    "the conservative choice is measurably tighter on students, and the numbers must show it");
});

test("proctoring is NOT REQUIRED and NOT PROHIBITED — the difference is load-bearing", () => {
  assert.equal(PROCTORING.required, false);
  assert.equal(PROCTORING.prohibited, false, "the statute removes an obligation; it does not impose a ban");
  assert.match(PROCTORING.cite, /475\.17\(2\)\(a\)2/);
  assert.match(PROCTORING.doNotCite, /455\.2123/, "the wrong authority must stay named as wrong");
  assert.equal(ASSESSMENT.proctoringRequired, false);
  assert.equal(ASSESSMENT.proctoringProhibited, false);
});

test("the confidentiality requirement is derived from rules rather than asserted as preference", () => {
  assert.ok(ARCH.CONFIDENTIALITY.derivedFrom.length >= 4);
  for (const d of ARCH.CONFIDENTIALITY.derivedFrom) assert.match(d, /61J2-3\.008/);
  assert.ok(ARCH.CONFIDENTIALITY.retentionInteraction, "confidential is not the same as undocumented");
});

test("answered DBPR questions are closed while the remaining questions stay live", () => {
  assert.ok(OPEN_DBPR_QUESTIONS.length >= 6);
  for (const q of OPEN_DBPR_QUESTIONS) {
    assert.equal(q.tier, TIER.OPEN);
    assert.ok(q.question && q.pendingBehaviour, `${q.id} must state the question and what is done pending an answer`);
  }
  const ids = OPEN_DBPR_QUESTIONS.map((q) => q.id);
  for (const id of ["itemCountBasis", "instructionHourDefinition", "currentRe18Identity"]) {
    assert.ok(ids.includes(id), `${id} must stay open`);
  }
  for (const id of ["schoolPermitExamRouteAcceptance", "distanceOnlySchoolLocation"]) {
    assert.ok(!ids.includes(id), `${id} was answered and must not remain open`);
    assert.ok(RESOLVED_DBPR_QUESTIONS.some((q) => q.id === id && /2026-09-02/.test(q.source)), `${id} must retain its written source`);
  }
  const response = read("florida/submission/regulator-inquiries/dbpr-instructor-school-response-2026-09-02.md");
  assert.match(response, /No Florida broker license is required solely for the school route/i);
  assert.match(response, /permit must be issued before/i);
  assert.match(response, /actual physical business address[\s\S]*California physical address/i);
  assert.match(response, /registered-agent-only address does not require RE 9/i);
  assert.ok(ARCH.DRAFT_QUESTION_TO_DBPR.length > 800, "the historical combined record must retain its substantive text");
  assert.match(ARCH.DRAFT_QUESTION_TO_DBPR, /HISTORICAL[\s\S]*answered by DBPR[\s\S]*not as a current action/i);
  assert.match(ARCH.DRAFT_QUESTION_TO_DBPR, /at least 100 items, or 2 items per instruction hour/);
  assert.match(ARCH.DRAFT_QUESTION_TO_DBPR, /not currently permitted/, "the letter must not imply a status StateCourse lacks");
});

test("the confirmed Florida-specific assessment values are what Florida says", () => {
  assert.equal(ASSESSMENT.passingScorePercent, 70);
  assert.equal(ASSESSMENT.maximumCrossFormDuplicationPercent, 15);
  assert.equal(ASSESSMENT.minimumApplicationLevelPercent, 70);
  assert.equal(ASSESSMENT.maximumKnowledgeLevelPercent, 10);
  assert.equal(ASSESSMENT.answerChoicesPerItem, 4);
  assert.equal(ASSESSMENT.answerKeyCitesSourcePages, true);
  assert.equal(ASSESSMENT.examinationOrderMustNotFollowCourseOrder, true);
  assert.deepEqual([...ASSESSMENT.examinationAidsProhibited], ["hint", "back", "retry"]);
  assert.equal(ASSESSMENT.allSyllabusSessionsRequiredBeforeExamination, true);
  assert.equal(ASSESSMENT.retakeWaitDays, 30);
  assert.equal(ASSESSMENT.retakesPermittedWithinOneYear, 1);
  assert.equal(ASSESSMENT.differentFormOnRetakeOrRepeat, true);
});

/* ── distance delivery ───────────────────────────────────────────────────────────────────────── */

test("the delivery matrix covers every dimension and separates law from policy", () => {
  assert.ok(DELIVERY_MATRIX.length >= 18);
  for (const r of DELIVERY_MATRIX) {
    assert.ok(r.dimension, "every row names its dimension");
    assert.ok(r.required !== null || r.policy !== null, `${r.id} must state either a requirement or a policy`);
    if (r.required !== null) assert.ok(r.requiredCite, `${r.id} states a requirement and must cite it`);
    assert.ok(r.engine, `${r.id} must say what the engine has to do`);
  }
  assert.ok(MATRIX.expresslyRequired().length >= 15);
  assert.ok(MATRIX.policyOnly().length >= 3);
});

test("seat time alone does not satisfy Florida", () => {
  const row = DELIVERY_MATRIX.find((r) => r.id === "seat-time-not-sufficient");
  assert.ok(row, "the question must be answered explicitly");
  assert.match(row.required, /^No\./);
  assert.match(row.engine, /may not be completable by elapsed time alone/);
});

test("identity is verified at three moments, not one", () => {
  const row = DELIVERY_MATRIX.find((r) => r.id === "student-identity");
  assert.match(row.required, /enrollment, course participation and course completion/);
  assert.match(row.engine, /Three distinct verifications/);
});

test("accessibility and captions are recorded as StateCourse policy, not Florida law", () => {
  for (const id of ["accessibility", "captions-transcripts"]) {
    const row = DELIVERY_MATRIX.find((r) => r.id === id);
    assert.equal(row.required, null, `${id} must not claim a Florida requirement that does not exist`);
    assert.ok(row.policy, `${id} must still carry a StateCourse standard`);
    assert.match(row.requiredCite, /Nothing found|REPEALED|repealed/);
  }
});

test("Florida requires periodic assessment and does not require written reflection", () => {
  assert.equal(PERIODIC_ASSESSMENT.required, true);
  assert.equal(PERIODIC_ASSESSMENT.formPrescribedByFlorida, false);
  assert.equal(PERIODIC_ASSESSMENT.writtenReflectionRequiredByAuthority, false);
  assert.equal(PERIODIC_ASSESSMENT.minimumCharacterCountRequiredByAuthority, false);
});

test("every distance-delivery obligation is enumerated and none is yet held", () => {
  assert.ok(DISTANCE_DELIVERY.length >= 21);
  assert.equal(DISTANCE_DELIVERY.filter((o) => o.held).length, 0);
});

test("Florida's two record retention periods are kept apart", () => {
  assert.equal(COMPLETION.certificateRetentionYears, 5, "Rule 61J2-3.015(6)(f)");
  assert.equal(COMPLETION.schoolRecordsRetentionYears, 3, "s. 475.451(8), Fla. Stat.");
  assert.notEqual(COMPLETION.certificateRetentionYears, COMPLETION.schoolRecordsRetentionYears);
});

test("the completion certificate carries every prescribed field", () => {
  assert.equal(COMPLETION.certificateFields.length, 11);
  for (const f of ["School License Number", "Course Number", "Course Title: Course I", "Exam Date"]) {
    assert.ok(COMPLETION.certificateFields.includes(f));
  }
  assert.equal(SCHOOL.schoolLicenceNumber, null);
  assert.equal(SCHOOL.courseNumber, null);
});

test("the prescribed statements are quoted exactly", () => {
  assert.equal(REQUIREMENTS.CERTIFICATION_STATEMENT,
    "I certify that I personally completed all assignments and have not duplicated any portion of the end-of-course examination prior to the taking of the final examination.");
  assert.match(REQUIREMENTS.ANTI_RECRUITING_STATEMENT, /^Recruiting for employment opportunities/);
  assert.match(REQUIREMENTS.COMPLETION_CERTIFICATE_STATEMENT, /Florida Real Estate Commission/);
});

/* ── video ───────────────────────────────────────────────────────────────────────────────────── */

test("video is planned selectively, with rejected candidates recorded", () => {
  assert.ok(CANDIDATES.length >= 5 && CANDIDATES.length <= 12, "selective, not continuous coverage");
  assert.ok(REJECTED.length >= 6, "a plan listing only what was chosen hides what was considered");
  for (const r of REJECTED) assert.ok(r.reason && r.betterInstrument, "each rejection names a reason and a better instrument");
  for (const v of CANDIDATES) {
    assert.ok(v.syllabusSection && v.objectives.length > 0, `${v.id} must tie to syllabus objectives`);
    assert.ok(v.placement && v.whyVideoBeatsText && v.estimatedMinutes, `${v.id} must be fully specified`);
    assert.ok(v.presenterDocumentBalance && v.postVideoActivity, `${v.id} must state balance and follow-on activity`);
    assert.equal(typeof v.sourceHeld, "boolean", `${v.id} must say whether its source is held`);
    if (v.sourceHeld === false) assert.ok(v.sourceAcquisitionNote, `${v.id} must say what is missing`);
  }
});

test("no video is active, and none counts toward required instructional time", () => {
  assert.equal(VIDEO.anyActive(), false);
  assert.equal(VIDEO.TOTALS.active, 0);
  assert.equal(VIDEO.FLORIDA_VIDEO_AUTHORITY.videoCountsTowardInstructionalHours, false);
  assert.equal(VIDEO.PRODUCTION_RULES.countsTowardRequiredInstructionalTime, false);
  assert.equal(VIDEO.PRODUCTION_RULES.neverBlocksProgression, true);
  assert.equal(VIDEO.PRODUCTION_RULES.quizAnswerAtEndOfVideo, false);
  assert.equal(VIDEO.PRODUCTION_RULES.masteryCheckOnNextScreen, true);
  assert.equal(VIDEO.PRODUCTION_RULES.aiRecreatedGovernmentForms, false);
  assert.equal(VIDEO.PRODUCTION_RULES.automaticZooms, false);
  for (const v of CANDIDATES) {
    assert.equal(v.status, VIDEO.STATUS.PENDING);
    assert.ok(VIDEO.activationFailures(v).length > 0, `${v.id} must not be activatable while unproduced`);
  }
});

test("Florida's video rules are recorded as repealed", () => {
  assert.equal(VIDEO.FLORIDA_VIDEO_AUTHORITY.survivingMediaStandard, null);
  assert.equal(VIDEO.FLORIDA_VIDEO_AUTHORITY.repealedRules.length, 2);
  for (const r of VIDEO.FLORIDA_VIDEO_AUTHORITY.repealedRules) assert.match(r.repealed, /^2008-/);
});

/* ── nothing is approved, nothing enrols ─────────────────────────────────────────────────────── */

test("StateCourse holds no Florida credential and says so", () => {
  assert.equal(SCHOOL.schoolPermitHeld, false);
  assert.equal(SCHOOL.instructorPermitHeld, false);
  assert.equal(SCHOOL.courseApprovalHeld, false);
  assert.equal(SCHOOL.applicationFiled, false);
  assert.equal(SCHOOL.enrolmentEnabled, false);
  for (const n of [SCHOOL.schoolPermitNumber, SCHOOL.schoolLicenceNumber, SCHOOL.instructorPermitNumber, SCHOOL.courseNumber]) {
    assert.equal(n, null);
  }
});

test("the public Florida record promises nothing StateCourse does not hold", () => {
  assert.ok(florida);
  assert.equal(florida.provider_approval_number, null);
  assert.doesNotMatch(String(florida.provider_status), /approved/i);
  assert.doesNotMatch(String(florida.public_status), /^(available|open|enrolling)$/i);
});

test("Florida law itself supplies the forbidden-claim list", () => {
  const ids = FORBIDDEN_CLAIMS.map((c) => c.id);
  for (const id of ["pass-guarantee", "pass-or-refund", "permit-as-endorsement", "employment-promise", "unheld-frec-approval"]) {
    assert.ok(ids.includes(id));
  }
  for (const claim of FORBIDDEN_CLAIMS) assert.match(claim.why, /475\.|61J2-/);
  const permitClaim = FORBIDDEN_CLAIMS.find((c) => c.id === "permit-as-endorsement");
  assert.match("issuance of a permit is an endorsement", permitClaim.pattern);
  assert.doesNotMatch("Broker License by Endorsement", permitClaim.pattern,
    "the statutory publicity guard must not outlaw the official licensure transaction name");
});

/* ── the sources ─────────────────────────────────────────────────────────────────────────────── */

test("every source is classified by the kind of authority it is", () => {
  const valid = new Set(Object.values(AUTHORITY_CLASS));
  for (const s of SOURCES) {
    assert.ok(valid.has(s.authorityClass), `${s.id} must carry an authority class`);
    assert.ok(s.citation && s.publisher && s.url && s.readOn);
    if (s.localCopy) assert.ok(fs.existsSync(path.join(ROOT, s.localCopy)), `${s.id}: ${s.localCopy} must be on disk`);
  }
  assert.ok(SOURCES.some((s) => s.authorityClass === AUTHORITY_CLASS.STATUTE));
  assert.ok(SOURCES.some((s) => s.authorityClass === AUTHORITY_CLASS.FORM));
  assert.ok(SOURCES.some((s) => s.authorityClass === AUTHORITY_CLASS.VENDOR));
  for (const s of SOURCES.filter((x) => !x.localCopy && x.contentValidation?.mediaType === "application/pdf")) {
    assert.match(s.remoteSha256 ?? "", /^[a-f0-9]{64}$/, `${s.id} remote PDF must be identity-locked by hash`);
  }
});

test("nothing rests on a source held only for navigation", () => {
  for (const s of SOURCES.filter((x) => x.authorityClass === AUTHORITY_CLASS.NAVIGATION)) {
    assert.equal(s.materialClaims.length, 0, `${s.id} is navigation and must carry no material claim`);
  }
});

test("every authority was read, and every material claim names what relies on it", () => {
  const unread = SOURCES.filter((s) => s.reachability !== REACHABILITY.READ && s.reachability !== REACHABILITY.READ_NOT_AUTHORITY);
  assert.equal(unread.length, 0);
  const claims = MANIFEST.allMaterialClaims();
  assert.ok(claims.length >= 70);
  for (const c of claims) assert.ok(c.reliedOnBy.length > 0, `a claim with no dependant is a claim nobody checks`);
});

test("the open conflicts between the authorities are still open", () => {
  const conflicts = MANIFEST.openConflicts();
  assert.ok(conflicts.length >= 10);
  const ids = conflicts.map((c) => c.sourceId);
  for (const id of ["FAC-61J2-3.008", "FAC-61J2-17.011", "FAC-61J2-3.013", "DBPR-RE-18"]) {
    assert.ok(ids.includes(id), `${id} conflict must stay recorded`);
  }
});

test("the held source inventory covers the controlling sources", () => {
  const inventory = JSON.parse(read("florida/frec-sources/source-inventory.json"));
  const paths = new Set(inventory.files.map((f) => f.path));
  for (const p of [
    "florida/frec-sources/fac/ref-14599-frec-course-1-eff-010123.pdf",
    "florida/frec-sources/dbpr/education/FREC1SyllabusCleanFinal01012023.pdf",
    "florida/frec-sources/dbpr/forms/DBPR_RE_5_School_Permit.pdf",
    "florida/frec-sources/dbpr/forms/DBPR_RE_3_Instructor_Permit.pdf",
    "florida/frec-sources/dbpr/education/frec_distance_ed_chk_list.pdf",
    "florida/frec-sources/extracted/syllabus-reconciliation.json",
  ]) {
    assert.ok(paths.has(p), `${p} must be in the held inventory`);
  }
});

/* ── conditional: vacuous today, binding the moment curriculum appears ───────────────────────── */

test("CONDITIONAL — Florida curriculum, if it exists, follows the syllabus order", () => {
  if (!curriculumExists()) return;
  const files = curriculumFiles().sort();
  assert.equal(files.length, 19, "Rule 61J2-3.008(4)(b)3.h requires the course to follow the syllabus's nineteen sections");
  files.forEach((file, index) => {
    assert.ok(file.startsWith(String(index + 1).padStart(2, "0")),
      `curriculum file ${file} is out of syllabus order`);
  });
});

test("CONDITIONAL — Florida curriculum, if it exists, carries its section's learning objectives", () => {
  if (!curriculumExists()) return;
  for (const file of curriculumFiles()) {
    const text = read(`${CURRICULUM_DIR}/${file}`);
    assert.match(text, /learning objectives/i, `${file} must carry learning objectives`);
  }
});

test("CONDITIONAL — Florida curriculum, if it exists, leaks no examination content", () => {
  if (!curriculumExists()) return;
  const text = curriculum();
  assert.doesNotMatch(text, /\banswer key\b/i);
  assert.doesNotMatch(text, /end-of-course examination question/i);
});

test("CONDITIONAL — Florida curriculum, if it exists, makes no claim the state forbids", () => {
  if (!curriculumExists()) return;
  const text = curriculum();
  for (const claim of FORBIDDEN_CLAIMS) assert.doesNotMatch(text, claim.pattern, `${claim.id} — ${claim.why}`);
});

test("CONDITIONAL — a Florida course may not enrol before the approvals exist", () => {
  if (!curriculumExists()) return;
  assert.equal(SCHOOL.enrolmentEnabled, false);
  assert.equal(florida.public_status, "Coming Soon");
});
