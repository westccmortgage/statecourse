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
 * THE BROKER SENTENCE SUPPORTS ONE READING, BUT DOES NOT SETTLE IT FOR FILING. The Broker
 * course is 72 hours, so "2 items per instruction hour" is at least 144 — against a stated floor of
 * 95. The Course I numbers run the same way: 100 stated, 120 or 126 by the multiplier. In BOTH
 * sentences the flat number is well below the per-hour number. That is a strong argument that "or"
 * offers alternative bases, but it remains an interpretation. The repository also carries the
 * contrary 120- and 126-item readings, so calling 100 "confirmed" while asking DBPR which count
 * governs is internally inconsistent. Filing posture is therefore 126 items per form pending a
 * written answer. That is a conservative provider choice, not a Florida minimum.
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

/** The text is confirmed; which alternative supplies the operative item count is not. */
export const ITEM_COUNT_QUESTION = o({
  id: "itemCountBasis",
  cite: RULE,
  quote: "The sales associate end-of-course examinations shall contain at least 100 items, or 2 items per instruction hour.",
  question:
    "For Course I, does the quoted alternative require at least 100 items, 120 items based on 60 instruction hours, or 126 items based on all 63 course hours?",
  candidates: Object.freeze([100, 120, 126]),
  settled: false,
  filingPosition: 126,
  reason:
    "100 is supported by the disjunctive text and broker parallel, but that is an interpretive conclusion. Build 126 until DBPR answers in writing so every identified reading is satisfied.",
  pendingBehaviour: "Build 126 items per form, label the count as provider policy, and keep it configurable only after a written DBPR answer.",
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
    regulatoryTextCandidates: Object.freeze([100, 120, 126]),
    costOfThisChoice:
      "150 minutes across 126 items is 1.19 minutes per item, against 1.50 at the 100-item candidate. Both sit under the 1.8 ceiling, but the conservative choice is measurably harder on students. If DBPR confirms 100, the engine should drop to 100 and give students the extra 21 seconds per item.",
    revisitWhen: "DBPR or FREC answers OPEN_DBPR_QUESTIONS.itemCountBasis in writing.",
  }),
  formCount: p({
    value: 2,
    configurable: false,
    configKey: "FL_COURSE_I_EXAM_FORM_COUNT",
    rationale:
      "Rule 61J2-3.008(4)(d), the distance checklist, and the current DBPR Education-page-linked RE 18 all require two forms for distance pre-licensing. The legacy RE 18 URL that asked for five across all distance courses is retained only as superseded evidence and is forbidden for filing.",
    isNotARegulatoryMinimum: false,
    regulatoryMinimumIs: 2,
    costOfThisChoice: "Two complete 126-item forms pending DBPR's item-count answer: 252 secure slots and unique page-referenced keys.",
    revisitWhen: "Immediately before filing, re-confirm that the Education-page-linked RE 18 remains the operative form.",
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

/* ── written regulator answers received 2 September 2026 ─────────────────────────────────────── */
export const RESOLVED_DBPR_QUESTIONS = Object.freeze([
  Object.freeze({
    id: "schoolPermitExamRouteAcceptance",
    source: "florida/submission/regulator-inquiries/dbpr-instructor-school-response-2026-09-02.md",
    resolution:
      "After an individual qualifies through RE 3 [1010], passes the required examination and is issued an instructor permit, that permit may be used to qualify the individual as the RE 5 school permitholder; no additional Florida broker license is required solely for that purpose.",
  }),
  Object.freeze({
    id: "distanceOnlySchoolLocation",
    source: "florida/submission/regulator-inquiries/dbpr-instructor-school-response-2026-09-02.md",
    resolution:
      "A distance-only school needs no Florida classroom solely because delivery is online. RE 5 should carry the actual California physical business address. A registered-agent-only address is not an additional school location and does not alone require RE 9.",
  }),
]);

/* ── tier 3: what is genuinely unresolved ─────────────────────────────────────────────────────── */
export const OPEN_DBPR_QUESTIONS = Object.freeze([
  ITEM_COUNT_QUESTION,
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
    pendingBehaviour: "Require satisfactory completion of every syllabus session before final unlock. Ask only how DBPR wants the separate 8-classroom-hour language described or reported for asynchronous delivery; it never authorizes omitted instruction.",
  }),
  o({
    id: "onlinePostingAndAvailability",
    question: "What online controls satisfy the Rule 61J2-17.015 anti-recruiting posting/reading requirement and the Rule 61J2-3.008(4)(b)3.g prominent instructor-availability posting requirement?",
    pendingBehaviour: "Use a mandatory acknowledged opening display plus a persistent course compliance panel; recheck Rule 61J2-17.015 before any launch after its 2026-12-31 sunset date.",
  }),
  o({
    id: "prelicenseCompletionReporting",
    question: "Must a permitted school electronically report Course I rosters or completions, and if so through which portal, fields, cadence, and correction process?",
    pendingBehaviour: "Retain complete exportable records but do not invent a reporting transaction or claim that CE reporting instructions govern pre-license records.",
  }),
  o({
    id: "currentRe18Identity",
    question: "Please confirm that the operative RE 18 is the June 2026 form currently linked on DBPR's Education page while the corresponding Rule 61-35.027 amendment remains in the rulemaking process.",
    pendingBehaviour: "Use the current linked form for package design, blacklist the legacy URL, and re-download/compare the form immediately before signature and filing.",
  }),
  o({
    id: "reviewCadence",
    question: "What completeness cutoff, deficiency cycle, and FREC Education Agenda process applies to a new distance Course I application?",
    pendingBehaviour: "Do not promise a meeting date or approval timeline; submission remains gated on a complete course, exams, keys and reviewer environment.",
  }),
]);

/* ── historical combined inquiry record ───────────────────────────────────────────────────────
   The substantive course questions remain open, but this combined draft was split and partially
   transmitted before the owner selected parallel broker and school-launch tracks. Questions 3 and
   4 were answered by DBPR on 2 September 2026. It is preserved for audit, not resend.
   Exact transport records and current route labels live in florida/submission/regulator-inquiries. */
export const DRAFT_QUESTION_TO_DBPR = `HISTORICAL COMBINED DRAFT — PARTIALLY TRANSMITTED. Questions 3 and 4 were answered by DBPR on 2 September 2026; preserve this as a sent-message record, not as a current action. See florida/submission/regulator-inquiries/transmission-log.md.

To: Florida Real Estate Commission, Division of Real Estate, Department of Business and Professional Regulation

Subject: Pre-filing clarification — distance FREC Course I school, instructor and course application

StateCourse LLC is preparing, but is not yet offering, a FREC Course I sales-associate pre-licensure distance course. StateCourse is not currently permitted as a Florida real estate school and holds no Florida instructor or course approval. Before the owner incurs licensing and school-permit costs and before we freeze the course, please clarify the following.

1. Item count. Rule 61J2-3.008(4)(d) provides that "[t]he sales associate end-of-course examinations shall contain at least 100 items, or 2 items per instruction hour." For a 63-hour Course I comprising 60 hours of instruction and a 3-hour end-of-course examination, does the Commission read this as requiring (a) at least 100 items, (b) at least 120 items, being 2 per instruction hour over 60 instruction hours, or (c) at least 126 items, being 2 per hour over all 63 hours? We note the 1.8 minute per item limit in the same paragraph does not distinguish among these, since it caps duration rather than fixing a count.

2. Meaning of "instruction hour". Relatedly, does "instruction hour" in that paragraph refer to the 60 hours of instruction identified in the FREC Course I syllabus, or to all 63 hours, which the rule and s. 475.17(2)(a)1 define as inclusive of examination?

3. Historical fallback only — instructor-exam route to the school permit. Section 475.451(2)(a), Florida Statutes, and current RE 5 provide a school-permitholder route through a Florida instructor permit. Does an instructor permit issued through RE 3 transaction [1010] qualify its holder for RE 5 today, notwithstanding the inconsistent cross-reference and wording in Rule 61J2-17.011(2)? This question does not alter the selected broker-endorsement then RE 3 [1030] route.

4. Distance-only location. May a California physical business address be the sole RE 5 school location for an online-only school with no Florida classroom, and is RE 9 unnecessary unless another location is later added?

5. Asynchronous absence treatment. Rule 61J2-3.008(4)(b)3.i independently requires satisfactory completion of all syllabus sessions before the final. With that 100% completion control in place, how should the separate eight-classroom-hour absence language be measured or described for asynchronous delivery?

6. Online notices and instructor availability. Does a mandatory acknowledged opening display plus a persistent course compliance panel satisfy the anti-recruiting statement and prominent instructor-availability requirements for an online school?

7. Pre-license reporting. Must a permitted school electronically report Course I rosters or completions? If yes, through which portal, fields, cadence and correction process?

8. Current form and review cycle. Please confirm that the June 2026 RE 18 currently linked from DBPR's Education page is the operative form pending completion of the Rule 61-35.027 amendment, and advise the completeness cutoff, deficiency cycle and FREC Education Agenda process for a new distance Course I.

The current linked RE 18 appears to resolve two former ambiguities: it requires two exam forms for distance pre/post-license courses and marks RE 19 and RE 20 as provider-only. We plan on that basis unless instructed otherwise. Please do not place SSN, background or other protected applicant details in the response; this inquiry contains none.`;

/* ── the arithmetic, computed from the tiers rather than restated ─────────────────────────────── */
const ITEMS = STATECOURSE_CONSERVATIVE_POLICY.itemCount.value;
const MINUTES = STATECOURSE_CONSERVATIVE_POLICY.allottedMinutes.value;
const CEILING = REGULATORY_MINIMUM_CONFIRMED.maximumMinutesPerItem.value;

export const COMPUTED = Object.freeze({
  plannedItems: ITEMS,
  itemCountCandidates: ITEM_COUNT_QUESTION.candidates,
  allottedMinutes: MINUTES,
  minutesPerItemAsPlanned: MINUTES / ITEMS,
  minutesPerItemAt100ItemCandidate: MINUTES / 100,
  withinTimeCeilingAsPlanned: MINUTES <= CEILING * ITEMS,
  withinTimeCeilingAt100ItemCandidate: MINUTES <= CEILING * 100,
  maximumPermittedMinutesAsPlanned: CEILING * ITEMS,
  applicationLevelItemsAsPlanned: Math.ceil(ITEMS * REGULATORY_MINIMUM_CONFIRMED.minimumApplicationLevelPercent.value / 100),
  maximumKnowledgeLevelItemsAsPlanned: Math.floor(ITEMS * REGULATORY_MINIMUM_CONFIRMED.maximumKnowledgeLevelPercent.value / 100),
  maximumSharedItemsBetweenForms: Math.floor(ITEMS * REGULATORY_MINIMUM_CONFIRMED.maximumCrossFormDuplicationPercent.value / 100),
});

export default Object.freeze({
  TIER,
  REGULATORY_MINIMUM_CONFIRMED,
  ITEM_COUNT_QUESTION,
  PROCTORING,
  CONFIDENTIALITY,
  STATECOURSE_CONSERVATIVE_POLICY,
  OPEN_DBPR_QUESTIONS,
  RESOLVED_DBPR_QUESTIONS,
  DRAFT_QUESTION_TO_DBPR,
  COMPUTED,
});
