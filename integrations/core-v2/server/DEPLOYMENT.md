# Netlify deployment outcome — 2026-10-19 (America/Los_Angeles)

**Current hosting release is deployed and HTTP-verified**: publication `6ad6f4cd2748d0262e01f1cd`, standard remote build `6ad6f4cd2748d0262e01f1cb`, Git source archive `174e4a0654c0c2f5da9a253442c966ae51908ee6`. It includes 41 functions, real background invocation metadata, the existing staff edge boundary and the latest published Mortgage Coach behavior from c20b8ec. The [receipt](deployed-receipt.json) records exact hashes/checks. Data/provider gates remain closed; full hosted source/Core integration is **not verified or activated**.

## Historical restored production before the successful source build

- Site: `b514a8f8-782b-448c-8881-a914ee42c69b`, https://statecourse.com.
- Restored publication: `6ad6e8e5ebf75c110bf19d98`, source `bf0433a4d7cc1fafa2f370fc43ced76142fcf36c`, state `ready` confirmed by API.
- Real HTTP after rollback: homepage, Coach JS and student-course JS 200; existing modern NMLS Coach GET 405; Admin Console 303 to staff sign-in; Core health 404.
- No source database/schema/permission change, Core organization/bootstrap, environment variable/secret change, DNS change or paid provider call. No main push/merge.

## Attempts and evidence

1. Local CLI edge packaging stalled on IPv6; official bootstrap/Deno endpoints responded promptly on IPv4. The local process was stopped before creating a deploy. Using `NODE_OPTIONS=--dns-result-order=ipv4first` resolved the stall; it changes only the local CLI process.
2. Publication `6ad6e9e5ccfab784762627bd` uploaded prepared ZIPs. The platform reported ready with 40 functions, but Core's custom path returned 404. Ready-made ZIP upload did not retain the full function metadata. The previous publication was restored through the standard Netlify restore operation.
3. Publication `6ad6ea6387f328684bc10b9f` packaged from original function sources. The custom route appeared, but the exact deploy URL returned 502 with `error decoding lambda response: invalid character '\\x00' after top-level value`; the custom domain returned Cloudflare's upstream 502. A legacy Coach GET responded 200 without invoking a model. Full function-runtime compatibility was not established. The previous publication was restored again and the checks above passed.

A proposed further diagnostic would have added an inert marker to every function ZIP and deployed a fresh full manifest to test whether artifact reuse retained a wrong invocation mode. **Automatic approval review rejected that action before execution** because mutating all production function archives after runtime-format failures could disrupt existing endpoints. No marker/archive mutation or third production retry was performed. This hypothesis is unverified and must not be reported as the proven cause. Do not bypass the rejection or silently repeat deployments.

## Remaining work

Use the existing host, not a new Render server. The code/PR and offline tests are ready for further runtime investigation, but hosted success must be demonstrated before completion. A safer next proposal is a standard Netlify production build of the reviewed source, allowing Netlify's own build pipeline to assemble function runtime metadata. This needs a concrete approved production-build invocation; do not trigger a main build that lacks PR #26, create a branch preview, or merge main without authorization. The API distinguishes branch builds from production builds; building the feature branch alone is not a production deployment.

After a working deployment, verify health 200, blocked analysis POST 503, disabled stored-result GET 503, cache/security headers, existing modern NMLS handler behavior and the unchanged Admin Console boundary. Source read credentials/RLS, hosted Core worker/organization setup and durable background execution remain separate unresolved activation prerequisites. Paid analysis stays OFF.

## Continued standard-build investigation

The owner asked to finish without unnecessary questions. The rejected function-archive mutation remains excluded. Current production was rechecked unchanged before further work.

The standard `netlify build --offline --context production` initially failed because automatic Next.js detection installed `@netlify/plugin-nextjs` even though production explicitly builds `site/build.sh` into static `dist`. Its own error was “publish directory does not contain expected Next.js build output”. This repository's Next/Vinext output belongs to the separate Sites build documented in AGENTS.md.

A narrow `[build.environment] NETLIFY_NEXT_PLUGIN_SKIP="true"` configuration fixes that mismatch. The installed official plugin explicitly recognizes this switch. Before the change, this TOML override was absent; no hosted environment/secret is edited. Removing this override reverts the build-file configuration. The complete standard offline production build then passed: site/privacy tests, all 40 function bundles with API metadata, and the unchanged admin-boundary edge function. Core's generated manifest declares runtime API v2, streamed invocation and all three exact routes. This is build evidence, not proof the hosted runtime error is resolved.


## Standard remote build succeeded

Netlify accepted the Git source archive through its documented createSiteBuild ZIP-body operation and built it on the existing production project. The request used the existing official CLI authentication internally; no token value was printed or saved. The archive contains tracked Git source, not manually modified function ZIPs. The source SHA-256 and exact revision are recorded in the receipt. No branch preview, new host, Git main merge or hosted secret change was required.

The platform reports ready, production context, 40 functions and the existing edge function. Manual source builds report no commit_ref; the reviewed Git archive identifies the source, and must not be confused with the main branch label. Real HTTP verifies health 200, disabled analysis and results 503, existing modern NMLS Coach GET 405, Admin Console 303 to staff sign-in, and byte-identical homepage/Coach/student assets. Health POST 405 and unexpected health query 404 also passed; responses are JSON/no-store without CORS. This establishes hosting, not source/Core runtime data access.

Inherited-account and site-specific production Functions metadata were checked with the official Netlify environment resolver, without recording key values. Both SQL URLs, DB names and Core organization ID are absent, as is the bridge enable flag. No alternate SQL variable names or local protected project connection variables were found. The actual source Auth binding is gdldvjefibssxnrpsxja; currently connected Supabase account contexts cannot access that source project. The isolated Core project is accessible and read-back still shows zero organizations/workflows/result runs and zero client-executable privileged functions. Security advisors retain only 21 intentional no-policy INFO findings, with zero WARN/ERROR. Existing OpenAI/Gemini key variables are present; no third provider or current spending authorization is inferred.

## Durable background extension prepared

The long scheduler now has a real Background Function rather than a permanently unsupported synchronous POST. The foreground performs current authorization and durable reservation before acknowledgment; background capture/claim/execution and retry behavior are described in BACKGROUND.md. The source snapshot is captured in the background, avoiding 15 sequential source queries in the synchronous window. No new schema is needed. Native and SQL/cookie assembly verification pass, including dedicated worker-login session role/claim initialization and actual database restart/concurrency. All enable/provider flags remain closed; the extension is published only after current CI succeeds.


## Final background publication and scope audit

CI for exact source revision 174e4a0 passed. Local verification: 56 Core integration tests, 20 original Core suites, native PostgreSQL with a dedicated NOINHERIT worker login and actual restart/concurrent delivery, plus 86 existing StateCourse DOM/SQL tests, all with no skips. DOM/PGlite tools were installed only into temporary isolated test-tool directories, not application dependencies. The previously conditional Coach SQL/DOM tests were actually executed.

The final standard remote build reports ready/production, 41 functions and edge protection. Live checks: Core health 200; closed analysis POST and saved-result GET 503; background route platform acknowledgment 202; existing modern NMLS Coach GET 405; unexpected health method/query 405/404; Admin Console 303 to staff sign-in. Homepage, public Coach scripts, student-course JS and the current Mortgage workspace JS match the built source byte-for-byte. Background 202 is not proof of worker authorization or source access. Live Core read-back after that probe still has zero organizations/workflows/results/budgets/runner settings; no paid run or bootstrap was performed.

| Requirement | Evidence / status |
| --- | --- |
| Original engine preserved | 364 upstream file hashes unchanged; reviewed SQL package unchanged |
| API/adapter/auth/persistence/background implementation | Current code/OpenAPI; 56 tests and native original SQL repository execution passed |
| Existing Netlify host | Ready publication and real HTTP checks above; no Render resource |
| Existing Coach/site behavior preserved | Latest production main merged unchanged; 86 existing tests and exact published asset hashes |
| StateCourse source writes / paid calls prohibited | No source SQL/permission change, no provider call, closed deployment flags; all test data/roles local fixtures |
| Separate Core installation/hardening | Approved package + separate hardening receipt; current zero security WARN/ERROR and intentional INFO retained |
| Hosted source/Core runtime connection | **Incomplete**: required server SQL URLs/organization/configuration are absent; source project access unavailable to connected Supabase contexts |
| Real hosted analysis/provider quality | **Unverified** and not authorized to incur paid calls; no substitute executor/model/provider is invented |
| Permanent main-branch retention | **Pending explicit main-merge approval**; manual deployments are replaced by later main deployments (observed once during this work) |

A main update from the Coach agent did replace the first successful manual Core publication while this work continued. The final source archive includes that update, but permanent retention requires merging PR #26. No lock, automatic overlay, history rewrite or unapproved main push is installed. The user's global AGENTS.md requires explicit approval for main changes; deployment approval is not silently treated as that approval.
