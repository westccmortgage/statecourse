-- ═══════════════════════════════════════════════════════════════════════════
-- DELIVERED IS A FACT THE DATABASE REFUSES TO INVENT
--
-- 069 made an incident survive a restart. The thing an incident is in service
-- of did not: the Completion Owner worked out its resting state in one process
-- and nothing wrote it down, so a container that went away took "this task is
-- finished" with it — and the next one had no way to tell a delivered task from
-- an abandoned one except by doing the work again.
--
-- One table, and one rule that matters. A row may carry state 'DELIVERED' only
-- when every requirement of delivery is present IN THE ROW:
--
--   the required outcome is stated
--   the artifact exists and its digest is recorded
--   that digest is the one the decision was made about
--   the delivery was read back from where it was delivered to
--   an INDEPENDENT verifier said so, not the executor that did the work
--   no required acceptance gate is failing, and none is missing its evidence
--   nothing remains in `unmet`
--
-- The check runs in the database, for every writer, service role included. A
-- worker that has convinced itself a task is done cannot write that down unless
-- the evidence for it is in the same row. This is the eighth thing a completed
-- task needs — proof of completion — and a proof nobody can contradict is not
-- one, so the proof is stored where the contradiction would be refused.
--
-- ADDITIVE, like 069. Nothing here redefines a function, a trigger or a rule
-- that another migration declared; the completion machine gets its own
-- transition function for exactly the reason 069's does.
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════ 1 · the resting states and the moves
--
-- Five, the same five the kernel has. REPAIRING, AWAITING_AUTHORITY and
-- BLOCKED_EXTERNAL are places a task waits; DELIVERED and FAILED_VERIFIED are
-- places it stops. A task may leave a waiting state for any other, because what
-- it is waiting for can change into anything; it may not leave a stopped one,
-- because a delivered task that becomes undelivered was never delivered.

create or replace function public.core_v2_completion_transition_allowed(
  p_from text, p_to text
) returns boolean language sql immutable as $$
  select p_from in ('REPAIRING','AWAITING_AUTHORITY','BLOCKED_EXTERNAL')
     and p_to in ('DELIVERED','REPAIRING','AWAITING_AUTHORITY','BLOCKED_EXTERNAL','FAILED_VERIFIED')
     and p_from <> p_to;
$$;

comment on function public.core_v2_completion_transition_allowed(text, text) is
  'Every legal move of a task completion. Its own function: 058 and 069 own the machines they declared, and this migration does not restate them.';

-- A CHECK constraint may not contain a subquery, and every acceptance gate has
-- to be looked at, so the looking happens in an immutable function the
-- constraint calls. The rule it encodes is the kernel's: a required gate with no
-- verdict, a false verdict, or no evidence has not been passed.

create or replace function public.core_v2_gates_all_passed(p_gates jsonb)
returns boolean language sql immutable as $$
  select not exists (
    select 1 from jsonb_array_elements(coalesce(p_gates, '[]'::jsonb)) as g(gate)
     where coalesce((g.gate ->> 'required')::boolean, true)
       and (g.gate ->> 'passed' is null
            or (g.gate ->> 'passed')::boolean is not true
            or g.gate ->> 'evidence' is null
            or btrim(g.gate ->> 'evidence') = '')
  );
$$;

comment on function public.core_v2_gates_all_passed(jsonb) is
  'True when every required acceptance gate passed on evidence that exists. A gate nobody measured has not been passed.';

-- ════════════════════════════════════════════════════ 2 · the completion record
--
-- One row per task, where a task is whatever was asked for — a workflow, an
-- episode, a decision, a pull request. The Core does not know which; the column
-- that says is a name the adapter chose.

create table if not exists public.core_v2_task_completions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_id uuid references public.intelligence_workflows(id) on delete set null,

  application text not null check (application <> ''),
  -- The adapter's own name for the task. Unique per organisation and
  -- application, because two rows about one task is two answers about it.
  task_key text not null check (task_key <> ''),

  -- WHAT WAS ASKED FOR, in the words it was asked for. A task with no stated
  -- outcome cannot be complete, because nothing says what completion would be.
  outcome_required text not null default '',

  state text not null default 'REPAIRING' check (state in (
    'DELIVERED','REPAIRING','AWAITING_AUTHORITY','BLOCKED_EXTERNAL','FAILED_VERIFIED')),

  artifact_exists boolean not null default false,
  artifact_digest text check (artifact_digest is null or artifact_digest ~ '^[0-9a-f]{64}$'),
  -- The digest the decision was made about. When these two differ, what exists
  -- is not what was accepted, however good it is.
  decision_bound_digest text check (decision_bound_digest is null or decision_bound_digest ~ '^[0-9a-f]{64}$'),

  read_back_succeeded boolean not null default false,
  -- 'independent_verifier' or 'executor_response'. The second never delivers:
  -- an executor reporting its own success is the claim, not the evidence.
  verified_by text check (verified_by is null or verified_by in ('independent_verifier','executor_response')),

  -- Every acceptance gate as it was judged: [{name, required, passed, evidence}].
  -- `passed: null` or `evidence: null` on a required gate is a failure here for
  -- the same reason it is one in the kernel — a gate nobody measured has not
  -- been passed.
  acceptance_gates jsonb not null default '[]'::jsonb
    check (jsonb_typeof(acceptance_gates) = 'array'),
  -- The named reasons this task is not delivered. Empty is the only value
  -- compatible with DELIVERED, and it is checked below rather than trusted.
  unmet text[] not null default '{}',

  -- Why it rests where it rests, in one sentence, for a person reading a list.
  because text not null default '',
  -- Set when, and only when, the row reached DELIVERED.
  delivered_at timestamptz,

  policy_version text not null,
  engine_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint core_v2_task_completions_one_per_task unique (organization_id, application, task_key),

  -- ── the rule ──────────────────────────────────────────────────────────────
  -- Everything delivery requires, as one constraint, so no write can be
  -- DELIVERED without carrying its own evidence. Each clause is one of the five
  -- requirements; the gate clause is the sixth thing that has been mistaken for
  -- delivery more often than the other five together.
  constraint core_v2_task_completions_delivered_carries_its_proof check (
    state <> 'DELIVERED' or (
      btrim(outcome_required) <> ''
      and artifact_exists
      and artifact_digest is not null
      and decision_bound_digest is not null
      and decision_bound_digest = artifact_digest
      and read_back_succeeded
      and verified_by = 'independent_verifier'
      and cardinality(unmet) = 0
      and public.core_v2_gates_all_passed(acceptance_gates)
    )
  ),
  constraint core_v2_task_completions_delivered_says_when check (
    (state = 'DELIVERED') = (delivered_at is not null))
);

comment on table public.core_v2_task_completions is
  'One task, and whether it is finished. A row may say DELIVERED only while the evidence for delivery is in the row itself; the check runs for every writer, service role included.';
comment on column public.core_v2_task_completions.verified_by is
  'independent_verifier or executor_response. An executor reporting its own success is the claim, never the evidence, so executor_response can never be DELIVERED.';
comment on column public.core_v2_task_completions.acceptance_gates is
  'Every gate as judged. A required gate with passed null, passed false, or no evidence blocks DELIVERED — a gate nobody measured has not been passed.';

create index if not exists core_v2_task_completions_unfinished
  on public.core_v2_task_completions(organization_id, state, updated_at desc)
  where state <> 'DELIVERED';
create index if not exists core_v2_task_completions_by_workflow
  on public.core_v2_task_completions(workflow_id) where workflow_id is not null;

-- ═══════════════════════════════════════════════════════════ 3 · what may change
--
-- A task that stopped stays stopped. DELIVERED and FAILED_VERIFIED are frozen
-- against everything but the bookkeeping columns, whole-row, so a column added
-- to this table in two years is protected the day it exists rather than the day
-- somebody remembers to add it to a list.

create or replace function public.core_v2_guard_task_completion() returns trigger
language plpgsql as $$
declare moved text;
begin
  if new.state is distinct from old.state
     and not public.core_v2_completion_transition_allowed(old.state, new.state) then
    raise exception 'core_v2: a task completion cannot go from % to %', old.state, new.state
      using errcode = 'check_violation';
  end if;
  if old.state in ('DELIVERED','FAILED_VERIFIED') then
    moved := public.core_v2_frozen_except(to_jsonb(old), to_jsonb(new), array['updated_at']);
    if moved is not null then
      raise exception 'core_v2: task completion % has stopped at %; % cannot be rewritten',
        old.id, old.state, moved using errcode = 'check_violation';
    end if;
  end if;
  -- The digest the decision was made about is written once. A delivery that can
  -- rebind itself to whatever exists now is not a delivery of anything.
  if old.decision_bound_digest is not null
     and new.decision_bound_digest is distinct from old.decision_bound_digest then
    raise exception 'core_v2: task completion % was bound to %; it cannot be rebound to %',
      old.id, old.decision_bound_digest, coalesce(new.decision_bound_digest, 'null')
      using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end $$;

comment on function public.core_v2_guard_task_completion() is
  'Refuses an illegal completion move, any edit to a task that has stopped, and any rebinding of the digest a decision was made about.';

drop trigger if exists core_v2_guard_task_completion on public.core_v2_task_completions;
create trigger core_v2_guard_task_completion
  before update on public.core_v2_task_completions
  for each row execute function public.core_v2_guard_task_completion();

-- ═══════════════════════════════════════════════════ 4 · recording a completion
--
-- One function, so the delivered_at timestamp is never a caller's opinion and a
-- move is always made from the state the caller believed it was in.

create or replace function public.core_v2_record_completion(
  p_organization_id uuid, p_application text, p_task_key text,
  p_state text, p_outcome_required text, p_artifact_exists boolean,
  p_artifact_digest text, p_decision_bound_digest text, p_read_back boolean,
  p_verified_by text, p_acceptance_gates jsonb, p_unmet text[], p_because text,
  p_policy_version text, p_engine_version text,
  p_workflow_id uuid default null, p_from_state text default null
) returns public.core_v2_task_completions language plpgsql security definer set search_path = public as $$
declare row public.core_v2_task_completions; actual text;
begin
  insert into public.core_v2_task_completions (
    organization_id, workflow_id, application, task_key, state, outcome_required,
    artifact_exists, artifact_digest, decision_bound_digest, read_back_succeeded,
    verified_by, acceptance_gates, unmet, because, delivered_at, policy_version, engine_version)
  values (
    p_organization_id, p_workflow_id, p_application, p_task_key, p_state, p_outcome_required,
    coalesce(p_artifact_exists, false), p_artifact_digest, p_decision_bound_digest,
    coalesce(p_read_back, false), p_verified_by, coalesce(p_acceptance_gates, '[]'::jsonb),
    coalesce(p_unmet, '{}'), coalesce(p_because, ''),
    case when p_state = 'DELIVERED' then now() end, p_policy_version, p_engine_version)
  on conflict (organization_id, application, task_key) do update
     set state = p_state,
         workflow_id = coalesce(p_workflow_id, public.core_v2_task_completions.workflow_id),
         outcome_required = p_outcome_required,
         artifact_exists = coalesce(p_artifact_exists, false),
         artifact_digest = p_artifact_digest,
         -- Bound once; the guard refuses a change, so this only ever fills it.
         decision_bound_digest = coalesce(public.core_v2_task_completions.decision_bound_digest,
                                          p_decision_bound_digest),
         read_back_succeeded = coalesce(p_read_back, false),
         verified_by = p_verified_by,
         acceptance_gates = coalesce(p_acceptance_gates, '[]'::jsonb),
         unmet = coalesce(p_unmet, '{}'),
         because = coalesce(p_because, ''),
         delivered_at = case when p_state = 'DELIVERED'
                             then coalesce(public.core_v2_task_completions.delivered_at, now()) end,
         policy_version = p_policy_version,
         engine_version = p_engine_version
   where p_from_state is null or public.core_v2_task_completions.state = p_from_state
  returning * into row;

  if row.id is null then
    select c.state into actual from public.core_v2_task_completions c
     where c.organization_id = p_organization_id and c.application = p_application
       and c.task_key = p_task_key;
    raise exception 'core_v2: task % is %, not % — the completion was recorded from a stale reading',
      p_task_key, coalesce(actual, 'absent'), p_from_state using errcode = 'check_violation';
  end if;
  return row;
end $$;

comment on function public.core_v2_record_completion(uuid, text, text, text, text, boolean, text, text, boolean, text, jsonb, text[], text, text, text, uuid, text) is
  'Records where a task rests. The delivered timestamp is set here and never by a caller, and a move is made only from the state the caller believed it was in.';

-- ══════════════════════════════════════════════════════════════ 5 · who may read
--
-- The engine's own table: the service role works here and nobody else does.
-- No delete, for anybody: a task whose completion record can be removed has no
-- proof of completion at all.

alter table public.core_v2_task_completions enable row level security;
revoke all on public.core_v2_task_completions from public, anon, authenticated;
grant select, insert, update on public.core_v2_task_completions to service_role;
