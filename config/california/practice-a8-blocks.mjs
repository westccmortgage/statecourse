/**
 * GENERATED FILE — Practice Assignment 8 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-practice-block-maps.mjs; learning
 * objectives and the practice-problem mapping come from the hand-authored spec, and the retrieval
 * bank lives in the course's own retrieval-banks module. Do not edit by hand — regenerate. The
 * delivery layer only: the regulatory layer (sections, applied exercise, knowledge check,
 * remediation, timing, final exam) is untouched.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A8_BLOCKS = Object.freeze({
  courseId: "ca-real-estate-practice-45",
  assignmentId: "assignment-08",
  version: "1.0",
  contentPath: "/content/california/ca-real-estate-practice-45-v1/lesson-08.md",
  blocks: [
    {
      id: "pc8-b1", sequence: 1, required: true,
      title: "California purchase agreement architecture",
      learningObjective: "Identify the functional components a California residential purchase agreement must address rather than a form's paragraph numbers, explain the deposit's two functions and when it stops being freely recoverable, state the constraint on liquidated damages, explain why naming disputed items of personal property avoids relying on the fixture tests after the fact, and apply the habit of walking through the agreement's unstated assumptions — what conveys, possession, and anything discussed but not written — before an offer is written.",
      sourceSections: [1],
      screens: [
        { id: "pc8-b1-s1", sequence: 1, type: "instruction", title: "What the agreement is", content: RANGE("^", "### 1.3 The deposit") },
        { id: "pc8-b1-s2", sequence: 2, type: "instruction", title: "The deposit", content: RANGE("### 1.3 The deposit", "### 1.5 Time is a term") },
        { id: "pc8-b1-s3", sequence: 3, type: "instruction", title: "Time is a term", content: RANGE("### 1.5 Time is a term", "## 2. Offer presentation and formation") },
        { id: "pc8-b1-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "pc8-b1-q1" },
      ],
    },
    {
      id: "pc8-b2", sequence: 2, required: true,
      title: "Offer presentation and formation",
      learningObjective: "Apply the three formation rules — an offer accepted without change forms a contract, an acceptance must match the offer, and acceptance must be communicated — explain why a counteroffer rejects and substitutes the original offer rather than suspending it, why a signed document returned with a change written on it is a further counteroffer however small the change, state that an offer may generally be revoked before acceptance even where it states a deadline, and explain why delivery of an electronically signed document must still be evidenced under the contract's own notice provisions.",
      sourceSections: [2],
      screens: [
        { id: "pc8-b2-s1", sequence: 1, type: "instruction", title: "The formation rules", content: RANGE("## 2. Offer presentation and formation", "### 2.3 Revocation and expiration") },
        { id: "pc8-b2-s2", sequence: 2, type: "instruction", title: "Revocation and expiration", content: RANGE("### 2.3 Revocation and expiration", "### 2.5 Electronic signature and delivery") },
        { id: "pc8-b2-s3", sequence: 3, type: "instruction", title: "Electronic signature and delivery", content: RANGE("### 2.5 Electronic signature and delivery", "## 3. Counteroffers and multiple offers") },
        { id: "pc8-b2-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "pc8-b2-s5", sequence: 5, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "pc8-b2-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "pc8-b2-q1" },
      ],
    },
    {
      id: "pc8-b3", sequence: 3, required: true,
      title: "Counteroffers and multiple offers",
      learningObjective: "State the three rules governing multiple offers — the seller chooses, there is no priority by order of receipt, and disclosure of competing terms is the seller's decision — explain the hazard of countering more than one offer at once and the seller's final-election protection against it, distinguish a permissible refusal to disclose competing terms from a misrepresentation of their existence in either direction, and explain why a client's instruction cannot authorize a misrepresentation.",
      sourceSections: [3],
      screens: [
        { id: "pc8-b3-s1", sequence: 1, type: "instruction", title: "How multiple offers actually work", content: RANGE("## 3. Counteroffers and multiple offers", "### 3.3 The line between confidentiality and misrepresentation") },
        { id: "pc8-b3-s2", sequence: 2, type: "instruction", title: "The line between confidentiality and misrepresentation", content: RANGE("### 3.3 The line between confidentiality and misrepresentation", "## 4. Contingency mechanics") },
        { id: "pc8-b3-s3", sequence: 3, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "pc8-b3-s4", sequence: 4, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "pc8-b3-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc8-b3-q1" },
      ],
    },
    {
      id: "pc8-b4", sequence: 4, required: true,
      title: "Contingency mechanics",
      learningObjective: "Define a contingency as a condition on an already-formed contract's obligations rather than a delay of formation or a general right to cancel, state that under the standard California form a contingency remains in effect until removed in writing and identify the seller's notice-to-perform route when a date passes without removal, apply the contract's required cancellation procedure to a contingency being exercised and identify the acts that forfeit that protection instead, and explain the concrete cost of waiving each common contingency along with the licensee's role of documenting the buyer's decision without recommending the waiver.",
      sourceSections: [4],
      screens: [
        { id: "pc8-b4-s1", sequence: 1, type: "instruction", title: "What a contingency is", content: RANGE("## 4. Contingency mechanics", "### 4.3 How removal actually works") },
        { id: "pc8-b4-s2", sequence: 2, type: "instruction", title: "How removal actually works", content: RANGE("### 4.3 How removal actually works", "### 4.5 Cancelling under a contingency") },
        { id: "pc8-b4-s3", sequence: 3, type: "instruction", title: "Cancelling under a contingency", content: RANGE("### 4.5 Cancelling under a contingency", "## 5. Deadlines, notices, and removal") },
        { id: "pc8-b4-s4", sequence: 4, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "pc8-b4-s5", sequence: 5, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "pc8-b4-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "pc8-b4-q1" },
      ],
    },
    {
      id: "pc8-b5", sequence: 5, required: true,
      title: "Deadlines, notices, and removal",
      learningObjective: "Build a deadline calendar directly from a contract's own terms, apply the contract's definitions for how periods are counted including day zero, calendar versus business days, and weekend or holiday rolls, explain why a notice's legal effect depends on the authorized delivery method and on preserving evidence of it, state that a contract term changes only by a written amendment signed by both parties and delivered to escrow — and that an agent email or verbal understanding does not — and apply the tracking and written-confirmation habits that prevent deadline disputes.",
      sourceSections: [5],
      screens: [
        { id: "pc8-b5-s1", sequence: 1, type: "instruction", title: "Build the calendar from the contract", content: RANGE("## 5. Deadlines, notices, and removal", "### 5.3 Notices carry legal effect") },
        { id: "pc8-b5-s2", sequence: 2, type: "instruction", title: "Notices carry legal effect", content: RANGE("### 5.3 Notices carry legal effect", "### 5.5 Amendments") },
        { id: "pc8-b5-s3", sequence: 3, type: "instruction", title: "Amendments", content: RANGE("### 5.5 Amendments", "## 6. Amendment, cancellation, and dispute prevention") },
        { id: "pc8-b5-s4", sequence: 4, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "pc8-b5-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc8-b5-q1" },
      ],
    },
    {
      id: "pc8-b6", sequence: 6, required: true,
      title: "Amendment, cancellation, and dispute prevention",
      learningObjective: "State that cancellation is accomplished only by exercising a contractual right through its specified procedure and never by announcing an intention, ceasing to perform, or instructing escrow alone, explain why escrow may act only on the parties' mutual written instruction and holds a disputed deposit pending resolution rather than deciding between them, list the documentary practices that prevent most transaction disputes, and rank a closed file's defects by consequence while distinguishing a documented gap, which is survivable, from a backdated document, which is falsification.",
      sourceSections: [6],
      screens: [
        { id: "pc8-b6-s1", sequence: 1, type: "instruction", title: "Cancellation is a procedure", content: RANGE("## 6. Amendment, cancellation, and dispute prevention", "### 6.3 Mediation and arbitration") },
        { id: "pc8-b6-s2", sequence: 2, type: "instruction", title: "Mediation and arbitration", content: RANGE("### 6.3 Mediation and arbitration", "### 6.5 A worked file audit") },
        { id: "pc8-b6-s3", sequence: 3, type: "instruction", title: "A worked file audit", content: RANGE("### 6.5 A worked file audit", "## Key terms") },
        { id: "pc8-b6-s4", sequence: 4, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "pc8-b6-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc8-b6-q1" },
      ],
    },
    {
      id: "pc8-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "pc8-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "pc8-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "pc8-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "pc8-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "pc8-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A8_BLOCKS;
