# Arizona Regulatory Compliance and Traceability Matrix

Verified 2026-08-16. StateCourse design choices are labeled as provider proposals, never state mandates.

| Requirement | Controlling source | StateCourse evidence | Status |
|---|---|---|---|
| Provider / school | ADRE School Approval Application (rev. 09/2025) | Separate provider/school approval record, application index, ownership/administrator exhibits, status and dates | Development; filing gate |
| Instructor | Current instructor rule/application | Separate instructor approval records and course assignments; no owner is presumed eligible | Unassigned; release gate |
| Courses | Current state course rule and regulator outline | Arizona Salesperson Pre-License 90h (90h); Arizona Contract Writing 6h (6h) | Separate v1.0 approval records |
| Distance delivery | Current state distance rule/application | Synchronous or asynchronous distance learning under ADRE SPS 2025.01 and the applicable course application. | Configured; acceptance pending |
| Assessments | Course-specific rule/application | Versioned formative pools, remediation, secure finals and attempt audit | Draft; SME/psychometric/regulator review pending |
| Identity / attendance | Course-specific distance standard | Authentication, no concurrent sessions, server time, inactivity exclusion, unit progression, assessment evidence, reviewer bypass isolation | Configured per course |
| Certificate | Current state certificate/transcript rule | State/course/version/approval/instructor/student/hours/date and verification fields | Controlled template; issuance disabled |
| Records | Current state rule | Server-authoritative identity, unit, timestamp, IP, assessment, completion, exam, certificate, instructor, and version records; retention period to be confirmed in the approved school/course package. | Data model and policy built |
| Reporting | Current state rule/application | ADRE reviewer credentials, distance audit exports, certificates, and school/course/instructor changes through the ADRE process. | Workflow configured; regulator credentials pending |
| Renewal | Current approval lifecycle | School, instructor, and course expiration/renewal dates are stored independently from the issued approvals; current terms must be captured from ADRE approvals at issuance. | Independent approval dates required |
| Enrollment and advertising | StateCourse approval gate | No Approved/State Approved/Enroll Now/payment/credit until administrator records valid regulator approval | Enforced |

## Approval records

- `az_school`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `az_instructor`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `az_salesperson_prelicense_course`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `az_contract_writing_course`: status Development; approval number/effective/expiration blank; enrollment dependency active.
