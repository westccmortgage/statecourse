# Site visit counting and the daily report

First-party only. Nothing is loaded from, or sent to, any other company.

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
2. In Netlify set `RESEND_API_KEY`. Optional: `SITE_REPORT_TO` (default
   `data@statecourse.com`), `SITE_REPORT_FROM` (default
   `StateCourse Reports <reports@statecourse.com>`; the sending domain must be verified
   in Resend). Without the key no email is sent; the admin page still works.
3. Redeploy.

## Retention

Rows are never edited. Nothing deletes old rows yet; decide a retention period and
remove older rows with a dated `delete`.
