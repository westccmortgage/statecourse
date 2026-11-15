# Spanish parallel bilingual review — 2026-11-14

Owner authorized parallel reviewers, continued correction, and publication to the existing free-practice site. Baseline: `173e07f4ec916e7a0e19a8b47a3bd7aa27cbad5d`; branch `codex/real-estate-es-semantic-review-20261114`.

## Checkpoint scope

1,454 course entries (1,450 distinct English source strings) corrected across 14 courses. Reviewers sequentially read 932 public question blocks, including all choices and explanations, plus 102 lesson sections. These are coverage counts, not a certification that all errors have been eliminated. All 30 full-course semantic signoffs, human linguistic review, qualified state SME review and learner-duration validation remain OPEN.

- West: AZ Contract Writing, both lessons/16 sections and all 22 questions; Alaska all 88 questions and 73 sections (modules 01–05, module 06 sections 0–6). Other assigned courses unread.
- Central: CO Current Issues 33, Trust 44, Closings 55, Contracts 55, Law 55, Practical Applications first 55 questions; Current Issues module 01 first section. Other lessons and MO/OK/PA unread.
- Texas: Finance 148, Principles I 64, Agency 116, Principles II first 32 questions. Lessons, activities, remaining questions and other courses OPEN.
- Root: WA Practices all 66 questions and module 01's 12 sections; Maine all 99 questions. Other root-assigned courses and remaining lessons OPEN.

Changes restore legal actors, negations, written consent, waiver, compensation direction, title/ownership terminology, trustor/trustee distinction, mortgage and appraisal vocabulary, proration entries, wire instructions and disability terminology. Incorrect answer options retain their source meaning. No English source, correct-answer key, grading, private assessment, source revision or human-review flag changed.

Evidence: `work-evidence/spanish-full-review-{west,central,texas,root,root-me}.json` records actual reviewer coverage and edits. `work-evidence/spanish-parallel-review-checkpoint-20261114.json` consolidates exact before/after and SHA-256 against baseline, and verifies unchanged metadata and source keys/order for all 30 companions. Existing global normalization overrides were not applied across courses: authored course companions remain authoritative for this context-specific review.

## Verification

`bash site/build.sh` passed including five protected-assessment tests and exact numeric/reference/source validation. All 51 locale/access/activity/boundary tests and three sentence tests passed. Actual local Chrome displayed the rewritten WA Practices scenario and corrected non-waivable-duty choice in Spanish. Tests validate exercised behavior, not exhaustive semantic accuracy.

## Source issues still OPEN

- Alaska module 06 section 6.1: English bank reconciliation subtracts deposits in transit and adds outstanding checks; bank-side reconciliation normally does the reverse. Source/SME correction OPEN.
- Maine question 60: English option gives the correct $80,000 down payment, but says a $15,000 appraisal gap is added to $68,000 planned. The actual increase is $12,000; no Spanish-only numeric alteration was made.
- TX Principles II T01Q1R: English calculator explanation pairs 194 with subtraction of .06; source arithmetic needs correction.
- TX Agency LOA-T03U4-Q: English explanation appears to invert the quoted nondisclosure condition.
- TX Principles I FIRPTA explanation needs SME review of exceptions. Other courses explicitly retain unreviewed-source caveats.

## Publication and recovery

Existing production: statecourse.com, Netlify site `b514a8f8-782b-448c-8881-a914ee42c69b`; prior ready deploy `6af8e86b93c340525ddacc62` at baseline above. Publish through existing Git CD, with no settings, credentials, database, infrastructure, paid API, commerce or regulated enrollment changes. Recovery is a new forward commit restoring affected files from this baseline, rebuild and publish; no history rewrite or historical-deploy restoration.

Live acceptance pending this checkpoint deployment. Full review continues after integration. Every lesson/question rendered end to end, exhaustive semantic accuracy, qualified SME acceptance, mobile and learner validation remain unverified.

## Observed checkpoint production acceptance

Commit `174c012091b2130928c702b79a51da975066a0b6`, Netlify deploy `6af8f5cfc6143a04fda0ed5c`, ready and published `2026-11-14T23:59:51.038Z`. Public HTTPS SHA-256 matched all 30 generated Spanish companions; 14 state Spanish entry links verified. Actual Chrome opened every course in Spanish with ready translation and visible reader; corrected WA scenario/choice observed on production. Evidence: `spanish-parallel-production-http-20261114.json`, `spanish-parallel-production-browser-20261114.json`, `spanish-parallel-production-20261114.png` in work-evidence. The optional AI coach still showed a stale Alaska concept on WA after course changes; no paid call or consent was submitted, and coach correctness remains unverified. Reviewers resumed further edits after the checkpoint; uncommitted corrections are not included in this acceptance.
