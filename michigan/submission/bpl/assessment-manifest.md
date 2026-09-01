# Michigan In-Module Assessment Manifest

**Course:** Principles of Real Estate - Michigan Salesperson Prelicensure<br>
**Course version:** 1.0-submission-draft<br>
**Status:** Submission draft; not approved<br>
**Scope:** R 339.22157(2)(e)-(f) in-module assessment and remediation. Michigan prescribes no separate final examination, and this version includes none.

## Controlled inventory

| Module | Applied confirmation item | Engagement items | Remediation items | Total secure-bank items |
| --- | --- | --- | --- | ---: |
| module-01 | `module-01-applied-01` | `module-01-engagement-01` through `-05` | `module-01-remediation-01` through `-05` | 11 |
| module-02 | `module-02-applied-01` | `module-02-engagement-01` through `-05` | `module-02-remediation-01` through `-05` | 11 |
| module-03 | `module-03-applied-01` | `module-03-engagement-01` through `-05` | `module-03-remediation-01` through `-05` | 11 |
| module-04 | `module-04-applied-01` | `module-04-engagement-01` through `-05` | `module-04-remediation-01` through `-05` | 11 |
| module-05 | `module-05-applied-01` | `module-05-engagement-01` through `-05` | `module-05-remediation-01` through `-05` | 11 |
| module-06 | `module-06-applied-01` | `module-06-engagement-01` through `-05` | `module-06-remediation-01` through `-05` | 11 |
| module-07 | `module-07-applied-01` | `module-07-engagement-01` through `-05` | `module-07-remediation-01` through `-05` | 11 |
| module-08 | `module-08-applied-01` | `module-08-engagement-01` through `-05` | `module-08-remediation-01` through `-05` | 11 |
| module-09 | `module-09-applied-01` | `module-09-engagement-01` through `-05` | `module-09-remediation-01` through `-05` | 11 |
| module-10 | `module-10-applied-01` | `module-10-engagement-01` through `-05` | `module-10-remediation-01` through `-05` | 11 |
| **Total** | **10** | **50** | **50** | **110** |

The applied confirmation item requires 100%; engagement and remediation require 80%. These thresholds are StateCourse instructional standards, not Michigan-prescribed passing scores. A deficient engagement attempt enters remediation and cannot complete the module until the remediation requirement is satisfied.

## Written performance assessment — separate from the 110-item bank

Each module also requires one written transaction memorandum, for **10 written submissions across the course**. A BPL-approved instructor reviews each against `applied-memo-rubric.md`. Satisfactory requires at least 8 of 10 points and no zero on legal/rule accuracy or professional-boundary handling. A needs-revision result includes criterion-level feedback; the student resubmits until satisfactory, and the module remains incomplete. The record retains every submitted version, rubric result, feedback, instructor/reviewer identity, and timestamps.

## Security and reviewer treatment

The authoritative bank is `config/michigan/module-question-bank.mjs`; the engine assigns the identifiers above and deterministically permutes choices. The student payload contains only item ID, prompt, and choices. It strips the correct choice and rationale item by item. This manifest intentionally contains neither prompts nor answer keys.

At BPL request, a named reviewer receives time-limited read-only access and secure answer-key access by a separate channel. No credential or key is placed in the filing archive, public site, or git history. The reviewer environment is not represented as ready until Michigan acceptance testing proves assessment delivery, remediation, completion refusal, and non-disclosure of answer keys.
