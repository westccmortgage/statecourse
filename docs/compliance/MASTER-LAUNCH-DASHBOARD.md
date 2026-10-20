# StateCourse Master Launch Dashboard

## AI teaching and technical update — October 19, 2026 (Los Angeles)

Local implementation now covers 284 Real Estate lessons across 30 catalog courses and 45 authenticated national Mortgage teaching units, with shared OpenAI/Gemini adapters and versioned lesson chunks. Student reading surfaces are connected; assessment and regulator-review boundaries are retained. Local HTTP/SQL/DOM/browser evidence is documented in [AI coverage](../audits/AI-COVERAGE-2026-10-19.md). Provider authentication, live model quality, production migration/deployment and student production E2E remain unverified. No approval, credit, commerce or launch enablement flag changed.

Texas Law of Agency shared routing/player dependency drift was reviewed and recorded in video freeze v16 and content freeze v20. Stream regression checks and freeze validators pass; Texas submission/operational acceptance remains NO-GO. Georgia and Washington source readings remain stale and their gates stay closed.

## Uploaded DRE evidence — 2026-10-20

All three uploaded California application volumes contain course-specific college-equivalence letters on page 14, with letterhead and visible signatures checked. Historical “letters absent” statements are superseded; acceptance is unverified. Uploaded copies retain pre-filing access/signature/date completion instructions and do not establish the final mailed set. Owner-reported DRE and separate NMLS submissions remain under review. See [package review](../audits/DRE-UPLOADED-PACKAGES-2026-10-20.md). No launch or approval flags changed.

## Current owner-reported update — 2026-10-19

California DRE and the separate NMLS package are **submitted / under review**, as confirmed by the owner in this task. This supersedes historical "not submitted" and "waiting for initial access" assumptions below; no regulator approval was verified. Florida is waiting on the owner's personal broker application, distinct from school/course authorization. Dates/IDs/receipts remain to be recorded.

[Portfolio audit and 51-jurisdiction inventory](../audits/STATECOURSE-AUDIT-2026-10-19.md): 30 catalog Real Estate courses in 14 states, additional Florida development and Illinois structural work; one national non-credit NMLS offering; 24 state-supplement plans not yet authored in the blueprint. AI Lesson Coach has the local course coverage described above; production activation and learning effectiveness remain unverified. No commerce, approval or credit flags changed.

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
