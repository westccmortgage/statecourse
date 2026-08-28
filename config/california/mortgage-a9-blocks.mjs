/**
 * GENERATED FILE — Mortgage Assignment 9 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-mortgage-block-maps.mjs;
 * learning objectives and the practice-problem mapping come from the hand-authored spec in
 * mortgage-block-specs.mjs, and the retrieval bank lives in mortgage-retrieval-banks.mjs.
 * Do not edit by hand — regenerate. The delivery layer only: the regulatory layer (sections,
 * applied exercise, knowledge check, remediation, timing, final exam) is untouched, and B7's
 * mastery derives from the existing assignment record exactly as in the Assignment 1 pilot.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A9_BLOCKS = Object.freeze({
  courseId: "ca-mortgage-loan-brokering-lending-45",
  assignmentId: "assignment-09",
  version: "1.0",
  contentPath: "/content/california/ca-mortgage-loan-brokering-lending-45-v1/lesson-09.md",
  blocks: [
    {
      id: "a9-b1", sequence: 1, required: true,
      title: "Loan Estimate and Closing Disclosure orientation",
      learningObjective: "State the Loan Estimate's and Closing Disclosure's purposes and timing, name the changes that restart the waiting period, evidence delivery, and keep the California mortgage loan disclosure statement separate.",
      sourceSections: [1],
      screens: [
        { id: "a9-b1-s1", sequence: 1, type: "instruction", title: "What the forms do", content: RANGE("^", "### 1.3 What the Loan Estimate contains") },
        { id: "a9-b1-s2", sequence: 2, type: "instruction", title: "What the Loan Estimate contains", content: RANGE("### 1.3 What the Loan Estimate contains", "### 1.5 What this means operationally"), video: {"src":"/media/document-overview-loan-estimate-page-1.mp4","poster":"/media/document-overview-loan-estimate-page-1-poster.webp","label":"Video: Loan Estimate — Page 1 (document overview)","duration":"1:59"} },
        { id: "a9-b1-s3", sequence: 3, type: "instruction", title: "What this means operationally", content: RANGE("### 1.5 What this means operationally", "### 1.7 The California layer") },
        { id: "a9-b1-s4", sequence: 4, type: "instruction", title: "The California layer", content: RANGE("### 1.7 The California layer", "## 2. Broker compensation disclosure") },
        { id: "a9-b1-s5", sequence: 5, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "a9-b1-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a9-b1-q1" },
      ],
    },
    {
      id: "a9-b2", sequence: 2, required: true,
      title: "Broker compensation disclosure",
      learningObjective: "Apply the prohibition on term-based compensation and its proxies, the dual compensation restriction, and the steering rules, and reconcile compensation disclosed against compensation received on every file.",
      sourceSections: [2],
      screens: [
        { id: "a9-b2-s1", sequence: 1, type: "instruction", title: "Why compensation is regulated", content: RANGE("## 2. Broker compensation disclosure", "### 2.3 The dual compensation restriction") },
        { id: "a9-b2-s2", sequence: 2, type: "instruction", title: "The dual compensation restriction", content: RANGE("### 2.3 The dual compensation restriction", "### 2.5 What must be disclosed") },
        { id: "a9-b2-s3", sequence: 3, type: "instruction", title: "What must be disclosed", content: RANGE("### 2.5 What must be disclosed", "### 2.7 Compensation and the points-and-fees calculation") },
        { id: "a9-b2-s4", sequence: 4, type: "instruction", title: "Compensation and the points-and-fees calculation", content: RANGE("### 2.7 Compensation and the points-and-fees calculation", "## 3. Affiliated business and referral risk") },
        { id: "a9-b2-s5", sequence: 5, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "a9-b2-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a9-b2-q1" },
      ],
    },
    {
      id: "a9-b3", sequence: 3, required: true,
      title: "Affiliated business and referral risk",
      learningObjective: "State the referral prohibition and why disclosure does not cure it, apply the services-actually-performed test to marketing agreements and other structures, state the affiliated business conditions, and decline and escalate offers.",
      sourceSections: [3],
      screens: [
        { id: "a9-b3-s1", sequence: 1, type: "instruction", title: "The prohibition, restated", content: RANGE("## 3. Affiliated business and referral risk", "### 3.3 The test") },
        { id: "a9-b3-s2", sequence: 2, type: "instruction", title: "The test", content: RANGE("### 3.3 The test", "### 3.5 Affiliated business arrangements") },
        { id: "a9-b3-s3", sequence: 3, type: "instruction", title: "Affiliated business arrangements", content: RANGE("### 3.5 Affiliated business arrangements", "### 3.7 What to do when offered one") },
        { id: "a9-b3-s4", sequence: 4, type: "instruction", title: "What to do when offered one", content: RANGE("### 3.7 What to do when offered one", "## 4. Fee tolerance and changed circumstances") },
        { id: "a9-b3-s5", sequence: 5, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "a9-b3-s6", sequence: 6, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "a9-b3-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "a9-b3-q1" },
      ],
    },
    {
      id: "a9-b4", sequence: 4, required: true,
      title: "Fee tolerance and changed circumstances",
      learningObjective: "Name the three fee tolerance categories and how a consumer's shopping choice moves a charge, distinguish a changed circumstance from a discovered error, and state what a cure is.",
      sourceSections: [4],
      screens: [
        { id: "a9-b4-s1", sequence: 1, type: "instruction", title: "Why tolerances exist", content: RANGE("## 4. Fee tolerance and changed circumstances", "### 4.3 Cures") },
        { id: "a9-b4-s2", sequence: 2, type: "instruction", title: "Cures", content: RANGE("### 4.3 Cures", "### 4.5 What is not a changed circumstance") },
        { id: "a9-b4-s3", sequence: 3, type: "instruction", title: "What is not a changed circumstance", content: RANGE("### 4.5 What is not a changed circumstance", "### 4.7 What an originator contributes") },
        { id: "a9-b4-s4", sequence: 4, type: "instruction", title: "What an originator contributes", content: RANGE("### 4.7 What an originator contributes", "## 5. Prepayment, balloon, and adjustable-rate disclosure") },
        { id: "a9-b4-s5", sequence: 5, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "a9-b4-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a9-b4-q1" },
      ],
    },
    {
      id: "a9-b5", sequence: 5, required: true,
      title: "Prepayment, balloon, and adjustable-rate disclosure",
      learningObjective: "Present prepayment penalties, balloons, adjustable-rate terms, interest-only and negative amortization, and buydowns in plain terms with their numbers — the fully indexed rate above all.",
      sourceSections: [5],
      screens: [
        { id: "a9-b5-s1", sequence: 1, type: "instruction", title: "The principle", content: RANGE("## 5. Prepayment, balloon, and adjustable-rate disclosure", "### 5.3 Balloon payments") },
        { id: "a9-b5-s2", sequence: 2, type: "instruction", title: "Balloon payments", content: RANGE("### 5.3 Balloon payments", "### 5.5 Interest-only and negative amortization") },
        { id: "a9-b5-s3", sequence: 3, type: "instruction", title: "Interest-only and negative amortization", content: RANGE("### 5.5 Interest-only and negative amortization", "### 5.7 The presentation that satisfies the obligation") },
        { id: "a9-b5-s4", sequence: 4, type: "instruction", title: "The presentation that satisfies the obligation", content: RANGE("### 5.7 The presentation that satisfies the obligation", "## 6. Consumer comparison and acknowledgment") },
        { id: "a9-b5-s5", sequence: 5, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "a9-b5-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a9-b5-q1" },
      ],
    },
    {
      id: "a9-b6", sequence: 6, required: true,
      title: "Consumer comparison and acknowledgment",
      learningObjective: "Present products on a common basis, name the comparisons that mislead, explain why acknowledgment is not understanding, keep the prohibited statements out, and build the file that passes reconstructability.",
      sourceSections: [6],
      screens: [
        { id: "a9-b6-s1", sequence: 1, type: "instruction", title: "The comparison standard", content: RANGE("## 6. Consumer comparison and acknowledgment", "### 6.3 What the consumer actually needs") },
        { id: "a9-b6-s2", sequence: 2, type: "instruction", title: "What the consumer actually needs", content: RANGE("### 6.3 What the consumer actually needs", "### 6.5 What must never appear in a comparison") },
        { id: "a9-b6-s3", sequence: 3, type: "instruction", title: "What must never appear in a comparison", content: RANGE("### 6.5 What must never appear in a comparison", "### 6.7 The test") },
        { id: "a9-b6-s4", sequence: 4, type: "instruction", title: "The test", content: RANGE("### 6.7 The test", "## Key terms") },
        { id: "a9-b6-s5", sequence: 5, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "a9-b6-s6", sequence: 6, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "a9-b6-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "a9-b6-q1" },
      ],
    },
    {
      id: "a9-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "a9-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "a9-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "a9-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "a9-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "a9-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A9_BLOCKS;
