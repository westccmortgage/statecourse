# Core initial installation applied — 2026-10-19 (America/Los_Angeles)

The user explicitly approved applying the previously reviewed package. It was applied **only** to [StateCourse Core](https://supabase.com/dashboard/project/hkzhburprkwtnoeqbinh), project `hkzhburprkwtnoeqbinh`, organization `tusgtiwudezeofsxleet`, region us-west-1, PostgreSQL 17.11.

- Exact package SHA-256: `01c0a165b54840b225fcb16b68ad8956111d99f516bab3aa35ae2f037b656c15`.
- Reviewed package/code revision: `4753788bc83e852d45f1a2562fd2e62cad94b70f`.
- Constituents: all 78 locked original Core migrations plus the separate result-store migration; original files remain unchanged.
- Managed migration: `20261020033109_statecourse_core_initial_install_v1` (version is Supabase's UTC identifier).
- Before application: get-project confirmed the exact target; application tables and migration history were empty, source marker absent, Auth/Storage/pgcrypto substrate present.
- The UTF-8 SQL bytes transferred to the migration API were independently hashed and matched the approved package. The API returned success; managed migration history independently contains the installation entry. No fallback or partial per-file application was used.

The machine-readable verification/advisor summary is [applied-receipt.json](applied-receipt.json).

## Read-back verified

Live read-only SQL on that same project confirmed:

| Check | Observed |
| --- | --- |
| Public base tables | 88 |
| Private result base tables | 3 |
| Private result tables with enabled **and forced** RLS | 3 |
| Public base tables readable by anon without RLS | 0 |
| StateCourse enrollments table | Absent |
| Core workflow and cost-budget tables | Present |
| Workflows / budgets / result runs / organizations | All 0 |
| Runner settings | 0 rows; no watchdog setting was armed |
| Private schema USAGE for anon/authenticated/service_role | Denied for all three |
| statecourse_core_store role | NOLOGIN, NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOINHERIT, NOBYPASSRLS |

No organization/member/user/login, worker credential, source DB connection, environment flag, provider/model/price/spending authority, cron or hosting route was configured. No actual provider call or deployment was executed. The StateCourse working DB and original Measured Decision project were not targeted or changed.

Read-back verifies hosted installation, catalogs and permissions. It does not establish the full hosted worker/RLS execution path: no fixture records were inserted to test hosted business operations. The earlier disposable native PostgreSQL tests remain the execution evidence for immutability, scope and server-restart persistence.

## Original installation advisor snapshot

**Subsequent update:** the separately authorized [hardening migration](../hardening/README.md) is now applied and its live security advisor report has zero WARN/ERROR findings. The findings below preserve the original installation snapshot; they are not the current security status. Runtime/source access and provider activation remain unverified.

### Findings before hardening

Both security and performance advisors completed. Their output is a review signal, not proof that every flagged object is exploitable. No extra remediation DDL was applied beyond the approved hash.

| Security finding | Count | Action before activation |
| --- | --- | --- |
| [Mutable function search_path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable) | 63 WARN | Review each effective function path/owner; prepare a separate compatibility-tested Core-only hardening migration. |
| [Anon EXECUTE on SECURITY DEFINER functions](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable) | 21 WARN | Audit direct/inherited EXECUTE and RPC exposure; close unnecessary client access before seeding organizational data or enabling the bridge. Some entries are trigger functions and not directly callable RPCs, so the count is not a count of exploitable endpoints. |
| [Authenticated EXECUTE on SECURITY DEFINER functions](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) | 66 WARN | Distinguish intended guarded member operations from backend-only mutations; do not weaken authorization or blanket-change the locked original history. |
| [RLS enabled without policies](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) | 21 INFO | Check intended service-only/private access; do not add permissive policies merely to silence the advisor. |

A read-only privilege query confirms anon/authenticated EXECUTE on `public.core_v2_claim_recovery` and `public.core_v2_record_completion`, both SECURITY DEFINER. Their locked source bodies perform state writes and do not contain an organization-membership/service-role authorization check at entry. This is a concrete permission concern before any organization data is introduced. No attempt to mutate through these functions was made. The current StateCourse server's MFA checks would not protect a direct Core Data API call; the source adapter must not be treated as the protection for these unrelated RPCs.

Performance findings: 195 unindexed foreign keys (INFO), 7 auth RLS init-plan findings (WARN), 113 unused indexes (INFO), and 42 multiple-permissive-policy findings (WARN). Remediation references are preserved in the receipt. In particular the new result events foreign key lacks a covering index; review a focused organization/run index before meaningful load. Do not drop indexes or combine security policies simply to remove warnings. Unused indexes are expected on a newly initialized empty database and are not grounds for deletion.

## Next bounded work

Prepare/review an additive hardening migration **only for this new Core project**, preserving the copied upstream files and original production Core. It should address effective client RPC permissions and fixed function paths with explicit allowlists and native negative tests, plus the narrow result-history index if justified. Remote remediation requires its own explicit approval; the installation approval covered the fixed package only.

Keep bridge/provider gates closed and organizations empty until this is resolved. Source-read credentials/RLS and Node hosting remain separate unresolved prerequisites. No course, operational signoff, payment/progress/exam/certificate or Launch Control readiness state changed.
