/**
 * GENERATED FILE — Mortgage Assignment 4 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-mortgage-block-maps.mjs;
 * learning objectives and the practice-problem mapping come from the hand-authored spec in
 * mortgage-block-specs.mjs, and the retrieval bank lives in mortgage-retrieval-banks.mjs.
 * Do not edit by hand — regenerate. The delivery layer only: the regulatory layer (sections,
 * applied exercise, knowledge check, remediation, timing, final exam) is untouched, and B7's
 * mastery derives from the existing assignment record exactly as in the Assignment 1 pilot.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A4_BLOCKS = Object.freeze({
  courseId: "ca-mortgage-loan-brokering-lending-45",
  assignmentId: "assignment-04",
  version: "1.0",
  contentPath: "/content/california/ca-mortgage-loan-brokering-lending-45-v1/lesson-04.md",
  blocks: [
    {
      id: "a4-b1", sequence: 1, required: true,
      title: "Primary and secondary markets",
      learningObjective: "Distinguish the primary and secondary markets, explain the liquidity the secondary market supplies and why underwriting standards flow backward from it, and distinguish conforming from non-conforming lending.",
      sourceSections: [1],
      screens: [
        { id: "a4-b1-s1", sequence: 1, type: "instruction", title: "The two markets", content: RANGE("^", "### 1.3 The participants") },
        { id: "a4-b1-s2", sequence: 2, type: "instruction", title: "The participants", content: RANGE("### 1.3 The participants", "### 1.5 Conforming and non-conforming") },
        { id: "a4-b1-s3", sequence: 3, type: "instruction", title: "Conforming and non-conforming", content: RANGE("### 1.5 Conforming and non-conforming", "## 2. Depository and nondepository sources") },
        { id: "a4-b1-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "a4-b1-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a4-b1-q1" },
      ],
    },
    {
      id: "a4-b2", sequence: 2, required: true,
      title: "Depository and nondepository sources",
      learningObjective: "Distinguish a mortgage banker from a mortgage broker and state the consequences, explain warehouse lines, correspondent lending, and table funding, and state what a licensee must not represent about the firm.",
      sourceSections: [2],
      screens: [
        { id: "a4-b2-s1", sequence: 1, type: "instruction", title: "The sources of mortgage credit", content: RANGE("## 2. Depository and nondepository sources", "### 2.3 Warehouse lines and correspondent lending") },
        { id: "a4-b2-s2", sequence: 2, type: "instruction", title: "Warehouse lines and correspondent lending", content: RANGE("### 2.3 Warehouse lines and correspondent lending", "### 2.5 Private and hard money") },
        { id: "a4-b2-s3", sequence: 3, type: "instruction", title: "Private and hard money", content: RANGE("### 2.5 Private and hard money", "## 3. Conventional, FHA, and VA orientation") },
        { id: "a4-b2-s4", sequence: 4, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "a4-b2-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a4-b2-q1" },
      ],
    },
    {
      id: "a4-b3", sequence: 3, required: true,
      title: "Conventional, FHA, and VA orientation",
      learningObjective: "State the common structure of government-backed programs, correct the recurring misstatements about them, explain whom mortgage insurance protects, and present program condition requirements as closing-probability facts.",
      sourceSections: [3],
      screens: [
        { id: "a4-b3-s1", sequence: 1, type: "instruction", title: "Conventional financing", content: RANGE("## 3. Conventional, FHA, and VA orientation", "### 3.3 FHA, in outline") },
        { id: "a4-b3-s2", sequence: 2, type: "instruction", title: "FHA, in outline", content: RANGE("### 3.3 FHA, in outline", "### 3.5 The point that affects a seller's decision") },
        { id: "a4-b3-s3", sequence: 3, type: "instruction", title: "The point that affects a seller's decision", content: RANGE("### 3.5 The point that affects a seller's decision", "### 3.7 What a licensee may say about programs") },
        { id: "a4-b3-s4", sequence: 4, type: "instruction", title: "What a licensee may say about programs", content: RANGE("### 3.7 What a licensee may say about programs", "## 4. Fixed, adjustable, and balloon structures") },
        { id: "a4-b3-s5", sequence: 5, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "a4-b3-s6", sequence: 6, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "a4-b3-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "a4-b3-q1" },
      ],
    },
    {
      id: "a4-b4", sequence: 4, required: true,
      title: "Fixed, adjustable, and balloon structures",
      learningObjective: "Name the four adjustable-rate terms, compute a fully indexed rate and a worst-case payment path, explain interest-only, balloon, buydown, and rate-lock exposure, and never predict rates.",
      sourceSections: [4],
      screens: [
        { id: "a4-b4-s1", sequence: 1, type: "instruction", title: "The structures", content: RANGE("## 4. Fixed, adjustable, and balloon structures", "### 4.3 The calculation a borrower needs") },
        { id: "a4-b4-s2", sequence: 2, type: "instruction", title: "The calculation a borrower needs", content: RANGE("### 4.3 The calculation a borrower needs", "### 4.5 Interest-only and balloon exposure") },
        { id: "a4-b4-s3", sequence: 3, type: "instruction", title: "Interest-only and balloon exposure", content: RANGE("### 4.5 Interest-only and balloon exposure", "### 4.7 Buydowns") },
        { id: "a4-b4-s4", sequence: 4, type: "instruction", title: "Buydowns", content: RANGE("### 4.7 Buydowns", "## 5. Owner-occupied and business-purpose distinctions") },
        { id: "a4-b4-s5", sequence: 5, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "a4-b4-s6", sequence: 6, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "a4-b4-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "a4-b4-q1" },
      ],
    },
    {
      id: "a4-b5", sequence: 5, required: true,
      title: "Owner-occupied and business-purpose distinctions",
      learningObjective: "State why occupancy is a material fact whose misstatement is loan fraud, recognize the misrepresentation patterns, state what a business-purpose certification does and does not establish, and route genuinely close cases to compliance.",
      sourceSections: [5],
      screens: [
        { id: "a4-b5-s1", sequence: 1, type: "instruction", title: "Why this distinction carries so much", content: RANGE("## 5. Owner-occupied and business-purpose distinctions", "### 5.3 Occupancy is a fact, not a category on a form") },
        { id: "a4-b5-s2", sequence: 2, type: "instruction", title: "Occupancy is a fact, not a category on a form", content: RANGE("### 5.3 Occupancy is a fact, not a category on a form", "### 5.5 What a certification does and does not establish") },
        { id: "a4-b5-s3", sequence: 3, type: "instruction", title: "What a certification does and does not establish", content: RANGE("### 5.5 What a certification does and does not establish", "### 5.7 Where the line is genuinely hard") },
        { id: "a4-b5-s4", sequence: 4, type: "instruction", title: "Where the line is genuinely hard", content: RANGE("### 5.7 Where the line is genuinely hard", "## 6. Product suitability and documentation") },
        { id: "a4-b5-s5", sequence: 5, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "a4-b5-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a4-b5-q1" },
      ],
    },
    {
      id: "a4-b6", sequence: 6, required: true,
      title: "Product suitability and documentation",
      learningObjective: "Present loan products on a common basis, give the plain-language explanations each payment-changing feature requires, ask the suitability questions, and build a file that passes the reconstructability test.",
      sourceSections: [6],
      screens: [
        { id: "a4-b6-s1", sequence: 1, type: "instruction", title: "What a licensee may and may not conclude", content: RANGE("## 6. Product suitability and documentation", "### 6.3 The features that require a plain-language explanation") },
        { id: "a4-b6-s2", sequence: 2, type: "instruction", title: "The features that require a plain-language explanation", content: RANGE("### 6.3 The features that require a plain-language explanation", "### 6.5 The recurring failure") },
        { id: "a4-b6-s3", sequence: 3, type: "instruction", title: "The recurring failure", content: RANGE("### 6.5 The recurring failure", "### 6.7 The test") },
        { id: "a4-b6-s4", sequence: 4, type: "instruction", title: "The test", content: RANGE("### 6.7 The test", "## Key terms") },
        { id: "a4-b6-s5", sequence: 5, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "a4-b6-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a4-b6-q1" },
      ],
    },
    {
      id: "a4-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "a4-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "a4-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "a4-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "a4-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "a4-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A4_BLOCKS;
