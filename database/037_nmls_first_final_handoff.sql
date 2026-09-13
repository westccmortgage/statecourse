-- LOCAL PRIVATE AUTHORING ONLY. Atomic failed-first-final -> actual child
-- resume. No learner route, material response, second form, grade or CE credit.
-- Existing023--036 files remain unchanged. All exceptions roll back the paired
-- handoff receipt, actual032 actor/child transition, pin and lease together.
begin;

create table public.nmls_first_final_handoff_events (
  student_id uuid not null references public.students(id),
  event_id uuid not null,
  final_id uuid not null unique references public.nmls_private_finals(id),
  review_attempt_id uuid not null references public.nmls_review_attempts(id),
  genesis_event_id uuid not null,
  command_digest text not null check (command_digest ~ '^[a-f0-9]{64}$'),
  teaching_command_digest text not null check (teaching_command_digest ~ '^[a-f0-9]{64}$'),
  definition_digest text not null check (definition_digest ~ '^[a-f0-9]{64}$'),
  teaching_digest text not null check (teaching_digest ~ '^[a-f0-9]{64}$'),
  phase_scope jsonb not null check (jsonb_typeof(phase_scope)='object'),
  source_revision bigint not null check (source_revision>0),
  final_revision bigint not null check (final_revision=2),
  delivery_revision bigint not null check (delivery_revision>0),
  workflow_revision bigint not null check (workflow_revision=2),
  runtime_revision bigint not null check (runtime_revision=1),
  actor_revision bigint not null check (actor_revision>0),
  lease_before jsonb not null,
  lease_after jsonb not null,
  runtime jsonb not null check (jsonb_typeof(runtime)='object'),
  outcome jsonb not null check (jsonb_typeof(outcome)='object'
    and outcome->'handedOff' is not distinct from 'true'::jsonb
    and outcome->'deliveryAllowed' is not distinct from 'false'::jsonb
    and outcome->'studentDeliveryEnabled' is not distinct from 'false'::jsonb
    and outcome->'creditIssuanceAllowed' is not distinct from 'false'::jsonb
    and outcome->'retakeEnabled' is not distinct from 'false'::jsonb),
  transaction_id bigint not null default txid_current(),
  recorded_at timestamptz not null default clock_timestamp(),
  primary key(student_id,event_id), unique(student_id,actor_revision),
  foreign key(student_id,genesis_event_id) references public.nmls_first_final_submission_events(student_id,event_id),
  -- Inserted BEFORE032's lease update so the trigger can inspect the proposed
  -- handoff; it cannot commit without the actual same-event032 receipt.
  foreign key(student_id,event_id) references public.nmls_teaching_events(student_id,event_id) deferrable initially deferred
);
alter table public.nmls_first_final_handoff_events enable row level security;
revoke all on public.nmls_first_final_handoff_events from public,anon,authenticated,service_role;
create trigger nmls_first_final_handoff_event_immutable before update or delete on public.nmls_first_final_handoff_events
  for each row execute function public.nmls_private_final_event_immutable();

-- Preserve035's final fence except this exact same-transaction paired change.
-- Neither a caller-set flag nor a lone037 row authorizes a lease transition.
create or replace function public.nmls_review_lease_phase_integrity() returns trigger
language plpgsql set search_path=pg_catalog,public as $$
declare before_value jsonb; e public.nmls_teaching_events; fe public.nmls_first_final_delivery_events;
  h public.nmls_first_final_handoff_events;
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
      or new.attempt_id is distinct from old.attempt_id) then
    select * into h from public.nmls_first_final_handoff_events where student_id=new.student_id
      and transaction_id=txid_current() and lease_before=before_value and lease_after=to_jsonb(new);
    select * into e from public.nmls_teaching_events where student_id=new.student_id and event_id=h.event_id;
    if h.event_id is null or e.event_id is null or e.transaction_id is distinct from h.transaction_id
      or old.phase_active or new.phase_kind is distinct from 'remediation'
      or new.attempt_id is distinct from old.attempt_id or new.phase_owner_id is distinct from old.phase_owner_id
      or h.review_attempt_id is distinct from new.attempt_id or h.final_id is distinct from new.phase_owner_id
      or e.review_attempt_id is distinct from h.review_attempt_id or e.phase_kind is distinct from 'remediation'
      or e.phase_owner_id is distinct from h.final_id or e.command_digest is distinct from h.teaching_command_digest
      or e.lease_before is distinct from h.lease_before or e.lease_after is distinct from h.lease_after
      or e.source_revision is distinct from h.source_revision or e.workflow_revision is distinct from h.workflow_revision
      or e.runtime_revision is distinct from h.runtime_revision or e.actor_revision is distinct from h.actor_revision
      or e.audit#>>'{review,kind}' is distinct from 'resume'
      or new.phase_active is distinct from (h.runtime->>'status'='active')
      or new.session_id::text is distinct from coalesce(h.runtime->>'sessionId',old.session_id::text)
      or not exists(select 1 from public.nmls_review_actor_policy where student_id=new.student_id and revision=h.actor_revision)
      or not exists(select 1 from public.nmls_review_attempts where id=h.review_attempt_id and student_id=new.student_id and revision=h.source_revision)
      or not exists(select 1 from public.nmls_private_finals where id=h.final_id and student_id=new.student_id
        and review_attempt_id=h.review_attempt_id and revision=2 and result->'passed'='false'::jsonb)
      or not exists(select 1 from public.nmls_private_remediations where first_final_id=h.final_id and student_id=new.student_id
        and review_attempt_id=h.review_attempt_id and revision=h.workflow_revision and runtime=h.runtime and status='remediating')
      or not exists(select 1 from public.nmls_first_final_deliveries where final_id=h.final_id and student_id=new.student_id
        and review_attempt_id=h.review_attempt_id and revision=h.delivery_revision and runtime->>'sessionId'=old.session_id::text
        and runtime->>'status'='paused')
      or not exists(select 1 from public.nmls_first_final_submission_events where student_id=new.student_id
        and event_id=h.genesis_event_id and final_id=h.final_id and submitted and workflow_revision=1) then
      raise exception 'nmls_review_phase_lease_transition_requires_joint_commit'; end if;
    return new;
  end if;
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

-- Direct032 cannot replay a037-owned derived resume. Its ordinary path still
-- uses035's final fence. Only the joint037 RPC reaches the original032 delegate.
alter function public.nmls_teaching_commit(uuid,uuid,uuid,text,jsonb,text,jsonb,bigint,bigint,bigint,bigint,uuid,bigint,jsonb,jsonb,jsonb,jsonb,jsonb,bigint)
  rename to nmls_teaching_pre_handoff_internal;
create function public.nmls_teaching_commit(p_student_id uuid,p_attempt_id uuid,p_event_id uuid,p_command_digest text,
  p_phase jsonb,p_teaching_digest text,p_layout jsonb,p_expected_source_revision bigint,p_expected_workflow_revision bigint,
  p_expected_runtime_revision bigint,p_expected_actor_revision bigint,p_expected_session_id uuid,p_evaluated_at_ms bigint,
  p_initial_ledger jsonb,p_ledger jsonb,p_runtime jsonb,p_outcome jsonb,p_audit jsonb,p_delivery_until_ms bigint)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants;
begin
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a0 on a0.grant_id=g0.id
    where a0.id=p_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status is distinct from 'active'
    or g.expires_at<=clock_timestamp() then raise exception 'nmls_review_access_denied'; end if;
  perform 1 from public.nmls_review_study_leases where student_id=p_student_id for update;
  if exists(select 1 from public.nmls_first_final_handoff_events where student_id=p_student_id and event_id=p_event_id) then
    raise exception 'nmls_review_idempotency_conflict'; end if;
  return public.nmls_teaching_pre_handoff_internal(p_student_id,p_attempt_id,p_event_id,p_command_digest,p_phase,p_teaching_digest,p_layout,
    p_expected_source_revision,p_expected_workflow_revision,p_expected_runtime_revision,p_expected_actor_revision,p_expected_session_id,
    p_evaluated_at_ms,p_initial_ledger,p_ledger,p_runtime,p_outcome,p_audit,p_delivery_until_ms);
end $$;

create function public.nmls_first_final_handoff_context(p_student_id uuid,p_attempt_id uuid,p_final_id uuid,p_event_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare ctx jsonb; g public.nmls_first_final_submission_events; d public.nmls_first_final_delivery_events;
  h public.nmls_first_final_handoff_events; t public.nmls_teaching_events;
begin
  ctx:=public.nmls_first_final_submission_context(p_student_id,p_attempt_id,p_final_id,p_event_id);
  select s.* into g from public.nmls_first_final_submission_events s where s.student_id=p_student_id and s.final_id=p_final_id and s.submitted;
  select * into d from public.nmls_first_final_delivery_events where student_id=p_student_id and event_id=g.event_id;
  select * into h from public.nmls_first_final_handoff_events where student_id=p_student_id and event_id=p_event_id;
  select * into t from public.nmls_teaching_events where student_id=p_student_id and event_id=p_event_id;
  return ctx||jsonb_build_object('genesisEvent',case when g.event_id is null then null else to_jsonb(g) end,
    'genesisDeliveryEvent',case when d.event_id is null then null else to_jsonb(d) end,
    'handoffEvent',case when h.event_id is null then null else to_jsonb(h) end,
    'handoffTeachingEvent',case when t.event_id is null then null else to_jsonb(t) end,
    'serverTimeMs',floor(extract(epoch from clock_timestamp())*1000)::bigint);
end $$;

create function public.nmls_first_final_handoff_outcome(p_final uuid,p_source bigint,p_delivery bigint,p_actor bigint,p_runtime jsonb,p_teaching jsonb)
returns jsonb language sql immutable set search_path=pg_catalog,public as $$
  select jsonb_build_object('ok',true,'code','private_first_remediation_handed_off','status',200,'handedOff',true,
    'finalAttemptId',p_final,'finalRevision',2,'sourceRevision',p_source,'deliveryRevision',p_delivery,
    'workflowRevision',2,'runtimeRevision',1,'actorRevision',p_actor,'sessionId',p_runtime->'sessionId',
    'runtimeStatus',p_runtime->'status','teachingOk',p_teaching->'ok','teachingStatus',p_teaching->'status',
    'teachingCode',p_teaching->'code','policyCode',p_teaching->'policyCode','observationCode',p_teaching->'observationCode',
    'mode','private_authoring_review','deliveryAllowed',false,'studentDeliveryEnabled',false,'creditIssuanceAllowed',false,'retakeEnabled',false);
$$;

-- The paired032 history redacts material permission, but never the actual
-- empty-child start, its policy identity or its observation audit. Validate
-- these fields identically for a fresh proposal and a historical receipt.
create function public.nmls_first_final_handoff_start_guard(p_runtime jsonb,p_outcome jsonb,p_audit jsonb,
  p_offering jsonb,p_policy_id text,p_actor uuid,p_old_session uuid,p_at bigint)
returns void language plpgsql set search_path=pg_catalog,public as $$
declare active boolean; outside_window boolean; expected_review jsonb; expected_observation jsonb;
begin
  active:=p_runtime->>'status'='active';
  outside_window:=p_at<(p_offering->>'opensAtMs')::bigint or p_at>=(p_offering->>'closesAtMs')::bigint;
  expected_review:=jsonb_build_object('kind','resume','atMs',p_at);
  if active then expected_review:=expected_review||jsonb_build_object('reason','explicit_resume_current_unit_restart',
    'invalidatedMs',0,'invalidatedUnitId',null,'abandonedQuizId',null); end if;
  expected_observation:=case when outside_window then jsonb_build_object('reason','outside_window_preserved')
    else jsonb_build_object('reason','no_prior_material','code','study_observation_ready') end;
  if not coalesce(p_runtime->>'status' in ('active','logged_out'),false)
    or not public.nmls_final_guard_integer(p_runtime->'lastReceiptMs',9007199254740991,false)
    or p_runtime->'lastReceiptMs' is distinct from to_jsonb(p_at)
    or active and (not coalesce(p_runtime->>'sessionId' ~* '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false)
      or (p_runtime->>'sessionId')::uuid=p_old_session or p_runtime->'lastActivityMs' is distinct from to_jsonb(p_at))
    or not active and (p_runtime->'sessionId' is distinct from 'null'::jsonb or p_runtime->'lastActivityMs' is distinct from 'null'::jsonb)
    or p_outcome->'ok' is distinct from to_jsonb(active)
    or p_outcome->'status' is distinct from (case when active then '200'::jsonb else '401'::jsonb end)
    or p_outcome->>'code' is distinct from (case when active then 'review_session_started' else 'course_logout_required' end)
    or not coalesce(p_outcome->>'policyCode' in ('delivery_not_open','delivery_window_closed','rocs_document_unverified',
      'rocs_required','session_policy_allowed','break_in_progress','mandatory_break_required','rolling_study_limit','session_wall_limit'),false)
    or active is distinct from (p_outcome->>'policyCode' not in ('delivery_not_open','delivery_window_closed','rocs_document_unverified'))
    or p_outcome->'observationReady' is distinct from to_jsonb(not outside_window)
    or p_outcome->>'observationCode' is distinct from (case when outside_window then 'outside_window_no_settlement' else 'study_observation_ready' end)
    or p_outcome->'studyWindow' is distinct from 'null'::jsonb or p_outcome->'studyRecovery' is distinct from 'null'::jsonb
    or p_outcome->'teachingPhaseComplete' is distinct from 'false'::jsonb
    or p_outcome#>>'{progress,mode}' is distinct from 'non_credit_review'
    or p_outcome#>'{progress,creditIssuanceAllowed}' is distinct from 'false'::jsonb
    or p_outcome#>'{progress,revision}' is distinct from p_runtime->'revision'
    or p_outcome#>'{progress,status}' is distinct from p_runtime->'status'
    or p_outcome#>'{progress,sessionId}' is distinct from p_runtime->'sessionId'
    or p_outcome#>'{progress,courseKey}' is distinct from p_runtime->'courseKey'
    or p_outcome#>'{progress,contentDigest}' is distinct from p_runtime->'contentDigest'
    or p_outcome#>'{progress,completedReviewMs}' is distinct from '0'::jsonb
    or p_outcome#>'{progress,provisionalReviewMs}' is distinct from '0'::jsonb
    or p_outcome#>'{progress,completedUnitIds}' is distinct from '[]'::jsonb
    or p_outcome#>'{progress,passedModuleIds}' is distinct from '[]'::jsonb
    or p_outcome#>'{progress,currentUnitId}' is distinct from 'null'::jsonb
    or p_outcome#>'{progress,currentUnitActionComplete}' is distinct from 'false'::jsonb
    or p_outcome#>'{progress,resumeRequired}' is distinct from 'false'::jsonb
    or p_outcome#>'{progress,lessons}' is distinct from '[]'::jsonb
    or p_outcome#>'{progress,quiz}' is distinct from 'null'::jsonb or p_outcome#>'{progress,feedback}' is distinct from 'null'::jsonb
    or p_audit is distinct from jsonb_build_object('review',expected_review,'observation',expected_observation,
      'policy',jsonb_build_object('kind','open_session','code',p_outcome->>'policyCode','atMs',p_at,'actorId',p_actor,
        'offeringId',p_offering->>'id','contentDigest',p_offering->>'contentDigest','policyId',p_policy_id)) then
    raise exception 'nmls_first_final_handoff_invalid_start';
  end if;
end $$;

create function public.nmls_first_final_handoff_commit(p_student_id uuid,p_attempt_id uuid,p_final_id uuid,p_event_id uuid,
  p_command_digest text,p_expected_source_revision bigint,p_expected_final_revision bigint,p_expected_delivery_revision bigint,
  p_expected_workflow_revision bigint,p_expected_runtime_revision bigint,p_expected_actor_revision bigint,p_expected_session_id uuid,
  p_evaluated_at_ms bigint,p_definition_digest text,p_intent jsonb,p_transition jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants; b public.nmls_review_policy_bindings; a public.nmls_review_attempts;
  lease public.nmls_review_study_leases; l public.nmls_review_actor_policy; f public.nmls_private_finals;
  d public.nmls_first_final_deliveries; w public.nmls_private_remediations; genesis public.nmls_first_final_submission_events;
  gd public.nmls_first_final_delivery_events; h public.nmls_first_final_handoff_events; te public.nmls_teaching_events;
  source_pin public.nmls_teaching_phase_bindings; child_pin public.nmls_teaching_phase_bindings;
  original_intent jsonb; validated jsonb; command jsonb; phase jsonb; expected_layout jsonb; empty_runtime jsonb;
  next_runtime jsonb; next_ledger jsonb; teaching_outcome jsonb; next_lease jsonb; expected_final_lease jsonb;
  committed jsonb; outcome jsonb; field text; keys text[]; teaching_digest text;
  at_ms bigint; opening_ms bigint; cutoff_ms bigint; deadline_ms bigint; receipt_ms bigint;
begin
  if p_student_id is null or p_attempt_id is null or p_final_id is null or p_event_id is null or p_expected_session_id is null
    or not coalesce(p_command_digest ~ '^[a-f0-9]{64}$',false)
    or not coalesce(p_definition_digest ~ '^[a-f0-9]{64}$',false) then raise exception 'nmls_first_final_handoff_invalid_command'; end if;
  keys:=array['kind','attemptId','finalAttemptId','expectedSourceRevision','expectedFinalRevision','expectedDeliveryRevision',
    'expectedWorkflowRevision','expectedRevision','expectedActorRevision','sessionId','eventId'];
  if jsonb_typeof(p_intent) is distinct from 'object' or not (p_intent ?& keys) or p_intent-keys<>'{}'::jsonb
    or p_intent->>'kind' is distinct from 'start_first_remediation' or p_intent->>'attemptId' is distinct from p_attempt_id::text
    or p_intent->>'finalAttemptId' is distinct from p_final_id::text or p_intent->>'eventId' is distinct from p_event_id::text
    or p_intent->'expectedSourceRevision' is distinct from to_jsonb(p_expected_source_revision)
    or p_intent->'expectedFinalRevision' is distinct from '2'::jsonb or p_expected_final_revision is distinct from 2
    or p_intent->'expectedDeliveryRevision' is distinct from to_jsonb(p_expected_delivery_revision)
    or p_intent->'expectedWorkflowRevision' is distinct from '1'::jsonb or p_expected_workflow_revision is distinct from 1
    or p_intent->'expectedRevision' is distinct from '0'::jsonb or p_expected_runtime_revision is distinct from 0
    or p_intent->'expectedActorRevision' is distinct from to_jsonb(p_expected_actor_revision)
    or p_intent->>'sessionId' is distinct from p_expected_session_id::text
    or public.nmls_first_final_submission_hash(p_intent) is distinct from p_command_digest then
    raise exception 'nmls_first_final_handoff_invalid_intent'; end if;
  foreach field in array array['expectedSourceRevision','expectedFinalRevision','expectedDeliveryRevision','expectedWorkflowRevision','expectedRevision','expectedActorRevision'] loop
    if not public.nmls_final_guard_integer(p_intent->field,9007199254740991,false) then raise exception 'nmls_first_final_handoff_invalid_intent'; end if;
  end loop;
  command:=jsonb_build_object('kind','resume','attemptId',p_attempt_id,'eventId',p_event_id,'phaseKind','remediation',
    'phaseOwnerId',p_final_id,'expectedSourceRevision',p_expected_source_revision,'expectedWorkflowRevision',1,
    'expectedRevision',0,'expectedActorRevision',p_expected_actor_revision,'sessionId',null);
  teaching_digest:=public.nmls_first_final_submission_hash(command);
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a0 on a0.grant_id=g0.id
    where a0.id=p_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status is distinct from 'active'
    or g.expires_at<=clock_timestamp() then raise exception 'nmls_first_final_handoff_access_denied'; end if;
  select * into lease from public.nmls_review_study_leases where student_id=p_student_id for update;
  select * into l from public.nmls_review_actor_policy where student_id=p_student_id for update;
  select * into a from public.nmls_review_attempts where id=p_attempt_id for update;
  select * into f from public.nmls_private_finals where id=p_final_id for update;
  select * into d from public.nmls_first_final_deliveries where final_id=p_final_id for update;
  select * into w from public.nmls_private_remediations where first_final_id=p_final_id for update;
  select * into b from public.nmls_review_policy_bindings where grant_id=g.id;
  select s.* into genesis from public.nmls_first_final_submission_events s where s.student_id=p_student_id and s.final_id=p_final_id and s.submitted;
  select * into gd from public.nmls_first_final_delivery_events where student_id=p_student_id and event_id=genesis.event_id;
  if genesis.event_id is null or gd.event_id is null or f.student_id is distinct from p_student_id or f.review_attempt_id is distinct from a.id
    or f.revision is distinct from 2 or f.definition_digest is distinct from p_definition_digest then raise exception 'nmls_first_final_handoff_genesis_required'; end if;
  -- Reconstruct immutable original intent and use036's existing exact-replay
  -- validator. It authenticates source/ROCS/result/manifest/pair with no grade,
  -- no035 invocation and no additional event or state mutation.
  original_intent:=jsonb_build_object('kind','submit_first_final','attemptId',a.id,'finalAttemptId',f.id,'eventId',genesis.event_id,
    'expectedSourceRevision',genesis.source_revision,'expectedFinalRevision',1,'expectedRevision',genesis.delivery_revision-1,
    'expectedActorRevision',genesis.actor_revision-1,'sessionId',gd.lease_before->'session_id','answers',f.answers,
    'studyReceipt',jsonb_build_object('windowId',gd.audit#>'{observation,windowBefore,id}','visible',true));
  validated:=public.nmls_first_final_submission_commit(p_student_id,a.id,f.id,genesis.event_id,genesis.command_digest,
    genesis.source_revision,1,genesis.delivery_revision-1,genesis.actor_revision-1,(gd.lease_before->>'session_id')::uuid,
    p_evaluated_at_ms,p_definition_digest,original_intent,'{}'::jsonb);
  if validated->'duplicate' is distinct from 'true'::jsonb or validated->'outcome' is distinct from genesis.outcome then
    raise exception 'nmls_first_final_handoff_genesis_required'; end if;
  if f.result->'passed' is distinct from 'false'::jsonb or w.first_final_id is null then raise exception 'nmls_first_final_handoff_first_not_failed'; end if;
  if w.student_id is distinct from p_student_id or w.review_attempt_id is distinct from a.id
    or w.definition_digest is distinct from f.definition_digest or w.manifest is distinct from f.remediation_manifest
    or d.final_id is null or d.student_id is distinct from p_student_id or d.review_attempt_id is distinct from a.id
    or d.revision is distinct from genesis.delivery_revision or d.runtime is distinct from gd.runtime
    or d.runtime->>'status' is distinct from 'paused' or d.runtime->>'sessionId' is null then raise exception 'nmls_first_final_handoff_scope_changed'; end if;
  phase:=jsonb_build_object('version','nmls-teaching-phase-v1','kind','remediation','ownerId',f.id,'sourceCourseKey',a.course_key,
    'sourceContentDigest',a.content_digest,'teachingCourseKey',w.manifest->>'courseKey','policyDigest',b.policy_digest,
    'definitionDigest',f.definition_digest,'manifestDigest',public.nmls_first_final_submission_hash(w.manifest));
  select * into source_pin from public.nmls_teaching_phase_bindings where student_id=p_student_id and review_attempt_id=a.id
    and phase_kind='source' and phase_owner_id=a.id;
  select jsonb_agg(value order by n) into expected_layout from jsonb_array_elements(source_pin.layout) with ordinality x(value,n)
    where w.manifest->'moduleIds' ? (value->>'id');
  if expected_layout is null then raise exception 'nmls_first_final_handoff_layout_changed'; end if;
  select * into child_pin from public.nmls_teaching_phase_bindings where student_id=p_student_id and review_attempt_id=a.id
    and phase_kind='remediation' and phase_owner_id=f.id;
  expected_final_lease:=jsonb_build_object('student_id',p_student_id,'attempt_id',a.id,'session_id',d.runtime->'sessionId',
    'phase_kind','final','phase_owner_id',f.id,'phase_active',false);
  empty_runtime:=jsonb_build_object('mode','non_credit_review','creditIssuanceAllowed',false,'courseKey',w.manifest->>'courseKey',
    'contentDigest',w.manifest->>'contentDigest','revision',0,'status','logged_out','sessionId',null,'lastActivityMs',null,
    'lastReceiptMs',0,'completedUnitIds','[]'::jsonb,'completedReviewMs',0,'passedModuleIds','[]'::jsonb,'current',null,'quiz',null,'feedback',null);
  select * into h from public.nmls_first_final_handoff_events where student_id=p_student_id and event_id=p_event_id;
  select * into te from public.nmls_teaching_events where student_id=p_student_id and event_id=p_event_id;
  if h.event_id is not null or te.event_id is not null then
    if h.event_id is null or te.event_id is null or h.final_id is distinct from f.id or h.review_attempt_id is distinct from a.id
      or h.genesis_event_id is distinct from genesis.event_id or h.command_digest is distinct from p_command_digest
      or h.teaching_command_digest is distinct from teaching_digest or te.command_digest is distinct from teaching_digest
      or h.definition_digest is distinct from f.definition_digest or h.teaching_digest is distinct from w.manifest->>'contentDigest'
      or h.phase_scope is distinct from phase or h.source_revision is distinct from p_expected_source_revision
      or h.delivery_revision is distinct from p_expected_delivery_revision or h.actor_revision is distinct from p_expected_actor_revision+1
      or h.lease_before is distinct from expected_final_lease or h.lease_before->>'session_id' is distinct from p_expected_session_id::text
      or te.review_attempt_id is distinct from a.id or te.phase_kind is distinct from 'remediation' or te.phase_owner_id is distinct from f.id
      or te.source_revision is distinct from h.source_revision or te.workflow_revision is distinct from h.workflow_revision
      or te.runtime_revision is distinct from h.runtime_revision or te.actor_revision is distinct from h.actor_revision
      or te.transaction_id is distinct from h.transaction_id or te.lease_before is distinct from h.lease_before or te.lease_after is distinct from h.lease_after
      or h.lease_after is distinct from h.lease_before||jsonb_build_object('phase_kind','remediation','phase_owner_id',f.id,
        'phase_active',h.runtime->>'status'='active','session_id',coalesce(h.runtime->>'sessionId',p_expected_session_id::text))
      or te.audit#>>'{review,kind}' is distinct from 'resume' or te.audit#>'{review,atMs}' is distinct from h.runtime->'lastReceiptMs'
      or te.outcome->'deliveryAllowed' is distinct from 'false'::jsonb or te.outcome->'deliveryUntilMs' is distinct from 'null'::jsonb
      or te.outcome->'studyWindow' is distinct from 'null'::jsonb or te.outcome#>'{progress,lessons}' is distinct from '[]'::jsonb
      or te.outcome#>'{progress,quiz}' is distinct from 'null'::jsonb or te.outcome#>'{progress,feedback}' is distinct from 'null'::jsonb
      or h.runtime->'revision' is distinct from '1'::jsonb or h.runtime->'completedReviewMs' is distinct from '0'::jsonb
      or h.runtime->'completedUnitIds' is distinct from '[]'::jsonb or h.runtime->'passedModuleIds' is distinct from '[]'::jsonb
      or h.runtime-array['revision','status','sessionId','lastActivityMs','lastReceiptMs']
        is distinct from empty_runtime-array['revision','status','sessionId','lastActivityMs','lastReceiptMs']
      or not public.nmls_final_guard_integer(h.runtime->'lastReceiptMs',9007199254740991,false)
      or h.runtime->>'status'='active' and (h.runtime->>'sessionId' is null or h.runtime->>'sessionId'=p_expected_session_id::text
        or h.runtime->'lastActivityMs' is distinct from h.runtime->'lastReceiptMs')
      or h.runtime->>'status'='logged_out' and (h.runtime->'sessionId' is distinct from 'null'::jsonb
        or h.runtime->'lastActivityMs' is distinct from 'null'::jsonb)
      or te.outcome#>'{progress,revision}' is distinct from h.runtime->'revision'
      or te.outcome#>'{progress,status}' is distinct from h.runtime->'status'
      or te.outcome#>'{progress,sessionId}' is distinct from h.runtime->'sessionId'
      or te.outcome#>'{progress,courseKey}' is distinct from h.runtime->'courseKey'
      or te.outcome#>'{progress,contentDigest}' is distinct from h.runtime->'contentDigest'
      or a.revision<h.source_revision or l.revision<h.actor_revision or w.revision<h.workflow_revision
      or (w.runtime->>'revision')::bigint<h.runtime_revision or w.revision=h.workflow_revision and w.runtime is distinct from h.runtime
      or child_pin.student_id is null or child_pin.phase_scope is distinct from phase or child_pin.layout is distinct from expected_layout
      or child_pin.teaching_digest is distinct from h.teaching_digest then raise exception 'nmls_first_final_handoff_idempotency_conflict'; end if;
    receipt_ms:=(h.runtime->>'lastReceiptMs')::bigint;
    if receipt_ms<greatest(floor(extract(epoch from f.submitted_at)*1000)::bigint,
        floor(extract(epoch from genesis.recorded_at)*1000)::bigint,floor(extract(epoch from gd.recorded_at)*1000)::bigint)
      or abs(receipt_ms-floor(extract(epoch from h.recorded_at)*1000)::bigint)>1000
      or abs(receipt_ms-floor(extract(epoch from te.recorded_at)*1000)::bigint)>1000 then
      raise exception 'nmls_first_final_handoff_idempotency_conflict'; end if;
    perform public.nmls_first_final_handoff_start_guard(h.runtime,te.outcome,te.audit,b.offering,b.policy_id,p_student_id,
      p_expected_session_id,receipt_ms);
    outcome:=public.nmls_first_final_handoff_outcome(f.id,h.source_revision,h.delivery_revision,h.actor_revision,h.runtime,te.outcome);
    if h.outcome is distinct from outcome then raise exception 'nmls_first_final_handoff_idempotency_conflict'; end if;
    return jsonb_build_object('duplicate',true,'outcome',h.outcome);
  end if;
  if exists(select 1 from public.nmls_first_final_handoff_events where final_id=f.id) then raise exception 'nmls_first_final_handoff_already_recorded'; end if;
  if exists(select 1 from public.nmls_review_attempt_events x join public.nmls_review_attempts y on y.id=x.attempt_id
      where y.student_id=p_student_id and x.event_id=p_event_id)
    or exists(select 1 from public.nmls_review_actor_policy_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_private_final_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_private_remediation_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_final_reservation_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_first_final_delivery_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_first_final_submission_events where student_id=p_student_id and event_id=p_event_id) then
    raise exception 'nmls_review_idempotency_conflict'; end if;
  if a.revision is distinct from p_expected_source_revision or d.revision is distinct from p_expected_delivery_revision
    or w.revision is distinct from 1 or w.runtime->'revision' is distinct from '0'::jsonb
    or l.revision is distinct from p_expected_actor_revision then raise exception 'nmls_review_revision_conflict'; end if;
  if to_jsonb(lease) is distinct from expected_final_lease or d.runtime->>'sessionId' is distinct from p_expected_session_id::text then
    raise exception 'nmls_review_session_conflict'; end if;
  if w.status is distinct from 'remediating' or w.runtime is distinct from empty_runtime or child_pin.student_id is not null
    or w.second_id is not null or w.second_selection is not null or w.second_answers is not null or w.second_result is not null
    or w.second_issued_at is not null or w.second_submitted_at is not null
    or l.ledger#>'{observationJournal,active}' is distinct from 'null'::jsonb
    or l.ledger#>'{observationJournal,unresolved}' is distinct from 'null'::jsonb then raise exception 'nmls_first_final_handoff_initial_state_required'; end if;
  if jsonb_typeof(p_transition) is distinct from 'object'
    or not (p_transition ?& array['phase','command','teachingDigest','layout','runtime','ledger','outcome','audit'])
    or p_transition-array['phase','command','teachingDigest','layout','runtime','ledger','outcome','audit']<>'{}'::jsonb
    or p_transition->'phase' is distinct from phase or p_transition->'command' is distinct from command
    or p_transition->>'teachingDigest' is distinct from w.manifest->>'contentDigest'
    or p_transition->'layout' is distinct from expected_layout then raise exception 'nmls_first_final_handoff_invalid_transition'; end if;
  next_runtime:=p_transition->'runtime'; next_ledger:=p_transition->'ledger'; teaching_outcome:=p_transition->'outcome';
  perform public.nmls_first_final_handoff_start_guard(next_runtime,teaching_outcome,p_transition->'audit',b.offering,b.policy_id,
    p_student_id,p_expected_session_id,p_evaluated_at_ms);
  if next_runtime-array['revision','status','sessionId','lastActivityMs','lastReceiptMs']
      is distinct from empty_runtime-array['revision','status','sessionId','lastActivityMs','lastReceiptMs']
    or next_runtime->'revision' is distinct from '1'::jsonb
    or not coalesce(next_runtime->>'status' in ('active','logged_out'),false)
    or next_runtime->'lastReceiptMs' is distinct from to_jsonb(p_evaluated_at_ms)
    or next_runtime->>'status'='active' and (next_runtime->>'sessionId' is null
      or next_runtime->>'sessionId'=p_expected_session_id::text or next_runtime->'lastActivityMs' is distinct from to_jsonb(p_evaluated_at_ms))
    or next_runtime->>'status'='logged_out' and (next_runtime->'sessionId' is distinct from 'null'::jsonb
      or next_runtime->'lastActivityMs' is distinct from 'null'::jsonb)
    or next_ledger#>'{observationJournal,active}' is distinct from 'null'::jsonb
    or next_ledger#>'{observationJournal,unresolved}' is distinct from 'null'::jsonb
    or teaching_outcome#>'{progress,revision}' is distinct from next_runtime->'revision'
    or teaching_outcome#>'{progress,status}' is distinct from next_runtime->'status'
    or teaching_outcome#>'{progress,sessionId}' is distinct from next_runtime->'sessionId'
    or teaching_outcome#>'{progress,courseKey}' is distinct from next_runtime->'courseKey'
    or teaching_outcome#>'{progress,contentDigest}' is distinct from next_runtime->'contentDigest'
    or teaching_outcome#>'{progress,completedReviewMs}' is distinct from '0'::jsonb
    or teaching_outcome#>'{progress,provisionalReviewMs}' is distinct from '0'::jsonb
    or teaching_outcome#>'{progress,completedUnitIds}' is distinct from '[]'::jsonb
    or teaching_outcome#>'{progress,passedModuleIds}' is distinct from '[]'::jsonb
    or teaching_outcome#>'{progress,currentUnitId}' is distinct from 'null'::jsonb
    or teaching_outcome#>'{progress,currentUnitActionComplete}' is distinct from 'false'::jsonb
    or teaching_outcome#>'{progress,resumeRequired}' is distinct from 'false'::jsonb
    or teaching_outcome#>'{progress,lessons}' is distinct from '[]'::jsonb
    or teaching_outcome#>'{progress,quiz}' is distinct from 'null'::jsonb or teaching_outcome#>'{progress,feedback}' is distinct from 'null'::jsonb
    or teaching_outcome->'studyWindow' is distinct from 'null'::jsonb or teaching_outcome->'studyRecovery' is distinct from 'null'::jsonb
    or teaching_outcome->'teachingPhaseComplete' is distinct from 'false'::jsonb
    or teaching_outcome->'ok' is distinct from to_jsonb(next_runtime->>'status'='active')
    or teaching_outcome->'status' is distinct from (case when next_runtime->>'status'='active' then '200'::jsonb else '401'::jsonb end)
    or teaching_outcome->>'code' is distinct from (case when next_runtime->>'status'='active' then 'review_session_started' else 'course_logout_required' end)
    or p_transition#>>'{audit,review,kind}' is distinct from 'resume'
    or p_transition#>>'{audit,policy,kind}' is distinct from 'open_session'
    or p_transition#>'{audit,policy,observation}' is not null then raise exception 'nmls_first_final_handoff_material_forbidden'; end if;
  opening_ms:=(b.offering->>'opensAtMs')::bigint; cutoff_ms:=(b.offering->>'closesAtMs')::bigint;
  at_ms:=floor(extract(epoch from clock_timestamp())*1000);
  receipt_ms:=greatest((l.ledger->>'lastReceiptMs')::bigint,(d.runtime->>'lastReceiptMs')::bigint,
    floor(extract(epoch from f.submitted_at)*1000)::bigint,floor(extract(epoch from genesis.recorded_at)*1000)::bigint,
    floor(extract(epoch from gd.recorded_at)*1000)::bigint);
  if p_evaluated_at_ms is null or p_evaluated_at_ms<receipt_ms or p_evaluated_at_ms>at_ms+1000 or at_ms-p_evaluated_at_ms>1000
    or (at_ms<opening_ms) is distinct from (p_evaluated_at_ms<opening_ms)
    or (at_ms>=cutoff_ms) is distinct from (p_evaluated_at_ms>=cutoff_ms) then raise exception 'nmls_review_clock_refresh_required'; end if;
  next_lease:=to_jsonb(lease)||jsonb_build_object('attempt_id',a.id,'phase_kind','remediation','phase_owner_id',f.id,
    'phase_active',next_runtime->>'status'='active','session_id',coalesce(next_runtime->>'sessionId',lease.session_id::text));
  outcome:=public.nmls_first_final_handoff_outcome(f.id,a.revision,d.revision,p_expected_actor_revision+1,next_runtime,teaching_outcome);
  insert into public.nmls_first_final_handoff_events(student_id,event_id,final_id,review_attempt_id,genesis_event_id,command_digest,
    teaching_command_digest,definition_digest,teaching_digest,phase_scope,source_revision,final_revision,delivery_revision,
    workflow_revision,runtime_revision,actor_revision,lease_before,lease_after,runtime,outcome)
    values(p_student_id,p_event_id,f.id,a.id,genesis.event_id,p_command_digest,teaching_digest,f.definition_digest,
      w.manifest->>'contentDigest',phase,a.revision,2,d.revision,2,1,p_expected_actor_revision+1,to_jsonb(lease),next_lease,next_runtime,outcome);
  -- Existing ledger only;032 will never take its bootstrap branch. This is the
  -- real owner-only032 delegate, not the public final-fenced wrapper.
  committed:=public.nmls_teaching_pre_final_delivery_internal(p_student_id,a.id,p_event_id,teaching_digest,phase,
    w.manifest->>'contentDigest',expected_layout,a.revision,1,0,p_expected_actor_revision,null,p_evaluated_at_ms,
    l.ledger,next_ledger,next_runtime,teaching_outcome,p_transition->'audit',(teaching_outcome->>'deliveryUntilMs')::bigint);
  if committed->'duplicate' is distinct from 'false'::jsonb or committed->'outcome' is distinct from teaching_outcome
    or committed->'sourceRevision' is distinct from to_jsonb(a.revision) or committed->'workflowRevision' is distinct from '2'::jsonb then
    raise exception 'nmls_first_final_handoff_idempotency_conflict'; end if;
  select * into te from public.nmls_teaching_events where student_id=p_student_id and event_id=p_event_id;
  if te.event_id is null or te.transaction_id is distinct from txid_current() or te.command_digest is distinct from teaching_digest
    or te.source_revision is distinct from a.revision or te.workflow_revision is distinct from 2 or te.runtime_revision is distinct from 1
    or te.actor_revision is distinct from p_expected_actor_revision+1 or te.lease_before is distinct from to_jsonb(lease)
    or te.lease_after is distinct from next_lease then raise exception 'nmls_first_final_handoff_idempotency_conflict'; end if;
  -- Nested032 already checks its limits. Recheck again after the outer receipt
  -- and actual writes, without assigning old final inactivity to a new child.
  at_ms:=floor(extract(epoch from clock_timestamp())*1000);
  if g.expires_at<=clock_timestamp() then raise exception 'nmls_first_final_handoff_access_denied'; end if;
  if teaching_outcome->'deliveryAllowed'='true'::jsonb then
    deadline_ms:=least(cutoff_ms,(teaching_outcome->>'deliveryUntilMs')::bigint,
      (next_runtime->>'lastActivityMs')::bigint+360000,(next_ledger->>'sessionStartedAtMs')::bigint+43200000);
  end if;
  if p_evaluated_at_ms>at_ms+1000 or at_ms-p_evaluated_at_ms>1000
    or (at_ms<opening_ms) is distinct from (p_evaluated_at_ms<opening_ms)
    or (at_ms>=cutoff_ms) is distinct from (p_evaluated_at_ms>=cutoff_ms)
    or teaching_outcome->'deliveryAllowed'='true'::jsonb and at_ms>=deadline_ms then raise exception 'nmls_review_clock_refresh_required'; end if;
  return jsonb_build_object('duplicate',false,'outcome',outcome);
end $$;

revoke all on function public.nmls_review_lease_phase_integrity(),
  public.nmls_teaching_pre_handoff_internal(uuid,uuid,uuid,text,jsonb,text,jsonb,bigint,bigint,bigint,bigint,uuid,bigint,jsonb,jsonb,jsonb,jsonb,jsonb,bigint),
  public.nmls_teaching_commit(uuid,uuid,uuid,text,jsonb,text,jsonb,bigint,bigint,bigint,bigint,uuid,bigint,jsonb,jsonb,jsonb,jsonb,jsonb,bigint),
  public.nmls_first_final_handoff_outcome(uuid,bigint,bigint,bigint,jsonb,jsonb),
  public.nmls_first_final_handoff_start_guard(jsonb,jsonb,jsonb,jsonb,text,uuid,uuid,bigint),
  public.nmls_first_final_handoff_context(uuid,uuid,uuid,uuid),
  public.nmls_first_final_handoff_commit(uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb,jsonb)
  from public,anon,authenticated,service_role;
grant execute on function
  public.nmls_teaching_commit(uuid,uuid,uuid,text,jsonb,text,jsonb,bigint,bigint,bigint,bigint,uuid,bigint,jsonb,jsonb,jsonb,jsonb,jsonb,bigint),
  public.nmls_first_final_handoff_context(uuid,uuid,uuid,uuid),
  public.nmls_first_final_handoff_commit(uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb,jsonb) to service_role;
commit;
