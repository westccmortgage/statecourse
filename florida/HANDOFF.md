# Florida — session handoff

**Read this before touching anything.** Updated 2 September 2026 after DBPR confirmed the independent instructor-permit school route.

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

**Two selected tracks run in parallel.** School launch: DBPR RE 3 Instructor Exam `[1010]` →
instructor examination → issued instructor permit → Florida entity treatment → RE 5 on the
instructor-permit basis → any required RE 6 step → current RE 18. Personal broker objective:
current California history + California scope laws → DBPR RE 2 endorsement `[2501/1047]` →
fingerprints → equivalency review → DBPR-assigned examination → Florida broker license. DBPR's
2 September written response establishes that the broker track is not a prerequisite to the school
track. Nothing is filed or approved.

- **66 manifest authorities** read — 51 held/hashed and 15 current remote-only; 202 files under `florida/frec-sources/`.
- **128 material claims**, each naming what relies on it.
- **19 recorded conflicts**, none resolved by guessing.
- **19 syllabus sections, 180 learning objectives**, each page-referenced; `verify()` clean.
- **19 curriculum files, 3,000 designed instruction minutes, 180 periodic application items and 19 secure final-item drafts.**
- **Two 126-item form blueprints: 252 secure slots, all 180 objectives covered, 233 slots still unwritten.**
- **Four owner-controlled DBPR inquiries sent 1 Sep 2026.** The instructor/school thread was answered 2 Sep; the course, instructor-exam operations and endorsement threads remain open. Exact transport records are in the transmission log.
- **79 Florida tests**, all passing. Source lock **LOCKED**.
- **Repository-wide direct run:** 1,021/1,055 pass; all 34 failures are outside the Florida build.
  A clean built-main comparison was not reproducible in this worktree because the bootstrap requires
  Linux `flock` and the host did not have enough free disk for a local dependency install.

Run these four before believing anything above:

```bash
node scripts/florida-source-lock.mjs            # LOCKED, 61 URLs / 29 body-identity validations
node scripts/florida-source-inventory.mjs       # 202 files, 32 controlling present
node scripts/build-florida-course.mjs           # deterministic 19-section build
node scripts/florida-exam-blueprint.mjs         # 2 x 126 slots; content remains NO-GO
node --test tests/florida-foundation.test.mjs tests/florida-course-build.test.mjs tests/florida-exam-blueprint.test.mjs # 79/79
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
- **Do not file an application, sign for the owner or claim approval.** Prefiling regulator
  correspondence is authorized, but must omit SSN/background details and be sent through an
  owner-controlled channel because Florida correspondence may become a public record.

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
`CONSTITUTION` > `STATUTE` > `RULE` (only so far as consistent and authorised) > `INCORPORATED` >
`FORM` / `GUIDANCE` (evidence of the Department's reading, cannot create or remove requirements) >
`NAVIGATION` (nothing rests on it). `VENDOR` supports only dated commercial product facts and never
controls a licensing requirement.

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
| `regulatory-manifest.mjs` | 66 authorities (51 held/hashed, 15 current remote-only) with authority class, material claims/conflicts, forbidden claims, `SCHOOL` record |
| `frec-course-i-syllabus.mjs` | 19 sections, 180 page-referenced objectives, `verify()` gate |
| `course-i-requirements.mjs` | time architecture, completion, retention, approval lifecycle, exemptions |
| `assessment-architecture.mjs` | the three tiers + historical combined `DRAFT_QUESTION_TO_DBPR` record; do not resend it |
| `school-permit-ledger.mjs` | 7-row eligibility matrix, controlling texts quoted, 29 deliverables |
| `dbpr-application-package.mjs` | 8 forms, 6 guidance docs, current RE 18 resolution and legacy-form blacklist |
| `distance-delivery-matrix.mjs` | 18 dimensions: required / policy / engine / open |
| `video-instruction-plan.mjs` | 7 candidates, 8 rejected, production rules, activation gate |
| `course-i-curriculum.mjs` | all 19 sections, 180 objectives, provider-designed 3,000-minute allocation and substantive core lessons |
| `periodic-assessment-bank.mjs` | 180 objective-mapped formative application prompts with rubrics |
| `secure-final-bank-draft.mjs` | truthful 19-item development slice; no usable final form |
| `secure-final-form-blueprint.mjs` | two 126-item form maps; 252 page-referenced authoring slots; release disabled |
| `distance-course-engine.mjs` | identity, progression, event, records, continuity and final-release controls |

### Scripts

`florida-source-lock.mjs` · `florida-source-inventory.mjs` · `florida-fetch-fac-rules.py` ·
`florida-regression-baseline.sh` · `build-florida-course.mjs`

### Documents

`florida/PHASE-0-REPORT.md` (the v2 acceptance report — start there) ·
`florida/regulatory/primary-text-readings.md` · `florida/submission/frec-course-i-submission-plan.md` ·
`florida/submission/05-anatoliy-filing-runbook.md` ·
`florida/submission/06-california-broker-scope-appendix.md` ·
`florida/submission/07-florida-foreign-llc-filing-packet.md` ·
`florida/fl-sales-associate-course-i-63-v1/video-instruction-plan.md` ·
`docs/florida/shared-file-change-proposals.md` · `docs/florida/regression-baseline.md`

---

## 5. The architecture, in one screen

**Time.** 63 hours × 50 min = **3,150 minutes**, inclusive of examination. The syllabus splits it
60 + 3 = 3,000 + 150. Read as clock hours it becomes 3,180 and breaches the §475.17(2)(a)1 ceiling —
so the 50-minute reading is the only coherent one. **No per-section allocation exists**, deliberately:
Rule 61J2-3.008(4)(b)3.e makes any allocation something StateCourse must prove by objective study.

**Assessment — three tiers, never mixed:**

- `REGULATORY_MINIMUM_CONFIRMED` — values the authorities establish without interpretation: **70% pass and 2 forms**, plus the cognitive, timing, security and retake controls. The item text remains open at **100/120/126**.
- `ITEM_COUNT_QUESTION` — the open 100/120/126 readings, with 126 per form as the safe filing build.
- `STATECOURSE_CONSERVATIVE_POLICY` — **126 items per form and 2 forms**. The item count is a
  provider filing choice pending written confirmation; the current-form count is not configurable.
- `OPEN_DBPR_QUESTIONS` — 9, with readings and safe pending behaviour.

**Why 100 is a strong reading but not a filing fact:** the broker parallel supports reading “or” as
an alternative, but that remains interpretation while the package itself asks DBPR which count
governs. Filing-safe posture is 126 items per form until DBPR answers. **The 1.8-minute rule does not
disambiguate** — it is a ceiling on time, not an equality, and 150 minutes fits every candidate.

**Form count is now resolved.** The current DBPR Education-page-linked June 2026 RE 18 requires two
forms for distance pre/post-license courses and five only for distance continuing education. It
also marks RE 19 and RE 20 provider-only. The legacy RE 18 is retained but forbidden for filing.

**Proctoring: NOT REQUIRED and NOT PROHIBITED.** §475.17(2)(a)2 removes an obligation; it does not
impose a ban. **Never cite §455.2123** for this — that is continuing education.

**Delivery.** Seat time alone does **not** satisfy Florida. Identity is verified at **three** moments
— enrolment, participation, completion. Accessibility, captions and mobile are StateCourse policy,
not Florida law. **No Texas engine behaviour was imported and none should be.**

**Video** sits **outside** the instructional-hour budget. That is what keeps it optional and
non-blocking without making the stated hours untrue.

---

## 6. What blocks progress, and who can unblock it

### School launch — do these without waiting for RE 293

1. **Clarify the Instructor CIB certificate sentence.** RE 3 `[1010]` does not list a prelicensing
   certificate, but the February 2025 CIB's generic “What to Bring” section does. The focused
   follow-up was sent 3 September 2026 and is awaiting answer; do not send a duplicate or invent a
   63-hour or 72-hour prerequisite.
2. **File RE 3 Instructor Exam `[1010]` with $62.75 and fingerprints.** Retain the filed copy,
   receipt, TCN and authorization. This transaction does not use RE 293, a Florida broker license or
   a degree packet.
3. **Pass the instructor examination after authorization.** Current official format: physical
   Pearson center, closed book, 100 questions, 3.5 hours, 75 points to pass. Verify the live fee.
4. **Receive the instructor permit.** A passing score is not the permit; the permit must issue before
   StateCourse relies on it for RE 5.
5. **Qualify StateCourse LLC as a Florida foreign LLC.** The selected conservative route is recorded
   in `07-florida-foreign-llc-filing-packet.md`: select a Florida registered agent, obtain a
   California Certificate of Status no more than 90 days old, and file CR2E027 with the $125
   mandatory state fee. This removes the RE 5 corporate-record mismatch without creating a Florida
   classroom.
6. **File RE 5 on the instructor-permit basis with $109.** Use the actual California physical
   business address. No Florida classroom is required solely for distance delivery; a
   registered-agent-only address does not require RE 9.
7. **Complete any required RE 6 step, then current RE 18.** School and course approval are separate.
   No Course I offering begins before all applicable approvals.

### Personal broker objective — continue in parallel

1. Receive and inspect California DRE RE 293 and complete the California scope packet.
2. File RE 2 endorsement `[2501/1047]` with $70 and fingerprints.
3. Protect the section 455.213(15) review window if an adverse equivalency finding is the only
   proposed denial ground.
4. Inspect the authorization and pass only the exam DBPR assigns. Laws and Rules — 40 questions,
   90 minutes, 30 correct — is expected but not yet transaction-confirmed.
5. Record the issued Florida broker number and exact status.

**Do not buy the 72-hour broker course now.** It remains part of the deliberate `[1012]` fallback,
not the current endorsement or school-launch plan. The focused endorsement inquiry sent 1 September
remains open; do not duplicate it.

### Closed inside the repository

8. **Complete CFPB Closing Disclosure package acquired and visually/content validated.** The exact
   older specimen printed in the February 2025 FREC instructor CIB is preserved for exam prep, and
   the current forms hub, Regulation Z Appendix H, H-25(A) blank model form and H-25(B) completed
   sample are held for instruction. FL-V06 is no longer source-blocked; production remains inactive.
9. **Florida homestead controlling package acquired, extracted, hashed and marker-locked.** Articles
   VII and X; Chapters 193, 196, 222 and 732; and two DOR 2026 documents are held. The 2026 first
   exemption remains $25,000; the indexed additional non-school exemption is $26,411. FL-V07 is no
   longer source-blocked; production remains inactive.

### Needs an owner decision, not Florida's

10. **`scripts/sync-california-pdf-downloads.mjs` is missing.** `build-verified.sh` line 23 calls it;
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
3. **Complete the secure bank** against the current two-form blueprint: 233 slots remain unwritten.
   If DBPR confirms 100 items per form, 52 planned slots retire and 181 remain across both forms.
   Lock final pagination, assemble forms and run duplication/cognitive-level audits.
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
