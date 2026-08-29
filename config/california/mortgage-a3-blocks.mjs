/**
 * GENERATED FILE — Mortgage Assignment 3 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-mortgage-block-maps.mjs;
 * learning objectives and the practice-problem mapping come from the hand-authored spec in
 * mortgage-block-specs.mjs, and the retrieval bank lives in mortgage-retrieval-banks.mjs.
 * Do not edit by hand — regenerate. The delivery layer only: the regulatory layer (sections,
 * applied exercise, knowledge check, remediation, timing, final exam) is untouched, and B7's
 * mastery derives from the existing assignment record exactly as in the Assignment 1 pilot.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A3_BLOCKS = Object.freeze({
  courseId: "ca-mortgage-loan-brokering-lending-45",
  assignmentId: "assignment-03",
  version: "1.0",
  contentPath: "/content/california/ca-mortgage-loan-brokering-lending-45-v1/lesson-03.md",
  blocks: [
    {
      id: "a3-b1", sequence: 1, required: true,
      title: "Deed of trust structure",
      learningObjective: "Name the three parties to a California deed of trust, list the operative elements of the instrument, and identify defaults that do not involve missing a payment.",
      sourceSections: [1],
      screens: [
        { id: "a3-b1-s1", sequence: 1, type: "instruction", title: "What a security instrument does", content: RANGE("^", "### 1.3 What the instrument contains") },
        { id: "a3-b1-s2", sequence: 2, type: "instruction", title: "What the instrument contains", content: RANGE("### 1.3 What the instrument contains", "### 1.5 What the borrower retains"), documents: [{"src":"/media/specimens/specimen-deed-of-trust.pdf","label":"Specimen deed of trust — DiStefano transaction","note":"The security instrument for the note in Assignment 2. Find the trustor, beneficiary, trustee, legal description, and power-of-sale language."}] },
        { id: "a3-b1-s3", sequence: 3, type: "instruction", title: "What the borrower retains", content: RANGE("### 1.5 What the borrower retains", "## 2. Mortgage comparison") },
        { id: "a3-b1-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "a3-b1-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a3-b1-q1" },
      ],
    },
    {
      id: "a3-b2", sequence: 2, required: true,
      title: "Mortgage comparison",
      learningObjective: "Compare the deed of trust with the mortgage on all seven dimensions, explain what the trustee's power of sale produces, and state California's lien-theory consequence — the borrower is the owner and the lender holds a claim.",
      sourceSections: [2],
      screens: [
        { id: "a3-b2-s1", sequence: 1, type: "instruction", title: "The two-party instrument", content: RANGE("## 2. Mortgage comparison", "### 2.3 Title theory and lien theory") },
        { id: "a3-b2-s2", sequence: 2, type: "instruction", title: "Title theory and lien theory", content: RANGE("### 2.3 Title theory and lien theory", "### 2.5 Other security devices") },
        { id: "a3-b2-s3", sequence: 3, type: "instruction", title: "Other security devices", content: RANGE("### 2.5 Other security devices", "## 3. Trustor, beneficiary, and trustee") },
        { id: "a3-b2-s4", sequence: 4, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "a3-b2-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a3-b2-q1" },
      ],
    },
    {
      id: "a3-b3", sequence: 3, required: true,
      title: "Trustor, beneficiary, and trustee",
      learningObjective: "State what the trustor, beneficiary, and trustee each may and may not do, explain the trustee's two functions and substitution, and distinguish the beneficiary from the servicer.",
      sourceSections: [3],
      screens: [
        { id: "a3-b3-s1", sequence: 1, type: "instruction", title: "The trustor", content: RANGE("## 3. Trustor, beneficiary, and trustee", "### 3.3 The trustee") },
        { id: "a3-b3-s2", sequence: 2, type: "instruction", title: "The trustee", content: RANGE("### 3.3 The trustee", "### 3.5 What a licensee says about the parties") },
        { id: "a3-b3-s3", sequence: 3, type: "instruction", title: "What a licensee says about the parties", content: RANGE("### 3.5 What a licensee says about the parties", "## 4. Recording and priority") },
        { id: "a3-b3-s4", sequence: 4, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "a3-b3-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "a3-b3-q1" },
      ],
    },
    {
      id: "a3-b4", sequence: 4, required: true,
      title: "Recording and priority",
      learningObjective: "Apply the recording system's three kinds of notice and the first-in-time rule with its exceptions, recognize the mechanic's lien relation-back at intake, and distinguish a preliminary-report exception from a requirement.",
      sourceSections: [4],
      screens: [
        { id: "a3-b4-s1", sequence: 1, type: "instruction", title: "What recording accomplishes", content: RANGE("## 4. Recording and priority", "### 4.3 The general priority rule") },
        { id: "a3-b4-s2", sequence: 2, type: "instruction", title: "The general priority rule", content: RANGE("### 4.3 The general priority rule", "### 4.5 The mechanic's lien problem") },
        { id: "a3-b4-s3", sequence: 3, type: "instruction", title: "The mechanic's lien problem", content: RANGE("### 4.5 The mechanic's lien problem", "### 4.7 The preliminary report") },
        { id: "a3-b4-s4", sequence: 4, type: "instruction", title: "The preliminary report", content: RANGE("### 4.7 The preliminary report", "## 5. Subordination and reconveyance") },
        { id: "a3-b4-s5", sequence: 5, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "a3-b4-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a3-b4-q1" },
      ],
    },
    {
      id: "a3-b5", sequence: 5, required: true,
      title: "Subordination and reconveyance",
      learningObjective: "Explain why a refinance with an existing second needs a subordination agreement, state that a recorded reconveyance — not payment — clears a paid deed of trust, and distinguish assumption, subject to, and wraparound.",
      sourceSections: [5],
      screens: [
        { id: "a3-b5-s1", sequence: 1, type: "instruction", title: "What subordination does", content: RANGE("## 5. Subordination and reconveyance", "### 5.3 Subordination clauses in the original instrument") },
        { id: "a3-b5-s2", sequence: 2, type: "instruction", title: "Subordination clauses in the original instrument", content: RANGE("### 5.3 Subordination clauses in the original instrument", "### 5.5 Partial reconveyance and release clauses") },
        { id: "a3-b5-s3", sequence: 3, type: "instruction", title: "Partial reconveyance and release clauses", content: RANGE("### 5.5 Partial reconveyance and release clauses", "## 6. Default remedies and security risk") },
        { id: "a3-b5-s4", sequence: 4, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "a3-b5-s5", sequence: 5, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "a3-b5-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "a3-b5-q1" },
      ],
    },
    {
      id: "a3-b6", sequence: 6, required: true,
      title: "Default remedies and security risk",
      learningObjective: "Compare the two foreclosure paths and their trade-off, distinguish reinstatement from redemption, state what a senior foreclosure does to junior liens, and name the security risks a broker must surface — including the automatic stay.",
      sourceSections: [6],
      screens: [
        { id: "a3-b6-s1", sequence: 1, type: "instruction", title: "What default is", content: RANGE("## 6. Default remedies and security risk", "### 6.3 The nonjudicial sequence, in outline") },
        { id: "a3-b6-s2", sequence: 2, type: "instruction", title: "The nonjudicial sequence, in outline", content: RANGE("### 6.3 The nonjudicial sequence, in outline", "### 6.5 What happens to junior liens") },
        { id: "a3-b6-s3", sequence: 3, type: "instruction", title: "What happens to junior liens", content: RANGE("### 6.5 What happens to junior liens", "### 6.7 Bankruptcy, in outline") },
        { id: "a3-b6-s4", sequence: 4, type: "instruction", title: "Bankruptcy, in outline", content: RANGE("### 6.7 Bankruptcy, in outline", "### 6.9 What the security instrument means to the borrower in front of you") },
        { id: "a3-b6-s5", sequence: 5, type: "instruction", title: "What the security instrument means to the borrower in front of you", content: RANGE("### 6.9 What the security instrument means to the borrower in front of you", "## Key terms") },
        { id: "a3-b6-s6", sequence: 6, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "a3-b6-s7", sequence: 7, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "a3-b6-s8", sequence: 8, type: "retrieval", title: "Retrieval check", questionId: "a3-b6-q1" },
      ],
    },
    {
      id: "a3-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "a3-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "a3-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "a3-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "a3-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "a3-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A3_BLOCKS;
