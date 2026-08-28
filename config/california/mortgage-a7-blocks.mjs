/**
 * GENERATED FILE — Mortgage Assignment 7 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-mortgage-block-maps.mjs;
 * learning objectives and the practice-problem mapping come from the hand-authored spec in
 * mortgage-block-specs.mjs, and the retrieval bank lives in mortgage-retrieval-banks.mjs.
 * Do not edit by hand — regenerate. The delivery layer only: the regulatory layer (sections,
 * applied exercise, knowledge check, remediation, timing, final exam) is untouched, and B7's
 * mastery derives from the existing assignment record exactly as in the Assignment 1 pilot.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A7_BLOCKS = Object.freeze({
  courseId: "ca-mortgage-loan-brokering-lending-45",
  assignmentId: "assignment-07",
  version: "1.0",
  contentPath: "/content/california/ca-mortgage-loan-brokering-lending-45-v1/lesson-07.md",
  blocks: [
    {
      id: "a7-b1", sequence: 1, required: true,
      title: "Truth in Lending and Regulation Z",
      learningObjective: "State what Truth in Lending does and covers, explain what the APR is for and does not capture, describe the two integrated disclosures and their timing consequences, and state what the rescission right is and is not.",
      sourceSections: [1],
      screens: [
        { id: "a7-b1-s1", sequence: 1, type: "instruction", title: "Why federal law is a separate lesson", content: RANGE("^", "### 1.3 Coverage") },
        { id: "a7-b1-s2", sequence: 2, type: "instruction", title: "Coverage", content: RANGE("### 1.3 Coverage", "### 1.5 The integrated disclosures") },
        { id: "a7-b1-s3", sequence: 3, type: "instruction", title: "The integrated disclosures", content: RANGE("### 1.5 The integrated disclosures", "### 1.7 High-cost and higher-priced loans") },
        { id: "a7-b1-s4", sequence: 4, type: "instruction", title: "High-cost and higher-priced loans", content: RANGE("### 1.7 High-cost and higher-priced loans", "## 2. RESPA and Regulation X") },
        { id: "a7-b1-s5", sequence: 5, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "a7-b1-s6", sequence: 6, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "a7-b1-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "a7-b1-q1" },
      ],
    },
    {
      id: "a7-b2", sequence: 2, required: true,
      title: "RESPA and Regulation X",
      learningObjective: "State RESPA's two purposes, apply the referral prohibition and the services-actually-performed test, explain why disclosure does not cure a referral payment, and state an affiliated business arrangement's conditions.",
      sourceSections: [2],
      screens: [
        { id: "a7-b2-s1", sequence: 1, type: "instruction", title: "What RESPA does", content: RANGE("## 2. RESPA and Regulation X", "### 2.3 The referral prohibition") },
        { id: "a7-b2-s2", sequence: 2, type: "instruction", title: "The referral prohibition", content: RANGE("### 2.3 The referral prohibition", "### 2.5 What is permitted") },
        { id: "a7-b2-s3", sequence: 3, type: "instruction", title: "What is permitted", content: RANGE("### 2.5 What is permitted", "### 2.7 Servicing disclosure and transfer") },
        { id: "a7-b2-s4", sequence: 4, type: "instruction", title: "Servicing disclosure and transfer", content: RANGE("### 2.7 Servicing disclosure and transfer", "### 2.9 Error resolution and information requests") },
        { id: "a7-b2-s5", sequence: 5, type: "instruction", title: "Error resolution and information requests", content: RANGE("### 2.9 Error resolution and information requests", "## 3. ECOA and Regulation B") },
        { id: "a7-b2-s6", sequence: 6, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "a7-b2-s7", sequence: 7, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "a7-b2-s8", sequence: 8, type: "retrieval", title: "Retrieval check", questionId: "a7-b2-q1" },
      ],
    },
    {
      id: "a7-b3", sequence: 3, required: true,
      title: "ECOA and Regulation B",
      learningObjective: "Name ECOA's prohibited bases including the two distinctive ones, apply the ask and do-not-ask rules, explain the government monitoring paradox, and state what an adverse action notice must contain.",
      sourceSections: [3],
      screens: [
        { id: "a7-b3-s1", sequence: 1, type: "instruction", title: "What ECOA does", content: RANGE("## 3. ECOA and Regulation B", "### 3.3 What may and may not be asked") },
        { id: "a7-b3-s2", sequence: 2, type: "instruction", title: "What may and may not be asked", content: RANGE("### 3.3 What may and may not be asked", "### 3.5 Adverse action") },
        { id: "a7-b3-s3", sequence: 3, type: "instruction", title: "Adverse action", content: RANGE("### 3.5 Adverse action", "### 3.7 Record retention") },
        { id: "a7-b3-s4", sequence: 4, type: "instruction", title: "Record retention", content: RANGE("### 3.7 Record retention", "## 4. HMDA and Regulation C") },
        { id: "a7-b3-s5", sequence: 5, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "a7-b3-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a7-b3-q1" },
      ],
    },
    {
      id: "a7-b4", sequence: 4, required: true,
      title: "HMDA and Regulation C",
      learningObjective: "State what HMDA does and its purposes, explain why the data matters even where nobody has complained, and identify the coding errors — above all a denial coded as a withdrawal — that distort it.",
      sourceSections: [4],
      screens: [
        { id: "a7-b4-s1", sequence: 1, type: "instruction", title: "What HMDA does", content: RANGE("## 4. HMDA and Regulation C", "### 4.3 What is reported, in outline") },
        { id: "a7-b4-s2", sequence: 2, type: "instruction", title: "What is reported, in outline", content: RANGE("### 4.3 What is reported, in outline", "### 4.5 Rate spread and pricing") },
        { id: "a7-b4-s3", sequence: 3, type: "instruction", title: "Rate spread and pricing", content: RANGE("### 4.5 Rate spread and pricing", "## 5. FCRA and credit reporting") },
        { id: "a7-b4-s4", sequence: 4, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "a7-b4-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a7-b4-q1" },
      ],
    },
    {
      id: "a7-b5", sequence: 5, required: true,
      title: "FCRA and credit reporting",
      learningObjective: "Apply FCRA permissible purpose, name the additional adverse-action content a consumer report requires, describe risk-based pricing, hold the credit-advice boundaries, and safeguard consumer information.",
      sourceSections: [5],
      screens: [
        { id: "a7-b5-s1", sequence: 1, type: "instruction", title: "What FCRA does", content: RANGE("## 5. FCRA and credit reporting", "### 5.3 Adverse action based on a report") },
        { id: "a7-b5-s2", sequence: 2, type: "instruction", title: "Adverse action based on a report", content: RANGE("### 5.3 Adverse action based on a report", "### 5.5 Accuracy and disputes") },
        { id: "a7-b5-s3", sequence: 3, type: "instruction", title: "Accuracy and disputes", content: RANGE("### 5.5 Accuracy and disputes", "### 5.7 Privacy notices") },
        { id: "a7-b5-s4", sequence: 4, type: "instruction", title: "Privacy notices", content: RANGE("### 5.7 Privacy notices", "## 6. SAFE Act and federal registration context") },
        { id: "a7-b5-s5", sequence: 5, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "a7-b5-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a7-b5-q1" },
      ],
    },
    {
      id: "a7-b6", sequence: 6, required: true,
      title: "SAFE Act and federal registration context",
      learningObjective: "Distinguish state-licensed from federally registered originators, state what triggers the MLO requirement, explain the unique identifier and the endorsement's separate renewal cycle, and route questions to the right framework.",
      sourceSections: [6],
      screens: [
        { id: "a7-b6-s1", sequence: 1, type: "instruction", title: "What the SAFE Act does", content: RANGE("## 6. SAFE Act and federal registration context", "### 6.3 What triggers the requirement") },
        { id: "a7-b6-s2", sequence: 2, type: "instruction", title: "What triggers the requirement", content: RANGE("### 6.3 What triggers the requirement", "### 6.5 Renewal and lapse") },
        { id: "a7-b6-s3", sequence: 3, type: "instruction", title: "Renewal and lapse", content: RANGE("### 6.5 Renewal and lapse", "### 6.7 How the federal framework fits the California one") },
        { id: "a7-b6-s4", sequence: 4, type: "instruction", title: "How the federal framework fits the California one", content: RANGE("### 6.7 How the federal framework fits the California one", "## Key terms") },
        { id: "a7-b6-s5", sequence: 5, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "a7-b6-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a7-b6-q1" },
      ],
    },
    {
      id: "a7-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "a7-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "a7-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "a7-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "a7-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "a7-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A7_BLOCKS;
