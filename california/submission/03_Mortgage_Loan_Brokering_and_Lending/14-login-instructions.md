# Student and regulator log-in information — Mortgage Loan Brokering and Lending

**Course:** Mortgage Loan Brokering and Lending — 45 Hours
**Applicant / sponsor:** StateCourse LLC
**Prepared:** August 20, 2026
**Status:** Submission draft. This course is not approved by the California Department of Real Estate, no course approval number has been issued, and no California pre-license credit is available for it.


**RE 303 checklist item 15** requires student and regulator log-in information for courses and final examinations offered online. **RE 303, Internet Courses** additionally requires evidence of "a method of control … to require the student to complete each segment of the course before progressing to the next."

## Credentials

**Credentials are issued on the production system at filing time and written onto the printed copy of this sheet by hand. They are not stored in this repository and are not committed to source control.**

| Account | Purpose | Where the credential is written |
|---|---|---|
| **DRE regulator account** | Full review access to this course: every lesson assignment, every assessment, and both final examination forms, without study-time gating | Handwritten on the printed sheet at filing |
| **Sample student account** | The course exactly as a student experiences it, including sequential control | Handwritten on the printed sheet at filing |

Sign-in address: **https://statecourse.com**

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
