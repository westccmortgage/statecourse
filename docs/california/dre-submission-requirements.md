# California DRE statutory/pre-license course submission — requirements and gap analysis

**Sources:** the official DRE forms committed in `california/dre-sources/`, supplied by the owner on
August 18, 2026. Every requirement below is taken from those documents; nothing here is inferred from
secondary sources.

| Form | Title | Revision |
| --- | --- | --- |
| RE 306 | Statutory/Pre-License Course Approval Application | Rev. 1/26 |
| RE 303 | Statutory/Pre-License Course Checklist and Instructions | Rev. 1/26 |
| RE 307 | Regulation Excerpts (Private Vocational Schools), Article 24 §§3000–3004 | Rev. 7/18 |
| RE 336 | Statutory/Pre-License Instructor Certification | Rev. 2/23 |

Plain-text extractions and fillable-field inventories are in `california/dre-sources/extracted/`,
regenerated with `node scripts/extract-dre-sources.mjs`. The PDFs are AES-encrypted with an empty user
password, which is how DRE publishes them; extraction is read-only.

> **Approval status:** no application has been filed and no course is approved. RE 303 is explicit that
> offerings "may not be promoted as being DRE-approved until actual approval is issued," and §3004(b)
> requires approved-course advertising to list the Department's course approval number. Every public
> surface must continue to show *In Development* until an approval number exists.

## 1. What the regulations confirm about the existing build

Four architectural decisions already in the repository are directly required by Article 24, and should
not be changed:

| Regulation | Requirement | Repository status |
| --- | --- | --- |
| §3000(a)(1) | "A correspondence course shall consist of not less than **15 separate lesson assignments**." | Correct — each course is built as exactly 15 lesson assignments. |
| §3000(a)(4) | Records for each student sufficient to prepare a **duplicate certificate on request**. | Correct — the catalog records a lifelong duplicate-certificate obligation. |
| §3000(a)(7) | An **appropriate method of assessing student knowledge**. | In progress — the assessment rebuild replaces a single reused question with per-lesson item banks. |
| RE 303, p.4 | Internet courses must show "a **method of control** … to require the student to complete each segment of the course before progressing to the next." | Correct — sequential unlock is implemented in the course engine. |

RE 303 also confirms the three chosen courses are on the list of acceptable qualifying courses:
Real Estate Practice, Real Estate Principles, and Mortgage Loan Brokering and Lending.

The 2½-week minimum and the two-courses-per-five-weeks rule are both already modeled correctly. Three
further timing obligations are not yet enforced — see §4.

## 2. The submission package: RE 303 checklist, item by item

A **separate** application, fee, and full package is required for each of the three courses.

| # | Checklist item | Status | Note |
| --- | --- | --- | --- |
| 1 | Course Approval Application (RE 306) | **Not started** | Form in hand; 85 fillable fields; 23 numbered items. |
| 2 | Course offering fee | **Blocked** | Amount is in **RE 206E**, which we do not have. |
| 3 | Corporation documents | **Pending — see §2a** | The applicant is **StateCourse LLC, a California LLC**, registration in process. RE 303 requires a document issued by the California Secretary of State; the certificate satisfies this item once issued. |
| 4 | Fictitious Business Name Statement | **Open question — see §2a** | The registered name is `StateCourse LLC` and the platform trades as "StateCourse". Whether dropping the entity designator requires an FBNS is a question for counsel, not one to assume either way. |
| 5 | Consent to Service of Process (RE 304) | **Probably not required — see §2a** | RE 303 ties RE 304 to non-resident applicants. A California LLC with a California principal office is not obviously one, but confirm with counsel rather than omit the form on an assumption. |
| 6 | Copies of all student instructional materials | **Not ready** | See §3 — this is the critical gap. **Printed** copies must be mailed; digital media cannot be accessed by DRE. |
| 7 | Copyright authorization | **Not applicable if content stays original** | Required only for third-party copyrighted material. |
| 8 | Instructor Certification (RE 336) + substantiation | **Not started** | Form in hand. One form per instructor, and the form names a single course title, so three are needed. See §5. |
| 9 | General Information Page (**RE 313**) | **Blocked** | We do not have RE 313. RE 306 item 21 also asks how the page is provided to students **prior to registration**. |
| 10 | Timed course outline | **Partially exists** | The engine defines 15 assignments × 180 minutes = 45 hours; needs to be produced as a submission document. |
| 11 | Student final exam instructions | **Not started** | |
| 12 | Exam proctor/monitor instructions | **Not started** | Must include a certification statement **with a signature field** confirming the proctor complied with all exam rules. |
| 13 | Student version of the final exam | **Not started** | Must be an exact copy of what students see. |
| 14 | Instructor version + answer key | **Not started** | Answer key must **reference where each answer is found in the course material**. |
| 15 | Student and regulator log-in credentials | **Partially exists** | Reviewer mode exists in the engine. The regulator account must bypass study-time requirements and expose all assessments and final exams; real credentials must be issued. |
| 16 | Course Completion Certificate (**RE 311**) | **Blocked** | We do not have RE 311. Required fields are listed in RE 303 — see §6. |

**Strategic note from RE 303:** "The Department suggests that first time applicants send in one course
application for approval before submitting multiple others. Sending one application helps avoid
repeating the same potential deficiencies on subsequent applications." The plan of filing three
simultaneous RE 306 packages runs against the Department's own advice. Filing one course first — and
absorbing its correction round — is likely to be faster overall than correcting the same deficiency
three times.

## 2a. The applicant entity: StateCourse LLC (California)

**Updated 2026-08-18.** The DRE applicant is **StateCourse LLC**, a California limited liability
company, with its principal office in Redondo Beach. **Registration with the California Secretary of
State was in process at the time of writing and no entity number had been issued.** Nothing in this
repository may describe the entity as registered until the certificate is in hand.

This replaces the earlier position in which a **Wyoming** LLC named `state course LLC` was the intended
applicant. That entity still exists, is **not** the DRE applicant, and is retained for a separate future
purpose; its name and status are expected to change at that time. It should not appear on any DRE form.

**What forming in California resolves:**

| Item | Former position | Position now |
| --- | --- | --- |
| **3. Corporation documents** | Blocked — a Wyoming Certificate of Organization is not a document issued by the California Secretary of State | **Satisfied once the certificate issues.** A California domestic LLC obtains the California document RE 303 asks for directly, with no foreign qualification step in between. |
| **5. Consent to Service of Process (RE 304)** | Likely required — a Wyoming entity engages the non-resident and California-qualification language | **Probably not required.** A California LLC with a California principal office is not obviously a non-resident applicant. **Confirm with counsel** rather than omit the form on an assumption. |
| **Good standing during the approval term** | A foreign entity would first have to qualify here | Maintained directly with the California Secretary of State. |

**What remains open.**

**The name on every form must be the name as filed, character for character.** The forms in
`california/dre-sources/generated/` are regenerated from `re336-data.json`, which now carries
`StateCourse LLC`. **If the Secretary of State records the name differently — different capitalization,
a different designator, or an alternate name because the exact string was unavailable — update
`re336-data.json` and regenerate before anything is signed.**

**The fictitious business name question is open, not resolved.** The registered name is
`StateCourse LLC` and the platform, the domain, and the course materials say "StateCourse". Whether
trading under the registered name without its entity designator requires a Fictitious Business Name
Statement is a legal question with a real answer, and RE 306 item 10 asks for the filed FBNS where one
applies. **This goes to counsel.** It is a smaller question than the earlier `state course LLC` versus
"StateCourse" gap, and it is not automatically no.

**Three things still to obtain before the package can be assembled:**

1. **The California Secretary of State certificate** — Certificate of Status or the equivalent the
   Secretary issues for a domestic LLC — and the entity number.
2. **Counsel's answer on RE 304** and on the fictitious business name question.
3. **The signed forms**, regenerated after the entity number and the exact filed name are known.

## 3. The critical gap: content equivalence and who certifies it

This is the requirement most likely to stop the application, and it is not in the project plan.

RE 303 states the approval standard and then adds a condition specific to self-written content:

> To obtain approval, curriculum must be equivalent to real estate courses offered by colleges or
> universities accredited by the Western Association of Schools and Colleges…
>
> **If you write your own course content, it will be necessary to obtain a certification from a college
> instructor in the field of study for each specific course, confirming the course content is equivalent
> to course material used in a college or university course. This certification must be on official
> school letterhead and signed by the instructor.**

StateCourse writes its own content, so this applies to all three courses. Two consequences:

1. **A named college instructor must be recruited for each course** and must be willing to put the
   equivalence certification on their institution's letterhead. This is a lead-time item with an external
   dependency, and it should start now rather than after the content is finished.
2. **The content must actually be able to pass that review.** RE 303 sets the working benchmark:
   "approximately **450 pages** of text/instructional material is equivalent to textbooks offered by a
   California college or university," sufficient to require a minimum of 45 hours of study.

The audit in `phase-1-audit.md` found that the present lesson text is 2,836 body paragraphs generated
from **14 distinct paragraphs**, with the topic name substituted in. It reaches the page count only by
repetition. No college instructor could certify that as equivalent to a college course, and a DRE
reviewer reading the printed submission would see the repetition immediately. **The lesson rebuild is
therefore a submission blocker, not a polish item.**

## 4. Enrollment pacing, timing, and completion rules

| Rule | Source | Engine status |
| --- | --- | --- |
| A single correspondence course may not be completed in less than **2½ weeks** | RE 303 p.3 | **Modeled.** `california_final_eligibility` sets the earliest final at `enrollment_date + interval '420 hours'` (17.5 days). |
| **No more than two courses** may be completed in a five-week period; the schedule is cumulative (4 courses = 10 weeks, 6 = 15 weeks, 8 = 20 weeks) | RE 303 p.3 | **Modeled.** The same function counts the student's other California completions inside `interval '35 days'` and blocks the final when two or more exist. Note the rule applies regardless of how many schools the student attends, which no single provider can observe — the control is necessarily partial. |
| Completion time runs from **the date the student receives access** to the date the final exam is **successfully passed** | RE 303 p.3 | **Verify.** The engine measures from `enrollment_date`. That is correct only if enrollment and access-grant are the same event; if access can be granted later, the clock starts too early and understates the required period. |
| All courses must be completed **within one year** of registration; otherwise the student must re-enroll | RE 303 p.4 | **Partially modeled.** `enrollments.expires_at` is set to 365 days, but nothing enforces it: the course access path checks reviewer expiry, not enrollment expiry, and there is no re-enrollment flow. |
| Completion document delivered **within 15 days** of successful completion | §3000(a)(6) | **Not modeled.** No certificate table or issuance path exists in the California migration. |

The cross-course pacing rule matters commercially: it limits how fast a student can finish a
three-course bundle, and any marketing must not imply otherwise. §3004(c) prohibits advertising that
implies a course can be completed in less time than the hours for which it is approved.

## 5. Instructor qualification (RE 336)

The minimum qualifications on the form are explicit:

> a **Bachelor's Degree (with any major) and two years of professional experience**, or **any associate
> degree and six years of professional experience** in the real estate profession.

The Commissioner may also approve an instructor who "otherwise evidence[s] their teaching qualifications
by education or experience or a combination of the two," so a candidate outside the two stated paths is
a discretionary decision rather than an automatic denial.

For Anatoliy Kanevsky the package needs, per course: a completed RE 336 signed by both the primary
contact and the instructor, plus **substantiation** — the form's certification line specifically
contemplates a diploma copy, and RE 303 adds "resume, diploma, etc." Which qualification path applies
depends on his degree, which is not recorded in the repository and must be confirmed before the form can
be completed.

Disqualifiers on the form: violation of Article 24, conduct warranting denial of course approval, a
suspended/revoked/restricted real estate license, or conduct that would have warranted denial of a real
estate license.

**Nothing in this project may describe him as an approved instructor until DRE issues approval.**

## 6. Final examination requirements

| Requirement | Source |
| --- | --- |
| Required for all courses; **not less than 100** multiple-choice or fill-in questions | RE 303 p.4 |
| Passing score **60% or greater** | RE 303 p.4 |
| Must reflect **comprehensive coverage of the entire course** | RE 303 p.4 |
| **One retake** permitted, with **different questions**; failing the retake means no credit and the student must retake the course | RE 303 p.4 |
| Correspondence exams administered and supervised by a **school-designated proctor**; school sends the materials to the proctor and the proctor returns them | §3000(a)(2)(B), RE 303 p.4 |
| Proctor may **not** be related by blood, marriage, domestic partnership, or any other relationship (the form names a future responsible broker as an example) | RE 303 p.2, p.4 |
| **"Under no circumstances shall the final exam be furnished directly to the students."** | RE 303 p.4 |
| Online exams cannot be **printable or downloadable** and must **time out** when the allotted time expires | RE 303 p.4 |
| Photo ID immediately before the exam: a California Vehicle Code §13000 identification card or any valid government-issued photo ID, **or** current identification from a recognized real estate trade organization issued within the preceding five years bearing photograph, signature, and identification number | RE 303 p.2, p.3 |
| RE 306 items 17–20 require the applicant to state the number of questions, minimum passing score, exam time, and whether open or closed book | RE 306 p.2 |

The catalog's recorded exam rules (100 questions, 60%, proctored, one different retake, 180-minute
limit) are consistent with these requirements; the 180-minute limit is a provider-proposed value entered
at RE 306 item 19.

## 7. Course completion certificate (RE 311) required fields

From RE 303 item 16, if not using the DRE sample form the certificate must include: school name, address
and phone number; course title; student name and DRE license number; credit hours; course category; date
of registration and date of successful completion; **six-digit approval number**; verifier name,
signature and phone number; number of hours completed (45 minimum); and the applicable statement.

For a correspondence course the required statement is:

> "Successfully completed the correspondence/home study course and passed the final exam with a passing
> score of 60% or better."

§3000(a)(6) separately requires the completion document to carry the DRE course approval number, student
name, course title, dates of course completion, and the school's name and address, delivered within 15
days.

## 8. Other obligations that affect the platform, not just the paperwork

- **Student evaluation notice.** §3000(a)(9) requires the school to notify each student that a course and
  instructor evaluation form is available on the DRE website. RE 306 item 22 asks how and when this is
  done. Not currently implemented anywhere in the platform.
- **Interactive participatory component.** RE 303 p.2: effective 1/1/24 all real estate practice courses
  must contain implicit bias and fair housing components, and **fair housing must include an interactive
  participatory component**. RE 306 item 23 asks for details. The Practice course's lesson 14 is built as
  an implicit bias and fair housing participatory practicum, which matches; the participatory mechanics
  need to be real and describable on the form.
- **BPPE.** Simultaneous instruction of two or more students constitutes a private vocational school;
  §3002(a)(2)(E) requires evidence of BPPE approval **or exemption** with the application, and RE 306
  item 8 asks for the code section or reason if exempt. This determination is a prerequisite, not a
  follow-up.
- **ADA.** RE 303: courses must be offered in a place and manner accessible to all persons, or with
  alternative but equal arrangements, including auxiliary aids. This supports the existing WCAG 2.2 AA
  commitment.
- **Material change.** Any material change to an approved course requires submission and DRE approval
  **before use**, and generally a new application and fee. RE 306's certification commits the sponsor to
  submitting material changes **at least 90 days prior** to proposed use. A material change includes a
  change in curriculum, course length, method of presentation, workbooks, texts, or syllabi — but not
  changes made exclusively to reflect changes in statutes, regulations, or decisional law, which must
  still be submitted but without a new application or fee. **This is why course versioning matters: once
  approved, the content cannot be edited freely.**
- **Inspection and monitoring.** RE 306 page 3 commits the sponsor to direct-mail student evaluations,
  drop-in monitoring, information reports (completion certificates, attendance, exam grades, final exams,
  proof of payment), and investigative/conformance monitoring in which authorized participants may enroll
  as ordinary students. The platform must be able to produce these records on request, and reviewer
  activity must remain separable from student records.
- **Advertising.** §3004: advertising must clearly identify the entity as a private vocational school or
  course sponsor and include its name; approved-course advertising must list the course approval number;
  nothing may imply a course can be completed in less time than its approved hours; no false or
  misleading statements.

## 9. Immediate blockers

Ordered by lead time rather than by checklist position.

1. **Recruit college instructors** willing to sign the equivalence certification on institutional
   letterhead, one per course. External dependency, longest lead time, and it cannot be compressed.
2. **Rebuild the lesson content** so it can survive that certification and a reviewer reading it in
   print. Currently 14 distinct paragraphs across all 45 lessons.
3. **Obtain the missing DRE forms:** RE 313 (General Information Page), RE 311 (Course Completion
   Certificate), RE 206E (fee schedule), and RE 909 if paying by card. All are on dre.ca.gov, which this
   build environment cannot reach; supply them the same way the first four were supplied.
4. **Resolve the BPPE approval-or-exemption question**, since evidence of it must accompany the
   application.
5. **Confirm the instructor's degree** to determine which RE 336 qualification path applies.
6. **Obtain the California Secretary of State certificate and entity number for StateCourse LLC** once the
   registration completes, then regenerate the forms from `re336-data.json` with the exact filed name, and
   put the RE 304 and fictitious-business-name questions to counsel (see §2a).
7. **Decide whether to file one course first**, per the Department's own recommendation.

## 10. Engine work this analysis adds

Beyond the paperwork, the regulations require platform behavior that does not exist yet:

- enforcement of the one-year completion deadline, and a re-enrollment path when it lapses;
- certificate delivery within 15 days of successful completion;
- the DRE evaluation-form notice to each student;
- final-exam delivery that is non-printable, non-downloadable, and time-limited, with the exam never
  furnished directly to students;
- photo-ID verification at the exam, in one of the two accepted forms;
- proctor instructions with a signed compliance certification;
- a regulator log-in that bypasses study-time requirements and exposes all assessments and exams without
  creating student credit.
