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
import { RATES, BUDGET } from "../config/texas/law-of-agency-time-budget.mjs";

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
const plannedScenarios = BUDGET.reduce((s, b) => s + b.scenarios, 0);

const readingMinutes = Math.round(proseWords / RATES.firstPassWordsPerMinute);

const REQUIRED = [
  { segment: "required instructional prose", basis: `${proseWords.toLocaleString()} words at ${RATES.firstPassWordsPerMinute} wpm`, minutes: readingMinutes, measured: true },
  { segment: "required document review (statute reading exercises)", basis: `${statuteReadingExercises} exercises x ${a.statuteReadingExercise} min`, minutes: statuteReadingExercises * a.statuteReadingExercise, measured: true },
  { segment: "worked examples (applied exercises)", basis: `${appliedExercises} exercises x ${a.appliedExercise} min`, minutes: appliedExercises * a.appliedExercise, measured: true },
  { segment: "module recaps", basis: `${moduleRecaps} recaps x ${a.moduleRecap} min`, minutes: moduleRecaps * a.moduleRecap, measured: true },
  { segment: "required primary topic quizzes", basis: `${plannedQuizItems} primary items x ${a.quizItem} min`, minutes: plannedQuizItems * a.quizItem, measured: false },
  { segment: "required scenario exercises", basis: `${plannedScenarios} scenarios x ${a.scenario} min`, minutes: plannedScenarios * a.scenario, measured: false },
];
const requiredMinutes = REQUIRED.reduce((s, r) => s + r.minutes, 0);

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

const variance = requiredMinutes - FORM.totalMinutes;
const byTopic = modules.map((m) => {
  const b = BUDGET.find((x) => x.topicCode === m.topicCode);
  const reading = Math.round(m.proseWords / RATES.firstPassWordsPerMinute);
  const activity = m.statuteReadingExercise * a.statuteReadingExercise + m.appliedExercise * a.appliedExercise
    + m.moduleRecap * a.moduleRecap + b.quizItems * a.quizItem + b.scenarios * a.scenario;
  return { ...m, readingMinutes: reading, activityMinutes: activity, requiredMinutes: reading + activity,
    varianceMinutes: reading + activity - m.prescribedMinutes };
});

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
  varianceMinutes: variance,
  meetsPrescribed: requiredMinutes >= FORM.totalMinutes,
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
  console.log(`\n  rate basis: ${report.rateBasis.status}`);
  console.log(`  ${report.rateBasis.statement}`);
  console.log(`\n  written: ${path.relative(root, OUT)}`);
}
