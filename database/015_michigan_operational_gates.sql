begin;

-- Michigan prelicensure pre-activation runtime. Apply after 014.
--
-- This migration implements the records and refusals needed for a Michigan launch,
-- but it does NOT activate the course. Every seeded authority is pending, every
-- regulator identifier is null, regulatory credit is false, and enrollment is false.
-- Activation requires later agency evidence recorded through the append-only authority
-- and configuration event tables plus a separate explicit release change.

insert into courses(
  id,state,name,product_type,approval_status,enrollment_enabled,current_version,course_route
)
values(
  'mi-salesperson-prelicensure-40-v1','MI',
  'Principles of Real Estate - Michigan Salesperson Prelicensure',
  'real_estate_prelicense','submission_draft',false,
  '1.0-submission-draft','/student/course/'
)
on conflict(id) do update set
  state=excluded.state,
  name=excluded.name,
  product_type=excluded.product_type,
  current_version=excluded.current_version,
  course_route=excluded.course_route;

insert into regulatory_course_versions(
  course_id,version,lifecycle_status,required_hours,enrollment_enabled,
  regulatory_credit_enabled,configuration
)
values(
  'mi-salesperson-prelicensure-40-v1','1.0-submission-draft','development',40,false,false,
  '{
    "delivery":"asynchronous_distance",
    "modules":10,
    "clock_hours_per_module":4,
    "required_sections_per_module":6,
    "written_memo_rubric":"MI-MEMO-1.0-submission-draft",
    "asynchronous_attestation":"MI-ASYNC-1.0-submission-draft",
    "approval_claim":false,
    "operational_activation":"preactivation_only"
  }'::jsonb
)
on conflict(course_id,version) do update set
  required_hours=excluded.required_hours,
  configuration=excluded.configuration;

insert into regulated_course_assignments(
  course_id,course_version,assignment_id,sequence_number,title,
  expected_minutes,required_section_count,content_path,configuration
)
select
  'mi-salesperson-prelicensure-40-v1','1.0-submission-draft',
  module_id,sequence_number,title,240,6,
  '/content/michigan/mi-salesperson-prelicensure-40-v1/curriculum/'||module_id||'.md',
  jsonb_build_object(
    'written_memo_required',true,
    'written_memo_satisfactory_points',8,
    'written_memo_total_points',10,
    'applied_confirmation_passing_percent',100,
    'engagement_passing_percent',80,
    'statutory_civil_rights',module_id='module-07'
  )
from (values
  ('module-01',1,'Michigan license law, the Occupational Code, and the regulated activity'),
  ('module-02',2,'Property, ownership, and interests in real estate'),
  ('module-03',3,'Legal descriptions, transfer of title, and recording in Michigan'),
  ('module-04',4,'Encumbrances, liens, taxes, and land-use control'),
  ('module-05',5,'Agency, the service provision agreement, and disclosure'),
  ('module-06',6,'Contracts, purchase agreements, and the Michigan seller disclosure'),
  ('module-07',7,'Civil rights law and equal opportunity in housing'),
  ('module-08',8,'Real estate finance and settlement law'),
  ('module-09',9,'Valuation, appraisal, and real estate mathematics'),
  ('module-10',10,'Closing, trust accounts, and professional practice')
) seeded(module_id,sequence_number,title)
on conflict(course_id,course_version,assignment_id) do update set
  sequence_number=excluded.sequence_number,
  title=excluded.title,
  expected_minutes=excluded.expected_minutes,
  required_section_count=excluded.required_section_count,
  content_path=excluded.content_path,
  configuration=excluded.configuration;

-- ---------------------------------------------------------------------------
-- Append-only authority and configuration evidence
-- ---------------------------------------------------------------------------

create table if not exists michigan_authority_events (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  course_version text not null,
  authority_kind text not null
    check(authority_kind in ('school','program','course','instructor','surety')),
  authority_status text not null
    check(authority_status in ('pending','active','suspended','expired','revoked','rejected')),
  identifier text,
  subject_id uuid references regulatory_instructors(id),
  effective_at timestamptz,
  expires_at timestamptz,
  evidence jsonb not null default '{}'::jsonb,
  recorded_by uuid,
  recorded_at timestamptz not null default now(),
  foreign key(course_id,course_version)
    references regulatory_course_versions(course_id,version),
  check(authority_status <> 'active' or nullif(btrim(identifier),'') is not null),
  check(authority_kind <> 'instructor' or authority_status <> 'active' or subject_id is not null),
  check(expires_at is null or effective_at is null or expires_at > effective_at)
);

create index if not exists michigan_authority_events_current_idx
  on michigan_authority_events(course_id,course_version,authority_kind,recorded_at desc);

insert into michigan_authority_events(course_id,course_version,authority_kind,authority_status,evidence)
select 'mi-salesperson-prelicensure-40-v1','1.0-submission-draft',kind,'pending',
  '{"source":"submission_draft","approval_claim":false}'::jsonb
from unnest(array['school','program','course','instructor','surety']) kind
where not exists(
  select 1 from michigan_authority_events e
  where e.course_id='mi-salesperson-prelicensure-40-v1'
    and e.course_version='1.0-submission-draft'
    and e.authority_kind=kind
);

create or replace view michigan_current_authority with (security_invoker=true) as
select distinct on(course_id,course_version,authority_kind)
  id,course_id,course_version,authority_kind,authority_status,identifier,subject_id,
  effective_at,expires_at,evidence,recorded_by,recorded_at
from michigan_authority_events
order by course_id,course_version,authority_kind,recorded_at desc,id desc;

create table if not exists michigan_runtime_configuration_events (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  course_version text not null,
  identifier_requirements_confirmed boolean not null default false,
  pss_school_number text,
  bpl_sponsor_number text,
  bpl_course_number text,
  reporting_requirements_confirmed boolean not null default false,
  reporting_channel text,
  reporting_format text,
  evidence jsonb not null default '{}'::jsonb,
  recorded_by uuid,
  recorded_at timestamptz not null default now(),
  foreign key(course_id,course_version)
    references regulatory_course_versions(course_id,version),
  check(not identifier_requirements_confirmed or (
    nullif(btrim(pss_school_number),'') is not null
    and nullif(btrim(bpl_sponsor_number),'') is not null
    and nullif(btrim(bpl_course_number),'') is not null
  )),
  check(not reporting_requirements_confirmed or (
    nullif(btrim(reporting_channel),'') is not null
    and nullif(btrim(reporting_format),'') is not null
  ))
);

insert into michigan_runtime_configuration_events(
  course_id,course_version,evidence
)
select 'mi-salesperson-prelicensure-40-v1','1.0-submission-draft',
  '{"source":"submission_draft","agency_answers_received":false}'::jsonb
where not exists(
  select 1 from michigan_runtime_configuration_events
  where course_id='mi-salesperson-prelicensure-40-v1'
    and course_version='1.0-submission-draft'
);

create or replace view michigan_current_runtime_configuration with (security_invoker=true) as
select distinct on(course_id,course_version)
  id,course_id,course_version,identifier_requirements_confirmed,
  pss_school_number,bpl_sponsor_number,bpl_course_number,
  reporting_requirements_confirmed,reporting_channel,reporting_format,
  evidence,recorded_by,recorded_at
from michigan_runtime_configuration_events
order by course_id,course_version,recorded_at desc,id desc;

create or replace function michigan_authority_summary(
  p_course_id text default 'mi-salesperson-prelicensure-40-v1',
  p_course_version text default '1.0-submission-draft',
  p_at timestamptz default now()
) returns jsonb language sql stable security definer set search_path=public as $$
  with expected(kind) as (
    select unnest(array['school','program','course','instructor','surety'])
  ), evaluated as (
    select expected.kind,
      a.authority_status,
      a.identifier,
      a.subject_id,
      a.effective_at,
      a.expires_at,
      case
        when a.id is null then expected.kind||'_authority_missing'
        when a.authority_status <> 'active' then expected.kind||'_authority_'||a.authority_status
        when nullif(btrim(a.identifier),'') is null then expected.kind||'_identifier_missing'
        when a.effective_at is not null and a.effective_at > p_at then expected.kind||'_authority_not_effective'
        when a.expires_at is not null and a.expires_at <= p_at then expected.kind||'_authority_expired'
        else null
      end reason
    from expected
    left join michigan_current_authority a
      on a.course_id=p_course_id and a.course_version=p_course_version
      and a.authority_kind=expected.kind
  )
  select jsonb_build_object(
    'active',count(*) filter(where reason is not null)=0,
    'reasons',coalesce(jsonb_agg(reason order by kind) filter(where reason is not null),'[]'::jsonb),
    'gates',coalesce(jsonb_object_agg(kind,jsonb_build_object(
      'active',reason is null,
      'reason',reason,
      'status',authority_status,
      'identifier',identifier,
      'subject_id',subject_id,
      'effective_at',effective_at,
      'expires_at',expires_at
    )),'{}'::jsonb),
    'permissions',jsonb_build_object(
      'enrollment',count(*) filter(where reason is not null)=0,
      'credited_instruction',count(*) filter(where reason is not null)=0,
      'completion',count(*) filter(where reason is not null)=0,
      'certificate',count(*) filter(where reason is not null)=0,
      'completion_report',count(*) filter(where reason is not null)=0
    ),
    'evaluated_at',p_at
  ) from evaluated;
$$;

create or replace function michigan_require_active_authority(
  p_course_id text,
  p_course_version text
) returns void language plpgsql stable security definer set search_path=public as $$
declare v_gate jsonb;
begin
  v_gate:=michigan_authority_summary(p_course_id,p_course_version,now());
  if not coalesce((v_gate->>'active')::boolean,false) then
    raise exception 'michigan_authority_blocked: %',v_gate->'reasons';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Written memo, instructor rubric, feedback, and resubmission history
-- ---------------------------------------------------------------------------

create table if not exists michigan_applied_memo_versions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  course_version text not null,
  module_id text not null check(module_id ~ '^module-(0[1-9]|10)$'),
  submission_version integer not null check(submission_version >= 1),
  response_text text not null check(length(btrim(response_text)) between 1 and 100000),
  content_sha256 text not null check(content_sha256 ~ '^[0-9a-f]{64}$'),
  submitted_at timestamptz not null default now(),
  unique(enrollment_id,module_id,submission_version),
  foreign key(course_id,course_version,module_id)
    references regulated_course_assignments(course_id,course_version,assignment_id)
);

create index if not exists michigan_memo_versions_queue_idx
  on michigan_applied_memo_versions(course_id,submitted_at);

create table if not exists michigan_applied_memo_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references michigan_applied_memo_versions(id),
  reviewer_instructor_id uuid not null references regulatory_instructors(id),
  rubric_version text not null check(rubric_version='MI-MEMO-1.0-submission-draft'),
  criterion_scores jsonb not null,
  criterion_feedback jsonb not null,
  total_points integer not null check(total_points between 0 and 10),
  outcome text not null check(outcome in ('satisfactory','needs_revision')),
  authority_event_id uuid not null references michigan_authority_events(id),
  reviewed_at timestamptz not null default now(),
  check(
    (outcome='satisfactory' and total_points >= 8
      and (criterion_scores->>'law_accuracy')::integer > 0
      and (criterion_scores->>'professional_boundary')::integer > 0)
    or outcome='needs_revision'
  )
);

create index if not exists michigan_memo_reviews_reviewer_idx
  on michigan_applied_memo_reviews(reviewer_instructor_id,reviewed_at);

-- ---------------------------------------------------------------------------
-- Identity and signed asynchronous attestation records
-- ---------------------------------------------------------------------------

create table if not exists michigan_identity_verification_events (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id),
  student_id uuid not null references students(id),
  verification_status text not null check(verification_status in ('verified','revoked')),
  legal_name text not null check(length(btrim(legal_name)) > 0),
  verification_method text not null check(length(btrim(verification_method)) > 0),
  evidence_reference text not null check(length(btrim(evidence_reference)) > 0),
  evidence_sha256 text not null check(evidence_sha256 ~ '^[0-9a-f]{64}$'),
  verified_by uuid not null,
  reason text,
  recorded_at timestamptz not null default now()
);

create index if not exists michigan_identity_current_idx
  on michigan_identity_verification_events(enrollment_id,recorded_at desc);

create or replace view michigan_current_identity_verification with (security_invoker=true) as
select distinct on(enrollment_id)
  id,enrollment_id,student_id,verification_status,legal_name,verification_method,
  evidence_reference,evidence_sha256,verified_by,reason,recorded_at
from michigan_identity_verification_events
order by enrollment_id,recorded_at desc,id desc;

create table if not exists michigan_asynchronous_attestation_events (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id),
  student_id uuid not null references students(id),
  attestation_status text not null check(attestation_status in ('signed','revoked')),
  statement_version text not null check(statement_version='MI-ASYNC-1.0-submission-draft'),
  signed_legal_name text not null check(length(btrim(signed_legal_name)) > 0),
  clock_hours integer not null check(clock_hours=40),
  signature_evidence_sha256 text not null check(signature_evidence_sha256 ~ '^[0-9a-f]{64}$'),
  reason text,
  recorded_at timestamptz not null default now()
);

create index if not exists michigan_attestation_current_idx
  on michigan_asynchronous_attestation_events(enrollment_id,recorded_at desc);

create or replace view michigan_current_asynchronous_attestation with (security_invoker=true) as
select distinct on(enrollment_id)
  id,enrollment_id,student_id,attestation_status,statement_version,
  signed_legal_name,clock_hours,signature_evidence_sha256,reason,recorded_at
from michigan_asynchronous_attestation_events
order by enrollment_id,recorded_at desc,id desc;

-- ---------------------------------------------------------------------------
-- Completion, certificate, and report output records
-- ---------------------------------------------------------------------------

create table if not exists michigan_completion_reports (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  course_version text not null,
  report_version integer not null check(report_version >= 1),
  reporting_channel text not null,
  reporting_format text not null,
  payload jsonb not null,
  payload_sha256 text not null check(payload_sha256 ~ '^[0-9a-f]{64}$'),
  status text not null default 'generated'
    check(status in ('generated','submitted','accepted','rejected','voided')),
  generated_at timestamptz not null default now(),
  submitted_at timestamptz,
  confirmation jsonb not null default '{}'::jsonb,
  unique(enrollment_id,report_version)
);

create table if not exists michigan_completion_certificates (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  course_version text not null,
  certificate_identifier text not null unique,
  completed_at timestamptz not null,
  issued_at timestamptz not null default now(),
  pss_school_number text not null,
  bpl_sponsor_number text not null,
  bpl_course_number text not null,
  identity_event_id uuid not null references michigan_identity_verification_events(id),
  attestation_event_id uuid not null references michigan_asynchronous_attestation_events(id),
  status text not null default 'issued' check(status in ('issued','voided')),
  supersedes_certificate_id uuid references michigan_completion_certificates(id),
  void_reason text
);

create unique index if not exists michigan_completion_certificate_active_idx
  on michigan_completion_certificates(enrollment_id) where status='issued';

-- These records are evidence. Corrections append a new event/version; no caller may
-- rewrite or delete the original submission, review, identity, attestation, authority,
-- configuration, report, or certificate record.
create or replace function michigan_refuse_record_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'michigan_compliance_records_are_append_only';
end $$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'michigan_authority_events',
    'michigan_runtime_configuration_events',
    'michigan_applied_memo_versions',
    'michigan_applied_memo_reviews',
    'michigan_identity_verification_events',
    'michigan_asynchronous_attestation_events'
  ] loop
    execute format('drop trigger if exists %I on %I','append_only_'||table_name,table_name);
    execute format(
      'create trigger %I before update or delete on %I for each row execute function michigan_refuse_record_mutation()',
      'append_only_'||table_name,table_name
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Enrollment initialization and runtime kill switches
-- ---------------------------------------------------------------------------

create or replace function initialize_michigan_enrollment()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_course courses%rowtype; v_version regulatory_course_versions%rowtype;
begin
  if new.course_id <> 'mi-salesperson-prelicensure-40-v1' then return new; end if;
  new.state:='MI';
  new.course_version:='1.0-submission-draft';
  new.started_at:=coalesce(new.started_at,now());
  select * into v_course from courses where id=new.course_id;
  select * into v_version from regulatory_course_versions
    where course_id=new.course_id and version=new.course_version;

  if new.status='qa_non_credit' then
    new.compliance_credit_eligible:=false;
    return new;
  end if;
  if new.status='active' then
    if not v_course.enrollment_enabled
      or v_course.approval_status <> 'approved'
      or v_version.lifecycle_status <> 'approved'
      or not v_version.enrollment_enabled
      or not v_version.regulatory_credit_enabled then
      raise exception 'michigan_enrollment_closed';
    end if;
    perform michigan_require_active_authority(new.course_id,new.course_version);
    if not new.compliance_credit_eligible then
      raise exception 'michigan_active_enrollment_must_be_credit_eligible';
    end if;
  end if;
  return new;
end $$;

create or replace function initialize_michigan_enrollment_records()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.course_id <> 'mi-salesperson-prelicensure-40-v1' then return new; end if;
  insert into student_portal_state(enrollment_id,student_id,course_id,course_version,resume_path)
  values(new.id,new.student_id,new.course_id,new.course_version,
    '/student/course/?enrollment_id='||new.id::text)
  on conflict(enrollment_id) do nothing;
  insert into lms_compliance_state(enrollment_id,required_study_seconds,credited_study_seconds)
  values(new.id,144000,0)
  on conflict(enrollment_id) do nothing;
  insert into lms_assignment_state(
    enrollment_id,student_id,course_id,course_version,assignment_id
  )
  select new.id,new.student_id,new.course_id,new.course_version,assignment_id
  from regulated_course_assignments
  where course_id=new.course_id and course_version=new.course_version
  order by sequence_number
  on conflict(enrollment_id,assignment_id,assignment_version) do nothing;
  insert into lms_assignment_progress(
    enrollment_id,course_id,course_version,assignment_id,assignment_version
  )
  select new.id,new.course_id,new.course_version,assignment_id,'1.0'
  from regulated_course_assignments
  where course_id=new.course_id and course_version=new.course_version
  on conflict(enrollment_id,assignment_id,assignment_version) do nothing;
  return new;
end $$;

drop trigger if exists michigan_enrollment_defaults on enrollments;
create trigger michigan_enrollment_defaults before insert or update of status,compliance_credit_eligible on enrollments
for each row execute function initialize_michigan_enrollment();

drop trigger if exists michigan_enrollment_records on enrollments;
create trigger michigan_enrollment_records after insert on enrollments
for each row execute function initialize_michigan_enrollment_records();

create or replace function michigan_credited_time_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_enrollment enrollments%rowtype;
begin
  select * into v_enrollment from enrollments where id=new.enrollment_id;
  if not found or v_enrollment.course_id <> 'mi-salesperson-prelicensure-40-v1' then return new; end if;
  if new.active_seconds <= 0 then return new; end if;
  if v_enrollment.status <> 'active' or not v_enrollment.compliance_credit_eligible then
    raise exception 'michigan_credited_instruction_refused_noncredit_enrollment';
  end if;
  perform michigan_require_active_authority(v_enrollment.course_id,v_enrollment.course_version);
  return new;
end $$;

drop trigger if exists michigan_credited_time_guard on lms_time_events;
create trigger michigan_credited_time_guard before insert or update of active_seconds on lms_time_events
for each row execute function michigan_credited_time_guard();

create or replace function michigan_instruction_evidence_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_enrollment enrollments%rowtype;
begin
  select * into v_enrollment from enrollments where id=new.enrollment_id;
  if not found or v_enrollment.course_id<>'mi-salesperson-prelicensure-40-v1' then return new; end if;
  -- QA/reviewer evidence is explicitly noncredit and cannot complete under the next
  -- trigger. A real student's section, assessment, or remediation write is credited
  -- instruction and therefore stops at the same authority boundary as time credit.
  if v_enrollment.status='qa_non_credit' and not v_enrollment.compliance_credit_eligible then return new; end if;
  if v_enrollment.status<>'active' or not v_enrollment.compliance_credit_eligible then
    raise exception 'michigan_instruction_evidence_refused_noncredit_enrollment';
  end if;
  perform michigan_require_active_authority(v_enrollment.course_id,v_enrollment.course_version);
  return new;
end $$;

drop trigger if exists michigan_assignment_instruction_guard on lms_assignment_state;
create trigger michigan_assignment_instruction_guard before insert or update on lms_assignment_state
for each row execute function michigan_instruction_evidence_guard();

drop trigger if exists michigan_assessment_instruction_guard on lms_assessment_attempts;
create trigger michigan_assessment_instruction_guard before insert or update on lms_assessment_attempts
for each row execute function michigan_instruction_evidence_guard();

drop trigger if exists michigan_remediation_instruction_guard on lms_remediation_events;
create trigger michigan_remediation_instruction_guard before insert or update on lms_remediation_events
for each row execute function michigan_instruction_evidence_guard();

create or replace function michigan_assignment_completion_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_enrollment enrollments%rowtype; v_memo_ok boolean; v_sections integer;
begin
  if new.status <> 'completed' then return new; end if;
  select * into v_enrollment from enrollments where id=new.enrollment_id;
  if not found or v_enrollment.course_id <> 'mi-salesperson-prelicensure-40-v1' then return new; end if;
  if v_enrollment.status <> 'active' or not v_enrollment.compliance_credit_eligible then
    raise exception 'michigan_module_completion_refused_noncredit_enrollment';
  end if;
  perform michigan_require_active_authority(v_enrollment.course_id,v_enrollment.course_version);
  select count(distinct value::integer) into v_sections
  from jsonb_array_elements_text(coalesce(new.viewed_sections,'[]'::jsonb)) item(value)
  where value ~ '^[1-6]$';
  if v_sections <> 6 then raise exception 'michigan_module_requires_all_six_sections'; end if;
  if new.active_seconds < 14400 then raise exception 'michigan_module_requires_four_active_hours'; end if;
  if not new.applied_exercise_complete then raise exception 'michigan_applied_confirmation_not_complete'; end if;
  if not new.engagement_check_complete then raise exception 'michigan_engagement_check_not_complete'; end if;
  if new.remediation_status not in ('not_required','satisfied') then
    raise exception 'michigan_remediation_not_satisfied';
  end if;
  select exists(
    select 1 from michigan_applied_memo_versions m
    join michigan_applied_memo_reviews r on r.submission_id=m.id
    where m.enrollment_id=new.enrollment_id and m.module_id=new.assignment_id
      and r.outcome='satisfactory'
      and m.submission_version=(
        select max(m2.submission_version) from michigan_applied_memo_versions m2
        where m2.enrollment_id=m.enrollment_id and m2.module_id=m.module_id
      )
  ) into v_memo_ok;
  if not v_memo_ok then raise exception 'michigan_satisfactory_written_memo_required'; end if;
  return new;
end $$;

drop trigger if exists michigan_assignment_completion_guard on lms_assignment_state;
create trigger michigan_assignment_completion_guard before insert or update of status on lms_assignment_state
for each row execute function michigan_assignment_completion_guard();

create or replace function michigan_direct_memo_submission_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_enrollment enrollments%rowtype; v_latest integer; v_outcome text; v_digest text;
begin
  select * into v_enrollment from enrollments where id=new.enrollment_id;
  if not found or v_enrollment.course_id<>'mi-salesperson-prelicensure-40-v1'
    or v_enrollment.student_id<>new.student_id
    or new.course_id<>v_enrollment.course_id
    or new.course_version<>v_enrollment.course_version then
    raise exception 'invalid_michigan_memo_enrollment';
  end if;
  if v_enrollment.status<>'active' or not v_enrollment.compliance_credit_eligible then
    raise exception 'michigan_memo_refused_noncredit_enrollment';
  end if;
  perform michigan_require_active_authority(v_enrollment.course_id,v_enrollment.course_version);
  v_digest:=encode(digest(convert_to(new.response_text,'UTF8'),'sha256'),'hex');
  if new.content_sha256<>v_digest then raise exception 'michigan_memo_digest_mismatch'; end if;
  select max(submission_version) into v_latest from michigan_applied_memo_versions
  where enrollment_id=new.enrollment_id and module_id=new.module_id;
  if new.submission_version<>coalesce(v_latest,0)+1 then
    raise exception 'michigan_memo_version_not_next';
  end if;
  if v_latest is not null then
    select r.outcome into v_outcome from michigan_applied_memo_versions m
    left join michigan_applied_memo_reviews r on r.submission_id=m.id
    where m.enrollment_id=new.enrollment_id and m.module_id=new.module_id
      and m.submission_version=v_latest;
    if v_outcome is null then raise exception 'michigan_memo_review_pending'; end if;
    if v_outcome<>'needs_revision' then raise exception 'michigan_memo_already_satisfactory'; end if;
  end if;
  return new;
end $$;

drop trigger if exists michigan_direct_memo_submission_guard on michigan_applied_memo_versions;
create trigger michigan_direct_memo_submission_guard before insert on michigan_applied_memo_versions
for each row execute function michigan_direct_memo_submission_guard();

create or replace function michigan_direct_memo_review_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare
  v_submission michigan_applied_memo_versions%rowtype;
  v_authority michigan_authority_events%rowtype;
  v_expected_total integer;
  v_expected_outcome text;
  v_key text;
  v_required text[]:=array[
    'law_accuracy','fact_analysis','professional_boundary',
    'action_and_timing','record_and_communication'
  ];
begin
  select * into v_submission from michigan_applied_memo_versions where id=new.submission_id;
  if not found then raise exception 'michigan_memo_submission_not_found'; end if;
  perform michigan_require_active_authority(v_submission.course_id,v_submission.course_version);
  select * into v_authority from michigan_current_authority
  where course_id=v_submission.course_id and course_version=v_submission.course_version
    and authority_kind='instructor';
  if v_authority.id is distinct from new.authority_event_id
    or v_authority.subject_id is distinct from new.reviewer_instructor_id then
    raise exception 'michigan_reviewer_not_current_authorized_instructor';
  end if;
  if jsonb_typeof(new.criterion_scores)<>'object'
    or (select count(*) from jsonb_object_keys(new.criterion_scores))<>5
    or not (new.criterion_scores ?& v_required)
    or jsonb_typeof(new.criterion_feedback)<>'object'
    or (select count(*) from jsonb_object_keys(new.criterion_feedback))<>5
    or not (new.criterion_feedback ?& v_required) then
    raise exception 'michigan_rubric_criteria_mismatch';
  end if;
  foreach v_key in array v_required loop
    if coalesce(new.criterion_scores->>v_key,'') !~ '^[0-2]$'
      or nullif(btrim(new.criterion_feedback->>v_key),'') is null then
      raise exception 'invalid_michigan_rubric_criterion: %',v_key;
    end if;
  end loop;
  select sum((new.criterion_scores->>key)::integer) into v_expected_total
  from unnest(v_required) key;
  v_expected_outcome:=case when v_expected_total>=8
      and (new.criterion_scores->>'law_accuracy')::integer>0
      and (new.criterion_scores->>'professional_boundary')::integer>0
    then 'satisfactory' else 'needs_revision' end;
  if new.total_points<>v_expected_total or new.outcome<>v_expected_outcome then
    raise exception 'michigan_rubric_outcome_must_be_server_derived';
  end if;
  return new;
end $$;

drop trigger if exists michigan_direct_memo_review_guard on michigan_applied_memo_reviews;
create trigger michigan_direct_memo_review_guard before insert on michigan_applied_memo_reviews
for each row execute function michigan_direct_memo_review_guard();

create or replace function michigan_direct_attestation_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare
  v_enrollment enrollments%rowtype;
  v_identity michigan_identity_verification_events%rowtype;
  v_modules integer;
  v_seconds bigint;
begin
  select * into v_enrollment from enrollments where id=new.enrollment_id;
  if not found or v_enrollment.course_id<>'mi-salesperson-prelicensure-40-v1'
    or v_enrollment.student_id<>new.student_id then
    raise exception 'invalid_michigan_attestation_enrollment';
  end if;
  if new.attestation_status='revoked' then return new; end if;
  select * into v_identity from michigan_current_identity_verification
  where enrollment_id=new.enrollment_id;
  if not found or v_identity.verification_status<>'verified'
    or btrim(new.signed_legal_name)<>btrim(v_identity.legal_name) then
    raise exception 'michigan_attestation_requires_matching_identity';
  end if;
  select count(*)::integer,coalesce(sum(active_seconds),0)::bigint into v_modules,v_seconds
  from lms_assignment_state where enrollment_id=new.enrollment_id and status='completed';
  if v_modules<>10 or v_seconds<144000 then
    raise exception 'michigan_attestation_refused_before_coursework_complete';
  end if;
  return new;
end $$;

drop trigger if exists michigan_direct_attestation_guard on michigan_asynchronous_attestation_events;
create trigger michigan_direct_attestation_guard before insert on michigan_asynchronous_attestation_events
for each row execute function michigan_direct_attestation_guard();

-- ---------------------------------------------------------------------------
-- Evidence-writing RPCs
-- ---------------------------------------------------------------------------

create or replace function submit_michigan_applied_memo(
  p_enrollment_id uuid,
  p_student_id uuid,
  p_module_id text,
  p_response_text text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_enrollment enrollments%rowtype;
  v_latest integer;
  v_outcome text;
  v_id uuid;
  v_digest text;
begin
  select * into v_enrollment from enrollments where id=p_enrollment_id for update;
  if not found or v_enrollment.course_id<>'mi-salesperson-prelicensure-40-v1' then
    raise exception 'michigan_enrollment_not_found';
  end if;
  if v_enrollment.student_id<>p_student_id then raise exception 'michigan_course_access_denied'; end if;
  if v_enrollment.status<>'active' or not v_enrollment.compliance_credit_eligible then
    raise exception 'michigan_memo_refused_noncredit_enrollment';
  end if;
  perform michigan_require_active_authority(v_enrollment.course_id,v_enrollment.course_version);
  if p_module_id !~ '^module-(0[1-9]|10)$' then raise exception 'unknown_michigan_module'; end if;
  if length(btrim(coalesce(p_response_text,''))) not between 1 and 100000 then
    raise exception 'invalid_michigan_memo_response';
  end if;
  select max(submission_version) into v_latest from michigan_applied_memo_versions
  where enrollment_id=p_enrollment_id and module_id=p_module_id;
  if v_latest is not null then
    select r.outcome into v_outcome
    from michigan_applied_memo_versions m
    left join michigan_applied_memo_reviews r on r.submission_id=m.id
    where m.enrollment_id=p_enrollment_id and m.module_id=p_module_id
      and m.submission_version=v_latest;
    if v_outcome is null then raise exception 'michigan_memo_review_pending'; end if;
    if v_outcome='satisfactory' then raise exception 'michigan_memo_already_satisfactory'; end if;
  end if;
  v_digest:=encode(digest(convert_to(p_response_text,'UTF8'),'sha256'),'hex');
  insert into michigan_applied_memo_versions(
    enrollment_id,student_id,course_id,course_version,module_id,
    submission_version,response_text,content_sha256
  ) values(
    p_enrollment_id,p_student_id,v_enrollment.course_id,v_enrollment.course_version,
    p_module_id,coalesce(v_latest,0)+1,p_response_text,v_digest
  ) returning id into v_id;
  insert into lms_regulatory_audit(
    actor_id,actor_mode,student_id,enrollment_id,course_id,course_version,
    assignment_id,event_type,detail
  ) values(
    p_student_id,'student',p_student_id,p_enrollment_id,v_enrollment.course_id,
    v_enrollment.course_version,p_module_id,'michigan_memo_submitted',
    jsonb_build_object('submission_id',v_id,'version',coalesce(v_latest,0)+1,
      'content_sha256',v_digest)
  );
  return jsonb_build_object('submission_id',v_id,'module_id',p_module_id,
    'submission_version',coalesce(v_latest,0)+1,'content_sha256',v_digest);
end $$;

create or replace function review_michigan_applied_memo(
  p_submission_id uuid,
  p_reviewer_instructor_id uuid,
  p_scores jsonb,
  p_feedback jsonb
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_submission michigan_applied_memo_versions%rowtype;
  v_authority michigan_authority_events%rowtype;
  v_total integer;
  v_outcome text;
  v_id uuid;
  v_key text;
  v_required text[]:=array[
    'law_accuracy','fact_analysis','professional_boundary',
    'action_and_timing','record_and_communication'
  ];
begin
  select * into v_submission from michigan_applied_memo_versions where id=p_submission_id;
  if not found then raise exception 'michigan_memo_submission_not_found'; end if;
  perform michigan_require_active_authority(v_submission.course_id,v_submission.course_version);
  select * into v_authority from michigan_current_authority
  where course_id=v_submission.course_id and course_version=v_submission.course_version
    and authority_kind='instructor';
  if v_authority.authority_status<>'active'
    or v_authority.subject_id is distinct from p_reviewer_instructor_id
    or (v_authority.effective_at is not null and v_authority.effective_at>now())
    or (v_authority.expires_at is not null and v_authority.expires_at<=now()) then
    raise exception 'michigan_reviewer_not_authorized_instructor';
  end if;
  if exists(select 1 from michigan_applied_memo_reviews where submission_id=p_submission_id) then
    raise exception 'michigan_memo_review_is_immutable';
  end if;
  if jsonb_typeof(p_scores)<>'object'
    or (select count(*) from jsonb_object_keys(p_scores))<>5
    or not (p_scores ?& v_required) then
    raise exception 'michigan_rubric_score_criteria_mismatch';
  end if;
  if jsonb_typeof(p_feedback)<>'object'
    or (select count(*) from jsonb_object_keys(p_feedback))<>5
    or not (p_feedback ?& v_required) then
    raise exception 'michigan_rubric_feedback_criteria_mismatch';
  end if;
  foreach v_key in array v_required loop
    if coalesce(p_scores->>v_key,'') !~ '^[0-2]$' then
      raise exception 'invalid_michigan_rubric_score: %',v_key;
    end if;
    if nullif(btrim(p_feedback->>v_key),'') is null then
      raise exception 'michigan_criterion_feedback_required: %',v_key;
    end if;
  end loop;
  select sum((p_scores->>key)::integer) into v_total from unnest(v_required) key;
  v_outcome:=case when v_total>=8
      and (p_scores->>'law_accuracy')::integer>0
      and (p_scores->>'professional_boundary')::integer>0
    then 'satisfactory' else 'needs_revision' end;
  insert into michigan_applied_memo_reviews(
    submission_id,reviewer_instructor_id,rubric_version,criterion_scores,
    criterion_feedback,total_points,outcome,authority_event_id
  ) values(
    p_submission_id,p_reviewer_instructor_id,'MI-MEMO-1.0-submission-draft',
    p_scores,p_feedback,v_total,v_outcome,v_authority.id
  ) returning id into v_id;
  insert into lms_regulatory_audit(
    actor_id,actor_mode,student_id,enrollment_id,course_id,course_version,
    assignment_id,event_type,detail
  ) values(
    p_reviewer_instructor_id,'admin',v_submission.student_id,v_submission.enrollment_id,
    v_submission.course_id,v_submission.course_version,v_submission.module_id,
    'michigan_memo_reviewed',jsonb_build_object(
      'review_id',v_id,'submission_id',p_submission_id,
      'submission_version',v_submission.submission_version,
      'rubric_version','MI-MEMO-1.0-submission-draft',
      'total_points',v_total,'outcome',v_outcome)
  );
  return jsonb_build_object('review_id',v_id,'total_points',v_total,
    'outcome',v_outcome,'rubric_version','MI-MEMO-1.0-submission-draft');
end $$;

create or replace function record_michigan_identity_verification(
  p_enrollment_id uuid,
  p_student_id uuid,
  p_legal_name text,
  p_method text,
  p_evidence_reference text,
  p_evidence_sha256 text,
  p_verified_by uuid
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_enrollment enrollments%rowtype; v_id uuid;
begin
  select * into v_enrollment from enrollments where id=p_enrollment_id;
  if not found or v_enrollment.course_id<>'mi-salesperson-prelicensure-40-v1'
    or v_enrollment.student_id<>p_student_id then raise exception 'michigan_enrollment_not_found'; end if;
  if nullif(btrim(p_legal_name),'') is null or nullif(btrim(p_method),'') is null
    or nullif(btrim(p_evidence_reference),'') is null
    or coalesce(p_evidence_sha256,'') !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_michigan_identity_evidence';
  end if;
  insert into michigan_identity_verification_events(
    enrollment_id,student_id,verification_status,legal_name,verification_method,
    evidence_reference,evidence_sha256,verified_by
  ) values(
    p_enrollment_id,p_student_id,'verified',p_legal_name,p_method,
    p_evidence_reference,p_evidence_sha256,p_verified_by
  ) returning id into v_id;
  insert into lms_regulatory_audit(
    actor_id,actor_mode,student_id,enrollment_id,course_id,course_version,event_type,detail
  ) values(
    p_verified_by,'admin',p_student_id,p_enrollment_id,v_enrollment.course_id,
    v_enrollment.course_version,'michigan_identity_verified',
    jsonb_build_object('identity_event_id',v_id,'method',p_method,
      'evidence_sha256',p_evidence_sha256)
  );
  return jsonb_build_object('identity_event_id',v_id,'status','verified');
end $$;

create or replace function sign_michigan_asynchronous_attestation(
  p_enrollment_id uuid,
  p_student_id uuid,
  p_signed_legal_name text,
  p_statement_version text,
  p_clock_hours integer,
  p_signature_evidence_sha256 text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_enrollment enrollments%rowtype;
  v_identity michigan_identity_verification_events%rowtype;
  v_modules integer;
  v_seconds bigint;
  v_id uuid;
begin
  select * into v_enrollment from enrollments where id=p_enrollment_id;
  if not found or v_enrollment.course_id<>'mi-salesperson-prelicensure-40-v1'
    or v_enrollment.student_id<>p_student_id then raise exception 'michigan_enrollment_not_found'; end if;
  select * into v_identity from michigan_current_identity_verification
    where enrollment_id=p_enrollment_id;
  if not found or v_identity.verification_status<>'verified' then
    raise exception 'michigan_identity_verification_required';
  end if;
  if btrim(p_signed_legal_name)<>btrim(v_identity.legal_name) then
    raise exception 'michigan_attestation_identity_name_mismatch';
  end if;
  select count(*)::integer,coalesce(sum(active_seconds),0)::bigint into v_modules,v_seconds
  from lms_assignment_state where enrollment_id=p_enrollment_id and status='completed';
  if v_modules<>10 or v_seconds<144000 then
    raise exception 'michigan_attestation_refused_before_coursework_complete';
  end if;
  if p_statement_version<>'MI-ASYNC-1.0-submission-draft' or p_clock_hours<>40
    or coalesce(p_signature_evidence_sha256,'') !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_michigan_asynchronous_attestation';
  end if;
  insert into michigan_asynchronous_attestation_events(
    enrollment_id,student_id,attestation_status,statement_version,
    signed_legal_name,clock_hours,signature_evidence_sha256
  ) values(
    p_enrollment_id,p_student_id,'signed',p_statement_version,
    p_signed_legal_name,p_clock_hours,p_signature_evidence_sha256
  ) returning id into v_id;
  insert into lms_regulatory_audit(
    actor_id,actor_mode,student_id,enrollment_id,course_id,course_version,event_type,detail
  ) values(
    p_student_id,'student',p_student_id,p_enrollment_id,v_enrollment.course_id,
    v_enrollment.course_version,'michigan_asynchronous_attestation_signed',
    jsonb_build_object('attestation_event_id',v_id,'statement_version',p_statement_version,
      'clock_hours',p_clock_hours,'signature_evidence_sha256',p_signature_evidence_sha256)
  );
  return jsonb_build_object('attestation_event_id',v_id,'status','signed');
end $$;

-- ---------------------------------------------------------------------------
-- One gate summary and the output RPCs that consume it
-- ---------------------------------------------------------------------------

create or replace function michigan_operational_status(p_enrollment_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare
  v_enrollment enrollments%rowtype;
  v_authority jsonb;
  v_modules integer:=0;
  v_seconds bigint:=0;
  v_identity michigan_identity_verification_events%rowtype;
  v_attestation michigan_asynchronous_attestation_events%rowtype;
  v_runtime michigan_runtime_configuration_events%rowtype;
  v_reasons jsonb:='[]'::jsonb;
  v_completion boolean:=false;
begin
  select * into v_enrollment from enrollments where id=p_enrollment_id;
  if not found or v_enrollment.course_id<>'mi-salesperson-prelicensure-40-v1' then
    raise exception 'michigan_enrollment_not_found';
  end if;
  v_authority:=michigan_authority_summary(v_enrollment.course_id,v_enrollment.course_version,now());
  if not coalesce((v_authority->>'active')::boolean,false) then
    v_reasons:=v_reasons||(v_authority->'reasons');
  end if;
  if v_enrollment.status<>'active' then v_reasons:=v_reasons||'"active_enrollment_required"'::jsonb; end if;
  if not v_enrollment.compliance_credit_eligible then v_reasons:=v_reasons||'"credit_eligible_enrollment_required"'::jsonb; end if;
  if v_enrollment.review_role is not null then v_reasons:=v_reasons||'"review_enrollment_cannot_complete"'::jsonb; end if;
  select count(*)::integer,coalesce(sum(active_seconds),0)::bigint into v_modules,v_seconds
  from lms_assignment_state where enrollment_id=p_enrollment_id and status='completed';
  if v_modules<>10 then v_reasons:=v_reasons||'"all_ten_modules_required"'::jsonb; end if;
  if v_seconds<144000 then v_reasons:=v_reasons||'"forty_credited_clock_hours_required"'::jsonb; end if;
  select * into v_identity from michigan_current_identity_verification where enrollment_id=p_enrollment_id;
  if not found or v_identity.verification_status<>'verified' then
    v_reasons:=v_reasons||'"active_identity_verification_required"'::jsonb;
  end if;
  select * into v_attestation from michigan_current_asynchronous_attestation where enrollment_id=p_enrollment_id;
  if not found or v_attestation.attestation_status<>'signed' then
    v_reasons:=v_reasons||'"signed_asynchronous_attestation_required"'::jsonb;
  elsif found and v_identity.id is not null and btrim(v_attestation.signed_legal_name)<>btrim(v_identity.legal_name) then
    v_reasons:=v_reasons||'"attestation_identity_name_mismatch"'::jsonb;
  end if;
  select * into v_runtime from michigan_current_runtime_configuration
  where course_id=v_enrollment.course_id and course_version=v_enrollment.course_version;
  v_completion:=jsonb_array_length(v_reasons)=0;
  return jsonb_build_object(
    'enrollment_id',v_enrollment.id,
    'student_id',v_enrollment.student_id,
    'course_id',v_enrollment.course_id,
    'course_version',v_enrollment.course_version,
    'completion_eligible',v_completion,
    'completed_modules',v_modules,
    'credited_seconds',v_seconds,
    'credited_clock_hours',case when v_modules=10 and v_seconds>=144000 then 40 else 0 end,
    'civil_rights_clock_hours',case when exists(
      select 1 from lms_assignment_state where enrollment_id=p_enrollment_id
      and assignment_id='module-07' and status='completed') then 4 else 0 end,
    'identity_verified',v_identity.id is not null and v_identity.verification_status='verified',
    'attestation_signed',v_attestation.id is not null and v_attestation.attestation_status='signed',
    'authority',v_authority,
    'reasons',v_reasons,
    'certificate_identifiers_confirmed',coalesce(v_runtime.identifier_requirements_confirmed,false),
    'reporting_requirements_confirmed',coalesce(v_runtime.reporting_requirements_confirmed,false),
    'certificate_eligible',v_completion
      and coalesce(v_runtime.identifier_requirements_confirmed,false)
      and exists(select 1 from course_completion_events
        where enrollment_id=p_enrollment_id and completion_status='complete'),
    'completion_report_eligible',v_completion
      and coalesce(v_runtime.identifier_requirements_confirmed,false)
      and coalesce(v_runtime.reporting_requirements_confirmed,false)
      and exists(select 1 from course_completion_events
        where enrollment_id=p_enrollment_id and completion_status='complete')
  );
end $$;

create or replace function michigan_direct_certificate_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare
  v_gate jsonb;
  v_runtime michigan_runtime_configuration_events%rowtype;
  v_identity michigan_identity_verification_events%rowtype;
  v_attestation michigan_asynchronous_attestation_events%rowtype;
begin
  if new.course_id<>'mi-salesperson-prelicensure-40-v1' or new.status='voided' then return new; end if;
  v_gate:=michigan_operational_status(new.enrollment_id);
  if not coalesce((v_gate->>'certificate_eligible')::boolean,false) then
    raise exception 'michigan_direct_certificate_refused: %',v_gate;
  end if;
  select * into v_runtime from michigan_current_runtime_configuration
  where course_id=new.course_id and course_version=new.course_version;
  select * into v_identity from michigan_current_identity_verification where enrollment_id=new.enrollment_id;
  select * into v_attestation from michigan_current_asynchronous_attestation where enrollment_id=new.enrollment_id;
  if new.pss_school_number<>v_runtime.pss_school_number
    or new.bpl_sponsor_number<>v_runtime.bpl_sponsor_number
    or new.bpl_course_number<>v_runtime.bpl_course_number
    or new.identity_event_id is distinct from v_identity.id
    or new.attestation_event_id is distinct from v_attestation.id then
    raise exception 'michigan_certificate_snapshot_mismatch';
  end if;
  return new;
end $$;

drop trigger if exists michigan_direct_certificate_guard on michigan_completion_certificates;
create trigger michigan_direct_certificate_guard before insert or update on michigan_completion_certificates
for each row execute function michigan_direct_certificate_guard();

create or replace function michigan_direct_report_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_gate jsonb; v_runtime michigan_runtime_configuration_events%rowtype; v_digest text;
begin
  if new.course_id<>'mi-salesperson-prelicensure-40-v1' or new.status='voided' then return new; end if;
  v_gate:=michigan_operational_status(new.enrollment_id);
  if not coalesce((v_gate->>'completion_report_eligible')::boolean,false) then
    raise exception 'michigan_direct_completion_report_refused: %',v_gate;
  end if;
  select * into v_runtime from michigan_current_runtime_configuration
  where course_id=new.course_id and course_version=new.course_version;
  v_digest:=encode(digest(convert_to(new.payload::text,'UTF8'),'sha256'),'hex');
  if new.reporting_channel<>v_runtime.reporting_channel
    or new.reporting_format<>v_runtime.reporting_format
    or new.payload_sha256<>v_digest then
    raise exception 'michigan_completion_report_snapshot_mismatch';
  end if;
  return new;
end $$;

drop trigger if exists michigan_direct_report_guard on michigan_completion_reports;
create trigger michigan_direct_report_guard before insert or update on michigan_completion_reports
for each row execute function michigan_direct_report_guard();

create or replace function record_michigan_completion(p_enrollment_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_gate jsonb; v_enrollment enrollments%rowtype; v_id uuid;
begin
  select * into v_enrollment from enrollments where id=p_enrollment_id for update;
  if not found or v_enrollment.course_id<>'mi-salesperson-prelicensure-40-v1' then
    raise exception 'michigan_enrollment_not_found';
  end if;
  v_gate:=michigan_operational_status(p_enrollment_id);
  if not coalesce((v_gate->>'completion_eligible')::boolean,false) then
    raise exception 'michigan_completion_refused: %',v_gate->'reasons';
  end if;
  insert into course_completion_events(
    enrollment_id,course_id,completed_at,credited_study_seconds,completion_status,detail
  ) values(
    p_enrollment_id,v_enrollment.course_id,now(),144000,'complete',
    jsonb_build_object('gate_snapshot',v_gate,'course_version',v_enrollment.course_version,
      'clock_hours',40,'civil_rights_clock_hours',4)
  ) on conflict(enrollment_id) do update set
    detail=course_completion_events.detail
  returning id into v_id;
  update enrollments set completed_at=coalesce(completed_at,now()),updated_at=now()
  where id=p_enrollment_id;
  return jsonb_build_object('completion_event_id',v_id,'status','complete','gate_snapshot',v_gate);
end $$;

create or replace function issue_michigan_completion_certificate(p_enrollment_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_gate jsonb;
  v_enrollment enrollments%rowtype;
  v_completion course_completion_events%rowtype;
  v_runtime michigan_runtime_configuration_events%rowtype;
  v_identity michigan_identity_verification_events%rowtype;
  v_attestation michigan_asynchronous_attestation_events%rowtype;
  v_existing michigan_completion_certificates%rowtype;
  v_identifier text;
  v_id uuid;
begin
  select * into v_enrollment from enrollments where id=p_enrollment_id;
  if not found or v_enrollment.course_id<>'mi-salesperson-prelicensure-40-v1' then raise exception 'michigan_enrollment_not_found'; end if;
  v_gate:=michigan_operational_status(p_enrollment_id);
  if not coalesce((v_gate->>'certificate_eligible')::boolean,false) then
    raise exception 'michigan_certificate_refused: %',v_gate;
  end if;
  select * into v_completion from course_completion_events
    where enrollment_id=p_enrollment_id and completion_status='complete';
  select * into v_runtime from michigan_current_runtime_configuration
    where course_id=v_enrollment.course_id and course_version=v_enrollment.course_version;
  if not v_runtime.identifier_requirements_confirmed
    or nullif(btrim(v_runtime.pss_school_number),'') is null
    or nullif(btrim(v_runtime.bpl_sponsor_number),'') is null
    or nullif(btrim(v_runtime.bpl_course_number),'') is null then
    raise exception 'michigan_certificate_identifier_requirements_unresolved';
  end if;
  select * into v_existing from michigan_completion_certificates
    where enrollment_id=p_enrollment_id and status='issued';
  if found then return jsonb_build_object('certificate_id',v_existing.id,
    'certificate_identifier',v_existing.certificate_identifier,'already_issued',true); end if;
  select * into v_identity from michigan_current_identity_verification where enrollment_id=p_enrollment_id;
  select * into v_attestation from michigan_current_asynchronous_attestation where enrollment_id=p_enrollment_id;
  v_identifier:='MI-'||upper(substr(replace(p_enrollment_id::text,'-',''),1,12))
    ||'-'||to_char(v_completion.completed_at,'YYYYMMDD');
  insert into michigan_completion_certificates(
    enrollment_id,student_id,course_id,course_version,certificate_identifier,
    completed_at,pss_school_number,bpl_sponsor_number,bpl_course_number,
    identity_event_id,attestation_event_id
  ) values(
    p_enrollment_id,v_enrollment.student_id,v_enrollment.course_id,v_enrollment.course_version,
    v_identifier,v_completion.completed_at,v_runtime.pss_school_number,
    v_runtime.bpl_sponsor_number,v_runtime.bpl_course_number,v_identity.id,v_attestation.id
  ) returning id into v_id;
  insert into lms_regulatory_audit(
    actor_id,actor_mode,student_id,enrollment_id,course_id,course_version,event_type,detail
  ) values(
    v_enrollment.student_id,'system',v_enrollment.student_id,p_enrollment_id,
    v_enrollment.course_id,v_enrollment.course_version,'michigan_certificate_issued',
    jsonb_build_object('certificate_id',v_id,'certificate_identifier',v_identifier,
      'pss_school_number',v_runtime.pss_school_number,
      'bpl_sponsor_number',v_runtime.bpl_sponsor_number,
      'bpl_course_number',v_runtime.bpl_course_number)
  );
  return jsonb_build_object('certificate_id',v_id,'certificate_identifier',v_identifier,
    'already_issued',false);
end $$;

create or replace function build_michigan_completion_report(p_enrollment_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_gate jsonb;
  v_enrollment enrollments%rowtype;
  v_completion course_completion_events%rowtype;
  v_runtime michigan_runtime_configuration_events%rowtype;
  v_identity michigan_identity_verification_events%rowtype;
  v_attestation michigan_asynchronous_attestation_events%rowtype;
  v_payload jsonb;
  v_digest text;
  v_version integer;
  v_id uuid;
begin
  select * into v_enrollment from enrollments where id=p_enrollment_id;
  if not found or v_enrollment.course_id<>'mi-salesperson-prelicensure-40-v1' then raise exception 'michigan_enrollment_not_found'; end if;
  v_gate:=michigan_operational_status(p_enrollment_id);
  if not coalesce((v_gate->>'completion_report_eligible')::boolean,false) then
    raise exception 'michigan_completion_report_refused: %',v_gate;
  end if;
  select * into v_completion from course_completion_events
    where enrollment_id=p_enrollment_id and completion_status='complete';
  select * into v_runtime from michigan_current_runtime_configuration
    where course_id=v_enrollment.course_id and course_version=v_enrollment.course_version;
  if not v_runtime.reporting_requirements_confirmed
    or not v_runtime.identifier_requirements_confirmed
    or nullif(btrim(v_runtime.pss_school_number),'') is null
    or nullif(btrim(v_runtime.bpl_sponsor_number),'') is null
    or nullif(btrim(v_runtime.bpl_course_number),'') is null
    or nullif(btrim(v_runtime.reporting_channel),'') is null
    or nullif(btrim(v_runtime.reporting_format),'') is null then
    raise exception 'michigan_reporting_requirements_unresolved';
  end if;
  select * into v_identity from michigan_current_identity_verification where enrollment_id=p_enrollment_id;
  select * into v_attestation from michigan_current_asynchronous_attestation where enrollment_id=p_enrollment_id;
  select coalesce(max(report_version),0)+1 into v_version from michigan_completion_reports
    where enrollment_id=p_enrollment_id;
  v_payload:=jsonb_build_object(
    'student_id',v_enrollment.student_id,
    'enrollment_id',v_enrollment.id,
    'course_id',v_enrollment.course_id,
    'course_version',v_enrollment.course_version,
    'completed_at',v_completion.completed_at,
    'clock_hours',40,
    'civil_rights_clock_hours',4,
    'identity_event_id',v_identity.id,
    'attestation_event_id',v_attestation.id,
    'pss_school_number',v_runtime.pss_school_number,
    'bpl_sponsor_number',v_runtime.bpl_sponsor_number,
    'bpl_course_number',v_runtime.bpl_course_number
  );
  v_digest:=encode(digest(convert_to(v_payload::text,'UTF8'),'sha256'),'hex');
  insert into michigan_completion_reports(
    enrollment_id,student_id,course_id,course_version,report_version,
    reporting_channel,reporting_format,payload,payload_sha256
  ) values(
    p_enrollment_id,v_enrollment.student_id,v_enrollment.course_id,v_enrollment.course_version,
    v_version,v_runtime.reporting_channel,v_runtime.reporting_format,v_payload,v_digest
  ) returning id into v_id;
  insert into lms_regulatory_audit(
    actor_id,actor_mode,student_id,enrollment_id,course_id,course_version,event_type,detail
  ) values(
    v_enrollment.student_id,'system',v_enrollment.student_id,p_enrollment_id,
    v_enrollment.course_id,v_enrollment.course_version,'michigan_completion_report_generated',
    jsonb_build_object('report_id',v_id,'report_version',v_version,
      'payload_sha256',v_digest,'reporting_channel',v_runtime.reporting_channel,
      'reporting_format',v_runtime.reporting_format)
  );
  return jsonb_build_object('report_id',v_id,'report_version',v_version,
    'payload_sha256',v_digest,'status','generated');
end $$;

-- Direct writes cannot route around the gate functions.
create or replace function michigan_direct_completion_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_enrollment enrollments%rowtype; v_gate jsonb;
begin
  select * into v_enrollment from enrollments where id=new.enrollment_id;
  if not found or v_enrollment.course_id<>'mi-salesperson-prelicensure-40-v1' then return new; end if;
  if new.completion_status<>'complete' then return new; end if;
  v_gate:=michigan_operational_status(new.enrollment_id);
  if not coalesce((v_gate->>'completion_eligible')::boolean,false) then
    raise exception 'michigan_direct_completion_refused: %',v_gate->'reasons';
  end if;
  if new.credited_study_seconds<>144000 then
    raise exception 'michigan_completion_must_record_exactly_40_hours';
  end if;
  return new;
end $$;

drop trigger if exists michigan_direct_completion_guard on course_completion_events;
create trigger michigan_direct_completion_guard before insert or update on course_completion_events
for each row execute function michigan_direct_completion_guard();

-- Administrative append functions. The endpoint that calls these requires the
-- StateCourse admin token; evidence is mandatory so an activation cannot be a naked flag.
create or replace function record_michigan_authority_event(
  p_authority_kind text,
  p_authority_status text,
  p_identifier text,
  p_subject_id uuid,
  p_effective_at timestamptz,
  p_expires_at timestamptz,
  p_evidence jsonb,
  p_recorded_by uuid
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
  if p_authority_kind not in ('school','program','course','instructor','surety')
    or p_authority_status not in ('pending','active','suspended','expired','revoked','rejected') then
    raise exception 'invalid_michigan_authority_event';
  end if;
  if p_authority_status='active' and nullif(btrim(p_identifier),'') is null then
    raise exception 'michigan_active_authority_identifier_required';
  end if;
  if p_authority_status='active' and p_authority_kind='instructor' and p_subject_id is null then
    raise exception 'michigan_active_instructor_subject_required';
  end if;
  if p_authority_status='active' and (p_evidence is null or p_evidence='{}'::jsonb) then
    raise exception 'michigan_active_authority_evidence_required';
  end if;
  if p_authority_status='active' and p_recorded_by is null then
    raise exception 'michigan_active_authority_recorder_required';
  end if;
  insert into michigan_authority_events(
    course_id,course_version,authority_kind,authority_status,identifier,
    subject_id,effective_at,expires_at,evidence,recorded_by
  ) values(
    'mi-salesperson-prelicensure-40-v1','1.0-submission-draft',p_authority_kind,
    p_authority_status,p_identifier,p_subject_id,p_effective_at,p_expires_at,
    coalesce(p_evidence,'{}'::jsonb),p_recorded_by
  ) returning id into v_id;
  return jsonb_build_object('authority_event_id',v_id,'authority_kind',p_authority_kind,
    'authority_status',p_authority_status,
    'current_gate',michigan_authority_summary());
end $$;

create or replace function record_michigan_runtime_configuration(
  p_identifier_requirements_confirmed boolean,
  p_pss_school_number text,
  p_bpl_sponsor_number text,
  p_bpl_course_number text,
  p_reporting_requirements_confirmed boolean,
  p_reporting_channel text,
  p_reporting_format text,
  p_evidence jsonb,
  p_recorded_by uuid
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
  if coalesce(p_evidence,'{}'::jsonb)='{}'::jsonb then
    raise exception 'michigan_runtime_configuration_evidence_required';
  end if;
  if p_recorded_by is null then
    raise exception 'michigan_runtime_configuration_recorder_required';
  end if;
  insert into michigan_runtime_configuration_events(
    course_id,course_version,identifier_requirements_confirmed,
    pss_school_number,bpl_sponsor_number,bpl_course_number,
    reporting_requirements_confirmed,reporting_channel,reporting_format,
    evidence,recorded_by
  ) values(
    'mi-salesperson-prelicensure-40-v1','1.0-submission-draft',
    p_identifier_requirements_confirmed,p_pss_school_number,p_bpl_sponsor_number,
    p_bpl_course_number,p_reporting_requirements_confirmed,p_reporting_channel,
    p_reporting_format,p_evidence,p_recorded_by
  ) returning id into v_id;
  return jsonb_build_object('configuration_event_id',v_id,
    'identifier_requirements_confirmed',p_identifier_requirements_confirmed,
    'reporting_requirements_confirmed',p_reporting_requirements_confirmed);
end $$;

alter table michigan_authority_events enable row level security;
alter table michigan_runtime_configuration_events enable row level security;
alter table michigan_applied_memo_versions enable row level security;
alter table michigan_applied_memo_reviews enable row level security;
alter table michigan_identity_verification_events enable row level security;
alter table michigan_asynchronous_attestation_events enable row level security;
alter table michigan_completion_reports enable row level security;
alter table michigan_completion_certificates enable row level security;

revoke all on michigan_authority_events,michigan_runtime_configuration_events,
  michigan_applied_memo_versions,michigan_applied_memo_reviews,
  michigan_identity_verification_events,michigan_asynchronous_attestation_events,
  michigan_completion_reports,michigan_completion_certificates
from anon,authenticated;

grant select on michigan_applied_memo_versions,michigan_applied_memo_reviews,
  michigan_identity_verification_events,michigan_asynchronous_attestation_events,
  michigan_completion_reports,michigan_completion_certificates
to authenticated;

commit;
