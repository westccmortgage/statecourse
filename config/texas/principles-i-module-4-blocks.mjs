/**
 * GENERATED FILE — Texas Principles of Real Estate I, Module 04 learning-block map.
 * Derived from the frozen module's own headings by scripts/generate-tx-principles-block-maps.mjs.
 * Learning objectives come from config/texas/principles-i-course.mjs's UNIT_OBJECTIVES (already
 * hand-authored, traced to read statute sections); the retrieval bank lives in
 * config/texas/principles-i-block-retrieval.mjs. Do not edit by hand — regenerate.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const MODULE_4_BLOCKS = Object.freeze({
  courseId: "tx-principles-real-estate-i-30-v1",
  moduleId: "module-04",
  version: "1.0",
  contentPath: "/content/texas/tx-principles-real-estate-i-30-v1/module-04.md",
  blocks: [
    {
      id: "t04u1", sequence: 1, required: true,
      code: "T04U1",
      title: "Methods of Describing Real Estate in Texas",
      learningObjective: "Describe the metes-and-bounds, subdivision-plat and abstract systems used to describe Texas land, and state when a plat must be recorded.",
      screens: [
        { id: "t04u1-s1", sequence: 1, type: "instruction", title: "Methods of Describing Real Estate in Texas", content: RANGE("^", "### Applied exercise: walking the two-acre tract") },
        { id: "t04u1-s2", sequence: 2, type: "practice", title: "Applied exercise: walking the two-acre tract", content: RANGE("### Applied exercise: walking the two-acre tract", "## Unit: Surveying") },
        { id: "t04u1-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "t04u1-q1" },
      ],
    },
    {
      id: "t04u2", sequence: 2, required: true,
      code: "T04U2",
      title: "Surveying",
      learningObjective: "Explain the surveyor's role, the licensing framework for surveying, and the historical Spanish units encountered in Texas descriptions.",
      screens: [
        { id: "t04u2-s1", sequence: 1, type: "instruction", title: "Surveying", content: RANGE("## Unit: Surveying", "### Statute reading exercise: the plat statute's closed loophole") },
        { id: "t04u2-s2", sequence: 2, type: "practice", title: "Statute reading exercise: the plat statute's closed loophole", content: RANGE("### Statute reading exercise: the plat statute's closed loophole", "### Applied exercise: three descriptions, three verdicts") },
        { id: "t04u2-s3", sequence: 3, type: "practice", title: "Applied exercise: three descriptions, three verdicts", content: RANGE("### Applied exercise: three descriptions, three verdicts", "### Applied exercise: the five-acre carve-out") },
        { id: "t04u2-s4", sequence: 4, type: "practice", title: "Applied exercise: the five-acre carve-out", content: RANGE("### Applied exercise: the five-acre carve-out", "### Module recap") },
        { id: "t04u2-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "t04u2-q1" },
      ],
    },
    {
      id: "t4-recap", sequence: 3, required: true,
      title: "Module recap",
      screens: [
        { id: "t4-recap-s1", sequence: 1, type: "review", title: "Module recap", content: RANGE("### Module recap", "$") },
      ],
    },
  ],
});

export default MODULE_4_BLOCKS;
