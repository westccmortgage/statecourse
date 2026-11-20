> October 19, 2026, Los Angeles: approved source reconciliation preserves the newer PR #26 Core transport and the published lesson-open coach guard on main. Paid Core calls remain OFF. Lint and actual entitlement restoration are verified; AK/TX citation/sponsorship findings passed four repeated source-reviewed samples on f770fad; broader coach quality and the separate Mortgage Reg B finding remain open. See `docs/audits/COACH-AK-TX-CORRECTION-2026-10-20.md`. See `docs/audits/COACH-CORE-PRESERVATION-2026-10-20.md`.

# NMLS Launch Board

## BioSig-ID interface built, switched off, not connected — 2026-11-20

Branch `claude/inspiring-lamport-wjsuvn`. **Not deployed. No BSI value exists anywhere. No
request has been sent to BSI. Gate 3 is not closed.** Built ahead of the BSI meeting of
2026-11-23 at the owner's instruction, from BSI's NodeJS sample (`custom.code.zip`,
`Samples/NodeJS/`) and the owner's build specification of 2026-11-20. Earlier instruction
recorded on this board: per CSBS, no BioSig calls before that meeting and BSI's keys. That
still holds in effect: the code cannot build a request without all seven BSI values, and
it is off unless `NMLS_CREDIT_CHECKPOINTS=biosig`.

**What exists.**

| Piece | Where | Note |
| --- | --- | --- |
| BSI's helper, unchanged | `netlify/functions/_lib/biosig/interface-helper.mjs` | Class body identical to BSI's file; key is SHA-1 twice over pass+salt, 16 bytes. Output pinned against BSI's original. Do not modify. |
| Configuration | `config/nmls/biosig.mjs` | Environment only. Unavailable if any value is missing, left as a placeholder, or malformed. |
| Launch request | `netlify/functions/_lib/biosig/sso.mjs` | Argument string -> AES -> URL-encode -> `SSOInbound.aspx?args=`. No Base64 before encryption. NMLS fields `ls as d1 d2 d3 d4 d5` appended after `uid`. |
| Start a check | `POST /api/student/nmls/identity-check` | Closed reviewer enrollments only. Server chooses the checkpoint. |
| BSI callback | `GET/POST /api/biosig/callback` | Returns 404 while off. The only place a check is marked passed. Replies with `SSO_RESPONSE` XML. |
| Enforcement | `netlify/functions/_lib/biosig/checkpoints.mjs`, course endpoint | The course will not continue past a checkpoint without a check BSI verified; each verified check is used once. |
| Table | `database/031_nmls_identity_challenges.sql` | **Not applied.** Required before switching on. |

**Checkpoints (`d3`).** `Begin` before the first lesson; `Middle#1` after module F03
(3 of 8); `Middle#2` after module E02 (5 of 8); `FinalExam` at entry to each final
examination form; `Resuming` on every later return to study. The build specification
suggests Middle#2 near module 6 of 8; it is at 5 of 8 (250 of 400 minutes) as built.
Confirm the spacing with BSI and change `config/nmls/credit-review.mjs` if needed.

**To switch on, after BSI supplies the values (each step is a production change needing
the owner's approval):**

1. Apply `database/031_nmls_identity_challenges.sql` in the Supabase SQL editor.
2. Set in Netlify, values from BSI only: `BIOSIG_SYSTEM_ID`, `BIOSIG_CUSTOMER_ID`,
   `BIOSIG_SHARED_CODE`, `BIOSIG_PASS`, `BIOSIG_SALT`, `BIOSIG_VECTOR` (16 characters),
   `BIOSIG_PARTNER`. Optional: `BIOSIG_KEY_SIZE` (only 128 works), `BIOSIG_ENVIRONMENT`
   (`sandbox` default, or `production`), `BIOSIG_REVIEWER_UIDS`
   (`student-uuid=reviewer,student-uuid=reviewer2`).
3. Give BSI the callback address `https://statecourse.com/api/biosig/callback`.
4. Allow BSI's callback server through Cloudflare (the specification names `23.100.25.17`;
   confirm it is current).
5. Set `NMLS_CREDIT_CHECKPOINTS=biosig` and redeploy.
6. Compare our encryption with BSI's test vector before any student check.

**Not verified, and not verifiable before BSI's values exist:** any exchange with BSI;
the sandbox and production addresses; that BSI returns our `statecourse_ref` argument in
its callback (its README says prefixed custom arguments are returned unchanged; the
callback is refused without it); whether BSI's callback carries `ts`; that reviewer
identifiers `reviewer` / `reviewer2` and `d2=109386` are accepted; the callback IP; TLS
negotiation; Cloudflare behaviour.

**Known gaps.** The Rules of Conduct step is still a placeholder: the official text is
not in the repository, so `Begin` is not preceded by a real acceptance. A student already
inside a final examination who leaves and returns is not re-checked before submitting.
`Resuming` is sent as plain `Resuming`, without the optional context suffix. BSI's sample
reads the XML with `fast-xml-parser`; this build reads the four elements directly to
avoid a new dependency.

## Free training separated; reviewers' credit version built — 2026-11-20

Branch `claude/inspiring-lamport-wjsuvn`. Not deployed. No database change, no production
setting changed, no reviewer account provisioned.

**Portal fix of 2026-11-19 is live.** PR #28 was merged and the owner reports the student
portal working. That report is the evidence; the production site was not reachable from
the work session.

**Free training has its own section.** My StateCourse (`/student/`) now lists credit
courses, purchases, progress and certificates only. Free training, including the national
mortgage training, is at `/student/free-training/`, labelled "Free practice, no licensing
credit", and linked from `/free-practice/` and `/mortgage/`. The split is made by the
server from `enrollment_origin`; every enrollment is placed in exactly one section and no
enrollment or progress row is written, moved or reset by it.

**Credit version for NMLS reviewers (application 109386).** `/student/nmls-course/` and
`/api/student/nmls/course` present the same pinned course as "8 Hour SAFE Comprehensive:
2026 Mortgage Continuing Education", without free-training labels, inside My StateCourse.
Access is limited to enrollments the owner provisions with a reviewer role: one open
version (`regulator_reviewer`, read-only, free navigation) and two closed versions
(`student_reviewer`, the student experience). The endpoint refuses any other enrollment
at its first database read. `database/manual/nmls-review-accounts.sql` now takes one open
and two closed reviewer emails; **it has not been run**, so no reviewer can see this
version until the owner provisions the three accounts.

The credit version changes labels and adds checkpoint structure only. It cannot issue
credit, a certificate or a report, `courseApprovalId` stays null, payments stay disabled,
and public pages still say the course is not approved NMLS continuing education.

**Checkpoints are placeholders, off by default (Gates 3 and 4 not closed).** The sequence
is Rules of Conduct, BioSig-ID `Begin`, `Middle#1` (after module F03), `Middle#2` (after
module E02), `FinalExam`, and `Resuming` on return. They appear only when the Netlify
variable `NMLS_CREDIT_CHECKPOINTS` is exactly `placeholder`; there is no value that turns
on real verification. Each placeholder states that nothing is verified or recorded. No
BioSig-ID call, key, endpoint or SOAP client exists in the repository, per the CSBS
instruction to wait for the BSI meeting of 2026-11-23 and BSI's keys. The Rules of Conduct
text is not loaded: the genuine ROCS original is still not retained. `Middle#2` is added
at the owner's instruction; BioSig's own list of 2026-11-18 named `Middle#1` only, so
confirm the second middle checkpoint with BSI.

**Open against SRR's access requirement:** provisioning the three reviewer accounts;
BioSig-ID and Rules of Conduct (placeholders only); human review and duration validation.

## Course application 109386 opened; student portal defect found — 2026-11-19

**Submission status changed.** The owner initiated a course application in the NMLS
Education Management System. Read from owner-supplied screenshots on 2026-11-19, not
independently retrieved:

| Field | Value |
| --- | --- |
| Application ID | 109386 (type New) |
| Course name | 8 Hour SAFE Comprehensive: 2026 Mortgage Continuing Education |
| Category / method | CE Comprehensive / Online Self-Study, 8 requested hours |
| Course number | TBD — none assigned |
| Course status / application status | Pending / Awaiting Documents |
| Basecamp milestone | Application Materials Due (#109386), calendar date 2026-11-24 |

The SRR notice of 2026-11-19 (Jessica Esquina) asks for all course materials and the
application form in Basecamp **within 2 business days**, then a message to SRR Staff to
start review. For online courses it requires that the course be loaded in the LMS and
that SRR can reach **two student versions and one open version**; it states the
application is denied without review if they cannot access the course.

**This is an open application, not approval.** No NMLS course number exists,
`courseApprovalId` stays null, and enrollment, payment, credit, certificate and reporting
controls are unchanged. Gate 6 moves from not submitted to application open, documents
outstanding.

**Defect that blocks reviewer access.** The admin console reported "The training delivery
engine has not passed its current database definition check", and the student portal
would not open the course. Cause, established from the repository: commit `bc6bad5`
(2026-11-17) put the provider ID into the training-definition manifest
(`config/nmls-training-definition.mjs`). The delivery engine opens only when that
manifest is identical to the immutable row migration 025 stored on 2026-09-13, where
`providerApprovalId` is null, so every readiness check has failed since that deploy.
The existing tests mocked the database with the code's own value and could not see it.

Repair on branch `claude/inspiring-lamport-wjsuvn`: the manifest's two approval fields
are pinned back to the stored values (provider approval stays recorded in
`config/nmls-course-identity.mjs` and in the readiness report), and a new test compares
the authored definition with the row inside `database/025_nmls_free_training.sql`. That
test was shown to fail with the defect present. No database change is needed or made.
**Not verified in production:** the production database was not reachable from the
repair session, so the stored row was not read back, and the fix is not deployed. The
portal must be opened with a real student login after deploy before SRR is told the
course is accessible.

**Still open against the SRR access requirement, none of it changed here:** the two
student accounts and one open version for SRR are not provisioned; BioSig-ID (Gate 3)
and the Rules of Conduct presentation (Gate 4) are not built, while the submitted
syllabus describes both as part of the course; human review and duration validation
(Gate 5) are not recorded.

**Review copy of the content.** `scripts/export-nmls-course-content.mjs` builds the
complete course content (45 lessons, 123 lesson-check and quiz questions, 50-question
final bank, answer keys) from the pinned source into git-ignored `.local-export/nmls/`.
It contains answer keys and must not be placed in `public/` or `dist/`.

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
| 3. BioSig access and integration | **INTERFACE BUILT FROM BSI SAMPLE / SWITCHED OFF / NEVER CONNECTED — no BSI values, table not applied (2026-11-20)** | Identity and session-control concepts; authenticated actor binding | Local actor-binding tests only; vendor requirements recorded above, none tested | Intro meeting, NMLS-compliant development endpoint, sandbox credentials, SOAP client, the five `d3` checkpoints, agent-ID profile field, error/retry and support routing, acceptance evidence | BioSig-ID (application 90788); NMLS API documentation behind the provider login | BioSig email 2026-11-17 and published enrolment article; repository read 2026-11-18 | Book the intro meeting — it is what releases the development endpoint. Download the NMLS API documentation and its custom-code ZIP. Build ROC first, since enrolment follows it | **YES** | 2026-11-18 |
| 4. ROCS / learner agreement | **PARTIAL / MISSING** | Session-policy contract and receipt-bound agreement model | Retained evidence checks identify unresolved originals | Genuine current ROCS/FAQ originals, complete presentation, affirmative consent, per-course retained agreement/export | NMLS source availability and accountable review | CURRENT-STATE §2 | Acquire official originals; finalize presentation, consent, retention, and export design | **YES** | 2026-09-19 |
| 5. Course content / human review / duration validation | **BUILT / MISSING ACCEPTANCE** | 8 modules, 45 lessons, assessment banks, 400 provisional minutes, traceability | Structure/content-loader tests; audit totals | Human SME/item signoff and representative learner duration study | Qualified reviewers and test learners | CURRENT-STATE §§3–5, 7, 21 | Assign reviewers; execute documented content, item, legal, and duration acceptance | **YES** | 2026-09-19 |
| 6. Course submission and approval | **APPLICATION 109386 OPEN — AWAITING DOCUMENTS / NOT APPROVED — BINDING GATE** (see 2026-11-19 section) | Draft course portfolio and planning records | Null course IDs and closed enrollment verified; the provider ID is no longer null | Final approved version, submission receipt, NMLS course number, approval decision | Gates 3–5; NMLS course review | CURRENT-STATE §§3, 20–22; SRR approval notice and CSBS confirmation, 2026-11-17 | Work from the NMLS Approved Course Provider Resource Center, the User Guide and the NMLS Functional Specifications; Paula Lindsay (CSBS) is the named provider contact for questions, including whether BioSig integration must precede submission; then prepare one course. Owner approves submission separately | **YES** | 2026-11-17 |
| 7. Regulated LMS delivery compliance | **PARTIAL / MISSING** | Free non-credit learner path; private CE-policy engines; timing/progression controls | Narrow local unit/service tests | Integrated approved-course browser flow, eligibility/history checks, genuine identity/ROCS, production acceptance | Gates 3–6 | CURRENT-STATE §§5–9, 19 | Build regulated path only after IDs/policies exist; keep free training separate | **YES** | 2026-09-19 |
| 8. Student NMLS ID / identity handling | **BUILT / NOT DEPLOYED** | Agent-ID intake, format check, student-editable correction, append-only change log, transactional write behind the service role | 19 unit tests including refusals, proven to fail when the digit check is removed; browser render exercising a typo and a correction | Migration 030 applied to production, real end-to-end run, BioSig binding, NMLS-authoritative format rule, exception handling | Gate 3; owner approval to apply the migration | `config/nmls/student-identifier.mjs`, `database/030_student_nmls_identity.sql`, `tests/student-nmls-identity.test.mjs` | Obtain approval and apply migration 030, then verify against the deployed site. The 12-digit bound is provisional until the NMLS specifications are read | **YES** | 2026-11-18 |
| 9. Assessment / completion authority | **BUILT / MISSING AUTHORITY** | Formative/final/remediation engines and private policy chain | Local assessment tests | Authorized regulatory completion decision, terminal-failure adjudication, approved rules and deployed persistence evidence | Course approval; human policy approval | CURRENT-STATE §§7, 11 | Define accountable completion authority and exception workflow; validate against approved course | **YES** | 2026-09-19 |
| 10. Certificate / reporting / credit banking | **MISSING** | Generic reporting/database concepts | No NMLS regulatory issuance/banking acceptance | NMLS certificate, reporting export, credit banking, reconciliation, accepted operational evidence | Course/provider approval and NMLS reporting access | CURRENT-STATE §§12–13, 22 | Design after official IDs/rules; test reconciliation before launch | **YES** | 2026-09-19 |
| 11. Records / retention / operational procedures | **PARTIAL / MISSING ACCEPTANCE** | Event/audit concepts and draft contracts | Some local immutability/trace checks | NMLS-specific retention/retrieval, backup/restore proof, complaints/support, exception and incident procedures | Accountable operations review | CURRENT-STATE §§2, 7, 14, 16, 22 | Consolidate SOPs and perform retrieval/restore tabletop acceptance | **YES** | 2026-09-19 |
| 12. Stripe commerce readiness | **VERIFY / NOT LIVE** | Shared checkout, signed webhook, ledger, entitlement, refund architecture | Local code tests only; historical sandbox report | Current account/config read-back, NMLS product/price, full sandbox E2E, refund/duplicate evidence | Authorized Stripe test access; owner price; Gate 6 before sale | [Stripe Readiness](../commerce/STRIPE-READINESS.md); CURRENT-STATE §10 | Reconcile test objects and run approved sandbox acceptance; keep live off | **YES** for paid launch | 2026-09-19 |
| 13. Learner / reviewer end-to-end acceptance | **MISSING — portal working per owner after PR #28; reviewer credit version built 2026-11-20, not deployed, reviewer accounts not provisioned** | Learner and reviewer surfaces | Service tests and source artifact scan | Real browser learner/reviewer flow, auth/recovery, persistence, accessibility, deployment/schema evidence | Test accounts, approved environment, completed gates | CURRENT-STATE §§15, 17, 19, 21 | Execute scripted learner and reviewer acceptance with observed evidence | **YES** | 2026-09-19 |
| 14. Production launch | **BLOCKED** | Non-credit training capability exists | No commercial credit-bearing launch acceptance | All prior blocking gates, owner launch approval, verified production readiness | NMLS/BioSig/Stripe decisions and owner authorization | This board and CURRENT-STATE | Keep regulated enrollment, payment, completion, certificate, and credit off | **YES** | 2026-09-19 |

## Required state separation

`payment` → `payment entitlement` → `course enrollment` are separate from `course completion` → `regulatory completion` → `certificate` → `NMLS credit`.

The free training course is non-credit and must never be represented as approved NMLS CE. Payment or enrollment must never directly grant completion, regulatory completion, a certificate, or NMLS credit.

## Unified Admin adapter — 2026-09-19 local implementation

The existing console reads validated NMLS attempts instead of CA/TX blocks: 45 lessons, 8 modules, phase, safe final-attempt summaries, remediation and training completion. Source snapshots and activity reject invalid histories. Credit, certificates and reporting remain independently closed. The common media index includes 45 NMLS instructional targets and uses the existing signed Stream overlay; no asset was uploaded or marked playback-verified. Reviewer access uses the existing NMLS course/version grant and can be revoked without granting a Team role. [Acceptance record](../../admin/UNIFIED-ADMIN-ACCEPTANCE.md). Production migration/deployment and live-account acceptance are still required; no launch gate above is closed by local tests.
