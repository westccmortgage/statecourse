# Florida Phase 0 — report

**Product:** Florida Sales Associate Pre-License Course — FREC Course I
**Scope:** regulatory research, source acquisition, syllabus lock, provider/school/instructor
architecture, distance-delivery requirements, assessment requirements, time architecture,
submission planning, video planning.
**Not in scope and not started:** curriculum authoring, lesson writing, quiz banks, exam banks,
video rendering, FREC Course II, post-license, continuing education, production enrolment.

**Status: complete.** No Florida curriculum exists. No Florida credential is held. Enrolment is
disabled.

---

## What Florida turned out to be

The headline finding is that **every Florida authority was readable**, which is the opposite of
Texas and changes what Phase 0 had to do.

Texas's two highest authorities cannot be opened from this environment at all — the Secretary of
State moved the Administrative Code into a JavaScript portal and the statutes site serves an
application shell for every document path — so the Texas manifest exists largely to record what
could not be read. Florida's Legislature serves Chapter 475 as static HTML, and the Department of
State serves every 61J2 rule and every document those rules incorporate by reference. Thirteen
sources, thirteen read, none unreachable.

So the interesting findings here are not silences. They are **disagreements between and within the
authorities**, and there are three that a reader who only skimmed the rules would never see. All
three are recorded and none is resolved.

### 1. The examination item count is genuinely ambiguous

Rule 61J2-3.008(4)(d) requires "at least 100 items, or 2 items per instruction hour." For this
course that is 100, or 120, or 126, depending which half of the sentence governs and which hours are
counted.

The 1.8-minute-per-item limit in the same paragraph looks as though it should settle this. It does
not, and it is worth being precise about why, because the wrong reading is attractive: it is a
**ceiling on time allowed**, not an equality. The examination's own three 50-minute hours give 150
minutes, and 150 is under the ceiling for all three counts (100 items permits 180, 120 permits 216,
126 permits 226.8). Every reading passes, so the ceiling disambiguates nothing.

Planned pending an answer from FREC: build to **126 items**, the highest floor any reading produces,
since an examination satisfying the largest floor satisfies all of them and "at least" permits
exceeding any. That is 1.19 minutes per item, inside the ceiling.

### 2. A rule that requires a Florida broker's licence, via a citation that does not resolve

Rule 61J2-17.011(2) requires the school permit holder to meet "the qualifications for practice set
forth in Section 475.25(2)(a), F.S." Section 475.25(2) is the provision allowing a licence to be
revoked for the Commission's own mistake, and has no paragraph (a) stating any qualification. The
provision the rule is reaching for is plainly s. 475.451(2)(a).

The rule's operative sentence is unambiguous, though: the permit holder "must be a holder of a
Florida Broker's license." That **narrows** the statute, which offered a Commission-approved
instructor's examination as an alternative.

**This is the blocking gate for the whole Florida programme.** StateCourse's principal holds
California broker licence 01385024 and no Florida licence. Today there is no individual who can be
named as school permit holder on a Florida application, and no amount of build work changes that.

### 3. A hardship route with no definition behind it

Rule 61J2-3.008(4)(b)3.3 permits a pre-licence correspondence course "by reason of a hardship as
defined by rule," and s. 475.17(2)(a)3 requires the route to exist. Rule 61J2-3.013 — the hardship
rule — defines hardship for **post-licensing** and **reactivation** education, and not on its face
for pre-licensing. No hardship route is built or advertised.

---

## The architecture Florida actually fixes

### Time — and the arithmetic that only works one way

s. 475.17(2)(a)1 and Rule 61J2-3.008(1) both give **63 hours of 50 minutes each, inclusive of
examination** — 3,150 minutes for everything. The Commission's syllabus, page 2, splits it: "the
overall course is 60-hours of instruction with 3-hour end-of-course examination."

Those reconcile **exactly** — 3,000 + 150 = 3,150 — but only if the syllabus's hour is the rule's
50-minute hour. Read the examination as three *clock* hours and the course becomes 3,180 minutes,
which is 63.6 fifty-minute hours and breaches the statutory ceiling that says the course "shall not
exceed" 63. The 50-minute reading is not a preference; it is the only reading under which the
Commission's syllabus and the Legislature's cap can both be true. The reconciliation is computed in
`config/florida/course-i-requirements.mjs` and asserted in the foundation test, not trusted.

**The syllabus allocates no hours to any of its nineteen sections.** Its instruction is "Allocate
your time based upon the complexity of the material." So the per-section budget is StateCourse's
design decision and, under Rule 61J2-3.008(4)(b)3.e, StateCourse's burden to prove by objective
study. **No allocation has been written down**, deliberately: an allocation invented before the
curriculum exists is exactly the assertion that rule forbids, and writing one now would mean the
time study was reverse-engineered to match it later.

### Delivery — Florida does not require proctoring

s. 475.17(2)(a)2: satisfactory completion of a distance learning course requires a **timed**
examination, and "such examination shall not be required to be monitored or given at a centralized
location."

Timed, but neither monitored nor sited. That is a decisive fact for an online school and it differs
from several other states in this repository. The authority matters as much as the answer:
s. 455.2123 says a similar thing about *continuing* education and must never be cited for this. The
foundation test asserts the citation as well as the value.

Twenty-one distance-delivery obligations are enumerated from Rule 61J2-3.008(4)(b)3, each with its
citation. Three are easy to under-build and are named individually so a change has to be deliberate:
identity verification at **enrolment, during participation, and at completion** — all three, not just
sign-up; the objective time study; and the gate that stops a student reaching the examination before
completing every session of the syllabus.

### Assessment

70% to pass. At least two forms, ≤15% shared items, a unique answer key per form **citing the page
numbers each item and its correct answer rest on**. ≥70% application level, ≤10% knowledge level.
Four answer choices. Examination order **may not** follow course order — the opposite of the rule for
the course itself. No hint, back or retry. On failure: a 30-day wait, one retake within a year, then
repeat the course, with a different form each time.

The page-citation requirement carries an ordering constraint that is easy to miss and expensive to
discover late: **an item cannot cite a page that does not exist, so the examination cannot be built
before the curriculum is written and paginated.** Any plan running the two in parallel produces an
answer key that cannot be completed.

### The syllabus is part of the rule

Rule 61J2-3.008(4)(b) does not describe the Course I syllabus — it **incorporates it by reference**
(Ref-14599, the January 1, 2023 revision). And it requires a course to "conform to and follow the
**order** of" it, with learning objectives for each session.

Order is therefore a compliance property, not an editorial preference: a Florida course that teaches
the right topics in a better sequence is a non-conforming course. Nineteen sections are locked in
the Commission's order now, before any curriculum exists, so the curriculum gets written to it rather
than rearranged into it afterwards.

**What is locked and what is only recorded** is kept apart on purpose. The Commission publishes
Ref-14599 as a 59-page **scan with no text layer**. Section titles were read by eye from its table of
contents and are locked. The 181 learning objectives were recovered by OCR, carry OCR's
characteristic damage, and are recorded as **unverified** — good enough to plan against, not good
enough to certify. `objectivesVerifiedAgainstSource` stays false until a person reads them against
the PDF, and the foundation test holds the count so a silent edit cannot pass as a verification.

Section 19 is titled "Planning, And Zoning" in the table of contents and "PLANNING, ZONING AND
ENVIRONMENTAL HAZARDS" on the section itself. Both are recorded. It is not this build's place to
decide which the Commission meant.

### Video

Both Florida video rules are **repealed** — 61J2-3.016 and 61J2-3.017, in 2008. There is no
surviving media-quality standard, which the chapter index still lists by title in a way that invites
a citation from someone who read the title and not the status.

The plan resolves the tension between optional-and-non-blocking and hour-per-hour by keeping them
apart: **video sits outside the instructional-hour budget.** The 3,000 minutes are carried entirely
by material every student receives; video is enrichment on top. That keeps it optional, keeps the
time study defensible, and means adding or removing a video later never disturbs the hour
architecture.

---

## What could not be obtained, and what was not invented in its place

**The application forms.** The DBPR real estate schools page is a WordPress navigation shell whose
content is assembled client-side; it carries no application, no form number, no fee schedule. The
Department's public licensee search timed out on every attempt.

So **no DBPR form number appears anywhere in this build**, the permit ledger reports itself
unverified against the application, and no verification path through DBPR's screens has been
written. A plausible-looking form number is worse than none: it is exactly the kind of confident
detail that survives review because it looks as though somebody checked it. The failed page is held
on disk anyway, so the next reader can see it was looked for.

---

## What was built

| Path | What it is |
|---|---|
| `florida/frec-sources/` | 133 files, 12.4 MB — Chapter 475 and 455, ten 61J2 rules, the incorporated syllabus PDF, plus readable extractions |
| `florida/frec-sources/source-inventory.json` | every held file, hashed, generated by a recursive walk |
| `florida/regulatory/primary-text-readings.md` | what each authority says, and the three disagreements |
| `florida/submission/frec-course-i-submission-plan.md` | the six stages, in order, with the person gates first |
| `florida/fl-sales-associate-course-i-63-v1/video-instruction-plan.md` | video planning |
| `config/florida/regulatory-manifest.mjs` | 13 sources, 53 material claims, 8 recorded conflicts |
| `config/florida/frec-course-i-syllabus.mjs` | 19 sections in the Commission's order, 181 OCR'd objectives flagged unverified |
| `config/florida/course-i-requirements.mjs` | time, assessment, 21 delivery obligations, completion, lifecycle, 5 open questions |
| `config/florida/school-permit-ledger.mjs` | 25 deliverables, 2 blocking gates, 3 instructor routes |
| `scripts/florida-fetch-fac-rules.py` | acquires F.A.C. rule text the way a person would |
| `scripts/florida-source-inventory.mjs` | the walk that defines "held" |
| `scripts/florida-source-lock.mjs` | lock and drift, kept apart |
| `tests/florida-foundation.test.mjs` | 35 tests — fixed, honesty, and conditional |
| `docs/florida/shared-file-change-proposals.md` | six shared-file changes, written down and **not applied** |

### Verification

- `node scripts/florida-source-lock.mjs` → **LOCKED**, all 13 authority URLs reachable.
- `node scripts/florida-source-inventory.mjs` → tracked inventory matches disk; all 8 controlling
  sources present.
- `node --test tests/florida-foundation.test.mjs` → **35/35 pass**.
- Full suite compared against a clean `origin/main` worktree: **33 pre-existing failures on both**,
  zero introduced. (Those 33 are California/Texas/build-artifact tests that need `npm run build`
  first; `npm test` runs the build, `node --test` alone does not.)

### Texas

No file under `texas/`, `config/texas/`, `tests/texas-*` or `scripts/*texas*` was created, modified,
moved, or reformatted. Every shared file Florida will eventually need is written up in
`docs/florida/shared-file-change-proposals.md` and left alone.

---

## The honesty tests

Worth calling out separately, because they guard the failure mode a well-written config invites.

Alongside the tests that assert what is true, `tests/florida-foundation.test.mjs` asserts that **what
this build does not know is still recorded as not known**: that the OCR'd objectives are still
flagged unverified and still number 181; that the examination item floor is still recorded as
unsettled; that the eight conflicts are still open; that no DBPR form number has been guessed into
the ledger; that readiness still cannot report READY and still names the person-shaped gate.

Those fail if somebody quietly upgrades a working assumption to a fact. That is the likeliest way
this Phase 0 gets undone, so it is the thing most worth a test.

---

## Next

Curriculum authoring is **not** authorised and has not begun. Before it can:

1. Resolve the two person gates — a Florida-licensed school permit holder, and a permitted
   instructor. Nothing downstream starts without them.
2. Put the five open questions to FREC in writing, and obtain the application forms.
3. Have a person read the 181 learning objectives against the syllabus PDF and flip
   `objectivesVerifiedAgainstSource` — with the count re-checked.

Then, in this order and not in parallel: curriculum in syllabus order → per-section hour allocations
computed from that material → objective time study → examination built against paginated pages →
video candidates re-tested against the finished sections.
