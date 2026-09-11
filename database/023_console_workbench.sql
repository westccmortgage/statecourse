-- Administration workbench. Apply after 021 and 022. No approvals, enrollments,
-- payment objects or staff privileges are seeded by this migration.
begin;

create table console_course_drafts (
  course_id text primary key references courses(id),
  revision integer not null default 1 check(revision > 0),
  payload jsonb not null check(jsonb_typeof(payload) = 'object'),
  content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),
  updated_by uuid not null,
  updated_at timestamptz not null default now()
);
create table console_course_reviews (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references courses(id),
  content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),
  outcome text not null check(outcome in ('pass','fail')),
  note text not null check(length(trim(note)) >= 10),
  reviewed_by uuid not null,
  reviewed_at timestamptz not null default now()
);
create table console_course_releases (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references courses(id),
  payload jsonb not null,
  content_hash text not null,
  published_by uuid not null,
  note text not null check(length(trim(note)) >= 10),
  published_at timestamptz not null default now(),
  unique(course_id, id)
);
create table console_course_publications (
  course_id text primary key references courses(id),
  release_id uuid not null,
  foreign key(course_id,release_id) references console_course_releases(course_id,id)
);
alter table enrollments add column console_content_release_id uuid;
alter table enrollments add constraint enrollment_console_release_course
  foreign key(course_id, console_content_release_id) references console_course_releases(course_id,id);

create table console_tasks (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references courses(id),
  title text not null check(length(trim(title)) between 3 and 200),
  detail text not null default '',
  status text not null default 'open' check(status in ('open','in_progress','needs_verification','closed')),
  priority text not null default 'normal' check(priority in ('normal','high','blocking')),
  assigned_to uuid,
  due_date date,
  revision integer not null default 1,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table console_task_events (
  id bigint generated always as identity primary key,
  task_id uuid not null references console_tasks(id),
  before_value jsonb,
  after_value jsonb not null,
  note text not null,
  recorded_by uuid not null,
  recorded_at timestamptz not null default now()
);
create table console_health_runs (
  id uuid primary key default gen_random_uuid(),
  trigger_kind text not null check(trigger_kind in ('manual','weekly')),
  checked_at timestamptz not null default now(),
  outcome text not null,
  report jsonb not null,
  recorded_by uuid,
  check(trigger_kind <> 'manual' or recorded_by is not null)
);
create index on console_course_reviews(course_id, reviewed_at desc, id desc);
create index on console_course_releases(course_id, published_at desc);
create index on console_tasks(course_id, updated_at desc);
create index on console_health_runs(checked_at desc);

create function console_immutable() returns trigger language plpgsql as $$
begin raise exception 'console_history_is_append_only'; end $$;
create trigger immutable_console_reviews before update or delete on console_course_reviews for each row execute function console_immutable();
create trigger immutable_console_releases before update or delete on console_course_releases for each row execute function console_immutable();
create trigger immutable_console_task_events before update or delete on console_task_events for each row execute function console_immutable();
create trigger immutable_console_health_runs before update or delete on console_health_runs for each row execute function console_immutable();

create function console_save_draft(p_course text, p_expected integer, p_payload jsonb, p_hash text, p_actor uuid, p_role text)
returns jsonb language plpgsql set search_path = public as $$
declare d console_course_drafts;
begin
  perform pg_advisory_xact_lock(hashtextextended('console-course:' || p_course, 0));
  select * into d from console_course_drafts where course_id=p_course for update;
  if coalesce(d.revision,0) <> p_expected then raise exception 'draft_revision_conflict'; end if;
  insert into console_course_drafts(course_id,revision,payload,content_hash,updated_by)
    values(p_course,1,p_payload,p_hash,p_actor)
    on conflict(course_id) do update set revision=console_course_drafts.revision+1,
      payload=excluded.payload,content_hash=excluded.content_hash,updated_by=excluded.updated_by,updated_at=now()
    returning * into d;
  insert into admin_console_actions(auth_user_id,actor_role,action,subject,detail)
    values(p_actor,p_role,'course.draft.save',p_course,jsonb_build_object('revision',d.revision,'contentHash',p_hash));
  return to_jsonb(d);
end $$;

create function console_review_draft(p_course text,p_hash text,p_outcome text,p_note text,p_actor uuid)
returns jsonb language plpgsql set search_path=public as $$
declare d console_course_drafts; r console_course_reviews;
begin
  perform pg_advisory_xact_lock(hashtextextended('console-course:' || p_course, 0));
  select * into d from console_course_drafts where course_id=p_course for update;
  if d.course_id is null or d.content_hash <> p_hash then raise exception 'draft_revision_conflict'; end if;
  insert into console_course_reviews(course_id,content_hash,outcome,note,reviewed_by)
    values(p_course,p_hash,p_outcome,p_note,p_actor) returning * into r;
  return to_jsonb(r);
end $$;

create function console_publish_course(p_course text,p_hash text,p_actor uuid,p_note text,p_role text)
returns jsonb language plpgsql set search_path = public as $$
declare d console_course_drafts; r console_course_reviews; result console_course_releases;
begin
  perform pg_advisory_xact_lock(hashtextextended('console-course:' || p_course, 0));
  select * into d from console_course_drafts where course_id=p_course for update;
  if d.course_id is null or d.content_hash <> p_hash then raise exception 'draft_revision_conflict'; end if;
  select * into r from console_course_reviews where course_id=p_course and content_hash=p_hash
    order by reviewed_at desc,id desc limit 1;
  if r.outcome is distinct from 'pass' then raise exception 'current_review_required'; end if;
  select release.* into result from console_course_publications current
    join console_course_releases release on release.id=current.release_id
    where current.course_id=p_course and release.content_hash=p_hash;
  if result.id is not null then return to_jsonb(result); end if;
  insert into console_course_releases(course_id,payload,content_hash,published_by,note)
    values(p_course,d.payload,d.content_hash,p_actor,p_note) returning * into result;
  insert into console_course_publications(course_id,release_id) values(p_course,result.id)
    on conflict(course_id) do update set release_id=excluded.release_id;
  insert into admin_console_actions(auth_user_id,actor_role,action,subject,detail)
    values(p_actor,p_role,'course.publish',p_course,jsonb_build_object('releaseId',result.id,'contentHash',p_hash,'note',p_note));
  return to_jsonb(result);
end $$;

create function console_pin_content_release() returns trigger language plpgsql set search_path=public as $$
begin
  -- Existing enrollments keep their current material; publication does not rewrite progress.
  if new.console_content_release_id is null then
    select release_id into new.console_content_release_id from console_course_publications where course_id=new.course_id;
  end if;
  return new;
end $$;
create trigger enrollment_pin_console_release before insert on enrollments for each row execute function console_pin_content_release();

create function console_update_task(p_id uuid,p_expected integer,p_patch jsonb,p_actor uuid,p_note text)
returns jsonb language plpgsql set search_path=public as $$
declare oldrow console_tasks; newrow console_tasks;
begin
  if length(trim(p_note)) < 10 then raise exception 'task_change_reason_required'; end if;
  select * into oldrow from console_tasks where id=p_id for update;
  if oldrow.id is null or oldrow.revision <> p_expected then raise exception 'task_revision_conflict'; end if;
  if p_patch->>'status'='closed' and oldrow.status <> 'needs_verification' then raise exception 'verification_step_required'; end if;
  update console_tasks set status=coalesce(p_patch->>'status',status),
    assigned_to=case when p_patch ? 'assigned_to' then (p_patch->>'assigned_to')::uuid else assigned_to end,
    due_date=case when p_patch ? 'due_date' then (p_patch->>'due_date')::date else due_date end,
    updated_by=p_actor,updated_at=now(),revision=revision+1 where id=p_id returning * into newrow;
  insert into console_task_events(task_id,before_value,after_value,note,recorded_by)
    values(p_id,to_jsonb(oldrow),to_jsonb(newrow),p_note,p_actor);
  return to_jsonb(newrow);
end $$;

do $$ declare t text; begin
  foreach t in array array['console_course_drafts','console_course_reviews','console_course_releases','console_course_publications','console_tasks','console_task_events','console_health_runs'] loop
    execute format('alter table %I enable row level security',t);
    execute format('revoke all on %I from public,anon,authenticated',t);
    execute format('grant select,insert,update on %I to service_role',t);
  end loop;
end $$;
grant usage,select on sequence console_task_events_id_seq to service_role;
revoke all on function console_review_draft(text,text,text,text,uuid), console_save_draft(text,integer,jsonb,text,uuid,text), console_publish_course(text,text,uuid,text,text), console_update_task(uuid,integer,jsonb,uuid,text) from public,anon,authenticated;
grant execute on function console_review_draft(text,text,text,text,uuid), console_save_draft(text,integer,jsonb,text,uuid,text), console_publish_course(text,text,uuid,text,text), console_update_task(uuid,integer,jsonb,uuid,text) to service_role;
revoke all on function console_immutable(), console_pin_content_release() from public,anon,authenticated;
commit;
