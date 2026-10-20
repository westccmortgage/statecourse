# Netlify deployment outcome — 2026-10-19 (America/Los_Angeles)

**Not deployed successfully.** The existing StateCourse production publication is restored and verified. Core remains unavailable in production; health returns 404. No new hosting resource, server key or provider call was created. The separate Core database hardening remains applied.

## Verified current production

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
