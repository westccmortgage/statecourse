# Florida Phase 0 v2 — acceptance report with filing-package update

**Product:** Florida Sales Associate Pre-License Course — FREC Course I
**Branch:** `relay-florida` (the Florida line remains isolated; not rebased — see §11)
**Supersedes:** Phase 0 v1, which was rejected.

**Post-Phase-0 update, 1 Sep 2026:** curriculum authoring was authorized and the 19-section
course-development layer is built. The current DBPR Education-page-linked RE 18, effective June
2026, supersedes the legacy application for planning and filing. It requires two end-of-course
examinations for distance pre/post-licensing and labels RE 19 and RE 20 provider-only. This report
remains the Phase 0 acceptance record; current execution controls are in `florida/HANDOFF.md` and
`florida/submission/00-filing-index.md`.

**Route correction, 1 Sep 2026:** the owner selected the personal Florida-broker route. Current
execution is RE 2 Broker License by Endorsement `[2501/1047]`, followed by the DBPR-assigned exam
(expected from the linked CIB to be the 40-question Florida Laws and Rules exam), then RE 3 Specific
Degree & Broker's License `[1030]`. RE 2 `[1012]` with the 72-hour course/full broker exam and RE 3
`[1010]` are fallbacks only. The generic RE 2 course/exam text conflicts with its endorsement-
specific checklist, so the authorization/written DBPR response must be inspected before spending.

---

## What was wrong in v1

Three things, in descending order of seriousness.

**1. A material legal error.** v1 reported that Rule 61J2-17.011(2), F.A.C. required a Florida
broker's licence of every school permitholder, and that no StateCourse individual could sign a
Florida application. Section 475.451(2)(a), Fla. Stat. says a permitholder "must be the holder of a
license as a broker ... **or must have passed an instructor's examination approved by the
commission**." v1 let an administrative rule — carrying a cross-reference that does not even resolve
— override the statute it implements. It also misread the rule: its operative sentence is scoped to
*which* broker licence counts, not *whether* one is needed. **Corrected in §3.**

**2. An incomplete gate reported as a limitation.** v1 said no DBPR application or form number could
be obtained. The forms were always there. v1 fetched `/real-estate/forms/`, received **HTTP 200**,
and concluded the Department published none — but that URL is a soft-404 serving the **Elevator
Safety** page. **Corrected in §5.**

**3. An untrustworthy syllabus lock.** v1 reported both "182 learning objectives parsed" and "181
OCR'd learning objectives" — a count that could not agree with itself. The true figure is **180**,
transcribed from a text-layer copy DBPR publishes and v1 never found. **Corrected in §2.**

A fourth, smaller: v1 wrote `plannedItemCount: 126` into a config with no way for a later reader to
see that 126 was a judgement rather than a rule. **Corrected in §8.**

---

## Status by area

### 1. Source acquisition — **GO**

61 manifest authorities read: 51 held and hashed plus 10 current remote-only authorities validated
by the online lock; 202 files under `florida/frec-sources/` after the post-Phase-0 source
acquisitions.

Added in v2: Rule 61-35.027 F.A.C. (which adopts every DBPR RE form by reference), eight DBPR RE
application forms, six DBPR guidance documents including the FREC Distance Education Checklist, and
the Department's text-layer copy of the Course I syllabus.

Every source now carries an **authority class** — CONSTITUTION, STATUTE, RULE, INCORPORATED, FORM,
GUIDANCE, NAVIGATION or VENDOR — with the resolution order stated. VENDOR supports only dated
commercial terms, never regulatory requirements. v1 treated all sources as interchangeable, which is
how a form-level document came to outrank a statute.

`node scripts/florida-source-inventory.mjs` → tracked inventory matches disk; 32/32 controlling
sources present; 51/51 local-copy manifest sources and 2/2 syllabus copies resolve.
`node scripts/florida-source-lock.mjs` → **LOCKED**, all 61 URLs reachable and all 29 configured
body-identity validations passed across remote and held sources.

### 2. Syllabus verification — **GO**

**180 learning objectives across 19 sections**, transcribed from
`FREC1SyllabusCleanFinal01012023.pdf` — the Department's own text-layer copy, 59 pages, published on
its education page. The flrules.org copy the rule cites is a scan with no text layer; both are held.

Per-section counts: **7, 11, 7, 10, 9, 9, 10, 8, 9, 10, 11, 9, 10, 10, 6, 16, 8, 9, 11 = 180.**
Every objective carries its exact wording and its **printed page number**.

`florida/frec-sources/extracted/syllabus-reconciliation.json` records, for all 19 sections, the
verified transcription, the OCR output, the page, and — for the **five** sections where they
disagreed (1, 3, 6, 7, 15) — what the disagreement was and how it resolved. In every case OCR was at
fault, splitting a wrapped objective or merging two. Sections 15 and 16 were additionally verified
by eye against the rendered pages.

**180 is corroborated, not merely counted:** DBPR RE 18 requires learning objectives at "[t]hree per
hour", and the course carries 60 instruction hours. 3 × 60 = 180. The syllabus and the application
form agree.

`SYLLABUS.verify()` fails if the total stops matching the sum of section counts, if an objective
loses its page reference, if any objective is left resting on OCR, or if section order departs from
the incorporated syllabus. It returns clean.

### 3. School-permitholder eligibility — **GO on the law, NOT HELD in fact**

There is **no blocking gate**. v1's was an artifact of the misreading.

| # | Route / requirement | Status |
|---|---|---|
| 1 | Florida broker-licence route | **SELECTED / NOT HELD** — RE 2 endorsement `[1047]`; CA facts appear to meet the duration threshold, subject to RE 293 and DBPR equivalency |
| 2 | FREC-approved instructor-examination route | **AVAILABLE FALLBACK** — open, unselected |
| 3 | Instructor permit | **SELECTED AFTER BROKER** — RE 3 `[1030]`, Finance degree + Florida broker; foreign-degree treatment unresolved |
| 4 | School permit | **NOT HELD** — obtainable once 2 or 1 is satisfied |
| 5 | Permitholder who personally teaches | **CONDITIONAL** — selected plan also obtains instructor permit before teaching |
| 6 | What StateCourse holds | **NOTHING** — no licence, exam, permit, approval or application |
| 7 | What remains pending | RE 293/scope packet → RE 2 `[1047]` → fingerprints/equivalency → law exam → broker → RE 3 `[1030]` → RE 5 → RE 6 → RE 18 |

Corroborated by three DBPR instruments: **RE 5** ("Holding a license as a Florida Broker ... **or**
Holder of a Florida Instructor's License"), **RE 6** ("... or; **Passing the Instructors Exam**"),
and **RE 3** ("**Real Estate Instructor Exam [1010]**").

**Nobody is asserted to be eligible.** Eligibility is a determination the Department makes on an
application. `APPLICANT.eligibilityAsserted` is `false` and a test enforces it.

**The school may also designate someone else.** Section 475.451(2)(a) defines the permitholder
functionally, not by ownership; RE 6 exists to transfer the permit between people.

### 4. Broker/instructor path — **legally available, credentials NOT HELD**

The selected RE 2 endorsement checklist requires an out-of-state broker license held at least five
years, active now or within the last two years; current certified history; scope statutes/rules;
fingerprints; DBPR approval; and a Pearson examination. Repository/user facts indicate active CA
broker licensure since 2009, but RE 293 and DBPR/FREC's equivalency decision control.

No 72-hour course appears on the live endorsement checklist or the form's page-one endorsement-
specific checklist, but RE 2's later generic instructions say every broker applicant must complete
the course and pass the broker exam. The linked Law CIB describes a physical Pearson center,
closed-book 40-question Laws and Rules exam, 90 minutes, pass 30/40, for nonresident licensure under
section 475.180; it does not expressly label that exam `[1047]`. The expected assignment and
course omission therefore remain subject to DBPR's authorization or written confirmation. The
current Pearson fee is unverified. Larson's $99 endorsement prep is optional and non-credit;
purchase is deferred until the assigned exam is known.

After broker issuance, selected instructor route `[1030]` requires a valid Florida broker license
and a certified official business-related degree transcript. Finance is listed, but DBPR must decide
foreign-degree equivalency and acceptable broker status. If accepted, no instructor examination is
required. `[1010]` remains fallback research only.

### 5. School application readiness — **NOT READY, fully mapped**

All listed forms were read and identity-validated. The school/course forms are held and hashed; the
selected-route RE 2 is currently online-validated and not yet a held local copy. Adopted by Rule
61-35.027, F.A.C.

| Form | Title | Effective | Fee |
|---|---|---|---|
| DBPR RE 2 | Broker License | Jun 2015 | $70.00 |
| DBPR RE 3 | Application for Real Estate Instructor Permit | Nov 2015 | $62.75 |
| DBPR RE 5 | Application for School Permit | May 2019 | $109.00 |
| DBPR RE 6 | School Change of Status Transactions | — | — |
| DBPR RE 9 | Application for Additional School Location | Jun 2015 | $50.00 |
| DBPR RE 18 | Education Course Approval Application | Jun 2026 | $0 for schools |
| DBPR RE 19 | FREC CE Provider Approval Application | — | provider-only; not a school attachment |
| DBPR RE 20 | FREC Request for Instructor Evaluation | — | provider-only; not a school attachment |

29 deliverables, 0 held, 27 of 29 now verified against the actual applications.

### 6. Course-submission readiness — **NOT READY, requirements known**

**The current DBPR Education-page-linked RE 18 governs Course I.** Section III carries "Sales
Associate Pre-Licensure" and "Distance". Section V initial-approval attachments for a permitted
school are: timed outline; learning objectives three per hour; course materials with
delivery-method explanation; **two** end-of-course examinations for distance pre/post-licensing;
and page-referenced answer keys. RE 19 and RE 20 are expressly provider-only. The legacy RE 18 that
asked for five examinations across distance education is held solely for audit and is blacklisted
for filing. Plus, from the rule, the school must provide **access to the course in the format
students receive**.

**Ordering constraint:** answer keys must cite page numbers, so the examination cannot be authored
before the curriculum is written and paginated.

### 7. Time architecture — **GO**

63 fifty-minute hours inclusive of examination = **3,150 minutes**. The syllabus splits it 60 + 3;
under the 50-minute reading that is 3,000 + 150 = 3,150 exactly. Read as clock hours it becomes
3,180, breaching the s. 475.17(2)(a)1 ceiling — so the 50-minute reading is the only one under which
syllabus and statute can both be true. Confirmed by the Distance Education Checklist's own "(50
minute hours)".

**No per-section allocation is written down.** The syllabus prescribes none, and Rule
61J2-3.008(4)(b)3.e makes any allocation something StateCourse must prove by objective study.

### 8. Assessment architecture — **GO, in three labelled tiers**

`config/florida/assessment-architecture.mjs` separates:

- **`REGULATORY_MINIMUM_CONFIRMED`** — the values settled by controlling text, each with citation
  and quote. Pass mark **70%**; **2 forms**; 15% cross-form cap; ≥70% application / ≤10% knowledge; 4 choices;
  1.8 min/item ceiling; page-referenced unique answer keys; order must not follow course order; no
  hint/back/retry; all sessions before the examination; 30-day wait, one retake per year, different
  form each time.
- **`ITEM_COUNT_QUESTION`** — the unresolved **100 / 120 / 126** readings, with 126 as the filing
  position pending written DBPR confirmation.
- **`STATECOURSE_CONSERVATIVE_POLICY`** — **126 items per form** and the current-form-required
  **2 forms**. The count remains configurable; the form count does not.
- **`OPEN_DBPR_QUESTIONS`** — nine operational questions with safe pending behaviour. The exported
  combined letter is a historical transmission record, not a current resend instruction.

**Why 100 remains a plausible but unconfirmed reading.** The broker sentence supports treating
"or" as an alternative basis: the Broker course is 72 hours, so "2 items per instruction hour" is
≥144 against a stated floor of 95. But the legal text still supports competing operational readings
for Course I. The package therefore does not call 100 settled and plans 126 per form until DBPR
answers in writing.

**Why the 1.8-minute rule does not disambiguate.** It is a ceiling on time, not an equality. 150
minutes sits under it for 100 (180), 120 (216) and 126 (226.8) alike.

**126 stays as filing policy** — 1.19 min/item against 1.50 at the 100-item candidate, a real cost
to students, recorded so that a written DBPR answer can be implemented as a controlled config
change.

**Proctoring: NOT REQUIRED and NOT PROHIBITED.** s. 475.17(2)(a)2 removes an obligation; it does not
impose a ban. Do not cite s. 455.2123 — that is continuing education.

**Form count is now closed:** the current Education-page-linked RE 18 says two forms for distance
pre/post-licensing and five only for distance continuing education. The old five-form RE 18 must
not be used.

### 9. Distance-delivery architecture — **GO**

`config/florida/distance-delivery-matrix.mjs` — **18 dimensions**, each with what Florida expressly
requires (with citation), what is StateCourse policy, **what the engine must actually do**, and what
is unresolved. 15 expressly required, 3 policy-only, 6 carrying open items.

**Seat time alone does not satisfy Florida.** Rule 61J2-3.008(4)(b)3.1 requires students to "read,
conduct research, complete timed exams and similar assignments", and 3.h requires periodic
assessment. A timer over a document is not a Florida course. That single row constrains the engine
more than any other.

**Identity is verified at three moments** — enrolment, participation, completion — not one.

Accessibility, captions and mobile are marked **StateCourse policy**, not Florida law: nothing in
Ch. 475 or Ch. 61J2 imposes an accessibility or media standard, and the two video rules were
repealed in 2008. No Texas engine behaviour was imported.

### 10. Video planning — **GO, nothing produced**

Seven candidates, 54 minutes estimated, all `PENDING / NOT ACTIVE`. Each carries syllabus section
and objectives, exact placement, why video beats text, duration, required source, whether the source
is held, presenter/document balance, captions/transcript/poster requirements, the post-video
retrieval activity, and production status. **Eight rejected candidates** with reasons and better
instruments.

The two source blockers are closed. FL-V06 holds the exact older CFPB specimen linked by the
February 2025 FREC instructor CIB, plus the current CFPB forms hub, Regulation Z Appendix H,
H-25(A) blank model form and H-25(B) completed sample. FL-V07 holds Articles VII and X, Chapters
193, 196, 222 and 732, and two DOR 2026 sources confirming the $25,000 first slice and the indexed
$26,411 additional non-school slice. All are hashed, inventoried and content-marker validated.
Video remains pending and outside instructional time.

**Video sits outside the instructional-hour budget**, which is what keeps it optional and
non-blocking without making the stated hours untrue.

### 11. Repository integration — **NO-GO (pre-existing, not Florida)**

| | tests | pass | fail |
|---|---:|---:|---:|
| `origin/main` @ `c8c0f60`, built | 1015 | 996 | **19** |
| this branch, built | 1046 | 1027 | **19** |

**Zero regressions.** Failing sets identical. Florida contributes 53 tests, all passing.

**The platform is not green.** `npm run build` **exits 1 on `main`**: `scripts/build-verified.sh`
line 23 runs `scripts/sync-california-pdf-downloads.mjs`, which has never existed in this
repository. The build aborts after `generate-national-platform.mjs` and before `vinext build`, so no
`dist` is produced. All 19 failures trace to that one cause — 9 California DRE form-fill, 6
California print-volume, 4 build-artifact/deploy. Not fixed here: repairing a shared build script
while Texas is actively pushing is what isolation excludes. Recorded as proposal §6.

Reproduce: `bash scripts/florida-regression-baseline.sh`. Evidence:
`docs/florida/regression-baseline.md`.

**`origin/main` advanced 13 commits during this session**, all Texas Law of Agency work. This branch
is deliberately **not** rebased — isolation forbids merging Texas work. The comparison above is
against the *current* main, Texas commits included, and still finds no regression.

### 12. Curriculum-authoring authorization — **AUTHORIZED AFTER PHASE 0**

Four of the five preconditions are met. One is not.

| Precondition | Status |
|---|---|
| Zero unresolved syllabus transcription errors | **MET** — 180 verified, page-referenced, 5 OCR discrepancies resolved |
| A defensible examination design | **MET** — two forms; 126 items per form pending a written answer on 100/120/126 |
| Complete current form and permit mapping | **MET** — 7 forms + 6 guidance documents held and read |
| Source-locked delivery requirements | **MET** — 18-dimension matrix, lock LOCKED |
| No unexplained test regression | **MET** — 0 introduced; the 19 are explained and pre-existing |

The owner authorized curriculum authoring on 31 August 2026. All 19 sections, 180 objective-level
periodic assessments, the 3,000-minute design, Florida engine controls, submission artifacts and a
19-item secure final-development slice now exist. Regulator submission and launch remain NO-GO for
the objective study, independent review, complete secure forms, permits and approval.

---

## Every NO-GO, with its next action

| # | Missing fact or artifact | Inside the repo? | Needs | Next concrete action |
|---|---|---|---|---|
| 1 | Issued current RE 293 | **No** | California DRE | Inspect immediately on receipt; apply conservative 30-day filing control |
| 2 | California scope packet | **Partly** | Build + filing owner | Attach fresh official 2026 DRE statutory/regulatory pages indexed by appendix 06 |
| 3 | Endorsement application/equivalency | **No** | Owner + DBPR/FREC | File RE 2 `[1047]` with $70, then fingerprints; cure deficiencies |
| 4 | Adverse-equivalency review, if needed | **Conditional** | Owner/counsel | Request secretary review within 7 business days under s. 455.213(15) |
| 5 | Assigned exam / broker license | **No** | DBPR authorization + owner | Inspect exact exam/course conditions; if expected Laws and Rules, pass 40 questions / 90 minutes / 30 correct; verify issued status and live fee |
| 6 | Foreign Finance degree protocol | **No** | Written DBPR direction | Confirm evaluator/type/translation/direct-send and RE 3 inactive-status treatment |
| 7 | Instructor permit | **No** | Owner + regulator | File RE 3 `[1030]` with $62.75 after broker/degree gates; confirm fingerprints |
| 8 | School permit | **No** | Owner + regulator | File RE 5 on Florida-broker basis with $109 after entity/location gate |
| 9 | Item count — 100, 120 or 126 | **No** | Written DBPR response | Await sent inquiry; build 126 per form meanwhile |
| 10 | Examination form count | **Closed** | Current linked RE 18 | Build two distance pre/post-license forms |
| 11 | Whether a school must file RE 19 | **Closed** | Current linked RE 18 | Exclude; provider-only |
| 12 | Async treatment of 8-hour language | **No** | Written DBPR response | Require all syllabus sessions pending answer |
| 13 | CFPB/homestead source packages | **Closed** | — | Held and validated |
| 14 | Shared build/integration issues | **Outside Florida** | Owner/coordination | Preserve isolation; use recorded proposals |
| 15 | Objective time study | **Yes** | Representative participants | Run checked-in protocol against frozen course without video |

The exact current blocker set is maintained in `florida/HANDOFF.md`; this historical count is no
longer used after three Phase 0 gaps were closed.

---

## Isolation

No file under `texas/`, `config/texas/`, `tests/texas-*` or `scripts/*texas*` was created, modified,
moved or renamed. No Texas work merged; the branch is not rebased onto the 13 new Texas commits on
`main`. No shared production registry edited — seven proposals recorded in
`docs/florida/shared-file-change-proposals.md`, none applied. No DBPR/FREC approval claimed. Florida
enrolment disabled. No application or course package was published or filed; only the four recorded
prefiling inquiries were sent externally.

One tracked California file, `california/submission/02_Real_Estate_Practice/07-sb1495-traceability.md`,
is rewritten by the test suite as a side effect of the broken build. It is reverted after every run
and is not in any commit; `scripts/florida-regression-baseline.sh` reverts it and warns if any
non-Florida file is left modified.

---

## Verification

Current Florida-specific verification is below. The built-main 19=19 comparison in §11 is the
historical Phase 0 evidence; it could not be rerun in the current worktree because the dependency
bootstrap requires Linux `flock` and this host did not have enough free disk for a local install.
The direct repository-wide test run completed 1,021/1,055; its 34 failures were outside Florida.

```
node scripts/florida-source-lock.mjs            → LOCKED, 61/61 URLs and 29/29 body-identity validations
node scripts/florida-source-inventory.mjs       → 202 files, 32/32 controlling present
node --test tests/florida-foundation.test.mjs tests/florida-course-build.test.mjs tests/florida-exam-blueprint.test.mjs → 79/79 pass
node --test tests/*.test.mjs                    → 1,021/1,055 pass; 34 non-Florida failures
```
