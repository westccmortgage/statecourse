begin;

create table if not exists public.ai_plans (
  plan_key text primary key,
  tier text not null check (tier in ('pro','provider','founding_provider')),
  billing_interval text not null check (billing_interval in ('month','year')),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd' check (currency = 'usd'),
  stripe_product_id_test text not null,
  stripe_price_id_test text not null unique,
  stripe_product_id_live text not null,
  stripe_price_id_live text not null unique,
  founding_limit integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((tier = 'founding_provider' and founding_limit = 10) or (tier <> 'founding_provider' and founding_limit is null))
);

create table if not exists public.ai_checkout_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  plan_key text not null references public.ai_plans(plan_key),
  stripe_mode text not null check (stripe_mode in ('test','live')),
  stripe_checkout_session_id text unique,
  stripe_subscription_id text,
  status text not null default 'creating',
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ai_checkout_attempts_student_idx on public.ai_checkout_attempts(student_id, created_at desc);

create table if not exists public.ai_subscriptions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  plan_key text not null references public.ai_plans(plan_key),
  stripe_mode text not null check (stripe_mode in ('test','live')),
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  stripe_price_id text not null,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  last_stripe_event_created bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ai_subscriptions_student_idx on public.ai_subscriptions(student_id, updated_at desc);
create index if not exists ai_subscriptions_customer_idx on public.ai_subscriptions(stripe_customer_id);

create table if not exists public.ai_entitlements (
  student_id uuid primary key references public.students(id) on delete cascade,
  subscription_id uuid references public.ai_subscriptions(id) on delete set null,
  plan_key text references public.ai_plans(plan_key),
  tier text not null default 'free' check (tier in ('free','pro','provider','founding_provider')),
  active boolean not null default false,
  status text not null default 'free',
  effective_through timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_payments (
  stripe_invoice_id text primary key,
  student_id uuid not null references public.students(id) on delete cascade,
  stripe_subscription_id text not null,
  stripe_mode text not null check (stripe_mode in ('test','live')),
  amount_paid integer not null default 0,
  currency text not null default 'usd',
  status text not null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ai_payments_student_idx on public.ai_payments(student_id, paid_at desc);

create table if not exists public.ai_stripe_events (
  event_id text primary key,
  event_type text not null,
  stripe_mode text not null check (stripe_mode in ('test','live')),
  object_id text,
  event_created bigint not null,
  status text not null default 'processing',
  error_category text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.ai_founding_reservations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  checkout_attempt_id uuid not null unique references public.ai_checkout_attempts(id) on delete cascade,
  status text not null default 'reserved' check (status in ('reserved','claimed','released','expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ai_founding_reservation_status_idx on public.ai_founding_reservations(status, expires_at);

alter table public.ai_plans enable row level security;
alter table public.ai_checkout_attempts enable row level security;
alter table public.ai_subscriptions enable row level security;
alter table public.ai_entitlements enable row level security;
alter table public.ai_payments enable row level security;
alter table public.ai_stripe_events enable row level security;
alter table public.ai_founding_reservations enable row level security;

drop policy if exists ai_plans_public_read on public.ai_plans;
create policy ai_plans_public_read on public.ai_plans for select using (active = true);

drop policy if exists ai_checkout_attempts_own_read on public.ai_checkout_attempts;
create policy ai_checkout_attempts_own_read on public.ai_checkout_attempts for select to authenticated using (student_id = auth.uid());

drop policy if exists ai_subscriptions_own_read on public.ai_subscriptions;
create policy ai_subscriptions_own_read on public.ai_subscriptions for select to authenticated using (student_id = auth.uid());

drop policy if exists ai_entitlements_own_read on public.ai_entitlements;
create policy ai_entitlements_own_read on public.ai_entitlements for select to authenticated using (student_id = auth.uid());

drop policy if exists ai_payments_own_read on public.ai_payments;
create policy ai_payments_own_read on public.ai_payments for select to authenticated using (student_id = auth.uid());

drop policy if exists ai_founding_reservations_own_read on public.ai_founding_reservations;
create policy ai_founding_reservations_own_read on public.ai_founding_reservations for select to authenticated using (student_id = auth.uid());

revoke all on public.ai_checkout_attempts, public.ai_subscriptions, public.ai_entitlements, public.ai_payments, public.ai_stripe_events, public.ai_founding_reservations from anon, authenticated;
grant select on public.ai_plans to anon, authenticated;
grant select on public.ai_checkout_attempts, public.ai_subscriptions, public.ai_entitlements, public.ai_payments, public.ai_founding_reservations to authenticated;

insert into public.ai_plans (
  plan_key,tier,billing_interval,amount_cents,
  stripe_product_id_test,stripe_price_id_test,stripe_product_id_live,stripe_price_id_live,founding_limit,active
) values
  ('ai_pro_monthly','pro','month',3900,'prod_VKcWkbBnBiQK2W','price_1UJxHeI5Vlt1VlIgCxsqXwhX','prod_VKcp5DoEMnQcYD','price_1UJxZlI81wKbKburfCPbSSfo',null,true),
  ('ai_pro_annual','pro','year',39000,'prod_VKcWkbBnBiQK2W','price_1UJxHfI5Vlt1VlIg1ZsDVsgr','prod_VKcp5DoEMnQcYD','price_1UJxZmI81wKbKbureVKyBZGi',null,true),
  ('ai_provider_monthly','provider','month',49900,'prod_VKcWSJ1HNpVdrS','price_1UJxHfI5Vlt1VlIgP9EKAaDJ','prod_VKcpuE0spfjGDw','price_1UJxZmI81wKbKburSHhSkOCB',null,true),
  ('ai_provider_annual','provider','year',499000,'prod_VKcWSJ1HNpVdrS','price_1UJxHfI5Vlt1VlIgQ21CFzdO','prod_VKcpuE0spfjGDw','price_1UJxZmI81wKbKburnXusQlE9',null,true),
  ('ai_founding_provider_monthly','founding_provider','month',29900,'prod_VKcWUjboaaAbyT','price_1UJxHfI5Vlt1VlIgBXxeuqGo','prod_VKcp7A6LMBNTVk','price_1UJxZnI81wKbKburYTsNox5J',10,true)
on conflict (plan_key) do update set
  tier=excluded.tier,billing_interval=excluded.billing_interval,amount_cents=excluded.amount_cents,
  stripe_product_id_test=excluded.stripe_product_id_test,stripe_price_id_test=excluded.stripe_price_id_test,
  stripe_product_id_live=excluded.stripe_product_id_live,stripe_price_id_live=excluded.stripe_price_id_live,
  founding_limit=excluded.founding_limit,active=excluded.active,updated_at=now();

create or replace function public.reserve_ai_founding_slot(p_student_id uuid, p_checkout_attempt_id uuid)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  used_count integer;
begin
  perform pg_advisory_xact_lock(hashtext('statecourse-ai-founding-provider'));
  update ai_founding_reservations
     set status='expired',updated_at=now()
   where status='reserved' and expires_at <= now();

  if exists (
    select 1 from ai_entitlements
     where student_id=p_student_id and tier='founding_provider' and active=true
  ) then
    return true;
  end if;

  select count(*) into used_count
  from (
    select student_id from ai_entitlements
     where tier='founding_provider' and active=true
    union
    select r.student_id from ai_founding_reservations r
     where r.status='reserved' and r.expires_at > now()
  ) seats;

  if used_count >= 10 then return false; end if;

  insert into ai_founding_reservations(student_id,checkout_attempt_id,status,expires_at)
  values(p_student_id,p_checkout_attempt_id,'reserved',now()+interval '30 minutes')
  on conflict (checkout_attempt_id) do update set
    status='reserved',expires_at=now()+interval '30 minutes',updated_at=now();
  return true;
end;
$$;

create or replace function public.release_ai_founding_slot(p_checkout_attempt_id uuid)
returns void
language sql security definer set search_path = public
as $$
  update ai_founding_reservations
     set status='released',updated_at=now()
   where checkout_attempt_id=p_checkout_attempt_id and status='reserved';
$$;

create or replace function public.claim_ai_stripe_event(
  p_event_id text,p_event_type text,p_mode text,p_object_id text,p_event_created bigint
) returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  insert into ai_stripe_events(event_id,event_type,stripe_mode,object_id,event_created)
  values(p_event_id,p_event_type,p_mode,p_object_id,p_event_created)
  on conflict do nothing;
  return found;
end;
$$;

create or replace function public.complete_ai_stripe_event(p_event_id text)
returns void
language sql security definer set search_path = public
as $$
  update ai_stripe_events set status='processed',processed_at=now(),error_category=null where event_id=p_event_id;
$$;

create or replace function public.fail_ai_stripe_event(p_event_id text,p_error_category text)
returns void
language sql security definer set search_path = public
as $$
  update ai_stripe_events set status='failed',processed_at=now(),error_category=left(p_error_category,100) where event_id=p_event_id;
$$;

create or replace function public.apply_ai_subscription_state(
  p_event_created bigint,
  p_student_id uuid,
  p_checkout_attempt_id uuid,
  p_mode text,
  p_subscription_id text,
  p_customer_id text,
  p_price_id text,
  p_status text,
  p_current_period_end timestamptz,
  p_cancel_at_period_end boolean
) returns text
language plpgsql security definer set search_path = public
as $$
declare
  selected_plan ai_plans%rowtype;
  subscription_row ai_subscriptions%rowtype;
  entitlement_active boolean;
  existing_event_created bigint;
  occupied integer;
begin
  if p_mode not in ('test','live') then raise exception 'invalid_stripe_mode'; end if;
  select * into selected_plan from ai_plans
   where active=true and (
     (p_mode='live' and stripe_price_id_live=p_price_id) or
     (p_mode='test' and stripe_price_id_test=p_price_id)
   );
  if not found then raise exception 'unknown_ai_price'; end if;

  select last_stripe_event_created into existing_event_created
    from ai_subscriptions where stripe_subscription_id=p_subscription_id;
  if found and existing_event_created > p_event_created then return 'stale_ignored'; end if;

  entitlement_active := p_status in ('active','trialing')
    and (p_current_period_end is null or p_current_period_end > now());

  if selected_plan.tier='founding_provider' and entitlement_active
     and not exists(select 1 from ai_entitlements where student_id=p_student_id and tier='founding_provider' and active=true) then
    perform pg_advisory_xact_lock(hashtext('statecourse-ai-founding-provider'));
    select count(*) into occupied from ai_entitlements
      where tier='founding_provider' and active=true and student_id<>p_student_id;
    if occupied >= 10 then
      entitlement_active := false;
      p_status := 'capacity_rejected';
    end if;
  end if;

  insert into ai_subscriptions(
    student_id,plan_key,stripe_mode,stripe_customer_id,stripe_subscription_id,stripe_price_id,
    status,current_period_end,cancel_at_period_end,last_stripe_event_created
  ) values(
    p_student_id,selected_plan.plan_key,p_mode,p_customer_id,p_subscription_id,p_price_id,
    p_status,p_current_period_end,coalesce(p_cancel_at_period_end,false),p_event_created
  )
  on conflict (stripe_subscription_id) do update set
    student_id=excluded.student_id,plan_key=excluded.plan_key,stripe_mode=excluded.stripe_mode,
    stripe_customer_id=excluded.stripe_customer_id,stripe_price_id=excluded.stripe_price_id,
    status=excluded.status,current_period_end=excluded.current_period_end,
    cancel_at_period_end=excluded.cancel_at_period_end,last_stripe_event_created=excluded.last_stripe_event_created,
    updated_at=now()
  returning * into subscription_row;

  insert into ai_entitlements(student_id,subscription_id,plan_key,tier,active,status,effective_through)
  values(
    p_student_id,subscription_row.id,
    case when entitlement_active then selected_plan.plan_key else null end,
    case when entitlement_active then selected_plan.tier else 'free' end,
    entitlement_active,p_status,case when entitlement_active then p_current_period_end else null end
  )
  on conflict (student_id) do update set
    subscription_id=excluded.subscription_id,plan_key=excluded.plan_key,tier=excluded.tier,
    active=excluded.active,status=excluded.status,effective_through=excluded.effective_through,updated_at=now();

  update ai_checkout_attempts
     set stripe_subscription_id=p_subscription_id,
         status=case when entitlement_active then 'active' else p_status end,
         updated_at=now()
   where id=p_checkout_attempt_id and student_id=p_student_id;

  update ai_founding_reservations
     set status=case when entitlement_active then 'claimed' else 'released' end,updated_at=now()
   where checkout_attempt_id=p_checkout_attempt_id and status='reserved';

  return case when entitlement_active then 'entitled' else 'not_entitled' end;
end;
$$;

revoke all on function public.reserve_ai_founding_slot(uuid,uuid) from public,anon,authenticated;
revoke all on function public.release_ai_founding_slot(uuid) from public,anon,authenticated;
revoke all on function public.claim_ai_stripe_event(text,text,text,text,bigint) from public,anon,authenticated;
revoke all on function public.complete_ai_stripe_event(text) from public,anon,authenticated;
revoke all on function public.fail_ai_stripe_event(text,text) from public,anon,authenticated;
revoke all on function public.apply_ai_subscription_state(bigint,uuid,uuid,text,text,text,text,text,timestamptz,boolean) from public,anon,authenticated;
grant execute on function public.reserve_ai_founding_slot(uuid,uuid) to service_role;
grant execute on function public.release_ai_founding_slot(uuid) to service_role;
grant execute on function public.claim_ai_stripe_event(text,text,text,text,bigint) to service_role;
grant execute on function public.complete_ai_stripe_event(text) to service_role;
grant execute on function public.fail_ai_stripe_event(text,text) to service_role;
grant execute on function public.apply_ai_subscription_state(bigint,uuid,uuid,text,text,text,text,text,timestamptz,boolean) to service_role;

commit;
