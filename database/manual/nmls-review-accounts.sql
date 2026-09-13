-- MANUAL, AFTER 025. Not an automatic schema migration.
-- Replace the two email placeholders with two DISTINCT, EXISTING Supabase Auth
-- users dedicated to these roles. This script creates no Auth account, password,
-- checkout, payment, approval, certificate, credit, or global staff binding.
-- It is atomic and safe to repeat for the same active scopes; it never reopens
-- expired/revoked access or promotes an existing ordinary training enrollment.
begin;
do $provision_nmls_review$
declare
 regulator_email text := 'REPLACE_WITH_EXISTING_REGULATOR_EMAIL';
 student_email text := 'REPLACE_WITH_EXISTING_SAMPLE_STUDENT_EMAIL';
 owner_id uuid; actor uuid; role_spec record; student students%rowtype;
 enrollment enrollments%rowtype; existing_count integer; created boolean;
begin
 if regulator_email like 'REPLACE_%' or student_email like 'REPLACE_%'
 or lower(regulator_email)=lower(student_email) then
  raise exception 'Replace both distinct existing-auth reviewer email placeholders';end if;
 if to_regprocedure('public.nmls_training_context(uuid,uuid,uuid)') is null then
  raise exception 'Apply verified NMLS025 before provisioning review scopes';end if;
 select u.id into owner_id from auth.users u join current_staff_actor_bindings b on b.auth_user_id=u.id
 where lower(u.email)='akanevsky1967@gmail.com' and b.actor_role='owner' and b.scope_state is null
 and b.binding_status='active' and (b.effective_at is null or b.effective_at<=clock_timestamp())
 and (b.expires_at is null or b.expires_at>clock_timestamp()) order by b.recorded_at desc limit 1;
 if owner_id is null then raise exception 'Active verified owner binding required for review provisioning';end if;
 for role_spec in select * from (values
   (lower(regulator_email),'regulator_reviewer'),(lower(student_email),'student_reviewer')
 ) as roles(email,review_role) order by email loop
  select count(*) into existing_count from auth.users where lower(email)=role_spec.email;
  if existing_count<>1 then raise exception 'Each reviewer must resolve to exactly one existing Supabase Auth user';end if;
  select id into actor from auth.users where lower(email)=role_spec.email for share;
  if actor=owner_id then raise exception 'Use dedicated reviewer accounts, not the owner account';end if;
  if exists(select 1 from current_staff_actor_bindings where auth_user_id=actor and binding_status='active'
   and (effective_at is null or effective_at<=clock_timestamp()) and (expires_at is null or expires_at>clock_timestamp()))
  or exists(select 1 from enrollments where student_id=actor and course_id<>'nmls-ce-2026-comprehensive-8') then
   raise exception 'Dedicated reviewer account already has broader staff or course access';end if;
  insert into students(id,email) values(actor,role_spec.email) on conflict(id) do nothing;
  select * into student from students where id=actor for update;
  if student.account_status<>'active' or lower(student.email)<>role_spec.email then
   raise exception 'Reviewer student profile is inactive or differs from authenticated identity';end if;
  select count(*) into existing_count from enrollments where student_id=actor and course_id='nmls-ce-2026-comprehensive-8';
  if existing_count>1 then raise exception 'Ambiguous NMLS enrollment history; inspect without rewriting';end if;
  select * into enrollment from enrollments where student_id=actor and course_id='nmls-ce-2026-comprehensive-8' for update;
  created:=not found;
  if created then
   insert into enrollments(student_id,course_id,state,status,compliance_credit_eligible,checkout_attempt_id,
     course_version,enrollment_origin,review_role,expires_at)
   values(actor,'nmls-ce-2026-comprehensive-8','US','active',false,null,'2026.3','training',role_spec.review_role,
     clock_timestamp()+interval '30 days') returning * into enrollment;
   insert into access_grants(enrollment_id,student_id,course_id,status)
    values(enrollment.id,actor,enrollment.course_id,'active');
   insert into nmls_training_attempts(enrollment_id,student_id,course_id,course_version)
    values(enrollment.id,actor,enrollment.course_id,enrollment.course_version);
   insert into student_portal_state(enrollment_id,student_id,course_id,course_version,resume_path)
    values(enrollment.id,actor,enrollment.course_id,enrollment.course_version,'/student/nmls-training/?enrollment_id='||enrollment.id);
  elsif enrollment.review_role is distinct from role_spec.review_role then
   raise exception 'Existing NMLS role differs; no implicit promotion or conversion is allowed';
  end if;
  -- Includes account, exact course/version, grant, expiry, training governance,
  -- persisted attempt membership and fresh server clock checks.
  perform nmls_training_context(actor,enrollment.id,null);
  if role_spec.review_role='regulator_reviewer' and exists(select 1 from nmls_training_attempts
    where enrollment_id=enrollment.id and (revision<>0 or runtime is not null)) then
   raise exception 'Read-only reviewer cannot inherit learning or assessment history';end if;
  if created then
   insert into admin_console_actions(auth_user_id,actor_role,action,subject,detail)
   values(owner_id,'owner','nmls_review_scope_provisioned',enrollment.id::text,
     jsonb_build_object('student_id',actor,'course_id',enrollment.course_id,'course_version',enrollment.course_version,
      'review_role',enrollment.review_role,'expires_at',enrollment.expires_at,'non_credit',true,'read_only',role_spec.review_role='regulator_reviewer'));
  end if;
 end loop;
end $provision_nmls_review$;
commit;

-- Verify bindings and hand each account its own route. No credentials returned.
select s.email,e.review_role,e.status,e.expires_at,e.compliance_credit_eligible,
 '/student/nmls-training/?enrollment_id='||e.id as course_path
from enrollments e join students s on s.id=e.student_id
where e.course_id='nmls-ce-2026-comprehensive-8' and e.review_role in('regulator_reviewer','student_reviewer')
order by e.review_role,s.email;
