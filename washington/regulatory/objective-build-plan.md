# Washington objective audit and next build

Verified 2026-09-06. Submission remains NO-GO. This is a complete source inventory and an honest partial-evidence audit, not a certification that existing lessons satisfy the curriculum.

## Source inventory and findings

Both official curricula were retrieved anew and match the prior byte hashes. Fundamentals is 12 pages, Rev.5/2022; Practices is9 pages, effective03-18-2009 and still linked by DOL. `source-evidence/` retains the two actual PDFs; validation reads their bytes and compares the official SHA-256 pins. `curriculum-source-pages.json` retains every page's extracted text; independent fixed page-text digests reject source-word changes even if the matrix is regenerated. `objective-matrix.json` retains every numbered source item, all subordinate source lines with page/line anchors, course-local lesson references and content hashes, gaps, planned section and unverified assessment/time fields. The two Markdown matrices are readable views of the same records.

| Course | Printed records | Required substantive outcomes | Located evidence | Time plan |
|---|---:|---|---|---:|
| Fundamentals |173|161 detailed outcomes plus10 introductory rollups|115 partial;47 missing;10 rollups;1 optional resource record|3,000 active minutes|
| Practices |109|109 detailed outcomes|53 partial;56 missing|1,500 active minutes|

Fundamentals has172 mandatory printed records. Career #8 and#9 print one sentence across two numbers, so they count as one substantive outcome while both printed anchors remain preserved. Fair Housing #7 is expressly optional instructor resources, including the p12 terminology list; it is retained but not treated as required student instruction. Mandatory numbered records retain151 subordinate topical anchors in total (104 Fundamentals,47 Practices); these are not151 extra independent outcomes.

No lesson is marked fully covered. A partial result means a reviewer located relevant explanatory instruction, with specific remaining work; it does not mean the entire action verb, all subordinate topics, current-law interpretation, student exercise and assessment are satisfied. Companion-course instruction is not counted as delivered by this course. Existing module hour labels do not prove active instructional time. No duration has been verified.

## Highest-impact gaps

- Fundamentals fair housing omits required racial-discrimination history, exact protected classes/transactions, financial-assistance bias, and complaint mechanisms. Its conduct examples only partially address other objectives. The existing statement that the block *is* exactly three hours is unsupported by measured evidence.
- Fundamentals license law routes trust-account deadlines/records/office/discipline and multiple other mandatory state-law procedures to outside advice. Required material must actually be taught and assessed after current-law verification.
- Practices has strong agency material but lacks a complete CMA, business-plan/budget, marketing/open-house workshop, signed-form completion practice, real earnest-money/interpleader procedure, financing/closing simulation and calculator exercise.
- The2009 Practices source uses older agency and MLS terminology. Keep the prescribed objective in the inventory and teach it with current RCW18.86/18.85/WAC rules and a documented historical-to-current distinction. A curriculum's continued publication does not make every historical phrase current law.
- Fundamentals investment/tax and many property/finance/settlement subtopics are incomplete. A sentence telling the student to ask counsel cannot satisfy a prescribed explanatory objective.

## Next concrete batch

WA-B1: rebuild the Practices Business Skills, Agency and Listing sections:46 prescribed objectives; proposed550 active minutes. Outputs: business/operating budget, affiliation/contractor comparison, prospecting plan, transaction record template, current agency conflict/MLS examples, completed listing and buyer-services agreements, seller-disclosure exercise, two compliant advertisements and scored application rubrics. Acquire licensed or publicly reusable example forms; do not copy proprietary MLS forms without permission. Every required subordinate topic stays visible in the matrix.

WA-B2 can proceed alongside B1: Fundamentals Fair Housing and License Law, proposed450 active minutes. Read and pin current federal Fair Housing Act, RCW49.60, RCW18.85/18.235, WAC308-124 and relevant agency guidance. Author required teaching content and activities, then independently review exact classes, deadlines, duties and examples.

WA-B3: remaining Practices63 objectives, proposed950 active minutes. WA-B4: remaining Fundamentals detailed sections, proposed2,550 active minutes. Full section allocations and deliverables live in `config/washington/curriculum-map-plan.mjs`. These minutes are a design budget; instructional trials must substantiate the final50-minute clock-hour equivalence.

## Finish and evidence order

1. Author and source-check each objective and subordinate topic; add exercise/scoring evidence.
2. Measure active instruction and independently confirm3,000/1,500 minutes; orientation/admin/break/exam time must not be casually counted as instruction.
3. Paginate and freeze each course, then map objective-to-final-page and final exam/key. Minimum comprehensive exams remain180/90 items with current rule minimum70% score; existing formative banks are not those finals.
4. Verify distance controls, student identity, inactivity shutdown, dual certification, instructor availability and five-year records against current rules/forms.
5. Assemble inclusive course PDFs and refresh the precise controlling law/forms immediately before filing. A successful inventory test cannot change DOL approval status.

## Recompute and negative checks

Run `node scripts/washington-objective-map.mjs --write` after deliberate evidence changes. Then run `node --test tests/washington-objective-map.test.mjs tests/washington-phase0-package.test.mjs tests/washington-regulatory.test.mjs tests/washington-course.test.mjs`. Tests remove a mandatory objective, remove a subordinate closing event, and attempt to claim verified time/readiness; each must fail validation. Source extraction rejects unexpected page counts and the map rejects PDF hash drift. Human review remains necessary to judge legal accuracy and whether instruction satisfies each action verb.
