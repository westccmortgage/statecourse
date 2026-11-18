> October 19, 2026, Los Angeles: approved source reconciliation preserves the newer PR #26 Core transport and the published lesson-open coach guard on main. Paid Core calls remain OFF. Lint and actual entitlement restoration are verified; AK/TX citation/sponsorship findings passed four repeated source-reviewed samples on f770fad; broader coach quality and the separate Mortgage Reg B finding remain open. See `docs/audits/COACH-AK-TX-CORRECTION-2026-10-20.md`. See `docs/audits/COACH-CORE-PRESERVATION-2026-10-20.md`.

# NMLS Launch Board

## BioSig-ID interface requirements — 2026-11-18

Received from Ron Kerkenaar, Chief Technology Analyst, Biometric Signature ID
(ron.kerkenaar@biosig-id.com), in thread "StateCourse LLC — NMLS BioSig-ID Integration /
Provider Application 90788", with Rachel Lane. Vendor-supplied, not independently tested.

**Transport.** A **SOAP XML** interface reached over a **public HTTPS endpoint**. BioSig
supplies NodeJS interface code inside a custom-code ZIP referenced in **the API
documentation NMLS provides** — that documentation sits behind the NMLS provider login
and has not been read. The sample code is generic and must still be made to satisfy NMLS
requirements, the vendor naming **Resuming** as the hard part. BioSig will supply an
NMLS-compliant development endpoint **at the intro meeting**; that meeting is therefore
the gate on all integration work.

**Environments.** BioSig connects `statecourse.com` to **BioSig's own staging sandbox**.
No StateCourse staging environment is required, which leaves the no-staging policy intact.
A localhost target would need a public HTTPS tunnel; none is planned.

**Checkpoints.** A `d3` parameter names the point in the course: `Enrollment`, `Begin`,
`Middle#1`, `Resuming`, `FinalExam`. Per BioSig's published NMLS enrolment article, the
first authentication occurs **after the Rules of Conduct and immediately before the course
starts** — so Gate 4 (ROC) is a prerequisite of this gate, not a parallel track. Student
credential is a four-character pattern drawn with mouse, stylus, touchpad or touchscreen,
enrolled by drawing it three times and validating once.

**Acceptance.** A review meeting after development verifies eight items: first-time
enrolment UX and whether enrolment is a separate course (`d3=Enrollment`) or precedes
`d3=Begin`; flow and parameter values at `Begin` and `FinalExam` on a one-hour course;
`Middle#1` on longer courses; `Resuming` across a new LMS session after browser close or
sign-out; SOAP XML error handling that tells the student to contact support and logs
enough to diagnose; refusal of access on failed validation **with retry allowed**; a way
for the student to correct a mistyped NMLS agent ID held on their profile; and routing all
support to the **NMLS help desk** — BioSig is explicit that students must not contact BSI.

**Repository gap, read 2026-11-18.** No NMLS agent-ID field exists anywhere in the
functions, database or student pages. No `d3` checkpoint model exists. No SOAP client
exists: every integration in this codebase is REST over `fetch`, so SOAP is a new
transport here. Nothing in this paragraph is a defect; it is the scope of the work.

No gate closed, and no enrollment, payment, completion, certificate or credit control
changed.

## Provider approval — 2026-11-17 (supersedes the 2026-10-19 owner update below)

State Regulatory Registry LLC has **approved StateCourse LLC as an NMLS course provider**.

| Field | Value |
| --- | --- |
| Provider Organization Name | StateCourse LLC |
| NMLS Course Provider ID | 1405133 |
| Approval Date | 2026-11-17 |
| Renewal Date | 2028-11-01 |

**This is provider approval, not course approval.** The approval notice itself heads its
next section "Submitting Courses for NMLS Approval" and directs the provider to the
*User Guide: NMLS Course Approval Application Process* and the *NMLS Functional
Specifications for All NMLS Approved Courses* before any course is submitted. It is not
approval of `nmls-ce-2026-comprehensive-8`, no StateCourse course carries an NMLS course
number, and nothing here authorizes NMLS credit, opens enrollment or payments, or permits
describing any course as NMLS-approved. Gate 6 is now the binding gate and Gate 14
remains **BLOCKED**.

Evidence is two owner-supplied notices, both read on 2026-11-17: the State Regulatory
Registry LLC approval notice addressed to Anatoliy Kanevsky carrying the ID, approval and
renewal dates, and a separate confirmation from **Paula Lindsay, Senior Program Manager,
Mortgage Education Compliance, Conference of State Bank Supervisors** (plindsay@csbs.org),
copied to Anatoliy Kanevsky and Jessica Esquina, which directs the provider to the NMLS
Approved Course Provider Resource Center for the governing policies and procedures. SRR
operates NMLS under CSBS, so the two are corroborating rather than independent regulators.
Independent confirmation against the NMLS Approved Course Provider List is **not yet
possible**: that list is refreshed monthly, so an approval issued on the approval date
cannot appear in it yet, and its absence today neither confirms nor contradicts the
notices. Retain both original emails and confirm the listing at the next monthly refresh.
The 2028-11-01 renewal is a hard date and is otherwise untracked.

**Number discipline.** 1405133 is the NMLS Course Provider ID, from the SRR notice.
**90788 is BioSig-ID's own Integration / Provider Application number**, taken from that
vendor's subject line; neither NMLS notice states an NMLS application number. Do not
present 90788 as an NMLS application.

BioSig-ID asked for the LMS programming language, production URI, optional staging URI,
technical contact, company email, provider name and provider ID before scheduling
onboarding. Repository-derived answers: Node.js/JavaScript (ESM) serverless functions
with a generated HTML/CSS/JavaScript frontend and PostgreSQL, integrated over REST, not
SCORM or LTI; `https://statecourse.com`; no staging environment exists or is requested;
Anatoliy Kanevsky. BioSig onboarding, ROCS, human review and duration acceptance, course
submission and course approval all remain launch blockers.

No course was submitted, no enrollment, payment, completion, certificate or credit
control changed, and no public page was changed by this board update.

## Production AI pilot verification — October 19, 2026 (Los Angeles)

Production coach pilot is enabled on code `bf0433a4d7cc1fafa2f370fc43ced76142fcf36c` (ready deploy `6ad6e8e5ebf75c110bf19d98`). Real OpenAI and current Gemini 3.5 Flash-Lite answers were observed in Real Estate and authenticated Mortgage, with matching lesson excerpts, named consent, refusal samples and desktop/mobile inspection. Lesson change, pause and sign-out cleared generated answers; revisit after sign-out rejected the private session. OpenAI/gpt-4.1-mini is restored as default. Service-only RLS configuration preserves the shared $1/day cap without extra Lambda variables; existing provider keys are unchanged. Production ledger:11 complete,2 failed, $0.095761 conservatively reserved.44 targeted tests and the production build pass; lint unavailable (eslint absent). Authenticated protected build.json now independently confirms bf0433a / main / production, builtAt2026-10-20T04:07:15Z, after owner reauthentication at approximately21:26 Los Angeles. Actual enrollment revocation and portfolio-wide semantic/learning quality remain unverified. No knowledge-check answer graded, unit completed, payment or regulatory-credit/approval control changed; Mortgage remains 0/45 units, 0/8 practices. This is functional non-credit pilot evidence, not regulatory launch approval.

## Historical deployment snapshot — before coach activation

The expected commit `bd8319ec758b0f6e08aaf178704064984954d833` is Netlify's published production revision and now matches authenticated `build.json` readback. The existing Mortgage enrollment was exercised at desktop/mobile sizes: named consent is required, actual requests display unavailable, and pausing removes the coach. No answers were submitted and counts remained 0/45 units, 0/8 module practices; ordinary non-credit session/activity bookkeeping occurred. Mortgage coaching acceptance remains **BLOCKED**: runtime coach disabled, required coach settings absent, production durable admission unverified, and no live provider response/citation/refusal or generated-answer logout evidence. Anonymous and cross-origin coach requests returned 401 and 403 respectively. [Production verification](../../audits/PRODUCTION-DEPLOYMENT-2026-10-20.md). No NMLS approval, payment, regulated progress or credit control changed; this board update is local only.

## Historical local implementation snapshot — October 19, 2026

Local implementation now covers 284 Real Estate lessons across 30 catalog courses and 45 authenticated national Mortgage teaching units, with shared OpenAI/Gemini adapters and versioned lesson chunks. Student reading surfaces are connected; assessment and regulator-review boundaries are retained. Local HTTP/SQL/DOM/browser evidence is documented in [AI coverage](../../audits/AI-COVERAGE-2026-10-19.md). Provider authentication, live model quality, production migration/deployment and student production E2E remain unverified. No approval, credit, commerce or launch enablement flag changed.

Texas Law of Agency shared routing/player dependency drift was reviewed and recorded in video freeze v16 and content freeze v20. Stream regression checks and freeze validators pass; Texas submission/operational acceptance remains NO-GO. Georgia and Washington source readings remain stale and their gates stay closed.

## Owner update — 2026-10-19 (supersedes initial-access/submission assumptions below)

The owner confirms the **NMLS package has been submitted and is under review**, separately from California DRE. Record **OWNER-REPORTED SUBMITTED / UNDER REVIEW**. Exact provider/course application scope, date, IDs and receipt were not supplied. Do not continue to describe initial account access as the only progress, and do not infer provider or course approval. Remaining acceptance gates require current evidence; older statements below are historical, not live observations.

See the [current portfolio audit](../../audits/STATECOURSE-AUDIT-2026-10-19.md). No NMLS runtime, migration, credit, course version, payment or approval flag changed.

Last verified: 2026-09-19. Launch target: October 2026. Baseline: [CURRENT-STATE.md](CURRENT-STATE.md).

The initial NMLS account/access request was submitted approximately 24 hours before this board was created. NMLS advised that temporary login/password information may take approximately 48 hours. Account access is therefore **WAITING EXTERNAL**, not missing. This request is **not** provider approval and **not** course approval.

Status key: **VERIFIED** = narrowly verified evidence; **BUILT** = repository implementation exists; **PARTIAL** = some evidence exists; **WAITING EXTERNAL** = dependent on an outside party; **MISSING** = required evidence or implementation absent; **BLOCKED** = launch cannot pass.

| Gate | Status | Already built | Verified | Missing | External dependency | Evidence | Next action | Launch blocking | Last verified |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. NMLS account/access | **CLOSED** | Provider account in NMLS | Issuance of provider ID 1405133 presupposes account access | Retain the approval artifact in controlled records | None | SRR approval notice and CSBS confirmation, 2026-11-17 (owner-supplied) | None; superseded by Gate 2 | No | 2026-11-17 |
| 2. Provider application package | **APPROVED — OWNER-SUPPLIED EVIDENCE** | Submitted provider application | SRR notice: StateCourse LLC, NMLS Course Provider ID 1405133, approved 2026-11-17, renewal 2028-11-01 | Independent read-back from the NMLS Approved Course Provider List; archived original decision artifact | NMLS public list, refreshed monthly | SRR approval notice and CSBS confirmation (P. Lindsay), both 2026-11-17 | Retain both original emails; confirm the public listing at the next monthly refresh; calendar the 2028-11-01 renewal; do not treat this as course approval | No | 2026-11-17 |
| 3. BioSig access and integration | **INTERFACE SPECIFIED / NOT BUILT** | Identity and session-control concepts; authenticated actor binding | Local actor-binding tests only; vendor requirements recorded above, none tested | Intro meeting, NMLS-compliant development endpoint, sandbox credentials, SOAP client, the five `d3` checkpoints, agent-ID profile field, error/retry and support routing, acceptance evidence | BioSig-ID (application 90788); NMLS API documentation behind the provider login | BioSig email 2026-11-17 and published enrolment article; repository read 2026-11-18 | Book the intro meeting — it is what releases the development endpoint. Download the NMLS API documentation and its custom-code ZIP. Build ROC first, since enrolment follows it | **YES** | 2026-11-18 |
| 4. ROCS / learner agreement | **PARTIAL / MISSING** | Session-policy contract and receipt-bound agreement model | Retained evidence checks identify unresolved originals | Genuine current ROCS/FAQ originals, complete presentation, affirmative consent, per-course retained agreement/export | NMLS source availability and accountable review | CURRENT-STATE §2 | Acquire official originals; finalize presentation, consent, retention, and export design | **YES** | 2026-09-19 |
| 5. Course content / human review / duration validation | **BUILT / MISSING ACCEPTANCE** | 8 modules, 45 lessons, assessment banks, 400 provisional minutes, traceability | Structure/content-loader tests; audit totals | Human SME/item signoff and representative learner duration study | Qualified reviewers and test learners | CURRENT-STATE §§3–5, 7, 21 | Assign reviewers; execute documented content, item, legal, and duration acceptance | **YES** | 2026-09-19 |
| 6. Course submission and approval | **NOT SUBMITTED / NOT APPROVED — BINDING GATE** | Draft course portfolio and planning records | Null course IDs and closed enrollment verified; the provider ID is no longer null | Final approved version, submission receipt, NMLS course number, approval decision | Gates 3–5; NMLS course review | CURRENT-STATE §§3, 20–22; SRR approval notice and CSBS confirmation, 2026-11-17 | Work from the NMLS Approved Course Provider Resource Center, the User Guide and the NMLS Functional Specifications; Paula Lindsay (CSBS) is the named provider contact for questions, including whether BioSig integration must precede submission; then prepare one course. Owner approves submission separately | **YES** | 2026-11-17 |
| 7. Regulated LMS delivery compliance | **PARTIAL / MISSING** | Free non-credit learner path; private CE-policy engines; timing/progression controls | Narrow local unit/service tests | Integrated approved-course browser flow, eligibility/history checks, genuine identity/ROCS, production acceptance | Gates 3–6 | CURRENT-STATE §§5–9, 19 | Build regulated path only after IDs/policies exist; keep free training separate | **YES** | 2026-09-19 |
| 8. Student NMLS ID / identity handling | **BUILT / NOT DEPLOYED** | Agent-ID intake, format check, student-editable correction, append-only change log, transactional write behind the service role | 19 unit tests including refusals, proven to fail when the digit check is removed; browser render exercising a typo and a correction | Migration 030 applied to production, real end-to-end run, BioSig binding, NMLS-authoritative format rule, exception handling | Gate 3; owner approval to apply the migration | `config/nmls/student-identifier.mjs`, `database/030_student_nmls_identity.sql`, `tests/student-nmls-identity.test.mjs` | Obtain approval and apply migration 030, then verify against the deployed site. The 12-digit bound is provisional until the NMLS specifications are read | **YES** | 2026-11-18 |
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
