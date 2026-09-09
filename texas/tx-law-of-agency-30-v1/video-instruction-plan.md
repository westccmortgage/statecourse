# Video Instruction Plan — Texas Law of Agency (30 hours)

**Course:** `tx-law-of-agency-30-v1`
**Course approval form:** LOA-1, revision 09/11/2024 — 12 topics, 57 units, 1,500 prescribed minutes.
Transcribed at `config/texas/law-of-agency-course-form.mjs`; held at `texas/trec-sources/LOA-1.pdf`.
**Plan date:** 2026-08-30
**Plan revision:** **v4 — 2026-09-08.** Plan v4 records the final reviewed IABS 1-2 render and its
optional activation at `t02u5-s1`. Videos 2 and 3 remain editorial packages only. The activation
changes no regulated time, narration, assessment, or approval claim. This plan still
supersedes plan v1, which is the byte-state
sha256 `7ca7234853320ad96275c9a6c7e69a16e0a2ec2b63b6de2fd7ed62ed7f88e403` (29,239 bytes).
**Plan v1 is SUPERSEDED.** It was correct when written and is wrong in three particulars now: its
three durations (which its own caption blocks contradicted), its statement that the Law of Agency
block maps did not exist, and its statement that the caption files existed only inside the production
files. All three are corrected throughout this file. v2 additionally consolidates into this plan the
corrections that had been made in the production files but recorded nowhere canonical — nine
narration repairs, one statutory repair and seven coordinate corrections — so that the plan and the
production files say the same thing. **Every one of them is itemised in §11.** A renderer works from
this file and the three production files, and from nothing else. v1's hash is preserved in
`video-plan-freeze.json` under `supersedes`, so anyone holding the old artifact can identify what
they hold.

**Freeze:** this plan and everything a render depends on are hashed by
**`LOA-VIDEO-PLAN-FREEZE-2026-09-08-v4`** (`texas/tx-law-of-agency-30-v1/video-plan-freeze.json`,
written by `scripts/freeze-loa-video-plan.mjs`). The curriculum freeze hashes *that artifact*, not
this file — so correcting a video no longer requires breaking a curriculum freeze. See §12.

**Overall status — four layers, and no layer borrows another's status:**

| Layer | Status |
|---|---|
| Editorial and legal package (script, prompt, storyboard, transcript, captions, coordinates, poster spec) | **READY** at `LOA-VIDEO-PLAN-FREEZE-2026-09-08-v4` |
| Rendered MP4 / shipping VTT / poster assets | **PARTIAL** — Video 1 complete; Videos 2 and 3 pending |
| `screenMedia` integration support in the Texas generator | **READY** — hook and eight acceptance tests pass |
| Course placement activation | **PARTIAL** — Video 1 active at `t02u5-s1`; Videos 2 and 3 inactive |

"Production-ready" is not a status this plan uses. See §6.

---

## 1. The principle this plan applies

StateCourse uses video selectively. A video earns its place only where seeing a document, a
relationship, a decision sequence, or an act of professional judgment materially improves
understanding over the written module. Video is never continuous coverage, never decoration, and
never a substitute for prose the student must be able to read instead.

Four candidates were put forward. Each was tested against the finished course map — the twelve
curriculum modules as written, the LOA-1 unit structure, and the held sources — with one question:
**does this teach something the module's prose cannot?** Three passed. One did not, and the reasoning
for rejecting it is recorded at the same length as the reasoning for accepting the others.

---

## 2. Candidate evaluation — every candidate, including the rejection

### Candidate 1 — IABS 1-2 Document Overview → **SELECTED**

**Decision: select.** This is the strongest candidate in the set, and it is the only one whose case
rests on a fact about the repository rather than on a judgment about pedagogy.

The Commission's Information About Brokerage Services notice is a physical, one-page artefact that a
Texas license holder hands to consumers for the rest of their career. It is now held, officially and
in full, at `texas/trec-sources/forms/IABS-1-2.pdf` (revision stamp 11-03-2025, one page, sha256
`5056930b…`, listed in `texas/trec-sources/source-inventory.json`).

Module 02 teaches the law of that notice completely and correctly — § 1101.558(b), (b-1), (b-2) and
(c), and 22 TAC § 531.20, with the four permitted delivery methods, the signature-block prohibition,
the two homepage-link labels and their two minimum font sizes, and the verbatim-reproduction rule. But
the module states, in terms, that **the form itself was not held when the module was written**, and it
therefore "does not reproduce or paraphrase the language printed on the form." The prose teaches the
rules *about* a document the student has never been shown.

That gap is exactly the gap video fills, and one rule in particular cannot be learned any other way.
Section 531.20 permits reproduction only if "the text of the IABS Notice is copied verbatim and the
spacing, borders and placement of text on the page must appear to be identical to that in the
published version," with prefilled Broker Contact Information the sole permitted deviation. That is a
rule about a visual artefact. A student who has never seen the published spacing, borders and
placement cannot apply it to the reformatted, logo-stamped, two-column version their brokerage's
software prints. This video is the only place in the course where the student sees what the rule
protects.

It also carries structural payload that reads flatly in prose and clearly on the page: the four
minimum duties, three running to the client and the fourth to all parties; the parenthetical
definition of "client" that the Act itself never supplies; the several licence-number rows that
explain why a completed notice carries more than one; and the sentence at the foot stating that the
notice "does not create an obligation for you to use the broker's services."

**Placement:** Module 02, T02U5, instruction screen `t02u5-s1` — confirmed against the live block
map (§5). **Duration:** ≈ 3:30, derived from the caption timeline (§3).
**Production file:** `video-production/iabs-1-2-document-overview.md`.

---

### Candidate 2 — Representation vs Non-Representation in 2026 → **SELECTED**

**Decision: select**, with the scope narrowed and the title changed to *Representation or Showing
Only: the 2026 decision*, because the candidate as proposed was a topic rather than a video.

The case for it is not that the material is important — importance alone never justifies video. It is
that this material is a **sequence against a clock**, and ordering is what prose is worst at. The
student must choose a posture, paper it, make the correct disclosure, and only then show property,
saying almost nothing while they do. Module 05 states every one of those rules accurately, but it
states them as rules; the student is left to assemble the order of operations themselves, and the
order is precisely where new license holders fail. § 1101.563(b) fixes two moments — before showing
any residential real property, or, if none will be shown, before presenting an offer — and
§ 1101.562(b) inserts a gate before both, whose branch turns on whether the broker represents the
owner. A decision panel and a document walk in narrative order do that work; a page of correct prose
does not.

The second thing this video does that text cannot is the closing scene. § 1101.562(a)(3) forbids
opinions and advice, and § 1101.562(c) permits only confirmation of size, price and terms. The failure
mode is not paperwork — it is answering one friendly question in a hallway. The module says so, in
prose, and even supplies a rehearsed sentence. A rehearsed sentence delivered to camera by a person,
at conversational pace, is a different instructional object from the same sentence set in italics in
the middle of a page. That is a genuine act of professional judgment, and it is the one moment in
these three videos where the avatar is doing work no still frame could do.

**Guard against overlap.** This video and Candidate 1 both use the held IABS form, so their scopes
were divided rather than allowed to collide. Video 1 walks the page as a document and explicitly
*hands forward* the two blocks it does not teach. This video teaches those two blocks — `WRITTEN
AGREEMENTS ARE REQUIRED IN CERTAIN SITUATIONS` and `A LICENSE HOLDER CAN SHOW PROPERTY … WITHOUT
REPRESENTING …` — and nothing else from the form. No block of the document is taught twice. This is
the same discipline the Loan Estimate series used across three pages of one document.

**Placement:** Module 05, T05U3, instruction screen `t05u3-s1` — confirmed against the live block
map (§5). **Duration:** ≈ 3:03, derived from the caption timeline (§3).
**Production file:** `video-production/representation-or-showing-only-2026.md`.

---

### Candidate 3 — Texas Intermediary Brokerage → **SELECTED**

**Decision: select.**

Two independent reasons, either of which would carry it.

First, it is a **relationship structure with two configurations that differ in exactly one variable**.
Intermediary without appointments and intermediary with appointments are identical in confidentiality
— § 1101.651(d) governs both, and binds appointees exactly as it binds the broker — and differ only in
advice. Prose must say that serially: describe configuration one, describe configuration two, then
assert in a later paragraph that confidentiality did not change. Module 06 does exactly that, and does
it well, and the assertion still arrives two pages after the thing it is asserting about. A side-by-
side panel holding the two configurations in one frame, with a single shared bar beneath both reading
that confidentiality is identical, makes the point in a glance. The glance is what makes it stick.

Second, it is **corrective**. Students arrive carrying "dual agency" from national exam material, and
the vocabulary is not a stylistic preference: Chapter 1101 contains no such capacity, and a Texas
license holder who describes themselves as a dual agent has named a role Texas law does not create.
Module 06 opens by saying so. A spoken instruction to put the phrase down, in the first ten seconds,
from a presenter, does corrective work that a sentence in the middle of a page does not — this is the
one place in the course where the student's prior knowledge is actively wrong rather than merely
absent.

The video is anchored on the real document as well as on diagrams: the `AS AGENT FOR BOTH -
INTERMEDIARY` block of the held IABS form prints the written-consent requirement, the impartiality
duty, the appointment sentence, and the three non-disclosure items in the consumer's own words. That
keeps the video from becoming a motion-graphics piece, and it sets up the closing judgment point,
which is that the notice is a *summary* — the statute carries qualifiers the form does not print,
including that confidentiality never covers information materially relating to the condition of the
property.

**Placement:** Module 06, T06U3, instruction screen `t06u3-s1` — confirmed against the live block
map (§5). **Duration:** ≈ 3:20, derived from the caption timeline (§3).
**Production file:** `video-production/intermediary-brokerage.md`.

---

### Candidate 4 — Client, Customer, and Fiduciary Duties → **REJECTED**

**Decision: reject.** Four reasons, in descending order of weight.

**It is a taxonomy, and taxonomy is what prose does best and video does worst.** The candidate's own
description is a list of definitions and a list of duties: who is the client, who is the customer,
which duties are fiduciary, which are owed to all parties. There is no document to read, no sequence
in time, no branch, and no relationship in motion — the three things that make a StateCourse video
earn its place. Narrating a list of six fiduciary duties over a static card is the textbook decorative
video, and it is slower, less searchable and less accessible than the table or the prose that carries
the same list. The honest instructional form for a taxonomy is text the student can re-read at their
own pace and scan back to during a later module. Module 01's T01U3 already is that text, and it closes
with an explicit "putting the vocabulary together" paragraph that does the consolidation a video would
be attempting.

**The material's most interesting fact is a negative one, which video handles badly.** The Real Estate
License Act defines neither "client" nor "customer"; the word "customer" does not appear in Chapter
1101 at all. Module 01 makes that its opening move and builds the whole unit on it, correctly, by
teaching the statutory machinery — § 1101.557(a), § 1101.551(2), § 1101.562, 22 TAC § 531.2, 22 TAC
§ 535.156 — and letting the vocabulary follow. A video cannot show an absence. It would have to assert
it, which is exactly the form of claim a student should meet in a citable sentence they can check
against the held statute, not in narration they cannot pause and verify.

**The visual payload it does have is already delivered, better, by the three selected videos.** The
client/customer distinction's single best visual is the IABS form's own duties block — the heading
`A BROKER'S MINIMUM DUTIES REQUIRED BY LAW (A client is the person or party that the broker
represents)`, followed by three bullets running to the client and a fourth running to all parties.
Video 1 shows exactly that on the real document, with the third and fourth bullets highlighted in
sequence, and states the conclusion the taxonomy exists to reach: representation decides advocacy, not
honesty. The customer's statutory shape — the § 1101.562 non-representation posture — is Video 2's
entire subject. The client-on-both-sides problem is Video 3's. A fourth video would be assembling
material the other three have already shown, without a document or a structure of its own.

**Four videos would dilute three good ones.** Two to four focused videos beat four mediocre ones, and
the marginal video here is the weakest of the set by a clear distance. Rejecting it keeps the series
at three, each anchored on a distinct block of one real document, each teaching something the prose
demonstrably cannot.

**What replaces it.** Nothing needs to. Module 01's T01U3 already carries the material in full, and
the T01U3 retrieval item is the right instrument for checking it. If a later review finds students
failing on client/customer, the fix is a comparison table on the T01U3 instruction screen — cheap,
accessible, searchable, printable — not a video.

---

## 3. The three selected videos

| # | Video | Topic · Unit | Module · screen | Duration | What it does that text cannot |
|---|---|---|---|---|---|
| 1 | **IABS 1-2 Document Overview** | T02 · T02U5 | Module 02, instruction screen `t02u5-s1` | ≈ 3:30 | Shows the held official form. § 531.20's verbatim/spacing/borders reproduction rule is a rule about a visual artefact, and Module 02 states it while expressly declining to reproduce the form's language. The student cannot apply the rule without seeing what it protects. |
| 2 | **Representation or Showing Only: the 2026 decision** | T05 · T05U3 | Module 05, instruction screen `t05u3-s1` | ≈ 3:03 | Puts a branching decision into its real order of operations — choose posture, paper it, make the right disclosure, then show — and delivers the hallway sentence as an act of professional judgment rather than as italicised prose. |
| 3 | **Texas Intermediary Brokerage** | T06 · T06U3 | Module 06, instruction screen `t06u3-s1` | ≈ 3:20 | Holds both configurations in one frame so the constant (confidentiality) and the variable (advice) are visible together, and corrects "dual agency" spoken, up front, where prior knowledge is actively wrong. |

**Total optional video time across the whole 30-hour course: ≈ 9 minutes 53 seconds.**

**Where these numbers come from, and why they are not asserted twice.** Every duration in this plan
and in the three production files is **derived from that video's caption file** — the cue timeline in
`video-production/captions/tx-*.provisional.vtt`. A scene's duration is the end of its last cue minus
the start of its first, and a video's duration is the end of its last cue. The scene is matched to its
cues by comparing the scene's narration against the cue text, so the two cannot drift apart without
the match failing. `scripts/validate-loa-video-packages.mjs` check 3 recomputes all of it from the
caption files and fails on any disagreement.

The cue timings themselves are provisional — computed at 150 words per minute, the delivery rate of
the existing series, with a 1.4-second readability floor on very short cues — so every duration
resting on them is provisional too. **None is a measurement.** They are replaced by measured durations
after each render arrives, and no student-facing or reviewer-facing surface states a duration until it
has been measured.

**These figures moved in plan v2, and here is why.** v1 gave ≈ 3:01 / 2:53 / 3:10, total ≈ 9:04. Two
things were wrong with that. The nine narration repairs recorded in each production file's §14
restored the form's and the statute's full printed wording where earlier drafts had compressed it, and
full wording takes longer to say. And v1's own figures were internally inconsistent: Video 1's scene
table totalled 3:01 while Video 1's own caption block ran to 3:17. Deriving every figure from one
source removed the possibility of that inconsistency rather than correcting one instance of it.

**No time budget changed.** The ≈ 9 minutes 53 seconds sit entirely outside LOA-1's prescribed 1,500
minutes — see the closing subsection of §7. T02U5 keeps its 20 prescribed minutes, T05U3 its 30 and
T06U3 its 30. No figure in `config/texas/law-of-agency-time-budget.mjs` was read as changeable, none
was changed, and none was reduced to make room for a video.

### One document, divided three ways

All three videos are anchored on the same held one-page form,
`texas/trec-sources/forms/IABS-1-2.pdf`, each taking a different block for a different job. No block
is taught twice.

| Band | Content | Taught by | Shown-but-not-taught by |
|---|---|---|---|
| A | Revision stamp, title, the "Texas law requires…" statement | Video 1 | — |
| B | TYPES OF REAL ESTATE LICENSE HOLDERS | Video 1 | — |
| C | A BROKER'S MINIMUM DUTIES REQUIRED BY LAW | Video 1 | — |
| D | WRITTEN AGREEMENTS ARE REQUIRED IN CERTAIN SITUATIONS | Video 2 | Video 1 (located only) |
| E | A LICENSE HOLDER CAN REPRESENT A PARTY — owner, buyer/tenant | Video 1 | — |
| F | AS AGENT FOR BOTH - INTERMEDIARY | Video 3 | Video 1 (located only) |
| G | SHOW PROPERTY WITHOUT REPRESENTING THE BUYER/TENANT | Video 2 | Video 1 (located only) |
| H | LICENSE HOLDER CONTACT INFORMATION, contact rows, initials, footer | Video 1 | — |

This mirrors the Loan Estimate series, which took three pages of one document across three videos.

---

## 4. Document handling — the rules this plan is built to satisfy

The held form is the only permitted source of document pixels. It is never recreated, re-typeset,
re-flowed, recoloured, logo-stamped, filled in, or regenerated by any model, in whole or in part. No
field, date, party, amount, licence number or line of form language is invented anywhere in these
three productions.

**How the zoom happens without a camera.** Every prior attempt in this series to make the generator
zoom or crop an uploaded document failed (see `california/video-production/deed-of-trust-prompt.md`).
The zoom therefore happens deterministically *before* upload: the held page is rasterised with pdfium
at 288 dpi and cropped on section boundaries at coordinates measured from the PDF's own text lines
with `pdfplumber`, then composed onto a warm-ivory 1920 × 1080 ground. The generator only holds a
still. It draws nothing, moves nothing, and generates nothing.

Every band composes to less than the full frame height, so the highlighted provision is always fully
inside the frame, no relevant heading is ever cropped, and the ivory margin left over is where margin
labels go — never across document text.

**Every band edge lands in interline whitespace — verified with `pdfplumber.extract_text_lines()`,
not assumed.** Two boundaries given in earlier drafts cut a printed line in half and are corrected in
`iabs-1-2-document-overview.md` §5.1: **band G's foot moved 594 → 592** (594 fell inside the printed
line `LICENSE HOLDER CONTACT INFORMATION: This notice is being provided…`, y 593.2–603.1) and **band
H's head moved 588 → 592** (588 fell inside `limited to no more than 14 days.`, y 579.0–589.0). The
corrected values are the ones in that table and the ones anyone rebuilding the crops must use. Every
remaining boundary was re-checked for straddling and is clean.

**A third crop defect was found by the validator, after the corrections above, and is corrected in
the same table: the x window `x1 = 592` → `x1 = 600`.** Every earlier draft gave one x window for
every band, `x0 = 20, x1 = 592`, described as "the full text column". It is not. The page's footer
line — `Regulated by the Texas Real Estate Commission Information available at www.trec.texas.gov
IABS 1-2` — runs to **x 599.2**, so a crop stopping at 592 clipped it, and what it clipped included
**the form number itself**. Band H is the frame on which Video 1 reads the foot of the page, so the
loss would have been on screen. The band window now runs to 600; `iabs-full.png` takes the whole
612-point media box, which is what "whole page" always meant. The composed scale factor moves with it
(0.7255 → 0.7155) and the band pixel heights in §5.1 are recomputed. **This one was not in the
addendum** — it was found by `scripts/validate-loa-video-packages.mjs` check 4b, which now tests every
printed line inside a band against that band's own x window on every run.

**Highlights are post-production**, burned in at pixel coordinates measured on the delivered render's
own frames, using the series tool `california/video-production/post-highlights.py`: brick-red outline
boxes and navy vector margin labels. Each production file carries its highlight targets in PDF-point
space, measured from the held document; those are converted to render pixels once the render exists.
Cues are sequential — one new concept at a time — with the two documented exceptions (a refinement of
the same provision, and one closing "all four, joined by *and*" frame) flagged and justified in the
scene notes.

**Every highlight target is a measured bounding box, not an estimate**, and a provision that straddles
a line break is drawn as one cue in two or three word-exact rectangles rather than as one loose box
that would sweep in text the narration is not reading. Four targets given in earlier drafts did sweep
in text, or cut a word, and are corrected in the production files:

| Where | Was | Now |
|---|---|---|
| Video 1, Scene 4 | the parenthetical box at `x ≈ 300–481.8`, which began inside the word `person` | measured `x 237.7–481.8` — from the left edge of `(A` to the right edge of `represents):` |
| Video 1, Scene 9 | one box over two whole printed lines, sweeping in the block label and the unrelated `Please acknowledge receipt…` sentence | two word-exact rectangles bounding only the narrated sentence |
| Video 2, Scene 3 | one box over two whole printed lines, cutting off the sentence's opening words and sweeping in the unrelated `Even if a written agreement is not required…` sentence | three word-exact rectangles, the last around the single word `Code.` |
| Video 2, Scene 4 | condition 3's box running to y 547.1, swallowing the conjunction `and` the form prints on a line of its own — marking two things at once | stops at y 536.6; that printed `and` gets its own small box in the closing "all four" moment, where the narration talks about it |
| Video 3, Scene 3 | the inner cue on `in conspicuous bold or underlined print` estimated at `x ≈ 26.4–260`, marking only the phrase's second half plus five following words | one cue in two word-exact rectangles, `x 487.7–582.5, y 382.9–392.8` and `x 26.4–95.1, y 393.2–403.2` |

Together with the two band-boundary corrections above, that is **six coordinate corrections**.
`scripts/validate-loa-video-packages.mjs` checks 4 and 5 re-derive every rectangle against the held
PDF's own word boxes and fail on any rectangle that cuts a printed word or reaches into a line the
narration is not reading.

**Diagram panels are not the document.** Videos 2 and 3 use four StateCourse-authored panels for
relationships and branches. They carry only StateCourse labels and statutory section numbers. No
sentence of form language is typeset into a diagram, and no diagram is ever composed to resemble the
form.

---

## 5. Assessment separation

Each video attaches to its unit's **instruction** screen and sits two screens ahead of that unit's
retrieval check, with the unit's practice screen in between.

| Video | Attaches to | Then | Then |
|---|---|---|---|
| 1 | `t02u5-s1` instruction | `t02u5-s2` applied exercise | `t02u5-s3` retrieval |
| 2 | `t05u3-s1` instruction | `t05u3-s2` statute reading exercise | `t05u3-s3` retrieval |
| 3 | `t06u3-s1` instruction | `t06u3-s2` statute reading exercise | `t06u3-s3` retrieval |

No video contains a quiz question, a self-test, a poll, an answer or an answer recap. No answer is
revealed immediately before a retrieval check. No highlight is left on screen while the student is
asked to retrieve anything — every video ends on the avatar, with no document and no panel on screen.
Every closing scene is a synthesis or a judgment point, not an answer key.

Each production file additionally records an **authoring condition on the retrieval item** for its
unit, naming propositions the retrieval item must avoid because the video states them, and naming
better targets drawn from the module's prose. Retrieval items are authored elsewhere; these conditions
are the constraint that keeps the separation real rather than nominal.

**Screen ids are confirmed references, not reservations — corrected in plan v2.** v1 said no
`law-of-agency-module-*-blocks.mjs` existed and the ids were reserved against the Principles I
convention. The maps have since been generated by
`scripts/generate-tx-law-of-agency-block-maps.mjs` from the frozen modules' own headings, and **every
screen id above exists, with the type, title and content range this plan predicted**:

| Video | Block map | Instruction screen and its content range |
|---|---|---|
| 1 | `config/texas/law-of-agency-module-2-blocks.mjs` | `t02u5-s1`, type `instruction`, `RANGE("## Unit: Information About Brokerage Services - Disclosure of Representation", "### Applied exercise: Four conversations in Corpus Christi")` |
| 2 | `config/texas/law-of-agency-module-5-blocks.mjs` | `t05u3-s1`, type `instruction`, `RANGE("## Unit: The Creation of Buyer Agency", "### Statute reading exercise: § 1101.562 and the four conditions")` |
| 3 | `config/texas/law-of-agency-module-6-blocks.mjs` | `t06u3-s1`, type `instruction`, `RANGE("## Unit: Representation of More Than One Party in a Transaction", "### Statute reading exercise: The mechanics of appointment")` |

Each video plays at the **foot** of its instruction screen, after the whole of that screen's content
range — after the module paragraph beginning "**The habit to build.**" (Video 1), "**Subagency.**"
(Video 2) and "**Two more constraints that survive the intermediary posture.**" (Video 3). All three
anchor paragraphs were checked against the frozen modules and are the last paragraph before the
following exercise heading.

**Retrieval happens on a separate screen, and the video is not on it.** Each unit's `-s3` screen is
generated as `{ id, sequence, type: "retrieval", title: "Retrieval check", questionId }` and carries
**no `content` range and no media field of any kind**. It is a different screen from `-s1`, reached
after `-s2`. When the student reaches it the video, the highlighted form and the five visible answers
are no longer displayed: they belong to `-s1`, which is two screens behind. That separation is a
property of the generated screen shape, not a convention anyone must remember to honour, and
`scripts/validate-loa-video-packages.mjs` re-derives it from the block maps.

**Only Video 1 is wired.** The block maps remain generated files carrying "Do not edit by hand —
regenerate". A hand-authored registry supplies Video 1 to `t02u5-s1` only after its four shipping
assets and review approvals passed. Videos 2 and 3 remain absent. The retrieval screens carry no
media — see §10.3.

---

## 6. Honesty about production status

**Video 1 is rendered and active. Videos 2 and 3 are not rendered or active.**

**Status is reported in four layers, and no layer borrows another's status.**

| Layer | Status | What that means |
|---|---|---|
| **Editorial and legal package** | **READY** | All three scripts, prompts, storyboards, transcripts, caption cue text, coordinates, duration metadata and poster specifications are complete and source-verified. |
| **Rendered MP4 / VTT / poster assets** | **PARTIAL** | Video 1 has a complete MP4, shipping VTT, transcript and poster. Videos 2 and 3 remain unrendered. |
| **`screenMedia` integration support** | **READY** | `scripts/lib/generate-tx-block-maps.mjs` now validates exact placement, optional/non-blocking status, complete assets, measured duration, shipping captions, explicit transcript, assessment separation and completed factual/visual/accessibility/logo-safety reviews before generating any media reference. |
| **Course placement activation** | **PARTIAL** | Video 1 is active at `t02u5-s1`. Videos 2 and 3 have no block-map or shipping-media reference. |

**The editorial layer being READY says nothing about the other three.** A package that is
editorially ready and unrendered is not "production-ready", and this plan does not use that phrase.

For all three videos the editorial state is complete. The delivery state differs:

- script **complete**
- HeyGen production prompt **complete**
- assets **listed** — the held PDF, the band crops to be built from it, the diagram panels to be built
- placement **fixed** — module, unit and screen named
- Video 1: **rendered, reviewed, and displayed as optional/non-blocking media**
- Videos 2 and 3: **not yet rendered and therefore not displayed**

Video 1 has one exact four-asset shipping set and one generated placement. The generator verified
those assets before writing the map, so the placement cannot become a partial or dead player.
Videos 2 and 3 have no MP4, shipping VTT, poster, transcript, config entry, or UI marker.

Video 1's active registry entry lives in `config/texas/law-of-agency-screen-media.mjs`. The remaining
production files retain commented **NOT ACTIVE** examples until their final assets are verified.

**Caption files exist on disk — corrected in plan v2.** v1 said the caption files existed only inside
the production files. Real, well-formed WebVTT files are now written:

| Video | Caption file | Cues |
|---|---|---|
| 1 | `video-production/captions/tx-iabs-1-2-document-overview.provisional.vtt` | 39 |
| 2 | `video-production/captions/tx-representation-or-showing-only-2026.provisional.vtt` | 33 |
| 3 | `video-production/captions/tx-intermediary-brokerage.provisional.vtt` | 34 |

Each has a `WEBVTT` header, monotonic non-overlapping cues, no empty cue and no line over 90
characters, and each is byte-identical to the `vtt` block in its production file's §8.

**Cue text is final.** Every cue matches the recorded script word for word, and every fragment that
reads the held form or the held statute is verified against the source character by character.

**Cue timings are provisional, and each file says so in its own first `NOTE` block** — computed at 150
wpm, no render exists, and they must be rebuilt from the delivered render's own audio by silence-gap
detection cross-validated against word-count pacing before the file ships. The cue text does not
change when that happens; only the timestamps do.

They are written to `video-production/captions/` and **deliberately not** to
`public/statecourse/media/`, and their filenames carry `.provisional`. A caption file sitting at its
shipping path with invented timings is the kind of thing that gets shipped by accident; one sitting in
the production directory under a name that says what it is, is not. Posters likewise are frames of a
render that does not exist; they cannot be composed by hand and must not be.

**No claim of regulatory approval, anywhere.** Nothing in these videos, their captions, their posters,
their transcripts or their surrounding screens states or implies that the videos, the course, or
StateCourse is approved, endorsed, reviewed or licensed by the Texas Real Estate Commission. The form
shown is the Commission's; the instruction wrapped around it is StateCourse's.

---

## 7. Optional and non-blocking

**Every one of these videos is optional. A student must be able to complete the Law of Agency course,
every module in it, and every assessment in it, without watching any of them.** No progress gate, no
completion requirement, no assessment dependency, no autoplay.

**Equivalent written instruction already exists for each, and none of it was abbreviated to make room
for a video.** Named precisely:

| Video | Equivalent written instruction | What the prose covers |
|---|---|---|
| 1 — IABS 1-2 | `curriculum/module-02.md`, `## Unit: Information About Brokerage Services - Disclosure of Representation` | § 1101.558(b) representation disclosure; (b-1) written notice with its four content requirements; (b-2); all three (c) exceptions with both elements of the first; 22 TAC § 531.20 in full — adoption of IABS 1-2 by reference, the two homepage-link labels and their 10-point and 12-point minimums, the business-website definition, all four permitted delivery methods, the footnote/signature-block prohibition, and the verbatim-reproduction rule with its single permitted deviation |
| 2 — Representation or showing only | `curriculum/module-05.md`, `## Unit: The Creation of Buyer Agency` **and** `## Unit: Buyer Representation Agreement` | § 1101.562(a)'s four conditions with the "orally or in writing" trap; (b)'s disclosure gate and its interaction with § 1101.558(c)(3); (c)'s confirm-only permission; § 1101.563(a)'s three-part definition, both (b) triggers, all five (c) contents plus the negotiability disclosure, (d)'s separate-agreement rule, (e)'s non-exclusive and fourteen-day limits; § 1101.652(b)(34); the repeal of the subagency references |
| 3 — Intermediary brokerage | `curriculum/module-06.md`, `## Unit: Representation of More Than One Party in a Transaction`, with `## Unit: Intermediary Brokerage` and `## Unit: The Path from Dual Agency to Intermediary Brokerage` | § 1101.551(1); § 1101.559(a), (b) with the conspicuousness-not-point-size point, and (c); § 1101.560(a), (b) with the force of "only if", and (c) with its scope limits; § 1101.651(d)(1)–(5) in full with every qualifier and all three lettered exceptions including the condition-of-the-property exception; § 1101.561(a) and (b); why Texas vocabulary is not "dual agency"; the distinct meaning of "dual capacity" in § 1101.652(b)(16) |

Everything each video says is present in that prose. Each video adds sight of a document, a structure
or a moment — it adds no proposition the reading lacks.

### Optional video time is not counted toward the required 1,500 minutes

LOA-1 prescribes 1,500 minutes for this course and `config/texas/law-of-agency-time-budget.mjs`
apportions every one of them across activity minutes and reading minutes, topic by topic. **The
≈ 9 minutes 53 seconds of optional video in this plan sit outside that budget entirely.** They are not
counted toward the 1,500, they do not appear in the time budget, and no figure in the time budget was
reduced to make room for them. T02U5 keeps its 20 prescribed minutes, T05U3 its 30, and T06U3 its 30,
all spent on reading and activity minutes exactly as budgeted before this plan existed. A student who
watches all three videos spends about ten minutes more than the course requires; a student who watches
none has completed the same 1,500 minutes.

---

## 8. Production files

| File | Video |
|---|---|
| `texas/tx-law-of-agency-30-v1/video-production/iabs-1-2-document-overview.md` | 1 — IABS 1-2 Document Overview |
| `texas/tx-law-of-agency-30-v1/video-production/representation-or-showing-only-2026.md` | 2 — Representation or Showing Only: the 2026 decision |
| `texas/tx-law-of-agency-30-v1/video-production/intermediary-brokerage.md` | 3 — Texas Intermediary Brokerage |

Each carries: learning objective · LOA-1 topic and unit · exact planned placement · source list · the
document asset path · scene-by-scene structure · exact narration · on-screen text · visual directions
· document-highlight instructions in measured page-point coordinates · a HeyGen-ready production
prompt · a caption-ready transcript with provisional timings · a clean transcript · a poster
specification · the optional/non-blocking configuration and current activation state · production status · and
an accessibility checklist.

---

## 9. Build order, when someone renders these

The three videos share one asset build. Do it once.

1. **Build the nine band PNGs** from `texas/trec-sources/forms/IABS-1-2.pdf` per
   `iabs-1-2-document-overview.md` §5.1 — pdfium at scale 4, crops at the PDF-point boundaries given
   there, composed to 1920 × 1080 on warm ivory. Verify each crop by pixel-diff against an independent
   rasterisation of the same page: a crop must be a copy of the page, never a re-render of its text.
2. **Build the four diagram panels** per Video 2 §5.2 and Video 3 §5.2 — reportlab vector art, series
   palette and typeface, StateCourse labels and section numbers only, no form language.
3. **Video 1 is complete. Render Video 2, then Video 3**, each with its own §7 prompt and its own
   subset of the assets. Both may now refer to the notice the student has already seen.
4. **Verify each render**: pixel-diff every document hold; any drift, zoom, overlay or colour shift is
   a reject-and-re-render, not a fix in post.
5. **Measure**, convert each production file's page-point highlight targets to render pixels, write the
   per-video highlights JSON, and run `california/video-production/post-highlights.py`.
6. **Re-encode** to the series bitrate profile; **build the VTT** from the final render length;
   **extract the poster** from the frame each production file names.
7. **Only then** attach each production file's media entry to the LOA block map through the now-built
   generator `screenMedia` hook (§10.3). **Do not hand-edit a
   generated block map**; its own header forbids it, and a hand edit is erased by the next
   regeneration.

Before step 1 and again after step 6, run:

```
node scripts/validate-loa-video-packages.mjs      # eight checks over the canonical package
node scripts/freeze-loa-video-plan.mjs            # verify LOA-VIDEO-PLAN-FREEZE-2026-09-08-v4
```

The validator refuses to pass if narration, transcript, captions and prompt have drifted apart, if any
duration stops deriving from the caption timeline, if any crop or highlight rectangle cuts printed
form language, if any of the 50 form strings stops verifying against the held PDF, or if any
correction exists only in the review addendum. The freeze script refuses to write over a failing
validator.

---

## 10. Open items — things needed and not obtainable here

These are recorded, not resolved. Two of them touch files this plan is not permitted to edit.

1. **`config/texas/regulatory-manifest.mjs` is stale about the IABS form, and this plan cannot fix
   it.** Source `trec-iabs-1-2` still carries `localCopy: null`, `sha256: null`, `revision: null`, and
   an open conflict `iabs-pdf-not-downloaded` reading "The IABS 1-2 PDF itself has not yet been
   downloaded and hashed." The PDF **is** now held, at `texas/trec-sources/forms/IABS-1-2.pdf`, with
   sha256 `5056930b66d237a7a4376db0c43f833929600f0b6e5ce6e42a417da824ef6b20`, 1,491,257 bytes, already
   recorded in `texas/trec-sources/source-inventory.json`, and it carries a revision stamp of
   11-03-2025. That file is owned by another agent and was not touched. The manifest entry should be
   updated — `localCopy`, `sha256`, `bytes`, `revision: "11-03-2025"` — and the conflict resolved,
   before these videos ship.

2. **Module 02 states that the IABS form "was not held for this course."** That sentence was true when
   the module was written and is no longer true. The curriculum is frozen for quotation review by
   another agent and was not edited. It matters here for one reason only: the videos quote the form's
   printed wording, which the module declines to do, and a reviewer comparing the two will see an
   apparent inconsistency. It is not an inconsistency of law — nothing the videos say contradicts the
   module — but the module's sentence should be revisited when the quotation review releases it.

3. **RESOLVED 2026-09-07 — the Texas block-map generator now has the validated `screenMedia` hook.**
   *(This item replaces v1's item 3, "the Law of Agency block map does not exist" — that one is
   **RESOLVED**: all twelve maps exist and every placement in §5 is confirmed against them.)*
   `scripts/lib/generate-tx-block-maps.mjs` now merges a hand-authored media spec onto an exact
   generated instruction-screen id and refuses unknown or retrieval screens. It requires
   `required:false`, `nonBlocking:true`, a no-assessment review, a measured duration, non-provisional
   captions, explicit transcript, complete non-empty MP4/poster/VTT/transcript assets and recorded
   factual, visual, logo-safety and accessibility review before it writes the block map. Eight tests
   in `tests/texas-video-integration.test.mjs` exercise those refusal paths. The hook remains dormant:
   the three videos are still unrendered and no course media entry is active.

4. **The Law of Agency retrieval bank does not exist.** Every block map `-s3` screen names a
   `questionId` for a bank that has not been authored. Each production file's §3 records an authoring
   condition on its unit's retrieval item, naming the propositions the item must avoid because the
   video states them and naming better targets from the module's prose. Those conditions are the
   mechanism that keeps assessment separation real rather than nominal, and only whoever authors that
   bank can honour them.

5. **Render-time coordinates cannot be produced without a render.** Highlight boxes must be measured
   on the delivered frames. This plan supplies every target in the held document's own coordinate
   space, measured with `pdfplumber`, which is as far as it is possible to go before the MP4 exists.
   Nothing has been rendered, so no frame has been pixel-diffed against the held page either. That
   check is a release gate, not a formality.

6. **Caption timings and poster frames likewise depend on a render that does not exist.** Both are
   specified and both are labelled provisional or not-yet-built. Neither was fabricated.

---

## 11. Plan v2 revision log — every correction consolidated, and where it landed

Plan v1 (sha256 `7ca7234853320ad96275c9a6c7e69a16e0a2ec2b63b6de2fd7ed62ed7f88e403`) is **SUPERSEDED**.
Its defects were found during a source-fidelity pass and were first recorded in
`video-production/production-readiness-addendum.md`. **That addendum is review history and is no
longer an operational dependency: everything a renderer needs is in this plan and the three production
files.** `scripts/validate-loa-video-packages.mjs` check 7 diffs the addendum's corrections against the
canonical files and fails if any of them exists only there.

### Narration repairs — nine places where narration read the form but had drifted from its printed wording

Each was repaired in **all four representations together** — the scene narration (§6 of the production
file), the HeyGen production prompt (§7), the caption cue text (§8 and the on-disk `.vtt`) and the
clean transcript (§9) — and the durations recomputed from the repaired caption timeline.

| # | Video · Scene | The qualifier that was missing | Now reads |
|---|---|---|---|
| 1 | 1 · Scene 1 | the form's recipients and its own verb | "Texas law requires **all** real estate license holders to give **the following information** about brokerage services **to prospective buyers, tenants, sellers and landlords**." |
| 2 | 1 · Scene 4 | the three client bullets, compressed to noun phrases | read as printed, including "**including the broker's own interests**" and "present any offer to or counter-offer from the client" |
| 3 | 1 · Scene 6 | `property` and `in` | "the broker becomes the **property** owner's agent … usually **in** a written listing to sell or property management agreement" |
| 4 | 1 · Scene 7 | the dropped subject, and a demonstrative the form does not print | "**the broker becomes the buyer or tenant's agent** by agreeing to represent the buyer, usually through a written representation agreement" · "**fees** are not set by law and are fully negotiable" |
| 5 | 2 · Scene 3 | the form's own relative clause and both triggers | "A license holder **who performs** brokerage activity … **before showing any residential property to the buyer or if no residential property will be shown, before presenting an offer on behalf of the buyer**." |
| 6 | 2 · Scene 4 | the four conditions' objects and one statutory qualifier | condition 1 now carries "**either orally or in writing**"; conditions 2, 3 and 4 now name "the buyer or tenant" as the form does |
| 7 | 2 · Scene 5 | the code the section belongs to | "…required by section 1101.563 **of the Texas Occupations Code**." |
| 8 | 3 · Scene 4 | the bullet's closing object | "…and carry out the instructions of each party **to the transaction**." |
| 9 | 3 · Scene 6 | **the statutory exception**, plus two qualifiers | "and any confidential information **or any other information** that a party **specifically** instructs the broker in writing not to disclose, **unless required to do so by law**." |

**Repair 9 is the most consequential of the set.** The earlier line dropped *unless required to do so
by law* from a confidentiality rule **while the highlight box around that sub-bullet was showing the
student that very exception on the page** — narration and image contradicting each other on a point of
law. The narration now reads the provision whole.

A **tenth** repair, against the held statute rather than the form, is recorded in
`intermediary-brokerage.md` §14 and consolidated on the same terms: Video 3 Scene 2 now reads
§ 1101.561(b) as enacted — "a broker must agree to act as an intermediary **under this subchapter** if
the broker agrees to **represent in a transaction** a buyer or tenant and a seller or landlord". The
count of *nine* is the count of places narration was reading **the form**; this one was reading the
statute. Both counts are stated rather than merged, because a reviewer checking either number should
find it.

### Coordinate corrections — six

Two band-crop boundaries and four highlight rectangles. All six are itemised with their before and
after in §4 above, and are carried in the production files' §5.1 (crops) and §6 (highlights).

| # | Kind | Correction |
|---|---|---|
| 1 | Crop | band G foot 594 → **592** — 594 fell inside the printed `LICENSE HOLDER CONTACT INFORMATION:` line |
| 2 | Crop | band H head 588 → **592** — 588 fell inside `limited to no more than 14 days.` |
| 3 | Highlight | Video 1 Scene 4 — `x ≈ 300–481.8` began inside the word `person`; now `x 237.7–481.8` |
| 4 | Highlight | Video 1 Scene 9 — one box over two whole lines swept in the block label and `Please acknowledge receipt…`; now two word-exact rectangles |
| 5 | Highlight | Video 2 Scene 3 — one box cut off the sentence's opening words and swept in `Even if a written agreement is not required…`; now three word-exact rectangles, the last around `Code.` |
| 6 | Highlight | Video 2 Scene 4 — condition 3's box ran to y 547.1 and swallowed the standalone printed `and`; now stops at y 536.6, and that `and` gets its own box in the closing "all four" moment |

A seventh coordinate correction — the crop x window `x1 = 592` → **`x1 = 600`**, which was clipping
the page footer and the form number with it — was found **after** the addendum was written, by
`scripts/validate-loa-video-packages.mjs` check 4b. It is recorded in §4 above and in
`iabs-1-2-document-overview.md` §5.1, with the recomputed composed scale factor and band heights. It
is listed here because the *six* below is the addendum's count and this correction post-dates it.

An eighth coordinate repair belongs to the addendum's own pass and is recorded in `intermediary-brokerage.md`
§14: Video 3 Scene 3's inner cue on `in conspicuous bold or underlined print` was estimated at
`x ≈ 26.4–260`, which marked only the phrase's second half and swept in five following words; the
phrase straddles a line break, so it is now one cue in two word-exact rectangles. It is listed in §4
above with the other five; the *six* count is the addendum's own, kept so the two documents can be
compared line for line.

### The duration inconsistency

Video 1's v1 scene table totalled **3:01** while Video 1's own caption block ran to **3:17** — two
figures for one video, asserted side by side. Fixed at the root: every scene duration and every video
duration in this plan and in the three production files is now **derived** from that video's caption
cue timeline, matched scene-to-cue by narration text, and re-derived on every validator run. See §3.

### Everything else consolidated into the canonical files

| Correction | Landed in |
|---|---|
| Durations ≈ 3:01 / 2:53 / 3:10 → ≈ **3:30 / 3:03 / 3:20**, total ≈ **9:53** | this plan §2, §3, §7; each production file's §6 scene table and §11 registry entry |
| Placements confirmed against the live block maps | this plan §5; each production file's §3 |
| Retrieval-screen separation confirmed from the generated screen shape | this plan §5; validator check 8 |
| Caption `.vtt` files exist on disk, cue text final, timings provisional | this plan §6; each production file's §8 |
| Crop band boundaries G and H | this plan §4; `iabs-1-2-document-overview.md` §5.1 |
| Crop x window 592 → 600 (found by the validator, later than the addendum) | this plan §4; `iabs-1-2-document-overview.md` §5.1, and the restated rows in Videos 2 and 3 |
| Highlight rectangles, five corrections | this plan §4; each production file's §6 |
| Poster specification — Video 1 built from its render; Videos 2 and 3 remain pending | each production file's §10; this plan §6 |
| 50 form strings verified verbatim against the held PDF, 0 mismatches | validator check 6, which re-runs the verification rather than restating its result |
| Four-layer status, no layer borrowing another's | this plan's header and §6 |
| `screenMedia` hook implemented with eight passing refusal/placement/accessibility tests | this plan §10.3; `scripts/lib/generate-tx-block-maps.mjs`; `tests/texas-video-integration.test.mjs` |

---

## 12. Why this plan has its own freeze

A video plan is not curriculum, and correcting a video should never require breaking a curriculum
freeze. Until plan v2 it did: `scripts/freeze-loa-curriculum.mjs` hashed
`video-instruction-plan.md` directly, so any edit to the plan — including one that only made it more
accurate — reported drift against `LOA-CONTENT-FREEZE-2026-08-30-v3`. That deadlock is why the
corrections above spent a pass in an unhashed addendum instead of in this file.

The structure now is one level of indirection:

```
scripts/freeze-loa-video-plan.mjs
  └─ writes texas/tx-law-of-agency-30-v1/video-plan-freeze.json
       id LOA-VIDEO-PLAN-FREEZE-2026-09-08-v4
       hashes: this plan · the three production files · the three caption .vtt files ·
               the held IABS 1-2 PDF · the source inventory · the three block maps ·
               the validator · the screenMedia hook tests · the review addendum

scripts/freeze-loa-curriculum.mjs
  └─ writes texas/tx-law-of-agency-30-v1/content-freeze.json
       id LOA-CONTENT-FREEZE-2026-08-30-v4
       hashes: the twelve modules · the source register · … · and
               video-plan-freeze.json  ← the pointer, not the plan
```

The curriculum freeze still pins the video state exactly — a change to any video artifact changes the
video freeze, which changes the hash the curriculum freeze holds. What it no longer does is force a
curriculum-freeze break for a video correction: the video freeze absorbs that, and the curriculum
freeze follows the pointer. Each artifact owns its own domain.
