# StateCourse Student Portal Architecture

## Purpose

The student portal is the permanent account surface for every StateCourse student. It lists only enrollments owned by the authenticated Supabase user and preserves the exact state, course, and regulated course version attached to each enrollment.

## System boundary

- Supabase Auth establishes the student identity.
- Stripe may create a paid enrollment only through a verified webhook.
- `access_grants` limits the student to the purchased course.
- The LMS compliance engine owns instructional time, assignment completion, remediation, final eligibility, regulatory credit, and certificates.
- The portal reads compliance summaries and records navigation events. Opening the portal or clicking Resume never creates instructional credit.

## Student record

The dashboard contract includes:

- current, completed, expired, and cancelled enrollments;
- exact course version and approval status;
- assignment and quiz-mastery summaries;
- state/course calendar eligibility and earliest final-exam date;
- unresolved final requirements;
- assigned instructor and open help requests;
- payment and refund summary;
- certificate status;
- a server-controlled resume path;
- a separate non-credit licensing navigator.

## California readiness

California enrollments may use the same portal while retaining California-only configuration for 15 assignments per 45-hour course, calendar eligibility, three separate regulatory course records, instructor support, and licensing navigator steps. These rules are not defaults for other states.

## Authentication

The browser sends credentials only to the same-origin session endpoint. The endpoint exchanges them with Supabase Auth and returns Secure, HttpOnly, SameSite cookies. Access and refresh tokens are not stored in localStorage. Production activation requires `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `STATECOURSE_BASE_URL`.

## Release gates

Before first enrollment:

1. Apply `database/003_student_portal.sql` to production Supabase.
2. Configure the production Supabase Auth project and approved redirect/origin settings.
3. Add password recovery and email verification.
4. Add rate limiting and abuse monitoring to the sign-in endpoint.
5. Connect the production course engine to Supabase enrollment IDs and course versions.
6. Verify portal-to-course resume does not bypass sequencing or state-specific compliance rules.
7. Complete security, accessibility, mobile, and account-recovery testing.
