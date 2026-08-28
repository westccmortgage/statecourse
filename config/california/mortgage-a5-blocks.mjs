/**
 * GENERATED FILE — Mortgage Assignment 5 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-mortgage-block-maps.mjs;
 * learning objectives and the practice-problem mapping come from the hand-authored spec in
 * mortgage-block-specs.mjs, and the retrieval bank lives in mortgage-retrieval-banks.mjs.
 * Do not edit by hand — regenerate. The delivery layer only: the regulatory layer (sections,
 * applied exercise, knowledge check, remediation, timing, final exam) is untouched, and B7's
 * mastery derives from the existing assignment record exactly as in the Assignment 1 pilot.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A5_BLOCKS = Object.freeze({
  courseId: "ca-mortgage-loan-brokering-lending-45",
  assignmentId: "assignment-05",
  version: "1.0",
  contentPath: "/content/california/ca-mortgage-loan-brokering-lending-45-v1/lesson-05.md",
  blocks: [
    {
      id: "a5-b1", sequence: 1, required: true,
      title: "Loan application workflow",
      learningObjective: "Distinguish prequalification, preapproval, and loan commitment, state what constitutes an application and what taking one triggers, and explain why structuring to avoid the trigger is a compliance problem.",
      sourceSections: [1],
      screens: [
        { id: "a5-b1-s1", sequence: 1, type: "instruction", title: "The sequence", content: RANGE("^", "### 1.3 What constitutes an application") },
        { id: "a5-b1-s2", sequence: 2, type: "instruction", title: "What constitutes an application", content: RANGE("### 1.3 What constitutes an application", "### 1.5 The uniform application") },
        { id: "a5-b1-s3", sequence: 3, type: "instruction", title: "The uniform application", content: RANGE("### 1.5 The uniform application", "## 2. Income, asset, and liability information") },
        { id: "a5-b1-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "a5-b1-s5", sequence: 5, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "a5-b1-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a5-b1-q1" },
      ],
    },
    {
      id: "a5-b2", sequence: 2, required: true,
      title: "Income, asset, and liability information",
      learningObjective: "Collect and verify income, assets, and liabilities, explain why a large deposit requires sourcing, and state what a licensee must never suggest about deposits.",
      sourceSections: [2],
      screens: [
        { id: "a5-b2-s1", sequence: 1, type: "instruction", title: "The three categories", content: RANGE("## 2. Income, asset, and liability information", "### 2.3 Self-employment and variable income") },
        { id: "a5-b2-s2", sequence: 2, type: "instruction", title: "Self-employment and variable income", content: RANGE("### 2.3 Self-employment and variable income", "### 2.5 Large deposits and sourcing") },
        { id: "a5-b2-s3", sequence: 3, type: "instruction", title: "Large deposits and sourcing", content: RANGE("### 2.5 Large deposits and sourcing", "### 2.7 What a licensee does with the information") },
        { id: "a5-b2-s4", sequence: 4, type: "instruction", title: "What a licensee does with the information", content: RANGE("### 2.7 What a licensee does with the information", "## 3. Credit history and capacity") },
        { id: "a5-b2-s5", sequence: 5, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "a5-b2-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a5-b2-q1" },
      ],
    },
    {
      id: "a5-b3", sequence: 3, required: true,
      title: "Credit history and capacity",
      learningObjective: "State what a credit report contains and its limits, apply permissible purpose and authorization, hold the line on what a licensee may not say about credit, and surface adverse credit early.",
      sourceSections: [3],
      screens: [
        { id: "a5-b3-s1", sequence: 1, type: "instruction", title: "What credit information does", content: RANGE("## 3. Credit history and capacity", "### 3.3 Permissible purpose and authorization") },
        { id: "a5-b3-s2", sequence: 2, type: "instruction", title: "Permissible purpose and authorization", content: RANGE("### 3.3 Permissible purpose and authorization", "### 3.5 Adverse credit information") },
        { id: "a5-b3-s3", sequence: 3, type: "instruction", title: "Adverse credit information", content: RANGE("### 3.5 Adverse credit information", "## 4. Occupancy and property purpose") },
        { id: "a5-b3-s4", sequence: 4, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "a5-b3-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a5-b3-q1" },
      ],
    },
    {
      id: "a5-b4", sequence: 4, required: true,
      title: "Occupancy and property purpose",
      learningObjective: "Explain why occupancy is a material fact whose misstatement is loan fraud, recognize the contradiction patterns, respond correctly to the owner-occupancy request, and distinguish a change of intent from a misrepresentation.",
      sourceSections: [4],
      screens: [
        { id: "a5-b4-s1", sequence: 1, type: "instruction", title: "Why the determination carries so much", content: RANGE("## 4. Occupancy and property purpose", "### 4.3 The patterns that contradict a stated occupancy") },
        { id: "a5-b4-s2", sequence: 2, type: "instruction", title: "The patterns that contradict a stated occupancy", content: RANGE("### 4.3 The patterns that contradict a stated occupancy", "### 4.5 Legitimate changes of intent") },
        { id: "a5-b4-s3", sequence: 3, type: "instruction", title: "Legitimate changes of intent", content: RANGE("### 4.5 Legitimate changes of intent", "## 5. Debt-to-income analysis") },
        { id: "a5-b4-s4", sequence: 4, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "a5-b4-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a5-b4-q1" },
      ],
    },
    {
      id: "a5-b5", sequence: 5, required: true,
      title: "Debt-to-income analysis",
      learningObjective: "Compute the front-end and back-end ratios, name the errors that produce wrong ones, never state a threshold as a rule, and warn the borrower in writing about the actions that change a ratio after application.",
      sourceSections: [5],
      screens: [
        { id: "a5-b5-s1", sequence: 1, type: "instruction", title: "The two ratios", content: RANGE("## 5. Debt-to-income analysis", "### 5.3 The errors that produce wrong ratios") },
        { id: "a5-b5-s2", sequence: 2, type: "instruction", title: "The errors that produce wrong ratios", content: RANGE("### 5.3 The errors that produce wrong ratios", "### 5.5 Residual income and the limits of ratios") },
        { id: "a5-b5-s3", sequence: 3, type: "instruction", title: "Residual income and the limits of ratios", content: RANGE("### 5.5 Residual income and the limits of ratios", "### 5.7 The three numbers") },
        { id: "a5-b5-s4", sequence: 4, type: "instruction", title: "The three numbers", content: RANGE("### 5.7 The three numbers", "## 6. Adverse information and accurate records") },
        { id: "a5-b5-s5", sequence: 5, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "a5-b5-s6", sequence: 6, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "a5-b5-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "a5-b5-q1" },
      ],
    },
    {
      id: "a5-b6", sequence: 6, required: true,
      title: "Adverse information and accurate records",
      learningObjective: "Keep the application accurate: refuse alterations and omissions, handle adverse information and corrections properly, and build a file that passes the reconstructability test.",
      sourceSections: [6],
      screens: [
        { id: "a5-b6-s1", sequence: 1, type: "instruction", title: "The standard", content: RANGE("## 6. Adverse information and accurate records", "### 6.3 The instruction an originator will receive") },
        { id: "a5-b6-s2", sequence: 2, type: "instruction", title: "The instruction an originator will receive", content: RANGE("### 6.3 The instruction an originator will receive", "### 6.5 Corrections") },
        { id: "a5-b6-s3", sequence: 3, type: "instruction", title: "Corrections", content: RANGE("### 6.5 Corrections", "### 6.7 The test") },
        { id: "a5-b6-s4", sequence: 4, type: "instruction", title: "The test", content: RANGE("### 6.7 The test", "## Key terms") },
        { id: "a5-b6-s5", sequence: 5, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "a5-b6-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a5-b6-q1" },
      ],
    },
    {
      id: "a5-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "a5-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "a5-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "a5-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "a5-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "a5-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A5_BLOCKS;
