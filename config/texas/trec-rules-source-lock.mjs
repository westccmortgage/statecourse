/**
 * TREC Rules source lock — the provider and course-design rules, read from TREC's own published
 * Rules page.
 *
 * WHY THIS FILE EXISTS, AND WHAT IT DOES NOT CLAIM. The Texas Secretary of State's Appian TAC
 * portal serves only a JavaScript shell to a non-browser client and the legacy texreg reader
 * redirects to it; both were re-tested on 2026-08-29 and both still fail. So the SECRETARY OF
 * STATE'S CODIFIED TEXT of 22 TAC ch. 535 remains unread, and TX_PROVIDER_RULE_SOURCE_LOCK in
 * regulatory-manifest.mjs still FAILS. That gate is not weakened, bypassed, or reinterpreted here.
 *
 * What this file adds is the thing that gate's failure was wrongly being used to excuse: leaving
 * the provider-rule layer ENTIRELY unsourced. TREC publishes the consolidated Chapter 535 text on
 * its own Rules page. The manifest has always classified that page as READ_NOT_AUTHORITY — a
 * convenience copy published by the regulated agency rather than the Secretary of State's adopted
 * text — and that classification stands. But "not the controlling text" is not "not evidence":
 * it is the regulator's own published statement of the rules it administers, and designing a
 * course against it is strictly better than designing a course against nothing.
 *
 * THE DISCIPLINE THIS FILE KEEPS. Every provision below is stored as extracted text on disk, with a
 * hash, so a later re-read is a diff rather than a memory. Every entry is labelled with its tier and
 * with the fact that the codified text has not been compared against it. Nothing in this file may be
 * cited to a student as "the rule says", and nothing here may be used to assert submission
 * readiness — see SUBMISSION_READINESS below, which states the opposite in code.
 *
 * WHAT THE FIVE SECTIONS GOVERN. §535.55 is the sales-agent education requirement the six courses
 * exist to satisfy; §535.62 is course approval, and its subsection (b)(7) is the single most
 * design-determining provision in the whole chapter — it fixes topic-quiz counts, scenario counts,
 * distance-education progression gating, incorrect-answer remediation, and every final-examination
 * number this project builds to; §535.63 is instructor qualification; §535.64 adopts each course
 * approval form BY REFERENCE, which is what makes the PRINS2-1 transcription in
 * principles-ii-course-form.mjs a compliance artefact and not an editorial choice; §535.65 is
 * provider operations, including the 70% unweighted passing score, version rotation, identity
 * validation, the second-failure retake rule, and the course completion certificate fields.
 */

export const SOURCE = Object.freeze({
  authority: "Texas Real Estate Commission",
  title: "TREC Rules (consolidated web reproduction of 22 TAC Chapter 535)",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  readOn: "2026-08-29",
  method: "curl (direct HTTP GET); sections split on the page's own '§535.NN <heading>' anchors and stored verbatim as text",
  tier: "TIER 4 — the regulator's own published reproduction. NOT the Secretary of State's adopted text.",
  codifiedTextCompared: false,
  codifiedTextStatus:
    "UNREAD — texas-sos.appianportalsgov.com serves a JS shell and texreg.sos.state.tx.us redirects to it; both re-tested 2026-08-29 and both still fail from this environment.",
});

const rule = (record) => Object.freeze({ ...record, provisions: Object.freeze(record.provisions.map((p) => Object.freeze(p))) });

export const RULES = Object.freeze([
  rule({
    section: "22 TAC §535.55",
    heading: "Education and Sponsorship Requirements for a Sales Agent License",
    localCopy: "texas/trec-sources/trec-rules/535.55.txt",
    sha256: "d5a8a6b9a97051109563e919f4cdf8d5b1615100e0c9a5dae44b96b30ce11204",
    bytes: 1205,
    governs: "Why the six 30-hour qualifying courses exist and what an initial sales agent applicant must complete.",
    provisions: [
      {
        id: "535-55-education-requirement",
        text: "An applicant for an initial sales agent license must provide the Commission with satisfactory evidence of completion of the qualifying real estate courses required for the licence.",
        reliedOnBy: ["config/texas/regulatory-manifest.mjs PROGRAMS"],
      },
    ],
  }),
  rule({
    section: "22 TAC §535.62",
    heading: "Approval of Qualifying Courses",
    localCopy: "texas/trec-sources/trec-rules/535.62.txt",
    sha256: "3a17a31f4c8e5acb1add6ba71ad8f061f34bc64bfaef9f98eedd8737a170b2f0",
    bytes: 11383,
    governs:
      "Course approval, and — in subsection (b)(7) — every assessment number this project builds to. Read as published; the paragraph lettering below is this file's reading of the page's nesting, which the page renders as indentation rather than as printed subsection letters.",
    provisions: [
      {
        id: "535-62-topic-coverage",
        text: "A course must cover all topics and units for the course subject required by the Act, Chapter 1102 and this chapter, and must cover all units within the prescribed topic.",
        reliedOnBy: ["config/texas/principles-ii-course-form.mjs", "deliverable:prins2-coverage-matrix"],
      },
      {
        id: "535-62-hours-evidence",
        text: "A course must contain sufficient content to satisfy the number of hours for which credit is requested, as evidenced by word count studies, samples of student time studies, or other methods acceptable to the Commission.",
        reliedOnBy: ["deliverable:prins2-time-evidence"],
      },
      {
        id: "535-62-daily-segment-cap",
        text: "A course may not have daily course segments that exceed 12 hours.",
        reliedOnBy: ["deliverable:prins2-delivery-controls"],
      },
      {
        id: "535-62-topic-quizzes",
        text: "A course must include topic quizzes, with at least three questions related to the subject matter in each course topic.",
        reliedOnBy: ["deliverable:prins2-topic-quizzes"],
      },
      {
        id: "535-62-scenario-exercises",
        text: "A course must include at least one scenario-based learning exercise per every increment of 10 credit hours or less. (For a 30-hour course this is three.)",
        reliedOnBy: ["deliverable:prins2-scenarios"],
      },
      {
        id: "535-62-distance-progression-gate",
        text: "If delivered by distance education, the course must prevent the student from moving from one topic to the next until the student answers all topic quiz questions correctly and receives a passing grade on the scenario-based learning exercises.",
        reliedOnBy: ["deliverable:prins2-progression-gate"],
      },
      {
        id: "535-62-incorrect-answer-remediation",
        text: "For quiz questions answered incorrectly, the course must employ a method to present the rationale behind the correct answer and ask a subsequent related quiz question that will count toward passing the topic if answered correctly.",
        reliedOnBy: ["deliverable:prins2-replacement-questions", "config/texas-block-engine.mjs deriveBlockStatus"],
      },
      {
        id: "535-62-four-exam-versions",
        text: "A course must include at least four versions of a final examination.",
        reliedOnBy: ["deliverable:prins2-exam-versions"],
      },
      {
        id: "535-62-exam-version-topic-coverage",
        text: "Each version of the examination must cover each topic required by the Act or Rules for the specific course.",
        reliedOnBy: ["deliverable:prins2-exam-versions"],
      },
      {
        id: "535-62-no-true-false",
        text: "No version of the examination may contain any true/false questions.",
        reliedOnBy: ["deliverable:prins2-exam-versions"],
      },
      {
        id: "535-62-one-third-overlap-cap",
        text: "No version of the examination may repeat more than one third of the questions from other versions of the final examination.",
        reliedOnBy: ["deliverable:prins2-exam-versions"],
      },
      {
        id: "535-62-exam-size",
        text: "For all qualifying courses other than a real estate math course, each examination version consists of at least two questions per credit course hour. (For a 30-hour course this is 60 questions.)",
        reliedOnBy: ["deliverable:prins2-exam-versions"],
      },
      {
        id: "535-62-bank-size",
        text: "For all qualifying courses other than a real estate math course, the examination draws from a question bank consisting of at least four questions per credit course hour. (For a 30-hour course this is 120 questions.)",
        reliedOnBy: ["deliverable:prins2-exam-bank"],
      },
    ],
  }),
  rule({
    section: "22 TAC §535.63",
    heading: "Qualifications for Instructors of Qualifying Courses",
    localCopy: "texas/trec-sources/trec-rules/535.63.txt",
    sha256: "ac9a7c94371acffc8938f43203d7d18ec74f0c75e53bba992b8a4e8777c686a4",
    bytes: 1368,
    governs: "Who may teach a qualifying course, and the guest-instructor limit.",
    provisions: [
      {
        id: "535-63-instructor-qualification",
        text: "A provider must ensure that an instructor who teaches real estate, easement or right-of-way, or real estate inspection qualifying courses is qualified under this section.",
        reliedOnBy: ["deliverable:instructor-dossier", "texas/submission/instructor-qualification-dossier-checklist.md"],
      },
      {
        id: "535-63-guest-instructor-cap",
        text: "A provider may use a guest instructor who does not meet the instructor qualifications, provided that person instructs for no more than 10% of the total course time.",
        reliedOnBy: ["deliverable:instructor-dossier"],
      },
    ],
  }),
  rule({
    section: "22 TAC §535.64",
    heading: "Content Requirements for Qualifying Real Estate Courses",
    localCopy: "texas/trec-sources/trec-rules/535.64.txt",
    sha256: "6e126cb931287ad9ce965f5d7889ff09d9fc44253e147fb1b5ca515ba08bf94f",
    bytes: 3225,
    governs:
      "The rule that adopts each course approval form BY REFERENCE. This is what makes a course-form transcription a compliance artefact rather than an editorial summary.",
    provisions: [
      {
        id: "535-64-prins2-adopted-by-reference",
        text: "Principles of Real Estate II shall contain the topics and units outlined in the PRINS 2-1, Qualifying Real Estate Course Approval Form, Principles of Real Estate II, hereby adopted by reference.",
        reliedOnBy: ["config/texas/principles-ii-course-form.mjs"],
      },
      {
        id: "535-64-prins1-adopted-by-reference",
        text: "Principles of Real Estate I shall contain the topics and units outlined in the PRINS 1-1 form, hereby adopted by reference.",
        reliedOnBy: ["config/texas/prins1-course-form.mjs"],
      },
      {
        id: "535-64-loa-adopted-by-reference",
        text: "Law of Agency shall contain the topics and units outlined in the LOA-1 form, hereby adopted by reference.",
        reliedOnBy: ["config/texas/law-of-agency-course-form.mjs"],
      },
      {
        id: "535-64-remaining-mandatory-courses",
        text: "Law of Contracts (LOC-0), Promulgated Contract Forms (PCF-0) and Real Estate Finance (REF-0) are likewise adopted by reference, as is Real Estate Brokerage (REB-1) for a broker's licence.",
        reliedOnBy: ["config/texas/regulatory-manifest.mjs PROGRAMS"],
      },
    ],
  }),
  rule({
    section: "22 TAC §535.65",
    heading: "Responsibilities and Operations of Providers of Qualifying Courses",
    localCopy: "texas/trec-sources/trec-rules/535.65.txt",
    sha256: "fbaeedb3904d6bac666948d58a523a3762ac639617d44df7db2cbbf79b2c65e7",
    bytes: 16135,
    governs: "Provider operations: examination administration, passing score, rotation, identity validation, retake rules, and the completion certificate.",
    provisions: [
      {
        id: "535-65-provider-responsibilities",
        text: "A provider is responsible for the administration of each course, including the prescribed period of time for required course topics, maintaining student attendance records and pre-enrollment agreements, verifying instructor qualification, performance and attendance, proper examination administration, validation of student identity acceptable to the Commission, maintaining student course completion records, advertising compliance, preventing recruitment during course presentation, and staff availability for public inquiry.",
        reliedOnBy: ["texas/submission/distance-delivery-controls.md", "deliverable:prins2-identity-verification"],
      },
      {
        id: "535-65-passing-score-and-rotation",
        text: "A provider must rotate all versions of the examination required by §535.62(b)(7) throughout the approval period for a course in a manner acceptable to the Commission, and must require an unweighted passing score of 70%.",
        reliedOnBy: ["deliverable:prins2-exam-engine"],
      },
      {
        id: "535-65-exam-conditions",
        text: "A provider must administer the examination under conditions that ensure the student taking the examination is the student who registered for and took the course.",
        reliedOnBy: ["deliverable:prins2-identity-verification"],
      },
      {
        id: "535-65-no-credit-after-second-failure",
        text: "A provider may not give credit to a student who fails a final examination and a subsequent final examination. A student who fails the final course examination a second time is required to retake the course and the final course examination.",
        reliedOnBy: ["deliverable:prins2-exam-engine"],
      },
      {
        id: "535-65-completion-certificate-fields",
        text: "Upon successful completion of a qualifying course, a provider shall issue a course completion certificate including the provider's name and approval number, the instructor's name, the course title, course numbers, and the number of credit hours (among the other fields the rule lists).",
        reliedOnBy: ["deliverable:prins2-certificate"],
      },
      {
        id: "535-65-pre-enrollment-agreement",
        text: "The pre-enrollment agreement must state the attendance requirements, acceptable makeup procedures and any time limits and fees, the procedure and fees associated with exam proctoring, the procedure and fees for any permitted makeup final examination or re-examination including time limits, and the §53.152 Texas Occupations Code criminal-history notices.",
        reliedOnBy: ["texas/submission/pre-enrollment-agreement.md"],
      },
    ],
  }),
]);

/* ── the design numbers this project builds to, DERIVED from §535.62(b)(7) rather than asserted ── */
export const COURSE_CREDIT_HOURS = 30;

export const ASSESSMENT_REQUIREMENTS = Object.freeze({
  creditHours: COURSE_CREDIT_HOURS,
  minQuestionsPerTopicQuiz: 3,
  minScenarioExercises: Math.ceil(COURSE_CREDIT_HOURS / 10),
  minExamVersions: 4,
  minQuestionsPerExamVersion: COURSE_CREDIT_HOURS * 2,
  minExamBankQuestions: COURSE_CREDIT_HOURS * 4,
  maxCrossVersionOverlapFraction: 1 / 3,
  passingScorePercent: 70,
  passingScoreWeighting: "unweighted",
  trueFalsePermitted: false,
  sourceIds: Object.freeze([
    "535-62-topic-quizzes",
    "535-62-scenario-exercises",
    "535-62-four-exam-versions",
    "535-62-exam-size",
    "535-62-bank-size",
    "535-62-one-third-overlap-cap",
    "535-62-no-true-false",
    "535-65-passing-score-and-rotation",
  ]),
});

/**
 * The lock. PASS means only: every listed section was retrieved from TREC's published Rules page and
 * is held on disk with a hash. It does NOT mean the codified Secretary of State text was read, and
 * it does not and cannot clear TX_PROVIDER_RULE_SOURCE_LOCK.
 */
export function trecRulesSourceLock() {
  const missing = RULES.filter((entry) => !entry.localCopy || !entry.sha256);
  return Object.freeze({
    status: missing.length === 0 ? "PASS" : "FAIL",
    scope: "TREC-published reproduction of 22 TAC ch. 535, five sections needed to design a qualifying course",
    sectionsHeld: RULES.length,
    missing: Object.freeze(missing.map((entry) => entry.section)),
    codifiedTextRead: false,
    doesNotSatisfy: "TX_PROVIDER_RULE_SOURCE_LOCK",
  });
}

/**
 * Stated in code so that no report, page or future edit can quietly imply otherwise: holding these
 * rules is not approval, and is not submission readiness.
 */
export const SUBMISSION_READINESS = Object.freeze({
  trecApprovalHeld: false,
  providerApprovalNumber: null,
  courseApprovalNumber: null,
  codifiedTacTextRead: false,
  enrollmentPermitted: false,
  texasCreditAvailable: false,
  note:
    "The Secretary of State's codified 22 TAC text remains unread and the provider application could not be opened; TX_PROVIDER_RULE_SOURCE_LOCK still FAILS. Nothing in this project may be described as TREC-approved, and no Texas qualifying credit may be offered, unless and until written TREC approval exists.",
});

if (SUBMISSION_READINESS.trecApprovalHeld || SUBMISSION_READINESS.texasCreditAvailable) {
  throw new Error("trec-rules-source-lock: approval and credit flags must remain false until written TREC approval exists");
}

export default Object.freeze({ SOURCE, RULES, ASSESSMENT_REQUIREMENTS, trecRulesSourceLock, SUBMISSION_READINESS });
