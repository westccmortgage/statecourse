/**
 * GENERATED FILE — Principles Assignment 5 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-principles-block-maps.mjs; learning
 * objectives and the practice-problem mapping come from the hand-authored spec, and the retrieval
 * bank lives in the course's own retrieval-banks module. Do not edit by hand — regenerate. The
 * delivery layer only: the regulatory layer (sections, applied exercise, knowledge check,
 * remediation, timing, final exam) is untouched.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A5_BLOCKS = Object.freeze({
  courseId: "ca-real-estate-principles-45",
  assignmentId: "assignment-05",
  version: "1.0",
  contentPath: "/content/california/ca-real-estate-principles-45-v1/lesson-05.md",
  blocks: [
    {
      id: "pr5-b1", sequence: 1, required: true,
      title: "Voluntary and involuntary liens",
      learningObjective: "Classify encumbrances as affecting title or use, place each common lien on the voluntary/involuntary and general/specific axes, and explain the practical consequence of a general lien reaching every parcel a debtor owns in the county.",
      sourceSections: [1],
      screens: [
        { id: "pr5-b1-s1", sequence: 1, type: "instruction", title: "What an encumbrance is", content: RANGE("^", "### 1.3 General and specific") },
        { id: "pr5-b1-s2", sequence: 2, type: "instruction", title: "General and specific", content: RANGE("### 1.3 General and specific", "### 1.5 What a lien does and does not do") },
        { id: "pr5-b1-s3", sequence: 3, type: "instruction", title: "What a lien does and does not do", content: RANGE("### 1.5 What a lien does and does not do", "## 2. The common liens") },
        { id: "pr5-b1-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "pr5-b1-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pr5-b1-q1" },
      ],
    },
    {
      id: "pr5-b2", sequence: 2, required: true,
      title: "The common liens",
      learningObjective: "Explain how each common lien — deed of trust, property tax lien, mechanic's lien, judgment lien, lis pendens — arises and is removed, why a mechanic's lien's priority relates back to commencement of work rather than to its own recording date, and the scope and limits of the homestead exemption.",
      sourceSections: [2],
      screens: [
        { id: "pr5-b2-s1", sequence: 1, type: "instruction", title: "Deed of trust", content: RANGE("## 2. The common liens", "### 2.3 Mechanic's liens") },
        { id: "pr5-b2-s2", sequence: 2, type: "instruction", title: "Mechanic's liens", content: RANGE("### 2.3 Mechanic's liens", "### 2.5 Other encumbrances affecting title") },
        { id: "pr5-b2-s3", sequence: 3, type: "instruction", title: "Other encumbrances affecting title", content: RANGE("### 2.5 Other encumbrances affecting title", "### 2.8 The homestead exemption, and the figure that changed") },
        { id: "pr5-b2-s4", sequence: 4, type: "instruction", title: "The homestead exemption, and the figure that changed", content: RANGE("### 2.8 The homestead exemption, and the figure that changed", "### 2.10 A worked title problem") },
        { id: "pr5-b2-s5", sequence: 5, type: "instruction", title: "A worked title problem", content: RANGE("### 2.10 A worked title problem", "## 3. Easements and licenses") },
        { id: "pr5-b2-s6", sequence: 6, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "pr5-b2-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "pr5-b2-q1" },
      ],
    },
    {
      id: "pr5-b3", sequence: 3, required: true,
      title: "Easements and licenses",
      learningObjective: "Distinguish an easement from a license, identify the dominant and servient tenements in an easement appurtenant versus an easement in gross, describe how easements are created and terminated (noting that non-use alone does not end one), and state the correct handling of an easement shown in a preliminary report.",
      sourceSections: [3],
      screens: [
        { id: "pr5-b3-s1", sequence: 1, type: "instruction", title: "What an easement is", content: RANGE("## 3. Easements and licenses", "### 3.3 How easements are created") },
        { id: "pr5-b3-s2", sequence: 2, type: "instruction", title: "How easements are created", content: RANGE("### 3.3 How easements are created", "### 3.5 Licenses") },
        { id: "pr5-b3-s3", sequence: 3, type: "instruction", title: "Licenses", content: RANGE("### 3.5 Licenses", "### 3.7 A worked easement problem") },
        { id: "pr5-b3-s4", sequence: 4, type: "instruction", title: "A worked easement problem", content: RANGE("### 3.7 A worked easement problem", "### 3.10 A worked easement problem") },
        { id: "pr5-b3-s5", sequence: 5, type: "instruction", title: "A worked easement problem", content: RANGE("### 3.10 A worked easement problem", "## 4. Deed restrictions and covenants") },
        { id: "pr5-b3-s6", sequence: 6, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "pr5-b3-s7", sequence: 7, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "pr5-b3-s8", sequence: 8, type: "retrieval", title: "Retrieval check", questionId: "pr5-b3-q1" },
      ],
    },
    {
      id: "pr5-b4", sequence: 4, required: true,
      title: "Deed restrictions and covenants",
      learningObjective: "Explain how recorded private restrictions differ from zoning in source, enforcement, and amendment, apply the rule that the more restrictive of the two generally governs, and state what a licensee may and may not say about a restriction's meaning or enforceability.",
      sourceSections: [4],
      screens: [
        { id: "pr5-b4-s1", sequence: 1, type: "instruction", title: "What they are", content: RANGE("## 4. Deed restrictions and covenants", "### 4.3 What restrictions commonly cover") },
        { id: "pr5-b4-s2", sequence: 2, type: "instruction", title: "What restrictions commonly cover", content: RANGE("### 4.3 What restrictions commonly cover", "### 4.5 What a licensee may and may not do") },
        { id: "pr5-b4-s3", sequence: 3, type: "instruction", title: "What a licensee may and may not do", content: RANGE("### 4.5 What a licensee may and may not do", "## 5. Encroachments, priority, and recording") },
        { id: "pr5-b4-s4", sequence: 4, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "pr5-b4-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pr5-b4-q1" },
      ],
    },
    {
      id: "pr5-b5", sequence: 5, required: true,
      title: "Encroachments, priority, and recording",
      learningObjective: "Identify an encroachment and route it correctly, distinguish actual, constructive, and inquiry notice, and state the first-in-time priority rule together with its property-tax-lien and mechanic's-lien exceptions and the weight of a subordination agreement.",
      sourceSections: [5],
      screens: [
        { id: "pr5-b5-s1", sequence: 1, type: "instruction", title: "Encroachments", content: RANGE("## 5. Encroachments, priority, and recording", "### 5.3 Priority") },
        { id: "pr5-b5-s2", sequence: 2, type: "instruction", title: "Priority", content: RANGE("### 5.3 Priority", "### 5.5 What escrow and title actually do with this") },
        { id: "pr5-b5-s3", sequence: 3, type: "instruction", title: "What escrow and title actually do with this", content: RANGE("### 5.5 What escrow and title actually do with this", "### 5.8 What a licensee does with a preliminary report") },
        { id: "pr5-b5-s4", sequence: 4, type: "instruction", title: "What a licensee does with a preliminary report", content: RANGE("### 5.8 What a licensee does with a preliminary report", "## 6. Title exceptions and risk allocation") },
        { id: "pr5-b5-s5", sequence: 5, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "pr5-b5-s6", sequence: 6, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "pr5-b5-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "pr5-b5-q1" },
      ],
    },
    {
      id: "pr5-b6", sequence: 6, required: true,
      title: "Title exceptions and risk allocation",
      learningObjective: "Explain what a preliminary report is and is not, define an exception as an uninsured risk the buyer bears, distinguish exceptions from exclusions and requirements, and state the correct licensee response to each type of item found on a preliminary report.",
      sourceSections: [6],
      screens: [
        { id: "pr5-b6-s1", sequence: 1, type: "instruction", title: "What a preliminary report is", content: RANGE("## 6. Title exceptions and risk allocation", "### 6.3 Exclusions and requirements") },
        { id: "pr5-b6-s2", sequence: 2, type: "instruction", title: "Exclusions and requirements", content: RANGE("### 6.3 Exclusions and requirements", "### 6.5 Owner's and lender's policies") },
        { id: "pr5-b6-s3", sequence: 3, type: "instruction", title: "Owner's and lender's policies", content: RANGE("### 6.5 Owner's and lender's policies", "### 6.7 A worked preliminary report") },
        { id: "pr5-b6-s4", sequence: 4, type: "instruction", title: "A worked preliminary report", content: RANGE("### 6.7 A worked preliminary report", "## Key terms") },
        { id: "pr5-b6-s5", sequence: 5, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "pr5-b6-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "pr5-b6-q1" },
      ],
    },
    {
      id: "pr5-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "pr5-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "pr5-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "pr5-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "pr5-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "pr5-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A5_BLOCKS;
