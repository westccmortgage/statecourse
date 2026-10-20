-- 076 · A confirmation is never overwritten.
--
-- Acts as real people through test.uid, never as the service role, so every
-- check below is a check on row-level security and on the functions people
-- actually call. Synthetic fixtures only; everything is rolled back.

\set ON_ERROR_STOP on
\set QUIET on
begin;

-- What Supabase grants by default. Granted AFTER the migration here, so the
-- refusals below are row-level security's doing, not a missing grant.
grant usage on schema public to authenticated, anon;
grant usage on schema auth to authenticated, anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to authenticated;

insert into auth.users(id, email) values
  ('76000000-0000-0000-0000-000000000001','owner@example.com'),
  ('76000000-0000-0000-0000-000000000002','reviewer@example.com'),
  ('76000000-0000-0000-0000-000000000003','contributor@example.com'),
  ('76000000-0000-0000-0000-000000000004','outsider@example.com');

insert into public.organizations(id, name) values
  ('76a00000-0000-0000-0000-000000000001','Builder A'),
  ('76b00000-0000-0000-0000-000000000001','Builder B');

insert into public.organization_members(organization_id, user_id, role) values
  ('76a00000-0000-0000-0000-000000000001','76000000-0000-0000-0000-000000000001','owner'),
  ('76a00000-0000-0000-0000-000000000001','76000000-0000-0000-0000-000000000002','reviewer'),
  ('76a00000-0000-0000-0000-000000000001','76000000-0000-0000-0000-000000000003','contributor'),
  ('76b00000-0000-0000-0000-000000000001','76000000-0000-0000-0000-000000000004','owner');

insert into public.properties(id, organization_id, name, created_by) values
  ('76c00000-0000-0000-0000-000000000001','76a00000-0000-0000-0000-000000000001','Hutton','76000000-0000-0000-0000-000000000001'),
  ('76c00000-0000-0000-0000-000000000002','76b00000-0000-0000-0000-000000000001','Elsewhere','76000000-0000-0000-0000-000000000004');

insert into public.spaces(id, organization_id, property_id, name, created_by) values
  ('76d00000-0000-0000-0000-000000000001','76a00000-0000-0000-0000-000000000001','76c00000-0000-0000-0000-000000000001','Living Room','76000000-0000-0000-0000-000000000001'),
  ('76d00000-0000-0000-0000-000000000002','76b00000-0000-0000-0000-000000000001','76c00000-0000-0000-0000-000000000002','Their Room','76000000-0000-0000-0000-000000000004');

insert into public.evidence_items(id, organization_id, property_id, space_id, storage_path,
  original_filename, media_type, mime_type, byte_size, created_by, source_type)
values
  ('76e00000-0000-0000-0000-000000000001','76a00000-0000-0000-0000-000000000001','76c00000-0000-0000-0000-000000000001','76d00000-0000-0000-0000-000000000001',
   'organizations/a/properties/h/evidence/room-vr-master.mp4','room-vr-master.mp4','360 capture','video/mp4',4096,'76000000-0000-0000-0000-000000000001','phone'),
  ('76e00000-0000-0000-0000-000000000002','76b00000-0000-0000-0000-000000000001','76c00000-0000-0000-0000-000000000002','76d00000-0000-0000-0000-000000000002',
   'organizations/b/properties/e/evidence/theirs.jpg','theirs.jpg','Property evidence','image/jpeg',2048,'76000000-0000-0000-0000-000000000004','phone');

insert into public.analysis_jobs(id, organization_id, property_id, space_id, state, profile, profile_version,
  evidence_ids, requested_by)
values ('76f00000-0000-0000-0000-000000000001','76a00000-0000-0000-0000-000000000001',
  '76c00000-0000-0000-0000-000000000001','76d00000-0000-0000-0000-000000000001','completed',
  'room_interpretation','1', array['76e00000-0000-0000-0000-000000000001']::uuid[],'76000000-0000-0000-0000-000000000001');

insert into public.ai_suggestions(id, organization_id, job_id, property_id, space_id, suggestion_type,
  body, evidence_ids, layer)
values ('76900000-0000-0000-0000-000000000001','76a00000-0000-0000-0000-000000000001',
  '76f00000-0000-0000-0000-000000000001','76c00000-0000-0000-0000-000000000001','76d00000-0000-0000-0000-000000000001',
  'room_interpretation','{"visible_observations":[{"text":"A duplex outlet on the north wall"}]}'::jsonb,
  array['76e00000-0000-0000-0000-000000000001']::uuid[],'interpretation');

\set QUIET off
-- Results are not the point; the notices are. Query output goes nowhere.
\o /dev/null
create or replace function pg_temp.check(label text, condition boolean) returns void
language plpgsql as $$
begin
  if condition then raise notice 'PASS  %', label;
  else raise exception 'FAIL  %', label; end if;
end $$;

create or replace function pg_temp.refused(label text, statement text) returns void
language plpgsql as $$
begin
  begin
    execute statement;
  exception when others then
    raise notice 'PASS  % (refused: %)', label, left(sqlerrm, 70);
    return;
  end;
  raise exception 'FAIL  % — the statement was allowed', label;
end $$;

-- ================================================ a verdict on a marker
set local role authenticated;
set local test.uid = '76000000-0000-0000-0000-000000000002';

select pg_temp.check('a reviewer confirms the outlet the AI marked',
  (public.record_marker_review(
    '76c00000-0000-0000-0000-000000000001',
    'ai:76e00000-0000-0000-0000-000000000001:a duplex outlet on the north wall',
    'ai', 'confirmed', 0.31, 0.58,
    '76d00000-0000-0000-0000-000000000001', '76e00000-0000-0000-0000-000000000001',
    '76900000-0000-0000-0000-000000000001', 12.5,
    'A duplex outlet', 'A duplex outlet on the north wall', 'fixture', null)->>'id') is not null);

select pg_temp.check('the verdict names the person who gave it, not whoever asked',
  (select reviewed_by from public.marker_reviews) = '76000000-0000-0000-0000-000000000002'
  and (select reviewed_by_label from public.marker_reviews) = 'reviewer@example.com'
  and (select count(*) from public.marker_reviews) = 1);

set local test.uid = '76000000-0000-0000-0000-000000000001';
select public.record_marker_review(
  '76c00000-0000-0000-0000-000000000001',
  'ai:76e00000-0000-0000-0000-000000000001:a duplex outlet on the north wall',
  'ai', 'rejected', 0.31, 0.58, '76d00000-0000-0000-0000-000000000001',
  '76e00000-0000-0000-0000-000000000001');
select pg_temp.check('the owner changes their mind, and that is a second row',
  (select count(*) from public.marker_reviews) = 2);
select pg_temp.check('and the first verdict is still there, unchanged, with its author',
  (select verdict from public.marker_reviews where reviewed_by = '76000000-0000-0000-0000-000000000002') = 'confirmed');

-- ================================================ who may say what
set local test.uid = '76000000-0000-0000-0000-000000000003';
select pg_temp.refused('a contributor cannot confirm what the AI saw',
  $$select public.record_marker_review('76c00000-0000-0000-0000-000000000001', 'ai:x:y', 'ai', 'confirmed', 0.5, 0.5)$$);
select pg_temp.check('but can put a pin on something they saw',
  (public.record_marker_review('76c00000-0000-0000-0000-000000000001', 'person:mk-1', 'person', 'placed',
    0.7, 0.4, '76d00000-0000-0000-0000-000000000001', '76e00000-0000-0000-0000-000000000001',
    null, 3, 'Light fixture', 'Pendant over the island')->>'id') is not null);
select pg_temp.refused('a pin placed by hand says what it marks',
  $$select public.record_marker_review('76c00000-0000-0000-0000-000000000001', 'person:mk-2', 'person', 'placed', 0.7, 0.4)$$);
select pg_temp.refused('only a person places a pin',
  $$select public.record_marker_review('76c00000-0000-0000-0000-000000000001', 'ai:z', 'ai', 'placed', 0.7, 0.4, null, null, null, null, 'x')$$);

set local test.uid = '76000000-0000-0000-0000-000000000001';
select pg_temp.refused('a pin outside the frame is refused',
  $$select public.record_marker_review('76c00000-0000-0000-0000-000000000001', 'ai:x', 'ai', 'confirmed', 1.4, 0.5)$$);
select pg_temp.refused('a verdict the record does not know is refused',
  $$select public.record_marker_review('76c00000-0000-0000-0000-000000000001', 'ai:x', 'ai', 'approved', 0.4, 0.5)$$);
select pg_temp.refused('a capture from another project cannot be named',
  $$select public.record_marker_review('76c00000-0000-0000-0000-000000000001', 'ai:x', 'ai', 'confirmed', 0.4, 0.5,
      null, '76e00000-0000-0000-0000-000000000002')$$);
select pg_temp.refused('nor a room from another project',
  $$select public.record_marker_review('76c00000-0000-0000-0000-000000000001', 'ai:x', 'ai', 'confirmed', 0.4, 0.5,
      '76d00000-0000-0000-0000-000000000002')$$);
select pg_temp.refused('nobody writes a verdict straight into the table',
  $$insert into public.marker_reviews(organization_id, property_id, marker_key, origin, verdict, u, v, reviewed_by)
    values ('76a00000-0000-0000-0000-000000000001','76c00000-0000-0000-0000-000000000001','ai:x','ai','confirmed',0.5,0.5,
            '76000000-0000-0000-0000-000000000001')$$);

set local test.uid = '76000000-0000-0000-0000-000000000004';
select pg_temp.refused('someone outside the project cannot give a verdict on it',
  $$select public.record_marker_review('76c00000-0000-0000-0000-000000000001', 'ai:x', 'ai', 'confirmed', 0.4, 0.5)$$);
select pg_temp.check('and cannot read the verdicts given in it',
  (select count(*) from public.marker_reviews) = 0);

reset role;
set local test.uid = '';
select pg_temp.refused('signed out, there is nobody to give a verdict',
  $$select public.record_marker_review('76c00000-0000-0000-0000-000000000001', 'ai:x', 'ai', 'confirmed', 0.4, 0.5)$$);

-- ================================================ nothing is rewritten
-- As the table owner, with row-level security out of the way: the refusal
-- is the trigger's, and it holds for the service role too.
select pg_temp.refused('A VERDICT IS NEVER EDITED, EVEN BY THE OWNER OF THE TABLE',
  $$update public.marker_reviews set verdict = 'confirmed' where verdict = 'rejected'$$);
select pg_temp.refused('NOR DELETED',
  $$delete from public.marker_reviews$$);
select pg_temp.refused('NOR EMPTIED BY TRUNCATE',
  $$truncate public.marker_reviews$$);
select pg_temp.check('and every verdict given is still there',
  (select count(*) from public.marker_reviews) = 3);

-- ================================================ approvals keep their history
set local role authenticated;
set local test.uid = '76000000-0000-0000-0000-000000000002';
insert into public.suggestion_reviews(organization_id, suggestion_id, state, reviewer_note, reviewed_by)
values ('76a00000-0000-0000-0000-000000000001','76900000-0000-0000-0000-000000000001','confirmed',
  'Outlet and pendant both visible','76000000-0000-0000-0000-000000000002');
update public.spaces set review_state = 'confirmed' where id = '76d00000-0000-0000-0000-000000000001';

select pg_temp.check('confirming a reading writes it into the history, with who and why',
  (select count(*) from public.approval_history
    where subject = 'reading' and state = 'confirmed'
      and actor_id = '76000000-0000-0000-0000-000000000002'
      and note = 'Outlet and pendant both visible'
      and space_id = '76d00000-0000-0000-0000-000000000001') = 1);
select pg_temp.check('confirming the room does too, naming the person signed in',
  (select count(*) from public.approval_history
    where subject = 'room' and state = 'confirmed' and previous_state = 'needs_review'
      and actor_id = '76000000-0000-0000-0000-000000000002'
      and actor_label = 'reviewer@example.com') = 1);

set local test.uid = '76000000-0000-0000-0000-000000000001';
update public.suggestion_reviews set state = 'needs_review', reviewed_by = '76000000-0000-0000-0000-000000000001',
  reviewed_at = now() + interval '1 second'
where suggestion_id = '76900000-0000-0000-0000-000000000001';
update public.spaces set review_state = 'needs_review' where id = '76d00000-0000-0000-0000-000000000001';

select pg_temp.check('reopening adds a line instead of erasing the confirmation',
  (select count(*) from public.approval_history where subject = 'reading') = 2
  and (select count(*) from public.approval_history where subject = 'reading' and state = 'confirmed') = 1);
select pg_temp.check('and the reopening says what it reopened',
  (select previous_state from public.approval_history where subject = 'reading' and state = 'needs_review') = 'confirmed');
select pg_temp.check('the room keeps both lines as well',
  (select count(*) from public.approval_history where subject = 'room') = 2);

update public.suggestion_reviews set state = state where suggestion_id = '76900000-0000-0000-0000-000000000001';
select pg_temp.check('a press that changes nothing writes nothing',
  (select count(*) from public.approval_history where subject = 'reading') = 2);

select pg_temp.refused('a person''s email is not for anybody to look up',
  $$select public.person_label('76000000-0000-0000-0000-000000000004')$$);
select pg_temp.refused('nobody writes the history by hand',
  $$insert into public.approval_history(organization_id, property_id, subject, subject_id, state)
    values ('76a00000-0000-0000-0000-000000000001','76c00000-0000-0000-0000-000000000001','room',
            '76d00000-0000-0000-0000-000000000001','confirmed')$$);

set local test.uid = '76000000-0000-0000-0000-000000000004';
select pg_temp.check('someone outside the project reads none of its history',
  (select count(*) from public.approval_history) = 0);

reset role;
select pg_temp.refused('THE HISTORY IS NEVER EDITED',
  $$update public.approval_history set state = 'confirmed'$$);
select pg_temp.refused('NOR DELETED',
  $$delete from public.approval_history$$);
select pg_temp.refused('NOR EMPTIED BY TRUNCATE',
  $$truncate public.approval_history$$);

-- ================================================ money keeps its dates
set local role authenticated;
set local test.uid = '76000000-0000-0000-0000-000000000001';
do $$
declare cost_id uuid;
begin
  cost_id := public.record_project_cost('76c00000-0000-0000-0000-000000000001', 'electrical', 12400);
  perform public.supersede_project_cost(cost_id);
  if (select superseded_at from public.project_costs where id = cost_id) is null then
    raise exception 'FAIL  a withdrawn cost does not say when it was withdrawn';
  end if;
  if (select state from public.project_costs where id = cost_id) <> 'superseded' then
    raise exception 'FAIL  a withdrawn cost is still active';
  end if;
  raise notice 'PASS  a withdrawn cost keeps the moment it stopped counting';
end $$;

rollback;
\o
\echo ALL OK — verdicts and approvals are permanent, and a withdrawn cost keeps its date
