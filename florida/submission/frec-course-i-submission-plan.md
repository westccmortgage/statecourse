# FREC Course I — submission plan

What Florida requires before StateCourse can offer a Course I, in the order it has to happen, with
an honest account of what is not yet knowable.

This is a **plan**, not a filing. Nothing has been submitted, no application has been started, and
no Florida credential is held. `config/florida/school-permit-ledger.mjs` carries the machine-checked
version of everything below; `florida/regulatory/primary-text-readings.md` carries the readings the
requirements come from.

---

## The shape of the problem

Most provider approvals are a paperwork problem. Florida's is a **person** problem first, and the
paperwork only becomes reachable after that is solved.

Rule 61J2-17.011(2), F.A.C. says the school permit holder "must be a holder of a Florida Broker's
license." StateCourse's principal holds California broker licence 01385024 and no Florida licence.
So today there is no individual who can be named as school permit holder on a Florida application.
No amount of build work moves that, and no other step is worth sequencing ahead of it.

The second gate is close behind. Section 475.451(6), Fla. Stat. requires a Commission-prescribed
pre-licence course delivered by distance learning to be taught by a **currently permitted
instructor** of the school, and Rule 61J2-3.008(5)(b) requires the course to publish that
instructor's address, e-mail address and telephone number along with the times they are available to
assist students. An asynchronous Florida course therefore cannot be delivered — and cannot even
render the contact block the rule requires — until a permitted instructor is registered.

Both gates are recorded in `BLOCKING_GATES` with the routes out of each. Neither is resolved.

---

## Stage 0 — resolve the person gates

**Owner: human. Nothing downstream can start.**

1. **School permit holder.** One of:
   - the principal obtains a Florida broker's licence in their own right;
   - a Florida-licensed broker is engaged and named as school permit holder; or
   - FREC confirms in writing that s. 475.451(2)(a)'s statutory alternative — passing a
     Commission-approved instructor's examination — remains open to a school permit holder despite
     the narrower wording of Rule 61J2-17.011(2).

   The third route is worth asking about rather than assuming closed, because the rule that appears
   to close it contains a citation that does not resolve. It sends the reader to "Section
   475.25(2)(a), F.S." for qualifications for practice; s. 475.25(2) is the provision allowing a
   licence to be revoked for the commission's own mistake, and has no such paragraph.

2. **Permitted instructor.** A person qualifying under one of the three routes in
   s. 475.451(2)(b)1 — business-related bachelor's degree plus a Florida broker's licence; bachelor's
   degree plus extensive real estate experience plus a Florida broker's licence; or a
   Commission-approved instructor's examination. Rule 61J2-17.011(1) makes "extensive" concrete:
   three years full-time as a broker, including participation in closing at least five transactions
   within the **12 months immediately preceding** the application. That last clause means the route
   can lapse for someone who once qualified, so timing matters.

The instructor's examination route is the only one of the three that does not require a Florida
broker's licence. If it is available for the permit holder as well, it collapses both gates into one
examination.

---

## Stage 1 — the written questions to FREC

**Owner: human, but the questions are drafted here.**

Five things Florida's own rules do not settle. Each is carried in
`config/florida/course-i-requirements.mjs` as an open question with what is planned pending an
answer, so that no downstream consumer can treat a working assumption as a decided fact.

1. **Examination item count.** Rule 61J2-3.008(4)(d) requires "at least 100 items, or 2 items per
   instruction hour." Is the floor 100, or 120 (two per instruction hour over 60), or 126 (two per
   hour over 63)? The 1.8-minute-per-item limit does not settle it — it is a ceiling on time, and
   150 minutes is under the ceiling for all three counts. *Planned pending an answer: 126 items,
   the highest floor, since "at least" permits exceeding any of them.*

2. **School permit holder qualification.** The Rule 61J2-17.011(2) cross-reference to s. 475.25(2)(a)
   and whether the statutory instructor's-examination alternative survives.

3. **Absence in a distance course.** Section 475.17(2)(a)1 bars a completion notice where the student
   has absences exceeding 8 classroom hours, and Rule 61J2-3.008(4)(a) makes the same ceiling a
   condition of administering the examination. In an asynchronous course there is no class to be
   absent from. How does the Commission measure it? *Planned pending an answer: track delivered
   instructional time per student and treat undelivered time as the analogue.*

4. **Pre-licence hardship.** Rule 61J2-3.008(4)(b)3.3 allows a correspondence route "by reason of a
   hardship as defined by rule" and s. 475.17(2)(a)3 requires the route to exist, but Rule
   61J2-3.013 defines hardship only for post-licensing and reactivation education. *Planned pending
   an answer: no hardship route is built or advertised.*

5. **Posting and reading in a school with no classroom.** Rule 61J2-17.015(2) requires the
   anti-recruiting statement to be posted "in every classroom and administrative area" and read at
   the beginning of each course; Rule 61J2-3.008(4)(b)3.g requires instructor availability to be
   "posted in a prominent location." What satisfies both for an online school? *Planned pending an
   answer: surface both at course start and in a persistent, reachable place inside the course
   itself — not a footer.*

A sixth, administrative: **which DBPR form** applies for the school permit and the instructor
permit, and what each requires. See "What could not be obtained" below.

---

## Stage 2 — the school permit

**Owner: regulator, on a human's application. Cannot start before Stage 0.**

From s. 475.451, Fla. Stat. and Rule 61J2-17:

- A permit from the Department, obtained **before** offering or conducting the course. Offering
  without one is a second-degree misdemeanour under s. 475.451(4).
- A named school permit holder who directs the overall operation and holds a Florida broker's
  licence, and who also meets the school instructor requirements if actively teaching.
- The permit holder meets the s. 475.17(1) qualifications for practice: at least 18, high school
  diploma or equivalent, honest, truthful, trustworthy, of good character, and of good reputation
  for fair dealing.
- Character investigation, including fingerprints processed through the FBI if the Department
  requires them. The Department "may" require them and "shall" investigate as it deems necessary —
  not optional on the applicant's say-so.
- **One permit per address or location** (Rule 61J2-17.013). What that means for a school with no
  Florida classroom — whether the permit attaches to the out-of-state address of record — is an open
  question for FREC.

---

## Stage 3 — the instructor permit

**Owner: regulator, on a human's application.**

One of the three routes above, plus, on an ongoing basis (s. 475.451(2)(b)3; Rules 61J2-17.016 and
61J2-3.011):

- biennial renewal on the Rule 61-6.001 schedule;
- at least **7 classroom or distance learning hours** in real estate subjects or instructional
  techniques since the last issuance or renewal;
- an unrenewed permit reverts to involuntarily inactive and expires after 2 years of inactivity.

---

## Stage 4 — the course submission

**Owner: build, mostly. This is the part this repository can actually produce — and the part that
must not be started as curriculum until authoring is authorised.**

Rule 61J2-3.008(4)(b) requires the school to submit:

- the **course materials**;
- the **end-of-course examinations** — at least two forms, satisfying every constraint in (4)(d);
- **a copy of the course, and access to the course, in the format in which it will be offered to the
  student.**

That third item deserves emphasis because it is easy to under-read. It is not a PDF of the course.
It is a working reviewer account against the real delivery. It is a build deliverable and a real
one, and it is the same shape as the reviewer surfaces this project already produces for other
jurisdictions.

Alongside those, the distance-education criteria in (4)(b)3 each need an artifact:

| Requirement | Cite | Artifact |
|---|---|---|
| Detailed course timeline, published before enrolment | 3.d | timeline document + a pre-enrolment surface |
| Objective study that stated hours are actual hours | 3.e | time study |
| Objective method giving only the allotted examination time | 3.f | described control + evidence it works |
| Identity verified at enrolment, during participation, at completion | 3.c | policy + technical description |
| Continuity plan for primary system failure | 3.b | operational plan |
| Instructor and technical availability, posted prominently | 3.g | a real surface in the course |
| Conformance to and order of the syllabus, objectives per session | 3.h | the curriculum itself |
| Method of periodic assessment described | 3.h | assessment design document |
| No hint, back or retry; duplication prevented | 3.i | examination engine behaviour + evidence |
| No examination without all sessions completed | 3.i | progression gate |
| Student certification statement | 3.j | a real control before the examination opens |

**The ordering constraint that shapes everything.** Rule 61J2-3.008(4)(d) requires each answer key to
"reference the page number(s) containing the information upon which each question and correct answer
is based." An item cannot cite a page that does not exist yet, so **the examination cannot be built
before the curriculum is written and paginated.** Any plan that runs curriculum and examination
authoring in parallel will produce an answer key that cannot be completed.

---

## Stage 5 — after approval, which is not the end

Rule 61J2-3.008(4)(c) makes a Florida course a maintained thing rather than a delivered one:

- approval runs **24 months**;
- renewal is applied for **no more than 120 days** before expiry, and must include the course
  materials, the end-of-course examinations, and a summary of what was updated;
- a school may grade an examination within **15 days** after expiry if it received the materials on
  or before the expiry date;
- **students must be told the course number and the course expiration date upon enrolment** — a real
  surface, not a footnote;
- any **significant change** to an approved course needs Commission approval **at least 60 days**
  before it is implemented;
- as a **primary school** — one that develops its own material, which is what StateCourse would be —
  courses are resubmitted for evaluation **every new edition**, and in no event more than **four
  years** after original approval.

And two record-retention obligations that begin at the first enrolment and are **different from each
other**:

- **5 years** — a copy of each course completion certificate (Rule 61J2-3.015(6)(f)); may be kept in
  any readily retrievable electronic or digital format.
- **3 years** — registration records, course rosters, attendance records, a file copy of each
  examination and progress test, and all student answer sheets (s. 475.451(8), Fla. Stat.),
  available to the Department for inspection and copying.

---

## What could not be obtained, and why nothing was invented in its place

**The application forms.** The DBPR real estate schools page was fetched and is held at
`florida/frec-sources/dbpr/dbpr-real-estate-schools.html`. It turned out to be a navigation shell
whose content is assembled client-side; it carries no application, no form number, and no fee
schedule. The Department's public licensee search timed out on every attempt.

So **no DBPR form number appears anywhere in this Florida build**, and the permit ledger reports
itself as unverified against the application. It is a floor built from the statute and the rules, not
a transcription of the paperwork. A plausible-looking form number would be worse than none: it is
exactly the kind of confident detail that survives review because it looks as though somebody
checked it.

Obtaining the forms — by telephone to the Division of Real Estate, or from the Commission's office
at 400 W. Robinson Street, #N801, Orlando, Florida 32801, the address Rule 61J2-3.008(4)(b) itself
gives for obtaining the syllabi — is a Stage 1 human task.

---

## What StateCourse may say about Florida in the meantime

Nothing that asserts a credential it does not hold. That is not house style here; it is
s. 475.4511(2), Fla. Stat., which requires a school's publicity to be "based upon relevant facts and
supported by evidence establishing their truth," and s. 475.451(3), which makes several specific
representations unlawful outright.

`FORBIDDEN_CLAIMS` in `config/florida/regulatory-manifest.mjs` encodes the prohibitions, and
`scripts/florida-source-lock.mjs` fails the build if one appears in an artifact StateCourse
publishes in its own voice. The public state registry record for Florida reads "Coming Soon" with no
approval number, and `tests/florida-foundation.test.mjs` fails if that changes while no credential is
held.
