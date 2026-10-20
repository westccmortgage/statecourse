# CEO Admin ↔ Core V2 — handoff

Written for whoever picks this up next, including the person who wrote it
after they have forgotten. It says what exists, what state it is in, what to
do next, and what was *not* verified.

Two companion documents, both current:

- `docs/ceo-admin-core-v2-audit.md` — the audit of Core V2 that preceded the
  work, and the two design mistakes that were found by building it
- `docs/ceo-admin-integration.md` — the boundary itself: the envelope, the
  API, the auth, the cost design, the Decision Audit contract

---

## 1 · Where everything is

Nothing is merged. Nothing is deployed. Two branches, two draft pull
requests, both green.

| | Engine | Administrative application |
|---|---|---|
| Repository | `westccmortgage/measured-decision-ai` | `westccmortgage/anatoliykanevsky` |
| Branch | `claude/ceo-admin-core-v2-domain` | `claude/affectionate-cori-mjnlci` |
| Head | `d9de0c9` (plus this document's own commit) | `77bda1f` |
| Pull request | [#224](https://github.com/westccmortgage/measured-decision-ai/pull/224) (draft) | [#3](https://github.com/westccmortgage/anatoliykanevsky/pull/3) (draft) |
| Base | `main` (`b9de3fc`) | `main` (`2549358`) |
| CI | success | success |
| Deploy preview | — | https://deploy-preview-3--anatoliykanevsky.netlify.app |

There is a third branch that is **not mine and must not be touched**:
`codex/ceo-admin-sprint2` in the administrative repository, which holds the
Gmail ingestion work. See §4.

## 2 · What it does, in one paragraph

The owner's own rows — messages, tasks, follow-ups, appointments — are sent
from the administrative application to the existing Measured Decision Core V2
engine as a batch. The engine reads each one twice, independently, in a closed
vocabulary; compares the readings; sends the disagreements to a reviewer;
and proposes a classification, a priority band and an order for the day, each
anchored to the words it was read off. Those proposals come back and are shown
on the Decision Audit and Today pages. The owner approves, rejects or modifies
them. Nothing is done to a mailbox, a calendar or a task list except by a
person, after a recorded decision.

## 3 · What exists, by file

**Engine** (`westccmortgage/measured-decision-ai`)

```
workers/core-v2/domains/ceo-admin/
  records.ts      what a row is: identity, version, sanitising, segments
  pack.ts         the DomainPack: vocabularies, roles, the priority ladder
  fixture.ts      twelve invented rows, one of which attacks the engine
  mocks.ts        scripted readers, including one that obeys the attack
workers/core-v2-runner/ceo-admin/
  triage.ts       stage zero, and the call estimate
  submission.ts   the door's parsing, admission and refusals
  material.ts     the material store over 068, and the resolver
supabase/functions/core-v2-ceo-admin/index.ts   seven operations
supabase/migrations/068_the_rows_another_system_holds.sql
workers/core-v2-runner/world.ts                 (modified) a third world
workers/core-v2-runtime/prompt-compiler.ts      (modified) one rule
workers/core-v2/tests/ceo-admin.mjs             15 sections
workers/core-v2-runner/tests/ceo-admin-integration.mjs   8 sections, real DB
```

**Administrative application** (`westccmortgage/anatoliykanevsky`)

```
netlify/functions/_shared/
  core-v2-adapter.mjs   rows → sources. Pure; no socket, no credential
  core-v2-client.mjs    the only module holding an engine credential
  core-v2-ui.mjs        the audit sequence and the proposed day, rendered
  core-v2-routes.mjs    four routes, two decorated pages
netlify/functions/admin.mts                     (modified) one wrap
supabase/migrations/20260922130000_core_v2_decision_link.sql
test/core-v2.test.mjs                           40 cases
```

## 4 · The ordering constraint, and the thing I could not verify

**Merge the Gmail work (`codex/ceo-admin-sprint2`) first.** Not because
anything breaks otherwise — it does not — but because the administrative side
is written to consume what that branch provides, and testing the combination
once is cheaper than testing it twice.

The two branches touch **no file in common**. `admin-handler.mjs`,
`gmail-service.mjs` and `gmail-ui.mjs` are not modified by this work at all.
The engine is wired in around the existing handler through `admin.mts`, which
the Gmail branch does not touch:

```js
const handler = withCoreV2(createHandler());
```

**What I could not verify:** I was unable to merge `codex/ceo-admin-sprint2`
into my branch in this environment — the merge was refused by a permissions
check — so I have never executed the combined tree. The integration is written
against Sprint 2's real interface, read from its branch, and the tests cover
both the with-Gmail and without-Gmail paths separately. But the combination is
reasoned, not run. **Run `npm test`, `npm run lint`, `npm run typecheck` and
`npm run build` once on the merged tree before doing anything else.**

*Update:* done in administrative PR
[#4](https://github.com/westccmortgage/anatoliykanevsky/pull/4) — the merge
had one conflict (the lint glob in `package.json`), and on the combined tree
133 tests, lint, typecheck and build all pass.

What the administrative side consumes from Sprint 2, once merged:

| It provides | Used for |
|---|---|
| `email_message_index` (`owner_user_id`, `snippet`, `provider_labels`, `is_noise_subscription`) | the email sources of a batch |
| `email_accounts.owner_user_id` | scoping a batch to one owner |
| `gmail.classify(ownerId, id, input)` | performing an **approved** proposal — reached by dynamic import, never copied |
| `email_audit_log` | where the owner's own clicks are already audited |
| the seeded `projects` rows | the taxonomy, via the `key` column my migration adds |

Until it lands, everything still runs: the adapter reads what exists, and an
approved proposal records the decision and reports that nothing was performed.

## 5 · What to do next, in order

Each step is verifiable on its own. Do not skip ahead.

1. **The merged tree has now been run.** Administrative PR
   [#4](https://github.com/westccmortgage/anatoliykanevsky/pull/4) merges
   `codex/ceo-admin-sprint2` and PR #3 onto `main`: 133 tests, lint,
   typecheck and build pass. Merge #4 rather than #2 and #3 separately — it
   also revokes Supabase's default `authenticated` grants on the new tables,
   which both original migrations had left in place (DELETE on
   `proposed_actions` and `core_v2_batches` among them).
2. **Apply the migrations.** `068` on the engine project (its own workflow
   applies it on merge of #224 to `main` — merging *is* deploying);
   `20260922095602` then `20260922130000` on the administrative project
   (`mnngocwncpktoxrrhwmq`), **by the owner, by hand**, following
   `SUPABASE_ADMIN_RUNBOOK.md` in the administrative repository: pre-flight,
   paste-ready apply wrappers, verification queries, an RLS probe and a
   rollback for each, all proven against a throwaway PostgreSQL by
   `npm run verify:migrations`. Both are additive.
3. **Create the engine's service account.** One `auth.users` row with sign-in
   disabled, one `organization_members` row giving it `admin`, and one
   `ceo_admin_tenants` row naming the administrative owner, the organization
   and that account. Without this row the door refuses everything, which is
   the correct dormant state.
4. **Arm the door, then set two variables in the Netlify deploy-preview
   context.** The door no longer takes a JWT signed with this project's own
   secret (which could mint any role here); it verifies an HMAC over the body
   with a secret lent for this door alone — see `docs/ceo-admin-integration.md`
   §Auth. Engine function secrets: `CEO_ADMIN_DOOR_SECRET` and
   `CORE_V2_CEO_ADMIN_SUBMITTER` (the service account's user id). Admin
   Netlify variables: `CORE_V2_ADMIN_URL` and `CORE_V2_ADMIN_DOOR_SECRET` (the
   same secret). Then confirm `preflight` answers with names and no values,
   including `doorSecret: true` and `submitter: true`.
5. **Preview run with the provider network off.** Sign in as the owner on the
   deploy preview, press *Read today's desk* over a small real set. Confirm:
   a workflow is created, `ceo_admin_material` has one row per declared part,
   and the engine records a refusal for anything that would cost while
   `CORE_V2_RUNNER_ALLOW_PROVIDER_NETWORK` is unset.
6. **One paid canary** against the engine's **test** project
   (`viuqggxrahckzbrnecoo`, where the watchdog is already armed), with
   `CORE_V2_RUNNER_AUTHORIZED_USD` at a dollar or two. **Read every packet in
   the log, line by line**, and confirm no address, no credential and no other
   reader's answer reached anybody.
7. **Verify the screens.** Decision Audit shows source → reader A → reader B →
   comparison → verification → proposal → evidence → your decision. Today
   shows the proposed order. Approve, reject and modify each write the row
   they should.
8. **Then production** — and only after a person has read step 6.

## 6 · The invariants, and where they are enforced

If you change this code, these are the things that must not quietly stop being
true. Each is enforced somewhere specific, so you will find out — but only if
you keep the test.

| Invariant | Enforced by |
|---|---|
| No path from a model's output to a side effect | trigger `proposed_action_needs_a_person` on `proposed_actions`. Not a code path |
| The owner's own click is never gated twice | `core-v2-routes.mjs` only intercepts `/admin/core-v2/*`; test asserts the engine is not consulted for `/admin/inbox/action` |
| A source the engine cannot version is refused | `normaliseRecord` in `records.ts`; `admit` in `submission.ts` |
| An edited row cannot rewrite a finished answer | the content hash covers `recordVersion` and the sanitised content |
| A reader and a critic minutes apart see the same bytes | `ceo_admin_material`, keyed `(workflow_id, content_sha256)` |
| The caller cannot choose its own organization | `ceo_admin_tenant_for`; the door ignores any organization in the request |
| No credential, address or provider name reaches a reader | `sanitiseFreeText`, plus the kernel's own `forbiddenContent` run over every packet in `ceo-admin.mjs` §5 |
| Material is evidence, never instruction | `MATERIAL_IS_NOT_INSTRUCTIONS` in `prompt-compiler.ts`, given to every role of every pack |
| A hundred circulars cost nothing | `triage.ts` stage zero; asserted as a number in `ceo-admin-submission.mjs` §6 |
| No company, person or project is named inside the engine | `nothing-real.mjs`. Two tokens of the real taxonomy are already on its denylist — this is why the taxonomy is configuration |

The last one is worth understanding before you edit anything under
`workers/core-v2/`: the taxonomy travels as data on every submission, and the
pack holds no default for it. That is also what makes the same pack reusable
for StateCourse.

## 7 · Two design decisions you will otherwise re-litigate

**A subject is a question about a row, not the row.**
`priority/task:<uuid>`, not `task:<uuid>`. A subject is the kernel's unit of
independence; naming two different questions after the same row spends every
independence domain on the first and starves the second. The engine refuses it
with `independence_unavailable`, correctly and silently. §6 of
`ceo-admin.mjs` builds the naive version on purpose and shows it starve.

**A priority is a rung with a name, not a score.** Readers report, factor by
factor, whether the record shows it — absent, present or strong — each
anchored. Code derives the band from the accepted factors by a ladder written
out in `pack.ts`, and the claim carries the rung that decided it. A number
would have been easier and would have meant nothing.

## 8 · Known gaps

None of these block the pilot; all of them are honest about what was not done.

- ~~The merged tree is unrun~~ (§4). Since run, in administrative PR #4: all
  checks pass.
- **The only executor is `classify_email`**, which files a message inside the
  administrative application. Archive, trash, unsubscribe, send and every
  calendar action are deliberately absent — the vocabulary in
  `proposed_actions` allows them, and nothing performs them.
- **Calendar is thin.** `calendar_items` is a projection nobody populates yet;
  the conflict question works and has no data. When Google Calendar arrives,
  the adapter already shapes it.
- **The engine's answer is fetched, not pushed.** The Decision Audit page has
  a *Fetch the latest answers* button rather than a subscription. A webhook
  from the engine would be the obvious next improvement and is not needed for
  the pilot.
- **`decision_outputs` allows one row per reader per run**, so several factors
  read by one reader are merged into that reader's row. This reads well and
  loses nothing, but if per-factor rows are ever wanted, that unique
  constraint is where to look.

## 9 · Watching

This session is subscribed to both pull requests and re-checks them on a
timer. If that session ends, nothing breaks — but nobody is watching CI, so
re-subscribe or check them by hand before merging.
