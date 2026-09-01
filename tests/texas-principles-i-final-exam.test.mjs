import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { FINAL_EXAM_BANK, BLUEPRINT } from "../config/texas/principles-i-final-exam-bank.mjs";
import { FORMS, ADMINISTRATION } from "../config/texas/principles-i-final-exam-forms.mjs";
import { TOPICS, ALL_UNITS } from "../config/texas/prins1-course-form.mjs";
import { UNIT_TRACE } from "../config/texas/principles-i-course.mjs";
import { TOPIC_QUIZZES } from "../config/texas/principles-i-question-bank.mjs";
import {
  assertExamAdministrationAllowed,
  formForAttempt,
  scoreResponses,
} from "../lib/texas-principles-i-exam-engine.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

/* ── the bank ────────────────────────────────────────────────────────────────────────── */

test("the bank holds exactly 120 items, each traced to a real PRINS1-1 unit", () => {
  assert.equal(FINAL_EXAM_BANK.length, 120);
  const units = new Set(ALL_UNITS.map((u) => u.code));
  for (const item of FINAL_EXAM_BANK) {
    assert.ok(units.has(item.tests), `${item.id} tests unknown unit ${item.tests}`);
    assert.equal(item.choices.length, 4, item.id);
    assert.equal(item.correctChoice, 0, `${item.id} must author the correct answer first`);
    assert.ok(item.rationale.length > 40, `${item.id} rationale too thin to review`);
  }
});

test("the blueprint covers every unit at least once and follows the form's minutes", () => {
  for (const unit of ALL_UNITS) {
    assert.ok(BLUEPRINT[unit.code] >= 1, `${unit.code} has no blueprint allocation`);
  }
  /* Topic allocations track prescribed minutes: about one item per 12.5 minutes, so a topic's
     item count must sit within one item of minutes * 120 / 1500. */
  for (const topic of TOPICS) {
    const items = topic.units.reduce((sum, u) => sum + BLUEPRINT[u.code], 0);
    const exact = (topic.subtotalMinutes * 120) / 1500;
    assert.ok(Math.abs(items - exact) <= 1, `${topic.code}: ${items} items against ${exact.toFixed(1)} by minutes`);
  }
});

test("every item's unit has a traced source chain or a stated no-statute reason", () => {
  const trace = new Map(UNIT_TRACE.map((t) => [t.code, t]));
  for (const item of FINAL_EXAM_BANK) {
    const unit = trace.get(item.tests);
    assert.ok(unit, `${item.id}: no trace row for ${item.tests}`);
    assert.ok(unit.sources.length > 0 || unit.noStatuteRequired, `${item.id}: unit ${item.tests} has neither read sources nor a stated reason`);
  }
});

test("no formative item was promoted verbatim into the final bank", () => {
  const formativePrompts = new Set();
  for (const quizzes of Object.values(TOPIC_QUIZZES)) {
    for (const quiz of quizzes) {
      formativePrompts.add(quiz.prompt);
      formativePrompts.add(quiz.replacement.prompt);
    }
  }
  for (const item of FINAL_EXAM_BANK) {
    assert.ok(!formativePrompts.has(item.prompt), `${item.id} duplicates a formative prompt verbatim`);
  }
});

/* ── the forms ───────────────────────────────────────────────────────────────────────── */

test("four forms of 60, every item on exactly two, every pair overlapping in exactly 20", () => {
  const forms = Object.keys(FORMS);
  assert.equal(forms.length, 4);
  const appearances = new Map();
  for (const form of forms) {
    assert.equal(FORMS[form].length, 60, form);
    for (const id of FORMS[form]) appearances.set(id, (appearances.get(id) ?? 0) + 1);
  }
  for (const item of FINAL_EXAM_BANK) assert.equal(appearances.get(item.id), 2, item.id);
  for (let a = 0; a < forms.length; a += 1) {
    for (let b = a + 1; b < forms.length; b += 1) {
      const setA = new Set(FORMS[forms[a]]);
      const overlap = FORMS[forms[b]].filter((id) => setA.has(id)).length;
      assert.equal(overlap, 20, `${forms[a]}/${forms[b]}`);
    }
  }
});

test("every form examines every PRINS1-1 topic", () => {
  const byId = new Map(FINAL_EXAM_BANK.map((i) => [i.id, i]));
  for (const [form, ids] of Object.entries(FORMS)) {
    const covered = new Set(ids.map((id) => byId.get(id).tests.slice(0, 3)));
    for (const topic of TOPICS) assert.ok(covered.has(topic.code), `${form} misses ${topic.code}`);
  }
});

/* ── administration stays blocked, and honestly labelled ─────────────────────────────── */

test("administration parameters are provider proposals and the gate refuses to administer", () => {
  assert.equal(ADMINISTRATION.label, "PROVIDER_PROPOSED_PENDING_TAC_CONFIRMATION");
  assert.equal(ADMINISTRATION.examReady, "BLOCKED_TX_PROVIDER_RULE_SOURCE_LOCK");
  assert.throws(() => assertExamAdministrationAllowed(), /texas_final_exam_not_administrable/);
  const formsSource = read("config/texas/principles-i-final-exam-forms.mjs");
  assert.doesNotMatch(formsSource, /TREC (requires|mandates|approved)/i);
});

test("the rotation serves a different form per attempt, within the proposed attempt cap", () => {
  assert.equal(formForAttempt(1), "A");
  assert.equal(formForAttempt(2), "B");
  assert.notEqual(formForAttempt(1), formForAttempt(2));
  assert.equal(formForAttempt(0), null);
});

/* ── scoring ─────────────────────────────────────────────────────────────────────────── */

test("scoring is server-side, treats unanswered as incorrect nulls, and computes honestly", () => {
  const empty = scoreResponses("A", {});
  assert.equal(empty.questionCount, 60);
  assert.equal(empty.correct, 0);
  assert.equal(empty.answered, 0);
  assert.equal(empty.passed, false);
  assert.ok(empty.detail.every((d) => d.selectedChoice === null && d.correct === false));
  assert.equal(scoreResponses("Z", {}), null);
});

test("a perfect answer set derived from the permutation scores 100", () => {
  /* Recompute the permutation exactly as the engine does, prove scoring round-trips. */
  const hashKey = (value) => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); }
    return hash >>> 0;
  };
  const permute = (choices, correctChoice, key) => {
    const order = choices.map((_, i) => i);
    let seed = hashKey(key) || 1;
    for (let i = order.length - 1; i > 0; i -= 1) {
      seed = (Math.imul(seed, 48271) + 11) >>> 0;
      const swap = seed % (i + 1);
      [order[i], order[swap]] = [order[swap], order[i]];
    }
    return order.indexOf(correctChoice);
  };
  const byId = new Map(FINAL_EXAM_BANK.map((i) => [i.id, i]));
  const answers = Object.fromEntries(
    FORMS.B.map((id) => [id, permute(byId.get(id).choices, 0, `tx-prins1-final:${id}`)]),
  );
  const result = scoreResponses("B", answers);
  assert.equal(result.correct, 60);
  assert.equal(result.percent, 100);
  assert.equal(result.passed, true);
});

/* ── security: the key never reaches a student surface ───────────────────────────────── */

test("no public or student-served file imports the final bank, and the build greps stay armed", () => {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
  const offenders = walk(path.join(ROOT, "public")).filter((file) => {
    if (!/\.(mjs|js|html)$/.test(file)) return false;
    const body = fs.readFileSync(file, "utf8");
    return body.includes("principles-i-final-exam-bank") || body.includes("principles-i-final-exam-forms");
  });
  assert.deepEqual(offenders, [], "a student-served file references the final exam bank");
  const build = read("site/build.sh");
  assert.match(build, /final-exam-bank\|answer-key/);
  assert.match(build, /correctChoice/);
});

test("the mutation is caught: a bank breaking its blueprint refuses to load", async () => {
  const source = read("config/texas/principles-i-final-exam-bank.mjs");
  const scratchDir = fs.mkdtempSync(path.join(ROOT, "node_modules/.tx1b-mutation-"));
  try {
    fs.mkdirSync(path.join(scratchDir, "config/texas"), { recursive: true });
    for (const dep of ["prins1-course-form.mjs", "statute-sources.mjs"]) {
      fs.copyFileSync(path.join(ROOT, "config/texas", dep), path.join(scratchDir, "config/texas", dep));
    }
    /* Retarget one item's unit so a unit count breaks its blueprint allocation. */
    const mutated = source.replace('item("FX001", "T01U1",', 'item("FX001", "T01U2",');
    assert.notEqual(mutated, source);
    const target = path.join(scratchDir, "config/texas/principles-i-final-exam-bank.mjs");
    fs.writeFileSync(target, mutated);
    await assert.rejects(import(target), /against a blueprint of/);
  } finally {
    fs.rmSync(scratchDir, { recursive: true, force: true });
  }
});
