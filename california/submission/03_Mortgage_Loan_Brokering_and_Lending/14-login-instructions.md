# Student and regulator log-in information — Mortgage Loan Brokering and Lending

**Course:** Mortgage Loan Brokering and Lending — 45 Hours
**Applicant / sponsor:** StateCourse LLC
**Prepared:** August 20, 2026
**Status:** Submission draft. This course is not approved by the California Department of Real Estate, no course approval number has been issued, and no California pre-license credit is available for it.


**RE 303 checklist item 15** requires student and regulator log-in information for courses and final examinations offered online. **RE 303, Internet Courses** additionally requires evidence of "a method of control … to require the student to complete each segment of the course before progressing to the next."

## Credentials

**Credentials are issued on the production system at filing time and written onto the printed copy of this sheet by hand. They are not stored in this repository and are not committed to source control.**

**Two accounts are supplied, and they are deliberately not the same account with a switch.** One shows the Department the course as a student takes it; the other shows the Department all of it at once. Those are opposite properties, and an account that did both would demonstrate neither.

| Account | Address | Purpose | Where the credential is written |
|---|---|---|---|
| **DRE student review** | `dre-student-review@statecourse.com` | The course exactly as an enrolled student takes it. **Every gate applies:** sequential progression, study time, and — in Real Estate Practice — the SB 1495 practicum, which does not close until both role-play responses are submitted. Nothing is bypassed. | Handwritten on the private insert at filing |
| **DRE regulator review** | `dre-regulator-review@statecourse.com` | Full review access: every lesson assignment, every assessment, both final examination forms and both answer keys, without study-time or sequencing gating. Records nothing against any student. | Handwritten on the private insert at filing |

Sign-in address: **https://statecourse.com/student/sign-in/** — both accounts sign in at the student sign-in page. Credentials to a side door would not be credentials to the thing being reviewed.

**Neither account can produce a course completion record or a course completion certificate.** Both carry a review role on their enrollments, and the database refuses a completion event or a certificate for any such enrollment in a trigger rather than in application code. Separately, no certificate may issue for any enrollment while the course carries no DRE approval number — and none does, because none has been assigned.

## What the Department can do with each account

| Step | Student review | Regulator review |
|---|---|---|
| Sign in | ✓ | ✓ |
| See all three California courses | ✓ | ✓ |
| Open a course and see its 15 lesson assignments in sequence | ✓ | ✓ |
| Open a lesson and read the instructional text as served | ✓ | ✓ |
| See the applied exercise and the engagement check | ✓ | ✓ |
| See the SB 1495 practicum, one panel per role, and which remain outstanding | ✓ (and must complete both) | ✓ (submits nothing) |
| See what remains before the final examination opens, named requirement by requirement | ✓ | — the reviewer has no student clock |
| See the final examination structure — 100 items, 60% to pass, two forms, proctored | ✓ | ✓ |
| Reach a later assignment without finishing the one before it | **No — locked** | ✓ |
| Produce a completion record or a certificate | **No** | **No** |

## What the regulator account does that a student account does not

| Behaviour | Student | DRE regulator |
|---|---|---|
| Sequential progression enforced | Yes | Bypassed, so a reviewer can open any assignment directly |
| Minimum study time before an assignment completes | Enforced | Bypassed |
| 2½ weeks minimum before the final examination | Enforced | Bypassed |
| Proctor authorization required before the final examination | Required | Bypassed |
| Both examination forms visible | No — one form per attempt, never furnished directly | Yes, both forms and both answer keys |
| Activity written to a student completion record | Yes | **No — reviewer activity is recorded separately and can never enter a student record or a regulatory report** |

That last row is the one that matters. A regulator browsing the course must not be able to contaminate a student's completion evidence, and the platform records reviewer sessions in a separate audit stream so that it cannot.

## Method of control, for the item-15 evidence

Each lesson assignment opens only when the previous one is recorded complete. Within an assignment, each section opens only when the previous section is recorded as viewed and its checkpoint answered. Active study time accumulates from client heartbeats, discards a heartbeat separated from the last by more than the configured gap, and stops accruing after the idle threshold — so a student who leaves a page open accrues nothing. Completion of an assignment requires every section viewed in order, the applied exercise submitted, and the assessment passed.

## Final examination controls, for the internet-examination requirement

| RE 303 requirement | How it is met |
|---|---|
| Not printable | Print is refused by the examination view; the page renders nothing to a print context |
| Not downloadable | Items are delivered per question and never as a file; no examination form exists as a downloadable document on the student side |
| Times out when the allotted time expires | A non-pausing server-authoritative clock; the examination auto-submits whatever has been answered at 180 minutes |
| The person enrolled is the person taking the exam | Photo identification verified in person by the school-designated proctor immediately before the examination, against the enrollment record |
| Never furnished directly to students | Answer keys never leave the server; the student payload carries only item id, prompt, and choices, and a test asserts no other field can appear |
