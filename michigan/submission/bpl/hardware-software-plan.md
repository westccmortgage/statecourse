# Hardware and Software Failure Remedy

**Status:** filing design. Core server-side progress and machine-scored confirmation/engagement/remediation behavior exists. The Michigan written-memorandum submission/versioning, approved-instructor rubric/feedback/resubmission, identity, attestation, reporting, certificate, and incident-evidence extensions must be implemented and acceptance-tested before this document is submitted as an operating capability.

## Student interruption

Existing core course state is stored on the server as it occurs. Section views, active study time, machine-scored confirmation/assessment submissions, remediation state, and completion are not derived from a browser-only flag. Before filing, the Michigan launch build must add a server-side written-memorandum workflow that retains every draft/submitted version or file hash, submission time, instructor rubric result, criterion-level feedback, reviewer identity, review time, and resubmission without overwriting history. It must also add identity evidence and the signed attestation to the protected server record. A student who loses power, internet access, the browser session, or the device signs in on the same or another supported device and resumes from the last confirmed server state.

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
