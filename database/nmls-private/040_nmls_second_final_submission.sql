-- LOCAL PRIVATE AUTHORING ONLY. Actual second pause + one immutable workflow
-- seal. No third form, new child, source/first mutation, attendance or CE credit.
begin;

create table public.nmls_second_final_submission_events (
  student_id uuid not null references public.students(id), event_id uuid not null,
  first_final_id uuid not null references public.nmls_private_finals(id),
  second_id uuid not null references public.nmls_second_final_deliveries(second_id),
  review_attempt_id uuid not null references public.nmls_review_attempts(id),
  reservation_event_id uuid not null,
  command_digest text not null check(command_digest ~ '^[a-f0-9]{64}$'),
  delivery_command_digest text not null check(delivery_command_digest ~ '^[a-f0-9]{64}$'),
  definition_digest text not null check(definition_digest ~ '^[a-f0-9]{64}$'),
  source_revision bigint not null check(source_revision>0),
  final_revision bigint not null check(final_revision=2),
  workflow_before_revision bigint not null check(workflow_before_revision>0),
  workflow_revision bigint not null check(workflow_revision>0),
  delivery_revision bigint not null check(delivery_revision>0),
  actor_revision bigint not null check(actor_revision>0),
  session_id uuid, submitted boolean not null,
  submission_payload_digest text not null check(submission_payload_digest ~ '^[a-f0-9]{64}$'),
  outcome jsonb not null check(jsonb_typeof(outcome)='object'
    and outcome->'submitted' is not distinct from to_jsonb(submitted)
    and outcome->'finalRevision' is not distinct from '2'::jsonb
    and outcome->'workflowRevision' is not distinct from to_jsonb(workflow_revision)
    and outcome->'deliveryAllowed' is not distinct from 'false'::jsonb
    and outcome->'studentDeliveryEnabled' is not distinct from 'false'::jsonb
    and outcome->'creditIssuanceAllowed' is not distinct from 'false'::jsonb
    and outcome->'retakeEnabled' is not distinct from 'false'::jsonb),
  transaction_id bigint not null default txid_current(),
  recorded_at timestamptz not null default clock_timestamp(),
  primary key(student_id,event_id), unique(student_id,actor_revision),
  foreign key(student_id,event_id) references public.nmls_second_final_delivery_events(student_id,event_id),
  foreign key(student_id,reservation_event_id) references public.nmls_second_final_reservation_events(student_id,event_id),
  check(workflow_revision=workflow_before_revision+case when submitted then 1 else 0 end)
);
create unique index nmls_second_final_submission_one_seal on public.nmls_second_final_submission_events(second_id) where submitted;
alter table public.nmls_second_final_submission_events enable row level security;
revoke all on public.nmls_second_final_submission_events from public,anon,authenticated,service_role;
create trigger nmls_second_final_submission_event_immutable before update or delete on public.nmls_second_final_submission_events
  for each row execute function public.nmls_private_final_event_immutable();

-- Neither a standalone039 pause nor a different original answer intent can be
-- adopted. Direct039 cannot even replay a040-owned denied paired pause.
alter function public.nmls_second_final_delivery_commit(uuid,uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb,jsonb)
  rename to nmls_second_final_delivery_pre_submission_internal;
create function public.nmls_second_final_delivery_commit(
  p_student_id uuid,p_attempt_id uuid,p_first_final_id uuid,p_second_final_id uuid,p_event_id uuid,p_command_digest text,
  p_expected_source_revision bigint,p_expected_final_revision bigint,p_expected_workflow_revision bigint,
  p_expected_delivery_revision bigint,p_expected_actor_revision bigint,p_expected_session_id uuid,p_evaluated_at_ms bigint,
  p_definition_digest text,p_definition jsonb,p_transition jsonb
) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants;
begin
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a on a.grant_id=g0.id
    where a.id=p_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status is distinct from 'active'
    or g.expires_at<=clock_timestamp() then raise exception 'nmls_second_final_delivery_access_denied'; end if;
  perform 1 from public.nmls_review_study_leases where student_id=p_student_id for update;
  if exists(select 1 from public.nmls_second_final_submission_events where student_id=p_student_id and event_id=p_event_id) then
    raise exception 'nmls_review_idempotency_conflict'; end if;
  return public.nmls_second_final_delivery_pre_submission_internal(p_student_id,p_attempt_id,p_first_final_id,p_second_final_id,
    p_event_id,p_command_digest,p_expected_source_revision,p_expected_final_revision,p_expected_workflow_revision,
    p_expected_delivery_revision,p_expected_actor_revision,p_expected_session_id,p_evaluated_at_ms,p_definition_digest,p_definition,p_transition);
end $$;

-- Structural/result arithmetic only. The trusted private composer performs
-- canonical semantic grading. SQL does not claim human SME or CE approval.
create function public.nmls_second_final_submission_payload_guard(p_payload jsonb,p_answers jsonb,p_definition jsonb)
returns void language plpgsql set search_path=pg_catalog,public as $$
declare r jsonb:=p_payload->'result'; item jsonb; m jsonb; units jsonb; modules jsonb:='[]'; expected_modules jsonb;
begin
  if jsonb_typeof(p_payload) is distinct from 'object'
    or not(p_payload ?& array['submitted','code','answers','result','terminalStatus'])
    or p_payload-array['submitted','code','answers','result','terminalStatus']<>'{}'::jsonb
    or jsonb_typeof(p_payload->'submitted') is distinct from 'boolean'
    or not coalesce(p_payload->>'code' in ('second_final_submission_allowed','second_final_policy_refused',
      'second_final_session_required','second_final_exposure_review_required'),false) then
    raise exception 'nmls_second_final_submission_invalid_payload'; end if;
  if p_payload->'submitted'='false'::jsonb then
    if p_payload->>'code'='second_final_submission_allowed' or p_payload->'answers' is distinct from 'null'::jsonb
      or r is distinct from 'null'::jsonb or p_payload->'terminalStatus' is distinct from 'null'::jsonb then
      raise exception 'nmls_second_final_submission_denial_payload'; end if;
    return;
  end if;
  if p_payload->>'code' is distinct from 'second_final_submission_allowed' or p_payload->'answers' is distinct from p_answers
    or jsonb_typeof(r) is distinct from 'object'
    or not(r ?& array['mode','passed','correct','total','percent','requiredCorrect','assignedCreditSeconds',
      'creditIssuanceAllowed','courseCompletionIssued','disposition','remediation'])
    or r-array['mode','passed','correct','total','percent','requiredCorrect','assignedCreditSeconds',
      'creditIssuanceAllowed','courseCompletionIssued','disposition','remediation']<>'{}'::jsonb
    or r->>'mode' is distinct from 'private_authoring_review'
    or not public.nmls_final_guard_integer(r->'correct',25,false)
    or r->'total' is distinct from '25'::jsonb or r->'requiredCorrect' is distinct from '18'::jsonb
    or r->'assignedCreditSeconds' is distinct from '0'::jsonb
    or r->'creditIssuanceAllowed' is distinct from 'false'::jsonb
    or r->'courseCompletionIssued' is distinct from 'false'::jsonb
    or r->'passed' is distinct from to_jsonb((r->>'correct')::int>=18)
    or r->'percent' is distinct from to_jsonb((r->>'correct')::int*4)
    or r->>'disposition' is distinct from (case when (r->>'correct')::int>=18 then 'draft_final_passed' else 'staff_review_required' end)
    or p_payload->>'terminalStatus' is distinct from (case when (r->>'correct')::int>=18 then 'passed' else 'staff_review_required' end)
    or jsonb_typeof(r->'remediation') is distinct from 'array' then raise exception 'nmls_second_final_submission_invalid_result'; end if;
  if r->'passed'='true'::jsonb then
    if r->'remediation' is distinct from '[]'::jsonb then raise exception 'nmls_second_final_submission_invalid_result'; end if;
    return;
  end if;
  if jsonb_array_length(r->'remediation')=0 then raise exception 'nmls_second_final_submission_invalid_result'; end if;
  for item in select value from jsonb_array_elements(r->'remediation') loop
    if jsonb_typeof(item) is distinct from 'object' or not(item ?& array['moduleId','title','unitIds','instruction'])
      or item-array['moduleId','title','unitIds','instruction']<>'{}'::jsonb
      or jsonb_typeof(item->'instruction') is distinct from 'string' or length(trim(item->>'instruction')) not between 1 and 4000 then
      raise exception 'nmls_second_final_submission_invalid_result'; end if;
    select value into m from jsonb_array_elements(p_definition->'modules') where value->'id'=item->'moduleId';
    if not found or item->'title' is distinct from m->'title' then raise exception 'nmls_second_final_submission_invalid_result'; end if;
    select jsonb_agg(value->'id' order by n) into units from jsonb_array_elements(p_definition->'units') with ordinality x(value,n)
      where value->'moduleId'=item->'moduleId';
    if item->'unitIds' is distinct from units then raise exception 'nmls_second_final_submission_invalid_result'; end if;
    modules:=modules||jsonb_build_array(item->'moduleId');
  end loop;
  select jsonb_agg(value->'id' order by n) into expected_modules from jsonb_array_elements(p_definition->'modules') with ordinality x(value,n)
    where modules ? (value->>'id');
  if modules is distinct from expected_modules then raise exception 'nmls_second_final_submission_invalid_result'; end if;
end $$;

create function public.nmls_second_final_submission_outcome(p_first uuid,p_second uuid,p_source bigint,p_workflow bigint,
  p_runtime jsonb,p_actor bigint,p_payload jsonb,p_closing jsonb)
returns jsonb language sql immutable set search_path=pg_catalog,public as $$
select jsonb_build_object('ok',p_payload->'submitted',
  'code',case when p_payload->'submitted'='true'::jsonb then 'private_second_final_submitted' else 'private_second_final_submission_refused' end,
  'status',case when p_payload->'submitted'='true'::jsonb then 200 when p_closing->'status'='401'::jsonb then 401 else 409 end,
  'submitted',p_payload->'submitted','firstFinalId',p_first,'secondFinalId',p_second,'sourceRevision',p_source,'finalRevision',2,
  'workflowRevision',p_workflow,'runtimeRevision',p_runtime->'revision','actorRevision',p_actor,'sessionId',p_runtime->'sessionId',
  'submissionCode',p_payload->'code','deliveryCode',p_closing->'code','policyCode',p_closing->'policyCode',
  'observationCode',p_closing->'observationCode','result',p_payload->'result',
  'workflowStatus',case when p_payload->'submitted'='true'::jsonb then p_payload->>'terminalStatus' else 'second_issued' end,
  'mode','private_authoring_review','deliveryAllowed',false,'studentDeliveryEnabled',false,'creditIssuanceAllowed',false,'retakeEnabled',false);
$$;

create function public.nmls_second_final_submission_context(p_student_id uuid,p_attempt_id uuid,p_first_final_id uuid,p_second_final_id uuid,p_event_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare c jsonb; e public.nmls_second_final_submission_events;
begin
  c:=public.nmls_second_final_delivery_context(p_student_id,p_attempt_id,p_first_final_id,p_second_final_id,p_event_id);
  select * into e from public.nmls_second_final_submission_events where student_id=p_student_id and second_id=p_second_final_id and submitted;
  return c||jsonb_build_object(
    'secondSubmissionEvent',(select to_jsonb(r) from public.nmls_second_final_submission_events r where r.student_id=p_student_id and r.event_id=p_event_id),
    'secondSubmissionOrigin',case when e.event_id is null then null else to_jsonb(e) end,
    'secondSubmissionOriginDeliveryEvent',(select to_jsonb(d) from public.nmls_second_final_delivery_events d where d.student_id=p_student_id and d.event_id=e.event_id),
    'serverTimeMs',floor(extract(epoch from clock_timestamp())*1000)::bigint);
end $$;
-- Under-lock metadata replay only. This authenticates the actual039 pair even
-- after the workflow is sealed, without invoking an evaluator or grading.
create function public.nmls_second_final_submission_event_guard(p_actor uuid,p_attempt uuid,p_first uuid,p_second uuid,
  p_event uuid,p_definition_digest text,p_definition jsonb,p_at bigint)
returns jsonb language plpgsql set search_path=pg_catalog,public as $$
declare e public.nmls_second_final_submission_events; d public.nmls_second_final_delivery_events;
  w public.nmls_private_remediations; checked jsonb; payload jsonb; expected jsonb; intent jsonb;
begin
  select * into e from public.nmls_second_final_submission_events where student_id=p_actor and event_id=p_event;
  select * into d from public.nmls_second_final_delivery_events where student_id=p_actor and event_id=p_event;
  select * into w from public.nmls_private_remediations where first_final_id=p_first;
  if e.event_id is null or d.event_id is null or e.review_attempt_id is distinct from p_attempt
    or e.first_final_id is distinct from p_first or e.second_id is distinct from p_second
    or e.definition_digest is distinct from p_definition_digest or e.delivery_command_digest is distinct from d.command_digest
    or e.reservation_event_id is distinct from d.reservation_event_id
    or d.review_attempt_id is distinct from p_attempt or d.first_final_id is distinct from p_first or d.second_id is distinct from p_second
    or d.source_revision is distinct from e.source_revision or d.final_revision is distinct from 2
    or d.workflow_revision is distinct from e.workflow_before_revision
    or d.delivery_revision is distinct from e.delivery_revision or d.actor_revision is distinct from e.actor_revision
    or d.transaction_id is distinct from e.transaction_id or d.command->>'kind' is distinct from 'pause'
    or e.session_id::text is distinct from d.runtime->>'sessionId'
    or d.runtime->'sessionId' is distinct from d.runtime_before->'sessionId'
    or e.workflow_revision is distinct from e.workflow_before_revision+(case when e.submitted then 1 else 0 end)
    or w.revision<e.workflow_revision or not isfinite(e.recorded_at)
    or abs(floor(extract(epoch from e.recorded_at)*1000)::bigint-(d.runtime->>'lastReceiptMs')::bigint)>1000 then
    raise exception 'nmls_second_final_submission_history_conflict'; end if;
  checked:=public.nmls_second_final_delivery_pre_submission_internal(p_actor,p_attempt,p_first,p_second,p_event,
    e.delivery_command_digest,e.source_revision,2,e.workflow_before_revision,e.delivery_revision-1,e.actor_revision-1,
    (d.runtime_before->>'sessionId')::uuid,p_at,p_definition_digest,p_definition,'{}'::jsonb);
  if checked is distinct from jsonb_build_object('duplicate',true,'outcome',d.outcome,'runtime',d.runtime,
    'sourceRevision',d.source_revision,'workflowRevision',d.workflow_revision) then
    raise exception 'nmls_second_final_submission_history_conflict'; end if;
  if e.submitted then
    if w.status not in ('passed','staff_review_required') or w.revision is distinct from e.workflow_revision
      or not isfinite(w.second_submitted_at)
      or w.second_submitted_at<w.second_issued_at
      or abs(floor(extract(epoch from w.second_submitted_at)*1000)::bigint-(d.runtime->>'lastReceiptMs')::bigint)>1000
      or d.outcome->'ok' is distinct from 'true'::jsonb or d.outcome->'status' is distinct from '200'::jsonb
      or d.outcome->>'code' is distinct from 'final_paused' or d.outcome->>'policyCode' is distinct from 'session_policy_allowed'
      or d.outcome->>'observationCode' is distinct from 'receipt_continuous'
      or d.runtime_before->>'status' is distinct from 'active' or d.runtime->>'status' is distinct from 'paused'
      or d.runtime->'lastActivityMs' is distinct from d.runtime_before->'lastActivityMs'
      or d.audit#>'{observation,firstAcknowledgment}' is distinct from 'false'::jsonb
      or d.command#>'{studyReceipt,visible}' is distinct from 'true'::jsonb
      or d.command#>'{studyReceipt,windowId}' is distinct from d.audit#>'{observation,windowBefore,id}'
      or not public.nmls_final_guard_integer(d.audit#>'{observation,windowBefore,lastObservedAtMs}',(d.runtime->>'lastReceiptMs')::bigint,false) then
      raise exception 'nmls_second_final_submission_history_conflict'; end if;
    payload:=jsonb_build_object('submitted',true,'code','second_final_submission_allowed',
      'answers',w.second_answers,'result',w.second_result,'terminalStatus',w.status);
    intent:=d.command||jsonb_build_object('kind','submit_second_final','attemptId',p_attempt,'firstFinalId',p_first,'secondFinalId',p_second,
      'expectedSourceRevision',e.source_revision,'expectedFinalRevision',2,'expectedWorkflowRevision',e.workflow_before_revision,
      'answers',w.second_answers);
    if public.nmls_first_final_submission_hash(intent) is distinct from e.command_digest then
      raise exception 'nmls_second_final_submission_history_conflict'; end if;
  else
    payload:=jsonb_build_object('submitted',false,'code',e.outcome->'submissionCode','answers',null,'result',null,'terminalStatus',null);
    if (d.outcome->'ok' is distinct from 'true'::jsonb or d.outcome->'status' is distinct from '200'::jsonb
      or d.outcome->>'code' is distinct from 'final_paused' or d.outcome->>'policyCode' is distinct from 'session_policy_allowed'
      or d.outcome->>'observationCode' is distinct from 'receipt_continuous')
      is distinct from (e.outcome->>'submissionCode'='second_final_policy_refused') then
      raise exception 'nmls_second_final_submission_history_conflict'; end if;
  end if;
  perform public.nmls_second_final_submission_payload_guard(payload,coalesce(w.second_answers,'{}'::jsonb),p_definition);
  expected:=public.nmls_second_final_submission_outcome(p_first,p_second,e.source_revision,e.workflow_revision,d.runtime,e.actor_revision,payload,d.outcome);
  if public.nmls_first_final_submission_hash(payload) is distinct from e.submission_payload_digest or e.outcome is distinct from expected then
    raise exception 'nmls_second_final_submission_history_conflict'; end if;
  return e.outcome;
end $$;

create function public.nmls_second_final_submission_commit(
  p_student_id uuid,p_attempt_id uuid,p_first_final_id uuid,p_second_final_id uuid,p_event_id uuid,p_command_digest text,
  p_expected_source_revision bigint,p_expected_final_revision bigint,p_expected_workflow_revision bigint,
  p_expected_delivery_revision bigint,p_expected_actor_revision bigint,p_expected_session_id uuid,p_evaluated_at_ms bigint,
  p_definition_digest text,p_definition jsonb,p_intent jsonb,p_transition jsonb
) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants; b public.nmls_review_policy_bindings; a public.nmls_review_attempts;
  lease public.nmls_review_study_leases; l public.nmls_review_actor_policy; f public.nmls_private_finals;
  first_delivery public.nmls_first_final_deliveries; w public.nmls_private_remediations; d public.nmls_second_final_deliveries;
  e public.nmls_second_final_submission_events; seal public.nmls_second_final_submission_events;
  de public.nmls_second_final_delivery_events; seal_de public.nmls_second_final_delivery_events;
  origin jsonb; phase jsonb; command_value jsonb; payload jsonb; closing jsonb; next_runtime jsonb; next_ledger jsonb;
  old_runtime jsonb; old_window jsonb; scope jsonb; outcome_value jsonb; checked jsonb; field text; keys text[];
  derived_digest text; submission_code text; submitted_value boolean; session_ok boolean; numeric_ok boolean;
  at_ms bigint; opening_ms bigint; cutoff_ms bigint; deadline_ms bigint; boundary_ms bigint; since_break_ms bigint; rolling_ms bigint;
  observed jsonb; combined jsonb;
begin
  if p_student_id is null or p_attempt_id is null or p_first_final_id is null or p_second_final_id is null or p_event_id is null
    or not coalesce(p_command_digest ~ '^[a-f0-9]{64}$',false) or not coalesce(p_definition_digest ~ '^[a-f0-9]{64}$',false) then
    raise exception 'nmls_second_final_submission_invalid_command'; end if;
  keys:=array['kind','attemptId','firstFinalId','secondFinalId','eventId','expectedSourceRevision','expectedFinalRevision',
    'expectedWorkflowRevision','expectedRevision','expectedActorRevision','sessionId','answers'];
  if p_intent ? 'studyReceipt' then keys:=keys||array['studyReceipt']; end if;
  if jsonb_typeof(p_intent) is distinct from 'object' or not(p_intent ?& keys) or p_intent-keys<>'{}'::jsonb
    or p_intent->>'kind' is distinct from 'submit_second_final' or p_intent->>'attemptId' is distinct from p_attempt_id::text
    or p_intent->>'firstFinalId' is distinct from p_first_final_id::text or p_intent->>'secondFinalId' is distinct from p_second_final_id::text
    or p_intent->>'eventId' is distinct from p_event_id::text
    or p_intent->'expectedSourceRevision' is distinct from to_jsonb(p_expected_source_revision)
    or p_intent->'expectedFinalRevision' is distinct from '2'::jsonb or p_expected_final_revision is distinct from 2
    or p_intent->'expectedWorkflowRevision' is distinct from to_jsonb(p_expected_workflow_revision)
    or p_intent->'expectedRevision' is distinct from to_jsonb(p_expected_delivery_revision)
    or p_intent->'expectedActorRevision' is distinct from to_jsonb(p_expected_actor_revision)
    or p_intent->'sessionId' is distinct from coalesce(to_jsonb(p_expected_session_id),'null'::jsonb)
    or jsonb_typeof(p_intent->'answers') is distinct from 'object'
    or public.nmls_first_final_submission_hash(p_intent) is distinct from p_command_digest then
    raise exception 'nmls_second_final_submission_invalid_intent'; end if;
  foreach field in array array['expectedSourceRevision','expectedFinalRevision','expectedWorkflowRevision','expectedRevision','expectedActorRevision'] loop
    if not public.nmls_final_guard_integer(p_intent->field,9007199254740991,false) then
      raise exception 'nmls_second_final_submission_invalid_intent'; end if;
  end loop;
  if p_intent ? 'studyReceipt' and (jsonb_typeof(p_intent->'studyReceipt') is distinct from 'object'
    or not((p_intent->'studyReceipt') ?& array['windowId','visible'])
    or (p_intent->'studyReceipt')-array['windowId','visible']<>'{}'::jsonb
    or not coalesce(p_intent#>>'{studyReceipt,windowId}' ~* '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false)
    or jsonb_typeof(p_intent#>'{studyReceipt,visible}') is distinct from 'boolean') then
    raise exception 'nmls_second_final_submission_invalid_intent'; end if;
  command_value:=(p_intent-array['attemptId','firstFinalId','secondFinalId','expectedSourceRevision','expectedFinalRevision',
    'expectedWorkflowRevision','answers'])||jsonb_build_object('kind','pause');
  derived_digest:=public.nmls_first_final_submission_hash(command_value||jsonb_build_object('attemptId',p_attempt_id,'firstFinalId',p_first_final_id,
    'secondFinalId',p_second_final_id,'expectedSourceRevision',p_expected_source_revision,'expectedFinalRevision',2,
    'expectedWorkflowRevision',p_expected_workflow_revision));
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a0 on a0.grant_id=g0.id
    where a0.id=p_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status is distinct from 'active' or g.expires_at<=clock_timestamp() then
    raise exception 'nmls_second_final_submission_access_denied'; end if;
  select * into lease from public.nmls_review_study_leases where student_id=p_student_id for update;
  select * into l from public.nmls_review_actor_policy where student_id=p_student_id for update;
  select * into a from public.nmls_review_attempts where id=p_attempt_id for update;
  select * into f from public.nmls_private_finals where id=p_first_final_id for update;
  select * into first_delivery from public.nmls_first_final_deliveries where final_id=p_first_final_id for update;
  select * into w from public.nmls_private_remediations where first_final_id=p_first_final_id for update;
  select * into d from public.nmls_second_final_deliveries where second_id=p_second_final_id for update;
  select * into b from public.nmls_review_policy_bindings where grant_id=g.id;
  origin:=public.nmls_second_final_delivery_origin_guard(p_student_id,p_attempt_id,p_first_final_id,p_second_final_id,
    p_definition_digest,p_definition,p_evaluated_at_ms);
  if a.student_id is distinct from p_student_id or w.student_id is distinct from p_student_id or w.review_attempt_id is distinct from a.id
    or w.second_id is distinct from p_second_final_id or l.student_id is null or lease.student_id is null
    or w.runtime is distinct from origin->'runtime' then raise exception 'nmls_second_final_submission_scope_changed'; end if;
  phase:=jsonb_build_object('version','nmls-second-final-phase-v1','actorId',p_student_id,'reviewAttemptId',a.id,
    'firstFinalAttemptId',f.id,'finalAttemptId',w.second_id,'courseKey',a.course_key,'contentDigest',a.content_digest,
    'definitionDigest',p_definition_digest,'selectionDigest',origin->>'selection_digest','offeringId',g.id);
  if d.second_id is not null and (d.student_id is distinct from p_student_id or d.review_attempt_id is distinct from a.id
    or d.first_final_id is distinct from f.id or d.phase_scope is distinct from phase
    or d.runtime->'revision' is distinct from to_jsonb(d.revision)) then raise exception 'nmls_second_final_submission_scope_changed'; end if;
  if (select count(*) from jsonb_object_keys(p_intent->'answers'))<>25
    or exists(select 1 from jsonb_each(p_intent->'answers') x where jsonb_typeof(x.value) is distinct from 'string'
      or not coalesce(x.value#>>'{}' in ('A','B','C','D'),false) or not(w.second_selection->'questionIds' ? x.key)) then
    raise exception 'nmls_second_final_submission_invalid_answers'; end if;
  -- Any current terminal result must belong to this paired040 history. A
  -- standalone old028 seal or orphan039 close is never adopted.
  select s.* into seal from public.nmls_second_final_submission_events s where s.second_id=w.second_id and s.submitted;
  if w.status in ('passed','staff_review_required') then
    if seal.event_id is null then raise exception 'nmls_second_final_submission_history_conflict'; end if;
    perform public.nmls_second_final_submission_event_guard(p_student_id,a.id,f.id,w.second_id,seal.event_id,p_definition_digest,p_definition,p_evaluated_at_ms);
    select * into seal_de from public.nmls_second_final_delivery_events where student_id=p_student_id and event_id=seal.event_id;
    if d.second_id is null or d.revision is distinct from seal.delivery_revision or d.runtime is distinct from seal_de.runtime
      or to_jsonb(lease) is distinct from seal_de.lease_after then raise exception 'nmls_second_final_submission_history_conflict'; end if;
  elsif w.status is distinct from 'second_issued' or seal.event_id is not null or w.second_answers is not null
    or w.second_result is not null or w.second_submitted_at is not null then raise exception 'nmls_second_final_submission_history_conflict'; end if;
  select * into e from public.nmls_second_final_submission_events where student_id=p_student_id and event_id=p_event_id;
  select * into de from public.nmls_second_final_delivery_events where student_id=p_student_id and event_id=p_event_id;
  if e.event_id is not null or de.event_id is not null then
    if e.event_id is null or de.event_id is null or e.command_digest is distinct from p_command_digest
      or e.delivery_command_digest is distinct from derived_digest or e.source_revision is distinct from p_expected_source_revision
      or e.workflow_before_revision is distinct from p_expected_workflow_revision
      or e.delivery_revision-1 is distinct from p_expected_delivery_revision or e.actor_revision-1 is distinct from p_expected_actor_revision
      or de.runtime_before->>'sessionId' is distinct from p_expected_session_id::text
      or e.submitted and w.second_answers is distinct from p_intent->'answers' then
      raise exception 'nmls_second_final_submission_idempotency_conflict'; end if;
    checked:=public.nmls_second_final_submission_event_guard(p_student_id,a.id,f.id,w.second_id,e.event_id,
      p_definition_digest,p_definition,p_evaluated_at_ms);
    return jsonb_build_object('duplicate',true,'outcome',checked);
  end if;
  if w.status is distinct from 'second_issued' then raise exception 'nmls_second_final_submission_already_submitted'; end if;
  if a.revision is distinct from p_expected_source_revision or w.revision is distinct from p_expected_workflow_revision
    or coalesce(d.revision,0) is distinct from p_expected_delivery_revision or l.revision is distinct from p_expected_actor_revision then
    raise exception 'nmls_review_revision_conflict'; end if;
  if d.runtime->>'sessionId' is distinct from p_expected_session_id::text then raise exception 'nmls_review_session_conflict'; end if;
  if exists(select 1 from public.nmls_review_attempt_events x join public.nmls_review_attempts y on y.id=x.attempt_id
      where y.student_id=p_student_id and x.event_id=p_event_id)
    or exists(select 1 from public.nmls_review_actor_policy_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_private_final_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_private_remediation_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_teaching_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_final_reservation_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_first_final_delivery_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_first_final_submission_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_first_final_handoff_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_second_final_reservation_events where student_id=p_student_id and event_id=p_event_id) then
    raise exception 'nmls_review_idempotency_conflict'; end if;
  if jsonb_typeof(p_transition) is distinct from 'object' or not(p_transition ?& array['phase','command','runtime','ledger','outcome','audit','submission'])
    or p_transition-array['phase','command','runtime','ledger','outcome','audit','submission']<>'{}'::jsonb
    or p_transition->'phase' is distinct from phase or p_transition->'command' is distinct from command_value then
    raise exception 'nmls_second_final_submission_invalid_transition'; end if;
  payload:=p_transition->'submission'; next_runtime:=p_transition->'runtime'; next_ledger:=p_transition->'ledger';
  perform public.nmls_second_final_submission_payload_guard(payload,p_intent->'answers',p_definition);
  old_runtime:=case when d.second_id is not null then d.runtime else jsonb_build_object(
    'version','nmls-second-final-delivery-v1','finalAttemptId',w.second_id,'phaseDigest',public.nmls_first_final_submission_hash(phase),
    'revision',0,'status','reserved','sessionId',null,'lastActivityMs',null,'lastReceiptMs',0,'creditIssuanceAllowed',false) end;
  old_window:=l.ledger#>'{observationJournal,active}';
  closing:=public.nmls_second_final_delivery_pre_submission_internal(p_student_id,a.id,f.id,w.second_id,p_event_id,derived_digest,
    p_expected_source_revision,2,p_expected_workflow_revision,p_expected_delivery_revision,p_expected_actor_revision,
    p_expected_session_id,p_evaluated_at_ms,p_definition_digest,p_definition,p_transition-'submission');
  if closing is distinct from jsonb_build_object('duplicate',false,'outcome',p_transition->'outcome','runtime',next_runtime,
    'sourceRevision',a.revision,'workflowRevision',w.revision) then raise exception 'nmls_second_final_submission_idempotency_conflict'; end if;
  scope:=jsonb_build_object('actorId',p_student_id,'attemptId',a.id,'offeringId',g.id,'contentDigest',a.content_digest,
    'sessionId',old_runtime->'sessionId','finalPhase',phase);
  session_ok:=coalesce(old_runtime->>'status'='active' and old_runtime->>'sessionId' is not null
    and old_runtime->>'sessionId'=p_expected_session_id::text
    and jsonb_typeof(old_window)='object' and old_window->'scope'=scope
    and old_window->>'materialDigest'=phase->>'selectionDigest' and old_window->'runtimeRevision'=old_runtime->'revision'
    and public.nmls_final_guard_integer(old_window->'lastObservedAtMs',p_evaluated_at_ms,false)
    and command_value#>'{studyReceipt,windowId}'=old_window->'id' and command_value#>'{studyReceipt,visible}'='true'::jsonb
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
    or closing#>>'{outcome,observationCode}' is distinct from 'receipt_continuous' then submission_code:='second_final_policy_refused';
  elsif not session_ok then submission_code:='second_final_session_required';
  elsif not numeric_ok then submission_code:='second_final_exposure_review_required';
  else submission_code:='second_final_submission_allowed'; end if;
  submitted_value:=submission_code='second_final_submission_allowed';
  if payload->>'code' is distinct from submission_code or payload->'submitted' is distinct from to_jsonb(submitted_value) then
    raise exception 'nmls_second_final_submission_decision_conflict'; end if;

  if submitted_value then
    at_ms:=floor(extract(epoch from clock_timestamp())*1000);
    if at_ms>=deadline_ms then raise exception 'nmls_review_clock_refresh_required'; end if;
    update public.nmls_private_remediations set revision=w.revision+1,status=payload->>'terminalStatus',
      second_answers=p_intent->'answers',second_result=payload->'result',second_submitted_at=clock_timestamp()
      where first_final_id=w.first_final_id;
  end if;
  outcome_value:=public.nmls_second_final_submission_outcome(f.id,w.second_id,a.revision,
    w.revision+case when submitted_value then 1 else 0 end,next_runtime,(next_ledger->>'revision')::bigint,payload,closing->'outcome');
  insert into public.nmls_second_final_submission_events(student_id,event_id,first_final_id,second_id,review_attempt_id,reservation_event_id,
    command_digest,delivery_command_digest,definition_digest,source_revision,final_revision,workflow_before_revision,workflow_revision,
    delivery_revision,actor_revision,session_id,submitted,submission_payload_digest,outcome)
    values(p_student_id,p_event_id,f.id,w.second_id,a.id,(origin->>'event_id')::uuid,p_command_digest,derived_digest,p_definition_digest,a.revision,2,
      w.revision,w.revision+case when submitted_value then 1 else 0 end,(next_runtime->>'revision')::bigint,(next_ledger->>'revision')::bigint,
      (next_runtime->>'sessionId')::uuid,submitted_value,public.nmls_first_final_submission_hash(payload),outcome_value);
  -- No lease update follows sealing:039's same-transaction trigger requires
  -- second_issued. The dormant second marker stays sticky after either result.
  at_ms:=floor(extract(epoch from clock_timestamp())*1000);
  if g.expires_at<=clock_timestamp() then raise exception 'nmls_second_final_submission_access_denied'; end if;
  if p_evaluated_at_ms is null or p_evaluated_at_ms>at_ms+1000 or at_ms-p_evaluated_at_ms>1000
    or (at_ms<opening_ms) is distinct from (p_evaluated_at_ms<opening_ms)
    or (at_ms>=cutoff_ms) is distinct from (p_evaluated_at_ms>=cutoff_ms)
    or old_runtime->>'status'='active' and p_evaluated_at_ms<(old_runtime->>'lastActivityMs')::bigint+360000
      and at_ms>=(old_runtime->>'lastActivityMs')::bigint+360000
    or p_evaluated_at_ms<(old_window->>'horizonMs')::bigint and at_ms>=(old_window->>'horizonMs')::bigint
    or p_evaluated_at_ms<(l.ledger->>'sessionStartedAtMs')::bigint+43200000
      and at_ms>=(l.ledger->>'sessionStartedAtMs')::bigint+43200000
    or submitted_value and at_ms>=deadline_ms then raise exception 'nmls_review_clock_refresh_required'; end if;
  return jsonb_build_object('duplicate',false,'outcome',outcome_value);
end $$;

revoke all on function
  public.nmls_second_final_delivery_pre_submission_internal(uuid,uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb,jsonb),
  public.nmls_second_final_delivery_commit(uuid,uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb,jsonb),
  public.nmls_second_final_submission_payload_guard(jsonb,jsonb,jsonb),
  public.nmls_second_final_submission_outcome(uuid,uuid,bigint,bigint,jsonb,bigint,jsonb,jsonb),
  public.nmls_second_final_submission_event_guard(uuid,uuid,uuid,uuid,uuid,text,jsonb,bigint),
  public.nmls_second_final_submission_context(uuid,uuid,uuid,uuid,uuid),
  public.nmls_second_final_submission_commit(uuid,uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb,jsonb,jsonb)
  from public,anon,authenticated,service_role;
grant execute on function
  public.nmls_second_final_delivery_commit(uuid,uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb,jsonb),
  public.nmls_second_final_submission_context(uuid,uuid,uuid,uuid,uuid),
  public.nmls_second_final_submission_commit(uuid,uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb,jsonb,jsonb) to service_role;
commit;
