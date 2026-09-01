# Equipment and Online Platform List

**Programme:** Principles of Real Estate - Michigan Salesperson Prelicensure<br>
**Delivery:** entirely online; no classroom, lab, clinical space, or school-supplied student hardware.

**Readiness status:** the curriculum, secure machine-scored items/remediation, and shared account/progress platform exist. A Michigan pre-activation implementation now adds written-memo submission/instructor review, identity, signed-attestation, completion, reporting, certificate-identifier, and authority/surety refusal paths in `database/015_michigan_operational_gates.sql` and the paired server functions. It has repository-level acceptance tests, but has not been deployed, production-accepted, or activated. Incident recovery, reviewer UI, capacity, agency-answer configuration, and end-to-end deployment evidence remain open before filing.

## School-supplied systems

| System | Purpose | Filing status |
| --- | --- | --- |
| StateCourse learning-management system | Delivers ten addressable instructional modules in sequence | Built; Michigan acceptance evidence to capture |
| Secure account and authentication layer | Connects the student's account to the enrollment and course record | Shared platform built; Michigan identity record/gates implemented in the pre-activation branch; deployment acceptance pending |
| Server-side progress store | Records section completion, active study time, machine-scored attempts, remediation, course state, memo versions, rubric results, and feedback | Michigan schema and refusal tests implemented; deployment acceptance pending |
| Assessment service | Delivers applied-confirmation, engagement, and remediation items without exposing answer keys; no separate provider final is included in this submission version | Built; secure delivery test required |
| Written-memo review service | Retains each memo version and routes scoring only through the current active instructor-authority record for the 10-point rubric, criterion feedback, resubmission, and completion refusal until satisfactory | Pre-activation implementation and repository tests complete; approved-instructor data, deployment, and end-to-end acceptance remain |
| Instructor-support queue | Receives student questions and escalation flags, including the three-unsuccessful-attempt flag | Proposed Michigan workflow; acceptance pending |
| Identity and attestation record | Holds append-only photo-identification evidence metadata and the signed asynchronous-hour attestation; identity independently gates both certificate issuance and every completion report/export | Pre-activation implementation and repository tests complete; deployment and evidence-handling acceptance remain |
| Regulator-reporting export | Refuses a completion report/export until identity, attestation, completion, and all five authority gates pass; additionally refuses until BPL's cadence, format, and channel have been confirmed and recorded with evidence | Gate and payload builder implemented; still blocked on BPL answer and deployment acceptance |
| Certificate service | Refuses issuance until identity, attestation, 40-hour completion, all five authority gates, a permanent completion event, and every separately controlled PSS/BPL identifier are present | Gate and append-only certificate record implemented; agency identifiers, deployment, and rendering/delivery acceptance remain |
| Monitoring and incident log | Will preserve Michigan availability incidents, causes, resolutions, and student-record corrections | Acceptance evidence pending |

## Student-provided equipment

Students provide a current web-capable computer or tablet, internet access, a supported modern browser, an email address, and a camera or other approved means of presenting government photo identification. A telephone is used for support where necessary.

StateCourse LLC does not represent that it supplies the student's computer, internet service, or physical study space. The enrollment disclosures state the technical requirements before payment.

## Evidence to capture for MiPSS

- Course dashboard and ten-module navigation.
- A module objective/section/checkpoint sequence.
- Engagement assessment and remediation state without answer-key exposure.
- Written-memo submission, approved-instructor-only rubric review, criterion feedback, resubmission/version history, response timing, and module refusal until satisfactory.
- Student support and escalation view.
- Identity/attestation gate.
- Progress-resume demonstration after session interruption.
- Certificate and completion-report/export refusal while required approval or identity evidence is absent.

The implementation/evidence boundary is controlled at `../operational-gate-acceptance.md`. Screenshots are dated and combined into one upload only after every row above marked pending has passed deployed acceptance. Test or reviewer credentials are transmitted to the agency separately and never committed.
