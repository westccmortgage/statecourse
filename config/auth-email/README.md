# StateCourse signup confirmation email

Status: prepared; NOT applied to hosted Supabase. A repository commit does not configure hosted Auth.

Project: gdldvjefibssxnrpsxja. Website: https://statecourse.com.

## Hosted Auth settings to apply

Authentication → URL Configuration:
- Site URL: https://statecourse.com/student/sign-in/
- Redirect URLs: https://statecourse.com/student/sign-in/ and https://statecourse.com/admin/console/
- Read the current allowlist before editing. Preserve other verified production callback URLs required by existing flows. Remove localhost and obsolete preview entries after checking their usage. Do not use broad wildcards.

The signup code already requests the student sign-in URL. Supabase must allow that exact URL. The Site URL above provides a student-facing fallback when no accepted redirect is supplied.

Authentication → Email Templates → Confirm sign up:
- Subject: Welcome to StateCourse — confirm your email
- Body: paste confirmation.html from this directory.
- Keep {{ .ConfirmationURL }} intact in both links: this is the verification URL, not a plain link to the homepage.
- The email confirms account ownership only. It makes no approval, enrollment, payment, or course-credit claim.

Authentication → SMTP settings:
- Desired sender display name: StateCourse.
- Use an existing verified sender on statecourse.com with the configured SMTP provider.
- Inspect the current provider and verified sender before making any change. Do not invent an address or buy a service.
- A branded HTML body does not change the sender address. Confirm production email delivery settings separately.

## Acceptance on the real website

1. Read back the saved Site URL, redirect allowlist, subject, and HTML.
2. With permission, send confirmation to an existing unconfirmed account. Do not create a fixture account.
3. Inspect the received email on desktop and mobile; check sender, readable content and button.
4. The button verifies email and returns to the public student sign-in URL (or the explicitly allowed owner console URL when requested). It must never return to localhost.
5. Sign in normally. Confirmation alone does not establish this application's HttpOnly session.
6. Check an expired or previously used link is handled intelligibly before declaring the full email flow complete.

No verification tokens, access tokens or passwords belong in source control, screenshots, or logs.

Sources:
- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/auth/auth-smtp
