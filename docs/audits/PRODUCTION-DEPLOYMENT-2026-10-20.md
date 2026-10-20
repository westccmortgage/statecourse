# Production coach verification — October 19, 2026, Los Angeles

## Current result — functional pilot verified, broader gates remain open

Production code commit **`bf0433a4d7cc1fafa2f370fc43ced76142fcf36c`** is published in Netlify deploy **`6ad6e8e5ebf75c110bf19d98`**, main/production, ready, published **2026-10-20T04:07:37.481Z**. Netlify published-deploy UI and connector agree. This includes the settings fix f042f4d, source-distinction/refusal prompt correction8209b03 and current Gemini thinking-control compatibility. After the owner restored staff access at approximately21:26 Los Angeles, authenticated `/admin/console/build.json` directly confirmed commit `bf0433a4d7cc1fafa2f370fc43ced76142fcf36c`, branch `main`, context `production`, builtAt `2026-10-20T04:07:15Z`. This closes the direct protected-build verification gate. The older bd8319e JSON readback below is historical.

The coach is enabled with **OpenAI / gpt-4.1-mini as the restored default**, exact origin https://statecourse.com, conservative input/output reservation ceilings $0.40/$1.60 per million, and a **shared $1/day cap (UTC accounting day)**. Configuration is in the RLS-protected service-only settings row, avoiding extra Lambda environment entries. Existing OpenAI/Gemini credentials are unchanged and real generation authenticated both. Gemini/gemini-3.5-flash-lite also succeeded, temporarily using input0.4/output2.5 ceilings before restoring OpenAI/output1.6. Official standard Gemini 3.5 Flash-Lite rates are $0.30/$2.50 per million: https://ai.google.dev/gemini-api/docs/pricing. No account/key creation or connection change was needed.

| Production acceptance | Observed result |
| --- | --- |
| Authenticated served build | Protected build.json directly matches bf0433a / main / production, builtAt2026-10-20T04:07:15Z, after owner reauthentication |
| Real Estate OpenAI | Genuine fixture/personal-property and joint-tenancy explanations; source disclosures expand to the matching current lesson text |
| Mortgage OpenAI | Genuine answer in the existing owner's first non-credit unit; manual review detected a legal-term conflation, prompting a shared instruction correction and repeated sample |
| Gemini current model | Genuine source-grounded Real Estate concurrent-ownership and Mortgage application/TRID explanations; original Mortgage question distinguishes the two triggers without the earlier conflation |
| Protected exams / grade / approval requests | Both providers returned insufficient-sources refusals; corrected responses identify the coach boundary without fabricated lesson citations; no protected answer or state change |
| Unsupported state claim | Gemini Mortgage declined California CE requirements from a national lesson; no state requirement was invented |
| Consent | Missing consent blocked in both UIs; stale OpenAI consent after switching to Gemini returned unavailable without an answer; reload/resume displayed Google Gemini with consent cleared |
| Generated-answer clearing | Real Estate lesson change cleared actual answer/question/consent; Mortgage pause removed panel; sign-out cleared generated private content and revisit displayed “Your account session ended. Sign in again. Private lesson content has been cleared.” |
| Desktop/mobile | Real Estate and Mortgage generated answers inspected at desktop widths and390px; exact mobile DOM client/scroll widths390/390. Real Estate per-tab emulation corrected a browser-wide override that only affected Mortgage; intermediate incorrectly scaled screenshots are not mobile evidence. Explicit viewport/emulation overrides were removed afterwards |
| Durable application accounting | Live SQL readback:13 requests,11 complete,2 failed;95,761 micros ($0.095761) reserved against1,000,000-micro cap. Failures include the synthetic1-micro probe and one old Gemini2.5 request. Retained response models include gpt-4.1-mini and gemini-3.5-flash-lite; retained usage17,836 input/1,459 output tokens is not a lifetime/provider bill because response retention is10minutes |
| Shared budget / permissions | Earlier assertion-based production SQL rejected a cross-identity over-cap reservation and verified RLS/service-only RPC; real successful calls now prove app-to-RPC execution. Identical request retries replayed previous answers without additional reservations |
| Course controls | Mortgage stayed0/45 units and0/8 module practices; no knowledge-check answer graded or unit completed. Normal resume/activity/sign-out bookkeeping occurred. No payment, webhook, regulatory credit, approval, certificate or reporting control was changed |

Validation of the final code: 43 targeted settings/coach/provider/private-endpoint tests plus the real embedded PGlite SQL test passed (**44 targeted, 0 skipped**). Negative cases reject forbidden settings/credential overrides, invalid budgets/types/SQL keys, unauthorized or changed contexts and revoked access in isolation. `bash site/build.sh` passed with 284 public lessons, 45 private units, 6,666 chunks, zero private artifact violations and all 5 answer-key protection tests; `git diff --check` passed. **Lint remains unverified: eslint is absent.** No dependency was installed or changed.

**Remaining unverified:** revocation of an actual production enrollment (isolated revocation/late-answer suppression tests passed; the owner's enrollment was not revoked); portfolio-wide semantic quality, learning effectiveness and regulatory acceptance. Responses are manually reviewed samples, not proof every generated statement is correct. Old Gemini2.5 failure's upstream cause is not identified; current3.5 succeeds with the same existing key. No regulated launch readiness or provider/course approval is inferred.

Evidence files remain in `work/coach-browser/`: `live-coach-results.json`, `live-openai-real-estate-final-desktop.jpg`, `live-gemini-mortgage-mobile.jpg`, and `live-gemini-real-estate-mobile.png`. The wrongly scaled Real Estate .jpg is superseded by the exact390×844 .png. Previous configuration/scope/fingerprints and rollback records follow below. Rollback disables only the coach settings row, preserves accounting and leaves unrelated production configuration unchanged; protected originals are recoverable outside Git.

## Historical execution record

## Publication authorized — October 19, 2026, 20:52 Los Angeles

The owner authorized publishing the reviewed fix in a new commit, replacing the original exact-revision constraint. Scope remains the coach settings loader, two coach endpoints, the explicit control-script update, tests and evidence/Launch Control documentation. The shared $1/day cap and existing provider keys are preserved. Production application settings table/row must be checked before applying the script; prior control-function source is recoverable from the original commit and prior script record. New configuration is disabled until the guarded generation test is ready; rollback sets its enabled value false and preserves the ledger. No other environment setting or production function is modified.


## Historical snapshot — activation attempt before publication

**Production still serves `bd8319ec758b0f6e08aaf178704064984954d833` from deploy `6ad6d1fbefcea6ce2fecda4a`; generation remains disabled.** Two authorized same-commit activation deploys (`6ad6df229e7e156f60f6ba3d`, `6ad6e0265dded3ad1620e6bf`) built successfully but failed before publication because the legacy Lambda environment exceeded 4 KB. The second used only the seven required coach variables and a 32-character random secret; it failed for the same reason. All newly added coach variables were removed to restore their original unset baseline, including the provider override. Existing credentials and other settings were not changed. The original coach budget ledger/control function remains installed and SQL-tested; one synthetic failed reservation of 1 micro is retained, with no model call or provider charge.

A local, unpublished fix now keeps coach configuration in a singleton RLS-protected `learning_coach_settings` table, readable through the existing service-role-only control RPC. The explicitly reapplied `database/learning-coach/001_control.sql` creates this table disabled and preserves an existing row. No new Lambda environment entries are needed. Both coach handlers load only eight allowlisted string settings; stored data cannot replace provider keys or backend bindings. Existing deployment configuration, including an emergency disabled flag, still takes precedence. The public configuration response exposes only provider/enabled. Other functions, payment flows, grades, progression and regulatory controls are unchanged by the patch.

**Local validation:** 42 coach/settings/provider/private-endpoint tests passed; the embedded PGlite SQL test passed with the actual installed module (43 targeted tests total, zero skipped). Negative cases reject credentials/backend overrides, non-string settings, invalid budgets, an invalid singleton row and forbidden SQL configuration keys. SQL reapplication preserves existing settings; anon/authenticated cannot read the settings table or execute the RPC; RLS is enabled. `bash site/build.sh` passed with 284 public lessons, 45 private units, 6,666 chunks, zero private-artifact violations and all five answer-key protection tests. `git diff --check` passed. `npm run lint` could not run because `eslint` is not installed in this checkout; it did not produce a lint result. No dependency was installed or changed.

**Not applied to production:** the new settings-table/script revision, loader, handler patch and tests. Publication requires a new commit, which differs from the originally required exact revision. No push or source deployment was performed. Before publication, review this concrete patch, authorize the changed commit, reapply the reviewed control script and populate only the coach settings row with the protected hash secret and the agreed $1 daily cap. Record its prior state (table absent/row absent unless a fresh readback shows otherwise) and rollback: disabled configuration row; preserve accounting. Then deploy with `bash site/build.sh` through the existing project and perform real provider acceptance.

**Still unverified:** working OpenAI/Gemini authentication/responses; production citations/refusals and semantic source support; provider-switch consent; application-to-ledger RPC execution; generated-answer clearing on lesson changes/logout and live revocation. Earlier desktop/mobile unavailable-state checks remain valid only for the old disabled production snapshot. The staff verification window expired during this continuation: the latest protected build.json request redirected to staff sign-in; earlier authenticated readback confirmed the revision, and the Netlify connector still confirms the original ready deploy is published. Student training was left paused at 0/45 units and 0/8 module practices; no new teaching session, answer or completion was submitted in this continuation.


Verification performed October 20, 2026 UTC. **The requested commit is published; AI production acceptance is blocked.** This report distinguishes live observations from isolated tests. It does not activate a course or approve launch.

## Deployment and build

- Repository: `westccmortgage/statecourse`; inspected `AGENTS.md`, `docs/environment.md`, current package scripts and coach acceptance documentation.
- Expected and Netlify-published commit: `bd8319ec758b0f6e08aaf178704064984954d833`.
- Existing project: `chipper-maamoul-a2b9d5`, site ID `b514a8f8-782b-448c-8881-a914ee42c69b`.
- Current production deploy: `6ad6d1fbefcea6ce2fecda4a`, ready, branch `main`, published `2026-10-20T02:29:50.270Z`. Both the project connector and authenticated Netlify API identify this published revision. No redeploy was needed or performed.
- Fresh checkout of the exact revision: `bash site/build.sh` passed. The build regenerated 284 public lessons, 45 private units and 6,666 chunks, passed the private-content artifact scan, and passed all five answer-key protection tests. Local `build.json` correctly says `local-build`; it is not production evidence.
- Five served public assets match the expected checkout byte for byte: `learning-coach.js`, `learning-coach-private.js`, `learning-coach-reading.js`, `learning-coach-context.json`, and `learning-coach-library.json`.
- Initial anonymous `GET /admin/console/build.json` returned 303 to staff verification. After the owner restored access, authenticated browser readback **confirmed** `commit: bd8319ec758b0f6e08aaf178704064984954d833`, `branch: main`, `context: production`, `builtAt: 2026-10-20T02:29:28Z`. This is direct production JSON readback, in addition to Netlify's published-deploy identity.
- The CLI's inherited default site resolves to another project. All Netlify API inspections explicitly used the StateCourse site ID. No linking or deployment through that default occurred.

## Live runtime observations

| Check | Observed result | What it proves |
| --- | --- | --- |
| Public coach configuration | 200 with `{"provider":"openai","enabled":false}` | Runtime is disabled; this is not a model response |
| Valid pinned Real Estate question, explicit OpenAI consent | 503 `coach_unavailable` | Generation is unavailable |
| Missing consent | 400 `invalid_request` | Admission rejects this request |
| Changed lesson digest | 409 `unsupported_or_changed_context` | Context integrity rejection executes live |
| Mortgage coach POST without student session | 401 `coach_unavailable` | Anonymous caller cannot obtain private coaching |
| Mortgage coach POST from foreign origin | 403 `coach_unavailable` | Cross-origin admission is rejected |

Netlify's site-variable inventory contains no `LEARNING_COACH_*` entries; the team-level variable inventory is empty. Required enablement, model, exact origin, identity-hashing secret, positive input/output price ceilings and daily budget are absent. Specifically: `LEARNING_COACH_ENABLED`, `LEARNING_COACH_MODEL`, `LEARNING_COACH_ORIGIN`, `LEARNING_COACH_HASH_SECRET`, `LEARNING_COACH_INPUT_USD_PER_MILLION`, `LEARNING_COACH_OUTPUT_USD_PER_MILLION`, and `LEARNING_COACH_DAILY_BUDGET_USD`. Provider selection defaults to OpenAI. `OPENAI_API_KEY` and `GEMINI_API_KEY` have masked production entries with Functions scope; plaintext, key validity, account billing and model availability were not established. No key was printed, created, replaced or transmitted to a different provider.

The production backend binding is `gdldvjefibssxnrpsxja`. None of the five connected Supabase accounts lists that project. Opening that exact project in the browser redirected to Supabase sign-in; this is a separate login from the restored StateCourse session. A zero-row anonymous Data API check returned PGRST205 for `public.learning_coach_requests`; a restricted API role cannot establish whether the table/migration is absent or deliberately invisible. **Production installation and execution of `database/learning-coach/001_control.sql` remain unverified.** No production migration or reservation was made.

## Rendered production UI

Real Estate free practice was inspected at 1440×1000 and 390×844. The coach names OpenAI, presents its data disclosure, and blocks sending without consent. Actual requests at both sizes displayed “The AI coach is unavailable. Ordinary practice still works.” Mobile document width and scroll width were both 390 pixels. Changing from California Principles lesson 01 to lesson 02 cleared the question, consent and previous error/retry state. There was no generated answer to test clearing in production. The ordinary formative question still graded an incorrect answer and displayed the existing explanation and first-attempt progress.

The initial anonymous Mortgage training shell required a student enrollment. After the owner restored access, the existing account exposed one active free Mortgage enrollment (version 2026.3). Its current first unit was resumed through the ordinary UI. Desktop controls were exercised at 1440×1000 and the mobile coach was visually inspected at 390×844; mobile document and scroll widths were both 390. The coach named OpenAI, rejected submission without consent, and displayed “The AI coach is unavailable. Continue your lesson or retry the same question.” for actual consented submissions at both widths. No successful model response was obtained. Pausing removed the coach panel. The existing student had provisional first-unit time before testing; normal resume/pause and activity bookkeeping occurred during this check. No answer was selected or graded, no unit was completed, and completion counts remained 0/45 units and 0/8 module practices. The session was left paused.

The signed-in administration console identifies the account's owner role. Its Connections view reports Stripe mode `live` and the global live-payment switch enabled, with per-offering approval/activation still required. These are observed existing settings, not checkout/webhook acceptance. They were not changed. The remaining production gaps are actual OpenAI/Gemini responses, citations/refusals, provider-switch consent, enrollment revocation and clearing real generated answers after lesson changes/logout. Logout was not exercised on the newly restored owner session because no generated answer existed to verify. No credential or new enrollment was created.

## Isolated checks — not live AI evidence

- Initial targeted coach/library/comparison/HTTP/free-practice suite: 84 passed, 0 failed; SQL and private DOM checks initially skipped for missing dependency paths.
- Those two checks were then executed with PGlite and LinkeDOM as part of the Mortgage DOM/client/service/HTTP/persistence suite: 60 passed, 0 failed, 0 skipped. This included durable admission, replay, quota, permissions and retention; late answer suppression after access/unit changes; provider consent and key separation; actual isolated SQL persistence; revocation; deterministic assessment/remediation; and no coach progress/time write.
- Existing Stripe runtime-safety and integrity tests passed (45 cases).
- Provider adapters used synthetic outputs in these tests. No real OpenAI or Gemini response, educational quality result, live citation, or live model refusal was obtained.

## Remaining blockers and next acceptance steps

1. **Done after access restoration:** authenticate the staff session and read `/admin/console/build.json` itself; the expected commit matches.
2. Connect the existing production Supabase project, inspect the coach migration and grants, and verify durable admission/replay/global budget behavior there. Do not infer installation from local SQL tests or anonymous visibility.
3. Establish the production coach provider/model, independently verified current price ceilings, explicit daily cap and recoverable protected identity secret. Preserve prior values/scopes and restoration instructions before any change, as required by `AGENTS.md`.
4. Verify both provider connections using the existing guarded application path. Provider switching requires matching named consent and a settings redeploy; a masked key entry is not evidence of authentication.
5. Complete the enrolled-student Mortgage E2E with working generation and access revocation/logout checks. Desktop/mobile controls, named consent and pause removal were exercised on the existing owner enrollment; generated-answer acceptance remains blocked. Exercise source-grounded answers, unsupported/protected-exam refusals, citation correspondence and clearing actual answers. Record substantive responses and reservation effects, not merely HTTP status.

Production settings, credentials, schema, payment mode, payment enablement, enrollment membership, grades, regulated progress, approval, certificate and reporting controls were not changed. No payment, webhook, credit or regulatory transaction was initiated. Public anonymous practice recorded its device-local formative test answer. Mortgage testing used normal non-credit resume/pause bookkeeping without submitting answers or completing units. Launch Control boards were updated locally to reflect this evidence; documentation edits have not been pushed or deployed over the requested commit.


## Owner-authorized activation continuation — October 19, 2026, 20:12 Los Angeles

The owner explicitly approved configuring and enabling the production lesson coach with a shared $1/day cap and repeating acceptance. This includes the existing guarded application provider path; existing provider keys are to remain unchanged.

Pre-change database readback, via the authenticated dashboard for `gdldvjefibssxnrpsxja`: `to_regclass('public.learning_coach_requests')` and `to_regprocedure('public.learning_coach_control(text,jsonb)')` both returned NULL. Both objects are absent, rather than merely invisible to an anonymous role. No preexisting coach data or function definition requires recovery.

Planned database change: execute only the checked-in `database/learning-coach/001_control.sql`, which creates the coach request ledger and service-role-only control function, enables RLS and revokes public/student access. It does not modify learning, enrollment, payment or regulatory tables. Rollback: keep generation disabled; revoke service-role EXECUTE on the new function to stop admission while preserving any request ledger for accounting. Remove newly created objects only after an explicit retention/data review; no destructive rollback is authorized here.

Netlify baseline: runtime GET still reports OpenAI/disabled. Previous audit found no LEARNING_COACH variables. All coach keys must be individually rechecked before writes; record unset/value and scope. Existing OpenAI/Gemini keys will not be replaced or retrieved. A broad variable-inventory call was rejected by automatic review; only narrow/redacted alternatives may be used. Local CLI writes to its preferences directory and local outbound DNS are unavailable; these are operational constraints, not production changes.


### Database activation observations

Authenticated Supabase browser access succeeded through the existing GitHub session. The exact production project is `StateCourseProject` in organization `StateCourse`, ref `gdldvjefibssxnrpsxja`; its project dashboard ultimately reported Healthy. The checked-in control migration was executed through the SQL editor, which returned “Success. No rows returned.” No project/account connection or credential was changed.

A subsequent assertion-based SQL transaction exercised reservation, duplicate detection, payload conflict, completed-response replay and a shared budget across different identities: a 999,999-micro reservation under a 1,000,000-micro ($1) cap admitted, while a 2-micro request from a different identity was rejected as `limited`. It asserted RLS enabled, anon/authenticated EXECUTE denied, and service_role EXECUTE allowed. The transaction rolled all test writes back; the visible result reported PASS and zero retained rows. This establishes the control function's production SQL behavior, not deployment-to-RPC connectivity or provider success.

One later synthetic durable-probe reservation of 1 micro was admitted without any provider call. Its request ID is `7f0c33c2-a49d-4577-a030-b1b4f0f7b040`. Follow-up status is recorded below once observed; do not report a cross-request persistence result until then.

Netlify connector identity confirms the project owner's existing login is `crdpartners2020@gmail.com` (Google/password login). The browser's GitHub login led to a different account without project access. The correct Google login is now waiting for the owner's passkey confirmation. No Netlify coach setting or provider credential has yet been changed, no redeploy was triggered, and runtime generation remains disabled. Remaining activation requires narrow coach-variable baseline readback, server-only settings and protected secret handling, redeploy and real provider/browser acceptance. This permission remains authorized; do not ask the owner to approve the $1/day setup again.

Current pricing reference for candidate compatibility checks: https://developers.openai.com/api/docs/models/gpt-4.1-mini lists $0.40 input / $1.60 output per million tokens, Responses and structured-output support, and marks the model deprecated. It is a candidate requiring actual availability testing, not a selected working model. https://ai.google.dev/gemini-api/docs/pricing lists Gemini 2.5 Flash-Lite standard text pricing of $0.10 input / $0.40 output per million. Verify the ultimately selected model and prices before setting limits. No pricing value was applied to production.


### Netlify pre-change record

Correct Netlify browser access was restored after restarting an expired OAuth state. The project's Environment Variables page, filtered to `LEARNING_COACH_` with Any scope / Any context, reports “No matching environment variables found.” Thus all nine keys listed below are currently unset at project level; no existing values or secret originals will be overwritten. Team-level hash-secret lookup also returned absent; remaining exact coach-key lookups are checked separately. Existing provider keys remain masked and unchanged.

Proposed production-only, Functions-only values: `LEARNING_COACH_ENABLED=true`, `LEARNING_COACH_PROVIDER=openai`, `LEARNING_COACH_MODEL=gpt-4.1-mini`, `LEARNING_COACH_ORIGIN=https://statecourse.com`, `LEARNING_COACH_INPUT_USD_PER_MILLION=0.4`, `LEARNING_COACH_OUTPUT_USD_PER_MILLION=1.6`, `LEARNING_COACH_DAILY_BUDGET_USD=1`, and `LEARNING_COACH_HASH_SECRET` (secret, new random 48-byte value). Eight keys total: enablement, provider, model, origin, two price ceilings, budget and hash secret; `LEARNING_COACH_API_KEY` stays unset so the existing OpenAI key remains the guarded fallback. Existing keys are never copied between providers. Gemini may be tested by changing only provider/model and redeploying; the same conservative price ceilings and global durable ledger cover both. Model availability/quality remains an acceptance gate.

Hash-secret SHA-256 fingerprint: `0f08edda5b0bbc92c16c816f652bdbbb1f64b729385c55f1e77b144d2fd7b450`. Original saved in git-ignored `.env.local` with mode 0600, outside version control. The new file contains only this dedicated hash secret; no provider credential was retrieved. Rollback: set coach enabled=false and redeploy the same expected revision first; then remove only newly created coach environment entries to restore the prior unset state, and redeploy again if removal must be reflected in runtime. Keep the ledger for accounting. Other environment keys/scopes, payment flags and account connections are untouched.

The durable probe returned `reserved` in one SQL execution and `already_reserved` in a later execution, confirming persisted deduplication across separate dashboard requests. No model was called. Its finalization is recorded after observed success.


The initial newly generated hashing secret was retired before any production deploy because the creation form's DOM snapshot included hidden input content. No provider credential was involved. A fresh secret replaced it, with mandatory snapshot redaction thereafter. Current SHA-256 fingerprint: `d0e572428bea1c7fb64b4a298a61a4d6ac00f5413e68c3d77788f463fdf6fb27`. Current and retired originals remain recoverable in the same protected, ignored local file. Secret flag, Functions-only scope and production-only nonempty context were preserved. Exact team lookups confirmed all eight active coach keys absent before creation. The metadata-only filtered UI resolved the earlier broad-inventory auto-review rejection.


### First activation redeploy failed before publication

Deploy `6ad6df229e7e156f60f6ba3d`, commit `bd8319ec758b0f6e08aaf178704064984954d833`, production/main: `bash site/build.sh` and artifact protection checks passed, but deployment of legacy Lambda-compatible functions failed because the combined environment exceeded AWS Lambda's 4 KB cap. No new deployment was published; the previous production snapshot remains current. This is not a model/key failure. The runtime remains disabled in that prior snapshot.

Bounded same-commit corrective attempt: remove the new `LEARNING_COACH_PROVIDER=openai` override (the code's verified default is OpenAI), and shorten the newly created dedicated hashing secret to the code's minimum 32 characters, generated from 24 random bytes in base64url (192-bit entropy). Current previous secret is recoverable in protected `.env.local`; its fingerprint is recorded above. Keep all budget, prices, model, origin and enablement checks; do not remove another system's variables or weaken security/limits. This reduces only redundant/oversized new coach configuration. If still over the cap, restore the newly added coach environment to its original unset baseline and report that source changes are required to enable the coach while preserving unrelated production functions.

The durable probe finalization returned `recorded`; its single 1-micro ledger entry is now failed and no provider was called. It is retained for accounting rather than deleted.


The bounded correction is applied to configuration only: provider override removed (OpenAI remains the default); hashing secret is 32 random base64url characters / 192 bits. Current SHA-256 fingerprint: `e5eca58f20783193ea44df4d22ca4761f49680d0b7a313fdce6a3714a0d52e83`. Previous 96-character original is recoverable in protected `.env.local`. Functions-only / production-only scope and secret masking were confirmed by the Netlify UI after saving. All required caps and checks are retained; no unrelated variable changed. Seven coach variables now remain. A second same-commit rebuild is pending.


## Approved publication execution — October 19, 2026, after 20:52 Los Angeles

New reviewed candidate commit: `f042f4d1b1cfa07a1afc87642666a5f6dca53121`, parent `bd8319ec758b0f6e08aaf178704064984954d833`; remote main was verified at that parent before creation. The tree contains only the eleven reviewed coach SQL/source/test/evidence files. No branch/preview environment is created.

Fresh production SQL baseline: settings table NULL, ledger rows 1, prior control function MD5 `356cc7f414139e0b2fab39f6b2154b35`. Previous non-secret function definition is recoverable from the original script/commit. The dedicated HMAC secret remains recoverable from protected ignored `.env.local`; current fingerprint `e5eca58f20783193ea44df4d22ca4761f49680d0b7a313fdce6a3714a0d52e83`. Planned change scope is only the new coach settings table and existing coach control function. Reapply reviewed script, verify seeded disabled row/roles, publish new code through main with an expected-SHA lease, then set the row to the approved $1/day configuration. Rollback first disables the settings row (service role only); preserve request accounting and restore the prior function source if code is intentionally restored later. No unrelated credentials or configuration are touched.


Schema revision applied successfully. Seeded settings row is disabled; RLS=true, anon read=false, authenticated read=false, anon RPC execute=false, service_role RPC execute=true. Main advanced with an expected-SHA lease to `f042f4d1b1cfa07a1afc87642666a5f6dca53121`. No preview or branch environment created.

Preconfiguration row has only `LEARNING_COACH_ENABLED=false`; all other coach row fields are unset. Set the reviewed row to disabled/OpenAI/gpt-4.1-mini/origin statecourse.com, positive $0.40/$1.60 per-million-token ceilings, $1 daily budget and the protected HMAC secret already fingerprinted above. A later explicit activation changes enabled=false to true for guarded testing. Provider-specific tests may switch row provider/model only; the same conservative ceilings and shared ledger cover both. Rollback is enabled=false (no secret retrieval required); preserve all request reservations. No provider key is stored in the row or returned to a browser.


### Current-model Gemini compatibility check

Prompt correction `8209b037b1acf0e2880ab122eaebd03568cfe171` was published in production deploy `6ad6e8163f46c4a763fad82e` at 2026-10-20T04:04:07.202Z. Repeated identical requests replayed previous answers rather than creating new paid calls. New OpenAI requests returned an application/completed-application distinction and a protected-request refusal with no invented lesson citations or opaque IDs in prose. These are bounded manual samples, not portfolio-wide semantic assurance.

A temporary coach-only provider/model switch to Gemini/gemini-2.5-flash-lite preserved the $1 cap and conservative $0.40/$1.60 rate ceilings. Both stale OpenAI-consent UIs rejected generation and displayed unavailable; reloading/restarting refreshed the provider to Google Gemini and cleared consent. A freshly consented Real Estate request on 2.5 Flash-Lite failed. The app hides upstream details, so this does not prove a key, billing, quota or model-specific cause. Google now limits 2.5 to previously active projects and recommends current models: https://ai.google.dev/gemini-api/docs/deprecations.

Next bounded compatibility check uses gemini-3.5-flash-lite, the official current successor, at verified standard text pricing $0.30 input / $2.50 output per million (https://ai.google.dev/gemini-api/docs/pricing). Configuration previous values are gemini / gemini-2.5-flash-lite / input0.4 / output1.6 / daily1; rollback is openai / gpt-4.1-mini / input0.4 / output1.6 / daily1, with the same protected secret and origin. Before calling 3.5, raise only the output reservation ceiling to2.5, preserving the shared $1 cap. The production adapter changes from legacy thinkingBudget0 to thinkingLevel minimal for current models; its800-token total cap, strict JSON contract and credential isolation remain. Both thinking controls are tested against the actual production adapter. No new account, key or preview environment is created.


Publication used the connected GitHub API with an expected-parent lease because local .git is read-only. Local HEAD remains bd8319e; the working files contain the published patches and this evidence. This is a local checkout metadata limitation, not an unpublished production fix.


### Staff access restoration — October19,2026,21:26 Los Angeles

Owner restored the existing staff session. The console visibly identifies the owner role. Direct authenticated build.json readback now matches the published coach code commit and production context, with the JSON and screenshot retained in `work/coach-browser/production-build-authenticated-20261020.txt` and `.jpg`. This was a read-only verification; no enrollment, user access, payment, approval or production setting changed. ESLint is still absent in the checkout and test-tools directory; lint remains unverified. Actual enrollment revocation and portfolio-wide response quality remain open.


### Acceptance continuation — October19,2026,21:31–21:43 Los Angeles

Owner instructed continuation. Pinned ESLint9.39.4, eslint-config-next16.2.6, TypeScript5.9.3 and the repository's Next/React versions were installed in an isolated temporary directory with install scripts disabled. The repository lint command ran with a byte-identical config copy resolving these dependencies:785 files,0 errors,116 warnings; no coach-file warnings. No project dependency or lockfile was changed.

A real revocation probe used only the owner's existing free, non-credit Mortgage grant3492153a-8700-4204-8fc0-e39593ee0228 for enrollment7c4bb98a-2f7d-4737-b929-9bcb0851c525. Baseline:active,revoked_atNULL, full-row md5 2f1f33ad3c5254bb5640fd781d90c31e. A guarded one-row update temporarily revoked it at2026-10-20T04:39:26.924511Z. The live learner UI cleared private lesson/coach content and displayed the unavailable/inactive-enrollment notice. A guarded restoration returned active/NULL with the identical full-row md5; reloading restored the enrollment at0/45 units,0/8 practices. No enrollment membership, grade, payment, credit or staff role changed. This proves observed entitlement revocation and UI clearing, not a separately captured raw cached-coach response after revocation. Evidence:work/coach-browser/live-revocation-20261020.json and live-access-revoked-20261020.jpg.

The probe also found an actual UI defect:after resume but before opening a unit, selected/currentUnitId were bothnull and the coach panel incorrectly appeared, sending unitId:null and receiving400. A minimal guard now requires an open current unit. The controller/DOM test asserts that coaching is absent after resume with no unit and appears after opening a lesson. It failed on the prior source, then passed after the fix.55 relevant controller/DOM/coach/settings/provider/endpoint tests pass,0 skipped; the Netlify build and final lint pass. Source publication and live verification of this follow-up remain pending at this execution record.
