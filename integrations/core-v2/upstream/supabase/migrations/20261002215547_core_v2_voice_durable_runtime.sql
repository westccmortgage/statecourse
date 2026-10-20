-- Durable, fail-closed record for the Core V2 voice door.
--
-- The Edge function reaches these objects over the existing direct database
-- route. No browser role receives a grant. RLS is still enabled as a second
-- barrier in case a table is ever exposed through the data API by mistake.

create schema if not exists core_v2_voice_private;
revoke all on schema core_v2_voice_private from public, anon, authenticated, service_role;

create table if not exists core_v2_voice_private.core_v2_voice_replay_nonces (
  key_id text not null check (key_id ~ '^[A-Za-z0-9_.:-]{1,80}$'),
  nonce text not null check (nonce ~ '^[A-Za-z0-9_-]{16,128}$'),
  signed_at timestamptz not null,
  claimed_at timestamptz not null default now(),
  primary key (key_id, nonce)
);

create index if not exists core_v2_voice_replay_expiry
  on core_v2_voice_private.core_v2_voice_replay_nonces(claimed_at);

create table if not exists core_v2_voice_private.core_v2_voice_sessions (
  session_id text primary key check (session_id ~ '^voice_[a-f0-9]{32}$'),
  caller_app text not null check (length(caller_app) between 1 and 128),
  tenant_id text not null check (length(tenant_id) between 1 and 128),
  call_identity_digest text not null check (call_identity_digest ~ '^[a-f0-9]{64}$'),
  language text not null check (language in ('en','ru','es','zh')),
  revision bigint not null default 0 check (revision >= 0),
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (caller_app, tenant_id, call_identity_digest)
);

create table if not exists core_v2_voice_private.core_v2_voice_turns (
  session_id text not null references core_v2_voice_private.core_v2_voice_sessions(session_id) on delete cascade,
  request_id text not null check (request_id ~ '^[A-Za-z0-9_.:-]{1,128}$'),
  turn_id text not null check (turn_id ~ '^[A-Za-z0-9_.:-]{1,128}$'),
  request_digest text not null check (request_digest ~ '^[a-f0-9]{64}$'),
  expected_revision bigint not null check (expected_revision >= 0),
  status text not null default 'processing' check (status in ('processing','completed')),
  provider_state text not null default 'not_submitted'
    check (provider_state in ('not_submitted','reserved','settled','released','outcome_unknown')),
  response jsonb,
  claim_token uuid not null default gen_random_uuid(),
  lease_expires_at timestamptz not null,
  claimed_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (session_id, request_id),
  unique (session_id, turn_id),
  check ((status = 'completed') = (response is not null))
);

create index if not exists core_v2_voice_turns_open
  on core_v2_voice_private.core_v2_voice_turns(lease_expires_at) where status = 'processing';
create unique index if not exists core_v2_voice_one_open_turn_per_session
  on core_v2_voice_private.core_v2_voice_turns(session_id) where status = 'processing';

create table if not exists core_v2_voice_private.core_v2_voice_budgets (
  session_id text primary key references core_v2_voice_private.core_v2_voice_sessions(session_id) on delete cascade,
  currency text not null check (currency = 'USD'),
  authorized_maximum numeric(14,6) not null check (authorized_maximum >= 0),
  maximum_per_turn numeric(14,6) not null check (maximum_per_turn >= 0),
  maximum_provider_calls_per_turn integer not null check (maximum_provider_calls_per_turn between 1 and 8),
  maximum_provider_calls_per_call integer not null check (maximum_provider_calls_per_call between 1 and 8000),
  maximum_turns_per_call integer not null check (maximum_turns_per_call between 1 and 1000),
  maximum_input_tokens_per_turn integer not null check (maximum_input_tokens_per_turn >= 0),
  maximum_output_tokens_per_turn integer not null check (maximum_output_tokens_per_turn >= 0),
  maximum_input_tokens_per_call bigint not null check (maximum_input_tokens_per_call >= 0),
  maximum_output_tokens_per_call bigint not null check (maximum_output_tokens_per_call >= 0),
  maximum_reasoning_tokens_per_call bigint not null check (maximum_reasoning_tokens_per_call >= 0),
  wall_clock_deadline_ms integer not null check (wall_clock_deadline_ms between 1 and 86400000),
  reserved numeric(14,6) not null default 0 check (reserved >= 0),
  settled numeric(14,6) not null default 0 check (settled >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (reserved <= authorized_maximum)
);

create table if not exists core_v2_voice_private.core_v2_voice_budget_reservations (
  reservation_id uuid primary key default gen_random_uuid(),
  session_id text not null references core_v2_voice_private.core_v2_voice_budgets(session_id) on delete cascade,
  request_id text not null,
  phase text not null check (phase in ('propose','finalize')),
  maximum_usd numeric(14,6) not null check (maximum_usd >= 0),
  pricing_snapshot jsonb not null check (jsonb_typeof(pricing_snapshot) = 'object'),
  raw_usage jsonb check (raw_usage is null or jsonb_typeof(raw_usage) = 'object'),
  normalized_usage jsonb check (normalized_usage is null or jsonb_typeof(normalized_usage) = 'object'),
  state text not null default 'reserved' check (state in ('reserved','settled','released','outcome_unknown')),
  settled_usd numeric(14,6) check (settled_usd is null or settled_usd >= 0),
  release_reason text,
  reserved_at timestamptz not null default now(),
  settled_at timestamptz,
  released_at timestamptz,
  attention_at timestamptz,
  unique (session_id, request_id, phase),
  check (state <> 'settled' or settled_usd is not null),
  check (state <> 'released' or release_reason is not null)
);

create index if not exists core_v2_voice_budget_open
  on core_v2_voice_private.core_v2_voice_budget_reservations(session_id)
  where state in ('reserved','outcome_unknown');

create table if not exists core_v2_voice_private.core_v2_voice_admission_suites (
  suite_id text primary key check (suite_id ~ '^[A-Za-z0-9_.:-]{1,80}$'),
  owner_identity_digest text not null check (owner_identity_digest ~ '^[a-f0-9]{64}$'),
  policy jsonb not null check (jsonb_typeof(policy) = 'object'),
  accepted_calls integer not null default 0 check (accepted_calls >= 0),
  voice_webhooks integer not null default 0 check (voice_webhooks >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core_v2_voice_private.core_v2_voice_admission_calls (
  suite_id text not null references core_v2_voice_private.core_v2_voice_admission_suites(suite_id) on delete cascade,
  call_identity_digest text not null check (call_identity_digest ~ '^[a-f0-9]{64}$'),
  answered_at timestamptz not null,
  deadline_at timestamptz not null,
  stream_claimed_at timestamptz,
  brain_requests integer not null default 0 check (brain_requests >= 0),
  created_at timestamptz not null default now(),
  primary key (suite_id, call_identity_digest),
  check (deadline_at > answered_at)
);
alter table core_v2_voice_private.core_v2_voice_admission_calls
  add column if not exists stream_claimed_at timestamptz;
alter table core_v2_voice_private.core_v2_voice_admission_calls
  add column if not exists brain_requests integer not null default 0 check (brain_requests >= 0);
create unique index if not exists core_v2_voice_one_suite_per_call
  on core_v2_voice_private.core_v2_voice_admission_calls(call_identity_digest);

alter table core_v2_voice_private.core_v2_voice_replay_nonces enable row level security;
alter table core_v2_voice_private.core_v2_voice_sessions enable row level security;
alter table core_v2_voice_private.core_v2_voice_turns enable row level security;
alter table core_v2_voice_private.core_v2_voice_budgets enable row level security;
alter table core_v2_voice_private.core_v2_voice_budget_reservations enable row level security;
alter table core_v2_voice_private.core_v2_voice_admission_suites enable row level security;
alter table core_v2_voice_private.core_v2_voice_admission_calls enable row level security;

create or replace function core_v2_voice_private.core_v2_voice_claim_admission(
  p_suite_id text,
  p_owner_identity_digest text,
  p_call_identity_digest text,
  p_policy jsonb
) returns jsonb
language plpgsql security definer set search_path = pg_catalog as $$
declare
  s core_v2_voice_private.core_v2_voice_admission_suites;
  c core_v2_voice_private.core_v2_voice_admission_calls;
  expiry timestamptz;
  answer_time timestamptz;
  deadline_time timestamptz;
  maximum_calls integer;
  maximum_webhooks integer;
  maximum_seconds integer;
  maximum_turns integer;
  maximum_brain_requests integer;
  maximum_tts_characters integer;
  repeated boolean := false;
begin
  if p_suite_id is null or p_suite_id !~ '^[A-Za-z0-9_.:-]{1,80}$'
     or p_owner_identity_digest is null or p_owner_identity_digest !~ '^[a-f0-9]{64}$'
     or p_call_identity_digest is null or p_call_identity_digest !~ '^[a-f0-9]{64}$'
     or p_policy is null or jsonb_typeof(p_policy) <> 'object' then
    raise exception using message = 'voice:admission_invalid';
  end if;
  begin
    expiry := (p_policy->>'expiresAt')::timestamptz;
    maximum_calls := (p_policy->>'maximumCalls')::integer;
    maximum_webhooks := (p_policy->>'maximumVoiceWebhooks')::integer;
    maximum_seconds := (p_policy->>'maximumCallSeconds')::integer;
    maximum_turns := (p_policy->>'maximumTurns')::integer;
    maximum_brain_requests := (p_policy->>'maximumBrainRequests')::integer;
    maximum_tts_characters := (p_policy->>'maximumTtsCharacters')::integer;
  exception when others then
    raise exception using message = 'voice:admission_policy_invalid';
  end;
  if p_policy->>'protocol' is distinct from 'core-v2.voice-admission-policy.1'
     or p_policy->>'suiteId' is distinct from p_suite_id
     or p_policy->>'ownerIdentityDigest' is distinct from p_owner_identity_digest
     or expiry is null or maximum_calls is null or maximum_webhooks is null
     or maximum_seconds is null or maximum_turns is null
     or maximum_brain_requests is null or maximum_tts_characters is null
     or maximum_calls not between 1 and 10
     or maximum_webhooks not between maximum_calls and 100
     or maximum_seconds not between 30 and 1800
     or maximum_turns not between 1 and 60
     or maximum_brain_requests not between 1 and 100
     or maximum_tts_characters not between 500 and 100000 then
    raise exception using message = 'voice:admission_policy_invalid';
  end if;

  insert into core_v2_voice_private.core_v2_voice_admission_suites(
    suite_id, owner_identity_digest, policy
  ) values (p_suite_id, p_owner_identity_digest, p_policy)
  on conflict (suite_id) do nothing;
  select * into s from core_v2_voice_private.core_v2_voice_admission_suites
   where suite_id = p_suite_id for update;
  if s.owner_identity_digest <> p_owner_identity_digest or s.policy <> p_policy then
    raise exception using message = 'voice:admission_policy_changed';
  end if;
  if now() >= expiry then raise exception using message = 'voice:admission_expired'; end if;
  if s.voice_webhooks >= maximum_webhooks then
    raise exception using message = 'voice:admission_webhook_limit';
  end if;
  update core_v2_voice_private.core_v2_voice_admission_suites
     set voice_webhooks = voice_webhooks + 1, updated_at = now()
   where suite_id = p_suite_id;

  select * into c from core_v2_voice_private.core_v2_voice_admission_calls
   where suite_id = p_suite_id and call_identity_digest = p_call_identity_digest;
  if found then
    repeated := true;
    answer_time := c.answered_at;
    deadline_time := c.deadline_at;
  else
    if s.accepted_calls >= maximum_calls then
      raise exception using message = 'voice:admission_call_limit';
    end if;
    answer_time := clock_timestamp();
    deadline_time := least(expiry, answer_time + make_interval(secs => maximum_seconds));
    if deadline_time <= answer_time then raise exception using message = 'voice:admission_expired'; end if;
    insert into core_v2_voice_private.core_v2_voice_admission_calls(
      suite_id, call_identity_digest, answered_at, deadline_at
    ) values (p_suite_id, p_call_identity_digest, answer_time, deadline_time)
    returning * into c;
    update core_v2_voice_private.core_v2_voice_admission_suites
       set accepted_calls = accepted_calls + 1, updated_at = now()
     where suite_id = p_suite_id;
  end if;

  return jsonb_build_object(
    'protocol', 'core-v2.voice-admission.1',
    'suiteId', p_suite_id,
    'callIdentityDigest', p_call_identity_digest,
    'answeredAtMs', floor(extract(epoch from answer_time) * 1000)::bigint,
    'deadlineMs', floor(extract(epoch from deadline_time) * 1000)::bigint,
    'maximumTurns', maximum_turns,
    'maximumBrainRequests', maximum_brain_requests,
    'maximumTtsCharacters', maximum_tts_characters,
    'repeated', repeated
  );
end $$;

create or replace function core_v2_voice_private.core_v2_voice_claim_admission_stream(
  p_suite_id text,
  p_call_identity_digest text
) returns jsonb
language plpgsql security definer set search_path = pg_catalog as $$
declare c core_v2_voice_private.core_v2_voice_admission_calls;
begin
  select * into c from core_v2_voice_private.core_v2_voice_admission_calls
   where suite_id = p_suite_id and call_identity_digest = p_call_identity_digest for update;
  if not found then raise exception using message = 'voice:admission_not_found'; end if;
  if now() >= c.deadline_at then raise exception using message = 'voice:admission_expired'; end if;
  if c.stream_claimed_at is not null then
    raise exception using message = 'voice:admission_stream_already_claimed';
  end if;
  update core_v2_voice_private.core_v2_voice_admission_calls
     set stream_claimed_at = clock_timestamp()
   where suite_id = p_suite_id and call_identity_digest = p_call_identity_digest;
  return jsonb_build_object(
    'protocol', 'core-v2.voice-admission-stream.1',
    'suiteId', p_suite_id,
    'callIdentityDigest', p_call_identity_digest,
    'claimed', true
  );
end $$;

create or replace function core_v2_voice_private.core_v2_voice_claim_replay(
  p_key_id text, p_nonce text, p_signed_at timestamptz, p_window_seconds integer default 60
) returns boolean
language plpgsql security definer set search_path = pg_catalog as $$
begin
  if p_window_seconds < 1 or p_window_seconds > 300
     or p_signed_at < now() - make_interval(secs => p_window_seconds)
     or p_signed_at > now() + make_interval(secs => p_window_seconds) then
    return false;
  end if;
  delete from core_v2_voice_private.core_v2_voice_replay_nonces
   where claimed_at < now() - interval '10 minutes';
  insert into core_v2_voice_private.core_v2_voice_replay_nonces(key_id, nonce, signed_at)
  values (p_key_id, p_nonce, p_signed_at)
  on conflict do nothing;
  return found;
end $$;

create or replace function core_v2_voice_private.core_v2_voice_claim_turn(
  p_session_id text,
  p_caller_app text,
  p_tenant_id text,
  p_call_identity_digest text,
  p_request_id text,
  p_turn_id text,
  p_request_digest text,
  p_expected_revision bigint,
  p_language text,
  p_initial_state jsonb,
  p_lease_seconds integer default 45
) returns jsonb
language plpgsql security definer set search_path = pg_catalog as $$
declare
  s core_v2_voice_private.core_v2_voice_sessions;
  t core_v2_voice_private.core_v2_voice_turns;
  admission_policy jsonb;
  admission_stream_claimed_at timestamptz;
  admission_deadline_at timestamptz;
  admission_brain_requests integer;
  maximum_brain_requests integer;
  maximum_turns integer;
begin
  if p_lease_seconds < 5 or p_lease_seconds > 300 then
    raise exception using message = 'voice:invalid_lease';
  end if;
  select c.stream_claimed_at, c.deadline_at, c.brain_requests, suite.policy
    into admission_stream_claimed_at, admission_deadline_at, admission_brain_requests, admission_policy
    from core_v2_voice_private.core_v2_voice_admission_calls c
    join core_v2_voice_private.core_v2_voice_admission_suites suite using (suite_id)
   where c.call_identity_digest = p_call_identity_digest
   for update of c;
  if not found or admission_stream_claimed_at is null or now() >= admission_deadline_at then
    raise exception using message = 'voice:admission_not_active';
  end if;
  maximum_brain_requests := (admission_policy->>'maximumBrainRequests')::integer;
  maximum_turns := (admission_policy->>'maximumTurns')::integer;
  if maximum_brain_requests is null or maximum_brain_requests not between 1 and 100
     or maximum_turns is null or maximum_turns not between 1 and 60 then
    raise exception using message = 'voice:admission_policy_invalid';
  end if;
  insert into core_v2_voice_private.core_v2_voice_sessions(
    session_id, caller_app, tenant_id, call_identity_digest, language, revision, state)
  values (p_session_id, p_caller_app, p_tenant_id, p_call_identity_digest,
          p_language, 0, p_initial_state)
  on conflict (session_id) do nothing;

  select * into s from core_v2_voice_private.core_v2_voice_sessions
   where session_id = p_session_id for update;
  if not found then raise exception using message = 'voice:session_not_found'; end if;
  if (s.caller_app, s.tenant_id, s.call_identity_digest)
     is distinct from (p_caller_app, p_tenant_id, p_call_identity_digest) then
    raise exception using message = 'voice:session_owner_mismatch';
  end if;

  select * into t from core_v2_voice_private.core_v2_voice_turns
   where session_id = p_session_id and request_id = p_request_id for update;
  if found then
    if t.turn_id <> p_turn_id or t.request_digest <> p_request_digest
       or t.expected_revision <> p_expected_revision then
      raise exception using message = 'voice:idempotency_conflict';
    end if;
    if t.status = 'completed' then
      return jsonb_build_object('state', s.state, 'repeated', t.response, 'claimToken', null);
    end if;
    if t.provider_state = 'not_submitted' and t.lease_expires_at <= now() then
      update core_v2_voice_private.core_v2_voice_turns
         set lease_expires_at = now() + make_interval(secs => p_lease_seconds),
             claimed_at = now(), claim_token = gen_random_uuid()
       where session_id = p_session_id and request_id = p_request_id;
      select * into t from core_v2_voice_private.core_v2_voice_turns
       where session_id = p_session_id and request_id = p_request_id;
      return jsonb_build_object('state', s.state, 'repeated', null, 'claimToken', t.claim_token);
    end if;
    if t.provider_state <> 'not_submitted' then
      raise exception using message = 'voice:outcome_unknown';
    end if;
    raise exception using message = 'voice:turn_in_progress';
  end if;

  if exists (select 1 from core_v2_voice_private.core_v2_voice_turns
              where session_id = p_session_id and status = 'processing') then
    raise exception using message = 'voice:turn_in_progress';
  end if;
  if s.revision <> p_expected_revision then
    raise exception using message = 'voice:stale_state';
  end if;
  if s.language <> p_language then
    raise exception using message = 'voice:language_changed';
  end if;
  if (select count(*) from core_v2_voice_private.core_v2_voice_turns
       where session_id = p_session_id) >= maximum_turns then
    raise exception using message = 'voice:admission_turn_limit';
  end if;
  if admission_brain_requests >= maximum_brain_requests then
    raise exception using message = 'voice:admission_brain_limit';
  end if;
  update core_v2_voice_private.core_v2_voice_admission_calls
     set brain_requests = brain_requests + 1
   where call_identity_digest = p_call_identity_digest;
  insert into core_v2_voice_private.core_v2_voice_turns(
    session_id, request_id, turn_id, request_digest, expected_revision, lease_expires_at)
  values (p_session_id, p_request_id, p_turn_id, p_request_digest, p_expected_revision,
          now() + make_interval(secs => p_lease_seconds));
  select * into t from core_v2_voice_private.core_v2_voice_turns
   where session_id = p_session_id and request_id = p_request_id;
  return jsonb_build_object('state', s.state, 'repeated', null, 'claimToken', t.claim_token);
end $$;

create or replace function core_v2_voice_private.core_v2_voice_commit_turn(
  p_session_id text, p_caller_app text, p_tenant_id text, p_call_identity_digest text,
  p_request_id text, p_claim_token uuid, p_expected_revision bigint, p_next_state jsonb, p_response jsonb
) returns jsonb
language plpgsql security definer set search_path = pg_catalog as $$
declare
  s core_v2_voice_private.core_v2_voice_sessions;
  t core_v2_voice_private.core_v2_voice_turns;
begin
  select * into s from core_v2_voice_private.core_v2_voice_sessions where session_id = p_session_id for update;
  if not found then raise exception using message = 'voice:session_not_found'; end if;
  if (s.caller_app, s.tenant_id, s.call_identity_digest)
     is distinct from (p_caller_app, p_tenant_id, p_call_identity_digest) then
    raise exception using message = 'voice:session_owner_mismatch';
  end if;
  select * into t from core_v2_voice_private.core_v2_voice_turns
   where session_id = p_session_id and request_id = p_request_id for update;
  if not found then raise exception using message = 'voice:turn_not_claimed'; end if;
  if t.status = 'completed' then return t.response; end if;
  if t.claim_token <> p_claim_token then raise exception using message = 'voice:claim_fenced'; end if;
  if s.revision <> p_expected_revision
     or (p_next_state->>'revision')::bigint <> p_expected_revision + 1
     or p_next_state->>'sessionId' <> p_session_id
     or (p_response->>'stateRevision')::bigint <> p_expected_revision + 1
     or p_response->>'sessionId' <> p_session_id
     or p_response->>'requestId' <> p_request_id then
    raise exception using message = 'voice:invalid_commit';
  end if;
  update core_v2_voice_private.core_v2_voice_sessions
     set revision = p_expected_revision + 1, state = p_next_state, updated_at = now()
   where session_id = p_session_id;
  update core_v2_voice_private.core_v2_voice_turns
     set status = 'completed', response = p_response, completed_at = now()
   where session_id = p_session_id and request_id = p_request_id;
  return p_response;
end $$;

create or replace function core_v2_voice_private.core_v2_voice_abort_turn(
  p_session_id text, p_caller_app text, p_tenant_id text, p_call_identity_digest text,
  p_request_id text, p_claim_token uuid
) returns boolean
language plpgsql security definer set search_path = pg_catalog as $$
begin
  if not exists (
    select 1 from core_v2_voice_private.core_v2_voice_sessions
     where session_id = p_session_id and caller_app = p_caller_app
       and tenant_id = p_tenant_id and call_identity_digest = p_call_identity_digest
  ) then return false; end if;
  delete from core_v2_voice_private.core_v2_voice_turns
   where session_id = p_session_id and request_id = p_request_id
     and status = 'processing' and provider_state = 'not_submitted'
     and claim_token = p_claim_token;
  return found;
end $$;

create or replace function core_v2_voice_private.core_v2_voice_reserve_budget(
  p_session_id text, p_request_id text, p_phase text, p_claim_token uuid,
  p_maximum_usd numeric, p_policy jsonb, p_pricing_snapshot jsonb
) returns jsonb
language plpgsql security definer set search_path = pg_catalog as $$
declare
  b core_v2_voice_private.core_v2_voice_budgets;
  r core_v2_voice_private.core_v2_voice_budget_reservations;
  calls integer;
  session_calls integer;
  turns integer;
  turn_committed numeric(14,6);
  session_input_tokens bigint;
  session_output_tokens bigint;
  session_reasoning_tokens bigint;
  t core_v2_voice_private.core_v2_voice_turns;
  admission_policy jsonb;
  admission_stream_claimed_at timestamptz;
  admission_deadline_at timestamptz;
  admission_brain_requests integer;
  v_call_identity_digest text;
begin
  if p_phase not in ('propose','finalize') or p_maximum_usd is null or p_maximum_usd < 0 then
    raise exception using message = 'voice:invalid_reservation';
  end if;
  if p_pricing_snapshot is null or jsonb_typeof(p_pricing_snapshot) <> 'object' then
    raise exception using message = 'voice:invalid_pricing_snapshot';
  end if;
  if (p_pricing_snapshot->>'maximumInputTokens') is null
     or (p_pricing_snapshot->>'maximumOutputTokens') is null
     or (p_pricing_snapshot->>'maximumReasoningTokens') is null
     or (p_pricing_snapshot->>'maximumInputTokens')::bigint < 0
     or (p_pricing_snapshot->>'maximumOutputTokens')::bigint < 0
     or (p_pricing_snapshot->>'maximumReasoningTokens')::bigint < 0 then
    raise exception using message = 'voice:invalid_pricing_snapshot';
  end if;
  select voice_session.call_identity_digest into v_call_identity_digest
    from core_v2_voice_private.core_v2_voice_sessions voice_session
   where voice_session.session_id = p_session_id;
  if not found then raise exception using message = 'voice:session_not_found'; end if;
  select c.stream_claimed_at, c.deadline_at, c.brain_requests, suite.policy
    into admission_stream_claimed_at, admission_deadline_at, admission_brain_requests, admission_policy
    from core_v2_voice_private.core_v2_voice_admission_calls c
    join core_v2_voice_private.core_v2_voice_admission_suites suite using (suite_id)
   where c.call_identity_digest = v_call_identity_digest
   for update of c;
  if not found or admission_stream_claimed_at is null or now() >= admission_deadline_at
     or (admission_policy->>'maximumBrainRequests') is null
     or admission_brain_requests > (admission_policy->>'maximumBrainRequests')::integer then
    raise exception using message = 'voice:admission_not_active';
  end if;
  select * into t from core_v2_voice_private.core_v2_voice_turns
   where session_id = p_session_id and request_id = p_request_id for update;
  if not found or t.status <> 'processing' then
    raise exception using message = 'voice:turn_not_claimed';
  end if;
  if t.claim_token <> p_claim_token then raise exception using message = 'voice:claim_fenced'; end if;
  insert into core_v2_voice_private.core_v2_voice_budgets(
    session_id, currency, authorized_maximum, maximum_per_turn,
    maximum_provider_calls_per_turn, maximum_provider_calls_per_call, maximum_turns_per_call,
    maximum_input_tokens_per_turn, maximum_output_tokens_per_turn,
    maximum_input_tokens_per_call, maximum_output_tokens_per_call,
    maximum_reasoning_tokens_per_call, wall_clock_deadline_ms)
  values (
    p_session_id, p_policy->>'currency', (p_policy->>'authorizedMaximumUsd')::numeric,
    (p_policy->>'maximumPerTurnUsd')::numeric,
    (p_policy->>'maximumProviderCallsPerTurn')::integer,
    (p_policy->>'maximumProviderCallsPerCall')::integer,
    (p_policy->>'maximumTurnsPerCall')::integer,
    (p_policy->>'maximumInputTokensPerTurn')::integer,
    (p_policy->>'maximumOutputTokensPerTurn')::integer,
    (p_policy->>'maximumInputTokensPerCall')::bigint,
    (p_policy->>'maximumOutputTokensPerCall')::bigint,
    (p_policy->>'maximumReasoningTokensPerCall')::bigint,
    (p_policy->>'wallClockDeadlineMs')::integer)
  on conflict (session_id) do nothing;
  select * into b from core_v2_voice_private.core_v2_voice_budgets where session_id = p_session_id for update;
  if b.currency <> p_policy->>'currency'
     or b.authorized_maximum <> (p_policy->>'authorizedMaximumUsd')::numeric
     or b.maximum_per_turn <> (p_policy->>'maximumPerTurnUsd')::numeric
     or b.maximum_provider_calls_per_turn <> (p_policy->>'maximumProviderCallsPerTurn')::integer
     or b.maximum_provider_calls_per_call <> (p_policy->>'maximumProviderCallsPerCall')::integer
     or b.maximum_turns_per_call <> (p_policy->>'maximumTurnsPerCall')::integer
     or b.maximum_input_tokens_per_turn <> (p_policy->>'maximumInputTokensPerTurn')::integer
     or b.maximum_output_tokens_per_turn <> (p_policy->>'maximumOutputTokensPerTurn')::integer
     or b.maximum_input_tokens_per_call <> (p_policy->>'maximumInputTokensPerCall')::bigint
     or b.maximum_output_tokens_per_call <> (p_policy->>'maximumOutputTokensPerCall')::bigint
     or b.maximum_reasoning_tokens_per_call <> (p_policy->>'maximumReasoningTokensPerCall')::bigint
     or b.wall_clock_deadline_ms <> (p_policy->>'wallClockDeadlineMs')::integer then
    raise exception using message = 'voice:budget_policy_changed';
  end if;
  select * into r from core_v2_voice_private.core_v2_voice_budget_reservations
   where session_id = p_session_id and request_id = p_request_id and phase = p_phase;
  if found then
    raise exception using message = 'voice:reservation_already_acquired';
  end if;
  select count(*) into calls from core_v2_voice_private.core_v2_voice_budget_reservations
   where session_id = p_session_id and request_id = p_request_id;
  select count(*),
         coalesce(sum(case when state <> 'released' then (pricing_snapshot->>'maximumInputTokens')::bigint else 0 end), 0),
         coalesce(sum(case when state <> 'released' then (pricing_snapshot->>'maximumOutputTokens')::bigint else 0 end), 0),
         coalesce(sum(case when state <> 'released' then (pricing_snapshot->>'maximumReasoningTokens')::bigint else 0 end), 0)
    into session_calls, session_input_tokens, session_output_tokens, session_reasoning_tokens
    from core_v2_voice_private.core_v2_voice_budget_reservations
   where session_id = p_session_id;
  select coalesce(sum(case
    when state = 'settled' then settled_usd
    when state = 'released' then 0
    else maximum_usd end), 0)
    into turn_committed
    from core_v2_voice_private.core_v2_voice_budget_reservations
   where session_id = p_session_id and request_id = p_request_id;
  select count(*) into turns from core_v2_voice_private.core_v2_voice_turns where session_id = p_session_id;
  if now() > b.created_at + make_interval(secs => b.wall_clock_deadline_ms::double precision / 1000.0)
     or calls >= b.maximum_provider_calls_per_turn or turns > b.maximum_turns_per_call
     or session_calls >= b.maximum_provider_calls_per_call
     or (p_pricing_snapshot->>'maximumInputTokens')::bigint > b.maximum_input_tokens_per_turn
     or (p_pricing_snapshot->>'maximumOutputTokens')::bigint > b.maximum_output_tokens_per_turn
     or session_input_tokens + (p_pricing_snapshot->>'maximumInputTokens')::bigint > b.maximum_input_tokens_per_call
     or session_output_tokens + (p_pricing_snapshot->>'maximumOutputTokens')::bigint > b.maximum_output_tokens_per_call
     or session_reasoning_tokens + (p_pricing_snapshot->>'maximumReasoningTokens')::bigint > b.maximum_reasoning_tokens_per_call
     or turn_committed + p_maximum_usd > b.maximum_per_turn
     or b.reserved + b.settled + p_maximum_usd > b.authorized_maximum then
    raise exception using message = 'voice:budget_not_authorized';
  end if;
  insert into core_v2_voice_private.core_v2_voice_budget_reservations(
    session_id, request_id, phase, maximum_usd, pricing_snapshot)
  values (p_session_id, p_request_id, p_phase, p_maximum_usd, p_pricing_snapshot)
  returning * into r;
  update core_v2_voice_private.core_v2_voice_budgets
     set reserved = reserved + p_maximum_usd, updated_at = now()
   where session_id = p_session_id;
  update core_v2_voice_private.core_v2_voice_turns set provider_state = 'reserved'
   where session_id = p_session_id and request_id = p_request_id;
  return to_jsonb(r);
end $$;

create or replace function core_v2_voice_private.core_v2_voice_settle_budget(
  p_reservation_id uuid, p_settled_usd numeric, p_raw_usage jsonb, p_normalized_usage jsonb
) returns void
language plpgsql security definer set search_path = pg_catalog as $$
declare r core_v2_voice_private.core_v2_voice_budget_reservations;
begin
  select * into r from core_v2_voice_private.core_v2_voice_budget_reservations
   where reservation_id = p_reservation_id for update;
  if not found or r.state <> 'reserved' then raise exception using message = 'voice:reservation_not_open'; end if;
  if p_settled_usd is null or p_settled_usd < 0 or p_settled_usd > r.maximum_usd then
    raise exception using message = 'voice:settlement_exceeds_reservation';
  end if;
  if p_raw_usage is null or jsonb_typeof(p_raw_usage) <> 'object'
     or p_normalized_usage is null or jsonb_typeof(p_normalized_usage) <> 'object' then
    raise exception using message = 'voice:usage_audit_required';
  end if;
  update core_v2_voice_private.core_v2_voice_budgets
     set reserved = reserved - r.maximum_usd, settled = settled + p_settled_usd, updated_at = now()
   where session_id = r.session_id;
  update core_v2_voice_private.core_v2_voice_budget_reservations
     set state = 'settled', settled_usd = p_settled_usd, raw_usage = p_raw_usage,
         normalized_usage = p_normalized_usage, settled_at = now()
   where reservation_id = p_reservation_id;
  update core_v2_voice_private.core_v2_voice_turns set provider_state = 'settled'
   where session_id = r.session_id and request_id = r.request_id;
end $$;

create or replace function core_v2_voice_private.core_v2_voice_release_budget(
  p_reservation_id uuid, p_reason text
) returns void
language plpgsql security definer set search_path = pg_catalog as $$
declare r core_v2_voice_private.core_v2_voice_budget_reservations;
begin
  if p_reason is null or btrim(p_reason) = '' then raise exception using message = 'voice:release_reason_required'; end if;
  select * into r from core_v2_voice_private.core_v2_voice_budget_reservations
   where reservation_id = p_reservation_id for update;
  if not found or r.state <> 'reserved' then raise exception using message = 'voice:reservation_not_open'; end if;
  update core_v2_voice_private.core_v2_voice_budgets set reserved = reserved - r.maximum_usd, updated_at = now()
   where session_id = r.session_id;
  update core_v2_voice_private.core_v2_voice_budget_reservations
     set state = 'released', settled_usd = 0, release_reason = left(p_reason, 300), released_at = now()
   where reservation_id = p_reservation_id;
  update core_v2_voice_private.core_v2_voice_turns set provider_state = 'released'
   where session_id = r.session_id and request_id = r.request_id;
end $$;

create or replace function core_v2_voice_private.core_v2_voice_preserve_unknown(p_reservation_id uuid) returns void
language plpgsql security definer set search_path = pg_catalog as $$
declare r core_v2_voice_private.core_v2_voice_budget_reservations;
begin
  select * into r from core_v2_voice_private.core_v2_voice_budget_reservations
   where reservation_id = p_reservation_id for update;
  if not found or r.state <> 'reserved' then raise exception using message = 'voice:reservation_not_open'; end if;
  update core_v2_voice_private.core_v2_voice_budget_reservations
     set state = 'outcome_unknown', attention_at = now()
   where reservation_id = p_reservation_id;
  update core_v2_voice_private.core_v2_voice_turns set provider_state = 'outcome_unknown'
   where session_id = r.session_id and request_id = r.request_id;
end $$;

revoke all on core_v2_voice_private.core_v2_voice_replay_nonces,
  core_v2_voice_private.core_v2_voice_sessions,
  core_v2_voice_private.core_v2_voice_turns,
  core_v2_voice_private.core_v2_voice_budgets,
  core_v2_voice_private.core_v2_voice_budget_reservations,
  core_v2_voice_private.core_v2_voice_admission_suites,
  core_v2_voice_private.core_v2_voice_admission_calls
  from public, anon, authenticated, service_role;

do $$ begin
  create role core_v2_voice_runtime nologin inherit;
exception when duplicate_object then null;
end $$;

-- Hosted Supabase's migration principal is intentionally not a superuser.
-- PostgreSQL therefore rejects ALTER ROLE clauses that mention privileged
-- attributes (including setting them to their safe, false values). CREATE ROLE
-- already defaults to NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOREPLICATION,
-- NOBYPASSRLS and NOLOGIN. On an idempotent replay, verify every capability
-- instead of attempting a privileged alteration or silently accepting drift.
do $$
declare runtime_role pg_catalog.pg_roles;
begin
  select * into runtime_role from pg_catalog.pg_roles where rolname = 'core_v2_voice_runtime';
  if not found
     or runtime_role.rolcanlogin
     or runtime_role.rolsuper
     or runtime_role.rolcreatedb
     or runtime_role.rolcreaterole
     or runtime_role.rolreplication
     or runtime_role.rolbypassrls
     or not runtime_role.rolinherit then
    raise exception using message = 'voice:runtime_role_capabilities_unsafe';
  end if;
end $$;
grant usage on schema core_v2_voice_private to core_v2_voice_runtime;

revoke all on function core_v2_voice_private.core_v2_voice_claim_replay(text,text,timestamptz,integer) from public, anon, authenticated, service_role;
revoke all on function core_v2_voice_private.core_v2_voice_claim_turn(text,text,text,text,text,text,text,bigint,text,jsonb,integer) from public, anon, authenticated, service_role;
revoke all on function core_v2_voice_private.core_v2_voice_commit_turn(text,text,text,text,text,uuid,bigint,jsonb,jsonb) from public, anon, authenticated, service_role;
revoke all on function core_v2_voice_private.core_v2_voice_abort_turn(text,text,text,text,text,uuid) from public, anon, authenticated, service_role;
revoke all on function core_v2_voice_private.core_v2_voice_reserve_budget(text,text,text,uuid,numeric,jsonb,jsonb) from public, anon, authenticated, service_role;
revoke all on function core_v2_voice_private.core_v2_voice_settle_budget(uuid,numeric,jsonb,jsonb) from public, anon, authenticated, service_role;
revoke all on function core_v2_voice_private.core_v2_voice_release_budget(uuid,text) from public, anon, authenticated, service_role;
revoke all on function core_v2_voice_private.core_v2_voice_preserve_unknown(uuid) from public, anon, authenticated, service_role;
revoke all on function core_v2_voice_private.core_v2_voice_claim_admission(text,text,text,jsonb) from public, anon, authenticated, service_role;
revoke all on function core_v2_voice_private.core_v2_voice_claim_admission_stream(text,text) from public, anon, authenticated, service_role;

grant execute on function core_v2_voice_private.core_v2_voice_claim_replay(text,text,timestamptz,integer) to core_v2_voice_runtime;
grant execute on function core_v2_voice_private.core_v2_voice_claim_turn(text,text,text,text,text,text,text,bigint,text,jsonb,integer) to core_v2_voice_runtime;
grant execute on function core_v2_voice_private.core_v2_voice_commit_turn(text,text,text,text,text,uuid,bigint,jsonb,jsonb) to core_v2_voice_runtime;
grant execute on function core_v2_voice_private.core_v2_voice_abort_turn(text,text,text,text,text,uuid) to core_v2_voice_runtime;
grant execute on function core_v2_voice_private.core_v2_voice_reserve_budget(text,text,text,uuid,numeric,jsonb,jsonb) to core_v2_voice_runtime;
grant execute on function core_v2_voice_private.core_v2_voice_settle_budget(uuid,numeric,jsonb,jsonb) to core_v2_voice_runtime;
grant execute on function core_v2_voice_private.core_v2_voice_release_budget(uuid,text) to core_v2_voice_runtime;
grant execute on function core_v2_voice_private.core_v2_voice_preserve_unknown(uuid) to core_v2_voice_runtime;
grant execute on function core_v2_voice_private.core_v2_voice_claim_admission(text,text,text,jsonb) to core_v2_voice_runtime;
grant execute on function core_v2_voice_private.core_v2_voice_claim_admission_stream(text,text) to core_v2_voice_runtime;
