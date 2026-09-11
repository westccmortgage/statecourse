# Administration workbench — implementation checkpoint

Date: 2026-09-11. Base: GitHub main `39b032021c39ed50b36845e591e7fc3c295dfe82`.

**Not ready for acceptance or production deployment.** This checkpoint preserves work in the existing cloud repository. It is not a second hosted site. A skipped Netlify deployment must not be read as a passed release gate.

## Operating contract

- One actual StateCourse site and existing Supabase database; videos remain private Cloudflare Stream assets with signed playback and protected text assets.
- Actual courses provide free training before their applicable approval. No separate demonstration courses, accounts, videos or deployed test sites.
- Approval and live payment activation are independent owner actions, specific to site, state, discipline and offering. Sandbox configuration must never activate real charging or award regulatory credit.
- Completion means the owner can use the actual panel and student course. Isolated automated checks do not establish that result.

## Implemented in this checkpoint

The existing console gains navigation for overview, courses, students, tasks, weekly checks, payments, team access, messages, history and connections, alongside video, catalog and approval controls.

- Course instruction/review text can be edited as drafts. Revision checks reject conflicting saves; a review is tied to its content hash; publication pins an immutable revision to new enrollments. Existing progress and enrollments are preserved. Changed underlying course structure refuses an incompatible revision.
- Student inspection applies course scope before reading identity. Progress shows its denominator and explicitly identifies use of the current registered structure.
- Staff access requires an unscoped owner. State-scoped roles cannot become global owners; an owner cannot revoke their own owner binding through this endpoint.
- Tasks have recorded transitions and reasons. Closure requires a verification stage.
- Weekly structural checks report unreadable or truncated sources, missing renderers/questions, approval expiry and unfinished uploads. The scheduled function is code only until deployed. It does not send mail or claim an authenticated journey passed.
- Payments and message outbox are read-only views. Connections show configuration presence without returning secret values.
- Video console accepts actual caption/transcript files and explicit replacement details using the existing protected Cloudflare workflow.
- Migration 023 adds draft/review/release, task and check storage, database concurrency guards and immutable audit records. It creates no accounts or sample course data.

## Still required — code and product work

- Complete course structure, question bank and rule editing with appropriate review, versioning and student-engine enforcement. The present editor intentionally supports instruction/review text only; rules are read-only.
- Complete document management and the remaining operational controls. Payment refunds, message-template editing and task assignment/due-date editing are not implemented in this checkpoint.
- Repair Texas LOA retrieval-question resolution. A registered renderer alone is insufficient: screens currently reference questions missing from the connected lookup. Diagnostics identify this as blocking.
- Finish release/rollback operations, historical progress verification, and acceptance coverage for the complete agreed panel.
- Resolve the full repository test failures, regenerate versioned freezes only after their prerequisite validations pass, and verify the actual rendered UI and deployment.

## External access and configuration still required

- Migrations 021 and 022 are absent from the inspected production REST schema; 023 is not applied. This session has no Supabase schema-migration/management transport. REST access is not DDL access.
- The available browser has no authenticated owner session. No owner identity was impersonated or created. Real signed-in upload, playback, publication and saved progress remain unverified.
- Stripe test checkout/webhook secrets are absent from the inspected Netlify configuration. Google sign-in remains unverified. These are additional blockers, not the only unfinished work.

## Verification evidence and limits

- New workspace test file: 24 passing tests (authorization, scope, content integrity and honest diagnostics).
- Related existing auth, video, console and governance tests: 124 passed in the preceding focused run.
- Embedded PostgreSQL/PGlite: 23 checks passed for migrations 021–023 against modeled prerequisite tables. This is real SQL execution but not the actual production schema or hosted Supabase verification.
- JSDOM: 38 interaction checks passed with both production console scripts and isolated request fixtures; zero external requests. This is not visual browser acceptance.
- Static Netlify build passed after recovering source assets.
- Most recent direct full test run after byte-exact text restoration: 1,635 tests, 1,602 passed, 33 failed. This is **not** a passing `npm test`. Failures include missing generated/source binary files and dependencies in the recovered checkout, source inventory mismatches, and expected video-freeze drift from the modified student player; remaining failures require individual resolution. No acceptance report was changed to GO.

Reproduce focused checks with `node --test tests/console-workspace.test.mjs`. The two `scripts/verify-console-*.mjs` helpers take an installed PGlite or JSDOM module path as their first argument; these temporary verification dependencies were not added to the application's package manifest.

No production schema change, staff binding change, live payment activation, regulatory approval, real email send or deployment is part of this checkpoint.
