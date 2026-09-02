# Instructor qualification dossier — Texas qualifying education

**Status: template. No instructor has been approached, named, or recorded. No dossier exists.**

**The provider documents the qualification, and the provider is answerable for it.** This project
does not use the idea of a universal current "TREC instructor licence"; no source read here creates
one. What the provider must be able to show is that a named person is qualified **for the specified
course**.

---

## What is held, and what that is worth

**§ 535.63 has been read — from TREC's published copy, not from the codified text.** TREC's own
consolidated reproduction of 22 TAC § 535.63 is held at `texas/trec-sources/trec-rules/535.63.txt`
(sha256 `ac9a7c94…`, 1,368 bytes, retrieved 2026-08-29), and is registered subsection by subsection
as controlling for this dossier in `config/texas/law-of-agency-statute-sources.mjs` and
`config/texas/trec-rules-source-lock.mjs`. Every route below is quoted or summarised from that file.

**What that does not settle.** The Secretary of State's **codified** 22 TAC text has never been
readable from this environment: `texas-sos.appianportalsgov.com` serves a JavaScript shell to a
non-browser client, and the legacy `texreg.sos.state.tx.us` reader redirects to it. So
`TX_PROVIDER_RULE_SOURCE_LOCK` in `config/texas/regulatory-manifest.mjs` still returns **FAIL**, and
the accurate status of every route below is **held from TREC's published copy; codified text not
compared** — weaker than verified, and much stronger than the "could not be read" this file claimed
until 2026-08-30. § 535.63 remains item 4 on `texas/submission/human-export-list.md`; when a person
exports it, checking it is a diff against a hashed file rather than a fresh reading.

**Where the subsection letters come from.** TREC's page prints § 535.63 as indentation with no
lettering. The (a) / (b)(1)–(3) / (c) structure used below is this project's reading of that nesting
— `identifierBasis: "held-page-nesting"` in the registers — corroborated by the rule's own words: it
excepts "subsection (c) of this section", and its third route is "the equivalent of subsection
(b)(1) or (2) of this section".

The §535.65 letters cited further down now rest on the Secretary of State's final adoption. The
28 August 2026 Texas Register is held at
`texas/trec-sources/texas-register/2026-08-28-title22-adopted-rules.html` and republishes §535.65 in
full, effective 31 August 2026. The live TAC caveat remains only for §535.63.

---

## The duty that comes before the routes — § 535.63(a)

> *"A provider must ensure that an instructor who teaches real estate, easement or right-of-way, or
> real estate inspection qualifying courses is competent in the subject matter to be taught and has
> the ability to teach effectively."*

Two things follow, and both survived opening the file. The duty is the **provider's**, and the held
rule creates **no Commission-issued instructor credential** — nothing in it supports the idea of a
current TREC instructor licence. Competence and ability to teach are not discharged by satisfying a
route; item 13 below is where the provider records that it satisfied itself on both.

## The routes — a candidate satisfies one

§ 535.63(b): *"Except as provided by subsection (c) of this section, the provider must use an
instructor who possesses the following qualifications:"*

**Route 1 — degree and teaching.** *(§ 535.63(b)(1) — held from TREC's published copy; codified text
not compared)*

> *"a college degree in the subject area to be taught and three years of experience in teaching or
> training"*

**Route 2 — licensed experience and teaching.** *(§ 535.63(b)(2) — same basis)*

> *"five years of active experience as a license holder (broker for Real Estate Brokerage and Broker
> Responsibility courses) and three years of experience in teaching or training"*

*Two corrections against the held sentence.* The rule says **license holder**, not *Texas* licence
holder; the word "Texas" was in this file before the rule was held and is not in the text. And the
broker parenthetical narrows the route for two named courses — Real Estate Brokerage and Broker
Responsibility — so it must not be dropped when the route is quoted for a course it does not reach.

**Route 3 — provider-documented equivalent.** *(§ 535.63(b)(3) — same basis)*

> *"the equivalent of subsection (b)(1) or (2) of this section as determined by the provider after
> consideration of the instructor's professional experience, research, authorship, or other
> significant endeavors in real estate, easement or right-of-way, or real estate inspection"*

**§ 535.63(c) — not applicable, recorded so the scope of (b) is visible.** The exception covers
Texas Standards of Practice and Inspector Legal and Ethics and Standards of Practice Review, which
require five years of active Texas professional inspector licensure plus either 200 inspections or
three years of teaching or sponsoring experience. No course this project builds is an inspector
course, so (b) governs.

## What § 535.63 does **not** contain

**The guest-instructor 10% cap is not in this rule.** The held § 535.63 does not mention guest
instructors at all. The cap is § 535.65(b)(5) and is recorded below. This is written down rather
than silently fixed, because a citation that does not survive opening the file is exactly the defect
these registers exist to catch.

## The § 535.65 provisions a dossier also has to satisfy

*Text and lettering from the Secretary of State's final 28 August 2026 adoption.*

- **§ 535.65(b)(1)** — a provider must use an instructor *currently qualified under § 535.63* to
  teach **the specified course**. This is what makes item 12 below a required field rather than an
  administrative nicety: the qualification is per course, not per person.
- **§ 535.65(b)(2)** — *"Each instructor shall be selected on the basis of expertise in the subject
  area of instruction and ability as an instructor."*
- **§ 535.65(b)(3) — specialised subjects.** *"A provider shall require specialized training or work
  experience for instructors teaching specialized subjects such as law, appraisal, investments,
  taxation or home inspection."* Law of Agency is a law subject, so this bites. *Three corrections:*
  this requirement is **not in § 535.63**, where this file previously implied it lived; the held list
  does not include **finance**, which this file previously listed; and it does include **home
  inspection**, which this file previously omitted.
- **§ 535.65(b)(4)** — an instructor shall teach a course *in substantially the same manner
  represented to the Commission* in the instructor's manual or other documents filed with the
  course-approval application.
- **§ 535.65(b)(5) — guest instructors.** A provider may use a guest instructor who does **not** meet
  the § 535.63 qualifications, provided that person instructs for **no more than 10% of the total
  course time** — three hours of a 30-hour course. If a guest presenter ever appears in recorded
  instruction, that time is measured and recorded against this cap.
- **§ 535.65(g)(2)(B) and (D)** — for distance delivery, a qualified instructor must be **available
  to answer students' questions or provide assistance as necessary in a timely manner**, and a
  qualified instructor must be **responsible for providing answers and rationale for the grading of
  the course work**. Automated grading does not remove the named instructor. The rule does not
  quantify "timely", so any response-time figure StateCourse commits to is a provider policy choice,
  disclosed as one — see item 16.

---

## Per-candidate dossier — private, never committed to this repository

| # | Item | Held |
|---|---|---|
| 1 | Full legal name | ☐ |
| 2 | Texas licence number and licence-history verification | ☐ |
| 3 | Education, with transcripts or diplomas as applicable | ☐ |
| 4 | Teaching and training history, with dates and institutions | ☐ |
| 5 | Courses previously taught | ☐ |
| 6 | Course-specific expertise for the course proposed — § 535.65(b)(2) | ☐ |
| 7 | Résumé or CV | ☐ |
| 8 | Publications and authorship | ☐ |
| 9 | Professional achievements | ☐ |
| 10 | Sample teaching evidence — recording, syllabus, or observation | ☐ |
| 11 | Institution or employer permission for outside work, if applicable | ☐ |
| 12 | The courses this person is proposed to teach, named individually — § 535.65(b)(1) qualifies an instructor *for the specified course* | ☐ |
| 13 | **The provider's written qualification determination**, naming the route relied on and the evidence for it, and separately addressing § 535.63(a) competence and ability to teach | ☐ |
| 14 | Contract | ☐ |
| 15 | W-9 | ☐ |
| 16 | Availability for student support, with the response standard agreed — § 535.65(g)(2)(B); the standard itself is provider policy, since the rule says only "timely" | ☐ |
| 17 | Legal and content update responsibilities agreed | ☐ |
| 18 | Specialised-subject training or work experience where § 535.65(b)(3) applies — for a law subject, it does | ☐ |

Items 2, 3 and 4 are the evidence for Routes 2 and 1; items 5, 7, 8 and 9 are the evidence a Route 3
determination is built from. No item is evidence on its own — item 13 is.

**Two rules about this file.** No fictional instructor record is created to make a gate pass. And no
instructor is contacted until the business decides to contact them — this checklist exists so that
the conversation, when it happens, asks for everything once.

**And one about the citations.** Nothing above may be presented to a student, in marketing, or in an
application as the Secretary of State's codified rule. StateCourse holds no TREC approval, and
holding these rules is not approval.
