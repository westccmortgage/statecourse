-- Additive security boundary. Existing staff_actor_binding_events remains the
-- sole authority ledger. No student, reviewer or email-derived grants.
begin;
create schema if not exists statecourse_staff_private;
revoke all on schema statecourse_staff_private from public, anon, authenticated;
create table statecourse_staff_private.proofs (
  proof_hash text primary key check (proof_hash ~ '^[0-9a-f]{64}$'),
  user_id uuid not null, session_id uuid not null, factor_id uuid not null,
  bindings jsonb not null, issued_at timestamptz not null default clock_timestamp(),
  expires_at timestamptz not null default clock_timestamp()+interval '15 minutes',
  last_seen_at timestamptz not null default clock_timestamp(), revoked_at timestamptz
);
create table statecourse_staff_private.actions (
  action_hash text primary key, proof_hash text not null references statecourse_staff_private.proofs,
  intent text not null, expires_at timestamptz not null default clock_timestamp()+interval '90 seconds',
  used_at timestamptz
);
create table statecourse_staff_private.owner_tickets (
  ticket_hash text primary key, proof_hash text not null references statecourse_staff_private.proofs,
  context jsonb not null, expires_at timestamptz not null default clock_timestamp()+interval '120 seconds',
  used_at timestamptz
);
create table statecourse_staff_private.enrollments (
  user_id uuid not null, session_id uuid not null, factor_id uuid primary key,
  expires_at timestamptz not null default clock_timestamp()+interval '5 minutes'
);
alter table statecourse_staff_private.enrollments enable row level security;
create table statecourse_staff_private.rate_buckets (
  bucket_key text primary key, starts_at timestamptz not null, attempts integer not null
);
create table statecourse_staff_private.audit_events (
  id bigint generated always as identity primary key, occurred_at timestamptz not null default clock_timestamp(),
  user_id uuid, session_id uuid, event text not null, outcome text not null,
  intent text, detail jsonb not null default '{}'
);
alter table statecourse_staff_private.proofs enable row level security;
alter table statecourse_staff_private.actions enable row level security;
alter table statecourse_staff_private.owner_tickets enable row level security;
alter table statecourse_staff_private.rate_buckets enable row level security;
alter table statecourse_staff_private.audit_events enable row level security;
revoke all on all tables in schema statecourse_staff_private from public, anon, authenticated;

create function statecourse_staff_private.bindings_for(actor uuid) returns jsonb
language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_agg(to_jsonb(b) order by b.actor_role),'[]'::jsonb)
  from public.current_staff_actor_bindings b
  where b.auth_user_id=actor and b.binding_status='active'
    and b.actor_role in ('owner','administrator','instructor','video_producer','support')
    and (b.effective_at is null or b.effective_at<=statement_timestamp())
    and (b.expires_at is null or b.expires_at>statement_timestamp());
$$;
create function statecourse_staff_private.session_active(actor uuid, sid uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from auth.sessions s join auth.users u on u.id=s.user_id
    where s.id=sid and s.user_id=actor and u.email_confirmed_at is not null
    and u.deleted_at is null and (u.banned_until is null or u.banned_until<=statement_timestamp())
    and (s.not_after is null or s.not_after>statement_timestamp()));
$$;
create function statecourse_staff_private.proof_active(p statecourse_staff_private.proofs) returns boolean
language sql stable security definer set search_path='' as $$
  select p.revoked_at is null and p.expires_at>statement_timestamp()
    and p.last_seen_at>statement_timestamp()-interval '5 minutes'
    and p.bindings<>'[]'::jsonb and p.bindings=statecourse_staff_private.bindings_for(p.user_id)
    and statecourse_staff_private.session_active(p.user_id,p.session_id)
    and exists(select 1 from auth.mfa_factors f where f.id=p.factor_id and f.user_id=p.user_id
      and f.status::text='verified' and f.factor_type::text='totp');
$$;

create function public.statecourse_staff_security(op text, payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; sid uuid; bindings jsonb; p statecourse_staff_private.proofs;
  bucket statecourse_staff_private.rate_buckets; allowed boolean; owner_context jsonb;
begin
  -- Only service_role can EXECUTE this function. No browser key or role input is authority.
  if op='rate' then
    if coalesce(payload->>'key','') !~ '^[0-9a-f]{64}$' then raise exception 'invalid bucket'; end if;
    insert into statecourse_staff_private.rate_buckets(bucket_key,starts_at,attempts)
      values(payload->>'key',clock_timestamp(),1)
    on conflict(bucket_key) do update set
      attempts=case when statecourse_staff_private.rate_buckets.starts_at<clock_timestamp()-interval '5 minutes'
        then 1 else statecourse_staff_private.rate_buckets.attempts+1 end,
      starts_at=case when statecourse_staff_private.rate_buckets.starts_at<clock_timestamp()-interval '5 minutes'
        then clock_timestamp() else statecourse_staff_private.rate_buckets.starts_at end
    returning * into bucket;
    allowed:=bucket.attempts<=least(greatest((payload->>'limit')::int,1),240);
    if not allowed then
      insert into statecourse_staff_private.audit_events(event,outcome) values('admin_rate_limit','denied');
    end if;
    return jsonb_build_object('ok',allowed,'error','admin_rate_limited','status',429);
  end if;
  actor:=(payload->>'user_id')::uuid; sid:=(payload->>'session_id')::uuid;
  if op='audit' then
    insert into statecourse_staff_private.audit_events(user_id,event,outcome)
      values(actor,left(payload->>'event',80),left(payload->>'outcome',40));
    return '{"ok":true}'::jsonb;
  end if;
  if op='revoke' then
    update statecourse_staff_private.proofs set revoked_at=clock_timestamp() where proof_hash=payload->>'proof_hash';
    insert into statecourse_staff_private.audit_events(event,outcome) values('admin_logout','revoked');
    return '{"ok":true}'::jsonb;
  end if;
  bindings:=statecourse_staff_private.bindings_for(actor);
  if bindings='[]'::jsonb or not statecourse_staff_private.session_active(actor,sid) then
    insert into statecourse_staff_private.audit_events(user_id,session_id,event,outcome)
      values(actor,sid,'admin_authority','denied');
    return '{"ok":false,"error":"active_staff_session_required","status":403}'::jsonb;
  end if;
  if op='context' then return jsonb_build_object('ok',true,'bindings',bindings); end if;
  if op in ('enrollment_begin','enrollment_check') then
    if exists(select 1 from auth.mfa_factors f where f.user_id=actor and f.status::text='verified')
      or not exists(select 1 from auth.mfa_factors f where f.user_id=actor and f.id=(payload->>'factor_id')::uuid and f.status::text='unverified' and f.factor_type::text='totp')
      then return '{"ok":false,"error":"initial_mfa_enrollment_required","status":403}'::jsonb; end if;
    if op='enrollment_begin' then
      insert into statecourse_staff_private.enrollments(user_id,session_id,factor_id) values(actor,sid,(payload->>'factor_id')::uuid);
      return '{"ok":true}'::jsonb;
    end if;
    if not exists(select 1 from statecourse_staff_private.enrollments e where e.user_id=actor and e.session_id=sid and e.factor_id=(payload->>'factor_id')::uuid and e.expires_at>clock_timestamp())
      then return '{"ok":false,"error":"mfa_enrollment_session_required","status":403}'::jsonb; end if;
    return '{"ok":true}'::jsonb;
  end if;
  if op='mint' then
    if payload->>'aal' is distinct from 'aal2' or not exists(select 1 from auth.mfa_factors f
      where f.id=(payload->>'factor_id')::uuid and f.user_id=actor and f.status::text='verified' and f.factor_type::text='totp')
      then return '{"ok":false,"error":"verified_mfa_required","status":403}'::jsonb; end if;
    -- A fresh verify call by the server is required before invoking mint.
    update statecourse_staff_private.proofs set revoked_at=clock_timestamp() where user_id=actor and session_id=sid;
    insert into statecourse_staff_private.proofs(proof_hash,user_id,session_id,factor_id,bindings)
      values(payload->>'proof_hash',actor,sid,(payload->>'factor_id')::uuid,bindings);
    if payload ? 'intent' then
      if payload->>'intent' !~ '^[0-9a-f]{64}$' or payload->>'action_hash' !~ '^[0-9a-f]{64}$' then raise exception 'invalid action'; end if;
      insert into statecourse_staff_private.actions(action_hash,proof_hash,intent)
        values(payload->>'action_hash',payload->>'proof_hash',payload->>'intent');
    end if;
    if payload ? 'owner_ticket_hash' then
      owner_context:=payload->'owner_connect';
      if not exists(select 1 from jsonb_array_elements(bindings) b where b->>'actor_role'='owner' and b->>'scope_state' is null)
        or owner_context->>'client_id' is distinct from 'sc_prod_0ffa33db-cbe6-4985-b068-ac8398582ed8'
        or owner_context->>'agent_id' is distinct from 'agent_49a84ffe9474417885d19e4b1dab410f1734218fc37c444a9e'
        or owner_context->>'vault_id' is distinct from 'vault_107d569388134c558ebb932e2dcacff9ad46674d3bb44cb19b'
        or coalesce(owner_context->>'nonce','') !~ '^[A-Za-z0-9_-]{43}$'
        or coalesce(owner_context->>'code_challenge','') !~ '^[A-Za-z0-9_-]{43}$'
        or not (owner_context ?& array['client_id','agent_id','vault_id','nonce','code_challenge'])
        then raise exception 'invalid owner connection'; end if;
      insert into statecourse_staff_private.owner_tickets(ticket_hash,proof_hash,context)
        values(payload->>'owner_ticket_hash',payload->>'proof_hash',owner_context);
    end if;
    insert into statecourse_staff_private.audit_events(user_id,session_id,event,outcome,intent)
      values(actor,sid,'admin_step_up','granted',payload->>'intent');
    return '{"ok":true}'::jsonb;
  end if;
  if op='check' then
    select * into p from statecourse_staff_private.proofs where proof_hash=payload->>'proof_hash' for update;
    if p.proof_hash is null or p.user_id<>actor or p.session_id<>sid or not statecourse_staff_private.proof_active(p) then
      insert into statecourse_staff_private.audit_events(user_id,session_id,event,outcome) values(actor,sid,'admin_proof','denied');
      return '{"ok":false,"error":"staff_step_up_required","status":403}'::jsonb;
    end if;
    if payload->>'intent' is not null then
      update statecourse_staff_private.actions set used_at=clock_timestamp()
        where action_hash=payload->>'action_hash' and proof_hash=p.proof_hash
          and intent=payload->>'intent' and used_at is null and expires_at>clock_timestamp();
      if not found then
        insert into statecourse_staff_private.audit_events(user_id,session_id,event,outcome,intent)
          values(actor,sid,'admin_action','fresh_step_up_required',payload->>'intent');
        return '{"ok":false,"error":"fresh_action_authorization_required","status":403}'::jsonb;
      end if;
      -- Durable audit commits before the API carries out the authorized operation.
      insert into statecourse_staff_private.audit_events(user_id,session_id,event,outcome,intent)
        values(actor,sid,'admin_action','authorized',payload->>'intent');
    end if;
    update statecourse_staff_private.proofs set last_seen_at=clock_timestamp() where proof_hash=p.proof_hash;
    return jsonb_build_object('ok',true,'expires_at',p.expires_at);
  end if;
  raise exception 'unknown staff operation';
end $$;
revoke all on all functions in schema statecourse_staff_private from public,anon,authenticated;
revoke all on function public.statecourse_staff_security(text,jsonb) from public,anon,authenticated;
grant execute on function public.statecourse_staff_security(text,jsonb) to service_role;
commit;
