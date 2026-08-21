#!/usr/bin/env node
/**
 * Generates the per-course California DRE submission documents from one source of facts.
 *
 * Three applications, each carrying the same forty-odd shared values — hours, question
 * count, passing score, exam minutes, entity name, file number, addresses, instructor
 * licence. Hand-writing three copies of that is how a filing ends up saying 100 questions
 * on RE 306 and 100 questions on RE 313 and 90 minutes on one of them. So the shared
 * values live in config/california/submission-facts.mjs, this script renders them, and
 * tests/california-submission-consistency.test.mjs re-reads the output and fails if any
 * document disagrees.
 *
 * What this script does NOT do: fill an official DRE PDF. RE 306, RE 311, RE 313 and
 * RE 336 are DRE's forms and are never recreated, restyled, or reflowed. What is generated
 * here is the ANSWER SHEET for each — the exact text to transcribe into the official
 * fields, plus clearly labelled continuation sheets for answers that do not fit.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  COURSES, COURSE_DESIGN, DRE, ENROLLMENT_RULES, FEES, FINAL_EXAM, INSTRUCTOR, PRICING, PROVIDER, STATUS_LINE
} from "../config/california/submission-facts.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = path.join(root, "california/submission");
const addr = (a) => `${a.street}, ${a.city}, ${a.state} ${a.zip}`;
const written = [];

function write(dir, name, body) {
  const full = path.join(base, dir, name);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, body.trimStart());
  written.push(path.relative(root, full));
}

const HEADER = (course, doc) => `# ${doc}

**Course:** ${course.title} — ${COURSE_DESIGN.hours} Hours
**Applicant / sponsor:** ${PROVIDER.legalName}
**Prepared:** August 20, 2026
**Status:** ${STATUS_LINE}

`;

/* ---------------------------------------------------------------- RE 306 answer sheet */
function re306(course) {
  const checked15b = COURSE_DESIGN.re306_15B.map((b) => `  - ☒ **${b}**`).join("\n");
  const unchecked = COURSE_DESIGN.re306_15B_notChecked.map((b) => `  - ☐ ${b}`).join("\n");
  const item23 = course.interactiveParticipatory
    ? `**23A. ☒ YES**

**23B. Detail of the interactive participatory component**

Every one of the ${COURSE_DESIGN.lessonAssignments} lesson assignments carries a **required applied scenario exercise**. The student is given a transaction scenario and must submit a written work product — a file memorandum identifying the issue, the category of controlling source, the facts that remain unverified, the parties affected, the action required, the applicable deadline, the communication to be sent, the escalation if any, and the evidence to be retained — before the lesson assignment is recorded as complete.

Assignment 14 is a dedicated **implicit bias and fair housing participatory practicum**.

The component is neither optional nor skippable. The platform's method of control refuses to open the next segment until the scenario response has been submitted, and each submission is recorded against the student, scored against the instructor rubric, and remediated until responsive. See continuation sheet 23B.`
    : `**23A. ☐ YES  ☒ NO** — not applicable. This is not a Real Estate Practice course.

**23B.** Left blank.`;

  return HEADER(course, "RE 306 — Statutory/Pre-License Course Approval Application: answer sheet") + `
**Transcribe these answers onto the official RE 306 (Rev. 1/26). Do not recreate the form.**
Where an answer will not fit in the official field, the field gets a short entry plus "see continuation sheet", and the continuation sheet is attached behind the form.

## Sponsor/school information — items 1 to 11

| # | Field | Answer |
|---|---|---|
| 1A | DRE statutory/pre-license sponsor # | *(blank — no sponsor number has been issued)* |
| 1B | Name of applicant sponsor/school | **${PROVIDER.legalName}** |
| 2 | Other names used by the sponsor/school | **Blank — none.** The school trades under its full legal name. See administrative sheet A5. |
| 3 | Business telephone number | **${PROVIDER.phone}** |
| 4 | Sponsor/school classroom facility address | **${addr(PROVIDER.principalOffice)}** — annotate: *"No classroom instruction. ${COURSE_DESIGN.methodOfPresentation} course. Address shown is the principal office."* |
| 5 | Sponsor/school mailing address | **${addr(PROVIDER.mailingAddress)}** |
| 6 | Public contact email address | **${PROVIDER.publicEmail}** — monitored; DRE deficiency notices arrive here |
| 7 | Sponsor/school website address | **${PROVIDER.website}** |
| 8 | Approved by the Bureau for Private Postsecondary Education? | **☐ YES ☒ NO/EXEMPT** — Exemption: **California Education Code § 94874(d)(2)(A)**. See administrative sheet A4. |
| 9 | Type of ownership | ☐ Individual ☐ Partnership ☐ Corporation **☒ LLC** ☐ Other |
| 10 | Using a DBA or fictitious business name? | **☐ YES ☒ NO** — the school trades under its registered name, ${PROVIDER.legalName}, so no name other than the one in its Articles of Organization is used and B&P § 17900(b)(5) is not engaged. Nothing to attach. See administrative sheet A5. |
| 11 | Contact authorization — primary | **${INSTRUCTOR.name}**, ${PROVIDER.legalName}, ${PROVIDER.phone}, ${PROVIDER.publicEmail}. **Original signature written by hand.** No secondary contacts; those lines stay blank. |

## Course summary — items 12 to 23

| # | Field | Answer |
|---|---|---|
| 12 | Course title | **${course.title}** |
| 13 | Language used to teach the course | **English** |
| 14 | Length of course — total instruction hours | **${COURSE_DESIGN.hours}** |
| 16 | Publications used in the course | See the item 16 block below |
| 17 | Number of questions on final exam | **${FINAL_EXAM.questions}** |
| 18 | Minimum passing score | **${FINAL_EXAM.passingPercent}%** |
| 19 | Exam time given | **${FINAL_EXAM.minutes} minutes** |
| 20 | Exam will be administered as | ☐ Open book **☒ Closed book** |
| 21 | Procedure for the General Information Page prior to registration | See the item 21 block below |
| 22 | How and when students learn of the course/instructor evaluation form | See the item 22 block below |

### Item 15A — method of course presentation

- ☐ Live classroom/conference/symposium
- ☐ Live: online webinar
- ☒ **${COURSE_DESIGN.re306_15A}**
- ☐ Correspondence
- ☐ Internet
- ☐ Internet and mobile device app
- ☐ Mobile device app

### Item 15B — how the final exam will be offered

${checked15b}
${unchecked}

**Both boxes are checked, and the reason is on the form's own terms.** The examination is delivered through the ${PROVIDER.website} platform — non-printable, non-downloadable, and timing out at ${FINAL_EXAM.minutes} minutes, as RE 303 requires of an internet examination — **and** it is administered and supervised in person by a school-designated proctor, as **Regulation ${FINAL_EXAM.proctorRule}** requires of a correspondence course. Checking only one would misdescribe the arrangement. See continuation sheet 15B.

### Item 16 — publications to be used in the course

| Publication title | Author | Date of publication | Edition |
|---|---|---|---|
| *${course.title} — ${PROVIDER.legalName} California Course Text* | ${PROVIDER.legalName} | 2026 | 1.0 |

All instructional text is original and written for this course. **No third-party textbook, workbook, or instructor guide is used**, which is why RE 303 checklist item 7 (copyright authorization) is not applicable.

### Item 21 — providing the General Information Page prior to registration

The RE 313 General Information Page for this course is displayed in full on the course's public page at ${PROVIDER.website} and again inside the registration flow, **before any payment step and before an enrollment is accepted**. The student must scroll the page and affirmatively acknowledge it; the acknowledgment — student identity, page version, and timestamp — is recorded with the enrollment and is reproducible on request. A student cannot reach a payment screen without that record existing.

### Item 22 — informing students of the course and instructor evaluation form

Students are told three times, each time with a direct link to **RE 318A** on the DRE website at www.dre.ca.gov:

1. on the enrollment confirmation issued at registration;
2. in the student portal, persistently, for the whole time the course is open to them; and
3. on the completion screen shown immediately after the final examination result.

The third is the operative moment; the first two are surplus.

### Item 23 — interactive participatory component

${item23}

## School certification, page 3

The certification consents to DRE inspection and monitoring — direct-mail evaluation of past students, and drop-in monitoring of course offerings. Nothing in the platform obstructs either. Completion rosters are producible on request, and the regulator account supplied under RE 303 checklist item 15 gives a DRE monitor the same drop-in access to an internet course that a classroom monitor has to a room.

**Signed by ${INSTRUCTOR.name} for ${PROVIDER.legalName}. The signature and date are written by hand at filing — see the print-and-mail instructions.**
`;
}

/* ------------------------------------------------------------------- RE 313 answer sheet */
function re313(course) {
  return HEADER(course, "RE 313 — Statutory/Pre-License General Information Page: content to enter") + `
**RE 313 (Rev 1/26) is a fill-in Microsoft Word form supplied by DRE. Open the official file, type these values into its existing fields, and print it. Do not rebuild, restyle, or re-typeset the form, and do not move or reword any DRE label or boilerplate.**

The official file is held at \`california/dre-sources/re313.doc\`.

RE 313 carries DRE's own fixed boilerplate below the fill-in fields — the DRE disclaimer statement, attendance policy, student enrollment rules, final examination notes, identification statements, online evaluation statement, and course provider complaint statement. **None of that is retyped or altered.** It stays exactly as DRE wrote it.

## Fill-in fields

| RE 313 field | Value to enter |
|---|---|
| STATUTORY/PRE-LICENSE SCHOOL NAME | **${PROVIDER.legalName}** |
| WEB SITE ADDRESS / MOBILE DEVICE APP NAME | **${PROVIDER.website}** |
| DRE STATUTORY/PRE-LICENSE SCHOOL ID # | *(leave blank — DRE assigns this on approval)* |
| PHONE NUMBER | **${PROVIDER.phone}** |
| EMAIL ADDRESS | **${PROVIDER.publicEmail}** |
| ADDRESS (STREET, CITY, STATE, ZIP CODE) | **${addr(PROVIDER.mailingAddress)}** |
| COURSE NAME | **${course.title}** |
| BRIEF COURSE DESCRIPTION | ${course.description} |
| METHOD OF COURSE PRESENTATION | **${COURSE_DESIGN.methodOfPresentation}** |
| COURSE HOURS | **${COURSE_DESIGN.hours}** |
| METHOD OF FINAL EXAM PRESENTATION | **${COURSE_DESIGN.re306_15B.join(" and ")}** — the examination is delivered over the internet and supervised in person by a school-designated proctor |
| COURSE DATES AND LOCATION (for live lectures) | **Not applicable — this is not a live lecture course.** |
| COURSE FEES | See the fee block below — the field asks for package and discount terms too, so all three prices are disclosed |
| TEXTBOOK / WORKBOOK / OUTLINE — Title | *${course.title} — ${PROVIDER.legalName} California Course Text* |
| — Author(s) | ${PROVIDER.legalName} |
| — Copyright Date | 2026 |
| — Pages | *(enter the final bound page count of the printed course text)* |
| — Edition | 1.0 |
| REFUND/CANCELLATION POLICY | **Policy ${PRICING.refundPolicy.version}** — the text in the block below, entered verbatim |
| FINAL EXAMINATION CRITERIA — Number of questions | **${FINAL_EXAM.questions}** |
| — Types of questions | **${FINAL_EXAM.questionType}** |
| — Time | **${FINAL_EXAM.minutes} minutes** |
| — How many final exam attempts are allowed (one or two)? | **Two** — ${FINAL_EXAM.attemptsWording.toLowerCase()} |
| — Minimum passing percentage | **${FINAL_EXAM.passingPercent}%** |
| ADDITIONAL SCHOOL POLICY AND PROCEDURES | See the block below |

## ADDITIONAL SCHOOL POLICY AND PROCEDURES — text to enter

> **Delivery and progression.** This is a ${COURSE_DESIGN.methodOfPresentation.toLowerCase()} course of ${COURSE_DESIGN.lessonAssignments} separate lesson assignments totalling ${COURSE_DESIGN.hours} hours. Assignments are delivered in sequence; each segment must be completed before the next opens. Active study time is recorded by the platform against each assignment.
>
> **Final examination.** Closed book. ${FINAL_EXAM.questions} multiple-choice questions in ${FINAL_EXAM.minutes} minutes, ${FINAL_EXAM.passingPercent}% to pass. The examination is delivered over the internet and is administered and supervised in person by a proctor designated by the school. It is not printable and not downloadable, and it times out when the allotted time expires. ${FINAL_EXAM.attemptsWording}. A student who fails the retake does not receive credit and must retake the course.
>
> **Identification.** The student must present acceptable photo identification to the proctor immediately before the examination begins, as stated in the identification statement on this form.
>
> **Completion certificate.** Delivered within ${ENROLLMENT_RULES.certificateDeliveryDays} days of successful completion. A duplicate certificate is available on request for as long as the school holds the record.

## COURSE FEES — text to enter

RE 313's fee field asks for the total "**including any shipping and handling fees, course group package fees, discounts etc.**", so every way a student can buy this course is disclosed, not only the single-course price.

> **$${PRICING.singleCourse.usd}** — this course purchased on its own.
>
> **$${PRICING.requiredEducation.usd}** — *${PRICING.requiredEducation.name}*: this course together with the other two California statutory pre-license courses, ${COURSE_DESIGN.hours * 3} hours in total.
>
> **$${PRICING.completePath.usd}** — *${PRICING.completePath.name}*: all ${COURSE_DESIGN.hours * 3} hours plus California Exam Prep and the Licensing/Application Navigator. **Exam Prep and the Navigator are not statutory pre-license education, carry no DRE course credit, and are not part of this application.**
>
> No shipping or handling fee. The course is delivered online; no printed material is shipped to the student.

## REFUND/CANCELLATION POLICY — text to enter

**Policy version ${PRICING.refundPolicy.version}**, adopted by ${PROVIDER.legalName} on 20 August 2026. This is the same version the enrollment flow presents before checkout, the same version the student acknowledges and the platform records against the enrollment, the same version published in the ${PROVIDER.legalName} Terms, and the same version the refund administration path calculates against. Enter it verbatim.

> ${PRICING.refundPolicy.policyText}

The policy stated clause by clause, as it is implemented:

| Clause | Text |
|---|---|
| Full refund | ${PRICING.refundPolicy.fullRefundWindow} |
| Pro rata | ${PRICING.refundPolicy.proRataWindow} |
| No refund after | ${PRICING.refundPolicy.noRefundAfter} |
| Packages | ${PRICING.refundPolicy.packageAllocation} |
| Processing | ${PRICING.refundPolicy.processing} |
| How to request | ${PRICING.refundPolicy.requestMethod} |

**How the percentages are measured.** Regulation 3000(a)(1) defines a correspondence course as a number of separate lesson assignments, so completion is counted in **assignments completed out of ${COURSE_DESIGN.lessonAssignments}**, not in elapsed time and not in pages opened. The 60% threshold is therefore reached after the ${Math.floor(COURSE_DESIGN.lessonAssignments * 0.6)}th assignment; a student at or below ${Math.floor(COURSE_DESIGN.lessonAssignments * 0.6)} completed assignments who has not attempted the final examination is inside the pro-rata window.

**"Seven business days"** is counted Monday through Friday. The adopted policy names no holiday calendar and ${PROVIDER.legalName} has not adopted one, so none is applied; this is recorded rather than left implicit because a holiday convention would lengthen the window, and the shorter reading is the one currently implemented.

**Where the platform enforces it.** The policy version is written into the checkout attempt and the Stripe session metadata before payment, and into a per-course allocation row that records how many cents of the purchase are this course's tuition. The refund path recomputes the entitlement from that allocation and from the student's own progress record; an administrator can refund less than the policy allows but cannot refund more without an explicit override, and the policy's own decision is stored alongside whatever was sent.

## Delivery to the student

RE 313's own header states the requirement: **"To be provided to the participant prior to registration/enrollment."** The mechanism is described in the RE 306 item 21 answer sheet, and it is enforced by the platform rather than by a policy: no enrollment can be accepted without a recorded acknowledgment of this page.
`;
}

/* -------------------------------------------------------------- RE 311 specimen sheet */
function re311(course) {
  return HEADER(course, "RE 311 — Statutory/Pre-License Course Completion Certificate: specimen") + `
**RE 311 (Rev 1/26) is a DRE sample, not a form to be filed.** Its own notice says so:

> "Schools may format their certificates in any reasonable manner and size. **However, failure to include the content of this sample may result in DRE's rejection of students' license examination applications.** It is strongly suggested that schools use this sample format in order to ensure acceptance of certificates by DRE.
>
> Any variation to your certificate, once approved by DRE, will require it to be resubmitted for approval prior to issuing new certificates."

**Decision: StateCourse uses the RE 311 sample format itself, unchanged.** The notice permits reformatting and then warns about the consequence of omitting content and the burden of resubmitting variations. Taking the permission buys nothing and costs a rejection risk on every student's examination application. The official sample at \`california/dre-sources/RE311.pdf\` is the specimen submitted with this application.

## Field map — what the platform supplies for each RE 311 field

| RE 311 field | Source | Value for this course |
|---|---|---|
| NAME OF STUDENT | Enrollment record | *per student* |
| STUDENT MAILING ADDRESS (STREET) | Enrollment record | *per student* |
| CITY / STATE / ZIP CODE | Enrollment record | *per student* |
| NAME OF OFFERING AS APPROVED BY THE DEPARTMENT | Certification record | **${course.title}** *(as approved — exact wording follows DRE's approval)* |
| COURSE TYPE | Fixed for this offering | ☐ Live course ☐ Correspondence course **☒ ${COURSE_DESIGN.re311CourseType}** ☐ Correspondence/mobile device app |
| **DRE APPROVAL NUMBER** | Certification record | **BLANK until DRE assigns it.** See the hard gate below. |
| NUMBER OF CREDIT HOURS | Course design | **${COURSE_DESIGN.hours}** |
| DATE OF REGISTRATION | Enrollment record | *per student* |
| DATE OF COMPLETION | Completion record — the date the final examination was passed | *per student* |
| COURSE LOCATION (STREET ADDRESS AND CITY) | Fixed | ${PROVIDER.principalOffice.city}, ${PROVIDER.principalOffice.state} *(the school's location; the course is ${COURSE_DESIGN.methodOfPresentation.toLowerCase()})* |
| SPONSOR VERIFICATION | Fixed for this offering | ☒ **"Successfully completed the correspondence course and passed the final exam with a score of ${FINAL_EXAM.passingPercent}% or better."** The live-course line is not used. |
| NAME OF SPONSORING ENTITY (AS APPROVED BY DRE) | Certification record | **${PROVIDER.legalName}** |
| ADDRESS OF SPONSORING ENTITY | Fixed | ${addr(PROVIDER.mailingAddress)} |
| TELEPHONE NUMBER | Fixed | *(entered at signing)* |
| SIGNATURE OF VERIFIER | Per certificate | ${INSTRUCTOR.name} |
| PRINTED NAME OF VERIFIER | Fixed | ${INSTRUCTOR.name} |
| ADDRESS OF VERIFIER | Fixed | ${addr(PROVIDER.mailingAddress)} |
| TELEPHONE NUMBER (verifier) | Fixed | *(entered at signing)* |

## The hard gate

**DRE APPROVAL NUMBER is a required field on the certificate, and DRE assigns it. Until it exists, no certificate may issue.**

This is enforced in the platform, not in a policy document. The California course configuration holds \`approval_number: null\`; the certificate issuance path reads that field; and with it null the request is refused and the reason names the missing approval number. A test asserts the live configuration cannot reach certificate eligibility. **No approval number is ever invented, and no placeholder that could be mistaken for a real number is ever written into the field.**

The same gate covers the DRE STATUTORY/PRE-LICENSE SCHOOL ID # on RE 313 and item 1A on RE 306. All three stay blank until DRE fills them.

## Delivery and duplicates

**Regulation ${ENROLLMENT_RULES.certificateDeliveryAuthority}:** the school shall, within **${ENROLLMENT_RULES.certificateDeliveryDays} days** of a student's successful completion, deliver a document to the student evidencing completion. The platform computes the delivery deadline from the **completion** date rather than the issuance date, so a late issuance cannot quietly reset the clock.

**Regulation 3000(a)(4):** the school shall maintain records for each student sufficient to allow preparation of a **duplicate certificate on request**. Duplicates are produced from the completion record; corrections are appended and supersede rather than overwriting, so the original record of what happened is never edited away.
`;
}

/* ------------------------------------------------------------------- per-course index */
function packageIndex(course) {
  const rows = [
    ["1", "Completed RE 306", `\`01-re306-answer-sheet.md\` → transcribe onto the official RE 306`],
    ["2", "Application fee", `\`02-fee-reference.md\` — $${FEES.perCourse} for this course`],
    ["3", "Sponsor/entity documentation", "Administrative section A2 — one set serves all three applications; cross-referenced, not duplicated"],
    ["4", "Instructional material required for submission", `\`04-instructional-material-manifest.md\` — ${COURSE_DESIGN.lessonAssignments} lesson assignments, printed in full`],
    ["5", "RE 336", "Administrative section A7 — one RE 336 per course; this course's form is A7/" + course.order],
    ["6", "RE 313", "`06-re313-general-information-page.md` → type into the official RE 313 Word form"],
    ["7", "Timed course outline", `\`../../${course.courseId}/submission/timed-course-outline.md\``],
    ["8", "Student final exam instructions", `\`../../${course.courseId}/submission/final-exam-student-instructions.md\``],
    ["9", "Proctor instructions", `\`../../${course.courseId}/submission/final-exam-proctor-instructions.md\``],
    ["10", "Student Final Exam Form A", `\`../../${course.courseId}/submission/final-exam-form-a-student.md\``],
    ["11", "Student Final Exam Form B", `\`../../${course.courseId}/submission/final-exam-form-b-student.md\``],
    ["12", "Instructor/Answer Key Form A", `\`../../${course.courseId}/submission/final-exam-form-a-answer-key.md\``],
    ["13", "Instructor/Answer Key Form B", `\`../../${course.courseId}/submission/final-exam-form-b-answer-key.md\``],
    ["14", "Regulator/student login instructions", "`14-login-instructions.md`"],
    ["15", "RE 311 certificate specimen", "`15-re311-certificate-specimen.md` + the official RE 311 sample"]
  ].map(([n, what, where]) => `| ${n} | ${what} | ${where} |`).join("\n");

  return HEADER(course, `Course package ${course.order} — ${course.title}`) + `
This is one of three applications. **Assemble in this order**; it is the RE 303 checklist order, which is the order a reviewer reads.

| # | Item | Where |
|---|---|---|
${rows}

## Facts a reviewer will check across this package

| | |
|---|---|
| Course title | ${course.title} |
| Hours | ${COURSE_DESIGN.hours} |
| Lesson assignments | ${COURSE_DESIGN.lessonAssignments} × ${COURSE_DESIGN.minutesPerAssignment} minutes = ${COURSE_DESIGN.totalInstructionalMinutes} minutes |
| Delivery | ${COURSE_DESIGN.methodOfPresentation} |
| Final examination | ${FINAL_EXAM.questions} ${FINAL_EXAM.questionType.toLowerCase()} questions, ${FINAL_EXAM.minutes} minutes, ${FINAL_EXAM.passingPercent}% to pass, ${FINAL_EXAM.openOrClosedBook.toLowerCase()} |
| Attempts | ${FINAL_EXAM.attemptsWording} (${FINAL_EXAM.forms.join(" / ")}) |
| Examination supervision | In-person proctor designated by the school — Regulation ${FINAL_EXAM.proctorRule} |
| Sponsor | ${PROVIDER.legalName}, ${PROVIDER.entityType}, CA SoS ${PROVIDER.secretaryOfStateFileNumber} |
| Proposed instructor | ${INSTRUCTOR.name}, DRE broker licence ${INSTRUCTOR.dreBrokerLicense} — ${INSTRUCTOR.approvalStatus.toLowerCase()} |
| Fee | $${FEES.perCourse} |

**Every one of those values is generated from \`config/california/submission-facts.mjs\` and re-checked by \`tests/california-submission-consistency.test.mjs\`.** If a document in this package disagrees with the table, the test fails.
`;
}

function feeReference(course) {
  return HEADER(course, `Application fee reference — ${course.title}`) + `
| | |
|---|---|
| Fee for this course | **$${FEES.perCourse}.00** |
| Authority | ${FEES.authority} |
| Applications being filed | ${FEES.courseCount} (${COURSES.map((c) => c.title).join("; ")}) |
| **Total across all three** | **$${FEES.total}.00** |
| Payable to | **${FEES.payableTo}** |
| Accepted methods | ${FEES.methods.join(", ")} |
| Never send | ${FEES.doNotSend} |
| Refundable? | **No.** The process fee is non-refundable and must be received before the application is processed. |

**One check or three?** See the print-and-mail instructions. The recommendation there is **three separate checks of $${FEES.perCourse}**, one clipped to each application, so that a problem with one application cannot hold up the other two and so that DRE's cashier can match each payment to its file without reading a memo line.

If paying by credit card instead, use form **RE 909** — one per application — and do not send a check.
`;
}

function materialManifest(course) {
  return HEADER(course, `Instructional material manifest — ${course.title}`) + `
## What RE 303 requires, and why all of it is printed

RE 303 says two things about instructional material that look like they conflict, and do not.

**Checklist item 6, general rule:**
> "Printed copies of all instructional materials, student materials, textbooks, case studies, sample forms, etc. need to be submitted. Any material presented via digital media (CD's, DVD's, USB Flash Drive, etc.) cannot be accessed by DRE and therefore, a printed version of the contents must be submitted to the Department."

**The same item, on published textbooks:**
> "It has generally been found that approximately 450 pages of text/instructional material is equivalent to textbooks offered by a California college or university. Please only submit a copy of the textbook's 'table of contents,' 'cover,' and 'publication page' with the RE 306. **Do not send a copy of the actual textbook unless requested by DRE.**"

**And, decisively for this application, the Internet Courses section:**
> "**Hard copies of all course material to be viewed by student on the Internet must be submitted with the application.**"

The textbook carve-out exists so that an applicant does not mail DRE a commercially published book DRE can identify from its cover. **It does not apply here**, for two reasons. There is no third-party textbook — the course text is original and is itself the instructional material, so withholding it would leave DRE nothing to evaluate against the statutory equivalency test in B&P § 10153.5. And the internet-course paragraph is specific and unconditional: *all* course material a student views online is submitted in hard copy.

**Conclusion: the full course text is printed and submitted.** Approximately 450 pages is DRE's own stated benchmark for college equivalency, and this course sits at that benchmark.

## What is in the printed course text

| | |
|---|---|
| Lesson assignments | ${COURSE_DESIGN.lessonAssignments}, printed in full and in order |
| Instructional minutes per assignment | ${COURSE_DESIGN.minutesPerAssignment} |
| Total instructional time | ${COURSE_DESIGN.totalInstructionalMinutes} minutes = ${COURSE_DESIGN.hours} hours |
| Source | \`california/${course.courseId}/curriculum/lesson-01.md\` … \`lesson-15.md\` |

Bind with a **cover page**, a **publication page** (title, author ${PROVIDER.legalName}, copyright 2026, edition 1.0), and a **table of contents** at the front, so the volume simultaneously satisfies the textbook-identification instruction and the full-material instruction. The exact page count goes on RE 313's "Pages" field once the volume is bound.

## What is NOT printed and NOT mailed

- **No answer keys inside the student material.** The instructor answer keys are separate submission items (checklist 14) and are placed behind the examinations, not inside the course text.
- **No digital media of any kind.** RE 303 is explicit that DRE cannot access it.
- **No third-party textbook**, because none is used.
- **No marketing material, pricing page, or Stripe/payment material.** None of it is part of a course approval application and none of it is submitted.
`;
}

function loginInstructions(course) {
  return HEADER(course, `Student and regulator log-in information — ${course.title}`) + `
**RE 303 checklist item 15** requires student and regulator log-in information for courses and final examinations offered online. **RE 303, Internet Courses** additionally requires evidence of "a method of control … to require the student to complete each segment of the course before progressing to the next."

## Credentials

**Credentials are issued on the production system at filing time and written onto the printed copy of this sheet by hand. They are not stored in this repository and are not committed to source control.**

| Account | Purpose | Where the credential is written |
|---|---|---|
| **DRE regulator account** | Full review access to this course: every lesson assignment, every assessment, and both final examination forms, without study-time gating | Handwritten on the printed sheet at filing |
| **Sample student account** | The course exactly as a student experiences it, including sequential control | Handwritten on the printed sheet at filing |

Sign-in address: **${PROVIDER.website}**

## What the regulator account does that a student account does not

| Behaviour | Student | DRE regulator |
|---|---|---|
| Sequential progression enforced | Yes | Bypassed, so a reviewer can open any assignment directly |
| Minimum study time before an assignment completes | Enforced | Bypassed |
| ${ENROLLMENT_RULES.minimumSingleCourseCompletion} minimum before the final examination | Enforced | Bypassed |
| Proctor authorization required before the final examination | Required | Bypassed |
| Both examination forms visible | No — one form per attempt, never furnished directly | Yes, both forms and both answer keys |
| Activity written to a student completion record | Yes | **No — reviewer activity is recorded separately and can never enter a student record or a regulatory report** |

That last row is the one that matters. A regulator browsing the course must not be able to contaminate a student's completion evidence, and the platform records reviewer sessions in a separate audit stream so that it cannot.

## Method of control, for the item-15 evidence

Each lesson assignment opens only when the previous one is recorded complete. Within an assignment, each section opens only when the previous section is recorded as viewed and its checkpoint answered. Active study time accumulates from client heartbeats, discards a heartbeat separated from the last by more than the configured gap, and stops accruing after the idle threshold — so a student who leaves a page open accrues nothing. Completion of an assignment requires every section viewed in order, the applied exercise submitted, and the assessment passed.

## Final examination controls, for the internet-examination requirement

| RE 303 requirement | How it is met |
|---|---|
| Not printable | Print is refused by the examination view; the page renders nothing to a print context |
| Not downloadable | Items are delivered per question and never as a file; no examination form exists as a downloadable document on the student side |
| Times out when the allotted time expires | A non-pausing server-authoritative clock; the examination auto-submits whatever has been answered at ${FINAL_EXAM.minutes} minutes |
| The person enrolled is the person taking the exam | Photo identification verified in person by the school-designated proctor immediately before the examination, against the enrollment record |
| Never furnished directly to students | Answer keys never leave the server; the student payload carries only item id, prompt, and choices, and a test asserts no other field can appear |
`;
}

for (const course of COURSES) {
  write(course.packageDir, "00-package-index.md", packageIndex(course));
  write(course.packageDir, "01-re306-answer-sheet.md", re306(course));
  write(course.packageDir, "02-fee-reference.md", feeReference(course));
  write(course.packageDir, "04-instructional-material-manifest.md", materialManifest(course));
  write(course.packageDir, "06-re313-general-information-page.md", re313(course));
  write(course.packageDir, "14-login-instructions.md", loginInstructions(course));
  write(course.packageDir, "15-re311-certificate-specimen.md", re311(course));
}

console.log(`Generated ${written.length} documents:`);
for (const f of written) console.log("  " + f);
