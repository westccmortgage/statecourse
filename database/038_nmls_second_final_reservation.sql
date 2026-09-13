-- LOCAL PRIVATE AUTHORING ONLY. A completed037->032 child may reserve ONE
-- entirely new second form. This neither starts an exam session nor exposes
-- questions, grades, creates a third attempt, claims attendance or awards CE.
-- Older migrations remain unchanged. The actual032 check and the028 form seal
-- are one atomic transaction with an immutable paired038 receipt.
begin;

create table public.nmls_second_final_reservation_events (
  student_id uuid not null references public.students(id), event_id uuid not null,
  first_final_id uuid not null references public.nmls_private_finals(id),
  review_attempt_id uuid not null references public.nmls_review_attempts(id),
  handoff_event_id uuid not null, terminal_event_id uuid not null,
  command_digest text not null check(command_digest ~ '^[a-f0-9]{64}$'),
  teaching_command_digest text not null check(teaching_command_digest ~ '^[a-f0-9]{64}$'),
  definition_digest text not null check(definition_digest ~ '^[a-f0-9]{64}$'),
  teaching_digest text not null check(teaching_digest ~ '^[a-f0-9]{64}$'),
  phase_scope jsonb not null check(jsonb_typeof(phase_scope)='object'),
  source_revision bigint not null check(source_revision>0), final_revision bigint not null check(final_revision=2),
  workflow_before_revision bigint not null check(workflow_before_revision>2),
  runtime_before_revision bigint not null check(runtime_before_revision>1),
  actor_before_revision bigint not null check(actor_before_revision>0),
  teaching_workflow_revision bigint not null, workflow_revision bigint not null,
  runtime_revision bigint not null, actor_revision bigint not null,
  session_id uuid not null, lease_before jsonb not null, lease_after jsonb not null,
  runtime_before jsonb not null, runtime jsonb not null,
  reserved boolean not null, second_id uuid, selection_digest text,
  outcome jsonb not null, transaction_id bigint not null default txid_current(),
  recorded_at timestamptz not null default clock_timestamp(),
  primary key(student_id,event_id), unique(student_id,actor_revision),
  foreign key(student_id,handoff_event_id) references public.nmls_first_final_handoff_events(student_id,event_id),
  foreign key(student_id,terminal_event_id) references public.nmls_teaching_events(student_id,event_id),
  foreign key(student_id,event_id) references public.nmls_teaching_events(student_id,event_id),
  check(teaching_workflow_revision=workflow_before_revision+1 and runtime_revision=runtime_before_revision+1
    and actor_revision=actor_before_revision+1 and workflow_revision=teaching_workflow_revision+case when reserved then 1 else 0 end),
  check((reserved and second_id is not null and selection_digest is not null and selection_digest ~ '^[a-f0-9]{64}$')
    or(not reserved and second_id is null and selection_digest is null)),
  check(jsonb_typeof(outcome)='object' and outcome->'reserved' is not distinct from to_jsonb(reserved)
    and outcome->'deliveryAllowed' is not distinct from 'false'::jsonb
    and outcome->'studentDeliveryEnabled' is not distinct from 'false'::jsonb
    and outcome->'creditIssuanceAllowed' is not distinct from 'false'::jsonb
    and outcome->'retakeEnabled' is not distinct from 'false'::jsonb)
);
create unique index nmls_second_final_reservation_one_form on public.nmls_second_final_reservation_events(first_final_id) where reserved;
create unique index nmls_second_final_reservation_unique_form on public.nmls_second_final_reservation_events(second_id) where reserved;
alter table public.nmls_second_final_reservation_events enable row level security;
revoke all on public.nmls_second_final_reservation_events from public,anon,authenticated,service_role;
create trigger nmls_second_final_reservation_immutable before update or delete on public.nmls_second_final_reservation_events
  for each row execute function public.nmls_private_final_event_immutable();

-- A direct032 caller cannot adopt or replay the derived half of an038 intent.
alter function public.nmls_teaching_commit(uuid,uuid,uuid,text,jsonb,text,jsonb,bigint,bigint,bigint,bigint,uuid,bigint,jsonb,jsonb,jsonb,jsonb,jsonb,bigint)
  rename to nmls_teaching_pre_second_reservation_internal;
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
  if exists(select 1 from public.nmls_second_final_reservation_events where student_id=p_student_id and event_id=p_event_id) then
    raise exception 'nmls_review_idempotency_conflict'; end if;
  return public.nmls_teaching_pre_second_reservation_internal(p_student_id,p_attempt_id,p_event_id,p_command_digest,p_phase,p_teaching_digest,p_layout,
    p_expected_source_revision,p_expected_workflow_revision,p_expected_runtime_revision,p_expected_actor_revision,p_expected_session_id,
    p_evaluated_at_ms,p_initial_ledger,p_ledger,p_runtime,p_outcome,p_audit,p_delivery_until_ms);
end $$;

create function public.nmls_second_final_reservation_context(p_student_id uuid,p_attempt_id uuid,p_first_final_id uuid,p_event_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare ctx jsonb; h public.nmls_first_final_handoff_events; ht public.nmls_teaching_events;
  last_event public.nmls_teaching_events; terminal public.nmls_teaching_events; pin public.nmls_teaching_phase_bindings;
  r public.nmls_second_final_reservation_events; e public.nmls_teaching_events;
begin
  ctx:=public.nmls_first_final_handoff_context(p_student_id,p_attempt_id,p_first_final_id,p_event_id);
  select * into h from public.nmls_first_final_handoff_events where student_id=p_student_id and final_id=p_first_final_id;
  select * into ht from public.nmls_teaching_events where student_id=p_student_id and event_id=h.event_id;
  select * into last_event from public.nmls_teaching_events where student_id=p_student_id and review_attempt_id=p_attempt_id
    and phase_kind='remediation' and phase_owner_id=p_first_final_id order by workflow_revision desc limit 1;
  select * into terminal from public.nmls_teaching_events where student_id=p_student_id and review_attempt_id=p_attempt_id
    and phase_kind='remediation' and phase_owner_id=p_first_final_id and audit#>>'{review,kind}'='quiz_submit'
    and audit#>'{review,passed}'='true'::jsonb and outcome#>>'{progress,status}'='review_complete'
    order by workflow_revision desc limit 1;
  select * into pin from public.nmls_teaching_phase_bindings where student_id=p_student_id and review_attempt_id=p_attempt_id
    and phase_kind='remediation' and phase_owner_id=p_first_final_id;
  select * into r from public.nmls_second_final_reservation_events where student_id=p_student_id and event_id=p_event_id;
  select * into e from public.nmls_teaching_events where student_id=p_student_id and event_id=p_event_id;
  return ctx||jsonb_build_object('handoffOrigin',case when h.event_id is null then null else to_jsonb(h) end,
    'handoffOriginTeachingEvent',case when ht.event_id is null then null else to_jsonb(ht) end,
    'latestChildEvent',case when last_event.event_id is null then null else to_jsonb(last_event) end,
    'terminalChildEvent',case when terminal.event_id is null then null else to_jsonb(terminal) end,
    'childBinding',case when pin.student_id is null then null else to_jsonb(pin) end,
    'secondReservationEvent',case when r.event_id is null then null else to_jsonb(r) end,
    'secondReservationTeachingEvent',case when e.event_id is null then null else to_jsonb(e) end,
    'serverTimeMs',floor(extract(epoch from clock_timestamp())*1000)::bigint);
end $$;

-- Definition bytes are supplied only by the trusted private loader. Their
-- canonical hash must equal the original033/026 digest; do not persist them.
-- This proves bank membership/quota correspondence, not legal/SME accuracy.
create function public.nmls_second_final_definition_guard(p_definition jsonb,p_digest text,p_source jsonb,p_layout jsonb)
returns void language plpgsql set search_path=pg_catalog,public as $$
declare modules jsonb; units jsonb; item jsonb; module_id text; quota bigint; total bigint:=0;
begin
  if jsonb_typeof(p_definition) is distinct from 'object' or octet_length(p_definition::text)>2097152
    or p_definition->>'digest' is distinct from p_digest
    or public.nmls_first_final_submission_hash(p_definition-'digest') is distinct from p_digest
    or p_definition->>'schema' is distinct from 'statecourse-nmls-draft-final-v1'
    or p_definition->>'courseKey' is distinct from p_source->>'course_key'
    or p_definition->>'contentDigest' is distinct from p_source->>'content_digest'
    or p_definition->'year' is distinct from '2026'::jsonb or p_definition->'questionCount' is distinct from '25'::jsonb
    or p_definition->'passPercent' is distinct from '70'::jsonb or p_definition->'maxAutomaticAttempts' is distinct from '2'::jsonb
    or p_definition->>'mode' is distinct from 'private_authoring_review' or p_definition->'assignedCreditSeconds' is distinct from '0'::jsonb
    or p_definition->'studentDeliveryEnabled' is distinct from 'false'::jsonb or p_definition->'salesAuthorized' is distinct from 'false'::jsonb
    or p_definition->'humanReviewed' is distinct from 'false'::jsonb or p_definition->'creditIssuanceAllowed' is distinct from 'false'::jsonb
    or jsonb_typeof(p_definition->'moduleQuotas') is distinct from 'object' or jsonb_typeof(p_definition->'items') is distinct from 'array'
    or jsonb_typeof(p_definition->'modules') is distinct from 'array' or jsonb_typeof(p_definition->'units') is distinct from 'array'
    then raise exception 'nmls_second_final_definition_changed'; end if;
  select jsonb_agg(m->'id' order by n) into modules from jsonb_array_elements(p_layout) with ordinality x(m,n);
  select jsonb_agg(jsonb_build_object('id',u->>'id','moduleId',m->>'id') order by mn,un) into units
    from jsonb_array_elements(p_layout) with ordinality x(m,mn) cross join lateral jsonb_array_elements(m->'units') with ordinality y(u,un);
  if (select jsonb_agg(m->'id' order by n) from jsonb_array_elements(p_definition->'modules') with ordinality x(m,n)) is distinct from modules
    or (select jsonb_agg(jsonb_build_object('id',u->>'id','moduleId',u->>'moduleId') order by n)
      from jsonb_array_elements(p_definition->'units') with ordinality x(u,n)) is distinct from units
    or (select count(*) from jsonb_object_keys(p_definition->'moduleQuotas'))<>jsonb_array_length(modules)
    or jsonb_array_length(p_definition->'items')<>50
    or (select count(distinct i->>'id') from jsonb_array_elements(p_definition->'items') i)<>50 then
    raise exception 'nmls_second_final_definition_changed'; end if;
  for module_id in select jsonb_array_elements_text(modules) loop
    if not public.nmls_final_guard_integer(p_definition#>array['moduleQuotas',module_id],25,false)
      or (p_definition#>>array['moduleQuotas',module_id])::bigint<1 then
      raise exception 'nmls_second_final_definition_changed'; end if;
    quota:=(p_definition#>>array['moduleQuotas',module_id])::bigint; total:=total+quota;
    if (select count(*) from jsonb_array_elements(p_definition->'items') i where i->>'moduleId'=module_id)<>2*quota then
      raise exception 'nmls_second_final_definition_changed'; end if;
  end loop;
  if total<>25 then raise exception 'nmls_second_final_definition_changed'; end if;
  for item in select value from jsonb_array_elements(p_definition->'items') loop
    if jsonb_typeof(item->'id') is distinct from 'string' or length(item->>'id') not between 1 and 160
      or not coalesce(modules ? (item->>'moduleId'),false) or jsonb_typeof(item->'options') is distinct from 'array'
      or (select jsonb_agg(o->'id' order by o->>'id') from jsonb_array_elements(item->'options') o) is distinct from '["A","B","C","D"]'::jsonb then
      raise exception 'nmls_second_final_definition_changed'; end if;
  end loop;
end $$;

create function public.nmls_second_final_selection_guard(p_selection jsonb,p_id uuid,p_attempt uuid,p_definition jsonb,p_number bigint,p_excluded jsonb)
returns void language plpgsql set search_path=pg_catalog,public as $$
declare field text; module_id text; count_required bigint;
begin
  if p_id is null or jsonb_typeof(p_selection) is distinct from 'object'
    or not(p_selection ?& array['schema','id','reviewAttemptId','definitionDigest','number','questionIds','optionOrder'])
    or p_selection-array['schema','id','reviewAttemptId','definitionDigest','number','questionIds','optionOrder']<>'{}'::jsonb
    or p_selection->>'schema' is distinct from 'statecourse-nmls-draft-final-attempt-v1'
    or p_selection->>'id' is distinct from p_id::text or p_selection->>'reviewAttemptId' is distinct from p_attempt::text
    or p_selection->>'definitionDigest' is distinct from p_definition->>'digest' or p_selection->'number' is distinct from to_jsonb(p_number)
    or jsonb_typeof(p_selection->'questionIds') is distinct from 'array' or jsonb_typeof(p_selection->'optionOrder') is distinct from 'object' then
    raise exception 'nmls_second_final_invalid_selection'; end if;
  if jsonb_array_length(p_selection->'questionIds')<>25 or not public.nmls_private_same_ids(p_selection->'questionIds',p_selection->'questionIds')
    or (select count(*) from jsonb_object_keys(p_selection->'optionOrder'))<>25 then raise exception 'nmls_second_final_invalid_selection'; end if;
  for field in select jsonb_array_elements_text(p_selection->'questionIds') loop
    if not exists(select 1 from jsonb_array_elements(p_definition->'items') i where i->>'id'=field)
      or coalesce(p_excluded ? field,false) or jsonb_typeof(p_selection#>array['optionOrder',field]) is distinct from 'array'
      or not public.nmls_private_same_ids(p_selection#>array['optionOrder',field],'["A","B","C","D"]'::jsonb) then
      raise exception 'nmls_second_final_invalid_selection'; end if;
  end loop;
  for module_id,count_required in select key,value::text::bigint from jsonb_each(p_definition->'moduleQuotas') loop
    if (select count(*) from jsonb_array_elements(p_definition->'items') i
      where i->>'moduleId'=module_id and (p_selection->'questionIds') ? (i->>'id'))<>count_required then
      raise exception 'nmls_second_final_invalid_selection'; end if;
  end loop;
end $$;

create function public.nmls_second_final_complete_guard(p_runtime jsonb,p_layout jsonb,p_course text,p_digest text)
returns void language plpgsql set search_path=pg_catalog,public as $$
declare modules jsonb; units jsonb; required_ms bigint;
begin
  select jsonb_agg(m->'id' order by n) into modules from jsonb_array_elements(p_layout) with ordinality x(m,n);
  select jsonb_agg(u->'id' order by mn,un),sum((u->>'requiredMs')::bigint) into units,required_ms
    from jsonb_array_elements(p_layout) with ordinality x(m,mn) cross join lateral jsonb_array_elements(m->'units') with ordinality y(u,un);
  if jsonb_typeof(p_runtime) is distinct from 'object' or p_runtime->>'mode' is distinct from 'non_credit_review'
    or p_runtime-array['mode','creditIssuanceAllowed','courseKey','contentDigest','revision','status','sessionId','lastActivityMs','lastReceiptMs',
      'completedUnitIds','completedReviewMs','passedModuleIds','current','quiz','feedback','bookmark','quizReservation']<>'{}'::jsonb
    or p_runtime->'creditIssuanceAllowed' is distinct from 'false'::jsonb
    or p_runtime->>'courseKey' is distinct from p_course or p_runtime->>'contentDigest' is distinct from p_digest
    or p_runtime->>'status' is distinct from 'review_complete'
    or not coalesce(p_runtime->>'sessionId' ~* '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false)
    or not public.nmls_final_guard_integer(p_runtime->'revision',9007199254740991,false)
    or (p_runtime->>'revision')::bigint<1
    or not public.nmls_final_guard_integer(p_runtime->'lastReceiptMs',9007199254740991,false)
    or not public.nmls_final_guard_integer(p_runtime->'lastActivityMs',9007199254740991,false)
    or (p_runtime->>'lastActivityMs')::bigint>(p_runtime->>'lastReceiptMs')::bigint
    or p_runtime->'completedUnitIds' is distinct from units or p_runtime->'passedModuleIds' is distinct from modules
    or p_runtime->'completedReviewMs' is distinct from to_jsonb(required_ms)
    or p_runtime->'current' is distinct from 'null'::jsonb or p_runtime->'quiz' is distinct from 'null'::jsonb
    or coalesce(p_runtime->'bookmark','null'::jsonb)<>'null'::jsonb or coalesce(p_runtime->'quizReservation','null'::jsonb)<>'null'::jsonb then
    raise exception 'nmls_second_final_remediation_incomplete'; end if;
end $$;

create function public.nmls_second_final_budget_guard(p_ledger jsonb,p_offering jsonb,p_at bigint)
returns bigint language plpgsql set search_path=pg_catalog,public as $$
declare observed jsonb; uncertain jsonb; combined jsonb; boundary_ms bigint; since_ms bigint; rolling_ms bigint; deadline_ms bigint;
begin
  observed:=public.nmls_policy_checked_intervals(p_ledger->'studyIntervals',p_at);
  uncertain:=public.nmls_policy_checked_intervals(p_ledger#>'{uncertainExposure,intervals}',p_at);
  combined:=public.nmls_policy_interval_union(observed,uncertain);
  if not public.nmls_final_guard_integer(p_ledger->'studyBoundaryAtMs',9007199254740991,false)
    or not public.nmls_final_guard_integer(p_ledger->'sessionStartedAtMs',9007199254740991,false)
    or not public.nmls_final_guard_integer(p_ledger->'studySinceBreakMs',9007199254740991,false)
    or p_ledger->'breakStartedAtMs' is distinct from 'null'::jsonb
    or (p_ledger->>'studyBoundaryAtMs')::bigint>p_at or (p_ledger->>'sessionStartedAtMs')::bigint>p_at
    or p_at<(p_offering->>'opensAtMs')::bigint then raise exception 'nmls_second_final_policy_required'; end if;
  boundary_ms:=(p_ledger->>'studyBoundaryAtMs')::bigint;
  rolling_ms:=public.nmls_policy_exposure_in_range(combined,p_at-86400000,p_at);
  since_ms:=greatest((p_ledger->>'studySinceBreakMs')::bigint,public.nmls_policy_exposure_in_range(observed,boundary_ms,p_at))
    +public.nmls_policy_exposure_in_range(combined,boundary_ms,p_at)-public.nmls_policy_exposure_in_range(observed,boundary_ms,p_at);
  deadline_ms:=least((p_offering->>'closesAtMs')::bigint,(p_ledger->>'sessionStartedAtMs')::bigint+43200000);
  if rolling_ms>=36000000 or since_ms>=12000000 or p_at>=deadline_ms then raise exception 'nmls_second_final_policy_required'; end if;
  return deadline_ms;
end $$;

-- Authenticate the terminal032 receipt in its ORIGINAL teaching scope. A
-- latest check_access denial is not the completion event and cannot replace it.
create function public.nmls_second_final_terminal_guard(p_event jsonb,p_runtime jsonb,p_phase jsonb,p_offering jsonb,
  p_policy text,p_actor uuid,p_attempt uuid,p_handoff_at bigint)
returns void language plpgsql set search_path=pg_catalog,public as $$
declare a jsonb:=p_event->'audit'; o jsonb:=p_event->'outcome'; w jsonb:=p_event#>'{audit,observation,windowBefore}';
  at_ms bigint; start_ms bigint; first_ack boolean; policy_audit jsonb; expected_audit jsonb; expected_lease jsonb;
begin
  if not public.nmls_final_guard_integer(a#>'{review,atMs}',9007199254740991,false)
    or jsonb_typeof(w) is distinct from 'object' or not(w ?& array['id','scope','materialDigest','runtimeRevision','openingEventId','issuedAtMs','horizonMs','lastObservedAtMs'])
    or w-array['id','scope','materialDigest','runtimeRevision','openingEventId','issuedAtMs','horizonMs','lastObservedAtMs']<>'{}'::jsonb
    or not coalesce(w->>'id' ~* '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false)
    or not coalesce(w->>'openingEventId' ~* '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false)
    or not coalesce(w->>'materialDigest' ~ '^[a-f0-9]{64}$',false)
    or not public.nmls_final_guard_integer(w->'issuedAtMs',9007199254740991,false)
    or not public.nmls_final_guard_integer(w->'horizonMs',9007199254740991,false)
    or not public.nmls_final_guard_integer(w->'lastObservedAtMs',9007199254740991,true)
    or w->'runtimeRevision' is distinct from to_jsonb((p_event->>'runtime_revision')::bigint-1)
    or w->'scope' is distinct from jsonb_build_object('actorId',p_actor,'attemptId',p_attempt,'offeringId',p_offering->'id',
      'contentDigest',p_runtime->'contentDigest','sessionId',p_runtime->'sessionId','teachingPhase',p_phase) then
    raise exception 'nmls_second_final_terminal_history_changed'; end if;
  at_ms:=(a#>>'{review,atMs}')::bigint; first_ack:=w->'lastObservedAtMs'='null'::jsonb;
  start_ms:=coalesce((w->>'lastObservedAtMs')::bigint,(w->>'issuedAtMs')::bigint);
  expected_lease:=jsonb_build_object('student_id',p_actor,'attempt_id',p_attempt,'phase_kind','remediation','phase_owner_id',p_phase->'ownerId',
    'phase_active',false,'session_id',p_runtime->'sessionId');
  if at_ms<p_handoff_at or p_runtime->'lastActivityMs' is distinct from to_jsonb(at_ms)
    or at_ms<(p_offering->>'opensAtMs')::bigint or at_ms>=(p_offering->>'closesAtMs')::bigint
    or (w->>'issuedAtMs')::bigint<p_handoff_at or start_ms<(w->>'issuedAtMs')::bigint or start_ms>at_ms
    or at_ms-start_ms>30000 or (w->>'horizonMs')::bigint<at_ms or (w->>'horizonMs')::bigint>(p_offering->>'closesAtMs')::bigint
    or (w->>'horizonMs')::bigint<=(w->>'issuedAtMs')::bigint or (w->>'horizonMs')::bigint-start_ms>30000
    or p_event->'lease_before' is distinct from expected_lease||jsonb_build_object('phase_active',true)
    or p_event->'lease_after' is distinct from expected_lease
    or o->'status' is distinct from '200'::jsonb or o->>'policyCode' is distinct from 'session_policy_allowed'
    or o->'observationReady' is distinct from 'true'::jsonb or o->'deliveryAllowed' is distinct from 'false'::jsonb
    or o->'deliveryUntilMs' is distinct from 'null'::jsonb or o->'studyWindow' is distinct from 'null'::jsonb
    or o->'studyRecovery' is distinct from 'null'::jsonb
    or o->'actorRevision' is distinct from p_event->'actor_revision'
    or o#>'{progress,revision}' is distinct from p_event->'runtime_revision'
    or o#>'{progress,creditIssuanceAllowed}' is distinct from 'false'::jsonb
    or o#>'{progress,lessons}' is distinct from '[]'::jsonb or o#>'{progress,quiz}' is distinct from 'null'::jsonb
    or o#>'{progress,feedback}' is distinct from 'null'::jsonb then raise exception 'nmls_second_final_terminal_history_changed'; end if;
  policy_audit:=jsonb_build_object('kind','check_access','code','session_policy_allowed','atMs',at_ms,'actorId',p_actor,
    'offeringId',p_offering->'id','contentDigest',p_offering->'contentDigest','policyId',p_policy);
  expected_audit:=jsonb_build_object('review',jsonb_build_object('kind','quiz_submit','atMs',at_ms,'quizId',a#>'{review,quizId}',
    'moduleId',a#>'{review,moduleId}','correct',a#>'{review,correct}','total',a#>'{review,total}','passed',true),
    'policy',policy_audit,'observation',jsonb_build_object('windowBefore',w,'firstAcknowledgment',first_ack,
      'signal','authenticated_material_receipt_not_identity_proof','closedWindow',w||jsonb_build_object('lastObservedAtMs',at_ms),
      'code',case when first_ack then 'study_material_acknowledged' else 'study_receipt_continuous' end));
  if first_ack then expected_audit:=jsonb_set(expected_audit,'{observation}',(expected_audit->'observation')||jsonb_build_object('initialExposure',
    jsonb_build_object('method','initial_material_gap_restriction_only_v1','windowId',w->'id','debitStartMs',w->'issuedAtMs',
      'debitEndMs',at_ms,'observedStudyAddedMs',0,'creditAddedMs',0)));
  elsif at_ms>start_ms then expected_audit:=jsonb_set(expected_audit,'{policy}',policy_audit||jsonb_build_object('observation',
    policy_audit||jsonb_build_object('kind','observe_study','code','study_interval_recorded'))); end if;
  if a is distinct from expected_audit or o->'observationCode' is distinct from expected_audit#>'{observation,code}'
    or not coalesce(a#>>'{review,quizId}' ~* '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false) then
    raise exception 'nmls_second_final_terminal_history_changed'; end if;
end $$;

create function public.nmls_second_final_reservation_outcome(p_first uuid,p_second uuid,p_reserved boolean,p_source bigint,
  p_workflow bigint,p_runtime jsonb,p_actor bigint,p_teaching jsonb)
returns jsonb language sql immutable set search_path=pg_catalog,public as $$
  select jsonb_build_object('ok',p_reserved,'code',case when p_reserved then 'private_second_final_reserved' else 'private_second_final_reservation_refused' end,
    'status',case when p_reserved then 200 else 409 end,'reserved',p_reserved,'firstFinalId',p_first,'secondFinalId',p_second,
    'finalRevision',2,'sourceRevision',p_source,'workflowRevision',p_workflow,'runtimeRevision',p_runtime->'revision',
    'actorRevision',p_actor,'sessionId',p_runtime->'sessionId','teachingCode',p_teaching->'code','policyCode',p_teaching->'policyCode',
    'observationCode',p_teaching->'observationCode','mode','private_authoring_review','deliveryAllowed',false,
    'studentDeliveryEnabled',false,'creditIssuanceAllowed',false,'retakeEnabled',false);
$$;

create function public.nmls_second_final_reservation_commit(p_student_id uuid,p_attempt_id uuid,p_first_final_id uuid,p_event_id uuid,
  p_command_digest text,p_expected_source_revision bigint,p_expected_final_revision bigint,p_expected_workflow_revision bigint,
  p_expected_runtime_revision bigint,p_expected_actor_revision bigint,p_expected_session_id uuid,p_evaluated_at_ms bigint,
  p_definition_digest text,p_definition jsonb,p_intent jsonb,p_second_id uuid,p_selection jsonb,p_transition jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants; b public.nmls_review_policy_bindings; a public.nmls_review_attempts;
  lease public.nmls_review_study_leases; l public.nmls_review_actor_policy; f public.nmls_private_finals;
  d public.nmls_first_final_deliveries; w public.nmls_private_remediations; h public.nmls_first_final_handoff_events;
  pin public.nmls_teaching_phase_bindings; source_pin public.nmls_teaching_phase_bindings;
  terminal public.nmls_teaching_events; last_event public.nmls_teaching_events; e public.nmls_teaching_events;
  r public.nmls_second_final_reservation_events; origin_intent jsonb; checked jsonb; command jsonb; command_hash text;
  phase jsonb; expected_layout jsonb; next_runtime jsonb; next_ledger jsonb; teaching jsonb; audit jsonb; expected_audit jsonb;
  expected_lease jsonb; last_module jsonb; outcome jsonb; selection_hash text; reserved boolean; outside_window boolean;
  keys text[]; field text; at_ms bigint; opening_ms bigint; cutoff_ms bigint; deadline_ms bigint; workflow_next bigint;
begin
  if p_student_id is null or p_attempt_id is null or p_first_final_id is null or p_event_id is null or p_expected_session_id is null
    or not coalesce(p_command_digest ~ '^[a-f0-9]{64}$',false) or not coalesce(p_definition_digest ~ '^[a-f0-9]{64}$',false) then
    raise exception 'nmls_second_final_invalid_command'; end if;
  keys:=array['kind','attemptId','firstFinalId','eventId','expectedSourceRevision','expectedFinalRevision','expectedWorkflowRevision',
    'expectedRevision','expectedActorRevision','sessionId'];
  if jsonb_typeof(p_intent) is distinct from 'object' or not(p_intent ?& keys) or p_intent-keys<>'{}'::jsonb
    or p_intent->>'kind' is distinct from 'reserve_second_final' or p_intent->>'attemptId' is distinct from p_attempt_id::text
    or p_intent->>'firstFinalId' is distinct from p_first_final_id::text or p_intent->>'eventId' is distinct from p_event_id::text
    or p_intent->'expectedSourceRevision' is distinct from to_jsonb(p_expected_source_revision)
    or p_intent->'expectedFinalRevision' is distinct from '2'::jsonb or p_expected_final_revision is distinct from 2
    or p_intent->'expectedWorkflowRevision' is distinct from to_jsonb(p_expected_workflow_revision)
    or p_intent->'expectedRevision' is distinct from to_jsonb(p_expected_runtime_revision)
    or p_intent->'expectedActorRevision' is distinct from to_jsonb(p_expected_actor_revision)
    or p_intent->>'sessionId' is distinct from p_expected_session_id::text
    or public.nmls_first_final_submission_hash(p_intent) is distinct from p_command_digest then raise exception 'nmls_second_final_invalid_intent'; end if;
  foreach field in array array['expectedSourceRevision','expectedWorkflowRevision','expectedRevision','expectedActorRevision'] loop
    if not public.nmls_final_guard_integer(p_intent->field,9007199254740991,false) or (p_intent->>field)::bigint<1 then
      raise exception 'nmls_second_final_invalid_intent'; end if;
  end loop;
  command:=jsonb_build_object('kind','check_access','attemptId',p_attempt_id,'eventId',p_event_id,'phaseKind','remediation','phaseOwnerId',p_first_final_id,
    'expectedSourceRevision',p_expected_source_revision,'expectedWorkflowRevision',p_expected_workflow_revision,
    'expectedRevision',p_expected_runtime_revision,'expectedActorRevision',p_expected_actor_revision,'sessionId',p_expected_session_id);
  command_hash:=public.nmls_first_final_submission_hash(command);
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a0 on a0.grant_id=g0.id
    where a0.id=p_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status is distinct from 'active' or g.expires_at<=clock_timestamp() then
    raise exception 'nmls_second_final_access_denied'; end if;
  select * into lease from public.nmls_review_study_leases where student_id=p_student_id for update;
  select * into l from public.nmls_review_actor_policy where student_id=p_student_id for update;
  select * into a from public.nmls_review_attempts where id=p_attempt_id for update;
  select * into f from public.nmls_private_finals where id=p_first_final_id for update;
  select * into d from public.nmls_first_final_deliveries where final_id=p_first_final_id for update;
  select * into w from public.nmls_private_remediations where first_final_id=p_first_final_id for update;
  select * into b from public.nmls_review_policy_bindings where grant_id=g.id;
  select * into h from public.nmls_first_final_handoff_events where student_id=p_student_id and final_id=p_first_final_id;
  if h.event_id is null or h.review_attempt_id is distinct from a.id or f.student_id is distinct from p_student_id
    or f.review_attempt_id is distinct from a.id or f.revision is distinct from 2 or f.definition_digest is distinct from p_definition_digest then
    raise exception 'nmls_second_final_handoff_required'; end if;
  origin_intent:=jsonb_build_object('kind','start_first_remediation','attemptId',a.id,'finalAttemptId',f.id,'eventId',h.event_id,
    'expectedSourceRevision',h.source_revision,'expectedFinalRevision',2,'expectedDeliveryRevision',h.delivery_revision,
    'expectedWorkflowRevision',1,'expectedRevision',0,'expectedActorRevision',h.actor_revision-1,'sessionId',h.lease_before->'session_id');
  checked:=public.nmls_first_final_handoff_commit(p_student_id,a.id,f.id,h.event_id,h.command_digest,h.source_revision,2,h.delivery_revision,
    1,0,h.actor_revision-1,(h.lease_before->>'session_id')::uuid,p_evaluated_at_ms,p_definition_digest,origin_intent,'{}'::jsonb);
  if checked is distinct from jsonb_build_object('duplicate',true,'outcome',h.outcome) then raise exception 'nmls_second_final_handoff_required'; end if;
  select * into source_pin from public.nmls_teaching_phase_bindings where student_id=p_student_id and review_attempt_id=a.id and phase_kind='source' and phase_owner_id=a.id;
  select * into pin from public.nmls_teaching_phase_bindings where student_id=p_student_id and review_attempt_id=a.id and phase_kind='remediation' and phase_owner_id=f.id;
  phase:=h.phase_scope;
  select jsonb_agg(value order by n) into expected_layout from jsonb_array_elements(source_pin.layout) with ordinality x(value,n)
    where w.manifest->'moduleIds' ? (value->>'id');
  if pin.student_id is null or pin.phase_scope is distinct from phase or pin.layout is distinct from expected_layout
    or pin.teaching_digest is distinct from w.manifest->>'contentDigest' then raise exception 'nmls_second_final_content_changed'; end if;
  perform public.nmls_second_final_definition_guard(p_definition,p_definition_digest,to_jsonb(a),source_pin.layout);
  perform public.nmls_second_final_selection_guard(f.selection,f.id,a.id,p_definition,1,'[]'::jsonb);
  perform public.nmls_second_final_complete_guard(w.runtime,pin.layout,phase->>'teachingCourseKey',pin.teaching_digest);
  select t.* into terminal from public.nmls_teaching_events t where t.student_id=p_student_id and t.review_attempt_id=a.id
    and t.phase_kind='remediation' and t.phase_owner_id=f.id and t.audit#>>'{review,kind}'='quiz_submit'
    and t.audit#>'{review,passed}'='true'::jsonb and t.outcome#>>'{progress,status}'='review_complete' order by t.workflow_revision desc limit 1;
  select * into last_event from public.nmls_teaching_events where student_id=p_student_id and review_attempt_id=a.id
    and phase_kind='remediation' and phase_owner_id=f.id order by workflow_revision desc limit 1;
  last_module:=pin.layout->(jsonb_array_length(pin.layout)-1);
  if terminal.event_id is null or terminal.workflow_revision<=h.workflow_revision or terminal.runtime_revision<=h.runtime_revision
    or terminal.workflow_revision is distinct from terminal.runtime_revision+1
    or terminal.outcome->'ok' is distinct from 'true'::jsonb or terminal.outcome->>'code' is distinct from 'module_review_passed'
    or terminal.outcome->'teachingPhaseComplete' is distinct from 'true'::jsonb
    or terminal.audit#>'{review,moduleId}' is distinct from last_module->'id'
    or terminal.audit#>'{review,total}' is distinct from last_module->'questionsPerAttempt'
    or not public.nmls_final_guard_integer(terminal.audit#>'{review,correct}',(last_module->>'questionsPerAttempt')::bigint,false)
    or (terminal.audit#>>'{review,correct}')::bigint*100<(last_module->>'passPercent')::bigint*(last_module->>'questionsPerAttempt')::bigint
    or terminal.outcome#>'{progress,completedUnitIds}' is distinct from w.runtime->'completedUnitIds'
    or terminal.outcome#>'{progress,passedModuleIds}' is distinct from w.runtime->'passedModuleIds'
    or terminal.outcome#>'{progress,completedReviewMs}' is distinct from w.runtime->'completedReviewMs'
    or terminal.outcome#>>'{progress,contentDigest}' is distinct from pin.teaching_digest
    or terminal.outcome#>>'{progress,courseKey}' is distinct from phase->>'teachingCourseKey'
    or terminal.outcome#>'{progress,sessionId}' is distinct from w.runtime->'sessionId'
    or last_event.runtime_revision is distinct from (w.runtime->>'revision')::bigint
    or last_event.outcome#>'{progress,revision}' is distinct from w.runtime->'revision'
    or last_event.outcome#>'{progress,status}' is distinct from w.runtime->'status'
    or last_event.outcome#>'{progress,sessionId}' is distinct from w.runtime->'sessionId'
    or last_event.outcome#>'{progress,completedUnitIds}' is distinct from w.runtime->'completedUnitIds'
    or last_event.outcome#>'{progress,passedModuleIds}' is distinct from w.runtime->'passedModuleIds'
    or last_event.outcome#>'{progress,completedReviewMs}' is distinct from w.runtime->'completedReviewMs'
    or last_event.audit#>'{review,atMs}' is distinct from w.runtime->'lastReceiptMs'
    or terminal.actor_revision>last_event.actor_revision or last_event.actor_revision>l.revision
    or (select count(*) from public.nmls_teaching_events x where x.student_id=p_student_id and x.review_attempt_id=a.id
      and x.phase_kind='remediation' and x.phase_owner_id=f.id and x.workflow_revision between h.workflow_revision and last_event.workflow_revision)
      is distinct from last_event.workflow_revision-h.workflow_revision+1
    or (select count(distinct x.workflow_revision) from public.nmls_teaching_events x where x.student_id=p_student_id and x.review_attempt_id=a.id
      and x.phase_kind='remediation' and x.phase_owner_id=f.id and x.workflow_revision between h.workflow_revision and last_event.workflow_revision)
      is distinct from last_event.workflow_revision-h.workflow_revision+1
    or exists(select 1 from public.nmls_teaching_events x where x.student_id=p_student_id and x.review_attempt_id=a.id
      and x.phase_kind='remediation' and x.phase_owner_id=f.id and x.workflow_revision between h.workflow_revision and last_event.workflow_revision
      and x.workflow_revision is distinct from x.runtime_revision+1) then raise exception 'nmls_second_final_completion_history_required'; end if;
  perform public.nmls_second_final_terminal_guard(to_jsonb(terminal),w.runtime,phase,b.offering,b.policy_id,p_student_id,a.id,
    (h.runtime->>'lastReceiptMs')::bigint);
  select * into r from public.nmls_second_final_reservation_events where student_id=p_student_id and event_id=p_event_id;
  select * into e from public.nmls_teaching_events where student_id=p_student_id and event_id=p_event_id;
  if r.event_id is not null or e.event_id is not null then
    if r.event_id is null or e.event_id is null or r.first_final_id is distinct from f.id or r.review_attempt_id is distinct from a.id
      or r.handoff_event_id is distinct from h.event_id or r.terminal_event_id is distinct from terminal.event_id
      or r.command_digest is distinct from p_command_digest or r.teaching_command_digest is distinct from command_hash
      or r.definition_digest is distinct from p_definition_digest or r.teaching_digest is distinct from pin.teaching_digest
      or r.source_revision is distinct from p_expected_source_revision
      or r.phase_scope is distinct from phase
      or r.workflow_before_revision is distinct from p_expected_workflow_revision or r.runtime_before_revision is distinct from p_expected_runtime_revision
      or r.actor_before_revision is distinct from p_expected_actor_revision or r.session_id is distinct from p_expected_session_id
      or e.command_digest is distinct from command_hash or e.review_attempt_id is distinct from a.id or e.phase_kind is distinct from 'remediation'
      or e.phase_owner_id is distinct from f.id or e.source_revision is distinct from r.source_revision
      or e.workflow_revision is distinct from r.teaching_workflow_revision or e.runtime_revision is distinct from r.runtime_revision
      or e.actor_revision is distinct from r.actor_revision or e.transaction_id is distinct from r.transaction_id
      or e.lease_before is distinct from r.lease_before or e.lease_after is distinct from r.lease_after or r.lease_before is distinct from r.lease_after
      or a.revision<r.source_revision or l.revision<r.actor_revision or w.revision<r.workflow_revision
      or (w.runtime->>'revision')::bigint<r.runtime_revision
      or w.runtime->'revision'=r.runtime->'revision' and w.runtime is distinct from r.runtime
      or r.runtime-array['revision','lastReceiptMs','feedback'] is distinct from r.runtime_before-array['revision','lastReceiptMs','feedback']
      or r.runtime->'revision' is distinct from to_jsonb(r.runtime_revision)
      or r.runtime_before->'revision' is distinct from to_jsonb(r.runtime_before_revision)
      or r.runtime->>'sessionId' is distinct from p_expected_session_id::text
      or r.lease_before is distinct from jsonb_build_object('student_id',p_student_id,'attempt_id',a.id,'phase_kind','remediation',
        'phase_owner_id',f.id,'phase_active',false,'session_id',p_expected_session_id)
      or e.outcome->'actorRevision' is distinct from to_jsonb(r.actor_revision)
      or e.outcome->'deliveryAllowed' is distinct from 'false'::jsonb or e.outcome->'deliveryUntilMs' is distinct from 'null'::jsonb
      or e.outcome->'studyWindow' is distinct from 'null'::jsonb or e.outcome->'studyRecovery' is distinct from 'null'::jsonb
      or e.outcome#>'{progress,lessons}' is distinct from '[]'::jsonb or e.outcome#>'{progress,quiz}' is distinct from 'null'::jsonb
      or e.outcome#>'{progress,feedback}' is distinct from 'null'::jsonb
      or e.outcome#>'{progress,revision}' is distinct from r.runtime->'revision' or e.outcome#>'{progress,sessionId}' is distinct from r.runtime->'sessionId'
      or e.audit#>>'{review,kind}' is distinct from 'check_access' or e.audit#>>'{policy,kind}' is distinct from 'check_access'
      or e.audit#>'{review,atMs}' is distinct from r.runtime->'lastReceiptMs'
      or e.audit#>'{policy,atMs}' is distinct from r.runtime->'lastReceiptMs'
      or e.audit#>>'{policy,actorId}' is distinct from p_student_id::text or e.audit#>>'{policy,offeringId}' is distinct from g.id::text
      or e.audit#>>'{policy,contentDigest}' is distinct from a.content_digest or e.audit#>>'{policy,policyId}' is distinct from b.policy_id then
      raise exception 'nmls_second_final_idempotency_conflict'; end if;
    perform public.nmls_second_final_complete_guard(r.runtime,pin.layout,phase->>'teachingCourseKey',pin.teaching_digest);
    perform public.nmls_second_final_complete_guard(r.runtime_before,pin.layout,phase->>'teachingCourseKey',pin.teaching_digest);
    at_ms:=(r.runtime->>'lastReceiptMs')::bigint;
    outside_window:=at_ms<(b.offering->>'opensAtMs')::bigint or at_ms>=(b.offering->>'closesAtMs')::bigint;
    expected_audit:=jsonb_build_object('review',jsonb_build_object('kind','check_access','atMs',at_ms),
      'policy',jsonb_build_object('kind','check_access','code',e.outcome->'policyCode','atMs',at_ms,'actorId',p_student_id,
        'offeringId',g.id,'contentDigest',a.content_digest,'policyId',b.policy_id),
      'observation',case when outside_window then jsonb_build_object('reason','outside_window_preserved')
        else jsonb_build_object('reason','no_prior_material','code','study_observation_ready') end);
    if not r.reserved then expected_audit:=jsonb_set(expected_audit,'{review}',(expected_audit->'review')||jsonb_build_object(
      'reason','policy_delivery_stopped','invalidatedMs',0,'invalidatedUnitId',null,'abandonedQuizId',null)); end if;
    if (r.runtime_before->>'lastReceiptMs')::bigint<(terminal.audit#>>'{review,atMs}')::bigint
      or (r.runtime_before->>'lastReceiptMs')::bigint>at_ms
      or abs(at_ms-floor(extract(epoch from r.recorded_at)*1000)::bigint)>1000
      or abs(at_ms-floor(extract(epoch from e.recorded_at)*1000)::bigint)>1000
      or r.runtime->'feedback' is distinct from (case when r.reserved then r.runtime_before->'feedback' else 'null'::jsonb end)
      or r.runtime-array['revision','lastReceiptMs','feedback'] is distinct from w.runtime-array['revision','lastReceiptMs','feedback']
      or e.audit is distinct from expected_audit
      or e.outcome->'status' is distinct from (case when r.reserved then '200'::jsonb else '409'::jsonb end)
      or e.outcome->>'code' is distinct from (case when r.reserved then 'review_policy_checked' else e.outcome->>'policyCode' end)
      or e.outcome->'observationReady' is distinct from to_jsonb(not outside_window)
      or e.outcome->>'observationCode' is distinct from (case when outside_window then 'outside_window_no_settlement' else 'study_observation_ready' end)
      or e.outcome->'teachingPhaseComplete' is distinct from 'true'::jsonb
      or e.outcome#>'{progress,status}' is distinct from r.runtime->'status'
      or e.outcome#>'{progress,courseKey}' is distinct from r.runtime->'courseKey'
      or e.outcome#>'{progress,contentDigest}' is distinct from r.runtime->'contentDigest'
      or e.outcome#>>'{progress,mode}' is distinct from 'non_credit_review'
      or e.outcome#>'{progress,creditIssuanceAllowed}' is distinct from 'false'::jsonb
      or e.outcome#>'{progress,completedReviewMs}' is distinct from r.runtime->'completedReviewMs'
      or e.outcome#>'{progress,completedUnitIds}' is distinct from r.runtime->'completedUnitIds'
      or e.outcome#>'{progress,passedModuleIds}' is distinct from r.runtime->'passedModuleIds'
      or e.outcome#>'{progress,provisionalReviewMs}' is distinct from '0'::jsonb
      or e.outcome#>'{progress,currentUnitId}' is distinct from 'null'::jsonb
      or e.outcome#>'{progress,currentUnitActionComplete}' is distinct from 'false'::jsonb
      or e.outcome#>'{progress,resumeRequired}' is distinct from 'false'::jsonb then raise exception 'nmls_second_final_idempotency_conflict'; end if;
    if r.reserved then
      if w.second_id is distinct from r.second_id or w.status='remediating' or w.second_issued_at is null
        or public.nmls_first_final_submission_hash(w.second_selection) is distinct from r.selection_digest
        or e.outcome->>'policyCode' is distinct from 'session_policy_allowed' or e.outcome->'ok' is distinct from 'true'::jsonb then
        raise exception 'nmls_second_final_idempotency_conflict'; end if;
      perform public.nmls_second_final_selection_guard(w.second_selection,w.second_id,a.id,p_definition,2,f.selection->'questionIds');
    elsif e.outcome->'ok' is distinct from 'false'::jsonb or e.outcome->>'policyCode'='session_policy_allowed' then
      raise exception 'nmls_second_final_idempotency_conflict'; end if;
    outcome:=public.nmls_second_final_reservation_outcome(f.id,r.second_id,r.reserved,r.source_revision,r.workflow_revision,r.runtime,r.actor_revision,e.outcome);
    if r.outcome is distinct from outcome then raise exception 'nmls_second_final_idempotency_conflict'; end if;
    return jsonb_build_object('duplicate',true,'outcome',r.outcome);
  end if;
  if w.status is distinct from 'remediating' or w.second_id is not null or exists(select 1 from public.nmls_second_final_reservation_events x
    where x.first_final_id=f.id and x.reserved) then raise exception 'nmls_second_final_already_reserved'; end if;
  if exists(select 1 from public.nmls_review_attempt_events x join public.nmls_review_attempts y on y.id=x.attempt_id where y.student_id=p_student_id and x.event_id=p_event_id)
    or exists(select 1 from public.nmls_review_actor_policy_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_private_final_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_private_remediation_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_final_reservation_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_first_final_delivery_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_first_final_submission_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_first_final_handoff_events where student_id=p_student_id and event_id=p_event_id) then
    raise exception 'nmls_review_idempotency_conflict'; end if;
  if a.revision is distinct from p_expected_source_revision or w.revision is distinct from p_expected_workflow_revision
    or w.runtime->'revision' is distinct from to_jsonb(p_expected_runtime_revision) or l.revision is distinct from p_expected_actor_revision
    or last_event.workflow_revision is distinct from w.revision then raise exception 'nmls_review_revision_conflict'; end if;
  expected_lease:=jsonb_build_object('student_id',p_student_id,'attempt_id',a.id,'phase_kind','remediation','phase_owner_id',f.id,
    'phase_active',false,'session_id',p_expected_session_id);
  if to_jsonb(lease) is distinct from expected_lease or w.runtime->>'sessionId' is distinct from p_expected_session_id::text then
    raise exception 'nmls_review_session_conflict'; end if;
  if jsonb_typeof(p_transition) is distinct from 'object' or not(p_transition ?& array['phase','command','teachingDigest','layout','runtime','ledger','outcome','audit'])
    or p_transition-array['phase','command','teachingDigest','layout','runtime','ledger','outcome','audit']<>'{}'::jsonb
    or p_transition->'phase' is distinct from phase or p_transition->'command' is distinct from command
    or p_transition->>'teachingDigest' is distinct from pin.teaching_digest or p_transition->'layout' is distinct from pin.layout then
    raise exception 'nmls_second_final_invalid_transition'; end if;
  next_runtime:=p_transition->'runtime'; next_ledger:=p_transition->'ledger'; teaching:=p_transition->'outcome'; audit:=p_transition->'audit';
  if jsonb_typeof(teaching) is distinct from 'object' or jsonb_typeof(teaching->'progress') is distinct from 'object'
    or teaching-array['ok','code','status','progress','actorRevision','policyCode','observationReady','deliveryAllowed',
      'deliveryUntilMs','resumeNotBeforeMs','teachingPhaseComplete','observationCode','studyWindow','studyRecovery']<>'{}'::jsonb
    or (teaching->'progress')-array['mode','creditIssuanceAllowed','courseKey','title','contentDigest','revision','status',
      'sessionId','completedUnitIds','passedModuleIds','completedReviewMs','provisionalReviewMs','currentUnitId','resumeRequired',
      'currentUnitActionComplete','modules','lessons','quiz','feedback','notice']<>'{}'::jsonb then raise exception 'nmls_second_final_invalid_transition'; end if;
  perform public.nmls_second_final_complete_guard(next_runtime,pin.layout,phase->>'teachingCourseKey',pin.teaching_digest);
  if next_runtime-array['revision','lastReceiptMs','feedback'] is distinct from w.runtime-array['revision','lastReceiptMs','feedback']
    or next_runtime->'revision' is distinct from to_jsonb(p_expected_runtime_revision+1)
    or next_runtime->'lastReceiptMs' is distinct from to_jsonb(p_evaluated_at_ms)
    or next_ledger-array['revision','lastReceiptMs','studyIntervals','uncertainExposure','observationJournal']
      is distinct from l.ledger-array['revision','lastReceiptMs','studyIntervals','uncertainExposure','observationJournal']
    or l.ledger#>'{observationJournal,active}' is distinct from 'null'::jsonb or l.ledger#>'{observationJournal,unresolved}' is distinct from 'null'::jsonb
    or next_ledger#>'{observationJournal,active}' is distinct from 'null'::jsonb or next_ledger#>'{observationJournal,unresolved}' is distinct from 'null'::jsonb
    or teaching->'deliveryAllowed' is distinct from 'false'::jsonb or teaching->'deliveryUntilMs' is distinct from 'null'::jsonb
    or teaching->'studyWindow' is distinct from 'null'::jsonb or teaching->'studyRecovery' is distinct from 'null'::jsonb
    or teaching->'teachingPhaseComplete' is distinct from 'true'::jsonb
    or teaching#>'{progress,revision}' is distinct from next_runtime->'revision'
    or teaching#>'{progress,status}' is distinct from next_runtime->'status'
    or teaching#>'{progress,sessionId}' is distinct from next_runtime->'sessionId'
    or teaching#>'{progress,courseKey}' is distinct from next_runtime->'courseKey'
    or teaching#>'{progress,contentDigest}' is distinct from next_runtime->'contentDigest'
    or teaching#>'{progress,completedUnitIds}' is distinct from next_runtime->'completedUnitIds'
    or teaching#>'{progress,passedModuleIds}' is distinct from next_runtime->'passedModuleIds'
    or teaching#>'{progress,completedReviewMs}' is distinct from next_runtime->'completedReviewMs'
    or teaching#>'{progress,provisionalReviewMs}' is distinct from '0'::jsonb or teaching#>'{progress,currentUnitId}' is distinct from 'null'::jsonb
    or teaching#>'{progress,currentUnitActionComplete}' is distinct from 'false'::jsonb or teaching#>'{progress,resumeRequired}' is distinct from 'false'::jsonb
    or teaching#>'{progress,lessons}' is distinct from '[]'::jsonb or teaching#>'{progress,quiz}' is distinct from 'null'::jsonb
    or teaching#>'{progress,feedback}' is distinct from 'null'::jsonb then raise exception 'nmls_second_final_invalid_transition'; end if;
  at_ms:=floor(extract(epoch from clock_timestamp())*1000); opening_ms:=(b.offering->>'opensAtMs')::bigint; cutoff_ms:=(b.offering->>'closesAtMs')::bigint;
  if p_evaluated_at_ms is null or p_evaluated_at_ms<greatest((l.ledger->>'lastReceiptMs')::bigint,(w.runtime->>'lastReceiptMs')::bigint,
      floor(extract(epoch from last_event.recorded_at)*1000)::bigint)
    or p_evaluated_at_ms>at_ms+1000 or at_ms-p_evaluated_at_ms>1000
    or (at_ms<opening_ms) is distinct from (p_evaluated_at_ms<opening_ms) or (at_ms>=cutoff_ms) is distinct from (p_evaluated_at_ms>=cutoff_ms) then
    raise exception 'nmls_review_clock_refresh_required'; end if;
  outside_window:=p_evaluated_at_ms<opening_ms or p_evaluated_at_ms>=cutoff_ms;
  reserved:=teaching->>'policyCode'='session_policy_allowed';
  expected_audit:=jsonb_build_object('review',jsonb_build_object('kind','check_access','atMs',p_evaluated_at_ms),
    'policy',jsonb_build_object('kind','check_access','code',teaching->'policyCode','atMs',p_evaluated_at_ms,'actorId',p_student_id,
      'offeringId',g.id,'contentDigest',a.content_digest,'policyId',b.policy_id),
    'observation',case when outside_window then jsonb_build_object('reason','outside_window_preserved')
      else jsonb_build_object('reason','no_prior_material','code','study_observation_ready') end);
  if not coalesce(reserved,false) then expected_audit:=jsonb_set(expected_audit,'{review}',(expected_audit->'review')||jsonb_build_object(
    'reason','policy_delivery_stopped','invalidatedMs',0,'invalidatedUnitId',null,'abandonedQuizId',null)); end if;
  if audit is distinct from expected_audit or teaching->'observationReady' is distinct from to_jsonb(not outside_window)
    or teaching->>'observationCode' is distinct from (case when outside_window then 'outside_window_no_settlement' else 'study_observation_ready' end) then
    raise exception 'nmls_second_final_invalid_audit'; end if;
  if reserved then
    if teaching->'ok' is distinct from 'true'::jsonb or teaching->'status' is distinct from '200'::jsonb
      or teaching->>'code' is distinct from 'review_policy_checked' or next_runtime->'feedback' is distinct from w.runtime->'feedback'
      or b.offering#>'{rocs,fullDocumentVerified}' is distinct from 'true'::jsonb
      or p_second_id is null or p_second_id=f.id or p_second_id=a.id then raise exception 'nmls_second_final_invalid_selection'; end if;
    deadline_ms:=public.nmls_second_final_budget_guard(next_ledger,b.offering,p_evaluated_at_ms);
    perform public.nmls_second_final_selection_guard(p_selection,p_second_id,a.id,p_definition,2,f.selection->'questionIds');
    selection_hash:=public.nmls_first_final_submission_hash(p_selection);
  else
    if reserved is null or teaching->'ok' is distinct from 'false'::jsonb or teaching->'status' is distinct from '409'::jsonb
      or teaching->'code' is distinct from teaching->'policyCode'
      or not coalesce(teaching->>'policyCode' in ('delivery_not_open','delivery_window_closed','rocs_document_unverified','rocs_required',
        'break_in_progress','session_required','session_wall_limit','mandatory_break_required','rolling_study_limit'),false)
      or next_runtime->'feedback' is distinct from 'null'::jsonb or p_second_id is not null or p_selection is not null then
      raise exception 'nmls_second_final_invalid_denial'; end if;
  end if;
  checked:=public.nmls_teaching_pre_second_reservation_internal(p_student_id,a.id,p_event_id,command_hash,phase,pin.teaching_digest,pin.layout,
    a.revision,w.revision,p_expected_runtime_revision,p_expected_actor_revision,p_expected_session_id,p_evaluated_at_ms,
    l.ledger,next_ledger,next_runtime,teaching,audit,null);
  if checked is distinct from jsonb_build_object('duplicate',false,'outcome',teaching,'sourceRevision',a.revision,'workflowRevision',w.revision+1) then
    raise exception 'nmls_second_final_idempotency_conflict'; end if;
  select * into e from public.nmls_teaching_events where student_id=p_student_id and event_id=p_event_id;
  if e.transaction_id is distinct from txid_current() or e.command_digest is distinct from command_hash
    or e.lease_before is distinct from expected_lease or e.lease_after is distinct from expected_lease
    or e.workflow_revision is distinct from w.revision+1 or e.actor_revision is distinct from l.revision+1 then
    raise exception 'nmls_second_final_idempotency_conflict'; end if;
  workflow_next:=w.revision+1;
  if reserved then
    update public.nmls_private_remediations set revision=revision+1,status='second_issued',second_id=p_second_id,
      second_selection=p_selection,second_issued_at=clock_timestamp() where first_final_id=f.id;
    workflow_next:=workflow_next+1;
  end if;
  outcome:=public.nmls_second_final_reservation_outcome(f.id,p_second_id,reserved,a.revision,workflow_next,next_runtime,l.revision+1,teaching);
  insert into public.nmls_second_final_reservation_events(student_id,event_id,first_final_id,review_attempt_id,handoff_event_id,terminal_event_id,
    command_digest,teaching_command_digest,definition_digest,teaching_digest,phase_scope,source_revision,final_revision,workflow_before_revision,runtime_before_revision,
    actor_before_revision,teaching_workflow_revision,workflow_revision,runtime_revision,actor_revision,session_id,lease_before,lease_after,
    runtime_before,runtime,reserved,second_id,selection_digest,outcome)
    values(p_student_id,p_event_id,f.id,a.id,h.event_id,terminal.event_id,p_command_digest,command_hash,p_definition_digest,pin.teaching_digest,phase,a.revision,2,
      w.revision,p_expected_runtime_revision,l.revision,w.revision+1,workflow_next,p_expected_runtime_revision+1,l.revision+1,p_expected_session_id,
      expected_lease,expected_lease,w.runtime,next_runtime,reserved,p_second_id,selection_hash,outcome);
  at_ms:=floor(extract(epoch from clock_timestamp())*1000);
  if g.expires_at<=clock_timestamp() then raise exception 'nmls_second_final_access_denied'; end if;
  if p_evaluated_at_ms>at_ms+1000 or at_ms-p_evaluated_at_ms>1000
    or (at_ms<opening_ms) is distinct from (p_evaluated_at_ms<opening_ms) or (at_ms>=cutoff_ms) is distinct from (p_evaluated_at_ms>=cutoff_ms)
    or reserved and at_ms>=deadline_ms then raise exception 'nmls_review_clock_refresh_required'; end if;
  if reserved then perform public.nmls_second_final_budget_guard(next_ledger,b.offering,at_ms); end if;
  return jsonb_build_object('duplicate',false,'outcome',outcome);
end $$;

revoke all on function public.nmls_teaching_pre_second_reservation_internal(uuid,uuid,uuid,text,jsonb,text,jsonb,bigint,bigint,bigint,bigint,uuid,bigint,jsonb,jsonb,jsonb,jsonb,jsonb,bigint),
  public.nmls_teaching_commit(uuid,uuid,uuid,text,jsonb,text,jsonb,bigint,bigint,bigint,bigint,uuid,bigint,jsonb,jsonb,jsonb,jsonb,jsonb,bigint),
  public.nmls_second_final_reservation_context(uuid,uuid,uuid,uuid),
  public.nmls_second_final_definition_guard(jsonb,text,jsonb,jsonb),public.nmls_second_final_selection_guard(jsonb,uuid,uuid,jsonb,bigint,jsonb),
  public.nmls_second_final_complete_guard(jsonb,jsonb,text,text),public.nmls_second_final_budget_guard(jsonb,jsonb,bigint),
  public.nmls_second_final_terminal_guard(jsonb,jsonb,jsonb,jsonb,text,uuid,uuid,bigint),
  public.nmls_second_final_reservation_outcome(uuid,uuid,boolean,bigint,bigint,jsonb,bigint,jsonb),
  public.nmls_second_final_reservation_commit(uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb,jsonb,uuid,jsonb,jsonb)
  from public,anon,authenticated,service_role;
grant execute on function public.nmls_teaching_commit(uuid,uuid,uuid,text,jsonb,text,jsonb,bigint,bigint,bigint,bigint,uuid,bigint,jsonb,jsonb,jsonb,jsonb,jsonb,bigint),
  public.nmls_second_final_reservation_context(uuid,uuid,uuid,uuid),
  public.nmls_second_final_reservation_commit(uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb,jsonb,uuid,jsonb,jsonb) to service_role;
commit;
