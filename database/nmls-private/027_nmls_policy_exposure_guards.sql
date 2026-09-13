-- LOCAL forward migration, not applied to production. Follow025 (026 is independent).
-- Defense in depth for the trusted policy02 evaluator. No HTTP/UI, identity,
-- approved attendance, course credit, new grant, or historical reconciliation.
-- All numerical limits below mirror provider draft policy02, NOT quoted NMLS rules.
begin;

create function public.nmls_policy_checked_intervals(p_value jsonb,p_at bigint)
returns jsonb language plpgsql immutable set search_path=pg_catalog,public as $$
declare x jsonb; s numeric; e numeric; previous_end bigint:=-1;
begin
  if jsonb_typeof(p_value) is distinct from 'array' or p_at is null or p_at<0 or p_at>8640000000000000 then
    raise exception 'nmls_review_invalid_exposure';
  end if;
  for x in select value from jsonb_array_elements(p_value) loop
    if jsonb_typeof(x) is distinct from 'object' or jsonb_typeof(x->'start') is distinct from 'number'
      or jsonb_typeof(x->'end') is distinct from 'number' or x-'start'-'end'<>'{}'::jsonb then
      raise exception 'nmls_review_invalid_exposure';
    end if;
    s:=(x->>'start')::numeric; e:=(x->>'end')::numeric;
    if s<>trunc(s) or e<>trunc(e) or s<0 or s<=previous_end or e<=s or e>p_at then
      raise exception 'nmls_review_invalid_exposure';
    end if;
    previous_end:=e::bigint;
  end loop;
  return p_value;
end $$;

-- Union first, then count: observed and uncertain intervals may overlap.
create function public.nmls_policy_interval_union(p_a jsonb,p_b jsonb)
returns jsonb language plpgsql immutable set search_path=pg_catalog,public as $$
declare x jsonb; result jsonb:='[]'; s bigint; e bigint; lo bigint; hi bigint;
begin
  for x in select value from jsonb_array_elements(p_a||p_b) order by (value->>'start')::bigint loop
    s:=(x->>'start')::bigint; e:=(x->>'end')::bigint;
    if lo is null then lo:=s; hi:=e;
    elsif s<=hi then hi:=greatest(hi,e);
    else result:=result||jsonb_build_array(jsonb_build_object('start',lo,'end',hi)); lo:=s; hi:=e; end if;
  end loop;
  if lo is not null then result:=result||jsonb_build_array(jsonb_build_object('start',lo,'end',hi)); end if;
  return result;
end $$;

create function public.nmls_policy_exposure_in_range(p_intervals jsonb,p_start bigint,p_end bigint)
returns bigint language sql immutable set search_path=pg_catalog,public as $$
  select coalesce(sum(greatest(0,least((x->>'end')::bigint,p_end)-greatest((x->>'start')::bigint,p_start))),0)::bigint
    from jsonb_array_elements(p_intervals) x;
$$;

create function public.nmls_policy_guard_exposure(p_before jsonb,p_after jsonb,p_old_runtime jsonb,
  p_runtime jsonb,p_outcome jsonb,p_audit jsonb,p_offering jsonb,p_actor uuid,p_attempt uuid,p_event uuid,p_at bigint,p_until bigint)
returns void language plpgsql set search_path=pg_catalog,public as $$
declare old_u jsonb:=p_before->'uncertainExposure'; new_u jsonb:=p_after->'uncertainExposure';
  old_j jsonb:=p_before->'observationJournal'; new_j jsonb:=p_after->'observationJournal';
  rec jsonb:=p_audit#>'{observation,recovery}'; old_hold jsonb:=old_j->'unresolved';
  item jsonb; w jsonb; hold jsonb; field text; expected jsonb; retained jsonb; combined jsonb; observed jsonb;
  start_ms bigint; old_boundary bigint; new_boundary bigint; last_possible bigint;
  rolling_ms bigint; since_break_ms bigint; is_recovery boolean; reset_break boolean; reset_session boolean;
  outside_window boolean; delivering boolean:=p_outcome->'deliveryAllowed'='true'::jsonb;
begin
  for item in select value from jsonb_array_elements(jsonb_build_array(p_before,p_after)) loop
    foreach field in array array['sessionStartedAtMs','lastStudyAtMs','studyBoundaryAtMs','breakStartedAtMs','lastReceiptMs','studySinceBreakMs'] loop
      if not item ? field or item->field='null'::jsonb and field in ('lastReceiptMs','studySinceBreakMs') then
        raise exception 'nmls_review_invalid_exposure'; end if;
      if item->field<>'null'::jsonb and (jsonb_typeof(item->field) is distinct from 'number'
        or (item->>field)::numeric<>trunc((item->>field)::numeric)
        or (item->>field)::numeric<0 or (item->>field)::numeric>p_at) then
        raise exception 'nmls_review_invalid_exposure'; end if;
    end loop;
  end loop;
  -- Validate before AND after, preventing a malformed historical row being
  -- silently washed away. Reconciliation is an explicit later operation.
  for item in select value from jsonb_array_elements(jsonb_build_array(old_u,new_u)) loop
    if jsonb_typeof(item) is distinct from 'object' or item->>'version' is distinct from 'nmls-uncertain-exposure-v1'
      or not item ? 'lastBoundaryMs' or item-'version'-'intervals'-'lastBoundaryMs'<>'{}'::jsonb then
      raise exception 'nmls_review_invalid_exposure';
    end if;
    perform public.nmls_policy_checked_intervals(item->'intervals',p_at);
    if item->'lastBoundaryMs'<>'null'::jsonb then
      if jsonb_typeof(item->'lastBoundaryMs') is distinct from 'number'
        or (item->>'lastBoundaryMs')::numeric<>trunc((item->>'lastBoundaryMs')::numeric)
        or (item->>'lastBoundaryMs')::numeric<0 or (item->>'lastBoundaryMs')::numeric>p_at
        or exists(select 1 from jsonb_array_elements(item->'intervals') x
          where (x->>'end')::bigint>(item->>'lastBoundaryMs')::bigint) then
        raise exception 'nmls_review_invalid_exposure';
      end if;
    elsif item->'intervals'<>'[]'::jsonb then raise exception 'nmls_review_invalid_exposure'; end if;
  end loop;
  perform public.nmls_policy_checked_intervals(p_before->'studyIntervals',p_at);
  observed:=public.nmls_policy_checked_intervals(p_after->'studyIntervals',p_at);
  outside_window:=p_at<(p_offering->>'opensAtMs')::bigint or p_at>=(p_offering->>'closesAtMs')::bigint;
  --025 already requires byte-preservation (except receipt/revision) outside the year.
  if outside_window then return; end if;
  if old_j is not null and new_j is null then raise exception 'nmls_review_invalid_observation_transition'; end if;
  for item in select value from jsonb_array_elements(jsonb_build_array(old_j,new_j)) where value<>'null'::jsonb loop
    if jsonb_typeof(item) is distinct from 'object' or item->>'version' is distinct from 'nmls-study-windows-v1'
      or item->>'actorId' is distinct from p_actor::text or item->'creditIssuanceAllowed' is distinct from 'false'::jsonb
      or not (item ?& array['active','unresolved','lastReceiptMs'])
      or item-'version'-'actorId'-'creditIssuanceAllowed'-'active'-'unresolved'-'lastReceiptMs'<>'{}'::jsonb
      or jsonb_typeof(item->'lastReceiptMs') is distinct from 'number'
      or (item->>'lastReceiptMs')::numeric<>trunc((item->>'lastReceiptMs')::numeric)
      or (item->>'lastReceiptMs')::numeric<0 or (item->>'lastReceiptMs')::numeric>p_at
      or item->'active'<>'null'::jsonb and item->'unresolved'<>'null'::jsonb then
      raise exception 'nmls_review_invalid_observation_transition';
    end if;
    hold:=item->'unresolved';
    if hold<>'null'::jsonb then
      if jsonb_typeof(hold) is distinct from 'object' or hold-'window'-'reason'-'detectedAtMs'-'eventId'<>'{}'::jsonb
        or not coalesce(hold->>'reason' in ('study_receipt_missing_or_stale','study_visibility_interrupted',
          'study_horizon_expired','study_receipt_gap','study_scope_interrupted','study_material_interrupted','study_settlement_rejected'),false)
        or not coalesce(hold->>'eventId' ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false)
        or jsonb_typeof(hold->'detectedAtMs') is distinct from 'number'
        or (hold->>'detectedAtMs')::numeric<>trunc((hold->>'detectedAtMs')::numeric)
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
        or (w->'scope')-'actorId'-'attemptId'-'offeringId'-'contentDigest'-'sessionId'<>'{}'::jsonb
        or w#>>'{scope,actorId}' is distinct from p_actor::text
        or not coalesce(w#>>'{scope,contentDigest}' ~ '^[a-f0-9]{64}$',false)
        or not coalesce(w->>'materialDigest' ~ '^[a-f0-9]{64}$',false) then
        raise exception 'nmls_review_invalid_observation_transition'; end if;
      foreach field in array array['id','openingEventId'] loop
        if not coalesce(w->>field ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false) then
          raise exception 'nmls_review_invalid_observation_transition'; end if;
      end loop;
      foreach field in array array['attemptId','offeringId','sessionId'] loop
        if not coalesce(w->'scope'->>field ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$',false) then
          raise exception 'nmls_review_invalid_observation_transition'; end if;
      end loop;
      foreach field in array array['issuedAtMs','horizonMs','runtimeRevision','lastObservedAtMs'] loop
        if field='lastObservedAtMs' and w->field='null'::jsonb then continue; end if;
        if jsonb_typeof(w->field) is distinct from 'number' or (w->>field)::numeric<>trunc((w->>field)::numeric)
          or (w->>field)::numeric<0 or (w->>field)::numeric>8640000000000000 then
          raise exception 'nmls_review_invalid_observation_transition'; end if;
      end loop;
      if (w->>'issuedAtMs')::bigint>(item->>'lastReceiptMs')::bigint
        or (w->>'horizonMs')::bigint<=(w->>'issuedAtMs')::bigint
        or w->'lastObservedAtMs'<>'null'::jsonb and ((w->>'lastObservedAtMs')::bigint<(w->>'issuedAtMs')::bigint
          or (w->>'lastObservedAtMs')::bigint>(w->>'horizonMs')::bigint
          or (w->>'lastObservedAtMs')::bigint>(item->>'lastReceiptMs')::bigint)
        or hold<>'null'::jsonb and (hold->>'detectedAtMs')::bigint<(w->>'issuedAtMs')::bigint then
        raise exception 'nmls_review_invalid_observation_transition'; end if;
    end if;
  end loop;
  if new_j is not null then
    if jsonb_typeof(new_j) is distinct from 'object' or new_j->>'version' is distinct from 'nmls-study-windows-v1'
      or new_j->>'actorId' is distinct from p_actor::text or new_j->'creditIssuanceAllowed' is distinct from 'false'::jsonb
      or not (new_j ?& array['active','unresolved','lastReceiptMs'])
      or new_j-'version'-'actorId'-'creditIssuanceAllowed'-'active'-'unresolved'-'lastReceiptMs'<>'{}'::jsonb
      or (new_j->>'lastReceiptMs')::numeric is distinct from p_at::numeric
      or new_j->'active'<>'null'::jsonb and new_j->'unresolved'<>'null'::jsonb then
      raise exception 'nmls_review_invalid_observation_transition';
    end if;
  end if;
  is_recovery:=rec is not null;
  expected:=old_u->'intervals';
  if is_recovery then
    w:=old_hold->'window';
    start_ms:=coalesce((w->>'lastObservedAtMs')::bigint,(w->>'issuedAtMs')::bigint);
    if old_hold is null or old_hold='null'::jsonb or start_ms is null or start_ms>p_at
      or old_j->'active' is distinct from 'null'::jsonb
      or new_j->'active' is distinct from 'null'::jsonb or new_j->'unresolved' is distinct from 'null'::jsonb
      or w#>>'{scope,actorId}' is distinct from p_actor::text or w#>>'{scope,attemptId}' is distinct from p_attempt::text
      or w#>>'{scope,offeringId}' is distinct from p_offering->>'id'
      or w#>>'{scope,contentDigest}' is distinct from p_offering->>'contentDigest'
      or (w->>'issuedAtMs')::bigint<(p_offering->>'opensAtMs')::bigint
      or (w->>'horizonMs')::bigint>(p_offering->>'closesAtMs')::bigint
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
      or rec->'original' is distinct from old_hold or rec->>'eventId' is distinct from p_event::text
      or (rec->>'debitStartMs')::numeric is distinct from start_ms::numeric
      or (rec->>'debitEndMs')::numeric is distinct from p_at::numeric
      or (rec->>'recoveredAtMs')::numeric is distinct from p_at::numeric
      or (rec->>'resumeNotBeforeMs')::numeric is distinct from p_at+600000
      or rec->'observedStudyAddedMs' is distinct from '0'::jsonb or rec->'creditAddedMs' is distinct from '0'::jsonb
      or p_outcome->'ok' is distinct from 'true'::jsonb or p_outcome->>'code' is distinct from 'study_observation_recovered'
      or p_outcome->'deliveryAllowed' is distinct from 'false'::jsonb or p_outcome->>'status' is distinct from '200'
      or (p_outcome->>'resumeNotBeforeMs')::numeric is distinct from p_at+600000
      or p_old_runtime->'current' is distinct from 'null'::jsonb or p_old_runtime->'quiz' is distinct from 'null'::jsonb
      or p_old_runtime->'feedback' is distinct from 'null'::jsonb
      or (new_u->>'lastBoundaryMs')::numeric is distinct from p_at::numeric
      or (p_after->>'breakStartedAtMs')::numeric is distinct from p_at::numeric then
      raise exception 'nmls_review_invalid_recovery';
    end if;
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
    if new_u->'lastBoundaryMs' is distinct from old_u->'lastBoundaryMs'
      or new_u->'intervals' is distinct from expected and new_u->'intervals' is distinct from retained then
      raise exception 'nmls_review_invalid_exposure_transition';
    end if;
    if old_hold is not null and old_hold<>'null'::jsonb and new_j->'unresolved' is distinct from old_hold then
      raise exception 'nmls_review_invalid_observation_transition';
    end if;
    if new_j->'unresolved' is not null and new_j->'unresolved'<>'null'::jsonb and (old_hold is null or old_hold='null'::jsonb) then
      if new_j#>'{unresolved,window}' is distinct from old_j->'active' or old_j->'active' is null or old_j->'active'='null'::jsonb
        or new_j#>>'{unresolved,eventId}' is distinct from p_event::text
        or (new_j#>>'{unresolved,detectedAtMs}')::numeric is distinct from p_at::numeric then
        raise exception 'nmls_review_invalid_observation_transition';
      end if;
    end if;
  end if;
  -- A reset requires the real prior pause/rest boundary, not just a new label.
  reset_break:=p_audit#>>'{policy,code}'='break_completed'
    and p_before->>'breakStartedAtMs' is not null and p_at-(p_before->>'breakStartedAtMs')::bigint>=600000;
  last_possible:=greatest(coalesce((p_before->>'lastStudyAtMs')::bigint,0),coalesce((old_u->>'lastBoundaryMs')::bigint,0));
  reset_session:=p_audit#>>'{policy,kind}'='open_session' and p_after->>'sessionStartedAtMs'=p_at::text
    and (p_before->>'sessionStartedAtMs' is null or (p_at-(p_before->>'sessionStartedAtMs')::bigint>=43200000 and p_at-last_possible>=43200000));
  reset_break:=coalesce(reset_break,false); reset_session:=coalesce(reset_session,false);
  if p_after->'breakStartedAtMs' is distinct from p_before->'breakStartedAtMs' and not is_recovery then
    if not coalesce((reset_break and p_after->'breakStartedAtMs'='null'::jsonb or
      p_before->'breakStartedAtMs'='null'::jsonb and p_audit#>>'{policy,code}'='break_started'
      and (p_after->>'breakStartedAtMs')::numeric=p_at),false) then raise exception 'nmls_review_invalid_pause_transition'; end if;
  end if;
  if p_after->'sessionStartedAtMs' is distinct from p_before->'sessionStartedAtMs' and not reset_session then
    raise exception 'nmls_review_invalid_pause_transition';
  end if;
  if p_after->'lastStudyAtMs' is distinct from p_before->'lastStudyAtMs' then
    if not coalesce(((p_after->>'lastStudyAtMs')::bigint=p_at and
      (p_before->>'lastStudyAtMs' is null or p_at>=(p_before->>'lastStudyAtMs')::bigint) and
      (reset_session and p_before->>'sessionStartedAtMs' is null or
       p_after->'studyIntervals' is distinct from p_before->'studyIntervals' and (observed->-1->>'end')::bigint=p_at)),false) then
      raise exception 'nmls_review_invalid_pause_transition'; end if;
  end if;
  old_boundary:=(p_before->>'studyBoundaryAtMs')::bigint; new_boundary:=(p_after->>'studyBoundaryAtMs')::bigint;
  if new_boundary is distinct from old_boundary and not coalesce(((reset_break or reset_session) and new_boundary=p_at),false) then
    raise exception 'nmls_review_invalid_pause_transition';
  end if;
  if (p_after->>'studySinceBreakMs')::numeric<(p_before->>'studySinceBreakMs')::numeric
    and not ((reset_break or reset_session) and p_after->>'studySinceBreakMs'='0') then
    raise exception 'nmls_review_invalid_pause_transition';
  end if;
  -- Retained observed usage cannot disappear either. Canonical unions prevent
  -- overlap/double count; adding observed study is still the observer's job.
  select coalesce(jsonb_agg(x order by (x->>'start')::bigint),'[]') into retained
    from jsonb_array_elements(p_before->'studyIntervals') x where (x->>'end')::bigint>p_at-86400000-30000;
  if public.nmls_policy_interval_union(observed,retained) is distinct from observed then
    raise exception 'nmls_review_invalid_exposure_transition';
  end if;
  if delivering then
    if new_j is null or new_j->'unresolved' is distinct from 'null'::jsonb then raise exception 'nmls_review_invalid_delivery'; end if;
    if jsonb_array_length(coalesce(p_outcome#>'{progress,lessons}','[]'::jsonb))>0
      or coalesce(p_outcome#>'{progress,quiz}','null'::jsonb)<>'null'::jsonb
      or coalesce(p_outcome#>'{progress,feedback}','null'::jsonb)<>'null'::jsonb then
      w:=new_j->'active';
      if w is null or w='null'::jsonb or w#>>'{scope,attemptId}' is distinct from p_attempt::text
        or w#>>'{scope,offeringId}' is distinct from p_offering->>'id'
        or w#>>'{scope,contentDigest}' is distinct from p_offering->>'contentDigest'
        or w#>>'{scope,sessionId}' is distinct from p_runtime->>'sessionId'
        or w->'runtimeRevision' is distinct from p_runtime->'revision'
        or (w->>'horizonMs')::numeric is distinct from p_until::numeric
        or p_outcome#>>'{studyWindow,id}' is distinct from w->>'id'
        or (p_outcome#>>'{studyWindow,expiresAtMs}')::numeric is distinct from p_until::numeric then
        raise exception 'nmls_review_invalid_delivery'; end if;
    end if;
    combined:=public.nmls_policy_interval_union(observed,new_u->'intervals');
    rolling_ms:=public.nmls_policy_exposure_in_range(combined,p_at-86400000,p_at);
    since_break_ms:=greatest((p_after->>'studySinceBreakMs')::bigint,
      public.nmls_policy_exposure_in_range(observed,coalesce(new_boundary,p_at),p_at))+
      public.nmls_policy_exposure_in_range(combined,coalesce(new_boundary,p_at),p_at)-
      public.nmls_policy_exposure_in_range(observed,coalesce(new_boundary,p_at),p_at);
    if p_until is null or p_until<=p_at or p_until>p_at+30000 or p_until>p_at+12000000-since_break_ms
      or p_until>p_at+36000000-rolling_ms then raise exception 'nmls_review_invalid_delivery'; end if;
  end if;
end $$;

alter function public.nmls_policy_commit(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,bigint)
  rename to nmls_policy_commit_pre_exposure_internal;
revoke all on function public.nmls_policy_commit_pre_exposure_internal(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,bigint)
  from public,anon,authenticated,service_role;
create function public.nmls_policy_commit(p_student_id uuid,p_attempt_id uuid,p_event_id uuid,p_command_digest text,
  p_expected_revision bigint,p_expected_actor_revision bigint,p_expected_session_id uuid,p_evaluated_at_ms bigint,
  p_policy_digest text,p_content_digest text,p_initial_ledger jsonb,p_ledger jsonb,p_runtime jsonb,p_outcome jsonb,p_audit jsonb,p_delivery_until_ms bigint)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants; b public.nmls_review_policy_bindings;
  a public.nmls_review_attempts; l public.nmls_review_actor_policy; previous jsonb;
begin
  -- Same lock order as025, held through validation AND its full transaction.
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a0 on a0.grant_id=g0.id
    where a0.id=p_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status<>'active' or g.expires_at<=clock_timestamp() then
    raise exception 'nmls_review_access_denied'; end if;
  select * into b from public.nmls_review_policy_bindings where grant_id=g.id;
  if not found then raise exception 'nmls_review_policy_binding_required'; end if;
  insert into public.nmls_review_study_leases(student_id) values(p_student_id) on conflict do nothing;
  perform 1 from public.nmls_review_study_leases where student_id=p_student_id for update;
  select * into l from public.nmls_review_actor_policy where student_id=p_student_id for update;
  select * into a from public.nmls_review_attempts where id=p_attempt_id for update;
  -- Exact replay remains historical:025 checks its original scope/digest before
  -- CAS and returns the stored outcome. No new transition may be validated/applied.
  if not exists(select 1 from public.nmls_review_actor_policy_events where student_id=p_student_id and event_id=p_event_id) then
    if p_expected_actor_revision is distinct from coalesce(l.revision,0) or p_expected_revision is distinct from a.revision then
      raise exception 'nmls_review_revision_conflict'; end if;
    if b.policy_id='statecourse-oss-session-draft-2026-02' then
      previous:=coalesce(l.ledger,p_initial_ledger);
      if l.student_id is null and (p_initial_ledger->'uncertainExposure' is distinct from
        '{"version":"nmls-uncertain-exposure-v1","intervals":[],"lastBoundaryMs":null}'::jsonb
        or p_initial_ledger ? 'observationJournal') then raise exception 'nmls_review_invalid_exposure'; end if;
      perform public.nmls_policy_guard_exposure(previous,p_ledger,a.runtime,p_runtime,p_outcome,p_audit,b.offering,
        p_student_id,p_attempt_id,p_event_id,p_evaluated_at_ms,p_delivery_until_ms);
    end if;
  end if;
  return public.nmls_policy_commit_pre_exposure_internal(p_student_id,p_attempt_id,p_event_id,p_command_digest,
    p_expected_revision,p_expected_actor_revision,p_expected_session_id,p_evaluated_at_ms,p_policy_digest,p_content_digest,
    p_initial_ledger,p_ledger,p_runtime,p_outcome,p_audit,p_delivery_until_ms);
end $$;
revoke all on function public.nmls_policy_checked_intervals(jsonb,bigint),public.nmls_policy_interval_union(jsonb,jsonb),
  public.nmls_policy_exposure_in_range(jsonb,bigint,bigint),
  public.nmls_policy_guard_exposure(jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,uuid,uuid,uuid,bigint,bigint),
  public.nmls_policy_commit(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,bigint)
  from public,anon,authenticated,service_role;
grant execute on function public.nmls_policy_commit(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,bigint)
  to service_role;
commit;
