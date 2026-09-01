/**
 * Texas Principles of Real Estate II — compliance and integrity tests.
 *
 * These assert the properties a reviewer would otherwise have to take on trust: that the outline
 * transcription reconciles to the form's own arithmetic, that the block maps still tile the frozen
 * curriculum exactly, that every quiz item points at instruction that exists, that the hours claim
 * still matches the files on disk, and — the ones that matter most — that nothing in this build
 * claims an approval it does not have.
 *
 * The content freeze is the anchor. Every module's sha256 was recorded at
 * PRINS2-CONTENT-FREEZE-2026-08-29, and a test here compares the live files against it, so an edit
 * to the curriculum invalidates the freeze loudly instead of leaving generated artifacts quietly
 * describing text that changed underneath them.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { FORM, TOPICS, ALL_UNITS } from "../config/texas/principles-ii-course-form.mjs";
import { COURSE, MODULES, UNIT_TRACE, TIME_MODEL, instructionalMinutes } from "../config/texas/principles-ii-course.mjs";
import { TOPIC_QUIZZES, allItems, PRIMARY_COUNT, REPLACEMENT_COUNT } from "../config/texas/principles-ii-question-bank.mjs";
import { ASSESSMENT_REQUIREMENTS } from "../config/texas/trec-rules-source-lock.mjs";
import * as register from "../config/texas/principles-ii-statute-sources.mjs";

const ALL_ITEMS = allItems();

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CURRICULUM = path.join(root, "texas/tx-principles-real-estate-ii-30-v1/curriculum");
const FREEZE = JSON.parse(fs.readFileSync(path.join(root, "texas/tx-principles-real-estate-ii-30-v1/content-freeze.json"), "utf8"));

const moduleText = (file) => fs.readFileSync(path.join(CURRICULUM, file), "utf8");
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9 &-]/g, "").replace(/&/g, "").replace(/ /g, "-");

/* ── the outline ─────────────────────────────────────────────────────────────────────────────── */

test("PRINS2-1 transcription reconciles to the form's own printed arithmetic", () => {
  for (const topic of TOPICS) {
    const sum = topic.units.reduce((n, u) => n + u.minutes, 0);
    assert.equal(sum, topic.subtotalMinutes, `${topic.code} units total ${sum} against printed subtotal ${topic.subtotalMinutes}`);
  }
  const grand = TOPICS.reduce((n, t) => n + t.subtotalMinutes, 0);
  assert.equal(grand, FORM.totalMinutes, "topic subtotals must reach the form's printed TOTAL MINUTES");
  assert.equal(FORM.totalMinutes, FORM.courseHours * FORM.minutesPerCreditHour);
  assert.equal(TOPICS.length, 9);
  assert.equal(ALL_UNITS.length, 44);
});

/* ── the freeze ──────────────────────────────────────────────────────────────────────────────── */

test("the frozen curriculum still hashes to what the freeze recorded", () => {
  const drift = [];
  for (const m of FREEZE.curriculum.modules) {
    const buf = fs.readFileSync(path.join(CURRICULUM, m.file));
    const sha = crypto.createHash("sha256").update(buf).digest("hex");
    if (sha !== m.sha256) drift.push(m.file);
  }
  assert.deepEqual(drift, [], "curriculum edited since the content freeze — every generated artifact must be regenerated and the freeze re-established");
});

test("each module carries exactly the units its PRINS2-1 topic prescribes", () => {
  for (const [index, topic] of TOPICS.entries()) {
    const file = `module-0${index + 1}.md`;
    const count = (moduleText(file).match(/^## Unit: /gm) || []).length;
    assert.equal(count, topic.units.length, `${file} has ${count} units, ${topic.code} prescribes ${topic.units.length}`);
  }
});

test("every module has exactly one recap and the generator's heading shape", () => {
  for (const m of MODULES) {
    const txt = moduleText(m.file);
    assert.equal((txt.match(/^### Module recap/gm) || []).length, 1, `${m.file} must have exactly one module recap`);
    assert.equal((txt.match(/^## TREC Topic: /gm) || []).length, 1, `${m.file} must have exactly one TREC Topic front matter`);
  }
});

/* ── block delivery ──────────────────────────────────────────────────────────────────────────── */

test("block-map screen ranges tile every frozen module exactly", async () => {
  let blocks = 0, screens = 0;
  for (let n = 1; n <= 9; n += 1) {
    const mod = await import(`../config/texas/principles-ii-module-${n}-blocks.mjs`);
    const delivery = Object.values(mod)[0];
    const lines = moduleText(`module-0${n}.md`).replace(/\r/g, "").split("\n");
    const index = (h) => (h === "^" ? 0 : h === "$" ? lines.length : lines.findIndex((l) => l.trim() === h));
    const ranges = [];
    for (const b of delivery.blocks) for (const s of b.screens) if (s.content) ranges.push({ id: s.id, ...s.content });
    const placed = ranges.map((r) => ({ id: r.id, start: index(r.from), end: index(r.to) })).sort((a, b) => a.start - b.start);
    assert.ok(placed.length > 0, `module ${n} has no content ranges`);
    assert.ok(!placed.some((p) => p.start < 0 || p.end < 0), `module ${n} references a heading that does not exist`);
    assert.equal(placed[0].start, 0, `module ${n} coverage does not start at the top of the file`);
    for (let i = 1; i < placed.length; i += 1) {
      assert.equal(placed[i].start, placed[i - 1].end, `module ${n}: gap or overlap between ${placed[i - 1].id} and ${placed[i].id}`);
    }
    assert.equal(placed[placed.length - 1].end, lines.length, `module ${n} coverage stops before end of file`);
    blocks += delivery.blocks.length;
    screens += delivery.blocks.reduce((a, b) => a + b.screens.length, 0);
  }
  assert.equal(blocks, 53);
  assert.equal(screens, 141);
});

/* ── formative assessment ────────────────────────────────────────────────────────────────────── */

test("every topic meets 22 TAC 535.62(b)(7)'s minimum of three primary questions", () => {
  for (const topic of TOPICS) {
    const items = TOPIC_QUIZZES[topic.code];
    assert.ok(items, `${topic.code} has no topic quiz`);
    assert.ok(items.length >= ASSESSMENT_REQUIREMENTS.minQuestionsPerTopicQuiz,
      `${topic.code} has ${items.length} primary questions, below the rule's minimum of ${ASSESSMENT_REQUIREMENTS.minQuestionsPerTopicQuiz}`);
  }
});

test("every quiz item has a replacement on the same proposition, not a repeat", () => {
  for (const item of ALL_ITEMS) {
    assert.ok(item.replacement, `${item.id} has no replacement`);
    assert.equal(item.replacement.id, `${item.id}R`);
    assert.notEqual(item.replacement.prompt, item.prompt, `${item.id}: the rule requires a subsequent RELATED question, not the same one`);
    assert.equal(item.replacement.choices.length, 4);
    assert.equal(item.replacement.correctChoice, 0);
  }
  assert.equal(PRIMARY_COUNT, REPLACEMENT_COUNT);
});

test("no quiz item is a true/false item and every correct answer is authored first", () => {
  for (const item of ALL_ITEMS) {
    assert.equal(item.choices.length, 4, `${item.id} must offer four choices`);
    assert.equal(item.correctChoice, 0, `${item.id} must author the correct answer first`);
    const tf = item.choices.map((c) => String(c).trim().toLowerCase());
    assert.ok(!tf.every((c) => /^(true|false)\.?$/.test(c)), `${item.id} is a true/false item`);
  }
  assert.equal(ASSESSMENT_REQUIREMENTS.trueFalsePermitted, false);
});

test("every quiz item traces to a real unit and to instruction that exists", () => {
  const unitCodes = new Set(ALL_UNITS.map((u) => u.code));
  const anchors = new Map();
  for (const m of MODULES) {
    const set = new Set();
    for (const match of moduleText(m.file).matchAll(/^## Unit: (.+)$/gm)) set.add(`unit-${slug(match[1].trim())}`);
    anchors.set(m.file, set);
  }
  for (const item of ALL_ITEMS) {
    assert.ok(unitCodes.has(item.tests), `${item.id} tests ${item.tests}, which is not a PRINS2-1 unit`);
    const [file, anchor] = item.remediation.split("#");
    assert.ok(anchors.get(file)?.has(anchor), `${item.id} remediation ${item.remediation} does not resolve to a unit heading in the frozen curriculum`);
  }
});

/* ── sourcing ────────────────────────────────────────────────────────────────────────────────── */

test("every PRINS2-1 unit is either sourced or explicitly excused", () => {
  const coverage = register.unitCoverage(ALL_UNITS.map((u) => u.code));
  assert.deepEqual(coverage.uncovered, [], "a unit with neither a read source nor a recorded reason cannot be defended");
  assert.equal(coverage.held.length + coverage.excused.length, 44);
});

test("the source register holds no controlling-source gap and no fabricated hash", () => {
  const v = register.sourceValidation();
  assert.deepEqual(v.controllingGaps, [], "a controlling source the course relies on may not be missing");
  assert.deepEqual(v.hashMismatches, [], "every registered hash must match the file on disk");
  assert.ok(v.registeredSources > 0);
});

test("units relying on a TREC administrative rule are not covered by the statute alone", () => {
  /* 22 TAC 535.55 and 535.64 carry propositions the Occupations Code does not: the qualifying
     education breakdown, and the adoption of PRINS2-1 by reference. A unit that relies on a rule
     must name the rule. */
  const ruleBacked = UNIT_TRACE.filter((t) => t.sources.some((s) => /tac-535/.test(s.sourceId)));
  assert.ok(ruleBacked.length > 0, "no unit records reliance on a TREC administrative rule; the register has lost the distinction");
});

/* ── time evidence ───────────────────────────────────────────────────────────────────────────── */

test("the credit-hour evidence still matches the curriculum on disk", () => {
  let words = 0, statute = 0, applied = 0, recaps = 0;
  for (const m of MODULES) {
    const txt = moduleText(m.file);
    words += txt.split(/\s+/).filter(Boolean).length;
    statute += (txt.match(/^### Statute reading exercise:/gm) || []).length;
    applied += (txt.match(/^### Applied exercise:/gm) || []).length;
    recaps += (txt.match(/^### Module recap/gm) || []).length;
  }
  const claimed = TIME_MODEL.frozenMeasurements;
  assert.equal(words, claimed.totalWords, "word count drifted from the course record");
  assert.equal(statute, claimed.statuteReadingExercises);
  assert.equal(applied, claimed.appliedExercises);
  assert.equal(recaps, claimed.moduleRecaps);
  const minutes = instructionalMinutes();
  assert.ok(minutes.meetsPrescribed, `authored course occupies ${minutes.totalMinutes} min against ${minutes.prescribedMinutes} prescribed`);
});

test("the time model is labelled provider methodology, not a regulator figure", () => {
  assert.equal(TIME_MODEL.label, "PROVIDER_METHODOLOGY");
  assert.match(TIME_MODEL.note, /Not a regulator figure/i);
});

/* ── nothing enrolling, nothing charging, nothing approved ───────────────────────────────────── */

test("Principles II claims no approval and enables nothing downstream of content", () => {
  assert.equal(COURSE.trecApprovalStatus, "NOT_SUBMITTED_NOT_APPROVED");
  assert.equal(COURSE.enrollmentEnabled, false);
  assert.equal(COURSE.paymentEnabled, false);
  assert.equal(COURSE.creditReportingEnabled, false);
  assert.equal(COURSE.certificateIssuanceEnabled, false);
  assert.equal(COURSE.finalExaminationAdministrable, false);
});

test("Principles I and II are separate courses, never one 60-hour course", () => {
  assert.equal(COURSE.courseId, "tx-principles-real-estate-ii-30-v1");
  assert.equal(COURSE.hours, 30);
  assert.equal(COURSE.approvalForm, "PRINS2-1");
  assert.notEqual(COURSE.courseId, "tx-principles-real-estate-i-30-v1");
});

test("no authored Principles II text claims TREC approval or available Texas credit", () => {
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
  for (const item of ALL_ITEMS) {
    scan(item.id, item.prompt);
    scan(item.id, item.rationale);
    for (const c of item.choices) scan(item.id, c);
    scan(`${item.id}R`, item.replacement.prompt);
    scan(`${item.id}R`, item.replacement.rationale);
  }
  assert.deepEqual(offenders, [], "no course text may claim an approval this build does not have");
});

test("the required non-approval disclaimer is actually present, not merely unclaimed", () => {
  /* The mirror of the test above. Passing that one by saying nothing at all would be a different
     failure, so at least one module must state the position plainly. */
  const stating = MODULES.filter((m) => /\bnot a TREC[- ]approved course\b|\bno TREC (course )?approval exists\b|\bno Texas qualifying credit\b/i.test(moduleText(m.file)));
  assert.ok(stating.length > 0, "no module states that this course is not TREC-approved and offers no Texas credit");
});
