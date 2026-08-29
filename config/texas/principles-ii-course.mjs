/**
 * Texas Principles of Real Estate II — course record.
 *
 * WHAT THIS FILE IS. The single place that says what this course IS: its identity, its module
 * order, its per-unit learning objectives, the instructional-time model that supports the
 * credit-hour claim, and the unit-by-unit trace from a PRINS2-1 unit to the module that teaches it
 * and the statute sections actually read for it. It mirrors config/texas/principles-i-course.mjs,
 * because two courses that report their compliance posture differently are two courses somebody has
 * to check twice.
 *
 * SEPARATE COURSE, NOT A HALF OF ONE. Principles of Real Estate I and II are two TREC courses with
 * two approval forms, two course numbers, two enrolments, two completion records and two prices.
 * Nothing in this build models them as one 60-hour course, and the foundation test asserts it.
 *
 * WHAT IS NOT ENABLED, AND WHY. No TREC approval exists for this course or for StateCourse as a
 * qualifying education provider. Enrolment, payment, credit reporting and certificate issuance are
 * all disabled here, and the examination — once built — is an artifact rather than an administrable
 * instrument, exactly as in Principles I. The codified 22 TAC provider rules still cannot be read
 * from this environment (the Secretary of State serves only a JavaScript shell to a non-browser
 * client); config/texas/trec-rules-source-lock.mjs records that limitation and does not paper over
 * it. Nothing in this file may be read as a claim of approval.
 *
 * THE TIME MODEL IS THE PROVIDER'S, NOT THE REGULATOR'S. PRINS2-1 prescribes 1,500 minutes across
 * nine topics and labels that 30 hours, which is the form's own 50-minute credit hour. The word
 * counts and activity minutes below are StateCourse's documented methodology for showing that the
 * authored course actually occupies that time. They are evidence offered in support of the hours
 * claim; they are not a figure any Texas rule states, and they are labelled as such.
 */

import { FORM, TOPICS, ALL_UNITS } from "./principles-ii-course-form.mjs";
import { ALL_SOURCES, NO_STATUTE_REQUIRED } from "./principles-ii-statute-sources.mjs";

export const COURSE = Object.freeze({
  courseId: "tx-principles-real-estate-ii-30-v1",
  title: "Principles of Real Estate II",
  hours: FORM.courseHours,
  totalMinutes: FORM.totalMinutes,
  approvalForm: FORM.formNumber,
  approvalFormRevision: FORM.revision,
  curriculumDir: "texas/tx-principles-real-estate-ii-30-v1/curriculum",
  contentFreeze: "PRINS2-CONTENT-FREEZE-2026-08-29",
  enrollmentEnabled: false,
  paymentEnabled: false,
  creditReportingEnabled: false,
  certificateIssuanceEnabled: false,
  finalExaminationExists: true,
  finalExaminationAdministrable: false,
  finalExaminationStatus: "BUILT_NOT_ADMINISTRABLE_PENDING_TAC_RULES",
  trecApprovalStatus: "NOT_SUBMITTED_NOT_APPROVED",
});

/** One module per PRINS2-1 topic, in the form's own topic order. */
export const MODULES = Object.freeze(
  TOPICS.map((topic, index) =>
    Object.freeze({
      module: `module-0${index + 1}`,
      file: `module-0${index + 1}.md`,
      topicCode: topic.code,
      topic: topic.topic,
      scopeNote: topic.scopeNote,
      prescribedMinutes: topic.subtotalMinutes,
      units: topic.units.length,
    }),
  ),
);

/**
 * INSTRUCTIONAL-TIME EVIDENCE, measured against the frozen curriculum.
 *
 * Word counts are of the frozen module files at PRINS2-CONTENT-FREEZE-2026-08-29 and are
 * regenerated, not transcribed — scripts/report-prins2-time-evidence.mjs recomputes them and the
 * test suite asserts they still match, so an edit to the curriculum that would undercut the hours
 * claim shows up as a failing test rather than a stale number in a config file.
 */
export const TIME_MODEL = Object.freeze({
  label: "PROVIDER_METHODOLOGY",
  note: "StateCourse LLC's documented instructional-time model for mastery study of statute-based course text. Not a regulator figure. The mastery rate is the effective pace of a student reading dense legal instructional text once at a typical long-form pace and then re-reading, taking notes and cross-referencing the quoted statutes as the exercises require. Identical to the model used for Principles of Real Estate I, so the two courses' hour claims rest on the same stated basis.",
  firstPassWordsPerMinute: 140,
  masteryStudyWordsPerMinute: 60,
  activityMinutes: Object.freeze({
    statuteReadingExercise: 12,
    appliedExercise: 10,
    quizItem: 2,
    scenario: 20,
    moduleRecap: 5,
  }),
  /* Measured at the freeze. Asserted by tests/texas-principles-ii.test.mjs against the live files. */
  frozenMeasurements: Object.freeze({
    totalWords: 131152,
    statuteReadingExercises: 16,
    appliedExercises: 28,
    moduleRecaps: 9,
    topicQuizPrimaries: 44,
    topicQuizReplacements: 44,
  }),
});

/** Minutes the authored course occupies under the model above, for the credit-hour evidence. */
export function instructionalMinutes(measurements = TIME_MODEL.frozenMeasurements) {
  const a = TIME_MODEL.activityMinutes;
  const reading = measurements.totalWords / TIME_MODEL.masteryStudyWordsPerMinute;
  const activities =
    measurements.statuteReadingExercises * a.statuteReadingExercise +
    measurements.appliedExercises * a.appliedExercise +
    measurements.moduleRecaps * a.moduleRecap +
    measurements.topicQuizPrimaries * a.quizItem;
  return Object.freeze({
    readingMinutes: Math.round(reading),
    activityMinutes: activities,
    totalMinutes: Math.round(reading + activities),
    prescribedMinutes: FORM.totalMinutes,
    meetsPrescribed: Math.round(reading + activities) >= FORM.totalMinutes,
  });
}

/* ── unit trace: PRINS2-1 unit → module → objectives → the sections actually read ─────────────── */
const holdsByUnit = new Map();
for (const source of ALL_SOURCES) {
  for (const unit of source.reliedOnByUnits || []) {
    if (!holdsByUnit.has(unit)) holdsByUnit.set(unit, []);
    holdsByUnit.get(unit).push(Object.freeze({
      sourceId: source.id,
      citation: source.citation,
      tier: source.tier,
      sections: Object.freeze((source.sectionsRead || []).map((s) => s.section)),
    }));
  }
}
const excusedByUnit = new Map(NO_STATUTE_REQUIRED.map((entry) => [entry.unit, entry.reason]));
const moduleByTopic = new Map(MODULES.map((m) => [m.topicCode, m]));

export const UNIT_TRACE = Object.freeze(
  ALL_UNITS.map((unit) => {
    const mod = moduleByTopic.get(unit.topicCode);
    return Object.freeze({
      code: unit.code,
      unit: unit.unit,
      topicCode: unit.topicCode,
      module: mod?.module ?? null,
      file: mod?.file ?? null,
      prescribedMinutes: unit.minutes,
      sources: Object.freeze(holdsByUnit.get(unit.code) || []),
      excusedReason: excusedByUnit.get(unit.code) ?? null,
    });
  }),
);

/* ── load-time invariants ─────────────────────────────────────────────────────────────────────
   A unit that is neither sourced nor excused is a unit nobody can defend, and this file refuses to
   load rather than export one. The approval-status fields are frozen shut the same way: this build
   has no TREC approval, and a future edit that flips one of them without the approval to match
   should break the build, not ship quietly. */
for (const trace of UNIT_TRACE) {
  if (!trace.module) throw new Error(`principles-ii-course: unit ${trace.code} has no module`);
  if (!trace.sources.length && !trace.excusedReason) {
    throw new Error(`principles-ii-course: unit ${trace.code} is neither sourced nor excused`);
  }
}
if (UNIT_TRACE.length !== 44) throw new Error(`principles-ii-course: expected 44 PRINS2-1 units, found ${UNIT_TRACE.length}`);
if (MODULES.length !== 9) throw new Error(`principles-ii-course: expected 9 topics, found ${MODULES.length}`);
if (COURSE.trecApprovalStatus !== "NOT_SUBMITTED_NOT_APPROVED") {
  throw new Error("principles-ii-course: this course has no TREC approval; the status field may not say otherwise");
}
if (COURSE.enrollmentEnabled || COURSE.paymentEnabled || COURSE.creditReportingEnabled || COURSE.certificateIssuanceEnabled) {
  throw new Error("principles-ii-course: nothing downstream of content may be enabled without TREC approval");
}
if (COURSE.finalExaminationAdministrable) {
  throw new Error("principles-ii-course: the examination is not administrable while the codified 22 TAC provider rules remain unread");
}

export default Object.freeze({ COURSE, MODULES, TIME_MODEL, UNIT_TRACE, instructionalMinutes });
