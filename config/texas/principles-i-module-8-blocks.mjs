/**
 * GENERATED FILE — Texas Principles of Real Estate I, Module 08 learning-block map.
 * Derived from the frozen module's own headings by scripts/generate-tx-principles-block-maps.mjs.
 * Learning objectives come from config/texas/principles-i-course.mjs's UNIT_OBJECTIVES (already
 * hand-authored, traced to read statute sections); the retrieval bank lives in
 * config/texas/principles-i-block-retrieval.mjs. Do not edit by hand — regenerate.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const MODULE_8_BLOCKS = Object.freeze({
  courseId: "tx-principles-real-estate-i-30-v1",
  moduleId: "module-08",
  version: "1.0",
  contentPath: "/content/texas/tx-principles-real-estate-i-30-v1/module-08.md",
  blocks: [
    {
      id: "t08u1", sequence: 1, required: true,
      code: "T08U1",
      title: "Deed of Trust",
      learningObjective: "Explain the Texas deed-of-trust security device, the nonjudicial foreclosure procedure, and the notice and sale requirements of Property Code chapter 51.",
      screens: [
        { id: "t08u1-s1", sequence: 1, type: "instruction", title: "Deed of Trust", content: RANGE("^", "### Applied exercise: the seller who is four payments behind") },
        { id: "t08u1-s2", sequence: 2, type: "practice", title: "Applied exercise: the seller who is four payments behind", content: RANGE("### Applied exercise: the seller who is four payments behind", "### Statute reading exercise: pricing the deficiency fight") },
        { id: "t08u1-s3", sequence: 3, type: "practice", title: "Statute reading exercise: pricing the deficiency fight", content: RANGE("### Statute reading exercise: pricing the deficiency fight", "### Applied exercise: the timeline against the calendar") },
        { id: "t08u1-s4", sequence: 4, type: "practice", title: "Applied exercise: the timeline against the calendar", content: RANGE("### Applied exercise: the timeline against the calendar", "### Statute reading exercise: the first-Tuesday machine") },
        { id: "t08u1-s5", sequence: 5, type: "practice", title: "Statute reading exercise: the first-Tuesday machine", content: RANGE("### Statute reading exercise: the first-Tuesday machine", "## Unit: Real Estate Lien Note") },
        { id: "t08u1-s6", sequence: 6, type: "retrieval", title: "Retrieval check", questionId: "t08u1-q1" },
      ],
    },
    {
      id: "t08u2", sequence: 2, required: true,
      code: "T08U2",
      title: "Real Estate Lien Note",
      learningObjective: "Read a real estate lien note: parties, promise, interest, and the usury and home-loan regulation that bounds it; compute a level-payment amortisation.",
      screens: [
        { id: "t08u2-s1", sequence: 1, type: "instruction", title: "Real Estate Lien Note", content: RANGE("## Unit: Real Estate Lien Note", "### Applied exercise: reading a note's business terms") },
        { id: "t08u2-s2", sequence: 2, type: "practice", title: "Applied exercise: reading a note's business terms", content: RANGE("### Applied exercise: reading a note's business terms", "### Statute reading exercise: inside or outside the home-loan frame?") },
        { id: "t08u2-s3", sequence: 3, type: "practice", title: "Statute reading exercise: inside or outside the home-loan frame?", content: RANGE("### Statute reading exercise: inside or outside the home-loan frame?", "## Unit: FIRPTA Affidavit") },
        { id: "t08u2-s4", sequence: 4, type: "retrieval", title: "Retrieval check", questionId: "t08u2-q1" },
      ],
    },
    {
      id: "t08u3", sequence: 3, required: true,
      code: "T08U3",
      title: "FIRPTA Affidavit",
      learningObjective: "State when FIRPTA withholding applies to a disposition by a foreign person, the statutory rate, and the affidavit that relieves the buyer of withholding.",
      screens: [
        { id: "t08u3-s1", sequence: 1, type: "instruction", title: "FIRPTA Affidavit", content: RANGE("## Unit: FIRPTA Affidavit", "### Applied exercise: three closings, one statute") },
        { id: "t08u3-s2", sequence: 2, type: "practice", title: "Applied exercise: three closings, one statute", content: RANGE("### Applied exercise: three closings, one statute", "### Module recap") },
        { id: "t08u3-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "t08u3-q1" },
      ],
    },
    {
      id: "t8-recap", sequence: 4, required: true,
      title: "Module recap",
      screens: [
        { id: "t8-recap-s1", sequence: 1, type: "review", title: "Module recap", content: RANGE("### Module recap", "$") },
      ],
    },
  ],
});

export default MODULE_8_BLOCKS;
