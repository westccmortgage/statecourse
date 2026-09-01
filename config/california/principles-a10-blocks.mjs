/**
 * GENERATED FILE — Principles Assignment 10 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-principles-block-maps.mjs; learning
 * objectives and the practice-problem mapping come from the hand-authored spec, and the retrieval
 * bank lives in the course's own retrieval-banks module. Do not edit by hand — regenerate. The
 * delivery layer only: the regulatory layer (sections, applied exercise, knowledge check,
 * remediation, timing, final exam) is untouched.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A10_BLOCKS = Object.freeze({
  courseId: "ca-real-estate-principles-45",
  assignmentId: "assignment-10",
  version: "1.0",
  contentPath: "/content/california/ca-real-estate-principles-45-v1/lesson-10.md",
  blocks: [
    {
      id: "pr10-b1", sequence: 1, required: true,
      title: "The escrow holder's role",
      learningObjective: "Define escrow by its two required elements — a binding contract between the parties and conditional delivery to a neutral holder — explain that escrow exists to solve the simultaneity problem of a buyer and seller who will each not go first, and apply what neutrality forbids (acting on one party's instruction, advising either party, deciding a dispute) to state precisely what escrow does when only one side instructs it.",
      sourceSections: [1],
      screens: [
        { id: "pr10-b1-s1", sequence: 1, type: "instruction", title: "What escrow is", content: RANGE("^", "### 1.3 Neutrality, and what it forbids") },
        { id: "pr10-b1-s2", sequence: 2, type: "instruction", title: "Neutrality, and what it forbids", content: RANGE("### 1.3 Neutrality, and what it forbids", "### 1.5 Who may act as escrow holder") },
        { id: "pr10-b1-s3", sequence: 3, type: "instruction", title: "Who may act as escrow holder", content: RANGE("### 1.5 Who may act as escrow holder", "## 2. Escrow instructions") },
        { id: "pr10-b1-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "pr10-b1-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pr10-b1-q1" },
      ],
    },
    {
      id: "pr10-b2", sequence: 2, required: true,
      title: "Escrow instructions",
      learningObjective: "Explain that escrow instructions implement the purchase agreement and that the agreement governs when the two conflict, describe what escrow needs at opening and why an incomplete contract or a missing amendment produces a mismatch, and explain why instructions are amended only in writing, signed by both parties, with line-by-line reconciliation against the contract the licensee's job that nobody else performs.",
      sourceSections: [2],
      screens: [
        { id: "pr10-b2-s1", sequence: 1, type: "instruction", title: "What they are", content: RANGE("## 2. Escrow instructions", "### 2.3 Opening escrow properly") },
        { id: "pr10-b2-s2", sequence: 2, type: "instruction", title: "Opening escrow properly", content: RANGE("### 2.3 Opening escrow properly", "### 2.5 What escrow will not do with instructions") },
        { id: "pr10-b2-s3", sequence: 3, type: "instruction", title: "What escrow will not do with instructions", content: RANGE("### 2.5 What escrow will not do with instructions", "## 3. Deposit and document handling") },
        { id: "pr10-b2-s4", sequence: 4, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "pr10-b2-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pr10-b2-q1" },
      ],
    },
    {
      id: "pr10-b3", sequence: 3, required: true,
      title: "Deposit and document handling",
      learningObjective: "Explain the deposit's two functions and when it is genuinely at risk, describe what escrow does with a disputed deposit and why entitlement to it is a legal question rather than one a licensee predicts, and apply the trust fund rules — including Business and Professions Code § 10145's three lawful destinations for client funds, who may sign for withdrawals, the auditor findings that recur, and the wire fraud warning's content and timing — to a broker's or licensee's handling of deposits and documents.",
      sourceSections: [3],
      screens: [
        { id: "pr10-b3-s1", sequence: 1, type: "instruction", title: "The deposit", content: RANGE("## 3. Deposit and document handling", "### 3.3 Trust funds and the licensee") },
        { id: "pr10-b3-s2", sequence: 2, type: "instruction", title: "Trust funds and the licensee", content: RANGE("### 3.3 Trust funds and the licensee", "### 3.5 Identity, fraud, and verification") },
        { id: "pr10-b3-s3", sequence: 3, type: "instruction", title: "Identity, fraud, and verification", content: RANGE("### 3.5 Identity, fraud, and verification", "### 3.8 The trust fund statute, in the broker's own words") },
        { id: "pr10-b3-s4", sequence: 4, type: "instruction", title: "The trust fund statute, in the broker's own words", content: RANGE("### 3.8 The trust fund statute, in the broker's own words", "### 3.10 What auditors actually find") },
        { id: "pr10-b3-s5", sequence: 5, type: "instruction", title: "What auditors actually find", content: RANGE("### 3.10 What auditors actually find", "## 4. Proration and closing statements") },
        { id: "pr10-b3-s6", sequence: 6, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "pr10-b3-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "pr10-b3-q1" },
      ],
    },
    {
      id: "pr10-b4", sequence: 4, required: true,
      title: "Proration and closing statements",
      learningObjective: "Compute a proration in both directions from the three questions that produce every proration — what period a charge covers, whether it has been paid or is owed, and where the ownership boundary falls — state which party is credited and which is debited depending on whether an item was prepaid or is accrued, and read a closing statement to identify what a licensee checks against the contract before closing, including the four recurring errors.",
      sourceSections: [4],
      screens: [
        { id: "pr10-b4-s1", sequence: 1, type: "instruction", title: "What proration is", content: RANGE("## 4. Proration and closing statements", "### 4.3 Worked prorations") },
        { id: "pr10-b4-s2", sequence: 2, type: "instruction", title: "Worked prorations", content: RANGE("### 4.3 Worked prorations", "### 4.5 The closing statement") },
        { id: "pr10-b4-s3", sequence: 3, type: "instruction", title: "The closing statement", content: RANGE("### 4.5 The closing statement", "### 4.8 Reading a closing statement line by line") },
        { id: "pr10-b4-s4", sequence: 4, type: "instruction", title: "Reading a closing statement line by line", content: RANGE("### 4.8 Reading a closing statement line by line", "## 5. Recording and disbursement") },
        { id: "pr10-b4-s5", sequence: 5, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "pr10-b4-s6", sequence: 6, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "pr10-b4-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "pr10-b4-q1" },
      ],
    },
    {
      id: "pr10-b5", sequence: 5, required: true,
      title: "Recording and disbursement",
      learningObjective: "Sequence signing, funding, recording, and disbursement in their required order, explain why recording deliberately precedes disbursement and why the order in which instruments record establishes lien priority, and distinguish ownership (transferring at recording) from possession (transferring on the contract's terms), including the documented response required at the final verification and for any divergence between recording and possession.",
      sourceSections: [5],
      screens: [
        { id: "pr10-b5-s1", sequence: 1, type: "instruction", title: "The four events, in order", content: RANGE("## 5. Recording and disbursement", "### 5.3 Recording order and priority") },
        { id: "pr10-b5-s2", sequence: 2, type: "instruction", title: "Recording order and priority", content: RANGE("### 5.3 Recording order and priority", "### 5.5 The final verification") },
        { id: "pr10-b5-s3", sequence: 3, type: "instruction", title: "The final verification", content: RANGE("### 5.5 The final verification", "### 5.7 Transfer of control") },
        { id: "pr10-b5-s4", sequence: 4, type: "instruction", title: "Transfer of control", content: RANGE("### 5.7 Transfer of control", "## 6. Post-closing records") },
        { id: "pr10-b5-s5", sequence: 5, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "pr10-b5-s6", sequence: 6, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "pr10-b5-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "pr10-b5-q1" },
      ],
    },
    {
      id: "pr10-b6", sequence: 6, required: true,
      title: "Post-closing records",
      learningObjective: "Run the post-closing audit for completeness, dates, consistency, chronology, and retention, explain why superseded document versions and failed transaction files are kept rather than discarded, and apply the correction rule — append, never overwrite — to distinguish a documented gap, which is survivable, from a falsified record, which is not.",
      sourceSections: [6],
      screens: [
        { id: "pr10-b6-s1", sequence: 1, type: "instruction", title: "Audit while memories are fresh", content: RANGE("## 6. Post-closing records", "### 6.3 Keep the superseded versions") },
        { id: "pr10-b6-s2", sequence: 2, type: "instruction", title: "Keep the superseded versions", content: RANGE("### 6.3 Keep the superseded versions", "### 6.5 The line") },
        { id: "pr10-b6-s3", sequence: 3, type: "instruction", title: "The line", content: RANGE("### 6.5 The line", "### 6.7 What actually prevents disputes") },
        { id: "pr10-b6-s4", sequence: 4, type: "instruction", title: "What actually prevents disputes", content: RANGE("### 6.7 What actually prevents disputes", "### 6.9 The chain of decisions escrow cannot make") },
        { id: "pr10-b6-s5", sequence: 5, type: "instruction", title: "The chain of decisions escrow cannot make", content: RANGE("### 6.9 The chain of decisions escrow cannot make", "### 6.12 Corrections, and the rule that never bends") },
        { id: "pr10-b6-s6", sequence: 6, type: "instruction", title: "Corrections, and the rule that never bends", content: RANGE("### 6.12 Corrections, and the rule that never bends", "## Key terms") },
        { id: "pr10-b6-s7", sequence: 7, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "pr10-b6-s8", sequence: 8, type: "retrieval", title: "Retrieval check", questionId: "pr10-b6-q1" },
      ],
    },
    {
      id: "pr10-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "pr10-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "pr10-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "pr10-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "pr10-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "pr10-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A10_BLOCKS;
