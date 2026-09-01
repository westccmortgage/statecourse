/**
 * GENERATED FILE — Practice Assignment 11 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-practice-block-maps.mjs; learning
 * objectives and the practice-problem mapping come from the hand-authored spec, and the retrieval
 * bank lives in the course's own retrieval-banks module. Do not edit by hand — regenerate. The
 * delivery layer only: the regulatory layer (sections, applied exercise, knowledge check,
 * remediation, timing, final exam) is untouched.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A11_BLOCKS = Object.freeze({
  courseId: "ca-real-estate-practice-45",
  assignmentId: "assignment-11",
  version: "1.0",
  contentPath: "/content/california/ca-real-estate-practice-45-v1/lesson-11.md",
  blocks: [
    {
      id: "pc11-b1", sequence: 1, required: true,
      title: "Opening escrow",
      learningObjective: "Explain what makes an arrangement an escrow — a binding contract between the parties and conditional delivery to a neutral holder — describe the limits neutrality places on what escrow may and may not do, including why a disputed instruction produces a hold rather than a decision and why an agent's confirmation never supplies the other party's consent, identify who may select escrow and why accepting anything of value for directing settlement business is prohibited regardless of disclosure, and apply the discipline that keeps escrow instructions aligned with the purchase agreement, including why every amendment must reach escrow when signed and why a verbal change must become a same-day writing.",
      sourceSections: [1],
      screens: [
        { id: "pc11-b1-s1", sequence: 1, type: "instruction", title: "What escrow is", content: RANGE("^", "### 1.3 A worked test of neutrality") },
        { id: "pc11-b1-s2", sequence: 2, type: "instruction", title: "A worked test of neutrality", content: RANGE("### 1.3 A worked test of neutrality", "### 1.5 Opening properly") },
        { id: "pc11-b1-s3", sequence: 3, type: "instruction", title: "Opening properly", content: RANGE("### 1.5 Opening properly", "## 2. Title and vesting review") },
        { id: "pc11-b1-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "pc11-b1-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc11-b1-q1" },
      ],
    },
    {
      id: "pc11-b2", sequence: 2, required: true,
      title: "Title and vesting review",
      learningObjective: "Define a preliminary report and what it is not — a guarantee that title is clear, the policy itself, or a survey — explain what an exception means for the risk the buyer bears, apply the correct routing for common report items such as an easement, recorded CC&Rs, an unreleased deed of trust, and a similarly named judgment lien while identifying the three responses that are wrong in every case, distinguish the owner's and lender's title policies, and explain why the manner of taking title is a legal and tax question that must be referred to counsel before escrow prepares the deed.",
      sourceSections: [2],
      screens: [
        { id: "pc11-b2-s1", sequence: 1, type: "instruction", title: "What a preliminary report is", content: RANGE("## 2. Title and vesting review", "### 2.3 Reading the report as a licensee") },
        { id: "pc11-b2-s2", sequence: 2, type: "instruction", title: "Reading the report as a licensee", content: RANGE("### 2.3 Reading the report as a licensee", "### 2.5 Title insurance") },
        { id: "pc11-b2-s3", sequence: 3, type: "instruction", title: "Title insurance", content: RANGE("### 2.5 Title insurance", "## 3. Transaction coordination") },
        { id: "pc11-b2-s4", sequence: 4, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "pc11-b2-s5", sequence: 5, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "pc11-b2-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "pc11-b2-q1" },
      ],
    },
    {
      id: "pc11-b3", sequence: 3, required: true,
      title: "Transaction coordination",
      learningObjective: "Identify a transaction's parallel tracks and their typical failure modes, explain why most failed transactions fail because a track started late rather than because it was impossible, apply the licensee's coordination duties — building the deadline calendar from the contract, starting slow items first including insurance quotes in mapped hazard areas, confirming status weekly in writing, and escalating early — and recognize the recurring shapes of coordination failure, including the unowned task and the silent dependency, and the written, named task list that controls them.",
      sourceSections: [3],
      screens: [
        { id: "pc11-b3-s1", sequence: 1, type: "instruction", title: "Parallel tracks", content: RANGE("## 3. Transaction coordination", "### 3.3 The insurance track") },
        { id: "pc11-b3-s2", sequence: 2, type: "instruction", title: "The insurance track", content: RANGE("### 3.3 The insurance track", "## 4. Final verification and closing") },
        { id: "pc11-b3-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "pc11-b3-q1" },
      ],
    },
    {
      id: "pc11-b4", sequence: 4, required: true,
      title: "Final verification and closing",
      learningObjective: "Explain what the final verification of condition does and does not confirm and what to check during it, apply the correct response to a problem found at the walkthrough — documenting it and resolving it through the contract before closing rather than closing and pursuing it afterward or instructing escrow to withhold funds — sequence signing, funding, recording, and disbursement and explain why recording precedes disbursement and why recording order establishes lien priority, and apply the wire fraud practices required at closing, including verifying any change to instructions through an independently obtained channel.",
      sourceSections: [4],
      screens: [
        { id: "pc11-b4-s1", sequence: 1, type: "instruction", title: "What the final verification is", content: RANGE("## 4. Final verification and closing", "### 4.3 Responding to a problem") },
        { id: "pc11-b4-s2", sequence: 2, type: "instruction", title: "Responding to a problem", content: RANGE("### 4.3 Responding to a problem", "### 4.5 Recording order matters") },
        { id: "pc11-b4-s3", sequence: 3, type: "instruction", title: "Recording order matters", content: RANGE("### 4.5 Recording order matters", "## 5. Recording, disbursement, and possession") },
        { id: "pc11-b4-s4", sequence: 4, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "pc11-b4-s5", sequence: 5, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "pc11-b4-s6", sequence: 6, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "pc11-b4-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "pc11-b4-q1" },
      ],
    },
    {
      id: "pc11-b5", sequence: 5, required: true,
      title: "Recording, disbursement, and possession",
      learningObjective: "Distinguish possession from ownership and explain why any divergence between them must be documented, apply the terms a written post-closing occupancy agreement must address and explain why early possession before closing is generally discouraged, design a transfer-of-control checklist covering keys, remotes, access devices, and the seller's remote access to cameras and smart devices, and apply the correct handling for the recurring first-ten-days post-closing calls, including checking the file before answering and looping in the broker on anything that sounds like a claim.",
      sourceSections: [5],
      screens: [
        { id: "pc11-b5-s1", sequence: 1, type: "instruction", title: "Possession is not ownership", content: RANGE("## 5. Recording, disbursement, and possession", "### 5.3 Early possession before closing") },
        { id: "pc11-b5-s2", sequence: 2, type: "instruction", title: "Early possession before closing", content: RANGE("### 5.3 Early possession before closing", "### 5.5 Utilities and services") },
        { id: "pc11-b5-s3", sequence: 3, type: "instruction", title: "Utilities and services", content: RANGE("### 5.5 Utilities and services", "## 6. Post-closing file audit") },
        { id: "pc11-b5-s4", sequence: 4, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "pc11-b5-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc11-b5-q1" },
      ],
    },
    {
      id: "pc11-b6", sequence: 6, required: true,
      title: "Post-closing file audit",
      learningObjective: "State why a post-closing file audit happens shortly after closing and apply its audit questions covering completeness, dates, consistency, chronology, and improper content, explain why superseded document versions are retained rather than discarded, apply the correct response to an audit finding — obtain what legitimately exists, record what does not, escalate, and address the process — and distinguish a documented gap, which is survivable, from a manufactured or back-dated document, which is falsification, including the retention obligation covering cancelled and failed transactions and the rules governing requests a former client makes months or years later.",
      sourceSections: [6],
      screens: [
        { id: "pc11-b6-s1", sequence: 1, type: "instruction", title: "Audit while memories are fresh", content: RANGE("## 6. Post-closing file audit", "### 6.3 Keep the superseded versions") },
        { id: "pc11-b6-s2", sequence: 2, type: "instruction", title: "Keep the superseded versions", content: RANGE("### 6.3 Keep the superseded versions", "### 6.5 The line") },
        { id: "pc11-b6-s3", sequence: 3, type: "instruction", title: "The line", content: RANGE("### 6.5 The line", "### 6.7 What the client asks for later") },
        { id: "pc11-b6-s4", sequence: 4, type: "instruction", title: "What the client asks for later", content: RANGE("### 6.7 What the client asks for later", "## Key terms") },
        { id: "pc11-b6-s5", sequence: 5, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "pc11-b6-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "pc11-b6-q1" },
      ],
    },
    {
      id: "pc11-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "pc11-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "pc11-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "pc11-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "pc11-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "pc11-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A11_BLOCKS;
