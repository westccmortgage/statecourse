-- Apply after 028 and the existing production StateCourse AI MCP adapter.
-- This RPC accepts only the existing MCP backend credential, never a client role.
begin;
create function public.statecourse_owner_oauth_authority(op text, payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare t statecourse_staff_private.owner_tickets; p statecourse_staff_private.proofs;
  b jsonb; rate jsonb; now_seconds bigint;
begin
  perform statecourse_ai_private.assert_backend_key();
  if op<>'consume_owner_approval' then raise exception 'invalid authority operation'; end if;
  rate:=public.statecourse_staff_security('rate',jsonb_build_object('key',
    encode(sha256(convert_to('owner-oauth:'||coalesce(payload->>'user_id',''),'UTF8')),'hex'),'limit',8));
  if not (rate->>'ok')::boolean then return rate; end if;
  select * into t from statecourse_staff_private.owner_tickets where ticket_hash=payload->>'ticket_hash' for update;
  if t.ticket_hash is not null then
    select * into p from statecourse_staff_private.proofs where proof_hash=t.proof_hash for update;
  end if;
  if t.ticket_hash is null or t.used_at is not null or t.expires_at<=clock_timestamp()
    or p.proof_hash is null or p.user_id::text is distinct from payload->>'user_id'
    or not statecourse_staff_private.proof_active(p)
    or p.issued_at<clock_timestamp()-interval '120 seconds'
    or t.context is distinct from payload->'context'
    or t.context->>'client_id' is distinct from payload->>'client_id'
    or payload->>'resource' is distinct from 'https://statecourse-ai-beta.netlify.app'
    then
      insert into statecourse_staff_private.audit_events(event,outcome) values('owner_oauth_connect','denied');
      return '{"ok":false,"error":"server_owner_authority_required","status":403}'::jsonb;
  end if;
  b:=statecourse_staff_private.bindings_for(p.user_id);
  if not exists(select 1 from jsonb_array_elements(b) x where x->>'actor_role'='owner' and x->>'scope_state' is null) then
    return '{"ok":false,"error":"server_owner_authority_required","status":403}'::jsonb;
  end if;
  update statecourse_staff_private.owner_tickets set used_at=clock_timestamp() where ticket_hash=t.ticket_hash;
  insert into statecourse_staff_private.audit_events(user_id,session_id,event,outcome)
    values(p.user_id,p.session_id,'owner_oauth_connect','authorized');
  now_seconds:=floor(extract(epoch from clock_timestamp()));
  return jsonb_build_object('ok',true,'sub',p.user_id,'role','owner','scope','global',
    'authority_source','current_staff_actor_bindings','authority_verified',true,'session_verified',true,
    'mfa_verified',true,'mfa_verified_at',floor(extract(epoch from p.issued_at)),
    'verified_at',now_seconds,'expires_at',floor(extract(epoch from t.expires_at)),
    'issuer','https://statecourse-ai-beta.netlify.app','resource',payload->>'resource',
    'client_id',payload->>'client_id','context',t.context);
end $$;
revoke all on function public.statecourse_owner_oauth_authority(text,jsonb) from public,anon,authenticated;
-- The existing production MCP adapter uses a publishable API key plus its
-- functions-only backend credential. assert_backend_key remains mandatory.
grant execute on function public.statecourse_owner_oauth_authority(text,jsonb) to anon,authenticated,service_role;
commit;
