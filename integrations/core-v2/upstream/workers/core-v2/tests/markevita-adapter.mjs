/* THE SEAM, WITH REAL FACTS ON ONE SIDE OF IT.
 *
 * Every other suite in this directory builds its own facts, which means every
 * other suite proves only that the kernel is consistent with itself. This one
 * reads facts a running MARKEVITA episode actually produced — assembled by
 * ffmpeg, measured by ffprobe, dumped by the Python runtime adapter in
 * pipeline/serial/completion.py — and puts them through the same kernel.
 *
 * fixtures/markevita-runtime-facts.json holds four of them: a master awaiting
 * its quality pass, the same episode after the pass really ran, a validly silent
 * master, and an episode with a paid submission nobody has read the outcome of.
 * Regenerate with pipeline/tests + the dumper described in the fixture's own
 * README entry; the digests will differ and nothing here depends on their value.
 *
 * If the adapter and the kernel ever disagree about what a fact is called, this
 * file is where it shows, rather than in production at three in the morning.
 */
import { readFileSync } from "node:fs";
import { harness, closeNetwork } from "./harness.mjs";
import {
  OPERATIONS, authorityFor, boundaryOf, evidenceFingerprint, hardStop, incidentSignature,
  paidStagesReached,
} from "../domains/runtime-incident/records.ts";
import { diagnose, flagsOf } from "../domains/runtime-incident/policy.ts";
import { verifyRecovery } from "../domains/runtime-incident/verifiers.ts";
import { completionOf } from "../kernel/completion.ts";

const tripped = closeNetwork();
const t = harness("the facts a real MARKEVITA episode produced, read by the kernel that decides");

const F = JSON.parse(readFileSync(new URL("./fixtures/markevita-runtime-facts.json", import.meta.url), "utf8"));

/* ═══════════════════════════ 1 · the shape actually matches */
t.section("the adapter's output is IncidentFacts, field for field");
const REQUIRED = [
  "application", "workflowId", "failingStage", "exceptionClass", "errorCode", "completedStages",
  "artifacts", "providerCalls", "ledger", "probes", "checkpoint", "checkpointDigest",
  "selectedTakes", "stage", "qaState", "paidStages", "continuationStages", "policyVersion", "engineVersion",
];
for (const [name, facts] of Object.entries(F)) {
  const missing = REQUIRED.filter((k) => !(k in facts));
  const extra = Object.keys(facts).filter((k) => !REQUIRED.includes(k));
  t.check(`${name}: every field and no others`, !missing.length && !extra.length,
    [...missing.map((m) => `missing ${m}`), ...extra.map((e) => `extra ${e}`)].join(", "));
  t.check(`${name}: every probe is a boolean, a number or a machine word`,
    Object.values(facts.probes).every((v) => typeof v === "boolean" || typeof v === "number" || typeof v === "string"));
  t.check(`${name}: the ledger is four numbers`,
    ["settled", "held", "reserved", "authority"].every((k) => typeof facts.ledger[k] === "number"));
  t.check(`${name}: it is MARKEVITA and it says which engine`,
    facts.application === "markevita" && facts.engineVersion.startsWith("markevita."));
}

t.section("the adapter declares where money is, and the kernel reads it from there");
{
  const facts = F.qa_before;
  t.check("the paid stages are the product's, not the kernel's",
    ["references", "keyframes", "video", "voice", "lipsync", "direction"].every((s) => facts.paidStages.includes(s)),
    facts.paidStages.join(", "));
  t.check("assemble, qa and deliver are not among them",
    !["assemble", "qa", "deliver"].some((s) => facts.paidStages.includes(s)));
  t.check("the continuation is computed from the record, not fixed",
    JSON.stringify(facts.continuationStages) === JSON.stringify(["qa", "deliver", "publish"]),
    facts.continuationStages.join(" -> "));
  /* The same operation, the same kernel, two different states: this is the fact
     the execution boundary exists to read. */
  const midVideo = { ...facts, completedStages: ["intake", "direction", "references", "keyframes"],
    continuationStages: ["video", "voice", "lipsync", "assemble", "qa", "deliver", "publish"] };
  t.check("A RESUME FROM HERE REACHES NO PAID STAGE",
    paidStagesReached(OPERATIONS.resume_from_checkpoint, facts).length === 0,
    boundaryOf(OPERATIONS.resume_from_checkpoint, facts).join(", "));
  t.check("A RESUME FROM BEFORE THE VIDEO STAGE REACHES THREE OF THEM",
    [...paidStagesReached(OPERATIONS.resume_from_checkpoint, midVideo)].sort().join(",") === "lipsync,video,voice",
    paidStagesReached(OPERATIONS.resume_from_checkpoint, midVideo).join(", "));
  t.check("and that is refused automatic authority",
    authorityFor(OPERATIONS.resume_from_checkpoint, new Set(["checkpoint_present", "checkpoint_decodes"]), midVideo)
      .authority === "human");
}

/* ═══════════════════════════ 2 · the kernel diagnoses real facts */
t.section("a master nobody has measured: rerun the quality pass, automatically");
{
  const facts = F.qa_before;
  const signature = await incidentSignature(facts);
  const d = diagnose(facts, signature);
  t.check("the rule that fires is the one about an unmeasured master",
    d.ruleId === "master_present_but_unmeasured", `${d.ruleId}`);
  t.check("the operation is rerun_qa", d.operation?.id === "rerun_qa");
  t.check("AND IT IS AUTOMATIC: measuring a file spends nothing",
    d.authority === "automatic", d.because);
  t.check("the flags came from measurements, not from the record's opinion",
    flagsOf(facts).has("master_exists") && !flagsOf(facts).has("qa_report_written"));
}

t.section("the production incident: a validly silent master is an engineering defect");
{
  const facts = F.valid_silence;
  t.check("the adapter measured silence, not damage", facts.probes.audio_measured === "silent",
    `audio_measured=${facts.probes.audio_measured}, peak=${facts.probes.audio_peak_db}`);
  t.check("and the media itself is sound", facts.probes.container_valid && facts.probes.decode_ok);
  t.check("and nothing asked to be heard",
    facts.probes.dialogue_count === 0 && facts.probes.music === "off" && facts.probes.required_bed_present === false);
  const d = diagnose(facts, await incidentSignature(facts));
  t.check("THE KERNEL REACHES engineering_defect, NOT A RETRY",
    d.exit === "engineering_defect" && d.operation === null, `${d.ruleId} -> ${d.exit}`);
  t.check("and says rerunning would fail identically", d.because.includes("identically"), d.because);
}

t.section("a paid submission nobody has read: the hard stop comes before every rule");
{
  const facts = F.unknown_paid_outcome;
  t.check("the adapter reported it unknown, not failed and not free",
    facts.providerCalls.every((c) => c.state === "outcome_unknown") && facts.providerCalls.length > 0);
  t.check("AND THE MONEY IS HELD, NOT ZERO", facts.ledger.held > 0, `held ${facts.ledger.held}`);
  t.check("the hard stop fires", hardStop(facts)?.exit === "unknown_paid_outcome");
  const d = diagnose(facts, await incidentSignature(facts));
  t.check("NO OPERATION IS PROPOSED AT ALL", d.operation === null && d.exit === "unknown_paid_outcome");
  t.check("not even though a master exists that could be measured",
    facts.probes.master_exists === true && d.operation === null);
}

/* ═══════════════════════════ 3 · the recovery really ran */
t.section("the quality pass really ran, and the kernel can tell");
{
  const before = F.qa_before, after = F.qa_after;
  const beforeFingerprint = await evidenceFingerprint(before);
  const afterFingerprint = await evidenceFingerprint(after);
  t.check("the evidence moved", beforeFingerprint !== afterFingerprint);
  t.check("and the stage moved with it", `${before.stage} -> ${after.stage}` === "qa -> deliver",
    `${before.stage} -> ${after.stage}`);
  t.check("and the quality pass left a report where there was none",
    before.probes.qa_report_written === false && after.probes.qa_report_written === true);

  const v = verifyRecovery(OPERATIONS.rerun_qa, { before, after, beforeFingerprint, afterFingerprint });
  t.check("THE RECOVERY VERIFIES AGAINST EVIDENCE THE ADAPTER RE-MEASURED", v.recovered, v.because);
  t.check("and no provider call appeared", v.providerCallDelta === 0);
  t.check("and nothing was spent", v.incrementalSpend === 0,
    `${after.ledger.settled} - ${before.ledger.settled}`);
  t.check("every verifier it names is implemented", v.results.length >= OPERATIONS.rerun_qa.verifies.length);
  t.check("including the freshness check nobody asked for",
    v.results.some((r) => r.name === "evidence_is_fresh" && r.pass));
}

t.section("handing the same evidence back is not a recovery");
{
  const before = F.qa_after, after = F.qa_after;
  const f = await evidenceFingerprint(before);
  const v = verifyRecovery(OPERATIONS.rerun_qa, { before, after, beforeFingerprint: f, afterFingerprint: f });
  t.check("THE SAME FACTS TWICE FAIL FRESHNESS", !v.recovered, v.because);
}

/* ═══════════════════════════ 4 · and still not delivered */
t.section("a passing quality pass is not a delivered episode");
{
  const after = F.qa_after;
  t.check("the adapter says QA passed", after.qaState === "passed" && after.probes.qa_passed === true);
  t.check("and that delivery has not happened", after.probes.delivery_recorded === false);
  const c = completionOf({
    outcomeRequired: "a finished master the owner can watch",
    artifactExists: after.probes.master_exists,
    artifactDigest: after.artifacts.find((a) => a.kind === "master")?.digest ?? null,
    decisionBoundDigest: after.artifacts.find((a) => a.kind === "master")?.digest ?? null,
    acceptanceGates: [{ name: "qa_passed", required: true, passed: true, evidence: "the adapter's own report" }],
    /* Nothing was delivered, so nothing could be read back. */
    readBackSucceeded: false, verifiedBy: "independent_verifier",
  });
  t.check("A GREEN QUALITY PASS IS NOT DELIVERY", c.state !== "DELIVERED", `${c.state}: ${c.unmet[0] ?? ""}`);
  t.check("and the refusal names the read-back", c.unmet.some((u) => u.includes("read back")), c.unmet.join("; "));
}

t.section("every door stayed closed");
t.check("nothing in this file tried the network", tripped() === 0, `${tripped()} attempts`);
t.finish();
