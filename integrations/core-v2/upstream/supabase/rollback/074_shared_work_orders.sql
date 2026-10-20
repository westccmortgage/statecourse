begin;
do $$ begin
  if exists(select 1 from public.core_v2_work_orders) then
    raise exception 'Preserve work order history; use a forward correction after intake has begun';
  end if;
end $$;
drop table public.core_v2_work_order_events;
drop table public.core_v2_work_orders;
drop function public.core_v2_work_order_guard();
commit;
