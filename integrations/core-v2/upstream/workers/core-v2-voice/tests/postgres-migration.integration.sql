\set ON_ERROR_STOP on

do $$
declare
  v_session_id constant text := 'voice_0123456789abcdef0123456789abcdef';
  initial_state constant jsonb := '{"protocol":"core-v2.voice-turn.1","sessionId":"voice_0123456789abcdef0123456789abcdef","revision":0,"owner":{},"facts":{},"recentTurns":[]}';
  policy constant jsonb := '{"currency":"USD","authorizedMaximumUsd":1,"maximumPerTurnUsd":0.1,"maximumProviderCallsPerTurn":2,"maximumProviderCallsPerCall":1,"maximumTurnsPerCall":60,"maximumInputTokensPerTurn":8000,"maximumOutputTokensPerTurn":400,"maximumInputTokensPerCall":8000,"maximumOutputTokensPerCall":400,"maximumReasoningTokensPerCall":400,"wallClockDeadlineMs":1200000}';
  pricing constant jsonb := '{"providerId":"fixture","model":"fixture","currency":"USD","effectiveFrom":"1970-01-01","inputPerMillionTokens":0,"outputPerMillionTokens":0,"cachedInputPerMillionTokens":0,"cacheWritePerMillionTokens":0,"reasoningPerMillionTokens":0,"maximumInputTokens":0,"maximumOutputTokens":0,"maximumReasoningTokens":0,"ceilingRule":"fixture"}';
  admission_policy constant jsonb := '{"protocol":"core-v2.voice-admission-policy.1","suiteId":"runtime-turn-1","ownerIdentityDigest":"dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd","expiresAt":"2099-01-01T00:00:00.000Z","maximumCalls":1,"maximumVoiceWebhooks":2,"maximumCallSeconds":120,"maximumTurns":6,"maximumBrainRequests":6,"maximumTtsCharacters":8000}';
  first_claim jsonb;
  second_claim jsonb;
  first_token uuid;
  second_token uuid;
  reservation jsonb;
begin
  perform core_v2_voice_private.core_v2_voice_claim_admission(
    'runtime-turn-1', repeat('d', 64), repeat('a', 64), admission_policy);
  perform core_v2_voice_private.core_v2_voice_claim_admission_stream(
    'runtime-turn-1', repeat('a', 64));
  first_claim := core_v2_voice_private.core_v2_voice_claim_turn(
    v_session_id, 'test-caller', 'test-tenant', repeat('a', 64),
    'request-fenced', 'turn-fenced', repeat('b', 64), 0, 'en', initial_state, 5);
  first_token := (first_claim->>'claimToken')::uuid;
  update core_v2_voice_private.core_v2_voice_turns set lease_expires_at = now() - interval '1 second'
   where core_v2_voice_turns.session_id = v_session_id and request_id = 'request-fenced';
  second_claim := core_v2_voice_private.core_v2_voice_claim_turn(
    v_session_id, 'test-caller', 'test-tenant', repeat('a', 64),
    'request-fenced', 'turn-fenced', repeat('b', 64), 0, 'en', initial_state, 5);
  second_token := (second_claim->>'claimToken')::uuid;
  if first_token = second_token then raise exception 'lease reclaim did not rotate fencing token'; end if;

  begin
    perform core_v2_voice_private.core_v2_voice_reserve_budget(
      v_session_id, 'request-fenced', 'propose', first_token, 0.01, policy, pricing);
    raise exception 'stale claimant acquired provider reservation';
  exception when others then
    if sqlerrm not like '%voice:claim_fenced%' then raise; end if;
  end;

  reservation := core_v2_voice_private.core_v2_voice_reserve_budget(
    v_session_id, 'request-fenced', 'propose', second_token, 0.01, policy, pricing);
  begin
    perform core_v2_voice_private.core_v2_voice_reserve_budget(
      v_session_id, 'request-fenced', 'propose', second_token, 0.01, policy, pricing);
    raise exception 'existing reservation permitted a second acquisition';
  exception when others then
    if sqlerrm not like '%voice:reservation_already_acquired%' then raise; end if;
  end;

  perform core_v2_voice_private.core_v2_voice_settle_budget(
    (reservation->>'reservation_id')::uuid, 0.001,
    '{"input_tokens":10,"output_tokens":10}',
    '{"version":"core-v2.usage.1","providerId":"fixture","complete":true}');
  begin
    perform core_v2_voice_private.core_v2_voice_reserve_budget(
      v_session_id, 'request-fenced', 'finalize', second_token, 0.01, policy, pricing);
    raise exception 'whole-call provider request ceiling was not enforced';
  exception when others then
    if sqlerrm not like '%voice:budget_not_authorized%' then raise; end if;
  end;
  update core_v2_voice_private.core_v2_voice_admission_calls
     set answered_at = now() - interval '3 seconds',
         stream_claimed_at = now() - interval '2 seconds',
         deadline_at = now() - interval '1 second'
   where call_identity_digest = repeat('a', 64);
  begin
    perform core_v2_voice_private.core_v2_voice_reserve_budget(
      v_session_id, 'request-fenced', 'finalize', second_token, 0.01, policy, pricing);
    raise exception 'expired admission reached provider reservation';
  exception when others then
    if sqlerrm not like '%voice:admission_not_active%' then raise; end if;
  end;
  if not exists (
    select 1 from core_v2_voice_private.core_v2_voice_budget_reservations
     where reservation_id = (reservation->>'reservation_id')::uuid
       and state = 'settled' and pricing_snapshot = pricing
       and raw_usage is not null and normalized_usage is not null
  ) then raise exception 'pricing/usage audit was not durably stored'; end if;
end $$;

do $$
declare
  v_session_id constant text := 'voice_22222222222222222222222222222222';
  initial_state constant jsonb := '{"protocol":"core-v2.voice-turn.1","sessionId":"voice_22222222222222222222222222222222","revision":0,"owner":{},"facts":{},"recentTurns":[]}';
  budget_policy constant jsonb := '{"currency":"USD","authorizedMaximumUsd":1,"maximumPerTurnUsd":0.1,"maximumProviderCallsPerTurn":2,"maximumProviderCallsPerCall":1,"maximumTurnsPerCall":1,"maximumInputTokensPerTurn":8000,"maximumOutputTokensPerTurn":400,"maximumInputTokensPerCall":8000,"maximumOutputTokensPerCall":400,"maximumReasoningTokensPerCall":400,"wallClockDeadlineMs":1200000}';
  pricing constant jsonb := '{"providerId":"fixture","model":"fixture","currency":"USD","effectiveFrom":"1970-01-01","inputPerMillionTokens":0,"outputPerMillionTokens":0,"cachedInputPerMillionTokens":0,"cacheWritePerMillionTokens":0,"reasoningPerMillionTokens":0,"maximumInputTokens":0,"maximumOutputTokens":0,"maximumReasoningTokens":0,"ceilingRule":"fixture"}';
  admission_policy constant jsonb := '{"protocol":"core-v2.voice-admission-policy.1","suiteId":"released-request-cap","ownerIdentityDigest":"1111111111111111111111111111111111111111111111111111111111111111","expiresAt":"2099-01-01T00:00:00.000Z","maximumCalls":1,"maximumVoiceWebhooks":1,"maximumCallSeconds":120,"maximumTurns":1,"maximumBrainRequests":1,"maximumTtsCharacters":8000}';
  claim jsonb;
  reservation jsonb;
begin
  perform core_v2_voice_private.core_v2_voice_claim_admission(
    'released-request-cap', repeat('1', 64), repeat('2', 64), admission_policy);
  perform core_v2_voice_private.core_v2_voice_claim_admission_stream(
    'released-request-cap', repeat('2', 64));
  claim := core_v2_voice_private.core_v2_voice_claim_turn(
    v_session_id, 'test-caller', 'test-tenant', repeat('2', 64),
    'request-released', 'turn-released', repeat('3', 64), 0, 'en', initial_state, 5);
  reservation := core_v2_voice_private.core_v2_voice_reserve_budget(
    v_session_id, 'request-released', 'propose', (claim->>'claimToken')::uuid,
    0.01, budget_policy, pricing);
  perform core_v2_voice_private.core_v2_voice_release_budget(
    (reservation->>'reservation_id')::uuid, 'confirmed not submitted');
  begin
    perform core_v2_voice_private.core_v2_voice_reserve_budget(
      v_session_id, 'request-released', 'finalize', (claim->>'claimToken')::uuid,
      0.01, budget_policy, pricing);
    raise exception 'released reservation restored the total provider request ceiling';
  exception when others then
    if sqlerrm not like '%voice:budget_not_authorized%' then raise; end if;
  end;
end $$;

do $$
declare
  state_template jsonb;
  policy_one_request constant jsonb := '{"protocol":"core-v2.voice-admission-policy.1","suiteId":"request-cap-1","ownerIdentityDigest":"eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee","expiresAt":"2099-01-01T00:00:00.000Z","maximumCalls":1,"maximumVoiceWebhooks":1,"maximumCallSeconds":120,"maximumTurns":2,"maximumBrainRequests":1,"maximumTtsCharacters":8000}';
  claim jsonb;
begin
  begin
    perform core_v2_voice_private.core_v2_voice_claim_admission(
      'missing-fields', repeat('f', 64), repeat('9', 64),
      '{"protocol":"core-v2.voice-admission-policy.1","suiteId":"missing-fields","ownerIdentityDigest":"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"}'::jsonb);
    raise exception 'nullable policy fields bypassed validation';
  exception when others then
    if sqlerrm not like '%voice:admission_policy_invalid%' then raise; end if;
  end;

  state_template := '{"protocol":"core-v2.voice-turn.1","sessionId":"voice_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee","revision":0,"owner":{},"facts":{},"recentTurns":[]}';
  begin
    perform core_v2_voice_private.core_v2_voice_claim_turn(
      'voice_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 'test-caller', 'test-tenant', repeat('8', 64),
      'request-bypass', 'turn-bypass', repeat('7', 64), 0, 'en', state_template, 5);
    raise exception 'unadmitted call reached the turn boundary';
  exception when others then
    if sqlerrm not like '%voice:admission_not_active%' then raise; end if;
  end;

  perform core_v2_voice_private.core_v2_voice_claim_admission(
    'request-cap-1', repeat('e', 64), repeat('6', 64), policy_one_request);
  perform core_v2_voice_private.core_v2_voice_claim_admission_stream('request-cap-1', repeat('6', 64));
  state_template := jsonb_set(state_template, '{sessionId}', '"voice_66666666666666666666666666666666"');
  claim := core_v2_voice_private.core_v2_voice_claim_turn(
    'voice_66666666666666666666666666666666', 'test-caller', 'test-tenant', repeat('6', 64),
    'request-cap-a', 'turn-cap-a', repeat('5', 64), 0, 'en', state_template, 5);
  perform core_v2_voice_private.core_v2_voice_abort_turn(
    'voice_66666666666666666666666666666666', 'test-caller', 'test-tenant', repeat('6', 64),
    'request-cap-a', (claim->>'claimToken')::uuid);
  begin
    perform core_v2_voice_private.core_v2_voice_claim_turn(
      'voice_66666666666666666666666666666666', 'test-caller', 'test-tenant', repeat('6', 64),
      'request-cap-b', 'turn-cap-b', repeat('4', 64), 0, 'en', state_template, 5);
    raise exception 'durable Core request ceiling reset after abort';
  exception when others then
    if sqlerrm not like '%voice:admission_brain_limit%' then raise; end if;
  end;
end $$;

do $$
declare
  admission_policy constant jsonb := '{"protocol":"core-v2.voice-admission-policy.1","suiteId":"owner-call-1","ownerIdentityDigest":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","expiresAt":"2099-01-01T00:00:00.000Z","maximumCalls":1,"maximumVoiceWebhooks":3,"maximumCallSeconds":120,"maximumTurns":6,"maximumBrainRequests":12,"maximumTtsCharacters":8000}';
  first_lease jsonb;
  repeated_lease jsonb;
begin
  first_lease := core_v2_voice_private.core_v2_voice_claim_admission(
    'owner-call-1', repeat('a', 64), repeat('b', 64), admission_policy);
  repeated_lease := core_v2_voice_private.core_v2_voice_claim_admission(
    'owner-call-1', repeat('a', 64), repeat('b', 64), admission_policy);
  if (first_lease->>'answeredAtMs') <> (repeated_lease->>'answeredAtMs')
     or (repeated_lease->>'repeated')::boolean is not true then
    raise exception 'webhook replay reset or failed to identify the durable lease';
  end if;
  begin
    perform core_v2_voice_private.core_v2_voice_claim_admission(
      'owner-call-1', repeat('a', 64), repeat('c', 64), admission_policy);
    raise exception 'suite admitted more than its maximum calls';
  exception when others then
    if sqlerrm not like '%voice:admission_call_limit%' then raise; end if;
  end;
  perform core_v2_voice_private.core_v2_voice_claim_admission_stream(
    'owner-call-1', repeat('b', 64));
  begin
    perform core_v2_voice_private.core_v2_voice_claim_admission_stream(
      'owner-call-1', repeat('b', 64));
    raise exception 'a second media stream acquired the paid-work lease';
  exception when others then
    if sqlerrm not like '%voice:admission_stream_already_claimed%' then raise; end if;
  end;
  begin
    perform core_v2_voice_private.core_v2_voice_claim_admission(
      'owner-call-1', repeat('d', 64), repeat('b', 64),
      jsonb_set(admission_policy, '{ownerIdentityDigest}', to_jsonb(repeat('d', 64))));
    raise exception 'suite owner changed';
  exception when others then
    if sqlerrm not like '%voice:admission_policy_changed%' then raise; end if;
  end;
end $$;

do $$
declare runtime_role pg_catalog.pg_roles;
begin
  select * into runtime_role from pg_catalog.pg_roles where rolname = 'core_v2_voice_runtime';
  if not found or runtime_role.rolcanlogin or runtime_role.rolsuper
     or runtime_role.rolcreatedb or runtime_role.rolcreaterole
     or runtime_role.rolreplication or runtime_role.rolbypassrls
     or not runtime_role.rolinherit then
    raise exception 'runtime role capabilities are not least privilege';
  end if;
  if has_table_privilege('core_v2_voice_runtime', 'core_v2_voice_private.core_v2_voice_sessions', 'select') then
    raise exception 'runtime role unexpectedly has direct table access';
  end if;
  if has_table_privilege('core_v2_voice_runtime', 'core_v2_voice_private.core_v2_voice_admission_calls', 'select') then
    raise exception 'runtime role unexpectedly has direct admission table access';
  end if;
  if not has_function_privilege('core_v2_voice_runtime',
    'core_v2_voice_private.core_v2_voice_claim_turn(text,text,text,text,text,text,text,bigint,text,jsonb,integer)', 'execute') then
    raise exception 'runtime role lacks required function execute grant';
  end if;
  if not has_function_privilege('core_v2_voice_runtime',
    'core_v2_voice_private.core_v2_voice_claim_admission(text,text,text,jsonb)', 'execute')
     or not has_function_privilege('core_v2_voice_runtime',
    'core_v2_voice_private.core_v2_voice_claim_admission_stream(text,text)', 'execute') then
    raise exception 'runtime role lacks admission function grants';
  end if;
  if has_function_privilege('service_role',
    'core_v2_voice_private.core_v2_voice_claim_turn(text,text,text,text,text,text,text,bigint,text,jsonb,integer)', 'execute') then
    raise exception 'service_role unexpectedly has voice function access';
  end if;
end $$;
