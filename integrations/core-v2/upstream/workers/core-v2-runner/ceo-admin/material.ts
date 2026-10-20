/* THE TEXT A READER SAW, FETCHED BACK BY HASH ALONE.
 *
 * The submission door writes one row per declared part, inside the
 * transaction that creates the workflow. This is the other half: the store
 * that writes them, and the resolver a later pass hands to the runtime.
 *
 * WHY THE ENGINE KEEPS THE TEXT RATHER THAN ASKING FOR IT AGAIN.
 *
 * A workflow outlives the request that started it. The watchdog picks it up
 * minutes later, in another process, and a critic is handed the message a
 * reader was handed an hour ago. If the resolver asked the Admin for it
 * again, it would get whatever the row says NOW — and a mailbox moves. The
 * critic would then be judging a reading of text it was never shown, and the
 * engine would record a disagreement between two readings of two different
 * things. That is the failure `source-set.ts` exists to make impossible for
 * the other domain, and it is made impossible here the same way.
 *
 * WHAT THE RESOLVER CAN BE ASKED.
 *
 * A hash, for one workflow. Not a subject, not a message, not a query. It
 * holds the parts of ONE workflow, so a reference belonging to another finds
 * nothing here — and nothing found is the whole answer: the runtime's own
 * `verifyResolvedMaterial` refuses the request rather than sending a packet
 * with a hole in it.
 */
import type { SourceReference } from "../../core-v2/kernel/contracts.ts";
import { sha256 } from "../../core-v2/kernel/ids.ts";
import type { MaterialResolver, ResolvedMaterial } from "../../core-v2-runtime/material/material.ts";
import type { Queryable } from "../../core-v2/postgres/wire.ts";
import type { NormalisedRecord } from "../../core-v2/domains/ceo-admin/records.ts";
import { SEGMENT_KINDS } from "../../core-v2/domains/ceo-admin/records.ts";
import type { CeoMaterialStore } from "./submission.ts";

/* The provider registry treats a media type as an exact contract. CEO Admin
   text is encoded as UTF-8 below, so name that encoding instead of emitting
   the ambiguous bare text/plain type. */
export const CEO_ADMIN_TEXT_MIME_TYPE = "text/plain; charset=utf-8";

/* Every declared part of one record, in the shape the door stores. The hash
   is not sent — the database recomputes it from the characters, because a
   caller that sent a hash of something else would make every later read miss,
   silently, in another process. */
export type MaterialItem = {
  content: string;
  source_type: string;
  external_subject_key: string;
  record_version: string;
  segment_kind: string;
  captured_at: string;
};

export function materialItemsOf(records: NormalisedRecord[]): MaterialItem[] {
  const items: MaterialItem[] = [];
  for (const record of records) {
    const common = {
      source_type: record.sourceType,
      external_subject_key: record.subjectKey,
      record_version: record.recordVersion,
      captured_at: record.capturedAt,
    };
    items.push({ ...common, segment_kind: SEGMENT_KINDS.fields, content: record.fieldsText });
    if (record.text !== null) items.push({ ...common, segment_kind: SEGMENT_KINDS.text, content: record.text });
  }
  return items;
}

/* The store over migration 068. `put` runs on whatever client it is given —
   which is how the door runs it inside the same transaction as the workflow. */
export class PostgresCeoMaterialStore implements CeoMaterialStore {
  private client: Queryable;

  constructor(client: Queryable) {
    this.client = client;
  }

  async put(workflowId: string, material: Map<string, string>): Promise<void> {
    /* The map form the submission produced carries the text by hash but not
       the provenance, so this path is the plain one: it writes what it has
       and lets the database recompute the hashes. `putItems` is what the
       door actually calls, because the door still has the records. */
    const items: MaterialItem[] = [...material.values()].map((content) => ({
      content, source_type: "project_state", external_subject_key: "unknown",
      record_version: "unknown", segment_kind: SEGMENT_KINDS.fields,
      captured_at: new Date(0).toISOString(),
    }));
    await this.putItems(workflowId, items);
  }

  async putItems(workflowId: string, items: MaterialItem[]): Promise<number> {
    if (items.length === 0) return 0;
    const result = await this.client.query(
      `select public.ceo_admin_put_material($1::uuid, $2::jsonb) as written`,
      [workflowId, JSON.stringify(items)]);
    return Number(result.rows[0]?.written ?? 0);
  }

  async get(workflowId: string, contentHash: string): Promise<string | null> {
    const found = await this.getMany(workflowId, [contentHash]);
    return found.get(contentHash) ?? null;
  }

  async getMany(workflowId: string, hashes: string[]): Promise<Map<string, string>> {
    const out = new Map<string, string>();
    if (hashes.length === 0) return out;
    const result = await this.client.query(
      `select content_sha256, content from public.ceo_admin_read_material($1::uuid, $2::text[])`,
      [workflowId, `{${hashes.map((h) => `"${h}"`).join(",")}}`]);
    for (const row of result.rows) out.set(String(row.content_sha256), String(row.content));
    return out;
  }
}

/* ─────────────────────────────────────────────────────────── the resolver */

export class CeoAdminMaterialResolver implements MaterialResolver {
  readonly name = "ceo-admin-material";
  readonly asked: SourceReference[] = [];
  private store: PostgresCeoMaterialStore;
  private workflowId: string;
  private cache = new Map<string, string>();

  constructor(store: PostgresCeoMaterialStore, workflowId: string) {
    this.store = store;
    this.workflowId = workflowId;
  }

  async resolve(sources: readonly SourceReference[]): Promise<ResolvedMaterial[]> {
    for (const reference of sources) this.asked.push(reference);
    const wanted = [...new Set(sources.map((s) => s.contentHash))].filter((h) => !this.cache.has(h));
    if (wanted.length > 0) {
      for (const [hash, text] of await this.store.getMany(this.workflowId, wanted)) this.cache.set(hash, text);
    }

    const out: ResolvedMaterial[] = [];
    for (const reference of sources) {
      const text = this.cache.get(reference.contentHash);
      /* Nothing under that hash is nothing to return, and saying so is the
         whole answer: the runtime refuses the request rather than sending a
         packet that is missing what it authorised. */
      if (text === undefined) continue;
      /* THE HASH IS RECHECKED HERE TOO.
         The database keyed the row by a hash it computed; this recomputes it
         over the characters that actually came back. Two independent checks
         of the same thing cost microseconds and catch the one failure that
         would otherwise be invisible — a store that answered the wrong row. */
      if (sha256(text) !== reference.contentHash) continue;
      out.push({
        sourceId: reference.sourceId,
        segmentId: reference.segmentId,
        mediaKind: "text",
        mimeType: CEO_ADMIN_TEXT_MIME_TYPE,
        contentHash: reference.contentHash,
        byteLength: new TextEncoder().encode(text).length,
        locator: reference.locator,
        content: { text },
      });
    }
    return out;
  }
}
