# Texas pre-enrollment agreement — source of record

**Version:** `TX-ENROLLMENT-DRAFT-2026-08-27-v0`
**Status:** DRAFT. Not published, not presented to any student, not filed with TREC.

**This file is the single source.** The enrollment UI, the Terms, the student acceptance record, the
Stripe checkout metadata, the refund record and the submission specimen all read from this version
string and this text. One source is the whole point: a refund computed from one document and
disclosed from another is how a provider ends up running a policy it never disclosed.

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
  approval form for that course. For Principles of Real Estate I that is 1500 minutes across 9
  topics and 46 units.
- ⚠ **Daily credit limit.** No more than 12 hours of qualifying course credit may be claimed in one
  calendar day. *Carried from the work order; the rule was not read.*
- Makeup procedure and time limits: **NOT SET** pending the rule.

## 4. Refund, withdrawal and dismissal

- Refund policy: **NOT SET — business decision.** When set, the same formula computes the Stripe
  refund, the local refund record, the disclosed policy and the specimen.
- Voluntary withdrawal: treatment **NOT SET**.
- Dismissal by the provider: grounds and treatment **NOT SET**.

## 5. Examination

- ⚠ Passing score **70%**, unweighted. For a 60-question form that is **42 correct**. *Carried from
  the work order; § 535.65 was not read.*
- Four final examination versions exist and are rotated; a retake uses a different version.
- ⚠ A retake is available **only after additional coursework or remediation prescribed by the
  provider**, and **no later than 90 days** after the original class concludes. *Same caveat.*
- ⚠ **A second failure requires retaking the course.** *Same caveat.*
- The examination is confidential. Items and keys are never published, and the student never sees the
  key.

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
enrolled student. ⚠ The acceptable methods are set by § 535.65, which was not read.

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
