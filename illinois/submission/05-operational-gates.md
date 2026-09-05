# Illinois operational gates

Default state: **DENY**. A missing value is a failed gate, never an implicit pass.

| Gate | Required evidence | Current state |
|---|---|---|
| IL entity authority | filed LLC-45.5/Illinois file number and good-standing verification | BLOCKED |
| Provider license | IDFPR provider number, active status, verified in official lookup | BLOCKED |
| Virtual office | IDFPR registration/license and service address; public and secure portal controls | BLOCKED |
| Course license | exact course number, title, hours, delivery method and active status | BLOCKED |
| Instructor | active Illinois instructor number, roster entry and restriction check | BLOCKED |
| Curriculum | page/screen traceability to current mandatory curriculum, reviewer-approved version | BLOCKED |
| Delivery | IDFPR-approved Online Distance LMS, reviewer credentials, attendance/comprehension evidence | BLOCKED |
| Identity | beginning/end verification with date/time stamps retained five years | BLOCKED |
| Comprehension | recorded answers, ≥75%, ≤250 questions/course, randomized retry | BLOCKED |
| Post-license exams | three independent 50-question finals, ≥75%, integrity controls | BLOCKED |
| Records | transcripts/attendance/completion/identity/responses retained ≥5 years and exportable | BLOCKED |
| Reporting | prior-month completion export and submission workflow by the 15th | BLOCKED |
| Certificates/URET | approved templates, authorized signers and credential verification | BLOCKED |
| Claims | no “approved/endorsed/recommended/accredited” claim before verified issuance | PASS as draft policy; production audit required |
| Enrollment/payment | regulator approvals and every operating gate above | BLOCKED |

## Required refusal behavior

- No license number: enrollment disabled.
- Provider license without exact course license: enrollment disabled.
- Course license with a different delivery method: enrollment disabled.
- Instructor expired/restricted/not rostered: instruction disabled.
- Missing identity or comprehension evidence: credit and certificate disabled.
- Reporting export not validated: launch disabled.
- A submitted, pending or verbally discussed application never satisfies an approval gate.

