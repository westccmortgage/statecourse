/* THE GOVERNOR, TESTED BY BREAKING THINGS.
 *
 * A production run that stops is evidence, and what may be done about it is a
 * decision with an authority. These checks assert the properties that make
 * that safe, and four of them exist because the first version of this domain
 * got them wrong:
 *
 *   · a prior recovery's evidence is isolated to its own situation AND its own
 *     operation, cross-checked against its own verification results;
 *   · the evidence fingerprint is the concrete state, not the class of
 *     incident, so real progress is visible and a pointless repeat is not;
 *   · every postcondition an operation claims is executed against fresh
 *     evidence, and an unimplemented one refuses the run outright;
 *   · an operation that spends nothing itself is still not automatic if the
 *     continuation it permits could enter a paid stage.
 *
 * Deterministic conditions are settled by rule, not by three opinions. Where
 * no rule settles a cause, the answer is that none does.
 *
 * Everything is in memory and the network is closed before anything is read.
 */
import { harness, closeNetwork } from "./harness.mjs";
import {
  authorityFor, boundaryOf, CONTINUATION, evidenceFingerprint, evidenceFingerprintInput, hardStop,
  incidentSignature, OPERATIONS, paidStagesReached, readSubject, recordKey, signatureInput, subjectKey,
  INCIDENT_EXITS, INCIDENT_STATES,
} from "../domains/runtime-incident/records.ts";
import { attemptKey, diagnose, flagsOf, mayAttempt, POLICY_VERSION, RULES, satisfied } from "../domains/runtime-incident/policy.ts";
import { VERIFIERS, VERIFIER_NAMES, verifyRecovery } from "../domains/runtime-incident/verifiers.ts";

const tripped = closeNetwork();
const t = harness("an incident is evidence, and recovery is a decision about it");

const ENGINE = "core-v2/2.0";
const PAID = ["keyframes", "video", "voice", "lipsync", "music"];

/* The live MarkeVita `assemble` failure, as facts. No message, no path, no secret. */
function incident(over = {}) {
  return {
    application: "markevita", workflowId: "job-1", failingStage: "assemble",
    exceptionClass: "RuntimeError", errorCode: "audio_normalization_unmeasurable",
    completedStages: ["intake", "direction", "references", "keyframes", "video", "voice", "lipsync"],
    artifacts: [{ kind: "scene_final", digest: "a".repeat(64) }, { kind: "scene_final", digest: "b".repeat(64) }],
    providerCalls: [{ provider: "fal", requestId: "req-1", state: "succeeded" }],
    ledger: { settled: 13.3, held: 0, reserved: 0, authority: 50 },
    probes: {
      dialogue_count: 0, music: "off", container_valid: true, decode_ok: true,
      audio_measured: "silent", all_scene_artifacts_present: true,
    },
    checkpoint: "assemble/scenes-cut", checkpointDigest: "c".repeat(64),
    selectedTakes: [{ subject: "sc01", takeId: "take-1", digest: "d".repeat(64) }],
    stage: "assemble", qaState: "not_run",
    paidStages: PAID, continuationStages: ["assemble", "qa", "deliver"],
    policyVersion: POLICY_VERSION, engineVersion: ENGINE,
    ...over,
  };
}
const SIG = await incidentSignature(incident());

/* ═══════════════════════════ 1 · keys */
t.section("a record is named, and a question about it is a different name");
t.check("a record key is kind and parts", recordKey("incident", "job-1") === "incident:job-1");
t.check("a subject key splits back into its question and its record",
  readSubject(subjectKey("cause", recordKey("incident", "job-1"))).question === "cause");
await t.refused("a key part with a colon is refused, not escaped", () => recordKey("incident", "a:b"));
await t.refused("a key part with whitespace is refused", () => recordKey("incident", "a b"));
await t.refused("a subject that is not a question is refused", () => readSubject("nonsense/incident:job-1"));

/* ═══════════════════════════ 2 · the signature groups a CLASS of incident */
t.section("the incident signature groups the same class of failure");
t.check("the same facts give the same signature", SIG === await incidentSignature(incident()));
t.check("a different failing stage is a different class",
  SIG !== await incidentSignature(incident({ failingStage: "qa" })));
t.check("a different error code is a different class",
  SIG !== await incidentSignature(incident({ errorCode: "ffmpeg_exit_1" })));
t.check("a re-run that changes every digest is the SAME class",
  SIG === await incidentSignature(incident({ artifacts: [{ kind: "scene_final", digest: "9".repeat(64) }, { kind: "scene_final", digest: "8".repeat(64) }] })));
const sigInput = signatureInput(incident());
for (const [what, needle] of [["a request id", "req-1"], ["a digest", "a".repeat(64)], ["an amount", "13.3"]]) {
  t.check(`no ${what} reaches the signature`, !sigInput.includes(needle));
}

/* ═══════════════════════════ 3 · the evidence fingerprint is CONCRETE STATE */
t.section("the evidence fingerprint is the concrete state, and it is not the signature");
const FP = await evidenceFingerprint(incident());
t.check("it is a different value from the incident signature", FP !== SIG);
t.check("identical evidence gives the same fingerprint", FP === await evidenceFingerprint(incident()));
t.check("changed artifact bytes change it",
  FP !== await evidenceFingerprint(incident({ artifacts: [{ kind: "scene_final", digest: "9".repeat(64) }, { kind: "scene_final", digest: "b".repeat(64) }] })));
t.check("a new artifact appearing changes it",
  FP !== await evidenceFingerprint(incident({ artifacts: [...incident().artifacts, { kind: "master", digest: "e".repeat(64) }] })));
t.check("stage advancement changes it", FP !== await evidenceFingerprint(incident({ stage: "qa" })));
t.check("the quality state changing changes it", FP !== await evidenceFingerprint(incident({ qaState: "passed" })));
t.check("a checkpoint rewritten under the same name changes it",
  FP !== await evidenceFingerprint(incident({ checkpointDigest: "f".repeat(64) })));
t.check("rebinding a take changes it",
  FP !== await evidenceFingerprint(incident({ selectedTakes: [{ subject: "sc01", takeId: "take-2", digest: "d".repeat(64) }] })));
t.check("replacing a take's bytes under the same id changes it",
  FP !== await evidenceFingerprint(incident({ selectedTakes: [{ subject: "sc01", takeId: "take-1", digest: "0".repeat(64) }] })));
t.check("a provider OUTCOME moving changes it",
  FP !== await evidenceFingerprint(incident({ providerCalls: [{ provider: "fal", requestId: "req-1", state: "failed" }] })));
t.check("A CHANGED REQUEST ID ALONE MANUFACTURES NO PROGRESS",
  FP === await evidenceFingerprint(incident({ providerCalls: [{ provider: "fal", requestId: "req-RETRIED", state: "succeeded" }] })),
  "same outcome, same artifacts, new id — not progress");
const fpInput = evidenceFingerprintInput(incident());
for (const [what, needle] of [["a request id", "req-1"], ["an amount", "13.3"], ["an error message", "RuntimeError"]]) {
  t.check(`no ${what} reaches the evidence fingerprint`, !fpInput.includes(needle));
}

/* ═══════════════════════════ 4 · the real incident is a defect, not a retry */
t.section("a valid silence refused by policy is an engineering defect");
const real = diagnose(incident(), SIG);
t.check("the rule that settles it is named", real.ruleId === "valid_silence_refused_by_audio_policy", String(real.ruleId));
t.check("it exits as an engineering defect", real.exit === "engineering_defect", String(real.exit));
t.check("no operation is proposed", real.operation === null);
t.check("it is not a machine's to authorise", real.authority === "human");

t.section("the same shape, but something WAS meant to be heard, is not a defect");
for (const [label, over] of [
  ["dialogue exists", { probes: { ...incident().probes, dialogue_count: 4 } }],
  ["music was required", { probes: { ...incident().probes, music: "generate" } }],
  ["a room tone bed was required", { probes: { ...incident().probes, required_bed_present: true } }],
]) {
  const d = diagnose(incident(over), SIG);
  t.check(`${label}: a person decides`, d.exit === "awaiting_human" && d.ruleId === "expected_audio_is_missing", `${d.ruleId} -> ${d.exit}`);
}

/* ═══════════════════════════ 5 · hard stops outrank every rule */
t.section("a paid call whose outcome nobody knows is never re-bought by machine");
const unknown = incident({ providerCalls: [{ provider: "fal", requestId: "req-1", state: "outcome_unknown" }] });
t.check("the hard stop fires", hardStop(unknown)?.exit === "unknown_paid_outcome");
t.check("diagnosis stops there and proposes nothing",
  diagnose(unknown, SIG).exit === "unknown_paid_outcome" && diagnose(unknown, SIG).operation === null);
t.check("it outranks a rule that would otherwise have matched",
  diagnose({ ...unknown, probes: { ...unknown.probes, master_exists: true } }, SIG).exit === "unknown_paid_outcome");
t.check("spend already past its authority is a person's", hardStop(incident({ ledger: { settled: 48, held: 3, reserved: 1, authority: 50 } }))?.exit === "awaiting_human");
t.check("an unpriced operation stops too", hardStop(incident({ probes: { ...incident().probes, unpriced_operation: true } }))?.exit === "awaiting_human");

/* ═══════════════════════════ 6 · the execution boundary */
t.section("free to run is not the same as free to continue into");
const resumeOp = OPERATIONS.resume_from_checkpoint;
t.check("resume declares its boundary as the continuation, not a fixed list", resumeOp.boundary.includes(CONTINUATION));
t.check("the boundary resolves to the stages a resume would actually run",
  boundaryOf(resumeOp, incident()).join(",") === "assemble,qa,deliver");
const provenResume = new Set(resumeOp.preconditions);
t.check("resuming into local stages only is automatic",
  authorityFor(resumeOp, provenResume, incident()).authority === "automatic");
const intoPaid = incident({ continuationStages: ["video", "assemble", "qa"] });
t.check("RESUMING INTO A PAID STAGE IS NOT AUTOMATIC, though the restart is free",
  authorityFor(resumeOp, provenResume, intoPaid).authority === "human",
  authorityFor(resumeOp, provenResume, intoPaid).because);
t.check("the paid stage it would reach is named", paidStagesReached(resumeOp, intoPaid).join(",") === "video");
t.check("restarting a worker into a paid stage is not automatic either",
  authorityFor(OPERATIONS.restart_local_worker, new Set(OPERATIONS.restart_local_worker.preconditions), intoPaid).authority === "human");
t.check("every operation declares a boundary", Object.values(OPERATIONS).every((o) => Array.isArray(o.boundary)));
t.check("no operation's fixed boundary names a paid stage",
  Object.values(OPERATIONS).every((o) => !o.boundary.some((b) => PAID.includes(b))));

/* ═══════════════════════════ 7 · authority is derived, never declared */
t.section("an operation is automatic only when the facts prove it is safe");
const FREE = ["resume_from_checkpoint", "rerun_assembly", "rerun_qa", "rebuild_master_from_paid_assets",
  "retrieve_known_provider_result", "redownload_known_artifact", "continue_delivery", "restart_local_worker"];
for (const id of FREE) {
  const op = OPERATIONS[id];
  t.check(`${id}: automatic with every precondition met`, authorityFor(op, new Set(op.preconditions), incident()).authority === "automatic");
  if (op.preconditions.length) {
    const short = new Set(op.preconditions.slice(1));
    t.check(`${id}: a person's once one precondition is unproven`, authorityFor(op, short, incident()).authority === "human");
  }
}
t.check("raising a budget is never automatic", authorityFor(OPERATIONS.raise_budget, new Set(), incident()).authority === "human");
t.check("a route inside prior authority is still not automatic",
  authorityFor(OPERATIONS.execute_authorized_fallback, new Set(OPERATIONS.execute_authorized_fallback.preconditions), incident()).authority === "human");
t.check("an operation naming a verifier nobody implements is not automatic",
  authorityFor({ ...OPERATIONS.rerun_qa, verifies: ["a_check_nobody_wrote"] }, new Set(OPERATIONS.rerun_qa.preconditions), incident()).authority === "human");
t.check("no operation is destructive", Object.values(OPERATIONS).every((o) => !o.destructive));

/* ═══════════════════════════ 8 · verification is executed, not described */
t.section("an executor that returned is not a recovery that worked");
const before = incident();
const after = (over) => incident({ ...over });
const ctx = async (a) => ({ before, after: a, beforeFingerprint: FP, afterFingerprint: await evidenceFingerprint(a) });

t.check("every verifier name an operation uses is implemented",
  Object.values(OPERATIONS).flatMap((o) => o.verifies).every((n) => VERIFIER_NAMES.has(n)));
await t.refused("an unknown verifier name throws rather than being skipped",
  async () => verifyRecovery({ ...OPERATIONS.rerun_qa, verifies: ["not_a_verifier"] }, await ctx(after({ stage: "qa" }))));

const good = after({ stage: "qa", qaState: "written", probes: { ...before.probes, qa_report_written: true } });
const passed = verifyRecovery(OPERATIONS.rerun_qa, await ctx(good));
t.check("a real recovery verifies", passed.recovered, passed.because);
t.check("freshness is always checked, even though no operation declares it",
  passed.results.some((r) => r.name === "evidence_is_fresh"));
t.check("every postcondition is recorded with its own evidence",
  passed.results.every((r) => r.name && typeof r.pass === "boolean" && r.evidence));
t.check("both fingerprints are recorded", passed.beforeFingerprint === FP && passed.afterFingerprint !== FP);
t.check("the provider-call delta is computed", passed.providerCallDelta === 0);
t.check("the incremental spend is computed", passed.incrementalSpend === 0);

t.check("HANDING BACK THE SAME EVIDENCE FAILS, whatever the executor said",
  !verifyRecovery(OPERATIONS.rerun_qa, { before, after: before, beforeFingerprint: FP, afterFingerprint: FP }).recovered);
const missingProbe = verifyRecovery(OPERATIONS.rerun_qa, await ctx(after({ stage: "qa" })));
t.check("a postcondition the adapter did not evidence fails", !missingProbe.recovered, missingProbe.because);
const spentMore = after({ stage: "qa", qaState: "written", probes: { ...before.probes, qa_report_written: true },
  providerCalls: [...before.providerCalls, { provider: "fal", requestId: "req-2", state: "succeeded" }] });
const spentResult = verifyRecovery(OPERATIONS.rerun_qa, await ctx(spentMore));
t.check("A PAID CALL APPEARING DURING A NO-SPEND RECOVERY FAILS IT", !spentResult.recovered, spentResult.because);
t.check("the delta is reported, not just the refusal", spentResult.providerCallDelta === 1);
const overspent = after({ stage: "qa", qaState: "written", probes: { ...before.probes, qa_report_written: true },
  ledger: { settled: 60, held: 0, reserved: 0, authority: 50 } });
t.check("spend past the authority fails spend_within_authority",
  verifyRecovery({ ...OPERATIONS.rerun_qa, verifies: [...OPERATIONS.rerun_qa.verifies, "spend_within_authority"] }, await ctx(overspent)).recovered === false);
const rewritten = after({ stage: "assemble", qaState: "not_run",
  probes: { ...before.probes, master_exists: true, master_digest_recorded: true, master_decodes: true, paid_assets_immutable: true },
  selectedTakes: [{ subject: "sc01", takeId: "take-1", digest: "0".repeat(64) }] });
t.check("REWRITING A PAID ASSET FAILS paid_asset_digests_unchanged",
  !verifyRecovery(OPERATIONS.rebuild_master_from_paid_assets, await ctx(rewritten)).recovered);

/* ═══════════════════════════ 9 · loop protection on real fingerprints */
t.section("the same operation is not run twice from the same concrete state");
const stuck = {
  signature: SIG, operationId: "rerun_assembly", verifiedPreconditions: [], verifications: [],
  beforeFingerprint: FP, afterFingerprint: FP, outcome: "failed",
  policyVersion: POLICY_VERSION, engineVersion: ENGINE, providerCalls: 0, incrementalSpend: 0,
};
t.check("a first attempt is allowed", mayAttempt(SIG, "rerun_assembly", FP, []).allowed);
t.check("a repeat from the same real fingerprint that moved nothing is refused",
  !mayAttempt(SIG, "rerun_assembly", FP, [stuck]).allowed, mayAttempt(SIG, "rerun_assembly", FP, [stuck]).because);
const movedFp = await evidenceFingerprint(incident({ stage: "qa" }));
t.check("verified progress — a genuinely different after-fingerprint — earns one more attempt",
  mayAttempt(SIG, "rerun_assembly", FP, [{ ...stuck, afterFingerprint: movedFp }]).allowed);
t.check("a retry under a new request id does NOT count as progress",
  !mayAttempt(SIG, "rerun_assembly", FP, [{ ...stuck, afterFingerprint: await evidenceFingerprint(incident({ providerCalls: [{ provider: "fal", requestId: "req-NEW", state: "succeeded" }] })) }]).allowed,
  "the new id fingerprints identically, so the attempt is still a loop");
t.check("a different operation is not blocked by this one", mayAttempt(SIG, "rerun_qa", FP, [stuck]).allowed);
t.check("a different concrete state is not blocked by this one", mayAttempt(SIG, "rerun_assembly", movedFp, [stuck]).allowed);
t.check("the attempt key is the three facts that make it the same attempt",
  attemptKey(SIG, "rerun_assembly", FP) === `${SIG}|rerun_assembly|${FP}`);

/* ═══════════════════════════ 10 · knowledge isolation */
t.section("a prior verified recovery is a source, isolated to its own situation");
const OP = "rebuild_master_from_paid_assets";
const verified = {
  signature: SIG, operationId: OP,
  verifiedPreconditions: ["paid_assets_immutable"],
  verifications: [{ name: "paid_assets_immutable", pass: true }],
  beforeFingerprint: FP, afterFingerprint: movedFp, outcome: "recovered",
  policyVersion: POLICY_VERSION, engineVersion: ENGINE, providerCalls: 0, incrementalSpend: 0,
};
const facts = incident();
const has = (k, p) => satisfied(SIG, OP, new Set(), k, facts).has(p);
t.check("the same signature, same operation, verified: it contributes", has([verified], "paid_assets_immutable"));
t.check("A DIFFERENT SIGNATURE CONTRIBUTES NOTHING",
  !has([{ ...verified, signature: "0".repeat(64) }], "paid_assets_immutable"));
t.check("A DIFFERENT OPERATION CONTRIBUTES NOTHING",
  !satisfied(SIG, OP, new Set(), [{ ...verified, operationId: "rerun_qa" }], facts).has("paid_assets_immutable"));
t.check("a failed prior recovery contributes nothing", !has([{ ...verified, outcome: "failed" }], "paid_assets_immutable"));
t.check("another policy version contributes nothing", !has([{ ...verified, policyVersion: "runtime-incident.policy.0" }], "paid_assets_immutable"));
t.check("another engine version contributes nothing", !has([{ ...verified, engineVersion: "core-v2/1.0" }], "paid_assets_immutable"));
t.check("A PRECONDITION IT NAMED BUT NEVER VERIFIED CONTRIBUTES NOTHING",
  !has([{ ...verified, verifications: [{ name: "paid_assets_immutable", pass: false }] }], "paid_assets_immutable"));
t.check("a precondition with no verification record at all contributes nothing",
  !has([{ ...verified, verifications: [] }], "paid_assets_immutable"));
t.check("it cannot contribute a precondition it never mentioned", !has([verified], "all_scene_artifacts_present"));
t.check("matching a signature does not by itself authorise anything",
  authorityFor(OPERATIONS[OP], satisfied(SIG, OP, new Set(), [verified], facts), facts).authority === "human");

/* ═══════════════════════════ 11 · nothing turns on a confidence score */
t.section("no acceptance anywhere turns on a confidence score");
const { readFile } = await import("node:fs/promises");
const domain = new URL("../domains/runtime-incident/", import.meta.url);
const source = (await Promise.all(["records.ts", "policy.ts", "verifiers.ts"].map((f) => readFile(new URL(f, domain), "utf8")))).join("\n");
t.check("machineConfidence is never read by this domain",
  !/machineConfidence|machine_confidence/.test(source.replace(/`machine_confidence`/g, "")));
t.check("the lifecycle and its exits are both declared", INCIDENT_STATES.length === 8 && INCIDENT_EXITS.length === 5);
t.check("every rule names itself and says why", RULES.every((r) => r.id && r.cause && r.because));
t.check("every rule ends in exactly one of an operation or an exit",
  RULES.every((r) => (r.operation ? 1 : 0) + (r.exit ? 1 : 0) === 1));
t.check("every rule's operation exists", RULES.every((r) => !r.operation || OPERATIONS[r.operation]));
t.check("an incident no rule settles invents nothing", (() => {
  const d = diagnose(incident({ errorCode: "nobody_wrote_a_rule", probes: {}, checkpoint: null, checkpointDigest: null, providerCalls: [] }), SIG);
  return d.ruleId === null && d.operation === null && d.exit === null && d.authority === "human";
})());

t.section("a missing master does not prove an uncollected provider result");
const referenceFailure = incident({failingStage:"references",stage:"references",
  errorCode:"scene_quality_rejected",exceptionClass:"SceneFailed",
  completedStages:["intake","direction"],artifacts:[],selectedTakes:[],
  checkpoint:null,checkpointDigest:null,probes:{artifact_present:false,master_exists:false},
  providerCalls:[{provider:"qc-fixture",requestId:"saved-qc-response",state:"succeeded"}],
  continuationStages:["references","keyframes","video","assemble"]});
for (const [label,probes] of [
  ["the probe is absent",referenceFailure.probes],
  ["the adapter measured no uncollected result",{...referenceFailure.probes,provider_result_uncollected:false}],
]) {
  const d=diagnose({...referenceFailure,probes},SIG);
  t.check(`${label}: successful QC plus missing master cannot select result retrieval`,
    d.ruleId!=="result_already_paid_for" && d.operation===null);
}
const uncollected={...referenceFailure,
  providerCalls:[{provider:"image-fixture",requestId:"saved-image-request",state:"succeeded"}],
  probes:{...referenceFailure.probes,provider_result_uncollected:true}};
t.check("an explicitly measured uncollected result with a known successful request retains retrieval",
  diagnose(uncollected,SIG).operation?.id==="retrieve_known_provider_result");
t.check("an empty provider-call list establishes no known request ID",
  !flagsOf({...uncollected,providerCalls:[]}).has("request_id_known"));
t.check("an uncollected probe alone does not manufacture a provider request",
  diagnose({...uncollected,providerCalls:[]},SIG).operation===null);
t.check("an unknown outcome still stops before result retrieval",
  diagnose({...uncollected,providerCalls:[{provider:"image-fixture",requestId:"saved-image-request",state:"outcome_unknown"}]},SIG).exit==="unknown_paid_outcome");
t.check("direct retrieval authority also requires the measured uncollected-result precondition",
  authorityFor(OPERATIONS.retrieve_known_provider_result,new Set(["request_id_known","provider_call_succeeded"]),referenceFailure).authority==="human");

t.section("every door stayed closed");
t.check("nothing in this file tried the network", tripped() === 0, `${tripped()} attempts`);
t.finish();
