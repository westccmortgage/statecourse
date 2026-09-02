# Distance delivery controls — Texas qualifying education

**Status: SPECIFICATION. Every listed control now names a held source or is explicitly adopted as a
StateCourse policy.**

## Where the sourced ones come from, and what that is worth

**The text is TREC's.** TREC's own consolidated reproduction of 22 TAC §§ 535.62 and 535.65 is held
at `texas/trec-sources/trec-rules/535.62.txt` and `texas/trec-sources/trec-rules/535.65.txt`
(§ 535.65: sha256 `fbaeedb3…`, 16,135 bytes, retrieved 2026-08-29), hashed on disk and registered
subsection by subsection in `config/texas/law-of-agency-statute-sources.mjs` and
`config/texas/trec-rules-source-lock.mjs`. Every row below marked *held* was read there.

**The lettering and current text are the Secretary of State's.** The 28 August 2026 Texas Register
(TRD-202602955), held at
`texas/trec-sources/texas-register/2026-08-28-title22-adopted-rules.html`, republishes final adopted
§§535.62 and 535.65 in full. They have been effective since 31 August 2026.

**The live TAC portal remains unavailable for the other provider sections.** That is why
`TX_PROVIDER_RULE_SOURCE_LOCK` still returns **FAIL**; it no longer fails on §§535.62 or 535.65.

**§ 535.65(a)(1) — the provider's own responsibilities**, in the held text:

> *"(A) the administration of each course, including … compliance with any prescribed period of time
> for any required course topics …; (B) maintaining student attendance records and pre-enrollment
> agreements; (C) verifying instructor qualification, performance and attendance; (D) proper
> examination administration; (E) validation of student identity acceptable to the Commission;
> (F) maintaining student course completion records; (G) ensuring all advertising complies …;
> (H) ensuring that instructors or other persons do not recruit or solicit prospective sales agents
> … during course presentation; and (I) ensuring staff is reasonably available for public inquiry
> and assistance."*

| # | Control | Requirement source | Status |
|---|---|---|---|
| 1 | **Identity** validation acceptable to the Commission | held § 535.65(a)(1)(E), with (g)(2)(A) for distance delivery | sourced; method not yet designed |
| 2 | Authenticated student account, one enrolment owner | provider design, serving § 535.65(g)(2)(A) | specified |
| 3 | Topic progression lock — no advance until every topic-quiz question is answered correctly and the scenario exercises are passed | held § 535.62(b)(7)(C)(i) | sourced. **Corrected 2026-08-30: this is a rule requirement for distance delivery, not the provider design this file called it.** |
| 4 | Instructional time accounted against the prescribed period for required topics | held § 535.65(a)(1)(A) with (g)(3)–(5), plus the PRINS1-1 form minutes | sourced; accounting not built. See the note below on units versus topics |
| 5 | **Attendance** records and pre-enrolment agreements retained | held § 535.65(a)(1)(B), contents at (d)(1)(A)–(H) | sourced |
| 6 | Instructor qualification, performance and attendance verified | held § 535.65(a)(1)(C), with (b)(1) and § 535.63(a)–(b) | sourced |
| 7 | Proper **examination** administration | held § 535.65(a)(1)(D), with (h)(1) and (h)(5) | sourced; method not yet designed |
| 8 | Student **completion record** maintained and submitted through a Commission-acceptable process | final adopted §535.65(a)(1)(F) and (j) | sourced; implementation awaits REALM workflow and approval |
| 9 | Staff reasonably available for public inquiry and assistance | held § 535.65(a)(1)(I) | sourced |
| 10 | No recruiting or soliciting during course presentation | held § 535.65(a)(1)(H) | sourced |
| 11 | Attempt logging on every quiz and examination | provider design | specified |
| 12 | Quiz rationale on an incorrect answer, then a related replacement question that counts toward passing the topic | held § 535.62(b)(7)(C)(ii) | sourced. **Corrected 2026-08-30: a rule requirement for distance delivery, not provider design.** |
| 13 | Scenario grading with a recorded outcome | held § 535.62(b)(7)(B) fixes the count and (b)(7)(C)(i) requires a passing grade; **recording** the outcome is provider design | sourced in part |
| 14 | Final examination version rotation across four forms | held § 535.62(b)(8) (at least four versions) with § 535.65(h)(4) (rotate all versions throughout the approval period in a manner acceptable to the Commission) | sourced. **Corrected 2026-08-30: not provider design. Holding four versions is not compliance; rotating them is.** |
| 15 | Printable and exportable student records | held § 535.65(l)(4) — records may be kept electronically but must be "in a common format that is legible and easily printed or viewed without additional manipulation or special software" | sourced. **Corrected 2026-08-30: not provider design.** |
| 16 | Log out the student or stop instructional-time credit after 10 minutes of inactivity | TREC's still-published 04/10/2023 distance-course checklist | **adopted as conservative StateCourse policy.** No current rule provision is claimed to set the value |
| 17 | Final examination eligibility gated on completion of all coursework | held § 535.65(h)(3) — no student may view or take the final examination before completing regular course work and any required makeup sessions — with (g)(2)(C), which requires the provider to ensure the student has completed all instructional modules | sourced |
| 18 | Examination confidentiality | held § 535.65(h)(2) — final examination questions must be kept confidential **and be significantly different** from any quiz questions and exercises used in the course. The rule does not quantify "significantly different"; any similarity threshold adopted is a provider choice | sourced |
| 19 | Retake gated behind provider-prescribed remediation, and the 90-day limit | held § 535.65(i)(1)–(3) — a subsequent final examination only after the student completes additional course work prescribed by the provider; no later than the 90th day after the original class concludes; a different version complying with § 535.62(b)(8) and § 535.65(h); failure to complete it in time drops the student with no credit. The **content** of the remediation is left to the provider | sourced |
| 20 | Second failure requires retaking the course | held § 535.65(h)(6) and (i)(4) — no credit to a student who fails a final examination and a subsequent one; a second failure requires retaking the course and the final course examination. Two graded attempts per enrolment; no held provision permits a third | sourced |
| 21 | Record retention period | held § 535.65(l)(1) — a **minimum of four years** after course completion, including course and instructor evaluations and student enrollment agreements | sourced |
| 22 | Instructor response and grading-rationale standard | held § 535.65(g)(2)(B) — a qualified instructor available to answer questions or provide assistance "as necessary in a timely manner" — and (g)(2)(D) — a qualified instructor responsible for providing answers and rationale for the grading of the course work | sourced; the rule does not quantify "timely", so the numeric response standard is **provider policy** |
| 23 | Proctoring of the distance final examination | **no held provision requires one** | **provider policy choice, not a requirement.** See below |
| 24 | Post-completion instructor and course evaluation | held § 535.65(k)(1)–(5) | sourced as a duty; **the Commission's approved form under (k)(3) is not held**, so the questions cannot be written — see the gaps below |

### Row 4 — units versus topics

§ 535.65(g)(4) says the periods of time prescribed to each **unit** of a topic on the course approval
form "are recommendations and may be altered". § 535.65(g)(5) says that notwithstanding that, "all
units must be presented within the prescribed topic". So the **topic-level** allocation is the
binding one and the unit-level minutes are not. Per-unit accounting remains this project's method —
it is how the topic total is evidenced — but it is provider methodology, and a unit that runs over or
under its printed minutes is not by itself a defect. § 535.65(g)(3) also confirms a provider need not
present topics in the order the form outlines.

### Row 23 — proctoring decision

The 2025 adopted amendments to §535.65 removed the general qualifying-course proctoring requirement
and, as a result, the closed-book requirement. The current final §§535.62 and 535.65 require an
**outcome**: §535.65(h)(5) requires the examination
to be administered "under conditions that ensure the student taking the examination is the student
who registered for and took the course", and § 535.65(g)(2)(A) requires a student identity
verification process "acceptable to the Commission". The two places a proctor is mentioned at all
point the other way — § 535.65(d)(1)(F) requires the pre-enrolment agreement to disclose proctoring
procedure and fees **"if applicable"**, which presupposes it may not be, and § 535.65(g)(1)(C)
requires a monitor only for a **classroom** course delivered through technology to more than 20
registered students. The Principles II reading reached the same conclusion.

StateCourse therefore selects **no human proctor, no closed-book promise and no proctoring fee**.
Identity verification, confidentiality, version rotation and the exact Commission-approved exam
method remain mandatory. If TREC approves a different method for a course, the specification and
enrollment agreement must be versioned before use.

## The remaining gaps

- **The final §535.65(j) is now read.** It requires submission of completion records not sooner than
  the number of course credit hours has passed and not later than the tenth calendar day after
  completion. For courses completed on or after 1 October 2026, the record carries the student's
  TREC licence number or, if none has issued, application number. The exact REALM submission
  workflow remains approval/portal work; no completion record can be issued before approval.
- **The Commission's approved evaluation form under § 535.65(k)(3) is not held.** The rule requires a
  provider evaluating an instructor or course to use **all** of the questions from the
  Commission-approved form, **in the same order**, adding its own only after them. The form's wording
  is unknown to this project, so row 24 names the duty and no evaluation instrument may be built as
  if the questions were known.
- **The current effective course application's private fields remain login-gated.** The 2023
  checklist is still linked from TREC's current course page, but current application review may ask
  for a different implementation. The 10-minute value is therefore a provider policy, not a claim
  about current rule text.

**The one thing this file states without qualification.** No control listed here is presented to a
student, in marketing, or in an application as a Commission requirement on the strength of this file
alone. StateCourse holds no TREC approval, no provider approval number and no course approval
number, and holding these rules is not approval.
