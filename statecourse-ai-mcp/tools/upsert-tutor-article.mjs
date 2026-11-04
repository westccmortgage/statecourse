const PROVIDER_TIERS = new Set(["provider", "founding_provider"]);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const JURISDICTION = /^(US|US-NMLS|[A-Z]{2})$/;
const LOCALE = /^[a-z]{2,3}(?:-[A-Z]{2})?$/;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9._:-]{8,128}$/;

export const UPSERT_TUTOR_ARTICLE_TOOL = Object.freeze({
  name: "upsert_tutor_article",
  description:
    "Create or update one private, noncredit Tutor article draft in the authenticated Provider account. " +
    "Uses official-source references, immutable revisions, tenant isolation and idempotency. " +
    "Never publishes content, changes course approval, awards credit, stores protected exam material, or accepts an account id from the caller.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: [
      "project_id", "slug", "title", "summary", "jurisdiction", "locale",
      "body_markdown", "source_refs", "content_classification", "idempotency_key"
    ],
    properties: {
      project_id: { type: "string", format: "uuid", description: "Authorized StateCourse project UUID." },
      slug: { type: "string", pattern: SLUG.source, maxLength: 100 },
      title: { type: "string", minLength: 1, maxLength: 180 },
      summary: { type: "string", minLength: 1, maxLength: 1000 },
      jurisdiction: { type: "string", pattern: JURISDICTION.source },
      locale: { type: "string", pattern: LOCALE.source },
      body_markdown: { type: "string", minLength: 1, maxLength: 100000 },
      source_refs: {
        type: "array",
        minItems: 1,
        maxItems: 50,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["source_id", "title", "url"],
          properties: {
            source_id: { type: "string", minLength: 1, maxLength: 120 },
            title: { type: "string", minLength: 1, maxLength: 300 },
            url: { type: "string", pattern: "^https://" },
            verified_at: { type: "string", format: "date-time" }
          }
        }
      },
      content_classification: { type: "string", enum: ["public_original"] },
      idempotency_key: { type: "string", pattern: IDEMPOTENCY_KEY.source },
      status: { type: "string", enum: ["draft"], default: "draft" },
      protected_content: { type: "boolean", enum: [false], default: false }
    }
  }
});

function fail(code) {
  throw Object.assign(new Error(code), { code, statusCode: 400 });
}

function boundedString(value, min, max, code) {
  if (typeof value !== "string" || value.trim().length < min || value.length > max) fail(code);
  return value;
}

function validateSources(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 50) fail("official_source_refs_required");
  return value.map((source) => {
    if (!source || typeof source !== "object" || Array.isArray(source)) fail("invalid_official_source_ref");
    const keys = Object.keys(source);
    if (keys.some((key) => !["source_id", "title", "url", "verified_at"].includes(key))) {
      fail("invalid_official_source_ref");
    }
    const sourceId = boundedString(source.source_id, 1, 120, "invalid_official_source_ref").trim();
    const title = boundedString(source.title, 1, 300, "invalid_official_source_ref").trim();
    let url;
    try { url = new URL(source.url); } catch { fail("invalid_official_source_ref"); }
    if (url.protocol !== "https:") fail("invalid_official_source_ref");
    if (source.verified_at != null && Number.isNaN(Date.parse(source.verified_at))) fail("invalid_official_source_ref");
    return {
      source_id: sourceId,
      title,
      url: url.href,
      ...(source.verified_at == null ? {} : { verified_at: new Date(source.verified_at).toISOString() })
    };
  });
}

/**
 * Adapter-neutral handler. The MCP transport supplies `principal`; the model never does.
 * `rpc` is the adapter's existing authenticated Supabase RPC helper.
 */
export async function upsertTutorArticle({ input, principal, rpc }) {
  if (!principal?.accountId || !principal?.subject) fail("authenticated_account_required");
  const tier = principal.tier ?? principal.plan;
  if (!PROVIDER_TIERS.has(tier) || principal.active === false) fail("provider_entitlement_required");
  if (typeof rpc !== "function") fail("tutor_article_store_unavailable");
  if (!input || typeof input !== "object" || Array.isArray(input)) fail("invalid_tutor_article_input");
  if ("account_id" in input || "actor_subject" in input) fail("server_owned_identity_field");
  if (input.status != null && input.status !== "draft") fail("tutor_article_draft_only");
  if (input.protected_content === true) fail("protected_content_not_allowed");
  if (input.content_classification !== "public_original") fail("public_original_content_required");

  const projectId = boundedString(input.project_id, 36, 36, "invalid_project_id").trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId)) {
    fail("invalid_project_id");
  }
  const slug = boundedString(input.slug, 1, 100, "invalid_tutor_article_slug").trim();
  if (!SLUG.test(slug)) fail("invalid_tutor_article_slug");
  const title = boundedString(input.title, 1, 180, "invalid_tutor_article_title").trim();
  const summary = boundedString(input.summary, 1, 1000, "invalid_tutor_article_summary").trim();
  const jurisdiction = boundedString(input.jurisdiction, 2, 8, "invalid_tutor_article_jurisdiction").trim();
  if (!JURISDICTION.test(jurisdiction)) fail("invalid_tutor_article_jurisdiction");
  const locale = boundedString(input.locale, 2, 6, "invalid_tutor_article_locale").trim();
  if (!LOCALE.test(locale)) fail("invalid_tutor_article_locale");
  const bodyMarkdown = boundedString(input.body_markdown, 1, 100000, "invalid_tutor_article_body");
  const idempotencyKey = boundedString(input.idempotency_key, 8, 128, "invalid_idempotency_key").trim();
  if (!IDEMPOTENCY_KEY.test(idempotencyKey)) fail("invalid_idempotency_key");

  return rpc("statecourse_ai_upsert_tutor_article", {
    payload: {
      account_id: principal.accountId,
      actor_subject: principal.subject,
      project_id: projectId,
      slug,
      title,
      summary,
      jurisdiction,
      locale,
      body_markdown: bodyMarkdown,
      source_refs: validateSources(input.source_refs),
      content_classification: "public_original",
      status: "draft",
      idempotency_key: idempotencyKey
    }
  });
}
