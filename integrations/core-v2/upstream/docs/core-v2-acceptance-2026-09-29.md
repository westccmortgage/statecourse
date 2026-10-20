# Studio acceptance continuation — 2026-09-29 UTC

The owner's 2026-09-28 Studio product acceptance contract applies to one shared
Core V2. MARKEVITA factories are domain implementations, not a separate kernel.
Completion means an accessible final product with measured acceptance evidence,
not provider success, a passing build, or a terminal workflow alone.

## Historical CEO Admin run

Workflow `59f322b8-d89e-5837-ac54-52e985076070` remains `PARTIAL`: 185/185 units,
137 attention units, and four attempts whose responses were not received.
Provider minute-level usage confirms four calls in the matching minute but does
not establish individual output delivery or cost. No claim of successful
delivery follows from those aggregate counts.

At the owner's instruction on 2026-09-28 at approximately 20:50 America/Los_Angeles,
this historical reconciliation is no longer a dependency of independent V2
development and acceptance work. Preserve the unknown outcomes and $0.491520
reservation record; do not repurchase the four attempts or fabricate settlement.
Workflow `af4eb392…` stays outside this work.

PR #236 merged as `87d688f1ca71f6bca0c714dd512f2e0510c4286a`.
Its final head `f7c7bcbf7653f9b35daa0e8c02b85fe563c5ce2c` passed schema,
owner-authority, hold/resume, continuation/recovery and type checks in Actions
run `36389673826`. This is code-level proof; it does not assert that the owner
has adjudicated the production disagreements.

## Completion proof correction

The shared TypeScript completion predicate accepted empty criteria, blank
evidence, missing verdicts, missing verifier identity and truthy text in place
of booleans. Sixteen new runtime cases failed against the previous source.
Migration 070 also allowed an empty gate array, and SQL NULL could bypass the
nullable verifier equality in its CHECK constraint.

The correction requires explicit boolean facts, valid matching digests,
nonblank evidence, uniquely named gates and at least one required criterion.
Migration 073 enforces the same gate contract and requires the database proof
expression to be TRUE. Existing rows are revalidated; no historical evidence
or spending record is rewritten. Optional failed gates remain optional when a
required acceptance contract has passed.

Verification commands:

```sh
node --experimental-strip-types --no-warnings workers/core-v2/tests/completion.mjs
node --experimental-strip-types --no-warnings workers/core-v2/tests/video-episode.mjs
node --experimental-strip-types --no-warnings workers/core-v2/tests/markevita-adapter.mjs
bash workers/core-v2-runtime/tests/typecheck.sh
bash supabase/tests/run.sh
```

PR #237 passed Actions run `36519771747` at exact head `7cd87623`, including
the real PostgreSQL writes, 19 malformed gate contracts, valid delivery,
owner authority, human hold, continuation/recovery and typecheck. It merged as
`c9c3d92c57df26aa095a85bb703b22484124915e`; production deployment run
`36519958633` succeeded. Live read-back confirms migration 073 is installed,
empty gates return false and measured required gates return true.

## Human-hold acceptance proof

The full kernel suite exposed 24 old assertions left behind by PR #236's
workflow-wide human hold. The same failures were reproduced on unchanged
`87d688f` before changing the tests. Tests now expect `needs_attention` with
preserved blocked work instead of assuming new work continues to `partial`.
The positive total-derivation proof remains in a separately verified fixture;
timeout capacity is tested on discovery work that does not also create a blind
reading hold. Freeing a provider slot is explicitly insufficient to clear a
human hold. CI now runs the complete kernel suite, including both repository
contracts and PostgreSQL restart, rather than a few selected kernel tests.

Running both repository contracts also exposed a real test-double gap: its
direct lease and submission methods did not enforce the database's human hold.
The memory repository now checks both held decisions and disputes. The shared
contract proves that queued/prepared work waits, while already submitted work
keeps its heartbeat and may record its result. Raw-result storage checks use
an independent workflow instead of accidentally trying to lease in a held one.

PR #238 passed Actions `36520851719` at exact head `5a3d017b`: all 21 kernel
suites, both repository implementations, migrations/invariants, owner authority,
human hold, continuation/recovery and typecheck. It merged as
`8ce0496855fefda6f006619e41cdbf0c36c87873`; production deployment
`36520995029` succeeded. The combined kernel/runtime/canary/runner typecheck
also passed locally.

## Existing factory audit

Read-only `https://markevita.onrender.com/healthz` returned build
`a34d577891a401af9e926c49e496a5c23c45566c`, live mode, Supabase storage and
zero configuration problems. Netlify's published deploy
`6ab89ded8acfaf00082b66e4` serves public `main` at `0008277`; its `/studio/*`
proxy points to this Render service. These are separate deployment sources.

MARKEVITA PR #7 at `657294ad` has a successful production-regression CI run
`36349721488`: **789 passed**, confirmed in job `108705906788`. A fresh
isolated source copy matches all 189 file blobs of that
head. The adapter, Course Factory/customer authentication and Instant Video
focused suites passed locally: 98 tests, real local ffmpeg, no provider calls.
These checks prove code and locally generated fixtures, not a new live paid
product. The PR adds an adapter and does not yet connect an existing production
caller to the shared kernel. Do not present its presence as live orchestration.

Concrete remaining product work, in the existing implementation:

| Surface | Existing proof | Remaining acceptance gap |
| --- | --- | --- |
| CEO Admin historical workflow | Live state remains `partial`, 185/185 units, 137 attention; no new purchase | `PARTIAL`, not completed; individual unknown outputs remain unproven, independently of further development |
| Course / Game / Assessment | Customer/guest entry, persisted product, compiled player, bounded validation corrections and runtime-path checks | `course_products.py` stores a build result but has no durable per-call checkpoint; stale builds tell users to run again. `course_factory.py` calls a provider directly with SDK retries and no shared-core authorization/reservation record at that boundary. Connect to existing core execution/authority before claiming resumable, budget-proven completion |
| Instant Video | Existing short-intent entry, authorized demo ceiling and reattachment to existing jobs | Admin-only entry; `instant_video.py` records `instant.done` from a done job plus a nonempty masters list. Require independent final acceptance proof through the shared core, preserving existing takes and routing |
| Marketing | Existing route `/studio/marketing` | Currently renders `factory_landing.html`; no campaign execution/delivery path is implemented there |

No MARKEVITA production restart, old video regeneration, historical CEO
adjudication or new paid execution occurred in this audit. The authenticated
browser connection did not complete, so current production job activity could
not be checked. Available database connections did not establish access to the
Studio job store. Keep deployment/job-activity proof distinct from a passing
health endpoint; do not restart potentially active paid jobs based on health
alone.

## Remaining product proof

Do not describe V2 as 100% accepted until the new-user, short-intent, Create,
execution, independent QA, bounded repair, restart, delivery and evidence path
has passed for each enabled factory. Kernel and database suites establish only
the layers they exercise. MARKEVITA PR #7 is still an unmerged runtime adapter
against `claude/series-studio`; its deployment and live wiring require separate
verification. The repository's `main` is not the Series Studio branch.
