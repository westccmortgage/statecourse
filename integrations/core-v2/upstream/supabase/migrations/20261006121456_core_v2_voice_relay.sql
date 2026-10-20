-- Durable record for Emma on Twilio ConversationRelay.
-- Filename matches the migration version assigned by the production ledger.
--
-- Twilio owns speech recognition, speech synthesis and barge-in. The phone
-- service (Render) owns the WebSocket. This schema owns what must survive a
-- restart and must never be guessed: which stream holds an admitted call,
-- which caller turn is being answered, the money reserved for its one model
-- request, what that request actually cost, and what Emma was cleared to say.
--
-- One blocking round trip per caller turn: begin (claim + reserve + count the
-- dispatch) and complete (settle/release/hold + record the reply) run inside
-- the same Edge invocation around the model call. Nothing here generates
-- speech. Existing voice tables and functions are unchanged.

create table if not exists core_v2_voice_private.core_v2_voice_relay_calls (
  call_identity_digest text primary key check (call_identity_digest ~ '^[a-f0-9]{64}$'),
  suite_id text not null,
  caller_app text not null check (length(caller_app) between 1 and 128),
  tenant_id text not null check (length(tenant_id) between 1 and 128),
  revision bigint not null default 0 check (revision >= 0),
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  maximum_turns integer not null check (maximum_turns between 1 and 60),
  maximum_requests integer not null check (maximum_requests between 1 and 100),
  maximum_characters integer not null check (maximum_characters between 1 and 100000),
  turns_used integer not null default 0 check (turns_used >= 0),
  provider_requests integer not null default 0 check (provider_requests >= 0),
  characters_used integer not null default 0 check (characters_used >= 0),
  authorized_maximum numeric(14,6) not null check (authorized_maximum >= 0),
  maximum_per_turn numeric(14,6) not null check (maximum_per_turn >= 0),
  reserved numeric(14,6) not null default 0 check (reserved >= 0),
  settled numeric(14,6) not null default 0 check (settled >= 0),
  held numeric(14,6) not null default 0 check (held >= 0),
  deadline_at timestamptz not null,
  claimed_at timestamptz not null default clock_timestamp(),
  closed_at timestamptz,
  close_reason text check (close_reason is null or close_reason ~ '^[a-z_]{1,64}$'),
  updated_at timestamptz not null default clock_timestamp(),
  foreign key (suite_id, call_identity_digest)
    references core_v2_voice_private.core_v2_voice_admission_calls(suite_id, call_identity_digest)
);

create table if not exists core_v2_voice_private.core_v2_voice_relay_turns (
  call_identity_digest text not null
    references core_v2_voice_private.core_v2_voice_relay_calls(call_identity_digest) on delete cascade,
  revision bigint not null check (revision >= 1),
  request_id text not null check (request_id ~ '^[A-Za-z0-9_.:-]{1,160}$'),
  request_digest text not null check (request_digest ~ '^[a-f0-9]{64}$'),
  -- Money: reserved before the request leaves, then exactly one of
  -- settled (known usage), released (known not submitted / no charge) or
  -- held (outcome unknown; never released without reconciliation).
  money_state text not null default 'reserved' check (money_state in ('reserved','settled','released','held')),
  reserved_usd numeric(14,6) not null check (reserved_usd >= 0),
  settled_usd numeric(14,6) check (settled_usd is null or settled_usd >= 0),
  pricing jsonb not null check (jsonb_typeof(pricing) = 'object'),
  raw_usage jsonb check (raw_usage is null or jsonb_typeof(raw_usage) = 'object'),
  reply_state text not null default 'pending' check (reply_state in ('pending','prepared','withheld','none')),
  reply_text text check (reply_text is null or length(reply_text) between 1 and 2000),
  -- 'submitted' means handed to Twilio for speech; it never means heard.
  delivery text not null default 'pending' check (delivery in ('pending','submitted','interrupted','discarded')),
  spoken_prefix text check (spoken_prefix is null or length(spoken_prefix) <= 2000),
  diagnostics jsonb check (diagnostics is null or jsonb_typeof(diagnostics) = 'object'),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  primary key (call_identity_digest, revision),
  unique (call_identity_digest, request_id)
);

create index if not exists core_v2_voice_relay_open_money
  on core_v2_voice_private.core_v2_voice_relay_turns(call_identity_digest)
  where money_state in ('reserved','held');

alter table core_v2_voice_private.core_v2_voice_relay_calls enable row level security;
alter table core_v2_voice_private.core_v2_voice_relay_turns enable row level security;
revoke all on core_v2_voice_private.core_v2_voice_relay_calls,
  core_v2_voice_private.core_v2_voice_relay_turns
  from public, anon, authenticated, service_role;

-- Records what happened to the previous reply. Twilio reports the spoken
-- prefix on barge-in; that prefix is a playback report, never caller speech.
create or replace function core_v2_voice_private.core_v2_voice_relay_apply_delivery(
  p_call_identity_digest text, p_previous jsonb
) returns void
language plpgsql security definer set search_path = pg_catalog as $$
declare
  t core_v2_voice_private.core_v2_voice_relay_turns;
  v_delivery text;
  v_prefix text;
begin
  if p_previous is null or p_previous = 'null'::jsonb then return; end if;
  if jsonb_typeof(p_previous) <> 'object' then raise exception using message = 'voice:bad_request'; end if;
  v_delivery := p_previous->>'delivery';
  v_prefix := nullif(p_previous->>'spokenPrefix', '');
  if v_delivery not in ('submitted','interrupted','discarded')
     or (v_prefix is not null and length(v_prefix) > 2000) then
    raise exception using message = 'voice:bad_request';
  end if;
  select * into t from core_v2_voice_private.core_v2_voice_relay_turns
   where call_identity_digest = p_call_identity_digest and request_id = p_previous->>'requestId'
   for update;
  if not found then raise exception using message = 'voice:delivery_turn_not_found'; end if;
  if t.delivery <> 'pending' then
    if t.delivery = v_delivery then return; end if;
    raise exception using message = 'voice:delivery_conflict';
  end if;
  if t.reply_state <> 'prepared' and v_delivery <> 'discarded' then
    raise exception using message = 'voice:delivery_conflict';
  end if;
  if v_delivery = 'interrupted' and v_prefix is not null
     and left(coalesce(t.reply_text, ''), length(v_prefix)) <> v_prefix then
    v_prefix := null;  -- never store text Emma did not prepare
  end if;
  update core_v2_voice_private.core_v2_voice_relay_turns
     set delivery = v_delivery,
         spoken_prefix = case when v_delivery = 'interrupted' then v_prefix else null end,
         updated_at = clock_timestamp()
   where call_identity_digest = p_call_identity_digest and revision = t.revision;
  update core_v2_voice_private.core_v2_voice_relay_calls c
     set state = jsonb_set(c.state, '{history}', coalesce((
           select jsonb_agg(case
             when (entry->>'revision')::bigint = t.revision and entry->>'role' = 'assistant'
               then entry || jsonb_build_object('delivery', v_delivery,
                 'spokenPrefix', case when v_delivery = 'interrupted' then to_jsonb(v_prefix) else 'null'::jsonb end)
             else entry end order by ordinality)
             from jsonb_array_elements(c.state->'history') with ordinality as h(entry, ordinality)), '[]'::jsonb)),
         updated_at = clock_timestamp()
   where c.call_identity_digest = p_call_identity_digest;
end $$;

create or replace function core_v2_voice_private.core_v2_voice_relay_claim_session(
  p_caller_app text,
  p_tenant_id text,
  p_suite_id text,
  p_call_identity_digest text,
  p_authorized_maximum numeric,
  p_maximum_per_turn numeric,
  p_greeting text
) returns jsonb
language plpgsql security definer set search_path = pg_catalog as $$
declare
  a core_v2_voice_private.core_v2_voice_admission_calls;
  s core_v2_voice_private.core_v2_voice_admission_suites;
begin
  if p_authorized_maximum is null or p_authorized_maximum < 0
     or p_maximum_per_turn is null or p_maximum_per_turn < 0 or p_maximum_per_turn > p_authorized_maximum
     or p_greeting is null or length(p_greeting) not between 1 and 1000 then
    raise exception using message = 'voice:bad_request';
  end if;
  select * into a from core_v2_voice_private.core_v2_voice_admission_calls
   where suite_id = p_suite_id and call_identity_digest = p_call_identity_digest for update;
  if not found then raise exception using message = 'voice:admission_not_found'; end if;
  if clock_timestamp() >= a.deadline_at then raise exception using message = 'voice:admission_expired'; end if;
  -- One stream per admitted call, shared with the Media Streams claim: a
  -- reconnect or a second socket is refused rather than replayed.
  if a.stream_claimed_at is not null then
    raise exception using message = 'voice:admission_stream_already_claimed';
  end if;
  select * into s from core_v2_voice_private.core_v2_voice_admission_suites where suite_id = p_suite_id;
  update core_v2_voice_private.core_v2_voice_admission_calls
     set stream_claimed_at = clock_timestamp()
   where suite_id = p_suite_id and call_identity_digest = p_call_identity_digest;
  insert into core_v2_voice_private.core_v2_voice_relay_calls(
    call_identity_digest, suite_id, caller_app, tenant_id, state,
    maximum_turns, maximum_requests, maximum_characters,
    authorized_maximum, maximum_per_turn, deadline_at)
  values (
    p_call_identity_digest, p_suite_id, p_caller_app, p_tenant_id,
    jsonb_build_object('facts', '{}'::jsonb, 'factEvidence', '{}'::jsonb,
      'history', jsonb_build_array(jsonb_build_object(
        'revision', 0, 'role', 'assistant', 'text', p_greeting, 'delivery', 'submitted'))),
    (s.policy->>'maximumTurns')::integer,
    (s.policy->>'maximumBrainRequests')::integer,
    (s.policy->>'maximumTtsCharacters')::integer,
    p_authorized_maximum, p_maximum_per_turn, a.deadline_at);
  return jsonb_build_object('protocol', 'core-v2.voice-relay-session.1', 'claimed', true,
    'suiteId', p_suite_id, 'revision', 0,
    'deadlineMs', (extract(epoch from a.deadline_at) * 1000)::bigint,
    'maximumTurns', (s.policy->>'maximumTurns')::integer,
    'maximumCharacters', (s.policy->>'maximumTtsCharacters')::integer);
end $$;

create or replace function core_v2_voice_private.core_v2_voice_relay_begin_turn(
  p_caller_app text,
  p_tenant_id text,
  p_call_identity_digest text,
  p_request_id text,
  p_request_digest text,
  p_expected_revision bigint,
  p_utterance text,
  p_fact_patches jsonb,
  p_reserve_usd numeric,
  p_pricing jsonb,
  p_previous jsonb
) returns jsonb
language plpgsql security definer set search_path = pg_catalog as $$
declare
  c core_v2_voice_private.core_v2_voice_relay_calls;
  t core_v2_voice_private.core_v2_voice_relay_turns;
  v_revision bigint;
  v_state jsonb;
  v_key text;
  v_value jsonb;
begin
  if p_utterance is null or length(p_utterance) not between 1 and 4000
     or p_reserve_usd is null or p_reserve_usd < 0
     or jsonb_typeof(p_fact_patches) <> 'object' or jsonb_typeof(p_pricing) <> 'object' then
    raise exception using message = 'voice:bad_request';
  end if;
  select * into c from core_v2_voice_private.core_v2_voice_relay_calls
   where call_identity_digest = p_call_identity_digest for update;
  if not found then raise exception using message = 'voice:relay_session_not_found'; end if;
  if c.caller_app <> p_caller_app or c.tenant_id <> p_tenant_id then
    raise exception using message = 'voice:relay_session_not_found';
  end if;
  select * into t from core_v2_voice_private.core_v2_voice_relay_turns
   where call_identity_digest = p_call_identity_digest and request_id = p_request_id;
  if found then
    if t.request_digest <> p_request_digest then raise exception using message = 'voice:idempotency_conflict'; end if;
    -- A repeat never buys a second request. The caller learns what happened.
    return jsonb_build_object('repeated', true, 'revision', t.revision, 'moneyState', t.money_state,
      'replyState', t.reply_state);
  end if;
  if c.closed_at is not null then raise exception using message = 'voice:relay_closed'; end if;
  if clock_timestamp() >= c.deadline_at then raise exception using message = 'voice:relay_deadline'; end if;
  if c.revision <> p_expected_revision then raise exception using message = 'voice:stale_state'; end if;
  if exists (select 1 from core_v2_voice_private.core_v2_voice_relay_turns
              where call_identity_digest = p_call_identity_digest and money_state = 'reserved') then
    raise exception using message = 'voice:turn_in_progress';
  end if;
  perform core_v2_voice_private.core_v2_voice_relay_apply_delivery(p_call_identity_digest, p_previous);
  select * into c from core_v2_voice_private.core_v2_voice_relay_calls
   where call_identity_digest = p_call_identity_digest;
  if c.turns_used >= c.maximum_turns then raise exception using message = 'voice:turn_limit'; end if;
  if c.provider_requests >= c.maximum_requests then raise exception using message = 'voice:request_limit'; end if;
  if p_reserve_usd > c.maximum_per_turn
     or c.reserved + c.settled + c.held + p_reserve_usd > c.authorized_maximum then
    raise exception using message = 'voice:budget_exhausted';
  end if;

  v_revision := c.revision + 1;
  v_state := c.state;
  for v_key, v_value in select key, value from jsonb_each(p_fact_patches) loop
    if v_key !~ '^[A-Za-z][A-Za-z0-9]{0,40}$' or jsonb_typeof(v_value) not in ('string','number') then
      raise exception using message = 'voice:bad_request';
    end if;
    v_state := jsonb_set(v_state, array['factEvidence', v_key], jsonb_build_object(
      'entity', 'caller', 'scope', 'current', 'verification', 'caller_asserted',
      'sourceRequestId', p_request_id, 'revision', v_revision,
      'supersedesRevision', v_state->'factEvidence'->v_key->'revision',
      'supersededValue', v_state->'facts'->v_key));
    v_state := jsonb_set(v_state, array['facts', v_key], v_value);
  end loop;
  v_state := jsonb_set(v_state, '{history}', (
    select coalesce(jsonb_agg(entry order by ordinality), '[]'::jsonb) from (
      select entry, ordinality from jsonb_array_elements(
        (v_state->'history') || jsonb_build_array(jsonb_build_object(
          'revision', v_revision, 'role', 'user', 'text', p_utterance, 'delivery', 'received')))
        with ordinality as h(entry, ordinality)
      order by ordinality desc limit 40) kept));

  insert into core_v2_voice_private.core_v2_voice_relay_turns(
    call_identity_digest, revision, request_id, request_digest, reserved_usd, pricing)
  values (p_call_identity_digest, v_revision, p_request_id, p_request_digest, p_reserve_usd, p_pricing);
  update core_v2_voice_private.core_v2_voice_relay_calls
     set revision = v_revision, state = v_state,
         turns_used = turns_used + 1,
         provider_requests = provider_requests + 1,  -- counted before the request can leave
         reserved = reserved + p_reserve_usd,
         updated_at = clock_timestamp()
   where call_identity_digest = p_call_identity_digest;
  return jsonb_build_object('repeated', false, 'revision', v_revision,
    'deadlineMs', (extract(epoch from c.deadline_at) * 1000)::bigint,
    'state', jsonb_build_object('facts', v_state->'facts', 'factEvidence', v_state->'factEvidence',
      'history', v_state->'history'));
end $$;

create or replace function core_v2_voice_private.core_v2_voice_relay_complete_turn(
  p_call_identity_digest text,
  p_request_id text,
  p_money_state text,
  p_settled_usd numeric,
  p_raw_usage jsonb,
  p_reply_state text,
  p_reply_text text,
  p_diagnostics jsonb
) returns jsonb
language plpgsql security definer set search_path = pg_catalog as $$
declare
  c core_v2_voice_private.core_v2_voice_relay_calls;
  t core_v2_voice_private.core_v2_voice_relay_turns;
  v_reply_state text := p_reply_state;
  v_diagnostics jsonb := coalesce(p_diagnostics, '{}'::jsonb);
begin
  if p_money_state not in ('settled','released','held')
     or p_reply_state not in ('prepared','withheld','none')
     or (p_money_state = 'settled') <> (p_settled_usd is not null and p_raw_usage is not null)
     or (p_settled_usd is not null and p_settled_usd < 0)
     or (p_reply_state = 'prepared') <> (p_reply_text is not null)
     or (p_reply_state = 'prepared' and p_money_state <> 'settled')
     or jsonb_typeof(v_diagnostics) <> 'object' then
    raise exception using message = 'voice:bad_request';
  end if;
  select * into c from core_v2_voice_private.core_v2_voice_relay_calls
   where call_identity_digest = p_call_identity_digest for update;
  if not found then raise exception using message = 'voice:relay_session_not_found'; end if;
  select * into t from core_v2_voice_private.core_v2_voice_relay_turns
   where call_identity_digest = p_call_identity_digest and request_id = p_request_id for update;
  if not found or t.money_state <> 'reserved' then raise exception using message = 'voice:turn_not_reserved'; end if;
  -- Accounting stays available after close or deadline; speech does not.
  if v_reply_state = 'prepared' and (c.closed_at is not null or clock_timestamp() >= c.deadline_at) then
    v_reply_state := 'withheld';
    v_diagnostics := v_diagnostics || jsonb_build_object('withheldBecause', 'call_closed');
  elsif v_reply_state = 'prepared' and c.characters_used + length(p_reply_text) > c.maximum_characters then
    v_reply_state := 'withheld';
    v_diagnostics := v_diagnostics || jsonb_build_object('withheldBecause', 'character_limit');
  end if;
  if p_money_state = 'settled' and p_settled_usd > t.reserved_usd then
    v_diagnostics := v_diagnostics || jsonb_build_object('settledAboveReservation', true);
  end if;
  update core_v2_voice_private.core_v2_voice_relay_turns
     set money_state = p_money_state, settled_usd = p_settled_usd, raw_usage = p_raw_usage,
         reply_state = v_reply_state,
         reply_text = case when v_reply_state = 'prepared' then p_reply_text else null end,
         delivery = case when v_reply_state = 'prepared' then 'pending' else 'discarded' end,
         diagnostics = v_diagnostics, updated_at = clock_timestamp()
   where call_identity_digest = p_call_identity_digest and revision = t.revision;
  update core_v2_voice_private.core_v2_voice_relay_calls
     set reserved = reserved - t.reserved_usd,
         settled = settled + case when p_money_state = 'settled' then p_settled_usd else 0 end,
         held = held + case when p_money_state = 'held' then t.reserved_usd else 0 end,
         characters_used = characters_used + case when v_reply_state = 'prepared' then length(p_reply_text) else 0 end,
         state = case when v_reply_state = 'prepared' then jsonb_set(state, '{history}',
           (state->'history') || jsonb_build_array(jsonb_build_object('revision', t.revision,
             'role', 'assistant', 'text', p_reply_text, 'delivery', 'pending'))) else state end,
         updated_at = clock_timestamp()
   where call_identity_digest = p_call_identity_digest;
  return jsonb_build_object('revision', t.revision, 'moneyState', p_money_state, 'replyState', v_reply_state,
    'replyText', case when v_reply_state = 'prepared' then to_jsonb(p_reply_text) else 'null'::jsonb end,
    'withheldBecause', v_diagnostics->'withheldBecause');
end $$;

create or replace function core_v2_voice_private.core_v2_voice_relay_close(
  p_caller_app text,
  p_tenant_id text,
  p_call_identity_digest text,
  p_reason text,
  p_previous jsonb
) returns jsonb
language plpgsql security definer set search_path = pg_catalog as $$
declare c core_v2_voice_private.core_v2_voice_relay_calls;
begin
  if p_reason !~ '^[a-z_]{1,64}$' then raise exception using message = 'voice:bad_request'; end if;
  select * into c from core_v2_voice_private.core_v2_voice_relay_calls
   where call_identity_digest = p_call_identity_digest for update;
  if not found or c.caller_app <> p_caller_app or c.tenant_id <> p_tenant_id then
    raise exception using message = 'voice:relay_session_not_found';
  end if;
  if c.closed_at is null then
    perform core_v2_voice_private.core_v2_voice_relay_apply_delivery(p_call_identity_digest, p_previous);
    update core_v2_voice_private.core_v2_voice_relay_calls
       set closed_at = clock_timestamp(), close_reason = p_reason, updated_at = clock_timestamp()
     where call_identity_digest = p_call_identity_digest
     returning * into c;
  end if;
  return jsonb_build_object('closed', true, 'reason', c.close_reason, 'turns', c.turns_used,
    'providerRequests', c.provider_requests, 'reservedUsd', c.reserved, 'settledUsd', c.settled,
    'heldUsd', c.held);
end $$;

revoke all on function core_v2_voice_private.core_v2_voice_relay_apply_delivery(text,jsonb) from public, anon, authenticated, service_role;
revoke all on function core_v2_voice_private.core_v2_voice_relay_claim_session(text,text,text,text,numeric,numeric,text) from public, anon, authenticated, service_role;
revoke all on function core_v2_voice_private.core_v2_voice_relay_begin_turn(text,text,text,text,text,bigint,text,jsonb,numeric,jsonb,jsonb) from public, anon, authenticated, service_role;
revoke all on function core_v2_voice_private.core_v2_voice_relay_complete_turn(text,text,text,numeric,jsonb,text,text,jsonb) from public, anon, authenticated, service_role;
revoke all on function core_v2_voice_private.core_v2_voice_relay_close(text,text,text,text,jsonb) from public, anon, authenticated, service_role;

grant execute on function core_v2_voice_private.core_v2_voice_relay_claim_session(text,text,text,text,numeric,numeric,text) to core_v2_voice_runtime;
grant execute on function core_v2_voice_private.core_v2_voice_relay_begin_turn(text,text,text,text,text,bigint,text,jsonb,numeric,jsonb,jsonb) to core_v2_voice_runtime;
grant execute on function core_v2_voice_private.core_v2_voice_relay_complete_turn(text,text,text,numeric,jsonb,text,text,jsonb) to core_v2_voice_runtime;
grant execute on function core_v2_voice_private.core_v2_voice_relay_close(text,text,text,text,jsonb) to core_v2_voice_runtime;
