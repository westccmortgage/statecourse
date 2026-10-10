import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  UPSERT_TUTOR_ARTICLE_TOOL,
  upsertTutorArticle
} from "../statecourse-ai-mcp/tools/upsert-tutor-article.mjs";

const migration = await readFile(
  new URL("../database/030_statecourse_ai_tutor_articles.sql", import.meta.url),
  "utf8"
);

const principal = {
  accountId: "c4b4a7fb-a00d-45b3-aa55-4e8e47929b80",
  subject: "sc_profile_adc3031c309233538176",
  tier: "provider",
  active: true
};

const input = {
  project_id: "4fa76998-0119-46d5-949c-44479db781a7",
  slug: "residential-purchase-transaction-process",
  title: "How a Residential Real Estate Purchase Transaction Works",
  summary: "A practical chronology from preapproval through recording and keys.",
  jurisdiction: "US-NMLS",
  locale: "en",
  body_markdown: "Original public educational content.",
  source_refs: [{
    source_id: "cfpb-closing-disclosure",
    title: "Closing Disclosure",
    url: "https://www.consumerfinance.gov/owning-a-home/closing-disclosure/",
    verified_at: "2026-10-10T17:38:00Z"
  }],
  content_classification: "public_original",
  idempotency_key: "residential-purchase-v1"
};

test("tool is a draft-only Provider write with no caller-controlled tenant", () => {
  assert.equal(UPSERT_TUTOR_ARTICLE_TOOL.name, "upsert_tutor_article");
  assert.deepEqual(UPSERT_TUTOR_ARTICLE_TOOL.inputSchema.properties.status.enum, ["draft"]);
  assert.equal(UPSERT_TUTOR_ARTICLE_TOOL.inputSchema.properties.account_id, undefined);
  assert.equal(UPSERT_TUTOR_ARTICLE_TOOL.inputSchema.additionalProperties, false);
  assert.match(UPSERT_TUTOR_ARTICLE_TOOL.description, /Never publishes/);
});

test("handler derives account and actor from the verified principal", async () => {
  const calls = [];
  const result = await upsertTutorArticle({
    input,
    principal,
    rpc: async (name, args) => {
      calls.push({ name, args });
      return { article_id: "synthetic", status: "draft", revision: 1, changed: true };
    }
  });
  assert.equal(result.status, "draft");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, "statecourse_ai_upsert_tutor_article");
  assert.equal(calls[0].args.payload.account_id, principal.accountId);
  assert.equal(calls[0].args.payload.actor_subject, principal.subject);
  assert.equal(calls[0].args.payload.status, "draft");
});

test("caller cannot spoof tenant identity or store protected content", async () => {
  await assert.rejects(
    upsertTutorArticle({ input: { ...input, account_id: crypto.randomUUID() }, principal, rpc: async () => ({}) }),
    /server_owned_identity_field/
  );
  await assert.rejects(
    upsertTutorArticle({ input: { ...input, protected_content: true }, principal, rpc: async () => ({}) }),
    /protected_content_not_allowed/
  );
});

test("non-Provider plans cannot write Tutor articles", async () => {
  await assert.rejects(
    upsertTutorArticle({ input, principal: { ...principal, tier: "pro" }, rpc: async () => ({}) }),
    /provider_entitlement_required/
  );
});

test("migration keeps content private, revisioned, idempotent and backend-authenticated", () => {
  assert.match(migration, /statecourse_ai_private\.tutor_articles/);
  assert.match(migration, /statecourse_ai_private\.tutor_article_revisions/);
  assert.match(migration, /statecourse_ai_private\.tutor_article_idempotency/);
  assert.match(migration, /enable row level security/g);
  assert.match(migration, /revoke all on table[\s\S]*tutor_articles[\s\S]*tutor_article_revisions[\s\S]*tutor_article_idempotency[\s\S]*from public, anon, authenticated/);
  assert.match(migration, /perform statecourse_ai_private\.assert_backend_key\(\)/);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /tutor_article_draft_only/);
  assert.doesNotMatch(migration, /status\s*=\s*'published'/);
});
