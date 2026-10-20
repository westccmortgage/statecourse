/* WHAT AN ADMINISTRATIVE RECORD IS, BEFORE ANYBODY READS IT.
 *
 * Every other pack in this repository reads a FILE: a page that was rendered,
 * a frame that was sampled, a sheet that was invented. This pack reads a
 * ROW — a task, a message, a calendar entry — that already exists in another
 * system, with its own identity and its own version.
 *
 * That difference is the whole of this file, and it decides three things.
 *
 * WHAT IDENTITY MEANS HERE. A page's identity is the hash of its pixels. A
 * row's identity is the hash of the fields it carried at the moment it was
 * captured, and nothing else — not its primary key, which outlives every
 * edit, and not the time it was read, which changes on every poll. So a
 * record is hashed over its normalised material, and an edited row is a
 * DIFFERENT source with a different hash. The engine already refuses to
 * continue a workflow whose source set does not rebuild to the hashes it
 * recorded, so supersession comes free: a changed row cannot quietly rewrite
 * a finished answer, it can only start a new workflow.
 *
 * WHAT A SEGMENT IS HERE. A row has no geometry, so the pack cannot bound a
 * region the way a reader of a page bounds a box. What it has instead is
 * PARTS with different trust: the fields the Admin's own database computed,
 * and the free text some outsider wrote. Those are separate segments on
 * purpose — so a reader can be told which is which, so an anchor says which
 * one it was read from, and so the untrusted one can be sanitised without
 * touching the trusted one.
 *
 * WHAT UNTRUSTED MEANS HERE. An email body is written by whoever sent it.
 * It is material, exactly like the text of a page, and it is never an
 * instruction. This file is where that stops being a hope: free text is
 * normalised through `sanitiseFreeText` before it is ever material, which
 * flattens the control characters an injection hides in, replaces every web
 * address with a marker, and bounds the length. A reader therefore cannot be
 * handed a link, cannot quote one into an anchor, and cannot be addressed by
 * a line of text pretending to be a rule.
 *
 * Nothing in this file names a company, a person, a project or a provider.
 * The vocabularies here are the SHAPES of administrative work; which projects
 * exist is configuration, and arrives in `pack.ts` from whoever started the
 * workflow.
 */
import type { SegmentDescriptor, SourceDescriptor } from "../../kernel/contracts.ts";
import { canonical, entityId, sha256 } from "../../kernel/ids.ts";

export const SOURCE_CONTRACT_VERSION = "ceo-admin.source.1";

/* ─────────────────────────────────────────────── the five kinds of record
 *
 * Deliberately five and not fifty. Each one is a thing an administrator
 * actually holds, and each one has a different question asked of it. A kind
 * that has no question is not a kind; it is a column. */
export const SOURCE_TYPES = [
  "task", "waiting_for", "email_message", "calendar_item", "project_state",
] as const;
export type CeoSourceType = (typeof SOURCE_TYPES)[number];

export function isSourceType(value: unknown): value is CeoSourceType {
  return typeof value === "string" && (SOURCE_TYPES as readonly string[]).includes(value);
}

/* ──────────────────────────────────────────────────── the segment kinds
 *
 * Two, and the boundary between them is trust rather than tidiness.
 *
 *   record_fields — what the submitting system itself computed or typed: an
 *                   identifier, a state, a date, a counterparty's address.
 *                   Structured, bounded, written by the system of record.
 *   record_text   — what somebody outside wrote: a mail body, a note, an
 *                   invitation's description. Sanitised, always.
 *
 * A reader is told which one it is looking at, and an anchor says which one
 * it was read from, so "the engine believed the email" and "the engine
 * believed the database" are different sentences in the record. */
export const SEGMENT_KINDS = {
  fields: "record_fields",
  text: "record_text",
} as const;

/* ───────────────────────────────────────────────────────── subject keys
 *
 * One written form, used by the task, the claim, the decision and the screen.
 * Every one of them is an identity the submitting system already holds, so a
 * finding can always be carried back to the row it is about.
 *
 * They are NOT uuid-only on purpose: a message and an appointment are
 * identified by the account or calendar they live in as well as by the
 * provider's own id, because a provider id is unique within an account and
 * not beyond it. */
export const RECORD_KEY = {
  task: (id: string) => `task:${id}`,
  waiting: (id: string) => `waiting:${id}`,
  email: (accountId: string, providerMessageId: string) => `email:${accountId}:${providerMessageId}`,
  calendar: (calendarId: string, providerEventId: string) => `calendar:${calendarId}:${providerEventId}`,
  project: (id: string) => `project:${id}`,
};

/* WHY A SUBJECT IS A QUESTION AND A RECORD, NOT A RECORD.
 *
 * The first version of this pack named a subject after the row it was about,
 * which reads better and is wrong. A subject is the kernel's unit of
 * INDEPENDENCE: two blind readers per subject, and a domain that has read a
 * subject may not read it again, nor judge what it read. Ask two different
 * questions of one row under one subject key and the second question finds
 * every domain already spent on the first — the engine refuses it with
 * `independence_unavailable`, which is the discipline working and a promise
 * silently unanswered.
 *
 * So the question is part of the name. `priority/task:<id>` and
 * `commitments/task:<id>` are two subjects, each with its own two readers,
 * and the row they are both about is still readable straight off either one.
 */
export const QUESTION = {
  classify: "classify",
  priority: "priority",
  commitments: "commitments",
  conflict: "conflict",
  order: "order",
} as const;

export const SUBJECT = {
  ...RECORD_KEY,
  of: (question: string, recordKey: string) => `${question}/${recordKey}`,
  /* A question about two records is one subject, and the same two records are
     the same subject however they were found — so the pair is sorted. */
  pair: (a: string, b: string) => { const [x, y] = [a, b].sort(); return `${QUESTION.conflict}/pair:${x}|${y}`; },
  /* The day an ordering is proposed for. One subject, one ordering. */
  day: (isoDate: string) => `${QUESTION.order}/day:${isoDate}`,
};

/* The question and the row, read back out of a subject key — what a screen
   needs to put a proposal beside the thing it is about. */
export function readSubject(subjectKey: string): { question: string; recordKey: string } | null {
  const slash = subjectKey.indexOf("/");
  if (slash <= 0 || slash === subjectKey.length - 1) return null;
  return { question: subjectKey.slice(0, slash), recordKey: subjectKey.slice(slash + 1) };
}

/* The subject type that goes beside each subject key. The kernel compares on
   both, so a task and a message can never be mistaken for one another even
   if somebody reused an identifier. */
export const SUBJECT_TYPE: Record<CeoSourceType, string> = {
  task: "task",
  waiting_for: "waiting",
  email_message: "email",
  calendar_item: "calendar",
  project_state: "project",
};

/* ─────────────────────────────────────────────────────────── the locator
 *
 * A row has no geometry. What a reader CAN point at is a range of characters
 * in the part it was handed, and that is what an anchor carries here.
 *
 * `offset` and `length` are used rather than names of our own because the
 * kernel scrubs a locator down to the keys it knows before showing it to a
 * critic (kernel/visibility.ts), and a key it does not know would simply
 * vanish on the way — leaving an anchor that says nothing about where it was
 * read. A locator whose keys survive anonymisation is the only kind worth
 * writing. */
export type TextLocator = { offset: number; length: number; ordinal?: number };

export function textLocator(offset: number, length: number): TextLocator {
  return { offset, length };
}

/* Whether a locator this pack produced or received is one it can stand
   behind: inside the part it claims to be inside, and forward-running. */
export function locatorWithin(locator: Record<string, unknown>, textLength: number): boolean {
  const offset = locator.offset, length = locator.length;
  if (offset === undefined && length === undefined) return true;
  if (typeof offset !== "number" || typeof length !== "number") return false;
  if (!Number.isInteger(offset) || !Number.isInteger(length)) return false;
  if (offset < 0 || length < 0) return false;
  return offset + length <= textLength;
}

/* ════════════════════════════════════════════════════════════ sanitising
 *
 * THE EMAIL IS NOT TALKING TO THE ENGINE.
 *
 * Everything below treats free text as bytes somebody else chose. There is no
 * cleverness here and there should not be: the defences that work are the
 * boring ones, applied before the text is material rather than after it is a
 * problem.
 *
 *   · control characters are flattened, because an injection that survives a
 *     human reading the message hides in the bytes a human does not see;
 *   · every web address becomes a marker. A reader with no address cannot be
 *     sent anywhere, cannot quote one into an anchor, and cannot smuggle one
 *     into a claim — and the kernel's own packet guard refuses a packet
 *     carrying a URL, so an unsanitised body would poison the critic's packet
 *     rather than merely risk something;
 *   · the length is bounded, because a body long enough to bury an
 *     instruction past a reader's attention is a body that has already won;
 *   · nothing is interpreted. No rule here tries to detect an instruction.
 *     Detection is a losing game and this does not play it: the defence is
 *     that instructions in material have nowhere to land, not that we can
 *     spot them.
 */

/* Roughly a long message. Past this a reader is being asked to skim, and a
   skim is not a reading. What was cut is said out loud in the text itself so
   a person reading the record knows it happened. */
export const MAXIMUM_TEXT_CHARACTERS = 8_000;

export const LINK_MARKER = "[link]";
export const ADDRESS_MARKER = "[address]";

const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<>"')\]]+/gi;
/* A bare host with a path, which is how a link survives a naive stripper. */
const BARE_HOST_PATTERN = /\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+\/[^\s<>"')\]]*/gi;
/* TWO KINDS OF INVISIBLE, AND THEY ARE NOT TREATED THE SAME.
 *
 * A control character stands where a character was: flattening it to a space
 * keeps the text the length and shape a person saw.
 *
 * A zero-width or direction-overriding mark stands where NOTHING was, and is
 * there precisely so that a word does not look like itself. Replacing one
 * with a space would finish the job it was inserted to start — "ignore" with
 * a zero-width space in the middle would become "ign ore", which no scan
 * catches and no quotation reads. So those are REMOVED, and the word closes
 * back up into the word it always was, legible to a reader and quotable into
 * an anchor.
 *
 * Both are built from strings rather than written as regular-expression
 * literals, because two of these characters END A LINE as far as a parser is
 * concerned and a literal containing them does not survive being written
 * into a source file.
 */
const CONTROL = new RegExp(
  "[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F-\\u009F\\u2028\\u2029]", "g");
const ZERO_WIDTH = new RegExp(
  "[\\u200B-\\u200F\\u202A-\\u202E\\u2060-\\u2064\\u2066-\\u2069\\uFEFF]", "g");

const EMAIL_PATTERN = /\b[^\s@<>()[\]]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+\b/gi;

/* The only text transformation this pack performs, and it is performed on
   every piece of free text without exception. Deterministic: the same input
   gives the same output on every machine and every pass, which matters
   because the output is hashed and the hash is the source's identity. */
export function sanitiseFreeText(raw: string): string {
  let text = String(raw ?? "");
  /* Unicode separators and control characters, flattened to ordinary space
     and newline. Tab and newline survive as themselves; everything else in
     the C0 and C1 ranges, and the direction-overriding marks, becomes a
     space, so nothing can be written that a person would not see. */
  text = text.replace(/\r\n?/g, "\n");
  text = text.replace(ZERO_WIDTH, "");
  text = text.replace(CONTROL, " ");
  text = text.replace(URL_PATTERN, LINK_MARKER);
  text = text.replace(BARE_HOST_PATTERN, LINK_MARKER);
  text = text.replace(EMAIL_PATTERN, ADDRESS_MARKER);
  /* Runs of blank lines collapse: a hundred newlines before a line of text is
     a way of pushing something out of sight. */
  text = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
  text = text.split("\n").map((line) => line.trimEnd()).join("\n").trim();
  if (text.length > MAXIMUM_TEXT_CHARACTERS) {
    text = `${text.slice(0, MAXIMUM_TEXT_CHARACTERS)}\n\n[this text was longer than this engine reads and was cut here]`;
  }
  return text;
}

/* A field the submitting system computed. Trusted for its SHAPE — it is a
   date, an integer, a state — and never for its content, so it is still
   flattened to one line and bounded. A subject line is written by a sender
   and travels as a field, which is why this is not a weaker sanitiser. */
export const MAXIMUM_FIELD_CHARACTERS = 500;

export function sanitiseField(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  const text = sanitiseFreeText(String(raw)).replace(/\n+/g, " ").trim();
  return text.length > MAXIMUM_FIELD_CHARACTERS ? `${text.slice(0, MAXIMUM_FIELD_CHARACTERS)}…` : text;
}

/* ════════════════════════════════════════════════════════ the record itself
 *
 * What the submitting system hands over for one row. `material` is the
 * structured part; `text` is whatever free prose the row carries. Both are
 * sanitised here rather than at the door, so there is exactly one place where
 * an unsanitised byte could become material and it is this function.
 */
export type CeoRecordInput = {
  sourceType: CeoSourceType;
  /* The identity the submitting system holds. It is the subject key's
     ingredients, not the subject key: `email` needs two parts and the others
     need one, and the door builds the key rather than trusting a caller to. */
  identity: Record<string, string>;
  /* The submitting system's own version of this row. Part of the hash, so a
     re-submission at a new version is a new source rather than a silent
     rewrite of an old answer. */
  recordVersion: string;
  capturedAt: string;
  /* Structured fields. Values are flattened to strings; a value the caller
     did not have is absent rather than empty, because empty is a reading. */
  fields: Record<string, string | number | boolean | null>;
  /* Free prose, if the row carries any. */
  text?: string | null;
};

export type NormalisedRecord = {
  sourceType: CeoSourceType;
  subjectKey: string;
  subjectType: string;
  recordVersion: string;
  capturedAt: string;
  /* Sorted, flattened, sanitised — the form that is hashed. */
  fields: Record<string, string>;
  fieldsText: string;
  text: string | null;
  contentHash: string;
};

/* The subject key of a record, from the identity its own system holds. Null
   when the identity does not carry what that kind of record is named by —
   which is a refusal at the door, never a generated id. A record the engine
   cannot name is a record the engine cannot carry an answer back to. */
export function subjectKeyOf(sourceType: CeoSourceType, identity: Record<string, string>): string | null {
  const part = (name: string): string | null => {
    const value = identity[name];
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    /* An identifier with a separator in it would make two different records
       share one subject key, so the separator is refused rather than escaped:
       an escape is a thing somebody has to remember, and a refusal is not. */
    if (trimmed === "" || trimmed.includes(":") || trimmed.includes("|") || /\s/.test(trimmed)) return null;
    return trimmed;
  };
  switch (sourceType) {
    case "task": { const id = part("taskId"); return id && SUBJECT.task(id); }
    case "waiting_for": { const id = part("waitingId"); return id && SUBJECT.waiting(id); }
    case "project_state": { const id = part("projectId"); return id && SUBJECT.project(id); }
    case "email_message": {
      const account = part("accountId"), message = part("providerMessageId");
      return account && message ? SUBJECT.email(account, message) : null;
    }
    case "calendar_item": {
      const calendar = part("calendarId"), event = part("providerEventId");
      return calendar && event ? SUBJECT.calendar(calendar, event) : null;
    }
  }
}

/* The fields, in one written form: sorted by name, sanitised, and rendered as
   lines a reader can be handed and can point into with an offset. A field
   whose value is absent is left out entirely — an empty string in a reading
   is an assertion that the field was empty, and it usually was not. */
export function renderFields(fields: Record<string, string | number | boolean | null>): { map: Record<string, string>; text: string } {
  const map: Record<string, string> = {};
  for (const name of Object.keys(fields ?? {}).sort()) {
    const value = fields[name];
    if (value === null || value === undefined) continue;
    const written = sanitiseField(value);
    if (written === "") continue;
    map[name] = written;
  }
  const text = Object.keys(map).map((name) => `${name}: ${map[name]}`).join("\n");
  return { map, text };
}

/* WHAT MAKES THIS RECORD THIS RECORD.
 *
 * The kind, the subject, the submitting system's version, and the sanitised
 * content. Not the capture time: polling the same unchanged row twice a
 * minute apart must produce the same source, or every poll would start a
 * workflow. Not the primary key alone: an edited row keeps its key and is not
 * the same material. */
export function recordContentHash(parts: {
  sourceType: CeoSourceType; subjectKey: string; recordVersion: string; fields: Record<string, string>; text: string | null;
}): string {
  return sha256(canonical({
    contract: SOURCE_CONTRACT_VERSION,
    sourceType: parts.sourceType,
    subjectKey: parts.subjectKey,
    recordVersion: parts.recordVersion,
    fields: parts.fields,
    text: parts.text,
  }));
}

export type RecordRefusal = { refused: string; field?: string; subjectKey?: string };

export function isRecordRefusal(value: unknown): value is RecordRefusal {
  return typeof value === "object" && value !== null && "refused" in (value as Record<string, unknown>);
}

const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

/* One record, checked and normalised, or one refusal saying which rule it
   broke. Nothing here is lenient: a record the engine cannot identify or
   version is refused, because the kernel's whole recovery story rests on a
   source set that rebuilds to the hashes it recorded, and a source with an
   unstable identity breaks that quietly rather than loudly. */
export function normaliseRecord(input: CeoRecordInput): NormalisedRecord | RecordRefusal {
  if (!isSourceType(input?.sourceType)) {
    return { refused: `sourceType must be one of ${SOURCE_TYPES.join(", ")}`, field: "sourceType" };
  }
  const subjectKey = subjectKeyOf(input.sourceType, input.identity ?? {});
  if (!subjectKey) {
    return {
      refused: `a ${input.sourceType} is identified by ${IDENTITY_FIELDS[input.sourceType].join(" and ")}, each a non-empty value with no colon, bar or space in it`,
      field: "identity",
    };
  }
  const recordVersion = typeof input.recordVersion === "string" ? input.recordVersion.trim() : "";
  if (recordVersion === "") {
    return { refused: "a record carries the submitting system's own version of it, so a changed row is a different source", field: "recordVersion", subjectKey };
  }
  if (typeof input.capturedAt !== "string" || !RFC3339.test(input.capturedAt)) {
    return { refused: "capturedAt is an RFC 3339 instant", field: "capturedAt", subjectKey };
  }
  const { map, text: fieldsText } = renderFields(input.fields ?? {});
  if (Object.keys(map).length === 0) {
    return { refused: "a record with no readable field is nothing to read", field: "fields", subjectKey };
  }
  const free = input.text === null || input.text === undefined ? null : sanitiseFreeText(input.text);
  const text = free === null || free === "" ? null : free;
  return {
    sourceType: input.sourceType,
    subjectKey,
    subjectType: SUBJECT_TYPE[input.sourceType],
    recordVersion,
    capturedAt: input.capturedAt,
    fields: map,
    fieldsText,
    text,
    contentHash: recordContentHash({ sourceType: input.sourceType, subjectKey, recordVersion, fields: map, text }),
  };
}

export const IDENTITY_FIELDS: Record<CeoSourceType, string[]> = {
  task: ["taskId"],
  waiting_for: ["waitingId"],
  project_state: ["projectId"],
  email_message: ["accountId", "providerMessageId"],
  calendar_item: ["calendarId", "providerEventId"],
};

/* ══════════════════════════════════════════ a record, as the kernel sees it
 *
 * The uri scheme a CEO Admin source is filed under. Like every other scheme
 * in this system it carries everything a later runner needs to find the same
 * bytes again — the kind, the subject and the version — and a uri this
 * pattern does not match is refused rather than guessed at.
 *
 * It carries no address. A subject key is a name in the submitting system,
 * not a place anybody can fetch from, and that is the point: the engine's
 * record can be read by somebody with no access to the mailbox. */
export const RECORD_SCHEME = "mdai://ceo-admin/";

export function recordUri(record: NormalisedRecord): string {
  return `${RECORD_SCHEME}${record.sourceType}/${encodeURIComponent(record.subjectKey)}/v/${encodeURIComponent(record.recordVersion)}`;
}

export function recordOfUri(uri: string): { sourceType: CeoSourceType; subjectKey: string; recordVersion: string } | null {
  if (!uri.startsWith(RECORD_SCHEME)) return null;
  const match = /^mdai:\/\/ceo-admin\/([a-z_]+)\/([^/]+)\/v\/([^/]+)$/.exec(uri);
  if (!match || !isSourceType(match[1])) return null;
  try {
    return { sourceType: match[1], subjectKey: decodeURIComponent(match[2]), recordVersion: decodeURIComponent(match[3]) };
  } catch { return null; }
}

/* THE SOURCE AND ITS DECLARED SEGMENTS.
 *
 * A record declares its own parts: there is nothing beneath them to discover,
 * so this pack has no discoverer and the engine does no discovery phase for
 * it. That is a saving of one paid reading per record, and it is honest —
 * the parts of a row are known the moment the row is read, and pretending a
 * model has to find them would be theatre. */
/* ─────────────────────────────── WHOSE SOURCE, AND IN WHICH WORKFLOW
 *
 * WHY THIS IDENTITY CARRIES THE WORKFLOW, AND WHY IT IS VERSIONED.
 *
 * The first derivation named only the record: subject key, record version,
 * content hash. `workflow_sources.id` is a bare primary key, so two workflows
 * over one unchanged row named the same id and the second submission aborted
 * the whole transaction with `workflow_sources_pkey`. That is not an edge
 * case: a retry minutes later finds most rows exactly as it left them, so the
 * ordinary retry was the one thing that could not be stored. Worse, the id
 * named no organisation either, so one tenant's rows refused another tenant's
 * identical ones — a denial rather than a leak, but a tenant-visible failure
 * caused by somebody else's data.
 *
 * So the identity is the organisation, the workflow, and then the record. Two
 * workflows over the same row are two rows; one workflow admitted twice is one
 * row, because every part of the derivation is fixed by the submission.
 *
 * THE VERSION IS IN THE KIND, ON PURPOSE. Ids already in the record were
 * derived the old way and must keep the values they have — a source id is
 * referenced by `source_segments.source_id` and by every anchor that points at
 * it. Putting the version in the name means the two schemes cannot collide and
 * nothing has to be rewritten, backfilled or migrated: see
 * `SOURCE_IDENTITY_COMPATIBILITY` below for where the boundary actually falls.
 */
export const SOURCE_IDENTITY_KIND = "ceo-admin-workflow-source-v2";

/* THE ONE THING THIS DERIVATION NEEDS THAT A RECORD DOES NOT CARRY.
   Required rather than optional: an optional owner is an owner somebody
   forgets, and forgetting it here is how the collision happened. */
export type SourceIdentity = {
  organizationId: string;
  workflowId: string;
};

/* THE SCHEME EVERY ROW WRITTEN BEFORE THIS CHANGE WAS DERIVED UNDER.
 *
 * Nothing calls this to WRITE anything, and nothing may: it exists so the
 * compatibility boundary can be stated as a test rather than as a paragraph.
 * A suite that could not name the old formula could only assert that two
 * strings differ, which proves nothing about the rows already in production.
 */
export function legacySourceIdV1(record: NormalisedRecord): string {
  return entityId("ceo-admin-source", record.subjectKey, record.recordVersion, record.contentHash);
}

/* WHERE V1 ENDS AND V2 BEGINS, in one place, because a boundary nobody wrote
   down is a boundary somebody crosses.

   · `sourceOf` is called at ADMISSION ONLY — `submission.ts` when a batch
     becomes a workflow, and the fixture when a test invents one. Grep it.
   · every later pass reads its sources back out of the record:
     `dispatcher.manifestOf` → `repository.listSources(workflowId)`, and the
     declared segments round-trip inside `workflow_sources.media`. No pass
     re-derives an id.
   · therefore a workflow admitted before this change keeps its v1 ids for
     ever, and a workflow admitted after it has v2 ids from its first row. The
     two never meet inside one workflow, and no row is rewritten, deleted or
     backfilled.
   · `sourceSetFingerprint` (`planning.ts:153`) is computed from ordinal, kind,
     uri, content hash and byte size — NOT from the source id — so a workflow's
     identity and `createWorkflow`'s intent check are unchanged by this. */
export const SOURCE_IDENTITY_COMPATIBILITY = {
  version: 2,
  kind: SOURCE_IDENTITY_KIND,
  supersedes: "ceo-admin-source",
  derivedAt: "admission only",
  rowsRewritten: 0,
  migrationRequired: false,
} as const;

export function sourceOf(
  record: NormalisedRecord, ordinal: number, identity: SourceIdentity,
): SourceDescriptor {
  if (!identity?.organizationId || !identity?.workflowId) {
    throw new Error("ceo-admin: a source id names the organisation and the workflow it belongs to, and this one was given neither");
  }
  const sourceId = entityId(
    SOURCE_IDENTITY_KIND,
    identity.organizationId, identity.workflowId,
    record.subjectKey, record.recordVersion, record.contentHash);
  const declared: SegmentDescriptor[] = [{
    sourceId,
    parentSegmentId: null,
    segmentKind: SEGMENT_KINDS.fields,
    label: `${record.sourceType} fields`,
    ordinal: 0,
    locator: textLocator(0, record.fieldsText.length),
    contentHash: sha256(record.fieldsText),
  }];
  if (record.text !== null) {
    declared.push({
      sourceId,
      parentSegmentId: null,
      segmentKind: SEGMENT_KINDS.text,
      label: `${record.sourceType} text`,
      ordinal: 1,
      locator: textLocator(0, record.text.length),
      contentHash: sha256(record.text),
    });
  }
  return {
    sourceId,
    ordinal,
    sourceKind: record.sourceType,
    label: record.subjectKey,
    uri: recordUri(record),
    contentHash: record.contentHash,
    hashAlgorithm: "sha-256",
    objectVersionId: record.recordVersion,
    byteSize: record.fieldsText.length + (record.text?.length ?? 0),
    /* WHAT THE PACK NEEDS AND THE KERNEL DOES NOT READ.
       `media` travels with the source and is where a pack may keep what only
       it understands. The subject key lives here so `expand` can name a
       subject without re-parsing a uri, and the capture time lives here so a
       screen can say how fresh the reading was. Neither is in the hash. */
    media: {
      subject_key: record.subjectKey,
      subject_type: record.subjectType,
      source_type: record.sourceType,
      record_version: record.recordVersion,
      captured_at: record.capturedAt,
    },
    declaredSegments: declared,
  };
}

/* The text of each declared segment, by the hash it was declared under. This
   is what a material resolver answers from: a hash the packet already
   authorises, and nothing else. */
export function materialOf(record: NormalisedRecord): Map<string, string> {
  const material = new Map<string, string>();
  material.set(sha256(record.fieldsText), record.fieldsText);
  if (record.text !== null) material.set(sha256(record.text), record.text);
  return material;
}
