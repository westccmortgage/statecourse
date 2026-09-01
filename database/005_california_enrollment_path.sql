-- 005 California enrollment path: course records, policy versions, and catalogue wiring
--
-- Registers the three California 45-hour courses, their draft policy versions
-- (regulatory acknowledgment, terms, refund, cancellation), and the enrollment path
-- that carries a student from a purchased course to an access grant. Every course
-- lands with approval_status 'submission_draft' and enrollment disabled: no row here
-- approves a course, opens enrollment, or creates regulatory credit.

begin;

insert into courses(id,state,name,product_type,approval_status,enrollment_enabled)
values
  ('ca-real-estate-principles-45','CA','California Real Estate Principles — 45 Hours','real_estate_prelicense','submission_draft',false),
  ('ca-real-estate-practice-45','CA','California Real Estate Practice — 45 Hours','real_estate_prelicense','submission_draft',false),
  ('ca-mortgage-loan-brokering-lending-45','CA','California Mortgage Loan Brokering and Lending — 45 Hours','real_estate_prelicense','submission_draft',false)
on conflict (id) do update
set state=excluded.state,
    name=excluded.name,
    product_type=excluded.product_type,
    updated_at=now();

insert into course_policy_versions(course_id,policy_type,version)
values
  ('ca-real-estate-principles-45','regulatory_acknowledgment','ca-real-estate-principles-45-regulatory-draft-v1'),
  ('ca-real-estate-principles-45','terms','statecourse-terms-v1'),
  ('ca-real-estate-principles-45','refund','ca-real-estate-principles-45-refund-pending-review-v1'),
  ('ca-real-estate-principles-45','cancellation','ca-real-estate-principles-45-cancellation-pending-review-v1'),
  ('ca-real-estate-practice-45','regulatory_acknowledgment','ca-real-estate-practice-45-regulatory-draft-v1'),
  ('ca-real-estate-practice-45','terms','statecourse-terms-v1'),
  ('ca-real-estate-practice-45','refund','ca-real-estate-practice-45-refund-pending-review-v1'),
  ('ca-real-estate-practice-45','cancellation','ca-real-estate-practice-45-cancellation-pending-review-v1'),
  ('ca-mortgage-loan-brokering-lending-45','regulatory_acknowledgment','ca-mortgage-loan-brokering-lending-45-regulatory-draft-v1'),
  ('ca-mortgage-loan-brokering-lending-45','terms','statecourse-terms-v1'),
  ('ca-mortgage-loan-brokering-lending-45','refund','ca-mortgage-loan-brokering-lending-45-refund-pending-review-v1'),
  ('ca-mortgage-loan-brokering-lending-45','cancellation','ca-mortgage-loan-brokering-lending-45-cancellation-pending-review-v1')
on conflict (course_id,policy_type,version) do nothing;

commit;

