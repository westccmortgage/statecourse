/**
 * TX Law of Agency — assessment validation.
 *
 * WRITTEN BEFORE THE ARTIFACTS IT CHECKS. A validator authored after the bank tends to encode
 * whatever the bank happens to do; this one was committed first so the thresholds come from the rule
 * lock and the work order rather than from the items. Principles II's validator was written the same
 * way and caught real defects for it.
 *
 * THRESHOLDS ARE READ BY EXACT KEY NAME AND A MISSING KEY FAILS. An earlier version of the
 * Principles II validator guessed key names and silently fell back to defaults, so it validated
 * against numbers nobody had checked. Every threshold here is looked up by name and its absence is
 * a failure, not a default.
 *
 * Usage:  node scripts/validate-loa-assessments.mjs [--json]
 * Exit 0 only when every check passes. Prints no item text, ever — see the confidentiality note.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOPICS, ALL_UNITS } from "../config/texas/law-of-agency-course-form.mjs";
import { ASSESSMENT_REQUIREMENTS } from "../config/texas/trec-rules-source-lock.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOME = path.join(root, "texas/tx-law-of-agency-30-v1");

/* Thresholds. A missing key is a failure — never a default. */
const need = (key) => {
  if (!(key in ASSESSMENT_REQUIREMENTS)) {
    throw new Error(`validate-loa-assessments: ASSESSMENT_REQUIREMENTS has no key ${JSON.stringify(key)} — the rule lock must state it; this script will not assume a value`);
  }
  return ASSESSMENT_REQUIREMENTS[key];
};

const results = [];
const check = (name, ok, detail) => { results.push({ name, result: ok ? "PASS" : "FAIL", detail }); return ok; };

const load = async (rel) => {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return null;
  return import(`file://${full}`);
};

/* ── token similarity, as Principles II measures separation ──────────────────────────────────── */
const STOP = new Set("a an and are as at be by for from has have if in is it its may must no not of on or shall should than that the their them then there these they this to under was were what when which who will with would you your".split(" "));
const tokens = (s) => (String(s).toLowerCase().match(/[a-z0-9§.()-]+/g) || []).filter((t) => t.length > 2 && !STOP.has(t));
const jaccard = (a, b) => {
  const A = new Set(a), B = new Set(b);
  if (!A.size || !B.size) return 0;
  let i = 0; for (const t of A) if (B.has(t)) i += 1;
  return i / (A.size + B.size - i);
};

const quizMod = await load("config/texas/law-of-agency-question-bank.mjs");
const scenMod = await load("config/texas/law-of-agency-scenarios.mjs");
const bankMod = await load("config/texas/law-of-agency-final-exam-bank.mjs");
const formMod = await load("config/texas/law-of-agency-final-exam-forms.mjs");
const mcMod = await load("config/texas/law-of-agency-misconception-checks.mjs");

const missing = [
  ["question bank", quizMod], ["scenarios", scenMod],
  ["final exam bank", bankMod], ["exam forms", formMod],
].filter(([, m]) => !m).map(([n]) => n);
if (missing.length) {
  console.log("TX Law of Agency — assessment validation");
  console.log(`  NOT YET BUILT: ${missing.join(", ")}`);
  console.log("  This script is committed before the artifacts on purpose. Re-run once they exist.");
  process.exitCode = 1;
  process.exit(1);
} else {
  /* ── topic quizzes ─────────────────────────────────────────────────────────────────────────── */
  const primaries = quizMod.allItems ? quizMod.allItems() : [];
  const perTopic = {};
  for (const item of primaries) {
    const t = String(item.tests || item.unit || "").slice(0, 3);
    (perTopic[t] ||= []).push(item);
  }
  const minPerTopic = need("minQuestionsPerTopicQuiz");
  const thinTopics = TOPICS.filter((t) => (perTopic[t.code] || []).length < minPerTopic);
  check("every topic carries at least the required number of primary quiz items", thinTopics.length === 0,
    `${minPerTopic} required per topic; short: ${thinTopics.map((t) => `${t.code}(${(perTopic[t.code] || []).length})`).join(", ") || "none"}`);

  const unitsAssessed = new Set(primaries.map((i) => String(i.tests || i.unit)));
  const unassessed = ALL_UNITS.filter((u) => !unitsAssessed.has(u.code));
  check("every LOA-1 unit is assessed by a primary item", unassessed.length === 0,
    `${ALL_UNITS.length - unassessed.length} of ${ALL_UNITS.length} units; unassessed: ${unassessed.map((u) => u.code).join(", ") || "none"}`);

  const replacements = quizMod.REPLACEMENTS ? Object.values(quizMod.REPLACEMENTS).flat() : [];
  check("every primary has a replacement item", replacements.length >= primaries.length,
    `${primaries.length} primaries, ${replacements.length} replacements`);

  /* A replacement that merely rewords its primary tests recall of the option, not the rule. */
  const twins = [];
  for (const p of primaries) {
    const r = replacements.find((x) => String(x.replaces || "") === String(p.id));
    if (!r) continue;
    const sim = jaccard(tokens(p.prompt || p.stem), tokens(r.prompt || r.stem));
    if (sim >= 0.75) twins.push({ id: p.id, similarity: Number(sim.toFixed(3)) });
  }
  check("no replacement is a reworded twin of its primary", twins.length === 0,
    `Jaccard >= 0.75 on the prompt: ${twins.length} pair(s)`);

  const tf = primaries.concat(replacements).filter((i) => (i.choices || i.options || []).length === 2);
  check("no true/false items", need("trueFalsePermitted") === false && tf.length === 0, `${tf.length} two-option items`);

  /* ── scenarios ─────────────────────────────────────────────────────────────────────────────── */
  const scenarios = scenMod.SCENARIOS || [];
  check("at least the required number of scenarios", scenarios.length >= need("minScenarioExercises"),
    `${scenarios.length} authored, ${need("minScenarioExercises")} required`);
  const placements = scenarios.map((s) => s.afterTopic || s.placement);
  check("scenarios are distributed, not back-loaded", new Set(placements).size === placements.length,
    `placements: ${placements.join(", ")}`);

  /* ── final examination ─────────────────────────────────────────────────────────────────────── */
  const bank = bankMod.FINAL_EXAM_BANK || bankMod.ITEMS || bankMod.BANK || [];
  check("secure bank meets its minimum size", bank.length >= need("minExamBankQuestions"),
    `${bank.length} items, ${need("minExamBankQuestions")} required`);
  const bankTopics = new Set(bank.map((i) => String(i.tests || i.unit || "").slice(0, 3)));
  check("every official topic is represented in the bank", TOPICS.every((t) => bankTopics.has(t.code)),
    `${bankTopics.size} of ${TOPICS.length} topics`);

  const forms = formMod.FORMS || {};
  const formNames = Object.keys(forms);
  check("the required number of exam forms exists", formNames.length >= need("minExamVersions"),
    `${formNames.length} forms, ${need("minExamVersions")} required`);
  const short = formNames.filter((n) => forms[n].length < need("minQuestionsPerExamVersion"));
  check("every form meets its minimum length", short.length === 0,
    `${need("minQuestionsPerExamVersion")} required per form; short: ${short.join(", ") || "none"}`);
  const formsMissingTopic = formNames.filter((n) => {
    const t = new Set(forms[n].map((id) => String(bank.find((b) => b.id === id)?.tests || "").slice(0, 3)));
    return !TOPICS.every((x) => t.has(x.code));
  });
  check("every official topic appears in every form", formsMissingTopic.length === 0,
    `forms missing a topic: ${formsMissingTopic.join(", ") || "none"}`);

  const cap = need("maxCrossVersionOverlapFraction");
  const overlaps = [];
  for (let i = 0; i < formNames.length; i += 1) {
    for (let j = i + 1; j < formNames.length; j += 1) {
      const a = new Set(forms[formNames[i]]), b = forms[formNames[j]];
      const shared = b.filter((id) => a.has(id)).length;
      overlaps.push({ pair: `${formNames[i]}/${formNames[j]}`, shared, fraction: shared / Math.max(a.size, b.length) });
    }
  }
  const over = overlaps.filter((o) => o.fraction > cap + 1e-9);
  check("no two forms overlap by more than the cap", over.length === 0,
    `cap ${(cap * 100).toFixed(2)}%; ${overlaps.length} pairs checked, worst ${(Math.max(...overlaps.map((o) => o.fraction)) * 100).toFixed(1)}%`);

  /* ── passing score, including the exact boundary ────────────────────────────────────────────── */
  const pass = need("passingScorePercent");
  const scoring = formMod.SCORING || {};
  const perForm = need("minQuestionsPerExamVersion");
  const passMark = Math.ceil((pass / 100) * perForm);
  const passes = (correct) => (scoring.passes ? scoring.passes(correct, perForm) : (correct / perForm) * 100 >= pass);
  check("the exact pass boundary passes, and one below it fails",
    passes(passMark) === true && passes(passMark - 1) === false,
    `${pass}% of ${perForm} = ${passMark}; ${passMark} passes: ${passes(passMark)}, ${passMark - 1} passes: ${passes(passMark - 1)}`);

  /* ── separation from formative instruments ─────────────────────────────────────────────────── */
  const formative = primaries.concat(replacements, (mcMod?.MISCONCEPTION_CHECKS || []));
  const tooClose = [];
  for (const e of bank) {
    for (const f of formative) {
      const sim = jaccard(tokens(e.prompt || e.stem), tokens(f.prompt || f.stem));
      if (sim >= 0.70) { tooClose.push({ exam: e.id, formative: f.id, similarity: Number(sim.toFixed(3)) }); break; }
    }
  }
  check("examination items are substantially separate from quizzes, replacements and misconception checks",
    tooClose.length === 0, `Jaccard >= 0.70: ${tooClose.length} item(s)`);

  /* ── no required item may depend on optional-reference content ─────────────────────────────── */
  const optionalRefs = primaries.concat(replacements, bank, scenarios.flatMap((s) => s.tasks || []))
    .filter((i) => /optional[- ]reference|t\d+-optional/i.test(JSON.stringify(i.teaches || i.screen || "")));
  check("no required item is traced to an optional-reference block", optionalRefs.length === 0,
    `${optionalRefs.length} item(s) traced to optional material`);
}

/* CONFIDENTIALITY. This script prints counts, ids and similarity figures — never a prompt, a choice,
   a correct answer or a rationale. A validator that echoes the secure bank into a build log has
   leaked it as surely as publishing it would. */
const failed = results.filter((r) => r.result !== "PASS");
if (process.argv.includes("--json")) console.log(JSON.stringify({ results, failed: failed.length }, null, 2));
else {
  console.log("TX Law of Agency — assessment validation\n");
  for (const r of results) console.log(`  ${r.result}  ${r.name}\n          ${r.detail}`);
  console.log(`\n  ${results.length - failed.length} of ${results.length} checks pass`);
}
process.exitCode = failed.length ? 1 : (results.length ? 0 : 1);
