/**
 * TX Law of Agency — structural gate on the authored curriculum.
 *
 * WHAT THIS CHECKS. That each module file is the module the LOA-1 form says it is: the right topic
 * heading, the form's unit titles character-for-character in the form's own order, exercises inside
 * units rather than clustered at the end, a recap last, and no length-shaped instruction anywhere.
 * The block-map generator derives screen ranges from these headings, so a drifted heading is not a
 * cosmetic problem — it silently breaks the generated course.
 *
 * WHAT IT DOES NOT CHECK. Whether anything said is true. That is the claim audit's job.
 *
 * Usage:  node scripts/check-loa-module-structure.mjs
 * Exit 0 only when every module present passes.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOPICS } from "../config/texas/law-of-agency-course-form.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(root, "texas/tx-law-of-agency-30-v1/curriculum");

/* A length requirement turns an exercise into a word-count game. The work order forbids it outright
   ("Do not require students to type 80 characters merely to reveal an answer"), so it is checked
   mechanically rather than left to the author's discretion. */
const LENGTH_PHRASE =
  /\b(?:at least|minimum of|no fewer than|no less than|write|type)\s+\d+\s*(?:\+)?\s*(?:words?|characters?|sentences?|paragraphs?)\b|\b\d+\s*(?:words?|characters?)\s+(?:minimum|or more)\b/i;

let failures = 0;
const fail = (m) => { console.log(`  FAIL  ${m}`); failures += 1; };

const rows = [];
for (const [index, topic] of TOPICS.entries()) {
  const n = String(index + 1).padStart(2, "0");
  const file = `module-${n}.md`;
  const full = path.join(DIR, file);
  if (!fs.existsSync(full)) { rows.push({ file, topic: topic.code, status: "MISSING" }); continue; }
  const md = fs.readFileSync(full, "utf8");
  console.log(`\n${file}  ${topic.code} ${topic.topic}`);

  if (!md.startsWith(`# Texas Law of Agency — Module ${n}\n`)) fail(`${file}: first line is not "# Texas Law of Agency — Module ${n}"`);
  if (!md.includes(`## TREC Topic: ${topic.topic}\n`)) fail(`${file}: missing or altered "## TREC Topic: ${topic.topic}"`);
  if (!new RegExp(`\\*\\*Prescribed time: ${topic.subtotalMinutes} minutes\\.\\*\\*`).test(md))
    fail(`${file}: does not state the form's prescribed ${topic.subtotalMinutes} minutes`);

  const emitted = [...md.matchAll(/^## Unit: (.+)$/gm)].map((m) => m[1]);
  const expected = topic.units.map((u) => u.unit);
  if (emitted.length !== expected.length) fail(`${file}: ${emitted.length} unit headings, form prescribes ${expected.length}`);
  expected.forEach((want, i) => {
    if (emitted[i] !== want) fail(`${file}: unit ${i + 1} heading is ${JSON.stringify(emitted[i] ?? null)}, form says ${JSON.stringify(want)}`);
  });

  /* Exercises must sit inside the unit they belong to. An exercise emitted before the first unit
     heading, or after the recap, is not attached to anything the generator can address. */
  const firstUnitAt = md.search(/^## Unit: /m);
  const recapAt = md.search(/^### Module recap\s*$/m);
  if (recapAt < 0) fail(`${file}: no "### Module recap"`);
  const statute = [...md.matchAll(/^### Statute reading exercise: .+$/gm)];
  const applied = [...md.matchAll(/^### Applied exercise: .+$/gm)];
  for (const e of [...statute, ...applied]) {
    if (e.index < firstUnitAt) fail(`${file}: exercise precedes the first unit — ${e[0]}`);
    if (recapAt >= 0 && e.index > recapAt) fail(`${file}: exercise emitted after the recap — ${e[0]}`);
  }
  if (statute.length < 1) fail(`${file}: no statute reading exercise`);
  if (applied.length < 2) fail(`${file}: ${applied.length} applied exercises, at least 2 required`);
  if (recapAt >= 0 && md.slice(recapAt).trim().split("\n").length < 8) fail(`${file}: recap is too short to walk the module`);

  const lm = md.match(LENGTH_PHRASE);
  if (lm) fail(`${file}: states a length requirement — ${JSON.stringify(lm[0])}`);

  /* No course in this build may claim approval it does not have. The negation is the required
     disclaimer, so it is excluded rather than flagged. */
  for (const m of md.matchAll(/[^.\n]*TREC[- ]approved[^.\n]*\./g)) {
    if (!/\bnot\b/i.test(m[0])) fail(`${file}: approval claim — ${JSON.stringify(m[0].trim())}`);
  }

  /* Teaching prose excludes exercise blocks and the recap; those are paid for by activity
     allowances in the time model and must not also be counted as reading. */
  const cuts = [...statute, ...applied].map((m) => m.index).concat(recapAt >= 0 ? [recapAt] : []).sort((a, b) => a - b);
  let prose = md, removed = 0;
  {
    const blocks = [];
    /* An exercise block ends at the NEXT HEADING OF ANY LEVEL, not merely the next "###". Ending
       it at the next "###" lets a block that is followed by a "## Unit:" run straight through that
       unit's teaching prose and delete it from the count — which understated module 06 by roughly
       13,000 words on the first run of this script. The recap runs to end of file by definition. */
    const marks = [...md.matchAll(/^#{2,3} .+$/gm)].map((m) => m.index);
    for (const start of cuts) {
      const next = marks.find((i) => i > start);
      const end = start === recapAt ? md.length : (next ?? md.length);
      blocks.push([start, end]);
    }
    blocks.sort((a, b) => b[0] - a[0]);
    for (const [s, e] of blocks) { removed += e - s; prose = prose.slice(0, s) + prose.slice(e); }
  }
  const words = (s) => (s.match(/\S+/g) || []).length;
  rows.push({ file, topic: topic.code, status: "OK", units: emitted.length, prose: words(prose), total: words(md),
    statuteExercises: statute.length, appliedExercises: applied.length });
  console.log(`  units ${emitted.length}/${expected.length} · prose ${words(prose).toLocaleString()} w · total ${words(md).toLocaleString()} w · exercises ${statute.length} statute / ${applied.length} applied`);
}

console.log("\n— summary —");
const present = rows.filter((r) => r.status === "OK");
const missing = rows.filter((r) => r.status === "MISSING");
console.log(`modules written: ${present.length}/12` + (missing.length ? `  missing: ${missing.map((r) => r.file).join(", ")}` : ""));
console.log(`units emitted:   ${present.reduce((a, r) => a + r.units, 0)} of 57`);
console.log(`teaching prose:  ${present.reduce((a, r) => a + r.prose, 0).toLocaleString()} words`);
console.log(`whole corpus:    ${present.reduce((a, r) => a + r.total, 0).toLocaleString()} words`);
console.log(failures ? `\n${failures} structural failure(s)` : "\nno structural failures");
process.exitCode = failures ? 1 : 0;
