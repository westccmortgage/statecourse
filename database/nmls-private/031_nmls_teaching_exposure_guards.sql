-- LOCAL ONLY. Forward validation helper after030; no acquisition or delivery RPC.
-- The future joint writer supplies phase/offering from locked authoritative rows.
-- Actual v3 provenance is checked here: no journal/version/digest projection into
-- legacy027/029. Numerical limits mirror draft policy02, not regulatory claims.
begin;

create function public.nmls_teaching_guard_exposure(
  p_before jsonb,p_after jsonb,p_old_runtime jsonb,p_runtime jsonb,
  p_outcome jsonb,p_audit jsonb,p_offering jsonb,p_actor uuid,p_attempt uuid,p_event uuid,
  p_at bigint,p_until bigint,p_phase jsonb,p_teaching_digest text
) returns void language plpgsql set search_path=pg_catalog,public as $$
declare
  old_u jsonb:=p_before->'uncertainExposure'; new_u jsonb:=p_after->'uncertainExposure';
  old_j jsonb:=p_before->'observationJournal'; new_j jsonb:=p_after->'observationJournal';
  old_hold jsonb:=old_j->'unresolved'; old_w jsonb:=old_j->'active';
  rec jsonb:=p_audit#>'{observation,recovery}'; gap jsonb:=p_audit#>'{observation,initialExposure}';
  observation jsonb:=p_audit->'observation'; settled_w jsonb;
  item jsonb; w jsonb; hold jsonb; field text; expected jsonb; retained jsonb;
  observed jsonb; observed_expected jsonb; combined jsonb;
  start_ms bigint; old_boundary bigint; new_boundary bigint; last_possible bigint;
  exposure_boundary bigint; observed_added bigint:=0; rolling_ms bigint; since_break_ms bigint;
  opening_ms bigint; cutoff_ms bigint;
  outside_window boolean; delivering boolean; has_material boolean; terminal_transition boolean;
  is_recovery boolean:=rec is not null; acknowledged boolean:=false;
  reset_break boolean; reset_session boolean;
begin
  if p_actor is null or p_attempt is null or p_event is null or p_at is null or p_at<0 or p_at>8640000000000000
    or jsonb_typeof(p_before) is distinct from 'object' or jsonb_typeof(p_after) is distinct from 'object'
    or jsonb_typeof(p_old_runtime) is distinct from 'object' or jsonb_typeof(p_runtime) is distinct from 'object'
    or jsonb_typeof(p_outcome) is distinct from 'object' or jsonb_typeof(p_audit) is distinct from 'object'
    or jsonb_typeof(p_offering) is distinct from 'object' or jsonb_typeof(observation) is distinct from 'object'
    or jsonb_typeof(p_outcome->'deliveryAllowed') is distinct from 'boolean'
    or jsonb_typeof(p_outcome#>'{progress,lessons}') is distinct from 'array'
    or not (p_outcome ? 'studyWindow') then raise exception 'nmls_review_invalid_observation_transition'; end if;
  delivering:=p_outcome->'deliveryAllowed'='true'::jsonb;
  terminal_transition:=p_runtime->>'status'='review_complete' and p_old_runtime->>'status' is distinct from 'review_complete';
  has_material:=jsonb_array_length(p_outcome#>'{progress,lessons}')>0
    or coalesce(p_outcome#>'{progress,quiz}','null'::jsonb)<>'null'::jsonb
    or coalesce(p_outcome#>'{progress,feedback}','null'::jsonb)<>'null'::jsonb;
  if jsonb_typeof(p_phase) is distinct from 'object'
    or not (p_phase ?& array['version','kind','ownerId','sourceCourseKey','sourceContentDigest',
      'teachingCourseKey','policyDigest','definitionDigest','manifestDigest'])
    or p_phase-array['version','kind','ownerId','sourceCourseKey','sourceContentDigest',
      'teachingCourseKey','policyDigest','definitionDigest','manifestDigest']<>'{}'::jsonb
    or p_phase->>'version' is distinct from 'nmls-teaching-phase-v1'
    or not coalesce(p_phase->>'kind' in ('source','remediation'),false)
    or not coalesce(p_phase->>'ownerId' ~* '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false)
    or p_phase->>'sourceContentDigest' is distinct from p_offering->>'contentDigest'
    or not coalesce(p_teaching_digest ~ '^[a-f0-9]{64}$',false) then
    raise exception 'nmls_review_invalid_teaching_scope'; end if;
  foreach field in array array['sourceContentDigest','policyDigest'] loop
    if not coalesce(p_phase->>field ~ '^[a-f0-9]{64}$',false) then raise exception 'nmls_review_invalid_teaching_scope'; end if;
  end loop;
  foreach field in array array['sourceCourseKey','teachingCourseKey'] loop
    if jsonb_typeof(p_phase->field) is distinct from 'string' or length(p_phase->>field)=0 then
      raise exception 'nmls_review_invalid_teaching_scope'; end if;
  end loop;
  if p_phase->>'kind'='source' then
    if p_phase->>'ownerId' is distinct from p_attempt::text
      or p_phase->>'sourceContentDigest' is distinct from p_teaching_digest
      or p_phase->'sourceCourseKey' is distinct from p_phase->'teachingCourseKey'
      or p_phase->'definitionDigest' is distinct from 'null'::jsonb
      or p_phase->'manifestDigest' is distinct from 'null'::jsonb then raise exception 'nmls_review_invalid_teaching_scope'; end if;
  elsif p_phase->>'ownerId'=p_attempt::text
    or not coalesce(p_phase->>'definitionDigest' ~ '^[a-f0-9]{64}$',false)
    or not coalesce(p_phase->>'manifestDigest' ~ '^[a-f0-9]{64}$',false) then
    raise exception 'nmls_review_invalid_teaching_scope'; end if;
  if not coalesce(p_offering->>'id' ~* '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false) then
    raise exception 'nmls_review_invalid_teaching_scope'; end if;
  foreach field in array array['opensAtMs','closesAtMs'] loop
    if jsonb_typeof(p_offering->field) is distinct from 'number'
      or (p_offering->>field)::numeric<>trunc((p_offering->>field)::numeric)
      or (p_offering->>field)::numeric<0 or (p_offering->>field)::numeric>8640000000000000 then
      raise exception 'nmls_review_invalid_teaching_scope'; end if;
  end loop;
  opening_ms:=(p_offering->>'opensAtMs')::bigint; cutoff_ms:=(p_offering->>'closesAtMs')::bigint;
  if cutoff_ms<=opening_ms then raise exception 'nmls_review_invalid_teaching_scope'; end if;
  outside_window:=p_at<opening_ms or p_at>=cutoff_ms;

  -- Validate real before-state before computing any debit. Never wash malformed
  -- historical intervals/boundaries away by replacing them with an expected sum.
  for item in select value from jsonb_array_elements(jsonb_build_array(p_before,p_after)) loop
    if item->>'actorId' is distinct from p_actor::text or item->'creditIssuanceAllowed' is distinct from 'false'::jsonb then
      raise exception 'nmls_review_invalid_exposure'; end if;
    foreach field in array array['sessionStartedAtMs','lastStudyAtMs','studyBoundaryAtMs','breakStartedAtMs','lastReceiptMs','studySinceBreakMs'] loop
      if not item ? field or item->field='null'::jsonb and field in ('lastReceiptMs','studySinceBreakMs') then
        raise exception 'nmls_review_invalid_exposure'; end if;
      if item->field<>'null'::jsonb and (jsonb_typeof(item->field) is distinct from 'number'
        or (item->>field)::numeric<>trunc((item->>field)::numeric)
        or (item->>field)::numeric<0 or (item->>field)::numeric>p_at) then
        raise exception 'nmls_review_invalid_exposure'; end if;
    end loop;
  end loop;
  for item in select value from jsonb_array_elements(jsonb_build_array(old_u,new_u)) loop
    if jsonb_typeof(item) is distinct from 'object' or item->>'version' is distinct from 'nmls-uncertain-exposure-v1'
      or not item ? 'lastBoundaryMs' or item-'version'-'intervals'-'lastBoundaryMs'<>'{}'::jsonb then
      raise exception 'nmls_review_invalid_exposure'; end if;
    perform public.nmls_policy_checked_intervals(item->'intervals',p_at);
    if item->'lastBoundaryMs'='null'::jsonb then
      if item->'intervals'<>'[]'::jsonb then raise exception 'nmls_review_invalid_exposure'; end if;
    elsif jsonb_typeof(item->'lastBoundaryMs') is distinct from 'number'
      or (item->>'lastBoundaryMs')::numeric<>trunc((item->>'lastBoundaryMs')::numeric)
      or (item->>'lastBoundaryMs')::numeric<0 or (item->>'lastBoundaryMs')::numeric>p_at
      or exists(select 1 from jsonb_array_elements(item->'intervals') x
        where (x->>'end')::bigint>(item->>'lastBoundaryMs')::bigint) then
      raise exception 'nmls_review_invalid_exposure'; end if;
  end loop;
  perform public.nmls_policy_checked_intervals(p_before->'studyIntervals',p_at);
  observed:=public.nmls_policy_checked_intervals(p_after->'studyIntervals',p_at);

  -- Any existing journal, including an outside-year hold, must remain actualv3.
  -- Every retained window is this phase, never an adopted original/child window.
  for item in select value from jsonb_array_elements(jsonb_build_array(old_j,new_j)) where value<>'null'::jsonb loop
    if jsonb_typeof(item) is distinct from 'object' or item->>'version' is distinct from 'nmls-study-windows-v3-phase'
      or item->>'actorId' is distinct from p_actor::text or item->'creditIssuanceAllowed' is distinct from 'false'::jsonb
      or not (item ?& array['active','unresolved','lastReceiptMs'])
      or item-'version'-'actorId'-'creditIssuanceAllowed'-'active'-'unresolved'-'lastReceiptMs'<>'{}'::jsonb
      or jsonb_typeof(item->'lastReceiptMs') is distinct from 'number'
      or (item->>'lastReceiptMs')::numeric<>trunc((item->>'lastReceiptMs')::numeric)
      or (item->>'lastReceiptMs')::numeric<0 or (item->>'lastReceiptMs')::numeric>p_at
      or item->'active'<>'null'::jsonb and item->'unresolved'<>'null'::jsonb then
      raise exception 'nmls_review_observation_version_or_scope_requires_reconciliation'; end if;
    hold:=item->'unresolved';
    if hold<>'null'::jsonb then
      if jsonb_typeof(hold) is distinct from 'object'
        or not (hold ?& array['window','reason','detectedAtMs','eventId'])
        or hold-'window'-'reason'-'detectedAtMs'-'eventId'<>'{}'::jsonb
        or not coalesce(hold->>'reason' in ('study_receipt_missing_or_stale','study_visibility_interrupted',
          'study_horizon_expired','study_receipt_gap','study_scope_interrupted','study_material_interrupted','study_settlement_rejected'),false)
        or not coalesce(hold->>'eventId' ~* '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false)
        or jsonb_typeof(hold->'detectedAtMs') is distinct from 'number'
        or (hold->>'detectedAtMs')::numeric<>trunc((hold->>'detectedAtMs')::numeric)
        or (hold->>'detectedAtMs')::numeric<0
        or (hold->>'detectedAtMs')::numeric>(item->>'lastReceiptMs')::numeric then
        raise exception 'nmls_review_invalid_observation_transition'; end if;
      w:=hold->'window';
    else w:=item->'active'; end if;
    if w is null then raise exception 'nmls_review_invalid_observation_transition'; end if;
    if w<>'null'::jsonb then
      if jsonb_typeof(w) is distinct from 'object'
        or not (w ?& array['id','scope','materialDigest','runtimeRevision','openingEventId','issuedAtMs','horizonMs','lastObservedAtMs'])
        or w-'id'-'scope'-'materialDigest'-'runtimeRevision'-'openingEventId'-'issuedAtMs'-'horizonMs'-'lastObservedAtMs'<>'{}'::jsonb
        or jsonb_typeof(w->'scope') is distinct from 'object'
        or not ((w->'scope') ?& array['actorId','attemptId','offeringId','contentDigest','sessionId','teachingPhase'])
        or (w->'scope')-'actorId'-'attemptId'-'offeringId'-'contentDigest'-'sessionId'-'teachingPhase'<>'{}'::jsonb
        or w#>>'{scope,actorId}' is distinct from p_actor::text
        or w#>>'{scope,attemptId}' is distinct from p_attempt::text
        or w#>>'{scope,offeringId}' is distinct from p_offering->>'id'
        or w#>>'{scope,contentDigest}' is distinct from p_teaching_digest
        or w#>'{scope,teachingPhase}' is distinct from p_phase
        or not coalesce(w->>'materialDigest' ~ '^[a-f0-9]{64}$',false)
        or not coalesce(w#>>'{scope,sessionId}' ~* '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false) then
        raise exception 'nmls_review_invalid_teaching_scope'; end if;
      foreach field in array array['id','openingEventId'] loop
        if not coalesce(w->>field ~* '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false) then
          raise exception 'nmls_review_invalid_observation_transition'; end if;
      end loop;
      foreach field in array array['issuedAtMs','horizonMs','runtimeRevision','lastObservedAtMs'] loop
        if field='lastObservedAtMs' and w->field='null'::jsonb then continue; end if;
        if jsonb_typeof(w->field) is distinct from 'number' or (w->>field)::numeric<>trunc((w->>field)::numeric)
          or (w->>field)::numeric<0 or (w->>field)::numeric>8640000000000000 then
          raise exception 'nmls_review_invalid_observation_transition'; end if;
      end loop;
      if (w->>'issuedAtMs')::bigint>(item->>'lastReceiptMs')::bigint
        or (w->>'issuedAtMs')::bigint<opening_ms or (w->>'horizonMs')::bigint>cutoff_ms
        or (w->>'horizonMs')::bigint<=(w->>'issuedAtMs')::bigint
        or w->'lastObservedAtMs'<>'null'::jsonb and ((w->>'lastObservedAtMs')::bigint<(w->>'issuedAtMs')::bigint
          or (w->>'lastObservedAtMs')::bigint>(w->>'horizonMs')::bigint
          or (w->>'lastObservedAtMs')::bigint>(item->>'lastReceiptMs')::bigint)
        or hold<>'null'::jsonb and (hold->>'detectedAtMs')::bigint<(w->>'issuedAtMs')::bigint then
        raise exception 'nmls_review_invalid_observation_transition'; end if;
    end if;
  end loop;
  if p_before ? 'observationJournal' and jsonb_typeof(old_j) is distinct from 'object'
    or p_after ? 'observationJournal' and jsonb_typeof(new_j) is distinct from 'object'
    or old_j is not null and new_j is null
    or p_phase->>'kind'='remediation' and old_j is null then
    raise exception 'nmls_review_observation_bootstrap_requires_clean_attempt'; end if;
  if outside_window then
    if gap is not null or rec is not null or delivering or has_material or p_until is not null
      or p_outcome->'studyWindow' is distinct from 'null'::jsonb
      or new_j is distinct from old_j
      or p_after-'revision'-'lastReceiptMs' is distinct from p_before-'revision'-'lastReceiptMs'
      or observation->>'reason' is distinct from 'outside_window_preserved' then
      raise exception 'nmls_review_invalid_exposure_transition'; end if;
    return;
  end if;
  if old_j is null then
    if p_phase->>'kind' is distinct from 'source'
      or p_before->'revision' is distinct from '0'::jsonb or p_old_runtime->'revision' is distinct from '0'::jsonb
      or p_before->'lastReceiptMs' is distinct from '0'::jsonb
      or p_before->'studyIntervals' is distinct from '[]'::jsonb or p_before->'studySinceBreakMs' is distinct from '0'::jsonb
      or old_u is distinct from '{"version":"nmls-uncertain-exposure-v1","intervals":[],"lastBoundaryMs":null}'::jsonb
      or p_old_runtime->'completedUnitIds' is distinct from '[]'::jsonb
      or p_old_runtime->'passedModuleIds' is distinct from '[]'::jsonb
      or p_old_runtime->'completedReviewMs' is distinct from '0'::jsonb
      or p_old_runtime->'current' is distinct from 'null'::jsonb
      or p_old_runtime->'quiz' is distinct from 'null'::jsonb
      or p_old_runtime->'feedback' is distinct from 'null'::jsonb
      or p_old_runtime ? 'bookmark' or p_old_runtime ? 'quizReservation' then
      raise exception 'nmls_review_observation_bootstrap_requires_clean_attempt'; end if;
  end if;
  if new_j is null or (new_j->>'lastReceiptMs')::numeric is distinct from p_at::numeric then
    raise exception 'nmls_review_invalid_observation_transition'; end if;
  if p_outcome->>'observationCode' is distinct from observation->>'code' then
    raise exception 'nmls_review_invalid_observation_transition'; end if;

  -- Consumption must match the actual previous window, never an arbitrary
  -- "ready" flag or a moved timestamp. The client signal itself remains trusted
  -- collector input, not proof of attention or identity.
  if observation->>'code' in ('study_material_acknowledged','study_receipt_continuous') then
    if old_w is null or old_w='null'::jsonb or old_hold is distinct from 'null'::jsonb
      or new_j->'unresolved' is distinct from 'null'::jsonb
      or observation->'windowBefore' is distinct from old_w
      or observation->>'signal' is distinct from 'authenticated_material_receipt_not_identity_proof'
      or old_w#>>'{scope,sessionId}' is distinct from p_old_runtime->>'sessionId'
      or old_w->'runtimeRevision' is distinct from p_old_runtime->'revision'
      or observation->'firstAcknowledgment' is distinct from to_jsonb(old_w->'lastObservedAtMs'='null'::jsonb)
      or observation->>'code' is distinct from
        (case when old_w->'lastObservedAtMs'='null'::jsonb then 'study_material_acknowledged' else 'study_receipt_continuous' end)
      or p_at>(old_w->>'horizonMs')::bigint
      or p_at<coalesce((old_w->>'lastObservedAtMs')::bigint,(old_w->>'issuedAtMs')::bigint)
      or p_at-coalesce((old_w->>'lastObservedAtMs')::bigint,(old_w->>'issuedAtMs')::bigint)>30000 then
      raise exception 'nmls_review_invalid_observation_transition'; end if;
    acknowledged:=true; settled_w:=jsonb_set(old_w,'{lastObservedAtMs}',to_jsonb(p_at));
  else settled_w:=old_w; end if;

  expected:=old_u->'intervals'; exposure_boundary:=(old_u->>'lastBoundaryMs')::bigint;
  if gap is not null then
    if not acknowledged or is_recovery or old_w->'lastObservedAtMs' is distinct from 'null'::jsonb
      or jsonb_typeof(gap) is distinct from 'object'
      or not (gap ?& array['method','windowId','debitStartMs','debitEndMs','observedStudyAddedMs','creditAddedMs'])
      or gap-'method'-'windowId'-'debitStartMs'-'debitEndMs'-'observedStudyAddedMs'-'creditAddedMs'<>'{}'::jsonb
      or gap->>'method' is distinct from 'initial_material_gap_restriction_only_v1'
      or gap->>'windowId' is distinct from old_w->>'id'
      or gap->'observedStudyAddedMs' is distinct from '0'::jsonb or gap->'creditAddedMs' is distinct from '0'::jsonb
      or jsonb_typeof(gap->'debitStartMs') is distinct from 'number'
      or jsonb_typeof(gap->'debitEndMs') is distinct from 'number'
      or (gap->>'debitStartMs')::numeric is distinct from (old_w->>'issuedAtMs')::numeric
      or (gap->>'debitEndMs')::numeric is distinct from p_at::numeric
      or old_w->'issuedAtMs' is distinct from p_before->'lastReceiptMs'
      or p_at<coalesce(exposure_boundary,0)
      or p_after->'lastStudyAtMs' is distinct from p_before->'lastStudyAtMs'
      or p_after->'studySinceBreakMs' is distinct from p_before->'studySinceBreakMs'
      or p_after->'studyBoundaryAtMs' is distinct from p_before->'studyBoundaryAtMs'
      or p_after->'sessionStartedAtMs' is distinct from p_before->'sessionStartedAtMs' then
      raise exception 'nmls_review_invalid_initial_exposure'; end if;
    start_ms:=(old_w->>'issuedAtMs')::bigint;
    if start_ms<p_at then expected:=public.nmls_policy_interval_union(expected,
      jsonb_build_array(jsonb_build_object('start',start_ms,'end',p_at))); end if;
    exposure_boundary:=p_at;
  elsif old_w is not null and old_w<>'null'::jsonb and old_w->'lastObservedAtMs'='null'::jsonb
    and new_j->'unresolved'='null'::jsonb then raise exception 'nmls_review_initial_exposure_required'; end if;

  -- Recovery debits until the current receipt and starts a NEW full pause.
  -- No observed field, prior boundary or original audit is relabeled.
  if is_recovery then
    w:=old_hold->'window'; start_ms:=coalesce((w->>'lastObservedAtMs')::bigint,(w->>'issuedAtMs')::bigint);
    if gap is not null or jsonb_typeof(rec) is distinct from 'object'
      or old_hold is null or old_hold='null'::jsonb or start_ms is null or start_ms>p_at
      or old_j->'active' is distinct from 'null'::jsonb
      or new_j->'active' is distinct from 'null'::jsonb or new_j->'unresolved' is distinct from 'null'::jsonb
      or not coalesce(old_hold->>'reason' in ('study_receipt_missing_or_stale','study_visibility_interrupted',
        'study_horizon_expired','study_receipt_gap','study_scope_interrupted'),false)
      or p_audit#>>'{policy,code}' is distinct from 'recovery_context_allowed'
      or p_audit#>>'{policy,kind}' is distinct from 'check_recovery'
      or p_audit#>>'{review,kind}' is distinct from 'recover_observation'
      or not coalesce(p_old_runtime->>'status' in ('active','review_complete'),false)
      or p_old_runtime->>'status'='active' and (p_old_runtime->>'lastActivityMs' is null
        or p_at-(p_old_runtime->>'lastActivityMs')::bigint>=360000)
      or not exists(select 1 from jsonb_array_elements(p_before->'acceptances') x
        where x->>'offeringId'=p_offering->>'id' and x->>'contentDigest'=p_offering->>'contentDigest'
          and x->>'version'=p_offering#>>'{rocs,version}' and x->>'documentDigest'=p_offering#>>'{rocs,documentDigest}'
          and (x->>'acceptedAtMs')::bigint<=p_at)
      or rec->>'method' is distinct from 'conservative_gap_debit_no_study_awarded'
      or observation->>'code' is distinct from 'study_observation_recovered'
      or rec->'original' is distinct from old_hold or rec->>'eventId' is distinct from p_event::text
      or (rec->>'debitStartMs')::numeric is distinct from start_ms::numeric
      or (rec->>'debitEndMs')::numeric is distinct from p_at::numeric
      or (rec->>'recoveredAtMs')::numeric is distinct from p_at::numeric
      or (rec->>'resumeNotBeforeMs')::numeric is distinct from p_at+600000
      or rec->'observedStudyAddedMs' is distinct from '0'::jsonb or rec->'creditAddedMs' is distinct from '0'::jsonb
      or p_outcome->'ok' is distinct from 'true'::jsonb or p_outcome->>'code' is distinct from 'study_observation_recovered'
      or delivering or p_outcome->>'status' is distinct from '200'
      or (p_outcome->>'resumeNotBeforeMs')::numeric is distinct from p_at+600000
      or p_old_runtime->'current' is distinct from 'null'::jsonb or p_old_runtime->'quiz' is distinct from 'null'::jsonb
      or p_old_runtime->'feedback' is distinct from 'null'::jsonb
      or (new_u->>'lastBoundaryMs')::numeric is distinct from p_at::numeric
      or (p_after->>'breakStartedAtMs')::numeric is distinct from p_at::numeric then
      raise exception 'nmls_review_invalid_recovery'; end if;
    if start_ms<p_at then expected:=public.nmls_policy_interval_union(expected,
      jsonb_build_array(jsonb_build_object('start',start_ms,'end',p_at))); end if;
    if new_u->'intervals' is distinct from expected or p_after->'studyIntervals' is distinct from p_before->'studyIntervals'
      or p_after->'studySinceBreakMs' is distinct from p_before->'studySinceBreakMs'
      or p_after->'studyBoundaryAtMs' is distinct from p_before->'studyBoundaryAtMs'
      or p_after->'sessionStartedAtMs' is distinct from p_before->'sessionStartedAtMs'
      or p_after->'lastStudyAtMs' is distinct from p_before->'lastStudyAtMs' then raise exception 'nmls_review_invalid_recovery'; end if;
  else
    select coalesce(jsonb_agg(x order by (x->>'start')::bigint),'[]') into retained
      from jsonb_array_elements(expected) x where (x->>'end')::bigint>p_at-86400000-30000;
    if new_u->'lastBoundaryMs' is distinct from to_jsonb(exposure_boundary)
      -- to_jsonb(SQL NULL) is SQL NULL, while this field must be JSON null.
      and not (exposure_boundary is null and new_u->'lastBoundaryMs'='null'::jsonb)
      or new_u->'intervals' is distinct from expected and new_u->'intervals' is distinct from retained then
      raise exception 'nmls_review_invalid_exposure_transition'; end if;
    if old_hold is not null and old_hold<>'null'::jsonb and new_j->'unresolved' is distinct from old_hold then
      raise exception 'nmls_review_invalid_observation_transition'; end if;
    if new_j->'unresolved'<>'null'::jsonb and (old_hold is null or old_hold='null'::jsonb) then
      if new_j#>'{unresolved,window}' is distinct from old_w or old_w is null or old_w='null'::jsonb
        or new_j#>>'{unresolved,eventId}' is distinct from p_event::text
        or (new_j#>>'{unresolved,detectedAtMs}')::numeric is distinct from p_at::numeric then
        raise exception 'nmls_review_invalid_observation_transition'; end if;
    end if;
  end if;

  -- Observed additions must be the acknowledged old-window interval. Preserve
  -- actually recorded over-limit exposure; its refusal cannot become teaching.
  observed_expected:=p_before->'studyIntervals';
  if acknowledged and old_w->'lastObservedAtMs'<>'null'::jsonb
    and p_at>(old_w->>'lastObservedAtMs')::bigint
    and not coalesce(p_audit#>>'{policy,observation,code}'='study_interval_recorded'
      or p_audit#>'{policy,observation,observedOutsidePolicy}'='true'::jsonb,false) then
    raise exception 'nmls_review_invalid_observation_transition'; end if;
  if p_audit#>>'{policy,observation,code}'='study_interval_recorded'
    or p_audit#>'{policy,observation,observedOutsidePolicy}'='true'::jsonb then
    if not acknowledged or gap is not null or old_w->'lastObservedAtMs'='null'::jsonb
      or p_at<=(old_w->>'lastObservedAtMs')::bigint then raise exception 'nmls_review_invalid_observation_transition'; end if;
    start_ms:=(old_w->>'lastObservedAtMs')::bigint; observed_added:=p_at-start_ms;
    if start_ms<coalesce((p_before->>'lastStudyAtMs')::bigint,0)
      or start_ms<coalesce((p_before->>'studyBoundaryAtMs')::bigint,0)
      or p_audit#>'{policy,observation,observedOutsidePolicy}'='true'::jsonb
        and (p_audit#>>'{policy,observation,observedStudyMs}')::numeric is distinct from observed_added::numeric
      or p_audit#>'{policy,observation,observedOutsidePolicy}'='true'::jsonb and delivering then
      raise exception 'nmls_review_invalid_observation_transition'; end if;
    observed_expected:=public.nmls_policy_interval_union(observed_expected,
      jsonb_build_array(jsonb_build_object('start',start_ms,'end',p_at)));
  end if;
  select coalesce(jsonb_agg(x order by (x->>'start')::bigint),'[]') into retained
    from jsonb_array_elements(observed_expected) x where (x->>'end')::bigint>p_at-86400000-30000;
  if observed is distinct from observed_expected and observed is distinct from retained then
    raise exception 'nmls_review_invalid_exposure_transition'; end if;

  --027 pause/rest controls, with the initial gap's NEW possible-exposure
  -- boundary included before any session-rest decision.
  reset_break:=coalesce(p_audit#>>'{policy,code}'='break_completed'
    and p_before->>'breakStartedAtMs' is not null and p_at-(p_before->>'breakStartedAtMs')::bigint>=600000,false);
  last_possible:=greatest(coalesce((p_before->>'lastStudyAtMs')::bigint,0),coalesce(exposure_boundary,0));
  reset_session:=coalesce(p_audit#>>'{policy,kind}'='open_session' and p_after->>'sessionStartedAtMs'=p_at::text
    and (p_before->>'sessionStartedAtMs' is null or (p_at-(p_before->>'sessionStartedAtMs')::bigint>=43200000
      and p_at-last_possible>=43200000)),false);
  if p_after->'breakStartedAtMs' is distinct from p_before->'breakStartedAtMs' and not is_recovery then
    if not coalesce(reset_break and p_after->'breakStartedAtMs'='null'::jsonb
      or p_before->'breakStartedAtMs'='null'::jsonb and p_audit#>>'{policy,code}'='break_started'
        and (p_after->>'breakStartedAtMs')::numeric=p_at,false) then raise exception 'nmls_review_invalid_pause_transition'; end if;
  end if;
  if p_after->'sessionStartedAtMs' is distinct from p_before->'sessionStartedAtMs' and not reset_session then
    raise exception 'nmls_review_invalid_pause_transition'; end if;
  old_boundary:=(p_before->>'studyBoundaryAtMs')::bigint; new_boundary:=(p_after->>'studyBoundaryAtMs')::bigint;
  if new_boundary is distinct from old_boundary and not coalesce((reset_break or reset_session) and new_boundary=p_at,false) then
    raise exception 'nmls_review_invalid_pause_transition'; end if;
  if (p_after->>'studySinceBreakMs')::bigint is distinct from
    (case when reset_break or reset_session and p_before->>'sessionStartedAtMs' is not null then 0
      else (p_before->>'studySinceBreakMs')::bigint+observed_added end) then
    raise exception 'nmls_review_invalid_exposure_transition'; end if;
  if p_after->'lastStudyAtMs' is distinct from
    (case when observed_added>0 or reset_session and p_before->>'sessionStartedAtMs' is null then to_jsonb(p_at)
      else p_before->'lastStudyAtMs' end) then raise exception 'nmls_review_invalid_pause_transition'; end if;

  -- Same-window renewal preserves identity; a new window starts unacknowledged.
  -- Terminal closure uses the acknowledged window, not its unconsumed old copy.
  w:=new_j->'active';
  if w<>'null'::jsonb then
    if not delivering or not has_material or new_j->'unresolved' is distinct from 'null'::jsonb
      or w#>>'{scope,sessionId}' is distinct from p_runtime->>'sessionId'
      or w->'runtimeRevision' is distinct from p_runtime->'revision'
      or (w->>'horizonMs')::numeric is distinct from p_until::numeric
      or observation->'windowAfter' is distinct from w
      or p_outcome->'studyWindow' is distinct from jsonb_build_object('id',w->'id','expiresAtMs',p_until) then
      raise exception 'nmls_review_invalid_delivery'; end if;
    if old_w is not null and old_w<>'null'::jsonb and old_w->'id'=w->'id' then
      if not acknowledged or w-array['horizonMs','runtimeRevision','lastObservedAtMs'] is distinct from
          old_w-array['horizonMs','runtimeRevision','lastObservedAtMs']
        or w->'lastObservedAtMs' is distinct from to_jsonb(p_at)
        or observation ? 'closedWindow' then raise exception 'nmls_review_invalid_observation_transition'; end if;
    elsif w->'issuedAtMs' is distinct from to_jsonb(p_at) or w->>'openingEventId' is distinct from p_event::text
      or w->'lastObservedAtMs' is distinct from 'null'::jsonb then raise exception 'nmls_review_invalid_observation_transition'; end if;
  elsif observation ? 'windowAfter' or p_outcome->'studyWindow' is distinct from 'null'::jsonb or delivering and has_material then
    raise exception 'nmls_review_invalid_delivery'; end if;
  if old_w is not null and old_w<>'null'::jsonb and new_j->'unresolved'='null'::jsonb
    and (w='null'::jsonb or w->'id' is distinct from old_w->'id') then
    if not acknowledged or observation->'closedWindow' is distinct from settled_w then
      raise exception 'nmls_review_invalid_observation_transition'; end if;
  elsif observation ? 'closedWindow' then raise exception 'nmls_review_invalid_observation_transition'; end if;
  if p_runtime->>'status'='review_complete' then
    if delivering or has_material or p_until is not null or w is distinct from 'null'::jsonb
      or new_j->'unresolved' is distinct from 'null'::jsonb then raise exception 'nmls_review_invalid_delivery'; end if;
    -- A newly terminal transition must have consumed an actual quiz window.
    -- Grading and exact unit/module progress belong to the outer joint guard.
    if p_old_runtime->>'status' is distinct from 'review_complete' and not acknowledged then
      raise exception 'nmls_review_invalid_observation_transition'; end if;
  end if;
  if delivering or terminal_transition then
    if p_outcome->'observationReady' is distinct from 'true'::jsonb
      or p_outcome->>'policyCode' is distinct from 'session_policy_allowed'
      or new_j->'unresolved' is distinct from 'null'::jsonb
      or p_after->'breakStartedAtMs' is distinct from 'null'::jsonb
      or p_after->>'sessionStartedAtMs' is null then raise exception 'nmls_review_invalid_delivery'; end if;
    combined:=public.nmls_policy_interval_union(observed,new_u->'intervals');
    rolling_ms:=public.nmls_policy_exposure_in_range(combined,p_at-86400000,p_at);
    since_break_ms:=greatest((p_after->>'studySinceBreakMs')::bigint,
      public.nmls_policy_exposure_in_range(observed,coalesce(new_boundary,p_at),p_at))+
      public.nmls_policy_exposure_in_range(combined,coalesce(new_boundary,p_at),p_at)-
      public.nmls_policy_exposure_in_range(observed,coalesce(new_boundary,p_at),p_at);
    -- Completion has no next horizon, but still needs access strictly BEFORE
    -- every restriction boundary. A forged allowed-policy label cannot bypass it.
    if since_break_ms>=12000000 or rolling_ms>=36000000
      or p_at>=(p_after->>'sessionStartedAtMs')::bigint+43200000 then
      raise exception 'nmls_review_invalid_delivery'; end if;
    if delivering and (p_until is null or p_until<=p_at or p_until>p_at+30000 or p_until>cutoff_ms
      or p_until>(p_after->>'sessionStartedAtMs')::bigint+43200000
      or p_until>p_at+12000000-since_break_ms or p_until>p_at+36000000-rolling_ms
      or (p_outcome->>'deliveryUntilMs')::numeric is distinct from p_until::numeric) then
      raise exception 'nmls_review_invalid_delivery'; end if;
  end if;
  if not delivering and (p_until is not null or p_outcome->'deliveryUntilMs' is distinct from 'null'::jsonb or has_material) then
    raise exception 'nmls_review_invalid_delivery'; end if;
end $$;
revoke all on function public.nmls_teaching_guard_exposure(
  jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,uuid,uuid,uuid,bigint,bigint,jsonb,text
) from public,anon,authenticated,service_role;
commit;
