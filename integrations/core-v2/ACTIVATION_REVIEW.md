# PR #26 activation review — 2026-10-19

**Current hosting decision (2026-10-19, America/Los_Angeles):** the owner selected the existing StateCourse Netlify host. No Render server was created. The [Netlify adapter](server/NETLIFY.md) keeps analysis and paid calls OFF. The separately authorized [Core hardening](hardening/README.md) is applied with zero security WARN/ERROR findings. The earlier review below records the original proposal; its dedicated-host/security-review items are superseded by these updates. Source access and hosted Core worker/bootstrap remain unresolved. Durable background transport is now implemented and locally verified in [BACKGROUND.md](server/BACKGROUND.md); hosting is verified by the [deployment receipt](server/deployed-receipt.json). Provider spending remains closed.


Reviewed PR head `b985232cf87ac0e2a20381fdfba362f6fb89db8c` and current StateCourse main `bd8319ec758b0f6e08aaf178704064984954d833`. This is a code/readiness review, not an independent human approval or authorization to migrate/deploy/spend. The subsequent narrowly approved empty-project creation is recorded below.

## Source compatibility

Compared current main against the adapter baseline `84c38a6d7cea4644cbf1cab528a75c52375d0aa7`. The source tables/columns and staff authorization definitions consumed by this adapter have not changed. Main adds separate Learning Coach/NMLS code, `database/learning-coach/001_control.sql` and a Coach route; it also changes a shared Stripe environment helper. This PR does not import or modify those implementations. No main merge, rebase or Coach change was performed during review.

The native source adapter uses fixed SQL/parameters, exact-session proof and current CA ledger checks inside repeatable-read, read-only transactions. It invokes no writeful staff security RPC, refresh, source audit, payment/progress/exam/certificate operation. The cookie bridge drops supplied identity headers and requires a fixed Origin and the original HttpOnly bearer/proof. The result store checks the independent Core target and scopes original actor/organization through forced RLS. Provider/network gates remain closed by default and the existing durable reservation/unknown-outcome rules remain intact.

No new code defect requiring a source schema or architecture change was established by this review. The following are activation blockers, not proof that the existing production system is broken.

## Observed inventory and blockers

| Item | Observed evidence | Decision |
| --- | --- | --- |
| StateCourse hosting | Read-only Netlify inventory resolves `https://statecourse.com` to site `b514a8f8-782b-448c-8881-a914ee42c69b`. | Keep existing StateCourse hosting and routes unchanged. This is not a runtime/backend binding verification. |
| Source DB | Repository identifies `gdldvjefibssxnrpsxja`; it is absent from accessible Supabase project lists. A read-only get-project request under the StateCourse-related account was denied. | Do not infer a replacement project or query another DB as StateCourse. Current source binding and access remain unverified. |
| Source SQL credential | `STATECOURSE_READ_DATABASE_URL` is absent from this process. Existing SELECT/private-proof/RLS completeness has not been demonstrated. | Do not retrieve secret values through dashboards or substitute a service-role/admin credential. |
| Separate StateCourse Core DB | Initially absent from accessible inventories. After explicit owner approval, created `hkzhburprkwtnoeqbinh` (StateCourse Core), us-west-1. `get_project` reports ACTIVE_HEALTHY; read-only SQL reports 0 application tables in public/core_readonly. The later approved initial schema install is recorded in installation/APPLIED.md. SQL URL and Core organization UUID remain unconfigured locally. | Keep organizations/workflows empty pending RPC-permission review and runtime approval. |
| StateCourse AI Beta | Existing `hyjcgyeddyqbeukhcjnu`, organization `Anatoliy Kanevsky` (`tusgtiwudezeofsxleet`), region `us-west-1`, reported INACTIVE. | Do not restore, repurpose or migrate it by assumption. It may belong to existing AI work. |
| Original MeasuredDecisionAi | Existing `hbqlhplgqwuesrovbiye` is active in another organization, region `us-east-2`. | Preserve it; not a migration/writer target. |
| Node hosting | Existing Netlify site is confirmed; an approved always-on Node host for this bridge is not established. Render lists workspaces `Markevita` and `wwccm`; neither was selected/modified. | Do not create a service or choose an unrelated workspace without owner confirmation. |

During inventory/review, no live source SQL, schema, grants, secrets, environment settings, project state or hosting configuration was changed. The subsequently approved new project is the only external resource creation, as recorded below. No provider call was made. Inventory visibility is limited to the connected accounts and is not evidence that no other resource exists.

## Approved empty-project creation — executed

The owner selected the Anatoliy Kanevsky organization and then explicitly approved: create only the empty StateCourse Core project in us-west-1, at the quoted 0 monthly amount, excluding migrations, source DB connection, deployment and paid calls. Created project `hkzhburprkwtnoeqbinh`; independent get-project verification reports ACTIVE_HEALTHY, organization `tusgtiwudezeofsxleet`, PostgreSQL `17.11.0.003`. Dashboard: https://supabase.com/dashboard/project/hkzhburprkwtnoeqbinh .

A read-only query against **that new project only** returned `application_table_count = 0` for BASE TABLEs in public/core_readonly. This verifies an empty application schema, not that Supabase has no platform-managed auth/storage tables. At empty-project verification, no application migration, Core organization/worker grant, source connection, environment variable, provider key or hosting deployment had been applied. The subsequently approved initial Core schema installation and advisor blockers are recorded in [installation/APPLIED.md](installation/APPLIED.md). No credentials were retrieved or printed. The original Core and StateCourse source were not queried through SQL or changed. Do not delete/repurpose the project without separate authorization.

## Important source authority prerequisite

The actual 019/020 staff ledger is a security-invoker view over `staff_actor_binding_events`, whose RLS is enabled. A generic SELECT-only role can plan the authorization query yet see no ledger rows. A local fixture with explicit SELECT/private-proof grants passes catalog checks but the actual reader still denies authorization; that negative case is executed in `preflight.test.mjs`. Do not call such a principal ready or assume SELECT bypasses RLS.

Any future credential must already provide correct, complete visibility under an approved least-privilege design, including the private proof function and current ledger view/base table. No new source policy, grant, role, security-definer wrapper or bypass was added to solve this blocker. The new catalog checker conservatively flags administrative/bypass roles, business table writes and authority to execute the writeful staff-security RPC. It does not certify every possible inherited function/role privilege, field completeness or RLS behavior. A real exact-session authorization test still must pass before activation.

## Proposed target and hosting decision

Use an independent **Supabase project** for StateCourse Core, rather than the source project, AI Beta or original Measured Decision project. This matches the copied Core's existing Auth/Storage/extension/migration prerequisites; a bare PostgreSQL instance is not a drop-in complete substrate. The proposed organization is `Anatoliy Kanevsky`, where StateCourse AI Beta already exists, confirmed by the owner for obtaining the cost quote. Supabase `get_cost` returned `{type: project, recurrence: monthly, amount: 0}` for that organization; no currency was supplied. This is the project-creation quote, not an unlimited usage/hosting guarantee. The owner subsequently explicitly approved creating only the empty project; that action is completed and verified below. Region should follow the confirmed source location/hosting, not be inferred from Beta alone. Request the actual organization-specific cost quote after the owner selects the organization; agree to any nonzero charge before creating anything.

Keep the current Node 22 standalone service and loopback boundary. For an initial approved host, prefer an existing dedicated VM/container with a TLS reverse proxy on that host to the loopback service; StateCourse's later approved server proxy forwards only the two fixed observation endpoints to that protected HTTPS origin. The hosting target, TLS termination/access controls, timeouts and global request limits are still unresolved. If selecting Render or another platform, separately review its required listener/health-check boundary and pricing before changing the loopback-only executable; the current service must not be advertised as directly deployable to a platform requiring a different bind address. No platform account/runtime change is made here.

## Read-only connection check prepared

After approved target/credential configuration, run from the repository root:

```sh
npm run check:connections --prefix integrations/core-v2/server
```

The command refuses by default. It requires `CORE_V2_PREFLIGHT_ALLOW_NETWORK=true`, explicit independent SQL URLs/database names/Core organization UUID, and both provider/paid gates off. This flag is an operator gate, not user approval. Do not set it against a hosted target until that access is authorized and the actual project binding is confirmed.

The checker uses `BEGIN READ ONLY`, statement bounds, EXPLAIN without ANALYZE for the exact source queries, role/privilege catalogs, Core prerequisite relation existence, configured organization existence and restricted store-role read access. It rolls back and releases connections. Output contains named pass/fail checks and no SQL errors, credentials, tokens, business records or query plans. Missing privileges use savepoints so subsequent independent diagnostics remain available. There are no migrations, grants, provider calls or business writes. `catalogChecksPassed` does not mean activation approved; output always says `activation: not_verified` and enumerates the remaining runtime checks.

## Order after decisions — not executed

1. Confirm source binding and existing read principal/RLS behavior. Stop if the only solution requires unauthorized source changes.
2. Confirm Core organization, cost and independent target. Before applying the entire upstream history, independently verify the TLS endpoint/project and absence of source markers.
3. Review the complete original migration history and new private-store migration as an installation into that isolated project. Check Supabase auth/storage/pgcrypto substrate and any public schema/function/default-grant exposure before enabling a Data API. The migration dependency plan in STORAGE.md remains unchanged; no historical file is edited.
4. Apply only the reviewed Core installation after explicit target/schema approval. Verify native roles/RLS, organization, worker privileges and connection preflight. No source migration is part of this step.
5. Confirm a secured Node host/proxy path and budget. Keep bridge/paid gates closed until approved deployment and actual source auth/revocation checks pass. Deployment is not authorized by this review.
6. Only after separate spending approval, run one bounded California example, inspect exact evidence and reconcile the saved result/usage. No training Coach, operational signoff, course readiness, progress, exam or certificate change is implied.

Current connectivity guidance was checked against [Supabase's connection documentation](https://supabase.com/docs/guides/database/connecting-to-postgres). Persistent hosts use direct connections where reachable, or session pooling on IPv4-only networks; do not assume transaction-pool session options work. The [15.19/17.11 changelog](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes) was reviewed for native migration/extension compatibility; hosted extension state and successful TLS/pooling remain unverified.

## Subsequent approved schema installation

The exact reviewed initial package was later approved and applied to hkzhburprkwtnoeqbinh only, as managed migration 20261020033109_statecourse_core_initial_install_v1. See [installation/APPLIED.md](installation/APPLIED.md) for read-back evidence, unchanged source/original-Core boundaries and RPC-permission findings that block activation. Organizations, budgets and workflows remain empty.
