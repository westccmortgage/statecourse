# Connecting the prepared read-only integration

The integration now includes a disabled-by-default [standalone server bridge](server/README.md), absent from deployed StateCourse routes. Its isolated SQL connector and executable assembly replace the pool placeholders below when using that service. No working StateCourse schema, application/Coach code, provider account, secret, payment, progress, exam, certificate or production deployment is changed by this PR. Original Core code/services remain intact.

## Server assembly

For the runnable server, installation, configuration, cookie boundary and later proxy setup, use [server/README.md](server/README.md). The following remains the library embedding interface; it does not install a StateCourse route.

Use two independently configured pools: an existing authorized **StateCourse read** source and an isolated **Core write** backend. Each lease must be exclusive, TLS-verified, and expose `query(sql, parameters): Promise<{rows, rowCount?}>` plus `release()`. Source BIGINT values must be preserved as decimal strings. Never use the copied local trust-only PostgreSQL wire transport for a hosted connection.

```js
import {createReadOnlyApi} from './integrations/core-v2/statecourse/api.mjs';
import {StateCourseReader} from './integrations/core-v2/statecourse/adapter.mjs';
import {createSupabaseVerifier} from './integrations/core-v2/statecourse/auth.mjs';
import {PostgresResultStore} from './integrations/core-v2/statecourse/store.mjs';
import {createProviderRuntimeFactory} from './integrations/core-v2/statecourse/providers.mjs';

const store = new PostgresResultStore({
  connect: leaseCoreWriteConnection,
  expectedDatabaseName: configuredCoreDatabaseName,
});
const createRuntime = createProviderRuntimeFactory({
  config: approvedCoreRuntimeConfig,
  familyProviders: {
    'reader-family-one': existingCoreRegistry.routing['reader-family-one'],
    'reader-family-two': existingCoreRegistry.routing['reader-family-two'],
    'critic-family-one': existingCoreRegistry.routing['critic-family-one'],
  },
  connectCore: leaseCoreWriteConnection,
  expectedDatabaseName: configuredCoreDatabaseName,
  environment: process.env,
  networkEnabled: false,
  maximumAttempts: 128,
  maximumConcurrentAttempts: 8,
  deadlineMs: 120000,
});
const handler = createReadOnlyApi({
  enabled: false,
  allowedOrigin: configuredStateCourseOrigin,
  organizationId: configuredCoreOrganizationId,
  reader: new StateCourseReader({connect: leaseStateCourseReadConnection}),
  verifyAccessToken: createSupabaseVerifier({
    url: configuredStateCourseAuthOrigin,
    publishableKey: configuredPublicAuthKey,
  }),
  store,
  createRuntime,
});
```

Names in this assembly example are explicit host requirements, not claims that a pool, organization, model, key or deployment has already been configured. There are no default live models, production rates, authorities or endpoints in the new adapter. Retain the false gates in ordinary local/CI runs. Do not supply StateCourse's source pool to either writer argument.

The existing operator declaration can be read using `upstream/workers/core-v2-canary/operator-registry.ts::loadOperatorRegistry`. It validates declared models/capabilities/pricing and returns a registry whose paid authorization is **closed**. The host must separately supply an explicitly approved workflow authorization in `approvedCoreRuntimeConfig`, preserving the existing Core gates/allowlists/currency/ceiling. Never turn a declaration or a browser role into spending approval.

Use existing server key variables named by that declaration. No new key or env-file write is needed. The factory additionally checks the actual `CORE_V2_ALLOW_PAID_CALLS` server environment gate and explicit `networkEnabled`; it refuses missing credentials, pricing or independent providers before a Core connection/provider is used. Two distinct readers and a third independent critic must be configured. Reusing one provider under multiple families is refused. The critic must meet its unchanged Core role capability requirements; the adapter does not infer them from a model name. If the existing deployment has only two usable providers, keep it disabled and resolve that configuration separately rather than inventing a third capability/key.

The factory reuses the existing prompt compiler, material verification, provider protocols, SSRF/TLS-protected HTTPS transport, PostgreSQL orchestration repository and atomic metered budget ledger. Known paid provider executors are refused by the process-local executor seam. Every actual model attempt requires a durable reservation in the same transaction as its submission. Single-send transport policy, configured attempt/concurrency/deadline/cost limits and unknown-outcome holds are preserved. Real keys, rates, account access and paid calls are not tested or enabled here.

## API and idempotency

The [OpenAPI 1.2 contract](statecourse/openapi.json) adds UUID `Idempotency-Key` for durable POST and `GET /v1/statecourse/observations/{runId}` for saved results/status. The body still accepts only course/enrollment scope, not SQL, actor, organization, provider, model or budget.

POST commits an immutable snapshot before provider execution. Completed requests save the explanation, exact field/record anchors and Core trace atomically. Repeating a completed key returns that historical result without re-reading business data or invoking providers. The same key with different scope conflicts; pending/interrupted keys are never automatically replayed. A new key is a deliberate new analysis and may incur another approved cost. GET returns only the original actor's result in the configured organization after current StateCourse reauthorization. It is not a source refresh or a human signoff.

The store records incomplete work as lifecycle status; the existing Core tables retain durable orchestration and budget details in provider mode. Background restart/resubmission is not installed. The generic copied runner/watchdog has not been registered for this StateCourse DomainPack/material store and must not be enabled for it by assumption. Unknown attempts or a crash after completion but before result insertion require reconciliation of persisted Core records, not a paid rerun. See [STORAGE.md](STORAGE.md).

The host still needs an appropriate bounded request duration and cross-replica request/rate controls. The API has a 1024-byte body limit, a per-process single-flight guard for POST, source statement/row limits, 32 observations, 16 MiB artifacts and database idempotency across replicas. Those do not replace a global rate/spending policy. The Core SQL adapter serializes entire transactions on its leased connection; do not concurrently share raw connections with code outside the adapter.

## Existing StateCourse authentication boundary

The prepared server bridge retains the existing staff/session/MFA flow and forwards the original bearer plus existing HttpOnly staff proof as `x-statecourse-staff-proof`, with the fixed configured `Origin`. Never expose the proof to browser JavaScript, local storage or logs. No CORS allowance is added.

`createSupabaseVerifier` uses only GET `/auth/v1/user` at the fixed configured HTTPS auth origin, then consumes verified user/session/AAL/expiry claims. Authorization independently reads the current StateCourse ledger, exact-session proof and CA role using existing `statecourse_staff_private.proof_active`. It does not call mutating `statecourse_staff_security('check')`, mint/consume proofs, refresh last-seen or create audit rows. Existing authenticated flows remain responsible for proof freshness; stale/revoked/expired sessions deny both analysis and saved-result access.

Neither user metadata, email conventions, shared bearer strings nor client-supplied roles grant access. Current authority is checked before any Core cache read/write and again before delivery, including cached results. SQL/driver/provider exceptions return generic API errors; keys, SQL connection strings and request authorization headers are not returned or logged.

## Migration and activation requirements

[STORAGE.md](STORAGE.md) provides the ordered Core migration plan, dedicated role/RLS scope and guards. The full existing Core prerequisites are required for real provider execution; do not copy them into StateCourse `database/` or root `supabase/migrations/`. The new migration is isolated under `storage/supabase/migrations/`; it was first exercised locally and is now installed, with explicit owner approval, only in the separate Core project. [APPLIED.md](installation/APPLIED.md) records the managed migration, read-back and RPC-permission blockers.

StateCourse source dependencies remain its existing 001–014, 019/020 authority, 021–023 origin/content/tasks, 027 evidence and 028 MFA. The source read principal/gateway must already have appropriate complete SELECT access and private proof-function/schema permissions. Existing grants/RLS and the security-invoker staff view's ledger prerequisites need independent verification. This PR does not alter any source grants, policies, schema or accounts and does not substitute a service-role key when reads are denied. If the current source cannot be safely read under these constraints, activation remains blocked until an independently authorized source-access solution exists.

Before any future enablement, confirm the actual isolated Core target, migration/organization state, worker role membership, TLS/pool semantics, scoped storage access, StateCourse source permissions and current MFA revocation behavior, provider model/capability/pricing declarations, credentials, cost approval, request limits and runtime timing. Hosted installation/advisors and local native PostgreSQL installation behavior are verified in APPLIED.md; hosted runtime permissions, real provider quality/availability and production account bindings remain unverified. Nothing here authorizes provisioning, live schema changes, paid calls or deployment.

## Existing workflows and PR handling

Admin Console remains the home for StateCourse operational tasks/history, review and human signoff. Display saved observations/anchors beside those records if a UI bridge is added later; the Core persistence lifecycle does not create Console tasks or close findings. Historical enrollment versions/releases remain pinned, and a stored published hash is not claimed to have been recomputed from JSONB.

Launch Control and regulatory/commerce readiness stay in their existing workflows. Neither a Core `completed` run nor `verified_observations` approves a course, awards credit, authorizes an exam, issues a certificate or changes a launch board.

No merge/deployment is included. Branch commits and the PR title retain `[skip netlify]` per [Netlify documentation](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/). The added CI workflow has read-only repository permissions and only executes local tests/type checks, without deployment secrets or hosted databases. Site build/routing/deployment files and root dependencies remain unchanged; the separate server subpackage pins its own SQL driver. Do not run copied historical rollback scripts to remove this library or its records; any future data retention/removal procedure requires its own review.
