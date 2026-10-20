# StateCourse copy of Measured Decision Core V2

This directory is the StateCourse-owned copy of the current Core V2 implementation and the first California read-only adapter. The original repository is retained unchanged.

- Upstream: `Measured-Decision-Ai/measured-decision`, commit `ec287c5d0d3e6dcc401026ac43691a054f0f43da`.
- StateCourse contract baseline: `westccmortgage/statecourse`, commit `84c38a6d7cea4644cbf1cab528a75c52375d0aa7`.
- First course: `ca-real-estate-principles-45`; one enrollment per request.
- API contract: [statecourse/openapi.json](statecourse/openapi.json).
- Connection and migration instructions: [CONNECTING.md](CONNECTING.md).

`upstream/` contains byte-for-byte copies of all five Core V2 worker trees (kernel/domains, runtime/providers, runner, canary and voice), the SQL migration/rollback/fixture/test history, shared Supabase functions and their existing doors, upstream documentation and supporting scripts. It preserves relative imports and the historical SQL prerequisites. `upstream-lock.json` lists every copied file and SHA-256. Run `node integrations/core-v2/scripts/verify-upstream.mjs` from the StateCourse root to verify the copy. Upstream product websites, media and iOS projects are not Core V2 and are not imported. Upstream GitHub deployment workflows and root deployment/build configuration are not installed in StateCourse. Copied Supabase configuration and SQL are reference files inside this directory, outside StateCourse's migration locations.

StateCourse-specific code lives beside the copy, in `statecourse/`. The generic kernel remains unchanged. There is no application import, Netlify route, Supabase function registration, root package dependency or deployment configuration change. The root TypeScript project excludes this separately checked integration; root ESLint excludes only the unchanged upstream copy. These two narrow configuration changes prevent the Next.js application checks from compiling the copied Deno runtime. Importing the adapter does not start a server or call a provider. It is disabled by default when assembled through `createReadOnlyApi`.

## Implemented first slice

1. Validate a server-authenticated Supabase bearer; require AAL2 and a session id. Read the existing StateCourse exact-session staff proof and current scoped ledger bindings. V1 permits owners/administrators with CA authority only.
2. Capture explicit allowlisted columns in `REPEATABLE READ, READ ONLY`, with a statement timeout and a hard completeness limit. Permission/schema/query failures stop the request; they never become empty evidence.
3. Hash and freeze the complete point-in-time snapshot. Produce bounded observations from existing database records. Preserve exact table/key/field/value anchors, or a digest of a complete scoped result when a record is absent.
4. Use the copied kernel for two blind readers and an independent critic. Identical readings alone are insufficient. Unsupported, invalid, disputed or unverified observations remain `needs_human_review`. No arbiter is routed; no decisions or action executors are added.
5. Reauthorize the proof/session/CA binding before returning the result. Return the evidence and Core claim/assessment/attempt trace inline with `no-store`.

Checks cover enrollment/access inconsistency, purchase payment absence including package components, nonpurchase credit flags, pinned-version credit configuration, progress version mismatch, pinned release/review hash consistency, existing blocking console tasks, latest existing evidence gaps/expiry and latest existing reviewer findings. They are repository consistency observations, not legal determinations or a new compliance engine. No matching findings means only that these bounded checks found none.

Published hashes are used as stored. StateCourse hashes the original `JSON.stringify(payload)` bytes; a hash over canonical JSONB is not substituted as a verification of the published course. Historical enrollment versions are valid even when `courses.current_version` has advanced. Training/review enrollment does not require a payment. Existing task history, evidence and signoff records are read; the adapter does not create duplicates or change their state.

## Local verification

Node >=22.13 is required. The adapter adds no runtime dependencies. Install pinned test tools into an isolated temporary directory, then run from the repository root:

```sh
npm install --prefix /tmp/statecourse-core-v2-tests --ignore-scripts --no-audit --no-fund @electric-sql/pglite@0.3.14 typescript@5.9.3
STATECOURSE_TEST_PGLITE=/tmp/statecourse-core-v2-tests/node_modules/@electric-sql/pglite/dist/index.js bash integrations/core-v2/scripts/test.sh
PATH=/tmp/statecourse-core-v2-tests/node_modules/.bin:$PATH bash integrations/core-v2/scripts/typecheck-pack.sh
PATH=/tmp/statecourse-core-v2-tests/node_modules/.bin:$PATH bash integrations/core-v2/upstream/workers/core-v2-runner/tests/typecheck-doors.sh
```

The PostgreSQL integration test applies the real StateCourse SQL from 001 through 024, then 027 and 028, to an in-memory PGlite database. It excludes `020_rollback.sql`, the unrelated NMLS owner provisioning in 025 and owner OAuth integration in 029. The external `auth` tables/`auth.uid()` are modeled; the `pgcrypto` installation statement alone is replaced because PGlite already provides `gen_random_uuid`. The real StateCourse MFA proof functions and append-only staff ledger are exercised. This does not verify Supabase Auth itself, native PostgreSQL concurrency, pgcrypto installation or production grants/RLS.

The integration tests exercise API → actual schema SQL → captured snapshot → actual Core scheduler → offline reader/critic doubles → anchored response, plus database-enforced refusal of a deliberately injected UPDATE during the read-only transaction. They also test revoked/expired/stale proofs, wrong user/session/jurisdiction, reviewer denial, missing MFA factor/session, package payments and source tampering. Test doubles are isolated under `tests/`; no paid models are called.

The script additionally runs 20 existing upstream kernel suites. Database-backed upstream suites remain available unchanged in `upstream/workers/core-v2/tests/run.sh` for a throwaway native PostgreSQL environment; those are a separate prerequisite for a future durable Core installation.
