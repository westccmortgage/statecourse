/**
 * FREC Course I — end-of-course examination architecture, in three tiers that are never mixed.
 *
 * WHY THREE TIERS. The first version of this build collapsed a regulatory ambiguity into a single
 * number and wrote it into a config as though it were law. It picked 126 items on the reasoning
 * that 126 was the largest floor any reading produced, and therefore the safe one. Safe is not the
 * same as required, and a config value carries no adverb: six months later nobody remembers that
 * 126 was a judgement call, and the judgement has quietly become "Florida requires 126".
 *
 * So every number below sits in exactly one of three tiers, and the tier is part of the value:
 *
 *   REGULATORY_MINIMUM_CONFIRMED  — primary authority affirmatively establishes it. Quote available,
 *                                   no interpretation needed. Changing it means the law changed.
 *   STATECOURSE_CONSERVATIVE_POLICY — a provider choice StateCourse makes, usually to be safe across
 *                                   more than one defensible reading. Changing it is a business
 *                                   decision, not a compliance event.
 *   OPEN_DBPR_QUESTION            — genuinely unresolved on the face of the authorities. Carries the
 *                                   readings, what StateCourse does pending an answer, and the
 *                                   question to ask.
 *
 * THE EXAMINATION SENTENCE, QUOTED EXACTLY, BECAUSE THE PUNCTUATION IS THE WHOLE ARGUMENT:
 *
 *     "The sales associate end-of-course examinations shall contain at least 100 items, or 2 items
 *     per instruction hour."
 *
 * And, two sentences earlier in the same paragraph, the broker equivalent:
 *
 *     "The broker end-of-course examinations shall contain at least 95 items, of which 5 items are
 *     2 points each, which shall cover closing statements or escrow accounts, or 2 items per
 *     instruction hour."
 *
 * THE BROKER SENTENCE IS WHAT SETTLES THE READING, AND IT WAS MISSED THE FIRST TIME. The Broker
 * course is 72 hours, so "2 items per instruction hour" is at least 144 — against a stated floor of
 * 95. The Course I numbers run the same way: 100 stated, 120 or 126 by the multiplier. In BOTH
 * sentences the flat number is well below the per-hour number. If the rule meant the per-hour figure
 * to govern, the flat numbers would be dead letters in both places, which is not how a rule that
 * troubles to state them twice should be read. The natural reading is that "or" offers the school
 * an ALTERNATIVE basis, and a school that meets either has met the requirement.
 *
 * On that reading 100 items IS the regulatory minimum for Course I, and it is confirmed rather than
 * inferred: it is the number the rule states, in a sentence whose structure the broker parallel
 * explains. 126 is therefore NOT a regulatory minimum. It is what StateCourse might choose in order
 * to be immune to the other reading — a provider policy, and it is labelled as one.
 */

export const TIER = Object.freeze({
  CONFIRMED: "REGULATORY_MINIMUM_CONFIRMED",
  POLICY: "STATECOURSE_CONSERVATIVE_POLICY",
  OPEN: "OPEN_DBPR_QUESTION",
});

const RULE = "Rule 61J2-3.008(4)(d), F.A.C.";
const c = (record) => Object.freeze({ tier: TIER.CONFIRMED, ...record });
const p = (record) => Object.freeze({ tier: TIER.POLICY, ...record });
const o = (record) => Object.freeze({ tier: TIER.OPEN, ...record });

/* ── tier 1: what primary authority affirmatively establishes ─────────────────────────────────── */
export const REGULATORY_MINIMUM_CONFIRMED = Object.freeze({
  passingScorePercent: c({
    value: 70,
    cite: "Rule 61J2-3.008(4)(a), F.A.C.",
    quote: "A grade of 70% or higher on the Commission-prescribed end-of-course examination constitutes satisfactory course completion.",
  }),
  minimumItems: c({
    value: 100,
    cite: RULE,
    quote: "The sales associate end-of-course examinations shall contain at least 100 items, or 2 items per instruction hour.",
    note: "The stated floor, read as an independently sufficient alternative — see the module docstring and the broker parallel.",
  }),
  minimumFormCount: c({
    value: 2,
    cite: RULE,
    quote: "The school shall develop at least 2 forms of the end-of-course examination, and submit them for approval as provided in paragraph (4)(b) above.",
  }),
  maximumCrossFormDuplicationPercent: c({
    value: 15,
    cite: RULE,
    quote: "No end-of-course examination shall contain more than 15% duplication of questions.",
  }),
  minimumApplicationLevelPercent: c({
    value: 70,
    cite: RULE,
    quote: "At least 70% of the questions on each form of the test shall be application oriented.",
    definitionInRule: "Application level means the ability to use the learned material in a completely new and concrete situation. It usually involves the application of rules, policies, methods, computations, laws, theories, or any other relevant and available information.",
  }),
  maximumKnowledgeLevelPercent: c({
    value: 10,
    cite: RULE,
    quote: "No more than 10% of the questions on each form of the test shall be at the knowledge level.",
    definitionInRule: "Knowledge level means the recall of specific facts, patterns, methods, terms, rules, dates, formulas, names, or other information that should be committed to memory.",
  }),
  answerChoicesPerItem: c({
    value: 4,
    cite: RULE,
    quote: "All Questions shall be multiple-choice with 4 answer choices each.",
  }),
  maximumMinutesPerItem: c({
    value: 1.8,
    cite: RULE,
    quote: "The overall time to complete the end-of-course examination must not exceed the equivalent of 1.8 minutes per item.",
    note: "A CEILING on time allowed, not an equality. It caps duration given an item count; it does not fix the item count.",
  }),
  answerKeyUniquePerForm: c({ value: true, cite: RULE, quote: "The answer key must be unique for each form of the examination." }),
  answerKeyCitesSourcePages: c({
    value: true,
    cite: RULE,
    quote: "The answer key must reference the page number(s) containing the information upon which each question and correct answer is based.",
    buildConsequence: "An item cannot cite a page that does not exist, so the examination cannot be authored before the curriculum is written and paginated.",
  }),
  orderMustNotFollowCourseOrder: c({
    value: true,
    cite: RULE,
    quote: "The order of the examination questions may not follow the sequence of the course content and the item must not refer the student to the course material.",
    note: "The exact inverse of the syllabus rule for the course itself, which must follow order precisely.",
  }),
  sufficientBankRequired: c({
    value: true,
    cite: RULE,
    quote: "A school offering the Commission-prescribed courses must maintain a sufficient bank of questions to assure examination validity.",
  }),
  aidsProhibited: c({
    value: Object.freeze(["hint", "back", "retry"]),
    cite: "Rule 61J2-3.008(4)(b)3.i, F.A.C.",
    quote: "End-of-course examinations shall not include aids such as, but not limited to, hint, back, or retry functionalities.",
    scope: "The end-of-course examination only. It does not reach formative checks during instruction, which may perfectly well tell a student they were wrong and let them try again.",
  }),
  allSessionsBeforeExamination: c({
    value: true,
    cite: "Rule 61J2-3.008(4)(b)3.i, F.A.C.",
    quote: "Students shall not take the end-of-course examination without satisfactorily completing all sessions of the syllabus.",
  }),
  duplicationPreventionRequired: c({
    value: true,
    cite: "Rule 61J2-3.008(4)(b)3.i, F.A.C.",
    quote: "The school must demonstrate that there is a reasonable method in place to prevent duplication of the end-of-course examination.",
  }),
  examinationMustBeTimed: c({
    value: true,
    cite: "s. 475.17(2)(a)2, Fla. Stat.",
    quote: "satisfactory completion of a distance learning course requires the satisfactory completion of a timed distance learning course examination",
  }),
  retakeWaitDays: c({
    value: 30,
    cite: "Rule 61J2-3.008(6), F.A.C.",
    quote: "Students failing the Commission-prescribed end-of-course examination must wait at least 30 days from the date of the original examination to retest.",
  }),
  retakesWithinOneYear: c({
    value: 1,
    cite: "Rule 61J2-3.008(6), F.A.C.",
    quote: "Within one year of the original examination, a student may retest a maximum of one time. Otherwise, students failing the end-of-course examination must repeat the course prior to being eligible to take the end-of-course examination again.",
  }),
  differentFormOnRetakeOrRepeat: c({
    value: true,
    cite: "Rule 61J2-3.008(6), F.A.C.",
    quote: "Schools shall administer a different form of the end-of-course examination to a student that is retaking the exam or repeating the course.",
  }),
  studentCertificationStatement: c({
    value: "I certify that I personally completed all assignments and have not duplicated any portion of the end-of-course examination prior to the taking of the final examination.",
    cite: "Rule 61J2-3.008(4)(b)3.j, F.A.C.",
    quote: "The school must require the student to submit a statement that includes, “I certify that I personally completed all assignments and have not duplicated any portion of the end-of-course examination prior to the taking of the final examination.”",
    note: "The rule says the statement must be one the student SUBMITS, so a pre-ticked box or a passive acknowledgement does not satisfy it.",
  }),
});

/* ── proctoring: not required, and NOT prohibited ─────────────────────────────────────────────
   Asked and answered precisely, because "not required" and "prohibited" are different facts and the
   difference decides whether a proctoring feature may ever be built. */
export const PROCTORING = Object.freeze({
  tier: TIER.CONFIRMED,
  cite: "s. 475.17(2)(a)2, Fla. Stat.",
  quote: "Such examination shall not be required to be monitored or given at a centralized location.",
  required: false,
  prohibited: false,
  status: "NOT REQUIRED — permissive, not prohibitive",
  analysis:
    "The statute removes an obligation; it does not impose a ban. A school may monitor its examination or site it centrally if it chooses. What it may not do is treat monitoring or a test centre as a precondition Florida imposes, or tell students Florida requires it.",
  doNotCite:
    "s. 455.2123, Fla. Stat. It says a similar thing about CONTINUING education and is not authority for pre-licence examination siting.",
  stateCoursePosition: "Unproctored, timed, delivered online. Identity is handled by Rule 61J2-3.008(4)(b)3.c verification rather than by observation.",
});

/* ── confidentiality ──────────────────────────────────────────────────────────────────────────
   Florida does not use the word "confidential" of the examination. What it does is impose three
   obligations that only a confidential bank can satisfy, which is a different route to the same
   place and is worth recording as such rather than as a StateCourse preference. */
export const CONFIDENTIALITY = Object.freeze({
  tier: TIER.CONFIRMED,
  derivedFrom: Object.freeze([
    "Rule 61J2-3.008(4)(b)3.i — a reasonable method must prevent duplication of the end-of-course examination",
    "Rule 61J2-3.008(4)(d) — no more than 15% duplication of questions between forms, which presupposes forms that are not public",
    "Rule 61J2-3.008(6) — a different form must be administered on retake or repeat, which fails if forms are known in advance",
    "Rule 61J2-3.008(4)(b)3.j — the student certifies they have not duplicated any portion of the examination",
  ]),
  effect:
    "Examination items, distractors, answer keys and page references may not appear in student-facing curriculum, in video or its captions, transcripts, posters or thumbnails, in printed volumes, in marketing, or in any artifact a reviewer receives other than the examination submission itself.",
  retentionInteraction:
    "s. 475.451(8), Fla. Stat. separately requires a file copy of each examination and all student answer sheets to be kept 3 years and produced to the Department on request. Confidential does not mean undocumented.",
});

/* ── tier 2: StateCourse provider policy ──────────────────────────────────────────────────────── */
export const STATECOURSE_CONSERVATIVE_POLICY = Object.freeze({
  itemCount: p({
    value: 126,
    configurable: true,
    configKey: "FL_COURSE_I_EXAM_ITEM_COUNT",
    rationale:
      "126 is 2 items per each of the 63 hours, the largest figure any reading of the item sentence produces. Choosing it makes the examination compliant on every reading at once, including the one StateCourse does not think is right.",
    isNotARegulatoryMinimum: true,
    regulatoryMinimumIs: 100,
    costOfThisChoice:
      "150 minutes across 126 items is 1.19 minutes per item, against 1.50 at the 100-item minimum. Both sit under the 1.8 ceiling, but the conservative choice is measurably harder on students. If DBPR confirms 100, the engine should drop to 100 and give students the extra 21 seconds per item.",
    revisitWhen: "DBPR or FREC answers OPEN_DBPR_QUESTIONS.itemCountBasis in writing.",
  }),
  formCount: p({
    value: 5,
    configurable: true,
    configKey: "FL_COURSE_I_EXAM_FORM_COUNT",
    rationale:
      "The rule floor is 2 and the FREC Distance Education Checklist also says two. The current DBPR RE 18 application asks for five end-of-course examinations for distance education courses specifically, which is what StateCourse would file. Five satisfies all three documents.",
    isNotARegulatoryMinimum: true,
    regulatoryMinimumIs: 2,
    costOfThisChoice: "Three additional complete examination forms, each needing its own unique page-referenced answer key and each held to the 15% cross-form duplication cap.",
    revisitWhen: "DBPR answers OPEN_DBPR_QUESTIONS.formCount in writing.",
  }),
  allottedMinutes: p({
    value: 150,
    configurable: true,
    configKey: "FL_COURSE_I_EXAM_MINUTES",
    rationale:
      "The examination's own three 50-minute hours out of the 63. Not a rule value — the rule caps duration at 1.8 minutes per item and says nothing about a floor — but it is what the syllabus's 60/3 split leaves for the examination, and spending more would push the course past the 63-hour statutory ceiling.",
    isNotARegulatoryMinimum: true,
  }),
});

/* ── tier 3: what is genuinely unresolved ─────────────────────────────────────────────────────── */
export const OPEN_DBPR_QUESTIONS = Object.freeze([
  o({
    id: "itemCountBasis",
    question:
      'Rule 61J2-3.008(4)(d) provides that "[t]he sales associate end-of-course examinations shall contain at least 100 items, or 2 items per instruction hour." For a 63-hour Course I comprising 60 instruction hours and a 3-hour end-of-course examination, does the Commission read the requirement as (a) at least 100 items, (b) at least 2 items per instruction hour applied to the 60 instruction hours, being 120 items, or (c) at least 2 items per hour applied to all 63 hours, being 126 items?',
    readings: Object.freeze([
      Object.freeze({ label: "at least 100 items, the stated floor as an independently sufficient alternative", items: 100, stateCourseView: "the better reading — see the broker parallel in the same paragraph" }),
      Object.freeze({ label: "2 items per instruction hour over 60 instruction hours", items: 120 }),
      Object.freeze({ label: "2 items per hour over all 63 hours", items: 126 }),
    ]),
    whyTheTimeCeilingDoesNotResolveIt:
      "The 1.8 minutes per item limit is a ceiling on duration, not an equality. The examination's 150 minutes sits under the ceiling for all three counts — 100 permits 180 minutes, 120 permits 216, 126 permits 226.8 — so every reading passes and the ceiling distinguishes nothing.",
    pendingBehaviour: "Build to 126 items, labelled as provider policy, engine configurable.",
  }),
  o({
    id: "formCount",
    question:
      "Rule 61J2-3.008(4)(d) requires at least 2 forms of the end-of-course examination, and the FREC Distance Education Checklist (rev. 06/2018) likewise lists 'Two end of course examinations'. DBPR RE 18, Section V, requires 'Five end of course examinations (for distance education courses only)'. For a distance-education FREC Course I submitted by a permitted real estate school, how many forms must accompany the application?",
    pendingBehaviour: "Build five forms, labelled as provider policy driven by the application requirement.",
  }),
  o({
    id: "instructionHourDefinition",
    question:
      "Does 'instruction hour' in Rule 61J2-3.008(4)(d) mean the 60 hours of instruction identified in the FREC Course I syllabus, or all 63 hours of the course, which the rule and s. 475.17(2)(a)1 define as inclusive of examination?",
    pendingBehaviour: "Treated as unresolved; the conservative item count is computed on 63 so that either answer is satisfied.",
  }),
  o({
    id: "absenceInDistanceCourse",
    question:
      "Section 475.17(2)(a)1 bars issuing a notice of satisfactory completion where a student has absences in excess of 8 classroom hours, and Rule 61J2-3.008(4)(a) conditions administering the examination on the same ceiling. How is that ceiling measured in an asynchronous distance course, in which there is no scheduled class session to be absent from?",
    pendingBehaviour: "Track delivered instructional time per student; treat undelivered required time as the analogue of absence; do not issue a certificate where more than 8 hours of required instruction is undelivered.",
  }),
  o({
    id: "re19ForSchools",
    question:
      "DBPR RE 18, Section V, lists 'Education Provider Approval Application form DBPR-RE-19' among the attachments for all initial course approvals, while the following line is marked 'for Providers Only' and the FREC Distance Education Checklist states elsewhere that DBPR RE 20 and the course fee are required of approved providers only and that 'licensed real estate schools do not need to fulfill this requirement'. Must a permitted real estate school filing a FREC Course I approval also file DBPR RE 19?",
    pendingBehaviour: "Not filed; question carried.",
  }),
  o({
    id: "instructorExaminationLogistics",
    question:
      "Where is the Commission-approved real estate instructor examination administered, what is its content outline and fee, and is a candidate information booklet published for it?",
    note: "Neither the Department's forms-and-publications page nor its education page carries instructor examination candidate materials. DBPR RE 3 offers 'Real Estate Instructor Exam [1010]' as a qualification basis without saying where the examination is taken.",
    pendingBehaviour: "No assumption recorded anywhere in the build.",
  }),
]);

/* ── the written question to send ─────────────────────────────────────────────────────────────
   Drafted here rather than described, so that sending it is a copy-and-paste rather than a writing
   task, and so that what was asked is on the record next to what was assumed pending the answer. */
export const DRAFT_QUESTION_TO_DBPR = `To: Florida Real Estate Commission, Division of Real Estate, Department of Business and Professional Regulation

Subject: Request for clarification — FREC Course I end-of-course examination requirements, Rule 61J2-3.008(4)(d), F.A.C.

We are preparing a FREC Course I (sales associate pre-licensure) distance education course for submission by a real estate school permitted under s. 475.451, Fla. Stat. Four points in the current requirements admit of more than one reading, and we would rather build to the Commission's reading than to ours.

1. Item count. Rule 61J2-3.008(4)(d) provides that "[t]he sales associate end-of-course examinations shall contain at least 100 items, or 2 items per instruction hour." For a 63-hour Course I comprising 60 hours of instruction and a 3-hour end-of-course examination, does the Commission read this as requiring (a) at least 100 items, (b) at least 120 items, being 2 per instruction hour over 60 instruction hours, or (c) at least 126 items, being 2 per hour over all 63 hours? We note the 1.8 minute per item limit in the same paragraph does not distinguish among these, since it caps duration rather than fixing a count.

2. Meaning of "instruction hour". Relatedly, does "instruction hour" in that paragraph refer to the 60 hours of instruction identified in the FREC Course I syllabus, or to all 63 hours, which the rule and s. 475.17(2)(a)1 define as inclusive of examination?

3. Number of examination forms. Rule 61J2-3.008(4)(d) requires "at least 2 forms", and the FREC Distance Education Checklist (rev. 06/2018) lists "Two end of course examinations". DBPR RE 18, Section V, requires "Five end of course examinations (for distance education courses only)". For a distance education Course I submitted by a permitted school, how many forms should accompany the application?

4. Provider approval application. DBPR RE 18, Section V, lists form DBPR RE 19 among the attachments for all initial course approvals, while the adjacent instructor-information item is marked "for Providers Only" and the Distance Education Checklist states that licensed real estate schools need not fulfil the provider-only requirements. Must a permitted real estate school filing a Course I approval also file DBPR RE 19?

We are not currently permitted and are not offering any Florida course. We ask so that the application we eventually file is correct on its face.`;

/* ── the arithmetic, computed from the tiers rather than restated ─────────────────────────────── */
const ITEMS = STATECOURSE_CONSERVATIVE_POLICY.itemCount.value;
const MINUTES = STATECOURSE_CONSERVATIVE_POLICY.allottedMinutes.value;
const CEILING = REGULATORY_MINIMUM_CONFIRMED.maximumMinutesPerItem.value;

export const COMPUTED = Object.freeze({
  plannedItems: ITEMS,
  regulatoryMinimumItems: REGULATORY_MINIMUM_CONFIRMED.minimumItems.value,
  allottedMinutes: MINUTES,
  minutesPerItemAsPlanned: MINUTES / ITEMS,
  minutesPerItemAtRegulatoryMinimum: MINUTES / REGULATORY_MINIMUM_CONFIRMED.minimumItems.value,
  withinTimeCeilingAsPlanned: MINUTES <= CEILING * ITEMS,
  withinTimeCeilingAtMinimum: MINUTES <= CEILING * REGULATORY_MINIMUM_CONFIRMED.minimumItems.value,
  maximumPermittedMinutesAsPlanned: CEILING * ITEMS,
  applicationLevelItemsAsPlanned: Math.ceil(ITEMS * REGULATORY_MINIMUM_CONFIRMED.minimumApplicationLevelPercent.value / 100),
  maximumKnowledgeLevelItemsAsPlanned: Math.floor(ITEMS * REGULATORY_MINIMUM_CONFIRMED.maximumKnowledgeLevelPercent.value / 100),
  maximumSharedItemsBetweenForms: Math.floor(ITEMS * REGULATORY_MINIMUM_CONFIRMED.maximumCrossFormDuplicationPercent.value / 100),
});

export default Object.freeze({
  TIER,
  REGULATORY_MINIMUM_CONFIRMED,
  PROCTORING,
  CONFIDENTIALITY,
  STATECOURSE_CONSERVATIVE_POLICY,
  OPEN_DBPR_QUESTIONS,
  DRAFT_QUESTION_TO_DBPR,
  COMPUTED,
});
