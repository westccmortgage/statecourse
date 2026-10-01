-- DRAFT LOCAL ONLY. Not applied to a connected database or migration registry.
-- Separate NONCREDIT national PE03 trial; no CE/OSS runtime changes.
-- Prerequisites: students(account_status), current_staff_actor_bindings.
begin;
create table pe03_settings (singleton boolean primary key default true check(singleton), enabled boolean not null default false);
insert into pe03_settings values(true,false);
create table pe03_cohorts (
 id uuid primary key default gen_random_uuid(), title text not null,
 definition_id text not null default 'national-pe03-oil-noncredit-v1' check(definition_id='national-pe03-oil-noncredit-v1'),
 content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),
 timezone text not null, opens_at timestamptz not null, closes_at timestamptz not null,
 assigned_instructor_id uuid not null references students(id), enabled boolean not null default false,
 credit_eligible boolean not null default false check(not credit_eligible),
 certificate_eligible boolean not null default false check(not certificate_eligible),
 banking_eligible boolean not null default false check(not banking_eligible)
);
create table pe03_members (
 cohort_id uuid not null references pe03_cohorts(id), actor_id uuid not null references students(id),
 role text not null check(role in ('student','instructor')), active boolean not null default false,
 revision integer not null default 0 check(revision>=0), observed_ms bigint not null default 0 check(observed_ms>=0),
 primary key(cohort_id,actor_id)
);
create table pe03_leases (
 actor_id uuid primary key references students(id), cohort_id uuid not null references pe03_cohorts(id),
 tab_id uuid not null, observed_at timestamptz not null, mode text not null check(mode in ('active','paused'))
);
create table pe03_events (
 id uuid primary key default gen_random_uuid(), sequence bigint generated always as identity unique,
 cohort_id uuid not null references pe03_cohorts(id), actor_id uuid not null references students(id),
 kind text not null check(kind in ('observe','submit','peer','feedback','revise')),
 occurred_at timestamptz not null, actor_revision integer not null,
 target_id uuid references pe03_events(id), body jsonb not null,
 unique(cohort_id,actor_id,actor_revision)
);
create index pe03_events_scope on pe03_events(cohort_id,sequence);
create table pe03_receipts (
 cohort_id uuid not null references pe03_cohorts(id), actor_id uuid not null references students(id),
 request_id uuid not null, request jsonb not null, response jsonb not null,
 primary key(cohort_id,actor_id,request_id)
);
create function pe03_now() returns timestamptz language sql volatile set search_path=public,pg_temp as $$select clock_timestamp()$$;
create function pe03_immutable() returns trigger language plpgsql set search_path=public,pg_temp as $$begin raise exception 'pe03_immutable'; end$$;
create trigger pe03_events_immutable before update or delete on pe03_events for each row execute function pe03_immutable();
create trigger pe03_receipts_immutable before update or delete on pe03_receipts for each row execute function pe03_immutable();
create function pe03_validate_cohort() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if not exists(select 1 from pg_timezone_names where name=new.timezone) then raise exception 'pe03_invalid_window'; end if;
 -- Fourteen inclusive local calendar dates. The exclusive final midnight is allowed.
 if new.closes_at<=new.opens_at or new.closes_at > (((new.opens_at at time zone new.timezone)::date+14)::timestamp at time zone new.timezone) then
  raise exception 'pe03_invalid_window'; end if;
 if tg_op='UPDATE' and (new.opens_at,new.closes_at,new.timezone,new.assigned_instructor_id,new.content_hash,new.definition_id)
   is distinct from (old.opens_at,old.closes_at,old.timezone,old.assigned_instructor_id,old.content_hash,old.definition_id)
   and exists(select 1 from pe03_events where cohort_id=old.id) then raise exception 'pe03_cohort_evidence_pinned'; end if;
 return new;
end$$;
create trigger pe03_cohort_window before insert or update on pe03_cohorts for each row execute function pe03_validate_cohort();

-- No SECURITY DEFINER: existing server role performs all reads/writes. Browser roles
-- have neither table access nor EXECUTE. p_role is never sufficient authority.
create function pe03_command(p_actor_id uuid,p_role text,p_request jsonb) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare
 c pe03_cohorts; m pe03_members; l pe03_leases; prior pe03_receipts; target pe03_events;
 initial pe03_events; peer_event pe03_events; feedback_event pe03_events;
 now_at timestamptz; op text; cid uuid; rid uuid; tab uuid; target_uuid uuid;
 expected integer; elapsed_ms bigint:=0; event_id uuid; evidence jsonb; peers jsonb; result jsonb;
 payload jsonb; stage text; keys text[]; valid_keys text[];
begin
 if jsonb_typeof(p_request)<>'object' or p_role is null or p_role not in ('student','instructor') or p_actor_id is null then raise exception 'pe03_invalid_request'; end if;
 op:=p_request->>'operation';
 if op is null or op not in ('snapshot','export','observe','submit','peer','feedback','revise') then raise exception 'pe03_invalid_request'; end if;
 valid_keys:=array['operation','cohortId','contentHash'];
 if op not in ('snapshot','export') then valid_keys:=valid_keys||array['requestId','expectedRevision']; end if;
 if op='observe' then valid_keys:=valid_keys||array['tabId','mode']; end if;
 if op in ('submit','peer','feedback','revise') then valid_keys:=valid_keys||array['text']; end if;
 if op in ('peer','feedback','revise') then valid_keys:=valid_keys||array['targetId']; end if;
 select array_agg(key order by key) into keys from jsonb_object_keys(p_request) key;
 if cardinality(keys)<>cardinality(valid_keys) or not(keys<@valid_keys) then raise exception 'pe03_invalid_request'; end if;
 begin
  cid:=(p_request->>'cohortId')::uuid;
  if op not in ('snapshot','export') then
   rid:=(p_request->>'requestId')::uuid; expected:=(p_request->>'expectedRevision')::integer;
   if jsonb_typeof(p_request->'expectedRevision') is distinct from 'number' or (p_request->>'expectedRevision')!~'^(0|[1-9][0-9]*)$' or expected is null or expected<0 or rid is null then raise exception 'bad'; end if;
  end if;
  if op='observe' then tab:=(p_request->>'tabId')::uuid; if tab is null or jsonb_typeof(p_request->'mode') is distinct from 'string' or p_request->>'mode' not in ('active','paused') then raise exception 'bad'; end if; end if;
  if op in ('peer','feedback','revise') then target_uuid:=(p_request->>'targetId')::uuid; if target_uuid is null then raise exception 'bad'; end if; end if;
 exception when others then raise exception 'pe03_invalid_request'; end;
 if op in ('submit','peer','feedback','revise') and (jsonb_typeof(p_request->'text') is distinct from 'string' or length(btrim(p_request->>'text')) not between 20 and 8000) then raise exception 'pe03_invalid_request'; end if;
 if op not in ('snapshot','export') then perform pg_advisory_xact_lock(hashtextextended(p_actor_id::text,0)); end if;
 if not exists(select 1 from pe03_settings where singleton and enabled) then raise exception 'pe03_disabled'; end if;
 -- Scope lock serializes transitions, target checks and receipts, including two learners.
 select * into c from pe03_cohorts where id=cid for update;
 if not found or not c.enabled then raise exception 'pe03_access_denied'; end if;
 now_at:=pe03_now();
 if now_at<c.opens_at or now_at>=c.closes_at then raise exception 'pe03_window_closed'; end if;
 if p_request->>'contentHash' is distinct from c.content_hash then raise exception 'pe03_content_changed'; end if;
 perform 1 from students where id=p_actor_id and account_status='active' for share;
 if not found then raise exception 'pe03_access_denied'; end if;
 select * into m from pe03_members where cohort_id=cid and actor_id=p_actor_id for update;
 if not found or not m.active or m.role<>p_role then raise exception 'pe03_access_denied'; end if;
 if p_role='instructor' then
  if c.assigned_instructor_id<>p_actor_id or not exists(select 1 from current_staff_actor_bindings where auth_user_id=p_actor_id and actor_role='instructor' and scope_state is null and binding_status='active' and (effective_at is null or effective_at<=now_at) and (expires_at is null or expires_at>now_at)) then raise exception 'pe03_access_denied'; end if;
  if op not in ('snapshot','export','feedback') then raise exception 'pe03_access_denied'; end if;
 elsif op='feedback' then raise exception 'pe03_access_denied'; end if;
 select * into initial from pe03_events where cohort_id=cid and actor_id=p_actor_id and kind='submit';
 now_at:=pe03_now();
 if now_at<c.opens_at or now_at>=c.closes_at then raise exception 'pe03_window_closed'; end if;
 if op not in ('snapshot','export') then
  select * into prior from pe03_receipts where cohort_id=cid and actor_id=p_actor_id and request_id=rid;
  if found then
   if prior.request<>p_request then raise exception 'pe03_idempotency_conflict'; end if;
   return prior.response;
  end if;
  if expected<>m.revision then raise exception 'pe03_revision_conflict'; end if;
  payload:=jsonb_build_object('text',p_request->>'text');
  if op='observe' then
   -- This bounded sample measures initial preparation only, never dialogue waiting.
   if initial.id is not null and p_request->>'mode'='active' then raise exception 'pe03_observation_closed'; end if;
   -- Actor-wide lock also prevents one actor counting in multiple cohorts.
   perform pg_advisory_xact_lock(hashtextextended(p_actor_id::text,0));
   select * into l from pe03_leases where actor_id=p_actor_id for update;
   if found and now_at<l.observed_at then raise exception 'pe03_clock_regressed'; end if;
   if found and l.mode='active' and now_at-l.observed_at<=interval '20 seconds' and (l.tab_id<>tab or l.cohort_id<>cid) then raise exception 'pe03_tab_conflict'; end if;
   if found and l.cohort_id=cid and l.tab_id=tab and l.mode='active' and p_request->>'mode'='active' and now_at>l.observed_at and now_at-l.observed_at<=interval '20 seconds' then
    elapsed_ms:=floor(extract(epoch from(now_at-l.observed_at))*1000);
   end if;
   insert into pe03_leases values(p_actor_id,cid,tab,now_at,p_request->>'mode')
    on conflict(actor_id) do update set cohort_id=excluded.cohort_id,tab_id=excluded.tab_id,observed_at=excluded.observed_at,mode=excluded.mode;
   payload:=jsonb_build_object('mode',p_request->>'mode','tabId',tab,'observedMs',elapsed_ms,'intervalStart',case when elapsed_ms>0 then l.observed_at else null end,'intervalEnd',now_at);
  elsif op='submit' then
   if initial.id is not null then raise exception 'pe03_already_recorded'; end if;
   if m.observed_ms<30000 then raise exception 'pe03_observation_required'; end if;
  else
   select * into target from pe03_events where id=target_uuid and cohort_id=cid;
   if not found then raise exception 'pe03_access_denied'; end if;
   if op='peer' then
    if initial.id is null or target.kind<>'submit' or target.actor_id=p_actor_id then raise exception 'pe03_peer_required'; end if;
    perform 1 from pe03_members pm join students s on s.id=pm.actor_id where pm.cohort_id=cid and pm.actor_id=target.actor_id and pm.active and pm.role='student' and s.account_status='active' for share of pm,s;
    if not found then raise exception 'pe03_access_denied'; end if;
    if exists(select 1 from pe03_events where cohort_id=cid and kind='peer' and actor_id=p_actor_id and target_id=target.id) then raise exception 'pe03_already_recorded'; end if;
   elsif op='feedback' then
    if target.kind<>'submit' then raise exception 'pe03_peer_required'; end if;
    select * into peer_event from pe03_events where cohort_id=cid and kind='peer' and target_id=target.id and actor_id<>target.actor_id order by sequence limit 1;
    if peer_event.id is null then raise exception 'pe03_peer_required'; end if;
    if exists(select 1 from pe03_events where cohort_id=cid and kind='feedback' and target_id=target.id) then raise exception 'pe03_already_recorded'; end if;
    payload:=payload||jsonb_build_object('peerId',peer_event.id);
   elsif op='revise' then
    if target.kind<>'feedback' then raise exception 'pe03_feedback_required'; end if;
    if initial.id is null or target.target_id<>initial.id or target.actor_id<>c.assigned_instructor_id then raise exception 'pe03_feedback_required'; end if;
    if exists(select 1 from pe03_events where cohort_id=cid and kind='revise' and actor_id=p_actor_id) then raise exception 'pe03_already_recorded'; end if;
    payload:=payload||jsonb_build_object('initialId',initial.id,'peerId',target.body->'peerId');
   end if;
  end if;
  if pe03_now()<c.opens_at or pe03_now()>=c.closes_at then raise exception 'pe03_window_closed'; end if;
  if op<>'observe' then update pe03_leases set mode='paused' where actor_id=p_actor_id; end if;
  update pe03_members set revision=revision+1,observed_ms=observed_ms+elapsed_ms where cohort_id=cid and actor_id=p_actor_id returning * into m;
  insert into pe03_events(cohort_id,actor_id,kind,occurred_at,actor_revision,target_id,body) values(cid,p_actor_id,op,now_at,m.revision,target_uuid,payload) returning id into event_id;
  select * into initial from pe03_events where cohort_id=cid and actor_id=p_actor_id and kind='submit';
 end if;
 select * into peer_event from pe03_events where cohort_id=cid and kind='peer' and target_id=initial.id order by sequence limit 1;
 select * into feedback_event from pe03_events where cohort_id=cid and kind='feedback' and target_id=initial.id order by sequence limit 1;
 stage:=case when p_role='instructor' then 'instructor-review' when exists(select 1 from pe03_events where cohort_id=cid and actor_id=p_actor_id and kind='revise') then 'revised-noncredit' when feedback_event.id is not null then 'revision' when peer_event.id is not null then 'awaiting-instructor' when initial.id is not null then 'peer-dialogue' when m.observed_ms>=30000 then 'initial-submission' else 'observe' end;
 -- Assigned instructor sees cohort evidence. Learners see their own evidence,
 -- responses to their initial and (after submitting) other initial submissions only.
 select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'sequence',e.sequence,'actorId',e.actor_id,'kind',e.kind,'at',e.occurred_at,'revision',e.actor_revision,'targetId',e.target_id,'body',e.body) order by e.sequence),'[]'::jsonb)
 into evidence from pe03_events e where e.cohort_id=cid and (p_role='instructor' or e.actor_id=p_actor_id or (e.kind in ('peer','feedback') and e.target_id=initial.id) or (e.kind='submit' and initial.id is not null));
 result:=jsonb_build_object('schemaVersion',1,'cohort',jsonb_build_object('id',c.id,'title',c.title,'definitionId',c.definition_id,'contentHash',c.content_hash,'timezone',c.timezone,'opensAt',c.opens_at,'closesAt',c.closes_at,'assignedInstructorId',c.assigned_instructor_id),'actorId',p_actor_id,'role',p_role,'revision',m.revision,'stage',stage,'observedMs',m.observed_ms,'serverAt',now_at,'evidence',evidence,'receiptId',event_id,'creditEligible',false,'certificateEligible',false,'bankingEligible',false,'durationValidated',false);
 if op not in ('snapshot','export') then insert into pe03_receipts values(cid,p_actor_id,rid,p_request,result); end if;
 return result;
end$$;
-- Private tables are server-only even if defaults grant exposed-schema tables.
alter table pe03_settings enable row level security;
alter table pe03_cohorts enable row level security;
alter table pe03_members enable row level security;
alter table pe03_leases enable row level security;
alter table pe03_events enable row level security;
alter table pe03_receipts enable row level security;
revoke all on pe03_settings,pe03_cohorts,pe03_members,pe03_leases,pe03_events,pe03_receipts from public,anon,authenticated;
grant select on pe03_settings to service_role;
grant select,update on pe03_cohorts to service_role;
grant select,update on pe03_members to service_role;
grant select,insert,update on pe03_leases to service_role;
grant select,insert on pe03_events,pe03_receipts to service_role;
grant usage,select on sequence pe03_events_sequence_seq to service_role;
revoke all on function pe03_now(),pe03_immutable(),pe03_validate_cohort(),pe03_command(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function pe03_now(),pe03_command(uuid,text,jsonb) to service_role;
commit;
