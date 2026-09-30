# PE03 and PE04: local public-practice expansion

September 30, 2026. Status: four-module expansion reviewed and authorized for the same public PR23 preview. Production remains held. The previous two-module preview head was `6a7aab9a9ffae03e441975e76281511cbefbef1d`; the exact updated head and deployment acceptance are recorded in PR23 and the release archive.

## Result

The same `national-safe-pe-foundations` collection now supports four explicit student lesson files, 40 questions, 16 activities and 70 tasks locally. PE03 adds Application and Borrower Qualification; PE04 adds Mortgage Programs, Closing and Servicing. The landing adds both lesson links and states that four modules are available while the full 20-hour course remains under construction. Practice stays free before, during and after paid enrollment, without account or payment requirements.

The 24 new questions retain all 96 authored option-level explanations. The browser displays feedback for the selected underlying choice, including after deterministic answer shuffling. Existing questions retain their generic explanation. The new six cases provide 13 written process self-reviews and 18 numerical checks, independently recomputed from public lesson examples. Written work is not automatically graded or presented as instructor feedback. Proposed genuine peer/instructor interaction remains a future OIL requirement; current prompts are optional self-review or offline discussion.

PE03 and PE04 each retain 150 proposed, unvalidated elective minutes. The candidate is not NMLS approved, awards no credit, hours or certificate, and is not the complete 20-hour course. It creates no enrollment, regulatory progress, instructor participation or completion report.

## Public provenance and projection

Public source bundle: Library `libfile_c5cff8209284819182f0ae5312670983`, September 30, 2026. Student manuscripts: PE03 `libfile_a97aff72e2548191a9567cb35ee030f5`, PE04 `libfile_044d18a609088191b39a8f8612b10c04`.

The bundle contains exactly six public files. Both original question JSON files are copied byte-for-byte into `config/pe-public-practice/`; source URLs are resolved from the student source registers. Fictional cases without an assigned external source get an explicit lesson-case note instead of an invented citation. The student lessons preserve substantive teaching, worked examples, all six learner cases, glossaries and source URLs. Changes concern current delivery/status framing and the six proposed dialogue prompts.

Only PE03/PE04 public banks are imported by the new adapter. It validates public-formative status, no credit/final-exam status, choice IDs, keys, feedback, references and module IDs. The existing PE builder has an explicit four-file allowlist, validates all inputs before writes, and rejects incomplete/sparse choice feedback. Private instructor notes, instructor source bundle, protected exams and aggregate NMLS trees are excluded. Public formative answers remain deliberately visible; they are not final-assessment material.

PE01/PE02 question/case data are unchanged. All 30 existing real-estate sample records and 314 lesson/course artifacts remain byte-identical to the reviewed two-module build. No course catalog, CE identity/approval, backend, OAuth, database, environment, credential, commerce or completion code changes are included.

## Verification

- 87 focused/regression Node tests passed; sparse feedback/choice failures are tested before writes
- Two isolated actual-client DOM tests passed, including PE03/PE04 answer-specific wrong/correct feedback, retries, first-attempt accounting, blank casework validation, written/numeric submissions, interrupted course switching and module-04 history restoration
- `bash site/build.sh` passed
- Unchanged privacy verifier: 610 files, 600 text files, 187 protected identities/stems, zero violations
- Targeted ESLint: zero errors; one pre-existing unused `registerUrl` warning
- Independent review checked all 44 source references, 96 option associations and 18 numerical answers; the sparse-array validation finding was corrected

The full repository `npm test` rerun reached 2,372 tests: 2,288 passed, 57 failed and 27 skipped. Both Sites and Netlify builds/privacy gates passed. All 57 failing test identities match the prior exact-head verification: 38 reproduced baseline assertions and 19 unavailable-PDF fixture failures; there are no new failing identities. Skips remain 24 optional PGlite SQL tests and three optional DOM tests. Full CI is not green. The complete logs and comparison are preserved in the review artifact.

No rendered four-module browser acceptance has occurred. Local browser restrictions remain respected; the supported remote preview can be updated only after review. Phone geometry remains unverified through the current browser API.

## Release boundary

Independent review and the parent release review accepted this bounded expansion for the existing PR23 branch and public preview. Do not create a competing platform or implementation. Production publication additionally requires exact preservation of live manual deploy `6abbf3242b9d9e605eda349e`, its owner-OAuth overlay, all function/Edge descriptors and the existing sign-in asset. Do not merge main into auto-deployment, rebuild authentication, change credentials, or include the separate unfinished nonce repair as part of this content expansion.

The full 20-hour curriculum, genuine instructor/peer delivery, learner timing, human SME/accessibility acceptance and applicable approval work remain open. Free practice for every future course remains an ongoing product requirement; this implementation does not claim unpublished courses are already available.
