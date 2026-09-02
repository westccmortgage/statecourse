-- Michigan privilege-hardening delta for databases that already applied migration 015.
--
-- Changing an applied migration does not change an existing database. This migration
-- therefore repeats the exact function signatures after both 015 and 016 have run.
-- REVOKE and GRANT are idempotent: replaying this file does not create a broader role.

begin;

-- Migration 015 originally left evidence SELECT access with authenticated users.
-- The Michigan server functions use service_role after binding the signed-in person
-- to the requested enrollment or named staff role, so browser roles need no direct
-- table or view privileges.
revoke all on michigan_authority_events,michigan_runtime_configuration_events,
  michigan_applied_memo_versions,michigan_applied_memo_reviews,
  michigan_identity_verification_events,michigan_asynchronous_attestation_events,
  michigan_completion_reports,michigan_completion_certificates
from public,anon,authenticated;

revoke all on michigan_current_authority,michigan_current_runtime_configuration,
  michigan_current_identity_verification,michigan_current_asynchronous_attestation
from public,anon,authenticated;

grant select on michigan_applied_memo_versions,michigan_applied_memo_reviews,
  michigan_identity_verification_events,michigan_asynchronous_attestation_events,
  michigan_completion_reports,michigan_completion_certificates
to service_role;

grant select on michigan_current_authority,michigan_current_runtime_configuration,
  michigan_current_identity_verification,michigan_current_asynchronous_attestation
to service_role;

-- Every SECURITY DEFINER declaration from migration 015, plus its append-only
-- mutation helper, loses the PostgreSQL default EXECUTE grant to PUBLIC and both
-- browser-facing Supabase roles.
revoke execute on function michigan_authority_summary(text,text,timestamptz) from public,anon,authenticated;
revoke execute on function michigan_require_active_authority(text,text) from public,anon,authenticated;
revoke execute on function michigan_refuse_record_mutation() from public,anon,authenticated;
revoke execute on function initialize_michigan_enrollment() from public,anon,authenticated;
revoke execute on function initialize_michigan_enrollment_records() from public,anon,authenticated;
revoke execute on function michigan_credited_time_guard() from public,anon,authenticated;
revoke execute on function michigan_instruction_evidence_guard() from public,anon,authenticated;
revoke execute on function michigan_assignment_completion_guard() from public,anon,authenticated;
revoke execute on function michigan_direct_memo_submission_guard() from public,anon,authenticated;
revoke execute on function michigan_direct_memo_review_guard() from public,anon,authenticated;
revoke execute on function michigan_direct_attestation_guard() from public,anon,authenticated;
revoke execute on function michigan_direct_certificate_guard() from public,anon,authenticated;
revoke execute on function michigan_direct_report_guard() from public,anon,authenticated;
revoke execute on function michigan_direct_completion_guard() from public,anon,authenticated;
revoke execute on function submit_michigan_applied_memo(uuid,uuid,text,text) from public,anon,authenticated;
revoke execute on function review_michigan_applied_memo(uuid,uuid,jsonb,jsonb) from public,anon,authenticated;
revoke execute on function record_michigan_identity_verification(uuid,uuid,text,text,text,text,uuid) from public,anon,authenticated;
revoke execute on function sign_michigan_asynchronous_attestation(uuid,uuid,text,text,integer,text) from public,anon,authenticated;
revoke execute on function michigan_operational_status(uuid) from public,anon,authenticated;
revoke execute on function record_michigan_completion(uuid) from public,anon,authenticated;
revoke execute on function issue_michigan_completion_certificate(uuid) from public,anon,authenticated;
revoke execute on function build_michigan_completion_report(uuid) from public,anon,authenticated;
revoke execute on function record_michigan_authority_event(text,text,text,uuid,timestamptz,timestamptz,jsonb,uuid) from public,anon,authenticated;
revoke execute on function record_michigan_runtime_configuration(boolean,text,text,text,boolean,text,text,jsonb,uuid) from public,anon,authenticated;

-- Migration 016 replaces initialize_michigan_enrollment and adds five more
-- SECURITY DEFINER functions. Revoke again after the replacement and additions.
revoke execute on function michigan_business_deadline(timestamptz,integer,date,jsonb) from public,anon,authenticated;
revoke execute on function michigan_capacity_status(timestamptz) from public,anon,authenticated;
revoke execute on function michigan_checkout_capacity_guard() from public,anon,authenticated;
revoke execute on function initialize_michigan_enrollment() from public,anon,authenticated;
revoke execute on function join_michigan_waitlist(uuid,text) from public,anon,authenticated;
revoke execute on function record_michigan_operational_policy(text,integer,integer,boolean,boolean,date,jsonb,jsonb,uuid) from public,anon,authenticated;

-- Only server-callable functions receive an explicit grant. Trigger and guard
-- helpers execute through their owning triggers/functions and remain uncallable by
-- browser roles. No grant in this migration targets a role other than service_role.
grant execute on function michigan_authority_summary(text,text,timestamptz) to service_role;
grant execute on function submit_michigan_applied_memo(uuid,uuid,text,text) to service_role;
grant execute on function review_michigan_applied_memo(uuid,uuid,jsonb,jsonb) to service_role;
grant execute on function record_michigan_identity_verification(uuid,uuid,text,text,text,text,uuid) to service_role;
grant execute on function sign_michigan_asynchronous_attestation(uuid,uuid,text,text,integer,text) to service_role;
grant execute on function michigan_operational_status(uuid) to service_role;
grant execute on function record_michigan_completion(uuid) to service_role;
grant execute on function issue_michigan_completion_certificate(uuid) to service_role;
grant execute on function build_michigan_completion_report(uuid) to service_role;
grant execute on function record_michigan_authority_event(text,text,text,uuid,timestamptz,timestamptz,jsonb,uuid) to service_role;
grant execute on function record_michigan_runtime_configuration(boolean,text,text,text,boolean,text,text,jsonb,uuid) to service_role;
grant execute on function michigan_capacity_status(timestamptz) to service_role;
grant execute on function michigan_business_deadline(timestamptz,integer,date,jsonb) to service_role;
grant execute on function join_michigan_waitlist(uuid,text) to service_role;
grant execute on function record_michigan_operational_policy(text,integer,integer,boolean,boolean,date,jsonb,jsonb,uuid) to service_role;

-- Repeat migration 016's table/view boundary too. This remains safe on replay.
revoke all on michigan_operational_policy_events,michigan_waitlist_entries,
  michigan_staff_actor_binding_events
from public,anon,authenticated;

revoke all on michigan_current_operational_policy,michigan_memo_review_queue,
  michigan_current_staff_actor_bindings
from public,anon,authenticated;

grant select on michigan_operational_policy_events,michigan_waitlist_entries,
  michigan_staff_actor_binding_events,michigan_memo_review_queue,
  michigan_current_operational_policy,michigan_current_staff_actor_bindings
to service_role;

commit;
