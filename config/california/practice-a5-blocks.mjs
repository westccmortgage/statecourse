/**
 * GENERATED FILE — Practice Assignment 5 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-practice-block-maps.mjs; learning
 * objectives and the practice-problem mapping come from the hand-authored spec, and the retrieval
 * bank lives in the course's own retrieval-banks module. Do not edit by hand — regenerate. The
 * delivery layer only: the regulatory layer (sections, applied exercise, knowledge check,
 * remediation, timing, final exam) is untouched.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A5_BLOCKS = Object.freeze({
  courseId: "ca-real-estate-practice-45",
  assignmentId: "assignment-05",
  version: "1.0",
  contentPath: "/content/california/ca-real-estate-practice-45-v1/lesson-05.md",
  blocks: [
    {
      id: "pc5-b1", sequence: 1, required: true,
      title: "Market selection",
      learningObjective: "Define a defensible market area using behavioral rather than administrative boundaries, select a competitive set of comparables using the characteristics that drive buyer decisions, weigh recency against market movement and data sources by their reliability, and recognize the property types — common interest developments, acreage, unique properties, new construction, deed-restricted housing, and mixed use — where the standard method breaks down and requires a disclosed change in approach, justifying a comparable's inclusion or exclusion in terms of buyer behavior rather than distance.",
      sourceSections: [1],
      screens: [
        { id: "pc5-b1-s1", sequence: 1, type: "instruction", title: "The question a market analysis answers", content: RANGE("^", "### 1.3 Defining the competitive set") },
        { id: "pc5-b1-s2", sequence: 2, type: "instruction", title: "Defining the competitive set", content: RANGE("### 1.3 Defining the competitive set", "### 1.5 Data sources and their limits") },
        { id: "pc5-b1-s3", sequence: 3, type: "instruction", title: "Data sources and their limits", content: RANGE("### 1.5 Data sources and their limits", "## 2. Comparable adjustment reasoning") },
        { id: "pc5-b1-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "pc5-b1-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc5-b1-q1" },
      ],
    },
    {
      id: "pc5-b2", sequence: 2, required: true,
      title: "Comparable adjustment reasoning",
      learningObjective: "Apply the rule that adjustments are made to the comparable and never to the subject, construct and read an adjustment grid to determine each adjustment's direction and derive its amount in the correct order of preference, reconcile multiple indicated values into a supported range and most-probable point by weighting for net and gross adjustment size, recency, and similarity rather than averaging, explain why contribution is not cost, and use bracketing and the gross-versus-net distinction to separate a defensible grid from one whose convergence merely restates the analyst's judgment.",
      sourceSections: [2],
      screens: [
        { id: "pc5-b2-s1", sequence: 1, type: "instruction", title: "The direction of adjustment", content: RANGE("## 2. Comparable adjustment reasoning", "### 2.3 Reconciling the indications") },
        { id: "pc5-b2-s2", sequence: 2, type: "instruction", title: "Reconciling the indications", content: RANGE("### 2.3 Reconciling the indications", "### 2.5 Contribution is not cost") },
        { id: "pc5-b2-s3", sequence: 3, type: "instruction", title: "Contribution is not cost", content: RANGE("### 2.5 Contribution is not cost", "## 3. Active, pending, and sold evidence") },
        { id: "pc5-b2-s4", sequence: 4, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "pc5-b2-s5", sequence: 5, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "pc5-b2-s6", sequence: 6, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "pc5-b2-s7", sequence: 7, type: "retrieval", title: "Retrieval check", questionId: "pc5-b2-q1" },
      ],
    },
    {
      id: "pc5-b3", sequence: 3, required: true,
      title: "Active, pending, and sold evidence",
      learningObjective: "Distinguish what closed, pending, and active listing data each prove and do not prove, explain why closed sales are the only direct evidence of price even though they lag a moving market, compute months of supply and read days on market as an independent measure of market direction, describe the stale-listing effect, and account for concessions that separate a sale's recorded price from its true economic price.",
      sourceSections: [3],
      screens: [
        { id: "pc5-b3-s1", sequence: 1, type: "instruction", title: "What each category proves", content: RANGE("## 3. Active, pending, and sold evidence", "### 3.3 Why active listings mislead when misused") },
        { id: "pc5-b3-s2", sequence: 2, type: "instruction", title: "Why active listings mislead when misused", content: RANGE("### 3.3 Why active listings mislead when misused", "### 3.5 The stale-listing effect") },
        { id: "pc5-b3-s3", sequence: 3, type: "instruction", title: "The stale-listing effect", content: RANGE("### 3.5 The stale-listing effect", "## 4. Seller net and pricing consequences") },
        { id: "pc5-b3-s4", sequence: 4, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "pc5-b3-s5", sequence: 5, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "pc5-b3-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "pc5-b3-q1" },
      ],
    },
    {
      id: "pc5-b4", sequence: 4, required: true,
      title: "Seller net and pricing consequences",
      learningObjective: "Prepare an estimated seller net sheet, explain how price interacts with terms — a closing cost credit, contingency length, and down payment size — to affect the seller's real risk and proceeds beyond the arithmetic, and describe the licensee's limited role of recognizing and routing rather than advising when a net sheet reveals the seller may not have enough equity to complete the sale as contemplated.",
      sourceSections: [4],
      screens: [
        { id: "pc5-b4-s1", sequence: 1, type: "instruction", title: "The seller's real question", content: RANGE("## 4. Seller net and pricing consequences", "### 4.3 A worked comparison") },
        { id: "pc5-b4-s2", sequence: 2, type: "instruction", title: "A worked comparison", content: RANGE("### 4.3 A worked comparison", "### 4.5 Updating the net sheet") },
        { id: "pc5-b4-s3", sequence: 3, type: "instruction", title: "Updating the net sheet", content: RANGE("### 4.5 Updating the net sheet", "## 5. Appraisal versus comparative market analysis") },
        { id: "pc5-b4-s4", sequence: 4, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "pc5-b4-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pc5-b4-q1" },
      ],
    },
    {
      id: "pc5-b5", sequence: 5, required: true,
      title: "Appraisal versus comparative market analysis",
      learningObjective: "State the legal and practical boundary between a comparative market analysis and an appraisal, explain what a licensee may and may not do when a lender's appraisal comes in below the contract price, distinguish supplying an appraiser relevant information from supplying a value target, and identify the three questions — who will rely on the opinion, what is its effective date, and whether the licensee is independent of the outcome — that govern accepting an assignment to value a property for a purpose other than a sale.",
      sourceSections: [5],
      screens: [
        { id: "pc5-b5-s1", sequence: 1, type: "instruction", title: "The boundary", content: RANGE("## 5. Appraisal versus comparative market analysis", "### 5.3 When the appraisal disagrees") },
        { id: "pc5-b5-s2", sequence: 2, type: "instruction", title: "When the appraisal disagrees", content: RANGE("### 5.3 When the appraisal disagrees", "## 6. Pricing presentation and file support") },
        { id: "pc5-b5-s3", sequence: 3, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "pc5-b5-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "pc5-b5-q1" },
      ],
    },
    {
      id: "pc5-b6", sequence: 6, required: true,
      title: "Pricing presentation and file support",
      learningObjective: "Explain what makes a pricing opinion reconstructable and list what the pricing file must contain, sequence a defensible presentation to a seller, describe what the file must show when a seller chooses a price above the recommendation, and explain why a file assembled contemporaneously withstands a later claim while a reconstructed analysis presented as contemporaneous does not.",
      sourceSections: [6],
      screens: [
        { id: "pc5-b6-s1", sequence: 1, type: "instruction", title: "What makes an opinion defensible", content: RANGE("## 6. Pricing presentation and file support", "### 6.3 Presenting to a seller") },
        { id: "pc5-b6-s2", sequence: 2, type: "instruction", title: "Presenting to a seller", content: RANGE("### 6.3 Presenting to a seller", "### 6.5 Revisiting the price") },
        { id: "pc5-b6-s3", sequence: 3, type: "instruction", title: "Revisiting the price", content: RANGE("### 6.5 Revisiting the price", "## Key terms") },
        { id: "pc5-b6-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "pc5-b6-q1" },
      ],
    },
    {
      id: "pc5-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "pc5-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "pc5-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "pc5-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "pc5-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "pc5-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A5_BLOCKS;
