# StateCourse environment and operational reference

This reference preserves repository-derived operational details moved from AGENTS.md on 2026-09-19. It is not a live production audit. Recheck details before operational work; historical documentation is not proof of current production state.

## Repository-documented facts

The following map describes repository configuration and documentation, not verified live bindings:

- Repository-documented production: https://statecourse.com; administration: /admin/console/. Netlify builds with `bash site/build.sh`, publishes `dist/`, and routes /api/* to handlers in `netlify/functions/` through `netlify.toml`. The Stripe webhook destination is https://statecourse.com/api/stripe/webhook.
- Production backend: Supabase PostgreSQL and Supabase Auth, with schema/migrations under `database/`. Auth setup documentation identifies project `gdldvjefibssxnrpsxja`; confirm the current binding safely before service work.
- Production-critical services: Netlify hosting/functions, Supabase database/auth, Stripe Checkout/webhooks, Cloudflare Stream private video delivery, and the configured Supabase Auth SMTP sender/provider. Google OAuth is documented, but its current enablement is unverified. The SMTP provider identity is not established by the inspected documentation.
- Evidence: `netlify.toml`, `docs/admin/administration-console.md`, `docs/payments/architecture.md`, `docs/payments/stripe-runbook.md`, `docs/video/cloudflare-stream-production.md`, and `config/auth-email/`.
- A separate Sites/Vinext build exists: `npm run build`, `app/`, `worker/`, and `.openai/hosting.json` (D1 binding DB, no R2 binding). Do not assume that building this artifact updates the Netlify production site or that its D1 database replaces Supabase.
- The deployed commit, Netlify deployment trigger/branch, current service connections, credentials, and service health are unverified by repository inspection. Historical status documents are not current runtime evidence.

## Currently verified runtime facts

None established during this documentation task. No deployed endpoint, database, account, credential, payment, email, OAuth flow, or integration was exercised. Local file read-back and documentation checks do not establish application runtime behavior.

## Unverified current state and assumptions

- The documented production URL and Supabase project identify intended/documented targets; current DNS, hosting bindings, and backend connections have not been checked.
- The deployed commit, deployment trigger/branch, payment modes and enablement flags, webhook configuration, credentials, account connections, and service health remain unverified.
- Google OAuth enablement remains unverified. The configured SMTP provider identity and sender readiness are not established.
- docs/admin/administration-console.md prescribes STRIPE_MODE=test and STATECOURSE_LIVE_PAYMENTS_ENABLED=false; that prescription is not an observation of today's settings.
- Historical payment status in docs/payments/stripe-sandbox-state.md must not be treated as current account, enrollment, pricing, or webhook state.
- The separate Sites/D1 configuration does not demonstrate a production D1 dependency or replacement of Supabase.

## Commands, prerequisites, and helper scope

Read the current `package.json`, repository documentation, and test configuration before choosing checks. Commands below are recorded from this checkout; run them from the repository root.

| Purpose | Exact command | Scope / prerequisites |
| --- | --- | --- |
| Install | `npm run install:ci` | Bounded lockfile install through scripts/install-ci.sh. |
| Development | `npm run dev` | Vite/Vinext development server. |
| Sites build | `npm run build` | scripts/build-verified.sh builds and validates the Sites artifact. |
| Netlify build | `bash site/build.sh` | Generates the static site and rebuilds dist/. |
| Start built application | `npm run start` | Vinext runtime. |
| Lint | `npm run lint` | ESLint via scripts/sites-env.sh. |
| Combined tests | `npm test` | Runs test:sites, then test:netlify. |
| Sites checks | `npm run test:sites` | Runs the Sites build; not a full application E2E test. |
| Netlify tests | `npm run test:netlify` | Builds Netlify, then runs the Node test suite through scripts/test-california-documents.mjs. |
| Existing Sites artifact | `npm run validate:artifact` | Checks manifest and ESM default.fetch export. |
| California test prerequisites | `npm run prepare:california` | Generates documents and runs document tests; requires Python with pypdf/reportlab and DejaVu fonts. |

- Node.js >=22.13.0 is required. README.md specifies Linux with flock, curl, and GNU timeout for the install/build helpers; they are not native macOS scripts.
- Build, preparation, and test commands generate files; inspect their effects before running under a restricted change scope. `npm test` finishes with the Netlify artifact; a subsequent Sites package needs its own Sites build.
- Tests are `tests/*.test.mjs`, executed with Node's test runner by the document wrapper. No dedicated browser E2E npm script or Playwright/Cypress configuration was found.
- Existing isolated verification helpers accept installed dependency paths:
  - `node scripts/verify-training-player-dom.mjs /absolute/path/to/jsdom/lib/api.js`
  - `node scripts/verify-console-readonly-dom.mjs /absolute/path/to/jsdom/lib/api.js`
  - `node scripts/verify-console-postgres.mjs /absolute/path/to/@electric-sql/pglite/dist/index.js`
  Replace these path placeholders with actual installed paths. These checks use isolated DOMs or embedded PostgreSQL; they do not verify production browser sessions or the entire production schema.
- Payment diagnostics: `node scripts/stripe-preflight.mjs` checks configuration; `node scripts/stripe-preflight.mjs --check-stripe` additionally reconciles Stripe objects. Inspect current script behavior and obtain any required approval before using connected services. Neither command establishes complete checkout/webhook behavior.
- Do not invent commands. A green test proves only behavior that the test actually exercises.
- For a newly added validation, verify that the check is capable of failing when the requirement is violated.


## Operational verification references

- Use docs/payments/activation-checklist.md and docs/payments/stripe-runbook.md for checkout, delayed success/failure, signed webhooks, and duplicate-event verification. Their provisioning, payment, database, and deployment steps are not preauthorized.
- Use docs/admin/administration-console.md, docs/video/cloudflare-stream-production.md, and config/auth-email/ for affected administrator, private-video, authentication, recovery-email, and OAuth flows. Record executed steps and observed results.
- No single repository command establishes all end-to-end flows. Isolated DOM checks are not rendered-browser or authenticated production verification.
- After an approved Netlify redeploy/restart, compare /admin/console/build.json with the intended revision where available, then exercise the affected behavior. Deployment identity alone is insufficient.
- Test payment mode does not make a connected production system local. Production writes, email, payment attempts, webhook deliveries, and other external effects require explicit approval.

## Rollback records

Before an approved production-setting change, record its name, environment/scope, previous value (including absence), and restoration steps. For secrets, include only a non-reversible fingerprint in the change record and ensure the original is recoverable from an approved protected local secret store outside the repository. A fingerprint alone cannot restore a secret. Do not proceed if recovery requires retrieving the old value from an external system. Never record secret values in this file, AGENTS.md, reports, logs, or Git.
