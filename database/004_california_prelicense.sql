-- California statutory/pre-license implementation. Apply after 001-003.
-- Three course approvals remain independent even when sold together.

insert into regulatory_courses (course_id, state, title, version, status, approval_number, enrollment_enabled) values
  ('ca-real-estate-principles-45-v1', 'CA', 'Real Estate Principles', '1.0', 'development', null, false),
  ('ca-real-estate-practice-45-v1', 'CA', 'Real Estate Practice', '1.0', 'development', null, false),
  ('ca-mortgage-loan-brokering-lending-45-v1', 'CA', 'Mortgage Loan Brokering and Lending', '1.0', 'development', null, false)
  on conflict (course_id) do nothing;

-- Application code must require approval + enrollment-enabled gates and enforce:
-- 15 sequential assignments, 420 elapsed hours, max 2 CA correspondence completions/35 days,
-- 365-day expiration, secure proctored 100-item final, 60% pass, one alternate retake.
