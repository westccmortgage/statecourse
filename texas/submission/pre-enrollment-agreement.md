# Texas pre-enrollment agreement — source of record

**Version:** `TX-ENROLLMENT-DRAFT-2026-08-30-v1`
**Status:** DRAFT. Not published, not presented to any student, not filed with TREC.

**This file is the single source.** The enrollment UI, the Terms, the student acceptance record, the
Stripe checkout metadata, the refund record and the submission specimen all read from this version
string and this text. One source is the whole point: a refund computed from one document and
disclosed from another is how a provider ends up running a policy it never disclosed.

**What changed at v1.** Three items in this file said a rule "was not read" when the rule had since
been read. § 535.65 is now held at `texas/trec-sources/trec-rules/535.65.txt` with a recorded hash,
and §§ 5 and 7 below quote it instead of carrying figures from the work order. A fourth item stated
the twelve-hour rule as a daily credit cap; the held text makes it a limit on the length of a course
segment, and §3 now says so. The standing limit is unchanged and is narrower than the caveats it
replaces: what was read is TREC's own published reproduction, classified TIER 4, and the Secretary of
State's codified 22 TAC text remains unread.

**Two things are deliberately blank, and neither is a defect.** The **tuition** and the **refund
formula** are business decisions. They are not invented here, and the version above stays at `v0`
until a person sets them.

**Everything marked ⚠ is unverified against Texas rule text**, because 22 TAC could not be opened
from the build environment. See `texas/regulatory/primary-text-readings.md`.

---

## 1. Course identity

| | |
|---|---|
| Provider | StateCourse *(exact legal name pending — read from the formation documents, not assumed)* |
| Provider approval number | **none — the provider is not approved** |
| Course | one of the six 30-hour Texas qualifying courses, named individually |
| Course approval number | **none — the course is not approved** |
| Credit hours | 30 |
| Delivery | proposed distance education |
| Instructor | Unassigned / pending qualification |

**No student may enroll, pay, earn credit or receive a completion record.** This is enforced in
`config/texas/payment-contract.mjs`, not merely stated here.

## 2. Tuition and fees

| | |
|---|---|
| Tuition | **NOT SET — business decision** |
| Every additional fee, itemised | **NOT SET** — and where a fee exists it is named and priced here, never disclosed only at checkout |
| Required materials, and whether their cost is included | **NOT SET** |
| Proctoring fee | only if StateCourse adopts proctoring; see §6 |

## 3. Attendance, completion and time

- Completion requires every topic, every required topic-quiz question answered correctly, every
  scenario exercise completed, and a passing final examination score.
- **Instructional time is accounted per unit** against the minute figures printed on the TREC course
  approval form for that course: 1,500 minutes across 9 topics and 46 units for Principles of Real
  Estate I (PRINS1-1), 1,500 across 9 topics and 44 units for Principles of Real Estate II
  (PRINS2-1), and 1,500 across 12 topics and 57 units for Law of Agency (LOA-1). Each course's own
  form governs; none borrows another's arithmetic.
- ⚠ **The twelve-hour limit is a limit on course SEGMENTS, not a daily credit cap.** The earlier
  version of this line said no more than 12 hours of qualifying credit may be claimed in one calendar
  day, and carried a note that the rule was not read. The rule has since been read, and it says
  something different: 22 TAC § 535.62(b) requires that a course "does not have daily course segments
  that exceed 12 hours," and § 535.65(g) repeats the same words inside the classroom-delivery
  requirements, alongside student sign-in, presence for the hours credited, and a 10-minute break per
  hour at least every two hours. Both are constraints on how a segment is *scheduled*. Neither, on
  the held text, caps the credit a self-paced distance student may claim in a day, and this document
  will not restate a scheduling rule as a student-facing cap.
- ⚠ Whether the current REALM distance-course application imposes any separate daily limit is
  unresolved and belongs with the TREC clarification memo.
- Makeup procedure and time limits: **NOT SET** pending the rule.

## 4. Refund, withdrawal and dismissal

- Refund policy: **NOT SET — business decision.** When set, the same formula computes the Stripe
  refund, the local refund record, the disclosed policy and the specimen.
- Voluntary withdrawal: treatment **NOT SET**.
- Dismissal by the provider: grounds and treatment **NOT SET**.

## 5. Examination

*§ 535.65 has since been read and is held at `texas/trec-sources/trec-rules/535.65.txt` with a
recorded hash. What follows is quoted from that text rather than carried from the work order. The
standing limit is unchanged and narrower than the old caveat: the file is TREC's own published
reproduction, classified TIER 4 by `config/texas/trec-rules-source-lock.mjs`, and the Secretary of
State's codified 22 TAC text remains unread. `TX_PROVIDER_RULE_SOURCE_LOCK` still FAILS.*

- Passing score **70%**, unweighted, and this is the rule's own figure: § 535.65(h)(4) requires a
  provider to rotate all versions of the examination required by § 535.62(b)(7) throughout the
  approval period *"in a manner acceptable to the Commission"* and to *"require an unweighted
  passing score of 70%."* For a 60-question version that is **42 correct**; the engine compares raw
  counts rather than a rounded percentage, so 41 of 60 fails.
- Four final examination versions exist and are rotated. The **rotation requirement** is the rule's;
  the **cadence** — the fixed A, B, C, D cycle — is a StateCourse proposal offered to the Commission
  for acceptance under the same "manner acceptable to the Commission" clause, and is labelled as a
  proposal in `config/texas/law-of-agency-final-exam-forms.mjs`.
- A subsequent examination is available **only after the student has completed any additional course
  work prescribed by the provider** (§ 535.65(i)(1)), must be completed **no later than the 90th day
  after the date the original class concludes**, and **must be a different version** of the original
  (§ 535.65(i)(2)). A student who fails to complete it in time **is automatically dropped from the
  course with no credit** (§ 535.65(i)(3)).
- **A second failure requires retaking the course.** § 535.65(h)(6) forbids a provider to give credit
  to a student who fails a final examination and a subsequent final examination, and § 535.65(i)(4)
  requires such a student to retake the course and the final course examination.
- The examination is confidential. § 535.65(h)(2) requires final examination questions to be *"kept
  confidential and be significantly different from any quiz questions and exercises used in the
  course."* Items and keys are never published, the student never sees the key, and no build emits an
  item, a choice, a key or a rationale into any served tree.
- ⚠ **No examination may be administered.** Building four compliant versions is not authority to
  serve one. `EXAM_READY` is `BLOCKED` on `TX_PROVIDER_RULE_SOURCE_LOCK`, and no student may sit an
  attempt while it is.

## 6. Proctoring — provider policy, or nothing

**StateCourse will not describe a proctoring choice of its own as a TREC mandate.**

- If StateCourse adopts proctoring, this section states the method, the procedure, the identification
  required and the fee, **labelled provider policy**, and the method is represented in the course
  application.
- If StateCourse does not adopt it, this section says so.
- **Neither is written yet**, because whether the current REALM distance-course application imposes
  any proctoring requirement is question 6 of the TREC clarification memo.

## 7. Identity

The provider verifies that the person who completes the coursework and the examination is the
enrolled student. § 535.65 has now been read, and it states the obligation without stating a method:
subsection (a)(1) requires *"validation of student identity acceptable to the Commission"* among the
matters a provider's application must address, and subsection (g), for distance delivery, requires
that *"the student taking all topics of the course and completing all quizzes and exercises is the
student receiving credit for the course through a student identity verification process acceptable
to the Commission."*

⚠ **What the rule does not do is name an acceptable method**, and this document will not invent one
and present it as the rule's. The method StateCourse proposes — verification at the start of an
attempt by the same process used at enrollment, with the verification record retained alongside the
attempt — is recorded as `proposedIdentityValidation` in
`config/texas/law-of-agency-final-exam-forms.mjs` and is labelled
`PROVIDER_PROPOSED_PENDING_TAC_CONFIRMATION`. Whether it is acceptable is the Commission's to say.

## 8. Criminal history

The agreement carries a notice that a criminal history may affect eligibility for a licence and that
an applicant may request a **Fitness Determination** from TREC before or during the course. ⚠ The
notice's required wording, if any, was not read.

## 9. Signature and acceptance

| Field | |
|---|---|
| Provider signature | ☐ |
| Student signature or electronic acceptance | ☐ |
| Policy version | recorded with the acceptance, from this file |
| Acceptance timestamp | recorded with the acceptance |

**The acceptance record stores the version string above.** A student who accepted `v0` accepted `v0`,
and a later version does not retroactively become what they agreed to.
