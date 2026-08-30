/*
 * Florida — the foundation, and the rule that no Florida content may exist without its authority.
 *
 * WHAT THESE TESTS ARE ABOUT. Florida is the first state in this repository whose authorities could
 * ALL be read. Texas's could not — the Secretary of State moved the Administrative Code behind a
 * JavaScript portal — so the Texas foundation tests are largely about proving that no content can
 * appear while the law behind it cannot be opened. Florida's problem is the opposite and needs a
 * different kind of test. When you can read everything, the failures that survive review are not
 * missing sources. They are numbers that were each correct and did not add up together, and
 * readings that were plausible and were never checked against the other rule that contradicts them.
 *
 * So the arithmetic is asserted here rather than trusted. A course can carry a correct 63, a
 * correct 60, a correct 3 and a correct 100 and still be non-compliant, and re-reading the
 * citations will never reveal it — only doing the addition does.
 *
 * THREE KINDS OF TEST BELOW, AND THE THIRD MATTERS MOST.
 *
 *   FIXED tests assert what is true now: one 63-hour course, nothing approved, nothing enrolling,
 *   no credential number anywhere, the syllabus locked at nineteen sections in the Commission's
 *   order, the hour split reconciling to the minute.
 *
 *   HONESTY tests assert that what this build does NOT know is still recorded as not known — that
 *   the OCR'd learning objectives are still flagged unverified, that the examination item floor is
 *   still recorded as unsettled, that the open conflicts are still open. These fail if somebody
 *   quietly upgrades a guess to a fact, which is the failure mode a well-written config invites.
 *
 *   CONDITIONAL tests are vacuous today and become binding the moment a Florida curriculum file
 *   appears. They are written now, before the content, so that the content is written to them
 *   rather than the other way round. A conditional test written after the thing it guards is a test
 *   that has already failed to catch anything.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import MANIFEST, { FORBIDDEN_CLAIMS, SCHOOL, SOURCES, REACHABILITY } from "../config/florida/regulatory-manifest.mjs";
import SYLLABUS, { SECTIONS, SYLLABUS_REFERENCE } from "../config/florida/frec-course-i-syllabus.mjs";
import REQUIREMENTS, { ASSESSMENT, COMPLETION, DISTANCE_DELIVERY, PERIODIC_ASSESSMENT, TIME } from "../config/florida/course-i-requirements.mjs";
import LEDGER, { BLOCKING_GATES, floridaReadiness } from "../config/florida/school-permit-ledger.mjs";

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

test("Florida is ONE 63-hour course to sales associate licensure, not a stack of them", () => {
  assert.equal(MANIFEST.PROGRAMS.length, 1, "Florida should model exactly one pre-license course");
  const course = MANIFEST.PROGRAMS[0];
  assert.equal(course.totalHours, 63, "s. 475.17(2)(a)1, Fla. Stat. and Rule 61J2-3.008(1), F.A.C.");
  assert.equal(course.hourIsMinutes, 50, "Florida hours are 50 minutes, not 60");
  assert.equal(course.hoursIncludeExamination, true, "the 63 hours are inclusive of examination");
  assert.equal(MANIFEST.PATHWAY.totalPreLicenseHours, 63);
  assert.equal(MANIFEST.PATHWAY.courseIds.length, 1);
});

test("completing the course is never the same thing as holding the licence", () => {
  /* Rule 61J2-3.008(3)(a): satisfactory completion does not entitle anyone to a licence until they
     have met all other requirements of law and passed the state examination DBPR administers. */
  assert.equal(MANIFEST.PATHWAY.courseAloneConfersLicence, false);
});

/* ── the arithmetic, which is the whole point ────────────────────────────────────────────────── */

test("the hour split reconciles to the minute, and only under the 50-minute reading", () => {
  assert.equal(TIME.totalMinutes, 3150, "63 hours x 50 minutes");
  assert.equal(TIME.instructionMinutes, 3000, "60 instruction hours x 50 minutes");
  assert.equal(TIME.examinationMinutes, 150, "3 examination hours x 50 minutes");
  assert.equal(TIME.instructionMinutes + TIME.examinationMinutes, TIME.totalMinutes,
    "the syllabus's 60 + 3 must exhaust the rule's 63 exactly, with nothing left over");
  assert.equal(TIME.splitReconciles, true);

  /* The reading that does NOT work, asserted so that nobody re-introduces it: three CLOCK hours of
     examination would make the course 3,180 minutes, which is 63.6 fifty-minute hours and breaches
     the statutory ceiling that says the course "shall not exceed" 63. */
  const clockHourReading = TIME.instructionMinutes + TIME.examinationHours * 60;
  assert.ok(clockHourReading > TIME.totalMinutes,
    "a clock-hour examination would exceed the s. 475.17(2)(a)1 ceiling — this is why the 50-minute reading is the only coherent one");
});

test("online delivery buys no discount on time", () => {
  /* Rule 61J2-3.008(4)(b)3.1 and 3.2: hour per classroom hour, and a 50-minute distance hour is the
     equivalent of a 50-minute classroom hour. */
  assert.equal(TIME.distanceHourEqualsClassroomHour, true);
});

test("the planned examination sits inside the 1.8 minute per item ceiling", () => {
  assert.equal(ASSESSMENT.allottedMinutes, 150, "the examination's own three 50-minute hours");
  assert.ok(ASSESSMENT.withinTimeCeiling,
    `${ASSESSMENT.plannedItemCount} items in ${ASSESSMENT.allottedMinutes} minutes must not exceed ${ASSESSMENT.maximumMinutesPerItem} minutes per item`);
  assert.ok(ASSESSMENT.minutesPerItemAsPlanned <= ASSESSMENT.maximumMinutesPerItem);
});

test("the examination is built to the highest item floor any reading of the rule produces", () => {
  /* Rule 61J2-3.008(4)(d) says "at least 100 items, or 2 items per instruction hour", which is not
     one number. Planning to the largest satisfies every reading, and "at least" permits it. */
  const floors = ASSESSMENT.itemFloorCandidates.map((c) => c.items);
  assert.deepEqual(floors, [100, 120, 126], "the three readings of the floor");
  assert.equal(ASSESSMENT.plannedItemCount, Math.max(...floors));
  for (const floor of floors) {
    assert.ok(ASSESSMENT.plannedItemCount >= floor, `the plan must satisfy the floor of ${floor}`);
  }
});

/* ── Florida-specific requirements that must not drift toward another state's ─────────────────── */

test("the pass mark is 70% on the end-of-course examination", () => {
  assert.equal(ASSESSMENT.passingScorePercent, 70, "Rule 61J2-3.008(4)(a), F.A.C.");
});

test("Florida does not require the pre-license examination to be proctored or centralized", () => {
  /* s. 475.17(2)(a)2, Fla. Stat.: "Such examination shall not be required to be monitored or given
     at a centralized location." This is a Florida fact and differs from several other states. */
  assert.equal(ASSESSMENT.proctoringRequired, false);
  assert.equal(ASSESSMENT.centralizedLocationRequired, false);
  assert.equal(ASSESSMENT.examinationMustBeTimed, true, "unproctored does not mean untimed");

  /* The authority matters as much as the answer. s. 455.2123 says a similar thing about CONTINUING
     education and must never be cited for this. */
  assert.match(ASSESSMENT.proctoringAuthority, /475\.17\(2\)\(a\)2/);
  assert.doesNotMatch(ASSESSMENT.proctoringAuthority, /455\.2123/);
});

test("the examination constraints that shape the build are all present", () => {
  assert.equal(ASSESSMENT.minimumFormCount, 2, "Rule 61J2-3.008(4)(d): at least two forms");
  assert.equal(ASSESSMENT.maximumCrossFormDuplicationPercent, 15);
  assert.equal(ASSESSMENT.minimumApplicationLevelPercent, 70);
  assert.equal(ASSESSMENT.maximumKnowledgeLevelPercent, 10);
  assert.equal(ASSESSMENT.answerChoicesPerItem, 4);
  assert.equal(ASSESSMENT.answerKeyCitesSourcePages, true, "each answer key must cite the page numbers the item rests on");
  assert.equal(ASSESSMENT.examinationOrderMustNotFollowCourseOrder, true);
  assert.equal(ASSESSMENT.itemsMayNotReferToCourseMaterial, true);
  assert.deepEqual([...ASSESSMENT.examinationAidsProhibited], ["hint", "back", "retry"]);
  assert.equal(ASSESSMENT.allSyllabusSessionsRequiredBeforeExamination, true);
  assert.equal(ASSESSMENT.retakeWaitDays, 30);
  assert.equal(ASSESSMENT.retakesPermittedWithinOneYear, 1);
  assert.equal(ASSESSMENT.differentFormOnRetakeOrRepeat, true);
});

test("Florida's two record retention periods are kept apart", () => {
  /* Rule 61J2-3.015(6)(f) sets five years for the completion certificate; s. 475.451(8), Fla. Stat.
     sets three for rosters, attendance, examination copies and answer sheets. Applying one to both
     would be wrong in one direction or the other. */
  assert.equal(COMPLETION.certificateRetentionYears, 5);
  assert.equal(COMPLETION.schoolRecordsRetentionYears, 3);
  assert.notEqual(COMPLETION.certificateRetentionYears, COMPLETION.schoolRecordsRetentionYears);
});

test("the completion certificate carries every field the Commission prescribes", () => {
  /* Rule 61J2-3.015(6)(a). The two StateCourse cannot fill are exactly the two it does not hold. */
  assert.equal(COMPLETION.certificateFields.length, 11);
  for (const field of ["School License Number", "Course Number", "Course Title: Course I", "Exam Date"]) {
    assert.ok(COMPLETION.certificateFields.includes(field), `certificate must carry "${field}"`);
  }
  assert.equal(SCHOOL.schoolLicenceNumber, null, "and StateCourse holds no school licence number to put in it");
  assert.equal(SCHOOL.courseNumber, null, "nor a course number");
});

test("the prescribed statements are quoted exactly, not paraphrased", () => {
  assert.equal(
    REQUIREMENTS.CERTIFICATION_STATEMENT,
    "I certify that I personally completed all assignments and have not duplicated any portion of the end-of-course examination prior to the taking of the final examination.");
  assert.match(REQUIREMENTS.ANTI_RECRUITING_STATEMENT, /^Recruiting for employment opportunities for any real estate brokerage firm must be accomplished outside the prescribed instructional time\./);
  assert.match(REQUIREMENTS.COMPLETION_CERTIFICATE_STATEMENT, /in accordance with the requirements of the Florida Real Estate Commission/);
});

test("every distance-delivery obligation is enumerated and none is yet held", () => {
  assert.ok(DISTANCE_DELIVERY.length >= 21, "Rule 61J2-3.008(4)(b)3 carries a long list and all of it binds");
  assert.equal(DISTANCE_DELIVERY.filter((o) => o.held).length, 0, "no Florida course exists, so nothing can be held");
  for (const o of DISTANCE_DELIVERY) {
    assert.ok(o.cite && o.requirement, `${o.id} must carry a citation and a requirement`);
  }
  /* The three that are easiest to under-build, named so a change has to be deliberate. */
  const ids = DISTANCE_DELIVERY.map((o) => o.id);
  for (const id of ["identity-verification", "objective-time-study", "gate-examination-on-completion"]) {
    assert.ok(ids.includes(id), `${id} must be on the obligation list`);
  }
});

test("Florida requires periodic assessment and does not require written reflection", () => {
  /* Rule 61J2-3.008(4)(b)3.h requires the METHOD of periodic assessment to exist and be described.
     It prescribes no form. So the product rule stands: reflection stays optional and no artificial
     length minimum is imposed. This test exists so that "assessment" is not later read as importing
     a requirement Florida never made. */
  assert.equal(PERIODIC_ASSESSMENT.required, true);
  assert.equal(PERIODIC_ASSESSMENT.mustBeDescribedInSubmission, true);
  assert.equal(PERIODIC_ASSESSMENT.formPrescribedByFlorida, false);
  assert.equal(PERIODIC_ASSESSMENT.writtenReflectionRequiredByAuthority, false);
  assert.equal(PERIODIC_ASSESSMENT.minimumCharacterCountRequiredByAuthority, false);
});

/* ── the syllabus lock ───────────────────────────────────────────────────────────────────────── */

test("the syllabus is nineteen sections in the Commission's own order", () => {
  assert.equal(SECTIONS.length, 19);
  assert.deepEqual(SYLLABUS.prescribedOrder(), Array.from({ length: 19 }, (_, i) => i + 1),
    "Rule 61J2-3.008(4)(b)3.h makes the ORDER a compliance property, not an editorial preference");
  assert.equal(SECTIONS[0].title, "Course Overview: The Real Estate Business");
  assert.equal(SECTIONS[18].number, 19);
});

test("the syllabus lock points at the revision the rule actually incorporates", () => {
  assert.equal(SYLLABUS_REFERENCE.id, "Ref-14599");
  assert.equal(SYLLABUS_REFERENCE.revision, "January 1, 2023");
  assert.match(SYLLABUS_REFERENCE.incorporatedBy, /61J2-3\.008\(4\)\(b\)/);
  assert.ok(fs.existsSync(path.join(ROOT, SYLLABUS_REFERENCE.localCopy)), "the incorporated syllabus must be held on disk");
});

test("Florida prescribes no per-section hours, so none is invented", () => {
  assert.equal(TIME.perSectionHoursPrescribedByFlorida, false);
  for (const section of SECTIONS) {
    assert.equal(section.hours, undefined,
      `section ${section.number} must not carry an hour allocation — the syllabus allocates none and Rule 61J2-3.008(4)(b)3.e makes any allocation something StateCourse must prove by objective study`);
  }
});

/* ── honesty: what is not known stays recorded as not known ──────────────────────────────────── */

test("the OCR'd learning objectives are still flagged as unverified against the source", () => {
  /* The Commission publishes Ref-14599 as a scan with no text layer. Until a person reads the
     objectives against the PDF, they are a working index and not a certification. Flipping this
     flag without doing the reading is the exact failure this test exists to catch, which is why the
     count is held alongside it. */
  assert.equal(SYLLABUS_REFERENCE.hasTextLayer, false);
  assert.equal(SYLLABUS_REFERENCE.objectivesVerifiedAgainstSource, false,
    "if this is now true, the objectives must have been read against the PDF and the count below re-checked");
  assert.equal(SYLLABUS.TOTAL_LEARNING_OBJECTIVES, 181,
    "the objective count as recovered by OCR — a change here means the transcription changed and must be re-reviewed");
  for (const section of SECTIONS) {
    assert.equal(section.learningObjectives.length, section.learningObjectiveCount,
      `section ${section.number} objective count must match the objectives actually carried`);
  }
});

test("the examination item floor is still recorded as unsettled by the rule", () => {
  assert.equal(ASSESSMENT.itemFloorSettledByRule, false,
    "Rule 61J2-3.008(4)(d) gives three readings; planning to the safest is not the same as knowing the answer");
});

test("the open conflicts between the authorities are still open", () => {
  const conflicts = MANIFEST.openConflicts();
  assert.ok(conflicts.length >= 6, "conflicts found in Phase 0 must not quietly disappear");
  const ids = conflicts.map((c) => c.sourceId);
  assert.ok(ids.includes("FAC-61J2-17.011"), "the unresolvable s. 475.25(2)(a) cross-reference must stay recorded");
  assert.ok(ids.includes("FAC-61J2-3.008"), "the examination item-floor ambiguity must stay recorded");
  assert.ok(ids.includes("FAC-61J2-3.013"), "the missing pre-license hardship definition must stay recorded");
});

test("the questions Florida's rules do not answer are carried, not closed", () => {
  assert.ok(REQUIREMENTS.OPEN_QUESTIONS.length >= 5);
  for (const q of REQUIREMENTS.OPEN_QUESTIONS) {
    assert.ok(q.question && q.cite && q.plannedPending, `${q.id} must carry a question, a citation, and what is planned pending an answer`);
  }
});

test("no form number is recorded anywhere, because none could be identified", () => {
  /* The DBPR schools page served a navigation shell. A plausible-looking form number is worse than
     none, so the ledger carries none and reports itself unverified against the application. */
  const ledgerText = read("config/florida/school-permit-ledger.mjs");
  assert.doesNotMatch(ledgerText, /\bDBPR\s+RE\s*\d+\b/, "no DBPR form number may be guessed into the ledger");
  assert.equal(floridaReadiness().ledgerVerifiedAgainstApplication, false);
  assert.equal(floridaReadiness().ledgerIsAFloorNotAList, true);
});

/* ── nothing is approved, nothing enrols ─────────────────────────────────────────────────────── */

test("StateCourse holds no Florida credential and says so", () => {
  assert.equal(SCHOOL.schoolPermitHeld, false);
  assert.equal(SCHOOL.instructorPermitHeld, false);
  assert.equal(SCHOOL.courseApprovalHeld, false);
  assert.equal(SCHOOL.applicationFiled, false);
  assert.equal(SCHOOL.enrolmentEnabled, false);
  for (const n of [SCHOOL.schoolPermitNumber, SCHOOL.schoolLicenceNumber, SCHOOL.instructorPermitNumber, SCHOOL.courseNumber]) {
    assert.equal(n, null, "no credential number may be recorded while no credential is held");
  }
});

test("readiness cannot report READY, and names the person-shaped gate that stops it", () => {
  const readiness = floridaReadiness();
  assert.equal(readiness.status, "NOT READY");
  assert.ok(readiness.blockingGates.includes("school-permitholder-florida-broker-licence"),
    "Rule 61J2-17.011(2), F.A.C. requires the school permit holder to hold a FLORIDA broker's licence");
  assert.equal(LEDGER.APPLICANT.principalHoldsFloridaBrokerLicence, false);
  for (const gate of BLOCKING_GATES) {
    assert.equal(gate.resolved, false);
    assert.ok(gate.routesOut.length > 0, `${gate.id} must name at least one way out, or it is a complaint rather than a gate`);
  }
});

test("the public Florida record promises nothing StateCourse does not hold", () => {
  assert.ok(florida, "the public state registry must carry an FL record");
  assert.equal(florida.provider_approval_number, null);
  assert.doesNotMatch(String(florida.provider_status), /approved/i);
  assert.doesNotMatch(String(florida.public_status), /^(available|open|enrolling)$/i);
});

test("Florida law itself supplies the forbidden-claim list, not house style", () => {
  /* s. 475.451(3) and s. 475.4511 make several of these unlawful rather than merely unwise, and
     s. 475.451(4) makes a breach of the permit provisions a second-degree misdemeanour. */
  const ids = FORBIDDEN_CLAIMS.map((c) => c.id);
  for (const id of ["pass-guarantee", "pass-or-refund", "permit-as-endorsement", "employment-promise", "unheld-frec-approval"]) {
    assert.ok(ids.includes(id), `${id} must be a forbidden claim`);
  }
  for (const claim of FORBIDDEN_CLAIMS) {
    assert.match(claim.why, /475\.|61J2-/, `${claim.id} must cite the Florida authority that forbids it`);
  }
});

/* ── the sources ─────────────────────────────────────────────────────────────────────────────── */

test("every authority was read, and every held copy is on disk", () => {
  for (const s of SOURCES) {
    assert.ok(s.citation && s.publisher && s.url && s.readOn, `${s.id} must carry citation, publisher, url and read date`);
    if (s.localCopy) assert.ok(fs.existsSync(path.join(ROOT, s.localCopy)), `${s.id}: ${s.localCopy} must be on disk`);
  }
  const unread = SOURCES.filter((s) => s.reachability !== REACHABILITY.READ && s.reachability !== REACHABILITY.READ_NOT_AUTHORITY);
  assert.equal(unread.length, 0, "Florida's authorities were all reachable; if one is not, nothing may rest on it");
});

test("nothing rests on an authority marked as not an authority", () => {
  for (const s of SOURCES.filter((x) => x.reachability === REACHABILITY.READ_NOT_AUTHORITY)) {
    assert.equal(s.materialClaims.length, 0, `${s.id} is recorded as not an authority and must carry no material claim`);
  }
});

test("every material claim names what relies on it", () => {
  const claims = MANIFEST.allMaterialClaims();
  assert.ok(claims.length >= 50, "the regulated facts this build rests on must all be written down");
  for (const c of claims) {
    assert.ok(c.reliedOnBy.length > 0, `a claim with no dependant is a claim nobody checks: "${c.claim.slice(0, 60)}"`);
  }
});

test("the held source inventory is present and covers the controlling sources", () => {
  const inventory = JSON.parse(read("florida/frec-sources/source-inventory.json"));
  const paths = new Set(inventory.files.map((f) => f.path));
  assert.ok(inventory.fileCount > 0);
  assert.ok(paths.has("florida/frec-sources/fac/ref-14599-frec-course-1-eff-010123.pdf"),
    "the incorporated syllabus is the one source the whole syllabus lock indexes");
  assert.ok(paths.has("florida/frec-sources/fac/fac-61J2-3.008.doc"));
  assert.ok(paths.has("florida/frec-sources/statutes/fs-chapter-475.html"));
});

/* ── conditional: vacuous today, binding the moment curriculum appears ───────────────────────── */

test("CONDITIONAL — Florida curriculum, if it exists, follows the syllabus order", () => {
  if (!curriculumExists()) return;
  const files = curriculumFiles().sort();
  assert.equal(files.length, 19,
    "Rule 61J2-3.008(4)(b)3.h requires the course to conform to and follow the order of the syllabus's nineteen sections");
  files.forEach((file, index) => {
    const expected = String(index + 1).padStart(2, "0");
    assert.ok(file.startsWith(expected),
      `curriculum file ${file} is out of syllabus order — expected section ${index + 1} at this position`);
  });
});

test("CONDITIONAL — Florida curriculum, if it exists, carries learning objectives for each session", () => {
  if (!curriculumExists()) return;
  for (const file of curriculumFiles()) {
    const text = read(`${CURRICULUM_DIR}/${file}`);
    assert.match(text, /learning objectives/i,
      `${file} must carry learning objectives — Rule 61J2-3.008(4)(b)3.h requires them for each session of the syllabus`);
  }
});

test("CONDITIONAL — Florida curriculum, if it exists, leaks no examination content", () => {
  if (!curriculumExists()) return;
  const text = curriculum();
  assert.doesNotMatch(text, /\banswer key\b/i, "no answer key may appear in student-facing curriculum");
  assert.doesNotMatch(text, /end-of-course examination question/i);
});

test("CONDITIONAL — Florida curriculum, if it exists, makes no claim the state forbids", () => {
  if (!curriculumExists()) return;
  const text = curriculum();
  for (const claim of FORBIDDEN_CLAIMS) {
    assert.doesNotMatch(text, claim.pattern, `${claim.id} — ${claim.why}`);
  }
});

test("CONDITIONAL — a Florida course may not enrol before the approvals exist", () => {
  if (!curriculumExists()) return;
  assert.equal(SCHOOL.enrolmentEnabled, false,
    "curriculum may be built before approval; enrolment may not. Approval status, build status and enrolment status are three separate facts.");
  assert.equal(florida.public_status, "Coming Soon");
});
