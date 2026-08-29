/**
 * TX Principles II — credit-hour time evidence, recomputed from the frozen curriculum.
 *
 * WHY THIS IS A SCRIPT AND NOT A NUMBER IN A DOCUMENT. The hours claim is the part of a course
 * application a regulator can check most easily and a provider can most easily let go stale: the
 * curriculum gets edited, the word count in the compliance package does not, and the package now
 * asserts something about a file that no longer exists in that form. This recomputes every figure
 * from the module files on disk, so the evidence and the content cannot drift apart silently.
 * config/texas/principles-ii-course.mjs carries the same numbers as `frozenMeasurements`, and the
 * test suite asserts the two agree.
 *
 * WHAT THE MODEL IS, AND IS NOT. PRINS2-1 prescribes 1,500 minutes across nine topics and calls
 * that 30 hours — the form's own 50-minute credit hour. The rates below are StateCourse's
 * documented methodology for showing the authored course actually occupies that time. They are
 * evidence offered in support of the hours claim. No Texas rule states them, and this script says
 * so in its own output rather than letting the figures look regulatory.
 *
 * Usage:  node scripts/report-prins2-time-evidence.mjs [--json]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOPICS, FORM } from "../config/texas/principles-ii-course-form.mjs";
import { TIME_MODEL, instructionalMinutes } from "../config/texas/principles-ii-course.mjs";
import { PRIMARY_COUNT, REPLACEMENT_COUNT } from "../config/texas/principles-ii-question-bank.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CURRICULUM = path.join(root, "texas/tx-principles-real-estate-ii-30-v1/curriculum");

export function measure() {
  const perModule = [];
  let totalWords = 0, statuteReadingExercises = 0, appliedExercises = 0, moduleRecaps = 0, units = 0;
  const files = fs.readdirSync(CURRICULUM).filter((f) => /^module-\d+\.md$/.test(f)).sort();
  for (const file of files) {
    const txt = fs.readFileSync(path.join(CURRICULUM, file), "utf8");
    const words = txt.split(/\s+/).filter(Boolean).length;
    const stat = (txt.match(/^### Statute reading exercise:/gm) || []).length;
    const appl = (txt.match(/^### Applied exercise:/gm) || []).length;
    const recap = (txt.match(/^### Module recap/gm) || []).length;
    const u = (txt.match(/^## Unit: /gm) || []).length;
    totalWords += words; statuteReadingExercises += stat; appliedExercises += appl; moduleRecaps += recap; units += u;
    perModule.push({ file, words, units: u, statuteReadingExercises: stat, appliedExercises: appl, moduleRecaps: recap });
  }
  return {
    perModule,
    totalWords,
    statuteReadingExercises,
    appliedExercises,
    moduleRecaps,
    units,
    topicQuizPrimaries: PRIMARY_COUNT,
    topicQuizReplacements: REPLACEMENT_COUNT,
  };
}

const m = measure();
const minutes = instructionalMinutes({
  totalWords: m.totalWords,
  statuteReadingExercises: m.statuteReadingExercises,
  appliedExercises: m.appliedExercises,
  moduleRecaps: m.moduleRecaps,
  topicQuizPrimaries: m.topicQuizPrimaries,
});

/* Does the measured curriculum still match what the course record claims? */
const claimed = TIME_MODEL.frozenMeasurements;
const drift = Object.entries(claimed)
  .filter(([k, v]) => m[k] !== undefined && m[k] !== v)
  .map(([k, v]) => `${k}: course record says ${v}, curriculum measures ${m[k]}`);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ measured: m, minutes, drift }, null, 2));
} else {
  console.log("TX Principles II — instructional-time evidence");
  console.log(`  PRINS2-1 ${FORM.formNumber} rev. ${FORM.revision}: ${TOPICS.length} topics, ${FORM.totalMinutes} prescribed minutes (${FORM.courseHours} hours at the form's own ${FORM.minutesPerCreditHour}-minute credit hour)`);
  console.log("");
  for (const row of m.perModule) {
    console.log(`  ${row.file}  words ${String(row.words).padStart(6)}  units ${row.units}  statute-ex ${row.statuteReadingExercises}  applied-ex ${row.appliedExercises}`);
  }
  console.log("");
  console.log(`  total words ................ ${m.totalWords.toLocaleString()}`);
  console.log(`  units ...................... ${m.units}`);
  console.log(`  statute reading exercises .. ${m.statuteReadingExercises}`);
  console.log(`  applied exercises .......... ${m.appliedExercises}`);
  console.log(`  topic quiz items ........... ${m.topicQuizPrimaries} primaries + ${m.topicQuizReplacements} replacements`);
  console.log("");
  console.log(`  mastery-study reading ...... ${minutes.readingMinutes} min  (at ${TIME_MODEL.masteryStudyWordsPerMinute} words/min — PROVIDER METHODOLOGY, not a regulator figure)`);
  console.log(`  exercises and quizzes ...... ${minutes.activityMinutes} min`);
  console.log(`  TOTAL ...................... ${minutes.totalMinutes} min against ${minutes.prescribedMinutes} prescribed`);
  console.log(`  meets prescribed time ...... ${minutes.meetsPrescribed ? "YES" : "NO"}`);
  if (drift.length) {
    console.log("\n  DRIFT — the course record no longer matches the curriculum:");
    for (const d of drift) console.log(`    - ${d}`);
  } else {
    console.log("\n  course record matches the curriculum exactly (no drift)");
  }
}

process.exitCode = drift.length ? 1 : 0;
