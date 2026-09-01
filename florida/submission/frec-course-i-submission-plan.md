# FREC Course I — submission plan

**Phase 0 v2.** This plan replaces the v1 version, which was wrong about the most important thing in
it. v1 reported that a Florida broker's licence was mandatory for the school permitholder and that
no StateCourse individual could sign an application. That is not what the law says, and it is not
what DBPR's own forms do. See §1.

Nothing has been submitted, no application has been started, and no Florida credential is held.
`config/florida/school-permit-ledger.mjs` carries the machine-checked version;
`config/florida/dbpr-application-package.mjs` carries the forms;
`florida/regulatory/primary-text-readings.md` carries the readings.

---

## 1. The eligibility question, corrected

**There is a lawful route, and it does not require anyone to hold a Florida broker's licence.**

Section 475.451(2)(a), Fla. Stat.:

> A school permitholder must be the holder of a license as a broker, either active or voluntarily
> inactive, **or must have passed an instructor's examination approved by the commission.**

Section 475.451(2)(b)1.c. gives the same alternative for the instructor permit: "Pass an instructor's
examination approved by the commission."

v1 let Rule 61J2-17.011(2), F.A.C. override that. It does not, for two independent reasons. The
rule's operative sentence is **scoped** — a licensee must hold a Florida broker's licence *in order
to satisfy the Broker license requirement*, which answers "which broker's licence counts", not "must
there be one". And a rule cannot repeal a statute in any event: s. 120.52(8)(c), Fla. Stat. makes a
rule that enlarges, modifies or contravenes its enabling law an invalid exercise of delegated
authority. The rule's cited authority is the *instructor* experience provision, which would not
support narrowing the permitholder alternatives. Its cross-reference to "s. 475.25(2)(a)" does not
resolve at all — that section is about revoking a licence issued by mistake.

**And DBPR administers it as two routes.** Three of the Department's own instruments say so:

- **DBPR RE 5, Section I — METHOD OF QUALIFICATION:** "Holding a license as a Florida Broker, either
  active or voluntarily inactive" **or** "Holder of a Florida Instructor's License".
- **DBPR RE 6, Change of School Permit Holder:** "Holding a license as a broker ... or; **Passing
  the Instructors Exam**".
- **DBPR RE 3, Section I:** "**Real Estate Instructor Exam [1010]**" alongside the two degree-plus-
  broker bases.

**What this plan does not say.** It does not say Anatoliy is eligible, or approved. It says a
statutory examination route appears available, subject to satisfying the general qualifications in
s. 475.17(1), passing the Commission-approved instructor examination, filing the application, and
the Department issuing the permit. Every one of those is outstanding. Eligibility is a determination
the Department makes.

**And there is a second route.** Nothing ties the permitholder to ownership. Section 475.451(2)(a)
defines the permitholder functionally as "the individual who is responsible for directing the
overall operation", RE 5 collects the permitholder and the company separately, and RE 6 exists to
transfer a permit from one person to another. StateCourse may instead engage a qualified individual
— a Florida broker, or an existing instructor permitholder — as school permitholder. That is a real
role with real duties, not a name on a form.

---

## 2. The forms, verified

Every DBPR RE form is adopted by **Rule 61-35.027, F.A.C., "Real Estate Forms"**, and each form's
header states that incorporation. Held under `florida/frec-sources/dbpr/forms/` and
`.../dbpr/education/`, hashed in the source inventory.

| Form | Title on the form | Effective | Fee | Role here |
|---|---|---|---|---|
| **DBPR RE 3** | Application for Real Estate Instructor Permit | Nov 2015 | $62.75 | Stage 4 |
| **DBPR RE 5** | Application for School Permit | May 2019 | $109.00 | Stage 5 |
| **DBPR RE 6** | School Change of Status Transactions | — | — | Stage 6 — registers the instructor to the school |
| **DBPR RE 9** | Application for Additional School Location | Jun 2015 | $50.00 | probably N/A — open question |
| **DBPR RE 18** | Education Course Approval Application | Jun 2026 | **$0 for schools** | Stage 7; use only the current Education-page-linked revision |
| **DBPR RE 19** | FREC Continuing Education Provider Approval Application | — | — | provider-only; not a permitted-school attachment |
| **DBPR RE 20** | FREC Request for Instructor Evaluation | — | — | provider-only; not a permitted-school attachment |

All applications go to: Department of Business and Professional Regulation, 2601 Blair Stone Road,
Tallahassee, FL 32399-0783. RE 18 goes to the same street address, zip **32399-0750**.

---

## 3. Instructor examination path — logistics resolved

The official DBPR Candidate Information Booklet effective February 2025 is held at
`florida/frec-sources/dbpr/testing/RE_instructor_cibs.pdf`. Pearson administers the computer-based
exam at a physical test center after DBPR authorization. It is closed book, 100 equally weighted
multiple-choice questions, 3.5 hours, with 75 points required. The current Pearson portal supports
online scheduling or 888-204-6289 and requires cancellation/rescheduling two full calendar days in
advance.

The current fee is the remaining narrow gap. A 2017 sheet still linked from the current portal says
$36.75, but the 2025 CIB warns fees changed; do not represent $36.75 as current without checkout
confirmation.

---

## 4. Written questions to DBPR/FREC

The complete staged inquiry is at
`florida/submission/regulator-inquiries/dbpr-frec-prefiling-inquiry.md`; the machine-readable issue
set and safe pending behaviour are in `config/florida/assessment-architecture.mjs`. It asks DBPR to
confirm:

1. whether the Course I final may use 100 items or must apply two items per instruction hour over
   60 or 63 hours; StateCourse builds 126 per form while waiting;
2. whether an instructor permit issued through RE 3 [1010] qualifies its holder to serve as the
   RE 5 school permitholder despite the current rule wording;
3. whether the named out-of-state address may be the sole distance-school location and whether
   RE 9 is implicated;
4. how the eight-classroom-hour absence language applies asynchronously when all syllabus sessions
   must independently be completed;
5. which online controls satisfy the anti-recruiting notice and permitted-instructor availability;
6. how prelicense completions and rosters are reported;
7. whether the Education-page-linked June-2026 RE 18 is the operative form while amendment of Rule
   61-35.027 proceeds; and
8. the completeness-review, Education Agenda and deficiency/resubmission cycle.

Pearson receives a separate logistics inquiry for the current fee, the physical test center and the
generic completion-certificate language in the CIB. Never include SSN or background details in an
informal inquiry; Florida correspondence may be a public record.

---

## 5. The stages, in order

### Stage 1 — apply for examination authorization
Owner: **human**. File DBPR RE 3 under transaction [1010] with the $62.75 application fee, then
complete Livescan immediately after filing. DBPR authorization precedes Pearson scheduling.

### Stage 2 — put the written questions
Owner: **human**, letter drafted. Can run in parallel with Stage 1.

### Stage 3 — pass the instructor examination
Owner: **human**. Physical Pearson test center; closed book; 100 multiple-choice questions; 210
minutes; pass 75.

### Stage 4 — instructor permit
After Stage 3, DBPR completes the instructor-permit transaction already opened with **DBPR RE 3**.
The other two qualification bases require a Florida broker's licence and are closed on current
facts. Owner: **regulator**.

### Stage 5 — school permit
File **DBPR RE 5**, checking "Holder of a Florida Instructor's License" and giving the permit number
from Stage 4, with $109.00. Note the form's own rider: if the permitholder also teaches, they must
meet the school-instructor requirements — which, on this route, they already do, because the
instructor permit *is* that requirement. Owner: human, then **regulator**.

RE 5 requests a physical street address. DBPR's current registry includes approved distance Course I
schools at out-of-state addresses, so a Florida classroom is not categorically required. The named
StateCourse address, RE 9 treatment, foreign-entity qualification, registered agent and any DBA
still require an owner/counsel decision and written operational confirmation.

The Department may require fingerprints processed through the FBI and "shall make such investigation
... as it may deem necessary" (s. 475.451(2)). Not optional on the applicant's say-so.

### Stage 6 — register the instructor to the school
**DBPR RE 6**, "Add/Terminate – Instructor" ($0). This is what makes the instructor "registered with such
school" for Rule 61J2-3.008(5)(b), which is what lets the course publish the contact block the rule
requires. Owner: human.

### Stage 7 — course approval
File **DBPR RE 18**: Section III "Sales Associate Pre-Licensure" + "Distance", Section IV "NEW",
$0 for a permitted school.

Section V attachments for an initial approval by a permitted school:

| # | Attachment | Owner |
|---|---|---|
| 1 | Course timed outline — subjects, major topics, subtopics | build |
| 2 | **Learning objectives, three per hour** (3 × 60 = 180) | build |
| 3 | Course materials with an explanation of delivery method | build |
| 4 | DBPR RE 19 | excluded — **Providers Only** |
| 5 | DBPR RE 20 per instructor + resume | excluded — **Providers Only** |
| 7 | **Two** end-of-course examinations for distance pre/post-licensing | build after pagination |
| 8 | An answer key per form, referencing the page numbers each question and answer rest on | build after pagination |

Before signature and again immediately before submission, retrieve the RE 18 linked from DBPR's
Education page and compare its identity to the held June-2026 copy. The legacy September-2017 form
is blacklisted and must never be filled or filed.

Plus, from Rule 61J2-3.008(4)(b): **a copy of the course, and access to the course, in the format in
which it will be offered to the student.** Not a PDF — a working reviewer account against the real
delivery.

And the distance-education criteria each need an artifact: the detailed timeline published before
enrolment; the objective time study; the described examination-time control; identity verification
at enrolment, participation and completion; the continuity plan; the posted instructor availability.

**The ordering constraint.** Answer keys must cite page numbers, so **the examination cannot be
authored before the curriculum is written and paginated.** Any plan running the two in parallel
produces an answer key that cannot be completed.

---

## 6. After approval

Rule 61J2-3.008(4)(c) makes a Florida course a maintained thing:

- approval runs **24 months**;
- renewal no more than **120 days** before expiry, with course materials, the end-of-course
  examinations, a summary of updates, and the original approval letter;
- **15 days** grace to grade an examination after expiry;
- students told the **course number and expiration date upon enrolment**;
- **60 days** notice for any significant change;
- as a **primary school**, resubmission every new edition and in no event more than **four years**
  after original approval.

Retention, two clocks over two record sets: **3 years** for registration records, rosters,
attendance, examination copies and answer sheets (s. 475.451(8)); **5 years** for the school's copy
of each completion certificate (Rule 61J2-3.015(6)(f)), in any readily retrievable electronic form.

---

## 7. What StateCourse may say about Florida meanwhile

Nothing asserting a credential it does not hold. Not house style — s. 475.4511(2), Fla. Stat.
requires a school's publicity to be "based upon relevant facts and supported by evidence
establishing their truth", and s. 475.451(3) makes several specific representations unlawful, with
s. 475.451(4) making a breach of the permit provisions a second-degree misdemeanour.

`FORBIDDEN_CLAIMS` encodes the prohibitions and `scripts/florida-source-lock.mjs` fails the build if
one appears in anything StateCourse publishes in its own voice. The public registry record reads
"Coming Soon" with no approval number, and `tests/florida-foundation.test.mjs` fails if that changes
while no credential is held.
