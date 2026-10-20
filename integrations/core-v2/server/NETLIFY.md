# Existing StateCourse Netlify host

**Deployment remains unsuccessful; production was restored.** See [DEPLOYMENT.md](DEPLOYMENT.md) for observed HTTP errors, rollback verification and the automatic approval rejection. The adapter below is implemented but is not active on the site.

The Core server bridge uses the existing StateCourse Netlify site; no Render host or new hosting account is required. The database remains the separately approved Core project `hkzhburprkwtnoeqbinh`. The original Core copy and StateCourse business database are unchanged.

`netlify/functions/core-readonly.mjs` bundles the existing server application with the existing locked `pg@8.23.1` driver. The same version is declared in the root package so Netlify’s modern function tracer can include its dependencies; the standalone server keeps its isolated package. Existing provider/server credentials are not copied, exposed or replaced. No new driver version or service is introduced. Netlify runtime variables are read through `Netlify.env.get`, not browser configuration.

Routes:

| Method/path | Behavior in this release |
| --- | --- |
| GET `/api/admin/core/health` | Non-sensitive deployment health; explicitly reports unverified source/Core connections and analysis OFF. No SQL/auth/provider call. |
| GET `/api/admin/core/observations/:runId` | Existing bridge, disabled by default; if separately configured, original same-origin cookie/MFA/current-staff checks and organization/actor-scoped saved-result retrieval apply. |
| POST `/api/admin/core/observations` | 503 `analysis_disabled_pending_background_execution`; never starts work or reserves a paid run. |

This deployment is **not activation of analysis**. Both paid/provider-network flags are forced OFF by this hosting profile, even if environment flags are accidentally set. No environment variables, server keys, source database permissions, organizations or provider budgets are changed for this release. With the default closed bridge, GET observations returns 503 `integration_disabled` before reading credentials or opening pools.

For future authorized saved-result access, the existing configuration described in [README.md](README.md) must be supplied and verified: fixed origin, source Auth public key/URL, separately restricted source SQL credentials, distinct verified-TLS Core SQL credentials and the correct seeded Core organization/worker permissions. These are currently **not verified**. Do not substitute the StateCourse service-role key for a read-only SQL identity or change source RLS to bypass this blocker.

The original runner's deadline/settlement window exceeds Netlify's synchronous 60-second limit. Activation requires a durable background handoff with authenticated dispatch, persistent reservation, bounded provider authorization and idempotency that survives Netlify retries. Background functions allow 15 minutes but retry failures automatically; simply renaming the current endpoint to a background function would lose the client response and could repeat paid work. This release intentionally does not perform that conversion or claim it is complete.

Build: `bash site/build.sh`; the deployment must include all current production functions/assets, not just this new function. Deploy functions from `netlify/functions`, **not a directory of ready-made ZIPs**: the CLI must preserve runtime API v2 and custom route metadata. A ZIP-only upload was observed to lose those metadata and was rolled back before retrying from source. With this local network, `NODE_OPTIONS=--dns-result-order=ipv4first` avoids a stalled IPv6 bootstrap fetch; this is a local CLI option, not a hosted environment change.

Before publishing, compare the current published commit with the merged main revision so another agent's release is not overwritten. No preview environment is required. Rollback is restoring the previous published Netlify deploy; no database rollback is involved. The separate hardening migration remains applied.

Offline tests: `node --experimental-strip-types --no-warnings --test integrations/core-v2/statecourse/tests/netlify.test.mjs`, plus existing Core tests and native PostgreSQL verification. Verify the packaged function and real deployment health/closed routes after publication. Health success alone does not establish data integration.

The following local publication method was attempted and failed hosted verification; do not repeat it without resolving the runtime-mode problem described in DEPLOYMENT.md:

```sh
NODE_OPTIONS=--dns-result-order=ipv4first netlify deploy --prod \
  --site b514a8f8-782b-448c-8881-a914ee42c69b --dir dist \
  --functions netlify/functions --skip-functions-cache --no-build --json
```

The feature branch is not merged into main. Future main-branch deployments must include this PR to retain the Core endpoint; do not silently merge/push main as part of deployment.
