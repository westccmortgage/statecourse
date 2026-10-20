# StateCourse Master Launch Dashboard

## Production AI pilot verification — October 19, 2026 (Los Angeles)

Production coach pilot is enabled on code `bf0433a4d7cc1fafa2f370fc43ced76142fcf36c` (ready deploy `6ad6e8e5ebf75c110bf19d98`). Real OpenAI and current Gemini 3.5 Flash-Lite answers were observed in Real Estate and authenticated Mortgage, with matching lesson excerpts, named consent, refusal samples and desktop/mobile inspection. Lesson change, pause and sign-out cleared generated answers; revisit after sign-out rejected the private session. OpenAI/gpt-4.1-mini is restored as default. Service-only RLS configuration preserves the shared $1/day cap without extra Lambda variables; existing provider keys are unchanged. Production ledger:11 complete,2 failed, $0.095761 conservatively reserved.44 targeted tests and the production build pass; lint unavailable (eslint absent). Authenticated protected build.json now independently confirms bf0433a / main / production, builtAt2026-10-20T04:07:15Z, after owner reauthentication at approximately21:26 Los Angeles. Actual enrollment revocation and portfolio-wide semantic/learning quality remain unverified. No knowledge-check answer graded, unit completed, payment or regulatory-credit/approval control changed; Mortgage remains 0/45 units, 0/8 practices. This is functional non-credit pilot evidence, not regulatory launch approval.

## Historical deployment snapshot — before coach activation

Netlify's current production deploy `6ad6d1fbefcea6ce2fecda4a` identifies the requested commit `bd8319ec758b0f6e08aaf178704064984954d833`; authenticated production `build.json` readback now independently confirms it. The exact checkout passes `bash site/build.sh`. Staff access and an existing enrolled Mortgage student session were exercised. Both coaches' desktop/mobile requests show unavailable; named consent and Mortgage pause removal work. Live AI acceptance remains **BLOCKED**: runtime disabled, required coach settings absent, production durable storage unverified, and no real OpenAI/Gemini response. [Observed results and precise remaining gates](../audits/PRODUCTION-DEPLOYMENT-2026-10-20.md). No production setting, payment, approval or credit control changed. This evidence update is local and has not been deployed.

## Historical local implementation snapshot — October 19, 2026

Local implementation now covers 284 Real Estate lessons across 30 catalog courses and 45 authenticated national Mortgage teaching units, with shared OpenAI/Gemini adapters and versioned lesson chunks. Student reading surfaces are connected; assessment and regulator-review boundaries are retained. Local HTTP/SQL/DOM/browser evidence is documented in [AI coverage](../audits/AI-COVERAGE-2026-10-19.md). Provider authentication, live model quality, production migration/deployment and student production E2E remain unverified. No approval, credit, commerce or launch enablement flag changed.

Texas Law of Agency shared routing/player dependency drift was reviewed and recorded in video freeze v16 and content freeze v20. Stream regression checks and freeze validators pass; Texas submission/operational acceptance remains NO-GO. Georgia and Washington source readings remain stale and their gates stay closed.

## Uploaded DRE evidence — 2026-10-20

All three uploaded California application volumes contain course-specific college-equivalence letters on page 14, with letterhead and visible signatures checked. Historical “letters absent” statements are superseded; acceptance is unverified. Uploaded copies retain pre-filing access/signature/date completion instructions and do not establish the final mailed set. Owner-reported DRE and separate NMLS submissions remain under review. See [package review](../audits/DRE-UPLOADED-PACKAGES-2026-10-20.md). No launch or approval flags changed.

## Current owner-reported update — 2026-10-19

California DRE and the separate NMLS package are **submitted / under review**, as confirmed by the owner in this task. This supersedes historical "not submitted" and "waiting for initial access" assumptions below; no regulator approval was verified. Florida is waiting on the owner's personal broker application, distinct from school/course authorization. Dates/IDs/receipts remain to be recorded.

[Portfolio audit and 51-jurisdiction inventory](../audits/STATECOURSE-AUDIT-2026-10-19.md): 30 catalog Real Estate courses in 14 states, additional Florida development and Illinois structural work; one national non-credit NMLS offering; 24 state-supplement plans not yet authored in the blueprint. AI Lesson Coach production pilot activation is verified above; portfolio-wide learning effectiveness remains unverified. No commerce, approval or credit flags changed.

Last verified: 2026-09-19. Target: **NMLS launch in October 2026**. This is an operational control board, not regulatory evidence.

| Track | Current phase | Status | Critical blockers | External dependencies | This week's priorities | Waiting outside StateCourse | Evidence basis | Detail | Last verified |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A. NMLS / Mortgage Education | Account access and provider-package preparation | **WAITING EXTERNAL / LAUNCH BLOCKED** | Temporary NMLS credentials; BioSig access/ID and integration; provider and course approval; genuine ROCS/learner agreement; human review and duration validation; regulated completion, certificate, reporting, banking, and E2E acceptance | NMLS account team; BioSig availability after NMLS access; later NMLS provider/course decisions | Receive credentials; finish reviewable provider package; close ROCS/BioSig design gaps; schedule human content/time review; keep free training explicitly non-credit | NMLS temporary login/password, advised at approximately 48 hours after request | CURRENT-STATE audit and NMLS board | [NMLS Launch Board](nmls/LAUNCH-BOARD.md) | 2026-09-19 |
| B. Stripe / Commerce | Re-verify existing test infrastructure; live mode remains off | **VERIFY / NOT LIVE** | Correct account and current test configuration unverified; product/price mapping incomplete; no current sandbox purchase/refund/duplicate-webhook E2E evidence; no approved sellable NMLS product | Authorized Stripe test-account access; owner pricing decisions; regulator approvals before any regulated sale | Read-only account verification; reconcile catalog to test products/prices; run approved sandbox E2E later; preserve payment/education-state separation | Current Stripe account/session/config evidence | Payment architecture plus historical sandbox record | [Stripe Readiness](commerce/STRIPE-READINESS.md) | 2026-09-19 |
| C. Real Estate Education | Research, course build, and draft application packages by state | **DEVELOPMENT / NO APPROVALS EVIDENCED** | Requirements incomplete in many states; packages are drafts; no submission, approval, commerce E2E, or live evidence | State regulators; approved instructors/reviewers; owner filing and pricing decisions | Reconcile registry with repository work; finish highest-priority state packages; keep enrollment/payment/live off | Regulator answers and future application decisions | State registry, catalog, state folders, and tests | [State Rollout Board](real-estate/STATE-ROLLOUT-BOARD.md) | 2026-09-19 |

## Unified Admin implementation — local acceptance, 2026-09-19

One existing console now has a school hierarchy, discipline-specific learning and regulatory projections, version-scoped evidence and reviewer workflows, code/database media readiness, completion/reporting projections and per-offering commerce gates. See [implementation and acceptance record](../admin/UNIFIED-ADMIN-ACCEPTANCE.md). **BUILT / LOCAL VERIFICATION ONLY**: migration 027 and deployment are not applied to production; no course, payment mode, approval or credit was activated.

## Operating priorities

1. NMLS credentials and BioSig dependency.
2. Reviewable NMLS provider application package.
3. Genuine ROCS and retained learner agreement.
4. Human content, assessment, and duration validation.
5. Regulated LMS completion/certificate/reporting path.
6. Current Stripe sandbox verification without enabling live mode.
7. Real Estate state-by-state evidence reconciliation.

Detailed requirements live only in the linked boards.



## StateCourse Command Center — admin security (2026-09-29)

Status: **BLOCKED — owner identity binding and MFA**, not operationally accepted.
The existing Command Center Agent is preserved. Development changes require a named,
server-derived staff role, exact-session MFA proof, short privilege lifetime, current
revocation checks, audit, persistent rate limits and fresh one-use permission for
sensitive actions. Ordinary student/reviewer sessions and the legacy shared admin
token do not satisfy the new boundary. The owner OAuth helper uses the same staff ledger.

Production read-only inspection found one active unscoped owner record whose subject
has no corresponding `auth.users` entry, and zero verified MFA factors. Do not assign
owner authority by email or metadata. The actual owner must authorize repair to an
authenticated subject and personally enroll/verify MFA. These changes are prepared
for controlled deployment; local test results are not production acceptance.
No regulator approval, NMLS signature, submission or payment status changes here.
See `docs/security/admin-hardening-2026-09-29.md` for verification and activation gates.
