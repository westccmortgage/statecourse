# Administration console

The console at `/admin/console/` exists so that running StateCourse does not require a
developer. Two things are in it today: what the catalog actually says, and the chain that
takes a course video from a file on a laptop to a screen in a lesson.

It records and reports. It grants no regulator approval, opens no enrollment, and awards no
course credit — and there is no code path in it that could.

## Setup, in order

Everything below is done once. The rest of this document explains why each piece is shaped
the way it is; this section is just the sequence.

**1 · Apply the schema.** `database/019_platform_admin_console.sql`, then
`database/020_admin_console_audit_repairs.sql`, in the Supabase SQL editor — then the two
checks under [Checking it landed](#checking-it-landed). 020 repairs findings from an
independent audit of 019 and is required; 019 alone cannot deliver a placed video.

**2 · Make sure an account exists.** The console authenticates Supabase accounts and cannot
create one. Register through `/student/register/` on the site, or add the user in Supabase
Auth. Use a real address you can receive mail at.

**3 · Grant yourself `owner`.** The insert under
[Granting the first role](#granting-the-first-role). Until this runs, signing in succeeds and
shows an empty console — that is the system working, not a failure.

Owning the infrastructure and being a named actor are different things, which is why this
step exists at all rather than being inferred. Whoever holds the service-role key can already
do anything to this database; if the console treated that as authority, every record it wrote
would say only that a server made a request. The binding is what lets a record say that a
person placed a video on a date, and it is the same reason a cloud account owner still
carries a user identity rather than acting as the account.

There is no chicken-and-egg problem in the bootstrap: the first row is written through the
Supabase SQL editor with the service credential, which only the infrastructure owner holds.
It is self-attested by construction — the owner granting themselves ownership, with a date
and a stated basis — and every grant after it carries a `recorded_by` naming who made it.

**4 · Set the environment.** In Netlify, `CLOUDFLARE_ACCOUNT_ID` and
`CLOUDFLARE_STREAM_API_TOKEN`, both **scoped to Functions**. The Stream token is built as
described under [The Stream token](#the-stream-token).

**5 · Deploy.** Netlify applies an environment change on the next deploy and not to functions
already running, so nothing above takes effect until this happens.

**6 · Open `/admin/console/`** and sign in with the account from step 2. You should see your
role, a catalog table, and an empty video list.

If a step is missed, the console names the missing configuration key rather than reporting a
generic outage — a signed-in staff member gets told which one.

## What to do with it once it runs

**The catalog answers a question you cannot currently answer**: what does each system
actually believe about each course. Expect it to be uncomfortable reading — the public
catalog lists thirty courses and checkout can sell ten, and the console shows that as twenty
rows rather than as a footnote. Nothing there is changed by the console; it is a report you
act on elsewhere.

**The video tab is where work happens.** A realistic first pass, on a course that is not
enrolling students:

1. Pick a video you have already rendered and reviewed.
2. Reserve an upload against its instruction screen and upload the file.
3. Record the ten review conditions honestly, including any that fail. A failing condition is
   a normal outcome and is meant to be recorded, not avoided.
4. Watch placement be refused while anything is outstanding, then pass the last condition and
   place it.
5. Withdraw it again with a reason, and confirm it stops being delivered.

Doing this once on a course with no enrolled students is worth more than reading the rest of
this document, because it shows the refusals working rather than asserting that they do.

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

Roles are granted by inserting into `staff_actor_binding_events` — see
[Setup, in order](#setup-in-order) for the first one. Revoking is another insert with
`binding_status='revoked'`, never an update: the ledger is append-only and a trigger refuses
anything else. No migration seeds a binding, because a row asserting that someone was given
authority is evidence of a decision, and a migration is not a decision.

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
   lesson. If the screen already carries a video, from a block map or from the console, the
   request is refused unless it names that asset and gives a reason: `video_screen_replacements`
   then records what was displaced. The asset row is written before Cloudflare is called and
   carries a reservation id that travels to Cloudflare as metadata, so a failure leaves a
   visible retryable row rather than an orphaned upload. Cloudflare returns a one-time upload
   URL created with `requireSignedURLs: true` and the production origin allowlist already set.
2. **Upload.** The file goes from the operator's machine straight to Cloudflare. The API token
   stays on the server and the browser never sees it.
3. **Confirm.** The server asks Cloudflare what it received. If the reported duration differs
   from the declared duration by more than five seconds it is the wrong file and the upload is
   rejected. Three conditions — `stream_upload`, `signed_playback`, `origin_restriction` — are
   recorded from the API response and cannot be recorded by hand: a checkbox saying "signed
   playback is enforced" is a statement about what someone believed.
4. **Captions and transcript.** Both texts are submitted, stored and hashed. The caption track
   is sent to Cloudflare and then read back, and the returned bytes must hash to what was sent;
   the transcript is proved by reading the stored row back and re-hashing it. That decides
   `shipping_captions` and `protected_transcript`, which are also not writable by hand. They
   used to be review gates, which meant a written note stood in for the existence of a file.
5. **Review.** The remaining eight need a named person and a written basis of at least ten
   characters. A pass with no stated basis is a checkbox.
6. **Place.** Refused unless all thirteen conditions currently pass — checked in the endpoint
   so the console can say what is missing, and again inside `place_video_asset` so the row
   cannot be written even if the endpoint is wrong.
7. **Withdraw.** Needs a stated reason. The video stops being delivered on the next lesson load.

Readiness is derived, never stored. Recording a later failure on any condition withdraws
readiness by itself, with no second record to keep in step.

### The thirteen conditions

The ten in `video-production/PORTFOLIO.md`, plus the three delivery conditions in
`portfolio.json`'s release rule. `video_release_gate_definitions` is the list; the console
reads it rather than carrying its own copy.

### Delivery

`console_video_delivery` lists only assets that are placed, release-ready, uploaded and
carrying both verified text equivalents. Two things read it.

`student-blocks.mjs` overlays its rows onto the matching course, delivery unit and
instruction screen while building the lesson payload, so a placed asset appears in the
lesson with no block map edited. The overlay is applied on every read and nothing is
cached, which is what makes withdrawal work: a withdrawn asset, or one whose gate later
fails, drops out of the view and is simply not found on the next load. A console entry
replaces the block map's video for that screen rather than appearing beside it. If the
lookup fails the block map is served unchanged — a student mid-lesson must not lose the
payload because the console's view is briefly unavailable.

The Stream authorization core reads it too, and falls back to `config/stream-media.mjs`, so:

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

The token needs Stream **Edit** partly for this: the caption track is uploaded through the
API and read back through it.

#### Reconciliation

`reconcile_uploads` compares the Cloudflare library against the asset rows. A video whose
metadata carries a reservation id matching a row that lost its upload id is repaired; one
matching nothing is reported and never deleted, because the console is the newer of the two
systems and not recognising a video is a poor reason to destroy it. Rows reserved here with
no Cloudflare upload behind them are listed too.

#### The Stream token

Create Token → **Start from scratch**. None of the permission-policy templates fits: the
closest, "Stream and Images", bundles five permissions where one is wanted, and Images is
not something this token should be able to touch.

| Field | Value |
| --- | --- |
| Scope | Entire Account — Stream is an account-level permission |
| Permission group | `Media` · `Stream` · Read **and** Edit |
| Policies | exactly one — the review screen lists each separately, and two identical ones are a duplicate, not a stronger grant |
| Token expiration | see below |
| Client IP address filtering | **leave empty** |

Stream needs both boxes because the chain reads as well as writes: it creates a direct upload,
then asks Cloudflare for the video's status and caption tracks.

Client IP filtering looks like free security and is a trap: the calls come from Netlify's
function egress, whose addresses are neither published nor stable, so a pinned range breaks
uploads at a time unrelated to any change you made.

An expiry bounds the damage of a leak, and the cost of one lapsing is contained: an expired
token stops new uploads and does not touch playback, which runs on the signing key. Whichever
is chosen, the renewal date belongs in a calendar — the previous Stream token reached
"expires soon" without anyone noticing.

#### Why the token also carries Images

The owner scoped it to `Images` as well as `Stream`, anticipating that the console will
eventually upload pictures and not only video. Recorded here because the token is
deliberately wider than the code, and a later reader should not have to guess whether that
was an accident:

- No code in this repository calls Cloudflare Images. Course posters today are static
  `.webp` files under `public/statecourse/media/`, referenced by path.
- Cloudflare Stream generates its own thumbnails, so the `poster_image` release condition
  does not depend on Images.
- If image upload is built, Cloudflare Images is not the only candidate — Supabase Storage is
  already in the stack and already paid for — and choosing Cloudflare would also mean adding
  `imagedelivery.net` to `img-src` in the CSP, which is currently `'self' data:`.

So the permission is inert until someone writes code for it. What it means meanwhile: if the
token leaks, it can read, overwrite and delete anything in Cloudflare Images on this account,
which is empty today.

Create it from the account's own **Account API tokens** page rather than from My Profile. An
account-owned token belongs to StateCourse and survives a person leaving; a user token
belongs to whoever made it.

`Stream` is the product; `Edit` is read plus write. Read alone cannot create a direct upload,
which is step one of the chain, so `Edit` is the narrowest level that works — Cloudflare
offers no third option. Be clear about what that means: `Edit` also permits deleting videos
and managing signing keys. This code never calls either, but the token could. Scope it to the
one account, give it nothing else, and rotate it if it is ever pasted anywhere but the Netlify
environment.

The token is shown once. It belongs in the Netlify production environment — **scoped to
Functions**, like the other Cloudflare secrets, because no build step reads it — and in no
file in this repository.

Netlify applies an environment change on the next deploy, not to functions already running,
so trigger a deploy after adding it. If it is missing or malformed the console now says which
key is at fault rather than reporting a generic outage.

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
