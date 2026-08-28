/**
 * GENERATED FILE — Mortgage Assignment 6 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-mortgage-block-maps.mjs;
 * learning objectives and the practice-problem mapping come from the hand-authored spec in
 * mortgage-block-specs.mjs, and the retrieval bank lives in mortgage-retrieval-banks.mjs.
 * Do not edit by hand — regenerate. The delivery layer only: the regulatory layer (sections,
 * applied exercise, knowledge check, remediation, timing, final exam) is untouched, and B7's
 * mastery derives from the existing assignment record exactly as in the Assignment 1 pilot.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A6_BLOCKS = Object.freeze({
  courseId: "ca-mortgage-loan-brokering-lending-45",
  assignmentId: "assignment-06",
  version: "1.0",
  contentPath: "/content/california/ca-mortgage-loan-brokering-lending-45-v1/lesson-06.md",
  blocks: [
    {
      id: "a6-b1", sequence: 1, required: true,
      title: "Ability-to-repay orientation",
      learningObjective: "State what the ability-to-repay determination requires, name the factors files most often miss, explain why a discounted start rate does not qualify a borrower, and outline qualified mortgages and the exclusions.",
      sourceSections: [1],
      screens: [
        { id: "a6-b1-s1", sequence: 1, type: "instruction", title: "What underwriting is", content: RANGE("^", "### 1.3 The factors considered") },
        { id: "a6-b1-s2", sequence: 2, type: "instruction", title: "The factors considered", content: RANGE("### 1.3 The factors considered", "### 1.5 Qualified mortgages, in outline") },
        { id: "a6-b1-s3", sequence: 3, type: "instruction", title: "Qualified mortgages, in outline", content: RANGE("### 1.5 Qualified mortgages, in outline", "## 2. Automated and manual underwriting") },
        { id: "a6-b1-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "a6-b1-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a6-b1-q1" },
      ],
    },
    {
      id: "a6-b2", sequence: 2, required: true,
      title: "Automated and manual underwriting",
      learningObjective: "State what an automated finding is and is not, explain why 'the system approved it' fails, and state who decides whether a compensating factor or an exception applies.",
      sourceSections: [2],
      screens: [
        { id: "a6-b2-s1", sequence: 1, type: "instruction", title: "Automated underwriting", content: RANGE("## 2. Automated and manual underwriting", "### 2.3 Compensating factors") },
        { id: "a6-b2-s2", sequence: 2, type: "instruction", title: "Compensating factors", content: RANGE("### 2.3 Compensating factors", "### 2.5 What the originator contributes to underwriting") },
        { id: "a6-b2-s3", sequence: 3, type: "instruction", title: "What the originator contributes to underwriting", content: RANGE("### 2.5 What the originator contributes to underwriting", "## 3. Appraisal and collateral review") },
        { id: "a6-b2-s4", sequence: 4, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "a6-b2-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a6-b2-q1" },
      ],
    },
    {
      id: "a6-b3", sequence: 3, required: true,
      title: "Appraisal and collateral review",
      learningObjective: "Apply the lower-of-value-or-price rule, distinguish supplying information from supplying a target, describe a correct reconsideration of value, and walk a borrower through a low appraisal honestly.",
      sourceSections: [3],
      screens: [
        { id: "a6-b3-s1", sequence: 1, type: "instruction", title: "What the appraisal is for", content: RANGE("## 3. Appraisal and collateral review", "### 3.3 Valuation review") },
        { id: "a6-b3-s2", sequence: 2, type: "instruction", title: "Valuation review", content: RANGE("### 3.3 Valuation review", "### 3.5 The low appraisal") },
        { id: "a6-b3-s3", sequence: 3, type: "instruction", title: "The low appraisal", content: RANGE("### 3.5 The low appraisal", "### 3.7 Other collateral considerations") },
        { id: "a6-b3-s4", sequence: 4, type: "instruction", title: "Other collateral considerations", content: RANGE("### 3.7 Other collateral considerations", "## 4. Title insurance and hazard insurance") },
        { id: "a6-b3-s5", sequence: 5, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "a6-b3-s6", sequence: 6, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "a6-b3-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "a6-b3-q1" },
      ],
    },
    {
      id: "a6-b4", sequence: 4, required: true,
      title: "Title insurance and hazard insurance",
      learningObjective: "Distinguish title insurance from hazard insurance and exceptions from exclusions and requirements, name what the title work must resolve, and treat insurance availability as a first-week item.",
      sourceSections: [4],
      screens: [
        { id: "a6-b4-s1", sequence: 1, type: "instruction", title: "Two different insurances", content: RANGE("## 4. Title insurance and hazard insurance", "### 4.3 Exceptions, exclusions, requirements") },
        { id: "a6-b4-s2", sequence: 2, type: "instruction", title: "Exceptions, exclusions, requirements", content: RANGE("### 4.3 Exceptions, exclusions, requirements", "### 4.5 Endorsements") },
        { id: "a6-b4-s3", sequence: 3, type: "instruction", title: "Endorsements", content: RANGE("### 4.5 Endorsements", "### 4.7 Availability, and why it fails transactions") },
        { id: "a6-b4-s4", sequence: 4, type: "instruction", title: "Availability, and why it fails transactions", content: RANGE("### 4.7 Availability, and why it fails transactions", "## 5. Conditions and verification") },
        { id: "a6-b4-s5", sequence: 5, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "a6-b4-s6", sequence: 6, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "a6-b4-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "a6-b4-q1" },
      ],
    },
    {
      id: "a6-b5", sequence: 5, required: true,
      title: "Conditions and verification",
      learningObjective: "Name the condition types and categories, explain why a prior-to-funding condition is not a formality, manage conditions against the lock, and state what must never be done to satisfy one.",
      sourceSections: [5],
      screens: [
        { id: "a6-b5-s1", sequence: 1, type: "instruction", title: "What a condition is", content: RANGE("## 5. Conditions and verification", "### 5.3 The categories") },
        { id: "a6-b5-s2", sequence: 2, type: "instruction", title: "The categories", content: RANGE("### 5.3 The categories", "### 5.5 Managing conditions") },
        { id: "a6-b5-s3", sequence: 3, type: "instruction", title: "Managing conditions", content: RANGE("### 5.5 Managing conditions", "### 5.7 The lock and the timeline") },
        { id: "a6-b5-s4", sequence: 4, type: "instruction", title: "The lock and the timeline", content: RANGE("### 5.7 The lock and the timeline", "## 6. Approval, denial, and adverse action") },
        { id: "a6-b5-s5", sequence: 5, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "a6-b5-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a6-b5-q1" },
      ],
    },
    {
      id: "a6-b6", sequence: 6, required: true,
      title: "Approval, denial, and adverse action",
      learningObjective: "Name the dispositions, state what adverse action notice requires and why a generic reason fails, communicate a denial honestly, and describe the fair-lending disciplines that constrain underwriting discretion.",
      sourceSections: [6],
      screens: [
        { id: "a6-b6-s1", sequence: 1, type: "instruction", title: "The dispositions", content: RANGE("## 6. Approval, denial, and adverse action", "### 6.3 The specific reasons") },
        { id: "a6-b6-s2", sequence: 2, type: "instruction", title: "The specific reasons", content: RANGE("### 6.3 The specific reasons", "### 6.5 Withdrawal and incompleteness") },
        { id: "a6-b6-s3", sequence: 3, type: "instruction", title: "Withdrawal and incompleteness", content: RANGE("### 6.5 Withdrawal and incompleteness", "### 6.7 Fair lending in the underwriting context") },
        { id: "a6-b6-s4", sequence: 4, type: "instruction", title: "Fair lending in the underwriting context", content: RANGE("### 6.7 Fair lending in the underwriting context", "## Key terms") },
        { id: "a6-b6-s5", sequence: 5, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "a6-b6-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a6-b6-q1" },
      ],
    },
    {
      id: "a6-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "a6-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "a6-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "a6-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "a6-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "a6-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A6_BLOCKS;
