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
 assigned_instructor_id uuid not null references students(id), enabled boolean not null default false,
 offering_mode text not null default 'private_noncredit' check(offering_mode in ('private_noncredit','prerequisite_bound')),
 rocs_version text, rocs_document_hash text check(rocs_document_hash is null or rocs_document_hash ~ '^[a-f0-9]{64}$'),
 rocs_rendered_hash text check(rocs_rendered_hash is null or rocs_rendered_hash ~ '^[a-f0-9]{64}$'),
 check(offering_mode='private_noncredit' or (rocs_version is not null and rocs_document_hash is not null and rocs_rendered_hash is not null))
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

-- Verified ROCS artifacts are imported through a separately reviewed evidence process.
-- Setup may only pin an already-verified exact version/hash; no learner or operator
-- checkbox can manufacture source verification.
create table pe_course_rocs_documents (
 version text not null, document_hash text not null check(document_hash ~ '^[a-f0-9]{64}$'),
 rendered_hash text not null check(rendered_hash ~ '^[a-f0-9]{64}$'), full_text text not null,
 source_reference text not null, source_verified_at timestamptz not null,
 revoked_at timestamptz, primary key(version,document_hash,rendered_hash),
 check(length(full_text)>0 and length(source_reference)>0)
);
create function pe_course_rocs_document_guard() returns trigger language plpgsql set search_path=public,pg_temp as $$begin
 if tg_op='DELETE' or old.revoked_at is not null or new.revoked_at is null or
  (new.version,new.document_hash,new.rendered_hash,new.full_text,new.source_reference,new.source_verified_at)
  is distinct from (old.version,old.document_hash,old.rendered_hash,old.full_text,old.source_reference,old.source_verified_at)
 then raise exception 'pe_course_rocs_document_immutable';end if;return new;end$$;
create trigger pe_course_rocs_documents_immutable before update or delete on pe_course_rocs_documents for each row execute function pe_course_rocs_document_guard();
create table pe_course_identity_evidence (
 course_id uuid not null references pe_course_rosters(id), actor_id uuid not null references students(id),
 status text not null check(status in ('pending','verified','revoked')), self_reported_nmls_id text,
 evidence_reference text, verified_at timestamptz, revoked_at timestamptz,
 primary key(course_id,actor_id),
 check(status<>'verified' or (evidence_reference is not null and verified_at is not null and revoked_at is null))
);
create table pe_course_rocs_presentations (
 id uuid primary key default gen_random_uuid(), course_id uuid not null references pe_course_rosters(id),
 actor_id uuid not null references students(id), version text not null, document_hash text not null,
 rendered_hash text not null, presented_at timestamptz not null, unique(course_id,actor_id,id)
);
create table pe_course_rocs_acceptances (
 course_id uuid not null references pe_course_rosters(id), actor_id uuid not null references students(id),
 presentation_id uuid not null references pe_course_rocs_presentations(id), decision text not null check(decision in ('accepted','declined')),
 version text not null, document_hash text not null, rendered_hash text not null, decided_at timestamptz not null,
 primary key(course_id,actor_id,presentation_id)
);
create table pe_course_readiness_receipts (
 course_id uuid not null references pe_course_rosters(id), actor_id uuid not null references students(id),
 request_id uuid not null, operation text not null, request jsonb not null, response jsonb not null,
 primary key(course_id,actor_id,request_id)
);
create trigger pe_course_rocs_presentations_immutable before update or delete on pe_course_rocs_presentations for each row execute function pe_course_immutable();
create trigger pe_course_rocs_acceptances_immutable before update or delete on pe_course_rocs_acceptances for each row execute function pe_course_immutable();
create trigger pe_course_readiness_receipts_immutable before update or delete on pe_course_readiness_receipts for each row execute function pe_course_immutable();

create function pe_course_readiness(actor uuid,cid uuid,include_document boolean default false) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare r pe_course_rosters;m pe_course_roster_members;doc pe_course_rocs_documents;identity pe_course_identity_evidence;accepted pe_course_rocs_acceptances;holds jsonb:='[]'::jsonb;now_at timestamptz:=pe_course_now();
begin
 select * into r from pe_course_rosters where id=cid for share;
 if not found then raise exception 'pe_course_access_denied';end if;
 select * into m from pe_course_roster_members where course_id=cid and actor_id=actor and role='student' for share;
 if not found or not m.active then raise exception 'pe_course_access_denied';end if;
 if r.offering_mode='private_noncredit' then return jsonb_build_object('schemaVersion',1,'actorId',actor,'courseId',cid,'mode',r.offering_mode,'ready',true,'holds',holds,'creditEligible',false,'certificateEligible',false,'bankingEligible',false);end if;
 select * into doc from pe_course_rocs_documents where version=r.rocs_version and document_hash=r.rocs_document_hash and rendered_hash=r.rocs_rendered_hash and revoked_at is null;
 if not found then holds:=holds||'"rocs_document_unavailable"'::jsonb;end if;
 select * into identity from pe_course_identity_evidence where course_id=cid and actor_id=actor;
 if identity.status is distinct from 'verified' or identity.revoked_at is not null then holds:=holds||'"identity_verification_required"'::jsonb;end if;
 select a.* into accepted from pe_course_rocs_acceptances a join pe_course_rocs_presentations p on p.id=a.presentation_id and p.course_id=a.course_id and p.actor_id=a.actor_id
 where a.course_id=cid and a.actor_id=actor and a.decision='accepted' and a.version=r.rocs_version and a.document_hash=r.rocs_document_hash and a.rendered_hash=r.rocs_rendered_hash order by a.decided_at desc limit 1;
 if accepted.presentation_id is null then holds:=holds||'"rocs_acceptance_required"'::jsonb;end if;
 return jsonb_build_object('schemaVersion',1,'actorId',actor,'courseId',cid,'mode',r.offering_mode,'ready',jsonb_array_length(holds)=0,'holds',holds,
  'course',jsonb_build_object('title',r.title,'opensAt',r.opens_at,'closesAt',r.closes_at,'assignedInstructorId',r.assigned_instructor_id),
  'identity',jsonb_build_object('status',coalesce(identity.status,'pending'),'selfReportedNmlsId',identity.self_reported_nmls_id,'verifiedAt',identity.verified_at),
  'rocs',jsonb_build_object('available',doc.version is not null,'version',r.rocs_version,'documentHash',r.rocs_document_hash,'renderedHash',r.rocs_rendered_hash,'acceptedAt',accepted.decided_at,'text',case when include_document and doc.version is not null then doc.full_text else null end),
  'serverAt',now_at,'creditEligible',false,'certificateEligible',false,'bankingEligible',false);
end$$;

create function pe_course_assert_ready(actor uuid,cid uuid) returns timestamptz
language plpgsql security invoker set search_path=public,pg_temp as $$declare state jsonb;begin state:=pe_course_readiness(actor,cid,false);if not coalesce((state->>'ready')::boolean,false) then raise exception 'pe_course_readiness_required';end if;return pe_course_now()+interval '20 seconds';end$$;

create function pe_course_readiness_command(actor uuid,input jsonb) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare cid uuid;rid uuid;op text;prior pe_course_readiness_receipts;state jsonb;r pe_course_rosters;presentation pe_course_rocs_presentations;now_at timestamptz:=pe_course_now();
begin
 if jsonb_typeof(input)<>'object' then raise exception 'pe_course_invalid_request';end if;op:=input->>'operation';
 begin cid:=(input->>'courseId')::uuid;if input ? 'requestId' then rid:=(input->>'requestId')::uuid;end if;exception when others then raise exception 'pe_course_invalid_request';end;
 if op='readiness-snapshot' and (select count(*) from jsonb_object_keys(input))=3 and input ? 'courseHash' then return pe_course_readiness(actor,cid,false);end if;
 if op not in ('present-rocs','accept-rocs','decline-rocs','save-self-reported-id') or rid is null then raise exception 'pe_course_invalid_request';end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
 select * into prior from pe_course_readiness_receipts where course_id=cid and actor_id=actor and request_id=rid;
 if found then if prior.operation<>op or prior.request<>input then raise exception 'pe_course_idempotency_conflict';end if;return prior.response;end if;
 select * into r from pe_course_rosters where id=cid and offering_mode='prerequisite_bound' for share;if not found then raise exception 'pe_course_access_denied';end if;
 perform 1 from pe_course_roster_members m join students s on s.id=m.actor_id where m.course_id=cid and m.actor_id=actor and m.role='student' and m.active and s.account_status='active' for share;if not found then raise exception 'pe_course_access_denied';end if;
 if op='save-self-reported-id' then
  if (select count(*) from jsonb_object_keys(input))<>5 or jsonb_typeof(input->'nmlsId') is distinct from 'string' or length(btrim(input->>'nmlsId')) not between 1 and 64 then raise exception 'pe_course_invalid_request';end if;
  insert into pe_course_identity_evidence(course_id,actor_id,status,self_reported_nmls_id) values(cid,actor,'pending',btrim(input->>'nmlsId')) on conflict(course_id,actor_id) do update set self_reported_nmls_id=excluded.self_reported_nmls_id where pe_course_identity_evidence.status='pending';
 elsif op='present-rocs' then
  if (select count(*) from jsonb_object_keys(input))<>4 then raise exception 'pe_course_invalid_request';end if;
  perform 1 from pe_course_rocs_documents where version=r.rocs_version and document_hash=r.rocs_document_hash and rendered_hash=r.rocs_rendered_hash and revoked_at is null;if not found then raise exception 'pe_course_rocs_unavailable';end if;
  insert into pe_course_rocs_presentations(course_id,actor_id,version,document_hash,rendered_hash,presented_at) values(cid,actor,r.rocs_version,r.rocs_document_hash,r.rocs_rendered_hash,now_at) returning * into presentation;
 else
  if (select count(*) from jsonb_object_keys(input))<>5 then raise exception 'pe_course_invalid_request';end if;
  begin select * into presentation from pe_course_rocs_presentations where id=(input->>'presentationId')::uuid and course_id=cid and actor_id=actor;exception when others then raise exception 'pe_course_invalid_request';end;
  if not found or (presentation.version,presentation.document_hash,presentation.rendered_hash) is distinct from (r.rocs_version,r.rocs_document_hash,r.rocs_rendered_hash) then raise exception 'pe_course_rocs_presentation_invalid';end if;
  insert into pe_course_rocs_acceptances values(cid,actor,presentation.id,case when op='accept-rocs' then 'accepted' else 'declined' end,presentation.version,presentation.document_hash,presentation.rendered_hash,now_at);
 end if;
 state:=pe_course_readiness(actor,cid,op='present-rocs');
 if presentation.id is not null then state:=state||jsonb_build_object('presentationId',presentation.id);end if;
 insert into pe_course_readiness_receipts values(cid,actor,rid,op,input,state);return state;
end$$;
-- PE-specific conservative provider-choice restriction accounting. Reservations
-- limit possible instructional exposure; they NEVER award observed seat time.
create table pe_course_policy_actors (
 actor_id uuid primary key references students(id), session_started_at timestamptz not null,
 break_boundary timestamptz not null, break_started_at timestamptz, last_clock timestamptz not null,
 last_exposure_end timestamptz not null, policy_revision bigint not null default 0 check(policy_revision>=0), policy_id text not null default 'pe-oil-restriction-draft-v1'
);
create table pe_course_policy_intervals (
 id bigint generated always as identity primary key, actor_id uuid not null references students(id),
 course_id uuid not null references pe_course_rosters(id), starts_at timestamptz not null, ends_at timestamptz not null,
 check(ends_at>starts_at)
);
create trigger pe_course_policy_intervals_immutable before update or delete on pe_course_policy_intervals for each row execute function pe_course_immutable();
create index pe_course_policy_actor_time on pe_course_policy_intervals(actor_id,ends_at);
create table pe_course_policy_events (
 id bigint generated always as identity primary key,actor_id uuid not null references students(id),
 course_id uuid not null references pe_course_rosters(id),kind text not null,at timestamptz not null,body jsonb not null
);
create trigger pe_course_policy_events_immutable before update or delete on pe_course_policy_events for each row execute function pe_course_immutable();
create function pe_course_policy_access(actor uuid,cid uuid,control text default 'grant') returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare s pe_course_policy_actors;r pe_course_rosters;now_at timestamptz;since_break bigint;rolling bigint;
 horizon timestamptz;new_start timestamptz;new_end timestamptz;resume_at timestamptz;code text:='allowed';allowed boolean:=false;last_interval pe_course_policy_intervals;
 result jsonb;prerequisite_deadline timestamptz;
begin
 if actor is null or cid is null or control not in ('grant','snapshot','break','resume') then raise exception 'pe_course_invalid_request';end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
 select * into r from pe_course_rosters where id=cid and enabled for share;
 if not found then raise exception 'pe_course_access_denied';end if;
 perform 1 from students a join pe_course_roster_members m on m.actor_id=a.id where a.id=actor and a.account_status='active' and m.course_id=cid and m.active and m.role='student' for share of a,m;
 if not found then raise exception 'pe_course_access_denied';end if;
 prerequisite_deadline:=pe_course_assert_ready(actor,cid);
 select * into s from pe_course_policy_actors where actor_id=actor for update;
 now_at:=pe_course_now();if now_at<r.opens_at or now_at>=r.closes_at then raise exception 'pe_course_window_closed';end if;
 if s.actor_id is null then
  insert into pe_course_policy_actors values(actor,now_at,now_at,null,now_at,now_at,0) returning * into s;
 end if;
 if s.policy_id<>'pe-oil-restriction-draft-v1' then raise exception 'pe_course_policy_changed';end if;
 if now_at<s.last_clock then raise exception 'pe_course_clock_regressed';end if;
 if control='break' and s.break_started_at is null then
  s.break_started_at:=greatest(now_at,s.last_exposure_end);
  insert into pe_course_policy_events(actor_id,course_id,kind,at,body) values(actor,cid,'break_started',now_at,jsonb_build_object('effectiveAt',s.break_started_at));
 end if;
 if control='resume' then
  if now_at>=s.session_started_at+interval '12 hours' then
   if now_at>=s.last_exposure_end+interval '12 hours' then
    s.session_started_at:=now_at;s.break_boundary:=now_at;s.break_started_at:=null;
    insert into pe_course_policy_events(actor_id,course_id,kind,at,body) values(actor,cid,'new_session',now_at,'{}');
   end if;
  elsif s.break_started_at is not null and now_at>=s.break_started_at+interval '10 minutes' then
   s.break_boundary:=now_at;s.break_started_at:=null;
   insert into pe_course_policy_events(actor_id,course_id,kind,at,body) values(actor,cid,'break_completed',now_at,'{}');
  end if;
 end if;
 select coalesce(sum(floor(extract(epoch from(ends_at-greatest(starts_at,s.break_boundary)))*1000)),0) into since_break from pe_course_policy_intervals where actor_id=actor and ends_at>s.break_boundary;
 select coalesce(sum(floor(extract(epoch from(ends_at-greatest(starts_at,now_at-interval '24 hours')))*1000)),0) into rolling from pe_course_policy_intervals where actor_id=actor and ends_at>now_at-interval '24 hours';
 if now_at>=s.session_started_at+interval '12 hours' then code:='session_rest_required';resume_at:=s.last_exposure_end+interval '12 hours';
 elsif s.break_started_at is not null then code:='break_in_progress';resume_at:=s.break_started_at+interval '10 minutes';
 elsif since_break>=12000000 and now_at>=s.last_exposure_end then code:='mandatory_break_required';
 elsif rolling>=36000000 and now_at>=s.last_exposure_end then code:='rolling_day_limit';select min(ends_at)+interval '24 hours' into resume_at from pe_course_policy_intervals where actor_id=actor and ends_at>now_at-interval '24 hours';
 else
  horizon:=least(now_at+interval '20 seconds',s.session_started_at+interval '12 hours',r.closes_at,prerequisite_deadline);
  new_start:=greatest(now_at,s.last_exposure_end);
  new_end:=least(horizon,new_start+(greatest(0,least(12000000-since_break,36000000-rolling))*interval '1 millisecond'));
  if control in ('grant','resume') and new_end>new_start and s.last_exposure_end<now_at+interval '10 seconds' then
   -- Actor-serialized disjoint reservations persist even if the response is
   -- lost or the learner leaves. Unobserved reservations are never seat time.
   insert into pe_course_policy_intervals(actor_id,course_id,starts_at,ends_at) values(actor,cid,new_start,new_end);
   since_break:=since_break+floor(extract(epoch from(new_end-new_start))*1000);rolling:=rolling+floor(extract(epoch from(new_end-new_start))*1000);s.last_exposure_end:=new_end;
  end if;
  horizon:=least(horizon,s.last_exposure_end);
  allowed:=control<>'break' and now_at<horizon;
  if not allowed then code:='resume_required';end if;
 end if;
 s.last_clock:=now_at;s.policy_revision:=s.policy_revision+1;
 update pe_course_policy_actors set session_started_at=s.session_started_at,break_boundary=s.break_boundary,break_started_at=s.break_started_at,last_clock=now_at,last_exposure_end=s.last_exposure_end,policy_revision=s.policy_revision where actor_id=actor;
 result:=jsonb_build_object('policyId','pe-oil-restriction-draft-v1','revision',s.policy_revision,'actorId',actor,'courseId',cid,'serverAt',now_at,'allowed',allowed,'code',code,'deliveryUntil',case when allowed then horizon else null end,'resumeNotBefore',resume_at,'reservedSinceBreakMs',since_break,'reservedRollingMs',rolling,'observedCreditMs',0,'providerPolicyApproved',false);
 return result;
end$$;
alter table pe_course_policy_actors enable row level security;alter table pe_course_policy_intervals enable row level security;alter table pe_course_policy_events enable row level security;
revoke all on pe_course_policy_actors,pe_course_policy_intervals,pe_course_policy_events from public,anon,authenticated,service_role;
grant select,insert,update on pe_course_policy_actors to service_role;grant select,insert on pe_course_policy_intervals,pe_course_policy_events to service_role;
grant usage,select on sequence pe_course_policy_intervals_id_seq,pe_course_policy_events_id_seq to service_role;
revoke all on function pe_course_policy_access(uuid,uuid,text) from public,anon,authenticated;grant execute on function pe_course_policy_access(uuid,uuid,text) to service_role;

create table pe_course_policy_receipts(actor_id uuid not null references students(id),course_id uuid not null references pe_course_rosters(id),request_id uuid not null,operation text not null,request jsonb not null,primary key(actor_id,course_id,request_id));
create trigger pe_course_policy_receipts_immutable before update or delete on pe_course_policy_receipts for each row execute function pe_course_immutable();
alter table pe_course_policy_receipts enable row level security;revoke all on pe_course_policy_receipts from public,anon,authenticated,service_role;grant select,insert on pe_course_policy_receipts to service_role;
create function pe_course_policy_control(actor uuid,role_name text,input jsonb) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare cid uuid;rid uuid;op text;action text;prior pe_course_policy_receipts;result jsonb;keys text[];
begin
 op:=input->>'operation';if role_name is distinct from 'student' or op not in ('policy-snapshot','policy-break','policy-resume') then raise exception 'pe_course_invalid_request';end if;
 keys:=array['operation','courseId','courseHash'];if op<>'policy-snapshot' then keys:=keys||array['requestId'];end if;
 if (select count(*) from jsonb_object_keys(input))<>cardinality(keys) or not(input ?& keys) then raise exception 'pe_course_invalid_request';end if;
 begin cid:=(input->>'courseId')::uuid;rid:=(input->>'requestId')::uuid;exception when others then raise exception 'pe_course_invalid_request';end;
 if op<>'policy-snapshot' and rid is null then raise exception 'pe_course_invalid_request';end if;
 if not exists(select 1 from pe_course_settings where singleton and enabled) then raise exception 'pe_course_disabled';end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
 if not exists(select 1 from pe_course_rosters where id=cid and content_hash=input->>'courseHash') then raise exception 'pe_course_content_changed';end if;
 result:=pe_course_policy_access(actor,cid,'snapshot');
 if op='policy-snapshot' then return result;end if;
 select * into prior from pe_course_policy_receipts where actor_id=actor and course_id=cid and request_id=rid;
 if found then if prior.operation<>op or prior.request<>input then raise exception 'pe_course_idempotency_conflict';end if;return result;end if;
 action:=case op when 'policy-break' then 'break' else 'resume' end;
 result:=pe_course_policy_access(actor,cid,action);
 insert into pe_course_policy_receipts values(actor,cid,rid,op,input);return result;
end$$;
revoke all on function pe_course_policy_control(uuid,text,jsonb) from public,anon,authenticated;grant execute on function pe_course_policy_control(uuid,text,jsonb) to service_role;

create function pe_course_validate_cohort() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if not exists(select 1 from pg_timezone_names where name=new.timezone) then raise exception 'pe_course_invalid_window'; end if;
 -- Fourteen inclusive local calendar dates. The exclusive final midnight is allowed.
 if new.closes_at<=new.opens_at or new.closes_at > (((new.opens_at at time zone new.timezone)::date+14)::timestamp at time zone new.timezone) then
  raise exception 'pe_course_invalid_window'; end if;
 if tg_op='UPDATE' and (new.opens_at,new.closes_at,new.timezone,new.assigned_instructor_id,new.content_hash,new.definition_id,new.course_id,new.unit_id,new.category,new.initial_min_ms,new.planned_ms)
   is distinct from (old.opens_at,old.closes_at,old.timezone,old.assigned_instructor_id,old.content_hash,old.definition_id,old.course_id,old.unit_id,old.category,old.initial_min_ms,old.planned_ms)
   and (exists(select 1 from pe_course_events where cohort_id=old.id) or exists(select 1 from pe_course_policy_intervals where course_id=old.course_id)) then raise exception 'pe_course_cohort_evidence_pinned'; end if;
 return new;
end$$;
create function pe_course_roster_pin() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if new.offering_mode is distinct from old.offering_mode then raise exception 'pe_course_mode_immutable';end if;
 if (new.content_hash,new.timezone,new.opens_at,new.closes_at,new.assigned_instructor_id,new.rocs_version,new.rocs_document_hash,new.rocs_rendered_hash)
 is distinct from (old.content_hash,old.timezone,old.opens_at,old.closes_at,old.assigned_instructor_id,old.rocs_version,old.rocs_document_hash,old.rocs_rendered_hash)
 and (exists(select 1 from pe_course_events e join pe_course_cohorts c on c.id=e.cohort_id where c.course_id=old.id) or exists(select 1 from pe_course_policy_intervals where course_id=old.id))
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
 payload jsonb; stage text; keys text[]; valid_keys text[]; delivery jsonb;
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
 if p_role='student' then delivery:=pe_course_policy_access(p_actor_id,c.course_id,'grant');end if;
 if p_role='student' and op not in ('snapshot','export') and not(delivery->>'allowed')::boolean then raise exception 'pe_course_delivery_paused';end if;
 if op not in ('snapshot','export') then
  select * into prior from pe_course_receipts where cohort_id=cid and actor_id=p_actor_id and request_id=rid;
  if found then
   if prior.request<>p_request then raise exception 'pe_course_idempotency_conflict'; end if;
   return prior.response||jsonb_build_object('delivery',delivery);
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
  if p_role='student' then delivery:=pe_course_policy_access(p_actor_id,c.course_id,'grant');if not(delivery->>'allowed')::boolean then raise exception 'pe_course_delivery_paused';end if;end if;
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
 if p_role='student' then delivery:=pe_course_policy_access(p_actor_id,c.course_id,'grant');end if;
 result:=jsonb_build_object('schemaVersion',1,'delivery',delivery,'cohort',jsonb_build_object('id',c.id,'title',c.title,'definitionId',c.definition_id,'contentHash',c.content_hash,'timezone',c.timezone,'opensAt',c.opens_at,'closesAt',c.closes_at,'assignedInstructorId',c.assigned_instructor_id,'courseId',c.course_id,'unitId',c.unit_id,'category',c.category,'initialMinimumMs',c.initial_min_ms,'plannedMs',c.planned_ms),'actorId',p_actor_id,'role',p_role,'revision',m.revision,'stage',stage,'observedMs',m.observed_ms,'serverAt',now_at,'evidence',evidence,'receiptId',event_id,'creditEligible',false,'certificateEligible',false,'bankingEligible',false,'durationValidated',false);
 if op not in ('snapshot','export') then insert into pe_course_receipts values(cid,p_actor_id,rid,p_request,result); end if;
 return result;
end$$;
alter table pe_course_rosters enable row level security;
alter table pe_course_roster_members enable row level security;
alter table pe_course_rocs_documents enable row level security;
alter table pe_course_identity_evidence enable row level security;
alter table pe_course_rocs_presentations enable row level security;
alter table pe_course_rocs_acceptances enable row level security;
alter table pe_course_readiness_receipts enable row level security;
revoke all on pe_course_rosters,pe_course_roster_members from public,anon,authenticated;
revoke all on pe_course_rocs_documents,pe_course_identity_evidence,pe_course_rocs_presentations,pe_course_rocs_acceptances,pe_course_readiness_receipts from public,anon,authenticated,service_role;
grant select on pe_course_rosters,pe_course_roster_members to service_role;
grant select on pe_course_rocs_documents to service_role;
grant select,insert,update(self_reported_nmls_id) on pe_course_identity_evidence to service_role;
grant select,insert on pe_course_rocs_presentations,pe_course_rocs_acceptances,pe_course_readiness_receipts to service_role;
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
revoke all on function pe_course_now(),pe_course_immutable(),pe_course_rocs_document_guard(),pe_course_validate_cohort(),pe_course_command(uuid,text,jsonb),pe_course_readiness(uuid,uuid,boolean),pe_course_assert_ready(uuid,uuid),pe_course_readiness_command(uuid,jsonb) from public,anon,authenticated;
grant execute on function pe_course_now(),pe_course_command(uuid,text,jsonb),pe_course_readiness(uuid,uuid,boolean),pe_course_assert_ready(uuid,uuid),pe_course_readiness_command(uuid,jsonb) to service_role;

create function pe_course_dispatch(p_actor_id uuid,p_role text,p_request jsonb) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare c pe_course_cohorts; cid uuid; input jsonb; result jsonb; results jsonb:='[]'::jsonb; op text;
begin
 if jsonb_typeof(p_request)<>'object' then raise exception 'pe_course_invalid_request'; end if;
 begin cid:=(p_request->>'courseId')::uuid; exception when others then raise exception 'pe_course_invalid_request'; end;
 op:=p_request->>'operation';
 if op in ('readiness-snapshot','present-rocs','accept-rocs','decline-rocs','save-self-reported-id') then return pe_course_readiness_command(p_actor_id,p_request);end if;
 if op in ('policy-snapshot','policy-break','policy-resume') then return pe_course_policy_control(p_actor_id,p_role,p_request);end if;
 perform pg_advisory_xact_lock(hashtextextended(p_actor_id::text,0));
 if op in ('course-snapshot','course-export') then
  if (select count(*) from jsonb_object_keys(p_request))<>3 or not(p_request ?& array['operation','courseId','courseHash']) then raise exception 'pe_course_invalid_request'; end if;
  if (select count(*) from pe_course_cohorts where course_id=cid)<>25 then raise exception 'pe_course_course_incomplete'; end if;
  perform 1 from pe_course_cohorts where course_id=cid order by unit_id for update;
  for c in select * from pe_course_cohorts where course_id=cid order by unit_id loop
   result:=pe_course_command(p_actor_id,p_role,jsonb_build_object('operation','export','cohortId',c.id,'contentHash',c.content_hash,'courseHash',p_request->>'courseHash'));
   results:=results||jsonb_build_array(result);
  end loop;
  return jsonb_build_object('units',results,'creditEligible',false,'certificateEligible',false,'bankingEligible',false,'protectedFinalAvailable',false,'durationValidated',false)||case when op='course-export' then jsonb_build_object('policyEvidence',jsonb_build_object(
   'schemaVersion',1,'courseId',cid,'actorId',p_actor_id,'role',p_role,'scope','course_restriction_reservations_not_observed_time','creditedMs',0,
   'intervals',(select coalesce(jsonb_agg(jsonb_build_object('id',i.id,'actorId',i.actor_id,'courseId',i.course_id,'startsAt',i.starts_at,'endsAt',i.ends_at) order by i.id),'[]'::jsonb) from pe_course_policy_intervals i join pe_course_roster_members m on m.course_id=i.course_id and m.actor_id=i.actor_id and m.role='student' where i.course_id=cid and (p_role='instructor' or i.actor_id=p_actor_id)),
   'events',(select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'actorId',e.actor_id,'courseId',e.course_id,'kind',e.kind,'at',e.at,'body',e.body) order by e.id),'[]'::jsonb) from pe_course_policy_events e join pe_course_roster_members m on m.course_id=e.course_id and m.actor_id=e.actor_id and m.role='student' where e.course_id=cid and (p_role='instructor' or e.actor_id=p_actor_id)))) else '{}'::jsonb end;
 end if;
 select * into c from pe_course_cohorts where course_id=cid and unit_id=p_request->>'unitId';
 if not found then raise exception 'pe_course_access_denied'; end if;
 input:=(p_request-'courseId'-'unitId')||jsonb_build_object('cohortId',c.id,'contentHash',c.content_hash);
 return pe_course_command(p_actor_id,p_role,input);
end$$;
revoke all on function pe_course_roster_pin(),pe_course_dispatch(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function pe_course_dispatch(uuid,text,jsonb) to service_role;

create table pe_course_setup_receipts(actor_id uuid not null references students(id),request_id uuid not null,request jsonb not null,response jsonb not null,primary key(actor_id,request_id));
create table pe_course_setup_events(id bigint generated always as identity primary key,course_id uuid not null references pe_course_rosters(id),actor_id uuid not null references students(id),kind text not null,occurred_at timestamptz not null,body jsonb not null);
create trigger pe_course_setup_receipts_immutable before update or delete on pe_course_setup_receipts for each row execute function pe_course_immutable();
create trigger pe_course_setup_events_immutable before update or delete on pe_course_setup_events for each row execute function pe_course_immutable();
alter table pe_course_setup_receipts enable row level security;alter table pe_course_setup_events enable row level security;
revoke all on pe_course_setup_receipts,pe_course_setup_events from public,anon,authenticated,service_role;
grant select,insert on pe_course_setup_receipts,pe_course_setup_events to service_role;grant usage,select on sequence pe_course_setup_events_id_seq to service_role;
grant insert on pe_course_rosters,pe_course_roster_members,pe_course_cohorts,pe_course_members to service_role;

create function pe_course_setup_command(p_actor uuid,p_role text,input jsonb) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare op text;cid uuid;rid uuid;instructor uuid;learner_text text;learner uuid;unit jsonb;cohort_id uuid;prior pe_course_setup_receipts;r pe_course_rosters;result jsonb;now_at timestamptz:=pe_course_now();
begin
 if p_actor is null or p_role not in ('owner','administrator','instructor') or jsonb_typeof(input)<>'object' then raise exception 'pe_course_setup_invalid_request';end if;
 op:=input->>'operation';begin cid:=(input->>'courseId')::uuid;if input ? 'requestId' then rid:=(input->>'requestId')::uuid;end if;exception when others then raise exception 'pe_course_setup_invalid_request';end;
 if not exists(select 1 from current_staff_actor_bindings where auth_user_id=p_actor and actor_role=p_role and scope_state is null and binding_status='active' and (effective_at is null or effective_at<=now_at) and (expires_at is null or expires_at>now_at)) then raise exception 'pe_course_setup_access_denied';end if;
 if op='snapshot' then
  if (select count(*) from jsonb_object_keys(input))<>2 then raise exception 'pe_course_setup_invalid_request';end if;
  select * into r from pe_course_rosters where id=cid;if not found or (p_role='instructor' and r.assigned_instructor_id<>p_actor) then raise exception 'pe_course_setup_access_denied';end if;
  return jsonb_build_object('schemaVersion',1,'courseId',cid,'title',r.title,'mode',r.offering_mode,'enabled',r.enabled,'assignedInstructorId',r.assigned_instructor_id,
   'unitCount',(select count(*) from pe_course_cohorts where course_id=cid),'members',(select coalesce(jsonb_agg(jsonb_build_object('actorId',actor_id,'role',role,'active',active) order by role,actor_id),'[]'::jsonb) from pe_course_roster_members where course_id=cid),
   'creditEligible',false,'certificateEligible',false,'bankingEligible',false);
 end if;
 if op not in ('create','revoke-member') or rid is null then raise exception 'pe_course_setup_invalid_request';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_actor::text,0));select * into prior from pe_course_setup_receipts where actor_id=p_actor and request_id=rid;
 if found then if prior.request<>input then raise exception 'pe_course_setup_idempotency_conflict';end if;return prior.response;end if;
 if op='create' then
  if p_role not in ('owner','administrator') or (select count(*) from jsonb_object_keys(input))<>15 or jsonb_typeof(input->'units')<>'array' or jsonb_array_length(input->'units')<>25 or jsonb_typeof(input->'learners')<>'array' or jsonb_array_length(input->'learners')<1 then raise exception 'pe_course_setup_invalid_request';end if;
  begin instructor:=(input->>'instructorId')::uuid;exception when others then raise exception 'pe_course_setup_invalid_request';end;
  if not exists(select 1 from students s join current_staff_actor_bindings b on b.auth_user_id=s.id and b.actor_role='instructor' and b.scope_state is null and b.binding_status='active' and (b.effective_at is null or b.effective_at<=now_at) and (b.expires_at is null or b.expires_at>now_at) where s.id=instructor and s.account_status='active') then raise exception 'pe_course_setup_instructor_required';end if;
  if not exists(select 1 from pe_course_rocs_documents where version=input->>'rocsVersion' and document_hash=input->>'rocsDocumentHash' and rendered_hash=input->>'rocsRenderedHash' and revoked_at is null) then raise exception 'pe_course_setup_rocs_required';end if;
  if (select count(distinct x->>'unitId') from jsonb_array_elements(input->'units') x)<>25 then raise exception 'pe_course_setup_invalid_request';end if;
  insert into pe_course_rosters(id,title,content_hash,timezone,opens_at,closes_at,assigned_instructor_id,offering_mode,rocs_version,rocs_document_hash,rocs_rendered_hash)
   values(cid,input->>'title',input->>'courseHash',input->>'timezone',(input->>'opensAt')::timestamptz,(input->>'closesAt')::timestamptz,instructor,'prerequisite_bound',input->>'rocsVersion',input->>'rocsDocumentHash',input->>'rocsRenderedHash');
  insert into pe_course_roster_members values(cid,instructor,'instructor',true);
  for learner_text in select jsonb_array_elements_text(input->'learners') loop begin learner:=learner_text::uuid;exception when others then raise exception 'pe_course_setup_invalid_request';end;
   if not exists(select 1 from students where id=learner and account_status='active') then raise exception 'pe_course_setup_learner_required';end if;
   insert into pe_course_roster_members values(cid,learner,'student',true);insert into pe_course_identity_evidence(course_id,actor_id,status) values(cid,learner,'pending');
  end loop;
  for unit in select * from jsonb_array_elements(input->'units') loop
   if (select count(*) from jsonb_object_keys(unit))<>6 then raise exception 'pe_course_setup_invalid_request';end if;cohort_id:=gen_random_uuid();
   insert into pe_course_cohorts(id,title,course_id,unit_id,category,initial_min_ms,planned_ms,definition_id,content_hash,timezone,opens_at,closes_at,assigned_instructor_id)
    values(cohort_id,unit->>'title',cid,unit->>'unitId',unit->>'category',(unit->>'initialMinimumMs')::bigint,(unit->>'plannedMs')::bigint,input->>'definitionId',unit->>'contentHash',input->>'timezone',(input->>'opensAt')::timestamptz,(input->>'closesAt')::timestamptz,instructor);
   insert into pe_course_members(cohort_id,actor_id,role,active) values(cohort_id,instructor,'instructor',true);
   for learner_text in select jsonb_array_elements_text(input->'learners') loop insert into pe_course_members(cohort_id,actor_id,role,active) values(cohort_id,learner_text::uuid,'student',true);end loop;
  end loop;
  insert into pe_course_setup_events(course_id,actor_id,kind,occurred_at,body) values(cid,p_actor,'created',now_at,jsonb_build_object('mode','prerequisite_bound','unitCount',25,'learnerCount',jsonb_array_length(input->'learners')));
 else
  if (select count(*) from jsonb_object_keys(input))<>4 then raise exception 'pe_course_setup_invalid_request';end if;begin learner:=(input->>'learnerId')::uuid;exception when others then raise exception 'pe_course_setup_invalid_request';end;
  select * into r from pe_course_rosters where id=cid for update;if not found or (p_role='instructor' and r.assigned_instructor_id<>p_actor) then raise exception 'pe_course_setup_access_denied';end if;
  update pe_course_roster_members set active=false where course_id=cid and actor_id=learner and role='student';if not found then raise exception 'pe_course_setup_learner_required';end if;
  update pe_course_members pm set active=false where pm.actor_id=learner and pm.cohort_id in(select c.id from pe_course_cohorts c where c.course_id=cid);update pe_course_leases l set mode='paused' where l.actor_id=learner;
  insert into pe_course_setup_events(course_id,actor_id,kind,occurred_at,body) values(cid,p_actor,'member_revoked',now_at,jsonb_build_object('learnerId',learner));
 end if;
 result:=pe_course_setup_command(p_actor,p_role,jsonb_build_object('operation','snapshot','courseId',cid));insert into pe_course_setup_receipts values(p_actor,rid,input,result);return result;
end$$;
revoke all on function pe_course_setup_command(uuid,text,jsonb) from public,anon,authenticated;grant execute on function pe_course_setup_command(uuid,text,jsonb) to service_role;

commit;
