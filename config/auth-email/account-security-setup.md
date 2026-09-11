# Account security deployment

Password request: https://statecourse.com/student/password/
Signed-in password change: https://statecourse.com/student/password/?mode=change

The reset request uses the existing allowed https://statecourse.com/student/sign-in/ callback. auth-entry.js forwards a recovery fragment to the new password form before existing-session navigation. The form removes the fragment from browser history and retains the access token in memory only. Refreshing the form loses that token; request a fresh link if needed.

## Supabase: Reset password email

Subject: Reset your StateCourse password

Paste recovery.html into Authentication → Emails → Reset password. Keep both {{ .ConfirmationURL }} links intact. This is a different template from Confirm sign up. Hosted template installation is pending dashboard access; the normal recovery template works with the new form but is not yet branded.

## Supabase: Google provider

Observed during implementation: external.google=false. Application code is ready, but Google login is NOT activated.

Use the existing StateCourse Google Cloud project and configure a Web application OAuth client:
- Authorized JavaScript origin: https://statecourse.com
- Authorized redirect URI: https://gdldvjefibssxnrpsxja.supabase.co/auth/v1/callback
- Branding: StateCourse, with the actual production homepage/privacy/terms URLs.
- Only basic OpenID, email and profile scopes; no Gmail or Drive access.
- Audience must permit intended real students; do not leave production access restricted to a development test-user list.

In Supabase → Authentication → Sign In / Providers → Google, enable Google and save the client ID and secret. Keep nonce checks enabled. Do not put the client secret in frontend code or chat.

The app uses PKCE, a short-lived Secure/HttpOnly/SameSite=Lax verifier cookie, and the already allowed student and admin callback URLs. Auth verifies the exchange; the app syncs the same user record as password login before setting its existing session cookies. Role bindings are unchanged and are never granted by OAuth or email claims.

## Verified / remaining

Automated checks cover CSRF, missing/expired tokens, password policy, current-password validation and user mismatch, PKCE verifier requirement, safe return URLs, missing provider configuration, session cookie protection, throttling and signout failure after a successful update.

Still requires a real user: received recovery email, setting a new password, signing in with it, and Google consent/callback once provider configuration is enabled. Never mark these checks complete from unit tests. Existing access JWTs can remain valid until expiry even after global refresh-session revocation.

No database migrations or paid service are required for these application changes.

Sources: https://supabase.com/docs/guides/auth/social-login/auth-google and https://supabase.com/docs/guides/auth/sessions/pkce-flow
