-- ROLLBACK FOR MIGRATIONS 069 AND 070, in the reverse order they were applied.
--
-- NOT in supabase/migrations/: the runner applies every .sql file it finds
-- there, and a rollback that runs as part of the chain would undo the chain.
--
-- Safe because both migrations are additive. They create tables, functions,
-- triggers and indexes that nothing in 001–068 reads, so dropping them returns
-- the schema to 068 exactly and leaves every V1 and Core V2 row where it was.
-- What it does destroy is the incident record and the completion record — every
-- proof of completion written since 070 went in. That is why this is a rollback
-- and not a routine operation: prefer a forward fix in 071 whenever one exists.
--
-- TESTED on the PR #231 preview branch (cmokpwpeuhkltpoccdig) before 069 and 070
-- were applied to production: dropped clean, 058's `segment` and `workflow`
-- machines survived, and the two migrations re-applied afterwards with the whole
-- invariant suite still passing.
--
-- The trigger names are NOT the guard function names. A first draft of this file
-- was written from the function names, failed on the first dependency, and
-- applied nothing — which is the whole reason a rollback is tested before it is
-- needed rather than at the moment it is.

begin;

-- ── 070 · the completion record ───────────────────────────────────────────────
drop trigger if exists core_v2_guard_task_completion on public.core_v2_task_completions;
drop function if exists public.core_v2_guard_task_completion();
drop function if exists public.core_v2_record_completion(
  uuid, text, text, text, text, boolean, text, text, boolean, text, jsonb, text[], text, text, text, uuid, text);
drop table if exists public.core_v2_task_completions;
drop function if exists public.core_v2_gates_all_passed(jsonb);
drop function if exists public.core_v2_completion_transition_allowed(text, text);

-- ── 069 · the incident record ─────────────────────────────────────────────────
drop trigger if exists runtime_knowledge_guard on public.runtime_recovery_knowledge;
drop trigger if exists runtime_verifications_guard on public.runtime_incident_verifications;
drop trigger if exists runtime_recoveries_guard on public.runtime_incident_recoveries;
drop trigger if exists runtime_incidents_guard on public.runtime_incidents;
drop function if exists public.core_v2_guard_runtime_knowledge();
drop function if exists public.core_v2_guard_runtime_verification();
drop function if exists public.core_v2_guard_runtime_recovery();
drop function if exists public.core_v2_guard_runtime_incident();
drop function if exists public.core_v2_record_recovery_knowledge(uuid, text, text, text);
drop function if exists public.core_v2_settle_recovery(uuid, uuid, text, text, integer, numeric, boolean, text);
drop function if exists public.core_v2_claim_recovery(
  uuid, uuid, text, text, text, text[], text[], text, integer, numeric, text, integer, uuid);
drop function if exists public.core_v2_incident_transition(uuid, text, text, text, text, text, text);
drop table if exists public.runtime_recovery_knowledge;
drop table if exists public.runtime_incident_verifications;
drop table if exists public.runtime_incident_recoveries;
drop table if exists public.runtime_incidents;
drop function if exists public.core_v2_incident_transition_allowed(text, text);

-- What must still be true afterwards. 058 declared these and neither migration
-- came to change them; a rollback that took them with it would be the same
-- defect 069's own comment is about, arriving from the other direction.
do $$
begin
  if not public.core_v2_transition_allowed('segment', 'proposed', 'accepted')
     or not public.core_v2_transition_allowed('workflow', 'created', 'queued') then
    raise exception 'rollback took 058''s state machines with it; not committing';
  end if;
end $$;

commit;
