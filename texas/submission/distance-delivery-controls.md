# Distance delivery controls — Texas qualifying education

**Status: SPECIFICATION ONLY. Nothing here is implemented, and the specification is written against
an authority this project could not read.**

**Why this file is a specification and not a build.** The controls a Texas distance qualifying course
must have are set by 22 TAC § 535.65 and by the current REALM distance-course application. Neither
could be opened from this environment. What follows is therefore a list of controls the build
INTENDS to implement, each marked with where its requirement is supposed to come from, and none of
them may be described to a student or to the Commission as a Texas requirement until the rule is
read.

| # | Control | Requirement source | Status |
|---|---|---|---|
| 1 | Identity verification acceptable to TREC | § 535.65 | UNREAD — specification blocked |
| 2 | Authenticated student account, one enrolment owner | provider design | specified |
| 3 | Topic progression lock — a topic opens only when the previous one is complete | § 535.65 / provider design | specified |
| 4 | Instructional time accounted per unit against the form's minute figures | PRINS1-1 + § 535.65 | partially specified — the minute figures are held, the accounting is not built |
| 5 | Inactivity treatment | REALM application | **UNREAD.** An older checklist is understood to have specified 10 minutes. If StateCourse adopts 10 minutes it is **provider policy** until a current authority is read that requires it. |
| 6 | Attempt logging on every quiz and examination | provider design | specified |
| 7 | Quiz rationale on an incorrect answer, then a related replacement question | provider design + work order | specified |
| 8 | Scenario grading with a recorded outcome | provider design | specified |
| 9 | Timely instructor help channel with a published response standard | § 535.65 | UNREAD |
| 10 | Instructor grading rationale retained | § 535.65 | UNREAD |
| 11 | Final examination eligibility gated on completion of all coursework | § 535.65 | UNREAD |
| 12 | Final examination version rotation across four forms | provider design | specified |
| 13 | Examination confidentiality — no public exposure of items or keys | § 535.65 | UNREAD |
| 14 | Retake gated behind provider-prescribed remediation | § 535.65 | UNREAD |
| 15 | Second failure requires retaking the course | § 535.65 | UNREAD |
| 16 | Record retention — four years | 22 TAC | UNREAD |
| 17 | Printable and exportable student records | provider design | specified |

**The one thing this file states without qualification.** No control listed here is presented to a
student, in marketing, or in an application as a Commission requirement on the strength of this file
alone.
