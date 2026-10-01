# PE03 private cohort evidence: local review record

Status of the initial candidate: **SUPERSEDED / LOCAL-INCOMPLETE / DISABLED / NONCREDIT**. The first private Library bundle and local commit `f1ff40a14616257fe7c6ad16922d3dd54ac66dcd` omitted request metadata and the existing client needed by real instructor fresh-action MFA. This failed closed, but made that endpoint unusable with actual staff authentication. See [the correction and isolated CI proposal](pe03-isolated-ci-proposal-2026-10-01.md) for the current local result. The historical tests below used synthetic instructor authentication and did not establish that integration. Not published, deployed, merged, applied to a connected database, or accepted as an NMLS course. This is one bounded PE03 activity, not a 20-hour course.

## Boundary and identity

Built in a separate local checkout against materialized PR23 source. Upstream review head is `30c7bd15ab9f2ccf512134593495390ba7d69c08`, base `84c38a6d7cea4644cbf1cab528a75c52375d0aa7`. Local Git baseline is a materialization snapshot, not upstream commit ancestry. The unchanged PE03 public material matches exact-head Git blob `403bb634bd7c592da75c3bc86919a5574ee29b8e`; the Launch Board before this appended local record matches `cc4e7eb79c694df5ac75f6c7c644132f24533368`. Prior runtime audit verified 160 unchanged NMLS/auth files against the base and is preserved with the local acceptance evidence.

No changes to CE/OSS reducers, existing student/staff authentication, public free practice, owner OAuth, Netlify configuration, payments, production flags or live schema. The separate free PE03 practice remains available before/during/after enrollment. Public fictional material is reused, not converted to a protected exam or assigned credit.

## Implemented contract

- Separate `national-pe03-oil-noncredit-v1` definition with immutable content hash, PE identity and evidence-analysis activity; no annual-CE alias
- Private cohort opening/closing, IANA timezone, maximum fourteen inclusive local dates with exclusive final midnight; DST and cross-year supported
- Default-off HTTP environment gate, default-off database singleton and default-off cohorts; no provisioning or enablement HTTP endpoint
- Existing Supabase student-session adapter for learners; existing named staff/session/MFA adapter for instructors. SQL additionally checks active local account, active cohort membership, exact assigned instructor and current unscoped instructor binding
- Browser actor IDs never confer authority. Mutation actor ID is only an expected-account pin and must match the server-authenticated identity
- Server clock and actor-wide tab lease; two consecutive active observations within twenty seconds earn their server-measured interval. Pauses, expired gaps, new-tab acquisition and backward-clock holds do not earn time
- Observation is limited to initial preparation and closes on initial submission. Dialogue waiting, peer feedback and later revision do not accumulate this sample
- Thirty seconds is a **development persistence threshold**, not validated lesson duration or an NMLS time rule. This slice does not import the OSS six-minute inactivity rule
- Immutable initial submission → another member’s peer response → assigned instructor feedback linked to that response → original learner’s revision linked to the feedback. Initial submission is required before authoring a peer response. Self-response never satisfies the incoming peer gate
- Each mutation atomically records actor revision, event and request receipt. Same-ID/same-body retries return the original committed result; changed payload and stale revision fail
- Read-only scoped export includes cohort/version/hash, instructor assignment, server timestamps, observation intervals, event order and all visible lineage. Learners see their own records, responses to their work and the other initial submissions needed for dialogue; only the assigned instructor sees the entire cohort
- Credit, certificate, banking, duration validation and complete-course flags remain false. No auto-grade, instructor quality-acceptance decision or licensing completion is implied

## Files and integration

- `config/nmls/pe-oil-definition.mjs`: separate definition, prompts and selected fictional exhibits
- `database/drafts/pe03-cohort-evidence.sql`: **draft SQL only**, outside automatic migration paths. Supabase CLI was unavailable; no migration history was created and no remote SQL executed
- `netlify/functions/_lib/nmls-pe-service.mjs`: strict request, expected-account binding and strict committed-response validation
- `netlify/functions/_lib/nmls-pe-http.mjs`: same-origin, body limit, JSON-only, private no-store responses, existing auth and refresh cookies
- `netlify/functions/student-pe03.mts`, `instructor-pe03.mts`: separate default-off Netlify endpoints
- `public/statecourse/student/pe03/`: private link shell, source exhibits, gated response UI, server history, scoped JSON export and original-request recovery

The local URL shape is `/student/pe03/?cohort=<assigned-cohort-UUID>`. The same shell with `&role=instructor` chooses the staff endpoint; the query parameter grants no authority. No link was added to public navigation. Netlify adapters were bundled successfully with the existing esbuild package. A Sites artifact build does not establish a working Sites-hosted equivalent of these Netlify APIs.

## Executed validation

1. **PGlite 0.5.8 embedded PostgreSQL**, not native/hosted PostgreSQL: 20 tests passed, 0 failed, 0 skipped in the explicitly enabled focused run. SQL executed against modeled existing `students` and staff-binding prerequisites, under `service_role`, including privilege/RLS checks
2. **JSDOM + actual loopback HTTP + PGlite**: two synthetic learners and one assigned synthetic instructor completed the entire dialogue/revision chain. Final wall-clock samples: learner A 38,566 observed ms over 38,669 wall ms; learner B 39,968 observed ms over 40,038 wall ms. These are technical observation samples, not learner time studies
3. A committed initial response was deliberately lost. Fresh DOM/controller reload retried the saved original request ID, recovered the one committed submission and preserved the draft. The actual export-button controller also called the read-only HTTP endpoint and produced parseable, scoped JSON with all credit flags false
4. Simulated hidden/offline flags, reconnect and persisted-pageshow pause observation and do not backfill gaps. These are DOM lifecycle simulations, **not rendered-browser Back/Forward acceptance**
5. Negative coverage includes feature disabled, not-yet-open/closed window, local day 14/day 15, spring/fall DST and year crossing, locked/disabled actor, revoked membership/binding, expired or Michigan-scoped instructor binding, forged identity/time, direct-RPC null mode, own reply, missing prerequisites, cross-cohort target, immutable feedback/revision/receipt, content pin, idempotency conflicts, backward clock, competing tabs and revision CAS
6. Actual existing student-session code was exercised against synthetic Auth responses; editable role metadata does not grant staff access. Hosted Supabase Auth and live staff MFA were not exercised. A separate existing NMLS-learning/Michigan-staff regression run had 12 tests: 8 pass and 4 known Michigan failures, all already included in the same aggregate baseline failures
7. Strict response validation rejects wrong actor, role, definition, hash, revision/time types and false-to-true credit flags before UI delivery
8. Focused ESLint: no errors or warnings. Both new Netlify functions bundle successfully
9. `npm test`: Sites and Netlify builds completed; five Sites artifact checks passed. Aggregate Netlify result: **2,381 tests; 2,296 pass; 57 fail; 28 skip**. All 57 failure identities exactly match the prior PR23 acceptance log; one additional skip is the explicitly opt-in PGlite acceptance. Full CI is **not green**. The missing local Florida PDF fixture from the isolated copy was restored byte-for-byte from the verified existing workspace before this comparison
10. An earlier aggregate invocation with the optional embedded engine enabled alongside all parallel tests terminated its test process without an assertion result. The focused engine run passes in isolation. Do not interpret that termination as native concurrency acceptance

Chromium was attempted through the existing Playwright harness. Startup failed at the process-singleton Unix socket with `Operation not permitted`, including an approved escalated retry. No denied permission was bypassed. The completed browser harness remains available to run in a supported local/CI environment after approval; no publication was used to bypass the limitation.

## Exact local commands

Run from this isolated checkout. Replace dependency paths if using a different executor; do not assume files transfer between environments.

```sh
PE_PGLITE_MODULE=/workspace/scratch/72a15abc4c10/admin-today-board-fix/node_modules/@electric-sql/pglite/dist/index.js node --test tests/pe03-cohort.test.mjs
PE_PGLITE_MODULE=/workspace/scratch/72a15abc4c10/admin-today-board-fix/node_modules/@electric-sql/pglite/dist/index.js PE_JSDOM_MODULE=/workspace/scratch/72a15abc4c10/pe-test-deps/node_modules/jsdom/lib/api.js node tests/browser/pe03-local-dom.mjs
npm test
```

The optional engine must be explicitly supplied; a skipped PGlite group is never a database pass. Default aggregate execution intentionally follows the repository's existing optional-dependency convention. The browser script is `tests/browser/pe03-local-browser.mjs`; its failed local run is retained separately from successful DOM evidence.

Local evidence is under `artifacts/pe-cohort/`: exact logs, source verification, failure comparison, prior full audit/identity, synthetic export and DOM report. No real learner, borrower or staff data was created in these tests.

## Parent acceptance and remaining gates

Review the minimal source diff before any publication. Then, in an explicitly authorized non-production environment:

- Apply a proper generated migration against the actual full schema and inspect security advisors/permissions; test the real staff-binding view, Supabase Auth refresh, exact-session staff MFA and account/revocation behavior
- Run native PostgreSQL multi-connection races. PGlite serializes queries; its `Promise.all` CAS test proves stale-write rejection and atomic results, not native lock/deadlock behavior
- Run the rendered Chromium harness and inspect desktop/mobile layout, focus/visibility behavior, refresh, lost response, real Back/Forward and interruption recovery
- Define/review cumulative OIL break, day and session policy, meaningful timing study, identity/ROCS and broader curriculum progression rather than importing CE/OSS rules
- Add human SME/teaching acceptance, meaningful instructor quality decisions, a separate protected PE assessment, full 1,000-minute instructional evidence and applicable regulatory filing/approval
- Keep production owner-OAuth preservation and all certificate/banking authority gated independently

Separate minimal security candidate, **not changed here**: existing private CE learning/review SQL validates active grants but lacks `students.account_status='active'`. The new PE path checks it, and local PGlite tests reject both locked and disabled actors. A dedicated CE regression/fix should be reviewed independently without silently changing live CE behavior.
