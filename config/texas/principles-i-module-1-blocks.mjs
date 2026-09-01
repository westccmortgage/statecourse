/**
 * GENERATED FILE — Texas Principles of Real Estate I, Module 01 learning-block map.
 * Derived from the frozen module's own headings by scripts/generate-tx-principles-block-maps.mjs.
 * Learning objectives come from config/texas/principles-i-course.mjs's UNIT_OBJECTIVES (already
 * hand-authored, traced to read statute sections); the retrieval bank lives in
 * config/texas/principles-i-block-retrieval.mjs. Do not edit by hand — regenerate.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const MODULE_1_BLOCKS = Object.freeze({
  courseId: "tx-principles-real-estate-i-30-v1",
  moduleId: "module-01",
  version: "1.0",
  contentPath: "/content/texas/tx-principles-real-estate-i-30-v1/module-01.md",
  blocks: [
    {
      id: "t01u1", sequence: 1, required: true,
      code: "T01U1",
      title: "Real Estate - A Business of Many Opportunities",
      learningObjective: "Distinguish the licensed occupations and specialisations of Texas real estate practice, and identify which activities fall inside the statutory broker definition and which are exempt.",
      screens: [
        { id: "t01u1-s1", sequence: 1, type: "instruction", title: "Real Estate - A Business of Many Opportunities", content: RANGE("^", "### Statute reading exercise: the twelve acts") },
        { id: "t01u1-s2", sequence: 2, type: "practice", title: "Statute reading exercise: the twelve acts", content: RANGE("### Statute reading exercise: the twelve acts", "## Unit: TREC Education Standards Advisory Committee") },
        { id: "t01u1-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "t01u1-q1" },
      ],
    },
    {
      id: "t01u2", sequence: 2, required: true,
      code: "T01U2",
      title: "TREC Education Standards Advisory Committee",
      learningObjective: "Describe the Commission's statutory authority over qualifying education, the Education Standards Advisory Committee's statutory basis, and the elapsed-time and daily-hour limits that govern this course.",
      screens: [
        { id: "t01u2-s1", sequence: 1, type: "instruction", title: "TREC Education Standards Advisory Committee", content: RANGE("## Unit: TREC Education Standards Advisory Committee", "## Unit: The Real Estate Market - Characteristics of Real Estate") },
        { id: "t01u2-s2", sequence: 2, type: "retrieval", title: "Retrieval check", questionId: "t01u2-q1" },
      ],
    },
    {
      id: "t01u3", sequence: 3, required: true,
      code: "T01U3",
      title: "The Real Estate Market - Characteristics of Real Estate",
      learningObjective: "Explain how immobility, uniqueness and durability shape the real estate market, and why the market clears slowly and locally.",
      screens: [
        { id: "t01u3-s1", sequence: 1, type: "instruction", title: "The Real Estate Market - Characteristics of Real Estate", content: RANGE("## Unit: The Real Estate Market - Characteristics of Real Estate", "## Unit: Real Estate Law") },
        { id: "t01u3-s2", sequence: 2, type: "retrieval", title: "Retrieval check", questionId: "t01u3-q1" },
      ],
    },
    {
      id: "t01u4", sequence: 4, required: true,
      code: "T01U4",
      title: "Real Estate Law",
      learningObjective: "State the licence requirement and its principal statutory exemptions, and identify the acts a sales agent may perform only through a sponsoring broker.",
      screens: [
        { id: "t01u4-s1", sequence: 1, type: "instruction", title: "Real Estate Law", content: RANGE("## Unit: Real Estate Law", "### Statute reading exercise: exemptions with edges") },
        { id: "t01u4-s2", sequence: 2, type: "practice", title: "Statute reading exercise: exemptions with edges", content: RANGE("### Statute reading exercise: exemptions with edges", "### Applied exercise: which door into the business?") },
        { id: "t01u4-s3", sequence: 3, type: "practice", title: "Applied exercise: which door into the business?", content: RANGE("### Applied exercise: which door into the business?", "### Module recap") },
        { id: "t01u4-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "t01u4-q1" },
      ],
    },
    {
      id: "t1-recap", sequence: 5, required: true,
      title: "Module recap",
      screens: [
        { id: "t1-recap-s1", sequence: 1, type: "review", title: "Module recap", content: RANGE("### Module recap", "$") },
      ],
    },
  ],
});

export default MODULE_1_BLOCKS;
