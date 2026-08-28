# TX-1B Exam Build Input Manifest — Principles of Real Estate I

**Status: TX-1B IS NOT AUTHORIZED.** This document is an input manifest only. It was produced at
the close of TX-1A (2026-08-28) so that the final-examination build, when and if authorized, starts
from a complete, honest inventory instead of re-deriving one. Nothing below is an exam, an exam
item, or an answer key, and nothing in the course may describe a final examination as existing.

## What TX-1A delivered that TX-1B will consume

1. **Taught content** — nine modules, 46 PRINS1-1 units, 50,603 words, every legal claim traced to
   a section recorded as read in `config/texas/statute-sources.mjs` (76 sections; two explained
   cross-references documented in `lib/texas-claim-traceability.mjs`). The final exam may test only
   what these modules teach.
2. **Unit trace** — `config/texas/principles-i-course.mjs` `UNIT_TRACE`: unit → module → objectives
   → read sections. Exam blueprinting should allocate items against this trace so coverage is
   provable per unit and per topic.
3. **Formative bank** — `config/texas/principles-i-question-bank.mjs`: 32 primary items + 32
   replacements + 3 scenarios. These are FORMATIVE and may NOT be promoted into the final bank
   verbatim; they define the difficulty register and the style (scenario-first stems, rationale
   discipline, no true/false).
4. **Time and pacing constraints** — Occupations Code § 1101.003(d) (12-hour daily cap) and
   § 1101.003(e) (elapsed time > 2× credit hours before completion may be reported): the exam
   scheduler must sit behind both.

## What TX-1B must build (and TX-1A deliberately did not)

- A 120-question final examination bank, every item traced to a taught unit and a read section.
- Four final exam forms with controlled pairwise overlap, assembled from that bank.
- Secure answer keys, stored outside student-served content, never rendered to any student surface.
- Exam delivery code: timing, attempt limits, form rotation, integrity measures.
- The exam-side proctoring/administration decisions, resolved against the codified 22 TAC rules
  (§ 535.65 as adopted effective 2026-08-31) once the human export of the 8 TAC rules lands.

## Blockers TX-1B inherits

- `TX_PROVIDER_RULE_SOURCE_LOCK` is FAIL until the eight codified TAC rules are exported and read
  (see `texas/submission/human-export-list.md`); exam administration requirements live in those
  rules, so EXAM_READY stays BLOCKED regardless of content quality.
- The 50-minute credit hour and all exam-administration parameters carry
  FORM_DERIVED_PENDING_TAC_CONFIRMATION until § 535.65's codified text is read.

## Non-negotiables carried forward

- No question may assert a legal proposition the curriculum does not teach from a read section.
- No invented figures. Dollar amounts and percentages come only from read statutory text.
- Stripe/payment state never gates exam access or credit; completion logic is educational only.
- Nothing may claim TREC approval of provider, course, or examination.
