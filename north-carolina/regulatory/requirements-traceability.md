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
| owner and buyer/tenant agency agreement timing | 58A .0104(a) | NC-C39 | Module NC-08; assessment bank | current rule reconciled |
| WWREA at first substantial contact and actual review | 58A .0104(c); NCREC WWREA guidance | NC-C39, NC-C42 | Module NC-08 lab | delivered; current form artifact still missing |
| dual/designated-dual authority and confidentiality limits | 58A .0104(d), (i)-(n) | NC-C39 | Module NC-08 scenarios | current rule reconciled |
| executed-document delivery | 58A .0106 | NC-C40 | Module NC-08; assessment bank | three-day rule reconciled |
| transaction records and disclosure retention | 58A .0108 | NC-C40 | Module NC-08; records questions | later-event three-year rule reconciled |
| compensation consent/disclosure; no fixed rate | 58A .0109 | NC-C41 | Module NC-08 calculation set | current rule reconciled |
| federal protected classes, practices and narrow exemptions | 42 U.S.C. §§3603-3607 | NC-C43 | Module NC-09 examples and screening matrix | current statute reconciled |
| covered-multifamily accessibility; accommodation/modification | 42 U.S.C. §3604(f) | NC-C44 | Module NC-09 design scenarios | elevator/ground-floor distinction reconciled |
| fair-housing complaint/action periods and civil/criminal split | 42 U.S.C. §§3610, 3613, 3617, 3631 | NC-C45 | Module NC-09 enforcement section | current statute reconciled |
| race-equal property rights | 42 U.S.C. §1982 | NC-C46 | Module NC-09 | current statute reconciled |
| equal neighborhood information; withdrawn HUD guidance | HUD 2026 letter; 2025 withdrawal notice | NC-C47 | Module NC-09 neighborhood/screening labs | current HUD posture reconciled; PDF bytes uncaptured |
| customer-facing office accessibility | ADA Title III | NC-C48 | Module NC-09 office scenarios | current federal boundary reconciled |
| National and entity-specific Do Not Call controls | FTC TSR | NC-C49 | Module NC-09 decision drill | current FTC periods/process reconciled |
| independent fee setting and competitor restraints | Sherman Act; DOJ guidance | NC-C50 | Module NC-09 compensation/antitrust scenarios | current federal boundary reconciled |
| brokerage advertising identity and consent | 58A .0105 | NC-C51 | Module NC-09 social-ad item | current rule reconciled; PDF bytes uncaptured |

## Release rule

Passing this repository's structural tests does not clear filing or enrollment. Release requires all
open blockers in the manifest to be closed with documentary evidence, a filing-date source refresh,
NCREC provider and course approvals recorded by number and effective date, an approved instructor,
and an independently tested LMS/proctoring/reporting implementation.
