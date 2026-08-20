/**
 * Wisconsin Salesperson Pre-License Course (72 clock hours) — course engine.
 *
 * Wisconsin sits at the opposite end from Maine, and this file has to say so in every direction.
 *
 *   REEB 25.033 fixes the course at 72 hours and lists NINETEEN topics that shall be included, with
 *   sub-items under most of them. It allocates NO hours among those topics, prescribes NO assessment,
 *   sets NO passing score, and requires NO quiz or final examination.
 *
 *   So the module grouping, the hour allocation, the engagement threshold, and the final examination
 *   and its passing standard are ALL StateCourse decisions submitted for Board review. Contrast
 *   config/maine-course-engine.mjs, where the Commission sets the weights and the 75 percent passing
 *   grade and the engine must attribute them to the Commission. Here the attribution runs the other
 *   way: what the Board fixes is 72 hours and nineteen topics, and everything else is this school's
 *   proposal. A document that blurred that would be claiming the Board had approved an allocation it
 *   has never seen.
 *
 * A Wisconsin clock hour is 60 minutes. The arithmetic in this file depends on that and states it.
 *
 * Import-time checks hold the tables to what the rule fixes: 72 hours, nineteen topics, every topic
 * carried by a module, no module claiming a topic the rule does not list, and the hours running
 * 1 through 72 without a gap or an overlap. They exist because arithmetic drift in an hour table is
 * silent — it produces a course that looks complete and is not.
 *
 * Course version 1.0 submission draft — not approved. No Wisconsin pre-license credit is available.
 */

import MODULE_BANK from "./wisconsin/module-question-bank.mjs";

const COURSE_ID = "wi-salesperson-72-v1";

/* THE BOARD'S figures, from REEB 25.033. These two are the whole of what the rule fixes. */
const REQUIRED_CLOCK_HOURS = 72;
const MINUTES_PER_CLOCK_HOUR = 60;

/* StateCourse standards. The Board prescribes none of these. Every one is a proposal for review. */
const ENGAGEMENT_PASSING_PERCENT = 80;
const APPLIED_PASSING_PERCENT = 100;
const FINAL_EXAM_PASSING_PERCENT = 75;
const FINAL_EXAM_ITEMS = 100;

/* The Board's nineteen topics, transcribed from REEB 25.033(1) through (19). The subject text is the
   rule's; the hour figures beside each module below are not. */
const TOPICS = Object.freeze([
  { code: "T01", subsection: "REEB 25.033(1)", topic: "Real property" },
  { code: "T02", subsection: "REEB 25.033(2)", topic: "The real estate business" },
  { code: "T03", subsection: "REEB 25.033(3)", topic: "Real estate brokerage" },
  { code: "T04", subsection: "REEB 25.033(4)", topic: "Listing agreements" },
  { code: "T05", subsection: "REEB 25.033(5)", topic: "Interests in real estate" },
  { code: "T06", subsection: "REEB 25.033(6)", topic: "Legal descriptions" },
  { code: "T07", subsection: "REEB 25.033(7)", topic: "Taxes and other liens" },
  { code: "T08", subsection: "REEB 25.033(8)", topic: "Real estate contracts" },
  { code: "T09", subsection: "REEB 25.033(9)", topic: "Title records and transfers of title" },
  { code: "T10", subsection: "REEB 25.033(10)", topic: "Real estate finance and basic math" },
  { code: "T11", subsection: "REEB 25.033(11)", topic: "Appraisal and market analysis" },
  { code: "T12", subsection: "REEB 25.033(12)", topic: "Fair housing laws" },
  { code: "T13", subsection: "REEB 25.033(13)", topic: "Ethical real estate practices" },
  { code: "T14", subsection: "REEB 25.033(14)", topic: "Consumer protection" },
  { code: "T15", subsection: "REEB 25.033(15)", topic: "Leases" },
  { code: "T16", subsection: "REEB 25.033(16)", topic: "Property Management" },
  { code: "T17", subsection: "REEB 25.033(17)", topic: "Land use control and development" },
  { code: "T18", subsection: "REEB 25.033(18)", topic: "Environmental concerns" },
  { code: "T19", subsection: "REEB 25.033(19)", topic: "Miscellaneous Wisconsin license laws" }
].map((item) => Object.freeze(item)));

/* The hour allocation. A StateCourse proposal for Board review — REEB 25.033 allocates no hours. */
const MODULES = Object.freeze([
  { id: "module-01", sequence: 1, title: "Real property and the real estate business", firstHour: 1, hours: 5, topics: ["T01", "T02"] },
  { id: "module-02", sequence: 2, title: "Brokerage and agency", firstHour: 6, hours: 7, topics: ["T03"] },
  { id: "module-03", sequence: 3, title: "Listing agreements", firstHour: 13, hours: 5, topics: ["T04"] },
  { id: "module-04", sequence: 4, title: "Interests in real estate and legal descriptions", firstHour: 18, hours: 6, topics: ["T05", "T06"] },
  { id: "module-05", sequence: 5, title: "Taxes and other liens", firstHour: 24, hours: 4, topics: ["T07"] },
  { id: "module-06", sequence: 6, title: "Real estate contracts and the Board-approved forms", firstHour: 28, hours: 12, topics: ["T08"] },
  { id: "module-07", sequence: 7, title: "Title records and transfers of title", firstHour: 40, hours: 5, topics: ["T09"] },
  { id: "module-08", sequence: 8, title: "Real estate finance and basic math", firstHour: 45, hours: 7, topics: ["T10"] },
  { id: "module-09", sequence: 9, title: "Appraisal and market analysis", firstHour: 52, hours: 4, topics: ["T11"] },
  { id: "module-10", sequence: 10, title: "Fair housing, ethics, and consumer protection", firstHour: 56, hours: 7, topics: ["T12", "T13", "T14"] },
  { id: "module-11", sequence: 11, title: "Leases and property management", firstHour: 63, hours: 4, topics: ["T15", "T16"] },
  { id: "module-12", sequence: 12, title: "Land use control and environmental concerns", firstHour: 67, hours: 3, topics: ["T17", "T18"] },
  { id: "module-13", sequence: 13, title: "Miscellaneous Wisconsin license laws, trust funds, and escrow", firstHour: 70, hours: 3, topics: ["T19"] }
].map((item) => Object.freeze({
  ...item,
  lastHour: item.firstHour + item.hours - 1,
  minutes: item.hours * MINUTES_PER_CLOCK_HOUR,
  topics: Object.freeze([...item.topics]),
  curriculumPath: `wisconsin/curriculum/${item.id}.md`
})));

/* The rule fixes 72. A module table that totals anything else is not the course the rule describes. */
const totalHours = MODULES.reduce((sum, module) => sum + module.hours, 0);
if (totalHours !== REQUIRED_CLOCK_HOURS) {
  throw new Error(`Wisconsin course engine: modules total ${totalHours} clock hours; REEB 25.033 requires ${REQUIRED_CLOCK_HOURS}.`);
}

/* The hours must run 1 through 72 exactly once each. A gap means an hour nobody teaches; an overlap
   means an hour counted twice, which is 72 hours of credit for less than 72 hours of instruction. */
const claimedHours = [];
for (const module of MODULES) {
  for (let hour = module.firstHour; hour <= module.lastHour; hour += 1) claimedHours.push(hour);
}
const uniqueHours = new Set(claimedHours);
if (claimedHours.length !== uniqueHours.size) {
  throw new Error("Wisconsin course engine: two modules claim the same clock hour.");
}
for (let hour = 1; hour <= REQUIRED_CLOCK_HOURS; hour += 1) {
  if (!uniqueHours.has(hour)) throw new Error(`Wisconsin course engine: hour ${hour} is claimed by no module.`);
}

if (TOPICS.length !== 19) {
  throw new Error(`Wisconsin course engine: REEB 25.033 lists nineteen topics; ${TOPICS.length} are transcribed.`);
}

const coveredTopics = new Set(MODULES.flatMap((module) => module.topics));
const uncovered = TOPICS.filter((topic) => !coveredTopics.has(topic.code));
if (uncovered.length) {
  throw new Error(`Wisconsin course engine: REEB 25.033 topics carried by no module: ${uncovered.map((t) => `${t.subsection} ${t.topic}`).join("; ")}`);
}
const unknown = [...coveredTopics].filter((code) => !TOPICS.some((topic) => topic.code === code));
if (unknown.length) {
  throw new Error(`Wisconsin course engine: modules claim topics REEB 25.033 does not list: ${unknown.join(", ")}`);
}

/* Every module must have a question bank, or a student could complete it without answering anything. */
const bankless = MODULES.filter((module) => !MODULE_BANK[module.id]);
if (bankless.length) {
  throw new Error(`Wisconsin course engine: modules with no question bank: ${bankless.map((m) => m.id).join(", ")}`);
}

const PASSING_PERCENT = Object.freeze({
  applied: APPLIED_PASSING_PERCENT,
  engagement: ENGAGEMENT_PASSING_PERCENT,
  remediation: ENGAGEMENT_PASSING_PERCENT
});

const FINAL_EXAM = Object.freeze({
  id: "final-exam",
  items: FINAL_EXAM_ITEMS,
  passingPercent: FINAL_EXAM_PASSING_PERCENT,
  afterAllInstruction: true,
  prescribedByRule: false
});

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

export function getWisconsinCourse(courseId = COURSE_ID) {
  if (courseId !== COURSE_ID) return null;
  return Object.freeze({
    courseId: COURSE_ID,
    title: "Wisconsin Salesperson Pre-License Course",
    version: "1.0-submission-draft",
    state: "WI",
    regulator: "Wisconsin Real Estate Examining Board, Department of Safety and Professional Services",
    clockHours: REQUIRED_CLOCK_HOURS,
    minutesPerClockHour: MINUTES_PER_CLOCK_HOUR,
    instructionalMinutes: REQUIRED_CLOCK_HOURS * MINUTES_PER_CLOCK_HOUR,
    topics: TOPICS,
    modules: MODULES,
    finalExam: FINAL_EXAM,
    /* What the rule fixes. Short, because the rule fixes little. */
    boardRequirements: Object.freeze([
      `REEB 25.033 fixes the salesperson pre-license course at ${REQUIRED_CLOCK_HOURS} hours.`,
      "REEB 25.033(1) through (19) list nineteen topics that shall be included, with sub-items under most of them.",
      "The rule's own Note records that s. 70.043, Stats., cited at REEB 25.033(1)(f), was repealed by 2023 Wisconsin Act 12."
    ]),
    /* What this school decided. Long, because the rule leaves nearly everything open — and every
       item here is a proposal the Board has not seen, let alone approved. */
    stateCourseDecisions: Object.freeze([
      "The grouping of the Board's nineteen topics into thirteen modules.",
      `The allocation of the ${REQUIRED_CLOCK_HOURS} hours among those modules. REEB 25.033 allocates no hours among its topics.`,
      `The ${ENGAGEMENT_PASSING_PERCENT} percent in-module engagement threshold and the ${APPLIED_PASSING_PERCENT} percent applied threshold. The rule prescribes no assessment and no passing score.`,
      `The ${FINAL_EXAM_ITEMS}-item final examination and its ${FINAL_EXAM_PASSING_PERCENT} percent passing standard. REEB 25.033 requires no final examination.`
    ]),
    engagementPassingPercent: ENGAGEMENT_PASSING_PERCENT,
    finalExamPassingPercent: FINAL_EXAM_PASSING_PERCENT,
    approvalStatus: "Not approved. No Wisconsin pre-license credit is available for this course."
  });
}

export function getWisconsinModule(moduleId) {
  return MODULES.find((item) => item.id === moduleId) ?? null;
}

export function getWisconsinAssessment(moduleId, kind = "engagement") {
  const module = getWisconsinModule(moduleId);
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

export function publicWisconsinAssessment(assessment) {
  if (!assessment) return null;
  return {
    id: assessment.id,
    kind: assessment.kind,
    moduleId: assessment.moduleId,
    passingPercent: assessment.passingPercent,
    items: assessment.items.map((item) => ({ id: item.id, prompt: item.prompt, choices: [...item.choices] }))
  };
}

export function scoreWisconsinAssessment(assessment, answers) {
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
 * Three gates, and they are deliberately not the same gate.
 *
 *   instructionComplete   all thirteen modules, all 72 hours.
 *   courseComplete        instruction plus the final examination passed. The final is a StateCourse
 *                         requirement, not the Board's, and the payload says so.
 *   certificateEligible   courseComplete AND a recorded Board approval number. Without an approval
 *                         there is no pre-license credit in existence to certify, so a certificate
 *                         issued anyway would certify nothing while looking exactly like one that did.
 */
export function wisconsinCreditedClockHours(moduleStates = [], options = {}) {
  const { finalExamPercent = null, approvalNumber = null } = options;

  const completed = new Set(
    moduleStates.filter((state) => state?.status === "completed").map((state) => state.module_id ?? state.moduleId)
  );
  const credited = MODULES.filter((module) => completed.has(module.id));
  const creditedHours = credited.reduce((sum, module) => sum + module.hours, 0);
  const instructionComplete = credited.length === MODULES.length;

  const finalPassed = typeof finalExamPercent === "number" && finalExamPercent >= FINAL_EXAM_PASSING_PERCENT;
  const courseComplete = instructionComplete && finalPassed;

  return {
    completedModules: credited.length,
    totalModules: MODULES.length,
    creditedClockHours: creditedHours,
    requiredClockHours: REQUIRED_CLOCK_HOURS,
    creditedMinutes: creditedHours * MINUTES_PER_CLOCK_HOUR,
    topicsCovered: Object.freeze([...new Set(credited.flatMap((module) => module.topics))].sort()),
    instructionComplete,
    finalExamPassed: finalPassed,
    finalExamPassingPercent: FINAL_EXAM_PASSING_PERCENT,
    courseComplete,
    certificateEligible: courseComplete && Boolean(approvalNumber),
    certificateBlockedBy: (() => {
      if (!instructionComplete) {
        return `Not all ${REQUIRED_CLOCK_HOURS} clock hours completed (${creditedHours} of ${REQUIRED_CLOCK_HOURS}).`;
      }
      if (!finalPassed) {
        return finalExamPercent === null
          ? "The final examination, delivered after all instruction, has not been taken."
          : `The final examination was scored at ${finalExamPercent} percent, below the ${FINAL_EXAM_PASSING_PERCENT} percent standard.`;
      }
      if (!approvalNumber) {
        return "No Wisconsin Real Estate Examining Board course approval number is recorded, so no pre-license credit exists to certify.";
      }
      return null;
    })()
  };
}

export const WISCONSIN_COURSE_ID = COURSE_ID;
export const WISCONSIN_MODULE_IDS = Object.freeze(MODULES.map((item) => item.id));
export const WISCONSIN_TOPICS = TOPICS;
export const WISCONSIN_REQUIRED_CLOCK_HOURS = REQUIRED_CLOCK_HOURS;
