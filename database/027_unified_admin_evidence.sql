-- Additive operational evidence and course-scoped review administration.
-- Apply only after production approval. Does not approve or activate any course.
begin;
create table console_evidence_events (
 id uuid primary key default gen_random_uuid(),
 event_order bigint generated always as identity unique,
 course_id text not null references courses(id),
 course_version text not null,
 area text not null check(area in ('regulatory','commerce','media')),
 evidence_key text not null check(length(evidence_key) between 1 and 160),
 status text not null check(status in ('verified','missing','rejected','not_applicable')),
 reference text not null,
 note text not null check(length(trim(note)) between 10 and 5000),
 authority text,
 approval_number text,
 metadata jsonb not null default '{}'::jsonb,
 effective_at timestamptz,
 expires_at timestamptz,
 recorded_by uuid not null,
 recorded_at timestamptz not null default clock_timestamp(),
 check(expires_at is null or effective_at is null or expires_at>effective_at)
);
create table console_review_findings (
 id uuid primary key default gen_random_uuid(),
 event_order bigint generated always as identity unique,
 course_id text not null references courses(id),
 course_version text not null,
 enrollment_id uuid not null references enrollments(id),
 finding_key uuid not null,
 content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),
 status text not null check(status in ('open','resolved','signed_off','reopened')),
 note text not null check(length(trim(note)) between 10 and 5000),
 reference text not null,
 recorded_by uuid not null,
 recorded_at timestamptz not null default clock_timestamp()
);
create index on console_evidence_events(course_id,course_version,area,evidence_key,recorded_at desc);
create index on console_review_findings(course_id,course_version,finding_key,recorded_at desc);
create trigger immutable_console_evidence before update or delete on console_evidence_events for each row execute function console_immutable();
create trigger immutable_console_findings before update or delete on console_review_findings for each row execute function console_immutable();
alter table console_evidence_events enable row level security;
alter table console_review_findings enable row level security;
revoke all on console_evidence_events,console_review_findings from public,anon,authenticated;
grant select,insert on console_evidence_events,console_review_findings to service_role;
grant usage,select on sequence console_evidence_events_event_order_seq,console_review_findings_event_order_seq to service_role;

-- Repair legacy CA review provisioning to use the existing review enrollment origin
-- instead of its invalid zero-dollar checkout. No payment is manufactured.
create or replace function provision_california_review_enrollment(
  p_student_id uuid,
  p_course_id text,
  p_review_role text
) returns uuid language plpgsql security definer set search_path=public as $$
declare
  v_enrollment uuid;
begin
  if p_course_id not in ('ca-real-estate-principles-45','ca-real-estate-practice-45','ca-mortgage-loan-brokering-lending-45') then raise exception 'california_review_course_required';end if;
  if p_review_role not in ('student_reviewer','regulator_reviewer') then
    raise exception 'unknown_review_role';
  end if;
  if not exists(select 1 from students where id=p_student_id) then raise exception 'student_not_found'; end if;

  select e.id into v_enrollment from enrollments e
    where e.student_id=p_student_id and e.course_id=p_course_id and e.review_role=p_review_role
    order by e.created_at desc limit 1;
  if v_enrollment is not null then
    perform refresh_california_eligibility(v_enrollment);
    return v_enrollment;
  end if;

  insert into enrollments(
    student_id,course_id,state,status,compliance_credit_eligible,enrollment_origin,
    course_version,started_at,expires_at,review_role
  ) values(
    p_student_id,p_course_id,'CA','qa_non_credit',false,'review',
    '1.0',now(),now()+interval '365 days',p_review_role
  ) returning id into v_enrollment;

  insert into access_grants(enrollment_id,student_id,course_id,status)
  values(v_enrollment,p_student_id,p_course_id,'active');
  insert into lms_compliance_state(enrollment_id,required_study_seconds,credited_study_seconds)
  values(v_enrollment,162000,0);
  insert into student_portal_state(enrollment_id,student_id,course_id,course_version,resume_path)
  values(v_enrollment,p_student_id,p_course_id,'1.0','/student-course.html?enrollment_id='||v_enrollment::text)
  on conflict(enrollment_id) do nothing;
  insert into final_exam_authorizations(enrollment_id,student_id,course_id,course_version)
  values(v_enrollment,p_student_id,p_course_id,'1.0')
  on conflict(enrollment_id) do nothing;
  insert into lms_assignment_state(enrollment_id,student_id,course_id,course_version,assignment_id)
  select v_enrollment,p_student_id,p_course_id,'1.0',assignment_id
  from regulated_course_assignments where course_id=p_course_id and course_version='1.0'
  order by sequence_number
  on conflict(enrollment_id,assignment_id,assignment_version) do nothing;
  insert into lms_assignment_progress(enrollment_id,course_id,course_version,assignment_id,assignment_version)
  select v_enrollment,p_course_id,'1.0',assignment_id,'1.0'
  from regulated_course_assignments where course_id=p_course_id and course_version='1.0'
  on conflict(enrollment_id,assignment_id,assignment_version) do nothing;

  /* The regulator's account is the one that reaches everything at once. The student
     reviewer gets no grant, because a student reviewer with reviewer access would be
     a student reviewer in name only. */
  if p_review_role = 'regulator_reviewer' then
    insert into course_review_access(user_id,course_id,access_role,active)
    values(p_student_id,p_course_id,'regulator_reviewer',true)
    on conflict(user_id,course_id,access_role) do update set active=true, expires_at=null;
  end if;

  perform refresh_california_eligibility(v_enrollment);
  return v_enrollment;
end $$;

-- Reuse discipline-specific review provisioning. Never convert a paid/training identity.
create function console_review_access(p_actor uuid,p_student uuid,p_course text,p_version text,p_role text,p_expires timestamptz,p_action text,p_enrollment uuid default null)
returns uuid language plpgsql set search_path=public as $$
declare c courses; e enrollments; result uuid;
begin
 if not exists(select 1 from current_staff_actor_bindings where auth_user_id=p_actor and actor_role='owner'
  and scope_state is null and binding_status='active' and (effective_at is null or effective_at<=clock_timestamp())
  and (expires_at is null or expires_at>clock_timestamp())) then raise exception 'unscoped_owner_required';end if;
 if p_action not in ('create','revoke','expiry') then raise exception 'invalid_review_action';end if;
 perform pg_advisory_xact_lock(hashtextextended('console-review:'||p_student::text||':'||p_course,0));
 select * into c from courses where id=p_course for share;
 if not found or (p_action='create' and c.current_version<>p_version) then raise exception 'course_version_changed';end if;
 if p_action<>'revoke' and (p_expires is null or p_expires<=clock_timestamp() or p_expires>clock_timestamp()+interval '365 days') then raise exception 'review_expiry_required';end if;
 if p_action='create' then
  if p_role not in ('regulator_reviewer','student_reviewer') or p_student=p_actor then raise exception 'dedicated_reviewer_required';end if;
  if not exists(select 1 from students s join auth.users u on u.id=s.id where s.id=p_student and s.account_status='active') then raise exception 'existing_active_account_required';end if;
  if exists(select 1 from current_staff_actor_bindings where auth_user_id=p_student and binding_status='active'
   and (expires_at is null or expires_at>clock_timestamp())) then raise exception 'dedicated_reviewer_required';end if;
  if exists(select 1 from enrollments where student_id=p_student and (course_id=p_course or review_role is null)) then raise exception 'existing_enrollment_requires_inspection';end if;
  if c.state='CA' and p_course in ('ca-real-estate-principles-45','ca-real-estate-practice-45','ca-mortgage-loan-brokering-lending-45') and p_version='1.0' then
   result:=provision_california_review_enrollment(p_student,p_course,p_role);
   update enrollments set expires_at=p_expires where id=result;
   update course_review_access set expires_at=p_expires where user_id=p_student and course_id=p_course and access_role=p_role;
  elsif p_course='nmls-ce-2026-comprehensive-8' and p_version='2026.3' then
   insert into enrollments(student_id,course_id,state,status,compliance_credit_eligible,course_version,enrollment_origin,review_role,expires_at)
    values(p_student,p_course,'US','active',false,p_version,'training',p_role,p_expires) returning id into result;
   insert into access_grants(enrollment_id,student_id,course_id,status) values(result,p_student,p_course,'active');
   insert into nmls_training_attempts(enrollment_id,student_id,course_id,course_version) values(result,p_student,p_course,p_version);
   insert into student_portal_state(enrollment_id,student_id,course_id,course_version,resume_path)
    values(result,p_student,p_course,p_version,'/student/nmls-training/?enrollment_id='||result);
   perform nmls_training_context(p_student,result,null);
  else raise exception 'course_review_runtime_not_supported';end if;
 else
  select * into e from enrollments where id=p_enrollment for update;
  if not found or e.student_id<>p_student or e.course_id<>p_course or e.course_version<>p_version
   or e.review_role is null or e.compliance_credit_eligible then raise exception 'review_scope_mismatch';end if;
  result:=e.id;
  if p_action='revoke' then
   update access_grants set status='revoked' where enrollment_id=e.id;
   update enrollments set status='cancelled',expires_at=clock_timestamp() where id=e.id;
   update course_review_access set active=false where user_id=e.student_id and course_id=e.course_id and access_role=e.review_role;
  else
   if e.status not in ('active','qa_non_credit') or e.expires_at<=clock_timestamp()
    or not exists(select 1 from access_grants where enrollment_id=e.id and status='active') then raise exception 'cannot_reopen_review_access';end if;
   update enrollments set expires_at=p_expires where id=e.id;
   update course_review_access set expires_at=p_expires where user_id=e.student_id and course_id=e.course_id and access_role=e.review_role;
  end if;
 end if;
 insert into admin_console_actions(auth_user_id,actor_role,action,subject,detail)
 values(p_actor,'owner','review.access.'||p_action,result::text,jsonb_build_object('course_id',p_course,'course_version',p_version,'student_id',p_student,'expires_at',p_expires));
 return result;
end $$;
revoke all on function console_review_access(uuid,uuid,text,text,text,timestamptz,text,uuid) from public,anon,authenticated;
grant execute on function console_review_access(uuid,uuid,text,text,text,timestamptz,text,uuid) to service_role;
create function console_record_review_finding(p_course text,p_version text,p_enrollment uuid,p_key uuid,p_hash text,p_status text,p_note text,p_reference text,p_actor uuid)
returns jsonb language plpgsql set search_path=public as $$
declare e enrollments; prior console_review_findings; result console_review_findings;
begin
 if not exists(select 1 from current_staff_actor_bindings where auth_user_id=p_actor and actor_role='owner' and scope_state is null
  and binding_status='active' and (effective_at is null or effective_at<=clock_timestamp()) and (expires_at is null or expires_at>clock_timestamp())) then raise exception 'unscoped_owner_required';end if;
 perform pg_advisory_xact_lock(hashtextextended('console-finding:'||p_key::text,0));
 select * into e from enrollments where id=p_enrollment for share;
 if not found or e.course_id<>p_course or e.course_version<>p_version or e.review_role is null or e.compliance_credit_eligible then raise exception 'review_scope_mismatch';end if;
 select * into prior from console_review_findings where finding_key=p_key order by event_order desc limit 1;
 if prior.id is null and p_status<>'open' then raise exception 'finding_not_found';end if;
 if prior.id is not null then
  if (prior.course_id,prior.course_version,prior.enrollment_id,prior.content_hash) is distinct from (p_course,p_version,p_enrollment,p_hash) then raise exception 'finding_scope_changed';end if;
  if p_status='open' or (p_status='signed_off' and prior.status<>'resolved') or (p_status='resolved' and prior.status not in ('open','reopened')) then raise exception 'finding_transition_conflict';end if;
 end if;
 if p_status='signed_off' and (e.status not in ('active','qa_non_credit') or e.expires_at is null or e.expires_at<=clock_timestamp()
  or not exists(select 1 from access_grants where enrollment_id=e.id and status='active')) then raise exception 'active_review_required';end if;
 insert into console_review_findings(course_id,course_version,enrollment_id,finding_key,content_hash,status,note,reference,recorded_by)
 values(p_course,p_version,p_enrollment,p_key,p_hash,p_status,p_note,p_reference,p_actor) returning * into result;
 return to_jsonb(result);
end $$;
revoke all on function console_record_review_finding(text,text,uuid,uuid,text,text,text,text,uuid) from public,anon,authenticated;
grant execute on function console_record_review_finding(text,text,uuid,uuid,text,text,text,text,uuid) to service_role;

commit;
