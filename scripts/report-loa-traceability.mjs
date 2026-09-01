/**
 * TX Law of Agency — assessment-to-instruction traceability crosswalk.
 *
 * THE RULE THIS ENFORCES. Every quiz item, replacement question, misconception check, scenario task
 * and final-examination item must map to (a) the LOA-1 topic and unit it examines, (b) the specific
 * instructional screen a student is sent to, (c) the unit's learning objective, (d) the judgment the
 * item asks the candidate to make, and (e) the controlling source where the item tests law. Nothing
 * may test content that exists in a source file but not in student instruction: an item can be
 * perfectly correct about Texas law and still be an unfair question if the course never taught it.
 *
 * HOW THE SCREEN IS RESOLVED, AND WHY THAT IS THE HARD PART. An item names a unit and a remediation
 * anchor. The generated block maps name, for each unit, the screens that carry it. Joining the two
 * gives the screen id a student actually lands on — the thing a reviewer wants and the thing nobody
 * maintains by hand. This script computes that join rather than asking anyone to keep a table in
 * step with four moving artifacts.
 *
 * ── CONFIDENTIALITY, AND WHAT THIS ARTIFACT DELIBERATELY OMITS ─────────────────────────────────
 * The output is written to texas/tx-law-of-agency-30-v1/traceability.json, which is tracked but is
 * not a served tree. It carries, for every item: the id, the topic, the unit, the module, the block,
 * the screen, the remediation anchor, the unit's learning objective, the item's tested judgment, and
 * the controlling sources. It carries NO prompt, NO choice, NO correct answer and NO rationale, for
 * any kind of item. 22 TAC § 535.65(h)(2) requires final examination questions to be kept
 * confidential, and an artifact that reproduced the bank into a tracked JSON file would have
 * defeated that whether or not the file is served. The `judgement` field is what makes the omission
 * tolerable: it states what each item asks the candidate to decide without stating the answer, so a
 * reviewer can audit the instrument's coverage from this file and read the items themselves in
 * config/, under whatever supervision the provider applies.
 *
 * WHAT A GAP MEANS HERE. LOA-1 has 57 units and § 535.62(b)(7)(A) sets a floor per TOPIC, not per
 * unit — but this course assesses every unit formatively and examines every unit summatively, so an
 * unassessed unit is reported and is a failure rather than a note. The script also fails on an item
 * naming a unit that does not exist, an anchor resolving to no screen, an item whose anchor sends
 * the student to a different unit than the one it examines, and an item that tests law while its
 * unit records no read source.
 *
 * Usage:  node scripts/report-loa-traceability.mjs [--json]
 * Exit 0 only when every assessment item resolves to real instruction.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { TOPICS, ALL_UNITS } from "../config/texas/law-of-agency-course-form.mjs";
import { UNIT_TRACE } from "../config/texas/law-of-agency-course.mjs";
import { SECTIONS_READ } from "../config/texas/law-of-agency-statute-sources.mjs";
import { allItems, allReplacements } from "../config/texas/law-of-agency-question-bank.mjs";
import { MISCONCEPTION_CHECKS } from "../config/texas/law-of-agency-misconception-checks.mjs";
import { SCENARIOS } from "../config/texas/law-of-agency-scenarios.mjs";
import { FINAL_EXAM_BANK } from "../config/texas/law-of-agency-final-exam-bank.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOME = path.join(root, "texas/tx-law-of-agency-30-v1");

/* The anchors in every artifact are GitHub-style slugs of the unit heading. Slug the block titles
   the same way so the join is exact rather than heuristic. */
const slug = (s) => s.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");

const failures = [];

/* ── unit → screens, from the generated block maps ─────────────────────────────────────────── */
const screensByUnit = new Map();
const screensByAnchor = new Map();
for (let n = 1; n <= 12; n += 1) {
  const mod = await import(`../config/texas/law-of-agency-module-${n}-blocks.mjs`);
  const delivery = mod[`MODULE_${n}_BLOCKS`] ?? mod.default;
  const file = `module-${String(n).padStart(2, "0")}.md`;
  for (const block of delivery.blocks) {
    if (!block.code) continue; /* the recap block and any optional-reference block carry no unit code */
    const instruction = block.screens.filter((screen) => screen.type === "instruction");
    screensByUnit.set(block.code, {
      module: file,
      blockId: block.id,
      unitTitle: block.title,
      objective: block.learningObjective ?? null,
      screens: block.screens.map((screen) => screen.id),
      firstInstructionScreen: instruction[0]?.id ?? null,
    });
    screensByAnchor.set(`${file}#unit-${slug(block.title)}`, {
      unit: block.code,
      screenId: instruction[0]?.id ?? null,
      module: file,
    });
  }
}

const unitByCode = new Map(ALL_UNITS.map((unit) => [unit.code, unit]));
const traceByUnit = new Map(UNIT_TRACE.map((trace) => [trace.code, trace]));

/* unit -> the sections the source register records as read AND cited for that unit. A section that
   is read but cited only in a module recap or an optional-reference block is deliberately not
   counted here: an assessment item must rest on instruction a student is required to read. */
const readByUnit = new Map(ALL_UNITS.map((unit) => [unit.code, []]));
for (const section of SECTIONS_READ) {
  for (const unitCode of [...(section.primaryUnits || []), ...(section.pointerUnits || [])]) {
    const list = readByUnit.get(unitCode);
    if (!list) continue;
    /* The register's `citation` is the CHAPTER for a statute ("Tex. Occupations Code ch. 1101")
       and the SECTION itself for a Commission rule ("22 TAC §535.1"), so appending the section
       number unconditionally would print it twice for the rules. Append only when the citation does
       not already carry it. */
    const bare = String(section.citation).replace(/\s+/g, "");
    const label = bare.includes(`§${String(section.section).replace(/\s+/g, "")}`)
      ? String(section.citation)
      : `${section.citation} § ${section.section}`;
    if (!list.includes(label)) list.push(label);
  }
}

/** One traceability row per assessment item. Nothing answer-bearing goes into it. */
function row({ kind, id, unitCode, anchor, screenId, judgement, sources, testsLaw = true, confidential = false }) {
  const unit = unitByCode.get(unitCode);
  if (!unit) {
    failures.push(`${kind} ${id}: names unit ${unitCode}, which is not an LOA-1 unit`);
    return null;
  }
  const delivery = screensByUnit.get(unitCode);
  if (!delivery) failures.push(`${kind} ${id}: unit ${unitCode} has no generated block`);

  /* Two artifacts point at instruction two ways. The formative bank names a SCREEN ID directly; the
     scenario tasks and the examination bank name a heading ANCHOR. Both are resolved against the
     generated block maps, and a value that resolves to nothing is a failure either way. */
  const resolvedAnchor = anchor ? screensByAnchor.get(anchor) : null;
  if (anchor && !resolvedAnchor) failures.push(`${kind} ${id}: anchor ${anchor} resolves to no screen`);
  if (resolvedAnchor && resolvedAnchor.unit !== unitCode) {
    failures.push(`${kind} ${id}: examines ${unitCode} but its anchor sends the student to ${resolvedAnchor.unit}`);
  }
  if (screenId && delivery && !delivery.screens.includes(screenId)) {
    failures.push(`${kind} ${id}: names screen ${screenId}, which is not a screen of block ${delivery.blockId}`);
  }

  const trace = traceByUnit.get(unitCode);
  const unitSources = readByUnit.get(unitCode) ?? [];
  if (testsLaw && !unitSources.length) {
    failures.push(`${kind} ${id}: tests law but unit ${unitCode} records no read source`);
  }
  if (!judgement) failures.push(`${kind} ${id}: records no tested judgment`);

  return {
    kind,
    id,
    topic: unitCode.slice(0, 3),
    unit: unitCode,
    unitTitle: unit.unit,
    module: delivery?.module ?? null,
    blockId: delivery?.blockId ?? null,
    screenId: screenId ?? resolvedAnchor?.screenId ?? delivery?.firstInstructionScreen ?? null,
    remediationAnchor: anchor ?? null,
    objective: delivery?.objective ?? trace?.objective ?? null,
    judgement: judgement ?? null,
    /* Sources the ITEM names where it names them, falling back to the sources the unit records as
       read. An item's own source line is the section a reviewer wants; the unit's read record is
       the evidence that the section was actually read for this course. */
    controllingSources: (sources && sources.length ? sources : unitSources).map(String),
    unitReadSources: unitSources,
    unitObjectiveSource: delivery?.objective ? "block map" : (trace?.objective ? "course record" : null),
    confidential,
  };
}

const rows = [];

/* topic-quiz primaries and their replacements */
const replacementByPrimary = new Map(allReplacements().map((r) => [r.replaces, r]));
for (const item of allItems()) {
  rows.push(row({
    kind: "quiz",
    id: item.id,
    unitCode: item.tests,
    screenId: item.screen ?? null,
    judgement: item.judgement,
    sources: item.section ? [`${item.source} ${item.section}`] : (item.source ? [item.source] : []),
  }));
  const replacement = replacementByPrimary.get(item.id);
  if (!replacement) {
    failures.push(`quiz ${item.id}: has no replacement item`);
    continue;
  }
  rows.push(row({
    kind: "replacement",
    id: replacement.id,
    unitCode: replacement.tests,
    screenId: replacement.screen ?? null,
    judgement: replacement.judgement,
    sources: replacement.section ? [`${replacement.source} ${replacement.section}`] : (replacement.source ? [replacement.source] : []),
  }));
}

/* misconception checks — formative and instructional, and they say so about themselves */
for (const check of MISCONCEPTION_CHECKS) {
  rows.push(row({
    kind: "misconception-check",
    id: check.id,
    unitCode: check.unitCode,
    anchor: null,
    judgement: check.misconception ? `Whether the candidate still holds the misconception: ${check.misconception}` : null,
    sources: check.sources || [],
  }));
}

/* scenario tasks — a scenario assesses several units, so each task's unit is the one its own
   remediation anchor names */
for (const scenario of SCENARIOS) {
  for (const task of scenario.tasks) {
    const resolved = task.remediation ? screensByAnchor.get(task.remediation) : null;
    const unitCode = resolved?.unit ?? task.unitCodes?.[0] ?? scenario.assessesUnits?.[0];
    rows.push(row({
      kind: "scenario-task",
      id: task.id,
      unitCode,
      anchor: task.remediation ?? null,
      judgement: task.judgement,
      sources: task.sources || [],
    }));
  }
}

/* final examination items — confidential, and the row says so */
for (const entry of FINAL_EXAM_BANK) {
  rows.push(row({
    kind: "final-exam",
    id: entry.id,
    unitCode: entry.unit,
    anchor: entry.teaches,
    judgement: entry.judgement,
    sources: [entry.source],
    confidential: true,
  }));
}

const clean = rows.filter(Boolean);

/* ── coverage ──────────────────────────────────────────────────────────────────────────────── */
const assessedUnits = new Set(clean.map((r) => r.unit));
const examinedUnits = new Set(clean.filter((r) => r.kind === "final-exam").map((r) => r.unit));
const unassessed = ALL_UNITS.map((u) => u.code).filter((c) => !assessedUnits.has(c));
const unexamined = ALL_UNITS.map((u) => u.code).filter((c) => !examinedUnits.has(c));
if (unassessed.length) failures.push(`units with instruction but no assessment: ${unassessed.join(", ")}`);
if (unexamined.length) failures.push(`units with instruction but no examination item: ${unexamined.join(", ")}`);

const byTopic = {};
for (const topic of TOPICS) byTopic[topic.code] = clean.filter((r) => r.topic === topic.code).length;

const out = {
  generatedBy: "scripts/report-loa-traceability.mjs",
  note:
    "Every assessment item mapped to its LOA-1 unit, the instructional screen a student is sent to, the unit's learning objective, the judgment the item tests, and the controlling sources. Computed from the generated block maps rather than maintained by hand.",
  confidentiality:
    "This file carries no prompt, no choice, no correct answer and no rationale, for any kind of item. 22 TAC § 535.65(h)(2) requires final examination questions to be kept confidential; the `judgement` field states what each item asks the candidate to decide without stating the answer. Rows for the secure bank are flagged confidential:true.",
  totals: {
    items: clean.length,
    byKind: clean.reduce((acc, r) => { acc[r.kind] = (acc[r.kind] || 0) + 1; return acc; }, {}),
    itemsByTopic: byTopic,
    unitsAssessed: assessedUnits.size,
    unitsExamined: examinedUnits.size,
    unitsTotal: ALL_UNITS.length,
    unitsUnassessed: unassessed,
    unitsUnexamined: unexamined,
  },
  rows: clean,
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(out, null, 2));
} else {
  const outPath = path.join(HOME, "traceability.json");
  fs.writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`);
  console.log("TX Law of Agency — assessment-to-instruction traceability\n");
  console.log(`  items mapped ............ ${clean.length}`);
  for (const [kind, count] of Object.entries(out.totals.byKind)) console.log(`    ${kind.padEnd(20)} ${count}`);
  console.log(`  units assessed .......... ${assessedUnits.size} of ${ALL_UNITS.length}`);
  console.log(`  units examined .......... ${examinedUnits.size} of ${ALL_UNITS.length}`);
  console.log(`  items per topic ......... ${TOPICS.map((t) => `${t.code}:${byTopic[t.code]}`).join(" ")}`);
  console.log(`  written ................. ${path.relative(root, outPath)}`);
  if (failures.length) {
    console.log(`\nFAILURES (${failures.length}):`);
    for (const failure of failures.slice(0, 40)) console.log(`  - ${failure}`);
  } else {
    console.log("\nOK — every assessment item resolves to a real unit, a real screen, a stated objective, a stated judgment and recorded sources.");
  }
}

process.exitCode = failures.length ? 1 : 0;
