# Texas — primary text read directly

Recorded 2026-08-27. Updated 2026-09-02 after the final adopted §§535.62 and 535.65, the current
provider instructions and the current course instructions were retrieved and read.

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

**Why the first scan missed them, stated plainly.** The scan was performed before the 28 August
issue was available and covered issues only through 21 August. The final publication has now been
retrieved, held and hashed at
`texas/trec-sources/texas-register/2026-08-28-title22-adopted-rules.html`.

Both rules are recorded as **`current_effective`**. They were published 28 August 2026 and have
been effective since 31 August 2026. The adoption says the only changes from the proposal were
non-substantive reference-language changes to §535.62(b)(6)(C) and §535.65(g)(5).

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

### Texas statutes and federal sources — 35 documents held

Retrieved 2026-08-27 from `tcss.legis.texas.gov` (Texas Legislative Council), `uscode.house.gov`
and the eCFR API. Held under `texas/trec-sources/statutes/` and `texas/trec-sources/federal/`,
each hashed and recorded in `config/texas/statute-sources.mjs` with the PRINS1-1 units it serves.

**Twenty-nine Texas chapters:** Occupations Code 1101 · Property Code 5, 11, 12, 13, 21, 41, 51, 53,
111 · Estates Code 101, 111, 112, 201, 251 · Family Code 3 · Business and Commerce Code 9, 26 ·
Civil Practice and Remedies Code 16 · Tax Code 11, 32 · Insurance Code 2501 · Water Code 11 ·
Business Organizations Code 200 · Government Code 4001, 4005 · Local Government Code 232 · Natural
Resources Code 21 · Finance Code 343. (Estates Code 111 and 112, Family Code 3, Tax Code 11 were
retrieved 2026-08-28 for the TX-1A build.)

**Six federal sources:** 12 U.S.C. §§ 2601, 2603 and 2607 (RESPA, retrieved individually) ·
12 C.F.R. part 1024 (Regulation X, eCFR as of 2026-08-01) · 26 U.S.C. § 1445 (FIRPTA) ·
26 U.S.C. § 860A (REMICs).

**HELD IS NOT READ, and the difference is enforced.** Downloading a chapter does not make its
sections known. At the TX-0.1 close, ten sections had been read. **The TX-1A read-before-write
protocol raised that to 76 sections opened and read** — each recorded in
`config/texas/statute-sources.mjs` with a substantive note stating the proposition taken from it,
per unit, before the unit was written. Everything else in the held chapters is unread by
construction, and the claim-traceability gate (`lib/texas-claim-traceability.mjs`) resolves every
§-citation in the nine modules against the read list, refusing any section not on it. Two
cross-references survive by documented exception: § 53.254 and Tex. Const. art. XVI § 50, each
cited only as the read text of § 41.001 itself cites them, and each taught in module-03 as unread.

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
hour**. That is the form's own arithmetic and is recorded as such. **It is not a rule citation.** The
final adopted text of §§ 535.62 and 535.65 was read and does not define the length of a credit hour;
the remaining relevant codified Chapter 535 text is not readable from this environment. The
convention therefore remains `FORM_DERIVED_PENDING_TAC_CONFIRMATION`.

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

## 1a. The TX-1A build record — 2026-08-28

The Principles of Real Estate I content build followed the read-before-write protocol: for each
PRINS1-1 unit, the needed legal claims were identified, the exact sections were extracted from the
held snapshots and read, the read was recorded in `config/texas/statute-sources.mjs`, and only then
was the unit written. The verifiable artifacts:

- **Nine modules** under `texas/tx-principles-real-estate-i-30-v1/curriculum/` — 50,603 words, all
  46 units present under their exact PRINS1-1 titles, with statute reading exercises, applied
  exercises and module recaps.
- **76 sections read** across 29 Texas chapters and 6 federal sources, each with a substantive note.
  Four units are recorded as needing no statute (history and investment arithmetic), with reasons.
  T05U7 ("The Benefits") is taught **without any federal tax proposition** — option B of the TX-1A
  order — and a vocabulary guard enforces the absence.
- **Formative assessments** in `config/texas/principles-i-question-bank.mjs`: 32 primary quiz items
  (≥3 per topic) with rationale, remediation anchor and replacement question; 3 scenario exercises.
  **No final examination exists**; TX-1B is not authorized, and its input manifest is at
  `texas/submission/tx1b-exam-build-input-manifest.md`.
- **Time evidence** generated from the files by `scripts/texas-principles-i-time-study.mjs`:
  `timed-course-outline.md` and `time-reconciliation.md` under the course's `submission/` directory.
  Every module's supported minutes meet its prescribed subtotal and the total meets 1,500, under the
  provider's documented methodology (labelled PROVIDER_METHODOLOGY, not a regulator figure).
- **The claim-traceability gate** — `TX_PRINCIPLES_I_CLAIM_TRACEABILITY`, separate from the source
  lock by design: the lock says the documents are what was read; the gate says the curriculum cites
  only what was read. Status at build close: PASS.

## 2. What was consulted and is NOT authority

**The TREC consolidated rules page** at `trec.texas.gov/agency-information/rules-and-laws/trec-rules`
reproduces Chapter 535 in full and was read as the regulator's current convenience copy for the
remaining sections whose live Secretary of State export could not be obtained.

**It is a convenience copy published by the regulated agency, not the Secretary of State's adopted
text.** Course and packet design may use it as agency evidence with that caveat, but it cannot clear
the controlling-source lock. The manifest records the page itself with reachability
`READ_NOT_AUTHORITY`; extracted section copies and their exact design uses are recorded separately
in `config/texas/trec-rules-source-lock.mjs`.

---

## 3. NOT obtained. Nothing in this build comes from any of these

- **The codified current text of 22 TAC §§ 535.55, 535.60, 535.61, 535.63, 535.64, 535.66, 535.67
  and 535.101.** Eight rules, listed for export at `texas/submission/human-export-list.md`. Until
  they are read this build treats the TREC-published reproduction as design evidence rather than
  the controlling Secretary of State copy.
  **§ 535.61 and § 535.63 are the two that matter most** — the financial standards and the
  instructor routes.
- **The Qualifying Education Provider Application's own field list, attachment list and fee
  calculation**, which sit behind the REALM/Accela login.
- **The current REALM distance qualifying-course application**, and any inactivity timeout,
  proctoring requirement or examination-administration requirement it may impose.
- **Every section of the thirty-five held documents other than the 76 recorded as read.** Holding a
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
  written against sources rather than recall. **It has now been written — TX-1A, 2026-08-28 — under
  the read-before-write protocol, with its own separate claim-traceability gate.**
- **`TX_PROVIDER_RULE_SOURCE_LOCK: FAIL`** — eight live codified sections and the provider
  application's own field list remain unread. The provider packet can be prepared against the
  current TREC page, its published checklist and final §§535.62/535.65, but final portal
  reconciliation remains blocked.
- **`TX_REGULATORY_SOURCE_LOCK: FAIL`** — the aggregate, which passes only when both do.

**Splitting them is the point.** Merged into one status, a provider-portal login barrier read as a
reason not to write a course. It never was one.

---

**Texas provider application — NOT FILED. No StateCourse Texas course is approved by the Texas Real
Estate Commission, and no Texas qualifying education credit is available.**
