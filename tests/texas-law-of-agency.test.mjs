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
  /* The examination exists and is still not administrable. Asserting both keeps the two facts
     apart: a build that quietly flipped `administrable` alongside `exists` would pass a test that
     checked only one of them. */
  assert.equal(COURSE.finalExaminationExists, true);
  assert.equal(COURSE.finalExaminationAdministrable, false);
  assert.equal(COURSE.finalExaminationStatus, "BUILT_NOT_ADMINISTRABLE_PENDING_TAC_RULES");
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

/* ── the video freeze, and the indirection that lets it exist ─────────────────────────────────
   A video plan is not curriculum, and correcting a video must not require breaking a curriculum
   freeze. These tests hold that boundary in place: the curriculum freeze hashes the VIDEO FREEZE
   ARTIFACT, not the plan, and the video freeze hashes the plan and everything a render depends on.
   If someone reverts to hashing the plan directly, the deadlock that stranded nine narration
   repairs in an unhashed addendum comes back, so it fails here. */

const VIDEO_FREEZE_PATH = path.join(HOME, "video-plan-freeze.json");
const VIDEO_FREEZE = JSON.parse(fs.readFileSync(VIDEO_FREEZE_PATH, "utf8"));

test("the curriculum freeze pins the video state through the video freeze, not through the plan", () => {
  const names = Object.keys(FREEZE.artifacts);
  const pointer = names.filter((n) => FREEZE.artifacts[n].path.endsWith("video-plan-freeze.json"));
  assert.equal(pointer.length, 1, "the curriculum freeze must hash the video freeze artifact exactly once");
  const direct = names.filter((n) => FREEZE.artifacts[n].path.endsWith("video-instruction-plan.md"));
  assert.deepEqual(direct, [], "the curriculum freeze must NOT hash the video plan directly — that is the deadlock that stranded the video corrections in an unhashed addendum");

  const buf = fs.readFileSync(VIDEO_FREEZE_PATH);
  assert.equal(crypto.createHash("sha256").update(buf).digest("hex"), FREEZE.artifacts[pointer[0]].sha256, "the video freeze artifact changed since the curriculum freeze — re-run both freezes");
});

test("the video freeze names itself, supersedes plan v1 by hash, and still hashes every render dependency", () => {
  assert.match(VIDEO_FREEZE.freezeId, /^LOA-VIDEO-PLAN-FREEZE-\d{4}-\d{2}-\d{2}(-v\d+)?$/, "a re-freeze must bump its version rather than reusing an id");
  assert.equal(VIDEO_FREEZE.freezeId, "LOA-VIDEO-PLAN-FREEZE-2026-08-30-v2");
  assert.equal(VIDEO_FREEZE.courseId, "tx-law-of-agency-30-v1");

  /* The superseded plan is identified by hash, not by adjective. */
  assert.equal(VIDEO_FREEZE.supersedes.status, "SUPERSEDED");
  assert.equal(VIDEO_FREEZE.supersedes.sha256, "7ca7234853320ad96275c9a6c7e69a16e0a2ec2b63b6de2fd7ed62ed7f88e403");
  assert.equal(VIDEO_FREEZE.supersedes.artifact, "texas/tx-law-of-agency-30-v1/video-instruction-plan.md");

  /* Everything a render consults must be hashed, or a change to it is silent. */
  const paths = Object.values(VIDEO_FREEZE.artifacts).map((a) => a.path);
  for (const required of [
    "texas/tx-law-of-agency-30-v1/video-instruction-plan.md",
    "texas/tx-law-of-agency-30-v1/video-production/iabs-1-2-document-overview.md",
    "texas/tx-law-of-agency-30-v1/video-production/representation-or-showing-only-2026.md",
    "texas/tx-law-of-agency-30-v1/video-production/intermediary-brokerage.md",
    "texas/tx-law-of-agency-30-v1/video-production/captions/tx-iabs-1-2-document-overview.provisional.vtt",
    "texas/tx-law-of-agency-30-v1/video-production/captions/tx-representation-or-showing-only-2026.provisional.vtt",
    "texas/tx-law-of-agency-30-v1/video-production/captions/tx-intermediary-brokerage.provisional.vtt",
    "texas/trec-sources/forms/IABS-1-2.pdf",
    "scripts/validate-loa-video-packages.mjs",
  ]) assert.ok(paths.includes(required), `the video freeze does not hash ${required}`);

  const drift = [];
  for (const [name, a] of Object.entries(VIDEO_FREEZE.artifacts)) {
    const buf = fs.readFileSync(path.join(root, a.path));
    if (crypto.createHash("sha256").update(buf).digest("hex") !== a.sha256 || buf.length !== a.bytes) drift.push(name);
  }
  assert.deepEqual(drift, [], "a video artifact changed since the video freeze — re-run scripts/freeze-loa-video-plan.mjs and then scripts/freeze-loa-curriculum.mjs");
});

test("the video freeze records every check the validator ran, and passes none of them quietly", () => {
  assert.equal(VIDEO_FREEZE.validation.checksPassing, "8/8");
  assert.equal(VIDEO_FREEZE.validation.checks.length, 8);
  for (const c of VIDEO_FREEZE.validation.checks) assert.equal(c.pass, true, `check ${c.n} did not pass`);
  /* Checks that cannot be fully mechanised must say so in the artifact, not only on a terminal. */
  const partial = VIDEO_FREEZE.validation.checks.filter((c) => c.notFullyMechanised);
  assert.ok(partial.length >= 3, "the checks that cannot be fully mechanised must name their own limits");
  for (const c of partial) assert.ok(c.notFullyMechanised.length > 60, `check ${c.n} says it is partial without saying what is missing`);
});

test("video status is reported in four layers and no layer borrows another's", () => {
  const s = VIDEO_FREEZE.status;
  assert.match(s.editorialAndLegalPackage, /^READY\b/);
  assert.match(s.renderedAssets, /^PENDING\b/);
  assert.match(s.screenMediaIntegrationSupport, /^PENDING\b/);
  assert.match(s.coursePlacementActivation, /^NOT ACTIVE\b/);
  assert.match(s.doNotSay, /production-ready/);

  /* No canonical video file may call the package production-ready, and none may be wired. */
  const files = [
    path.join(HOME, "video-instruction-plan.md"),
    path.join(HOME, "video-production/iabs-1-2-document-overview.md"),
    path.join(HOME, "video-production/representation-or-showing-only-2026.md"),
    path.join(HOME, "video-production/intermediary-brokerage.md"),
  ];
  for (const f of files) {
    for (const m of fs.readFileSync(f, "utf8").matchAll(/[^\n]*production-ready[^\n]*(?:\n[^\n]*)?/gi)) {
      assert.match(m[0], /not a status this plan uses|is not "production-ready"|phrase is not used of it/i, `${path.basename(f)} calls the package production-ready`);
    }
  }
  for (const [n, map] of [[2, "law-of-agency-module-2-blocks.mjs"], [5, "law-of-agency-module-5-blocks.mjs"], [6, "law-of-agency-module-6-blocks.mjs"]]) {
    const text = fs.readFileSync(path.join(root, "config/texas", map), "utf8");
    assert.doesNotMatch(text, /videos:|screenMedia/, `module ${n} block map has media wired — nothing may be attached before the screenMedia hook exists`);
  }
});

test("retrieval happens on a separate screen, with no video, no form and no answers on it", () => {
  /* Derived from the generated block maps, not asserted: the screen the video attaches to and the
     screen the student is assessed on are different screens, two apart, and the retrieval screen
     carries a questionId and nothing else. */
  for (const [unit, map] of [["t02u5", "law-of-agency-module-2-blocks.mjs"], ["t05u3", "law-of-agency-module-5-blocks.mjs"], ["t06u3", "law-of-agency-module-6-blocks.mjs"]]) {
    const text = fs.readFileSync(path.join(root, "config/texas", map), "utf8");
    const screen = (id) => (text.match(new RegExp(`\\{[^\\n]*id: "${id}"[^\\n]*\\}`)) || [])[0];
    const s1 = screen(`${unit}-s1`);
    const s2 = screen(`${unit}-s2`);
    const s3 = screen(`${unit}-s3`);
    assert.ok(s1 && s2 && s3, `${unit}: expected -s1, -s2 and -s3`);
    assert.match(s1, /type: "instruction"/, `${unit}-s1 must be the instruction screen the video attaches to`);
    assert.match(s3, /type: "retrieval"/, `${unit}-s3 must be the retrieval screen`);
    assert.match(s3, /questionId: "/, `${unit}-s3 must name its retrieval item`);
    assert.doesNotMatch(s3, /content: RANGE/, `${unit}-s3 must not carry the module text — the form language would still be on screen at retrieval`);
    assert.doesNotMatch(s3, /videos:|screenMedia|documents:/, `${unit}-s3 must not carry media — the video would still be on screen at retrieval`);
  }
  assert.equal(VIDEO_FREEZE.assessmentSeparation.confirmed, true);
  assert.deepEqual(
    VIDEO_FREEZE.assessmentSeparation.placements.map((p) => p.instruction),
    ["t02u5-s1", "t05u3-s1", "t06u3-s1"],
  );
});

test("the review addendum has stopped being an operational dependency", () => {
  const addendum = fs.readFileSync(path.join(HOME, "video-production/production-readiness-addendum.md"), "utf8");
  assert.match(addendum, /SUPERSEDED — REVIEW HISTORY ONLY/);
  assert.match(addendum, /NOT AN OPERATIONAL DEPENDENCY/);
  /* It is still hashed — as history. Losing it would lose the record of how the defects were found. */
  const paths = Object.values(VIDEO_FREEZE.artifacts).map((a) => a.path);
  assert.ok(paths.includes("texas/tx-law-of-agency-30-v1/video-production/production-readiness-addendum.md"));
});

test("the screenMedia hook is unbuilt, and its test list is recorded where it will be built", () => {
  const gen = fs.readFileSync(path.join(root, "scripts/lib/generate-tx-block-maps.mjs"), "utf8");
  /* Look for the IMPLEMENTATION, not the prose describing it: the header names the hook in order
     to specify it, so a text match on the name would find the specification and call it a build. */
  assert.doesNotMatch(gen, /spec\.screenMedia\s*\|\||screenMedia\[|const screenMedia\s*=/, "the hook is recorded as unbuilt; if it has been built, move these assertions to its own tests");
  assert.match(gen, /NOT BUILT: THE `screenMedia` HOOK/);
  assert.match(gen, /DO NOT HAND-EDIT A GENERATED COURSE FILE/);
  for (const requirement of [
    /EXACT SCREEN PLACEMENT/,
    /`required: false`/,
    /NON-BLOCKING PROGRESSION/,
    /MP4, VTT, TRANSCRIPT AND POSTER PRESENCE/,
    /ACCESSIBLE PLAYER CONTROLS AND KEYBOARD ACCESS/,
    /CAPTION AVAILABILITY/,
    /NO OVERLAP WITH THE StateCourse LOGO/,
    /NO SECURE ASSESSMENT CONTENT/,
    /NO VIDEO ON THE RETRIEVAL SCREEN/,
    /NO ACTIVATION WHEN ANY REQUIRED MEDIA ASSET IS ABSENT/,
  ]) assert.match(gen, requirement, `the screenMedia test list is missing ${requirement}`);
});

test("no video is rendered, served or referenced anywhere", () => {
  const stems = ["tx-iabs-1-2-document-overview", "tx-representation-or-showing-only-2026", "tx-intermediary-brokerage"];
  const media = path.join(root, "public/statecourse/media");
  if (fs.existsSync(media)) {
    const shipped = fs.readdirSync(media).filter((n) => stems.some((s) => n.startsWith(s)));
    assert.deepEqual(shipped, [], "a video asset is sitting at its shipping path before a render exists");
  }
  assert.match(VIDEO_FREEZE.notApproved, /holds no TREC approval/i);
});

/* ── the confidential final examination ──────────────────────────────────────────────────────
   These tests import the secure bank and the version file. They assert counts, ids, hashes and
   invariants and they print no prompt, no choice, no correct answer and no rationale — a test that
   echoes the secure bank into CI output has leaked it as surely as publishing it would.
   tests/no-answer-key-published.test.mjs is the standing guard that neither file reaches public/ or
   dist/; these tests are the guard that what does exist is compliant. */

const examBank = await import("../config/texas/law-of-agency-final-exam-bank.mjs");
const examForms = await import("../config/texas/law-of-agency-final-exam-forms.mjs");
const { ASSESSMENT_REQUIREMENTS } = await import("../config/texas/trec-rules-source-lock.mjs");

test("the secure bank meets the § 535.62(b)(7) floor and matches its own blueprint", () => {
  assert.equal(examBank.BANK_SIZE, examBank.FINAL_EXAM_BANK.length);
  assert.ok(
    examBank.BANK_SIZE >= ASSESSMENT_REQUIREMENTS.minExamBankQuestions,
    `${examBank.BANK_SIZE} items against a floor of ${ASSESSMENT_REQUIREMENTS.minExamBankQuestions}`,
  );
  const perTopic = {};
  for (const entry of examBank.FINAL_EXAM_BANK) perTopic[entry.topic] = (perTopic[entry.topic] ?? 0) + 1;
  assert.deepEqual(perTopic, { ...examBank.TOPIC_BLUEPRINT });
  assert.equal(
    Object.values(examBank.TOPIC_BLUEPRINT).reduce((sum, n) => sum + n, 0),
    examBank.BANK_SIZE,
  );
});

test("every LOA-1 unit is examined, and every teaches anchor resolves in the frozen curriculum", () => {
  /* The anchors are re-derived from the frozen markdown rather than trusted: a unit heading that is
     reworded without the bank being updated must fail here rather than produce a crosswalk that
     points at nothing. */
  const slug = (s) => s.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
  const anchors = new Set();
  for (const file of fs.readdirSync(CURRICULUM).filter((f) => f.endsWith(".md")).sort()) {
    for (const m of moduleText(file).matchAll(/^## Unit: (.+)$/gm)) {
      anchors.add(`${file}#unit-${slug(m[1])}`);
    }
  }
  for (const unit of ALL_UNITS) {
    const anchor = examBank.UNIT_ANCHORS[unit.code];
    assert.ok(anchor, `unit ${unit.code} has no anchor`);
    assert.ok(anchors.has(anchor), `unit ${unit.code} anchors at ${anchor}, which is not a heading in the frozen curriculum`);
    assert.ok(examBank.UNITS_EXAMINED[unit.code] >= 1, `unit ${unit.code} carries no examination item`);
  }
  assert.equal(Object.keys(examBank.UNITS_EXAMINED).length, ALL_UNITS.length);
});

test("no examination item is true/false-shaped, and every item carries a key, a rationale and a source", () => {
  for (const entry of examBank.FINAL_EXAM_BANK) {
    assert.equal(entry.choices.length, 4, `${entry.id} does not offer four choices`);
    assert.equal(entry.correctChoice, 0, `${entry.id} does not author the correct answer first`);
    assert.equal(new Set(entry.choices).size, 4, `${entry.id} repeats a choice`);
    assert.ok(entry.rationale && entry.rationale.trim().length >= 40, `${entry.id} lacks a rationale`);
    assert.ok(entry.source && entry.source.trim().length >= 8, `${entry.id} lacks a controlling source`);
    assert.equal(entry.tests, entry.unit, `${entry.id} disagrees with itself about what it examines`);
    assert.ok(!/optional/i.test(entry.teaches), `${entry.id} is traced to optional-reference material`);
  }
  assert.equal(ASSESSMENT_REQUIREMENTS.trueFalsePermitted, false);
});

test("four versions of sixty, every topic on every version, and no pair above the one-third cap", () => {
  assert.ok(
    examForms.VERSIONS.length >= ASSESSMENT_REQUIREMENTS.minExamVersions,
    `${examForms.VERSIONS.length} versions against a minimum of ${ASSESSMENT_REQUIREMENTS.minExamVersions}`,
  );
  const byId = new Map(examBank.FINAL_EXAM_BANK.map((entry) => [entry.id, entry]));
  for (const version of examForms.VERSIONS) {
    assert.ok(
      version.itemCount >= ASSESSMENT_REQUIREMENTS.minQuestionsPerExamVersion,
      `version ${version.id} carries ${version.itemCount} items`,
    );
    const covered = new Set(version.itemIds.map((id) => byId.get(id).topic));
    assert.equal(covered.size, TOPICS.length, `version ${version.id} covers ${covered.size} of ${TOPICS.length} topics`);
    /* FORMS is the shape scripts/validate-loa-assessments.mjs reads, and it must be the same data. */
    assert.deepEqual(examForms.FORMS[version.id], version.itemIds);
  }
  assert.equal(examForms.PAIRWISE_OVERLAP.length, 6);
  for (const row of examForms.PAIRWISE_OVERLAP) {
    assert.ok(
      row.sharedItems / row.shorterVersionItems <= ASSESSMENT_REQUIREMENTS.maxCrossVersionOverlapFraction,
      `${row.pair} shares ${row.sharedItems} of ${row.shorterVersionItems}`,
    );
  }
  assert.equal(examForms.ITEM_EXPOSURE.unused, 0, "a bank item appears on no version");
});

test("the 70% boundary is exact: 42 of 60 passes and 41 of 60 fails", () => {
  /* § 535.65(h)(4) fixes an unweighted 70%. The failure mode this guards against is a percentage
     rounded before the comparison, which would carry a near-miss over the line on some version
     length. The scoring function compares raw counts, and both sides of the boundary are asserted
     for every version rather than for a representative one. */
  assert.equal(examForms.SCORING.passingScorePercent, 70);
  assert.equal(examForms.SCORING.weighting, "unweighted");
  for (const version of examForms.VERSIONS) {
    const mark = examForms.SCORING.minimumCorrectByVersion[version.id];
    assert.equal(mark, Math.ceil(0.7 * version.itemCount));
    assert.equal(examForms.SCORING.passes(mark, version.itemCount), true, `${mark}/${version.itemCount} should pass`);
    assert.equal(examForms.SCORING.passes(mark - 1, version.itemCount), false, `${mark - 1}/${version.itemCount} should fail`);
    assert.equal(examForms.SCORING.passes(version.itemCount, version.itemCount), true);
    assert.equal(examForms.SCORING.passes(0, version.itemCount), false);
  }
  assert.equal(examForms.SCORING.passes(42, 60), true);
  assert.equal(examForms.SCORING.passes(41, 60), false);
  assert.throws(() => examForms.SCORING.passes(61, 60), /not a scoreable attempt/);
  assert.throws(() => examForms.SCORING.passes(-1, 60), /not a scoreable attempt/);
});

test("examination items are substantially different from every quiz, replacement, misconception check and scenario task", () => {
  /* § 535.65(h)(2) requires final examination questions to be "significantly different from any
     quiz questions and exercises used in the course". The threshold the validator enforces is 0.70
     Jaccard on the prompt; this test holds the build to the tighter figure the bank was actually
     authored to, so that drift toward the validator's ceiling fails here first. */
  const STOP = new Set("a an and are as at be by for from has have if in is it its may must no not of on or shall should than that the their them then there these they this to under was were what when which who will with would you your".split(" "));
  const tokens = (s) => (String(s).toLowerCase().match(/[a-z0-9§.()-]+/g) || []).filter((t) => t.length > 2 && !STOP.has(t));
  const jaccard = (a, b) => {
    const A = new Set(a); const B = new Set(b);
    if (!A.size || !B.size) return 0;
    let i = 0; for (const t of A) if (B.has(t)) i += 1;
    return i / (A.size + B.size - i);
  };
  return Promise.all([
    import("../config/texas/law-of-agency-question-bank.mjs"),
    import("../config/texas/law-of-agency-misconception-checks.mjs"),
    import("../config/texas/law-of-agency-scenarios.mjs"),
  ]).then(([quiz, misconceptions, scenarios]) => {
    const formative = [
      ...quiz.allItems(),
      ...quiz.allReplacements(),
      ...(misconceptions.MISCONCEPTION_CHECKS || []),
      ...(scenarios.SCENARIOS || []).flatMap((s) => s.tasks || []),
    ].map((item) => ({ id: item.id, tokens: tokens(item.prompt || item.stem || item.task || item.text || "") }));
    let worst = { similarity: 0, exam: null, formative: null };
    for (const entry of examBank.FINAL_EXAM_BANK) {
      const examTokens = tokens(entry.prompt);
      for (const other of formative) {
        const similarity = jaccard(examTokens, other.tokens);
        if (similarity > worst.similarity) worst = { similarity, exam: entry.id, formative: other.id };
      }
    }
    assert.ok(
      worst.similarity < 0.5,
      `${worst.exam} and formative item ${worst.formative} share ${worst.similarity.toFixed(3)} of their prompt tokens`,
    );
  });
});

test("assembling four versions is not authority to administer one", () => {
  assert.equal(examForms.EXAM_READY.status, "BLOCKED");
  assert.equal(examForms.EXAM_READY.blockedBy, "TX_PROVIDER_RULE_SOURCE_LOCK");
  assert.equal(examForms.EXAM_READY.trecApprovalHeld, false);
  assert.equal(examForms.EXAM_READY.texasCreditAvailable, false);
  assert.equal(examForms.ADMINISTRATION.label, "PROVIDER_PROPOSED_PENDING_TAC_CONFIRMATION");
  assert.equal(examForms.ROTATION.requirementStatus, "RULE_REQUIRED");
  assert.equal(examForms.ROTATION.cadenceStatus, "PROVIDER_PROPOSED_PENDING_COMMISSION_ACCEPTANCE");
  assert.equal(examForms.SUBSEQUENT_ATTEMPT.mustBeADifferentVersion, true);
  assert.equal(examForms.SUBSEQUENT_ATTEMPT.deadlineDays, 90);
  assert.equal(examForms.SUBSEQUENT_ATTEMPT.maxAttemptsBeforeRetakingTheCourse, 2);
  assert.deepEqual([...examForms.ROTATION.order], ["A", "B", "C", "D"]);
});

test("no examination text reaches any served tree", () => {
  /* The bank and the version file live in config/, outside every served tree. This asserts the
     negative directly rather than relying on the general answer-key test: no file under public/ or
     dist/ may import either module by name. */
  const served = [path.join(root, "public"), path.join(root, "dist")].filter((dir) => fs.existsSync(dir));
  const offenders = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!/\.(m?js|html|json|css)$/i.test(entry.name)) continue;
      const text = fs.readFileSync(full, "utf8");
      if (text.includes("law-of-agency-final-exam-bank") || text.includes("law-of-agency-final-exam-forms")) {
        offenders.push(path.relative(root, full));
      }
    }
  };
  for (const dir of served) walk(dir);
  assert.deepEqual(offenders, [], `examination modules referenced from a served tree: ${offenders.join(", ")}`);
});

/* ── the engine, and the artifacts the acceptance report reads ───────────────────────────────── */

const engine = await import("../config/texas-law-of-agency-engine.mjs");

test("production enrollment is refused, and a reviewer enrollment is non-credit on its face", () => {
  assert.throws(() => engine.openEnrollment({ learnerId: "student" }), /production enrollment is disabled/);
  const record = engine.openEnrollment({ learnerId: "reviewer", mode: engine.MODE.REVIEWER });
  assert.equal(record.courseId, "tx-law-of-agency-30-v1");
  assert.equal(record.mode, "REVIEWER");
  assert.equal(record.creditEligible, false);
  assert.equal(record.trecApproval, "NOT_SUBMITTED_NOT_APPROVED");
});

test("a topic will not open out of order, and will not open at all before identity is verified", () => {
  let record = engine.openEnrollment({ learnerId: "reviewer", mode: engine.MODE.REVIEWER });
  assert.equal(engine.canOpenTopic(record, "T01").allowed, false, "unverified identity should refuse T01");
  record = engine.verifyIdentity(record, { method: "reviewer attestation" });
  assert.equal(engine.canOpenTopic(record, "T01").allowed, true);
  assert.equal(engine.canOpenTopic(record, "T02").allowed, false, "T02 should refuse while T01 is incomplete");
  assert.equal(engine.canOpenTopic(record, "T99").allowed, false);
});

test("a certificate is refused even when every in-engine condition is met", () => {
  const record = engine.openEnrollment({ learnerId: "reviewer", mode: engine.MODE.REVIEWER });
  const eligibility = engine.certificateEligibility(record);
  assert.equal(eligibility.eligibleForCertificate, false);
  assert.equal(eligibility.creditEligible, false);
  assert.equal(eligibility.trecApprovalHeld, false);
  assert.throws(() => engine.issueCertificate(record), /certificate issuance is disabled/);
});

test("a misconception check is recorded, counts as no assessment, and gates no topic", async () => {
  const { MISCONCEPTION_CHECKS } = await import("../config/texas/law-of-agency-misconception-checks.mjs");
  const { TOPIC_QUIZZES, replacementFor } = await import("../config/texas/law-of-agency-question-bank.mjs");
  const withCheck = MISCONCEPTION_CHECKS[0].topicCode;
  assert.equal(MISCONCEPTION_CHECKS.every((c) => c.countsAsAssessment === false), true);

  /* Clear the topic that carries a check WITHOUT answering the check, and complete it anyway. */
  let record = engine.openEnrollment({ learnerId: "skip", mode: engine.MODE.REVIEWER });
  record = engine.verifyIdentity(record, { method: "reviewer attestation" });
  for (const topic of TOPICS.map((t) => t.code)) {
    for (const item of TOPIC_QUIZZES[topic]) {
      record = engine.answerQuizItem(record, { topicCode: topic, itemId: item.id, choiceIndex: item.correctChoice });
    }
    record = engine.completeTopic(record, { topicCode: topic });
    if (topic === withCheck) {
      assert.equal(record.completedTopics.includes(topic), true, `${topic} should complete with no misconception check answered`);
    }
  }
  assert.equal(record.completedTopics.length, TOPICS.length);
  assert.equal(engine.auditRecord(record).misconceptionChecks.length, 0);
  void replacementFor;
});

test("a wrong answer returns the rationale and serves a different question, and the primary is never re-served", async () => {
  const { TOPIC_QUIZZES, replacementFor } = await import("../config/texas/law-of-agency-question-bank.mjs");
  let record = engine.openEnrollment({ learnerId: "miss", mode: engine.MODE.REVIEWER });
  record = engine.verifyIdentity(record, { method: "reviewer attestation" });
  const item = TOPIC_QUIZZES.T01[0];
  const wrong = (item.correctChoice + 1) % item.choices.length;
  record = engine.answerQuizItem(record, { topicCode: "T01", itemId: item.id, choiceIndex: wrong });
  assert.equal(record.lastFeedback.correct, false);
  assert.ok(record.lastFeedback.rationale.length > 40, "a wrong answer must return a rationale");
  assert.equal(record.lastFeedback.nextQuestionId, replacementFor(item.id).id);
  assert.notEqual(record.lastFeedback.nextQuestionId, item.id, "the replacement must be a different question");

  /* Wrong again: the replacement stays served, and the original is not brought back. */
  const replacement = replacementFor(item.id);
  const wrongAgain = (replacement.correctChoice + 1) % replacement.choices.length;
  record = engine.answerQuizItem(record, { topicCode: "T01", itemId: item.id, choiceIndex: wrongAgain });
  assert.equal(record.lastFeedback.nextQuestionId, replacement.id);
  record = engine.answerQuizItem(record, { topicCode: "T01", itemId: item.id, choiceIndex: replacement.correctChoice });
  assert.equal(record.lastFeedback.correct, true);
  assert.equal(engine.topicQuizComplete(record, "T01"), TOPIC_QUIZZES.T01.length === 1);
});

test("the acceptance artifacts exist and record what they claim", () => {
  const read = (name) => JSON.parse(fs.readFileSync(path.join(HOME, name), "utf8"));

  const trace = read("traceability.json");
  assert.equal(trace.totals.unitsAssessed, ALL_UNITS.length);
  assert.equal(trace.totals.unitsExamined, ALL_UNITS.length);
  /* The crosswalk must carry nothing answer-bearing. */
  const traceKeys = new Set(trace.rows.flatMap((r) => Object.keys(r)));
  for (const forbidden of ["prompt", "choices", "options", "correctChoice", "rationale"]) {
    assert.equal(traceKeys.has(forbidden), false, `traceability.json must not carry ${forbidden}`);
  }

  const evidence = read("engine-workflow-evidence.json");
  assert.equal(evidence.missing.length, 0, `engine behaviours not demonstrated: ${evidence.missing.join(", ")}`);
  assert.equal(evidence.productionEnrollmentRefused, true);
  assert.equal(evidence.behaviours.optionalMaterialNeverBlocksProgress, "PASS");

  const a11y = read("accessibility-report.json");
  assert.equal(a11y.failed.length, 0, `accessibility criteria outstanding: ${a11y.failed.join(", ")}`);
  assert.equal(a11y.results.newChecksCanFail, "PASS", "the new criteria must be shown capable of failing");

  const acceptance = read("acceptance-report.json");
  assert.equal(acceptance.failed.length, 0, `acceptance checks failing: ${acceptance.failed.join(", ")}`);
  assert.equal(acceptance.verdicts.completeOperationalCourse, "GO");
  /* Submission readiness must stay NO-GO while any standing blocker is recorded. */
  assert.equal(acceptance.verdicts.submissionReadiness, "NO-GO");
  assert.ok(acceptance.blockers.length > 0, "the standing blockers must be recorded, not cleared");
});

test("the freeze, the audit and the acceptance report agree about what an unmatched quotation is", async () => {
  /* The bug this guards: the freeze composed unmatched quotations from three lists and the
     acceptance report from one, so one saw 0 stale dispositions and the other 100. Both call the
     same helper now, and this asserts the helper actually reads all three. */
  const { unmatchedFrom } = await import("../scripts/lib/tx-claim-audit.mjs");
  const audit = JSON.parse(fs.readFileSync(path.join(HOME, "claim-audit.json"), "utf8"));
  const composed = unmatchedFrom(audit);
  const attributionReviews = (audit.quoteFindings || []).filter((q) => q.status === "ATTRIBUTION_REVIEW");
  assert.ok(composed.length >= audit.quoteFailures.length, "the composition must include the outright failures");
  assert.ok(composed.length > audit.quoteFailures.length, "the composition must reach beyond quoteFailures alone");
  for (const source of [audit.quoteFailures, attributionReviews, audit.quoteTruncations || []]) {
    for (const quotation of source) {
      assert.ok(composed.some((q) => q.id === quotation.id), `${quotation.id} is missing from the composed set`);
    }
  }
  assert.equal(new Set(composed.map((q) => q.id)).size, composed.length, "the composition must not duplicate an id");
});
