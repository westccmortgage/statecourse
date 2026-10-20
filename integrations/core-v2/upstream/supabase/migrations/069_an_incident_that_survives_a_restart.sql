-- ═══════════════════════════════════════════════════════════════════════════
-- AN INCIDENT THAT SURVIVES A RESTART, AND A RECOVERY ONLY ONE WORKER RUNS
--
-- The runtime-incident domain could decide. It could not remember. Everything
-- it worked out — the cause, the operation, the authority, the fingerprint the
-- attempt started from — lived in one process, so a container that went away
-- took the decision with it and the next one started again from nothing. That
-- is the layer the domain's own commit said was missing.
--
-- Four tables and one rule each:
--
--   runtime_incidents               one per incident; its state machine
--   runtime_incident_recoveries     one per attempt; claimed under a fence
--   runtime_incident_verifications  one per postcondition actually evaluated
--   runtime_recovery_knowledge      what a proven recovery left behind
--
-- WHAT IS WRITTEN BEFORE ANY EXTERNAL ACTION, and frozen afterwards: the
-- authority, the operation, the preconditions that were proven, the evidence
-- fingerprint the attempt starts from, the cost classification, and the stages
-- the attempt is permitted to reach. A recovery that decided those things after
-- acting could justify anything it happened to do.
--
-- WHAT IS WRITTEN AFTER: what actually ran, the result, the fingerprint reached,
-- every verification with its own evidence, the provider-call delta, the
-- incremental spend, and the state the incident ended in.
--
-- Two workers cannot run one recovery: claiming is a compare-and-set that mints
-- a fence token, and every later write must present it. The guards below run for
-- every writer, service role included.
-- ═══════════════════════════════════════════════════════════════════════════

-- ═════════════════════════════════════════ 1 · the states, and the legal moves
--
-- Declared where every other machine's are, so one function answers for all of
-- them and nothing can invent a transition by writing a different table.

-- ADDITIVE, DELIBERATELY. The first draft of this migration redefined
-- `core_v2_transition_allowed` to add the incident's moves, and in doing so
-- dropped the `segment` machine's — because it was rewritten from a partial
-- reading of 058. The invariant suite caught it. A migration has no business
-- restating rules it did not come to change, so the incident gets its own
-- function and 058's stays exactly as it is.

create or replace function public.core_v2_incident_transition_allowed(
  p_from text, p_to text
) returns boolean language sql immutable as $$
  select exists (
    select 1 from (values
      -- Forward through the loop.
      ('detected','evidence_collected'),
      ('evidence_collected','diagnosed'),
      ('diagnosed','recovery_proposed'),
      ('recovery_proposed','recovery_authorized'),
      ('recovery_authorized','recovering'),
      ('recovering','verifying'),
      ('verifying','recovered'),
      -- The one move that is not forward: a verification that fails does not
      -- reach `recovered`. It goes back to be diagnosed again, and loop
      -- protection decides whether there is another bounded attempt.
      ('verifying','diagnosed'),
      -- Every state can reach an exit, because working out what went wrong can
      -- itself go wrong at any point.
      ('detected','awaiting_human'),
      ('detected','blocked'),
      ('detected','unrecoverable'),
      ('evidence_collected','awaiting_human'),
      ('evidence_collected','blocked'),
      ('evidence_collected','unknown_paid_outcome'),
      ('evidence_collected','engineering_defect'),
      ('evidence_collected','unrecoverable'),
      ('diagnosed','awaiting_human'),
      ('diagnosed','blocked'),
      ('diagnosed','unknown_paid_outcome'),
      ('diagnosed','engineering_defect'),
      ('diagnosed','unrecoverable'),
      ('recovery_proposed','awaiting_human'),
      ('recovery_proposed','blocked'),
      ('recovery_proposed','unrecoverable'),
      ('recovery_authorized','awaiting_human'),
      ('recovery_authorized','blocked'),
      ('recovering','awaiting_human'),
      ('recovering','blocked'),
      ('recovering','unknown_paid_outcome'),
      ('recovering','unrecoverable'),
      ('verifying','awaiting_human'),
      ('verifying','blocked'),
      ('verifying','unrecoverable')
    ) as t(from_state, to_state)
    where t.from_state = p_from and t.to_state = p_to
  );
$$;

comment on function public.core_v2_incident_transition_allowed(text, text) is
  'Every legal move of a runtime incident. Its own function: 058 owns the moves of the machines it declared, and this migration does not restate them.';

-- ═════════════════════════════════════════════════════════ 2 · the incident
--
-- The signature groups a class of failure; the evidence fingerprint identifies
-- the concrete state. Both are stored because loop protection needs the second
-- and recovery knowledge is keyed by the first. Neither holds a secret: the
-- domain computes them from facts, and a credential is not one.

create table if not exists public.runtime_incidents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  -- The workflow this incident is about, when it is about one. An incident can
  -- exist before a workflow does, so this is nullable and `set null`.
  workflow_id uuid references public.intelligence_workflows(id) on delete set null,

  application text not null check (application <> ''),
  incident_signature text not null check (incident_signature ~ '^[0-9a-f]{64}$'),
  evidence_fingerprint text not null check (evidence_fingerprint ~ '^[0-9a-f]{64}$'),

  state text not null default 'detected' check (state in (
    'detected','evidence_collected','diagnosed','recovery_proposed','recovery_authorized',
    'recovering','verifying','recovered',
    'awaiting_human','blocked','unknown_paid_outcome','engineering_defect','unrecoverable')),

  failing_stage text not null default '',
  exception_class text not null default '',
  error_code text not null default '',
  -- The facts as the adapter sent them. Evidence, not interpretation, and the
  -- door refuses a body that carries anything credential-shaped.
  facts jsonb not null default '{}'::jsonb,
  -- Which rule settled the cause, when one did. Null means no rule did, which
  -- is an answer: interpretation is needed.
  rule_id text,
  cause text not null default '',
  exit_reason text,

  policy_version text not null,
  engine_version text not null,
  detected_at timestamptz not null default now(),
  settled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A settled incident says why and when; one still working says neither.
  constraint runtime_incidents_settled_says_why check (
    (state in ('recovered','awaiting_human','blocked','unknown_paid_outcome','engineering_defect','unrecoverable'))
    = (settled_at is not null and exit_reason is not null))
);

comment on table public.runtime_incidents is
  'One production failure, as evidence with a state. The signature groups its class; the evidence fingerprint identifies the concrete state it was in. Holds no secret and no source bytes.';

create index if not exists runtime_incidents_by_signature on public.runtime_incidents(incident_signature, created_at desc);
create index if not exists runtime_incidents_open on public.runtime_incidents(organization_id, state)
  where state not in ('recovered','awaiting_human','blocked','unknown_paid_outcome','engineering_defect','unrecoverable');
create index if not exists runtime_incidents_by_workflow on public.runtime_incidents(workflow_id) where workflow_id is not null;

-- ══════════════════════════════════════════════════════ 3 · a recovery attempt
--
-- Everything above the line is written BEFORE the executor is called and never
-- moves again. Everything below it is written once, after.

create table if not exists public.runtime_incident_recoveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  incident_id uuid not null references public.runtime_incidents(id) on delete cascade,

  -- ── decided before anything external happens ─────────────────────────────
  operation_id text not null check (operation_id <> ''),
  authority text not null check (authority in ('automatic','human')),
  authorised_by_user_id uuid references auth.users(id),
  cost_class text not null check (cost_class in ('no_external_spend','within_prior_authority','requires_new_authority')),
  -- The preconditions that were proven at the moment of the decision, and the
  -- stages this attempt is permitted to reach. A boundary is not advice.
  preconditions_proven text[] not null default '{}',
  execution_boundary text[] not null default '{}',
  before_fingerprint text not null check (before_fingerprint ~ '^[0-9a-f]{64}$'),
  provider_calls_before integer not null check (provider_calls_before >= 0),
  spend_before numeric not null check (spend_before >= 0),

  -- ── the fence ────────────────────────────────────────────────────────────
  -- One worker runs one recovery. Claiming mints this; every later write must
  -- present it.
  state text not null default 'claimed' check (state in ('claimed','executed','verified','failed','abandoned')),
  fence_token uuid not null default gen_random_uuid(),
  claimed_by text not null check (claimed_by <> ''),
  claimed_at timestamptz not null default now(),
  lease_expires_at timestamptz not null,

  -- ── written once, after the executor returns ─────────────────────────────
  operation_performed text,
  after_fingerprint text check (after_fingerprint is null or after_fingerprint ~ '^[0-9a-f]{64}$'),
  provider_call_delta integer,
  incremental_spend numeric,
  recovered boolean,
  result_detail text,
  finished_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- An automatic recovery may not spend, and may not be authorised by a person
  -- (that would be a human decision wearing a machine's word).
  constraint runtime_recoveries_automatic_spends_nothing check (
    authority <> 'automatic' or (cost_class = 'no_external_spend' and authorised_by_user_id is null)),
  constraint runtime_recoveries_human_names_the_person check (
    authority <> 'human' or authorised_by_user_id is not null),
  -- A finished attempt has all of its after-facts, or none of them.
  constraint runtime_recoveries_finished_is_whole check (
    (state in ('verified','failed'))
    = (finished_at is not null and after_fingerprint is not null and provider_call_delta is not null
       and incremental_spend is not null and recovered is not null and operation_performed is not null)),
  constraint runtime_recoveries_verified_means_recovered check (state <> 'verified' or recovered is true),
  constraint runtime_recoveries_failed_means_not_recovered check (state <> 'failed' or recovered is false)
);

comment on table public.runtime_incident_recoveries is
  'One recovery attempt. The authority, operation, proven preconditions, starting fingerprint, cost class and execution boundary are written before anything external happens and never move; the result is written once, after. Claimed under a fence so two workers cannot run one recovery.';

-- The attempt identity loop protection is about: this situation, this
-- operation, from this exact evidence. At most one attempt may be live for it.
create unique index if not exists runtime_recoveries_one_live_attempt
  on public.runtime_incident_recoveries(incident_id, operation_id, before_fingerprint)
  where state in ('claimed','executed');

create index if not exists runtime_recoveries_by_incident on public.runtime_incident_recoveries(incident_id, created_at desc);

-- ═══════════════════════════════════════════ 4 · what each postcondition said
--
-- One row per postcondition actually evaluated, with what it looked at. A pass
-- that cannot be argued with later is not evidence of anything.

create table if not exists public.runtime_incident_verifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recovery_id uuid not null references public.runtime_incident_recoveries(id) on delete cascade,
  verifier_name text not null check (verifier_name <> ''),
  passed boolean not null,
  detail text not null default '',
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint runtime_verifications_one_verdict unique (recovery_id, verifier_name)
);

comment on table public.runtime_incident_verifications is
  'What each required postcondition was evaluated to be, and what it read to decide. One verdict per verifier per attempt: a check does not get to say two things.';

-- ═════════════════════════════════════════════════ 5 · what a proof left behind
--
-- Not memory. A row, written after a recovery was proven, that a later incident
-- may INGEST AS A SOURCE. It is isolated to its own signature and its own
-- operation, and it may only offer a precondition its own verification passed —
-- which is why `verified_preconditions` is checked against the verification
-- rows rather than trusted.

create table if not exists public.runtime_recovery_knowledge (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recovery_id uuid not null unique references public.runtime_incident_recoveries(id) on delete cascade,
  incident_signature text not null check (incident_signature ~ '^[0-9a-f]{64}$'),
  operation_id text not null check (operation_id <> ''),
  verified_preconditions text[] not null default '{}',
  before_fingerprint text not null,
  after_fingerprint text not null,
  outcome text not null check (outcome in ('recovered','failed')),
  provider_calls integer not null check (provider_calls >= 0),
  incremental_spend numeric not null,
  policy_version text not null,
  engine_version text not null,
  created_at timestamptz not null default now()
);

comment on table public.runtime_recovery_knowledge is
  'A recovery that was proven to work, kept so a later incident of the same class can ingest it as a source. It is never an authority: it may contribute only a precondition its own verification rows recorded as passing, for the same signature, operation, policy version and engine version.';

create index if not exists runtime_knowledge_by_signature
  on public.runtime_recovery_knowledge(incident_signature, operation_id) where outcome = 'recovered';

-- ══════════════════════════════════════════════════════════════ 6 · the guards
--
-- Application code is one refactor from forgetting any of this.

create or replace function public.core_v2_guard_runtime_incident() returns trigger
language plpgsql as $$
declare moved text;
begin
  if new.state is distinct from old.state
     and not public.core_v2_incident_transition_allowed(old.state, new.state) then
    raise exception 'core_v2: a runtime incident cannot go from % to %', old.state, new.state
      using errcode = 'check_violation';
  end if;
  -- What the incident IS does not change. Its signature is what makes it this
  -- incident; the application, the failing stage and the versions are what the
  -- signature was computed from. Only the state, the diagnosis, the current
  -- fingerprint and the settlement move.
  moved := public.core_v2_frozen_except(to_jsonb(old), to_jsonb(new), array[
    'state','rule_id','cause','exit_reason','evidence_fingerprint','settled_at','updated_at','facts','workflow_id']);
  if moved is not null then
    raise exception 'core_v2: runtime incident % is settled in % and cannot be rewritten', old.id, moved
      using errcode = 'check_violation';
  end if;
  -- An incident that has reached an exit is done being an incident.
  if old.settled_at is not null and new.state is distinct from old.state then
    raise exception 'core_v2: runtime incident % already settled as %', old.id, old.state
      using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists runtime_incidents_guard on public.runtime_incidents;
create trigger runtime_incidents_guard before update on public.runtime_incidents
  for each row execute function public.core_v2_guard_runtime_incident();

create or replace function public.core_v2_guard_runtime_recovery() returns trigger
language plpgsql as $$
declare moved text;
begin
  -- THE DECISION IS FROZEN. Everything the authority rested on was written
  -- before the executor was called, and a recovery that could rewrite it
  -- afterwards could justify whatever it happened to do.
  moved := public.core_v2_frozen_except(to_jsonb(old), to_jsonb(new), array[
    'state','operation_performed','after_fingerprint','provider_call_delta','incremental_spend',
    'recovered','result_detail','finished_at','lease_expires_at','updated_at']);
  if moved is not null then
    raise exception 'core_v2: recovery % decided % before it acted; that cannot be rewritten after', old.id, moved
      using errcode = 'check_violation';
  end if;
  -- A finished attempt is finished.
  if old.state in ('verified','failed','abandoned') and new.state is distinct from old.state then
    raise exception 'core_v2: recovery % is already %', old.id, old.state using errcode = 'check_violation';
  end if;
  -- The operation performed is the operation authorised. A different one is not
  -- a recovery of this incident, whatever it achieved.
  if new.operation_performed is not null and new.operation_performed <> old.operation_id then
    raise exception 'core_v2: recovery % authorised % but performed %', old.id, old.operation_id, new.operation_performed
      using errcode = 'check_violation';
  end if;
  -- A no-spend recovery that spent is not a no-spend recovery.
  if old.cost_class = 'no_external_spend' and coalesce(new.incremental_spend, 0) > 0 then
    raise exception 'core_v2: recovery % promised no external spend and settled %', old.id, new.incremental_spend
      using errcode = 'check_violation';
  end if;
  if old.cost_class = 'no_external_spend' and coalesce(new.provider_call_delta, 0) > 0 then
    raise exception 'core_v2: recovery % promised no provider call and made %', old.id, new.provider_call_delta
      using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists runtime_recoveries_guard on public.runtime_incident_recoveries;
create trigger runtime_recoveries_guard before update on public.runtime_incident_recoveries
  for each row execute function public.core_v2_guard_runtime_recovery();

-- A verdict is not edited. It is what the check said at the time.
create or replace function public.core_v2_guard_runtime_verification() returns trigger
language plpgsql as $$
begin
  raise exception 'core_v2: a verification result is never edited (recovery %, %)', old.recovery_id, old.verifier_name
    using errcode = 'check_violation';
end $$;

drop trigger if exists runtime_verifications_guard on public.runtime_incident_verifications;
create trigger runtime_verifications_guard before update on public.runtime_incident_verifications
  for each row execute function public.core_v2_guard_runtime_verification();

-- Knowledge is written from a proven recovery and never touched again.
create or replace function public.core_v2_guard_runtime_knowledge() returns trigger
language plpgsql as $$
begin
  raise exception 'core_v2: recovery knowledge is written once, from a proven recovery (%)', old.id
    using errcode = 'check_violation';
end $$;

drop trigger if exists runtime_knowledge_guard on public.runtime_recovery_knowledge;
create trigger runtime_knowledge_guard before update on public.runtime_recovery_knowledge
  for each row execute function public.core_v2_guard_runtime_knowledge();

-- ════════════════════════════════════════════════════════════ 7 · the moves
--
-- Every one is a compare-and-set against the state the caller believed. A move
-- made from a stale reading fails rather than overwriting somebody else's.

create or replace function public.core_v2_incident_transition(
  p_incident_id uuid, p_to_state text, p_from text default null,
  p_exit_reason text default null, p_rule_id text default null, p_cause text default null,
  p_evidence_fingerprint text default null
) returns public.runtime_incidents language plpgsql security definer set search_path = public as $$
declare row public.runtime_incidents; actual text;
begin
  update public.runtime_incidents i
     set state = p_to_state,
         rule_id = coalesce(p_rule_id, i.rule_id),
         cause = coalesce(p_cause, i.cause),
         exit_reason = coalesce(p_exit_reason, i.exit_reason),
         evidence_fingerprint = coalesce(p_evidence_fingerprint, i.evidence_fingerprint),
         settled_at = case when p_to_state in ('recovered','awaiting_human','blocked','unknown_paid_outcome',
                                               'engineering_defect','unrecoverable')
                           then now() else i.settled_at end
   where i.id = p_incident_id and (p_from is null or i.state = p_from)
  returning * into row;
  if not found then
    select i.state into actual from public.runtime_incidents i where i.id = p_incident_id;
    if actual is null then raise exception 'core_v2: no runtime incident %', p_incident_id; end if;
    raise exception 'core_v2: runtime incident % is %, not % — the move was made from a stale reading',
      p_incident_id, actual, p_from using errcode = 'check_violation';
  end if;
  return row;
end $$;

comment on function public.core_v2_incident_transition(uuid, text, text, text, text, text, text) is
  'Moves an incident, only from the state the caller believed it was in. The settlement timestamp is set by this function, never by a caller.';

-- CLAIMING A RECOVERY. The unique index does the arguing: a second worker
-- attempting the same operation from the same evidence collides and is told so
-- rather than running it as well. Everything the authority rests on is written
-- here, in this statement, before the executor exists.
create or replace function public.core_v2_claim_recovery(
  p_incident_id uuid, p_organization_id uuid, p_operation_id text, p_authority text,
  p_cost_class text, p_preconditions text[], p_boundary text[], p_before_fingerprint text,
  p_provider_calls_before integer, p_spend_before numeric,
  p_claimed_by text, p_ttl_ms integer, p_authorised_by_user_id uuid default null
) returns public.runtime_incident_recoveries language plpgsql security definer set search_path = public as $$
declare row public.runtime_incident_recoveries; live uuid;
begin
  -- A stale claim that nobody finished is released rather than blocking the
  -- work forever; a live one is not.
  update public.runtime_incident_recoveries r
     set state = 'abandoned'
   where r.incident_id = p_incident_id and r.state in ('claimed','executed') and r.lease_expires_at < now();

  insert into public.runtime_incident_recoveries (
    organization_id, incident_id, operation_id, authority, authorised_by_user_id, cost_class,
    preconditions_proven, execution_boundary, before_fingerprint,
    provider_calls_before, spend_before, claimed_by, lease_expires_at)
  values (
    p_organization_id, p_incident_id, p_operation_id, p_authority, p_authorised_by_user_id, p_cost_class,
    coalesce(p_preconditions, '{}'), coalesce(p_boundary, '{}'), p_before_fingerprint,
    p_provider_calls_before, p_spend_before, p_claimed_by,
    now() + make_interval(secs => p_ttl_ms / 1000.0))
  on conflict do nothing
  returning * into row;

  if row.id is null then
    select r.id into live from public.runtime_incident_recoveries r
     where r.incident_id = p_incident_id and r.operation_id = p_operation_id
       and r.before_fingerprint = p_before_fingerprint and r.state in ('claimed','executed');
    raise exception 'core_v2: recovery % of incident % from this evidence is already held (%)',
      p_operation_id, p_incident_id, live using errcode = 'check_violation';
  end if;
  return row;
end $$;

comment on function public.core_v2_claim_recovery(uuid, uuid, text, text, text, text[], text[], text, integer, numeric, text, integer, uuid) is
  'Claims one recovery attempt under a fence, writing everything the authority rests on before any external action. A second worker attempting the same operation from the same evidence is refused, not allowed to run it too.';

-- SETTLING ONE. The fence must be presented, the result is written once, and
-- the guards above refuse a settlement that contradicts what was authorised.
create or replace function public.core_v2_settle_recovery(
  p_recovery_id uuid, p_fence_token uuid, p_operation_performed text, p_after_fingerprint text,
  p_provider_call_delta integer, p_incremental_spend numeric, p_recovered boolean, p_detail text default ''
) returns public.runtime_incident_recoveries language plpgsql security definer set search_path = public as $$
declare row public.runtime_incident_recoveries;
begin
  update public.runtime_incident_recoveries r
     set state = case when p_recovered then 'verified' else 'failed' end,
         operation_performed = p_operation_performed,
         after_fingerprint = p_after_fingerprint,
         provider_call_delta = p_provider_call_delta,
         incremental_spend = p_incremental_spend,
         recovered = p_recovered,
         result_detail = p_detail,
         finished_at = now()
   where r.id = p_recovery_id and r.fence_token = p_fence_token and r.state in ('claimed','executed')
  returning * into row;
  if not found then
    raise exception 'core_v2: recovery % cannot be settled — wrong fence, or it is already finished', p_recovery_id
      using errcode = 'check_violation';
  end if;
  return row;
end $$;

comment on function public.core_v2_settle_recovery(uuid, uuid, text, text, integer, numeric, boolean, text) is
  'Writes a recovery''s result once, against its fence token. A caller without the token, or one settling a finished attempt, is refused.';

-- Knowledge is written FROM a verified recovery, and only from one. The
-- preconditions it may offer are exactly those its own verifications passed.
create or replace function public.core_v2_record_recovery_knowledge(
  p_recovery_id uuid, p_incident_signature text, p_policy_version text, p_engine_version text
) returns public.runtime_recovery_knowledge language plpgsql security definer set search_path = public as $$
declare row public.runtime_recovery_knowledge; rec public.runtime_incident_recoveries; proven text[];
begin
  select * into rec from public.runtime_incident_recoveries where id = p_recovery_id;
  if rec.id is null then raise exception 'core_v2: no recovery %', p_recovery_id; end if;
  if rec.state <> 'verified' or rec.recovered is not true then
    raise exception 'core_v2: recovery % is %, so it proved nothing to remember', p_recovery_id, rec.state
      using errcode = 'check_violation';
  end if;
  -- Only what its own verifications actually passed, intersected with what it
  -- claimed. Naming a precondition is not establishing it.
  select coalesce(array_agg(v.verifier_name), '{}') into proven
    from public.runtime_incident_verifications v
   where v.recovery_id = p_recovery_id and v.passed
     and v.verifier_name = any(rec.preconditions_proven);

  insert into public.runtime_recovery_knowledge (
    organization_id, recovery_id, incident_signature, operation_id, verified_preconditions,
    before_fingerprint, after_fingerprint, outcome, provider_calls, incremental_spend,
    policy_version, engine_version)
  values (
    rec.organization_id, rec.id, p_incident_signature, rec.operation_id, proven,
    rec.before_fingerprint, rec.after_fingerprint, 'recovered',
    coalesce(rec.provider_call_delta, 0), coalesce(rec.incremental_spend, 0),
    p_policy_version, p_engine_version)
  returning * into row;
  return row;
end $$;

comment on function public.core_v2_record_recovery_knowledge(uuid, text, text, text) is
  'Writes what a proven recovery left behind. Refuses an attempt that was not verified, and records only the preconditions its own verification rows passed.';

-- ══════════════════════════════════════════════════════════════ 8 · who may read
--
-- The engine's own tables: the service role works here and nobody else does.

alter table public.runtime_incidents enable row level security;
alter table public.runtime_incident_recoveries enable row level security;
alter table public.runtime_incident_verifications enable row level security;
alter table public.runtime_recovery_knowledge enable row level security;

revoke all on public.runtime_incidents from public, anon, authenticated;
revoke all on public.runtime_incident_recoveries from public, anon, authenticated;
revoke all on public.runtime_incident_verifications from public, anon, authenticated;
revoke all on public.runtime_recovery_knowledge from public, anon, authenticated;
grant select, insert, update on public.runtime_incidents to service_role;
grant select, insert, update on public.runtime_incident_recoveries to service_role;
grant select, insert on public.runtime_incident_verifications to service_role;
grant select, insert on public.runtime_recovery_knowledge to service_role;
