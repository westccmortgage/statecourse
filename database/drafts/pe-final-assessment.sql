-- DRAFT: private NONCREDIT assessment only. Never applied to a connected service.
-- Depends on the reviewed pe-course-workbench draft and existing staff binding view.
begin;
create table pe_final_settings (
 singleton boolean primary key default true check(singleton), enabled boolean not null default false,
 course_hash text not null, bank_digest text not null, source_review_verified boolean not null default false,
 human_sme_verified boolean not null default false, human_sme_reference text,
 regulatory_release_verified boolean not null default false, regulatory_release_reference text,
 rocs_document_hash text,
 check(course_hash ~ '^[a-f0-9]{64}$'), check(bank_digest ~ '^[a-f0-9]{64}$')
);
create table pe_final_bank_items (
 bank_digest text not null, item_id text not null, unit_id text not null, module_id text not null,
 correct_choice text not null check(correct_choice in ('A','B','C','D')), primary key(bank_digest,item_id)
);
create table pe_final_prerequisites (
 course_id uuid not null references pe_course_rosters(id), actor_id uuid not null references students(id),
 identity_verified boolean not null default false, identity_reference text,
 rocs_version text, rocs_document_hash text, rocs_accepted_at timestamptz,
 delivery_policy_verified boolean not null default false, lock_token boolean not null default true check(lock_token), delivery_policy_id text, delivery_policy_reference text, primary key(course_id,actor_id)
);
create table pe_final_checks (
 id uuid primary key default gen_random_uuid(), sequence bigint generated always as identity unique,
 course_id uuid not null references pe_course_rosters(id), unit_id text not null,
 actor_id uuid not null references students(id), teaching_revision_id uuid not null references pe_course_events(id),
 previous_check_id uuid references pe_final_checks(id), body text not null check(length(btrim(body)) between 20 and 8000),
 created_at timestamptz not null
);
create index pe_final_checks_latest on pe_final_checks(course_id,actor_id,unit_id,sequence desc);
create table pe_final_check_reviews (
 id uuid primary key default gen_random_uuid(), check_id uuid not null unique references pe_final_checks(id),
 instructor_id uuid not null references students(id), decision text not null check(decision in ('accepted','revise')),
 feedback text not null check(length(btrim(feedback)) between 20 and 8000), created_at timestamptz not null
);
create table pe_final_actor_state (
 course_id uuid not null references pe_course_rosters(id), actor_id uuid not null references students(id),
 revision integer not null default 0, primary key(course_id,actor_id)
);
create table pe_final_attempts (
 id uuid primary key, course_id uuid not null references pe_course_rosters(id),actor_id uuid not null references students(id),
 bank_digest text not null, number integer not null check(number in (1,2)), form jsonb not null,
 state text not null check(state in ('active','submitted','expired')), started_at timestamptz not null, expires_at timestamptz not null,
 answers jsonb, grade jsonb, graded_at timestamptz, unique(course_id,actor_id,number)
);
create table pe_final_receipts (
 course_id uuid not null,actor_id uuid not null,request_id uuid not null,
 request jsonb not null,response jsonb not null,primary key(course_id,actor_id,request_id)
);
create function pe_final_attempt_guard() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if tg_op='DELETE' or old.state<>'active' then raise exception 'pe_final_attempt_immutable';end if;
 if (new.id,new.course_id,new.actor_id,new.bank_digest,new.number,new.form,new.started_at,new.expires_at)
 is distinct from (old.id,old.course_id,old.actor_id,old.bank_digest,old.number,old.form,old.started_at,old.expires_at)
 then raise exception 'pe_final_attempt_immutable';end if;
 if new.state='expired' then
  if new.answers is not null or new.grade is not null or new.graded_at is not null then raise exception 'pe_final_attempt_immutable';end if;
 elsif new.state<>'submitted' or new.answers is null or new.grade is null or new.graded_at is null then raise exception 'pe_final_attempt_immutable';end if;
 return new;
end$$;
create trigger pe_final_attempt_immutable before update or delete on pe_final_attempts for each row execute function pe_final_attempt_guard();
create trigger pe_final_bank_immutable before update or delete on pe_final_bank_items for each row execute function pe_course_immutable();
create trigger pe_final_checks_immutable before update or delete on pe_final_checks for each row execute function pe_course_immutable();
create trigger pe_final_reviews_immutable before update or delete on pe_final_check_reviews for each row execute function pe_course_immutable();
create trigger pe_final_receipts_immutable before update or delete on pe_final_receipts for each row execute function pe_course_immutable();

create function pe_final_holds(cid uuid,p_actor uuid,settings pe_final_settings,roster pe_course_rosters,current_attempt pe_final_attempts,now_at timestamptz,full_check boolean) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare holds jsonb:='[]';prerequisite pe_final_prerequisites;complete_units integer;missing integer;
begin
 perform 1 from pe_course_cohorts c join pe_course_members m on m.cohort_id=c.id and m.actor_id=p_actor where c.course_id=cid order by c.unit_id for share of c,m;
 perform 1 from students i join pe_course_roster_members m on m.actor_id=i.id and m.course_id=cid where i.id=roster.assigned_instructor_id for share of i,m;
 select * into prerequisite from pe_final_prerequisites where course_id=cid and actor_id=p_actor for share;
 -- Every potentially waiting authority lock is held before the time-sensitive
 -- binding/consent checks. The caller rechecks the window after this evaluator.
 now_at:=pe_course_now();
 if not exists(select 1 from students i join pe_course_roster_members m on m.actor_id=i.id and m.course_id=cid and m.role='instructor' and m.active join current_staff_actor_bindings b on b.auth_user_id=i.id and b.actor_role='instructor' and b.scope_state is null and b.binding_status='active' and (b.effective_at is null or b.effective_at<=now_at) and (b.expires_at is null or b.expires_at>now_at) where i.id=roster.assigned_instructor_id and i.account_status='active') then holds:=holds||'"instructor_required"'::jsonb;end if;
 -- Eligibility is derived from pinned server evidence, never browser flags.
 if not settings.source_review_verified then holds:=holds||'"bank_source_review_required"'::jsonb;end if;
 if not settings.human_sme_verified or coalesce(length(settings.human_sme_reference),0)=0 then holds:=holds||'"human_sme_required"'::jsonb;end if;
 if not settings.regulatory_release_verified or coalesce(length(settings.regulatory_release_reference),0)=0 then holds:=holds||'"regulatory_release_required"'::jsonb;end if;
 if (select count(*) from pe_final_bank_items where bank_digest=settings.bank_digest)<>50 then holds:=holds||'"bank_incomplete"'::jsonb;end if;
 if prerequisite.actor_id is null or not prerequisite.identity_verified or coalesce(length(prerequisite.identity_reference),0)=0 then holds:=holds||'"identity_required"'::jsonb;end if;
 if prerequisite.rocs_version is distinct from '4' or prerequisite.rocs_document_hash is distinct from settings.rocs_document_hash or prerequisite.rocs_document_hash!~'^[a-f0-9]{64}$' or prerequisite.rocs_document_hash is null or prerequisite.rocs_accepted_at is null or prerequisite.rocs_accepted_at>now_at or prerequisite.rocs_accepted_at>(select min(e.occurred_at) from pe_course_events e join pe_course_cohorts c on c.id=e.cohort_id where c.course_id=cid and e.actor_id=p_actor) then holds:=holds||'"rocs_required"'::jsonb;end if;
 if prerequisite.delivery_policy_verified is distinct from true or prerequisite.delivery_policy_id is distinct from 'pe-oil-restriction-draft-v1' or coalesce(length(prerequisite.delivery_policy_reference),0)=0 then holds:=holds||'"delivery_policy_required"'::jsonb;end if;
 select count(distinct c.unit_id) into complete_units from pe_course_cohorts c join pe_course_events e on e.cohort_id=c.id and e.actor_id=p_actor and e.kind='revise' join pe_course_members m on m.cohort_id=c.id and m.actor_id=p_actor and m.active and m.role='student' where c.course_id=cid and c.enabled;
 if complete_units<>25 or (select count(*) from pe_course_cohorts where course_id=cid)<>25 then holds:=holds||'"teaching_required"'::jsonb;end if;
 select count(*) into missing from pe_course_cohorts c where c.course_id=cid and not exists(
  select 1 from pe_final_checks q join pe_final_check_reviews r on r.check_id=q.id and r.decision='accepted' and r.instructor_id=roster.assigned_instructor_id
  where q.course_id=cid and q.unit_id=c.unit_id and q.actor_id=p_actor and not exists(select 1 from pe_final_checks newer where newer.course_id=cid and newer.actor_id=p_actor and newer.unit_id=c.unit_id and newer.sequence>q.sequence)
  and (not full_check or current_attempt.grade->>'passed' is distinct from 'false' or not(current_attempt.grade->'remediationModules' ? ('PE'||lpad(substring(c.unit_id from '^[0-9]+'),2,'0'))) or q.created_at>current_attempt.graded_at));
 if missing<>0 then holds:=holds||'"learning_checks_required"'::jsonb;end if;
 if full_check then
 if current_attempt.grade->>'passed'='true' then holds:=holds||'"already_passed"'::jsonb;elsif current_attempt.state='expired' or (current_attempt.number=2 and current_attempt.state<>'active') then holds:=holds||'"staff_review_required"'::jsonb;end if;
 end if;
 return holds;
end$$;

create function pe_final_command(p_actor uuid,p_role text,p_request jsonb,p_candidate jsonb default null) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare
 settings pe_final_settings; roster pe_course_rosters; prerequisite pe_final_prerequisites;
 current_attempt pe_final_attempts; receipt pe_final_receipts; current_check pe_final_checks;
 cid uuid; rid uuid; tid uuid; unit text; op text; now_at timestamptz; actor_revision integer:=0;
 payload jsonb; output jsonb; checks jsonb; holds jsonb:='[]'; candidate_id uuid; count_correct integer;
 missing integer; complete_units integer; valid_keys text[]; computed_grade jsonb; failed_modules jsonb; delivery jsonb;
begin
 if p_actor is null or p_role not in ('student','instructor') or jsonb_typeof(p_request)<>'object' then raise exception 'pe_final_invalid_request'; end if;
 op:=p_request->>'operation';valid_keys:=array['operation','courseId','courseHash','bankDigest'];
 if op not in ('snapshot','submit_check','review_check','begin','submit') or op is null then raise exception 'pe_final_invalid_request'; end if;
 if op<>'snapshot' then valid_keys:=valid_keys||array['requestId','expectedRevision']; end if;
 if op='submit_check' then valid_keys:=valid_keys||array['unitId','teachingRevisionId','previousCheckId','text']; end if;
 if op='review_check' then valid_keys:=valid_keys||array['checkId','decision','text']; end if;
 if op='submit' then valid_keys:=valid_keys||array['attemptId','answers']; end if;
 if (select count(*) from jsonb_object_keys(p_request))<>cardinality(valid_keys) or exists(select 1 from jsonb_object_keys(p_request) k where not(k=any(valid_keys))) then raise exception 'pe_final_invalid_request'; end if;
 begin cid:=(p_request->>'courseId')::uuid;rid:=(p_request->>'requestId')::uuid;
 if op<>'snapshot' and (rid is null or jsonb_typeof(p_request->'expectedRevision') is distinct from 'number' or (p_request->>'expectedRevision')!~'^(0|[1-9][0-9]*)$') then raise exception 'bad';end if;
 exception when others then raise exception 'pe_final_invalid_request'; end;
 perform 1 from pe_course_settings where singleton for share;
 if not found or not exists(select 1 from pe_course_settings where singleton and enabled) then raise exception 'pe_final_disabled';end if;
 select * into settings from pe_final_settings where singleton for share;
 if not found or not settings.enabled or not exists(select 1 from pe_course_settings where singleton and enabled) then raise exception 'pe_final_disabled'; end if;
 if settings.course_hash is distinct from p_request->>'courseHash' or settings.bank_digest is distinct from p_request->>'bankDigest' then raise exception 'pe_final_content_changed'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_actor::text,0));
 select * into roster from pe_course_rosters where id=cid and enabled for share;
 if not found or roster.content_hash<>settings.course_hash then raise exception 'pe_final_access_denied'; end if;
 now_at:=pe_course_now();if now_at<roster.opens_at or now_at>=roster.closes_at then raise exception 'pe_final_window_closed'; end if;
 perform 1 from students s join pe_course_roster_members m on m.actor_id=s.id where s.id=p_actor and s.account_status='active' and m.course_id=cid and m.active and m.role=p_role for share of s,m;
 if not found then raise exception 'pe_final_access_denied'; end if;
 now_at:=pe_course_now();if now_at<roster.opens_at or now_at>=roster.closes_at then raise exception 'pe_final_window_closed';end if;
 if p_role='instructor' then
  if roster.assigned_instructor_id<>p_actor or not exists(select 1 from current_staff_actor_bindings where auth_user_id=p_actor and actor_role='instructor' and scope_state is null and binding_status='active' and (effective_at is null or effective_at<=now_at) and (expires_at is null or expires_at>now_at)) or op not in ('snapshot','review_check') then raise exception 'pe_final_access_denied';end if;
 elsif op='review_check' then raise exception 'pe_final_access_denied';end if;
 if p_role='student' then delivery:=pe_course_policy_access(p_actor,cid,'grant');end if;
 if p_role='student' and op<>'snapshot' and not(delivery->>'allowed')::boolean then raise exception 'pe_final_delivery_paused';end if;
 select revision into actor_revision from pe_final_actor_state where course_id=cid and actor_id=p_actor for update;actor_revision:=coalesce(actor_revision,0);
 select * into current_attempt from pe_final_attempts where course_id=cid and actor_id=p_actor order by number desc limit 1 for update;
 now_at:=pe_course_now();
 -- Snapshot commits a terminal expiration rather than resurrecting a form if a
 -- later clock adjustment occurs. No score is fabricated for an incomplete form.
 if op='snapshot' and current_attempt.state='active' and now_at>=current_attempt.expires_at then
  update pe_final_attempts set state='expired' where id=current_attempt.id returning * into current_attempt;
  actor_revision:=actor_revision+1;insert into pe_final_actor_state values(cid,p_actor,actor_revision) on conflict(course_id,actor_id) do update set revision=excluded.revision;
 end if;
 now_at:=pe_course_now();
 if now_at<roster.opens_at or now_at>=roster.closes_at then raise exception 'pe_final_window_closed';end if;
 if op in ('begin','submit') then
  holds:=pe_final_holds(cid,p_actor,settings,roster,current_attempt,now_at,op='begin');
  now_at:=pe_course_now();
  if now_at<roster.opens_at or now_at>=roster.closes_at then raise exception 'pe_final_window_closed';end if;
  if jsonb_array_length(holds)>0 then raise exception 'pe_final_prerequisites_required';end if;
 end if;
 if op<>'snapshot' then
  select * into receipt from pe_final_receipts where course_id=cid and actor_id=p_actor and request_id=rid;
  if found then
   if receipt.request<>p_request then raise exception 'pe_final_idempotency_conflict';end if;
   holds:=pe_final_holds(cid,p_actor,settings,roster,current_attempt,pe_course_now(),true);
   now_at:=pe_course_now();
   if now_at<roster.opens_at or now_at>=roster.closes_at then raise exception 'pe_final_window_closed';end if;
   if p_role='instructor' and holds ? 'instructor_required' then raise exception 'pe_final_access_denied';end if;
   if op='begin' and jsonb_array_length(holds)>0 then raise exception 'pe_final_prerequisites_required';end if;
   if op='begin' and (current_attempt.id is distinct from (receipt.response->'attempt'->>'id')::uuid or current_attempt.state<>'active' or current_attempt.expires_at<=now_at) then raise exception 'pe_final_attempt_conflict';end if;
   return receipt.response||jsonb_build_object('serverAt',now_at,'holds',holds,'delivery',delivery);
  end if;
  if actor_revision<>(p_request->>'expectedRevision')::integer then raise exception 'pe_final_revision_conflict';end if;
 end if;
 if op='submit_check' then
  if current_attempt.state='active' or current_attempt.grade->>'passed'='true' then raise exception 'pe_final_attempt_locked';end if;
  unit:=p_request->>'unitId';
  perform 1 from pe_course_events e join pe_course_cohorts c on c.id=e.cohort_id where c.course_id=cid and c.unit_id=unit and c.enabled and e.id=(p_request->>'teachingRevisionId')::uuid and e.actor_id=p_actor and e.kind='revise' for share of c;
  if not found then raise exception 'pe_final_teaching_required';end if;
  select * into current_check from pe_final_checks where course_id=cid and actor_id=p_actor and unit_id=unit order by sequence desc limit 1;
  if current_check.id is distinct from (p_request->>'previousCheckId')::uuid then raise exception 'pe_final_check_conflict';end if;
  if current_check.id is not null and not exists(select 1 from pe_final_check_reviews where check_id=current_check.id) then raise exception 'pe_final_review_pending';end if;
  insert into pe_final_checks(course_id,unit_id,actor_id,teaching_revision_id,previous_check_id,body,created_at) values(cid,unit,p_actor,(p_request->>'teachingRevisionId')::uuid,current_check.id,p_request->>'text',now_at) returning id into tid;
 elsif op='review_check' then
  select * into current_check from pe_final_checks where id=(p_request->>'checkId')::uuid and course_id=cid for update;
  if not found then raise exception 'pe_final_access_denied';end if;
  perform pg_advisory_xact_lock(hashtextextended(current_check.actor_id::text,0));
  perform 1 from students s join pe_course_roster_members m on m.actor_id=s.id where s.id=current_check.actor_id and s.account_status='active' and m.course_id=cid and m.active and m.role='student' for share of s,m;
  if not found then raise exception 'pe_final_access_denied';end if;
  if exists(select 1 from pe_final_checks where course_id=cid and actor_id=current_check.actor_id and unit_id=current_check.unit_id and sequence>current_check.sequence) or exists(select 1 from pe_final_check_reviews where check_id=current_check.id) then raise exception 'pe_final_check_conflict';end if;
  insert into pe_final_check_reviews(check_id,instructor_id,decision,feedback,created_at) values(current_check.id,p_actor,p_request->>'decision',p_request->>'text',now_at) returning id into tid;
 elsif op='submit' then
  if (select count(*) from pe_course_cohorts c join pe_course_members m on m.cohort_id=c.id and m.actor_id=p_actor and m.active and m.role='student' where c.course_id=cid and c.enabled)<>25 or (select count(*) from pe_final_bank_items where bank_digest=settings.bank_digest)<>50 then raise exception 'pe_final_prerequisites_required';end if;
  if current_attempt.id is distinct from (p_request->>'attemptId')::uuid or current_attempt.state<>'active' then raise exception 'pe_final_attempt_conflict';end if;
  if now_at>=current_attempt.expires_at then raise exception 'pe_final_attempt_expired';end if;
  if jsonb_typeof(p_request->'answers')<>'object' or (select count(*) from jsonb_object_keys(p_request->'answers'))<>25 or exists(select 1 from jsonb_each_text(p_request->'answers') a where not(current_attempt.form->'questionIds' ? a.key) or a.value not in ('A','B','C','D')) then raise exception 'pe_final_invalid_answers';end if;
  select count(*) into count_correct from pe_final_bank_items i join jsonb_each_text(p_request->'answers') a on a.key=i.item_id where i.bank_digest=settings.bank_digest and a.value=i.correct_choice;
  select coalesce(jsonb_agg(distinct i.module_id order by i.module_id),'[]') into failed_modules from pe_final_bank_items i join jsonb_each_text(p_request->'answers') a on a.key=i.item_id where i.bank_digest=settings.bank_digest and a.value<>i.correct_choice;
  computed_grade:=jsonb_build_object('passed',count_correct>=18,'correct',count_correct,'total',25,'requiredCorrect',18,'percent',count_correct*4,'disposition',case when count_correct>=18 then 'private_final_passed' when current_attempt.number=1 then 'remediation_required' else 'staff_review_required' end,'remediationModules',case when count_correct>=18 then '[]'::jsonb else failed_modules end,'assignedCreditMs',0,'creditEligible',false,'certificateEligible',false,'bankingEligible',false);
  update pe_final_attempts set state='submitted',answers=p_request->'answers',grade=computed_grade,graded_at=now_at where id=current_attempt.id returning * into current_attempt;tid:=current_attempt.id;
 end if;
 holds:=pe_final_holds(cid,p_actor,settings,roster,current_attempt,pe_course_now(),true);
 if op='begin' then
  if current_attempt.state='active' then raise exception 'pe_final_attempt_active';end if;
  if jsonb_array_length(holds)>0 then raise exception 'pe_final_prerequisites_required';end if;
  if jsonb_typeof(p_candidate)<>'object' or p_candidate->>'actorId'<>p_actor::text or p_candidate->>'courseId'<>cid::text or p_candidate->>'bankDigest'<>settings.bank_digest or (p_candidate->>'number')::integer<>coalesce(current_attempt.number,0)+1 or jsonb_array_length(p_candidate->'questionIds')<>25 then raise exception 'pe_final_candidate_invalid';end if;
  if (select count(distinct q) from jsonb_array_elements_text(p_candidate->'questionIds') q)<>25 or exists(select 1 from jsonb_array_elements_text(p_candidate->'questionIds') q where not exists(select 1 from pe_final_bank_items where bank_digest=settings.bank_digest and item_id=q)) or (select count(distinct i.unit_id) from pe_final_bank_items i where bank_digest=settings.bank_digest and p_candidate->'questionIds' ? i.item_id)<>25 then raise exception 'pe_final_candidate_invalid';end if;
  if jsonb_typeof(p_candidate->'optionOrder')<>'object' or (select count(*) from jsonb_object_keys(p_candidate->'optionOrder'))<>25 or exists(select 1 from jsonb_array_elements_text(p_candidate->'questionIds') q where jsonb_typeof(p_candidate->'optionOrder'->q)<>'array' or jsonb_array_length(p_candidate->'optionOrder'->q)<>4 or (select count(distinct v) from jsonb_array_elements_text(p_candidate->'optionOrder'->q) v where v in ('A','B','C','D'))<>4) then raise exception 'pe_final_candidate_invalid';end if;
  if current_attempt.number=1 and exists(select 1 from jsonb_array_elements_text(p_candidate->'questionIds') q where current_attempt.form->'questionIds' ? q) then raise exception 'pe_final_retake_overlap';end if;
  if to_timestamp((p_candidate->>'expiresAt')::bigint/1000.0)<=now_at or to_timestamp((p_candidate->>'expiresAt')::bigint/1000.0)>least(roster.closes_at,now_at+interval '60 minutes') then raise exception 'pe_final_candidate_invalid';end if;
  candidate_id:=(p_candidate->>'id')::uuid;
  insert into pe_final_attempts(id,course_id,actor_id,bank_digest,number,form,state,started_at,expires_at) values(candidate_id,cid,p_actor,settings.bank_digest,(p_candidate->>'number')::integer,p_candidate,'active',now_at,to_timestamp((p_candidate->>'expiresAt')::bigint/1000.0)) returning * into current_attempt;tid:=candidate_id;
 end if;
 if op in ('begin','submit') and jsonb_array_length(pe_final_holds(cid,p_actor,settings,roster,current_attempt,pe_course_now(),false))>0 then raise exception 'pe_final_prerequisites_required';end if;
 if op in ('begin','submit') and pe_course_now()>=current_attempt.expires_at then raise exception 'pe_final_attempt_expired';end if;
 if pe_course_now()<roster.opens_at or pe_course_now()>=roster.closes_at then raise exception 'pe_final_window_closed';end if;
 now_at:=pe_course_now();
 holds:=pe_final_holds(cid,p_actor,settings,roster,current_attempt,now_at,true);
 now_at:=pe_course_now();
 if now_at<roster.opens_at or now_at>=roster.closes_at then raise exception 'pe_final_window_closed';end if;
 if p_role='instructor' and holds ? 'instructor_required' then raise exception 'pe_final_access_denied';end if;
 if op<>'snapshot' then
  actor_revision:=actor_revision+1;insert into pe_final_actor_state values(cid,p_actor,actor_revision) on conflict(course_id,actor_id) do update set revision=excluded.revision;
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'courseId',q.course_id,'unitId',q.unit_id,'actorId',q.actor_id,'teachingRevisionId',q.teaching_revision_id,'previousCheckId',q.previous_check_id,'text',q.body,'createdAt',q.created_at,'review',(select jsonb_build_object('id',r.id,'instructorId',r.instructor_id,'decision',r.decision,'feedback',r.feedback,'createdAt',r.created_at) from pe_final_check_reviews r where r.check_id=q.id)) order by q.sequence),'[]') into checks from pe_final_checks q where q.course_id=cid and (p_role='instructor' or q.actor_id=p_actor);
 if p_role='student' then delivery:=pe_course_policy_access(p_actor,cid,'grant');if op<>'snapshot' and not(delivery->>'allowed')::boolean then raise exception 'pe_final_delivery_paused';end if;end if;
 output:=jsonb_build_object('delivery',delivery,'courseId',cid,'actorId',p_actor,'role',p_role,'revision',actor_revision,'bankDigest',settings.bank_digest,'serverAt',now_at,'closesAt',roster.closes_at,'assignedInstructorId',roster.assigned_instructor_id,'checks',checks,'holds',holds,'attempt',current_attempt.form,'attemptState',current_attempt.state,'previousAnswers',current_attempt.answers,'grade',current_attempt.grade,'receiptId',tid,'creditEligible',false,'certificateEligible',false,'bankingEligible',false);
 if op<>'snapshot' then insert into pe_final_receipts values(cid,p_actor,rid,p_request,output);end if;
 return output;
end$$;
alter table pe_final_settings enable row level security;
alter table pe_final_bank_items enable row level security;
alter table pe_final_prerequisites enable row level security;
alter table pe_final_checks enable row level security;
alter table pe_final_check_reviews enable row level security;
alter table pe_final_actor_state enable row level security;
alter table pe_final_attempts enable row level security;
alter table pe_final_receipts enable row level security;
revoke all on pe_final_settings,pe_final_bank_items,pe_final_prerequisites,pe_final_checks,pe_final_check_reviews,pe_final_actor_state,pe_final_attempts,pe_final_receipts from public,anon,authenticated,service_role;
grant select on pe_final_settings,pe_final_bank_items to service_role;
grant update(singleton) on pe_course_settings,pe_final_settings to service_role; -- Inert true-only keys permit FOR SHARE without changing authority flags.
grant select on pe_final_prerequisites,pe_final_actor_state,pe_final_attempts to service_role;
grant update(lock_token) on pe_final_prerequisites to service_role;
grant update(revision) on pe_final_actor_state to service_role;
grant update(state,answers,grade,graded_at) on pe_final_attempts to service_role;
grant select,insert on pe_final_checks,pe_final_check_reviews,pe_final_receipts to service_role;
grant update(id) on pe_final_checks to service_role;
grant insert on pe_final_actor_state,pe_final_attempts to service_role;
grant usage,select on sequence pe_final_checks_sequence_seq to service_role;
revoke all on function pe_final_holds(uuid,uuid,pe_final_settings,pe_course_rosters,pe_final_attempts,timestamptz,boolean),pe_final_attempt_guard(),pe_final_command(uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function pe_final_holds(uuid,uuid,pe_final_settings,pe_course_rosters,pe_final_attempts,timestamptz,boolean),pe_final_command(uuid,text,jsonb,jsonb) to service_role;
commit;
