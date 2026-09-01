# Human export list — the only Texas sources a person still has to fetch

**Prepared:** 2026-08-27
**Scope: eight administrative rules. Nothing else.**

Everything else Texas needs has been retrieved automatically. Twenty-five statutory chapters and
four federal sources are held under `texas/trec-sources/`, hashed and recorded. **This list is not a
request to export Texas law by hand.**

## Why these eight and no others

The Secretary of State's Administrative Code moved to an Appian portal at
`texas-sos.appianportalsgov.com`. It serves a 2,506-byte JavaScript shell to any non-browser client;
the legacy reader at `texreg.sos.state.tx.us` returns "This Site Has Moved" for every rule; and
headless Chromium cannot reach any host from this build environment, so there is no automated
fallback. Everything attempted is recorded in `config/texas/regulatory-manifest.mjs`.

**Two of the ten rules are already partly covered** and are not on this list:

- **§ 535.62** and **§ 535.65** — the text as proposed is held, from the Secretary of State's Texas
  Register of 22 May 2026 (`texas/trec-sources/texas-register/`). Both were adopted 10 August 2026
  and take effect 31 August 2026. **The adoption notice publishes in the Texas Register issue of
  28 August 2026**, which is a static file this build can fetch itself the day it appears — so these
  two need no human at all, only the date.

## What to export

For each rule below, open the portal, navigate to Title 22 › Part 23 › Chapter 535, and save the
rule as HTML print or PDF — **either is acceptable**.

| # | Rule | Save as |
|---|---|---|
| 1 | 22 TAC § 535.55 — Education, Experience, Educational Programs, Time Periods, and Type of License | `texas/trec-sources/tac/535.55.pdf` |
| 2 | 22 TAC § 535.60 — Definitions (education providers) | `texas/trec-sources/tac/535.60.pdf` |
| 3 | 22 TAC § 535.61 — Approval of Providers of Qualifying Courses | `texas/trec-sources/tac/535.61.pdf` |
| 4 | 22 TAC § 535.63 — Qualifications for Instructors of Qualifying Courses | `texas/trec-sources/tac/535.63.pdf` |
| 5 | 22 TAC § 535.64 — Content Requirements for Qualifying Real Estate Courses | `texas/trec-sources/tac/535.64.pdf` |
| 6 | 22 TAC § 535.66 — Credit for Courses Offered by Public High School or Accredited Colleges or Universities | `texas/trec-sources/tac/535.66.pdf` |
| 7 | 22 TAC § 535.67 — Approval of Continuing Education Providers | `texas/trec-sources/tac/535.67.pdf` |
| 8 | 22 TAC § 535.101 — Fees | `texas/trec-sources/tac/535.101.pdf` |

**Portal:** `https://texas-sos.appianportalsgov.com/rules-and-meetings?interface=VIEW_TAC`
**Search:** `https://texas-sos.appianportalsgov.com/rules-and-meetings?interface=SEARCH_TAC`

**As-of date needed:** the text in force on the day you export it. Note the date the portal shows
for each rule — if the portal prints an "as of" or "current through" line, keep it in the export.

**§ 535.61 and § 535.63 are the two that matter most.** § 535.61 carries the provider approval
standards, the surety bond and the financial ratios this build currently records as unverified;
§ 535.63 carries the instructor qualification routes the dossier checklist is written against. The
other six can follow later without blocking anything.

## What these unblock, and what they do not

Exporting all eight flips **`TX_PROVIDER_RULE_SOURCE_LOCK`** to PASS, subject to the provider
application itself, which needs a REALM account rather than an export.

**They do not block Principles of Real Estate I.** `TX_PRINCIPLES_I_SOURCE_LOCK` already passes: the
course form is held and all 46 of its units have a primary source on disk or a recorded reason for
needing none. That is the point of splitting the two locks — an administrative access problem is not
a reason to leave a course unwritten.
