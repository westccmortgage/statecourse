# Core V2 voice runtime contract

This door is server-to-server and is disabled unless
`CORE_V2_VOICE_ENABLED=true`. Deployment alone does not arm it.

## Required configuration

The caller credential is a single fixed authority. The request body cannot
select or override any of it.

- `CORE_V2_VOICE_KEY_ID`: public identifier carried in the signed request.
- `CORE_V2_VOICE_HMAC_SECRET`: at least 32 characters; shared only with the
  Netlify adapter. It does not belong on the Render voice service.
- `CORE_V2_VOICE_CALLER_APP`: fixed caller application recorded on sessions.
- `CORE_V2_VOICE_TENANT_ID`: fixed tenant recorded on sessions.

Provider execution needs all of these independent gates:

- `CORE_V2_VOICE_PROVIDER_ID`: one provider from the registry. The first
  implemented voice wire protocol is `anthropic`; other Core V2 batch
  protocols are not silently substituted.
- `CORE_V2_VOICE_PROVIDER_REGISTRY`: JSON with `providers` and dated
  `pricing` arrays in the existing Core V2 `RuntimeConfig` shapes. It contains
  provider/model declarations and rates, never credentials.
- The provider declaration's `apiKeyEnvironmentVariable`: the variable name
  whose value is read only after authentication, durable turn claim, budget
  reservation, and every network authorization gate succeeds.
- `CORE_V2_VOICE_ALLOW_PROVIDER_NETWORK=true`.
- `CORE_V2_ALLOW_PAID_CALLS=true`.
- `CORE_V2_VOICE_BUDGET_POLICY`: server-owned JSON matching
  `VoiceBudgetPolicy`. A positive amount must be explicitly supplied; there
  is no inferred nonzero budget. It independently caps total calls, provider
  requests, input tokens, output tokens, reasoning-token capacity, turns,
  elapsed time, per-turn spend, and all-in spend. Unknown outcomes retain all
  of their reservations. For Anthropic, reasoning is reported inside output;
  the runtime conservatively reserves the full output ceiling against both
  total-output and reasoning-capacity ceilings when thinking is enabled.
- `CORE_V2_VOICE_ADMISSION_POLICY`: immutable, server-owned JSON binding one
  acceptance suite to the exact owner's SHA-256 identity digest, expiry,
  maximum calls and webhooks, answer-time duration, turns, Core requests, and
  TTS characters. The request cannot supply or widen this policy.

The database route requires `CORE_V2_VOICE_DB_URL`. It must identify a
dedicated, non-superuser login that is a member of the migration-created
`core_v2_voice_runtime` role. The endpoint verifies those properties before
handling a signed request; it does not fall back to the platform owner URL or
a sibling function's route. Creating that login, granting it membership, and
placing its credential in the deployment environment are explicit hosted
operations and are not performed by this local implementation. Database URLs
and passwords are never returned in an HTTP response.

## Durable rules

- Signed nonces are claimed in PostgreSQL and cannot replay across instances.
- Admission serializes on a PostgreSQL suite row. Concurrent calls cannot
  cross the suite call/webhook ceilings, retries reuse the original answer
  time, and owner or policy drift is rejected.
- Each admitted CallSid permits exactly one durable media-stream claim. A
  restart cannot reopen the same call and reset local turn, request, or TTS
  counters; an ambiguous stream claim is never retried.
- One processing turn is allowed per call session. A request ID is bound to
  its turn ID, expected revision, and canonical request digest.
- A pre-provider crash may be reclaimed only after its lease expires. Every
  reclaim rotates a fencing token; reserve, commit, and abort reject stale
  workers before provider submission.
- Once a provider budget is reserved, a crash or ambiguous transport outcome
  blocks automatic retry and keeps the full reservation held.
- Each reservation stores the exact dated pricing snapshot used for its
  ceiling. Settlement uses that snapshot and stores raw plus normalized usage;
  it never reprices against configuration that may have changed mid-request.
- Settlement cannot exceed the reserved ceiling. A settlement failure keeps
  the hold and produces a safe refusal rather than reporting zero cost.
- Completed requests replay the stored response without another provider
  call.
- The durable tables and privileged functions live in the unexposed
  `core_v2_voice_private` schema. Public, anonymous, authenticated, and
  service-role access is revoked. Only the non-login
  `core_v2_voice_runtime` role receives execute grants; a separately created
  least-privilege login must inherit that role.

## Local validation only

`workers/core-v2-voice/tests/durable-runtime.integration.test.mjs` exercises a
fully configured synthetic provider and in-memory SQL boundary for replay,
idempotency, interruption, concurrency, lease fencing, crash, ambiguous
provider outcome, and settlement failure. Separately, the migration must be
applied to a clean disposable PostgreSQL instance during release validation.
Run `workers/core-v2-voice/tests/run-postgres-migration-test.sh`; it creates a
socket-only disposable PostgreSQL 16 cluster and applies the migration twice
as a non-superuser `CREATEROLE` principal. It verifies hosted-compatible role
creation, idempotence, least-privilege capabilities, real SQL fencing,
single-acquisition reservation, atomic owner admission, one-shot stream
claim, pricing/usage audit, and ACLs.
These checks make no provider, speech, or telephone calls and do not apply the
migration to hosted Supabase.
