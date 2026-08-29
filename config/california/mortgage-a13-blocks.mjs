/**
 * GENERATED FILE — Mortgage Assignment 13 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-mortgage-block-maps.mjs; learning
 * objectives and the practice-problem mapping come from the hand-authored spec, and the retrieval
 * bank lives in the course's own retrieval-banks module. Do not edit by hand — regenerate. The
 * delivery layer only: the regulatory layer (sections, applied exercise, knowledge check,
 * remediation, timing, final exam) is untouched.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A13_BLOCKS = Object.freeze({
  courseId: "ca-mortgage-loan-brokering-lending-45",
  assignmentId: "assignment-13",
  version: "1.0",
  contentPath: "/content/california/ca-mortgage-loan-brokering-lending-45-v1/lesson-13.md",
  blocks: [
    {
      id: "a13-b1", sequence: 1, required: true,
      title: "Payment processing and servicing records",
      learningObjective: "Distinguish the owner, servicer, and originator, explain partial payment and extra-principal handling, keep servicing records as trust records where a broker services, and state what a transfer does and does not change.",
      sourceSections: [1],
      screens: [
        { id: "a13-b1-s1", sequence: 1, type: "instruction", title: "What servicing is", content: RANGE("^", "### 1.3 Payment application") },
        { id: "a13-b1-s2", sequence: 2, type: "instruction", title: "Payment application", content: RANGE("### 1.3 Payment application", "### 1.5 Servicing transfers") },
        { id: "a13-b1-s3", sequence: 3, type: "instruction", title: "Servicing transfers", content: RANGE("### 1.5 Servicing transfers", "## 2. Escrow accounts") },
        { id: "a13-b1-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "a13-b1-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a13-b1-q1" },
      ],
    },
    {
      id: "a13-b2", sequence: 2, required: true,
      title: "Escrow accounts",
      learningObjective: "Explain why a fixed-rate payment changes, describe the California reassessment problem and the supplemental tax bill, read an escrow analysis, and deliver the four origination explanations in writing.",
      sourceSections: [2],
      screens: [
        { id: "a13-b2-s1", sequence: 1, type: "instruction", title: "What an escrow account is", content: RANGE("## 2. Escrow accounts", "### 2.3 The California reassessment problem") },
        { id: "a13-b2-s2", sequence: 2, type: "instruction", title: "The California reassessment problem", content: RANGE("### 2.3 The California reassessment problem", "### 2.5 Escrow waivers") },
        { id: "a13-b2-s3", sequence: 3, type: "instruction", title: "Escrow waivers", content: RANGE("### 2.5 Escrow waivers", "## 3. Payoff demand and reconveyance") },
        { id: "a13-b2-s4", sequence: 4, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "a13-b2-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a13-b2-q1" },
      ],
    },
    {
      id: "a13-b3", sequence: 3, required: true,
      title: "Payoff demand and reconveyance",
      learningObjective: "Explain why a payoff exceeds the statement balance, compute a per diem extension past the good-through date, state what clears a satisfied lien, and distinguish payoff from assumption and subordination.",
      sourceSections: [3],
      screens: [
        { id: "a13-b3-s1", sequence: 1, type: "instruction", title: "What a payoff demand is", content: RANGE("## 3. Payoff demand and reconveyance", "### 3.3 The per diem and the good-through date"), documents: [{"src":"/media/specimens/specimen-payoff-demand.pdf","label":"Specimen payoff demand — DiStefano transaction","note":"Check the arithmetic yourself: principal, per-diem interest to the good-through date, and fees. This demand pays off the lien shown on the preliminary report in Assignment 11."}] },
        { id: "a13-b3-s2", sequence: 2, type: "instruction", title: "The per diem and the good-through date", content: RANGE("### 3.3 The per diem and the good-through date", "### 3.5 Partial reconveyance") },
        { id: "a13-b3-s3", sequence: 3, type: "instruction", title: "Partial reconveyance", content: RANGE("### 3.5 Partial reconveyance", "## 4. Delinquency and loss mitigation") },
        { id: "a13-b3-s4", sequence: 4, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "a13-b3-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a13-b3-q1" },
      ],
    },
    {
      id: "a13-b4", sequence: 4, required: true,
      title: "Delinquency and loss mitigation",
      learningObjective: "Name the loss mitigation options and what each carries, state the California servicer protections in outline, hold the distressed-borrower boundaries, and recognize foreclosure rescue fraud patterns.",
      sourceSections: [4],
      screens: [
        { id: "a13-b4-s1", sequence: 1, type: "instruction", title: "What default is", content: RANGE("## 4. Delinquency and loss mitigation", "### 4.3 What each carries that borrowers do not expect") },
        { id: "a13-b4-s2", sequence: 2, type: "instruction", title: "What each carries that borrowers do not expect", content: RANGE("### 4.3 What each carries that borrowers do not expect", "### 4.5 What a licensee may and may not tell a distressed borrower") },
        { id: "a13-b4-s3", sequence: 3, type: "instruction", title: "What a licensee may and may not tell a distressed borrower", content: RANGE("### 4.5 What a licensee may and may not tell a distressed borrower", "## 5. Nonjudicial foreclosure orientation") },
        { id: "a13-b4-s4", sequence: 4, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "a13-b4-s5", sequence: 5, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "a13-b4-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a13-b4-q1" },
      ],
    },
    {
      id: "a13-b5", sequence: 5, required: true,
      title: "Nonjudicial foreclosure orientation",
      learningObjective: "Compare the foreclosure paths and outline the nonjudicial sequence, distinguish reinstatement from redemption, describe the trustee's sale and its aftermath for juniors and occupants, and escalate a bankruptcy filing immediately.",
      sourceSections: [5],
      screens: [
        { id: "a13-b5-s1", sequence: 1, type: "instruction", title: "The two paths", content: RANGE("## 5. Nonjudicial foreclosure orientation", "### 5.3 Reinstatement and redemption") },
        { id: "a13-b5-s2", sequence: 2, type: "instruction", title: "Reinstatement and redemption", content: RANGE("### 5.3 Reinstatement and redemption", "### 5.5 What happens to junior liens") },
        { id: "a13-b5-s3", sequence: 3, type: "instruction", title: "What happens to junior liens", content: RANGE("### 5.5 What happens to junior liens", "### 5.7 Occupants after a sale") },
        { id: "a13-b5-s4", sequence: 4, type: "instruction", title: "Occupants after a sale", content: RANGE("### 5.7 Occupants after a sale", "## 6. Borrower communication and complaint handling") },
        { id: "a13-b5-s5", sequence: 5, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "a13-b5-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a13-b5-q1" },
      ],
    },
    {
      id: "a13-b6", sequence: 6, required: true,
      title: "Borrower communication and complaint handling",
      learningObjective: "Route borrowers to the defined error and information procedures, communicate with distressed borrowers without predictions, handle complaints and regulator contact correctly, and trace servicing complaints to their origination failures.",
      sourceSections: [6],
      screens: [
        { id: "a13-b6-s1", sequence: 1, type: "instruction", title: "Why communication is a compliance subject", content: RANGE("## 6. Borrower communication and complaint handling", "### 6.3 Communicating with a distressed borrower") },
        { id: "a13-b6-s2", sequence: 2, type: "instruction", title: "Communicating with a distressed borrower", content: RANGE("### 6.3 Communicating with a distressed borrower", "### 6.5 Handling a complaint") },
        { id: "a13-b6-s3", sequence: 3, type: "instruction", title: "Handling a complaint", content: RANGE("### 6.5 Handling a complaint", "### 6.7 What the file must show") },
        { id: "a13-b6-s4", sequence: 4, type: "instruction", title: "What the file must show", content: RANGE("### 6.7 What the file must show", "## Key terms") },
        { id: "a13-b6-s5", sequence: 5, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "a13-b6-s6", sequence: 6, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "a13-b6-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "a13-b6-q1" },
      ],
    },
    {
      id: "a13-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "a13-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "a13-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "a13-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "a13-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "a13-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A13_BLOCKS;
