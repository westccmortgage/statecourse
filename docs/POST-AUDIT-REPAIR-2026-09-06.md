# Post-audit repair verification — 6 September 2026
## Implemented
- Both Sites URL namespaces route to the packaged public pages and assets. Operational account/payment pages stay on the canonical backend.
- All 30 catalog course records have an explicit practice source and a course-specific entry point.
- 266 lessons, 2,956 nonempty reading sections, 2,804 formative questions; interactive choices, explanations, retries, first-attempt scores, lesson resets and local-device progress.
- Damaged local storage, stale fetch races and revision caching are handled.
- Three original Texas focused practice collections: 12 lessons and 72 sourced questions. They are explicitly not finished 30-hour qualifying curricula.
- Arizona and Missouri date-only eligibility arithmetic is timezone-independent; invalid/future dates and out-of-sequence Missouri records fail closed.
- Texas catalog program hierarchy repaired; New Hampshire/North Carolina official links corrected.
- California formative/final duplication repaired, with an executable guard. Three generic public prompt overlaps with protected finals were rewritten.
- California document build uses a verified Python runtime and deterministic browser-free PDF rendering. Traceability checks do not mutate tracked files.
- 600 protected final placeholders replaced: Missouri 200, Wisconsin 100, Oklahoma 300. Every new stem, option set, key and rationale received independent agent cross-review; calculations were recomputed. This is not human SME sign-off or psychometric validation.
- Missouri clause-specific contract deadlines and FHA exemption distinctions corrected; Wisconsin current disclosure, trust-account, records, advertising and form-editing rules corrected; Oklahoma assessment teaching supplements are included in public lessons, not stranded in a private appendix.
- 98 distractors revised after independent item-writing review (23 Missouri, 75 Oklahoma); new executable guards reject excessive longest-correct-answer cues. IDs, correct answers and objectives are preserved by these distractor-only edits.
- Protected finals have deterministic renderers, content hashes and coverage checks. The shared generator dispatches to authored banks and refuses missing or unexpected banks instead of recreating placeholders.
- Broken HUD Fair Housing Act PDF link replaced with the verified 2024 U.S. Code chapter on GovInfo; edition is explicit. The root favicon now matches the StateCourse asset.

## Verified before publication
- Final complete `npm test`: 1,230/1,230 passed, zero failures or skips. Live source identities are recorded in the separately delivered post-repair audit; do not infer publication from a local build.
- Actual production JavaScript exercised in jsdom: 30 courses, every lesson/section, all 11,216 answer-choice submissions, 2,804 unanswered submissions and 2,804 fresh all-correct submissions; 266 lesson resets. Six full-flow/edge-case tests passed.
- Independent public-bank scan: no public practice question equals a normalized protected prompt. Two generic instructional text matches in published reading/rationale text were manually reviewed; neither exposes an exam question with its answer key.
- Three new Texas banks: all 72 keys independently reviewed against cited TREC/CFPB primary sources; one pinpoint source reference corrected.
- California document subset: 67/67 tests, 27,002/27,002 HTML text blocks retained in PDFs, 35 sampled pages visually checked.
- Current PDF pagination: Principles 524, Practice 444, Mortgage 434. See `california/print/current-build.json` for exact identities. The separate 458-page professor archive is unchanged.

Live deployment checks and final source SHA are recorded in the separately delivered post-repair audit; they must not be inferred from these local checks.

## Reproduce
```sh
npm run prepare:california
npm test
# npm test finishes with the Netlify artifact. Rebuild Sites before packaging:
npm run build
```
PDF preparation requires Python with pypdf/reportlab and DejaVu fonts. The helper selects the bundled runtime when available, or accepts STATECOURSE_PYTHON_BIN and STATECOURSE_FONT_DIR.

## Important remaining boundaries
This is a working **non-credit practice** repair, not a regulatory approval or a complete scholarly/legal sign-off of every course.
- All regulated enrollment, payment and credit gates remain closed.
- Three Texas qualifying curricula remain incomplete; their new public materials are focused practice collections.
- The 600 newly authored protected finals remain non-public and not authorized for administration. Subject-matter-expert sign-off, psychometric validation and regulator approval have not been obtained by this repair.
- Existing questions' complete factual/legal accuracy has not been independently revalidated statute by statute; structural tests do not establish that.
- The new California pagination must be reconciled with the professor's reviewed copy before filing. No signature, certification or approval is implied.

## Correction to the previous audit
The earlier 15 California failures were 9 missing-pypdf environment failures, 5 absent generated-PDF failures and 1 dependent traceability failure—not 15 wrong official forms. The existing filled official forms pass unchanged under the correct runtime.
