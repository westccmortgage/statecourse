/* A TASK IS NOT COMPLETE BECAUSE SOMETHING SUCCEEDED.
 *
 * Six things have each, at some point, been mistaken for a finished task: an
 * executor returning, a pull request opening, a build going green, a file
 * existing, a master being assembled, and a quality pass that signed off a
 * different version an hour ago. Every one of them is checked here and every
 * one of them is refused.
 *
 * Then the six acceptance scenarios, end to end at the level a person would
 * describe them: the silent soundtrack that should recover for nothing, the
 * eighteen-second film that is correctly formatted and unwatchable, the paid
 * call nobody knows the outcome of, the recovery that moved nothing twice, the
 * proof from somebody else's incident, and the master whose scene was swapped
 * after it was accepted.
 *
 * No provider is reached and the network is closed before anything is read.
 */
import { harness, closeNetwork } from "./harness.mjs";
import { completionOf, unmetRequirements, COMPLETION_STATES, INTERMEDIATE_ARTIFACTS, isIntermediateOnly } from "../kernel/completion.ts";
import { FILM_GATES, FILM_VERDICTS, SHOT_GATES, failedGates, gatesOf, instantVideoGates, objectContinuityFindings, reviewFilm, INSTANT_VIDEO } from "../domains/video-episode/gates.ts";
import { evidenceFingerprint, incidentSignature, OPERATIONS, authorityFor, hardStop } from "../domains/runtime-incident/records.ts";
import { diagnose, mayAttempt, satisfied, POLICY_VERSION } from "../domains/runtime-incident/policy.ts";
import { verifyRecovery } from "../domains/runtime-incident/verifiers.ts";

const tripped = closeNetwork();
const t = harness("a task is complete when the outcome exists, is verified, and is the one that was decided");

const DIGEST = "a".repeat(64);
const ok = (name) => ({ name, required: true, passed: true, evidence: "checked after the fact" });

/* Everything a delivered task needs, so each check can remove exactly one. */
function delivered(over = {}) {
  return {
    outcomeRequired: "a finished 18-second master the owner can watch",
    artifactExists: true, artifactDigest: DIGEST, decisionBoundDigest: DIGEST,
    acceptanceGates: [ok("duration"), ok("dimensions"), ok("decodes")],
    readBackSucceeded: true, verifiedBy: "independent_verifier",
    ...over,
  };
}

/* ═══════════════════════════ 1 · the five requirements */
t.section("DELIVERED needs all five, and removing any one of them removes it");
t.check("all five present: DELIVERED", completionOf(delivered()).state === "DELIVERED");
t.check("and it says why", completionOf(delivered()).because.includes("independent verifier"));
t.check("five states, no more", COMPLETION_STATES.length === 5);
for (const [what, over] of [
  ["no stated outcome", { outcomeRequired: "  " }],
  ["the artifact does not exist", { artifactExists: false }],
  ["its digest was never recorded", { artifactDigest: null }],
  ["no digest was bound to the decision", { decisionBoundDigest: null }],
  ["the delivery was never read back", { readBackSucceeded: false }],
  ["nothing verified it", { verifiedBy: null }],
]) {
  const c = completionOf(delivered(over));
  t.check(`${what}: not DELIVERED`, c.state !== "DELIVERED", `${c.state}: ${c.unmet[0] ?? ""}`);
}

/* ═══════════════════════════ 2 · the six things that are not completion */
t.section("none of these is a finished task");
const notDelivered = (label, over) => {
  const c = completionOf(delivered(over));
  t.check(label, c.state !== "DELIVERED", `${c.state} — ${c.unmet.join("; ").slice(0, 110)}`);
};
notDelivered("AN EXECUTOR RETURNING SUCCESS is not completion", { verifiedBy: "executor_response" });
notDelivered("A PULL REQUEST OPENING is not completion",
  { outcomeRequired: "a finished master", artifactExists: false, verifiedBy: "executor_response" });
notDelivered("CI PASSING is not completion",
  { acceptanceGates: [ok("ci")], artifactExists: false });
notDelivered("A FILE EXISTING is not completion", { verifiedBy: null });
notDelivered("A MASTER BEING ASSEMBLED is not completion",
  { readBackSucceeded: false, verifiedBy: "executor_response" });
notDelivered("A PREVIOUS VERSION HAVING PASSED QA is not completion",
  { artifactDigest: "b".repeat(64) });

t.section("an intermediate artifact is the outcome only when it is what was asked for");
t.check("twelve of them are named", INTERMEDIATE_ARTIFACTS.length === 12);
t.check("resting only on a pull request, when a master was asked for, is intermediate",
  isIntermediateOnly(["pull_request_opened"], "a finished master"));
t.check("but a task that asked for a pull request is delivered by one",
  !isIntermediateOnly(["pull_request_opened"], "pull_request_opened"));
t.check("resting on nothing intermediate is not intermediate", !isIntermediateOnly([], "a finished master"));

/* ═══════════════════════════ 3 · gates are hard, and silence is not a pass */
t.section("a required gate with no evidence is failed, not assumed");
const unevidenced = completionOf(delivered({ acceptanceGates: [ok("duration"), { name: "continuity", required: true, passed: true, evidence: null }] }));
t.check("a gate that passed but evidenced nothing is unmet", unevidenced.state !== "DELIVERED");
t.check("and it is named as unevidenced rather than failed",
  unevidenced.unmet.some((u) => u.includes("no evidence")), unevidenced.unmet.join("; ").slice(0, 100));
t.check("a gate nobody reported at all is unmet",
  completionOf(delivered({ acceptanceGates: [{ name: "continuity", required: true, passed: null, evidence: null }] })).state !== "DELIVERED");
t.check("A HIGH PASS RATE CANNOT CARRY ONE FAILED HARD GATE", (() => {
  const many = Array.from({ length: 30 }, (_, i) => ok(`check-${i}`));
  return completionOf(delivered({ acceptanceGates: [...many, { name: "prop_continuity", required: true, passed: false, evidence: "the letter vanished" }] })).state !== "DELIVERED";
})());
t.check("an optional gate failing does not block delivery",
  completionOf(delivered({ acceptanceGates: [ok("duration"), { name: "nice_to_have", required: false, passed: false, evidence: "meh" }] })).state === "DELIVERED");

t.section("malformed or missing runtime evidence cannot manufacture delivery");
for (const [label, over] of [
  ["no acceptance criteria", { acceptanceGates: [] }],
  ["only optional criteria", { acceptanceGates: [{ ...ok("QA"), required: false }] }],
  ["missing acceptance criteria", { acceptanceGates: undefined }],
  ["a null gate", { acceptanceGates: [null] }],
  ["an unnamed gate", { acceptanceGates: [{ ...ok("QA"), name: "  " }] }],
  ["duplicate gate identities", { acceptanceGates: [ok("QA"), ok("QA")] }],
  ["blank evidence", { acceptanceGates: [{ ...ok("QA"), evidence: " \t\n " }] }],
  ["missing evidence", { acceptanceGates: [{ ...ok("QA"), evidence: undefined }] }],
  ["missing verdict", { acceptanceGates: [{ ...ok("QA"), passed: undefined }] }],
  ["text instead of a boolean verdict", { acceptanceGates: [{ ...ok("QA"), passed: "true" }] }],
  ["missing required flag", { acceptanceGates: [{ ...ok("QA"), required: undefined }] }],
  ["missing independent verifier", { verifiedBy: undefined }],
  ["unknown verifier", { verifiedBy: "another_value" }],
  ["text false instead of existence", { artifactExists: "false" }],
  ["text false instead of read-back", { readBackSucceeded: "false" }],
  ["matching invalid digests", { artifactDigest: " ", decisionBoundDigest: " " }],
]) {
  let result;
  try { result = completionOf(delivered(over)); } catch { result = null; }
  t.check(`${label}: a structured refusal, never DELIVERED`,
    result !== null && result.state !== "DELIVERED" && result.unmet.length > 0);
}

/* ═══════════════════════════ 4 · which state it lands in when not delivered */
t.section("a refusal is a specific state, and DELIVERED is tested before any of them");
t.check("a repair under way is REPAIRING",
  completionOf(delivered({ artifactExists: false, repairInProgress: true })).state === "REPAIRING");
t.check("an authority owed is AWAITING_AUTHORITY",
  completionOf(delivered({ artifactExists: false, authorityOwed: "a budget increase only a person may grant" })).state === "AWAITING_AUTHORITY");
t.check("something outside is BLOCKED_EXTERNAL",
  completionOf(delivered({ artifactExists: false, externalBlocker: "the storage bucket is unreachable" })).state === "BLOCKED_EXTERNAL");
t.check("otherwise it is FAILED_VERIFIED, not silence",
  completionOf(delivered({ artifactExists: false })).state === "FAILED_VERIFIED");
t.check("A REPAIR IN PROGRESS CANNOT BE PRESENTED AS DELIVERY",
  completionOf(delivered({ verifiedBy: "executor_response", repairInProgress: true })).state === "REPAIRING");

/* ═══════════════════════════ 5 · the video gates */
t.section("every shot is judged on every gate, and the film on its own");
const verdict = (pass, evidence = "read by an independent reader") => ({ pass, evidence });
const shot = (id, over = {}) => ({ shotId: id, verdicts: Object.fromEntries([...SHOT_GATES.map((g) => [g, verdict(true)]), ...Object.entries(over)]) });
const film = (over = {}) => ({ ...Object.fromEntries(FILM_GATES.map((g) => [g, verdict(true)])), ...over });
const goodFilm = { shots: [shot("sc01"), shot("sc02"), shot("sc03")], film: film() };
t.check("eight shot gates and seven film gates", SHOT_GATES.length === 8 && FILM_GATES.length === 7);
t.check("a clean film has no failed gate", failedGates(goodFilm).length === 0);
t.check("every gate is required", gatesOf(goodFilm).every((g) => g.required));
t.check("three shots give 24 shot gates plus 7 film gates", gatesOf(goodFilm).length === 31);
t.check("a shot missing one verdict fails exactly that gate", (() => {
  const missing = { shots: [shot("sc01"), { shotId: "sc02", verdicts: {} }, shot("sc03")], film: film() };
  const failed = failedGates(missing);
  return failed.length === SHOT_GATES.length && failed.every((f) => f.name.startsWith("sc02/") && f.reason === "no_evidence");
})());

t.section("a story-bearing object may not vanish");
const letter = (over) => [{ object: "the letter", shots: [
  { shotId: "sc01", visible: true, sameObject: true, visibleTransferOrExit: null },
  { shotId: "sc02", visible: false, sameObject: null, visibleTransferOrExit: null, ...over },
  { shotId: "sc03", visible: false, sameObject: null, visibleTransferOrExit: null },
] }];
t.check("THE DISAPPEARING LETTER IS A FINDING", objectContinuityFindings(letter({})).length > 0,
  objectContinuityFindings(letter({}))[0]?.what);
t.check("it names the scene it went missing in", objectContinuityFindings(letter({}))[0].shotId === "sc02");
t.check("a letter handed over on screen is not a finding",
  objectContinuityFindings([{ object: "the letter", shots: [
    { shotId: "sc01", visible: true, sameObject: true, visibleTransferOrExit: null },
    { shotId: "sc02", visible: false, sameObject: null, visibleTransferOrExit: true }] }]).length === 0);
t.check("a letter that became a different letter is a finding",
  objectContinuityFindings([{ object: "the letter", shots: [
    { shotId: "sc01", visible: true, sameObject: true, visibleTransferOrExit: null },
    { shotId: "sc02", visible: true, sameObject: false, visibleTransferOrExit: null }] }]).some((f) => f.what.includes("not the same object")));

t.section("the verdict on a whole film, and the one in the middle");
t.check("three verdicts, no score", FILM_VERDICTS.length === 3 && FILM_VERDICTS[1] === "REPAIR_REQUIRED");
t.check("a clean film is ACCEPTED", reviewFilm(goodFilm).verdict === "ACCEPTED");
{
  /* The letter as a reader who LOOKED reports it: it was there, then it was
     gone, and no action on screen accounts for it. */
  const seen = reviewFilm(goodFilm, letter({ visibleTransferOrExit: false }));
  t.check("THE DISAPPEARING LETTER MAKES A TECHNICALLY PERFECT FILM REPAIR_REQUIRED",
    seen.verdict === "REPAIR_REQUIRED", `${seen.verdict}: ${seen.because}`);
  t.check("and the verdict names the scene and what happened in it",
    seen.because.includes("sc02") && seen.because.includes("no visible action"), seen.because);
  t.check("and it does not pretend the repair is free",
    !seen.because.includes("automatic") && seen.failed.length === 0);
}
{
  /* The same letter, but nobody looked. That is not a repairable defect. */
  const unlooked = reviewFilm(goodFilm, letter({}));
  t.check("A LETTER NOBODY LOOKED FOR IS REJECTED, NOT REPAIR_REQUIRED",
    unlooked.verdict === "REJECTED", `${unlooked.verdict}: ${unlooked.because}`);
  t.check("and it says an unmeasured film is measured", unlooked.because.includes("not repaired"));
}
t.check("a shot whose gates nobody judged is REJECTED",
  reviewFilm({ shots: [shot("sc01"), { shotId: "sc02", verdicts: {} }], film: film() }).verdict === "REJECTED");
t.check("a film that fails a judged gate is REPAIR_REQUIRED",
  reviewFilm({ shots: [shot("sc01", { action_legible: verdict(false, "the action reads as nothing") })], film: film() })
    .verdict === "REPAIR_REQUIRED");

/* ═══════════════════════════ 6 · the Instant Video contract */
t.section("Instant Video promises a shape, and ambience is part of it");
const iv = (over = {}) => ({
  shotCount: 3, width: 1080, height: 1920, totalSeconds: 18,
  shotSizes: ["wide", "medium", "close"], beats: ["hook", "change", "payoff"],
  distinctActions: true, audioState: "measurable", silenceRequested: false, ...over,
});
const ivFailed = (over) => instantVideoGates(iv(over)).filter((g) => g.passed !== true).map((g) => g.name);
t.check("the contract is three six-second shots at 1080x1920, about 18s",
  INSTANT_VIDEO.shots === 3 && INSTANT_VIDEO.shotSeconds === 6 && INSTANT_VIDEO.width === 1080
  && INSTANT_VIDEO.height === 1920 && INSTANT_VIDEO.totalSeconds === 18);
t.check("a conforming film passes every gate", ivFailed({}).length === 0);
t.check("two shots is not three", ivFailed({ shotCount: 2 }).includes("instant/shot_count"));
t.check("landscape is refused", ivFailed({ width: 1920, height: 1080 }).includes("instant/dimensions"));
t.check("eleven seconds is refused", ivFailed({ totalSeconds: 11 }).includes("instant/duration"));
t.check("18.4s is within tolerance", !ivFailed({ totalSeconds: 18.4 }).includes("instant/duration"));
t.check("ONE SHOT SIZE THREE TIMES IS REFUSED",
  ivFailed({ shotSizes: ["wide", "wide", "wide"] }).includes("instant/two_shot_sizes"));
t.check("beats out of order are refused", ivFailed({ beats: ["payoff", "hook", "change"] }).includes("instant/beats_in_order"));
t.check("a beat nobody named is unevidenced, not assumed", (() => {
  const gate = instantVideoGates(iv({ beats: ["hook", null, "payoff"] })).find((g) => g.name === "instant/beats_in_order");
  return gate.passed === null && gate.evidence === null;
})());
t.check("THE SAME ACTION THREE TIMES IS REFUSED", ivFailed({ distinctActions: false }).includes("instant/no_repeated_action"));
t.check("INSTANT VIDEO REJECTS A SILENT MASTER when ambience is required",
  ivFailed({ audioState: "silent" }).includes("instant/ambience"));
t.check("and rejects an absent audio stream too", ivFailed({ audioState: "absent" }).includes("instant/ambience"));
t.check("but silence explicitly asked for is allowed",
  !ivFailed({ audioState: "silent", silenceRequested: true }).includes("instant/ambience"));
t.check("an undecodable soundtrack is never allowed, even when silence was asked for",
  ivFailed({ audioState: "undecodable", silenceRequested: true }).includes("instant/ambience"));

/* ═══════════════════════════ SCENARIOS */
const ENGINE = "core-v2/2.0";
const PAID = ["keyframes", "video", "voice", "lipsync", "music"];
function facts(over = {}) {
  return {
    application: "markevita", workflowId: "f851a739", failingStage: "assemble",
    exceptionClass: "RuntimeError", errorCode: "audio_normalization_unmeasurable",
    completedStages: ["intake", "direction", "references", "keyframes", "video", "voice", "lipsync"],
    artifacts: [{ kind: "scene_final", digest: "1".repeat(64) }, { kind: "scene_final", digest: "2".repeat(64) }, { kind: "scene_final", digest: "3".repeat(64) }],
    providerCalls: [{ provider: "fal", requestId: "req-sc01", state: "succeeded" }],
    ledger: { settled: 13.3, held: 0, reserved: 0, authority: 50 },
    probes: { dialogue_count: 0, music: "off", container_valid: true, decode_ok: true, audio_measured: "silent", all_scene_artifacts_present: true },
    checkpoint: "assemble/scenes-cut", checkpointDigest: "c".repeat(64),
    selectedTakes: [{ subject: "sc01", takeId: "take-1", digest: "d".repeat(64) }],
    stage: "assemble", qaState: "not_run", paidStages: PAID, continuationStages: ["assemble", "qa", "deliver"],
    policyVersion: POLICY_VERSION, engineVersion: ENGINE, ...over,
  };
}

t.section("SCENARIO 1 · a silent soundtrack, silence explicitly allowed, recovers for nothing");
{
  /* Silence is allowed here, so this is not the audio-policy defect: the master
     was simply never assembled. */
  const before = facts({ errorCode: "assembly_never_ran", probes: { all_scene_artifacts_present: true, container_valid: true } });
  const sig = await incidentSignature(before);
  const fpBefore = await evidenceFingerprint(before);
  const d = diagnose(before, sig);
  t.check("the incident is diagnosed by rule, not by a model", d.ruleId === "assembly_output_missing", String(d.ruleId));
  t.check("the operation proposed is local reassembly", d.operation?.id === "rerun_assembly");
  t.check("it is AUTHORISED AUTOMATICALLY", d.authority === "automatic", d.because);
  t.check("its boundary reaches no paid stage", d.operation.boundary.every((b) => !PAID.includes(b)));

  const after = facts({ errorCode: "assembly_never_ran", stage: "deliver", qaState: "passed",
    artifacts: [...before.artifacts, { kind: "master", digest: DIGEST }],
    probes: { ...before.probes, master_exists: true, master_digest_recorded: true, master_decodes: true,
      duration_expected: true, dimensions_expected: true, qa_report_written: true, qa_passed: true, delivery_recorded: true } });
  const fpAfter = await evidenceFingerprint(after);
  const v = verifyRecovery(OPERATIONS.rerun_assembly, { before, after, beforeFingerprint: fpBefore, afterFingerprint: fpAfter });
  t.check("recovery is independently verified", v.recovered, v.because);
  t.check("NO PROVIDER CALL WAS MADE", v.providerCallDelta === 0);
  t.check("SPEND DID NOT INCREASE", v.incrementalSpend === 0);

  const c = completionOf({
    outcomeRequired: "a finished 18-second master the owner can watch",
    artifactExists: true, artifactDigest: DIGEST, decisionBoundDigest: DIGEST,
    acceptanceGates: [...gatesOf(goodFilm), ...instantVideoGates(iv({ audioState: "silent", silenceRequested: true }))],
    readBackSucceeded: true, verifiedBy: "independent_verifier",
  });
  t.check("THE TASK REACHES DELIVERED", c.state === "DELIVERED", `${c.state}: ${c.unmet.join("; ").slice(0, 120)}`);
}

t.section("SCENARIO 2 · eighteen seconds, 1080x1920, three shots, and unwatchable");
{
  const badFilm = {
    shots: [shot("sc01"), shot("sc02", { prop_continuity: verdict(false, "the letter is gone and nothing showed it leaving"),
      time_of_day_and_lighting: verdict(false, "morning in sc01, dusk here, with nothing to explain it") }), shot("sc03")],
    film: film({ shots_contribute_distinctly: verdict(false, "all three shots are the same action") }),
  };
  const technical = instantVideoGates(iv({ distinctActions: false, audioState: "silent", shotSizes: ["medium", "medium", "medium"] }));
  t.check("the technical shape checks still pass",
    technical.filter((g) => ["instant/shot_count", "instant/dimensions", "instant/duration"].includes(g.name)).every((g) => g.passed === true));
  const failed = [...failedGates(badFilm).map((f) => f.name), ...technical.filter((g) => g.passed !== true).map((g) => g.name)];
  t.check("SEMANTIC AND CONTINUITY GATES FAIL", failed.length >= 5, failed.join(", "));
  t.check("the precise scene and gate are named", failed.includes("sc02/prop_continuity"));
  t.check("the time-of-day break is named", failed.includes("sc02/time_of_day_and_lighting"));
  t.check("the repeated action is named", failed.includes("film/shots_contribute_distinctly") && failed.includes("instant/no_repeated_action"));
  t.check("the missing ambience is named", failed.includes("instant/ambience"));
  t.check("THE DISAPPEARING LETTER IS DETECTED INDEPENDENTLY", objectContinuityFindings(letter({})).length > 0);
  const review = reviewFilm(badFilm, letter({ visibleTransferOrExit: false }));
  t.check("AND THE FILM'S VERDICT IS REPAIR_REQUIRED", review.verdict === "REPAIR_REQUIRED",
    `${review.verdict}: ${review.because}`);

  const c = completionOf({
    outcomeRequired: "a finished 18-second master the owner can watch",
    artifactExists: true, artifactDigest: DIGEST, decisionBoundDigest: DIGEST,
    acceptanceGates: [...gatesOf(badFilm), ...technical], readBackSucceeded: true, verifiedBy: "independent_verifier",
  });
  t.check("DELIVERY IS BLOCKED", c.state !== "DELIVERED", c.state);
  t.check("and the refusal is established, not assumed", c.state === "FAILED_VERIFIED");
  /* Repairing any of this means new video, which is a paid stage. */
  const repair = facts({ errorCode: "semantic_gate_failed", continuationStages: ["video", "assemble", "qa"] });
  t.check("NO AUTOMATIC REPAIR IS OFFERED, because repair means a paid stage",
    authorityFor(OPERATIONS.resume_from_checkpoint, new Set(OPERATIONS.resume_from_checkpoint.preconditions), repair).authority === "human",
    authorityFor(OPERATIONS.resume_from_checkpoint, new Set(OPERATIONS.resume_from_checkpoint.preconditions), repair).because);
}

t.section("SCENARIO 3 · a paid call whose outcome nobody knows");
{
  const unknown = facts({ providerCalls: [{ provider: "fal", requestId: "req-sc02", state: "outcome_unknown" }] });
  const sig = await incidentSignature(unknown);
  t.check("the incident reaches unknown_paid_outcome", diagnose(unknown, sig).exit === "unknown_paid_outcome");
  t.check("no operation is proposed at all", diagnose(unknown, sig).operation === null);
  t.check("NO DUPLICATE SUBMISSION IS POSSIBLE: the hard stop precedes every rule", hardStop(unknown)?.exit === "unknown_paid_outcome");
  t.check("only retrieval of what was already paid for promises no duplicate",
    OPERATIONS.retrieve_known_provider_result.verifies.includes("no_duplicate_provider_submission"));
  t.check("and retrieval requires the outcome to be known first",
    OPERATIONS.retrieve_known_provider_result.preconditions.includes("provider_call_succeeded"));
}

t.section("SCENARIO 4 · a recovery that moved nothing, twice");
{
  const before = facts();
  const sig = await incidentSignature(before);
  const fp = await evidenceFingerprint(before);
  const stuck = { signature: sig, operationId: "rerun_assembly", verifiedPreconditions: [], verifications: [],
    beforeFingerprint: fp, afterFingerprint: fp, outcome: "failed",
    policyVersion: POLICY_VERSION, engineVersion: ENGINE, providerCalls: 0, incrementalSpend: 0 };
  t.check("the first attempt is allowed", mayAttempt(sig, "rerun_assembly", fp, []).allowed);
  t.check("THE SAME OPERATION FROM THE SAME CONCRETE STATE IS REFUSED AFTERWARDS",
    !mayAttempt(sig, "rerun_assembly", fp, [stuck]).allowed, mayAttempt(sig, "rerun_assembly", fp, [stuck]).because);
  t.check("and the fingerprint it compares is the real one, not an invented string", fp.length === 64 && /^[0-9a-f]+$/.test(fp));
}

t.section("SCENARIO 5 · a proof from somebody else's incident");
{
  const f = facts();
  const sig = await incidentSignature(f);
  const other = "0".repeat(64);
  const proof = { signature: other, operationId: "rebuild_master_from_paid_assets",
    verifiedPreconditions: ["paid_assets_immutable"], verifications: [{ name: "paid_assets_immutable", pass: true }],
    beforeFingerprint: "e".repeat(64), afterFingerprint: "f".repeat(64), outcome: "recovered",
    policyVersion: POLICY_VERSION, engineVersion: ENGINE, providerCalls: 0, incrementalSpend: 0 };
  t.check("ANOTHER INCIDENT'S PROOF GRANTS NOTHING",
    !satisfied(sig, "rebuild_master_from_paid_assets", new Set(), [proof], f).has("paid_assets_immutable"));
  t.check("ANOTHER OPERATION'S PROOF GRANTS NOTHING",
    !satisfied(sig, "rebuild_master_from_paid_assets", new Set(), [{ ...proof, signature: sig, operationId: "rerun_qa" }], f).has("paid_assets_immutable"));
  t.check("and granting nothing means no authority",
    authorityFor(OPERATIONS.rebuild_master_from_paid_assets,
      satisfied(sig, "rebuild_master_from_paid_assets", new Set(), [proof], f), f).authority === "human");
}

t.section("SCENARIO 6 · a scene swapped after the master was accepted");
{
  const acceptedMaster = DIGEST;
  const c = completionOf({
    outcomeRequired: "a finished 18-second master the owner can watch",
    artifactExists: true,
    /* The master was rebuilt after a scene was replaced, so what exists now is
       not what was accepted. */
    artifactDigest: "9".repeat(64), decisionBoundDigest: acceptedMaster,
    acceptanceGates: [...gatesOf(goodFilm), ...instantVideoGates(iv())],
    readBackSucceeded: true, verifiedBy: "independent_verifier",
  });
  t.check("DELIVERY IS BLOCKED when the master is not the one that was accepted", c.state !== "DELIVERED");
  t.check("and the reason names the stale binding",
    c.unmet.some((u) => u.includes("not the one the decision was made about")), c.unmet.join("; ").slice(0, 120));

  const before = facts();
  const after = facts({ selectedTakes: [{ subject: "sc01", takeId: "take-1", digest: "0".repeat(64) }] });
  const v = verifyRecovery(OPERATIONS.rebuild_master_from_paid_assets, {
    before, after, beforeFingerprint: await evidenceFingerprint(before), afterFingerprint: await evidenceFingerprint(after) });
  t.check("and rewriting a paid take fails the recovery's own verification", !v.recovered, v.because);
}

t.section("every door stayed closed");
t.check("nothing in this file tried the network", tripped() === 0, `${tripped()} attempts`);
t.finish();
