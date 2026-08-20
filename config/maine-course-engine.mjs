/**
 * Maine Sales Agent Course (55 clock hours) — course engine.
 *
 * Maine is the first state in this project where the REGULATOR sets both the topic weights and the
 * passing grade, and that changes what this file asserts.
 *
 *   The Commission's published Sales Agent Course outline fixes ten topics and their percentage
 *   weights, and fixes the course at 55 clock hours: 3,000 instructional minutes plus 300 assessment
 *   minutes. TOPICS below is a transcription of that allocation, and the checks at import time hold
 *   the modules to it.
 *
 *   The passing grade is 75 percent and it is the COMMISSION'S figure, not a StateCourse decision.
 *   Contrast config/virginia-course-engine.mjs and config/michigan-course-engine.mjs, where the
 *   passing standard is this school's and every document must say so. Here the opposite disclaimer
 *   is required: the figure must be attributed to the Commission.
 *
 *   Assessment time is capped at 10 percent of course length. 300 of 3,300 minutes is 9.09 percent,
 *   and the check below fails the load if a change breaches the ceiling.
 *
 * A Maine clock hour is 60 minutes, not the 50 minutes Virginia and Alaska use. The arithmetic in
 * this file depends on that and states it.
 *
 * Two completion states. Instruction is the 3,000 minutes and the two case studies. The course is
 * not complete until the three quizzes and the eighty-item final examination are passed at the
 * Commission's 75 percent — and the final is delivered only after all instruction is complete. A
 * third gate sits above both: no certificate while the course carries no Commission approval, since
 * Chapter 360 bars conducting classes for licensing credit before written approval issues.
 *
 * Course version 1.0 submission draft — not approved. No Maine sales agent credit is available.
 */

import MODULE_BANK from "./maine/module-question-bank.mjs";

const COURSE_ID = "me-sales-agent-55-v1";

/* The Commission's arithmetic, from its published Sales Agent Course outline. */
const MINUTES_PER_CLOCK_HOUR = 60;
const INSTRUCTIONAL_MINUTES = 3000;
const ASSESSMENT_MINUTES = 300;
const TOTAL_CLOCK_HOURS = (INSTRUCTIONAL_MINUTES + ASSESSMENT_MINUTES) / MINUTES_PER_CLOCK_HOUR;
const ASSESSMENT_CEILING_PERCENT = 10;

/* THE COMMISSION'S passing grade. Not a StateCourse standard. */
const COMMISSION_PASSING_PERCENT = 75;

/* StateCourse instructional standard for in-module progression items, which the Commission does not
   prescribe. The quizzes and the final carry the Commission's 75. */
const ENGAGEMENT_PASSING_PERCENT = 80;
const APPLIED_PASSING_PERCENT = 100;

/* The Commission's ten topics and their weights, transcribed. */
const TOPICS = Object.freeze([
  { code: "T01", topic: "Introduction", weightPercent: 1, minutes: 30, finalExamItems: 1 },
  { code: "T02", topic: "Industry Overview/Organization", weightPercent: 1, minutes: 30, finalExamItems: 1 },
  { code: "T03", topic: "Maine Real Estate Commission", weightPercent: 13, minutes: 390, finalExamItems: 10 },
  { code: "T04", topic: "Agency Relationships", weightPercent: 13, minutes: 390, finalExamItems: 10 },
  { code: "T05", topic: "Product Knowledge", weightPercent: 28, minutes: 840, finalExamItems: 23 },
  { code: "T06", topic: "Property Valuation and Appraisal", weightPercent: 9, minutes: 270, finalExamItems: 7 },
  { code: "T07", topic: "Financing the Transaction", weightPercent: 9, minutes: 270, finalExamItems: 7 },
  { code: "T08", topic: "Contracts", weightPercent: 14, minutes: 420, finalExamItems: 11 },
  { code: "T09", topic: "Closings", weightPercent: 8, minutes: 240, finalExamItems: 6 },
  { code: "T10", topic: "Miscellaneous Federal/State Laws", weightPercent: 4, minutes: 120, finalExamItems: 4 }
].map((item) => Object.freeze(item)));

const MODULES = Object.freeze([
  { id: "module-01", sequence: 1, title: "Introduction, industry organization, and the Maine Real Estate Commission", minutes: 450, hours: "1–8", topics: ["T01", "T02", "T03"] },
  { id: "module-02", sequence: 2, title: "Agency relationships", minutes: 390, hours: "8–14", topics: ["T04"] },
  { id: "module-03", sequence: 3, title: "Product knowledge I: property, ownership, and interests", minutes: 435, hours: "15–22", topics: ["T05"] },
  { id: "module-04", sequence: 4, title: "Product knowledge II: Maine land use, environment, transfer, and construction", minutes: 405, hours: "23–29", topics: ["T05"] },
  { id: "module-05", sequence: 5, title: "Property valuation and appraisal", minutes: 270, hours: "29–34", topics: ["T06"] },
  { id: "module-06", sequence: 6, title: "Financing the transaction", minutes: 270, hours: "35–39", topics: ["T07"] },
  { id: "module-07", sequence: 7, title: "Contracts", minutes: 420, hours: "39–47", topics: ["T08"] },
  { id: "module-08", sequence: 8, title: "Closings", minutes: 240, hours: "47–51", topics: ["T09"] },
  { id: "module-09", sequence: 9, title: "Miscellaneous federal and state laws", minutes: 120, hours: "51–53", topics: ["T10"] }
].map((item) => Object.freeze({
  ...item,
  topics: Object.freeze([...item.topics]),
  curriculumPath: `maine/curriculum/${item.id}.md`
})));

/* Several of the Commission's topics change over inside an hour rather than at an hour boundary:
   Hour 8 is 30 minutes of Commission topic and 30 of Agency; Hour 15 is 15 minutes of Product
   Knowledge and then Quiz 1; Hour 29 is 45 minutes of Product Knowledge and 15 of Valuation; Hour 39
   is 30 minutes of Financing and 30 of Contracts; Hour 47 is 15 of Contracts and 45 of Closings; and
   Hour 51 is 15 of Closings and 45 of Miscellaneous Laws. So a module's minutes are not its hour span
   times sixty, and the totals have to be asserted rather than assumed.

   This check earned its place: it caught a 30-minute shortfall in the first version of the table,
   where module-03 and module-04 had been given 450 and 390 on the assumption that Product Knowledge
   divided at an hour boundary — it divides mid-Hour-15 and mid-Hour-29 — and module-06 had been
   given 240 when Financing runs to Hour 39 minute 30. */
const modulesTotal = MODULES.reduce((sum, module) => sum + module.minutes, 0);
if (modulesTotal !== INSTRUCTIONAL_MINUTES) {
  throw new Error(`Maine course engine: modules total ${modulesTotal} instructional minutes; the Commission's outline requires ${INSTRUCTIONAL_MINUTES}.`);
}

const topicsTotal = TOPICS.reduce((sum, topic) => sum + topic.minutes, 0);
if (topicsTotal !== INSTRUCTIONAL_MINUTES) {
  throw new Error(`Maine course engine: the transcribed topic minutes total ${topicsTotal}, not ${INSTRUCTIONAL_MINUTES}.`);
}

const weightsTotal = TOPICS.reduce((sum, topic) => sum + topic.weightPercent, 0);
if (weightsTotal !== 100) {
  throw new Error(`Maine course engine: the transcribed topic weights total ${weightsTotal} percent, not 100.`);
}

const finalItemsTotal = TOPICS.reduce((sum, topic) => sum + topic.finalExamItems, 0);
if (finalItemsTotal !== 80) {
  throw new Error(`Maine course engine: the transcribed final examination items total ${finalItemsTotal}, not 80.`);
}

/* Every Commission topic must be carried by at least one module, and no module may claim a topic the
   Commission's outline does not list. */
const coveredTopics = new Set(MODULES.flatMap((module) => module.topics));
const uncovered = TOPICS.filter((topic) => !coveredTopics.has(topic.code));
if (uncovered.length) {
  throw new Error(`Maine course engine: Commission topics carried by no module: ${uncovered.map((t) => `${t.code} ${t.topic}`).join("; ")}`);
}
const unknown = [...coveredTopics].filter((code) => !TOPICS.some((topic) => topic.code === code));
if (unknown.length) {
  throw new Error(`Maine course engine: modules claim topics not in the Commission's outline: ${unknown.join(", ")}`);
}

/* The Commission caps assessment time at 10 percent of course length. */
const assessmentSharePercent = (ASSESSMENT_MINUTES / (INSTRUCTIONAL_MINUTES + ASSESSMENT_MINUTES)) * 100;
if (assessmentSharePercent > ASSESSMENT_CEILING_PERCENT) {
  throw new Error(`Maine course engine: assessment time is ${assessmentSharePercent.toFixed(2)} percent of course length, above the Commission's ${ASSESSMENT_CEILING_PERCENT} percent ceiling.`);
}

const PASSING_PERCENT = Object.freeze({
  applied: APPLIED_PASSING_PERCENT,
  engagement: ENGAGEMENT_PASSING_PERCENT,
  remediation: ENGAGEMENT_PASSING_PERCENT
});

/* The Commission's assessment structure, from its outline. */
const QUIZZES = Object.freeze([
  Object.freeze({ id: "quiz-1", afterHour: 15, items: 20, passingPercent: COMMISSION_PASSING_PERCENT }),
  Object.freeze({ id: "quiz-2", afterHour: 34, items: 20, passingPercent: COMMISSION_PASSING_PERCENT }),
  Object.freeze({ id: "quiz-3", afterHour: 46, items: 20, passingPercent: COMMISSION_PASSING_PERCENT })
]);
const FINAL_EXAM = Object.freeze({
  id: "final-exam",
  items: 80,
  passingPercent: COMMISSION_PASSING_PERCENT,
  deliveredAcrossHours: Object.freeze([53, 54, 55]),
  afterAllInstruction: true
});
const CASE_STUDIES = Object.freeze([
  Object.freeze({ id: "case-study-1", inModule: "module-04", atHour: 29 }),
  Object.freeze({ id: "case-study-2", inModule: "module-07", atHour: 46 })
]);

function hashKey(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

/* Deterministic per item id, so the presented order is stable for as long as the item exists and a
   recorded selection keeps its meaning permanently. Authoring puts the correct answer first; no
   student ever sees that order. */
function permuteChoices(choices, correctChoice, key) {
  const order = choices.map((_, index) => index);
  let seed = hashKey(key) || 1;
  for (let index = order.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 48271) + 11) >>> 0;
    const swap = seed % (index + 1);
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  return { choices: order.map((index) => choices[index]), correctChoice: order.indexOf(correctChoice) };
}

export function getMaineCourse(courseId = COURSE_ID) {
  if (courseId !== COURSE_ID) return null;
  return Object.freeze({
    courseId: COURSE_ID,
    title: "Maine Sales Agent Course",
    version: "1.0-submission-draft",
    state: "ME",
    regulator: "Maine Real Estate Commission, Department of Professional and Financial Regulation",
    clockHours: TOTAL_CLOCK_HOURS,
    minutesPerClockHour: MINUTES_PER_CLOCK_HOUR,
    instructionalMinutes: INSTRUCTIONAL_MINUTES,
    assessmentMinutes: ASSESSMENT_MINUTES,
    assessmentSharePercent: Number(assessmentSharePercent.toFixed(2)),
    assessmentCeilingPercent: ASSESSMENT_CEILING_PERCENT,
    topics: TOPICS,
    modules: MODULES,
    quizzes: QUIZZES,
    finalExam: FINAL_EXAM,
    caseStudies: CASE_STUDIES,
    /* Attribution, in the payload rather than only in a comment. Maine is the inverse of Virginia:
       here the passing grade is the regulator's and must be attributed to it. */
    commissionRequirements: Object.freeze([
      `The ${COMMISSION_PASSING_PERCENT} percent passing grade is the Commission's, from its rules and its published Sales Agent Course guideline.`,
      "The ten topics and their percentage weights are the Commission's, from the same guideline.",
      `The 55 clock hours as ${INSTRUCTIONAL_MINUTES} instructional minutes plus ${ASSESSMENT_MINUTES} assessment minutes, and the ${ASSESSMENT_CEILING_PERCENT} percent ceiling on assessment time, are the Commission's.`,
      "Three quizzes of twenty items, an eighty-item final delivered after all instruction, and two case studies are the Commission's."
    ]),
    stateCourseDecisions: Object.freeze([
      "The grouping of the Commission's topics into nine modules, and the split of Product Knowledge across two of them.",
      `The ${ENGAGEMENT_PASSING_PERCENT} percent in-module engagement threshold and the ${APPLIED_PASSING_PERCENT} percent applied threshold, which the Commission does not prescribe.`
    ]),
    commissionPassingPercent: COMMISSION_PASSING_PERCENT,
    engagementPassingPercent: ENGAGEMENT_PASSING_PERCENT,
    approvalStatus: "Not approved; no Maine sales agent credit is available. Chapter 360 bars advertising as approved, enrolling for licensing credit, or conducting classes for credit before written approval."
  });
}

export function getMaineModule(moduleId) {
  return MODULES.find((item) => item.id === moduleId) ?? null;
}

export function getMaineAssessment(moduleId, kind = "engagement") {
  const module = getMaineModule(moduleId);
  const bank = MODULE_BANK[moduleId];
  if (!module || !bank) return null;
  const authored = kind === "applied" ? [bank.applied] : bank[kind];
  if (!Array.isArray(authored) || !authored.length || authored.some((item) => !item)) return null;
  return {
    id: `${moduleId}-${kind}`,
    kind,
    moduleId,
    passingPercent: PASSING_PERCENT[kind],
    items: authored.map((item, index) => {
      const id = `${moduleId}-${kind}-${String(index + 1).padStart(2, "0")}`;
      const presented = permuteChoices(item.choices, item.correctChoice, `${COURSE_ID}:${id}`);
      return { id, prompt: item.prompt, choices: presented.choices, correctChoice: presented.correctChoice, rationale: item.rationale };
    })
  };
}

export function publicMaineAssessment(assessment) {
  if (!assessment) return null;
  return {
    id: assessment.id,
    kind: assessment.kind,
    moduleId: assessment.moduleId,
    passingPercent: assessment.passingPercent,
    items: assessment.items.map((item) => ({ id: item.id, prompt: item.prompt, choices: [...item.choices] }))
  };
}

export function scoreMaineAssessment(assessment, answers) {
  if (!assessment) return null;
  if (!Array.isArray(answers) || answers.length !== assessment.items.length) return null;
  const results = [];
  for (const [index, item] of assessment.items.entries()) {
    /* Number(null), Number(""), Number(false) and Number([]) are all 0, so a coerced read would
       silently record choice 0 — a selection the student never made — into a permanent record. */
    const raw = answers[index];
    const selectedChoice = typeof raw === "number"
      ? raw
      : (typeof raw === "string" && /^\d+$/.test(raw.trim()) ? Number(raw.trim()) : Number.NaN);
    if (!Number.isInteger(selectedChoice) || selectedChoice < 0 || selectedChoice >= item.choices.length) return null;
    results.push({ itemId: item.id, selectedChoice, correct: selectedChoice === item.correctChoice, rationale: item.rationale });
  }
  const correctCount = results.filter((result) => result.correct).length;
  const percent = Math.round((correctCount / results.length) * 100);
  return { results, correctCount, total: results.length, percent, passed: percent >= assessment.passingPercent };
}

/**
 * Credit and completion.
 *
 * The Commission's structure is instruction, then quizzes, then a final delivered only after all
 * instruction and both case studies are complete. So instructionComplete is not courseComplete, and
 * neither is certificateEligible — Chapter 360 bars conducting classes for licensing credit before
 * written approval, so a certificate without an approval number certifies nothing.
 */
export function maineCreditedMinutes(moduleStates = [], options = {}) {
  const {
    quizzesPassed = [],
    caseStudiesComplete = [],
    finalExamPercent = null,
    approvalNumber = null
  } = options;

  const completed = new Set(
    moduleStates.filter((state) => state?.status === "completed").map((state) => state.module_id ?? state.moduleId)
  );
  const credited = MODULES.filter((module) => completed.has(module.id));
  const creditedMinutes = credited.reduce((sum, module) => sum + module.minutes, 0);
  const instructionComplete = credited.length === MODULES.length;

  const passedQuizIds = new Set(quizzesPassed);
  const allQuizzesPassed = QUIZZES.every((quiz) => passedQuizIds.has(quiz.id));
  const doneCases = new Set(caseStudiesComplete);
  const allCasesComplete = CASE_STUDIES.every((study) => doneCases.has(study.id));

  const finalPassed = typeof finalExamPercent === "number" && finalExamPercent >= COMMISSION_PASSING_PERCENT;
  const courseComplete = instructionComplete && allCasesComplete && allQuizzesPassed && finalPassed;

  return {
    completedModules: credited.length,
    creditedInstructionalMinutes: creditedMinutes,
    requiredInstructionalMinutes: INSTRUCTIONAL_MINUTES,
    creditedClockHoursOfInstruction: creditedMinutes / MINUTES_PER_CLOCK_HOUR,
    topicsCovered: Object.freeze([...new Set(credited.flatMap((module) => module.topics))].sort()),
    instructionComplete,
    caseStudiesComplete: allCasesComplete,
    quizzesPassed: allQuizzesPassed,
    finalExamPassed: finalPassed,
    commissionPassingPercent: COMMISSION_PASSING_PERCENT,
    courseComplete,
    certificateEligible: courseComplete && Boolean(approvalNumber),
    certificateBlockedBy: (() => {
      if (!instructionComplete) {
        return `Not all ${INSTRUCTIONAL_MINUTES} instructional minutes completed (${creditedMinutes} of ${INSTRUCTIONAL_MINUTES}).`;
      }
      if (!allCasesComplete) return "Both Commission-required case studies must be completed before the final examination.";
      if (!allQuizzesPassed) return `All three Commission-required quizzes must be passed at ${COMMISSION_PASSING_PERCENT} percent.`;
      if (!finalPassed) {
        return finalExamPercent === null
          ? "The eighty-item final examination, delivered after all instruction, has not been taken."
          : `The final examination was scored at ${finalExamPercent} percent, below the Commission's ${COMMISSION_PASSING_PERCENT} percent passing grade.`;
      }
      if (!approvalNumber) {
        return "No Maine Real Estate Commission course approval number is recorded. Chapter 360 bars conducting classes for licensing credit before written approval, so no credit exists to certify.";
      }
      return null;
    })()
  };
}

export const MAINE_COURSE_ID = COURSE_ID;
export const MAINE_MODULE_IDS = Object.freeze(MODULES.map((item) => item.id));
export const MAINE_TOPICS = TOPICS;
export const MAINE_COMMISSION_PASSING_PERCENT = COMMISSION_PASSING_PERCENT;
