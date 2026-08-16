# Colorado Regulatory Compliance and Traceability Matrix

Verified 2026-08-16. StateCourse design choices are labeled as provider proposals, never state mandates.

| Requirement | Controlling source | StateCourse evidence | Status |
|---|---|---|---|
| Provider / school | DPOS Certificate of Approval | Separate provider/school approval record, application index, ownership/administrator exhibits, status and dates | Development; filing gate |
| Instructor | Current instructor rule/application | Separate instructor approval records and course assignments; no owner is presumed eligible | Unassigned; release gate |
| Courses | Current state course rule and regulator outline | Colorado Real Estate Law and Practice 48h (48h); Colorado Contracts and Regulations 48h (48h); Colorado Trust Accounts and Record-Keeping 8h (8h); Colorado Current Legal Issues 8h (8h); Colorado Real Estate Closings 24h (24h); Colorado Practical Applications 32h (32h) | Separate v1.0 approval records |
| Distance delivery | Current state distance rule/application | Distance/asynchronous delivery must be included in the DPOS school/program approval. No broker-qualifying ARELLO/IDECC mandate was identified in the controlling DRE/DPOS sources; that certification is not imported from appraiser or another state rules. | Configured; acceptance pending |
| Assessments | Course-specific rule/application | Versioned formative pools, remediation, secure finals and attempt audit | Draft; SME/psychometric/regulator review pending |
| Identity / attendance | Course-specific distance standard | Authentication, no concurrent sessions, server time, inactivity exclusion, unit progression, assessment evidence, reviewer bypass isolation | Configured per course |
| Certificate | Current state certificate/transcript rule | State/course/version/approval/instructor/student/hours/date and verification fields | Controlled template; issuance disabled |
| Records | Current state rule | DPOS student, enrollment, catalog, agreement, financial, progress, completion, instructor/staff, program, and closure records plus DRE REC-33 completion evidence. | Data model and policy built |
| Reporting | Current state rule/application | DPOS student assessments/reports and regulator access; DRE qualifying completion evidence and six separate course records. | Workflow configured; regulator credentials pending |
| Renewal | Current approval lifecycle | DPOS provisional/standard approval and program lifecycles tracked from the issued certificate; current three-year standard-renewal fee is recorded but exact dates are approval-specific. | Independent approval dates required |
| Enrollment and advertising | StateCourse approval gate | No Approved/State Approved/Enroll Now/payment/credit until administrator records valid regulator approval | Enforced |

## Approval records

- `co_dpos_school`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `co_dpos_programs`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `co_school_agents`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `co_instructional_staff`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `co_six_dre_qualifying_courses`: status Development; approval number/effective/expiration blank; enrollment dependency active.
