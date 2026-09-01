/**
 * GENERATED FILE — Practice Assignment 4 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-practice-block-maps.mjs; learning
 * objectives and the practice-problem mapping come from the hand-authored spec, and the retrieval
 * bank lives in the course's own retrieval-banks module. Do not edit by hand — regenerate. The
 * delivery layer only: the regulatory layer (sections, applied exercise, knowledge check,
 * remediation, timing, final exam) is untouched.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A4_BLOCKS = Object.freeze({
  courseId: "ca-real-estate-practice-45",
  assignmentId: "assignment-04",
  version: "1.0",
  contentPath: "/content/california/ca-real-estate-practice-45-v1/lesson-04.md",
  blocks: [
    {
      id: "pc4-b1", sequence: 1, required: true,
      title: "Property and client intake",
      learningObjective: "Conduct a property and client intake that establishes authority to convey, what is actually being sold, and what constraints affect the transaction, verify each against a source such as title or the trust or entity's governing documents rather than an occupant's statement or the tax roll, and route an unresolved authority question to the broker or counsel before listing.",
      sourceSections: [1],
      screens: [
        { id: "pc4-b1-s1", sequence: 1, type: "instruction", title: "What intake is for", content: RANGE("^", "### 1.3 Establishing what is being sold") },
        { id: "pc4-b1-s2", sequence: 2, type: "instruction", title: "Establishing what is being sold", content: RANGE("### 1.3 Establishing what is being sold", "### 1.5 The intake conversation itself") },
        { id: "pc4-b1-s3", sequence: 3, type: "instruction", title: "The intake conversation itself", content: RANGE("### 1.5 The intake conversation itself", "## 2. Listing agreement structure") },
        { id: "pc4-b1-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "pc4-b1-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc4-b1-q1" },
      ],
    },
    {
      id: "pc4-b2", sequence: 2, required: true,
      title: "Listing agreement structure",
      learningObjective: "Identify the listing agreement as a contract between the seller and the brokerage rather than the individual licensee, explain what each operative provision does and what a change to it means, and apply the amendment discipline — in writing, signed, dated, and retained with the prior version — to any change made after signing, including why a compensation change is a brokerage-level rather than licensee-level decision.",
      sourceSections: [2],
      screens: [
        { id: "pc4-b2-s1", sequence: 1, type: "instruction", title: "What the agreement actually does", content: RANGE("## 2. Listing agreement structure", "### 2.3 Why the term must be definite") },
        { id: "pc4-b2-s2", sequence: 2, type: "instruction", title: "Why the term must be definite", content: RANGE("### 2.3 Why the term must be definite", "### 2.5 The protection clause, explained properly") },
        { id: "pc4-b2-s3", sequence: 3, type: "instruction", title: "The protection clause, explained properly", content: RANGE("### 2.5 The protection clause, explained properly", "## 3. Pricing discussion") },
        { id: "pc4-b2-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "pc4-b2-q1" },
      ],
    },
    {
      id: "pc4-b3", sequence: 3, required: true,
      title: "Pricing discussion",
      learningObjective: "Build a defensible pricing recommendation from closed sales, pending sales, active listings, and adjustments, distinguish the seller's pricing decision from the licensee's advisory obligation, and state and document the consequences the licensee must communicate when a seller prices above the supported range.",
      sourceSections: [3],
      screens: [
        { id: "pc4-b3-s1", sequence: 1, type: "instruction", title: "Whose decision, and whose obligation", content: RANGE("## 3. Pricing discussion", "### 3.3 The conversation that actually happens") },
        { id: "pc4-b3-s2", sequence: 2, type: "instruction", title: "The conversation that actually happens", content: RANGE("### 3.3 The conversation that actually happens", "### 3.5 Documenting the pricing decision") },
        { id: "pc4-b3-s3", sequence: 3, type: "instruction", title: "Documenting the pricing decision", content: RANGE("### 3.5 Documenting the pricing decision", "## 4. Seller disclosures") },
        { id: "pc4-b3-s4", sequence: 4, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "pc4-b3-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc4-b3-q1" },
      ],
    },
    {
      id: "pc4-b4", sequence: 4, required: true,
      title: "Seller disclosures",
      learningObjective: "Distinguish the seller's non-negotiable disclosure obligations from the negotiable business terms of a listing, apply the materiality standard — effect on a reasonable buyer's decision, not the seller's opinion, a repair's presence, or frequency — to determine what must be disclosed, and complete a disclosure correctly by answering an uncertain item 'unknown' rather than leaving it blank or marking it 'no.'",
      sourceSections: [4],
      screens: [
        { id: "pc4-b4-s1", sequence: 1, type: "instruction", title: "The line that is not negotiable", content: RANGE("## 4. Seller disclosures", "### 4.3 Counseling a reluctant seller") },
        { id: "pc4-b4-s2", sequence: 2, type: "instruction", title: "Counseling a reluctant seller", content: RANGE("### 4.3 Counseling a reluctant seller", "### 4.5 Delivery and timing") },
        { id: "pc4-b4-s3", sequence: 3, type: "instruction", title: "Delivery and timing", content: RANGE("### 4.5 Delivery and timing", "## 5. Showing and access controls") },
        { id: "pc4-b4-s4", sequence: 4, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "pc4-b4-s5", sequence: 5, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "pc4-b4-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "pc4-b4-q1" },
      ],
    },
    {
      id: "pc4-b5", sequence: 5, required: true,
      title: "Showing and access controls",
      learningObjective: "Design a showing and access protocol that surfaces valuables, medications, occupants, and recording devices during intake, explain why applying that protocol identically to every visitor is simultaneously a security control and a fair housing requirement, and state the licensee's required first response — take it seriously, notify the broker, preserve the log, and do not investigate personally — when something goes missing.",
      sourceSections: [5],
      screens: [
        { id: "pc4-b5-s1", sequence: 1, type: "instruction", title: "Two obligations at once", content: RANGE("## 5. Showing and access controls", "### 5.3 Uniformity is the control") },
        { id: "pc4-b5-s2", sequence: 2, type: "instruction", title: "Uniformity is the control", content: RANGE("### 5.3 Uniformity is the control", "### 5.5 Tenant-occupied property") },
        { id: "pc4-b5-s3", sequence: 3, type: "instruction", title: "Tenant-occupied property", content: RANGE("### 5.5 Tenant-occupied property", "## 6. Listing cancellation, expiration, and protection") },
        { id: "pc4-b5-s4", sequence: 4, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "pc4-b5-s5", sequence: 5, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "pc4-b5-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "pc4-b5-q1" },
      ],
    },
    {
      id: "pc4-b6", sequence: 6, required: true,
      title: "Listing cancellation, expiration, and protection",
      learningObjective: "Distinguish expiration, cancellation, and withdrawal as three different mechanisms, explain why releasing a seller from a listing is a broker-level decision governed by the agreement's terms rather than the licensee's judgment or the marketing already spent, and identify the two obligations — confidentiality and the protection clause's own terms — that survive a listing's end.",
      sourceSections: [6],
      screens: [
        { id: "pc4-b6-s1", sequence: 1, type: "instruction", title: "Three different things", content: RANGE("## 6. Listing cancellation, expiration, and protection", "### 6.3 What governs the outcome") },
        { id: "pc4-b6-s2", sequence: 2, type: "instruction", title: "What governs the outcome", content: RANGE("### 6.3 What governs the outcome", "### 6.5 After expiration") },
        { id: "pc4-b6-s3", sequence: 3, type: "instruction", title: "After expiration", content: RANGE("### 6.5 After expiration", "### 6.7 Three listings that ended") },
        { id: "pc4-b6-s4", sequence: 4, type: "instruction", title: "Three listings that ended", content: RANGE("### 6.7 Three listings that ended", "## Key terms") },
        { id: "pc4-b6-s5", sequence: 5, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "pc4-b6-s6", sequence: 6, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "pc4-b6-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "pc4-b6-q1" },
      ],
    },
    {
      id: "pc4-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "pc4-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "pc4-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "pc4-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "pc4-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "pc4-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A4_BLOCKS;
