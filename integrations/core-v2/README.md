# StateCourse copy of Measured Decision Core V2

This is the StateCourse-owned copy of Core V2 and a disabled-by-default, read-only integration for California Real Estate Principles. The original repository and its services remain unchanged.

- Upstream: `Measured-Decision-Ai/measured-decision@ec287c5d0d3e6dcc401026ac43691a054f0f43da`.
- StateCourse source contract: `westccmortgage/statecourse@84c38a6d7cea4644cbf1cab528a75c52375d0aa7`.
- Course: `ca-real-estate-principles-45`; one enrollment per request.
- [API contract](statecourse/openapi.json), [connection instructions](CONNECTING.md), [storage/dependency plan](STORAGE.md), [verification](TEST_RESULTS.md).

`upstream/` preserves 364 byte-identical files: all five Core worker trees, provider/runtime/runner/voice implementations, SQL migration/rollback/test history, shared Supabase doors, documentation and supporting scripts. `upstream-lock.json` records every SHA-256. Upstream websites, media, iOS projects and deployment workflows are not installed. Copied SQL/configuration stays outside StateCourse's migration directories. Root TypeScript excludes the independently checked integration; root ESLint excludes only the unchanged copy. No application, Lesson Coach, site routing, dependency or deployment configuration is changed.

## Read-only analysis

The source adapter validates the original Supabase AAL2 bearer and current exact-session staff proof/ledger authority. V1 permits owners/administrators with CA scope. It reads explicit columns in `REPEATABLE READ, READ ONLY`, with timeouts and hard completeness limits. Errors never become empty evidence. Snapshot bytes are hashed and frozen.

Observations reference exact table/key/field/value records or a digest of a complete scoped result for absence. Package payments use `payment_enrollments`, historical enrollments retain their pinned version/release, and content review uses the stored release hash. Stored `JSON.stringify(payload)` hashes are not replaced with canonical JSONB hashes. Existing tasks, history, evidence and signoffs are read without creating or closing Console records.

Checks cover enrollment/access inconsistency, purchase-payment absence, nonpurchase credit flags, pinned-version credit configuration, progress version mismatch, release/review consistency, existing blocking tasks, latest recorded evidence gaps/expiry and reviewer findings. Two blind readers and an independent critic run through the unchanged kernel. Agreement alone is insufficient; unverified observations remain `needs_human_review`. No arbiter route, composer or action executor is added. These are consistency observations, not legal, launch, exam, certificate or human-signoff decisions.

## Durable results and provider mode

`PostgresResultStore` writes only to a separately configured Core database. It stores immutable canonical snapshot/result bytes with database-checked hashes, actor/organization RLS, an idempotent request record and append-only lifecycle events. A stored result can be retrieved after an actual database/process restart. Source and writer connections remain separate; both the new migration and writer preflights refuse the StateCourse source database.

With storage configured, POST requires a UUID `Idempotency-Key`. A completed retry returns the original result without recapturing source data or calling providers. `GET /v1/statecourse/observations/{runId}` checks current StateCourse MFA/role/CA authority and permits only the original actor in the configured organization. Incomplete/interrupted runs return status, never an automatic paid replay. Changed source data requires a deliberately new request/key.

`createProviderRuntimeFactory` reuses Core's existing provider registry, prompt compiler, material resolver, HTTPS transport, PostgreSQL orchestration repository and metered budget ledger. Three distinct configured providers serve two readers and the critic. Existing server keys are read through their declared environment-variable names; no key is created, copied into a file or printed. There are no default production models, prices or capability assumptions.

Network operation requires explicit host enablement, the existing `CORE_V2_ALLOW_PAID_CALLS=true` environment gate, all Core authorization/pricing gates, three usable configurations and credentials, and durable Core SQL. Budget reservation and attempt submission share the existing atomic transaction. Unknown outcomes retain their holds. Automatic transport retries are disabled. The default remains disabled; importing modules opens no connection or socket. The process-local `createExecutors` seam is for offline doubles and refuses provider executors.

The copied generic runner/watchdog is not registered for this domain or enabled here. Durable records do not imply automatic resume: a crash leaves a non-replayable request plus whatever attempts/holds Core persisted. Manual reconciliation is required before any new spending authorization.

## Local verification

Node >=22.13 is required; there are no new runtime dependencies. From the StateCourse root:

```sh
npm install --prefix /tmp/statecourse-core-v2-tests --ignore-scripts --no-audit --no-fund @electric-sql/pglite@0.3.14 typescript@5.9.3
STATECOURSE_TEST_PGLITE=/tmp/statecourse-core-v2-tests/node_modules/@electric-sql/pglite/dist/index.js bash integrations/core-v2/scripts/test.sh
node integrations/core-v2/scripts/verify-app-boundary.mjs /tmp/statecourse-core-v2-tests/node_modules/typescript/lib/typescript.js
PATH=/tmp/statecourse-core-v2-tests/node_modules/.bin:$PATH bash integrations/core-v2/scripts/typecheck-pack.sh
PATH=/tmp/statecourse-core-v2-tests/node_modules/.bin:$PATH bash integrations/core-v2/upstream/workers/core-v2-runner/tests/typecheck-doors.sh
```

Tests use separate local databases for StateCourse reads and Core writes. StateCourse tests apply actual 001–024, 027 and 028 SQL (excluding the 020 rollback and unrelated 025/029 owner/NMLS provisioning). Core provider tests apply the entire copied migration history plus the new storage migration. External Supabase auth/storage substrate is modeled; PGlite supplies `gen_random_uuid`, and only the pgcrypto text SHA-256 substrate is modeled with built-in SHA-256. Native cryptography, Supabase Auth itself, production grants/TLS/pools and hosted services are not verified.

Coverage includes actual source SQL/MFA functions, database-enforced read-only refusal, API → durable snapshot → real Core SQL/provider protocols/ledger → anchored stored result, database close/reopen retrieval, cross-actor/org denial, immutable records, idempotent replay, price/credential/network/budget refusals and unknown submissions retaining holds. HTTP responses are local stand-ins; tests never use live keys or paid APIs. Twenty existing upstream kernel suites also run unchanged. Native PostgreSQL suites remain available separately in the copied tests.

The prepared [standalone server bridge](server/README.md) uses existing HttpOnly staff/session cookies and separate TLS SQL pools. Install its isolated driver before tests: `npm ci --prefix integrations/core-v2/server --ignore-scripts --no-audit --no-fund`. It is disabled by default, binds loopback only and installs no StateCourse production route.
