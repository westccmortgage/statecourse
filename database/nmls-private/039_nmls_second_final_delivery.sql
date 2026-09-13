-- LOCAL PRIVATE AUTHORING ONLY. Actual second-form session and exposure.
-- No submission, grade, third draw, source/child progress mutation or CE credit.
-- The original first form and completed child remain frozen. This is a distinct
-- second phase; its journal is never translated into source or first-final scope.
begin;

create table public.nmls_second_final_deliveries (
  second_id uuid primary key references public.nmls_private_remediations(second_id),
  first_final_id uuid not null references public.nmls_private_finals(id),
  student_id uuid not null references public.students(id),
  review_attempt_id uuid not null references public.nmls_review_attempts(id),
  phase_scope jsonb not null check(jsonb_typeof(phase_scope)='object'),
  revision bigint not null check(revision between 1 and 9007199254740991),
  runtime jsonb not null check(jsonb_typeof(runtime)='object'
    and runtime->>'version' is not distinct from 'nmls-second-final-delivery-v1'
    and runtime->>'finalAttemptId' is not distinct from second_id::text
    and runtime->'revision' is not distinct from to_jsonb(revision)
    and runtime->'creditIssuanceAllowed' is not distinct from 'false'::jsonb)
);
create table public.nmls_second_final_delivery_events (
  student_id uuid not null references public.students(id),
  event_id uuid not null,
  second_id uuid not null references public.nmls_second_final_deliveries(second_id),
  first_final_id uuid not null references public.nmls_private_finals(id),
  review_attempt_id uuid not null references public.nmls_review_attempts(id),
  reservation_event_id uuid not null,
  command_digest text not null check(command_digest ~ '^[a-f0-9]{64}$'),
  definition_digest text not null check(definition_digest ~ '^[a-f0-9]{64}$'),
  source_revision bigint not null check(source_revision>0),
  final_revision bigint not null check(final_revision=2),
  workflow_revision bigint not null check(workflow_revision>0),
  delivery_revision bigint not null check(delivery_revision>0),
  actor_revision bigint not null check(actor_revision>0),
  command jsonb not null check(jsonb_typeof(command)='object'),
  runtime_before jsonb not null,
  runtime jsonb not null,
  lease_before jsonb not null,
  lease_after jsonb not null,
  outcome jsonb not null check(outcome->'candidateMaterialAllowed' is not distinct from 'false'::jsonb
    and outcome->'candidateUntilMs' is not distinct from 'null'::jsonb
    and outcome->'candidateWindow' is not distinct from 'null'::jsonb
    and outcome->'deliveryAllowed' is not distinct from 'false'::jsonb
    and outcome->'studentDeliveryEnabled' is not distinct from 'false'::jsonb
    and outcome->'creditIssuanceAllowed' is not distinct from 'false'::jsonb),
  audit jsonb not null,
  transaction_id bigint not null default txid_current(),
  recorded_at timestamptz not null default clock_timestamp(),
  primary key(student_id,event_id), unique(second_id,delivery_revision), unique(student_id,actor_revision),
  foreign key(student_id,reservation_event_id) references public.nmls_second_final_reservation_events(student_id,event_id)
);
alter table public.nmls_second_final_deliveries enable row level security;
alter table public.nmls_second_final_delivery_events enable row level security;
revoke all on public.nmls_second_final_deliveries,public.nmls_second_final_delivery_events from public,anon,authenticated,service_role;
create function public.nmls_second_final_delivery_immutable_scope() returns trigger
language plpgsql set search_path=pg_catalog,public as $$
begin
  if tg_op='DELETE' then raise exception 'nmls_second_final_delivery_immutable'; end if;
  if new.second_id is distinct from old.second_id or new.first_final_id is distinct from old.first_final_id
    or new.student_id is distinct from old.student_id or new.review_attempt_id is distinct from old.review_attempt_id
    or new.phase_scope is distinct from old.phase_scope or new.revision is distinct from old.revision+1 then
    raise exception 'nmls_second_final_delivery_immutable'; end if;
  return new;
end $$;
create trigger nmls_second_final_delivery_scope_immutable before update or delete on public.nmls_second_final_deliveries
  for each row execute function public.nmls_second_final_delivery_immutable_scope();
create trigger nmls_second_final_delivery_event_immutable before update or delete on public.nmls_second_final_delivery_events
  for each row execute function public.nmls_private_final_event_immutable();

-- Separate instance of034's reviewed control arithmetic. Generic interval and
-- policy helpers are reused, but the actual second identity is checked in place.
create function public.nmls_second_final_delivery_guard(p_before jsonb,p_after jsonb,p_old_runtime jsonb,p_runtime jsonb,
  p_outcome jsonb,p_audit jsonb,p_offering jsonb,p_actor uuid,p_attempt uuid,p_event uuid,p_at bigint,p_phase jsonb,p_command jsonb)
returns void language plpgsql set search_path=pg_catalog,public as $$
declare uuid_pattern text:='^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$';
  phase_digest text; kind text:=p_command->>'kind'; policy_kind text; keys text[]; field text;
  item jsonb; j jsonb; w jsonb; held jsonb; receipt jsonb:=p_command->'studyReceipt';
  journal jsonb:=p_before->'observationJournal'; old_w jsonb:=p_before#>'{observationJournal,active}';
  decision_audit jsonb; expected_audit jsonb; expected_outcome jsonb; expected_runtime jsonb:=p_old_runtime;
  accounted jsonb:=p_before; policy jsonb; observed jsonb; interval_value jsonb; current_w jsonb; scope jsonb;
  expected_ledger jsonb; combined jsonb; recovery jsonb; added_receipt jsonb:=p_audit#>'{policy,receipt}';
  outside_window boolean; idle boolean; opening boolean; controls boolean; ready boolean:=false; initial boolean:=false;
  candidate boolean:=false; ok boolean:=false; code text; observation_code text; reason text; status integer:=409;
  until_ms bigint; resume_ms bigint; start_ms bigint; boundary bigint; since_break bigint; rolling bigint;
  received_j bigint; new_id text; new_session text; retained jsonb;
begin
  if p_actor is null or p_attempt is null or p_event is null or p_at is null or p_at<0 or p_at>8640000000000000
    or jsonb_typeof(p_offering) is distinct from 'object' or jsonb_typeof(p_phase) is distinct from 'object'
    or jsonb_typeof(p_command) is distinct from 'object' or jsonb_typeof(p_audit) is distinct from 'object'
    or jsonb_typeof(p_outcome) is distinct from 'object' then raise exception 'nmls_final_delivery_invalid_input';end if;
  if not (p_phase ?& array['version','actorId','reviewAttemptId','firstFinalAttemptId','finalAttemptId','courseKey','contentDigest','definitionDigest','selectionDigest','offeringId'])
    or p_phase-array['version','actorId','reviewAttemptId','firstFinalAttemptId','finalAttemptId','courseKey','contentDigest','definitionDigest','selectionDigest','offeringId']<>'{}'::jsonb
    or p_phase->>'version' is distinct from 'nmls-second-final-phase-v1' or p_phase->>'actorId' is distinct from p_actor::text
    or p_phase->>'reviewAttemptId' is distinct from p_attempt::text or not coalesce(p_phase->>'finalAttemptId' ~* uuid_pattern,false)
    or not coalesce(p_phase->>'firstFinalAttemptId' ~* uuid_pattern,false)
    or p_phase->>'firstFinalAttemptId'=p_phase->>'finalAttemptId' or p_phase->>'firstFinalAttemptId'=p_attempt::text
    or p_phase->>'finalAttemptId'=p_attempt::text or p_phase->'offeringId' is distinct from p_offering->'id'
    or not coalesce(p_phase->>'offeringId' ~* uuid_pattern,false) or p_phase->'contentDigest' is distinct from p_offering->'contentDigest'
    or jsonb_typeof(p_phase->'courseKey') is distinct from 'string' or length(p_phase->>'courseKey')=0 then
    raise exception 'nmls_final_delivery_invalid_phase';end if;
  foreach field in array array['contentDigest','definitionDigest','selectionDigest'] loop
    if not coalesce(p_phase->>field ~ '^[a-f0-9]{64}$',false) then raise exception 'nmls_final_delivery_invalid_phase';end if;
  end loop;
  foreach field in array array['opensAtMs','closesAtMs'] loop
    if not public.nmls_final_guard_integer(p_offering->field,8640000000000000,false) then raise exception 'nmls_final_delivery_invalid_offering';end if;
  end loop;
  if (p_offering->>'opensAtMs')::bigint>=(p_offering->>'closesAtMs')::bigint
    or p_offering->>'educationType' is distinct from 'annual_ce' then raise exception 'nmls_final_delivery_invalid_offering';end if;
  phase_digest:=encode(sha256(convert_to(public.nmls_final_guard_canonical(p_phase),'UTF8')),'hex');
  for item in select value from jsonb_array_elements(jsonb_build_array(p_old_runtime,p_runtime)) loop
    if jsonb_typeof(item) is distinct from 'object' or not (item ?& array['version','finalAttemptId','phaseDigest','revision','status','sessionId','lastActivityMs','lastReceiptMs','creditIssuanceAllowed'])
      or item-array['version','finalAttemptId','phaseDigest','revision','status','sessionId','lastActivityMs','lastReceiptMs','creditIssuanceAllowed']<>'{}'::jsonb
      or item->>'version' is distinct from 'nmls-second-final-delivery-v1' or item->'finalAttemptId' is distinct from p_phase->'finalAttemptId'
      or item->>'phaseDigest' is distinct from phase_digest or not public.nmls_final_guard_integer(item->'revision',9007199254740991,false)
      or not coalesce(item->>'status' in ('reserved','active','paused','logged_out'),false)
      or not public.nmls_final_guard_integer(item->'lastReceiptMs',p_at,false)
      or not public.nmls_final_guard_integer(item->'lastActivityMs',(item->>'lastReceiptMs')::bigint,true)
      or item->'creditIssuanceAllowed' is distinct from 'false'::jsonb
      or item->'sessionId'<>'null'::jsonb and not coalesce(item->>'sessionId' ~* uuid_pattern,false)
      or (item->'sessionId'='null'::jsonb) is distinct from (item->'lastActivityMs'='null'::jsonb)
      or item->>'status'='active' and item->'sessionId'='null'::jsonb
      or item->>'status'='reserved' and item->'sessionId'<>'null'::jsonb then raise exception 'nmls_final_delivery_invalid_runtime';end if;
    if item->'revision'='0'::jsonb and item is distinct from jsonb_build_object('version','nmls-second-final-delivery-v1',
      'finalAttemptId',p_phase->'finalAttemptId','phaseDigest',phase_digest,'revision',0,'status','reserved','sessionId',null,
      'lastActivityMs',null,'lastReceiptMs',0,'creditIssuanceAllowed',false) then raise exception 'nmls_final_delivery_invalid_runtime';end if;
  end loop;
  keys:=array['kind','eventId','expectedRevision','expectedActorRevision','sessionId'];
  if kind='interaction' then keys:=keys||array['visible'];
  elsif kind='accept_rocs' then keys:=keys||array['version','documentDigest','acknowledged'];
    if p_command ? 'presentationId' then keys:=keys||array['presentationId'];
      if not coalesce(p_command->>'presentationId' ~* uuid_pattern,false) then raise exception 'nmls_final_delivery_invalid_command';end if;end if;
  elsif kind='recover_observation' then keys:=keys||array['recoveryWindowId'];
  elsif not coalesce(kind in ('activate','resume','heartbeat','check_access','pause','logout','begin_break','end_break'),false) then
    raise exception 'nmls_final_delivery_invalid_command';end if;
  if p_command ? 'studyReceipt' and kind<>'recover_observation' then keys:=keys||array['studyReceipt'];end if;
  if not (p_command ?& keys) or p_command-keys<>'{}'::jsonb or p_command->>'eventId' is distinct from p_event::text
    or p_command->'expectedRevision' is distinct from p_old_runtime->'revision'
    or p_command->'expectedActorRevision' is distinct from p_before->'revision'
    or p_command->'sessionId' is distinct from p_old_runtime->'sessionId'
    or kind='interaction' and jsonb_typeof(p_command->'visible') is distinct from 'boolean'
    or kind='recover_observation' and not coalesce(p_command->>'recoveryWindowId' ~* uuid_pattern,false)
    or kind='accept_rocs' and (p_command->>'version' is distinct from '4'
      or not coalesce(p_command->>'documentDigest' ~ '^[a-f0-9]{64}$',false) or jsonb_typeof(p_command->'acknowledged') is distinct from 'boolean')
    or kind='activate' and p_old_runtime->>'status'<>'reserved' or kind='resume' and p_old_runtime->'sessionId'='null'::jsonb then
    raise exception 'nmls_final_delivery_invalid_command';end if;
  if receipt is not null and (jsonb_typeof(receipt) is distinct from 'object' or not (receipt ?& array['windowId','visible'])
    or receipt-array['windowId','visible']<>'{}'::jsonb or not coalesce(receipt->>'windowId' ~* uuid_pattern,false)
    or jsonb_typeof(receipt->'visible') is distinct from 'boolean') then raise exception 'nmls_final_delivery_invalid_receipt';end if;
  -- Full retained actor data is checked before any debit/pruning. Foreign v3
  -- teaching/child/final windows are never converted into this phase's evidence.
  for item in select value from jsonb_array_elements(jsonb_build_array(p_before,p_after)) loop
    if jsonb_typeof(item) is distinct from 'object' or not (item ?& array['policyId','actorId','revision','lastReceiptMs','sessionStartedAtMs',
      'lastStudyAtMs','studyBoundaryAtMs','breakStartedAtMs','studySinceBreakMs','studyIntervals','uncertainExposure','acceptances','creditIssuanceAllowed','observationJournal'])
      or item-array['policyId','actorId','revision','lastReceiptMs','sessionStartedAtMs','lastStudyAtMs','studyBoundaryAtMs','breakStartedAtMs',
        'studySinceBreakMs','studyIntervals','uncertainExposure','acceptances','creditIssuanceAllowed','observationJournal']<>'{}'::jsonb
      or item->>'policyId' is distinct from 'statecourse-oss-session-draft-2026-02' or item->>'actorId' is distinct from p_actor::text
      or item->'creditIssuanceAllowed' is distinct from 'false'::jsonb or not public.nmls_final_guard_integer(item->'revision',9007199254740991,false)
      or item->'revision'='0'::jsonb or jsonb_typeof(item->'acceptances') is distinct from 'array' then raise exception 'nmls_final_delivery_invalid_ledger';end if;
    foreach field in array array['lastReceiptMs','sessionStartedAtMs','lastStudyAtMs','studyBoundaryAtMs','breakStartedAtMs','studySinceBreakMs'] loop
      if not public.nmls_final_guard_integer(item->field,p_at,field not in ('lastReceiptMs','studySinceBreakMs')) then
        raise exception 'nmls_final_delivery_invalid_ledger';end if;
    end loop;
    perform public.nmls_policy_checked_intervals(item->'studyIntervals',p_at);
    w:=item->'uncertainExposure';
    if jsonb_typeof(w) is distinct from 'object' or not (w ?& array['version','intervals','lastBoundaryMs'])
      or w-array['version','intervals','lastBoundaryMs']<>'{}'::jsonb or w->>'version' is distinct from 'nmls-uncertain-exposure-v1'
      or not public.nmls_final_guard_integer(w->'lastBoundaryMs',p_at,true) then raise exception 'nmls_final_delivery_invalid_exposure';end if;
    perform public.nmls_policy_checked_intervals(w->'intervals',p_at);
    if w->'lastBoundaryMs'='null'::jsonb and w->'intervals'<>'[]'::jsonb
      or exists(select 1 from jsonb_array_elements(w->'intervals') x where (x->>'end')::bigint>(w->>'lastBoundaryMs')::bigint) then
      raise exception 'nmls_final_delivery_invalid_exposure';end if;
    j:=item->'observationJournal';
    if jsonb_typeof(j) is distinct from 'object' or not (j ?& array['version','actorId','lastReceiptMs','active','unresolved','creditIssuanceAllowed'])
      or j-array['version','actorId','lastReceiptMs','active','unresolved','creditIssuanceAllowed']<>'{}'::jsonb
      or j->>'version' is distinct from 'nmls-study-windows-v3-phase' or j->>'actorId' is distinct from p_actor::text
      or j->'creditIssuanceAllowed' is distinct from 'false'::jsonb
      or not public.nmls_final_guard_integer(j->'lastReceiptMs',(item->>'lastReceiptMs')::bigint,false)
      or j->'active'<>'null'::jsonb and j->'unresolved'<>'null'::jsonb then raise exception 'nmls_final_delivery_invalid_journal';end if;
    received_j:=(j->>'lastReceiptMs')::bigint;held:=j->'unresolved';
    if held<>'null'::jsonb then
      if jsonb_typeof(held) is distinct from 'object' or not (held ?& array['window','reason','detectedAtMs','eventId'])
        or held-array['window','reason','detectedAtMs','eventId']<>'{}'::jsonb or jsonb_typeof(held->'reason') is distinct from 'string'
        or not coalesce(held->>'eventId' ~* uuid_pattern,false) or not public.nmls_final_guard_integer(held->'detectedAtMs',received_j,false) then
        raise exception 'nmls_final_delivery_invalid_hold';end if;
      w:=held->'window';else w:=j->'active';end if;
    if w<>'null'::jsonb then
      if jsonb_typeof(w) is distinct from 'object' or not (w ?& array['id','scope','materialDigest','runtimeRevision','openingEventId','issuedAtMs','horizonMs','lastObservedAtMs'])
        or w-array['id','scope','materialDigest','runtimeRevision','openingEventId','issuedAtMs','horizonMs','lastObservedAtMs']<>'{}'::jsonb
        or jsonb_typeof(w->'scope') is distinct from 'object'
        or not ((w->'scope') ?& array['actorId','attemptId','offeringId','contentDigest','sessionId','finalPhase'])
        or (w->'scope')-array['actorId','attemptId','offeringId','contentDigest','sessionId','finalPhase']<>'{}'::jsonb
        or w#>'{scope,finalPhase}' is distinct from p_phase or w#>>'{scope,actorId}' is distinct from p_actor::text
        or w#>>'{scope,attemptId}' is distinct from p_attempt::text or w#>'{scope,offeringId}' is distinct from p_phase->'offeringId'
        or w#>'{scope,contentDigest}' is distinct from p_phase->'contentDigest' then raise exception 'nmls_final_delivery_foreign_window';end if;
      if not coalesce(w->>'id' ~* uuid_pattern,false) or not coalesce(w->>'openingEventId' ~* uuid_pattern,false)
        or not coalesce(w#>>'{scope,sessionId}' ~* uuid_pattern,false) or w->'materialDigest' is distinct from p_phase->'selectionDigest'
        or not public.nmls_final_guard_integer(w->'runtimeRevision',9007199254740991,false)
        or not public.nmls_final_guard_integer(w->'issuedAtMs',received_j,false)
        or not public.nmls_final_guard_integer(w->'horizonMs',(p_offering->>'closesAtMs')::bigint,false)
        or not public.nmls_final_guard_integer(w->'lastObservedAtMs',least(received_j,(w->>'horizonMs')::bigint),true)
        or (w->>'issuedAtMs')::bigint<(p_offering->>'opensAtMs')::bigint
        or (w->>'horizonMs')::bigint<=(w->>'issuedAtMs')::bigint
        or (w->>'lastObservedAtMs')::bigint<(w->>'issuedAtMs')::bigint
        or (w->>'horizonMs')::bigint-coalesce((w->>'lastObservedAtMs')::bigint,(w->>'issuedAtMs')::bigint)>30000
        or held<>'null'::jsonb and (held->>'detectedAtMs')::bigint<coalesce((w->>'lastObservedAtMs')::bigint,(w->>'issuedAtMs')::bigint) then
        raise exception 'nmls_final_delivery_invalid_window';end if;
    end if;
  end loop;
  if (p_old_runtime->>'revision')::bigint>=9007199254740991 or (p_before->>'revision')::bigint>=9007199254740991 then
    raise exception 'nmls_final_delivery_revision_exhausted';end if;
  if p_old_runtime->>'status'='reserved' and (old_w<>'null'::jsonb or journal->'unresolved'<>'null'::jsonb) then
    raise exception 'nmls_final_delivery_activation_hold';end if;
  outside_window:=p_at<(p_offering->>'opensAtMs')::bigint or p_at>=(p_offering->>'closesAtMs')::bigint;
  idle:=p_old_runtime->>'status'='active' and p_at-(p_old_runtime->>'lastActivityMs')::bigint>=360000;
  opening:=kind in ('activate','resume');controls:=kind in ('accept_rocs','begin_break','end_break','recover_observation');
  if outside_window then observation_code:='outside_window_no_settlement';decision_audit:=jsonb_build_object('outsideWindowPreserved',true);
  else
    journal:=jsonb_set(journal,'{lastReceiptMs}',to_jsonb(p_at));
    if kind='recover_observation' and (journal->'active'<>'null'::jsonb or journal#>'{unresolved,window,id}' is distinct from p_command->'recoveryWindowId') then
      raise exception 'nmls_final_delivery_recovery_conflict';end if;
    if journal->'unresolved'<>'null'::jsonb then
      if receipt is not null then raise exception 'nmls_final_delivery_receipt_during_hold';end if;
      observation_code:='observation_unresolved';decision_audit:=jsonb_build_object('unresolvedPreserved',true);
    elsif old_w='null'::jsonb then
      if receipt is not null or p_old_runtime->>'status'='active' then raise exception 'nmls_final_delivery_missing_window';end if;
      ready:=true;observation_code:='observation_ready';decision_audit:=jsonb_build_object('noPriorMaterial',true);
    else
      reason:=case when old_w#>'{scope,sessionId}' is distinct from p_old_runtime->'sessionId' then 'session_interrupted'
        when old_w->'runtimeRevision' is distinct from p_old_runtime->'revision' then 'material_revision_interrupted'
        when receipt is null or receipt->'windowId' is distinct from old_w->'id' then 'receipt_missing_or_stale'
        when receipt->'visible'='false'::jsonb or p_command->'visible'='false'::jsonb then 'visibility_interrupted'
        when p_at>(old_w->>'horizonMs')::bigint then 'horizon_expired'
        when p_at-coalesce((old_w->>'lastObservedAtMs')::bigint,(old_w->>'issuedAtMs')::bigint)>30000 then 'receipt_gap' else null end;
      if reason is not null then
        held:=jsonb_build_object('window',old_w,'reason',reason,'detectedAtMs',p_at,'eventId',p_event);
        journal:=journal||jsonb_build_object('active',null,'unresolved',held);observation_code:=reason;
        decision_audit:=jsonb_build_object('interrupted',held);
      else
        ready:=true;initial:=old_w->'lastObservedAtMs'='null'::jsonb;
        observation_code:=case when initial then 'material_acknowledged' else 'receipt_continuous' end;
        decision_audit:=jsonb_build_object('windowBefore',old_w,'firstAcknowledgment',initial,
          'signal','authenticated_material_receipt_not_identity_proof');
        journal:=jsonb_set(journal,'{active,lastObservedAtMs}',to_jsonb(p_at));
        if initial then
          start_ms:=(old_w->>'issuedAtMs')::bigint;
          if start_ms is distinct from (p_before->>'lastReceiptMs')::bigint or p_at-start_ms>30000
            or p_at<coalesce((p_before#>>'{uncertainExposure,lastBoundaryMs}')::bigint,0) then raise exception 'nmls_final_delivery_invalid_initial_gap';end if;
          combined:=public.nmls_policy_interval_union(p_before#>'{uncertainExposure,intervals}',
            case when p_at>start_ms then jsonb_build_array(jsonb_build_object('start',start_ms,'end',p_at)) else '[]'::jsonb end);
          accounted:=jsonb_set(accounted,'{uncertainExposure}',jsonb_build_object('version','nmls-uncertain-exposure-v1','intervals',combined,'lastBoundaryMs',p_at));
        elsif (old_w->>'lastObservedAtMs')::bigint<p_at then interval_value:=jsonb_build_object('start',old_w->'lastObservedAtMs','end',p_at);end if;
      end if;
    end if;
  end if;
  policy_kind:=case when idle then 'check_access' when kind='recover_observation' then 'check_recovery'
    when opening and ready then 'open_session' when controls then kind else 'check_access' end;
  policy:=public.nmls_final_guard_policy_step(accounted,policy_kind,p_offering,p_at,p_actor,p_command,added_receipt,null);
  if interval_value is not null then
    observed:=public.nmls_final_guard_policy_step(accounted,'observe_study',p_offering,p_at,p_actor,p_command,null,interval_value);
    if observed->'ok'='true'::jsonb then policy:=public.nmls_final_guard_policy_step(observed->'state',policy_kind,p_offering,p_at,p_actor,p_command,added_receipt,null);
    else policy:=observed;end if;
    policy:=jsonb_set(policy,'{audit,observation}',observed->'audit');
    if observed->>'code'<>'study_interval_recorded' and observed#>'{audit,observedOutsidePolicy}' is distinct from 'true'::jsonb then
      held:=jsonb_build_object('window',old_w,'reason','settlement_rejected','detectedAtMs',p_at,'eventId',p_event);
      journal:=journal||jsonb_build_object('active',null,'unresolved',held);ready:=false;observation_code:='settlement_rejected';
      decision_audit:=jsonb_build_object('interrupted',held);
      policy:=public.nmls_final_guard_policy_step(p_before,'check_access',p_offering,p_at,p_actor,p_command,null,null);
    end if;
  end if;
  expected_ledger:=policy->'state';resume_ms:=(policy->>'resumeNotBeforeMs')::bigint;
  expected_runtime:=expected_runtime||jsonb_build_object('revision',(p_old_runtime->>'revision')::bigint+1,'lastReceiptMs',p_at);
  code:=case when policy->'ok'='false'::jsonb then policy->>'code' when not ready then observation_code else 'session_required' end;
  if outside_window then expected_runtime:=jsonb_set(expected_runtime,'{status}',to_jsonb(case when expected_runtime->'sessionId'='null'::jsonb then 'reserved' else 'logged_out' end));
  elsif idle then expected_runtime:=jsonb_set(expected_runtime,'{status}','"logged_out"');code:='inactivity_logout';status:=401;
  elsif kind='recover_observation' then
    held:=journal->'unresolved';
    if policy->'ok'='true'::jsonb and policy->>'code'='recovery_context_allowed' and p_old_runtime->>'status'<>'active'
      and held<>'null'::jsonb and held->>'reason' in ('receipt_missing_or_stale','visibility_interrupted','horizon_expired','receipt_gap','session_interrupted') then
      start_ms:=coalesce((held#>>'{window,lastObservedAtMs}')::bigint,(held#>>'{window,issuedAtMs}')::bigint);
      if p_at<start_ms or p_at<coalesce((expected_ledger#>>'{uncertainExposure,lastBoundaryMs}')::bigint,0) then raise exception 'nmls_final_delivery_invalid_recovery';end if;
      combined:=public.nmls_policy_interval_union(expected_ledger#>'{uncertainExposure,intervals}',
        case when p_at>start_ms then jsonb_build_array(jsonb_build_object('start',start_ms,'end',p_at)) else '[]'::jsonb end);
      expected_ledger:=jsonb_set(expected_ledger,'{uncertainExposure}',jsonb_build_object('version','nmls-uncertain-exposure-v1','intervals',combined,'lastBoundaryMs',p_at))
        ||jsonb_build_object('breakStartedAtMs',p_at);resume_ms:=p_at+600000;
      decision_audit:=decision_audit||jsonb_build_object('recovery',jsonb_build_object('original',held,'debitStartMs',start_ms,'debitEndMs',p_at,
        'method','conservative_gap_debit_no_instruction_awarded','clientProtocolRequired','clear-before-recovery-v1',
        'observedStudyAddedMs',0,'instructionalTimeAddedMs',0,'creditAddedMs',0));
      journal:=jsonb_set(journal,'{unresolved}','null');ok:=true;code:='observation_recovered';status:=200;
    elsif policy->'ok'='true'::jsonb then code:='recovery_review_required';end if;
    expected_runtime:=jsonb_set(expected_runtime,'{status}',to_jsonb(case when expected_runtime->'sessionId'='null'::jsonb then 'reserved' else 'paused' end));
  elsif kind in ('logout','pause') then
    expected_runtime:=jsonb_set(expected_runtime,'{status}',to_jsonb(case when expected_runtime->'sessionId'='null'::jsonb then 'reserved'
      when kind='logout' then 'logged_out' else 'paused' end));
    ok:=ready and policy->'ok'='true'::jsonb;status:=case when ok then 200 else 409 end;
    if ok then code:=case when kind='logout' then 'final_logged_out' else 'final_paused' end;end if;
  elsif controls then
    expected_runtime:=jsonb_set(expected_runtime,'{status}',to_jsonb(case when expected_runtime->'sessionId'='null'::jsonb then 'reserved' else 'paused' end));
    ok:=policy->'ok'='true'::jsonb;status:=case when ok then 200 else 409 end;code:=policy->>'code';
  elsif policy->'ok'='true'::jsonb and policy->>'code'='session_policy_allowed' and ready then
    if opening then
      new_session:=p_runtime->>'sessionId';
      if not coalesce(new_session ~* uuid_pattern,false) or p_runtime->'sessionId' is not distinct from p_old_runtime->'sessionId' then
        raise exception 'nmls_final_delivery_invalid_session_rotation';end if;
      expected_runtime:=expected_runtime||jsonb_build_object('sessionId',new_session,'lastActivityMs',p_at,'status','active');
    end if;
    if expected_runtime->>'status'='active' then
      if kind='interaction' and p_command->'visible'='true'::jsonb and not initial then
        expected_runtime:=jsonb_set(expected_runtime,'{lastActivityMs}',to_jsonb(p_at));end if;
      candidate:=true;ok:=true;status:=200;code:=case when opening then 'final_session_opened' else 'final_activity_checked' end;
      until_ms:=least(p_at+(policy->>'maxNextStudyMs')::bigint,(expected_runtime->>'lastActivityMs')::bigint+360000);
      if until_ms is null or until_ms<=p_at or until_ms>p_at+30000 then raise exception 'nmls_final_delivery_invalid_horizon';end if;
    end if;
  end if;
  if not candidate and expected_runtime->>'status'='active' then expected_runtime:=jsonb_set(expected_runtime,'{status}','"paused"');end if;
  if not outside_window then
    if candidate then
      scope:=jsonb_build_object('actorId',p_actor,'attemptId',p_attempt,'offeringId',p_phase->'offeringId',
        'contentDigest',p_phase->'contentDigest','sessionId',expected_runtime->'sessionId','finalPhase',p_phase);
      current_w:=journal->'active';
      if current_w<>'null'::jsonb and current_w->'scope'=scope then
        current_w:=current_w||jsonb_build_object('runtimeRevision',expected_runtime->'revision','horizonMs',until_ms);
      else
        if current_w<>'null'::jsonb then decision_audit:=decision_audit||jsonb_build_object('closedWindow',current_w);end if;
        new_id:=p_after#>>'{observationJournal,active,id}';
        if not coalesce(new_id ~* uuid_pattern,false) or new_id=current_w->>'id' or new_id=p_before#>>'{observationJournal,unresolved,window,id}' then
          raise exception 'nmls_final_delivery_invalid_new_window';end if;
        current_w:=jsonb_build_object('id',new_id,'scope',scope,'materialDigest',p_phase->'selectionDigest','runtimeRevision',expected_runtime->'revision',
          'openingEventId',p_event,'issuedAtMs',p_at,'horizonMs',until_ms,'lastObservedAtMs',null);
      end if;
      journal:=jsonb_set(journal,'{active}',current_w);
    elsif journal->'active'<>'null'::jsonb then
      decision_audit:=decision_audit||jsonb_build_object('closedWindow',journal->'active');journal:=jsonb_set(journal,'{active}','null');
    end if;
    expected_ledger:=jsonb_set(expected_ledger,'{observationJournal}',journal);
  end if;
  expected_ledger:=expected_ledger||jsonb_build_object('revision',(p_before->>'revision')::bigint+1,'lastReceiptMs',p_at);
  if not outside_window and journal->'unresolved'<>'null'::jsonb and journal#>>'{unresolved,reason}' in
    ('receipt_missing_or_stale','visibility_interrupted','horizon_expired','receipt_gap','session_interrupted') then
    recovery:=jsonb_build_object('windowId',journal#>'{unresolved,window,id}','eligibleAtMs',journal#>'{unresolved,detectedAtMs}');end if;
  expected_outcome:=jsonb_build_object('ok',ok,'code',code,'status',status,'finalAttemptId',p_phase->'finalAttemptId','finalRevision',2,
    'revision',expected_runtime->'revision','actorRevision',expected_ledger->'revision','runtimeStatus',expected_runtime->'status',
    'candidateMaterialAllowed',candidate,'candidateUntilMs',until_ms,'candidateWindow',case when candidate then jsonb_build_object('id',journal#>'{active,id}','expiresAtMs',until_ms) else null end,
    'recovery',recovery,'resumeNotBeforeMs',resume_ms,'policyCode',policy->'code','observationCode',observation_code,
    'mode','private_transition_candidate','deliveryAllowed',false,'studentDeliveryEnabled',false,'creditIssuanceAllowed',false);
  expected_audit:=jsonb_build_object('eventId',p_event,'kind',kind,'atMs',p_at,'phase',p_phase,'runtimeBeforeRevision',p_old_runtime->'revision',
    'policy',policy->'audit','observation',decision_audit,'instructionalTimeAddedMs',0,'creditAddedMs',0);
  if candidate then expected_audit:=expected_audit||jsonb_build_object('windowAfter',journal->'active');end if;
  if p_runtime is distinct from expected_runtime then raise exception 'nmls_final_delivery_runtime_transition';end if;
  if p_after is distinct from expected_ledger then raise exception 'nmls_final_delivery_ledger_transition';end if;
  if p_audit is distinct from expected_audit then raise exception 'nmls_final_delivery_audit_transition';end if;
  if p_outcome is distinct from expected_outcome then raise exception 'nmls_final_delivery_outcome_transition';end if;
  -- Defense against an already-underreported scalar: never let a green label
  -- or truncated counter override the independently retained observed union.
  if candidate then
    combined:=public.nmls_policy_interval_union(p_after->'studyIntervals',p_after#>'{uncertainExposure,intervals}');
    boundary:=coalesce((p_after->>'studyBoundaryAtMs')::bigint,p_at);
    since_break:=greatest((p_after->>'studySinceBreakMs')::bigint,public.nmls_policy_exposure_in_range(p_after->'studyIntervals',boundary,p_at))+
      public.nmls_policy_exposure_in_range(combined,boundary,p_at)-public.nmls_policy_exposure_in_range(p_after->'studyIntervals',boundary,p_at);
    rolling:=public.nmls_policy_exposure_in_range(combined,p_at-86400000,p_at);
    if since_break>=12000000 or rolling>=36000000 or until_ms>p_at+12000000-since_break or until_ms>p_at+36000000-rolling then
      raise exception 'nmls_final_delivery_underreported_exposure';end if;
  end if;
end $$;


alter table public.nmls_review_study_leases drop constraint nmls_review_lease_phase_shape;
alter table public.nmls_review_study_leases add constraint nmls_review_lease_phase_shape check(coalesce(
  (phase_kind is null and phase_owner_id is null) or
  (phase_kind in ('source','remediation','final','second_final') and phase_owner_id is not null and attempt_id is not null and session_id is not null),false));

-- Neither a caller-set flag nor a lone037 row authorizes a lease transition.
create or replace function public.nmls_review_lease_phase_integrity() returns trigger
language plpgsql set search_path=pg_catalog,public as $$
declare before_value jsonb; e public.nmls_teaching_events; fe public.nmls_first_final_delivery_events;
  h public.nmls_first_final_handoff_events; se public.nmls_second_final_delivery_events;
begin
  if tg_op='DELETE' then
    if old.phase_kind is not null then raise exception 'nmls_review_phase_lease_transition_requires_joint_commit'; end if;
    return old;
  end if;
  before_value:=case when tg_op='UPDATE' then to_jsonb(old) else null end;
  if tg_op='UPDATE' and new.student_id is distinct from old.student_id then raise exception 'nmls_review_invalid_phase_lease'; end if;
  if tg_op='UPDATE' and new is not distinct from old then return new; end if;
  -- A second-final marker is sticky, including when paused or logged out.
  if tg_op='UPDATE' and old.phase_kind='second_final' and
    (new.phase_kind is distinct from 'second_final' or new.phase_owner_id is distinct from old.phase_owner_id
      or new.attempt_id is distinct from old.attempt_id) then raise exception 'nmls_review_session_conflict'; end if;
  if new.phase_kind='second_final' then
    select * into se from public.nmls_second_final_delivery_events where student_id=new.student_id
      and transaction_id=txid_current() and lease_before is not distinct from before_value and lease_after=to_jsonb(new)
      order by actor_revision desc limit 1;
    if not found or new.attempt_id is distinct from se.review_attempt_id or new.phase_owner_id is distinct from se.second_id
      or new.session_id::text is distinct from se.runtime->>'sessionId'
      or new.phase_active is distinct from (se.runtime->>'status'='active')
      or not exists(select 1 from public.nmls_review_actor_policy where student_id=new.student_id and revision=se.actor_revision)
      or not exists(select 1 from public.nmls_review_attempts where id=se.review_attempt_id and student_id=new.student_id and revision=se.source_revision)
      or not exists(select 1 from public.nmls_second_final_deliveries where second_id=se.second_id and first_final_id=se.first_final_id
        and student_id=new.student_id and review_attempt_id=se.review_attempt_id and revision=se.delivery_revision and runtime=se.runtime)
      or not exists(select 1 from public.nmls_private_remediations where first_final_id=se.first_final_id and second_id=se.second_id
        and student_id=new.student_id and review_attempt_id=se.review_attempt_id and revision=se.workflow_revision and status='second_issued')
      or not exists(select 1 from public.nmls_private_finals where id=se.first_final_id and student_id=new.student_id
        and review_attempt_id=se.review_attempt_id and revision=2 and result->'passed'='false'::jsonb) then
      raise exception 'nmls_review_phase_lease_transition_requires_joint_commit'; end if;
    if old.phase_kind is distinct from 'second_final' and
      (old.phase_kind is distinct from 'remediation' or old.phase_owner_id is distinct from se.first_final_id
        or old.attempt_id is distinct from se.review_attempt_id or old.phase_active
        or se.runtime_before->'sessionId' is distinct from 'null'::jsonb
        or new.session_id is not distinct from old.session_id) then
      raise exception 'nmls_review_phase_lease_transition_requires_joint_commit'; end if;
    return new;
  end if;
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


-- Keep older teaching/reservation histories readable, never allow a fresh
-- source/child writer to reclaim a live OR dormant second-final marker.
-- Preserve helper OIDs so already-planned older callers cannot retain a
-- renamed, weaker fence. The original035 grant/actor/final checks stay intact.
create or replace function public.nmls_first_final_delivery_prior_write_fence(p_actor uuid,p_review uuid,p_event uuid,p_namespace text)
returns void language plpgsql set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants; lease public.nmls_review_study_leases;
begin
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a0 on a0.grant_id=g0.id
    where a0.id=p_review for share of g0;
  if not found or g.student_id is distinct from p_actor or g.status is distinct from 'active'
    or g.expires_at<=clock_timestamp() then raise exception 'nmls_review_access_denied'; end if;
  insert into public.nmls_review_study_leases(student_id) values(p_actor) on conflict do nothing;
  select * into lease from public.nmls_review_study_leases where student_id=p_actor for update;
  if exists(select 1 from public.nmls_first_final_delivery_events where student_id=p_actor and event_id=p_event)
    or exists(select 1 from public.nmls_second_final_delivery_events where student_id=p_actor and event_id=p_event) then
    raise exception 'nmls_review_idempotency_conflict'; end if;
  if lease.phase_kind in ('final','second_final') and not (
    p_namespace='teaching' and exists(select 1 from public.nmls_teaching_events where student_id=p_actor and event_id=p_event)
    or p_namespace='reservation' and exists(select 1 from public.nmls_final_reservation_events where student_id=p_actor and event_id=p_event)
  ) then raise exception 'nmls_review_session_conflict'; end if;
end $$;
create or replace function public.nmls_review_legacy_write_fence(p_actor uuid,p_review uuid,p_event uuid,p_digest text,p_namespace text)
returns void language plpgsql set search_path=pg_catalog,public as $$
begin
  perform public.nmls_review_pre_final_delivery_fence_internal(p_actor,p_review,p_event,p_digest,p_namespace);
  if exists(select 1 from public.nmls_first_final_delivery_events where student_id=p_actor and event_id=p_event)
    or exists(select 1 from public.nmls_second_final_delivery_events where student_id=p_actor and event_id=p_event) then
    raise exception 'nmls_review_idempotency_conflict'; end if;
end $$;

create function public.nmls_second_final_delivery_context(p_student_id uuid,p_attempt_id uuid,p_first_final_id uuid,p_second_final_id uuid,p_event_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare result jsonb; w public.nmls_private_remediations; r public.nmls_second_final_reservation_events;
begin
  result:=public.nmls_second_final_reservation_context(p_student_id,p_attempt_id,p_first_final_id,p_event_id);
  select * into w from public.nmls_private_remediations where first_final_id=p_first_final_id;
  if w.student_id is distinct from p_student_id or w.review_attempt_id is distinct from p_attempt_id
    or w.second_id is distinct from p_second_final_id or p_second_final_id is null then
    raise exception 'nmls_second_final_delivery_access_denied'; end if;
  select * into r from public.nmls_second_final_reservation_events where student_id=p_student_id
    and first_final_id=p_first_final_id and reserved;
  return result||jsonb_build_object(
    'secondReservationOrigin',case when r.event_id is null then null else to_jsonb(r) end,
    'secondReservationOriginTeachingEvent',(select to_jsonb(t) from public.nmls_teaching_events t where t.student_id=p_student_id and t.event_id=r.event_id),
    'secondDelivery',(select to_jsonb(d) from public.nmls_second_final_deliveries d where d.second_id=p_second_final_id and d.student_id=p_student_id),
    'secondDeliveryEvent',(select to_jsonb(e) from public.nmls_second_final_delivery_events e where e.student_id=p_student_id and e.event_id=p_event_id),
    'serverTimeMs',floor(extract(epoch from clock_timestamp())*1000)::bigint);
end $$;

-- A metadata replay of the immutable038 pair rechecks original grant, complete
-- ROCS presentation, source pins, first seal, real037 handoff and terminal032
-- child evidence. It neither grades nor draws nor invokes a fresh child write.
create function public.nmls_second_final_delivery_origin_guard(p_actor uuid,p_attempt uuid,p_first uuid,p_second uuid,
  p_definition_digest text,p_definition jsonb,p_at bigint)
returns jsonb language plpgsql set search_path=pg_catalog,public as $$
declare r public.nmls_second_final_reservation_events; w public.nmls_private_remediations;
  checked jsonb; intent jsonb; issued_ms bigint; at_ms bigint;
begin
  select * into r from public.nmls_second_final_reservation_events where student_id=p_actor and first_final_id=p_first and reserved;
  if not found or r.review_attempt_id is distinct from p_attempt or r.second_id is distinct from p_second
    or r.definition_digest is distinct from p_definition_digest then raise exception 'nmls_second_final_delivery_reservation_required'; end if;
  intent:=jsonb_build_object('kind','reserve_second_final','attemptId',p_attempt,'firstFinalId',p_first,'eventId',r.event_id,
    'expectedSourceRevision',r.source_revision,'expectedFinalRevision',2,'expectedWorkflowRevision',r.workflow_before_revision,
    'expectedRevision',r.runtime_before_revision,'expectedActorRevision',r.actor_before_revision,'sessionId',r.session_id);
  checked:=public.nmls_second_final_reservation_commit(p_actor,p_attempt,p_first,r.event_id,r.command_digest,r.source_revision,2,
    r.workflow_before_revision,r.runtime_before_revision,r.actor_before_revision,r.session_id,p_at,p_definition_digest,p_definition,intent,
    null,null,'{}'::jsonb);
  if checked is distinct from jsonb_build_object('duplicate',true,'outcome',r.outcome) then
    raise exception 'nmls_second_final_delivery_reservation_required'; end if;
  select * into w from public.nmls_private_remediations where first_final_id=p_first;
  issued_ms:=floor(extract(epoch from w.second_issued_at)*1000)::bigint;
  at_ms:=(r.runtime->>'lastReceiptMs')::bigint;
  if not isfinite(w.second_issued_at) or issued_ms is null or abs(issued_ms-at_ms)>1000
    or issued_ms>floor(extract(epoch from clock_timestamp())*1000)::bigint+1000 then
    raise exception 'nmls_second_final_delivery_reservation_required'; end if;
  return to_jsonb(r);
end $$;

create function public.nmls_second_final_delivery_runtime_guard(p_runtime jsonb,p_phase jsonb,p_at bigint)
returns void language plpgsql set search_path=pg_catalog,public as $$
begin
  if jsonb_typeof(p_runtime) is distinct from 'object'
    or not(p_runtime ?& array['version','finalAttemptId','phaseDigest','revision','status','sessionId','lastActivityMs','lastReceiptMs','creditIssuanceAllowed'])
    or p_runtime-array['version','finalAttemptId','phaseDigest','revision','status','sessionId','lastActivityMs','lastReceiptMs','creditIssuanceAllowed']<>'{}'::jsonb
    or p_runtime->>'version' is distinct from 'nmls-second-final-delivery-v1'
    or p_runtime->'finalAttemptId' is distinct from p_phase->'finalAttemptId'
    or p_runtime->>'phaseDigest' is distinct from public.nmls_first_final_submission_hash(p_phase)
    or not public.nmls_final_guard_integer(p_runtime->'revision',9007199254740991,false)
    or not public.nmls_final_guard_integer(p_runtime->'lastReceiptMs',p_at,false)
    or not public.nmls_final_guard_integer(p_runtime->'lastActivityMs',(p_runtime->>'lastReceiptMs')::bigint,true)
    or p_runtime->'creditIssuanceAllowed' is distinct from 'false'::jsonb
    or not coalesce(p_runtime->>'status' in ('reserved','active','paused','logged_out'),false)
    or p_runtime->'sessionId'<>'null'::jsonb and not coalesce(p_runtime->>'sessionId' ~*
      '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false)
    or (p_runtime->'sessionId'='null'::jsonb) is distinct from (p_runtime->'lastActivityMs'='null'::jsonb)
    or p_runtime->>'status'='active' and p_runtime->'sessionId'='null'::jsonb
    or p_runtime->>'status'='reserved' and p_runtime->'sessionId'<>'null'::jsonb then
    raise exception 'nmls_second_final_delivery_invalid_runtime'; end if;
  if p_runtime->'revision'='0'::jsonb and p_runtime is distinct from jsonb_build_object(
    'version','nmls-second-final-delivery-v1','finalAttemptId',p_phase->'finalAttemptId',
    'phaseDigest',public.nmls_first_final_submission_hash(p_phase),'revision',0,'status','reserved','sessionId',null,
    'lastActivityMs',null,'lastReceiptMs',0,'creditIssuanceAllowed',false) then
    raise exception 'nmls_second_final_delivery_invalid_runtime'; end if;
end $$;

create function public.nmls_second_final_delivery_commit(
  p_student_id uuid,p_attempt_id uuid,p_first_final_id uuid,p_second_final_id uuid,p_event_id uuid,p_command_digest text,
  p_expected_source_revision bigint,p_expected_final_revision bigint,p_expected_workflow_revision bigint,
  p_expected_delivery_revision bigint,p_expected_actor_revision bigint,p_expected_session_id uuid,p_evaluated_at_ms bigint,
  p_definition_digest text,p_definition jsonb,p_transition jsonb
) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants; b public.nmls_review_policy_bindings; a public.nmls_review_attempts;
  lease public.nmls_review_study_leases; l public.nmls_review_actor_policy; f public.nmls_private_finals;
  first_delivery public.nmls_first_final_deliveries; w public.nmls_private_remediations;
  d public.nmls_second_final_deliveries; de public.nmls_second_final_delivery_events;
  receipt public.nmls_review_rocs_presentations; origin jsonb; phase jsonb; phase_digest text; selected_digest text;
  old_runtime jsonb; next_runtime jsonb; next_ledger jsonb; next_outcome jsonb; proposed_audit jsonb; command_value jsonb;
  expected_lease jsonb; new_lease jsonb; historical jsonb; intent_digest text; item jsonb; prior jsonb;
  at_ms bigint; opening_ms bigint; cutoff_ms bigint; deadline_ms bigint; not_before_ms bigint; recorded_ms bigint;
begin
  if p_student_id is null or p_attempt_id is null or p_first_final_id is null or p_second_final_id is null or p_event_id is null
    or p_first_final_id=p_second_final_id or p_attempt_id in (p_first_final_id,p_second_final_id)
    or not coalesce(p_command_digest ~ '^[a-f0-9]{64}$',false) or not coalesce(p_definition_digest ~ '^[a-f0-9]{64}$',false)
    or p_expected_final_revision is distinct from 2 then raise exception 'nmls_second_final_delivery_invalid_command'; end if;
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a0 on a0.grant_id=g0.id
    where a0.id=p_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status is distinct from 'active' or g.expires_at<=clock_timestamp() then
    raise exception 'nmls_second_final_delivery_access_denied'; end if;
  select * into lease from public.nmls_review_study_leases where student_id=p_student_id for update;
  select * into l from public.nmls_review_actor_policy where student_id=p_student_id for update;
  select * into a from public.nmls_review_attempts where id=p_attempt_id for update;
  select * into f from public.nmls_private_finals where id=p_first_final_id for update;
  select * into first_delivery from public.nmls_first_final_deliveries where final_id=p_first_final_id for update;
  select * into w from public.nmls_private_remediations where first_final_id=p_first_final_id for update;
  select * into d from public.nmls_second_final_deliveries where second_id=p_second_final_id for update;
  select * into b from public.nmls_review_policy_bindings where grant_id=g.id;
  if a.student_id is distinct from p_student_id or f.student_id is distinct from p_student_id or f.review_attempt_id is distinct from a.id
    or f.revision is distinct from 2 or w.student_id is distinct from p_student_id or w.review_attempt_id is distinct from a.id
    or w.second_id is distinct from p_second_final_id or w.definition_digest is distinct from p_definition_digest
    or l.student_id is null or l.revision is distinct from (l.ledger->>'revision')::bigint
    or l.policy_id is distinct from b.policy_id or l.policy_digest is distinct from b.policy_digest
    or l.ledger->>'actorId' is distinct from p_student_id::text or l.ledger->>'policyId' is distinct from b.policy_id then
    raise exception 'nmls_second_final_delivery_scope_changed'; end if;
  origin:=public.nmls_second_final_delivery_origin_guard(p_student_id,a.id,f.id,w.second_id,p_definition_digest,p_definition,p_evaluated_at_ms);
  if w.runtime is distinct from origin->'runtime' or a.revision is distinct from (origin->>'source_revision')::bigint
    or w.revision<(origin->>'workflow_revision')::bigint then raise exception 'nmls_second_final_delivery_scope_changed'; end if;
  selected_digest:=public.nmls_first_final_submission_hash(w.second_selection);
  if selected_digest is distinct from origin->>'selection_digest' then raise exception 'nmls_second_final_delivery_scope_changed'; end if;
  phase:=jsonb_build_object('version','nmls-second-final-phase-v1','actorId',p_student_id,'reviewAttemptId',a.id,
    'firstFinalAttemptId',f.id,'finalAttemptId',w.second_id,'courseKey',a.course_key,'contentDigest',a.content_digest,
    'definitionDigest',p_definition_digest,'selectionDigest',selected_digest,'offeringId',g.id);
  phase_digest:=public.nmls_first_final_submission_hash(phase);
  at_ms:=floor(extract(epoch from clock_timestamp())*1000);
  if d.second_id is not null then
    if d.student_id is distinct from p_student_id or d.first_final_id is distinct from f.id or d.review_attempt_id is distinct from a.id
      or d.phase_scope is distinct from phase or d.runtime->'revision' is distinct from to_jsonb(d.revision)
      or (d.runtime->>'lastReceiptMs')::bigint>(l.ledger->>'lastReceiptMs')::bigint then
      raise exception 'nmls_second_final_delivery_scope_changed'; end if;
    perform public.nmls_second_final_delivery_runtime_guard(d.runtime,phase,at_ms+1000);
  end if;
  expected_lease:=jsonb_build_object('student_id',p_student_id,'attempt_id',a.id,'phase_kind','remediation',
    'phase_owner_id',f.id,'phase_active',false,'session_id',w.runtime->'sessionId');
  -- Current authority and original038 history are verified before replay. A
  -- replay does not execute control arithmetic or recreate a material permit.
  select * into de from public.nmls_second_final_delivery_events where student_id=p_student_id and event_id=p_event_id;
  if found then
    if de.second_id is distinct from w.second_id or de.first_final_id is distinct from f.id or de.review_attempt_id is distinct from a.id
      or de.reservation_event_id::text is distinct from origin->>'event_id' or de.command_digest is distinct from p_command_digest
      or de.definition_digest is distinct from p_definition_digest or de.source_revision is distinct from p_expected_source_revision
      or de.final_revision is distinct from p_expected_final_revision or de.workflow_revision is distinct from p_expected_workflow_revision
      or de.delivery_revision-1 is distinct from p_expected_delivery_revision or de.actor_revision-1 is distinct from p_expected_actor_revision
      or de.runtime_before->>'sessionId' is distinct from p_expected_session_id::text
      or d.second_id is null or d.revision<de.delivery_revision or l.revision<de.actor_revision or w.revision<de.workflow_revision
      or d.revision=de.delivery_revision and d.runtime is distinct from de.runtime
      or de.runtime->'revision' is distinct from to_jsonb(de.delivery_revision)
      or de.runtime_before->'revision' is distinct from to_jsonb(de.delivery_revision-1)
      or de.command->>'eventId' is distinct from p_event_id::text
      or de.command->'expectedRevision' is distinct from to_jsonb(de.delivery_revision-1)
      or de.command->'expectedActorRevision' is distinct from to_jsonb(de.actor_revision-1)
      or de.command->'sessionId' is distinct from de.runtime_before->'sessionId'
      or de.audit->'phase' is distinct from phase or de.audit->>'eventId' is distinct from p_event_id::text
      or de.audit->'kind' is distinct from de.command->'kind'
      or de.audit->'runtimeBeforeRevision' is distinct from de.runtime_before->'revision'
      or de.audit->'atMs' is distinct from de.runtime->'lastReceiptMs'
      or de.audit->'instructionalTimeAddedMs' is distinct from '0'::jsonb or de.audit->'creditAddedMs' is distinct from '0'::jsonb
      or de.audit#>>'{policy,actorId}' is distinct from p_student_id::text
      or de.audit#>>'{policy,offeringId}' is distinct from g.id::text
      or de.audit#>>'{policy,contentDigest}' is distinct from a.content_digest
      or de.audit#>>'{policy,policyId}' is distinct from b.policy_id
      or de.audit#>'{policy,atMs}' is distinct from de.runtime->'lastReceiptMs'
      or de.outcome->'revision' is distinct from to_jsonb(de.delivery_revision)
      or de.outcome->'actorRevision' is distinct from to_jsonb(de.actor_revision)
      or de.outcome->'finalAttemptId' is distinct from phase->'finalAttemptId'
      or de.outcome->'finalRevision' is distinct from '2'::jsonb
      or de.outcome->'runtimeStatus' is distinct from de.runtime->'status'
      or de.outcome->'candidateMaterialAllowed' is distinct from 'false'::jsonb
      or de.outcome->'candidateUntilMs' is distinct from 'null'::jsonb or de.outcome->'candidateWindow' is distinct from 'null'::jsonb
      or de.outcome->'deliveryAllowed' is distinct from 'false'::jsonb
      or de.outcome->'studentDeliveryEnabled' is distinct from 'false'::jsonb
      or de.outcome->'creditIssuanceAllowed' is distinct from 'false'::jsonb
      or de.transaction_id<1 then raise exception 'nmls_review_idempotency_conflict'; end if;
    intent_digest:=public.nmls_first_final_submission_hash(de.command||jsonb_build_object('attemptId',a.id,'firstFinalId',f.id,
      'secondFinalId',w.second_id,'expectedSourceRevision',de.source_revision,'expectedFinalRevision',2,'expectedWorkflowRevision',de.workflow_revision));
    recorded_ms:=(de.runtime->>'lastReceiptMs')::bigint;
    new_lease:=case when de.runtime->>'sessionId' is null then expected_lease else jsonb_build_object(
      'student_id',p_student_id,'attempt_id',a.id,'phase_kind','second_final','phase_owner_id',w.second_id,
      'phase_active',de.runtime->>'status'='active','session_id',de.runtime->'sessionId') end;
    historical:=case when de.runtime_before->>'sessionId' is null then expected_lease else jsonb_build_object(
      'student_id',p_student_id,'attempt_id',a.id,'phase_kind','second_final','phase_owner_id',w.second_id,
      'phase_active',de.runtime_before->>'status'='active','session_id',de.runtime_before->'sessionId') end;
    if intent_digest is distinct from p_command_digest or de.lease_before is distinct from historical or de.lease_after is distinct from new_lease
      or recorded_ms<(origin#>>'{runtime,lastReceiptMs}')::bigint
      or recorded_ms<(de.runtime_before->>'lastReceiptMs')::bigint
      or recorded_ms>(l.ledger->>'lastReceiptMs')::bigint
      or abs(recorded_ms-floor(extract(epoch from de.recorded_at)*1000)::bigint)>1000 then
      raise exception 'nmls_review_idempotency_conflict'; end if;
    perform public.nmls_second_final_delivery_runtime_guard(de.runtime,phase,at_ms+1000);
    perform public.nmls_second_final_delivery_runtime_guard(de.runtime_before,phase,recorded_ms);
    return jsonb_build_object('duplicate',true,'outcome',de.outcome,'runtime',de.runtime,
      'sourceRevision',de.source_revision,'workflowRevision',de.workflow_revision);
  end if;
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
  if w.status is distinct from 'second_issued' or w.second_answers is not null or w.second_result is not null or w.second_submitted_at is not null then
    raise exception 'nmls_second_final_delivery_not_reserved'; end if;
  if a.revision is distinct from p_expected_source_revision or w.revision is distinct from p_expected_workflow_revision
    or coalesce(d.revision,0) is distinct from p_expected_delivery_revision or l.revision is distinct from p_expected_actor_revision then
    raise exception 'nmls_review_revision_conflict'; end if;
  old_runtime:=case when d.second_id is not null then d.runtime else jsonb_build_object(
    'version','nmls-second-final-delivery-v1','finalAttemptId',w.second_id,'phaseDigest',phase_digest,'revision',0,
    'status','reserved','sessionId',null,'lastActivityMs',null,'lastReceiptMs',0,'creditIssuanceAllowed',false) end;
  if old_runtime->>'sessionId' is distinct from p_expected_session_id::text then raise exception 'nmls_review_session_conflict'; end if;
  if old_runtime->>'sessionId' is null then
    if to_jsonb(lease) is distinct from expected_lease
      or l.ledger#>'{observationJournal,active}' is distinct from 'null'::jsonb
      or l.ledger#>'{observationJournal,unresolved}' is distinct from 'null'::jsonb then raise exception 'nmls_review_session_conflict'; end if;
  elsif lease.attempt_id is distinct from a.id or lease.phase_kind is distinct from 'second_final' or lease.phase_owner_id is distinct from w.second_id
    or lease.session_id is distinct from p_expected_session_id or lease.phase_active is distinct from (old_runtime->>'status'='active') then
    raise exception 'nmls_review_session_conflict'; end if;
  if jsonb_typeof(p_transition) is distinct from 'object' or not(p_transition ?& array['phase','command','runtime','ledger','outcome','audit'])
    or p_transition-array['phase','command','runtime','ledger','outcome','audit']<>'{}'::jsonb then
    raise exception 'nmls_second_final_delivery_invalid_transition'; end if;
  command_value:=p_transition->'command'; next_runtime:=p_transition->'runtime'; next_ledger:=p_transition->'ledger';
  next_outcome:=p_transition->'outcome'; proposed_audit:=p_transition->'audit';
  if p_transition->'phase' is distinct from phase or command_value->>'eventId' is distinct from p_event_id::text
    or command_value->'expectedRevision' is distinct from to_jsonb(p_expected_delivery_revision)
    or command_value->'expectedActorRevision' is distinct from to_jsonb(p_expected_actor_revision)
    or command_value->'sessionId' is distinct from coalesce(to_jsonb(p_expected_session_id),'null'::jsonb) then
    raise exception 'nmls_second_final_delivery_invalid_transition'; end if;
  intent_digest:=public.nmls_first_final_submission_hash(command_value||jsonb_build_object('attemptId',a.id,'firstFinalId',f.id,
    'secondFinalId',w.second_id,'expectedSourceRevision',p_expected_source_revision,'expectedFinalRevision',2,
    'expectedWorkflowRevision',p_expected_workflow_revision));
  if intent_digest is distinct from p_command_digest then raise exception 'nmls_second_final_delivery_command_digest'; end if;
  opening_ms:=(b.offering->>'opensAtMs')::bigint; cutoff_ms:=(b.offering->>'closesAtMs')::bigint;
  not_before_ms:=greatest((a.runtime->>'lastReceiptMs')::bigint,(l.ledger->>'lastReceiptMs')::bigint,
    (old_runtime->>'lastReceiptMs')::bigint,(origin#>>'{runtime,lastReceiptMs}')::bigint,
    floor(extract(epoch from w.second_issued_at)*1000)::bigint,
    floor(extract(epoch from (origin->>'recorded_at')::timestamptz)*1000)::bigint,
    (select floor(extract(epoch from t.recorded_at)*1000)::bigint from public.nmls_teaching_events t
      where t.student_id=p_student_id and t.event_id=(origin->>'event_id')::uuid));
  if p_evaluated_at_ms is null or p_evaluated_at_ms<not_before_ms or p_evaluated_at_ms>at_ms+1000 or at_ms-p_evaluated_at_ms>1000
    or (at_ms<opening_ms) is distinct from (p_evaluated_at_ms<opening_ms)
    or (at_ms>=cutoff_ms) is distinct from (p_evaluated_at_ms>=cutoff_ms)
    or old_runtime->>'status'='active' and p_evaluated_at_ms<(old_runtime->>'lastActivityMs')::bigint+360000
      and at_ms>=(old_runtime->>'lastActivityMs')::bigint+360000 then raise exception 'nmls_review_clock_refresh_required'; end if;
  perform public.nmls_second_final_delivery_guard(l.ledger,next_ledger,old_runtime,next_runtime,next_outcome,proposed_audit,
    b.offering,p_student_id,a.id,p_event_id,p_evaluated_at_ms,phase,command_value);
  -- New second sessions never impersonate source, first-final, completed-child,
  -- or their own preceding session. No actor budget/session clock is bootstrapped.
  if next_runtime->>'sessionId' is not null and next_runtime->'sessionId' is distinct from old_runtime->'sessionId' then
    if next_runtime->'sessionId' in (a.runtime->'sessionId',first_delivery.runtime->'sessionId',w.runtime->'sessionId') then
      raise exception 'nmls_second_final_delivery_session_reused'; end if;
  end if;
  perform public.nmls_first_final_delivery_rocs_guard(next_ledger,p_student_id,g.id,b.offering);
  for prior in select value from jsonb_array_elements(l.ledger->'acceptances') loop
    if not coalesce((next_ledger->'acceptances') @> jsonb_build_array(prior),false) then
      raise exception 'nmls_review_invalid_rocs_receipt'; end if;
  end loop;
  for item in select value from jsonb_array_elements(next_ledger->'acceptances') loop
    if not (l.ledger->'acceptances') @> jsonb_build_array(item) then
      select * into receipt from public.nmls_review_rocs_presentations where id=(item->>'presentationId')::uuid;
      if not found or command_value->>'kind' is distinct from 'accept_rocs' or command_value->'presentationId' is distinct from item->'presentationId'
        or receipt.student_id is distinct from p_student_id or receipt.grant_id is distinct from g.id
        or receipt.document_digest is distinct from item->>'documentDigest' or item->>'actorId' is distinct from p_student_id::text
        or item->>'offeringId' is distinct from g.id::text or item->>'contentDigest' is distinct from a.content_digest
        or item->>'documentDigest' is distinct from b.offering#>>'{rocs,documentDigest}' or item->>'version' is distinct from b.offering#>>'{rocs,version}'
        or item->>'evidenceId' is distinct from b.offering#>>'{rocs,evidenceId}'
        or item->'presentedAtMs' is distinct from to_jsonb(receipt.presented_at_ms) or item->'acceptedAtMs' is distinct from to_jsonb(p_evaluated_at_ms)
        or receipt.presented_at_ms>p_evaluated_at_ms or receipt.presented_at_ms<opening_ms
        or item->>'retentionYears' is distinct from '5' then raise exception 'nmls_review_invalid_rocs_receipt'; end if;
    end if;
  end loop;
  if next_outcome->'candidateMaterialAllowed'='true'::jsonb then
    deadline_ms:=least(public.nmls_second_final_budget_guard(next_ledger,b.offering,p_evaluated_at_ms),
      (next_outcome->>'candidateUntilMs')::bigint,(next_runtime->>'lastActivityMs')::bigint+360000);
    if b.offering#>'{rocs,fullDocumentVerified}' is distinct from 'true'::jsonb or deadline_ms is null or p_evaluated_at_ms>=deadline_ms then
      raise exception 'nmls_second_final_delivery_invalid_access'; end if;
    if at_ms>=deadline_ms then raise exception 'nmls_review_clock_refresh_required'; end if;
  end if;
  new_lease:=case when next_runtime->>'sessionId' is null then to_jsonb(lease) else jsonb_build_object(
    'student_id',p_student_id,'attempt_id',a.id,'session_id',next_runtime->'sessionId','phase_kind','second_final',
    'phase_owner_id',w.second_id,'phase_active',next_runtime->>'status'='active') end;
  insert into public.nmls_second_final_deliveries(second_id,first_final_id,student_id,review_attempt_id,phase_scope,revision,runtime)
    values(w.second_id,f.id,p_student_id,a.id,phase,(next_runtime->>'revision')::bigint,next_runtime)
    on conflict(second_id) do update set revision=excluded.revision,runtime=excluded.runtime;
  update public.nmls_review_actor_policy set revision=(next_ledger->>'revision')::bigint,ledger=next_ledger,updated_at=clock_timestamp()
    where student_id=p_student_id;
  historical:=next_outcome||jsonb_build_object('candidateMaterialAllowed',false,'candidateUntilMs',null,'candidateWindow',null);
  insert into public.nmls_second_final_delivery_events(student_id,event_id,second_id,first_final_id,review_attempt_id,reservation_event_id,
    command_digest,definition_digest,source_revision,final_revision,workflow_revision,delivery_revision,actor_revision,command,
    runtime_before,runtime,lease_before,lease_after,outcome,audit)
    values(p_student_id,p_event_id,w.second_id,f.id,a.id,(origin->>'event_id')::uuid,p_command_digest,p_definition_digest,
      a.revision,2,w.revision,(next_runtime->>'revision')::bigint,(next_ledger->>'revision')::bigint,command_value,
      old_runtime,next_runtime,to_jsonb(lease),new_lease,historical,proposed_audit);
  update public.nmls_review_study_leases set attempt_id=(new_lease->>'attempt_id')::uuid,session_id=(new_lease->>'session_id')::uuid,
    phase_kind=new_lease->>'phase_kind',phase_owner_id=(new_lease->>'phase_owner_id')::uuid,
    phase_active=(new_lease->>'phase_active')::boolean where student_id=p_student_id;
  at_ms:=floor(extract(epoch from clock_timestamp())*1000);
  if g.expires_at<=clock_timestamp() then raise exception 'nmls_second_final_delivery_access_denied'; end if;
  if p_evaluated_at_ms>at_ms+1000 or at_ms-p_evaluated_at_ms>1000
    or (at_ms<opening_ms) is distinct from (p_evaluated_at_ms<opening_ms)
    or (at_ms>=cutoff_ms) is distinct from (p_evaluated_at_ms>=cutoff_ms)
    or old_runtime->>'status'='active' and p_evaluated_at_ms<(old_runtime->>'lastActivityMs')::bigint+360000
      and at_ms>=(old_runtime->>'lastActivityMs')::bigint+360000
    or next_outcome->'candidateMaterialAllowed'='true'::jsonb and at_ms>=deadline_ms then raise exception 'nmls_review_clock_refresh_required'; end if;
  return jsonb_build_object('duplicate',false,'outcome',next_outcome,'runtime',next_runtime,'sourceRevision',a.revision,'workflowRevision',w.revision);
end $$;

revoke all on function public.nmls_second_final_delivery_immutable_scope(),
  public.nmls_second_final_delivery_guard(jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,uuid,uuid,uuid,bigint,jsonb,jsonb),
  public.nmls_review_lease_phase_integrity(),
  public.nmls_first_final_delivery_prior_write_fence(uuid,uuid,uuid,text),
  public.nmls_review_legacy_write_fence(uuid,uuid,uuid,text,text),
  public.nmls_second_final_delivery_origin_guard(uuid,uuid,uuid,uuid,text,jsonb,bigint),
  public.nmls_second_final_delivery_runtime_guard(jsonb,jsonb,bigint),
  public.nmls_second_final_delivery_context(uuid,uuid,uuid,uuid,uuid),
  public.nmls_second_final_delivery_commit(uuid,uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb,jsonb)
  from public,anon,authenticated,service_role;
grant execute on function public.nmls_second_final_delivery_context(uuid,uuid,uuid,uuid,uuid),
  public.nmls_second_final_delivery_commit(uuid,uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,bigint,bigint,uuid,bigint,text,jsonb,jsonb) to service_role;
commit;
