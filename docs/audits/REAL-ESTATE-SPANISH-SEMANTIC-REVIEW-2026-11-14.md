# Spanish semantic review continuation — 2026-11-14

## Actual scope

Owner authorized continued Spanish free-practice correction and publication on the existing site. Branch: `codex/real-estate-es-semantic-review-20261114`. Baseline: `574f467ebbc01d74943c91c6334b098c4da5965d`.

This continuation corrects **807 distinct source translations / 888 course entries across all 30 courses**. It does **not** complete a sentence-by-sentence semantic review of the entire corpus. All courses retain full-semantic-review OPEN in the coverage ledger. Human linguistic review, qualified state SME review, learner validation/duration and regulatory approval remain OPEN.

Corrections include duties incorrectly rendered as rights, lost negations, omitted clauses, unrelated EU text hallucinated by the original machine translation, land surveying confused with opinion surveys, boundary/legal-description vocabulary, missing directions in a worked land description, acres/feet/yards incorrectly rendered as metric units without conversion, and eight Alaska lesson titles. Whole-sentence rewrites restore selected scenarios and explanations. Terminology-only changes are not represented as certification of the rest of those paragraphs. Ordinary participant/occupancy surveys remain surveys. Wrong answer options preserve their English meaning even where that meaning is legally incorrect.

## Traceability and checks

- `work-evidence/spanish-semantic-review-corrections-20261114.json`: exact English, previous/current Spanish, course, source SHA-256 and target SHA-256, consolidated against the baseline.
- `work-evidence/spanish-semantic-review-coverage-20261114.json`: source revision and changed/total string counts for every course; full-review gates explicitly OPEN.
- `bash site/build.sh`: passed, including 5 protected-assessment tests and exact public-source coverage, revision, numeric and reference validation. A reference-parenthesis mismatch and numeric ordering mismatch were caught and fixed without weakening checks.
- 51 focused locale/access/activity/boundary tests passed, zero failures/skips, with LinkeDOM 0.18.15; 3 Python sentence tests passed.
- Actual Chrome local rendering verified the revised Alaska objectives, duties, progress-evidence wording and all eight translated lesson-selector titles. Screenshot retained in `work-evidence/spanish-semantic-local-20261114.png`.
- No English course, question IDs, answers, grading, source evidence, backend, authentication, commerce, enrollment, credit or certificate setting changed. Build tests do not prove semantic correctness.

## Production scope and recovery

Existing site `statecourse.com`, Netlify `b514a8f8-782b-448c-8881-a914ee42c69b`. Previous published deploy `6af8a2d2d90786266849a7ff`, ready, baseline commit above. Ordinary fast-forward Git publication uses existing CD. No settings, secrets, database, paid API, new environment or infrastructure changes.

Recovery: a new forward commit restoring only affected locale/evidence files from the baseline, rebuild, then publish through the same path. No history rewriting or historical deploy restoration.

Live acceptance is pending until the new deploy is ready and public hashes/rendering are observed. Every lesson/question end to end, all remaining meanings, human/SME review and mobile acceptance are **not verified**.
