# Spanish editorial correction pass — 2026-11-14

## Outcome: local corrections complete for the first queue; publication remains blocked

This pass does not establish that all semantic errors have been corrected. No deployment, push, merge, settings change, payment or regulatory activation was performed. The owner has authorized publication, so authorization is not the blocker.

## Changes

1,100 unique public-source strings received scoped corrections. Exact before/after text and correction scope are retained in `work-evidence/spanish-editorial-corrections-20261114.json`; corresponding exact-source entries are in `locales/es/free-practice/editorial-overrides.json` and the affected course companions.

- Corrected literal parcel/package and earnest-money translations only where the English did not introduce a competing package/bundle or cash sense. Mixed-sense worksheets were translated individually.
- Rewrote all 50 flagged void/voidable passages and preserved the original truth value of incorrect answer choices.
- Inspected the principal occurrences in all 341 flagged strings and distinguished loan capital, agency principal and a person acting as a transaction party. These scoped terminology corrections do not certify every sentence containing them. The standalone `Principal.` occurs only in the California mortgage-brokering interest calculation and is correctly translated `Capital.`.
- Restored client/customer distinctions in flagged passages, rewrote the Texas learning objective and corrected the Texas fiduciary passage that had lost the distinction between the license holder's interests and the principal's interests.
- Rewrote the five mixed-sense Texas worksheets without changing numeric anchors or calculation answer data.

The two remaining matches from the original scanner are false positives: their Spanish correctly uses `depósito de buena fe` for earnest money and `dinero en efectivo` for the separate English word cash. The extended scan intentionally retains them rather than suppressing validation.

## Expanded quality findings

A broader lexical scan finds 2,641 unique candidates (categories overlap): deed 250; trust 55; conveyance 391; executory 46; email verb/noun 45; listing 1,591; severance 8; consideration 301; plus the two documented cash false positives. These counts are review candidates, not individually confirmed errors. Concrete confirmed examples include `1.1 What a Deed Does` → `1.1 Lo que hace una acción` and `1. Deeds and valid conveyance` → `1. Acciones y transporte válido`. The listing and consideration groups require context because the English terms also have ordinary nontechnical meanings. Blind global replacement would introduce new errors.

The original queue was not an exhaustive semantic audit. The expanded queue also is not exhaustive. The machine draft needs a complete contextual rewrite/review, including sentence omissions, negation, legal roles and answer distinctions. A clean lexical scan would not prove those properties. Human bilingual review and qualified state SME review remain OPEN. No claim of linguistic, legal or instructional-duration approval is made.

## Verification

- `bash site/build.sh`: exit 0, including 5 protected-assessment checks.
- Focused locale/access/activity/boundary tests: 51 pass, 0 fail, 0 skipped; DOM tests used LinkeDOM 0.18.15.
- Python sentence tests: 3 pass.
- `git diff --check`: passed.
- All 30 draft companions still pass exact public-source completeness, source-file hashes, numeric/reference preservation and answer-choice distinctness checks.
- Full semantic review, all-course browser acceptance, learner duration and production Spanish acceptance: NOT VERIFIED.

## Next action

Rewrite and contextually review the remaining machine-translated material, starting with the expanded candidate queue, before running release acceptance and publishing. The current artifact must not be described as a reviewed Spanish course.
