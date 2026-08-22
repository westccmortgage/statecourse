#!/usr/bin/env node
/*
 * The closeout queue.
 *
 * The release gate answers whether the submission is ready. This answers the next question,
 * which is what to do about it — every outstanding deliverable, in the order it should be
 * worked, with the gate it blocks, the evidence still missing, whether more code will finish it
 * or a person has to sign something, and the single next action.
 *
 * It exists so that work proceeds top-down instead of by rediscovery. Twice now the effort went
 * into something already finished, because "what is left" had to be reconstructed by reading a
 * gate report and remembering which parts of it were about absence rather than failure.
 *
 * Every field is derived from the deliverable ledger and the files on disk. Nothing here is a
 * plan somebody typed; if the queue is empty, it is empty because the evidence exists.
 *
 * Usage:
 *   node scripts/closeout-queue.mjs           the table
 *   node scripts/closeout-queue.mjs --json    id / owner / blocking_gate / status /
 *                                            evidence_required / human_or_build / next_action
 *   node scripts/closeout-queue.mjs --all     satisfied deliverables too
 *   node scripts/closeout-queue.mjs --first-filing   only the course being filed first
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { FIRST_FILING, allDeliverables, deliverablesFor } from "../config/california/regulatory-manifest.mjs";
import { statusOf } from "../lib/deliverable-status.mjs";

const args = process.argv.slice(2);
const AS_JSON = args.includes("--json");
const SHOW_ALL = args.includes("--all");
const FIRST_ONLY = args.includes("--first-filing");

const ledger = FIRST_ONLY ? deliverablesFor(FIRST_FILING.courseId) : allDeliverables();

/*
 * Ordering. A queue sorted by anything other than the order the work should happen in is a list,
 * and a list gets read from the top by whoever is quickest rather than by whoever is next.
 *
 * Build work first, because it is what can start now; then the items waiting on a person, which
 * have lead times and should be set going early but cannot be finished by working harder; and
 * within each group by work order section, which is the order the sections were written in.
 */
const sectionKey = (section) => {
  const match = /^§(\d+)([A-Za-z]?)$/.exec(section);
  return match ? [Number(match[1]), match[2] || ""] : [999, section];
};
const rank = (entry) => (entry.owner === "build" ? 0 : 1);

const rows = ledger
  .map((deliverable) => {
    const status = statusOf(deliverable);
    return {
      id: deliverable.id,
      label: deliverable.label,
      owner: deliverable.owner,
      blocking_gate: "CA_DRE_SUBMISSION_READY",
      section: deliverable.section,
      program: status.programTitle,
      scope: deliverable.scope,
      status: status.satisfied ? "satisfied" : "outstanding",
      evidence_required: status.missing.map((file) => `${file.path} — ${file.reason}`),
      evidence_present: status.evidence.filter((file) => file.present).map((file) => file.path),
      human_or_build: deliverable.owner,
      next_action: status.satisfied ? null : deliverable.nextAction,
      note: deliverable.note,
    };
  })
  .filter((row) => SHOW_ALL || row.status === "outstanding")
  .sort((left, right) => {
    if (rank(left) !== rank(right)) return rank(left) - rank(right);
    const [leftNumber, leftLetter] = sectionKey(left.section);
    const [rightNumber, rightLetter] = sectionKey(right.section);
    if (leftNumber !== rightNumber) return leftNumber - rightNumber;
    if (leftLetter !== rightLetter) return leftLetter.localeCompare(rightLetter);
    return left.label.localeCompare(right.label);
  });

/* One deliverable outstanding across three courses is one piece of work, not three, and a queue
   that listed it three times would overstate what is left. The courses it applies to are a
   column. */
const collapsed = [];
for (const row of rows) {
  const existing = collapsed.find((entry) => entry.id === row.id && entry.status === row.status);
  if (existing) {
    if (row.program && !existing.programs.includes(row.program)) existing.programs.push(row.program);
    for (const item of row.evidence_required) if (!existing.evidence_required.includes(item)) existing.evidence_required.push(item);
    continue;
  }
  collapsed.push({ ...row, programs: row.program ? [row.program] : [], program: undefined });
}

if (AS_JSON) {
  console.log(
    JSON.stringify(
      {
        generated_from: "config/california/regulatory-manifest.mjs REQUIRED_DELIVERABLES",
        first_filing: FIRST_FILING.title,
        scope: FIRST_ONLY ? "first filing only" : "all California programs",
        total: ledger.length,
        outstanding: collapsed.filter((row) => row.status === "outstanding").length,
        queue: collapsed.map((row) => ({
          id: row.id,
          owner: row.owner,
          blocking_gate: row.blocking_gate,
          section: row.section,
          status: row.status,
          evidence_required: row.evidence_required,
          human_or_build: row.human_or_build,
          next_action: row.next_action,
          programs: row.programs,
          note: row.note,
        })),
      },
      null,
      2,
    ),
  );
} else {
  const outstanding = collapsed.filter((row) => row.status === "outstanding");
  console.log(`\n  CALIFORNIA CLOSEOUT QUEUE — ${outstanding.length} outstanding of ${ledger.length} deliverables`);
  console.log(`  First filing: ${FIRST_FILING.title}${FIRST_ONLY ? " (this queue is scoped to it)" : ""}\n`);
  if (collapsed.length === 0) {
    console.log("  Nothing outstanding.\n");
  }
  let group = null;
  for (const row of collapsed) {
    if (row.human_or_build !== group) {
      group = row.human_or_build;
      console.log(
        group === "build"
          ? "  ── TO BE BUILT ──────────────────────────────────────────────────────────────────\n"
          : "\n  ── AWAITING A PERSON ────────────────────────────────────────────────────────────\n" +
              "  These have lead times. Start them now; they cannot be finished by working harder.\n",
      );
    }
    const scope = row.programs.length === 0 ? "filed once" : row.programs.length >= 3 ? "all courses" : row.programs.join(", ");
    console.log(`  ${row.section.padEnd(5)} ${row.id}`);
    console.log(`        ${row.label} — ${scope} — ${row.status}`);
    if (row.next_action) console.log(`        NEXT: ${row.next_action}`);
    for (const item of row.evidence_required.slice(0, 4)) console.log(`        missing: ${item}`);
    if (row.evidence_required.length > 4) console.log(`        missing: ... and ${row.evidence_required.length - 4} more`);
    console.log("");
  }
  console.log("  Every row blocks CA_DRE_SUBMISSION_READY. Work down, not around.\n");
}

process.exit(0);
