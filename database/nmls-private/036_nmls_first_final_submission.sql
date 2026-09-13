-- LOCAL PRIVATE AUTHORING ONLY. One joint first submission, never a learner
-- release, attendance claim, CE credit, second form or remediation handoff.
-- Preserve026/028/035 bytes.036 is the authoritative submission/child-genesis
-- receipt, paired with the actual035 content-clearing policy transaction.
begin;

create table public.nmls_first_final_submission_events (
  student_id uuid not null references public.students(id),
  event_id uuid not null,
  final_id uuid not null references public.nmls_private_finals(id),
  review_attempt_id uuid not null references public.nmls_review_attempts(id),
  command_digest text not null check (command_digest ~ '^[a-f0-9]{64}$'),
  delivery_command_digest text not null check (delivery_command_digest ~ '^[a-f0-9]{64}$'),
  definition_digest text not null check (definition_digest ~ '^[a-f0-9]{64}$'),
  source_revision bigint not null check (source_revision>0),
  final_revision bigint not null check (final_revision in (1,2)),
  delivery_revision bigint not null check (delivery_revision>0),
  actor_revision bigint not null check (actor_revision>0),
  workflow_revision bigint check (workflow_revision=1),
  submitted boolean not null,
  submission_payload_digest text not null check (submission_payload_digest ~ '^[a-f0-9]{64}$'),
  outcome jsonb not null check (jsonb_typeof(outcome)='object'
    and outcome->'submitted' is not distinct from to_jsonb(submitted)
    and outcome->'finalRevision' is not distinct from to_jsonb(final_revision)
    and outcome->'deliveryAllowed' is not distinct from 'false'::jsonb
    and outcome->'studentDeliveryEnabled' is not distinct from 'false'::jsonb
    and outcome->'creditIssuanceAllowed' is not distinct from 'false'::jsonb
    and outcome->'retakeEnabled' is not distinct from 'false'::jsonb),
  transaction_id bigint not null default txid_current(),
  recorded_at timestamptz not null default clock_timestamp(),
  primary key(student_id,event_id),
  foreign key(student_id,event_id) references public.nmls_first_final_delivery_events(student_id,event_id),
  check ((submitted and final_revision=2) or (not submitted and final_revision=1 and workflow_revision is null))
);
create unique index nmls_first_final_submission_one_seal on public.nmls_first_final_submission_events(final_id) where submitted;
alter table public.nmls_first_final_submission_events enable row level security;
revoke all on public.nmls_first_final_submission_events from public,anon,authenticated,service_role;
create trigger nmls_first_final_submission_event_immutable before update or delete on public.nmls_first_final_submission_events
  for each row execute function public.nmls_private_final_event_immutable();

--035 alone must not replay a036-owned derived pause, even a denied submission.
-- The outer036 writer calls the owner-only delegate after its own event/CAS
-- checks; no caller-supplied flag or mutable GUC can bypass this namespace.
alter function public.nmls_first_final_delivery_commit(uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb)
  rename to nmls_first_final_delivery_pre_submission_internal;
create function public.nmls_first_final_delivery_commit(p_student_id uuid,p_attempt_id uuid,p_final_id uuid,p_event_id uuid,
  p_command_digest text,p_expected_source_revision bigint,p_expected_final_revision bigint,p_expected_delivery_revision bigint,
  p_expected_actor_revision bigint,p_expected_session_id uuid,p_evaluated_at_ms bigint,p_definition_digest text,p_transition jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants;
begin
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a0 on a0.grant_id=g0.id
    where a0.id=p_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status is distinct from 'active'
    or g.expires_at<=clock_timestamp() then raise exception 'nmls_first_final_delivery_access_denied'; end if;
  perform 1 from public.nmls_review_study_leases where student_id=p_student_id for update;
  if exists(select 1 from public.nmls_first_final_submission_events where student_id=p_student_id and event_id=p_event_id) then
    raise exception 'nmls_review_idempotency_conflict'; end if;
  return public.nmls_first_final_delivery_pre_submission_internal(p_student_id,p_attempt_id,p_final_id,p_event_id,p_command_digest,
    p_expected_source_revision,p_expected_final_revision,p_expected_delivery_revision,p_expected_actor_revision,
    p_expected_session_id,p_evaluated_at_ms,p_definition_digest,p_transition);
end $$;

create function public.nmls_first_final_submission_hash(p_value jsonb) returns text
language sql immutable set search_path=pg_catalog,public as $$
  select encode(sha256(convert_to(public.nmls_teaching_canonical(p_value),'UTF8')),'hex');
$$;

-- No answer-key assertion is made by SQL. The private composer regrades the
-- pinned form and derives the actual course/manifest. SQL checks exact shape,
-- arithmetic, selected answer IDs and full-module layout correspondence.
create function public.nmls_first_final_submission_payload_guard(p_payload jsonb,p_answers jsonb,p_final jsonb,p_layout jsonb)
returns void language plpgsql set search_path=pg_catalog,public as $$
declare result jsonb:=p_payload->'result'; manifest jsonb:=p_payload->'manifest'; item jsonb; m jsonb;
  modules jsonb:='[]'; units jsonb:='[]'; expected_units jsonb; ordered_modules jsonb; field text;
begin
  if jsonb_typeof(p_payload) is distinct from 'object'
    or not (p_payload ?& array['submitted','code','answers','result','manifest','childRuntime'])
    or p_payload-array['submitted','code','answers','result','manifest','childRuntime']<>'{}'::jsonb
    or jsonb_typeof(p_payload->'submitted') is distinct from 'boolean'
    or not coalesce(p_payload->>'code' in ('first_final_submission_allowed','first_final_policy_refused',
      'first_final_session_required','first_final_exposure_review_required'),false) then
    raise exception 'nmls_first_final_submission_invalid_payload'; end if;
  if p_payload->'submitted'='false'::jsonb then
    if p_payload->>'code'='first_final_submission_allowed' or p_payload->'answers' is distinct from 'null'::jsonb
      or result is distinct from 'null'::jsonb or manifest is distinct from 'null'::jsonb
      or p_payload->'childRuntime' is distinct from 'null'::jsonb then raise exception 'nmls_first_final_submission_denial_payload'; end if;
    return;
  end if;
  if p_payload->>'code' is distinct from 'first_final_submission_allowed' or p_payload->'answers' is distinct from p_answers
    or jsonb_typeof(result) is distinct from 'object'
    or not (result ?& array['mode','passed','correct','total','percent','requiredCorrect','assignedCreditSeconds',
      'creditIssuanceAllowed','courseCompletionIssued','disposition','remediation'])
    or result-array['mode','passed','correct','total','percent','requiredCorrect','assignedCreditSeconds',
      'creditIssuanceAllowed','courseCompletionIssued','disposition','remediation']<>'{}'::jsonb
    or result->>'mode' is distinct from 'private_authoring_review'
    or not public.nmls_final_guard_integer(result->'correct',25,false)
    or result->'total' is distinct from '25'::jsonb or result->'requiredCorrect' is distinct from '18'::jsonb
    or result->'assignedCreditSeconds' is distinct from '0'::jsonb
    or result->'creditIssuanceAllowed' is distinct from 'false'::jsonb
    or result->'courseCompletionIssued' is distinct from 'false'::jsonb then raise exception 'nmls_first_final_submission_invalid_result'; end if;
  if result->'passed' is distinct from to_jsonb((result->>'correct')::int>=18)
    or result->'percent' is distinct from to_jsonb((result->>'correct')::int*4)
    or result->>'disposition' is distinct from (case when (result->>'correct')::int>=18 then 'draft_final_passed' else 'remediation_required' end)
    or jsonb_typeof(result->'remediation') is distinct from 'array' then raise exception 'nmls_first_final_submission_invalid_result'; end if;
  if result->'passed'='true'::jsonb then
    if result->'remediation' is distinct from '[]'::jsonb or manifest is distinct from 'null'::jsonb
      or p_payload->'childRuntime' is distinct from 'null'::jsonb then raise exception 'nmls_first_final_submission_invalid_child'; end if;
    return;
  end if;
  if jsonb_array_length(result->'remediation')=0 then raise exception 'nmls_first_final_submission_invalid_child'; end if;
  for item in select value from jsonb_array_elements(result->'remediation') loop
    if jsonb_typeof(item) is distinct from 'object' or not (item ?& array['moduleId','title','unitIds','instruction'])
      or item-array['moduleId','title','unitIds','instruction']<>'{}'::jsonb
      or jsonb_typeof(item->'title') is distinct from 'string' or length(trim(item->>'title')) not between 1 and 4000
      or jsonb_typeof(item->'instruction') is distinct from 'string' or length(trim(item->>'instruction')) not between 1 and 4000 then
      raise exception 'nmls_first_final_submission_invalid_child'; end if;
    select value into m from jsonb_array_elements(p_layout) where value->'id'=item->'moduleId';
    if not found then raise exception 'nmls_first_final_submission_invalid_child'; end if;
    select jsonb_agg(value->'id' order by n) into expected_units from jsonb_array_elements(m->'units') with ordinality x(value,n);
    if item->'unitIds' is distinct from expected_units then raise exception 'nmls_first_final_submission_invalid_child'; end if;
    modules:=modules||jsonb_build_array(item->'moduleId'); units:=units||expected_units;
  end loop;
  select jsonb_agg(value->'id' order by n) into ordered_modules from jsonb_array_elements(p_layout) with ordinality x(value,n)
    where modules ? (value->>'id');
  if modules is distinct from ordered_modules or not public.nmls_private_same_ids(units,units)
    or jsonb_typeof(manifest) is distinct from 'object'
    or not (manifest ?& array['courseKey','contentDigest','sourceCourseKey','sourceContentDigest','definitionDigest',
      'finalAttemptId','reviewAttemptId','moduleIds','unitIds','completed','retakeEnabled'])
    or manifest-array['courseKey','contentDigest','sourceCourseKey','sourceContentDigest','definitionDigest',
      'finalAttemptId','reviewAttemptId','moduleIds','unitIds','completed','retakeEnabled']<>'{}'::jsonb
    or manifest->>'courseKey' is distinct from p_final->>'course_key'||'-remediation-'||(p_final->>'id')
    or not coalesce(manifest->>'contentDigest' ~ '^[a-f0-9]{64}$',false)
    or manifest->'sourceCourseKey' is distinct from p_final->'course_key'
    or manifest->'sourceContentDigest' is distinct from p_final->'content_digest'
    or manifest->'definitionDigest' is distinct from p_final->'definition_digest'
    or manifest->'finalAttemptId' is distinct from p_final->'id' or manifest->'reviewAttemptId' is distinct from p_final->'review_attempt_id'
    or manifest->'moduleIds' is distinct from modules or manifest->'unitIds' is distinct from units
    or manifest->'completed' is distinct from 'false'::jsonb or manifest->'retakeEnabled' is distinct from 'false'::jsonb
    or p_payload->'childRuntime' is distinct from jsonb_build_object('mode','non_credit_review','creditIssuanceAllowed',false,
      'courseKey',manifest->>'courseKey','contentDigest',manifest->>'contentDigest','revision',0,'status','logged_out',
      'sessionId',null,'lastActivityMs',null,'lastReceiptMs',0,'completedUnitIds','[]'::jsonb,'completedReviewMs',0,
      'passedModuleIds','[]'::jsonb,'current',null,'quiz',null,'feedback',null) then raise exception 'nmls_first_final_submission_invalid_child'; end if;
end $$;

-- Called only after the joint locks. Unlike035 this authority check accepts an
-- already sealed form, so036 replay never re-enters an unsubmitted-only writer.
create function public.nmls_first_final_submission_authority(p_actor uuid,p_attempt uuid,p_final uuid,p_definition text)
returns jsonb language plpgsql set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants; b public.nmls_review_policy_bindings; a public.nmls_review_attempts;
  l public.nmls_review_actor_policy; f public.nmls_private_finals; pin public.nmls_teaching_phase_bindings;
  r public.nmls_final_reservation_events; e public.nmls_teaching_events; source_phase jsonb; phase jsonb; expected_lease jsonb;
  selected_digest text; field text; at_ms bigint:=floor(extract(epoch from clock_timestamp())*1000);
begin
  select * into a from public.nmls_review_attempts where id=p_attempt;
  select * into g from public.nmls_review_access_grants where id=a.grant_id;
  select * into b from public.nmls_review_policy_bindings where grant_id=g.id;
  select * into l from public.nmls_review_actor_policy where student_id=p_actor;
  select * into f from public.nmls_private_finals where id=p_final;
  if g.id is null or a.student_id is distinct from p_actor or g.student_id is distinct from p_actor
    or f.student_id is distinct from p_actor or f.review_attempt_id is distinct from a.id
    or g.status is distinct from 'active' or g.expires_at<=clock_timestamp() then raise exception 'nmls_first_final_submission_access_denied'; end if;
  if b.grant_id is null or l.student_id is null or a.course_key is distinct from g.course_key
    or a.content_digest is distinct from g.content_digest or b.offering->>'id' is distinct from g.id::text
    or b.offering->>'contentDigest' is distinct from a.content_digest or f.course_key is distinct from a.course_key
    or f.content_digest is distinct from a.content_digest or f.definition_digest is distinct from p_definition
    or l.policy_id is distinct from b.policy_id or l.policy_digest is distinct from b.policy_digest
    or l.ledger->>'actorId' is distinct from p_actor::text or l.ledger->>'policyId' is distinct from b.policy_id
    or l.ledger->'revision' is distinct from to_jsonb(l.revision) or l.ledger->'creditIssuanceAllowed' is distinct from 'false'::jsonb
    or not public.nmls_final_guard_integer(l.ledger->'lastReceiptMs',9007199254740991,false) then
    raise exception 'nmls_first_final_submission_scope_changed'; end if;
  perform public.nmls_first_final_delivery_rocs_guard(l.ledger,p_actor,g.id,b.offering);
  if f.revision not in (1,2) or not isfinite(f.issued_at) or f.id=a.id
    or f.selection->>'id' is distinct from f.id::text or f.selection->>'reviewAttemptId' is distinct from a.id::text
    or f.selection->>'definitionDigest' is distinct from f.definition_digest or f.selection->'number' is distinct from '1'::jsonb then
    raise exception 'nmls_first_final_submission_scope_changed'; end if;
  source_phase:=jsonb_build_object('version','nmls-teaching-phase-v1','kind','source','ownerId',a.id,'sourceCourseKey',a.course_key,
    'sourceContentDigest',a.content_digest,'teachingCourseKey',a.course_key,'policyDigest',b.policy_digest,'definitionDigest',null,'manifestDigest',null);
  select * into pin from public.nmls_teaching_phase_bindings where student_id=p_actor and review_attempt_id=a.id
    and phase_kind='source' and phase_owner_id=a.id;
  if not found or pin.phase_scope is distinct from source_phase or pin.teaching_digest is distinct from a.content_digest
    or a.runtime->'revision' is distinct from to_jsonb(a.revision) or a.runtime->>'status' is distinct from 'review_complete'
    or a.runtime->>'courseKey' is distinct from a.course_key or a.runtime->>'contentDigest' is distinct from a.content_digest then
    raise exception 'nmls_first_final_submission_source_incomplete'; end if;
  perform public.nmls_teaching_guard_progress(a.runtime,a.runtime,pin.layout,jsonb_build_object('deliveryAllowed',false),
    jsonb_build_object('review',jsonb_build_object('kind','check_access')),at_ms);
  selected_digest:=public.nmls_first_final_submission_hash(f.selection);
  select * into r from public.nmls_final_reservation_events where student_id=p_actor and final_id=f.id and reserved;
  select * into e from public.nmls_teaching_events where student_id=p_actor and event_id=r.event_id;
  expected_lease:=jsonb_build_object('student_id',p_actor,'attempt_id',a.id,'session_id',a.runtime->'sessionId',
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
    or e.audit#>>'{policy,actorId}' is distinct from p_actor::text or e.audit#>>'{policy,offeringId}' is distinct from g.id::text
    or e.audit#>>'{policy,contentDigest}' is distinct from a.content_digest or e.audit#>>'{policy,policyId}' is distinct from b.policy_id
    or e.audit#>'{policy,observation}' is not null
    or e.audit->'observation' is distinct from jsonb_build_object('reason','no_prior_material','code','study_observation_ready') then
    raise exception 'nmls_first_final_submission_reservation_provenance'; end if;
  if (e.audit#>>'{policy,atMs}')::bigint<(b.offering->>'opensAtMs')::bigint
    or (e.audit#>>'{policy,atMs}')::bigint>=(b.offering->>'closesAtMs')::bigint
    or (a.runtime->>'lastReceiptMs')::bigint<(e.audit#>>'{policy,atMs}')::bigint
    or (l.ledger->>'lastReceiptMs')::bigint<(e.audit#>>'{policy,atMs}')::bigint then
    raise exception 'nmls_first_final_submission_reservation_provenance'; end if;
  foreach field in array array['completedUnitIds','passedModuleIds','completedReviewMs'] loop
    if e.outcome->'progress'->field is distinct from a.runtime->field then raise exception 'nmls_first_final_submission_source_changed'; end if;
  end loop;
  phase:=jsonb_build_object('version','nmls-first-final-phase-v1','actorId',p_actor,'reviewAttemptId',a.id,
    'finalAttemptId',f.id,'courseKey',a.course_key,'contentDigest',a.content_digest,'definitionDigest',f.definition_digest,
    'selectionDigest',selected_digest,'offeringId',g.id);
  return jsonb_build_object('phase',phase,'layout',pin.layout);
end $$;

create function public.nmls_first_final_submission_context(p_student_id uuid,p_attempt_id uuid,p_final_id uuid,p_event_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare ctx jsonb; e public.nmls_first_final_submission_events; w public.nmls_private_remediations;
begin
  --035 context itself does not assert unsubmitted status; its domain brand and
  -- commit do. Never build a fake revision1 form to make a replay pass them.
  ctx:=public.nmls_first_final_delivery_context(p_student_id,p_attempt_id,p_final_id,p_event_id);
  select * into e from public.nmls_first_final_submission_events where student_id=p_student_id and event_id=p_event_id;
  select * into w from public.nmls_private_remediations where student_id=p_student_id and first_final_id=p_final_id;
  return ctx||jsonb_build_object('submissionEvent',case when e.event_id is null then null else to_jsonb(e) end,
    'workflow',case when w.first_final_id is null then null else to_jsonb(w) end,
    'serverTimeMs',floor(extract(epoch from clock_timestamp())*1000)::bigint);
end $$;

create function public.nmls_first_final_submission_commit(p_student_id uuid,p_attempt_id uuid,p_final_id uuid,p_event_id uuid,
  p_command_digest text,p_expected_source_revision bigint,p_expected_final_revision bigint,p_expected_delivery_revision bigint,
  p_expected_actor_revision bigint,p_expected_session_id uuid,p_evaluated_at_ms bigint,p_definition_digest text,p_intent jsonb,p_transition jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants; b public.nmls_review_policy_bindings; a public.nmls_review_attempts;
  lease public.nmls_review_study_leases; l public.nmls_review_actor_policy; f public.nmls_private_finals;
  d public.nmls_first_final_deliveries; w public.nmls_private_remediations; e public.nmls_first_final_submission_events;
  seal public.nmls_first_final_submission_events; de public.nmls_first_final_delivery_events;
  seal_de public.nmls_first_final_delivery_events;
  authority jsonb; phase jsonb; layout jsonb; command jsonb; payload jsonb; closing jsonb; next_runtime jsonb; next_ledger jsonb;
  result jsonb; manifest jsonb; child_runtime jsonb; old_runtime jsonb; old_window jsonb; scope jsonb;
  outcome jsonb; replay_payload jsonb; expected_outcome jsonb; sealed_intent jsonb; item jsonb; field text; keys text[];
  derived_digest text; submission_code text; submitted boolean; failed boolean; session_ok boolean; numeric_ok boolean;
  at_ms bigint; opening_ms bigint; cutoff_ms bigint; deadline_ms bigint; boundary_ms bigint; since_break_ms bigint; rolling_ms bigint;
  observed jsonb; combined jsonb;
begin
  if p_student_id is null or p_attempt_id is null or p_final_id is null or p_event_id is null
    or not coalesce(p_command_digest ~ '^[a-f0-9]{64}$',false)
    or not coalesce(p_definition_digest ~ '^[a-f0-9]{64}$',false) then raise exception 'nmls_first_final_submission_invalid_command'; end if;
  keys:=array['kind','attemptId','finalAttemptId','eventId','expectedSourceRevision','expectedFinalRevision',
    'expectedRevision','expectedActorRevision','sessionId','answers'];
  if p_intent ? 'studyReceipt' then keys:=keys||array['studyReceipt']; end if;
  if jsonb_typeof(p_intent) is distinct from 'object' or not (p_intent ?& keys) or p_intent-keys<>'{}'::jsonb
    or p_intent->>'kind' is distinct from 'submit_first_final' or p_intent->>'attemptId' is distinct from p_attempt_id::text
    or p_intent->>'finalAttemptId' is distinct from p_final_id::text or p_intent->>'eventId' is distinct from p_event_id::text
    or p_intent->'expectedSourceRevision' is distinct from to_jsonb(p_expected_source_revision)
    or p_intent->'expectedFinalRevision' is distinct from '1'::jsonb or p_expected_final_revision is distinct from 1
    or p_intent->'expectedRevision' is distinct from to_jsonb(p_expected_delivery_revision)
    or p_intent->'expectedActorRevision' is distinct from to_jsonb(p_expected_actor_revision)
    or p_intent->'sessionId' is distinct from coalesce(to_jsonb(p_expected_session_id),'null'::jsonb)
    or jsonb_typeof(p_intent->'answers') is distinct from 'object'
    or public.nmls_first_final_submission_hash(p_intent) is distinct from p_command_digest then
    raise exception 'nmls_first_final_submission_invalid_intent'; end if;
  foreach field in array array['expectedSourceRevision','expectedFinalRevision','expectedRevision','expectedActorRevision'] loop
    if not public.nmls_final_guard_integer(p_intent->field,9007199254740991,false) then raise exception 'nmls_first_final_submission_invalid_intent'; end if;
  end loop;
  if p_intent ? 'studyReceipt' and (jsonb_typeof(p_intent->'studyReceipt') is distinct from 'object'
    or not ((p_intent->'studyReceipt') ?& array['windowId','visible'])
    or (p_intent->'studyReceipt')-array['windowId','visible']<>'{}'::jsonb
    or not coalesce(p_intent#>>'{studyReceipt,windowId}' ~* '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false)
    or jsonb_typeof(p_intent#>'{studyReceipt,visible}') is distinct from 'boolean') then raise exception 'nmls_first_final_submission_invalid_intent'; end if;
  command:=(p_intent-array['attemptId','finalAttemptId','expectedSourceRevision','expectedFinalRevision','answers'])||jsonb_build_object('kind','pause');
  derived_digest:=public.nmls_first_final_submission_hash(command||jsonb_build_object('attemptId',p_attempt_id,'finalAttemptId',p_final_id,
    'expectedSourceRevision',p_expected_source_revision,'expectedFinalRevision',1));
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a0 on a0.grant_id=g0.id
    where a0.id=p_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status is distinct from 'active'
    or g.expires_at<=clock_timestamp() then raise exception 'nmls_first_final_submission_access_denied'; end if;
  select * into lease from public.nmls_review_study_leases where student_id=p_student_id for update;
  select * into l from public.nmls_review_actor_policy where student_id=p_student_id for update;
  select * into a from public.nmls_review_attempts where id=p_attempt_id for update;
  select * into f from public.nmls_private_finals where id=p_final_id for update;
  select * into d from public.nmls_first_final_deliveries where final_id=p_final_id for update;
  select * into w from public.nmls_private_remediations where first_final_id=p_final_id for update;
  select * into b from public.nmls_review_policy_bindings where grant_id=g.id;
  authority:=public.nmls_first_final_submission_authority(p_student_id,p_attempt_id,p_final_id,p_definition_digest);
  phase:=authority->'phase'; layout:=authority->'layout';
  if lease.student_id is null or d.final_id is not null and (d.student_id is distinct from p_student_id
    or d.review_attempt_id is distinct from a.id or d.phase_scope is distinct from phase
    or d.runtime->>'phaseDigest' is distinct from public.nmls_first_final_submission_hash(phase)
    or d.runtime->'revision' is distinct from to_jsonb(d.revision)) then raise exception 'nmls_first_final_submission_scope_changed'; end if;
  if (select count(*) from jsonb_object_keys(p_intent->'answers'))<>25
    or exists(select 1 from jsonb_each(p_intent->'answers') x where jsonb_typeof(x.value) is distinct from 'string'
      or not coalesce(x.value#>>'{}' in ('A','B','C','D'),false) or not (f.selection->'questionIds' ? x.key)) then
    raise exception 'nmls_first_final_submission_invalid_answers'; end if;
  -- Validate the terminal origin even when replaying an earlier denial. No
  -- standalone026 seal may be adopted as this phase-aware submission history.
  select s.* into seal from public.nmls_first_final_submission_events s where s.final_id=f.id and s.submitted;
  if f.revision=2 then
    select * into seal_de from public.nmls_first_final_delivery_events where student_id=p_student_id and event_id=seal.event_id;
    if seal.event_id is null or seal_de.event_id is null or seal.student_id is distinct from p_student_id
      or seal.review_attempt_id is distinct from a.id or seal.definition_digest is distinct from f.definition_digest
      or seal.final_revision is distinct from 2 or seal.delivery_command_digest is distinct from seal_de.command_digest
      or seal_de.final_id is distinct from f.id or seal_de.review_attempt_id is distinct from a.id
      or seal_de.definition_digest is distinct from f.definition_digest or seal_de.source_revision is distinct from seal.source_revision
      or seal_de.actor_revision is distinct from seal.actor_revision or seal_de.delivery_revision is distinct from seal.delivery_revision
      or seal_de.transaction_id is distinct from seal.transaction_id or not isfinite(f.submitted_at)
      or seal.outcome->'result' is distinct from f.result or seal.outcome->'remediation' is distinct from coalesce(f.remediation_manifest,'null'::jsonb)
      or a.revision<seal.source_revision or l.revision<seal.actor_revision or d.final_id is null or d.revision<seal.delivery_revision then
      raise exception 'nmls_first_final_submission_history_conflict'; end if;
    child_runtime:=case when f.remediation_manifest is null then 'null'::jsonb else jsonb_build_object(
      'mode','non_credit_review','creditIssuanceAllowed',false,'courseKey',f.remediation_manifest->>'courseKey',
      'contentDigest',f.remediation_manifest->>'contentDigest','revision',0,'status','logged_out','sessionId',null,
      'lastActivityMs',null,'lastReceiptMs',0,'completedUnitIds','[]'::jsonb,'completedReviewMs',0,
      'passedModuleIds','[]'::jsonb,'current',null,'quiz',null,'feedback',null) end;
    replay_payload:=jsonb_build_object('submitted',true,'code','first_final_submission_allowed','answers',f.answers,
      'result',f.result,'manifest',f.remediation_manifest,'childRuntime',child_runtime);
    perform public.nmls_first_final_submission_payload_guard(replay_payload,f.answers,to_jsonb(f),layout);
    sealed_intent:=jsonb_build_object('kind','pause','attemptId',a.id,'finalAttemptId',f.id,'eventId',seal.event_id,
      'expectedSourceRevision',seal.source_revision,'expectedFinalRevision',1,'expectedRevision',seal.delivery_revision-1,
      'expectedActorRevision',seal.actor_revision-1,'sessionId',seal_de.lease_before->'session_id',
      'studyReceipt',jsonb_build_object('windowId',seal_de.audit#>'{observation,windowBefore,id}','visible',true));
    expected_outcome:=jsonb_build_object('ok',true,'code','private_first_final_submitted','status',200,'submitted',true,
      'finalAttemptId',f.id,'finalRevision',2,'sourceRevision',seal.source_revision,'actorRevision',seal.actor_revision,
      'deliveryRevision',seal.delivery_revision,'submissionCode','first_final_submission_allowed',
      'deliveryCode','final_paused','policyCode','session_policy_allowed','observationCode','receipt_continuous',
      'result',f.result,'remediation',f.remediation_manifest,'workflowRevision',seal.workflow_revision,
      'mode','private_authoring_review','deliveryAllowed',false,'studentDeliveryEnabled',false,'creditIssuanceAllowed',false,'retakeEnabled',false);
    if public.nmls_first_final_submission_hash(replay_payload) is distinct from seal.submission_payload_digest
      or seal.outcome is distinct from expected_outcome
      or public.nmls_first_final_submission_hash(sealed_intent) is distinct from seal.delivery_command_digest
      or public.nmls_first_final_submission_hash(sealed_intent||jsonb_build_object('kind','submit_first_final','answers',f.answers))
        is distinct from seal.command_digest
      or seal_de.audit->>'kind' is distinct from 'pause' or seal_de.audit->'phase' is distinct from phase
      or seal_de.outcome->'ok' is distinct from 'true'::jsonb or seal_de.outcome->'status' is distinct from '200'::jsonb
      or seal_de.outcome->>'code' is distinct from 'final_paused' or seal_de.outcome->>'policyCode' is distinct from 'session_policy_allowed'
      or seal_de.outcome->>'observationCode' is distinct from 'receipt_continuous'
      or seal_de.outcome->'candidateMaterialAllowed' is distinct from 'false'::jsonb
      or seal_de.outcome->'candidateUntilMs' is distinct from 'null'::jsonb or seal_de.outcome->'candidateWindow' is distinct from 'null'::jsonb
      or f.result->'passed'='true'::jsonb and (w.first_final_id is not null or seal.workflow_revision is not null)
      or f.result->'passed'='false'::jsonb and (w.first_final_id is null or w.student_id is distinct from p_student_id
        or w.review_attempt_id is distinct from a.id or w.definition_digest is distinct from f.definition_digest
        or w.manifest is distinct from f.remediation_manifest or w.revision<1 or seal.workflow_revision is distinct from 1) then
      raise exception 'nmls_first_final_submission_history_conflict'; end if;
  elsif seal.event_id is not null or f.answers is not null or f.result is not null or f.remediation_manifest is not null
    or f.submitted_at is not null or w.first_final_id is not null then raise exception 'nmls_first_final_submission_history_conflict'; end if;
  select * into e from public.nmls_first_final_submission_events where student_id=p_student_id and event_id=p_event_id;
  select * into de from public.nmls_first_final_delivery_events where student_id=p_student_id and event_id=p_event_id;
  if e.event_id is not null or de.event_id is not null then
    if e.event_id is null or de.event_id is null or e.command_digest is distinct from p_command_digest
      or e.delivery_command_digest is distinct from derived_digest or de.command_digest is distinct from derived_digest
      or e.final_id is distinct from f.id or e.review_attempt_id is distinct from a.id or e.definition_digest is distinct from f.definition_digest
      or de.final_id is distinct from f.id or de.review_attempt_id is distinct from a.id or de.definition_digest is distinct from f.definition_digest
      or e.source_revision is distinct from de.source_revision or e.actor_revision is distinct from de.actor_revision
      or e.delivery_revision is distinct from de.delivery_revision or e.transaction_id is distinct from de.transaction_id
      or de.final_revision is distinct from 1 or e.source_revision is distinct from p_expected_source_revision
      or e.actor_revision is distinct from p_expected_actor_revision+1 or e.delivery_revision is distinct from p_expected_delivery_revision+1
      or a.revision<e.source_revision or l.revision<e.actor_revision or d.final_id is null or d.revision<e.delivery_revision
      or de.audit->>'kind' is distinct from 'pause' or de.audit->>'eventId' is distinct from p_event_id::text
      or de.audit->'phase' is distinct from phase or de.runtime->>'phaseDigest' is distinct from public.nmls_first_final_submission_hash(phase)
      or de.runtime->'revision' is distinct from to_jsonb(e.delivery_revision)
      or de.outcome->'candidateMaterialAllowed' is distinct from 'false'::jsonb
      or de.outcome->'candidateUntilMs' is distinct from 'null'::jsonb or de.outcome->'candidateWindow' is distinct from 'null'::jsonb then
      raise exception 'nmls_first_final_submission_idempotency_conflict'; end if;
    if e.submitted then
      if f.revision is distinct from 2 or seal.event_id is distinct from e.event_id or f.answers is distinct from p_intent->'answers' then
        raise exception 'nmls_first_final_submission_idempotency_conflict'; end if;
      replay_payload:=jsonb_build_object('submitted',true,'code','first_final_submission_allowed','answers',f.answers,
        'result',f.result,'manifest',f.remediation_manifest,'childRuntime',child_runtime);
    else replay_payload:=jsonb_build_object('submitted',false,'code',e.outcome->'submissionCode',
      'answers',null,'result',null,'manifest',null,'childRuntime',null); end if;
    perform public.nmls_first_final_submission_payload_guard(replay_payload,p_intent->'answers',to_jsonb(f),layout);
    if public.nmls_first_final_submission_hash(replay_payload) is distinct from e.submission_payload_digest then
      raise exception 'nmls_first_final_submission_idempotency_conflict'; end if;
    expected_outcome:=jsonb_build_object('ok',e.submitted,'code',case when e.submitted then 'private_first_final_submitted' else 'private_first_final_submission_refused' end,
      'status',case when e.submitted then 200 when de.outcome->'status'='401'::jsonb then 401 else 409 end,
      'submitted',e.submitted,'finalAttemptId',f.id,'finalRevision',case when e.submitted then 2 else 1 end,
      'sourceRevision',e.source_revision,'actorRevision',e.actor_revision,'deliveryRevision',e.delivery_revision,
      'submissionCode',replay_payload->'code','deliveryCode',de.outcome->'code','policyCode',de.outcome->'policyCode',
      'observationCode',de.outcome->'observationCode','result',replay_payload->'result','remediation',replay_payload->'manifest',
      'workflowRevision',e.workflow_revision,'mode','private_authoring_review','deliveryAllowed',false,
      'studentDeliveryEnabled',false,'creditIssuanceAllowed',false,'retakeEnabled',false);
    if e.outcome is distinct from expected_outcome then raise exception 'nmls_first_final_submission_idempotency_conflict'; end if;
    return jsonb_build_object('duplicate',true,'outcome',e.outcome);
  end if;
  if f.revision<>1 then raise exception 'nmls_first_final_submission_already_submitted'; end if;
  if a.revision is distinct from p_expected_source_revision or f.revision is distinct from p_expected_final_revision
    or coalesce(d.revision,0) is distinct from p_expected_delivery_revision or l.revision is distinct from p_expected_actor_revision then
    raise exception 'nmls_review_revision_conflict'; end if;
  if d.runtime->>'sessionId' is distinct from p_expected_session_id::text then raise exception 'nmls_review_session_conflict'; end if;
  if exists(select 1 from public.nmls_review_attempt_events x join public.nmls_review_attempts y on y.id=x.attempt_id
      where y.student_id=p_student_id and x.event_id=p_event_id)
    or exists(select 1 from public.nmls_review_actor_policy_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_private_final_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_private_remediation_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_teaching_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_final_reservation_events where student_id=p_student_id and event_id=p_event_id) then
    raise exception 'nmls_review_idempotency_conflict'; end if;
  if jsonb_typeof(p_transition) is distinct from 'object'
    or not (p_transition ?& array['phase','command','runtime','ledger','outcome','audit','submission'])
    or p_transition-array['phase','command','runtime','ledger','outcome','audit','submission']<>'{}'::jsonb
    or p_transition->'phase' is distinct from phase or p_transition->'command' is distinct from command then
    raise exception 'nmls_first_final_submission_invalid_transition'; end if;
  payload:=p_transition->'submission'; next_runtime:=p_transition->'runtime'; next_ledger:=p_transition->'ledger';
  perform public.nmls_first_final_submission_payload_guard(payload,p_intent->'answers',to_jsonb(f),layout);
  old_runtime:=d.runtime; old_window:=l.ledger#>'{observationJournal,active}';
  -- Inner035 performs actor policy accounting, independent034 transition
  -- checking, fresh session/receipt CAS, and its exact final lease update.
  -- Only then may026 become revision2; its old trigger remains unchanged.
  closing:=public.nmls_first_final_delivery_pre_submission_internal(p_student_id,p_attempt_id,p_final_id,p_event_id,derived_digest,
    p_expected_source_revision,p_expected_final_revision,p_expected_delivery_revision,p_expected_actor_revision,
    p_expected_session_id,p_evaluated_at_ms,p_definition_digest,p_transition-'submission');
  if closing->'duplicate' is distinct from 'false'::jsonb or closing->'outcome' is distinct from p_transition->'outcome'
    or closing->'runtime' is distinct from next_runtime or closing->'sourceRevision' is distinct from to_jsonb(a.revision) then
    raise exception 'nmls_first_final_submission_idempotency_conflict'; end if;
  scope:=jsonb_build_object('actorId',p_student_id,'attemptId',a.id,'offeringId',g.id,'contentDigest',a.content_digest,
    'sessionId',old_runtime->'sessionId','finalPhase',phase);
  session_ok:=coalesce(old_runtime->>'status'='active' and old_runtime->>'sessionId' is not null
    and old_runtime->>'sessionId'=p_expected_session_id::text
    and jsonb_typeof(old_window)='object' and old_window->'scope'=scope
    and old_window->>'materialDigest'=phase->>'selectionDigest' and old_window->'runtimeRevision'=old_runtime->'revision'
    and public.nmls_final_guard_integer(old_window->'lastObservedAtMs',p_evaluated_at_ms,false)
    and command#>'{studyReceipt,windowId}'=old_window->'id' and command#>'{studyReceipt,visible}'='true'::jsonb
    and next_runtime->>'status'='paused' and next_runtime->'sessionId'=old_runtime->'sessionId'
    and next_runtime->'lastActivityMs'=old_runtime->'lastActivityMs'
    and next_ledger#>'{observationJournal,active}'='null'::jsonb and next_ledger#>'{observationJournal,unresolved}'='null'::jsonb
    and closing#>'{outcome,candidateMaterialAllowed}'='false'::jsonb
    and closing#>'{outcome,candidateUntilMs}'='null'::jsonb and closing#>'{outcome,candidateWindow}'='null'::jsonb
    and p_transition#>'{audit,observation,firstAcknowledgment}'='false'::jsonb
    and p_transition#>'{audit,observation,windowBefore}'=old_window
    and p_transition#>'{audit,observation,closedWindow}'=(old_window||jsonb_build_object('lastObservedAtMs',p_evaluated_at_ms)),false);
  opening_ms:=(b.offering->>'opensAtMs')::bigint; cutoff_ms:=(b.offering->>'closesAtMs')::bigint;
  numeric_ok:=false;
  if session_ok then
    observed:=public.nmls_policy_interval_union(next_ledger->'studyIntervals','[]'::jsonb);
    combined:=public.nmls_policy_interval_union(observed,next_ledger#>'{uncertainExposure,intervals}');
    boundary_ms:=(next_ledger->>'studyBoundaryAtMs')::bigint;
    since_break_ms:=greatest((next_ledger->>'studySinceBreakMs')::bigint,
      public.nmls_policy_exposure_in_range(observed,coalesce(boundary_ms,p_evaluated_at_ms),p_evaluated_at_ms))+
      public.nmls_policy_exposure_in_range(combined,coalesce(boundary_ms,p_evaluated_at_ms),p_evaluated_at_ms)-
      public.nmls_policy_exposure_in_range(observed,coalesce(boundary_ms,p_evaluated_at_ms),p_evaluated_at_ms);
    rolling_ms:=public.nmls_policy_exposure_in_range(combined,p_evaluated_at_ms-86400000,p_evaluated_at_ms);
    deadline_ms:=least((old_window->>'horizonMs')::bigint,(old_runtime->>'lastActivityMs')::bigint+360000,
      (next_ledger->>'sessionStartedAtMs')::bigint+43200000,cutoff_ms);
    numeric_ok:=coalesce(p_evaluated_at_ms>=opening_ms and p_evaluated_at_ms<deadline_ms
      and next_ledger->'breakStartedAtMs'='null'::jsonb and next_ledger->>'sessionStartedAtMs' is not null
      and (boundary_ms is null or boundary_ms<=p_evaluated_at_ms)
      and not exists(select 1 from jsonb_array_elements(combined) x where (x.value->>'end')::bigint>p_evaluated_at_ms)
      and since_break_ms<12000000 and rolling_ms<36000000,false);
  end if;
  if closing#>'{outcome,ok}' is distinct from 'true'::jsonb or closing#>'{outcome,status}' is distinct from '200'::jsonb
    or closing#>>'{outcome,code}' is distinct from 'final_paused'
    or closing#>>'{outcome,policyCode}' is distinct from 'session_policy_allowed'
    or closing#>>'{outcome,observationCode}' is distinct from 'receipt_continuous' then submission_code:='first_final_policy_refused';
  elsif not session_ok then submission_code:='first_final_session_required';
  elsif not numeric_ok then submission_code:='first_final_exposure_review_required';
  else submission_code:='first_final_submission_allowed'; end if;
  submitted:=submission_code='first_final_submission_allowed';
  if payload->>'code' is distinct from submission_code or payload->'submitted' is distinct from to_jsonb(submitted) then
    raise exception 'nmls_first_final_submission_decision_conflict'; end if;
  result:=payload->'result'; manifest:=payload->'manifest'; child_runtime:=payload->'childRuntime';
  failed:=submitted and result->'passed'='false'::jsonb;
  if submitted then
    at_ms:=floor(extract(epoch from clock_timestamp())*1000);
    if at_ms>=deadline_ms then raise exception 'nmls_review_clock_refresh_required'; end if;
    update public.nmls_private_finals set revision=2,answers=p_intent->'answers',result=payload->'result',
      remediation_manifest=nullif(payload->'manifest','null'::jsonb),submitted_at=clock_timestamp() where id=f.id;
    if failed then
      insert into public.nmls_private_remediations(first_final_id,student_id,review_attempt_id,definition_digest,manifest,revision,status,runtime)
        values(f.id,p_student_id,a.id,f.definition_digest,manifest,1,'remediating',child_runtime);
    end if;
  end if;
  outcome:=jsonb_build_object('ok',submitted,'code',case when submitted then 'private_first_final_submitted' else 'private_first_final_submission_refused' end,
    'status',case when submitted then 200 when closing#>'{outcome,status}'='401'::jsonb then 401 else 409 end,
    'submitted',submitted,'finalAttemptId',f.id,'finalRevision',case when submitted then 2 else 1 end,
    'sourceRevision',a.revision,'actorRevision',next_ledger->'revision','deliveryRevision',next_runtime->'revision',
    'submissionCode',submission_code,'deliveryCode',closing#>'{outcome,code}','policyCode',closing#>'{outcome,policyCode}',
    'observationCode',closing#>'{outcome,observationCode}','result',result,'remediation',manifest,
    'workflowRevision',case when failed then 1 else null end,'mode','private_authoring_review','deliveryAllowed',false,
    'studentDeliveryEnabled',false,'creditIssuanceAllowed',false,'retakeEnabled',false);
  insert into public.nmls_first_final_submission_events(student_id,event_id,final_id,review_attempt_id,command_digest,
    delivery_command_digest,definition_digest,source_revision,final_revision,delivery_revision,actor_revision,workflow_revision,
    submitted,submission_payload_digest,outcome)
    values(p_student_id,p_event_id,f.id,a.id,p_command_digest,derived_digest,f.definition_digest,a.revision,
      case when submitted then 2 else 1 end,(next_runtime->>'revision')::bigint,(next_ledger->>'revision')::bigint,
      case when failed then 1 else null end,submitted,public.nmls_first_final_submission_hash(payload),outcome);
  -- A036 event cannot exist without its035 pair, so all old namespace fences
  -- already reject fresh reuse. Neither writer can adopt a standalone035 pause.
  -- No lease write follows sealing:035's trigger deliberately requires rev1.
  at_ms:=floor(extract(epoch from clock_timestamp())*1000);
  if g.expires_at<=clock_timestamp() then raise exception 'nmls_first_final_submission_access_denied'; end if;
  if p_evaluated_at_ms is null or p_evaluated_at_ms>at_ms+1000 or at_ms-p_evaluated_at_ms>1000
    or (at_ms<opening_ms) is distinct from (p_evaluated_at_ms<opening_ms)
    or (at_ms>=cutoff_ms) is distinct from (p_evaluated_at_ms>=cutoff_ms)
    or old_runtime->>'status'='active' and p_evaluated_at_ms<(old_runtime->>'lastActivityMs')::bigint+360000
      and at_ms>=(old_runtime->>'lastActivityMs')::bigint+360000
    or p_evaluated_at_ms<(old_window->>'horizonMs')::bigint and at_ms>=(old_window->>'horizonMs')::bigint
    or p_evaluated_at_ms<(l.ledger->>'sessionStartedAtMs')::bigint+43200000
      and at_ms>=(l.ledger->>'sessionStartedAtMs')::bigint+43200000
    or submitted and at_ms>=deadline_ms then raise exception 'nmls_review_clock_refresh_required'; end if;
  return jsonb_build_object('duplicate',false,'outcome',outcome);
end $$;

revoke all on function public.nmls_first_final_submission_hash(jsonb),
  public.nmls_first_final_delivery_pre_submission_internal(uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb),
  public.nmls_first_final_delivery_commit(uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb),
  public.nmls_first_final_submission_payload_guard(jsonb,jsonb,jsonb,jsonb),
  public.nmls_first_final_submission_authority(uuid,uuid,uuid,text),
  public.nmls_first_final_submission_context(uuid,uuid,uuid,uuid),
  public.nmls_first_final_submission_commit(uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb,jsonb)
  from public,anon,authenticated,service_role;
grant execute on function public.nmls_first_final_delivery_commit(uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb),
  public.nmls_first_final_submission_context(uuid,uuid,uuid,uuid),
  public.nmls_first_final_submission_commit(uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb,jsonb) to service_role;
commit;
