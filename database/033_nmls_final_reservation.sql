-- LOCAL PRIVATE AUTHORING ONLY. Reserve one immutable first form, never expose
-- questions, start an exam session, grade, create remediation or award credit.
-- The source check_access transition and its actor ledger are committed by032
-- in THIS transaction. Existing026 policy-bound issue/submit refusals remain.
begin;

create table public.nmls_final_reservation_events (
  student_id uuid not null references public.students(id),
  event_id uuid not null,
  review_attempt_id uuid not null references public.nmls_review_attempts(id),
  command_digest text not null check (command_digest ~ '^[a-f0-9]{64}$'),
  definition_digest text not null check (definition_digest ~ '^[a-f0-9]{64}$'),
  source_revision bigint not null check (source_revision > 0),
  actor_revision bigint not null check (actor_revision > 0),
  reserved boolean not null,
  final_id uuid references public.nmls_private_finals(id),
  selection_digest text,
  outcome jsonb not null,
  recorded_at timestamptz not null default clock_timestamp(),
  primary key(student_id,event_id),
  foreign key(student_id,event_id) references public.nmls_teaching_events(student_id,event_id),
  check ((reserved and final_id is not null and selection_digest is not null and selection_digest ~ '^[a-f0-9]{64}$')
    or (not reserved and final_id is null and selection_digest is null)),
  check (jsonb_typeof(outcome) is not distinct from 'object'
    and outcome ?& array['ok','code','status','reserved','finalAttemptId','finalRevision','sourceRevision','actorRevision',
      'mode','studentDeliveryEnabled','creditIssuanceAllowed']
    and outcome-array['ok','code','status','reserved','finalAttemptId','finalRevision','sourceRevision','actorRevision',
      'mode','studentDeliveryEnabled','creditIssuanceAllowed']='{}'::jsonb
    and outcome->'ok' is not distinct from to_jsonb(reserved)
    and outcome->'reserved' is not distinct from to_jsonb(reserved)
    and outcome->'finalAttemptId' is not distinct from coalesce(to_jsonb(final_id),'null'::jsonb)
    and outcome->'finalRevision' is not distinct from (case when reserved then '1'::jsonb else 'null'::jsonb end)
    and outcome->'sourceRevision' is not distinct from to_jsonb(source_revision)
    and outcome->'actorRevision' is not distinct from to_jsonb(actor_revision)
    and outcome->>'mode' is not distinct from 'private_authoring_review'
    and outcome->'studentDeliveryEnabled' is not distinct from 'false'::jsonb
    and outcome->'creditIssuanceAllowed' is not distinct from 'false'::jsonb
    and ((reserved and outcome->>'code' is not distinct from 'private_final_reserved'
        and outcome->'status' is not distinct from '200'::jsonb)
      or (not reserved and coalesce(outcome->>'code' in ('delivery_not_open','delivery_window_closed',
        'rocs_document_unverified','rocs_required','break_in_progress','session_required','session_wall_limit',
        'mandatory_break_required','rolling_study_limit'),false)
        and outcome->'status' is not distinct from '409'::jsonb)))
);
create unique index nmls_final_reservation_one_form on public.nmls_final_reservation_events(final_id) where reserved;
alter table public.nmls_final_reservation_events enable row level security;
revoke all on public.nmls_final_reservation_events from public,anon,authenticated,service_role;
create trigger nmls_final_reservation_event_immutable before update or delete on public.nmls_final_reservation_events
  for each row execute function public.nmls_private_final_event_immutable();

create function public.nmls_final_reservation_context(p_student_id uuid,p_attempt_id uuid,p_event_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare ctx jsonb; a public.nmls_review_attempts; f public.nmls_private_finals;
  r public.nmls_final_reservation_events; e public.nmls_teaching_events;
begin
  ctx:=public.nmls_teaching_context(p_student_id,p_attempt_id,'source',p_attempt_id);
  select * into a from public.nmls_review_attempts where id=p_attempt_id and student_id=p_student_id;
  if not found then raise exception 'nmls_final_access_denied'; end if;
  select * into f from public.nmls_private_finals where student_id=p_student_id and course_key=a.course_key;
  select * into r from public.nmls_final_reservation_events where student_id=p_student_id and event_id=p_event_id;
  select * into e from public.nmls_teaching_events where student_id=p_student_id and event_id=p_event_id;
  -- Advisory reads may race. Pair consistency and form ownership are resolved
  -- only under the commit locks, not by adopting these snapshots as authority.
  return ctx||jsonb_build_object('reservedFinal',case when f.id is null then null else to_jsonb(f) end,
    'reservation',case when r.event_id is null then null else to_jsonb(r) end,
    'teachingEvent',case when e.event_id is null then null else to_jsonb(e) end);
end $$;

create function public.nmls_final_reservation_commit(
  p_student_id uuid,p_attempt_id uuid,p_event_id uuid,p_command_digest text,
  p_expected_source_revision bigint,p_expected_actor_revision bigint,p_expected_session_id uuid,
  p_evaluated_at_ms bigint,p_definition_digest text,p_final_id uuid,p_selection jsonb,p_transition jsonb
) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants; b public.nmls_review_policy_bindings; a public.nmls_review_attempts;
  lease public.nmls_review_study_leases; l public.nmls_review_actor_policy; f public.nmls_private_finals;
  r public.nmls_final_reservation_events; e public.nmls_teaching_events; pin public.nmls_teaching_phase_bindings;
  runtime jsonb; ledger jsonb; result jsonb; audit jsonb; phase jsonb; outcome jsonb; committed jsonb;
  observed jsonb; combined jsonb; item jsonb; selected_digest text; field text;
  at_ms bigint; opening_ms bigint; cutoff_ms bigint; deadline_ms bigint; boundary_ms bigint;
  rolling_ms bigint; since_break_ms bigint; reserved boolean; outside_window boolean;
begin
  if p_student_id is null or p_attempt_id is null or p_event_id is null
    or not coalesce(p_command_digest ~ '^[a-f0-9]{64}$',false)
    or not coalesce(p_definition_digest ~ '^[a-f0-9]{64}$',false) then raise exception 'nmls_final_invalid_command'; end if;
  -- Same ordering as032. Nested acquisition by this transaction is reentrant.
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a0 on a0.grant_id=g0.id
    where a0.id=p_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status is distinct from 'active'
    or g.expires_at<=clock_timestamp() then raise exception 'nmls_final_access_denied'; end if;
  select * into b from public.nmls_review_policy_bindings where grant_id=g.id;
  if not found then raise exception 'nmls_review_policy_binding_required'; end if;
  select * into lease from public.nmls_review_study_leases where student_id=p_student_id for update;
  select * into l from public.nmls_review_actor_policy where student_id=p_student_id for update;
  select * into a from public.nmls_review_attempts where id=p_attempt_id for update;
  if a.student_id is distinct from p_student_id or g.expires_at<=clock_timestamp() then raise exception 'nmls_final_access_denied'; end if;
  if a.course_key is distinct from g.course_key or a.content_digest is distinct from g.content_digest
    or b.offering->>'contentDigest' is distinct from a.content_digest then raise exception 'nmls_review_content_changed'; end if;
  if l.student_id is null or l.policy_id is distinct from b.policy_id or l.policy_digest is distinct from b.policy_digest then
    raise exception 'nmls_review_policy_version_conflict'; end if;
  select * into f from public.nmls_private_finals where student_id=p_student_id and course_key=a.course_key for update;
  if f.id is not null and (f.review_attempt_id is distinct from a.id or f.content_digest is distinct from a.content_digest
    or f.definition_digest is distinct from p_definition_digest) then raise exception 'nmls_final_history_scope_conflict'; end if;
  select * into r from public.nmls_final_reservation_events where student_id=p_student_id and event_id=p_event_id;
  select * into e from public.nmls_teaching_events where student_id=p_student_id and event_id=p_event_id;
  -- One reservation is one actor event mirrored by an immutable receipt, not
  -- an extra026 event. A prior teaching event cannot be retrofitted with a form.
  if r.event_id is not null or e.event_id is not null then
    if r.event_id is null or e.event_id is null or r.review_attempt_id is distinct from a.id
      or r.command_digest is distinct from p_command_digest or r.definition_digest is distinct from p_definition_digest
      or e.command_digest is distinct from r.command_digest or e.review_attempt_id is distinct from a.id
      or e.phase_kind is distinct from 'source' or e.phase_owner_id is distinct from a.id or e.workflow_revision is not null
      or e.source_revision is distinct from r.source_revision or e.runtime_revision is distinct from r.source_revision
      or e.actor_revision is distinct from r.actor_revision or a.revision<r.source_revision or l.revision<r.actor_revision
      or e.audit#>>'{review,kind}' is distinct from 'check_access' or e.audit#>>'{policy,kind}' is distinct from 'check_access'
      or e.outcome->'deliveryAllowed' is distinct from 'false'::jsonb
      or e.outcome->'deliveryUntilMs' is distinct from 'null'::jsonb or e.outcome->'studyWindow' is distinct from 'null'::jsonb
      or e.outcome#>'{progress,lessons}' is distinct from '[]'::jsonb or e.outcome#>'{progress,quiz}' is distinct from 'null'::jsonb
      or e.outcome#>'{progress,feedback}' is distinct from 'null'::jsonb then raise exception 'nmls_final_idempotency_conflict'; end if;
    if r.reserved then
      if f.id is null or f.id is distinct from r.final_id or f.selection->>'id' is distinct from f.id::text
        or f.selection->>'reviewAttemptId' is distinct from a.id::text or f.selection->>'definitionDigest' is distinct from r.definition_digest
        or f.selection->'number' is distinct from '1'::jsonb
        or encode(sha256(convert_to(public.nmls_teaching_canonical(f.selection),'UTF8')),'hex') is distinct from r.selection_digest
        or e.outcome->'ok' is distinct from 'true'::jsonb or e.outcome->>'policyCode' is distinct from 'session_policy_allowed'
        or e.outcome->'observationReady' is distinct from 'true'::jsonb then raise exception 'nmls_final_idempotency_conflict'; end if;
    elsif e.outcome->'ok' is distinct from 'false'::jsonb or r.outcome->'code' is distinct from e.outcome->'code'
      or r.outcome->'status' is distinct from e.outcome->'status' then raise exception 'nmls_final_idempotency_conflict'; end if;
    return jsonb_build_object('duplicate',true,'outcome',r.outcome);
  end if;
  if exists(select 1 from public.nmls_review_attempt_events x join public.nmls_review_attempts y on y.id=x.attempt_id
      where y.student_id=p_student_id and x.event_id=p_event_id)
    or exists(select 1 from public.nmls_review_actor_policy_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_private_final_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_private_remediation_events where student_id=p_student_id and event_id=p_event_id) then
    raise exception 'nmls_final_idempotency_conflict'; end if;
  if f.id is not null then raise exception 'nmls_final_already_issued'; end if;
  if a.revision is distinct from p_expected_source_revision or (a.runtime->>'revision')::bigint is distinct from p_expected_source_revision
    or l.revision is distinct from p_expected_actor_revision then raise exception 'nmls_final_revision_conflict'; end if;
  if lease.student_id is null or lease.attempt_id is distinct from a.id or lease.phase_kind is distinct from 'source'
    or lease.phase_owner_id is distinct from a.id or lease.phase_active is distinct from false
    or p_expected_session_id is null or lease.session_id is distinct from p_expected_session_id
    or a.runtime->>'sessionId' is distinct from p_expected_session_id::text then raise exception 'nmls_review_session_conflict'; end if;
  if a.runtime->>'status' is distinct from 'review_complete' or a.runtime->'current' is distinct from 'null'::jsonb
    or a.runtime->'quiz' is distinct from 'null'::jsonb or coalesce(a.runtime->'bookmark','null'::jsonb)<>'null'::jsonb
    or coalesce(a.runtime->'quizReservation','null'::jsonb)<>'null'::jsonb then raise exception 'nmls_final_review_prerequisites'; end if;
  select * into pin from public.nmls_teaching_phase_bindings where student_id=p_student_id and review_attempt_id=a.id
    and phase_kind='source' and phase_owner_id=a.id;
  if not found then raise exception 'nmls_teaching_history_requires_reconciliation'; end if;
  if jsonb_typeof(p_transition) is distinct from 'object'
    or not (p_transition ?& array['phase','teachingDigest','layout','initialLedger','ledger','runtime','outcome','audit','deliveryUntilMs'])
    or p_transition-array['phase','teachingDigest','layout','initialLedger','ledger','runtime','outcome','audit','deliveryUntilMs']<>'{}'::jsonb then
    raise exception 'nmls_final_invalid_transition'; end if;
  phase:=p_transition->'phase'; ledger:=p_transition->'ledger'; runtime:=p_transition->'runtime';
  result:=p_transition->'outcome'; audit:=p_transition->'audit';
  if jsonb_typeof(result) is distinct from 'object' or jsonb_typeof(result->'progress') is distinct from 'object'
    or result-array['ok','code','status','progress','actorRevision','policyCode','observationReady','deliveryAllowed',
      'deliveryUntilMs','resumeNotBeforeMs','teachingPhaseComplete','observationCode','studyWindow','studyRecovery']<>'{}'::jsonb
    or (result->'progress')-array['mode','creditIssuanceAllowed','courseKey','title','contentDigest','revision','status',
      'sessionId','completedUnitIds','passedModuleIds','completedReviewMs','provisionalReviewMs','currentUnitId','resumeRequired',
      'currentUnitActionComplete','modules','lessons','quiz','feedback','notice']<>'{}'::jsonb
    or phase is distinct from pin.phase_scope or p_transition->>'teachingDigest' is distinct from a.content_digest
    or p_transition->'layout' is distinct from pin.layout or p_transition->'deliveryUntilMs' is distinct from 'null'::jsonb
    or audit#>>'{review,kind}' is distinct from 'check_access' or audit#>>'{policy,kind}' is distinct from 'check_access'
    or audit#>'{review,atMs}' is distinct from to_jsonb(p_evaluated_at_ms)
    or audit#>'{policy,atMs}' is distinct from to_jsonb(p_evaluated_at_ms)
    or audit#>>'{policy,actorId}' is distinct from p_student_id::text or audit#>>'{policy,offeringId}' is distinct from g.id::text
    or audit#>>'{policy,contentDigest}' is distinct from a.content_digest or audit#>>'{policy,policyId}' is distinct from b.policy_id
    or audit#>'{policy,observation}' is not null or result->'policyCode' is distinct from audit#>'{policy,code}'
    or result->'deliveryAllowed' is distinct from 'false'::jsonb or result->'deliveryUntilMs' is distinct from 'null'::jsonb
    or result->'studyWindow' is distinct from 'null'::jsonb or result->'studyRecovery' is distinct from 'null'::jsonb
    or result->'teachingPhaseComplete' is distinct from 'true'::jsonb
    or result#>'{progress,lessons}' is distinct from '[]'::jsonb or result#>'{progress,quiz}' is distinct from 'null'::jsonb
    or result#>'{progress,feedback}' is distinct from 'null'::jsonb
    or runtime->>'status' is distinct from 'review_complete'
    or runtime-array['revision','lastReceiptMs','feedback'] is distinct from a.runtime-array['revision','lastReceiptMs','feedback']
    or ledger-array['revision','lastReceiptMs','studyIntervals','uncertainExposure','observationJournal']
      is distinct from l.ledger-array['revision','lastReceiptMs','studyIntervals','uncertainExposure','observationJournal'] then
    raise exception 'nmls_final_invalid_transition'; end if;
  -- No material ever existed in this operation. No bootstrap, recovery, new
  -- session, human-activity refresh or exposure reset can accompany reservation.
  for item in select value from jsonb_array_elements(jsonb_build_array(l.ledger->'observationJournal',ledger->'observationJournal')) loop
    if jsonb_typeof(item) is distinct from 'object' or item->>'version' is distinct from 'nmls-study-windows-v3-phase'
      or item->>'actorId' is distinct from p_student_id::text or item->'active' is distinct from 'null'::jsonb
      or item->'unresolved' is distinct from 'null'::jsonb then raise exception 'nmls_teaching_original_observation_hold'; end if;
  end loop;
  at_ms:=floor(extract(epoch from clock_timestamp())*1000);
  opening_ms:=(b.offering->>'opensAtMs')::bigint; cutoff_ms:=(b.offering->>'closesAtMs')::bigint;
  if p_evaluated_at_ms is null or p_evaluated_at_ms>at_ms+1000 or at_ms-p_evaluated_at_ms>1000
    or p_evaluated_at_ms<greatest((a.runtime->>'lastReceiptMs')::bigint,(l.ledger->>'lastReceiptMs')::bigint)
    or (at_ms<opening_ms) is distinct from (p_evaluated_at_ms<opening_ms)
    or (at_ms>=cutoff_ms) is distinct from (p_evaluated_at_ms>=cutoff_ms) then raise exception 'nmls_final_clock_refresh_required'; end if;
  outside_window:=p_evaluated_at_ms<opening_ms or p_evaluated_at_ms>=cutoff_ms;
  reserved:=result->>'policyCode'='session_policy_allowed';
  if reserved then
    if outside_window or result->'ok' is distinct from 'true'::jsonb or result->'status' is distinct from '200'::jsonb
      or not coalesce(result->>'code' in ('review_policy_checked','session_policy_allowed'),false)
      or result->'observationReady' is distinct from 'true'::jsonb
      or result->>'observationCode' is distinct from 'study_observation_ready'
      or audit->'observation' is distinct from jsonb_build_object('reason','no_prior_material','code','study_observation_ready')
      or runtime->'feedback' is distinct from a.runtime->'feedback'
      or b.offering#>'{rocs,fullDocumentVerified}' is distinct from 'true'::jsonb
      or not exists(select 1 from jsonb_array_elements(ledger->'acceptances') x where x->>'offeringId'=g.id::text
        and x->>'contentDigest'=a.content_digest and x->>'documentDigest'=b.offering#>>'{rocs,documentDigest}'
        and x->>'version'=b.offering#>>'{rocs,version}')
      or ledger->'breakStartedAtMs' is distinct from 'null'::jsonb or ledger->>'sessionStartedAtMs' is null then
      raise exception 'nmls_final_invalid_reservation_access'; end if;
    -- Already-complete source checks are neither delivery nor newly terminal;
    --031 intentionally does not apply its delivery budget branch to them.
    observed:=public.nmls_policy_checked_intervals(ledger->'studyIntervals',p_evaluated_at_ms);
    combined:=public.nmls_policy_interval_union(observed,ledger#>'{uncertainExposure,intervals}');
    boundary_ms:=(ledger->>'studyBoundaryAtMs')::bigint;
    rolling_ms:=public.nmls_policy_exposure_in_range(combined,p_evaluated_at_ms-86400000,p_evaluated_at_ms);
    since_break_ms:=greatest((ledger->>'studySinceBreakMs')::bigint,
      public.nmls_policy_exposure_in_range(observed,coalesce(boundary_ms,p_evaluated_at_ms),p_evaluated_at_ms))+
      public.nmls_policy_exposure_in_range(combined,coalesce(boundary_ms,p_evaluated_at_ms),p_evaluated_at_ms)-
      public.nmls_policy_exposure_in_range(observed,coalesce(boundary_ms,p_evaluated_at_ms),p_evaluated_at_ms);
    if since_break_ms>=12000000 or rolling_ms>=36000000 then raise exception 'nmls_final_invalid_reservation_access'; end if;
    deadline_ms:=least(cutoff_ms,(ledger->>'sessionStartedAtMs')::bigint+43200000);
    if p_evaluated_at_ms>=deadline_ms then raise exception 'nmls_final_invalid_reservation_access'; end if;
    if at_ms>=deadline_ms then raise exception 'nmls_final_clock_refresh_required'; end if;
    if p_final_id is null or jsonb_typeof(p_selection) is distinct from 'object'
      or not (p_selection ?& array['schema','id','reviewAttemptId','definitionDigest','number','questionIds','optionOrder'])
      or p_selection-array['schema','id','reviewAttemptId','definitionDigest','number','questionIds','optionOrder']<>'{}'::jsonb
      or p_selection->>'schema' is distinct from 'statecourse-nmls-draft-final-attempt-v1'
      or p_selection->>'id' is distinct from p_final_id::text or p_selection->>'reviewAttemptId' is distinct from a.id::text
      or p_selection->>'definitionDigest' is distinct from p_definition_digest or p_selection->'number' is distinct from '1'::jsonb
      or jsonb_typeof(p_selection->'questionIds') is distinct from 'array'
      or jsonb_typeof(p_selection->'optionOrder') is distinct from 'object' then raise exception 'nmls_final_invalid_selection'; end if;
    if jsonb_array_length(p_selection->'questionIds')<>25
      or (select count(distinct value) from jsonb_array_elements(p_selection->'questionIds'))<>25
      or (select count(*) from jsonb_object_keys(p_selection->'optionOrder'))<>25 then raise exception 'nmls_final_invalid_selection'; end if;
    for item in select value from jsonb_array_elements(p_selection->'questionIds') loop
      field:=item#>>'{}';
      if jsonb_typeof(item) is distinct from 'string' or not coalesce(field ~ '^N26-FIN-[FENG][0-9]{2}$',false)
        or jsonb_typeof(p_selection->'optionOrder'->field) is distinct from 'array' then raise exception 'nmls_final_invalid_selection'; end if;
      if jsonb_array_length(p_selection->'optionOrder'->field)<>4
        or (select jsonb_agg(value order by value) from jsonb_array_elements(p_selection->'optionOrder'->field))
          is distinct from '["A","B","C","D"]'::jsonb then raise exception 'nmls_final_invalid_selection'; end if;
    end loop;
    selected_digest:=encode(sha256(convert_to(public.nmls_teaching_canonical(p_selection),'UTF8')),'hex');
  else
    if result->'ok' is distinct from 'false'::jsonb or result->'status' is distinct from '409'::jsonb
      or result->'code' is distinct from result->'policyCode'
      or not coalesce(result->>'code' in ('delivery_not_open','delivery_window_closed','rocs_document_unverified','rocs_required',
        'break_in_progress','session_required','session_wall_limit','mandatory_break_required','rolling_study_limit'),false)
      or runtime->'feedback' is distinct from 'null'::jsonb or p_final_id is not null or p_selection is not null then
      raise exception 'nmls_final_invalid_reservation_denial'; end if;
    if outside_window then
      if result->'observationReady' is distinct from 'false'::jsonb or result->>'observationCode' is distinct from 'outside_window_no_settlement'
        or audit->'observation' is distinct from jsonb_build_object('reason','outside_window_preserved') then
        raise exception 'nmls_final_invalid_reservation_denial'; end if;
    elsif result->'observationReady' is distinct from 'true'::jsonb or result->>'observationCode' is distinct from 'study_observation_ready'
      or audit->'observation' is distinct from jsonb_build_object('reason','no_prior_material','code','study_observation_ready') then
      raise exception 'nmls_final_invalid_reservation_denial'; end if;
  end if;
  committed:=public.nmls_teaching_commit(p_student_id,p_attempt_id,p_event_id,p_command_digest,
    phase,p_transition->>'teachingDigest',p_transition->'layout',p_expected_source_revision,null,p_expected_source_revision,
    p_expected_actor_revision,p_expected_session_id,p_evaluated_at_ms,p_transition->'initialLedger',ledger,runtime,result,audit,null);
  if committed->'duplicate' is distinct from 'false'::jsonb then raise exception 'nmls_final_idempotency_conflict'; end if;
  if reserved then
    insert into public.nmls_private_finals(id,review_attempt_id,student_id,course_key,content_digest,definition_digest,revision,selection)
      values(p_final_id,a.id,p_student_id,a.course_key,a.content_digest,p_definition_digest,1,p_selection);
  end if;
  outcome:=jsonb_build_object('ok',reserved,'code',case when reserved then 'private_final_reserved' else result->>'code' end,
    'status',case when reserved then 200 else 409 end,'reserved',reserved,'finalAttemptId',case when reserved then p_final_id else null end,
    'finalRevision',case when reserved then 1 else null end,'sourceRevision',p_expected_source_revision+1,
    'actorRevision',p_expected_actor_revision+1,'mode','private_authoring_review','studentDeliveryEnabled',false,'creditIssuanceAllowed',false);
  insert into public.nmls_final_reservation_events(student_id,event_id,review_attempt_id,command_digest,definition_digest,
    source_revision,actor_revision,reserved,final_id,selection_digest,outcome)
    values(p_student_id,p_event_id,a.id,p_command_digest,p_definition_digest,p_expected_source_revision+1,p_expected_actor_revision+1,
      reserved,case when reserved then p_final_id else null end,selected_digest,outcome);
  --032 checks its writes, but form/receipt insertion may itself wait. Recheck
  -- the original grant/annual bucket and positive session deadline afterwards.
  -- No six-minute source idle gate: completed timestamps remain unchanged;
  -- reservation is not exam activation, material exposure or attendance.
  at_ms:=floor(extract(epoch from clock_timestamp())*1000);
  if g.expires_at<=clock_timestamp() then raise exception 'nmls_final_access_denied'; end if;
  if at_ms-p_evaluated_at_ms>1000 or p_evaluated_at_ms>at_ms+1000
    or (at_ms<opening_ms) is distinct from (p_evaluated_at_ms<opening_ms)
    or (at_ms>=cutoff_ms) is distinct from (p_evaluated_at_ms>=cutoff_ms)
    or reserved and at_ms>=deadline_ms then raise exception 'nmls_final_clock_refresh_required'; end if;
  return jsonb_build_object('duplicate',false,'outcome',outcome);
end $$;

revoke all on function public.nmls_final_reservation_context(uuid,uuid,uuid),
  public.nmls_final_reservation_commit(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,uuid,jsonb,jsonb)
  from public,anon,authenticated,service_role;
grant execute on function public.nmls_final_reservation_context(uuid,uuid,uuid),
  public.nmls_final_reservation_commit(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,uuid,jsonb,jsonb) to service_role;
commit;
