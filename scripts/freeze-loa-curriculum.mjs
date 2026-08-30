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
import { unmatchedFrom } from "./lib/tx-claim-audit.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOME = path.join(root, "texas/tx-law-of-agency-30-v1");
const OUT = path.join(HOME, "content-freeze.json");
const COURSE_ID = "tx-law-of-agency-30-v1";
const FREEZE_ID = "LOA-CONTENT-FREEZE-2026-08-30-v5";

/**
 * FREEZE HISTORY. A freeze that is broken and silently re-taken teaches nothing. Every break is
 * recorded here with what was changed and why, so the artifact carries its own provenance rather
 * than requiring someone to reconstruct it from git.
 */
const BREAK_HISTORY = Object.freeze([
  Object.freeze({
    brokeFreeze: "LOA-CONTENT-FREEZE-2026-08-30-v4",
    on: "2026-08-30",
    module: "NONE — all twelve module hashes are byte-identical",
    change: "The source register was re-derived against the current claim audit with corrected block attribution. 314 unit-level attributions moved across 127 sections, twelve sections were newly registered, 23 read-but-no-longer-cited sections were marked, and registered sources went 55 -> 58.",
    reason: "The register's unit map had been derived from a 2,217-row claim audit while the audit on disk held 1,975 — it described a curriculum the reduction passes had already changed. Separately, the attribution rule assigned each citation to the nearest preceding unit heading, and both the module recap and the optional reference section sit AFTER the last unit heading, so every module's final unit was absorbing them: 449 recap and 117 optional-reference citations landing on units that do not teach them.",
    foundBy: "the block-map objective review, which noticed 1101.804 attributed to a unit whose module contains zero occurrences of it",
    classOfDefect: "evidence — no curriculum wording changed and no legal claim was mis-stated, but the register's account of which unit relies on which source was wrong",
    auditsReRun: Object.freeze([
      "node scripts/texas-source-inventory.mjs — 58/58 sources verified against disk",
      "unit coverage — 57/57 held, 0 excused, 0 uncovered, every unit still carrying controlling and not merely guidance support",
      "no unit sourced only through optional-reference material, and no section supported only by recap or only by optional citations",
      "node --test tests/*.test.mjs",
    ]),
  }),
  Object.freeze({
    brokeFreeze: "LOA-CONTENT-FREEZE-2026-08-30-v3",
    on: "2026-08-30",
    module: "NONE — no curriculum file changed and all twelve module hashes are byte-identical to the ones v3 carried. Nothing under texas/tx-law-of-agency-30-v1/curriculum/ was opened for writing.",
    change:
      "This freeze stopped hashing the video instruction plan directly and started hashing the video freeze artifact instead. The artifact entry 'video instruction plan' (texas/tx-law-of-agency-30-v1/video-instruction-plan.md) is replaced by 'video plan freeze' (texas/tx-law-of-agency-30-v1/video-plan-freeze.json), written by the new scripts/freeze-loa-video-plan.mjs under the id LOA-VIDEO-PLAN-FREEZE-2026-08-30-v2. That video freeze hashes the plan, the three production files, the three caption .vtt files, the held IABS 1-2 form and OC.1101 statute, the source inventory, the three block maps the videos name, the new validator, and the block-map generator core. Two artifacts also gained content at the same moment: the video plan itself was corrected to plan v2 (nine narration repairs, one statutory repair, seven coordinate corrections and one duration inconsistency, all previously stranded in an unhashed addendum), and the addendum was marked SUPERSEDED review history.",
    reason:
      "The structural cause of a deadlock, removed. A video plan is not curriculum, and correcting a video should never require breaking a curriculum freeze — but while this freeze hashed the plan directly, it did. That is not hypothetical: an earlier pass found real defects in the three video packages (the worst dropped 'unless required to do so by law' from a confidentiality rule while the highlight box was showing the student that very exception), edited the plan to record them, saw this freeze report drift, correctly reversed the edit byte for byte, and parked the corrections in an unhashed addendum. The result was a hashed canonical plan carrying known defects and an unhashed file carrying the fixes — fine as review history, not acceptable as a production package, because a renderer consulting the canonical files would have reproduced the defects. Indirection fixes the cause: the curriculum freeze still pins the video state exactly, because any change to any video artifact changes the video freeze and therefore this hash, but it pins it through a stable pointer that the video freeze owns.",
    whyTheFreezeIdIS_Bumped:
      "Because the artifact changed. content-freeze.json's artifacts map loses one key and gains another, with a different path and a different hash. Re-taking under v3 would make an id denote two byte-states, and an id that denotes two byte-states is not an identifier — anyone verifying against v3 could not tell which of the two they held. That reasoning has already been applied once in this history, to the v2 -> v3 bump, and it applies here for the same reason and with less room for argument, since this time the artifacts map itself is structurally different.",
    curriculumUnchanged:
      "All twelve module sha256 values are identical to v3's. So are the LOA-1 outline, the source register, the quotation ledger, the claim audit, the time evidence, the misconception checks, the time budget, the structural generator and the salvage audit. The only difference between the v3 and v4 artifacts is the video entry and the freeze id.",
    foundBy: "the consolidation pass, reading the addendum's own account of why it existed",
    classOfDefect: "structural — the freeze boundary was drawn in the wrong place, so a correct edit to a video could not land",
    auditsReRun: Object.freeze([
      "node scripts/validate-loa-video-packages.mjs — 8/8 checks pass; 5 are partial by nature and say so in their own output",
      "node scripts/freeze-loa-video-plan.mjs --write — LOA-VIDEO-PLAN-FREEZE-2026-08-30-v2, 16 artifacts",
      "node scripts/texas-source-inventory.mjs — 55 registered sources resolve",
      "node scripts/check-loa-module-structure.mjs — 57/57 units, no structural failures",
      "node scripts/audit-loa-claims.mjs — unchanged, the twelve modules are byte-identical",
      "node scripts/report-loa-time-evidence.mjs — unchanged for the same reason",
      "node --test tests/*.test.mjs",
    ]),
  }),
  Object.freeze({
    brokeFreeze: "LOA-CONTENT-FREEZE-2026-08-30-v2",
    on: "2026-08-30",
    module: "NONE — no curriculum file changed and all twelve module hashes are byte-identical",
    change: "The source register grew from 51 to 55 registered sources when 22 TAC 535.55, 535.62, 535.63, 535.64 and 535.65 were registered as the controlling assessment and delivery authority, plus the Texas Register capture that supplies their subsection lettering.",
    reason: "A freeze artifact that hashes the source register changes when that register changes. The agent that made the change re-took the freeze under the SAME id, reasoning that no curriculum wording moved. That reasoning is half right and the conclusion is wrong: an id that denotes two different byte-states is not an identifier, and anyone verifying against v2 could not tell which of the two they held. The distinction between a curriculum change and an evidence change is real and is recorded here — it is why this entry names no module — but the answer to it is a version bump carrying that distinction, not a silent re-take.",
    foundBy: "reviewing the agent's own report, which disclosed the re-take rather than hiding it",
    classOfDefect: "provenance — nothing was mis-stated, but the artifact's identity had stopped being unique",
    auditsReRun: Object.freeze([
      "node scripts/texas-source-inventory.mjs — 55 registered sources resolve, every controlling source present",
      "node scripts/check-loa-module-structure.mjs — 57/57 units, no structural failures",
      "node scripts/audit-loa-claims.mjs — unchanged, the twelve modules are byte-identical",
      "node scripts/report-loa-time-evidence.mjs — unchanged for the same reason",
      "node --test tests/*.test.mjs",
    ]),
  }),
  Object.freeze({
    brokeFreeze: "LOA-CONTENT-FREEZE-2026-08-30",
    on: "2026-08-30",
    module: "module-04.md (T04 Seller Agency)",
    change: "22 TAC § 535.2(g) -> § 535.2(f), two occurrences, for the rule that listings and other agreements for real estate brokerage services must be solicited and accepted in a broker's name.",
    reason: "The subsection letter was wrong. The held rule file prints no subsection letters, so they are derived by ordinal position; that derivation is anchored by the rule's own internal cross-references to 'subsection (e)' for delegation and 'subsection (h)' for records, and it puts the listings rule at (f) and the sponsored agent's advertising compliance at (g). Modules 01, 02 and 09 all cite (f); module 04 was the outlier. A student looking up § 535.2(g) would have found the advertising rule.",
    foundBy: "the block-map author, reading all twelve modules to write the 57 unit objectives",
    whyTheMechanicalAuditMissedIt: "The claim auditor resolves '22 TAC § 535.2' to its held file and verifies the section is present. It does not verify a subsection letter, because the held file carries none. This is a known coverage limit of the tool, not a lapse in its operation, and it is why a human-scale read of the corpus still finds things enumeration cannot.",
    classOfDefect: "citation-only — the quoted text is verbatim and the proposition is correct; only the subsection identifier was wrong. Nothing downstream mis-taught a rule.",
    auditsReRun: Object.freeze([
      "node scripts/check-loa-module-structure.mjs — 57/57 units, no structural failures",
      "node scripts/audit-loa-claims.mjs — 1,974 of 1,975 MECHANICAL_PASS, the one identified-not-taught unchanged",
      "node scripts/report-loa-time-evidence.mjs — layer 1 1512.4, layer 2 20.0, layer 3 1532.4, every topic at or above its allocation",
      "node scripts/texas-source-inventory.mjs — every registered source resolves",
      "quotation reconcile — 126 unmatched, 0 undispositioned, 0 defects, 0 orphaned, 0 resurfaced",
      "node --test tests/*.test.mjs — assessment-dependency and block-coverage suites",
    ]),
  }),
  Object.freeze({
    brokeFreeze: "LOA-CONTENT-FREEZE-2026-08-30-v2",
    on: "2026-08-30",
    module: "NONE — no curriculum file changed, and all twelve module hashes are byte-identical to the ones this freeze already carried.",
    change:
      "config/texas/law-of-agency-statute-sources.mjs, which this freeze hashes as the 'source register', gained the five 22 TAC rules that govern the course as a course rather than its law: §§ 535.62, 535.63 and 535.65 were registered for the first time, and §§ 535.55 and 535.64 were rewritten from one-line records to subsection-level ones. Registered sources 51 -> 55 (the fifth addition is the Secretary of State's Texas Register capture, at tier contextual, which is where the subsection lettering of §§ 535.62 and 535.65 is read from). Unit coverage is untouched at 57/57 because none of these rules is cited by any unit: they control artefacts, and the artefact each subsection controls is named on its record and inverted into ASSESSMENT_AND_DELIVERY_CONTROLS.",
    reason:
      "Assessment authoring starts now. The register deliberately omitted §§ 535.62, 535.63 and 535.65 while there was no assessment engine, instructor dossier or delivery-control artefact for them to be controlling over; carrying that omission into the assessment build would mean an acceptance package that leaves out the rules governing its own examinations, passing score, retakes, proctoring and record retention.",
    foundBy: "the assessment-rule registration pass, working from the register's own note instructing that the three rules be added when an LOA assessment or provider artefact is built",
    whyTheFreezeIdIsNOTBumped:
      "The freeze exists so that no CURRICULUM WORDING changes silently. Nothing in the curriculum changed: the twelve module hashes are identical, the claim audit, time evidence and quotation reconcile are unchanged, and the LOA-1 outline, misconception checks, time budget and quotation ledger all hash the same. What changed is the evidence layer's own completeness, in a direction that only adds sourced records, and the diff of content-freeze.json states it in one line: registeredSourcesVerified 51/51 -> 55/55. Bumping the id would also strand the twelve block-map files, which name the freeze in prose.",
    auditsReRun: Object.freeze([
      "node scripts/texas-source-inventory.mjs — exit 0; 55/55 law-of-agency sources verified against disk, every controlling source present",
      "node --test tests/*.test.mjs — 1007 tests, 0 failures",
      "register load-time invariants — every hash recomputed from disk, the five rules cross-checked against config/texas/trec-rules-source-lock.mjs, the Texas Register capture cross-checked against regulatory-manifest.mjs, and every artefact a rule is registered as controlling either exists on disk or is marked planned:",
      "unit coverage 57/57 held, 0 uncovered, 0 controlling gaps",
    ]),
  }),
]);

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
/* sourceValidation() reports hash mismatches as `hashMismatches`. This gate read `mismatches`,
   which is always undefined, so it could never fire; corrected 2026-08-30. */
if (validation.hashMismatches.length !== 0) failures.push(`${validation.hashMismatches.length} source hash mismatches`);

const unmatched = unmatchedFrom(audit);
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
  /* THE POINTER, NOT THE PLAN. This freeze used to hash video-instruction-plan.md directly, which
     made a video artifact a curriculum artifact: correcting a highlight rectangle that was cutting a
     printed word in half reported drift here and needed a curriculum-freeze break to land. A video
     plan is not curriculum. So this freeze now hashes the VIDEO FREEZE ARTIFACT, which
     scripts/freeze-loa-video-plan.mjs owns and which itself hashes the plan, the three production
     files, the three caption files, the held form and statute, the block maps the videos name, and
     the validator. One level of indirection: the video state is still pinned exactly — any change to
     any video artifact changes video-plan-freeze.json, which changes this hash — but a video
     correction is now absorbed by a video freeze instead of forcing a curriculum-freeze break. */
  "video plan freeze (LOA-VIDEO-PLAN-FREEZE-2026-08-30-v2 — hashes the plan and every render dependency)": hashOf(path.join(HOME, "video-plan-freeze.json")),
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
  breakHistory: BREAK_HISTORY,
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
