# Rule 58H .0401 timing evidence — failing baseline

**Measured:** 2026-09-04  
**Rule:** distance-course outline must demonstrate minimum hours at 225 words per minute plus actual
audio/video duration.  
**Target used:** 72 non-exam instructional hours = 4,320 minutes; final examination = 3 hours inside
the 75-hour course total.

## Baseline

| Repository measure | Words | Minutes at 225 wpm | Hours |
|---|---:|---:|---:|
| sixteen curriculum Markdown files, audit tokenizer | 51,568 | 229.19 | 3.82 |
| curriculum plus entire question-bank source file (deliberately generous ceiling) | 72,393 | 321.75 | 5.36 |
| reading-only words needed for 72 hours | 972,000 | 4,320 | 72.00 |

The audit tokenizer counts word-like Unicode tokens and excludes Markdown punctuation. The generous
ceiling includes JavaScript syntax/metadata and is therefore not valid student-visible
time. There is no duration-controlled audio/video ledger. The current course is at most a small
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
validator intentionally reports `timing.demonstrated: false`; a future true value is still not a
substitute for the regulator-format ledger and full-course review.
