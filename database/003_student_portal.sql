begin;

alter table students add column if not exists preferred_name text;
alter table students add column if not exists account_status text not null default 'active'
  check (account_status in ('active','locked','disabled'));
alter table students add column if not exists locale text not null default 'en-US';
alter table students add column if not exists timezone text;
alter table students add column if not exists last_sign_in_at timestamptz;

alter table courses add column if not exists current_version text not null default '1.0';
alter table courses add column if not exists course_route text;

update courses set current_version='1.0', course_route='/real-estate/virginia/pre-license/principles-and-practices/' where id='va-salesperson';
update courses set current_version='1.0', course_route='/real-estate/maine/pre-license/sales-agent/' where id='me-sales-agent';
update courses set current_version='1.0', course_route='/real-estate/wisconsin/pre-license/salesperson/' where id='wi-salesperson';
update courses set current_version='1.0', course_route='/real-estate/missouri/pre-license/salesperson-pre-exam/' where id='mo-salesperson-preexam-48';
update courses set current_version='1.0', course_route='/real-estate/missouri/pre-license/real-estate-practice/' where id='mo-real-estate-practice-24';
update courses set current_version='1.0', course_route='/real-estate/oklahoma/pre-license/basic/' where id='ok-basic-prelicense-90';

alter table enrollments add column if not exists course_version text;
alter table enrollments add column if not exists started_at timestamptz;
alter table enrollments add column if not exists expires_at timestamptz;
alter table enrollments add column if not exists completed_at timestamptz;
alter table enrollments add column if not exists last_portal_accessed_at timestamptz;
alter table enrollments add column if not exists last_course_accessed_at timestamptz;

update enrollments e set course_version=coalesce(e.course_version,c.current_version,'1.0')
from courses c where c.id=e.course_id and e.course_version is null;
update enrollments set course_version='1.0' where course_version is null;
alter table enrollments alter column course_version set not null;

create table if not exists student_portal_state (
  enrollment_id uuid primary key references enrollments(id),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  course_version text not null,
  last_module_id text,
  last_lesson_id text,
  resume_path text,
  last_activity_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(student_id,enrollment_id)
);

create table if not exists course_certificates (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references enrollments(id),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  course_version text not null,
  certificate_number text unique,
  status text not null default 'not_eligible'
    check (status in ('not_eligible','eligible','pending_review','issued','voided')),
  issued_at timestamptz,
  voided_at timestamptz,
  file_path text,
  content_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists student_portal_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  enrollment_id uuid references enrollments(id),
  event_type text not null check (event_type in (
    'signed_in','signed_out','portal_opened','course_resume_clicked',
    'certificate_viewed','receipt_viewed','profile_viewed'
  )),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

-- Compliance-engine owned assignment summary. Portal access is read-only.
create table if not exists lms_assignment_progress (
  enrollment_id uuid not null references enrollments(id),
  course_id text not null references courses(id),
  course_version text not null,
  assignment_id text not null,
  assignment_version text not null,
  status text not null default 'not_started'
    check (status in ('not_started','in_progress','remediation_required','completed')),
  quiz_mastery_percent numeric(5,2),
  remediation_required boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key(enrollment_id,assignment_id,assignment_version)
);

-- State/course calendar and final gates are calculated by the compliance engine,
-- never by the portal or Stripe.
create table if not exists course_final_eligibility (
  enrollment_id uuid primary key references enrollments(id),
  course_id text not null references courses(id),
  course_version text not null,
  earliest_final_exam_at timestamptz,
  calendar_eligible boolean not null default false,
  assignments_complete boolean not null default false,
  quizzes_complete boolean not null default false,
  interactive_requirements_complete boolean not null default false,
  identity_requirements_complete boolean not null default false,
  unresolved_compliance_blocks integer not null default 0 check (unresolved_compliance_blocks >= 0),
  remaining_requirements jsonb not null default '[]'::jsonb,
  final_exam_eligible boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists student_help_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  enrollment_id uuid not null references enrollments(id),
  course_id text not null references courses(id),
  assignment_id text,
  concept text,
  status text not null default 'open' check (status in ('open','assigned','answered','closed')),
  assigned_instructor_id uuid references regulatory_instructors(id),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  closed_at timestamptz
);

-- Non-credit licensing guidance is explicitly separated from course completion.
create table if not exists licensing_navigator_state (
  student_id uuid not null references students(id),
  state text not null check (state ~ '^[A-Z]{2}$'),
  license_goal text not null,
  steps jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key(student_id,state,license_goal)
);

create index if not exists student_portal_state_student_idx on student_portal_state(student_id,updated_at desc);
create index if not exists course_certificates_student_idx on course_certificates(student_id,issued_at desc);
create index if not exists student_portal_events_student_idx on student_portal_events(student_id,occurred_at desc);
create index if not exists lms_assignment_progress_enrollment_idx on lms_assignment_progress(enrollment_id,status);
create index if not exists student_help_requests_student_idx on student_help_requests(student_id,status,created_at desc);

create or replace view student_portal_enrollments with (security_invoker=true) as
select
  e.id as enrollment_id,
  e.student_id,
  e.course_id,
  e.course_version,
  e.state,
  c.name as course_name,
  c.product_type,
  c.approval_status,
  c.regulatory_approval_number,
  e.status as enrollment_status,
  e.compliance_credit_eligible,
  e.enrollment_date,
  e.started_at,
  e.expires_at,
  coalesce(e.completed_at,cce.completed_at) as completed_at,
  e.last_portal_accessed_at,
  e.last_course_accessed_at,
  ag.status as access_status,
  coalesce(lcs.required_study_seconds,0) as required_study_seconds,
  coalesce(lcs.credited_study_seconds,0) as credited_study_seconds,
  case when coalesce(lcs.required_study_seconds,0) > 0
    then least(100,round(100.0*lcs.credited_study_seconds/lcs.required_study_seconds))::integer
    else 0 end as progress_percent,
  coalesce(lcs.final_exam_status,'not_started') as final_exam_status,
  coalesce(lcs.regulatory_credit_status,'not_earned') as regulatory_credit_status,
  coalesce(lcs.certificate_status,'not_issued') as certificate_status,
  coalesce(sps.last_module_id,'') as last_module_id,
  coalesce(sps.last_lesson_id,'') as last_lesson_id,
  coalesce(sps.resume_path,c.course_route) as resume_path,
  sps.last_activity_at,
  cc.id as certificate_id,
  cc.certificate_number,
  cc.status as portal_certificate_status,
  cc.issued_at as certificate_issued_at,
  coalesce(ap.assignment_count,0) as assignment_count,
  coalesce(ap.assignments_completed,0) as assignments_completed,
  coalesce(ap.quiz_mastery_percent,0) as quiz_mastery_percent,
  cfe.earliest_final_exam_at,
  coalesce(cfe.final_exam_eligible,false) as portal_final_exam_eligible,
  coalesce(cfe.remaining_requirements,'[]'::jsonb) as remaining_requirements,
  ri.display_name as instructor_name,
  coalesce(hr.open_help_requests,0) as open_help_requests,
  p.id as payment_id,
  p.status as payment_status,
  p.amount as payment_amount,
  p.currency as payment_currency,
  p.refund_status,
  p.refund_amount
from enrollments e
join courses c on c.id=e.course_id
left join access_grants ag on ag.enrollment_id=e.id
left join lms_compliance_state lcs on lcs.enrollment_id=e.id
left join course_completion_events cce on cce.enrollment_id=e.id
left join student_portal_state sps on sps.enrollment_id=e.id
left join course_certificates cc on cc.enrollment_id=e.id
left join (
  select enrollment_id,count(*)::integer assignment_count,
    count(*) filter(where status='completed')::integer assignments_completed,
    round(coalesce(avg(quiz_mastery_percent) filter(where quiz_mastery_percent is not null),0),2) quiz_mastery_percent
  from lms_assignment_progress group by enrollment_id
) ap on ap.enrollment_id=e.id
left join course_final_eligibility cfe on cfe.enrollment_id=e.id
left join lateral (
  select r.display_name from course_instructor_assignments cia
  join regulatory_instructors r on r.id=cia.instructor_id
  where cia.course_id=e.course_id and cia.version=e.course_version and cia.assignment_status='active'
  order by cia.assigned_at desc nulls last limit 1
) ri on true
left join (
  select enrollment_id,count(*) filter(where status in ('open','assigned'))::integer open_help_requests
  from student_help_requests group by enrollment_id
) hr on hr.enrollment_id=e.id
left join lateral (
  select payment.* from payments payment
  where payment.enrollment_id=e.id
  order by payment.payment_date desc nulls last,payment.created_at desc
  limit 1
) p on true;

alter table student_portal_state enable row level security;
alter table course_certificates enable row level security;
alter table student_portal_events enable row level security;
alter table lms_assignment_progress enable row level security;
alter table course_final_eligibility enable row level security;
alter table student_help_requests enable row level security;
alter table licensing_navigator_state enable row level security;

drop policy if exists students_read_own on students;
create policy students_read_own on students for select to authenticated using (id=auth.uid());
drop policy if exists enrollments_read_own on enrollments;
create policy enrollments_read_own on enrollments for select to authenticated using (student_id=auth.uid());
drop policy if exists access_grants_read_own on access_grants;
create policy access_grants_read_own on access_grants for select to authenticated using (student_id=auth.uid());
drop policy if exists payments_read_own on payments;
create policy payments_read_own on payments for select to authenticated using (student_id=auth.uid());
drop policy if exists compliance_read_own on lms_compliance_state;
create policy compliance_read_own on lms_compliance_state for select to authenticated
  using (exists(select 1 from enrollments e where e.id=enrollment_id and e.student_id=auth.uid()));
drop policy if exists portal_state_read_own on student_portal_state;
create policy portal_state_read_own on student_portal_state for select to authenticated using (student_id=auth.uid());
drop policy if exists certificates_read_own on course_certificates;
create policy certificates_read_own on course_certificates for select to authenticated using (student_id=auth.uid());
drop policy if exists assignment_progress_read_own on lms_assignment_progress;
create policy assignment_progress_read_own on lms_assignment_progress for select to authenticated
  using (exists(select 1 from enrollments e where e.id=enrollment_id and e.student_id=auth.uid()));
drop policy if exists final_eligibility_read_own on course_final_eligibility;
create policy final_eligibility_read_own on course_final_eligibility for select to authenticated
  using (exists(select 1 from enrollments e where e.id=enrollment_id and e.student_id=auth.uid()));
drop policy if exists help_requests_read_own on student_help_requests;
create policy help_requests_read_own on student_help_requests for select to authenticated using (student_id=auth.uid());
drop policy if exists navigator_read_own on licensing_navigator_state;
create policy navigator_read_own on licensing_navigator_state for select to authenticated using (student_id=auth.uid());

revoke all on student_portal_state,course_certificates,student_portal_events from anon;
revoke all on student_portal_events from authenticated;
revoke all on lms_assignment_progress,course_final_eligibility,student_help_requests,licensing_navigator_state from anon;
revoke insert,update,delete on lms_assignment_progress,course_final_eligibility from authenticated;
revoke all on student_portal_enrollments from anon,authenticated;
grant select on students,enrollments,access_grants,payments,lms_compliance_state,student_portal_state,course_certificates to authenticated;
grant select on student_portal_enrollments to service_role;
grant all on student_portal_state,course_certificates,student_portal_events to service_role;
grant select on lms_assignment_progress,course_final_eligibility,student_help_requests,licensing_navigator_state to authenticated;
grant all on lms_assignment_progress,course_final_eligibility,student_help_requests,licensing_navigator_state to service_role;

commit;
