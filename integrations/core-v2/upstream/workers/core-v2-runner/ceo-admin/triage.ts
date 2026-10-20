/* STAGE ZERO: THE READINGS NOBODY SHOULD BUY.
 *
 * A mailbox is mostly circulars. An engine that sends every one of them to
 * two independent readers, a critic and a composer is an engine that spends
 * four paid calls deciding that a newsletter is a newsletter — and it will do
 * that several hundred times before anybody looks at the bill.
 *
 * So there is a stage before the engine, and it is code. It answers one
 * question about each row — is there anything here a reading could settle
 * that the row does not already say — and it answers it from headers, dates
 * and states rather than from prose. What it keeps goes to Core V2. What it
 * drops is recorded with the rule that dropped it, so a person can see what
 * was never read and why, and can overrule it.
 *
 * TWO RULES THIS FILE KEEPS.
 *
 * It never decides anything consequential. Dropping a row from a reading is
 * not archiving it, labelling it, or hiding it: the row stays exactly where
 * it was in the Admin, and the only thing that happened is that nobody paid
 * to have an opinion about it. The word for that is triage and not action.
 *
 * It is never a classifier in disguise. A rule here may say "this is bulk
 * mail because it carries a list-unsubscribe header and is not addressed to
 * the owner" — a fact about the envelope. It may not say "this looks
 * unimportant", because that is the reading, and the reading is what the
 * engine is for. Every rule below is checkable by somebody who has never
 * seen the body.
 */
import type { CeoRecordInput, CeoSourceType } from "../../core-v2/domains/ceo-admin/records.ts";

export type TriageVerdict = {
  /* Whether this row becomes a source of a workflow. */
  keep: boolean;
  /* The rule that decided, by name. Written into the record either way, so
     "why was this never read" is a question the record answers. */
  rule: string;
  /* What a rule that dropped a row proposes the Admin show instead — a
     PROPOSAL, exactly like every other output of this system, and never an
     action. Null when the row was kept. */
  proposedAttention: "noise" | "legacy" | null;
};

export type TriageOptions = {
  /* The day the triage is run for, as a plain date. Dates in a row are
     compared against this and against nothing else, so the same batch
     triages the same way twice. */
  today: string;
  /* How far back a row is still worth an opinion. A message from last year
     that nobody has touched is the Admin's history, not today's work. */
  staleAfterDays?: number;
};

const DAY_MS = 86_400_000;

function daysBetween(fromIso: string, toIso: string): number | null {
  const from = Date.parse(fromIso), to = Date.parse(toIso);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  return Math.floor((to - from) / DAY_MS);
}

const truthy = (value: unknown): boolean => {
  const text = String(value ?? "").trim().toLowerCase();
  return text === "true" || text === "yes" || text === "1" || text === "present";
};

/* ═════════════════════════════════════════════════════════════ the rules
 *
 * In order. The first that matches decides, and its name is the answer to
 * "why". Each one is a sentence about the envelope of the row, never about
 * what the row says.
 */
export const TRIAGE_RULES: {
  name: string; applies: CeoSourceType[]; keep: boolean;
  proposedAttention?: "noise" | "legacy";
  matches(record: CeoRecordInput, options: Required<TriageOptions>): boolean;
}[] = [
  {
    /* THE RULE THAT PAYS FOR THIS FILE.
       Bulk mail identifies itself: a sender that wants to keep its reputation
       carries the header that lets people leave. A message that carries it
       AND was not addressed to the owner personally is a circular, and that
       is a fact about the headers rather than a judgement about the words. */
    name: "bulk_mail_not_addressed_to_the_owner",
    applies: ["email_message"], keep: false, proposedAttention: "noise",
    matches: (record) => {
      const fields = record.fields ?? {};
      const bulk = truthy(fields.list_unsubscribe) || truthy(fields.bulk)
        || String(fields.list_unsubscribe ?? "").trim() !== "" || String(fields.list_id ?? "").trim() !== "";
      return bulk && !truthy(fields.direct_to_owner);
    },
  },
  {
    name: "an_automated_sender_that_never_expects_a_reply",
    applies: ["email_message"], keep: false, proposedAttention: "noise",
    matches: (record) => {
      const from = String(record.fields?.from_address ?? record.fields?.from_local ?? "").toLowerCase();
      return /^(no-?reply|do-?not-?reply|donotreply|mailer-daemon|postmaster|bounce)/.test(from)
        && !truthy(record.fields?.direct_to_owner);
    },
  },
  {
    name: "older_than_this_engine_reads_and_nobody_has_touched_it",
    applies: ["email_message"], keep: false, proposedAttention: "legacy",
    matches: (record, options) => {
      const received = String(record.fields?.received_at ?? "");
      if (!received) return false;
      const age = daysBetween(received, options.today);
      return age !== null && age > options.staleAfterDays && !truthy(record.fields?.flagged);
    },
  },
  {
    /* A row the Admin has already finished with has nothing left to settle.
       This is the Admin's own state, not an opinion about it. */
    name: "the_admin_already_closed_this",
    applies: ["task", "waiting_for"], keep: false,
    matches: (record) => ["done", "closed", "cancelled", "answered", "complete", "completed"]
      .includes(String(record.fields?.status ?? "").trim().toLowerCase()),
  },
  {
    name: "an_appointment_that_has_already_happened",
    applies: ["calendar_item"], keep: false,
    matches: (record, options) => {
      const ends = String(record.fields?.ends_at ?? "");
      if (!ends) return false;
      const age = daysBetween(ends, options.today);
      return age !== null && age > 0;
    },
  },
  {
    name: "there_is_something_here_a_reading_could_settle",
    applies: ["task", "waiting_for", "email_message", "calendar_item", "project_state"], keep: true,
    matches: () => true,
  },
];

export function triage(record: CeoRecordInput, options: TriageOptions): TriageVerdict {
  const whole: Required<TriageOptions> = { staleAfterDays: 120, ...options };
  for (const rule of TRIAGE_RULES) {
    if (!rule.applies.includes(record.sourceType)) continue;
    if (!rule.matches(record, whole)) continue;
    return { keep: rule.keep, rule: rule.name, proposedAttention: rule.proposedAttention ?? null };
  }
  /* Unreachable while the last rule keeps everything, and written anyway: a
     fall-through that silently dropped a row would be the one bug in this
     file nobody would ever see. */
  return { keep: true, rule: "no_rule_matched_so_it_is_read", proposedAttention: null };
}

export type TriagedBatch = {
  kept: CeoRecordInput[];
  dropped: { record: CeoRecordInput; verdict: TriageVerdict }[];
};

export function triageBatch(records: CeoRecordInput[], options: TriageOptions): TriagedBatch {
  const kept: CeoRecordInput[] = [];
  const dropped: TriagedBatch["dropped"] = [];
  for (const record of records) {
    const verdict = triage(record, options);
    if (verdict.keep) kept.push(record); else dropped.push({ record, verdict });
  }
  return { kept, dropped };
}

/* ══════════════════════════════════════════════ what a batch will cost
 *
 * WHAT ONE ROW COSTS, COUNTED RATHER THAN HOPED.
 *
 * The number that matters is not how many rows arrived; it is how many paid
 * calls they turn into. This counts them from the same shape the pack plans
 * from, so a caller can see the amplification before authorising a spend
 * rather than after settling one.
 *
 * It is an UPPER BOUND on the model calls and deliberately so. Code phases —
 * ingest, compare, derive — cost nothing and are excluded. Criticism happens
 * on every reading; verification and arbitration happen only where two
 * readers differ, and the bound assumes they always do, because a bound that
 * assumes agreement is a bound that is wrong exactly when it matters.
 */
export type CallEstimate = {
  records: number;
  droppedBeforeReading: number;
  /* One per blind reading actually planned. */
  readings: number;
  /* One per reading: the evidence critic. */
  criticisms: number;
  /* The worst case: every subject disagrees and goes on to a verifier and an
     arbiter. */
  verificationsAtWorst: number;
  arbitrationsAtWorst: number;
  /* One per subject a decision is composed for. */
  compositions: number;
  modelCallsExpected: number;
  modelCallsAtWorst: number;
};

export type EstimateShape = {
  records: CeoRecordInput[];
  today: string | null;
  conflictPairs?: number;
  readers?: number;
};

export function estimateCalls(shape: EstimateShape, options: TriageOptions): CallEstimate {
  const { kept, dropped } = triageBatch(shape.records, options);
  const readers = Math.max(1, Math.min(2, shape.readers ?? 2));

  let subjects = 0;
  let banded = 0;
  for (const record of kept) {
    if (record.sourceType === "email_message") subjects += 1;                       /* classify */
    const carriesUrgency = record.sourceType === "task" || record.sourceType === "waiting_for" || record.sourceType === "calendar_item";
    if (carriesUrgency) { subjects += 1; banded += 1; }                             /* priority factors */
    if (shape.today && (record.sourceType === "waiting_for" || record.sourceType === "calendar_item")) subjects += 1;
  }
  subjects += shape.conflictPairs ?? 0;

  const readings = subjects * readers;
  const criticisms = readings;
  const verificationsAtWorst = subjects;
  const arbitrationsAtWorst = subjects;
  /* A composition per subject the pack proposes a decision for, plus the
     day's ordering when one was asked for AND there is something to order.
     A day with nothing banded in it is not planned at all, and an estimate
     that charged for it would be an estimate that never reaches zero — which
     is the one number a caller most needs it to be able to reach. */
  const compositions = subjects + (shape.today && banded > 0 ? 1 : 0);

  return {
    records: shape.records.length,
    droppedBeforeReading: dropped.length,
    readings, criticisms, verificationsAtWorst, arbitrationsAtWorst, compositions,
    modelCallsExpected: readings + criticisms + compositions,
    modelCallsAtWorst: readings + criticisms + verificationsAtWorst + arbitrationsAtWorst + compositions,
  };
}
