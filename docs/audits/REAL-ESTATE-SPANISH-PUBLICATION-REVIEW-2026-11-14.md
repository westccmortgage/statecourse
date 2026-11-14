# Spanish Real Estate publication review — 2026-11-14

## Decision: HOLD PUBLICATION

The owner requested publication. Authorization is present; translation quality is the blocker. No push, merge, deployment, settings change, payment or regulatory activation was performed.

## Integration

Local branch `work/real-estate-es-publish-20261114` integrates the Spanish draft onto actual production main `d3970e640915321baee85db68bbffa9cefdcab40`. Netlify reports ready production deploy `6ae4e0b780e42e75c6e05368` for that same commit. Existing coach, sign-in and backend changes are preserved. The original user workspace was not modified.

Comparison with the newly generated public English catalog found 19 new strings in three Texas Finance lessons. Those were translated directly, with current source hashes retained. Another 23 exact-source editorial corrections address selected principal, agency, client/customer, void/voidable, earnest-money and parcel errors. All human linguistic, state SME and learner reviews remain OPEN.

## Quality findings

A targeted corpus scan produces 1,098 unique candidates across 30 courses: 292 earnest-money literal/cash translations, 341 principal/director translations, 409 parcel/package translations, 7 collapsed client/customer distinctions and 50 void/empty translations (categories can overlap). These are candidates requiring contextual review, not 1,098 independently confirmed errors. The scan is deliberately limited and cannot establish semantic completeness.

Source-target samples were inspected from all 14 states. Confirmed examples include `The Customer Who Thinks They Are a Client` rendered `El cliente que se cree cliente`, and Texas agency text losing the relationship between principal and agent. A Chrome localhost inspection also shows a malformed email-action sentence, `contract for deed` rendered as `contrato por hecho`, and incorrect executory-performance terminology in Texas Contracts casework. The draft notice does not cure these meaning errors.

The complete candidate queue is `work-evidence/spanish-editorial-review-20261114.json`. Reproduce with `node scripts/audit-free-practice-spanish.mjs OUTPUT_JSON`. The queue is not a legal review or an exhaustive audit, and must not be treated as a release approval after simple lexical replacement.

## Verification

- `bash site/build.sh`: passed, including 5 protected-assessment checks.
- 51 focused locale, access, activities and practice-boundary Node tests: passed; zero failures/skips. DOM checks used LinkeDOM 0.18.15 from the existing temporary test installation.
- 3 Python sentence-coverage tests: passed.
- 30 source-bound Spanish companions remain machine-draft complete against current English sources (111,890 unique source strings).
- Chrome localhost observed Spanish interface, all 14 state options and Texas Contracts casework, including the quality defects above. This was not a complete fresh end-to-end run of all courses.
- Full bilingual semantic review, state-specific SME review, real learner duration, live Spanish production acceptance and all-course end-to-end verification: NOT VERIFIED / OPEN.

## Next action

Complete a contextual bilingual editorial pass over the candidate queue and the remaining lesson/question corpus, retaining English legal distinctions, then repeat acceptance checks before publication. Do not publish this candidate as reviewed learning material.
