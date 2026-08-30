/**
 * TX Law of Agency — salvage audit of the drafts written under the withdrawn word quota.
 *
 * WHY. The twelve modules were authored against a per-module word minimum totalling about 102,000
 * words. That quota is withdrawn. An author told to reach a number will reach it, and the way prose
 * reaches a number it has not earned is repetition: the same proposition restated in fresh words a
 * few paragraphs later, a rule explained twice, a caution repeated in three registers. This script
 * looks for that mechanically so the decision to keep, condense or rewrite a module rests on
 * measurement rather than on how long the file looks.
 *
 * WHAT IT MEASURES.
 *   1. Teaching prose against the topic's floor in config/texas/law-of-agency-time-budget.mjs, and
 *      the excess over that floor — which is where quota-driven writing would have landed.
 *   2. Near-duplicate paragraph pairs within a module, by Jaccard token similarity. A pair above the
 *      threshold is two paragraphs saying the same thing; one of them is a condensation candidate.
 *   3. Repeated sentence-level openings and stock connective phrases, the fingerprints of padding.
 *   4. Out-of-state terminology — "dual agency" used as a synonym for the Texas intermediary rather
 *      than to explain why the terms are not interchangeable.
 *   5. Pre-2026 buyer-representation language stated as current law.
 *   6. Employment authorities stated beyond their statutory scope.
 *
 * WHAT IT DOES NOT DECIDE. Whether an excess is padding or necessary law. A module may exceed its
 * floor because the law it must teach takes that many words; T06's intermediary rules and T11's
 * DTPA are the obvious cases. This script surfaces candidates and quantifies them; the salvage
 * verdict is recorded per module by review.
 *
 * Usage:  node scripts/loa-salvage-audit.mjs [--json]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOPICS } from "../config/texas/law-of-agency-course-form.mjs";
import { BUDGET } from "../config/texas/law-of-agency-time-budget.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(root, "texas/tx-law-of-agency-30-v1/curriculum");
const OUT = path.join(root, "texas/tx-law-of-agency-30-v1/salvage-audit.json");

const DUPLICATE_THRESHOLD = 0.55;
const STOP = new Set("a an and are as at be been but by can do does for from had has have if in into is it its may must no not of on or shall should so than that the their them then there these they this to under was were what when which who will with would you your".split(" "));

const tokens = (s) => (s.toLowerCase().match(/[a-z0-9§.()-]+/g) || []).filter((t) => t.length > 2 && !STOP.has(t));
const jaccard = (a, b) => {
  const A = new Set(a), B = new Set(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  return inter / (A.size + B.size - inter);
};

/* "dual agency" is legitimate in this course only where it is being distinguished from the Texas
   intermediary. A sentence that uses it as a label for what a Texas broker does is the defect. */
const DUAL_OK = /\bnot\b|\bnever\b|\babolish|\breplac|\bunlike\b|\bother state|\bdiffer|\binstead\b|\bno longer\b|\bcannot\b|\bmay not\b|\bwhy\b|\bconfus|\bmistake|\berror\b|\bterms? (?:are|is)\b|\bhistor/i;
/* Employment authorities carry their own scope words. A sentence that generalises one of them past
   its subtitle or title is the defect the work order names. */
const EMPLOYMENT_OVERREACH =
  /\u00a7\s*201\.072[^.]{0,200}?\b(?:controls?|controlling|governs?|determines?|decides?)\b[^.]{0,120}?\b(?:classification|status|employee|independent contractor)\b(?![^.]{0,80}\bunemployment\b)|26\s+U\.S\.C\.[^.]{0,60}3508[^.]{0,200}?\b(?:Texas|state law|workers'? compensation|wage|discrimination)\b/gi;

const rows = [];
for (const [index, topic] of TOPICS.entries()) {
  const n = String(index + 1).padStart(2, "0");
  const file = `module-${n}.md`;
  const full = path.join(DIR, file);
  const budget = BUDGET.find((b) => b.topicCode === topic.code);
  if (!fs.existsSync(full)) { rows.push({ file, topicCode: topic.code, present: false, budget }); continue; }
  const md = fs.readFileSync(full, "utf8");

  /* Teaching prose only: exercise and recap blocks run to the next heading of any level. */
  const marks = [...md.matchAll(/^#{2,3} .+$/gm)].map((m) => m.index);
  const cuts = [...md.matchAll(/^### (?:Statute reading exercise|Applied exercise): .+$/gm)].map((m) => m.index);
  const recapAt = md.search(/^### Module recap\s*$/m);
  if (recapAt >= 0) cuts.push(recapAt);
  let prose = md;
  const blocks = cuts.sort((a, b) => a - b).map((s) => [s, s === recapAt ? md.length : (marks.find((i) => i > s) ?? md.length)]);
  for (const [s, e] of blocks.sort((a, b) => b[0] - a[0])) prose = prose.slice(0, s) + prose.slice(e);

  const words = (prose.match(/\S+/g) || []).length;
  const paras = prose.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter((p) => p.length > 220 && !p.startsWith("#"));

  const dupes = [];
  const toks = paras.map(tokens);
  for (let i = 0; i < paras.length; i += 1) {
    for (let j = i + 1; j < paras.length; j += 1) {
      const sim = jaccard(toks[i], toks[j]);
      if (sim >= DUPLICATE_THRESHOLD) dupes.push({ similarity: Number(sim.toFixed(3)), a: paras[i].slice(0, 140), b: paras[j].slice(0, 140) });
    }
  }
  dupes.sort((x, y) => y.similarity - x.similarity);

  const sentences = prose.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const openings = new Map();
  for (const s of sentences) {
    const key = tokens(s).slice(0, 4).join(" ");
    if (key.split(" ").length < 4) continue;
    openings.set(key, (openings.get(key) || 0) + 1);
  }
  const repeatedOpenings = [...openings.entries()].filter(([, c]) => c >= 3).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const dualMisuse = [];
  for (const m of prose.matchAll(/[^.\n]*\bdual agen(?:cy|t)\b[^.\n]*\./gi)) {
    if (!DUAL_OK.test(m[0])) dualMisuse.push(m[0].trim().slice(0, 200));
  }
  const employmentOverreach = [...prose.matchAll(EMPLOYMENT_OVERREACH)].map((m) => m[0].slice(0, 200));

  /* Pre-2026 statements presented as current: the repealed subagency definition, or a claim that no
     written buyer agreement is needed, without the 2026 framing. */
  const stale = [];
  for (const m of prose.matchAll(/[^.\n]*\b(?:no written (?:buyer )?agreement is (?:required|needed)|without any written agreement|buyer'?s agent need not)\b[^.\n]*\./gi)) {
    if (!/\b(?:before|prior to|until|2026|1101\.56[23]|repealed|no longer|used to|formerly)\b/i.test(m[0])) stale.push(m[0].trim().slice(0, 200));
  }

  const floor = budget.minimumProseWords;
  rows.push({
    file, topicCode: topic.code, topic: topic.topic, present: true,
    prescribedMinutes: budget.prescribedMinutes, floorWords: floor, proseWords: words,
    excessWords: words - floor, excessRatio: floor ? Number((words / floor).toFixed(2)) : null,
    paragraphsExamined: paras.length, nearDuplicatePairs: dupes.length, topDuplicates: dupes.slice(0, 3),
    repeatedOpenings, dualAgencyMisuse: dualMisuse, employmentOverreach, staleBuyerRepresentation: stale,
  });
}

const present = rows.filter((r) => r.present);
const report = {
  generatedBy: "scripts/loa-salvage-audit.mjs",
  measuredAgainst: "config/texas/law-of-agency-time-budget.mjs — floors derived from LOA-1 prescribed minutes, not a word quota",
  duplicateThreshold: DUPLICATE_THRESHOLD,
  note: "Excess over a floor is not by itself a defect. This script quantifies candidates; the salvage verdict per module is recorded by review.",
  totals: {
    modulesPresent: present.length,
    floorWords: present.reduce((s, r) => s + r.floorWords, 0),
    proseWords: present.reduce((s, r) => s + r.proseWords, 0),
    nearDuplicatePairs: present.reduce((s, r) => s + r.nearDuplicatePairs, 0),
    dualAgencyMisuse: present.reduce((s, r) => s + r.dualAgencyMisuse.length, 0),
    employmentOverreach: present.reduce((s, r) => s + r.employmentOverreach.length, 0),
    staleBuyerRepresentation: present.reduce((s, r) => s + r.staleBuyerRepresentation.length, 0),
  },
  modules: rows,
};
fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);

if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
else {
  console.log("TX Law of Agency — salvage audit against the LOA-1 time budget\n");
  console.log("mod  topic  prescribed   floor    prose   excess  ratio  dupes  dual  empl  stale");
  for (const r of rows) {
    if (!r.present) { console.log(`${r.file.slice(7, 9)}   ${r.topicCode}          — not written —`); continue; }
    const p = (v, n) => String(v).padStart(n);
    console.log(`${r.file.slice(7, 9)}   ${r.topicCode}   ${p(r.prescribedMinutes, 8)} ${p(r.floorWords.toLocaleString(), 8)} ${p(r.proseWords.toLocaleString(), 8)} ${p(r.excessWords.toLocaleString(), 8)}  ${p(r.excessRatio, 5)} ${p(r.nearDuplicatePairs, 6)} ${p(r.dualAgencyMisuse.length, 5)} ${p(r.employmentOverreach.length, 5)} ${p(r.staleBuyerRepresentation.length, 6)}`);
  }
  const t = report.totals;
  console.log(`\n${t.modulesPresent} modules · floor ${t.floorWords.toLocaleString()} w · prose ${t.proseWords.toLocaleString()} w · ${t.nearDuplicatePairs} near-duplicate paragraph pairs`);
  console.log(`out-of-state "dual agency" uses: ${t.dualAgencyMisuse} · employment overreach: ${t.employmentOverreach} · stale buyer-representation: ${t.staleBuyerRepresentation}`);
  console.log("written:", path.relative(root, OUT));
}
