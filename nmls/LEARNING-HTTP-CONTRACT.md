# Local NMLS learning-review HTTP boundary

September13,2026. Local engineering integration, **not a deployed or approved CE product**.

## What is connected

`POST /api/student/nmls/learning-review` in `student-nmls-learning.mts` reuses the existing Supabase student session and refresh-cookie contract. Same-origin is required, even for bearer requests. The body must be UTF-8 JSON, at most16384 actual streamed bytes. A supplied Content-Length cannot bypass the limit. Responses are private/no-store/noindex and never echo backend details or secrets.

The exact envelope is `{ "operation": "...", "command": { ... } }`. Actor identity comes exclusively from authentication, not the body or user metadata. Commands are copied and validated before any RPC; callers cannot provide an evaluator, clock, definition, runtime, grade, policy, permission, identity evidence or replacement state. There is no arbitrary RPC forwarding.

| Operation | Existing private boundary |
|---|---|
| `snapshot` | Read-only041 discovery for exactly `{grantId}` |
| `teaching` | Joint032 source or existing remediation-child teaching |
| `reserve_first_final` | Joint033 policy check and first-form reservation |
| `first_final_delivery` |035 saved first-form session/exposure |
| `submit_first_final` |036 actual close, sealed result and failure-only empty child |
| `handoff_remediation` |037 first-child resume with original shared restrictions |
| `reserve_second_final` |038 reservation after genuine completed child work |
| `second_final_delivery` |039 distinct saved second-form session/exposure |
| `submit_second_final` |040 actual close and one terminal result |

Each operation retains its adapter's exact command/revision/session contract, private source pins and locked SQL validation. Routing does not grade, redraw, repair provenance or automatically retry an uncertain submission. After an adapter's response-time check, the dispatcher/handler perform no additional network work before serialization. Both finals remain private review with student delivery and credit flags false. Passing is a private test result, not a certificate or NMLS credit.

The new endpoint does **not** add `list`, `start`, `bind`, `provision`, `present_rocs` or an identity bypass. Legacy unbound `/api/student/nmls/review` behavior is preserved and cannot adopt the joint-policy marked phases. A missing assignment or unstarted attempt is not silently repaired. The endpoint can act only on explicitly assigned, properly initialized private review state whose actual authorization/evidence passes the underlying transaction.

## Read-only discovery is not permission

041 `nmls_learning_snapshot` is service-role executable; its helpers remain owner-only. It reads/locks existing records in compatible order and validates source/final/child/receipt provenance. It never creates an actor mutex, attempt, session, lease, grant or audit event, changes activity, settles exposure, grades, presents ROCS or issues material. The outer existing authentication helper still synchronizes the authenticated `students` profile; that is separate from the read-only RPC.

The browser projection contains only course ID/title, saved phase/status, ID/revision cursors, unit/module counts and current unit/module IDs. Source bytes, keys, final selections/answers, session IDs, ledger, policy/ROCS evidence, layouts and raw SQL errors are absent. A corrupt/missing history is held for review, not converted into new progress.

The six phases are `not_started`, `source`, `first_final`, `remediation`, `second_final`, `terminal`. All successful snapshots explicitly return `advisory:true`, `deliveryAllowed:false`, `studentDeliveryEnabled:false`, `creditIssuanceAllowed:false`. No attempt means null cursors and zero completed progress, not a newly started course.

`hold` is **annual-window status only**: null, `offering_not_open` or `offering_closed`. It is not a general readiness/lease/identity/idle/budget decision. Saved `status:active` with `hold:null` may still be unable to resume because another phase owns the actor lease, a break/uncertainty restriction applies or evidence has changed. A snapshot can become stale immediately; every actual command rechecks its own authority and revision fences.

## Server-only source packaging

The new function's private `included_files` contains eleven manuscripts through four closed globs and exactly four named assessment candidate banks. No bank glob, request-selected filesystem path or public download is added. Both content loaders resolve under the packaged task root, not the source module's pre-bundle depth. Final candidate bytes must match their existing SHA256 pins; missing/altered files fail closed. Keys and editorial notes never enter the static public build.

The teaching adapter now checks the original database time plus the **entire monotonic request duration both before and after hydration**. If projection crosses the delivery horizon, lesson/quiz/feedback/window and permission are removed from the response without changing saved state. The final adapters already recheck after projecting their saved questions.

## Verification and remaining integration

Dedicated tests exercise actual HTTP authentication/refresh, separate actor identity, streamed byte limits, invalid UTF-8, setup/clock/actor injection, safe errors, an isolated unmodified function bundle and the same pinned private loader. Dispatcher tests reach all nine actual adapters. Actual disposable PostgreSQL/PGlite023–041 tests traverse synthetic source → first final → child → second final and terminal outcomes; snapshot reads are compared against all stored rows to prove no bootstrap/write. Independent damage tests include changed final-definition evidence and retained039 events with a missing sidecar. Short synthetic units and test-only clocks/evidence are **not** human attendance or real identity verification.

Still unfinished, and not authorized by this document:

1. Wire the current-page controller to this endpoint and discovery contract, with truthful setup and recovery states. Do not overwrite the newer live homepage/admin/auth/payment changes from the old-base course branch.
2. Complete the response adapter's server-derived **relative material budget** and lifecycle wiring. Current absolute `deliveryUntilMs`/window times must NOT be converted into a lease by subtracting browser `Date.now()`. Charge the complete roundtrip, clear stale/hidden/suspended material and preserve exact uncertain-event retry. No current browser integration is claimed here.
3. Provide a genuine verified full ROCS document and real presentation receipt flow, approved policy/grant setup and BioSig integration. Synthetic fixtures or an intro video cannot replace those requirements. The current official V4 extract is available, but original PDF bytes/hash/visual verification are still unresolved.
4. Reconcile exact migration filenames/hashes with the fresh infrastructure branch and real schema, then conduct staged browser/PostgREST/cross-device acceptance, source/SME review and human duration validation.041 is not applied live. Historical023–040 bytes are unchanged.
5. Obtain exact provider/course approvals and all operational release evidence before enabling enrollment, credit or live payments. An admin readiness tab or successful test is not that evidence.

The source snapshot preserved on GitHub on September12 predates this increment. This local change must be saved/integrated separately without force-pushing the different snapshot commit history or replacing current main wholesale. No publication, live configuration/database/Stripe change or new approval is performed by this slice.
