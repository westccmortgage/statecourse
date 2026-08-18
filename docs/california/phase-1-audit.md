# California Phase 1 audit — student course product

**Audit date:** August 18, 2026
**Scope:** the three California 45-hour correspondence courses and the student reader that displays them.
**Method:** every finding below is reproduced by `node scripts/audit-california-content.mjs`. Nothing in this
document is asserted from reading alone; the auditor renders all 45 lessons through the student reader's own
Markdown pipeline and measures the result.

```
node scripts/audit-california-content.mjs            # print the report
node scripts/audit-california-content.mjs --strict   # exit 1 unless every gate passes
```

## Summary

Four of the six Phase 1 concerns recorded in the project handoff are already resolved in `main`. Two are
confirmed open, and one previously unrecorded defect was found in the assessment engine.

| Handoff item | Recorded status | Verified status |
| --- | --- | --- |
| Reader is too narrow; three-column layout | Open | **Resolved** in `2f96329` — single 940px textbook column, navigation and progress moved to drawers |
| Raw Markdown appears in rendered lessons | Open | **Resolved** — 0 leaks across all 45 lessons |
| Headings and body text start lowercase | Open | **Resolved** — the reader title-cases headings and sentence-cases prose at render time |
| Lesson content is generic or insufficient | Open | **Open — confirmed, and worse than described** (see below) |
| California DRE submission artifacts missing | Open | **Open — confirmed absent**; also blocked in the current environment |
| Scored assessments | Not recorded | **Open — newly found defect** |

The handoff's instruction to rebuild the reader and fix rendering and capitalization has therefore already been
carried out. The remaining Phase 1 work is the lesson prose and the assessments.

## Finding 1 — lesson prose is one template stamped 2,836 times

The three courses contain 270,191 words, which reads as a substantial body of instruction. It is not. Masking
each lesson's topic names and comparing the body paragraphs shows:

| Measure | Value |
| --- | --- |
| Body paragraphs across 45 lessons | 2,836 |
| **Distinct paragraphs** | **14** |
| Share of paragraphs that repeat a template | 100.0% |

Six of those fourteen templates are each reused 270 times — once per topic, per lesson, per course. The only
thing that changes between two lessons is the topic name substituted into the sentence. Comparing Practice
lesson 02 against lesson 03 shows the mechanism directly:

> …the essential elements of **business planning** are the parties, property or obligation involved…
> …the essential elements of **seller and buyer agency** are the parties, property or obligation involved…

The consequence is that no California law is actually taught anywhere in the three courses. A student reading
all 45 lessons encounters no statute, no regulation, no form, no deadline, no worked calculation, and no
transaction-specific instruction — only a generic professional-conduct essay repeated under 270 headings.

This matters beyond content quality. The DRE course-approval standard for a 45-hour statutory course expects
instructional material of a length comparable to a college textbook, and reviewers read the material itself.
Material that repeats one essay under every heading would not survive that review, and enrolled students would
not be prepared for the salesperson examination.

**What is sound and should be kept:** the course outlines. The 15 subject titles in each course
(`config/california-course-engine.mjs`) form a correct and well-sequenced California pre-license outline, as do
the per-lesson objectives, the 180-minute timed sequence, and the six-topic lesson structure. The scaffolding is
right; only the prose inside it is placeholder.

## Finding 2 — all 135 scored items are the same question

`getCaliforniaAssessment()` in `config/california-course-engine.mjs` builds every applied exercise, engagement
check, and remediation item in all three courses from one fixed four-item answer list, rotated into a different
order per lesson.

| Measure | Value |
| --- | --- |
| Scored items across the three courses | 135 |
| Distinct prompts | 135 |
| **Distinct answer-choice sets** | **1** |
| **Distinct correct answers** | **1** |
| Distinct rationales | 3 |

The correct answer is always the same sentence — *"Verify the governing facts and current authority, document
the analysis, and escalate questions beyond the licensee's scope."* — and the three distractors are the same
three implausible options every time. A student who notices this after one lesson can answer every remaining
scored item in all three courses without reading anything.

Two further inconsistencies follow from this:

- Each lesson's timed sequence table promises a *"Lesson assessment — five scored items"*, but the engine
  serves exactly one item per kind. The published lesson plan and the running system disagree.
- The lesson text states an 80% lesson mastery threshold. With a single item per check, the only achievable
  scores are 0% and 100%, so the threshold cannot function as written.

## Finding 3 — the DRE submission package does not exist

Confirmed by search across the full repository: there is no reference anywhere to RE 306, RE 336, a General
Information Page, a proctor package, or a student/instructor examination version, and no PDF or downloadable
application artifact of any kind is committed. The handoff's statement that these were never completed is
accurate and should not be reported otherwise.

**New constraint:** this build environment cannot reach the regulator. Both `dre.ca.gov` and
`leginfo.legislature.ca.gov` are blocked by the network egress proxy, for direct requests and for the fetch
tooling alike. Because the project's controlling rule is that official current regulator sources govern and that
no requirement may be invented, the RE 306 and RE 336 packages cannot be built here without fabricating form
structure and filing requirements. Phase 2 needs either an environment with egress to `dre.ca.gov` allowed, or
the official forms and the current Course Provider Handbook supplied directly into the repository.

## Finding 4 — what is verified working

- `bash site/build.sh` succeeds, and the generated `dist` contains all five California routes
  (`/real-estate/california/`, `/pre-license/`, and the three course pages). California pages are produced by
  `scripts/generate-national-platform.mjs` at build time rather than committed under `public/`, which is why the
  California directories are absent from the source tree — the routes themselves are not broken.
- The reader's Markdown pipeline handles headings, tables, metadata pairs, lists, links, bold, and emphasis
  cleanly, and normalizes capitalization at render time. It did **not** handle ordered lists, block quotes,
  headings below level 3, thematic breaks, or code spans: a numbered procedure collapsed into one run-on
  paragraph, and quoted statutory text printed a literal `>` to the student. None of those constructs occur in
  today's placeholder lessons, so nothing was visibly broken, but all of them are unavoidable in real
  instruction. This was fixed as part of this audit (see below) so the gap cannot surface mid-rebuild.
- No approval claim, price, or enrollment path is exposed for California. `enrollment_enabled` is `false`,
  `approval_status` is `In Development`, and `approval_number` is `null` for all three courses.

## Finding 5 — the build overwrites the hand-built state course pages (not California, but live)

Noticed while verifying the California routes. `scripts/generate-national-platform.mjs` writes its generated
pages into `public/statecourse/` — the source tree — and `site/build.sh` runs it before copying `public/` into
`dist/`. For the five states that have a hand-authored course page committed in git, the generator overwrites
that page on every build:

| Committed page | Size in git | Size after `bash site/build.sh` |
| --- | --- | --- |
| `real-estate/virginia/pre-license/principles-and-practices/index.html` | 11,914 bytes | 5,702 bytes |

Maine, Wisconsin, Oklahoma, and both Missouri pages are overwritten the same way. Because Netlify builds from a
clean checkout and runs the same script, **production serves the generated stub, not the committed page** — the
richer hand-built content in the repository is never deployed. Running a local build also dirties the working
tree with roughly sixty untracked generated directories, which is why the tree looks modified after any build.

This is a product decision rather than a mechanical bug: either the generator should not emit pages that already
exist in source, or the hand-built pages should be deleted and their content folded into the generator. It is
recorded here rather than fixed because choosing between those two is not a California Phase 1 call. It should
be resolved before any further state pages are hand-authored, and it does not currently affect California, whose
pages have no committed hand-built version.

## Recommended order of work

1. ~~**Extend the reader's Markdown pipeline**~~ — **done in this change.** Ordered lists render as `<ol>`,
   block quotes as `<blockquote>`, headings to level 6, thematic breaks as `<hr>`, and backticked form names as
   `<code>`, each with matching textbook styling. Code spans are escaped before rendering, so a form name cannot
   smuggle markup into the lesson body. Covered by `tests/california-content-quality.test.mjs`.
2. **Rebuild the assessments** into genuine per-lesson question banks with distinct items, real distractors,
   per-item rationales, and enough items to make the stated five-item check and 80% threshold true.
3. **Rebuild the lesson prose**, course by course, against the existing outlines. This is the large item and the
   one that determines whether California can be submitted at all.
4. **Phase 2 (submission package)** once regulator source access is available.

## Gate status

`scripts/audit-california-content.mjs` encodes these as gates. Render integrity and typography pass today and
are protected by `tests/california-content-quality.test.mjs`. Substance and assessment integrity fail by design
until items 2 and 3 above are complete; `--strict` is the definition-of-done check for the rebuild and should
not be added to CI until it passes.
