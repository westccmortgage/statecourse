# Texas — primary text read directly

Recorded 2026-08-27.

This file says what was read, what it says, and — the part that matters most for a reviewer — **what
could not be read, and is therefore stated nowhere in this build.**

## One finding governs everything below and should be read before anything else

**Texas moved its two highest authorities behind JavaScript applications, and neither could be
opened from this build environment.**

- The **official Texas Administrative Code** is now served only from the Secretary of State's Appian
  portal at `texas-sos.appianportalsgov.com`. The legacy reader at
  `texreg.sos.state.tx.us/public/readtac$ext.TacPage` returns a **"This Site Has Moved"** page for
  every section requested — §§ 535.55, 535.60 through 535.67 and 535.101 were each tried. The
  replacement returns a 2,506-byte application shell to any non-browser client.
- **`statutes.capitol.texas.gov`**, which formerly served the Occupations Code as static documents,
  now returns **the identical 250,874-byte application shell for every document path** — `.htm`,
  `.pdf` and `StatutesByDate` alike — and returns **406** for a non-HTML `Accept` header. The
  statute text is fetched by client-side JavaScript.
- **There is no browser fallback here.** Headless Chromium is installed, and it cannot reach *any*
  host from this environment; it fails with `ERR_CONNECTION_RESET` even against `trec.texas.gov`,
  which `curl` retrieves without difficulty.

**Consequently: no Texas statutory text and no Texas rule text is quoted, paraphrased, relied on or
stated anywhere in this build.** `TX_REGULATORY_SOURCE_LOCK` is **FAIL**, and it is failing for the
correct reason rather than passing on a substitute.

**What this blocks, stated plainly.** Principles of Real Estate I is a course about Texas property
interests, homestead, legal descriptions, ownership forms, contracts, deeds, title, mortgages and
closing. Writing it requires the Texas Property Code, Estates Code, Finance Code, Tax Code, Local
Government Code and Occupations Code. **None could be opened, so none of it was written.** Writing it
from memory would have produced exactly the defect this project spent August correcting in Arizona —
a confident regulatory statement with nothing behind it.

---

## 1. What was obtained and read

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

### The Texas Register — Secretary of State, 2026

Reachable as static PDFs and HTML at `sos.texas.gov/texreg/`, unlike the Administrative Code itself.
**34 issues** of the 2026 adopted-rules sections were scanned (January through August), together with
the Title 22 adopted-rules pages for May through August 2026.

**Finding.** The only Texas Real Estate Commission adoptions in Chapter 535 in 2026 are **§ 535.214**
(issue of 27 February 2026) and **§ 535.69** (issue of 22 May 2026). **No adopted amendment to
§ 535.62 or § 535.65 appears anywhere in the 2026 adopted-rules publication.**

**What that does and does not establish.** It does not establish that no such amendment exists — it
may have been adopted before 2026, or published in a part not scanned. It establishes that **this
project searched the Secretary of State's own publication and did not find it**, and that nothing in
this build is written to it. The completion-record rule said to take effect 31 August 2026, with an
operational requirement from 1 October 2026, is **UNVERIFIED** for the same reason, and no completion
record has been built to it.

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

- **22 TAC §§ 535.55, 535.60 through 535.67, and 535.101**, in their adopted text. This includes
  everything the build would otherwise say about provider approval, course approval, instructor
  qualification, examination administration, identity assurance, record retention, the four-year
  course term, the renewal window, the bond, the reserve, and the financial ratios.
- **Texas Occupations Code chapter 1101** in its own text.
- **The Texas Property Code, Estates Code, Finance Code, Tax Code and Local Government Code** — every
  chapter Principles of Real Estate I would need.
- **The Qualifying Education Provider Application's own field list, attachment list and fee
  calculation**, which sit behind the REALM login.
- **The current REALM distance qualifying-course application**, and any inactivity timeout,
  proctoring requirement or examination-administration requirement it may impose.
- **Any adopted amendment to § 535.62 or § 535.65**, which was searched for in the Secretary of
  State's 2026 publication and not found.
- **The Instructor Manual Guidelines** for qualifying real estate courses, and the **Course and
  Instructor Evaluation Form** — both published by TREC and neither yet retrieved.

**Consequently this build states no Texas rule, no Texas statute, no passing score, no proctoring
requirement, no retention period, no timeout value, no instructor qualification and no financial
ratio as a Texas requirement.** Where the work order supplied such a figure, it is carried with
`verified: false` and labelled as coming from the work order rather than from a source.

---

## 4. What follows from this, stated plainly for the reviewer

**The Texas foundation in this repository is real and the Texas curriculum does not exist.** The six
courses are enumerated, disabled and separately approvable; the fee arithmetic is computed from the
published schedule; the PRINS1-1 structure is transcribed exactly and guarded by invariants; the
gates refuse to grant; and the payment contract refuses to open a checkout.

**What is missing is the law.** Until a person opens the Secretary of State's portal and the
Legislature's statute site in a browser and saves the adopted text, no Texas course content can be
written here without inventing it — and this project does not invent it.

---

**Texas provider application — NOT FILED. No StateCourse Texas course is approved by the Texas Real
Estate Commission, and no Texas qualifying education credit is available.**
