# Texas Law of Agency — handoff

**Written:** 2026-08-31 · **Head:** `63ae6e7` on `main`, pushed · **Tree:** clean
**Freeze:** `LOA-CONTENT-FREEZE-2026-08-30-v6` · **Tests:** 1,032 passing, 0 failing

---

## 1. What state the course is in

Law of Agency is **complete as a course and blocked as a submission**. The acceptance report
computes three separate verdicts and does not let a green one stand in for a red one:

| verdict | result |
|---|---|
| content and assessment | **GO** |
| complete operational course | **GO** |
| submission readiness | **NO-GO** — seven standing blockers, none clearable from this repository |

`node scripts/loa-acceptance-report.mjs` recomputes all of it from the artifacts on disk. Nothing in
the report is transcribed, so it cannot describe a build that no longer exists.

### The numbers, and where each is asserted

| | | asserted by |
|---|---|---|
| Curriculum | 12 modules, 57 units | `tests/texas-law-of-agency.test.mjs` against the freeze hashes |
| Required time | 1,532.4 min against 1,500 prescribed; every topic at or above its own allocation | `scripts/report-loa-time-evidence.mjs`, three layers, exact seconds |
| Formative | 58 quiz primaries, 58 replacements, 7 misconception checks, 5 scenarios / 31 tasks | `scripts/validate-loa-assessments.mjs` |
| Summative | 132-item bank, 4 versions of 60, every topic on every version, 30.00% pairwise overlap against a 33.33% cap | same validator + load-time invariants in the bank and forms modules |
| Traceability | 286 items → unit, screen, objective, tested judgment, controlling source; 57/57 units assessed and examined | `scripts/report-loa-traceability.mjs` |
| Engine | 23 behaviours across four learners | `scripts/loa-reviewer-workflow.mjs` |
| Accessibility | 21/21 criteria over 19 rendered pages | `scripts/loa-accessibility-audit.mjs` |

---

## 2. Four things a reader should not have to discover

**The exam bank's first draft reproduced formative fact patterns.** Seven prompts sat at 0.47–0.68
Jaccard against a quiz or replacement item, and one was the same firm with different numbers. The
validator's 0.70 threshold would have passed all eight. § 535.65(h)(2) asks for questions
"significantly different from any quiz questions and exercises used in the course", which is a
substantive standard rather than a numeric one. All eight were rewritten; worst overlap is now 0.394
and a test holds the build at 0.50 so drift toward the validator's ceiling fails there first.

**Every mechanical-pass citation figure describes symbol-anchored citations only.** The shared claim
auditor anchors its Texas-code pattern on `§` at `scripts/lib/tx-claim-audit.mjs`, so a citation
written in prose — "Occupations Code section 1101.652" — is invisible to it. 457 such citations sit
outside this course's 1,975-citation sample, and 465 outside Principles II's. Stated in the
acceptance report as a limit on the measurement, not left implicit. **Task #44.**

**The freeze and the acceptance report disagreed about what an unmatched quotation is.** The audit
reports them in three lists; the freeze composed all three and saw 0 stale dispositions, the new
report composed one and saw 100. Both were reading the same ledger correctly. `unmatchedFrom()` now
composes it once, and lives with the auditor rather than in the disposition ledger — the ledger is
hashed by the content freezes, and a pure helper landing in it would break a freeze that nothing
about the content had changed.

**Three submission-document caveats were false and one claim was wrong.**
`texas/submission/pre-enrollment-agreement.md` said "§ 535.65 was not read" long after that section
was read and hashed, and stated the twelve-hour rule as a cap on daily credit when the held text
makes it a limit on the length of a course *segment*. Corrected at v1, with the version bumped at all
three readers (the document, `payment-contract.mjs`'s `POLICY_SOURCE`, the state registry) and a test
asserting they agree.

---

## 3. Standing constraints — carry these forward verbatim

- Do not represent StateCourse or any Texas course as TREC-approved until written approval has been received.
- Do not offer the courses for Texas qualifying credit before TREC approval.
- Do not use blogs, competitor schools, AI-generated summaries, or commercial study guides as legal authority.
- If official sources conflict, do not guess. Identify the conflict, use the current controlling authority, and document the decision.
- Final-exam questions remain confidential: not in student-facing source, public content, static builds, logs, snapshots, or test output.
- Keep `enrollmentEnabled: false` and block administrable exam attempts until the required TREC approvals exist.
- Do not fabricate or manually approximate any hash or byte count.
- Do not reduce legally necessary content merely to hit a number. Remove repetition and artificial expansion first.
- Do NOT create a pull request unless explicitly asked.
- Every badge, card, icon and button must have a real function. No decorative educational badges.
- Optional videos must never block progress. Do not require a student to type 80 characters merely to reveal an answer.

---

## 4. The seven standing blockers

None is clearable from this repository. They are recomputed into
`texas/tx-law-of-agency-30-v1/acceptance-report.json` on every run.

1. `TX_PROVIDER_RULE_SOURCE_LOCK` is FAIL — `trec-qe-provider-application`, `sos-tac-22-535` unreachable.
2. The codified 22 TAC text has never been read from this environment; the rules are held from TREC's published copy, TIER 4.
3. StateCourse holds no TREC qualifying-education provider approval, and no course application has been filed for LOA-1.
4. No student-facing surface exists. Engine and accessibility are demonstrated against a reviewer-only, non-credit surface that is not served, not linked and carries noindex. Testing with real assistive technology and real users is outstanding.
5. No video has been produced. The plan is frozen and validated and the transcripts are the primary artifact, so no student depends on an unproduced segment — but the segments are unbuilt.
6. The claim auditor's symbol-anchored blind spot (above).
7. Certificate issuance and four-year retention are implemented and refused/recorded in the engine, but neither has been exercised against a real completion.

---

## 5. What to do next

**The mission sequence** is: Principles I ✔ → Principles II ✔ → **Law of Agency ✔** → Law of
Contracts → Promulgated Contract Forms → Real Estate Finance. Complete and validate one course
before starting the next.

### Next course: Law of Contracts

The Law of Agency build is the template. In order:

1. Read the TREC course approval form for the course and transcribe the outline — topics, units,
   prescribed minutes — into `config/texas/<course>-course-form.mjs`, with a load-time invariant that
   the subtotals reconcile to the form's printed grand total.
2. Build the time budget from the form's own minutes (`law-of-agency-time-budget.mjs` is the model):
   every topic allocation is a **topic-specific minimum**, and a surplus in one topic may not cure a
   shortfall in another.
3. Author the modules against sources actually held on disk. Where a source was not held, say so in
   the module and register the gap.
4. Source register → block maps → course record → freeze.
5. Formative instruments, then the secure bank, then the forms.
6. Traceability, reviewer surface, accessibility audit, engine, reviewer workflow, acceptance report.

**Reusable, already generalised:** `scripts/lib/generate-tx-block-maps.mjs`,
`scripts/lib/tx-claim-audit.mjs`, `config/texas/quotation-dispositions.mjs`,
`config/texas/trec-rules-source-lock.mjs`. The LOA scripts are close adaptations of the Principles II
ones and adapt again cheaply — but read them rather than copying blind: the LOA versions carry three
accessibility criteria and two engine behaviours the Principles II ones do not.

### Open tasks

- **#43** — `screenMedia` hook for the Texas block-map generator. Specified and deliberately unbuilt;
  its ten-item test list is recorded in the generator's own header.
- **#44** — teach the shared claim auditor prose-form citations. Do this *deliberately*: it is a
  shared engine, and the fix changes hashed ledgers for Law of Agency and Principles II both, so it
  needs a freeze break on each with a break-history entry saying what moved and why.

---

## 6. Commands worth knowing

```
node scripts/freeze-loa-curriculum.mjs --verify     # freeze intact?
node scripts/freeze-loa-curriculum.mjs --write      # re-take (bump FREEZE_ID + break entry first)
node scripts/validate-loa-assessments.mjs           # 16 assessment checks
node scripts/report-loa-time-evidence.mjs           # three-layer time, exact seconds
node scripts/report-loa-traceability.mjs            # 286-item crosswalk
node scripts/build-loa-reviewer-surface.mjs         # 19 pages
node scripts/loa-accessibility-audit.mjs            # 21 criteria, drives Chromium
node scripts/loa-reviewer-workflow.mjs              # 23 engine behaviours
node scripts/loa-acceptance-report.mjs              # the verdict
node --test tests/*.test.mjs                        # 1,032 tests
```

`npm test` runs `npm run build` first and currently fails on a `MODULE_NOT_FOUND` in the build step;
`node --test tests/*.test.mjs` is the working invocation.

---

## 7. House rules the artifacts enforce, so a successor does not have to remember them

- **A freeze id denoting two byte-states is not an identifier.** Every re-take bumps the version and
  adds a `BREAK_HISTORY` entry naming what changed, why, who found it, and whether the id was bumped.
- **A check that cannot fail proves nothing.** The three accessibility criteria added for this course
  are re-run against deliberately broken markup, and the audit fails if a broken page comes back clean.
- **A gate that never refuses is not a gate** — and the absence of a gate needs proving too. The
  workflow drives a fourth learner who skips every optional element and finishes on identical terms.
- **Confidentiality is asserted, not assumed.** `traceability.json` carries no prompt, choice, key or
  rationale; the reviewer surface renders placeholder items; a test walks `public/` and `dist/` for
  any reference to the bank.
