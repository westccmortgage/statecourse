/* A TASK IS NOT COMPLETE BECAUSE SOMETHING SUCCEEDED.
 *
 * Every layer of this engine can return successfully without the thing anybody
 * wanted existing. An executor returns; a pull request opens; a build goes
 * green; a row is written; a file appears on disk; a master is assembled; a
 * quality pass signed off a DIFFERENT version an hour ago. Each of those is an
 * intermediate artifact, and each has, at some point, been mistaken for the
 * outcome.
 *
 * So completion is not a status a component sets. It is a predicate over
 * evidence, evaluated here, and it has exactly five answers. A DomainPack says
 * what its outcome is and hands over the evidence; it does not get to say
 * whether the outcome was reached.
 *
 * `DELIVERED` needs all five of:
 *
 *   1. the requested artifact or external state EXISTS;
 *   2. its CURRENT digest is the one the decision was made about — not merely
 *      present, and not a version that passed something earlier;
 *   3. every applicable acceptance gate PASSED, with evidence; a gate whose
 *      evidence is missing is failed, never assumed;
 *   4. delivery was READ BACK, not merely attempted;
 *   5. an INDEPENDENT VERIFIER checked the delivered state — an executor's own
 *      report of its own success is not verification of anything.
 *
 * This file is provider-free and domain-free: it names no product, no format
 * and no provider, and it reads nothing but the evidence it is handed.
 */

export const COMPLETION_STATES = [
  /* The outcome exists, is the one that was decided, passed its gates, was read
     back, and an independent verifier said so. */
  "DELIVERED",
  /* Something is wrong and a safe, authorised repair is under way. */
  "REPAIRING",
  /* Going further needs an authority no machine may grant itself — money, a
     consequential action, or a creative choice. */
  "AWAITING_AUTHORITY",
  /* Something outside the system is in the way and nothing here can move it. */
  "BLOCKED_EXTERNAL",
  /* It did not work, and that has been established rather than assumed. */
  "FAILED_VERIFIED",
] as const;
export type CompletionState = (typeof COMPLETION_STATES)[number];

/* An acceptance gate. `required` gates are hard: a high score elsewhere cannot
   carry a failed one, and `evidence: null` is a FAILURE rather than a pass,
   because "nobody checked" and "it was fine" are different facts. */
export type AcceptanceGate = {
  readonly name: string;
  readonly required: boolean;
  readonly passed: boolean | null;
  readonly evidence: string | null;
};

/* Who said the outcome was reached. `executor_response` is recorded so that the
   refusal can name it, not so that it can count. */
export type VerificationSource = "independent_verifier" | "executor_response" | null;

export type CompletionEvidence = {
  /* 1 · what was required. A task with no stated outcome cannot be complete,
     because there is nothing to have delivered. */
  readonly outcomeRequired: string;
  /* 2 · does the requested thing exist, and what is it now? */
  readonly artifactExists: boolean;
  readonly artifactDigest: string | null;
  /* 3 · which version the decision was actually made about. When these differ,
     something was replaced after acceptance and the authorisation is stale. */
  readonly decisionBoundDigest: string | null;
  /* 4 · the gates, whatever the domain's are. */
  readonly acceptanceGates: readonly AcceptanceGate[];
  /* 5 · was the delivery read back from where it was delivered to? */
  readonly readBackSucceeded: boolean;
  readonly verifiedBy: VerificationSource;
  /* Set by the domain when a repair is genuinely running, an authority is
     genuinely owed, or something external genuinely blocks. Each is only
     consulted once DELIVERED has been refused, so none of them can be used to
     claim completion. */
  readonly repairInProgress?: boolean;
  readonly authorityOwed?: string | null;
  readonly externalBlocker?: string | null;
};

export type Completion = {
  readonly state: CompletionState;
  readonly because: string;
  /* Every requirement of DELIVERED that is not met, named. */
  readonly unmet: string[];
};

/* Named so the refusals read as the reason they are, rather than as a boolean. */
const UNMET = {
  noOutcome: "no required outcome was stated, so there is nothing to have delivered",
  absent: "the requested artifact or external state does not exist",
  noDigest: "the artifact exists but its current digest was never recorded",
  unbound: "no digest was bound to the decision, so nothing says which version was accepted",
  stale: "the artifact's current digest is not the one the decision was made about",
  gateFailed: "a required acceptance gate failed",
  gateUnevidenced: "a required acceptance gate has no evidence, which is a failure and not a pass",
  notReadBack: "the delivery was never read back from where it was delivered to",
  unverified: "nothing independently verified the delivered state",
  executorOnly: "the only thing that said this worked is the executor that did it",
  noGates: "no required acceptance criteria were supplied",
  invalidGates: "acceptance gates must have unique names, explicit boolean flags, and a verdict and evidence field",
} as const;

const hasText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const hasDigest = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{64}$/.test(value);

function isGate(value: unknown): value is AcceptanceGate {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const gate = value as Record<string, unknown>;
  return hasText(gate.name) && typeof gate.required === "boolean"
    && (typeof gate.passed === "boolean" || gate.passed === null)
    && (typeof gate.evidence === "string" || gate.evidence === null);
}

export function unmetRequirements(evidence: CompletionEvidence): string[] {
  const unmet: string[] = [];
  if (!hasText(evidence?.outcomeRequired)) unmet.push(UNMET.noOutcome);
  if (evidence?.artifactExists !== true) unmet.push(UNMET.absent);
  if (evidence?.artifactExists === true && !hasDigest(evidence.artifactDigest)) unmet.push(UNMET.noDigest);
  if (!hasDigest(evidence?.decisionBoundDigest)) unmet.push(UNMET.unbound);
  if (evidence?.artifactDigest && evidence.decisionBoundDigest
      && evidence.artifactDigest !== evidence.decisionBoundDigest) unmet.push(UNMET.stale);

  // These values also arrive from JSON and JavaScript adapters; TypeScript
  // declarations do not validate them at runtime. Positive proof is required.
  const gates = Array.isArray(evidence?.acceptanceGates) ? evidence.acceptanceGates : [];
  const wellFormed = gates.every(isGate);
  if (!wellFormed || new Set(gates.filter(isGate).map((g) => g.name.trim())).size !== gates.length) {
    unmet.push(UNMET.invalidGates);
  }
  const required = gates.filter(isGate).filter((g) => g.required === true);
  if (required.length === 0) unmet.push(UNMET.noGates);
  const unevidenced = required.filter((g) => g.passed !== true && g.passed !== false || !hasText(g.evidence));
  const failed = required.filter((g) => g.passed === false);
  if (failed.length) unmet.push(`${UNMET.gateFailed}: ${failed.map((g) => g.name).join(", ")}`);
  if (unevidenced.length) unmet.push(`${UNMET.gateUnevidenced}: ${unevidenced.map((g) => g.name).join(", ")}`);

  if (evidence?.readBackSucceeded !== true) unmet.push(UNMET.notReadBack);
  if (evidence?.verifiedBy === "executor_response") unmet.push(UNMET.executorOnly);
  else if (evidence?.verifiedBy !== "independent_verifier") unmet.push(UNMET.unverified);
  return unmet;
}

/* THE ONLY PLACE A TASK BECOMES COMPLETE.
 *
 * DELIVERED is tested first and on its own terms. Only once it is refused does
 * anything else get a say, so no amount of "a repair is running" or "we are
 * waiting on somebody" can be presented as completion. */
export function completionOf(evidence: CompletionEvidence): Completion {
  const unmet = unmetRequirements(evidence);
  if (unmet.length === 0) {
    return {
      state: "DELIVERED", unmet: [],
      because: `${evidence.outcomeRequired} exists at the digest the decision was made about, passed every required gate, was read back, and an independent verifier confirmed it`,
    };
  }
  if (evidence?.repairInProgress === true) {
    return { state: "REPAIRING", unmet, because: `not delivered yet; a safe repair is under way — ${unmet[0]}` };
  }
  if (hasText(evidence?.authorityOwed)) {
    return { state: "AWAITING_AUTHORITY", unmet, because: `not delivered; ${evidence.authorityOwed}` };
  }
  if (hasText(evidence?.externalBlocker)) {
    return { state: "BLOCKED_EXTERNAL", unmet, because: `not delivered; ${evidence.externalBlocker}` };
  }
  return { state: "FAILED_VERIFIED", unmet, because: `not delivered, and established rather than assumed: ${unmet.join("; ")}` };
}

/* ── the things that are not the outcome ────────────────────────────────────
   A list with a purpose: each of these has been mistaken for completion, and
   naming them lets a domain say plainly that its intermediate artifact is an
   intermediate artifact. An entry is the outcome only when the person asked for
   THAT — a task whose request really is "open a pull request" is delivered by a
   pull request, and nothing here says otherwise. */
export const INTERMEDIATE_ARTIFACTS = [
  "executor_returned_success", "report_written", "plan_produced", "code_changed",
  "commit_made", "pull_request_opened", "ci_passed", "row_written",
  "file_exists", "deployment_completed", "artifact_assembled", "earlier_version_passed_gates",
] as const;
export type IntermediateArtifact = (typeof INTERMEDIATE_ARTIFACTS)[number];

/* Whether a claim of completion rests on nothing but an intermediate artifact.
   `requestedOutcome` is what the person actually asked for; when it is one of
   these, that artifact IS the outcome and this returns false. */
export function isIntermediateOnly(
  resting: readonly IntermediateArtifact[], requestedOutcome: string,
): boolean {
  if (resting.length === 0) return false;
  return !resting.some((artifact) => requestedOutcome === artifact);
}
