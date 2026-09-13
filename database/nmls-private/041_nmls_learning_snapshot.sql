-- LOCAL, ADVISORY discovery only. No start, session, material, grade or credit.
-- All prior migrations retain their bytes. This RPC performs SELECTs and
-- read-only validation only: no mutex/attempt/actor/bootstrap/event insertion.
begin;

create function public.nmls_learning_progress(p_runtime jsonb)
returns jsonb language sql immutable set search_path=pg_catalog,public as $$
  select jsonb_build_object('courseKey',p_runtime->'courseKey','contentDigest',p_runtime->'contentDigest',
    'revision',p_runtime->'revision','status',p_runtime->'status','completedUnitIds',p_runtime->'completedUnitIds',
    'passedModuleIds',p_runtime->'passedModuleIds','completedReviewMs',p_runtime->'completedReviewMs',
    'currentUnitId',p_runtime#>'{current,unitId}','quizModuleId',p_runtime#>'{quiz,moduleId}');
$$;

-- Compare only recorded progress, not a new reducer transition or permission.
-- The full source-derived layout is rechecked against actual source by adapter.
create function public.nmls_learning_teaching_history(p_actor uuid,p_attempt uuid,p_kind text,p_owner uuid,
  p_runtime jsonb,p_workflow bigint,p_at bigint)
returns jsonb language plpgsql set search_path=pg_catalog,public as $$
declare pin public.nmls_teaching_phase_bindings; e public.nmls_teaching_events; field text;
  a public.nmls_review_attempts; b public.nmls_review_policy_bindings; w public.nmls_private_remediations; expected_phase jsonb;
begin
  select * into a from public.nmls_review_attempts where id=p_attempt;
  select * into b from public.nmls_review_policy_bindings where grant_id=a.grant_id;
  if p_kind='remediation' then select * into w from public.nmls_private_remediations where first_final_id=p_owner; end if;
  expected_phase:=jsonb_build_object('version','nmls-teaching-phase-v1','kind',p_kind,'ownerId',p_owner,
    'sourceCourseKey',a.course_key,'sourceContentDigest',a.content_digest,'teachingCourseKey',p_runtime->>'courseKey',
    'policyDigest',b.policy_digest,'definitionDigest',case when p_kind='remediation' then w.definition_digest else null end,
    'manifestDigest',case when p_kind='remediation' then public.nmls_first_final_submission_hash(w.manifest) else null end);
  select * into pin from public.nmls_teaching_phase_bindings where student_id=p_actor and review_attempt_id=p_attempt
    and phase_kind=p_kind and phase_owner_id=p_owner;
  select * into e from public.nmls_teaching_events where student_id=p_actor and review_attempt_id=p_attempt
    and phase_kind=p_kind and phase_owner_id=p_owner order by runtime_revision desc limit 1;
  if pin.student_id is null or e.event_id is null or pin.phase_scope is distinct from expected_phase
    or pin.teaching_digest is distinct from p_runtime->>'contentDigest'
    or e.runtime_revision is distinct from (p_runtime->>'revision')::bigint
    or e.workflow_revision is distinct from p_workflow or e.outcome#>'{progress,revision}' is distinct from p_runtime->'revision'
    or e.outcome#>'{progress,status}' is distinct from p_runtime->'status'
    or e.outcome#>'{progress,courseKey}' is distinct from p_runtime->'courseKey'
    or e.outcome#>'{progress,contentDigest}' is distinct from p_runtime->'contentDigest'
    or e.outcome#>'{progress,sessionId}' is distinct from p_runtime->'sessionId'
    or e.outcome#>'{progress,currentUnitId}' is distinct from coalesce(p_runtime#>'{current,unitId}','null'::jsonb)
    or e.audit#>'{review,atMs}' is distinct from p_runtime->'lastReceiptMs'
    or e.audit#>>'{policy,actorId}' is distinct from p_actor::text
    or e.audit#>>'{policy,offeringId}' is distinct from a.grant_id::text
    or e.audit#>>'{policy,contentDigest}' is distinct from a.content_digest
    or e.audit#>>'{policy,policyId}' is distinct from b.policy_id
    or e.lease_after->>'student_id' is distinct from p_actor::text
    or e.lease_after->>'attempt_id' is distinct from a.id::text
    or e.lease_after->>'phase_kind' is distinct from p_kind or e.lease_after->>'phase_owner_id' is distinct from p_owner::text
    or e.actor_revision>(select revision from public.nmls_review_actor_policy where student_id=p_actor)
    or e.transaction_id<=0 or not isfinite(e.recorded_at)
    or (select count(distinct runtime_revision) from public.nmls_teaching_events where student_id=p_actor
      and review_attempt_id=p_attempt and phase_kind=p_kind and phase_owner_id=p_owner
      and runtime_revision between 1 and e.runtime_revision)<>e.runtime_revision then
    raise exception 'nmls_learning_snapshot_requires_review'; end if;
  foreach field in array array['completedUnitIds','passedModuleIds','completedReviewMs'] loop
    if e.outcome->'progress'->field is distinct from p_runtime->field then raise exception 'nmls_learning_snapshot_requires_review'; end if;
  end loop;
  perform public.nmls_teaching_guard_progress(p_runtime,p_runtime,pin.layout,jsonb_build_object('deliveryAllowed',false),
    jsonb_build_object('review',jsonb_build_object('kind','check_access')),p_at);
  return pin.layout;
end $$;

create function public.nmls_learning_snapshot(p_student_id uuid,p_grant_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants; b public.nmls_review_policy_bindings;
  a public.nmls_review_attempts; l public.nmls_review_actor_policy; lease public.nmls_review_study_leases;
  f public.nmls_private_finals; d public.nmls_first_final_deliveries; de public.nmls_first_final_delivery_events;
  w public.nmls_private_remediations; s public.nmls_first_final_submission_events; se public.nmls_first_final_delivery_events;
  h public.nmls_first_final_handoff_events; ht public.nmls_teaching_events;
  r public.nmls_second_final_reservation_events; rt public.nmls_teaching_events; terminal public.nmls_teaching_events;
  sd public.nmls_second_final_deliveries; sde public.nmls_second_final_delivery_events;
  ss public.nmls_second_final_submission_events; ssde public.nmls_second_final_delivery_events;
  source_layout jsonb; teaching_layout jsonb; teaching_runtime jsonb; phase_value text:='not_started';
  status_value text:='not_started'; revision_value bigint; current_workflow bigint; auth jsonb; payload jsonb;
  at_ms bigint; child_initial jsonb; phase_scope jsonb;
begin
  select * into g from public.nmls_review_access_grants where id=p_grant_id for share;
  if g.id is null or p_student_id is null or g.student_id is distinct from p_student_id
    or g.status is distinct from 'active' or g.access_mode is distinct from 'non_credit_review'
    or not isfinite(g.expires_at) or g.expires_at<=clock_timestamp() then raise exception 'nmls_learning_snapshot_access_denied'; end if;
  select * into b from public.nmls_review_policy_bindings where grant_id=g.id for share;
  if b.grant_id is null or b.policy_id is distinct from 'statecourse-oss-session-draft-2026-02'
    or b.policy_digest is distinct from 'edaf8295948ee1f9c69a72b5861cf7d6d0c0d47b77dbe8c561f30ac637db1e73'
    or b.offering->>'id' is distinct from g.id::text
    or b.offering->>'contentDigest' is distinct from g.content_digest
    or not public.nmls_final_guard_integer(b.offering->'opensAtMs',9007199254740991,false)
    or not public.nmls_final_guard_integer(b.offering->'closesAtMs',9007199254740991,false)
    or (b.offering->>'closesAtMs')::bigint<=(b.offering->>'opensAtMs')::bigint then
    raise exception 'nmls_learning_snapshot_requires_review'; end if;
  -- Same order as the writers, but never create an absent actor mutex.
  select * into lease from public.nmls_review_study_leases where student_id=p_student_id for share;
  select * into l from public.nmls_review_actor_policy where student_id=p_student_id for share;
  select * into a from public.nmls_review_attempts where grant_id=g.id for share;
  at_ms:=floor(extract(epoch from clock_timestamp())*1000)::bigint;
  if l.student_id is not null and (l.policy_id is distinct from b.policy_id or l.policy_digest is distinct from b.policy_digest
    or l.ledger->>'actorId' is distinct from p_student_id::text or l.ledger->>'policyId' is distinct from b.policy_id
    or l.ledger->'revision' is distinct from to_jsonb(l.revision)
    or l.ledger->'creditIssuanceAllowed' is distinct from 'false'::jsonb
    or not public.nmls_final_guard_integer(l.ledger->'lastReceiptMs',at_ms+1000,false)) then
    raise exception 'nmls_learning_snapshot_requires_review'; end if;
  -- A course-wide existing first history must not disappear behind a new grant.
  select * into f from public.nmls_private_finals where student_id=p_student_id and course_key=g.course_key for share;
  if f.id is not null and (a.id is null or f.review_attempt_id is distinct from a.id) then
    raise exception 'nmls_learning_snapshot_requires_review'; end if;
  if a.id is not null then
    if a.student_id is distinct from p_student_id or a.course_key is distinct from g.course_key
      or a.content_digest is distinct from g.content_digest or a.runtime->>'courseKey' is distinct from g.course_key
      or a.runtime->>'contentDigest' is distinct from g.content_digest or a.runtime->'revision' is distinct from to_jsonb(a.revision)
      or a.runtime->>'mode' is distinct from 'non_credit_review' or a.runtime->'creditIssuanceAllowed' is distinct from 'false'::jsonb then
      raise exception 'nmls_learning_snapshot_requires_review'; end if;
    if a.revision=0 then
      if a.runtime is distinct from jsonb_build_object('mode','non_credit_review','creditIssuanceAllowed',false,
        'courseKey',g.course_key,'contentDigest',g.content_digest,'revision',0,'status','logged_out','sessionId',null,
        'lastActivityMs',null,'lastReceiptMs',0,'completedUnitIds','[]'::jsonb,'completedReviewMs',0,
        'passedModuleIds','[]'::jsonb,'current',null,'quiz',null,'feedback',null)
        or exists(select 1 from public.nmls_teaching_events where review_attempt_id=a.id)
        or f.id is not null then raise exception 'nmls_learning_snapshot_requires_review'; end if;
    else
      if l.student_id is null or lease.student_id is null then raise exception 'nmls_learning_snapshot_requires_review'; end if;
      source_layout:=public.nmls_learning_teaching_history(p_student_id,a.id,'source',a.id,a.runtime,null,at_ms+1000);
    end if;
    phase_value:='source'; status_value:=a.runtime->>'status'; revision_value:=a.revision;
    teaching_runtime:=a.runtime; teaching_layout:=source_layout;
  end if;
  if f.id is not null then
    -- This helper is read-only; unlike the replay writers it never creates a row.
    auth:=public.nmls_first_final_submission_authority(p_student_id,a.id,f.id,f.definition_digest);
    source_layout:=auth->'layout'; teaching_layout:=source_layout;
    select * into d from public.nmls_first_final_deliveries where final_id=f.id for share;
    select * into w from public.nmls_private_remediations where first_final_id=f.id for share;
    select * into s from public.nmls_first_final_submission_events where final_id=f.id and submitted;
    if d.final_id is not null then
      select * into de from public.nmls_first_final_delivery_events where final_id=f.id order by delivery_revision desc limit 1;
      if d.student_id is distinct from p_student_id or d.review_attempt_id is distinct from a.id or d.phase_scope is distinct from auth->'phase'
        or de.event_id is null or de.student_id is distinct from p_student_id or de.review_attempt_id is distinct from a.id
        or de.delivery_revision is distinct from d.revision or de.runtime is distinct from d.runtime
        or de.definition_digest is distinct from f.definition_digest or de.actor_revision>l.revision
        or de.source_revision>a.revision or d.runtime->>'phaseDigest' is distinct from public.nmls_first_final_submission_hash(d.phase_scope)
        or d.runtime->'revision' is distinct from to_jsonb(d.revision)
        or not coalesce(d.runtime->>'status' in ('reserved','active','paused','logged_out'),false) then
        raise exception 'nmls_learning_snapshot_requires_review'; end if;
    elsif exists(select 1 from public.nmls_first_final_delivery_events where final_id=f.id) then
      raise exception 'nmls_learning_snapshot_requires_review'; end if;
    phase_value:='first_final'; status_value:=coalesce(d.runtime->>'status','reserved'); revision_value:=coalesce(d.revision,0);
    if f.revision=1 then
      if s.event_id is not null or w.first_final_id is not null then raise exception 'nmls_learning_snapshot_requires_review'; end if;
    else
      select * into se from public.nmls_first_final_delivery_events where student_id=p_student_id and event_id=s.event_id;
      if s.event_id is null or se.event_id is null or d.final_id is null
        or s.student_id is distinct from p_student_id or s.review_attempt_id is distinct from a.id
        or s.definition_digest is distinct from f.definition_digest or s.final_revision is distinct from 2
        or s.delivery_command_digest is distinct from se.command_digest or s.transaction_id is distinct from se.transaction_id
        or s.delivery_revision is distinct from se.delivery_revision or s.actor_revision is distinct from se.actor_revision
        or s.source_revision is distinct from se.source_revision or se.final_id is distinct from f.id
        or se.runtime->>'status' is distinct from 'paused' or se.outcome->>'code' is distinct from 'final_paused'
        or se.outcome->>'observationCode' is distinct from 'receipt_continuous'
        or s.outcome->'result' is distinct from f.result or s.outcome->'remediation' is distinct from coalesce(f.remediation_manifest,'null'::jsonb)
        or not isfinite(f.submitted_at) or s.delivery_revision>d.revision or s.actor_revision>l.revision then
        raise exception 'nmls_learning_snapshot_requires_review'; end if;
      child_initial:=case when f.result->'passed'='false'::jsonb then jsonb_build_object('mode','non_credit_review','creditIssuanceAllowed',false,
        'courseKey',f.remediation_manifest->>'courseKey','contentDigest',f.remediation_manifest->>'contentDigest','revision',0,
        'status','logged_out','sessionId',null,'lastActivityMs',null,'lastReceiptMs',0,'completedUnitIds','[]'::jsonb,
        'completedReviewMs',0,'passedModuleIds','[]'::jsonb,'current',null,'quiz',null,'feedback',null) else 'null'::jsonb end;
      payload:=jsonb_build_object('submitted',true,'code','first_final_submission_allowed','answers',f.answers,'result',f.result,
        'manifest',f.remediation_manifest,'childRuntime',child_initial);
      perform public.nmls_first_final_submission_payload_guard(payload,f.answers,to_jsonb(f),source_layout);
      if public.nmls_first_final_submission_hash(payload) is distinct from s.submission_payload_digest then
        raise exception 'nmls_learning_snapshot_requires_review'; end if;
      if f.result->'passed'='true'::jsonb then
        if w.first_final_id is not null then raise exception 'nmls_learning_snapshot_requires_review'; end if;
        phase_value:='terminal'; status_value:='passed';
      else
        if w.first_final_id is null or w.student_id is distinct from p_student_id or w.review_attempt_id is distinct from a.id
          or w.definition_digest is distinct from f.definition_digest or w.manifest is distinct from f.remediation_manifest
          or w.runtime->>'courseKey' is distinct from w.manifest->>'courseKey'
          or w.runtime->>'contentDigest' is distinct from w.manifest->>'contentDigest' then
          raise exception 'nmls_learning_snapshot_requires_review'; end if;
        phase_value:='remediation'; status_value:=w.runtime->>'status'; revision_value:=(w.runtime->>'revision')::bigint;
        teaching_runtime:=w.runtime;
        select coalesce(jsonb_agg(m order by n),'[]') into teaching_layout from jsonb_array_elements(source_layout) with ordinality x(m,n)
          where w.manifest->'moduleIds' ? (m->>'id');
        select * into h from public.nmls_first_final_handoff_events where final_id=f.id;
        if w.revision=1 then
          if w.runtime is distinct from child_initial or h.event_id is not null or w.status is distinct from 'remediating' then
            raise exception 'nmls_learning_snapshot_requires_review'; end if;
        else
          select * into ht from public.nmls_teaching_events where student_id=p_student_id and event_id=h.event_id;
          if h.event_id is null or ht.event_id is null or h.student_id is distinct from p_student_id
            or h.review_attempt_id is distinct from a.id or h.genesis_event_id is distinct from s.event_id
            or ht.review_attempt_id is distinct from a.id or ht.phase_kind is distinct from 'remediation' or ht.phase_owner_id is distinct from f.id
            or h.teaching_command_digest is distinct from ht.command_digest or h.transaction_id is distinct from ht.transaction_id
            or h.runtime_revision is distinct from ht.runtime_revision or h.workflow_revision is distinct from ht.workflow_revision
            or h.actor_revision is distinct from ht.actor_revision or h.phase_scope is distinct from
              (select pin0.phase_scope from public.nmls_teaching_phase_bindings pin0 where student_id=p_student_id and review_attempt_id=a.id
                and phase_kind='remediation' and phase_owner_id=f.id) then raise exception 'nmls_learning_snapshot_requires_review'; end if;
          select * into r from public.nmls_second_final_reservation_events where first_final_id=f.id and reserved;
          current_workflow:=case when w.status='remediating' then w.revision else r.teaching_workflow_revision end;
          if public.nmls_learning_teaching_history(p_student_id,a.id,'remediation',f.id,w.runtime,current_workflow,at_ms+1000)
            is distinct from teaching_layout then raise exception 'nmls_learning_snapshot_requires_review'; end if;
        end if;
        if w.status<>'remediating' then
          select * into rt from public.nmls_teaching_events where student_id=p_student_id and event_id=r.event_id;
          select * into terminal from public.nmls_teaching_events where student_id=p_student_id and event_id=r.terminal_event_id;
          if r.event_id is null or rt.event_id is null or terminal.event_id is null or r.student_id is distinct from p_student_id
            or r.review_attempt_id is distinct from a.id or r.second_id is distinct from w.second_id
            or r.handoff_event_id is distinct from h.event_id or r.runtime is distinct from w.runtime
            or r.definition_digest is distinct from f.definition_digest or r.selection_digest is distinct from public.nmls_first_final_submission_hash(w.second_selection)
            or r.teaching_command_digest is distinct from rt.command_digest or r.transaction_id is distinct from rt.transaction_id
            or rt.review_attempt_id is distinct from a.id or rt.phase_kind is distinct from 'remediation' or rt.phase_owner_id is distinct from f.id
            or rt.runtime_revision is distinct from r.runtime_revision or rt.workflow_revision is distinct from r.teaching_workflow_revision
            or rt.actor_revision is distinct from r.actor_revision or r.workflow_revision>w.revision
            or terminal.phase_kind is distinct from 'remediation' or terminal.phase_owner_id is distinct from f.id
            or terminal.review_attempt_id is distinct from a.id or terminal.audit#>>'{review,kind}' is distinct from 'quiz_submit'
            or terminal.audit#>'{review,passed}' is distinct from 'true'::jsonb
            or terminal.outcome#>>'{progress,status}' is distinct from 'review_complete'
            or w.runtime->>'status' is distinct from 'review_complete' then raise exception 'nmls_learning_snapshot_requires_review'; end if;
          select * into sd from public.nmls_second_final_deliveries where second_id=w.second_id for share;
          if sd.second_id is not null then
            select * into sde from public.nmls_second_final_delivery_events where second_id=sd.second_id order by delivery_revision desc limit 1;
            phase_scope:=(auth->'phase')||jsonb_build_object('version','nmls-second-final-phase-v1','firstFinalAttemptId',f.id,
              'finalAttemptId',w.second_id,'selectionDigest',r.selection_digest);
            if sd.student_id is distinct from p_student_id or sd.first_final_id is distinct from f.id or sd.review_attempt_id is distinct from a.id
              or sd.phase_scope is distinct from phase_scope or sde.event_id is null or sde.runtime is distinct from sd.runtime
              or sde.student_id is distinct from p_student_id or sde.first_final_id is distinct from f.id or sde.review_attempt_id is distinct from a.id
              or sde.delivery_revision is distinct from sd.revision or sde.reservation_event_id is distinct from r.event_id
              or sde.definition_digest is distinct from f.definition_digest
              or sd.runtime->'revision' is distinct from to_jsonb(sd.revision)
              or sde.actor_revision>l.revision or sd.runtime->>'phaseDigest' is distinct from public.nmls_first_final_submission_hash(phase_scope)
              or not coalesce(sd.runtime->>'status' in ('reserved','active','paused','logged_out'),false) then
              raise exception 'nmls_learning_snapshot_requires_review'; end if;
          elsif exists(select 1 from public.nmls_second_final_delivery_events where second_id=w.second_id) then
            raise exception 'nmls_learning_snapshot_requires_review';
          end if;
          phase_value:='second_final'; status_value:=coalesce(sd.runtime->>'status','reserved'); revision_value:=coalesce(sd.revision,0);
          select * into ss from public.nmls_second_final_submission_events where second_id=w.second_id and submitted;
          if w.status='second_issued' then
            if ss.event_id is not null or w.revision is distinct from r.workflow_revision then raise exception 'nmls_learning_snapshot_requires_review'; end if;
          else
            select * into ssde from public.nmls_second_final_delivery_events where student_id=p_student_id and event_id=ss.event_id;
            payload:=jsonb_build_object('submitted',true,'code','second_final_submission_allowed','answers',w.second_answers,
              'result',w.second_result,'terminalStatus',w.status);
            if ss.event_id is null or ssde.event_id is null or sd.second_id is null
              or ss.student_id is distinct from p_student_id or ss.first_final_id is distinct from f.id or ss.review_attempt_id is distinct from a.id
              or ss.reservation_event_id is distinct from r.event_id or ss.workflow_revision is distinct from w.revision
              or ss.workflow_before_revision is distinct from r.workflow_revision
              or ss.delivery_command_digest is distinct from ssde.command_digest or ss.transaction_id is distinct from ssde.transaction_id
              or ss.actor_revision is distinct from ssde.actor_revision or ss.delivery_revision is distinct from sd.revision
              or ssde.runtime is distinct from sd.runtime or ssde.runtime->>'status' is distinct from 'paused'
              or ss.outcome->'result' is distinct from w.second_result or ss.outcome->>'workflowStatus' is distinct from w.status
              or public.nmls_first_final_submission_hash(payload) is distinct from ss.submission_payload_digest
              or w.second_result->'passed' is distinct from to_jsonb(w.status='passed')
              or w.second_result->'creditIssuanceAllowed' is distinct from 'false'::jsonb
              or w.second_result->'assignedCreditSeconds' is distinct from '0'::jsonb then
              raise exception 'nmls_learning_snapshot_requires_review'; end if;
            phase_value:='terminal'; status_value:=w.status;
          end if;
        end if;
      end if;
    end if;
  end if;
  -- Read-time status only. Inactivity/holds are NOT resolved and no permit is
  -- inferred. A writer must re-read all authority and its own action evidence.
  at_ms:=floor(extract(epoch from clock_timestamp())*1000)::bigint;
  if g.expires_at<=clock_timestamp() then raise exception 'nmls_learning_snapshot_access_denied'; end if;
  return jsonb_build_object('version','nmls-learning-snapshot-private-v1',
    'grant',jsonb_build_object('id',g.id,'studentId',g.student_id,'courseKey',g.course_key,'contentDigest',g.content_digest,
      'accessMode',g.access_mode,'status',g.status,'expiresAtMs',floor(extract(epoch from g.expires_at)*1000)::bigint),
    'binding',jsonb_build_object('policyId',b.policy_id,'policyDigest',b.policy_digest,'offering',b.offering),
    'phase',phase_value,'status',status_value,'serverTimeMs',at_ms,
    'cursor',jsonb_build_object('grantId',g.id,'attemptId',a.id,'firstFinalId',f.id,'secondFinalId',w.second_id,
      'sourceRevision',a.revision,'finalRevision',f.revision,'workflowRevision',w.revision,'runtimeRevision',revision_value,'actorRevision',l.revision),
    'sourceProgress',case when a.id is null then null else public.nmls_learning_progress(a.runtime) end,
    'teachingProgress',case when teaching_runtime is null then null else public.nmls_learning_progress(teaching_runtime) end,
    'sourceLayout',source_layout,'teachingLayout',teaching_layout);
end $$;

revoke all on function public.nmls_learning_progress(jsonb),
  public.nmls_learning_teaching_history(uuid,uuid,text,uuid,jsonb,bigint,bigint),
  public.nmls_learning_snapshot(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.nmls_learning_snapshot(uuid,uuid) to service_role;
commit;
