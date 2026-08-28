begin;

-- CA-BLOCK-1 — learning-block delivery state. Apply after 013.
--
-- WHAT THIS MIGRATION HOLDS, AND WHAT IT DELIBERATELY DOES NOT. Per-student block progress and
-- block assessment evidence live here. The block and screen DEFINITIONS — the work order's
-- instructional_blocks / instructional_screens — live in config/california/mortgage-a1-blocks.mjs,
-- following the existing StateCourse pattern (course structure in versioned config, per-student
-- state in the database: exactly how assignments themselves already work). Mirroring definition
-- rows into the database would duplicate data the config already owns; the block_id / screen_id
-- columns below reference those config-defined identifiers, and course_id + course_version pin
-- which definition version a row was recorded against.
--
-- NOTHING HERE TOUCHES A REGULATORY GATE. lms_assignment_state, lms_assessment_attempts,
-- lms_remediation_events, eligibility, timing and final-exam objects are unchanged. Block rows
-- are an ADDITIONAL evidence layer underneath the existing assignment record.

create table if not exists lms_block_progress (
  enrollment_id uuid not null references enrollments(id),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  course_version text not null,
  assignment_id text not null,
  block_id text not null,
  -- Derived by the server from evidence on every read; stored so the portal can list state
  -- without re-deriving, but NEVER trusted from a client and re-derived before every decision.
  status text not null default 'NOT_STARTED'
    check (status in ('NOT_STARTED','IN_PROGRESS','RETRIEVAL_REQUIRED','REMEDIATION_REQUIRED','MASTERED')),
  current_screen_id text,
  completed_screens jsonb not null default '[]'::jsonb,
  started_at timestamptz,
  last_activity_at timestamptz,
  mastered_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (enrollment_id, assignment_id, block_id)
);

create index if not exists lms_block_progress_student on lms_block_progress(student_id, course_id);

create table if not exists lms_block_assessment_attempts (
  id bigint generated always as identity primary key,
  enrollment_id uuid not null references enrollments(id),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  course_version text not null,
  assignment_id text not null,
  block_id text not null,
  screen_id text,
  question_id text,
  concept_id text,
  -- retrieval: the block's primary question; replacement: the different question on the same
  -- concept served after remediation; practice: a committed written analysis on a practice
  -- screen (correct is null — practice is required, not graded); remediation_review: the
  -- recorded return to the instruction screen; spaced: reserved for the spaced-retrieval
  -- capability, built now and not yet activated.
  kind text not null check (kind in ('retrieval','replacement','practice','remediation_review','spaced')),
  attempt_number integer not null default 1 check (attempt_number >= 1),
  response jsonb,
  correct boolean,
  remediation_required boolean not null default false,
  replacement_question_id text,
  created_at timestamptz not null default now()
);

create index if not exists lms_block_attempts_lookup
  on lms_block_assessment_attempts(enrollment_id, assignment_id, block_id, created_at);

-- The mastery rule, enforced where the data lives as well as in the engine: a MASTERED row for a
-- block must be accompanied by recorded evidence. The trigger refuses a MASTERED status write
-- when the block has no correct retrieval/replacement evidence at all — so even a compromised
-- caller writing directly to the table cannot mark mastery from nothing. (The B7 synthesis block
-- is regulatory-mastery: its evidence is the existing lms_assignment_state row, checked here.)
create or replace function lms_block_mastery_guard() returns trigger as $$
declare
  has_retrieval boolean;
  regulatory_ok boolean;
begin
  if new.status <> 'MASTERED' then return new; end if;
  if new.block_id like '%-b7' then
    select (a.applied_exercise_complete and a.engagement_check_complete
            and a.remediation_status in ('not_required','satisfied'))
      into regulatory_ok
      from lms_assignment_state a
     where a.enrollment_id = new.enrollment_id and a.assignment_id = new.assignment_id
     limit 1;
    if not coalesce(regulatory_ok,false) then
      raise exception 'block % cannot be MASTERED: the regulatory assignment evidence is not complete', new.block_id;
    end if;
    return new;
  end if;
  select exists (
    select 1 from lms_block_assessment_attempts t
     where t.enrollment_id = new.enrollment_id
       and t.assignment_id = new.assignment_id
       and t.block_id = new.block_id
       and t.kind in ('retrieval','replacement')
       and t.correct is true
  ) into has_retrieval;
  if not has_retrieval then
    raise exception 'block % cannot be MASTERED without correct retrieval evidence', new.block_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists lms_block_mastery_guard on lms_block_progress;
create trigger lms_block_mastery_guard
  before insert or update of status on lms_block_progress
  for each row execute function lms_block_mastery_guard();

commit;
