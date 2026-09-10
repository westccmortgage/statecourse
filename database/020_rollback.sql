-- Recovery plan for 020_admin_console_audit_repairs.sql.
--
-- Restores the state 019 left. Run only if 020 has to be backed out; it is written to be
-- safe to run twice. It removes objects 020 added and puts both replaced views back to
-- their 019 definitions. It deletes no recorded row: staff_actor_binding_events,
-- video_release_gate_events, video_placement_events and admin_console_actions are
-- append-only ledgers and are untouched here.
--
-- What is lost by running this: the stored caption and transcript text on any asset that
-- had them, and the replacement records. Export them first if any asset is live:
--   select asset_key, transcript_text, captions_vtt from video_assets
--     where transcript_text is not null;
--   select * from video_screen_replacements;

begin;

-- 019's view: current bindings keyed on the role alone.
create or replace view current_staff_actor_bindings with (security_invoker=true) as
select distinct on (auth_user_id, actor_role)
  id, auth_user_id, actor_role, scope_state, binding_status,
  effective_at, expires_at, evidence, recorded_by, recorded_at
from staff_actor_binding_events
order by auth_user_id, actor_role, recorded_at desc, id desc;

drop index if exists staff_actor_binding_current_idx;
create index if not exists staff_actor_binding_current_idx
  on staff_actor_binding_events(auth_user_id, actor_role, recorded_at desc);

-- 019's delivery view: no text-equivalent conditions. Dropped rather than replaced,
-- because `create or replace view` cannot remove a column either.
drop view if exists console_video_delivery;
create view console_video_delivery with (security_invoker=true) as
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

revoke all on console_video_delivery from public, anon, authenticated;
grant select on console_video_delivery to service_role;

drop trigger if exists append_only_video_screen_replacements on video_screen_replacements;
drop table if exists video_screen_replacements;

alter table video_assets drop constraint if exists video_assets_text_assets_paired;
drop index if exists video_assets_reservation_idx;
alter table video_assets
  drop column if exists transcript_text,
  drop column if exists transcript_sha256,
  drop column if exists captions_vtt,
  drop column if exists captions_sha256,
  drop column if exists captions_language,
  drop column if exists captions_verified_at,
  drop column if exists transcript_verified_at,
  drop column if exists reservation_id;

commit;
