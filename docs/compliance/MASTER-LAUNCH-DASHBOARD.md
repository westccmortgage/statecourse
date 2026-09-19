# StateCourse Master Launch Dashboard

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
