/**
 * GENERATED FILE — Practice Assignment 3 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-practice-block-maps.mjs; learning
 * objectives and the practice-problem mapping come from the hand-authored spec, and the retrieval
 * bank lives in the course's own retrieval-banks module. Do not edit by hand — regenerate. The
 * delivery layer only: the regulatory layer (sections, applied exercise, knowledge check,
 * remediation, timing, final exam) is untouched.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A3_BLOCKS = Object.freeze({
  courseId: "ca-real-estate-practice-45",
  assignmentId: "assignment-03",
  version: "1.0",
  contentPath: "/content/california/ca-real-estate-practice-45-v1/lesson-03.md",
  blocks: [
    {
      id: "pc3-b1", sequence: 1, required: true,
      title: "Seller and buyer agency",
      learningObjective: "Explain how an agency relationship forms — by express agreement, conduct, or ratification — why the brokerage rather than the individual salesperson is the agent, what a seller's or buyer's agent owes their own client versus a non-client, and how a licensee's ordinary conversation with an unrepresented visitor can create an unintended agency by conduct.",
      sourceSections: [1],
      screens: [
        { id: "pc3-b1-s1", sequence: 1, type: "instruction", title: "What agency is", content: RANGE("^", "### 1.3 Seller agency") },
        { id: "pc3-b1-s2", sequence: 2, type: "instruction", title: "Seller agency", content: RANGE("### 1.3 Seller agency", "### 1.5 The non-client is not unprotected") },
        { id: "pc3-b1-s3", sequence: 3, type: "instruction", title: "The non-client is not unprotected", content: RANGE("### 1.5 The non-client is not unprotected", "## 2. California disclosure sequence") },
        { id: "pc3-b1-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "pc3-b1-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc3-b1-q1" },
      ],
    },
    {
      id: "pc3-b2", sequence: 2, required: true,
      title: "California disclosure sequence",
      learningObjective: "State California's three-step agency disclosure sequence — disclose, elect, confirm — identify when each step must occur for a seller's agent, a buyer's agent, and an agent presenting an offer, and explain why a disclosure delivered after the decision it was meant to inform remains a defect even once it is signed.",
      sourceSections: [2],
      screens: [
        { id: "pc3-b2-s1", sequence: 1, type: "instruction", title: "Three steps: disclose, elect, confirm", content: RANGE("## 2. California disclosure sequence", "### 2.3 The confirmation step") },
        { id: "pc3-b2-s2", sequence: 2, type: "instruction", title: "The confirmation step", content: RANGE("### 2.3 The confirmation step", "## 3. Fiduciary duties in practice") },
        { id: "pc3-b2-s3", sequence: 3, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "pc3-b2-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "pc3-b2-q1" },
      ],
    },
    {
      id: "pc3-b3", sequence: 3, required: true,
      title: "Fiduciary duties in practice",
      learningObjective: "Apply each of the six fiduciary duties to a concrete transaction decision, explain the boundary between confidentiality (the negotiating position) and disclosure (a material defect), state the limit obedience places on following only lawful instructions, and explain how reasonable care can be breached, and confidentiality can survive termination, without any dishonesty at all.",
      sourceSections: [3],
      screens: [
        { id: "pc3-b3-s1", sequence: 1, type: "instruction", title: "The duties, and what each one actually prohibits", content: RANGE("## 3. Fiduciary duties in practice", "### 3.3 Obedience and its limit") },
        { id: "pc3-b3-s2", sequence: 2, type: "instruction", title: "Obedience and its limit", content: RANGE("### 3.3 Obedience and its limit", "### 3.5 Loyalty when your own interest appears") },
        { id: "pc3-b3-s3", sequence: 3, type: "instruction", title: "Loyalty when your own interest appears", content: RANGE("### 3.5 Loyalty when your own interest appears", "## 4. Dual agency consent") },
        { id: "pc3-b3-s4", sequence: 4, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "pc3-b3-s5", sequence: 5, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "pc3-b3-s6", sequence: 6, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "pc3-b3-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "pc3-b3-q1" },
      ],
    },
    {
      id: "pc3-b4", sequence: 4, required: true,
      title: "Dual agency consent",
      learningObjective: "Explain what dual agency is and why it belongs to the brokerage rather than the individual salesperson, state what informed written consent from both principals requires, and distinguish what consent authorizes — representation — from what it never authorizes — moving either party's confidential negotiating position to the other.",
      sourceSections: [4],
      screens: [
        { id: "pc3-b4-s1", sequence: 1, type: "instruction", title: "What dual agency is", content: RANGE("## 4. Dual agency consent", "### 4.3 What consent does not authorize") },
        { id: "pc3-b4-s2", sequence: 2, type: "instruction", title: "What consent does not authorize", content: RANGE("### 4.3 What consent does not authorize", "### 4.5 When to raise it") },
        { id: "pc3-b4-s3", sequence: 3, type: "instruction", title: "When to raise it", content: RANGE("### 4.5 When to raise it", "## 5. Compensation and conflicts") },
        { id: "pc3-b4-s4", sequence: 4, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "pc3-b4-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc3-b4-q1" },
      ],
    },
    {
      id: "pc3-b5", sequence: 5, required: true,
      title: "Compensation and conflicts",
      learningObjective: "Distinguish who pays a licensee from whom the licensee represents, identify the categories of conflicts that must be disclosed — including referral fees, bonuses, and vendor relationships — explain why a conflict disclosure must reach the client while they can still act on it, and distinguish the power to terminate an agency from the right to do so without consequence.",
      sourceSections: [5],
      screens: [
        { id: "pc3-b5-s1", sequence: 1, type: "instruction", title: "Payment does not determine representation", content: RANGE("## 5. Compensation and conflicts", "### 5.3 What disclosure requires") },
        { id: "pc3-b5-s2", sequence: 2, type: "instruction", title: "What disclosure requires", content: RANGE("### 5.3 What disclosure requires", "### 5.5 Termination and compensation") },
        { id: "pc3-b5-s3", sequence: 3, type: "instruction", title: "Termination and compensation", content: RANGE("### 5.5 Termination and compensation", "## 6. Agency documentation case") },
        { id: "pc3-b5-s4", sequence: 4, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "pc3-b5-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc3-b5-q1" },
      ],
    },
    {
      id: "pc3-b6", sequence: 6, required: true,
      title: "Agency documentation case",
      learningObjective: "Assemble the agency documentation a file needs to show disclosure, election, and confirmation occurred in the correct order and on time, audit a completed file for contradictions, late delivery, and missing consent, and apply the rule that a documented gap is survivable while a manufactured document is falsification.",
      sourceSections: [6],
      screens: [
        { id: "pc3-b6-s1", sequence: 1, type: "instruction", title: "What the file must show", content: RANGE("## 6. Agency documentation case", "### 6.3 The habit that prevents all three") },
        { id: "pc3-b6-s2", sequence: 2, type: "instruction", title: "The habit that prevents all three", content: RANGE("### 6.3 The habit that prevents all three", "### 6.5 The agency chain, in one page") },
        { id: "pc3-b6-s3", sequence: 3, type: "instruction", title: "The agency chain, in one page", content: RANGE("### 6.5 The agency chain, in one page", "## Key terms") },
        { id: "pc3-b6-s4", sequence: 4, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "pc3-b6-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc3-b6-q1" },
      ],
    },
    {
      id: "pc3-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "pc3-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "pc3-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "pc3-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "pc3-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "pc3-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A3_BLOCKS;
