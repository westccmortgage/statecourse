# National build audit — thirteen states

**Date:** 2026-08-21
**Scope:** every state carrying a StateCourse qualifying-education build.
**Status of every course in this report: NOT APPROVED. No state credit is available anywhere.**

This is the audit the build phase was to be followed by. It reports what was
checked, what was found, what was fixed, and what each state still needs before
a filing. It is also the cover sheet for the per-state review: a reviewer
reading one state should read section 6 for that state first, because it says
what the build does not know.

---

## 1. What exists

| State | Courses | Hours | Modules | Instructional words | Items | Engine | Tests |
|---|---|---|---|---|---|---|---|
| Alaska | 1 | 40 | 8 | 42,468 | 88 | yes | yes |
| Arizona | 2 | 90 + 6 | 15 | 30,475 | 165 | yes | yes |
| California | 3 | 135 | 45 | 386,565 | 495 | yes | yes |
| Colorado | 6 | 168 | 29 | 89,573 | 319 | yes | yes |
| Maine | 1 | 55 | 9 | 46,724 | 99 | yes | yes |
| Michigan | 1 | 40 | 10 | 45,575 | 110 | yes | yes |
| Missouri | 2 | 48 + 24 | 15 | 48,455 | 165 | yes | yes |
| North Carolina | 1 | 75 | 16 | 53,737 | 176 | yes | yes |
| Oklahoma | 1 | 90 | 16 | 48,156 | 176 | yes | yes |
| Pennsylvania | 2 | 30 + 45 | 15 | 33,487 | 165 | yes | yes |
| Virginia | 1 | 60 | 15 | 69,203 | 165 | yes | yes |
| Washington | 2 | 60 + 30 | 18 | 36,440 | 198 | yes | yes |
| Wisconsin | 1 | 72 | 13 | 53,622 | 143 | yes | yes |
| **Total** | **24** | — | **224** | **984,480** | **2,464** | 13 | 13 |

636 tests run. 635 pass. The single failure is `tests/rendered-html.test.mjs`,
which imports `dist/server/index.js` — a Cloudflare worker artifact
`site/build.sh` does not produce. It predates this work and is unrelated to
course content.

---

## 2. What was checked mechanically, and what it found

**Hours.** Every course's module hours were summed from the module files and
compared against the engine constant and the public registry figure. All 24
agree. Three deliberate differences were confirmed rather than flagged:

- **Arizona is 96, not 90.** A.R.S. § 32-2124(B) requires ninety hours and
  § 32-2124(L) requires six more *after* completing them. They are two separate
  course records, two separate certificates, and the registry's
  `prelicense_hours` of 90 is the (B) figure only.
- **North Carolina's examination is inside the 75.** 72 instructional hours
  plus a 3-hour end-of-course examination. Every other state in the project
  puts the examination outside the required hours; the engine throws if that
  arithmetic drifts in either direction.
- **Maine's 55 is 3,000 instructional minutes plus 300 assessment minutes.**
  The Commission fixes both, and the assessment share is checked against the
  Commission's own ceiling at import.

Each state also keeps the regulator's own unit of account rather than a project
standard: Alaska counts *contact hours* of at least 50 minutes, Missouri counts
*clock hours* of 60 minutes containing at least 50 of instruction, Michigan
counts *clock hours* as 240 instructional minutes per 4-hour module, California
counts *instructional minutes*. None of these is converted into another state's
unit anywhere in the build.

**Question banks.** All 24 banks and 2,464 items were walked. No duplicate
prompt inside any bank, no item with fewer than three choices, no repeated or
empty choice, no missing rationale, and no answer authored anywhere but index 0.
Fifteen prompts sat below the 25-character floor Arizona's bank already met and
have been rewritten (section 3).

**Approval language.** Every module file across all 224 carries an explicit
regulatory-status line stating the course is not approved and that no credit is
available. A sweep for affirmative approval claims returned 14 hits, all of
which are instructional content *about* approval — lender approval, course
approval rules, plat approval — and none of which claims this course is
approved.

**Cross-state contamination.** Every string in every registry entry and catalog
course record was matched against the distinctive citation forms and agency
names of all thirteen jurisdictions. One state was carrying another's
regulator, described in section 3.

---

## 3. Findings, and what was done about them

### 3.1 Arizona's public record carried manufactured regulatory content — FIXED

Three claims in the Arizona registry and catalog entries had no source. They
were live on four generated pages: the national requirements table, the course
catalog, the Arizona jurisdiction hub, and the Arizona salesperson course page.

| Claim as published | Status |
|---|---|
| "SPS 2025.01 controls" | **Wrong state.** SPS is Wisconsin's Department of Safety and Professional Services. Nothing in Arizona law is numbered that way. |
| "2:1 bank ratio" | **Invented.** ADRE states no item-bank ratio. |
| "exam not delivered on a student-supplied device" | **Invented**, and it displaced the rule that is real. |
| "75% passing" | **Correct** — A.A.C. R4-28-401(A)(1). Now cited. |
| "final outside instructional hours" | **Correct in substance** — R4-28-404 excludes examination time from credit hours where the examination is used for overall evaluation. Now cited. |

The device rule is the worst of the three, because A.R.S. § 32-2124(B) states a
proctoring requirement that the invented one crowded out: *"The applicant must
complete a proctored examination on the live classroom course or the distance
learning course IN PERSON."* The record now says that.

`asynchronous_online_allowed` moved from `true` to `null`. Nothing read
establishes asynchronous delivery for Arizona: § 32-2124(B) names in-person or
synchronous remote segments, and R4-28-404 caps third-party recorded material
at 20 percent of instructional time. The requirements table now reads "Pending
verification" for Arizona rather than "Yes".

**A guard now exists.** `tests/state-record-citations.test.mjs` asserts that no
state's registry or catalog record cites another jurisdiction's statute, rule
or agency, and refuses the two manufactured claims by shape rather than by
wording. The scope stops at the regulatory record on purpose: curriculum
modules compare jurisdictions deliberately — the Arizona duties module records
that Arizona is a fiduciary state where Washington's statute calls its duties
*"statutory duties and not fiduciary duties"* and Oklahoma abrogated them — and
that contrast is the lesson.

### 3.2 Fifteen bank prompts tested recall rather than reasoning — FIXED

Arizona's test enforced a 25-character floor on prompts; no other state's did,
so the rule never reached them. Fifteen bare definition prompts — *"What is
commingling?"*, *"What is a variance?"*, *"Which lien is voluntary?"* — were
rewritten to ask what the student must work out, keeping the same answer.
`tests/question-bank-integrity.test.mjs` now applies one structural standard to
all 24 banks so a rule adopted in one state reaches the rest.

### 3.3 Four states' catalog courses were not claimed by their own registry entry — FIXED

Alaska, Maine, Michigan and Virginia each had a catalog course whose state
registry entry carried no `course_ids` key at all. The linkage is now asserted
in both directions.

### 3.4 Colorado's REC-33 references were untraced — VERIFIED

REC-33 appeared in Colorado's registry entry without a primary source behind
it. It is confirmed from the Division's own Broker Application Instruction
Guide, which states that an applicant must *"complete 168 course work and
obtain proof of completion, (REC-33 certificate(s)) from your course
provider"*, and that *"Exam results are good for one year from the date of each
portion's passing score."* The page names PSI as the current exam vendor and
states no passing score, item count, time limit or fee — and none is imported.

### 3.5 Colorado's asynchronous delivery claim was not supported — CORRECTED

Colorado's record asserted "DPOS-approved asynchronous/distance delivery". What
the Commission's Practical Applications outline actually says is that *"Courses
taught online must meet the requirements set forth in the Online Course
Approval Checklist created by the Division of Real Estate."* That checklist was
searched for again and is still not obtained; the form the Division does
publish — the *Real Estate Broker Live Online Virtual Classroom Checklist*,
Rev. 2025-05 — is continuing-education-scoped by its own terms and is not the
same document. Colorado's delivery entry now names the unobtained checklist and
`asynchronous_online_allowed` moved to `null`.

### 3.6 Two states do not state what they did not read — OPEN

Eight of the thirteen readings files carry an explicit section headed *what was
NOT read, and is therefore stated nowhere in this build*. Alaska and Michigan
carry the functional equivalent under *open questions that must be answered
before filing*. California's equivalent is in `docs/california/phase-1-audit.md`
rather than a `california/regulatory/` file.

**Maine and Virginia have neither.** Both builds are sound on the sources they
do cite, but neither states its own boundary, so a reviewer cannot tell what
the build is silent about on purpose. This is not fixed here, because writing
that section means re-deriving what each build actually read, which is the
reviewer's question and should be answered from the record rather than
reconstructed.

---

## 4. The largest open item, which no amount of internal work closes

**In most states the regulator prescribes course content this project does not
have.** The relevant statutes and rules were read; the outlines they point to
were not obtainable.

| State | The prescribed content, and whether it was obtained |
|---|---|
| Arizona | **Not obtained.** R4-28-401(D) says the Department will provide its prescribed prelicensure content on request, and § 32-2124(B) requires a course to follow it. There is also no Department outline for the 27-hour Arizona-specific course. |
| Pennsylvania | **Not obtained.** The Commission's content outlines for *Real Estate Fundamentals* and *Real Estate Practice*. |
| Washington | **Not obtained.** WAC 308-124A-800 (prescribed core curriculum) and 308-124A-802 (prescribed Washington content). |
| Missouri | **Not obtained.** The testing service's detailed content outline, which 20 CSR 2250-6.060(1) requires the 48-hour course to be developed from. |
| Colorado | **Obtained.** The Commission publishes its own qualifying-education outlines, and the six courses are built on them. The Online Course Approval Checklist and the Current Legal Issues provider material remain unobtained. |
| North Carolina | **Obtained.** The Commission's Prelicensing Syllabus, extracted in full. |
| Oklahoma | **Read but deliberately not reproduced**, per 605:10-3-1(a)(2). |

Every state's readings file lists the rest of what it did not read — disclosure
forms, trust-account statutes, disciplinary provisions, landlord-tenant acts,
fair housing statutes, transfer tax rates — and in each case the build states
no rule from those sources at all rather than guessing at one. That silence is
deliberate and should be read as a finding, not an omission.

---

## 5. Standing rules this build is held to

These are not aspirational; they are enforced by tests or by import-time
invariants that throw.

1. No course, page or record claims approval, and no enrollment opens, until an
   approval record exists. Payment status never determines completion,
   examination eligibility, credit or a certificate.
2. No rule, fee, form version, passing score, proctor requirement or retention
   period appears anywhere unless a source states it. Where a source is silent,
   the record says the source is silent.
3. Answer keys never leave the server. Each state engine's
   `public<State>Assessment()` strips `correctChoice` and `rationale` before an
   item is delivered, and `tests/no-answer-key-published.test.mjs` asserts no
   key reaches the published site.
4. Marketing material and portal browsing never count as instructional time.
5. Reviewer activity never contaminates student records.
6. Completion and audit records are never silently edited.
7. Where a StateCourse standard is applied in the absence of a regulator figure
   — Alaska's 8-hour daily cap is the clearest example — the record labels it a
   provider standard and forbids describing it as a state requirement.

---

## 6. What each state needs from its reviewer

The build can check arithmetic, structure and internal consistency. It cannot
check whether the law is stated correctly. That is what the review is for.

For each state, the reviewer is asked three questions:

1. **Is anything stated here wrong as a matter of that state's law?** The
   readings file for each state quotes the primary text it relied on, so a
   disagreement can be traced to a specific quotation.
2. **Is anything stated here that the cited source does not actually say?**
   This is the failure mode section 3.1 is an instance of, and the one a
   reviewer catches that a test cannot.
3. **Is anything missing that the state requires and this build is silent
   about?** Section 4 and each state's own "what was NOT read" section are the
   starting point.

Reviewers should be given, per state: the readings file under
`<state>/regulatory/`, the curriculum modules under
`<state>/<course>/curriculum/`, and the course engine under `config/`, which
states the arithmetic and the completion gates in one place.

---

## 7. Record

Commits carrying this audit's fixes:

- Arizona registry and catalog corrections, Colorado REC-33 verification and
  Colorado delivery correction, with the audit addendum appended to
  `colorado/regulatory/primary-text-readings.md`.
- `tests/state-record-citations.test.mjs` — the cross-state citation guard and
  the registry/catalog linkage checks.
- `tests/question-bank-integrity.test.mjs` — one structural standard across all
  24 banks, and the fifteen rewritten prompts.
