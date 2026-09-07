# Rule 58H .0401 timing evidence — failing baseline

**Measured:** 2026-09-07
**Rule:** 58H .0101(7) defines an instructional hour as 50 minutes of instruction and 10 minutes of
break. Rule .0401(c)(6), (f)(2) measures distance-course content at 225 words per minute plus actual
audio/video duration.
**Corrected target:** 72 non-exam instructional hours = 3,600 actual instructional minutes. The
syllabus assigns three further hours to the final examination inside the 75-hour course total.
The examination and break allocation must have separate ledgers; breaks cannot be counted as text
or media instruction. The previous 4,320-minute target incorrectly treated every hour as 60 minutes
of instruction. Official .0101 indexed text was rechecked September 6; direct OAH PDF capture failed.

## Baseline

| Repository measure | Words | Minutes at 225 wpm | 60-minute elapsed hours |
|---|---:|---:|---:|
| sixteen curriculum Markdown files, audit tokenizer | 57,677 | 256.34 | 4.27 |
| curriculum plus entire question-bank source file (deliberately generous ceiling) | 78,191 | 347.52 | 5.79 |
| reading-only words for 72 instructional hours | 810,000 | 3,600 | 60.00 |

The September 7 increase reflects the official-source rewrite of Modules NC-01 through NC-07, their
assessments, three Module NC-03 visual exhibits, the required zoning examples, the corrected
property-tax, excise-tax, federal tax, flood and C.L.U.E. instruction, and the current federal and
North Carolina environmental-disclosure rules, and the current ownership, lease, lien, condominium,
recording, intestacy and adverse-possession rules, and the current contract, electronic-transaction,
legal-practice and agency-representation boundaries. Related stale statements in Module NC-15 were also
corrected. This is substantive correction, not time padding. The audit tokenizer counts word-like Unicode tokens
and excludes Markdown punctuation. Both totals include nonstudent material: the curriculum includes author notes and the larger count also includes
JavaScript syntax/metadata. Both are upper-bound audit signals, not valid student-visible instruction.
There is no duration-controlled audio/video ledger. The current course is at most a small
fraction of the required instruction and must not be submitted or advertised as 75 hours.

## Required unit ledger

For every reviewable unit record: module/section/topic; Bloom level/objective; student-visible word
count; excluded navigation/repeated/legal text; counted minutes at 225 wpm; audio/video filename,
hash and exact duration; assessment/activity treatment; cumulative minutes; reviewer route; content
version/hash. The total is recomputed from source, not typed into a label.

Instructional expansion must preserve prescribed depth and current law. Repetition, waiting screens,
download time, homework, exams other than the three-hour final, navigation, technical setup, and
unsupported “seat time” are not used to manufacture hours.

Run `node scripts/north-carolina-source-lock.mjs --json` to recalculate the repository signal. The
validator reports `timing.demonstrated: false`. Increasing raw source words can never change this
to true. A completed student-visible unit/media ledger and full-course review are required first.
