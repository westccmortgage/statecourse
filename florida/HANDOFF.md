# Florida — session handoff

**Read this before touching anything.** Updated 31 August 2026 after the authorized course build.

| | |
|---|---|
| **Branch** | `relay-florida` |
| **Head** | see `git rev-parse HEAD`; current course-build commit is recorded in git |
| **Based on** | `b38c81a`; **deliberately not rebased** — see §2 |
| **Phase** | Phase 0 v2 complete; authorized course-development layer built |
| **Curriculum authoring** | **AUTHORIZED 31 Aug 2026. Nineteen sections and assessment slice built.** |

---

## 1. Where things actually stand

Phase 0 is done and the course-development layer now exists. Nothing is filed or approved.

- **48 sources** read and hashed — 197 files under `florida/frec-sources/`.
- **98 material claims**, each naming what relies on it.
- **16 recorded conflicts**, none resolved by guessing.
- **19 syllabus sections, 180 learning objectives**, each page-referenced; `verify()` clean.
- **19 curriculum files, 3,000 designed instruction minutes, 180 periodic application items and 19 secure final-item drafts.**
- **Five 126-item form blueprints: 630 secure slots, all 180 objectives covered, 611 slots still unwritten.**
- **76 Florida tests**, all passing. Source lock **LOCKED**.
- **Repository-wide direct run:** 1,021/1,055 pass; all 34 failures are outside the Florida build.
  A clean built-main comparison was not reproducible in this worktree because the bootstrap requires
  Linux `flock` and the host did not have enough free disk for a local dependency install.

Run these four before believing anything above:

```bash
node scripts/florida-source-lock.mjs            # LOCKED, 48 sources
node scripts/florida-source-inventory.mjs       # 197 files, 30 controlling present
node scripts/build-florida-course.mjs           # deterministic 19-section build
node scripts/florida-exam-blueprint.mjs         # 5 x 126 slots; content remains NO-GO
node --test tests/florida-foundation.test.mjs tests/florida-course-build.test.mjs tests/florida-exam-blueprint.test.mjs # 76/76
bash scripts/florida-regression-baseline.sh     # requires the repository's build dependencies
```

---

## 2. Isolation — the rules that still bind

**Texas is active and moving fast.** `origin/main` advanced **19 commits** during this session
(`b38c81a` → `63ae6e7`), all Texas Law of Agency work. Expect more.

- **Do not modify any Texas file** — `texas/`, `config/texas/`, `tests/texas-*`, `scripts/*texas*`.
- **Do not merge or rebase Texas work into this branch.** The branch stays on `b38c81a`. The
  regression baseline compares against *current* main anyway, so being behind costs nothing and
  merging would break isolation.
- **Do not edit shared production registries** while Texas is active. Seven proposed changes are
  written up in `docs/florida/shared-file-change-proposals.md` and **none is applied**.
- **Do not claim DBPR/FREC approval.** Nothing is held.
- **Do not enable Florida enrolment.**
- **Do not publish or submit anything externally.**

**One trap:** running the test suite rewrites
`california/submission/02_Real_Estate_Practice/07-sb1495-traceability.md` as a side effect of the
broken build. Revert it — never commit it. `scripts/florida-regression-baseline.sh` does this
automatically and warns if any non-Florida file is left modified.

---

## 3. What v1 got wrong — do not re-derive these errors

Phase 0 v1 was rejected for three things. All corrected. They are recorded here because each is a
mistake a careful reader could make again.

### 3.1 The eligibility error (material)

v1 reported that a **Florida broker's licence was mandatory** for the school permitholder, and that
no StateCourse individual could sign an application. **Wrong.**

§475.451(2)(a), Fla. Stat.: a permitholder "must be the holder of a license as a broker … **or must
have passed an instructor's examination approved by the commission**."

v1 let Rule 61J2-17.011(2) override the statute. Two independent reasons it cannot:

1. **The rule's sentence is scoped**, not exclusive — a licensee must hold a *Florida* broker's
   licence *in order to satisfy the Broker license requirement*. That answers *which* licence counts,
   not *whether* one is needed.
2. **A rule cannot repeal a statute.** §120.52(8)(c) makes a rule that enlarges, modifies or
   contravenes its enabling law invalid. This rule's own cited authority is the *instructor*
   experience provision, and its cross-reference to "§475.25(2)(a)" **does not resolve at all** —
   that section is about revoking a licence issued by mistake.

**DBPR administers it as two routes**, on three of its own forms: RE 5, RE 6, RE 3.

**Authority order, now encoded** as `AUTHORITY_CLASS` in the manifest and used throughout:
`STATUTE` > `RULE` (only so far as consistent and authorised) > `INCORPORATED` > `FORM` / `GUIDANCE`
(evidence of the Department's reading, cannot create or remove requirements) > `NAVIGATION` (nothing
rests on it).

### 3.2 The forms were always there

v1 fetched `https://www2.myfloridalicense.com/real-estate/forms/`, got **HTTP 200**, and concluded
DBPR published no forms. It is a **soft-404 serving the Elevator Safety page**. Several sibling URLs
return 200 with byte-identical navigation shells.

**A 200 is not evidence that the page you asked for exists.** The real locations:
`/real-estate-commission/forms-and-publications/` and `/real-estate-commission/education/`. Both the
wrong page and the right ones are held so the trap is visible.

### 3.3 The syllabus count could not agree with itself

v1 reported 182 objectives and 181 objectives in the same report, both from OCR of a scan.

DBPR publishes a **text-layer copy** of the same syllabus that v1 never found:
`FREC1SyllabusCleanFinal01012023.pdf`. The verified figure is **180**, and it is corroborated
independently — DBPR RE 18 requires learning objectives at "three per hour" and the course carries
60 instruction hours. 3 × 60 = 180.

`florida/frec-sources/extracted/syllabus-reconciliation.json` holds, per section, the verified
transcription, the OCR output, the page, and — for the five sections where they disagreed (1, 3, 6,
7, 15) — the resolution. OCR was at fault in all five.

### 3.4 A judgement written into a config as though it were law

v1 wrote `plannedItemCount: 126` with nothing marking it a choice. Now three tiers, never mixed —
see §5.

---

## 4. Where everything lives

### Configs (`config/florida/`)

| File | What it holds |
|---|---|
| `regulatory-manifest.mjs` | 48 sources with authority class, 98 claims, 16 conflicts, forbidden claims, `SCHOOL` record |
| `frec-course-i-syllabus.mjs` | 19 sections, 180 page-referenced objectives, `verify()` gate |
| `course-i-requirements.mjs` | time architecture, completion, retention, approval lifecycle, exemptions |
| `assessment-architecture.mjs` | the three tiers + `DRAFT_QUESTION_TO_DBPR` |
| `school-permit-ledger.mjs` | 7-row eligibility matrix, controlling texts quoted, 21 deliverables |
| `dbpr-application-package.mjs` | 8 forms, 6 guidance docs, the 2-vs-5 conflict |
| `distance-delivery-matrix.mjs` | 18 dimensions: required / policy / engine / open |
| `video-instruction-plan.mjs` | 7 candidates, 8 rejected, production rules, activation gate |
| `course-i-curriculum.mjs` | all 19 sections, 180 objectives, provider-designed 3,000-minute allocation and substantive core lessons |
| `periodic-assessment-bank.mjs` | 180 objective-mapped formative application prompts with rubrics |
| `secure-final-bank-draft.mjs` | truthful 19-item development slice; no usable final form |
| `secure-final-form-blueprint.mjs` | five 126-item form maps; 630 page-referenced authoring slots; release disabled |
| `distance-course-engine.mjs` | identity, progression, event, records, continuity and final-release controls |

### Scripts

`florida-source-lock.mjs` · `florida-source-inventory.mjs` · `florida-fetch-fac-rules.py` ·
`florida-regression-baseline.sh` · `build-florida-course.mjs`

### Documents

`florida/PHASE-0-REPORT.md` (the v2 acceptance report — start there) ·
`florida/regulatory/primary-text-readings.md` · `florida/submission/frec-course-i-submission-plan.md` ·
`florida/fl-sales-associate-course-i-63-v1/video-instruction-plan.md` ·
`docs/florida/shared-file-change-proposals.md` · `docs/florida/regression-baseline.md`

---

## 5. The architecture, in one screen

**Time.** 63 hours × 50 min = **3,150 minutes**, inclusive of examination. The syllabus splits it
60 + 3 = 3,000 + 150. Read as clock hours it becomes 3,180 and breaches the §475.17(2)(a)1 ceiling —
so the 50-minute reading is the only coherent one. **No per-section allocation exists**, deliberately:
Rule 61J2-3.008(4)(b)3.e makes any allocation something StateCourse must prove by objective study.

**Assessment — three tiers, never mixed:**

- `REGULATORY_MINIMUM_CONFIRMED` — 20 values, each quoted and cited. **70% pass. 100 items. 2 forms.**
- `STATECOURSE_CONSERVATIVE_POLICY` — **126 items, 5 forms**, both `isNotARegulatoryMinimum: true`,
  both `configurable`, each stating its cost.
- `OPEN_DBPR_QUESTIONS` — 6, with readings and pending behaviour.

**Why 100 is confirmed:** the *broker* sentence in the same paragraph settles it. The Broker course
is 72 hours, so "2 per instruction hour" is ≥144 against a stated floor of **95**. In both sentences
the flat number sits well below the per-hour figure; if the multiplier governed, both would be dead
letters. "Or" offers an alternative basis. **The 1.8-minute rule does not disambiguate** — it is a
ceiling on time, not an equality, and 150 minutes fits every candidate count.

**Proctoring: NOT REQUIRED and NOT PROHIBITED.** §475.17(2)(a)2 removes an obligation; it does not
impose a ban. **Never cite §455.2123** for this — that is continuing education.

**Delivery.** Seat time alone does **not** satisfy Florida. Identity is verified at **three** moments
— enrolment, participation, completion. Accessibility, captions and mobile are StateCourse policy,
not Florida law. **No Texas engine behaviour was imported and none should be.**

**Video** sits **outside** the instructional-hour budget. That is what keeps it optional and
non-blocking without making the stated hours untrue.

---

## 6. What blocks progress, and who can unblock it

The former instructor-exam logistics gap and both source-acquisition gaps are closed. Permit,
approval, regulator-answer and human-study gates remain.

### Do these first — they are external and everything waits on them

1. **Follow the instructor route.** File RE 3 transaction 1010 with fingerprints and $62.75, obtain
   authorization, then take the physical Pearson exam: closed book, 100 equal-weight MCQs, 3.5
   hours, pass 75. The current Pearson portal uses 888-204-6289 and online scheduling. The $36.75
   exam fee appears only on a still-linked 2017 sheet and is not represented as current until live
   checkout confirms it.
2. **Send the DBPR letter.** Fully drafted at `assessment-architecture.mjs` →
   `DRAFT_QUESTION_TO_DBPR`. Four questions: item count, "instruction hour", form count (2 vs 5),
   RE 19 for schools. Add the two carried separately: absence measurement in a distance course, and
   the pre-licence hardship definition.

Then, in order: pass the exam → **DBPR RE 3** basis `[1010]` + fingerprints + $62.75 → instructor
permit → **DBPR RE 5** citing that permit + $109.00 → school permit → **DBPR RE 6** to register the
instructor → **DBPR RE 18** for the course ($0 for schools).

### Closed inside the repository

3. **Complete CFPB Closing Disclosure package acquired and visually/content validated.** The exact
   older specimen printed in the February 2025 FREC instructor CIB is preserved for exam prep, and
   the current forms hub, Regulation Z Appendix H, H-25(A) blank model form and H-25(B) completed
   sample are held for instruction. FL-V06 is no longer source-blocked; production remains inactive.
4. **Florida homestead controlling package acquired, extracted, hashed and marker-locked.** Articles
   VII and X; Chapters 193, 196, 222 and 732; and two DOR 2026 documents are held. The 2026 first
   exemption remains $25,000; the indexed additional non-school exemption is $26,411. FL-V07 is no
   longer source-blocked; production remains inactive.

### Needs an owner decision, not Florida's

5. **`scripts/sync-california-pdf-downloads.mjs` is missing.** `build-verified.sh` line 23 calls it;
   it has never existed. `npm run build` exits 1 on `main` because of it, and all 19 pre-existing
   test failures trace to it. Restoring or removing the line is a California/Texas call. Recorded as
   proposal §6.

---

## 7. Authorized curriculum build — current state

Authorization was given on 31 August. Steps 1 and 2 are now concrete: all 19 sections exist in
syllabus order, all 180 objectives map to canonical curriculum pages, and the provider-designed
allocations total 3,000 minutes. A 180-item periodic bank and 19-item secure final-development slice
exist. The Florida-specific engine, identity, records, continuity and submission artifacts exist.

Remaining order:

1. **Independent legal/content review and expansion of authored lessons.** Current layer is a
   complete architecture and substantive draft, not yet a regulator-ready textbook.
2. **Objective time study** with representative learners, without video.
3. **Complete the secure bank** against the fixed five-form blueprint: 611 slots remain unwritten
   (81 more reaches one 100-item floor form; 107 more reaches one 126-item policy form). Lock final
   pagination, assemble forms and run duplication/cognitive-level audits.
4. **Re-test video candidates** against the reviewed course.

**The constraint that forces this order:** answer keys must cite the page numbers each question and
correct answer rest on. An item cannot cite a page that does not exist. Any plan running curriculum
and examination in parallel produces an answer key that cannot be completed.

The formerly conditional tests are now binding because curriculum exists; all pass. The additional
course-build suite locks time, objectives, page map, assessment slice, engine controls and NO-GO
release state.

---

## 8. Habits worth keeping

The three v1 errors had one shape in common: **something that looked checked was not.** A 200 that
was a soft-404. An OCR count nobody reconciled. A rule read without the statute above it.

- A fetch that returns 200 is not a fetch that worked. Read what came back.
- A number that cannot agree with itself is not a number yet.
- Read the statute before the rule, and the whole paragraph before the sentence — the broker
  sentence that settled the item count was two sentences from the one everyone was staring at.
- When two defensible readings survive, **label the choice**; do not promote it to a fact.
- Record what was looked for and not found, and where. Absence is evidence too.
