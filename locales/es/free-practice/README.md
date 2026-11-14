# Spanish Real Estate Free Practice — local authoring draft

**2026-11-14 publication review: HOLD.** The user has now authorized publication, superseding the historical authorization note below. The current draft is not ready for publication: confirmed semantic errors and 1,098 lexical review candidates remain. See [review](../../../docs/audits/REAL-ESTATE-SPANISH-PUBLICATION-REVIEW-2026-11-14.md). Current publication branch is `work/real-estate-es-publish-20261114`, based on production main `d3970e6`; it includes 19 new Texas Finance translations and 23 selected editorial corrections.

Scope is the existing explicit public Real Estate practice catalog: **14 states, 30 courses, 284 lessons and 3,172 formative questions**, plus the existing Texas casework. This does not add states absent from that catalog, protected final examinations, enrollment, regulated hours, certificates or licensing credit.

| State | Courses | Lessons | Questions |
| --- | ---: | ---: | ---: |
| AK | 1 | 8 | 88 |
| AZ | 2 | 15 | 165 |
| CA | 3 | 45 | 495 |
| CO | 6 | 29 | 319 |
| ME | 1 | 9 | 99 |
| MI | 1 | 10 | 110 |
| MO | 2 | 15 | 165 |
| NC | 1 | 16 | 176 |
| OK | 1 | 16 | 176 |
| PA | 2 | 15 | 165 |
| TX | 6 | 60 | 708 |
| VA | 1 | 15 | 165 |
| WA | 2 | 18 | 198 |
| WI | 1 | 13 | 143 |

## Source and delivery boundary

`config/free-practice-sources.mjs` and the existing public generator remain authoritative. The extractor reads only the generated public formative projection. Each Spanish file retains exact English strings, the source course revision and source lesson SHA-256 records. Build checks reject stale/missing/extra strings, changed numeric/math notation, and changed official citation or URL text. URLs and source-link DOM nodes are never rewritten by localization.

The browser changes text and labels only. Course/question/choice IDs, grading, randomized presentation, first-attempt records and local storage keys remain English-source based. It does not replace input or textarea nodes on a language switch. Only the language preference uses the existing `statecourse.interface-language` key. An unavailable/stale Spanish course is hidden with a Spanish notice; English remains available. Pending exports overwrite any previous complete generated companion with a non-content pending record.

## Translation status and open review

Draft translation uses the locally installed Helsinki-NLP English–Spanish model through CTranslate2, with sentence-level source coverage, notation checks and explicit editorial overrides. No course text was sent to a paid or remote translation API. Native Apple Translation was evaluated locally before using the faster local model.

**Human bilingual review of every lesson, question, explanation and activity remains OPEN. Qualified state-specific SME review remains OPEN.** Machine checks do not certify legal meaning, fluency, negation, terminology or instructional duration. The on-page draft notice is required. Official external sources and optional generated AI answers retain their original language; optional AI services were not invoked in these checks. No state/provider approval or submission status changes.

## Reproducible authoring

1. Generate the English baseline: `node scripts/generate-national-platform.mjs`.
2. Extract the allowlisted source: `node scripts/prepare-free-practice-spanish.mjs /tmp/statecourse-real-estate-spanish-work`.
3. Run `scripts/translate-free-practice-local.py` with paths to segments JSON, resumable JSONL output, the installed tokenizer and the converted local CTranslate2 model. Translation dependencies belong in an isolated authoring environment; none are browser or production runtime dependencies.
4. Normalize equivalent numeric formats using `scripts/normalize-free-practice-spanish.py`; repair flagged notation using `scripts/repair-free-practice-numbers.py`, use `scripts/repair-free-practice-anchors.py` for immutable citation/number anchors where needed, then inspect remaining review items. Do not mark an incomplete/flagged course complete.
5. Import validated sentence-covered results using `node scripts/import-free-practice-spanish.mjs SOURCES_JSON TRANSLATED_JSONL` and rebuild.

## Verification commands

```sh
bash site/build.sh
node --test tests/free-practice-locale.test.mjs tests/free-practice-access.test.mjs tests/free-practice-activities.test.mjs tests/practice-boundary-regressions.test.mjs
python3 tests/free_practice_sentences_test.py
git diff --check
```

All browser acceptance uses localhost and public non-credit practice with synthetic/local answers. Production deployment, live-account acceptance and a full real-learner run remain unverified. No push, merge, deploy, regulator submission, payment or production activation is authorized by this draft.

## Local verification — November 14, 2026

- 30/30 companions complete; 111,871 unique source strings; zero outstanding numeric/reference checks. This is machine-draft completeness, not bilingual approval.
- `bash site/build.sh`: exit 0, including 5 protected-assessment checks.
- Focused Node tests above: 51 passed, zero failed/skipped. DOM tests used LinkeDOM 0.18.15 (now an exact development dependency); lockfile install dry-run passed.
- Python sentence tests: 3 passed. `git diff --check` passed.
- Actual Chrome localhost: Arizona question, feedback and progress; English/Spanish selected-answer preservation; Texas lesson and casework rendering; written response preserved across language switches and reload. Official external source hrefs remained original. Spanish desktop navigation fits the observed 1110-pixel viewport without horizontal overflow.
- Not verified: every lesson's semantic/linguistic quality, every course end to end, mobile devices, real student accounts, optional generated AI replies, learner duration, or production. Human bilingual and state-specific SME review remain OPEN. No production deployment or activation occurred.

Work lives on `work/real-estate-practice-es-20261114`, based on `bd8319e`, isolated from the original workspace's unrelated uncommitted changes. Translation authoring used a local Helsinki-NLP model with sentence/prose segmentation, exact source anchors and explicit editorial overrides. Fragment-based translation can be awkward around inline emphasis and legal terminology; reviewers must inspect the full material before publication.
