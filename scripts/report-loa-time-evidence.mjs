/**
 * TX Law of Agency — required-time evidence, measured in DISJOINT segments from the actual course.
 *
 * WHAT WENT WRONG BEFORE, AND WHY THIS SCRIPT EXISTS. The first figure offered for this course was
 * "about 900 reading minutes plus 909 planned activity minutes, about 1,809 total". Both halves were
 * wrong in kind. The reading half divided the WHOLE prose corpus by a rate, and the activity half
 * came from the PLAN in law-of-agency-time-budget.mjs rather than from what the modules actually
 * contain. Adding a planned allowance to a measured corpus mixes two different things and, worse,
 * pays twice for any exercise or recap text that sits inside the corpus. Principles II made exactly
 * this mistake and double-counted 14,956 words. This script segments the corpus so that every word
 * is counted in exactly one place, and asserts that the segments sum to the whole.
 *
 * REQUIRED IS NOT THE SAME AS AVAILABLE. A replacement question is served only after a wrong answer,
 * so counting one for every student overstates what the course requires of anyone. Conditional
 * remediation is reported separately and is NOT part of the required total. Optional video is not
 * counted at all. Mastery review — re-reading at a slower pace — is reported as an upper bound on
 * what a diligent student may spend, never as required time.
 *
 * THE READING RATE IS A PROVIDER ASSUMPTION, NOT A TIME STUDY. 140 words per minute is StateCourse's
 * internal planning figure for dense statutory instructional prose, used identically in Principles I
 * and II. No Texas rule states a words-per-minute figure, and no time study has been performed. That
 * is stated in the output rather than left for a reader to discover, together with the evidence
 * method intended for a TREC submission.
 *
 * Usage:  node scripts/report-loa-time-evidence.mjs [--json]
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { TOPICS, FORM } from "../config/texas/law-of-agency-course-form.mjs";
import { RATES, BUDGET, COURSE_LEVEL } from "../config/texas/law-of-agency-time-budget.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(root, "texas/tx-law-of-agency-30-v1/curriculum");
const OUT = path.join(root, "texas/tx-law-of-agency-30-v1/time-evidence.json");

const words = (s) => (s.match(/\S+/g) || []).length;
const a = RATES.activityMinutes;

/* ── segment every module, disjointly ─────────────────────────────────────────────────────────
   Three kinds of block: statute reading exercises, applied exercises, and the module recap. Each
   runs from its own heading to the next heading of ANY level (the recap runs to end of file).
   Everything left is instructional prose. The segments are asserted to sum to the whole file. */
const modules = [];
for (const [index, topic] of TOPICS.entries()) {
  const n = String(index + 1).padStart(2, "0");
  const file = `module-${n}.md`;
  const full = path.join(DIR, file);
  if (!fs.existsSync(full)) throw new Error(`time evidence: ${file} is missing; the corpus is incomplete`);
  const md = fs.readFileSync(full, "utf8");
  const headings = [...md.matchAll(/^#{2,3} .+$/gm)].map((m) => m.index);
  const recapAt = md.search(/^### Module recap\s*$/m);

  const blocks = [];
  /* An exercise heading INSIDE the optional reference section is optional practice, and must not be
     charged to every student. Without this filter the script billed all students for optional work
     — module 11 reported +10 minutes of variance for an exercise its author had already moved to
     the optional section — which forced two authors to label optional exercises as bold text rather
     than headings just to get an honest number. The structural checker already had this filter; the
     time script did not, and the convention should not depend on which script is looking. */
  const optionalStart = md.search(/^## Optional reference: /m);
  const inOptional = (i) => optionalStart >= 0 && i > optionalStart;
  const take = (re, kind) => {
    for (const m of md.matchAll(re)) {
      if (kind !== "optionalReference" && inOptional(m.index)) continue;
      /* The optional reference section runs to END OF FILE, not to the next heading. My previous
         attempt at this ended it at the next heading while also skipping exercise headings inside
         it — so an optional exercise given a proper "###" heading fell into NEITHER block and its
         body was counted as required prose, which is the opposite of what moving it there means.
         Two authors caught this and encoded their optional exercises as bold text instead, which
         was the only honest encoding available to them. It is now handled properly and a normal
         heading works. */
      const end = kind === "optionalReference" ? md.length : (headings.find((i) => i > m.index) ?? md.length);
      blocks.push({ kind, start: m.index, end });
    }
  };
  /* OPTIONAL REFERENCE. Depth that is real law but beyond what the topic's units require is moved
     to an "## Optional reference:" section rather than deleted. It stays in the course, stays
     sourced, and is not counted toward required time, because no student must read it to complete
     the topic. Its words are excluded from the reading segment exactly as an exercise block is. */
  take(/^## Optional reference: .+$/gm, "optionalReference");
  take(/^### Statute reading exercise: .+$/gm, "statuteReadingExercise");
  take(/^### Applied exercise: .+$/gm, "appliedExercise");
  /* The recap runs to the next heading, not to end of file. It used to run to end of file, which was
     harmless until a module adopted the optional-reference mechanism: the structural checker requires
     that section to sit AFTER the recap, so the optional block nested inside the recap block, its
     words were counted twice, and the disjointness invariant threw for the whole corpus the moment
     module 09 used it. The invariant did its job — it refused to report a plausible number — but the
     bug was mine. */
  if (recapAt >= 0) {
    blocks.push({ kind: "moduleRecap", start: recapAt, end: headings.find((i) => i > recapAt) ?? md.length });
  }

  const counts = { statuteReadingExercise: 0, appliedExercise: 0, moduleRecap: 0, optionalReference: 0 };
  const wordsBy = { statuteReadingExercise: 0, appliedExercise: 0, moduleRecap: 0, optionalReference: 0 };
  for (const b of blocks) { counts[b.kind] += 1; wordsBy[b.kind] += words(md.slice(b.start, b.end)); }

  let prose = md;
  for (const b of [...blocks].sort((x, y) => y.start - x.start)) prose = prose.slice(0, b.start) + prose.slice(b.end);
  const proseWords = words(prose);

  /* THE INVARIANT THAT MAKES THIS EVIDENCE RATHER THAN ARITHMETIC. If the segments do not account
     for every word exactly once, the whole model is unsound and the script must fail rather than
     report a plausible number. */
  const total = words(md);
  const summed = proseWords + wordsBy.statuteReadingExercise + wordsBy.appliedExercise
    + wordsBy.moduleRecap + wordsBy.optionalReference;
  if (summed !== total) {
    throw new Error(`time evidence: ${file} segments sum to ${summed} words but the file has ${total} — segments are not disjoint`);
  }

  modules.push({
    file, topicCode: topic.code, topic: topic.topic, units: topic.units.length,
    prescribedMinutes: topic.subtotalMinutes,
    sha256: crypto.createHash("sha256").update(md).digest("hex"),
    totalWords: total, proseWords, ...counts,
    exerciseWords: wordsBy.statuteReadingExercise + wordsBy.appliedExercise,
    recapWords: wordsBy.moduleRecap,
    optionalReferenceWords: wordsBy.optionalReference,
  });
}

const sum = (k) => modules.reduce((s, m) => s + m[k], 0);
const proseWords = sum("proseWords");
const statuteReadingExercises = sum("statuteReadingExercise");
const appliedExercises = sum("appliedExercise");
const moduleRecaps = sum("moduleRecap");

/* Assessment components are PLANNED, not built. Saying so is the difference between evidence and a
   forecast dressed as evidence. */
const plannedQuizItems = BUDGET.reduce((s, b) => s + b.quizItems, 0);
const plannedTopicScenarios = BUDGET.reduce((s, b) => s + b.scenarios, 0);
const plannedScenarios = plannedTopicScenarios + COURSE_LEVEL.capstoneScenarios;
const plannedMisconceptionChecks = BUDGET.reduce((s, b) => s + b.misconceptionChecks, 0);

/* EXACT SECONDS, NOT ROUNDED MINUTES. The first version of this report rounded reading time once
   per topic and again over the whole corpus, so the topic table summed to +8 while the course total
   said +10 — the sum of the rounds is not the round of the sum. Two numbers that disagree are two
   numbers a reviewer cannot both believe, so every figure below is computed in seconds and rounded
   only for display, and the course total is the SUM OF THE TOPIC ROWS by construction rather than a
   second independent calculation. */
const SEC = (minutes) => minutes * 60;
const readingSeconds = (words) => (words / RATES.firstPassWordsPerMinute) * 60;
const mm = (seconds) => Number((seconds / 60).toFixed(1));

const REQUIRED = [
  { segment: "required instructional prose", basis: `${proseWords.toLocaleString()} words at ${RATES.firstPassWordsPerMinute} wpm`, seconds: readingSeconds(proseWords), measured: true },
  { segment: "required document review (statute reading exercises)", basis: `${statuteReadingExercises} exercises x ${a.statuteReadingExercise} min`, seconds: SEC(statuteReadingExercises * a.statuteReadingExercise), measured: true },
  { segment: "worked examples (applied exercises)", basis: `${appliedExercises} exercises x ${a.appliedExercise} min`, seconds: SEC(appliedExercises * a.appliedExercise), measured: true },
  { segment: "module recaps", basis: `${moduleRecaps} recaps x ${a.moduleRecap} min`, seconds: SEC(moduleRecaps * a.moduleRecap), measured: true },
  { segment: "required primary topic quizzes", basis: `${plannedQuizItems} primary items x ${a.quizItem} min`, seconds: SEC(plannedQuizItems * a.quizItem), measured: false },
  { segment: "required misconception checks", basis: `${plannedMisconceptionChecks} checks x ${a.misconceptionCheck} min`, seconds: SEC(plannedMisconceptionChecks * a.misconceptionCheck), measured: false },
  { segment: "required topic scenario exercises", basis: `${plannedTopicScenarios} scenarios x ${a.scenario} min`, seconds: SEC(plannedTopicScenarios * a.scenario), measured: false },
  { segment: "required capstone scenario (course level, not attributed to a topic)", basis: `${COURSE_LEVEL.capstoneScenarios} scenario x ${a.scenario} min`, seconds: SEC(COURSE_LEVEL.minutes), measured: false },
].map((r) => ({ ...r, minutes: mm(r.seconds) }));
const requiredSegmentSeconds = REQUIRED.reduce((s2, r) => s2 + r.seconds, 0);

const CONDITIONAL = [
  { segment: "replacement questions after an incorrect answer", basis: `up to ${plannedQuizItems} replacements x ${a.quizItem} min, served only on a wrong answer`, minutes: plannedQuizItems * a.quizItem },
  { segment: "topic remediation before a re-attempt", basis: "re-reading the unit a missed item maps to; varies by student", minutes: null },
];
const EXCLUDED = [
  { segment: "optional video instruction", basis: "every video is optional and non-blocking; equivalent written instruction exists in the module", minutes: 0, reason: "not counted toward the required 1,500 minutes" },
  { segment: "optional reference material", basis: `${sum("optionalReferenceWords").toLocaleString()} words moved out of required prose, at ${RATES.firstPassWordsPerMinute} wpm`, minutes: Math.round(sum("optionalReferenceWords") / RATES.firstPassWordsPerMinute), reason: "sourced depth beyond what the topic's units require; in the course, not required to complete it" },
  { segment: "mastery review", basis: `${proseWords.toLocaleString()} words at ${RATES.masteryStudyWordsPerMinute} wpm`, minutes: Math.round(proseWords / RATES.masteryStudyWordsPerMinute), reason: "an upper bound on diligent study, never required time" },
  { segment: "final examination", minutes: null, reason: "EXCLUDED from the 1,500-minute course evidence. LOA-1 prescribes 1,500 minutes of INSTRUCTION across its twelve topics, and its topic subtotals sum to exactly that with no line for examination. The examination is a separate administered event under the provider rules, is not administrable at all while StateCourse holds no TREC approval, and counting it toward instructional time would inflate the instructional claim with assessment time the form does not allocate." },
];

const byTopic = modules.map((m) => {
  const b = BUDGET.find((x) => x.topicCode === m.topicCode);
  const readSec = readingSeconds(m.proseWords);
  const actSec = SEC(m.statuteReadingExercise * a.statuteReadingExercise + m.appliedExercise * a.appliedExercise
    + m.moduleRecap * a.moduleRecap + b.quizItems * a.quizItem + b.scenarios * a.scenario
    + b.misconceptionChecks * a.misconceptionCheck);
  const reqSec = readSec + actSec;
  return { ...m, quizItems: b.quizItems, scenarios: b.scenarios,
    readingSeconds: readSec, activitySeconds: actSec, requiredSeconds: reqSec,
    readingMinutes: mm(readSec), activityMinutes: mm(actSec), requiredMinutes: mm(reqSec),
    varianceMinutes: mm(reqSec - SEC(m.prescribedMinutes)),
    meetsAllocation: reqSec >= SEC(m.prescribedMinutes) };
});

/* The course total IS the sum of the topic rows. Nothing here recomputes it independently. */
/* THREE LAYERS, REPORTED SEPARATELY AND NEVER CONFLATED.
   An earlier version of this report printed "segment total 1530.8 = topic-row total 1530.8". The
   arithmetic behind it was right — the variable it called the topic-row total already included the
   capstone — but the SENTENCE was false: the topic rows sum to about 1,510.8 and the remaining 20
   minutes are course-level. A label that misdescribes what a number counts is as much a defect as a
   wrong number, and it is the more dangerous of the two because the figure looks checkable.

     LAYER 1  official LOA-1 topic time, T01-T12, each topic at or above its own allocation
     LAYER 2  course-level required time, outside the topic table, attributed to no topic
     LAYER 3  grand required time = layer 1 + layer 2, which the segment table must equal */
const topicSecondsTotal = byTopic.reduce((s2, t) => s2 + t.requiredSeconds, 0);
const prescribedTopicSeconds = byTopic.reduce((s2, t) => s2 + SEC(t.prescribedMinutes), 0);
const courseLevelSeconds = SEC(COURSE_LEVEL.minutes);
const grandRequiredSeconds = topicSecondsTotal + courseLevelSeconds;
const requiredSecondsTotal = grandRequiredSeconds;
const topicsBelowAllocation = byTopic.filter((t) => !t.meetsAllocation);

/* One authoritative total, in seconds, equal to the sum of the topic rows. */
const requiredMinutes = mm(requiredSecondsTotal);
const variance = mm(requiredSecondsTotal - SEC(FORM.totalMinutes));
/* Four assertions, each checking one thing, in exact seconds. */
const near = (x, y) => Math.abs(x - y) <= 1;
if (!near(byTopic.reduce((s2, t) => s2 + t.requiredSeconds, 0), topicSecondsTotal)) {
  throw new Error("time evidence: the topic rows do not sum to the topic total");
}
if (!near(topicSecondsTotal + courseLevelSeconds, grandRequiredSeconds)) {
  throw new Error("time evidence: topic total plus course-level total does not equal the grand total");
}
if (!near(requiredSegmentSeconds, grandRequiredSeconds)) {
  throw new Error(`time evidence: segment total ${mm(requiredSegmentSeconds)} min does not equal the GRAND total ${mm(grandRequiredSeconds)} min`);
}
if (topicsBelowAllocation.length) {
  console.error(`time evidence: ${topicsBelowAllocation.length} topic(s) below their own LOA-1 allocation — ${topicsBelowAllocation.map((t) => t.topicCode).join(", ")}`);
}
if (grandRequiredSeconds < SEC(FORM.totalMinutes)) {
  throw new Error(`time evidence: grand required ${mm(grandRequiredSeconds)} min is below the prescribed ${FORM.totalMinutes}`);
}

const report = {
  generatedBy: "scripts/report-loa-time-evidence.mjs",
  generatedFor: "Texas Law of Agency",
  prescribedMinutes: FORM.totalMinutes,
  approvalForm: `${FORM.formNumber} rev ${FORM.revision}`,
  rateBasis: {
    firstPassWordsPerMinute: RATES.firstPassWordsPerMinute,
    status: "PROVIDER_PLANNING_ASSUMPTION_NOT_A_TIME_STUDY",
    statement: "140 words per minute is StateCourse's internal planning figure for dense statutory instructional prose, applied identically in Principles of Real Estate I and II. It is not derived from a time study, and no Texas rule states a words-per-minute figure.",
    evidenceMethodIntendedForSubmission: "Before any TREC submission relies on this figure, StateCourse intends to replace it with observed data: instrumented reading time per screen from the delivery engine across a pilot cohort, reported as a median and an interquartile range per module, with the corpus and the engine build identified. Until that exists, every minute figure derived from the rate is labelled a provider estimate.",
  },
  disjointness: "Every word of every module is counted in exactly one segment. Exercise and recap prose is excluded from the reading segment and paid for by its activity allowance instead; the script throws if the segments do not sum to the whole file.",
  measuredComponents: { modules: modules.length, proseWords, statuteReadingExercises, appliedExercises, moduleRecaps,
    exerciseWords: sum("exerciseWords"), recapWords: sum("recapWords"), totalWords: sum("totalWords") },
  plannedNotBuilt: { quizItems: plannedQuizItems, scenarios: plannedScenarios,
    note: "Quizzes and scenarios are budgeted but not yet authored. Their minutes are a plan, not a measurement, and are marked measured:false." },
  required: REQUIRED,
  requiredMinutes,
  layers: {
    topicInstruction: { seconds: Math.round(topicSecondsTotal), minutes: mm(topicSecondsTotal),
      prescribedSeconds: prescribedTopicSeconds, prescribedMinutes: mm(prescribedTopicSeconds),
      varianceMinutes: mm(topicSecondsTotal - prescribedTopicSeconds),
      note: "Official LOA-1 topic time, T01-T12. Each topic allocation is a topic-specific minimum; no topic's surplus may cure another's shortfall." },
    courseLevelCapstone: { seconds: Math.round(courseLevelSeconds), minutes: mm(courseLevelSeconds),
      note: "Required, but attributed to no topic. Not used to satisfy any topic's allocation." },
    grandRequired: { seconds: Math.round(grandRequiredSeconds), minutes: mm(grandRequiredSeconds),
      note: "Layer 1 plus layer 2. The segment table equals this figure, not the topic total." },
  },
  topicsBelowAllocation: topicsBelowAllocation.map((t) => ({ topicCode: t.topicCode, prescribedMinutes: t.prescribedMinutes, requiredMinutes: t.requiredMinutes, shortfallMinutes: mm(SEC(t.prescribedMinutes) - t.requiredSeconds) })),
  varianceMinutes: variance,
  meetsPrescribed: requiredSecondsTotal >= SEC(FORM.totalMinutes),
  everyTopicMeetsItsAllocation: topicsBelowAllocation.length === 0,
  conditional: CONDITIONAL,
  excluded: EXCLUDED,
  byTopic,
};
fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);

if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
else {
  const p = (v, n) => String(v).padStart(n);
  console.log("TX Law of Agency — required time, measured in disjoint segments\n");
  console.log("REQUIRED OF EVERY STUDENT");
  for (const r of REQUIRED) console.log(`  ${p(r.minutes, 5)} min  ${r.segment}${r.measured ? "" : "  [PLANNED, NOT BUILT]"}\n              ${r.basis}`);
  console.log(`  ${p(requiredMinutes, 5)} min  TOTAL REQUIRED`);
  console.log(`  ${p(FORM.totalMinutes, 5)} min  prescribed by ${report.approvalForm}`);
  console.log(`  ${p(variance >= 0 ? "+" + variance : variance, 5)} min  variance\n`);
  console.log("CONDITIONAL — served only on an incorrect answer, not part of the required total");
  for (const c of CONDITIONAL) console.log(`  ${p(c.minutes ?? "—", 5)} min  ${c.segment}\n              ${c.basis}`);
  console.log("\nEXCLUDED from the required total");
  for (const e of EXCLUDED) console.log(`  ${p(e.minutes ?? "—", 5)} min  ${e.segment}\n              ${e.reason}`);
  console.log("\nBY TOPIC");
  console.log("  topic  prescribed  reading  activity  required  variance");
  for (const t of byTopic) console.log(`  ${t.topicCode}   ${p(t.prescribedMinutes, 8)}  ${p(t.readingMinutes, 7)}  ${p(t.activityMinutes, 8)}  ${p(t.requiredMinutes, 8)}  ${p(t.varianceMinutes >= 0 ? "+" + t.varianceMinutes : t.varianceMinutes, 8)}`);
  console.log("\n— THE THREE LAYERS, IN EXACT SECONDS —");
  console.log(`  LAYER 1  official LOA-1 topic time, T01-T12   ${Math.round(topicSecondsTotal).toLocaleString()} s = ${mm(topicSecondsTotal)} min   against ${mm(prescribedTopicSeconds)} prescribed   (${mm(topicSecondsTotal - prescribedTopicSeconds) >= 0 ? "+" : ""}${mm(topicSecondsTotal - prescribedTopicSeconds)})`);
  console.log(`  LAYER 2  course-level capstone, no topic      ${Math.round(courseLevelSeconds).toLocaleString()} s = ${mm(courseLevelSeconds)} min`);
  console.log(`  LAYER 3  grand required = layer 1 + layer 2   ${Math.round(grandRequiredSeconds).toLocaleString()} s = ${mm(grandRequiredSeconds)} min   against ${FORM.totalMinutes} prescribed   (${mm(grandRequiredSeconds - SEC(FORM.totalMinutes)) >= 0 ? "+" : ""}${mm(grandRequiredSeconds - SEC(FORM.totalMinutes))})`);
  console.log(`           segment table totals ${mm(requiredSegmentSeconds)} min, which equals LAYER 3 and NOT the topic total`);
  if (topicsBelowAllocation.length) {
    console.log(`\n  TOPICS BELOW THEIR LOA-1 ALLOCATION (each allocation is a topic-specific minimum):`);
    for (const t of topicsBelowAllocation) console.log(`    ${t.topicCode}  ${t.requiredMinutes} min against ${t.prescribedMinutes} prescribed — short ${mm(SEC(t.prescribedMinutes) - t.requiredSeconds)} min`);
  } else {
    console.log("\n  every topic meets or exceeds its own LOA-1 allocation");
  }
  console.log(`\n  rate basis: ${report.rateBasis.status}`);
  console.log(`  ${report.rateBasis.statement}`);
  console.log(`\n  written: ${path.relative(root, OUT)}`);
}
