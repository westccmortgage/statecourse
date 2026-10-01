# NMLS Launch Board

Last verified: 2026-09-19. Launch target: October 2026. Baseline: [CURRENT-STATE.md](CURRENT-STATE.md).

The initial NMLS account/access request was submitted approximately 24 hours before this board was created. NMLS advised that temporary login/password information may take approximately 48 hours. Account access is therefore **WAITING EXTERNAL**, not missing. This request is **not** provider approval and **not** course approval.

Status key: **VERIFIED** = narrowly verified evidence; **BUILT** = repository implementation exists; **PARTIAL** = some evidence exists; **WAITING EXTERNAL** = dependent on an outside party; **MISSING** = required evidence or implementation absent; **BLOCKED** = launch cannot pass.

| Gate | Status | Already built | Verified | Missing | External dependency | Evidence | Next action | Launch blocking | Last verified |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. NMLS account/access | **WAITING EXTERNAL** | Access request submitted | Owner-confirmed request and NMLS 48-hour guidance | Temporary login/password and account read-back | NMLS account team | Owner confirmation, 2026-09-19; no approval artifact | Wait through stated window, then verify credentials/account identity | **YES** | 2026-09-19 |
| 2. Provider application package | **PARTIAL / MISSING** | Official-source archive, engineering contracts, research, supporting policy work | Audit evidence-integrity checks | Assembled current forms, signed attestations, applicant/instructor dossier, fee receipt, final operational policies | Gate 1; later NMLS review | CURRENT-STATE §§1–2, 20–22 | Build one reviewable package; do not submit without owner approval | **YES** | 2026-09-19 |
| 3. BioSig access and integration | **WAITING EXTERNAL / MISSING** | Identity and session-control concepts; authenticated actor binding | Local actor-binding tests only | BioSig access, BioSig ID, vendor authentication, runtime checkpoints, acceptance evidence | NMLS account/access first; BioSig | CURRENT-STATE §§6, 8, 21–22 | After Gate 1, obtain BioSig ID; then implement and test runtime integration | **YES** | 2026-09-19 |
| 4. ROCS / learner agreement | **PARTIAL / MISSING** | Session-policy contract and receipt-bound agreement model | Retained evidence checks identify unresolved originals | Genuine current ROCS/FAQ originals, complete presentation, affirmative consent, per-course retained agreement/export | NMLS source availability and accountable review | CURRENT-STATE §2 | Acquire official originals; finalize presentation, consent, retention, and export design | **YES** | 2026-09-19 |
| 5. Course content / human review / duration validation | **BUILT / MISSING ACCEPTANCE** | 8 modules, 45 lessons, assessment banks, 400 provisional minutes, traceability | Structure/content-loader tests; audit totals | Human SME/item signoff and representative learner duration study | Qualified reviewers and test learners | CURRENT-STATE §§3–5, 7, 21 | Assign reviewers; execute documented content, item, legal, and duration acceptance | **YES** | 2026-09-19 |
| 6. Course submission and approval | **NOT SUBMITTED / NOT APPROVED** | Draft course portfolio and planning records | Null provider/course IDs and closed enrollment verified | Final approved version, submission receipt, NMLS course number, approval decision | Gates 1–5; NMLS review | CURRENT-STATE §§3, 20–22 | Freeze approved candidate only after prior gates; owner approves submission separately | **YES** | 2026-09-19 |
| 7. Regulated LMS delivery compliance | **PARTIAL / MISSING** | Free non-credit learner path; private CE-policy engines; timing/progression controls | Narrow local unit/service tests | Integrated approved-course browser flow, eligibility/history checks, genuine identity/ROCS, production acceptance | Gates 3–6 | CURRENT-STATE §§5–9, 19 | Build regulated path only after IDs/policies exist; keep free training separate | **YES** | 2026-09-19 |
| 8. Student NMLS ID / identity handling | **PARTIAL / MISSING** | Authenticated session actor binding | Endpoint tests with mocked auth/DB | Individual NMLS ID validation, BioSig binding, retained identity evidence, operational exception handling | Gate 3 | CURRENT-STATE §8 | Define verified NMLS-ID intake and BioSig-linked audit record | **YES** | 2026-09-19 |
| 9. Assessment / completion authority | **BUILT / MISSING AUTHORITY** | Formative/final/remediation engines and private policy chain | Local assessment tests | Authorized regulatory completion decision, terminal-failure adjudication, approved rules and deployed persistence evidence | Course approval; human policy approval | CURRENT-STATE §§7, 11 | Define accountable completion authority and exception workflow; validate against approved course | **YES** | 2026-09-19 |
| 10. Certificate / reporting / credit banking | **MISSING** | Generic reporting/database concepts | No NMLS regulatory issuance/banking acceptance | NMLS certificate, reporting export, credit banking, reconciliation, accepted operational evidence | Course/provider approval and NMLS reporting access | CURRENT-STATE §§12–13, 22 | Design after official IDs/rules; test reconciliation before launch | **YES** | 2026-09-19 |
| 11. Records / retention / operational procedures | **PARTIAL / MISSING ACCEPTANCE** | Event/audit concepts and draft contracts | Some local immutability/trace checks | NMLS-specific retention/retrieval, backup/restore proof, complaints/support, exception and incident procedures | Accountable operations review | CURRENT-STATE §§2, 7, 14, 16, 22 | Consolidate SOPs and perform retrieval/restore tabletop acceptance | **YES** | 2026-09-19 |
| 12. Stripe commerce readiness | **VERIFY / NOT LIVE** | Shared checkout, signed webhook, ledger, entitlement, refund architecture | Local code tests only; historical sandbox report | Current account/config read-back, NMLS product/price, full sandbox E2E, refund/duplicate evidence | Authorized Stripe test access; owner price; Gate 6 before sale | [Stripe Readiness](../commerce/STRIPE-READINESS.md); CURRENT-STATE §10 | Reconcile test objects and run approved sandbox acceptance; keep live off | **YES** for paid launch | 2026-09-19 |
| 13. Learner / reviewer end-to-end acceptance | **MISSING** | Learner and reviewer surfaces | Service tests and source artifact scan | Real browser learner/reviewer flow, auth/recovery, persistence, accessibility, deployment/schema evidence | Test accounts, approved environment, completed gates | CURRENT-STATE §§15, 17, 19, 21 | Execute scripted learner and reviewer acceptance with observed evidence | **YES** | 2026-09-19 |
| 14. Production launch | **BLOCKED** | Non-credit training capability exists | No commercial credit-bearing launch acceptance | All prior blocking gates, owner launch approval, verified production readiness | NMLS/BioSig/Stripe decisions and owner authorization | This board and CURRENT-STATE | Keep regulated enrollment, payment, completion, certificate, and credit off | **YES** | 2026-09-19 |

## Required state separation

`payment` → `payment entitlement` → `course enrollment` are separate from `course completion` → `regulatory completion` → `certificate` → `NMLS credit`.

The free training course is non-credit and must never be represented as approved NMLS CE. Payment or enrollment must never directly grant completion, regulatory completion, a certificate, or NMLS credit.

## Unified Admin adapter — 2026-09-19 local implementation

The existing console reads validated NMLS attempts instead of CA/TX blocks: 45 lessons, 8 modules, phase, safe final-attempt summaries, remediation and training completion. Source snapshots and activity reject invalid histories. Credit, certificates and reporting remain independently closed. The common media index includes 45 NMLS instructional targets and uses the existing signed Stream overlay; no asset was uploaded or marked playback-verified. Reviewer access uses the existing NMLS course/version grant and can be revoked without granting a Team role. [Acceptance record](../../admin/UNIFIED-ADMIN-ACCEPTANCE.md). Production migration/deployment and live-account acceptance are still required; no launch gate above is closed by local tests.

## SAFE PE foundations — public practice slice, 2026-09-30

**BUILT / PENDING RELEASE.** PE01 and PE02 are two substantial public foundation modules from a planned national 20-hour SAFE PE course. They are not the complete course and do not carry NMLS provider/course approval, validated instructional hours, enrollment, credit, a certificate, or completion reporting. The planned qualifying course still requires the remaining curriculum, independent SME/item review, genuine instructor/peer interaction, validated delivery and timing, protected assessment, and applicable approvals. This entry does not close any regulated-launch gate above or re-verify the historic external-access statuses.

The existing free-practice engine now has a separate `national-safe-pe-foundations` collection: 16 explained formative questions and 10 activities with 39 tasks across role/authority, licensing sources, mortgage calculations, and security/lien cases. Public practice remains free before, during, and after paid enrollment, without an account or checkout. Written responses are explicitly self-review. No instructor answer guide or protected CE/final question inventory is used as a public source.

Source and verification record: [PE foundations practice release](../../engineering/pe-foundations-practice-2026-09-30.md). The existing CE training identity, approval fields, authentication, payments, timers, and completion authority are unchanged. Production release and live-browser acceptance are separate from local implementation and require the controlled release described in that record.

## PE03/PE04 expansion — local candidate, 2026-09-30

**REVIEWED / PUBLIC PREVIEW UPDATE AUTHORIZED.** The next candidate expands the same public foundation collection to PE01–PE04: four lessons, 40 formative questions, 16 activities and 70 tasks. The new 24 questions retain all 96 authored option-level explanations; six new cases add 13 written self-review tasks and 18 independently checked numerical tasks. No private instructor package is imported. Each new module's 150 proposed elective minutes remain unvalidated.

The four-module diff has been reviewed and authorized to update the same public PR23 preview; `6a7aab9a9ffae03e441975e76281511cbefbef1d` is its prior two-module revision. Exact new-head and rendered acceptance are recorded in the release evidence. Production remains blocked on preservation of the separate live owner-OAuth overlay. This expansion changes no authentication, enrollment, payment, study-time, completion, certificate, approval or credit authority. Available practice remains free before, during and after paid enrollment. The full 20-hour course, remaining curriculum and genuine instructor/peer delivery are not complete.

See [PE03/PE04 integration record](../../engineering/pe-foundations-expansion-2026-09-30.md) for source provenance, validation, exact scope and release limits. This entry does not close any regulated-launch gate above.

## PE05/PE06 expansion — local candidate, 2026-09-30

**BUILT / REVIEWED / PUBLIC PREVIEW UPDATE AUTHORIZED.** PE05 Federal Mortgage Law and PE06 Ethics and Consumer Protection expand the candidate to six lessons, 76 formative questions, 25 activities and 99 tasks. The 36 new questions retain 144 option-level explanations; nine new cases add 20 written self-review tasks and nine independently checked numeric tasks. All 55 source identifiers resolve to public student citations, and the July 2026 Regulation B scope wording is preserved. Each module's 150 proposed minutes remains unvalidated. No instructor guide or protected final is imported.

The reviewed four-module revision is `42871e88cea8bd1c25ee7b0f9f420d748527ed56`; publication of the six-module candidate is authorized only to the same PR23 preview. Exact updated-head/deploy and rendered acceptance are retained in the release evidence. Focused checks (89 Node and two DOM), both builds and the privacy scan pass. Aggregate tests retain the same 57 baseline/fixture failures and 27 skips, so full CI is not green. Production remains held on exact preservation of the manual owner-OAuth deployment. No regulated-launch gate, authentication, payment, credit or completion authority changes. Practice remains free before, during and after paid enrollment. The full 20-hour curriculum, genuine OIL delivery and acceptance are still incomplete.

See [PE05/PE06 integration record](../../engineering/pe-law-ethics-expansion-2026-09-30.md) for provenance, scope, results and release limits.

## PE07/PE08 expansion — reviewed candidate, 2026-09-30

**BUILT / REVIEWED / PUBLIC PREVIEW UPDATE AUTHORIZED.** The local public draft now contains eight lessons, 100 formative questions, 33 activities and 151 tasks. PE07 Nontraditional Mortgage Products and PE08 Integrated Mortgage File Decisions add 24 original questions with 96 option explanations, 32 numerical tasks and 20 written self-review tasks. Independent review checked all new keys, references, rubrics, calculations and four calendar sequences; the Fannie Mae classroom-LTV versus delivery-rounding distinction was corrected before publication review.

PE07 and PE08 each have 100 proposed, unvalidated minutes. The eight-module design budget is 1,000 proposed minutes with 3 federal-law, 3 ethics, 2 nontraditional and 12 elective education-hour equivalents. This is not measured study time, accepted category allocation, approval or a qualifying 20-hour offering. Genuine OIL interaction, human SME/accessibility acceptance, timing validation, protected assessment and applicable approvals remain missing gates. Public practice awards no hours, credit or certificate and stays free before, during and after paid enrollment.

The preceding six-module public preview is `5ce2e3aff619721b73910453708390ba0f20a2ce`. The eight-module update is authorized only for the same PR23 preview; exact updated-head/deploy and rendered acceptance are retained in the release evidence. The eight-module candidate passes 91 focused Node tests, two DOM tests, both builds and the privacy scan. Aggregate tests still have the same 57 baseline/fixture failures and 27 skips; full CI is not green. No auth, backend, CE, Netlify configuration, payment or completion-authority changes. Production remains held on preserving the separate manual owner-OAuth deployment. This entry closes no regulated-launch gate above.

See [PE07/PE08 integration record](../../engineering/pe-product-file-expansion-2026-09-30.md) for exact scope, source integrity, privacy boundaries and validation limits.

## PE03 document evidence lab — preview candidate, 2026-10-01

**BUILT / PUBLIC PREVIEW CANDIDATE.** A supplemental PE03 lab adds ten fictional source excerpts, sixteen evidence tasks, thirty-six distinct numeric checks and two alternative evidence paths to the existing eight-module public practice. It adds no module or proposed instructional minutes. Original lessons, quizzes and cases remain unchanged. Browser-local submitted versions support learner revision; no instructor, peer, timing, identity or completion service is represented.

The candidate is limited to the existing PR23 preview and includes the explicit Read-mode link correction. Qualifying OIL delivery, actual timing, human acceptance, protected final assessment and regulatory approval remain separate open gates. Production, CE, owner OAuth, payments and all credit authority remain unchanged. Aggregate tests retain the same 57 known failures and 27 skips; full CI is not green.

See [PE03 evidence-lab implementation and remaining OIL work](../../engineering/pe-evidence-lab-2026-10-01.md). This entry closes no regulated-launch gate above.

## PE03 private cohort evidence — local-only trial, 2026-10-01

**SOURCE PRESENT / LOCAL PASS / DISABLED / NONCREDIT.** A separate PE03 definition, default-off private cohort/API, server observation sample and immutable learner → distinct peer → assigned instructor → learner revision chain are available for parent review. Draft SQL was executed only in embedded PGlite with synthetic identities and modeled prerequisites. Twenty focused tests and the JSDOM/local-HTTP/PGlite flow pass. Technical samples of approximately 39 seconds per learner do not validate lesson duration or a 20-hour course.

No publication, live migration, approval, credit, certificate or banking authority is established. Real rendered Chromium was blocked by the local socket sandbox; actual-schema/hosted-auth verification, native concurrent PostgreSQL acceptance, cumulative OIL policy, timing study, human SME, protected PE final and regulatory gates remain open. Public free practice, CE/OSS and the owner-OAuth overlay are unchanged. Aggregate failures remain the same 57 known identities; full CI is not green.

See [local cohort implementation and acceptance limits](../../engineering/pe03-private-cohort-local-2026-10-01.md). This entry closes no regulated-launch gate above.

### PE03 instructor correction and isolated CI proposal — 2026-10-01

The initial local cohort candidate is **superseded/local-incomplete**: it failed closed when real staff fresh-action authentication lacked required request metadata/client integration. The narrow new-handler/page correction passes 27 focused tests, including consumed-proof rejection and instructor lost-response recovery with a fresh proof and one immutable feedback event. Existing auth/OAuth and CE code were not changed. The isolated native PostgreSQL/Chromium workflow is prepared but has **not run**; neither environment-limited gate is closed. All enablement and credit flags remain off. See [correction evidence and CI review scope](../../engineering/pe03-isolated-ci-proposal-2026-10-01.md).


### Verified PE03 acceptance and 25-unit extension — 2026-10-01

The earlier PE03 native/browser pending entries above are superseded for the bounded PE03 slice by successful isolated run36853453698 at147cfe8faddd7308cdc56e64af0bfb354f575200. That result remains default-disabled/noncredit and does not close hosted Auth, timing, human review or regulated-launch gates.

A separate private25-unit teaching workbench now passes local embedded PostgreSQL/service/HTTP and DOM acceptance. It preserves the eight lesson manuscripts, links course-wide roster authority and per-unit teaching chains, and reconciles scoped time/category exports. The protected final remains locked and all credit/certificate/banking flags remain false. Native/rendered acceptance for this new extension is PENDING; no full20-hour readiness or production change is established. See [scope, evidence and remaining completion path](../../engineering/pe-course-workbench-2026-10-01.md).


### 25-unit isolated technical acceptance — October 1, 2026

**SCOPED NATIVE/RENDERED PASS; PRIVATE DRAFT; DISABLED; NONCREDIT.** Application commit `44a9a942ad770639aba82645228b97fa864dabc8` passed [isolated run 36915541534](https://github.com/westccmortgage/statecourse/actions/runs/36915541534). All 25-unit teaching chains and scoped timing/category exports pass native PostgreSQL acceptance; rendered Chromium verifies actual lifecycle interruptions, recovery, adverse-order dialogue, navigation and downloaded evidence. Desktop/mobile captures were inspected. Upstream Auth is synthetic; accelerated test clocks do not validate proposed duration. The previous extension-native/rendered pending entry above is superseded for this bounded scope only.

Protected PE assessment, check-response/teaching-quality acceptance, cumulative OIL timing policy, lesson chunking, representative timing, human SME review, hosted identity/ROCS, real roster operations, reporting, external approval and the owner-OAuth-preserving release remain open. No merge, preview, deployment, live migration, filing, payment or credit authority is established.

### 2026-10-01 protected PE final candidate

Private default-disabled implementation adds 50 protected items / 25-question server forms, 18/25 threshold, complementary retake after fresh accepted remediation checks, immutable attempt/receipt history and current-eligibility rechecks. Exact bank `e151abc123d816762a0c40fd9612dccc81aa83ec4e60fcebb2521798e8221565` has scoped independent AI source/math review; human SME and regulatory release remain separate false gates. Local focused tests are available; exact-head native/concurrency/Chromium acceptance is pending. See [bounded engineering status](../../engineering/pe-final-assessment-2026-10-01.md). This does not alter the accepted 25-unit application evidence at `44a9a942ad770639aba82645228b97fa864dabc8` or establish full 20-hour, approval, hosted, certificate or banking readiness.
