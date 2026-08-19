# Alaska Course Certification Package — Salesperson Prelicense Education

**Applicant:** StateCourse LLC
**Course:** Alaska Real Estate Salesperson Prelicense Education
**Contact hours sought:** 40
**Delivery:** Correspondence, under 12 AAC 64.430
**Regulator:** Alaska Real Estate Commission, Division of Corporations, Business and Professional Licensing, Department of Commerce, Community, and Economic Development
**Prepared:** August 19, 2026
**Status:** Draft. **Not filed.** No StateCourse course is certified in Alaska, enrollment is closed, and no certificate of completion can issue.

---

## 0. What this document is, and what it is not

This is a working answer to every requirement 12 AAC 64.420 and 12 AAC 64.430 impose on an applicant for course certification, written so that each answer can be checked against the rule that produced it. It is not the application. The application is the department's form, and the fees are those in 12 AAC 02.360.

Where a question cannot be answered from the rule text, it is listed in section 9 as an open item to put to commission staff. Nothing in section 9 is guessed at.

**Two things must be true before this is filed**, and neither is true today:

1. **A completed application must be filed 45 days before the first offering date of the course** — 12 AAC 64.420(b).
2. **An approved instructor must be in place.** 12 AAC 64.410(a)(4) requires the course to be taught by an instructor approved by the commission to teach that course topic, and 12 AAC 64.430(b) requires the end-of-course instrument to be turned in **to the instructor** for grading. A correspondence course without an approved instructor cannot satisfy either.

**And one thing must not happen.** 12 AAC 64.420(b): "A course may not be advertised as being certified under this chapter until the applicant has received written certification from the commission." Every StateCourse page describing this course carries the words "Not certified" for that reason, and the platform's enrollment control is disabled at the catalogue level rather than by page copy.

---

## 1. The application contents — 12 AAC 64.420(a)

| Rule | Requirement | Where answered |
|---|---|---|
| (a)(1) | Completed application on the department's form | The department's form; this package supplies its content |
| (a)(2) | Fees required in 12 AAC 02.360 | To be paid on filing |
| (a)(3)(A) | Title of course | Section 2 |
| (a)(3)(B) | Number of contact hours requested | Section 2 — **40** |
| (a)(3)(C) | Name of the sponsor and designated contact person | Section 3 |
| (a)(3)(D) | Detailed course outline identifying content and objectives, including text materials, sample handouts, and a sample examination, if any | Section 4 and the module map |
| (a)(3)(E) | Copy of the attendance policy and a description of the procedures used for keeping a record of attendance | Section 5 |
| (a)(3)(F) | Provisions for offering the course by correspondence, if any | Section 6 |
| (a)(3)(G) | The policy for allowing a student to make up missed class time, if any | Section 7 |

---

## 2. Title and hours

**Title:** Alaska Real Estate Salesperson Prelicense Education
**Contact hours requested:** 40
**Statutory purpose:** AS 08.88.091(b) — "An applicant for licensure under AS 08.88.171(c) must complete 40 hours of education approved by the commission before the person may be licensed under that subsection."
**Contact hour definition applied:** 12 AAC 64.063(g)(1) — a contact hour is a minimum of **50 minutes of instruction**. Forty contact hours is therefore a minimum of **2,000 minutes**.

---

## 3. Sponsor and contact

| Field | Value |
|---|---|
| Course sponsor | StateCourse LLC |
| State of organization | California |
| Designated contact person | **To be supplied on filing** |
| Mailing address | **To be supplied on filing** |
| Electronic mail address | **To be supplied on filing** |
| Telephone | **To be supplied on filing** |

These are left blank rather than filled with a placeholder, because a certification application carrying a wrong address is a document with a wilful material misstatement problem under AS 08.88.485 waiting to happen.

---

## 4. The course outline — 12 AAC 64.420(a)(3)(D)

The detailed outline is `alaska/submission/module-map.md`, and the instructional text is the eight module files under `alaska/ak-salesperson-prelicense-40-v1/curriculum/`.

**The outline is the Commission's, not the applicant's.** 12 AAC 64.063(c) states the eight topics and their contact hours for a course qualifying an applicant for an initial licence. This course delivers exactly them:

| Module | Topic, as 12 AAC 64.063(c) states it | Contact hours | Instructional sections |
| --- | --- | ---: | ---: |
| 01 | Licensee relationships, disclosure, and conflict of interest | 6 | 6 |
| 02 | Forms of ownership | 4 | 4 |
| 03 | Property law, public and private rights and limitations | 4 | 4 |
| 04 | Forms of conveyances and recording of documents | 4 | 4 |
| 05 | Contracts and transaction documents | 8 | 8 |
| 06 | Financing instruments and accounting principles | 6 | 6 |
| 07 | Alaska real estate license law and Alaska landlord tenant law | 6 | 6 |
| 08 | Federal fair housing and RESPA laws | 2 | 2 |
| | **Total** | **40** | **40** |

**One instructional section per contact hour**, so a reviewer counting sections is counting hours. That is a StateCourse design commitment, not an Alaska rule, and the course engine enforces it: `config/alaska-course-engine.mjs` throws at import if the eight modules stop totalling 40, and `tests/alaska-course.test.mjs` checks each module file's section count against the Commission's hour figure independently of the engine.

**Objectives.** Each module opens with a list of learning objectives stating what the student will be able to do. They are in the module files and reproduced in the module map.

**Content standards under 12 AAC 64.410(a).**

- **(a)(1) — adds to the practical knowledge required to perform the duties of a real estate practitioner in the areas 12 AAC 64.063 identifies.** Every module is one of the 12 AAC 64.063(c) areas, and each cites the paragraph it answers in its header.
- **(a)(2) — content applicable to all areas of the state, and may include unique local circumstances.** The material is written to Alaska statutes and regulations of statewide application. Local circumstance appears where the law itself makes it relevant and is identified as such: the 12 AAC 64.200 five-day trust deposit exception for geographical location, weather, and transportation; the AS 34.03.100(b) rural single-family water and sanitation provision; recording by recording district; the effect of Alaska Native Claims Settlement Act land status on title work; and heating fuel as a prorated closing item.
- **(a)(4) — taught by a commission-approved instructor.** Open item; see section 9.

**Text materials and handouts.** The instructional text is written for this course. No third-party outline, competitor syllabus, or commercial exam-prep material is used, and no material is carried over from another StateCourse jurisdiction. Federal material cites the official federal source; Alaska material cites AS and AAC by number. The full text accompanies the application under 12 AAC 64.430(a)(2).

**Sample examination.** The in-course module assessments are described in section 6.3. The end-of-course instrument required by 12 AAC 64.430(b) is described in section 6.4 and is filed with the application for prior approval. It is not published to students in advance.

---

## 5. Attendance policy and attendance records — 12 AAC 64.420(a)(3)(E)

### 5.1 The policy

**12 AAC 64.410(a)(6)** requires that "students must be required to adhere to a strict attendance policy, whether in a classroom or attending a virtual course, in order to receive credit for the course."

For a correspondence course there is no seat to occupy, so the equivalent of attendance is **completion evidence**, recorded per section rather than asserted at the end. A student receives credit for a module only when **all** of the following are recorded:

1. **Every instructional section** in the module recorded as viewed, in sequence.
2. **Every checkpoint** in the module answered.
3. **The module's applied exercise** completed.
4. **The module assessment passed.**
5. **Active study time** recorded against the module's floor of 50 minutes per contact hour.

**Credit is all-or-nothing per module.** A module part-done credits nothing, because a partly-viewed module is not adherence to a strict attendance policy as to the whole of it. The 40 contact hours are credited only when all eight modules are complete. This is implemented in `alaskaCreditedContactHours()` and tested.

### 5.2 The records

For each student the platform records, per module and per section:

| Recorded | Purpose |
|---|---|
| Section identity and the time it was recorded as viewed | Evidence that each section was reached, in order |
| Sequence enforcement | Evidence that sections were not skipped |
| Active study time, accumulated from heartbeats, with idle time excluded | Evidence against the 50-minute-per-contact-hour floor |
| Checkpoint responses and their timestamps | Evidence of participation in each section |
| Assessment attempts, item-level selections, scores, and outcomes | Evidence of assessment and of remediation |
| Module completion date | The per-module credit event |
| Course completion date | The instruction-complete event |
| End-of-course instrument submission, grader, grade, and date | The 12 AAC 64.430(b) event |
| Course and instructor evaluation completion | The 12 AAC 64.410(a)(8) event |
| Certificate issuance, with each 12 AAC 64.410(a)(9) field | The certificate event |

**Active time is measured, not asserted.** The platform accumulates study time from client heartbeats on a fixed interval, discards a heartbeat separated from the last by more than the configured gap, and stops accruing after the idle threshold. A student who leaves a page open accrues nothing.

**Records are never silently edited.** Any correction to a completion or audit record is written as a new, attributed, timestamped entry rather than an in-place change, and reviewer activity is recorded separately from student activity so that it can never contaminate a student record.

**Retention.** No retention period for education-provider records is stated in 12 AAC 64 Article 7. StateCourse retains Alaska student completion records **permanently**, because **12 AAC 64.470(c)** allows the commission to audit a certified course **at any time**, and a record that has been aged out cannot answer an audit.

### 5.3 Daily credit

**12 AAC 64.410(c)** caps credit at **10 hours** of instruction per day for the continuing education requirements of AS 08.88.091 and 12 AAC 64.500, and **8 hours** per day for the education requirements of AS 08.88.095 and 12 AAC 64.064.

Neither paragraph names the **AS 08.88.091(b) 40-hour prelicense requirement**, so on the text as written the daily cap does not appear to reach this course. **StateCourse applies the 8-hour figure to this course anyway, as a provider standard**, and lists the point in section 9 for confirmation. No StateCourse document describes the 8-hour figure as an Alaska prelicense requirement.

---

## 6. Correspondence provisions — 12 AAC 64.420(a)(3)(F) and 12 AAC 64.430

### 6.1 What accompanies the application

**12 AAC 64.430(a)** requires a correspondence sponsor to:

1. **meet the requirements of 12 AAC 64.420** — this package;
2. **submit a copy of the complete course materials that will be provided to participants, including any published texts or videos** — the eight module files in full, and every figure, table, and worked example they contain. There are no published third-party texts and no videos; if any is added later it is filed as an amendment under 12 AAC 64.420(e);
3. **submit a copy of the instructions for completing each lesson** — section 6.2.

### 6.2 Instructions for completing each lesson

Each module opens with the same four things, in the same order, so that a student who has completed one module knows how to complete every other:

1. **The topic and its 12 AAC 64.063(c) paragraph**, the contact hours, and the regulatory status line.
2. **The learning objectives.**
3. **A timed sequence table** listing each instructional section, the contact hour it carries, and the evidence recorded for it.
4. **The instructional sections themselves**, each ending in a checkpoint the student answers before the section is recorded as viewed.

Each module then closes with key terms, practice problems with the working shown, a module summary, the module assessment, and a module completion statement naming how many of the 40 contact hours the module carries.

**Sequence.** Sections are delivered in order and the next section does not open until the current one is recorded as viewed and its checkpoint answered. Modules are delivered in the 12 AAC 64.063(c) order.

**Progress and interruption.** Progress is saved continuously. A student may leave and return; the platform resumes at the last incomplete section and the recorded active time is preserved.

### 6.3 In-course assessment

Each module carries three kinds of item, all machine-scored, all inside the course:

| Kind | Count per module | Threshold | Purpose |
|---|---:|---|---|
| Applied | 1 | 100 percent | A scenario worked inside the module |
| Engagement | 5 | 80 percent | The module assessment |
| Remediation | 5 | 80 percent | Alternate items on the same material, served after a failed engagement check alongside an alternate explanation |

**The 80 percent threshold is a StateCourse instructional standard, not an Alaska requirement.** Alaska prescribes no passing score for in-course assessment. Every module file says so in terms.

Remediation items are distinct items, not the engagement items reordered, and the test suite verifies that no remediation prompt duplicates an engagement prompt.

**Answer keys never leave the server.** The student payload for an assessment carries only the item id, prompt, and choices; a test asserts that no other field can appear. Choice order is a deterministic function of the item id, so it is stable for the life of the item and a recorded selection keeps its meaning permanently — while the authoring order, in which the correct answer sits first for legibility, never reaches a student.

### 6.4 The end-of-course instrument — 12 AAC 64.430(b)

**The rule:** "All courses taken by correspondence must include an unanswered examination, or a project activity, to be turned in to the instructor for grading upon completion of the course. An unanswered examination or project activity must be submitted along with the course material to the commission for prior approval."

**This is the requirement that machine scoring does not satisfy, and StateCourse does not claim that it does.** The module assessments in 6.3 gate progression within the course. They are not the instrument this rule describes, because the rule requires the instrument to be turned in **to the instructor** for grading.

**What is proposed** is a **written end-of-course project activity**: a transaction file review in which the student works a single Alaska transaction through all eight topic areas —

1. the licensee relationship and the disclosures it requires;
2. the form of ownership and what it requires of a conveyance;
3. the property-law limitations affecting the parcel;
4. the conveyance and recording steps;
5. the contract terms, their deadlines, and the earnest money handling;
6. the financing structure and the settlement figures;
7. the Alaska licence-law and landlord-tenant obligations engaged; and
8. the fair housing and RESPA obligations engaged.

It is submitted to the approved instructor, graded against a published rubric, and returned with written comments.

**The platform records the submission, the grader's identity, the grade, and the date**, because a grade with no record of who gave it is not evidence that anyone did. **The course is not complete until the instrument has been submitted and graded.** In the course engine, finishing all eight modules produces `instructionComplete`; `courseComplete` requires the graded instrument as well; and neither alone permits a certificate.

**The instrument and its rubric are filed with the commission for prior approval as the rule requires, and are not published to students in advance.**

### 6.5 Course and instructor evaluation — 12 AAC 64.410(a)(8)

The student must complete a course and instructor evaluation **on a form that meets or exceeds the basic evaluation provided by the commission**, before a certificate issues. StateCourse will use the commission's form or a superset of it; the specific form is an open item in section 9.

### 6.6 Certificate of completion — 12 AAC 64.410(a)(9)

The certificate is given to each student who attends and participates in the course and completes the evaluation, and shows the seven prescribed fields:

| Field | Source in the platform |
|---|---|
| (A) Name of the student | Enrollment record |
| (B) City where the course was held | For a correspondence course, recorded as the student's city of record |
| (C) Course title **and course approval number** | Certification record |
| (D) Date the course was delivered | Completion record |
| (E) Number of contact hours awarded | 40, on completion of all eight modules |
| (F) Signature of the course instructor or sponsor | The approved instructor |
| (G) Name of the course instructor | Approval record |

**No certificate can issue before the commission assigns a course approval number**, because (C) makes it a required field. The engine treats this as a hard gate: `certificateEligible` is false whenever the approval number is absent, and `certificateBlockedBy` names 12 AAC 64.410(a)(9) as the reason. The catalogue holds `"approval_number": null`, so the live configuration cannot reach certificate eligibility at all. A test asserts exactly that.

---

## 7. Make-up policy — 12 AAC 64.420(a)(3)(G)

**There is no missed class time in a correspondence course, so there is nothing to make up**, and this section says so rather than inventing a policy to fill a field.

What replaces it is the completion requirement in section 5.1: a module is credited only when every section, every checkpoint, the applied exercise, and the module assessment are complete. A student who does not finish a section has not missed a class; they have an incomplete module, and it stays incomplete until they finish it. There is no mechanism by which a student can be credited for a section they did not complete, and no administrative override exists in the platform.

**Failed assessment.** A student who does not reach the threshold receives an alternate explanation of the material and a different item set on the same concepts, and repeats until the material is answered correctly. After three unsuccessful attempts the module is flagged for instructor attention rather than allowed to loop indefinitely.

---

## 8. Changes to a certified course — 12 AAC 64.420(e)

Recorded here so that the obligation is understood before it arises rather than after.

- A change **based on a United States Supreme Court or Alaska Supreme Court decision**, or on a **documented change in the policy of a financial institution or government agency** with a specific effective date, may be implemented **immediately**. Where the change is based on an institution or agency policy, it must be **reported to the commission within 15 days** after receipt of the public memorandum or press release.
- **Any other substantive change** is submitted as an **amendment to the approved course outline** on the 45-day schedule in 12 AAC 64.420(b).

StateCourse's source register (`alaska/regulatory/official-sources.md`) carries a dated verification record for each primary source, so that a change in the underlying law is detected by the provider rather than by an auditor.

**Term.** Under 12 AAC 64.420(c), a certified course may be offered for credit from the date of certification **until January 31 of the next even-numbered year** — except that a course certified from **October 15 of an odd-numbered year through January 31 of an even-numbered year** may be offered until **January 31 of the following even-numbered year**. The commission provides recertification applications by **October 15 of odd-numbered years**. The term is a fixed date, not a rolling year, and the recertification date is calendared on certification rather than on first offering.

---

## 9. Open items — questions for commission staff

Each is a question the rule text does not answer. **None is assumed in any StateCourse document, and none is treated as settled.**

1. **Approved instructor.** 12 AAC 64.410(a)(4) requires an instructor approved to teach the course topic, and 12 AAC 64.430(b) requires the end-of-course instrument to be graded by the instructor. Who that will be, and their application under 12 AAC 64.440, must be settled **before** the course application is filed. 12 AAC 64.440(c) requires experience teaching or training adults plus one of: a bachelor's degree in real estate or a related field; five years as a real estate licensee with documented experience in the topic area; another combination establishing credentials; or listing as an approved instructor by a qualifying national organization. 12 AAC 64.440(d) allows an ARELLO, NAR, REEA, IRWA, CAI, or comparable instructor workshop to substitute for the teaching experience — and 12 AAC 64.440(h) requires the application to be made **not later than six months after** completing the workshop.

2. **Instructor approval term.** 12 AAC 64.440(g): approval expires **1 April of years ending in 0 and 5**. An initial approval issued from 1 January through 1 April of such a year expires on 1 April of the **next** year ending in 0 or 5. Renewal requires evidence of at least two hours of continuing education in each topic area, or teaching a course in it, or practical experience in it.

3. **The eight-topic outline and a single instructor.** 12 AAC 64.410(a)(4) requires an instructor approved to teach **that course topic**. This course spans eight topics. Whether one instructor must be approved across all eight, or whether approvals may be combined across instructors for a single 40-hour prelicense course, is a question for staff.

4. **Whether the 12 AAC 64.410(c)(2) eight-hour daily cap reaches a prelicense course.** The paragraph names AS 08.88.095 and 12 AAC 64.064, not AS 08.88.091(b). StateCourse applies the cap as a provider standard pending an answer.

5. **Completion reporting.** No periodic roster or completion report to the commission is prescribed in Article 7 as read. Whether staff expects one, and in what format, should be confirmed before the first course is offered.

6. **The evaluation form.** 12 AAC 64.410(a)(8) requires a form that meets or exceeds the basic evaluation the commission provides. The current commission form should be obtained.

7. **"City where the course was held" for a correspondence course.** 12 AAC 64.410(a)(9)(B) assumes a location. StateCourse proposes recording the student's city of record and would rather have that confirmed than defend it later.

8. **Fees.** 12 AAC 02.360, current schedule, for course certification, biennial recertification, and instructor approval.

9. **Postsecondary authorization.** AS 14.48.030(b)(6) and (b)(8) provide discretionary exemptions from the Alaska Postsecondary Education Commission's authorization requirement. Whether this course falls within one of them is a determination to obtain in writing rather than to infer.

---

## 10. What is asserted, and what is not

**Asserted, and checkable in this repository:**

- The course delivers the eight 12 AAC 64.063(c) topics at the Commission's own contact-hour figures, totalling 40.
- One instructional section per contact hour, verified per module by test against the Commission's figure.
- A contact hour is treated as a minimum of 50 minutes, per 12 AAC 64.063(g)(1).
- Credit is all-or-nothing per module, and the 40 hours credit only when all eight modules are complete.
- Machine scoring does not complete the course; the 12 AAC 64.430(b) instructor-graded instrument is a separate, required event.
- No certificate can issue without a Commission course approval number, and the live configuration holds none.
- Answer keys never reach a student payload.
- The 80 percent threshold is labelled a provider standard in every module.

**Not asserted:**

- That the course is certified. It is not.
- That any StateCourse instructor is approved in Alaska. None is.
- That the end-of-course instrument has been approved. It has not been submitted.
- That any of the section 9 open items has been resolved. None has.
