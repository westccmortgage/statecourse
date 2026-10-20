# Alaska and Texas coach correction — verified production result

Published code: `f770fad7b6484a96a93a91a57027b0b09430b2d5`, main/production, deploy `6ad701cd0afe1300714ffcb4`, ready and published `2026-10-20T05:53:55.711Z` (October19,22:53 Los Angeles). Netlify's UI and API agree; all41 functions use runtime API2.

Four fresh OpenAI/gpt-4.1-mini samples succeeded and were manually compared against all expanded cited excerpts: Alaska original generic distinction/example request; Texas direct sponsorship-permission question; Alaska unrepresented-buyer/AS08.88.620 boundary question; Texas original generic request. The observed Alaska claims now match the cited duties/relationship passages, and Texas retains permission for sponsored sales agents acting for the broker instead of claiming they need their own broker license for those acts. These four targeted source-fidelity findings pass; this is not a portfolio-wide educational/regulatory acceptance. Some responses remain longer than requested. The separate Mortgage Reg B application/completed-application semantic finding remains open.

The final provider protocol supplies server-generated paragraph IDs and asks the model to select an existing source+passage for each statement. The server checks those choices, assembles explanation/citation IDs, and refuses invented evidence. It does not ask the model to transcribe a quotation. Initial stricter quote-copy protocols returned503 and are superseded: the allowlisted diagnostic header identified quote mismatches. One retry pair after deployment returned409 because the client retained earlier request IDs; fresh page loads produced the four successful samples. No failed attempt is counted as passing acceptance. No semantic theorem/proof is inferred from passage-ID membership; the factual review was manual.

Validation:326 relevant tests pass,0 skipped, including coach, SQL/DOM, access, Stripe/payment, admin, student and stream regressions. Pinned lint828 files,0 errors/116 existing warnings. Native bundler identifies all41 functions as API2. Site build/privacy scan and all5 answer-key protection checks pass. Provider input for all329 teaching contexts with a near-limit synthetic question remained below14,000 bytes (maximum11,478).

Hosted checks after runtime repair: Core health200 with paid analysis/provider calls false; public coach config200 openai/enabled; private coach GET405; invalid-method student/admin/checkout/webhook requests405; Admin Console303 to staff verification. Public payment configuration still reports mode live / productionPaymentsEnabled true /10 courses, matching existing deployment variables. No transaction was created. Existing provider keys, environment variables, $1/day coach cap, source permissions, grades, completions and regulated-course gates were not changed. Protected build.json was not reverified because staff proof expired.

Evidence: `work/coach-browser/ak-tx-corrected-samples-20261020.json` (four answers and all disclosed sources), `texas-coach-corrected-20261020.jpg`, `ak-tx-hosted-transport-20261020.json`, `ak-tx-release-20261020.json`. The temporary test/lint logs are listed in the release receipt. Production implementation is f770fad; this verification-only documentation update skips rebuilding an identical code tree.

## Historical implementation and deployment record

# Alaska and Texas coach correction — October 19, 2026, Los Angeles

Requested scope: correct the real coach samples that attributed Alaska representation duties to citations not containing them and contradicted Texas broker sponsorship permissions. Authored curricula and source text are unchanged.

Both existing provider adapters now require 1–3 evidence entries, each pairing the exact explanation text with a supplied source ID and a short verbatim excerpt. The server rejects invented/absent quotes, wrong citations, evidence-free answers, and explanation text outside these entries, then returns the existing public response shape. The shared instruction requires preserving conditions/exceptions and forbids adding duties or requirements from memory. Provenance checks do not prove logical entailment; manual source review remains necessary. Refusals use no fabricated sources. Existing model, 800-output-token limit, 15-second timeout, provider keys, $1/day reservation ledger and access controls remain unchanged.

Prepublication validation:66 coach/provider/library/DOM/private-endpoint/SQL tests passed, zero skipped, including real embedded SQL. Lint827 files, zero errors,116 existing warnings; site build/private artifact scan and5 answer-key protection checks passed. Negative regression cases reject unsupported Alaska duty quotations and an ungrounded Texas prohibition. Provider HTTP fixtures were updated to the new internal evidence protocol. This patch is based on main aaf5885, preserving the newer Core integration and documentation.

Real generation and source review on the published release remain to be completed. Reg B semantic finding is separate and remains open. No course approval, assessed answer, grade, completion or regulated launch is changed.

## Deployment continuation

Code commit b2a5ff8fae63a98178b1eb8a0127c1f556587f3a was written to main with an expected-head lease on aaf5885. Git CD deploy6ad6fbab7d58668aad240af4 completed build and bundling, then failed function upload because the existing Lambda environment exceeded4KB. No failed artifact published; af6608a stayed live. No environment variable or credential was changed. A standard createSiteBuild request of the exact tracked Git source ZIP is used next, matching the already successful Core publication method; no function ZIP mutation or runtime migration is included.

## Required hosting repair

The exact-source standard build6ad6fcc020c9c99c666113d2 also failed the existing Lambda environment limit. No failed release published and no environment/secret was changed. The safe forward repair uses official @netlify/aws-lambda-compat2.0.2:28 legacy entrypoints now export a modern default wrapper and expose the original function as legacyHandler for internal callers/tests. Original implementation text is preserved, with only the named export and one cross-handler import renamed; a mechanical comparison confirmed all28. No financial rule, authorization check, webhook behavior or deployment environment value is changed. Existing modern Core/private training handlers retain their format.

The official Netlify bundler packaged all41 functions as runtime API2. Three dedicated regressions verify every migrated endpoint's method denial without network requests, signed JSON bytes/auth/cookies/query parameters/multiple Set-Cookie headers, and binary request/response preservation. The expanded324-test suite passes with no skips, including payment/Stripe/admin/student/stream/coach/DOM/SQL coverage. Lint828 files,0 errors/116 warnings; site build/privacy scan and5 protection checks pass. The new dependency is pinned and existing dependency versions retained.

Official guidance: https://developers.netlify.com/guides/migrating-to-the-modern-netlify-functions/ . This repairs the observed deployment failure; hosted behavior and AK/TX semantic samples still require verification after the forward release.

## Hosted continuation after transport repair

Modern transport publication aa27292 /6ad6fed3522e436f7653f0e9 succeeded at2026-10-20T05:41:19.976Z; all41 deployed functions report runtime API2. Core health200 remains provider/analysis OFF, public coach config200 openai/enabled, private coach GET405, student/admin/payment/webhook invalid-method checks405, and Admin Console303 to staff verification. No payment transaction or source permission changed. Initial strict-evidence calls returned503; these failed samples are not quality passes.

Sanitized provider diagnostic codes were added without logging learner text, model output or keys. The settings overlay now preserves lazy/non-enumerable deployment credentials; its regression fails on the prior spread and passes on the proxy, but this is not yet established as the hosted failure cause. The evidence protocol was compacted to status/refusal/evidence/nextStep, with server-assembled explanation and citation IDs. This removes duplicated generated text and independently generated citation lists. Copied source words are checked after normalizing whitespace and decorative emphasis; changed conditions/words are still rejected. A safe response diagnostic header carries only allowlisted categories on provider failures. Refusal text is separate and has no invented sources. The modern public coach handler is the one exception to the unchanged28 handler-body comparison, adding only that diagnostic header; other27 implementations retain their original behavior.

60 related tests pass, no skips, after the compact response change, including the new Markdown-equivalence case. Final real AK/TX acceptance is still pending.
