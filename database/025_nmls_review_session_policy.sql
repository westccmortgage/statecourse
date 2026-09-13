-- PRIVATE NON-CREDIT REVIEW ONLY. Apply after NMLS 023/024; no live application here.
-- Opt-in bindings are immutable and must precede an attempt. Existing unbound
-- grants retain their old behavior. No default/fictional ROCS or offering seed.
begin;

create table public.nmls_review_policy_bindings (
  grant_id uuid primary key references public.nmls_review_access_grants(id),
  policy_id text not null,
  policy_digest text not null check (policy_digest ~ '^[a-f0-9]{64}$'),
  offering jsonb not null check (jsonb_typeof(offering) = 'object'),
  created_at timestamptz not null default clock_timestamp()
);
create table public.nmls_review_actor_policy (
  student_id uuid primary key references public.students(id),
  policy_id text not null,
  policy_digest text not null check (policy_digest ~ '^[a-f0-9]{64}$'),
  revision bigint not null check (revision >= 0),
  ledger jsonb not null check (
    jsonb_typeof(ledger) = 'object'
    and ledger->>'actorId' is not distinct from student_id::text
    and ledger->>'policyId' is not distinct from policy_id
    and (ledger->>'revision')::bigint is not distinct from revision
    and ledger->'creditIssuanceAllowed' is not distinct from 'false'::jsonb
  ),
  updated_at timestamptz not null default clock_timestamp()
);
create table public.nmls_review_rocs_presentations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  grant_id uuid not null references public.nmls_review_policy_bindings(grant_id),
  document_digest text not null check (document_digest ~ '^[a-f0-9]{64}$'),
  presented_at_ms bigint not null,
  receipt jsonb not null check (jsonb_typeof(receipt) = 'object')
);
create table public.nmls_review_actor_policy_events (
  student_id uuid not null references public.students(id),
  event_id uuid not null,
  attempt_id uuid not null references public.nmls_review_attempts(id),
  command_digest text not null check (command_digest ~ '^[a-f0-9]{64}$'),
  policy_digest text not null,
  previous_revision bigint not null,
  resulting_revision bigint not null check (resulting_revision = previous_revision + 1),
  attempt_revision bigint not null,
  outcome jsonb not null check (jsonb_typeof(outcome) = 'object'),
  audit jsonb not null check (jsonb_typeof(audit) = 'object'),
  recorded_at timestamptz not null default clock_timestamp(),
  primary key(student_id, event_id),
  unique(student_id, resulting_revision)
);
alter table public.nmls_review_policy_bindings enable row level security;
alter table public.nmls_review_actor_policy enable row level security;
alter table public.nmls_review_rocs_presentations enable row level security;
alter table public.nmls_review_actor_policy_events enable row level security;
revoke all on public.nmls_review_policy_bindings, public.nmls_review_actor_policy,
  public.nmls_review_rocs_presentations, public.nmls_review_actor_policy_events
  from public, anon, authenticated, service_role;

-- Preserve 023 byte history; hide the original implementations from PostgREST
-- service calls too. Wrappers close the old start/context/commit delivery bypass.
alter function public.nmls_review_start(uuid,uuid,text,text,jsonb) rename to nmls_review_start_legacy_internal;
alter function public.nmls_review_context(uuid,uuid) rename to nmls_review_context_legacy_internal;
alter function public.nmls_review_commit(uuid,uuid,uuid,text,bigint,uuid,bigint,text,jsonb,jsonb,jsonb)
  rename to nmls_review_commit_legacy_internal;
revoke all on function public.nmls_review_start_legacy_internal(uuid,uuid,text,text,jsonb),
  public.nmls_review_context_legacy_internal(uuid,uuid),
  public.nmls_review_commit_legacy_internal(uuid,uuid,uuid,text,bigint,uuid,bigint,text,jsonb,jsonb,jsonb)
  from public, anon, authenticated, service_role;

create function public.nmls_review_start(p_student_id uuid,p_grant_id uuid,p_course_key text,p_content_digest text,p_initial_runtime jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants;
begin
  -- UPDATE from the outset: the internal start takes UPDATE, never upgrade SHARE.
  select * into g from public.nmls_review_access_grants where id=p_grant_id for update;
  if not found or g.student_id is distinct from p_student_id or g.status<>'active' or g.expires_at<=clock_timestamp() then
    raise exception 'nmls_review_access_denied';
  end if;
  if exists(select 1 from public.nmls_review_policy_bindings where grant_id=p_grant_id) then
    raise exception 'nmls_review_policy_flow_required';
  end if;
  return public.nmls_review_start_legacy_internal(p_student_id,p_grant_id,p_course_key,p_content_digest,p_initial_runtime);
end $$;
create function public.nmls_review_context(p_student_id uuid,p_attempt_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants;
begin
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a on a.grant_id=g0.id
    where a.id=p_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status<>'active' or g.expires_at<=clock_timestamp() then
    raise exception 'nmls_review_access_denied';
  end if;
  if exists(select 1 from public.nmls_review_policy_bindings where grant_id=g.id) then
    raise exception 'nmls_review_policy_flow_required';
  end if;
  return public.nmls_review_context_legacy_internal(p_student_id,p_attempt_id);
end $$;
create function public.nmls_review_commit(p_student_id uuid,p_attempt_id uuid,p_event_id uuid,p_command_digest text,
  p_expected_revision bigint,p_expected_session_id uuid,p_evaluated_at_ms bigint,p_content_digest text,
  p_runtime jsonb,p_outcome jsonb,p_audit jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants;
begin
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a on a.grant_id=g0.id
    where a.id=p_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status<>'active' or g.expires_at<=clock_timestamp() then
    raise exception 'nmls_review_access_denied';
  end if;
  if exists(select 1 from public.nmls_review_policy_bindings where grant_id=g.id) then
    raise exception 'nmls_review_policy_flow_required';
  end if;
  return public.nmls_review_commit_legacy_internal(p_student_id,p_attempt_id,p_event_id,p_command_digest,
    p_expected_revision,p_expected_session_id,p_evaluated_at_ms,p_content_digest,p_runtime,p_outcome,p_audit);
end $$;
create or replace function public.nmls_review_list(p_student_id uuid)
returns jsonb language sql security definer set search_path=pg_catalog,public as $$
  select coalesce(jsonb_agg(jsonb_build_object('grantId',g.id,'courseKey',g.course_key,'contentDigest',g.content_digest,
    'expiresAt',g.expires_at,'status',coalesce(a.runtime->>'status','not_started')) order by g.created_at desc,g.id),'[]'::jsonb)
  from public.nmls_review_access_grants g left join public.nmls_review_attempts a on a.grant_id=g.id and a.student_id=p_student_id
  where g.student_id=p_student_id and g.status='active' and g.access_mode='non_credit_review' and g.expires_at>clock_timestamp()
    and not exists(select 1 from public.nmls_review_policy_bindings b where b.grant_id=g.id);
$$;

-- Called only by trusted provisioning after full document/window validation.
create function public.nmls_policy_bind(p_student_id uuid,p_grant_id uuid,p_policy_id text,p_policy_digest text,p_offering jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants; b public.nmls_review_policy_bindings;
begin
  select * into g from public.nmls_review_access_grants where id=p_grant_id for update;
  if not found or g.student_id is distinct from p_student_id or g.status<>'active' or g.expires_at<=clock_timestamp() then
    raise exception 'nmls_review_access_denied';
  end if;
  select * into b from public.nmls_review_policy_bindings where grant_id=g.id;
  if found then
    if b.policy_id is distinct from p_policy_id or b.policy_digest is distinct from p_policy_digest or b.offering is distinct from p_offering then
      raise exception 'nmls_review_binding_conflict';
    end if;
    return to_jsonb(b);
  end if;
  if exists(select 1 from public.nmls_review_attempts where grant_id=g.id) then raise exception 'nmls_review_binding_conflict'; end if;
  if p_policy_id is null or length(p_policy_id) not between 1 and 160
    or p_offering->>'id' is distinct from g.id::text or p_offering->>'contentDigest' is distinct from g.content_digest
    or p_offering->>'educationType' is distinct from 'annual_ce'
    or p_offering->>'timeZone' is null or p_offering->>'deadlineBasisId' is null
    or (p_offering->>'year')::int is null or (p_offering->>'year')::int not between 2026 and 2100
    or (p_offering->>'opensAtMs')::bigint is null or (p_offering->>'closesAtMs')::bigint is null
    or (p_offering->>'closesAtMs')::bigint <= (p_offering->>'opensAtMs')::bigint
    or p_offering#>>'{rocs,version}' is distinct from '4'
    or p_offering#>'{rocs,fullDocumentVerified}' is distinct from 'true'::jsonb
    or p_offering#>>'{rocs,documentDigest}' is null or not (p_offering#>>'{rocs,documentDigest}' ~ '^[a-f0-9]{64}$')
    or p_offering#>>'{rocs,evidenceId}' is null then raise exception 'nmls_review_invalid_binding'; end if;
  insert into public.nmls_review_policy_bindings(grant_id,policy_id,policy_digest,offering)
    values(g.id,p_policy_id,p_policy_digest,p_offering) returning * into b;
  return to_jsonb(b);
end $$;

create function public.nmls_policy_start(p_student_id uuid,p_grant_id uuid,p_course_key text,p_content_digest text,p_initial_runtime jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare result jsonb; g public.nmls_review_access_grants;
begin
  select * into g from public.nmls_review_access_grants where id=p_grant_id for update;
  if not found or g.student_id is distinct from p_student_id or g.status<>'active' or g.expires_at<=clock_timestamp() then
    raise exception 'nmls_review_access_denied';
  end if;
  if not exists(select 1 from public.nmls_review_policy_bindings where grant_id=p_grant_id) then
    raise exception 'nmls_review_policy_binding_required';
  end if;
  result := public.nmls_review_start_legacy_internal(p_student_id,p_grant_id,p_course_key,p_content_digest,p_initial_runtime);
  -- Server-only raw context. No lesson text or implicit session acquisition.
  return result;
end $$;

create function public.nmls_policy_context(p_student_id uuid,p_attempt_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare result jsonb; b public.nmls_review_policy_bindings; l public.nmls_review_actor_policy;
begin
  result := public.nmls_review_context_legacy_internal(p_student_id,p_attempt_id);
  select * into b from public.nmls_review_policy_bindings where grant_id=(result#>>'{attempt,grant_id}')::uuid;
  if not found then raise exception 'nmls_review_policy_binding_required'; end if;
  select * into l from public.nmls_review_actor_policy where student_id=p_student_id;
  if found and (l.policy_id<>b.policy_id or l.policy_digest<>b.policy_digest) then raise exception 'nmls_review_policy_version_conflict'; end if;
  return result || jsonb_build_object('binding',to_jsonb(b),'actorPolicy',case when l.student_id is null then null else to_jsonb(l) end,
    'serverTimeMs',floor(extract(epoch from clock_timestamp())*1000));
end $$;

-- Not browser-callable. The future LMS document renderer must first verify the
-- complete archived bytes and render them; this RPC is not that renderer.
create function public.nmls_policy_present_rocs(p_student_id uuid,p_attempt_id uuid,p_document_digest text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare ctx jsonb; g public.nmls_review_access_grants; offering jsonb; receipt jsonb;
  receipt_id uuid:=gen_random_uuid(); at_ms bigint;
begin
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a on a.grant_id=g0.id
    where a.id=p_attempt_id for share of g0;
  ctx:=public.nmls_policy_context(p_student_id,p_attempt_id);
  offering:=ctx#>'{binding,offering}'; at_ms:=floor(extract(epoch from clock_timestamp())*1000);
  if p_document_digest is distinct from offering#>>'{rocs,documentDigest}' or at_ms<(offering->>'opensAtMs')::bigint
    or at_ms>=(offering->>'closesAtMs')::bigint or g.expires_at<=clock_timestamp() then
    raise exception 'nmls_review_rocs_presentation_denied';
  end if;
  receipt:=jsonb_build_object('id',receipt_id,'actorId',p_student_id,'offeringId',offering->>'id',
    'contentDigest',offering->>'contentDigest','documentDigest',p_document_digest,'presentedAtMs',at_ms);
  insert into public.nmls_review_rocs_presentations(id,student_id,grant_id,document_digest,presented_at_ms,receipt)
    values(receipt_id,p_student_id,g.id,p_document_digest,at_ms,receipt);
  return receipt;
end $$;

create function public.nmls_policy_commit(
  p_student_id uuid,p_attempt_id uuid,p_event_id uuid,p_command_digest text,
  p_expected_revision bigint,p_expected_actor_revision bigint,p_expected_session_id uuid,
  p_evaluated_at_ms bigint,p_policy_digest text,p_content_digest text,
  p_initial_ledger jsonb,p_ledger jsonb,p_runtime jsonb,p_outcome jsonb,p_audit jsonb,
  p_delivery_until_ms bigint
) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare g public.nmls_review_access_grants; b public.nmls_review_policy_bindings;
  a public.nmls_review_attempts; l public.nmls_review_actor_policy; e public.nmls_review_actor_policy_events;
  lease public.nmls_review_study_leases; item jsonb; prior jsonb; receipt public.nmls_review_rocs_presentations;
  at_ms bigint; deadline_ms bigint; result jsonb; delivering boolean;
  opening_ms bigint; cutoff_ms bigint; rolling_ms bigint;
begin
  -- All writers: grant -> actor lease -> actor ledger -> target attempt.
  select g0.* into g from public.nmls_review_access_grants g0 join public.nmls_review_attempts a0 on a0.grant_id=g0.id
    where a0.id=p_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status<>'active' or g.expires_at<=clock_timestamp() then
    raise exception 'nmls_review_access_denied';
  end if;
  select * into b from public.nmls_review_policy_bindings where grant_id=g.id;
  if not found then raise exception 'nmls_review_policy_binding_required'; end if;
  if b.policy_digest is distinct from p_policy_digest then raise exception 'nmls_review_policy_version_conflict'; end if;
  insert into public.nmls_review_study_leases(student_id) values(p_student_id) on conflict do nothing;
  select * into lease from public.nmls_review_study_leases where student_id=p_student_id for update;
  select * into l from public.nmls_review_actor_policy where student_id=p_student_id for update;
  if not found then
    if p_expected_actor_revision is distinct from 0 or p_initial_ledger->>'actorId' is distinct from p_student_id::text
      or p_initial_ledger->>'policyId' is distinct from b.policy_id or p_initial_ledger->>'revision' is distinct from '0'
      or p_initial_ledger->>'lastReceiptMs' is distinct from '0'
      or p_initial_ledger->>'studySinceBreakMs' is distinct from '0'
      or p_initial_ledger->'studyIntervals' is distinct from '[]'::jsonb
      or p_initial_ledger->'acceptances' is distinct from '[]'::jsonb
      or p_initial_ledger->'sessionStartedAtMs' is distinct from 'null'::jsonb
      or p_initial_ledger->'lastStudyAtMs' is distinct from 'null'::jsonb
      or p_initial_ledger->'studyBoundaryAtMs' is distinct from 'null'::jsonb
      or p_initial_ledger->'breakStartedAtMs' is distinct from 'null'::jsonb then raise exception 'nmls_review_invalid_policy_state'; end if;
    insert into public.nmls_review_actor_policy(student_id,policy_id,policy_digest,revision,ledger)
      values(p_student_id,b.policy_id,b.policy_digest,0,p_initial_ledger) returning * into l;
  end if;
  select * into a from public.nmls_review_attempts where id=p_attempt_id for update;
  at_ms:=floor(extract(epoch from clock_timestamp())*1000);
  if a.student_id is distinct from p_student_id or g.expires_at<=clock_timestamp() then raise exception 'nmls_review_access_denied'; end if;
  if a.content_digest is distinct from p_content_digest or g.content_digest<>a.content_digest or g.course_key<>a.course_key
    or b.offering->>'contentDigest' is distinct from a.content_digest then raise exception 'nmls_review_content_changed'; end if;
  if l.policy_id<>b.policy_id or l.policy_digest<>b.policy_digest then raise exception 'nmls_review_policy_version_conflict'; end if;
  select * into e from public.nmls_review_actor_policy_events where student_id=p_student_id and event_id=p_event_id;
  if found then
    if e.command_digest is distinct from p_command_digest or e.attempt_id is distinct from a.id or e.policy_digest<>b.policy_digest then
      raise exception 'nmls_review_idempotency_conflict';
    end if;
    return jsonb_build_object('duplicate',true,'outcome',e.outcome);
  end if;
  if l.revision is distinct from p_expected_actor_revision or a.revision is distinct from p_expected_revision then
    raise exception 'nmls_review_revision_conflict';
  end if;
  if p_ledger->>'actorId' is distinct from p_student_id::text or p_ledger->>'policyId' is distinct from b.policy_id
    or (p_ledger->>'revision')::bigint is distinct from l.revision+1
    or p_ledger->'creditIssuanceAllowed' is distinct from 'false'::jsonb
    or (p_ledger->>'lastReceiptMs')::bigint is distinct from p_evaluated_at_ms
    or jsonb_typeof(p_ledger->'acceptances') is distinct from 'array'
    or jsonb_typeof(p_ledger->'studyIntervals') is distinct from 'array'
    or jsonb_typeof(p_ledger->'studySinceBreakMs') is distinct from 'number'
    or (p_ledger->>'studySinceBreakMs')::bigint<0
    or octet_length(p_ledger::text)>524288 then raise exception 'nmls_review_invalid_policy_state'; end if;
  -- Acceptances are append-only and must match a durable actor/offering-bound
  -- presentation. No caller-supplied presentation object establishes evidence.
  for prior in select value from jsonb_array_elements(l.ledger->'acceptances') loop
    if not p_ledger->'acceptances' @> jsonb_build_array(prior) then raise exception 'nmls_review_invalid_rocs_receipt'; end if;
  end loop;
  for item in select value from jsonb_array_elements(p_ledger->'acceptances') loop
    if not l.ledger->'acceptances' @> jsonb_build_array(item) then
      select * into receipt from public.nmls_review_rocs_presentations where id=(item->>'presentationId')::uuid;
      if not found or receipt.student_id is distinct from p_student_id or receipt.grant_id is distinct from g.id
        or item->>'actorId' is distinct from p_student_id::text or item->>'offeringId' is distinct from g.id::text
        or item->>'contentDigest' is distinct from a.content_digest
        or item->>'documentDigest' is distinct from b.offering#>>'{rocs,documentDigest}'
        or item->>'version' is distinct from b.offering#>>'{rocs,version}'
        or item->>'evidenceId' is distinct from b.offering#>>'{rocs,evidenceId}'
        or (item->>'presentedAtMs')::bigint is distinct from receipt.presented_at_ms
        or (item->>'acceptedAtMs')::bigint is distinct from p_evaluated_at_ms
        or receipt.presented_at_ms>p_evaluated_at_ms or item->>'retentionYears' is distinct from '5' then
        raise exception 'nmls_review_invalid_rocs_receipt';
      end if;
    end if;
  end loop;
  -- Server-only adapter explicitly declares delivery. A denied policy can save
  -- refusal + idle cleanup, but cannot progress, grade, or expose cached lessons.
  if jsonb_typeof(p_outcome->'deliveryAllowed') is distinct from 'boolean' then raise exception 'nmls_review_invalid_policy_state'; end if;
  if p_outcome#>'{progress,creditIssuanceAllowed}' is distinct from 'false'::jsonb
    or p_outcome#>>'{progress,mode}' is distinct from 'non_credit_review'
    or p_outcome#>>'{progress,contentDigest}' is distinct from a.content_digest
    or (p_outcome#>>'{progress,revision}')::bigint is distinct from a.revision+1
    or (p_outcome->>'actorRevision')::bigint is distinct from l.revision+1 then raise exception 'nmls_review_invalid_policy_state'; end if;
  delivering:=p_outcome->'deliveryAllowed'='true'::jsonb;
  cutoff_ms:=(b.offering->>'closesAtMs')::bigint; opening_ms:=(b.offering->>'opensAtMs')::bigint;
  deadline_ms:=cutoff_ms;
  -- Every domain command, including ROCS/breaks, is subject to the annual
  -- window. Only a genuine freshly evaluated outside-window refusal can save
  -- clock/revision + review cleanup there, never a new acceptance/session/reset.
  if p_evaluated_at_ms<opening_ms or p_evaluated_at_ms>=cutoff_ms then
    if p_ledger-'revision'-'lastReceiptMs' is distinct from l.ledger-'revision'-'lastReceiptMs'
      or p_audit#>>'{policy,code}' is distinct from (case when p_evaluated_at_ms<opening_ms then 'delivery_not_open' else 'delivery_window_closed' end)
      or delivering then raise exception 'nmls_review_invalid_policy_state'; end if;
    if (p_runtime->>'status' is distinct from a.runtime->>'status' and p_runtime->>'status' is distinct from 'logged_out')
      or (p_runtime->'sessionId' is distinct from a.runtime->'sessionId' and p_runtime->'sessionId' is distinct from 'null'::jsonb)
      or p_runtime->'lastActivityMs' is distinct from a.runtime->'lastActivityMs' then raise exception 'nmls_review_invalid_delivery'; end if;
  end if;
  if (at_ms<opening_ms) is distinct from (p_evaluated_at_ms<opening_ms)
    or (at_ms>=cutoff_ms) is distinct from (p_evaluated_at_ms>=cutoff_ms) then raise exception 'nmls_review_clock_refresh_required'; end if;
  if delivering then
    select coalesce(sum(greatest(0,least((x->>'end')::bigint,p_evaluated_at_ms)
      -greatest((x->>'start')::bigint,p_evaluated_at_ms-86400000))),0) into rolling_ms
      from jsonb_array_elements(p_ledger->'studyIntervals') x;
    if p_delivery_until_ms is null or p_delivery_until_ms<=p_evaluated_at_ms or p_delivery_until_ms>p_evaluated_at_ms+30000
      or (p_outcome->>'deliveryUntilMs')::bigint is distinct from p_delivery_until_ms
      or p_delivery_until_ms>deadline_ms or p_ledger->>'sessionStartedAtMs' is null
      or p_delivery_until_ms>(p_ledger->>'sessionStartedAtMs')::bigint+43200000
      or p_delivery_until_ms>p_evaluated_at_ms+12000000-(p_ledger->>'studySinceBreakMs')::bigint
      or p_delivery_until_ms>p_evaluated_at_ms+36000000-rolling_ms
      or p_ledger->'breakStartedAtMs' is distinct from 'null'::jsonb
      or (p_ledger->>'studySinceBreakMs')::bigint>=12000000
      or not exists(select 1 from jsonb_array_elements(p_ledger->'acceptances') x
        where x->>'offeringId'=g.id::text and x->>'contentDigest'=a.content_digest
          and x->>'documentDigest'=b.offering#>>'{rocs,documentDigest}') then raise exception 'nmls_review_invalid_delivery'; end if;
    deadline_ms:=least(deadline_ms,p_delivery_until_ms,(p_ledger->>'sessionStartedAtMs')::bigint+43200000);
    if at_ms<(b.offering->>'opensAtMs')::bigint or at_ms>=deadline_ms then raise exception 'nmls_review_clock_refresh_required'; end if;
  else
    if p_delivery_until_ms is not null or p_runtime->'completedUnitIds' is distinct from a.runtime->'completedUnitIds'
      or p_runtime->'passedModuleIds' is distinct from a.runtime->'passedModuleIds'
      or p_runtime->'completedReviewMs' is distinct from a.runtime->'completedReviewMs'
      or p_runtime->>'status'='review_complete' and a.runtime->>'status' is distinct from 'review_complete'
      or p_runtime->'current' is distinct from a.runtime->'current' and p_runtime->'current' is distinct from 'null'::jsonb
      or p_runtime->'quiz' is distinct from a.runtime->'quiz' and p_runtime->'quiz' is distinct from 'null'::jsonb
      or p_runtime->'feedback' is distinct from a.runtime->'feedback' and p_runtime->'feedback' is distinct from 'null'::jsonb
      or p_outcome#>'{progress,lessons}' is distinct from '[]'::jsonb
      or p_outcome#>'{progress,quiz}' is distinct from 'null'::jsonb
      or p_outcome#>'{progress,feedback}' is distinct from 'null'::jsonb then raise exception 'nmls_review_invalid_delivery'; end if;
  end if;
  -- Non-study policy commands use the same lease check as study; initial ROCS
  -- still needs an explicit resume first. Resume rotates only attempt lease,
  -- never the actor usage ledger. Internal RPC persists six-minute invalidation.
  result:=public.nmls_review_commit_legacy_internal(p_student_id,p_attempt_id,p_event_id,p_command_digest,
    p_expected_revision,p_expected_session_id,p_evaluated_at_ms,p_content_digest,p_runtime,p_outcome,p_audit->'review');
  update public.nmls_review_actor_policy set ledger=p_ledger,revision=l.revision+1,updated_at=clock_timestamp() where student_id=p_student_id;
  insert into public.nmls_review_actor_policy_events(student_id,event_id,attempt_id,command_digest,policy_digest,
    previous_revision,resulting_revision,attempt_revision,outcome,audit)
    values(p_student_id,p_event_id,a.id,p_command_digest,b.policy_digest,l.revision,l.revision+1,a.revision+1,p_outcome,p_audit);
  -- Final clock sample includes SQL work/trigger delays. Exception rolls back
  -- BOTH ledgers, lease and BOTH audits. Refreshed refusal can then persist.
  at_ms:=floor(extract(epoch from clock_timestamp())*1000);
  if g.expires_at<=clock_timestamp() then raise exception 'nmls_review_access_denied'; end if;
  if p_evaluated_at_ms is null or at_ms-p_evaluated_at_ms>1000 or p_evaluated_at_ms>at_ms+1000
    or (at_ms<opening_ms) is distinct from (p_evaluated_at_ms<opening_ms)
    or (at_ms>=cutoff_ms) is distinct from (p_evaluated_at_ms>=cutoff_ms)
    or (a.runtime->>'status'='active' and at_ms-(a.runtime->>'lastActivityMs')::bigint>=360000
      and p_runtime->>'status' is distinct from 'logged_out')
    or delivering and at_ms>=deadline_ms then raise exception 'nmls_review_clock_refresh_required'; end if;
  return result;
end $$;

create function public.nmls_policy_read_presentation(p_student_id uuid,p_attempt_id uuid,p_presentation_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare ctx jsonb; r public.nmls_review_rocs_presentations;
begin
  ctx:=public.nmls_policy_context(p_student_id,p_attempt_id);
  select * into r from public.nmls_review_rocs_presentations where id=p_presentation_id;
  if not found or r.student_id is distinct from p_student_id or r.grant_id is distinct from (ctx#>>'{attempt,grant_id}')::uuid
    or r.document_digest is distinct from ctx#>>'{binding,offering,rocs,documentDigest}' then
    raise exception 'nmls_review_rocs_presentation_denied';
  end if;
  return r.receipt;
end $$;

revoke all on function public.nmls_review_start(uuid,uuid,text,text,jsonb),public.nmls_review_context(uuid,uuid),
  public.nmls_review_commit(uuid,uuid,uuid,text,bigint,uuid,bigint,text,jsonb,jsonb,jsonb),
  public.nmls_policy_bind(uuid,uuid,text,text,jsonb),public.nmls_policy_start(uuid,uuid,text,text,jsonb),
  public.nmls_policy_context(uuid,uuid),public.nmls_policy_present_rocs(uuid,uuid,text),
  public.nmls_policy_read_presentation(uuid,uuid,uuid),
  public.nmls_policy_commit(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,bigint)
  from public,anon,authenticated,service_role;
grant execute on function public.nmls_review_start(uuid,uuid,text,text,jsonb),public.nmls_review_context(uuid,uuid),
  public.nmls_review_commit(uuid,uuid,uuid,text,bigint,uuid,bigint,text,jsonb,jsonb,jsonb),
  public.nmls_policy_bind(uuid,uuid,text,text,jsonb),public.nmls_policy_start(uuid,uuid,text,text,jsonb),
  public.nmls_policy_context(uuid,uuid),public.nmls_policy_present_rocs(uuid,uuid,text),
  public.nmls_policy_read_presentation(uuid,uuid,uuid),
  public.nmls_policy_commit(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,bigint)
  to service_role;
commit;
