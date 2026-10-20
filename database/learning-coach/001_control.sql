-- Review and apply explicitly to the existing platform database; never run by a glob.
-- No learner/enrollment/credit tables are touched. Daily limits are UTC, server timed.
begin;
create table if not exists public.learning_coach_requests (
 request_id uuid primary key, identity_hash text not null, payload_hash text not null,
 created_at timestamptz not null default clock_timestamp(),
 status text not null check(status in ('reserved','complete','failed')),
 reserved_micros bigint not null check(reserved_micros>0), response jsonb
);
alter table public.learning_coach_requests enable row level security;
revoke all on public.learning_coach_requests from public, anon, authenticated;
create or replace function public.learning_coach_control(op text,payload jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare
 r public.learning_coach_requests%rowtype;
 rid uuid := (payload->>'requestId')::uuid;
 ident text := payload->>'identity'; ph text := payload->>'payloadHash';
 current_time_value timestamptz := clock_timestamp();
 day_start timestamptz := date_trunc('day',clock_timestamp() at time zone 'UTC') at time zone 'UTC';
 charge bigint; budget bigint;
begin
 if ident !~ '^[a-f0-9]{64}$' or ph !~ '^[a-f0-9]{64}$' or ident is null or ph is null or rid is null then raise exception 'invalid_request'; end if;
 -- Serialize admission across ALL workers, including budget and duplicate checks.
 perform pg_advisory_xact_lock(7751042026);
 -- Bounded response retention: no prompts or raw IPs are stored.
 update public.learning_coach_requests set response=null where response is not null and created_at < current_time_value-interval '10 minutes';
 delete from public.learning_coach_requests where created_at < current_time_value-interval '48 hours';
 select * into r from public.learning_coach_requests where request_id=rid;
 if op='reserve' then
  if found then
   if r.identity_hash<>ident or r.payload_hash<>ph then return jsonb_build_object('status','conflict'); end if;
   if r.status='complete' and r.response is not null then return jsonb_build_object('status','cached','response',r.response); end if;
   return jsonb_build_object('status','already_reserved');
  end if;
  charge := (payload->>'reserveMicros')::bigint; budget := (payload->>'budgetMicros')::bigint;
  if charge is null or charge<=0 or budget is null or budget<=0 or budget>10000000 then raise exception 'invalid_budget'; end if;
  if (select count(*) from public.learning_coach_requests where created_at>=day_start)>=100
   or (select coalesce(sum(reserved_micros),0) from public.learning_coach_requests where created_at>=day_start)+charge>budget
   or (select count(*) from public.learning_coach_requests where identity_hash=ident and created_at>=day_start)>=20
   or (select count(*) from public.learning_coach_requests where identity_hash=ident and created_at>=current_time_value-interval '1 minute')>=5
  then return jsonb_build_object('status','limited'); end if;
  insert into public.learning_coach_requests(request_id,identity_hash,payload_hash,status,reserved_micros) values(rid,ident,ph,'reserved',charge);
  return jsonb_build_object('status','reserved');
 end if;
 if not found or r.identity_hash<>ident or r.payload_hash<>ph or r.status<>'reserved' then raise exception 'invalid_reservation'; end if;
 if op='complete' then
  if jsonb_typeof(payload->'response')<>'object' or octet_length((payload->'response')::text)>20000 then raise exception 'invalid_response'; end if;
  update public.learning_coach_requests set status='complete',response=payload->'response' where request_id=rid;
 elsif op='failed' then
  update public.learning_coach_requests set status='failed' where request_id=rid;
 else raise exception 'invalid_operation';
 end if;
 return jsonb_build_object('status','recorded');
end $$;
revoke all on function public.learning_coach_control(text,jsonb) from public,anon,authenticated;
grant execute on function public.learning_coach_control(text,jsonb) to service_role;
commit;
