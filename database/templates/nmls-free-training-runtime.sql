-- Appended to the generated immutable course definition by the generator.
-- This lane is free training. It never writes CE review-policy/grant/history tables.
create table if not exists nmls_training_attempts (
 enrollment_id uuid primary key references enrollments(id),
 student_id uuid not null references students(id),
 course_id text not null,
 course_version text not null,
 revision bigint not null default 0 check(revision>=0),
 runtime jsonb,
 updated_at timestamptz not null default now(),
 foreign key(course_id,course_version) references nmls_training_definitions(course_id,course_version),
 check(runtime is null or (runtime->>'purpose'='free_training' and runtime->>'schema'='nmls-free-training-runtime-v1'))
);
create table if not exists nmls_training_events (
 enrollment_id uuid not null references nmls_training_attempts(enrollment_id),
 event_id uuid not null,
 student_id uuid not null references students(id),
 command_digest text not null check(command_digest ~ '^[a-f0-9]{64}$'),
 revision bigint not null check(revision>0),
 audit jsonb not null,
 recorded_at timestamptz not null default now(),
 primary key(enrollment_id,event_id),
 unique(enrollment_id,revision)
);
create trigger nmls_training_events_append_only before update or delete on nmls_training_events
 for each row execute function admin_console_refuse_record_mutation();

-- A training row can never acquire a payment or credit later, even through a service bug.
alter table enrollments add constraint nmls_training_identity_is_immutable check(
 course_id<>'nmls-ce-2026-comprehensive-8' or
 (state='US' and course_version='2026.3' and enrollment_origin='training'
 and checkout_attempt_id is null and compliance_credit_eligible=false)
);
-- A CHECK on the new row alone would permit moving an existing training row to
-- another course and then attaching a purchase. Preserve the original identity.
create function nmls_training_enrollment_identity_guard()
returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if old.course_id='nmls-ce-2026-comprehensive-8' and
 (new.id,new.student_id,new.course_id,new.state,new.course_version,new.enrollment_origin,new.checkout_attempt_id,new.compliance_credit_eligible,new.review_role)
 is distinct from
 (old.id,old.student_id,old.course_id,old.state,old.course_version,old.enrollment_origin,old.checkout_attempt_id,old.compliance_credit_eligible,old.review_role) then
 raise exception 'nmls_training_scope_mismatch';end if;
 return new;
end $$;
create trigger nmls_training_enrollment_identity_guard before update on enrollments
 for each row execute function nmls_training_enrollment_identity_guard();

create function nmls_training_definition(p_course_id text)
returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
 select to_jsonb(d) from nmls_training_definitions d
 where d.course_id=p_course_id and d.course_version='2026.3';
$$;

create function nmls_training_access(p_student_id uuid,p_enrollment_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare e enrollments%rowtype; c courses%rowtype; g access_grants%rowtype;
begin
 -- Keep the account and mutable entitlement rows stable until transaction end.
 perform 1 from students where id=p_student_id and account_status='active' for share;
 if not found then raise exception 'nmls_training_access_denied';end if;
 select * into e from enrollments where id=p_enrollment_id for share;
 if not found or e.student_id<>p_student_id or e.course_id<>'nmls-ce-2026-comprehensive-8'
 or e.state<>'US' or e.course_version<>'2026.3' or e.enrollment_origin<>'training'
 or e.compliance_credit_eligible or e.checkout_attempt_id is not null or e.status<>'active'
 or (e.expires_at is not null and e.expires_at<=clock_timestamp()) then raise exception 'nmls_training_access_denied';end if;
 select * into c from courses where id=e.course_id for share;
 if not found or c.state is distinct from 'US' or c.product_type is distinct from 'mortgage_continuing_education' or c.current_version is distinct from '2026.3' then
  raise exception 'nmls_training_scope_mismatch';end if;
 select * into g from access_grants where enrollment_id=e.id for share;
 if not found or g.student_id<>p_student_id or g.course_id<>e.course_id or g.status<>'active' then
  raise exception 'nmls_training_access_denied';end if;
 if not exists(select 1 from current_offering_governance where site='statecourse.com' and state='US'
 and discipline='mortgage' and offering_kind='course' and offering_id=e.course_id and training_access_enabled) then
  raise exception 'nmls_training_gate_closed';end if;
end $$;

create function nmls_training_context(p_student_id uuid,p_enrollment_id uuid,p_event_id uuid default null)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare a nmls_training_attempts%rowtype; d nmls_training_definitions%rowtype; ev jsonb; review_role text;
begin
 perform nmls_training_access(p_student_id,p_enrollment_id);
 select * into a from nmls_training_attempts where enrollment_id=p_enrollment_id for share;
 if not found or a.student_id<>p_student_id then raise exception 'nmls_training_access_denied';end if;
 -- Entitlement expiry or a governance revocation may occur during a lock wait.
 perform nmls_training_access(p_student_id,p_enrollment_id);
 select * into d from nmls_training_definitions where course_id=a.course_id and course_version=a.course_version;
 if not found then raise exception 'nmls_training_content_changed';end if;
 select jsonb_build_object('command_digest',command_digest,'revision',revision,'audit',audit) into ev
 from nmls_training_events where enrollment_id=a.enrollment_id and event_id=p_event_id;
 perform nmls_training_access(p_student_id,p_enrollment_id);
 select e.review_role into review_role from enrollments e where e.id=p_enrollment_id;
 return jsonb_build_object('enrollmentId',a.enrollment_id,'studentId',a.student_id,'courseId',a.course_id,
 'courseVersion',a.course_version,'reviewRole',review_role,'contentDigest',d.content_digest,'definitionDigest',d.definition_digest,
 'revision',a.revision,'runtime',a.runtime,'serverTimeMs',floor(extract(epoch from clock_timestamp())*1000)::bigint,'event',ev);
end $$;

create function nmls_training_enroll(p_student_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare e enrollments%rowtype; c courses%rowtype; existing boolean;
begin
 -- Serialize concurrent starts without manufacturing a purchase or reactivating withdrawal.
 perform 1 from students where id=p_student_id and account_status='active' for update;
 if not found then raise exception 'nmls_training_access_denied';end if;
 select * into c from courses where id='nmls-ce-2026-comprehensive-8' for share;
 if not found or c.state<>'US' or c.product_type<>'mortgage_continuing_education' or c.current_version<>'2026.3'
 or not exists(select 1 from nmls_training_definitions where course_id=c.id and course_version=c.current_version) then
 raise exception 'nmls_training_scope_mismatch';end if;
 if not exists(select 1 from current_offering_governance where site='statecourse.com' and state='US'
 and discipline='mortgage' and offering_kind='course' and offering_id=c.id and training_access_enabled) then
 raise exception 'nmls_training_gate_closed';end if;
 select * into e from enrollments where student_id=p_student_id and course_id=c.id order by created_at limit 1 for update;
 existing:=found;
 if not existing then
  insert into enrollments(student_id,course_id,state,status,compliance_credit_eligible,checkout_attempt_id,course_version,enrollment_origin)
  values(p_student_id,c.id,'US','active',false,null,'2026.3','training') returning * into e;
  insert into access_grants(enrollment_id,student_id,course_id,status) values(e.id,p_student_id,c.id,'active');
  insert into nmls_training_attempts(enrollment_id,student_id,course_id,course_version) values(e.id,p_student_id,c.id,'2026.3');
  insert into student_portal_state(enrollment_id,student_id,course_id,course_version,resume_path)
  values(e.id,p_student_id,c.id,'2026.3','/student/nmls-training/?enrollment_id='||e.id);
 end if;
 perform nmls_training_access(p_student_id,e.id);
 if not exists(select 1 from nmls_training_attempts where enrollment_id=e.id and student_id=p_student_id) then
  raise exception 'nmls_training_history_invalid';end if;
 return jsonb_build_object('enrollment',to_jsonb(e),'existing',existing);
end $$;

create function nmls_training_commit(p_student_id uuid,p_enrollment_id uuid,p_event_id uuid,p_command_digest text,
 p_expected_revision bigint,p_evaluated_at_ms bigint,p_runtime jsonb,p_audit jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare a nmls_training_attempts%rowtype; d nmls_training_definitions%rowtype; ev nmls_training_events%rowtype;
 old_phase text; new_phase text; idx integer; old_final jsonb; new_final jsonb; now_ms bigint;
begin
 perform nmls_training_access(p_student_id,p_enrollment_id);
 -- Read-only course review is an enrollment scope, never a browser flag or a
 -- global admin role. Check before replay/CAS as well as before any state write.
 if exists(select 1 from enrollments where id=p_enrollment_id and review_role='regulator_reviewer') then
  raise exception 'nmls_training_read_only';end if;
 select * into a from nmls_training_attempts where enrollment_id=p_enrollment_id for update;
 if not found or a.student_id<>p_student_id then raise exception 'nmls_training_access_denied';end if;
 perform nmls_training_access(p_student_id,p_enrollment_id);
 select * into ev from nmls_training_events where enrollment_id=a.enrollment_id and event_id=p_event_id;
 if found then
  if ev.command_digest is distinct from p_command_digest then raise exception 'nmls_training_event_conflict';end if;
  return nmls_training_context(p_student_id,p_enrollment_id,p_event_id)||jsonb_build_object('replayed',true);
 end if;
 if p_event_id is null or p_command_digest is null or p_command_digest !~ '^[a-f0-9]{64}$'
 or p_expected_revision is distinct from a.revision then raise exception 'nmls_training_revision_conflict';end if;
 now_ms:=floor(extract(epoch from clock_timestamp())*1000)::bigint;
 if p_evaluated_at_ms is null or p_evaluated_at_ms>now_ms or now_ms-p_evaluated_at_ms>30000 then
  raise exception 'nmls_training_clock_refresh_required';end if;
 select * into d from nmls_training_definitions where course_id=a.course_id and course_version=a.course_version;
 if not found then raise exception 'nmls_training_content_changed';end if;
 old_phase:=coalesce(a.runtime->>'phase','source');new_phase:=p_runtime->>'phase';
 if jsonb_typeof(p_runtime) is distinct from 'object' or p_runtime->>'schema' is distinct from 'nmls-free-training-runtime-v1'
 or p_runtime->>'purpose' is distinct from 'free_training' or p_runtime->>'courseId' is distinct from a.course_id
 or p_runtime->>'courseVersion' is distinct from a.course_version or p_runtime->>'contentDigest' is distinct from d.content_digest
 or p_runtime->>'definitionDigest' is distinct from d.definition_digest
 or p_runtime->>'sourceCourseKey' is distinct from d.manifest->>'sourceCourseKey'
 or (p_runtime->>'revision')::bigint is distinct from a.revision+1
 or jsonb_typeof(p_audit) is distinct from 'object' or p_audit->>'schema' is distinct from 'nmls-free-training-event-v1'
 or p_audit->>'eventId' is distinct from p_event_id::text
 or (p_audit->>'atMs')::bigint is distinct from p_evaluated_at_ms
 or p_audit->>'fromPhase' is distinct from old_phase
 or p_audit->>'toPhase' is distinct from new_phase
 or not coalesce(p_audit->>'operation' in('teaching','issue_assessment','submit_assessment','start_remediation'),false)
 or (p_audit->>'expectedRevision')::bigint is distinct from a.revision
 or (p_audit->>'resultingRevision')::bigint is distinct from a.revision+1 then
  raise exception 'nmls_training_history_invalid';end if;
 if (select count(*) from jsonb_object_keys(p_runtime))<>12
 or (select count(*) from jsonb_object_keys(p_audit))<>12
 or jsonb_typeof(p_runtime->'source') is distinct from 'object'
 or not (p_runtime ? 'remediation') or not (p_runtime ? 'finals')
 or not (p_audit ? 'detail') or not (p_audit ? 'ok') or not (p_audit ? 'status') or not (p_audit ? 'code') then
  raise exception 'nmls_training_history_invalid';end if;
 if not coalesce((old_phase=new_phase or
  (old_phase='source' and new_phase='first_assessment') or
  (old_phase='first_assessment' and new_phase in('passed','remediation_required')) or
  (old_phase='remediation_required' and new_phase='remediation') or
  (old_phase='remediation' and new_phase='second_assessment') or
  (old_phase='second_assessment' and new_phase in('passed','staff_review_required'))),false)
 or new_phase not in('source','first_assessment','remediation_required','remediation','second_assessment','passed','staff_review_required') then
 raise exception 'nmls_training_phase_closed';end if;
 -- Bind the structural transition to the server's operation. Neither a browser
 -- clock nor a browser-supplied runtime is accepted by the HTTP endpoint.
 if not coalesce(case p_audit->>'operation'
  when 'teaching' then old_phase=new_phase and old_phase in('source','remediation')
  when 'issue_assessment' then (old_phase='source' and new_phase='first_assessment') or (old_phase='remediation' and new_phase='second_assessment')
  when 'submit_assessment' then (old_phase='first_assessment' and new_phase in('passed','remediation_required')) or (old_phase='second_assessment' and new_phase in('passed','staff_review_required'))
  when 'start_remediation' then old_phase='remediation_required' and new_phase='remediation'
  else false end,false) then raise exception 'nmls_training_phase_closed';end if;
 if a.runtime is not null and (old_phase<>'source' or p_audit->>'operation'<>'teaching') and a.runtime->'source' is distinct from p_runtime->'source' then
  raise exception 'nmls_training_history_invalid';end if;
 if coalesce(jsonb_array_length(a.runtime->'finals'),0)>=2 and a.runtime->'remediation' is distinct from p_runtime->'remediation' then
  raise exception 'nmls_training_history_invalid';end if;
 -- Once a form is drawn its selection cannot be altered. Once graded, the entire
 -- submission is immutable. This also fences concurrent retries/new devices.
 if jsonb_typeof(p_runtime->'finals') is distinct from 'array' or jsonb_array_length(p_runtime->'finals')>2
 or jsonb_array_length(p_runtime->'finals')<coalesce(jsonb_array_length(a.runtime->'finals'),0) then
 raise exception 'nmls_training_history_invalid';end if;
 if (p_audit->>'operation'='issue_assessment' and jsonb_array_length(p_runtime->'finals')<>coalesce(jsonb_array_length(a.runtime->'finals'),0)+1)
 or (p_audit->>'operation'<>'issue_assessment' and jsonb_array_length(p_runtime->'finals')<>coalesce(jsonb_array_length(a.runtime->'finals'),0))
 or (p_audit->>'operation' in('teaching','start_remediation') and p_runtime->'finals' is distinct from coalesce(a.runtime->'finals','[]'::jsonb))
 or (new_phase='source' and jsonb_array_length(p_runtime->'finals')<>0)
 or (new_phase in('first_assessment','remediation_required','remediation') and jsonb_array_length(p_runtime->'finals')<>1)
 or (new_phase in('second_assessment','staff_review_required') and jsonb_array_length(p_runtime->'finals')<>2)
 or (new_phase='passed' and jsonb_array_length(p_runtime->'finals') not in(1,2))
 or (old_phase<>'remediation' and p_audit->>'operation'<>'start_remediation' and p_runtime->'remediation' is distinct from coalesce(a.runtime->'remediation','null'::jsonb)) then
  raise exception 'nmls_training_history_invalid';end if;
 for idx in 0..coalesce(jsonb_array_length(a.runtime->'finals'),0)-1 loop
  old_final:=a.runtime->'finals'->idx;new_final:=p_runtime->'finals'->idx;
  if old_final->'selection' is distinct from new_final->'selection'
   or (old_final->'result' is distinct from 'null'::jsonb and old_final is distinct from new_final) then
   raise exception 'nmls_training_history_invalid';end if;
 end loop;
 if old_phase in('passed','staff_review_required') and a.runtime is distinct from ((p_runtime-'revision') || jsonb_build_object('revision',a.revision)) then
  raise exception 'nmls_training_phase_closed';end if;
 update nmls_training_attempts set runtime=p_runtime,revision=a.revision+1,updated_at=clock_timestamp() where enrollment_id=a.enrollment_id;
 insert into nmls_training_events(enrollment_id,event_id,student_id,command_digest,revision,audit)
 values(a.enrollment_id,p_event_id,p_student_id,p_command_digest,a.revision+1,p_audit);
 update student_portal_state set last_activity_at=clock_timestamp(),updated_at=clock_timestamp(),
 resume_path='/student/nmls-training/?enrollment_id='||a.enrollment_id where enrollment_id=a.enrollment_id;
 -- Recheck after writes/triggers too. Raising rolls back runtime, event and
 -- portal state together, so a slow commit cannot become a stale success.
 now_ms:=floor(extract(epoch from clock_timestamp())*1000)::bigint;
 if now_ms<p_evaluated_at_ms or now_ms-p_evaluated_at_ms>30000 then
  raise exception 'nmls_training_clock_refresh_required';end if;
 perform nmls_training_access(p_student_id,p_enrollment_id);
 return nmls_training_context(p_student_id,p_enrollment_id,p_event_id)||jsonb_build_object('replayed',false);
end $$;

alter table nmls_training_definitions enable row level security;
alter table nmls_training_attempts enable row level security;
alter table nmls_training_events enable row level security;
-- Revoke service_role too: Supabase default privileges may otherwise leave DML.
revoke all on nmls_training_definitions,nmls_training_attempts,nmls_training_events from public,anon,authenticated,service_role;
grant select on nmls_training_definitions,nmls_training_attempts,nmls_training_events to service_role;
revoke all on function nmls_training_access(uuid,uuid),nmls_training_definition(text),nmls_training_context(uuid,uuid,uuid),
 nmls_training_enroll(uuid),nmls_training_commit(uuid,uuid,uuid,text,bigint,bigint,jsonb,jsonb),nmls_training_enrollment_identity_guard() from public,anon,authenticated,service_role;
grant execute on function nmls_training_definition(text),nmls_training_context(uuid,uuid,uuid),nmls_training_enroll(uuid),
 nmls_training_commit(uuid,uuid,uuid,text,bigint,bigint,jsonb,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
