begin;

-- California DRE correspondence-course runtime. Apply after 001, 002, and 003.
-- The three 45-hour courses remain independent regulatory course/version records.
-- Enrollment and credit remain disabled until an administrator records DRE approval.

insert into courses(id,state,name,product_type,approval_status,enrollment_enabled,current_version,course_route)
values
  ('ca-real-estate-principles-45','CA','California Real Estate Principles — 45 Hours','real_estate_prelicense','submission_draft',false,'1.0','/student/course/'),
  ('ca-real-estate-practice-45','CA','California Real Estate Practice — 45 Hours','real_estate_prelicense','submission_draft',false,'1.0','/student/course/'),
  ('ca-mortgage-loan-brokering-lending-45','CA','California Mortgage Loan Brokering and Lending — 45 Hours','real_estate_prelicense','submission_draft',false,'1.0','/student/course/')
on conflict(id) do update set
  state=excluded.state,
  name=excluded.name,
  product_type=excluded.product_type,
  current_version=excluded.current_version,
  course_route=excluded.course_route;

alter table enrollments alter column course_version set default '1.0';

insert into regulatory_course_versions(
  course_id,version,lifecycle_status,required_hours,enrollment_enabled,regulatory_credit_enabled,configuration
)
values
  ('ca-real-estate-principles-45','1.0','development',45,false,false,
   '{"delivery":"correspondence_internet","lesson_assignments":15,"expected_minutes_per_assignment":180,"minimum_elapsed_hours":420,"maximum_completion_days":365,"final_exam":{"forms":2,"questions_per_form":100,"passing_percent":60,"proctored":true,"max_attempts":2},"cross_course_rule":{"maximum_courses":2,"window_days":35,"outside_school_attestation_required":true},"approval_claim":false}'::jsonb),
  ('ca-real-estate-practice-45','1.0','development',45,false,false,
   '{"delivery":"correspondence_internet","lesson_assignments":15,"expected_minutes_per_assignment":180,"minimum_elapsed_hours":420,"maximum_completion_days":365,"final_exam":{"forms":2,"questions_per_form":100,"passing_percent":60,"proctored":true,"max_attempts":2},"cross_course_rule":{"maximum_courses":2,"window_days":35,"outside_school_attestation_required":true},"sb1495_participatory_component":true,"approval_claim":false}'::jsonb),
  ('ca-mortgage-loan-brokering-lending-45','1.0','development',45,false,false,
   '{"delivery":"correspondence_internet","lesson_assignments":15,"expected_minutes_per_assignment":180,"minimum_elapsed_hours":420,"maximum_completion_days":365,"final_exam":{"forms":2,"questions_per_form":100,"passing_percent":60,"proctored":true,"max_attempts":2},"cross_course_rule":{"maximum_courses":2,"window_days":35,"outside_school_attestation_required":true},"approval_claim":false}'::jsonb)
on conflict(course_id,version) do update set configuration=excluded.configuration,required_hours=excluded.required_hours;

create table if not exists regulated_course_assignments (
  course_id text not null,
  course_version text not null,
  assignment_id text not null,
  assignment_version text not null default '1.0',
  sequence_number integer not null check(sequence_number between 1 and 200),
  title text not null,
  expected_minutes integer not null check(expected_minutes > 0),
  required_section_count integer not null check(required_section_count > 0),
  content_path text not null,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key(course_id,course_version,assignment_id),
  unique(course_id,course_version,sequence_number),
  foreign key(course_id,course_version) references regulatory_course_versions(course_id,version)
);

create table if not exists lms_assignment_state (
  enrollment_id uuid not null references enrollments(id),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  course_version text not null,
  assignment_id text not null,
  assignment_version text not null default '1.0',
  status text not null default 'not_started'
    check(status in ('not_started','in_progress','remediation_required','completed','blocked')),
  viewed_sections jsonb not null default '[]'::jsonb,
  applied_exercise_complete boolean not null default false,
  engagement_check_complete boolean not null default false,
  remediation_status text not null default 'not_required'
    check(remediation_status in ('not_required','required','content_viewed','satisfied')),
  active_seconds bigint not null default 0 check(active_seconds >= 0),
  assessment_attempts integer not null default 0 check(assessment_attempts >= 0),
  remediation_attempts integer not null default 0 check(remediation_attempts >= 0),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key(enrollment_id,assignment_id,assignment_version),
  foreign key(course_id,course_version,assignment_id)
    references regulated_course_assignments(course_id,course_version,assignment_id)
);

create table if not exists lms_active_sessions (
  id uuid primary key,
  enrollment_id uuid not null references enrollments(id),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  course_version text not null,
  assignment_id text not null,
  mode text not null check(mode in ('student','reviewer','admin')),
  started_at timestamptz not null default now(),
  last_heartbeat_at timestamptz not null default now(),
  ended_at timestamptz,
  active_seconds bigint not null default 0 check(active_seconds >= 0),
  inactive_seconds bigint not null default 0 check(inactive_seconds >= 0),
  device_metadata jsonb not null default '{}'::jsonb
);

create table if not exists lms_assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  course_version text not null,
  assignment_id text not null,
  assessment_kind text not null check(assessment_kind in ('applied','engagement','remediation')),
  question_id text not null,
  selected_choice integer not null check(selected_choice between 0 and 20),
  correct boolean not null,
  attempt_number integer not null check(attempt_number > 0),
  reviewer_bypass boolean not null default false,
  occurred_at timestamptz not null default now()
);

create table if not exists lms_remediation_events (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  course_version text not null,
  assignment_id text not null,
  event_type text not null check(event_type in ('triggered','content_viewed','alternate_question_correct','alternate_question_incorrect')),
  attempt_number integer not null default 1,
  detail jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists lms_regulatory_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null,
  actor_mode text not null check(actor_mode in ('student','reviewer','admin','system')),
  student_id uuid,
  enrollment_id uuid references enrollments(id),
  course_id text,
  course_version text,
  assignment_id text,
  event_type text not null,
  session_id uuid,
  detail jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists course_review_access (
  user_id uuid not null,
  course_id text not null references courses(id),
  access_role text not null check(access_role in ('regulator_reviewer','internal_reviewer','administrator')),
  active boolean not null default true,
  granted_by uuid,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key(user_id,course_id,access_role)
);

create table if not exists california_correspondence_attestations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  enrollment_id uuid not null references enrollments(id),
  outside_course_completions jsonb not null default '[]'::jsonb,
  attested_at timestamptz not null default now(),
  attestation_version text not null,
  unique(enrollment_id,attestation_version)
);

create table if not exists final_exam_authorizations (
  enrollment_id uuid primary key references enrollments(id),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  course_version text not null,
  identity_verified_at timestamptz,
  proctor_approved_at timestamptz,
  proctor_record_id uuid,
  authorization_status text not null default 'pending'
    check(authorization_status in ('pending','authorized','used','revoked')),
  updated_at timestamptz not null default now()
);

insert into regulated_course_assignments(
  course_id,course_version,assignment_id,sequence_number,title,expected_minutes,required_section_count,content_path
)
select course_id,'1.0',
  'assignment-'||lpad(sequence_number::text,2,'0'),
  sequence_number,title,180,6,
  '/content/california/'||content_folder||'/lesson-'||lpad(sequence_number::text,2,'0')||'.md'
from (
  values
    ('ca-real-estate-principles-45','ca-real-estate-principles-45-v1',1,'The real estate profession and California regulatory structure'),
    ('ca-real-estate-principles-45','ca-real-estate-principles-45-v1',2,'Real property, personal property, and fixtures'),
    ('ca-real-estate-principles-45','ca-real-estate-principles-45-v1',3,'Estates, ownership, and common interests'),
    ('ca-real-estate-principles-45','ca-real-estate-principles-45-v1',4,'Land description, measurement, and boundaries'),
    ('ca-real-estate-principles-45','ca-real-estate-principles-45-v1',5,'Encumbrances, liens, easements, and restrictions'),
    ('ca-real-estate-principles-45','ca-real-estate-principles-45-v1',6,'Government powers, land use, and environmental controls'),
    ('ca-real-estate-principles-45','ca-real-estate-principles-45-v1',7,'Agency and brokerage relationships'),
    ('ca-real-estate-principles-45','ca-real-estate-principles-45-v1',8,'Contracts and transaction formation'),
    ('ca-real-estate-principles-45','ca-real-estate-principles-45-v1',9,'Transfer, deeds, title, and recording'),
    ('ca-real-estate-principles-45','ca-real-estate-principles-45-v1',10,'Escrow, settlement, and transaction chronology'),
    ('ca-real-estate-principles-45','ca-real-estate-principles-45-v1',11,'Real estate finance foundations'),
    ('ca-real-estate-principles-45','ca-real-estate-principles-45-v1',12,'Valuation and appraisal foundations'),
    ('ca-real-estate-principles-45','ca-real-estate-principles-45-v1',13,'Taxation, investment, and real estate mathematics'),
    ('ca-real-estate-principles-45','ca-real-estate-principles-45-v1',14,'Fair housing, civil rights, and consumer protection'),
    ('ca-real-estate-principles-45','ca-real-estate-principles-45-v1',15,'Leasing, property management, license law, and integrated transaction'),
    ('ca-real-estate-practice-45','ca-real-estate-practice-45-v1',1,'California practice standards and the regulated professional'),
    ('ca-real-estate-practice-45','ca-real-estate-practice-45-v1',2,'Building a lawful real estate practice'),
    ('ca-real-estate-practice-45','ca-real-estate-practice-45-v1',3,'Agency disclosure and fiduciary performance'),
    ('ca-real-estate-practice-45','ca-real-estate-practice-45-v1',4,'Seller counseling and listing agreements'),
    ('ca-real-estate-practice-45','ca-real-estate-practice-45-v1',5,'Market analysis and pricing strategy'),
    ('ca-real-estate-practice-45','ca-real-estate-practice-45-v1',6,'Marketing, advertising, and fair access'),
    ('ca-real-estate-practice-45','ca-real-estate-practice-45-v1',7,'Buyer representation and property selection'),
    ('ca-real-estate-practice-45','ca-real-estate-practice-45-v1',8,'Purchase agreements, counteroffers, and contingencies'),
    ('ca-real-estate-practice-45','ca-real-estate-practice-45-v1',9,'Disclosures and property-condition risk'),
    ('ca-real-estate-practice-45','ca-real-estate-practice-45-v1',10,'Financing the transaction'),
    ('ca-real-estate-practice-45','ca-real-estate-practice-45-v1',11,'Escrow, title, closing, and possession'),
    ('ca-real-estate-practice-45','ca-real-estate-practice-45-v1',12,'Property management and leasing practice'),
    ('ca-real-estate-practice-45','ca-real-estate-practice-45-v1',13,'Ethics, risk management, and dispute prevention'),
    ('ca-real-estate-practice-45','ca-real-estate-practice-45-v1',14,'Implicit bias and fair housing participatory practicum'),
    ('ca-real-estate-practice-45','ca-real-estate-practice-45-v1',15,'Integrated California residential transaction'),
    ('ca-mortgage-loan-brokering-lending-45','ca-mortgage-loan-brokering-lending-45-v1',1,'California mortgage brokerage and regulatory structure'),
    ('ca-mortgage-loan-brokering-lending-45','ca-mortgage-loan-brokering-lending-45-v1',2,'Money, interest, notes, and loan mathematics'),
    ('ca-mortgage-loan-brokering-lending-45','ca-mortgage-loan-brokering-lending-45-v1',3,'Security instruments and lien priority'),
    ('ca-mortgage-loan-brokering-lending-45','ca-mortgage-loan-brokering-lending-45-v1',4,'Mortgage markets, sources, and loan products'),
    ('ca-mortgage-loan-brokering-lending-45','ca-mortgage-loan-brokering-lending-45-v1',5,'Application, borrower information, and qualification'),
    ('ca-mortgage-loan-brokering-lending-45','ca-mortgage-loan-brokering-lending-45-v1',6,'Underwriting, collateral, and approval conditions'),
    ('ca-mortgage-loan-brokering-lending-45','ca-mortgage-loan-brokering-lending-45-v1',7,'Federal consumer mortgage law'),
    ('ca-mortgage-loan-brokering-lending-45','ca-mortgage-loan-brokering-lending-45-v1',8,'California broker law, trust funds, and records'),
    ('ca-mortgage-loan-brokering-lending-45','ca-mortgage-loan-brokering-lending-45-v1',9,'Mortgage disclosures, compensation, and closing costs'),
    ('ca-mortgage-loan-brokering-lending-45','ca-mortgage-loan-brokering-lending-45-v1',10,'Origination, processing, and closing workflow'),
    ('ca-mortgage-loan-brokering-lending-45','ca-mortgage-loan-brokering-lending-45-v1',11,'Appraisal, title, escrow, and settlement'),
    ('ca-mortgage-loan-brokering-lending-45','ca-mortgage-loan-brokering-lending-45-v1',12,'Private money, seller financing, and nontraditional transactions'),
    ('ca-mortgage-loan-brokering-lending-45','ca-mortgage-loan-brokering-lending-45-v1',13,'Servicing, payoff, default, and foreclosure'),
    ('ca-mortgage-loan-brokering-lending-45','ca-mortgage-loan-brokering-lending-45-v1',14,'Fair lending, fraud prevention, and ethical mortgage practice'),
    ('ca-mortgage-loan-brokering-lending-45','ca-mortgage-loan-brokering-lending-45-v1',15,'Integrated California mortgage brokerage file')
) seeded(course_id,content_folder,sequence_number,title)
on conflict(course_id,course_version,assignment_id) do update set
  title=excluded.title,
  expected_minutes=excluded.expected_minutes,
  required_section_count=excluded.required_section_count,
  content_path=excluded.content_path;

create index if not exists lms_assignment_state_student_idx on lms_assignment_state(student_id,enrollment_id,status);
create index if not exists lms_active_sessions_enrollment_idx on lms_active_sessions(enrollment_id,last_heartbeat_at desc);
create index if not exists lms_assessment_attempts_enrollment_idx on lms_assessment_attempts(enrollment_id,assignment_id,occurred_at);
create index if not exists lms_regulatory_audit_enrollment_idx on lms_regulatory_audit(enrollment_id,occurred_at);

create or replace function record_california_heartbeat(
  p_session_id uuid,
  p_enrollment_id uuid,
  p_actor_id uuid,
  p_assignment_id text,
  p_mode text,
  p_active boolean,
  p_metadata jsonb default '{}'::jsonb
) returns integer language plpgsql security definer set search_path=public as $$
declare
  v_enrollment enrollments%rowtype;
  v_session lms_active_sessions%rowtype;
  v_credit integer := 0;
  v_elapsed integer := 0;
  v_reviewer boolean := false;
begin
  select * into v_enrollment from enrollments where id=p_enrollment_id for update;
  if not found or v_enrollment.state <> 'CA' then raise exception 'california_enrollment_not_found'; end if;
  select exists(
    select 1 from course_review_access
    where user_id=p_actor_id and course_id=v_enrollment.course_id and active=true
      and (expires_at is null or expires_at>now())
  ) into v_reviewer;
  if not v_reviewer and v_enrollment.student_id <> p_actor_id then raise exception 'course_access_denied'; end if;
  if p_mode not in ('student','reviewer','admin') then raise exception 'invalid_mode'; end if;

  select * into v_session from lms_active_sessions where id=p_session_id for update;
  if not found then
    insert into lms_active_sessions(id,enrollment_id,student_id,course_id,course_version,assignment_id,mode,device_metadata)
    values(p_session_id,p_enrollment_id,v_enrollment.student_id,v_enrollment.course_id,v_enrollment.course_version,p_assignment_id,p_mode,p_metadata);
  else
    v_elapsed := greatest(0,floor(extract(epoch from now()-v_session.last_heartbeat_at))::integer);
    if p_active and not v_reviewer and p_mode='student' and v_elapsed between 1 and 90 then
      v_credit := least(v_elapsed,30);
    end if;
    update lms_active_sessions set
      last_heartbeat_at=now(),
      active_seconds=active_seconds+v_credit,
      inactive_seconds=inactive_seconds+case when v_credit=0 then least(v_elapsed,90) else greatest(v_elapsed-v_credit,0) end,
      device_metadata=coalesce(device_metadata,'{}'::jsonb)||coalesce(p_metadata,'{}'::jsonb)
    where id=p_session_id;
    if v_credit>0 then
      update lms_assignment_state set active_seconds=active_seconds+v_credit,updated_at=now()
      where enrollment_id=p_enrollment_id and assignment_id=p_assignment_id and assignment_version='1.0';
      update lms_compliance_state set credited_study_seconds=credited_study_seconds+v_credit,updated_at=now()
      where enrollment_id=p_enrollment_id;
      insert into lms_time_events(enrollment_id,course_id,module_id,event_type,active_seconds,detail)
      values(p_enrollment_id,v_enrollment.course_id,p_assignment_id,'engagement',v_credit,p_metadata);
    end if;
  end if;

  insert into lms_regulatory_audit(actor_id,actor_mode,student_id,enrollment_id,course_id,course_version,assignment_id,event_type,session_id,detail)
  values(p_actor_id,case when v_reviewer then 'reviewer' else p_mode end,v_enrollment.student_id,p_enrollment_id,
    v_enrollment.course_id,v_enrollment.course_version,p_assignment_id,'heartbeat',p_session_id,
    jsonb_build_object('active_signal',p_active,'credited_seconds',v_credit)||coalesce(p_metadata,'{}'::jsonb));
  return v_credit;
end $$;

create or replace function refresh_california_eligibility(p_enrollment_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_enrollment enrollments%rowtype;
  v_completed integer := 0;
  v_earliest timestamptz;
  v_calendar boolean := false;
  v_identity boolean := false;
  v_recent integer := 0;
  v_cross_course boolean := false;
  v_final boolean := false;
  v_remaining jsonb := '[]'::jsonb;
begin
  select * into v_enrollment from enrollments where id=p_enrollment_id;
  if not found or v_enrollment.state<>'CA' then raise exception 'california_enrollment_not_found'; end if;
  select count(*)::integer into v_completed from lms_assignment_state
    where enrollment_id=p_enrollment_id and status='completed';
  v_earliest := v_enrollment.enrollment_date + interval '420 hours';
  v_calendar := now()>=v_earliest;
  select count(*)::integer into v_recent from course_completion_events cce
    join courses c on c.id=cce.course_id
    where c.state='CA' and cce.enrollment_id<>p_enrollment_id and cce.completion_status in ('complete','qa_non_credit')
      and cce.completed_at>now()-interval '35 days'
      and exists(select 1 from enrollments e where e.id=cce.enrollment_id and e.student_id=v_enrollment.student_id);
  v_cross_course := v_recent<2;
  select coalesce(authorization_status='authorized',false) into v_identity
    from final_exam_authorizations where enrollment_id=p_enrollment_id;
  v_identity := coalesce(v_identity,false);
  if v_completed<15 then v_remaining:=v_remaining||jsonb_build_array((15-v_completed)::text||' lesson assignments'); end if;
  if not v_calendar then v_remaining:=v_remaining||jsonb_build_array('California 2.5-week minimum period'); end if;
  if not v_cross_course then v_remaining:=v_remaining||jsonb_build_array('California two-course / five-week completion window'); end if;
  if not v_identity then v_remaining:=v_remaining||jsonb_build_array('Identity and proctor authorization'); end if;
  v_final := v_completed=15 and v_calendar and v_cross_course and v_identity;

  insert into course_final_eligibility(
    enrollment_id,course_id,course_version,earliest_final_exam_at,calendar_eligible,
    assignments_complete,quizzes_complete,interactive_requirements_complete,
    identity_requirements_complete,unresolved_compliance_blocks,remaining_requirements,final_exam_eligible,updated_at
  ) values(
    p_enrollment_id,v_enrollment.course_id,v_enrollment.course_version,v_earliest,v_calendar,
    v_completed=15,v_completed=15,v_completed=15,v_identity,case when v_cross_course then 0 else 1 end,
    v_remaining,v_final,now()
  )
  on conflict(enrollment_id) do update set
    earliest_final_exam_at=excluded.earliest_final_exam_at,
    calendar_eligible=excluded.calendar_eligible,
    assignments_complete=excluded.assignments_complete,
    quizzes_complete=excluded.quizzes_complete,
    interactive_requirements_complete=excluded.interactive_requirements_complete,
    identity_requirements_complete=excluded.identity_requirements_complete,
    unresolved_compliance_blocks=excluded.unresolved_compliance_blocks,
    remaining_requirements=excluded.remaining_requirements,
    final_exam_eligible=excluded.final_exam_eligible,
    updated_at=now();
  return jsonb_build_object('assignments_completed',v_completed,'earliest_final_exam_at',v_earliest,
    'calendar_eligible',v_calendar,'cross_course_window_eligible',v_cross_course,
    'identity_and_proctor_authorized',v_identity,'final_exam_eligible',v_final,'remaining_requirements',v_remaining);
end $$;

create or replace function create_qa_california_bundle(p_student_id uuid)
returns table(course_id text,enrollment_id uuid) language plpgsql security definer set search_path=public as $$
declare
  v_course text;
  v_attempt uuid;
  v_enrollment uuid;
begin
  if not exists(select 1 from students where id=p_student_id) then raise exception 'student_not_found'; end if;
  foreach v_course in array array[
    'ca-real-estate-principles-45',
    'ca-real-estate-practice-45',
    'ca-mortgage-loan-brokering-lending-45'
  ] loop
    select e.id into v_enrollment from enrollments e
      where e.student_id=p_student_id and e.course_id=v_course and e.status in ('active','qa_non_credit')
      order by e.created_at desc limit 1;
    if v_enrollment is null then
      v_attempt:=gen_random_uuid();
      insert into checkout_attempts(
        id,student_id,course_id,state,stripe_mode,amount,currency,status,
        regulatory_acknowledgment_version,terms_version,refund_policy_version,cancellation_policy_version,qa_only
      ) values(v_attempt,p_student_id,v_course,'CA','test',1,'usd','qa_manual',
        'ca-draft-qa','ca-draft-qa','ca-draft-qa','ca-draft-qa',true);
      insert into enrollments(student_id,course_id,state,status,compliance_credit_eligible,checkout_attempt_id,course_version,started_at,expires_at)
      values(p_student_id,v_course,'CA','qa_non_credit',false,v_attempt,'1.0',now(),now()+interval '365 days')
      returning id into v_enrollment;
      insert into access_grants(enrollment_id,student_id,course_id,status)
      values(v_enrollment,p_student_id,v_course,'active');
      insert into lms_compliance_state(enrollment_id,required_study_seconds,credited_study_seconds)
      values(v_enrollment,162000,0);
      insert into student_portal_state(enrollment_id,student_id,course_id,course_version,resume_path)
      values(v_enrollment,p_student_id,v_course,'1.0','/student/course/?enrollment_id='||v_enrollment::text)
      on conflict(enrollment_id) do nothing;
      insert into final_exam_authorizations(enrollment_id,student_id,course_id,course_version)
      values(v_enrollment,p_student_id,v_course,'1.0')
      on conflict(enrollment_id) do nothing;
      insert into lms_assignment_state(enrollment_id,student_id,course_id,course_version,assignment_id)
      select v_enrollment,p_student_id,v_course,'1.0',assignment_id
      from regulated_course_assignments where course_id=v_course and course_version='1.0'
      order by sequence_number
      on conflict(enrollment_id,assignment_id,assignment_version) do nothing;
      insert into lms_assignment_progress(enrollment_id,course_id,course_version,assignment_id,assignment_version)
      select v_enrollment,v_course,'1.0',assignment_id,'1.0'
      from regulated_course_assignments where course_id=v_course and course_version='1.0'
      on conflict(enrollment_id,assignment_id,assignment_version) do nothing;
    end if;
    perform refresh_california_eligibility(v_enrollment);
    course_id:=v_course;
    enrollment_id:=v_enrollment;
    return next;
    v_enrollment:=null;
  end loop;
end $$;

create or replace function initialize_california_enrollment()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.course_id not in (
    'ca-real-estate-principles-45',
    'ca-real-estate-practice-45',
    'ca-mortgage-loan-brokering-lending-45'
  ) then return new; end if;
  new.course_version:=coalesce(new.course_version,'1.0');
  new.started_at:=coalesce(new.started_at,now());
  new.expires_at:=coalesce(new.expires_at,now()+interval '365 days');
  return new;
end $$;

create or replace function initialize_california_enrollment_records()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.course_id not in (
    'ca-real-estate-principles-45',
    'ca-real-estate-practice-45',
    'ca-mortgage-loan-brokering-lending-45'
  ) then return new; end if;
  insert into student_portal_state(enrollment_id,student_id,course_id,course_version,resume_path)
  values(new.id,new.student_id,new.course_id,new.course_version,'/student/course/?enrollment_id='||new.id::text)
  on conflict(enrollment_id) do nothing;
  insert into final_exam_authorizations(enrollment_id,student_id,course_id,course_version)
  values(new.id,new.student_id,new.course_id,new.course_version)
  on conflict(enrollment_id) do nothing;
  insert into lms_assignment_state(enrollment_id,student_id,course_id,course_version,assignment_id)
  select new.id,new.student_id,new.course_id,new.course_version,assignment_id
  from regulated_course_assignments where course_id=new.course_id and course_version=new.course_version
  on conflict(enrollment_id,assignment_id,assignment_version) do nothing;
  insert into lms_assignment_progress(enrollment_id,course_id,course_version,assignment_id,assignment_version)
  select new.id,new.course_id,new.course_version,assignment_id,'1.0'
  from regulated_course_assignments where course_id=new.course_id and course_version=new.course_version
  on conflict(enrollment_id,assignment_id,assignment_version) do nothing;
  return new;
end $$;

drop trigger if exists california_enrollment_defaults on enrollments;
create trigger california_enrollment_defaults before insert on enrollments
for each row execute function initialize_california_enrollment();
drop trigger if exists california_enrollment_records on enrollments;
create trigger california_enrollment_records after insert on enrollments
for each row execute function initialize_california_enrollment_records();

alter table regulated_course_assignments enable row level security;
alter table lms_assignment_state enable row level security;
alter table lms_active_sessions enable row level security;
alter table lms_assessment_attempts enable row level security;
alter table lms_remediation_events enable row level security;
alter table lms_regulatory_audit enable row level security;
alter table course_review_access enable row level security;
alter table california_correspondence_attestations enable row level security;
alter table final_exam_authorizations enable row level security;

revoke all on regulated_course_assignments,lms_assignment_state,lms_active_sessions,lms_assessment_attempts,
  lms_remediation_events,lms_regulatory_audit,course_review_access,california_correspondence_attestations,
  final_exam_authorizations from anon,authenticated;
grant select on regulated_course_assignments to authenticated;
grant select on lms_assignment_state,lms_assessment_attempts,lms_remediation_events,
  california_correspondence_attestations,final_exam_authorizations to authenticated;
grant all on regulated_course_assignments,lms_assignment_state,lms_active_sessions,lms_assessment_attempts,
  lms_remediation_events,lms_regulatory_audit,course_review_access,california_correspondence_attestations,
  final_exam_authorizations to service_role;
revoke all on function record_california_heartbeat(uuid,uuid,uuid,text,text,boolean,jsonb) from public,anon,authenticated;
revoke all on function refresh_california_eligibility(uuid) from public,anon,authenticated;
revoke all on function create_qa_california_bundle(uuid) from public,anon,authenticated;
grant execute on function record_california_heartbeat(uuid,uuid,uuid,text,text,boolean,jsonb) to service_role;
grant execute on function refresh_california_eligibility(uuid) to service_role;
grant execute on function create_qa_california_bundle(uuid) to service_role;

commit;
