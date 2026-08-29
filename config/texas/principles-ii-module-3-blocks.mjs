/**
 * GENERATED FILE — Texas Principles of Real Estate I, Module 03 learning-block map.
 * Derived from the frozen module's own headings by scripts/generate-tx-principles-block-maps.mjs.
 * Learning objectives come from config/texas/principles-i-course.mjs's UNIT_OBJECTIVES (already
 * hand-authored, traced to read statute sections); the retrieval bank lives in
 * config/texas/principles-i-block-retrieval.mjs. Do not edit by hand — regenerate.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const MODULE_3_BLOCKS = Object.freeze({
  courseId: "tx-principles-real-estate-ii-30-v1",
  moduleId: "module-03",
  version: "1.0",
  contentPath: "/content/texas/tx-principles-real-estate-ii-30-v1/module-03.md",
  blocks: [
    {
      id: "t03u1", sequence: 1, required: true,
      code: "T03U1",
      title: "Requirements to Become an Appraiser",
      learningObjective: "State, from Chapter 1103 of the Texas Occupations Code, who regulates appraisers in Texas, what credential categories the statute authorizes, and how the statute structures the education, experience and examination requirements.",
      screens: [
        { id: "t03u1-s1", sequence: 1, type: "instruction", title: "Requirements to Become an Appraiser", content: RANGE("^", "### Statute reading exercise: What Chapter 1103 does and does not tell you") },
        { id: "t03u1-s2", sequence: 2, type: "practice", title: "Statute reading exercise: What Chapter 1103 does and does not tell you", content: RANGE("### Statute reading exercise: What Chapter 1103 does and does not tell you", "## Unit: Key Appraisal Terms") },
        { id: "t03u1-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "t03u1-q1" },
      ],
    },
    {
      id: "t03u2", sequence: 2, required: true,
      code: "T03U2",
      title: "Key Appraisal Terms",
      learningObjective: "Define the core vocabulary of appraisal — market value, price, cost, highest and best use, the four characteristics of value, the three forms of depreciation, gross living area, comparable, and adjustment — and distinguish the terms that are commonly confused.",
      screens: [
        { id: "t03u2-s1", sequence: 1, type: "instruction", title: "Key Appraisal Terms", content: RANGE("## Unit: Key Appraisal Terms", "## Unit: Appraising & The Appraisal Process") },
        { id: "t03u2-s2", sequence: 2, type: "retrieval", title: "Retrieval check", questionId: "t03u2-q1" },
      ],
    },
    {
      id: "t03u3", sequence: 3, required: true,
      code: "T03U3",
      title: "Appraising & The Appraisal Process",
      learningObjective: "List the steps of the appraisal process in order and describe what the appraiser does at each step.",
      screens: [
        { id: "t03u3-s1", sequence: 1, type: "instruction", title: "Appraising & The Appraisal Process", content: RANGE("## Unit: Appraising & The Appraisal Process", "### Applied exercise: Ordering an appraisal on a Bastrop County property") },
        { id: "t03u3-s2", sequence: 2, type: "practice", title: "Applied exercise: Ordering an appraisal on a Bastrop County property", content: RANGE("### Applied exercise: Ordering an appraisal on a Bastrop County property", "## Unit: Value") },
        { id: "t03u3-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "t03u3-q1" },
      ],
    },
    {
      id: "t03u4", sequence: 4, required: true,
      code: "T03U4",
      title: "Value",
      learningObjective: "Explain the economic principles that drive value and identify each one at work in a Texas example.",
      screens: [
        { id: "t03u4-s1", sequence: 1, type: "instruction", title: "Value", content: RANGE("## Unit: Value", "## Unit: Three Approaches to Value") },
        { id: "t03u4-s2", sequence: 2, type: "retrieval", title: "Retrieval check", questionId: "t03u4-q1" },
      ],
    },
    {
      id: "t03u5", sequence: 5, required: true,
      code: "T03U5",
      title: "Three Approaches to Value",
      learningObjective: "Compute an indication of value under the sales comparison, cost and income approaches and explain which approach dominates in which assignment.",
      screens: [
        { id: "t03u5-s1", sequence: 1, type: "instruction", title: "Three Approaches to Value", content: RANGE("## Unit: Three Approaches to Value", "### Applied exercise: Capitalization and the effect of rate movement") },
        { id: "t03u5-s2", sequence: 2, type: "practice", title: "Applied exercise: Capitalization and the effect of rate movement", content: RANGE("### Applied exercise: Capitalization and the effect of rate movement", "## Unit: Pricing a Property") },
        { id: "t03u5-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "t03u5-q1" },
      ],
    },
    {
      id: "t03u6", sequence: 6, required: true,
      code: "T03U6",
      title: "Pricing a Property",
      learningObjective: "Prepare and communicate a price opinion for a seller within the boundary Occupations Code § 1101.002(1) draws between brokerage and appraisal.",
      screens: [
        { id: "t03u6-s1", sequence: 1, type: "instruction", title: "Pricing a Property", content: RANGE("## Unit: Pricing a Property", "### Statute reading exercise: The price opinion boundary") },
        { id: "t03u6-s2", sequence: 2, type: "practice", title: "Statute reading exercise: The price opinion boundary", content: RANGE("### Statute reading exercise: The price opinion boundary", "### Applied exercise: Pricing a listing in Round Rock") },
        { id: "t03u6-s3", sequence: 3, type: "practice", title: "Applied exercise: Pricing a listing in Round Rock", content: RANGE("### Applied exercise: Pricing a listing in Round Rock", "### Module recap") },
        { id: "t03u6-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "t03u6-q1" },
      ],
    },
    {
      id: "t3-recap", sequence: 7, required: true,
      title: "Module recap",
      screens: [
        { id: "t3-recap-s1", sequence: 1, type: "review", title: "Module recap", content: RANGE("### Module recap", "$") },
      ],
    },
  ],
});

export default MODULE_3_BLOCKS;
