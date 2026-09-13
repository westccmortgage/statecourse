# StateCourse Mortgage / NMLS — free-training integration handoff

Checkpoint: September 13, 2026. This is an implementation record, **not NMLS approval, verified eight-hour attendance, or authorization to sell CE credit**. Keep this operator document out of public assets.

## Current result and live boundary

The recovered national manuscript now has a real, authenticated, persistent **free-training** lane on current-main code: enrollment → 45 lessons → module practice → first assessment → targeted remediation if needed → second assessment. The student portal and admin workspace consume the same immutable course definition. A separate, course-scoped regulator reviewer can inspect all lessons and unkeyed formative questions without advancing learning or assessments.

- **Local implementation:** complete for this free-training scope; full-suite checkpoint reported by the integration owner: **2,573 passed / 0 failed**. This is not a human-duration or live-payment test.
- **Database migration:** the integration owner verified the complete 28,951-byte `database/025_nmls_free_training.sql` in the production SQL editor and observed **“Success. No rows returned” on September 13, 2026**. Actual row creation time read back: **`2026-09-13T10:52:14.658469+00:00`**. Production readback confirms the course/version, both hashes, 8 modules / 45 lessons, closed approval/payment/credit gates, three RLS tables, and correct privileges on all three tables and six functions. No enrollment, training event, checkout, payment, credit-completion or certificate records existed for this course at that checkpoint.
- **Production code deployment:** confirmed on `main` at implementation commit `93ef2ca946610231779e65d480656f1ca4c22920`; Netlify deploy `6aa682f173d1830008c3dc98`, production / ready, published `2026-09-13T11:04:01.445Z`. Netlify scanned 3,068 files with zero standard or enhanced secret matches. Public mortgage, student entry and admin entry pages were opened in the actual browser. **Authenticated student and reviewer acceptance remains pending**; no full live learning pass is claimed.
- **Commercial CE:** closed. No education-provider/course approval identifiers, CE credit, completion certificate, regulatory reporting, or NMLS-course payment activation is claimed.

Use [production-postcheck.sql](production-postcheck.sql) to repeat the checks after deployment and reviewer provisioning. Its nine read-only queries return no personal information, raw learner answers, or secrets. The entire file was executed successfully against disposable PostgreSQL/PGlite using the real main 001–024 schema plus 025. Production results above were separately read back by the integration owner; this does not imply that student/reviewer acceptance has occurred.

## Source provenance — preserve current main

Repository: `https://github.com/westccmortgage/statecourse.git`.

| Source | Exact reference |
| --- | --- |
| Original NMLS workstream | `nmls-ce-launch-20260910` |
| Original common base | `0858b3cf494bf133ef925acae3f63af769620a0b` |
| Preserved remote source snapshot | `2eccf41eccfb37a20d1f001b39307d03368493d9` |
| Equivalent original local source tree | local commit `3d53e1e233eaf24f20b6ed0736409a09cd2f937b` |
| Fresh-main integration base / preceding production checkpoint | `a39f787f45e047ce451f8f6071780f64ea085cae` |
| Current local integration branch | `integration/nmls-free-training-20260913` |

The two source commit IDs differ intentionally; the source-recovery report records equivalent trees. Do not force-push one history over the other, reset main to the old branch, or replace the current public homepage with its stale public tree. See [source-recovery handoff](../nmls-source-recovery-2026-09-12/README.md) and [integration readiness](../../../nmls/INTEGRATION-READINESS-20260912.md) for the earlier evidence. This handoff supersedes their former “source missing” and “no HTTP importer” descriptions **for the new free-training lane only**, not the unfinished approved-CE lane.

Main already owns `023_console_workbench.sql` and `024_texas_training_runtime.sql`. Older NMLS 023–041 files are archived under `database/nmls-private/`; they are **not** prerequisites for 025 and must not be applied by a numeric-prefix glob. Migration 025 is a new forward migration, not a replay or renumbering of that private chain. It also works without Michigan 015–017.

## Exact course identity and content pins

| Field | Value |
| --- | --- |
| Platform course ID | `nmls-ce-2026-comprehensive-8` |
| Version / jurisdiction / discipline | `2026.3` / `US` / `mortgage` |
| Manuscript key | `nmls-2026-national-comprehensive-private-review-v3` |
| Content SHA-256 | `aad5903b17526825091e1bb59b45ec179dc84fb5c4fa24d29c6dab8e93c4c7b9` |
| Assessment-definition SHA-256 | `a7e574e03236f2973a1f6dd96e658339d424fb8dfa7c6e795c401f57ef992f10` |
| Migration 025 file SHA-256 | `2dde9f954b1c7169b9872dbcb014f3e6badae159823ec0d4ce4251605441a6cf` |
| Public discovery / authenticated learner routes | `/mortgage/` / `/student/nmls-training/` |

Authoritative files: `config/nmls-course-identity.mjs`, `config/nmls-training-definition.mjs`, `database/025_nmls_free_training.sql`. The SQL stores the source-file hashes and no lesson bodies or answer keys in its definition manifest.

- **8 modules / 45 lessons / 123 unique formative questions / 9 pinned manuscript files** (including one background source).
- **64 authored private final candidates**, of which **50 are active** and 14 are held/reserve; never publish the reserve candidates either.
- **25 questions per assessment; 18 correct to pass; at most two automatic attempts.** First failure requires actual targeted child-remediation completion before a second, disjoint form; second failure stops at staff review, not an automatic third form.
- **400 provisional study minutes**, designed around 3 federal / 2 ethics / 2 nontraditional / 1 elective hours. Programmed timing is not measured learner duration or awarded credit.

## Runtime, access, and regression evidence

The server and database pin the actor, enrollment, course/version, source and assessment hashes. Database persistence validates event identity, command digest, revision, phase and clock freshness; retries cannot award duplicate learning time. Revocation and expiry are checked after lock waits and again before returning committed state. Source progress freezes after the first final; remediation freezes after the second. Snapshot reads do not write progress or silently transfer an active browser session.

New tables: `nmls_training_definitions`, `nmls_training_attempts`, `nmls_training_events`. All have RLS; browser roles have no direct privileges; `service_role` has direct SELECT only and uses four guarded RPCs for operations. Historical active owner grants cannot override a later revocation. Existing auth/portal logging remains separate from learning mutations.

Reviewer provisioning is deliberately separate: [database/manual/nmls-review-accounts.sql](../../../database/manual/nmls-review-accounts.sql) resolves **two distinct existing Supabase Auth accounts**. It creates no Auth user or password, rejects broader/conflicting/revoked access, and does not extend expiry on replay. `regulator_reviewer` is read-only at HTTP and SQL; `student_reviewer` uses the real non-credit learning workflow. Neither role can issue credit or certificates. Do not paste passwords or tokens into this document.

Additional direct checks at this checkpoint:

- Genuine SQL persistence suite: **17/17**, no skips; main 001–024 + generated 025, privilege checks, revocation, idempotency, CAS, source/remediation immutability and successful full-course flow. Teaching clocks are simulated only inside tests; PGlite serialization is not a test of independent production connections.
- Service/HTTP suite: **19/19**, no skips; authenticated scope, stale/replayed snapshots, explicit resume, expiry and read-only reviewer rejection.
- Four **actual Netlify function ZIPs**, built through installed `@netlify/zip-it-and-ship-it` 14.7.0 using current `netlify.toml`: **4/4 pass**. Targets: `student-nmls-training.mts`, `admin-workspace.mjs`, `enroll-training.mts`, `student-portal.mts`. Each verifies 45 explicitly included private files and executes the isolated packaged handler with mocked auth/database transport, no network or login. Correct routes, auth rejection, private responses, real private curriculum/bank loading, and 19 retained source files are checked.
- Bundle report: `.netlify/functions-bundle-audit/audit-summary.json`. Reproduce with `NMLS_ZISI_MODULE=<installed zip-it-and-ship-it/dist/main.js> node scripts/audit-nmls-function-bundles.mjs`; this is a local library audit, not a deploy or CLI-login workaround.
- Public-artifact scan: **604 files / 586 text files / 187 unique private question IDs / zero violations**. The 187 include 123 formative and all 64 final candidates. Reproduce with `node scripts/verify-nmls-public-artifact.mjs` after the production-target build.

## What still blocks approved commercial CE

1. **Actual NMLS education-provider approval and approval for this exact course/version/delivery/year.** A company NMLS number, California DRE approval, or free-training success is not that approval. Keep course enrollment/credit gates false and offering payment mode disabled.
2. **Independent human content, assessment and representative learner-duration review.** The manifest correctly retains `humanReviewed:false` and `validatedDuration:false`. Final question independence and legal accuracy still need accountable human signoff.
3. **Two genuine ROCS original documents:** ROCS V4 and its issuance/retention FAQ remain unresolved. Nineteen original official HTML responses are retained and hash-verified with AI desk-review records in `nmls/evidence/2026-09-13/`; these do not substitute for those PDFs or human legal review. Approved-CE ROCS presentation/acknowledgment, vendor identity controls and credit-banking acceptance remain separate work.
4. **State supplements:** the September 10 planning matrix covers 50 states / 55 agency rows, with DC separately. It identifies **24 agency-specific supplements totaling 29 hours, excluding DC**; DC adds a separate 1-hour supplement. These are research requirements, not finished approved courses. National content alone is not full 50-state coverage. Territories, late CE and some special roles are excluded.
5. **Video placement and acceptance:** reconcile the user's existing assets, captions and course locations, then playback/accessibility QA. Received or accepted intro videos are not evidence that every course placement is installed and verified. Do not regenerate costly videos unnecessarily.
6. **Live reviewer/sample-account and browser acceptance:** resolve the existing accounts, provision only the requested course scope, test actual login, all lessons, resume/refresh, hidden-tab pauses, expiry/revocation, both assessment outcomes and cross-account denial. Synthetic DOM/server success does not replace this.
7. **Actual Stripe sandbox and live-launch QA:** sandbox checkout → genuine signed webhook → duplicate delivery → correct entitlement → refund must be evidenced; shared event-contract tests are not an actual transaction. Do not use this unapproved training course as a paid test product, activate live charges, or infer approval from Stripe setup. Real live-launch QA remains pending the commercial release decision.

## Next operator sequence

1. Run the read-only production postcheck and record results without PII; confirm exact hashes and all payment/credit gates closed.
2. Review and preserve this fresh-main integration source; deploy only the intended current-main Netlify artifact after authorization. Record the actual deployed commit/build ID, not the historical base.
3. Provision the two existing scoped reviewer identities separately, then perform authenticated production smoke checks. Empty enrollment tables before this step are expected, not proof of working login.
4. Hand over free training as **free training only** once live acceptance passes; track the seven commercial gaps above as a separate approval/release workstream.

### Production acceptance addendum — integration owner to complete

- SQL 025 application: confirmed successful in production UI, September 13, 2026.
- Production database readback: **passed** for exact identity/version, 8/45 content counts, both hashes, three table privilege boundaries, six RPC boundaries, closed commercial/credit gates and zero forbidden records; no learners or reviewer enrollments yet. Re-run membership/event checks after live account acceptance.
- Source preservation / deployed integration: **confirmed** in `main` and `integration/nmls-free-training-20260913`, implementation commit `93ef2ca946610231779e65d480656f1ca4c22920`, deploy `6aa682f173d1830008c3dc98`. Later documentation-only commits do not change these implementation/checkpoint identifiers.
- Live learner and read-only reviewer acceptance: **pending**.
- NMLS provider/course approval, CE credit, certificates and payment authorization: **not established; closed**.

### Live configuration limitations (read-only inspection after publication)

Netlify production has `STRIPE_MODE=test` and `STATECOURSE_LIVE_PAYMENTS_ENABLED=false`, both Functions-scoped. `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are absent; an actual sandbox checkout/webhook cannot yet be claimed. Free training does not require checkout.

`SUPABASE_SERVICE_ROLE_KEY` is marked secret but scoped to Builds/Functions/Runtime. `CLOUDFLARE_STREAM_API_TOKEN` is broadly scoped and not marked secret. Current build scripts do not consume either. Narrow both to Functions while preserving existing values, mark the Stream token secret, then redeploy. Do not replace hidden values with API redaction placeholders. No environment value or scope was changed during this checkpoint, and no leak is inferred from broad scopes alone.

Production's functions run Node 24. The four isolated compiled-handler smoke checks also passed on Node 24.18.0, in addition to Node 22; offline ZIP metadata still reports the bundler's Node 22 default. This distinction is intentional and is not a claim that production runs Node 22.
