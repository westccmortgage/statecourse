# Texas pre-enrollment agreement — source of record

**Version:** `TX-ENROLLMENT-DRAFT-2026-09-02-v2`
**Status:** DRAFT. Not published, not presented to any student, not filed with TREC.

**This file is the single source.** The enrollment UI, the Terms, the student acceptance record, the
Stripe checkout metadata, the refund record and the submission specimen all read from this version
string and this text. One source is the whole point: a refund computed from one document and
disclosed from another is how a provider ends up running a policy it never disclosed.

**What changed at v2.** The Secretary of State's final adopted §§535.62 and 535.65 are now held from
the 28 August 2026 Texas Register and have been effective since 31 August. The old proposal-only
caveat is removed. This draft also adopts a conservative 10-minute inactivity control as
**StateCourse policy**, resolves the exam policy to no human proctor and no proctoring fee, and adds
recommended commercial terms so the filing is reviewable as a whole. The owner must approve the
commercial terms before signature.

---

## 1. Course identity

| | |
|---|---|
| Provider | **StateCourse LLC** |
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
| Single 30-hour course tuition | **$119 proposed** |
| Six-course / 180-hour package tuition | **$499 proposed**; checkout must allocate the price across the six separately approved courses |
| Required digital materials | included in tuition |
| Additional fees | none |
| Proctoring fee | none; StateCourse does not require a human proctor |

## 3. Attendance, completion and time

- Completion requires every topic, every required topic-quiz question answered correctly, every
  scenario exercise completed, and a passing final examination score.
- The system logs the student out or stops instructional-time credit after **10 minutes of
  inactivity**. This is a conservative **StateCourse policy** taken from TREC's still-published 2023
  distance-course checklist; it is not described as a current rule requirement.
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
- The initial access term is **12 months from purchase**, subject to any shorter course-expiration
  date required by an approval. Because the course is asynchronous there are no missed class
  meetings to make up; interrupted work resumes at the last verified completion point at no fee.

## 4. Refund, withdrawal and dismissal

- A student may cancel for a full refund within **three calendar days after purchase** if the student
  has completed less than 10% of the purchased course and has not viewed a final examination.
- If StateCourse cancels a course or cannot provide an approved purchased course, StateCourse issues
  a full refund for that course.
- After the three-day cancellation period, or after 10% course completion, tuition for that course
  is non-refundable. For a six-course package, the checkout record allocates **$83.17** to each of
  the first five courses and **$83.15** to the sixth, totalling $499.00, and applies this test
  separately to each course.
- Approved refunds return to the original payment method within **10 business days**.
- Voluntary withdrawal ends access but does not change the refund formula above.
- StateCourse may dismiss a student for identity fraud, assessment misconduct, account sharing,
  threats or material violation of the enrollment agreement. A dismissal does not earn credit and
  does not create a refund beyond the formula above.

## 5. Examination

*The final adopted §535.65 is held from the Secretary of State's 28 August 2026 Texas Register.
`TX_PROVIDER_RULE_SOURCE_LOCK` still fails only on the remaining live-TAC sections and the
login-gated current application, not on §§535.62 or 535.65.*

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
  serve one. `EXAM_READY` remains `BLOCKED` until written TREC course approval exists, and no
  student may sit an attempt while it is blocked.

## 6. Proctoring

**StateCourse does not require a human proctor and charges no proctoring fee.** The 2025 amendments
to §535.65 removed the blanket qualifying-course proctoring and closed-book requirements. Identity
assurance, examination confidentiality and administration in the exact manner approved by TREC
remain mandatory. If TREC approves a different method for a particular course, this agreement is
versioned and reaccepted before that method is used.

## 7. Identity

The provider verifies that the person who completes the coursework and the examination is the
enrolled student. § 535.65 has now been read, and it states the obligation without stating a method:
subsection (a)(1) requires *"validation of student identity acceptable to the Commission"* among the
matters a provider's application must address, and subsection (g), for distance delivery, requires
that *"the student taking all topics of the course and completing all quizzes and exercises is the
student receiving credit for the course through a student identity verification process acceptable
to the Commission."*

**What the rule does not do is name an acceptable method**, and this document will not invent one
and present it as the rule's. The method StateCourse proposes — verification at the start of an
attempt by the same process used at enrollment, with the verification record retained alongside the
attempt — is recorded as `proposedIdentityValidation` in
`config/texas/law-of-agency-final-exam-forms.mjs` and is labelled
`PROVIDER_PROPOSED_PENDING_TREC_ACCEPTANCE`. Whether it is acceptable is the Commission's to say.

## 8. Criminal history

Criminal history may affect eligibility for a licence. A student may request a **Fitness
Determination** from TREC before applying for a licence. Course enrollment or completion is not a
finding that the student satisfies TREC's honesty, trustworthiness, integrity or criminal-history
requirements.

## 9. Signature and acceptance

| Field | |
|---|---|
| Provider signature | ☐ |
| Student signature or electronic acceptance | ☐ |
| Policy version | recorded with the acceptance, from this file |
| Acceptance timestamp | recorded with the acceptance |

**The acceptance record stores the version string above.** A student who accepted `v0` accepted `v0`,
and a later version does not retroactively become what they agreed to.
