# Texas — primary text read directly

Recorded 2026-08-27.

This file says what was read, what it says, and — the part that matters most for a reviewer — **what
could not be read, and is therefore stated nowhere in this build.**

## A correction, dated, before anything else

**Two conclusions in the TX-0 report of 2026-08-24 were wrong, and both were wrong in the same
way — a single failing endpoint was generalised into a statement about Texas.**

### Correction 1 — Texas statutes are available, and were retrieved

TX-0 recorded the Occupations Code as unreachable because
`statutes.capitol.texas.gov/Docs/…` returns an identical 250,874-byte single-page-application shell
for every document path. **That host does behave that way. The conclusion drawn from it did not
follow.** The **Texas Legislative Council** publishes the same codes as plain static HTML:

```
https://tcss.legis.texas.gov/resources/{CODE}/htm/{CODE}.{CHAPTER}.htm
```

**Twenty-five Texas chapters and four federal sources were retrieved from it on 2026-08-27, with no
browser, no login, and no failures.** All are held under `texas/trec-sources/`, hashed, and mapped
unit by unit to PRINS1-1. **`TX_PRINCIPLES_I_SOURCE_LOCK` now passes**, and Principles of Real
Estate I is no longer blocked at the source.

### Correction 2 — the August 2026 amendments exist

TX-0 reported that no adopted amendment to **§ 535.62** or **§ 535.65** appears in the Secretary of
State's 2026 publication. **They exist.** TREC's own rule records state, for both:

| | § 535.62 | § 535.65 |
|---|---|---|
| Proposed | 4 May 2026 | 4 May 2026 |
| **Adopted** | **10 August 2026** | **10 August 2026** |
| **Effective** | **31 August 2026** | **31 August 2026** |
| Emergency adopted | NO | NO |
| SoS record | `recordId=465426` | `recordId=465427` |

**Why the scan missed them, stated plainly.** An adoption filed on 10 August publishes in the Texas
Register about three weeks later — the issue of **28 August 2026**, which returns 403 because it is
not yet published. The scan covered issues through 21 August and was accurate about what it covered.
**The error was in the sentence, not the search: "not found in the issues I read" was reported as
"does not appear."**

Both are recorded as **`adopted_pending_effective`**. Today is 27 August 2026; they are not current
law for four more days, and nothing here describes them as effective.

### What that leaves genuinely unreachable

**The codified current text of eight administrative rules** — §§ 535.55, 535.60, 535.61, 535.63,
535.64, 535.66, 535.67 and 535.101. The Secretary of State's Appian portal serves a 2,506-byte
JavaScript shell to a non-browser client, the legacy reader returns "This Site Has Moved", and
headless Chromium cannot reach any host from this environment. That is a real barrier and it is
**eight rules wide**, not the whole of Texas law. The list is at
`texas/submission/human-export-list.md`.

**And the provider application itself**, which is behind a REALM/Accela login.

---

## 1. What was obtained and read

### Texas statutes and federal sources — 29 documents held

Retrieved 2026-08-27 from `tcss.legis.texas.gov` (Texas Legislative Council), `uscode.house.gov`
and the eCFR API. Held under `texas/trec-sources/statutes/` and `texas/trec-sources/federal/`,
each hashed and recorded in `config/texas/statute-sources.mjs` with the PRINS1-1 units it serves.

**Twenty-five Texas chapters:** Occupations Code 1101 · Property Code 5, 11, 12, 13, 21, 41, 51, 53,
111 · Estates Code 101, 201, 251 · Business and Commerce Code 9, 26 · Civil Practice and Remedies
Code 16 · Tax Code 32 · Insurance Code 2501 · Water Code 11 · Business Organizations Code 200 ·
Government Code 4001, 4005 · Local Government Code 232 · Natural Resources Code 21 · Finance Code 343.

**Four federal sources:** 12 U.S.C. § 2601 et seq. (RESPA) · 12 C.F.R. part 1024 (Regulation X, eCFR
as of 2026-08-01) · 26 U.S.C. § 1445 (FIRPTA) · 26 U.S.C. § 860A et seq. (REMICs).

**HELD IS NOT READ, and the difference is enforced.** Downloading a chapter does not make its
sections known. **Ten sections have actually been opened and read**, each recorded with what was
taken from it: Occ. Code §§ 1101.155 and 1101.301; Prop. Code §§ 5.008, 12.001, 41.001, 41.002,
51.002; Bus. & Com. Code § 26.01; 12 U.S.C. § 2601; 26 U.S.C. § 1445. Everything else in those
chapters is unread by construction, and the curriculum guard refuses a citation to a section that is
not on the read list.

**Coverage of the 46 PRINS1-1 units:** 42 have a primary source held; 4 are named as needing none,
with the reason recorded — Historical Background, Investing in Real Estate, The Investment and The
Benefits are taught as history and economics, and any tax benefit stated in the last of them must
cite the Internal Revenue Code, which is not held for it. **No unit is uncovered.**

### The six qualifying course approval forms — TREC, adopted by rule

All six downloaded from `trec.texas.gov` on 2026-08-24, held under `texas/trec-sources/`, and hashed
in `config/texas/regulatory-manifest.mjs`.

| Form | Course | Revision | SHA-256 (first 16) | Bytes |
|---|---|---|---|---|
| **PRINS1-1** | Principles of Real Estate I (30 hours) | 09/11/2024 | `1ec0a549dac17854` | 1,204,141 |
| **PRINS2-1** | Principles of Real Estate II (30 hours) | 09/11/2024 | `732242abd59613a0` | 1,233,801 |
| **LOA-1** | Law of Agency (30 hours) | 09/11/2024 | `3fb2206dc9408a80` | 1,380,818 |
| **LOC-0** | Law of Contracts (30 hours) | 06/20/2016 | `eaebc9d03a8131ca` | 991,862 |
| **PCF-0** | Promulgated Contract Forms (30 hours) | 06/20/2016 | `6b87ca7dceb8d06f` | 1,040,262 |
| **REF-0** | Real Estate Finance (30 hours) | 06/20/2016 | `0ce0803148aff392` | 1,260,112 |

**An old revision date is not evidence that a form is obsolete.** LOC-0, PCF-0 and REF-0 print 2016
dates. They are the forms TREC currently publishes, and the currently published form adopted by rule
controls until it is replaced.

**What PRINS1-1 gave, in full.** Nine topics, forty-six units, and a suggested length in minutes for
every unit, totalling **1500 minutes** on the form's own TOTAL MINUTES line. Each topic carries a
scope note in the Commission's words. The provider enters the page on which each unit is covered and
the Commission marks each unit included or not included — so **the topic-to-unit relationship is the
Commission's and may not be rearranged**, while the order of presentation is the provider's. The
whole structure is transcribed with invariants in `config/texas/prins1-course-form.mjs`, which
refuses to load if any topic's units do not sum to the form's printed subtotal.

**One arithmetical fact, and its limit.** 1500 minutes labelled 30 hours is a **50-minute credit
hour**. That is the form's own arithmetic and is recorded as such. **It is not a rule citation** —
the rule that fixes the credit-hour length is in 22 TAC, which could not be read — so the convention
is carried as `FORM_DERIVED_UNVERIFIED_AGAINST_RULE`.

### The fee schedule — TREC, effective 15 December 2025

Read at `trec.texas.gov/node/142` on 2026-08-24. Hashed by **fee row** rather than by page, so that
navigation churn on a Drupal site is not reported as a fee change.

| Item | Fee | Texas Online Fee |
|---|---:|---:|
| Qualifying Education Original Application Filing (**4 year approval**) | $400.00 | $12.00 |
| Qualifying Provider Annual Fee | $200.00 | $6.00 |

Qualifying course applications: **$50 base**, plus **$10 per credit hour** for content and
examination review, **$10 per credit hour** for classroom delivery design and presentation review,
and **$20 per credit hour** for distance education delivery design and presentation review.

**Computed, not asserted**, in `config/texas/regulatory-manifest.mjs`: a 30-hour distance-only course
is **$950**; six of them **$5,700**; with the provider application, **$6,112** to file; the annual
provider fee is **$206**. Whether a distance-only course also incurs the classroom review component
is not stated on the schedule and is question 8 of the clarification memo. **REALM's own calculation
controls, and a difference will be reported rather than reconciled silently.**

### The Texas Register — Secretary of State

Reachable as static PDFs and HTML at `sos.texas.gov/texreg/`, unlike the Administrative Code itself.

**The issue of 22 May 2026, Title 22 Examining Boards, Proposed Rules** is held at
`texas/trec-sources/texas-register/2026-05-22-title22-proposed-rules.html`
(SHA-256 `6c5c97f0c283133b…`, 172,495 bytes). It carries **the full text of §§ 535.62 and 535.65 as
proposed**, filed with the Office of the Secretary of State on 8 May 2026 under **TRD-202601975**,
made under **Texas Occupations Code § 1101.151**.

**This is the highest-ranked Texas source this project has actually opened**, and three things were
taken from it:

- **§ 535.65(a)(4)** — where a provider keeps no fixed Texas office, it must designate a Texas
  resident as attorney-in-fact **to accept service of process AND act as custodian of records in
  Texas**, with a power-of-attorney filed with the Commission in an acceptable form. The same person
  holds both roles.
- **§ 535.65(a)(1)** — the nine provider responsibilities, including *"validation of student
  identity acceptable to the Commission"* and *"maintaining student course completion records"*.
- A **10% ownership threshold** for a Principal Information Form, and a **$20,000 surety bond**
  among the financial documents § 535.61 requires.

**It is proposed text, and every claim taken from it says so.** Adopted text can differ. The
adoption notice publishes 28 August 2026 — a static file this build can fetch itself.

### The provider application — located, not readable

`trec.texas.gov/forms/qualifying-education-provider-application` does not serve a PDF. It resolves to
TREC's **Accela portal** — `/TREC/Login.aspx`, `/TREC/CommunityView/account/new`.

**This resolves the conflict the work order raised.** TREC's pages still carry "Apply by Mail"
language in places, and current REALM guidance says applications and documentation are processed
online. **The application link itself goes to the online portal**, so the filing is online. What
cannot be settled from outside the portal is how the **original bond with a raised seal** is
delivered alongside an online filing — that is question 1 of the clarification memo, and it is not
answered by inference.

---

## 2. What was consulted and is NOT authority

**The TREC consolidated rules page** at `trec.texas.gov/agency-information/rules-and-laws/trec-rules`
reproduces Chapter 535 in full and was read for navigation — to learn which sections exist and
roughly what each covers.

**It is a convenience copy published by the regulated agency, not the Secretary of State's adopted
text, and no rule, figure, deadline, requirement or definition in this build is taken from it.** The
manifest records it with reachability `READ_NOT_AUTHORITY`, and the source lock fails if any material
claim is ever attached to it.

---

## 3. NOT obtained. Nothing in this build comes from any of these

- **The codified current text of 22 TAC §§ 535.55, 535.60, 535.61, 535.63, 535.64, 535.66, 535.67
  and 535.101.** Eight rules, listed for export at `texas/submission/human-export-list.md`. Until
  they are read this build states no provider approval standard, no instructor qualification route,
  no course content requirement, no fee rule and no retention period as a Texas requirement.
  **§ 535.61 and § 535.63 are the two that matter most** — the financial standards and the
  instructor routes.
- **The adopted text of §§ 535.62 and 535.65.** The proposed text is held; the adoption notice
  publishes 28 August 2026.
- **The Qualifying Education Provider Application's own field list, attachment list and fee
  calculation**, which sit behind the REALM/Accela login.
- **The current REALM distance qualifying-course application**, and any inactivity timeout,
  proctoring requirement or examination-administration requirement it may impose.
- **Every section of the twenty-nine held documents other than the ten recorded as read.** Holding a
  chapter is not reading it, and the guard enforces the difference.
- **The Internal Revenue Code**, beyond §§ 1445 and 860A. No tax benefit, rate, holding period or
  depreciation rule may be stated in PRINS1-1 unit T05U7 without it.
- **The Instructor Manual Guidelines** for qualifying real estate courses, and the **Course and
  Instructor Evaluation Form** — both published by TREC and neither yet retrieved.

## 4. What follows from this, stated plainly for the reviewer

**The Texas source layer is now in two halves and they are locked separately, because they block
different work and different people clear them.**

- **`TX_PRINCIPLES_I_SOURCE_LOCK: PASS`** — the course form is held, and all 46 of its units have a
  primary source on disk or a recorded reason for needing none. Principles of Real Estate I can be
  written against sources rather than recall. **It has not been written.**
- **`TX_PROVIDER_RULE_SOURCE_LOCK: FAIL`** — eight codified rules and the provider application
  remain unread. The provider submission cannot be prepared against them.
- **`TX_REGULATORY_SOURCE_LOCK: FAIL`** — the aggregate, which passes only when both do.

**Splitting them is the point.** Merged into one status, a provider-portal login barrier read as a
reason not to write a course. It never was one.

---

**Texas provider application — NOT FILED. No StateCourse Texas course is approved by the Texas Real
Estate Commission, and no Texas qualifying education credit is available.**
