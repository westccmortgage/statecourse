# SAFE PE foundations: public practice release record

Date: September 30, 2026. Status: implementation and local checks complete; draft review only. No production or preview release authorized by this record.

## Scope and boundaries

This slice adds two full public foundation lessons, PE01 Industry Roles and SAFE Foundations and PE02 Mortgage Mathematics and Security Instruments, adapted from the reviewed September 30 student manuscripts and national PE blueprint. Together they contain approximately 10,255 words, 16 explained quiz questions, and 10 activities with 39 tasks. All 19 numerical solutions were independently recalculated; quiz answers were independently reviewed.

It reuses the existing free-practice renderer and activity projection. The 30 existing real-estate practice records and 314 lesson/course artifacts remain byte-identical to baseline. A separate public collection, `national-safe-pe-foundations`, appears alongside them. The course catalog and existing CE identity remain unchanged.

The public landing route is `/mortgage/pre-license/`; the practice route is `/free-practice/?course=national-safe-pe-foundations`. Homepage/shared navigation exposes Free Practice. PE module deep links use `lesson=module-01` or `lesson=module-02`. Course-record navigation returns to the PE page rather than a nonexistent real-estate state page. Availability copy now counts collections rather than calling every course a state.

This is not the complete 20-hour course, not NMLS-approved PE, and provides no credit, validated hours, certificate or completion reporting. It creates no enrollment, payment, regulatory timer, instructor response or peer participation. Written responses are explicitly self-review; numeric/selection feedback is automatic. Practice is free before, during and after paid enrollment, without an account or checkout. Responses remain browser-local; learners are told to use fictional information only.

Public inputs are exactly the two student modules and a newly authored formative config. The private instructor guide/full answer keys are excluded. Public formative solutions and explanations are deliberate; they are separate from protected CE and final assessment inventories. The projection validates the opening noncredit/approval disclosure, question structure, sources and lesson mapping before writing any PE output. Malformed inputs and injected protected identities fail closed.

## Validation observed

- Locked dependency install: `npm run install:ci` passed with Node 24.19.0
- National generator: passed; 51 jurisdiction hubs and existing course routes generated; six hand-authored course pages preserved
- Netlify static production build command: `bash site/build.sh` passed, including its built-in privacy gates
- 84 focused and regression Node tests passed, with no skipped/failed tests
- Two isolated JSDOM tests passed: existing native activity-submit test and the new actual PE-client flow test
- Targeted ESLint: zero errors; one pre-existing unused `registerUrl` warning in the national generator
- The unchanged CE privacy verifier passed on the final static `dist` artifact: 608 files, 598 text files, 187 protected item identities/stems, zero violations
- Independent review confirmed all 19 numeric answers, all 16 quiz keys, existing-practice byte preservation, and no new auth/payment/regulated-completion integration

Focused regression command:

```sh
node --test tests/pe-foundations-practice.test.mjs tests/free-practice-access.test.mjs tests/free-practice-activities.test.mjs tests/nmls-public-artifact.test.mjs tests/no-answer-key-published.test.mjs tests/mortgage-vertical.test.mjs tests/national-service-areas.test.mjs tests/assessment-presentation.test.mjs
```

DOM command (jsdom was installed outside the repository, without changing the lockfile):

```sh
JSDOM_MODULE_PATH=/absolute/path/to/jsdom node --test tests/browser/practice-native-submit.test.mjs tests/browser/pe-foundations-client.test.mjs
```

The DOM test covers real client initialization, deep links, native empty-answer validation, wrong/correct answers, retry and first-attempt accounting, numerical casework, local persistence, activity restart, interrupted cross-program navigation, malformed saved data, popstate restoration and absence of backend/enrollment/payment requests. It is not rendered-browser evidence.

## Remaining verification

Rendered-browser checks could not run in the current environment: local Chromium failed on its required socket, and the cloud browser rejected localhost with `ERR_BLOCKED_BY_CLIENT`. Neither boundary was bypassed. Real screenshots, responsive layout (especially the shared header at 1100–1440px and mobile), actual Back/Forward/reload behavior and network delivery must be accepted on an authorized remote preview before production.

This is a connector-materialized source checkout, not a full Git clone. The named build and focused tests ran; the repository-wide `npm test`, separate Sites/Vinext artifact build and complete test suite were not run. No authenticated CE/OAuth, Supabase, payment, instructor or credit flow was exercised or changed. Local build acceptance does not prove production delivery or legal/SME/duration acceptance.

## Deployment configuration read back

The existing StateCourse Netlify project is `chipper-maamoul-a2b9d5`, site ID `b514a8f8-782b-448c-8881-a914ee42c69b`, serving `https://statecourse.com`. On September 30, its Developer settings showed: linked repository `westccmortgage/statecourse`; production branch `main`; builds Active; branch deploys for all pushed branches; Deploy Previews for any PR against production/branch-deploy branches. General settings showed public production and public Deploy Preview visibility. Node is 24.x; functions directory is `netlify/functions`. No settings were changed.

The repository's `netlify.toml` selects `bash site/build.sh` and `dist`; `npm run build` is the separate Sites artifact and does not publish this Netlify site.

This draft uses `[skip netlify]` in both its commit message and PR title. Netlify documents that the commit marker suppresses branch/production builds and the PR-title marker suppresses Deploy Previews. It is not the generic `[skip ci]` marker; no remote GitHub test pass is claimed. The current repository workflow inventory contains a manual/California-path-filtered PR source-export workflow, not a general test CI workflow; do not run that export as a substitute for tests.

Official marker behavior: https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/#skip-a-deploy

## Controlled next steps

1. Review the exact draft diff and local validation; keep both skip markers until an intended public noncredit preview is authorized
2. Run the named tests and `bash site/build.sh` in a full checkout/approved CI executor; leave skip markers in place so verification cannot trigger Netlify publication
3. Once preview publication is authorized, remove the PR-title skip marker and push a new reviewed branch commit without the marker, or use an explicitly authorized existing-project preview flow; do not change global site settings or production branch
4. Verify the returned preview URL and exact head SHA, then exercise PE entry/deep links, both lesson sets, all task types, empty/invalid submissions, retries, saved/corrupt progress, rapid switching, Back/Forward/reload, keyboard operation and responsive layout; inspect privacy/build output
5. Only after release approval, merge/deploy the exact reviewed revision. Verify `/admin/console/build.json` matches it and smoke the public routes. Keep existing CE/OAuth/commerce gates unchanged
6. If rollback is needed after an authorized release, use the prior known-good deploy and reconcile the repository before any new automatic production build

No new credentials, settings, database migrations, fees, provider application, approval or credit-bearing launch are part of this change.
