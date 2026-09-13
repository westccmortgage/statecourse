-- LOCAL ONLY. Reconcile numbering with the NEW infrastructure handoff.
-- Foundation for a future joint teaching transaction; NOT that transaction.
-- No phase acquisition API, history backfill, journal relabeling or live writes.
begin;

alter table public.nmls_review_study_leases add column phase_kind text,
  add column phase_owner_id uuid,
  add constraint nmls_review_lease_phase_shape check (coalesce(
    (phase_kind is null and phase_owner_id is null) or
    (phase_kind in ('source','remediation') and phase_owner_id is not null
      and attempt_id is not null and session_id is not null),false));

-- Integrity only, not permission to acquire/transfer a lease. The future joint
-- writer must validate the journal, revisions, deadlines and phase transition.
-- Existing leases remain unmarked; NULL is NOT an assertion of source provenance.
create function public.nmls_review_lease_phase_integrity() returns trigger
language plpgsql set search_path=pg_catalog,public as $$
begin
  if tg_op='DELETE' then
    if old.phase_kind is not null then raise exception 'nmls_review_phase_lease_transition_requires_joint_commit'; end if;
    return old;
  end if;
  if tg_op='UPDATE' then
    if new.student_id is distinct from old.student_id then raise exception 'nmls_review_invalid_phase_lease'; end if;
    --030 provides no authorized phase transition.031 must replace this guard
    -- with its jointly validated acquisition/release mechanism before use.
    if old.phase_kind is not null and new is distinct from old then
      raise exception 'nmls_review_phase_lease_transition_requires_joint_commit'; end if;
  end if;
  if new.phase_kind is null then return new; end if;
  if not exists(select 1 from public.nmls_review_attempts a
    where a.id=new.attempt_id and a.student_id=new.student_id) then
    raise exception 'nmls_review_invalid_phase_lease'; end if;
  if new.phase_kind='source' and new.phase_owner_id is distinct from new.attempt_id then
    raise exception 'nmls_review_invalid_phase_lease'; end if;
  if new.phase_kind='remediation' and not exists(
    select 1 from public.nmls_private_finals f join public.nmls_private_remediations w on w.first_final_id=f.id
    where f.id=new.phase_owner_id and f.review_attempt_id=new.attempt_id and f.student_id=new.student_id
      and f.revision=2 and f.result->'passed'='false'::jsonb
      and w.review_attempt_id=new.attempt_id and w.student_id=new.student_id and w.status='remediating'
  ) then raise exception 'nmls_review_invalid_phase_lease'; end if;
  return new;
end $$;
create trigger nmls_review_lease_phase_integrity before insert or update or delete on public.nmls_review_study_leases
  for each row execute function public.nmls_review_lease_phase_integrity();

-- Called only by owner-executed wrappers. Grant -> actor mutex is the common
-- prefix of every old writer's lock order; retain both through delegation.
-- Do not use a caller-set custom GUC as authority to bypass this fence.
create function public.nmls_review_legacy_write_fence(p_actor uuid,p_review uuid,
  p_event uuid,p_digest text,p_namespace text) returns void
language plpgsql set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants; lease public.nmls_review_study_leases;
  expected_namespace text:=p_namespace; e record;
begin
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a on a.grant_id=g0.id
    where a.id=p_review and a.student_id=p_actor for share of g0;
  if not found or g.student_id is distinct from p_actor or g.status<>'active' or g.expires_at<=clock_timestamp() then
    raise exception 'nmls_review_access_denied'; end if;
  insert into public.nmls_review_study_leases(student_id) values(p_actor) on conflict do nothing;
  select * into lease from public.nmls_review_study_leases where student_id=p_actor for update;
  if g.expires_at<=clock_timestamp() then raise exception 'nmls_review_access_denied'; end if;
  -- Includes old exact replay: the unbound review adapter hydrates old material.
  -- Only the future joint path may return metadata-only phase-era replays.
  if lease.phase_kind is not null then raise exception 'nmls_review_teaching_phase_requires_joint_commit'; end if;
  if p_event is null or p_digest is null or p_digest !~ '^[a-f0-9]{64}$'
    or p_namespace is null or p_namespace not in ('review','policy','first_final','remediation') then
    raise exception 'nmls_review_invalid_command'; end if;
  if p_namespace='review' and exists(select 1 from public.nmls_review_policy_bindings where grant_id=g.id) then
    expected_namespace:='policy'; end if;
  -- A policy receipt has two matching journal rows, not two independent writes.
  -- Historical missing/contradictory halves require review, never a new receipt.
  if exists(select 1 from public.nmls_review_actor_policy_events p
      where p.student_id=p_actor and p.event_id=p_event and not exists(
        select 1 from public.nmls_review_attempt_events r join public.nmls_review_attempts a on a.id=r.attempt_id
          join public.nmls_review_policy_bindings b on b.grant_id=a.grant_id
        where a.student_id=p_actor and r.attempt_id=p.attempt_id and r.event_id=p.event_id
          and r.command_digest=p.command_digest and r.resulting_revision=p.attempt_revision))
    or exists(select 1 from public.nmls_review_attempt_events r
      join public.nmls_review_attempts a on a.id=r.attempt_id
      join public.nmls_review_policy_bindings b on b.grant_id=a.grant_id
      where a.student_id=p_actor and r.event_id=p_event and not exists(
        select 1 from public.nmls_review_actor_policy_events p where p.student_id=p_actor and p.event_id=r.event_id
          and p.attempt_id=r.attempt_id and p.command_digest=r.command_digest and p.attempt_revision=r.resulting_revision)) then
    raise exception 'nmls_review_idempotency_conflict'; end if;
  -- Review and actor-policy rows produced by025 are a single logical command.
  -- Query history directly: no unbounded backfill and no silent reconciliation.
  -- Add the FUTURE teaching-event namespace here before enabling its writer.
  for e in
    select a.id as review_id,r.command_digest as digest,
      case when b.grant_id is null then 'review' else 'policy' end as namespace
      from public.nmls_review_attempt_events r join public.nmls_review_attempts a on a.id=r.attempt_id
      left join public.nmls_review_policy_bindings b on b.grant_id=a.grant_id
      where a.student_id=p_actor and r.event_id=p_event
    union all select r.attempt_id,r.command_digest,'policy' from public.nmls_review_actor_policy_events r
      where r.student_id=p_actor and r.event_id=p_event
    union all select f.review_attempt_id,r.command_digest,'first_final' from public.nmls_private_final_events r
      join public.nmls_private_finals f on f.id=r.final_id where r.student_id=p_actor and r.event_id=p_event
    union all select w.review_attempt_id,r.command_digest,'remediation' from public.nmls_private_remediation_events r
      join public.nmls_private_remediations w on w.first_final_id=r.first_final_id where r.student_id=p_actor and r.event_id=p_event
  loop
    if e.namespace is distinct from expected_namespace or e.review_id is distinct from p_review or e.digest is distinct from p_digest then
      raise exception 'nmls_review_idempotency_conflict'; end if;
  end loop;
end $$;

-- Cover start as well: the legacy learner adapter projects saved lessons from
-- its returned runtime without calling commit. Raw private context reads are
-- not learner delivery; the existing commit fence still runs before a response.
alter function public.nmls_review_start_legacy_internal(uuid,uuid,text,text,jsonb)
  rename to nmls_review_start_pre_phase_internal;
create function public.nmls_review_start_legacy_internal(p_student_id uuid,p_grant_id uuid,p_course_key text,
  p_content_digest text,p_initial_runtime jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants; lease public.nmls_review_study_leases;
begin
  select * into g from public.nmls_review_access_grants where id=p_grant_id for update;
  if not found or g.student_id is distinct from p_student_id or g.status<>'active' or g.expires_at<=clock_timestamp() then
    raise exception 'nmls_review_access_denied'; end if;
  insert into public.nmls_review_study_leases(student_id) values(p_student_id) on conflict do nothing;
  select * into lease from public.nmls_review_study_leases where student_id=p_student_id for update;
  if g.expires_at<=clock_timestamp() then raise exception 'nmls_review_access_denied'; end if;
  if lease.phase_kind is not null then raise exception 'nmls_review_teaching_phase_requires_joint_commit'; end if;
  return public.nmls_review_start_pre_phase_internal(p_student_id,p_grant_id,p_course_key,p_content_digest,p_initial_runtime);
end $$;

-- Wrap below the public025 review wrapper, so its policy path cannot invoke
-- the original source mutator around this guard. Retired delegates stay private.
alter function public.nmls_review_commit_legacy_internal(uuid,uuid,uuid,text,bigint,uuid,bigint,text,jsonb,jsonb,jsonb)
  rename to nmls_review_commit_pre_phase_internal;
create function public.nmls_review_commit_legacy_internal(p_student_id uuid,p_attempt_id uuid,p_event_id uuid,p_command_digest text,
  p_expected_revision bigint,p_expected_session_id uuid,p_evaluated_at_ms bigint,p_content_digest text,
  p_runtime jsonb,p_outcome jsonb,p_audit jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  perform public.nmls_review_legacy_write_fence(p_student_id,p_attempt_id,p_event_id,p_command_digest,'review');
  return public.nmls_review_commit_pre_phase_internal(p_student_id,p_attempt_id,p_event_id,p_command_digest,
    p_expected_revision,p_expected_session_id,p_evaluated_at_ms,p_content_digest,p_runtime,p_outcome,p_audit);
end $$;

alter function public.nmls_policy_commit(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,bigint)
  rename to nmls_policy_commit_pre_phase_internal;
create function public.nmls_policy_commit(p_student_id uuid,p_attempt_id uuid,p_event_id uuid,p_command_digest text,
  p_expected_revision bigint,p_expected_actor_revision bigint,p_expected_session_id uuid,p_evaluated_at_ms bigint,
  p_policy_digest text,p_content_digest text,p_initial_ledger jsonb,p_ledger jsonb,p_runtime jsonb,p_outcome jsonb,p_audit jsonb,p_delivery_until_ms bigint)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  perform public.nmls_review_legacy_write_fence(p_student_id,p_attempt_id,p_event_id,p_command_digest,'policy');
  return public.nmls_policy_commit_pre_phase_internal(p_student_id,p_attempt_id,p_event_id,p_command_digest,
    p_expected_revision,p_expected_actor_revision,p_expected_session_id,p_evaluated_at_ms,p_policy_digest,p_content_digest,
    p_initial_ledger,p_ledger,p_runtime,p_outcome,p_audit,p_delivery_until_ms);
end $$;

alter function public.nmls_private_final_commit(uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,text,uuid,jsonb,jsonb,jsonb,jsonb)
  rename to nmls_private_final_commit_pre_phase_internal;
create function public.nmls_private_final_commit(p_student_id uuid,p_review_attempt_id uuid,p_event_id uuid,p_command_digest text,p_kind text,
  p_expected_review_revision bigint,p_expected_final_revision bigint,p_evaluated_at_ms bigint,p_content_digest text,p_definition_digest text,
  p_final_id uuid,p_selection jsonb,p_answers jsonb,p_result jsonb,p_remediation_manifest jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  perform public.nmls_review_legacy_write_fence(p_student_id,p_review_attempt_id,p_event_id,p_command_digest,'first_final');
  return public.nmls_private_final_commit_pre_phase_internal(p_student_id,p_review_attempt_id,p_event_id,p_command_digest,p_kind,
    p_expected_review_revision,p_expected_final_revision,p_evaluated_at_ms,p_content_digest,p_definition_digest,
    p_final_id,p_selection,p_answers,p_result,p_remediation_manifest);
end $$;

alter function public.nmls_private_remediation_commit(uuid,uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,jsonb,text,uuid,jsonb,jsonb,jsonb,uuid,jsonb,jsonb,jsonb)
  rename to nmls_private_remediation_commit_pre_phase_internal;
create function public.nmls_private_remediation_commit(p_student_id uuid,p_review_attempt_id uuid,p_first_final_id uuid,p_event_id uuid,p_command_digest text,p_kind text,
  p_expected_review_revision bigint,p_expected_workflow_revision bigint,p_evaluated_at_ms bigint,p_definition_digest text,p_manifest jsonb,
  p_action_kind text,p_expected_session_id uuid,p_runtime jsonb,p_audit jsonb,p_review_outcome jsonb,
  p_second_id uuid,p_selection jsonb,p_answers jsonb,p_result jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  perform public.nmls_review_legacy_write_fence(p_student_id,p_review_attempt_id,p_event_id,p_command_digest,'remediation');
  return public.nmls_private_remediation_commit_pre_phase_internal(p_student_id,p_review_attempt_id,p_first_final_id,p_event_id,p_command_digest,p_kind,
    p_expected_review_revision,p_expected_workflow_revision,p_evaluated_at_ms,p_definition_digest,p_manifest,
    p_action_kind,p_expected_session_id,p_runtime,p_audit,p_review_outcome,p_second_id,p_selection,p_answers,p_result);
end $$;

-- Explicit ACLs, including service_role: its authority is the intended RPCs,
-- never direct DML or a retired/internal delegate. Preserve grant provisioning.
revoke all on public.nmls_review_attempts,public.nmls_review_attempt_events,public.nmls_review_study_leases
  from public,anon,authenticated,service_role;
revoke all on function public.nmls_review_lease_phase_integrity(),
  public.nmls_review_legacy_write_fence(uuid,uuid,uuid,text,text),
  public.nmls_review_start_pre_phase_internal(uuid,uuid,text,text,jsonb),
  public.nmls_review_start_legacy_internal(uuid,uuid,text,text,jsonb),
  public.nmls_review_commit_pre_phase_internal(uuid,uuid,uuid,text,bigint,uuid,bigint,text,jsonb,jsonb,jsonb),
  public.nmls_review_commit_legacy_internal(uuid,uuid,uuid,text,bigint,uuid,bigint,text,jsonb,jsonb,jsonb),
  public.nmls_policy_commit_pre_phase_internal(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,bigint),
  public.nmls_private_final_commit_pre_phase_internal(uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,text,uuid,jsonb,jsonb,jsonb,jsonb),
  public.nmls_private_remediation_commit_pre_phase_internal(uuid,uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,jsonb,text,uuid,jsonb,jsonb,jsonb,uuid,jsonb,jsonb,jsonb),
  public.nmls_policy_commit(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,bigint),
  public.nmls_private_final_commit(uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,text,uuid,jsonb,jsonb,jsonb,jsonb),
  public.nmls_private_remediation_commit(uuid,uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,jsonb,text,uuid,jsonb,jsonb,jsonb,uuid,jsonb,jsonb,jsonb)
  from public,anon,authenticated,service_role;
grant execute on function
  public.nmls_policy_commit(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,bigint),
  public.nmls_private_final_commit(uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,text,uuid,jsonb,jsonb,jsonb,jsonb),
  public.nmls_private_remediation_commit(uuid,uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,jsonb,text,uuid,jsonb,jsonb,jsonb,uuid,jsonb,jsonb,jsonb)
  to service_role;
commit;
