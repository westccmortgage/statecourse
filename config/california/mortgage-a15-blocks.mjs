/**
 * GENERATED FILE — Mortgage Assignment 15 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-mortgage-block-maps.mjs; learning
 * objectives and the practice-problem mapping come from the hand-authored spec, and the retrieval
 * bank lives in the course's own retrieval-banks module. Do not edit by hand — regenerate. The
 * delivery layer only: the regulatory layer (sections, applied exercise, knowledge check,
 * remediation, timing, final exam) is untouched.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A15_BLOCKS = Object.freeze({
  courseId: "ca-mortgage-loan-brokering-lending-45",
  assignmentId: "assignment-15",
  version: "1.0",
  contentPath: "/content/california/ca-mortgage-loan-brokering-lending-45-v1/lesson-15.md",
  blocks: [
    {
      id: "a15-b1", sequence: 1, required: true,
      title: "Consumer inquiry and scope",
      learningObjective: "Place a file's events on the nine-step chronology, settle capacity, authority, scope, and compensation in the first conversation, hold the fact-estimate-assurance line at intake, and record the dated intake note.",
      sourceSections: [1],
      screens: [
        { id: "a15-b1-s1", sequence: 1, type: "instruction", title: "The chronology, and why it is a chronology", content: RANGE("^", "### 1.3 What the consumer is actually asking") },
        { id: "a15-b1-s2", sequence: 2, type: "instruction", title: "What the consumer is actually asking", content: RANGE("### 1.3 What the consumer is actually asking", "### 1.5 Advertising arrived before the consumer did") },
        { id: "a15-b1-s3", sequence: 3, type: "instruction", title: "Advertising arrived before the consumer did", content: RANGE("### 1.5 Advertising arrived before the consumer did", "## 2. Application and identity") },
        { id: "a15-b1-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "a15-b1-q1" },
      ],
    },
    {
      id: "a15-b2", sequence: 2, required: true,
      title: "Application and identity",
      learningObjective: "Apply the six-item application trigger without exception, run everything that starts at that moment, code dispositions as the substantive statements they are, and keep the originator's hands off document creation.",
      sourceSections: [2],
      screens: [
        { id: "a15-b2-s1", sequence: 1, type: "instruction", title: "The moment an application exists", content: RANGE("## 2. Application and identity", "### 2.3 Disposition coding is not clerical") },
        { id: "a15-b2-s2", sequence: 2, type: "instruction", title: "Disposition coding is not clerical", content: RANGE("### 2.3 Disposition coding is not clerical", "### 2.5 The documents, and the line the originator does not cross") },
        { id: "a15-b2-s3", sequence: 3, type: "instruction", title: "The documents, and the line the originator does not cross", content: RANGE("### 2.5 The documents, and the line the originator does not cross", "## 3. Product comparison and disclosures") },
        { id: "a15-b2-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "a15-b2-s5", sequence: 5, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "a15-b2-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a15-b2-q1" },
      ],
    },
    {
      id: "a15-b3", sequence: 3, required: true,
      title: "Product comparison and disclosures",
      learningObjective: "Run the federal and California disclosure systems with delivery evidence, present every option on a common basis with its worst case, record the suitability facts, and support every revision with a contemporaneous reason.",
      sourceSections: [3],
      screens: [
        { id: "a15-b3-s1", sequence: 1, type: "instruction", title: "Two disclosure systems running at once", content: RANGE("## 3. Product comparison and disclosures", "### 3.3 The comparison on a common basis") },
        { id: "a15-b3-s2", sequence: 2, type: "instruction", title: "The comparison on a common basis", content: RANGE("### 3.3 The comparison on a common basis", "### 3.5 Changed circumstances") },
        { id: "a15-b3-s3", sequence: 3, type: "instruction", title: "Changed circumstances", content: RANGE("### 3.5 Changed circumstances", "## 4. Underwriting and conditions") },
        { id: "a15-b3-s4", sequence: 4, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "a15-b3-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a15-b3-q1" },
      ],
    },
    {
      id: "a15-b4", sequence: 4, required: true,
      title: "Underwriting and conditions",
      learningObjective: "Assemble a file that proves the ability-to-repay determination without the originator present, clear conditions with source evidence only, treat an unmeetable condition as information, and keep targets away from the appraisal.",
      sourceSections: [4],
      screens: [
        { id: "a15-b4-s1", sequence: 1, type: "instruction", title: "What the file has to prove", content: RANGE("## 4. Underwriting and conditions", "### 4.3 Conditions the borrower cannot meet") },
        { id: "a15-b4-s2", sequence: 2, type: "instruction", title: "Conditions the borrower cannot meet", content: RANGE("### 4.3 Conditions the borrower cannot meet", "### 4.5 If the file does not proceed") },
        { id: "a15-b4-s3", sequence: 3, type: "instruction", title: "If the file does not proceed", content: RANGE("### 4.5 If the file does not proceed", "## 5. Closing and compensation") },
        { id: "a15-b4-s4", sequence: 4, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "a15-b4-s5", sequence: 5, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "a15-b4-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a15-b4-q1" },
      ],
    },
    {
      id: "a15-b5", sequence: 5, required: true,
      title: "Closing and compensation",
      learningObjective: "Reconcile the closing line by line, cure tolerance variances, make disclosed, received, and payer agree exactly on compensation, handle trust funds and advance fees, and treat acknowledgment as delivery only.",
      sourceSections: [5],
      screens: [
        { id: "a15-b5-s1", sequence: 1, type: "instruction", title: "The Closing Disclosure and the waiting period", content: RANGE("## 5. Closing and compensation", "### 5.3 Tolerance variances and cures") },
        { id: "a15-b5-s2", sequence: 2, type: "instruction", title: "Tolerance variances and cures", content: RANGE("### 5.3 Tolerance variances and cures", "### 5.5 Trust funds and advance fees") },
        { id: "a15-b5-s3", sequence: 3, type: "instruction", title: "Trust funds and advance fees", content: RANGE("### 5.5 Trust funds and advance fees", "## 6. Post-closing audit and the regulator-ready file") },
        { id: "a15-b5-s4", sequence: 4, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "a15-b5-s5", sequence: 5, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "a15-b5-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a15-b5-q1" },
      ],
    },
    {
      id: "a15-b6", sequence: 6, required: true,
      title: "Post-closing audit and the regulator-ready file",
      learningObjective: "Audit a file against the reconstructability standard, rank defects by seriousness rather than order of discovery, distinguish an honest document created today from a manufactured one, and carry the course's four questions.",
      sourceSections: [6],
      screens: [
        { id: "a15-b6-s1", sequence: 1, type: "instruction", title: "The standard", content: RANGE("## 6. Post-closing audit and the regulator-ready file", "### 6.3 A worked audit, ranked") },
        { id: "a15-b6-s2", sequence: 2, type: "instruction", title: "A worked audit, ranked", content: RANGE("### 6.3 A worked audit, ranked", "### 6.5 The course in four questions") },
        { id: "a15-b6-s3", sequence: 3, type: "instruction", title: "The course in four questions", content: RANGE("### 6.5 The course in four questions", "## Key terms") },
        { id: "a15-b6-s4", sequence: 4, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "a15-b6-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a15-b6-q1" },
      ],
    },
    {
      id: "a15-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "a15-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "a15-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "a15-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "a15-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "a15-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A15_BLOCKS;
