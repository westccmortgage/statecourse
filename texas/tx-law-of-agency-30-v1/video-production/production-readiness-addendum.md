# Production-readiness addendum — the three Law of Agency videos

**Date:** 2026-08-30 · **Supplements:** `texas/tx-law-of-agency-30-v1/video-instruction-plan.md`
**Status of all three videos: NOT RENDERED, NOT DISPLAYED, NOT ACTIVE.**

---

## Why this is a separate file

The video instruction plan is a **hashed artifact of the curriculum freeze**
`LOA-CONTENT-FREEZE-2026-08-30-v2` — `scripts/freeze-loa-curriculum.mjs` records its sha256 alongside
the twelve modules, the source register and the claim-audit evidence. Editing it, even to record work
that only makes it more accurate, breaks the freeze.

That is what happened during this pass. The plan was edited, the freeze reported drift, and the edit
was **reversed byte for byte** — the restored file hashes to
`7ca7234853320ad96275c9a6c7e69a16e0a2ec2b63b6de2fd7ed62ed7f88e403`, which is the hash the freeze
holds. Everything that would have gone into the plan is here instead. This file is not hashed by the
freeze, sits with the production files it describes, and changes nothing the acceptance case rests
on.

The plan therefore still says three things that this pass has moved past. They are corrected below,
and the plan should be updated when a freeze break is taken for some other reason — not on account of
a video.

---

## 1. Corrections to the frozen plan

| Plan says | Now true | Where the detail is |
|---|---|---|
| §5: "Screen ids are reservations, not references… no `law-of-agency-module-*-blocks.mjs` has been authored" | The block maps exist and **every placement is confirmed against them**, exactly as predicted | §2 below; §3 of each production file |
| §10.3: "The Law of Agency block map does not exist" | **Resolved.** See above | §2 below |
| §3: durations ≈ 3:01 / 2:53 / 3:10, total ≈ 9:04 | ≈ **3:30 / 3:03 / 3:20**, total ≈ **9:53**, all still provisional | §3 below |
| §6: "The caption files in each production file carry provisional timings" | Real `.vtt` files now exist **on disk**, cue text final, timings still provisional and labelled so inside the files | §4 below |

Nothing in the plan's reasoning changed. The selection case for the three videos, and the rejection
of the fourth candidate — *Client, Customer and Fiduciary Duties*, a taxonomy with no document, no
sequence and no branch to show — stand exactly as written. **That rejection was not revisited and is
not reopened here.**

---

## 2. Placement, confirmed against the live block maps

The maps were generated after the plan was drafted, by
`scripts/generate-tx-law-of-agency-block-maps.mjs`, from the frozen modules' own headings. Every
screen id the plan reserved exists, with the type, title and content range it predicted.

| Video | Module map | Block | The screen it attaches to | Then | Then |
|---|---|---|---|---|---|
| 1 — IABS 1-2 Document Overview | `config/texas/law-of-agency-module-2-blocks.mjs` | `t02u5` (code `T02U5`) | **`t02u5-s1`**, instruction, `RANGE("## Unit: Information About Brokerage Services - Disclosure of Representation", "### Applied exercise: Four conversations in Corpus Christi")` | `t02u5-s2` practice | `t02u5-s3` retrieval |
| 2 — Representation or Showing Only | `config/texas/law-of-agency-module-5-blocks.mjs` | `t05u3` (code `T05U3`) | **`t05u3-s1`**, instruction, `RANGE("## Unit: The Creation of Buyer Agency", "### Statute reading exercise: § 1101.562 and the four conditions")` | `t05u3-s2` practice | `t05u3-s3` retrieval |
| 3 — Texas Intermediary Brokerage | `config/texas/law-of-agency-module-6-blocks.mjs` | `t06u3` (code `T06U3`) | **`t06u3-s1`**, instruction, `RANGE("## Unit: Representation of More Than One Party in a Transaction", "### Statute reading exercise: The mechanics of appointment")` | `t06u3-s2` practice | `t06u3-s3` retrieval |

Each video plays at the **foot** of its instruction screen, after the whole of that screen's content
range — that is, after the module paragraph beginning "**The habit to build.**" (Video 1),
"**Subagency.**" (Video 2) and "**Two more constraints that survive the intermediary posture.**"
(Video 3). All three anchor paragraphs were checked against the frozen modules and are the last
paragraph before the following exercise heading.

**Assessment separation is satisfied by construction, and now verifiably so.** Each video sits two
screens ahead of its unit's retrieval check with the unit's practice screen in between. No video
contains a quiz question, a self-test, a poll, an answer or an answer recap; no answer is revealed
immediately before a retrieval check; every video ends on the avatar with no document and no panel on
screen, so no highlight is up when the student is asked to retrieve. Each production file's §3
additionally records an authoring condition on its unit's retrieval item, naming the propositions the
item must avoid because the video states them and naming better targets from the module's prose.

**Nothing is wired.** The block maps are generated files carrying "Do not edit by hand — regenerate",
they are owned elsewhere, and no `videos` or `screenMedia` entry for any of these three videos exists
in any of them. Their own headers record that the Law of Agency retrieval bank does not exist yet, so
no block in them is deliverable to a student today.

---

## 3. Durations, and why they moved

| Video | Plan | Now | Measured? |
|---|---|---|---|
| 1 — IABS 1-2 Document Overview | ≈ 3:01 | **≈ 3:30** | No |
| 2 — Representation or Showing Only | ≈ 2:53 | **≈ 3:03** | No |
| 3 — Texas Intermediary Brokerage | ≈ 3:10 | **≈ 3:20** | No |
| **Total optional video time** | ≈ 9:04 | **≈ 9:53** | No |

Every figure is an estimate computed from the final word count at 150 words per minute, the delivery
rate of the existing series, with a 1.4-second readability floor on very short cues. **None is a
measurement, and no student- or reviewer-facing surface states a duration for any of these videos.**
They are replaced by measured durations after each render arrives.

The total rose for one reason: the nine narration repairs in §5 below restored the form's and the
statute's full printed wording where earlier drafts had compressed it, and full wording takes longer
to say. The plan's figures were also internally inconsistent — Video 1's scene table totalled 3:01
while its own caption block ran to 3:17 — and the scene tables, prompt durations, caption timings and
registry `duration` fields are now computed from one source and agree with each other.

**No time budget changed.** The ≈ 9 minutes 53 seconds sit entirely outside LOA-1's prescribed 1,500
minutes. T02U5 keeps its 20 prescribed minutes, T05U3 its 30 and T06U3 its 30, all spent on reading
and activity minutes exactly as `config/texas/law-of-agency-time-budget.mjs` apportions them. No
figure in that file was read as changeable, none was changed, and none was reduced to make room for a
video. A student who watches all three spends about ten minutes more than the course requires; a
student who watches none has completed the same 1,500 minutes.

---

## 4. Caption files — where they are, and what they are not

| Video | Caption file on disk |
|---|---|
| 1 | `video-production/captions/tx-iabs-1-2-document-overview.provisional.vtt` — 39 cues |
| 2 | `video-production/captions/tx-representation-or-showing-only-2026.provisional.vtt` — 33 cues |
| 3 | `video-production/captions/tx-intermediary-brokerage.provisional.vtt` — 34 cues |

Each is real, well-formed WebVTT: `WEBVTT` header, monotonic non-overlapping cues, no empty cue, no
line over 90 characters.

**Cue text is final.** Every cue matches the recorded script word for word, and every fragment that
reads the held form or the held statute has been verified against the source character by character.

**Cue timings are provisional, and each file says so in its own first block** — a `NOTE` block
declaring that the timings are computed at 150 wpm, that no render exists, and that they must be
rebuilt from the delivered render's own audio by silence-gap detection cross-validated against
word-count pacing before the file ships.

They are written to `video-production/captions/` and **deliberately not** to
`public/statecourse/media/`, and their filenames carry `.provisional`. A caption file sitting at its
shipping path with invented timings is the kind of thing that gets shipped by accident; one sitting in
the production directory under a name that says what it is, is not.

---

## 5. Source-fidelity verification

Method: the held page was opened with `pdfplumber`, its text lines and words extracted with bounding
boxes, the two ligature glyphs the file encodes as `(cid:415)` (ti) and `(cid:425)` (tt) mapped back
to their letters, curly quotation marks folded, whitespace collapsed — then each candidate string
tested for verbatim containment. Statutory strings were tested the same way against the held
`texas/trec-sources/statutes/OC.1101.htm`.

**50 form strings verified verbatim across the three videos. 0 mismatches.** The held form's sha256 is
`5056930b66d237a7a4376db0c43f833929600f0b6e5ce6e42a417da824ef6b20`, matching
`texas/trec-sources/source-inventory.json`, revision stamp 11-03-2025, one page.

Statutory checks, all against the held chapter: § 1101.558(b) and (b-1); § 1101.559(a) and (c);
§ 1101.560(a)–(c); § 1101.561(b); § 1101.562(a)–(c); § 1101.563(a), (b) and (e); § 1101.651(d)
including the (d)(3)(C) condition-of-the-property exception; and the load-bearing negatives — *dual
agent* and *dual agency* appear **zero** times in Chapter 1101, *customer* appears **zero** times, and
§ 1101.002 defines neither *client* nor *customer*. All confirmed.

### The nine narration repairs

Verification found nine places where narration was reading the form but had drifted from its printed
wording. All nine were repaired in the script, the HeyGen prompt, the captions and the transcript
together, and the durations recomputed. Video 1 carried five, Video 2 six (one shared), Video 3 three;
each production file's §14 lists its own with the before and after.

The most consequential was Video 3, Scene 6. The narration read "and any confidential information a
party instructs the broker in writing not to disclose" — dropping *or any other information*,
*specifically*, and, materially, the exception **unless required to do so by law** — while the
highlight box around that sub-bullet was showing the student the exception on the page. The narration
now reads the provision whole.

### The six coordinate corrections

- **Band G's foot, 594 → 592** and **band H's head, 588 → 592.** Both cut a printed line in half:
  594 fell inside `LICENSE HOLDER CONTACT INFORMATION: This notice is being provided…` and 588 inside
  `limited to no more than 14 days.` Every band boundary was then re-checked for straddling; the rest
  are clean.
- **Video 1, Scene 4** — the parenthetical box, given as `x ≈ 300–481.8`, began inside the word
  `person`. Now the measured `x 237.7–481.8`.
- **Video 1, Scene 9** — one box over two whole lines swept in both the block label and the unrelated
  `Please acknowledge receipt…` sentence. Now two word-exact rectangles bounding only the narrated
  sentence.
- **Video 2, Scene 3** — the second cue cut off its sentence's opening words and swept in the
  unrelated `Even if a written agreement is not required…` sentence. Now three word-exact rectangles,
  the last around the single word `Code.`
- **Video 2, Scene 4** — condition 3's box ran to y 547.1, swallowing the conjunction `and` the form
  prints on a line of its own, which marked two things at once. Now stops at y 536.6; that printed
  `and` gets its own small box in the closing "all four" moment, where the narration talks about it.
- **Video 3, Scene 3** — the inner cue on `in conspicuous bold or underlined print` was estimated at
  `x ≈ 26.4–260`, marking only the phrase's second half plus five following words. The phrase
  straddles a line break, so it is now one cue in two word-exact rectangles.

### What could not be verified, and why

- **Highlight pixel coordinates.** Page-point space is as far as it is possible to go before a render
  exists; the conversion is measured on the delivered frames.
- **Caption timings.** They depend on audio that does not exist.
- **The rendered frames.** Nothing has been rendered, so no frame has been pixel-diffed against the
  held page. That check is a release gate, not a formality.

---

## 6. Equivalent written instruction — confirmed present, and named

Every one of these videos is **optional and non-blocking**. A student completes the Law of Agency
course, every module in it and every assessment in it without watching any of them. No progress gate,
no completion requirement, no assessment dependency, no autoplay. Each unit's equivalent written
instruction exists in the frozen curriculum, was checked by heading during this pass, and was not
abbreviated on account of a video.

| Video | Equivalent written instruction | Confirmed |
|---|---|---|
| 1 | `curriculum/module-02.md`, `## Unit: Information About Brokerage Services - Disclosure of Representation` (line 621) | Present. Teaches § 1101.558(b), (b-1) with its four content requirements, (b-2), all three (c) exceptions, and 22 TAC § 531.20 in full — the four delivery methods, the signature-block prohibition, the two homepage-link labels with their 10- and 12-point minimums, and the verbatim-reproduction rule |
| 2 | `curriculum/module-05.md`, `## Unit: The Creation of Buyer Agency` (line 356) **and** `## Unit: Buyer Representation Agreement` (line 26) | Present. Teaches § 1101.562(a)'s four conditions with the "orally or in writing" trap, (b)'s disclosure gate and its interaction with § 1101.558(c)(3), (c)'s confirm-only permission, § 1101.563 subsection by subsection, and § 1101.652(b)(34) |
| 3 | `curriculum/module-06.md`, `## Unit: Representation of More Than One Party in a Transaction` (line 457), with `## Unit: Intermediary Brokerage` (line 184) and `## Unit: The Path from Dual Agency to Intermediary Brokerage` (line 26) | Present. Teaches § 1101.559, § 1101.560 clause by clause, § 1101.561, and § 1101.651(d)(1)–(5) in full with every qualifier and all three lettered exceptions, including the condition-of-the-property exception |

Everything each video says is in that prose. Each adds sight of a document, a structure or a moment —
no video adds a proposition the reading lacks, and **no curriculum file was edited by this pass.**

---

## 7. Production status — plainly

**Nothing is rendered. Nothing is displayed. Nothing is active.**

| | Video 1 | Video 2 | Video 3 |
|---|---|---|---|
| Script, source-verified | Complete | Complete | Complete |
| Storyboard, scene by scene | Complete | Complete | Complete |
| Highlight targets, page-point space | Measured | Measured | Measured |
| HeyGen prompt | Complete | Complete | Complete |
| Placement | Confirmed against block map | Confirmed | Confirmed |
| Captions | Cue text final, timings provisional, on disk | Same | Same |
| Clean transcript | Complete | Complete | Complete |
| Poster spec | Complete | Complete | Complete |
| Accessibility notes | Complete | Complete | Complete |
| Registry entry | Written, commented **NOT ACTIVE** | Same | Same |
| Band PNGs / diagram panels | **Not built** | **Not built** | **Not built** |
| MP4 | **Not rendered** | **Not rendered** | **Not rendered** |
| Poster file | **Not built** | **Not built** | **Not built** |
| Shipping `.vtt` | **Not built** | **Not built** | **Not built** |
| Student-facing display | **None** | **None** | **None** |

There is no MP4, no `-poster.webp`, no shipping `.vtt` in `public/statecourse/media/`, and no config
entry for any of these three videos anywhere. Nothing in the course references them, links to them or
hints at them. There is no dead player, no nonfunctional poster, no decorative video badge, no
duration on any surface and no unavailable transcript. The only caption files that exist are the
provisional ones named in §4, which nothing serves and nothing references.

A video becomes active only when its MP4, poster, captions and transcript **all** exist and have
passed factual, visual and accessibility QC. None has.

**No claim of regulatory approval, anywhere.** Nothing in these videos, their captions, their posters,
their transcripts, their production files or this addendum states or implies that the videos, the
course, or StateCourse is approved, endorsed, reviewed or licensed by the Texas Real Estate
Commission. The form shown is the Commission's; the instruction wrapped around it is StateCourse's.

---

## 8. Open items — recorded, not resolved

1. **`config/texas/regulatory-manifest.mjs` is stale about the IABS form.** Source `trec-iabs-1-2`
   still carries `localCopy: null`, `sha256: null`, `revision: null`, and an open conflict
   `iabs-pdf-not-downloaded`. The PDF **is** held, hashed and inventoried. That file is owned by
   another agent and was not touched. It should be updated before these videos ship.
2. **Module 02 states the IABS form "was not held for this course."** True when written, no longer
   true. The curriculum is frozen and was not edited. It matters only because a reviewer comparing the
   module with the videos will see an apparent inconsistency; it is not an inconsistency of law.
3. **The Texas block-map generator has no `screenMedia` hook.** California attaches its videos through
   `scripts/lib/generate-ca-block-maps.mjs`'s `spec.screenMedia` mechanism, which merges a
   hand-authored media spec onto a generated screen by id and refuses to generate if the id is
   unknown. `scripts/lib/generate-tx-block-maps.mjs` has no equivalent, so there is today **no
   supported route** to attach a video to a Texas screen except hand-editing a generated file whose
   header forbids it. That hook is a prerequisite of activation. It is named here, not built here.
4. **The Law of Agency retrieval bank does not exist.** Every block map `-s3` screen names a
   `questionId` for a bank that has not been authored. The authoring conditions in each production
   file's §3 are the mechanism that keeps assessment separation real rather than nominal, and only
   whoever authors that bank can honour them.
5. **Render-time coordinates, caption timings and poster frames cannot be produced without a render.**
   All three are specified as far as it is possible to go and are labelled provisional or not-built.
   None was fabricated.
6. **The freeze is intact, and this pass leaves it so.**
   `node scripts/freeze-loa-curriculum.mjs` reports `freeze intact — LOA-CONTENT-FREEZE-2026-08-30-v2`.
   No curriculum file was edited. The one hashed artifact this pass did touch, the video instruction
   plan, was restored byte for byte: it is 29,239 bytes and hashes to
   `7ca7234853320ad96275c9a6c7e69a16e0a2ec2b63b6de2fd7ed62ed7f88e403`, the value the freeze holds.
   That restoration is why this addendum exists at all — see the opening section.

   Anyone re-running the freeze mid-flight may still see transient drift on
   `config/texas/law-of-agency-statute-sources.mjs`; that file is owned by another agent and was
   drifting independently while this pass ran. It is not this pass's, and it had cleared by the time
   this pass finished.
