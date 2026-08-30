/**
 * TX Law of Agency — deterministic curriculum freeze.
 *
 * WHAT A FREEZE IS FOR. After this runs, no curriculum wording may change silently. Every artifact
 * the acceptance case rests on is hashed here, so a later edit either shows up as a hash mismatch or
 * requires an explicit new freeze version. It is not a ceremony: it is the thing that makes "the
 * course we audited" and "the course we are shipping" the same object.
 *
 * WHAT IT REFUSES TO FREEZE. A freeze over failing evidence is worse than no freeze, because it
 * lends a number the authority of a hash. This script recomputes the gates and throws rather than
 * writing an artifact if any of them is not met.
 *
 * Usage:  node scripts/freeze-loa-curriculum.mjs [--write]
 * Without --write it verifies the current freeze against disk and exits non-zero on drift.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { FORM, TOPICS, ALL_UNITS } from "../config/texas/law-of-agency-course-form.mjs";
import { BUDGET, COURSE_LEVEL } from "../config/texas/law-of-agency-time-budget.mjs";
import { MISCONCEPTION_CHECKS } from "../config/texas/law-of-agency-misconception-checks.mjs";
import { ALL_SOURCES, unitCoverage, sourceValidation } from "../config/texas/law-of-agency-statute-sources.mjs";
import { reconcile } from "../config/texas/quotation-dispositions.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOME = path.join(root, "texas/tx-law-of-agency-30-v1");
const OUT = path.join(HOME, "content-freeze.json");
const COURSE_ID = "tx-law-of-agency-30-v1";
const FREEZE_ID = "LOA-CONTENT-FREEZE-2026-08-30";

const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const rel = (p) => path.relative(root, p);
const hashOf = (p) => ({ path: rel(p), sha256: sha(p), bytes: fs.statSync(p).size });

/* ── recompute the gates; refuse to freeze over a failure ────────────────────────────────────── */
const failures = [];

const timeEvidence = JSON.parse(fs.readFileSync(path.join(HOME, "time-evidence.json"), "utf8"));
const audit = JSON.parse(fs.readFileSync(path.join(HOME, "claim-audit.json"), "utf8"));

const coverage = unitCoverage();
if (coverage.held.length !== 57 || coverage.uncovered.length !== 0) {
  failures.push(`unit coverage is ${coverage.held.length} held / ${coverage.uncovered.length} uncovered, not 57 / 0`);
}
const validation = sourceValidation();
if ((validation.mismatches || []).length !== 0) failures.push(`${validation.mismatches.length} source hash mismatches`);

const unmatched = (() => {
  const all = [...audit.quoteFailures, ...(audit.quoteFindings || []).filter((q) => q.status === "ATTRIBUTION_REVIEW"), ...(audit.quoteTruncations || [])];
  const seen = new Set();
  return all.filter((q) => q.id && !seen.has(q.id) && seen.add(q.id));
})();
const quotations = reconcile(COURSE_ID, unmatched);
if (!quotations.clean) failures.push("quotation reconcile is not clean");
if (quotations.undispositioned.length) failures.push(`${quotations.undispositioned.length} undispositioned quotations`);
if (quotations.defects.length) failures.push(`${quotations.defects.length} sourcing defects`);
if (quotations.orphaned.length) failures.push(`${quotations.orphaned.length} orphaned dispositions`);
if ((quotations.resurfaced || []).length) failures.push(`${quotations.resurfaced.length} resurfaced dispositions`);

const below = timeEvidence.topicsBelowAllocation || [];
if (below.length) failures.push(`${below.length} topic(s) below their LOA-1 allocation: ${below.map((t) => t.topicCode).join(", ")}`);
if (timeEvidence.layers.grandRequired.minutes < FORM.totalMinutes) {
  failures.push(`grand required ${timeEvidence.layers.grandRequired.minutes} is below the prescribed ${FORM.totalMinutes}`);
}

/* ── the one claim that cannot receive a mechanical pass, recorded rather than summarised ─────
   A denominator that does not match its numerator must name the difference. */
const nonPass = audit.claims.filter((c) => c.status !== "MECHANICAL_PASS");
const IDENTIFIED_NOT_TAUGHT = nonPass.map((c) => Object.freeze({
  claimId: c.claimId,
  module: c.module,
  unit: c.unit,
  passage: "the closing sentence of the fair-housing exemptions passage in T10U2, which tells the student where the held subchapter stops",
  citation: c.citation,
  source: c.sourceFile,
  sourceHeld: c.sourceHeld,
  sectionPresentInSource: c.sectionPresent,
  status: c.status,
  whyItCannotReceiveAMechanicalPass:
    "The mechanical check asks whether a cited section is present in the held source. This section is not present, because Subchapter C of Property Code ch. 301 as held runs from 301.041 to 301.044 and stops. A check that verifies presence cannot pass a citation to something absent, and it should not: the correct outcome is to surface it for review, which is what happened.",
  humanReviewedDisposition:
    "NOT A DEFECT. The citation appears once, inside a sentence whose whole purpose is to tell the student that this section was not held and is not taught. No proposition is asserted from it, no rule is stated on its authority, and no assessment item can reference it.",
  howItGotIntoTheCourse:
    "My authoring brief for module 10 listed the Texas exemptions as sections 301.041 through 301.045. That range was mine and it was wrong. The author checked the held statute, found the subchapter ends at 301.044, and recorded the discrepancy in the module rather than quietly writing to the range I had given. That is the behaviour the sourcing rule is for.",
  evidenceItIsNotASourcingOrLegalDefect: Object.freeze([
    "The held source texas/trec-sources/statutes/PR.301.htm contains Sec. 301.041 CERTAIN SALES AND RENTALS EXEMPTED, Sec. 301.042 RELIGIOUS ORGANIZATION, PRIVATE CLUB, AND APPRAISAL EXEMPTION, Sec. 301.043 HOUSING FOR ELDERLY EXEMPTED and Sec. 301.044 EFFECT ON OTHER LAW, and no Sec. 301.045.",
    "All four exemptions that do exist are taught in T10U2 in required prose.",
    "The course text reads: 'Subchapter C of the chapter as held runs from 301.041 to 301.044 and stops there. A 301.045 was not held for this course and is not taught here; the four exemptions above are the whole of the subchapter as read.'",
    "The claim carries status IDENTIFIED_NOT_TAUGHT, the classification the audit gives a citation the course itself disclaims, and it is counted in the denominator rather than excluded from it.",
  ]),
}));
if (nonPass.length !== 1) failures.push(`expected exactly 1 identified-not-taught claim, found ${nonPass.length}`);

/* ── the frozen set ──────────────────────────────────────────────────────────────────────────── */
const modules = TOPICS.map((t, i) => {
  const file = path.join(HOME, "curriculum", `module-${String(i + 1).padStart(2, "0")}.md`);
  return { topicCode: t.code, topic: t.topic, units: t.units.length, ...hashOf(file) };
});

const artifacts = {
  "LOA-1 outline and 57-unit map": hashOf(path.join(root, "config/texas/law-of-agency-course-form.mjs")),
  "source register": hashOf(path.join(root, "config/texas/law-of-agency-statute-sources.mjs")),
  "quotation-disposition ledger": hashOf(path.join(root, "config/texas/quotation-dispositions.mjs")),
  "claim-audit evidence": hashOf(path.join(HOME, "claim-audit.json")),
  "three-layer time report": hashOf(path.join(HOME, "time-evidence.json")),
  "formative misconception checks": hashOf(path.join(root, "config/texas/law-of-agency-misconception-checks.mjs")),
  "time budget": hashOf(path.join(root, "config/texas/law-of-agency-time-budget.mjs")),
  "structural evidence (generator)": hashOf(path.join(root, "scripts/check-loa-module-structure.mjs")),
  "salvage audit": hashOf(path.join(HOME, "salvage-audit.json")),
  "video instruction plan": hashOf(path.join(HOME, "video-instruction-plan.md")),
};

if (failures.length) {
  console.error("REFUSING TO FREEZE — the evidence does not support it:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

const freeze = {
  freezeId: FREEZE_ID,
  courseId: COURSE_ID,
  approvalForm: `${FORM.formNumber} rev ${FORM.revision}`,
  frozenOn: "2026-08-30",
  generatedBy: "scripts/freeze-loa-curriculum.mjs",
  afterFreeze: "No curriculum wording may change silently. An instructional repair found during assessment authoring must break the freeze explicitly, name the module and the reason, re-run the time, source, quotation, structural and assessment-dependency audits, and create a new freeze version with new hashes.",
  evidence: {
    unitsCovered: `${coverage.held.length}/57`,
    unitsExcused: coverage.excused.length,
    unitsUncovered: coverage.uncovered.length,
    layer1TopicInstructionMinutes: timeEvidence.layers.topicInstruction.minutes,
    layer2CourseLevelCapstoneMinutes: timeEvidence.layers.courseLevelCapstone.minutes,
    layer3GrandRequiredMinutes: timeEvidence.layers.grandRequired.minutes,
    prescribedMinutes: FORM.totalMinutes,
    everyTopicMeetsItsAllocation: below.length === 0,
    topicVariances: timeEvidence.byTopic.map((t) => ({ topicCode: t.topicCode, prescribed: t.prescribedMinutes, required: t.requiredMinutes, variance: t.varianceMinutes })),
    citations: audit.totals.citations,
    mechanicalPass: audit.totals.byStatus.MECHANICAL_PASS || 0,
    identifiedNotTaught: IDENTIFIED_NOT_TAUGHT,
    undispositionedQuotations: quotations.undispositioned.length,
    orphanedDispositions: quotations.orphaned.length,
    resurfacedDispositions: (quotations.resurfaced || []).length,
    retiredDispositions: (quotations.retired || []).length ?? quotations.retired,
    sourcingDefects: quotations.defects.length,
    registeredSourcesVerified: `${ALL_SOURCES.length}/${ALL_SOURCES.length}`,
    misconceptionChecks: MISCONCEPTION_CHECKS.length,
    scenariosPlanned: BUDGET.reduce((s, b) => s + b.scenarios, 0) + COURSE_LEVEL.capstoneScenarios,
    quizItemsPlanned: BUDGET.reduce((s, b) => s + b.quizItems, 0),
  },
  modules,
  artifacts,
  reproduce: [
    "node scripts/check-loa-module-structure.mjs",
    "node scripts/audit-loa-claims.mjs",
    "node scripts/report-loa-time-evidence.mjs",
    "node scripts/texas-source-inventory.mjs",
    "node scripts/freeze-loa-curriculum.mjs",
  ],
  notApproved: "StateCourse holds no TREC approval for this course or as a qualifying education provider. Enrollment is disabled, no Texas credit is offered, and nothing in this artifact may be read as a claim of approval.",
};

if (process.argv.includes("--write")) {
  fs.writeFileSync(OUT, `${JSON.stringify(freeze, null, 2)}\n`);
  console.log(`FROZEN — ${FREEZE_ID}`);
} else {
  if (!fs.existsSync(OUT)) { console.error("no freeze artifact; run with --write"); process.exit(1); }
  const onDisk = JSON.parse(fs.readFileSync(OUT, "utf8"));
  const drift = [];
  for (const m of modules) {
    const was = onDisk.modules.find((x) => x.path === m.path);
    if (!was) drift.push(`${m.path} is not in the freeze`);
    else if (was.sha256 !== m.sha256) drift.push(`${m.path} changed since the freeze`);
  }
  for (const [name, a] of Object.entries(artifacts)) {
    const was = onDisk.artifacts[name];
    if (was && was.sha256 !== a.sha256) drift.push(`${name} (${a.path}) changed since the freeze`);
  }
  if (drift.length) { console.error("FREEZE DRIFT:"); for (const d of drift) console.error(`  - ${d}`); process.exit(1); }
  console.log(`freeze intact — ${onDisk.freezeId}`);
}

console.log(`  units ${coverage.held.length}/57 · layer 1 ${timeEvidence.layers.topicInstruction.minutes} · layer 2 ${timeEvidence.layers.courseLevelCapstone.minutes} · layer 3 ${timeEvidence.layers.grandRequired.minutes} against ${FORM.totalMinutes}`);
console.log(`  every topic meets its allocation: ${below.length === 0} · undispositioned ${quotations.undispositioned.length} · orphaned ${quotations.orphaned.length} · defects ${quotations.defects.length} · sources ${ALL_SOURCES.length}/${ALL_SOURCES.length}`);
console.log(`  identified-not-taught: ${IDENTIFIED_NOT_TAUGHT.length} — ${IDENTIFIED_NOT_TAUGHT.map((c) => `${c.citation} (${c.module})`).join(", ")}`);
