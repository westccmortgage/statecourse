# Self-paced distance education control plan

**State:** design specification; production verification incomplete; enrollment closed.

| Control | Design | Required evidence before filing/release |
|---|---|---|
| orientation | first locked unit explains syllabus, materials, 180-day maximum, navigation, support, exams, conduct | reviewer recording/screenshots and completion log |
| persistent navigation | instructor/contact, syllabus/schedule, materials, PPD, technical support always available | accessibility/role test |
| unit size | divide delivery into reviewable units; map each unit to topic, objectives, words, media, assessment | regulator-format unit inventory |
| sequential mastery | next unit remains locked until prior unit content and assessment are complete | automated tests + audit-log sample |
| identity/account | verified unique learner, MFA/recovery, no shared credential, immutable identifier | privacy/security review and test record |
| attendance/progress | server records start, active interactions, content completion, assessment attempts and timestamps | retention/export reconciliation |
| time | count actual student-visible words at 225 wpm plus exact audio/video seconds; exclude navigation, waiting, homework, and duplicated text | signed timing ledger; present build fails |
| materials possession | versioned acknowledgment/download/access check no later than first course access | event log tied to student/material version |
| final exam | two protected 48-item forms; each covers all 16 sections three times; comprehensive, closed-book, three-hour allocation, ≥75%; bank separate from license exam | instructor/director signoff, version/hash freeze and NCREC review |
| proctoring | verify candidate identity and prevent materials/assistance; documented exceptions/accessibility | selected production workflow/vendor, data/privacy terms, test cases, incident SOP |
| exam security | persisted-seed replay and key-free public shape are tested; production requires least privilege, protected persistence, encrypted storage/transit, rotation and incident response | penetration/code review, clean-device test and access-log sample |
| technical support | published channels/hours/SLA, escalation, outage and access recovery | staffed roster, ticket test, PPD match |
| reviewer access | NCREC representative can inspect the whole course without payment/registration and with necessary software | reviewer account/instructions and clean-device test |
| 180-day cutoff | enrollment clock closes course completion eligibility after day 180 | boundary tests with timezone record |
| accessibility | keyboard, focus, headings, labels, contrast, captions/transcripts, zoom/reflow, error recovery, accommodations | WCAG audit plus documented remediation |
| reporting | completion export contains every .0207 field; queue and exception handling meet seven-day deadline | sandbox-to-report reconciliation |
| retention | immutable/controlled records retained three years and exportable for investigation/application | backup/restore and deletion-hold tests |

## Exam boundary

No StateCourse assessment may be copied from, modeled on, or checked against an actual NC license
examination question. Authoring source is the Commission syllabus and controlling public authority.
Student payloads never contain correct-choice markers or rationales before answer submission. Final
exam content is never exposed through public APIs, analytics, support tools, or reviewer screenshots.
The protected provider draft contains two 48-item forms and remains outside all public/static trees.
It is not administrable until the production proctoring and protected-storage acceptance record is
complete.

## Incident paths

Identity mismatch, unauthorized material/person/device, credential sharing, content scraping,
availability outage, lost response, incorrect grade, and suspected cheating each create a case with
timestamps, evidence preservation, independent review, outcome, student notice, appeal, and any
required regulator report. The education director reports cheating to NCREC within ten days.
