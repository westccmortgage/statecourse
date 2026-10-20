-- Recovery proof for migration 071. Run only in the throwaway cluster after
-- all migrations; the surrounding transaction is rolled back at the end.
-- Simulate the two forms of drift that 071 repaired, then replay the exact
-- committed migration rather than maintaining a second copy of its DDL.
begin;

insert into public.organizations(id, name)
values ('aaaaaaaa-0000-0000-0000-000000000071', '071 recovery fixture');
insert into public.runtime_incidents (organization_id, application, incident_signature,
  evidence_fingerprint, failing_stage, exception_class, error_code,
  policy_version, engine_version)
values ('aaaaaaaa-0000-0000-0000-000000000071', 'markevita', repeat('7', 64),
  repeat('8', 64), 'assemble', 'RuntimeError', 'recoverable',
  'runtime-incident.policy.1', 'core-v2/2.0');

create temp table proof_counts as
select 'runtime_incidents'::text as relation, count(*)::bigint as rows_before from public.runtime_incidents
union all select 'runtime_incident_recoveries', count(*) from public.runtime_incident_recoveries
union all select 'runtime_incident_verifications', count(*) from public.runtime_incident_verifications
union all select 'runtime_recovery_knowledge', count(*) from public.runtime_recovery_knowledge
union all select 'core_v2_task_completions', count(*) from public.core_v2_task_completions;

grant all on public.runtime_incidents, public.runtime_incident_recoveries,
  public.runtime_incident_verifications, public.runtime_recovery_knowledge,
  public.core_v2_task_completions to service_role;

do $$
declare relation_name text;
begin
  foreach relation_name in array array[
    'runtime_incidents', 'runtime_incident_recoveries',
    'runtime_incident_verifications', 'runtime_recovery_knowledge',
    'core_v2_task_completions'
  ] loop
    execute format('drop trigger core_v2_refuse_delete on public.%I', relation_name);
    execute format('drop trigger core_v2_refuse_truncate on public.%I', relation_name);
  end loop;
end $$;

-- psql resolves \ir relative to this file. Replaying 071 must restore the
-- boundary even on a database with all five records already present.
\ir ../migrations/071_a_proof_that_cannot_be_deleted.sql

do $$
declare offending text;
        incident_id uuid;
begin
  select string_agg(format('%s:%s', table_name, privilege_type), ', ')
    into offending
    from information_schema.role_table_grants
   where table_schema = 'public' and grantee = 'service_role'
     and table_name in ('runtime_incidents', 'runtime_incident_recoveries',
                        'runtime_incident_verifications', 'runtime_recovery_knowledge',
                        'core_v2_task_completions')
     and (privilege_type in ('DELETE', 'TRUNCATE')
          or (privilege_type = 'UPDATE' and table_name in
                ('runtime_incident_verifications', 'runtime_recovery_knowledge')));
  if offending is not null then
    raise exception '071 recovery left forbidden privileges: %', offending;
  end if;

  if (select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid
       where not t.tgisinternal
         and t.tgname in ('core_v2_refuse_delete', 'core_v2_refuse_truncate')
         and c.relname in ('runtime_incidents', 'runtime_incident_recoveries',
                           'runtime_incident_verifications', 'runtime_recovery_knowledge',
                           'core_v2_task_completions')) <> 10 then
    raise exception '071 recovery did not restore all ten removal guards';
  end if;

  if exists (
    select 1 from proof_counts p
    where p.rows_before is distinct from case p.relation
      when 'runtime_incidents' then (select count(*) from public.runtime_incidents)
      when 'runtime_incident_recoveries' then (select count(*) from public.runtime_incident_recoveries)
      when 'runtime_incident_verifications' then (select count(*) from public.runtime_incident_verifications)
      when 'runtime_recovery_knowledge' then (select count(*) from public.runtime_recovery_knowledge)
      when 'core_v2_task_completions' then (select count(*) from public.core_v2_task_completions)
    end
  ) then
    raise exception '071 recovery changed recorded rows';
  end if;

  select id into incident_id from public.runtime_incidents
   where organization_id = 'aaaaaaaa-0000-0000-0000-000000000071';
  if incident_id is null then raise exception '071 recovery lost its incident fixture'; end if;
  begin
    delete from public.runtime_incidents where id = incident_id;
    raise exception '071 recovery allowed incident deletion';
  exception when check_violation then
    if not exists (select 1 from public.runtime_incidents where id = incident_id) then
      raise exception '071 recovery deleted incident despite refusal';
    end if;
  end;
  begin
    -- Referencing recovery rows make an ordinary TRUNCATE fail before the
    -- removal trigger runs; CASCADE reaches the rule we are testing.
    truncate public.runtime_incidents cascade;
    raise exception '071 recovery allowed incident truncation';
  exception when check_violation then
    if not exists (select 1 from public.runtime_incidents where id = incident_id) then
      raise exception '071 recovery truncated incident despite refusal';
    end if;
  end;
end $$;

rollback;
select 'PASS  071 safe-forward recovery replays without removing records' as result;
