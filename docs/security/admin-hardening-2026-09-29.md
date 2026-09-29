# Admin and owner OAuth boundary

The existing `current_staff_actor_bindings` ledger is the only staff authority source.
An ordinary Supabase session identifies a person but cannot open `/admin` or its APIs.
Reviewer-only accounts cannot enter the admin console. Existing state scopes and
Michigan-specific authorizations remain additional constraints.

## Implemented behavior

- Server validation of the exact Supabase JWT precedes use of its subject, session ID,
  AAL or authentication timestamps. Editable metadata and email naming grant nothing.
- A verified TOTP challenge issues an independent, opaque HttpOnly staff cookie. Only
  its SHA-256 digest is stored server-side. It is bound to the exact Auth session,
  current role records and the verified MFA factor. Privilege expires after 15 minutes
  absolutely or five minutes idle. Each request checks live role/session/factor state.
- Every admin mutation, plus sensitive report/export requests, requires another MFA
  verification. The resulting 90-second permission is bound to method, canonical
  endpoint, query and exact body, and atomically consumed once. The UI presents the
  requested change before confirmation. Payments, signatures and regulatory submissions
  still retain their existing business/human approval gates.
- The prior shared admin bearer token cannot bypass these checks, including refunds
  and legacy payment endpoints. Student routes retain their ordinary session lifecycle.
- Persistent, atomic rate limits cover login, enrollment, MFA and privileged access.
  Login/step-up/denial/action authorization records contain no credentials. A durable
  authorization audit is committed before the operation proceeds. Failure to reach
  the security store denies access. Existing per-operation records remain in place.
- First-factor enrollment requires a current server staff binding and a password
  authentication less than five minutes old. It grants no admin access. Pending
  enrollment is bound to the exact session, expires in five minutes, and requires
  actual OTP verification. Existing verified factors cannot use this bootstrap path.
- The owner connection uses a two-minute one-use approval ticket issued after MFA.
  Consumption revalidates current global owner authority, exact subject/session,
  factor, client, PKCE challenge, Agent, Vault and request nonce. The OAuth MCP endpoint
  accepts the existing functions-only backend credential; it does not expose a public
  membership lookup. PKCE S256 and normal OAuth refresh rotation remain intact.

## Verification

The isolated PostgreSQL harness exercises the migration itself and the actual HTTP
handlers with synthetic provider responses. It does not query production identities.

```sh
node scripts/verify-staff-security.mjs /path/to/@electric-sql/pglite/dist/index.js
node --test tests/admin-console-auth.test.mjs
node scripts/verify-staff-security-ui.cjs
```

Observed: 36 PostgreSQL/HTTP security checks and 15 existing authorization regression
tests passed. Browser rendering and the denied-action → explicit MFA → single retry
flow passed. The corresponding StateCourse AI patch passes 51 MCP tests. The Python
owner helper passes 10 test groups, including non-owner, stale, missing, forged and
mismatched authority rejection. Its source contains literal `http://127.0.0.1` and
retains RSA-OAEP-256/AES-256-GCM, state validation and no plaintext token persistence.

These checks cover the seven requested security cases in development. Live successful
owner login, owner OAuth and saved-Agent authenticated MCP calls are still unverified.
The full national content build was not run in this partial source checkout.

## Actual owner gate

Read-only production inspection of Supabase project `gdldvjefibssxnrpsxja` found one
active unscoped owner ledger entry, but no matching Auth subject, and zero verified
MFA factors. A verified email cannot repair that association. An authenticated owner
or authorized project administrator must identify the actual Auth user UUID and
approve the owner-binding repair through the trusted project administration path.
Preserve the old event; use the existing append-only ledger for an authorized correction.
Do not silently create an owner, copy the reviewer account, or change student metadata.

After the binding is repaired and the reviewed release is deployed, Anatoliy signs in
at `/staff/sign-in/`, enrolls his authenticator if necessary, and personally verifies
the code. The corrected Owner Connect helper then performs owner MFA approval and
OAuth consent. It must not be run against the old server contract.

## Deployment order and rollback

Production changes require explicit approval under this repository's `AGENTS.md`.
No production deployment or owner-role mutation is represented as completed here.

1. Confirm the actual owner subject and retain an authorized recovery path in the
   Supabase project before replacing the shared-token admin endpoints.
2. Apply additive `028_staff_session_security.sql`, then `029_owner_oauth_authority.sql`
   to the existing production database. The second migration requires the existing
   production MCP adapter. No new roles or owner bindings are inserted by either file.
3. Deploy the StateCourse main-site patch and matching StateCourse AI owner-authority
   endpoint patch. Do not create a staging/preview environment without authorization.
4. Verify unauthenticated, student, reviewer and revoked-session denials on actual
   `/admin` and direct API/function URLs. Complete owner MFA/consent personally, then
   run all remaining saved-Agent tests through the existing Agent and attached Vault.

Recorded main-site baseline: commit `28576a9e5f661d3ec137398767da8c85c356090a`, Netlify
deploy `6abb0bc2e0d2af0007b9e08b`. MCP baseline deploy `6abaa8ee8571931c92298c6f`.
No environment-secret changes are required. If activation fails, keep privileged
access closed; fix forward. Do not restore shared-token authorization as a workaround.
The additive tables can remain without granting access, and audit rows must be retained.
