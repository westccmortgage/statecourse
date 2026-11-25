# Site visit counting and the daily report

First-party collection through the existing Netlify host and Supabase database.

## What is recorded

One row per public page opened (`site_visits`, migration 034): page path without query
string, referring site's host name, campaign tags, country/state/city from the hosting
provider, device and browser family, whether the client looks like a person, a robot
that names itself, or something that is not a normal browser, and the visitor's cookie
choice. Not recorded: IP address, full user-agent string, names, email addresses.

Unique visitors are counted with a one-way mark that changes every day. A browser is
remembered across days only after the visitor presses Accept (`sc_vid` cookie). Decline,
or a Global Privacy Control signal, means nothing is remembered.

Counted pages: every public page, plus sign-in, registration, My StateCourse and free
practice. Never counted: lessons, quizzes, examinations, the administration console and
staff pages (`scripts/inject-site-analytics.mjs`).

## Limits

- A robot that imitates a browser well is counted as a person.
- A robot that neither runs the page script nor loads images is not seen at all.
  Seeing every request would need logging at the hosting edge, which is not built.
- Anonymous visitors are never identified by name. Signed-in students are, from the
  account activity the portal already records.

## Pieces

| Piece | Where |
| --- | --- |
| Page script and cookie notice | `public/statecourse/analytics.js`, `analytics.css` |
| Collector | `netlify/functions/site-collect.mts` (`/api/collect`) |
| Classification | `netlify/functions/_lib/site/visit.mjs` |
| Report | `netlify/functions/_lib/site/report.mjs`, SQL `site_visit_report` |
| Daily email | `netlify/functions/site-daily-report.mts`, 15:00 UTC (7 AM Pacific in winter, 8 AM in summer) |
| Admin page | `/admin/visitors/` (`/api/admin/site-report`, owner and administrators) |

## Switching on (each step is a production change needing the owner's approval)

1. Apply `database/034_site_visits.sql` in the Supabase SQL editor. Until then every
   visit is discarded and the report says visit counting is not available.
2. Configure one mail transport. Production uses `SITE_REPORT_DELIVERY=netlify-forms`
   and the confirmed native `statecourse-daily-reports` notification to
   `info@statecourse.com`. Alternatively set `RESEND_API_KEY` with optional
   `SITE_REPORT_TO` (default `data@statecourse.com`) and `SITE_REPORT_FROM`
   (default `StateCourse Reports <reports@statecourse.com>`; domain verified in Resend).
   Without either transport the scheduled job returns 503; the admin page still works.
3. Redeploy.

## Retention

Rows are never edited. Nothing deletes old rows yet; decide a retention period and
remove older rows with a dated `delete`.

## November 24 repair — production change record

Owner requested repair of visitor tracking and notifications, then authorized taking
control and completing it. Production target: Netlify site
`b514a8f8-782b-448c-8881-a914ee42c69b`, database `gdldvjefibssxnrpsxja`.
Read-only catalog inspection confirmed `site_visits`, `site_daily_reports`, and
`site_visit_report` all absent. No historical anonymous visits can be recovered.
`student_portal_events` uses `occurred_at`, not `created_at`; existing service-role
SELECT permissions on events/students are sufficient. No Auth-table grants needed.

Created settings (previously unset): `SITE_REPORT_DELIVERY=netlify-forms`,
`SITE_REPORT_TO=info@statecourse.com`, production context / Functions scope only.
Existing `RESEND_API_KEY` is absent and remains unchanged. Native delivery uses a
new `statecourse-daily-reports` form and a notification only for that form to the
school's `info@statecourse.com`; phone-call notifications remain untouched.

Rollback: remove the two new plain settings and redeploy the previous commit; remove
only the new daily-report notification if necessary. Keep any collected analytics
rows private; do not drop tables or delete records for rollback. Migration 034 creates
only analytics objects, enables RLS, and grants only the existing backend role.
Applying it does not change students, enrollments, timers, payments, or regulatory credit.

Migration 034 applied successfully in the confirmed website database through its SQL
editor. Fourteen focused tests passed, including the SQL migration run twice, RLS/grants,
Pacific day boundaries, account event timestamps, and both email transports/failures.

Production verification (November 25 UTC / November 24 Pacific):

- Functional commit `843cfecfb9084ebd90c43b3e6dc3f42201252b10`, published deploy
  `6b067c92baf4bd41ac2a71fa`, ready at 06:14:21 UTC; Netlify production build passed.
- Catalog checks: both analytics tables have RLS enabled; anon/authenticated cannot
  read reports; anon cannot execute the report; existing backend role can execute it.
- Real collector request returned 200 and appeared in `site_visits`. At 06:15 UTC
  four bot-classified visits were present; no fixture students or historical visits added.
- Manual scheduled-function run at 06:14:47 UTC: `stored=true`, `emailed=true`,
  `visits=true`, `accounts=true`. Stored report for Pacific November 23 has
  `emailed_at=2026-11-25T06:14:47.305Z`. This is the expected previous completed day
  when testing on Pacific November 24 evening, not the next morning's report.
- New native form ID `6b067b54e38838b6b82d08f0`, new email hook
  `6b067b7fcab4d704c0bd300b`, recipient confirmed. Hook is restricted to this form;
  the pre-existing phone-call notification is unchanged.
- First native report was spam-filtered and manually marked verified. Added the
  real school sender field and a descriptive message. The second report passed
  automatically and reached `info@statecourse.com` INBOX at 06:14:47 UTC, message
  `1a21157ade236da3`; both report sections present, no missing-data warnings.
- `GET /api/admin/site-report` without credentials returns 401. `/admin/visitors/`
  redirects to staff sign-in; MFA remains required. Added Visitors to the existing
  console navigation. Authenticated dashboard rendering was not exercised in this
  browser because no owner staff session was present.
- `NMLS_TEST_PGLITE_MODULE=/tmp/statecourse-visits-tests/node_modules/@electric-sql/pglite/dist/index.js node --test tests/site-visits.test.mjs`:
  14 passed, 0 failed, 0 skipped, including migration execution and native mail failures.

The next ordinary scheduled run is November 25 at 15:00 UTC (07:00 Pacific), covering
Pacific November 24. Future delivery/traffic is not guaranteed by this one observed run;
`emailed_at` records provider acceptance, and mailbox delivery was checked independently.
