# StateCourse → Core server bridge

This is an isolated Node service, not a new StateCourse application dependency or an installed Netlify route. It is disabled by default. The server performs no automatic provisioning, migrations, source grants, proxy changes or deployment. Separately approved Core provisioning/schema actions and remaining permission blockers are recorded in [APPLIED.md](../installation/APPLIED.md). The original Core stays intact. Do not run this service against hosted targets without separate approval.

## Local installation and disabled startup

From the repository root:

```sh
npm ci --prefix integrations/core-v2/server --ignore-scripts --no-audit --no-fund
npm start --prefix integrations/core-v2/server
```

Node 22.13+ is required for the original TypeScript runtime. The service binds only `127.0.0.1:8789`; `CORE_V2_PORT` can select another unprivileged port. With no configuration, every request returns 503 `integration_disabled`; startup opens no DB socket, reads no provider declaration or credentials, and performs no auth/provider call.

A later approved StateCourse **server-side same-origin reverse proxy** must forward only `/api/admin/core/observations` and `/api/admin/core/observations/{runId}` to this loopback service (or an equivalently protected service boundary). Preserve the original Cookie, Origin, Content-Type and Idempotency-Key; disable caching, POST retries and request/response header logging. Do not expose this listener as a public standalone domain or forward all StateCourse paths. Existing Netlify hosting cannot access another machine's loopback; choosing and securing its concrete service/proxy hosting is an activation prerequisite. No production route is installed in this PR. Do not run the synchronous 120-second provider workflow in a 60-second Netlify Function or a retrying Background Function.

The browser uses its existing HttpOnly `__Host-sc_access` and `__Host-sc_staff` cookies. It does not read them or supply authority headers. The bridge rejects missing/duplicate cookies, cross-site requests, missing/wrong Origin, query strings, unknown paths and methods. Client Authorization, proof, actor and organization headers are discarded. POST requires JSON scope and UUID Idempotency-Key as in the existing contract. GET callers must explicitly send `Origin: <StateCourse origin>` as well; a plain navigation without Origin is rejected. Use same-origin credentialed fetch and the fixed endpoint; no CORS is enabled.

Internally the bridge calls the existing Core API in process, forwarding only the original cookie bearer/proof, fixed Origin, content headers and idempotency key. `/auth/v1/user` validates the bearer before claims are consumed. The existing exact-session MFA proof/current CA owner/administrator binding is independently rechecked in source SQL before Core reads/writes and before response delivery. No source audit, token refresh, security check/mint/consume RPC or business write is invoked. Expired cookies require the existing StateCourse sign-in/step-up flow.

## Server-owned configuration for later approved activation

| Variable | Purpose |
| --- | --- |
| `CORE_V2_BRIDGE_ENABLED` | Must equal `true` to enable requests; default closed |
| `STATECOURSE_ORIGIN` | Exact HTTPS site origin, without path/trailing slash |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Existing source auth origin and public server auth key; never the service-role key |
| `STATECOURSE_READ_DATABASE_URL` | Existing authorized source SQL read credential, server-only |
| `STATECOURSE_DATABASE_NAME` | Exact source database name |
| `CORE_DATABASE_URL` | Separate Core SQL writer credential, server-only |
| `CORE_DATABASE_NAME` | Exact isolated Core database name |
| `CORE_ORGANIZATION_ID` | Existing Core organization UUID, server-owned |
| `CORE_V2_RUNTIME_CONFIG_FILE` | Optional protected JSON path containing `{config, familyProviders}` for the existing metered runtime; no key values |
| `CORE_V2_PROVIDER_NETWORK_ENABLED`, `CORE_V2_ALLOW_PAID_CALLS` | Both must explicitly equal `true`, together with existing Core authorization/pricing/key gates, before providers can send; leave unset now |

No new provider key is created. The existing operator declaration and approved authorization described in [CONNECTING.md](../CONNECTING.md) supply `config`; `familyProviders` maps the two reader families and independent critic to three existing configured providers. Their declared key variable names are resolved only inside the server runtime. There are no default models, rates, spending approval or fabricated executor fallback. With provider gates closed, GET/replay can read authorized stored results and a source snapshot with no observations completes without providers. A new analysis requiring explanation returns 503 `provider_network_disabled` and persists an interrupted nonreplayable run; it never silently returns an unverified model explanation. Do not repeatedly submit new idempotency keys to probe unavailable providers.

## Database boundary

The isolated subpackage pins `pg@8.23.1` and its transitive dependencies in its own lockfile. Root StateCourse package files remain unchanged. Pool construction is lazy, with exclusive leases, max 4 connections per target, 5-second acquisition and 10-second query bounds. Every release destroys the underlying session to avoid leaking roles/scope or a failed transaction between requests. This intentionally trades connection reuse for isolation at this initial low-volume stage.

SQL URLs require explicit PostgreSQL scheme, host, user, password and database. Percent-encode credentials. Query parameters are rejected, including `sslmode`/`options`: [node-postgres warns that connection-string SSL parameters replace explicit SSL configuration](https://node-postgres.com/features/ssl). Connections always require TLS and certificate verification; no insecure fallback exists. If a dedicated CA is required, configure Node's trusted CA store through the approved server process (`NODE_EXTRA_CA_CERTS`), never disable verification. IPv6/custom CA/pooler interoperability has not been verified on a hosted target.

Source sessions start with `default_transaction_read_only=on`; every source operation also uses the adapter's repeatable-read read-only transaction. The source lease checks the configured database identity and presence of `public.enrollments`. Core leases check their configured identity and **absence** of that source table before any write. Identical configured host/port/database targets are rejected even with different credentials; source-table checks also reject an alias that reaches StateCourse. A database name alone is not isolation. Dedicated Core credentials must point to the separately approved Core project/database. The native Core client and storage retain their own target guards.

Existing source read permissions must cover all allowlisted tables, current-binding view prerequisites and private proof validation; missing permissions fail closed. This PR does not grant them, create a source account or substitute a Supabase service-role key. The read-only session option is defense in depth, not a substitute for least-privilege existing DB credentials. If such a credential does not exist, activation remains blocked pending separate approval.

For Core, apply the ordered existing Core schema prerequisites and then the isolated result-store migration described in [STORAGE.md](../STORAGE.md), only to the separately approved Core target. Confirm organization and dedicated writer membership in `statecourse_core_store` without introducing source writes. The initial schema package is now installed only in the separately approved Core project; remote runtime/permission setup is not complete. Native PostgreSQL role/RLS/TLS behavior and account/hosting configuration still require approved target verification.

## Verification

The common test command in [TEST_RESULTS.md](../TEST_RESULTS.md) now also installs this subpackage and exercises cookie/header isolation, SQL target refusal, the disabled application, complete source → Core storage flow, revoked proof denial, the assembled no-paid-call path, real loopback HTTP, and the real pg driver's refusal of an endpoint declining TLS. SQL fixtures are local PGlite databases. This does not prove successful TLS/authentication or source grants on a hosted database, real provider quality, or production proxy behavior.

## Read-only catalog preflight

`npm run check:connections --prefix integrations/core-v2/server` refuses unless the operator explicitly sets `CORE_V2_PREFLIGHT_ALLOW_NETWORK=true`, supplies both approved database targets and organization, and keeps both provider/paid gates off. It uses read-only transactions and EXPLAIN without ANALYZE, emits sanitized named checks and never migrates or grants. A passing catalog report is not an RLS completeness, session authorization or provider-worker permission test; it always reports activation unverified. See [ACTIVATION_REVIEW.md](../ACTIVATION_REVIEW.md) for observed inventory, source-ledger RLS blockers and the proposed separate Supabase target. Do not run it on hosted targets before access/binding approval.
