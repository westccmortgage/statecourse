/**
 * GENERATED FILE — Texas Principles of Real Estate I, Module 09 learning-block map.
 * Derived from the frozen module's own headings by scripts/generate-tx-principles-block-maps.mjs.
 * Learning objectives come from config/texas/principles-i-course.mjs's UNIT_OBJECTIVES (already
 * hand-authored, traced to read statute sections); the retrieval bank lives in
 * config/texas/principles-i-block-retrieval.mjs. Do not edit by hand — regenerate.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const MODULE_9_BLOCKS = Object.freeze({
  courseId: "tx-principles-real-estate-ii-30-v1",
  moduleId: "module-09",
  version: "1.0",
  contentPath: "/content/texas/tx-principles-real-estate-ii-30-v1/module-09.md",
  blocks: [
    {
      id: "t09u1", sequence: 1, required: true,
      code: "T09U1",
      title: "Property Management",
      learningObjective: "Identify the functions a Texas property manager performs, state from Occupations Code § 1101.002(1) which management acts are acts of a broker, apply the exemptions in § 1101.005 to decide whether a particular person managing a particular Texas property needs a license, and state the four trust-money grounds for discipline in § 1101.652(b)(9), (10), (30) and (31).",
      screens: [
        { id: "t09u1-s1", sequence: 1, type: "instruction", title: "Property Management", content: RANGE("^", "### Statute reading exercise: Who is outside Chapter 1101, and what does the trust-money rule actually say?") },
        { id: "t09u1-s2", sequence: 2, type: "practice", title: "Statute reading exercise: Who is outside Chapter 1101, and what does the trust-money rule actually say?", content: RANGE("### Statute reading exercise: Who is outside Chapter 1101, and what does the trust-money rule actually say?", "### Applied exercise: Does this person need a license?") },
        { id: "t09u1-s3", sequence: 3, type: "practice", title: "Applied exercise: Does this person need a license?", content: RANGE("### Applied exercise: Does this person need a license?", "## Unit: Management Considerations") },
        { id: "t09u1-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "t09u1-q1" },
      ],
    },
    {
      id: "t09u2", sequence: 2, required: true,
      code: "T09U2",
      title: "Management Considerations",
      learningObjective: "Identify the terms a management agreement must settle, explain why § 1101.652(b)(12) carves property management contracts out of the definite-termination-date requirement, compute effective gross income and net operating income from gross potential rent, vacancy and collection loss and operating expenses, and connect the Property Code ch. 92 repair duty to the design of a maintenance program.",
      screens: [
        { id: "t09u2-s1", sequence: 1, type: "instruction", title: "Management Considerations", content: RANGE("## Unit: Management Considerations", "### Applied exercise: Build the operating statement") },
        { id: "t09u2-s2", sequence: 2, type: "practice", title: "Applied exercise: Build the operating statement", content: RANGE("### Applied exercise: Build the operating statement", "## Unit: The Management Profession") },
        { id: "t09u2-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "t09u2-q1" },
      ],
    },
    {
      id: "t09u3", sequence: 3, required: true,
      code: "T09U3",
      title: "The Management Profession",
      learningObjective: "Distinguish the manager's fiduciary obligation to the owner from the statutory duties that ch. 92 owes the tenant, describe the asset types and career paths inside the management profession, and distinguish a voluntary professional designation from a legal requirement.",
      screens: [
        { id: "t09u3-s1", sequence: 1, type: "instruction", title: "The Management Profession", content: RANGE("## Unit: The Management Profession", "### Applied exercise: The instruction you should refuse") },
        { id: "t09u3-s2", sequence: 2, type: "practice", title: "Applied exercise: The instruction you should refuse", content: RANGE("### Applied exercise: The instruction you should refuse", "### Module recap") },
        { id: "t09u3-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "t09u3-q1" },
      ],
    },
    {
      id: "t9-recap", sequence: 4, required: true,
      title: "Module recap",
      screens: [
        { id: "t9-recap-s1", sequence: 1, type: "review", title: "Module recap", content: RANGE("### Module recap", "$") },
      ],
    },
  ],
});

export default MODULE_9_BLOCKS;
