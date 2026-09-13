-- LOCAL, UNAPPLIED authoring-only child workflow after 026. No learner endpoint.
-- Does not rewrite first final, source review, policy ledger or original grant.
-- Policy-bound attempts remain refused: this is NOT phase-aware OSS delivery.
begin;

create table public.nmls_private_remediations (
  first_final_id uuid primary key references public.nmls_private_finals(id),
  student_id uuid not null references public.students(id),
  review_attempt_id uuid not null unique references public.nmls_review_attempts(id),
  definition_digest text not null check (definition_digest ~ '^[a-f0-9]{64}$'),
  manifest jsonb not null check (jsonb_typeof(manifest) = 'object'),
  revision bigint not null check (revision >= 1),
  status text not null check (status in ('remediating','second_issued','passed','staff_review_required')),
  runtime jsonb not null check (jsonb_typeof(runtime) = 'object'),
  second_id uuid unique,
  second_selection jsonb,
  second_answers jsonb,
  second_result jsonb,
  started_at timestamptz not null default clock_timestamp(),
  second_issued_at timestamptz,
  second_submitted_at timestamptz,
  check (runtime->>'mode' is not distinct from 'non_credit_review'
    and runtime->'creditIssuanceAllowed' is not distinct from 'false'::jsonb),
  check ((status = 'remediating' and second_id is null and second_selection is null and second_answers is null
      and second_result is null and second_issued_at is null and second_submitted_at is null)
    or (status = 'second_issued' and second_id is not null and jsonb_typeof(second_selection) is not distinct from 'object'
      and second_answers is null and second_result is null and second_issued_at is not null and second_submitted_at is null)
    or (status in ('passed','staff_review_required') and second_id is not null and second_issued_at is not null
      and second_submitted_at is not null and jsonb_typeof(second_selection) is not distinct from 'object'
      and jsonb_typeof(second_answers) is not distinct from 'object' and jsonb_typeof(second_result) is not distinct from 'object'
      and second_result->'creditIssuanceAllowed' is not distinct from 'false'::jsonb
      and second_result->'courseCompletionIssued' is not distinct from 'false'::jsonb
      and second_result->'assignedCreditSeconds' is not distinct from '0'::jsonb))
);
create table public.nmls_private_remediation_events (
  student_id uuid not null references public.students(id),
  event_id uuid not null,
  first_final_id uuid not null references public.nmls_private_remediations(first_final_id),
  command_digest text not null check (command_digest ~ '^[a-f0-9]{64}$'),
  resulting_revision bigint not null check (resulting_revision >= 1),
  audit jsonb not null,
  outcome jsonb not null,
  recorded_at timestamptz not null default clock_timestamp(),
  primary key(student_id,event_id), unique(first_final_id,resulting_revision)
);
alter table public.nmls_private_remediations enable row level security;
alter table public.nmls_private_remediation_events enable row level security;
revoke all on public.nmls_private_remediations, public.nmls_private_remediation_events from public, anon, authenticated, service_role;

create function public.nmls_private_remediation_immutable() returns trigger
language plpgsql set search_path = pg_catalog, public as $$
begin
  if tg_op = 'DELETE' or old.status in ('passed','staff_review_required') or new.revision <> old.revision + 1
    or (to_jsonb(new) - array['revision','status','runtime','second_id','second_selection','second_answers','second_result','second_issued_at','second_submitted_at'])
      is distinct from (to_jsonb(old) - array['revision','status','runtime','second_id','second_selection','second_answers','second_result','second_issued_at','second_submitted_at'])
    or (old.status = 'second_issued' and (new.status not in ('passed','staff_review_required') or new.runtime is distinct from old.runtime
      or new.second_id is distinct from old.second_id or new.second_selection is distinct from old.second_selection
      or new.second_issued_at is distinct from old.second_issued_at))
    or (old.status = 'remediating' and new.status not in ('remediating','second_issued')) then raise exception 'nmls_remediation_immutable'; end if;
  return new;
end $$;
create trigger nmls_private_remediation_immutable before update or delete on public.nmls_private_remediations
  for each row execute function public.nmls_private_remediation_immutable();
create trigger nmls_private_remediation_event_immutable before update or delete on public.nmls_private_remediation_events
  for each row execute function public.nmls_private_final_event_immutable();

create function public.nmls_private_remediation_context(p_student_id uuid, p_review_attempt_id uuid, p_first_final_id uuid, p_event_id uuid)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare c jsonb; w public.nmls_private_remediations; e public.nmls_private_remediation_events;
begin
  c := public.nmls_private_final_context(p_student_id,p_review_attempt_id,p_event_id);
  if c->'final'->>'id' is distinct from p_first_final_id::text then raise exception 'nmls_remediation_access_denied'; end if;
  select * into w from public.nmls_private_remediations where first_final_id = p_first_final_id;
  select * into e from public.nmls_private_remediation_events where student_id=p_student_id and event_id=p_event_id;
  return c || jsonb_build_object('finalEvent',c->'event','workflow',case when w.first_final_id is null then null else to_jsonb(w) end,
    'event',case when e.event_id is null then null else to_jsonb(e) end);
end $$;

-- Exact set equality, including duplicate rejection; NULL is never completion.
create function public.nmls_private_same_ids(actual jsonb, expected jsonb) returns boolean
language plpgsql immutable set search_path = pg_catalog, public as $$
begin
  if jsonb_typeof(actual) is distinct from 'array' or jsonb_typeof(expected) is distinct from 'array' then return false; end if;
  return jsonb_array_length(actual)=jsonb_array_length(expected)
    and (select count(distinct value) from jsonb_array_elements(actual))=jsonb_array_length(actual)
    and actual @> expected and expected @> actual;
end $$;

create function public.nmls_private_remediation_commit(
  p_student_id uuid, p_review_attempt_id uuid, p_first_final_id uuid, p_event_id uuid, p_command_digest text, p_kind text,
  p_expected_review_revision bigint, p_expected_workflow_revision bigint, p_evaluated_at_ms bigint,
  p_definition_digest text, p_manifest jsonb, p_action_kind text, p_expected_session_id uuid,
  p_runtime jsonb, p_audit jsonb, p_review_outcome jsonb, p_second_id uuid, p_selection jsonb, p_answers jsonb, p_result jsonb
) returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare g public.nmls_review_access_grants; a public.nmls_review_attempts; f public.nmls_private_finals;
  w public.nmls_private_remediations; e public.nmls_private_remediation_events; at_ms bigint; exists_workflow boolean;
  outcome jsonb; event_audit jsonb; code text; idle_deadline_ms bigint;
begin
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a0 on a0.grant_id=g0.id
    where a0.id=p_review_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status <> 'active' or g.expires_at <= clock_timestamp() then
    raise exception 'nmls_remediation_access_denied'; end if;
  insert into public.nmls_review_study_leases(student_id) values(p_student_id) on conflict do nothing;
  perform 1 from public.nmls_review_study_leases where student_id=p_student_id for update;
  select * into a from public.nmls_review_attempts where id=p_review_attempt_id for update;
  at_ms := floor(extract(epoch from clock_timestamp())*1000);
  if a.student_id is distinct from p_student_id or g.expires_at <= clock_timestamp() then raise exception 'nmls_remediation_access_denied'; end if;
  if exists(select 1 from public.nmls_review_policy_bindings where grant_id=g.id) then raise exception 'nmls_remediation_policy_integration_required'; end if;
  select * into f from public.nmls_private_finals where id=p_first_final_id for update;
  if not found or f.student_id is distinct from p_student_id or f.review_attempt_id is distinct from a.id then
    raise exception 'nmls_remediation_access_denied'; end if;
  if a.course_key is distinct from g.course_key or a.content_digest is distinct from g.content_digest
    or f.course_key is distinct from a.course_key or f.content_digest is distinct from a.content_digest
    or f.definition_digest is distinct from p_definition_digest then raise exception 'nmls_remediation_content_changed'; end if;
  if f.revision <> 2 or f.result->'passed' is distinct from 'false'::jsonb or f.selection->'number' is distinct from '1'::jsonb
    or f.result->>'disposition' is distinct from 'remediation_required' or f.submitted_at is null then
    raise exception 'nmls_remediation_first_not_failed'; end if;
  if p_manifest is distinct from f.remediation_manifest or p_manifest is null
    or p_manifest->>'sourceCourseKey' is distinct from a.course_key or p_manifest->>'sourceContentDigest' is distinct from a.content_digest
    or p_manifest->>'definitionDigest' is distinct from f.definition_digest or p_manifest->>'finalAttemptId' is distinct from f.id::text
    or p_manifest->>'reviewAttemptId' is distinct from a.id::text
    or p_manifest->>'courseKey' is distinct from a.course_key||'-remediation-'||f.id::text
    or coalesce(p_manifest->>'contentDigest','') !~ '^[a-f0-9]{64}$'
    or p_manifest->'completed' is distinct from 'false'::jsonb or p_manifest->'retakeEnabled' is distinct from 'false'::jsonb
    or jsonb_typeof(p_manifest->'unitIds') is distinct from 'array' or jsonb_typeof(p_manifest->'moduleIds') is distinct from 'array' then
    raise exception 'nmls_remediation_manifest_changed'; end if;
  if jsonb_array_length(p_manifest->'unitIds')=0 or jsonb_array_length(p_manifest->'moduleIds')=0
    or not public.nmls_private_same_ids(p_manifest->'unitIds',p_manifest->'unitIds')
    or not public.nmls_private_same_ids(p_manifest->'moduleIds',p_manifest->'moduleIds')
    or exists(select 1 from jsonb_array_elements(p_manifest->'unitIds') x where jsonb_typeof(x.value)<>'string' or x.value#>>'{}' !~ '^[FENG][0-9]{2}-U[0-9]{2}$')
    or exists(select 1 from jsonb_array_elements(p_manifest->'moduleIds') x where jsonb_typeof(x.value)<>'string' or x.value#>>'{}' !~ '^[FENG][0-9]{2}$') then
    raise exception 'nmls_remediation_manifest_changed'; end if;
  select * into w from public.nmls_private_remediations where first_final_id=f.id for update;
  exists_workflow := found;
  if exists_workflow and (w.student_id is distinct from p_student_id or w.review_attempt_id is distinct from a.id
    or w.definition_digest is distinct from f.definition_digest or w.manifest is distinct from p_manifest) then raise exception 'nmls_remediation_workflow_scope'; end if;
  if exists(select 1 from public.nmls_private_final_events where student_id=p_student_id and event_id=p_event_id) then
    raise exception 'nmls_remediation_idempotency_conflict'; end if;
  select * into e from public.nmls_private_remediation_events where student_id=p_student_id and event_id=p_event_id;
  if found then
    if e.first_final_id is distinct from f.id or e.command_digest is distinct from p_command_digest then raise exception 'nmls_remediation_idempotency_conflict'; end if;
    return jsonb_build_object('duplicate',true,'outcome',e.outcome);
  end if;
  if p_event_id is null or p_command_digest is null or p_command_digest !~ '^[a-f0-9]{64}$' then raise exception 'nmls_remediation_invalid_command'; end if;
  if a.revision is distinct from p_expected_review_revision or coalesce(w.revision,0) is distinct from p_expected_workflow_revision then
    raise exception 'nmls_remediation_revision_conflict'; end if;
  if a.runtime->>'status' is distinct from 'review_complete' or a.runtime->>'courseKey' is distinct from a.course_key
    or a.runtime->>'contentDigest' is distinct from a.content_digest or a.runtime->'creditIssuanceAllowed' is distinct from 'false'::jsonb
    or coalesce(a.runtime->'current','null'::jsonb) <> 'null'::jsonb or coalesce(a.runtime->'quiz','null'::jsonb) <> 'null'::jsonb then
    raise exception 'nmls_remediation_review_prerequisites'; end if;
  if p_evaluated_at_ms is null or p_evaluated_at_ms > at_ms+1000 or at_ms-p_evaluated_at_ms > 1000 then raise exception 'nmls_remediation_clock_refresh_required'; end if;
  if clock_timestamp() < timestamptz '2026-01-01 00:00:00+00' or clock_timestamp() >= timestamptz '2027-01-01 00:00:00+00' then
    raise exception 'nmls_remediation_authoring_year_closed'; end if;
  if p_kind in ('start_remediation','remediation_event') then
    if p_second_id is not null or p_selection is not null or p_answers is not null or p_result is not null then raise exception 'nmls_remediation_invalid_command'; end if;
    if p_runtime->>'courseKey' is distinct from p_manifest->>'courseKey' or p_runtime->>'contentDigest' is distinct from p_manifest->>'contentDigest'
      or p_runtime->>'mode' is distinct from 'non_credit_review' or p_runtime->'creditIssuanceAllowed' is distinct from 'false'::jsonb
      or jsonb_typeof(p_runtime->'completedUnitIds') is distinct from 'array' or jsonb_typeof(p_runtime->'passedModuleIds') is distinct from 'array'
      or coalesce(p_runtime->'bookmark','null'::jsonb) <> 'null'::jsonb
      or coalesce(p_runtime->>'status','') not in ('logged_out','active','review_complete')
      or jsonb_typeof(p_runtime->'completedReviewMs') is distinct from 'number'
      or coalesce(p_runtime->>'completedReviewMs','') !~ '^[0-9]+$' then raise exception 'nmls_remediation_invalid_runtime'; end if;
    if (p_runtime->>'status'='logged_out' and p_runtime->'sessionId' is distinct from 'null'::jsonb)
      or (p_runtime->>'status'<>'logged_out' and (jsonb_typeof(p_runtime->'sessionId') is distinct from 'string'
        or coalesce(p_runtime->>'sessionId','') !~* '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$')) then
      raise exception 'nmls_remediation_invalid_session'; end if;
    if coalesce(p_runtime->'current','null'::jsonb)<>'null'::jsonb and (jsonb_typeof(p_runtime->'current') is distinct from 'object'
      or jsonb_typeof(p_runtime->'current'->'unitId') is distinct from 'string'
      or not ((p_manifest->'unitIds') ? (p_runtime->'current'->>'unitId'))) then raise exception 'nmls_remediation_invalid_runtime'; end if;
    if coalesce(p_runtime->'quiz','null'::jsonb)<>'null'::jsonb and (jsonb_typeof(p_runtime->'quiz') is distinct from 'object'
      or jsonb_typeof(p_runtime->'quiz'->'id') is distinct from 'string'
      or coalesce(p_runtime->'quiz'->>'id','') !~* '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
      or jsonb_typeof(p_runtime->'quiz'->'moduleId') is distinct from 'string'
      or not ((p_manifest->'moduleIds') ? (p_runtime->'quiz'->>'moduleId'))) then raise exception 'nmls_remediation_invalid_runtime'; end if;
    if not ((p_manifest->'unitIds') @> (p_runtime->'completedUnitIds')) or not ((p_manifest->'moduleIds') @> (p_runtime->'passedModuleIds'))
      or not public.nmls_private_same_ids(p_runtime->'completedUnitIds',p_runtime->'completedUnitIds')
      or not public.nmls_private_same_ids(p_runtime->'passedModuleIds',p_runtime->'passedModuleIds') then raise exception 'nmls_remediation_invalid_runtime'; end if;
    if p_runtime->>'status' = 'review_complete' and (
      not public.nmls_private_same_ids(p_runtime->'completedUnitIds',p_manifest->'unitIds')
      or not public.nmls_private_same_ids(p_runtime->'passedModuleIds',p_manifest->'moduleIds')
      or coalesce(p_runtime->'current','null'::jsonb) <> 'null'::jsonb or coalesce(p_runtime->'quiz','null'::jsonb) <> 'null'::jsonb
      or coalesce(p_runtime->'quizReservation','null'::jsonb) <> 'null'::jsonb) then raise exception 'nmls_remediation_incomplete'; end if;
    if p_kind='start_remediation' then
      if exists_workflow then raise exception 'nmls_remediation_already_started'; end if;
      if p_action_kind is not null or p_expected_session_id is not null or p_audit is not null or p_review_outcome is not null
        or p_runtime is distinct from jsonb_build_object('mode','non_credit_review','creditIssuanceAllowed',false,
          'courseKey',p_manifest->>'courseKey','contentDigest',p_manifest->>'contentDigest','revision',0,'status','logged_out',
          'sessionId',null,'lastActivityMs',null,'lastReceiptMs',0,'completedUnitIds','[]'::jsonb,'completedReviewMs',0,
          'passedModuleIds','[]'::jsonb,'current',null,'quiz',null,'feedback',null) then raise exception 'nmls_remediation_nonempty_start'; end if;
      insert into public.nmls_private_remediations(first_final_id,student_id,review_attempt_id,definition_digest,manifest,revision,status,runtime)
        values(f.id,p_student_id,a.id,f.definition_digest,p_manifest,1,'remediating',p_runtime) returning * into w;
      code := 'private_remediation_started';
      event_audit := jsonb_build_object('kind',p_kind,'atMs',p_evaluated_at_ms);
    else
      if not exists_workflow or w.status <> 'remediating' then raise exception 'nmls_remediation_phase_closed'; end if;
      if p_action_kind is null or p_action_kind not in ('resume','logout','open_unit','heartbeat','interaction','unit_action','complete_unit','quiz_start','quiz_submit')
        or p_audit->>'kind' is distinct from p_action_kind or p_audit->'atMs' is distinct from to_jsonb(p_evaluated_at_ms)
        or jsonb_typeof(p_review_outcome) is distinct from 'object'
        or jsonb_typeof(p_review_outcome->'ok') is distinct from 'boolean'
        or coalesce(p_review_outcome->>'code','') !~ '^[a-z_]{3,80}$' or coalesce(p_review_outcome->'status','null'::jsonb) not in ('200'::jsonb,'400'::jsonb,'401'::jsonb,'409'::jsonb)
        or (p_review_outcome - array['ok','code','status']) <> '{}'::jsonb then raise exception 'nmls_remediation_invalid_event'; end if;
      if p_action_kind <> 'resume' and (p_expected_session_id is null or w.runtime->>'sessionId' is distinct from p_expected_session_id::text) then
        raise exception 'nmls_remediation_session_conflict'; end if;
      if w.runtime->>'status'='active' then
        if jsonb_typeof(w.runtime->'lastActivityMs') is distinct from 'number' or coalesce(w.runtime->>'lastActivityMs','') !~ '^[0-9]+$' then
          raise exception 'nmls_remediation_invalid_runtime'; end if;
        idle_deadline_ms := (w.runtime->>'lastActivityMs')::bigint + 360000;
        -- An event evaluated just before idle expiry must be re-evaluated if
        -- the boundary elapsed while waiting for the locks, not saved as active.
        if p_evaluated_at_ms < idle_deadline_ms and at_ms >= idle_deadline_ms then raise exception 'nmls_remediation_clock_refresh_required'; end if;
        if p_evaluated_at_ms >= idle_deadline_ms and (p_review_outcome->'ok' is distinct from 'false'::jsonb
          or p_review_outcome->>'code' is distinct from 'course_logout_required' or p_review_outcome->'status' is distinct from '401'::jsonb
          or p_runtime->>'status' is distinct from 'logged_out' or coalesce(p_runtime->'current','null'::jsonb)<>'null'::jsonb
          or coalesce(p_runtime->'quiz','null'::jsonb)<>'null'::jsonb
          or p_runtime->'completedUnitIds' is distinct from w.runtime->'completedUnitIds'
          or p_runtime->'passedModuleIds' is distinct from w.runtime->'passedModuleIds') then raise exception 'nmls_remediation_idle_cleanup_required'; end if;
      end if;
      if p_runtime->'revision' is distinct from to_jsonb((w.runtime->>'revision')::bigint+1)
        or p_runtime->'lastReceiptMs' is distinct from to_jsonb(p_evaluated_at_ms)
        or p_evaluated_at_ms < (w.runtime->>'lastReceiptMs')::bigint
        or coalesce(p_runtime->>'status','') not in ('logged_out','active','review_complete')
        or not ((p_runtime->'completedUnitIds') @> (w.runtime->'completedUnitIds')) or not ((p_runtime->'passedModuleIds') @> (w.runtime->'passedModuleIds')) then
        raise exception 'nmls_remediation_invalid_runtime'; end if;
      -- Action-specific guards: a resume/heartbeat cannot assert completion.
      -- These are not an independent answer-key or observed-attendance grader.
      if p_runtime->'completedUnitIds' is distinct from w.runtime->'completedUnitIds' then
        if p_action_kind<>'complete_unit' or p_review_outcome->'ok' is distinct from 'true'::jsonb
          or p_review_outcome->>'code' is distinct from 'unit_review_complete'
          or p_audit->>'unitId' is distinct from w.runtime->'current'->>'unitId'
          or p_audit->'unitId' is distinct from p_manifest->'unitIds'->jsonb_array_length(w.runtime->'completedUnitIds')
          or p_runtime->'completedUnitIds' is distinct from ((w.runtime->'completedUnitIds') || jsonb_build_array(p_audit->'unitId'))
          or coalesce(p_runtime->'current','null'::jsonb)<>'null'::jsonb
          or w.runtime->'current'->>'status' is distinct from 'active'
          or coalesce(w.runtime->'current'->>'provisionalMs','') !~ '^[0-9]+$'
          or coalesce(w.runtime->'current'->>'requiredMs','') !~ '^[1-9][0-9]*$'
          or jsonb_typeof(w.runtime->'current'->'completedActionIds') is distinct from 'array'
          or jsonb_typeof(w.runtime->'current'->'requiredActionIds') is distinct from 'array' then raise exception 'nmls_remediation_invalid_unit_completion'; end if;
        if (w.runtime->'current'->>'provisionalMs')::bigint < (w.runtime->'current'->>'requiredMs')::bigint
          or not ((w.runtime->'current'->'completedActionIds') @> (w.runtime->'current'->'requiredActionIds'))
          or p_audit->'acceptedReviewMs' is distinct from w.runtime->'current'->'provisionalMs'
          or p_runtime->'completedReviewMs' is distinct from to_jsonb((w.runtime->>'completedReviewMs')::bigint+(p_audit->>'acceptedReviewMs')::bigint) then
          raise exception 'nmls_remediation_invalid_unit_completion'; end if;
      elsif p_runtime->'completedReviewMs' is distinct from w.runtime->'completedReviewMs' then raise exception 'nmls_remediation_invalid_unit_completion'; end if;
      if p_runtime->'passedModuleIds' is distinct from w.runtime->'passedModuleIds' then
        if p_action_kind<>'quiz_submit' or p_review_outcome->'ok' is distinct from 'true'::jsonb or p_audit->'passed' is distinct from 'true'::jsonb
          or p_review_outcome->>'code' is distinct from 'module_review_passed'
          or p_audit->'quizId' is distinct from w.runtime->'quiz'->'id' or p_audit->'moduleId' is distinct from w.runtime->'quiz'->'moduleId'
          or p_audit->'moduleId' is distinct from p_manifest->'moduleIds'->jsonb_array_length(w.runtime->'passedModuleIds')
          or p_runtime->'passedModuleIds' is distinct from ((w.runtime->'passedModuleIds') || jsonb_build_array(p_audit->'moduleId'))
          or coalesce(p_runtime->'quiz','null'::jsonb)<>'null'::jsonb or coalesce(p_runtime->'quizReservation','null'::jsonb)<>'null'::jsonb
          or exists(select 1 from jsonb_array_elements_text(p_manifest->'unitIds') x
            where x.value like (p_audit->>'moduleId')||'-%' and not ((w.runtime->'completedUnitIds') ? x.value)) then
          raise exception 'nmls_remediation_invalid_module_completion'; end if;
      end if;
      if p_runtime->>'status'='review_complete' and w.runtime->>'status'<>'review_complete'
        and (p_action_kind<>'quiz_submit' or p_audit->'passed' is distinct from 'true'::jsonb
          or p_runtime->'passedModuleIds' is not distinct from w.runtime->'passedModuleIds') then raise exception 'nmls_remediation_invalid_completion'; end if;
      update public.nmls_private_remediations set runtime=p_runtime,revision=revision+1 where first_final_id=f.id returning * into w;
      code := 'private_remediation_event_saved'; event_audit := p_audit;
    end if;
  elsif p_kind in ('issue_second','submit_second') then
    if not exists_workflow then raise exception 'nmls_remediation_not_started'; end if;
    if p_runtime is not null or p_action_kind is not null or p_expected_session_id is not null or p_audit is not null or p_review_outcome is not null then
      raise exception 'nmls_remediation_invalid_command'; end if;
    if w.runtime->>'status' is distinct from 'review_complete' or not public.nmls_private_same_ids(w.runtime->'completedUnitIds',p_manifest->'unitIds')
      or not public.nmls_private_same_ids(w.runtime->'passedModuleIds',p_manifest->'moduleIds')
      or coalesce(w.runtime->'current','null'::jsonb) <> 'null'::jsonb or coalesce(w.runtime->'quiz','null'::jsonb) <> 'null'::jsonb
      or coalesce(w.runtime->'bookmark','null'::jsonb) <> 'null'::jsonb or coalesce(w.runtime->'quizReservation','null'::jsonb) <> 'null'::jsonb then
      raise exception 'nmls_remediation_incomplete'; end if;
    if p_kind='issue_second' then
      if w.status <> 'remediating' or w.second_id is not null then raise exception 'nmls_remediation_already_issued'; end if;
      if p_second_id is null or p_second_id=f.id or p_selection->>'schema' is distinct from 'statecourse-nmls-draft-final-attempt-v1'
        or p_selection->>'id' is distinct from p_second_id::text or p_selection->>'reviewAttemptId' is distinct from a.id::text
        or p_selection->>'definitionDigest' is distinct from f.definition_digest or p_selection->'number' is distinct from '2'::jsonb
        or jsonb_typeof(p_selection->'questionIds') is distinct from 'array' or jsonb_typeof(p_selection->'optionOrder') is distinct from 'object'
        or p_answers is not null or p_result is not null then raise exception 'nmls_remediation_invalid_selection'; end if;
      if jsonb_array_length(p_selection->'questionIds')<>25 or not public.nmls_private_same_ids(p_selection->'questionIds',p_selection->'questionIds')
        or (select count(*) from jsonb_object_keys(p_selection->'optionOrder'))<>25
        or exists(select 1 from jsonb_array_elements_text(p_selection->'questionIds') q where q.value !~ '^N26-FIN-[FENG][0-9]{2}$'
          or f.selection->'questionIds' ? q.value or jsonb_typeof(p_selection->'optionOrder'->q.value) is distinct from 'array') then
        raise exception 'nmls_remediation_invalid_selection'; end if;
      if exists(select 1 from jsonb_each(p_selection->'optionOrder') o
        where not public.nmls_private_same_ids(o.value,'["A","B","C","D"]')) then raise exception 'nmls_remediation_invalid_selection'; end if;
      update public.nmls_private_remediations set revision=revision+1,status='second_issued',second_id=p_second_id,
        second_selection=p_selection,second_issued_at=clock_timestamp() where first_final_id=f.id returning * into w;
      code := 'private_second_final_issued';
    else
      if w.status <> 'second_issued' or w.second_id is distinct from p_second_id then raise exception 'nmls_remediation_second_unavailable'; end if;
      if p_selection is not null or jsonb_typeof(p_answers) is distinct from 'object' or jsonb_typeof(p_result) is distinct from 'object' then
        raise exception 'nmls_remediation_invalid_submission'; end if;
      if (select count(*) from jsonb_object_keys(p_answers))<>25 or exists(select 1 from jsonb_each_text(p_answers) x
        where x.value is null or x.value not in ('A','B','C','D') or not (w.second_selection->'questionIds' ? x.key)) then
        raise exception 'nmls_remediation_invalid_answers'; end if;
      if p_result->>'mode' is distinct from 'private_authoring_review' or p_result->'total' is distinct from '25'::jsonb
        or p_result->'requiredCorrect' is distinct from '18'::jsonb or coalesce(p_result->>'correct','') !~ '^([0-9]|1[0-9]|2[0-5])$'
        or p_result->'creditIssuanceAllowed' is distinct from 'false'::jsonb or p_result->'courseCompletionIssued' is distinct from 'false'::jsonb
        or p_result->'assignedCreditSeconds' is distinct from '0'::jsonb then raise exception 'nmls_remediation_invalid_result'; end if;
      if p_result->'passed' is distinct from to_jsonb((p_result->>'correct')::int >= 18)
        or p_result->'percent' is distinct from to_jsonb((p_result->>'correct')::int*4)
        or p_result->>'disposition' is distinct from (case when (p_result->>'correct')::int >= 18 then 'draft_final_passed' else 'staff_review_required' end) then
        raise exception 'nmls_remediation_invalid_result'; end if;
      update public.nmls_private_remediations set revision=revision+1,status=case when p_result->'passed'='true'::jsonb then 'passed' else 'staff_review_required' end,
        second_answers=p_answers,second_result=p_result,second_submitted_at=clock_timestamp() where first_final_id=f.id returning * into w;
      code := 'private_second_final_submitted';
    end if;
    event_audit := jsonb_build_object('kind',p_kind,'atMs',p_evaluated_at_ms);
  else raise exception 'nmls_remediation_invalid_command'; end if;
  -- Explicit metadata allowlist; never return reducer lesson/quiz/feedback,
  -- source/answers, selection, or an uncommitted grade.
  outcome := jsonb_build_object('code',code,'firstFinalId',f.id,'revision',w.revision,'phase',w.status,
    'secondFinalId',w.second_id,'mode','private_authoring_review','studentDeliveryEnabled',false,'creditIssuanceAllowed',false,
    'courseCompletionIssued',false,'retakeEnabled',false,'reviewResult',p_review_outcome,
    'progress',jsonb_build_object('status',w.runtime->>'status','sessionId',w.runtime->'sessionId',
      'completedUnitIds',w.runtime->'completedUnitIds','passedModuleIds',w.runtime->'passedModuleIds',
      'currentUnitId',w.runtime->'current'->'unitId','quizId',w.runtime->'quiz'->'id'),
    'result',case when p_kind='submit_second' then jsonb_build_object('passed',w.second_result->'passed',
      'correct',w.second_result->'correct','total',25,'requiredCorrect',18,'percent',w.second_result->'percent',
      'disposition',w.second_result->>'disposition','creditIssuanceAllowed',false,'courseCompletionIssued',false,'assignedCreditSeconds',0) else null end);
  insert into public.nmls_private_remediation_events(student_id,event_id,first_final_id,command_digest,resulting_revision,audit,outcome)
    values(p_student_id,p_event_id,f.id,p_command_digest,w.revision,event_audit,outcome);
  if idle_deadline_ms is not null and p_evaluated_at_ms < idle_deadline_ms
    and floor(extract(epoch from clock_timestamp())*1000) >= idle_deadline_ms then
    raise exception 'nmls_remediation_clock_refresh_required'; end if;
  if g.expires_at <= clock_timestamp() then raise exception 'nmls_remediation_access_denied'; end if;
  if clock_timestamp() >= timestamptz '2027-01-01 00:00:00+00' then raise exception 'nmls_remediation_authoring_year_closed'; end if;
  return jsonb_build_object('duplicate',false,'outcome',outcome);
end $$;

-- Both namespaces share the existing actor mutex, so an event cannot be reused
-- by the first-final API after it was committed in the child (or conversely).
alter function public.nmls_private_final_commit(uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,text,uuid,jsonb,jsonb,jsonb,jsonb)
  rename to nmls_private_final_commit_pre_remediation_internal;
revoke all on function public.nmls_private_final_commit_pre_remediation_internal(uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,text,uuid,jsonb,jsonb,jsonb,jsonb)
  from public,anon,authenticated,service_role;
create function public.nmls_private_final_commit(
  p_student_id uuid,p_review_attempt_id uuid,p_event_id uuid,p_command_digest text,p_kind text,
  p_expected_review_revision bigint,p_expected_final_revision bigint,p_evaluated_at_ms bigint,p_content_digest text,p_definition_digest text,
  p_final_id uuid,p_selection jsonb,p_answers jsonb,p_result jsonb,p_remediation_manifest jsonb
) returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare g public.nmls_review_access_grants;
begin
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a0 on a0.grant_id=g0.id
    where a0.id=p_review_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status <> 'active' or g.expires_at <= clock_timestamp() then raise exception 'nmls_final_access_denied'; end if;
  insert into public.nmls_review_study_leases(student_id) values(p_student_id) on conflict do nothing;
  perform 1 from public.nmls_review_study_leases where student_id=p_student_id for update;
  if exists(select 1 from public.nmls_private_remediation_events where student_id=p_student_id and event_id=p_event_id) then
    raise exception 'nmls_final_idempotency_conflict'; end if;
  return public.nmls_private_final_commit_pre_remediation_internal(p_student_id,p_review_attempt_id,p_event_id,p_command_digest,p_kind,
    p_expected_review_revision,p_expected_final_revision,p_evaluated_at_ms,p_content_digest,p_definition_digest,
    p_final_id,p_selection,p_answers,p_result,p_remediation_manifest);
end $$;

revoke all on function public.nmls_private_remediation_immutable(),public.nmls_private_same_ids(jsonb,jsonb),
  public.nmls_private_remediation_context(uuid,uuid,uuid,uuid),
  public.nmls_private_remediation_commit(uuid,uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,jsonb,text,uuid,jsonb,jsonb,jsonb,uuid,jsonb,jsonb,jsonb),
  public.nmls_private_final_commit(uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,text,uuid,jsonb,jsonb,jsonb,jsonb)
  from public,anon,authenticated,service_role;
grant execute on function public.nmls_private_remediation_context(uuid,uuid,uuid,uuid),
  public.nmls_private_remediation_commit(uuid,uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,jsonb,text,uuid,jsonb,jsonb,jsonb,uuid,jsonb,jsonb,jsonb),
  public.nmls_private_final_commit(uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,text,uuid,jsonb,jsonb,jsonb,jsonb) to service_role;
commit;
