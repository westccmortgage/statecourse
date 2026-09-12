# StateCourse administration console

Production: https://statecourse.com/admin/console/. The signed-in session identifies the account and current staff bindings. The account password belongs to Supabase Auth; an owner binding does not create or change a password. Short-lived access cookies refresh through the existing refresh cookie, including after an overnight return.

## Operating model

The production website is the working platform. Course content, enrollments, drafts, reviews, publications, tasks and check history persist in Supabase; video uploads and private playback use Cloudflare Stream. Local development files have no role at runtime.

Free training, regulatory approval and payment activation are separate decisions per site, state, discipline and offering. Free enrollment never becomes credit-eligible and creates no payment or checkout attempt. Live activation requires the matching state's owner authority and a currently effective named approval; server and database enforce their respective checks. California's DRE mortgage elective remains in real estate, separate from future NMLS education.

The current payment configuration must be `STRIPE_MODE=test` and `STATECOURSE_LIVE_PAYMENTS_ENABLED=false`. Test checkout also needs `STRIPE_SECRET_KEY_TEST` and `STRIPE_WEBHOOK_SECRET_TEST` in Netlify Functions. Merely choosing sandbox for an offering does not connect Stripe. The webhook route is https://statecourse.com/api/stripe/webhook.

## Workspace

- **Overview / Courses:** actual inventory, data availability, enrollment counts and per-course decisions. “Console video assets” counts database-managed assets; existing static video records are a different inventory. A registered lesson renderer alone does not prove a functioning enrollment and progress path.
- **Courses → Content:** select an instruction or review screen; edit and save a draft. Previewing and saving create no student progress or payment activity. Exercises, question banks and learning rules are displayed from the registered configuration and are not editable here.
- **Review & publish:** review the exact saved content hash, then publish with a reason. A stale revision or a missing/currently failing review is refused. New enrollments receive the published text release; existing enrollments keep their pinned release. Student payloads verify the release hash and apply its text on read. A missing pinned release is an error, never a silent reversion.
- **Students:** enrollment, access, version and recorded progress. Progress totals describe the registered structure; this is not a credit or completion determination.
- **Tasks:** create course tasks, record status and due-date changes with reasons. Closing requires a verification step. Concurrent changes use revision checks; history is retained.
- **Weekly checks:** an actual manual check can be saved now. The scheduled function runs Mondays at 16:00 UTC and saves the same structural diagnostics. Missing sources, incomplete delivery and missing connections remain findings. It does not pretend to watch video, send email or execute a checkout.
- **Payments:** recorded ledger only, amounts converted from integer minor units. Sandbox readiness, approval and live activation remain separate.
- **Team & access:** global owner can assign existing accounts scoped roles with reasons and optional expiration. The owner cannot remove their own owner binding through this form.
- **Messages / History / Connections:** actual outbox and action records, configuration presence and readable Supabase provider settings. Outbox does not cover Supabase authentication email delivery. Provider configured is distinct from a completed Google sign-in.
- **Course video:** reserve → upload → confirm → store and verify captions/transcript → human reviews → place. Thirteen current gates are required. Cloudflare captions are read back and hashed; withdrawal or a failing gate removes console video from the next student payload. No review should be recorded without its actual evidence.

## Current delivery boundaries

The three California 45-hour courses have the connected student progress path and may be opened for free training by a recorded decision. Eligible courses appear in the signed-in student portal; repeated requests reuse one training enrollment and never restore a revoked grant.

Texas Law of Agency now resolves all 58 authored retrieval questions and their replacement questions from its own question bank, including the second module-08 check. Its progress/heartbeat and completion integration remains unfinished. Free training for that course is refused with an explicit reason until that integration is completed. Other catalog rows without a registered student renderer likewise cannot be opened as working training courses by checking a box.

Stripe sandbox keys and Supabase Google OAuth configuration must be connected before their respective journeys can be verified. No approval, live payment, course review, content publication or student completion is inferred from a passing code test.

## Verification and schema

Migrations 019–023 supply the console storage and gates. This release adds no migration. `scripts/verify-console-postgres.mjs` verifies migrations 021–023 against modeled prerequisite tables in embedded PostgreSQL; it is not a production database test. `scripts/verify-console-readonly-dom.mjs` now verifies the operational DOM, including explicit draft saves and no automatic publication; its historical filename remains for existing callers.

The September 12 focused run passed 310 tests across console, access, enrollment, payment and block behavior; the DOM verifier passed 38 checks and the PostgreSQL verifier passed 23 checks. Both website builds succeeded. The California document preparation/check run passed 68 tests using the provided DejaVu font directory. A broader local run was also attempted and exposed missing archived binary files and unrelated source-capture differences in the recovered checkout; it is not represented as a wholly passing repository suite.
