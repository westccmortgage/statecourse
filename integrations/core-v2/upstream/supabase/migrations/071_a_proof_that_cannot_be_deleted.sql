-- ═══════════════════════════════════════════════════════════════════════════
-- A PROOF THAT CANNOT BE DELETED
--
-- 070 says, in its own comment: "No delete, for anybody: a task whose completion
-- record can be removed has no proof of completion at all." It did not achieve
-- that, and 069 did not achieve the same thing for the verification verdicts and
-- the recovery knowledge it calls written-once.
--
-- Both migrations said `revoke all ... from public, anon, authenticated` and then
-- `grant select, insert ... to service_role`. Neither revoked anything from
-- service_role, and a GRANT does not narrow a privilege that is already held.
-- This project carries default privileges that hand service_role ALL privileges
-- on new tables in `public`, so the moment those tables existed, the role the
-- application runs as could DELETE and TRUNCATE every one of them.
--
-- The throwaway PostgreSQL the invariant suite uses has no such default
-- privileges, and neither did the fresh preview branch, so both reported the
-- absence of a DELETE grant that was only ever absent because nothing had
-- granted it. The defect was invisible until the migrations reached a database
-- that had been configured by a real project. It is visible now.
--
-- Two fixes, because one of them is not enough:
--
--   1. Revoke the privileges, so the grants finally say what the comments say.
--   2. Refuse DELETE and TRUNCATE in a trigger, so the next `grant all on all
--      tables in schema public to service_role` — a line that appears in
--      ordinary Supabase setup and in this repository's own test harness —
--      cannot quietly undo it again.
--
-- A grant is a configuration and configurations drift. A trigger is a rule.
--
-- `postgres` keeps its privileges. It owns the schema, it can re-grant anything
-- it likes, and taking them from it breaks the dashboard and the backups without
-- protecting anything: the triggers below are what actually hold the line, and
-- they hold it against every role including that one.
--
-- ADDITIVE, and it restates nothing. 069 and 070 are already applied — to
-- production and to the PR preview branch — so they are not edited; this is the
-- forward fix, which is the only kind available once a migration has run.
-- ═══════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════ 1 · the grants say what we meant
--
-- REVOKE first, then GRANT exactly what each table needs. Stating the grant
-- again after the revoke is not redundant: the revoke takes the whole set away,
-- including the parts 069 and 070 meant to keep.

-- Append-only: a verdict and a proven recovery are written once and read forever.
revoke all on public.runtime_incident_verifications from service_role;
revoke all on public.runtime_recovery_knowledge from service_role;
grant select, insert on public.runtime_incident_verifications to service_role;
grant select, insert on public.runtime_recovery_knowledge to service_role;

-- Records that move through a state machine: insert, read, and update, nothing else.
revoke all on public.runtime_incidents from service_role;
revoke all on public.runtime_incident_recoveries from service_role;
revoke all on public.core_v2_task_completions from service_role;
grant select, insert, update on public.runtime_incidents to service_role;
grant select, insert, update on public.runtime_incident_recoveries to service_role;
grant select, insert, update on public.core_v2_task_completions to service_role;

-- And the browser roles, again, in case a default privilege reached them too.
revoke all on public.runtime_incidents from public, anon, authenticated;
revoke all on public.runtime_incident_recoveries from public, anon, authenticated;
revoke all on public.runtime_incident_verifications from public, anon, authenticated;
revoke all on public.runtime_recovery_knowledge from public, anon, authenticated;
revoke all on public.core_v2_task_completions from public, anon, authenticated;

-- ═════════════════════════════════════════════════ 2 · and a rule behind them
--
-- One function for all five tables. It names the table it refused so the message
-- is useful, and it refuses TRUNCATE as well as DELETE — a statement-level
-- trigger is the only thing that sees a TRUNCATE at all, and TRUNCATE is how a
-- record with no DELETE grant gets emptied anyway.

create or replace function public.core_v2_refuse_removal() returns trigger
language plpgsql as $$
begin
  raise exception
    'core_v2: %.% is a record of what happened; rows are never removed from it',
    tg_table_schema, tg_table_name
    using errcode = 'check_violation',
          hint = 'Nothing in this engine deletes evidence. If a row is wrong, the record of it being wrong is the point.';
end $$;

comment on function public.core_v2_refuse_removal() is
  'Refuses DELETE and TRUNCATE on the engine''s own records, for every role including the owner. Grants are configuration and drift; this is the rule.';

do $$
declare t text;
begin
  foreach t in array array[
    'runtime_incidents', 'runtime_incident_recoveries', 'runtime_incident_verifications',
    'runtime_recovery_knowledge', 'core_v2_task_completions'
  ] loop
    execute format('drop trigger if exists core_v2_refuse_delete on public.%I', t);
    execute format('drop trigger if exists core_v2_refuse_truncate on public.%I', t);
    execute format(
      'create trigger core_v2_refuse_delete before delete on public.%I '
      'for each row execute function public.core_v2_refuse_removal()', t);
    execute format(
      'create trigger core_v2_refuse_truncate before truncate on public.%I '
      'for each statement execute function public.core_v2_refuse_removal()', t);
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════ 3 · what must be true
--
-- Asserted here, in the migration, against the database it just changed. A
-- migration whose whole purpose is a privilege boundary should not leave the
-- question of whether it worked to a test suite running somewhere else.

do $$
declare offending text;
begin
  select string_agg(format('%s:%s:%s', table_name, grantee, privilege_type), ', ' order by table_name)
    into offending
    from information_schema.role_table_grants
   where table_schema = 'public'
     and table_name in ('runtime_incidents', 'runtime_incident_recoveries',
                        'runtime_incident_verifications', 'runtime_recovery_knowledge',
                        'core_v2_task_completions')
     and grantee in ('anon', 'authenticated', 'public', 'service_role')
     and privilege_type in ('DELETE', 'TRUNCATE');
  if offending is not null then
    raise exception 'core_v2: 071 did not close the removal grants: %', offending;
  end if;

  select string_agg(format('%s:%s', table_name, privilege_type), ', ' order by table_name)
    into offending
    from information_schema.role_table_grants
   where table_schema = 'public'
     and table_name in ('runtime_incident_verifications', 'runtime_recovery_knowledge')
     and grantee = 'service_role' and privilege_type = 'UPDATE';
  if offending is not null then
    raise exception 'core_v2: an append-only record may not be updated: %', offending;
  end if;

  if (select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid
       where not t.tgisinternal
         and t.tgname in ('core_v2_refuse_delete', 'core_v2_refuse_truncate')
         and c.relname in ('runtime_incidents', 'runtime_incident_recoveries',
                           'runtime_incident_verifications', 'runtime_recovery_knowledge',
                           'core_v2_task_completions')) <> 10 then
    raise exception 'core_v2: every one of the five records needs both a delete and a truncate guard';
  end if;
end $$;
