-- The learner's own NMLS Unique Identifier, and an immutable record of every correction.
--
-- Required by BioSig-ID acceptance item 7 (email of 2026-11-17): a student must be able to
-- correct a mistyped NMLS agent ID themselves, and the number must be part of their
-- profile. A number that identifies a person to a regulator is not an ordinary preference,
-- so each change is written to an append-only log beside the current value.
--
-- NOT APPLIED TO PRODUCTION BY THIS COMMIT. Applying it is a production change and needs
-- the owner's approval; until then this file is the proposal, not the live schema.
--
-- The column is deliberately nullable: most learners have no number on the day they
-- register, and an empty profile field must not be mistaken for a verified one.

alter table students add column if not exists nmls_id text;

-- Digits only. The ceiling is provisional and matches config/nmls/student-identifier.mjs;
-- the authoritative rule is in the NMLS Functional Specifications, which have not been
-- read. The constraint rejects letters, punctuation and an empty string, which is what a
-- typo actually looks like. Change both places together, never one alone.
alter table students drop constraint if exists students_nmls_id_digits;
alter table students add constraint students_nmls_id_digits
  check (nmls_id is null or nmls_id ~ '^[0-9]{1,12}$');

comment on column students.nmls_id is
  'Learner-entered NMLS Unique Identifier. Format-checked only. Not verified against NMLS and not proof of identity; the BioSig checkpoint and NMLS remain the only authorities.';

-- One row per change, including the first entry. Never updated, never deleted.
create table if not exists student_nmls_id_changes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  previous_nmls_id text,
  new_nmls_id text not null,
  changed_at timestamptz not null default now(),
  -- Where the change came from, so a self-service correction is distinguishable from
  -- anything an operator does later.
  source text not null default 'student_portal'
    check (source in ('student_portal','staff_correction','migration')),
  check (new_nmls_id ~ '^[0-9]{1,12}$'),
  -- A change must change something; a no-op write is a bug, not a record.
  check (previous_nmls_id is null or previous_nmls_id <> new_nmls_id)
);

create index if not exists student_nmls_id_changes_student
  on student_nmls_id_changes(student_id, changed_at desc);

comment on table student_nmls_id_changes is
  'Append-only history of learner NMLS identifier entries and corrections. Retained as part of the identity record required for NMLS course delivery.';

alter table student_nmls_id_changes enable row level security;

-- Learners read their own history and nothing else. No insert, update or delete policy
-- exists for any client role: every write goes through a function using the service role,
-- so a browser cannot forge or rewrite an identity record.
drop policy if exists student_nmls_id_changes_read_own on student_nmls_id_changes;
create policy student_nmls_id_changes_read_own on student_nmls_id_changes
  for select to authenticated using (student_id = auth.uid());

grant select on student_nmls_id_changes to authenticated;

-- Block the one path that would let a browser write the number directly. The existing
-- students_read_own policy grants select only, and no update policy is added here, so
-- students cannot PATCH their own row through PostgREST.
revoke insert, update, delete on students from authenticated;

-- Setting the number and recording the change are one transaction. Done as two separate
-- statements from a function, a failure between them leaves either an identity change with
-- no record of it, or a record of a change that never happened. Both are worse than an
-- error, so neither is possible here.
create or replace function set_student_nmls_id(
  p_student uuid,
  p_value text,
  p_source text default 'student_portal'
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_previous text;
  v_exists boolean;
begin
  if p_value is null or p_value !~ '^[0-9]{1,12}$' then
    raise exception 'nmls_id_invalid' using errcode = '22023';
  end if;
  if p_source not in ('student_portal','staff_correction','migration') then
    raise exception 'nmls_id_source_invalid' using errcode = '22023';
  end if;

  -- Lock the row so two concurrent corrections cannot interleave and log the wrong
  -- previous value.
  select nmls_id, true into v_previous, v_exists
    from students where id = p_student for update;

  if not coalesce(v_exists, false) then
    raise exception 'student_not_found' using errcode = 'P0002';
  end if;

  if v_previous is not distinct from p_value then
    return jsonb_build_object('changed', false, 'nmls_id', p_value);
  end if;

  insert into student_nmls_id_changes(student_id, previous_nmls_id, new_nmls_id, source)
    values (p_student, v_previous, p_value, p_source);

  update students set nmls_id = p_value, updated_at = now() where id = p_student;

  return jsonb_build_object('changed', true, 'nmls_id', p_value, 'previous', v_previous);
end;
$$;

-- Callable only by the service role used inside functions. A signed-in browser must not
-- reach it directly: the session's own student id is established server-side, and letting
-- a client pass p_student would let one learner write another learner's identifier.
revoke all on function set_student_nmls_id(uuid, text, text) from public, anon, authenticated;
