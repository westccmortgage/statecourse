-- Provider-prefixed BioSig-ID identifiers ("StateCourse-001"), one number per student.
--
-- BSI's analyst (2026-11-20) says production identifiers must be provider-prefixed so they
-- cannot collide with other users' activity. Whether that applies to this NMLS course, or
-- the student's own NMLS ID is used instead, is to be confirmed with BSI. This table is
-- used only when BIOSIG_UID_MODE=provider_prefixed.
--
-- A number is assigned once and never changes or returns to the pool, so the same person
-- is always the same BioSig-ID user.
--
-- NOT APPLIED TO PRODUCTION BY THIS COMMIT. Needs the owner's approval, after 031.
begin;
create table if not exists nmls_biosig_identifiers (
 student_id uuid primary key references students(id),
 sequence bigint generated always as identity (start with 1) unique,
 assigned_at timestamptz not null default now()
);
create or replace function nmls_biosig_identifier_guard() returns trigger language plpgsql as $$
begin raise exception 'nmls_biosig_identifier_immutable'; end $$;
drop trigger if exists nmls_biosig_identifier_guard on nmls_biosig_identifiers;
create trigger nmls_biosig_identifier_guard before update or delete on nmls_biosig_identifiers
 for each row execute function nmls_biosig_identifier_guard();
alter table nmls_biosig_identifiers enable row level security;
revoke all on nmls_biosig_identifiers from public, anon, authenticated;
grant select, insert on nmls_biosig_identifiers to service_role;
commit;
