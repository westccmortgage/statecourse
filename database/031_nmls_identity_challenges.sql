-- BioSig-ID identity checks for the credit version of the national mortgage course.
--
-- One row per check a student is sent to BioSig-ID for. A row is the only thing that can
-- open a checkpoint: BSI's callback must name a row that is still pending, for the same
-- student identifier, before it expires, and a verified row is spent once.
--
-- NOT APPLIED TO PRODUCTION BY THIS COMMIT. Applying it is a production change and needs
-- the owner's approval. Nothing reads or writes this table while NMLS_CREDIT_CHECKPOINTS
-- is not "biosig", so the site runs unchanged without it.
--
-- Holds no credential and no BSI secret. `uid` is the identifier sent to BSI: the
-- student's own NMLS ID, or the reviewer identifier assigned to a reviewer account.
begin;
do $preflight$ begin
 if to_regclass('public.nmls_training_attempts') is null then
  raise exception 'Apply verified NMLS025 before NMLS031';end if;
end $preflight$;

create table if not exists nmls_identity_challenges (
 id uuid primary key default gen_random_uuid(),
 enrollment_id uuid not null references enrollments(id),
 student_id uuid not null references students(id),
 course_id text not null check (course_id = 'nmls-ce-2026-comprehensive-8'),
 checkpoint text not null check (checkpoint in ('begin','middle_1','middle_2','final_exam','resuming')),
 d3 text not null check (d3 in ('Begin','Middle#1','Middle#2','FinalExam','Resuming')),
 uid text not null check (uid ~ '^[A-Za-z0-9._-]{1,40}$'),
 status text not null default 'pending' check (status in ('pending','verified','failed','expired','consumed')),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null,
 completed_at timestamptz,
 consumed_at timestamptz,
 check (expires_at > created_at),
 check ((status in ('verified','failed','consumed')) = (completed_at is not null)),
 check ((status = 'consumed') = (consumed_at is not null))
);
create index if not exists nmls_identity_challenges_enrollment on nmls_identity_challenges(enrollment_id, created_at desc);

-- A check moves forward only: pending -> verified | failed | expired, verified -> consumed.
-- Identity columns never change, and no row is deleted.
create or replace function nmls_identity_challenge_guard() returns trigger language plpgsql as $$
begin
 if tg_op = 'DELETE' then raise exception 'nmls_identity_challenge_immutable'; end if;
 if (new.id,new.enrollment_id,new.student_id,new.course_id,new.checkpoint,new.d3,new.uid,new.created_at,new.expires_at)
    is distinct from (old.id,old.enrollment_id,old.student_id,old.course_id,old.checkpoint,old.d3,old.uid,old.created_at,old.expires_at) then
  raise exception 'nmls_identity_challenge_immutable'; end if;
 if not ((old.status = 'pending' and new.status in ('verified','failed','expired'))
      or (old.status = 'verified' and new.status = 'consumed')) then
  raise exception 'nmls_identity_challenge_transition'; end if;
 return new;
end $$;
drop trigger if exists nmls_identity_challenge_guard on nmls_identity_challenges;
create trigger nmls_identity_challenge_guard before update or delete on nmls_identity_challenges
 for each row execute function nmls_identity_challenge_guard();

alter table nmls_identity_challenges enable row level security;
revoke all on nmls_identity_challenges from public, anon, authenticated;
grant select, insert, update on nmls_identity_challenges to service_role;
commit;
