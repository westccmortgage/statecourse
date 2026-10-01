# PE05 and PE06: local public-practice expansion

September 30, 2026. Status: local implementation and independent source review complete; the same PR23 public preview update is authorized. PR23 remains at the four-module preview revision `42871e88cea8bd1c25ee7b0f9f420d748527ed56`. The source checkpoint below precedes publication. Exact updated-head/deploy and rendered acceptance are retained in PR23 and the release archive. Production merge, independent draft deployment and authentication changes remain prohibited.

## Result and boundaries

The existing `national-safe-pe-foundations` collection expands locally to six explicit lessons, 76 formative questions, 25 activities and 99 tasks. PE05 covers Federal Mortgage Law; PE06 covers Ethics and Consumer Protection. Their 36 new questions retain all 144 authored option-level explanations. Nine new cases contain 20 written self-review tasks and nine numeric checks. The lesson reader, ongoing free practice, answer shuffling, retry accounting and casework use the existing implementation.

Public practice remains free before, during and after paid enrollment, without an account or checkout. The landing and collection clearly state that six modules are available in this candidate and that the full 20-hour course is still in development. The candidate is not NMLS approved and grants no instructional hours, regulatory credit, certificate or completion report. Each new module's 150 proposed minutes remains unvalidated. Genuine OIL instructor/peer delivery is still future work; the public lessons describe current written activities as optional self-review or discussion, without claiming implemented human feedback.

No private instructor source, protected exam, actual borrower data or credentials were used. Public formative keys and explanations are intentionally available. No backend, database, authentication, OAuth, environment, payment, CE identity/approval, enrollment, study-time or completion authority changes are included. PE07/PE08 are not allowlisted or represented as available.

## Public provenance

Reviewed source: Library `libfile_71d945854bd481918cfb637730420b0d`, `StateCourse_PE05_PE06_Public_Lessons_Practice_Source_2026-09-30.zip`, 45,694 bytes, SHA-256 `171100979bc98f0f2aff3b4983c6a7e67578d9e010a5791aad211cb72da13e75`. Its six public members are PE05/PE06 student Markdown, PE05/PE06 practice JSON, the public README and public manifest. Student DOCX identities are PE05 `libfile_190c896325ec8191b4f627fb95608bdc` and PE06 `libfile_11732ec0db4081919c0e68867c192a01`.

Both JSON banks are copied byte-for-byte. All 55 source identifiers resolve to the corresponding public student source registers. The lessons preserve teaching, worked examples, cases, glossary and citations; only current delivery/status framing and proposed interaction prompts are adapted. Scope distinctions, including the July 2026 Regulation B wording, remain intact. Independent review checked those statements against the published final rule and current CFPB sections 1002.4 and 1002.6; this is not a comprehensive legal opinion or human SME acceptance.

The builder explicitly permits module-01 through module-06 only. Public-bank normalization enforces module identity, item count, public/noncredit status, choice IDs, keys, all four feedback explanations and source resolution. Only seven specifically reviewed fictional PE03 cases may lack external citations. A legal question cannot be relabeled as fictional by removing its sources. PE-specific case validation rejects sparse or invalid scenarios, tasks, facts, rubrics, choices and source arrays before any output writes. The generic real-estate projection is unchanged.

## Verification

- 89 focused/regression Node tests and two isolated actual-client DOM tests passed
- Independent review checked all 36 new quiz keys, 144 selected-choice feedback associations, 55 source references and nine numeric answers; its 12 malformed-input probes reject before writes
- All first four lesson descriptors, 40 question payloads and 16 activity payloads remain identical to the published preview; all 30 existing real-estate records and 314 artifacts are unchanged
- Both Sites and Netlify builds passed within the aggregate command
- The unchanged public-artifact verifier passed: 612 files, 602 text files, 187 protected identities/stems, zero violations
- Targeted ESLint reports zero errors and one pre-existing unused `registerUrl` warning

The final `npm test` reached 2,374 tests: 2,290 passed, 57 failed and 27 skipped. All 57 failure identities and normalized error reports match the prior four-module run. The accounted failures remain 38 assertions reproduced against exact unchanged main `84c38a6d7cea4644cbf1cab528a75c52375d0aa7` and 19 unavailable-PDF fixture failures. Skips remain 24 optional PGlite SQL tests and three optional DOM tests. Full CI is not green; no auth mock or baseline test was weakened.

The six-module candidate has no rendered-browser or deployment acceptance yet. The four-module preview is the preceding public artifact; six-module rendered acceptance must be recorded for the updated exact head. The isolated DOM tests exercise all six lesson deep links, selected-option feedback, empty/incorrect/correct submissions, retries, persistence, casework, course switching and history restoration; they do not prove rendered geometry. Phone geometry remains unverified.

## Release hold and remaining work

Review has authorized publication only to the existing PR23 branch/public preview. Production remains held on exact preservation of manual deployment `6abbf3242b9d9e605eda349e`, its owner-OAuth overlay, 37 function descriptors, the Edge artifact/routing and existing sign-in asset. The partial release metadata and separate held digest-reuse request do not establish completed routing/authentication parity. No probe POST, upload or production action was performed by this implementation task.

The remaining full-course content, genuine instructor/peer delivery, learner timing, human SME/accessibility acceptance and applicable approvals remain open. Continuing free practice for every course is an ongoing requirement; this slice does not claim unpublished courses are already available.

## Rendered disclosure correction

The first six-module preview at `53e3138d14b46c6d6bc1d892b2d2a8c9a1820529` rendered PE05/PE06 lessons, explained questions, casework and saved progress. Review found that PE01/PE02 introductions still described a two-module collection. Their two status sentences now direct readers to the current lesson selector, preserving every instructional paragraph and all noncredit/full-course warnings. This intentionally changes the first two lesson content hashes; their titles/IDs/paths, all prior questions and all activities remain unchanged. The existing substantive-module test rejects the stale introduction. Exact follow-up commit, repeated checks and rendered readback are preserved in the release archive.

The same rendered review found that retry could focus a question behind the sticky header. Question navigation now explicitly scrolls the focused legend below the header using the existing 104px content offset. A DOM interaction assertion verifies retry focus/scroll targeting; supported remote-browser geometry must confirm the actual position. No question, answer, attempt-count or persistence rule changes.
