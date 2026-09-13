# NMLS CE integration checkpoint — September 12, 2026 (Pacific)

## User priority and actual release boundary

The latest user instruction expands this task from course-only work to checking Supabase, integrating Stripe and preparing an end-to-end launch. Monday, September 14 is the requested target, **not a verified approved-sales date**. Do not replace this distinction with a progress percentage.

This branch is private course/engine development. No genuine provider/course approval, human timing acceptance, production NMLS migration, live NMLS payment, or complete learner browser traversal has been demonstrated here. `salesAuthorized:false`, student-delivery and CE-credit release restrictions remain in place. A synthetic private examination pass is not a completion eligible for NMLS banking.

## Fresh production facts (read-only)

- Repository: `westccmortgage/statecourse`.
- Independently retrieved current-main checkpoint: `a39f787f45e047ce451f8f6071780f64ea085cae`.
- Netlify project serving `https://statecourse.com`: `b514a8f8-782b-448c-8881-a914ee42c69b` (`chipper-maamoul-a2b9d5`).
- Published ready deploy: `6aa5f82dc330ca0008f1f523`, matched to that commit. This is a point-in-time observation; re-read before any integration or publication.
- The deployed function inventory has no `student-nmls-review`. The main-branch NMLS readiness admin tab is not the NMLS course runtime.
- NMLS local branch: `nmls-ce-launch-20260910`; no remote source branch was found in the fresh audit. Do not claim local commits are published.
- Ordinary `git fetch github main` failed at local DNS resolution. Connected GitHub/Netlify reads succeeded. The cached remote-tracking ref is NOT the current integration base.

Fresh other-chat handoff source: `ADMIN PANEL STATECOURSE`, thread `6aa2e726-2f00-83e8-b68c-2ce0753ec9ff`, latest reviewed turn `b47b522a-beea-4264-9b32-ed0557b4a0b8`. Its reports of installed admin/training migrations and missing Stripe sandbox credentials are handoff claims, not an independent live database/environment query by this task.

## Migration collision — stop before live application

Current main uses `database/023_console_workbench.sql` and `database/024_texas_training_runtime.sql`. Local NMLS uses `023_nmls_review_runtime.sql` and `024_nmls_review_discovery.sql`. Equal prefixes do not mean equal migration contents or installed NMLS tables.

Before application, obtain actual live schema/migration evidence and reconcile the complete named NMLS chain023–040 with the current main chain. Use a reviewed explicit filename/hash manifest, not a directory glob or numeric prefix. Do not run rollback scripts as forward migrations. Do not change historical SQL bytes to make an existing version mean something different. If the deployment runner requires globally unique numeric IDs, produce an explicitly reviewed renaming/import plan before running it.

## Stripe finding and test boundary

At pinned main, `lib/stripe-contract.mjs` and the webhook handler support10 event types, but `scripts/stripe-setup.mjs` and `scripts/stripe-preflight.mjs` use7. The omitted types are `payment_intent.succeeded`, `payment_intent.payment_failed`, and `charge.refunded`. Updating an endpoint with the smaller setup list can remove handling subscriptions while the preflight still reports success.

A correction was prepared against the pinned current-main files outside this old checkout: `docs/handoffs/nmls-source-recovery-2026-09-12/stripe-event-contract.patch`. It imports the existing shared ten-event contract in both scripts and adds regression tests. Candidate: eight passed, zero failed/skipped; unchanged base with the same regression: three passed, five expected failures. It must be reviewed/applied to the current integration branch, not by overwriting main with this branch's stale site/payment files. Tests with a fake Stripe transport are not a successful real sandbox transaction. The patch has not been applied to production.

Subsequent read-only Netlify site-environment query succeeded: production Functions have `STRIPE_MODE=test` and `STATECOURSE_LIVE_PAYMENTS_ENABLED=false`. `STRIPE_SECRET_KEY_TEST`, `STRIPE_WEBHOOK_SECRET_TEST`, `STATECOURSE_PRICE_*` and `SANDBOX_ALLOW_DRAFT` were absent from the returned site variables. LIVE secret/webhook variables exist and are secret-marked but have broad build/function/runtime scopes and several contexts; they were not used or changed. Supabase URL/anon/service-role variables exist; service-role scoping also needs comparison with actual current readers before any change. These observations do not validate key contents or exclude inherited/team overrides. No secret value was printed.

The user was asked to place the exact sandbox secrets into Netlify directly, not chat. One real **sandbox** checkout/webhook/entitlement/refund traversal is still required, after the event-contract correction. Real-estate checkout readiness and a California DRE course do not establish NMLS CE eligibility.

## What this course increment closes

Local039 creates a distinct second-final session only after genuine038 reservation and actual child completion. It retains original authority, first result, child progress and shared exposure limits. Local040 composes a genuine039 close with one terminal second result: pass or staff review after a second failure. No automatic third form, synthetic attendance or CE credit is created. Private adapters disclose only post-commit results; replay does not grade, redraw or reopen questions.

Tests use disposable PostgreSQL/PGlite and deliberately short synthetic teaching units. After both local builds, root's final focused run passed **668/668, zero failures/skips** (serial scheduling, approximately479 seconds). A stale proposal reused across an older mutation test was replaced with fresh genuine evaluations; production freshness checks were not relaxed. This is not an8-hour human run, full existing npm suite or production acceptance test.

## Next acceptance sequence

1. Transfer the exact reviewed NMLS source to the latest main-based integration checkout; retain its homepage, admin, payment and authentication work. Resolve migrations by filenames and hashes.
2. Finish the authenticated learner route/controller across teaching, first final, remediation and second final. Verify refresh, interruption, same-request retry, session expiry, final failure and return to the saved course with a real browser.
3. Obtain and preserve the genuine complete ROCS source, implement its accessible per-course presentation and retained acknowledgment. Connect genuine BioSig/vendor checkpoints; no client-supplied success flag or test identity callback in production.
4. Verify Supabase migrations, ownership/role policies, session refresh and test learner grants on the exact intended non-production target, then stage a separately reviewed production plan.
5. Apply and verify the shared Stripe webhook-event contract. Check exact sandbox account/keys/endpoint, then checkout, signature verification, duplicate webhook, entitlement and refund. NMLS payment release remains closed until actual approvals and operational acceptance.
6. Complete human content/source review and representative timing evidence, document provider/course approvals, then run the approved production checklist and open only the approved offering.

The original ROCS PDF was attempted in the connected browser in this turn. Its viewer showed no readable document and content export was unsupported; no original bytes or hash were obtained. `fullDocumentVerified` was not changed. BrowserAct/uv were absent; no new software was installed.

## New media handoff

The user supplied a report that **Mortgage File Integrity — General Elective** is prepared: 57.44 seconds, speech ending at53.12, approximately3.2 seconds for the final card; future final PNGs should last exactly4 seconds. This turn contains no attached file/path for that new version. This is recorded as the user's review, not independently inspected, integrated or approved instructional media. Do not recreate the video or count its reported duration as CE credit.
