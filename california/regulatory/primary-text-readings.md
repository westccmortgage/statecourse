# California — primary text read directly

**Read:** the Department of Real Estate's own published forms and handbook, held in
`california/dre-sources/` with their extracted text in `california/dre-sources/extracted/`.
Recorded 2026-08-21.

This file exists because every other state in this project has one and California did not. It says
what was read, what it says, and — the part that matters most for a reviewer — **what was not read,
and is therefore stated nowhere in this build.**

**One finding governs everything below and should be read before anything else.** The California
build is **386,565 instructional words across three 45-hour courses**, and **exactly one of its 45
lesson assignments cites a California statutory or regulatory section.** Everywhere else in the
curriculum, the only four- and five-digit numbers are calendar years and arithmetic. That is not an
oversight to be tidied away; it is the shape of the build, and section 8 explains what follows from
it.

**The exception is Real Estate Practice, Assignment 14** — the SB 1495 implicit bias and fair
housing practicum. SB 1495 requires that course to cover **federal and state** fair housing law, and
a state-law component that named no California statute would not be one. So six texts were read in
full on 22 August 2026 and are cited there: **42 U.S.C. § 3604**, **Government Code § 12955**,
**Civil Code § 51**, **Health and Safety Code § 35801**, **Business and Professions Code
§ 10177(l)**, and the Department's own **SB 1495 FAQ**. Section 8 lists them with what was taken
from each.

**The rule this establishes, and which a test enforces:** every statutory section cited anywhere in
the California curriculum must be one this register records as read in its own text. A citation
that is not on that list is a claim about law nobody here has read, and the build has none.

---

## 1. The regulation itself — 10 CCR Article 24, via RE 307

**RE 307 (Rev. 7/18), *Regulation Excerpts (Private Vocational Schools)*, is the only primary
regulatory TEXT this project obtained for California.** It carries **Commissioner's Regulations
§§ 3000, 3002 and 3003** in full.

### § 3000(a) — the equivalence criteria

The Commissioner decides under **B&P Code § 10153.5** whether a private vocational school's course
is *"equivalent in quality to real estate courses offered by colleges and universities accredited by
the **Western Association of Schools and Colleges**"*, and *"shall consider, but shall not be limited
to"* these criteria:

> **(1)** *"An attended course must provide **at least 45 periods of classroom instruction, each of
> which shall be not less than 50 minutes duration.** **A correspondence course shall consist of not
> less than 15 separate lesson assignments.**"*
>
> **(2)(B)** *"A correspondence course must provide for a **final examination administered and
> supervised by a person designated by the school** for that purpose. **The school shall send the
> final examination materials to the person so designated and the completed final examination shall
> be returned to the school by the person so designated.**"*
>
> **(3)** The school must provide **instructors, instructional material and classroom facilities
> adequate to achieve the objective of the course** offered.
>
> **(4)** *"The school shall **maintain records for each student sufficient to allow for the
> preparation of a duplicate certificate upon request by a student.**"*
>
> **(5)** *"The school shall **not use advertising or other promotional devices that are deceptive or
> misleading.**"*
>
> **(6)** *"The school shall, **within 15 days of a student's successful completion** of the course,
> deliver a document to the student evidencing such completion"*, containing the **DRE course
> approval number**, the **name of student**, the **course title**, the **dates of course
> completion**, and the **name and address of school**.
>
> **(7)** *"The school shall have an **appropriate method of assessing student knowledge** of the
> subject, such as, but not limited to, **multiple choice, essay or oral examinations.**"*
>
> **(8)** Instructors must hold **credentials issued by the Board of Governors of the California
> Community Colleges or by a comparable California teacher-credentialing agency**, or meet the
> qualifications in **Title 5 §§ 53400 et seq.** The Commissioner may approve an instructor who in
> his or her judgment meets the qualifications or otherwise evidences teaching qualifications by
> education, experience, or a combination. **An instructor shall not teach** if the instructor does
> not satisfy the criteria, **has violated Article 24 or acted in a way warranting denial or
> withdrawal of course approval**, **has had a real estate licence suspended, revoked or restricted
> as a result of disciplinary action**, or **acted in a manner that would have warranted denial of a
> real estate licence application.**
>
> **(9)** From **1 January 2004**, the school shall **notify each student that an evaluation form is
> available on the Department's website** for online evaluation of courses and instructors.

**§ 3000(b)** provides that *"the **simultaneous instruction of two or more students** in one of the
courses enumerated in Sections 10153.2, 10153.3 or 10153.4 of the Code **constitutes a 'private
vocational school'**"* under § 10153.5. **This is the provision that makes StateCourse a private
vocational school in California**, and everything else in Article 24 follows from it.

### § 3002 — application, and what a material change is

The application goes on a Department form with the fee, and must include the applicant's name,
address and telephone; and a summary of the course carrying the **type** (resident lecture or
correspondence/independent study), the **title**, a **complete course outline or syllabus with time
schedule indicating total number of hours**, the **textbooks and student materials prescribed**, and
**evidence of private vocational school approval or registration** (or of the equivalent authority
in the state where the school is located).

> **(b)** *"**Any material change to an approved equivalent course of study shall be submitted by the
> school to the Department for approval PRIOR TO USE.** A material change ... is **a deviation from
> an equivalent course of study approved by the Department, including a change in curriculum, course
> length, workbooks, texts or syllabi**, but **not including changes designed exclusively to reflect
> recent changes in statutes, regulations or decisional law.**"*

**§ 3002(c)** takes the fee from **B&P Code § 10209**, which was **not read** — the figure this
project holds comes from RE 206E, below.

### § 3003 — course disapproval

The Commissioner may withdraw approval where a course previously approved as equivalent is **no
longer equivalent in quality** to courses offered by WASC-accredited colleges and universities.

---

## 2. RE 303 — the pre-license course approval packet, and the rules a build must satisfy

### The final examination

> *"Final exams are **required for all courses**. The **passing score must be 60% or greater** and
> the final exam must reflect **comprehensive coverage of the entire course**, consisting of **not
> less than 100 multiple choice or fill-in questions**.
>
> An offering **may include a provision for ONE retake of a DIFFERENT final examination** by a
> student who failed the original final examination **provided the questions in the reexamination are
> different questions than those contained in the original examination.** **A student who fails the
> re-examination cannot receive credit for the course.** The student is not barred from enrolling and
> completing the same course but **must retake the course** and pass the final examination ...
>
> ... **The exam administrator or proctor cannot be related by blood, marriage, domestic
> partnership, or any other relationship (i.e. future responsible broker) to the person taking the
> exam** which would influence them from properly administering the exam. **Under no circumstances
> shall the final exam be furnished directly to the students.**"*

A copy of the **instructor's version with an answer key keyed to the course material**, and a copy of
the **student's version**, must both be submitted for approval.

**Every constant in `config/california-course-engine.mjs` traces here:** `FINAL_PASSING_PERCENT = 60`,
`FINAL_QUESTION_COUNT = 100`, `maxFinalAttempts: 2`, and the two forms A and B, which exist because a
retake must be *"different questions than those contained in the original examination."*

### Student enrolment timing

> *"1. Schools **may not offer a single correspondence course that is to be completed in less than 2½
> weeks.** **This rule applies regardless of the number of schools the student is taking courses
> from.**
> 2. **No more than two courses may be completed in a five-week period.**"*

| Number of courses | Minimum completion time |
|---|---|
| 1 | 2½ weeks |
| 2 | 5 weeks |
| 4 | 10 weeks |
| 6 | 15 weeks |
| 8 | 20 weeks |

> *"\* The time **from the date the student receives access to the course material** to **the date the
> final exam is successfully passed.**"*

**The measurement window is the Department's, not a choice.** It runs from access to passed final,
not from payment and not from first login. `database/004_california_prelicense.sql` models the single
course as **420 hours** — 17½ days — and the cross-course rule as **two courses in a 35-day window**,
both cited to RE 303 p.3.

**Because the rule applies across schools, a school cannot verify it from its own records alone.**
The build therefore requires a student attestation as to outside coursework
(`outside_school_attestation_required`). **That mechanism is a StateCourse decision, not a
Department requirement**, and no document read here prescribes how a school is to police the rule.

### Completion deadline, and material change

> *"**All courses shall require completion within one year from the date of registration.**"*

RE 303 states the material-change rule more fully than § 3002 does: a material change *"including but
not limited to a change in curriculum, course length, **method of presentation**, workbooks, texts or
syllabus"* — and **including a change in school ownership or provider name** — **requires a new course
application and fee for review prior to implementation.** Changes made **exclusively** to reflect
recent changes in statutes, regulations or decisional law **must still be submitted**, but **without a
new application or fee.**

### Student identification

Acceptable identification is **current identification issued by a governmental agency**, or
**current identification from a recognised real-estate-related trade organisation issued within the
immediately preceding five years bearing a photograph, signature and identification number of the
participant.**

---

## 3. The Course Provider Handbook (Rev. 01/2026)

The Handbook restates § 3000 for providers and adds the operative certificate rule.

**A correspondence course** — the Handbook's term includes *"courses presented via the internet or
mobile device app"*, which is what this build is — **must have at least 15 separate lesson
assignments**; must provide instructors and instructional material adequate to the objective, with
**instructors available to students even if the course is self-guided**; must provide the
proctor-administered final described above; and **within 15 days of successful completion** must
deliver a certificate carrying the **DRE course approval number**, the **student's name**, the
**course title and hours**, the **dates of registration and completion**, the **school name, address
and telephone number**, the **printed name and signature of the verifier**, and a **certifying
statement**: *"Successfully completed the correspondence/home study course and passed the final exam
with a passing score of 60% or better."*

**The record rule is stated in an unusual form and is quoted here exactly because of it:**

> *"Must maintain records for each student sufficient to allow for the preparation of a duplicate
> certificate upon request by a student. **This means as long as the school is in business, the
> school must furnish a certificate to the student upon request.**"*

**California therefore states no retention PERIOD.** The obligation is open-ended and tied to the
school's existence. **No number of years appears anywhere in this build for California**, and none
may be added without a source that states one.

### SB 1495 — the practice course only

> *"Effective **January 1, 2024**, pursuant to **Senate Bill 1495**, **all real estate practice
> courses** must contain the following course content:
> • A component on **implicit bias**, including education regarding the impact of implicit bias,
> explicit bias, and **systemic bias** on consumers, **the historical and social impacts of those
> biases**, and **actionable steps students can take to recognize and address their own implicit
> biases.**
> • A component on **federal and state fair housing laws** as those laws apply to the practice of
> real estate. **The fair housing component shall include an INTERACTIVE PARTICIPATORY COMPONENT,
> during which the applicant shall ROLE PLAY as both a consumer and real estate professional.**"*

**This attaches to Real Estate Practice and to no other course**, and a practice-course certificate
*"should indicate that the course is 'Compliant with SB 1495'."* The database records
`sb1495_participatory_component: true` for the practice course alone.

**The text of SB 1495 itself, and the Business and Professions Code section it enacted, were NOT
read.** What is recorded above is the Department's statement of the requirement in its own Handbook.

### The approval packet

The Handbook lists what a statutory/pre-license course application requires: the completed **RE 306**;
corporation documents as filed with the Secretary of State; a fictitious business name statement if
applicable; **RE 304** (consent to service of process) if the school is out of state; **copies of all
student instructional materials and copyright authorisations**; a **textbook certification letter from
a college or university professor**; **RE 336** instructor certification with supporting
documentation; a **general information page** on the **RE 313** template; a **timed course outline**;
**student final exam instructions**; **exam proctor/monitor instructions**; the **student version of
the final exam**; the **instructor version with answer key**; **student AND regulator log-in and
password** for online courses; and the **RE 311** completion certificate template.

**All signatures must be original or eSignatures — *"digital or rubber-stamp signatures will not be
accepted."***

---

## 4. RE 336 — instructor certification criteria

Beyond the § 3000(a)(8) credential rule, RE 336 states the floor:

> *"The **minimum qualifications are a Bachelor's Degree (with any major) and two years of
> professional experience**, or **any associate degree and six years of professional experience in
> the real estate profession.**"*

The form is **one per instructor**, is signed **under penalty of perjury**, and certifies that all
instructors presenting the course meet the criteria **in Commissioner's Regulations 3000 through
3004**. **Regulation 3001 and Regulation 3004 were not obtained** — RE 307 carries 3000, 3002 and
3003 only.

---

## 5. RE 206E — the fee schedule, as the Department publishes it

> **Prelicense Course — $500.**
> CE Course 1 to 2 hours — $500. CE Course 3 hours — $750. Additional hour over the 3rd hour — $100
> per hour.

Payment by **cashier's check, money order, check or credit card**, payable to the Department of Real
Estate; **credit card payments require RE 909**; **cash is not accepted.**

**This is the only fee figure stated anywhere in the California build, it is a SUBMISSION fee and not
a student fee, and it appears in no student-facing material.** B&P Code § 10209, which § 3002(c)
makes the source of authority for the fee, was **not read**.

---

## 6. RE 311, RE 313, RE 318A, RE 304, RE 909

Obtained as the Department's own templates, and used as templates rather than as sources of rules:
**RE 311** the course completion certificate, **RE 313** the statutory/pre-license general
information page to be provided *"to the participant prior to registration/enrollment"*, **RE 318A**
the course and instructor evaluation the school must tell each student about, **RE 304** consent to
service of process for an out-of-state school, and **RE 909** the credit card payment form.

---

## 7. What the build takes from the Department, in one place

| Requirement | Source | Where the build carries it |
|---|---|---|
| 15 separate lesson assignments | § 3000(a)(1); Handbook | 15 lesson files per course, all three courses |
| 45 hours, each hour not less than 50 minutes | § 3000(a)(1) | 15 × 180 instructional minutes = 2,700 = 45 hours |
| Final exam, not less than 100 questions | RE 303 | `FINAL_QUESTION_COUNT = 100` |
| Passing score 60 percent or greater | RE 303; Handbook | `FINAL_PASSING_PERCENT = 60` |
| One retake, different questions | RE 303 | Forms A and B; `maxFinalAttempts: 2` |
| Proctor designated by the school; exam never furnished to the student | § 3000(a)(2)(B); RE 303 | Final exam banks live outside `public/`, and the site build fails if a file matching `final-exam-bank` or `answer-key` reaches `dist` |
| Not less than 2½ weeks per single course, measured from access to passed final | RE 303 | `minimum_elapsed_hours: 420` |
| No more than two courses in five weeks, across schools | RE 303 | `cross_course_rule: two courses / 35-day window` |
| Completion within one year of registration | RE 303 | `maximum_completion_days: 365` |
| Certificate within 15 days, with the Department's listed fields | § 3000(a)(6); Handbook | RE 311 template |
| Records sufficient for a duplicate certificate, for as long as the school is in business | § 3000(a)(4); Handbook | No retention period stated |
| SB 1495 implicit bias and participatory fair housing | Handbook | Practice course only |
| Material change approved before use | § 3002(b); RE 303 | Course version pinned; no silent content change |

**Two figures in the build are StateCourse decisions and are not the Department's.** The **180-minute
final examination time limit** — **no document read here states any time limit for the final
examination** — and the **in-course assessment thresholds** of 100 percent on the applied item and 80
percent on engagement and remediation items, which no Department source prescribes. Neither may be
described anywhere as a California requirement.

---

## 8. What was NOT read, and is therefore stated nowhere in this build

**Obtained and read:** **RE 307** carrying **Commissioner's Regulations §§ 3000, 3002 and 3003**;
the **Course Provider Handbook, Rev. 01/2026**; **RE 303**, the pre-license course approval packet;
**RE 306** and its field list; **RE 336**; **RE 311**; **RE 313**; **RE 318A**; **RE 304**;
**RE 206E**; and **RE 909**.

**Added 22 August 2026, in their own text, for the SB 1495 fair housing component:**

| Source | Read from | What was taken from it |
|---|---|---|
| **DRE, FAQ — SB 1495 education requirements for exam applicants, New 05/2023** | dre.ca.gov | The two components in the Department's words, the both-roles requirement, and Q7's rule that the components cannot be completed apart from the practice course |
| **42 U.S.C. § 3601** | uscode.house.gov | The declaration of policy, read so that the Act may be cited by the section it opens at rather than by a range nobody opened |
| **42 U.S.C. § 3604(a)–(c)** | uscode.house.gov | The federal prohibitions, and the phrase *"otherwise make unavailable or deny"* that reaches steering |
| **Government Code § 12955** (Fair Employment and Housing Act, housing discrimination) | leginfo.legislature.ca.gov | The California characteristics, subdivisions (g) to (l) reaching the licensee rather than only the owner, and (n) and (o) on income standards and rent subsidies |
| **Civil Code § 51** (Unruh Civil Rights Act) | leginfo.legislature.ca.gov | The full-and-equal-accommodations rule and § 51(e)(7) on perception and association |
| **Health and Safety Code § 35801**, in Part 6 beginning at **§ 35800** (Housing Financial Discrimination Act of 1977 — the Holden Act) | leginfo.legislature.ca.gov | The Legislature's own findings at subdivision (e), quoted, as the state's answer to redlining. **The Part's heading and range were read from the page § 35801 sits on; the operative prohibitions at § 35810 and following were not.** |
| **Business and Professions Code § 10177(l)** | leginfo.legislature.ca.gov | Blockbusting as a ground for discipline, in the terms the subdivision uses — value, crime, and schools |

**These are the first primary California statutory texts in this build.** Everything below that
says a body of law was not read remains true of the rest of it.

**Sections named inside a quotation are not sections this project has read.** The quoted text of
**Government Code § 12955(l)** refers to the **Planning and Zoning Law (§ 65000 and following)**,
and the quoted text of **Civil Code § 51** and **§ 12955** refer to **Government Code § 12926** for
definitions. **Neither was opened.** They appear in this build only inside quotation marks, as part
of what the sections that were read actually say, and **no rule in this build rests on either.**

**NOT obtained. No rule, figure, deadline, form provision, fee or penalty in this build comes from
any of these:**

- **The Business and Professions Code, in its own text, apart from § 10177(l).** Not
  **§§ 10153.2, 10153.3, 10153.4 and 10153.5**, which name the courses and create the equivalence
  power that Article 24 implements; not **§ 10209**, the fee section § 3002(c) points to; not
  **§ 10176**, and not the rest of **§ 10177** beyond subdivision (l); not **§ 10145** or the trust
  fund provisions; not the definition of a real estate broker or salesperson. **This remains the
  largest gap in the California build**, and § 10177(l) was read for the fair housing component
  rather than as a start on the Code.
- **The Commissioner's Regulations beyond §§ 3000, 3002 and 3003.** Not **§ 3001**, not **§ 3004** —
  both named on the face of RE 336, which certifies compliance with *"Regulations 3000 through
  3004"* — and none of the substantive regulations, including the **trust account regulations
  (§ 2830 et seq.)**, the **advertising regulations**, or the **agency disclosure regulations**.
- **Senate Bill 1495 itself**, and the code section it enacted. The requirement is recorded as the
  Department states it — in the Handbook and in the Department's own SB 1495 FAQ, both read — and
  **no figure, effective date beyond 1 January 2024 as both documents state it, or definition is
  taken from the bill.** The course's compliance is stated against what the Department says the
  requirement is; a reading of the enacted text could only narrow that, not widen it.
- **The California Civil Code** — the agency articles, the **transfer disclosure statement** and its
  statutory form, the **statute of frauds**, the **easement, deed and recording provisions**, and the
  **Davis-Stirling Common Interest Development Act.**
- **The Fair Employment and Housing Act beyond § 12955**, **the Unruh Civil Rights Act beyond
  § 51**, **the Holden Act beyond § 35801**, and **the Rumford Act** in its own text. The three
  sections named were read in full on 22 August 2026 and the California protected-class list in
  this build is taken from **§ 12955 itself**. Not read: the FEHA enforcement articles
  (**§§ 12956 to 12957** and the complaint procedure), **§ 51.2 and the senior housing provisions**,
  the **remedies and damages provisions** of either Act, and the **Holden Act's operative
  prohibitions at §§ 35810 and following** — the findings section was read, the duties were not.
  **No remedy, penalty, damages figure, filing deadline or enforcement procedure in this build
  comes from any of them, because none is stated anywhere in it.**
- **California's finance and lending statutes** — the **Real Estate Law's mortgage loan broker
  provisions**, the **California Financing Law**, the **Homeowner Bill of Rights** and the
  **anti-deficiency statutes** — despite one of the three courses being **Mortgage Loan Brokering and
  Lending**.
- **California's landlord-tenant statutes**, **escrow law**, **subdivision and public report law**,
  **documentary transfer tax** and any **rate**, and **property tax law including Proposition 13** in
  its own text.
- **Any Department examination content outline or candidate handbook**, and any figure for the state
  licensing examination.

### What follows from this, stated plainly for the reviewer

**Every other state in this project cites its statute section by section, and the reviewer can trace
any sentence to a quoted provision.** California cannot be reviewed that way, because **the build
carries no section citations at all.**

**This cuts two ways, and both should be said.** The build has **not manufactured a citation, a
figure, or a section number** — a sweep of all 45 lessons finds **no California statutory or
regulatory figure of any kind**, and where a period appears it is arithmetic or a teaching scenario.
The one place a retention period is discussed, a firm that *"discards loan files three years after
closing, on the shortest period it could find"* is presented as the **error**, not the rule. **On the
approval side — hours, lesson count, examination, timing, certificate, instructor, fee — the build
rests on primary regulatory text and is traceable line by line, as section 7 shows.**

**But on the substantive side it rests on none.** The 386,565 words of instruction on agency, trust
funds, disclosure, finance, fair housing and licence law are written **without a single citation to
the California law they describe.** A reviewer therefore cannot check California's substantive
content against a source the way they can check the other twelve states, and **the correct question
to ask of this build is not "is the citation right" but "is the statement of California law
correct."**

**Closing this means reading the Business and Professions Code and the Commissioner's Regulations
directly and citing them through the curriculum.** Until that is done, **no California module states
a section number, and none may be added without the reading behind it.**

---

**Course version 1.0 submission draft — NOT APPROVED. No California credit is available for any of
the three courses.**
