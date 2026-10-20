# Prepared initial installation — Core database only

Status: **prepared and locally verified; NOT applied to hosted Supabase**.

The only proposed target is [StateCourse Core](https://supabase.com/dashboard/project/hkzhburprkwtnoeqbinh): project `hkzhburprkwtnoeqbinh`, organization `tusgtiwudezeofsxleet`, region `us-west-1`, database `postgres`. Existing approval covered creating an empty project only. Applying this package changes that remote schema and requires a new explicit approval under repository AGENTS.md. It does not authorize source DB changes, deployment, credentials changes, provider spending or background runners.

## Exact package

[manifest.json](manifest.json) fixes the order, original relative path, SHA-256 and byte size of **79 files**: all 78 locked upstream migrations (001–076 and both voice migrations), followed by the existing isolated result-store migration. It retains the proven Core history rather than attempting a new selective schema. Earlier organization/project/evidence prerequisites are required by Core 058/059. Historical file names/order and all 364 copied files remain unchanged.

Bundle SHA-256: `01c0a165b54840b225fcb16b68ad8956111d99f516bab3aa35ae2f037b656c15`.

Generate a review copy offline from the repository root:

```sh
node integrations/core-v2/scripts/prepare-core-install.mjs /tmp/statecourse-core-initial-install-review.sql
```

Omit the path to verify/report the package without writing a file. Existing output files are never overwritten. The generator has **no database/network/apply path**; it checks the complete upstream migration set and hashes plus the reviewed package manifest before producing SQL. No application migration is added to StateCourse `database/` or root `supabase/migrations/`.

The package wraps installation in one transaction with statement/lock bounds. A pre-DDL guard requires database `postgres`, zero base tables in public/core_readonly, absence of `public.enrollments`, and the existing Supabase Auth/Storage/pgcrypto substrate. It refuses nonempty targets/replays. Each upstream migration is included unchanged; only the isolated store file's own outer BEGIN/COMMIT is removed to keep one atomic installation. That file's full original bytes/hash remain in the manifest.

A database name or marker cannot prove a Supabase project identity. A future operator must independently select **project hkzhburprkwtnoeqbinh** in the authenticated migration API/dashboard before applying. Do not use an arbitrary connection string merely because the SQL guard passes. Never target StateCourse `gdldvjefibssxnrpsxja`, original Core `hbqlhplgqwuesrovbiye` or AI Beta `hyjcgyeddyqbeukhcjnu`.

## Reviewed changes requiring approval

The full original Core history creates its spatial/project/evidence/workflow/attempt/claim/assessment/budget/incident/voice tables, functions, indexes, triggers, RLS policies, grants, non-login runtime role and storage bucket definitions. The upstream history retains its dormant runner/settings definitions. The separate `core_readonly` schema adds the three immutable/scoped result tables and its restricted non-login role. Definitions/backfills in the original history run only inside this initially empty Core database; no source records or original Core records are imported.

No Core organization/member/user, login credential/password, provider/model/price declaration, spending authorization, armed watchdog, cron schedule, endpoint/secret value or worker deployment is seeded by this package. Existing Supabase Auth/Storage objects and pgcrypto are prerequisites, not replaced by test fixtures. The package's application-table empty guard prevents it from operating on a previously initialized Core deployment. A failure must be investigated from the actual target state; do not blindly retry or use historical rollback/delete scripts.

If installed as one aggregate migration through Supabase, its managed migration-history entry represents this initial package; the immutable manifest records all constituent original files. Do not subsequently replay those originals as if they were unapplied separate migrations. If the migration API cannot accept the package atomically, stop and review a bounded installation procedure before changing the execution shape; do not silently fall back to partial per-file writes.

## Read-only target baseline observed

The authenticated connector verified this exact new project, before any application schema installation:

- PostgreSQL `17.11`; application BASE TABLE count 0; managed migration history empty.
- Auth users and Storage objects substrate present; StateCourse enrollments marker absent.
- pgcrypto `1.3` is installed in `extensions`; `extensions.digest(text,text)` exists, public.digest does not. Upstream 065 explicitly includes extensions on its function path; no extension relocation/wrapper was added.
- Existing public-schema default grants include anon/authenticated/service_role for tables, sequences and functions. Those settings were read, not modified. The native test models the relevant broad grants and verifies no public base table is readable by anon without RLS after installation. Private result-schema usage is denied to all three API roles.

No hosted DDL, DML, migration, grant, secret read or service configuration change was performed. Source access/RLS and host selection blockers in [ACTIVATION_REVIEW.md](../ACTIVATION_REVIEW.md) remain unresolved and do not have to be bypassed to install an isolated Core schema later.

## Native local verification

Executed the exact bundle on a **disposable native PostgreSQL 17.10 cluster**, using the pinned pg 8.23.1 driver, loopback-only host, SCRAM authentication and TLS with certificate verification. Auth/Storage platform tables/functions were modeled; pgcrypto 1.3 and the PostgreSQL engine were real. Relevant public default grants matched the observed target permissions.

Observed passing behavior:

- Source marker refuses before Core DDL; a nonempty initialized target refuses a second install.
- An injected error immediately before COMMIT rolls back every application object and the new result-store role; a subsequent full installation succeeds.
- All private result tables have enabled and forced RLS. anon/authenticated/service_role have no private schema usage; no public base table is anonymously readable without RLS.
- Runner settings stay empty; the original watchdog reports unarmed and posts nothing.
- Actual result capture/completion, immutable lifecycle and cross-actor denial work against native SQL.
- After a real PostgreSQL server stop/start, the saved result bytes/hash remain identical through a fresh TLS connection.

Reproduce with an available native PostgreSQL 17 binary directory (requires initdb, pg_ctl, postgres and pgcrypto extension files), OpenSSL and the isolated server driver:

```sh
node --experimental-strip-types --no-warnings integrations/core-v2/scripts/test-native-install.mjs /absolute/native/postgres/bin
```

The harness accepts only a local binary directory, creates its own temporary cluster and TLS fixture, and stops/removes only that cluster afterwards. It accepts no hosted URL. The executed macOS binary came from the isolated temporary `@embedded-postgres/darwin-arm64@17.10.0-beta.17` package; this is not an added application/CI runtime dependency. Native verification is a separate optional local command; CI's normal suite verifies package integrity and the existing offline integration behavior.

Not yet verified: actual hosted installation under Supabase's managed migration identity, hosted Auth/Storage ownership/default-policy details beyond the read-only baseline, security advisors after DDL, native Supabase worker grants and live source authorization. Local PostgreSQL 17.10 is not the target's exact 17.11 build. No provider is contacted by these installation checks.

## After separate approval

1. Recheck project identity, empty schemas and empty migration history immediately before applying this exact hash.
2. Apply only this reviewed initial package to the named Core project, retaining the original source/Core projects unchanged. If any outcome is uncertain, inspect managed migration history/schema before a retry.
3. Read back schema/RLS/role/grant state, confirm runner settings remain empty, and run Supabase security/performance advisors. Address findings explicitly; do not silently weaken checks.
4. Stop. Organization bootstrap, worker login credentials/membership, source access, deployment/proxy enablement and paid calls remain separate work, outside this installation approval.
