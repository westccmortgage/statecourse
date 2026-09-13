# NMLS source recovery and current-main integration handoff

Prepared September12,2026 Pacific. This folder accompanies the actual source, not a replacement report about absent source.

## What to integrate — and what NOT to publish

The development branch is `nmls-ce-launch-20260910` in `westccmortgage/statecourse`. Its original common base is `0858b3cf494bf133ef925acae3f63af769620a0b`. The latest independently verified production checkpoint is **`a39f787f45e047ce451f8f6071780f64ea085cae`**, serving StateCourse.com through Netlify project `b514a8f8-782b-448c-8881-a914ee42c69b`.

**Do not deploy this old-base source branch wholesale, reset main to it, or copy its entire public tree over current main.** Preserve the live homepage, Mortgage / NMLS admin-readiness work, current authentication, checkout and Real Estate governance. This branch preserves a development source snapshot, not an approved student product.

Ordinary local Git network access failed at DNS resolution while the connected GitHub service remained available. If the branch is preserved through a Git tree/commit snapshot, its remote commit SHA differs from the local development commit: compare the full tree SHA, not the commit ID. The publishing operation's commit message records the local source commit/tree; read back the actual branch before declaring source recovery complete. The snapshot must retain the original base as its parent, NOT current main with old source replacing new content.

Read, in order:

1. [`../../../nmls/INTEGRATION-READINESS-20260912.md`](../../../nmls/INTEGRATION-READINESS-20260912.md): independently checked infrastructure and outstanding acceptance.
2. [`../../../nmls/README.md`](../../../nmls/README.md): course inventory, current engine checkpoint and limitations.
3. [`../../../nmls/FINAL-DELIVERY-INTEGRATION-CONTRACT.md`](../../../nmls/FINAL-DELIVERY-INTEGRATION-CONTRACT.md): source → first final → remediation → second final contracts.
4. [`migration-manifest.json`](migration-manifest.json): exact named NMLS forward SQL files and SHA256 hashes. Verify against this commit and the actual destination schema before applying anything.

## Source inventory

- `config/nmls/`: 2026 coverage research and draft course/policy definitions. Coverage spans50 states/55 agencies, DC separately; it is NOT50 approved courses.
- `nmls/curriculum/`: eleven2026 manuscripts and pinned blueprints. National core/comprehensive/elective review variants exist;2027 and state-specific teaching content is not all finished.
- `nmls/assessment/`, `lib/nmls-*`, `netlify/functions/_lib/nmls-*`: private banks, review engine, accounting, first/second final and remediation persistence.
- `database/023_nmls_*` through `040_nmls_*`: local forward migration chain. New039/040 give the saved second form its own session and terminal submission; a second failure stops automatic attempts and requires staff review.
- `netlify/functions/student-nmls-review.mts`, `public/statecourse/student/nmls-review/`, `scripts/provision-nmls-review-grant.mjs`: earlier non-credit private review endpoint/UI/provisioning, NOT the completed joint-policy learner path. The new final adapters have no HTTP importer.
- `tests/nmls-*` and `tests/helpers/nmls-*`: domain, transport, synthetic DOM and actual disposable PostgreSQL/PGlite tests. No human8-hour run or production acceptance is implied.

Do not publish manuscripts, assessment answer keys, private definitions or operator-only records in static assets, routes or browser bundles. Keep `salesAuthorized:false`, real NMLS enrollment, CE-credit issuance and live payment gates closed until the exact approvals and operational acceptance exist. Do not relabel California DRE education as NMLS.

## Current-main integration sequence

1. Re-read current remote main; a39f787 is a checkpoint, not a permanently pinned deployment target. Start a separate integration branch from the fresh main. Compare source delta against0858b3c; import NMLS-owned files and individually reconcile the small student navigation/build/Netlify-route changes.
2. Main already uses `023_console_workbench.sql` and `024_texas_training_runtime.sql`; these are unrelated to NMLS023/024. Inspect actual Supabase schema and the migration runner. Use exact filenames/hashes, not numeric-prefix matching or SQL globbing. Do not edit historical SQL contents or run rollback scripts. If unique migration IDs are required, review an explicit remapping before execution.
3. Finish the joint-policy authenticated UI/HTTP workflow, full genuine ROCS presentation/acceptance and real vendor identity integration. Check browser resume, hidden tab, expired session, uncertain retry, breaks, remediation and both final outcomes. Synthetic callbacks/time cannot be used as production attendance or identity evidence.
4. Review [`stripe-event-contract.patch`](stripe-event-contract.patch) against fresh main. It was prepared against exacta39f787 source and changes only two scripts plus a regression test. Setup/preflight previously used7 events while the handler's shared contract has10. Candidate tests8/8; unchanged base reproduces5 failures. This is a patch artifact, NOT applied production code and NOT a real Stripe transaction.
5. Netlify read-only site query found `STRIPE_MODE=test`, live payments disabled and no site-level TEST secret/webhook keys. LIVE credentials existed but were not used. Ask the owner to install sandbox credentials directly into Netlify, never chat. Check inherited configuration, intended account and endpoint, then perform a real sandbox checkout → signed webhook → entitlement → refund test. No live charge or approval bypass.
6. Re-run both builds and focused tests, then real staged acceptance and human content/timing review. A readiness tab, passing synthetic tests, source recovery or configured Stripe cannot substitute for provider/course approval.

## Tests and practical boundaries

Run the focused suite with `node --test --test-concurrency=1 --test-reporter=spec tests/nmls-*.test.mjs tests/payment-architecture.test.mjs tests/no-answer-key-published.test.mjs`. Set `NMLS_TEST_PGLITE_MODULE` to PGlite0.5.8 and `NMLS_TEST_DOM_MODULE` to Linkedom0.18.12. Without dependencies some groups skip; skips are not successful SQL/DOM verification. Serial scheduling avoids expiring genuine1-second SQL proposal leases through local CPU contention; the lease enforcement itself is not disabled.

Both `bash site/build.sh` and `SITES_ENV_READY=1 SITES_PROJECT_ROOT=<checkout> WRANGLER_WRITE_LOGS=false bash scripts/build-verified.sh` were run locally. Do not use the second command as authorization for Sites production: the current live site is Netlify/main. The existing full npm test entrypoint has an unrelated generated-California-PDF prerequisite; focused success must not be reported as full-repository success.

No production database mutation, live payment, migration application or public release is part of this source-preservation handoff. The final preservation commit message and dated local work log record actual completed test totals and source IDs.
