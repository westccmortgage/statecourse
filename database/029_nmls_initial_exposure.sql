-- LOCAL ONLY. Follow027/028; reconcile numbering with the next handoff.
-- New windows-v2 records account for first-delivery gaps as restriction-only
-- exposure. No data rewrite, old-journal upgrade, attendance or CE award.
begin;

alter function public.nmls_policy_guard_exposure(jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,uuid,uuid,uuid,bigint,bigint)
  rename to nmls_policy_guard_pre_initial_internal;
revoke all on function public.nmls_policy_guard_pre_initial_internal(jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,uuid,uuid,uuid,bigint,bigint)
  from public,anon,authenticated,service_role;

create function public.nmls_policy_guard_exposure(p_before jsonb,p_after jsonb,p_old_runtime jsonb,
  p_runtime jsonb,p_outcome jsonb,p_audit jsonb,p_offering jsonb,p_actor uuid,p_attempt uuid,p_event uuid,p_at bigint,p_until bigint)
returns void language plpgsql set search_path=pg_catalog,public as $$
declare old_j jsonb:=p_before->'observationJournal'; new_j jsonb:=p_after->'observationJournal';
  w jsonb:=old_j->'active'; gap jsonb:=p_audit#>'{observation,initialExposure}';
  before_check jsonb:=p_before; after_check jsonb:=p_after; item jsonb;
  start_ms bigint; expected jsonb; retained_observed jsonb; outside_window boolean;
begin
  outside_window:=p_at<(p_offering->>'opensAtMs')::bigint or p_at>=(p_offering->>'closesAtMs')::bigint;
  if not outside_window then
    -- No automatic laundering of v1's unaccounted historical initial gaps.
    for item in select value from jsonb_array_elements(jsonb_build_array(old_j,new_j)) where value<>'null'::jsonb loop
      if item->>'version' is distinct from 'nmls-study-windows-v2' then
        raise exception 'nmls_review_observation_version_requires_reconciliation'; end if;
    end loop;
    if old_j is null and new_j is not null then
      if p_before->'revision' is distinct from '0'::jsonb or p_old_runtime->'revision' is distinct from '0'::jsonb
        or p_before->'studyIntervals' is distinct from '[]'::jsonb
        or p_before->'studySinceBreakMs' is distinct from '0'::jsonb
        or p_before->'uncertainExposure' is distinct from
          '{"version":"nmls-uncertain-exposure-v1","intervals":[],"lastBoundaryMs":null}'::jsonb
        or coalesce(p_old_runtime->'current','null'::jsonb)<>'null'::jsonb
        or coalesce(p_old_runtime->'quiz','null'::jsonb)<>'null'::jsonb
        or coalesce(p_old_runtime->'feedback','null'::jsonb)<>'null'::jsonb
        or p_old_runtime ? 'bookmark' or p_old_runtime ? 'quizReservation'
        or (p_old_runtime->>'completedReviewMs')::numeric is distinct from 0::numeric
        or p_old_runtime->'passedModuleIds' is distinct from '[]'::jsonb then
        raise exception 'nmls_review_observation_bootstrap_requires_clean_attempt'; end if;
    end if;
    if gap is not null then
      if jsonb_typeof(gap) is distinct from 'object' or gap-'method'-'windowId'-'debitStartMs'-'debitEndMs'-'observedStudyAddedMs'-'creditAddedMs'<>'{}'::jsonb
        or w is null or w='null'::jsonb or w->'lastObservedAtMs' is distinct from 'null'::jsonb
        or old_j->'unresolved' is distinct from 'null'::jsonb or new_j->'unresolved' is distinct from 'null'::jsonb
        or p_audit#>'{observation,firstAcknowledgment}' is distinct from 'true'::jsonb
        or p_audit#>'{observation,windowBefore}' is distinct from w
        or p_audit#>>'{observation,signal}' is distinct from 'authenticated_material_receipt_not_identity_proof'
        or p_audit#>>'{observation,code}' is distinct from 'study_material_acknowledged'
        or gap->>'method' is distinct from 'initial_material_gap_restriction_only_v1'
        or gap->>'windowId' is distinct from w->>'id'
        or gap->'observedStudyAddedMs' is distinct from '0'::jsonb or gap->'creditAddedMs' is distinct from '0'::jsonb
        or jsonb_typeof(gap->'debitStartMs') is distinct from 'number'
        or jsonb_typeof(gap->'debitEndMs') is distinct from 'number'
        or (gap->>'debitStartMs')::numeric is distinct from (w->>'issuedAtMs')::numeric
        or (gap->>'debitEndMs')::numeric is distinct from p_at::numeric
        or (w->>'issuedAtMs')::numeric is distinct from (p_before->>'lastReceiptMs')::numeric
        or w#>>'{scope,actorId}' is distinct from p_actor::text
        or w#>>'{scope,attemptId}' is distinct from p_attempt::text
        or w#>>'{scope,offeringId}' is distinct from p_offering->>'id'
        or w#>>'{scope,contentDigest}' is distinct from p_offering->>'contentDigest'
        or w#>>'{scope,sessionId}' is distinct from p_old_runtime->>'sessionId'
        or w->'runtimeRevision' is distinct from p_old_runtime->'revision'
        or p_audit#>'{observation,recovery}' is not null then
        raise exception 'nmls_review_invalid_initial_exposure'; end if;
      start_ms:=(w->>'issuedAtMs')::bigint;
      if start_ms is null or start_ms>p_at or p_at-start_ms>30000
        or p_at>(w->>'horizonMs')::bigint or start_ms<(p_offering->>'opensAtMs')::bigint
        or (w->>'horizonMs')::bigint>(p_offering->>'closesAtMs')::bigint
        or p_at<coalesce((p_before#>>'{uncertainExposure,lastBoundaryMs}')::bigint,0)
        or (p_after#>>'{uncertainExposure,lastBoundaryMs}')::numeric is distinct from p_at::numeric
        or p_after->'lastStudyAtMs' is distinct from p_before->'lastStudyAtMs'
        or p_after->'studySinceBreakMs' is distinct from p_before->'studySinceBreakMs'
        or p_after->'studyBoundaryAtMs' is distinct from p_before->'studyBoundaryAtMs'
        or p_after->'sessionStartedAtMs' is distinct from p_before->'sessionStartedAtMs'
        or (new_j#>>'{active,id}'=w->>'id' and
          (new_j#>>'{active,lastObservedAtMs}')::numeric is distinct from p_at::numeric) then
        raise exception 'nmls_review_invalid_initial_exposure'; end if;
      item:=p_before->'uncertainExposure';
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
      select coalesce(jsonb_agg(x order by (x->>'start')::bigint),'[]') into retained_observed
        from jsonb_array_elements(p_before->'studyIntervals') x where (x->>'end')::bigint>p_at-86400000-30000;
      if p_after->'studyIntervals' is distinct from p_before->'studyIntervals'
        and p_after->'studyIntervals' is distinct from retained_observed then
        raise exception 'nmls_review_invalid_initial_exposure'; end if;
      expected:=p_before#>'{uncertainExposure,intervals}';
      if start_ms<p_at then expected:=public.nmls_policy_interval_union(expected,
        jsonb_build_array(jsonb_build_object('start',start_ms,'end',p_at))); end if;
      -- Only a validation view is augmented. Persisted before-state and its
      -- audit are untouched.027 then independently checks exact/pruned union,
      -- pause/rest transitions and the horizon against the combined budget.
      before_check:=jsonb_set(before_check,'{uncertainExposure,intervals}',expected);
      before_check:=jsonb_set(before_check,'{uncertainExposure,lastBoundaryMs}',to_jsonb(p_at));
    elsif w is not null and w<>'null'::jsonb and w->'lastObservedAtMs'='null'::jsonb
      and new_j->'unresolved'='null'::jsonb then
      -- Consuming/closing an unacknowledged window needs either this debit or
      -- preservation as an unresolved hold, even for a denied teaching action.
      raise exception 'nmls_review_initial_exposure_required';
    end if;
  elsif gap is not null then raise exception 'nmls_review_invalid_initial_exposure'; end if;

  -- v2 has exactly v1's structural fields. Reuse the frozen027 checks on a
  -- version-normalized validation copy only; v1 is refused above in-year.
  if old_j->>'version'='nmls-study-windows-v2' then
    before_check:=jsonb_set(before_check,'{observationJournal,version}','"nmls-study-windows-v1"'); end if;
  if new_j->>'version'='nmls-study-windows-v2' then
    after_check:=jsonb_set(after_check,'{observationJournal,version}','"nmls-study-windows-v1"'); end if;
  perform public.nmls_policy_guard_pre_initial_internal(before_check,after_check,p_old_runtime,p_runtime,p_outcome,p_audit,
    p_offering,p_actor,p_attempt,p_event,p_at,p_until);
end $$;
revoke all on function public.nmls_policy_guard_exposure(jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,uuid,uuid,uuid,bigint,bigint)
  from public,anon,authenticated,service_role;
commit;
