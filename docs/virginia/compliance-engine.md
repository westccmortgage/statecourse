# Virginia course compliance engine

## Controlling sources checked August 16, 2026

- [18VAC135-20-10](https://law.lis.virginia.gov/admincode/title18/agency135/chapter20/section10/) defines a class or clock hour as 50 minutes of instruction.
- [18VAC135-20-362](https://law.lis.virginia.gov/admincode/title18/agency135/chapter20/section362/) requires an approved provider to use a mechanism reasonably designed to ensure active engagement for every class hour, maintain the specified course and student records for at least five years, issue compliant certificates, and report completion electronically.
- [18VAC135-20-400](https://law.lis.virginia.gov/admincode/title18/agency135/chapter20/section400/) requires at least 60 class hours and identifies the required Principles of Real Estate subjects.
- [Virginia Code § 54.1-2105](https://law.lis.virginia.gov/vacode/title54.1/chapter21/section54.1-2105/) authorizes classroom, correspondence, and distance-learning delivery subject to Board criteria.

## Completion decision

Virginia configuration requires, for each numbered hour: three required instructional sections viewed, 3,000 seconds of server-recorded active instructional time, the applied exercise, a scored engagement check, successful alternate remediation when triggered, and no unresolved compliance block. Completion is calculated by the server; there is no student “mark complete” operation.

The browser sends a heartbeat every 15 seconds. The server credits only a capped interval when the tab is visible, the window is focused, the session is connected, and a legitimate pointer, keyboard, touch, or scroll interaction occurred within the configured idle window. A heartbeat gap over 45 seconds receives no backfilled credit. Mouse movement is not required. Hidden, disconnected, inactive, reviewer, administrator, and non-credit sessions receive no instructional credit.

## Role separation

- Student: only completed hours and the current hour are accessible. All completion events point to the exact course version and enrollment.
- Regulator/reviewer: all 60 hours are accessible without time or sequencing gates; activity never writes student credit.
- Administrator: review access is separate from append-only audit events. Adjustments require explicit, logged compensating operations; ordinary administrators have no silent record-rewrite endpoint.
- Instructor: protected queue access shows repeated failures and help requests.

## Release gates

The public course remains a submission draft, enrollment is disabled, and credit eligibility is false until written Board approval, an approved school/course/instructor configuration, secure publication of every assessment and remediation item, and a production student identity/enrollment flow are active. The D1 migration creates the regulated record model but does not invent or seed an approved enrollment.
