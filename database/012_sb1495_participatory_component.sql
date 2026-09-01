-- ===========================================================================
-- 012 — SB 1495: the interactive participatory component, enforced
-- ===========================================================================
--
-- WHAT WAS WRONG
--
-- course_final_eligibility has carried a column called
-- interactive_requirements_complete since migration 003, and until this
-- migration it was set to `v_completed = 15` — the count of finished lesson
-- assignments. It reported that the interactive requirement was satisfied
-- whenever the student had finished fifteen assignments, whether or not the
-- student had ever written a word in either role.
--
-- Nothing stored a role-play response. Assignment 14 completed on sections
-- viewed, the applied exercise, and the engagement check, exactly like the
-- fourteen assignments around it. The lesson text told the student the
-- responses were "recorded, reviewed, and a completion requirement"; the
-- platform recorded nothing and required nothing.
--
-- WHAT THE DEPARTMENT ASKS FOR
--
-- DRE's SB 1495 FAQ (New 05/2023), answering Q1:
--
--   "A component on federal and state fair housing laws as those laws apply
--    to the practice of real estate. The fair housing component shall include
--    an interactive participatory component, during which the applicant shall
--    role play as both a consumer and real estate professional."
--
-- Both roles. Role play, not reading about role play. And Q7: the components
-- cannot be completed independently of the practice course itself.
--
-- WHAT THIS MIGRATION DOES
--
--   1. Stores each role-play response, with the text the student wrote.
--   2. Refuses to let the practicum assignment reach 'completed' with either
--      role missing — in a trigger, so that no code path can route around it.
--   3. Computes interactive_requirements_complete from the submissions, and
--      makes final examination eligibility depend on it.
--   4. Records the participation on the completion certificate record, so the
--      evidence of compliance travels with the evidence of completion.
--
-- The revision column exists because the lesson asks the licensee-role student
-- to submit, receive structured feedback, and then submit a revision. Both are
-- kept. A record that overwrote the first response would destroy the evidence
-- that the feedback step happened at all.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. The responses
-- ---------------------------------------------------------------------------

create table if not exists sb1495_participatory_submissions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id) on delete cascade,
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  course_version text not null,
  assignment_id text not null,
  /* The Department's two words. The database, the study path, the traceability
     matrix and the certificate all use these and no synonyms, because a role
     named one way here and another way in a document is a role a reviewer
     cannot follow from one to the other. */
  participant_role text not null check (participant_role in ('consumer','licensee')),
  revision integer not null default 1 check (revision >= 1),
  /* The response itself. A participatory component evidenced by a boolean is a
     participatory component nobody can review; the minimum length is what
     stops a single character from discharging it. */
  response text not null check (length(btrim(response)) >= 200),
  prompts_answered integer not null default 0 check (prompts_answered >= 0),
  submitted_at timestamptz not null default now(),
  feedback_reviewed_at timestamptz,
  reviewer_note text,
  unique (enrollment_id, assignment_id, participant_role, revision)
);

create index if not exists sb1495_submissions_enrollment_idx
  on sb1495_participatory_submissions(enrollment_id, participant_role);

/* A reviewer account browsing the course must never write a student record.
   The rule is already stated for study time; it is restated here because this
   table is new and the rule has to hold for every table that carries student
   evidence, not only the ones that existed when it was written. */
comment on table sb1495_participatory_submissions is
  'SB 1495 interactive participatory component. Student submissions only; reviewer sessions are recorded in course_review_access and never here.';

-- ---------------------------------------------------------------------------
-- 2. Which course carries the requirement, and whether it has been met
-- ---------------------------------------------------------------------------

create or replace function sb1495_required_for(p_course_id text, p_course_version text)
returns boolean language sql stable as $$
  select coalesce(
    (select (configuration->>'sb1495_participatory_component')::boolean
       from regulatory_course_versions
      where course_id = p_course_id and version = p_course_version),
    false);
$$;

/* The roles taken, as a fact rather than as an inference. Returns the roles
   with at least one submission, whether both are present, and the assignment
   the component belongs to. A caller that wants to know whether the student
   participated asks this; nothing counts assignments to answer it. */
create or replace function sb1495_participation(p_enrollment_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare
  v_enrollment enrollments%rowtype;
  v_required boolean;
  v_roles text[];
  v_consumer boolean;
  v_licensee boolean;
begin
  select * into v_enrollment from enrollments where id = p_enrollment_id;
  if not found then raise exception 'enrollment_not_found'; end if;

  v_required := sb1495_required_for(v_enrollment.course_id, v_enrollment.course_version);

  select coalesce(array_agg(distinct participant_role), '{}')
    into v_roles
    from sb1495_participatory_submissions
   where enrollment_id = p_enrollment_id;

  v_consumer := 'consumer' = any(v_roles);
  v_licensee := 'licensee' = any(v_roles);

  return jsonb_build_object(
    'required', v_required,
    'roles_taken', to_jsonb(v_roles),
    'consumer_role_submitted', v_consumer,
    'licensee_role_submitted', v_licensee,
    /* Where the requirement does not apply the answer is true, because there is
       nothing outstanding — not because a role was taken. A caller reading this
       field alone must still read `required` to know which it is. */
    'both_roles_submitted', (not v_required) or (v_consumer and v_licensee),
    'submission_count', (select count(*) from sb1495_participatory_submissions where enrollment_id = p_enrollment_id)
  );
end $$;

-- ---------------------------------------------------------------------------
-- 3. Recording a submission
-- ---------------------------------------------------------------------------

create or replace function record_sb1495_submission(
  p_enrollment_id uuid,
  p_participant_role text,
  p_response text,
  p_prompts_answered integer default 0
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_enrollment enrollments%rowtype;
  v_assignment text;
  v_revision integer;
  v_id uuid;
begin
  select * into v_enrollment from enrollments where id = p_enrollment_id;
  if not found then raise exception 'enrollment_not_found'; end if;
  if not sb1495_required_for(v_enrollment.course_id, v_enrollment.course_version) then
    /* Q7 of the FAQ: the components cannot be completed independently of the
       practice course. Accepting a submission against any other enrollment
       would be the first step toward offering them separately. */
    raise exception 'sb1495_not_applicable_to_this_course';
  end if;
  if p_participant_role not in ('consumer','licensee') then
    raise exception 'sb1495_unknown_role';
  end if;
  if p_response is null or length(btrim(p_response)) < 200 then
    raise exception 'sb1495_response_too_short';
  end if;

  select assignment_id into v_assignment
    from regulated_course_assignments
   where course_id = v_enrollment.course_id
     and course_version = v_enrollment.course_version
     and title ilike '%participatory practicum%'
   limit 1;
  if v_assignment is null then raise exception 'sb1495_practicum_assignment_not_found'; end if;

  select coalesce(max(revision), 0) + 1 into v_revision
    from sb1495_participatory_submissions
   where enrollment_id = p_enrollment_id and participant_role = p_participant_role;

  insert into sb1495_participatory_submissions(
    enrollment_id, student_id, course_id, course_version, assignment_id,
    participant_role, revision, response, prompts_answered
  ) values (
    p_enrollment_id, v_enrollment.student_id, v_enrollment.course_id, v_enrollment.course_version,
    v_assignment, p_participant_role, v_revision, btrim(p_response), coalesce(p_prompts_answered, 0)
  ) returning id into v_id;

  insert into lms_regulatory_audit(enrollment_id, student_id, course_id, assignment_id, event_type, detail)
  values (p_enrollment_id, v_enrollment.student_id, v_enrollment.course_id, v_assignment,
          'sb1495_role_submitted',
          jsonb_build_object('participant_role', p_participant_role, 'revision', v_revision,
                             'characters', length(btrim(p_response))));

  return jsonb_build_object('submission_id', v_id, 'revision', v_revision,
                            'participation', sb1495_participation(p_enrollment_id));
end $$;

-- ---------------------------------------------------------------------------
-- 4. The assignment cannot complete without both roles
-- ---------------------------------------------------------------------------

/* In a trigger rather than in the study path, because the study path is one
   caller. A back-office correction, a repair script, or a second client would
   each be a way around a check that lived only in application code, and the
   requirement is not the kind that may be routed around. */
create or replace function assert_sb1495_before_assignment_complete()
returns trigger language plpgsql as $$
declare
  v_participation jsonb;
begin
  if new.status is distinct from 'completed' then return new; end if;
  if not sb1495_required_for(new.course_id, new.course_version) then return new; end if;
  if new.assignment_id is distinct from (
      select assignment_id from regulated_course_assignments
       where course_id = new.course_id and course_version = new.course_version
         and title ilike '%participatory practicum%' limit 1)
  then
    return new;
  end if;

  v_participation := sb1495_participation(new.enrollment_id);
  if not (v_participation->>'consumer_role_submitted')::boolean then
    raise exception 'sb1495_consumer_role_not_submitted';
  end if;
  if not (v_participation->>'licensee_role_submitted')::boolean then
    raise exception 'sb1495_licensee_role_not_submitted';
  end if;
  return new;
end $$;

drop trigger if exists sb1495_assignment_completion_guard on lms_assignment_state;
create trigger sb1495_assignment_completion_guard
  before insert or update on lms_assignment_state
  for each row execute function assert_sb1495_before_assignment_complete();

-- ---------------------------------------------------------------------------
-- 5. Eligibility reads the submissions, not the assignment count
-- ---------------------------------------------------------------------------

create or replace function refresh_california_eligibility(p_enrollment_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_enrollment enrollments%rowtype;
  v_completed integer := 0;
  v_access_at timestamptz;
  v_earliest timestamptz;
  v_calendar boolean := false;
  v_identity boolean := false;
  v_recent integer := 0;
  v_cross_course boolean := false;
  v_expired boolean := false;
  v_final boolean := false;
  v_participation jsonb;
  v_interactive boolean := false;
  v_remaining jsonb := '[]'::jsonb;
begin
  select * into v_enrollment from enrollments where id=p_enrollment_id;
  if not found or v_enrollment.state<>'CA' then raise exception 'california_enrollment_not_found'; end if;

  select count(*)::integer into v_completed from lms_assignment_state
    where enrollment_id=p_enrollment_id and status='completed';

  /* RE 303 p.3: the period runs from the date access was received. Where no active
     grant exists the student has never had access, so the clock has not started and
     the calendar requirement cannot be satisfied — v_access_at stays null and
     v_calendar stays false rather than silently falling back to the enrollment date. */
  select granted_at into v_access_at
    from access_grants
    where enrollment_id=p_enrollment_id and status='active'
    order by granted_at asc
    limit 1;
  if v_access_at is not null then
    v_earliest := v_access_at + interval '420 hours';
    v_calendar := now() >= v_earliest;
  end if;

  select count(*)::integer into v_recent from course_completion_events cce
    join courses c on c.id=cce.course_id
    where c.state='CA' and cce.enrollment_id<>p_enrollment_id and cce.completion_status in ('complete','qa_non_credit')
      and cce.completed_at>now()-interval '35 days'
      and exists(select 1 from enrollments e where e.id=cce.enrollment_id and e.student_id=v_enrollment.student_id);
  v_cross_course := v_recent<2;

  select coalesce(authorization_status='authorized',false) into v_identity
    from final_exam_authorizations where enrollment_id=p_enrollment_id;
  v_identity := coalesce(v_identity,false);

  /* SB 1495. This used to be `v_completed = 15`, which reported the interactive
     requirement satisfied on the strength of an assignment count. It is now the
     fact: both roles submitted, read from the submissions themselves. */
  v_participation := sb1495_participation(p_enrollment_id);
  v_interactive := (v_participation->>'both_roles_submitted')::boolean;

  /* RE 303 p.4: all coursework within one year of registration, then re-enrollment. */
  v_expired := v_enrollment.status='expired'
    or (v_enrollment.expires_at is not null and now() >= v_enrollment.expires_at);

  if v_completed<15 then v_remaining:=v_remaining||jsonb_build_array((15-v_completed)::text||' lesson assignments'); end if;
  if v_access_at is null then v_remaining:=v_remaining||jsonb_build_array('Course access not yet granted'); end if;
  if v_access_at is not null and not v_calendar then v_remaining:=v_remaining||jsonb_build_array('California 2.5-week minimum period'); end if;
  if not v_cross_course then v_remaining:=v_remaining||jsonb_build_array('California two-course / five-week completion window'); end if;
  if not v_identity then v_remaining:=v_remaining||jsonb_build_array('Identity and proctor authorization'); end if;
  if (v_participation->>'required')::boolean and not (v_participation->>'consumer_role_submitted')::boolean then
    v_remaining:=v_remaining||jsonb_build_array('SB 1495 participatory component - consumer role');
  end if;
  if (v_participation->>'required')::boolean and not (v_participation->>'licensee_role_submitted')::boolean then
    v_remaining:=v_remaining||jsonb_build_array('SB 1495 participatory component - real estate professional role');
  end if;
  if v_expired then v_remaining:=v_remaining||jsonb_build_array('Enrollment expired - re-enrollment required'); end if;

  v_final := v_completed=15 and v_calendar and v_cross_course and v_identity and v_interactive and not v_expired;

  insert into course_final_eligibility(
    enrollment_id,course_id,course_version,earliest_final_exam_at,calendar_eligible,
    assignments_complete,quizzes_complete,interactive_requirements_complete,
    identity_requirements_complete,unresolved_compliance_blocks,remaining_requirements,final_exam_eligible,updated_at
  ) values(
    p_enrollment_id,v_enrollment.course_id,v_enrollment.course_version,v_earliest,v_calendar,
    v_completed=15,v_completed=15,v_interactive,v_identity,
    (case when v_cross_course then 0 else 1 end) + (case when v_expired then 1 else 0 end),
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

  return jsonb_build_object('assignments_completed',v_completed,
    'access_granted_at',v_access_at,'earliest_final_exam_at',v_earliest,
    'calendar_eligible',v_calendar,'cross_course_window_eligible',v_cross_course,
    'identity_and_proctor_authorized',v_identity,'enrollment_expired',v_expired,
    'sb1495_participation',v_participation,
    'interactive_requirements_complete',v_interactive,
    'final_exam_eligible',v_final,'remaining_requirements',v_remaining);
end $$;

-- ---------------------------------------------------------------------------
-- 6. The evidence travels with the completion record
-- ---------------------------------------------------------------------------

/* SB 1495 FAQ Q4 and Q6: an applicant must "show evidence" of having completed a
   compliant practice course. A certificate that recorded only "completed" would
   leave the school to reconstruct, later and from memory, whether the two roles
   were taken. */
alter table course_completion_certificates
  add column if not exists sb1495_participation jsonb;

create or replace function california_sb1495_completion_evidence(p_enrollment_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare
  v_participation jsonb;
begin
  v_participation := sb1495_participation(p_enrollment_id);
  if not (v_participation->>'required')::boolean then
    return jsonb_build_object('sb1495_applicable', false);
  end if;
  return jsonb_build_object(
    'sb1495_applicable', true,
    'statement', 'Compliant with SB 1495',
    'consumer_role_submitted_at',
      (select min(submitted_at) from sb1495_participatory_submissions
        where enrollment_id=p_enrollment_id and participant_role='consumer'),
    'licensee_role_submitted_at',
      (select min(submitted_at) from sb1495_participatory_submissions
        where enrollment_id=p_enrollment_id and participant_role='licensee'),
    'revisions',
      (select count(*) from sb1495_participatory_submissions
        where enrollment_id=p_enrollment_id and revision > 1),
    'both_roles_submitted', (v_participation->>'both_roles_submitted')::boolean
  );
end $$;

-- ---------------------------------------------------------------------------
-- 7. Backfill note
-- ---------------------------------------------------------------------------

/* No backfill. There is no student record to migrate — no course is approved and
   no student has enrolled — and inventing a submission for one would be exactly
   the falsification this whole table exists to make unnecessary. Any enrollment
   that exists when this migration runs simply becomes ineligible for the final
   examination until both roles are actually taken, which is correct. */
