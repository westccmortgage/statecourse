# Post-audit repair verification — 6 September 2026
## Implemented
- Both Sites URL namespaces route to the packaged public pages and assets. Operational account/payment pages stay on the canonical backend.
- All 30 catalog course records have an explicit practice source and a course-specific entry point.
- 266 lessons, 2,948 nonempty reading sections, 2,804 formative questions; interactive choices, explanations, retries, first-attempt scores, lesson resets and local-device progress.
- Damaged local storage, stale fetch races and revision caching are handled.
- Three original Texas focused practice collections: 12 lessons and 72 sourced questions. They are explicitly not finished 30-hour qualifying curricula.
- Arizona and Missouri date-only eligibility arithmetic is timezone-independent; invalid/future dates and out-of-sequence Missouri records fail closed.
- Texas catalog program hierarchy repaired; New Hampshire/North Carolina official links corrected.
- California formative/final duplication repaired, with an executable guard. Three generic public prompt overlaps with protected finals were rewritten.
- California document build uses a verified Python runtime and deterministic browser-free PDF rendering. Traceability checks do not mutate tracked files.

## Verified before publication
- `npm test`: 1,201/1,201 repository tests passed, no skips, on the repaired checkout.
- Actual production JavaScript exercised in jsdom: 30 courses, every lesson/section, all 11,216 answer-choice submissions, 2,804 unanswered submissions and 2,804 fresh all-correct submissions; 266 lesson resets. Six full-flow/edge-case tests passed.
- Independent public-bank scan: no normalized prompt collisions with the inspected protected configuration and Markdown final banks after repair.
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
- Additional inspection found 600 protected final-bank placeholders in Wisconsin, Oklahoma and Missouri. They are not imported into public practice and cannot be treated as usable final examinations or submission-ready assessment. They need independent substantive authoring before those courses' final-exam readiness may be claimed.
- Existing questions' complete factual/legal accuracy has not been independently revalidated statute by statute; structural tests do not establish that.
- The new California pagination must be reconciled with the professor's reviewed copy before filing. No signature, certification or approval is implied.

## Correction to the previous audit
The earlier 15 California failures were 9 missing-pypdf environment failures, 5 absent generated-PDF failures and 1 dependent traceability failure—not 15 wrong official forms. The existing filled official forms pass unchanged under the correct runtime.
