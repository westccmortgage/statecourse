-- Platform administration console: named staff identity, and a server-enforced
-- upload -> review -> placement chain for private course video.
--
-- Two things this migration deliberately does NOT do.
--
-- It does not grant approval, enable enrollment, or award credit. Nothing here writes
-- courses.approval_status, courses.enrollment_enabled, or regulatory_course_versions.
-- The console reads those and reports disagreement between the sources; changing them
-- stays a regulator-driven act performed elsewhere.
--
-- It seeds no video asset, no release-gate decision and no placement. The assets already
-- delivering in production were reviewed by people against records in the repository;
-- inserting rows here that assert those reviews happened would be manufacturing evidence
-- of a human decision. The console reconciles against the code registry instead and
-- reports each asset's origin.

begin;

-- ---------------------------------------------------------------------------
-- Named staff identity
--
-- A bearer token shared by several people is not an identity: it says a request came
-- from someone who has the string, and the record of who acted is then whatever the
-- request body claims. STATECOURSE_ADMIN_API_TOKEN remains for the endpoints that use
-- it today, but every console action authenticates one Supabase user and resolves that
-- user's roles here, so "who did this" is answered by the session and not by the caller.
--
-- Keyed on (auth_user_id, actor_role) rather than auth_user_id alone: an owner is
-- routinely also the administrator and the video producer, and forcing one role per
-- person would mean revoking a role to use another.
create table if not exists staff_actor_binding_events (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null,
  actor_role text not null check(actor_role in (
    'owner','administrator','video_producer','instructor','regulator_reviewer','support'
  )),
  -- Null means every jurisdiction. A two-letter code restricts the binding to one state,
  -- so a contracted reviewer can be given exactly the state they were engaged for.
  scope_state text check (scope_state ~ '^[A-Z]{2}$'),
  binding_status text not null check(binding_status in ('active','revoked')),
  effective_at timestamptz,
  expires_at timestamptz,
  evidence jsonb not null check(evidence <> '{}'::jsonb),
  recorded_by uuid not null,
  recorded_at timestamptz not null default now(),
  check(expires_at is null or effective_at is null or expires_at > effective_at)
);

create index if not exists staff_actor_binding_current_idx
  on staff_actor_binding_events(auth_user_id, actor_role, recorded_at desc);

create or replace view current_staff_actor_bindings with (security_invoker=true) as
select distinct on (auth_user_id, actor_role)
  id, auth_user_id, actor_role, scope_state, binding_status,
  effective_at, expires_at, evidence, recorded_by, recorded_at
from staff_actor_binding_events
order by auth_user_id, actor_role, recorded_at desc, id desc;

-- ---------------------------------------------------------------------------
-- Video asset registry
--
-- Today adding one video means editing config/stream-media.mjs, editing the state's
-- screen-media registry, regenerating block maps, adding the Stream UID to the
-- CLOUDFLARE_STREAM_VIDEO_MAP environment variable and deploying. That is a developer
-- task, not an operator task, and it is the reason the owner cannot publish a video.
-- These rows carry the same facts so the chain can be driven from the console.
--
-- stream_uid is nullable on purpose: an asset exists from the moment an upload is
-- reserved, and the UID arrives when Cloudflare accepts the file.
create table if not exists video_assets (
  asset_key text primary key check (asset_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  course_id text not null references courses(id),
  delivery_id text not null check (delivery_id <> ''),
  screen_id text not null check (screen_id <> ''),
  label text not null check (label <> ''),
  duration_seconds numeric(10,3) not null check (duration_seconds > 0),
  -- Server-side paths to the protected text equivalents. Never served as static files.
  transcript_path text not null check (transcript_path <> ''),
  captions_path text not null check (captions_path <> ''),
  stream_uid text check (stream_uid ~ '^[a-f0-9]{32}$'),
  stream_upload_id text,
  source_sha256 text check (source_sha256 ~ '^[0-9a-f]{64}$'),
  source_bytes bigint check (source_bytes > 0),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One screen carries at most one console-managed asset, so a second upload aimed at an
  -- occupied screen is rejected at write time rather than discovered at playback.
  unique (course_id, delivery_id, screen_id)
);

-- ---------------------------------------------------------------------------
-- The release gate
--
-- video-production/PORTFOLIO.md states ten conditions no instructional video may skip,
-- and portfolio.json adds the three delivery conditions. Both documents are prose: a
-- person had to read them and remember. These rows are the same list in a form the
-- server can refuse to proceed without.
create table if not exists video_release_gate_definitions (
  gate text primary key,
  sequence integer not null unique check (sequence > 0),
  description text not null
);

insert into video_release_gate_definitions(gate,sequence,description) values
  ('final_master',1,'Final MP4 exists and its SHA-256 digest is recorded against this asset.'),
  ('poster_image',2,'Poster image is present.'),
  ('shipping_captions',3,'Shipping WebVTT captions are timed from the final render, not from provisional timings.'),
  ('protected_transcript',4,'A separate plain-text transcript exists behind StateCourse authorization.'),
  ('lesson_text_equivalent',5,'The lesson carries a complete text equivalent, so the video adds nothing a reader would miss.'),
  ('factual_review',6,'Factual and source review passed.'),
  ('visual_fidelity_review',7,'Visual and document-fidelity review passed.'),
  ('logo_safe_review',8,'Logo-safe responsive placement review passed.'),
  ('accessibility_review',9,'Accessibility and keyboard review passed.'),
  ('placement_rules',10,'Placement is an instruction screen carrying no assessment content, with optional non-blocking playback and no autoplay.'),
  ('stream_upload',11,'The private Cloudflare Stream upload reports READY.'),
  ('signed_playback',12,'requireSignedURLs is enforced, so the raw UID cannot play the video.'),
  ('origin_restriction',13,'Playback is restricted to StateCourse production origins.')
on conflict (gate) do update set
  sequence=excluded.sequence, description=excluded.description;

create table if not exists video_release_gate_events (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null references video_assets(asset_key),
  gate text not null references video_release_gate_definitions(gate),
  outcome text not null check (outcome in ('pass','fail')),
  evidence jsonb not null check (evidence <> '{}'::jsonb),
  reviewed_by uuid not null,
  reviewed_at timestamptz not null default now()
);

create index if not exists video_release_gate_current_idx
  on video_release_gate_events(asset_key, gate, reviewed_at desc);

create or replace view current_video_release_gates with (security_invoker=true) as
select distinct on (asset_key, gate)
  id, asset_key, gate, outcome, evidence, reviewed_by, reviewed_at
from video_release_gate_events
order by asset_key, gate, reviewed_at desc, id desc;

-- Readiness is derived, never stored: a later 'fail' on any gate withdraws readiness by
-- itself, with no second record to keep in step.
create or replace view video_release_readiness with (security_invoker=true) as
select
  a.asset_key,
  (select count(*) from video_release_gate_definitions) as required_gates,
  count(g.gate) filter (where g.outcome='pass') as passed_gates,
  coalesce(
    array_agg(d.gate order by d.sequence)
      filter (where g.gate is null or g.outcome <> 'pass'),
    array[]::text[]
  ) as outstanding_gates,
  count(g.gate) filter (where g.outcome='pass') = (select count(*) from video_release_gate_definitions)
    as release_ready
from video_assets a
cross join video_release_gate_definitions d
left join current_video_release_gates g on g.asset_key=a.asset_key and g.gate=d.gate
group by a.asset_key;

-- ---------------------------------------------------------------------------
-- Placement
--
-- The three column checks are the parts of the portfolio's tenth condition that can be
-- stated as data. A row asserting a required, blocking, or autoplaying video does not
-- fail review later; it cannot be written.
create table if not exists video_placement_events (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null references video_assets(asset_key),
  course_id text not null references courses(id),
  delivery_id text not null,
  screen_id text not null,
  placement_status text not null check (placement_status in ('placed','withdrawn')),
  required boolean not null default false check (required = false),
  non_blocking boolean not null default true check (non_blocking = true),
  autoplay boolean not null default false check (autoplay = false),
  -- What the gate ledger said at the moment of the decision, so a later review does not
  -- rewrite the basis on which this placement was made.
  gate_snapshot jsonb not null check (gate_snapshot <> '{}'::jsonb),
  recorded_by uuid not null,
  recorded_at timestamptz not null default now()
);

create index if not exists video_placement_current_idx
  on video_placement_events(asset_key, recorded_at desc);

create or replace view current_video_placements with (security_invoker=true) as
select distinct on (asset_key)
  id, asset_key, course_id, delivery_id, screen_id, placement_status,
  required, non_blocking, autoplay, gate_snapshot, recorded_by, recorded_at
from video_placement_events
order by asset_key, recorded_at desc, id desc;

-- What the student delivery path may serve. An asset missing from this view is not
-- delivered by the console route at all, whatever else its rows say.
create or replace view console_video_delivery with (security_invoker=true) as
select
  a.asset_key, a.course_id, a.delivery_id, a.screen_id, a.label,
  a.duration_seconds, a.transcript_path, a.captions_path, a.stream_uid,
  p.recorded_at as placed_at
from video_assets a
join current_video_placements p on p.asset_key=a.asset_key
join video_release_readiness r on r.asset_key=a.asset_key
where p.placement_status='placed'
  and r.release_ready
  and a.stream_uid is not null;

-- ---------------------------------------------------------------------------
-- Console audit
create table if not exists admin_console_actions (
  id bigint generated always as identity primary key,
  auth_user_id uuid not null,
  actor_role text not null,
  action text not null check (action <> ''),
  subject text,
  detail jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists admin_console_actions_recent
  on admin_console_actions(occurred_at desc);

-- ---------------------------------------------------------------------------
-- Append-only enforcement
create or replace function admin_console_refuse_record_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'admin_console_records_are_append_only';
end $$;

do $$
declare target text;
begin
  foreach target in array array[
    'staff_actor_binding_events',
    'video_release_gate_events',
    'video_placement_events',
    'admin_console_actions'
  ] loop
    execute format('drop trigger if exists %I on %I','append_only_'||target,target);
    execute format(
      'create trigger %I before update or delete on %I for each row execute function admin_console_refuse_record_mutation()',
      'append_only_'||target,target
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Placement is refused in the database, not only in the application
--
-- The Node layer checks readiness before calling this. That check is the one a future
-- refactor can drop by accident, so the same condition is enforced here where the row is
-- actually written.
create or replace function place_video_asset(
  p_asset_key text,
  p_recorded_by uuid
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  v_asset video_assets%rowtype;
  v_ready video_release_readiness%rowtype;
  v_snapshot jsonb;
  v_id uuid;
begin
  select * into v_asset from video_assets where asset_key=p_asset_key;
  if not found then raise exception 'video_asset_not_found'; end if;
  if v_asset.stream_uid is null then raise exception 'video_asset_upload_incomplete'; end if;

  select * into v_ready from video_release_readiness where asset_key=p_asset_key;
  if not found or not v_ready.release_ready then
    raise exception 'video_release_gate_incomplete: %',
      coalesce(array_to_string(v_ready.outstanding_gates,','),'all');
  end if;

  select jsonb_object_agg(gate, jsonb_build_object('outcome',outcome,'reviewed_at',reviewed_at))
    into v_snapshot
  from current_video_release_gates where asset_key=p_asset_key;

  insert into video_placement_events(
    asset_key,course_id,delivery_id,screen_id,placement_status,gate_snapshot,recorded_by
  ) values (
    p_asset_key,v_asset.course_id,v_asset.delivery_id,v_asset.screen_id,'placed',v_snapshot,p_recorded_by
  ) returning id into v_id;

  return jsonb_build_object('placement_event_id',v_id,'asset_key',p_asset_key,'gate_snapshot',v_snapshot);
end $$;

create or replace function withdraw_video_asset(
  p_asset_key text,
  p_recorded_by uuid,
  p_reason text
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  v_asset video_assets%rowtype;
  v_id uuid;
begin
  select * into v_asset from video_assets where asset_key=p_asset_key;
  if not found then raise exception 'video_asset_not_found'; end if;
  if coalesce(trim(p_reason),'')='' then raise exception 'video_withdrawal_reason_required'; end if;

  insert into video_placement_events(
    asset_key,course_id,delivery_id,screen_id,placement_status,gate_snapshot,recorded_by
  ) values (
    p_asset_key,v_asset.course_id,v_asset.delivery_id,v_asset.screen_id,'withdrawn',
    jsonb_build_object('withdrawn_reason',p_reason),p_recorded_by
  ) returning id into v_id;

  return jsonb_build_object('placement_event_id',v_id,'asset_key',p_asset_key);
end $$;

-- ---------------------------------------------------------------------------
-- Privileges
--
-- These records describe who may act and what students are shown. Browser roles get
-- nothing; the StateCourse server reaches them with its service credential after it has
-- authorized the request.
alter table staff_actor_binding_events enable row level security;
alter table video_assets enable row level security;
alter table video_release_gate_definitions enable row level security;
alter table video_release_gate_events enable row level security;
alter table video_placement_events enable row level security;
alter table admin_console_actions enable row level security;

revoke all on
  staff_actor_binding_events, video_assets, video_release_gate_definitions,
  video_release_gate_events, video_placement_events, admin_console_actions
from public, anon, authenticated;

revoke all on
  current_staff_actor_bindings, current_video_release_gates, video_release_readiness,
  current_video_placements, console_video_delivery
from public, anon, authenticated;

revoke execute on function admin_console_refuse_record_mutation() from public, anon, authenticated;
revoke execute on function place_video_asset(text,uuid) from public, anon, authenticated;
revoke execute on function withdraw_video_asset(text,uuid,text) from public, anon, authenticated;

grant select, insert on
  staff_actor_binding_events, video_release_gate_events, video_placement_events,
  admin_console_actions
to service_role;
grant select, insert, update on video_assets to service_role;
grant select on
  video_release_gate_definitions, current_staff_actor_bindings,
  current_video_release_gates, video_release_readiness,
  current_video_placements, console_video_delivery
to service_role;
grant execute on function place_video_asset(text,uuid) to service_role;
grant execute on function withdraw_video_asset(text,uuid,text) to service_role;

commit;
