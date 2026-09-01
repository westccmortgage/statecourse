/**
 * CA-BLOCK-1 pilot — Mortgage Loan Brokering and Lending, Assignment 1: the learning-block map.
 *
 * WHAT THIS FILE IS. The delivery-layer definition of Assignment 1 as LEARNING BLOCKS and
 * INSTRUCTION SCREENS. It is the project's equivalent of the `instructional_blocks` and
 * `instructional_screens` tables: following the existing StateCourse pattern (course structure in
 * config, per-student state in the database), the definitions live here — versioned, reviewed in
 * diff, single-sourced — while `database/014_block_learning.sql` holds only per-student progress
 * and assessment evidence. Duplicating these rows into the database would create a second copy of
 * the same facts with no owner.
 *
 * WHAT THIS FILE IS NOT. It is not curriculum. Every instruction screen is a RANGE OVER the frozen
 * lesson file (california/ca-mortgage-loan-brokering-lending-45-v1/curriculum/lesson-01.md),
 * addressed by the lesson's own headings. No lesson text is copied here, none is rewritten, and the
 * screen map covers the file completely — a load-time invariant and the tests both check that the
 * ranges chain from the top of the file to its end with no gap, so no source content can disappear.
 *
 * THE REGULATORY LAYER IS UNTOUCHED. Assignment 1 remains ONE California regulatory assignment.
 * The six numbered lesson sections remain the six tracked instructional segments; the applied
 * memorandum, the five-item knowledge check (80%), and its remediation alternate remain the
 * existing machinery in config/california-course-engine.mjs, served by the existing endpoints.
 * Blocks are evidence UNDERNEATH that layer: block screens roll up to section-viewed evidence, and
 * the synthesis block delivers the existing applied and knowledge-check instruments unchanged.
 *
 * BLOCK ANALYSIS DECISIONS (the map the work order requires):
 *   - Sections 1–6 each state one coherent objective, so each maps to one block (B1–B6). None was
 *     split: the largest (§6, 1,132 words) stays one block because its objective is single —
 *     enforcement context and the correct response — and screens, not blocks, absorb its length.
 *   - The assignment's front matter (subject line, learning objectives, timed sequence) opens B1's
 *     first screen: it orients the same material and is too short to be a block.
 *   - Key terms, chapter summary, the applied assignment, the knowledge check, and the completion
 *     statement form B7 (synthesis and mastery) — they are assignment-level apparatus, not a
 *     seventh DRE segment, and B7's mastery is DERIVED from the existing regulatory record.
 *   - The eight existing practice problems are REDISTRIBUTED to the block teaching their concept
 *     (P1→B2, P2·P3→B3, P4·P5→B4, P6·P7→B5, P8→B6), each as an active practice screen: the
 *     student may write an OPTIONAL analysis before revealing the printed solution. Saved text renders
 *     from the frozen lesson file. B1 has no mapped problem — an inventoried gap, noted below.
 *
 * ASSESSMENT INVENTORY AND THE GAP IT FOUND. Existing Assignment 1 items: 1 applied scenario,
 *   5 engagement items, 5 remediation items — all reserved by the regulatory layer they already
 *   serve (engagement = the integrative Assignment Mastery Check; remediation = its alternate set;
 *   using them in blocks would preview the mastery instruments). The eight practice problems are
 *   open-ended with printed solutions, so they serve as practice screens, not closed retrieval.
 *   NOTHING in the existing inventory could serve as per-block closed-form retrieval, so the
 *   twelve items below (6 primary + 6 replacement) are NEW DELIVERY-LAYER FORMATIVE items — the
 *   gap fill, written after the inventory, every proposition traceable to the lesson text, correct
 *   answer authored at index 0 per project convention, choices permuted at serve time. They are
 *   not DRE instruments, never touch the final-exam bank, and never gate anything regulatory.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

/* Screen types the player understands. `instruction` and `review` render a lesson range;
   `practice` renders a range with an optional written analysis; the student reveals the solution
   region unlocks; `retrieval` presents a question and NO lesson content — the answer-bearing
   instruction is always at least one screen behind it; `applied`, `mastery` and `completion`
   render their lesson range and host the EXISTING regulatory instruments. */
export const SCREEN_TYPES = Object.freeze([
  "instruction", "practice", "retrieval", "review", "applied", "mastery", "completion",
]);

export const A1_BLOCKS = Object.freeze({
  courseId: "ca-mortgage-loan-brokering-lending-45",
  assignmentId: "assignment-01",
  version: "1.0",
  contentPath: "/content/california/ca-mortgage-loan-brokering-lending-45-v1/lesson-01.md",
  blocks: [
    {
      id: "a1-b1", sequence: 1, required: true,
      title: "The broker's mortgage authority",
      learningObjective: "State what mortgage authority the DRE real estate broker license confers, what it does not include, and how the broker–salesperson structure applies to mortgage activity.",
      sourceSections: [1],
      screens: [
        { id: "a1-b1-s1", sequence: 1, type: "instruction", title: "Orientation: this assignment", content: RANGE("^", "### 1.2 The broker's mortgage authority") },
        { id: "a1-b1-s2", sequence: 2, type: "instruction", title: "What the license authorizes — and does not", content: RANGE("### 1.2 The broker's mortgage authority", "### 1.4 Broker and salesperson, restated for this context") },
        { id: "a1-b1-s3", sequence: 3, type: "instruction", title: "Broker, salesperson, and why the framework exists", content: RANGE("### 1.4 Broker and salesperson, restated for this context", "## 2. MLO endorsement orientation") },
        { id: "a1-b1-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "a1-b1-q1" },
      ],
    },
    {
      id: "a1-b2", sequence: 2, required: true,
      title: "The MLO endorsement",
      learningObjective: "State what triggers the MLO endorsement requirement, what the endorsement involves, and its relationship to the underlying license.",
      sourceSections: [2],
      screens: [
        { id: "a1-b2-s1", sequence: 1, type: "instruction", title: "The endorsement and what triggers it", content: RANGE("## 2. MLO endorsement orientation", "### 2.3 What the endorsement requires") },
        { id: "a1-b2-s2", sequence: 2, type: "instruction", title: "What the endorsement requires", content: RANGE("### 2.3 What the endorsement requires", "### 2.4 The individual and the company") },
        { id: "a1-b2-s3", sequence: 3, type: "instruction", title: "Two identifiers, and what the endorsement does not do", content: RANGE("### 2.4 The individual and the company", "## 3. DRE and other regulator boundaries") },
        { id: "a1-b2-s4", sequence: 4, type: "practice", title: "Practice: the lapsed endorsement", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "a1-b2-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a1-b2-q1" },
      ],
    },
    {
      id: "a1-b3", sequence: 3, required: true,
      title: "Regulator boundaries and routing",
      learningObjective: "Name the regulators a mortgage transaction touches, avoid framework confusion, and apply the routing standard to questions outside the license.",
      sourceSections: [3],
      screens: [
        { id: "a1-b3-s1", sequence: 1, type: "instruction", title: "The regulators a transaction touches", content: RANGE("## 3. DRE and other regulator boundaries", "### 3.2 The California licensing frameworks, in outline") },
        { id: "a1-b3-s2", sequence: 2, type: "instruction", title: "State frameworks, and federal law on its own terms", content: RANGE("### 3.2 The California licensing frameworks, in outline", "### 3.4 The routing discipline") },
        { id: "a1-b3-s3", sequence: 3, type: "instruction", title: "The routing discipline and its standard", content: RANGE("### 3.4 The routing discipline", "## 4. Licensed and exempt activity") },
        { id: "a1-b3-s4", sequence: 4, type: "practice", title: "Practice: four questions in one conversation", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "a1-b3-s5", sequence: 5, type: "practice", title: "Practice: the imported rule", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "a1-b3-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a1-b3-q1" },
      ],
    },
    {
      id: "a1-b4", sequence: 4, required: true,
      title: "Licensed and exempt activity",
      learningObjective: "Determine whether an activity requires a license from what is done and whether compensation is involved, treat exemptions as legal conclusions, and state what a business-purpose certification does and does not establish.",
      sourceSections: [4],
      screens: [
        { id: "a1-b4-s1", sequence: 1, type: "instruction", title: "The analysis: activity, not title", content: RANGE("## 4. Licensed and exempt activity", "### 4.3 Exemptions") },
        { id: "a1-b4-s2", sequence: 2, type: "instruction", title: "Exemptions and the business-purpose distinction", content: RANGE("### 4.3 Exemptions", "### 4.5 Compensation and the expectation of it") },
        { id: "a1-b4-s3", sequence: 3, type: "instruction", title: "Compensation, defined broadly", content: RANGE("### 4.5 Compensation and the expectation of it", "## 5. Broker supervision") },
        { id: "a1-b4-s4", sequence: 4, type: "practice", title: "Practice: the coordinator and the marketing associate", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "a1-b4-s5", sequence: 5, type: "practice", title: "Practice: the business-purpose instruction", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "a1-b4-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a1-b4-q1" },
      ],
    },
    {
      id: "a1-b5", sequence: 5, required: true,
      title: "Broker supervision",
      learningObjective: "Describe a real supervision system, explain why mortgage supervision is structurally harder than sales supervision, and state the correct response to an improper instruction.",
      sourceSections: [5],
      screens: [
        { id: "a1-b5-s1", sequence: 1, type: "instruction", title: "The duty, and what a real system contains", content: RANGE("## 5. Broker supervision", "### 5.3 Why mortgage supervision is harder than sales supervision") },
        { id: "a1-b5-s2", sequence: 2, type: "instruction", title: "Why mortgage supervision is harder — and the receiving end", content: RANGE("### 5.3 Why mortgage supervision is harder than sales supervision", "### 5.5 Independent contractor status changes nothing") },
        { id: "a1-b5-s3", sequence: 3, type: "instruction", title: "Contractor status, and whose records these are", content: RANGE("### 5.5 Independent contractor status changes nothing", "## 6. Consumer complaint and enforcement context") },
        { id: "a1-b5-s4", sequence: 4, type: "practice", title: "Practice: the manual nobody follows", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "a1-b5-s5", sequence: 5, type: "practice", title: "Practice: the improper instruction", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "a1-b5-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a1-b5-q1" },
      ],
    },
    {
      id: "a1-b6", sequence: 6, required: true,
      title: "Complaints, enforcement, and the record",
      learningObjective: "Name the enforcement categories, state the correct response to regulator contact and to a borrower complaint, and explain the line between a documented gap and a falsified record.",
      sourceSections: [6],
      screens: [
        { id: "a1-b6-s1", sequence: 1, type: "instruction", title: "How matters arrive, and what produces enforcement", content: RANGE("## 6. Consumer complaint and enforcement context", "### 6.3 The one that ends careers") },
        { id: "a1-b6-s2", sequence: 2, type: "instruction", title: "The one that ends careers, and regulator contact", content: RANGE("### 6.3 The one that ends careers", "### 6.5 Responding to a borrower complaint") },
        { id: "a1-b6-s3", sequence: 3, type: "instruction", title: "Complaints, prompt reporting, and the record", content: RANGE("### 6.5 Responding to a borrower complaint", "### 6.8 A worked regulatory boundary problem") },
        { id: "a1-b6-s4", sequence: 4, type: "instruction", title: "A worked regulatory boundary problem", content: RANGE("### 6.8 A worked regulatory boundary problem", "## Key terms") },
        { id: "a1-b6-s5", sequence: 5, type: "practice", title: "Practice: the rate-lock complaint", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "a1-b6-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a1-b6-q1" },
      ],
    },
    {
      id: "a1-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied file memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      /* B7 hosts the EXISTING regulatory instruments. Its mastery is derived from the existing
         regulatory record (applied complete + engagement complete + remediation satisfied), never
         from block-level evidence — the block layer must not create a second, weaker version of
         the assignment gate. */
      regulatoryMastery: true,
      screens: [
        { id: "a1-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "a1-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "a1-b7-s3", sequence: 3, type: "applied", title: "Applied assignment: the file memorandum", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "a1-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "a1-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  /* The "## Practice problems" heading itself (redistributed above) belongs to the coverage map
     through B2's practice screen chain; the explicit coverage list the invariant checks is built
     from every screen's range. The heading-only line for the problems section is assigned here so
     the whole-file coverage check has an owner for it. */
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

/* ── The delivery-layer formative retrieval bank ─────────────────────────────────────────────
   Twelve items: one primary and one replacement per substantive block. Correct answer authored at
   index 0 (project convention; permuted at serve). `concept` ties primary to replacement: an
   incorrect answer routes to `remediationScreen`, then serves the DIFFERENT `replacementId`
   question on the same concept — never the same question again. These are formative delivery-layer
   items only: not DRE instruments, not drawn from and never feeding the final-exam bank. */
export const A1_RETRIEVAL_BANK = Object.freeze({
  "a1-b1-q1": {
    blockId: "a1-b1", concept: "broker-mortgage-authority", role: "primary",
    replacementId: "a1-b1-q2", remediationScreen: "a1-b1-s2",
    prompt: "Which of the following is within the mortgage authority of a California real estate broker license?",
    choices: [
      "Soliciting borrowers or lenders for, negotiating, arranging, and performing services in connection with loans secured by real property.",
      "Making loans as a lender under a lending statute.",
      "Appraising the property that will secure the loan.",
      "Acting as an escrow holder in any transaction, without an exemption.",
    ],
    correctChoice: 0,
    rationale: "The broker license authorizes soliciting borrowers or lenders for, negotiating, arranging, and performing services in connection with loans secured by real property. Lending under a lending statute, appraising, and escrow outside an exemption are on the lesson's not-included list — they belong to other frameworks.",
  },
  "a1-b1-q2": {
    blockId: "a1-b1", concept: "broker-mortgage-authority", role: "replacement",
    replacementId: null, remediationScreen: "a1-b1-s3",
    prompt: "A salesperson performs mortgage activity under her responsible broker and a fee is earned. From whom may she accept compensation for that licensed activity?",
    choices: [
      "Only from her responsible broker.",
      "Directly from the borrower, if the arrangement is disclosed.",
      "From any lender that funds the loan.",
      "From either the brokerage or the borrower, at her election.",
    ],
    correctChoice: 0,
    rationale: "A salesperson conducts mortgage activity only for and under a responsible broker and may accept compensation for licensed activity only from that broker. The brokerage — not the salesperson — is the party to the engagement.",
  },
  "a1-b2-q1": {
    blockId: "a1-b2", concept: "mlo-endorsement", role: "primary",
    replacementId: "a1-b2-q2", remediationScreen: "a1-b2-s2",
    prompt: "A broker's real estate license is current, but his MLO license endorsement lapsed last month. May he take residential mortgage loan applications for compensation?",
    choices: [
      "No — the endorsement renews on its own cycle, and a licensee whose underlying license is current but whose endorsement has lapsed is not authorized to act as an MLO.",
      "Yes — the endorsement is part of the broker license and renews with it.",
      "Yes — as long as the brokerage's company registration is current.",
      "No — because acting as an MLO requires a separate DFPI license rather than an endorsement.",
    ],
    correctChoice: 0,
    rationale: "The MLO endorsement is an endorsement on the existing license, not a separate license — but it renews annually on its own cycle, separate from the underlying license renewal. Current license plus lapsed endorsement means no authority to originate; the company's registration does not substitute for the individual's endorsement.",
  },
  "a1-b2-q2": {
    blockId: "a1-b2", concept: "mlo-endorsement", role: "replacement",
    replacementId: null, remediationScreen: "a1-b2-s1",
    prompt: "Which combination triggers the MLO endorsement requirement?",
    choices: [
      "Taking a residential mortgage loan application, or offering or negotiating its terms, for compensation or the expectation of it — both the activity and the compensation element must be present.",
      "Any contact with a borrower about any loan, whether or not anyone is paid.",
      "Employment by a mortgage brokerage, whatever work the person actually performs.",
      "Quoting terms on commercial and business-purpose loans only.",
    ],
    correctChoice: 0,
    rationale: "Two elements do the work and both must be present: the activity (taking a residential mortgage loan application, or offering or negotiating terms) and compensation or its expectation. 'Residential mortgage loan' is the scope limiter — the requirement is tied to consumer residential lending.",
  },
  "a1-b3-q1": {
    blockId: "a1-b3", concept: "framework-boundaries", role: "primary",
    replacementId: "a1-b3-q2", remediationScreen: "a1-b3-s2",
    prompt: "A compliance manager at a DRE-licensed brokerage applies a fee rule she read in guidance written for DFPI-licensed mortgage lenders. What is the problem?",
    choices: [
      "Framework confusion — the DRE broker framework and the DFPI lending frameworks differ in what they authorize and require, and importing a rule from a different framework produces confidently wrong answers in both directions.",
      "Nothing — California mortgage requirements are uniform across licensing frameworks.",
      "Only that DFPI rules are stricter, so following them is always the safe choice.",
      "The rule applies, but only after the brokerage also registers with the DFPI.",
    ],
    correctChoice: 0,
    rationale: "The same functional activity is conducted in California under more than one licensing framework, and the frameworks differ in what they authorize, what they require, how fees and compensation are treated, and which regulator examines the firm. A requirement binding a DFPI-licensed lender may not bind a DRE broker — and the reverse — so the first question is always which license the firm holds.",
  },
  "a1-b3-q2": {
    blockId: "a1-b3", concept: "framework-boundaries", role: "replacement",
    replacementId: null, remediationScreen: "a1-b3-s3",
    prompt: "A borrower asks an originator whether he can rescind the loan if he changes his mind. Under the routing standard, what is the correct handling?",
    choices: [
      "Explain that a rescission right exists in defined circumstances, and route whether it applies to this borrower to counsel — the question calls for a legal conclusion the originator is not authorized to make.",
      "Answer from experience — an experienced originator may resolve routine legal questions.",
      "Tell the borrower rescission always applies for three days on every loan.",
      "Refuse to acknowledge that any such right exists.",
    ],
    correctChoice: 0,
    rationale: "The routing standard asks: would answering require a legal conclusion, a tax conclusion, a valuation, or an underwriting decision I am not authorized to make? Rescission applicability is a legal conclusion. The originator may explain that a right exists in defined circumstances without telling this borrower whether it applies to him — and experience does not extend the scope of a license.",
  },
  "a1-b4-q1": {
    blockId: "a1-b4", concept: "activity-not-title", role: "primary",
    replacementId: "a1-b4-q2", remediationScreen: "a1-b4-s1",
    prompt: "An unlicensed \"marketing associate\" calls prospects from a purchased list, quotes current rates, and is paid $400 for each prospect whose loan funds. What is the correct analysis?",
    choices: [
      "She is performing licensed activity — soliciting borrowers and quoting terms, with the compensation element explicit — and the title does not change that; paying an unlicensed person for producing loans is separately a compensation problem.",
      "The title controls: staff described as marketing or support never need a license.",
      "The activity is permissible as long as she reads only from a script the broker approved.",
      "Only the brokerage entity needs a license; individuals working inside it never do.",
    ],
    correctChoice: 0,
    rationale: "The title is not the test — the activity is. Soliciting borrowers and quoting terms is exactly what the license covers, and $400 per funded loan is compensation whatever it is called: compensation is defined broadly to include money, things of value, referral arrangements, and reciprocal benefits.",
  },
  "a1-b4-q2": {
    blockId: "a1-b4", concept: "activity-not-title", role: "replacement",
    replacementId: null, remediationScreen: "a1-b4-s2",
    prompt: "A borrower will occupy one unit of the fourplex securing his loan. A manager says to process the loan as business-purpose \"since it's an income property\" and to have the borrower sign a business-purpose certification. What does that certification establish?",
    choices: [
      "Only the borrower's statement — the determination rests on the actual purpose and the surrounding facts, and a file assembled around a certification the facts contradict is a file with a problem in it.",
      "Business purpose, conclusively — that is what the certification is for.",
      "Business purpose, provided the certification is signed before closing.",
      "Nothing, because purpose certifications are prohibited documents.",
    ],
    correctChoice: 0,
    rationale: "A borrower's signature on a business-purpose certification records his statement; it does not establish the fact. Consumer residential mortgage requirements attach to consumer-purpose loans secured by a dwelling, and a borrower occupying one unit is a fact pointing hard toward consumer purpose — 'it's an income property' is not the test.",
  },
  "a1-b5-q1": {
    blockId: "a1-b5", concept: "supervision-system", role: "primary",
    replacementId: "a1-b5-q2", remediationScreen: "a1-b5-s1",
    prompt: "A brokerage's compliance manual is thorough and current, but disclosures are tracked on a spreadsheet nobody updates, advertising publishes without review, and file review happens quarterly, after most loans have closed. Is the broker's supervision duty met?",
    choices: [
      "No — supervision is an affirmative duty discharged by a system, not by a manual, and a policy nobody follows is not supervision and is not a defense for anyone.",
      "Yes — a thorough written policy satisfies the duty by itself.",
      "Yes — the absence of borrower complaints is evidence the system works.",
      "No — but only the individual licensees are exposed, not the broker who wrote the policy.",
    ],
    correctChoice: 0,
    rationale: "Each failure defeats the control's purpose: file review must be close enough in time to catch a problem before the loan closes, advertising review must precede publication, and disclosure tracking must show what was delivered, to whom, when, and how. The absence of complaints is not evidence of compliance — complaints are only one of several routes by which a defect surfaces.",
  },
  "a1-b5-q2": {
    blockId: "a1-b5", concept: "supervision-system", role: "replacement",
    replacementId: null, remediationScreen: "a1-b5-s2",
    prompt: "A branch manager instructs an originator to move a job-change date on a borrower's application so the employment history reads better. The originator complies, but writes himself a note that the manager directed it. What is his position?",
    choices: [
      "He is responsible for the misrepresentation — following an improper instruction and documenting that it came from someone else does not transfer responsibility; it documents that he knew. The correct response was to refuse and escalate to the responsible broker.",
      "He is protected — the note shifts responsibility to the manager who gave the instruction.",
      "He is protected — a small alteration that would not change the ratios is immaterial.",
      "He is exposed only if the loan later defaults.",
    ],
    correctChoice: 0,
    rationale: "Altering an application changes a fact the lender relies on — misrepresentation to a lender, one of the enforcement categories. Documenting an improper instruction does not transfer responsibility for the act; it documents knowledge. The correct sequence is refuse, do not transmit the file, and escalate above the person who gave the instruction.",
  },
  "a1-b6-q1": {
    blockId: "a1-b6", concept: "complaint-response", role: "primary",
    replacementId: "a1-b6-q2", remediationScreen: "a1-b6-s3",
    prompt: "A borrower emails alleging he was misled about his rate lock. Which first response is correct?",
    choices: [
      "Acknowledge promptly, notify the broker immediately, preserve everything, and respond factually only after the file has been reviewed — offering nothing on your own initiative.",
      "Send a detailed defense within the hour, to demonstrate responsiveness.",
      "Offer a closing-cost credit at once, to resolve the matter quietly.",
      "Delete informal messages that could be misread before anyone asks for them.",
    ],
    correctChoice: 0,
    rationale: "The first response frequently determines whether the matter resolves or escalates: acknowledge promptly (silence reads as evasion), notify the broker, preserve the file and every communication, respond factually without admitting or denying liability before review, and do not offer a fee reduction or credit on your own initiative. Deleting a record that reflects poorly is far worse than the record — it changes the subject from professional judgment to integrity.",
  },
  "a1-b6-q2": {
    blockId: "a1-b6", concept: "complaint-response", role: "replacement",
    replacementId: null, remediationScreen: "a1-b6-s2",
    prompt: "The DRE telephones an originator directly with questions about a closed loan file. What does the originator do?",
    choices: [
      "Notify the broker immediately, preserve records, and do not respond independently or informally — cooperation is expected, but improvised answers without review are where licensees make statements they cannot support.",
      "Answer every question on the spot — hesitating reads as obstruction.",
      "Refer the regulator to the borrower for the facts.",
      "Quietly tidy the file first so that it reviews cleanly.",
    ],
    correctChoice: 0,
    rationale: "On regulator contact: notify the broker immediately, preserve records, and do not respond independently or informally. In a mortgage file, a statement about what was disclosed and when can be checked against the file within minutes. And 'tidying' a file is falsification territory — a documented gap is survivable; a manufactured or destroyed record ends a career.",
  },
});

/* SPACED_RETRIEVAL capability: a later block may present one or two questions from earlier
   concepts. The schedule ships EMPTY by design — the architecture is built now, mass spaced-review
   content is not activated. Entries would name {blockId, questionId} pairs where questionId's own
   block precedes blockId. */
export const A1_SPACED_RETRIEVAL = Object.freeze([]);

export default Object.freeze({ A1_BLOCKS, A1_RETRIEVAL_BANK, A1_SPACED_RETRIEVAL, SCREEN_TYPES });
