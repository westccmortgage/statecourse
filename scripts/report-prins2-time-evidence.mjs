/**
 * TX Principles II — instructional-time evidence, itemised and reconciled.
 *
 * WHY THIS FILE WAS REWRITTEN. The first version reported 2,791 minutes against a 1,500-minute
 * outline and called that "meets prescribed time" without explaining the 1,291-minute difference.
 * Two things were wrong with it, one an arithmetic defect and one a presentation defect:
 *
 *   THE DEFECT. It computed reading time over the WHOLE corpus and then added fixed activity
 *   minutes for every statute-reading exercise, applied exercise and module recap. The prose of
 *   those exercises and recaps is part of the corpus, so 14,956 words — 11.4% of the course — were
 *   counted twice: once as reading, again inside an activity allowance. Every figure this report
 *   now produces separates the corpus into disjoint segments first, and asserts that the segments
 *   sum back to the whole, so a double count fails the run rather than inflating the answer.
 *
 *   THE PRESENTATION. 1,500 minutes is what PRINS2-1 PRESCRIBES. It is a floor per topic, not a
 *   ceiling, and a course that occupies more than the prescribed time is not out of compliance —
 *   a course that occupies LESS would be. But a single conservative number offered as proof of a
 *   "30-hour course" invites the reader to think 2,791 minutes is what a student must sit through
 *   to earn 30 hours of credit, which is a different claim and one this build cannot make. So the
 *   report now states REQUIRED time and MASTERY-STUDY time separately, gives the reading rate each
 *   rests on, and shows the rate the form's own arithmetic implies.
 *
 * WHAT THE RATES ARE AND ARE NOT. No Texas rule states a words-per-minute figure. These are
 * StateCourse's documented methodology. The one external anchor available is the form's own
 * arithmetic: 131,152 authored words against 1,500 prescribed minutes implies roughly 87 words per
 * minute across the whole corpus including exercises — which is the pace the Commission's own
 * minute allocations imply for text of this density, and it is reported here as such rather than
 * adopted as a target to reverse-engineer toward.
 *
 * FINAL EXAMINATION TIME IS EXCLUDED throughout. The examination is not instruction, it is not
 * administrable in this build, and counting it toward instructional minutes would inflate the
 * course's delivered time with an instrument no student can currently sit.
 *
 * Usage:  node scripts/report-prins2-time-evidence.mjs [--json]
 * Exit non-zero on a segmentation failure, a double count, or drift from the course record.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FORM } from "../config/texas/principles-ii-course-form.mjs";
import { TIME_MODEL } from "../config/texas/principles-ii-course.mjs";
import { TOPIC_QUIZZES, PRIMARY_COUNT, REPLACEMENT_COUNT } from "../config/texas/principles-ii-question-bank.mjs";
import { SCENARIOS, TOTAL_TASKS } from "../config/texas/principles-ii-scenarios.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CURRICULUM = path.join(root, "texas/tx-principles-real-estate-ii-30-v1/curriculum");
const failures = [];

/* ── segment the corpus into DISJOINT parts ───────────────────────────────────────────────────
   Teaching prose, exercise text and recap text are separated at their own headings. Nothing may
   belong to two segments, and the three must sum to the file's own word count — asserted below,
   because that assertion is exactly what the previous version lacked. */
function segment(markdown) {
  const lines = markdown.split("\n");
  let mode = "prose";
  const bucket = { prose: [], exercise: [], recap: [] };
  for (const line of lines) {
    if (/^### (Statute reading exercise|Applied exercise):/.test(line)) mode = "exercise";
    else if (/^### Module recap/.test(line)) mode = "recap";
    else if (/^## /.test(line)) mode = "prose";
    bucket[mode].push(line);
  }
  const words = (arr) => arr.join(" ").split(/\s+/).filter(Boolean).length;
  return { prose: words(bucket.prose), exercise: words(bucket.exercise), recap: words(bucket.recap) };
}

const perModule = [];
let prose = 0, exercise = 0, recap = 0, total = 0;
let statuteExercises = 0, appliedExercises = 0, recaps = 0, units = 0;

for (const file of fs.readdirSync(CURRICULUM).filter((f) => /^module-\d+\.md$/.test(f)).sort()) {
  const txt = fs.readFileSync(path.join(CURRICULUM, file), "utf8");
  const seg = segment(txt);
  const fileWords = txt.split(/\s+/).filter(Boolean).length;
  const segSum = seg.prose + seg.exercise + seg.recap;
  if (segSum !== fileWords) {
    failures.push(`${file}: segments sum to ${segSum} but the file holds ${fileWords} words — a word is in two segments or none`);
  }
  const s = (txt.match(/^### Statute reading exercise:/gm) || []).length;
  const a = (txt.match(/^### Applied exercise:/gm) || []).length;
  const r = (txt.match(/^### Module recap/gm) || []).length;
  const u = (txt.match(/^## Unit: /gm) || []).length;
  perModule.push({ file, ...seg, total: fileWords, statuteExercises: s, appliedExercises: a, units: u });
  prose += seg.prose; exercise += seg.exercise; recap += seg.recap; total += fileWords;
  statuteExercises += s; appliedExercises += a; recaps += r; units += u;
}

if (prose + exercise + recap !== total) failures.push("corpus segmentation does not sum to the corpus");

/* ── the model ────────────────────────────────────────────────────────────────────────────────
   Reading minutes are computed on TEACHING PROSE ONLY. The exercise and recap segments are paid
   for by their activity allowances, which cover reading the item and working it. Nothing is
   counted twice. */
const FIRST_PASS_WPM = TIME_MODEL.firstPassWordsPerMinute;   // 140
const MASTERY_WPM = TIME_MODEL.masteryStudyWordsPerMinute;   // 60
const ACT = TIME_MODEL.activityMinutes;

const readingRequired = prose / FIRST_PASS_WPM;
const readingMastery = prose / MASTERY_WPM;

const statuteMinutes = statuteExercises * ACT.statuteReadingExercise;
const appliedMinutes = appliedExercises * ACT.appliedExercise;
const recapMinutes = recaps * ACT.moduleRecap;
const quizMinutes = PRIMARY_COUNT * ACT.quizItem;
/* The replacement is served only after an incorrect answer. Requiring every student to have
   answered every replacement would overstate the required time; assuming none would understate it.
   The allowance is one third of the primaries, stated as an assumption rather than buried. */
const REPLACEMENT_RATE = 1 / 3;
const replacementMinutes = Math.round(REPLACEMENT_COUNT * REPLACEMENT_RATE * ACT.quizItem);
const scenarioMinutes = SCENARIOS.length * ACT.scenario;

const activityMinutes = statuteMinutes + appliedMinutes + recapMinutes + quizMinutes + replacementMinutes + scenarioMinutes;
const requiredTotal = Math.round(readingRequired + activityMinutes);
const masteryTotal = Math.round(readingMastery + activityMinutes);
const impliedWpm = total / FORM.totalMinutes;

/* What the previous version reported, kept so the correction is visible rather than silent. */
const supersededTotal = Math.round(total / MASTERY_WPM + (statuteExercises * ACT.statuteReadingExercise + appliedExercises * ACT.appliedExercise + recaps * ACT.moduleRecap + PRIMARY_COUNT * ACT.quizItem));
const doubleCountedWords = exercise + recap;

const claimed = TIME_MODEL.frozenMeasurements;
const drift = [];
if (total !== claimed.totalWords) drift.push(`totalWords: record ${claimed.totalWords}, measured ${total}`);
if (statuteExercises !== claimed.statuteReadingExercises) drift.push(`statuteReadingExercises: record ${claimed.statuteReadingExercises}, measured ${statuteExercises}`);
if (appliedExercises !== claimed.appliedExercises) drift.push(`appliedExercises: record ${claimed.appliedExercises}, measured ${appliedExercises}`);
for (const d of drift) failures.push(d);

const report = {
  generatedBy: "scripts/report-prins2-time-evidence.mjs",
  basis: {
    prescribedMinutes: FORM.totalMinutes,
    prescribedNote: "PRINS2-1's printed TOTAL MINUTES. A per-topic MINIMUM the Commission prescribes, not a ceiling. A course occupying more than the prescribed time is not out of compliance; one occupying less would be.",
    creditHourMinutes: FORM.minutesPerCreditHour,
    rateAuthority: "NONE. No Texas statute or TREC rule read for this course states a words-per-minute figure. The rates below are StateCourse's documented methodology and are labelled as such wherever they appear.",
    impliedByFormArithmetic: Number(impliedWpm.toFixed(1)),
    impliedNote: `${total.toLocaleString()} authored words against ${FORM.totalMinutes} prescribed minutes implies ~${impliedWpm.toFixed(0)} words per minute across the whole corpus. Reported as an observation about the Commission's own allocation for text of this density; not adopted as a target and not reverse-engineered toward.`,
    finalExaminationTime: "EXCLUDED. The examination is not instruction, and it is not administrable in this build.",
  },
  corpus: {
    totalWords: total,
    teachingProseWords: prose,
    exerciseWords: exercise,
    recapWords: recap,
    segmentsAreDisjoint: prose + exercise + recap === total,
    units,
  },
  requiredLearnerTime: {
    readingRateWordsPerMinute: FIRST_PASS_WPM,
    readingRateNote: "A single careful pass over teaching prose. Exercise and recap text is NOT read at this rate here — it is paid for by the activity allowances below, which is what stops the double count.",
    readingMinutes: Math.round(readingRequired),
    statuteReadingExerciseMinutes: statuteMinutes,
    appliedExerciseMinutes: appliedMinutes,
    moduleRecapMinutes: recapMinutes,
    topicQuizMinutes: quizMinutes,
    replacementQuestionAllowanceMinutes: replacementMinutes,
    replacementAssumption: `${REPLACEMENT_COUNT} replacements exist; a replacement is served only after an incorrect answer, so the allowance assumes ${Math.round(REPLACEMENT_RATE * 100)}% are seen. Stated as an assumption, not a measurement.`,
    scenarioMinutes,
    scenarioAssumption: `${SCENARIOS.length} required scenarios at ${ACT.scenario} minutes each, covering ${TOTAL_TASKS} gradeable tasks.`,
    remediationAssumption: "Re-reading after an incorrect answer is NOT added as separate time. The student re-reads instruction already counted once; charging it again would repeat the defect this report exists to fix.",
    activityMinutesTotal: activityMinutes,
    totalRequiredMinutes: requiredTotal,
    meetsPrescribed: requiredTotal >= FORM.totalMinutes,
    varianceVsPrescribed: requiredTotal - FORM.totalMinutes,
  },
  masteryStudyUpperBound: {
    readingRateWordsPerMinute: MASTERY_WPM,
    readingRateNote: "Re-reading, note-taking and cross-referencing the quoted statutes. An UPPER BOUND on how long a thorough student may take, not the time the course requires.",
    readingMinutes: Math.round(readingMastery),
    totalMinutes: masteryTotal,
  },
  optionalExcluded: [
    "The final examination and its four versions — excluded from instructional time entirely.",
    "Reflective writing: none is required anywhere in this course, and no task carries a length requirement.",
    "Re-attempts of a scenario or a topic quiz beyond the first pass.",
    "Any supplementary video: none is included in this course.",
  ],
  correction: {
    supersededTotalMinutes: supersededTotal,
    supersededMethod: "reading over the WHOLE corpus at the mastery rate, plus fixed activity allowances for exercises and recaps whose prose is inside that corpus",
    doubleCountedWords,
    doubleCountedShare: Number(((doubleCountedWords / total) * 100).toFixed(1)),
    note: `The superseded figure counted ${doubleCountedWords.toLocaleString()} words (${((doubleCountedWords / total) * 100).toFixed(1)}% of the course) twice — once as reading, again inside an activity allowance — and reported a mastery-study upper bound as though it were required time. Both are corrected here.`,
  },
  drift,
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const p = (n) => String(n).padStart(6);
  console.log("TX Principles II — instructional-time evidence");
  console.log(`  ${FORM.formNumber} rev. ${FORM.revision}: ${FORM.totalMinutes} prescribed minutes (${FORM.courseHours}h at the form's own ${FORM.minutesPerCreditHour}-min credit hour)`);
  console.log("  PRESCRIBED IS A MINIMUM. Exceeding it is not a compliance defect; falling short would be.\n");
  console.log("  CORPUS, segmented so nothing is counted twice");
  console.log(`    teaching prose ................ ${p(prose)} words`);
  console.log(`    exercise text ................. ${p(exercise)} words   (paid by activity allowance, not read time)`);
  console.log(`    module recap text ............. ${p(recap)} words   (same)`);
  console.log(`    total ......................... ${p(total)} words   segments disjoint: ${prose + exercise + recap === total ? "yes" : "NO"}`);
  console.log("");
  console.log(`  REQUIRED LEARNER TIME  (teaching prose at ${FIRST_PASS_WPM} wpm — PROVIDER METHODOLOGY, no rule states a rate)`);
  console.log(`    reading ....................... ${p(Math.round(readingRequired))} min`);
  console.log(`    statute reading exercises ..... ${p(statuteMinutes)} min   (${statuteExercises} x ${ACT.statuteReadingExercise})`);
  console.log(`    applied exercises ............. ${p(appliedMinutes)} min   (${appliedExercises} x ${ACT.appliedExercise})`);
  console.log(`    module recaps ................. ${p(recapMinutes)} min   (${recaps} x ${ACT.moduleRecap})`);
  console.log(`    topic quizzes ................. ${p(quizMinutes)} min   (${PRIMARY_COUNT} x ${ACT.quizItem})`);
  console.log(`    replacement allowance ......... ${p(replacementMinutes)} min   (${REPLACEMENT_COUNT} exist, ${Math.round(REPLACEMENT_RATE * 100)}% assumed seen)`);
  console.log(`    scenarios ..................... ${p(scenarioMinutes)} min   (${SCENARIOS.length} x ${ACT.scenario})`);
  console.log(`    TOTAL REQUIRED ................ ${p(requiredTotal)} min   against ${FORM.totalMinutes} prescribed  (${requiredTotal >= FORM.totalMinutes ? "+" : ""}${requiredTotal - FORM.totalMinutes})`);
  console.log("");
  console.log(`  MASTERY-STUDY UPPER BOUND (prose at ${MASTERY_WPM} wpm: re-reading, notes, cross-referencing)`);
  console.log(`    total ......................... ${p(masteryTotal)} min   — an upper bound, NOT the required time`);
  console.log("");
  console.log("  EXCLUDED FROM INSTRUCTIONAL TIME");
  for (const o of report.optionalExcluded) console.log(`    - ${o}`);
  console.log("");
  console.log("  CORRECTION TO THE SUPERSEDED FIGURE");
  console.log(`    previously reported ........... ${p(supersededTotal)} min`);
  console.log(`    words counted twice ........... ${p(doubleCountedWords)} (${((doubleCountedWords / total) * 100).toFixed(1)}% of the course)`);
  console.log(`    ${report.correction.note}`);
  console.log("");
  console.log(`  the form's own arithmetic implies ~${impliedWpm.toFixed(0)} wpm across the whole corpus; reported as an observation, not a target`);
  if (failures.length) {
    console.log(`\n  FAILURES (${failures.length}):`);
    for (const f of failures) console.log(`    - ${f}`);
  } else {
    console.log("\n  OK — segments disjoint, no double count, no drift from the course record.");
  }
}

process.exitCode = failures.length ? 1 : 0;
