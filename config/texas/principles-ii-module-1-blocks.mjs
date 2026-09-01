/**
 * GENERATED FILE — Texas Principles of Real Estate I, Module 01 learning-block map.
 * Derived from the frozen module's own headings by scripts/generate-tx-principles-block-maps.mjs.
 * Learning objectives come from config/texas/principles-i-course.mjs's UNIT_OBJECTIVES (already
 * hand-authored, traced to read statute sections); the retrieval bank lives in
 * config/texas/principles-i-block-retrieval.mjs. Do not edit by hand — regenerate.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const MODULE_1_BLOCKS = Object.freeze({
  courseId: "tx-principles-real-estate-ii-30-v1",
  moduleId: "module-01",
  version: "1.0",
  contentPath: "/content/texas/tx-principles-real-estate-ii-30-v1/module-01.md",
  blocks: [
    {
      id: "t01u1", sequence: 1, required: true,
      code: "T01U1",
      title: "Calculators",
      learningObjective: "State the order of operations a calculation must follow, use a calculator's memory and percent functions without introducing error, and apply a rounding rule that keeps a commission or proration accurate to the cent.",
      screens: [
        { id: "t01u1-s1", sequence: 1, type: "instruction", title: "Calculators", content: RANGE("^", "## Unit: Fractions and Percentages") },
        { id: "t01u1-s2", sequence: 2, type: "retrieval", title: "Retrieval check", questionId: "t01u1-q1" },
      ],
    },
    {
      id: "t01u2", sequence: 2, required: true,
      code: "T01U2",
      title: "Fractions and Percentages",
      learningObjective: "Convert among fractions, decimals and percentages, compute any one of part, whole or rate from the other two, and distinguish a percentage increase from a percentage decrease when applying either to commission splits, list-to-sale price ratios and fractional ownership shares.",
      screens: [
        { id: "t01u2-s1", sequence: 1, type: "instruction", title: "Fractions and Percentages", content: RANGE("## Unit: Fractions and Percentages", "### Applied exercise: a Texas listing that sold under asking") },
        { id: "t01u2-s2", sequence: 2, type: "practice", title: "Applied exercise: a Texas listing that sold under asking", content: RANGE("### Applied exercise: a Texas listing that sold under asking", "### Module recap") },
        { id: "t01u2-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "t01u2-q1" },
      ],
    },
    {
      id: "t1-recap", sequence: 3, required: true,
      title: "Module recap",
      screens: [
        { id: "t1-recap-s1", sequence: 1, type: "review", title: "Module recap", content: RANGE("### Module recap", "$") },
      ],
    },
  ],
});

export default MODULE_1_BLOCKS;
