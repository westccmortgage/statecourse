# Video 3 — Texas Intermediary Brokerage

**Series:** StateCourse *Document Overview*. Course: `tx-law-of-agency-30-v1` (Texas Law of Agency, 30 hours).
**Asset stem:** `tx-intermediary-brokerage`
**Status:** SCRIPT COMPLETE / PROMPT COMPLETE / **NOT RENDERED — NOT DISPLAYED.** See §12.

---

## 1. Learning objective

By the end of this video the student can:

1. state that Chapter 1101 does not contain the words *dual agent* or *dual agency*, that Texas
   therefore never created the capacity, and that the correct Texas term is **intermediary**;
2. state § 1101.561(b): a broker **must** agree to act as an intermediary if the broker agrees to
   represent both a buyer or tenant and a seller or landlord;
3. state the two things § 1101.559(a) requires before the capacity exists — written consent from each
   party, and a statement of the source of any expected compensation — and identify the second,
   separate authorisation that appointments require;
4. distinguish the two configurations, intermediary **without** appointments and intermediary **with**
   appointments, and say precisely what differs between them (advice) and what does not
   (confidentiality); and
5. state the three things an intermediary may not disclose without the party's specific written
   authorisation, and locate the qualifiers the consumer notice does not print.

**What text cannot do here.** This is a relationship structure, and its two configurations differ in
one variable while holding another constant. Prose has to say that serially — two pages describing
configuration one, two pages describing configuration two, then a paragraph asserting that
confidentiality is identical across both. A side-by-side panel says it in a single glance, and the
glance is what makes the distinction stick. The second thing video does here is corrective: the
student arrives carrying "dual agency" from national study material, and a spoken, direct instruction
to put the phrase down does work that a sentence in the middle of a page does not.

---

## 2. LOA-1 topic and unit

| | |
|---|---|
| Topic | **T06** — Representing More Than One Party in a Transaction: Intermediary Brokerage |
| Unit | **T06U3** — Representation of More Than One Party in a Transaction (30 prescribed minutes) |
| Form | LOA-1, revision 09/11/2024, transcribed at `config/texas/law-of-agency-course-form.mjs` |

The video draws on T06U1 (the terminology correction), T06U2 (consent, impartiality, § 1101.651(d))
and T06U3 (appointments, the two configurations). It is placed at **T06U3** because the two-
configuration comparison — the payload — is not complete until § 1101.560 has been taught, and by
T06U3 the student has already read the terminology correction in T06U1 and the consent mechanics in
T06U2.

---

## 3. Exact planned placement

**Module:** `texas/tx-law-of-agency-30-v1/curriculum/module-06.md`
**Unit heading:** `## Unit: Representation of More Than One Party in a Transaction`
**Screen it follows:** the unit's instruction screen, whose content range is

```
RANGE("## Unit: Representation of More Than One Party in a Transaction",
      "### Statute reading exercise: The mechanics of appointment")
```

Under the Texas block-map convention that screen will be **`t06u3-s1`**. The video attaches to
`t06u3-s1` and plays at the foot of that screen, after the unit's prose and after the paragraph
beginning "**Two more constraints that survive the intermediary posture.**".

**Screens that follow it, in order:**

1. `t06u3-s2` — practice: *Statute reading exercise: The mechanics of appointment*
2. `t06u3-s3` — retrieval check for T06U3

**Assessment separation.** Two screens between the video and the retrieval check, with a practice
screen between. No quiz question inside the video; no answer revealed immediately before a retrieval
check; the closing scene is a judgment point, not an answer recap; no highlight is on screen when
retrieval is asked.

**Authoring condition on the retrieval item.** `t06u3-s3` must not test the two-configuration contrast
in the exact terms Scene 5 states it, nor the three non-disclosure items in the order Scene 6 reads
them. Better targets, all in the module's prose and none stated in the video: the "only if" gate in
§ 1101.560(b) and which of its two conditions the consent must separately authorise; who must give the
written notice of appointment and to whom; the three lettered exceptions in § 1101.651(d)(3); the
scope limit in § 1101.560(c) ("during negotiations", "to the party to whom the license holder is
appointed"); what § 1101.561(a) does and does not displace.

**The block map now exists, and the placement is confirmed against it — not merely reserved.**
`config/texas/law-of-agency-module-6-blocks.mjs` was authored after this production file was drafted,
by `scripts/generate-tx-law-of-agency-block-maps.mjs` from the frozen module's own headings. Its
block `t06u3` (code `T06U3`, title "Representation of More Than One Party in a Transaction") carries exactly the three screens this file
predicted, with exactly the content ranges it predicted:

| Screen | Type | Title | Content range |
|---|---|---|---|
| `t06u3-s1` | instruction | Representation of More Than One Party in a Transaction | `RANGE("## Unit: Representation of More Than One Party in a Transaction", "### Statute reading exercise: The mechanics of appointment")` |
| `t06u3-s2` | practice | Statute reading exercise: The mechanics of appointment | begins at `### Statute reading exercise: The mechanics of appointment` |
| `t06u3-s3` | retrieval | Retrieval check | `questionId: "t06u3-q1"` |

The video attaches to **`t06u3-s1`**, the instruction screen, and plays at the foot of it. Read
against the block map, "the screen it follows" is therefore precise: it follows nothing inside the
unit — it is the last element of `t06u3-s1`, after that screen's whole content range, and the screen
it precedes is `t06u3-s2`.

**Nothing is wired.** That block map is a generated file, this production file does not edit it, and
no `screenMedia` entry for this video exists anywhere. The map's own header records that the Law of
Agency retrieval bank does not exist yet either, so no block in it is deliverable to a student today.
See §11 for the registry entry, written and commented **NOT ACTIVE**.

---

## 4. Source list

| Source | Held at | Used for |
|---|---|---|
| TREC form IABS 1-2, revision stamp 11-03-2025 | `texas/trec-sources/forms/IABS-1-2.pdf` — sha256 `5056930b66d237a7a4376db0c43f833929600f0b6e5ce6e42a417da824ef6b20` | Band F; every word quoted from the form |
| Texas Occupations Code ch. 1101 | `texas/trec-sources/statutes/OC.1101.htm` | § 1101.551(1); § 1101.559(a), (b), (c); § 1101.560(a), (b), (c); § 1101.561(a), (b); § 1101.651(d); § 1101.652(b)(7), (b)(8), (b)(16); § 1101.803 |
| 22 TAC § 535.2 | `texas/trec-sources/trec-rules/` | Brokerage agreements solicited and accepted in a broker's name; records |
| Module 06 as written | `texas/tx-law-of-agency-30-v1/curriculum/module-06.md`, Units 1–3 | The instructional frame the video must not contradict |
| LOA-1 course approval form | `config/texas/law-of-agency-course-form.mjs`; `texas/trec-sources/LOA-1.pdf` | Topic/unit placement |

**Held-source limits the narration respects.** No Texas case law construing § 1101.561(a) is held, and
the video makes no claim about the outer edge of the supersession clause. The Commission's promulgated
intermediary and appointment forms are not held, and the video describes no form's contents beyond the
IABS notice actually on screen.

**Nothing in this video, its captions, its poster, its transcript or its surrounding screen states or
implies that the video, the course, or StateCourse is approved, endorsed, reviewed or licensed by the
Texas Real Estate Commission.**

---

## 5. Document and diagram assets

**Master document:** `texas/trec-sources/forms/IABS-1-2.pdf` — the held official form, the only
permitted source of document pixels. Never recreated, re-typeset, re-flowed, filled in, or generated.

### 5.1 Document frame

Built by the same deterministic script as Videos 1 and 2 (see `iabs-1-2-document-overview.md` §5.1).
This video consumes one band:

| Asset | Band | y-top | y-bottom | Contains |
|---|---|---|---|---|
| `iabs-band-f.png` | F | 368 | 492 | `AS AGENT FOR BOTH - INTERMEDIARY:` heading, the written-consent paragraph, and all three bullets with their three sub-bullets |

Band F is 124 pt tall, composing to 360 px on the 1920 × 1080 ivory ground — the entire intermediary
block sits inside one frame with margin above, below and on both sides. No heading is cropped and no
highlighted provision runs off frame at any point.

**Deliberate division of one document across three videos.** Video 1 walks the page as a document and
explicitly hands band F forward without teaching it. Video 2 teaches bands D and G. This video teaches
band F. No band is taught twice.

### 5.2 Diagram panels

Two StateCourse-authored panels. They are **not** the form: they carry only StateCourse labels and
statutory section numbers, in the series typeface and palette, on warm ivory. **No sentence of form
language is typeset into a diagram.** Built deterministically as vector art (reportlab → PNG at
1920 × 1080), the same tooling `post-highlights.py` uses for margin labels, and uploaded to HeyGen as
finished stills.

| Asset | Content |
|---|---|
| `tx-intermediary-collision.png` | Three boxes on one row: **Seller — client**, **One brokerage**, **Buyer — client**. Under the seller, a tag `floor: protected`; under the buyer, a tag `ceiling: protected`. Across the centre box, a muted-red banner reading `Full agency to both — impossible`. Beneath everything, a navy rule: `§ 1101.561(b): the broker MUST act as intermediary`. Nothing else. |
| `tx-intermediary-configs.png` | Two half-frame panels separated by a thin navy rule. **Left, "Without appointments":** broker box marked `impartial — § 1101.559(c)` with lines to a seller box and a buyer box; footer `No one in the brokerage advises either party`. **Right, "With appointments":** the same broker box marked `impartial`, with two appointee boxes beneath it, one line each to seller and buyer; footer `Each appointee may advise their own party — § 1101.560(c)`. Across the full width beneath both panels, one shared bar: `Confidentiality is identical in both — § 1101.651(d)`. Nothing else. |

### 5.3 What is uploaded to HeyGen

`iabs-band-f.png`, `tx-intermediary-collision.png`, `tx-intermediary-configs.png`. Three stills.
HeyGen draws nothing, generates nothing, and moves nothing.

---

## 6. Scene-by-scene structure

Durations computed from word count at 150 wpm. **Estimates.** Measured durations replace them after
the render arrives.

| # | Visual | Duration |
|---|---|---|
| 1 | Avatar, medium shot | ≈ 20 s |
| 2 | `tx-intermediary-collision.png`, static hold | ≈ 32 s |
| 3 | `iabs-band-f.png`, static hold | ≈ 30 s |
| 4 | `iabs-band-f.png`, same hold continues | ≈ 25 s |
| 5 | `tx-intermediary-configs.png`, static hold | ≈ 25 s |
| 6 | `iabs-band-f.png`, static hold (return) | ≈ 38 s |
| 7 | Avatar, medium shot | ≈ 29 s |
| | **Total** | **≈ 3 min 20 s** |

---

### Scene 1 — Avatar introduction: put the phrase down

**Visual.** Avatar, medium shot, StateCourse branded set. No document.

**On-screen text.** Lower third, two lines, deep navy on ivory:
`Texas term: INTERMEDIARY` / smaller, in muted red: `not "dual agent"`
This is the only place in the video where the incorrect term appears on screen, and it appears struck
through, beneath the correct one — the correct word is always the visually dominant one.

**Narration.**
> If you have studied real estate anywhere else, you have met the phrase dual agent. Put it down.
> Search Chapter 1101 of the Occupations Code and the words dual agent and dual agency are not in
> it. Texas built a different role, with a different name and different rules.

---

### Scene 2 — The collision, and the statute's answer

**Visual.** Hard cut to `tx-intermediary-collision.png`. Static hold, no movement.

**Narration.**
> Here is the problem it solves. One brokerage lists a house and also represents the buyer who
> wants it. The seller's floor is protected. The buyer's ceiling is protected. Full agency to both
> is not a hard case; it is an impossible one. Section 1101.561(b) settles it: a broker must agree
> to act as an intermediary under this subchapter if the broker agrees to represent in a
> transaction a buyer or tenant and a seller or landlord. Must.

---

### Scene 3 — The written consent, on the consumer's own notice

**Visual.** Hard cut to `iabs-band-f.png`. Static hold, continues through Scene 4.

**Highlight (post-production).** One box on the heading-and-consent paragraph, from
`AS AGENT FOR BOTH - INTERMEDIARY:` through
`set forth the broker's obligations as an intermediary.`, from +2.4 s (caption cue 12) to the end of
the scene. Target region in page points: **x 26.4–582.5, y 372.4–403.2** — the bounding box of the
paragraph's three printed lines, exactly. The heading label is printed at the head of the first of
them, so it is inside the box, never cropped by it.
Margin label: header `THE PRECONDITION`, lines `Written agreement` / `of EACH party`.

From +11.2 s (caption cue 13) a second, narrower cue lands inside the first on the words
`in conspicuous bold or underlined print` only. That phrase straddles a line break on the printed
page, so it is drawn as **one cue in two rectangles** (two `scenes.json` entries sharing a start and
end, the first carrying the label):

- **x 487.7–582.5, y 382.9–392.8** — `in conspicuous bold or`, to the line's right edge
- **x 26.4–95.1, y 393.2–403.2** — `underlined print,` at the start of the next line

Both are word-exact; the earlier estimate of `x ≈ 26.4–260, y 392.9–403.2` marked only the phrase's
second half and swept in five following words, and has been replaced. Margin label:
header `EMPHASIS STANDARD`, lines `Conspicuous —` / `no point size`. This is a refinement of the same
provision, not a second new concept, so the inner cue may coexist with the outer box; the outer box
drops to a lighter weight when the inner one appears.

**Narration.**
> The consumer notice states the mechanics. To act as an intermediary between the parties the
> broker must first obtain the written agreement of each party to the transaction. The written
> agreement must state who will pay the broker and, in conspicuous bold or underlined print, set
> forth the broker's obligations as an intermediary. Written, from each party, stating who pays,
> with the prohibitions emphasised — conspicuous, and no point size, because the statute names
> none.

---

### Scene 4 — Impartiality, and the power to appoint

**Visual.** `iabs-band-f.png` continues. No cut, no movement.

**Highlight.** Scene 3's boxes clear at the scene boundary. Two sequential cues, never both on screen:
1. From +2.0 s to +6.0 s (caption cue 16), box on bullet one,
   `Must treat all parties to the transaction impartially and fairly;`
   Page points **x 35.4–297.5, y 403.3–413.7** — the printed bullet line, exactly.
   Margin label: header `THE BROKER'S STANDARD`, lines `Impartially` / `and fairly`.
2. From +6.0 s to +22.4 s (caption cue 17), that box clears; box on bullet two,
   `May, with the parties' written consent, appoint a different license holder…` through
   `…carry out the instructions of each party to the transaction.`
   Page points **x 35.4–582.4, y 414.0–434.9** — the bounding box of the bullet's two printed lines,
   exactly. Margin label: header `THE SECOND CONSENT`, lines `Consent to` / `appointments`.

**Narration.**
> Then what the broker does. Must treat all parties to the transaction impartially and fairly. And
> may, with the parties' written consent, appoint a different license holder associated with the
> broker to each party, owner and buyer, to communicate with, provide opinions and advice to, and
> carry out the instructions of each party to the transaction. Two consents doing two different
> jobs.

---

### Scene 5 — The two configurations

**Visual.** Hard cut to `tx-intermediary-configs.png`. Static hold, no movement. This is the frame the
whole video is built around; it is held motionless and given room.

**Narration.**
> So a Texas brokerage on both sides runs in one of two configurations. Without appointments: the
> broker is intermediary, impartial, carrying information — and nobody in the brokerage advises
> either party. With appointments: the broker stays impartial, and each party has a licensee who
> may give opinions and advice during negotiations, to that party only. The difference is advice.
> It is not confidentiality.

---

### Scene 6 — What may not be disclosed

**Visual.** Hard cut back to `iabs-band-f.png`. Static hold.

**Highlight.** Four sequential cues, one at a time. Every target is the bounding box of that
provision's own printed line or lines, exactly.

| Cue | Visible (provisional) | Target (page points) | Margin label |
|---|---|---|---|
| 1 — the bullet's opening line, `Must not, unless specifically authorized in writing to do so by the party, disclose:` | +2.4 → +8.8 s (cue 24) | x 35.4–375.7, y 435.1–445.5 | `THE UNLOCK` / `Only by specific` / `written authority` |
| 2 — sub-bullet one | +8.8 → +14.0 s (cue 25) | x 49.0–341.7, y 446.0–456.0 | `THE SELLER'S FLOOR` / `Will accept less` / `than asking` |
| 3 — sub-bullet two | +14.0 → +21.2 s (cue 26) | x 49.0–444.3, y 456.3–466.3 | `THE BUYER'S CEILING` / `Will pay more than` / `the written offer` |
| 4 — sub-bullet three, **both** its printed lines | +21.2 → +32.0 s (cue 27) | x 49.0–564.6, y 466.8–487.1 | `CONFIDENTIAL INFO` / `Anything put in writing —` / `unless the law compels` |

Cue 4's box deliberately includes the sub-bullet's second printed line,
`disclose, unless required to do so by law.` (y 477.1–487.1). That clause is part of the same
provision, the narration now reads it aloud, and boxing only the first line would have shown the
student a confidentiality rule with its exception cropped away.

**Narration.**
> Because confidentiality is identical in both. The intermediary must not, unless specifically
> authorized in writing to do so by the party, disclose: that the owner will accept a price less
> than the written asking price; that the buyer or tenant will pay a price greater than the price
> submitted in a written offer; and any confidential information or any other information that a
> party specifically instructs the broker in writing not to disclose, unless required to do so by
> law. The seller's floor and the buyer's ceiling stay on their own sides of the wall.

---

### Scene 7 — The judgment point, and close

**Visual.** Return to avatar, medium shot. No document, no panel — deliberately, because the final
point is about a qualifier the notice on screen does **not** print, and leaving the form up while
saying so would invite the student to look for words that are not there. No end card, no recap card,
no "next" slide.

**On-screen text.** None.

**Narration.**
> Two things to carry out of here. An appointment is not a release. Section 1101.651(d) binds the
> broker and every license holder the broker appoints, so an appointed agent advises inside a
> confidentiality cage. And the notice is a summary: the statute carries qualifiers the form does
> not print, including that confidentiality never covers information materially relating to the
> condition of the property. It protects negotiating position. It has never protected a defect.

---

## 7. HeyGen-ready production prompt

```
Create a professional educational training video for StateCourse, an online real estate licensing
education platform. This belongs to the same series as "Loan Estimate — Page 1/2/3", "The Promissory
Note", "The Deed of Trust" and "Information About Brokerage Services", and must match them in
presenter, set, tone, typography and pacing.

FORMAT
16:9 landscape, 1920x1080.
Target length: approximately 3 minutes 10 seconds.
Professional adult-learning course, not social media.
Clean, premium, academic visual style.
Warm ivory background, deep navy typography, restrained muted red accents.
No flashy transitions. No stock-footage montage. No motivational or sales language.
No background music that competes with narration.

PRESENTER
Use my selected professional male avatar — the same avatar, wardrobe and StateCourse branded set as
the previous videos in this series.
Delivery: calm, clear, authoritative, conversational; not theatrical, not rushed.
The avatar appears in the first scene and the last scene only. Every other scene shows an attached
image and not the presenter.

SOURCE IMAGES — LOCKED
I will attach three still images, already composed to 1920x1080. One is a high-resolution rendering of
part of one page of an official Texas government form. Two are finished diagram panels. All three are
a locked source layer.

Do NOT use generative AI to reconstruct, enhance, repair, sharpen, replace, retype, re-flow, recolour
or rewrite any part of any attached image.
Do NOT add, remove or alter one character of the text visible in them.
Do NOT redraw, restyle or "improve" the diagram panels.
Do NOT overlay any text, box, arrow, outline, callout, label, logo or graphic on top of any attached
image. Highlighting is added later in post-production and must NOT be attempted here.
Do NOT zoom, pan, crop, scale, tilt, drift or apply any camera movement while an image is on screen.
Each image is a completely static, motion-free hold, full frame, undistorted, at its delivered
composition. The ONLY permitted visual change during these scenes is a hard cut between images.
Note that image "iabs-band-f" is used twice, in Scene 3 and again in Scene 6. Both appearances must be
the identical, unaltered image at the identical composition.

SCENE STRUCTURE

Scene 1 — Avatar introduction. Medium shot, clean StateCourse branded background.
On-screen title: "Texas term: INTERMEDIARY" with a smaller second line, in muted red and struck
through, reading: not "dual agent".
Script: "If you have studied real estate anywhere else, you have met the phrase dual agent. Put it down.
Search Chapter 1101 of the Occupations Code and the words dual agent and dual agency are not in
it. Texas built a different role, with a different name and different rules."
Duration: 19-21 seconds.

Scene 2 — Hard cut to image "tx-intermediary-collision". Static hold. Avatar off screen.
Script: "Here is the problem it solves. One brokerage lists a house and also represents the buyer who wants
it. The seller's floor is protected. The buyer's ceiling is protected. Full agency to both is not
a hard case; it is an impossible one. Section 1101.561(b) settles it: a broker must agree to act
as an intermediary under this subchapter if the broker agrees to represent in a transaction a
buyer or tenant and a seller or landlord. Must."
Duration: 31-33 seconds.

Scene 3 — Hard cut to image "iabs-band-f". Static hold begins.
Script: "The consumer notice states the mechanics. To act as an intermediary between the parties the broker
must first obtain the written agreement of each party to the transaction. The written agreement
must state who will pay the broker and, in conspicuous bold or underlined print, set forth the
broker's obligations as an intermediary. Written, from each party, stating who pays, with the
prohibitions emphasised — conspicuous, and no point size, because the statute names none."
Duration: 29-31 seconds.

Scene 4 — Image "iabs-band-f" continues. No cut, no movement.
Script: "Then what the broker does. Must treat all parties to the transaction impartially and fairly. And
may, with the parties' written consent, appoint a different license holder associated with the
broker to each party, owner and buyer, to communicate with, provide opinions and advice to, and
carry out the instructions of each party to the transaction. Two consents doing two different
jobs."
Duration: 24-26 seconds.

Scene 5 — Hard cut to image "tx-intermediary-configs". Static hold. Give this frame room; it is the
centre of the video.
Script: "So a Texas brokerage on both sides runs in one of two configurations. Without appointments: the
broker is intermediary, impartial, carrying information — and nobody in the brokerage advises
either party. With appointments: the broker stays impartial, and each party has a licensee who may
give opinions and advice during negotiations, to that party only. The difference is advice. It is
not confidentiality."
Duration: 24-26 seconds.

Scene 6 — Hard cut back to image "iabs-band-f". Static hold.
Script: "Because confidentiality is identical in both. The intermediary must not, unless specifically
authorized in writing to do so by the party, disclose: that the owner will accept a price less
than the written asking price; that the buyer or tenant will pay a price greater than the price
submitted in a written offer; and any confidential information or any other information that a
party specifically instructs the broker in writing not to disclose, unless required to do so by
law. The seller's floor and the buyer's ceiling stay on their own sides of the wall."
Duration: 37-39 seconds.

Scene 7 — Return to avatar, medium shot.
Script: "Two things to carry out of here. An appointment is not a release. Section 1101.651(d) binds the
broker and every license holder the broker appoints, so an appointed agent advises inside a
confidentiality cage. And the notice is a summary: the statute carries qualifiers the form does
not print, including that confidentiality never covers information materially relating to the
condition of the property. It protects negotiating position. It has never protected a defect."
Duration: 28-30 seconds.

END OF VIDEO.
Do NOT add a recap scene after the avatar's closing line.
Do NOT add an end card, title card, credits or "Next:" slide.
The video ends on the avatar's final sentence.

VISUAL RULES
- The attached images are the central visual, shown exactly as delivered.
- No highlight box, outline, arrow or margin label anywhere in this video. Highlights are added
  downstream in post-production.
- No camera movement, zoom or pan at any point while an image is on screen. Hard cuts only.
- Keep any overlay title fully clear of the StateCourse logo.
- No decorative imagery. No houses, keys, handshakes, smiling families, money, city skylines,
  for-sale signs, scales of justice, or stock footage of any kind.

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
full-frame, undistorted, unmoved, uncropped and unaltered, with no text overlaid and no colour shift.
The only visual changes across Scenes 2 through 6 are the hard cuts between images, and image
"iabs-band-f" must be pixel-identical in Scene 3 and Scene 6. If the camera moves, zooms, drifts, or
the composition changes even once during any hold, reject and re-render.
```

---

## 8. Caption-ready transcript

**On disk:** `texas/tx-law-of-agency-30-v1/video-production/captions/tx-intermediary-brokerage.provisional.vtt` — a
real, well-formed WebVTT file, written and kept **outside** `public/statecourse/media/` on purpose,
so that nothing can serve it by accident before a render exists. Its first block is a `NOTE` saying
so in the file itself.

**Cue text is final.** Every cue matches the recorded script word for word, and every fragment that
reads the held form or the held statute has been checked against the source character by character
(§14).

**Cue TIMINGS are PROVISIONAL.** They are computed at 150 words per minute — the delivery rate of the
existing series — with a 1.4-second readability floor on very short cues, and they are placeholders.
No render exists, so no timing here was measured from audio. Before the file ships to
`/media/tx-intermediary-brokerage.vtt` the timings must be rebuilt from the delivered render's own
audio, by silence-gap detection cross-validated against word-count pacing, exactly as the sibling
captions in `public/statecourse/media/` were built. The cue text does not change when that happens;
only the timestamps do.

```vtt
WEBVTT

NOTE
PROVISIONAL TIMINGS — see the header of the on-disk file. Cue text is final;
cue timings are placeholders computed at 150 wpm and must be rebuilt from the render.

00:00:00.300 --> 00:00:06.300
If you have studied real estate anywhere else, you have met the phrase dual
agent.

00:00:06.300 --> 00:00:07.700
Put it down.

00:00:07.700 --> 00:00:15.300
Search Chapter 1101 of the Occupations Code and the words dual agent and dual
agency are not in it.

00:00:15.300 --> 00:00:20.100
Texas built a different role, with a different name and different rules.

00:00:20.100 --> 00:00:22.500
Here is the problem it solves.

00:00:22.500 --> 00:00:27.700
One brokerage lists a house and also represents the buyer who wants it.

00:00:27.700 --> 00:00:29.700
The seller's floor is protected.

00:00:29.700 --> 00:00:31.700
The buyer's ceiling is protected.

00:00:31.700 --> 00:00:37.300
Full agency to both is not a hard case; it is an impossible one.

00:00:37.300 --> 00:00:50.900
Section 1101.561(b) settles it: a broker must agree to act as an intermediary
under this subchapter if the broker agrees to represent in a transaction a
buyer or tenant and a seller or landlord.

00:00:50.900 --> 00:00:52.300
Must.

00:00:52.300 --> 00:00:54.700
The consumer notice states the mechanics.

00:00:54.700 --> 00:01:03.500
To act as an intermediary between the parties the broker must first obtain the
written agreement of each party to the transaction.

00:01:03.500 --> 00:01:13.500
The written agreement must state who will pay the broker and, in conspicuous
bold or underlined print, set forth the broker's obligations as an
intermediary.

00:01:13.500 --> 00:01:22.300
Written, from each party, stating who pays, with the prohibitions emphasised —
conspicuous, and no point size, because the statute names none.

00:01:22.300 --> 00:01:24.300
Then what the broker does.

00:01:24.300 --> 00:01:28.300
Must treat all parties to the transaction impartially and fairly.

00:01:28.300 --> 00:01:44.700
And may, with the parties' written consent, appoint a different license holder
associated with the broker to each party, owner and buyer, to communicate
with, provide opinions and advice to, and carry out the instructions of each
party to the transaction.

00:01:44.700 --> 00:01:47.100
Two consents doing two different jobs.

00:01:47.100 --> 00:01:52.300
So a Texas brokerage on both sides runs in one of two configurations.

00:01:52.300 --> 00:01:59.500
Without appointments: the broker is intermediary, impartial, carrying
information — and nobody in the brokerage advises either party.

00:01:59.500 --> 00:02:09.100
With appointments: the broker stays impartial, and each party has a licensee
who may give opinions and advice during negotiations, to that party only.

00:02:09.100 --> 00:02:12.300
The difference is advice. It is not confidentiality.

00:02:12.300 --> 00:02:14.700
Because confidentiality is identical in both.

00:02:14.700 --> 00:02:21.100
The intermediary must not, unless specifically authorized in writing to do so
by the party, disclose:

00:02:21.100 --> 00:02:26.300
that the owner will accept a price less than the written asking price;

00:02:26.300 --> 00:02:33.500
that the buyer or tenant will pay a price greater than the price submitted in
a written offer;

00:02:33.500 --> 00:02:44.300
and any confidential information or any other information that a party
specifically instructs the broker in writing not to disclose, unless required
to do so by law.

00:02:44.300 --> 00:02:50.300
The seller's floor and the buyer's ceiling stay on their own sides of the
wall.

00:02:50.300 --> 00:02:53.100
Two things to carry out of here.

00:02:53.100 --> 00:02:55.500
An appointment is not a release.

00:02:55.500 --> 00:03:03.900
Section 1101.651(d) binds the broker and every license holder the broker
appoints, so an appointed agent advises inside a confidentiality cage.

00:03:03.900 --> 00:03:15.500
And the notice is a summary: the statute carries qualifiers the form does not
print, including that confidentiality never covers information materially
relating to the condition of the property.

00:03:15.500 --> 00:03:19.500
It protects negotiating position. It has never protected a defect.
```

---

## 9. Clean transcript

> If you have studied real estate anywhere else, you have met the phrase dual agent. Put it down.
> Search Chapter 1101 of the Occupations Code and the words dual agent and dual agency are not in
> it. Texas built a different role, with a different name and different rules.
>
> Here is the problem it solves. One brokerage lists a house and also represents the buyer who
> wants it. The seller's floor is protected. The buyer's ceiling is protected. Full agency to both
> is not a hard case; it is an impossible one. Section 1101.561(b) settles it: a broker must agree
> to act as an intermediary under this subchapter if the broker agrees to represent in a
> transaction a buyer or tenant and a seller or landlord. Must.
>
> The consumer notice states the mechanics. To act as an intermediary between the parties the
> broker must first obtain the written agreement of each party to the transaction. The written
> agreement must state who will pay the broker and, in conspicuous bold or underlined print, set
> forth the broker's obligations as an intermediary. Written, from each party, stating who pays,
> with the prohibitions emphasised — conspicuous, and no point size, because the statute names
> none.
>
> Then what the broker does. Must treat all parties to the transaction impartially and fairly. And
> may, with the parties' written consent, appoint a different license holder associated with the
> broker to each party, owner and buyer, to communicate with, provide opinions and advice to, and
> carry out the instructions of each party to the transaction. Two consents doing two different
> jobs.
>
> So a Texas brokerage on both sides runs in one of two configurations. Without appointments: the
> broker is intermediary, impartial, carrying information — and nobody in the brokerage advises
> either party. With appointments: the broker stays impartial, and each party has a licensee who
> may give opinions and advice during negotiations, to that party only. The difference is advice.
> It is not confidentiality.
>
> Because confidentiality is identical in both. The intermediary must not, unless specifically
> authorized in writing to do so by the party, disclose: that the owner will accept a price less
> than the written asking price; that the buyer or tenant will pay a price greater than the price
> submitted in a written offer; and any confidential information or any other information that a
> party specifically instructs the broker in writing not to disclose, unless required to do so by
> law. The seller's floor and the buyer's ceiling stay on their own sides of the wall.
>
> Two things to carry out of here. An appointment is not a release. Section 1101.651(d) binds the
> broker and every license holder the broker appoints, so an appointed agent advises inside a
> confidentiality cage. And the notice is a summary: the statute carries qualifiers the form does
> not print, including that confidentiality never covers information materially relating to the
> condition of the property. It protects negotiating position. It has never protected a defect.

---

## 10. Poster specification

| | |
|---|---|
| Path | `public/statecourse/media/tx-intermediary-brokerage-poster.webp` |
| Dimensions | 1280 × 720 |
| Format | WebP, quality 80, target ≤ 60 KB |
| Frame | Extracted from the **delivered final render**, from the middle of Scene 5's static hold on `tx-intermediary-configs.png` — the two-configuration comparison is the video's identity |
| Content | The two-configuration panel. No overlay, no burned-in play button, no added text |
| Alt text | `Still frame from the video: a side-by-side diagram of Texas intermediary brokerage without appointments and with appointments, noting that confidentiality is identical in both.` |
| Constraint | A frame of the render. Never composed by hand, never generated. **It does not exist until the render exists** — see §12 |

---

## 11. Optional / non-blocking configuration

**Rule.** The video is optional. A student completes T06U3, Module 06 and the course without watching
it. Equivalent written instruction already exists and is not abbreviated on account of the video:

- `module-06.md`, `## Unit: Representation of More Than One Party in a Transaction` — teaches
  § 1101.560 clause by clause: who may appoint, who may be appointed, both conditions in subsection (b)
  and the force of "only if", what subsection (c) buys and its scope limits, both configurations in
  full, and the fact that an appointment does not lift § 1101.651(d).
- `module-06.md`, `## Unit: Intermediary Brokerage` — teaches § 1101.559(a), (b) and (c) including the
  conspicuousness-not-point-size point, and § 1101.651(d)(1)–(5) in full with every qualifier and all
  three lettered exceptions, including the condition-of-the-property exception.
- `module-06.md`, `## Unit: The Path from Dual Agency to Intermediary Brokerage` — teaches why Texas
  vocabulary is not "dual agency", § 1101.561(b)'s mandatory intermediary, and the distinct meaning of
  "dual capacity" in § 1101.652(b)(16).

Everything the video says is in that prose. Nothing was removed from the prose to make room for it.

**Optional video time is not counted toward LOA-1's required 1,500 minutes.** T06U3's 30 prescribed
minutes are spent on reading and activity minutes under `config/texas/law-of-agency-time-budget.mjs`.
This video's ≈ 3 minutes 20 seconds are additional and unbudgeted; adding it changes no figure in that file, and
no figure was reduced to make room for it.

**Registry entry — WRITTEN, AND COMMENTED *NOT ACTIVE*.** Recorded so the wiring is unambiguous
when it happens, not so that it can happen now. Adding it before the MP4, the poster and the shipping
`.vtt` all exist and have passed factual, visual and accessibility QC would put a dead player, a
missing poster and a 404 caption track on a student-facing screen — worse than no video at all.

**Where it goes, exactly.** `config/texas/law-of-agency-module-6-blocks.mjs` now exists, and screen
`t06u3-s1` is in it, with the content range this production file predicted. But that file's own header
reads *"GENERATED FILE … Do not edit by hand — regenerate"*: it is written by
`scripts/generate-tx-law-of-agency-block-maps.mjs` from the frozen module's headings. So the entry
below is **not** pasted into the generated file. It is attached the way California attaches its
Loan Estimate and Promissory Note videos — as a hand-authored `screenMedia` spec keyed by screen id,
which the generator merges onto the screen it names and which refuses to generate if the screen id
does not exist (`scripts/lib/generate-ca-block-maps.mjs`, the `spec.screenMedia` block). The Texas
generator core, `scripts/lib/generate-tx-block-maps.mjs`, does **not** carry that hook yet. Adding it
is a prerequisite of activation. It is recorded as open item 3 in
`video-production/production-readiness-addendum.md` §8 — not in the video instruction plan, which is
a hashed artifact of the curriculum freeze and was left byte-identical by this pass. Nothing here
edits any of those files.

```js
// NOT ACTIVE — DO NOT ADD. This is a record of the intended wiring, not the wiring.
// Add ONLY when all four of these exist and have passed factual, visual and accessibility QC:
//   public/statecourse/media/tx-intermediary-brokerage.mp4
//   public/statecourse/media/tx-intermediary-brokerage-poster.webp
//   public/statecourse/media/tx-intermediary-brokerage.vtt        (timings rebuilt from the render)
//   the clean transcript of §9, published as text on screen t06u3-s1
// Route: a hand-authored screenMedia spec consumed by
// scripts/generate-tx-law-of-agency-block-maps.mjs — never a hand edit to the generated
// config/texas/law-of-agency-module-6-blocks.mjs.
//
// screenMedia: {
//   "t06u3-s1": {
//     videos: [{
//       src: "/media/tx-intermediary-brokerage.mp4",
//       poster: "/media/tx-intermediary-brokerage-poster.webp",
//       captions: "/media/tx-intermediary-brokerage.vtt",
//       label: "Optional video: Texas intermediary brokerage — consent, appointments, and what stays unsaid",
//       duration: "3:20",   // PROVISIONAL — replace with the MEASURED length of the delivered render
//     }],
//   },
// }
```

`duration` above is the provisional estimate from §6, computed at 150 wpm from the final script. It
is not a measurement and must be replaced by one before the entry is ever added. The block player
(`public/statecourse/student/course/blocks/block-player.js`) reads `src`, `poster`, `captions`,
`label` and `duration`, tags every screen video "Optional" of its own accord, and builds the
transcript disclosure from the caption track — so no `optional: true` flag is needed or read, and a
missing `.vtt` would silently produce a video with no transcript. That is the second reason this
entry stays commented out.

---

## 12. Production status

| Item | State |
|---|---|
| Selection decision | **Complete** — selected, see the plan's §2 |
| Learning objective | **Complete** |
| Placement | **Fixed** — Module 06, T06U3, instruction screen `t06u3-s1` (screen id reserved; the LOA block map is not yet authored) |
| Form-string verification | **Complete** — see §14 |
| Sources | **Held and verified** |
| Script and narration | **Complete** |
| Highlight targets | **Complete in page-point space**, measured from the held PDF |
| Diagram panel specs | **Complete** — content specified; panels not built |
| HeyGen prompt | **Complete** |
| Band image and diagram panels | **Not built** |
| MP4 render | **Not rendered** |
| VTT captions | **Cue text final; timings provisional.** Written to `video-production/captions/tx-intermediary-brokerage.provisional.vtt`, deliberately not to `public/statecourse/media/`. Timings must be rebuilt from the render before the file ships |
| Poster | **Not built** — it is a frame of a render that does not exist, and was not composed by hand |
| Highlight pixel coordinates | **Not measurable** until the render exists |
| Student-facing display | **Not displayed.** No config entry, no player, no poster, no badge, no "video available" marker on any student- or reviewer-facing surface |

**Plainly: the asset is not yet rendered and is therefore not displayed.** The post-render pipeline is
the one in `iabs-1-2-document-overview.md` §12, with `tx-intermediary-brokerage-highlights.json` in
place of the Video 1 highlights file. One extra check for this video: verify that `iabs-band-f.png` is
pixel-identical in Scenes 3 and 6, because the Scene 6 highlight coordinates are reused from Scene 3's
measurement.

---

## 13. Accessibility checklist

- [x] An English caption file exists on disk as real, well-formed WebVTT — `video-production/captions/tx-intermediary-brokerage.provisional.vtt` — with final cue text and a `NOTE` block
      declaring its timings provisional. It is held outside `public/statecourse/media/` so it
      cannot be served before a render exists.
- [ ] Captions delivered as a separate synchronized track (`.vtt`), **not burned into the image**
- [ ] Caption timings rebuilt from the delivered render's own audio, not carried over from §8's
      provisional set — this is a release gate, not a nicety
- [ ] Caption language declared `en`; the player's track is added with `srclang="en"` and a
      visible label, and the captions toggle is keyboard reachable
- [ ] Captions positioned clear of the region under discussion; they sit in the lower ivory margin and
      never over highlighted text or over a diagram panel's labels
- [ ] Clean transcript (§9) published as text on the same screen
- [ ] No information conveyed by colour alone — every highlight box is paired with a margin label
      naming the provision in words; the two configurations are distinguished by position, heading and
      label, never by colour alone
- [ ] The struck-through incorrect term in Scene 1 is also spoken and captioned as incorrect, so the
      strike-through is not the only signal
- [ ] Margin labels sit in the ivory margin, never across document text
- [ ] Highlighted provision fully inside the frame in every cue; no relevant heading cropped
- [ ] No overlay crosses the StateCourse logo
- [ ] Text/background contrast ≥ 4.5:1 for all overlays and all diagram-panel text
- [ ] Diagram panels legible at 50% player width; minimum panel type size 32 px at 1920 × 1080; the
      two-configuration panel's left/right split remains readable when the player is narrow
- [ ] No flashing, strobing or rapid cuts; every non-avatar scene is a motionless hold
- [ ] Player keyboard operable, visible focus, not autoplay
- [ ] Poster carries the alt text in §10
- [ ] Video optional and non-blocking: no progress gate, no completion requirement, no assessment
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
against Module 06, and not against any secondary description of the form. Method: the single page
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

| # | Scene | Was | Now — the source's wording |
|---|---|---|---|
| 1 | 2 | "a broker must agree to act as an intermediary if the broker agrees to represent both a buyer or tenant and a seller or landlord" | § 1101.561(b) as enacted: "a broker must agree to act as an intermediary **under this subchapter** if the broker agrees to **represent in a transaction** a buyer or tenant and a seller or landlord" |
| 2 | 4 | bullet two ended "…carry out the instructions of each party." | "…and carry out the instructions of each party **to the transaction**." |
| 3 | 6 | sub-bullet three read "and any confidential information a party instructs the broker in writing not to disclose." | "and any confidential information **or any other information** that a party **specifically** instructs the broker in writing not to disclose, **unless required to do so by law**." |

Repair 3 is the most consequential of the nine made across the set. The earlier line dropped a
statutory exception — *unless required to do so by law* — from a confidentiality rule, while the
highlight box around that sub-bullet showed the student the exception on the page. The narration now
reads the provision whole.

Scenes 1, 3, 5 and 7 needed no repair.

**Statutory checks for this video, all against the held `OC.1101.htm`:** the words *dual agent* and
*dual agency* appear **zero** times in Chapter 1101 (the phrase *dual capacity* appears once, in
§ 1101.652(b)(16), and means something else — taught in Module 06's prose, not here);
§ 1101.559(a)'s two written-consent requirements; § 1101.559(c)'s "act fairly and impartially";
§ 1101.560(a)–(c), including (b)'s "only if" and (c)'s "during negotiations, to the party to whom
the license holder is appointed"; § 1101.561(b)'s "must"; and § 1101.651(d), which binds "A broker
and any broker or sales agent appointed under Section 1101.560", and whose (d)(3)(C) exception reads
"the information materially relates to the condition of the property". Scene 7's closing judgment
point rests on that last clause and quotes its sense, not a paraphrase of it.

### Coordinate verification

Every highlight target in §6 is now the measured bounding box of the printed line, lines, or words it
names — not an estimate. Sub-line targets are given as word-exact rectangles, and a provision that
straddles a line break is drawn as one cue in two or three rectangles rather than as one loose box.
Band boundaries were checked for straddling: no printed line crosses any crop edge.

One highlight target was wrong and is corrected in §6: Scene 3's inner cue on
`in conspicuous bold or underlined print` was given as `x ≈ 26.4–260, y 392.9–403.2`. That phrase
straddles a line break on the printed page, so the estimate marked only its second half and swept in
five words that follow it. It is now one cue in two word-exact rectangles —
`x 487.7–582.5, y 382.9–392.8` and `x 26.4–95.1, y 393.2–403.2` — bounding the phrase and nothing
else.

Scene 6's fourth cue is confirmed as deliberately covering **both** printed lines of sub-bullet three
(y 466.8–487.1), so the exception clause `disclose, unless required to do so by law.` is inside the
box the narration is reading. Band F's boundaries were checked for straddling and are clean.

### What was NOT verified, and cannot be here

- **Highlight pixel coordinates.** Page-point space is as far as it is possible to go before a render
  exists. The conversion to render pixels is measured on the delivered frames.
- **Caption timings.** Provisional, computed at 150 wpm. Rebuilt from the render's audio.
- **The rendered frames themselves.** Nothing has been rendered, so no frame has been pixel-diffed
  against the held page. That check is step 3 of the post-render pipeline and it is a gate, not a
  formality.
