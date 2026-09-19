# NMLS / Mortgage Education — current-state audit

Audit date: 2026-09-19 (America/Los_Angeles). Repository revision: `42b0474b4235037e45e4096df2207823171443b1`. Branch: `audit/nmls-current-state`. Repository root: `statecourse/` inside the supplied workspace. The working tree was clean before this audit.

The repository contains one integrated **free, non-credit national mortgage training course**, substantial private CE-policy/review-engine work, course manuscripts, assessments, and automated checks. It does **not** establish NMLS education-provider or course approval, submission, regulatory completion, certificates, credit banking, or current deployed acceptance. The free-training engine and the private policy-bound CE engine are different paths; evidence for one must not be attributed to the other.

## Scope, method, and classification

Repository-wide filename and text searches covered implementation, configuration, migrations, tests, scripts, public assets, documentation, submission folders, curriculum, media inventory, and retained NMLS source evidence. Search terms included NMLS, mortgage education, ROCS, BioSig, provider/application, identity, timing, completion, certificates, reporting, and retention. Unrelated mortgage mentions in real-estate curricula were checked for scope, not treated as NMLS courses. Secret/environment files and dependency internals were excluded from content inspection. No web research, external account access, deployment, submission, payment, message, credential retrieval, or production database operation occurred.

Important boundaries:

- `netlify.toml`, `site/build.sh`, and `docs/environment.md` identify the Netlify/Supabase implementation. The separate `app/`, `worker/`, and `db/` Sites application is not evidence of this NMLS deployment or its database state.
- **BUILT** means repository implementation or documentation exists. **VERIFIED** applies only to the narrowly stated, executed local assertion and its stated test doubles. **EXTERNAL PENDING** means repository work exists but an external decision, access, or action remains. **MISSING** means the required implementation, process, document, or evidence was not found in this checkout; it does not assert that nothing exists outside it.
- Regulatory requirements below are the repository's retained research and design basis, principally `nmls/evidence/2026-09-13/source-register.json`, not a newly verified legal opinion. Current external rules and business authority were not researched.
- Numbered capability rows are the counted items. Module inventories, verification runs, discrepancies, and blocker cross-references do not add classification items. Each counted row has exactly one status. An executed test does not promote an entire system or deployment to VERIFIED.
- File paths are relative to the repository root. For absence findings, references identify the nearest implementation, explicit hold, and search scope rather than an imaginary missing file.

### Classification totals

| Status | Count |
| --- | ---: |
| BUILT | 18 |
| VERIFIED | 24 |
| EXTERNAL PENDING | 8 |
| MISSING | 25 |
| Total classified items | 75 |

### Executed verification record

Node `v22.22.3`; local execution on 2026-09-19. No dependencies installed. Commands were inspected before execution. Tests use pure functions, mocked transports/clocks, VM fixtures, or temporary files; no actual external transaction was performed.

| Run | Exact command / method | Observed result and limit |
| --- | --- | --- |
| V1 | `node --test --test-concurrency=1 --test-reporter=tap tests/nmls-*.test.mjs tests/payment-architecture.test.mjs tests/mortgage-vertical.test.mjs tests/stripe-runtime-safety.test.mjs tests/admin-console-auth.test.mjs` | 610 reported tests: **585 passed, 0 failed, 25 skipped**, 32.177 seconds. Includes all 63 `tests/nmls-*.test.mjs` files. Skipped groups are not verification. |
| V2 | `node --test --test-concurrency=1 --test-reporter=tap tests/account-security.test.mjs tests/student-signin-recovery.test.mjs tests/stripe-event-tooling-regression.test.mjs tests/stripe-integrity.test.mjs` | **100 passed, 0 failed, 0 skipped**, 0.697 seconds. Auth/Stripe transport is mocked; no email, login, checkout, or webhook occurred externally. |
| V3 | `node scripts/verify-nmls-public-artifact.mjs public/statecourse` | `ok:true`; **515 files, 505 text files, 187 private item identities, zero violations**. Scans current public source assets, not a rebuilt `dist/`, deployed CDN, or actual Netlify ZIP. |
| V4 | Local ESM import of `nmlsCurriculumSummary()` and `NMLS_CE_DRAFT_COURSES` / `NMLS_CE_REQUIREMENTS` | Actual loader returned 8 modules, 45 lessons, 400 provisional minutes; plan returned 30 drafts and 56 agency rows including DC. Module inventory below records observed output. No answer keys printed. |

V1 + V2: **710 reported tests, 685 passed, 0 failed, 25 skipped**. Temporary TAP logs were written outside the repository at `/tmp/statecourse-nmls-audit-tests.tap` and `/tmp/statecourse-nmls-audit-shared-tests.tap`; they are not durable repository deliverables. Exact commands and result totals are retained here.

The 25 skipped groups comprise **23 SQL groups** requiring `NMLS_TEST_PGLITE_MODULE` and **2 DOM groups** requiring `NMLS_TEST_DOM_MODULE`. Those dependencies were not available/configured in this audit. SQL skips include private review/policy/observation/teaching/final/snapshot suites and all three top-level groups in `tests/nmls-training-persistence.test.mjs`. DOM skips are `tests/nmls-review-dom.test.mjs` and `tests/nmls-training-dom.test.mjs`. Current SQL persistence, SQL privileges, database concurrency, and DOM rendering were therefore **not verified** here. Historical PGlite/DOM successes are recorded as historical claims only.

`npm test`, both builds, artifact regeneration, and the California document preparation wrapper were not run. `site/build.sh` deletes/recreates `dist/` and invokes a generator that writes public files; these conflict with the single-file modification constraint. No full-suite, newly built artifact, function ZIP, browser E2E, accessibility, actual learner-duration, or production acceptance claim is made.

## 1. NMLS provider / organization registration

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 1.1 | Provider-approval research and separation from other regulators | BUILT | `nmls/evidence/2026-09-13/source-register.json` (PROVIDER), `config/nmls/course-plan.mjs`, and `public/statecourse/mortgage/index.html` distinguish provider approval from course approval and real-estate approvals. |
| 1.2 | NMLS education-provider approval | EXTERNAL PENDING | Course planning exists, but `providerId` / `providerApprovalId` are null in `config/nmls/course-plan.mjs` and `config/nmls-training-definition.mjs`. `netlify/functions/_lib/nmls-readiness.mjs` always returns `providerApprovalVerified:false`. No provider decision artifact found. |
| 1.3 | Applicant organization/account registration evidence | MISSING | No NMLS applicant account receipt, organization registration confirmation, assigned education-provider number, or reconciled applicant dossier found in `nmls/` or repository submission/handoff searches. `nmls/README.md` says corporate applicant records are outside the checkout and unresolved company facts are not fabricated. California entity documents do not prove NMLS registration. |

## 2. Provider application materials and policies

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 2.1 | Retained official-source HTML integrity checks | VERIFIED | V1, `tests/nmls-official-evidence.test.mjs`, executes `netlify/functions/_lib/nmls-official-evidence.mjs`: 19 retained HTML bodies match pinned manifest/register hashes; missing/changed bodies fail checks. `nmls/evidence/2026-09-13/` contains originals and AI-only review. Hash matching does not newly authenticate the remote origin or current law. |
| 2.2 | NMLS provider application package and operational policy set | MISSING | No assembled NMLS application forms, signed attestations, fee receipt, applicant/instructor qualification package, or NMLS-specific complaints/refunds/support, student evaluation/survey, instructor oversight, and quality-review operating package found. `nmls/README.md` explicitly lists provider application completion/review as future work. `docs/payments/california-refund-policy.md` and other states' submission packages cannot fill this gap. |
| 2.3 | Session, assessment, observation, and delivery design contracts | BUILT | `nmls/session-policy-contract.md`, `nmls/final-assessment-contract.md`, `nmls/study-observation-contract.md`, `nmls/teaching-phase-contract.md`, `nmls/FINAL-DELIVERY-INTEGRATION-CONTRACT.md`, and `config/nmls/oss-policy.mjs` document engineering rules and limitations; they are not a signed provider policy package. |
| 2.4 | Genuine ROCS V4 and issuance/retention FAQ originals | EXTERNAL PENDING | `nmls/rocs-source-review.md` documents unsuccessful acquisition; source register and V1 evidence checks retain two unresolved originals (`ROCS-V4`, `ROCS-FAQ`). HTML research and extracted text do not substitute for retained, inspected original PDFs/designated uniform text. |
| 2.5 | Genuine per-course ROCS presentation, consent, and material placement | MISSING | `lib/nmls-session-policy.mjs` models receipt-bound agreement, but `nmls/LEARNING-HTTP-CONTRACT.md` leaves genuine source presentation/setup unfinished. Free-training input explicitly refuses `present_rocs`; no actual ROCS renderer, learner acceptance flow, or pinned export wrapper was found in its UI/service. |

## 3. Existing NMLS courses

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 3.1 | One integrated national training-course identity | VERIFIED | V1 `tests/nmls-admin-integration.test.mjs` loads catalog and private sources: `nmls-ce-2026-comprehensive-8`, version `2026.3`, jurisdiction `US`, discipline `mortgage`, free training. `config/nmls-course-identity.mjs`, `public/statecourse/data/course-catalog.json`. Price and approval numbers are null; regulatory enrollment is false. This verifies repository identity, not live availability. |
| 3.2 | Draft course portfolio and multi-agency planner | VERIFIED | V1 `tests/nmls-ce-planner.test.mjs`, V4, `config/nmls/course-plan.mjs`, `config/nmls/ce-requirements-2026.json`, `lib/nmls-ce-planner.mjs`: 30 authoring records = comprehensive + core + 3 general electives + 25 agency supplements including DC. 50 states/55 state-agency rows plus DC = 56 rows. Tests reject overlap, unsupported years/roles/late CE and ambiguous agency selection. These are planning records, not 30 delivered courses. |
| 3.3 | Exact course/version/year/delivery approval | EXTERNAL PENDING | Every draft's `nmlsCourseId`, approval dates and provider ID are null in `config/nmls/course-plan.mjs`; free-training manifest also has no approval. No course approval letter or NMLS course-number evidence found. |
| 3.4 | State supplements, 2027 teaching, late CE, and prelicensure products | MISSING | `nmls/curriculum/` has national 2026 manuscripts; annual blueprint and `nmls/README.md` leave state and 2027 teaching unfinished. Planner excludes late CE/special assumptions. No NMLS PE delivery product found. Supplements are scope-expansion gaps, not prerequisites to honestly offering national free training. |
| 3.5 | Separation from California DRE mortgage education | VERIFIED | V1 `tests/nmls-admin-integration.test.mjs` and `tests/mortgage-vertical.test.mjs` preserve California mortgage real-estate classification. `california/ca-mortgage-loan-brokering-lending-45-v1/` is DRE real-estate material, not an NMLS approval or substitute course. |

## 4. Course structure, hours, lessons, and content

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 4.1 | Current comprehensive source structure and pins | VERIFIED | V1 admin/curriculum/national-review tests and V4 execute the compiler: **8 modules, 45 lessons, 123 unique formative items, 9 pinned manuscript source files, 400 provisional minutes**. `config/nmls-training-definition.mjs`, `netlify/functions/_lib/nmls-national-review-content.mjs`, `netlify/functions/_lib/nmls-readiness.mjs`. The broader authoring folder contains 11 manuscripts, including G02/G03 not delivered in this comprehensive variant. |
| 4.2 | Authored subject matter and traceability | BUILT | `nmls/curriculum/annual-curriculum-blueprint.json`, eleven manuscripts, and `review-record-20260910.md` contain federal, ethics, nontraditional, and elective teaching with citations and AI review notes. Federal F01–F03 map ten 2026 topics; F00 is background. Presence/structural tests do not establish legal accuracy, pedagogical adequacy, or compliance. |
| 4.3 | Independent human content/assessment acceptance and measured duration | MISSING | `config/nmls-training-definition.mjs` sets `humanReviewed:false`, `validatedDuration:false`; source and final loaders preserve those limits. No representative learner time study or accountable human SME signoff found. Timers and 400-minute budgets are not actual attendance. |
| 4.4 | NMLS media placement and accessibility acceptance | MISSING | `video-production/portfolio.json` does not establish NMLS course placements; the integration checkpoint records a reported elective video without an attached accepted asset. Current training projection renders manuscript lessons. No complete NMLS video/caption placement inventory or playback/accessibility acceptance record found. Video absence alone is not asserted to be an NMLS legal violation. |

Observed comprehensive module inventory (V4; unit budgets, not awarded hours):

| Module | Subject | Lessons | Provisional minutes | Module quiz-bank items |
| --- | --- | ---: | ---: | ---: |
| F01 | Application clocks and evidence | 5 | 60 | 12 |
| F02 | Loan Estimate tolerances and corrections | 6 | 50 | 16 |
| F03 | Closing Disclosure and federal-law capstone | 3 | 40 | 15 |
| E01 | Ethics: consistent treatment | 7 | 50 | 14 |
| E02 | Ethics: fraud resistance and consumer protection | 8 | 50 | 14 |
| N01 | Nontraditional mortgages: payment changes and risk | 5 | 50 | 14 |
| N02 | Nontraditional mortgages: underwriting evidence | 5 | 50 | 16 |
| G01 | Elective: mortgage-file integrity | 6 | 50 | 16 |
| Total | Federal 150 / ethics 100 / nontraditional 100 / elective 50 minutes | 45 | 400 | 117 |

Six additional unit-only ethics questions bring the current comprehensive total to 123 unique formative items. The broader manuscript inventory's 147 formative items and its v2 additions are a different denominator; they must not be represented as 147 questions delivered by this one course. Final-bank counts are separate below.

## 5. Seat-time / timing controls

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 5.1 | Non-credit unit timing and inactivity rules | VERIFIED | V1 `tests/nmls-oss-engine.test.mjs`, `tests/nmls-review-runtime.test.mjs`, and `tests/nmls-training-service.test.mjs` execute server-receipt interval accounting, 30-second maximum creditable gaps, hidden/gapped-event non-accrual, six-minute inactivity invalidation, and replay protection. `lib/nmls-oss-unit-ledger.mjs`, `lib/nmls-review-runtime.mjs`. Uses synthetic clocks/gestures; proves algorithm behavior, not a person attending. |
| 5.2 | Private actor-wide breaks, annual windows, rest, and exposure policies | VERIFIED | V1 non-skipped domain tests in `tests/nmls-session-policy.test.mjs`, `tests/nmls-study-observer.test.mjs`, `tests/nmls-uncertain-exposure.test.mjs`, and related delivery tests exercise draft policy arithmetic/refusals. `config/nmls/session-policy.mjs` chooses 200-minute break trigger, 10-minute break, 600-minute rolling limit, 12-hour wall session/rest. These are labeled provider design choices, not all literal regulatory mandates; SQL groups skipped. |
| 5.3 | Policy-bound controls in actual approved-course browser delivery | MISSING | Free-training service imports the non-credit reducer, not the complete actor-wide policy path. `nmls/LEARNING-HTTP-CONTRACT.md` leaves controller, relative delivery budget, setup/recovery, genuine identity, and ROCS integration unfinished. Existing policy code does not establish these controls for the public training route or approved CE. |

## 6. Progression and anti-skip controls

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 6.1 | Ordered units, prerequisite actions, quizzes, and server grading | VERIFIED | V1 runtime/OSS/training-service tests execute `lib/nmls-review-runtime.mjs`: only next incomplete unit opens; earlier module quiz must pass; unit time and correct activity required; exact answer sets graded server-side. Browser-supplied time, identity, state, and grades are rejected by input validation. |
| 6.2 | Retry, snapshot, and session continuity at service/client boundaries | VERIFIED | V1 `tests/nmls-training-client.test.mjs` and `tests/nmls-training-service.test.mjs` exercise serialized requests, same-event retries, stale revisions/sessions, partial clean resume, idle invalidation, and read-only snapshots that do not take over a lease. RPC storage is mocked, so durable concurrency is not established. |
| 6.3 | Durable anti-replay / privilege / revision controls | BUILT | `database/025_nmls_free_training.sql` contains immutable definitions, append-only events, ownership/expiry checks, locked revision writes, phase fences and service RPC permissions. `tests/nmls-training-persistence.test.mjs` exists but all three groups skipped in V1. No current database enforcement claim. |
| 6.4 | Resistance to automated impersonation / actual attendance proof | MISSING | `lib/nmls-review-runtime.mjs` explicitly notes that scripted gestures can simulate engagement. Neither elapsed time nor valid API input supplies genuine BioSig evidence. Private and training paths retain credit restrictions. |

## 7. Quizzes, exams, remediation, and assessment controls

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 7.1 | Formative question delivery and mastery | VERIFIED | V1 national-review/runtime/training tests exercise private sampled module banks, unit decisions, actual grading/feedback, and progression gates. `config/nmls/oss-policy.mjs` sets the provider's module pass target to 80%; question counts/banks are compiled per module. Correct choices are not in initial learner projections. |
| 7.2 | Private final authoring and form rules | VERIFIED | V1 `tests/nmls-final-authoring-content.test.mjs`, `tests/nmls-final-assessment.test.mjs`: current definitions use 50 active items from 64 authored candidates, 25-question forms, category quotas, 70% threshold (18/25 required; 17/25 fails), zero instructional-time credit, and disjoint second forms. `nmls/assessment/2026/`, `lib/nmls-final-authoring-content.mjs`, `lib/nmls-final-assessment.mjs`. Human quality review is still absent. |
| 7.3 | First failure → targeted remediation → second result | VERIFIED | V1 `tests/nmls-training-service.test.mjs` traverses all 45 actual-source units with simulated time, first failure, actual derived remediation, disjoint second pass and terminal replay. Another case ends a second failure at `staff_review_required`, with no automatic third form. Mock RPC persistence is the limit. |
| 7.4 | Private policy-bound final SQL chain | BUILT | `database/nmls-private/026_nmls_private_final_history.sql` through named 028 and 033–040 migrations, paired adapters in `netlify/functions/_lib/`, and integration tests exist. Domain/input tests passed, but SQL execution skipped in this audit. Archived private chain is not main migration 025. |
| 7.5 | Staff resolution after terminal assessment failure | MISSING | `netlify/functions/_lib/nmls-training-service.mjs` stops at `staff_review_required`; no NMLS-specific adjudication/re-enrollment procedure or audited resolution action was found in admin code/contracts. No automatic reset is claimed or recommended. |
| 7.6 | Current public-source assessment privacy scan | VERIFIED | V3 found zero violations for 187 private formative/final identities in `public/statecourse`. V1 `tests/nmls-public-artifact.test.mjs` also executes negative fixtures for leaked stems, answer maps, private paths and symlinks. Does not verify deployed files or authenticated authorization in production. |

## 8. Student identity / NMLS ID handling

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 8.1 | Authenticated actor binding at NMLS endpoints | VERIFIED | V1 `tests/nmls-training-endpoint.test.mjs`, `tests/nmls-training-enrollment.test.mjs`, and learning/review endpoint tests execute real handlers against mocked Auth/DB transport. Actor comes from the existing session; request actor/clock/state injection and cross-origin requests are rejected. `netlify/functions/student-nmls-training.mts`. |
| 8.2 | Student NMLS ID capture, validation, and course-record association | MISSING | `netlify/functions/_lib/student-session.mjs`, registration UI, NMLS training input, and `database/025_nmls_free_training.sql` bind account UUID/course version, not an individual NMLS number. No NMLS-ID intake/validation workflow found across student/account/schema searches. Banking/certificate research in the source register requires a distinct NMLS identifier. |
| 8.3 | Vendor/NMLS identity specifications and account access | EXTERNAL PENDING | `nmls/README.md` and source register IDENTITY entry identify real BioSig interface/checkpoint details as requiring NMLS/vendor access. Existing timing/account work does not supply those external specifications or authority. |
| 8.4 | Genuine BioSig runtime and verified checkpoints | MISSING | No vendor adapter, trusted signed callback validation, enrollment/checkpoint evidence store integrated with this training path, or actual identity-verification acceptance test found. `nmls/LEARNING-HTTP-CONTRACT.md` explicitly leaves BioSig integration unfinished. |

## 9. Enrollment flow

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 9.1 | Free-training discovery and authenticated enrollment | VERIFIED | V1 `tests/nmls-training-enrollment.test.mjs` executes governance/manifest checks, authenticated enrollment handler, exact training-RPC call, idempotent-return handling, revoked-access refusal, and portal projection under mocks. `netlify/functions/_lib/enroll-training-handler.mjs`, `_lib/training-access.mjs`, `_lib/nmls-training-portal.mjs`. |
| 9.2 | Public and student course UI | BUILT | `public/statecourse/mortgage/index.html`, `public/statecourse/student/nmls-training/`, `public/statecourse/student/student-portal.js` and Netlify routes provide discovery, own enrollment, learning, quizzes, assessment/remediation, saved-state and reviewer screens. DOM suites skipped; no rendered/browser acceptance performed. |
| 9.3 | Regulated CE enrollment eligibility and external completion history | MISSING | Planner can evaluate supplied agency/course inputs but no enrollment integration verifies outside-provider same/successive-year history, actual approved IDs, delivery/business authority, or regulatory eligibility. `nmls/README.md` next-work list, `lib/nmls-ce-planner.mjs`, and training-only handler substantiate the boundary. |

## 10. Payment and enrollment separation

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 10.1 | Free training creates no payment entitlement fiction | VERIFIED | V1 training-enrollment/service tests assert only NMLS training RPCs, no Stripe/checkout/payment/compliance writers, and false credit eligibility. `database/022_training_enrollment.sql` and 025 provide separate training-origin constraints, but those SQL constraints were not executed here. |
| 10.2 | Shared Stripe payment/fulfillment architecture | BUILT | `netlify/functions/stripe-webhook.mjs`, checkout handler, `database/001_payments_enrollment.sql`, `database/009_stripe_integrity.sql`, `lib/stripe-contract.mjs`, `docs/payments/architecture.md`: raw-body signature verification, event claiming, paid-session fulfillment, and separate enrollment/access records exist. Success redirect is informational. Not an NMLS sale or executed real fulfillment. |
| 10.3 | Shared payment safety and event-contract checks | VERIFIED | V1 payment/Stripe-runtime tests and V2 `tests/stripe-integrity.test.mjs`, `tests/stripe-event-tooling-regression.test.mjs` pass local assertions. Setup/preflight now import the same 10-event contract as the handler. Mocks/static assertions do not verify account bindings or Stripe delivery. |
| 10.4 | NMLS commercial product, price, disclosures, and release workflow | MISSING | Current catalog has null price/approval numbers and closed regulatory enrollment; 025 seeds payment mode disabled. `config/nmls-training-definition.mjs`, `public/statecourse/data/course-catalog.json`, `nmls/README.md`. No NMLS-specific approved sellable offering/fulfillment acceptance package found. This is intentional for free training. |
| 10.5 | Actual checkout → signed webhook → entitlement → refund evidence | EXTERNAL PENDING | Shared infrastructure/runbooks exist in `docs/payments/activation-checklist.md` and `stripe-runbook.md`; September 13 handoff says actual sandbox acceptance remains pending. Requires authorized account/configuration and genuine transaction evidence; not exercised here. Current secret presence/mode is unknown. |

State separation observed in source: **payment ledger → purchase entitlement/access** is independent of **training progress → training assessment pass**; neither is **regulatory completion → certificate → NMLS credit banking/accepted report**. Refund status likewise does not itself rewrite earned educational records. No arrow is inferred solely from a redirect, a table existing, or a passing exam.

## 11. Completion logic

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 11.1 | Training terminal pass with explicit non-credit projection | VERIFIED | V1 training-service/admin/portal tests execute `passed` projection and preserve `creditIssuanceAllowed:false`, `nmlsCreditEligible:false`, `courseCompletionIssued:false`. All source modules and assessment rules precede pass; `staff_review_required` is distinct. `_lib/nmls-training-service.mjs`, `_lib/nmls-readiness.mjs`. |
| 11.2 | Training persistence and progress record | BUILT | Main 025 stores runtime, revision, audit events and portal resume state. It does not mark the generic enrollment completed or create a regulatory completion event. This is source inspection; SQL persistence skipped. |
| 11.3 | Approved CE completion/release authority | MISSING | No integrated decision combining exact approvals, verified identity, ROCS, eligible year/history, validated attendance, exam result and credit-release authorization found. Private assessment pass explicitly retains credit restrictions in `lib/nmls-final-assessment.mjs`; readiness always disables issuance. |

## 12. Certificates / completion records

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 12.1 | Generic completion/certificate data structures | BUILT | `database/002_regulatory_courses_reporting.sql` defines `course_completion_events` and certificate-number field; `database/006_california_timing_and_certificates.sql` implements California-specific work. These are not NMLS certificate generation. |
| 12.2 | NMLS certificate template, issuance, retrieval, correction, and attestation | MISSING | Source register CERTIFICATE records research about provider/course/learner/NMLS-ID fields and attestation, but no NMLS specimen/generator/issuance route or correction/reissue process found in NMLS/functions/public searches. Current training deliberately promises no certificate. |
| 12.3 | Actual NMLS course-completion/certificate evidence | MISSING | No genuine NMLS completion record or issued certificate artifact found. Training JSON and synthetic exam results cannot substitute; September 13 handoff explicitly disclaims regulatory certificates. |

## 13. NMLS reporting / credit release

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 13.1 | Banking requirement research | BUILT | Source register BANKING and `config/nmls/oss-policy.mjs` record a seven-calendar-day reporting target, completion-year attribution and NMLS-number need. This is retained research, not an operational scheduler or newly checked rule. |
| 13.2 | NMLS export/upload, reconciliation, exception handling and release ledger | MISSING | `database/002_regulatory_courses_reporting.sql` has generic reporting storage and Missouri reporting logic; no NMLS banking exporter/integration, accepted/rejected reconciliation, duplicate-credit control, correction workflow, or overdue queue found. `_lib/nmls-readiness.mjs` hard-codes `reportingEnabled:false`. |
| 13.3 | External NMLS banking access and acceptance | EXTERNAL PENDING | Reporting research exists, but actual provider/course approvals, authorized NMLS access and an accepted reporting response are not evidenced. `nmls/README.md` and September 13 handoff list banking acceptance as future work. |

## 14. Record retention

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 14.1 | Versioned source, runtime, and audit structures | BUILT | Main 025 defines immutable definition manifest, append-only training events and per-enrollment runtime; archived private migrations define actor/policy/ROCS/final history. Source pins and event tables are storage design, not proven live backup or retention. |
| 14.2 | Distinct retention requirements documented | BUILT | Source register RETENTION records five years from last course teaching/administration and a 14-day records-request response basis; `nmls/rocs-source-review.md` separately records five years from course start for ROCS. `config/nmls/session-policy.mjs` has a retention constant. These anchors are not interchangeable. |
| 14.3 | Operational retention, legal hold, backup/restore and retrieval evidence | MISSING | No NMLS retention schedule/enforcement, tested backup/restore, deletion/hold procedure, regulator export bundle or timed retrieval exercise found. `nmls/rocs-source-review.md` explicitly says the constant is not a retention/deletion schedule; private runtime contract lists retention/export as unfinished. |

## 15. Reviewer / regulator access

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 15.1 | Dedicated course-scoped reviewer provisioning | BUILT | `database/manual/nmls-review-accounts.sql` requires two distinct existing Auth identities, active owner authority, bounded 30-day new grants, no broader conflicting access, and no implicit role promotion/revival. It creates no Auth user/password. Legacy `scripts/provision-nmls-review-grant.mjs` is a different private-review provisioning tool. Neither was run. |
| 15.2 | Read-only regulator / interactive sample-student separation | VERIFIED | V1 training-service/endpoint/enrollment tests execute regulator snapshots with 45 lessons and formative options but no answer keys, learner grades, final selections or mutations; sample student follows non-credit gates. SQL enforcement and real account scoping were not exercised. |
| 15.3 | Actual reviewer accounts, login and acceptance | EXTERNAL PENDING | September 13 handoff explicitly leaves live learner/read-only reviewer acceptance pending; manual SQL still contains placeholders. Repository cannot establish whether accounts were subsequently provisioned, can sign in, or were accepted by a reviewer. |

## 16. Admin controls

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 16.1 | NMLS inventory/readiness and safe progress projections | VERIFIED | V1 `tests/nmls-admin-integration.test.mjs` executes actual source counts, exact identity checks, missing/unreadable/ambiguous data handling, false provider/credit/reporting flags, and content-free progress. `_lib/console-operations.mjs`, `_lib/nmls-readiness.mjs`. Database rows are fixtures. |
| 16.2 | Admin UI and versioned-source edit boundary | BUILT | `public/statecourse/admin/console/workspace.js`, `index.html`, `_lib/console-content.mjs` show NMLS readiness and make this curriculum read-only to generic California/Texas text overlays. Shared console governance/access/audit controls exist in migrations 019–023 and `docs/admin/administration-console.md`; no NMLS live action performed. |
| 16.3 | Generic editor refusal for NMLS source | VERIFIED | V1 `tests/nmls-admin-integration.test.mjs` executes `validateDraft` refusal `versioned_training_source_is_read_only`; cannot treat a generic overlay as an edit to pinned NMLS lessons/assessments. |
| 16.4 | NMLS operational closeout tools | MISSING | No NMLS application-submission tracker with receipts, identity exceptions, terminal-assessment adjudication, certificate reissue, or credit-banking reconciliation actions found. Readiness findings and generic admin tasks are not implementations of those workflows. `_lib/console-operations.mjs`, `_lib/nmls-readiness.mjs`, `nmls/README.md`. |

## 17. Authentication / password recovery / user accounts

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 17.1 | Shared accounts and session implementation | BUILT | `netlify/functions/_lib/student-session.mjs`, `student-register.mjs`, `student-session.mjs`, student registration/sign-in pages implement Supabase signup/login, profile synchronization, refresh and secure session cookies. NMLS uses this existing account system. A platform account is not NMLS identity authentication. |
| 17.2 | Password recovery/change and OAuth boundaries under mocks | VERIFIED | V2 `tests/account-security.test.mjs` and `tests/student-signin-recovery.test.mjs` execute same-origin enforcement, recovery-token validation, current-password verification, password change, session revocation response and recovery-route handling. `student-account.mjs`, `public/statecourse/student/password/password.js`, sign-in controller. No actual email or provider session was used. |
| 17.3 | Live registration, SMTP delivery, recovery, OAuth and session acceptance | EXTERNAL PENDING | `config/auth-email/README.md`, `account-security-setup.md`, confirmation/recovery templates and `docs/environment.md` document setup; current provider configuration and actual delivery are unknown. Requires external service/account acceptance, which this audit does not perform. |

## 18. Automated tests

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 18.1 | Executed focused local checks | VERIFIED | V1/V2 totals above: 685 pass, zero failures, 25 skips. Coverage includes source pins/structure, domain timing/assessment, mocked service/HTTP/client boundaries, admin projections, shared auth and payment checks. Each VERIFIED row states its narrower scope. |
| 18.2 | SQL and DOM test implementations | BUILT | 63 NMLS test files include actual-PGlite migration suites and Linkedom controller suites with explicit skip guards; `tests/helpers/nmls-*` provides fixtures. 23 SQL groups and two DOM groups skipped, so their enforcement/rendering is not currently verified. |
| 18.3 | Current whole-suite/build/packaged-function acceptance evidence | MISSING | `package.json`, `site/build.sh`, `scripts/audit-nmls-function-bundles.mjs`, and `scripts/smoke-nmls-function-bundle.mjs` provide commands/tooling, but were not run for this audit because builds generate/change other files. Prior build/ZIP totals in handoffs are not fresh artifact evidence. |

## 19. End-to-end verification

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 19.1 | Local service-level source-to-terminal traversal | VERIFIED | V1 `tests/nmls-training-service.test.mjs` executes the actual authored course and remediation with fake clocks/in-memory RPC. Confirms its logical non-credit path only; not full stack, actual database, browser, eight-hour attendance, or genuine identity. |
| 19.2 | Full browser/PostgREST/Auth/database learner and reviewer E2E | MISSING | No current executed evidence for signup → enrollment → all lessons → interruption/resume → assessment/remediation → terminal result using real browser and actual services. September 13 handoff leaves acceptance pending. Dedicated browser E2E npm/configuration was not found; DOM tests are simulations. |
| 19.3 | Approved CE end-to-end release and reporting proof | MISSING | No chain from genuine provider/course authority and identity through attendance, certificate and accepted NMLS banking exists in repository evidence. Private synthetic tests and free training deliberately stop short of that claim. `nmls/LEARNING-HTTP-CONTRACT.md`, `_lib/nmls-readiness.mjs`. |

## 20. Existing submission / provider-approval evidence

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 20.1 | Historical handoffs, runbooks and research evidence | BUILT | `docs/handoffs/nmls-source-recovery-2026-09-12/`, `docs/handoffs/nmls-free-training-2026-09-13/`, `nmls/INTEGRATION-READINESS-20260912.md`, `nmls/README.md`, design contracts and retained sources exist. They document engineering/checkpoint history, not NMLS filing or approval. |
| 20.2 | Submission receipts and regulator decisions | MISSING | No NMLS submitted application copy, filing confirmation, fee receipt, regulator correspondence/decision, provider certificate or exact course approval found in repository-wide documentation/submission searches. Prepared sources, application research, reviewer SQL and a deployment identifier do not prove submission. |
| 20.3 | Reproducible main-schema readback procedure | BUILT | September 13 handoff's `production-postcheck.sql` contains read-only checks for exact 025 identity/pins, privileges, closed gates and forbidden records. Handoff states migration/deploy readback occurred then. Procedure exists; this audit did not execute it or independently confirm the historical/current environment. |

### Historical documentation discrepancies and reconciliation

1. **Missing runtime/source and no public enrollment language is stale for free training.** `nmls/README.md` says no public self-enrollment and no deployment; older integration sections describe a missing remote source/runtime. Current `_lib/enroll-training-handler.mjs`, `student-nmls-training.mts`, public training UI, and main 025 implement free training. September 13 free-training handoff records an implementation/deploy checkpoint. This resolves a repository capability contradiction, not proof that today's deployment works. Approved CE remains restricted.
2. **Migration locations and numbering changed.** Older README/contracts/source-recovery manifest describe root `database/023_nmls_*` through 041 and collisions with main 023/024. Current private files are under `database/nmls-private/`; main uses `023_console_workbench.sql`, `024_texas_training_runtime.sql`, and independent `025_nmls_free_training.sql`. Old manifest paths must not be used as a current forward deployment list. No migration ran here.
3. **Stripe seven-event mismatch is fixed in source.** September 12 checkpoint says setup/preflight use seven events and correction exists only as a patch. Current scripts import `HANDLED_STRIPE_EVENTS` (ten); V2 regression tests pass. `docs/payments/architecture.md` still lists seven subscriptions. External webhook subscriptions remain unknown.
4. **Historical curriculum/final gaps are partly superseded.** `nmls/curriculum/annual-curriculum-blueprint.md` describes 335/385 minutes, missing 15 ethics minutes and independent finals outstanding. Current v3 comprehensive loader produces 400 provisional minutes, six guided ethics additions and private final forms; V1/V4 verify these structures. Older variant numbers can still be valid for those variants, but not current v3. Human timing/assessment acceptance is still absent.
5. **Question totals describe different scopes.** Blueprint/README's 147 manuscript items and 153 with additions cover broader national variants; current comprehensive delivers 123 unique formative items. The final-authoring tests still identify two explicit holds; current definitions select 50 out of 64 candidates, leaving 14 held/reserve/not selected for a given definition. Two explicit holds and 14 non-active candidates are not contradictory counts. Do not reuse a broader aggregate as the current course bank.
6. **HTTP and packaging claims are stale in older sections.** `nmls/final-assessment-contract.md` includes statements that no HTTP importer exists and final source is absent from Netlify included files. Current `student-nmls-learning.mts` imports the joint dispatcher, training handler imports its service, and `netlify.toml` includes four private candidate JSON files. This is server-only packaging, not public answer publication or a finished policy-bound CE browser flow.
7. **Missing linked research document.** The annual blueprint references `nmls/coverage-research.md`, which does not exist in this checkout. Actual agency research data is present in `config/nmls/ce-requirements-2026.json`; its contents must be cited directly instead of implying the missing narrative exists.
8. **Changing targets are not acceptance evidence.** September 12 checkpoint mentions a September 14 requested launch target; public mortgage copy now says October 2026 build target. Neither establishes an approval or release date. Similarly, historical 668/702 test totals and 604-file artifact scan concern different runs/artifacts; this audit reports only its own runs and source scan.

The September 13 handoff's production migration/deploy statements are **not disproved** by this audit, but are not independently verified. Its explicit outstanding browser acceptance is consistent with missing current E2E evidence. Its credential/configuration observations are historical and were not re-read from external services.

## 21. Known blockers

| ID | Capability or requirement | Status | Evidence and finding |
| --- | --- | --- | --- |
| 21.1 | Reconciled release evidence for the currently running environment | MISSING | `docs/environment.md` explicitly says deployed revision/bindings/service health are unverified. September 13 handoff gives a historical checkpoint only. No current inspected deployment, installed-schema evidence, real learner acceptance, or external account state was obtained. |
| 21.2 | Accountable review of regulatory research and operational assumptions | MISSING | `nmls/evidence/2026-09-13/ai-body-review.json` and evidence projector retain false human/legal signoff flags. Provider-chosen timing rules, certificate language, record-retention anchors, jurisdiction authority and course-year release need accountable review; tests cannot supply it. |

Prioritized launch blockers (cross-references to counted rows; “launch” here means commercial, credit-bearing NMLS education):

| Priority | Blocker | Evidence rows |
| --- | --- | --- |
| 1 | NMLS education-provider approval/account evidence and a reviewable applicant package are absent. | 1.2–1.3, 2.2, 20.2 |
| 2 | Exact course/version/year/delivery approval and corresponding official IDs are not established. | 3.3, 20.2 |
| 3 | Genuine individual NMLS-ID handling and BioSig vendor authentication/checkpoints are missing. | 8.2–8.4 |
| 4 | Genuine ROCS originals/uniform presentation and retained per-course learner agreement are unresolved. | 2.4–2.5 |
| 5 | Human SME/item review and representative learner-duration validation are absent. | 4.3, 21.2 |
| 6 | Policy-bound CE browser delivery and eligibility/history checks are not integrated; free training is not that path. | 5.3, 9.3 |
| 7 | Regulatory completion authorization, NMLS certificates and banking/reconciliation are missing. | 11.3, 12.2–12.3, 13.2–13.3 |
| 8 | NMLS retention/retrieval, backup/restore and operational exception/support procedures lack evidence. | 2.2, 7.5, 14.3, 16.4 |
| 9 | Actual learner/reviewer browser acceptance, live auth/recovery and current deployed-schema verification are absent. | 15.3, 17.3, 19.2, 21.1 |
| 10 | NMLS commercial product/disclosures and authorized actual Stripe fulfillment/refund acceptance are absent. | 10.4–10.5 |

For **free-training acceptance**, approval/payment/credit gaps are not authorization to activate those features. The immediate unresolved evidence is actual learner/reviewer access, browser learning/recovery behavior, current schema/deployment, and truthful non-credit operation. For a **multi-state or 2027 offering**, add the state/year content gaps in 3.4; national training does not satisfy those scopes by itself.

## 22. Launch-critical missing items

This section consolidates, without double-counting, the missing deliverables already classified above:

- Applicant/organization evidence, provider application and NMLS-specific administrative policies: 1.3, 2.2, 20.2.
- Per-course ROCS presentation/consent/export evidence and genuine identity/NMLS-ID implementation: 2.5, 8.2, 8.4.
- Human content/item/timing evidence and accountable regulatory interpretation: 4.3, 21.2.
- Integrated policy-bound CE learner flow, eligibility and history verification, terminal-failure adjudication: 5.3, 9.3, 7.5.
- Regulated completion decision, certificate, banking exporter/reconciliation and operations: 11.3, 12.2–12.3, 13.2, 16.4.
- Retention/hold/retrieval/backup evidence: 14.3.
- Commercial product/disclosure workflow and real transaction acceptance: 10.4–10.5.
- Current database/browser/packaged artifact/deployed acceptance evidence: 18.3, 19.2–19.3, 21.1.

No launch board was created and no discovered gap was fixed.

## Historical handoff reconciliation — 2026-09-10

Reconciled on 2026-09-19 against the same current revision recorded above. Historical evidence was read with `git show` from **`6fa9c94740123e369578439f871eca6af702f864`** (`handoff/nmls-cross-chat-20260910`), without checkout, merge, fetch, or external access:

- **R:** `docs/handoffs/nmls-cross-chat-2026-09-10/README.md` at that commit.
- **C:** `docs/handoffs/nmls-cross-chat-2026-09-10/claude-completion-report.txt` at that commit, read in full; later report.
- **P:** `docs/handoffs/nmls-cross-chat-2026-09-10/claude-predecessor-report.txt` at that commit, read in full; earlier report.

These are Git-object paths, not claims that the historical folder exists in the current working tree. R explicitly gives C precedence over P where they differ. Repeated assertions and the reports' exploratory steps are grouped into **36 material claims** below; superseded intermediate diagnoses are not treated as additional independent facts. “COMPLETED SINCE HANDOFF” means the specified implementation gap is now built or narrowly verified, not that a course, deployment, or regulatory launch is complete. Changes already resolved by C are classified SUPERSEDED for P's old gap, not misdated as subsequent work.

| Reconciliation classification | Claims |
| --- | ---: |
| STILL CURRENT | 13 |
| SUPERSEDED | 6 |
| COMPLETED SINCE HANDOFF | 4 |
| HISTORICAL CLAIM — NOT CURRENTLY VERIFIABLE | 12 |
| CONTRADICTION | 1 |
| Total historical claims reviewed | 36 |

These reconciliation categories and counts are separate from the original **75 capability items** and their BUILT / VERIFIED / EXTERNAL PENDING / MISSING classifications. None of those classifications is downgraded by an older report.

### Still-current findings

Each row in this table is **STILL CURRENT**, at the explicitly stated repository scope.

| Claim | Historical assertion / source | Current evidence and determination |
| --- | --- | --- |
| H01 | R, NMLS boundary: a Mortgage doorway or merged real-estate work does not authorize NMLS launch or prove approval. | `config/nmls-training-definition.mjs` retains null provider/course approvals and false credit eligibility; `public/statecourse/mortgage/index.html` explicitly distinguishes free training from regulatory education. Audit 1.2, 3.3 and 11.3 remain unchanged. |
| H02 | R/C/P: Georgia merged through `5513c04`; Florida through `6b227b2`. | Local Git ancestry checks find both commits and source tips `65429c0` / `d96c54d` in current HEAD history. `georgia/`, `florida/`, and `config/florida/` retain their source work. This establishes source inclusion, not deployment or regulator acceptance. |
| H03 | P, merge summary: Georgia/Florida merges were additive and did not change existing public/build/worker/database files. | First-parent diffs of `5513c04` and `6b227b2` show respectively 18 and 278 added files, no modifications, and no paths under `public/`, `site/`, `worker/`, or `database/`. This is a verified historical diff property; later changes are separate. |
| H04 | R/C/P: do not merge the older `relay-texas` curriculum over the fuller main line. | `9e79bfd` is not an ancestor of current HEAD; its LOC curriculum tree has two module files, while current `texas/tx-law-of-contracts-30-v1/curriculum/` has eleven. Selective archive commit `41b5294` is an ancestor. The preservation rationale still applies; no current remote-branch state is inferred. |
| H05 | C, archive transfer: 86 additions, including 42 form PDFs, nine statute chapters, four Business Organizations chapters, application materials and reusable scripts/registers. | `git diff-tree` for `41b5294` shows 86 additions and ten modified supporting files. Current catalogs under `texas/tx-law-of-contracts-30-v1/sources/{forms,statutes,business-organizations}/` list 42/9/4 entries. Fresh local SHA-256 and byte-size checks passed for all 55. `texas/submission/provider-application/`, three acquisition scripts and two LOC read registers remain. These are Texas materials, not an NMLS application. |
| H06 | C, source-only freeze break: archive transfer did not change LOA course wording. | `git diff --name-only 41b5294^ 41b5294 -- texas/tx-law-of-agency-30-v1/curriculum` is empty. Supporting freeze/config/test files changed, as the report says. This does not assert that no later curriculum edit occurred. |
| H07 | C: archive exception applies only to EIN-shape heuristics; key-pattern scanning remains global. | `tests/stripe-setup-tooling.test.mjs` has an `exemptArchivedSources` flag only on the EIN heuristic and keeps key signatures outside that exemption. Source implementation remains; the report's injected-key experiment was not rerun here. |
| H08 | R/C: California mis-render diagnostic and recorded 524/444/434 page counts exist; 458-page Principles archive is distinct. | `tests/california-instructional-volume.test.mjs` compares measured PDF pages with recorded values and reports font/renderer drift. `california/print/current-build.json` retains 524/444/434 and a separately identified 458-page archive. This verifies document/code presence, not today's regenerated pagination. |
| H09 | R/C: corrected Texas rule descriptions retain source tier, unresolved cross-reference conflict and approval limits. | `public/statecourse/data/state-registry.json`, `config/texas/trec-rules-source-lock.mjs`, and held `texas/trec-sources/trec-rules/535.62.txt` / `535.65.txt` preserve the exam/retake/identity/retention wording, TREC reproduction / TRD-202601975 provenance, unread adopted text, source-lock limitation and (b)(7)/(b)(8) disagreement. Fresh `tests/texas-registry-rule-claims.test.mjs` passes. This is comparison to retained sources, not new legal research. |
| H10 | R/C/P: citation-auditor blind spot (#44) remains separate work requiring deliberate freeze handling. | `scripts/lib/tx-claim-audit.mjs` still anchors the generic Texas section extraction on `§`; `texas/tx-law-of-agency-30-v1/HANDOFF.md` explicitly preserves the prose-form limitation and cross-course freeze concern. No external issue status was queried. |
| H11 | R: Georgia regulator follow-up remains a separate external-status question. | `georgia/HANDOFF.md` retains external GREC/GNPEC decisions and no asserted approvals; local inquiry drafts are not subsequent decisions. Current external correspondence cannot be determined here. No NMLS approval follows from Georgia work. |
| H12 | R: Texas video production is separate from NMLS status. | `config/texas/law-of-agency-screen-media.mjs`, Texas video plans and current freezes concern Texas placements. `config/nmls-course-identity.mjs` identifies a separate mortgage training course. Texas video progress cannot establish NMLS media acceptance or credit eligibility. |
| H13 | P: Florida filing/foreign-entity and protected assessment authoring materials exist, with public-build leakage controls. | `florida/submission/`, `config/florida/`, and shared privacy checks in `site/build.sh` / `tests/no-answer-key-published.test.mjs` remain repository artifacts; the build does not copy the private Florida trees wholesale. Their existence is not filing, an approved final bank, or a freshly inspected built/deployed artifact. |

### Work completed since the handoff

Each row is **COMPLETED SINCE HANDOFF**, limited to current repository implementation and the original audit's explicitly scoped verification.

| Claim | Historical gap / source | Current evidence and limit |
| --- | --- | --- |
| H14 | R/P: mortgage category empty; no NMLS course; doorway only describes future development. | One actual national free-training identity/version now connects `public/statecourse/data/course-catalog.json`, `config/nmls-course-identity.mjs`, private manuscripts and main `database/025_nmls_free_training.sql`. The mortgage page now describes that training. Audit 3.1/4.1 and V1/V4 verify source identity and 8 modules/45 lessons; no approved course is inferred. |
| H15 | R/P: no NMLS enrollment. | Authenticated, governance-gated **free-training** enrollment now exists in `_lib/enroll-training-handler.mjs`, `_lib/training-access.mjs`, training RPC source and portal projection. Audit 9.1/10.1 tests the mocked boundary and separation from payments. Paid/regulatory enrollment remains closed. |
| H16 | R/P: no NMLS learner course behind the public doorway. | `public/statecourse/student/nmls-training/`, `student-nmls-training.mts`, and `_lib/nmls-training-service.mjs` now supply lesson progression, quizzes, first final, targeted remediation, second final and saved non-credit result. Audit 7.3/11.1/19.1 verifies a simulated service traversal; SQL/browser/deployed acceptance remains unverified. |
| H17 | R/P: Mortgage/NMLS has only a development-status surface, not an integrated course record. | `_lib/nmls-readiness.mjs`, `_lib/console-operations.mjs`, and admin `workspace.js` now reconcile actual curriculum, pinned definitions and training progress. Audit 16.1/16.3 verifies fixture-backed readiness and editor refusal. This is additional administration implementation, not proof of external approval. |

### Superseded findings

Each row is **SUPERSEDED**. Resolved precursor findings remain historical context rather than current blockers.

| Claim | Historical assertion / source | Current evidence and determination |
| --- | --- | --- |
| H18 | R/C: current LOA video/content freezes are September 11 v12/v16. | Current `video-plan-freeze.json` and `content-freeze.json` are September 13 **v15/v19**, with later dependency/media history. The old IDs identify an earlier checkpoint, not today's freeze. No freeze files changed during this audit. |
| H19 | P: four California document tests remain broken; initial C investigation suspects incorrect metadata/documents. | C itself retracts the document diagnosis after its font investigation; `882ee79` adds the diagnostic retained in `tests/california-instructional-volume.test.mjs`. The precursor gap cannot be carried forward as four observed current failures. Actual regenerated PDFs/full suite were not rerun, so current rendering success is not asserted. |
| H20 | P: 89 useful Texas files still need selective transfer (initially described as 43 form PDFs). | C and `41b5294` resolve the transfer with **86 additions**, omitting three obsolete code files; catalogs establish **42 form PDFs**. Current archive checks support that final inventory. This was already resolved by the later report, not newly completed after the dated handoff. |
| H21 | P: current public Texas registry still says rule text could not be opened. | `508ec8b` changes the three public rule fields and adds `tests/texas-registry-rule-claims.test.mjs`; both source and fresh tests retain the correction. The adopted-text limitation remains, but blanket absence of retained rule text does not. |
| H22 | P: branch rule wording can be characterized as read “final” text. | C explicitly corrects that interpretation. Current `config/texas/trec-rules-source-lock.mjs` and registry retain the lower-tier TREC reproduction and unread adopted text. Treat P's stronger wording as superseded by C, not as authority or an NMLS requirement. |
| H23 | P: the current product inventory is zero open enrollments out of 30 courses with an empty mortgage category. | The exact historical inventory is no longer the current catalog: it includes the national mortgage course and a separate free-training route. `public/statecourse/data/course-catalog.json`, main 025 and `_lib/training-access.mjs` distinguish free training from closed regulatory enrollment. This does not imply any approval or paid enrollment was opened. |

### Contradictions

| Claim | Classification | Historical assertion / source | Current evidence and determination |
| --- | --- | --- | --- |
| H24 | CONTRADICTION | R and C list #43, the Texas `screenMedia` hook, as remaining work; C/P say it was not touched. | “Not touched by this merge” can be true, but the implied implementation gap is false: **both historical `6fa9c94` and current** `scripts/lib/generate-tx-block-maps.mjs` contain `validateScreenMedia` and generator integration. Current `tests/texas-video-integration.test.mjs` passes, and the Texas HANDOFF dates the hook's resolution to September 7. Thus this is not work completed since September 10. It does not prove the external issue was closed or that all videos were installed. |

### Claims not currently verifiable

Each row is **HISTORICAL CLAIM — NOT CURRENTLY VERIFIABLE**. A reported observation is preserved without promoting it to today's runtime evidence.

| Claim | Historical assertion / source | Why current checkout cannot establish it |
| --- | --- | --- |
| H25 | P: all other named workstream SHAs matched the owner's summary, branches were zero ahead, and Florida/Georgia/Texas were 16/3/8 ahead. | Local ancestry supports H02, but the owner's exact comparison snapshot and then-current remote/local branch states were not independently reproduced. Present source files do not validate every reported ahead count or cross-computer summary. |
| H26 | R/C/P: production successively served `7a5cae8`, `6b227b2`, then `508ec8b`, with stated build times and HTTP-observed deployment identity. | Git retains those commits, not a current HTTP observation. `site/build.sh` implements `build.json`; `docs/environment.md` leaves deployed revision unverified. Later handoffs give newer checkpoints, also historical. No current serving SHA, hostname routing or Cloudflare-fronting claim is made. |
| H27 | P: every push to main automatically deploys Netlify. | `netlify.toml` establishes build/publish configuration, but not current provider trigger/branch settings. Temporal proximity of a reported push/deploy does not establish an enduring automatic-deployment rule. |
| H28 | R/C/P: homepage, mortgage, sign-in, registry, courses, practice and console returned HTTP 200. | Routes/assets exist, but HTTP availability and page content on the live host were not observed here. Historical 200 responses cannot verify current runtime or rendered behavior. |
| H29 | P/C: negative login response proves login works and the Supabase fix survived. | `_lib/student-session.mjs` and audit V1/V2 supply local implementation/mocked checks. A reported 401 proves at most that historical request's rejection, not successful signup, authenticated login, refresh, recovery, or today's service health. The broader successful-login inference is unsupported. |
| H30 | P: unauthenticated admin requests returned 401; private playback/transcripts returned 403; intro video returned 200/32 MB; live CSP matched resources. | Auth/video/CSP code exists, but these are historical external-response claims. No live requests, media playback, CSP browser acceptance, or exhaustive “all admin endpoints” check occurred in this reconciliation. |
| H31 | P/C: live `productionPaymentsEnabled:false`, Stripe test mode, Texas development status/null approval and no approved states. | Catalog defaults and release gates are source evidence; current provider settings and database governance are not. Audit 10 and `docs/environment.md` preserve that distinction. A historical gate response cannot authorize a current payment or establish all live approval records. |
| H32 | P/C: actual builds passed and test progression reached 1,591/1,587, then 1,592/1,592, finally 1,597/zero failures, with public artifact guards passing. | Reports describe earlier executions. Current audit V1/V2 has a different focused test scope; no full build/suite rerun was performed. Current source guards do not prove historical test logs or current packaged output. |
| H33 | C: installing full DejaVu reproduced 524/444/434, preserved original hashes, and negative font/key-injection experiments behaved as reported. | Diagnostic/scanner code and metadata exist (H07/H08), but the original environment, generated PDF bytes and experiment observations were not reproduced. No fonts installed, print outputs regenerated, or secret-scanner injection performed. |
| H34 | C's investigation refers to hashes identifying volumes actually sent; later summary describes volumes prepared for submission. | `california/print/CURRENT_REVIEW_COPY.md`, `current-build.json` and submission materials are preparation/version evidence, not a regulator receipt. The stronger “sent” wording cannot establish a DRE filing, and neither wording establishes any NMLS submission/approval. Audit 20.2 remains MISSING. |
| H35 | R/P: the local `nmls-ce-launch-20260910` workstream was untouched and excluded from that production deployment. | Preserved historical trees and merge diffs provide source scope; they cannot establish another machine's local worktree or the exact external deployed bundle. Current NMLS integration is separately evidenced; old exclusion must not be applied to today's implementation. |
| H36 | P: headless rendering failed because of the sandbox proxy, so live-browser acceptance was not performed. | The report explicitly supplies no successful rendered acceptance. Its exact proxy failure cannot be reproduced from current source, and static CSP comparison cannot replace browser E2E. Audit 19.2 still lacks current browser acceptance evidence. |

**Verification for this reconciliation:** local Git object/ancestry/diff reads; 55 archive hash-and-size matches; `node --test tests/texas-registry-rule-claims.test.mjs tests/texas-video-integration.test.mjs` returned **16 passed, 0 failed, 0 skipped**. These additional tests concern the historical Texas claims only and do not upgrade NMLS runtime verification. They are separate from the original V1/V2 totals. No acquisition scripts, builds, external requests, or migrations were executed.

**Effect on the ten launch blockers: none changed.** H14–H17 confirm capabilities already credited by the current audit. The #43 contradiction removes a stale Texas implementation-gap description, not an NMLS blocker. No historical report supplies a documentary NMLS filing/approval, genuine identity/ROCS integration, human duration validation, certificate/banking implementation, or current end-to-end acceptance. The original 75-item totals remain **18 BUILT, 24 VERIFIED, 8 EXTERNAL PENDING, 25 MISSING**.

### What the repository alone cannot determine

- Whether the organization has an NMLS account, submitted privately, paid fees, received correspondence, or obtained an approval not saved here; the null repository IDs cannot decide external facts.
- Which revision is currently deployed, which migrations actually ran, current database privileges/rows, enrolled students, reviewer grants, actual runtime error rates, or whether private archived migrations are installed anywhere.
- Current Netlify/Supabase/Stripe/SMTP/vendor account configuration, credentials, payment mode, webhook subscriptions or actual checkout/refund/identity/email behavior.
- Whether a real learner attended, understood the content, took the claimed time, is the asserted person, completed outside-provider courses, or received NMLS credit.
- Current authoritative regulatory requirements, instructor/applicant eligibility, human content/legal acceptance, or permission to operate in each jurisdiction. Retained citations and AI review are not current legal clearance.
- Whether media reported outside the repository was accepted/installed, whether a real browser is accessible across devices, or whether records can actually be restored/exported within a required deadline.

### Change and verification boundary

Only `docs/compliance/nmls/CURRENT-STATE.md` was created. Application code, tests, migrations, configuration, content and existing documentation were left unchanged. Final local checks confirmed all 22 sections, 75 unique classified rows with one allowed status each, matching classification totals, and exactly this one untracked repository file with no tracked changes. Referenced explicit evidence paths were checked; the deliberately documented missing `nmls/coverage-research.md` is the only missing concrete path detected. Document whitespace checks passed. No commit, push, merge, deploy, external submission, message, production mutation, or fix was performed.
