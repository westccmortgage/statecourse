/**
 * GENERATED FILE — Practice Assignment 1 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-practice-block-maps.mjs; learning
 * objectives and the practice-problem mapping come from the hand-authored spec, and the retrieval
 * bank lives in the course's own retrieval-banks module. Do not edit by hand — regenerate. The
 * delivery layer only: the regulatory layer (sections, applied exercise, knowledge check,
 * remediation, timing, final exam) is untouched.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A1_BLOCKS = Object.freeze({
  courseId: "ca-real-estate-practice-45",
  assignmentId: "assignment-01",
  version: "1.0",
  contentPath: "/content/california/ca-real-estate-practice-45-v1/lesson-01.md",
  blocks: [
    {
      id: "pc1-b1", sequence: 1, required: true,
      title: "DRE authority and license categories",
      learningObjective: "Explain why California licenses real estate activity at all — the consumer information asymmetry it responds to — distinguish the Real Estate Law from the Commissioner's Regulations and place brokerage policy and local custom beneath them, identify the three elements that make an activity require a license, and distinguish a broker's independent authority from a salesperson's derivative authority, including what a salesperson may never do on her own.",
      sourceSections: [1],
      screens: [
        { id: "pc1-b1-s1", sequence: 1, type: "instruction", title: "Why a license exists at all", content: RANGE("^", "### 1.3 What activity requires a license") },
        { id: "pc1-b1-s2", sequence: 2, type: "instruction", title: "What activity requires a license", content: RANGE("### 1.3 What activity requires a license", "### 1.5 License status, renewal, and discipline") },
        { id: "pc1-b1-s3", sequence: 3, type: "instruction", title: "License status, renewal, and discipline", content: RANGE("### 1.5 License status, renewal, and discipline", "## 2. Broker supervision") },
        { id: "pc1-b1-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "pc1-b1-s5", sequence: 5, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "pc1-b1-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "pc1-b1-q1" },
      ],
    },
    {
      id: "pc1-b2", sequence: 2, required: true,
      title: "Broker supervision",
      learningObjective: "Describe what reasonable supervision covers at minimum, explain why delegating a task never delegates the responsibility for it, distinguish independent contractor status as a tax and compensation framework from the separate question of who is responsible for supervising licensed activity, and identify the practical indicators that a supervision system is real as a brokerage grows.",
      sourceSections: [2],
      screens: [
        { id: "pc1-b2-s1", sequence: 1, type: "instruction", title: "The responsible broker", content: RANGE("## 2. Broker supervision", "### 2.3 Independent contractor status is not an exception") },
        { id: "pc1-b2-s2", sequence: 2, type: "instruction", title: "Independent contractor status is not an exception", content: RANGE("### 2.3 Independent contractor status is not an exception", "## 3. Professional competence and scope") },
        { id: "pc1-b2-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "pc1-b2-q1" },
      ],
    },
    {
      id: "pc1-b3", sequence: 3, required: true,
      title: "Professional competence and scope",
      learningObjective: "Apply the three-part approach to unfamiliar work — disclose plainly, arrange real supervision, identify specialists early — distinguish activity within a licensee's role from the unauthorized practice of law using the legal-conclusion test, identify the separate boundaries around valuation, property condition, and tax or estate consequences, and state the four-part 'I don't know' formulation as the professional response to a question the licensee cannot answer.",
      sourceSections: [3],
      screens: [
        { id: "pc1-b3-s1", sequence: 1, type: "instruction", title: "Competence is an obligation, not a credential", content: RANGE("## 3. Professional competence and scope", "### 3.3 Other scope boundaries") },
        { id: "pc1-b3-s2", sequence: 2, type: "instruction", title: "Other scope boundaries", content: RANGE("### 3.3 Other scope boundaries", "## 4. Office policies and delegation") },
        { id: "pc1-b3-s3", sequence: 3, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "pc1-b3-s4", sequence: 4, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "pc1-b3-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc1-b3-q1" },
      ],
    },
    {
      id: "pc1-b4", sequence: 4, required: true,
      title: "Office policies and delegation",
      learningObjective: "Explain what a working policy set must cover and why a policy is only as real as the conduct it controls, identify the four components of a defensible delegation and explain why monitoring is the one most often missing, explain why a brokerage policy stricter than the law still governs and is not an individual licensee's decision to set aside, and describe what a new licensee should look for when reading a policy manual, including the escalation path and what happens on departure.",
      sourceSections: [4],
      screens: [
        { id: "pc1-b4-s1", sequence: 1, type: "instruction", title: "What written policies are for", content: RANGE("## 4. Office policies and delegation", "### 4.3 Delegation done properly") },
        { id: "pc1-b4-s2", sequence: 2, type: "instruction", title: "Delegation done properly", content: RANGE("### 4.3 Delegation done properly", "### 4.5 Reading a policy manual as a new licensee") },
        { id: "pc1-b4-s3", sequence: 3, type: "instruction", title: "Reading a policy manual as a new licensee", content: RANGE("### 4.5 Reading a policy manual as a new licensee", "## 5. Consumer-first communication") },
        { id: "pc1-b4-s4", sequence: 4, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "pc1-b4-s5", sequence: 5, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "pc1-b4-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "pc1-b4-q1" },
      ],
    },
    {
      id: "pc1-b5", sequence: 5, required: true,
      title: "Consumer-first communication",
      learningObjective: "Distinguish a verified fact, an unverified report, and a professional opinion in a consumer communication and explain why collapsing those categories is the recurring source of misrepresentation, apply the timeliness and written-confirmation practices including the immediate written correction of an error to everyone who received it, and explain what consumer-first communication does and does not require, including declining certain questions well.",
      sourceSections: [5],
      screens: [
        { id: "pc1-b5-s1", sequence: 1, type: "instruction", title: "Three categories a consumer must be able to tell apart", content: RANGE("## 5. Consumer-first communication", "### 5.3 Plain language and access") },
        { id: "pc1-b5-s2", sequence: 2, type: "instruction", title: "Plain language and access", content: RANGE("### 5.3 Plain language and access", "### 5.5 The confirming message") },
        { id: "pc1-b5-s3", sequence: 3, type: "instruction", title: "The confirming message", content: RANGE("### 5.5 The confirming message", "## 6. Transaction file accountability") },
        { id: "pc1-b5-s4", sequence: 4, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "pc1-b5-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc1-b5-q1" },
      ],
    },
    {
      id: "pc1-b6", sequence: 6, required: true,
      title: "Transaction file accountability",
      learningObjective: "State the reconstructability standard a transaction file must meet, explain why a signature without a delivery date fails to establish that a response period was honored and why superseded drafts are retained rather than discarded, distinguish a documented gap from falsification and state the correct response to a gap found during a post-closing audit, and identify the file-accountability practices a new licensee should install before the first client.",
      sourceSections: [6],
      screens: [
        { id: "pc1-b6-s1", sequence: 1, type: "instruction", title: "The file is the record of your professional conduct", content: RANGE("## 6. Transaction file accountability", "### 6.3 Dates and delivery evidence") },
        { id: "pc1-b6-s2", sequence: 2, type: "instruction", title: "Dates and delivery evidence", content: RANGE("### 6.3 Dates and delivery evidence", "### 6.5 The line that must never be crossed") },
        { id: "pc1-b6-s3", sequence: 3, type: "instruction", title: "The line that must never be crossed", content: RANGE("### 6.5 The line that must never be crossed", "### 6.7 The first ninety days") },
        { id: "pc1-b6-s4", sequence: 4, type: "instruction", title: "The first ninety days", content: RANGE("### 6.7 The first ninety days", "## Key terms") },
        { id: "pc1-b6-s5", sequence: 5, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "pc1-b6-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "pc1-b6-q1" },
      ],
    },
    {
      id: "pc1-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "pc1-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "pc1-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "pc1-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "pc1-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "pc1-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A1_BLOCKS;
