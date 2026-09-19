# StateCourse — Project Working Rules

Supplement Anatoliy's global rules. Operational details and evidence status: [docs/environment.md](docs/environment.md).

## Production boundaries

Treat deployed StateCourse and connected non-local services as production unless explicitly documented otherwise. Require explicit approval for production changes and external side effects, including payment/Stripe modes, enablement flags, webhook destinations, Supabase credentials, Netlify variables, and account connections. Test payment mode does not remove this boundary. Do not create staging/preview environments unless requested.

Before changing production settings, record previous values (including unset), scope, and rollback steps. For secrets, record only fingerprints; ensure originals are recoverable from an approved protected local store outside Git, without external retrieval. Stop if recovery is unavailable. Never expose credentials. Validate credential type/prefix and behavior safely; populated fields prove nothing.

## Build commands

The Netlify production site is built by `bash site/build.sh`.
`npm run build` builds a separate Sites artifact and does not update the Netlify production site.

| Purpose | Command |
| --- | --- |
| Install | `npm run install:ci` |
| Development | `npm run dev` |
| Sites build | `npm run build` |
| Netlify production build | `bash site/build.sh` |
| Lint | `npm run lint` |
| Tests | `npm test` |
| Artifact validation | `npm run validate:artifact` |

## Payments and regulatory content

Payment, enrollment, and regulatory credit are separate states. A checkout success redirect is not payment fulfillment. Payment fulfillment must rely on the verified server-side payment/webhook flow, including signatures and idempotency, and must not directly grant regulatory completion or credit.

Support licensing, regulatory, course-hour, exam, completion, and state-requirement claims with verified official primary sources. Preserve citations and traceability. Mark unsupported requirements unverified; do not publish them as facts.

## Verification and completion

Inspect current package.json, documentation, and test configuration; never invent commands. Run relevant checks. Green tests prove only exercised behavior; demonstrate that new validations fail when requirements are violated.

When affected, authentication, enrollment, progression, completion, admin access, payments, webhooks, and integrations require end-to-end verification with observed results. Obtain required approval for external effects. Inspect rendered UI. Verify configuration changes through runtime behavior after approved redeploy/restart, not dashboard values.

Do not declare completion until requested behavior is verified. Final reports must explicitly state what remains unverified.

Any task that materially changes NMLS status, Real Estate regulatory status, Stripe commerce readiness, submission status, approval status, or launch readiness must update the applicable Launch Control board before completion.
