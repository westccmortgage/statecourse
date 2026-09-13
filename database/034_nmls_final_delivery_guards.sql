-- LOCAL PRIVATE CANDIDATE VALIDATION ONLY. No writer, grant or delivery permit.
-- Numerical choices mirror draft policy02, not independently approved rules.
-- Actual finalPhase windows are validated in place, never mapped into031.
begin;

create function public.nmls_final_guard_canonical(p_value jsonb) returns text
language plpgsql immutable set search_path=pg_catalog,public as $$
declare result text;
begin
  if jsonb_typeof(p_value)='object' then
    select '{'||coalesce(string_agg(to_jsonb(key)::text||':'||public.nmls_final_guard_canonical(value),',' order by key collate "C"),'')||'}'
      into result from jsonb_each(p_value);
  elsif jsonb_typeof(p_value)='array' then
    select '['||coalesce(string_agg(public.nmls_final_guard_canonical(value),',' order by ordinal),'')||']'
      into result from jsonb_array_elements(p_value) with ordinality x(value,ordinal);
  else result:=p_value::text; end if;
  return result;
end $$;

create function public.nmls_final_delivery_guard(p_before jsonb,p_after jsonb,p_old_runtime jsonb,p_runtime jsonb,
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
  if not (p_phase ?& array['version','actorId','reviewAttemptId','finalAttemptId','courseKey','contentDigest','definitionDigest','selectionDigest','offeringId'])
    or p_phase-array['version','actorId','reviewAttemptId','finalAttemptId','courseKey','contentDigest','definitionDigest','selectionDigest','offeringId']<>'{}'::jsonb
    or p_phase->>'version' is distinct from 'nmls-first-final-phase-v1' or p_phase->>'actorId' is distinct from p_actor::text
    or p_phase->>'reviewAttemptId' is distinct from p_attempt::text or not coalesce(p_phase->>'finalAttemptId' ~* uuid_pattern,false)
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
      or item->>'version' is distinct from 'nmls-first-final-delivery-v1' or item->'finalAttemptId' is distinct from p_phase->'finalAttemptId'
      or item->>'phaseDigest' is distinct from phase_digest or not public.nmls_final_guard_integer(item->'revision',9007199254740991,false)
      or not coalesce(item->>'status' in ('reserved','active','paused','logged_out'),false)
      or not public.nmls_final_guard_integer(item->'lastReceiptMs',p_at,false)
      or not public.nmls_final_guard_integer(item->'lastActivityMs',(item->>'lastReceiptMs')::bigint,true)
      or item->'creditIssuanceAllowed' is distinct from 'false'::jsonb
      or item->'sessionId'<>'null'::jsonb and not coalesce(item->>'sessionId' ~* uuid_pattern,false)
      or (item->'sessionId'='null'::jsonb) is distinct from (item->'lastActivityMs'='null'::jsonb)
      or item->>'status'='active' and item->'sessionId'='null'::jsonb
      or item->>'status'='reserved' and item->'sessionId'<>'null'::jsonb then raise exception 'nmls_final_delivery_invalid_runtime';end if;
    if item->'revision'='0'::jsonb and item is distinct from jsonb_build_object('version','nmls-first-final-delivery-v1',
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
  expected_outcome:=jsonb_build_object('ok',ok,'code',code,'status',status,'finalAttemptId',p_phase->'finalAttemptId','finalRevision',1,
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

create function public.nmls_final_guard_integer(p_value jsonb,p_max bigint,p_nullable boolean) returns boolean
language plpgsql immutable set search_path=pg_catalog,public as $$
declare n numeric;
begin
  if p_value is null then return false; end if;
  if p_value='null'::jsonb then return p_nullable; end if;
  if jsonb_typeof(p_value)<>'number' then return false; end if;
  n:=(p_value#>>'{}')::numeric;
  return n=trunc(n) and n>=0 and n<=p_max;
end $$;

-- Independent policy arithmetic/control step. No revision finalization here.
-- The outer joint writer must authenticate any new presentation receipt; this
-- helper checks its original actor/offering/document/time binding only.
create function public.nmls_final_guard_policy_step(p_ledger jsonb,p_kind text,p_offering jsonb,p_at bigint,
  p_actor uuid,p_command jsonb,p_receipt jsonb,p_interval jsonb) returns jsonb
language plpgsql set search_path=pg_catalog,public as $$
declare state jsonb:=p_ledger; accepted jsonb; doc jsonb:=p_offering->'rocs'; audit jsonb; added jsonb;
  code text; ok boolean:=false; max_next bigint; resume_at bigint; observed_ms bigint;
  combined jsonb; boundary bigint; last_possible bigint; since_break bigint; rolling bigint;
  start_ms bigint; elapsed bigint; tail jsonb; crosses_break boolean; crosses_rolling boolean;
  outside_observed boolean:=false;
begin
  <<policy>> begin
    if p_at<(p_offering->>'opensAtMs')::bigint then code:='delivery_not_open'; exit policy; end if;
    if p_at>=(p_offering->>'closesAtMs')::bigint then code:='delivery_window_closed'; exit policy; end if;
    if doc->>'version' is distinct from '4' or not coalesce(doc->>'documentDigest' ~ '^[a-f0-9]{64}$',false)
      or doc->'fullDocumentVerified' is distinct from 'true'::jsonb
      or not coalesce(doc->>'evidenceId' ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,159}$',false) then
      code:='rocs_document_unverified'; exit policy; end if;
    select value into accepted from jsonb_array_elements(state->'acceptances') where value->>'offeringId'=p_offering->>'id'
      and value->'contentDigest'=p_offering->'contentDigest' and value->'documentDigest'=doc->'documentDigest'
      and value->'version'=doc->'version' limit 1;
    if p_kind='accept_rocs' then
      if p_command->'acknowledged' is distinct from 'true'::jsonb or p_command->'version' is distinct from doc->'version'
        or p_command->'documentDigest' is distinct from doc->'documentDigest' then
        code:='rocs_acknowledgment_required'; exit policy; end if;
      if accepted is not null then ok:=true; code:='rocs_already_accepted'; exit policy; end if;
      if p_receipt is null then code:='rocs_presentation_required'; exit policy; end if;
      if jsonb_typeof(p_receipt) is distinct from 'object'
        or p_receipt-array['offeringId','contentDigest','version','documentDigest','acceptedAtMs','evidenceId','actorId',
          'presentationId','presentedAtMs','retentionYears']<>'{}'::jsonb
        or p_receipt->>'actorId' is distinct from p_actor::text or p_receipt->'offeringId' is distinct from p_offering->'id'
        or p_receipt->'contentDigest' is distinct from p_offering->'contentDigest' or p_receipt->'version' is distinct from doc->'version'
        or p_receipt->'documentDigest' is distinct from doc->'documentDigest' or p_receipt->'evidenceId' is distinct from doc->'evidenceId'
        or p_receipt->'acceptedAtMs' is distinct from to_jsonb(p_at) or p_receipt->'retentionYears' is distinct from '5'::jsonb
        or not coalesce(p_receipt->>'presentationId' ~* '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false)
        or not public.nmls_final_guard_integer(p_receipt->'presentedAtMs',p_at,false)
        or (p_receipt->>'presentedAtMs')::bigint<(p_offering->>'opensAtMs')::bigint
        or p_command ? 'presentationId' and p_command->'presentationId' is distinct from p_receipt->'presentationId' then
        raise exception 'nmls_final_delivery_invalid_rocs'; end if;
      state:=jsonb_set(state,'{acceptances}',(state->'acceptances')||jsonb_build_array(p_receipt));
      added:=p_receipt;ok:=true;code:='rocs_accepted';exit policy;
    end if;
    if accepted is null then code:='rocs_required';exit policy;end if;
    if p_kind='check_recovery' then ok:=true;code:='recovery_context_allowed';exit policy;end if;
    if p_kind='begin_break' then
      if state->'breakStartedAtMs'='null'::jsonb then state:=jsonb_set(state,'{breakStartedAtMs}',to_jsonb(p_at));end if;
      ok:=true;code:='break_started';resume_at:=(state->>'breakStartedAtMs')::bigint+600000;exit policy;
    end if;
    if p_kind='end_break' then
      if state->'breakStartedAtMs'='null'::jsonb then code:='break_not_started';exit policy;end if;
      if p_at-(state->>'breakStartedAtMs')::bigint<600000 then
        code:='break_incomplete';resume_at:=(state->>'breakStartedAtMs')::bigint+600000;exit policy;end if;
      state:=state||jsonb_build_object('breakStartedAtMs',null,'studySinceBreakMs',0,'studyBoundaryAtMs',p_at);
      ok:=true;code:='break_completed';exit policy;
    end if;
    if state->'breakStartedAtMs'<>'null'::jsonb then
      code:='break_in_progress';resume_at:=(state->>'breakStartedAtMs')::bigint+600000;exit policy;end if;
    if p_kind='open_session' then
      if state->'sessionStartedAtMs'='null'::jsonb then
        state:=state||jsonb_build_object('sessionStartedAtMs',p_at,'lastStudyAtMs',p_at,'studyBoundaryAtMs',p_at);
      else
        last_possible:=greatest(coalesce((state->>'lastStudyAtMs')::bigint,0),coalesce((state#>>'{uncertainExposure,lastBoundaryMs}')::bigint,0));
        if p_at-(state->>'sessionStartedAtMs')::bigint>=43200000 and p_at-last_possible>=43200000 then
          state:=state||jsonb_build_object('sessionStartedAtMs',p_at,'studySinceBreakMs',0,'studyBoundaryAtMs',p_at);end if;
      end if;
    end if;
    if state->'sessionStartedAtMs'='null'::jsonb then code:='session_required';exit policy;end if;
    if p_at-(state->>'sessionStartedAtMs')::bigint>=43200000 then code:='session_wall_limit';exit policy;end if;
    select coalesce(jsonb_agg(value order by n),'[]'::jsonb) into combined
      from jsonb_array_elements(state->'studyIntervals') with ordinality x(value,n) where (value->>'end')::bigint>p_at-86430000;
    state:=jsonb_set(state,'{studyIntervals}',combined);
    select coalesce(jsonb_agg(value order by n),'[]'::jsonb) into combined
      from jsonb_array_elements(state#>'{uncertainExposure,intervals}') with ordinality x(value,n) where (value->>'end')::bigint>p_at-86430000;
    state:=jsonb_set(state,'{uncertainExposure,intervals}',combined);
    combined:=public.nmls_policy_interval_union(state->'studyIntervals',state#>'{uncertainExposure,intervals}');
    boundary:=coalesce((state->>'studyBoundaryAtMs')::bigint,p_at);
    since_break:=(state->>'studySinceBreakMs')::bigint+public.nmls_policy_exposure_in_range(combined,boundary,p_at)-
      public.nmls_policy_exposure_in_range(state->'studyIntervals',boundary,p_at);
    rolling:=public.nmls_policy_exposure_in_range(combined,p_at-86400000,p_at);
    if p_kind<>'observe_study' then
      if since_break>=12000000 then code:='mandatory_break_required';exit policy;end if;
      if rolling>=36000000 then code:='rolling_study_limit';exit policy;end if;
      ok:=true;code:='session_policy_allowed';
      max_next:=least(30000,12000000-since_break,36000000-rolling,(state->>'sessionStartedAtMs')::bigint+43200000-p_at,
        (p_offering->>'closesAtMs')::bigint-p_at);exit policy;
    end if;
    start_ms:=(p_interval->>'start')::bigint;elapsed:=p_at-start_ms;
    if p_interval is null or start_ms is null or p_interval->'end' is distinct from to_jsonb(p_at) or elapsed<=0 or elapsed>30000
      or start_ms<coalesce((state->>'lastStudyAtMs')::bigint,0) or start_ms<coalesce((state->>'studyBoundaryAtMs')::bigint,0)
      or start_ms<(p_offering->>'opensAtMs')::bigint or start_ms<(accepted->>'acceptedAtMs')::bigint then
      code:='invalid_study_interval';exit policy;end if;
    crosses_break:=(state->>'studySinceBreakMs')::bigint+public.nmls_policy_exposure_in_range(combined,boundary,start_ms)-
      public.nmls_policy_exposure_in_range(state->'studyIntervals',boundary,start_ms)+elapsed>12000000;
    crosses_rolling:=public.nmls_policy_exposure_in_range(public.nmls_policy_interval_union(combined,jsonb_build_array(p_interval)),
      start_ms-86400000,p_at)>36000000;
    tail:=(state->'studyIntervals')->-1;
    if tail is not null and start_ms<(tail->>'end')::bigint then code:='overlapping_study_interval';exit policy;end if;
    state:=state||jsonb_build_object('studyIntervals',public.nmls_policy_interval_union(state->'studyIntervals',jsonb_build_array(p_interval)),
      'studySinceBreakMs',(state->>'studySinceBreakMs')::bigint+elapsed,'lastStudyAtMs',p_at);
    observed_ms:=elapsed;
    if crosses_break or crosses_rolling then code:=case when crosses_break then 'mandatory_break_required' else 'rolling_study_limit' end;
      outside_observed:=true;exit policy;end if;
    ok:=true;code:='study_interval_recorded';
  end policy;
  audit:=jsonb_build_object('kind',p_kind,'code',code,'atMs',p_at,'actorId',p_actor,'offeringId',p_offering->'id',
    'contentDigest',p_offering->'contentDigest','policyId','statecourse-oss-session-draft-2026-02');
  if added is not null then audit:=audit||jsonb_build_object('receipt',added);end if;
  if outside_observed then audit:=audit||jsonb_build_object('observedOutsidePolicy',true,'observedStudyMs',observed_ms);end if;
  return jsonb_build_object('state',state,'ok',ok,'code',code,'audit',audit,'maxNextStudyMs',max_next,
    'resumeNotBeforeMs',resume_at,'observedStudyMs',observed_ms);
end $$;

revoke all on function public.nmls_final_guard_canonical(jsonb),public.nmls_final_guard_integer(jsonb,bigint,boolean),
  public.nmls_final_guard_policy_step(jsonb,text,jsonb,bigint,uuid,jsonb,jsonb,jsonb),
  public.nmls_final_delivery_guard(jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,uuid,uuid,uuid,bigint,jsonb,jsonb)
  from public,anon,authenticated,service_role;
commit;
