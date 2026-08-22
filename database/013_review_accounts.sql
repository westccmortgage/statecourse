-- ===========================================================================
-- 013 — The two review accounts, and what neither of them can do
-- ===========================================================================
--
-- RE 303 checklist item 15 asks for "Student AND Regulator log-in and password
-- for courses/final exams offered online". Two log-ins, and the Department
-- means two different things by them:
--
--   THE STUDENT REVIEWER sees the course exactly as a student sees it. Every
--   gate in place, sections locked until the one before is finished, study
--   time recorded, the SB 1495 role-play required before the practicum closes.
--   Its whole value is that nothing is bypassed — a reviewer who is shown a
--   frictionless walkthrough has not been shown the course a student takes.
--
--   THE REGULATOR REVIEWER reaches all of it at once: every assignment, both
--   examination forms, the answer keys, the completion rules. Its value is
--   coverage, and coverage is the opposite of the first account's value, which
--   is why one account cannot be both.
--
-- WHAT NEITHER MAY DO
--
-- Neither may produce a completion record or a certificate. That is not a
-- policy preference: a certificate names a DRE approval number, no approval
-- exists, and a review account that could generate one would be generating
-- evidence of qualifying education that nobody is qualified to give.
--
-- Two things were true before this migration and should not have been:
--
--   1. issue_california_completion_certificate accepted a completion whose
--      status was 'qa_non_credit'. Every QA and review enrollment carries that
--      status. The certificate would have been real, numbered, and recorded.
--
--   2. Nothing anywhere read the course's approval number before issuing.
--      california/submission/.../15-re311-certificate-specimen.md says: "This
--      is enforced in the platform, not in a policy document. The California
--      course configuration holds approval_number: null; the certificate
--      issuance path reads that field; and with it null the request is
--      refused." The configuration held null. Nothing read it.
--
-- The second is the same class of defect as the SB 1495 one in migration 012:
-- a document describing an enforcement that was never built. It is fixed here
-- rather than by softening the document.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. An enrollment can say that it exists for review
-- ---------------------------------------------------------------------------

alter table enrollments
  add column if not exists review_role text
    check (review_role in ('student_reviewer','regulator_reviewer'));

comment on column enrollments.review_role is
  'Set on the two DRE review enrollments. A review enrollment can never produce a completion event or a certificate; see the guards below.';

create index if not exists enrollments_review_role_idx on enrollments(review_role) where review_role is not null;

/* Which enrollment a caller is looking at, and in what capacity. One place, so
   that the study path, the certificate guard and the walkthrough cannot form
   three different opinions about whether an account is a reviewer. */
create or replace function california_review_role(p_enrollment_id uuid)
returns text language sql stable security definer set search_path=public as $$
  select review_role from enrollments where id = p_enrollment_id;
$$;

-- ---------------------------------------------------------------------------
-- 2. No completion event for a review enrollment
-- ---------------------------------------------------------------------------

create or replace function refuse_completion_for_review_enrollment()
returns trigger language plpgsql as $$
declare
  v_role text;
begin
  select review_role into v_role from enrollments where id = new.enrollment_id;
  if v_role is not null then
    raise exception 'completion_refused_for_review_enrollment: % is a % account and may not complete a course', new.enrollment_id, v_role;
  end if;
  return new;
end $$;

drop trigger if exists review_enrollment_completion_guard on course_completion_events;
create trigger review_enrollment_completion_guard
  before insert or update on course_completion_events
  for each row execute function refuse_completion_for_review_enrollment();

drop trigger if exists review_enrollment_certificate_guard on course_completion_certificates;
create trigger review_enrollment_certificate_guard
  before insert or update on course_completion_certificates
  for each row execute function refuse_completion_for_review_enrollment();

-- ---------------------------------------------------------------------------
-- 3. No certificate without the approval number the certificate has to carry
-- ---------------------------------------------------------------------------

create or replace function issue_california_completion_certificate(
  p_enrollment_id uuid,
  p_certificate_number text default null
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_enrollment enrollments%rowtype;
  v_event course_completion_events%rowtype;
  v_existing course_completion_certificates%rowtype;
  v_approval text;
  v_number text;
  v_id uuid;
begin
  select * into v_enrollment from enrollments where id=p_enrollment_id;
  if not found or v_enrollment.state<>'CA' then raise exception 'california_enrollment_not_found'; end if;

  /* A review enrollment never reaches a certificate. Stated here as well as in the
     trigger because a caller is entitled to the reason rather than to a constraint
     violation, and because the trigger is the guarantee rather than the message. */
  if v_enrollment.review_role is not null then
    raise exception 'certificate_refused_for_review_enrollment';
  end if;

  /* RE 311 carries a DRE APPROVAL NUMBER field and the Department assigns it. Until
     it exists there is no lawful certificate to issue, and issuing one with the field
     blank or invented is the single worst thing this platform could do. */
  select regulatory_approval_number into v_approval from courses where id=v_enrollment.course_id;
  if v_approval is null or btrim(v_approval) = '' then
    raise exception 'certificate_refused_no_dre_approval_number: % has no approval number assigned by the Department', v_enrollment.course_id;
  end if;

  select * into v_event from course_completion_events where enrollment_id=p_enrollment_id;
  if not found then raise exception 'course_not_completed'; end if;

  /* 'qa_non_credit' used to be accepted here alongside 'complete'. Every QA and review
     enrollment carries it, so the one status that must never produce a certificate was
     the one status that did. */
  if v_event.completion_status <> 'complete' then
    raise exception 'completion_not_final';
  end if;

  select * into v_existing from course_completion_certificates
   where enrollment_id=p_enrollment_id and delivery_status<>'voided';
  if found then
    return jsonb_build_object('certificate_id',v_existing.id,'certificate_number',v_existing.certificate_number,
      'already_issued',true,'delivery_due_at',v_existing.delivery_due_at,'delivery_status',v_existing.delivery_status);
  end if;

  v_number := coalesce(p_certificate_number,
    'CA-'||upper(substr(replace(p_enrollment_id::text,'-',''),1,10))||'-'||to_char(v_event.completed_at,'YYYYMMDD'));

  insert into course_completion_certificates(
    enrollment_id,student_id,course_id,course_version,certificate_number,
    completed_at,delivery_due_at,sb1495_participation
  ) values(
    p_enrollment_id,v_enrollment.student_id,v_enrollment.course_id,v_enrollment.course_version,v_number,
    v_event.completed_at,v_event.completed_at + interval '15 days',
    california_sb1495_completion_evidence(p_enrollment_id)
  ) returning id into v_id;

  update course_completion_events
     set certificate_number=v_number
   where enrollment_id=p_enrollment_id and certificate_number is null;

  insert into lms_regulatory_audit(
    enrollment_id,student_id,actor_id,actor_mode,course_id,course_version,assignment_id,event_type,detail
  ) values(
    p_enrollment_id,v_enrollment.student_id,v_enrollment.student_id,'system',
    v_enrollment.course_id,v_enrollment.course_version,null,'certificate_issued',
    jsonb_build_object('certificate_number',v_number,'completed_at',v_event.completed_at,
                       'dre_approval_number',v_approval,
                       'delivery_due_at',v_event.completed_at + interval '15 days'));

  return jsonb_build_object('certificate_id',v_id,'certificate_number',v_number,'already_issued',false,
    'completed_at',v_event.completed_at,'delivery_due_at',v_event.completed_at + interval '15 days',
    'delivery_status','pending');
end $$;

-- ---------------------------------------------------------------------------
-- 4. Provisioning the two accounts
-- ---------------------------------------------------------------------------

/*
 * One function so that the two accounts are created the same way every time and
 * differ in exactly the ways they are meant to differ.
 *
 * The student reviewer gets enrollments and NO course_review_access, so the study
 * path resolves it to mode 'student' and every gate applies to it.
 *
 * The regulator reviewer gets its own enrollments AND course_review_access, so it
 * resolves to mode 'reviewer' — and because the enrollments are its own, it never
 * opens a record belonging to anybody else. Reviewer mode is what removes the
 * gates; owning its own enrollments is what makes contaminating a student record
 * structurally impossible rather than merely disallowed.
 */
create or replace function provision_california_review_enrollment(
  p_student_id uuid,
  p_course_id text,
  p_review_role text
) returns uuid language plpgsql security definer set search_path=public as $$
declare
  v_attempt uuid;
  v_enrollment uuid;
begin
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

  v_attempt := gen_random_uuid();
  insert into checkout_attempts(
    id,student_id,course_id,state,stripe_mode,amount,currency,status,
    regulatory_acknowledgment_version,terms_version,refund_policy_version,cancellation_policy_version,qa_only
  ) values(v_attempt,p_student_id,p_course_id,'CA','test',0,'usd','qa_manual',
    'ca-draft-review','ca-draft-review','ca-draft-review','ca-draft-review',true);

  insert into enrollments(
    student_id,course_id,state,status,compliance_credit_eligible,checkout_attempt_id,
    course_version,started_at,expires_at,review_role
  ) values(
    p_student_id,p_course_id,'CA','qa_non_credit',false,v_attempt,
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

/* What the two accounts can see and do, as a fact the walkthrough reads rather than
   as a claim a document makes. */
create or replace function california_review_account_summary(p_student_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare
  v_role text;
begin
  select distinct review_role into v_role from enrollments
   where student_id=p_student_id and review_role is not null limit 1;
  return jsonb_build_object(
    'review_role', v_role,
    'enrollments', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'enrollment_id', e.id,
        'course_id', e.course_id,
        'status', e.status,
        'review_role', e.review_role,
        'assignments', (select count(*) from lms_assignment_state s where s.enrollment_id=e.id),
        'access_active', exists(select 1 from access_grants g where g.enrollment_id=e.id and g.status='active'),
        'final_exam_eligible', coalesce((select f.final_exam_eligible from course_final_eligibility f where f.enrollment_id=e.id), false),
        'remaining_requirements', coalesce((select f.remaining_requirements from course_final_eligibility f where f.enrollment_id=e.id), '[]'::jsonb),
        'sb1495', sb1495_participation(e.id)
      ) order by e.course_id), '[]'::jsonb)
      from enrollments e where e.student_id=p_student_id and e.review_role is not null),
    'reviewer_grants', (
      select coalesce(jsonb_agg(jsonb_build_object('course_id', course_id, 'access_role', access_role) order by course_id), '[]'::jsonb)
      from course_review_access where user_id=p_student_id and active),
    /* Both are false for both accounts, always. The column is here so that a reviewer
       can read the answer rather than be told it. */
    'can_complete_a_course', false,
    'can_be_issued_a_certificate', false
  );
end $$;
