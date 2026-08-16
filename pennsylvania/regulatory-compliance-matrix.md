# Pennsylvania Regulatory Compliance and Traceability Matrix

Verified 2026-08-16. StateCourse design choices are labeled as provider proposals, never state mandates.

| Requirement | Controlling source | StateCourse evidence | Status |
|---|---|---|---|
| Provider / school | Initial Real Estate Education Provider Approval | Separate provider/school approval record, application index, ownership/administrator exhibits, status and dates | Development; filing gate |
| Instructor | Current instructor rule/application | Separate instructor approval records and course assignments; no owner is presumed eligible | Unassigned; release gate |
| Courses | Current state course rule and regulator outline | Pennsylvania Real Estate Fundamentals 30h (30h); Pennsylvania Real Estate Practice 45h (45h) | Separate v1.0 approval records |
| Distance delivery | Current state distance rule/application | Distance delivery method approved by ARELLO/IDECC or another Commission-accepted body; prelicense final proctored. | Configured; acceptance pending |
| Assessments | Course-specific rule/application | Versioned formative pools, remediation, secure finals and attempt audit | Draft; SME/psychometric/regulator review pending |
| Identity / attendance | Course-specific distance standard | Authentication, no concurrent sessions, server time, inactivity exclusion, unit progression, assessment evidence, reviewer bypass isolation | Configured per course |
| Certificate | Current state certificate/transcript rule | State/course/version/approval/instructor/student/hours/date and verification fields | Controlled template; issuance disabled |
| Records | Current state rule | Provider administrative, course, financial, scholastic, transcript, examination, and completion records under 49 Pa. Code Chapter 35; retention duration is a filing-confirmation gate where the cited rule does not state a numeric term. | Data model and policy built |
| Reporting | Current state rule/application | Commission inspection/audit access, transcripts/certificates, instructor/course/provider renewal records, and change notices. | Workflow configured; regulator credentials pending |
| Renewal | Current approval lifecycle | Annual provider/instructor/course renewal due by October 31 using current Commission renewal process. | Independent approval dates required |
| Enrollment and advertising | StateCourse approval gate | No Approved/State Approved/Enroll Now/payment/credit until administrator records valid regulator approval | Enforced |

## Approval records

- `pa_education_provider`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `pa_provider_owner`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `pa_provider_director`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `pa_surety_bond`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `pa_instructor`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `pa_fundamentals_course`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `pa_practice_course`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `pa_distance_delivery`: status Development; approval number/effective/expiration blank; enrollment dependency active.
