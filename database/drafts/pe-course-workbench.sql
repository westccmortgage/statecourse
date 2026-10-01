-- DRAFT LOCAL ONLY. Not applied to a connected database or migration registry.
-- Separate NONCREDIT 25-unit teaching workbench; no CE/OSS runtime changes.
-- Prerequisites: students(account_status), current_staff_actor_bindings.
begin;
create table pe_course_settings (singleton boolean primary key default true check(singleton), enabled boolean not null default false);
insert into pe_course_settings values(true,false);
create table pe_course_rosters (
 id uuid primary key default gen_random_uuid(), title text not null,
 content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),
 timezone text not null, opens_at timestamptz not null, closes_at timestamptz not null,
 assigned_instructor_id uuid not null references students(id), enabled boolean not null default false
);
create table pe_course_roster_members (
 course_id uuid not null references pe_course_rosters(id), actor_id uuid not null references students(id),
 role text not null check(role in ('student','instructor')), active boolean not null default false,
 primary key(course_id,actor_id)
);
create table pe_course_cohorts (
 id uuid primary key default gen_random_uuid(), title text not null,
 course_id uuid not null references pe_course_rosters(id), unit_id text not null, category text not null check(category in ('elective','federal_law','ethics','nontraditional')),
 initial_min_ms bigint not null check(initial_min_ms>=0), planned_ms bigint not null check(planned_ms>=initial_min_ms),
 unique(course_id,unit_id),
 definition_id text not null default 'national-pe-oil-noncredit-v1' check(definition_id='national-pe-oil-noncredit-v1'),
 content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),
 timezone text not null, opens_at timestamptz not null, closes_at timestamptz not null,
 assigned_instructor_id uuid not null references students(id), enabled boolean not null default false,
 credit_eligible boolean not null default false check(not credit_eligible),
 certificate_eligible boolean not null default false check(not certificate_eligible),
 banking_eligible boolean not null default false check(not banking_eligible)
);
create table pe_course_members (
 cohort_id uuid not null references pe_course_cohorts(id), actor_id uuid not null references students(id),
 role text not null check(role in ('student','instructor')), active boolean not null default false,
 revision integer not null default 0 check(revision>=0), observed_ms bigint not null default 0 check(observed_ms>=0),
 primary key(cohort_id,actor_id)
);
create table pe_course_leases (
 actor_id uuid primary key references students(id), cohort_id uuid not null references pe_course_cohorts(id),
 tab_id uuid not null, observed_at timestamptz not null, mode text not null check(mode in ('active','paused'))
);
create table pe_course_events (
 id uuid primary key default gen_random_uuid(), sequence bigint generated always as identity unique,
 cohort_id uuid not null references pe_course_cohorts(id), actor_id uuid not null references students(id),
 kind text not null check(kind in ('observe','submit','peer','feedback','revise')),
 occurred_at timestamptz not null, actor_revision integer not null,
 target_id uuid references pe_course_events(id), body jsonb not null,
 unique(cohort_id,actor_id,actor_revision)
);
create index pe_course_events_scope on pe_course_events(cohort_id,sequence);
create table pe_course_receipts (
 cohort_id uuid not null references pe_course_cohorts(id), actor_id uuid not null references students(id),
 request_id uuid not null, request jsonb not null, response jsonb not null,
 primary key(cohort_id,actor_id,request_id)
);
create function pe_course_now() returns timestamptz language sql volatile set search_path=public,pg_temp as $$select clock_timestamp()$$;
create function pe_course_immutable() returns trigger language plpgsql set search_path=public,pg_temp as $$begin raise exception 'pe_course_immutable'; end$$;
create trigger pe_course_events_immutable before update or delete on pe_course_events for each row execute function pe_course_immutable();
create trigger pe_course_receipts_immutable before update or delete on pe_course_receipts for each row execute function pe_course_immutable();
create function pe_course_validate_cohort() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if not exists(select 1 from pg_timezone_names where name=new.timezone) then raise exception 'pe_course_invalid_window'; end if;
 -- Fourteen inclusive local calendar dates. The exclusive final midnight is allowed.
 if new.closes_at<=new.opens_at or new.closes_at > (((new.opens_at at time zone new.timezone)::date+14)::timestamp at time zone new.timezone) then
  raise exception 'pe_course_invalid_window'; end if;
 if tg_op='UPDATE' and (new.opens_at,new.closes_at,new.timezone,new.assigned_instructor_id,new.content_hash,new.definition_id,new.course_id,new.unit_id,new.category,new.initial_min_ms,new.planned_ms)
   is distinct from (old.opens_at,old.closes_at,old.timezone,old.assigned_instructor_id,old.content_hash,old.definition_id,old.course_id,old.unit_id,old.category,old.initial_min_ms,old.planned_ms)
   and exists(select 1 from pe_course_events where cohort_id=old.id) then raise exception 'pe_course_cohort_evidence_pinned'; end if;
 return new;
end$$;
create function pe_course_roster_pin() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if (new.content_hash,new.timezone,new.opens_at,new.closes_at,new.assigned_instructor_id)
 is distinct from (old.content_hash,old.timezone,old.opens_at,old.closes_at,old.assigned_instructor_id)
 and exists(select 1 from pe_course_events e join pe_course_cohorts c on c.id=e.cohort_id where c.course_id=old.id)
 then raise exception 'pe_course_cohort_evidence_pinned'; end if;
 return new;
end$$;
create trigger pe_course_roster_pinned before update on pe_course_rosters for each row execute function pe_course_roster_pin();
create trigger pe_course_cohort_window before insert or update on pe_course_cohorts for each row execute function pe_course_validate_cohort();

-- No SECURITY DEFINER: existing server role performs all reads/writes. Browser roles
-- have neither table access nor EXECUTE. p_role is never sufficient authority.
create function pe_course_command(p_actor_id uuid,p_role text,p_request jsonb) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare
 c pe_course_cohorts; m pe_course_members; l pe_course_leases; prior pe_course_receipts; target pe_course_events;
 initial pe_course_events; peer_event pe_course_events; feedback_event pe_course_events;
 now_at timestamptz; op text; cid uuid; rid uuid; tab uuid; target_uuid uuid;
 expected integer; elapsed_ms bigint:=0; event_id uuid; evidence jsonb; peers jsonb; result jsonb;
 payload jsonb; stage text; keys text[]; valid_keys text[];
begin
 if jsonb_typeof(p_request)<>'object' or p_role is null or p_role not in ('student','instructor') or p_actor_id is null then raise exception 'pe_course_invalid_request'; end if;
 op:=p_request->>'operation';
 if op is null or op not in ('snapshot','export','observe','submit','peer','feedback','revise') then raise exception 'pe_course_invalid_request'; end if;
 valid_keys:=array['operation','cohortId','contentHash','courseHash'];
 if op not in ('snapshot','export') then valid_keys:=valid_keys||array['requestId','expectedRevision']; end if;
 if op='observe' then valid_keys:=valid_keys||array['tabId','mode']; end if;
 if op in ('submit','peer','feedback','revise') then valid_keys:=valid_keys||array['text']; end if;
 if op in ('peer','feedback','revise') then valid_keys:=valid_keys||array['targetId']; end if;
 select array_agg(key order by key) into keys from jsonb_object_keys(p_request) key;
 if cardinality(keys)<>cardinality(valid_keys) or not(keys<@valid_keys) then raise exception 'pe_course_invalid_request'; end if;
 begin
  cid:=(p_request->>'cohortId')::uuid;
  if op not in ('snapshot','export') then
   rid:=(p_request->>'requestId')::uuid; expected:=(p_request->>'expectedRevision')::integer;
   if jsonb_typeof(p_request->'expectedRevision') is distinct from 'number' or (p_request->>'expectedRevision')!~'^(0|[1-9][0-9]*)$' or expected is null or expected<0 or rid is null then raise exception 'bad'; end if;
  end if;
  if op='observe' then tab:=(p_request->>'tabId')::uuid; if tab is null or jsonb_typeof(p_request->'mode') is distinct from 'string' or p_request->>'mode' not in ('active','paused') then raise exception 'bad'; end if; end if;
  if op in ('peer','feedback','revise') then target_uuid:=(p_request->>'targetId')::uuid; if target_uuid is null then raise exception 'bad'; end if; end if;
 exception when others then raise exception 'pe_course_invalid_request'; end;
 if op in ('submit','peer','feedback','revise') and (jsonb_typeof(p_request->'text') is distinct from 'string' or length(btrim(p_request->>'text')) not between 20 and 8000) then raise exception 'pe_course_invalid_request'; end if;
 if op not in ('snapshot','export') then perform pg_advisory_xact_lock(hashtextextended(p_actor_id::text,0)); end if;
 if not exists(select 1 from pe_course_settings where singleton and enabled) then raise exception 'pe_course_disabled'; end if;
 -- Scope lock serializes transitions, target checks and receipts, including two learners.
 select * into c from pe_course_cohorts where id=cid for update;
 if not found or not c.enabled then raise exception 'pe_course_access_denied'; end if;
 perform 1 from pe_course_rosters r join pe_course_roster_members rm on rm.course_id=r.id
 where r.id=c.course_id and r.content_hash=p_request->>'courseHash' and r.enabled and rm.actor_id=p_actor_id and rm.active and rm.role=p_role
 and r.timezone=c.timezone and r.opens_at=c.opens_at and r.closes_at=c.closes_at
 and r.assigned_instructor_id=c.assigned_instructor_id for share of r,rm;
 if not found then raise exception 'pe_course_access_denied'; end if;
 now_at:=pe_course_now();
 if now_at<c.opens_at or now_at>=c.closes_at then raise exception 'pe_course_window_closed'; end if;
 if p_request->>'contentHash' is distinct from c.content_hash then raise exception 'pe_course_content_changed'; end if;
 perform 1 from students where id=p_actor_id and account_status='active' for share;
 if not found then raise exception 'pe_course_access_denied'; end if;
 select * into m from pe_course_members where cohort_id=cid and actor_id=p_actor_id for update;
 if not found or not m.active or m.role<>p_role then raise exception 'pe_course_access_denied'; end if;
 if p_role='instructor' then
  if c.assigned_instructor_id<>p_actor_id or not exists(select 1 from current_staff_actor_bindings where auth_user_id=p_actor_id and actor_role='instructor' and scope_state is null and binding_status='active' and (effective_at is null or effective_at<=now_at) and (expires_at is null or expires_at>now_at)) then raise exception 'pe_course_access_denied'; end if;
  if op not in ('snapshot','export','feedback') then raise exception 'pe_course_access_denied'; end if;
 elsif op='feedback' then raise exception 'pe_course_access_denied'; end if;
 select * into initial from pe_course_events where cohort_id=cid and actor_id=p_actor_id and kind='submit';
 now_at:=pe_course_now();
 if now_at<c.opens_at or now_at>=c.closes_at then raise exception 'pe_course_window_closed'; end if;
 if op not in ('snapshot','export') then
  select * into prior from pe_course_receipts where cohort_id=cid and actor_id=p_actor_id and request_id=rid;
  if found then
   if prior.request<>p_request then raise exception 'pe_course_idempotency_conflict'; end if;
   return prior.response;
  end if;
  if expected<>m.revision then raise exception 'pe_course_revision_conflict'; end if;
  payload:=jsonb_build_object('text',p_request->>'text');
  if op='observe' then
   -- Observed activity may span reading, case work and dialogue/revision preparation. Idle/background intervals remain excluded by the client heartbeat and bounded server intervals.
   if exists(select 1 from pe_course_events where cohort_id=cid and actor_id=p_actor_id and kind='revise') and p_request->>'mode'='active' then raise exception 'pe_course_observation_closed'; end if;
   -- Actor-wide lock also prevents one actor counting in multiple cohorts.
   perform pg_advisory_xact_lock(hashtextextended(p_actor_id::text,0));
   select * into l from pe_course_leases where actor_id=p_actor_id for update;
   if found and now_at<l.observed_at then raise exception 'pe_course_clock_regressed'; end if;
   if found and l.mode='active' and now_at-l.observed_at<=interval '20 seconds' and (l.tab_id<>tab or l.cohort_id<>cid) then raise exception 'pe_course_tab_conflict'; end if;
   if found and l.cohort_id=cid and l.tab_id=tab and l.mode='active' and p_request->>'mode'='active' and now_at>l.observed_at and now_at-l.observed_at<=interval '20 seconds' then
    elapsed_ms:=floor(extract(epoch from(now_at-l.observed_at))*1000);
   end if;
   insert into pe_course_leases values(p_actor_id,cid,tab,now_at,p_request->>'mode')
    on conflict(actor_id) do update set cohort_id=excluded.cohort_id,tab_id=excluded.tab_id,observed_at=excluded.observed_at,mode=excluded.mode;
   payload:=jsonb_build_object('mode',p_request->>'mode','tabId',tab,'observedMs',elapsed_ms,'intervalStart',case when elapsed_ms>0 then l.observed_at else null end,'intervalEnd',now_at);
  elsif op='submit' then
   if initial.id is not null then raise exception 'pe_course_already_recorded'; end if;
   if m.observed_ms<c.initial_min_ms then raise exception 'pe_course_observation_required'; end if;
  else
   select * into target from pe_course_events where id=target_uuid and cohort_id=cid;
   if not found then raise exception 'pe_course_access_denied'; end if;
   if op='peer' then
    if initial.id is null or target.kind<>'submit' or target.actor_id=p_actor_id then raise exception 'pe_course_peer_required'; end if;
    perform 1 from pe_course_members pm join students s on s.id=pm.actor_id join pe_course_roster_members rm on rm.course_id=c.course_id and rm.actor_id=pm.actor_id and rm.active and rm.role='student' where pm.cohort_id=cid and pm.actor_id=target.actor_id and pm.active and pm.role='student' and s.account_status='active' for share of pm,s,rm;
    if not found then raise exception 'pe_course_access_denied'; end if;
    if exists(select 1 from pe_course_events where cohort_id=cid and kind='peer' and actor_id=p_actor_id and target_id=target.id) then raise exception 'pe_course_already_recorded'; end if;
   elsif op='feedback' then
    if target.kind<>'submit' then raise exception 'pe_course_peer_required'; end if;
    perform 1 from pe_course_roster_members rm join students s on s.id=rm.actor_id
    where rm.course_id=c.course_id and rm.actor_id=target.actor_id and rm.active and rm.role='student' and s.account_status='active' for share of rm,s;
    if not found then raise exception 'pe_course_access_denied'; end if;
    select * into peer_event from pe_course_events where cohort_id=cid and kind='peer' and target_id=target.id and actor_id<>target.actor_id order by sequence limit 1;
    if peer_event.id is null then raise exception 'pe_course_peer_required'; end if;
    if exists(select 1 from pe_course_events where cohort_id=cid and kind='feedback' and target_id=target.id) then raise exception 'pe_course_already_recorded'; end if;
    payload:=payload||jsonb_build_object('peerId',peer_event.id);
   elsif op='revise' then
    if not exists(select 1 from pe_course_events where cohort_id=cid and actor_id=p_actor_id and kind='peer') then raise exception 'pe_course_peer_required'; end if;
    if m.observed_ms<c.planned_ms then raise exception 'pe_course_observation_required'; end if;
    if target.kind<>'feedback' then raise exception 'pe_course_feedback_required'; end if;
    if initial.id is null or target.target_id<>initial.id or target.actor_id<>c.assigned_instructor_id then raise exception 'pe_course_feedback_required'; end if;
    if exists(select 1 from pe_course_events where cohort_id=cid and kind='revise' and actor_id=p_actor_id) then raise exception 'pe_course_already_recorded'; end if;
    payload:=payload||jsonb_build_object('initialId',initial.id,'peerId',target.body->'peerId');
   end if;
  end if;
  if pe_course_now()<c.opens_at or pe_course_now()>=c.closes_at then raise exception 'pe_course_window_closed'; end if;
  if op<>'observe' then update pe_course_leases set mode='paused' where actor_id=p_actor_id; end if;
  update pe_course_members set revision=revision+1,observed_ms=observed_ms+elapsed_ms where cohort_id=cid and actor_id=p_actor_id returning * into m;
  insert into pe_course_events(cohort_id,actor_id,kind,occurred_at,actor_revision,target_id,body) values(cid,p_actor_id,op,now_at,m.revision,target_uuid,payload) returning id into event_id;
  select * into initial from pe_course_events where cohort_id=cid and actor_id=p_actor_id and kind='submit';
 end if;
 select * into peer_event from pe_course_events where cohort_id=cid and kind='peer' and target_id=initial.id order by sequence limit 1;
 select * into feedback_event from pe_course_events where cohort_id=cid and kind='feedback' and target_id=initial.id order by sequence limit 1;
 stage:=case when p_role='instructor' then 'instructor-review' when exists(select 1 from pe_course_events where cohort_id=cid and actor_id=p_actor_id and kind='revise') then 'revised-noncredit' when feedback_event.id is not null then 'revision' when peer_event.id is not null then 'awaiting-instructor' when initial.id is not null then 'peer-dialogue' when m.observed_ms>=c.initial_min_ms then 'initial-submission' else 'observe' end;
 -- Assigned instructor sees cohort evidence. Learners see their own evidence,
 -- responses to their initial and (after submitting) other initial submissions only.
 select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'sequence',e.sequence,'actorId',e.actor_id,'kind',e.kind,'at',e.occurred_at,'revision',e.actor_revision,'targetId',e.target_id,'body',e.body) order by e.sequence),'[]'::jsonb)
 into evidence from pe_course_events e where e.cohort_id=cid and (p_role='instructor' or e.actor_id=p_actor_id or (e.kind in ('peer','feedback') and e.target_id=initial.id) or (e.kind='submit' and initial.id is not null));
 result:=jsonb_build_object('schemaVersion',1,'cohort',jsonb_build_object('id',c.id,'title',c.title,'definitionId',c.definition_id,'contentHash',c.content_hash,'timezone',c.timezone,'opensAt',c.opens_at,'closesAt',c.closes_at,'assignedInstructorId',c.assigned_instructor_id,'courseId',c.course_id,'unitId',c.unit_id,'category',c.category,'initialMinimumMs',c.initial_min_ms,'plannedMs',c.planned_ms),'actorId',p_actor_id,'role',p_role,'revision',m.revision,'stage',stage,'observedMs',m.observed_ms,'serverAt',now_at,'evidence',evidence,'receiptId',event_id,'creditEligible',false,'certificateEligible',false,'bankingEligible',false,'durationValidated',false);
 if op not in ('snapshot','export') then insert into pe_course_receipts values(cid,p_actor_id,rid,p_request,result); end if;
 return result;
end$$;
alter table pe_course_rosters enable row level security;
alter table pe_course_roster_members enable row level security;
revoke all on pe_course_rosters,pe_course_roster_members from public,anon,authenticated;
grant select on pe_course_rosters,pe_course_roster_members to service_role;
-- PostgreSQL requires UPDATE privilege for FOR SHARE; limit it to revocation flags.
grant update(enabled) on pe_course_rosters to service_role;
grant update(active) on pe_course_roster_members to service_role;
-- Private tables are server-only even if defaults grant exposed-schema tables.
alter table pe_course_settings enable row level security;
alter table pe_course_cohorts enable row level security;
alter table pe_course_members enable row level security;
alter table pe_course_leases enable row level security;
alter table pe_course_events enable row level security;
alter table pe_course_receipts enable row level security;
revoke all on pe_course_settings,pe_course_cohorts,pe_course_members,pe_course_leases,pe_course_events,pe_course_receipts from public,anon,authenticated;
grant select on pe_course_settings to service_role;
grant select,update on pe_course_cohorts to service_role;
grant select,update on pe_course_members to service_role;
grant select,insert,update on pe_course_leases to service_role;
grant select,insert on pe_course_events,pe_course_receipts to service_role;
grant usage,select on sequence pe_course_events_sequence_seq to service_role;
revoke all on function pe_course_now(),pe_course_immutable(),pe_course_validate_cohort(),pe_course_command(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function pe_course_now(),pe_course_command(uuid,text,jsonb) to service_role;

create function pe_course_dispatch(p_actor_id uuid,p_role text,p_request jsonb) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare c pe_course_cohorts; cid uuid; input jsonb; result jsonb; results jsonb:='[]'::jsonb; op text;
begin
 if jsonb_typeof(p_request)<>'object' then raise exception 'pe_course_invalid_request'; end if;
 begin cid:=(p_request->>'courseId')::uuid; exception when others then raise exception 'pe_course_invalid_request'; end;
 op:=p_request->>'operation';
 perform pg_advisory_xact_lock(hashtextextended(p_actor_id::text,0));
 if op in ('course-snapshot','course-export') then
  if (select count(*) from jsonb_object_keys(p_request))<>3 or not(p_request ?& array['operation','courseId','courseHash']) then raise exception 'pe_course_invalid_request'; end if;
  if (select count(*) from pe_course_cohorts where course_id=cid)<>25 then raise exception 'pe_course_course_incomplete'; end if;
  perform 1 from pe_course_cohorts where course_id=cid order by unit_id for update;
  for c in select * from pe_course_cohorts where course_id=cid order by unit_id loop
   result:=pe_course_command(p_actor_id,p_role,jsonb_build_object('operation','export','cohortId',c.id,'contentHash',c.content_hash,'courseHash',p_request->>'courseHash'));
   results:=results||jsonb_build_array(result);
  end loop;
  return jsonb_build_object('units',results,'creditEligible',false,'certificateEligible',false,'bankingEligible',false,'protectedFinalAvailable',false,'durationValidated',false);
 end if;
 select * into c from pe_course_cohorts where course_id=cid and unit_id=p_request->>'unitId';
 if not found then raise exception 'pe_course_access_denied'; end if;
 input:=(p_request-'courseId'-'unitId')||jsonb_build_object('cohortId',c.id,'contentHash',c.content_hash);
 return pe_course_command(p_actor_id,p_role,input);
end$$;
revoke all on function pe_course_roster_pin(),pe_course_dispatch(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function pe_course_dispatch(uuid,text,jsonb) to service_role;

commit;

