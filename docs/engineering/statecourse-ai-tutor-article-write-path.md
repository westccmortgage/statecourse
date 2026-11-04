# StateCourse AI Tutor article write path

`upsert_tutor_article` is the canonical write contract for Provider-owned Tutor
reference material. It creates or updates a private draft; it does not publish,
award credit, change course or provider approval, or accept protected questions.

## Authority boundary

- The MCP adapter supplies `account_id` and `actor_subject` from its verified OAuth
  principal. Neither field exists in the model-visible input schema.
- Only an active Provider or Founding Provider principal reaches the RPC helper.
- PostgreSQL independently requires the existing functions-only MCP backend
  credential through `statecourse_ai_private.assert_backend_key()`.
- The account and article slug form the uniqueness boundary. A caller cannot update
  another tenant by guessing its project or article identifier.

## Storage and audit

- Current drafts live in `statecourse_ai_private.tutor_articles`.
- Every changed version is copied to the append-only
  `statecourse_ai_private.tutor_article_revisions` table.
- Idempotency keys are scoped to the authenticated account. Reusing a key with a
  different request fails closed.
- The public RPC returns identifiers, revision, hash and status, never the article
  body or another tenant's data.

## Release boundary

The live `statecourse-ai-beta` function was manually deployed and has no Git commit
or source archive in Netlify. This repository is now the canonical source for the
new tool and database contract. Do not replace the live function until the full
existing adapter source has been recovered or reconstructed and its current tool,
OAuth, entitlement and jurisdiction tests have been reproduced.

Production activation requires the repository's normal explicit approval, migration
review, security advisor review, exact-head deployment verification and a live MCP
read-back. Until then the tool is implemented but not represented as deployed.
