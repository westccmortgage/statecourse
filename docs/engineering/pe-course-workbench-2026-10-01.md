# Private 25-unit PE teaching workbench

Status: isolated native and rendered acceptance passed at application commit `44a9a942ad770639aba82645228b97fa864dabc8`, [run 36915541534](https://github.com/westccmortgage/statecourse/actions/runs/36915541534). Private draft only. No deployment or migration is authorized by this document.

## What this adds

- Preserved eight-lesson reader, 25 unit prompts and source hashes from the October 1 teaching package
- One course roster and assigned-instructor authority across all 25 unit records
- Separate reading/case preparation and proposed total-unit timing thresholds, server-owned bounded observation intervals and actor-wide cross-unit leases
- Immutable initial submission, distinct incoming/outgoing peer response, assigned instructor feedback and linked revision
- Learner-scoped course evidence export, category totals and instructor cohort evidence
- Private learner/instructor workbench with unit navigation, saved unit-specific drafts, original-request-ID recovery and a protected-final gate that remains locked

Planned allocation remains 150 federal law / 150 ethics / 100 nontraditional / 600 elective minutes. These numbers are a proposal, not measured instructional sufficiency. Accelerated synthetic clocks in acceptance test persistence and threshold behavior only.

## Boundaries

The independent default-off environment flag is `STATECOURSE_PE_COURSE_ENABLED`. The SQL remains under `database/drafts/`; it is not a registered/applied production migration. Settings, course and unit flags all default off. Credit, certificate, banking and protected-final availability are false even after every teaching evidence chain has been recorded.

This extension does not change existing student/staff authentication, owner OAuth, CE/OSS delivery, payment state, original lesson manuscripts or teacher answer keys. Browser tests model upstream authenticated identities. A separate actual requireStaff/requirePrivilege test exercises existing fresh-action SQL and proves the new course endpoint binding, but does not claim hosted Auth/MFA acceptance.

## Verified locally

- Nine course tests: all 25 units, two synthetic learners, real embedded PostgreSQL commands/service/HTTP, category and observed-time reconciliation, root-roster/account revocation, scope and closed credit/final gates
- Seven DOM tests: readable lesson, all units, committed-response recovery, feedback before outgoing peer work, revision threshold, unit-specific drafts/Back, and delayed old-unit response after navigation
- Three new staff-boundary tests: actual fresh-action proof SQL, exact new route/body binding, consumed proof rejection and safe downstream failure
- Forty existing/new PE03 tests: original cohort/staff behavior and strict evidence-readback ownership/lineage/reconciliation
- Three existing CI/client contracts

Focused checks do not establish a green full repository build/test suite. Existing 57 baseline failures were not changed. Source was recovered through pinned GitHub files rather than a complete local checkout; complete build validation is not claimed.

Two independent-review findings were corrected before publication: outgoing peer work remains available if instructor feedback arrives first; delayed old-unit snapshots cannot overwrite newer unit navigation.

## Verification workflow

The existing isolated workflow is extended, retaining its previous PE03 native/browser acceptance. It adds embedded and native PostgreSQL course tests using unchanged prerequisite migrations, plus a rendered Chromium workbench flow and actual downloaded scoped evidence. It has read-only checkout permissions, disposable literal-loopback PostgreSQL, synthetic fixture credentials and no hosted secrets or deployment commands.

The prior accepted PE03 evidence remains tied to commit `147cfe8faddd7308cdc56e64af0bfb354f575200`, successful run `36853453698` and its already-preserved private acceptance package. This extension does not rewrite that history.

## Remaining course completion path

1. Closed for this bounded workbench: exact-head native/rendered tests pass and desktop/mobile captures are inspected. Hosted acceptance and full-course gaps below remain open
2. Complete the full protected PE final bank and server assessment integration with reviewed item provenance; passing teaching records alone must never grant exam/credit authority
3. Complete explicit check-response/teaching-quality disposition and cumulative OIL session/day/break policy against current source requirements
4. Perform representative learner timing and human SME/teaching/source signoff; do not relabel proposed minutes as measured
5. Validate hosted identity/ROCS, production migration parity, staff operations, completion/reporting and retention with authorized non-credit test identities
6. Resolve provider/course scope and external approval gates, then obtain scoped release authorization preserving the production owner-OAuth overlay

No filing, payment, outside communication, paid enablement, regulatory approval, live database write or production release is performed here. Implementation and tests are AI-assisted and require the human/regulatory reviews above.

## Exact isolated acceptance, October 1

The native PostgreSQL 17.11 course lifecycle and rendered Chromium workbench passed with synthetic upstream identities. Real foreground sample: 9,504 observed milliseconds over 12,588 wall milliseconds; accelerated clocks separately test the proposed teaching thresholds. Actual downloaded learner/instructor evidence was validated for all 25 canonical units, actor/role/course authority, immutable lineage, privacy and closed final/credit flags. The initial run passed application tests but failed a harness-only download-event wait; the retry uses the existing owned-CDP download helper and validates the actual saved bytes. Application/SQL bytes were unchanged between these runs. Prior PE03 acceptance and both run artifacts are preserved. This closes no regulatory or protected-final gate.
