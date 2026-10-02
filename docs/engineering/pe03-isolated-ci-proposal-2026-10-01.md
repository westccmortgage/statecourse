# PE03 instructor correction and isolated CI proposal

Historical pre-publication review record. Subsequent private draft publication and exact-head CI results are tracked in [PR24](https://github.com/westccmortgage/statecourse/pull/24). The local acceptance statements below describe the evidence available before that CI ran.

**LOCAL AUTH CORRECTION VERIFIED / NATIVE & RENDERED CI PREPARED, NOT RUN / DISABLED / NONCREDIT**

No source was pushed, no workflow ran remotely, no hosted database or OAuth setting changed, and no provider or regulatory action occurred. The original private review bundle/version 0 and local commit `f1ff40a14616257fe7c6ad16922d3dd54ac66dcd` are superseded as an integration candidate. Keep their original hashes as historical evidence, not current acceptance.

## Blocking defect found and corrected

The original new HTTP adapter constructed only `event.headers`. Existing `requireStaff` → `requirePrivilege` needs method, path, query and exact raw body for `requestIntent`. The missing path raised `admin_request_path_required` before the security `check` call. This **failed closed**; it did not weaken action-proof binding or create learning evidence. The new page also omitted the existing fresh-action client.

The correction changes only the new PE03 adapter/page:

- Supply `httpMethod`, `path`, `rawUrl`, sorted-by-existing-helper query data, headers and exact decoded raw body before calling existing authentication
- Use `/api/admin/pe03` for the instructor adapter, matching the already-supported `staff/action-proof.js` route/canonical-intent contract
- Load the existing staff script/styles; do not edit existing staff auth, MFA, action-proof, owner-OAuth or CE code
- Preserve known `staff_step_up_required` and `fresh_action_authorization_required` 403 responses so the existing client can sign in or obtain a fresh per-action challenge
- Keep learner identity, cohort, CAS, immutable evidence and NONCREDIT guards unchanged

## Executed local acceptance

- 27/27 focused tests pass: the original 20 plus seven staff-boundary tests through actual `requireStaff`/`requirePrivilege` and the unchanged `028_staff_session_security.sql`
- The staff tests load unchanged production migrations **001, 002, 003, 019 and 028**, including the real append-only staff ledger/view. Only Supabase's external Auth schema/provider responses and fixture server grants are modeled
- Missing, expired, wrong-body and wrong-path proofs fail before the learning RPC. The exact valid proof is consumed once and binds raw bytes, method and canonical path
- Instructor lost response is exercised with actual PE03 SQL: feedback commits, the response is discarded, reuse of the consumed proof is denied, and a newly minted valid staff/action proof with the **same** request ID/body returns the same receipt. There remains one feedback event and one instructor receipt
- Three CI/client safety-contract tests pass
- Updated JSDOM/controller → loopback HTTP → PGlite flow passes through the corrected endpoint; it remains synthetic Auth and unrendered DOM, not live MFA/browser acceptance
- Focused lint, JavaScript syntax, workflow YAML parsing and both function bundles pass
- Updated `npm test`: both builds finish; 2,385 Netlify tests, 2,299 pass, **the same 57 baseline failures**, 29 skips. The two opt-in embedded-DB groups were separately run with zero skips. Full CI is not green

A new native PostgreSQL binary/service and a rendered browser were not available in this executor. The earlier Chromium socket restriction was not bypassed. Nothing in the CI source preparation closes those two gates.

## Proposed workflow

`.github/workflows/pe03-isolated-acceptance.yml` follows the repository's existing Actions conventions: `pull_request`, Ubuntu, Node22, read-only repository permissions, checkout credentials disabled, pinned isolated npm verification packages, and short-lived private artifacts. It reruns all 20 cohort tests and seven staff-boundary tests before native/browser acceptance. It is limited to PRs targeting the current PR23 branch and requires the head to be in the same repository. There is no dispatch, deploy, secret reference, provider request, database URL or hosted-service fallback.

A disposable PostgreSQL17 service uses synthetic local-only credentials. The runner's dynamic mapped port is passed explicitly. The fixture rejects nonliteral-loopback hosts and low/invalid ports, ignores all application/PG URL/password environment fallbacks, and creates a new randomly named `pe03_*` database. It never selects an existing application database. All test writes are synthetic. The service disappears with the CI job. Exact PostgreSQL version and source hashes are retained in the report; the major17 image tracks its security-patched minor release.

Verification dependencies remain outside the application package, following the existing preview-browser workflow: `pg@8.23.1`, `playwright@1.63.0`, `@electric-sql/pglite@0.5.8`. No production dependency or lockfile changes.

### Native connection acceptance

`tests/integration/pe03-native.test.mjs` uses two simultaneously leased physical `pg` clients. It asserts different backend PIDs and observes the second connection's real `pg_stat_activity.wait_event_type='Lock'` before releasing the first transaction. A `Promise.all` against PGlite cannot satisfy this harness.

The nine cases require:

1. Same-ID retry waits, then returns one committed receipt
2. Competing same-revision command waits, then fails CAS without partial evidence
3. Actor-wide lease rejects two tabs across different cohorts
4. Committed account lock defeats a waiting request
5. Committed membership revocation defeats a waiting request
6. Deadline crossed while waiting on the cohort row is enforced after the wait
7. Actual append-only instructor revocation defeats waiting feedback
8. Rollback leaves no ghost receipt; the blocked request can commit
9. Concurrent final revisions retain one immutable initial → peer → feedback → revision chain

Deterministic clock changes in this suite apply only to its newly created disposable database. The browser fixture uses the original real database clock. Native results must include all nine checked lock waits and no recorded failures before `completed` becomes true.

### Rendered acceptance

The existing PE03 Playwright harness gains the native fixture option and portable Playwright Chromium selection. A headed Chromium under Xvfb with the standard Ubuntu Openbox window manager uses Playwright’s supported `connectOverCDP({noDefaults:true})` with one fresh default-context browser per actor, so focus emulation is never enabled and exercises real focus/tab visibility rather than synthesizing DOM visibility events. It requires actual offline/reconnect, a hidden background tab, real observed time, learner lost-response refresh/retry, distinct peer/instructor dialogue, revision, actual Back/Forward, mobile width/overflow checks, desktop/mobile screenshots and actual instructor and learner JSON downloads. Download assertions compare stored event bodies and exact initial → distinct peer → assigned instructor → revision references; they verify original text preservation, the omission of another cohort’s real RPC evidence and other learners’ observation events, and false credit flags.

A separate minimal driver diagnostic runs first and must prove trusted foreground/hidden/foreground events, desktop/mobile screenshots and exact download bytes before the acceptance suites run.

The browser step uses Playwright 1.63’s supported `PLAYWRIGHT_LEGACY_SCREENSHOT=1` capture backend without enabling focus emulation; no DOM visibility or focus properties are overwritten. Browser version, capture backend and failure details are retained in the report.

The browser's authentication provider is still synthetic; the separate actual-guard/SQL suite proves the staff proof contract. Hosted Supabase Auth, a real MFA provider/device, production schema inventory and rollout configuration remain separate gates.

## Parent review before any push

Review the narrow auth correction separately from the new workflow/native harness. The intended later draft PR targets `codex/pe-foundations-free-practice-20260930` and must use `[skip netlify]` in both publication commit and PR title/body. **No push is authorized by this document.** GitHub CI execution and its results must be verified for the exact reviewed head before changing the native/browser status.

The original remaining gates still apply: full OIL policy, validated instructional timing, human SME/teaching acceptance, protected PE assessment, 20-hour completion, regulatory filing/approval and independently gated credit/certificate/banking. The owner-OAuth preservation hold remains unchanged.
