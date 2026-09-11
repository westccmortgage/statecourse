# DRE review access — 2026-09-11

Two dedicated identities are required for the three California applications:

| Label | Email | Access |
| --- | --- | --- |
| Regulator/Reviewer | dre-regulator-review@statecourse.com | Course review grants; no time or sequence gate; both final-exam forms and instructor references |
| Sample Student | dre-student-review@statecourse.com | Normal student controls; non-credit review records only |

The website sign-in is `/student/sign-in/`. A regulator's course page links to
`/student/review-exams/`. That page uses `/api/student/review-exams`, which requires
a currently active, unexpired course-specific review grant on every request.
It cannot start, save, grade or complete an examination. Student examination
delivery and eligibility enforcement are unchanged.

Creation in the live Supabase project is still pending. The available Netlify
connector masks the service credential; it cannot be used to execute Auth Admin
or privileged REST operations in this session. No existing owner password,
identity or binding has been altered.

A private SQL Editor file, `StateCourse_DRE_accounts_setup.sql`, was prepared
outside the repository. It creates the two identities plus six review access
records with `enrollment_origin='review'`, no checkout attempt and no payment.
It checks the existing completion/certificate guards before doing any permanent
writes. It preserves existing unrelated accounts and never changes an owner
binding. The final result reports account counts and owner diagnostics without
passwords. Passwords are not included in this repository or this document.

SQL verification: 19 checks passed in PGlite PostgreSQL using the actual
application migrations and a representative Supabase Auth schema. This does
not verify production schema compatibility or actual Supabase sign-in.
Endpoint verification covers both forms for each of the three courses, denied
student/anonymous access, revoked/expired/invalid grants, cross-course access
and refusal of all mutation methods. Actual authenticated website walkthrough
and insertion of verified credentials into the submission packages remain pending.
