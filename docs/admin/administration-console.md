# StateCourse administration console

Production: https://statecourse.com/admin/console/. The signed-in session identifies the account and current staff bindings. The account password belongs to Supabase Auth; an owner binding does not create or change a password. Short-lived access cookies refresh through the existing refresh cookie, including after an overnight return.

## Operating model

The production website is the working platform. Course content, enrollments, drafts, reviews, publications, tasks and check history persist in Supabase; video uploads and private playback use Cloudflare Stream. Local development files have no role at runtime.

Free training, regulatory approval and payment activation are separate decisions per site, state, discipline and offering. Free enrollment never becomes credit-eligible and creates no payment or checkout attempt. Live activation requires the matching state's owner authority and a currently effective named approval; server and database enforce their respective checks. California's DRE mortgage elective remains in real estate, separate from future NMLS education.

The current payment configuration must be `STRIPE_MODE=test` and `STATECOURSE_LIVE_PAYMENTS_ENABLED=false`. Test checkout also needs `STRIPE_SECRET_KEY_TEST` and `STRIPE_WEBHOOK_SECRET_TEST` in Netlify Functions. Merely choosing sandbox for an offering does not connect Stripe. The webhook route is https://statecourse.com/api/stripe/webhook.

## Catalog coverage and registration

Overview separates catalog states, catalog courses, database records, database states and courses actually open for free training. The Courses screen includes public-only entries and database-only services, with the connection status stated per row. The September 12 catalog contains 30 course records across 14 states; those figures do not claim completed learning delivery.

Explicit identity links join Maine Sales Agent, Virginia Principles and Practices, and Texas Law of Agency to their existing database IDs while retaining the public IDs. A state mismatch never joins records. The global owner can register missing public real-estate course records from this screen. The server derives all values from the catalog, checks that the displayed missing-ID list is current, inserts with ignore-duplicates, and reads the records back. Existing rows are preserved; new records have no approval number and enrollment disabled. Registration creates neither a training decision nor payment configuration. Other roles and state-scoped owners cannot register the national catalog.

## Workspace

- **Overview / Courses:** actual inventory, data availability, enrollment counts and per-course decisions. “Console video assets” counts database-managed assets; existing static video records are a different inventory. A registered lesson renderer alone does not prove a functioning enrollment and progress path.
- **Courses → Content:** select an instruction or review screen; edit and save a draft. Previewing and saving create no student progress or payment activity. Exercises, question banks and learning rules are displayed from the registered configuration and are not editable here.
- **Review & publish:** review the exact saved content hash, then publish with a reason. A stale revision or a missing/currently failing review is refused. New enrollments receive the published text release; existing enrollments keep their pinned release. Student payloads verify the release hash and apply its text on read. A missing pinned release is an error, never a silent reversion.
- **Students:** search by name, email, course or enrollment; open access, version and recorded progress. Identity lookup is restricted to enrollments in the staff member's course scope. Recent course access comes from recorded block-player openings, with unavailable and incomplete sources identified. Progress totals describe the registered structure; this is not a credit or completion determination.
- **Tasks:** create course tasks, record status and due-date changes with reasons. Closing requires a verification step. Concurrent changes use revision checks; history is retained.
- **Weekly checks:** an actual manual check can be saved now. The scheduled function runs Mondays at 16:00 UTC and saves the same structural diagnostics. Missing sources, incomplete delivery and missing connections remain findings. It does not pretend to watch video, send email or execute a checkout.
- **Payments:** recorded ledger only, amounts converted from integer minor units. Sandbox readiness, approval and live activation remain separate.
- **Team & access:** global owner can assign existing accounts scoped roles with reasons and optional expiration. The owner cannot remove their own owner binding through this form.
- **Messages / History / Connections:** actual outbox and action records, configuration presence and readable Supabase provider settings. Outbox does not cover Supabase authentication email delivery. Provider configured is distinct from a completed Google sign-in.
- **Course video:** reserve → upload → confirm → store and verify captions/transcript → human reviews → place. Thirteen current gates are required. Cloudflare captions are read back and hashed; withdrawal or a failing gate removes console video from the next student payload. No review should be recorded without its actual evidence.

## Current delivery boundaries

The three California 45-hour courses have the connected student progress path. On September 12 the owner-authorized production decisions opened free training and sandbox payment mode for all three, with approval still absent and live charging off. Eligible courses appear in the signed-in student portal and on their public course pages. Public availability uses the same recorded decisions as enrollment and does not expose operator notes or identities; unreadable decisions never become an offer. Repeated requests reuse one training enrollment and never restore a revoked grant.

Texas Law of Agency now resolves all 58 authored retrieval questions and their replacement questions from its own question bank, including the second module-08 check. Its progress/heartbeat and completion integration remains unfinished. Free training for that course is refused with an explicit reason until that integration is completed. Other catalog rows without a registered student renderer likewise cannot be opened as working training courses by checking a box.

Stripe sandbox keys and Supabase Google OAuth configuration must be connected before their respective journeys can be verified. No approval, live payment, course review, content publication or student completion is inferred from a passing code test.

## Verification and schema

Migrations 019–023 supply the console storage and gates. This release adds no migration. `scripts/verify-console-postgres.mjs` verifies migrations 021–023 against modeled prerequisite tables in embedded PostgreSQL; it is not a production database test. `scripts/verify-console-readonly-dom.mjs` now verifies the operational DOM, including explicit draft saves and no automatic publication; its historical filename remains for existing callers.

The September 12 release run passed 354 focused tests across console, access, enrollment, payment and block behavior. The follow-up adds five passing tests for scoped student identities and public training discovery; DOM checks passed 42 for the console and 30 for public course access. The PostgreSQL verifier passed 23 checks. Both website builds succeeded. The California document preparation/check run passed 68 tests using the provided DejaVu font directory. A broader local run was also attempted and exposed missing archived binary files and unrelated source-capture differences in the recovered checkout; it is not represented as a wholly passing repository suite.

Authenticated production verification on September 12 confirmed the owner's session, recorded governance for the three courses, saved a structural check and three genuine outstanding tasks, and enrolled the owner's account in Real Estate Principles as free training. The first lesson opened and the enrollment persisted after returning to My Courses; no assessment, completion or credit was fabricated. Netlify reported the deployed Monday 16:00 UTC schedule. Production Connections confirmed Stripe test mode, live payments off, missing sandbox keys and a disabled Supabase Google provider.
