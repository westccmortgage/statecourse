#!/usr/bin/env node
/** Prints the Principles I time study. Exit 1 if the 1,500-minute reconciliation fails. */
import { studyCourse } from "../lib/texas-principles-i-time-study.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const study = studyCourse(root);

console.log("Texas Principles of Real Estate I — time study (PROVIDER METHODOLOGY)");
console.log(`model: mastery ${study.timeModel.masteryStudyWordsPerMinute} wpm | first pass ${study.timeModel.firstPassWordsPerMinute} wpm | activities ${JSON.stringify(study.timeModel.activityMinutes)}`);
console.log("module    topic  words  study  activ  supported  prescribed  status");
for (const m of study.modules) {
  console.log(
    `${m.module}  ${m.topicCode}   ${String(m.words).padStart(6)} ${String(m.studyMinutes).padStart(6)} ${String(m.activityMinutes).padStart(6)}  ${String(m.supportedMinutes).padStart(9)}  ${String(m.prescribedMinutes).padStart(10)}  ${m.supports ? "SUPPORTS" : `SHORT by ${m.shortfallMinutes} min`}${m.missingUnits.length ? ` MISSING ${m.missingUnits.join(",")}` : ""}`,
  );
}
console.log(`TOTAL            ${String(study.totals.words).padStart(6)} ${String(study.totals.studyMinutes).padStart(6)} ${String(study.totals.activityMinutes).padStart(6)}  ${String(study.totals.supportedMinutes).padStart(9)}  ${String(study.prescribedTotal).padStart(10)}  ${study.reconciles ? "RECONCILES" : "DOES NOT RECONCILE"}`);

/* --write: emit the submission documents from this same computation, so the documents can never
   disagree with the study that justifies them. */
if (process.argv.includes("--write")) {
  const { writeFileSync, mkdirSync } = await import("node:fs");
  const { MODULES, UNIT_TRACE, TIME_MODEL, COURSE } = await import("../config/texas/principles-i-course.mjs");
  const { TOPIC_QUIZZES, SCENARIOS } = await import("../config/texas/principles-i-question-bank.mjs");
  const outDir = path.join(root, "texas/tx-principles-real-estate-i-30-v1/submission");
  mkdirSync(outDir, { recursive: true });
  const today = "2026-08-28";

  let outline = `# Texas Principles of Real Estate I — Timed Course Outline\n\n`;
  outline += `Generated ${today} by scripts/texas-principles-i-time-study.mjs from the PRINS1-1 transcription, the module files, and the assessment bank. Course: ${COURSE.courseId} — ${COURSE.hours} hours / ${COURSE.totalMinutes} minutes (50-minute credit hour per the PRINS1-1 form's own arithmetic, status FORM_DERIVED_PENDING_TAC_CONFIRMATION).\n\n`;
  outline += `This course is NOT submitted to or approved by the Texas Real Estate Commission. No enrollment, payment, credit, or certificate function is enabled.\n\n`;
  for (const m of study.modules) {
    const entry = MODULES.find((x) => x.module === m.module);
    outline += `## ${m.module} — ${entry.topic} (${m.prescribedMinutes} minutes prescribed)\n\n`;
    for (const trace of UNIT_TRACE.filter((t) => t.topicCode === m.topicCode)) {
      outline += `- **${trace.code} — ${trace.unit}** (${trace.prescribedMinutes} min prescribed)\n`;
      for (const objective of trace.objectives) outline += `  - Objective: ${objective}\n`;
      if (trace.sources.length > 0) {
        for (const source of trace.sources) outline += `  - Sources read: ${source.citation} §§ ${source.sections.join(", ")}\n`;
      } else {
        outline += `  - No statutory source required: ${trace.noStatuteRequired}\n`;
      }
    }
    outline += `- Assessment: ${m.quizItems} quiz items${m.scenarios ? `, ${m.scenarios} scenario exercise(s)` : ""}; ${m.statuteExercises} statute reading exercise(s), ${m.appliedExercises} applied exercise(s), module recap.\n`;
    outline += `- Supported instructional time: ${m.supportedMinutes} minutes (study ${m.studyMinutes} + activities ${m.activityMinutes}) against ${m.prescribedMinutes} prescribed — ${m.supports ? "SUPPORTS" : "SHORT"}.\n\n`;
  }
  writeFileSync(path.join(outDir, "timed-course-outline.md"), outline);

  let rec = `# Texas Principles of Real Estate I — 1,500-Minute Reconciliation\n\n`;
  rec += `Generated ${today}. Methodology label: **${TIME_MODEL.label}** — every constant below is StateCourse LLC's documented instructional-time model, not a regulator figure. ${TIME_MODEL.note}\n\n`;
  rec += `## The model\n\n- First-pass reading rate: ${TIME_MODEL.firstPassWordsPerMinute} words/minute (typical long-form reading).\n- Mastery-study effective rate: ${TIME_MODEL.masteryStudyWordsPerMinute} words/minute (first pass plus re-reading, note-taking, statute cross-referencing). Study minutes below use the mastery rate.\n- Activity attempt minutes: statute reading exercise ${TIME_MODEL.activityMinutes.statuteReadingExercise}; applied exercise ${TIME_MODEL.activityMinutes.appliedExercise}; quiz item ${TIME_MODEL.activityMinutes.quizItem}; scenario exercise ${TIME_MODEL.activityMinutes.scenario}; module recap self-check ${TIME_MODEL.activityMinutes.moduleRecap}.\n\n`;
  rec += `## Word-count and time table\n\n| Module | Topic | Words | First-pass min | Study min | Statute ex | Applied ex | Quiz items | Scenarios | Activity min | Supported min | Prescribed min | Status |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const m of study.modules) {
    rec += `| ${m.module} | ${m.topicCode} | ${m.words} | ${m.firstPassMinutes} | ${m.studyMinutes} | ${m.statuteExercises} | ${m.appliedExercises} | ${m.quizItems} | ${m.scenarios} | ${m.activityMinutes} | ${m.supportedMinutes} | ${m.prescribedMinutes} | ${m.supports ? "SUPPORTS" : "SHORT"} |\n`;
  }
  rec += `| **Total** |  | **${study.totals.words}** |  | **${study.totals.studyMinutes}** |  |  |  |  | **${study.totals.activityMinutes}** | **${study.totals.supportedMinutes}** | **${study.prescribedTotal}** | **${study.reconciles ? "RECONCILES" : "DOES NOT RECONCILE"}** |\n\n`;
  const quizCount = Object.values(TOPIC_QUIZZES).reduce((n, items) => n + items.length, 0);
  rec += `## Assessment inventory\n\n- Topic quiz items: ${quizCount} primary, each with rationale, remediation anchor, and a related replacement question (${quizCount} replacements).\n- Scenario exercises: ${SCENARIOS.length}, each with facts, tasks, model analysis, passing standard, and remediation.\n- No final examination exists. TX-1B is not authorized; see texas/submission/tx1b-exam-build-input-manifest.md.\n\n`;
  rec += `## Statutory time limits taught and respected\n\n- Daily cap: a qualifying course segment may not exceed 12 hours in one day (Occupations Code § 1101.003(d), read). At 1,500 minutes total, this course requires at least three calendar days at the cap; the platform's pacing rules must enforce the cap before any credit function is enabled.\n- Elapsed time: completion of a correspondence or alternative-delivery qualifying course may not be reported until elapsed time exceeds twice the credit hours — 60 hours from registration for this 30-hour course (Occupations Code § 1101.003(e), read).\n\n`;
  rec += `## Honesty notes\n\n- Every module's supported minutes are computed from the files as they stand — words counted, exercises counted — so deleting content fails the reconciliation rather than leaving a stale claim.\n- The supported totals exceed prescription by ${study.totals.supportedMinutes - study.prescribedTotal} minutes (${((study.totals.supportedMinutes / study.prescribedTotal - 1) * 100).toFixed(1)}%), a thin margin held deliberately: content was written to teach, and the margin documents that no filler was added to inflate time.\n- The 50-minute credit hour is derived from the PRINS1-1 form's own arithmetic (1500/30) and remains FORM_DERIVED_PENDING_TAC_CONFIRMATION until the codified 22 TAC § 535.65 text is read.\n`;
  writeFileSync(path.join(outDir, "time-reconciliation.md"), rec);
  console.log("wrote timed-course-outline.md and time-reconciliation.md");
}

process.exit(study.reconciles ? 0 : 1);
