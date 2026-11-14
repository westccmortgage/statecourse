# Spanish public practice release — 2026-11-14

## Scope and authorization

Owner requested continued correction and publication for all 14 existing Real Estate practice states, without stopping after each batch. This release exposes a corrected **public non-credit draft**, with the existing prominent Spanish review notice and English switch. It does not assert that all semantic errors are eliminated, that a human reviewed every string, or that a regulator approved Spanish instruction.

The earlier HOLD entries are historical records of the first correction queues. This release decision is limited to the openly labelled free-practice draft; human linguistic review, qualified state SME review, learner acceptance/duration and regulatory approval remain OPEN. The complete corpus has not received exhaustive human semantic certification.

## Content and integration

14 states: AK, AZ, CA, CO, ME, MI, MO, NC, OK, PA, TX, VA, WA, WI. 30 courses, 284 lessons, 3,172 formative questions and existing Texas casework. Compared with the initial Spanish commit, 4,244 unique source strings have changed translations and 19 new current-English-source strings were translated. Targeted corrections cover legal roles and loan principal, earnest money, parcels, void/voidable, deeds, conveyance, trust accounts, listing/representation, consideration, executory performance, email-action scenarios, recording and wire transfers. Full contextual rewrites restore omitted facts in selected scenarios. 221 generic lesson titles now use consistent Spanish course names.

Spanish entry links are generated on the 14 state pages, eligible course pages, pricing and about pages. Locale maps remain exact-source/revision bound, and translations affect text presentation only. English source IDs, source URLs, grading, storage and regulatory boundaries remain unchanged. Current main's coach/auth/backend implementation is retained; only the earlier two bilingual coach prompt defaults are part of the feature diff.

The lexical scanner still reports 140 raw candidates, including genuine ordinary lists, facts/actions, email nouns, reconsideration of value, and cash mentioned separately from earnest money. Raw reports are retained without disabling or weakening checks. A lexical scan is not an exhaustive semantic certification, including when its count is zero. Review scope and OPEN statuses remain explicit in the corpus, UI and this report.

## Observed verification before publication

- `bash site/build.sh`: exit 0, including 5 protected-assessment tests.
- 51 focused locale/access/activity/boundary tests pass, zero failures/skips; DOM checks use LinkeDOM 0.18.15.
- 3 Python sentence tests pass; `git diff --check` passes.
- Build validates all 30 source hashes, exact string coverage, numeric/reference anchors and private-assessment boundary. Changed citation punctuation was caught and corrected, not bypassed.
- Generated HTML contains Spanish state-specific entry links for all 14 states.
- Actual Chrome localhost opened all 30 Spanish courses in all 14 states, observing `lang=es`, ready translations, visible readers and expected lesson counts. Evidence: `work-evidence/spanish-local-browser-courses-20261114.json`.
- Actual public Wisconsin question: selected answer retained across Español → English → Español; grading displayed Spanish feedback/progress; reloading retained the answer and displayed corrected lesson title and explanation. Texas casework displayed the rewritten scenario and preserved the existing local written response.
- Not verified: every lesson/question end to end, every sentence's legal meaning, human review, mobile devices, paid AI responses, real learner duration or regulatory credit. None is claimed by this release.

## Production plan and recovery

Existing site only: `statecourse.com`, Netlify site `b514a8f8-782b-448c-8881-a914ee42c69b`. Baseline main `d3970e640915321baee85db68bbffa9cefdcab40`; published ready deploy `6ae4e0b780e42e75c6e05368`. The reviewed local branch descends from that main and preserves its subsequent auth/coach changes. Publish by ordinary fast-forward Git push to the existing main/CD path; do not create a preview site or change environment variables, database, payment, enrollment, certificate or credit controls. Git rejects an intervening non-fast-forward change.

Recovery is a new reviewed forward commit restoring affected public-practice files from the baseline and rebuilding; no reset, force push or historic Netlify deploy restoration. Existing credentials and service settings are untouched.

Live deploy and production browser acceptance will be recorded after publication. Until observed, they are not verified.
