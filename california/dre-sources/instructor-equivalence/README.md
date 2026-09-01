# College instructor equivalence certification — how to run this

**Status:** not started. This is the longest-lead-time item in the California DRE submission,
and nothing in the application can substitute for it.

## What the requirement is

RE 303, under COURSE CONTENT:

> To obtain approval, curriculum must be equivalent to real estate courses offered by colleges or
> universities accredited by the Western Association of Schools and Colleges as recognized by the
> United States Department of Education.
>
> **If you write your own course content, it will be necessary to obtain a certification from a
> college instructor in the field of study for each specific course, confirming the course content
> is equivalent to course material used in a college or university course. This certification must
> be on official school letterhead and signed by the instructor.**

StateCourse writes its own content, so this applies to **all three courses**. Three certifications,
one per course, each from a college instructor in that field, each on their institution's letterhead,
each signed by them.

It is not on the RE 303 numbered checklist, which is why it is easy to miss. It is in the narrative
section above the checklist, and it is a condition of approval rather than an attachment.

## Why this is the first thing to start

Every other open item is under our own control: registering the LLC in California, obtaining the
missing forms, writing the remaining lessons. This one depends on **finding three people who are
willing**, on their schedules, and on their honest professional judgment of material they have not
seen yet.

It cannot be compressed at the end. Starting it now, while the content is still being written, also
converts it from a hurdle into an advantage: an instructor's comments on what is thin are worth far
more before the remaining depth is written than afterwards.

## Who qualifies

RE 303 says "a college instructor in the field of study." Working criteria:

- **Currently or recently teaching** the relevant subject — real estate practice, real estate
  principles, or real estate finance / mortgage lending — at a college or university.
- **At an institution accredited within the WASC system.** California community colleges are
  accredited through the WASC-affiliated commission for community and junior colleges, and most
  have real estate programs. That is the natural pool.
- **Able to use institutional letterhead**, which is what the certification must appear on.

Community college real estate faculty are the obvious first place to look: the subject matter is
exactly the same, many are practicing licensees themselves, and the courses they teach are the
courses the equivalence is measured against.

## What to send, in order

1. **`outreach-brief.md`** — the short first contact. One page. Its job is to get a yes to
   *"would you look at it"*, not a yes to signing.
2. **`dossier-<course>.md`** — the course dossier, generated from the actual lesson files. Outline,
   objectives, time allocation, assessment design, and an honest statement of current depth.
3. **Two or three complete lesson files** — send the real thing, not a summary. Suggested for Real
   Estate Practice: lessons 01, 06, and 14.
4. **`certification-letter-draft.md`** — only after they have reviewed and indicated willingness.
   Never in the first email.

## What not to do

- **Do not ask anyone to sign before they have read the material.** An instructor asked to certify
  something sight-unseen will decline, and should.
- **Do not send the draft letter first.** It reads as though the conclusion is already decided.
- **Do not describe the course as approved, or the application as filed.** Neither is true, and
  RE 303 prohibits representing an offering as DRE-approved before approval issues.
- **Do not hide the current depth.** The dossier states the page count against the RE 303 benchmark
  deliberately. An instructor who discovers the gap themselves will reasonably wonder what else was
  presented selectively.
- **Do not treat a refusal as a setback to argue with.** An instructor who reads the material and
  declines has given useful information about the material.

## Compensation

Paying a professional for review time is ordinary and appropriate. An honorarium for the review
should be offered openly, and it should be for the **review**, not for the outcome — the
certification is their professional judgment, and it has value only because it is theirs.

Ask them to confirm their institution's policy on outside professional work and on the use of
letterhead. Some institutions require disclosure or approval, and it is far better to raise that at
the start than to discover it after the letter is signed.

## Realistic timeline

| Stage | Expect |
| --- | --- |
| Identify candidates and make contact | 1–2 weeks |
| Response and initial willingness | 1–3 weeks, longer across academic breaks |
| Review of the material | 2–4 weeks |
| Revisions responding to their comments | Depends on what they find |
| Certification signed | After the revisions |

Academic calendars matter. The start of a term and finals weeks are the worst times to ask; mid-term
and the weeks before a term begins are the best.

**Approach more than three people.** Some will decline, some will not respond, and one may review
and honestly conclude the material is not yet equivalent — which is information worth having early.

## What to do with their comments

Their gap list is the most valuable output of this process, more than the signature. Record it, work
it into the curriculum, and go back to them with what changed. An instructor whose comments visibly
shaped the material is far more comfortable signing than one whose review disappeared into a file.

## Files in this directory

| File | Purpose | Generated? |
| --- | --- | --- |
| `README.md` | This process guide | Authored |
| `outreach-brief.md` | First contact, one page | Authored |
| `certification-letter-draft.md` | Draft language for the instructor to adapt | Authored |
| `dossier-ca-real-estate-practice-45.md` | Course dossier | **Generated** |
| `dossier-ca-real-estate-principles-45.md` | Course dossier | **Generated** |
| `dossier-ca-mortgage-loan-brokering-lending-45.md` | Course dossier | **Generated** |

Regenerate the dossiers after any curriculum change:

```
node scripts/generate-course-dossier.mjs
```
