-- Additive, PRIVATE REVIEW ONLY. Not applied by this migration to a live database.
-- 019 is reserved by the separate administration-console workstream.
-- No course approval, payment, enrollment, completion, certificate or banking
-- record can be created through these tables/functions.
begin;

create table public.nmls_review_access_grants (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  course_key text not null check (length(course_key) between 1 and 160),
  content_digest text not null check (content_digest ~ '^[a-f0-9]{64}$'),
  access_mode text not null default 'non_credit_review' check (access_mode = 'non_credit_review'),
  status text not null default 'active' check (status in ('active', 'revoked')),
  expires_at timestamptz not null,
  granted_by uuid not null references public.students(id),
  evidence text not null check (length(btrim(evidence)) between 5 and 2000),
  created_at timestamptz not null default now()
);

create table public.nmls_review_attempts (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid not null unique references public.nmls_review_access_grants(id),
  student_id uuid not null references public.students(id),
  course_key text not null,
  content_digest text not null check (content_digest ~ '^[a-f0-9]{64}$'),
  revision bigint not null default 0 check (revision >= 0),
  runtime jsonb not null check (
    jsonb_typeof(runtime) = 'object'
    and (runtime->>'mode' is not distinct from 'non_credit_review')
    and (runtime->'creditIssuanceAllowed' is not distinct from 'false'::jsonb)
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nmls_review_study_leases (
  student_id uuid primary key references public.students(id),
  attempt_id uuid references public.nmls_review_attempts(id),
  session_id uuid,
  check ((attempt_id is null) = (session_id is null))
);

create table public.nmls_review_attempt_events (
  attempt_id uuid not null references public.nmls_review_attempts(id),
  event_id uuid not null,
  command_digest text not null check (command_digest ~ '^[a-f0-9]{64}$'),
  previous_revision bigint not null,
  resulting_revision bigint not null check (resulting_revision = previous_revision + 1),
  outcome jsonb not null check (jsonb_typeof(outcome) = 'object'),
  audit jsonb not null check (jsonb_typeof(audit) = 'object'),
  recorded_at timestamptz not null default now(),
  primary key (attempt_id, event_id),
  unique (attempt_id, resulting_revision)
);

create index nmls_review_grants_student on public.nmls_review_access_grants(student_id);
create index nmls_review_attempts_student on public.nmls_review_attempts(student_id);

alter table public.nmls_review_access_grants enable row level security;
alter table public.nmls_review_attempts enable row level security;
alter table public.nmls_review_attempt_events enable row level security;
alter table public.nmls_review_study_leases enable row level security;
revoke all on public.nmls_review_access_grants, public.nmls_review_attempts,
  public.nmls_review_attempt_events, public.nmls_review_study_leases from public, anon, authenticated;
-- Staff provisioning is a distinct server operation; no browser role is granted.
grant select, insert, update on public.nmls_review_access_grants to service_role;

create function public.nmls_review_start(
  p_student_id uuid, p_grant_id uuid, p_course_key text,
  p_content_digest text, p_initial_runtime jsonb
) returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare g public.nmls_review_access_grants; a public.nmls_review_attempts;
begin
  select * into g from public.nmls_review_access_grants where id = p_grant_id for update;
  if not found or g.student_id is distinct from p_student_id or g.status <> 'active' or g.expires_at <= clock_timestamp() then
    raise exception 'nmls_review_access_denied';
  end if;
  if g.course_key is distinct from p_course_key or g.content_digest is distinct from p_content_digest then
    raise exception 'nmls_review_content_changed';
  end if;
  if p_initial_runtime->>'mode' is distinct from 'non_credit_review'
    or p_initial_runtime->'creditIssuanceAllowed' is distinct from 'false'::jsonb
    or p_initial_runtime->>'courseKey' is distinct from p_course_key
    or p_initial_runtime->>'contentDigest' is distinct from p_content_digest then
    raise exception 'nmls_review_invalid_state';
  end if;
  insert into public.nmls_review_attempts(grant_id, student_id, course_key, content_digest, runtime)
    values(g.id, g.student_id, g.course_key, g.content_digest, p_initial_runtime)
    on conflict (grant_id) do nothing;
  select * into a from public.nmls_review_attempts where grant_id = g.id;
  -- Ordinary start is idempotent, not an implicit takeover/reset of a live tab.
  return jsonb_build_object('attempt', to_jsonb(a), 'serverTimeMs', floor(extract(epoch from clock_timestamp()) * 1000));
end $$;

create function public.nmls_review_context(p_student_id uuid, p_attempt_id uuid)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare a public.nmls_review_attempts; g public.nmls_review_access_grants;
begin
  select * into a from public.nmls_review_attempts where id = p_attempt_id;
  if not found or a.student_id is distinct from p_student_id then raise exception 'nmls_review_access_denied'; end if;
  select * into g from public.nmls_review_access_grants where id = a.grant_id;
  if g.student_id is distinct from p_student_id or g.status <> 'active' or g.expires_at <= clock_timestamp() then
    raise exception 'nmls_review_access_denied';
  end if;
  if g.content_digest <> a.content_digest or g.course_key <> a.course_key then
    raise exception 'nmls_review_content_changed';
  end if;
  return jsonb_build_object('attempt', to_jsonb(a), 'serverTimeMs', floor(extract(epoch from clock_timestamp()) * 1000));
end $$;

create function public.nmls_review_commit(
  p_student_id uuid, p_attempt_id uuid, p_event_id uuid, p_command_digest text,
  p_expected_revision bigint, p_expected_session_id uuid, p_evaluated_at_ms bigint,
  p_content_digest text, p_runtime jsonb,
  p_outcome jsonb, p_audit jsonb
) returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare a public.nmls_review_attempts; g public.nmls_review_access_grants;
  e public.nmls_review_attempt_events; lease public.nmls_review_study_leases; at_ms bigint;
begin
  -- Grant first matches start's lock order, and serializes revocation/expiry checks.
  select g0.* into g from public.nmls_review_access_grants g0
    join public.nmls_review_attempts a0 on a0.grant_id = g0.id
    where a0.id = p_attempt_id for share of g0;
  if not found or g.student_id is distinct from p_student_id or g.status <> 'active' or g.expires_at <= clock_timestamp() then
    raise exception 'nmls_review_access_denied';
  end if;
  insert into public.nmls_review_study_leases(student_id) values(p_student_id) on conflict do nothing;
  select * into lease from public.nmls_review_study_leases where student_id = p_student_id for update;
  select * into a from public.nmls_review_attempts where id = p_attempt_id for update;
  -- Re-evaluate wall time AFTER waits for the actor lease and attempt lock.
  at_ms := floor(extract(epoch from clock_timestamp()) * 1000);
  if a.student_id is distinct from p_student_id or g.expires_at <= clock_timestamp() then raise exception 'nmls_review_access_denied'; end if;
  if a.content_digest is distinct from p_content_digest or g.content_digest <> a.content_digest or g.course_key <> a.course_key then
    raise exception 'nmls_review_content_changed';
  end if;
  select * into e from public.nmls_review_attempt_events where attempt_id = a.id and event_id = p_event_id;
  if found then
    if e.command_digest is distinct from p_command_digest then raise exception 'nmls_review_idempotency_conflict'; end if;
    return jsonb_build_object('duplicate', true, 'outcome', e.outcome);
  end if;
  if a.revision is distinct from p_expected_revision then raise exception 'nmls_review_revision_conflict'; end if;
  if p_audit->>'kind' is distinct from 'resume' and (
    a.runtime->>'sessionId' is distinct from p_expected_session_id::text
    or lease.attempt_id is distinct from a.id
    or lease.session_id is distinct from p_expected_session_id
  ) then raise exception 'nmls_review_session_conflict'; end if;
  if p_evaluated_at_ms is null or p_evaluated_at_ms > at_ms + 1000 or at_ms - p_evaluated_at_ms > 1000
    or (a.runtime->>'status' = 'active'
      and at_ms - (a.runtime->>'lastActivityMs')::bigint >= 360000
      and p_runtime->>'status' is distinct from 'logged_out') then
    raise exception 'nmls_review_clock_refresh_required';
  end if;
  if p_runtime->>'mode' is distinct from 'non_credit_review'
    or p_runtime->'creditIssuanceAllowed' is distinct from 'false'::jsonb
    or p_runtime->>'courseKey' is distinct from a.course_key
    or p_runtime->>'contentDigest' is distinct from a.content_digest
    or (p_runtime->>'revision')::bigint is distinct from a.revision + 1
    or octet_length(p_runtime::text) > 524288 then
    raise exception 'nmls_review_invalid_state';
  end if;
  update public.nmls_review_attempts set runtime = p_runtime, revision = revision + 1,
    updated_at = clock_timestamp() where id = a.id;
  if p_audit->>'kind' = 'resume' and p_runtime->>'status' = 'active' then
    update public.nmls_review_study_leases set attempt_id = a.id,
      session_id = (p_runtime->>'sessionId')::uuid where student_id = p_student_id;
  elsif p_runtime->>'status' <> 'active' and lease.attempt_id = a.id then
    update public.nmls_review_study_leases set attempt_id = null, session_id = null where student_id = p_student_id;
  end if;
  insert into public.nmls_review_attempt_events(attempt_id, event_id, command_digest,
    previous_revision, resulting_revision, outcome, audit)
    values(a.id, p_event_id, p_command_digest, a.revision, a.revision + 1, p_outcome, p_audit);
  -- An expiry/rejected command may carry a persisted logout transition. Return
  -- its tagged outcome normally; raising here would roll the transition back.
  return jsonb_build_object('duplicate', false, 'outcome', p_outcome);
end $$;

revoke all on function public.nmls_review_start(uuid, uuid, text, text, jsonb),
  public.nmls_review_context(uuid, uuid),
  public.nmls_review_commit(uuid, uuid, uuid, text, bigint, uuid, bigint, text, jsonb, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.nmls_review_start(uuid, uuid, text, text, jsonb),
  public.nmls_review_context(uuid, uuid),
  public.nmls_review_commit(uuid, uuid, uuid, text, bigint, uuid, bigint, text, jsonb, jsonb, jsonb)
  to service_role;
commit;
