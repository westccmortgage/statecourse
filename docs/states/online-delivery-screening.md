# Can we actually operate here? — screening states by delivery rule

**Opened:** August 19, 2026. **Reviewer:** StateCourse build.
**Source policy:** the state's statute, administrative rules, and current regulator forms control. A search-engine summary, a competitor's page, or a trade article may point at a source but can never establish a requirement. Every row below was read in the primary document named beside it.

## Why this register exists, and why it comes before any course is written

StateCourse is a fully asynchronous online school. That is not a preference; it is the whole delivery model. A jurisdiction that requires classroom hours, live instruction, or a proctored physical location for part of its pre-license requirement is a jurisdiction where the model cannot deliver the licence on its own — no matter how attractive its hour count or fee looks in a comparison table.

So the first question asked of every state is not "how many hours" but **"how many of those hours may be self-paced and online, and who says so"**. Getting that wrong is expensive in exactly the way that matters: it is discovered after the course is written.

Two findings on this page were the opposite of what a summary said, which is the argument for the rule at the top:

- **Iowa** reads, in the commission's own rules, as an online-friendly state — the 60-hour course may be "live instruction or distance/online learning". The same rule then requires the applicant to supply, in addition, **36 hours of *live* instruction** in three named courses. A search summary reported only the first half.
- **New Hampshire** describes 40 hours of accredited pre-licensing education. The rule caps the self-paced share at **8 of those 40**.

## The register

| State | Entry hours | Asynchronous online | Verdict | Read in |
| --- | --- | --- | --- | --- |
| **Michigan** | 40, including at least 4 of civil rights law and equal opportunity in housing | **Yes** — the approval application's own course-type selector is "Non-Distance (classroom) / Distance (online)" | **Viable** | Michigan Real Estate Salesperson Licensing Guide (rev. 1/26/2026); Real Estate Salesperson & Broker Prelicensure Course Approval Application, BPL/REPRELICCOURSEAPPROVALAPPL (rev. 3/23), authority 1980 PA 299 |
| **Kansas** | 60 — a 30-hour Principles course and a 30-hour Kansas Practice course | **Yes** — "asynchronous distance education course" is a defined, separately approvable course type | **Viable** | Kansas Register vol. 43 no. 50 (Dec 12, 2024), permanent regulation implementing K.S.A. 58-3046a |
| **Nebraska** | 60 — two commission-approved courses of not less than 30 class hours each | **Yes, on its face** — "or completed equivalent distance education courses approved by the Commission" | **Promising, not yet confirmed** — Title 299 text still to be read in full | Nebraska Real Estate Commission pre-license education pages; Title 299 to be read before this row is relied on |
| **Iowa** | 60 online or live, **plus 36 hours that must be live** | **Partial** — the 60 may be distance/online; the additional 12+12+12 may not | **Not viable alone** | Iowa Administrative Code 193E—16.2(543B), and 193E—17.10(543B) for distance standards |
| **New Hampshire** | 40 | **Capped at 8 hours** — a minimum of 32 must be classroom attendance or real-time internet live-class | **Not viable** | NH Code of Administrative Rules, Rea chapters (rea100–700), pre-licensing education evidence provision |
| **Massachusetts** | 40 | **Open question** — the statute says "40 classroom hours of instruction" | **Blocked pending 254 CMR** | M.G.L. c.112 §87SS. The Board's regulations at 254 CMR are not reachable from this environment; the classroom wording in the statute must be reconciled against them before Massachusetts is scheduled |
| **Maryland** | 60 | **Open question** | **Two regulators** — the Maryland Higher Education Commission must approve an in-state training entity before it may offer the 60-hour pre-licensing programme, in addition to Real Estate Commission approval | Maryland Real Estate Commission education pages; MHEC private career school pages |

## What the viable states require of the engine

These are the concrete build requirements the primary sources impose, over and above what California already made us build.

**Michigan** — a distance course either holds ARELLO certification or documents five things by rule (Rule 626(2)(b)–(f)): individual modules of instruction, at least one learning objective per module, a structured learning method for each objective, a method of assessing performance during each module, and **a method of remediation that repeats the module until the student understands the material**. Our engine already does all five — module assessment with mandatory remediation is what the California build produced. Michigan also wants a description of how the school will remedy hardware and software failures (Rule 626(5)), a topics-and-hours summary (618(1)(e)), a sample completion certificate (618(1)(f)), and an enrollment application that **discloses the percentage of students who completed the programme in the previous calendar year** (618(1)(h)). That last one is a real product requirement: it means completion rate becomes a published number, and a published number needs a methodology.

**Kansas** — an asynchronous course must document active participation and substantial interaction between the student and the instructor, other students, or a computer program; must show sufficient IT support; and must present quiz and examination questions **scrambled into a random order**. Each asynchronous course must require the student to answer at least 50 quiz or examination questions, and the school issues the certificate of completion. Note that our final examination uses two fixed forms with a deterministic choice permutation keyed to the item id — that is choice-order randomisation, not item-order randomisation, and Kansas asks for the latter. It is a small engine change, and it must not disturb the property that a recorded `selected_choice` keeps its meaning permanently.

**ARELLO, three states, three different answers.** Virginia: the term appears nowhere in the controlling chapter or the current form — not required. Michigan: ARELLO certification is one of two routes, the alternative being the five documented elements above. Kansas: an ARELLO-certified course is **presumed** to meet the asynchronous requirements — a safe harbour rather than an obligation. This is why the registry carries the answer per state with its citation instead of one project-wide assumption.

## Method, so this is repeatable

1. Find the controlling text — statute, administrative rules, and the regulator's current course-approval form. Prefer the legislature or secretary-of-state publication of the rules; regulator sites often refuse an automated request, and the rule text is what governs anyway.
2. Answer the delivery question first, from the rule, in full sentences quoted or closely paraphrased into the register.
3. Answer the operational questions second: who approves the school, who approves the instructor, how long records are kept, what the completion report must contain and when it is due, and what the certificate must carry.
4. Record the date read and the document revision. Rules change; a fact without a date is not a fact for long.
5. Fill the public registry only from what was read, and leave anything unread empty rather than plausible.

## Still to screen

Alaska, Delaware, Idaho, Indiana, Minnesota, Mississippi, Montana, Nevada, New Mexico, North Dakota, Ohio, Rhode Island, South Carolina, South Dakota, Tennessee, Utah, Vermont, West Virginia, Wyoming, and the District of Columbia — plus the larger markets we are deliberately taking last: Florida, Georgia, Illinois, New York, and Texas.
