-- 002 Regulatory course records, instructors, time events, and reporting
--
-- Adds the Wisconsin, Missouri, and Oklahoma course records, the versioned regulatory
-- course table, the instructor register and course/instructor assignments, the raw
-- instructional time event log, course completion events, and the regulator report
-- table. Every course lands with approval_status 'submission_draft' and enrollment
-- disabled; nothing here approves a course or opens enrollment.

begin;

insert into courses(id,state,name,product_type,approval_status,enrollment_enabled)
values
  ('wi-salesperson','WI','Wisconsin Salesperson Pre-License','real_estate_prelicense','submission_draft',false),
  ('mo-salesperson-preexam-48','MO','Missouri Salesperson Pre-Exam Course — 48 Hours','real_estate_prelicense','submission_draft',false),
  ('mo-real-estate-practice-24','MO','Missouri Real Estate Practice Course — 24 Hours','real_estate_prelicense','submission_draft',false),
  ('ok-basic-prelicense-90','OK','Oklahoma Basic Pre-License Course — 90 Hours','real_estate_prelicense','submission_draft',false)
on conflict (id) do update set
  state=excluded.state,
  name=excluded.name,
  product_type=excluded.product_type;

create table if not exists regulatory_course_versions (
  course_id text not null references courses(id),
  version text not null,
  lifecycle_status text not null check (lifecycle_status in ('development','submitted','regulator_correction','approved','suspended','expired')),
  required_hours numeric(6,2) not null check (required_hours > 0),
  submitted_at timestamptz,
  correction_requested_at timestamptz,
  approved_at timestamptz,
  effective_date date,
  expiration_date date,
  approval_number text,
  enrollment_enabled boolean not null default false,
  regulatory_credit_enabled boolean not null default false,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (course_id, version),
  check (lifecycle_status = 'approved' or (enrollment_enabled = false and regulatory_credit_enabled = false)),
  check (regulatory_credit_enabled = false or enrollment_enabled = true)
);

insert into regulatory_course_versions(course_id,version,lifecycle_status,required_hours,configuration)
values
  ('wi-salesperson','1.0','development',72,'{"state_rule_layer":"wisconsin","instructor_assignment_required":true}'::jsonb),
  ('mo-salesperson-preexam-48','1.0','development',48,'{"state_rule_layer":"missouri","commercial_bundle_eligible":true,"separate_approval_record":true}'::jsonb),
  ('mo-real-estate-practice-24','1.0','development',24,'{"state_rule_layer":"missouri","commercial_bundle_eligible":true,"separate_approval_record":true}'::jsonb),
  ('ok-basic-prelicense-90','1.0','development',90,'{"state_rule_layer":"oklahoma","instructor_assignment_required":true}'::jsonb)
on conflict (course_id,version) do nothing;

create table if not exists regulatory_instructors (
  id uuid primary key default gen_random_uuid(),
  state text not null check (state ~ '^[A-Z]{2}$'),
  display_name text not null,
  approval_status text not null check (approval_status in ('candidate','submitted','approved','expired','rejected')),
  regulator_approval_number text,
  effective_date date,
  expiration_date date,
  national_exam_score numeric(5,2),
  state_exam_score numeric(5,2),
  qualification_evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists course_instructor_assignments (
  course_id text not null,
  version text not null,
  instructor_id uuid not null references regulatory_instructors(id),
  assignment_status text not null check (assignment_status in ('proposed','active','ended')),
  assigned_at timestamptz,
  ended_at timestamptz,
  primary key(course_id,version,instructor_id),
  foreign key(course_id,version) references regulatory_course_versions(course_id,version)
);

create table if not exists lms_time_events (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id),
  course_id text not null references courses(id),
  module_id text not null,
  event_type text not null check (event_type in ('session_start','engagement','session_end','credit_adjustment')),
  active_seconds integer not null default 0 check (active_seconds >= 0 and active_seconds <= 3600),
  integrity_status text not null default 'accepted' check (integrity_status in ('accepted','pending_review','rejected')),
  occurred_at timestamptz not null default now(),
  server_received_at timestamptz not null default now(),
  detail jsonb not null default '{}'::jsonb
);

create index if not exists lms_time_events_enrollment_idx on lms_time_events(enrollment_id,occurred_at);
create index if not exists lms_time_events_course_idx on lms_time_events(course_id,occurred_at);

create table if not exists course_completion_events (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references enrollments(id),
  course_id text not null references courses(id),
  completed_at timestamptz not null,
  credited_study_seconds bigint not null check (credited_study_seconds >= 0),
  completion_status text not null check (completion_status in ('qa_non_credit','pending_review','complete','voided')),
  certificate_number text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists course_completion_events_course_idx on course_completion_events(course_id,completed_at);

create table if not exists regulatory_reports (
  id uuid primary key default gen_random_uuid(),
  state text not null check (state ~ '^[A-Z]{2}$'),
  report_type text not null,
  period_start date not null,
  period_end date not null,
  due_date date,
  payload jsonb not null,
  status text not null default 'generated' check (status in ('generated','reviewed','submitted','accepted','rejected')),
  generated_at timestamptz not null default now(),
  submitted_at timestamptz,
  unique(state,report_type,period_start,period_end)
);

create or replace view missouri_completion_time_statistics as
select
  cce.course_id,
  date_trunc('month',cce.completed_at)::date as completion_month,
  count(*)::integer as completion_count,
  round(avg(cce.credited_study_seconds))::bigint as average_credited_seconds,
  min(cce.credited_study_seconds)::bigint as minimum_credited_seconds,
  max(cce.credited_study_seconds)::bigint as maximum_credited_seconds,
  round(100.0 * avg(
    case when cce.credited_study_seconds < rcv.required_hours * 3600 then 1 else 0 end
  ),2) as percent_below_submitted_course_time
from course_completion_events cce
join regulatory_course_versions rcv on rcv.course_id=cce.course_id and rcv.version='1.0'
where cce.course_id in ('mo-salesperson-preexam-48','mo-real-estate-practice-24')
  and cce.completion_status='complete'
group by cce.course_id,date_trunc('month',cce.completed_at);

create or replace function build_missouri_completion_time_report(p_period_start date,p_period_end date)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_payload jsonb;
begin
  if p_period_start is null or p_period_end is null or p_period_end < p_period_start then
    raise exception 'invalid reporting period';
  end if;

  select jsonb_build_object(
    'state','MO',
    'report_type','distance_completion_time_statistics',
    'period_start',p_period_start,
    'period_end',p_period_end,
    'generated_at',now(),
    'courses',coalesce(jsonb_agg(to_jsonb(summary) order by summary.course_id),'[]'::jsonb)
  ) into v_payload
  from (
    select
      rcv.course_id,
      rcv.required_hours,
      count(cce.id)::integer completion_count,
      round(coalesce(avg(cce.credited_study_seconds),0))::bigint average_credited_seconds,
      coalesce(round(100.0 * avg(case when cce.credited_study_seconds < rcv.required_hours * 3600 then 1 else 0 end),2),0) percent_below_submitted_course_time,
      coalesce(round(100.0 * avg(case when cce.credited_study_seconds < rcv.required_hours * 3600 then 1 else 0 end),2),0) >= 50 threshold_review_required
    from regulatory_course_versions rcv
    left join course_completion_events cce on cce.course_id=rcv.course_id
      and cce.completion_status='complete'
      and cce.completed_at::date between p_period_start and p_period_end
    where rcv.course_id in ('mo-salesperson-preexam-48','mo-real-estate-practice-24') and rcv.version='1.0'
    group by rcv.course_id,rcv.required_hours
  ) summary;

  insert into regulatory_reports(state,report_type,period_start,period_end,due_date,payload)
  values('MO','distance_completion_time_statistics',p_period_start,p_period_end,
    case when extract(month from p_period_end)=6 then make_date(extract(year from p_period_end)::integer,7,31)
         else make_date(extract(year from p_period_end)::integer+1,1,31) end,
    v_payload)
  on conflict(state,report_type,period_start,period_end) do update set payload=excluded.payload,generated_at=now()
  returning payload into v_payload;
  return v_payload;
end $$;

alter table regulatory_course_versions enable row level security;
alter table regulatory_instructors enable row level security;
alter table course_instructor_assignments enable row level security;
alter table lms_time_events enable row level security;
alter table course_completion_events enable row level security;
alter table regulatory_reports enable row level security;

revoke all on regulatory_course_versions,regulatory_instructors,course_instructor_assignments,lms_time_events,course_completion_events,regulatory_reports from anon,authenticated;
revoke all on function build_missouri_completion_time_report(date,date) from public,anon,authenticated;
grant execute on function build_missouri_completion_time_report(date,date) to service_role;

commit;
