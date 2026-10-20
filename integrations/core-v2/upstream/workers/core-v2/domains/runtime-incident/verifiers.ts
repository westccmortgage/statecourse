/* AN EXECUTOR THAT RETURNED IS NOT A RECOVERY THAT WORKED.
 *
 * `RecoveryOperation.verifies` used to be a list of sentences. A sentence
 * cannot refuse anything, so an operation could claim `master_decodes` and be
 * believed on the strength of the executor's own return value. Every name in
 * that list now has to resolve here, and every one is evaluated against
 * EVIDENCE COLLECTED AFTER THE FACT — not against what the executor said.
 *
 * Each verifier reads structural facts and adapter-supplied probes. It never
 * reads a product concept: `master_exists` asks the record whether the thing
 * the operation was supposed to produce is there, and which thing that is
 * belongs to the adapter. That is what keeps this file domain-free while still
 * being executable.
 *
 * Two of them are not probes at all but arithmetic the kernel does itself, on
 * numbers the adapter cannot fake without lying about its own ledger: the
 * provider-call delta and the spend delta.
 */
import type { IncidentFacts, RecoveryOperation } from "./records.ts";

export type VerificationContext = {
  /* The evidence as it stood before the operation ran, and as it stands now.
     `after` must be COLLECTED FRESH: passing `before` twice is the mistake this
     whole file exists to make impossible, and `evidence_is_fresh` catches it. */
  readonly before: IncidentFacts;
  readonly after: IncidentFacts;
  readonly beforeFingerprint: string;
  readonly afterFingerprint: string;
};

export type VerificationResult = {
  readonly name: string;
  readonly pass: boolean;
  readonly detail: string;
  /* What the verifier actually looked at. Persisted beside the result, so a
     pass can be argued with later rather than taken on trust. */
  readonly evidence: Record<string, string | number | boolean | null>;
};

export type Verifier = {
  readonly id: string;
  readonly describes: string;
  evaluate(context: VerificationContext): VerificationResult;
};

const probe = (facts: IncidentFacts, key: string) => facts.probes[key];
const truthy = (facts: IncidentFacts, key: string) => probe(facts, key) === true;
const spend = (facts: IncidentFacts) => facts.ledger.settled + facts.ledger.held + facts.ledger.reserved;
const paidCalls = (facts: IncidentFacts) => facts.providerCalls.length;

function result(name: string, pass: boolean, detail: string, evidence: Record<string, string | number | boolean | null> = {}): VerificationResult {
  return { name, pass, detail, evidence };
}

/* A probe the adapter must have set to true after the operation ran. */
function probeVerifier(id: string, describes: string): Verifier {
  return {
    id, describes,
    evaluate: ({ after }) => result(id, truthy(after, id), truthy(after, id) ? "" : `${id} is not true in the evidence collected after the operation`,
      { [id]: (probe(after, id) ?? null) as string | number | boolean | null }),
  };
}

export const VERIFIERS: Record<string, Verifier> = {
  /* ── the two the kernel computes itself ──────────────────────────────── */
  no_new_provider_call: {
    id: "no_new_provider_call", describes: "no paid call was made that was not already there",
    evaluate: ({ before, after }) => {
      const delta = paidCalls(after) - paidCalls(before);
      return result("no_new_provider_call", delta === 0,
        delta === 0 ? "0 new calls" : `${delta} paid call(s) appeared during a recovery that promised none`,
        { before: paidCalls(before), after: paidCalls(after), delta });
    },
  },
  spend_within_authority: {
    id: "spend_within_authority", describes: "settled + held + reserved never passed the authority",
    evaluate: ({ before, after }) => {
      const ok = spend(after) <= after.ledger.authority;
      return result("spend_within_authority", ok,
        ok ? `${spend(after)} of ${after.ledger.authority}` : `${spend(after)} exceeds the authority of ${after.ledger.authority}`,
        { before: spend(before), after: spend(after), authority: after.ledger.authority });
    },
  },
  no_duplicate_provider_submission: {
    id: "no_duplicate_provider_submission", describes: "no request id appears twice, and none was added",
    evaluate: ({ before, after }) => {
      const ids = after.providerCalls.map((c) => c.requestId);
      const duplicated = ids.length !== new Set(ids).size;
      const added = paidCalls(after) > paidCalls(before);
      const ok = !duplicated && !added;
      return result("no_duplicate_provider_submission", ok,
        duplicated ? "the same request id appears twice" : added ? "a call was added" : "",
        { ids: ids.length, distinct: new Set(ids).size, addedCalls: paidCalls(after) - paidCalls(before) });
    },
  },
  same_request_id: {
    id: "same_request_id", describes: "the call that was retrieved is the call that was already paid for",
    evaluate: ({ before, after }) => {
      const had = new Set(before.providerCalls.map((c) => c.requestId));
      const stray = after.providerCalls.filter((c) => !had.has(c.requestId)).map((c) => c.requestId);
      return result("same_request_id", stray.length === 0,
        stray.length ? `${stray.length} request id(s) that were not there before` : "",
        { before: had.size, after: paidCalls(after), stray: stray.length });
    },
  },
  paid_asset_digests_unchanged: {
    id: "paid_asset_digests_unchanged", describes: "nothing already paid for was rewritten",
    evaluate: ({ before, after }) => {
      const had = new Map(before.selectedTakes.map((t) => [t.takeId, t.digest]));
      const changed = after.selectedTakes.filter((t) => had.has(t.takeId) && had.get(t.takeId) !== t.digest).map((t) => t.takeId);
      return result("paid_asset_digests_unchanged", changed.length === 0,
        changed.length ? `take(s) rewritten: ${changed.join(", ")}` : "",
        { takes: after.selectedTakes.length, changed: changed.length });
    },
  },
  stage_advanced: {
    id: "stage_advanced", describes: "the run is somewhere it was not before",
    evaluate: ({ before, after, beforeFingerprint, afterFingerprint }) => {
      const moved = after.stage !== before.stage || afterFingerprint !== beforeFingerprint;
      return result("stage_advanced", moved,
        moved ? `${before.stage} -> ${after.stage}` : `still at ${after.stage} with identical evidence`,
        { beforeStage: before.stage, afterStage: after.stage, fingerprintMoved: afterFingerprint !== beforeFingerprint });
    },
  },
  /* Fresh evidence is itself a precondition of every other verifier being
     worth anything: handing the same facts in twice would pass most of them. */
  evidence_is_fresh: {
    id: "evidence_is_fresh", describes: "the after-evidence is not the before-evidence handed back",
    evaluate: ({ before, after, beforeFingerprint, afterFingerprint }) => {
      const distinct = before !== after && afterFingerprint !== beforeFingerprint;
      return result("evidence_is_fresh", distinct,
        distinct ? "" : "the evidence after the operation is identical to the evidence before it",
        { beforeFingerprint, afterFingerprint });
    },
  },
  /* ── the ones the adapter must evidence ──────────────────────────────── */
  ...Object.fromEntries([
    ["master_exists", "the artifact the operation was to produce is there"],
    ["master_digest_recorded", "its digest is written down"],
    ["master_decodes", "it decodes cleanly end to end"],
    ["duration_expected", "its duration is the one the plan asked for"],
    ["dimensions_expected", "its dimensions are the ones the plan asked for"],
    ["qa_report_written", "a quality pass ran and left a report"],
    ["qa_passed", "that report says it passed"],
    ["artifact_digest_recorded", "the retrieved artifact's digest is written down"],
    ["artifact_digest_matches", "the bytes fetched are the bytes the record named"],
    ["delivery_recorded", "the delivery is in the record, read back"],
    ["lease_held", "the worker holds its lease again"],
    ["authority_recorded_by_person", "a person's authority is on the record"],
  ].map(([id, describes]) => [id, probeVerifier(id, describes)])),
};

export const VERIFIER_NAMES = new Set(Object.keys(VERIFIERS));

export type RecoveryVerification = {
  readonly recovered: boolean;
  readonly results: VerificationResult[];
  readonly beforeFingerprint: string;
  readonly afterFingerprint: string;
  readonly providerCallDelta: number;
  readonly incrementalSpend: number;
  readonly because: string;
};

/* EVERY required postcondition, against fresh evidence, or it did not work.
   An unknown name is not skipped and not warned about — it throws, because an
   operation that names a check nobody implements has no proof at all and must
   never have been allowed to run. */
export function verifyRecovery(operation: RecoveryOperation, context: VerificationContext): RecoveryVerification {
  const unknown = operation.verifies.filter((name) => !VERIFIER_NAMES.has(name));
  if (unknown.length) {
    throw new Error(`runtime-incident: ${operation.id} requires verifier(s) no registry implements: ${unknown.join(", ")}`);
  }
  /* Freshness is added to every operation's list, never declared by one. */
  const required = [...new Set(["evidence_is_fresh", ...operation.verifies])];
  const results = required.map((name) => VERIFIERS[name].evaluate(context));
  const failed = results.filter((r) => !r.pass);
  const providerCallDelta = paidCalls(context.after) - paidCalls(context.before);
  const incrementalSpend = Number((spend(context.after) - spend(context.before)).toFixed(10));
  return {
    recovered: failed.length === 0,
    results, providerCallDelta, incrementalSpend,
    beforeFingerprint: context.beforeFingerprint, afterFingerprint: context.afterFingerprint,
    because: failed.length
      ? `${failed.length} of ${results.length} checks failed: ${failed.map((f) => f.name).join(", ")}`
      : `all ${results.length} checks hold; ${providerCallDelta} new provider call(s), ${incrementalSpend} incremental spend`,
  };
}
