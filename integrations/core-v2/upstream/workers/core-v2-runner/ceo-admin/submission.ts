/* THE DOOR THE ADMIN'S RECORDS COME THROUGH.
 *
 * Two systems, two databases, one contract. The Admin holds tasks, messages
 * and appointments; Core V2 holds workflows, claims and decisions; neither
 * reads the other's tables and neither ever will. What passes between them is
 * this envelope and the answers it produces, and that is the whole coupling.
 *
 * WHY A CONTRACT AND NOT A JOIN. A join would have been less code today and a
 * migration nobody can perform tomorrow: the Admin's schema would become part
 * of the engine's, every column rename would be an engine release, and the
 * second domain to use this engine would need the first one's tables. A
 * submitted envelope costs a serialisation and buys two schemas that can move
 * independently.
 *
 * WHAT THIS DOOR REFUSES, AND WHY EACH REFUSAL IS AT THE DOOR.
 *
 * Everything below is checked BEFORE a workflow exists. A refusal is a
 * message to a caller who can fix it; a bad row admitted is a workflow that
 * fails its own material check on every pass until a fuse settles it, and
 * somebody has to go and find that.
 *
 *   · a record the engine cannot NAME — no stable identity — is refused.
 *     There would be nowhere to carry the answer back to;
 *   · a record the engine cannot VERSION is refused. The kernel's whole
 *     recovery story rests on a source set that rebuilds to the hashes it
 *     recorded; a row that can change underneath its own identity breaks that
 *     silently, which is the worst way for it to break;
 *   · two records that would answer to ONE subject key are refused, both of
 *     them, by name. Not de-duplicated: a collision means the caller's
 *     identifiers are not what the caller thinks they are, and quietly
 *     dropping one of them would make two different messages share a reading;
 *   · a batch with no record left after triage is refused, because a workflow
 *     over nothing is a row in the record that never had anything to do.
 *
 * WHAT IT IS NOT. It does not fetch, poll, or connect to anything. It is
 * handed an envelope and answers with a manifest, a material set and a
 * verdict. Whoever calls it decides what to do with those.
 */
import type { SourceManifest } from "../../core-v2/kernel/contracts.ts";
import { entityId, isUuid } from "../../core-v2/kernel/ids.ts";
import type { CeoRecordInput, NormalisedRecord } from "../../core-v2/domains/ceo-admin/records.ts";
import {
  IDENTITY_FIELDS, SOURCE_CONTRACT_VERSION, isRecordRefusal, isSourceType,
  materialOf, normaliseRecord, sourceOf,
} from "../../core-v2/domains/ceo-admin/records.ts";
import { PACK_ID, PACK_VERSION } from "../../core-v2/domains/ceo-admin/pack.ts";
import type { TriageVerdict } from "./triage.ts";
import { estimateCalls, triageBatch } from "./triage.ts";

export const WORKFLOW_TYPE = "ceo_admin_review";

/* ═══════════════════════════════════════════════════════════ the envelope */

export type CeoSubmission = {
  domain: "ceo_admin";
  contractVersion: string;
  /* The Core V2 organisation this batch belongs to. The Admin's own owner
     identity never crosses this boundary; what crosses is which tenant of the
     engine is asking. */
  organizationId: string;
  /* THE CALLER'S OWN NAME FOR THIS SUBMISSION, AND THE WHOLE OF IDEMPOTENCY.
     Submitting the same batchId twice must produce the same workflow id
     rather than a second workflow, because the caller retrying a request it
     never saw the answer to is the ordinary case and not the exception. */
  batchId: string;
  capturedAt: string;
  /* The day the readers measure "due", "stale" and "nearly here" against,
     and the day an ordering is proposed for. Null asks for no time questions
     and no ordering. */
  today: string | null;
  /* The project keys a message may be classified into — the Admin's taxonomy,
     as data. The engine holds no opinion about which projects exist. */
  projectKeys: string[];
  records: CeoRecordInput[];
  /* Which appointment is to be checked against which piece of work, by record
     key. Decided by the caller, who holds both diaries. */
  conflictPairs?: { calendar: string; task: string }[];
};

export type SubmissionRefusal = { refused: string; field?: string; detail?: string[] };

export function isSubmissionRefusal(value: unknown): value is SubmissionRefusal {
  return typeof value === "object" && value !== null && "refused" in (value as Record<string, unknown>);
}

const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const PLAIN_DATE = /^\d{4}-\d{2}-\d{2}$/;

/* HOW MANY ROWS ONE SUBMISSION MAY CARRY.
   Stated as a number rather than discovered as a runaway. The bound is the
   engine's own task ceiling read backwards: each kept row admits up to about
   a dozen tasks once its readings, comparisons, criticism and composition are
   counted, and DEFAULT_POLICY allows two thousand per workflow. */
export const MAXIMUM_RECORDS = 120;

export function parseSubmission(body: Record<string, unknown>): CeoSubmission | SubmissionRefusal {
  if (body?.domain !== "ceo_admin") {
    return { refused: 'this door takes submissions whose domain is "ceo_admin"', field: "domain" };
  }
  if (body.contractVersion !== SOURCE_CONTRACT_VERSION) {
    return {
      refused: `this door speaks ${SOURCE_CONTRACT_VERSION} and was offered ${String(body.contractVersion)}`,
      field: "contractVersion",
    };
  }
  if (!isUuid(body.organizationId)) {
    return { refused: "a submission names the organization whose workflow this is", field: "organizationId" };
  }
  const batchId = typeof body.batchId === "string" ? body.batchId.trim() : "";
  if (batchId === "" || batchId.length > 200) {
    return { refused: "a submission carries the caller's own batchId, which is what makes a retry the same workflow rather than a second one", field: "batchId" };
  }
  if (typeof body.capturedAt !== "string" || !RFC3339.test(body.capturedAt)) {
    return { refused: "capturedAt is an RFC 3339 instant", field: "capturedAt" };
  }
  const today = body.today === null || body.today === undefined || body.today === ""
    ? null
    : typeof body.today === "string" && PLAIN_DATE.test(body.today) ? body.today : undefined;
  if (today === undefined) {
    return { refused: "today is a plain date such as 2031-03-17, or null to ask no questions about time", field: "today" };
  }
  const projectKeys = Array.isArray(body.projectKeys)
    ? body.projectKeys.filter((k): k is string => typeof k === "string" && k.trim() !== "").map((k) => k.trim())
    : null;
  if (projectKeys === null) {
    return { refused: "projectKeys is the caller's taxonomy — the list a message may be classified into. Send an empty list to ask for no project at all.", field: "projectKeys" };
  }
  if (!Array.isArray(body.records) || body.records.length === 0) {
    return { refused: "a submission carries at least one record", field: "records" };
  }
  if (body.records.length > MAXIMUM_RECORDS) {
    return { refused: `a submission carries at most ${MAXIMUM_RECORDS} records and this one carries ${body.records.length}`, field: "records" };
  }
  const records: CeoRecordInput[] = [];
  for (const [i, raw] of (body.records as Record<string, unknown>[]).entries()) {
    if (!raw || typeof raw !== "object") return { refused: `record ${i} is not a record`, field: `records[${i}]` };
    if (!isSourceType(raw.sourceType)) {
      return { refused: `record ${i} has no sourceType this domain knows`, field: `records[${i}].sourceType` };
    }
    records.push({
      sourceType: raw.sourceType,
      identity: (raw.identity ?? {}) as Record<string, string>,
      recordVersion: String(raw.recordVersion ?? ""),
      capturedAt: String(raw.capturedAt ?? body.capturedAt),
      fields: (raw.fields ?? {}) as Record<string, string>,
      text: raw.text === null || raw.text === undefined ? null : String(raw.text),
    });
  }
  const conflictPairs = Array.isArray(body.conflictPairs)
    ? (body.conflictPairs as Record<string, unknown>[])
      .filter((p) => typeof p?.calendar === "string" && typeof p?.task === "string")
      .map((p) => ({ calendar: String(p.calendar), task: String(p.task) }))
    : [];

  return {
    domain: "ceo_admin", contractVersion: SOURCE_CONTRACT_VERSION,
    organizationId: body.organizationId, batchId, capturedAt: body.capturedAt,
    today, projectKeys, records, conflictPairs,
  };
}

/* ══════════════════════════════════════════════════ the admitted submission */

export type AdmittedRecord = {
  record: NormalisedRecord;
  /* What Stage 0 said, kept whether it let the row through or not. */
  verdict: TriageVerdict;
};

export type Admission = {
  submission: CeoSubmission;
  /* The same workflow id for the same batch, always. Derived from the
     organisation and the caller's batch name, so a retry names the workflow
     the first attempt created rather than making a second. */
  workflowId: string;
  manifest: SourceManifest;
  /* Every declared segment's text, by the hash it was declared under. This is
     what a material resolver must be able to answer from, and what the caller
     must therefore persist somewhere the runner can reach. */
  material: Map<string, string>;
  read: AdmittedRecord[];
  notRead: AdmittedRecord[];
  estimate: ReturnType<typeof estimateCalls>;
};

/* THE WORKFLOW ID, FROM THE BATCH AND NOTHING ELSE.
   Not from the records: a caller that retried with one row added would
   otherwise get a second workflow over almost the same material, which is how
   an engine reads the same mailbox twice and bills for it. */
export function workflowIdFor(organizationId: string, batchId: string): string {
  return entityId("ceo-admin-workflow", organizationId, batchId);
}

export function admit(submission: CeoSubmission): Admission | SubmissionRefusal {
  const triaged = triageBatch(submission.records, { today: submission.today ?? submission.capturedAt.slice(0, 10) });

  /* Every record is normalised — including the ones triage dropped, because
     a row the Admin is told was not read must still be named in the answer,
     and naming it means normalising its identity. */
  const normalise = (inputs: CeoRecordInput[]): { ok: AdmittedRecord[]; problems: string[] } => {
    const ok: AdmittedRecord[] = [];
    const problems: string[] = [];
    for (const [i, input] of inputs.entries()) {
      const record = normaliseRecord(input);
      if (isRecordRefusal(record)) {
        problems.push(`record ${i} (${input.sourceType}${record.subjectKey ? ` ${record.subjectKey}` : ""}): ${record.refused}`);
        continue;
      }
      const verdict = triaged.dropped.find((d) => d.record === input)?.verdict
        ?? { keep: true, rule: "there_is_something_here_a_reading_could_settle", proposedAttention: null };
      ok.push({ record, verdict });
    }
    return { ok, problems };
  };

  const kept = normalise(triaged.kept);
  const dropped = normalise(triaged.dropped.map((d) => d.record));
  const problems = [...kept.problems, ...dropped.problems];
  if (problems.length > 0) {
    return {
      refused: "one or more records are not something this engine can identify, version or read",
      field: "records", detail: problems,
    };
  }

  /* TWO ROWS, ONE NAME. Refused by name, both of them, and never merged. */
  const seen = new Map<string, string[]>();
  for (const admitted of [...kept.ok, ...dropped.ok]) {
    const key = admitted.record.subjectKey.toLowerCase();
    seen.set(key, [...(seen.get(key) ?? []), admitted.record.subjectKey]);
  }
  const collisions = [...seen.entries()].filter(([, names]) => names.length > 1);
  if (collisions.length > 0) {
    return {
      refused: "two records in this batch answer to one subject key, so a reading of one would be filed as a reading of the other",
      field: "records",
      detail: collisions.map(([key, names]) => `${names.length} records share ${key}: ${[...new Set(names)].join(", ")}`),
    };
  }

  if (kept.ok.length === 0) {
    return {
      refused: "every record in this batch was settled before any reading: there is nothing for a workflow to do",
      field: "records",
      detail: dropped.ok.map((d) => `${d.record.subjectKey}: ${d.verdict.rule}`),
    };
  }

  /* ONE ORDER, ALWAYS. The manifest's ordinals decide every derived id in the
     workflow, so they are fixed by the subject key rather than by the order a
     caller happened to serialise a list in. Two identical batches sent in two
     different orders are one workflow. */
  const ordered = [...kept.ok].sort((a, b) => a.record.subjectKey.localeCompare(b.record.subjectKey));
  /* THE WORKFLOW ID IS DRAWN BEFORE THE SOURCES, because the sources are named
     inside it. It depends on the organisation and the caller's own batch name
     and on nothing else, so drawing it here rather than below changes no value
     it has ever had — and it means a source id cannot be derived without the
     workflow it belongs to. */
  const workflowId = workflowIdFor(submission.organizationId, submission.batchId);
  const identity = { organizationId: submission.organizationId, workflowId };
  const sources = ordered.map((admitted, ordinal) => sourceOf(admitted.record, ordinal, identity));
  const material = new Map<string, string>();
  for (const admitted of ordered) for (const [hash, text] of materialOf(admitted.record)) material.set(hash, text);

  /* A pair naming a record this batch does not carry is dropped rather than
     refused: the caller's diary may legitimately mention something outside
     the batch, and a pair the pack cannot resolve simply never becomes a
     task. It is reported so nobody has to guess whether it was honoured. */
  const present = new Set(ordered.map((a) => a.record.subjectKey));
  const pairs = (submission.conflictPairs ?? []).filter((p) => present.has(p.calendar) && present.has(p.task));

  const manifest: SourceManifest = {
    workflowId,
    organizationId: submission.organizationId,
    domainPack: PACK_ID,
    domainPackVersion: PACK_VERSION,
    workflowType: WORKFLOW_TYPE,
    /* WHAT THE PACK IS CONSTRUCTED FROM, WRITTEN INTO THE WORKFLOW.
       A later runner rebuilds the pack from this rather than from anything
       ambient, so a workflow continued tomorrow is continued with the
       taxonomy and the date it was started under — not with today's. */
    requestedScope: {
      contract_version: SOURCE_CONTRACT_VERSION,
      batch_id: submission.batchId,
      today: submission.today,
      project_keys: submission.projectKeys,
      conflict_pairs: pairs,
      records_submitted: submission.records.length,
      records_read: ordered.length,
    },
    sources,
  };

  return {
    submission, workflowId, manifest, material,
    read: ordered, notRead: dropped.ok,
    estimate: estimateCalls(
      { records: submission.records, today: submission.today, conflictPairs: pairs.length },
      { today: submission.today ?? submission.capturedAt.slice(0, 10) }),
  };
}

/* ═══════════════════════════════════════════ rebuilding the pack, later
 *
 * A runner that claims this workflow tomorrow must construct the same pack
 * the workflow was planned under, or it will plan different tasks and the
 * engine's idempotent admission will quietly create a second set of them.
 * The scope written above is what it reads; this is the one function that
 * reads it, so there is one place to get it wrong.
 */
export type RebuiltPackOptions = {
  projectKeys: string[];
  today: string | null;
  conflictPairs: { calendar: string; task: string }[];
};

export function packOptionsOfScope(scope: Record<string, unknown>): RebuiltPackOptions | SubmissionRefusal {
  if (scope?.contract_version !== SOURCE_CONTRACT_VERSION) {
    return {
      refused: `this workflow was planned under ${String(scope?.contract_version)} and this runner speaks ${SOURCE_CONTRACT_VERSION}`,
      field: "requestedScope.contract_version",
    };
  }
  const projectKeys = Array.isArray(scope.project_keys)
    ? scope.project_keys.filter((k): k is string => typeof k === "string") : [];
  const today = typeof scope.today === "string" && PLAIN_DATE.test(scope.today) ? scope.today : null;
  const conflictPairs = Array.isArray(scope.conflict_pairs)
    ? (scope.conflict_pairs as Record<string, unknown>[])
      .filter((p) => typeof p?.calendar === "string" && typeof p?.task === "string")
      .map((p) => ({ calendar: String(p.calendar), task: String(p.task) }))
    : [];
  return { projectKeys, today, conflictPairs };
}

/* ═══════════════════════════════════════════════════════ the material store
 *
 * WHERE THE TEXT LIVES BETWEEN ONE PASS AND THE NEXT.
 *
 * A workflow is not finished when the request that started it returns. The
 * watchdog picks it up minutes later, in another process, and hands a reader
 * the text of a message that was sanitised at submission time. That text has
 * to be somewhere, and there are exactly two honest answers: the engine keeps
 * it, or the Admin is asked for it again every pass.
 *
 * Asking again is worse than it sounds. The Admin's row may have changed —
 * that is the ordinary case, a mailbox moves — and a resolver that answered
 * with the NEW text would hand a critic different material than the reader
 * saw, which is the exact failure `sourceSetOfRecord` was written to make
 * impossible for the other pack. So the engine keeps it, addressed by the
 * hash of the bytes, and a hash that is not the one the packet authorises is
 * not answered.
 *
 * This interface is that store and nothing more: no query, no listing, no
 * deletion by anything but a workflow's own end. The implementation is the
 * caller's — Sprint 3B's migration gives it a table — and an in-memory one
 * lives beside the tests.
 */
export interface CeoMaterialStore {
  /* Written once, with the workflow, in the same transaction that creates it.
     A store that accepted these after the workflow existed would allow a
     workflow whose material arrives late and whose first pass fails. */
  put(workflowId: string, material: Map<string, string>): Promise<void>;
  /* Answered by hash and by nothing else. A hash this workflow did not
     declare is not answered, whoever asks. */
  get(workflowId: string, contentHash: string): Promise<string | null>;
}

export class InMemoryCeoMaterialStore implements CeoMaterialStore {
  private byWorkflow = new Map<string, Map<string, string>>();
  async put(workflowId: string, material: Map<string, string>): Promise<void> {
    this.byWorkflow.set(workflowId, new Map(material));
  }
  async get(workflowId: string, contentHash: string): Promise<string | null> {
    return this.byWorkflow.get(workflowId)?.get(contentHash) ?? null;
  }
}

/* What the Admin is told about a record that was never read. A proposal and a
   reason, never an action — the row has not moved and nothing has been done
   to it. */
export type NotReadReport = {
  subjectKey: string;
  sourceType: string;
  rule: string;
  proposedAttention: "noise" | "legacy" | null;
};

export function notReadReport(admission: Admission): NotReadReport[] {
  return admission.notRead.map(({ record, verdict }) => ({
    subjectKey: record.subjectKey,
    sourceType: record.sourceType,
    rule: verdict.rule,
    proposedAttention: verdict.proposedAttention,
  }));
}

export { IDENTITY_FIELDS };
