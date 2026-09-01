# Click2CE — what is worth taking, what is not

**Reviewed:** August 19, 2026. **Reviewer:** StateCourse build.
**Method:** the live site was retrieved and read directly — the home page, `/how-it-works`, `/coming-soon`, `/exam-prep`, `/exam-prep/texas`, `/texas-real-estate-exam-prep`, `/courses/az-prelicense`, `/arizona/approval-verification`, `/about/pass-rate-methodology`, `/about/click2ce-fact-sheet`, `/how-to-get-a-real-estate-license`, `/free-practice-exam`, `/features/drive-mode`, `/brokers`, `/lead-magnets/az-license-checklist` — along with their HTML head metadata and JSON-LD.

**What Click2CE is.** An Arizona school (ADRE School S26-0002, one approved instructor) with exactly two regulated products — the Arizona 90-hour pre-license course and Arizona CE — wrapped in a *national* self-study exam-prep product sold in all 50 states, which needs no state approval anywhere. Everything else on the site exists to feed those two lines.

**Why this matters to us.** Their regulated footprint is smaller than ours will be; their commercial surface is far larger. They are not ahead on compliance engineering. They are ahead on packaging, on state-level content depth, and on making trust verifiable. Those last three are what is worth taking.

---

## 1. Take now — no approval required, no claim risk

### 1.1 A public approval-verification page

`/arizona/approval-verification` does something we have nowhere: it teaches the visitor to check the school in the regulator's own public database. School code, legal entity, approval status, named instructor, regulator phone and email, and four numbered steps ending in "confirm the status is Active."

The strongest part is the section that *limits* the claim: **school approval vs. product-level credit**. It states plainly that exam prep is not an ADRE-approved credit-bearing course and does not satisfy the 90-hour requirement or CE hours. A competitor voluntarily narrowing its own claim is the most credible thing on the site.

For us this page has two jobs. It is the natural surface for California DRE Regulation §3004(b), which requires advertising for an approved course to carry the Department's course approval number — the number now flows from the catalog into the state pages, and this page is where it belongs in full. And it can be built *today*, before any approval, in its honest form: who the applicant entity is, what has been submitted, what has not, and exactly how the reader will verify it in the DRE public lookup once it exists.

### 1.2 A methodology page behind every published number

`/about/pass-rate-methodology` publishes, for one marketing figure: the numerator (92), the denominator (100), the cohort window, that non-reporters are excluded from both, the data source, that it is **not independently audited**, the *previously* published figure (84%) with a note that it was not retroactively revised, and a list of planned measurement improvements.

Adopt the rule, not the number: **no figure goes on a StateCourse page unless a methodology page explains how it was produced.** This is the same discipline as deriving the approval line from the catalog instead of hardcoding it — a published claim must have a checkable source behind it.

### 1.3 Real per-state depth instead of one shared paragraph

Their `/exam-prep/texas` page carries, for Texas specifically: 125 exam questions, the split between national and state sections, the passing percentages, Pearson VUE as the provider, a topic-by-topic breakdown with question counts, and for each topic the common candidate pitfall plus a worked example (home-equity 80% combined-LTV math, a proration using the Texas 365-day convention, homestead acreage limits). Then three study plans — 1, 2, and 4 weeks — with a day-by-day schedule.

Against this, our 51 state pages carry a *byte-identical* five-step licensing path. Fifty-one pages with the same body text is thin duplicate content, and search engines treat that pattern as a doorway. This is the largest content gap on the site and it is fixed by the state research already queued: regulator, hours, exam provider, question count, passing score, and topic weights, each from the state's official candidate handbook.

### 1.4 Search infrastructure we currently have none of

Click2CE ships canonical tags, Open Graph and Twitter cards, and JSON-LD for `Organization`, `EducationalOrganization`, `FAQPage`, `HowTo`, `BreadcrumbList`, `Course`, `Product`/`Offer`, and `Review`.

We ship: a description, a theme colour, and a title. No `robots.txt`, no `sitemap.xml`, no canonical, no social cards, no structured data — across roughly eighty generated URLs.

Take the subset we can back with truth: `Organization`, `EducationalOrganization`, `FAQPage`, `HowTo`, `BreadcrumbList`, plus canonical and social cards, plus a generated sitemap. Do **not** ship `Course`, `Offer`, or `Review` markup until there is an approved course, a real price, and real reviews — structured data that overstates is worse than none, because it is machine-read.

### 1.5 Checklist lead magnets built from research we already do

`/lead-magnets/az-license-checklist` is a seven-step Arizona path with checkboxes, a progress counter, print/save, an "Updated April 2026" stamp, and per-step time and cost estimates. It is the state research rendered for a human being.

We already maintain official-source registers per state with change-control dates — Virginia's now carries a dated verification record. Publishing that work as a checklist costs little and is the honest use of it.

### 1.6 Small trust and clarity elements

- An **availability page** that separates "available now" from "coming soon" per state, with a waitlist. Ours would read "nothing for sale yet" everywhere, which is exactly what the account CTA already says.
- **Operational commitments** stated numerically: support replies within one business day, refunds processed within five business days, approvals verifiable at the regulator. We state none.
- A **"Quick Answer" block** — one question, a short factual answer, a last-updated date — near the top of each course page. Good for readers and for AI search alike.
- Two URL patterns for the same page (`/exam-prep/texas` and `/texas-real-estate-exam-prep`), with the keyword URL canonicalised to the primary. A legitimate low-cost alias; only worth doing once the primary page has real content.

## 2. Take when there is something to sell

### 2.1 Exam prep as a separate, non-regulated line

This is their whole engine, and the strategic point for us: **exam preparation requires no state approval anywhere**, so it can be sold in all 50 states while every regulated approval is still pending. It is the one product that could generate revenue before California DRE acts.

Hard boundary: it must be built from published exam blueprints and candidate handbooks, and must never touch our secure final-exam banks. Our own rule already bans exposing those, and Virginia's 18VAC135-20-390(2)–(3) makes soliciting or distributing licensing-examination questions a ground for withdrawing school approval. The exam-prep page we just published states this — regulated finals are never reused as practice material — and that has to stay true in the product, not only in the copy.

### 2.2 AI tutor, audio study, bundles, teams

- **AI tutor** giving concept-level explanations on wrong answers — inside non-regulated prep freely; inside a regulated course only if the delivery method is approved and it can never answer a final-exam item.
- **Drive Mode**, hands-free narrated lessons. Strong retention feature, and see §3.4 for the trap in how they describe it.
- **Bundle and à-la-carte pricing** with a short "which do you need?" selector, plus instalment payment at checkout. California's 135 hours is three separate 45-hour courses — a natural bundle — with the enrollment gate unchanged.
- **Broker and team sales**: bulk seats, distributed access codes, a team progress dashboard. A real channel, and it needs a multi-seat data model designed before it is sold.

## 3. Do not take

**3.1 A pass-rate figure in the hero.** Even with their methodology page, 92% rests on 100 self-reported students, unaudited, with non-reporters excluded. Their own page shows the fragility: the previously published figure was 84%. And our exposure is not theirs — a claim attached to a state-approved course sits in a different risk class than one attached to a self-study tool.

**3.2 A money-back-if-you-fail guarantee.** It interacts with refund policy, with regulator advertising rules, and with the completion and certificate machinery. Not before counsel reviews it against each state's advertising rules.

**3.3 Numbers that drift between pages.** The same claim appears as "11,500+ practice questions" on the home page, "4,640+" in that page's own meta description, and "4,500+" on `/how-it-works`. They lost control of their own figure. Our counter-measure is already built and tested: derive published values from the data, never retype them into copy.

**3.4 The Drive Mode seat-time claim.** One panel says listening time "accrues toward your state CE minimum-time requirement on the same per-student timer the written course uses." The FAQ lower on the same page says Drive Mode is a study tool and credit still requires the course's final assessment. Those cannot both be right. Audio time may never count as instructional time for us unless the approved delivery method says so in writing.

**3.5 Reviewing yourself in your own rankings.** `/best-real-estate-exam-prep` ranks exam-prep providers and includes Click2CE among them. Also `AggregateRating` markup with a 5.0 from five reviews — thin aggregate ratings are a standing target for both search penalties and endorsement-disclosure scrutiny.

## 4. Where we are already ahead

Approval gating is enforced in code and locked by tests, not asserted in copy. Completion is server-authoritative and cannot be bought. Secure final-exam banks are proven absent from the build output by a guard in the build script. Every course carries its own version, disclosure, and refund record. Official-source registers carry change-control rules and dated verification records. The state pages now derive their approval and enrollment lines from the catalog, with enrollment openable only where an approval number and an enabled flag meet on the same course.

None of that is visible to a visitor. That is the real lesson of this review: they are not better built, they are better *shown*. Items 1.1, 1.2, and 1.4 turn work we have already done into something a visitor — and a regulator — can check.

## 5. Recommended order

1. Approval-verification page, in its honest pre-approval form (1.1) — also the §3004(b) surface.
2. Search infrastructure: sitemap, robots, canonical, social cards, safe JSON-LD (1.4).
3. Per-state depth from official candidate handbooks, replacing the shared five-step path (1.3) — this is the state research already queued.
4. Methodology rule adopted before any number is ever published (1.2).
5. State checklists published from the existing source registers (1.5).
6. Exam prep scoped as a non-regulated product line, with the final-bank boundary written into its design (2.1).
