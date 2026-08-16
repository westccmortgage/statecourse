# North Carolina Regulatory Compliance and Traceability Matrix

Verified 2026-08-16. StateCourse design choices are labeled as provider proposals, never state mandates.

| Requirement | Controlling source | StateCourse evidence | Status |
|---|---|---|---|
| Provider / school | Education Provider Certification | Separate provider/school approval record, application index, ownership/administrator exhibits, status and dates | Development; filing gate |
| Instructor | Current instructor rule/application | Separate instructor approval records and course assignments; no owner is presumed eligible | Unassigned; release gate |
| Courses | Current state course rule and regulator outline | North Carolina Broker Prelicensing 75h (75h) | Separate v1.0 approval records |
| Distance delivery | Current state distance rule/application | In-person, synchronous distance, blended, or asynchronous distance only as approved for the 75-hour Prelicensing course. Asynchronous learners complete every unit and assessment; synchronous learners must remain visible on camera effective July 1, 2026. | Configured; acceptance pending |
| Assessments | Course-specific rule/application | Versioned formative pools, remediation, secure finals and attempt audit | Draft; SME/psychometric/regulator review pending |
| Identity / attendance | Course-specific distance standard | Authentication, no concurrent sessions, server time, inactivity exclusion, unit progression, assessment evidence, reviewer bypass isolation | Configured per course |
| Certificate | Current state certificate/transcript rule | State/course/version/approval/instructor/student/hours/date and verification fields | Controlled template; issuance disabled |
| Records | Current state rule | Three years: enrollment/attendance, every graded exam and answer, master exam/key, evaluations, advertising, delivery certification, PPD, schedules, materials, and required reports. | Data model and policy built |
| Reporting | Current state rule/application | Completion report within seven calendar days; prior-month course summary by the fifth day; exact roster fields and audit trail retained. | Workflow configured; regulator credentials pending |
| Renewal | Current approval lifecycle | Provider certification expires June 30; renewal due June 1. Course and instructor status checked independently before scheduling/enrollment. | Independent approval dates required |
| Enrollment and advertising | StateCourse approval gate | No Approved/State Approved/Enroll Now/payment/credit until administrator records valid regulator approval | Enforced |

## Approval records

- `nc_education_provider`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `nc_education_director`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `nc_broker_prelicensing_course`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `nc_prelicensing_instructor`: status Development; approval number/effective/expiration blank; enrollment dependency active.
