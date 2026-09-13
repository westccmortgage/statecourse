-- LOCAL PRIVATE AUTHORING ONLY. Atomic first-final candidate persistence.
-- No HTTP route, learner release, submission, grading, child creation or credit.
-- 034 independently validates the actual final domain transition; never feed
-- final windows to the source/remediation 031 guard.
begin;

create table public.nmls_first_final_deliveries (
  final_id uuid primary key references public.nmls_private_finals(id),
  student_id uuid not null references public.students(id),
  review_attempt_id uuid not null references public.nmls_review_attempts(id),
  phase_scope jsonb not null check (jsonb_typeof(phase_scope)='object'),
  revision bigint not null check (revision between 1 and 9007199254740991),
  runtime jsonb not null check (jsonb_typeof(runtime)='object'
    and runtime->>'version' is not distinct from 'nmls-first-final-delivery-v1'
    and runtime->>'finalAttemptId' is not distinct from final_id::text
    and runtime->'revision' is not distinct from to_jsonb(revision)
    and runtime->'creditIssuanceAllowed' is not distinct from 'false'::jsonb)
);
create table public.nmls_first_final_delivery_events (
  student_id uuid not null references public.students(id),
  event_id uuid not null,
  final_id uuid not null references public.nmls_first_final_deliveries(final_id),
  review_attempt_id uuid not null references public.nmls_review_attempts(id),
  command_digest text not null check (command_digest ~ '^[a-f0-9]{64}$'),
  definition_digest text not null check (definition_digest ~ '^[a-f0-9]{64}$'),
  source_revision bigint not null check (source_revision>0),
  final_revision bigint not null check (final_revision=1),
  delivery_revision bigint not null check (delivery_revision>0),
  actor_revision bigint not null check (actor_revision>0),
  lease_before jsonb not null,
  lease_after jsonb not null,
  runtime jsonb not null,
  outcome jsonb not null check (outcome->'candidateMaterialAllowed' is not distinct from 'false'::jsonb
    and outcome->'candidateUntilMs' is not distinct from 'null'::jsonb
    and outcome->'candidateWindow' is not distinct from 'null'::jsonb
    and outcome->'deliveryAllowed' is not distinct from 'false'::jsonb
    and outcome->'studentDeliveryEnabled' is not distinct from 'false'::jsonb
    and outcome->'creditIssuanceAllowed' is not distinct from 'false'::jsonb),
  audit jsonb not null,
  transaction_id bigint not null default txid_current(),
  recorded_at timestamptz not null default clock_timestamp(),
  primary key(student_id,event_id),
  unique(final_id,delivery_revision), unique(student_id,actor_revision)
);
alter table public.nmls_first_final_deliveries enable row level security;
alter table public.nmls_first_final_delivery_events enable row level security;
revoke all on public.nmls_first_final_deliveries,public.nmls_first_final_delivery_events from public,anon,authenticated,service_role;
create function public.nmls_first_final_delivery_immutable_scope() returns trigger
language plpgsql set search_path=pg_catalog,public as $$
begin
  if tg_op='DELETE' then raise exception 'nmls_first_final_delivery_immutable'; end if;
  if new.final_id is distinct from old.final_id or new.student_id is distinct from old.student_id
    or new.review_attempt_id is distinct from old.review_attempt_id or new.phase_scope is distinct from old.phase_scope
    or new.revision is distinct from old.revision+1 then raise exception 'nmls_first_final_delivery_immutable'; end if;
  return new;
end $$;
create trigger nmls_first_final_delivery_scope_immutable before update or delete on public.nmls_first_final_deliveries
  for each row execute function public.nmls_first_final_delivery_immutable_scope();
create trigger nmls_first_final_delivery_event_immutable before update or delete on public.nmls_first_final_delivery_events
  for each row execute function public.nmls_private_final_event_immutable();

alter table public.nmls_review_study_leases drop constraint nmls_review_lease_phase_shape;
alter table public.nmls_review_study_leases add constraint nmls_review_lease_phase_shape check (coalesce(
  (phase_kind is null and phase_owner_id is null) or
  (phase_kind in ('source','remediation','final') and phase_owner_id is not null and attempt_id is not null and session_id is not null),false));

-- Recorded same-transaction evidence, never a caller-set bypass flag. A final
-- marker is sticky even while dormant: no phase handoff is implemented here.
create or replace function public.nmls_review_lease_phase_integrity() returns trigger
language plpgsql set search_path=pg_catalog,public as $$
declare before_value jsonb; e public.nmls_teaching_events; fe public.nmls_first_final_delivery_events;
begin
  if tg_op='DELETE' then
    if old.phase_kind is not null then raise exception 'nmls_review_phase_lease_transition_requires_joint_commit'; end if;
    return old;
  end if;
  before_value:=case when tg_op='UPDATE' then to_jsonb(old) else null end;
  if tg_op='UPDATE' and new.student_id is distinct from old.student_id then raise exception 'nmls_review_invalid_phase_lease'; end if;
  if tg_op='UPDATE' and new is not distinct from old then return new; end if;
  if tg_op='UPDATE' and old.phase_kind='final' and
    (new.phase_kind is distinct from 'final' or new.phase_owner_id is distinct from old.phase_owner_id
      or new.attempt_id is distinct from old.attempt_id) then raise exception 'nmls_review_session_conflict'; end if;
  if new.phase_kind is null and (tg_op='INSERT' or old.phase_kind is null) then return new; end if;
  if new.phase_kind='final' then
    select * into fe from public.nmls_first_final_delivery_events where student_id=new.student_id
      and transaction_id=txid_current() and lease_before is not distinct from before_value and lease_after=to_jsonb(new)
      order by actor_revision desc limit 1;
    if not found or new.attempt_id is distinct from fe.review_attempt_id or new.phase_owner_id is distinct from fe.final_id
      or new.session_id::text is distinct from fe.runtime->>'sessionId'
      or new.phase_active is distinct from (fe.runtime->>'status'='active')
      or not exists(select 1 from public.nmls_review_actor_policy where student_id=new.student_id and revision=fe.actor_revision)
      or not exists(select 1 from public.nmls_review_attempts where id=fe.review_attempt_id and student_id=new.student_id and revision=fe.source_revision)
      or not exists(select 1 from public.nmls_first_final_deliveries where final_id=fe.final_id and student_id=new.student_id
        and review_attempt_id=fe.review_attempt_id and revision=fe.delivery_revision and runtime=fe.runtime)
      or not exists(select 1 from public.nmls_private_finals where id=fe.final_id and student_id=new.student_id
        and review_attempt_id=fe.review_attempt_id and revision=1 and submitted_at is null) then
      raise exception 'nmls_review_phase_lease_transition_requires_joint_commit'; end if;
  else
    select * into e from public.nmls_teaching_events where student_id=new.student_id and transaction_id=txid_current()
      and lease_before is not distinct from before_value and lease_after=to_jsonb(new) order by actor_revision desc limit 1;
    if not found or new.phase_kind is null or new.attempt_id is distinct from e.review_attempt_id
      or new.phase_kind is distinct from e.phase_kind or new.phase_owner_id is distinct from e.phase_owner_id
      or not exists(select 1 from public.nmls_review_actor_policy where student_id=new.student_id and revision=e.actor_revision)
      or not exists(select 1 from public.nmls_review_attempts where id=e.review_attempt_id and student_id=new.student_id and revision=e.source_revision)
      or e.phase_kind='remediation' and not exists(select 1 from public.nmls_private_remediations
        where first_final_id=e.phase_owner_id and student_id=new.student_id and revision=e.workflow_revision) then
      raise exception 'nmls_review_phase_lease_transition_requires_joint_commit'; end if;
  end if;
  return new;
end $$;

-- Actor mutex also serializes cross-namespace checks. Historical paired033
-- replay is metadata-only and remains possible after final activation.
create function public.nmls_first_final_delivery_prior_write_fence(p_actor uuid,p_review uuid,p_event uuid,p_namespace text)
returns void language plpgsql set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants; lease public.nmls_review_study_leases;
begin
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a on a.grant_id=g0.id
    where a.id=p_review for share of g0;
  if not found or g.student_id is distinct from p_actor or g.status is distinct from 'active'
    or g.expires_at<=clock_timestamp() then raise exception 'nmls_review_access_denied'; end if;
  insert into public.nmls_review_study_leases(student_id) values(p_actor) on conflict do nothing;
  select * into lease from public.nmls_review_study_leases where student_id=p_actor for update;
  if exists(select 1 from public.nmls_first_final_delivery_events where student_id=p_actor and event_id=p_event) then
    raise exception 'nmls_review_idempotency_conflict'; end if;
  if lease.phase_kind='final' and not (
    p_namespace='teaching' and exists(select 1 from public.nmls_teaching_events where student_id=p_actor and event_id=p_event)
    or p_namespace='reservation' and exists(select 1 from public.nmls_final_reservation_events where student_id=p_actor and event_id=p_event)
  ) then raise exception 'nmls_review_session_conflict'; end if;
end $$;
alter function public.nmls_teaching_commit(uuid,uuid,uuid,text,jsonb,text,jsonb,bigint,bigint,bigint,bigint,uuid,bigint,jsonb,jsonb,jsonb,jsonb,jsonb,bigint)
  rename to nmls_teaching_pre_final_delivery_internal;
create function public.nmls_teaching_commit(p_student_id uuid,p_attempt_id uuid,p_event_id uuid,p_command_digest text,
  p_phase jsonb,p_teaching_digest text,p_layout jsonb,p_expected_source_revision bigint,p_expected_workflow_revision bigint,
  p_expected_runtime_revision bigint,p_expected_actor_revision bigint,p_expected_session_id uuid,p_evaluated_at_ms bigint,
  p_initial_ledger jsonb,p_ledger jsonb,p_runtime jsonb,p_outcome jsonb,p_audit jsonb,p_delivery_until_ms bigint)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  perform public.nmls_first_final_delivery_prior_write_fence(p_student_id,p_attempt_id,p_event_id,'teaching');
  return public.nmls_teaching_pre_final_delivery_internal(p_student_id,p_attempt_id,p_event_id,p_command_digest,
    p_phase,p_teaching_digest,p_layout,p_expected_source_revision,p_expected_workflow_revision,p_expected_runtime_revision,
    p_expected_actor_revision,p_expected_session_id,p_evaluated_at_ms,p_initial_ledger,p_ledger,p_runtime,p_outcome,p_audit,p_delivery_until_ms);
end $$;
alter function public.nmls_final_reservation_commit(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,uuid,jsonb,jsonb)
  rename to nmls_final_reservation_pre_delivery_internal;
create function public.nmls_final_reservation_commit(p_student_id uuid,p_attempt_id uuid,p_event_id uuid,p_command_digest text,
  p_expected_source_revision bigint,p_expected_actor_revision bigint,p_expected_session_id uuid,p_evaluated_at_ms bigint,
  p_definition_digest text,p_final_id uuid,p_selection jsonb,p_transition jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  perform public.nmls_first_final_delivery_prior_write_fence(p_student_id,p_attempt_id,p_event_id,'reservation');
  return public.nmls_final_reservation_pre_delivery_internal(p_student_id,p_attempt_id,p_event_id,p_command_digest,
    p_expected_source_revision,p_expected_actor_revision,p_expected_session_id,p_evaluated_at_ms,p_definition_digest,p_final_id,p_selection,p_transition);
end $$;
alter function public.nmls_review_legacy_write_fence(uuid,uuid,uuid,text,text) rename to nmls_review_pre_final_delivery_fence_internal;
create function public.nmls_review_legacy_write_fence(p_actor uuid,p_review uuid,p_event uuid,p_digest text,p_namespace text)
returns void language plpgsql set search_path=pg_catalog,public as $$
begin
  perform public.nmls_review_pre_final_delivery_fence_internal(p_actor,p_review,p_event,p_digest,p_namespace);
  if exists(select 1 from public.nmls_first_final_delivery_events where student_id=p_actor and event_id=p_event) then
    raise exception 'nmls_review_idempotency_conflict'; end if;
end $$;

create function public.nmls_first_final_delivery_context(p_student_id uuid,p_attempt_id uuid,p_final_id uuid,p_event_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare ctx jsonb; f public.nmls_private_finals; r public.nmls_final_reservation_events; e public.nmls_teaching_events;
  d public.nmls_first_final_deliveries; de public.nmls_first_final_delivery_events; lease public.nmls_review_study_leases;
begin
  ctx:=public.nmls_policy_context(p_student_id,p_attempt_id);
  select * into f from public.nmls_private_finals where id=p_final_id and student_id=p_student_id and review_attempt_id=p_attempt_id;
  if not found then raise exception 'nmls_first_final_delivery_access_denied'; end if;
  select * into r from public.nmls_final_reservation_events where final_id=f.id and student_id=p_student_id and reserved;
  select * into e from public.nmls_teaching_events where student_id=p_student_id and event_id=r.event_id;
  select * into lease from public.nmls_review_study_leases where student_id=p_student_id;
  select * into d from public.nmls_first_final_deliveries where final_id=f.id and student_id=p_student_id;
  select * into de from public.nmls_first_final_delivery_events where student_id=p_student_id and event_id=p_event_id;
  return ctx||jsonb_build_object('lease',case when lease.student_id is null then null else to_jsonb(lease) end,
    'reservedFinal',to_jsonb(f),'reservation',case when r.event_id is null then null else to_jsonb(r) end,
    'teachingEvent',case when e.event_id is null then null else to_jsonb(e) end,
    'delivery',case when d.final_id is null then null else to_jsonb(d) end,
    'deliveryEvent',case when de.event_id is null then null else to_jsonb(de) end,
    'serverTimeMs',floor(extract(epoch from clock_timestamp())*1000)::bigint);
end $$;

-- Existing acceptances are authority too, not just newly appended receipts.
-- A successful033 reservation necessarily has this original-offering receipt;
-- no legitimate final transition removes it. Other offering receipts remain
-- untouched and are never adopted as acceptance for this original offering.
create function public.nmls_first_final_delivery_rocs_guard(p_ledger jsonb,p_actor uuid,p_grant uuid,p_offering jsonb)
returns void language plpgsql set search_path=pg_catalog,public as $$
declare item jsonb; receipt public.nmls_review_rocs_presentations; accepted boolean:=false; field text;
begin
  if jsonb_typeof(p_ledger->'acceptances') is distinct from 'array' then raise exception 'nmls_review_invalid_rocs_receipt'; end if;
  for item in select value from jsonb_array_elements(p_ledger->'acceptances') loop
    if item->>'offeringId' is distinct from p_grant::text then continue; end if;
    if jsonb_typeof(item) is distinct from 'object'
      or not (item ?& array['offeringId','contentDigest','version','documentDigest','acceptedAtMs','evidenceId',
        'actorId','presentationId','presentedAtMs','retentionYears'])
      or item-array['offeringId','contentDigest','version','documentDigest','acceptedAtMs','evidenceId',
        'actorId','presentationId','presentedAtMs','retentionYears']<>'{}'::jsonb
      or item->>'actorId' is distinct from p_actor::text or item->>'contentDigest' is distinct from p_offering->>'contentDigest'
      or item->>'version' is distinct from p_offering#>>'{rocs,version}'
      or item->>'documentDigest' is distinct from p_offering#>>'{rocs,documentDigest}'
      or item->>'evidenceId' is distinct from p_offering#>>'{rocs,evidenceId}'
      or item->'retentionYears' is distinct from '5'::jsonb
      or coalesce(item->>'presentationId','') !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$' then
      raise exception 'nmls_review_invalid_rocs_receipt'; end if;
    foreach field in array array['acceptedAtMs','presentedAtMs'] loop
      if jsonb_typeof(item->field) is distinct from 'number' or coalesce(item->>field,'') !~ '^[0-9]+$'
        or (item->>field)::numeric>9007199254740991 then raise exception 'nmls_review_invalid_rocs_receipt'; end if;
    end loop;
    select * into receipt from public.nmls_review_rocs_presentations where id=(item->>'presentationId')::uuid;
    if not found or receipt.student_id is distinct from p_actor or receipt.grant_id is distinct from p_grant
      or receipt.document_digest is distinct from item->>'documentDigest'
      or receipt.receipt is distinct from jsonb_build_object('id',receipt.id,'actorId',p_actor,'offeringId',p_grant,
        'contentDigest',p_offering->>'contentDigest','documentDigest',receipt.document_digest,'presentedAtMs',receipt.presented_at_ms)
      or item->'presentedAtMs' is distinct from to_jsonb(receipt.presented_at_ms)
      or receipt.presented_at_ms<(p_offering->>'opensAtMs')::bigint
      or receipt.presented_at_ms>(item->>'acceptedAtMs')::bigint
      or (item->>'acceptedAtMs')::bigint>=(p_offering->>'closesAtMs')::bigint
      or (item->>'acceptedAtMs')::bigint>(p_ledger->>'lastReceiptMs')::bigint then
      raise exception 'nmls_review_invalid_rocs_receipt'; end if;
    accepted:=true;
  end loop;
  if not accepted then raise exception 'nmls_review_invalid_rocs_receipt'; end if;
end $$;

create function public.nmls_first_final_delivery_commit(
  p_student_id uuid,p_attempt_id uuid,p_final_id uuid,p_event_id uuid,p_command_digest text,
  p_expected_source_revision bigint,p_expected_final_revision bigint,p_expected_delivery_revision bigint,
  p_expected_actor_revision bigint,p_expected_session_id uuid,p_evaluated_at_ms bigint,
  p_definition_digest text,p_transition jsonb
) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
<<delivery_commit>>
declare g public.nmls_review_access_grants; b public.nmls_review_policy_bindings; a public.nmls_review_attempts;
  lease public.nmls_review_study_leases; l public.nmls_review_actor_policy; f public.nmls_private_finals;
  d public.nmls_first_final_deliveries; de public.nmls_first_final_delivery_events; r public.nmls_final_reservation_events;
  e public.nmls_teaching_events; pin public.nmls_teaching_phase_bindings; receipt public.nmls_review_rocs_presentations;
  phase jsonb; source_phase jsonb; old_runtime jsonb; runtime jsonb; ledger jsonb; outcome jsonb; audit jsonb; command jsonb;
  expected_lease jsonb; new_lease jsonb; history_outcome jsonb; item jsonb; prior jsonb; field text;
  selected_digest text; phase_digest text; intent_digest text;
  at_ms bigint; opening_ms bigint; cutoff_ms bigint; deadline_ms bigint; not_before_ms bigint;
begin
  if p_student_id is null or p_attempt_id is null or p_final_id is null or p_event_id is null
    or not coalesce(p_command_digest ~ '^[a-f0-9]{64}$',false)
    or not coalesce(p_definition_digest ~ '^[a-f0-9]{64}$',false) then raise exception 'nmls_first_final_delivery_invalid_command'; end if;
  -- Existing actor mutex serializes sidecar creation; no fresh ledger/session.
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a0 on a0.grant_id=g0.id
    where a0.id=p_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status is distinct from 'active'
    or g.expires_at<=clock_timestamp() then raise exception 'nmls_first_final_delivery_access_denied'; end if;
  select * into b from public.nmls_review_policy_bindings where grant_id=g.id;
  if not found then raise exception 'nmls_review_policy_binding_required'; end if;
  select * into lease from public.nmls_review_study_leases where student_id=p_student_id for update;
  select * into l from public.nmls_review_actor_policy where student_id=p_student_id for update;
  select * into a from public.nmls_review_attempts where id=p_attempt_id for update;
  select * into f from public.nmls_private_finals where id=p_final_id for update;
  select * into d from public.nmls_first_final_deliveries where final_id=p_final_id for update;
  at_ms:=floor(extract(epoch from clock_timestamp())*1000);
  if a.student_id is distinct from p_student_id or f.student_id is distinct from p_student_id
    or f.review_attempt_id is distinct from a.id or g.expires_at<=clock_timestamp() then raise exception 'nmls_first_final_delivery_access_denied'; end if;
  if a.course_key is distinct from g.course_key or a.content_digest is distinct from g.content_digest
    or b.offering->>'id' is distinct from g.id::text or b.offering->>'contentDigest' is distinct from a.content_digest
    or f.course_key is distinct from a.course_key or f.content_digest is distinct from a.content_digest
    or f.definition_digest is distinct from p_definition_digest then raise exception 'nmls_first_final_delivery_scope_changed'; end if;
  if l.student_id is null or l.policy_id is distinct from b.policy_id or l.policy_digest is distinct from b.policy_digest
    or l.ledger->'revision' is distinct from to_jsonb(l.revision) or l.ledger->>'actorId' is distinct from p_student_id::text
    or l.ledger->>'policyId' is distinct from b.policy_id or l.ledger->'creditIssuanceAllowed' is distinct from 'false'::jsonb
    or not public.nmls_final_guard_integer(l.ledger->'lastReceiptMs',9007199254740991,false) or lease.student_id is null then
    raise exception 'nmls_review_policy_version_conflict'; end if;
  perform public.nmls_first_final_delivery_rocs_guard(l.ledger,p_student_id,g.id,b.offering);
  if f.revision is distinct from 1 or f.answers is not null or f.result is not null or f.remediation_manifest is not null
    or f.submitted_at is not null or not isfinite(f.issued_at) or f.id=a.id or f.selection->>'id' is distinct from f.id::text
    or f.selection->>'reviewAttemptId' is distinct from a.id::text or f.selection->>'definitionDigest' is distinct from f.definition_digest
    or f.selection->'number' is distinct from '1'::jsonb then raise exception 'nmls_first_final_delivery_unreserved_form'; end if;
  selected_digest:=encode(sha256(convert_to(public.nmls_teaching_canonical(f.selection),'UTF8')),'hex');
  source_phase:=jsonb_build_object('version','nmls-teaching-phase-v1','kind','source','ownerId',a.id,'sourceCourseKey',a.course_key,
    'sourceContentDigest',a.content_digest,'teachingCourseKey',a.course_key,'policyDigest',b.policy_digest,'definitionDigest',null,'manifestDigest',null);
  select * into pin from public.nmls_teaching_phase_bindings where student_id=p_student_id and review_attempt_id=a.id
    and phase_kind='source' and phase_owner_id=a.id;
  if not found or pin.phase_scope is distinct from source_phase or pin.teaching_digest is distinct from a.content_digest
    or a.runtime->'revision' is distinct from to_jsonb(a.revision) or a.runtime->>'status' is distinct from 'review_complete'
    or a.runtime->'current' is distinct from 'null'::jsonb or a.runtime->'quiz' is distinct from 'null'::jsonb
    or coalesce(a.runtime->'bookmark','null'::jsonb)<>'null'::jsonb
    or coalesce(a.runtime->'quizReservation','null'::jsonb)<>'null'::jsonb then raise exception 'nmls_first_final_delivery_source_incomplete'; end if;
  perform public.nmls_teaching_guard_progress(a.runtime,a.runtime,pin.layout,jsonb_build_object('deliveryAllowed',false),
    jsonb_build_object('review',jsonb_build_object('kind','check_access')),at_ms);
  select * into r from public.nmls_final_reservation_events where student_id=p_student_id and final_id=f.id and reserved;
  select * into e from public.nmls_teaching_events where student_id=p_student_id and event_id=r.event_id;
  expected_lease:=jsonb_build_object('student_id',p_student_id,'attempt_id',a.id,'session_id',a.runtime->'sessionId',
    'phase_kind','source','phase_owner_id',a.id,'phase_active',false);
  if r.event_id is null or e.event_id is null or r.review_attempt_id is distinct from a.id
    or not isfinite(r.recorded_at) or not isfinite(e.recorded_at)
    or r.outcome is distinct from jsonb_build_object('ok',true,'code','private_final_reserved','status',200,'reserved',true,
      'finalAttemptId',f.id,'finalRevision',1,'sourceRevision',r.source_revision,'actorRevision',r.actor_revision,
      'mode','private_authoring_review','studentDeliveryEnabled',false,'creditIssuanceAllowed',false)
    or r.definition_digest is distinct from f.definition_digest or r.selection_digest is distinct from selected_digest
    or e.command_digest is distinct from r.command_digest or e.review_attempt_id is distinct from a.id
    or e.phase_kind is distinct from 'source' or e.phase_owner_id is distinct from a.id or e.workflow_revision is not null
    or e.source_revision is distinct from r.source_revision or e.runtime_revision is distinct from r.source_revision
    or e.actor_revision is distinct from r.actor_revision or a.revision<r.source_revision or l.revision<r.actor_revision
    or e.transaction_id<=0 or e.lease_before is distinct from expected_lease or e.lease_after is distinct from expected_lease
    or e.outcome->'ok' is distinct from 'true'::jsonb or e.outcome->'status' is distinct from '200'::jsonb
    or not coalesce(e.outcome->>'code' in ('review_policy_checked','session_policy_allowed'),false)
    or e.outcome->>'policyCode' is distinct from 'session_policy_allowed' or e.outcome->'observationReady' is distinct from 'true'::jsonb
    or e.outcome->>'observationCode' is distinct from 'study_observation_ready'
    or e.outcome->'teachingPhaseComplete' is distinct from 'true'::jsonb
    or e.outcome->'deliveryAllowed' is distinct from 'false'::jsonb or e.outcome->'deliveryUntilMs' is distinct from 'null'::jsonb
    or e.outcome->'studyWindow' is distinct from 'null'::jsonb or e.outcome->'studyRecovery' is distinct from 'null'::jsonb
    or e.outcome->'actorRevision' is distinct from to_jsonb(r.actor_revision)
    or e.outcome#>'{progress,revision}' is distinct from to_jsonb(r.source_revision)
    or e.outcome#>>'{progress,mode}' is distinct from 'non_credit_review'
    or e.outcome#>'{progress,creditIssuanceAllowed}' is distinct from 'false'::jsonb
    or e.outcome#>>'{progress,status}' is distinct from 'review_complete'
    or e.outcome#>>'{progress,courseKey}' is distinct from a.course_key
    or e.outcome#>>'{progress,contentDigest}' is distinct from a.content_digest
    or e.outcome#>'{progress,sessionId}' is distinct from a.runtime->'sessionId'
    or e.outcome#>'{progress,currentUnitId}' is distinct from 'null'::jsonb
    or e.outcome#>'{progress,provisionalReviewMs}' is distinct from '0'::jsonb
    or e.outcome#>'{progress,resumeRequired}' is distinct from 'false'::jsonb
    or e.outcome#>'{progress,lessons}' is distinct from '[]'::jsonb or e.outcome#>'{progress,quiz}' is distinct from 'null'::jsonb
    or e.outcome#>'{progress,feedback}' is distinct from 'null'::jsonb
    or e.audit#>>'{review,kind}' is distinct from 'check_access' or e.audit#>>'{policy,kind}' is distinct from 'check_access'
    or e.audit#>>'{policy,code}' is distinct from 'session_policy_allowed'
    or not public.nmls_final_guard_integer(e.audit#>'{policy,atMs}',9007199254740991,false)
    or e.audit#>'{review,atMs}' is distinct from e.audit#>'{policy,atMs}'
    or e.audit#>>'{policy,actorId}' is distinct from p_student_id::text
    or e.audit#>>'{policy,offeringId}' is distinct from g.id::text
    or e.audit#>>'{policy,contentDigest}' is distinct from a.content_digest
    or e.audit#>>'{policy,policyId}' is distinct from b.policy_id or e.audit#>'{policy,observation}' is not null
    or e.audit->'observation' is distinct from jsonb_build_object('reason','no_prior_material','code','study_observation_ready') then
    raise exception 'nmls_first_final_delivery_reservation_provenance'; end if;
  if (e.audit#>>'{policy,atMs}')::bigint<(b.offering->>'opensAtMs')::bigint
    or (e.audit#>>'{policy,atMs}')::bigint>=(b.offering->>'closesAtMs')::bigint
    or (a.runtime->>'lastReceiptMs')::bigint<(e.audit#>>'{policy,atMs}')::bigint
    or (l.ledger->>'lastReceiptMs')::bigint<(e.audit#>>'{policy,atMs}')::bigint then
    raise exception 'nmls_first_final_delivery_reservation_provenance'; end if;
  foreach field in array array['completedUnitIds','passedModuleIds','completedReviewMs'] loop
    if e.outcome->'progress'->field is distinct from a.runtime->field then raise exception 'nmls_first_final_delivery_source_changed'; end if;
  end loop;
  phase:=jsonb_build_object('version','nmls-first-final-phase-v1','actorId',p_student_id,'reviewAttemptId',a.id,
    'finalAttemptId',f.id,'courseKey',a.course_key,'contentDigest',a.content_digest,'definitionDigest',f.definition_digest,
    'selectionDigest',selected_digest,'offeringId',g.id);
  phase_digest:=encode(sha256(convert_to(public.nmls_teaching_canonical(phase),'UTF8')),'hex');
  if d.final_id is not null and (d.student_id is distinct from p_student_id or d.review_attempt_id is distinct from a.id
    or d.phase_scope is distinct from phase or d.runtime->>'phaseDigest' is distinct from phase_digest
    or d.runtime->'revision' is distinct from to_jsonb(d.revision)) then raise exception 'nmls_first_final_delivery_scope_changed'; end if;
  -- Authority and immutable provenance precede replay; replay precedes CAS.
  select * into de from public.nmls_first_final_delivery_events where student_id=p_student_id and event_id=p_event_id;
  if found then
    if de.final_id is distinct from f.id or de.review_attempt_id is distinct from a.id or de.command_digest is distinct from p_command_digest
      or de.definition_digest is distinct from f.definition_digest or d.final_id is null or d.revision<de.delivery_revision
      or l.revision<de.actor_revision or a.revision<de.source_revision or de.runtime->>'phaseDigest' is distinct from phase_digest
      or de.runtime->'revision' is distinct from to_jsonb(de.delivery_revision) then raise exception 'nmls_review_idempotency_conflict'; end if;
    return jsonb_build_object('duplicate',true,'outcome',de.outcome,'runtime',de.runtime,'sourceRevision',de.source_revision);
  end if;
  if exists(select 1 from public.nmls_review_attempt_events x join public.nmls_review_attempts y on y.id=x.attempt_id
      where y.student_id=p_student_id and x.event_id=p_event_id)
    or exists(select 1 from public.nmls_review_actor_policy_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_private_final_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_private_remediation_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_teaching_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_final_reservation_events where student_id=p_student_id and event_id=p_event_id) then
    raise exception 'nmls_review_idempotency_conflict'; end if;
  if a.revision is distinct from p_expected_source_revision or f.revision is distinct from p_expected_final_revision
    or coalesce(d.revision,0) is distinct from p_expected_delivery_revision or l.revision is distinct from p_expected_actor_revision then
    raise exception 'nmls_review_revision_conflict'; end if;
  old_runtime:=case when d.final_id is not null then d.runtime else jsonb_build_object(
    'version','nmls-first-final-delivery-v1','finalAttemptId',f.id,'phaseDigest',phase_digest,'revision',0,
    'status','reserved','sessionId',null,'lastActivityMs',null,'lastReceiptMs',0,'creditIssuanceAllowed',false) end;
  if old_runtime->>'sessionId' is distinct from p_expected_session_id::text then raise exception 'nmls_review_session_conflict'; end if;
  if old_runtime->>'sessionId' is null then
    if to_jsonb(lease) is distinct from expected_lease
      or l.ledger#>'{observationJournal,active}' is distinct from 'null'::jsonb
      or l.ledger#>'{observationJournal,unresolved}' is distinct from 'null'::jsonb then raise exception 'nmls_review_session_conflict'; end if;
  elsif lease.attempt_id is distinct from a.id or lease.phase_kind is distinct from 'final' or lease.phase_owner_id is distinct from f.id
    or lease.session_id is distinct from p_expected_session_id or lease.phase_active is distinct from (old_runtime->>'status'='active') then
    raise exception 'nmls_review_session_conflict'; end if;
  if jsonb_typeof(p_transition) is distinct from 'object' or not (p_transition ?& array['phase','command','runtime','ledger','outcome','audit'])
    or p_transition-array['phase','command','runtime','ledger','outcome','audit']<>'{}'::jsonb then raise exception 'nmls_first_final_delivery_invalid_transition'; end if;
  command:=p_transition->'command'; runtime:=p_transition->'runtime'; ledger:=p_transition->'ledger';
  outcome:=p_transition->'outcome'; audit:=p_transition->'audit';
  if p_transition->'phase' is distinct from phase or command->>'eventId' is distinct from p_event_id::text
    or command->'expectedRevision' is distinct from to_jsonb(p_expected_delivery_revision)
    or command->'expectedActorRevision' is distinct from to_jsonb(p_expected_actor_revision)
    or command->'sessionId' is distinct from coalesce(to_jsonb(p_expected_session_id),'null'::jsonb) then
    raise exception 'nmls_first_final_delivery_invalid_transition'; end if;
  intent_digest:=encode(sha256(convert_to(public.nmls_teaching_canonical(command||jsonb_build_object('attemptId',a.id,
    'finalAttemptId',f.id,'expectedSourceRevision',p_expected_source_revision,'expectedFinalRevision',p_expected_final_revision)),'UTF8')),'hex');
  if intent_digest is distinct from p_command_digest then raise exception 'nmls_first_final_delivery_command_digest'; end if;
  opening_ms:=(b.offering->>'opensAtMs')::bigint; cutoff_ms:=(b.offering->>'closesAtMs')::bigint;
  not_before_ms:=greatest((a.runtime->>'lastReceiptMs')::bigint,(l.ledger->>'lastReceiptMs')::bigint,
    (old_runtime->>'lastReceiptMs')::bigint,(e.audit#>>'{policy,atMs}')::bigint,
    floor(extract(epoch from f.issued_at)*1000)::bigint,floor(extract(epoch from r.recorded_at)*1000)::bigint,
    floor(extract(epoch from e.recorded_at)*1000)::bigint);
  if p_evaluated_at_ms is null or p_evaluated_at_ms<not_before_ms or p_evaluated_at_ms>at_ms+1000 or at_ms-p_evaluated_at_ms>1000
    or (at_ms<opening_ms) is distinct from (p_evaluated_at_ms<opening_ms)
    or (at_ms>=cutoff_ms) is distinct from (p_evaluated_at_ms>=cutoff_ms)
    or old_runtime->>'status'='active' and p_evaluated_at_ms<(old_runtime->>'lastActivityMs')::bigint+360000
      and at_ms>=(old_runtime->>'lastActivityMs')::bigint+360000 then raise exception 'nmls_review_clock_refresh_required'; end if;
  perform public.nmls_final_delivery_guard(l.ledger,ledger,old_runtime,runtime,outcome,audit,b.offering,
    p_student_id,a.id,p_event_id,p_evaluated_at_ms,phase,command);
  perform public.nmls_first_final_delivery_rocs_guard(ledger,p_student_id,g.id,b.offering);
  -- The independent guard checks receipt structure and append-only arithmetic;
  -- only this transaction can bind an acceptance to its durable presentation.
  for prior in select value from jsonb_array_elements(l.ledger->'acceptances') loop
    if not coalesce((ledger->'acceptances') @> jsonb_build_array(prior),false) then raise exception 'nmls_review_invalid_rocs_receipt'; end if;
  end loop;
  for item in select value from jsonb_array_elements(ledger->'acceptances') loop
    if not (l.ledger->'acceptances') @> jsonb_build_array(item) then
      select * into receipt from public.nmls_review_rocs_presentations where id=(item->>'presentationId')::uuid;
      if not found or command->>'kind' is distinct from 'accept_rocs' or command->'presentationId' is distinct from item->'presentationId'
        or receipt.student_id is distinct from p_student_id or receipt.grant_id is distinct from g.id
        or receipt.document_digest is distinct from item->>'documentDigest' or item->>'actorId' is distinct from p_student_id::text
        or item->>'offeringId' is distinct from g.id::text or item->>'contentDigest' is distinct from a.content_digest
        or item->>'documentDigest' is distinct from b.offering#>>'{rocs,documentDigest}'
        or item->>'version' is distinct from b.offering#>>'{rocs,version}' or item->>'evidenceId' is distinct from b.offering#>>'{rocs,evidenceId}'
        or item->'presentedAtMs' is distinct from to_jsonb(receipt.presented_at_ms)
        or item->'acceptedAtMs' is distinct from to_jsonb(p_evaluated_at_ms)
        or receipt.presented_at_ms>p_evaluated_at_ms or receipt.presented_at_ms<opening_ms
        or item->>'retentionYears' is distinct from '5' then raise exception 'nmls_review_invalid_rocs_receipt'; end if;
    end if;
  end loop;
  if outcome->'candidateMaterialAllowed'='true'::jsonb then
    deadline_ms:=least(cutoff_ms,(outcome->>'candidateUntilMs')::bigint,
      (runtime->>'lastActivityMs')::bigint+360000,(ledger->>'sessionStartedAtMs')::bigint+43200000);
    if b.offering#>'{rocs,fullDocumentVerified}' is distinct from 'true'::jsonb
      or not exists(select 1 from jsonb_array_elements(ledger->'acceptances') x where x->>'offeringId'=g.id::text
        and x->>'contentDigest'=a.content_digest and x->>'documentDigest'=b.offering#>>'{rocs,documentDigest}'
        and x->>'version'=b.offering#>>'{rocs,version}')
      or deadline_ms is null or p_evaluated_at_ms>=deadline_ms then raise exception 'nmls_first_final_delivery_invalid_access'; end if;
    if at_ms>=deadline_ms then raise exception 'nmls_review_clock_refresh_required'; end if;
  end if;
  new_lease:=case when runtime->>'sessionId' is null then to_jsonb(lease) else jsonb_build_object(
    'student_id',p_student_id,'attempt_id',a.id,'session_id',runtime->'sessionId','phase_kind','final',
    'phase_owner_id',f.id,'phase_active',runtime->>'status'='active') end;
  insert into public.nmls_first_final_deliveries(final_id,student_id,review_attempt_id,phase_scope,revision,runtime)
    values(f.id,p_student_id,a.id,phase,(runtime->>'revision')::bigint,runtime)
    on conflict(final_id) do update set revision=excluded.revision,runtime=excluded.runtime;
  update public.nmls_review_actor_policy set revision=(delivery_commit.ledger->>'revision')::bigint,
    ledger=delivery_commit.ledger,updated_at=clock_timestamp()
    where student_id=p_student_id;
  history_outcome:=outcome||jsonb_build_object('candidateMaterialAllowed',false,'candidateUntilMs',null,'candidateWindow',null);
  insert into public.nmls_first_final_delivery_events(student_id,event_id,final_id,review_attempt_id,command_digest,definition_digest,
    source_revision,final_revision,delivery_revision,actor_revision,lease_before,lease_after,runtime,outcome,audit)
    values(p_student_id,p_event_id,f.id,a.id,p_command_digest,f.definition_digest,a.revision,1,(runtime->>'revision')::bigint,
      (ledger->>'revision')::bigint,to_jsonb(lease),new_lease,runtime,history_outcome,audit);
  update public.nmls_review_study_leases set attempt_id=(new_lease->>'attempt_id')::uuid,session_id=(new_lease->>'session_id')::uuid,
    phase_kind=new_lease->>'phase_kind',phase_owner_id=(new_lease->>'phase_owner_id')::uuid,
    phase_active=(new_lease->>'phase_active')::boolean where student_id=p_student_id;
  -- All writes are rolled back if any real-time boundary moved meanwhile.
  at_ms:=floor(extract(epoch from clock_timestamp())*1000);
  if g.expires_at<=clock_timestamp() then raise exception 'nmls_first_final_delivery_access_denied'; end if;
  if p_evaluated_at_ms>at_ms+1000 or at_ms-p_evaluated_at_ms>1000
    or (at_ms<opening_ms) is distinct from (p_evaluated_at_ms<opening_ms)
    or (at_ms>=cutoff_ms) is distinct from (p_evaluated_at_ms>=cutoff_ms)
    or old_runtime->>'status'='active' and p_evaluated_at_ms<(old_runtime->>'lastActivityMs')::bigint+360000
      and at_ms>=(old_runtime->>'lastActivityMs')::bigint+360000
    or outcome->'candidateMaterialAllowed'='true'::jsonb and at_ms>=deadline_ms then raise exception 'nmls_review_clock_refresh_required'; end if;
  return jsonb_build_object('duplicate',false,'outcome',outcome,'runtime',runtime,'sourceRevision',a.revision);
end $$;

revoke all on function public.nmls_first_final_delivery_immutable_scope(),public.nmls_review_lease_phase_integrity(),
  public.nmls_first_final_delivery_rocs_guard(jsonb,uuid,uuid,jsonb),
  public.nmls_first_final_delivery_prior_write_fence(uuid,uuid,uuid,text),
  public.nmls_teaching_pre_final_delivery_internal(uuid,uuid,uuid,text,jsonb,text,jsonb,bigint,bigint,bigint,bigint,uuid,bigint,jsonb,jsonb,jsonb,jsonb,jsonb,bigint),
  public.nmls_final_reservation_pre_delivery_internal(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,uuid,jsonb,jsonb),
  public.nmls_review_pre_final_delivery_fence_internal(uuid,uuid,uuid,text,text),
  public.nmls_review_legacy_write_fence(uuid,uuid,uuid,text,text),
  public.nmls_teaching_commit(uuid,uuid,uuid,text,jsonb,text,jsonb,bigint,bigint,bigint,bigint,uuid,bigint,jsonb,jsonb,jsonb,jsonb,jsonb,bigint),
  public.nmls_final_reservation_commit(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,uuid,jsonb,jsonb),
  public.nmls_first_final_delivery_context(uuid,uuid,uuid,uuid),
  public.nmls_first_final_delivery_commit(uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb)
  from public,anon,authenticated,service_role;
grant execute on function
  public.nmls_teaching_commit(uuid,uuid,uuid,text,jsonb,text,jsonb,bigint,bigint,bigint,bigint,uuid,bigint,jsonb,jsonb,jsonb,jsonb,jsonb,bigint),
  public.nmls_final_reservation_commit(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,uuid,jsonb,jsonb),
  public.nmls_first_final_delivery_context(uuid,uuid,uuid,uuid),
  public.nmls_first_final_delivery_commit(uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb) to service_role;
commit;
