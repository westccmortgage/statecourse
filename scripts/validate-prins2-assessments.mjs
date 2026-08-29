/**
 * TX Principles II — assessment validation.
 *
 * WRITTEN BEFORE THE ARTIFACTS IT CHECKS. The exam bank, the four versions and the scenarios were
 * still being authored when this file was written, deliberately: a validator written afterwards
 * tends to encode whatever the artifact happens to do, and then passes by construction. The
 * thresholds below come from 22 TAC §§ 535.62 and 535.65 as recorded in
 * config/texas/trec-rules-source-lock.mjs, not from the banks.
 *
 * WHAT IT CHECKS, and why each one is here rather than left to review:
 *
 *   bank size, version sizes, per-version topic coverage, no true/false, pairwise overlap,
 *   answer-key completeness — the counts the rule states.
 *
 *   EXACT DUPLICATES and NEAR-DUPLICATES inside the bank. A bank of 130 items that contains the
 *   same question twice is a bank of 129. Near-duplicate detection is a token-overlap measure over
 *   normalised prompts, which catches the specific failure of renaming the parties and changing a
 *   city while leaving the fact pattern intact.
 *
 *   SEPARATION from the formative instruments. The final examination may not reuse a topic quiz's
 *   fact pattern. This runs the same similarity measure across the two banks and across the
 *   scenarios, so "substantially different" is a measured property rather than an assertion.
 *
 *   MULTIPLE DEFENSIBLE ANSWERS, as far as a machine can see it: duplicate choices within an item,
 *   and choice sets where two options are near-identical.
 *
 *   TRACEABILITY. Every item's `teaches` anchor must resolve to a real unit heading in the FROZEN
 *   curriculum, and every `unit` must be a real PRINS2-1 code. An item testing something the course
 *   does not teach is a defect no matter how good the item is.
 *
 *   STUDENT-FACING EXPOSURE. The bank must not be reachable from public/ or dist/.
 *
 * Usage:  node scripts/validate-prins2-assessments.mjs
 * Exit 0 only when every check passes.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CURRICULUM = path.join(root, "texas/tx-principles-real-estate-ii-30-v1/curriculum");

const failures = [];
const notes = [];
const fail = (m) => failures.push(m);

/* ── normalisation and similarity ─────────────────────────────────────────────────────────────
   Similarity is Jaccard over content-word sets. It is deliberately blunt: it will not notice a
   clever paraphrase, and it is not meant to — it is meant to catch the mechanical reuse that
   actually happens, where a stem is copied and the names and city are changed. */
const STOP = new Set("a an the and or of to in on at for with by is are was were be been that this it its as from into under over after before which who whom whose not no if then than when where how what why does do did has have had may must shall should would could can will".split(" "));
function tokens(s) {
  return new Set(
    String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
}
function jaccard(a, b) {
  let inter = 0;
  for (const t of a) if (b.has(t)) inter += 1;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

const NEAR_DUP = 0.75;      // inside the bank
const CROSS_BANK = 0.70;    // final vs formative / scenarios

async function main() {
  const form = await import("../config/texas/principles-ii-course-form.mjs");
  const TOPICS = form.TOPICS.map((t) => t.code);
  const UNITS = new Set(form.ALL_UNITS.map((u) => u.code));

  /* Unit anchors present in the frozen curriculum, for the traceability check. */
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9 &-]/g, "").replace(/&/g, "").replace(/ /g, "-");
  const anchors = new Map();
  for (const file of fs.readdirSync(CURRICULUM).filter((f) => /^module-\d+\.md$/.test(f))) {
    const txt = fs.readFileSync(path.join(CURRICULUM, file), "utf8");
    const set = new Set();
    for (const m of txt.matchAll(/^## Unit: (.+)$/gm)) set.add(`unit-${slug(m[1].trim())}`);
    anchors.set(file, set);
  }
  const anchorResolves = (ref) => {
    if (typeof ref !== "string" || !ref.includes("#")) return false;
    const [file, anchor] = ref.split("#");
    return Boolean(anchors.get(file)?.has(anchor));
  };

  const rules = await import("../config/texas/trec-rules-source-lock.mjs");
  /* Read from the rule lock by its OWN key names. An earlier draft of this file guessed the names
     and silently fell through to hardcoded defaults — which happened to be the right numbers, and
     so would have passed while proving nothing about the rule. Missing keys now fail loudly. */
  const REQ = rules.ASSESSMENT_REQUIREMENTS || {};
  const need = (key) => {
    const v = REQ[key];
    if (v === undefined) fail(`rule lock does not export ASSESSMENT_REQUIREMENTS.${key} — this validator must read its thresholds from the rule, not from itself`);
    return v;
  };
  const MIN_BANK = need("minExamBankQuestions");
  const MIN_VERSION = need("minQuestionsPerExamVersion");
  const MIN_VERSIONS = need("minExamVersions");
  const MAX_OVERLAP = need("maxCrossVersionOverlapFraction");
  const PASS_MARK = need("passingScorePercent") / 100;
  const MIN_QUIZ = need("minQuestionsPerTopicQuiz");
  const MIN_SCENARIOS = need("minScenarioExercises");
  const TF_PERMITTED = need("trueFalsePermitted");
  if (TF_PERMITTED !== false) fail("rule lock reports true/false items are permitted; this course is built on the opposite premise");
  notes.push(`thresholds from the rule lock: bank>=${MIN_BANK}, versions=${MIN_VERSIONS}x>=${MIN_VERSION}, overlap<=${(MAX_OVERLAP * 100).toFixed(1)}%, pass=${PASS_MARK * 100}%`);

  /* ── formative bank (already built) ───────────────────────────────────────────────────────── */
  const formative = await import("../config/texas/principles-ii-question-bank.mjs");
  for (const [topic, items] of Object.entries(formative.TOPIC_QUIZZES)) {
    if (items.length < MIN_QUIZ) fail(`topic quiz ${topic}: ${items.length} primary questions, below the rule's minimum of ${MIN_QUIZ}`);
  }
  notes.push(`topic quizzes: ${formative.PRIMARY_COUNT} primaries + ${formative.REPLACEMENT_COUNT} replacements across ${Object.keys(formative.TOPIC_QUIZZES).length} topics`);
  const formativePrompts = [];
  for (const item of formative.ALL_ITEMS) {
    formativePrompts.push({ id: item.id, tok: tokens(item.prompt) });
    formativePrompts.push({ id: `${item.id}R`, tok: tokens(item.replacement.prompt) });
  }

  /* ── scenarios ────────────────────────────────────────────────────────────────────────────── */
  let scenarioPrompts = [];
  const scenarioPath = path.join(root, "config/texas/principles-ii-scenarios.mjs");
  if (!fs.existsSync(scenarioPath)) {
    fail("scenarios file missing: config/texas/principles-ii-scenarios.mjs");
  } else {
    const sc = await import("../config/texas/principles-ii-scenarios.mjs");
    const list = sc.SCENARIOS || [];
    if (list.length < MIN_SCENARIOS) fail(`scenarios: ${list.length} authored; the rule requires at least ${MIN_SCENARIOS} for a 30-hour course`);
    const seenScenario = new Set();
    const placements = new Set();
    for (const s of list) {
      if (seenScenario.has(s.id)) fail(`scenarios: duplicate id ${s.id}`);
      seenScenario.add(s.id);
      if (!Array.isArray(s.tasks) || s.tasks.length < 3) fail(`scenario ${s.id}: needs at least three gradeable tasks`);
      if (!(s.passingScore > 0 && s.passingScore <= 1)) fail(`scenario ${s.id}: passingScore ${s.passingScore} is not a fraction`);
      for (const t of s.assessesTopics || []) if (!TOPICS.includes(t)) fail(`scenario ${s.id}: unknown topic ${t}`);
      for (const u of s.assessesUnits || []) if (!UNITS.has(u)) fail(`scenario ${s.id}: unknown unit ${u}`);
      if (s.placement?.afterTopic) placements.add(s.placement.afterTopic);
      for (const t of s.tasks || []) {
        scenarioPrompts.push({ id: t.id, tok: tokens(t.prompt) });
        if (t.remediation && !anchorResolves(t.remediation)) fail(`scenario task ${t.id}: remediation ${t.remediation} does not resolve to a unit heading`);
        /* The rule the work order is explicit about: mastery is never measured by length. */
        const lengthy = JSON.stringify(t).match(/minWords|minLength|minCharacters|wordCount|characterCount|at least \d+ (?:words|characters)/i);
        if (lengthy) fail(`scenario task ${t.id}: appears to impose a length requirement (${lengthy[0]}) — mastery may not be measured by how much is typed`);
        if (t.type === "selection" && t.correctChoice !== 0) fail(`scenario task ${t.id}: selection tasks author the correct answer first`);
        if (t.type === "computation" && (t.expected === undefined || t.tolerance === undefined)) fail(`scenario task ${t.id}: computation needs expected and tolerance`);
        if (t.type === "short-answer" && (!Array.isArray(t.rubric) || t.rubric.length === 0)) fail(`scenario task ${t.id}: short answer needs a checkable rubric`);
      }
    }
    /* Distributed across the course, not stacked at the end. */
    if (placements.size < Math.min(MIN_SCENARIOS, list.length)) {
      fail(`scenarios: placed at only ${placements.size} distinct points (${[...placements].join(", ")}) — they must be distributed across materially different parts of the course`);
    }
    notes.push(`scenarios: ${list.length}, placed after ${[...placements].sort().join(", ")}`);
  }

  /* ── final exam bank ──────────────────────────────────────────────────────────────────────── */
  const bankPath = path.join(root, "config/texas/principles-ii-final-exam-bank.mjs");
  const formsPath = path.join(root, "config/texas/principles-ii-final-exam-forms.mjs");
  if (!fs.existsSync(bankPath)) { fail("final exam bank missing: config/texas/principles-ii-final-exam-bank.mjs"); }
  else {
    const bank = await import("../config/texas/principles-ii-final-exam-bank.mjs");
    const items = bank.ITEMS || bank.BANK || [];
    if (items.length < MIN_BANK) fail(`final bank holds ${items.length} items; the rule requires at least ${MIN_BANK}`);
    notes.push(`final bank: ${items.length} items`);

    const byTopic = {};
    const ids = new Set();
    const prompts = [];
    for (const it of items) {
      if (ids.has(it.id)) fail(`final bank: duplicate id ${it.id}`);
      ids.add(it.id);
      byTopic[it.topic] = (byTopic[it.topic] || 0) + 1;
      if (!TOPICS.includes(it.topic)) fail(`final bank: ${it.id} names unknown topic ${it.topic}`);
      if (it.unit && !UNITS.has(it.unit)) fail(`final bank: ${it.id} names unknown unit ${it.unit}`);
      if (!Array.isArray(it.choices) || it.choices.length !== 4) fail(`final bank: ${it.id} must offer four choices`);
      if (it.correctChoice !== 0) fail(`final bank: ${it.id} must author the correct answer first`);
      if (!it.rationale || String(it.rationale).length < 40) fail(`final bank: ${it.id} lacks an answer-key rationale`);
      if (!anchorResolves(it.teaches)) fail(`final bank: ${it.id} teaches-anchor ${it.teaches} does not resolve to a unit heading in the frozen curriculum`);
      const choiceSet = (it.choices || []).map((c) => String(c).trim().toLowerCase());
      if (new Set(choiceSet).size !== choiceSet.length) fail(`final bank: ${it.id} has duplicate choices`);
      if (choiceSet.length === 2 || choiceSet.every((c) => /^(true|false)\.?$/.test(c))) fail(`final bank: ${it.id} is a true/false item`);
      /* Two choices that are near-identical give the item two defensible answers. */
      for (let a = 0; a < choiceSet.length; a += 1) {
        for (let b = a + 1; b < choiceSet.length; b += 1) {
          if (jaccard(tokens(choiceSet[a]), tokens(choiceSet[b])) > 0.9) {
            fail(`final bank: ${it.id} choices ${a} and ${b} are near-identical — the item has two defensible answers`);
          }
        }
      }
      prompts.push({ id: it.id, tok: tokens(it.prompt), raw: String(it.prompt).trim().toLowerCase() });
    }
    for (const t of TOPICS) if (!byTopic[t]) fail(`final bank: topic ${t} has no items`);
    notes.push(`per-topic: ${TOPICS.map((t) => `${t}:${byTopic[t] || 0}`).join(" ")}`);

    /* exact duplicates */
    const rawSeen = new Map();
    for (const p of prompts) {
      if (rawSeen.has(p.raw)) fail(`final bank: ${p.id} is an EXACT duplicate of ${rawSeen.get(p.raw)}`);
      else rawSeen.set(p.raw, p.id);
    }
    /* near duplicates within the bank */
    let nearPairs = 0;
    for (let i = 0; i < prompts.length; i += 1) {
      for (let j = i + 1; j < prompts.length; j += 1) {
        const s = jaccard(prompts[i].tok, prompts[j].tok);
        if (s >= NEAR_DUP) { nearPairs += 1; if (nearPairs <= 10) fail(`final bank: ${prompts[i].id} and ${prompts[j].id} are near-duplicates (similarity ${s.toFixed(2)})`); }
      }
    }
    if (nearPairs > 10) fail(`final bank: ${nearPairs} near-duplicate pairs in total`);

    /* separation from the formative instruments */
    let leaks = 0;
    for (const p of prompts) {
      for (const q of [...formativePrompts, ...scenarioPrompts]) {
        const s = jaccard(p.tok, q.tok);
        if (s >= CROSS_BANK) { leaks += 1; if (leaks <= 10) fail(`separation: final item ${p.id} reuses formative/scenario item ${q.id} (similarity ${s.toFixed(2)})`); }
      }
    }
    if (leaks > 10) fail(`separation: ${leaks} final items overlap the formative instruments`);
    if (!leaks) notes.push("separation: no final item resembles a topic-quiz, replacement or scenario prompt");

    /* ── versions ───────────────────────────────────────────────────────────────────────────── */
    if (!fs.existsSync(formsPath)) fail("final exam forms missing: config/texas/principles-ii-final-exam-forms.mjs");
    else {
      const forms = await import("../config/texas/principles-ii-final-exam-forms.mjs");
      const versions = forms.FORMS || forms.VERSIONS || [];
      if (versions.length < MIN_VERSIONS) fail(`only ${versions.length} examination versions; the rule requires ${MIN_VERSIONS}`);
      const byId = new Map(items.map((i) => [i.id, i]));
      for (const v of versions) {
        const list = v.itemIds || v.items || [];
        if (list.length < MIN_VERSION) fail(`version ${v.id} holds ${list.length} items; the rule requires at least ${MIN_VERSION}`);
        if (new Set(list).size !== list.length) fail(`version ${v.id} repeats an item`);
        const covered = new Set();
        for (const id of list) {
          const it = byId.get(id);
          if (!it) { fail(`version ${v.id} references ${id}, which is not in the bank`); continue; }
          covered.add(it.topic);
        }
        for (const t of TOPICS) if (!covered.has(t)) fail(`version ${v.id} does not cover topic ${t}`);
      }
      /* pairwise overlap */
      for (let i = 0; i < versions.length; i += 1) {
        for (let j = i + 1; j < versions.length; j += 1) {
          const A = new Set(versions[i].itemIds || versions[i].items || []);
          const B = new Set(versions[j].itemIds || versions[j].items || []);
          let shared = 0;
          for (const id of A) if (B.has(id)) shared += 1;
          const frac = shared / Math.min(A.size, B.size);
          if (frac > MAX_OVERLAP + 1e-9) {
            fail(`versions ${versions[i].id}/${versions[j].id} overlap ${shared} items = ${(frac * 100).toFixed(1)}%, above the ${(MAX_OVERLAP * 100).toFixed(1)}% cap`);
          }
        }
      }
      notes.push(`versions: ${versions.map((v) => `${v.id}:${(v.itemIds || v.items || []).length}`).join(" ")}`);
    }
  }

  /* ── confidentiality: nothing student-facing may carry the secure bank ─────────────────────── */
  for (const dir of ["public", "dist"]) {
    const full = path.join(root, dir);
    if (!fs.existsSync(full)) continue;
    const hits = [];
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(mjs|js|json|html)$/.test(e.name)) {
          const txt = fs.readFileSync(p, "utf8");
          if (txt.includes("principles-ii-final-exam-bank") || /PRINS2-F\d{3}/.test(txt)) hits.push(path.relative(root, p));
        }
      }
    };
    walk(full);
    for (const h of hits) fail(`CONFIDENTIALITY: secure final-exam content is reachable from a student-facing path: ${h}`);
  }

  console.log("TX Principles II — assessment validation");
  for (const n of notes) console.log(`  ${n}`);
  if (failures.length) {
    console.log(`\nFAILURES (${failures.length}):`);
    for (const f of failures) console.log(`  - ${f}`);
    process.exitCode = 1;
  } else {
    console.log("\nOK — every assessment requirement checked here is satisfied.");
  }
}

await main();
