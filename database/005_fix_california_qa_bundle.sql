-- StateCourse California QA bundle hotfix
-- Resolves PL/pgSQL ambiguity between the function's output fields and
-- identically named table columns. Safe to run after 004_california_prelicense.sql.

begin;

create or replace function create_qa_california_bundle(p_student_id uuid)
returns table(course_id text,enrollment_id uuid)
language plpgsql
security definer
set search_path=public
as $$
#variable_conflict use_column
declare
  v_course text;
  v_attempt uuid;
  v_enrollment uuid;
begin
  if not exists(select 1 from students where id=p_student_id) then
    raise exception 'student_not_found';
  end if;

  foreach v_course in array array[
    'ca-real-estate-principles-45',
    'ca-real-estate-practice-45',
    'ca-mortgage-loan-brokering-lending-45'
  ] loop
    select e.id into v_enrollment
    from enrollments e
    where e.student_id=p_student_id
      and e.course_id=v_course
      and e.status in ('active','qa_non_credit')
    order by e.created_at desc
    limit 1;

    if v_enrollment is null then
      v_attempt:=gen_random_uuid();

      insert into checkout_attempts(
        id,student_id,course_id,state,stripe_mode,amount,currency,status,
        regulatory_acknowledgment_version,terms_version,refund_policy_version,
        cancellation_policy_version,qa_only
      ) values(
        v_attempt,p_student_id,v_course,'CA','test',1,'usd','qa_manual',
        'ca-draft-qa','ca-draft-qa','ca-draft-qa','ca-draft-qa',true
      );

      insert into enrollments(
        student_id,course_id,state,status,compliance_credit_eligible,
        checkout_attempt_id,course_version,started_at,expires_at
      ) values(
        p_student_id,v_course,'CA','qa_non_credit',false,
        v_attempt,'1.0',now(),now()+interval '365 days'
      ) returning id into v_enrollment;

      insert into access_grants(enrollment_id,student_id,course_id,status)
      values(v_enrollment,p_student_id,v_course,'active');

      insert into lms_compliance_state(
        enrollment_id,required_study_seconds,credited_study_seconds
      ) values(v_enrollment,162000,0);

      insert into student_portal_state(
        enrollment_id,student_id,course_id,course_version,resume_path
      ) values(
        v_enrollment,p_student_id,v_course,'1.0',
        '/student/course/?enrollment_id='||v_enrollment::text
      ) on conflict(enrollment_id) do nothing;

      insert into final_exam_authorizations(
        enrollment_id,student_id,course_id,course_version
      ) values(v_enrollment,p_student_id,v_course,'1.0')
      on conflict(enrollment_id) do nothing;

      insert into lms_assignment_state(
        enrollment_id,student_id,course_id,course_version,assignment_id
      )
      select v_enrollment,p_student_id,v_course,'1.0',assignment_id
      from regulated_course_assignments
      where course_id=v_course and course_version='1.0'
      order by sequence_number
      on conflict(enrollment_id,assignment_id,assignment_version) do nothing;

      insert into lms_assignment_progress(
        enrollment_id,course_id,course_version,assignment_id,assignment_version
      )
      select v_enrollment,v_course,'1.0',assignment_id,'1.0'
      from regulated_course_assignments
      where course_id=v_course and course_version='1.0'
      on conflict(enrollment_id,assignment_id,assignment_version) do nothing;
    end if;

    perform refresh_california_eligibility(v_enrollment);
    course_id:=v_course;
    enrollment_id:=v_enrollment;
    return next;
    v_enrollment:=null;
  end loop;
end
$$;

revoke all on function create_qa_california_bundle(uuid) from public,anon,authenticated;
grant execute on function create_qa_california_bundle(uuid) to service_role;

commit;
