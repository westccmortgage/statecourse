# Washington Regulatory Compliance and Traceability Matrix

Verified 2026-08-17. StateCourse design choices are labeled as provider proposals, never state mandates.

| Requirement | Controlling source | StateCourse evidence | Status |
|---|---|---|---|
| Provider / school | Real Estate School Application | Separate provider/school approval record, application index, ownership/administrator exhibits, status and dates | Development; filing gate |
| Instructor | Current instructor rule/application | Separate instructor approval records and course assignments; no owner is presumed eligible | Unassigned; release gate |
| Courses | DOL mandated-course page; WAC 308-124H-820 | Washington Real Estate Fundamentals 60h; Washington Real Estate Practices 30h | Separate v1.0 approval records; not filed |
| Clock hours | WAC 308-124H-820(4) | 60 or 30 separately versioned units; each unit requires 50 active instructional minutes | Blueprint built; production manuscripts pending |
| Distance delivery | WAC 308-124H-830 through -845; DOL application page | Separate delivery-method application per method/course, or ARELLO evidence for the same course with clock-hour enforcement | Controls configured; approval/ARELLO pending |
| Interactivity | WAC 308-124H-835 | Questions/answers with direct feedback and instructor/student communication; passive-only delivery rejected | LMS contract configured; lesson implementation pending |
| Mastery/remediation | WAC 308-124H-840(2), (5), (6) | Learning-unit objectives, quantitative mastery, regular progress checks, individual remediation and inactivity shutdown | Blueprint/config built; item pools pending |
| Comprehensive finals | WAC 308-124H-820(8) | Fundamentals: 180 scored questions; Practices: 90; minimum 70% | Specification fixed; production banks withdrawn/pending |
| Identity / attendance | WAC 308-124H-840(3), (6), (8), (10), (11) | Authentication, no concurrent sessions, server time, inactivity exclusion, orientation, student/school completion certification and audit metadata | Configured per course; DOL acceptance pending |
| Instructor availability | WAC 308-124H-820(6), -840(7) | Approved assigned instructor, asynchronous questions, service timestamps and escalation | Instructor unassigned; release gate |
| Certificate | WAC 308-124H-855 | Student; school/name ID; start/end; course title/hours/ID; administrator signature; instructor/name ID; exam completion | Controlled template; issuance disabled |
| Records | Current state rule | Five-year student, enrollment, start/end, course, examination result, and evaluation records under WAC 308-124H-935. | Data model and policy built |
| Reporting | DOL broker-license page; WAC 308-124H-895(10) | Prompt course-completion transmission to the testing vendor, certificates, audit-ready school records and material-change submissions | Event/outbox workflow configured; PSI integration pending |
| Renewal | WAC 308-124H-945(6), -990; current DOL fee page | School/instructor two years; non-Core courses four years | Independent approval dates required |
| Enrollment and advertising | StateCourse approval gate | No Approved/State Approved/Enroll Now/payment/credit until administrator records valid regulator approval | Enforced |

## Approval records

- `wa_school`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `wa_instructor`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `wa_fundamentals_course`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `wa_practices_course`: status Development; approval number/effective/expiration blank; enrollment dependency active.
- `wa_distance_delivery_method_or_arello`: status Development; approval number/effective/expiration blank; enrollment dependency active.
