# CEO Admin ↔ Core V2 — the boundary

Two systems, two databases, one contract. This document is what an
implementer of either side needs.

**Status: built, on both sides, and not yet deployed.** The engine's door is
`supabase/functions/core-v2-ceo-admin`; its material store is migration 068;
the administrative application's half is `netlify/functions/_shared/core-v2-*`
in `westccmortgage/anatoliykanevsky`. What remains is operator configuration
and a preview run — §12.

- The engine's own design: `docs/core-v2.md`
- What was audited before this was written: `docs/ceo-admin-core-v2-audit.md`
- Operating the runner: `docs/core-v2-runner.md`

---

## 1 · The shape

```
  browser (owner, signed in to the Admin)
    │   Supabase Auth session; owner-only RLS
    ▼
  Admin backend  (Netlify function, Admin's Supabase project)
    │   ── server-to-server, §5 ──
    ▼
  core-v2-ceo-admin  (Edge Function, Measured Decision project)
    │
    ▼
  Core V2 runner → kernel → provider adapters → provider API keys
                                                (server-side, never move)
```

**The browser never talks to Core V2.** It has no Core V2 credential, no
organisation id and no workflow id it did not get from its own backend. The
Admin backend is the only thing that crosses.

**No provider key exists anywhere on the CEO Admin side.** The engine's
runtime reads a named environment variable at the moment of the request,
after every gate has passed, and keeps it nowhere. Nothing about the CEO
Admin changes that.

---

## 2 · Database ownership

Neither database references the other's tables. The join is by stable
external id, carried in the contract.

**The Admin's Supabase project (`mnngocwncpktoxrrhwmq`) owns**
`projects`, `tasks`, `waiting_for`, `email_accounts`,
`email_message_index`, `calendar_items`, the owner's UI state, and the
human-facing decision tables `decision_runs`, `decision_inputs`,
`decision_outputs`, `human_decisions`.

**The Measured Decision database owns** `intelligence_workflows`,
`workflow_tasks`, `agent_attempts`, `evidence_claims`, `evidence_anchors`,
`claim_assessments`, `disagreements`, `decisions`, `decision_evidence`,
`workflow_cost_budgets`, `attempt_cost_reservations`, `workflow_continuations`
and the Core audit trail.

**The keys that join them**

| Concept | Written as | Example |
|---|---|---|
| A row of the Admin | *record key* | `task:11111111-…`, `email:acct-one:msg-abc` |
| A question about a row | *subject key* | `priority/task:11111111-…` |
| A batch of rows read together | *batch id* (the Admin's) | `morning-2031-03-17` |
| The workflow that batch became | Core V2 `workflow_id` | derived; see §4 |

`readSubject()` in `records.ts` splits a subject key back into its question
and its record key. Nothing else is needed to line an engine answer up
against an Admin row.

### Record keys, by kind

```
task:<task uuid>
waiting:<waiting_for uuid>
email:<email_accounts.id>:<provider_message_id>
calendar:<calendar_id>:<provider_event_id>
project:<projects uuid>
```

Each part must be non-empty and contain no colon, bar or whitespace. The door
refuses anything else rather than escaping it — an escape is a thing somebody
has to remember.

### Questions

```
classify/<email record key>        which project, what attention, is a reply owed
priority/<record key>              the urgency factors, and the band derived from them
commitments/<record key>           is a reply due, has it gone stale, is it nearly here
conflict/pair:<key a>|<key b>      does keeping the appointment prevent doing the work
order/day:<YYYY-MM-DD>             the ordering of the day
```

---

## 3 · The source envelope

One POST body. `workers/core-v2-runner/ceo-admin/submission.ts` parses it;
`parseSubmission` is the only place its rules live.

```jsonc
{
  "domain": "ceo_admin",
  "contractVersion": "ceo-admin.source.1",
  "organizationId": "<Core V2 organization uuid>",
  "batchId": "morning-2031-03-17",          // the Admin's own; idempotency
  "capturedAt": "2031-03-17T08:00:00Z",
  "today": "2031-03-17",                     // or null: no time questions, no ordering
  "projectKeys": ["wccm", "crdp", "..."],    // the Admin's taxonomy, as data
  "conflictPairs": [
    { "calendar": "calendar:cal-one:evt-one", "task": "task:1111…" }
  ],
  "records": [
    {
      "sourceType": "email_message",         // task | waiting_for | email_message
                                             // | calendar_item | project_state
      "identity": { "accountId": "…", "providerMessageId": "…" },
      "recordVersion": "3",                  // the Admin's own version of this row
      "capturedAt": "2031-03-17T06:05:00Z",
      "fields": { "subject": "…", "received_at": "…", "direct_to_owner": "true" },
      "text": "the body, as plain text"      // or null
    }
  ]
}
```

### What it refuses, and why each refusal is at the door

Every check runs **before a workflow exists**. A refusal is a message to a
caller who can fix it; a bad row admitted is a workflow that fails its own
material check on every pass until a fuse settles it, and somebody has to go
and find that.

| Refused | Because |
|---|---|
| a record with no `identity` | there would be nowhere to carry the answer back to |
| an identity containing `:`, `\|` or whitespace | two rows would answer to one subject key |
| a record with no `recordVersion` | the kernel's recovery rests on a source set that rebuilds to the hashes it recorded |
| two records that normalise to one subject key | both, by name — never merged. A collision means the caller's identifiers are not what the caller thinks they are |
| a batch every triage rule settles | a workflow with nothing to do is a row nobody will ever look at |
| more than 120 records | stated as a number rather than discovered as a runaway |
| a `contractVersion` this door does not speak | a guess about a schema is a wrong answer with confidence |

### Identity and supersession

A record's content hash is taken over `{contract, sourceType, subjectKey,
recordVersion, sanitised fields, sanitised text}` — **not** over the capture
time, so polling the same unchanged row twice is the same source, and **not**
over the primary key alone, so an edited row is a *different* source.

An edited row therefore cannot rewrite a finished answer. It can only be part
of a new batch, which becomes a new workflow. The record of what was read in
March says what was read in March.

---

## 4 · The API boundary

**Extend the existing surface. Do not create a second orchestrator.**

The existing `core-v2-analysis` function is the model to copy: it is the
owner-facing door for the uploaded-files domain, it authenticates every
operation, it reads no provider key and sends nothing to a provider itself,
and it starts workflows through `startFromManifest` — the same "a manifest
somebody else built" door this domain uses.

`supabase/functions/core-v2-ceo-admin` exists and has seven operations, in
the same shape:

| op | Does |
|---|---|
| `preflight` | which of the four dormancy secrets are set, by **name, never value** |
| `estimate` | triage a batch and return the call amplification — no workflow created, nothing spent |
| `submit` | admit the envelope, write the material, start the workflow, all in one transaction |
| `status` | workflow state, task counts by state, continuation, budget, count waiting for a person |
| `results` | the proposals, their evidence and their disagreements — §7 |
| `adjudicate` | pass a human decision to `core_v2_resolve_disagreement` |
| `cancel` | stop giving out new work; say honestly what is already out |

`submit` is `startFromManifest(...)` with `alongside` writing the material
rows in the same commit — exactly as `core-v2-analysis` writes its authority
and budget rows. Workflow, sources, outbox, audit, continuation and material
commit together or not at all.

### Idempotency

`workflowIdFor(organizationId, batchId)` is a UUID v5 over the organisation
and the batch name. The same batch submitted twice names one workflow; the
second `submit` finds it already exists and returns its id and state. A record
added to a retried batch does **not** create a second workflow over almost the
same material — which is how an engine reads the same mailbox twice and bills
for it.

Records are sorted by subject key before ordinals are assigned, so the same
batch serialised in a different order is the same workflow with the same
source hashes and the same task ids.

### The material store

The sanitised text a reader saw has to survive between one pass and the next:
the watchdog picks a workflow up minutes later, in another process, and a
critic must be handed **the same bytes** the reader saw. Asking the Admin
again is not an option — the Admin's row may have changed, and a resolver that
answered with the new text would hand a critic material no reader ever saw,
which is the exact failure `sourceSetOfRecord` exists to make impossible for
the other domain.

`submission.ts` defines the interface (`CeoMaterialStore`: `put` and `get`,
answered by hash and by nothing else); `ceo-admin/material.ts` implements it
over migration 068, which creates:

`public.ceo_admin_material`, keyed `(workflow_id, content_sha256)`, carrying
the sanitised text with its provenance — source type, the submitting system's
subject key, the version it was captured at, which part it is, and when. Two
`security definer` doors: `ceo_admin_put_material` (which recomputes the hash
from the characters rather than trusting the caller's) and
`ceo_admin_read_material` (by hash, for one workflow; no listing, no search).
RLS on with no policy, and grants to the service role only.

Written once with the workflow; deleted only when the workflow is. A hash the
workflow did not declare is not answered, whoever asks.

**Material is content-addressed; a source's identity carries the version.** A
part whose characters did not change between two versions of a row hashes to
the same value, and that is correct — identical text is identical text. What
keeps two runs apart is the key, which is `(workflow, hash)`.

---

## 5 · Server-to-server authentication

### The trust boundary, stated exactly

| Party | Holds | Can do |
|---|---|---|
| The owner's browser | an Admin Supabase Auth session | read and write the owner's own Admin rows under RLS. **No Core V2 credential of any kind.** |
| The Admin backend (Netlify function) | its own Admin service credential, and one Core V2 credential | submit batches and read results for **one** Core V2 organisation |
| `core-v2-ceo-admin` (Edge Function) | `SUPABASE_DB_URL` from the platform | everything the Core V2 doors allow that organisation |
| The Core V2 runner | the operator registry and the provider key variable names | spend, within the workflow's authorised budget |

Nothing to the left of a row ever holds what is to its right.

### How the Admin backend proves itself

The existing doors are deployed with `verify_jwt = true` and read the caller
from the bearer token's `sub`, then check `organization_members`. That is
built for a person. The Admin backend is not a person, and giving it a
person's long-lived token would be a password in a config file.

**A Supabase service account in the Measured Decision project, plus one
mapping row.** Migration 068 adds `public.ceo_admin_tenants`, which says which
organization an administrative owner's work belongs to and which service
account may submit it. It authorises nothing on its own —
`ceo_admin_tenant_for` also requires live membership in
`organization_members`, and the integration suite proves all four ways in are
closed: an unregistered signer, the wrong owner, a disabled mapping, and a
submitter removed from the organization.

Concretely:

1. Create one `auth.users` row for the Admin's work — no password, no email
   sign-in, sign-in disabled. Insert it into `organization_members` for the
   CEO Admin organisation with role `admin` (it must start workflows;
   `owner` is not needed and should not be given), and register it in
   `ceo_admin_tenants` for the administrative owner.
2. Name that user id to the door itself, as the function secret
   `CORE_V2_CEO_ADMIN_SUBMITTER`. **The caller never says who it is.** The
   door acts as the submitter its own deployment names.
3. Generate one random secret (at least 32 characters) used for this door and
   nothing else. It is set twice: as the function secret
   `CEO_ADMIN_DOOR_SECRET` here, and as the Netlify function variable
   `CORE_V2_ADMIN_DOOR_SECRET` on the administrative side.
4. The Admin backend signs `${timestamp}.${body}` with it (HMAC-SHA256, hex)
   and sends `x-ceo-admin-timestamp` and `x-ceo-admin-signature`. The door
   (deployed with `verify_jwt = false`, declared in `supabase/config.toml`)
   refuses anything whose signature does not verify or whose timestamp is more
   than five minutes from its clock, **before** it reads the operation or
   opens the record — `workers/core-v2-runner/ceo-admin/signature.ts`, pinned
   by `ceo-admin-signature.mjs` and by one fixed vector the administrative
   suite pins too.
5. `core-v2-ceo-admin` then calls `ceo_admin_tenant_for(submitter,
   adminOwnerUserId)`, which returns the organization or nothing. **The
   request never names an organization**: a caller that could pass one could
   read another tenant's workflows by passing theirs.

**Why not the platform's JWT.** The first version of this door had the Admin
mint a JWT signed with this project's JWT secret, so the platform's
`verify_jwt` could check it. That secret can mint any role here,
`service_role` included; lending it to another system would have made a leak
of that system's environment a leak of this whole database. The shared door
secret buys exactly the permissions `ceo_admin_tenants` already grants, and
rotating it touches nothing else. Replay inside the five-minute window is
harmless: `submit` is keyed by its content, `adjudicate` is refused once the
disagreement is settled, `cancel` is idempotent, and the rest only read.

This keeps every other property: `has_org_role` still gates
`core_v2_resolve_disagreement`; the tick door still proves itself with the
Vault secret it asks the database about (migration 065) and never with
anything a caller supplies.

### What must never cross

- the Measured Decision **service-role key** — the Admin never holds it
- `CORE_V2_RUNNER_SECRET` — the watchdog's, and nobody needs a copy
- any provider API key — these exist only in the Measured Decision function
  environment and are read once, at the moment of a request
- the Admin's **service-role key** — Core V2 never holds it and never reads an
  Admin table

### Rotation

Generate a new door secret, set `CEO_ADMIN_DOOR_SECRET` here and
`CORE_V2_ADMIN_DOOR_SECRET` on the administrative side in the same change
window, and redeploy both. Requests signed with the old secret stop verifying
at once; nothing else in either project changes. There is no token to revoke:
a signature is good for five minutes and for one body.

---

## 6 · Cost control

### The stages

| Stage | What it is | What it costs |
|---|---|---|
| 0 | `triage.ts` — deterministic rules over envelopes, dates and states | nothing |
| 1 | `estimate` — the call amplification, before anything is authorised | nothing |
| 2 | the pack's blind readings and the kernel's criticism | paid |
| 3 | verification and arbitration, **only where two readers differ** | paid, and only sometimes |

Stage 0 decides what is worth an opinion. Its rules are about the *envelope*
of a row — a list-unsubscribe header, a status the Admin already set, a date
that has passed — never about what the row says, because what the row says is
the reading and the reading is what the engine is for. Every rule is checkable
by somebody who has never seen the body, and every drop is reported with the
rule's name so the owner can overrule it.

**Triage never performs an action.** A dropped row stays exactly where it was;
the only thing that happened is that nobody paid to have an opinion about it.
It may carry a *proposed* attention (`noise`, `legacy`) — a proposal, like
everything else here.

### The amplification, measured

One message worth reading:

```
2 blind readings + 2 criticisms + 1 composition   =  5 calls expected
+ 1 verification + 1 arbitration (only if the two readers differ)
                                                  =  7 calls at worst
```

One hundred circulars:

```
100 records, 100 dropped before reading, 0 calls at worst.
```

That is the number the design exists for, and
`tests/ceo-admin-submission.mjs` §6 asserts it.

The full invented desk — 16 rows, 15 read — is 30 readings, 30 criticisms and
20 compositions expected; 110 calls at worst. A real morning of a few hundred
messages is dominated by stage 0, because a mailbox is dominated by circulars.

### The engine's own controls, unchanged

Nothing here bypasses Core V2 cost accounting. `submit` writes an authorised
maximum through `core_v2_authorize_workflow_spending`, exactly as
`core-v2-analysis` does. Every attempt takes a hold for the most it could cost
inside the same unit of work that submits it; settlement prices from the
stored basis; an attempt whose outcome nobody knows settles nothing and
releases nothing. A ceiling per submission (the analysis door uses `$25`)
should be set on this door too, so a typed zero too many costs a refusal
rather than a bill.

---

## 7 · The Decision Audit contract

Sprint 1 already has the tables. This is what fills them.

| Admin column | From Core V2 |
|---|---|
| `decision_runs.source_type` | the record kind — `email_message`, `task`, … |
| `decision_runs.source_id` | the **record key** (`readSubject(subject_key).recordKey`) |
| `decision_runs.decision_type` | the question — `classify`, `priority`, `commitments`, `conflict`, `order` |
| `decision_runs.status` | `decisions.status` — `machine_decided`, `needs_human`, `human_decided` |
| `decision_runs.proposed_action` | the accepted claim's `value.text` (the band, the project, the attention) |
| `decision_runs.explanation` | `decisions.summary` |
| `decision_inputs.input_type` | the segment kind — `record_fields` or `record_text` |
| `decision_inputs.source_reference` | `evidence_anchors.segment_id` |
| `decision_inputs.evidence_json` | `evidence_anchors.quoted_text` and its locator |
| `decision_outputs.reader` | the claim's `independence_group` — `reader_a`, `reader_b` — or the judging role |
| `decision_outputs.result_json` | the claim's `value` |
| `decision_outputs.evidence_json` | that claim's anchors |
| `human_decisions.*` | written by the Admin; mirrored to Core V2 via `adjudicate` |

The screen the contract supports, left to right:

```
  source        the record, at the version that was read
    ↓
  reader A      one word, with the text it was read off quoted
  reader B      one word, with the text it was read off quoted
    ↓
  comparison    agreement, or a disagreement with its kind and severity
    ↓
  verification  what a critic found when it opened the record again
    ↓
  proposal      the accepted claim, or "needs a person" with the reason
    ↓
  human         approved / rejected / modified, and the final value
```

For a **priority** subject the screen has one extra row worth building: the
thirteen factors, each with its level and the sentence it was read off, and
underneath them the rung of the ladder that produced the band —
`value.attributes.rule`, e.g. *"a regulatory exposure, a risk to an asset, or
a deadline the record shows as nearly on us"*. That is the whole working, and
it is why the priority is arguable rather than a number.

### The changes the Admin's schema carries

Applied by `supabase/migrations/20260922130000_core_v2_decision_link.sql`,
additive throughout, alongside `projects.key`, `proposed_actions` and
`core_v2_batches`:

```sql
-- 1. a critic and a verifier are readers too
alter table public.decision_outputs drop constraint decision_outputs_reader_check;
alter table public.decision_outputs add constraint decision_outputs_reader_check
  check (reader in ('reader_a','reader_b','arbiter','critic','verifier'));

-- 2. the link back to the engine, so a finding can be traced to its workflow
alter table public.decision_runs
  add column core_workflow_id uuid,
  add column core_subject_key text,
  add column core_decision_id uuid,
  add column core_batch_id    text;
create index idx_decision_runs_core_workflow on public.decision_runs(core_workflow_id);
```

Both are additive and touch nothing the Gmail work is building. The migration
also adds `proposed_actions` — where an engine proposal waits for a person —
with a trigger that refuses a row marked executed which does not name the
`human_decisions` row that authorised it. That is §8's rule as a constraint
rather than as a code path.

---

## 8 · Human authority

**The engine proposes. The principal decides.** This is not a policy this
integration added; it is a property of the kernel it could not have removed.

- there is no phase in which a claim becomes a side effect
- `DecisionActionType` is `review | verify_source | request_information |
  proceed | hold` — five words about what a person should do next, none of
  which is a thing done to a mailbox
- an envelope has no field for having performed anything. The suite proves
  this by running a reader that *obeys* an injecting message: its claim to
  have archived and sent things survives only as a line in `limitations`,
  because there is nowhere else for it to go
- a machine acceptance needs an independent verification of the *source*, a
  deterministic rule, or a person. Two identical readings never accept
  anything (`acceptanceCanStand`)

### The two kinds of thing a person does

**Owner-initiated.** The owner clicks Archive on a message in front of them.
That click *is* the decision. It goes through the mailbox route the
application already has, is audited in `email_audit_log` as it already is, and
the engine never sees it. Asking them to approve their own click would be a
ritual, and a ritual people click through teaches them the gate means nothing.

**Engine-proposed.** The engine proposes filing a message. Nobody has decided
anything. It lands in `proposed_actions` with `human_decision_id` null, which
the database will not let anyone mark executed. `/admin/core-v2/decide` writes
the `human_decisions` row first, links it, and only then performs the act —
through the same mailbox service a click uses, so there is no second copy of
archive, trash or classify anywhere.

Consequential acts — archive, trash, unsubscribe, send, create or move a
calendar event, create a consequential task, change a project's status, alter
a regulatory priority — happen **in the Admin, after a `human_decisions` row
exists**, and never as a consequence of anything Core V2 returns. Nothing in
either repository performs an outward action today: the only executor wired in
is `classify_email`, which files a message within this system.

---

## 9 · The CEO Admin taxonomy

The engine holds no opinion about which projects exist. `projectKeys` is sent
on every submission and the pack has no default — `tests/ceo-admin.mjs` §14
asserts that a pack built with no taxonomy says "(none configured)" in its
role contracts rather than inventing one.

This is not only tidiness. `tests/nothing-real.mjs` refuses any client name
anywhere under `workers/core-v2/`, and **two tokens of this taxonomy are
already on that denylist**. The taxonomy lives in the Admin, as data, and
crosses as data.

The Admin's current set, as short stable keys the Admin's own `projects` table
should carry:

```
core / daily      wccm     West Coast Capital Mortgage
                  crdp     California Residential Development Partners
                  statecourse
                  plg      Pegasus Lenders Group
                  wccr     West Coast Capital Realty
strategic         tokenization
                  pcn      Pegasus Capital Network
                  mdai     Measured Decision AI
admin             personal_admin
                  legacy
```

Markevita is deliberately not in the primary taxonomy.

Attention values are the pack's, not the caller's, because they must compare
across runs: `action_required`, `waiting_for`, `important`, `fyi`, `legacy`,
`noise`, `unclear`.

---

## 10 · Prompt injection

Email content is untrusted external input. Four independent defences, none of
which relies on detecting an instruction — detection is a losing game and this
system does not play it. The defence is that instructions in material have
nowhere to land.

1. **The sanitiser** (`records.ts`, applied before text is ever material):
   zero-width and direction-overriding marks removed so a hidden word closes
   back up; control characters flattened; every web and mail address replaced
   by `[link]` / `[address]`; length bounded at 8,000 characters with the cut
   stated in the text. Deterministic, because the output is hashed as the
   source's identity.
2. **The packet guard** (kernel, pre-existing): a packet carrying a URL, a
   credential, a provider's name, or a majority dressed as proof is refused
   before dispatch. §5 of the suite runs it over every packet of a whole
   workflow including the ones full of quotations from the injecting message.
3. **The prompt rule** (runtime, added this sprint): material is evidence and
   never instruction — given to every role of every pack.
4. **The absence of a mechanism**: there is no tool, no action type and no
   envelope field through which a reader could do what a message asks. The
   worst an obedient reader achieves is a wrong classification, which the
   second reader disagrees with, which the kernel records.

What an injecting message **cannot** alter: system instructions (they are
compiled from the packet and nothing else), the tools available (there are
none), routing policy (decided by the registry, unreachable from a pack),
permissions (`allowedActions` comes from the role), or any external effect
(there is no path to one).

The fixture carries a message that tries all of it at once — an address to
fetch, an instruction to ignore the rules, a claim of operator authority, four
destructive orders, and an invisible character mid-word. It is deliberately
**read, not dropped**: triage decides what is worth an opinion, never what is
dangerous to look at.

---

## 11 · How this sits beside the Gmail work

The Gmail work and this integration touch no file in common.

The administrative application's half is wired in **around** the existing
handler rather than inside it. `netlify/functions/admin.mts` — which the Gmail
branch does not touch — wraps `createHandler()` with `withCoreV2(...)`, and
`core-v2-routes.mjs` serves four routes of its own and decorates two pages.
Everything else is handed through untouched. So `admin-handler.mjs`,
`gmail-service.mjs` and `gmail-ui.mjs` are not modified here at all, and the
two branches can land in either order.

What this integration consumes from the Gmail work, once it lands:

| It provides | This uses it for |
|---|---|
| `email_message_index` with `owner_user_id`, `snippet`, `provider_labels`, `is_noise_subscription` | the email sources of a batch |
| `email_accounts.owner_user_id` | scoping a batch to one owner |
| `gmail.classify(ownerId, id, input)` | performing an **approved** proposal — reached by dynamic import, never copied |
| `email_audit_log` | where an owner's own click is already audited |
| the seeded `projects` rows | the taxonomy, via the `key` column this migration adds |

Until it lands, everything still runs: the adapter reads whatever columns
exist, the executor is absent so an approved proposal records the decision and
reports that nothing was performed, and the tests cover both paths.

The one place the two genuinely meet is the approval path, and it is settled
in the schema rather than in a convention: `proposed_actions.human_decision_id`
references `human_decisions(id)`, and a trigger refuses a row marked executed
without one.

---

## 12 · What remains before production

Everything below is operator configuration and verification. No further code
is required for the pilot.

1. **Apply the two migrations through the normal path.** Measured Decision:
   `068_the_rows_another_system_holds.sql`, which the repository's own
   workflow applies on merge to `main`. Administrative project:
   `20260922130000_core_v2_decision_link.sql`. Both are additive; neither
   rewrites anything.
2. **Create the service account and the mapping row.** One `auth.users` row in
   the Measured Decision project with sign-in disabled, a
   `organization_members` row giving it `admin`, and one `ceo_admin_tenants`
   row naming the administrative owner, the organization and that account.
3. **Set the administrative application's three variables** —
   `CORE_V2_ADMIN_URL` and `CORE_V2_ADMIN_DOOR_SECRET` —
   in the Netlify **deploy preview** context first.
4. **Deploy `core-v2-ceo-admin` dormant** and confirm `preflight` answers with
   names and no values. At this point a batch can be costed and nothing can be
   spent, which is the correct state to stop and look around in.
5. **Preview run, no provider network.** Sign in as the owner on the deploy
   preview, press *Read today's desk* over a small real set, and confirm: the
   workflow is created, the material rows match the declared parts, and the
   engine records a refusal for anything that would cost while
   `CORE_V2_RUNNER_ALLOW_PROVIDER_NETWORK` is unset.
6. **One paid canary**, against the Measured Decision **test** project
   (`viuqggxrahckzbrnecoo`, where the watchdog is already armed), with
   `CORE_V2_RUNNER_AUTHORIZED_USD` at a dollar or two. Read every packet in
   the log and confirm no address, no credential and no other reader's answer
   reached anybody.
7. **Verify the screens**: Decision Audit shows the sequence of §7, Today
   shows the proposed order, and approve / reject / modify each write the row
   they should.
8. **Then production**, and only then. Autonomous action stays off: the only
   executor wired in files a message within this system, and it runs only
   behind a recorded human decision.

Do not run step 8 until step 6 has been read by a person, line by line.

---

## 13 · Later

**StateCourse** is a second pack on the same kernel, reusing every part of
this except `pack.ts` and its fixture. The source contract, the submission
door, the material store, the tenancy mapping, the runner's world builder and
the whole administrative half are domain-independent and already written.
