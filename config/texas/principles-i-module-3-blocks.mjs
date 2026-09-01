/**
 * GENERATED FILE — Texas Principles of Real Estate I, Module 03 learning-block map.
 * Derived from the frozen module's own headings by scripts/generate-tx-principles-block-maps.mjs.
 * Learning objectives come from config/texas/principles-i-course.mjs's UNIT_OBJECTIVES (already
 * hand-authored, traced to read statute sections); the retrieval bank lives in
 * config/texas/principles-i-block-retrieval.mjs. Do not edit by hand — regenerate.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const MODULE_3_BLOCKS = Object.freeze({
  courseId: "tx-principles-real-estate-i-30-v1",
  moduleId: "module-03",
  version: "1.0",
  contentPath: "/content/texas/tx-principles-real-estate-i-30-v1/module-03.md",
  blocks: [
    {
      id: "t03u1", sequence: 1, required: true,
      code: "T03U1",
      title: "Historical Background",
      learningObjective: "Trace the development of property concepts from feudal tenure to allodial ownership as historical background for the modern estates system.",
      screens: [
        { id: "t03u1-s1", sequence: 1, type: "instruction", title: "Historical Background", content: RANGE("^", "## Unit: Estates in Land") },
        { id: "t03u1-s2", sequence: 2, type: "retrieval", title: "Retrieval check", questionId: "t03u1-q1" },
      ],
    },
    {
      id: "t03u2", sequence: 2, required: true,
      code: "T03U2",
      title: "Estates in Land",
      learningObjective: "Identify the freehold estates recognised in Texas, including the fee simple presumption and future estates.",
      screens: [
        { id: "t03u2-s1", sequence: 1, type: "instruction", title: "Estates in Land", content: RANGE("## Unit: Estates in Land", "### Applied exercise: what estate did the seller actually own?") },
        { id: "t03u2-s2", sequence: 2, type: "practice", title: "Applied exercise: what estate did the seller actually own?", content: RANGE("### Applied exercise: what estate did the seller actually own?", "## Unit: Encumbrances") },
        { id: "t03u2-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "t03u2-q1" },
      ],
    },
    {
      id: "t03u3", sequence: 3, required: true,
      code: "T03U3",
      title: "Encumbrances",
      learningObjective: "Define encumbrance, distinguish liens from non-possessory use rights, and classify common encumbrances by their effect on title and use.",
      screens: [
        { id: "t03u3-s1", sequence: 1, type: "instruction", title: "Encumbrances", content: RANGE("## Unit: Encumbrances", "### Applied exercise: the mowed strip and the gravel drive") },
        { id: "t03u3-s2", sequence: 2, type: "practice", title: "Applied exercise: the mowed strip and the gravel drive", content: RANGE("### Applied exercise: the mowed strip and the gravel drive", "### Statute reading exercise: the lien vocabulary") },
        { id: "t03u3-s3", sequence: 3, type: "practice", title: "Statute reading exercise: the lien vocabulary", content: RANGE("### Statute reading exercise: the lien vocabulary", "## Unit: Tax Liens") },
        { id: "t03u3-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "t03u3-q1" },
      ],
    },
    {
      id: "t03u4", sequence: 4, required: true,
      code: "T03U4",
      title: "Tax Liens",
      learningObjective: "State when the ad valorem tax lien attaches, its statutory priority, and its personal-liability counterpart.",
      screens: [
        { id: "t03u4-s1", sequence: 1, type: "instruction", title: "Tax Liens", content: RANGE("## Unit: Tax Liens", "### Statute reading exercise: ranking against the tax lien") },
        { id: "t03u4-s2", sequence: 2, type: "practice", title: "Statute reading exercise: ranking against the tax lien", content: RANGE("### Statute reading exercise: ranking against the tax lien", "## Unit: Liens other than Taxes") },
        { id: "t03u4-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "t03u4-q1" },
      ],
    },
    {
      id: "t03u5", sequence: 5, required: true,
      code: "T03U5",
      title: "Liens other than Taxes",
      learningObjective: "Distinguish voluntary from involuntary liens, and state how mechanic's and materialman's lien rights arise under the Property Code.",
      screens: [
        { id: "t03u5-s1", sequence: 1, type: "instruction", title: "Liens other than Taxes", content: RANGE("## Unit: Liens other than Taxes", "## Unit: Water Rights") },
        { id: "t03u5-s2", sequence: 2, type: "retrieval", title: "Retrieval check", questionId: "t03u5-q1" },
      ],
    },
    {
      id: "t03u6", sequence: 6, required: true,
      code: "T03U6",
      title: "Water Rights",
      learningObjective: "Explain state ownership of surface water and the appropriation-permit system that governs its use.",
      screens: [
        { id: "t03u6-s1", sequence: 1, type: "instruction", title: "Water Rights", content: RANGE("## Unit: Water Rights", "## Unit: Residence as a Homestead") },
        { id: "t03u6-s2", sequence: 2, type: "retrieval", title: "Retrieval check", questionId: "t03u6-q1" },
      ],
    },
    {
      id: "t03u7", sequence: 7, required: true,
      code: "T03U7",
      title: "Residence as a Homestead",
      learningObjective: "Apply the Texas urban and rural homestead definitions and the homestead tax exemptions as the statutes state them.",
      screens: [
        { id: "t03u7-s1", sequence: 1, type: "instruction", title: "Residence as a Homestead", content: RANGE("## Unit: Residence as a Homestead", "### Statute reading exercise: the two homesteads") },
        { id: "t03u7-s2", sequence: 2, type: "practice", title: "Statute reading exercise: the two homesteads", content: RANGE("### Statute reading exercise: the two homesteads", "### Applied exercise: reading a title commitment's Schedule of trouble") },
        { id: "t03u7-s3", sequence: 3, type: "practice", title: "Applied exercise: reading a title commitment's Schedule of trouble", content: RANGE("### Applied exercise: reading a title commitment's Schedule of trouble", "### Module recap") },
        { id: "t03u7-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "t03u7-q1" },
      ],
    },
    {
      id: "t3-recap", sequence: 8, required: true,
      title: "Module recap",
      screens: [
        { id: "t3-recap-s1", sequence: 1, type: "review", title: "Module recap", content: RANGE("### Module recap", "$") },
      ],
    },
  ],
});

export default MODULE_3_BLOCKS;
