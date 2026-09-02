-- Michigan memo-review SLA, support capacity, and no-charge wait-list controls.
--
-- This migration remains pre-activation. It seeds a draft provider policy with an
-- unavailable instructor, disabled wait-list, and no confirmed business calendar.
-- It neither inserts an agency identifier nor opens enrollment.

begin;

update courses set course_route='/student/michigan-course/'
where id='mi-salesperson-prelicensure-40-v1';

update student_portal_state set resume_path='/student/michigan-course/?enrollment_id='||enrollment_id::text
where course_id='mi-salesperson-prelicensure-40-v1';

-- A bearer shared by several people is not an instructor identity. These append-only
-- bindings connect one authenticated Supabase user to one operational role. This
-- migration intentionally seeds no binding: credential provisioning remains closed.
create table if not exists michigan_staff_actor_binding_events (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null,
  actor_role text not null
    check(actor_role in ('administrator','instructor','regulator_reviewer')),
  instructor_id uuid references regulatory_instructors(id),
  binding_status text not null check(binding_status in ('active','revoked')),
  effective_at timestamptz,
  expires_at timestamptz,
  evidence jsonb not null check(evidence<>'{}'::jsonb),
  recorded_by uuid not null,
  recorded_at timestamptz not null default now(),
  check(actor_role='instructor' or instructor_id is null),
  check(actor_role<>'instructor' or instructor_id is not null),
  check(expires_at is null or effective_at is null or expires_at>effective_at)
);

create index if not exists michigan_staff_binding_current_idx
  on michigan_staff_actor_binding_events(auth_user_id,recorded_at desc);

create or replace view michigan_current_staff_actor_bindings with (security_invoker=true) as
select distinct on(auth_user_id)
  id,auth_user_id,actor_role,instructor_id,binding_status,effective_at,expires_at,
  evidence,recorded_by,recorded_at
from michigan_staff_actor_binding_events
order by auth_user_id,recorded_at desc,id desc;

create table if not exists michigan_operational_policy_events (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  course_version text not null,
  policy_status text not null check(policy_status in ('draft','active','paused','retired')),
  active_student_cap integer not null check(active_student_cap between 1 and 500),
  review_sla_business_days integer not null check(review_sla_business_days between 1 and 30),
  instructor_available boolean not null default false,
  waitlist_enabled boolean not null default false,
  calendar_confirmed_through date,
  closed_dates jsonb not null default '[]'::jsonb check(jsonb_typeof(closed_dates)='array'),
  evidence jsonb not null default '{}'::jsonb,
  recorded_by uuid,
  recorded_at timestamptz not null default now(),
  foreign key(course_id,course_version)
    references regulatory_course_versions(course_id,version),
  check(policy_status<>'active' or (
    calendar_confirmed_through is not null
    and evidence<>'{}'::jsonb
    and recorded_by is not null
  ))
);

insert into michigan_operational_policy_events(
  course_id,course_version,policy_status,active_student_cap,
  review_sla_business_days,instructor_available,waitlist_enabled,evidence
)
select 'mi-salesperson-prelicensure-40-v1','1.0-submission-draft','draft',25,1,false,false,
  '{"basis":"StateCourse provider proposal pending PSS review","approval_claim":false}'::jsonb
where not exists(
  select 1 from michigan_operational_policy_events
  where course_id='mi-salesperson-prelicensure-40-v1'
    and course_version='1.0-submission-draft'
);

create index if not exists michigan_operational_policy_current_idx
  on michigan_operational_policy_events(course_id,course_version,recorded_at desc);

create or replace view michigan_current_operational_policy with (security_invoker=true) as
select distinct on(course_id,course_version)
  id,course_id,course_version,policy_status,active_student_cap,
  review_sla_business_days,instructor_available,waitlist_enabled,
  calendar_confirmed_through,closed_dates,evidence,recorded_by,recorded_at
from michigan_operational_policy_events
order by course_id,course_version,recorded_at desc,id desc;

create or replace function michigan_business_deadline(
  p_submitted_at timestamptz,
  p_business_days integer,
  p_calendar_confirmed_through date,
  p_closed_dates jsonb
) returns timestamptz language plpgsql stable security definer set search_path=public as $$
declare
  v_candidate timestamptz:=p_submitted_at;
  v_remaining integer:=p_business_days;
  v_local_date date;
begin
  if p_submitted_at is null or p_business_days not between 1 and 30
    or p_calendar_confirmed_through is null
    or jsonb_typeof(coalesce(p_closed_dates,'[]'::jsonb))<>'array' then
    return null;
  end if;
  while v_remaining>0 loop
    v_candidate:=v_candidate+interval '1 day';
    v_local_date:=(v_candidate at time zone 'America/Detroit')::date;
    if v_local_date>p_calendar_confirmed_through then return null; end if;
    if extract(isodow from v_candidate at time zone 'America/Detroit')<6
      and not (coalesce(p_closed_dates,'[]'::jsonb) ? v_local_date::text) then
      v_remaining:=v_remaining-1;
    end if;
  end loop;
  return v_candidate;
end $$;

create or replace view michigan_memo_review_queue with (security_invoker=true) as
select
  m.id submission_id,m.enrollment_id,m.student_id,m.course_id,m.course_version,
  m.module_id,m.submission_version,m.response_text,m.content_sha256,m.submitted_at,
  p.review_sla_business_days,
  michigan_business_deadline(m.submitted_at,p.review_sla_business_days,
    p.calendar_confirmed_through,p.closed_dates) review_due_at,
  case
    when p.id is null or p.policy_status<>'active' then 'policy_inactive'
    when michigan_business_deadline(m.submitted_at,p.review_sla_business_days,
      p.calendar_confirmed_through,p.closed_dates) is null then 'calendar_unconfirmed'
    when michigan_business_deadline(m.submitted_at,p.review_sla_business_days,
      p.calendar_confirmed_through,p.closed_dates)<=now() then 'overdue'
    else 'pending'
  end sla_state
from michigan_applied_memo_versions m
left join michigan_applied_memo_reviews r on r.submission_id=m.id
left join michigan_current_operational_policy p
  on p.course_id=m.course_id and p.course_version=m.course_version
where r.id is null
  and not exists(
    select 1 from michigan_applied_memo_versions newer
    where newer.enrollment_id=m.enrollment_id and newer.module_id=m.module_id
      and newer.submission_version>m.submission_version
  );

create table if not exists michigan_waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  course_id text not null,
  course_version text not null,
  waitlist_status text not null default 'waiting'
    check(waitlist_status in ('waiting','released','withdrawn','converted')),
  reason text not null,
  no_charge boolean not null default true check(no_charge),
  checkout_attempt_id uuid check(checkout_attempt_id is null),
  requested_at timestamptz not null default now(),
  released_at timestamptz,
  foreign key(course_id,course_version)
    references regulatory_course_versions(course_id,version)
);

create unique index if not exists michigan_waitlist_one_open_entry_idx
  on michigan_waitlist_entries(student_id,course_id,course_version)
  where waitlist_status='waiting';

create or replace function michigan_capacity_status(p_at timestamptz default now())
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare
  v_course courses%rowtype;
  v_version regulatory_course_versions%rowtype;
  v_policy michigan_operational_policy_events%rowtype;
  v_authority jsonb;
  v_active_students integer:=0;
  v_pending_reviews integer:=0;
  v_overdue_reviews integer:=0;
  v_reasons text[]:=array[]::text[];
  v_waitlist_allowed boolean:=false;
begin
  select * into v_course from courses where id='mi-salesperson-prelicensure-40-v1';
  select * into v_version from regulatory_course_versions
    where course_id='mi-salesperson-prelicensure-40-v1'
      and version='1.0-submission-draft';
  select * into v_policy from michigan_current_operational_policy
    where course_id='mi-salesperson-prelicensure-40-v1'
      and course_version='1.0-submission-draft';
  v_authority:=michigan_authority_summary(
    'mi-salesperson-prelicensure-40-v1','1.0-submission-draft',p_at);
  select count(*)::integer into v_active_students from enrollments
    where course_id='mi-salesperson-prelicensure-40-v1'
      and course_version='1.0-submission-draft'
      and status='active' and compliance_credit_eligible;
  select count(*)::integer,
    count(*) filter(where review_due_at is not null and review_due_at<=p_at)::integer
  into v_pending_reviews,v_overdue_reviews from michigan_memo_review_queue;

  if v_course.id is null or v_course.approval_status<>'approved' then
    v_reasons:=array_append(v_reasons,'course_not_approved');
  end if;
  if v_version.course_id is null or v_version.lifecycle_status<>'approved' then
    v_reasons:=array_append(v_reasons,'course_version_not_approved');
  end if;
  if not coalesce(v_course.enrollment_enabled,false)
    or not coalesce(v_version.enrollment_enabled,false)
    or not coalesce(v_version.regulatory_credit_enabled,false) then
    v_reasons:=array_append(v_reasons,'enrollment_disabled');
  end if;
  if not coalesce((v_authority->>'active')::boolean,false) then
    v_reasons:=array_append(v_reasons,'authority_inactive');
  end if;
  if v_policy.id is null or v_policy.policy_status<>'active' then
    v_reasons:=array_append(v_reasons,'capacity_policy_inactive');
  end if;
  if not coalesce(v_policy.instructor_available,false) then
    v_reasons:=array_append(v_reasons,'instructor_unavailable');
  end if;
  if v_policy.calendar_confirmed_through is null
    or v_policy.calendar_confirmed_through<((p_at at time zone 'America/Detroit')::date+7) then
    v_reasons:=array_append(v_reasons,'business_calendar_unconfirmed');
  end if;
  if v_policy.active_student_cap is null or v_active_students>=v_policy.active_student_cap then
    v_reasons:=array_append(v_reasons,'active_student_capacity_reached');
  end if;
  if v_overdue_reviews>0 then
    v_reasons:=array_append(v_reasons,'memo_review_sla_missed');
  end if;

  v_waitlist_allowed:=coalesce(v_policy.waitlist_enabled,false)
    and v_course.approval_status='approved'
    and v_version.lifecycle_status='approved'
    and coalesce(v_course.enrollment_enabled,false)
    and coalesce(v_version.enrollment_enabled,false)
    and coalesce(v_version.regulatory_credit_enabled,false)
    and coalesce((v_authority->>'active')::boolean,false)
    and v_policy.policy_status='active'
    and v_policy.calendar_confirmed_through>=((p_at at time zone 'America/Detroit')::date+7)
    and (
      not v_policy.instructor_available
      or v_active_students>=v_policy.active_student_cap
      or v_overdue_reviews>0
    );

  return jsonb_build_object(
    'evaluated_at',p_at,
    'enrollment_allowed',cardinality(v_reasons)=0,
    'checkout_allowed',cardinality(v_reasons)=0,
    'waitlist_allowed',v_waitlist_allowed,
    'waitlist_charge_allowed',false,
    'reasons',to_jsonb(v_reasons),
    'active_students',v_active_students,
    'active_student_cap',v_policy.active_student_cap,
    'remaining_capacity',greatest(coalesce(v_policy.active_student_cap,0)-v_active_students,0),
    'pending_memo_reviews',v_pending_reviews,
    'overdue_memo_reviews',v_overdue_reviews,
    'oldest_pending_submitted_at',(select min(submitted_at) from michigan_memo_review_queue),
    'policy_status',v_policy.policy_status,
    'instructor_available',coalesce(v_policy.instructor_available,false),
    'calendar_confirmed_through',v_policy.calendar_confirmed_through,
    'authority',v_authority
  );
end $$;

create or replace function michigan_checkout_capacity_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_gate jsonb;
begin
  if new.course_id<>'mi-salesperson-prelicensure-40-v1' then return new; end if;
  v_gate:=michigan_capacity_status(now());
  if not coalesce((v_gate->>'checkout_allowed')::boolean,false) then
    raise exception 'michigan_checkout_refused_before_charge: %',v_gate->'reasons';
  end if;
  return new;
end $$;

drop trigger if exists michigan_checkout_capacity_guard on checkout_attempts;
create trigger michigan_checkout_capacity_guard before insert on checkout_attempts
for each row execute function michigan_checkout_capacity_guard();

create or replace function initialize_michigan_enrollment()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_gate jsonb;
begin
  if new.course_id<>'mi-salesperson-prelicensure-40-v1' then return new; end if;
  new.state:='MI';
  new.course_version:='1.0-submission-draft';
  new.started_at:=coalesce(new.started_at,now());
  if new.status='qa_non_credit' then
    new.compliance_credit_eligible:=false;
    return new;
  end if;
  if new.status='active' then
    v_gate:=michigan_capacity_status(now());
    if not coalesce((v_gate->>'enrollment_allowed')::boolean,false) then
      raise exception 'michigan_enrollment_capacity_refused: %',v_gate->'reasons';
    end if;
    if not new.compliance_credit_eligible then
      raise exception 'michigan_active_enrollment_must_be_credit_eligible';
    end if;
  end if;
  return new;
end $$;

create or replace function join_michigan_waitlist(p_student_id uuid,p_reason text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_gate jsonb; v_id uuid;
begin
  if not exists(select 1 from students where id=p_student_id) then
    raise exception 'michigan_waitlist_student_not_found';
  end if;
  v_gate:=michigan_capacity_status(now());
  if not coalesce((v_gate->>'waitlist_allowed')::boolean,false) then
    raise exception 'michigan_waitlist_closed: %',v_gate->'reasons';
  end if;
  insert into michigan_waitlist_entries(
    student_id,course_id,course_version,reason,no_charge,checkout_attempt_id
  ) values(
    p_student_id,'mi-salesperson-prelicensure-40-v1','1.0-submission-draft',
    coalesce(nullif(btrim(p_reason),''),'capacity'),true,null
  ) on conflict(student_id,course_id,course_version) where waitlist_status='waiting'
    do update set reason=michigan_waitlist_entries.reason
  returning id into v_id;
  return jsonb_build_object('waitlist_entry_id',v_id,'status','waiting',
    'no_charge',true,'enrollment_created',false,'gate_snapshot',v_gate);
end $$;

create or replace function record_michigan_operational_policy(
  p_policy_status text,p_active_student_cap integer,p_review_sla_business_days integer,
  p_instructor_available boolean,p_waitlist_enabled boolean,
  p_calendar_confirmed_through date,p_closed_dates jsonb,p_evidence jsonb,p_recorded_by uuid
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
  if p_policy_status not in ('draft','active','paused','retired')
    or p_active_student_cap not between 1 and 500
    or p_review_sla_business_days not between 1 and 30
    or jsonb_typeof(coalesce(p_closed_dates,'[]'::jsonb))<>'array' then
    raise exception 'invalid_michigan_operational_policy';
  end if;
  if p_policy_status='active' and (
    p_calendar_confirmed_through is null
    or coalesce(p_evidence,'{}'::jsonb)='{}'::jsonb or p_recorded_by is null
  ) then raise exception 'michigan_active_policy_evidence_incomplete'; end if;
  insert into michigan_operational_policy_events(
    course_id,course_version,policy_status,active_student_cap,
    review_sla_business_days,instructor_available,waitlist_enabled,
    calendar_confirmed_through,closed_dates,evidence,recorded_by
  ) values(
    'mi-salesperson-prelicensure-40-v1','1.0-submission-draft',p_policy_status,
    p_active_student_cap,p_review_sla_business_days,p_instructor_available,
    p_waitlist_enabled,p_calendar_confirmed_through,coalesce(p_closed_dates,'[]'::jsonb),
    coalesce(p_evidence,'{}'::jsonb),p_recorded_by
  ) returning id into v_id;
  return jsonb_build_object('policy_event_id',v_id,'capacity',michigan_capacity_status(now()));
end $$;

drop trigger if exists append_only_michigan_operational_policy_events on michigan_operational_policy_events;
create trigger append_only_michigan_operational_policy_events
before update or delete on michigan_operational_policy_events
for each row execute function michigan_refuse_record_mutation();

drop trigger if exists append_only_michigan_staff_actor_binding_events on michigan_staff_actor_binding_events;
create trigger append_only_michigan_staff_actor_binding_events
before update or delete on michigan_staff_actor_binding_events
for each row execute function michigan_refuse_record_mutation();

alter table michigan_operational_policy_events enable row level security;
alter table michigan_waitlist_entries enable row level security;
alter table michigan_staff_actor_binding_events enable row level security;
revoke all on michigan_operational_policy_events,michigan_waitlist_entries,
  michigan_staff_actor_binding_events
from public,anon,authenticated;

revoke all on michigan_current_operational_policy,michigan_memo_review_queue,
  michigan_current_staff_actor_bindings
from public,anon,authenticated;

revoke execute on function michigan_business_deadline(timestamptz,integer,date,jsonb) from public,anon,authenticated;
revoke execute on function michigan_capacity_status(timestamptz) from public,anon,authenticated;
revoke execute on function michigan_checkout_capacity_guard() from public,anon,authenticated;
revoke execute on function initialize_michigan_enrollment() from public,anon,authenticated;
revoke execute on function join_michigan_waitlist(uuid,text) from public,anon,authenticated;
revoke execute on function record_michigan_operational_policy(text,integer,integer,boolean,boolean,date,jsonb,jsonb,uuid) from public,anon,authenticated;

grant execute on function michigan_capacity_status(timestamptz) to service_role;
grant execute on function michigan_business_deadline(timestamptz,integer,date,jsonb) to service_role;
grant execute on function join_michigan_waitlist(uuid,text) to service_role;
grant execute on function record_michigan_operational_policy(text,integer,integer,boolean,boolean,date,jsonb,jsonb,uuid) to service_role;
grant select on michigan_operational_policy_events,michigan_waitlist_entries,
  michigan_staff_actor_binding_events,michigan_memo_review_queue,
  michigan_current_operational_policy,michigan_current_staff_actor_bindings
to service_role;

commit;
