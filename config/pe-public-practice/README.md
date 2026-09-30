# Public PE03–PE06 formative inputs

PE03.json and PE04.json are byte-for-byte copies of the reviewed public source bundle dated September 30, 2026 (Library libfile_c5cff8209284819182f0ae5312670983). Each contains twelve original, repeatable, noncredit questions and four feedback explanations per question. Answers and explanations are intentionally public practice material, never protected final-assessment items.

sources.json maps only source identifiers explicitly listed in the corresponding public student manuscripts. Its URLs and reference text come from those source registers. Fictional cases with no assigned external source receive an explicit lesson-case note; no authority is invented for them.

The build imports these two banks through config/pe-application-practice.mjs, validates their public/noncredit boundary, and projects only the question, choices, feedback and referenced sources. It does not copy this directory into public output. No instructor guide or aggregate curriculum directory is imported. Do not add private instructor answers, protected examinations, real borrower data or credentials here.

PE05.json and PE06.json are byte-for-byte copies of the reviewed public law/ethics bundle dated September 30, 2026 (Library libfile_71d945854bd481918cfb637730420b0d). PE05 contains 20 questions and PE06 contains 16, with 144 option-level explanations. law-ethics-sources.json resolves their 55 public manuscript source IDs. The same explicit boundary validation applies through config/pe-law-ethics-practice.mjs; no private instructor guide or source package is imported. Legal scope text, including the July 2026 Regulation B boundary, is preserved in the student lessons.
