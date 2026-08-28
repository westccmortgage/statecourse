/**
 * Texas Principles of Real Estate I (30 hours) — course structure, objectives and time model.
 *
 * WHAT THIS FILE BINDS TOGETHER. The PRINS1-1 form fixes WHAT must be taught and for how long
 * (prins1-course-form.mjs). The source register fixes what was actually READ (statute-sources.mjs).
 * This file is the bridge the claim-traceability gate walks: each of the form's 46 units maps to a
 * curriculum module, carries learning objectives, and derives its section trace from the read
 * register — so unit → objective → read section → module text is one navigable chain, and a unit
 * cannot silently teach from sections nobody opened.
 *
 * THE TIME MODEL IS THE PROVIDER'S, NOT THE REGULATOR'S. PRINS1-1 prescribes minutes per unit; it
 * does not prescribe how a provider demonstrates that its materials occupy them. The constants in
 * TIME_MODEL are StateCourse LLC's documented instructional-time methodology (label:
 * PROVIDER_METHODOLOGY): a mastery-study reading rate that blends a first pass at typical
 * long-form reading speed with the re-reading, note-taking and statute cross-referencing this
 * course's exercises force, plus fixed attempt times for each activity type. No constant below is
 * asserted to come from any statute, rule or TREC document.
 */

import { FORM, TOPICS, ALL_UNITS } from "./prins1-course-form.mjs";
import { ALL_SOURCES, NO_STATUTE_REQUIRED } from "./statute-sources.mjs";

export const COURSE = Object.freeze({
  courseId: "tx-principles-real-estate-i-30-v1",
  title: "Principles of Real Estate I",
  hours: FORM.courseHours,
  totalMinutes: FORM.totalMinutes,
  approvalForm: FORM.formNumber,
  curriculumDir: "texas/tx-principles-real-estate-i-30-v1/curriculum",
  /* TX-1A scope: content build only. Nothing downstream of content is enabled. */
  enrollmentEnabled: false,
  paymentEnabled: false,
  creditReportingEnabled: false,
  certificateIssuanceEnabled: false,
  finalExaminationExists: false,
  trecApprovalStatus: "NOT_SUBMITTED_NOT_APPROVED",
});

/** Course presentation order: one module per PRINS1-1 topic, in the form's own topic order. */
export const MODULES = Object.freeze(
  TOPICS.map((topic, index) =>
    Object.freeze({
      module: `module-0${index + 1}`,
      file: `module-0${index + 1}.md`,
      topicCode: topic.code,
      topic: topic.topic,
      prescribedMinutes: topic.subtotalMinutes,
    }),
  ),
);

/**
 * Learning objectives, one entry per PRINS1-1 unit. Each objective is written against what the
 * module text actually teaches, which in turn was written only from sections recorded as read —
 * so an objective a student can meet is an objective the source register can support.
 */
export const UNIT_OBJECTIVES = Object.freeze({
  T01U1: Object.freeze([
    "Distinguish the licensed occupations and specialisations of Texas real estate practice, and identify which activities fall inside the statutory broker definition and which are exempt.",
  ]),
  T01U2: Object.freeze([
    "Describe the Commission's statutory authority over qualifying education, the Education Standards Advisory Committee's statutory basis, and the elapsed-time and daily-hour limits that govern this course.",
  ]),
  T01U3: Object.freeze([
    "Explain how immobility, uniqueness and durability shape the real estate market, and why the market clears slowly and locally.",
  ]),
  T01U4: Object.freeze([
    "State the licence requirement and its principal statutory exemptions, and identify the acts a sales agent may perform only through a sponsoring broker.",
  ]),
  T02U1: Object.freeze([
    "Differentiate land, real estate and real property, and state what a Texas conveyance of an estate in real property passes by default.",
  ]),
  T02U2: Object.freeze([
    "Classify property as real or personal, apply the fixture tests, and explain how a security interest in a fixture is perfected and enforced against the realty.",
  ]),
  T03U1: Object.freeze([
    "Trace the development of property concepts from feudal tenure to allodial ownership as historical background for the modern estates system.",
  ]),
  T03U2: Object.freeze([
    "Identify the freehold estates recognised in Texas, including the fee simple presumption and future estates.",
  ]),
  T03U3: Object.freeze([
    "Define encumbrance, distinguish liens from non-possessory use rights, and classify common encumbrances by their effect on title and use.",
  ]),
  T03U4: Object.freeze([
    "State when the ad valorem tax lien attaches, its statutory priority, and its personal-liability counterpart.",
  ]),
  T03U5: Object.freeze([
    "Distinguish voluntary from involuntary liens, and state how mechanic's and materialman's lien rights arise under the Property Code.",
  ]),
  T03U6: Object.freeze([
    "Explain state ownership of surface water and the appropriation-permit system that governs its use.",
  ]),
  T03U7: Object.freeze([
    "Apply the Texas urban and rural homestead definitions and the homestead tax exemptions as the statutes state them.",
  ]),
  T04U1: Object.freeze([
    "Describe the metes-and-bounds, subdivision-plat and abstract systems used to describe Texas land, and state when a plat must be recorded.",
  ]),
  T04U2: Object.freeze([
    "Explain the surveyor's role, the licensing framework for surveying, and the historical Spanish units encountered in Texas descriptions.",
  ]),
  T05U1: Object.freeze([
    "Distinguish ownership in severalty from concurrent ownership and identify how Texas community property principles shape marital ownership.",
  ]),
  T05U2: Object.freeze([
    "Identify the business entities through which real estate may be owned and the licensing consequences when an entity brokers real estate.",
  ]),
  T05U3: Object.freeze([
    "Differentiate tenancy in common, joint tenancy with right of survivorship by written agreement, and community property, and state each form's survivorship consequence.",
  ]),
  T05U4: Object.freeze([
    "Explain how a Texas trust holds real property and the writing requirement for a trust of realty.",
  ]),
  T05U5: Object.freeze([
    "Define the vocabulary of real estate investment — income, appreciation, leverage, liquidity and risk — as economic concepts.",
  ]),
  T05U6: Object.freeze([
    "Compute net operating income, capitalisation rate and cash-on-cash return for a simple income property.",
  ]),
  T05U7: Object.freeze([
    "Weigh the non-tax economic benefits and costs of real estate ownership, and identify when a client must be referred to a qualified tax professional.",
  ]),
  T05U8: Object.freeze([
    "Recognise when a syndicated real estate interest is a security under the Texas Securities Act and identify the private-offering exemption's limits.",
  ]),
  T05U9: Object.freeze([
    "Describe the real estate investment trust form and its Texas organisational statute.",
  ]),
  T05U10: Object.freeze([
    "Describe the REMIC as the federal tax vehicle for pooled mortgage interests.",
  ]),
  T06U1: Object.freeze([
    "Define a contract and classify contracts as express or implied, bilateral or unilateral, executory or executed.",
  ]),
  T06U2: Object.freeze([
    "State the essential elements of an enforceable contract and apply the statute of frauds to real estate agreements.",
  ]),
  T06U3: Object.freeze([
    "Identify the remedies for breach and the limitation periods that govern contract and specific-performance claims.",
  ]),
  T06U4: Object.freeze([
    "Walk a residential sale contract from offer to closing, applying the writing requirement and the seller's disclosure duty.",
  ]),
  T06U5: Object.freeze([
    "Explain when a licence holder must use a promulgated contract form, the statutory exceptions, and the boundary with the unauthorised practice of law.",
  ]),
  T07U1: Object.freeze([
    "State the formal requisites of a Texas deed and the covenants implied by 'grant' and 'convey'.",
  ]),
  T07U2: Object.freeze([
    "Define title and explain where and why an instrument affecting it must be recorded.",
  ]),
  T07U3: Object.freeze([
    "Apply the acknowledgment and identification prerequisites to recording and describe the county clerk's recording duties.",
  ]),
  T07U4: Object.freeze([
    "Explain constructive notice, the abstract and opinion method, and title insurance as evidence of title.",
  ]),
  T07U5: Object.freeze([
    "Distinguish the ways title is acquired and transferred, voluntary and involuntary.",
  ]),
  T07U6: Object.freeze([
    "Explain how community and separate property pass at death under Texas intestacy.",
  ]),
  T07U7: Object.freeze([
    "Describe testate and intestate succession, the will execution formalities, and the descent of a decedent's real property.",
  ]),
  T07U8: Object.freeze([
    "Explain voluntary alienation by deed and by will, including delivery and acceptance.",
  ]),
  T07U9: Object.freeze([
    "Explain involuntary alienation: condemnation, tax foreclosure and adverse possession under the limitation statutes.",
  ]),
  T08U1: Object.freeze([
    "Explain the Texas deed-of-trust security device, the nonjudicial foreclosure procedure, and the notice and sale requirements of Property Code chapter 51.",
  ]),
  T08U2: Object.freeze([
    "Read a real estate lien note: parties, promise, interest, and the usury and home-loan regulation that bounds it; compute a level-payment amortisation.",
  ]),
  T08U3: Object.freeze([
    "State when FIRPTA withholding applies to a disposition by a foreign person, the statutory rate, and the affidavit that relieves the buyer of withholding.",
  ]),
  T09U1: Object.freeze([
    "List the pre-closing steps — title commitment, survey, inspections, lender conditions — and the escrow officer's statutory role.",
  ]),
  T09U2: Object.freeze([
    "Describe how a Texas closing is conducted through an escrow agent and the anti-kickback rule that governs settlement referrals.",
  ]),
  T09U3: Object.freeze([
    "State RESPA's purpose and coverage, the uniform settlement statement mandate, and the prohibitions of 12 U.S.C. § 2607.",
  ]),
  T09U4: Object.freeze([
    "Prepare a simple closing statement: debits, credits and prorations computed on 360-day and 365-day bases.",
  ]),
});

/**
 * The provider's instructional-time methodology. Every constant is StateCourse LLC's own
 * documented figure — none is drawn from a statute, rule or TREC form.
 */
export const TIME_MODEL = Object.freeze({
  label: "PROVIDER_METHODOLOGY",
  note: "StateCourse LLC's documented instructional-time model for mastery study of statute-based course text. Not a regulator figure. The mastery rate is the effective pace of a student reading dense legal instructional text once at a typical long-form pace and then re-reading, taking notes and cross-referencing the quoted statutes as the exercises require.",
  firstPassWordsPerMinute: 140,
  masteryStudyWordsPerMinute: 60,
  activityMinutes: Object.freeze({
    statuteReadingExercise: 12,
    appliedExercise: 10,
    quizItem: 2,
    scenario: 20,
    moduleRecap: 5,
  }),
});

const holdsByUnit = new Map();
for (const source of ALL_SOURCES) {
  for (const unit of source.reliedOnByUnits) {
    if (!holdsByUnit.has(unit)) holdsByUnit.set(unit, []);
    holdsByUnit.get(unit).push(Object.freeze({
      sourceId: source.id,
      citation: source.citation,
      sections: Object.freeze(source.sectionsRead.map((s) => s.section)),
    }));
  }
}
const excusedByUnit = new Map(NO_STATUTE_REQUIRED.map((entry) => [entry.unit, entry.reason]));
const moduleByTopic = new Map(MODULES.map((m) => [m.topicCode, m]));

/** unit → module → objectives → read sections, one row per PRINS1-1 unit. */
export const UNIT_TRACE = Object.freeze(
  ALL_UNITS.map((unit) =>
    Object.freeze({
      code: unit.code,
      unit: unit.unit,
      topicCode: unit.topicCode,
      module: moduleByTopic.get(unit.topicCode).module,
      file: moduleByTopic.get(unit.topicCode).file,
      prescribedMinutes: unit.minutes,
      objectives: UNIT_OBJECTIVES[unit.code],
      sources: Object.freeze(holdsByUnit.get(unit.code) ?? []),
      noStatuteRequired: excusedByUnit.get(unit.code) ?? null,
    }),
  ),
);

/* Load-time invariants: the trace must be complete or the module refuses to load. */
if (MODULES.length !== 9) throw new Error(`Principles I: ${MODULES.length} modules against the form's 9 topics`);
for (const trace of UNIT_TRACE) {
  if (!trace.objectives || trace.objectives.length === 0) {
    throw new Error(`Principles I: unit ${trace.code} has no learning objective`);
  }
  if (trace.sources.length === 0 && !trace.noStatuteRequired) {
    throw new Error(`Principles I: unit ${trace.code} has neither a read source nor a stated no-statute reason`);
  }
  if (trace.sources.some((s) => s.sections.length === 0)) {
    throw new Error(`Principles I: unit ${trace.code} relies on a source with no sections read — HELD IS NOT READ`);
  }
}

export default Object.freeze({ COURSE, MODULES, UNIT_OBJECTIVES, TIME_MODEL, UNIT_TRACE });
