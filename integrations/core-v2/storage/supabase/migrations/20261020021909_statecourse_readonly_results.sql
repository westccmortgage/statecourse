-- Apply ONLY to an independently approved Core database. Never StateCourse's source DB.
begin;
do $$begin
  if to_regclass('public.enrollments') is not null then
    raise exception 'statecourse_source_database_refused';
  end if;
  if not exists(select 1 from pg_roles where rolname='statecourse_core_store') then
    create role statecourse_core_store nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
  end if;
  if exists(select 1 from pg_roles where rolname='statecourse_core_store' and (rolsuper or rolcanlogin or rolcreatedb or rolcreaterole or rolbypassrls or rolinherit)) then
    raise exception 'unsafe_existing_storage_role_refused';
  end if;
end$$;
create schema core_readonly;
revoke all on schema core_readonly from public;
grant usage on schema core_readonly to statecourse_core_store;

create table core_readonly.runs (
  id uuid primary key,
  organization_id uuid not null,
  actor_id uuid not null,
  idempotency_key uuid not null,
  course_id text not null check(course_id='ca-real-estate-principles-45'),
  enrollment_id uuid not null,
  request_hash text not null check(request_hash ~ '^[a-f0-9]{64}$'),
  status text not null default 'reserved' check(status in ('reserved','captured','running','completed','interrupted')),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  unique(organization_id,actor_id,idempotency_key),
  unique(organization_id,id)
);
create table core_readonly.artifacts (
  organization_id uuid not null,
  run_id uuid not null,
  kind text not null check(kind in ('snapshot','result')),
  content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),
  canonical_text text not null check(octet_length(canonical_text)<=16777216),
  created_at timestamptz not null default clock_timestamp(),
  primary key(organization_id,run_id,kind),
  foreign key(organization_id,run_id) references core_readonly.runs(organization_id,id),
  check(jsonb_typeof(canonical_text::jsonb)='object'),
  check(content_hash=encode(sha256(convert_to(canonical_text,'UTF8')),'hex'))
);
create table core_readonly.events (
  id bigint generated always as identity primary key,
  organization_id uuid not null,
  run_id uuid not null,
  kind text not null check(kind in ('reserved','captured','running','completed','interrupted')),
  recorded_at timestamptz not null default clock_timestamp(),
  foreign key(organization_id,run_id) references core_readonly.runs(organization_id,id)
);
create function core_readonly.immutable() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'core_artifact_history_is_immutable'; end$$;
create trigger artifacts_immutable before update or delete on core_readonly.artifacts for each row execute function core_readonly.immutable();
create trigger events_immutable before update or delete on core_readonly.events for each row execute function core_readonly.immutable();
create function core_readonly.guard_run() returns trigger language plpgsql set search_path='' as $$
begin
 if TG_OP='DELETE' then raise exception 'core_run_is_immutable'; end if;
 if TG_OP='INSERT' then
  if new.status<>'reserved' then raise exception 'run_must_start_reserved'; end if;
  return new;
 end if;
 if (to_jsonb(new)-'status'-'updated_at') is distinct from (to_jsonb(old)-'status'-'updated_at') then raise exception 'core_run_identity_is_immutable'; end if;
 if not ((old.status='reserved' and new.status in ('captured','interrupted'))
   or (old.status='captured' and new.status in ('running','interrupted'))
   or (old.status='running' and new.status in ('completed','interrupted'))) then raise exception 'illegal_core_run_transition'; end if;
 if new.status in ('captured','running','completed') and not exists(select 1 from core_readonly.artifacts a where a.organization_id=new.organization_id and a.run_id=new.id and a.kind='snapshot') then raise exception 'snapshot_required'; end if;
 if new.status='completed' and not exists(select 1 from core_readonly.artifacts a where a.organization_id=new.organization_id and a.run_id=new.id and a.kind='result') then raise exception 'result_required'; end if;
 new.updated_at:=clock_timestamp();
 return new;
end$$;
create trigger guard_run before insert or update or delete on core_readonly.runs for each row execute function core_readonly.guard_run();
create function core_readonly.record_run_event() returns trigger language plpgsql set search_path='' as $$
begin
 insert into core_readonly.events(organization_id,run_id,kind) values(new.organization_id,new.id,new.status);
 return new;
end$$;
create trigger record_run_event after insert or update on core_readonly.runs for each row execute function core_readonly.record_run_event();

alter table core_readonly.runs enable row level security;
alter table core_readonly.runs force row level security;
alter table core_readonly.artifacts enable row level security;
alter table core_readonly.artifacts force row level security;
alter table core_readonly.events enable row level security;
alter table core_readonly.events force row level security;
create policy scoped_runs on core_readonly.runs to statecourse_core_store
 using (organization_id=nullif(current_setting('core_readonly.organization_id',true),'')::uuid
   and actor_id=nullif(current_setting('core_readonly.actor_id',true),'')::uuid)
 with check (organization_id=nullif(current_setting('core_readonly.organization_id',true),'')::uuid
   and actor_id=nullif(current_setting('core_readonly.actor_id',true),'')::uuid);
create policy scoped_artifacts on core_readonly.artifacts to statecourse_core_store
 using (exists(select 1 from core_readonly.runs r where r.organization_id=artifacts.organization_id and r.id=artifacts.run_id))
 with check (exists(select 1 from core_readonly.runs r where r.organization_id=artifacts.organization_id and r.id=artifacts.run_id));
create policy scoped_events on core_readonly.events to statecourse_core_store
 using (exists(select 1 from core_readonly.runs r where r.organization_id=events.organization_id and r.id=events.run_id))
 with check (exists(select 1 from core_readonly.runs r where r.organization_id=events.organization_id and r.id=events.run_id));
revoke all on all tables in schema core_readonly from public;
revoke all on all functions in schema core_readonly from public;
grant select,insert on core_readonly.runs,core_readonly.artifacts,core_readonly.events to statecourse_core_store;
grant update(status,updated_at) on core_readonly.runs to statecourse_core_store;
grant usage,select on all sequences in schema core_readonly to statecourse_core_store;
grant execute on all functions in schema core_readonly to statecourse_core_store;
-- Do not inherit project-wide default grants to API roles in this private schema.
do $$declare r text;begin
 for r in select rolname from pg_roles where rolname in ('anon','authenticated','service_role') loop
  execute format('revoke all on schema core_readonly from %I',r);
  execute format('revoke all on all tables in schema core_readonly from %I',r);
  execute format('revoke all on all sequences in schema core_readonly from %I',r);
  execute format('revoke all on all functions in schema core_readonly from %I',r);
 end loop;
end$$;
commit;
