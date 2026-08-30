# Distance delivery controls — Texas qualifying education

**Status: SPECIFICATION. Most controls are now sourced against held rule text; one is not, and the
gate counts it.**

## Where the sourced ones come from, and what that is worth

**The text is TREC's.** TREC's own consolidated reproduction of 22 TAC §§ 535.62 and 535.65 is held
at `texas/trec-sources/trec-rules/535.62.txt` and `texas/trec-sources/trec-rules/535.65.txt`
(§ 535.65: sha256 `fbaeedb3…`, 16,135 bytes, retrieved 2026-08-29), hashed on disk and registered
subsection by subsection in `config/texas/law-of-agency-statute-sources.mjs` and
`config/texas/trec-rules-source-lock.mjs`. Every row below marked *held* was read there.

**The lettering is the Secretary of State's, and it is lettering from a proposal.** TREC's page
prints §§ 535.62 and 535.65 as indentation and never prints a subsection letter. The letters used
below come from the Secretary of State's Texas Register of 22 May 2026 (TRD-202601975), held at
`texas/trec-sources/texas-register/2026-05-22-title22-proposed-rules.html`, which publishes both
rules in full **with** their lettering. On 2026-08-30 the two copies were diffed paragraph by
paragraph, whitespace normalised: identical word for word except at § 535.62(i)(2) and § 535.65(j).
That capture is registered at **CONTEXTUAL** tier, because a published proposal is not the adopted
rule.

**The codified text has never been read from this environment, and that has not changed.**
`texas-sos.appianportalsgov.com` serves a JavaScript shell to a non-browser client and the legacy
`texreg.sos.state.tx.us` reader redirects to it; both were re-tested 2026-08-29 and both still fail.
So `TX_PROVIDER_RULE_SOURCE_LOCK` still returns **FAIL**, every rule record carries
`codifiedTextCompared: false`, and the accurate status of every sourced row below is **held from
TREC's published copy; codified text not compared**. That is not "verified". It is also not the
unread-requirement marker most of these rows carried until 2026-08-30, which was wrong from the
moment the files landed on disk.

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
| 8 | Student **completion record** maintained | held § 535.65(a)(1)(F), fields at (j) | sourced; the record itself is not built, **and the adopted (j) text has not been read** — see the gaps below |
| 9 | Staff reasonably available for public inquiry and assistance | held § 535.65(a)(1)(I) | sourced |
| 10 | No recruiting or soliciting during course presentation | held § 535.65(a)(1)(H) | sourced |
| 11 | Attempt logging on every quiz and examination | provider design | specified |
| 12 | Quiz rationale on an incorrect answer, then a related replacement question that counts toward passing the topic | held § 535.62(b)(7)(C)(ii) | sourced. **Corrected 2026-08-30: a rule requirement for distance delivery, not provider design.** |
| 13 | Scenario grading with a recorded outcome | held § 535.62(b)(7)(B) fixes the count and (b)(7)(C)(i) requires a passing grade; **recording** the outcome is provider design | sourced in part |
| 14 | Final examination version rotation across four forms | held § 535.62(b)(8) (at least four versions) with § 535.65(h)(4) (rotate all versions throughout the approval period in a manner acceptable to the Commission) | sourced. **Corrected 2026-08-30: not provider design. Holding four versions is not compliance; rotating them is.** |
| 15 | Printable and exportable student records | held § 535.65(l)(4) — records may be kept electronically but must be "in a common format that is legible and easily printed or viewed without additional manipulation or special software" | sourced. **Corrected 2026-08-30: not provider design.** |
| 16 | Inactivity treatment | current REALM distance-course application | **UNREAD.** An older checklist is understood to have specified 10 minutes. No held provision of §§ 535.62 or 535.65 sets an inactivity rule. If StateCourse adopts 10 minutes it is **provider policy** until an authority requiring it is read. |
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

### Row 23 — what is not there

No held provision of §§ 535.62 or 535.65 requires a human proctor for a distance-education final
examination. What the held rules require is an **outcome**: § 535.65(h)(5) requires the examination
to be administered "under conditions that ensure the student taking the examination is the student
who registered for and took the course", and § 535.65(g)(2)(A) requires a student identity
verification process "acceptable to the Commission". The two places a proctor is mentioned at all
point the other way — § 535.65(d)(1)(F) requires the pre-enrolment agreement to disclose proctoring
procedure and fees **"if applicable"**, which presupposes it may not be, and § 535.65(g)(1)(C)
requires a monitor only for a **classroom** course delivered through technology to more than 20
registered students. The Principles II reading reached the same conclusion.

So: anything StateCourse adopts beyond identity assurance is a **provider policy choice**, stated as
one and disclosed under (d)(1)(F). No row here is left looking like an unread requirement on this
point, and nothing here says the Commission requires proctoring.

## The gaps, named rather than papered over

- **The adopted § 535.65(j) has not been read.** The held TREC copy carries the pre-amendment
  subsection — issue a completion **certificate** to the student, carrying the instructor's name.
  The 22 May 2026 proposal rewrites it: the provider must **submit course completion records to the
  Commission** using a process acceptable to the Commission, not sooner than the number of course
  credit hours has passed and not later than the 10th calendar day after completion; the record
  carries the **student's** name rather than the instructor's; and for qualifying courses completed
  on or after 1 October 2026 it must carry the student's Commission-issued licence number or, failing
  that, application number. TREC's rule record gives adoption on 2026-08-10 and effect on
  2026-08-31, but the adoption notice publishes in the Texas Register issue of 28 August 2026, which
  returns 403. **Only the proposed text is held.** Both readings are registered; neither is
  implemented; no completion record exists for any course here. This is gap
  `loa-535-65-j-adopted-text-not-read` in the gap ledger and a human item on
  `texas/submission/human-export-list.md`.
- **The Commission's approved evaluation form under § 535.65(k)(3) is not held.** The rule requires a
  provider evaluating an instructor or course to use **all** of the questions from the
  Commission-approved form, **in the same order**, adding its own only after them. The form's wording
  is unknown to this project, so row 24 names the duty and no evaluation instrument may be built as
  if the questions were known.
- **Row 16 remains genuinely unread.** The source is the current REALM distance-course application,
  not a rule; it has not been opened, and no held rule text supplies an inactivity requirement.

The first two are known-and-unheld rather than unread: the requirement was read, the referenced
document was not obtained. The gate's unread-marker count therefore reaches row 16 only, which is
correct, and is said here so that nobody mistakes silence for coverage.

**One control remains unread, and the delivery gate counts it.** It will not grant while any row
above still carries the unread marker, which is the point: a specification that names an unread requirement is a list of
things nobody has looked up, not a delivery design.

**The one thing this file states without qualification.** No control listed here is presented to a
student, in marketing, or in an application as a Commission requirement on the strength of this file
alone. StateCourse holds no TREC approval, no provider approval number and no course approval
number, and holding these rules is not approval.
