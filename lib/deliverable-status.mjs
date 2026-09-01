/*
 * Is a deliverable there?
 *
 * The release gate used to answer a narrower question — did every check pass — and a check
 * that was never written cannot fail. Three deliverables were missing entirely while the gate
 * printed GRANTED, and it was right about everything it looked at.
 *
 * This is the part that looks at what it was told to expect rather than at what happens to be
 * present. Each deliverable names the files that must exist and, where the requirement is one
 * of substance rather than of presence, the words those files must carry. A file that exists
 * but is empty is not a deliverable, and neither is a General Information Page for the
 * practice course that never mentions SB 1495.
 *
 * The result distinguishes what is outstanding from who it is outstanding on. A missing
 * signature and a missing traceability document are both blockers, but only one of them is
 * something more code will fix, and a status line that blurred the two would send a reader to
 * the wrong place.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { allDeliverables, deliverablesFor } from "../config/california/regulatory-manifest.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* Presence is not the test. A file of three bytes satisfies existsSync and satisfies nothing
   else, and an empty placeholder is the failure mode a presence check invites. */
const MINIMUM_MEANINGFUL_BYTES = 200;

function evidenceStatus(file) {
  const full = path.join(ROOT, file.path);
  if (!fs.existsSync(full)) return { ...file, present: false, reason: "does not exist" };
  const stat = fs.statSync(full);
  if (stat.size < MINIMUM_MEANINGFUL_BYTES) {
    return { ...file, present: false, reason: `is ${stat.size} bytes, which is not a document` };
  }
  if (file.mustContain.length === 0) return { ...file, present: true, reason: null };

  /* Only text is read for content. A PDF's bytes are not its words, and a requirement of
     substance stated against a PDF would have to extract it first — which this does not do,
     so it says so rather than passing a check it did not perform. */
  if (!/\.(md|txt|html|json|mjs|js|sql|csv)$/i.test(file.path)) {
    return { ...file, present: false, reason: "carries a content requirement but is not a text file this can read" };
  }
  const text = fs.readFileSync(full, "utf8");
  const missing = file.mustContain.filter((phrase) => !text.toLowerCase().includes(phrase.toLowerCase()));
  if (missing.length > 0) {
    return { ...file, present: false, reason: `does not state ${missing.map((phrase) => `"${phrase}"`).join(", ")}` };
  }
  return { ...file, present: true, reason: null };
}

export function statusOf(deliverable) {
  const evidence = deliverable.evidence.map(evidenceStatus);
  const missing = evidence.filter((file) => !file.present);
  return {
    id: deliverable.id,
    label: deliverable.label,
    section: deliverable.section,
    owner: deliverable.owner,
    program: deliverable.program ?? null,
    programTitle: deliverable.programTitle ?? null,
    satisfied: missing.length === 0,
    evidence,
    missing,
    note: deliverable.note,
  };
}

/** Every deliverable of the whole California submission programme, evaluated. */
export function submissionStatus() {
  return allDeliverables().map(statusOf);
}

/** The deliverables of one course's packet, evaluated. */
export function packetStatus(programKey) {
  return deliverablesFor(programKey).map(statusOf);
}

/*
 * Outstanding work, grouped the way a reader needs it: by work order section, because that is
 * how the work is assigned, and split by owner, because "write this" and "sign this" are not
 * the same instruction.
 */
export function outstanding(statuses) {
  const groups = new Map();
  for (const status of statuses.filter((entry) => !entry.satisfied)) {
    const key = `${status.section} ${status.owner} ${status.label}`;
    if (!groups.has(key)) {
      groups.set(key, { section: status.section, owner: status.owner, label: status.label, programs: [], reasons: new Set() });
    }
    const group = groups.get(key);
    if (status.programTitle && !group.programs.includes(status.programTitle)) group.programs.push(status.programTitle);
    for (const file of status.missing) group.reasons.add(`${file.path} ${file.reason}`);
  }
  return [...groups.values()]
    .map((group) => ({ ...group, reasons: [...group.reasons] }))
    .sort((a, b) => a.section.localeCompare(b.section, "en", { numeric: true }) || a.label.localeCompare(b.label));
}
