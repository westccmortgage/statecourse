/**
 * GENERATED FILE — Mortgage Assignment 2 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-mortgage-block-maps.mjs;
 * learning objectives and the practice-problem mapping come from the hand-authored spec in
 * mortgage-block-specs.mjs, and the retrieval bank lives in mortgage-retrieval-banks.mjs.
 * Do not edit by hand — regenerate. The delivery layer only: the regulatory layer (sections,
 * applied exercise, knowledge check, remediation, timing, final exam) is untouched, and B7's
 * mastery derives from the existing assignment record exactly as in the Assignment 1 pilot.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A2_BLOCKS = Object.freeze({
  courseId: "ca-mortgage-loan-brokering-lending-45",
  assignmentId: "assignment-02",
  version: "1.0",
  contentPath: "/content/california/ca-mortgage-loan-brokering-lending-45-v1/lesson-02.md",
  blocks: [
    {
      id: "a2-b1", sequence: 1, required: true,
      title: "Principal, interest, and term",
      learningObjective: "Compute simple interest in all four directions and per diem interest, and explain why interest paid in arrears shifts the first payment and raises a payoff.",
      sourceSections: [1],
      screens: [
        { id: "a2-b1-s1", sequence: 1, type: "instruction", title: "The three variables", content: RANGE("^", "### 1.3 Worked in all four directions") },
        { id: "a2-b1-s2", sequence: 2, type: "instruction", title: "Worked in all four directions", content: RANGE("### 1.3 Worked in all four directions", "### 1.5 Interest in arrears") },
        { id: "a2-b1-s3", sequence: 3, type: "instruction", title: "Interest in arrears", content: RANGE("### 1.5 Interest in arrears", "## 2. Simple interest and amortization") },
        { id: "a2-b1-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "a2-b1-s5", sequence: 5, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "a2-b1-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a2-b1-q1" },
      ],
    },
    {
      id: "a2-b2", sequence: 2, required: true,
      title: "Simple interest and amortization",
      learningObjective: "Build rows of an amortization schedule, explain the shifting interest-principal split and what it explains for borrowers, and describe negative amortization and recast in plain terms.",
      sourceSections: [2],
      screens: [
        { id: "a2-b2-s1", sequence: 1, type: "instruction", title: "What amortization does", content: RANGE("## 2. Simple interest and amortization", "### 2.3 The pattern, and what it explains") },
        { id: "a2-b2-s2", sequence: 2, type: "instruction", title: "The pattern, and what it explains", content: RANGE("### 2.3 The pattern, and what it explains", "### 2.5 The effect of term") },
        { id: "a2-b2-s3", sequence: 3, type: "instruction", title: "The effect of term", content: RANGE("### 2.5 The effect of term", "## 3. Promissory note terms") },
        { id: "a2-b2-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "a2-b2-q1" },
      ],
    },
    {
      id: "a2-b3", sequence: 3, required: true,
      title: "Promissory note terms",
      learningObjective: "Identify the operative provisions of a promissory note, distinguish acceleration from alienation, and state what determines an adjustable rate at adjustment.",
      sourceSections: [3],
      screens: [
        { id: "a2-b3-s1", sequence: 1, type: "instruction", title: "Two documents, two jobs", content: RANGE("## 3. Promissory note terms", "### 3.3 The provisions that matter operationally"), videos: [{"src":"/media/promissory-note-overview.mp4","poster":"/media/promissory-note-overview-poster.webp","captions":"/media/promissory-note-overview.vtt","label":"Video: The Promissory Note (document overview)","duration":"2:27"}], documents: [{"src":"/media/specimens/specimen-promissory-note.pdf","label":"Specimen promissory note — DiStefano transaction","note":"The $1,189,150 fixed-rate note behind this course's running example. Locate the principal, rate, payment, and late-charge provisions as you read."}] },
        { id: "a2-b3-s2", sequence: 2, type: "instruction", title: "The provisions that matter operationally", content: RANGE("### 3.3 The provisions that matter operationally", "### 3.5 Adjustable-rate provisions") },
        { id: "a2-b3-s3", sequence: 3, type: "instruction", title: "Adjustable-rate provisions", content: RANGE("### 3.5 Adjustable-rate provisions", "### 3.7 What a licensee says about note terms") },
        { id: "a2-b3-s4", sequence: 4, type: "instruction", title: "What a licensee says about note terms", content: RANGE("### 3.7 What a licensee says about note terms", "## 4. Points, fees, and annual percentage rate") },
        { id: "a2-b3-s5", sequence: 5, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "a2-b3-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a2-b3-q1" },
      ],
    },
    {
      id: "a2-b4", sequence: 4, required: true,
      title: "Points, fees, and annual percentage rate",
      learningObjective: "Compute points and a break-even, group closing costs by category, and state what the annual percentage rate does and does not capture.",
      sourceSections: [4],
      screens: [
        { id: "a2-b4-s1", sequence: 1, type: "instruction", title: "Points", content: RANGE("## 4. Points, fees, and annual percentage rate", "### 4.3 The categories of cost") },
        { id: "a2-b4-s2", sequence: 2, type: "instruction", title: "The categories of cost", content: RANGE("### 4.3 The categories of cost", "### 4.5 Nominal, effective, and note rate") },
        { id: "a2-b4-s3", sequence: 3, type: "instruction", title: "Nominal, effective, and note rate", content: RANGE("### 4.5 Nominal, effective, and note rate", "## 5. Loan-to-value and combined loan-to-value") },
        { id: "a2-b4-s4", sequence: 4, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "a2-b4-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a2-b4-q1" },
      ],
    },
    {
      id: "a2-b5", sequence: 5, required: true,
      title: "Loan-to-value and combined loan-to-value",
      learningObjective: "Compute loan-to-value and combined loan-to-value under the lower-of-value-or-price rule, and compute equity and cash-out availability.",
      sourceSections: [5],
      screens: [
        { id: "a2-b5-s1", sequence: 1, type: "instruction", title: "Loan-to-value", content: RANGE("## 5. Loan-to-value and combined loan-to-value", "### 5.3 Refinance transactions") },
        { id: "a2-b5-s2", sequence: 2, type: "instruction", title: "Refinance transactions", content: RANGE("### 5.3 Refinance transactions", "### 5.5 Equity and cash-out") },
        { id: "a2-b5-s3", sequence: 3, type: "instruction", title: "Equity and cash-out", content: RANGE("### 5.5 Equity and cash-out", "### 5.7 The three numbers, for a borrower") },
        { id: "a2-b5-s4", sequence: 4, type: "instruction", title: "The three numbers, for a borrower", content: RANGE("### 5.7 The three numbers, for a borrower", "## 6. Payment and yield calculations") },
        { id: "a2-b5-s5", sequence: 5, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "a2-b5-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a2-b5-q1" },
      ],
    },
    {
      id: "a2-b6", sequence: 6, required: true,
      title: "Payment and yield calculations",
      learningObjective: "Compute payments with the factor method, build PITI and qualifying ratios without stating thresholds, compute yield at a discount and a premium, and apply the reasonableness check to every figure.",
      sourceSections: [6],
      screens: [
        { id: "a2-b6-s1", sequence: 1, type: "instruction", title: "The payment factor method", content: RANGE("## 6. Payment and yield calculations", "### 6.3 PITI") },
        { id: "a2-b6-s2", sequence: 2, type: "instruction", title: "PITI", content: RANGE("### 6.3 PITI", "### 6.5 Yield") },
        { id: "a2-b6-s3", sequence: 3, type: "instruction", title: "Yield", content: RANGE("### 6.5 Yield", "### 6.7 The errors that produce wrong answers") },
        { id: "a2-b6-s4", sequence: 4, type: "instruction", title: "The errors that produce wrong answers", content: RANGE("### 6.7 The errors that produce wrong answers", "### 6.9 Reading a payment quote critically") },
        { id: "a2-b6-s5", sequence: 5, type: "instruction", title: "Reading a payment quote critically", content: RANGE("### 6.9 Reading a payment quote critically", "## Key terms") },
        { id: "a2-b6-s6", sequence: 6, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "a2-b6-s7", sequence: 7, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "a2-b6-s8", sequence: 8, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "a2-b6-s9", sequence: 9, type: "retrieval", title: "Retrieval check", questionId: "a2-b6-q1" },
      ],
    },
    {
      id: "a2-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "a2-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "a2-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "a2-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "a2-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "a2-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A2_BLOCKS;
