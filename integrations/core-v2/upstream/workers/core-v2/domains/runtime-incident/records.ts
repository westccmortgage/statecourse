/* AN INCIDENT IS EVIDENCE, AND RECOVERY IS A DECISION ABOUT IT.
 *
 * A production run that stops has facts: which stage was running, what it
 * raised, which stages finished, which artifacts exist and what their digests
 * are, which paid calls left and what became of them, what the ledger holds.
 * None of that is interpretation. This file is the deterministic half of the
 * runtime-incident domain: how those facts are keyed, how they are fingerprinted,
 * which of them settle a cause without asking a model, what operation each
 * settled cause permits, and who is allowed to authorise it.
 *
 * It decides nothing about any particular product. A runtime adapter supplies
 * the facts and executes the operation; the kernel keeps the readers blind,
 * compares, verifies and records. This file is pack-side: no repository, no
 * scheduler, no executor, no provider.
 *
 * THE RULE THAT SHAPES EVERYTHING BELOW: an operation is automatic only when
 * the facts prove it cannot spend, cannot destroy and cannot surprise. That is
 * derived from the operation's own classification, never declared by a caller
 * and never inferred from a model's confidence — `machine_confidence` is not
 * read here, by anybody, for anything.
 */

import { VERIFIER_NAMES } from "./verifiers.ts";

/* ── keys ──────────────────────────────────────────────────────────────────
   A record key names a thing the runtime holds. A subject key names a question
   about one. Both are `part:part` with no colon, bar or whitespace inside a
   part, exactly as the CEO Admin domain keys its rows, so one reader of either
   domain can split a subject back into its question and its record. */

export const RECORD_KINDS = [
  "incident", "stage", "artifact", "provider_call", "ledger", "probe", "recovery", "checkpoint",
] as const;
export type RecordKind = (typeof RECORD_KINDS)[number];

export const QUESTIONS = ["cause", "recoverability", "operation", "verification"] as const;
export type Question = (typeof QUESTIONS)[number];

const PART = /^[^\s:|]+$/;

export function recordKey(kind: RecordKind, ...parts: string[]): string {
  if (!parts.length || !parts.every((p) => PART.test(p))) {
    throw new Error(`runtime-incident: ${kind} key parts must be non-empty and free of : | and whitespace`);
  }
  return [kind, ...parts].join(":");
}

export function subjectKey(question: Question, record: string): string {
  return `${question}/${record}`;
}

export function readSubject(subject: string): { question: Question; record: string } {
  const cut = subject.indexOf("/");
  const question = subject.slice(0, cut) as Question;
  if (cut < 0 || !QUESTIONS.includes(question)) throw new Error(`runtime-incident: not a subject key: ${subject}`);
  return { question, record: subject.slice(cut + 1) };
}

/* ── the facts ─────────────────────────────────────────────────────────────
   Deliberately flat and deliberately typed. A fact is something the runtime
   measured or read out of its own record — never a sentence a model wrote.

   `errorCode` is the one place a message becomes a fact, and it is a machine
   word the adapter derives, not the message itself. The message travels as
   evidence and is never fingerprinted: prose would make every incident unique
   and the signature useless. */

export type ProviderCallState = "succeeded" | "failed" | "outcome_unknown";

export type IncidentFacts = {
  application: string;
  workflowId: string;
  failingStage: string;
  exceptionClass: string;
  errorCode: string;
  completedStages: string[];
  /* Artifact kinds present, by digest. Kinds are fingerprinted; digests are
     evidence. A rerun that produces the same artifact kinds is the same
     situation even though every digest changed. */
  artifacts: { kind: string; digest: string }[];
  providerCalls: { provider: string; requestId: string; state: ProviderCallState }[];
  ledger: { settled: number; held: number; reserved: number; authority: number };
  /* Everything the adapter measured about the failing stage's own material.
     Values are booleans, numbers, or machine words — never prose. */
  probes: Record<string, string | number | boolean>;
  checkpoint: string | null;
  /* The checkpoint's own digest. A checkpoint NAME that stays put while its
     content changes is exactly the case a name cannot detect, so the digest is
     what the evidence fingerprint reads. */
  checkpointDigest: string | null;
  /* Which take is bound to which subject right now. Replacing a take under an
     accepted master must invalidate that master, so the binding is part of the
     concrete state and not a detail of it. */
  selectedTakes: { subject: string; takeId: string; digest: string }[];
  /* Where the run has actually reached, and what the last quality pass said.
     Both move when a recovery makes progress, which is what tells a second
     attempt apart from a loop. */
  stage: string;
  qaState: string;
  /* WHICH STAGES COST MONEY. Declared by the runtime adapter, because only the
     product knows; the kernel only refuses to cross the line. Naming them here
     rather than in the kernel is what keeps this domain free of any product. */
  paidStages: string[];
  /* The stages a resume or restart would actually run from where the record
     stands. An operation whose reach depends on state reads this instead of a
     fixed list, so "the restart itself is free" can never stand in for "the
     continuation cannot spend". */
  continuationStages: string[];
  policyVersion: string;
  engineVersion: string;
};

/* ── the signature ─────────────────────────────────────────────────────────
   Two runs that stopped for the same reason carry the same signature, so a
   verified recovery of one can be offered as evidence about the other. What
   goes in is only what makes the situation what it is.

   OUT, on purpose: the error message, every digest, every path, every id, every
   amount, and anything a caller could vary at will. A secret cannot reach this
   function because nothing secret is in `IncidentFacts` — the adapter's
   contract is that it sends facts, and a credential is not one. */

export function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
}

export function signatureInput(facts: IncidentFacts): string {
  return canonical({
    application: facts.application,
    failingStage: facts.failingStage,
    exceptionClass: facts.exceptionClass,
    errorCode: facts.errorCode,
    completedStages: [...facts.completedStages].sort(),
    artifactKinds: [...new Set(facts.artifacts.map((a) => a.kind))].sort(),
    providerCallStates: [...new Set(facts.providerCalls.map((c) => `${c.provider}/${c.state}`))].sort(),
    probes: facts.probes,
    hasCheckpoint: facts.checkpoint !== null,
    policyVersion: facts.policyVersion,
    engineVersion: facts.engineVersion,
  });
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function incidentSignature(facts: IncidentFacts): Promise<string> {
  return sha256Hex(signatureInput(facts));
}

/* ── the evidence fingerprint ───────────────────────────────────────────────
   A DIFFERENT question from the signature, and the earlier code conflated the
   two: it hashed the signature input again, so it answered "is this the same
   KIND of incident" when loop protection needs "is this the same CONCRETE
   state". Two runs of the same failure looked identical even after a recovery
   had rewritten every artifact, so real progress was invisible and a pointless
   repeat was indistinguishable from a warranted one.

   In, because these move when something actually happens: every artifact
   digest, the checkpoint's identity AND its digest, the take bound to each
   subject, the stage the run has reached, the quality state, and the outcome
   of each paid call.

   Out, because they are secret, unstable, or prose: credentials of any kind, a
   signed URL, an error message, a timestamp, a file path, an amount.

   A request id alone is deliberately NOT here. A provider retried under a new
   id has not made progress; what would be progress is its OUTCOME changing, or
   an artifact appearing — and both of those are in. */
export function evidenceFingerprintInput(facts: IncidentFacts): string {
  return canonical({
    artifacts: [...facts.artifacts].map((a) => `${a.kind}:${a.digest}`).sort(),
    checkpoint: facts.checkpoint,
    checkpointDigest: facts.checkpointDigest,
    selectedTakes: [...facts.selectedTakes].map((t) => `${t.subject}:${t.takeId}:${t.digest}`).sort(),
    stage: facts.stage,
    qaState: facts.qaState,
    /* Outcome by provider, without the request id: an outcome that moved is
       progress, a new id for the same unknown is not. */
    providerOutcomes: [...facts.providerCalls].map((c) => `${c.provider}:${c.state}`).sort(),
    probes: facts.probes,
  });
}

export async function evidenceFingerprint(facts: IncidentFacts): Promise<string> {
  return sha256Hex(evidenceFingerprintInput(facts));
}

/* ── the lifecycle ─────────────────────────────────────────────────────────
   The states an incident passes through, and the ones it can stop in. These
   are the domain's own; the kernel's workflow states are unchanged and still
   govern the tasks underneath. */

export const INCIDENT_STATES = [
  "detected", "evidence_collected", "diagnosed", "recovery_proposed",
  "recovery_authorized", "recovering", "verifying", "recovered",
] as const;

export const INCIDENT_EXITS = [
  "awaiting_human", "blocked", "unknown_paid_outcome", "engineering_defect", "unrecoverable",
] as const;

export type IncidentState = (typeof INCIDENT_STATES)[number] | (typeof INCIDENT_EXITS)[number];

/* ── recovery operations ───────────────────────────────────────────────────
   What the runtime may be asked to do. Each one carries what it costs, whether
   it can be undone, what must be true before it runs, and what must be true
   afterwards for it to have worked. The authority is not a field a caller
   sets — it is computed from the rest, below. */

export type CostClass = "no_external_spend" | "within_prior_authority" | "requires_new_authority";

export type RecoveryOperation = {
  readonly id: string;
  readonly describes: string;
  readonly costClass: CostClass;
  readonly reversible: boolean;
  readonly destructive: boolean;
  readonly idempotent: boolean;
  /* Fact keys that must be present and true before this may run. */
  readonly preconditions: string[];
  /* Conditions an independent pass must confirm afterwards. A recovery is not
     successful because an executor returned; it is successful because these
     hold. An operation with none of them cannot be automatic. Every name must
     resolve in the verifier registry or the operation cannot run at all. */
  readonly verifies: string[];
  /* THE EXECUTION BOUNDARY: the stages running this operation may cause to
     run. `$continuation` means "whatever a resume would run from here", read
     from the facts, because an operation whose reach depends on state cannot
     declare it in advance. An empty boundary reaches no stage at all. */
  readonly boundary: string[];
};

export const CONTINUATION = "$continuation";

/* The stages an operation would actually reach, here, now. */
export function boundaryOf(operation: RecoveryOperation, facts: IncidentFacts): string[] {
  return operation.boundary.flatMap((stage) => (stage === CONTINUATION ? facts.continuationStages : [stage]));
}

/* Which of those stages cost money. Empty means the operation cannot spend. */
export function paidStagesReached(operation: RecoveryOperation, facts: IncidentFacts): string[] {
  const paid = new Set(facts.paidStages);
  return [...new Set(boundaryOf(operation, facts))].filter((stage) => paid.has(stage)).sort();
}

export const OPERATIONS: Record<string, RecoveryOperation> = {
  resume_from_checkpoint: {
    id: "resume_from_checkpoint", describes: "continue the run from the checkpoint the record already holds",
    costClass: "no_external_spend", reversible: true, destructive: false, idempotent: true,
    preconditions: ["checkpoint_present", "checkpoint_decodes"],
    verifies: ["stage_advanced", "no_new_provider_call"],
    boundary: [CONTINUATION],
  },
  rerun_assembly: {
    id: "rerun_assembly", describes: "put the master together again from the scenes already cut",
    costClass: "no_external_spend", reversible: true, destructive: false, idempotent: true,
    preconditions: ["all_scene_artifacts_present", "container_valid"],
    verifies: ["master_exists", "master_digest_recorded", "master_decodes", "duration_expected", "dimensions_expected", "no_new_provider_call"],
    boundary: ["assemble"],
  },
  rerun_qa: {
    id: "rerun_qa", describes: "measure the existing master again",
    costClass: "no_external_spend", reversible: true, destructive: false, idempotent: true,
    preconditions: ["master_exists"],
    verifies: ["qa_report_written", "no_new_provider_call"],
    boundary: ["qa"],
  },
  rebuild_master_from_paid_assets: {
    id: "rebuild_master_from_paid_assets", describes: "rebuild the master from assets already paid for, changing none of them",
    costClass: "no_external_spend", reversible: true, destructive: false, idempotent: true,
    preconditions: ["all_scene_artifacts_present", "paid_assets_immutable"],
    verifies: ["master_exists", "master_digest_recorded", "master_decodes", "paid_asset_digests_unchanged", "no_new_provider_call"],
    boundary: ["assemble"],
  },
  retrieve_known_provider_result: {
    id: "retrieve_known_provider_result", describes: "fetch the result of a call that already completed, by its own request id",
    costClass: "no_external_spend", reversible: true, destructive: false, idempotent: true,
    preconditions: ["request_id_known", "provider_call_succeeded", "provider_result_uncollected"],
    verifies: ["same_request_id", "artifact_digest_recorded", "no_duplicate_provider_submission"],
    boundary: [],
  },
  redownload_known_artifact: {
    id: "redownload_known_artifact", describes: "fetch an artifact whose digest the record already knows",
    costClass: "no_external_spend", reversible: true, destructive: false, idempotent: true,
    preconditions: ["artifact_digest_known"],
    verifies: ["artifact_digest_matches", "no_new_provider_call"],
    boundary: [],
  },
  restart_local_worker: {
    id: "restart_local_worker", describes: "start the local worker again and let it re-claim its own lease",
    costClass: "no_external_spend", reversible: true, destructive: false, idempotent: true,
    preconditions: ["lease_expired_or_free"],
    /* Restarting the worker spends nothing by itself, but the stage it goes on
       to run could. That is exactly what the verification is for: a no-spend
       recovery that turns out to have bought something did not hold, and the
       proof has to be able to say so. */
    verifies: ["lease_held", "stage_advanced", "no_new_provider_call"],
    boundary: [CONTINUATION],
  },
  execute_authorized_fallback: {
    id: "execute_authorized_fallback", describes: "take a route the record already authorised, inside the authority it already has",
    costClass: "within_prior_authority", reversible: false, destructive: false, idempotent: false,
    preconditions: ["fallback_route_authorized", "cost_known", "remaining_authority_covers_cost", "prior_outcomes_known"],
    verifies: ["stage_advanced", "spend_within_authority"],
    boundary: [CONTINUATION],
  },
  continue_delivery: {
    id: "continue_delivery", describes: "carry on delivering a master that is already finished and verified",
    costClass: "no_external_spend", reversible: true, destructive: false, idempotent: true,
    preconditions: ["master_exists", "qa_passed"],
    verifies: ["delivery_recorded", "no_new_provider_call"],
    boundary: ["deliver"],
  },
  raise_budget: {
    id: "raise_budget", describes: "increase what the run may spend",
    costClass: "requires_new_authority", reversible: false, destructive: false, idempotent: false,
    preconditions: [], verifies: ["authority_recorded_by_person"],
    boundary: [],
  },
};

/* WHO MAY AUTHORISE IT. Derived, so a new operation cannot arrive already
   trusted: it has to earn `automatic` against facts the record holds.

   An operation is automatic only when it cannot spend anything outside, can be
   undone or safely repeated, destroys nothing, states what would prove it
   worked, and every one of its preconditions is a fact that is actually true
   here. Anything else is a person's to decide. */

export type Authority = "automatic" | "human";

export function authorityFor(
  operation: RecoveryOperation, proven: Set<string>, facts?: IncidentFacts,
): { authority: Authority; because: string } {
  if (operation.costClass !== "no_external_spend") {
    return { authority: "human", because: `${operation.id} can spend outside the run (${operation.costClass})` };
  }
  /* THE BOUNDARY, BEFORE ANYTHING ELSE ABOUT COST. That an operation spends
     nothing itself says nothing about where it lets the run go next: restarting
     a worker is free and resuming into a paid stage is not. */
  if (facts) {
    const paid = paidStagesReached(operation, facts);
    if (paid.length) {
      return { authority: "human", because: `${operation.id} would let the run enter ${paid.join(", ")}, which costs money` };
    }
    const unknown = operation.verifies.filter((name) => !VERIFIER_NAMES.has(name));
    if (unknown.length) {
      return { authority: "human", because: `${operation.id} names ${unknown.join(", ")}, which no verifier implements` };
    }
  }
  if (operation.destructive) return { authority: "human", because: `${operation.id} destroys something` };
  if (!operation.reversible && !operation.idempotent) {
    return { authority: "human", because: `${operation.id} can neither be undone nor safely repeated` };
  }
  if (!operation.verifies.length) {
    return { authority: "human", because: `${operation.id} states nothing that would prove it worked` };
  }
  const missing = operation.preconditions.filter((p) => !proven.has(p));
  if (missing.length) {
    return { authority: "human", because: `${operation.id} needs ${missing.join(", ")}, which the evidence does not establish` };
  }
  return { authority: "automatic", because: `${operation.id} cannot spend, cannot reach a paid stage, cannot destroy, is repeatable, has a verifier for every claim it makes, and every precondition holds` };
}

/* ── the hard stops ────────────────────────────────────────────────────────
   Checked before any rule, because no cause and no precedent may talk the
   engine past them. These are the existing protections, read here rather than
   re-implemented: a paid call whose outcome nobody knows is not re-bought, and
   an unpriced operation is not run. */

export function hardStop(facts: IncidentFacts): { exit: IncidentState; because: string } | null {
  if (facts.providerCalls.some((c) => c.state === "outcome_unknown")) {
    return {
      exit: "unknown_paid_outcome",
      because: "a paid call left and nobody knows what became of it; repeating it is the one thing this engine will not do by machine",
    };
  }
  if (facts.probes.unpriced_operation === true) {
    return { exit: "awaiting_human", because: "the operation has no price, so no authority can cover it" };
  }
  if (facts.ledger.settled + facts.ledger.held + facts.ledger.reserved > facts.ledger.authority) {
    return { exit: "awaiting_human", because: "settled, held and reserved already exceed the authority; only a person may raise it" };
  }
  return null;
}
