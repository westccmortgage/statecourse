# Arizona Regulatory Compliance and Traceability Matrix

Course records:

1. **Arizona Salesperson Pre-License 90h v1.0** — development, not submitted, not approved.
2. **Arizona Contract Writing 6h v1.0** — separate development record, not submitted, not approved.

Verified **2026-08-17** against the official-source register. “StateCourse proposal” means the control is designed for submission and is not represented as a regulator-issued mandate or approval.

| ID | Requirement | Official source | StateCourse implementation/evidence | Gate |
|---|---|---|---|---|
| AZ-SCH-01 | A current Arizona school approval is required. | AZ-SPS-2025.01; AZ-FORM-SCHOOL | Separate `az_school` approval record; entity, owners ≥10%, administrators, organization documents, address, distance-learning selection and change history. | Enrollment blocked until Approved and unexpired. |
| AZ-SCH-02 | Original school filing includes instructor applications and owner/administrator qualification exhibits. | AZ-FORM-SCHOOL | Provider-school application manifest; owner/administrator exhibits and fingerprint-card checklist; instructor roster. | Filing blocker. |
| AZ-INS-01 | Each person teaching an approved course requires approval in the applicable subject. | AZ-SPS-2025.01; AZ-FORM-INSTRUCTOR | Versioned instructor record, approved subjects, résumé evidence, fingerprint/legal-presence documents and assigned course version. | Instructor remains unassigned; no owner presumed eligible. |
| AZ-INS-02 | New/renewing instructor competency and current instructional-methods evidence must be documented. | AZ-FORM-INSTRUCTOR | Subject-qualifier crosswalk plus proof of qualifying workshop/event within the period required by the current form. | Filing/renewal blocker. |
| AZ-COURSE-01 | Salesperson education is at least 90 classroom hours or equivalent and includes a satisfactory course examination. | A.R.S. § 32-2124(B) | 90 separately versioned 50-minute instructional units; secure school final excluded from instructional time. | Exact 90-hour validation required. |
| AZ-COURSE-02 | The Arizona-specific course is 27 hours for the waiver path. | A.R.S. § 32-2124(B) | Hours 64–90 form a separately tagged 27-hour Arizona layer covering all 11 ADRE 2026 sections; the full course remains one 90-hour approval record. | Filing reviewer must confirm accepted allocation. |
| AZ-COURSE-03 | Six hours of Contract Writing is separately certified and includes drafting purchase contracts, listings and leases. | A.R.S. § 32-2124(L) | Separate `az-contract-writing-6-v1` record, outline, activities, assessment and certificate. | Never merged into the 90 hours. |
| AZ-CONTENT-01 | Arizona-specific objectives reflect the current ADRE outline. | AZ-CURR-2026 | Eleven-section regulator crosswalk; 27 unit specifications; objective-level references. | Content QA and ADRE acceptance pending. |
| AZ-APP-01 | Each course requires its own application/approval. | AZ-SPS-2025.01; AZ-FORM-PRELICENSE; AZ-FORM-CW | Independent course IDs, versions, approval numbers, effective/expiration dates, submission and correction logs. | No global approval flag. |
| AZ-DL-01 | Distance learner identity must link registrant, learner, quiz taker and final-exam taker; username/password or attestation alone is insufficient. | AZ-SPS-2025.01 | Configurable step-up identity service, session evidence, assessment identity evidence, no concurrent sessions and audit events. | Identity vendor/method must be accepted before launch. |
| AZ-DL-02 | Inactivity causes complete logout after 15 minutes; return to the unit start and reverify identity. | AZ-SPS-2025.01 | Server inactivity deadline; no idle credit; invalidated partial unit attempt; new authenticated session begins at unit start. | Automated compliance test required. |
| AZ-DL-03 | Time, progress, assignments, timestamps, IP and completion are tracked; passive open-page time does not count. | AZ-SPS-2025.01 | Server-authoritative active-time ledger, IP/session/device metadata, interaction events, unit/assignment status and append-only completion audit. | Production telemetry required. |
| AZ-DL-04 | Credit hour is 50 minutes; distance modules are 12.5–50 minutes and cannot advance too quickly. | AZ-SPS-2025.01 | Each StateCourse unit is one 50-minute module; content, scenario, quiz and time gates are all required. | No manual student completion. |
| AZ-DL-05 | Each module contains instructional content and scenario interactivity; 75% quiz score is required before proceeding. | AZ-SPS-2025.01 | Scored scenario checks, 75% mastery, alternate remediation, versioned attempt record and sequential unlocking. | Quiz content/security QA pending. |
| AZ-FINAL-01 | Comprehensive prelicense final uses lockdown delivery, ≥2:1 bank, excludes final time from course hours and requires 75%. | AZ-SPS-2025.01 | Secure 180-item minimum bank for a 90-question form; randomization; 75%; separate final-time ledger; no public key. | Bank is not production-ready until SME/psychometric review. |
| AZ-FINAL-02 | Final is proctored under ADRE guidelines and not taken on a student-provided device. | A.R.S. § 32-2124(B); AZ-SPS-2025.01 | Proctor authorization, photo-ID per login, environment/device attestations, incident workflow and exam-session audit. | Proctor/vendor method requires approval. |
| AZ-REVIEW-01 | Distance application supplies persistent ADRE reviewer access, including student view and no-time-constraint review. | AZ-FORM-PRELICENSE; AZ-FORM-CW | Two regulator roles isolated from student credit: `regulator_student_view` and `regulator_unrestricted_review`. | Credentials provisioned only for filing/review. |
| AZ-SUPPORT-01 | Application identifies emergency and student-assistance contacts and an in-course help mechanism. | AZ-FORM-PRELICENSE | Course-configured emergency contact, academic/technical support SLA, help request and instructor queue. | Named staff/contact details pending. |
| AZ-CERT-01 | Completion certificate includes provider, school/course identifiers, title, dates, student, hours/categories, contact and administrator signature. | AZ-SPS-2025.01 | Controlled certificate template populated from approved records only. | Issuance disabled until every approval gate passes. |
| AZ-REC-01 | Student performance/attendance certification must be accurate and auditable. | A.R.S. § 32-2135; AZ-SPS-2025.01 | Immutable completion events; signed certificate event; administrative corrections require reason, actor, before/after and linked evidence. | Retention period captured from approval/rule review before launch. |
| AZ-EXP-01 | Course completion is generally no more than ten years old at license application. | A.R.S. § 32-2124(B) | Certificate date exposed to student; licensing-path notice; StateCourse does not decide ADRE equivalency exceptions. | Informational, not an enrollment expiration assumption. |
| AZ-ADV-01 | No approval/enrollment claim before actual approval. | StateCourse release control | Public status “In Development”; Checkout, enrollment, regulatory credit and certificate issuance false. | Enforced in catalog and payment config. |

## Open filing decisions

- ADRE acceptance of the exact 63-hour National Core / 27-hour Arizona layer allocation.
- Named school administrator, approved instructor(s), emergency contact and student-support contacts.
- Identity-verification method and final-exam proctor/vendor workflow.
- Filing-day rule supplement, fees, retention period, approval/renewal dates and any regulator corrections.
- Final instructional manuscript, source review, assessment validation and accessibility QA.
