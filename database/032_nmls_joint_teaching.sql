-- LOCAL ONLY. Reconcile numbering with the NEW infrastructure handoff.
-- Private non-credit teaching persistence. No endpoint, final delivery or live application.
begin;

-- Exact canonical JSON for ASCII-keyed phase metadata, not the ordered source
-- manuscript hash. Source bytes are rechecked by the private source loader.
create function public.nmls_teaching_canonical(p_value jsonb) returns text
language plpgsql immutable set search_path=pg_catalog,public as $$
declare result text;
begin
  if jsonb_typeof(p_value)='object' then
    select '{'||coalesce(string_agg(to_jsonb(key)::text||':'||public.nmls_teaching_canonical(value),',' order by key collate "C"),'')||'}'
      into result from jsonb_each(p_value);
  elsif jsonb_typeof(p_value)='array' then
    select '['||coalesce(string_agg(public.nmls_teaching_canonical(value),',' order by ordinal),'')||']'
      into result from jsonb_array_elements(p_value) with ordinality as x(value,ordinal);
  else result:=p_value::text; end if;
  return result;
end $$;

create table public.nmls_teaching_phase_bindings (
  student_id uuid not null references public.students(id),
  review_attempt_id uuid not null references public.nmls_review_attempts(id),
  phase_kind text not null check (phase_kind in ('source','remediation')),
  phase_owner_id uuid not null,
  phase_scope jsonb not null check (jsonb_typeof(phase_scope)='object'),
  teaching_digest text not null check (teaching_digest ~ '^[a-f0-9]{64}$'),
  layout jsonb not null check (jsonb_typeof(layout)='array'),
  primary key(student_id,review_attempt_id,phase_kind,phase_owner_id)
);
alter table public.nmls_review_study_leases add column phase_active boolean not null default false,
  add constraint nmls_phase_active_shape check (not phase_active or phase_kind is not null);
create table public.nmls_teaching_events (
  student_id uuid not null references public.students(id),
  event_id uuid not null,
  review_attempt_id uuid not null references public.nmls_review_attempts(id),
  phase_kind text not null check (phase_kind in ('source','remediation')),
  phase_owner_id uuid not null,
  command_digest text not null check (command_digest ~ '^[a-f0-9]{64}$'),
  actor_revision bigint not null,
  source_revision bigint not null,
  workflow_revision bigint,
  runtime_revision bigint not null,
  lease_before jsonb not null,
  lease_after jsonb not null,
  outcome jsonb not null,
  audit jsonb not null,
  transaction_id bigint not null default txid_current(),
  recorded_at timestamptz not null default clock_timestamp(),
  primary key(student_id,event_id), unique(student_id,actor_revision)
);
alter table public.nmls_teaching_phase_bindings enable row level security;
alter table public.nmls_teaching_events enable row level security;
revoke all on public.nmls_teaching_phase_bindings,public.nmls_teaching_events from public,anon,authenticated,service_role;
create trigger nmls_teaching_binding_immutable before update or delete on public.nmls_teaching_phase_bindings
  for each row execute function public.nmls_private_final_event_immutable();
create trigger nmls_teaching_event_immutable before update or delete on public.nmls_teaching_events
  for each row execute function public.nmls_private_final_event_immutable();

-- Transaction-local recorded evidence, NOT a caller-set flag. The joint RPC
-- inserts the immutable receipt after both target and actor writes, before the
-- lease update. Direct role access to all three is revoked.
create or replace function public.nmls_review_lease_phase_integrity() returns trigger
language plpgsql set search_path=pg_catalog,public as $$
declare before_value jsonb; e public.nmls_teaching_events;
begin
  if tg_op='DELETE' then
    if old.phase_kind is not null then raise exception 'nmls_review_phase_lease_transition_requires_joint_commit'; end if;
    return old;
  end if;
  before_value:=case when tg_op='UPDATE' then to_jsonb(old) else null end;
  if tg_op='UPDATE' and new.student_id is distinct from old.student_id then raise exception 'nmls_review_invalid_phase_lease'; end if;
  if new.phase_kind is null and (tg_op='INSERT' or old.phase_kind is null) then return new; end if;
  if tg_op='UPDATE' and new is not distinct from old then return new; end if;
  select * into e from public.nmls_teaching_events where student_id=new.student_id and transaction_id=txid_current()
    and lease_before is not distinct from before_value and lease_after=to_jsonb(new)
    order by actor_revision desc limit 1;
  if not found or new.phase_kind is null or new.attempt_id is distinct from e.review_attempt_id
    or new.phase_kind is distinct from e.phase_kind or new.phase_owner_id is distinct from e.phase_owner_id
    or not exists(select 1 from public.nmls_review_actor_policy where student_id=new.student_id and revision=e.actor_revision)
    or not exists(select 1 from public.nmls_review_attempts where id=e.review_attempt_id and student_id=new.student_id and revision=e.source_revision)
    or e.phase_kind='remediation' and not exists(select 1 from public.nmls_private_remediations
      where first_final_id=e.phase_owner_id and student_id=new.student_id and revision=e.workflow_revision) then
    raise exception 'nmls_review_phase_lease_transition_requires_joint_commit'; end if;
  return new;
end $$;

-- Extend BOTH directions of event arbitration. A dormant phase marker stays
-- after clean logout/completion, so legacy start cannot erase v3 actor history.
alter function public.nmls_review_legacy_write_fence(uuid,uuid,uuid,text,text) rename to nmls_review_pre_joint_fence_internal;
create function public.nmls_review_legacy_write_fence(p_actor uuid,p_review uuid,p_event uuid,p_digest text,p_namespace text)
returns void language plpgsql set search_path=pg_catalog,public as $$
begin
  perform public.nmls_review_pre_joint_fence_internal(p_actor,p_review,p_event,p_digest,p_namespace);
  if exists(select 1 from public.nmls_teaching_events where student_id=p_actor and event_id=p_event) then
    raise exception 'nmls_review_idempotency_conflict'; end if;
end $$;

create function public.nmls_teaching_context(p_student_id uuid,p_attempt_id uuid,p_phase_kind text,p_phase_owner_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare ctx jsonb; f public.nmls_private_finals; w public.nmls_private_remediations; lease public.nmls_review_study_leases;
begin
  ctx:=public.nmls_policy_context(p_student_id,p_attempt_id);
  if p_phase_kind='source' and p_phase_owner_id=p_attempt_id then null;
  elsif p_phase_kind='remediation' then
    select * into f from public.nmls_private_finals where id=p_phase_owner_id and student_id=p_student_id and review_attempt_id=p_attempt_id;
    select * into w from public.nmls_private_remediations where first_final_id=p_phase_owner_id and student_id=p_student_id and review_attempt_id=p_attempt_id;
    if f.id is null or w.first_final_id is null then raise exception 'nmls_teaching_phase_not_found'; end if;
  else raise exception 'nmls_teaching_invalid_phase'; end if;
  select * into lease from public.nmls_review_study_leases where student_id=p_student_id;
  return ctx||jsonb_build_object('lease',case when lease.student_id is null then null else to_jsonb(lease) end,
    'firstFinal',case when f.id is null then null else to_jsonb(f) end,
    'workflow',case when w.first_final_id is null then null else to_jsonb(w) end);
end $$;

-- Independent structural/progression guard, NOT a second answer-key grader.
-- Layout originates from the verified private source and is pinned once.
create function public.nmls_teaching_guard_progress(p_old jsonb,p_new jsonb,p_layout jsonb,p_outcome jsonb,p_audit jsonb,p_at bigint)
returns void language plpgsql set search_path=pg_catalog,public as $$
declare m jsonb; u jsonb; units jsonb:='[]'; modules jsonb:='[]'; r jsonb; unit_ms bigint:=0;
  ra jsonb:=p_audit->'review'; terminal boolean; field text;
begin
  if jsonb_typeof(p_layout) is distinct from 'array' or jsonb_array_length(p_layout) not between 1 and 100 then
    raise exception 'nmls_teaching_invalid_layout'; end if;
  for m in select value from jsonb_array_elements(p_layout) loop
    if jsonb_typeof(m->'id') is distinct from 'string' or length(m->>'id') not between 1 and 160
      or m-array['id','units','passPercent','questionsPerAttempt']<>'{}'::jsonb
      or coalesce(m->>'passPercent','') !~ '^[0-9]+$' or (m->>'passPercent')::int not between 1 and 100
      or coalesce(m->>'questionsPerAttempt','') !~ '^[0-9]+$' or (m->>'questionsPerAttempt')::int not between 1 and 100
      or jsonb_typeof(m->'units') is distinct from 'array' or jsonb_array_length(m->'units') not between 1 and 1000 then
      raise exception 'nmls_teaching_invalid_layout'; end if;
    modules:=modules||jsonb_build_array(m->'id');
    for u in select value from jsonb_array_elements(m->'units') loop
      if jsonb_typeof(u->'id') is distinct from 'string' or length(u->>'id') not between 1 and 160
        or u-array['id','requiredMs','requiredActionIds']<>'{}'::jsonb
        or coalesce(u->>'requiredMs','') !~ '^[1-9][0-9]*$' or (u->>'requiredMs')::numeric>36000000
        or jsonb_typeof(u->'requiredActionIds') is distinct from 'array' or jsonb_array_length(u->'requiredActionIds')<1
        or not public.nmls_private_same_ids(u->'requiredActionIds',u->'requiredActionIds') then raise exception 'nmls_teaching_invalid_layout'; end if;
      units:=units||jsonb_build_array(u->'id');
    end loop;
  end loop;
  if not public.nmls_private_same_ids(units,units) or not public.nmls_private_same_ids(modules,modules) then raise exception 'nmls_teaching_invalid_layout'; end if;
  for r in select value from jsonb_array_elements(jsonb_build_array(p_old,p_new)) loop
    if jsonb_typeof(r) is distinct from 'object' or r->>'mode' is distinct from 'non_credit_review'
      or r->'creditIssuanceAllowed' is distinct from 'false'::jsonb
      or not coalesce(r->>'status' in ('active','logged_out','review_complete'),false)
      or jsonb_typeof(r->'completedUnitIds') is distinct from 'array' or jsonb_typeof(r->'passedModuleIds') is distinct from 'array'
      or coalesce(r->>'completedReviewMs','') !~ '^[0-9]+$'
      or not ((units) @> (r->'completedUnitIds')) or not ((modules) @> (r->'passedModuleIds')) then raise exception 'nmls_teaching_invalid_runtime'; end if;
    foreach field in array array['revision','lastReceiptMs','lastActivityMs'] loop
      if field='lastActivityMs' and r->field='null'::jsonb then continue; end if;
      if jsonb_typeof(r->field) is distinct from 'number' or coalesce(r->>field,'') !~ '^[0-9]+$'
        or (r->>field)::numeric>9007199254740991 or field<>'revision' and (r->>field)::numeric>p_at then
        raise exception 'nmls_teaching_invalid_runtime'; end if;
    end loop;
    if r->>'status'='logged_out' then
      if r->'sessionId' is distinct from 'null'::jsonb or r->'current' is distinct from 'null'::jsonb or r->'quiz' is distinct from 'null'::jsonb then raise exception 'nmls_teaching_invalid_runtime'; end if;
    elsif coalesce(r->>'sessionId','') !~* '^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
      or r->>'lastActivityMs' is null then raise exception 'nmls_teaching_invalid_runtime'; end if;
    if (r->>'lastActivityMs')::numeric>(r->>'lastReceiptMs')::numeric then raise exception 'nmls_teaching_invalid_runtime'; end if;
    if r->'current'<>'null'::jsonb then
      select x.u into u from jsonb_array_elements(p_layout) y(m) cross join lateral jsonb_array_elements(y.m->'units') x(u)
        where x.u->>'id'=r#>>'{current,unitId}';
      if u is null or r->>'status'<>'active' or r->'quiz' is distinct from 'null'::jsonb
        or r#>'{current,sessionId}' is distinct from r->'sessionId'
        or r#>'{current,requiredMs}' is distinct from u->'requiredMs' or r#>'{current,requiredActionIds}' is distinct from u->'requiredActionIds'
        or r#>'{current,unitId}' is distinct from units->jsonb_array_length(r->'completedUnitIds') then raise exception 'nmls_teaching_invalid_runtime'; end if;
    elsif r->'current' is null then raise exception 'nmls_teaching_invalid_runtime'; end if;
    if r->'completedUnitIds' is distinct from (select coalesce(jsonb_agg(value order by n),'[]') from jsonb_array_elements(units) with ordinality x(value,n) where n<=jsonb_array_length(r->'completedUnitIds'))
      or r->'passedModuleIds' is distinct from (select coalesce(jsonb_agg(value order by n),'[]') from jsonb_array_elements(modules) with ordinality x(value,n) where n<=jsonb_array_length(r->'passedModuleIds')) then
      raise exception 'nmls_teaching_invalid_runtime'; end if;
    select coalesce(sum((x.u->>'requiredMs')::bigint),0) into unit_ms from jsonb_array_elements(p_layout) y(m)
      cross join lateral jsonb_array_elements(y.m->'units') x(u) where (r->'completedUnitIds') ? (x.u->>'id');
    if (r->>'completedReviewMs')::numeric<>unit_ms then raise exception 'nmls_teaching_invalid_runtime'; end if;
    if r->>'status'='review_complete' and (r->'completedUnitIds'<>units or r->'passedModuleIds'<>modules
      or r->'current' is distinct from 'null'::jsonb or r->'quiz' is distinct from 'null'::jsonb
      or coalesce(r->'bookmark','null')<>'null'::jsonb or coalesce(r->'quizReservation','null')<>'null'::jsonb)
      or r->>'status'<>'review_complete' and r->'passedModuleIds'=modules then raise exception 'nmls_teaching_invalid_completion'; end if;
  end loop;
  if p_new->'completedUnitIds' is distinct from p_old->'completedUnitIds' then
    select x.u into u from jsonb_array_elements(p_layout) y(m) cross join lateral jsonb_array_elements(y.m->'units') x(u)
      where x.u->>'id'=p_old#>>'{current,unitId}';
    if ra->>'kind' is distinct from 'complete_unit' or p_outcome->'ok' is distinct from 'true'::jsonb
      or p_outcome->>'code' is distinct from 'unit_review_complete' or ra->'unitId' is distinct from u->'id'
      or u is null or p_old#>'{current,requiredMs}' is distinct from u->'requiredMs'
      or p_old#>'{current,requiredActionIds}' is distinct from u->'requiredActionIds'
      or not coalesce((p_old#>'{current,completedActionIds}') @> (u->'requiredActionIds'),false)
      or p_old#>'{current,provisionalMs}' is distinct from u->'requiredMs'
      or ra->'acceptedReviewMs' is distinct from u->'requiredMs'
      or p_new->'completedUnitIds' is distinct from ((p_old->'completedUnitIds')||jsonb_build_array(u->'id'))
      or p_new->'current' is distinct from 'null'::jsonb then raise exception 'nmls_teaching_invalid_unit_completion'; end if;
  elsif p_new->'completedReviewMs' is distinct from p_old->'completedReviewMs' then raise exception 'nmls_teaching_invalid_unit_completion'; end if;
  if p_new->'passedModuleIds' is distinct from p_old->'passedModuleIds' then
    m:=p_layout->jsonb_array_length(p_old->'passedModuleIds');
    if ra->>'kind' is distinct from 'quiz_submit' or p_outcome->>'code' is distinct from 'module_review_passed'
      or p_outcome->'ok' is distinct from 'true'::jsonb or ra->'passed' is distinct from 'true'::jsonb
      or ra->'moduleId' is distinct from m->'id' or ra->'moduleId' is distinct from p_old#>'{quiz,moduleId}'
      or ra->'quizId' is distinct from p_old#>'{quiz,id}' or p_old#>>'{quiz,id}' is null
      or coalesce(ra->>'total','') !~ '^[1-9][0-9]*$' or coalesce(ra->>'correct','') !~ '^[0-9]+$'
      or (ra->>'total')::int<>(m->>'questionsPerAttempt')::int
      or (ra->>'correct')::int>(ra->>'total')::int or (ra->>'correct')::int*100<(m->>'passPercent')::int*(ra->>'total')::int
      or p_new->'passedModuleIds' is distinct from ((p_old->'passedModuleIds')||jsonb_build_array(m->'id'))
      or p_new->'quiz' is distinct from 'null'::jsonb or exists(select 1 from jsonb_array_elements(m->'units') x where not (p_old->'completedUnitIds') ? (x->>'id')) then
      raise exception 'nmls_teaching_invalid_module_completion'; end if;
  end if;
  terminal:=p_new->>'status'='review_complete' and p_old->>'status'<>'review_complete';
  if ra->>'kind' is distinct from 'resume' and p_new->'sessionId' is distinct from p_old->'sessionId'
    and not (p_new->>'status'='logged_out' and p_new->'sessionId'='null'::jsonb) then raise exception 'nmls_review_session_conflict'; end if;
  if terminal and (ra->>'kind' is distinct from 'quiz_submit' or ra->'passed' is distinct from 'true'::jsonb
    or p_new->'passedModuleIds' is not distinct from p_old->'passedModuleIds'
    or p_outcome->'observationReady' is distinct from 'true'::jsonb or p_outcome->>'policyCode' is distinct from 'session_policy_allowed') then
    raise exception 'nmls_teaching_invalid_completion'; end if;
  if p_outcome->'deliveryAllowed'='false'::jsonb and not terminal then
    if p_new->'completedUnitIds' is distinct from p_old->'completedUnitIds' or p_new->'passedModuleIds' is distinct from p_old->'passedModuleIds'
      or p_new->'current' is distinct from p_old->'current' and p_new->'current' is distinct from 'null'::jsonb
      or p_new->'quiz' is distinct from p_old->'quiz' and p_new->'quiz' is distinct from 'null'::jsonb
      or p_new->'feedback' is distinct from p_old->'feedback' and p_new->'feedback' is distinct from 'null'::jsonb then
      raise exception 'nmls_teaching_invalid_denied_progress'; end if;
  end if;
end $$;

create function public.nmls_teaching_commit(p_student_id uuid,p_attempt_id uuid,p_event_id uuid,p_command_digest text,
  p_phase jsonb,p_teaching_digest text,p_layout jsonb,p_expected_source_revision bigint,p_expected_workflow_revision bigint,
  p_expected_runtime_revision bigint,p_expected_actor_revision bigint,p_expected_session_id uuid,p_evaluated_at_ms bigint,
  p_initial_ledger jsonb,p_ledger jsonb,p_runtime jsonb,p_outcome jsonb,p_audit jsonb,p_delivery_until_ms bigint)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants; b public.nmls_review_policy_bindings; a public.nmls_review_attempts;
  l public.nmls_review_actor_policy; lease public.nmls_review_study_leases; f public.nmls_private_finals; w public.nmls_private_remediations;
  pin public.nmls_teaching_phase_bindings; e public.nmls_teaching_events; receipt public.nmls_review_rocs_presentations;
  phase jsonb; old_runtime jsonb; old_ledger jsonb; item jsonb; prior jsonb; new_lease jsonb; history_outcome jsonb;
  source_next bigint; workflow_next bigint; at_ms bigint; opening_ms bigint; cutoff_ms bigint; deadline_ms bigint;
  delivering boolean; terminal boolean; phase_kind text:=p_phase->>'kind'; owner uuid;
begin
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a0 on a0.grant_id=g0.id where a0.id=p_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status<>'active' or g.expires_at<=clock_timestamp() then raise exception 'nmls_review_access_denied'; end if;
  select * into b from public.nmls_review_policy_bindings where grant_id=g.id;
  if not found then raise exception 'nmls_review_policy_binding_required'; end if;
  insert into public.nmls_review_study_leases(student_id) values(p_student_id) on conflict do nothing;
  select * into lease from public.nmls_review_study_leases where student_id=p_student_id for update;
  select * into l from public.nmls_review_actor_policy where student_id=p_student_id for update;
  select * into a from public.nmls_review_attempts where id=p_attempt_id for update;
  at_ms:=floor(extract(epoch from clock_timestamp())*1000);
  if a.student_id is distinct from p_student_id or g.expires_at<=clock_timestamp() then raise exception 'nmls_review_access_denied'; end if;
  if a.course_key is distinct from g.course_key or a.content_digest is distinct from g.content_digest
    or b.offering->>'contentDigest' is distinct from a.content_digest then raise exception 'nmls_review_content_changed'; end if;
  owner:=(p_phase->>'ownerId')::uuid;
  if phase_kind='source' then
    if owner is distinct from a.id or p_expected_workflow_revision is not null or p_teaching_digest is distinct from a.content_digest then raise exception 'nmls_teaching_invalid_phase'; end if;
    old_runtime:=a.runtime;
    phase:=jsonb_build_object('version','nmls-teaching-phase-v1','kind','source','ownerId',a.id,'sourceCourseKey',a.course_key,
      'sourceContentDigest',a.content_digest,'teachingCourseKey',a.course_key,'policyDigest',b.policy_digest,'definitionDigest',null,'manifestDigest',null);
  elsif phase_kind='remediation' then
    select * into f from public.nmls_private_finals where id=owner for update;
    select * into w from public.nmls_private_remediations where first_final_id=owner for update;
    if f.student_id is distinct from p_student_id or f.review_attempt_id is distinct from a.id or f.revision is distinct from 2
      or f.result->'passed' is distinct from 'false'::jsonb or f.submitted_at is null or f.content_digest is distinct from a.content_digest
      or w.student_id is distinct from p_student_id or w.review_attempt_id is distinct from a.id or w.status is distinct from 'remediating'
      or f.course_key is distinct from a.course_key or w.definition_digest is distinct from f.definition_digest or w.manifest is distinct from f.remediation_manifest
      or w.manifest->>'sourceCourseKey' is distinct from a.course_key or w.manifest->>'sourceContentDigest' is distinct from a.content_digest
      or w.manifest->>'definitionDigest' is distinct from f.definition_digest or w.manifest->>'finalAttemptId' is distinct from f.id::text
      or w.manifest->>'reviewAttemptId' is distinct from a.id::text or w.manifest->'completed' is distinct from 'false'::jsonb
      or w.manifest->'retakeEnabled' is distinct from 'false'::jsonb
      or p_teaching_digest is distinct from w.manifest->>'contentDigest' or a.runtime->>'status' is distinct from 'review_complete'
      or a.runtime->'current' is distinct from 'null'::jsonb or a.runtime->'quiz' is distinct from 'null'::jsonb then raise exception 'nmls_teaching_invalid_phase'; end if;
    old_runtime:=w.runtime;
    phase:=jsonb_build_object('version','nmls-teaching-phase-v1','kind','remediation','ownerId',f.id,'sourceCourseKey',a.course_key,
      'sourceContentDigest',a.content_digest,'teachingCourseKey',w.manifest->>'courseKey','policyDigest',b.policy_digest,
      'definitionDigest',f.definition_digest,'manifestDigest',encode(sha256(convert_to(public.nmls_teaching_canonical(w.manifest),'UTF8')),'hex'));
  else raise exception 'nmls_teaching_invalid_phase'; end if;
  if p_phase is distinct from phase then raise exception 'nmls_teaching_scope_changed'; end if;
  if l.student_id is not null and (l.policy_id<>b.policy_id or l.policy_digest<>b.policy_digest) then raise exception 'nmls_review_policy_version_conflict'; end if;
  -- Current authority is checked even for replay. History wins over stale CAS.
  select * into e from public.nmls_teaching_events where student_id=p_student_id and event_id=p_event_id;
  if found then
    if e.review_attempt_id is distinct from a.id or e.phase_kind is distinct from phase_kind or e.phase_owner_id is distinct from owner
      or e.command_digest is distinct from p_command_digest then raise exception 'nmls_review_idempotency_conflict'; end if;
    return jsonb_build_object('duplicate',true,'outcome',e.outcome,'sourceRevision',e.source_revision,'workflowRevision',e.workflow_revision);
  end if;
  if exists(select 1 from public.nmls_review_attempt_events x join public.nmls_review_attempts y on y.id=x.attempt_id where y.student_id=p_student_id and x.event_id=p_event_id)
    or exists(select 1 from public.nmls_review_actor_policy_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_private_final_events where student_id=p_student_id and event_id=p_event_id)
    or exists(select 1 from public.nmls_private_remediation_events where student_id=p_student_id and event_id=p_event_id) then raise exception 'nmls_review_idempotency_conflict'; end if;
  if p_event_id is null or coalesce(p_command_digest,'') !~ '^[a-f0-9]{64}$'
    or coalesce(p_teaching_digest,'') !~ '^[a-f0-9]{64}$' then raise exception 'nmls_teaching_invalid_command'; end if;
  if p_expected_source_revision is distinct from a.revision or p_expected_runtime_revision is distinct from (old_runtime->>'revision')::bigint
    or p_expected_actor_revision is distinct from coalesce(l.revision,0)
    or phase_kind='remediation' and p_expected_workflow_revision is distinct from w.revision then raise exception 'nmls_review_revision_conflict'; end if;
  old_ledger:=coalesce(l.ledger,p_initial_ledger);
  if l.student_id is null and (p_initial_ledger->'revision' is distinct from '0'::jsonb or p_initial_ledger->'lastReceiptMs' is distinct from '0'::jsonb
    or p_initial_ledger->'studyIntervals' is distinct from '[]'::jsonb or p_initial_ledger->'acceptances' is distinct from '[]'::jsonb
    or p_initial_ledger->'studySinceBreakMs' is distinct from '0'::jsonb or p_initial_ledger->'sessionStartedAtMs' is distinct from 'null'::jsonb
    or p_initial_ledger->'lastStudyAtMs' is distinct from 'null'::jsonb or p_initial_ledger->'studyBoundaryAtMs' is distinct from 'null'::jsonb
    or p_initial_ledger->'breakStartedAtMs' is distinct from 'null'::jsonb or p_initial_ledger ? 'observationJournal') then raise exception 'nmls_review_invalid_policy_state'; end if;
  opening_ms:=(b.offering->>'opensAtMs')::bigint; cutoff_ms:=(b.offering->>'closesAtMs')::bigint;
  if p_evaluated_at_ms is null or p_evaluated_at_ms<greatest((old_runtime->>'lastReceiptMs')::bigint,(old_ledger->>'lastReceiptMs')::bigint)
    or p_evaluated_at_ms>at_ms+1000 or at_ms-p_evaluated_at_ms>1000
    or (at_ms<opening_ms) is distinct from (p_evaluated_at_ms<opening_ms) or (at_ms>=cutoff_ms) is distinct from (p_evaluated_at_ms>=cutoff_ms)
    or phase_kind='remediation' and p_evaluated_at_ms<floor(extract(epoch from f.submitted_at)*1000) then raise exception 'nmls_review_clock_refresh_required'; end if;
  -- A foreign phase's active/unresolved window cannot be adopted or cleared.
  for item in select value from jsonb_array_elements(jsonb_build_array(old_ledger#>'{observationJournal,active}',old_ledger#>'{observationJournal,unresolved,window}')) where value<>'null'::jsonb loop
    if item#>'{scope,teachingPhase}' is distinct from phase or item#>>'{scope,attemptId}' is distinct from a.id::text then raise exception 'nmls_teaching_original_observation_hold'; end if;
    if old_runtime->>'status'='review_complete' then raise exception 'nmls_teaching_completed_phase_requires_reconciliation'; end if;
  end loop;
  if lease.phase_active and (lease.attempt_id is distinct from a.id or lease.phase_kind is distinct from phase_kind or lease.phase_owner_id is distinct from owner) then
    raise exception 'nmls_review_session_conflict'; end if;
  if lease.phase_kind is null and lease.session_id is not null then raise exception 'nmls_teaching_legacy_lease_requires_reconciliation'; end if;
  if p_audit#>>'{review,kind}' is distinct from 'resume' then
    if p_expected_session_id::text is distinct from old_runtime->>'sessionId' or lease.phase_kind is distinct from phase_kind
      or lease.phase_owner_id is distinct from owner or lease.attempt_id is distinct from a.id
      or old_runtime->>'status'='active' and (not lease.phase_active or lease.session_id is distinct from p_expected_session_id) then raise exception 'nmls_review_session_conflict'; end if;
  end if;
  if p_runtime->>'courseKey' is distinct from phase->>'teachingCourseKey' or p_runtime->>'contentDigest' is distinct from p_teaching_digest
    or p_runtime->'revision' is distinct from to_jsonb(p_expected_runtime_revision+1) or p_runtime->'lastReceiptMs' is distinct from to_jsonb(p_evaluated_at_ms)
    or p_ledger->>'actorId' is distinct from p_student_id::text or p_ledger->>'policyId' is distinct from b.policy_id
    or p_ledger->'revision' is distinct from to_jsonb(p_expected_actor_revision+1) or p_ledger->'lastReceiptMs' is distinct from to_jsonb(p_evaluated_at_ms)
    or p_ledger->'creditIssuanceAllowed' is distinct from 'false'::jsonb or octet_length(p_runtime::text)>524288 or octet_length(p_ledger::text)>524288 then
    raise exception 'nmls_teaching_invalid_transition'; end if;
  select b0.* into pin from public.nmls_teaching_phase_bindings b0 where b0.student_id=p_student_id and b0.review_attempt_id=a.id and b0.phase_kind=p_phase->>'kind' and b0.phase_owner_id=owner;
  if found then
    if pin.phase_scope is distinct from phase or pin.teaching_digest is distinct from p_teaching_digest or pin.layout is distinct from p_layout then raise exception 'nmls_teaching_layout_changed'; end if;
  else
    if phase_kind='source' and a.revision<>0
      or phase_kind='remediation' and (w.revision<>1 or old_runtime->'revision' is distinct from '0'::jsonb) then raise exception 'nmls_teaching_history_requires_reconciliation'; end if;
    insert into public.nmls_teaching_phase_bindings values(p_student_id,a.id,phase_kind,owner,phase,p_teaching_digest,p_layout);
  end if;
  perform public.nmls_teaching_guard_progress(old_runtime,p_runtime,p_layout,p_outcome,p_audit,p_evaluated_at_ms);
  if phase_kind='remediation' and (
    (select jsonb_agg(m->'id' order by n) from jsonb_array_elements(p_layout) with ordinality x(m,n)) is distinct from w.manifest->'moduleIds'
    or (select jsonb_agg(u->'id' order by mn,un) from jsonb_array_elements(p_layout) with ordinality x(m,mn)
      cross join lateral jsonb_array_elements(m->'units') with ordinality y(u,un)) is distinct from w.manifest->'unitIds') then
    raise exception 'nmls_teaching_layout_changed'; end if;
  for prior in select value from jsonb_array_elements(old_ledger->'acceptances') loop
    if not coalesce((p_ledger->'acceptances') @> jsonb_build_array(prior),false) then raise exception 'nmls_review_invalid_rocs_receipt'; end if;
  end loop;
  for item in select value from jsonb_array_elements(p_ledger->'acceptances') loop
    if not (old_ledger->'acceptances') @> jsonb_build_array(item) then
      select * into receipt from public.nmls_review_rocs_presentations where id=(item->>'presentationId')::uuid;
      if not found or receipt.student_id is distinct from p_student_id or receipt.grant_id is distinct from g.id
        or receipt.document_digest is distinct from item->>'documentDigest'
        or item->>'actorId' is distinct from p_student_id::text or item->>'offeringId' is distinct from g.id::text
        or item->>'contentDigest' is distinct from a.content_digest or item->>'documentDigest' is distinct from b.offering#>>'{rocs,documentDigest}'
        or item->>'version' is distinct from b.offering#>>'{rocs,version}' or item->>'evidenceId' is distinct from b.offering#>>'{rocs,evidenceId}'
        or item->'presentedAtMs' is distinct from to_jsonb(receipt.presented_at_ms) or item->'acceptedAtMs' is distinct from to_jsonb(p_evaluated_at_ms)
        or receipt.presented_at_ms>p_evaluated_at_ms or item->>'retentionYears' is distinct from '5' then raise exception 'nmls_review_invalid_rocs_receipt'; end if;
    end if;
  end loop;
  if jsonb_typeof(p_outcome->'deliveryAllowed') is distinct from 'boolean' or p_outcome#>'{progress,creditIssuanceAllowed}' is distinct from 'false'::jsonb
    or p_outcome#>>'{progress,mode}' is distinct from 'non_credit_review' or p_outcome#>>'{progress,contentDigest}' is distinct from p_teaching_digest
    or p_outcome#>'{progress,revision}' is distinct from p_runtime->'revision' or p_outcome->'actorRevision' is distinct from p_ledger->'revision' then raise exception 'nmls_teaching_invalid_outcome'; end if;
  delivering:=p_outcome->'deliveryAllowed'='true'::jsonb;
  terminal:=p_runtime->>'status'='review_complete' and old_runtime->>'status'<>'review_complete';
  if not delivering and (p_delivery_until_ms is not null or p_outcome->'deliveryUntilMs' is distinct from 'null'::jsonb
    or p_outcome#>'{progress,lessons}' is distinct from '[]'::jsonb or p_outcome#>'{progress,quiz}' is distinct from 'null'::jsonb
    or p_outcome#>'{progress,feedback}' is distinct from 'null'::jsonb or p_outcome->'studyWindow' is distinct from 'null'::jsonb) then raise exception 'nmls_teaching_invalid_outcome'; end if;
  if p_evaluated_at_ms<opening_ms or p_evaluated_at_ms>=cutoff_ms then
    if p_ledger-array['revision','lastReceiptMs'] is distinct from old_ledger-array['revision','lastReceiptMs'] or delivering or terminal
      or p_audit#>>'{policy,code}' is distinct from (case when p_evaluated_at_ms<opening_ms then 'delivery_not_open' else 'delivery_window_closed' end)
      or p_runtime->'lastActivityMs' is distinct from old_runtime->'lastActivityMs'
      or p_runtime->>'status' is distinct from old_runtime->>'status' and p_runtime->>'status' is distinct from 'logged_out' then raise exception 'nmls_teaching_invalid_outside_window'; end if;
  end if;
  deadline_ms:=cutoff_ms;
  if delivering or terminal then
    if b.offering#>'{rocs,fullDocumentVerified}' is distinct from 'true'::jsonb
      or not exists(select 1 from jsonb_array_elements(p_ledger->'acceptances') x where x->>'offeringId'=g.id::text and x->>'contentDigest'=a.content_digest
        and x->>'documentDigest'=b.offering#>>'{rocs,documentDigest}' and x->>'version'=b.offering#>>'{rocs,version}')
      or p_ledger->>'sessionStartedAtMs' is null or p_ledger->'breakStartedAtMs' is distinct from 'null'::jsonb then raise exception 'nmls_teaching_invalid_delivery'; end if;
    deadline_ms:=least(deadline_ms,(p_ledger->>'sessionStartedAtMs')::bigint+43200000,(old_runtime->>'lastActivityMs')::bigint+360000);
    if delivering then
      if p_delivery_until_ms is null or p_delivery_until_ms<=p_evaluated_at_ms or p_delivery_until_ms>p_evaluated_at_ms+30000
        or p_outcome->'deliveryUntilMs' is distinct from to_jsonb(p_delivery_until_ms) or p_delivery_until_ms>cutoff_ms then raise exception 'nmls_teaching_invalid_delivery'; end if;
      deadline_ms:=least(cutoff_ms,p_delivery_until_ms,(p_ledger->>'sessionStartedAtMs')::bigint+43200000,(p_runtime->>'lastActivityMs')::bigint+360000);
    end if;
    if at_ms>=deadline_ms then raise exception 'nmls_review_clock_refresh_required'; end if;
  end if;
  perform public.nmls_teaching_guard_exposure(old_ledger,p_ledger,old_runtime,p_runtime,p_outcome,p_audit,b.offering,p_student_id,a.id,p_event_id,
    p_evaluated_at_ms,p_delivery_until_ms,phase,p_teaching_digest);
  source_next:=a.revision+case when phase_kind='source' then 1 else 0 end;
  workflow_next:=case when phase_kind='remediation' then w.revision+1 else null end;
  if phase_kind='source' then update public.nmls_review_attempts set runtime=p_runtime,revision=source_next,updated_at=clock_timestamp() where id=a.id;
  else update public.nmls_private_remediations set runtime=p_runtime,revision=workflow_next where first_final_id=owner; end if;
  insert into public.nmls_review_actor_policy(student_id,policy_id,policy_digest,revision,ledger) values(p_student_id,b.policy_id,b.policy_digest,p_expected_actor_revision+1,p_ledger)
    on conflict(student_id) do update set revision=excluded.revision,ledger=excluded.ledger,updated_at=clock_timestamp();
  -- Dormant ownership is deliberately retained. It does not grant delivery.
  new_lease:=to_jsonb(lease)||jsonb_build_object('attempt_id',a.id,'phase_kind',phase_kind,'phase_owner_id',owner,
    'phase_active',p_runtime->>'status'='active','session_id',coalesce(p_runtime->>'sessionId',lease.session_id::text));
  if new_lease->>'session_id' is null then raise exception 'nmls_teaching_resume_required'; end if;
  history_outcome:=jsonb_set(jsonb_set(jsonb_set(p_outcome,'{progress,lessons}','[]'),'{progress,quiz}','null'),'{progress,feedback}','null')
    ||jsonb_build_object('deliveryAllowed',false,'deliveryUntilMs',null,'studyWindow',null);
  insert into public.nmls_teaching_events(student_id,event_id,review_attempt_id,phase_kind,phase_owner_id,command_digest,actor_revision,source_revision,workflow_revision,runtime_revision,
    lease_before,lease_after,outcome,audit) values(p_student_id,p_event_id,a.id,phase_kind,owner,p_command_digest,p_expected_actor_revision+1,source_next,workflow_next,
    p_expected_runtime_revision+1,to_jsonb(lease),new_lease,history_outcome,p_audit);
  update public.nmls_review_study_leases set attempt_id=a.id,phase_kind=p_phase->>'kind',phase_owner_id=owner,
    session_id=(new_lease->>'session_id')::uuid,phase_active=(new_lease->>'phase_active')::boolean where student_id=p_student_id;
  at_ms:=floor(extract(epoch from clock_timestamp())*1000);
  if g.expires_at<=clock_timestamp() then raise exception 'nmls_review_access_denied'; end if;
  if at_ms-p_evaluated_at_ms>1000 or p_evaluated_at_ms>at_ms+1000
    or (at_ms<opening_ms) is distinct from (p_evaluated_at_ms<opening_ms) or (at_ms>=cutoff_ms) is distinct from (p_evaluated_at_ms>=cutoff_ms)
    or old_runtime->>'status'='active' and at_ms-(old_runtime->>'lastActivityMs')::bigint>=360000 and p_runtime->>'status' is distinct from 'logged_out'
    or (delivering or terminal) and at_ms>=deadline_ms then raise exception 'nmls_review_clock_refresh_required'; end if;
  return jsonb_build_object('duplicate',false,'outcome',p_outcome,'sourceRevision',source_next,'workflowRevision',workflow_next);
end $$;

revoke all on function public.nmls_teaching_canonical(jsonb),
  public.nmls_review_pre_joint_fence_internal(uuid,uuid,uuid,text,text),public.nmls_review_legacy_write_fence(uuid,uuid,uuid,text,text),
  public.nmls_teaching_guard_progress(jsonb,jsonb,jsonb,jsonb,jsonb,bigint),
  public.nmls_teaching_context(uuid,uuid,text,uuid),
  public.nmls_teaching_commit(uuid,uuid,uuid,text,jsonb,text,jsonb,bigint,bigint,bigint,bigint,uuid,bigint,jsonb,jsonb,jsonb,jsonb,jsonb,bigint)
  from public,anon,authenticated,service_role;
grant execute on function public.nmls_teaching_context(uuid,uuid,text,uuid),
  public.nmls_teaching_commit(uuid,uuid,uuid,text,jsonb,text,jsonb,bigint,bigint,bigint,bigint,uuid,bigint,jsonb,jsonb,jsonb,jsonb,jsonb,bigint) to service_role;
commit;
