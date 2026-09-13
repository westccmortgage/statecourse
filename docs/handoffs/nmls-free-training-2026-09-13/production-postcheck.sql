-- NMLS025 production verification. READ ONLY; no credentials or personal data.
-- Run after 025 succeeds, using an authorized database operator connection.
-- If a relation is missing, stop and inspect: do not apply archived migrations.
-- Expected: all *_ok booleans true; all *_violations and forbidden counts zero.
begin read only;

-- 1. One exact national offering, still not approved or credit-bearing.
select c.id, c.state, c.current_version, c.approval_status,
 c.enrollment_enabled, c.regulatory_approval_number,
 v.lifecycle_status, v.required_hours as provisional_design_hours,
 v.regulatory_credit_enabled,
 (c.state='US' and c.current_version='2026.3'
  and c.approval_status='submission_draft' and not c.enrollment_enabled
  and c.regulatory_approval_number is null and v.lifecycle_status='development'
  and not v.enrollment_enabled and not v.regulatory_credit_enabled
  and v.configuration->>'mode'='free_training'
  and v.configuration->>'provider_id' is null
  and v.configuration->>'nmls_course_id' is null) as course_gates_ok
from public.courses c join public.regulatory_course_versions v
 on v.course_id=c.id and v.version=c.current_version
where c.id='nmls-ce-2026-comprehensive-8';

-- 2. Exactly one row; free training enabled, payment disabled, no approval.
select site,state,discipline,offering_id,approval_status,training_access_enabled,
 payment_mode,representation,approval_currently_effective,live_charging_permitted,
 (site='statecourse.com' and state='US' and discipline='mortgage'
  and offering_kind='course' and approval_status='none'
  and training_access_enabled and payment_mode='disabled'
  and representation='training_only' and not approval_currently_effective
  and not live_charging_permitted) as offering_gates_ok
from public.offering_public_status
where offering_id='nmls-ce-2026-comprehensive-8';

-- 3. Exact immutable pins; 8 modules, 45 lessons, 24000 provisional seconds,
-- 9 source files; assessment 25 questions / 50 bank / 2 attempts / 18 to pass.
select course_id,course_version,content_digest,definition_digest,
 jsonb_array_length(manifest->'modules') as modules,
 (select count(*) from jsonb_array_elements(manifest->'modules') m,
  jsonb_array_elements(m->'units') u) as lessons,
 (select sum((u->>'requiredSeconds')::int)
  from jsonb_array_elements(manifest->'modules') m,
  jsonb_array_elements(m->'units') u) as provisional_seconds,
 jsonb_array_length(manifest->'sourceFiles') as source_files,
 manifest->'assessment' as assessment,
 (course_version='2026.3'
  and content_digest='aad5903b17526825091e1bb59b45ec179dc84fb5c4fa24d29c6dab8e93c4c7b9'
  and definition_digest='a7e574e03236f2973a1f6dd96e658339d424fb8dfa7c6e795c401f57ef992f10'
  and manifest->>'sourceCourseKey'='nmls-2026-national-comprehensive-private-review-v3'
  and manifest->>'purpose'='free_training'
  and manifest->>'creditEligible'='false'
  and manifest->>'humanReviewed'='false'
  and manifest->>'validatedDuration'='false') as definition_pins_ok
from public.nmls_training_definitions
where course_id='nmls-ce-2026-comprehensive-8';

-- 4. Exactly 3 rows, all privilege_boundary_ok=true. Service writes only by RPC.
select c.relname, c.relrowsecurity,
 (c.relrowsecurity
  and not has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
  and not has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
  and has_table_privilege('service_role',c.oid,'SELECT')
  and not has_table_privilege('service_role',c.oid,'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')) as privilege_boundary_ok
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in
 ('nmls_training_definitions','nmls_training_attempts','nmls_training_events')
order by c.relname;

-- 5. Exactly 6 functions. Only 4 public RPCs executable by service_role.
select p.oid::regprocedure::text as function_signature, p.prosecdef, p.proconfig,
 (not has_function_privilege('anon',p.oid,'EXECUTE')
  and not has_function_privilege('authenticated',p.oid,'EXECUTE')
  and has_function_privilege('service_role',p.oid,'EXECUTE')=
   (p.proname in ('nmls_training_definition','nmls_training_enroll',
    'nmls_training_context','nmls_training_commit'))) as rpc_boundary_ok
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in
 ('nmls_training_definition','nmls_training_enroll','nmls_training_context',
  'nmls_training_commit','nmls_training_access','nmls_training_enrollment_identity_guard')
order by function_signature;

-- 6. Counts only: no email, UUID, answer, raw runtime, or access token output.
-- An empty result before reviewers/students enroll is legitimate, not live QA.
select coalesce(e.review_role,'student') as access_mode, e.status,
 coalesce(g.status,'missing') as grant_status, count(*) as enrollments,
 count(*) filter(where e.expires_at<=clock_timestamp()) as expired,
 count(*) filter(where e.compliance_credit_eligible) as credit_violations,
 count(*) filter(where e.checkout_attempt_id is not null) as checkout_violations
from public.enrollments e left join public.access_grants g on g.enrollment_id=e.id
where e.course_id='nmls-ce-2026-comprehensive-8'
group by e.review_role,e.status,g.status order by access_mode,e.status,grant_status;

-- 7. Every enrollment has matching private runtime and portal/entitlement scope.
select count(*) filter(where
 e.state<>'US' or e.course_version<>'2026.3' or e.enrollment_origin<>'training'
 or e.compliance_credit_eligible or e.checkout_attempt_id is not null
 or g.enrollment_id is null or (g.student_id,g.course_id) is distinct from (e.student_id,e.course_id)
 or a.enrollment_id is null or (a.student_id,a.course_id,a.course_version) is distinct from (e.student_id,e.course_id,e.course_version)
 or s.enrollment_id is null or (s.student_id,s.course_id,s.course_version) is distinct from (e.student_id,e.course_id,e.course_version)
 ) as membership_violations,
 count(*) filter(where e.review_role='regulator_reviewer' and
  (a.revision<>0 or a.runtime is not null or exists
   (select 1 from public.nmls_training_events ev where ev.enrollment_id=e.id))) as readonly_reviewer_violations
from public.enrollments e
left join public.access_grants g on g.enrollment_id=e.id
left join public.nmls_training_attempts a on a.enrollment_id=e.id
left join public.student_portal_state s on s.enrollment_id=e.id
where e.course_id='nmls-ce-2026-comprehensive-8';

-- 8. All forbidden commercial/credit/certificate records must remain zero.
select
 (select count(*) from public.checkout_attempts where course_id='nmls-ce-2026-comprehensive-8') as forbidden_checkouts,
 (select count(*) from public.payments where course_id='nmls-ce-2026-comprehensive-8') as forbidden_payments,
 (select count(*) from public.course_completion_events where course_id='nmls-ce-2026-comprehensive-8') as forbidden_credit_completions,
 (select count(*) from public.course_certificates where course_id='nmls-ce-2026-comprehensive-8') as forbidden_portal_certificates,
 (select count(*) from public.course_completion_certificates where course_id='nmls-ce-2026-comprehensive-8') as forbidden_completion_certificates;

-- 9. Private attempt/event consistency; no learner content returned.
select count(*) filter(where a.revision<>(select count(*) from public.nmls_training_events ev
 where ev.enrollment_id=a.enrollment_id)) as event_revision_violations,
 count(*) filter(where a.revision=0 and a.runtime is not null) as initial_runtime_violations
from public.nmls_training_attempts a where a.course_id='nmls-ce-2026-comprehensive-8';

commit;
