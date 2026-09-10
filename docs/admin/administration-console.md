# Administration console

The console at `/admin/console/` exists so that running StateCourse does not require a
developer. Two things are in it today: what the catalog actually says, and the chain that
takes a course video from a file on a laptop to a screen in a lesson.

It records and reports. It grants no regulator approval, opens no enrollment, and awards no
course credit — and there is no code path in it that could.

## Signing in

Authentication is the same Supabase session students use. Authorization is separate and comes
from `staff_actor_binding_events`, an append-only ledger of who holds which role.

Signing in with an account that has no binding succeeds and shows an empty console. That is
deliberate: the credential was right, and answering with a failure sends the person off to
reset a password that works.

| Role | May do |
| --- | --- |
| `owner` | everything |
| `administrator` | read the catalog; reserve, confirm, review, place, withdraw video |
| `video_producer` | reserve, confirm and review video; **not** place or withdraw |
| `regulator_reviewer` | read the catalog and the video chain |
| `instructor` | reserved for the Michigan review workflow |
| `support` | read the catalog |

A binding may carry `scope_state`. A scoped binding reads only that state's catalog rows and
can act only on courses whose `courses.state` matches — checked against the course record, so
editing a request field does not widen it. A null `scope_state` covers every state.

`STATECOURSE_ADMIN_API_TOKEN` still works for the older payment endpoints. The console does
not accept it. A string shared by several people can say that a request arrived; it cannot say
who made it.

### Granting the first role

No migration seeds a binding, because a row asserting that someone was given authority is
evidence of a decision, and a migration is not a decision. The first one is inserted by hand
with the service credential:

```sql
insert into staff_actor_binding_events
  (auth_user_id, actor_role, binding_status, effective_at, evidence, recorded_by)
values
  ('<supabase auth.users id>', 'owner', 'active', now(),
   '{"basis":"account owner","authorized_by":"<name>","on":"<date>"}'::jsonb,
   '<supabase auth.users id>');
```

Revoking is another insert with `binding_status='revoked'`, never an update: the ledger is
append-only and a trigger refuses anything else.

## Catalog

Six sources describe StateCourse courses and they disagree:

| Source | What it is |
| --- | --- |
| `public/statecourse/data/course-catalog.json` | what visitors are shown |
| `config/course-catalog.mjs` | what checkout can sell, driven by environment variables |
| `courses` | what enrollment and delivery join against |
| `regulatory_course_versions` | lifecycle, hours, credit |
| `config/regulatory-course-versions.json` | the same lifecycle, in the repository |
| `config/state-regulatory-controls.json` | regulator detail, and the only declared id bridge |

They also use different identifiers for the same course. Virginia's course is
`va-principles-practices-v1` in the public catalog and `va-salesperson` at checkout;
`state-regulatory-controls.json` declares a `payment_product_id` bridge for four courses and
for no others.

The console matches on an exact id or on a declared bridge, and on nothing else. An inferred
match would turn a real gap into a reassuring row. Where two records look like the same course
and no bridge says so, they stay two rows and both are reported as disagreeing.

The view is read-only. Approval status, enrollment flags and lifecycle records move when a
regulator moves them; a console that could set them would let the catalog be made to say
anything, which is the opposite of what it is for.

An unreachable table is reported as unavailable rather than as an empty catalog: "this course
does not exist" and "the database could not be reached" lead an operator to opposite
conclusions.

## Course video

### What this replaces

Placing one video meant: render it, upload it to Cloudflare by hand, write a QC record, edit
`config/stream-media.mjs`, edit the state's screen-media registry, regenerate the block maps,
add the Stream UID to `CLOUDFLARE_STREAM_VIDEO_MAP`, and deploy. Eight steps, six of which only
a developer can perform. The ten release conditions in `video-production/PORTFOLIO.md` were
enforced by someone remembering them.

### The chain

1. **Reserve.** Choose a course, a delivery unit and an instruction screen from what the block
   maps actually contain. A screen that does not exist, or one that scores a response, is
   refused here — before anything is created, rather than discovered as a blank space in a
   lesson. Cloudflare returns a one-time upload URL scoped to a single video, created with
   `requireSignedURLs: true` and the production origin allowlist already set.
2. **Upload.** The file goes from the operator's machine straight to Cloudflare. The API token
   stays on the server and the browser never sees it.
3. **Confirm.** The server asks Cloudflare what it received. If the reported duration differs
   from the declared duration by more than five seconds it is the wrong file and the upload is
   rejected. Three release conditions — `stream_upload`, `signed_playback`, `origin_restriction`
   — are recorded from the API response, and cannot be recorded by hand: a checkbox saying
   "signed playback is enforced" is a statement about what someone believed.
4. **Review.** The other ten need a named person and a written basis of at least ten
   characters. A pass with no stated basis is a checkbox.
5. **Place.** Refused unless all thirteen conditions currently pass — checked in the endpoint
   so the console can say what is missing, and again inside `place_video_asset` so the row
   cannot be written even if the endpoint is wrong.
6. **Withdraw.** Needs a stated reason. The video stops being delivered immediately.

Readiness is derived, never stored. Recording a later failure on any condition withdraws
readiness by itself, with no second record to keep in step.

### The thirteen conditions

The ten in `video-production/PORTFOLIO.md`, plus the three delivery conditions in
`portfolio.json`'s release rule. `video_release_gate_definitions` is the list; the console
reads it rather than carrying its own copy.

### Delivery

`console_video_delivery` lists only assets that are placed, release-ready and uploaded. The
Stream authorization core reads it first and falls back to `config/stream-media.mjs`, so:

- a video released through the console needs no code change and no environment-variable edit;
- the two reviewed Texas videos keep resolving exactly as they did, from the code registry and
  `CLOUDFLARE_STREAM_VIDEO_MAP`;
- a console lookup that fails falls back to the code registry rather than interrupting
  playback for a video already in front of students.

### Environment

Beyond the runtime secrets in
[the Stream runbook](../video/cloudflare-stream-production.md):

- `CLOUDFLARE_ACCOUNT_ID` — 32 hex characters, the id in the Cloudflare dashboard URL. Not a
  secret; it is rejected at runtime if it is not that shape, because it goes into an API path.
- `CLOUDFLARE_STREAM_API_TOKEN` — a secret. See below.
- `CLOUDFLARE_STREAM_ALLOWED_ORIGINS` — optional; defaults to the `STATECOURSE_BASE_URL` host
  and its `www` form

#### The Stream token

Cloudflare dashboard → My Profile → API Tokens → Create Token → Create Custom Token:

| Field | Value |
| --- | --- |
| Permissions | `Account` · `Stream` · `Edit` |
| Account Resources | Include · the StateCourse account only |
| Zone Resources | none |

`Stream` is the product; `Edit` is read plus write. Read alone cannot create a direct upload,
which is step one of the chain, so `Edit` is the narrowest level that works — Cloudflare
offers no third option. Be clear about what that means: `Edit` also permits deleting videos
and managing signing keys. This code never calls either, but the token could. Scope it to the
one account, give it nothing else, and rotate it if it is ever pasted anywhere but the Netlify
environment.

The token is shown once. It belongs in the Netlify production environment and in no file in
this repository.

`netlify.toml` adds `https://upload.videodelivery.net` to `connect-src`. It is an upload
endpoint only: no script, style, frame or image may load from it. The alternative was relaying
a 25 MB upload through a function.

## What is written down

Every console action appends to `admin_console_actions` with the acting Supabase user, the role
it acted under, and the subject. The actor comes from the session; a request body naming
someone else is ignored, not honoured.

`staff_actor_binding_events`, `video_release_gate_events`, `video_placement_events` and
`admin_console_actions` are append-only, enforced by a trigger. A later decision is added; an
earlier one is never edited away.

## Applying the schema

`database/019_platform_admin_console.sql`. It seeds the thirteen gate definitions and nothing
else: no binding, no gate decision, no placement. It creates only new objects — no existing
table, approval flag, lifecycle record or payment row is read or written.

### Checking it landed

```sql
select
  (select count(*) from video_release_gate_definitions) as gates,       -- expect 13
  (select count(*) from staff_actor_binding_events)     as bindings,    -- expect 0
  (select count(*) from video_assets)                   as assets,      -- expect 0
  (select count(*) from video_placement_events)         as placements;  -- expect 0
```

The revokes matter more than the tables, because a table that exists with the wrong
privileges is worse than one that does not exist. This must return **no rows**:

```sql
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where grantee in ('anon', 'authenticated', 'public')
  and table_name in (
    'staff_actor_binding_events', 'video_assets', 'video_release_gate_definitions',
    'video_release_gate_events', 'video_placement_events', 'admin_console_actions'
  );
```

### Granting the first role

Looked up by email rather than by a pasted UUID, so the wrong id cannot be granted ownership:

```sql
insert into staff_actor_binding_events
  (auth_user_id, actor_role, binding_status, effective_at, evidence, recorded_by)
select u.id, 'owner', 'active', now(),
       jsonb_build_object('basis', 'account owner', 'granted_on', current_date),
       u.id
from auth.users u
where u.email = 'owner@example.com'
returning auth_user_id, actor_role, binding_status;
```

If it returns no rows, the account does not exist in `auth.users` yet — the console
authenticates Supabase accounts and cannot create one. Register it through the site's
sign-up, or add it in Supabase Auth, and run this again.

One consequence worth knowing in advance: signing in to the console upserts the account into
`students`, because console authentication reuses the student session mechanism (the Michigan
staff workflow already behaves this way). The owner will appear in that table with no
enrollment, so anything counting enrolled students is unaffected and anything counting rows in
`students` is not.
