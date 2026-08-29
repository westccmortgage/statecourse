/**
 * GENERATED FILE — Texas Principles of Real Estate I, Module 05 learning-block map.
 * Derived from the frozen module's own headings by scripts/generate-tx-principles-block-maps.mjs.
 * Learning objectives come from config/texas/principles-i-course.mjs's UNIT_OBJECTIVES (already
 * hand-authored, traced to read statute sections); the retrieval bank lives in
 * config/texas/principles-i-block-retrieval.mjs. Do not edit by hand — regenerate.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const MODULE_5_BLOCKS = Object.freeze({
  courseId: "tx-principles-real-estate-ii-30-v1",
  moduleId: "module-05",
  version: "1.0",
  contentPath: "/content/texas/tx-principles-real-estate-ii-30-v1/module-05.md",
  blocks: [
    {
      id: "t05u1", sequence: 1, required: true,
      code: "T05U1",
      title: "Land-Use Controls",
      learningObjective: "Identify the statutory sources of public and private land-use control in Texas, distinguish a zoning restriction from a recorded restrictive covenant, and state where each is found.",
      screens: [
        { id: "t05u1-s1", sequence: 1, type: "instruction", title: "Land-Use Controls", content: RANGE("^", "### Statute reading exercise: The board of adjustment's variance power") },
        { id: "t05u1-s2", sequence: 2, type: "practice", title: "Statute reading exercise: The board of adjustment's variance power", content: RANGE("### Statute reading exercise: The board of adjustment's variance power", "### Applied exercise: The buyer whose plan is blocked") },
        { id: "t05u1-s3", sequence: 3, type: "practice", title: "Applied exercise: The buyer whose plan is blocked", content: RANGE("### Applied exercise: The buyer whose plan is blocked", "## Unit: Public Ownership") },
        { id: "t05u1-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "t05u1-q1" },
      ],
    },
    {
      id: "t05u2", sequence: 2, required: true,
      code: "T05U2",
      title: "Public Ownership",
      learningObjective: "Explain the framework by which government acquires and holds interests in private land, including condemnation, dedication, and the state's interest in water and navigable streams.",
      screens: [
        { id: "t05u2-s1", sequence: 1, type: "instruction", title: "Public Ownership", content: RANGE("## Unit: Public Ownership", "### Applied exercise: The offered park and the widened road") },
        { id: "t05u2-s2", sequence: 2, type: "practice", title: "Applied exercise: The offered park and the widened road", content: RANGE("### Applied exercise: The offered park and the widened road", "## Unit: Environmental Protection Legislation") },
        { id: "t05u2-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "t05u2-q1" },
      ],
    },
    {
      id: "t05u3", sequence: 3, required: true,
      code: "T05U3",
      title: "Environmental Protection Legislation",
      learningObjective: "Identify the environmental conditions a Texas seller's disclosure notice puts in issue and state the license holder's duty when a known condition affects a property.",
      screens: [
        { id: "t05u3-s1", sequence: 1, type: "instruction", title: "Environmental Protection Legislation", content: RANGE("## Unit: Environmental Protection Legislation", "### Module recap") },
        { id: "t05u3-s2", sequence: 2, type: "retrieval", title: "Retrieval check", questionId: "t05u3-q1" },
      ],
    },
    {
      id: "t5-recap", sequence: 4, required: true,
      title: "Module recap",
      screens: [
        { id: "t5-recap-s1", sequence: 1, type: "review", title: "Module recap", content: RANGE("### Module recap", "$") },
      ],
    },
  ],
});

export default MODULE_5_BLOCKS;
