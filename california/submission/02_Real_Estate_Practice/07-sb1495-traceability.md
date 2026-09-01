# SB 1495 traceability — Real Estate Practice

**Applicant:** StateCourse LLC
**Course:** Real Estate Practice (45 hours, 15 lesson assignments)
**Status:** Submission draft. Not filed. No DRE approval has been issued for this course.
**Generated:** `node scripts/generate-sb1495-traceability.mjs` — every row below is found by reading the course, not typed.

## What is being demonstrated

RE 306 item 23B asks whether the course contains the SB 1495 components. This sheet is the
evidence behind the answer. It exists because **"Compliant with SB 1495" is a sentence, and the
Department is entitled to the thing the sentence refers to.**

The requirement, in the Department's own words:

> The real estate practice course must include a component on implicit bias, including education regarding the impact of implicit bias, explicit bias, and systemic bias on consumers, the historical and social impacts of those biases, and actionable steps students can take to recognize and address their own implicit biases.
>
> The course must include a component on federal and state fair housing laws as those laws apply to the practice of real estate, and that component shall include an interactive participatory component during which the applicant shall role play as both a consumer and real estate professional.

*— DRE, Frequently Asked Questions Associated with New SB 1495 Education Requirements for Exam Applicants, New 05/2023, read 2026-08-22 from https://www.dre.ca.gov/files/pdf/faqs/FAQ_SB1495.pdf*

## 1. The implicit bias component

| Element the FAQ requires | Taught at | Printed volume | Examined by |
|---|---|---|---|
| the impact of implicit bias, explicit bias, and systemic bias on consumers | Assignment 14 §1.1, §1.2, §1.3, §1.4, §3.1, §5.6, §6.7, §6.8 | p. 332 | A-79 (§1.1), A-80 (§3.1), B-80 (§1.4) |
| the historical impacts of those biases | Assignment 14 §2.2, §2.7, §6.8 | p. 335 | A-81 (§2.7) |
| the social impacts of those biases | Assignment 14 §2.3, §2.5, §6.8 | p. 336 | A-84 (§2.3) |
| actionable steps students can take to recognize and address their own implicit biases | Assignment 14 §2.4, §2.5, §3.2, §6.8 | p. 336 | B-82 (§3.2) |

## 2. The fair housing component — federal **and** state

| Element the FAQ requires | Taught at | Printed volume | Examined by |
|---|---|---|---|
| federal fair housing law as it applies to the practice of real estate | Assignment 14 §2.6, §5.7, §6.6, §6.8 | p. 337 | B-81 (§2.6) |
| state fair housing law as it applies to the practice of real estate | Assignment 14 §2.7, §2.8 | p. 337 | A-81 (§2.7), B-83 (§2.8) |

**The state component is not a formality.** The federal Fair Housing Act protects race, color,
religion, sex, familial status and national origin; Government Code § 12955 adds gender identity,
gender expression, sexual orientation, marital status, ancestry, **source of income**, **veteran or
military status**, genetic information and medical condition. A licensee who knows only the
federal list acts lawfully under federal law and unlawfully in California, which is why the course
teaches the two together and examines the difference.

## 3. The interactive participatory component

> "interactive participatory component during which the applicant shall role play as both a consumer and real estate professional."

### 3.1 The two roles

| Role the FAQ names | Course section | First subsection | Printed volume | Recorded in the database as |
|---|---|---|---|---|
| the applicant shall role play as a **consumer** | §4 — Participatory practicum: the consumer role | 4.1 | p. 341 | `sb1495_participatory_submissions.participant_role = 'consumer'` |
| the applicant shall role play as a **real estate professional** | §5 — Participatory practicum: the licensee role | 5.1 | p. 342 | `sb1495_participatory_submissions.participant_role = 'licensee'` |

### 3.2 What the student does, in order

1. Reads the scenario in the lesson section for the role.
2. Writes a response **from inside that position**, addressing each question the section sets.
3. Submits it. The text is stored as written, with the date and time.
4. In the licensee role, reads the structured feedback and **submits a revision**, which is stored
   as a further revision rather than replacing the first — so the evidence that the feedback step
   happened is not destroyed by the step that follows it.
5. Cannot complete the assignment until both roles are recorded.

### 3.3 The properties that make it real, and what proves each

**A participatory component described in a syllabus and unenforced by the platform is a
participatory component a student can skip.** Each row below names the file and the construct
that makes the property true; the generator checks that the construct is actually there, and
fails if it is not.

| Property | Proved by | Verified |
|---|---|---|
| a response is persisted for each role, with the text the student wrote | `database/012_sb1495_participatory_component.sql` — table `sb1495_participatory_submissions`, column `response` | **YES** |
| a submission cannot be a single character | check constraint `length(btrim(response)) >= 200`, and the same figure in the study path | **YES** |
| the practicum assignment cannot reach 'completed' with either role missing | trigger `sb1495_assignment_completion_guard` on `lms_assignment_state`, before insert or update | **YES** |
| the study path applies the same rule, so the student sees it rather than hitting a database error | `netlify/functions/student-course.mjs` — `finishIfReady` reads `sb1495_participation` before completing the practicum | **YES** |
| final examination eligibility reports the interactive requirement from the submissions, not from the assignment count | `refresh_california_eligibility` sets `interactive_requirements_complete` from `sb1495_participation` | **YES** |
| an incomplete component names which role is outstanding, not merely that something is | `remaining_requirements` carries 'SB 1495 participatory component - consumer role' and '- real estate professional role' | **YES** |
| the components cannot be taken apart from the practice course (FAQ Q7) | `record_sb1495_submission` raises `sb1495_not_applicable_to_this_course` for any enrollment whose course does not carry the requirement | **YES** |
| the evidence of both roles travels with the completion record | `course_completion_certificates.sb1495_participation` and `california_sb1495_completion_evidence` | **YES** |
| a reviewer browsing the practicum writes no student submission | the study path routes every non-student mode away before the submission handler, and reviewer activity is recorded in `course_review_access` | **YES** |
| the student is shown two role boxes and which of them is outstanding | `public/statecourse/student/course/student-course.js` — `renderParticipatory` | **YES** |

### 3.4 What a reviewer can do to check it

**With the regulator account** (credentials supplied on the private insert, not in this document):

1. Open Real Estate Practice, Assignment 14.
2. The two role panels appear beneath the lesson, one per role, each showing whether it has been
   submitted. In review mode they are marked as not recording against a student record.
3. Open the student account instead and attempt to complete the assignment with one role
   submitted. The assignment does not complete, and the final examination page lists
   **"SB 1495 participatory component — real estate professional role"** among the outstanding
   requirements by name.

## 4. Assessment within the assignment

| Instrument | Items |
|---|---|
| Applied exercise (100% required) | 1 |
| Engagement check (80% required) | 5 |
| Remediation alternate set | 5 |
| Final examination items sourced to this assignment | 12 across both forms |

## 5. Completion evidence

SB 1495 requires an applicant to **show evidence** of having completed a compliant practice course.

- The completion record carries `sb1495_participation` — the roles taken and when — so the
  evidence of compliance travels with the evidence of completion rather than being reconstructed
  later from memory.
- The **General Information Page** states *Compliant with SB 1495*.
- The **RE 311 course completion certificate** states *Compliant with SB 1495*.
- `california_sb1495_completion_evidence(enrollment_id)` returns the dated evidence for any
  enrollment, which is what a duplicate certificate request is answered from.

## 6. What is asserted here, and what is not

**Asserted:** the course contains both components, the fair housing component includes an
interactive participatory element in both roles, and the platform will not record completion of
the practice course for a student who has taken only one role.

**Asserted:** the two components are delivered as part of this practice course and cannot be
taken separately from it, as FAQ Q7 requires.

**Not asserted:** that DRE has approved this course, or found it SB 1495 compliant. No approval of
any kind has been issued. The statement *Compliant with SB 1495* describes the course's content
against the statute; it is not a claim of Departmental approval.
