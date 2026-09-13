-- Generated from the real comprehensive v3 curriculum; never edit the source pins.
-- Forward migration on main024. Archived private CE migrations are NOT prerequisites.
-- Must be applied once in the existing StateCourse database after schema verification.
begin;
do $preflight$ begin
 if to_regclass('public.current_offering_governance') is null or to_regclass('public.admin_console_actions') is null
 or to_regprocedure('public.initialize_training_runtime(uuid,uuid)') is null then
 raise exception 'Verify existing main migrations 020 through 024 before NMLS025';end if;
 if exists(select 1 from courses where id='nmls-ce-2026-comprehensive-8') then
 raise exception 'NMLS identity already exists: inspect before applying; never overwrite a live definition';end if;
end $preflight$;
insert into courses(id,state,name,product_type,approval_status,enrollment_enabled,current_version,course_route)
 values('nmls-ce-2026-comprehensive-8','US','2026 Mortgage Continuing Education — Training Only','mortgage_continuing_education','submission_draft',false,'2026.3','/mortgage/');
insert into regulatory_course_versions(course_id,version,lifecycle_status,required_hours,enrollment_enabled,regulatory_credit_enabled,configuration)
 values('nmls-ce-2026-comprehensive-8','2026.3','development',8,false,false,
 '{"discipline":"mortgage","mode":"free_training","hours_status":"provisional_design_only","provider_id":null,"nmls_course_id":null}'::jsonb);
create table nmls_training_definitions(
 course_id text not null references courses(id),course_version text not null,
 content_digest text not null check(content_digest ~ '^[a-f0-9]{64}$'),
 definition_digest text not null check(definition_digest ~ '^[a-f0-9]{64}$'),
 manifest jsonb not null check(manifest->>'purpose'='free_training' and manifest->>'discipline'='mortgage'),
 primary key(course_id,course_version));
insert into nmls_training_definitions(course_id,course_version,content_digest,definition_digest,manifest)
 values('nmls-ce-2026-comprehensive-8','2026.3','aad5903b17526825091e1bb59b45ec179dc84fb5c4fa24d29c6dab8e93c4c7b9','a7e574e03236f2973a1f6dd96e658339d424fb8dfa7c6e795c401f57ef992f10','{"schema":"nmls-training-definition-v1","purpose":"free_training","sourceCourseKey":"nmls-2026-national-comprehensive-private-review-v3","discipline":"mortgage","jurisdiction":"US","creditEligible":false,"providerApprovalId":null,"courseApprovalId":null,"allocation":{"federal":3,"ethics":2,"nontraditional":2,"general":1},"allocationStatus":"provisional_design_not_awarded_credit","modules":[{"id":"F01","title":"Application clocks and evidence","units":[{"id":"F01-U01","title":"Two application tests","requiredSeconds":900},{"id":"F01-U02","title":"The first Loan Estimate clock","requiredSeconds":900},{"id":"F01-U03","title":"Incomplete applications and action notices","requiredSeconds":600},{"id":"F01-U04","title":"Actual adverse-action reasons","requiredSeconds":720},{"id":"F01-U05","title":"Preserve and reconcile the record","requiredSeconds":480}]},{"id":"F02","title":"Loan Estimate tolerances and corrections","units":[{"id":"F02-U01","title":"Begin with the charge, not the column label","requiredSeconds":540},{"id":"F02-U02","title":"Ten percent applies to the qualifying aggregate","requiredSeconds":480},{"id":"F02-U03","title":"Zero tolerance is not “net all the closing costs”","requiredSeconds":420},{"id":"F02-U04","title":"Separate the displayed estimate from the comparison baseline","requiredSeconds":600},{"id":"F02-U05","title":"Two disclosure forms, several clocks","requiredSeconds":480},{"id":"F02-U06","title":"Close the loop: correction, not cosmetic redisclosure","requiredSeconds":480}]},{"id":"F03","title":"Closing Disclosure and federal-law capstone","units":[{"id":"F03-U01","title":"Required topic 9 — The estimate is not permission to keep the difference","requiredSeconds":900},{"id":"F03-U02","title":"Required topic 10 — “To whom?” must have an answer","requiredSeconds":600},{"id":"F03-U03","title":"Adjacent safeguard — The consumer receiving the CD","requiredSeconds":900}]},{"id":"E01","title":"Ethics: consistent treatment","units":[{"id":"E01-U01","title":"Why this belongs in annual ethics","requiredSeconds":480},{"id":"E01-U02","title":"Same total income does not justify different assumptions","requiredSeconds":780},{"id":"E01-U03","title":"A required signature needs a defined purpose","requiredSeconds":540},{"id":"E01-U04","title":"Integrated matched-file investigation","requiredSeconds":720},{"id":"E01-U05","title":"Practice: two events, two reasons","requiredSeconds":180},{"id":"E01-U06","title":"Practice: the document’s actual effect","requiredSeconds":180},{"id":"E01-U07","title":"Practice: challenge a false pass","requiredSeconds":120}]},{"id":"E02","title":"Ethics: fraud resistance and consumer protection","units":[{"id":"E02-U01","title":"The professional decision: protect the file without prejudging the person","requiredSeconds":420},{"id":"E02-U02","title":"Worked case A — Two income records, one closing target","requiredSeconds":660},{"id":"E02-U03","title":"Worked case C — A “quality fee” that follows referrals","requiredSeconds":540},{"id":"E02-U04","title":"Worked case D — Correcting a valuation versus buying the answer","requiredSeconds":480},{"id":"E02-U05","title":"Consumer protection: a correct number can still be an incomplete presentation","requiredSeconds":480},{"id":"E02-U06","title":"Practice: preserve the income timeline","requiredSeconds":120},{"id":"E02-U07","title":"Practice: follow the benefit","requiredSeconds":180},{"id":"E02-U08","title":"Practice: correction and conduct are different","requiredSeconds":120}]},{"id":"N01","title":"Nontraditional mortgages: payment changes and risk","units":[{"id":"N01-U01","title":"Start with three separate questions","requiredSeconds":420},{"id":"N01-U02","title":"Interest-only does not remove the principal bill","requiredSeconds":660},{"id":"N01-U03","title":"A payment option can change the debt, not just the payment","requiredSeconds":720},{"id":"N01-U04","title":"A disclosed payment is not necessarily the underwriting payment","requiredSeconds":540},{"id":"N01-U05","title":"Turn the product mechanics into an accurate conversation","requiredSeconds":660}]},{"id":"N02","title":"Nontraditional mortgages: underwriting evidence","units":[{"id":"N02-U01","title":"The first underwriting decision is which rules apply","requiredSeconds":480},{"id":"N02-U02","title":"Alternative documentation is still documentation","requiredSeconds":720},{"id":"N02-U03","title":"Original case continued: use the payment the rule requires","requiredSeconds":720},{"id":"N02-U04","title":"Alternative repayment case: assets and access","requiredSeconds":600},{"id":"N02-U05","title":"Write the decision another reviewer can reproduce","requiredSeconds":480}]},{"id":"G01","title":"Elective: mortgage-file integrity","units":[{"id":"G01-U01","title":"Reconstruct the file before trusting its status","requiredSeconds":480},{"id":"G01-U02","title":"Missing evidence and conflicting evidence require different work","requiredSeconds":540},{"id":"G01-U03","title":"Changed facts need a decision trail","requiredSeconds":600},{"id":"G01-U04","title":"Share the work, not an unrestricted copy of the customer","requiredSeconds":480},{"id":"G01-U05","title":"Close the evidence chain before releasing the package","requiredSeconds":540},{"id":"G01-U06","title":"Cold-file review: can the next person act safely?","requiredSeconds":360}]}],"assessment":{"questionCount":25,"bankCount":50,"maxAutomaticAttempts":2,"passCount":18,"remediationRequired":true},"sourceFiles":[{"path":"nmls/curriculum/federal-2026-F01-application-clocks.md","sha256":"ecd0051b5fe7b980233028bf20c9b7d478b07286ec2e9f8fde18a30c9ebdc408"},{"path":"nmls/curriculum/federal-2026-F00-examination-background.md","sha256":"8a018cf9d9d8ba44b14215735c348840b230f4c31ece27188d92a9d729c069b9"},{"path":"nmls/curriculum/federal-2026-F02-loan-estimate-tolerances.md","sha256":"7c3688b34bc2e130241a2e441b9ba8613edb63d33e866fcacc8db47ee57cb323"},{"path":"nmls/curriculum/federal-2026-F03-closing-disclosure-and-capstone.md","sha256":"96c422ebc2c60fe88ea9768ef69466e551e5c5e9c9ddc9fe4a2b8f194b6946dc"},{"path":"nmls/curriculum/ethics-2026-E01-consistent-treatment.md","sha256":"8e3783c493cd8c4d567c1242b49975a36312d014804fc2aa1a35c810fdb71d94"},{"path":"nmls/curriculum/ethics-2026-E02-fraud-resistance-and-consumer-protection.md","sha256":"c878836719ba5f88ede9055dbb392214b6a9186dbe8444be4de1818761869c9e"},{"path":"nmls/curriculum/nontraditional-2026-N01-payment-change-and-product-risk.md","sha256":"c8d78840a8ddcea94063921d7d45a1c0e182e590606d84290932670186e9b22d"},{"path":"nmls/curriculum/nontraditional-2026-N02-underwriting-evidence-and-non-qm.md","sha256":"0b75034ffe71d4088153add4630292f2babb4c2b7542f3a94edc07f3955ac522"},{"path":"nmls/curriculum/general-2026-G01-mortgage-file-integrity.md","sha256":"f099e672d3bc491a53f4391db244eaf1266cda9632da00b28a8aa8c7aff0bffd"}],"humanReviewed":false,"validatedDuration":false}'::jsonb);
create trigger nmls_training_definition_immutable before update or delete on nmls_training_definitions
 for each row execute function admin_console_refuse_record_mutation();
-- This records only the owner's requested free-training opening, no approval or charge.
do $training_authority$ declare actor uuid; begin
 -- The current view resolves the latest event per actor/role/scope BEFORE the
 -- active filter. An older grant must never defeat a later revocation.
 select u.id into actor from auth.users u join current_staff_actor_bindings b on b.auth_user_id=u.id
 where lower(u.email)='akanevsky1967@gmail.com' and b.actor_role='owner' and b.scope_state is null and b.binding_status='active'
 and (b.effective_at is null or b.effective_at<=now()) and (b.expires_at is null or b.expires_at>now())
 order by b.recorded_at desc limit 1;
 if actor is null then raise exception 'Active verified owner binding required to open training';end if;
 insert into offering_governance_events(site,state,discipline,offering_kind,offering_id,approval_status,training_access_enabled,payment_mode,recorded_by,recorded_role,note)
 values('statecourse.com','US','mortgage','course','nmls-ce-2026-comprehensive-8','none',true,'disabled',actor,'owner',
 'Owner work order 2026-09-13: open real national mortgage content as free training only; no approval, NMLS credit, certificate, reporting or live charges.');
end $training_authority$;
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
