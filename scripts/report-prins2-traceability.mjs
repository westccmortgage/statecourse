/**
 * TX Principles II — assessment-to-instruction traceability crosswalk.
 *
 * THE RULE THIS ENFORCES. Every quiz item, replacement question, scenario task and final-examination
 * item must map to (a) the official PRINS2-1 topic and unit it examines, (b) the specific
 * instructional screen where the concept is taught, and (c) the controlling source, where the item
 * tests law or regulation. Nothing may test content that exists in a source file but not in student
 * instruction — an item can be perfectly correct about Texas law and still be an unfair question if
 * the course never taught it.
 *
 * HOW THE SCREEN IS RESOLVED, AND WHY THAT IS THE HARD PART. An item names a unit and a remediation
 * anchor. The generated block maps name, for each unit, the screens that carry it and the heading
 * range each screen addresses. Joining the two gives the actual screen id a student is sent to —
 * which is the thing a reviewer wants and the thing nobody maintains by hand. This script computes
 * that join rather than asking anyone to keep a table in step with three moving artifacts.
 *
 * WHAT A GAP MEANS HERE. A unit with instruction but no assessment is not necessarily a defect —
 * PRINS2-1 has 44 units and the rule sets a floor of three questions per TOPIC, not per unit. The
 * report says which units are unassessed so the coverage claim is explicit, and fails only on the
 * things that are genuinely wrong: an item naming a unit that does not exist, an anchor that
 * resolves to no screen, or an item whose unit is taught in a different module than the one its
 * anchor names.
 *
 * Usage:  node scripts/report-prins2-traceability.mjs [--json]
 * Exit 0 only when every assessment item resolves to real instruction.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { TOPICS, ALL_UNITS } from "../config/texas/principles-ii-course-form.mjs";
import { MODULES, UNIT_TRACE } from "../config/texas/principles-ii-course.mjs";
import { TOPIC_QUIZZES, allItems } from "../config/texas/principles-ii-question-bank.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CURRICULUM = path.join(root, "texas/tx-principles-real-estate-ii-30-v1/curriculum");

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9 &-]/g, "").replace(/&/g, "").replace(/ /g, "-");
const failures = [];

/* ── unit → screens, from the generated block maps ────────────────────────────────────────────
   The block id IS the lowercased PRINS2-1 unit code by construction, so the join is exact rather
   than heuristic. */
const screensByUnit = new Map();
const screensByAnchor = new Map();
for (let n = 1; n <= 9; n += 1) {
  const mod = await import(`../config/texas/principles-ii-module-${n}-blocks.mjs`);
  const delivery = Object.values(mod)[0];
  const file = `module-0${n}.md`;
  const lines = fs.readFileSync(path.join(CURRICULUM, file), "utf8").split("\n");
  for (const block of delivery.blocks) {
    if (!block.code) continue;                       // the module-recap block has no unit code
    const instruction = block.screens.filter((s) => s.type === "instruction");
    screensByUnit.set(block.code, {
      module: file,
      blockId: block.id,
      unitTitle: block.title,
      screens: block.screens.map((s) => ({ id: s.id, type: s.type, title: s.title })),
      firstInstructionScreen: instruction[0]?.id ?? null,
    });
    /* The remediation anchor a bank item carries is derived from the unit heading, so map the same
       slug to the screen the student would actually land on. */
    screensByAnchor.set(`${file}#unit-${slug(block.title)}`, {
      unit: block.code,
      screenId: instruction[0]?.id ?? null,
      module: file,
    });
  }
  void lines;
}

const unitByCode = new Map(ALL_UNITS.map((u) => [u.code, u]));
const traceByUnit = new Map(UNIT_TRACE.map((t) => [t.code, t]));

/** One traceability row per assessment item. */
function row(kind, id, unitCode, anchor, sourceHint) {
  const unit = unitByCode.get(unitCode);
  if (!unit) { failures.push(`${kind} ${id}: names unit ${unitCode}, which is not a PRINS2-1 unit`); return null; }
  const resolved = anchor ? screensByAnchor.get(anchor) : null;
  if (anchor && !resolved) { failures.push(`${kind} ${id}: anchor ${anchor} resolves to no screen`); }
  if (resolved && resolved.unit !== unitCode) {
    failures.push(`${kind} ${id}: examines ${unitCode} but its anchor sends the student to ${resolved.unit}`);
  }
  const delivery = screensByUnit.get(unitCode);
  if (!delivery) failures.push(`${kind} ${id}: unit ${unitCode} has no generated block`);
  const trace = traceByUnit.get(unitCode);
  const sources = (trace?.sources || []).map((s) => s.citation);
  if (sourceHint && !sources.length && !trace?.excusedReason) {
    failures.push(`${kind} ${id}: tests law but unit ${unitCode} records no read source`);
  }
  return {
    kind,
    id,
    topic: unitCode.slice(0, 3),
    unit: unitCode,
    unitTitle: unit.unit,
    module: delivery?.module ?? null,
    blockId: delivery?.blockId ?? null,
    screenId: resolved?.screenId ?? delivery?.firstInstructionScreen ?? null,
    remediationAnchor: anchor ?? null,
    controllingSources: sources,
    excused: trace?.excusedReason ? true : false,
  };
}

const rows = [];

/* topic quizzes and their replacements */
for (const item of allItems()) {
  rows.push(row("quiz", item.id, item.tests, item.remediation, true));
  rows.push(row("replacement", item.replacement.id, item.tests, item.remediation, true));
}

/* scenario tasks */
const scenarioPath = path.join(root, "config/texas/principles-ii-scenarios.mjs");
if (fs.existsSync(scenarioPath)) {
  const sc = await import("../config/texas/principles-ii-scenarios.mjs");
  for (const s of sc.SCENARIOS) {
    for (const t of s.tasks) {
      /* A scenario task's unit is the one its remediation anchor names; scenarios assess several. */
      const resolved = t.remediation ? screensByAnchor.get(t.remediation) : null;
      const unitCode = resolved?.unit || s.assessesUnits?.[0];
      rows.push(row("scenario-task", t.id, unitCode, t.remediation, true));
    }
  }
} else {
  failures.push("scenarios not found");
}

/* final examination items */
const bankPath = path.join(root, "config/texas/principles-ii-final-exam-bank.mjs");
let bankPresent = false;
if (fs.existsSync(bankPath)) {
  try {
    const bank = await import("../config/texas/principles-ii-final-exam-bank.mjs");
    const items = bank.ITEMS || bank.BANK || [];
    bankPresent = items.length > 0;
    for (const it of items) rows.push(row("final-exam", it.id, it.unit || `${it.topic}U1`, it.teaches, true));
  } catch (error) {
    failures.push(`final exam bank could not be loaded: ${error.message.split("\n")[0]}`);
  }
} else {
  failures.push("final exam bank not found");
}

const clean = rows.filter(Boolean);

/* ── coverage ─────────────────────────────────────────────────────────────────────────────────── */
const assessedUnits = new Set(clean.map((r) => r.unit));
const unassessed = ALL_UNITS.map((u) => u.code).filter((c) => !assessedUnits.has(c));
const byTopic = {};
for (const t of TOPICS) byTopic[t.code] = clean.filter((r) => r.topic === t.code).length;

const out = {
  generatedBy: "scripts/report-prins2-traceability.mjs",
  note: "Every assessment item mapped to its PRINS2-1 unit, the instructional screen a student is sent to, and the controlling sources recorded as read for that unit. Computed from the generated block maps, not maintained by hand.",
  totals: {
    items: clean.length,
    byKind: clean.reduce((a, r) => { a[r.kind] = (a[r.kind] || 0) + 1; return a; }, {}),
    itemsByTopic: byTopic,
    unitsAssessed: assessedUnits.size,
    unitsTotal: ALL_UNITS.length,
    unitsUnassessed: unassessed,
    finalExamBankIncluded: bankPresent,
  },
  rows: clean,
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(out, null, 2));
} else {
  const outPath = path.join(root, "texas/tx-principles-real-estate-ii-30-v1/traceability.json");
  fs.writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`);
  console.log("TX Principles II — assessment-to-instruction traceability");
  console.log(`  items mapped ............ ${clean.length}`);
  for (const [k, v] of Object.entries(out.totals.byKind)) console.log(`    ${k.padEnd(16)} ${v}`);
  console.log(`  units assessed .......... ${assessedUnits.size} of ${ALL_UNITS.length}`);
  if (unassessed.length) console.log(`  units with instruction but no assessment: ${unassessed.join(", ")}`);
  console.log(`  items per topic ......... ${TOPICS.map((t) => `${t.code}:${byTopic[t.code]}`).join(" ")}`);
  console.log(`  final exam bank included  ${bankPresent ? "yes" : "NO — not yet authored"}`);
  console.log(`  written ................. ${path.relative(root, outPath)}`);
  if (failures.length) {
    console.log(`\nFAILURES (${failures.length}):`);
    for (const f of failures.slice(0, 30)) console.log(`  - ${f}`);
  } else {
    console.log("\nOK — every assessment item resolves to a real unit, a real screen, and recorded sources.");
  }
}

process.exitCode = failures.length ? 1 : 0;
