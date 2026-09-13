-- PRIVATE first-final history only. Forward migration for local review/testing.
-- Do not apply live or expose as a learner endpoint. Policy-bound attempts are
-- deliberately refused until final exposure and actor policy commit together.
-- No grants, study time, approvals, enrollment, certificates or credit created.
begin;

create table public.nmls_private_finals (
  id uuid primary key,
  review_attempt_id uuid not null unique references public.nmls_review_attempts(id),
  student_id uuid not null references public.students(id),
  course_key text not null,
  content_digest text not null check (content_digest ~ '^[a-f0-9]{64}$'),
  definition_digest text not null check (definition_digest ~ '^[a-f0-9]{64}$'),
  revision bigint not null check (revision in (1,2)),
  selection jsonb not null check (jsonb_typeof(selection) = 'object'),
  answers jsonb,
  result jsonb,
  remediation_manifest jsonb,
  issued_at timestamptz not null default clock_timestamp(),
  submitted_at timestamptz,
  -- Regranting the same course cannot silently reset its first final. Version
  -- changes and overlapping core/comprehensive histories still need integration.
  unique(student_id, course_key),
  check ((revision = 1 and answers is null and result is null and submitted_at is null and remediation_manifest is null)
    or (revision = 2 and jsonb_typeof(answers) is not distinct from 'object' and jsonb_typeof(result) is not distinct from 'object'
      and submitted_at is not null
      and result->'creditIssuanceAllowed' is not distinct from 'false'::jsonb
      and result->'courseCompletionIssued' is not distinct from 'false'::jsonb
      and result->'assignedCreditSeconds' is not distinct from '0'::jsonb))
);

create table public.nmls_private_final_events (
  student_id uuid not null references public.students(id),
  event_id uuid not null,
  final_id uuid not null references public.nmls_private_finals(id),
  command_digest text not null check (command_digest ~ '^[a-f0-9]{64}$'),
  resulting_revision bigint not null check (resulting_revision in (1,2)),
  outcome jsonb not null check (jsonb_typeof(outcome) = 'object'),
  recorded_at timestamptz not null default clock_timestamp(),
  primary key(student_id, event_id),
  unique(final_id, resulting_revision)
);

alter table public.nmls_private_finals enable row level security;
alter table public.nmls_private_final_events enable row level security;
revoke all on public.nmls_private_finals, public.nmls_private_final_events from public, anon, authenticated, service_role;

create function public.nmls_private_final_immutable() returns trigger
language plpgsql set search_path = pg_catalog, public as $$
begin
  if tg_op = 'DELETE' or old.revision <> 1 or new.revision <> 2
    or (to_jsonb(new) - array['revision','answers','result','remediation_manifest','submitted_at'])
      is distinct from (to_jsonb(old) - array['revision','answers','result','remediation_manifest','submitted_at']) then
    raise exception 'nmls_final_immutable';
  end if;
  return new;
end $$;
create trigger nmls_private_final_immutable before update or delete on public.nmls_private_finals
  for each row execute function public.nmls_private_final_immutable();

create function public.nmls_private_final_event_immutable() returns trigger
language plpgsql set search_path = pg_catalog, public as $$
begin
  raise exception 'nmls_final_event_immutable';
end $$;
create trigger nmls_private_final_event_immutable before update or delete on public.nmls_private_final_events
  for each row execute function public.nmls_private_final_event_immutable();

-- Only the server's authenticated student ID is accepted here; SQL service_role
-- is trusted infrastructure, never a browser credential. Context is PRIVATE.
create function public.nmls_private_final_context(p_student_id uuid, p_review_attempt_id uuid, p_event_id uuid)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare c jsonb; a public.nmls_review_attempts; f public.nmls_private_finals; e public.nmls_private_final_events;
begin
  c := public.nmls_review_context(p_student_id, p_review_attempt_id);
  select * into a from public.nmls_review_attempts where id = p_review_attempt_id;
  if exists(select 1 from public.nmls_review_policy_bindings where grant_id = a.grant_id) then
    raise exception 'nmls_final_policy_integration_required';
  end if;
  select * into f from public.nmls_private_finals where student_id = p_student_id and course_key = a.course_key;
  if found and f.review_attempt_id <> a.id then raise exception 'nmls_final_history_scope_conflict'; end if;
  select * into e from public.nmls_private_final_events where student_id = p_student_id and event_id = p_event_id;
  -- A concurrent issue may commit between the final and event reads. Resolve
  -- event/form scope only under commit's locks, not from this advisory snapshot.
  return c || jsonb_build_object('final', case when f.id is null then null else to_jsonb(f) end,
    'event', case when e.event_id is null then null else to_jsonb(e) end);
end $$;

create function public.nmls_private_final_commit(
  p_student_id uuid, p_review_attempt_id uuid, p_event_id uuid, p_command_digest text,
  p_kind text, p_expected_review_revision bigint, p_expected_final_revision bigint,
  p_evaluated_at_ms bigint, p_content_digest text, p_definition_digest text,
  p_final_id uuid, p_selection jsonb, p_answers jsonb, p_result jsonb, p_remediation_manifest jsonb
) returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare a public.nmls_review_attempts; g public.nmls_review_access_grants;
  f public.nmls_private_finals; e public.nmls_private_final_events;
  outcome jsonb; at_ms bigint; has_final boolean;
begin
  -- Matches grant -> actor lease -> review lock ordering used by 023/025.
  select g0.* into g from public.nmls_review_access_grants g0
    join public.nmls_review_attempts a0 on a0.grant_id = g0.id
    where a0.id = p_review_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status <> 'active' or g.expires_at <= clock_timestamp() then
    raise exception 'nmls_final_access_denied';
  end if;
  insert into public.nmls_review_study_leases(student_id) values(p_student_id) on conflict do nothing;
  perform 1 from public.nmls_review_study_leases where student_id = p_student_id for update;
  select * into a from public.nmls_review_attempts where id = p_review_attempt_id for update;
  at_ms := floor(extract(epoch from clock_timestamp()) * 1000);
  if a.student_id is distinct from p_student_id or g.expires_at <= clock_timestamp() then raise exception 'nmls_final_access_denied'; end if;
  if exists(select 1 from public.nmls_review_policy_bindings where grant_id = g.id) then
    raise exception 'nmls_final_policy_integration_required';
  end if;
  if a.course_key is distinct from g.course_key or a.content_digest is distinct from g.content_digest
    or a.content_digest is distinct from p_content_digest then raise exception 'nmls_final_content_changed'; end if;
  select * into f from public.nmls_private_finals where student_id = p_student_id and course_key = a.course_key for update;
  has_final := found;
  if has_final and (f.review_attempt_id <> a.id or f.content_digest <> a.content_digest
    or f.definition_digest is distinct from p_definition_digest) then raise exception 'nmls_final_history_scope_conflict'; end if;
  -- Retry before CAS, but AFTER current authority/scope checks. No reevaluation
  -- or second grade is needed. Event IDs are actor-wide, not reusable per form.
  select * into e from public.nmls_private_final_events where student_id = p_student_id and event_id = p_event_id;
  if found then
    if e.command_digest is distinct from p_command_digest or e.final_id is distinct from f.id then
      raise exception 'nmls_final_idempotency_conflict';
    end if;
    return jsonb_build_object('duplicate', true, 'outcome', e.outcome);
  end if;
  if p_event_id is null or p_command_digest is null or p_command_digest !~ '^[a-f0-9]{64}$'
    or p_definition_digest is null or p_definition_digest !~ '^[a-f0-9]{64}$' then raise exception 'nmls_final_invalid_command'; end if;
  if a.revision is distinct from p_expected_review_revision or coalesce(f.revision,0) is distinct from p_expected_final_revision then
    raise exception 'nmls_final_revision_conflict';
  end if;
  if a.runtime->>'status' is distinct from 'review_complete' or a.runtime->>'mode' is distinct from 'non_credit_review'
    or a.runtime->'creditIssuanceAllowed' is distinct from 'false'::jsonb
    or a.runtime->>'courseKey' is distinct from a.course_key or a.runtime->>'contentDigest' is distinct from a.content_digest
    or coalesce(a.runtime->'current','null'::jsonb) <> 'null'::jsonb or coalesce(a.runtime->'quiz','null'::jsonb) <> 'null'::jsonb then
    raise exception 'nmls_final_review_prerequisites';
  end if;
  if p_evaluated_at_ms is null or p_evaluated_at_ms > at_ms + 1000 or at_ms - p_evaluated_at_ms > 1000 then
    raise exception 'nmls_final_clock_refresh_required';
  end if;
  -- Local 2026 authoring scope, not a regulatory offering deadline or late CE.
  if clock_timestamp() < timestamptz '2026-01-01 00:00:00+00' or clock_timestamp() >= timestamptz '2027-01-01 00:00:00+00' then
    raise exception 'nmls_final_authoring_year_closed';
  end if;
  if p_kind = 'issue' then
    if has_final then raise exception 'nmls_final_already_issued'; end if;
    if p_final_id is null or p_selection->>'schema' is distinct from 'statecourse-nmls-draft-final-attempt-v1'
      or p_selection->>'id' is distinct from p_final_id::text or p_selection->>'reviewAttemptId' is distinct from a.id::text
      or p_selection->>'definitionDigest' is distinct from p_definition_digest or p_selection->'number' is distinct from '1'::jsonb
      or jsonb_typeof(p_selection->'questionIds') is distinct from 'array' or jsonb_typeof(p_selection->'optionOrder') is distinct from 'object'
      or p_answers is not null or p_result is not null or p_remediation_manifest is not null then raise exception 'nmls_final_invalid_selection'; end if;
    if jsonb_array_length(p_selection->'questionIds') <> 25
      or (select count(distinct value) from jsonb_array_elements_text(p_selection->'questionIds')) <> 25
      or (select count(*) from jsonb_object_keys(p_selection->'optionOrder')) <> 25
      or exists(select 1 from jsonb_array_elements_text(p_selection->'questionIds') q
        where q.value !~ '^N26-FIN-[FENG][0-9]{2}$' or jsonb_typeof(p_selection->'optionOrder'->q.value) is distinct from 'array') then
      raise exception 'nmls_final_invalid_selection';
    end if;
    if exists(select 1 from jsonb_each(p_selection->'optionOrder') o where
      jsonb_array_length(o.value) <> 4 or (select array_agg(v.value order by v.value) from jsonb_array_elements_text(o.value) v)
      is distinct from array['A','B','C','D']) then raise exception 'nmls_final_invalid_selection'; end if;
    insert into public.nmls_private_finals(id,review_attempt_id,student_id,course_key,content_digest,definition_digest,revision,selection)
      values(p_final_id,a.id,p_student_id,a.course_key,a.content_digest,p_definition_digest,1,p_selection) returning * into f;
    outcome := jsonb_build_object('code','private_final_issued','finalAttemptId',f.id,'revision',f.revision);
  elsif p_kind = 'submit' then
    if not has_final or f.id is distinct from p_final_id then raise exception 'nmls_final_attempt_scope'; end if;
    if f.revision <> 1 then raise exception 'nmls_final_already_submitted'; end if;
    if p_selection is not null or jsonb_typeof(p_answers) is distinct from 'object' or jsonb_typeof(p_result) is distinct from 'object' then
      raise exception 'nmls_final_invalid_submission'; end if;
    if (select count(*) from jsonb_object_keys(p_answers)) <> 25
      or exists(select 1 from jsonb_each_text(p_answers) x where x.value is null or x.value not in ('A','B','C','D')
        or not (f.selection->'questionIds' ? x.key)) then raise exception 'nmls_final_invalid_answers'; end if;
    if p_result->>'mode' is distinct from 'private_authoring_review'
      or p_result->'total' is distinct from '25'::jsonb or p_result->'requiredCorrect' is distinct from '18'::jsonb
      or p_result->'creditIssuanceAllowed' is distinct from 'false'::jsonb
      or p_result->'courseCompletionIssued' is distinct from 'false'::jsonb
      or p_result->'assignedCreditSeconds' is distinct from '0'::jsonb
      or coalesce(p_result->>'correct','') !~ '^([0-9]|1[0-9]|2[0-5])$' then raise exception 'nmls_final_invalid_result'; end if;
    if p_result->'passed' is distinct from to_jsonb((p_result->>'correct')::int >= 18)
      or p_result->'percent' is distinct from to_jsonb((p_result->>'correct')::int * 4)
      or p_result->>'disposition' is distinct from (case when (p_result->>'correct')::int >= 18 then 'draft_final_passed' else 'remediation_required' end) then
      raise exception 'nmls_final_invalid_result'; end if;
    if p_result->'passed' = 'true'::jsonb then
      if p_remediation_manifest is not null then raise exception 'nmls_final_invalid_remediation'; end if;
    elsif jsonb_typeof(p_remediation_manifest) is distinct from 'object'
      or p_remediation_manifest->>'finalAttemptId' is distinct from f.id::text
      or p_remediation_manifest->>'reviewAttemptId' is distinct from a.id::text
      or p_remediation_manifest->>'sourceCourseKey' is distinct from a.course_key
      or p_remediation_manifest->>'sourceContentDigest' is distinct from a.content_digest
      or p_remediation_manifest->>'definitionDigest' is distinct from f.definition_digest
      or coalesce(p_remediation_manifest->>'contentDigest','') !~ '^[a-f0-9]{64}$'
      or p_remediation_manifest->>'courseKey' is distinct from (a.course_key || '-remediation-' || f.id::text)
      or p_remediation_manifest->'retakeEnabled' is distinct from 'false'::jsonb
      or p_remediation_manifest->'completed' is distinct from 'false'::jsonb then raise exception 'nmls_final_invalid_remediation';
    end if;
    update public.nmls_private_finals set revision=2,answers=p_answers,result=p_result,
      remediation_manifest=p_remediation_manifest,submitted_at=clock_timestamp() where id=f.id returning * into f;
    outcome := jsonb_build_object('code','private_final_submitted','finalAttemptId',f.id,'revision',f.revision,
      'result',f.result,'remediation',f.remediation_manifest);
  else raise exception 'nmls_final_invalid_command'; end if;
  outcome := outcome || jsonb_build_object('mode','private_authoring_review','studentDeliveryEnabled',false,
    'creditIssuanceAllowed',false,'retakeEnabled',false);
  insert into public.nmls_private_final_events(student_id,event_id,final_id,command_digest,resulting_revision,outcome)
    values(p_student_id,p_event_id,f.id,p_command_digest,f.revision,outcome);
  -- Check boundaries AFTER writes too; an exception rolls back row + event.
  if g.expires_at <= clock_timestamp() then raise exception 'nmls_final_access_denied'; end if;
  if clock_timestamp() >= timestamptz '2027-01-01 00:00:00+00' then raise exception 'nmls_final_authoring_year_closed'; end if;
  return jsonb_build_object('duplicate',false,'outcome',outcome);
end $$;

revoke all on function public.nmls_private_final_immutable(),
  public.nmls_private_final_event_immutable(),
  public.nmls_private_final_context(uuid,uuid,uuid),
  public.nmls_private_final_commit(uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,text,uuid,jsonb,jsonb,jsonb,jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.nmls_private_final_context(uuid,uuid,uuid),
  public.nmls_private_final_commit(uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,text,uuid,jsonb,jsonb,jsonb,jsonb) to service_role;
commit;
