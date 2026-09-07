# North Carolina requirements traceability

**Status:** Phase 0 evidence complete; submission and enrollment NO-GO.  
Claim IDs resolve to `config/north-carolina/regulatory-manifest.mjs`.

| Requirement | Authority / pinpoint | Claim | Artifact/control | State |
|---|---|---|---|---|
| Provider certified before online operation | G.S. 93A-34(a); 58H .0202 | NC-C01 | filing index; release gate | external approval missing |
| $200 per provider location | 58H .0202(c) | NC-C02 | provider datasheet | confirmed |
| foreign entity consent to service | 58H .0202(b)(6) | NC-C03 | provider datasheet | signature missing |
| no preapproval course advertising | 58H .0401(a) | NC-C04 | engine/HANDOFF gate | implemented |
| full distance course/reviewer access | 58H .0401(c), (f) | NC-C04, NC-C05 | control plan | build incomplete |
| 225 wpm plus media timing | 58H .0401(c)(6), (f)(2) | NC-C05 | timing report + validator | failing |
| orientation and persistent navigation | 58H .0415(a)-(b) | NC-C06 | control plan/course guide | specified, not production-verified |
| assessment before next unit | 58H .0415(c) | NC-C06 | engine/control plan | designed, production evidence missing |
| completion within 180 days | 58H .0207(a) | NC-C06 | PPD/course guide | drafted |
| distance units and assessments complete | 58H .0207(a)(1) | NC-C06 | engine/control plan | designed |
| ≥75% comprehensive closed-book final | 58H .0207(a)(2), (c); Syllabus | NC-C06 | engine/course guide | threshold set; final bank missing |
| identity/no-material proctoring | 58H .0207(c) | NC-C06 | control plan | vendor/workflow missing |
| signed completion certificate fields | 58H .0207(a), (e) | NC-C06 | certificate specimen | drafted |
| completion report within seven days | 58H .0207(f) | NC-C07 | reporting SOP | specified |
| monthly summary by fifth day | 58H .0207(g) | NC-C07 | reporting SOP | specified |
| retain enumerated records three years | 58H .0208 | NC-C08 | reporting SOP | specified, storage audit missing |
| provider/course annual expiry | G.S. 93A-35(b); 58H .0209/.0416 | NC-C09 | filing index/calendar | specified |
| PPD before payment and signed receipt | 58H .0204(b)(9) | NC-C01 | PPD; enrollment closed | drafted; no payment enabled |
| current course materials/depth | 58H .0205; Syllabus | NC-C04 | curriculum/readings | incomplete source reconciliation |
| nonprovisional NC broker instructor | 58H .0302(b)(1) | NC-C10 | instructor dossier | missing |
| 60 semester hours | 58H .0302(b)(3) | NC-C10, NC-C15 | instructor dossier | evidence missing |
| instructor exam before NIS | 58H .0302(b)(6) | NC-C10 | personal path | not taken |
| recent NIS + performance | 58H .0302(b)(4), (c) | NC-C10 | personal path | not taken |
| qualifying experience/equivalency | 58H .0302(b)(5) | NC-C10, NC-C15 | preclearance email | unresolved |
| CA-license alternative pathway | 58A .0511(b) | NC-C11, NC-C12 | personal path | likely available, document good standing |
| comparable nonprovisional mapping | 58A .0511(b)(1) | NC-C14 | preclearance email | regulator confirmation required |
| criminal report, not identified fingerprinting | 58A .0301(b)(2) | NC-C16 | personal path | order at filing |
| $105 original application | 58A .0302(a) | NC-C18 | personal path | confirmed |
| CE product constraints | G.S. 93A-38.5; 58H .0403-.0404 | NC-C20 | product roadmap | confirmed |

## Release rule

Passing this repository's structural tests does not clear filing or enrollment. Release requires all
open blockers in the manifest to be closed with documentary evidence, a filing-date source refresh,
NCREC provider and course approvals recorded by number and effective date, an approved instructor,
and an independently tested LMS/proctoring/reporting implementation.
