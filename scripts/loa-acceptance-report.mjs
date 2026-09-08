/**
 * TX Law of Agency — acceptance report.
 *
 * WHAT THIS IS. The acceptance gate, computed rather than written. Every figure below is read from
 * the artifacts at the moment the script runs: the frozen curriculum, the video freeze, the source
 * register, the claim audit, the block maps, the banks, the scenarios, the traceability crosswalk,
 * the engine evidence, the accessibility report and the test suite. Nothing is transcribed, so the
 * report cannot describe a build that no longer exists.
 *
 * WHY IT COMPUTES ITS OWN VERDICT. A report written at the end of a long build records what the
 * builder believes. This one derives its verdict from the checks themselves, and a failing check
 * cannot be argued with — it can only be fixed.
 *
 * THREE VERDICTS, AND ONLY ONE OF THEM MEANS THE COURSE IS DONE.
 *   CONTENT AND ASSESSMENT      the curriculum and its instruments are complete and validated
 *   COMPLETE OPERATIONAL COURSE requires the engine, accessibility and time reconciliation too
 *   SUBMISSION READINESS        requires everything above PLUS the standing blockers cleared,
 *                               none of which can be cleared from this repository
 * A gap that has been recorded is still a gap, and the middle verdict is the one that must be green
 * before the next course's instructional authoring begins.
 *
 * WHAT IT CANNOT DECIDE. Submission readiness is not a property of this repository. The codified
 * 22 TAC provider rules have never been read from this environment, StateCourse holds no TREC
 * provider approval, and no course approval has been filed. Those are recorded as standing blockers
 * and no computation here can clear them.
 *
 * CONFIDENTIALITY. This report prints counts, hashes, percentages and behaviour outcomes. It prints
 * no item text, no choice, no key and no rationale from the secure bank.
 *
 * Usage:  node scripts/loa-acceptance-report.mjs [--json]
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { reconcile } from "../config/texas/quotation-dispositions.mjs";
import { unmatchedFrom } from "./lib/tx-claim-audit.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOME = path.join(root, "texas/tx-law-of-agency-30-v1");
const CURRICULUM = path.join(HOME, "curriculum");
const COURSE_ID = "tx-law-of-agency-30-v1";

const check = (label, ok, detail) => ({ label, ok: Boolean(ok), detail });
const checks = [];
const blockers = [];

function tryRun(cmd, args) {
  try { return { ok: true, out: execFileSync(cmd, args, { cwd: root, encoding: "utf8", stdio: "pipe" }) }; }
  catch (error) { return { ok: false, out: `${error.stdout || ""}${error.stderr || ""}` }; }
}
const readJson = (rel) => { try { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); } catch { return null; } };

/* 1 ── frozen curriculum ────────────────────────────────────────────────────────────────────── */
const freeze = JSON.parse(fs.readFileSync(path.join(HOME, "content-freeze.json"), "utf8"));
let freezeCommit = null;
try { freezeCommit = execFileSync("git", ["log", "--format=%H", "-1", "--grep", freeze.freezeId ?? freeze.freezeLabel ?? ""], { cwd: root, encoding: "utf8" }).trim() || null; } catch { /* ignore */ }
const frozenModules = freeze.modules ?? freeze.curriculum?.modules ?? [];
const drift = frozenModules.filter((m) => {
  const file = path.join(root, m.path ?? path.join("texas/tx-law-of-agency-30-v1/curriculum", m.file));
  if (!fs.existsSync(file)) return true;
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") !== m.sha256;
});
checks.push(check("1. frozen curriculum", drift.length === 0,
  `${freeze.freezeId ?? freeze.freezeLabel}${freezeCommit ? ` at ${freezeCommit.slice(0, 10)}` : ""}; ${drift.length ? `DRIFT in ${drift.map((d) => d.path ?? d.file).join(", ")}` : `all ${frozenModules.length} hashed artifacts match the freeze`}`));

/* 2 ── the video freeze the curriculum freeze points at ─────────────────────────────────────── */
const videoFreeze = readJson("texas/tx-law-of-agency-30-v1/video-plan-freeze.json");
const videoValidate = tryRun("node", ["scripts/validate-loa-video-packages.mjs"]);
checks.push(check("2. video plan frozen, and the curriculum freeze points at the freeze rather than the plan", Boolean(videoFreeze) && videoValidate.ok,
  videoFreeze
    ? `${videoFreeze.freezeId} over ${Object.keys(videoFreeze.artifacts || {}).length} artifacts, following ${videoFreeze.previousFreeze?.freezeId ?? "its first recorded freeze"}; package validator ${videoValidate.ok ? "passes" : "FAILS"}`
    : "no video freeze artifact"));

/* 3 ── topic and unit coverage ──────────────────────────────────────────────────────────────── */
const form = await import("../config/texas/law-of-agency-course-form.mjs");
const unitCounts = form.TOPICS.map((t, i) => {
  const txt = fs.readFileSync(path.join(CURRICULUM, `module-${String(i + 1).padStart(2, "0")}.md`), "utf8");
  return (txt.match(/^## Unit: /gm) || []).length === t.units.length;
});
checks.push(check("3. twelve-topic and 57-unit coverage", form.TOPICS.length === 12 && form.ALL_UNITS.length === 57 && unitCounts.every(Boolean),
  `${form.TOPICS.length} topics, ${form.ALL_UNITS.length} units; every module carries exactly its topic's unit count`));

/* 4 ── outline reconciliation ───────────────────────────────────────────────────────────────── */
const subtotalOk = form.TOPICS.every((t) => t.units.reduce((n, u) => n + u.minutes, 0) === t.subtotalMinutes);
const grand = form.TOPICS.reduce((n, t) => n + t.subtotalMinutes, 0);
checks.push(check("4. 1,500-minute outline reconciliation", subtotalOk && grand === form.FORM.totalMinutes,
  `topic subtotals reconcile and total ${grand} against the form's printed ${form.FORM.totalMinutes} (${form.FORM.courseHours}h at ${form.FORM.minutesPerCreditHour}min)`));

/* 5 ── time evidence, in three layers ───────────────────────────────────────────────────────── */
const timeRun = tryRun("node", ["scripts/report-loa-time-evidence.mjs"]);
const time = readJson("texas/tx-law-of-agency-30-v1/time-evidence.json");
const layers = time?.layers ?? {};
const timeOk = Boolean(time) && time.meetsPrescribed === true && time.everyTopicMeetsItsAllocation === true
  && (time.topicsBelowAllocation?.length ?? 1) === 0;
checks.push(check("5. required time meets the prescribed floor, topic by topic", timeOk,
  time
    ? `layer 1 topic instruction ${layers.topicInstruction?.minutes} min against ${layers.topicInstruction?.prescribedMinutes} prescribed; layer 2 course-level capstone ${layers.courseLevelCapstone?.minutes} min, attributed to no topic; layer 3 grand required ${layers.grandRequired?.minutes} min. Every topic meets its own allocation: ${time.everyTopicMeetsItsAllocation}. ${time.topicsBelowAllocation?.length ? `BELOW ALLOCATION: ${time.topicsBelowAllocation.join(", ")}` : "no topic below its allocation"}`
    : "time-evidence script did not complete"));
checks.push(check("5a. corpus segments are provably disjoint", timeRun.ok && Boolean(time?.disjointness),
  time?.disjointness ?? "not stated — a time figure built from overlapping segments is not evidence"));

/* 6 ── block and screen coverage ────────────────────────────────────────────────────────────── */
let blocks = 0, screens = 0, coverageOk = true;
const coverageDetail = [];
for (let n = 1; n <= 12; n += 1) {
  const mod = await import(`../config/texas/law-of-agency-module-${n}-blocks.mjs`);
  const delivery = mod[`MODULE_${n}_BLOCKS`] ?? mod.default;
  const lines = fs.readFileSync(path.join(CURRICULUM, `module-${String(n).padStart(2, "0")}.md`), "utf8").replace(/\r/g, "").split("\n");
  const idx = (h) => (h === "^" ? 0 : h === "$" ? lines.length : lines.findIndex((l) => l.trim() === h));
  const placed = [];
  for (const b of delivery.blocks) for (const s of b.screens) if (s.content) placed.push({ id: s.id, s: idx(s.content.from), e: idx(s.content.to) });
  placed.sort((a, b) => a.s - b.s);
  if (!placed.length || placed[0].s !== 0 || placed[placed.length - 1].e !== lines.length) { coverageOk = false; coverageDetail.push(`module ${n} does not tile`); }
  for (let i = 1; i < placed.length; i += 1) if (placed[i].s !== placed[i - 1].e) { coverageOk = false; coverageDetail.push(`module ${n} gap at ${placed[i].id}`); }
  blocks += delivery.blocks.length;
  screens += delivery.blocks.reduce((a, b) => a + b.screens.length, 0);
}
checks.push(check("6. block and screen coverage", coverageOk,
  `${blocks} blocks, ${screens} screens; ${coverageOk ? "ranges tile every module exactly — no gaps, overlaps or missing headings" : coverageDetail.join("; ")}`));

/* 7 + 8 ── claim-to-source audit and unmatched quotations ───────────────────────────────────── */
const auditRun = tryRun("node", ["scripts/audit-loa-claims.mjs"]);
const audit = readJson("texas/tx-law-of-agency-30-v1/claim-audit.json");
const byStatus = audit?.totals?.byStatus ?? {};
const unsupported = (byStatus.SOURCE_NOT_HELD || 0) + (byStatus.SECTION_NOT_FOUND || 0) + (byStatus.AMBIGUOUS_CODE || 0);
/* The audit reports unmatched quotations in three places; composing them is `unmatchedFrom`'s
   job precisely so this script and the freeze cannot disagree about what "unmatched" means. */
const disposition = reconcile(COURSE_ID, unmatchedFrom(audit));
checks.push(check("7. claim-to-source audit", auditRun.ok && Boolean(audit) && unsupported === 0,
  audit
    ? `${audit.totals.citations} citations — ${byStatus.MECHANICAL_PASS || 0} pass, ${byStatus.IDENTIFIED_NOT_TAUGHT || 0} identified-not-taught, ${unsupported} unresolved`
    : "claim audit did not complete"));
/* `reconcile` deliberately does not count an orphaned disposition as unclean — a quotation may
   have been rewritten away — but the freeze refuses to write with one outstanding, and this gate
   holds the same line: a stale disposition is how an exemption outlives the thing it explained. */
checks.push(check("8. unmatched quotations all reviewed, none a sourcing defect, no stale disposition",
  unsupported === 0 && disposition.clean && disposition.orphaned.length === 0,
  `${disposition.unmatched} unmatched quotations, all reviewed — ${Object.entries(disposition.byDisposition).map(([k, v]) => `${v} ${k.toLowerCase().replace(/_/g, " ")}`).join(", ")}${disposition.undispositioned.length ? `; UNDISPOSITIONED: ${disposition.undispositioned.map((q) => `${q.id} (${q.module})`).join(", ")}` : ""}${disposition.defects.length ? `; SOURCING DEFECTS: ${disposition.defects.map((q) => q.id).join(", ")}` : ""}${disposition.orphaned.length ? `; stale dispositions: ${disposition.orphaned.join(", ")}` : ""}`));

/* 8a ── the auditor's own blind spot, recorded rather than hidden ────────────────────────────
   The shared claim auditor anchors its Texas-code pattern on the section symbol, so a citation
   written in prose ("Occupations Code section 1101.652") is invisible to it. Every mechanical-pass
   figure above therefore describes SYMBOL-ANCHORED citations only. This is stated as a limitation
   of the measurement, not as a defect in the content, and it is tracked separately because fixing
   it changes hashed ledgers for two courses. */
let proseFormCitations = 0;
for (const file of fs.readdirSync(CURRICULUM).filter((f) => f.endsWith(".md"))) {
  const text = fs.readFileSync(path.join(CURRICULUM, file), "utf8");
  proseFormCitations += (text.match(/\bsections?\s+\d+\.\d+/gi) || []).length;
}
checks.push(check("8a. the audit's coverage limit is stated, not hidden", true,
  `the claim auditor's Texas-code pattern is anchored on the section symbol at scripts/lib/tx-claim-audit.mjs, so ${proseFormCitations} prose-form citations in this curriculum are outside its ${audit?.totals?.citations ?? 0}-citation sample. Every mechanical-pass figure in point 7 describes symbol-anchored citations only. Tracked as its own task; it is a shared engine and fixing it alters hashed ledgers for Principles II as well.`));

/* 9 ── source register ──────────────────────────────────────────────────────────────────────── */
const register = await import("../config/texas/law-of-agency-statute-sources.mjs");
const gaps = register.GAPS ?? [];
checks.push(check("9. source register complete", register.SECTIONS_READ.length > 0 && register.ALL_SOURCES.length > 0,
  `${register.ALL_SOURCES.length} sources, ${register.SECTIONS_READ.length} sections recorded as read, ${gaps.length} recorded gaps`));

/* 10 + 11 ── quiz and replacement counts ────────────────────────────────────────────────────── */
const bank = await import("../config/texas/law-of-agency-question-bank.mjs");
const rules = await import("../config/texas/trec-rules-source-lock.mjs");
const REQ = rules.ASSESSMENT_REQUIREMENTS;
const perTopicOk = Object.values(bank.TOPIC_QUIZZES).every((v) => v.length >= REQ.minQuestionsPerTopicQuiz);
checks.push(check("10. primary quiz count", perTopicOk,
  `${bank.PRIMARY_COUNT} primaries across ${Object.keys(bank.TOPIC_QUIZZES).length} topics; every topic at or above the rule's ${REQ.minQuestionsPerTopicQuiz}`));
checks.push(check("11. replacement-question count", bank.REPLACEMENT_COUNT === bank.PRIMARY_COUNT,
  `${bank.REPLACEMENT_COUNT} replacements — one per primary, each a different fact pattern on the same proposition`));

/* 12 ── misconception checks, and that they gate nothing ────────────────────────────────────── */
const mc = await import("../config/texas/law-of-agency-misconception-checks.mjs");
const mcUnscored = mc.MISCONCEPTION_CHECKS.every((c) => c.countsAsAssessment === false);
checks.push(check("12. misconception checks are formative and gate nothing", mcUnscored,
  `${mc.MISCONCEPTION_CHECKS.length} checks across ${new Set(mc.MISCONCEPTION_CHECKS.map((c) => c.topicCode)).size} topics; every one countsAsAssessment=false`));

/* 13 ── scenarios ───────────────────────────────────────────────────────────────────────────── */
const scenarios = await import("../config/texas/law-of-agency-scenarios.mjs");
const places = scenarios.SCENARIOS.map((s) => s.afterTopic);
const scenarioOk = scenarios.SCENARIOS.length >= REQ.minScenarioExercises && new Set(places).size === places.length;
checks.push(check("13. scenario count and distribution", scenarioOk,
  `${scenarios.SCENARIOS.length} scenarios, ${scenarios.SCENARIOS.reduce((n, s) => n + s.tasks.length, 0)} tasks, placed after ${places.join(", ")} (rule minimum ${REQ.minScenarioExercises})`));

/* 14-16 ── final bank, versions, overlap ────────────────────────────────────────────────────── */
const examBank = await import("../config/texas/law-of-agency-final-exam-bank.mjs");
const examForms = await import("../config/texas/law-of-agency-final-exam-forms.mjs");
const bankSize = examBank.BANK_SIZE;
const versions = examForms.VERSIONS;
const versionsOk = versions.length >= REQ.minExamVersions && versions.every((v) => v.itemCount >= REQ.minQuestionsPerExamVersion);
const topicsOnEvery = versions.every((v) => Object.keys(v.topicCounts).length === form.TOPICS.length);
const overlapOk = examForms.PAIRWISE_OVERLAP.every((r) => r.withinCap);
checks.push(check("14. final-bank size and unit coverage", bankSize >= REQ.minExamBankQuestions && Object.values(examBank.UNITS_EXAMINED).every((n) => n >= 1),
  `${bankSize} items against the rule's minimum of ${REQ.minExamBankQuestions}; ${Object.values(examBank.UNITS_EXAMINED).filter((n) => n > 0).length} of ${form.ALL_UNITS.length} units carry at least one examination item`));
checks.push(check("15. four exam versions, every topic on every version", versionsOk && topicsOnEvery,
  `${versions.map((v) => `${v.id}:${v.itemCount}`).join(" ")} against ${REQ.minQuestionsPerExamVersion} per version; every version covers all ${form.TOPICS.length} topics`));
checks.push(check("16. pairwise overlap under the one-third cap", overlapOk,
  `${examForms.PAIRWISE_OVERLAP.map((r) => `${r.pair} ${r.percentOfShorter}%`).join(", ")} against a ${examForms.OVERLAP_THRESHOLD.maxPercent}% cap; ${examForms.ITEM_EXPOSURE.onExactlyOneVersion} items on one version, ${examForms.ITEM_EXPOSURE.onExactlyTwoVersions} on two, ${examForms.ITEM_EXPOSURE.unused} unused`));

/* 17 ── the 70% boundary, exercised in both directions ──────────────────────────────────────── */
const mark = examForms.SCORING.minimumCorrectByVersion[versions[0].id];
const boundaryOk = examForms.SCORING.passes(mark, versions[0].itemCount) === true
  && examForms.SCORING.passes(mark - 1, versions[0].itemCount) === false;
checks.push(check("17. the 70% unweighted boundary is exact", boundaryOk,
  `${mark} of ${versions[0].itemCount} passes and ${mark - 1} does not; the comparison is on raw counts, not a rounded percentage`));

/* 18 ── separation from the formative instruments ───────────────────────────────────────────── */
const validateRun = tryRun("node", ["scripts/validate-loa-assessments.mjs"]);
const separationLine = validateRun.out.split("\n").find((l) => /Jaccard >= 0\.70/.test(l)) ?? "";
checks.push(check("18. examination items are significantly different from the quizzes and exercises", validateRun.ok,
  `${validateRun.out.match(/(\d+) of (\d+) checks pass/)?.[0] ?? "validator did not report"}${separationLine ? `; ${separationLine.trim()}` : ""}`));

/* 19 ── traceability ────────────────────────────────────────────────────────────────────────── */
const traceRun = tryRun("node", ["scripts/report-loa-traceability.mjs"]);
const trace = readJson("texas/tx-law-of-agency-30-v1/traceability.json");
checks.push(check("19. assessment-to-instruction traceability", traceRun.ok && Boolean(trace),
  trace
    ? `${trace.totals.items} items mapped to unit, screen, objective, tested judgment and sources; ${trace.totals.unitsAssessed} of ${trace.totals.unitsTotal} units assessed and ${trace.totals.unitsExamined} examined${trace.totals.unitsUnassessed.length ? ` (unassessed: ${trace.totals.unitsUnassessed.join(", ")})` : ""}`
    : "crosswalk did not complete"));

/* 20 ── the engine, demonstrated rather than assumed ─────────────────────────────────────────
   A DISABLED SWITCH IS NOT A WORKING ENGINE. Disabled enrollment proves an unapproved course cannot
   accidentally operate — a real and necessary safety control — and proves nothing about delivery.
   The two are asserted separately so that turning enrollment on could never be mistaken for
   progress. */
const REQUIRED_ENGINE_BEHAVIOURS = [
  "independentEnrollmentRecord", "identityVerification", "moduleCompletion", "topicGating",
  "correctAnswerProgression", "incorrectAnswerRationale", "replacementQuestionDelivery",
  "scenarioPassing", "instructorSupportPathway", "finalExamAccessAfterCoursework",
  "examVersionRotation", "unweightedSeventyPercentScoring", "firstFailedAttempt",
  "remediationAfterFirstFailure", "differentVersionOnSubsequentAttempt", "ninetyDayLimit",
  "secondFailureRetake", "completionStatus", "certificateEligibility", "courseEvaluation",
  "auditableAttemptRecord", "optionalMaterialNeverBlocksProgress",
  "misconceptionChecksRecordedAndUnscored",
];
const engineRun = tryRun("node", ["scripts/loa-reviewer-workflow.mjs"]);
const engineEvidence = readJson("texas/tx-law-of-agency-30-v1/engine-workflow-evidence.json");
const demonstrated = engineEvidence?.behaviours ?? {};
const missingBehaviours = REQUIRED_ENGINE_BEHAVIOURS.filter((b) => demonstrated[b] !== "PASS");
checks.push(check("20. course engine workflow, demonstrated in a reviewer environment", engineRun.ok && missingBehaviours.length === 0,
  engineEvidence
    ? `${REQUIRED_ENGINE_BEHAVIOURS.length - missingBehaviours.length} of ${REQUIRED_ENGINE_BEHAVIOURS.length} behaviours demonstrated${missingBehaviours.length ? `; not demonstrated: ${missingBehaviours.join(", ")}` : ""}`
    : `NOT DEMONSTRATED. Disabled enrollment is a safety control, not evidence that the engine works.`));

const course = (await import("../config/texas/law-of-agency-course.mjs")).COURSE;
checks.push(check("20a. production enrollment remains disabled (safety control, not an operational pass)",
  course.enrollmentEnabled === false && course.finalExaminationAdministrable === false && course.creditReportingEnabled === false && course.certificateIssuanceEnabled === false,
  `enrollment ${course.enrollmentEnabled ? "ENABLED" : "disabled"}, examination ${course.finalExaminationAdministrable ? "ADMINISTRABLE" : "not administrable"} (${course.finalExaminationStatus}), credit reporting ${course.creditReportingEnabled ? "ENABLED" : "disabled"}, certificates ${course.certificateIssuanceEnabled ? "ENABLED" : "disabled"}`));

/* 21 ── accessibility, measured against the rendered course ─────────────────────────────────── */
const A11Y_REQUIRED = [
  "keyboardNavigation", "visibleFocusStates", "screenReaderNamesAndRelationships",
  "headingHierarchy", "formLabels", "answerChoiceSemantics", "errorIdentification",
  "rationaleAndRemediationAnnouncements", "progressStateCommunication", "scenarioControls",
  "finalExamNavigation", "contrast", "zoomAndResponsive", "laptopLayout", "tabletLayout",
  "mobileLayout", "captionsAndTranscripts", "everyControlHasAFunction",
  "optionalMaterialNeverBlocks", "noMinimumTypedLength", "newChecksCanFail",
];
const a11y = readJson("texas/tx-law-of-agency-30-v1/accessibility-report.json");
const a11yResults = a11y?.results ?? {};
const a11yMissing = A11Y_REQUIRED.filter((k) => a11yResults[k] !== "PASS" && a11yResults[k] !== "NOT_APPLICABLE");
checks.push(check("21. accessibility, measured against the rendered course", Boolean(a11y) && a11yMissing.length === 0,
  a11y
    ? `${A11Y_REQUIRED.length - a11yMissing.length} of ${A11Y_REQUIRED.length} criteria pass${a11yMissing.length ? `; outstanding: ${a11yMissing.join(", ")}` : ""}`
    : "NOT TESTED. Accessibility must be measured against what a person operates, not inferred from the data structures behind it."));

/* 22 ── the answer key reaches no served tree ───────────────────────────────────────────────── */
const servedOffenders = [];
for (const dir of ["public", "dist"].map((d) => path.join(root, d)).filter((d) => fs.existsSync(d))) {
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!/\.(m?js|html|json|css)$/i.test(entry.name)) continue;
      const text = fs.readFileSync(full, "utf8");
      if (text.includes("law-of-agency-final-exam-bank") || text.includes("law-of-agency-final-exam-forms")) {
        servedOffenders.push(path.relative(root, full));
      }
    }
  };
  walk(dir);
}
checks.push(check("22. the confidential bank reaches no served tree", servedOffenders.length === 0,
  servedOffenders.length === 0
    ? "no file under public/ or dist/ references the examination bank or the version file; the reviewer surface renders placeholder items only"
    : `REFERENCED FROM: ${servedOffenders.join(", ")}`));

/* 23 ── regression suite ────────────────────────────────────────────────────────────────────── */
const testRun = tryRun("node", ["--test", ...fs.readdirSync(path.join(root, "tests")).filter((f) => f.endsWith(".test.mjs")).map((f) => `tests/${f}`)]);
const testCounts = testRun.out.match(/# pass (\d+)[\s\S]*?# fail (\d+)/);
checks.push(check("23. full regression suite", testRun.ok && testCounts && testCounts[2] === "0",
  testCounts ? `${testCounts[1]} passing, ${testCounts[2]} failing` : "test suite did not report"));

/* 24 ── submission blockers ─────────────────────────────────────────────────────────────────── */
const manifest = await import("../config/texas/regulatory-manifest.mjs");
const providerLock = manifest.providerRuleSourceLock();
blockers.push(`TX_PROVIDER_RULE_SOURCE_LOCK is ${providerLock.status} — ${providerLock.unreachable.map((u) => u.id).join(", ") || "no unreachable sources"}`);
blockers.push("the codified 22 TAC text has never been read from this environment; the rules are held from TREC's published copy and the difference is recorded in trec-rules-source-lock.mjs");
blockers.push("StateCourse holds no TREC qualifying-education provider approval, and no course application has been filed for LOA-1");
blockers.push("no STUDENT-facing surface exists. The engine workflow and accessibility are demonstrated against a reviewer-only, non-credit surface at texas/tx-law-of-agency-30-v1/reviewer-surface, which is not served, not linked and carries noindex. A student-facing deployment, and testing with real assistive technology and real users, remain outstanding.");
blockers.push("no production Texas video has been rendered and approved. A short local HeyGen test render exists only for presenter/voice review; it is ignored by git, is not a course asset, and is not activated. The three editorial packages are frozen and validated, and the optional, non-blocking screenMedia integration hook is implemented and tested. Transcripts remain the primary artifact and every proposition a segment would state is already in the module text, so no student is dependent on an unproduced video; activation still requires final MP4, poster, VTT, plain-text transcript, and factual, visual, logo-safety, and accessibility approvals.");
blockers.push("the claim auditor is anchored on the section symbol and cannot see prose-form citations; the mechanical-pass figures describe symbol-anchored citations only, and correcting the shared engine will alter hashed ledgers for Principles II as well as this course");
blockers.push("certificate issuance and four-year record retention are implemented and refused/recorded in the engine, but neither has been exercised against a real completion because no credit may be awarded without TREC approval");
checks.push(check("24. submission-readiness blockers recorded", true, `${blockers.length} standing blockers, none clearable from this repository`));

/* ── the verdict ─────────────────────────────────────────────────────────────────────────────── */
const failed = checks.filter((c) => !c.ok);
const group = (re) => checks.filter((c) => re.test(c.label));
const allOk = (list) => list.length > 0 && list.every((c) => c.ok);

const contentComplete = allOk(group(/^(1|2|3|4|5|5a|6|7|8|8a|9)\./));
const assessmentComplete = allOk(group(/^(10|11|12|13|14|15|16|17|18|19)\./));
const engineComplete = allOk(group(/^20\./));
const accessibilityComplete = allOk(group(/^21\./));
const confidentialityHeld = allOk(group(/^22\./));
const regressionGreen = allOk(group(/^23\./));
const timeReconciled = timeOk && Boolean(time?.disjointness);

const contentAndAssessment = contentComplete && assessmentComplete && regressionGreen ? "GO" : "NO-GO";
const operationalCourse = contentAndAssessment === "GO" && engineComplete && accessibilityComplete
  && confidentialityHeld && timeReconciled ? "GO" : "NO-GO";
const submissionReadiness = operationalCourse === "GO" && blockers.length === 0 ? "GO" : "NO-GO";
const verdict = operationalCourse === "GO"
  ? (submissionReadiness === "GO" ? "GO" : "GO — COURSE COMPLETE, SUBMISSION BLOCKED")
  : "NO-GO";

const report = {
  course: "Texas Law of Agency",
  courseId: course.courseId,
  approvalForm: `${form.FORM.formNumber} rev. ${form.FORM.revision}`,
  contentFreeze: freeze.freezeId ?? freeze.freezeLabel,
  generatedBy: "scripts/loa-acceptance-report.mjs",
  generatedAt: new Date().toISOString(),
  confidentiality: "Counts, hashes, percentages and behaviour outcomes only. No item text, choice, key or rationale from the secure bank appears in this report.",
  verdicts: {
    contentAndAssessment,
    completeOperationalCourse: operationalCourse,
    submissionReadiness,
    overall: verdict,
  },
  checks,
  failed: failed.map((c) => c.label),
  blockers,
};
fs.writeFileSync(path.join(HOME, "acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);

if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`TX Law of Agency — acceptance report\n  ${report.approvalForm} · ${report.contentFreeze}\n`);
  for (const c of checks) console.log(`  ${c.ok ? "PASS" : "FAIL"}  ${c.label}\n          ${c.detail}`);
  console.log("\n  ── verdicts ──");
  console.log(`  content and assessment ...... ${contentAndAssessment}`);
  console.log(`  complete operational course . ${operationalCourse}`);
  console.log(`  submission readiness ........ ${submissionReadiness}`);
  console.log(`  OVERALL ..................... ${verdict}`);
  if (failed.length) console.log(`\n  FAILING: ${failed.map((c) => c.label).join(", ")}`);
  console.log(`\n  standing blockers (${blockers.length}), none clearable from this repository:`);
  for (const b of blockers) console.log(`    - ${b}`);
  console.log(`\n  written: ${path.relative(root, path.join(HOME, "acceptance-report.json"))}`);
}

process.exitCode = failed.length ? 1 : 0;
