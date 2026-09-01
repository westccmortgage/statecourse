-- 007 California final examination administration
--
-- The examination banks, the scoring engine, and the eligibility gate all exist. What
-- did not exist is the administration itself: the record that a proctor verified the
-- student's photo identification immediately before the examination, the timed session
-- the student sits, the responses, the score, and the completion event that a passing
-- score produces. Without those, a student who satisfied every requirement had nothing
-- to sit, and a course could never be completed.
--
-- Rules taken from RE 303 and Article 24, with the citation on each:
--
--   * Photo identification is presented immediately before administration of the final
--     examination for a correspondence offering, and RE 303 names exactly two accepted
--     forms: a Vehicle Code s13000 identification card or any valid government photo
--     identification, or current photo identification from a recognized real estate
--     trade organization issued within the preceding five years.
--   * The examination is proctored; the student never administers their own.
--   * One hundred questions, sixty percent to pass, and a single retake that must use a
--     different form. A third attempt does not exist.
--   * The final examination is never furnished to the student. No function here returns
--     an item, a choice, a correct answer, or a rationale; scoring happens in the
--     application from a key that stays on the server, and only the outcome is stored.
--
-- Two values here are NOT regulator-fixed and are marked PROVIDER-SET where they
-- appear. They are proposals that the Department may accept, reject, or change on
-- review, and they are recorded on every session so that what actually governed a given
-- attempt is auditable rather than inferred from today's constant:
--
--   * the 180-minute time limit (RE 306 items 19-20 ask the provider to state it);
--   * the 60-minute freshness window for the identity check, which is this build's
--     reading of "immediately before" - the regulation gives no number.
--
-- Payment appears nowhere in this file. Sitting the examination, passing it, completing
-- the course, and earning a certificate are determined by instructional and regulatory
-- facts alone.

begin;

-- ---------------------------------------------------------------------------
-- 1. The proctor, and the identification check performed before the exam
-- ---------------------------------------------------------------------------

/* The proctor is a person the school designates and who certifies, by name, what they
   did. The certification text is versioned so that a record from two years ago shows
   which wording that proctor actually signed. */
create table if not exists final_exam_proctors (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  course_version text not null,
  proctor_name text not null,
  proctor_role text not null,
  proctor_email text,
  proctor_phone text,
  proctor_relationship text not null
    check(proctor_relationship in ('school_designated','institutional','independent_testing_center')),
  certification_version text not null,
  certified_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

/* What was verified, not the document itself. RE 303 requires the participant to
   PRESENT photo identification; it does not require the school to retain a copy, and
   retaining images of government identification would create a standing breach target
   for no compliance benefit. The record therefore names the accepted category, the
   issuing authority as the proctor read it, and who verified it - enough to answer the
   Department's question, and nothing that becomes a liability if the database leaks.
   identification_reference is deliberately free of full identification numbers. */
create table if not exists final_exam_identity_checks (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id),
  student_id uuid not null references students(id),
  proctor_record_id uuid not null references final_exam_proctors(id),
  identification_type text not null
    check(identification_type in ('government_photo_id','trade_organization_photo_id')),
  issuing_authority text not null,
  identification_reference text,
  trade_organization_issued_on date,
  verified_by text not null,
  verified_at timestamptz not null default now(),
  consumed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  /* RE 303 accepts a trade-organization credential only if it was issued within the
     immediately preceding five years, so that category cannot be recorded without the
     issue date that makes it checkable. */
  constraint trade_identification_needs_issue_date
    check(identification_type<>'trade_organization_photo_id' or trade_organization_issued_on is not null)
);

create index if not exists final_exam_identity_checks_enrollment_idx
  on final_exam_identity_checks(enrollment_id, verified_at desc);

-- ---------------------------------------------------------------------------
-- 2. The examination session
-- ---------------------------------------------------------------------------

/* One row per attempt. The form, the time limit, the passing percentage, and the
   question count are stored ON the session rather than read from configuration at
   report time: if any of them changes after DRE review, past attempts must still show
   the rule that actually governed them. */
create table if not exists final_exam_sessions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  course_version text not null,
  attempt_number integer not null check(attempt_number between 1 and 2),
  exam_form text not null check(exam_form in ('A','B')),
  proctor_record_id uuid not null references final_exam_proctors(id),
  identity_check_id uuid not null references final_exam_identity_checks(id),
  question_count integer not null check(question_count > 0),
  passing_percent integer not null check(passing_percent between 1 and 100),
  time_limit_minutes integer not null check(time_limit_minutes > 0),
  status text not null default 'in_progress'
    check(status in ('in_progress','submitted','expired','voided')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz,
  answered_count integer,
  correct_count integer,
  score_percent integer,
  passed boolean,
  void_reason text,
  delivery_metadata jsonb not null default '{}'::jsonb,
  unique(enrollment_id, attempt_number)
);

create index if not exists final_exam_sessions_open_idx
  on final_exam_sessions(status, expires_at) where status='in_progress';

/* One row per item presented. selected_choice is the index in the order the student
   actually saw, which the permutation makes stable for a given item id, so a stored
   answer keeps its meaning permanently. A null selected_choice is an item the student
   never answered; it scores as incorrect and is kept as null rather than coerced to a
   choice the student did not make. */
create table if not exists final_exam_responses (
  session_id uuid not null references final_exam_sessions(id) on delete cascade,
  item_id text not null,
  item_position integer not null,
  selected_choice integer,
  correct boolean not null,
  answered_at timestamptz,
  primary key(session_id, item_id)
);

-- ---------------------------------------------------------------------------
-- 3. Authorising an attempt: proctor plus identification
-- ---------------------------------------------------------------------------

create or replace function authorize_california_final_exam(
  p_enrollment_id uuid,
  p_proctor_name text,
  p_proctor_role text,
  p_proctor_relationship text,
  p_certification_version text,
  p_identification_type text,
  p_issuing_authority text,
  p_verified_by text,
  p_proctor_email text default null,
  p_proctor_phone text default null,
  p_identification_reference text default null,
  p_trade_organization_issued_on date default null,
  p_notes text default null
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_enrollment enrollments%rowtype;
  v_proctor_id uuid;
  v_check_id uuid;
begin
  select * into v_enrollment from enrollments where id=p_enrollment_id for update;
  if not found or v_enrollment.state<>'CA' then raise exception 'california_enrollment_not_found'; end if;
  if v_enrollment.status='expired'
     or (v_enrollment.expires_at is not null and now() >= v_enrollment.expires_at) then
    raise exception 'enrollment_expired';
  end if;
  if coalesce(trim(p_proctor_name),'')='' then raise exception 'proctor_name_required'; end if;
  if coalesce(trim(p_verified_by),'')='' then raise exception 'verifier_required'; end if;

  /* RE 303 accepts a trade-organization credential only when it was issued within the
     immediately preceding five years. Checked here rather than trusted from the form. */
  if p_identification_type='trade_organization_photo_id'
     and (p_trade_organization_issued_on is null
          or p_trade_organization_issued_on < (current_date - interval '5 years')) then
    raise exception 'trade_identification_expired';
  end if;

  insert into final_exam_proctors(
    enrollment_id,student_id,course_id,course_version,proctor_name,proctor_role,
    proctor_email,proctor_phone,proctor_relationship,certification_version
  ) values(
    p_enrollment_id,v_enrollment.student_id,v_enrollment.course_id,v_enrollment.course_version,
    trim(p_proctor_name),trim(p_proctor_role),p_proctor_email,p_proctor_phone,
    p_proctor_relationship,p_certification_version
  ) returning id into v_proctor_id;

  insert into final_exam_identity_checks(
    enrollment_id,student_id,proctor_record_id,identification_type,issuing_authority,
    identification_reference,trade_organization_issued_on,verified_by,notes
  ) values(
    p_enrollment_id,v_enrollment.student_id,v_proctor_id,p_identification_type,
    trim(p_issuing_authority),p_identification_reference,p_trade_organization_issued_on,
    trim(p_verified_by),p_notes
  ) returning id into v_check_id;

  insert into final_exam_authorizations(
    enrollment_id,student_id,course_id,course_version,
    identity_verified_at,proctor_approved_at,proctor_record_id,authorization_status,updated_at
  ) values(
    p_enrollment_id,v_enrollment.student_id,v_enrollment.course_id,v_enrollment.course_version,
    now(),now(),v_proctor_id,'authorized',now()
  )
  on conflict(enrollment_id) do update set
    identity_verified_at=now(), proctor_approved_at=now(),
    proctor_record_id=v_proctor_id, authorization_status='authorized', updated_at=now();

  insert into lms_regulatory_audit(
    actor_id,actor_mode,student_id,enrollment_id,course_id,course_version,assignment_id,event_type,detail
  ) values(
    v_enrollment.student_id,'admin',v_enrollment.student_id,p_enrollment_id,
    v_enrollment.course_id,v_enrollment.course_version,null,'final_exam_authorized',
    jsonb_build_object('proctor_record_id',v_proctor_id,'identity_check_id',v_check_id,
                       'identification_type',p_identification_type,'verified_by',trim(p_verified_by)));

  perform refresh_california_eligibility(p_enrollment_id);

  return jsonb_build_object('proctor_record_id',v_proctor_id,'identity_check_id',v_check_id,
    'identity_verified_at',now(),'authorization_status','authorized');
end $$;

-- ---------------------------------------------------------------------------
-- 4. Starting an attempt
-- ---------------------------------------------------------------------------

/* p_identity_window_minutes is PROVIDER-SET: RE 303 says the identification is
   presented "immediately before the administration of the final examination" and gives
   no number. Sixty minutes is this build's reading, passed in rather than hardcoded so
   that a different value accepted on review changes one caller, and recorded on the
   session so an audit shows what governed that attempt. */
create or replace function start_california_final_exam(
  p_enrollment_id uuid,
  p_actor_id uuid,
  p_exam_form text,
  p_question_count integer,
  p_passing_percent integer,
  p_time_limit_minutes integer,
  p_identity_window_minutes integer default 60,
  p_delivery_metadata jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_enrollment enrollments%rowtype;
  v_eligibility course_final_eligibility%rowtype;
  v_check final_exam_identity_checks%rowtype;
  v_open final_exam_sessions%rowtype;
  v_attempts integer := 0;
  v_passed integer := 0;
  v_attempt integer;
  v_session_id uuid;
  v_expires timestamptz;
begin
  select * into v_enrollment from enrollments where id=p_enrollment_id for update;
  if not found or v_enrollment.state<>'CA' then raise exception 'california_enrollment_not_found'; end if;
  if v_enrollment.student_id<>p_actor_id then raise exception 'course_access_denied'; end if;
  if v_enrollment.status='expired'
     or (v_enrollment.expires_at is not null and now() >= v_enrollment.expires_at) then
    raise exception 'enrollment_expired';
  end if;

  /* A session already running is resumed, never replaced: a student who closed the
     browser returns to the same attempt on the same clock. */
  select * into v_open from final_exam_sessions
   where enrollment_id=p_enrollment_id and status='in_progress'
   order by started_at desc limit 1;
  if found and v_open.expires_at > now() then
    return jsonb_build_object('session_id',v_open.id,'attempt_number',v_open.attempt_number,
      'exam_form',v_open.exam_form,'started_at',v_open.started_at,'expires_at',v_open.expires_at,
      'time_limit_minutes',v_open.time_limit_minutes,'passing_percent',v_open.passing_percent,
      'question_count',v_open.question_count,'resumed',true);
  end if;

  select * into v_eligibility from course_final_eligibility where enrollment_id=p_enrollment_id;
  if not found or not v_eligibility.final_exam_eligible then
    raise exception 'final_exam_not_eligible';
  end if;

  select count(*)::integer,
         count(*) filter (where passed)::integer
    into v_attempts, v_passed
    from final_exam_sessions
   where enrollment_id=p_enrollment_id and status in ('submitted','expired');
  if v_passed > 0 then raise exception 'final_exam_already_passed'; end if;
  /* RE 303 allows the examination and one retake on a different form. There is no
     third attempt, and the school cannot grant one. */
  if v_attempts >= 2 then raise exception 'final_exam_attempts_exhausted'; end if;

  v_attempt := v_attempts + 1;
  if p_exam_form is null or p_exam_form not in ('A','B') then raise exception 'invalid_exam_form'; end if;
  if (v_attempt=1 and p_exam_form<>'A') or (v_attempt=2 and p_exam_form<>'B') then
    raise exception 'exam_form_does_not_match_attempt';
  end if;

  /* The identification check must be recent and unused. Reusing one check for both the
     first attempt and a retake weeks later would make the record say a verification
     happened that did not. */
  select * into v_check from final_exam_identity_checks
   where enrollment_id=p_enrollment_id and consumed_at is null
     and verified_at > now() - make_interval(mins => greatest(1,p_identity_window_minutes))
   order by verified_at desc limit 1;
  if not found then raise exception 'identity_verification_required'; end if;

  v_expires := now() + make_interval(mins => p_time_limit_minutes);

  insert into final_exam_sessions(
    enrollment_id,student_id,course_id,course_version,attempt_number,exam_form,
    proctor_record_id,identity_check_id,question_count,passing_percent,time_limit_minutes,
    expires_at,delivery_metadata
  ) values(
    p_enrollment_id,v_enrollment.student_id,v_enrollment.course_id,v_enrollment.course_version,
    v_attempt,p_exam_form,v_check.proctor_record_id,v_check.id,p_question_count,p_passing_percent,
    p_time_limit_minutes,v_expires,
    coalesce(p_delivery_metadata,'{}'::jsonb)
      || jsonb_build_object('identity_window_minutes',p_identity_window_minutes,
                            'identity_verified_at',v_check.verified_at)
  ) returning id into v_session_id;

  update final_exam_identity_checks set consumed_at=now() where id=v_check.id;
  update final_exam_authorizations set authorization_status='used', updated_at=now()
   where enrollment_id=p_enrollment_id;
  update lms_compliance_state set final_exam_status='in_progress', updated_at=now()
   where enrollment_id=p_enrollment_id;

  insert into lms_regulatory_audit(
    actor_id,actor_mode,student_id,enrollment_id,course_id,course_version,assignment_id,
    event_type,session_id,detail
  ) values(
    p_actor_id,'student',v_enrollment.student_id,p_enrollment_id,
    v_enrollment.course_id,v_enrollment.course_version,null,'final_exam_started',v_session_id,
    jsonb_build_object('attempt_number',v_attempt,'exam_form',p_exam_form,
                       'time_limit_minutes',p_time_limit_minutes,'expires_at',v_expires,
                       'identity_check_id',v_check.id,'proctor_record_id',v_check.proctor_record_id));

  return jsonb_build_object('session_id',v_session_id,'attempt_number',v_attempt,
    'exam_form',p_exam_form,'started_at',now(),'expires_at',v_expires,
    'time_limit_minutes',p_time_limit_minutes,'passing_percent',p_passing_percent,
    'question_count',p_question_count,'resumed',false);
end $$;

-- ---------------------------------------------------------------------------
-- 4a. Saving progress during an attempt
-- ---------------------------------------------------------------------------

/* A three-hour examination that loses every answer to a closed laptop is a compliance
   problem, not a convenience one: the student sat the attempt, the attempt counts, and
   the record has to show what they actually answered. Progress is therefore written as
   it is made, scored server-side at save time.

   Nothing a student can read is written here. final_exam_responses is revoked from
   every role below service_role precisely because the `correct` column would otherwise
   hand the student a per-item answer key mid-examination. This function changes no
   session state and produces no score; it only records answers. */
create or replace function save_california_final_exam_progress(
  p_session_id uuid,
  p_actor_id uuid,
  p_results jsonb
) returns integer language plpgsql security definer set search_path=public as $$
declare
  v_session final_exam_sessions%rowtype;
  v_saved integer := 0;
begin
  select * into v_session from final_exam_sessions where id=p_session_id;
  if not found then raise exception 'final_exam_session_not_found'; end if;
  if v_session.student_id<>p_actor_id then raise exception 'course_access_denied'; end if;
  if v_session.status<>'in_progress' then raise exception 'final_exam_session_closed'; end if;
  /* Answers arriving after the clock has run out are refused rather than stored. The
     sweep will close the attempt on what was saved while it was still running. */
  if now() > v_session.expires_at then raise exception 'final_exam_time_expired'; end if;

  insert into final_exam_responses(session_id,item_id,item_position,selected_choice,correct,answered_at)
  select p_session_id,
         item->>'item_id',
         (item->>'item_position')::integer,
         nullif(item->>'selected_choice','')::integer,
         (item->>'correct')::boolean,
         now()
    from jsonb_array_elements(p_results) as item
   where item->>'selected_choice' is not null
  on conflict(session_id,item_id) do update set
    item_position=excluded.item_position,
    selected_choice=excluded.selected_choice,
    correct=excluded.correct,
    answered_at=now();
  get diagnostics v_saved = row_count;
  return v_saved;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Submitting an attempt
-- ---------------------------------------------------------------------------

/* p_results is the scored result produced by the application from the answer key, which
   never leaves the server: an array of {item_id, item_position, selected_choice,
   correct}. The database stores the outcome and decides what it means; it does not hold
   the key, and no row written here can be read back into an examination question.
   p_late_submission marks an attempt whose answers arrived after the clock ran out -
   the sweep may already have expired it, and either way the score stands as recorded
   rather than being quietly accepted as on time. */
create or replace function submit_california_final_exam(
  p_session_id uuid,
  p_actor_id uuid,
  p_results jsonb
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_session final_exam_sessions%rowtype;
  v_enrollment enrollments%rowtype;
  v_correct integer := 0;
  v_answered integer := 0;
  v_total integer := 0;
  v_percent integer := 0;
  v_passed boolean := false;
  v_late boolean := false;
  v_credited bigint := 0;
begin
  select * into v_session from final_exam_sessions where id=p_session_id for update;
  if not found then raise exception 'final_exam_session_not_found'; end if;
  if v_session.status<>'in_progress' then raise exception 'final_exam_session_closed'; end if;

  select * into v_enrollment from enrollments where id=v_session.enrollment_id;
  if v_enrollment.student_id<>p_actor_id then raise exception 'course_access_denied'; end if;

  v_late := now() > v_session.expires_at;

  select count(*)::integer,
         count(*) filter (where (item->>'correct')::boolean)::integer,
         count(*) filter (where item->>'selected_choice' is not null)::integer
    into v_total, v_correct, v_answered
    from jsonb_array_elements(p_results) as item;

  if v_total <> v_session.question_count then raise exception 'final_exam_item_count_mismatch'; end if;

  insert into final_exam_responses(session_id,item_id,item_position,selected_choice,correct,answered_at)
  select p_session_id,
         item->>'item_id',
         (item->>'item_position')::integer,
         nullif(item->>'selected_choice','')::integer,
         (item->>'correct')::boolean,
         case when item->>'selected_choice' is not null then now() end
    from jsonb_array_elements(p_results) as item
  on conflict(session_id,item_id) do update set
    item_position=excluded.item_position,
    selected_choice=excluded.selected_choice,
    correct=excluded.correct,
    answered_at=coalesce(excluded.answered_at,final_exam_responses.answered_at);

  v_percent := round(100.0 * v_correct / v_total);
  v_passed := v_percent >= v_session.passing_percent;

  update final_exam_sessions
     set status=case when v_late then 'expired' else 'submitted' end,
         submitted_at=now(), answered_count=v_answered, correct_count=v_correct,
         score_percent=v_percent, passed=v_passed,
         delivery_metadata=delivery_metadata||jsonb_build_object('late_submission',v_late)
   where id=p_session_id;

  update lms_compliance_state
     set final_exam_status=case when v_passed then 'passed' else 'failed' end, updated_at=now()
   where enrollment_id=v_session.enrollment_id;

  /* A passing score completes the course. This is the only place a California course
     completion is created, and it reads an examination result - never a payment. */
  if v_passed then
    select coalesce(credited_study_seconds,0) into v_credited
      from lms_compliance_state where enrollment_id=v_session.enrollment_id;
    insert into course_completion_events(
      enrollment_id,course_id,completed_at,credited_study_seconds,completion_status,detail
    ) values(
      v_session.enrollment_id,v_session.course_id,now(),coalesce(v_credited,0),
      case when v_enrollment.status='qa_non_credit' then 'qa_non_credit' else 'complete' end,
      jsonb_build_object('final_exam_session_id',p_session_id,'attempt_number',v_session.attempt_number,
                         'exam_form',v_session.exam_form,'score_percent',v_percent,
                         'passing_percent',v_session.passing_percent)
    )
    on conflict(enrollment_id) do nothing;
    update enrollments set completed_at=now(), updated_at=now()
     where id=v_session.enrollment_id and completed_at is null;
  end if;

  insert into lms_regulatory_audit(
    actor_id,actor_mode,student_id,enrollment_id,course_id,course_version,assignment_id,
    event_type,session_id,detail
  ) values(
    p_actor_id,'student',v_session.student_id,v_session.enrollment_id,
    v_session.course_id,v_session.course_version,null,'final_exam_submitted',p_session_id,
    jsonb_build_object('attempt_number',v_session.attempt_number,'exam_form',v_session.exam_form,
                       'score_percent',v_percent,'correct_count',v_correct,'answered_count',v_answered,
                       'question_count',v_total,'passed',v_passed,'late_submission',v_late));

  perform refresh_california_eligibility(v_session.enrollment_id);

  return jsonb_build_object('session_id',p_session_id,'attempt_number',v_session.attempt_number,
    'exam_form',v_session.exam_form,'score_percent',v_percent,'correct_count',v_correct,
    'answered_count',v_answered,'question_count',v_total,'passing_percent',v_session.passing_percent,
    'passed',v_passed,'late_submission',v_late,
    'retake_available',(not v_passed) and v_session.attempt_number < 2);
end $$;

-- ---------------------------------------------------------------------------
-- 6. Expiring abandoned attempts
-- ---------------------------------------------------------------------------

/* An attempt the student walked away from still counts. Leaving it open forever would
   let a student return days later and finish on the original clock, and would leave the
   attempt count understated. */
create or replace function expire_california_final_exam_sessions()
returns integer language plpgsql security definer set search_path=public as $$
declare
  v_row final_exam_sessions%rowtype;
  v_expired integer := 0;
  v_correct integer;
  v_answered integer;
  v_percent integer;
begin
  for v_row in
    select s.* from final_exam_sessions s
      join courses c on c.id=s.course_id
     where c.state='CA' and s.status='in_progress' and s.expires_at <= now()
    for update of s
  loop
    select count(*) filter (where correct)::integer,
           count(*) filter (where selected_choice is not null)::integer
      into v_correct, v_answered
      from final_exam_responses where session_id=v_row.id;
    v_percent := case when v_row.question_count>0
                      then round(100.0 * coalesce(v_correct,0) / v_row.question_count)
                      else 0 end;
    update final_exam_sessions
       set status='expired', submitted_at=coalesce(submitted_at,now()),
           answered_count=coalesce(answered_count,v_answered),
           correct_count=coalesce(correct_count,v_correct),
           score_percent=coalesce(score_percent,v_percent),
           passed=coalesce(passed,false),
           delivery_metadata=delivery_metadata||jsonb_build_object('expired_by_sweep',true)
     where id=v_row.id;
    update lms_compliance_state set final_exam_status='failed', updated_at=now()
     where enrollment_id=v_row.enrollment_id;
    insert into lms_regulatory_audit(
      actor_id,actor_mode,student_id,enrollment_id,course_id,course_version,assignment_id,
      event_type,session_id,detail
    ) values(
      v_row.student_id,'system',v_row.student_id,v_row.enrollment_id,
      v_row.course_id,v_row.course_version,null,'final_exam_expired',v_row.id,
      jsonb_build_object('attempt_number',v_row.attempt_number,'exam_form',v_row.exam_form,
                         'expires_at',v_row.expires_at,'answered_count',v_answered));
    perform refresh_california_eligibility(v_row.enrollment_id);
    v_expired := v_expired + 1;
  end loop;
  return v_expired;
end $$;

-- ---------------------------------------------------------------------------
-- 7. Reporting
-- ---------------------------------------------------------------------------

/* The examination record a reviewer asks for: who sat what, when, under whose
   proctoring, with which identification, and what the outcome was. No item, choice, or
   answer appears - the responses table is deliberately not joined here. */
create or replace view california_final_exam_register as
select s.id as session_id, s.enrollment_id, s.student_id, s.course_id, s.course_version,
       s.attempt_number, s.exam_form, s.question_count, s.passing_percent,
       s.time_limit_minutes, s.status, s.started_at, s.expires_at, s.submitted_at,
       s.answered_count, s.correct_count, s.score_percent, s.passed,
       p.proctor_name, p.proctor_role, p.proctor_relationship, p.certification_version,
       p.certified_at,
       i.identification_type, i.issuing_authority, i.verified_by, i.verified_at as identity_verified_at
  from final_exam_sessions s
  join courses c on c.id=s.course_id
  join final_exam_proctors p on p.id=s.proctor_record_id
  join final_exam_identity_checks i on i.id=s.identity_check_id
 where c.state='CA';

-- ---------------------------------------------------------------------------
-- 8. Access
-- ---------------------------------------------------------------------------

alter table final_exam_proctors enable row level security;
alter table final_exam_identity_checks enable row level security;
alter table final_exam_sessions enable row level security;
alter table final_exam_responses enable row level security;

/* No role below service_role may read final_exam_responses: a student reading their own
   response rows would learn, item by item, which answers were correct, and the
   examination would stop being an examination. */
revoke all on final_exam_proctors,final_exam_identity_checks,final_exam_sessions,
  final_exam_responses from anon,authenticated;
grant select on final_exam_sessions to authenticated;
grant all on final_exam_proctors,final_exam_identity_checks,final_exam_sessions,
  final_exam_responses to service_role;

revoke all on function authorize_california_final_exam(uuid,text,text,text,text,text,text,text,text,text,text,date,text) from public,anon,authenticated;
revoke all on function start_california_final_exam(uuid,uuid,text,integer,integer,integer,integer,jsonb) from public,anon,authenticated;
revoke all on function save_california_final_exam_progress(uuid,uuid,jsonb) from public,anon,authenticated;
revoke all on function submit_california_final_exam(uuid,uuid,jsonb) from public,anon,authenticated;
revoke all on function expire_california_final_exam_sessions() from public,anon,authenticated;
grant execute on function authorize_california_final_exam(uuid,text,text,text,text,text,text,text,text,text,text,date,text) to service_role;
grant execute on function start_california_final_exam(uuid,uuid,text,integer,integer,integer,integer,jsonb) to service_role;
grant execute on function save_california_final_exam_progress(uuid,uuid,jsonb) to service_role;
grant execute on function submit_california_final_exam(uuid,uuid,jsonb) to service_role;
grant execute on function expire_california_final_exam_sessions() to service_role;

commit;
