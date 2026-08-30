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
| **DBPR RE 18** | Education Course Approval Application | — | **$0 for schools** | Stage 7 |
| **DBPR RE 19** | FREC Continuing Education Provider Approval Application | — | — | open question |
| **DBPR RE 20** | FREC Request for Instructor Evaluation | — | — | "approved providers only" per DBPR |

All applications go to: Department of Business and Professional Regulation, 2601 Blair Stone Road,
Tallahassee, FL 32399-0783. RE 18 goes to the same street address, zip **32399-0750**.

---

## 3. The one genuine gap on the eligibility path

**The instructor examination itself.** DBPR RE 3 offers "Real Estate Instructor Exam [1010]" as a
qualification basis without saying where the examination is administered, what it covers, what it
costs, or whether a candidate information booklet exists. Neither the forms-and-publications page
nor the education page carries instructor-examination candidate materials.

This is a telephone call to the Division of Real Estate (Customer Contact Center, 850.487.1395), not
a research task, and it is the **first** thing to do because everything else waits on it.

---

## 4. Written questions to DBPR/FREC

Six, drafted in full in `config/florida/assessment-architecture.mjs` as `DRAFT_QUESTION_TO_DBPR` and
`OPEN_DBPR_QUESTIONS`. In short:

1. **Item count** — "at least 100 items, or 2 items per instruction hour": 100, 120 or 126?
2. **"Instruction hour"** — the 60 instruction hours, or all 63?
3. **Form count** — the rule and the checklist say two; RE 18 says five. Which?
4. **RE 19** — must a permitted school filing Course I also file it?
5. **Absence in a distance course** — how is the 8-classroom-hour ceiling measured with no class?
6. **Instructor examination logistics** — as above.

Plus, not on the drafted letter but worth asking: whether a distance-only school with no Florida
classroom has any "additional location" to declare under Rule 61J2-17.013's one-permit-per-location
construction.

---

## 5. The stages, in order

### Stage 1 — identify the instructor examination
Owner: **human**. Everything waits on this. See §3.

### Stage 2 — put the written questions
Owner: **human**, letter drafted. Can run in parallel with Stage 1.

### Stage 3 — pass the instructor examination
Owner: **human**.

### Stage 4 — instructor permit
File **DBPR RE 3** under basis **[1010]**, with electronic fingerprints and $62.75. The other two
bases require a Florida broker's licence and are closed on current facts. Owner: human, then
**regulator**.

### Stage 5 — school permit
File **DBPR RE 5**, checking "Holder of a Florida Instructor's License" and giving the permit number
from Stage 4, with $109.00. Note the form's own rider: if the permitholder also teaches, they must
meet the school-instructor requirements — which, on this route, they already do, because the
instructor permit *is* that requirement. Owner: human, then **regulator**.

The Department may require fingerprints processed through the FBI and "shall make such investigation
... as it may deem necessary" (s. 475.451(2)). Not optional on the applicant's say-so.

### Stage 6 — register the instructor to the school
**DBPR RE 6**, "Add/Terminate – Instructor". This is what makes the instructor "registered with such
school" for Rule 61J2-3.008(5)(b), which is what lets the course publish the contact block the rule
requires. Owner: human.

### Stage 7 — course approval
File **DBPR RE 18**: Section III "Sales Associate Pre-Licensure" + "Distance", Section IV "NEW",
$0 for a permitted school.

Section V attachments for an initial approval:

| # | Attachment | Owner |
|---|---|---|
| 1 | Course timed outline — subjects, major topics, subtopics | build |
| 2 | **Learning objectives, three per hour** (3 × 60 = 180) | build |
| 3 | Course materials with an explanation of delivery method | build |
| 4 | DBPR RE 19 — *see open question 4* | — |
| 5 | DBPR RE 20 per instructor + resume — *"Providers Only"* | — |
| 6 | **Five** end-of-course examinations, distance only — *see open question 3* | build |
| 7 | An answer key per form, referencing the page numbers each question and answer rest on | build |

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
