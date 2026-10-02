# Private PE onboarding and readiness continuation

Status: source candidate on PR 24, based on exact accepted head `007d9bdda712d9a2a475bf1733775fb7f97895f1`. Local embedded PostgreSQL, DOM, and real local Chrome desktop/mobile checks pass. Exact-head native CI is required before this status can be advanced. No migration, deployment, preview, activation, merge, or regulatory claim is authorized by this document.

## Implemented bounded scope

- Immutable `private_noncredit` versus `prerequisite_bound` offering identity; existing records default to and retain the legacy mode.
- Transactional, idempotent creation of one disabled root roster, exactly 25 definition-derived unit cohorts, assigned-instructor membership, and learner memberships. Database authority rechecks current unscoped owner/administrator or the exact assigned instructor for scoped inspection/revocation.
- Verified-source ROCS registry boundary with exact source-document and rendered-text hashes, actor/course-bound presentation receipts, explicit accept/decline records, and original-request recovery.
- Self-reported NMLS ID remains visibly unverified. Only a separately supplied trusted evidence reference can satisfy identity readiness; no format check or learner action creates verification.
- One shared current-readiness evaluator runs before the first policy reservation or instructional grant and is reused by protected-final holds. Assignment, identity, or ROCS-source revocation closes subsequent access.
- Private learner readiness and staff setup pages, with no-store/noindex endpoints, stale-response protection, Back/Forward cleanup, interrupted-request recovery, and mobile-safe layouts.

Every new response keeps credit, certificate, and banking eligibility false. Course and unit enablement remain false at setup. The implementation does not change existing public practice, completed 25-unit teaching/final/OIL logic, payments, account security, or hosted configuration.

## Local verification

- Embedded PostgreSQL: transactional rollback, exact 25-unit hierarchy, setup idempotency conflict, two-learner isolation, presentation ownership, exact version/hash/time, current evidence withdrawal, assignment revocation, and zero policy state before readiness.
- Existing regressions: 76 focused teaching, final, OIL, staff-boundary, reading, and DOM tests passed unchanged alongside the onboarding tests.
- Browser: local real Chrome at 1280×800 and 390×844 passed exact ROCS presentation, acceptance, Back recovery, content clearing, and horizontal-overflow checks.
- Static source checks preserve protected-bank/public-artifact boundaries; no ROCS document was added to public assets.

## Remaining hosted acceptance gates

The draft SQL still requires separately authorized migration review/application. Real hosted Auth/session recovery, real named staff AAL2/fresh-action operation, real learner/instructor assignments, imported genuine verified ROCS bytes, trusted identity/BioSig evidence, retention/restore/retrieval, accessibility/human review, adopted provider delivery policy, representative timing, human SME review, exact regulatory authority, and production deployment acceptance remain open. NMLS credit, certificate, banking, payment, and regulatory-release gates remain off.
