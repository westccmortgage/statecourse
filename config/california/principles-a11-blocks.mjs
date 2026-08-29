/**
 * GENERATED FILE — Principles Assignment 11 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-principles-block-maps.mjs; learning
 * objectives and the practice-problem mapping come from the hand-authored spec, and the retrieval
 * bank lives in the course's own retrieval-banks module. Do not edit by hand — regenerate. The
 * delivery layer only: the regulatory layer (sections, applied exercise, knowledge check,
 * remediation, timing, final exam) is untouched.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A11_BLOCKS = Object.freeze({
  courseId: "ca-real-estate-principles-45",
  assignmentId: "assignment-11",
  version: "1.0",
  contentPath: "/content/california/ca-real-estate-principles-45-v1/lesson-11.md",
  blocks: [
    {
      id: "pr11-b1", sequence: 1, required: true,
      title: "Promissory notes",
      learningObjective: "Distinguish the promissory note from the security instrument and state what each does, identify what a note contains and why a licensee's role regarding negotiability is recognition rather than analysis, distinguish the acceleration clause from the alienation clause and name what the other recurring note and security-instrument clauses do, and explain what a balloon payment signals about a note's amortization.",
      sourceSections: [1],
      screens: [
        { id: "pr11-b1-s1", sequence: 1, type: "instruction", title: "Two documents, two jobs", content: RANGE("^", "### 1.3 Negotiability") },
        { id: "pr11-b1-s2", sequence: 2, type: "instruction", title: "Negotiability", content: RANGE("### 1.3 Negotiability", "### 1.5 Straight and amortized notes") },
        { id: "pr11-b1-s3", sequence: 3, type: "instruction", title: "Straight and amortized notes", content: RANGE("### 1.5 Straight and amortized notes", "## 2. Deeds of trust and mortgages") },
        { id: "pr11-b1-s4", sequence: 4, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "pr11-b1-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pr11-b1-q1" },
      ],
    },
    {
      id: "pr11-b2", sequence: 2, required: true,
      title: "Deeds of trust and mortgages",
      learningObjective: "Name the three parties to a California deed of trust and explain why the deed of trust is generally treated as a lien so that the borrower remains the owner, explain what the trustee's power of sale produces and why a recorded reconveyance rather than payment clears the record, distinguish assumption from taking title subject to and explain why priority and subordination are decisions for counsel, and compare the deed of trust with the mortgage on foreclosure speed, deficiency, and redemption.",
      sourceSections: [2],
      screens: [
        { id: "pr11-b2-s1", sequence: 1, type: "instruction", title: "The California instrument", content: RANGE("## 2. Deeds of trust and mortgages", "### 2.3 Title theory and lien theory") },
        { id: "pr11-b2-s2", sequence: 2, type: "instruction", title: "Title theory and lien theory", content: RANGE("### 2.3 Title theory and lien theory", "### 2.5 Priority") },
        { id: "pr11-b2-s3", sequence: 3, type: "instruction", title: "Priority", content: RANGE("### 2.5 Priority", "### 2.7 Other structures") },
        { id: "pr11-b2-s4", sequence: 4, type: "instruction", title: "Other structures", content: RANGE("### 2.7 Other structures", "### 2.10 Deed of trust and mortgage, compared where it matters") },
        { id: "pr11-b2-s5", sequence: 5, type: "instruction", title: "Deed of trust and mortgage, compared where it matters", content: RANGE("### 2.10 Deed of trust and mortgage, compared where it matters", "## 3. Loan markets and sources") },
        { id: "pr11-b2-s6", sequence: 6, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "pr11-b2-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "pr11-b2-q1" },
      ],
    },
    {
      id: "pr11-b3", sequence: 3, required: true,
      title: "Loan markets and sources",
      learningObjective: "Describe the primary and secondary markets and explain why underwriting standards flow backward from the secondary market's need for saleable loans, identify the sources of real estate financing and correct the recurring misstatements about government-backed programs, explain that mortgage insurance protects the lender rather than the borrower, and state what a licensee may and may not say about financing, including the prohibition on predicting rates.",
      sourceSections: [3],
      screens: [
        { id: "pr11-b3-s1", sequence: 1, type: "instruction", title: "Primary and secondary", content: RANGE("## 3. Loan markets and sources", "### 3.3 Government-backed programs, and three things licensees misstate") },
        { id: "pr11-b3-s2", sequence: 2, type: "instruction", title: "Government-backed programs, and three things licensees misstate", content: RANGE("### 3.3 Government-backed programs, and three things licensees misstate", "### 3.5 The Federal Reserve and rates, in outline") },
        { id: "pr11-b3-s3", sequence: 3, type: "instruction", title: "The Federal Reserve and rates, in outline", content: RANGE("### 3.5 The Federal Reserve and rates, in outline", "## 4. Interest, amortization, and points") },
        { id: "pr11-b3-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "pr11-b3-q1" },
      ],
    },
    {
      id: "pr11-b4", sequence: 4, required: true,
      title: "Interest, amortization, and points",
      learningObjective: "Compute interest, amortization components, points, and the effect of each on cost, explain why early payments on an amortized loan are almost entirely interest and what that means for a borrower who sells before the crossover, distinguish fixed, adjustable, interest-only, and balloon rate structures and state that an adjustable rate at each adjustment is the index plus the lender's margin within the note's caps, and explain what an impound shortage does to a payment a borrower believed was fixed.",
      sourceSections: [4],
      screens: [
        { id: "pr11-b4-s1", sequence: 1, type: "instruction", title: "Simple interest", content: RANGE("## 4. Interest, amortization, and points", "### 4.3 Points") },
        { id: "pr11-b4-s2", sequence: 2, type: "instruction", title: "Points", content: RANGE("### 4.3 Points", "### 4.5 Nominal and effective rates") },
        { id: "pr11-b4-s3", sequence: 3, type: "instruction", title: "Nominal and effective rates", content: RANGE("### 4.5 Nominal and effective rates", "### 4.8 Amortisation, points, and the arithmetic clients ask about") },
        { id: "pr11-b4-s4", sequence: 4, type: "instruction", title: "Amortisation, points, and the arithmetic clients ask about", content: RANGE("### 4.8 Amortisation, points, and the arithmetic clients ask about", "## 5. Loan-to-value and qualifying ratios") },
        { id: "pr11-b4-s5", sequence: 5, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "pr11-b4-s6", sequence: 6, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "pr11-b4-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "pr11-b4-q1" },
      ],
    },
    {
      id: "pr11-b5", sequence: 5, required: true,
      title: "Loan-to-value and qualifying ratios",
      learningObjective: "Compute loan-to-value and combined loan-to-value and explain why lenders lend against the lower of appraised value and purchase price, compute the front-end and back-end qualifying ratios and explain what each measures without stating a threshold as a rule, identify the buyer actions during escrow that jeopardize an approval and the written warning that prevents them, and explain why misstating occupancy is loan fraud regardless of affordability.",
      sourceSections: [5],
      screens: [
        { id: "pr11-b5-s1", sequence: 1, type: "instruction", title: "Loan-to-value", content: RANGE("## 5. Loan-to-value and qualifying ratios", "### 5.3 Equity") },
        { id: "pr11-b5-s2", sequence: 2, type: "instruction", title: "Equity", content: RANGE("### 5.3 Equity", "### 5.5 The three numbers, restated") },
        { id: "pr11-b5-s3", sequence: 3, type: "instruction", title: "The three numbers, restated", content: RANGE("### 5.5 The three numbers, restated", "### 5.7 Occupancy is a material fact") },
        { id: "pr11-b5-s4", sequence: 4, type: "instruction", title: "Occupancy is a material fact", content: RANGE("### 5.7 Occupancy is a material fact", "## 6. Default, foreclosure, and deficiency") },
        { id: "pr11-b5-s5", sequence: 5, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "pr11-b5-s6", sequence: 6, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "pr11-b5-s7", sequence: 7, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "pr11-b5-s8", sequence: 8, type: "retrieval", title: "Retrieval check", questionId: "pr11-b5-q1" },
      ],
    },
    {
      id: "pr11-b6", sequence: 6, required: true,
      title: "Default, foreclosure, and deficiency",
      learningObjective: "Describe default and explain why the acceleration clause is what makes it consequential, compare the nonjudicial and judicial foreclosure paths on speed, court involvement, deficiency, and redemption, distinguish the reinstatement window from redemption before sale, and state what a licensee says to a distressed client asking whether they will owe a deficiency.",
      sourceSections: [6],
      screens: [
        { id: "pr11-b6-s1", sequence: 1, type: "instruction", title: "What default is", content: RANGE("## 6. Default, foreclosure, and deficiency", "### 6.3 The nonjudicial sequence, in outline") },
        { id: "pr11-b6-s2", sequence: 2, type: "instruction", title: "The nonjudicial sequence, in outline", content: RANGE("### 6.3 The nonjudicial sequence, in outline", "### 6.5 Alternatives to foreclosure") },
        { id: "pr11-b6-s3", sequence: 3, type: "instruction", title: "Alternatives to foreclosure", content: RANGE("### 6.5 Alternatives to foreclosure", "### 6.7 The licensee working with distressed sellers") },
        { id: "pr11-b6-s4", sequence: 4, type: "instruction", title: "The licensee working with distressed sellers", content: RANGE("### 6.7 The licensee working with distressed sellers", "### 6.10 The power of sale, and where it comes from") },
        { id: "pr11-b6-s5", sequence: 5, type: "instruction", title: "The power of sale, and where it comes from", content: RANGE("### 6.10 The power of sale, and where it comes from", "### 6.12 A worked default") },
        { id: "pr11-b6-s6", sequence: 6, type: "instruction", title: "A worked default", content: RANGE("### 6.12 A worked default", "## Key terms") },
        { id: "pr11-b6-s7", sequence: 7, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "pr11-b6-s8", sequence: 8, type: "retrieval", title: "Retrieval check", questionId: "pr11-b6-q1" },
      ],
    },
    {
      id: "pr11-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "pr11-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "pr11-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "pr11-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "pr11-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "pr11-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A11_BLOCKS;
