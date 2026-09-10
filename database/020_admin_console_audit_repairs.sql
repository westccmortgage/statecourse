-- Repairs found by an independent audit of 019.
--
-- 019 is already applied in production, so this is a second migration rather than an edit
-- to the first. Nothing here drops a table or rewrites a recorded row: the two views are
-- replaced, the asset table gains columns, and one new table is added.

begin;

-- ---------------------------------------------------------------------------
-- One role, several states
--
-- 019 resolved current bindings with `distinct on (auth_user_id, actor_role)`, so a person
-- given Texas and then Michigan as regulator_reviewer silently kept only Michigan: the
-- second grant read as a replacement rather than as an addition. Nobody is told, and the
-- reviewer simply cannot see Texas any more.
--
-- The scope belongs in the key. A revocation still works per scope, because a revoking row
-- carries the same scope_state and therefore lands on the same key; revoking an unscoped
-- binding is a row with a null scope_state, which is its own key and does not silently
-- revoke the state-scoped ones.
create or replace view current_staff_actor_bindings with (security_invoker=true) as
select distinct on (auth_user_id, actor_role, scope_state)
  id, auth_user_id, actor_role, scope_state, binding_status,
  effective_at, expires_at, evidence, recorded_by, recorded_at
from staff_actor_binding_events
order by auth_user_id, actor_role, scope_state, recorded_at desc, id desc;

drop index if exists staff_actor_binding_current_idx;
create index if not exists staff_actor_binding_current_idx
  on staff_actor_binding_events(auth_user_id, actor_role, scope_state, recorded_at desc);

-- ---------------------------------------------------------------------------
-- Captions and a transcript that actually exist
--
-- 019 stored two path strings and let a reviewer's written note stand as proof that the
-- files behind them existed. A note is a claim about a file, not the file, and the paths
-- pointed into the repository — somewhere an operator working from the console cannot put
-- anything. So a console-managed video could reach release-ready with no caption track and
-- no transcript at all.
--
-- The text now lives here, where it can be read back and hashed. `console_video_delivery`
-- requires both, so an asset missing either is not delivered whatever its gate rows say.
alter table video_assets
  add column if not exists transcript_text text,
  add column if not exists transcript_sha256 text
    check (transcript_sha256 is null or transcript_sha256 ~ '^[0-9a-f]{64}$'),
  add column if not exists captions_vtt text,
  add column if not exists captions_sha256 text
    check (captions_sha256 is null or captions_sha256 ~ '^[0-9a-f]{64}$'),
  add column if not exists captions_language text not null default 'en',
  -- Set when the console verified the track by reading it back from Cloudflare, not when
  -- it was sent.
  add column if not exists captions_verified_at timestamptz,
  add column if not exists transcript_verified_at timestamptz,
  -- Survives the window between reserving a Cloudflare upload and learning its UID.
  add column if not exists reservation_id uuid;

alter table video_assets
  drop constraint if exists video_assets_text_assets_paired;
alter table video_assets
  add constraint video_assets_text_assets_paired check (
    (transcript_text is null) = (transcript_sha256 is null)
    and (captions_vtt is null) = (captions_sha256 is null)
  );

create unique index if not exists video_assets_reservation_idx
  on video_assets(reservation_id) where reservation_id is not null;

-- ---------------------------------------------------------------------------
-- What a student may actually be served
--
-- Rebuilt so the text equivalents are a condition of delivery and not only of review. A
-- video whose transcript was removed stops being delivered on the next read.
create or replace view console_video_delivery with (security_invoker=true) as
select
  a.asset_key, a.course_id, a.delivery_id, a.screen_id, a.label,
  a.duration_seconds, a.transcript_path, a.captions_path, a.stream_uid,
  p.recorded_at as placed_at,
  /* Appended rather than slotted in beside the other caption fields: `create or replace
     view` can add a column at the end and nothing else, and renaming an existing one is
     what it thinks you are doing otherwise. Callers select by name. */
  a.captions_language
from video_assets a
join current_video_placements p on p.asset_key=a.asset_key
join video_release_readiness r on r.asset_key=a.asset_key
where p.placement_status='placed'
  and r.release_ready
  and a.stream_uid is not null
  and a.transcript_text is not null
  and a.captions_vtt is not null
  and a.captions_verified_at is not null
  and a.transcript_verified_at is not null;

-- ---------------------------------------------------------------------------
-- Replacing a video that a block map already puts on the screen
--
-- The screen registry in config/ and this console can both name a video for the same
-- screen. 019 noticed the collision and reported it as information, then created the asset
-- anyway, so the console's copy would quietly win at delivery. A replacement is a decision
-- about what a student sees and now leaves a record naming what was displaced.
create table if not exists video_screen_replacements (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null references video_assets(asset_key),
  course_id text not null references courses(id),
  delivery_id text not null,
  screen_id text not null,
  replaced_asset_key text not null,
  replaced_source text not null check (replaced_source in ('code_registry','admin_console')),
  reason text not null check (length(btrim(reason)) >= 10),
  recorded_by uuid not null,
  recorded_at timestamptz not null default now()
);

create index if not exists video_screen_replacements_screen_idx
  on video_screen_replacements(course_id, delivery_id, screen_id, recorded_at desc);

-- ---------------------------------------------------------------------------
-- Privileges and append-only enforcement for the new table
alter table video_screen_replacements enable row level security;
revoke all on video_screen_replacements from public, anon, authenticated;
grant select, insert on video_screen_replacements to service_role;

drop trigger if exists append_only_video_screen_replacements on video_screen_replacements;
create trigger append_only_video_screen_replacements
before update or delete on video_screen_replacements
for each row execute function admin_console_refuse_record_mutation();

commit;
