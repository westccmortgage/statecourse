/**
 * Texas Law of Agency — compliance and integrity tests.
 *
 * These assert the properties a reviewer would otherwise have to take on trust: that the LOA-1
 * outline transcription reconciles to the form's own arithmetic, that the frozen curriculum still
 * hashes to what the current content freeze recorded, that the generated block maps still tile
 * every module exactly, that every one of the 57 units carries a learning objective, and — the ones
 * that matter most — that nothing in this build claims an approval it does not have.
 *
 * The content freeze is the anchor. Every module's sha256 was recorded at the freeze, and a test
 * here compares the live files against it, so an edit to the curriculum invalidates the freeze
 * loudly instead of leaving generated artifacts quietly describing text that changed underneath
 * them. Written in the spirit of tests/texas-principles-ii.test.mjs; the shapes differ where the
 * artifacts differ (the LOA freeze records modules at the top level, keyed by path rather than by
 * file name, and this course has no question bank and no examination yet).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { FORM, TOPICS, ALL_UNITS } from "../config/texas/law-of-agency-course-form.mjs";
import { COURSE, MODULES, UNIT_OBJECTIVES, UNIT_TRACE } from "../config/texas/law-of-agency-course.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOME = path.join(root, "texas/tx-law-of-agency-30-v1");
const CURRICULUM = path.join(HOME, "curriculum");
const FREEZE = JSON.parse(fs.readFileSync(path.join(HOME, "content-freeze.json"), "utf8"));

const moduleText = (file) => fs.readFileSync(path.join(CURRICULUM, file), "utf8");

/* Modules whose frozen text closes with a "## Optional reference:" section. Named here rather than
   computed, so that a module gaining or losing one is a failing test and a deliberate edit to this
   list, not a silent change in what students are required to read. */
const MODULES_WITH_OPTIONAL_REFERENCE = Object.freeze([2, 3, 7, 9, 10, 11, 12]);

/* ── the outline ─────────────────────────────────────────────────────────────────────────────── */

test("LOA-1 transcription reconciles to the form's own printed arithmetic", () => {
  for (const topic of TOPICS) {
    const sum = topic.units.reduce((n, u) => n + u.minutes, 0);
    assert.equal(sum, topic.subtotalMinutes, `${topic.code} units total ${sum} against printed subtotal ${topic.subtotalMinutes}`);
  }
  const grand = TOPICS.reduce((n, t) => n + t.subtotalMinutes, 0);
  assert.equal(grand, FORM.totalMinutes, "topic subtotals must reach the form's printed TOTAL MINUTES");
  assert.equal(FORM.totalMinutes, FORM.courseHours * FORM.minutesPerCreditHour);
  assert.equal(FORM.formNumber, "LOA-1");
  assert.equal(TOPICS.length, 12);
  assert.equal(ALL_UNITS.length, 57);
});

test("the course record carries twelve modules and fifty-seven units, in the form's order", () => {
  assert.equal(MODULES.length, 12);
  assert.equal(UNIT_TRACE.length, 57);
  assert.deepEqual(MODULES.map((m) => m.topicCode), TOPICS.map((t) => t.code));
  assert.deepEqual(MODULES.map((m) => m.units), TOPICS.map((t) => t.units.length));
  assert.equal(MODULES.reduce((n, m) => n + m.units, 0), 57);
  /* module-01.md … module-12.md, zero-padded, matching what the freeze recorded. */
  assert.deepEqual(MODULES.map((m) => m.file), FREEZE.modules.map((m) => path.basename(m.path)));
});

/* ── the freeze ──────────────────────────────────────────────────────────────────────────────── */

test("the frozen curriculum still hashes to what the current content freeze recorded", () => {
  assert.match(FREEZE.freezeId, /^LOA-CONTENT-FREEZE-\d{4}-\d{2}-\d{2}(-v\d+)?$/, "the freeze id must name this course and carry a date, and a re-freeze must bump its version rather than reusing an id");
  assert.equal(FREEZE.freezeId, COURSE.contentFreeze);
  assert.equal(FREEZE.modules.length, 12);
  const drift = [];
  for (const m of FREEZE.modules) {
    const buf = fs.readFileSync(path.join(root, m.path));
    const sha = crypto.createHash("sha256").update(buf).digest("hex");
    if (sha !== m.sha256 || buf.length !== m.bytes) drift.push(m.path);
  }
  assert.deepEqual(drift, [], "curriculum edited since the content freeze — every generated artifact must be regenerated and the freeze re-established");
});

test("each module carries exactly the units its LOA-1 topic prescribes", () => {
  for (const [index, topic] of TOPICS.entries()) {
    const file = MODULES[index].file;
    const count = (moduleText(file).match(/^## Unit: /gm) || []).length;
    assert.equal(count, topic.units.length, `${file} has ${count} units, ${topic.code} prescribes ${topic.units.length}`);
  }
});

test("every module has exactly one recap and the generator's heading shape", () => {
  for (const m of MODULES) {
    const txt = moduleText(m.file);
    assert.equal((txt.match(/^### Module recap/gm) || []).length, 1, `${m.file} must have exactly one module recap`);
    assert.equal((txt.match(/^## TREC Topic: /gm) || []).length, 1, `${m.file} must have exactly one TREC Topic front matter`);
    assert.ok((txt.match(/^## Optional reference: /gm) || []).length <= 1, `${m.file} may close with at most one optional reference section`);
  }
});

/* ── learning objectives ─────────────────────────────────────────────────────────────────────── */

test("every LOA-1 unit has a learning objective, and no objective belongs to a unit that does not exist", () => {
  const codes = new Set(ALL_UNITS.map((u) => u.code));
  const missing = ALL_UNITS.filter((u) => !UNIT_OBJECTIVES[u.code]).map((u) => u.code);
  assert.deepEqual(missing, [], "a unit without an objective is a unit nobody can write an assessment item against");
  const stray = Object.keys(UNIT_OBJECTIVES).filter((code) => !codes.has(code));
  assert.deepEqual(stray, [], "an objective keyed to something that is not an LOA-1 unit");
  assert.equal(Object.keys(UNIT_OBJECTIVES).length, 57);
});

test("each objective is a distinct, measurable capability rather than a restated unit title", () => {
  const seen = new Map();
  for (const trace of UNIT_TRACE) {
    const objective = trace.objective;
    assert.ok(objective.length > 80, `${trace.code}: objective is too thin to assess against`);
    /* Starts with a verb naming an observable act, not "Understand"/"Know"/"Be aware", which no
       reviewer can mark. */
    assert.match(objective, /^[A-Z][a-z]+/, `${trace.code}: objective must open with a verb`);
    assert.doesNotMatch(objective, /^(Understand|Know|Be aware|Appreciate|Learn|Familiaris|Familiariz)/i,
      `${trace.code}: "${objective.slice(0, 40)}…" states a state of mind, not a capability`);
    assert.notEqual(objective.trim().toLowerCase(), trace.unit.trim().toLowerCase(), `${trace.code}: objective merely repeats the unit title`);
    const prior = seen.get(objective);
    assert.equal(prior, undefined, `${trace.code} and ${prior} share an objective; each must be written for its own unit`);
    seen.set(objective, trace.code);
  }
});

/* ── block delivery ──────────────────────────────────────────────────────────────────────────── */

test("block-map screen ranges tile every frozen module exactly", async () => {
  let blocks = 0, screens = 0;
  for (let n = 1; n <= 12; n += 1) {
    const nn = String(n).padStart(2, "0");
    const mod = await import(`../config/texas/law-of-agency-module-${n}-blocks.mjs`);
    const delivery = mod.default;
    assert.equal(delivery.courseId, "tx-law-of-agency-30-v1");
    assert.equal(delivery.moduleId, `module-${nn}`);
    const lines = moduleText(`module-${nn}.md`).replace(/\r/g, "").split("\n");
    const index = (h) => (h === "^" ? 0 : h === "$" ? lines.length : lines.findIndex((l) => l.trim() === h));
    const ranges = [];
    for (const b of delivery.blocks) for (const s of b.screens) if (s.content) ranges.push({ id: s.id, ...s.content });
    const placed = ranges.map((r) => ({ id: r.id, start: index(r.from), end: index(r.to) })).sort((a, b) => a.start - b.start);
    assert.ok(placed.length > 0, `module ${nn} has no content ranges`);
    assert.ok(!placed.some((p) => p.start < 0 || p.end < 0), `module ${nn} references a heading that does not exist`);
    assert.equal(placed[0].start, 0, `module ${nn} coverage does not start at the top of the file`);
    for (let i = 1; i < placed.length; i += 1) {
      assert.equal(placed[i].start, placed[i - 1].end, `module ${nn}: gap or overlap between ${placed[i - 1].id} and ${placed[i].id}`);
    }
    assert.equal(placed[placed.length - 1].end, lines.length, `module ${nn} coverage stops before end of file`);
    blocks += delivery.blocks.length;
    screens += delivery.blocks.reduce((a, b) => a + b.screens.length, 0);
  }
  assert.equal(blocks, 76);
  assert.equal(screens, 177);
});

test("one block per unit plus a recap, each carrying its unit's objective and one retrieval screen", async () => {
  for (const [i, topic] of TOPICS.entries()) {
    const mod = await import(`../config/texas/law-of-agency-module-${i + 1}-blocks.mjs`);
    const delivery = mod.default;
    const unitBlocks = delivery.blocks.filter((b) => b.code);
    assert.deepEqual(unitBlocks.map((b) => b.code), topic.units.map((u) => u.code), `${topic.code}: block codes must be the form's unit codes in order`);
    for (const block of unitBlocks) {
      assert.equal(block.id, block.code.toLowerCase());
      assert.equal(block.required, true);
      assert.equal(block.learningObjective, UNIT_OBJECTIVES[block.code], `${block.code}: the generated objective must be the one held in the course record`);
      const retrieval = block.screens.filter((s) => s.type === "retrieval");
      assert.equal(retrieval.length, 1, `${block.code} needs exactly one retrieval screen`);
      assert.equal(retrieval[0].questionId, `${block.id}-q1`);
      assert.equal(block.screens.filter((s) => s.type === "instruction").length, 1, `${block.code} needs exactly one instruction screen`);
      block.screens.forEach((screen, index) => assert.equal(screen.sequence, index + 1, `${block.id} screen sequence must be 1..n`));
    }
    const recaps = delivery.blocks.filter((b) => b.title === "Module recap");
    assert.equal(recaps.length, 1, `module ${i + 1} needs exactly one recap block`);
    assert.equal(recaps[0].screens.length, 1);
    assert.equal(recaps[0].screens[0].type, "review");
    delivery.blocks.forEach((block, index) => assert.equal(block.sequence, index + 1, `module ${i + 1} block sequence must be 1..n`));
  }
});

test("an optional reference section becomes its own non-blocking block, never part of the recap", async () => {
  const withOptional = [];
  for (let n = 1; n <= 12; n += 1) {
    const nn = String(n).padStart(2, "0");
    const mod = await import(`../config/texas/law-of-agency-module-${n}-blocks.mjs`);
    const delivery = mod.default;
    const optional = delivery.blocks.filter((b) => b.optional);
    const hasSection = /^## Optional reference: /m.test(moduleText(`module-${nn}.md`));
    assert.equal(optional.length, hasSection ? 1 : 0, `module ${nn}: one optional block per optional reference section`);
    const recap = delivery.blocks.find((b) => b.title === "Module recap");
    if (!hasSection) {
      assert.equal(recap.screens[0].content.to, "$", `module ${nn}: with no optional section the recap must run to end of file`);
      continue;
    }
    withOptional.push(n);
    const block = optional[0];
    assert.equal(block.required, false, `module ${nn}: optional reference work may not be required`);
    assert.equal(block.nonBlocking, true, `module ${nn}: progression may not be gated on optional work`);
    assert.equal(block.excludedFromRequiredTime, true, `module ${nn}: optional minutes may not count toward required time`);
    assert.equal(block.noAssessmentMayDependOnThis, true, `module ${nn}: no assessment item may depend on optional work`);
    assert.equal(block.screens.length, 1);
    assert.equal(block.screens[0].type, "optional-reference");
    assert.equal(block.screens[0].content.to, "$");
    assert.ok(!block.screens.some((s) => s.type === "retrieval"), `module ${nn}: an optional block may carry no retrieval screen`);
    assert.equal(block.sequence, delivery.blocks.length, `module ${nn}: the optional block must be last`);
    assert.equal(recap.screens[0].content.to, block.screens[0].content.from,
      `module ${nn}: the recap must stop at the optional section, or it delivers optional material as required review`);
  }
  assert.deepEqual(withOptional, [...MODULES_WITH_OPTIONAL_REFERENCE]);
});

/* ── nothing enrolling, nothing charging, nothing approved ───────────────────────────────────── */

test("Law of Agency claims no approval and enables nothing downstream of content", () => {
  assert.equal(COURSE.trecApprovalStatus, "NOT_SUBMITTED_NOT_APPROVED");
  assert.equal(COURSE.enrollmentEnabled, false);
  assert.equal(COURSE.paymentEnabled, false);
  assert.equal(COURSE.creditReportingEnabled, false);
  assert.equal(COURSE.certificateIssuanceEnabled, false);
  assert.equal(COURSE.finalExaminationExists, false);
  assert.equal(COURSE.finalExaminationAdministrable, false);
  assert.match(FREEZE.notApproved, /holds no TREC approval/i);
});

test("Law of Agency is its own 30-hour course, not part of Principles I or II", () => {
  assert.equal(COURSE.courseId, "tx-law-of-agency-30-v1");
  assert.equal(COURSE.hours, 30);
  assert.equal(COURSE.totalMinutes, 1500);
  assert.equal(COURSE.approvalForm, "LOA-1");
  assert.notEqual(COURSE.courseId, "tx-principles-real-estate-i-30-v1");
  assert.notEqual(COURSE.courseId, "tx-principles-real-estate-ii-30-v1");
});

test("no authored Law of Agency text claims TREC approval or available Texas credit", () => {
  /* The phrase alone is not the offence — the course is REQUIRED to say it is not TREC-approved,
     and that sentence necessarily contains "TREC-approved". What matters is whether the phrase is
     asserted or denied, so a match preceded by a negation inside the same clause is the disclaimer
     doing its job. Anything else is a claim this build cannot support. */
  const claimish = /\b(TREC[- ]approved|approved by TREC|TREC approval number|Texas credit is available|earn Texas credit|counts toward your Texas licen[cs]e)\b/gi;
  const negated = (text, at) => /\b(not|no|never|cannot|is not|does not|without)\b[^.]{0,80}$/i.test(text.slice(Math.max(0, at - 90), at));
  const offenders = [];
  const scan = (label, text) => {
    for (const m of String(text).matchAll(claimish)) {
      if (!negated(String(text), m.index)) offenders.push(`${label}: ${m[0]}`);
    }
  };
  for (const m of MODULES) scan(m.file, moduleText(m.file));
  for (const trace of UNIT_TRACE) scan(trace.code, trace.objective);
  scan("course record", fs.readFileSync(path.join(root, "config/texas/law-of-agency-course.mjs"), "utf8"));
  scan("generator", fs.readFileSync(path.join(root, "scripts/generate-tx-law-of-agency-block-maps.mjs"), "utf8"));
  for (let n = 1; n <= 12; n += 1) {
    scan(`module-${n}-blocks`, fs.readFileSync(path.join(root, `config/texas/law-of-agency-module-${n}-blocks.mjs`), "utf8"));
  }
  assert.deepEqual(offenders, [], "no course text may claim an approval this build does not have");
});

test("the negation-aware scan would still catch a bare claim", () => {
  /* A test whose only failure mode is silence is not a test. This proves the scanner above
     distinguishes the required disclaimer from an actual claim, rather than passing because the
     pattern never matches anything. */
  const claimish = /\b(TREC[- ]approved|approved by TREC)\b/gi;
  const negated = (text, at) => /\b(not|no|never|cannot|is not|does not|without)\b[^.]{0,80}$/i.test(text.slice(Math.max(0, at - 90), at));
  const hits = (text) => [...String(text).matchAll(claimish)].filter((m) => !negated(String(text), m.index)).length;
  assert.equal(hits("This is not a TREC-approved course."), 0);
  assert.equal(hits("StateCourse holds no TREC approval, and this is not a TREC-approved course."), 0);
  assert.equal(hits("This is a TREC-approved course."), 1);
  assert.equal(hits("Our curriculum was approved by TREC in 2026."), 1);
});
