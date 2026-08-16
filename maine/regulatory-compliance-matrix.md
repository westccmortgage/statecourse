# Maine regulatory compliance matrix

Status key: **Built** = first-pass artifact exists; **Pending** = provider decision, named person, external certification, filing, or written regulator action is still required; **Release gate** = must be satisfied before qualifying-credit enrollment.

| Requirement | Official authority | StateCourse evidence | Status |
|---|---|---|---|
| Provider must be an eligible degree-granting institution, proprietary school, or public-school adult education program | ME-2, Ch. 360 §1(1) | `submission-package.md` provider-eligibility attachment slot | **Pending / release gate** — confirm StateCourse entity/school authorization |
| Course meets Commission Sales Agent competencies | ME-2, Ch. 360 §1; ME-3 pp. 27–39 | `timed-course-outline.md`; `curriculum/hour-by-hour-curriculum.md`; `traceability.md` | Built; final instructor/legal review pending |
| Minimum 55 hours | ME-3 p. 27 and p. 40 | 3,000 instruction + 300 assessment minutes in timed outline; server config locks 3,300 total | Built |
| Topic weights exclude quiz/exam time | ME-3 p. 27 | Instruction allocation 1/1/13/13/28/9/9/14/8/4 across exactly 3,000 minutes | Built |
| Three quizzes, at least 60 objective items total, appropriate intervals | ME-3 p. 40 | Three 20-item objective quizzes at Hours 15, 34 and 46 | Built |
| Remediation explains incorrect and correct answers | ME-3 p. 40 | Quiz rationales; LMS objective-level remediation and retest gate | Built |
| Final exam: at least 80 objective items, weighted by course topics, at course end | ME-3 p. 40 | 80-item bank, allocation 1/1/10/10/23/7/7/11/6/4, Hours 53–55 | Built; security/proctor method acceptance pending |
| Assessment time no more than 10% of 55 hours | ME-3 p. 40 | 300 minutes = 9.09% of 3,300 minutes | Built |
| Passing grade at least 75% | ME-2, Ch. 360 §1(3); ME-3 p. 40 | Syllabus and LMS config require final numeric course grade ≥75% | Built |
| Minimum two case studies for Sales Agent distance course | ME-3 p. 40; ME-4 p. 5 checklist | Two graded Maine scenarios with answer keys | Built |
| ARELLO certification or Commission alternative | ME-3 p. 40 | Certification slot plus alternative control narrative | **Pending / release gate** — regulator-confirm accepted pathway |
| Syllabus includes provider, instructor résumé, title, schedule, texts, timed breakdown, grading, attendance, final exam/key, cheating policy | ME-2, Ch. 360 §2(1) | Syllabus; outline; assessments; identity policy; attachment checklist | Built except provider details, instructor/résumé, schedule/deadline, text edition |
| Non-live course review target is 45 days after complete syllabus | ME-2, Ch. 360 §2(3) | Filing calendar in submission package | Pending filing; planning fact only, not guaranteed approval |
| Course guidelines and syllabus distributed at first session | ME-2, Ch. 360 §2(4) | Enrollment-release gate logs versioned downloads/acknowledgment | Built in specification |
| Do not advertise/enroll/deliver for licensing credit before written approval | ME-2, Ch. 360 §2(5) | `enrollmentEnabled:false`; pending notice; release checklist | **Release gate** |
| Required Commission notice read/distributed at course start | ME-2, Ch. 360 §2(5); ME-4 Attachment 1 | Versioned start-course notice; approved statement enabled only after approval | Built; approval values pending |
| Enrollment report within 30 days after each completion cohort/administration | ME-2, Ch. 360 §2(6); ME-4 pp. 8–9 | Reporting queue, review workflow, field map | Built in procedure; submission integration pending |
| Student evaluations distributed; summary sent with report | ME-2, Ch. 360 §2(7); ME-4 pp. 6–7 | Evaluation form workflow and summary report | Built in procedure |
| Transcript/certificate required fields | ME-2, Ch. 360 §2(8); Ch. 390 §1(4) | Certificate template contains title, student, numeric grade, dates and authorized signature | Built; approval number and signer pending |
| Substantial syllabus changes reported and approved before use | ME-2, Ch. 360 §2(2) | Version/change-control and regulator approval gate | Built in policy |
| No brokerage recruiting on course platform | ME-2, Ch. 360 §2(10) | No-recruiting policy and admin audit flag | Built |
| Distance filing attachments: syllabus, texts, two cases/keys, résumé, handouts/answers, quiz/key, final/key, access, outline, admin policy, timing study, ARELLO if applicable | ME-4 p. 5 | `submission-package.md` manifest | Built first pass; named/external fields pending |
| Student-instructor and content interaction, timing evidence | ME-3 distance pathway; ME-4 distance checklist | Messaging SLA, content interactions, checkpoint events, pilot timing-study protocol | Built as design; timing-study results pending |
| Course evaluation includes distance-learning usability, instructions and technical support | ME-4 pp. 6–7 | Evaluation form mirrors official dimensions | Built |
| Sales Agent candidate completes course with 75% and passes licensing exam within one year | ME-2 Ch. 390 §1(3); ME-5 | Student handbook completion notice | Built informational notice |

