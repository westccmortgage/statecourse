# Video 1 — IABS 1-2 Document Overview

**Series:** StateCourse *Document Overview*. Course: `tx-law-of-agency-30-v1` (Texas Law of Agency, 30 hours).
**Asset stem:** `tx-iabs-1-2-document-overview`
**Status — four layers, and no layer borrows another's status:**
editorial and legal package **READY** at `LOA-VIDEO-PLAN-FREEZE-2026-09-07-v3` ·
rendered MP4 / VTT / poster **PENDING** · `screenMedia` integration support **READY** ·
course placement activation **NOT ACTIVE**. See §12. This package is not "production-ready" and that
phrase is not used of it.
**Plan:** `texas/tx-law-of-agency-30-v1/video-instruction-plan.md` **v3**, which supersedes plan v1
(sha256 `7ca723…`). **Freeze:** `texas/tx-law-of-agency-30-v1/video-plan-freeze.json`, written by
`scripts/freeze-loa-video-plan.mjs`; validated by `scripts/validate-loa-video-packages.mjs`.
`video-production/production-readiness-addendum.md` is **review history only** and is not an
operational dependency — nothing a renderer needs exists only there.

---

## 1. Learning objective

By the end of this video the student can, working from the actual TREC Information About Brokerage
Services notice (IABS 1-2):

1. locate the revision stamp and the form number and use them to confirm the notice in hand is the
   current version;
2. name the four blocks that carry substantive content — license types, the broker's minimum duties,
   the representation capacities, and the show-without-representing conditions — and say where each
   sits on the page;
3. state what the notice does **not** do: it creates no agency relationship, no engagement and no
   obligation to use the broker's services;
4. distinguish the notice (a written disclosure of the *ways* a broker may represent a party) from
   the representation disclosure under § 1101.558(b) (a statement of whom you actually represent); and
5. explain why a completed notice carries several licence numbers, and what the initials line does
   and does not signify.

**What text cannot do here.** Module 02 teaches § 1101.558 and 22 TAC § 531.20 completely and
correctly, but it deliberately does not reproduce or paraphrase the language printed on the form.
The rule the module teaches — that a license holder may reproduce the notice only if "the text of the
IABS Notice is copied verbatim and the spacing, borders and placement of text on the page must appear
to be identical to that in the published version" — is a rule about a *visual artefact*. A student who
has never seen the published spacing, borders and placement cannot apply it. This video is the only
place in the course where the student sees the artefact the rule protects.

---

## 2. LOA-1 topic and unit

| | |
|---|---|
| Topic | **T02** — Basic Agency Relationships, Disclosure and Duties to the Client |
| Unit | **T02U5** — Information About Brokerage Services - Disclosure of Representation (20 prescribed minutes) |
| Form | LOA-1, revision 09/11/2024, transcribed at `config/texas/law-of-agency-course-form.mjs` |

Secondary reinforcement (no second placement — the video is attached once): T01U3, T02U1.

---

## 3. Exact planned placement

**Module:** `texas/tx-law-of-agency-30-v1/curriculum/module-02.md`
**Unit heading:** `## Unit: Information About Brokerage Services - Disclosure of Representation`
**Screen it follows:** the unit's instruction screen, whose content range is

```
RANGE("## Unit: Information About Brokerage Services - Disclosure of Representation",
      "### Applied exercise: Four conversations in Corpus Christi")
```

Under the Texas block-map convention already in force for Principles of Real Estate I
(`config/texas/principles-i-module-*-blocks.mjs`, screen ids `t02u1-s1`, `t02u2-s2`, …) that screen
will be **`t02u5-s1`**. The video is attached to `t02u5-s1` as a `videos: []` entry and plays at the
foot of that screen, after the unit's prose and after the paragraph beginning "**The habit to
build.**".

**Screens that follow it, in order:**

1. `t02u5-s2` — practice: *Applied exercise: Four conversations in Corpus Christi*
2. `t02u5-s3` — retrieval check for T02U5

**Assessment separation is satisfied by construction.** The video sits two screens ahead of the
retrieval check, with a practice screen in between. No quiz question appears inside the video; no
answer is revealed immediately before a retrieval check; the closing scene is a structural synthesis
of the document ("one page, three jobs"), not an answer recap, and no highlight remains on screen
when the student is asked to retrieve anything.

**Authoring condition on the retrieval item.** The T02U5 retrieval item must not test a proposition
that the closing scene states verbatim. Test the delivery methods, the three § 1101.558(c) exceptions
or the verbatim-reproduction rule — all taught in the module's prose and none of them stated in the
video's closing scene.

**The block map now exists, and the placement is confirmed against it — not merely reserved.**
`config/texas/law-of-agency-module-2-blocks.mjs` was authored after this production file was drafted,
by `scripts/generate-tx-law-of-agency-block-maps.mjs` from the frozen module's own headings. Its
block `t02u5` (code `T02U5`, title "Information About Brokerage Services - Disclosure of Representation") carries exactly the three screens this file
predicted, with exactly the content ranges it predicted:

| Screen | Type | Title | Content range |
|---|---|---|---|
| `t02u5-s1` | instruction | Information About Brokerage Services - Disclosure of Representation | `RANGE("## Unit: Information About Brokerage Services - Disclosure of Representation", "### Applied exercise: Four conversations in Corpus Christi")` |
| `t02u5-s2` | practice | Applied exercise: Four conversations in Corpus Christi | begins at `### Applied exercise: Four conversations in Corpus Christi` |
| `t02u5-s3` | retrieval | Retrieval check | `questionId: "t02u5-q1"` |

The video attaches to **`t02u5-s1`**, the instruction screen, and plays at the foot of it. Read
against the block map, "the screen it follows" is therefore precise: it follows nothing inside the
unit — it is the last element of `t02u5-s1`, after that screen's whole content range, and the screen
it precedes is `t02u5-s2`.

**Nothing is wired.** That block map is a generated file, this production file does not edit it, and
no `screenMedia` entry for this video exists anywhere. The map's own header records that the Law of
Agency retrieval bank does not exist yet either, so no block in it is deliverable to a student today.
See §11 for the registry entry, written and commented **NOT ACTIVE**.

---

## 4. Source list

Every legal statement in the narration traces to one of these. Nothing else is relied on.

| Source | Held at | Used for |
|---|---|---|
| TREC form IABS 1-2, revision stamp 11-03-2025, 1 page | `texas/trec-sources/forms/IABS-1-2.pdf` — sha256 `5056930b66d237a7a4376db0c43f833929600f0b6e5ce6e42a417da824ef6b20`, 1,491,257 bytes, listed in `texas/trec-sources/source-inventory.json` | Every word quoted on screen and every word quoted in narration |
| Texas Occupations Code ch. 1101 | `texas/trec-sources/statutes/OC.1101.htm` | § 1101.558(b), (b-1), (b-2), (c); § 1101.557(a); § 1101.002(4), (7); § 1101.351(c) |
| 22 TAC § 531.20 | `texas/trec-sources/trec-rules/` | Adoption of IABS 1-2 by reference; delivery methods; verbatim-reproduction rule |
| Module 02 as written | `texas/tx-law-of-agency-30-v1/curriculum/module-02.md`, Unit 5 | The instructional frame the video must not contradict |
| LOA-1 course approval form | `config/texas/law-of-agency-course-form.mjs`; `texas/trec-sources/LOA-1.pdf` | Topic/unit placement |

**Nothing in this video, its captions, its poster, its transcript or its surrounding screen states or
implies that the video, the course, or StateCourse is approved, endorsed, reviewed or licensed by the
Texas Real Estate Commission.** The form shown is the Commission's; the instruction wrapped around it
is StateCourse's, and the narration says so by never claiming otherwise.

---

## 5. Document asset

**Master document:** `texas/trec-sources/forms/IABS-1-2.pdf` — the held official form. This file is
the only permitted source of document pixels.

**Prohibitions restated for this production.** The form is never recreated, re-typeset, re-flowed,
re-coloured, logo-stamped, filled in, or regenerated by any model. No field, date, party, amount,
licence number or line of form language is invented. Every document frame in the video is a
rasterisation of the held PDF and nothing else.

### 5.1 Frame assets to be built from the held PDF (deterministic, upstream of HeyGen)

HeyGen has failed to zoom or crop an uploaded document reliably on every prior attempt in this series
(see `california/video-production/deed-of-trust-prompt.md`). The zoom therefore happens *before*
upload, by rendering the held page at high resolution and cropping on section boundaries. HeyGen only
holds a still.

Render the single page with pdfium at **scale 4** (288 dpi → 2448 × 3168 px). Crop the bands below,
given in PDF points on the page's own coordinate system (origin top-left, page 612 × 792 pt); every
boundary was measured with `pdfplumber` against the held file, not estimated. The x window is stated
per asset because the page's footer runs wider than its body.

| Asset | Band | x-left | x-right | y-top | y-bottom | Contains — nothing is cut mid-heading |
|---|---|---|---|---|---|---|
| `iabs-full.png` | FULL | 0 | 612 | 0 | 792 | Whole page, full media box |
| `iabs-band-a.png` | A | 20 | 600 | 12 | 74 | Revision stamp, title, the two-line "Texas law requires…" statement |
| `iabs-band-b.png` | B | 20 | 600 | 73 | 114 | TYPES OF REAL ESTATE LICENSE HOLDERS + both bullets |
| `iabs-band-c.png` | C | 20 | 600 | 112 | 175 | A BROKER'S MINIMUM DUTIES REQUIRED BY LAW + all four bullets |
| `iabs-band-d.png` | D | 20 | 600 | 172 | 255 | WRITTEN AGREEMENTS ARE REQUIRED IN CERTAIN SITUATIONS, whole paragraph |
| `iabs-band-e.png` | E | 20 | 600 | 252 | 370 | A LICENSE HOLDER CAN REPRESENT A PARTY… + AS AGENT FOR OWNER + AS AGENT FOR BUYER/TENANT |
| `iabs-band-f.png` | F | 20 | 600 | 368 | 492 | AS AGENT FOR BOTH - INTERMEDIARY, heading through the last sub-bullet |
| `iabs-band-g.png` | G | 20 | 600 | 490 | 592 | A LICENSE HOLDER CAN SHOW PROPERTY… + four bullets + the 14-day paragraph |
| `iabs-band-h.png` | H | 20 | 600 | 592 | 791 | LICENSE HOLDER CONTACT INFORMATION, the four contact rows, initials/date line, footer |

**Every cut lands in interline whitespace — verified, not assumed.** Each y boundary above was
checked against `pdfplumber.extract_text_lines()` on the held page: no printed line straddles any
band edge, so no heading and no sentence is ever cut in half. Two boundaries were corrected during
that check and the corrected values are the ones in the table — band G's foot moved 594 → **592**
(594 fell inside the printed line `LICENSE HOLDER CONTACT INFORMATION: This notice is being
provided…`, which spans y 593.2–603.1) and band H's head moved 588 → **592** (588 fell inside
`limited to no more than 14 days.`, which spans y 579.0–589.0). Anyone rebuilding these crops must
re-run that straddle check rather than trusting the numbers.

**The x window was wrong too, and is corrected here: `x1 = 592` → `x1 = 600`.** Every earlier draft
of this table gave one x window, `x0 = 20, x1 = 592`, described as "the full text column". It is not:
the page's footer line — `Regulated by the Texas Real Estate Commission Information available at
www.trec.texas.gov IABS 1-2` — runs to **x 599.2**, so a crop stopping at 592 clipped it, and what it
clipped included **the form number itself**. Band H is the frame on which Video 1 reads the foot of
the page, so the loss would have been on screen. The band window now runs to 600, and `iabs-full.png`
takes the whole 612-point media box rather than a text column, which is what "whole page" always
meant and what its composed width already implied.
`scripts/validate-loa-video-packages.mjs` check 4 found this, and now re-checks every printed line
against its band's window on every run.

**Composition to 1920 × 1080.** Each band crop is 580 pt wide, which is 2320 px at scale 4. Scale it
to 1660 px wide (factor **0.7155**) and centre it on a warm-ivory 1920 × 1080 ground. Resulting band
heights: A 177, B 117, C 180, D 238, E 338, F 355, G 292, H 570 px — every band therefore sits
**fully inside the frame** with ivory margin above, below and on both sides. That margin is where
highlight labels go; no label ever crosses document text. Effective resolution on the delivered frame
is ~206 dpi, so the form's 10-point body text renders at roughly 29 px line height and is comfortably
legible at 1080p.

`iabs-full.png` is composed to fit by height (1080 px tall page, 835 px wide, centred) for the
establishing hold only; it is never the frame on which a provision is read aloud.

Bands D, F and G are built and shipped in this set even though Video 1 only glances at F and G in
Scene 7 — Videos 2 and 3 consume them, and one build script serves all three productions.

### 5.2 What is uploaded to HeyGen

The nine composed 1920 × 1080 PNGs above. HeyGen draws nothing, generates nothing, and moves nothing.

---

## 6. Scene-by-scene structure

**Durations in this table are DERIVED, not asserted.** Each is computed from this video's caption
file, `captions/tx-tx-iabs-1-2-document-overview.provisional.vtt`: a scene's duration is the end of its last cue minus
the start of its first, and the scene is matched to its cues by comparing this file's scene narration
against the cue text. Nothing here is a second, independent statement of a length that is also stated
somewhere else — there is one timeline, and this is a view of it.
`scripts/validate-loa-video-packages.mjs` check 3 re-derives every row and fails on disagreement.

The cue timings themselves are **provisional**, computed at 150 words per minute with a 1.4-second
readability floor, so every figure below is provisional too. **None is a measurement.** They are
replaced after the render arrives, when the caption file is rebuilt from the delivered audio and this
table is re-derived from it.

| # | Visual | Duration |
|---|---|---|
| 1 | Avatar, medium shot | ≈ 20 s |
| 2 | `iabs-full.png`, static hold | ≈ 22 s |
| 3 | `iabs-band-b.png`, static hold | ≈ 21 s |
| 4 | `iabs-band-c.png`, static hold | ≈ 37 s |
| 5 | `iabs-band-c.png`, same hold continues | ≈ 14 s |
| 6 | `iabs-band-e.png`, static hold | ≈ 18 s |
| 7 | `iabs-band-e.png`, same hold continues | ≈ 17 s |
| 8 | `iabs-band-f.png` → `iabs-band-g.png`, one hard cut | ≈ 16 s |
| 9 | `iabs-band-h.png`, static hold | ≈ 26 s |
| 10 | Avatar, medium shot | ≈ 17 s |
| | **Total** | **≈ 3 min 30 s** |

---

### Scene 1 — Avatar introduction

**Visual.** Professional male avatar, medium shot, StateCourse branded set, warm ivory ground.
No document on screen.

**On-screen text.** Title card, lower third, deep navy on ivory:
`Information About Brokerage Services` / second line, smaller: `TREC form IABS 1-2`

**Narration.**
> Texas law requires all real estate license holders to give the following information about
> brokerage services to prospective buyers, tenants, sellers and landlords. The Commission writes
> that notice. You do not. This is the current version — Information About Brokerage Services,
> form number IABS 1-2. Let's read it block by block.

---

### Scene 2 — The whole page

**Visual.** Hard cut to `iabs-full.png`. Camera comes to a full stop and does not move for the rest
of the scene. Avatar off screen.

**On-screen text.** None. The page carries itself.

**Highlight (post-production).** One box only, on the revision stamp at the top-right, held while
the stamp is narrated — provisionally +2.0 s to +11.5 s, tracking caption cue 5. Margin label in the
right ivory margin: header `REVISION STAMP`, line `11-03-2025`.
Target region in page points: **x 526.7–573.2, y 17.8–27.7** — the exact bounding box of the printed
line `11-03-2025`, measured with `pdfplumber.extract_text_lines()`.

**Narration.**
> Here is the whole notice. One page, and the revision stamp in the corner reads 11-03-2025 — that
> is how you check you are holding the current version. Notice what it is not. Not a contract, not
> a listing, not a representation agreement. Every block on this page describes a relationship.
> None of them creates one.

---

### Scene 3 — Types of license holders

**Visual.** Hard cut to `iabs-band-b.png`. Static hold.

**Highlight.** One box around the two bullets beneath the heading, from +2.0 s (caption cue 9) to
the end of the scene. The heading `TYPES OF REAL ESTATE LICENSE HOLDERS:` (page points
x 26.4–200.1, y 78.1–88.0) is **inside the frame at all times and is never cropped**; the box sits
below it. Margin label: header `BLOCK 1`, lines `Types of license` / `holders`.
Target region in page points: **x 35.4–530.7, y 88.1–109.2** — the bounding box of the two printed
bullet lines, exactly.

**Narration.**
> The first block sets the vocabulary. A broker is responsible for all brokerage activities,
> including acts performed by sales agents sponsored by the broker. A sales agent must be
> sponsored by a broker and works with clients on behalf of the broker. The broker holds the
> relationship; you act for the broker.

---

### Scene 4 — The broker's minimum duties: the three owed to the client

**Visual.** Hard cut to `iabs-band-c.png`. Static hold, continues through Scene 5.

**Highlight.** Two cues, strictly sequential — never both on screen:
1. From +5.0 s to +15.2 s (caption cues 13–14), a box around the parenthetical in the heading only —
   `(A client is the person or party that the broker represents):`. Page points
   **x 237.7–481.8, y 117.0–127.0** — measured word-exactly, from the left edge of the printed `(A`
   to the right edge of `represents):`. The box therefore starts after `LAW` and never encloses the
   heading's opening words. Margin label: header `DEFINITION`, lines `"Client" — defined` /
   `on the form`.
2. From +19.6 s (caption cue 16) to the end of the scene, that box clears and a box lands around the
   **first three bullets only**. Page points **x 35.4–467.2, y 127.1–158.9** — the bounding box of
   the three printed bullet lines, exactly. Margin label: header `OWED TO THE CLIENT`,
   lines `Bullets 1–3`.

The heading line `A BROKER'S MINIMUM DUTIES REQUIRED BY LAW …` (y 117.0–127.0) is inside the frame,
uncropped, for the whole scene.

**Narration.**
> Now the duties block — and read the heading including the words in parentheses. A client is the
> person or party that the broker represents. That parenthesis does real work, because the Act
> itself never defines the word. Three of the four bullets beneath it run to that client. Put the
> interests of the client above all others, including the broker's own interests; Inform the
> client of any material information about the property or transaction received by the broker;
> Answer the client's questions and present any offer to or counter-offer from the client.

---

### Scene 5 — The fourth duty, owed to everyone

**Visual.** `iabs-band-c.png` continues. No cut. No camera movement.

**Highlight.** The Scene 4 box clears at the scene boundary. A single new box around the fourth
bullet only, from +1.5 s (caption cue 20) to +11.2 s. Page points **x 35.4–303.8, y 159.2–169.6** —
the bounding box of the printed fourth bullet line, exactly. Margin label:
header `OWED TO ALL PARTIES`, lines `Bullet 4`.

**On-screen text.** None. The contrast is carried by the two successive highlights, not by a caption
laid over the page.

**Narration.**
> The fourth bullet does not. Treat all parties to a real estate transaction honestly and fairly.
> Three duties to the client. One owed to everybody in the transaction. Representation decides
> advocacy. It has never decided honesty.

---

### Scene 6 — As agent for the owner

**Visual.** Hard cut to `iabs-band-e.png`. Static hold, continues through Scene 7.

**Highlight.** One box around the `AS AGENT FOR OWNER (SELLER/LANDLORD):` paragraph, from +6.8 s
(caption cue 24) to the end of the scene. Page points **x 26.4–582.5, y 274.9–316.0** — the bounding
box of the paragraph's four printed lines, exactly; the heading label sits on the first of them, so
it is inside the box rather than cut by it. The block heading
`A LICENSE HOLDER CAN REPRESENT A PARTY IN A REAL ESTATE TRANSACTION:` (x 26.4–352.9,
y 257.2–267.2) remains visible and uncropped above it throughout. Margin label: header `CAPACITY 1`,
lines `Agent for owner`.

**Narration.**
> The next block is headed, a license holder can represent a party in a real estate transaction.
> As agent for owner: the broker becomes the property owner's agent through an agreement with the
> owner, usually in a written listing to sell or property management agreement.

---

### Scene 7 — As agent for the buyer or tenant

**Visual.** `iabs-band-e.png` continues. No cut.

**Highlight.** Scene 6's box clears. One new box around the `AS AGENT FOR BUYER/TENANT:` paragraph,
from scene start to +10.4 s. Page points **x 26.4–582.5, y 323.7–364.8** — the bounding box of the
paragraph's four printed lines, exactly.
Margin label: header `CAPACITY 2`, lines `Agent for buyer` / `or tenant`.

From +10.4 s (caption cue 26) that box clears and two thin underline cues appear together, one on the
closing clause of each capacity paragraph:

| Underline | Printed clause | Page points |
|---|---|---|
| owner paragraph | `An owner's agent fees are not set by law and are fully negotiable.` | x 293.3–565.4, y 306.1–316.0 |
| buyer paragraph | `A buyer/tenant's agent fees are not set by law and are fully negotiable.` | x 84.9–380.7, y 354.8–364.8 |

Both are word-exact measurements. This is the *same* concept appearing twice on the page, not a
second new concept, so the two underlines are shown together — one shared margin label,
header `SAME CLOSING CLAUSE`, lines `Fees: not set by law,` / `fully negotiable`.

**Narration.**
> As agent for buyer or tenant: the broker becomes the buyer or tenant's agent by agreeing to
> represent the buyer, usually through a written representation agreement. Both paragraphs close
> the same way — fees are not set by law and are fully negotiable.

---

### Scene 8 — The two blocks this course takes apart later

**Visual.** Hard cut to `iabs-band-f.png`, held ≈ 8 s; one hard cut to `iabs-band-g.png`, held ≈ 8 s.
Two static holds, one cut. No zoom, no pan.

**Highlight.** On band F, a single box on the heading label `AS AGENT FOR BOTH - INTERMEDIARY:`
only — page points **x 26.4–199.3, y 372.4–382.4**, the label's own words at the head of the
paragraph's first printed line. This scene locates the block; it does not teach it.
Margin label: header `TAUGHT IN MODULE 06`, lines `Intermediary`.

On band G, a single box on the heading line
`A LICENSE HOLDER CAN SHOW PROPERTY TO A BUYER/TENANT WITHOUT REPRESENTING THE BUYER/TENANT IF:` —
page points **x 26.4–498.2, y 494.7–504.7**, the printed heading line exactly.
Margin label: header `TAUGHT IN MODULE 05`, lines `Showing without` / `representation`.

**Narration.**
> Two more blocks finish the page. As agent for both — intermediary. And below it, when a license
> holder can show property without representing the buyer or tenant. Later modules take both
> apart. Today, know where they sit on the page.

---

### Scene 9 — The contact block and what the initials mean

**Visual.** Hard cut to `iabs-band-h.png`. Static hold.

**Highlight.** Three sequential cues, one at a time:

1. From +3.2 s to +11.6 s (caption cue 32), the sentence `This notice is being provided for
   information purposes. It does not create an obligation for you to use the broker's services.`
   The sentence begins part-way along the first printed line, after the `LICENSE HOLDER CONTACT
   INFORMATION:` label, and ends part-way along the second, before `Please acknowledge receipt…`.
   It is therefore drawn as **one cue in two rectangles** (two `scenes.json` entries sharing a start
   and end, the first carrying the label):
   - **x 209.7–576.0, y 593.2–603.1** — from the printed `This` to the line's right edge
   - **x 27.1–157.9, y 603.5–613.4** — from `you` to the full stop after `services.`

   Both are word-exact. The box neither encloses the block label nor the receipt-acknowledgement
   sentence, so only the narrated proposition is marked.
   Margin label: header `WHAT IT IS NOT`, lines `No obligation` / `created`.
2. From +11.6 s to +18.8 s (caption cue 33), box on the four contact rows as a group. Page points
   **x 30.5–548.8, y 629.5–743.2** — the bounding box of the seven printed row lines, exactly.
   Margin label: header `FOUR ROWS`, lines `Broker, DB,` / `supervisor, agent`.
3. From +18.8 s to the end of the scene (caption cues 34–35), box on the
   `Buyer/Tenant/Seller/Landlord Initials    Date` line. Page points
   **x 166.1–421.9, y 762.5–772.5** — the printed line exactly.
   Margin label: header `ACKNOWLEDGEMENT`, lines `Receipt only`.

**Narration.**
> At the foot is the block students skip. This notice is being provided for information purposes.
> It does not create an obligation for you to use the broker's services. Then four contact rows,
> each with a licence number — which is why a completed notice carries several. And a line for the
> consumer's initials and a date. Initials acknowledge receipt. They are not consent to anything.

---

### Scene 10 — Avatar, the point of judgment, and close

**Visual.** Return to avatar, medium shot. No document on screen. No end card, no "next" slide, no
recap card. The video ends on the final sentence.

**On-screen text.** None.

**Narration.**
> One page, three jobs. It names the license types, states the broker's minimum duties, and
> describes every relationship a Texas broker may lawfully occupy. What it never does is create
> one. A relationship comes from an agreement. This comes from a statute.

---

## 7. HeyGen-ready production prompt

Send the block below to HeyGen with the nine composed PNGs attached. Nothing else is attached.

```
Create a professional educational training video for StateCourse, an online real estate licensing
education platform. This is a new video in the "Document Overview" series and must match the
previous videos ("Loan Estimate — Page 1/2/3", "The Promissory Note", "The Deed of Trust") in
presenter, set, tone, typography and pacing.

FORMAT
16:9 landscape, 1920x1080.
Target length: approximately 3 minutes.
Professional adult-learning course, not social media.
Clean, premium, academic visual style.
Warm ivory background, deep navy typography, restrained muted red accents.
No flashy transitions. No stock-footage montage. No motivational or sales language.
No background music that competes with narration.

PRESENTER
Use my selected professional male avatar — the same avatar, wardrobe and StateCourse branded set as
the previous videos in this series.
Delivery: calm, clear, authoritative, conversational; not theatrical, not rushed.
The avatar appears in the first scene and the last scene only. Every other scene shows the document
image and not the presenter.

SOURCE IMAGES — LOCKED
I will attach nine still images. They are high-resolution renderings of one page of an official
Texas government form, already composed to 1920x1080. They are a locked source layer.

Do NOT use generative AI to reconstruct, enhance, repair, sharpen, replace, retype, re-flow,
recolour or rewrite any part of any attached image.
Do NOT add, remove or alter one character of the text visible in them.
Do NOT overlay any text, box, arrow, outline, callout, label, logo or graphic on top of any attached
image. Highlighting is added later in post-production and must NOT be attempted here.
Do NOT zoom, pan, crop, scale, tilt, drift or apply any camera movement while an image is on screen.
Each image is shown as a completely static, motion-free hold, full frame, undistorted, at its
delivered composition. The ONLY permitted visual change during the document portion of the video is
a hard cut from one image to the next.

SCENE STRUCTURE

Scene 1 — Avatar introduction. Medium shot, clean StateCourse branded background.
On-screen title: "Information About Brokerage Services" with a smaller second line "TREC form
IABS 1-2".
Script: "Texas law requires all real estate license holders to give the following information about
brokerage services to prospective buyers, tenants, sellers and landlords. The Commission writes
that notice. You do not. This is the current version — Information About Brokerage Services, form
number IABS 1-2. Let's read it block by block."
Duration: 19-21 seconds.

Scene 2 — Image "iabs-full". Static hold begins. Avatar off screen.
Script: "Here is the whole notice. One page, and the revision stamp in the corner reads 11-03-2025 — that
is how you check you are holding the current version. Notice what it is not. Not a contract, not a
listing, not a representation agreement. Every block on this page describes a relationship. None
of them creates one."
Duration: 21-23 seconds.

Scene 3 — Hard cut to image "iabs-band-b". Static hold.
Script: "The first block sets the vocabulary. A broker is responsible for all brokerage activities,
including acts performed by sales agents sponsored by the broker. A sales agent must be sponsored
by a broker and works with clients on behalf of the broker. The broker holds the relationship; you
act for the broker."
Duration: 20-22 seconds.

Scene 4 — Hard cut to image "iabs-band-c". Static hold.
Script: "Now the duties block — and read the heading including the words in parentheses. A client is the
person or party that the broker represents. That parenthesis does real work, because the Act
itself never defines the word. Three of the four bullets beneath it run to that client. Put the
interests of the client above all others, including the broker's own interests; Inform the client
of any material information about the property or transaction received by the broker; Answer the
client's questions and present any offer to or counter-offer from the client."
Duration: 36-38 seconds.

Scene 5 — Image "iabs-band-c" continues. No cut, no movement.
Script: "The fourth bullet does not. Treat all parties to a real estate transaction honestly and fairly.
Three duties to the client. One owed to everybody in the transaction. Representation decides
advocacy. It has never decided honesty."
Duration: 13-15 seconds.

Scene 6 — Hard cut to image "iabs-band-e". Static hold.
Script: "The next block is headed, a license holder can represent a party in a real estate transaction. As
agent for owner: the broker becomes the property owner's agent through an agreement with the
owner, usually in a written listing to sell or property management agreement."
Duration: 17-19 seconds.

Scene 7 — Image "iabs-band-e" continues. No cut, no movement.
Script: "As agent for buyer or tenant: the broker becomes the buyer or tenant's agent by agreeing to
represent the buyer, usually through a written representation agreement. Both paragraphs close the
same way — fees are not set by law and are fully negotiable."
Duration: 16-18 seconds.

Scene 8 — Hard cut to image "iabs-band-f", hold about 8 seconds, then one hard cut to image
"iabs-band-g", hold about 8 seconds.
Script: "Two more blocks finish the page. As agent for both — intermediary. And below it, when a license
holder can show property without representing the buyer or tenant. Later modules take both apart.
Today, know where they sit on the page."
Duration: 15-17 seconds total across the two holds.

Scene 9 — Hard cut to image "iabs-band-h". Static hold.
Script: "At the foot is the block students skip. This notice is being provided for information purposes. It
does not create an obligation for you to use the broker's services. Then four contact rows, each
with a licence number — which is why a completed notice carries several. And a line for the
consumer's initials and a date. Initials acknowledge receipt. They are not consent to anything."
Duration: 25-27 seconds.

Scene 10 — Return to avatar, medium shot.
Script: "One page, three jobs. It names the license types, states the broker's minimum duties, and
describes every relationship a Texas broker may lawfully occupy. What it never does is create one.
A relationship comes from an agreement. This comes from a statute."
Duration: 16-18 seconds.

END OF VIDEO.
Do NOT add a recap scene after the avatar's closing line.
Do NOT add an end card, title card, credits or "Next:" slide.
The video ends on the avatar's final sentence.

VISUAL RULES
- The attached images are the central visual, shown exactly as delivered.
- No highlight box, outline, arrow or margin label anywhere in this video. Highlights are added
  downstream in post-production, exactly as they were for the Loan Estimate, Promissory Note and
  Deed of Trust videos.
- No camera movement, zoom or pan at any point while an image is on screen. Hard cuts only.
- Keep any overlay title fully clear of the StateCourse logo. No text may overlap the logo.
- No decorative imagery. No houses, keys, handshakes, smiling families, money, city skylines or
  stock footage of any kind.

ACCESSIBILITY
Deliver captions as a separate synchronized caption file (SRT); do not burn captions into the image.
Deliver a clean transcript.
Maintain high text/background contrast.

IMPORTANT EDUCATIONAL RULE
This video is instruction, not the mastery check. Do NOT put a quiz question, a self-test, a poll, an
answer or an answer recap anywhere in this video. The student reaches retrieval and application on a
separate screen after the video.

QUALITY CONTROL BEFORE RENDERING
Verify internally before rendering: on every frame in which an attached image appears, the image is
full-frame, undistorted, unmoved, uncropped and unaltered, with no text overlaid on it and no colour
shift. The only visual changes across Scenes 2 through 9 are the hard cuts between images. If the
camera moves, zooms, drifts, or the composition changes even once during any hold, reject and
re-render before delivering.
```

---

## 8. Caption-ready transcript

**On disk:** `texas/tx-law-of-agency-30-v1/video-production/captions/tx-iabs-1-2-document-overview.provisional.vtt` — a
real, well-formed WebVTT file, written and kept **outside** `public/statecourse/media/` on purpose,
so that nothing can serve it by accident before a render exists. Its first block is a `NOTE` saying
so in the file itself.

**Cue text is final.** Every cue matches the recorded script word for word, and every fragment that
reads the held form or the held statute has been checked against the source character by character
(§14).

**Cue TIMINGS are PROVISIONAL.** They are computed at 150 words per minute — the delivery rate of the
existing series — with a 1.4-second readability floor on very short cues, and they are placeholders.
No render exists, so no timing here was measured from audio. Before the file ships to
`/media/tx-iabs-1-2-document-overview.vtt` the timings must be rebuilt from the delivered render's own
audio, by silence-gap detection cross-validated against word-count pacing, exactly as the sibling
captions in `public/statecourse/media/` were built. The cue text does not change when that happens;
only the timestamps do.

```vtt
WEBVTT

NOTE
PROVISIONAL TIMINGS — see the header of the on-disk file. Cue text is final;
cue timings are placeholders computed at 150 wpm and must be rebuilt from the render.

00:00:00.300 --> 00:00:09.500
Texas law requires all real estate license holders to give the following
information about brokerage services to prospective buyers, tenants, sellers
and landlords.

00:00:09.500 --> 00:00:12.700
The Commission writes that notice. You do not.

00:00:12.700 --> 00:00:18.300
This is the current version — Information About Brokerage Services, form
number IABS 1-2.

00:00:18.300 --> 00:00:20.700
Let's read it block by block.

00:00:20.700 --> 00:00:22.700
Here is the whole notice.

00:00:22.700 --> 00:00:31.900
One page, and the revision stamp in the corner reads 11-03-2025 — that is how
you check you are holding the current version.

00:00:31.900 --> 00:00:37.900
Notice what it is not. Not a contract, not a listing, not a representation
agreement.

00:00:37.900 --> 00:00:43.100
Every block on this page describes a relationship. None of them creates one.

00:00:43.100 --> 00:00:45.500
The first block sets the vocabulary.

00:00:45.500 --> 00:00:52.700
A broker is responsible for all brokerage activities, including acts performed
by sales agents sponsored by the broker.

00:00:52.700 --> 00:00:59.900
A sales agent must be sponsored by a broker and works with clients on behalf
of the broker.

00:00:59.900 --> 00:01:03.900
The broker holds the relationship; you act for the broker.

00:01:03.900 --> 00:01:09.500
Now the duties block — and read the heading including the words in
parentheses.

00:01:09.500 --> 00:01:13.900
A client is the person or party that the broker represents.

00:01:13.900 --> 00:01:19.100
That parenthesis does real work, because the Act itself never defines the
word.

00:01:19.100 --> 00:01:23.500
Three of the four bullets beneath it run to that client.

00:01:23.500 --> 00:01:29.100
Put the interests of the client above all others, including the broker's own
interests;

00:01:29.100 --> 00:01:35.500
Inform the client of any material information about the property or
transaction received by the broker;

00:01:35.500 --> 00:01:41.100
Answer the client's questions and present any offer to or counter-offer from
the client.

00:01:41.100 --> 00:01:43.100
The fourth bullet does not.

00:01:43.100 --> 00:01:47.500
Treat all parties to a real estate transaction honestly and fairly.

00:01:47.500 --> 00:01:52.300
Three duties to the client. One owed to everybody in the transaction.

00:01:52.300 --> 00:01:55.500
Representation decides advocacy. It has never decided honesty.

00:01:55.500 --> 00:02:02.300
The next block is headed, a license holder can represent a party in a real
estate transaction.

00:02:02.300 --> 00:02:13.500
As agent for owner: the broker becomes the property owner's agent through an
agreement with the owner, usually in a written listing to sell or property
management agreement.

00:02:13.500 --> 00:02:23.900
As agent for buyer or tenant: the broker becomes the buyer or tenant's agent
by agreeing to represent the buyer, usually through a written representation
agreement.

00:02:23.900 --> 00:02:30.700
Both paragraphs close the same way — fees are not set by law and are fully
negotiable.

00:02:30.700 --> 00:02:33.100
Two more blocks finish the page.

00:02:33.100 --> 00:02:35.500
As agent for both — intermediary.

00:02:35.500 --> 00:02:41.900
And below it, when a license holder can show property without representing the
buyer or tenant.

00:02:41.900 --> 00:02:47.100
Later modules take both apart. Today, know where they sit on the page.

00:02:47.100 --> 00:02:50.300
At the foot is the block students skip.

00:02:50.300 --> 00:02:58.700
This notice is being provided for information purposes. It does not create an
obligation for you to use the broker's services.

00:02:58.700 --> 00:03:05.900
Then four contact rows, each with a licence number — which is why a completed
notice carries several.

00:03:05.900 --> 00:03:09.900
And a line for the consumer's initials and a date.

00:03:09.900 --> 00:03:13.500
Initials acknowledge receipt. They are not consent to anything.

00:03:13.500 --> 00:03:23.100
One page, three jobs. It names the license types, states the broker's minimum
duties, and describes every relationship a Texas broker may lawfully occupy.

00:03:23.100 --> 00:03:25.900
What it never does is create one.

00:03:25.900 --> 00:03:30.300
A relationship comes from an agreement. This comes from a statute.
```

---

## 9. Clean transcript

Published on the same screen as the video, as text, so a student who does not or cannot watch has the
same instruction in reading form.

> Texas law requires all real estate license holders to give the following information about
> brokerage services to prospective buyers, tenants, sellers and landlords. The Commission writes
> that notice. You do not. This is the current version — Information About Brokerage Services,
> form number IABS 1-2. Let's read it block by block.
>
> Here is the whole notice. One page, and the revision stamp in the corner reads 11-03-2025 — that
> is how you check you are holding the current version. Notice what it is not. Not a contract, not
> a listing, not a representation agreement. Every block on this page describes a relationship.
> None of them creates one.
>
> The first block sets the vocabulary. A broker is responsible for all brokerage activities,
> including acts performed by sales agents sponsored by the broker. A sales agent must be
> sponsored by a broker and works with clients on behalf of the broker. The broker holds the
> relationship; you act for the broker.
>
> Now the duties block — and read the heading including the words in parentheses. A client is the
> person or party that the broker represents. That parenthesis does real work, because the Act
> itself never defines the word. Three of the four bullets beneath it run to that client. Put the
> interests of the client above all others, including the broker's own interests; Inform the
> client of any material information about the property or transaction received by the broker;
> Answer the client's questions and present any offer to or counter-offer from the client.
>
> The fourth bullet does not. Treat all parties to a real estate transaction honestly and fairly.
> Three duties to the client. One owed to everybody in the transaction. Representation decides
> advocacy. It has never decided honesty.
>
> The next block is headed, a license holder can represent a party in a real estate transaction.
> As agent for owner: the broker becomes the property owner's agent through an agreement with the
> owner, usually in a written listing to sell or property management agreement.
>
> As agent for buyer or tenant: the broker becomes the buyer or tenant's agent by agreeing to
> represent the buyer, usually through a written representation agreement. Both paragraphs close
> the same way — fees are not set by law and are fully negotiable.
>
> Two more blocks finish the page. As agent for both — intermediary. And below it, when a license
> holder can show property without representing the buyer or tenant. Later modules take both
> apart. Today, know where they sit on the page.
>
> At the foot is the block students skip. This notice is being provided for information purposes.
> It does not create an obligation for you to use the broker's services. Then four contact rows,
> each with a licence number — which is why a completed notice carries several. And a line for the
> consumer's initials and a date. Initials acknowledge receipt. They are not consent to anything.
>
> One page, three jobs. It names the license types, states the broker's minimum duties, and
> describes every relationship a Texas broker may lawfully occupy. What it never does is create
> one. A relationship comes from an agreement. This comes from a statute.

---

## 10. Poster specification

| | |
|---|---|
| Path | `public/statecourse/media/tx-iabs-1-2-document-overview-poster.webp` |
| Dimensions | 1280 × 720, matching every sibling poster in `public/statecourse/media/` |
| Format | WebP, quality 80, target ≤ 60 KB (siblings run 21–50 KB) |
| Frame | Extracted from the **delivered final render**, from the middle of Scene 2's static hold on `iabs-full.png`, after the revision-stamp highlight has cleared |
| Content | The real form, whole page, ivory ground, no overlay, no play-button graphic burned in, no text added |
| Alt text | `Still frame from the video: the full first page of TREC form IABS 1-2, Information About Brokerage Services.` |
| Constraint | The poster is a frame of the render. It is never composed by hand and never generated. **It does not exist until the render exists** — see §12. |

---

## 11. Optional / non-blocking configuration

**Rule.** The video is optional. A student completes T02U5, Module 02 and the course without watching
it. Equivalent written instruction already exists and is not abbreviated anywhere on account of the
video: `module-02.md`, `## Unit: Information About Brokerage Services - Disclosure of Representation`,
which teaches § 1101.558(b), (b-1), (b-2) and (c) and 22 TAC § 531.20 in full, including the delivery
methods, the signature-block prohibition, the homepage-link labels and font sizes, and the
verbatim-reproduction rule. The video adds sight of the artefact; it carries no content the prose
lacks, and no prose was removed for it.

**Optional video time is not counted toward LOA-1's required 1,500 minutes.** T02U5's 20 prescribed
minutes are spent entirely on reading and activity minutes under
`config/texas/law-of-agency-time-budget.mjs`. This video's ≈ 3 minutes 30 seconds are additional and unbudgeted;
adding it changes no figure in that file, and no figure in that file was reduced to make room for it.

**Registry entry — WRITTEN, AND COMMENTED *NOT ACTIVE*.** Recorded so the wiring is unambiguous
when it happens, not so that it can happen now. Adding it before the MP4, the poster and the shipping
`.vtt` all exist and have passed factual, visual and accessibility QC would put a dead player, a
missing poster and a 404 caption track on a student-facing screen — worse than no video at all.

**Where it goes, exactly.** `config/texas/law-of-agency-module-2-blocks.mjs` now exists, and screen
`t02u5-s1` is in it, with the content range this production file predicted. But that file's own header
reads *"GENERATED FILE … Do not edit by hand — regenerate"*: it is written by
`scripts/generate-tx-law-of-agency-block-maps.mjs` from the frozen module's headings. So the entry
below is **not** pasted into the generated file. It is attached the way California attaches its
Loan Estimate and Promissory Note videos — as a hand-authored `screenMedia` spec keyed by screen id,
which the generator merges onto the screen it names and which refuses to generate if the screen id
does not exist (`scripts/lib/generate-ca-block-maps.mjs`, the `spec.screenMedia` block). The Texas
generator core, `scripts/lib/generate-tx-block-maps.mjs`, now carries that hook and its eight-test
refusal contract. It remains dormant because the final MP4, poster, measured shipping VTT and
transcript do not exist. **Do not hand-edit a generated course file** — its own header forbids it and
the next regeneration erases the edit. Add the active media entry only after every asset and factual,
visual, logo-safety and accessibility review passes.

```js
// NOT ACTIVE — DO NOT ADD. This is a record of the intended wiring, not the wiring.
// Add ONLY when all four of these exist and have passed factual, visual and accessibility QC:
//   public/statecourse/media/tx-iabs-1-2-document-overview.mp4
//   public/statecourse/media/tx-iabs-1-2-document-overview-poster.webp
//   public/statecourse/media/tx-iabs-1-2-document-overview.vtt        (timings rebuilt from the render)
//   public/statecourse/media/tx-iabs-1-2-document-overview.txt
// Route: a hand-authored screenMedia spec consumed by
// scripts/generate-tx-law-of-agency-block-maps.mjs — never a hand edit to the generated
// config/texas/law-of-agency-module-2-blocks.mjs.
//
// screenMedia: {
//   "t02u5-s1": {
//     required: false,
//     nonBlocking: true,
//     noAssessmentContent: true,
//     videos: [{
//       src: "/media/tx-iabs-1-2-document-overview.mp4",
//       poster: "/media/tx-iabs-1-2-document-overview-poster.webp",
//       captions: "/media/tx-iabs-1-2-document-overview.vtt",
//       transcript: "/media/tx-iabs-1-2-document-overview.txt",
//       label: "Optional video: Information About Brokerage Services — the IABS 1-2 form",
//       duration: "3:30",   // PROVISIONAL — replace with the MEASURED length of the delivered render
//       autoplay: false, controls: true, keyboardAccessible: true, captionsSelectable: true,
//       factualQcApproved: true, visualQcApproved: true,
//       logoSafeReviewed: true, accessibilityQcApproved: true,
//     }],
//   },
// }
```

`duration` above is the provisional estimate from §6, computed at 150 wpm from the final script. It
is not a measurement and must be replaced by one before the entry is ever added. The block player
(`public/statecourse/student/course/blocks/block-player.js`) reads `src`, `poster`, `captions`,
`transcript`, `label` and `duration`, tags every screen video "Optional" of its own accord, and
loads the reviewed plain-text transcript. The generator refuses a missing asset or approval flag,
which is why this entry stays commented out until the render passes QC.

`duration` above is the estimate from §6 and must be replaced with the measured length before the
entry is ever added.

---

## 12. Production status

| Item | State |
|---|---|
| Selection decision | **Complete** — selected, see the plan's §2 |
| Learning objective | **Complete** |
| Placement | **Fixed** — Module 02, T02U5, instruction screen `t02u5-s1`, confirmed in the generated LOA block map |
| Form-string verification | **Complete** — see §14 |
| Sources | **Held and verified** — IABS-1-2.pdf hash matches `source-inventory.json` |
| Script and narration | **Complete** |
| Highlight targets | **Complete in page-point space**, measured from the held PDF |
| HeyGen prompt | **Complete** |
| Band images (`iabs-*.png`) | **Not built** |
| MP4 render | **Not rendered** |
| VTT captions | **Cue text final; timings provisional.** Written to `video-production/captions/tx-iabs-1-2-document-overview.provisional.vtt`, deliberately not to `public/statecourse/media/`. Timings must be rebuilt from the render before the file ships |
| Poster | **Not built** — it is a frame of a render that does not exist, and was not composed by hand |
| Highlight pixel coordinates | **Not measurable** — they are measured on the delivered render's own frames |
| Student-facing display | **Not displayed.** No config entry exists, no player, no poster, no badge, no "video available" marker anywhere on any student- or reviewer-facing surface |

**Plainly: the asset is not yet rendered and is therefore not displayed.** Nothing in the course
references it, links to it or hints at it. There is no dead player, no nonfunctional poster, no
decorative video badge and no unavailable transcript anywhere. The first student-visible change
happens only after the MP4, the VTT and the poster all exist and are verified.

### Post-render pipeline (for whoever renders it)

1. Build the nine band PNGs from the held PDF per §5.1. Verify by pixel-diffing each band against the
   corresponding region of an independent rasterisation of the same PDF — the crop must be a copy,
   not a re-render of text.
2. Upload the nine PNGs and the §7 prompt. Render.
3. Download. Pixel-diff spot-check every document hold: the composition must be byte-identical across
   the hold. Any drift, zoom or overlay ⇒ reject and re-render.
4. Measure the true scene boundaries from the audio. Convert the §6 page-point highlight targets to
   render pixel coordinates on the delivered frames.
5. Write `tx-iabs-1-2-highlights.json` and run `california/video-production/post-highlights.py`
   (series-standard brick-red outline, navy margin labels).
6. Re-encode to the series bitrate profile. Build the VTT from the final render length. Extract the
   poster per §10.
7. Only then add the §11 config entry.

---

## 13. Accessibility checklist

- [x] An English caption file exists on disk as real, well-formed WebVTT — `video-production/captions/tx-iabs-1-2-document-overview.provisional.vtt` — with final cue text and a `NOTE` block
      declaring its timings provisional. It is held outside `public/statecourse/media/` so it
      cannot be served before a render exists.
- [ ] Captions delivered as a separate synchronized track (`.vtt`), **not burned into the image**
- [ ] Caption timings rebuilt from the delivered render's own audio, not carried over from §8's
      provisional set — this is a release gate, not a nicety
- [ ] Caption language declared `en`; the player's track is added with `srclang="en"` and a
      visible label, and the captions toggle is keyboard reachable
- [ ] Captions positioned clear of the region under discussion — the document occupies the frame
      centre, so captions sit in the lower ivory margin and never over highlighted text
- [ ] Clean transcript (§9) published as text on the same screen, so the video's content is fully
      available without playing it
- [ ] No information conveyed by colour alone — every highlight box is paired with a margin label
      naming the block in words
- [ ] Margin labels sit in the ivory margin, never across document text
- [ ] Highlighted provision fully inside the frame in every cue; no relevant heading cropped
- [ ] No overlay crosses the StateCourse logo
- [ ] Text/background contrast ≥ 4.5:1 for all overlays (deep navy on warm ivory; brick-red outlines
      used as emphasis only, never as the sole carrier of meaning)
- [ ] No flashing, strobing or rapid cuts; every document scene is a motionless hold
- [ ] Avatar presence is decorative to comprehension: all instruction is in the audio, the captions
      and the transcript
- [ ] Player is keyboard operable, with visible focus, and is not autoplay
- [ ] Poster carries the alt text in §10
- [ ] Video is optional and non-blocking: no progress gate, no completion requirement, no assessment
      depends on having watched it
- [ ] No quiz question, answer, or answer recap inside the video
- [ ] Retrieval lives on a later screen, never inside the video, and no highlight is on screen when
      the student is asked to retrieve — every video ends on the avatar with no document and no panel
- [ ] Nothing in the video, its captions, its poster, its transcript or its screen states or implies
      TREC approval, endorsement, review or licensure of the video, the course or StateCourse

---

## 14. Source-fidelity verification log

Every string this video puts on screen or reads aloud from the held form was checked against
`texas/trec-sources/forms/IABS-1-2.pdf` itself before it was written here — not against memory, not
against Module 02, and not against any secondary description of the form. Method: the single page
was opened with `pdfplumber`, its text lines and words extracted with their bounding boxes, the two
ligature glyphs the file encodes as `(cid:415)` (ti) and `(cid:425)` (tt) mapped back to their
letters, curly quotation marks folded to straight, whitespace collapsed — and each candidate string
tested for verbatim containment in the result. Statutory strings were checked the same way against
`texas/trec-sources/statutes/OC.1101.htm`.

**Result across the three-video set: 50 form strings verified verbatim, 0 mismatches**, plus the
statutory checks listed below. The held file's sha256 is
`5056930b66d237a7a4376db0c43f833929600f0b6e5ce6e42a417da824ef6b20`, matching
`texas/trec-sources/source-inventory.json`.

### Voicing conventions — the only permitted departures from the printed characters

Narration reads the page aloud, so four things are voiced rather than spelled. Each is a rendering of
the print, never a change to it, and nothing else is permitted:

1. **A printed slash is voiced "or".** `buyer/tenant` is read "buyer or tenant".
2. **Printed ALL-CAPS emphasis is voiced in ordinary case.** `A BROKER is responsible…` is read "A
   broker is responsible…".
3. **Parentheses around an apposition are voiced without the brackets.** `to each party (owner and
   buyer)` is read "to each party, owner and buyer".
4. **A statute's numbered subdivisions are voiced in order, joined by the statute's own conjunction.**
   § 1101.561(b)'s "(1) a buyer or tenant; and (2) a seller or landlord" is read "a buyer or tenant
   and a seller or landlord".

Applying those four rules and nothing else, **every fragment of narration that reads the form or the
statute is character-for-character the source text.** A reviewer can hold the page beside the
transcript and check it.

### Repairs made during this verification

The verification found nine places where narration was reading the form but had drifted from its
printed wording. All nine were repaired in the script, the prompt, the captions and the transcript
together, and the scene durations recomputed. They are listed here because a reviewer comparing an
earlier draft will see the difference:

| # | Scene | Was | Now — the form's printed wording |
|---|---|---|---|
| 1 | 1 | "Texas law requires every real estate license holder to give a written notice about brokerage services…" | "Texas law requires all real estate license holders to give the following information about brokerage services to prospective buyers, tenants, sellers and landlords." |
| 2 | 4 | the three client bullets compressed into noun phrases ("interests above all others…") | the three bullets read as printed: "Put the interests of the client above all others, including the broker's own interests;" / "Inform the client of any material information about the property or transaction received by the broker;" / "Answer the client's questions and present any offer to or counter-offer from the client." |
| 3 | 6 | "the broker becomes the owner's agent through an agreement with the owner, usually a written listing to sell…" | "the broker becomes the **property** owner's agent through an agreement with the owner, usually **in** a written listing to sell or property management agreement." |
| 4 | 7 | "by agreeing to represent the buyer…" (subject dropped) | "the broker becomes the buyer or tenant's agent by agreeing to represent the buyer, usually through a written representation agreement." |
| 5 | 7 | "those fees are not set by law and are fully negotiable" | "fees are not set by law and are fully negotiable" — the form's own words, with no demonstrative the form does not print |

Scenes 2, 3, 5, 8, 9 and 10 needed no repair; their quotations were already verbatim.

### Coordinate verification

Every highlight target in §6 is now the measured bounding box of the printed line, lines, or words it
names — not an estimate. Sub-line targets are given as word-exact rectangles, and a provision that
straddles a line break is drawn as one cue in two or three rectangles rather than as one loose box.
Band boundaries were checked for straddling: no printed line crosses any crop edge.

Two band boundaries were wrong and are corrected in §5.1: band G's foot (594 → 592, it fell inside
the printed `LICENSE HOLDER CONTACT INFORMATION:` line) and band H's head (588 → 592, it fell inside
`limited to no more than 14 days.`). Both would have cut a printed line in half.

Two highlight targets were wrong and are corrected in §6: Scene 4's parenthetical box, given as
`x ≈ 300–481.8`, started inside the word `person` and now reads the measured `x 237.7–481.8`; and
Scene 9's first cue, given as one box over two whole lines, swept in both the block label and the
unrelated `Please acknowledge receipt…` sentence, and is now two word-exact rectangles bounding only
the narrated sentence.

### What was NOT verified, and cannot be here

- **Highlight pixel coordinates.** Page-point space is as far as it is possible to go before a render
  exists. The conversion to render pixels is measured on the delivered frames.
- **Caption timings.** Provisional, computed at 150 wpm. Rebuilt from the render's audio.
- **The rendered frames themselves.** Nothing has been rendered, so no frame has been pixel-diffed
  against the held page. That check is step 3 of the post-render pipeline and it is a gate, not a
  formality.
