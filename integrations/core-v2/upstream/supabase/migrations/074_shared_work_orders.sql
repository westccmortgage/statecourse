-- The common intent envelope points at the existing execution/completion
-- records. No new scheduler, spending authority or completion state machine.
create table public.core_v2_work_orders (
  id uuid primary key,
  organization_id uuid not null references public.organizations(id),
  initiating_surface text not null check(initiating_surface in ('measured-decision','ceo-admin','markevita')),
  initiating_user text not null,
  idempotency_key text not null,
  input_sha256 text not null check(input_sha256 ~ '^[a-f0-9]{64}$'),
  contract jsonb not null check(jsonb_typeof(contract)='object'),
  revision integer not null default 1 check(revision>0),
  workflow_id uuid references public.intelligence_workflows(id),
  completion_id uuid references public.core_v2_task_completions(id),
  context_evidence jsonb not null default '[]' check(jsonb_typeof(context_evidence)='array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id,initiating_surface,initiating_user,idempotency_key),
  check((contract->>'protocol'='core-v2.work-order.1') is true),
  check((contract->>'work_order_id'=id::text) is true),
  check((contract->>'organization'=organization_id::text) is true),
  check((contract#>>'{authority,ceiling}'='PROPOSE') is true),
  check((contract#>>'{budget,authorized}'='0') is true),
  check((jsonb_typeof(contract->'acceptance_criteria')='array' and jsonb_array_length(contract->'acceptance_criteria')>0) is true)
);
create table public.core_v2_work_order_events (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.core_v2_work_orders(id),
  revision integer not null,
  kind text not null,
  detail jsonb not null,
  created_at timestamptz not null default now(),
  unique(work_order_id,revision)
);
create index core_v2_work_orders_recent on public.core_v2_work_orders(organization_id,created_at desc);

create function public.core_v2_work_order_guard() returns trigger
language plpgsql set search_path='' as $$
begin
  if tg_op='UPDATE' and (new.id,new.organization_id,new.initiating_surface,new.initiating_user,new.idempotency_key,new.input_sha256,new.contract)
    is distinct from (old.id,old.organization_id,old.initiating_surface,old.initiating_user,old.idempotency_key,old.input_sha256,old.contract) then
    raise exception 'core_v2: work order intent and authority are immutable';
  end if;
  if tg_op='UPDATE' and old.completion_id is not null and exists(select 1 from public.core_v2_task_completions
    where id=old.completion_id and state in ('DELIVERED','FAILED_VERIFIED')) and new is distinct from old then
    raise exception 'core_v2: terminal work order evidence is immutable; create a successor';
  end if;
  if new.workflow_id is not null and not exists(select 1 from public.intelligence_workflows
      where id=new.workflow_id and organization_id=new.organization_id) then
    raise exception 'core_v2: workflow tenant mismatch';
  end if;
  if new.completion_id is not null and not exists(select 1 from public.core_v2_task_completions
      where id=new.completion_id and organization_id=new.organization_id and application='work-order'
        and task_key=new.id::text and outcome_required=new.contract->>'requested_deliverable'
        and workflow_id is not distinct from new.workflow_id
        and (state<>'DELIVERED' or not exists (
          select 1 from jsonb_array_elements_text(new.contract->'acceptance_criteria') criterion
          where not exists(select 1 from jsonb_array_elements(acceptance_gates) gate
            where gate->>'name'=criterion and gate->>'required'='true' and gate->>'passed'='true')
        ))) then
    raise exception 'core_v2: completion does not prove this work order';
  end if;
  return new;
end $$;
create trigger core_v2_work_order_guard before insert or update on public.core_v2_work_orders
  for each row execute function public.core_v2_work_order_guard();
alter table public.core_v2_work_orders enable row level security;
alter table public.core_v2_work_order_events enable row level security;
revoke all on public.core_v2_work_orders,public.core_v2_work_order_events from public,anon,authenticated,service_role;
grant select,insert,update on public.core_v2_work_orders to service_role;
grant select,insert on public.core_v2_work_order_events to service_role;
revoke all on function public.core_v2_work_order_guard() from public,anon,authenticated;
