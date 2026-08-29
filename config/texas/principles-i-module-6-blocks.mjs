/**
 * GENERATED FILE — Texas Principles of Real Estate I, Module 06 learning-block map.
 * Derived from the frozen module's own headings by scripts/generate-tx-principles-block-maps.mjs.
 * Learning objectives come from config/texas/principles-i-course.mjs's UNIT_OBJECTIVES (already
 * hand-authored, traced to read statute sections); the retrieval bank lives in
 * config/texas/principles-i-block-retrieval.mjs. Do not edit by hand — regenerate.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const MODULE_6_BLOCKS = Object.freeze({
  courseId: "tx-principles-real-estate-i-30-v1",
  moduleId: "module-06",
  version: "1.0",
  contentPath: "/content/texas/tx-principles-real-estate-i-30-v1/module-06.md",
  blocks: [
    {
      id: "t06u1", sequence: 1, required: true,
      code: "T06U1",
      title: "Contracts",
      learningObjective: "Define a contract and classify contracts as express or implied, bilateral or unilateral, executory or executed.",
      screens: [
        { id: "t06u1-s1", sequence: 1, type: "instruction", title: "Contracts", content: RANGE("^", "## Unit: Elements of a Contract") },
        { id: "t06u1-s2", sequence: 2, type: "retrieval", title: "Retrieval check", questionId: "t06u1-q1" },
      ],
    },
    {
      id: "t06u2", sequence: 2, required: true,
      code: "T06U2",
      title: "Elements of a Contract",
      learningObjective: "State the essential elements of an enforceable contract and apply the statute of frauds to real estate agreements.",
      screens: [
        { id: "t06u2-s1", sequence: 1, type: "instruction", title: "Elements of a Contract", content: RANGE("## Unit: Elements of a Contract", "### Applied exercise: the counteroffer chain") },
        { id: "t06u2-s2", sequence: 2, type: "practice", title: "Applied exercise: the counteroffer chain", content: RANGE("### Applied exercise: the counteroffer chain", "### Statute reading exercise: the writing requirement's edges") },
        { id: "t06u2-s3", sequence: 3, type: "practice", title: "Statute reading exercise: the writing requirement's edges", content: RANGE("### Statute reading exercise: the writing requirement's edges", "### Statute reading exercise: § 26.01's list, beyond the sale") },
        { id: "t06u2-s4", sequence: 4, type: "practice", title: "Statute reading exercise: § 26.01's list, beyond the sale", content: RANGE("### Statute reading exercise: § 26.01's list, beyond the sale", "## Unit: Breach of a Contract") },
        { id: "t06u2-s5", sequence: 5, type: "retrieval", title: "Retrieval check", questionId: "t06u2-q1" },
      ],
    },
    {
      id: "t06u3", sequence: 3, required: true,
      code: "T06U3",
      title: "Breach of a Contract",
      learningObjective: "Identify the remedies for breach and the limitation periods that govern contract and specific-performance claims.",
      screens: [
        { id: "t06u3-s1", sequence: 1, type: "instruction", title: "Breach of a Contract", content: RANGE("## Unit: Breach of a Contract", "### Statute reading exercise: the clock on the collapsed deal") },
        { id: "t06u3-s2", sequence: 2, type: "practice", title: "Statute reading exercise: the clock on the collapsed deal", content: RANGE("### Statute reading exercise: the clock on the collapsed deal", "## Unit: Real Estate Contracts for Sale") },
        { id: "t06u3-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "t06u3-q1" },
      ],
    },
    {
      id: "t06u4", sequence: 4, required: true,
      code: "T06U4",
      title: "Real Estate Contracts for Sale",
      learningObjective: "Walk a residential sale contract from offer to closing, applying the writing requirement and the seller's disclosure duty.",
      screens: [
        { id: "t06u4-s1", sequence: 1, type: "instruction", title: "Real Estate Contracts for Sale", content: RANGE("## Unit: Real Estate Contracts for Sale", "### Applied exercise: triage of a collapsed deal") },
        { id: "t06u4-s2", sequence: 2, type: "practice", title: "Applied exercise: triage of a collapsed deal", content: RANGE("### Applied exercise: triage of a collapsed deal", "## Unit: TREC Forms") },
        { id: "t06u4-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "t06u4-q1" },
      ],
    },
    {
      id: "t06u5", sequence: 5, required: true,
      code: "T06U5",
      title: "TREC Forms",
      learningObjective: "Explain when a licence holder must use a promulgated contract form, the statutory exceptions, and the boundary with the unauthorised practice of law.",
      screens: [
        { id: "t06u5-s1", sequence: 1, type: "instruction", title: "TREC Forms", content: RANGE("## Unit: TREC Forms", "### Applied exercise: triage at the special-provisions blank") },
        { id: "t06u5-s2", sequence: 2, type: "practice", title: "Applied exercise: triage at the special-provisions blank", content: RANGE("### Applied exercise: triage at the special-provisions blank", "### Applied exercise: whose paper is this?") },
        { id: "t06u5-s3", sequence: 3, type: "practice", title: "Applied exercise: whose paper is this?", content: RANGE("### Applied exercise: whose paper is this?", "### Module recap") },
        { id: "t06u5-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "t06u5-q1" },
      ],
    },
    {
      id: "t6-recap", sequence: 6, required: true,
      title: "Module recap",
      screens: [
        { id: "t6-recap-s1", sequence: 1, type: "review", title: "Module recap", content: RANGE("### Module recap", "$") },
      ],
    },
  ],
});

export default MODULE_6_BLOCKS;
