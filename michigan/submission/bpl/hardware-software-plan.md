# Hardware and Software Failure Remedy

**Status:** filing design with a pre-activation implementation. Core server-side progress and machine-scored confirmation/engagement/remediation behavior exists. The Michigan branch now implements written-memorandum submission/versioning, active-instructor-only rubric/feedback/resubmission, identity, attestation, completion, reporting, certificate, and authority/surety refusal records. Repository tests pass, but the migration and server paths have not been deployed or production-accepted, agency identifiers/configuration remain blank, and incident evidence remains to implement. This document is therefore not yet an operating-capability claim.

## Student interruption

Existing core course state is stored on the server as it occurs. Section views, active study time, machine-scored confirmation/assessment submissions, remediation state, and completion are not derived from a browser-only flag. The Michigan pre-activation migration adds append-only memorandum versions with response hashes, submission times, instructor rubric results, criterion feedback, reviewer identity, review time, and resubmission without overwriting history. It also adds append-only identity evidence metadata and the signed attestation to the protected server record. The student path writes through server RPCs, not browser completion flags. Deployment acceptance must still prove that a student who loses power, internet access, the browser session, or the device signs in on the same or another supported device and resumes from the last confirmed server state.

Opening an assessment does not consume an attempt. Submission creates the attempt. Answers are graded on the server from a key that is not sent to the browser.

## Platform interruption

Before filing, the Michigan acceptance environment must prove that StateCourse monitors availability and records an incident's start, affected services/students, cause, resolution, and record corrections. The operating policy for a confirmed outage is:

- access and assessment deadlines are extended so the student loses no enrollment time;
- incomplete work remains incomplete and receives no fabricated time or credit;
- a partially received assessment or memorandum submission is reconciled against server records before retry; no memorandum version is marked submitted without a server acknowledgment, and a recovered/retried version never overwrites an earlier confirmed version;
- the student receives status and recovery instructions through the account/email channel; and
- support responds within one business day, sooner for a broad outage.

## Data recovery and correction

The pre-filing acceptance test must prove that backups and event records permit restoration without converting an interruption into completion and that a correction preserves the old value, new value, reason, actor, and timestamp. It must recover a memo version, rubric/feedback record, and resubmission history; prove that a partially received memo creates neither a false submission nor a duplicate; and preserve the instructor identity/time. No employee may add study time or a passing result merely because a student reports a failure; the incident and available evidence must support the correction.

## Student requirements and alternatives

Technical requirements are shown before enrollment. If the student's equipment cannot run the current platform, support first addresses browser/device compatibility and then offers a reasonable supported alternative that preserves every module, memorandum/instructor review, confirmation, assessment, identity, and hour requirement. No alternative shortens the course.

After the acceptance gate passes, the incident log, applicable student events, and correction record will be available to BPL on request.
