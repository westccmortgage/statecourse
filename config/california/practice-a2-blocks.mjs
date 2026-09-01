/**
 * GENERATED FILE — Practice Assignment 2 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-practice-block-maps.mjs; learning
 * objectives and the practice-problem mapping come from the hand-authored spec, and the retrieval
 * bank lives in the course's own retrieval-banks module. Do not edit by hand — regenerate. The
 * delivery layer only: the regulatory layer (sections, applied exercise, knowledge check,
 * remediation, timing, final exam) is untouched.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A2_BLOCKS = Object.freeze({
  courseId: "ca-real-estate-practice-45",
  assignmentId: "assignment-02",
  version: "1.0",
  contentPath: "/content/california/ca-real-estate-practice-45-v1/lesson-02.md",
  blocks: [
    {
      id: "pc2-b1", sequence: 1, required: true,
      title: "Business planning",
      learningObjective: "Build a business plan that works backward from capacity — hours a transaction requires including its compliance work, hours actually available, divided into a transaction count — rather than forward from a volume target, and explain why an unbudgeted revenue-timing gap between first contact and first closing turns a capacity shortfall into pressure to cut corners rather than only a financial problem.",
      sourceSections: [1],
      screens: [
        { id: "pc2-b1-s1", sequence: 1, type: "instruction", title: "The problem with a volume target", content: RANGE("^", "### 1.3 Budgeting for the work nobody bills for") },
        { id: "pc2-b1-s2", sequence: 2, type: "instruction", title: "Budgeting for the work nobody bills for", content: RANGE("### 1.3 Budgeting for the work nobody bills for", "### 1.5 The revenue-timing problem") },
        { id: "pc2-b1-s3", sequence: 3, type: "instruction", title: "The revenue-timing problem", content: RANGE("### 1.5 The revenue-timing problem", "## 2. Prospecting and solicitation") },
        { id: "pc2-b1-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "pc2-b1-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc2-b1-q1" },
      ],
    },
    {
      id: "pc2-b2", sequence: 2, required: true,
      title: "Prospecting and solicitation",
      learningObjective: "Apply the channel-specific solicitation rules for telephone, text, email, and in-person contact — including do-not-call obligations that bind the caller regardless of a vendor's assurance, the rule that text and email consent is defined by what the consumer was actually told when the information was collected, and the limits of an opt-out mechanism — and state what a defensible contact record must document.",
      sourceSections: [2],
      screens: [
        { id: "pc2-b2-s1", sequence: 1, type: "instruction", title: "Prospecting is lawful; solicitation is regulated", content: RANGE("## 2. Prospecting and solicitation", "### 2.3 Text and email") },
        { id: "pc2-b2-s2", sequence: 2, type: "instruction", title: "Text and email", content: RANGE("### 2.3 Text and email", "### 2.5 The representation that must not be made") },
        { id: "pc2-b2-s3", sequence: 3, type: "instruction", title: "The representation that must not be made", content: RANGE("### 2.5 The representation that must not be made", "## 3. Advertising identification") },
        { id: "pc2-b2-s4", sequence: 4, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "pc2-b2-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc2-b2-q1" },
      ],
    },
    {
      id: "pc2-b3", sequence: 3, required: true,
      title: "Advertising identification",
      learningObjective: "State the licensee and brokerage identification advertising must carry across every channel including social profiles, short video, direct messages, and syndicated listings, and explain why a team name or brand is judged by the impression it creates for a consumer rather than by the brokerage's own organizational chart.",
      sourceSections: [3],
      screens: [
        { id: "pc2-b3-s1", sequence: 1, type: "instruction", title: "Why identification is required", content: RANGE("## 3. Advertising identification", "### 3.3 Team names") },
        { id: "pc2-b3-s2", sequence: 2, type: "instruction", title: "Team names", content: RANGE("### 3.3 Team names", "### 3.5 Truthfulness beyond identification") },
        { id: "pc2-b3-s3", sequence: 3, type: "instruction", title: "Truthfulness beyond identification", content: RANGE("### 3.5 Truthfulness beyond identification", "## 4. Antitrust and competition") },
        { id: "pc2-b3-s4", sequence: 4, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "pc2-b3-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc2-b3-q1" },
      ],
    },
    {
      id: "pc2-b4", sequence: 4, required: true,
      title: "Antitrust and competition",
      learningObjective: "Recognize price fixing, group boycotts, market allocation, and tying, explain why an agreement can be inferred from conduct or from remaining silent in a room rather than requiring a signed document, and state the three-part response — say it aloud, leave the conversation, document it in writing to the broker — required when a competitor raises one.",
      sourceSections: [4],
      screens: [
        { id: "pc2-b4-s1", sequence: 1, type: "instruction", title: "Why this is the most serious topic in the lesson", content: RANGE("## 4. Antitrust and competition", "### 4.3 Agreements do not require documents") },
        { id: "pc2-b4-s2", sequence: 2, type: "instruction", title: "Agreements do not require documents", content: RANGE("### 4.3 Agreements do not require documents", "### 4.5 What to tell a seller about compensation") },
        { id: "pc2-b4-s3", sequence: 3, type: "instruction", title: "What to tell a seller about compensation", content: RANGE("### 4.5 What to tell a seller about compensation", "## 5. Privacy and information security") },
        { id: "pc2-b4-s4", sequence: 4, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "pc2-b4-s5", sequence: 5, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "pc2-b4-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "pc2-b4-q1" },
      ],
    },
    {
      id: "pc2-b5", sequence: 5, required: true,
      title: "Privacy and information security",
      learningObjective: "Apply the access, transmission, and disposal controls that protect a transaction file's sensitive information, and describe the wire fraud pattern together with the one verification step — confirming instructions through a channel the attacker does not control — that defeats it, including why a phone number supplied inside the suspicious message does not qualify.",
      sourceSections: [5],
      screens: [
        { id: "pc2-b5-s1", sequence: 1, type: "instruction", title: "What a transaction file actually contains", content: RANGE("## 5. Privacy and information security", "### 5.3 When something goes wrong") },
        { id: "pc2-b5-s2", sequence: 2, type: "instruction", title: "When something goes wrong", content: RANGE("### 5.3 When something goes wrong", "## 6. Records and retention workflow") },
        { id: "pc2-b5-s3", sequence: 3, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "pc2-b5-s4", sequence: 4, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "pc2-b5-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc2-b5-q1" },
      ],
    },
    {
      id: "pc2-b6", sequence: 6, required: true,
      title: "Records and retention workflow",
      learningObjective: "Explain why transaction records belong to the brokerage rather than the individual licensee, state what a complete records workflow and close-out routine must produce including for transactions that did not close, and distinguish a documented gap, which is survivable, from a falsified record, which ends a career.",
      sourceSections: [6],
      screens: [
        { id: "pc2-b6-s1", sequence: 1, type: "instruction", title: "The records belong to the brokerage", content: RANGE("## 6. Records and retention workflow", "### 6.3 Retention length and the temptation to shorten it") },
        { id: "pc2-b6-s2", sequence: 2, type: "instruction", title: "Retention length and the temptation to shorten it", content: RANGE("### 6.3 Retention length and the temptation to shorten it", "### 6.5 The audit habit") },
        { id: "pc2-b6-s3", sequence: 3, type: "instruction", title: "The audit habit", content: RANGE("### 6.5 The audit habit", "### 6.7 A worked close-out") },
        { id: "pc2-b6-s4", sequence: 4, type: "instruction", title: "A worked close-out", content: RANGE("### 6.7 A worked close-out", "## Key terms") },
        { id: "pc2-b6-s5", sequence: 5, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "pc2-b6-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "pc2-b6-q1" },
      ],
    },
    {
      id: "pc2-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "pc2-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "pc2-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "pc2-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "pc2-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "pc2-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A2_BLOCKS;
