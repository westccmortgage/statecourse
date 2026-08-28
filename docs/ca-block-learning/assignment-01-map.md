# CA-BLOCK-1 — Assignment 1 content map (Mortgage Loan Brokering and Lending)

Recorded 2026-08-28. The exact map the work order requires, produced BEFORE rendering: existing
section → learning objective → block → instructional screens → existing practice item → existing
engagement/question → remediation location → assignment-mastery concept. The source file is frozen
(`california/ca-mortgage-loan-brokering-lending-45-v1/curriculum/lesson-01.md`); every screen is a
heading-addressed range over it, and `assertCoverage` proves the ranges tile the entire file.

## Block analysis decisions

- **One section, one block (B1–B6).** Each of the six numbered sections states one coherent
  objective (each ends in its own checkpoint stating it), so none was grouped or split. §6 is the
  largest (1,132 words) and was considered for a split; it stays one block because its objective is
  single — enforcement context and the correct response — and its length is absorbed by four
  instruction screens, including the worked §6.8 walkthrough as its own screen.
- **Front matter** (subject line, learning objectives, timed sequence) opens B1 screen 1 as
  orientation. Too short to be a block; belongs with the first block it frames.
- **Apparatus → B7.** Key terms, chapter summary, applied assignment, knowledge check, and the
  completion statement form the synthesis-and-mastery block. B7 is NOT a seventh DRE segment; its
  mastery is derived from the existing regulatory record and nothing else.
- **Practice problems redistributed** to the block teaching their concept (below), each as an
  active practice screen: the student commits a written analysis (≥80 characters, recorded) before
  the printed solution unlocks. No problem was deleted; all eight render verbatim from the file.

## Section → block map

| Source | Block | Learning objective (abbrev.) | Screens |
|---|---|---|---|
| Front matter + §1 (1.1–1.6) | B1 The broker's mortgage authority | State what the license confers/excludes; broker–salesperson structure | 3 instruction + 1 retrieval |
| §2 (2.1–2.6) | B2 The MLO endorsement | Trigger, requirements, relation to underlying license | 3 instruction + 1 practice (P1) + 1 retrieval |
| §3 (3.1–3.6) | B3 Regulator boundaries and routing | Regulators, framework confusion, routing standard | 3 instruction + 2 practice (P2, P3) + 1 retrieval |
| §4 (4.1–4.6) | B4 Licensed and exempt activity | Activity-not-title, exemptions, business purpose, compensation | 3 instruction + 2 practice (P4, P5) + 1 retrieval |
| §5 (5.1–5.7) | B5 Broker supervision | Real system, why harder, improper instruction | 3 instruction + 2 practice (P7, P6) + 1 retrieval |
| §6 (6.1–6.9) | B6 Complaints, enforcement, and the record | Enforcement categories, correct responses, falsification line | 4 instruction + 1 practice (P8) + 1 retrieval |
| Key terms, summary, applied, knowledge check, completion | B7 Synthesis and assignment mastery | Integrate; complete regulatory instruments | 2 review + applied + mastery + completion |

38 screens total. Regulatory section evidence: a source section is recorded viewed when every
instruction screen of its block completes (server-side), feeding the existing six-segment gate.

## Existing practice/question inventory and mapping

| Existing asset | Where it lives now | Role under block delivery |
|---|---|---|
| Applied scenario (1 item) | `mortgage-question-bank.mjs` assignment-01.applied | Unchanged regulatory applied exercise, delivered on B7 screen 3 |
| Engagement E1–E5 (5 items) | …assignment-01.engagement | Unchanged regulatory knowledge check = the **Assignment Mastery Check**, B7 screen 4 (integrates authority, endorsement, supervision, jurisdiction, licensed-vs-exempt — several concepts across the assignment; none of its items appears in any block) |
| Remediation R1–R5 (5 items) | …assignment-01.remediation | Unchanged regulatory alternate set, served by the existing flow when the mastery check fails |
| Practice problems P1–P8 | lesson-01.md | Redistributed: P1→B2, P2·P3→B3, P4·P5→B4, P6·P7→B5, P8→B6 as commit-then-reveal practice screens |
| Final-exam bank | `mortgage-final-exam-bank.mjs` | Untouched; nothing promoted, copied, or exposed |

## Actual assessment gaps found (and how they were filled)

The inventory left NO existing closed-form item available for per-block retrieval: applied,
engagement and remediation items are all reserved by the regulatory instruments they already
serve (using them in blocks would preview the mastery check or its alternate), and the practice
problems are open-ended with printed solutions. Gap: 6 primary + 6 replacement retrieval items.
Filled with twelve NEW delivery-layer formative items in `config/california/mortgage-a1-blocks.mjs`
(`A1_RETRIEVAL_BANK`) — written after the inventory, every proposition traceable to lesson text,
scenario/application format (no trivia, no definition repetition), correct answer at index 0,
permuted at serve. They are instructional-delivery artifacts, not DRE instruments, and gate
nothing regulatory. A second gap is noted, not filled: **B1 has no mapped practice problem**
(none of P1–P8 isolates §1); its active learning is its retrieval check.

## Retrieval and remediation map

| Block | Primary item (concept) | Wrong answer → remediation screen | Replacement item |
|---|---|---|---|
| B1 | a1-b1-q1 (broker-mortgage-authority) | a1-b1-s2 | a1-b1-q2 |
| B2 | a1-b2-q1 (mlo-endorsement) | a1-b2-s2 | a1-b2-q2 |
| B3 | a1-b3-q1 (framework-boundaries) | a1-b3-s2 | a1-b3-q2 |
| B4 | a1-b4-q1 (activity-not-title) | a1-b4-s1 | a1-b4-q2 |
| B5 | a1-b5-q1 (supervision-system) | a1-b5-s1 | a1-b5-q2 |
| B6 | a1-b6-q1 (complaint-response) | a1-b6-s3 | a1-b6-q2 |

Flow on an incorrect answer: concise explanation (the item's rationale) → focused return to the
exact instruction screen above → recorded review → a DIFFERENT question on the same concept →
result recorded. The missed question is never re-served; the block never restarts; nothing is
punitive. Retrieval always sits on a later screen than the instruction that answers it (the
retrieval screen renders no lesson content at all).

## Assignment mastery concepts

The mastery check (existing E1–E5, 80%) integrates: broker mortgage authority (E1), MLO
endorsement purpose (E2), supervisory obligation (E3), regulator jurisdiction over a complaint
(E4), licensed-vs-exempt significance (E5) — every block's territory, tested with items no block
used. Its failure path is the existing regulatory remediation (R1–R5) unchanged.

## Spaced retrieval

`A1_SPACED_RETRIEVAL` ships empty by design: the schedule shape, the attempt kind (`spaced`) and
the payload channel exist now; mass spaced-review content is not activated in this phase.
