/**
 * GENERATED FILE — Texas Law of Agency, Module 07 learning-block map.
 * Derived from the frozen module's own headings by scripts/generate-tx-law-of-agency-block-maps.mjs
 * at LOA-CONTENT-FREEZE-2026-08-30. Learning objectives come from
 * config/texas/law-of-agency-course.mjs's UNIT_OBJECTIVES, hand-authored one per LOA-1 unit.
 * The retrieval screens name question ids for a Law of Agency retrieval bank that does not exist
 * yet, so no block here is deliverable to a student. Do not edit by hand — regenerate.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const MODULE_7_BLOCKS = Object.freeze({
  courseId: "tx-law-of-agency-30-v1",
  moduleId: "module-07",
  version: "1.0",
  contentPath: "/content/texas/tx-law-of-agency-30-v1/module-07.md",
  blocks: [
    {
      id: "t07u1", sequence: 1, required: true,
      code: "T07U1",
      title: "How and When Agency is Created",
      learningObjective: "Fix the moment a Texas agency comes into existence under § 1101.557(a), separate the three writing requirements by the question each answers — § 1101.563 whether you may act, § 1101.806(c) whether you may sue for the fee, and Business & Commerce Code § 26.01 which promises the statute of frauds actually reaches — and explain why an agency created by conduct is a hazard rather than a technique, carrying full duties, no enforceable commission, and a § 1101.652(b)(34) count.",
      screens: [
        { id: "t07u1-s1", sequence: 1, type: "instruction", title: "How and When Agency is Created", content: RANGE("^", "## Unit: How Agency is Terminated") },
        { id: "t07u1-s2", sequence: 2, type: "retrieval", title: "Retrieval check", questionId: "t07u1-q1" },
      ],
    },
    {
      id: "t07u2", sequence: 2, required: true,
      code: "T07U2",
      title: "How Agency is Terminated",
      learningObjective: "List the events that end an agency and state for each what the held Texas sources do and do not establish — completion of the purpose, expiry of the definite termination date § 1101.652(b)(12) requires, mutual agreement, revocation and renunciation, death with the immediate vesting rule in Estates Code § 101.001, incapacity, destruction, bankruptcy, and suspension — and apply § 1101.367(a) to a sales agent's change of sponsorship, naming who must notify whom, in what form, when, and what happens to the licence.",
      screens: [
        { id: "t07u2-s1", sequence: 1, type: "instruction", title: "How Agency is Terminated", content: RANGE("## Unit: How Agency is Terminated", "### Applied exercise: Leaving Delgado & Finch") },
        { id: "t07u2-s2", sequence: 2, type: "practice", title: "Applied exercise: Leaving Delgado & Finch", content: RANGE("### Applied exercise: Leaving Delgado & Finch", "## Unit: Duties of Agency that Survive Termination") },
        { id: "t07u2-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "t07u2-q1" },
      ],
    },
    {
      id: "t07u3", sequence: 3, required: true,
      code: "T07U3",
      title: "Duties of Agency that Survive Termination",
      learningObjective: "State which duties survive the end of an agency and on what authority: confidentiality under § 1101.651(d)(3) with its three exceptions and the honest fact that no held source fixes a duration; the trust-money duties of 22 TAC § 535.146, including the second-working-day deposit, the thirty-day payment after a written demand, the thirty-day removal of money the broker has earned, and permissive interpleader; a contractual protection period, which is enforceable only through the signed writing § 1101.806(c) requires; and the four-year record clocks in 22 TAC §§ 535.146(e) and 535.2.",
      screens: [
        { id: "t07u3-s1", sequence: 1, type: "instruction", title: "Duties of Agency that Survive Termination", content: RANGE("## Unit: Duties of Agency that Survive Termination", "### Statute reading exercise: What § 1101.651(d) does and does not say") },
        { id: "t07u3-s2", sequence: 2, type: "practice", title: "Statute reading exercise: What § 1101.651(d) does and does not say", content: RANGE("### Statute reading exercise: What § 1101.651(d) does and does not say", "### Module recap") },
        { id: "t07u3-s3", sequence: 3, type: "retrieval", title: "Retrieval check", questionId: "t07u3-q1" },
      ],
    },
    {
      id: "t7-recap", sequence: 4, required: true,
      title: "Module recap",
      screens: [
        { id: "t7-recap-s1", sequence: 1, type: "review", title: "Module recap", content: RANGE("### Module recap", "## Optional reference: Optional trust-money practice after a terminated contract") },
      ],
    },
    {
      id: "t7-optional", sequence: 5, required: false, optional: true,
      title: "Optional trust-money practice after a terminated contract",
      nonBlocking: true,
      excludedFromRequiredTime: true,
      noAssessmentMayDependOnThis: true,
      screens: [
        { id: "t7-optional-s1", sequence: 1, type: "optional-reference", title: "Optional trust-money practice after a terminated contract", content: RANGE("## Optional reference: Optional trust-money practice after a terminated contract", "$") },
      ],
    },
  ],
});

export default MODULE_7_BLOCKS;
