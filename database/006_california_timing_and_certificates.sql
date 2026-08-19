-- 006 California timing corrections and course completion certificates
--
-- Closes three gaps between the engine and Article 24 / RE 303 that the submission
-- analysis identified. Each is a compliance defect rather than a refinement, and the
-- first errs in the student's favour against the regulator, which is the worst
-- direction for an error to run.
--
--   1. RE 303 p.3 measures completion time from the date the student RECEIVES ACCESS
--      to the date the final examination is passed. refresh_california_eligibility
--      measured it from enrollments.enrollment_date. Access is a separate event in
--      this schema (access_grants.granted_at), so a grant issued after enrollment
--      started the 2.5-week clock before the student could study, and the engine
--      would release the final examination earlier than the regulation allows.
--
--   2. RE 303 p.4 requires completion within one year of registration, after which the
--      student must re-enroll. enrollments.expires_at was set and never read: the only
--      expires_at checks in the codebase govern reviewer access, not the student's
--      enrollment. A lapsed student could complete the course and sit the final.
--
--   3. Regulation 3000(a)(6) requires the completion document within 15 days of
--      successful completion, and 3000(a)(4) requires records sufficient to produce a
--      duplicate certificate on request. Neither a certificate record nor an issuance
--      path existed.
--
-- Deliberately NOT in this migration: the content and layout of the certificate
-- itself. RE 311 prescribes its required fields and StateCourse does not have that
-- form. This migration records who completed what and when, and tracks the issuance
-- deadline; the printed artefact is built once RE 311 is in hand.
--
-- Payment is not a term anywhere in this file. Nothing here reads a payment, a
-- checkout attempt, or a refund: completion, examination eligibility, and certificate
-- issuance are determined by instructional and regulatory facts alone.

-- ---------------------------------------------------------------------------
-- 1 + 2. Eligibility: measure from access, and stop an expired enrollment
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
  v_remaining jsonb := '[]'::jsonb;
begin
  select * into v_enrollment from enrollments where id=p_enrollment_id;
  if not found or v_enrollment.state<>'CA' then raise exception 'california_enrollment_not_found'; end if;

  select count(*)::integer into v_completed from lms_assignment_state
    where enrollment_id=p_enrollment_id and status='completed';

  /* RE 303 p.3: the period runs from the date access was received. Where no active
     grant exists the student has never had access, so the clock has not started and
     the calendar requirement cannot be satisfied — v_access_at stays null and
     v_calendar stays false rather than silently falling back to the enrollment date,
     which is the substitution this migration exists to remove. */
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

  /* RE 303 p.4: all coursework within one year of registration, then re-enrollment. */
  v_expired := v_enrollment.status='expired'
    or (v_enrollment.expires_at is not null and now() >= v_enrollment.expires_at);

  if v_completed<15 then v_remaining:=v_remaining||jsonb_build_array((15-v_completed)::text||' lesson assignments'); end if;
  if v_access_at is null then v_remaining:=v_remaining||jsonb_build_array('Course access not yet granted'); end if;
  if v_access_at is not null and not v_calendar then v_remaining:=v_remaining||jsonb_build_array('California 2.5-week minimum period'); end if;
  if not v_cross_course then v_remaining:=v_remaining||jsonb_build_array('California two-course / five-week completion window'); end if;
  if not v_identity then v_remaining:=v_remaining||jsonb_build_array('Identity and proctor authorization'); end if;
  if v_expired then v_remaining:=v_remaining||jsonb_build_array('Enrollment expired - re-enrollment required'); end if;

  v_final := v_completed=15 and v_calendar and v_cross_course and v_identity and not v_expired;

  insert into course_final_eligibility(
    enrollment_id,course_id,course_version,earliest_final_exam_at,calendar_eligible,
    assignments_complete,quizzes_complete,interactive_requirements_complete,
    identity_requirements_complete,unresolved_compliance_blocks,remaining_requirements,final_exam_eligible,updated_at
  ) values(
    p_enrollment_id,v_enrollment.course_id,v_enrollment.course_version,v_earliest,v_calendar,
    v_completed=15,v_completed=15,v_completed=15,v_identity,
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
    'final_exam_eligible',v_final,'remaining_requirements',v_remaining);
end $$;

-- ---------------------------------------------------------------------------
-- 2. Expiry enforcement in the study path, and the lapse sweep
-- ---------------------------------------------------------------------------

/* Study time may not be credited to an expired enrollment. A reviewer keeps access,
   because the regulator's review account must reach the material regardless of any
   student clock, and reviewer activity is already excluded from student records. */
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

  /* RE 303 p.4 one-year limit, enforced rather than merely recorded. */
  if not v_reviewer and (v_enrollment.status='expired'
      or (v_enrollment.expires_at is not null and now() >= v_enrollment.expires_at)) then
    raise exception 'enrollment_expired';
  end if;

  select * into v_session from lms_active_sessions where id=p_session_id for update;
  if not found then
    raise exception 'session_not_found';
  end if;
  if v_session.enrollment_id <> p_enrollment_id then raise exception 'session_enrollment_mismatch'; end if;

  v_elapsed := greatest(0,least(120,extract(epoch from now()-v_session.last_seen_at)::integer));
  if p_active and p_mode='student' then v_credit := v_elapsed; end if;

  update lms_active_sessions
     set last_seen_at=now(),
         active_seconds=active_seconds+v_elapsed,
         credited_seconds=credited_seconds+v_credit
   where id=p_session_id;

  if v_credit>0 then
    update lms_compliance_state
       set credited_study_seconds=credited_study_seconds+v_credit,updated_at=now()
     where enrollment_id=p_enrollment_id;
  end if;

  insert into lms_regulatory_audit(
    enrollment_id,student_id,actor_id,actor_mode,course_id,course_version,assignment_id,event_type,session_id,detail
  ) values(
    p_enrollment_id,v_enrollment.student_id,p_actor_id,p_mode,
    v_enrollment.course_id,v_enrollment.course_version,p_assignment_id,'heartbeat',p_session_id,
    jsonb_build_object('active_signal',p_active,'credited_seconds',v_credit)||coalesce(p_metadata,'{}'::jsonb));
  return v_credit;
end $$;

/* Marks lapsed enrollments expired and revokes their access grants. Re-enrollment is
   a NEW enrollment through the ordinary path: the lapsed record is never revived,
   because its study history belongs to a period the regulation has closed. Completion
   records are untouched — an expiry never edits what a student did. */
create or replace function expire_lapsed_california_enrollments()
returns integer language plpgsql security definer set search_path=public as $$
declare
  v_expired integer := 0;
  v_row record;
begin
  for v_row in
    select e.id, e.student_id, e.course_id
      from enrollments e
      join courses c on c.id=e.course_id
     where c.state='CA'
       and e.status in ('active','qa_non_credit')
       and e.expires_at is not null
       and now() >= e.expires_at
  loop
    update enrollments set status='expired', updated_at=now() where id=v_row.id;
    update access_grants set status='revoked', revoked_at=now()
      where enrollment_id=v_row.id and status='active';
    insert into lms_regulatory_audit(
      enrollment_id,student_id,actor_id,actor_mode,course_id,course_version,assignment_id,event_type,detail
    )
    select v_row.id,v_row.student_id,v_row.student_id,'system',v_row.course_id,e.course_version,null,'enrollment_expired',
           jsonb_build_object('reason','one_year_completion_limit','expires_at',e.expires_at)
      from enrollments e where e.id=v_row.id;
    perform refresh_california_eligibility(v_row.id);
    v_expired := v_expired + 1;
  end loop;
  return v_expired;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Course completion certificates
-- ---------------------------------------------------------------------------

/* Regulation 3000(a)(6): the completion document is delivered within 15 days of
   successful completion. 3000(a)(4): records sufficient to prepare a duplicate on
   request. This table is that record.

   It is append-and-supersede, not update-in-place: a certificate that was issued
   wrongly is voided and a replacement issued referencing it, so the history of what
   was represented to a student and to the Department remains reconstructable. */
create table if not exists course_completion_certificates (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  course_version text not null,
  certificate_number text not null unique,
  completed_at timestamptz not null,
  issued_at timestamptz not null default now(),
  /* Regulation 3000(a)(6). Computed on issuance from the completion date, never from
     the issuance date, so a late issuance cannot move its own deadline. */
  delivery_due_at timestamptz not null,
  delivery_status text not null default 'pending'
    check (delivery_status in ('pending','delivered','failed','voided')),
  delivered_at timestamptz,
  delivery_method text,
  delivery_evidence jsonb not null default '{}'::jsonb,
  supersedes_certificate_id uuid references course_completion_certificates(id),
  void_reason text,
  voided_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists course_completion_certificates_active_idx
  on course_completion_certificates(enrollment_id)
  where delivery_status <> 'voided';

create index if not exists course_completion_certificates_due_idx
  on course_completion_certificates(delivery_due_at)
  where delivery_status = 'pending';

alter table course_completion_certificates enable row level security;
drop policy if exists course_completion_certificates_read_own on course_completion_certificates;
create policy course_completion_certificates_read_own on course_completion_certificates
  for select to authenticated using (student_id = auth.uid());

/* Issues the certificate for a completed enrollment. The only inputs are the
   completion event and the enrollment; no payment, refund, or checkout state is
   consulted. A voided prior certificate is superseded rather than overwritten. */
create or replace function issue_california_completion_certificate(
  p_enrollment_id uuid,
  p_certificate_number text default null
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_enrollment enrollments%rowtype;
  v_event course_completion_events%rowtype;
  v_existing course_completion_certificates%rowtype;
  v_number text;
  v_id uuid;
begin
  select * into v_enrollment from enrollments where id=p_enrollment_id;
  if not found or v_enrollment.state<>'CA' then raise exception 'california_enrollment_not_found'; end if;

  select * into v_event from course_completion_events where enrollment_id=p_enrollment_id;
  if not found then raise exception 'course_not_completed'; end if;
  if v_event.completion_status not in ('complete','qa_non_credit') then
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
    completed_at,delivery_due_at
  ) values(
    p_enrollment_id,v_enrollment.student_id,v_enrollment.course_id,v_enrollment.course_version,v_number,
    v_event.completed_at,v_event.completed_at + interval '15 days'
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
                       'delivery_due_at',v_event.completed_at + interval '15 days'));

  return jsonb_build_object('certificate_id',v_id,'certificate_number',v_number,'already_issued',false,
    'completed_at',v_event.completed_at,'delivery_due_at',v_event.completed_at + interval '15 days',
    'delivery_status','pending');
end $$;

/* Records delivery. Separate from issuance because the 15-day obligation is about
   delivery, and a certificate created but not delivered is not compliance. */
create or replace function record_certificate_delivery(
  p_certificate_id uuid,
  p_delivery_method text,
  p_evidence jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_cert course_completion_certificates%rowtype;
begin
  select * into v_cert from course_completion_certificates where id=p_certificate_id;
  if not found then raise exception 'certificate_not_found'; end if;
  if v_cert.delivery_status='voided' then raise exception 'certificate_voided'; end if;

  update course_completion_certificates
     set delivery_status='delivered', delivered_at=now(),
         delivery_method=p_delivery_method, delivery_evidence=coalesce(p_evidence,'{}'::jsonb)
   where id=p_certificate_id;

  insert into lms_regulatory_audit(
    enrollment_id,student_id,actor_id,actor_mode,course_id,course_version,assignment_id,event_type,detail
  ) values(
    v_cert.enrollment_id,v_cert.student_id,v_cert.student_id,'system',
    v_cert.course_id,v_cert.course_version,null,'certificate_delivered',
    jsonb_build_object('certificate_number',v_cert.certificate_number,'method',p_delivery_method,
                       'delivered_at',now(),'delivery_due_at',v_cert.delivery_due_at,
                       'within_15_days',now() <= v_cert.delivery_due_at));

  return jsonb_build_object('certificate_id',p_certificate_id,'delivered_at',now(),
    'delivery_due_at',v_cert.delivery_due_at,'within_15_days',now() <= v_cert.delivery_due_at);
end $$;

/* Certificates past their delivery deadline and still undelivered. This is the
   compliance report for 3000(a)(6); an empty result is the passing state. */
create or replace view california_certificate_delivery_overdue as
select c.id, c.enrollment_id, c.student_id, c.course_id, c.certificate_number,
       c.completed_at, c.delivery_due_at, c.delivery_status,
       (now() - c.delivery_due_at) as overdue_by
  from course_completion_certificates c
  join courses cs on cs.id=c.course_id
 where cs.state='CA' and c.delivery_status='pending' and now() > c.delivery_due_at;
