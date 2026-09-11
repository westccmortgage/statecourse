# Florida — regression baseline against a built `main`

Captured **30 August 2026** on branch `claude/florida-frec-phase0-klhwu5`, against `origin/main` at `c8c0f60`.

Phase 0 v1 reported "33 failures on both main and the Florida branch". That was diagnostic
evidence, not an acceptance baseline: it was taken by running `node --test` **without** running the
repository's documented build first, so it measured a state neither CI nor a developer would ever be
in. This is the corrected version, taken after the documented install and build sequence on both
sides.

## Result

| | tests | pass | fail |
|---|---:|---:|---:|
| `origin/main` @ `c8c0f60`, built | 1015 | 996 | **19** |
| `claude/florida-frec-phase0-klhwu5`, built | 1046 | 1027 | **19** |

**Florida introduces zero failures.** The failing sets are identical — `comm` over the two sorted
lists returns nothing in either direction. `tests/florida-foundation.test.mjs` contributes 53 tests,
all passing.

### `origin/main` is moving under this branch

Worth recording, because it caught out an earlier measurement. Between the first attempt at this
baseline and the reproducible one, **`origin/main` advanced 13 commits**, from `b38c81a` to
`c8c0f60` — all of it active Texas Law of Agency work. The first attempt had created its comparison
worktree from a stale local `origin/main` ref and so measured 993 tests; the script fetches first
and measured 1015. The 22-test difference is entirely Texas Law of Agency tests that did not exist
at the older commit.

Two consequences:

- **Always `git fetch origin main` before creating the comparison worktree.** The script does.
- **This branch is deliberately NOT rebased onto the new `main`.** Florida's isolation rules forbid
  merging Texas work, and the Texas session is actively pushing. The branch remains based on
  `b38c81a`. The comparison above is still sound — and in fact stronger — because it measures the
  Florida branch against the *current* main, 13 Texas commits included, and still finds no
  regression.

**The platform is not green, and this document does not claim it is.** Florida-specific tests are
green while platform integration is separately blocked, and those are two different facts.

## Reproduce

```bash
# once per checkout
npm run install:ci

# then, on each side
npm run build          # exits 1 — see "The build is broken on main" below
node --test tests/*.test.mjs
```

`scripts/florida-regression-baseline.sh` runs the whole comparison, including creating and removing
the clean `origin/main` worktree.

Two notes on doing this by hand:

- `npm test` is `npm run build && node --test tests/*.test.mjs`. Because the build exits non-zero,
  `npm test` never reaches the tests. Run the two steps separately.
- The `main` worktree needs `node_modules`. Symlinking the primary checkout's is sufficient and
  avoids a second 793 MB install:
  `ln -s /home/user/statecourse/node_modules /tmp/base-main/node_modules`

## The build is broken on `main`

This is the root cause of all 19 failures and it has nothing to do with Florida.

`scripts/build-verified.sh` line 23 runs:

```
node "${script_dir}/sync-california-pdf-downloads.mjs"
```

**That file does not exist**, and `git log --all` shows it has never existed in this repository.
`git cat-file -e origin/main:scripts/sync-california-pdf-downloads.mjs` fails. So the build aborts:

```
Error: Cannot find module '/tmp/base-main/scripts/sync-california-pdf-downloads.mjs'
```

It aborts **after** `scripts/generate-national-platform.mjs` has run — which is why the failure count
drops from 33 (no build at all) to 19 (partial build) — and **before** `vinext build`, so no `dist`
is ever produced.

That single fact explains every one of the 19. It is a pre-existing platform defect on `main`,
outside Florida's scope, and it is **not** fixed here: repairing a shared build script while the
Texas workstream is active is exactly the kind of change Florida's isolation rules exclude. It is
recorded in `docs/florida/shared-file-change-proposals.md` as a proposal.

## The 19 failures by subsystem

### California DRE form filling — 9

The RE 306, RE 313 and RE 336 form-fill assertions. These depend on filled PDFs the aborted build
step never produces.

- 15A names the arrangement the regulation names
- 15B claims in-person proctoring only because the platform actually does it in person
- RE 306 carries the school, the course and the examination as the manifest states them
- RE 306 leaves the sponsor number, both dates and every signature empty
- RE 336 leaves the instructor's own question for the instructor
- RE 336 leaves the place of execution to be written with the date
- item 23A answers yes for the practice course and no for the other two
- neither form carries a DRE sponsor id
- every filled field is legible and fits its field on the page

### California print volume and traceability — 6

Print volumes and the SB 1495 traceability matrix are build outputs. Without them the page-count
assertions have nothing to count.

- RE 313 carries the volume's real page count, not an instruction to count it
- every course has a built print volume
- the first filing's volume meets the Department's page benchmark
- the page count a reviewer is told is the page count they receive
- the printing instructions state the page count of the volume that will be printed
- the traceability matrix regenerates cleanly from the course

### Build artifact and deploy — 4

`vinext build` never runs, so there is no `dist` for these to inspect.

- the build produced the artifact netlify.toml publishes
- every 200 rewrite in netlify.toml points at a file the build produced
- no page violates the Content-Security-Policy the deploy sets on it
- every page is a complete document with a title

## A side effect worth knowing about

Running the suite **modifies a tracked California file**:
`california/submission/02_Real_Estate_Practice/07-sb1495-traceability.md`. The SB 1495 traceability
test regenerates the matrix, and because no print volume exists it writes `volume not read` into the
"Printed volume" column in place of real page numbers.

That is churn from an incomplete build, not a Florida change, and it must not be committed. Revert
it after any suite run:

```bash
git checkout -- california/submission/02_Real_Estate_Practice/07-sb1495-traceability.md
```

`scripts/florida-regression-baseline.sh` does this automatically and refuses to finish if any
non-Florida file is left modified.
