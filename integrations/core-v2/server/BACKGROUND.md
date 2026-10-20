# Durable Netlify background execution

The existing engine is unchanged. The Netlify adapter moves long work into a documented Background Function (15-minute platform limit), instead of putting the original runner's 120-second window inside a 60-second synchronous handler. Provider/network gates remain forced OFF in this deployment profile. This prepares the transport; it does not authorize source access or spending.

## Submission and execution

1. The existing cookie bridge validates Origin/cookie shape, forwards only the original bearer/proof, and strips client authority. Supabase Auth validates AAL2; current source proof/session/CA staff authority is checked through existing read-only SQL.
2. The synchronous API validates the fixed CA Principles/enrollment scope and idempotency UUID, then **durably reserves** its actor/org-scoped Core run before dispatch. It does not read all course tables in the foreground: those 15 allowlisted queries could exceed the synchronous window under slow database conditions.
3. The server posts only `{runId}` plus the original verified bearer/proof headers to the fixed same-origin `/api/admin/core/background`, without redirects or automatic HTTP retries. No new signing credential is needed. Credentials are carried only over the existing HTTPS hosting boundary and are not stored in Core snapshots, results or queue rows, or logged by application code.
4. Netlify returns its immediate 202. The front API rechecks current source authority and returns 202 with the durable run ID/state. Platform 202 alone is not authorization or successful processing. If HTTP dispatch has an unknown outcome, the front returns 503 with the existing runId, leaves its durable state intact and never resubmits it automatically.
5. The background worker independently revalidates bearer, AAL2, proof/session and current source authority. Actor comes from verified Auth; organization comes from server configuration. The payload accepts only runId, never identity, organization, SQL or snapshots.
6. A reserved run gets its bounded repeatable-read, read-only source snapshot. The existing capture transaction allows a single immutable snapshot. A worker recovering a previously captured run uses that stored hash-verified snapshot and does not recapture source. No snapshot is returned through the public queue response.
7. The existing transactional `captured -> running` transition is the execution claim. Concurrent deliveries over separate SQL connections cannot both win. Authority is checked again before the original Core scheduler runs with the durable provider repository/budget gates. The result/evidence trail is saved through the existing immutable result store.
8. Browser polling uses the existing GET observations/runId path, with current authorization before Core access and before delivery. Only actor/org-scoped results are delivered. A completed result is never recomputed on retry.

No new table, migration, role, RPC, source privilege or separate server is added. Dependencies remain the original initial Core package, isolated result store and applied hardening migration. `reserved`, `captured`, `running`, `completed`, and `interrupted` are existing lifecycle states.

## Failure and retry rules

Background workers return normally with a safe error on a rejected or failed request, rather than using platform retry as a recovery policy. A process kill can still cause Netlify to redeliver: reserved work may retry read-only capture; captured work may claim once; running, completed and interrupted work cannot execute again. A worker that loses a race must never interrupt the winning worker. A pre-claim read failure can atomically interrupt only a still-reserved run. Post-claim errors produce an interrupted hold. Unknown outcomes stay reserved/captured/running for explicit review; no watchdog, automatic reconciliation or new idempotency key is generated.

This is at-most-once host execution per run, not a promise that an external provider request can never have an unknown outcome. Original Core attempt/budget/settlement rules continue to apply. Netlify's background acknowledgment is not an evidence/result response; use the authenticated persisted GET endpoint.

## Configuration and verification

Both `CORE_V2_BRIDGE_ENABLED=true` and `CORE_V2_BACKGROUND_ENABLED=true`, separately verified source/Core SQL configuration and an existing Core organization/worker identity are prerequisites. They are currently absent/unverified; this release leaves them unchanged. The historical `analysis_disabled_pending_background_execution` error means the background activation flag is closed, not that the implementation is missing. Paid calls remain clamped OFF even if provider flags are accidentally set.

Offline integration tests exercise durable reservation, actual source SQL/cookie admission, hash-scoped result delivery, proof revocation before/after claim, cross-actor/org denial, invalid payloads, unknown dispatch outcomes, and duplicates while a worker is running. Native PostgreSQL tests additionally restart the postmaster with pending reserved/captured work, then race deliveries through separate verified-TLS connections using the actual original Core SQL repository. Only one worker executes each run. Scripted independent executors are local fixtures, not evidence of real provider quality or hosted source access.

The HTTP background endpoint returns 202 before validation because that is Netlify's platform behavior. Do not use an unauthenticated 202 as proof the worker ran, permissions passed, a source connection succeeded, or a result was saved. Full hosted analysis remains blocked by the existing credential/organization/provider-authorization prerequisites.

The Core orchestration connector now explicitly assumes service_role and sets its existing auth.role claim on a separate exclusively leased SQL connection. The dedicated Core login requires approved membership in service_role and statecourse_core_store while remaining NOINHERIT/NOSUPERUSER/NOBYPASSRLS itself. Store leases select only the private scoped role inside transactions. This session initialization is not a permission migration and was executed only against local test connections; hosted Core credentials/roles are still unconfigured.
