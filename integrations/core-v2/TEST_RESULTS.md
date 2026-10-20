# Local verification — 2026-10-19

Verified in an isolated StateCourse checkout based on `84c38a6d7cea4644cbf1cab528a75c52375d0aa7`, with Node 22.22.3, PGlite 0.3.14 and TypeScript 5.9.3. No production service, paid model, email, payment, progress update, exam or certificate operation was exercised.

| Executed check | Observed result |
| --- | --- |
| `node integrations/core-v2/scripts/verify-upstream.mjs` | All 364 copied files match their locked SHA-256, source commit `ec287c5d0d3e6dcc401026ac43691a054f0f43da`. |
| `STATECOURSE_TEST_PGLITE=/absolute/test/tool/path bash integrations/core-v2/scripts/test.sh` | 16 adapter/API/PostgreSQL integration tests passed; 0 failed, 0 skipped. All 20 listed upstream kernel suites completed with `ALL OK`. |
| `bash integrations/core-v2/scripts/typecheck-pack.sh` with pinned `tsc` on PATH | Passed; no type errors. |
| `bash integrations/core-v2/upstream/workers/core-v2-runner/tests/typecheck-doors.sh` with pinned `tsc` on PATH | Passed against copied function/runtime imports. |
| TypeScript application file discovery, including a negative control with the exclusion removed | Copied Core is excluded; removing the boundary demonstrably includes it. |
| Actual root ESLint configuration against new integration source/scripts/config | 14 files, 0 errors, 0 warnings; upstream copy ignored, new DomainPack included. |
| `git diff --cached --check` scoped to new adapter, docs, scripts, lock and workflow | Passed. Copied upstream bytes are preserved rather than reformatted. |

The SQL test uses the actual StateCourse migrations and real proof/ledger functions with the external Supabase auth substrate modeled; exact exclusions are documented in README.md. A deliberately injected UPDATE was rejected by PostgreSQL's read-only transaction guard, and the observed enrollment rows were unchanged. The end-to-end local chain returned a verified observation about a revoked access grant with exact record/field anchors and a supporting independent critic assessment. Silence, invented readings and aliased reader executors failed closed.

Not verified: live StateCourse migration state, production SELECT grants/RLS or a dedicated reader principal, actual Supabase token/session/MFA provider behavior, native PostgreSQL pool/TLS/concurrency, real model quality/cost/provider configuration, durable snapshot/restart storage, rendered Admin UI or full StateCourse application builds. The integration is inactive and adds no application/UI/routing changes; its narrow TypeScript/ESLint exclusions isolate the separate runtime; activation requirements are in CONNECTING.md. These limitations do not imply approval to connect or deploy.
