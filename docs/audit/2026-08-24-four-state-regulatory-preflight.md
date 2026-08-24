# Four-state regulatory preflight — Maine, Virginia, Arizona, Wisconsin

**Date:** 2026-08-24
**Scope:** READ AND COMPARE ONLY. No curriculum file, question bank, engine, registry entry or
generated artifact was changed by this pass.
**Status of every course named here: NOT APPROVED. No state credit is available anywhere, and no
enrollment is open.**

This preflight answers one question per state: **what actually stands between the build that exists
and a submission**, separated into what can be closed mechanically from sources now in hand, and
what genuinely requires a regulator or an instructor.

Every document below was fetched from the regulator's own site on 2026-08-24 and is quoted from that
copy.

---

## 0. The correction that governs the rest of this report

**The 21 August audit's Arizona finding 3.1 was wrong, and it was wrong in the dangerous direction.**

That finding said three claims in Arizona's public regulatory record were "manufactured" and removed
them. All three are real, and all three come from one document the audit never opened:

> **Arizona Department of Real Estate, Substantive Policy Statement No. 2025.01, *Distance Learning
> Education Course Guidelines*.** Established 3 January 2019; revised 28 September 2022; revised
> 3 October 2024; **revised 6 March 2025 "for clarification on requirements specific to pre-licensing
> distance learning."**
> https://azre.gov/sites/default/files/2025-07/S.P.S.%202025.01.pdf

| Claim the audit deleted | Reality |
|---|---|
| "SPS 2025.01 controls" | **Correct.** ADRE numbers its Substantive Policy Statements this way. The audit reasoned that "SPS is Wisconsin's Department of Safety and Professional Services" and concluded nothing in Arizona is numbered so. That inference was wrong, and it was made without opening ADRE's policy-statement index. |
| "2:1 bank ratio" | **Correct, verbatim.** *"Final exam questions must be pulled from a question bank with at least a 2:1 ratio."* |
| "exam not delivered on a student-supplied device" | **Correct, verbatim.** *"The exam shall not be taken on any device provided by the student, i.e. personal computer, tablet, or phone."* |

Two independent confirmations that S.P.S. 2025.01 is live and operative:

- ADRE's own **Course Application Form – Pre-Licensing, Rev. 09/2025** carries an administrator
  attestation: *"I also affirm that I will be collecting IP addresses and **following S.P.S. 2025.01**
  for any distance learning courses."*
  https://azre.gov/sites/default/files/2025-09/Course%20Application%20Form%20-%20Pre-Licensing.pdf
- ADRE's current curriculum outline teaches Substantive Policy Statements as one of the **four
  categories of Arizona real estate law** a candidate must know (Module 1.1).

**A third consequence.** The audit also moved `asynchronous_online_allowed` from `true` to `null` for
Arizona. S.P.S. 2025.01 defines Distance Learning as *"an online, planned learning experience with a
geographic separation that **may be synchronous or asynchronous**"* (A.R.S. § 32-2101(25)), and the
course application form offers **"Distance Learning (Not Synchronous)"** as a delivery method to tick.
Asynchronous delivery is permitted in Arizona.

**What this means for how the record is maintained.** The failure mode was not carelessness about
sources; it was the opposite — a sweep that treated an unsourced-looking claim as false rather than as
unverified, and deleted it. Deleting a true regulatory requirement is worse than carrying an unverified
one, because the unverified one is still visible to be checked. Any future sweep of this kind should
mark a claim `UNVERIFIED` and leave it in place until the regulator's own document is opened.

---

## 1. Maine — closest to submission of the four

### Sources read

| Document | Status as read | URL |
|---|---|---|
| **Real Estate Commission Rules, adopted 26 October 2025** — Chapters 300, 340, 350, **360**, 370, 390, 400, 410, 43 pp. | Current | https://www.maine.gov/pfr/professionallicensing/sites/maine.gov.pfr.professionallicensing/files/inline-files/Real-Estate-Commission-Rules-Adopted-October-26-2025.pdf |
| **The Sales Agent Course — Outline**, approved 8/15/2013, effective 1/1/2014, **"Revised effective 5/21/2026 to reflect rule changes effective 10/26/2025"**, 13 pp., with the Minimum Guidelines of 24 January 2013 attached and made part of it | Current | https://www.maine.gov/pfr/professionallicensing/sites/maine.gov.pfr.professionallicensing/files/inline-files/1.%20THE-SALES-AGENT-COURSE_0.pdf |
| **Qualifying Education Program Approval Application & Supplementary Materials**, rev. March 2018, 10 pp. | Current as published | https://www.maine.gov/pfr/professionallicensing/sites/maine.gov.pfr.professionallicensing/files/inline-files/QE%20Pkt%2003-2018.pdf |
| Instructor Summary of Student Evaluations (QE) form | Current | linked from https://www11.maine.gov/pfr/professionallicensing/professions/real-estate-commission/education |

### Chapter 360 is much narrower than the register said

**Correction to `maine/regulatory/primary-text-readings.md`.** That file calls Chapter 360 *"the
largest open item in the Maine build"* on the reasoning that *"§ 13279 delegates the content of the
mandatory relationship disclosure form to it."* **It does not.** Chapter 360 is four pages titled
*Approval of Qualifying Education Courses* and is about course approval only. The brokerage
relationship form content sits in **Chapter 400** (*Real Estate Brokerage Agency and Designated
Broker*) and the standards of practice in **Chapter 410** — both in the same PDF, both still unread.
The open item is real; it was pointed at the wrong chapter.

### What Chapter 360 requires, and what we already have

**§ 1(3) — "Satisfactory completion" is a grade of at least 75%.** Our registry says the same.

**§ 2(1) — the syllabus must contain eleven items, A through K:** provider name/address/phone;
**instructor qualifications including a resumé** showing ability and competence to teach the
curriculum; course title; start and end dates; class session times; **course text titles and
publishers**; **a timed class session-by-session breakdown with quiz and test dates noted, and an
instructor manual**; grading policy; attendance policy; **final course examination and answer key**;
and **a policy on cheating**.

| Chapter 360 § 2(1) item | In the repository today |
|---|---|
| A. Provider identification | Yes — `maine/submission-package.md` |
| B. **Instructor qualifications + resumé** | **No — awaiting instructor** |
| C. Course title | Yes |
| D. Start and end dates | Per-offering; not fixed |
| E. Class session times | Yes — `maine/timed-course-outline.md` |
| F. **Course text titles and publishers** | **Not stated as a bibliography** |
| G. Timed session-by-session breakdown, quiz/test dates, instructor manual | Yes — outline + `maine/instructor-manual.md` |
| H. Grading policy | Yes — `maine/course-administration-policy.md` |
| I. Attendance policy | Yes — same file |
| J. **Final examination AND answer key** | Yes — `maine/assessments/final-exam-bank.md` |
| K. **A policy on cheating** | **Not written as a standalone policy** |

**§ 2(3) — review turnaround: 30 days for a live course, 45 days for any other format.** Ours is not
live, so **45 days**.

**§ 2(5) — the prohibition we already observe**, in the Commission's words: providers *"shall not
advertise courses as approved, enroll students or conduct classes for which students expect to meet
the course requirements … prior to receiving written approval from the Director."* The same section
prescribes **a statement the instructor must read aloud and distribute at the first session**, quoted
verbatim in the rule. We do not carry that statement anywhere.

**§ 2(6)–(8) — post-course obligations:** enrollment report within **30 days** of course completion; a
**summary of student evaluations** filed with it (the Commission publishes the form); and a
**transcript** to every student showing course title, student name, **final numerical grade**,
beginning and completion dates, signed by the provider.

**§ 2(10) — no recruiting** for any brokerage on the provider's premises **"(including distance or
virtual platforms)"**.

### The content prescription — and how our build measures against it

Chapter 360 § 1(1) defines a qualifying course as one meeting the competencies in the
**Commission-approved model "The Sales Agent Course"**. That model is published, and it is the exact
prescription. Our engine transcribes it:

| Model topic | Model % | `config/maine-course-engine.mjs` | Minutes |
|---|---:|---|---:|
| Introduction | 1 | T01 | 30 |
| Industry Overview/Organization | 1 | T02 | 30 |
| Maine Real Estate Commission | 13 | T03 | 390 |
| Agency Relationships | 13 | T04 | 390 |
| Product Knowledge | 28 | T05 | 840 |
| Property Valuation and the Appraisal Process | 9 | T06 | 270 |
| Financing the Transaction | 9 | T07 | 270 |
| Contracts | 14 | T08 | 420 |
| Closings | 8 | T09 | 240 |
| Miscellaneous Federal/State laws | 4 | T10 | 120 |
| **Total** | **100** | 10 topics | **3,000** |

**Every topic and every weight matches, and the model's "55 hours, 3 quizzes and a final exam" matches
the build exactly.** The model also confirms the arithmetic our engine enforces: *"Course percentages
are based on course instruction and do not include quiz or exam time."*

### Maine — submission blockers

| # | Blocker | Kind | Closable now? |
|---|---|---|---|
| M1 | Instructor qualifications and resumé — § 2(1)B | Human | No — instructor outreach |
| M2 | Chapters 400 and 410 not read; the register misattributes the disclosure form to Chapter 360 | Build | **Yes** — both are in the PDF already fetched |
| M3 | Course text titles and publishers — § 2(1)F | Build | **Yes** |
| M4 | A policy on cheating — § 2(1)K | Build | **Yes** |
| M5 | The Commission's first-session statement, read and distributed — § 2(5) | Build | **Yes** — text is in the rule |
| M6 | Enrollment report, evaluation summary and transcript mechanics — § 2(6)–(8) | Build | **Yes** — Commission forms published |
| M7 | Application form and fee, on the Director's form | Human | Form in hand; fee and signature are the owner's |

**Nothing in Maine requires a document we do not have.** M2 through M6 are mechanical.

---

## 2. Virginia — the prescription is complete and public

### Sources read

| Document | Status | URL |
|---|---|---|
| **Prelicense Education Course Approval Application, A490-0214PRE-v9, 04/01/2026**, 5 pp. | Current | https://www.dpor.virginia.gov/sites/default/files/boards/Real_Estate/A490-0214PRE.pdf |
| **18VAC135-20-400**, *Course content of real estate principles and practices* — **amended Virginia Register Volume 42, Issue 14, effective 1 April 2026** | Current | https://law.lis.virginia.gov/admincode/title18/agency135/chapter20/section400/ |

### There is no missing Board-prescribed curriculum

**18VAC135-20-400 IS the prescription**, and A490's **Exhibit 1** reprints all 25 subjects
alphabetically for the applicant to map against. Nothing in the application points at a further
document. The earlier register entry — "the Real Estate Board's prescribed prelicense course content,
beyond 18VAC135-20-400" as unobtained — describes a document that does not appear to exist.

**The 25-subject crosswalk is already exact.** `config/virginia-course-engine.mjs` carries T01–T25 as
the twenty-five subjects **in the regulation's own order and its own words**, and the April 2026
amendment did not change the list. What the Board wants is not a different list but a **Timed Course
Outline that shows where each of the 25 is covered, hour by hour** — which is a presentation of what
the engine already holds.

### What A490 v9 actually requires

**Seven attachments, each behind its own header sheet even when empty**, in a single unsecured PDF,
bookmarked, emailed to `reschool@dpor.virginia.gov`, file named for the course title, subject line
`Provider – Course Title.pdf`:

| # | Attachment | Repository status |
|---|---|---|
| 1 | **Timed Course Outline** — days, class hours per day, content per hour, and **where each of the 25 subjects in 18VAC135-20-400 is covered**. *"Course applications with inadequate TCOs will be rejected."* | `virginia/submission/60-hour-timed-course-outline.md` — needs the explicit 25-subject column |
| 2 | Course materials — book titles with **cover and table of contents**, handouts, slides, **detailed lecture notes** | Curriculum exists; not assembled as an attachment |
| 3 | Research assignments and materials | `virginia/submission/research-assignments.md` |
| 4 | **Final exam with the pass percentage stated**, plus all tests and quizzes | Banks exist; pass percentage not stated on the exam |
| 5 | **How the written, monitored final exam will be administered** | `virginia/compliance/monitored-final-exam-sop.md` |
| 6 | **Course Completion Certificate with 8 specified fields** — including the approval number and *"a statement that this course is approved by the Virginia Real Estate Board for Pre-License Education pursuant to § 54.1-2105"* | `virginia/submission/course-completion-certificate-specimen.md` — approval number necessarily blank |
| 7 | **Evidence of a course timer** (online/distance only) | `virginia/compliance/online-timer-engagement-spec.md` — spec exists; *evidence* does not |

**Four further facts from the form that the build should hold explicitly:**

- **No fee is required.**
- **"Once a course is approved, it may not be substantially altered."** Any change to content or to
  time allocations requires a new submission. This is a harder change-control rule than ours.
- Correspondence and online courses must include testing procedures **and a Notarized Affidavit Form**
  certifying student compliance. We have a draft at `virginia/compliance/online-student-affidavit-draft.md`.
- **Only courses offered at proctored locations can satisfy Board-ordered education** — a scope limit
  worth stating rather than discovering.
- Submission is on **published deadline dates** tied to Real Estate Board Education Committee meetings;
  an incomplete package rolls to the next meeting.

### Virginia — submission blockers

| # | Blocker | Kind | Closable now? |
|---|---|---|---|
| V1 | TCO does not show the 25 subjects hour by hour in the Board's required form | Build | **Yes** |
| V2 | Final exam does not state its pass percentage on its face | Build | **Yes** |
| V3 | Course materials not assembled as Attachment 2 (covers, TOCs, lecture notes) | Build | **Yes** |
| V4 | Notarized affidavit is a draft, not an executed form | Human | Draft ready |
| V5 | **Evidence** of a course timer — a specification is not evidence | Build + platform | Partly |
| V6 | Certificate approval number | Regulator | After approval |
| V7 | Submission deadline calendar not tracked | Human | Published on the Board site |

**No unknown Board document blocks Virginia.**

---

## 3. Arizona — the content prescription is published, and richer than the build

### Sources read

| Document | Status | URL |
|---|---|---|
| **Arizona State Specific Salesperson Pre-Licensing Curriculum Outline**, © **December 2025**, 43 numbered pages (48 PDF pages) | **Current — supersedes the October 2025 revision** | https://azre.gov/sites/default/files/2025-12/Prelicense%20Salesperson%20Exam%20Curriculum%20122025_0.pdf |
| **S.P.S. 2025.01, Distance Learning Education Course Guidelines**, rev. 6 March 2025 | Current | https://azre.gov/sites/default/files/2025-07/S.P.S.%202025.01.pdf |
| **Course Application Form – Pre-Licensing, Rev. 09/2025** | Current | https://azre.gov/sites/default/files/2025-09/Course%20Application%20Form%20-%20Pre-Licensing.pdf |
| **School Approval Application Form** | Current | https://azre.gov/sites/default/files/2025-09/School%20Approval%20Application%20Form.pdf |
| **Instructor Application Form**, 12/2025 | Current | https://azre.gov/sites/default/files/2025-12/Instructor%20Application%20Form.pdf |
| **Sample Formatting for a Course Outline**, 05/2026 | Current | https://azre.gov/sites/default/files/2026-05/Sample%20Course%20Outline.pdf |

**Note on the revision.** The outline located is dated **December 2025**, one revision newer than the
October 2025 document. It should be locked at this revision, with the hash recorded, because ADRE
revises it and the course must follow the approved outline.

### Question A — the 27-hour Arizona-specific content

**The source exists and is in hand.** Twelve sections, ~50 modules, each with explicit learning
objectives and a three-level Bloom's taxonomy (Recall / Application / Analysis) telling a provider how
deeply to teach each item.

| ADRE section | Our coverage |
|---|---|
| 1. Arizona Real Estate Regulatory Framework (incl. Recovery Fund) | module-10, partial |
| 2. Arizona Consumer Protection Laws | **largely absent** |
| 3. Advertising | module-12 |
| 4. Arizona Agency (incl. Arizona case law on customers and clients) | module-11, partial |
| 5. Licensee Duties and Obligations | module-11 |
| 6. Licensee Competencies and Duties (property types; niche areas) | partial |
| 7. Reasonable Skill and Care (property taxes and special assessments; Arizona utility and environmental regulation) | partial |
| 8. Contracts | module-04 + the 6-hour contract writing course |
| 9. Critical Business Services (escrow, title insurance, lending) | module-06, partial |
| 10. Ownership and Encumbrances | modules 01–03 |
| 11. Foreclosure / Short Sale / Deed in Lieu (Arizona anti-deficiency) | **absent** |
| 12. Resource Guide | n/a — ADRE calls it a courtesy, not a requirement |

**A keyword probe across all thirteen prelicense modules found zero occurrences of six items the
outline requires by name:**

- **Arizona Constitution Article 26** and **State Bar of Arizona v. Arizona Land Title & Trust Co.** —
  the constitutional basis on which an Arizona licensee may complete contract documents at all. This is
  the outline's **first substantive objective**.
- **1967 Arizona Consumer Fraud Protection Act**
- **Real Estate Recovery Fund**
- **Arizona homestead law**
- **Arizona anti-deficiency statute**
- **Timeshare** as a niche practice area

The 27 hours are structurally allocated (modules 10–13 carry `arizonaSpecific: true`, 7+7+7+6 = 27), so
the gap is content within a correct frame, not a missing frame.

### Question B — is a separate 90-hour prescription still missing?

**Probably not, and the question is now narrow enough to ask in one sentence.** ADRE's Education Forms
& Resources page publishes exactly one salesperson curriculum document — the Arizona-specific one — and
its course application asks only for *"a course outline with sufficient detail to clearly identify the
scope and content of the course,"* with a **Sample Formatting for a Course Outline** to follow. The
"Department will provide on request" language in **A.A.C. R4-28-401(D)** may now be satisfied by these
published documents.

**The single question for ADRE Education Division:** *"Beyond the December 2025 Arizona State Specific
Salesperson Pre-Licensing Curriculum Outline, does the Department maintain a prescribed content outline
for the remaining 63 hours of the 90-hour salesperson pre-licensing course that R4-28-401(D) refers to,
and if so how is it obtained?"* Nothing should be rebuilt until that is answered.

### S.P.S. 2025.01 — the platform requirements the audit deleted

These are hard constraints on the LMS, not on the curriculum, and several are stricter than anything
built for any state so far:

| Requirement | Our platform |
|---|---|
| Identity authentication that is **not** username/password and **not** student attestation | **Not built** |
| **Log out after 15 minutes of inactivity**, return the student to the **start of the unit**, and re-verify identity | **Not built** |
| Track time per unit and per subject; **stop the clock when the student is not interacting** | Partly |
| Report student progress with **login/logout timestamps, IP addresses**, and completion date and time | Partly |
| Every module carries **instructional-content and scenario-based interactivity questions**; **75% to proceed** | Partly |
| Module = **12.5 to 50 minutes** | Check needed |
| **Final exam on a lockdown browser**, in person or online-proctored, **not on a student-supplied device** | **Not built** |
| **2:1 question-bank ratio** for the final | Check needed |
| Final excluded from course time; **75% to pass**; module-quiz items reused on the final must be reordered | Partly |
| Photo-ID identification **at each login**; proctor duties enumerated | **Not built** |
| Certificate with **11 specified fields** | Check needed |
| ADRE gets **two logins** to review the course — a student view and one with no time constraints | **Not built** |

### Arizona — submission blockers

| # | Blocker | Kind | Closable now? |
|---|---|---|---|
| A1 | Registry and catalog record still carries the audit's deletions — S.P.S. 2025.01, the 2:1 ratio, the device rule, and `asynchronous_online_allowed` | Build | **Yes — this is a correction, not new work** |
| A2 | Six named ADRE topics absent from the curriculum | Build | **Yes** |
| A3 | Full objective-by-objective crosswalk of 43 pages against 13 modules | Build | **Yes — mechanical, sizeable** |
| A4 | Lockdown-browser proctored final, not on a student device | Platform | Design decision |
| A5 | Identity authentication beyond username/password | Platform | Design decision |
| A6 | 15-minute inactivity logout with unit rewind and re-verification | Platform | **Yes** |
| A7 | IP-address and timestamp reporting | Platform | **Yes** |
| A8 | Two ADRE reviewer logins | Platform | **Yes** — the California reviewer work is the pattern |
| A9 | School approval, then course approval, then instructor approval — three separate ADRE applications | Human | Forms in hand |
| A10 | Whether a 90-hour prescription exists beyond the Arizona-specific outline | Regulator | One question |

---

## 4. Wisconsin — the largest read, and it is now enumerated

### Sources read

| Document | Status | URL |
|---|---|---|
| **Wis. Admin. Code ch. REEB 25**, **Register November 2024 No. 827** — including **REEB 25.033** (salesperson program) and **REEB 25.055** (approval) | Current | https://docs.legis.wisconsin.gov/code/admin_code/reeb/25.pdf |

### REEB 25.033 — every citation it makes, enumerated

The rule fixes **72 hours** and **19 subject groups**, which our build maps. What it also does is point
outward, and this is the exact list:

**Wisconsin Statutes cited inside REEB 25.033:**
`23.32` · `70.043` · `70.095` · `74.15` · `74.47(1)–(2)` · `77.22` · `77.27` · `87.30` · `106.50` ·
`224.71` · `240.10` · `ch. 452` (incl. `452.133`, `452.135`, `452.136`, `452.139`, `452.23`) ·
`703.08` · `703.21` · `703.33` · `706.01` · `706.01(7)` · `706.02` · `706.03` · `707.02` · `707.05` ·
`707.40` · `707.47` · `707.49` · `ch. 709` · `766.31` · `766.51` · `766.60` · `766.605` · `766.63` ·
`788.015`

**Administrative rules cited inside REEB 25.033:**
`ch. REEB 16` · `REEB 24.03` · `24.04` · `24.05` · `24.07(1)(a)`, `(1)(b)`, `(2)`, `(3)`, `(4)`, `(5)`,
`(19)` · `24.075` · `24.08` · `24.09` · `24.10` · `24.12` · `ATCP 93` · `ATCP 134.02` · `NR 116.01`

**One of them is a trap the rule flags itself.** REEB 25.033(1)(f) requires instruction on mobile homes
under **s. 70.043**, and the code prints a note directly beneath it: *"Section 70.043, Stats., was
repealed by 2023 Wisconsin Act 12."* A course that teaches § 70.043 as live law is teaching a repealed
statute the rule still names. This has to be handled explicitly.

**Comparison with `wisconsin/regulatory/primary-text-readings.md`.** The register's unread list is
accurate as far as it goes and names eight § 452 sections, six REEB chapters and eleven other bodies —
but it is a list of **chapters**, where the rule cites **sections**. Thirteen specific sections the rule
names do not appear in the register at all: `23.32`, `70.095`, `74.15`, `74.47`, `77.22`, `77.27`,
`87.30`, `224.71`, `240.10`, `706.02`, `706.03`, `788.015`, and the `707.xx` series.

### REEB 25.055 — the approval rule, relied on but never recorded

`wisconsin/regulatory-compliance-matrix.md` cites REEB 25.055 in six rows. **`wisconsin/regulatory/primary-text-readings.md` does not mention it once.** The rule is now read; what it requires:

**§ 25.055(2) — submit to the Board at least 30 days before offering the course:** the Board's
application; **organizational structure**; **registration policies**; **promotional materials**;
**a detailed outline with specific allocations of hours to each topic**; method of instruction;
**method for ensuring the students who complete the course are the enrolled students**; **method for
evaluating instructors and program**; names of all instructors; and **evidence each instructor meets
one of four qualification paths** — taught real estate at an accredited institution; or licensed and
**five continuous years** in appraising, financing, marketing, brokerage management, property
management, counselling or real property law; or a Wisconsin State Bar member in real-estate law; or
otherwise qualified in the Board's judgment.

**§ 25.055(3) — instructor changes and any substantive change to items (a)–(j) must be reported within
10 days.**

**§ 25.055(4) — certificate with six fields**, issued only if the student received **all** required
content; **attendance and completion records kept at least 5 years**.

**§ 25.055(1)(c) — non-discrimination** on sex, race, colour, sexual orientation, disability, religion,
age or national origin, in the education program itself.

**One finding worth stating plainly.** `wisconsin/course-administration-policy.md` records that *"no
Board-mandated final-exam score or proctor rule was located in the controlling pre-license provisions."*
Having now read REEB 25.055 and 25.033 in full, **that is correct** — Wisconsin prescribes content and
hours and leaves assessment design to the provider, subject to Board acceptance. The build's 75% is
correctly labelled a provider proposal.

### Wisconsin — submission blockers

| # | Blocker | Kind | Closable now? |
|---|---|---|---|
| W1 | 13 statute sections cited by REEB 25.033 are unread and unlisted | Build | **Yes** |
| W2 | REEB 24 (approved forms) — 13 subsections cited; unread | Build | **Yes** |
| W3 | ch. REEB 16 and the board-approved forms | Build | Partly — forms may need purchase/permission |
| W4 | **s. 70.043 repealed by 2023 Act 12** while REEB 25.033 still names it | Build | **Yes — must be handled, not ignored** |
| W5 | REEB 25.055 relied on in the matrix, absent from the register | Build | **Yes** |
| W6 | Organizational structure, registration policies, promotional materials as § 25.055(2) attachments | Build | **Yes** |
| W7 | Identity-assurance method — § 25.055(2)(g) | Build + platform | Partly |
| W8 | Instructor evidence under one of the four paths — § 25.055(2)(j) | Human | Instructor outreach |
| W9 | Form #831 per instructor; 30-day lead time | Human | — |

---

## 5. Recommended order, and why

The user's proposed order is confirmed by what the sources say, with one adjustment.

1. **Maine.** Every source is in hand, the content prescription is matched topic for topic and weight
   for weight, and the remaining build items (M2–M6) are small and mechanical. The only true dependency
   is the instructor.
2. **Virginia.** The prescription is complete, the 25 subjects already match the regulation verbatim,
   and the work is presentational — a TCO in the Board's required shape and six attachments assembled.
   No unknown document exists.
3. **Arizona.** Do the two corrections first (A1 — restore what the audit deleted; then lock the
   December 2025 outline with its hash), because the record is currently wrong in public. Then the
   crosswalk, then the one question to ADRE. **Adjustment:** A1 should be done ahead of Maine, because
   it is a correction of a live public record rather than new work, and it takes minutes.
4. **Wisconsin.** Source sweep first, exactly as proposed. W1–W5 are now a finite, enumerated list
   rather than an open-ended one.

**Website plumbing is unaffected by this report and remains outstanding** — state-root navigation for
Maine, Virginia and Wisconsin, and the missing Arizona public course HTML.

---

## 6. What this preflight did not do

- **No curriculum, bank, engine, registry or generated artifact was modified.**
- **No Arizona objective-by-objective crosswalk.** Section 3 reports a structural mapping and a
  keyword probe. A full crosswalk of 43 pages against 13 modules is the next mechanical task.
- **Maine Chapters 400 and 410 were located but not transcribed.**
- **Wisconsin's 13 newly enumerated statute sections were enumerated, not read.**
- **No regulator was contacted**, and nothing here reports a regulator's answer.
- **No approval is claimed for any course in any state.**
