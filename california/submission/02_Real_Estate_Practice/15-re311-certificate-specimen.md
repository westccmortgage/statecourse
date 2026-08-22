# RE 311 — Statutory/Pre-License Course Completion Certificate: specimen

**Course:** Real Estate Practice — 45 Hours
**Applicant / sponsor:** StateCourse LLC
**Prepared:** August 20, 2026
**Status:** Submission draft. This course is not approved by the California Department of Real Estate, no course approval number has been issued, and no California pre-license credit is available for it.


**RE 311 (Rev 1/26) is a DRE sample, not a form to be filed.** Its own notice says so:

> "Schools may format their certificates in any reasonable manner and size. **However, failure to include the content of this sample may result in DRE's rejection of students' license examination applications.** It is strongly suggested that schools use this sample format in order to ensure acceptance of certificates by DRE.
>
> Any variation to your certificate, once approved by DRE, will require it to be resubmitted for approval prior to issuing new certificates."

**Decision: StateCourse uses the RE 311 sample format itself, unchanged.** The notice permits reformatting and then warns about the consequence of omitting content and the burden of resubmitting variations. Taking the permission buys nothing and costs a rejection risk on every student's examination application. The official sample at `california/dre-sources/RE311.pdf` is the specimen submitted with this application.

## Field map — what the platform supplies for each RE 311 field

| RE 311 field | Source | Value for this course |
|---|---|---|
| NAME OF STUDENT | Enrollment record | *per student* |
| STUDENT MAILING ADDRESS (STREET) | Enrollment record | *per student* |
| CITY / STATE / ZIP CODE | Enrollment record | *per student* |
| NAME OF OFFERING AS APPROVED BY THE DEPARTMENT | Certification record | **Real Estate Practice** *(as approved — exact wording follows DRE's approval)* |
| **SB 1495 statement** | Completion record | **Compliant with SB 1495** — printed on the certificate. SB 1495 requires an applicant to show evidence of having completed a compliant practice course, and a certificate that recorded only "completed" would leave the school to reconstruct later, from memory, whether both roles were taken. The completion record carries the dated evidence for each role. |
| COURSE TYPE | Fixed for this offering | ☐ Live course ☐ Correspondence course **☒ CORRESPONDENCE/INTERNET** ☐ Correspondence/mobile device app |
| **DRE APPROVAL NUMBER** | Certification record | **BLANK until DRE assigns it.** See the hard gate below. |
| NUMBER OF CREDIT HOURS | Course design | **45** |
| DATE OF REGISTRATION | Enrollment record | *per student* |
| DATE OF COMPLETION | Completion record — the date the final examination was passed | *per student* |
| COURSE LOCATION (STREET ADDRESS AND CITY) | Fixed | Burbank, CA *(the school's location; the course is correspondence/independent study, internet)* |
| SPONSOR VERIFICATION | Fixed for this offering | ☒ **"Successfully completed the correspondence course and passed the final exam with a score of 60% or better."** The live-course line is not used. |
| NAME OF SPONSORING ENTITY (AS APPROVED BY DRE) | Certification record | **StateCourse LLC** |
| ADDRESS OF SPONSORING ENTITY | Fixed | 407 N Pacific Coast Highway, Unit 1028, Redondo Beach, CA 90277 |
| TELEPHONE NUMBER | Fixed | *(entered at signing)* |
| SIGNATURE OF VERIFIER | Per certificate | Anatoliy Kanevsky |
| PRINTED NAME OF VERIFIER | Fixed | Anatoliy Kanevsky |
| ADDRESS OF VERIFIER | Fixed | 407 N Pacific Coast Highway, Unit 1028, Redondo Beach, CA 90277 |
| TELEPHONE NUMBER (verifier) | Fixed | *(entered at signing)* |

## The hard gate

**DRE APPROVAL NUMBER is a required field on the certificate, and DRE assigns it. Until it exists, no certificate may issue.**

This is enforced in the platform, not in a policy document. The California course configuration holds `approval_number: null`; the certificate issuance path reads that field; and with it null the request is refused and the reason names the missing approval number. A test asserts the live configuration cannot reach certificate eligibility. **No approval number is ever invented, and no placeholder that could be mistaken for a real number is ever written into the field.**

The same gate covers the DRE STATUTORY/PRE-LICENSE SCHOOL ID # on RE 313 and item 1A on RE 306. All three stay blank until DRE fills them.

## Delivery and duplicates

**Regulation Regulation 3000(a)(6):** the school shall, within **15 days** of a student's successful completion, deliver a document to the student evidencing completion. The platform computes the delivery deadline from the **completion** date rather than the issuance date, so a late issuance cannot quietly reset the clock.

**Regulation 3000(a)(4):** the school shall maintain records for each student sufficient to allow preparation of a **duplicate certificate on request**. Duplicates are produced from the completion record; corrections are appended and supersede rather than overwriting, so the original record of what happened is never edited away.
