begin;

-- Production free-training runtime. No approval, checkout, exam, certificate or credit is enabled.
-- The generated definition comes from the existing Law of Agency modules and questions.
do $seed$
declare d jsonb := '{"revision":"tx-training-v1","courseId":"tx-law-of-agency-30-v1","courseVersion":"1.0","modules":[{"id":"module-01","sequence":1,"title":"Agency Concepts","expectedMinutes":130,"contentPath":"/content/texas/tx-law-of-agency-30-v1/module-01.md","sectionCount":4,"requiredBlocks":[{"id":"t01u1","screens":["t01u1-s1","t01u1-s2"],"questions":[{"screenId":"t01u1-s3","primary":"t01u1-q1","replacement":"t01u1-q1-replacement"}]},{"id":"t01u2","screens":["t01u2-s1","t01u2-s2"],"questions":[{"screenId":"t01u2-s3","primary":"t01u2-q1","replacement":"t01u2-q1-replacement"}]},{"id":"t01u3","screens":["t01u3-s1","t01u3-s2","t01u3-s3"],"questions":[{"screenId":"t01u3-s4","primary":"t01u3-q1","replacement":"t01u3-q1-replacement"}]},{"id":"t01u4","screens":["t01u4-s1"],"questions":[{"screenId":"t01u4-s2","primary":"t01u4-q1","replacement":"t01u4-q1-replacement"}]},{"id":"t1-recap","screens":["t1-recap-s1"],"questions":[]}]},{"id":"module-02","sequence":2,"title":"Basic Agency Relationships, Disclosure and Duties to the Client","expectedMinutes":125,"contentPath":"/content/texas/tx-law-of-agency-30-v1/module-02.md","sectionCount":5,"requiredBlocks":[{"id":"t02u1","screens":["t02u1-s1"],"questions":[{"screenId":"t02u1-s2","primary":"t02u1-q1","replacement":"t02u1-q1-replacement"}]},{"id":"t02u2","screens":["t02u2-s1","t02u2-s2"],"questions":[{"screenId":"t02u2-s3","primary":"t02u2-q1","replacement":"t02u2-q1-replacement"}]},{"id":"t02u3","screens":["t02u3-s1"],"questions":[{"screenId":"t02u3-s2","primary":"t02u3-q1","replacement":"t02u3-q1-replacement"}]},{"id":"t02u4","screens":["t02u4-s1","t02u4-s2","t02u4-s3"],"questions":[{"screenId":"t02u4-s4","primary":"t02u4-q1","replacement":"t02u4-q1-replacement"}]},{"id":"t02u5","screens":["t02u5-s1","t02u5-s2"],"questions":[{"screenId":"t02u5-s3","primary":"t02u5-q1","replacement":"t02u5-q1-replacement"}]},{"id":"t2-recap","screens":["t2-recap-s1"],"questions":[]}]},{"id":"module-03","sequence":3,"title":"Duties and Disclosures to Third Parties","expectedMinutes":125,"contentPath":"/content/texas/tx-law-of-agency-30-v1/module-03.md","sectionCount":6,"requiredBlocks":[{"id":"t03u1","screens":["t03u1-s1"],"questions":[{"screenId":"t03u1-s2","primary":"t03u1-q1","replacement":"t03u1-q1-replacement"}]},{"id":"t03u2","screens":["t03u2-s1"],"questions":[{"screenId":"t03u2-s2","primary":"t03u2-q1","replacement":"t03u2-q1-replacement"}]},{"id":"t03u3","screens":["t03u3-s1","t03u3-s2"],"questions":[{"screenId":"t03u3-s3","primary":"t03u3-q1","replacement":"t03u3-q1-replacement"}]},{"id":"t03u4","screens":["t03u4-s1","t03u4-s2"],"questions":[{"screenId":"t03u4-s3","primary":"t03u4-q1","replacement":"t03u4-q1-replacement"}]},{"id":"t03u5","screens":["t03u5-s1","t03u5-s2"],"questions":[{"screenId":"t03u5-s3","primary":"t03u5-q1","replacement":"t03u5-q1-replacement"}]},{"id":"t03u6","screens":["t03u6-s1"],"questions":[{"screenId":"t03u6-s2","primary":"t03u6-q1","replacement":"t03u6-q1-replacement"}]},{"id":"t3-recap","screens":["t3-recap-s1"],"questions":[]}]},{"id":"module-04","sequence":4,"title":"Seller Agency","expectedMinutes":120,"contentPath":"/content/texas/tx-law-of-agency-30-v1/module-04.md","sectionCount":5,"requiredBlocks":[{"id":"t04u1","screens":["t04u1-s1","t04u1-s2","t04u1-s3"],"questions":[{"screenId":"t04u1-s4","primary":"t04u1-q1","replacement":"t04u1-q1-replacement"}]},{"id":"t04u2","screens":["t04u2-s1","t04u2-s2"],"questions":[{"screenId":"t04u2-s3","primary":"t04u2-q1","replacement":"t04u2-q1-replacement"}]},{"id":"t04u3","screens":["t04u3-s1"],"questions":[{"screenId":"t04u3-s2","primary":"t04u3-q1","replacement":"t04u3-q1-replacement"}]},{"id":"t04u4","screens":["t04u4-s1","t04u4-s2"],"questions":[{"screenId":"t04u4-s3","primary":"t04u4-q1","replacement":"t04u4-q1-replacement"}]},{"id":"t04u5","screens":["t04u5-s1"],"questions":[{"screenId":"t04u5-s2","primary":"t04u5-q1","replacement":"t04u5-q1-replacement"}]},{"id":"t4-recap","screens":["t4-recap-s1"],"questions":[]}]},{"id":"module-05","sequence":5,"title":"Buyer Agency","expectedMinutes":150,"contentPath":"/content/texas/tx-law-of-agency-30-v1/module-05.md","sectionCount":6,"requiredBlocks":[{"id":"t05u1","screens":["t05u1-s1","t05u1-s2"],"questions":[{"screenId":"t05u1-s3","primary":"t05u1-q1","replacement":"t05u1-q1-replacement"}]},{"id":"t05u2","screens":["t05u2-s1","t05u2-s2"],"questions":[{"screenId":"t05u2-s3","primary":"t05u2-q1","replacement":"t05u2-q1-replacement"}]},{"id":"t05u3","screens":["t05u3-s1","t05u3-s2"],"questions":[{"screenId":"t05u3-s3","primary":"t05u3-q1","replacement":"t05u3-q1-replacement"}]},{"id":"t05u4","screens":["t05u4-s1"],"questions":[{"screenId":"t05u4-s2","primary":"t05u4-q1","replacement":"t05u4-q1-replacement"}]},{"id":"t05u5","screens":["t05u5-s1","t05u5-s2"],"questions":[{"screenId":"t05u5-s3","primary":"t05u5-q1","replacement":"t05u5-q1-replacement"}]},{"id":"t05u6","screens":["t05u6-s1","t05u6-s2"],"questions":[{"screenId":"t05u6-s3","primary":"t05u6-q1","replacement":"t05u6-q1-replacement"}]},{"id":"t5-recap","screens":["t5-recap-s1"],"questions":[]}]},{"id":"module-06","sequence":6,"title":"Representing More Than One Party in a Transaction: Intermediary Brokerage","expectedMinutes":165,"contentPath":"/content/texas/tx-law-of-agency-30-v1/module-06.md","sectionCount":5,"requiredBlocks":[{"id":"t06u1","screens":["t06u1-s1","t06u1-s2"],"questions":[{"screenId":"t06u1-s3","primary":"t06u1-q1","replacement":"t06u1-q1-replacement"}]},{"id":"t06u2","screens":["t06u2-s1","t06u2-s2"],"questions":[{"screenId":"t06u2-s3","primary":"t06u2-q1","replacement":"t06u2-q1-replacement"}]},{"id":"t06u3","screens":["t06u3-s1","t06u3-s2"],"questions":[{"screenId":"t06u3-s3","primary":"t06u3-q1","replacement":"t06u3-q1-replacement"}]},{"id":"t06u4","screens":["t06u4-s1","t06u4-s2"],"questions":[{"screenId":"t06u4-s3","primary":"t06u4-q1","replacement":"t06u4-q1-replacement"}]},{"id":"t06u5","screens":["t06u5-s1","t06u5-s2"],"questions":[{"screenId":"t06u5-s3","primary":"t06u5-q1","replacement":"t06u5-q1-replacement"}]},{"id":"t6-recap","screens":["t6-recap-s1"],"questions":[]}]},{"id":"module-07","sequence":7,"title":"Creation and Termination of Agency","expectedMinutes":85,"contentPath":"/content/texas/tx-law-of-agency-30-v1/module-07.md","sectionCount":3,"requiredBlocks":[{"id":"t07u1","screens":["t07u1-s1"],"questions":[{"screenId":"t07u1-s2","primary":"t07u1-q1","replacement":"t07u1-q1-replacement"}]},{"id":"t07u2","screens":["t07u2-s1","t07u2-s2"],"questions":[{"screenId":"t07u2-s3","primary":"t07u2-q1","replacement":"t07u2-q1-replacement"}]},{"id":"t07u3","screens":["t07u3-s1","t07u3-s2"],"questions":[{"screenId":"t07u3-s3","primary":"t07u3-q1","replacement":"t07u3-q1-replacement"}]},{"id":"t7-recap","screens":["t7-recap-s1"],"questions":[]}]},{"id":"module-08","sequence":8,"title":"Clarifying Agency Relationships","expectedMinutes":45,"contentPath":"/content/texas/tx-law-of-agency-30-v1/module-08.md","sectionCount":2,"requiredBlocks":[{"id":"t08u1","screens":["t08u1-s1","t08u1-s2"],"questions":[{"screenId":"t08u1-s3","primary":"t08u1-q1","replacement":"t08u1-q1-replacement"},{"screenId":"t08u1-retrieval-t08u1-q2","primary":"t08u1-q2","replacement":"t08u1-q2-replacement"}]},{"id":"t08u2","screens":["t08u2-s1","t08u2-s2"],"questions":[{"screenId":"t08u2-s3","primary":"t08u2-q1","replacement":"t08u2-q1-replacement"}]},{"id":"t8-recap","screens":["t8-recap-s1"],"questions":[]}]},{"id":"module-09","sequence":9,"title":"Employment Issues","expectedMinutes":120,"contentPath":"/content/texas/tx-law-of-agency-30-v1/module-09.md","sectionCount":6,"requiredBlocks":[{"id":"t09u1","screens":["t09u1-s1"],"questions":[{"screenId":"t09u1-s2","primary":"t09u1-q1","replacement":"t09u1-q1-replacement"}]},{"id":"t09u2","screens":["t09u2-s1"],"questions":[{"screenId":"t09u2-s2","primary":"t09u2-q1","replacement":"t09u2-q1-replacement"}]},{"id":"t09u3","screens":["t09u3-s1"],"questions":[{"screenId":"t09u3-s2","primary":"t09u3-q1","replacement":"t09u3-q1-replacement"}]},{"id":"t09u4","screens":["t09u4-s1","t09u4-s2"],"questions":[{"screenId":"t09u4-s3","primary":"t09u4-q1","replacement":"t09u4-q1-replacement"}]},{"id":"t09u5","screens":["t09u5-s1","t09u5-s2"],"questions":[{"screenId":"t09u5-s3","primary":"t09u5-q1","replacement":"t09u5-q1-replacement"}]},{"id":"t09u6","screens":["t09u6-s1","t09u6-s2"],"questions":[{"screenId":"t09u6-s3","primary":"t09u6-q1","replacement":"t09u6-q1-replacement"}]},{"id":"t9-recap","screens":["t9-recap-s1"],"questions":[]}]},{"id":"module-10","sequence":10,"title":"Agency, Ethics and the Law","expectedMinutes":155,"contentPath":"/content/texas/tx-law-of-agency-30-v1/module-10.md","sectionCount":5,"requiredBlocks":[{"id":"t10u1","screens":["t10u1-s1","t10u1-s2"],"questions":[{"screenId":"t10u1-s3","primary":"t10u1-q1","replacement":"t10u1-q1-replacement"}]},{"id":"t10u2","screens":["t10u2-s1","t10u2-s2"],"questions":[{"screenId":"t10u2-s3","primary":"t10u2-q1","replacement":"t10u2-q1-replacement"}]},{"id":"t10u3","screens":["t10u3-s1","t10u3-s2"],"questions":[{"screenId":"t10u3-s3","primary":"t10u3-q1","replacement":"t10u3-q1-replacement"}]},{"id":"t10u4","screens":["t10u4-s1","t10u4-s2"],"questions":[{"screenId":"t10u4-s3","primary":"t10u4-q1","replacement":"t10u4-q1-replacement"}]},{"id":"t10u5","screens":["t10u5-s1"],"questions":[{"screenId":"t10u5-s2","primary":"t10u5-q1","replacement":"t10u5-q1-replacement"}]},{"id":"t10-recap","screens":["t10-recap-s1"],"questions":[]}]},{"id":"module-11","sequence":11,"title":"Deceptive Trade Practices and Consumer Protection Act","expectedMinutes":140,"contentPath":"/content/texas/tx-law-of-agency-30-v1/module-11.md","sectionCount":5,"requiredBlocks":[{"id":"t11u1","screens":["t11u1-s1","t11u1-s2"],"questions":[{"screenId":"t11u1-s3","primary":"t11u1-q1","replacement":"t11u1-q1-replacement"}]},{"id":"t11u2","screens":["t11u2-s1","t11u2-s2"],"questions":[{"screenId":"t11u2-s3","primary":"t11u2-q1","replacement":"t11u2-q1-replacement"}]},{"id":"t11u3","screens":["t11u3-s1","t11u3-s2"],"questions":[{"screenId":"t11u3-s3","primary":"t11u3-q1","replacement":"t11u3-q1-replacement"}]},{"id":"t11u4","screens":["t11u4-s1","t11u4-s2"],"questions":[{"screenId":"t11u4-s3","primary":"t11u4-q1","replacement":"t11u4-q1-replacement"}]},{"id":"t11u5","screens":["t11u5-s1"],"questions":[{"screenId":"t11u5-s2","primary":"t11u5-q1","replacement":"t11u5-q1-replacement"}]},{"id":"t11-recap","screens":["t11-recap-s1"],"questions":[]}]},{"id":"module-12","sequence":12,"title":"Implementation and Presentation","expectedMinutes":140,"contentPath":"/content/texas/tx-law-of-agency-30-v1/module-12.md","sectionCount":5,"requiredBlocks":[{"id":"t12u1","screens":["t12u1-s1","t12u1-s2"],"questions":[{"screenId":"t12u1-s3","primary":"t12u1-q1","replacement":"t12u1-q1-replacement"}]},{"id":"t12u2","screens":["t12u2-s1"],"questions":[{"screenId":"t12u2-s2","primary":"t12u2-q1","replacement":"t12u2-q1-replacement"}]},{"id":"t12u3","screens":["t12u3-s1","t12u3-s2"],"questions":[{"screenId":"t12u3-s3","primary":"t12u3-q1","replacement":"t12u3-q1-replacement"}]},{"id":"t12u4","screens":["t12u4-s1","t12u4-s2"],"questions":[{"screenId":"t12u4-s3","primary":"t12u4-q1","replacement":"t12u4-q1-replacement"}]},{"id":"t12u5","screens":["t12u5-s1","t12u5-s2"],"questions":[{"screenId":"t12u5-s3","primary":"t12u5-q1","replacement":"t12u5-q1-replacement"}]},{"id":"t12-recap","screens":["t12-recap-s1"],"questions":[]}]}]}'::jsonb; m jsonb;
begin
  if not exists(select 1 from courses where id=d->>'courseId' and state='TX') then
    raise exception 'texas_course_registration_required';
  end if;
  insert into regulatory_course_versions(course_id,version,lifecycle_status,required_hours,enrollment_enabled,regulatory_credit_enabled,configuration)
  values(d->>'courseId',d->>'courseVersion','development',30,false,false,jsonb_build_object('training_runtime',d->>'revision'))
  on conflict(course_id,version) do nothing;
  for m in select value from jsonb_array_elements(d->'modules') loop
    insert into regulated_course_assignments(course_id,course_version,assignment_id,sequence_number,title,expected_minutes,required_section_count,content_path,configuration)
    values(d->>'courseId',d->>'courseVersion',m->>'id',(m->>'sequence')::integer,m->>'title',(m->>'expectedMinutes')::integer,(m->>'sectionCount')::integer,m->>'contentPath',
      jsonb_build_object('runtime_revision',d->>'revision','required_blocks',m->'requiredBlocks'))
    on conflict(course_id,course_version,assignment_id) do nothing;
  end loop;
end $seed$;

create or replace function training_runtime_definition(p_course_id text)
returns jsonb language sql stable security definer set search_path=public as $$
  select jsonb_build_object('revision',case when bool_and(configuration->>'runtime_revision'='tx-training-v1') then 'tx-training-v1' else 'mismatch' end,
    'courseId',p_course_id,'courseVersion','1.0','modules',jsonb_agg(jsonb_build_object(
      'id',assignment_id,'sequence',sequence_number,'title',title,'expectedMinutes',expected_minutes,
      'contentPath',content_path,'sectionCount',required_section_count,'requiredBlocks',configuration->'required_blocks') order by sequence_number))
  from regulated_course_assignments where course_id=p_course_id and course_version='1.0' and p_course_id='tx-law-of-agency-30-v1';
$$;

create or replace function initialize_training_runtime(p_enrollment_id uuid,p_actor_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare e enrollments%rowtype; d jsonb;
begin
  select * into e from enrollments where id=p_enrollment_id for update;
  if not found or p_actor_id is null or e.student_id<>p_actor_id then raise exception 'course_access_denied';end if;
  if e.course_id<>'tx-law-of-agency-30-v1' or e.state<>'TX' or e.course_version<>'1.0'
    or e.enrollment_origin<>'training' or e.compliance_credit_eligible then raise exception 'noncredit_training_required';end if;
  if e.status<>'active' or (e.expires_at is not null and e.expires_at<=now()) then raise exception 'training_access_inactive';end if;
  if not exists(select 1 from access_grants where enrollment_id=e.id and student_id=e.student_id and course_id=e.course_id and status='active') then raise exception 'training_access_revoked';end if;
  d:=training_runtime_definition(e.course_id);
  if d->>'revision'<>'tx-training-v1' or coalesce(jsonb_array_length(d->'modules'),0)<>12 then raise exception 'training_runtime_unavailable';end if;
  insert into lms_assignment_state(enrollment_id,student_id,course_id,course_version,assignment_id)
    select e.id,e.student_id,e.course_id,e.course_version,assignment_id from regulated_course_assignments where course_id=e.course_id and course_version=e.course_version
    on conflict(enrollment_id,assignment_id,assignment_version) do nothing;
  insert into lms_assignment_progress(enrollment_id,course_id,course_version,assignment_id,assignment_version)
    select e.id,e.course_id,e.course_version,assignment_id,'1.0' from regulated_course_assignments where course_id=e.course_id and course_version=e.course_version
    on conflict(enrollment_id,assignment_id,assignment_version) do nothing;
  insert into lms_compliance_state(enrollment_id,required_study_seconds)
    select e.id,sum(expected_minutes)*60 from regulated_course_assignments where course_id=e.course_id and course_version=e.course_version
    on conflict(enrollment_id) do update set required_study_seconds=excluded.required_study_seconds;
  insert into student_portal_state(enrollment_id,student_id,course_id,course_version,last_lesson_id,resume_path)
    values(e.id,e.student_id,e.course_id,e.course_version,'module-01','/student/course/blocks/?enrollment_id='||e.id||'&assignment=module-01')
    on conflict(enrollment_id) do nothing;
end $$;

create or replace function training_block_evidence(p_enrollment_id uuid,p_assignment_id text,p_block_id text,p_completed_screens jsonb)
returns boolean language plpgsql stable security definer set search_path=public as $$
declare e enrollments%rowtype; b jsonb; q jsonb; good boolean;
begin
  select * into e from enrollments where id=p_enrollment_id;
  if not found or e.course_id<>'tx-law-of-agency-30-v1' or e.state<>'TX' or e.enrollment_origin<>'training' or e.compliance_credit_eligible then return false;end if;
  select item into b from regulated_course_assignments a cross join lateral jsonb_array_elements(a.configuration->'required_blocks') item
    where a.course_id=e.course_id and a.course_version=e.course_version and a.assignment_id=p_assignment_id and item->>'id'=p_block_id;
  if b is null or jsonb_typeof(p_completed_screens)<>'array' or not coalesce(p_completed_screens @> (b->'screens'),false) then return false;end if;
  for q in select value from jsonb_array_elements(b->'questions') loop
    select exists(select 1 from lms_block_assessment_attempts t where t.enrollment_id=e.id and t.course_id=e.course_id and t.course_version=e.course_version and t.assignment_id=p_assignment_id and t.block_id=p_block_id and t.question_id=q->>'primary' and t.kind='retrieval' and t.correct is true) into good;
    if not good then
      select exists(select 1 from lms_block_assessment_attempts t where t.enrollment_id=e.id and t.course_id=e.course_id and t.course_version=e.course_version and t.assignment_id=p_assignment_id and t.block_id=p_block_id and t.question_id=q->>'primary' and t.kind='retrieval' and t.correct is false)
        and exists(select 1 from lms_block_assessment_attempts t where t.enrollment_id=e.id and t.course_id=e.course_id and t.course_version=e.course_version and t.assignment_id=p_assignment_id and t.block_id=p_block_id and t.screen_id=q->>'screenId' and t.kind='remediation_review')
        and exists(select 1 from lms_block_assessment_attempts t where t.enrollment_id=e.id and t.course_id=e.course_id and t.course_version=e.course_version and t.assignment_id=p_assignment_id and t.block_id=p_block_id and t.question_id=q->>'replacement' and t.kind='replacement' and t.correct is true) into good;
    end if;
    if not good then return false;end if;
  end loop;
  return true;
end $$;

-- Extend the existing mastery guard only for registered Texas training definitions.
-- California retains its existing assessment and participatory evidence requirements.
create or replace function lms_block_mastery_guard() returns trigger language plpgsql set search_path=public as $$
declare has_retrieval boolean; regulatory_ok boolean;
begin
  if new.status<>'MASTERED' then return new;end if;
  if new.course_id='tx-law-of-agency-30-v1' then
    if not training_block_evidence(new.enrollment_id,new.assignment_id,new.block_id,new.completed_screens) then
      raise exception 'texas_block_evidence_incomplete';
    end if;
    return new;
  end if;
  if new.block_id like '%-b7' then
    select (a.applied_exercise_complete and a.engagement_check_complete and a.remediation_status in ('not_required','satisfied')) into regulatory_ok
      from lms_assignment_state a where a.enrollment_id=new.enrollment_id and a.assignment_id=new.assignment_id limit 1;
    if not coalesce(regulatory_ok,false) then raise exception 'block % cannot be MASTERED: the regulatory assignment evidence is not complete',new.block_id;end if;
    return new;
  end if;
  select exists(select 1 from lms_block_assessment_attempts t where t.enrollment_id=new.enrollment_id and t.assignment_id=new.assignment_id and t.block_id=new.block_id and t.kind in ('retrieval','replacement') and t.correct is true) into has_retrieval;
  if not has_retrieval then raise exception 'block % cannot be MASTERED without correct retrieval evidence',new.block_id;end if;
  return new;
end $$;

create or replace function record_training_heartbeat(p_session_id uuid,p_enrollment_id uuid,p_actor_id uuid,p_assignment_id text,p_active boolean,p_metadata jsonb default '{}'::jsonb)
returns integer language plpgsql security definer set search_path=public as $$
declare e enrollments%rowtype; s lms_active_sessions%rowtype; a regulated_course_assignments%rowtype;
  elapsed integer:=0; credit integer:=0; last_credit timestamptz;
begin
  perform initialize_training_runtime(p_enrollment_id,p_actor_id);
  select * into e from enrollments where id=p_enrollment_id;
  select * into a from regulated_course_assignments where course_id=e.course_id and course_version=e.course_version and assignment_id=p_assignment_id;
  if not found then raise exception 'invalid_assignment';end if;
  if exists(select 1 from regulated_course_assignments prior left join lms_assignment_state progress on progress.enrollment_id=e.id and progress.assignment_id=prior.assignment_id and progress.assignment_version='1.0'
    where prior.course_id=e.course_id and prior.course_version=e.course_version and prior.sequence_number<a.sequence_number and progress.status is distinct from 'completed') then raise exception 'assignment_locked';end if;
  select * into s from lms_active_sessions where id=p_session_id for update;
  if not found then
    insert into lms_active_sessions(id,enrollment_id,student_id,course_id,course_version,assignment_id,mode,device_metadata)
      values(p_session_id,e.id,e.student_id,e.course_id,e.course_version,p_assignment_id,'student',p_metadata);
  else
    if s.enrollment_id<>e.id or s.student_id<>p_actor_id or s.assignment_id<>p_assignment_id or s.mode<>'student' or s.ended_at is not null then raise exception 'training_session_mismatch';end if;
    elapsed:=greatest(0,floor(extract(epoch from now()-s.last_heartbeat_at))::integer);
    select max(server_received_at) into last_credit from lms_time_events where enrollment_id=e.id and event_type='engagement' and detail->>'runtime'='tx-training-v1';
    if p_active and elapsed between 1 and 90 then
      credit:=least(elapsed,30,greatest(0,floor(extract(epoch from now()-coalesce(last_credit,s.last_heartbeat_at)))::integer));
    end if;
    update lms_active_sessions set last_heartbeat_at=now(),active_seconds=active_seconds+credit,inactive_seconds=inactive_seconds+greatest(0,least(elapsed,90)-credit),device_metadata=p_metadata where id=p_session_id;
    if credit>0 then
      update lms_assignment_state set active_seconds=active_seconds+credit,status=case when status='not_started' then 'in_progress' else status end,started_at=coalesce(started_at,now()),updated_at=now() where enrollment_id=e.id and assignment_id=p_assignment_id and assignment_version='1.0';
      update lms_compliance_state set credited_study_seconds=credited_study_seconds+credit,updated_at=now() where enrollment_id=e.id;
      insert into lms_time_events(enrollment_id,course_id,module_id,event_type,active_seconds,detail) values(e.id,e.course_id,p_assignment_id,'engagement',credit,coalesce(p_metadata,'{}'::jsonb)||'{"runtime":"tx-training-v1","regulatory_credit":false}'::jsonb);
    end if;
  end if;
  insert into lms_regulatory_audit(actor_id,actor_mode,student_id,enrollment_id,course_id,course_version,assignment_id,event_type,session_id,detail)
    values(p_actor_id,'student',e.student_id,e.id,e.course_id,e.course_version,p_assignment_id,'training_heartbeat',p_session_id,jsonb_build_object('active_seconds',credit,'regulatory_credit',false));
  return credit;
end $$;

create or replace function complete_training_module(p_enrollment_id uuid,p_actor_id uuid,p_assignment_id text)
returns boolean language plpgsql security definer set search_path=public as $$
declare e enrollments%rowtype; a regulated_course_assignments%rowtype; b jsonb; p lms_block_progress%rowtype; next_id text;
begin
  perform initialize_training_runtime(p_enrollment_id,p_actor_id);
  select * into e from enrollments where id=p_enrollment_id;
  select * into a from regulated_course_assignments where course_id=e.course_id and course_version=e.course_version and assignment_id=p_assignment_id;
  if not found then raise exception 'invalid_assignment';end if;
  if exists(select 1 from regulated_course_assignments prior left join lms_assignment_state progress on progress.enrollment_id=e.id and progress.assignment_id=prior.assignment_id and progress.assignment_version='1.0'
    where prior.course_id=e.course_id and prior.course_version=e.course_version and prior.sequence_number<a.sequence_number and progress.status is distinct from 'completed') then raise exception 'assignment_locked';end if;
  if not exists(select 1 from lms_assignment_state where enrollment_id=e.id and assignment_id=p_assignment_id and assignment_version='1.0' and active_seconds>=a.expected_minutes*60) then return false;end if;
  for b in select value from jsonb_array_elements(a.configuration->'required_blocks') loop
    select * into p from lms_block_progress where enrollment_id=e.id and assignment_id=p_assignment_id and block_id=b->>'id';
    if not found or p.status<>'MASTERED' or not training_block_evidence(e.id,p_assignment_id,b->>'id',p.completed_screens) then return false;end if;
  end loop;
  if exists(select 1 from lms_assignment_state where enrollment_id=e.id and assignment_id=p_assignment_id and assignment_version='1.0' and status='completed') then return true;end if;
  update lms_assignment_state set status='completed',completed_at=now(),updated_at=now() where enrollment_id=e.id and assignment_id=p_assignment_id and assignment_version='1.0';
  update lms_assignment_progress set status='completed',quiz_mastery_percent=100,completed_at=now(),updated_at=now() where enrollment_id=e.id and assignment_id=p_assignment_id and assignment_version='1.0';
  select assignment_id into next_id from regulated_course_assignments where course_id=e.course_id and course_version=e.course_version and sequence_number>a.sequence_number order by sequence_number limit 1;
  update student_portal_state set last_lesson_id=coalesce(next_id,p_assignment_id),resume_path='/student/course/blocks/?enrollment_id='||e.id||'&assignment='||coalesce(next_id,p_assignment_id),last_activity_at=now(),updated_at=now() where enrollment_id=e.id;
  insert into lms_regulatory_audit(actor_id,actor_mode,student_id,enrollment_id,course_id,course_version,assignment_id,event_type,detail)
    values(p_actor_id,'student',e.student_id,e.id,e.course_id,e.course_version,p_assignment_id,'training_module_completed','{"regulatory_credit":false,"requirements":["recorded_screens","retrieval_and_remediation","module_study_time"]}'::jsonb);
  return true;
end $$;

revoke all on function training_runtime_definition(text),initialize_training_runtime(uuid,uuid),training_block_evidence(uuid,text,text,jsonb),record_training_heartbeat(uuid,uuid,uuid,text,boolean,jsonb),complete_training_module(uuid,uuid,text) from public,anon,authenticated;
grant execute on function training_runtime_definition(text),initialize_training_runtime(uuid,uuid),training_block_evidence(uuid,text,text,jsonb),record_training_heartbeat(uuid,uuid,uuid,text,boolean,jsonb),complete_training_module(uuid,uuid,text) to service_role;

commit;
