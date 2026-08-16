# Washington Regulatory Compliance and Traceability Matrix

Verified 2026-08-16. StateCourse design choices are labeled as provider proposals, never state mandates.

| Requirement | Controlling source | StateCourse evidence | Status |
|---|---|---|---|
| Provider / school | Real Estate School Application | Separate provider/school approval record, application index, ownership/administrator exhibits, status and dates | Development; filing gate |
| Instructor | Current instructor rule/application | Separate instructor approval records and course assignments; no owner is presumed eligible | Unassigned; release gate |
| Courses | Current state course rule and regulator outline | Washington Real Estate Fundamentals 60h (60h); Washington Real Estate Practices 30h (30h) | Separate v1.0 approval records |
| Distance delivery | Current state distance rule/application | Course-specific Distance Education Delivery Method Application, or an accepted ARELLO certificate for the same course and clock-hour controls. | Configured; acceptance pending |
| Assessments | Course-specific rule/application | Versioned formative pools, remediation, secure finals and attempt audit | Draft; SME/psychometric/regulator review pending |
| Identity / attendance | Course-specific distance standard | Authentication, no concurrent sessions, server time, inactivity exclusion, unit progression, assessment evidence, reviewer bypass isolation | Configured per course |
| Certificate | Current state certificate/transcript rule | State/course/version/approval/instructor/student/hours/date and verification fields | Controlled template; issuance disabled |
| Records | Current state rule | Five-year student, enrollment, start/end, course, examination result, and evaluation records under WAC 308-124H-935. | Data model and policy built |
| Reporting | Current state rule/application | Certificates and audit-ready school records; DOL observation/audit access and material-change submissions. | Workflow configured; regulator credentials pending |
| Renewal | Current approval lifecycle | School and instructor approvals two years; mandated course approvals four years unless the current DOL approval states otherwise. | Independent approval dates required |
| Enrollment and advertising | StateCourse approval gate | No Approved/State Approved/Enroll Now/payment/credit until administrator records valid regulator approval | Enforced |

## Approval records

- `wa_school`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `wa_instructor`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `wa_fundamentals_course`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `wa_practices_course`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `wa_distance_delivery_method_or_arello`: status Development; approval number/effective/expiration blank; enrollment dependency active.
