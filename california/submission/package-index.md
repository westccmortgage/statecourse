# California DRE submission — the envelope, item by item

**What this is:** the physical contents of the three application packages mailed to DRE (651 Bannon Street, STE 504, Attn: Education Section, Sacramento, CA 95811), keyed to the RE 303 checklist, with the repository location of everything that already exists and the blocker on everything that does not.

**Prepared:** August 19, 2026 · **Status: not filed.**

Three envelopes — one per course — or one envelope with three complete packages; **ask the Education Section which they prefer** when calling about item 15B.

## Package contents, per course

| RE 303 item | Document | Exists? | Where |
|---|---|---|---|
| 1 | RE 306, completed and signed | **Content ready, form unfilled** | `california/submission/re306-answer-sheet.md` — transcribe onto the form |
| 2 | Course offering fee | **Blocked** | Amount in RE 206E, not in hand |
| 3 | Corporation documents | **Ready** | `california/dre-sources/ca-articles-of-organization-B20260376786.pdf` — stamped Articles, SoS file B20260376786 |
| 4 | FBNS copy (if item 10 = YES) | **Pending counsel** | — |
| 5 | RE 304 (if required) | **Pending counsel** | Probably not required for a CA domestic LLC — confirm, don't assume |
| 6 | All student instructional materials, **printed** | **Content final, print run not done** | `california/<course>/curriculum/lesson-01..15.md` — ~125k words per course |
| 7 | Copyright authorization | **N/A** | All content original; RE 306 item 16 says so |
| 8 | RE 336 per instructor + substantiation | **One candidate package drafted, instructors unresolved** | `california/dre-sources/generated/RE336-*.pdf` (three course-specific forms for the founder); qualification substantiation in `california/dre-sources/instructor-equivalence/` |
| 9 | General Information Page | **Blocked on RE 313** | Delivery procedure built and described in RE 306 item 21 |
| 10 | Timed course outline | **Ready** | `california/<course>/submission/timed-course-outline.md` — generated from the lesson files, regenerate after any lesson change |
| 11 | Student final exam instructions | **Ready** | `california/<course>/submission/final-exam-student-instructions.md` |
| 12 | Proctor/monitor instructions with signed certification statement | **Ready** | `california/<course>/submission/final-exam-proctor-instructions.md` |
| 13 | Student version of the final exam | **Ready** | `california/<course>/submission/final-exam-form-a-student.md` and `final-exam-form-b-student.md` — two forms, because one retake requires different questions |
| 14 | Instructor version + answer key with source references | **Ready** | `california/<course>/submission/final-exam-form-a-answer-key.md` and `-form-b-answer-key.md` — each answer cites the lesson and section where it is taught |
| 15 | Student and regulator log-in credentials | **Mechanism built, credentials not issued** | Reviewer mode exists in the engine (bypasses study-time, exposes assessments); real accounts are issued on the production system at filing time and the credentials go in the envelope, never in this repository |
| 16 | Completion certificate | **Blocked on RE 311** | Issuance mechanism (15-day delivery clock, duplicate-on-request, append-and-supersede corrections) is in `database/006_california_timing_and_certificates.sql`; the certificate's required fields come from RE 311 |

**Exam security note for the envelope:** items 13 and 14 go to DRE because RE 303 requires them to. They are printed from the secure bank for the envelope only. Nothing in `public/`, `dist/`, or any student payload contains them, and the build guard proves it.

## The six blockers, and who clears each

| Blocker | Blocks | Who |
|---|---|---|
| **BPPE determination** (RE 306 item 8) | Signing any application | Counsel / written BPPE determination |
| **RE 206E** (fee schedule) | Item 2 | Request from DRE |
| **RE 313** (General Information Page) | Item 9, RE 306 item 21 | Request from DRE |
| **RE 311** (certificate) | Item 16 | Request from DRE |
| **Instructors** (three RE 336s) | Item 8 | Recruit/qualify; founder's package drafted, DRE judges sufficiency |
| **FBNS / RE 304 decisions** | Items 4, 5, RE 306 items 2/10 | Counsel |

**One phone call to (916) 576-3366 can clear three of the six** — ask for RE 206E, RE 313, and RE 311, and while on the line resolve RE 306 item 15B and the one-envelope-or-three question. That call is the single highest-leverage next action on California.

## What is deliberately not in the envelope

- **No Stripe, pricing, or payment material.** Payment state cannot touch completion, examination, credit, or certificates, and the submission makes no commercial representations.
- **No approval claims.** Every document carries the submission-draft status line; nothing says "approved" until DRE says it.
- **No digital media.** RE 303 is explicit that DRE cannot access it; everything is printed.
