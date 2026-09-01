/**
 * GENERATED FILE — Principles Assignment 4 learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-principles-block-maps.mjs; learning
 * objectives and the practice-problem mapping come from the hand-authored spec, and the retrieval
 * bank lives in the course's own retrieval-banks module. Do not edit by hand — regenerate. The
 * delivery layer only: the regulatory layer (sections, applied exercise, knowledge check,
 * remediation, timing, final exam) is untouched.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A4_BLOCKS = Object.freeze({
  courseId: "ca-real-estate-principles-45",
  assignmentId: "assignment-04",
  version: "1.0",
  contentPath: "/content/california/ca-real-estate-principles-45-v1/lesson-04.md",
  blocks: [
    {
      id: "pr4-b1", sequence: 1, required: true,
      title: "Metes and bounds",
      learningObjective: "Read a metes and bounds description as a sequence of courses from a point of beginning, interpret a bearing's direction and magnitude, and explain what closure means and why a description that does not close is defective.",
      sourceSections: [1],
      screens: [
        { id: "pr4-b1-s1", sequence: 1, type: "instruction", title: "Why a legal description is required", content: RANGE("^", "### 1.3 The elements") },
        { id: "pr4-b1-s2", sequence: 2, type: "instruction", title: "The elements", content: RANGE("### 1.3 The elements", "### 1.5 A worked description") },
        { id: "pr4-b1-s3", sequence: 3, type: "instruction", title: "A worked description", content: RANGE("### 1.5 A worked description", "### 1.8 Reading a metes and bounds description aloud") },
        { id: "pr4-b1-s4", sequence: 4, type: "instruction", title: "Reading a metes and bounds description aloud", content: RANGE("### 1.8 Reading a metes and bounds description aloud", "## 2. Government survey system") },
        { id: "pr4-b1-s5", sequence: 5, type: "practice", title: "Practice: problem 2", content: RANGE("### Problem 2", "### Problem 3"), practiceProblem: 2 },
        { id: "pr4-b1-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "pr4-b1-q1" },
      ],
    },
    {
      id: "pr4-b2", sequence: 2, required: true,
      title: "Government survey system",
      learningObjective: "Locate a parcel within California's rectangular survey system by township and range, compute acreage from a sectional description by reading it backwards, and explain why convergence produces government lots and a nominal rather than guaranteed 640 acres.",
      sourceSections: [2],
      screens: [
        { id: "pr4-b2-s1", sequence: 1, type: "instruction", title: "What it is", content: RANGE("## 2. Government survey system", "### 2.3 The numbers to know") },
        { id: "pr4-b2-s2", sequence: 2, type: "instruction", title: "The numbers to know", content: RANGE("### 2.3 The numbers to know", "### 2.5 Why sections are not exactly 640 acres") },
        { id: "pr4-b2-s3", sequence: 3, type: "instruction", title: "Why sections are not exactly 640 acres", content: RANGE("### 2.5 Why sections are not exactly 640 acres", "## 3. Lot and block descriptions") },
        { id: "pr4-b2-s4", sequence: 4, type: "practice", title: "Practice: problem 3", content: RANGE("### Problem 3", "### Problem 4"), practiceProblem: 3 },
        { id: "pr4-b2-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "pr4-b2-q1" },
      ],
    },
    {
      id: "pr4-b3", sequence: 3, required: true,
      title: "Lot and block descriptions",
      learningObjective: "Identify the elements of a lot, block, and tract description and its recording reference, and explain how 'except' and 'together with' language subtracts from or adds to the parcel conveyed.",
      sourceSections: [3],
      screens: [
        { id: "pr4-b3-s1", sequence: 1, type: "instruction", title: "The system most residential property uses", content: RANGE("## 3. Lot and block descriptions", "### 3.3 \"Except\" and \"together with\"") },
        { id: "pr4-b3-s2", sequence: 2, type: "instruction", title: "\"Except\" and \"together with\"", content: RANGE("### 3.3 \"Except\" and \"together with\"", "## 4. Recorded maps and assessor parcels") },
        { id: "pr4-b3-s3", sequence: 3, type: "practice", title: "Practice: problem 4", content: RANGE("### Problem 4", "### Problem 5"), practiceProblem: 4 },
        { id: "pr4-b3-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "pr4-b3-q1" },
      ],
    },
    {
      id: "pr4-b4", sequence: 4, required: true,
      title: "Recorded maps and assessor parcels",
      learningObjective: "Distinguish an assessor's parcel number from a legal description, explain why a separate tax bill is not evidence of a lawful separate parcel, and identify the deed and preliminary report as the operative sources of a description.",
      sourceSections: [4],
      screens: [
        { id: "pr4-b4-s1", sequence: 1, type: "instruction", title: "The distinction that causes real errors", content: RANGE("## 4. Recorded maps and assessor parcels", "### 4.3 Where descriptions are actually found") },
        { id: "pr4-b4-s2", sequence: 2, type: "instruction", title: "Where descriptions are actually found", content: RANGE("### 4.3 Where descriptions are actually found", "### 4.5 A worked description problem") },
        { id: "pr4-b4-s3", sequence: 3, type: "instruction", title: "A worked description problem", content: RANGE("### 4.5 A worked description problem", "## 5. Survey and boundary evidence") },
        { id: "pr4-b4-s4", sequence: 4, type: "practice", title: "Practice: problem 1", content: RANGE("### Problem 1", "### Problem 2"), practiceProblem: 1 },
        { id: "pr4-b4-s5", sequence: 5, type: "practice", title: "Practice: problem 5", content: RANGE("### Problem 5", "### Problem 6"), practiceProblem: 5 },
        { id: "pr4-b4-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "pr4-b4-q1" },
      ],
    },
    {
      id: "pr4-b5", sequence: 5, required: true,
      title: "Survey and boundary evidence",
      learningObjective: "Distinguish the record boundary from the occupied boundary, explain why a title policy does not insure boundary location, and identify the recurring situations that call for recommending a survey rather than assessing the boundary personally.",
      sourceSections: [5],
      screens: [
        { id: "pr4-b5-s1", sequence: 1, type: "instruction", title: "Two different boundaries", content: RANGE("## 5. Survey and boundary evidence", "### 5.3 What a title policy does not do") },
        { id: "pr4-b5-s2", sequence: 2, type: "instruction", title: "What a title policy does not do", content: RANGE("### 5.3 What a title policy does not do", "### 5.5 What the licensee must not do") },
        { id: "pr4-b5-s3", sequence: 3, type: "instruction", title: "What the licensee must not do", content: RANGE("### 5.5 What the licensee must not do", "### 5.8 The evidence a boundary rests on, ranked") },
        { id: "pr4-b5-s4", sequence: 4, type: "instruction", title: "The evidence a boundary rests on, ranked", content: RANGE("### 5.8 The evidence a boundary rests on, ranked", "## 6. Area and linear measurement") },
        { id: "pr4-b5-s5", sequence: 5, type: "practice", title: "Practice: problem 6", content: RANGE("### Problem 6", "### Problem 7"), practiceProblem: 6 },
        { id: "pr4-b5-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "pr4-b5-q1" },
      ],
    },
    {
      id: "pr4-b6", sequence: 6, required: true,
      title: "Area and linear measurement",
      learningObjective: "Perform the area, unit-conversion, and reasonableness calculations a licensee needs for lot size, acreage, and value, and state a measurement — especially square footage — with its number, unit, and source rather than as an unattributed fact.",
      sourceSections: [6],
      screens: [
        { id: "pr4-b6-s1", sequence: 1, type: "instruction", title: "The constants", content: RANGE("## 6. Area and linear measurement", "### 6.3 Worked problems") },
        { id: "pr4-b6-s2", sequence: 2, type: "instruction", title: "Worked problems", content: RANGE("### 6.3 Worked problems", "### 6.5 Measuring improvements, and the square footage problem") },
        { id: "pr4-b6-s3", sequence: 3, type: "instruction", title: "Measuring improvements, and the square footage problem", content: RANGE("### 6.5 Measuring improvements, and the square footage problem", "### 6.7 Where measurement errors reach the client") },
        { id: "pr4-b6-s4", sequence: 4, type: "instruction", title: "Where measurement errors reach the client", content: RANGE("### 6.7 Where measurement errors reach the client", "### 6.10 Area problems a licensee actually meets") },
        { id: "pr4-b6-s5", sequence: 5, type: "instruction", title: "Area problems a licensee actually meets", content: RANGE("### 6.10 Area problems a licensee actually meets", "## Key terms") },
        { id: "pr4-b6-s6", sequence: 6, type: "practice", title: "Practice: problem 7", content: RANGE("### Problem 7", "### Problem 8"), practiceProblem: 7 },
        { id: "pr4-b6-s7", sequence: 7, type: "practice", title: "Practice: problem 8", content: RANGE("### Problem 8", "## Chapter summary"), practiceProblem: 8 },
        { id: "pr4-b6-s8", sequence: 8, type: "retrieval", title: "Retrieval check", questionId: "pr4-b6-q1" },
      ],
    },
    {
      id: "pr4-b7", sequence: 7, required: true,
      title: "Synthesis and assignment mastery",
      learningObjective: "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
      sourceSections: [],
      regulatoryMastery: true,
      screens: [
        { id: "pr4-b7-s1", sequence: 1, type: "review", title: "Key terms", content: RANGE("## Key terms", "## Practice problems") },
        { id: "pr4-b7-s2", sequence: 2, type: "review", title: "Chapter summary", content: RANGE("## Chapter summary", "## Required applied assignment") },
        { id: "pr4-b7-s3", sequence: 3, type: "applied", title: "Applied assignment", content: RANGE("## Required applied assignment", "## Knowledge check and remediation") },
        { id: "pr4-b7-s4", sequence: 4, type: "mastery", title: "Assignment mastery check", content: RANGE("## Knowledge check and remediation", "## Assignment completion") },
        { id: "pr4-b7-s5", sequence: 5, type: "completion", title: "Assignment completion", content: RANGE("## Assignment completion", "$") },
      ],
    },
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A4_BLOCKS;
