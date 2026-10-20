# Connecting the prepared read-only adapter

## Current integration boundary

The adapter is prepared as a server library, not enabled in the StateCourse application. Implementation stays in `integrations/core-v2/` plus its isolated test workflow. Two narrow root TypeScript/ESLint exclusions keep the copied runtime out of the unrelated application checks; no application code is changed, so the Lesson Coach and StateCourse application work can continue independently. The original Measured Decision repository and its deployed services are not used or modified by this change.

The first slice is synchronous and process-local. Snapshot bytes remain immutable for the analysis and the evidence/trace is returned inline. A `workflowId` in that response is not a durable job, a resumable task or an Admin Console history record. An interrupted request must be rerun against a new snapshot. Do not wire the copied runner to this API and claim restart recovery: the adapter has not installed durable snapshot material or start/continuation persistence.

## Host assembly

A later, separately approved host change imports `createReadOnlyApi` from `statecourse/api.mjs` and supplies these server-owned capabilities:

```js
import { createReadOnlyApi } from './integrations/core-v2/statecourse/api.mjs';
import { StateCourseReader } from './integrations/core-v2/statecourse/adapter.mjs';
import { createSupabaseVerifier } from './integrations/core-v2/statecourse/auth.mjs';

const handler = createReadOnlyApi({
  enabled: false, // turn on only after the access, provider and runtime gates below pass
  allowedOrigin: configuredStateCourseOrigin,
  organizationId: configuredCoreOrganizationId,
  reader: new StateCourseReader({ connect: leaseExclusiveStateCourseReadConnection }),
  verifyAccessToken: createSupabaseVerifier({
    url: configuredStateCourseAuthOrigin,
    publishableKey: configuredPublicAuthKey,
  }),
  createExecutors: resolver => buildApprovedCoreExecutorsWithMaterialResolver(resolver),
  routing: approvedCoreRouting,
});
```

The capitalized/configured names represent required host capabilities, not existing deployed configuration or supplied secrets. `connect()` must lease a separate TLS-verified PostgreSQL connection and return `{ query(text, parameters): Promise<{rows}>, release() }`. It must preserve BIGINT as decimal strings and dates as ISO values. The adapter owns BEGIN/COMMIT/ROLLBACK; never share that connection concurrently or supply a connection already in a transaction. The copied trust-only local PostgreSQL wire client is for the original local harness and is not a production StateCourse connector. No new database driver is introduced here.

`createSupabaseVerifier` sends only GET `/auth/v1/user` to the fixed configured HTTPS auth origin, then consumes the verified token's user/session/AAL/expiry. Provider or database errors return a generic failure. Neither identity claims from a request body, `user_metadata`, email patterns nor a shared admin credential grants access.

The future StateCourse server bridge must keep using its existing staff authentication/session flow. It forwards the original bearer and the existing HttpOnly staff proof as `x-statecourse-staff-proof`, with the fixed `Origin`, to the internal handler. Never expose the proof to browser JavaScript or log it. The handler performs a read-only independent check with `statecourse_staff_private.proof_active` and the current staff ledger. It deliberately does not call the mutating `statecourse_staff_security('check')` RPC. It neither refreshes last-seen nor consumes/mints an action proof. Existing session/MFA flows remain responsible for keeping the proof fresh; expired/stale proofs fail closed.

Do not add browser CORS access. Before exposing a route, enforce the existing host request limiter across replicas and a bounded server request duration/cancellation policy. The library provides a 1024-byte body bound, a single-flight guard per process, SQL statement timeouts, 1000 rows per query and 32 observations; it does not replace a distributed limiter or host timeout. The API contract is in `statecourse/openapi.json`; no request can choose SQL, roles, an organization or another course.

Use the existing Core provider adapters, registry, material verifier, budget controls and approved provider configuration; do not build a second AI stack or use Lesson Coach credentials by assumption. A registry needs two distinct approved reader domains and a critic domain distinct from the reader domains. Aliases of one executor are insufficient. Material resolves solely from the captured snapshot, with hash/source/segment checks. The API supplies no arbiter route. Missing providers or independence configuration fail closed. Provider calls, credentials and costs have not been activated or tested by this PR.

## Migration dependencies and activation gates

| Area | Existing dependency | This PR / connection requirement |
| --- | --- | --- |
| StateCourse enrollment/payment | 001–014, especially package allocations 011 and course versions 003/004 | Queries existing rows only; no new StateCourse migration. |
| Staff authority | 019 plus scope-key repair 020 and exact-session MFA 028 | Read existing proof/current binding state; owner/administrator CA scope only. 029 belongs to the existing owner OAuth/MCP flow and is not invoked. |
| Offering/training/content/tasks | 021, 022, 023 | Existing origin, release pins, hash reviews, tasks and events are reused. |
| Regulatory/reviewer evidence | 027 after the existing console prerequisites | Existing event-order history is read. No findings, signoffs or legal approval are generated. |
| Copied Core engine SQL | Upstream 058 onward depends on upstream earlier org/project/evidence schema; runner/source/continuation changes continue through 076, with later voice migrations | Historical SQL is preserved under `upstream/supabase/`. None is applied, copied into StateCourse `database/` or root `supabase/migrations/`, or required for this process-local adapter. |
| Dedicated source reader privileges | A production-approved read principal or a separately approved read gateway/replica | Not provisioned here. Validate SELECT access/RLS on every query in `statecourse/adapter.mjs`, private proof schema/function access and the security-invoker staff view's underlying ledger. Do not use a browser key or assume table grants bypass RLS. |
| Future durable Core storage | An isolated Core database/schema plan and immutable snapshot-material store tied to the existing atomic start + continuation mechanism | Requires a separate reviewed migration/dependency plan. Do not install historical Core SQL in the StateCourse working database or reuse the original Core production database. |

A dedicated login must have no DML, DDL or role-management authority. Audit inherited `PUBLIC` EXECUTE rights on existing security-definer mutators: granting SELECT does not by itself make a login read-only. RLS policies and schema/function grants must be designed and tested for that principal before activation. The per-transaction `READ ONLY` guard is tested, but it is not proof that a proposed production principal cannot start a different transaction. Do not work around denied reads by supplying the StateCourse service-role key. Any required production grants, policies or source gateway are a separate approval and are not performed here.

The native StateCourse source migrations have two 005 files and both a 020 repair and a 020 rollback; preserve their existing intended order and never run a glob that includes the rollback. The integration's local test names its exclusions explicitly. Do not renumber either project's migration history to resolve the two unrelated number sequences.

Before activation, verify the actual StateCourse schema, TLS/pool behavior, grants/RLS, token validation, revoked-session behavior, approved provider material/budget configuration and host timeout under an authorized environment. A repository SHA is not evidence of the live migration state. Local tests do not establish those live facts.

## Existing StateCourse workflows

Admin Console remains the home for operational tasks/history and human review/signoff. Display the returned observation and its snapshot/record anchors beside existing tasks/findings if the host UI is added later. A machine `accepted` observation is not a human signoff. This PR does not append a console event or close an existing task.

Published content is addressed by the enrollment's `console_content_release_id`, stored content hash and `course_version`; never move an enrollment to the newest version during diagnosis. The adapter does not reconstruct the original JSON serialization from JSONB to claim the release hash was recalculated. A latest matching review status is a separate recorded fact.

Repository Launch Control boards and the existing deployment/launch controls remain authoritative for readiness reporting. They are not imported as proof of live approval. This adapter reports existing evidence statuses and inconsistencies only; it changes no readiness flag or launch board. No readiness claim is made by this change.

## PR/deployment handling

No production deployment or merge is included. The branch commit and PR title use `[skip netlify]` to skip branch builds and Deploy Previews per [Netlify deployment documentation](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/). The added GitHub workflow only runs local tests and type checks; it has read-only repository permissions and no deployment steps or production secrets. Existing site build/routing/deployment files and root dependencies are unchanged. Root TypeScript excludes the independently checked integration, and root ESLint excludes its byte-preserved upstream copy. Before a future merge, confirm the PR is still additive and that the concurrently developed Lesson Coach/application changes do not change the source contract.

Rollback of this inactive integration is simply to stop importing/using the library if a host later connected it. Database or service rollback is not required for this PR because it applies no schema/configuration changes. Do not run the copied historical rollback scripts as a removal procedure.
