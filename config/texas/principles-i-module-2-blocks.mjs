/**
 * GENERATED FILE — Texas Principles of Real Estate I, Module 02 learning-block map.
 * Derived from the frozen module's own headings by scripts/generate-tx-principles-block-maps.mjs.
 * Learning objectives come from config/texas/principles-i-course.mjs's UNIT_OBJECTIVES (already
 * hand-authored, traced to read statute sections); the retrieval bank lives in
 * config/texas/principles-i-block-retrieval.mjs. Do not edit by hand — regenerate.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const MODULE_2_BLOCKS = Object.freeze({
  courseId: "tx-principles-real-estate-i-30-v1",
  moduleId: "module-02",
  version: "1.0",
  contentPath: "/content/texas/tx-principles-real-estate-i-30-v1/module-02.md",
  blocks: [
    {
      id: "t02u1", sequence: 1, required: true,
      code: "T02U1",
      title: "Land, Real Estate and Real Property",
      learningObjective: "Differentiate land, real estate and real property, and state what a Texas conveyance of an estate in real property passes by default.",
      screens: [
        { id: "t02u1-s1", sequence: 1, type: "instruction", title: "Land, Real Estate and Real Property", content: RANGE("^", "## Unit: Personal Property") },
        { id: "t02u1-s2", sequence: 2, type: "retrieval", title: "Retrieval check", questionId: "t02u1-q1" },
      ],
    },
    {
      id: "t02u2", sequence: 2, required: true,
      code: "T02U2",
      title: "Personal Property",
      learningObjective: "Classify property as real or personal, apply the fixture tests, and explain how a security interest in a fixture is perfected and enforced against the realty.",
      screens: [
        { id: "t02u2-s1", sequence: 1, type: "instruction", title: "Personal Property", content: RANGE("## Unit: Personal Property", "### Statute reading exercise: the state's water and the merchant's lumber") },
        { id: "t02u2-s2", sequence: 2, type: "practice", title: "Statute reading exercise: the state's water and the merchant's lumber", content: RANGE("### Statute reading exercise: the state's water and the merchant's lumber", "### Applied exercise: the contested farmhouse closing") },
        { id: "t02u2-s3", sequence: 3, type: "practice", title: "Applied exercise: the contested farmhouse closing", content: RANGE("### Applied exercise: the contested farmhouse closing", "### Module recap") },
        { id: "t02u2-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "t02u2-q1" },
      ],
    },
    {
      id: "t2-recap", sequence: 3, required: true,
      title: "Module recap",
      screens: [
        { id: "t2-recap-s1", sequence: 1, type: "review", title: "Module recap", content: RANGE("### Module recap", "$") },
      ],
    },
  ],
});

export default MODULE_2_BLOCKS;
