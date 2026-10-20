/* WHAT SETTLES A CAUSE WITHOUT ASKING ANYBODY.
 *
 * Some failures are interpretation and belong to blind readers, a critic and an
 * arbiter. Most are not. `dialogue_count == 0`, `music == off`, `decode == ok`,
 * `measured audio == silent` does not need three opinions — it needs the four
 * facts and a rule. This file holds the rules, the loop protection, and the
 * one honest form of recovery knowledge: a prior verified recovery, ingested as
 * a source, that may satisfy a rule only when every precondition it recorded
 * matches here too.
 *
 * A rule may reach an exit as readily as an operation. The first real incident
 * this domain was written against reaches `engineering_defect`: nothing about
 * the run was broken, the policy that judged it was, and no amount of resuming
 * would have helped. Saying so is the useful answer.
 */
import { authorityFor, evidenceFingerprint, hardStop, OPERATIONS, type Authority, type IncidentFacts, type IncidentState, type RecoveryOperation } from "./records.ts";

export const POLICY_VERSION = "runtime-incident.policy.2";

/* A rule reads facts and nothing else. `when` is pure: same facts, same answer,
   forever — which is what lets a decision made by a rule carry
   `deterministic_rule` authority in the record rather than a model's. */
export type DiagnosisRule = {
  readonly id: string;
  readonly cause: string;
  readonly when: (facts: IncidentFacts, flags: Set<string>) => boolean;
  /* Exactly one of these. An operation is something to do; an exit is a state
     to stop in, because there is nothing safe to do. */
  readonly operation?: string;
  readonly exit?: IncidentState;
  readonly because: string;
};

/* Fact flags: the boolean probes, plus the few structural facts a rule reads as
   a name. Everything a precondition can ask about has to appear here, so a
   precondition can never be satisfied by something nobody measured. */
export function flagsOf(facts: IncidentFacts): Set<string> {
  const flags = new Set<string>();
  for (const [key, value] of Object.entries(facts.probes)) if (value === true) flags.add(key);
  if (facts.checkpoint !== null) flags.add("checkpoint_present");
  if (facts.providerCalls.length && facts.providerCalls.every((c) => c.state === "succeeded")) flags.add("provider_call_succeeded");
  if (facts.providerCalls.length && facts.providerCalls.every((c) => c.requestId.length > 0)) flags.add("request_id_known");
  if (facts.ledger.settled + facts.ledger.held + facts.ledger.reserved <= facts.ledger.authority) flags.add("remaining_authority_covers_cost");
  for (const stage of facts.completedStages) flags.add(`stage_done:${stage}`);
  return flags;
}

export const RULES: DiagnosisRule[] = [
  /* The real one. A structurally sound episode that nobody asked to be audible
     was refused because a level could not be measured. The run is fine; the
     rule that judged it is wrong, and a rule is repaired by engineering, not by
     running the stage again. */
  {
    id: "valid_silence_refused_by_audio_policy",
    cause: "a finishing policy treated a validly silent soundtrack as a fault",
    when: (f, flags) =>
      f.errorCode === "audio_normalization_unmeasurable"
      && f.probes.dialogue_count === 0
      && f.probes.music === "off"
      && flags.has("container_valid")
      && flags.has("decode_ok")
      && f.probes.audio_measured === "silent"
      && !flags.has("required_bed_present"),
    exit: "engineering_defect",
    because: "every fact says the media is sound and nothing was meant to be heard; what failed is the policy, so rerunning the stage would fail again identically",
  },
  /* The same shape, but something WAS meant to be heard. Not a defect: the run
     really is missing audio it was supposed to have. */
  {
    id: "expected_audio_is_missing",
    cause: "a soundtrack that was supposed to carry dialogue or music carries nothing",
    when: (f, flags) =>
      f.errorCode === "audio_normalization_unmeasurable"
      && (Number(f.probes.dialogue_count ?? 0) > 0 || f.probes.music !== "off" || flags.has("required_bed_present")),
    exit: "awaiting_human",
    because: "the episode asked for sound and has none; which take to redo is a creative call and it may cost money",
  },
  {
    id: "assembly_output_missing",
    cause: "the master is absent but every scene it is made from is present",
    when: (f, flags) => flags.has("all_scene_artifacts_present") && !flags.has("master_exists"),
    operation: "rerun_assembly",
    because: "assembly reads only artifacts already made and calls no provider",
  },
  {
    id: "master_present_but_unmeasured",
    cause: "a finished master that no quality pass has measured",
    when: (f, flags) => flags.has("master_exists") && !flags.has("qa_report_written"),
    operation: "rerun_qa",
    because: "measuring an existing file changes nothing and spends nothing",
  },
  {
    id: "worker_lost_its_lease",
    cause: "the process holding the work stopped and its lease lapsed",
    when: (f, flags) => flags.has("lease_expired_or_free") && flags.has("checkpoint_present"),
    operation: "resume_from_checkpoint",
    because: "the record already says where the run had reached",
  },
  {
    id: "result_already_paid_for",
    // A missing master does not establish a missing provider result: successful
    // QC calls can exist while image references failed and no video was made.
    // The adapter must measure an uncollected result of an identified request.
    cause: "a successful provider call has an explicitly measured uncollected result",
    when: (f, flags) => flags.has("provider_call_succeeded") && flags.has("request_id_known")
      && flags.has("provider_result_uncollected"),
    operation: "retrieve_known_provider_result",
    because: "fetching a result already paid for by its own request id submits nothing new",
  },
  {
    id: "artifact_missing_from_storage",
    cause: "an object the record knows the digest of is not where it was put",
    when: (f, flags) => flags.has("artifact_digest_known") && flags.has("artifact_absent_from_storage"),
    operation: "redownload_known_artifact",
    because: "the digest is the test; a fetch that matches it restores the same bytes",
  },
];

export type Diagnosis = {
  ruleId: string | null;
  cause: string;
  operation: RecoveryOperation | null;
  exit: IncidentState | null;
  authority: Authority;
  because: string;
};

/* Hard stops first, then rules in order, then nothing. "Nothing" is an answer:
   an incident no rule settles is not guessed at — it goes to the blind readers,
   and if they disagree it goes to a person. */
export function diagnose(facts: IncidentFacts, signature: string, knowledge: VerifiedRecovery[] = []): Diagnosis {
  const stop = hardStop(facts);
  if (stop) {
    return { ruleId: null, cause: stop.because, operation: null, exit: stop.exit, authority: "human", because: stop.because };
  }
  const flags = flagsOf(facts);
  for (const rule of RULES) {
    if (!rule.when(facts, flags)) continue;
    if (rule.exit) {
      return { ruleId: rule.id, cause: rule.cause, operation: null, exit: rule.exit, authority: "human", because: rule.because };
    }
    const operation = OPERATIONS[rule.operation!];
    const proven = satisfied(signature, operation.id, flags, knowledge, facts);
    const { authority, because } = authorityFor(operation, proven, facts);
    return { ruleId: rule.id, cause: rule.cause, operation, exit: null, authority, because: `${rule.because}; ${because}` };
  }
  return {
    ruleId: null, cause: "no deterministic rule settles this", operation: null, exit: null, authority: "human",
    because: "the facts do not settle a cause, so interpretation is needed and a person decides if the readers disagree",
  };
}

/* ── recovery knowledge, honestly ──────────────────────────────────────────
   There is no cross-run memory in this engine and this does not add one. A
   verified recovery is a row somebody wrote down after a recovery was proven to
   have worked. A later incident may INGEST it as a source, exactly like any
   other source. It is never authoritative because it matches: it may only
   contribute preconditions it actually recorded as verified, for the same
   signature, the same operation, and the same policy and engine version. */

export type VerifiedRecovery = {
  readonly signature: string;
  readonly operationId: string;
  /* Preconditions this recovery proved. A name here is worth nothing on its
     own: `satisfied` cross-checks it against `verifications` below, so a row
     cannot claim to have established something its own verifier never passed. */
  readonly verifiedPreconditions: string[];
  /* The verification results as they were recorded at the time. */
  readonly verifications: { name: string; pass: boolean }[];
  /* Evidence fingerprints, not incident signatures: the concrete state this
     recovery started from and reached. */
  readonly beforeFingerprint: string;
  readonly afterFingerprint: string;
  readonly outcome: "recovered" | "failed";
  readonly policyVersion: string;
  readonly engineVersion: string;
  readonly providerCalls: number;
  readonly incrementalSpend: number;
};

/* Loop protection compares CONCRETE state, so it uses the evidence
   fingerprint. The earlier `fingerprint()` here hashed the signature input a
   second time, which meant "the same kind of incident" was mistaken for "the
   same state" and real progress was invisible. It is gone; use this. */
export { evidenceFingerprint };

/* WHICH PRECONDITIONS THE EVIDENCE ESTABLISHES.
 *
 * A prior verified recovery may contribute one only when it is the same
 * situation, under the same operation, under the same rules, and it actually
 * worked — ALL of:
 *
 *   1. the same incident signature;
 *   2. the same recovery operation;
 *   3. the same policy version;
 *   4. the same engine version;
 *   5. outcome `recovered`;
 *   6. that specific precondition independently verified — cross-checked
 *      against the row's own verification results, so naming it is not enough.
 *
 * The earlier version checked only 3, 4 and 5. Evidence from an unrelated
 * incident, or from a different operation on the same incident, could hand a
 * precondition to an operation that had never established it — which is the
 * whole of the authority this engine is built to withhold.
 */
export function satisfied(
  signature: string, operationId: string, flags: Set<string>, knowledge: VerifiedRecovery[], facts: IncidentFacts,
): Set<string> {
  const out = new Set(flags);
  for (const prior of knowledge) {
    if (prior.signature !== signature) continue;
    if (prior.operationId !== operationId) continue;
    if (prior.policyVersion !== facts.policyVersion) continue;
    if (prior.engineVersion !== facts.engineVersion) continue;
    if (prior.outcome !== "recovered") continue;
    const passed = new Set(prior.verifications.filter((v) => v.pass).map((v) => v.name));
    for (const precondition of prior.verifiedPreconditions) {
      if (passed.has(precondition)) out.add(precondition);
    }
  }
  return out;
}

/* ── loop protection ───────────────────────────────────────────────────────
   The same operation, on the same situation, from the same starting evidence,
   is not run again once it has already failed from there. Verified progress —
   a different after-fingerprint — earns another bounded attempt; an identical
   one does not. */

export function attemptKey(signature: string, operationId: string, beforeEvidenceFingerprint: string): string {
  return `${signature}|${operationId}|${beforeEvidenceFingerprint}`;
}

export function mayAttempt(
  signature: string, operationId: string, beforeFingerprint: string, history: VerifiedRecovery[],
): { allowed: boolean; because: string } {
  const here = history.filter((h) => h.signature === signature && h.operationId === operationId && h.beforeFingerprint === beforeFingerprint);
  const stuck = here.filter((h) => h.outcome === "failed" && h.afterFingerprint === h.beforeFingerprint);
  if (stuck.length) {
    return {
      allowed: false,
      because: `${operationId} already failed from this exact evidence ${stuck.length} time(s) and moved nothing; repeating it is a loop, not a recovery`,
    };
  }
  const progressed = here.filter((h) => h.outcome === "failed" && h.afterFingerprint !== h.beforeFingerprint);
  if (progressed.length) {
    return { allowed: true, because: `${operationId} failed here before but the evidence moved, so one more bounded attempt is warranted` };
  }
  return { allowed: true, because: `${operationId} has not been attempted from this evidence` };
}
