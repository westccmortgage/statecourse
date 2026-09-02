/**
 * TREC Rules source lock — the provider and course-design rules, read from TREC's own published
 * Rules page.
 *
 * WHY THIS FILE EXISTS, AND WHAT IT DOES NOT CLAIM. The Texas Secretary of State's Appian TAC
 * portal serves only a JavaScript shell to a non-browser client and the legacy texreg reader
 * redirects to it; both were re-tested on 2026-08-29 and both still fail. The final adopted text
 * of §§535.62 and 535.65 is now held from the Secretary of State's 28 August 2026 Texas Register,
 * while the live TAC remains unread for the other provider sections. TX_PROVIDER_RULE_SOURCE_LOCK
 * therefore still FAILS; the gate is not weakened, bypassed, or reinterpreted here.
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
 * hash, so a later re-read is a diff rather than a memory. §§535.62 and 535.65 use the final adopted
 * Texas Register text; §§535.55, 535.63 and 535.64 retain the regulator-copy caveat. Nothing here
 * may be used to assert approval or submission readiness — see SUBMISSION_READINESS below.
 *
 * WHAT THE FIVE SECTIONS GOVERN. §535.55 is the sales-agent education requirement the six courses
 * exist to satisfy, and the rule that fixes Law of Agency at 30 credit hours — which is the
 * multiplicand in every per-hour assessment count below; §535.62 is course approval, and its
 * subsections (b)(7) and (b)(8) are the most design-determining provisions in the whole chapter —
 * (b)(7) fixes topic-quiz counts, scenario counts, distance-education progression gating and
 * incorrect-answer remediation, and (b)(8) fixes every final-examination number this project builds
 * to; §535.63 is instructor qualification; §535.64 adopts each course approval form BY REFERENCE,
 * which is what makes the PRINS2-1 and LOA-1 transcriptions compliance artefacts and not editorial
 * choices; §535.65 is provider operations, including the 70% unweighted passing score, version
 * rotation, examination confidentiality, identity validation, the subsequent-examination rules, the
 * four-year record retention term and the course completion record.
 *
 * TWO CORRECTIONS MADE ON 2026-08-30, BOTH AGAINST THE HELD TEXT.
 *   1. The guest-instructor 10% cap was recorded here as a provision of §535.63. It is not in the
 *      held §535.63 at all: it is §535.65(b)(5). It has been moved, because a rule citation that
 *      does not survive opening the file is exactly what this register exists to prevent.
 *   2. The final-examination numbers were described as §535.62(b)(7). (b)(7) is the
 *      comprehension-assessment paragraph — topic quizzes, scenarios, distance gating; the
 *      examination paragraph is (b)(8). See CROSS_REFERENCE_OBSERVATIONS: the rule's own
 *      cross-references disagree with each other on this point and that disagreement is recorded
 *      rather than silently resolved.
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
    "PARTIAL — final adopted Texas Register text is held for §§535.62 and 535.65; the live TAC portal remains unread for §§535.55, 535.63 and 535.64.",
});

/**
 * WHERE THE SUBSECTION LETTERING COMES FROM, AND WHERE IT DOES NOT.
 *
 * TREC's Rules page renders paragraph structure as INDENTATION and prints no subsection letters.
 * Citing a rule as "§535.62(b)(8)(D)(i)" off a page that never prints "(D)(i)" would be an
 * assertion dressed as a citation. It is not necessary here, because a HIGHER-tier copy of two of
 * these five sections has been opened: the Secretary of State's 28 August 2026 Texas Register
 * republishes the final adopted §§535.62 and 535.65 in full, WITH their lettering.
 *
 * The adoption notice says the Commission made only non-substantive reference-language changes to
 * §535.62(b)(6)(C) and §535.65(g)(5). The final text closes the former proposal-only gap, including
 * the rewritten completion-record subsection §535.65(j).
 *
 * For §§535.55, 535.63 and 535.64 no Secretary of State copy is held. Their lettering is this
 * file's reading of the TREC page's nesting, corroborated only by the rules' own internal
 * cross-references, and every provision drawn from them is labelled identifierBasis:
 * "held-page-nesting" so that a reader can tell the two situations apart.
 */
export const SUBSECTION_IDENTIFIER_SOURCE = Object.freeze({
  appliesTo: Object.freeze(["22 TAC §535.62", "22 TAC §535.65"]),
  authority: "Texas Secretary of State",
  title: "Texas Register, 28 August 2026 — Title 22 Examining Boards, Adopted Rules (TRD-202602955)",
  url: "https://www.sos.state.tx.us/texreg/archive/August282026/Adopted%20Rules/22.EXAMINING%20BOARDS.html",
  localCopy: "texas/trec-sources/texas-register/2026-08-28-title22-adopted-rules.html",
  sha256: "2a1d3fa727f592ce4f5066d322f446484528c3aaf36e7e2cc464abccddb74ace",
  bytes: 200345,
  readOn: "2026-09-02",
  comparedOn: "2026-09-02",
  tier: "TIER 3 — the Secretary of State's final adopted publication; current from 31 August 2026.",
  method:
    "Read from the final adopted publication, which republishes both sections in full and states that only non-substantive reference-language changes were made to §535.62(b)(6)(C) and §535.65(g)(5).",
  differences: Object.freeze([
    "§535.62(b)(6)(C) and §535.65(g)(5) contain non-substantive reference-language changes from the proposal.",
    "§535.65(j) is final: providers submit completion records through a Commission-acceptable process, no sooner than the course-credit-hour period has passed and no later than ten calendar days after completion; completions on or after 1 October 2026 carry the student's licence or application number.",
  ]),
  whatItDoesNotEstablish:
    "It does not supply the live codified text of §§535.55, 535.60, 535.61, 535.63, 535.64, 535.66, 535.67 or 535.101, and it is not evidence of TREC approval of StateCourse.",
});

/**
 * The rule's own cross-references do not agree with the rule's own numbering, and that is recorded
 * rather than tidied away. Both copies held — TREC's and the Secretary of State's — say the same
 * thing in the same words, so this is not a transcription artefact of either.
 */
export const CROSS_REFERENCE_OBSERVATIONS = Object.freeze([
  Object.freeze({
    id: "535-65-h-4-cites-b-7-for-examination-versions",
    observation:
      "§535.65(h)(4) requires a provider to 'rotate all versions of the examination required by §535.62(b)(7)'. In both held copies the paragraph that requires four versions of a final examination is §535.62(b)(8); (b)(7) is the comprehension-assessment paragraph. §535.65(i)(2), by contrast, cites §535.62(b)(8) for the subsequent examination, which matches the numbering.",
    handling:
      "This file cites the paragraph by the number it carries in the held text — (b)(8) for the examination requirements — and records the (h)(4) cross-reference as the rule states it. No attempt is made to decide which the Commission intends; the substance is identical either way, since (h)(4) can only be about the examination versions.",
    resolvedBy: "the codified text, which has not been read",
  }),
]);

const rule = (record) => Object.freeze({ ...record, provisions: Object.freeze(record.provisions.map((p) => Object.freeze(p))) });

/** Default for §§535.62 and 535.65: lettering and text read from the final adopted publication. */
const SOS = "sos-published-adopted-text-2026-08-28";
/** Lettering read off the indentation of TREC's own page, corroborated by internal cross-references. */
const NEST = "held-page-nesting";

export const RULES = Object.freeze([
  rule({
    section: "22 TAC §535.55",
    heading: "Education and Sponsorship Requirements for a Sales Agent License",
    localCopy: "texas/trec-sources/trec-rules/535.55.txt",
    sha256: "d5a8a6b9a97051109563e919f4cdf8d5b1615100e0c9a5dae44b96b30ce11204",
    bytes: 1205,
    governs:
      "Why the six 30-hour qualifying courses exist, what an initial sales agent applicant must complete, and — for assessment purposes — the credit-hour figure every per-hour count in ASSESSMENT_REQUIREMENTS is multiplied by.",
    provisions: [
      {
        id: "535-55-education-requirement",
        subsection: "535.55(a)",
        identifierBasis: NEST,
        text: "An applicant for an initial sales agent license must provide the Commission with satisfactory evidence of completion of 180 hours of qualifying real estate courses as required under the Act: 60 hours of Principles of Real Estate; 30 hours of Law of Agency; 30 hours of Law of Contracts; 30 hours of Promulgated Contracts Forms; and 30 hours of Real Estate Finance.",
        reliedOnBy: ["config/texas/regulatory-manifest.mjs PROGRAMS", "ASSESSMENT_REQUIREMENTS.creditHours"],
      },
      {
        id: "535-55-law-of-agency-30-hours",
        subsection: "535.55(a), second item in the list",
        identifierBasis: NEST,
        text: "'30 hours of Law of Agency' is the second item in the §535.55(a) list. The held page prints the list without paragraph numbers, so the item is identified by its position rather than cited as (a)(2).",
        reliedOnBy: ["ASSESSMENT_REQUIREMENTS.creditHours", "config/texas/law-of-agency-time-budget.mjs"],
      },
      {
        id: "535-55-additional-90-hours",
        subsection: "535.55(b)",
        identifierBasis: NEST,
        text: "A sales agent must successfully complete an additional 90 classroom hours in qualifying courses, including the 30 hour qualifying real estate brokerage course, by the expiration date of the sales agent's initial licensing period in accordance with §535.91.",
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
      "Course approval, and — in subsections (b)(7) and (b)(8) — every assessment number this project builds to. The lettering and current text are read from the Secretary of State's final 28 August 2026 Texas Register adoption.",
    provisions: [
      {
        id: "535-62-topic-coverage",
        subsection: "535.62(b)(1)-(2)",
        identifierBasis: SOS,
        text: "A course must cover all topics and units for the course subject required by the Act, Chapter 1102 and this chapter, and must cover all units within the prescribed topic.",
        reliedOnBy: ["config/texas/principles-ii-course-form.mjs", "config/texas/law-of-agency-course-form.mjs", "deliverable:prins2-coverage-matrix"],
      },
      {
        id: "535-62-hours-evidence",
        subsection: "535.62(b)(3)",
        identifierBasis: SOS,
        text: "A course must contain sufficient content to satisfy the number of hours for which credit is being requested as evidenced by (A) word count studies, (B) samples of student time studies, or (C) other methods acceptable to the Commission.",
        reliedOnBy: ["deliverable:prins2-time-evidence", "config/texas/law-of-agency-time-budget.mjs"],
      },
      {
        id: "535-62-full-clock-hours",
        subsection: "535.62(b)(4)",
        identifierBasis: SOS,
        text: "A course will be scheduled for the full clock hours of time for which credit is awarded and presented in full hourly units.",
        reliedOnBy: ["deliverable:prins2-delivery-controls", "config/texas/law-of-agency-time-budget.mjs"],
      },
      {
        id: "535-62-daily-segment-cap",
        subsection: "535.62(b)(5)",
        identifierBasis: SOS,
        text: "A course may not have daily course segments that exceed 12 hours.",
        reliedOnBy: ["deliverable:prins2-delivery-controls"],
      },
      {
        id: "535-62-delivery-methods",
        subsection: "535.62(b)(6)",
        identifierBasis: SOS,
        text: "A course will be delivered by one of the following delivery methods: (A) classroom delivery; (B) distance education delivery; or (C) a combination of (A) and (B), if at least 50% of the combined course is offered by classroom delivery.",
        reliedOnBy: ["deliverable:prins2-delivery-controls"],
      },
      {
        id: "535-62-topic-quizzes",
        subsection: "535.62(b)(7)(A)",
        identifierBasis: SOS,
        text: "A course must include, at a minimum, topic quizzes with at least three questions related to the subject matter in each course topic.",
        reliedOnBy: ["deliverable:prins2-topic-quizzes", "ASSESSMENT_REQUIREMENTS.minQuestionsPerTopicQuiz"],
      },
      {
        id: "535-62-scenario-exercises",
        subsection: "535.62(b)(7)(B)",
        identifierBasis: SOS,
        text: "A course must include at least one scenario-based learning exercise per every increment of 10 credit hours or less. (For a 30-hour course this is three.)",
        reliedOnBy: ["deliverable:prins2-scenarios", "ASSESSMENT_REQUIREMENTS.minScenarioExercises"],
      },
      {
        id: "535-62-distance-progression-gate",
        subsection: "535.62(b)(7)(C)(i)",
        identifierBasis: SOS,
        text: "If delivered by distance education, the course must prevent the student from moving from one topic to the next until the student answers all topic quiz questions correctly and receives a passing grade on the scenario-based learning exercises.",
        reliedOnBy: ["deliverable:prins2-progression-gate"],
      },
      {
        id: "535-62-incorrect-answer-remediation",
        subsection: "535.62(b)(7)(C)(ii)",
        identifierBasis: SOS,
        text: "For quiz questions answered incorrectly, the course must employ a method to present the rationale behind the correct answer and ask a subsequent related quiz question that will count toward passing the topic if answered correctly.",
        reliedOnBy: ["deliverable:prins2-replacement-questions", "config/texas-block-engine.mjs deriveBlockStatus"],
      },
      {
        id: "535-62-four-exam-versions",
        subsection: "535.62(b)(8)",
        identifierBasis: SOS,
        text: "A course must include at least four versions of a final examination.",
        reliedOnBy: ["deliverable:prins2-exam-versions", "ASSESSMENT_REQUIREMENTS.minExamVersions"],
      },
      {
        id: "535-62-exam-version-topic-coverage",
        subsection: "535.62(b)(8)(A)",
        identifierBasis: SOS,
        text: "Each version of the examination must cover each topic required by the Act or Rules for the specific course.",
        reliedOnBy: ["deliverable:prins2-exam-versions"],
      },
      {
        id: "535-62-no-true-false",
        subsection: "535.62(b)(8)(B)",
        identifierBasis: SOS,
        text: "No version of the examination may contain any true/false questions.",
        reliedOnBy: ["deliverable:prins2-exam-versions", "ASSESSMENT_REQUIREMENTS.trueFalsePermitted"],
      },
      {
        id: "535-62-one-third-overlap-cap",
        subsection: "535.62(b)(8)(C)",
        identifierBasis: SOS,
        text: "No version of the examination may repeat more than one third of the questions from other versions of the final examination.",
        reliedOnBy: ["deliverable:prins2-exam-versions", "ASSESSMENT_REQUIREMENTS.maxCrossVersionOverlapFraction"],
      },
      {
        id: "535-62-exam-size",
        subsection: "535.62(b)(8)(D)(i)",
        identifierBasis: SOS,
        text: "For all qualifying courses other than a real estate math course, each examination version consists of at least two questions per credit course hour. (For a 30-hour course this is 60 questions.)",
        reliedOnBy: ["deliverable:prins2-exam-versions", "ASSESSMENT_REQUIREMENTS.minQuestionsPerExamVersion"],
      },
      {
        id: "535-62-bank-size",
        subsection: "535.62(b)(8)(D)(ii)",
        identifierBasis: SOS,
        text: "For all qualifying courses other than a real estate math course, the examination draws from a question bank consisting of at least four questions per credit course hour. (For a 30-hour course this is 120 questions.)",
        reliedOnBy: ["deliverable:prins2-exam-bank", "ASSESSMENT_REQUIREMENTS.minExamBankQuestions"],
      },
      {
        id: "535-62-math-course-exception-not-applicable",
        subsection: "535.62(b)(8)(E)",
        identifierBasis: SOS,
        text: "For all qualifying real estate math courses, the examination consists of at least 20 questions drawn from a question bank of at least 40. NOT APPLICABLE to Principles of Real Estate I or II, Law of Agency, or any other course this project builds: recorded so that the 60/120 figures are visibly the figures for a non-math course rather than an unexplained choice between two rules.",
        reliedOnBy: [],
      },
      {
        id: "535-62-approval-before-offering",
        subsection: "535.62(g)(1)-(2)",
        identifierBasis: SOS,
        text: "A qualifying provider shall not offer qualifying education courses until the provider has received written notice of the approval from the Commission; a qualifying course expires four years from the date of approval.",
        reliedOnBy: ["SUBMISSION_READINESS"],
      },
    ],
  }),
  rule({
    section: "22 TAC §535.63",
    heading: "Qualifications for Instructors of Qualifying Courses",
    localCopy: "texas/trec-sources/trec-rules/535.63.txt",
    sha256: "ac9a7c94371acffc8938f43203d7d18ec74f0c75e53bba992b8a4e8777c686a4",
    bytes: 1368,
    governs:
      "Who may teach a qualifying course. NOT the guest-instructor cap, which is §535.65(b)(5) and is recorded there: the held §535.63 does not mention guest instructors at all.",
    provisions: [
      {
        id: "535-63-instructor-competence",
        subsection: "535.63(a)",
        identifierBasis: NEST,
        text: "A provider must ensure that an instructor who teaches real estate, easement or right-of-way, or real estate inspection qualifying courses is competent in the subject matter to be taught and has the ability to teach effectively.",
        reliedOnBy: ["deliverable:instructor-dossier", "texas/submission/instructor-qualification-dossier-checklist.md"],
      },
      {
        id: "535-63-qualification-routes",
        subsection: "535.63(b)(1)-(3)",
        identifierBasis: NEST,
        text: "Except as provided by subsection (c), the provider must use an instructor who possesses one of: (1) a college degree in the subject area to be taught and three years of experience in teaching or training; (2) five years of active experience as a license holder (broker for Real Estate Brokerage and Broker Responsibility courses) and three years of experience in teaching or training; or (3) the equivalent of (b)(1) or (2) as determined by the provider after consideration of the instructor's professional experience, research, authorship, or other significant endeavors. The rule's own text cites 'subsection (b)(1) or (2) of this section', which is what fixes this lettering.",
        reliedOnBy: ["deliverable:instructor-dossier", "texas/submission/instructor-qualification-dossier-checklist.md"],
      },
      {
        id: "535-63-inspector-instructors-not-applicable",
        subsection: "535.63(c)",
        identifierBasis: NEST,
        text: "For Texas Standards of Practice or Inspector Legal and Ethics and Standards of Practice Review, the instructor must have five years of active licensure as a Texas professional inspector plus 200 inspections or three years of teaching/sponsoring experience. NOT APPLICABLE to any real estate qualifying course this project builds.",
        reliedOnBy: [],
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
      "The rule that adopts each course approval form BY REFERENCE. This is what makes a course-form transcription a compliance artefact rather than an editorial summary, and it is what §535.62(b)(8)(A)'s 'each topic required by the Act or Rules' resolves to for a given course.",
    provisions: [
      {
        id: "535-64-prins2-adopted-by-reference",
        subsection: "535.64(a), second item in the mandatory list",
        identifierBasis: NEST,
        text: "Principles of Real Estate II shall contain the topics and units outlined in the PRINS 2-1, Qualifying Real Estate Course Approval Form, Principles of Real Estate II, hereby adopted by reference.",
        reliedOnBy: ["config/texas/principles-ii-course-form.mjs"],
      },
      {
        id: "535-64-prins1-adopted-by-reference",
        subsection: "535.64(a), first item in the mandatory list",
        identifierBasis: NEST,
        text: "Principles of Real Estate I shall contain the topics and units outlined in the PRINS 1-1 form, hereby adopted by reference.",
        reliedOnBy: ["config/texas/prins1-course-form.mjs"],
      },
      {
        id: "535-64-loa-adopted-by-reference",
        subsection: "535.64(a), third item in the mandatory list",
        identifierBasis: NEST,
        text: "Law of Agency shall contain the topics and units outlined in the LOA-1, Qualifying Real Estate Course Approval Form, Law of Agency, hereby adopted by reference.",
        reliedOnBy: ["config/texas/law-of-agency-course-form.mjs"],
      },
      {
        id: "535-64-remaining-mandatory-courses",
        subsection: "535.64(a)",
        identifierBasis: NEST,
        text: "Law of Contracts (LOC-0), Promulgated Contract Forms (PCF-0) and Real Estate Finance (REF-0) are likewise adopted by reference, as is Real Estate Brokerage (REB-1) for a broker's licence.",
        reliedOnBy: ["config/texas/regulatory-manifest.mjs PROGRAMS", "config/texas/law-of-contracts-course-form.mjs"],
      },
      {
        id: "535-64-forms-available-from-commission",
        subsection: "535.64(c)",
        identifierBasis: NEST,
        text: "All forms adopted by this section are available from the Texas Real Estate Commission at www.trec.texas.gov.",
        reliedOnBy: [],
      },
    ],
  }),
  rule({
    section: "22 TAC §535.65",
    heading: "Responsibilities and Operations of Providers of Qualifying Courses",
    localCopy: "texas/trec-sources/trec-rules/535.65.txt",
    sha256: "fbaeedb3904d6bac666948d58a523a3762ac639617d44df7db2cbbf79b2c65e7",
    bytes: 16135,
    governs:
      "Provider operations: examination administration, confidentiality, passing score, version rotation, identity validation, the subsequent-examination rules, record retention and the course completion record. The lettering and current text are read from the Secretary of State's final 28 August 2026 Texas Register adoption.",
    provisions: [
      {
        id: "535-65-provider-responsibilities",
        subsection: "535.65(a)(1)(A)-(I)",
        identifierBasis: SOS,
        text: "A provider is responsible for (A) the administration of each course, including compliance with any prescribed period of time for any required course topics; (B) maintaining student attendance records and pre-enrollment agreements; (C) verifying instructor qualification, performance and attendance; (D) proper examination administration; (E) validation of student identity acceptable to the Commission; (F) maintaining student course completion records; (G) advertising compliance; (H) preventing recruitment or solicitation during course presentation; and (I) ensuring staff is reasonably available for public inquiry and assistance.",
        reliedOnBy: ["texas/submission/distance-delivery-controls.md", "deliverable:prins2-identity-verification"],
      },
      {
        id: "535-65-qualified-instructor",
        subsection: "535.65(b)(1)",
        identifierBasis: SOS,
        text: "Except as provided by this subsection, a provider must use an instructor that is currently qualified under §535.63 to teach the specified course.",
        reliedOnBy: ["deliverable:instructor-dossier"],
      },
      {
        id: "535-65-guest-instructor-cap",
        subsection: "535.65(b)(5)",
        identifierBasis: SOS,
        text: "A provider may use the services of a guest instructor who does not meet the instructor qualifications under §535.63 for qualifying real estate, easement or right-of-way, or inspector courses provided that person instructs for no more than 10% of the total course time. (Recorded here, not under §535.63: the held §535.63 does not contain this cap.)",
        reliedOnBy: ["deliverable:instructor-dossier"],
      },
      {
        id: "535-65-pre-enrollment-agreement",
        subsection: "535.65(d)(1)(A)-(H)",
        identifierBasis: SOS,
        text: "The pre-enrollment agreement must state the tuition; an itemized list of fees for supplies, materials or books; the refund policy including dismissal and voluntary withdrawal; (D) the attendance requirements; (E) acceptable makeup procedures including time limits and fees; (F) the procedure and fees, if applicable, associated with exam proctoring; (G) the procedure and fees for any permitted makeup final examination or re-examination including time limits; and (H) the §53.152 Texas Occupations Code criminal-history notices.",
        reliedOnBy: ["texas/submission/pre-enrollment-agreement.md"],
      },
      {
        id: "535-65-course-materials",
        subsection: "535.65(f)(1)-(2)",
        identifierBasis: SOS,
        text: "Before the course starts a provider shall give each student copies of, or online access to, any materials to be used for the course, and shall update course materials to keep the information current and accurate as provided for under §535.62.",
        reliedOnBy: ["deliverable:prins2-delivery-controls"],
      },
      {
        id: "535-65-classroom-delivery-controls",
        subsection: "535.65(g)(1)(B)-(C)",
        identifierBasis: SOS,
        text: "For classroom delivery the provider must verify the identification of each student at sign up and at each subsequent meeting, ensure the student is present for the hours of time for which credit is awarded, provide a 10 minute break per hour at least every two hours, and not have daily course segments that exceed 12 hours; and where such a course is delivered through the use of technology to more than 20 registered students, the provider will also use a monitor to verify identification, monitor active participation and facilitate questions.",
        reliedOnBy: ["deliverable:prins2-delivery-controls"],
      },
      {
        id: "535-65-classroom-makeup",
        subsection: "535.65(g)(1)(D)",
        identifierBasis: SOS,
        text: "A provider may permit a student who attends at least two-thirds of an originally scheduled qualifying course to complete a staff-approved makeup session, no later than the 90th day after completion of the original course; a student who attends less than two-thirds is not eligible and is automatically dropped with no credit.",
        reliedOnBy: ["deliverable:prins2-delivery-controls"],
      },
      {
        id: "535-65-distance-delivery-controls",
        subsection: "535.65(g)(2)(A)-(D)",
        identifierBasis: SOS,
        text: "For distance education delivery the provider must ensure that (A) the student taking all topics of the course and completing all quizzes and exercises is the student receiving credit, through a student identity verification process acceptable to the Commission; (B) a qualified instructor is available to answer questions or provide assistance in a timely manner; (C) a student has completed all instructional modules and attended any required hours of live instruction; and (D) a qualified instructor is responsible for providing answers and rationale for the grading of the course work.",
        reliedOnBy: ["texas/submission/distance-delivery-controls.md", "deliverable:prins2-identity-verification"],
      },
      {
        id: "535-65-topic-order-and-unit-times",
        subsection: "535.65(g)(3)-(5)",
        identifierBasis: SOS,
        text: "A provider is not required to present topics in the order outlined on the course approval form; the periods of time prescribed to each UNIT of a topic on the form are recommendations and may be altered; but all units must be presented within the prescribed topic. (The topic-level allocation is therefore the binding one and the unit-level minutes are not.)",
        reliedOnBy: ["config/texas/law-of-agency-time-budget.mjs", "deliverable:prins2-time-evidence"],
      },
      {
        id: "535-65-exam-as-approved",
        subsection: "535.65(h)(1)",
        identifierBasis: SOS,
        text: "The final examination given at the end of each course must be given in the manner submitted to and approved by the Commission.",
        reliedOnBy: ["deliverable:prins2-exam-engine", "SUBMISSION_READINESS"],
      },
      {
        id: "535-65-exam-confidentiality-and-difference",
        subsection: "535.65(h)(2)",
        identifierBasis: SOS,
        text: "Final examination questions must be kept confidential and be significantly different from any quiz questions and exercises used in the course.",
        reliedOnBy: ["deliverable:prins2-exam-bank", "ASSESSMENT_REQUIREMENTS.finalExamItemsMustDifferFromCourseQuizItems"],
      },
      {
        id: "535-65-no-early-exam-access",
        subsection: "535.65(h)(3)",
        identifierBasis: SOS,
        text: "A provider shall not permit a student to view or take a final examination before the completion of regular course work and any makeup sessions required by this section.",
        reliedOnBy: ["deliverable:prins2-exam-engine"],
      },
      {
        id: "535-65-passing-score-and-rotation",
        subsection: "535.65(h)(4)",
        identifierBasis: SOS,
        text: "A provider must rotate all versions of the examination required by §535.62(b)(7) throughout the approval period for a course in a manner acceptable to the Commission, and must require an unweighted passing score of 70%. (The cross-reference is the rule's own; the four-versions requirement carries the number (b)(8) in both held copies — see CROSS_REFERENCE_OBSERVATIONS.)",
        reliedOnBy: ["deliverable:prins2-exam-engine", "ASSESSMENT_REQUIREMENTS.passingScorePercent", "ASSESSMENT_REQUIREMENTS.passingScoreWeighting"],
      },
      {
        id: "535-65-exam-conditions",
        subsection: "535.65(h)(5)",
        identifierBasis: SOS,
        text: "A provider must administer the examination under conditions that ensure the student taking the examination is the student who registered for and took the course.",
        reliedOnBy: ["deliverable:prins2-identity-verification"],
      },
      {
        id: "535-65-subsequent-examination",
        subsection: "535.65(i)(1)-(3)",
        identifierBasis: SOS,
        text: "If a student fails a final course examination, a provider may permit a subsequent final examination only after the student has completed any additional course work prescribed by the provider; the student shall complete it no later than the 90th day after the date the original class concludes; it must be a DIFFERENT VERSION of the original final examination and must comply with §535.62(b)(8) and subsection (h); and a student who fails to complete it in time is automatically dropped from the course with no credit.",
        reliedOnBy: ["deliverable:prins2-exam-engine", "ASSESSMENT_REQUIREMENTS.subsequentExamDeadlineDays", "ASSESSMENT_REQUIREMENTS.subsequentExamMustBeADifferentVersion"],
      },
      {
        id: "535-65-no-credit-after-second-failure",
        subsection: "535.65(h)(6) and (i)(4)",
        identifierBasis: SOS,
        text: "A provider may not give credit to a student who fails a final examination and a subsequent final examination; a student who fails the final course examination a second time is required to retake the course and the final course examination.",
        reliedOnBy: ["deliverable:prins2-exam-engine", "ASSESSMENT_REQUIREMENTS.examAttemptsBeforeCourseRetake"],
      },
      {
        id: "535-65-historical-completion-certificate-fields",
        subsection: "535.65(j)",
        identifierBasis: "historical-trec-copy-superseded-2026-08-31",
        text: "HISTORICAL ONLY: the older TREC-published copy required a course completion certificate issued to the student. It was superseded by the final adopted §535.65(j) effective 31 August 2026 and may not drive a new completion workflow.",
        reliedOnBy: [],
      },
      {
        id: "535-65-completion-record-amendment",
        subsection: "535.65(j)",
        identifierBasis: SOS,
        text: "FINAL ADOPTED TEXT, effective 31 August 2026: the subsection is named 'Course completion records'; the provider must submit completion records to the Commission using a process acceptable to the Commission not sooner than the number of course credit hours has passed and not later than the 10th calendar day after a course is completed; the record carries the student's name; and for qualifying courses completed on or after 1 October 2026 it must carry the student's Commission-issued licence number or, if none has issued, the student's application number.",
        reliedOnBy: ["deliverable:tx-completion-record"],
      },
      {
        id: "535-65-evaluations",
        subsection: "535.65(k)(1)-(5)",
        identifierBasis: SOS,
        text: "A provider shall give each student an instructor and course evaluation form (or a link to an online version) completable any time after course completion; the instructor may not be present or involved; the provider shall use all of the questions from the Commission-approved evaluation form in the same order, may add its own questions after them, shall keep management comments with its records, and shall produce the forms for inspection at the Commission's request.",
        reliedOnBy: ["deliverable:prins2-delivery-controls"],
      },
      {
        id: "535-65-record-retention",
        subsection: "535.65(l)(1)",
        identifierBasis: SOS,
        text: "A provider shall maintain records of each student enrolled in a course for a minimum of four years following completion of the course, including course and instructor evaluations and student enrollment agreements.",
        reliedOnBy: ["deliverable:prins2-delivery-controls", "ASSESSMENT_REQUIREMENTS.studentRecordRetentionYears"],
      },
    ],
  }),
]);

/* ── the design numbers this project builds to, DERIVED from the held rule text rather than asserted ── */
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
  finalExamItemsMustDifferFromCourseQuizItems: true,
  subsequentExamMustBeADifferentVersion: true,
  subsequentExamDeadlineDays: 90,
  examAttemptsBeforeCourseRetake: 2,
  studentRecordRetentionYears: 4,
  sourceIds: Object.freeze([
    "535-55-law-of-agency-30-hours",
    "535-62-topic-quizzes",
    "535-62-scenario-exercises",
    "535-62-four-exam-versions",
    "535-62-exam-size",
    "535-62-bank-size",
    "535-62-one-third-overlap-cap",
    "535-62-no-true-false",
    "535-65-exam-confidentiality-and-difference",
    "535-65-passing-score-and-rotation",
    "535-65-subsequent-examination",
    "535-65-no-credit-after-second-failure",
    "535-65-record-retention",
  ]),
});

/**
 * EVERY VALUE ABOVE, TIED TO THE SENTENCE THAT PRODUCES IT — and, where nothing produces it, said so.
 *
 * The assessment build is validated against ASSESSMENT_REQUIREMENTS, so a wrong value propagates
 * straight into an exam bank. A bare number cannot be checked; a number with the subsection and the
 * held sentence beside it can. `derivation` is the honest part:
 *
 *   "rule-stated"        — the held text states this value in these words.
 *   "rule-arithmetic"    — the held text states a rate; this is that rate times the credit hours
 *                          §535.55 fixes for the course. The arithmetic is shown.
 *   "statecourse-policy" — NOT a regulator-derived figure. A StateCourse choice, named as one.
 *
 * Each entry was re-verified against the file on disk on 2026-08-30. Verification means the sentence
 * was read in texas/trec-sources/trec-rules/*.txt, not that the codified 22 TAC was read: it was not.
 */
export const ASSESSMENT_REQUIREMENT_PROVENANCE = Object.freeze({
  creditHours: Object.freeze({
    value: 30,
    derivation: "rule-stated",
    subsection: "535.55(a), second item in the list",
    heldText: "30 hours of Law of Agency",
    note: "For Law of Agency. Principles of Real Estate is 60 hours across PRINS 1-1 and PRINS 2-1, each course 30. The LENGTH of a credit hour is not stated anywhere in §§535.55, 535.62, 535.63, 535.64 or 535.65; LOA-1 itself prescribes 1,500 minutes for 30 hours, which is the form's 50-minute hour, and the words-per-minute rates in the time budget are StateCourse methodology.",
  }),
  minQuestionsPerTopicQuiz: Object.freeze({
    value: 3,
    derivation: "rule-stated",
    subsection: "535.62(b)(7)(A)",
    heldText: "topic quizzes, with at least three questions related to the subject matter in each course topic",
    note: "PER COURSE TOPIC, not per unit and not per module. For a 12-topic course the floor is 36 quiz items.",
  }),
  minScenarioExercises: Object.freeze({
    value: 3,
    derivation: "rule-arithmetic",
    subsection: "535.62(b)(7)(B)",
    heldText: "at least one scenario-based learning exercise per every increment of 10 credit hours or less",
    arithmetic: "ceil(30 credit hours / 10) = 3",
  }),
  minExamVersions: Object.freeze({
    value: 4,
    derivation: "rule-stated",
    subsection: "535.62(b)(8)",
    heldText: "include at least four versions of a final examination",
  }),
  minQuestionsPerExamVersion: Object.freeze({
    value: 60,
    derivation: "rule-arithmetic",
    subsection: "535.62(b)(8)(D)(i)",
    heldText: "consists of at least two questions per credit course hour",
    arithmetic: "30 credit hours x 2 = 60",
    note: "The math-course alternative in (b)(8)(E) — 20 questions from a bank of 40 — does not apply to any course this project builds.",
  }),
  minExamBankQuestions: Object.freeze({
    value: 120,
    derivation: "rule-arithmetic",
    subsection: "535.62(b)(8)(D)(ii)",
    heldText: "draws from a question bank consisting of at least four questions per credit course hour",
    arithmetic: "30 credit hours x 4 = 120",
  }),
  maxCrossVersionOverlapFraction: Object.freeze({
    value: 1 / 3,
    derivation: "rule-stated",
    subsection: "535.62(b)(8)(C)",
    heldText: "does not repeat more than one third of the questions from other versions of the final examination",
    openInterpretation:
      "THE FRACTION IS THE RULE'S; HOW IT IS MEASURED IS NOT. The held text does not say whether the cap is measured PAIRWISE (no two versions share more than one third) or against the UNION of all other versions (no version repeats more than one third of its questions from the other three combined). The union reading is far stricter: four 60-question versions can satisfy the pairwise reading while sharing every question with some other version. The Principles I build used the pairwise reading. Any build that adopts a reading must state which one it adopted and label it a StateCourse interpretation, not a regulator-derived rule.",
  }),
  passingScorePercent: Object.freeze({
    value: 70,
    derivation: "rule-stated",
    subsection: "535.65(h)(4)",
    heldText: "must require an unweighted passing score of 70%",
  }),
  passingScoreWeighting: Object.freeze({
    value: "unweighted",
    derivation: "rule-stated",
    subsection: "535.65(h)(4)",
    heldText: "an unweighted passing score of 70%",
    note: "Unweighted means every item counts once. A blueprint that weights topics in SELECTION is unaffected; a scorer that weights items is not permitted.",
  }),
  trueFalsePermitted: Object.freeze({
    value: false,
    derivation: "rule-stated",
    subsection: "535.62(b)(8)(B)",
    heldText: "does not contain any true/false questions",
    note: "The prohibition is stated for the final examination versions. It says nothing about topic quizzes; avoiding true/false in the formative bank as well is a StateCourse choice, not this rule.",
  }),
  finalExamItemsMustDifferFromCourseQuizItems: Object.freeze({
    value: true,
    derivation: "rule-stated",
    subsection: "535.65(h)(2)",
    heldText: "Final examination questions must be kept confidential and be significantly different from any quiz questions and exercises used in the course.",
    note: "'Significantly different' is not quantified by the rule. No numeric similarity threshold may be presented as regulator-derived; a threshold a build adopts is a StateCourse policy choice.",
  }),
  subsequentExamMustBeADifferentVersion: Object.freeze({
    value: true,
    derivation: "rule-stated",
    subsection: "535.65(i)(2)",
    heldText: "The subsequent final examination must be a different version of the original final examination given to the student and must comply with §535.62(b)(8) of this subchapter and subsection (h) of this section.",
  }),
  subsequentExamDeadlineDays: Object.freeze({
    value: 90,
    derivation: "rule-stated",
    subsection: "535.65(i)(2)",
    heldText: "A student shall complete the subsequent final examination no later than the 90th day after the date the original class concludes.",
    note: "§535.65(i)(3): failure to complete it in time drops the student from the course with no credit. §535.65(i)(1) also requires the provider to prescribe additional course work before a subsequent attempt; the CONTENT of that remediation is left to the provider and is a StateCourse design choice.",
  }),
  examAttemptsBeforeCourseRetake: Object.freeze({
    value: 2,
    derivation: "rule-stated",
    subsection: "535.65(h)(6) and (i)(4)",
    heldText: "A provider may not give credit to a student who fails a final examination and a subsequent final examination ... A student who fails the final course examination a second time is required to retake the course and the final course examination.",
    note: "Two graded attempts per course enrolment: the original and one subsequent. No held provision permits a third.",
  }),
  studentRecordRetentionYears: Object.freeze({
    value: 4,
    derivation: "rule-stated",
    subsection: "535.65(l)(1)",
    heldText: "A provider shall maintain records of each student enrolled in a course for a minimum of four years following completion of the course, including course and instructor evaluations and student enrollment agreements.",
    note: "This is a MINIMUM stated by the rule itself. Any earlier note in this repository deriving four years from the provider approval term in the fee schedule was reasoning from the wrong document; the term is stated here.",
  }),
});

/**
 * What an assessment build must do that CANNOT be reduced to a number, recorded so it is not lost
 * between a numeric requirement table and a rule nobody re-reads.
 */
export const ASSESSMENT_REQUIREMENTS_NOT_NUMERIC = Object.freeze([
  Object.freeze({ subsection: "535.62(b)(8)(A)", requirement: "Each examination version covers each topic required by the Act or Rules for the specific course — for a course adopted by reference under §535.64, that is every topic on its approval form." }),
  Object.freeze({ subsection: "535.62(b)(7)(C)(i)", requirement: "Distance delivery must prevent a student moving from one topic to the next until every topic quiz question is answered correctly and the scenario exercises are passed." }),
  Object.freeze({ subsection: "535.62(b)(7)(C)(ii)", requirement: "An incorrect quiz answer must produce the rationale for the correct answer and a subsequent related question that counts toward passing the topic." }),
  Object.freeze({ subsection: "535.65(h)(1)", requirement: "The final examination must be given in the manner submitted to and approved by the Commission — so no examination may be administered before that approval exists." }),
  Object.freeze({ subsection: "535.65(h)(3)", requirement: "No student may view or take the final examination before completing the regular course work." }),
  Object.freeze({ subsection: "535.65(h)(4)", requirement: "All versions must be ROTATED throughout the approval period in a manner acceptable to the Commission — holding four versions is not enough; serving one of them repeatedly would not comply." }),
  Object.freeze({ subsection: "535.65(h)(5) with (g)(2)(A)", requirement: "The examination must be administered under conditions ensuring the examinee is the enrolled student, and distance delivery needs a student identity verification process acceptable to the Commission. NOTE WHAT IS NOT THERE: no held provision requires a human proctor for a distance-education final examination. §535.65(d)(1)(F) requires the pre-enrollment agreement to disclose proctoring procedure and fees 'if applicable', and §535.65(g)(1)(C) requires a monitor only for classroom courses delivered through technology to more than 20 registered students. Anything stronger than identity assurance is a provider choice." }),
  Object.freeze({ subsection: "535.65(g)(2)(D)", requirement: "A qualified instructor must be responsible for providing answers and rationale for the grading of the course work — automated grading does not remove the named instructor." }),
]);

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
    provisionsHeld: RULES.reduce((total, entry) => total + entry.provisions.length, 0),
    missing: Object.freeze(missing.map((entry) => entry.section)),
    codifiedTextRead: false,
    finalAdoptedTextHeldFor: Object.freeze(["22 TAC §535.62", "22 TAC §535.65"]),
    doesNotSatisfy: "TX_PROVIDER_RULE_SOURCE_LOCK because the remaining live TAC sections and current application fields are still unresolved",
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
  finalAdoptedTexasRegisterTextHeldFor: Object.freeze(["22 TAC §535.62", "22 TAC §535.65"]),
  enrollmentPermitted: false,
  texasCreditAvailable: false,
  note:
    "Final adopted Texas Register text is held for §§535.62 and 535.65, but the remaining live TAC sections and the current provider application fields are unresolved; TX_PROVIDER_RULE_SOURCE_LOCK still FAILS. Nothing in this project may be described as TREC-approved, and no Texas qualifying credit may be offered unless and until written TREC approval exists.",
});

if (SUBMISSION_READINESS.trecApprovalHeld || SUBMISSION_READINESS.texasCreditAvailable) {
  throw new Error("trec-rules-source-lock: approval and credit flags must remain false until written TREC approval exists");
}

/* ── invariants: a requirement without provenance, or provenance without a provision, is a defect ── */
{
  const provisionsById = new Map(RULES.flatMap((entry) => entry.provisions.map((p) => [p.id, { ...p, section: entry.section }])));

  const missingSource = ASSESSMENT_REQUIREMENTS.sourceIds.filter((id) => !provisionsById.has(id));
  if (missingSource.length) {
    throw new Error(`trec-rules-source-lock: ASSESSMENT_REQUIREMENTS names provision id(s) no rule carries: ${missingSource.join(", ")}`);
  }

  const requirementKeys = Object.keys(ASSESSMENT_REQUIREMENTS).filter((key) => key !== "sourceIds");
  const provenanceKeys = Object.keys(ASSESSMENT_REQUIREMENT_PROVENANCE);
  const unprovenanced = requirementKeys.filter((key) => !provenanceKeys.includes(key));
  if (unprovenanced.length) {
    throw new Error(
      `trec-rules-source-lock: ASSESSMENT_REQUIREMENTS value(s) with no provenance record: ${unprovenanced.join(", ")}. ` +
        "State the subsection and the held sentence, or label the value a StateCourse policy choice.",
    );
  }
  const orphanProvenance = provenanceKeys.filter((key) => !requirementKeys.includes(key));
  if (orphanProvenance.length) {
    throw new Error(`trec-rules-source-lock: provenance recorded for value(s) that do not exist: ${orphanProvenance.join(", ")}`);
  }
  for (const key of provenanceKeys) {
    const record = ASSESSMENT_REQUIREMENT_PROVENANCE[key];
    if (record.value !== ASSESSMENT_REQUIREMENTS[key]) {
      throw new Error(`trec-rules-source-lock: provenance for '${key}' records ${String(record.value)} but the requirement is ${String(ASSESSMENT_REQUIREMENTS[key])}`);
    }
    if (!["rule-stated", "rule-arithmetic", "statecourse-policy"].includes(record.derivation)) {
      throw new Error(`trec-rules-source-lock: provenance for '${key}' has no valid derivation`);
    }
    if (record.derivation !== "statecourse-policy" && !record.heldText) {
      throw new Error(`trec-rules-source-lock: provenance for '${key}' claims a rule derivation without quoting the held sentence`);
    }
  }

  /* Every subsection a provenance record cites must be one a registered provision carries, so the
     numbers and the rule text cannot drift apart. */
  const toSubsectionLetter = (citation) => (citation.match(/^\d+\.\d+\([a-z]\)/) ?? [citation])[0];
  const heldSubsections = new Set([...provisionsById.values()].map((p) => toSubsectionLetter(p.subsection)));
  const uncited = provenanceKeys
    .map((key) => ASSESSMENT_REQUIREMENT_PROVENANCE[key].subsection)
    .filter((subsection) => subsection && !heldSubsections.has(toSubsectionLetter(subsection)));
  if (uncited.length) {
    throw new Error(`trec-rules-source-lock: provenance cites subsection(s) no registered provision carries: ${[...new Set(uncited)].join(", ")}`);
  }

  const unlabelled = [...provisionsById.values()].filter((p) => !p.subsection || !p.identifierBasis);
  if (unlabelled.length) {
    throw new Error(`trec-rules-source-lock: provision(s) without a subsection identifier and its basis: ${unlabelled.map((p) => p.id).join(", ")}`);
  }
}

export default Object.freeze({
  SOURCE,
  SUBSECTION_IDENTIFIER_SOURCE,
  CROSS_REFERENCE_OBSERVATIONS,
  RULES,
  ASSESSMENT_REQUIREMENTS,
  ASSESSMENT_REQUIREMENT_PROVENANCE,
  ASSESSMENT_REQUIREMENTS_NOT_NUMERIC,
  trecRulesSourceLock,
  SUBMISSION_READINESS,
});
