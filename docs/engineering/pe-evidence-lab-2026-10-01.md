# PE03 document evidence lab

October 1, 2026. Public preview candidate for the existing draft PR23, based on `7c2d6ecc0159e455b16b5ad9f02dc7ad46a8dbe9`. Main remains `84c38a6d7cea4644cbf1cab528a75c52375d0aa7` at preparation. Production publication is not authorized by this change.

## Learner result

PE03 now has an Evidence lab mode in the existing free-practice page. A fictional borrower file supplies 10 document excerpts across five reading releases. Learners choose the received-page or missing-page path, inspect available records, complete 16 evidence tasks, and revise calculations after a new debt appears. Path R has 33 numeric inputs and 16 written self-reviews; path U has 29 numeric inputs and 16 written self-reviews. Shared calculations account for the difference from the 36 distinct authored numeric expectations.

Source availability follows the selected path and release. Missing-page path U never receives the E06 document. Its numeric tasks do not require that document. Each path saves separate responses, and submitted versions remain available when the learner revises an answer. These local browser records are formative practice, not instructor decisions, regulatory records, verified identity or earned time. Releases remain freely navigable reading steps, not qualifying-course progression gates.

All eight original lesson files, 100 questions, 33 cases and 151 case tasks remain unchanged. The supplement is not a ninth module. Adding it retains the existing quiz/case progress key when the core content is unchanged; the supplemental content has its own revision. Every explicit landing Read link now selects read mode even when a browser remembers casework. The lab is reachable directly from PE03's landing card and its study-mode controls.

## Source and projection boundary

The public Markdown and JSON are unchanged copies of independently reviewed version `2026-10-01.4`:

- Markdown SHA-256: `8c6cd1f3c9050defa01665030f613429b3a08aa09da2ca9edad53ad839d5d370`
- JSON SHA-256: `86e99f73082309c748b67ac00df47edc0cc3a2f623f7f397ef8ede8d2ac2a3bb`

Only these explicit supplemental files are loaded. The adapter validates inventories, public/noncredit metadata, branch and stage sources, numeric fields, written rubrics and HTTPS citations before any output write. It projects tasks through the existing public case checker. No instructor guide, protected assessment loader or aggregate curriculum directory is imported. The public numeric explanations are intentionally formative.

Current primary sources checked October 1: Fannie Mae B3-3.2-01 documentation, B3-3.3-01 base income, B3-4.2-02 depository accounts, and CFPB Regulation Z 1026.43. The lab distinguishes those scoped concepts from fictional accepted inputs. Review independently recomputed all 36 expected results and 25 additional chronology/reconciliation checks.

## Verification

The actual client DOM flow exercises original progress restoration, Read-mode override, both lab paths, staged document availability, numeric/written feedback, separate saved responses, changed-answer history, returning to the lab and switching away. This is not browser geometry or rendered-preview acceptance.

Both build paths complete during `npm test`. The aggregate reaches 2,380 Netlify tests: 2,296 pass, 57 fail and 27 skip, plus five passing Sites artifact checks. The 57 failure identities match the prior eight-module checkpoint. Full CI is not green: the known failures are 38 assertions previously reproduced against unchanged main and 19 unavailable-PDF fixture failures. No authentication mock or baseline test was weakened. Exact current focused, privacy, normalized-failure and rendered-preview results are retained with the release evidence and PR readback.

## Remaining qualifying OIL work

The eight-module blueprint covers 25 unit concepts and proposes 1,000 minutes, divided into 150 federal law, 150 ethics, 100 nontraditional and 600 elective minutes. Neither that allocation nor this lab establishes actual duration or a qualifying 20-hour course.

The following remain separate implementation or acceptance gates:

1. Scheduled cohort records, published start/end/time-zone details and tested module progression. The current lab's five reading releases do not implement those gates.
2. Genuine student-to-student and instructor-to-student discussion throughout the course, assigned qualified instructors and backup, substantive feedback, learner revisions and observable retained records. Automatic feedback cannot supply these participants or decisions.
3. An approved identity approach, ROCS presentation and retained acceptance, authenticated learner/offering association and tested exception handling. Existing CE or OSS identity assumptions cannot automatically establish PE/OIL compliance.
4. Category-level engaged-time evidence and representative timing validation. NMLS section 4.3 requires a ten-student sample and fastest-ten-percent analysis; no timer or word count can substitute for it.
5. A separately protected, reviewed course final and retake controls, released only after the actual completion gates. Public practice questions are not that final.
6. Human SME/accessibility acceptance, operational records/retrieval tests, actual delivery evaluation and reviewer disposition of PE/OIL provider and course scope.

Further engineering can prepare a cohort/participation data contract, failure-mode tests, instructor/student interfaces, protected-assessment drafts, timing-study instrumentation and acceptance scripts without production changes. Actual staffing, learner sampling, approved identity/policy choices and regulatory approval require responsible humans and external review; they cannot honestly be marked complete by additional public lessons.

Official requirements: [OIL setup](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_oil_genCourseSetup.html), [scheduling](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_OIL_courseSched.html), [design and timing](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_OIL_courseDesign.html), [interaction](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_OILinteraction.html), [technical evaluation](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_OILtechEvalFinalCourseApproval.html). Checked in the independent October 1 coverage audit.

## Release scope

Only the existing private PR23 branch and intended public noncredit preview are in scope. This patch makes no backend, database, credential, owner-OAuth, CE, payment, Netlify configuration, certificate or credit changes. No held artifact-reuse probe is part of the release. Production remains held on exact preservation of the manual owner-OAuth deployment. Publication, exact-head preview and browser results must be read back before describing this candidate as online.
