# Unified Admin acceptance record

Implementation branch: `work/unified-admin-panel`, based on `6ddaf53`. The original checkout and its unrelated commerce work remain untouched. Production/main have not been changed.

## Implemented in the existing console

- Owner School dashboard → discipline → state → program → offering → version. Existing course/video/approval/payment controls remain in the same console. Other staff retain their existing scoped workspaces; the new combined financial/student school projection is owner-only.
- NMLS enrollment adapter validates the exact pinned runtime/history, separately displays 45 lessons / 8 modules, final attempts, remediation, training completion, reviewer mode and last persisted activity. No answer keys or raw runtime leave the administrative adapter. Training never implies NMLS credit.
- Real Estate adapters retain CA/TX rules, safe block/final summaries and independent completion gates. Michigan reads `michigan_operational_status`; California projects the existing certificate service prerequisites; Missouri school-period reports are explicitly not individual acceptance receipts. Issuing/reporting operations are not invoked by these views.
- Regulatory evidence is append-only and course/version-specific, with authority/document/effective/expiry fields. Future, expired, unavailable and rejected evidence does not appear verified. Only documented school/instructor inapplicability can waive those evidence gates. Entries never change approval, course activation or credit.
- Reviewers use dedicated existing accounts and exact enrollment/version/jurisdiction scope. CA/NMLS reuse their review runtimes. Unsupported student runtimes explicitly refuse provisioning. Findings, resolutions and documented signoff bind to authored source hashes and the enrollment's pinned publication hash. SQL serializes finding transitions and uses a monotonic event sequence, including when timestamps are identical. Revocation works after a course version changes and never reopens expired access.
- Migration 027 repairs legacy CA reviewer creation: its zero-dollar checkout violated the existing amount constraint. The existing provisioning function now uses the already-supported `review` origin, preserving non-credit and certificate guards without manufacturing payment records.
- Media combines code bindings and console records, including four CA signed-Stream keys. UID configuration, captions/transcript readback, release gates and current-UID playback evidence are distinct. NMLS adds 45 instruction targets and the existing signed-player overlay; assessments/remediation are not media targets.
- Commerce uses the same catalog eligibility evaluator as checkout and the current offering decision, current test-key mode/presence and exact test price. Sandbox transaction/webhook/refund acceptance remains documentary and version/price bound. No Stripe calls or live activation occur.
- Every launch blocker identifies offering/version, responsible area, next action, required evidence and Codex/owner/external responsibility. Missing/truncated sources produce unknown counts.
- Build-generated coverage inspects all 30 RE course sources. All 26 unconnected courses have authored curriculum; 21 specific state definitions load and 5 Texas courses have separate authoring/reviewer engines. No compatible authenticated student runtime is claimed for them. Research folders are not operational offerings.
- Identity reconciliation retains declared catalog/database bridges and state-control regulatory aliases. Legacy approval vs current governance and missing regulatory versions remain visible disagreements. They are not “fixed” by copying an approval or adding an unverified version.

## Verification

Final repository suite: **2599 tests, 2599 passed, 0 failed, 0 skipped**. The separate Netlify build guard also passed **5/5**. Both Sites and Netlify builds passed. The complete `npm test` command runs Sites build/artifact validation and Netlify build/tests. PDF prerequisites were generated using `npm run prepare:california`. Optional SQL and DOM checks were enabled with local PGlite and LinkeDOM modules; no production database was used.

New tests execute the actual additive migration over migrations 001–025 in PGlite; exercise owner/non-owner authorization, CA/NMLS review creation, expiry, revocation, no reopening, certificate denial, append-only evidence, RLS denial, finding transitions and source-hash mismatch. Service tests cover inventory, discipline isolation, evidence expiry, media UID drift, commerce gates, state completion, unknown sources and forged NMLS history. DOM tests render every school section, filters, hostile text escaping and logout cleanup.

Browser inspection used a localhost-only harness with clearly labelled synthetic records and the actual school UI. Observed 0 / 45 NMLS lessons, closed credit, 45 NMLS media targets, desktop layout and 375px layout. This is local UI evidence, not production account acceptance.

The repository-wide lint command still reports **109 errors and 113 warnings**. The same command-equivalent source analysis on base HEAD reports identical counts and per-file diagnostics; this change adds no lint diagnostics. Existing lint failures are not disabled or treated as passing.

## Production acceptance required

Owner approval is required to apply additive migration 027 and deploy the reviewed branch. Before that action, capture schema/deployment rollback references. The migration seeds no approvals, media, reviewer accounts or course activation. Rollback should redeploy the prior code while retaining new append-only history; do not delete evidence tables or user data.

After approved deployment, verify owner access and ordinary-account denial; select real CA/TX/NMLS enrollments; compare counts and activity to their underlying records; test designated reviewer accounts and revocation; inspect current Stream UIDs and signed playback (including captions/transcripts); record current sandbox checkout/webhook/refund-replay evidence with owner authorization for side effects. Credentials configured is not transaction/playback proof.

External acceptance remains: genuine provider/course approvals, named human signoff and duration validation, official ROCS originals/reporting authorization, required vendor/identity onboarding, current Stripe sandbox acceptance and Cloudflare playback acceptance. None is created or declared complete by this work.
