# A7 — Instructor documentation

**Prepared:** August 20, 2026 · **Status:** Submission draft. Not filed.

**This sheet covers two different requirements that are easy to conflate. They are not the same, they are satisfied by different people, and only one of them is ready.**

| | Requirement | Who satisfies it | Status |
|---|---|---|---|
| **A7.1** | **RE 336** — Instructor Certification: who will *teach* the course | Anatoliy Kanevsky | **Ready** |
| **A7.2** | **RE 303, Course Content** — certification by a **college instructor** that self-written content is *equivalent to college course material* | Three independent college instructors | **NOT READY — genuine external blocker** |

---

## A7.1 — RE 336, Instructor Certification

**RE 303 checklist item 8:** "The RE 336 and supporting qualification documentation (resume, diploma, etc.) for each instructor is required for all course offerings."

**Three separate RE 336 forms are required**, because the form names a single course title. One per course:

| # | RE 336 for | Course package |
|---|---|---|
| A7/01 | **Real Estate Principles** | 01_Real_Estate_Principles, item 5 |
| A7/02 | **Real Estate Practice** | 02_Real_Estate_Practice, item 5 |
| A7/03 | **Mortgage Loan Brokering and Lending** | 03_Mortgage_Loan_Brokering_and_Lending, item 5 |

Pre-filled forms are at `california/dre-sources/generated/RE336-*.pdf`, produced by `scripts/fill-re336.mjs` from `california/dre-sources/re336-data.json`. **Signature and date are handwritten at filing.**

### Proposed instructor

| | |
|---|---|
| Name | **Anatoliy Kanevsky** |
| California DRE broker licence | **#01385024** |
| Status | **Instructor approval pending DRE review** |

**He is not a DRE-approved instructor and no document in this submission says otherwise.** The proposal is subject to DRE review under RE 307 Regulation 3000(a)(8).

### The qualification standard, and the route relied on

**RE 307, Regulation 3000(a)(8):**

> "Instructors must have credentials issued by the Board of Governors of the California Community Colleges or by a comparable California teacher-credentialing agency or meet the qualifications established in Sections 53400 et seq. of Title 5. **The commissioner may approve instructors who in his or her judgment meet the qualifications, or who otherwise evidence their teaching qualifications by education or experience or a combination of the two.**"

**The route relied on is the last clause: teaching qualifications evidenced by education and experience in combination.** No community college credential is claimed, and none is asserted to exist.

The regulation also disqualifies an instructor who has engaged in an Article 24 violation, whose real estate licence has been suspended, revoked, or restricted through discipline, or who has acted in a manner warranting denial of a licence. **None applies**; licence #01385024 is verifiable in DRE's own public licence lookup.

### Substantiation supplied

Held at `california/dre-sources/instructor-qualification-package-draft.pdf`, with per-course dossiers in `california/dre-sources/instructor-equivalence/`:

- more than 20 years of California real estate experience;
- California broker experience;
- mortgage origination and brokerage experience, with MLO endorsement;
- brokerage management and supervision experience;
- residential development experience;
- university education in Finance and Credit, with diploma and supporting education documentation;
- course-specific qualification explanations, one per course, tying the experience above to the subject matter of that particular course.

The course-specific explanations matter more than the aggregate résumé. Regulation 3000(a)(8) asks whether the instructor is qualified **for the course being taught**, and the mortgage course in particular is carried by the origination, brokerage, and MLO experience rather than by general real estate practice.

---

## A7.2 — College instructor equivalence certification

### This is the genuine blocker, and it is not RE 336

**RE 303, under COURSE CONTENT**, verbatim:

> "To obtain approval, curriculum must be equivalent to real estate courses offered by colleges or universities accredited by the Western Association of Schools and Colleges as recognized by the United States Department of Education.
>
> **If you write your own course content, it will be necessary to obtain a certification from a college instructor in the field of study for each specific course, confirming the course content is equivalent to course material used in a college or university course. This certification must be on official school letterhead and signed by the instructor.**"

StateCourse writes all of its own content. The requirement therefore applies to **all three courses**.

### Why Anatoliy Kanevsky cannot satisfy it

The certification is an **independent** attestation. Its entire function is that someone who teaches the subject at an accredited college or university, and who is not the author, has read the material and judged it equivalent to what a college course uses. A self-certification would be the author certifying his own work, which is not what the sentence asks for and would not survive a reviewer reading it.

**This is separate from, and additional to, the RE 336 instructor approval in A7.1.** Satisfying A7.1 does nothing for A7.2. The two requirements have different purposes: A7.1 asks *is this person fit to teach*, A7.2 asks *is this material college-equivalent*.

### What is needed, precisely

**Three certifications** — one per course — each of which must be:

1. from **a college instructor in the field of study** for that specific course;
2. **confirming the course content is equivalent** to course material used in a college or university course;
3. **on official school letterhead**; and
4. **signed by the instructor**.

### Why it is not on the numbered checklist, and why that is dangerous

It appears in the narrative COURSE CONTENT section **above** the sixteen-item checklist, not in it. An applicant who works the checklist and files will have a complete envelope and an incomplete application. It is recorded here so that cannot happen.

### Status and lead time

**Not started.** Preparation work exists — per-course dossiers describing the material, an outreach brief, and a certification letter draft, all in `california/dre-sources/instructor-equivalence/` — but no instructor has been approached, none has read the material, and none has signed anything.

**This is the longest-lead-time item in the entire California submission.** Every other open item is inside our own control. This one depends on finding three willing people, on their schedules, and on their honest professional judgment of material they have not yet seen. It cannot be compressed at the end.

### The two ways forward

**Option 1 — obtain the three certifications before filing.** The complete, low-risk path. The application goes in whole and the 60-day review starts against a complete file.

**Option 2 — file the three applications now and supply the certifications on request.** Faster to a filing date and materially riskier: the reviewer may treat the file as deficient, and a deficiency letter costs more calendar time than it saves.

**Recommendation: Option 1**, with the outreach started immediately and in parallel with the print run. There is nothing else on the critical path that this would delay.

### One useful side effect

A college instructor's comments on what is thin in the material are worth far more **before** filing than after. If any of the three declines or qualifies their certification, that is information about the content, arriving at the only time it can still be acted on cheaply.

---

## Note on the existing dossiers

The per-course dossiers in `california/dre-sources/instructor-equivalence/` were generated when the intended applicant was the Wyoming entity, and carried both the wrong entity name and a "California registration pending" line. **Both were wrong and both are fixed.** `scripts/generate-course-dossier.mjs` now takes the provider from `config/california/submission-facts.mjs` and states the entity in full — legal name, entity type, Secretary of State file number and filing date — rather than restating a name that can drift. The same misspelling was also hard-coded in `scripts/generate-state-intro-scripts.mjs`, where it reached all 51 generated marketing scripts, and was asserted by a test that had locked the wrong name in place. Both are corrected, and the release gate blocks any packet in which it reappears.
