# Local verification — 2026-10-19

## Existing Netlify adapter verification — 2026-10-19 (America/Los_Angeles)

44 Core integration tests and all 20 original Core suites passed. Four new Netlify cases cover non-sensitive health, no secret/network/SQL access while closed, forced provider flags OFF, application reuse and redacted initialization errors. The final packaged handler executed outside the repository with health 200, analysis POST 503 and disabled saved-run GET 503. Correct root pg declaration is required for Netlify’s modern function tracer; the exact same 8.23.1 driver version is retained. Root lock consistency passed `npm ci --dry-run --ignore-scripts --no-audit --no-fund`.

The current StateCourse production site built successfully with privacy gates. Selected existing Coach/admin/NMLS tests: 73 passed, 0 failed, 2 existing conditional tests skipped (DOM module and separate Coach SQL fixture environment absent). These skips are not evidence for Coach DOM/SQL behavior. The latest published Coach provider changes are merged unchanged. Main public/Coach/student static assets matched production before publication; Admin Console retained its expected unauthenticated sign-in redirect. No authenticated production workflow or paid provider execution was exercised.

CI [39367760189](https://github.com/westccmortgage/statecourse/actions/runs/39367760189) passed including native PostgreSQL hardening, actual Core repository/scheduler execution and restart persistence. Later merges only preserve subsequent deployed Lesson Coach changes; the selected existing tests were rerun for those changes. Hosted deployment did not pass verification and was rolled back. [Deployment evidence](server/DEPLOYMENT.md) records both failures and the confirmed restored production state. CI also passed for exact source revision bbd1bc5 in run [39367958506](https://github.com/westccmortgage/statecourse/actions/runs/39367958506).


Verified in the isolated PR #26 checkout with Node 22.22.3, PGlite 0.3.14 and TypeScript 5.9.3. The source contract remains StateCourse `84c38a6d7cea4644cbf1cab528a75c52375d0aa7`; the 364-file Core copy remains `ec287c5d0d3e6dcc401026ac43691a054f0f43da`. Existing server keys were selected for future host wiring; no key was created/read into test prompts, no live provider or hosted database was contacted and no production deployment was executed.

| Executed check | Observed result |
| --- | --- |
| `node integrations/core-v2/scripts/verify-upstream.mjs` | All 364 copied files match their locked SHA-256. |
| `STATECOURSE_TEST_PGLITE=/absolute/test/tool/path bash integrations/core-v2/scripts/test.sh` | 40 adapter/API/source-SQL/storage/provider/server/package integration tests passed, 0 failed/skipped; all 20 listed upstream kernel suites completed with `ALL OK`. |
| `bash integrations/core-v2/scripts/typecheck-pack.sh` with pinned `tsc` | Passed. |
| `bash integrations/core-v2/upstream/workers/core-v2-runner/tests/typecheck-doors.sh` with pinned `tsc` | Copied Core function/runtime imports passed. |
| TypeScript application discovery with a negative control | Independent Core remains excluded; removing the existing boundary exposes it. |
| Actual root ESLint configuration against integration source/scripts/server | Passed with no errors/warnings; unchanged upstream copy remains excluded. |
| Diff whitespace check scoped to new/changed integration files | Passed; upstream bytes remain unchanged. |

Install the separately locked server driver first: `npm ci --prefix integrations/core-v2/server --ignore-scripts --no-audit --no-fund`. Loopback socket tests require permission to bind a local port; the initial sandbox-only HTTP attempt was denied with EPERM and was rerun successfully with local socket permission.

## Executed behavior

- Added catalog preflight tests: reject an unsafe source admin role and missing Core prerequisites; a local SELECT-only principal can plan every query yet actual staff authorization is denied by ledger RLS; revoking one table grant produces a named failure while later checks continue; CLI refuses network access by default without reading/reporting secrets.

- `npm start --prefix integrations/core-v2/server` was executed with its default disabled configuration. A real loopback HTTP request returned 503, `cache-control: no-store` and `{"error":"integration_disabled"}`; the process was then stopped.
- The cookie bridge strips client identity headers, rejects missing/duplicate cookies and cross-site/origin/path/method violations. Actual source SQL → bridge → isolated Core storage produces saved evidence and replay without another execution; revoked proof denies retrieval. Full server assembly with separate SQL adapters records an interrupted run and returns `provider_network_disabled` without a paid call. Disabled assembly consults neither keys nor pools. A real loopback HTTP server returns the disabled no-store response. The pinned real pg driver sends only PostgreSQL SSL negotiation and refuses an endpoint declining TLS before any credential exchange. Connector tests verify strict SSL configuration, source read-only startup settings, lazy/exclusive leases and wrong-target refusal.
- Actual StateCourse migration SQL and existing exact-session MFA/ledger functions are exercised locally. Wrong actor/session/jurisdiction, revoked/expired/stale proof, missing verified factor/session and reviewer elevation are denied. A deliberate UPDATE inside the source reader's transaction is rejected by PostgreSQL and observed enrollment rows remain unchanged.
- A separate Core PGlite database applies the complete copied original Core migration history and new storage migration. The API then runs from **actual StateCourse SQL/MFA** through a durable snapshot, actual Core SQL orchestration, actual provider protocols with local HTTP answers, atomic budget reservations, independent critic assessment and immutable saved explanation/anchors/trace. Revoking the source proof afterwards denies GET of the saved result. Passing the source connection accidentally as the Core writer is refused, with no additional provider call or enrollment change.
- A file-backed database is actually closed and reopened. A fresh store/API instance retrieves the identical result, evidence, digest and lifecycle. Repeating the same key does not recapture source data or call providers; a changed scope conflicts. Cross-actor/organization reads are denied. Interrupted work stays non-replayable.
- Artifact/history UPDATE/DELETE, run-identity changes and illegal transitions are rejected. Unscoped restricted-role reads return no rows. Both migration and connection preflights refuse the StateCourse source database.
- The exact provider attempt has a committed durable reservation before its HTTP transport is invoked. Reservations settle from simulated provider usage; insufficient budget sends nothing. Missing actual environment gate/keys/prices or aliased providers fail closed. Unknown submissions retain holds and send once only. The process-local executor seam refuses paid-provider executors.
- Two explicitly distinct runs can analyze byte-identical captured material without source-id collisions. Whole SQL transactions serialize across scheduler lanes; a failed transaction rolls back rather than leaking writes.

## Scope of evidence and remaining deployment verification

All HTTP answers and credentials used by the provider tests are synthetic. Source tests use real StateCourse 001–024, 027 and 028 migrations with documented 020 rollback/025/029 exclusions. External Supabase auth/storage substrate is modeled. PGlite provides UUID generation, and the original Core pgcrypto text SHA-256 call is modeled with built-in SHA-256; native cryptography/extension installation is not tested.

Not verified: live StateCourse migration state or complete source SELECT grants/RLS; real Supabase token validation/provider MFA behavior; hosted Core functional runtime, organization and worker grants; native PostgreSQL pool/TLS/concurrent-process/crash behavior; live model availability, quality, actual pricing or account/key validity; global rate/spending limits; retention/backup operations; rendered Admin UI or full StateCourse application builds. The disabled host/server connection still requires independent checks/approval. The later approved hosted schema installation and advisors are recorded separately in installation/APPLIED.md.

Records and completed results are durable in the prepared code. Automatic background resume/reconciliation is not installed. A crash/unknown submission cannot be safely resolved by assuming it was not charged, and the adapter does not do so. This PR changes no course approval, credit, signoff, payment, progress, exam, certificate or Launch Control state.

## Native initial-install verification

The exact 79-file package was additionally executed on disposable native PostgreSQL 17.10 with actual pgcrypto, verified TLS/SCRAM, forced RLS, broad public default-grant modeling, full rollback after an injected failure, source/nonempty target refusal, immutable results and actual database server restart. No hosted schema was changed. Auth/Storage substrate remains modeled; target Supabase is 17.11. Reproduction, hash and scope are in [installation/README.md](installation/README.md). The ordinary CI suite does not provision a native cluster.

## Approved hosted installation — separate from test fixtures

After explicit approval, the exact package was applied to hkzhburprkwtnoeqbinh only. Managed migration history and live read-only catalogs confirm the initial schema, private forced RLS and role attributes, with zero workflows/budgets/organizations and no configured runner. Security/performance advisors were executed and their RPC-permission findings block activation. No hosted fixture/business writes, source changes, worker enablement, provider calls or deployment were performed. See [APPLIED.md](installation/APPLIED.md).
