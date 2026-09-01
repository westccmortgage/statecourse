# Michigan Operational-Gate Acceptance Record

**Course:** Principles of Real Estate - Michigan Salesperson Prelicensure<br>
**Course version:** 1.0-submission-draft<br>
**Implementation state:** pre-activation branch implementation; not deployed, filed, approved, or enabled<br>
**Enrollment:** closed

This record separates three facts that must not be blurred: code exists, repository tests exercise it, and a deployed production workflow has been accepted. Only the first two are true for the rows marked implemented below.

## Implemented pre-activation slice

| Gate | Enforced design | Repository evidence | Current limit |
| --- | --- | --- | --- |
| Written memorandum | Append-only submission versions with server hash and timestamp; a pending version cannot be overwritten | `lib/michigan-operational-gates.mjs`; `database/015_michigan_operational_gates.sql`; `tests/michigan-operational-gates.test.mjs` | Migration/server path not deployed |
| Instructor review | Current active instructor authority must match the reviewer; all five rubric criteria and criterion feedback are required; outcome is derived rather than accepted from the caller | Unit and migration architecture tests cover wrong reviewer, boundary-score override, feedback, and immutable review | No Michigan-approved instructor identifier exists yet |
| Resubmission | Needs-revision opens the next integer version without altering earlier text, hash, feedback, or review; satisfactory closes further submissions | Two-version acceptance scenario retains version one and its review | Deployed queue/UI and one-business-day evidence remain |
| Module completion | Six sections, 14,400 active seconds, satisfactory current memo, 100% applied confirmation, engagement submission, and satisfied/not-required remediation must all exist | Module refusal tests and database completion trigger | Michigan instructional UI and live persistence not deployed |
| Identity | Authorized staff records legal name, method, evidence reference/hash, verifier, and time in append-only history | Unauthorized verifier and record-mismatch tests | Evidence handling and production verifier procedure remain to accept |
| Asynchronous attestation | Student's typed legal signature, controlled statement version, 40 hours, signature-record hash, and time are retained; signing is refused before all ten modules/40 hours | Premature-attestation and identity-name-match tests | Production signature UX and export evidence remain to accept |
| Course completion | Active credit-eligible non-review enrollment, ten complete modules, 40 hours, identity, attestation, and all five authorities are required | Complete and reviewer-refusal scenarios; direct database write guard | No real enrollment can reach the gate while enrollment is closed |
| Certificate | Completion record, identity, attestation, live authorities, confirmed identifier requirements, and separate PSS school/BPL sponsor/BPL course numbers are required | Missing-each-identifier and authority-expiration tests | Agency identifiers and final rendered/delivery workflow remain blank/unaccepted |
| Completion report | Completion and identity gates are rechecked; generation additionally requires an evidence-backed BPL channel and format | Missing-channel/format and authority-expiration tests | BPL answer, transmission, receipt, correction, and cadence acceptance remain |
| Authority/surety kill switch | School, program, course, instructor, and surety share one decision used by enrollment, credited time, module/course completion, certificate, and report paths | One-lapse/all-permissions refusal test plus database triggers | Restoration/teach-out/refund orchestration and deployed monitoring remain |

No test fixture identifier is stored in the controlled course configuration or migration seed. The checked-in configuration holds all five authorities at `pending`, every government identifier at `null`, certificate/report requirements unconfirmed, and `enrollment_enabled: false`.

## Still open before PSS filing

1. Apply the migration in a non-production acceptance environment, exercise the actual server functions and account permissions, and preserve dated evidence.
2. Build the Michigan student/instructor/reviewer UI over the gated server paths, including the pending-review queue and one-business-day timer/escalation.
3. Implement and exercise incident start/impact/cause/resolution/correction records, backup restoration, and interrupted/duplicate memo reconciliation.
4. Obtain BPL's completion-grade and completion-report cadence/format/channel answers; record those answers as configuration evidence and test the exact payload and receipt path.
5. Obtain all agency and surety identifiers; test activation and each lapse at its effective/expiration boundary without enabling public enrollment.
6. Complete the 25-active-student capacity/wait-list/no-charge and instructor-unavailable controls.
7. Complete certificate rendering, delivery, duplicate/correction/void history, public verification treatment, and permanent transcript/closure acceptance.
8. Provision named time-limited reviewer access that creates no student credit, then capture the full reviewer walkthrough.
9. Acceptance-test regulator-loss notification, agency-directed restoration/teach-out, cancellation/refund, complaint, and surety-rights paths.

Until every applicable row above is closed, this implementation is evidence of built refusals—not a claim of Michigan approval, production readiness, or authority to enroll.
