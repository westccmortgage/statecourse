# Florida — primary text readings

Every Florida authority this build rests on, what was read, where the copy is held, and what it
turned out to say. Read dates are the dates the document was fetched and hashed; the hashes are in
`florida/frec-sources/source-inventory.json` and the claims taken from each source are in
`config/florida/regulatory-manifest.mjs`.

> **Phase 0 v2.** This document was revised after the first Phase 0 report was rejected. Two things
> changed materially: the school-permitholder eligibility conclusion was **wrong** and has been
> corrected (see "The permitholder question, corrected" below), and the DBPR application package —
> reported in v1 as unobtainable — was located, downloaded and read. The syllabus transcription was
> also rebuilt from the Department's text-layer copy rather than OCR.

> **Filing-package update, 1 September 2026.** DBPR now links a revised six-page RE 18, effective
> June 2026, from its Education page. That revision resolves two historical disagreements below:
> distance pre/post-licensing uses two final forms, while five applies only to distance continuing
> education; RE 19 and RE 20 are expressly provider-only. The legacy September-2017 form is retained
> as audit evidence but is blacklisted for filing. Rule 61-35.027 amendment monitoring remains open,
> so the Education-page-linked form must be rechecked at signature and submission.

**All of it was readable.** That is worth stating at the top because it is the single biggest
difference between Florida and Texas in this repository. Texas's two highest authorities could not
be opened at all — the Secretary of State moved the Administrative Code into a JavaScript portal and
`statutes.capitol.texas.gov` serves an application shell for every document path — and the Texas
manifest exists largely to record what could not be read. Florida's Legislature serves Chapter 475
as static HTML, and the Department of State serves every 61J2 rule and every document those rules
incorporate by reference, and the Division of Real Estate serves every application form and
checklist. **Fifty-one registered sources, fifty-one read.**

Which means the interesting findings here are not silences. They are disagreements — including two
places where the Department's own documents disagree with each other.

---

## The disagreements and their current disposition

The item-count question remains open; the current RE 18 closes the historical form-count and RE 19
questions. Nothing downstream may resurrect a superseded answer. The remaining questions and safe
pending behaviour are in `config/florida/assessment-architecture.mjs`. The owner sent them by scope
in two messages on 1 September 2026; exact transport metadata is in
`florida/submission/regulator-inquiries/transmission-log.md`.

### 1. How many items must the end-of-course examination contain?

Rule 61J2-3.008(4)(d), F.A.C. says the sales associate examination "shall contain at least 100
items, or 2 items per instruction hour." For this course those are not the same number:

| Reading | Items |
|---|---|
| the stated minimum, taken literally | 100 |
| 2 per instruction hour, over the 60 instruction hours | 120 |
| 2 per hour, over the 63 hours the course is defined in | 126 |

The 1.8-minute-per-item limit in the same paragraph looks as though it should settle this, and does
not. It is a **ceiling on time allowed** — "must not exceed the equivalent of 1.8 minutes per item"
— not an equality. The examination's own three 50-minute hours give 150 minutes, and 150 is under
the ceiling for all three counts (100 items allows 180, 120 allows 216, 126 allows 226.8). Every
reading passes, so the ceiling disambiguates nothing.

**What the broker sentence suggests — missed in v1.** Two sentences earlier the same paragraph says
the *broker* examination "shall contain at least 95 items ... or 2 items per instruction hour." The
Broker course is 72 hours, so the per-hour figure is at least 144 against a stated floor of 95. In
both sentences the flat number sits well below the per-hour number. If the multiplier governed, both
flat numbers would be dead letters. The natural reading is that "or" offers the school an
**alternative basis**, and a school meeting either has met the requirement.

That makes 100 a strong reading, but not a sufficiently risk-free conclusion for a filing package.
The same text still admits 120 and 126 operational readings, and DBPR has not answered the question
in writing. `config/florida/assessment-architecture.mjs` therefore keeps the count in
`ITEM_COUNT_QUESTION`, not in `REGULATORY_MINIMUM_CONFIRMED`.

**126 is StateCourse filing policy, not a settled legal minimum.** It is now
`STATECOURSE_CONSERVATIVE_POLICY`, configurable, and carries its own cost: 150 minutes across 126
items is 1.19 minutes per item against 1.50 at the 100-item candidate. Both sit under the ceiling;
the conservative choice is measurably tighter on students. A written DBPR answer can lower the
count through a controlled config change.

### 2. A rule cross-reference that does not resolve — *corrected in v2*

**Phase 0 v1 got this wrong, and the correction matters more than the defect.**

Section 475.451(2)(a), Fla. Stat., in full:

> "School permitholder" means the individual who is responsible for directing the overall operation
> of a proprietary real estate school. A school permitholder must be the holder of a license as a
> broker, either active or voluntarily inactive, **or must have passed an instructor's examination
> approved by the commission.** A school permitholder must also meet the requirements of a school
> instructor if actively engaged in teaching.

Rule 61J2-17.011(2), F.A.C., in full:

> (2) A person shall qualify to be a school permit holder by meeting the qualifications for practice
> set forth in Section 475.25(2)(a), F.S. The licensee must be a holder of a Florida Broker's
> license in order to satisfy the Broker license requirement in Section 475.25(2)(a), F.S.

**The defect stands.** Section 475.25(2) is the provision permitting revocation of a licence issued
through the commission's own mistake. It has no paragraph (a), and states no qualification for
practice. The provision the rule reaches for is s. 475.451(2)(a). The rule's cited rulemaking
authority — "475.05, 475.451(2)(b)1.b. FS." — is the *instructor* experience provision that
subsection (1) implements, and would not support narrowing the permitholder alternatives.

**But v1's conclusion from it was wrong.** v1 read the rule's second sentence as requiring a Florida
broker's licence of every permitholder, and reported that no StateCourse individual could sign an
application. Read again, the sentence is conditional and scoped: a licensee must hold a Florida
broker's licence *in order to satisfy the Broker license requirement*. It answers "which broker's
licence counts" — a Florida one, not an out-of-state one. It says nothing about an applicant who is
not satisfying the broker-licence requirement at all because they qualified by examination.

A rule cannot repeal a statute, and a non-resolving citation certainly cannot do it by accident.
Section 120.52(8)(c), Fla. Stat. makes a rule that enlarges, modifies or contravenes its enabling
law an invalid exercise of delegated legislative authority.

**And DBPR agrees.** This is the Department's own practice, not a clever reading against it —
see "The Department's own applications" below.

### 3. What is a pre-licence hardship?

Rule 61J2-3.008(4)(b)3.3 says pre-licensure courses "shall not be offered by correspondence methods,
except by reason of a hardship as defined by rule," and s. 475.17(2)(a)3, Fla. Stat. requires the
course to be made available by correspondence or other suitable means to a person who by reason of
hardship cannot attend or has no access to distance learning.

Rule 61J2-3.013, F.A.C. — the hardship rule — defines hardship for **post-licensing** education and
for **reactivation** education. It does not on its face define it for pre-licensing education.

**Planned pending an answer:** no hardship route is built or advertised.

---

## The statutes

Publisher: **Florida Legislature, Online Sunshine** (`leg.state.fl.us`), the Legislature's own
publication of the Florida Statutes. Held as the full chapter HTML; individual sections split out
under `florida/frec-sources/extracted/fs-475-sections/` for reading.

### Chapter 475, Part I — Real Estate Brokers, Sales Associates, Schools, and Appraisers

**s. 475.17(2)(a)1 — the hour ceiling.** "The course or courses required for one to become initially
licensed shall not exceed a total of 63 classroom hours of 50 minutes each, inclusive of
examination, for a sales associate." Also: "notice of satisfactory completion shall not be issued if
the student has absences in excess of 8 classroom hours."

**s. 475.17(2)(a)2 — the sentence that decides Florida's delivery architecture.** A distance learning
course is approved as an option to classroom hours. "However, satisfactory completion of a distance
learning course requires the satisfactory completion of a timed distance learning course
examination. **Such examination shall not be required to be monitored or given at a centralized
location.**"

So Florida does **not** require the pre-licence end-of-course examination to be proctored, and does
not require a test centre. It does require it to be **timed**. Note the authority carefully:
s. 455.2123, Fla. Stat. says a similar thing about *continuing* education and must never be cited
for this.

**s. 475.451 — schools teaching real estate practice.**

- (1) A permit from the department is required **before** commencing or continuing to offer a
  Commission-prescribed course. The exemption for colleges, universities, community colleges and
  career centers is limited to transferable college credit courses.
- (2)(a) School permitholder: the individual responsible for directing the overall operation. Broker
  licence (active or voluntarily inactive) or a Commission-approved instructor's examination. Must
  also meet the school instructor requirements if actively teaching.
- (2)(b)1 Instructor permit, by one of three routes: business-related bachelor's degree + valid
  Florida broker's licence; bachelor's degree + extensive real estate experience + valid Florida
  broker's licence; or passing a Commission-approved instructor's examination.
- (2)(b)3 Renewal requires at least 7 classroom or distance learning hours since the last issuance
  or renewal; permits renew at least every 2 years; an unrenewed permit reverts to involuntarily
  inactive.
- (2) The department may take fingerprints for FBI processing and shall investigate as it deems
  necessary.
- **(3) It is unlawful** to offer the courses without a permit, "or to guarantee that its pupils will
  pass any examinations required for licensure, or to represent that the issuance of a permit is any
  recommendation or endorsement."
- (4) Violation is a **misdemeanour of the second degree**.
- (6) A prescribed pre-licence course may be taught by distance learning **by a currently permitted
  instructor** of the school.
- (8) **Record retention, 3 years**: registration records, course rosters, attendance records, a file
  copy of each examination and progress test, and all student answer sheets — kept at least 3 years
  after the beginning of each course, and available to the department for inspection and copying.

**s. 475.4511 — advertising by real estate schools.** No statement, representation or act, oral,
written or visual, that the school knows or should know is "false, inaccurate, misleading, or
exaggerated." And, in (2): "Publicity and advertising of a real estate school, or of its
representative, shall be **based upon relevant facts and supported by evidence establishing their
truth**." (3) forbids promising or guaranteeing employment or placement as an inducement to enrol.

That second sentence is, almost word for word, the discipline this project already enforces with a
source lock — except that in Florida it is a statute. The source lock is not merely good practice
here; it is part of how the school stays lawful.

### Chapter 455 — Business and Professional Regulation: General Provisions

Held for one reason: so that **s. 455.2123** can be cited for what it is *not*. It requires distance
learning to be allowed for **continuing** education and forbids requiring centralized examinations
for it. It is not the authority for pre-licence examination siting. That is s. 475.17(2)(a)2.

---

## The rules

Publisher: **Florida Department of State, Division of Library and Information Services**
(`flrules.org`), the official publisher of the Florida Administrative Code.

A note on how these were obtained, because it matters for reproducing them. `flrules.org` does not
serve rule text at a stable URL: the address of the adopted text is a `readFile.asp` link carrying a
transaction id that changes every time the rule is amended, and that link appears only inside the
rule's own detail page. `scripts/florida-fetch-fac-rules.py` therefore does what a person would —
opens the rule page, finds the link the Department publishes there, and follows it. The Department
serves adopted rules as Word 97 files that LibreOffice in this environment refuses to load, so the
text was recovered with `strings`; that recovery method is recorded in the header of every extracted
file, and the `.doc` is held beside it.

### Rule 61J2-3.008 — Pre-licensing Education (effective 21 August 2022)

The centre of the whole Florida build.

- **(1)** Course I is **63 hours of 50 minutes each, inclusive of examination**, in the basic
  fundamentals of real estate principles and practices, basic real estate, and license law.
- **(4)(a)** "A grade of **70% or higher** on the Commission-prescribed end-of-course examination
  constitutes satisfactory course completion."
- **(4)(b)** The school submits course materials and end-of-course examinations, plus "a copy of the
  course, **and access to the course, in the format in which the course will be offered to the
  student**." Approval requires content covering the Commission's syllabus. Course I submissions for
  classes offered on or after 1 January 2023 are evaluated against the **January 1, 2023 revision,
  Ref-14599**. Significant changes need approval at least **60 days** in advance.
- **(4)(b)3 — the distance education criteria.** Hour per classroom hour. Interactive, with
  interchange of information between student and instructor. Registration, evaluation, monitoring
  and verification. Not by correspondence. Then a–j: technical processes that work; a continuity
  plan for primary system failure; **identity verification at enrolment, during participation, and
  at completion**; a **detailed course timeline available to students before enrolment**; **evidence
  by objective study that the stated hours match the actual hours**; a described objective method
  giving students only the allotted examination time; instructor and technical availability posted
  prominently; **conformance to and following the ORDER of the syllabus**, with learning objectives
  for each session and a described method of periodic assessment; **no hint, back or retry** on the
  examination and no student reaching it without completing all sessions; and the student's
  certification statement.
- **(4)(c)** Approval runs **24 months**. Renewal is applied for no more than **120 days** before
  expiry and must include the course materials, the end-of-course examinations, and a summary of
  updates. Students must be told the course number and expiration date **upon enrolment**.
- **(4)(d) — the examination.** At least **2 forms**; no more than **15%** shared items; a unique
  answer key per form; **each answer key referencing the page numbers** the item and its correct
  answer rest on; at least **70% application level**; no more than **10% knowledge level**; a
  sufficient question bank; at least 100 items or 2 per instruction hour; all items multiple choice
  with **4 choices**; **the examination order may not follow the course order**; items must not
  refer the student to the course material; overall time not to exceed **1.8 minutes per item**.
- **(5)(a)** Students informed of standards and requirements at commencement.
- **(5)(b)** For distance education, students get the **address, e-mail address and telephone number
  of a permitted instructor** registered with the school, and the times that instructor is available.
- **(6)** A failing student waits **at least 30 days** to retest and may retest **once** within a
  year of the original examination; otherwise the course must be repeated. A **different form** is
  administered on any retake or repeat.
- **(7)** Illness make-up may not extend more than 30 days beyond the scheduled examination without
  Commission approval.
- **(8)–(9)** Exempt: an active Florida Bar member in good standing who is otherwise qualified; an
  applicant with a 4-year or higher degree in real estate from an accredited institution.

The statement the rule puts in the student's mouth, quoted exactly, at (4)(b)3.j:

> I certify that I personally completed all assignments and have not duplicated any portion of the
> end-of-course examination prior to the taking of the final examination.

### Ref-14599 — FREC Sales Associate Course Syllabus (Course I), January 1, 2023

Not a document *about* the rule. Rule 61J2-3.008(4)(b) **incorporates it by reference**, so it is
part of the rule.

A 59-page scan with no text layer. Section titles were read by eye from its table of contents; the
learning objectives were recovered by OCR and are recorded as **unverified** in
`config/florida/frec-course-i-syllabus.mjs` until a person reads them against the PDF.

Nineteen sections. The order is a compliance property under 61J2-3.008(4)(b)3.h, not an editorial
preference — a Florida course that teaches the right topics in a better sequence is a non-conforming
course.

**The syllabus allocates no hours to any section.** Its only timing instruction is on page 2:

> Section times are not required to be three hours in duration provided the overall course is
> 60-hours of instruction with 3-hour end-of-course examination. Allocate your time based upon the
> complexity of the material.

That single sentence reconciles the whole hour architecture, and only one way. 60 × 50 = 3,000
minutes of instruction, 3 × 50 = 150 minutes of examination, 3,150 in total — exactly 63 × 50, with
nothing left over. Read the examination as three *clock* hours instead and the course becomes 3,180
minutes, which is 63.6 fifty-minute hours and breaches the s. 475.17(2)(a)1 ceiling. The 50-minute
reading is not a preference; it is the only reading under which the Commission's syllabus and the
Legislature's cap can both be true.

Section 19 is titled "Planning, And Zoning" in the table of contents and "PLANNING, ZONING AND
ENVIRONMENTAL HAZARDS" on the section itself. Both are recorded. It is not this build's place to
decide which the Commission meant.

### Rule 61J2-3.012 — Equivalency (effective 24 December 2017)

Prior coursework covering substantially the same subject matter, classroom hours and completion
standards is deemed satisfactory completion.

### Rule 61J2-3.013 — Hardship Cases (effective 17 January 2016)

Defines hardship for post-licensing and reactivation education. See disagreement 3 above.

### Rule 61J2-3.015 — Notices of Satisfactory Course Completion (effective 9 February 2023)

The certificate is the course's actual output — s. 61J2-3.015(1) makes it what the candidate
presents at the state examination.

Course I certificate fields, in the Commission's order: Name of School, School License Number,
Address of School, Course Title: Course I, Course Number, Start Date, Finish Date, Exam Date,
Student Name, Student Address, Authorized Signature for the School.

Every certificate carries, at (6)(f):

> The student named in this certificate has completed the referenced course in accordance with the
> requirements of the Florida Real Estate Commission. The original course completion certificate is
> to be given to the student and a copy retained by the school for a minimum of five (5) years
> following the date the course was completed.

(5) permits **electronic delivery to the student**; (7) permits the school's copy to be kept in any
readily retrievable electronic or digital format. Florida does not force paper here.

Note the **two different retention periods**: 5 years for the completion certificate under this
rule, 3 years for rosters, attendance, examination copies and answer sheets under s. 475.451(8).

### Rule 61J2-17.011 — School Instructor and Permit Holder Requirements (effective 1 January 2023)

(1) "Extensive real estate experience" means a minimum of **three years full-time as a broker**,
including participating in closing **at least five real estate transactions** as a licensee or as the
employing broker, **within the 12 months immediately preceding** the instructor application.

(2) The school permit holder must hold a **Florida** broker's licence. See disagreement 2 above.

### Rule 61J2-17.013 — Interpretation of Particular Phrases (effective 30 June 2022)

Two constructions that bite.

"To guarantee that its pupils will pass any examinations required for licensure," prohibited by
s. 475.451(3), "shall be construed to include, but without limitation, any representation,
agreement, promise or understanding whereby a person enrolled in any school or course is to receive
**any refund of money or other thing of value if such person should fail** the examination offered
by the Department." A pass-or-refund promise is a prohibited guarantee — and that is the shape a
marketing page reaches for first.

"Each person, school, or institution" in s. 475.451(1) means **one address or location**; a permit is
required for each.

### Rule 61J2-17.014 — Guest Lecturers (effective 30 June 2022)

Held; nothing in this build rests on it.

### Rule 61J2-17.015 — Required Communication by School Permit Holders (effective 3 November 2021)

(1) No recruiting for any brokerage firm during instructional time. (2) The permit holder must post
in every classroom and administrative area, and **read at the beginning of each course**:

> Recruiting for employment opportunities for any real estate brokerage firm must be accomplished
> outside the prescribed instructional time. Noncompliance should be reported to the Commission.

**(3) This rule expires on 31 December 2026** unless the Commission reviews it and acts. A Florida
build shipping after that date must re-read it rather than assume it survived.

### Rule 61J2-17.016 — Renewal of Instructor Permits (effective 30 June 2022)

Biennial renewal on the Rule 61-6.001 schedule. Unrenewed permits go involuntarily inactive and
expire after 2 years.

---

### 4. Two end-of-course examinations — historical conflict closed

The old application disagreed with the rule and checklist. The current Education-page-linked RE 18
now distinguishes course types and closes the issue for Course I.

| Document | Says |
|---|---|
| Rule 61J2-3.008(4)(d), F.A.C. | "The school shall develop **at least 2 forms**" |
| FREC Distance Education Checklist (rev. 06/2018) | "**Two** end of course examinations (multiple choice) and answer keys" |
| Legacy RE 18, Section V — **do not file** | "**Five** end of course examinations (for distance education courses only)" |
| Current RE 18, effective Jun 2026 | **Two** for distance pre/post-licensing; five only for distance continuing education |

StateCourse builds two 126-item forms. The two-form requirement is settled by the controlling rule
and the current application; only the per-form item count remains open.

### 5. Must a permitted school also file DBPR RE 19? — closed

The current RE 18 expressly labels both RE 19 and RE 20 "for Providers Only." StateCourse is filing
Course I as a permitted school, not as a continuing-education provider, so neither form belongs in
the school submission package. The legacy ambiguity must not be carried forward.

---

## The Department's own applications

Obtained in v2 from `https://www2.myfloridalicense.com/real-estate-commission/forms-and-publications/`
and `.../education/`. Every DBPR RE form is adopted by **Rule 61-35.027, F.A.C., "Real Estate
Forms"**, and each form's header states that incorporation, so the numbers below are traceable to a
rule rather than to memory.

| Form | Title on the form | Effective | Fee |
|---|---|---|---|
| DBPR RE 3 | Application for Real Estate Instructor Permit | Nov 2015 | $62.75 |
| DBPR RE 5 | Application for School Permit | May 2019 | $109.00 |
| DBPR RE 6 | School Change of Status Transactions | — | — |
| DBPR RE 9 | Application for Additional School Location | Jun 2015 | $50.00 to open |
| DBPR RE 18 | Education Course Approval Application | Jun 2026 | $0 for schools |
| DBPR RE 19 | FREC Continuing Education Provider Approval Application | — | provider-only; excluded here |
| DBPR RE 20 | FREC Request for Instructor Evaluation | — | provider-only; excluded here |

### The permitholder question, corrected

Three of the Department's instruments carry the statutory alternative on their face. This is what
settles disagreement 2 above.

**DBPR RE 5, Section I — "METHOD OF QUALIFICATION":**

> Qualified to hold school permit through:
> ☐ Holding a license as a Florida Broker, either active or voluntarily inactive
>   — Florida Broker License Number ______
> **or**
> ☐ Holder of a Florida Instructor's License
>   — Instructor Permit Number ______
>
> Note: If permit holder is also teaching, the applicant must meet requirements of school instructor.

**DBPR RE 6, Change of School Permit Holder:**

> Qualified to hold school permit through: ☐ Holding a license as a broker, either active or
> voluntarily inactive, or; ☐ **Passing the Instructors Exam**

**DBPR RE 3, Section I — "CHECK BASIS FOR INSTRUCTOR QUALIFICATION":**

> ☐ **Real Estate Instructor Exam [1010]**
> ☐ Specific Degree & Broker's License [1030]
> ☐ Degree, Extensive Experience, & Broker's License [1040]

Basis [1010] requires no broker licence at all. And DBPR's own *Real Estate School Instructor
Requirements* sheet lists the same three routes, the third being "Pass an Instructor Examination
approved by the FREC."

**The consequence.** There is a statutory and form-supported route for StateCourse that does not
require a Florida broker's licence: file DBPR RE 3 under basis [1010] → complete Livescan after
filing → receive DBPR examination authorization → pass the Commission-approved instructor
examination at a Pearson physical test center → DBPR issues the instructor number → file DBPR RE 5
→ school permit → register/activate the instructor through RE 6. Because current rule wording may
create operational rejection risk, DBPR acceptance of the route is a high-priority written
confirmation, not a guarantee. Nothing along it has been done, and no person is asserted eligible.
The status matrix is in
`config/florida/school-permit-ledger.mjs`.

### What RE 18 requires for an initial Course I approval

Section III carries **"Sales Associate Pre-Licensure"** and **"Distance"**, so the current RE 18
governs Course I. Section V, initial approvals:

1. Course timed outline — subjects, major topics, subtopics
2. **Learning objectives — three per hour**
3. Course materials including explanation of delivery method
4. Education Provider Approval Application DBPR RE 19 *(Providers Only — excluded for this school)*
5. Instructor information on DBPR RE 20 with a resume *(Providers Only — excluded for this school)*
7. **Two end-of-course examinations** *(distance pre/post-licensing)*
8. Answer keys referencing the page numbers each question and answer rest on

The three-objectives-per-hour requirement is worth pausing on: 3 × 60 instruction hours = **180**,
which is exactly the number of learning objectives the Commission's own syllabus carries. The
syllabus and the application form agree, which is a stronger check on the transcription than either
alone.

---

## Remaining acquisition and operational gaps

Recorded because a gap nobody wrote down is a gap the next reader assumes was checked.

**~~The application forms.~~ Obtained in v2.** Recorded here because *how* v1 missed them is the
lesson. v1 fetched `https://www2.myfloridalicense.com/real-estate/forms/`, received **HTTP 200**,
and concluded the Department published no forms. That URL is a **soft-404** — it serves the
**Elevator Safety** forms page. Several sibling URLs return 200 with byte-identical navigation
shells. *A 200 is not evidence that the page you asked for exists.* Both the wrong page and the
right ones are now held, so the next reader can see the trap.

**The instructor examination fee and candidate-specific scheduling.** The current DBPR Candidate
Information Booklet is now held. It confirms a closed-book, 100-question, 3.5-hour physical Pearson
test-center examination with a 75-point passing score after DBPR authorization. The current live fee
and the candidate's available test center remain external; the staged Pearson inquiry requests
both. A 2017 amount must not be presented as current.

**A verification path through DBPR's own records.** The Department's public licensee search at
`myfloridalicense.com/wl11.asp` timed out on every attempt from this environment. No numbered walk
through its screens has been written, for the same reason the California file gives: describing a
search nobody ran against a real record would defeat the purpose of publishing one.

---

## Rule chapters surveyed and set aside

The full 61J2 division was enumerated from the Department's own chapter index so that the two
relevant chapters were chosen rather than assumed: 61J2-1 Registration Details and Fee Structure;
61J2-2 Individual Applicant's Examination Rules; **61J2-3 Minimum Educational Requirements**; 61J2-4
Partnership; 61J2-5 Corporations; 61J2-6 Salespersons; 61J2-9 Reissuance of Certificate; 61J2-10
Operation, Business and Offices; 61J2-14 Funds Entrusted to Brokers; 61J2-16 Definitions and
Interpretations; **61J2-17 Real Estate School Administrative Procedures and Regulations**; 61J2-20
and 61J2-25 Internal Organization and Operation; 61J2-22 Real Estate Recovery Fund; 61J2-23
Time-Share Sales; 61J2-24 Disciplinary Matters; 61J2-26 Nonresident Licensure.

Rules 61J2-3.016 (Video Tape Quality Standards) and 61J2-3.017 (Video Tape Classroom Viewing
Conditions) are **repealed** — 2008, both. Florida has no surviving media-quality rule for
pre-licence courses. Video planning is therefore governed by the general distance-education criteria
in 61J2-3.008(4)(b)3 and by StateCourse's own product rules, not by a media standard.
