# PR 24 Netlify Function reconciliation

Status: local candidate only. This worktree is based on current PR 24 head `7d22b6159a83f1b560072920231242c79d3418cf`; it is not the earlier readiness checkpoint `007d9bdda712d9a2a475bf1733775fb7f97895f1`. Nothing in this document authorizes an upload, deploy, database change, push, merge, payment operation, NMLS credit/certificate issuance, or regulatory-readiness claim.

## Why a new local candidate was required

The retained production deploy `6abbf3242b9d9e605eda349e` has no source ZIP, commit reference, or repository URL. The original 37 Function ZIPs required to complete draft deploy `6abfdd9f0074488206e3e838` were not found in the repository, local Netlify cache, retained handoff archives, or CI artifacts. Although the 37 baseline entrypoints and their shared inputs are byte-identical between retained PR 22 merge `84c38a6d7cea4644cbf1cab528a75c52375d0aa7` and current PR 24 head, that is source continuity evidence, not cryptographic proof of the live bundles or their unknown packaging toolchain.

The incomplete draft remains `deploy-preview`, unpublished, with zero Function uploads. Its preview returns HTTP 500 and must not be used for acceptance. Production remained on `6abbf3242b9d9e605eda349e`.

## Bounded local packaging boundary

- Repository runtime is pinned to Node `24.x` through `package.json`, `.nvmrc`, and `netlify.toml`; Functions explicitly target `nodejs24.x`.
- Direct build dependencies are pinned exactly: Netlify CLI `26.1.0`, `@netlify/zip-it-and-ship-it` `14.7.0`, and esbuild `0.28.0`.
- `STATECOURSE_CANDIDATE_BASE_HEAD=<verified-base> npm run build:functions:candidate -- /tmp/<new-directory>` creates a new local-only directory, packages configured protected inputs, and emits a manifest plus a SHA-256/size/input/route/runtime report for every Function.
- The schema-v2 report labels every output `modified_worktree_candidate_not_an_exact_head_or_live_artifact`, records the base commit separately, and hashes all 254 packaged inputs into a workspace-input digest. It does not claim that the modified tree is the base commit or equivalent to retained live ZIPs.

The reviewed candidate contains 45 Functions, both API v1 and v2 handlers, all targeting `nodejs24.x`. Its 254 packaged inputs have workspace digest `b35b7809dfeb54844d21478b572558afe93048247faa07424d4350887170c7cd`. All 45 ZIP sizes and SHA-256 values were re-read and matched the report. ZIP entry-name scanning found no `.env`, `.git`, private-key, credential-file, or `.npmrc` paths. An immediate repeat build produced identical canonical extracted content for 45/45 Functions; 26 ZIPs were byte-identical and 19 had different ZIP-container bytes. The reported SHA-256 values therefore identify this exact candidate but are not expected rebuild hashes. The durable local artifact is outside the repository at `../artifacts/statecourse-pr24-local-reconciliation-7d22b615/` and contains the 45 ZIPs, manifest, candidate report, and validation summary.

The earlier 45-Function candidate packaging run used Node `v22.22.3` while forcing and verifying the Node 24 deployment target. After committing the reconciliation, the focused 291-test suite, public-artifact build/privacy checks, and four protected Function bundle smokes passed locally on exact commit `2bfc4c1cd46d933db4043ae22155773f5304b656` with Node `v24.18.0`. Required native CI on the final exact head remains a separate gate.

`@types/node` remains on the repository's existing 22.x type surface intentionally: this reconciliation introduces no Node 24-only API and does not use a type-package update as a substitute for executing the candidate on Node 24.

## Test reconciliation

Two stale fixtures were corrected without changing runtime behavior:

- Michigan staff-auth fixtures now use a confirmed, unexpired AAL2 session, current staff binding, exact-session staff proof, and the current read-only staff-security RPC boundary.
- The Stripe runtime-safety test now matches the existing production behavior: configuration trims surrounding whitespace and sends the exact trimmed secret. The runtime helper already behaved this way at retained PR 22 source; no Stripe source path was changed.
- The packaged admin-workspace smoke fixture now exercises the current rate/check staff-security RPCs with a synthetic AAL2 JWT and exact-session proof cookie.

Focused behavioral verification: 291/291 passed, with no failures or skips. The selection covers staff/admin boundaries, learner accounts and recovery, Stripe/payment gates, governance, student portal, California/Michigan/NMLS flows, and protected video administration.

Protected bundle verification passed for `student-nmls-training`, `admin-workspace`, `enroll-training`, and `student-portal`. Each verified all 49 configured protected includes. The smokes require authentication, reject unauthenticated access, keep private assessment answers/rationales and synthetic credentials out of responses, load the 45-lesson training definition, and keep NMLS credit issuance false. The public-artifact scan checked 631 files (621 text files) against 187 private items and found zero violations.

## Isolated-preview plan and remaining gates

Do not complete the existing draft with rebuilt versions of the 37 baseline Functions. Its site-level environment can expose production-connected owner/auth/payment endpoints at a public preview URL, and source continuity does not prove byte identity with the live bundles.

A future preview needs separate authorization because the one authorized draft has already been created. The bounded option is a replacement draft containing only static course/practice surfaces and the eight new PE endpoints, with all PE enablement flags off and without baseline owner, payment, credit, certificate, or banking Functions. Any authenticated hosted acceptance instead requires a separately reviewed non-production Auth/database environment, synthetic named users, isolated storage, inert Stripe settings, denied credit/certificate/banking paths, and an explicit route/env inventory before upload.

Exact-head Node 24 CI, hosted two-learner/assigned-instructor isolation, revocation, exact ROCS version/hash/time-before-instruction, interrupted/repeated recovery, and desktop/mobile navigation remain acceptance gates. Production, database, owner login, payments, and NMLS credit/certificate/banking state must remain unchanged.
