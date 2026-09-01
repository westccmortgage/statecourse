/**
 * Virginia Principles and Practices of Real Estate (60 class hours) — course engine.
 *
 * 18VAC135-20-400 is the whole of the Board's content requirement, and it is unusually
 * spare. It lists twenty-five subjects, says they "must be included", and says the course
 * "must be at least 60 class hours". It allocates no hours among the subjects, prescribes
 * no assessment, and sets no passing score.
 *
 * That shape decides what this file can and cannot assert:
 *
 *   - REQUIRED_SUBJECTS is a transcription of the regulation. It is the Board's list.
 *   - COVERAGE maps each module to the subjects it teaches, and the import-time check below
 *     fails if any of the twenty-five is left uncovered. That check is the one thing in this
 *     file that enforces a Board requirement rather than a StateCourse decision.
 *   - The four-class-hours-per-module allocation is a StateCourse design decision. So is the
 *     80 percent engagement threshold. Every document stating either must say so, and the
 *     course object below carries the disclaimer so a reviewer reading JSON sees it.
 *
 * Two completion states, not one. The instructional requirement is the sixty class hours.
 * The monitored final assessment is administered AFTER the sixtieth hour and outside
 * instructional time, under `virginia/compliance/monitored-final-exam-sop.md`. A student who
 * has completed every module has completed the instruction; they have not completed the
 * course. Collapsing the two is how a school issues a certificate for something the student
 * has not done.
 *
 * A third gate sits above both: no certificate may issue while the course carries no Board
 * approval number, because a certificate for an unapproved course asserts credit that does
 * not exist.
 *
 * Course version 1.0 submission draft — not approved. No Virginia pre-license credit is
 * available.
 */

import MODULE_BANK from "./virginia/module-question-bank.mjs";

const COURSE_ID = "va-salesperson-principles-v1";

/* 18VAC135-20-400: "Such course must be at least 60 class hours." A Virginia class hour is
   50 minutes of instruction, which is the figure every contact-time claim in the submission
   package resolves to. Stated here so a reviewer can find it in code. */
const REQUIRED_CLASS_HOURS = 60;
const MINUTES_PER_CLASS_HOUR = 50;

/* StateCourse design decision, NOT a Board requirement. 18VAC135-20-400 allocates no hours
   among the twenty-five subjects. */
const CLASS_HOURS_PER_MODULE = 4;

/* StateCourse instructional standard, NOT a Board requirement. Virginia prescribes no passing
   score for in-course assessment. Contrast Kansas, where K.A.R. 86-1-10(c)(5) sets 90 percent
   as the regulator's own certificate condition — there the figure would be the state's. */
const ENGAGEMENT_PASSING_PERCENT = 80;
const APPLIED_PASSING_PERCENT = 100;

/* 18VAC135-20-400, transcribed. The order and the wording are the regulation's. */
const REQUIRED_SUBJECTS = Object.freeze([
  { code: "T01", subject: "Economy and social impact of real estate" },
  { code: "T02", subject: "Real estate market and analysis" },
  { code: "T03", subject: "Property rights" },
  { code: "T04", subject: "Contracts" },
  { code: "T05", subject: "Deeds" },
  { code: "T06", subject: "Mortgages and deeds of trust" },
  { code: "T07", subject: "Types of mortgages" },
  { code: "T08", subject: "Leases" },
  { code: "T09", subject: "Liens" },
  { code: "T10", subject: "Home ownership" },
  { code: "T11", subject: "Real property and title insurance" },
  { code: "T12", subject: "Investment" },
  { code: "T13", subject: "Taxes in real estate" },
  { code: "T14", subject: "Real estate financing" },
  { code: "T15", subject: "Brokerage agreements and agency contract responsibilities" },
  { code: "T16", subject: "Real estate marketing" },
  { code: "T17", subject: "Real property management" },
  { code: "T18", subject: "Search, examination, and registration of title" },
  { code: "T19", subject: "Title closing" },
  { code: "T20", subject: "Appraisal of residential and income producing property" },
  { code: "T21", subject: "Planning subdivision developments and condominiums" },
  { code: "T22", subject: "Regulatory statutes" },
  { code: "T23", subject: "Housing legislation" },
  { code: "T24", subject: "Fair housing statutes" },
  { code: "T25", subject: "Real Estate Board regulations" }
].map((item) => Object.freeze(item)));

/* Each entry is one Course Day of four class hours. `subjects` is the coverage claim the
   submission package makes for that module, and the assertion below holds the package to it. */
const MODULES = Object.freeze([
  { id: "module-01", sequence: 1, title: "The market, the product, and what is being sold", hours: [1, 2, 3, 4], subjects: ["T01", "T02", "T03"] },
  { id: "module-02", sequence: 2, title: "Estates, ownership, private rights, and public control", hours: [5, 6, 7, 8], subjects: ["T03", "T09", "T10", "T21", "T22"] },
  { id: "module-03", sequence: 3, title: "Describing land, conveying it, and proving title", hours: [9, 10, 11, 12], subjects: ["T03", "T05", "T11", "T18"] },
  { id: "module-04", sequence: 4, title: "Liens, taxes, and the law of contracts", hours: [13, 14, 15, 16], subjects: ["T04", "T09", "T13", "T18"] },
  { id: "module-05", sequence: 5, title: "The sales contract, disclosure, and the start of agency", hours: [17, 18, 19, 20], subjects: ["T04", "T15", "T19", "T22", "T23"] },
  { id: "module-06", sequence: 6, title: "Virginia brokerage relationships, licensing, and discipline", hours: [21, 22, 23, 24], subjects: ["T15", "T22", "T25"] },
  { id: "module-07", sequence: 7, title: "Escrow, records, advertising, and fair housing", hours: [25, 26, 27, 28], subjects: ["T16", "T23", "T24", "T25"] },
  { id: "module-08", sequence: 8, title: "Common-interest communities and leasing", hours: [29, 30, 31, 32], subjects: ["T08", "T10", "T21", "T22", "T23"] },
  { id: "module-09", sequence: 9, title: "Property management and the instruments of finance", hours: [33, 34, 35, 36], subjects: ["T06", "T07", "T08", "T09", "T14", "T17", "T25"] },
  { id: "module-10", sequence: 10, title: "Financing a transaction and closing it", hours: [37, 38, 39, 40], subjects: ["T07", "T11", "T14", "T18", "T19", "T23"] },
  { id: "module-11", sequence: 11, title: "Prorations and the appraisal of property", hours: [41, 42, 43, 44], subjects: ["T12", "T13", "T19", "T20"] },
  { id: "module-12", sequence: 12, title: "Investment, feasibility, and the physical property", hours: [45, 46, 47, 48], subjects: ["T02", "T10", "T12", "T13", "T20", "T21"] },
  { id: "module-13", sequence: 13, title: "Insurance, risk, and two integrated transactions", hours: [49, 50, 51, 52], subjects: ["T04", "T06", "T07", "T11", "T14", "T15", "T16", "T19", "T22", "T23", "T25"] },
  { id: "module-14", sequence: 14, title: "Case labs and mathematics mastery", hours: [53, 54, 55, 56], subjects: ["T02", "T08", "T13", "T14", "T15", "T16", "T17", "T20", "T22", "T24", "T25"] },
  { id: "module-15", sequence: 15, title: "Cumulative review, simulation, and readiness", hours: [57, 58, 59, 60], subjects: REQUIRED_SUBJECTS.map((item) => item.code) }
].map((item) => Object.freeze({
  ...item,
  classHours: CLASS_HOURS_PER_MODULE,
  hours: Object.freeze([...item.hours]),
  subjects: Object.freeze([...item.subjects]),
  curriculumPath: `virginia/curriculum/${item.id}.md`
})));

/* Three arithmetic facts a reviewer would otherwise have to check by hand. Throwing at import
   means a module cannot be added, removed, or renumbered without the hour count being
   reconciled — the failure mode being a submission that claims 60 hours and delivers 56. */
const totalClassHours = MODULES.reduce((sum, module) => sum + module.classHours, 0);
if (totalClassHours !== REQUIRED_CLASS_HOURS) {
  throw new Error(`Virginia course engine: modules total ${totalClassHours} class hours; 18VAC135-20-400 requires at least ${REQUIRED_CLASS_HOURS}.`);
}
const sequencedHours = MODULES.flatMap((module) => module.hours);
if (sequencedHours.length !== REQUIRED_CLASS_HOURS || new Set(sequencedHours).size !== REQUIRED_CLASS_HOURS) {
  throw new Error("Virginia course engine: the hour numbers across the modules are not exactly 1..60 with no gaps or repeats.");
}
for (const [index, hour] of sequencedHours.entries()) {
  if (hour !== index + 1) throw new Error(`Virginia course engine: hour sequence breaks at position ${index + 1} (found ${hour}).`);
}

/* The one check in this file that enforces a Board requirement rather than a StateCourse
   decision. 18VAC135-20-400 says the twenty-five subjects "must be included"; if the coverage
   map leaves one uncovered, the course does not satisfy the regulation and must not load. */
const coveredSubjects = new Set(MODULES.flatMap((module) => module.subjects));
const uncovered = REQUIRED_SUBJECTS.filter((item) => !coveredSubjects.has(item.code));
if (uncovered.length) {
  throw new Error(`Virginia course engine: 18VAC135-20-400 subjects not covered by any module: ${uncovered.map((item) => `${item.code} ${item.subject}`).join("; ")}`);
}
const unknownSubjects = [...coveredSubjects].filter((code) => !REQUIRED_SUBJECTS.some((item) => item.code === code));
if (unknownSubjects.length) {
  throw new Error(`Virginia course engine: coverage map claims subjects that are not in 18VAC135-20-400: ${unknownSubjects.join(", ")}`);
}

const PASSING_PERCENT = Object.freeze({
  applied: APPLIED_PASSING_PERCENT,
  engagement: ENGAGEMENT_PASSING_PERCENT,
  remediation: ENGAGEMENT_PASSING_PERCENT
});

/* Retention periods, from text read directly rather than from memory. All three are three
   years and all three are separate obligations; a firm that keeps one is not keeping the
   others. Exposed here because the platform, not a person, has to apply them. */
export const VIRGINIA_RETENTION_YEARS = Object.freeze({
  brokerageAgreements: { years: 3, from: "date of execution", source: "18VAC135-20-185 C 1" },
  dualAndDesignatedConsents: { years: 3, from: "date of execution", source: "18VAC135-20-185 C 1" },
  relationshipDisclosures: { years: 3, from: "fully executed purchase contract", source: "§ 54.1-2138 D" },
  supervisionRecords: { years: 3, from: "creation", source: "§ 54.1-2110.1 B 7" }
});

function hashKey(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

/* The presented order of the choices is a deterministic function of the item id, so the order
   is stable for as long as the item exists and a recorded selected_choice keeps its meaning
   permanently. Authoring puts the correct answer first for legibility; no student ever sees
   that order. */
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

export function getVirginiaCourse(courseId = COURSE_ID) {
  if (courseId !== COURSE_ID) return null;
  return Object.freeze({
    courseId: COURSE_ID,
    title: "Virginia Principles and Practices of Real Estate — Salesperson Pre-License",
    version: "1.0-submission-draft",
    state: "VA",
    regulator: "Virginia Real Estate Board, Department of Professional and Occupational Regulation",
    contentAuthority: "18VAC135-20-400",
    requiredClassHours: REQUIRED_CLASS_HOURS,
    minutesPerClassHour: MINUTES_PER_CLASS_HOUR,
    instructionalMinutes: REQUIRED_CLASS_HOURS * MINUTES_PER_CLASS_HOUR,
    moduleCount: MODULES.length,
    classHoursPerModule: CLASS_HOURS_PER_MODULE,
    engagementPassingPercent: ENGAGEMENT_PASSING_PERCENT,
    requiredSubjects: REQUIRED_SUBJECTS,
    modules: MODULES,
    /* Said in the payload rather than only in a comment, because a reviewer reading the JSON
       must not mistake a StateCourse decision for a Board requirement. */
    stateCourseDecisions: Object.freeze([
      "The allocation of four class hours to each of fifteen modules. 18VAC135-20-400 lists the twenty-five subjects and sets a 60 class hour floor; it allocates no hours among them.",
      `The ${ENGAGEMENT_PASSING_PERCENT} percent engagement threshold and the ${APPLIED_PASSING_PERCENT} percent applied threshold. Virginia prescribes no passing score for in-course assessment.`,
      "The requirement that remediation be completed before a module closes."
    ]),
    approvalStatus: "Not approved; no Virginia pre-license credit is available."
  });
}

export function getVirginiaModule(moduleId) {
  return MODULES.find((item) => item.id === moduleId) ?? null;
}

export function getVirginiaModuleForHour(hourNumber) {
  return MODULES.find((item) => item.hours.includes(hourNumber)) ?? null;
}

export function getVirginiaAssessment(moduleId, kind = "engagement") {
  const module = getVirginiaModule(moduleId);
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

/* The student payload never carries an answer key. Stripping happens per item so that adding
   a field to an item cannot accidentally leak it to the browser. */
export function publicVirginiaAssessment(assessment) {
  if (!assessment) return null;
  return {
    id: assessment.id,
    kind: assessment.kind,
    moduleId: assessment.moduleId,
    passingPercent: assessment.passingPercent,
    items: assessment.items.map((item) => ({ id: item.id, prompt: item.prompt, choices: [...item.choices] }))
  };
}

export function scoreVirginiaAssessment(assessment, answers) {
  if (!assessment) return null;
  if (!Array.isArray(answers) || answers.length !== assessment.items.length) return null;
  const results = [];
  for (const [index, item] of assessment.items.entries()) {
    /* Number(null), Number(""), Number(false) and Number([]) are all 0, so a coerced read
       would silently record choice 0 — a selection the student never made — into a permanent
       selected_choice. Accept a real number, or a string of digits from a form post, and
       nothing else. */
    const raw = answers[index];
    const selectedChoice = typeof raw === "number"
      ? raw
      : (typeof raw === "string" && /^\d+$/.test(raw.trim()) ? Number(raw.trim()) : Number.NaN);
    if (!Number.isInteger(selectedChoice) || selectedChoice < 0 || selectedChoice >= item.choices.length) return null;
    const correct = selectedChoice === item.correctChoice;
    results.push({ itemId: item.id, selectedChoice, correct, rationale: item.rationale });
  }
  const correctCount = results.filter((result) => result.correct).length;
  const percent = Math.round((correctCount / results.length) * 100);
  return { results, correctCount, total: results.length, percent, passed: percent >= assessment.passingPercent };
}

/**
 * Credit and completion.
 *
 * `instructionComplete` means all fifteen modules are complete, which is the sixty class
 * hours. It is NOT course completion: the monitored final assessment is administered after
 * the sixtieth hour and outside instructional time, and until it is passed the student has
 * finished the instruction and not the course.
 *
 * `certificateEligible` adds the approval gate. A certificate for a course the Board has not
 * approved asserts pre-license credit that does not exist, so the approval number is a
 * precondition rather than a decoration.
 */
export function virginiaCreditedClassHours(moduleStates = [], options = {}) {
  const { finalAssessmentPassed = false, approvalNumber = null } = options;
  const completed = new Set(
    moduleStates.filter((state) => state?.status === "completed").map((state) => state.module_id ?? state.moduleId)
  );
  const credited = MODULES.filter((module) => completed.has(module.id));
  const creditedClassHours = credited.reduce((sum, module) => sum + module.classHours, 0);
  const instructionComplete = credited.length === MODULES.length;
  const courseComplete = instructionComplete && Boolean(finalAssessmentPassed);

  return {
    completedModules: credited.length,
    creditedClassHours,
    creditedInstructionalMinutes: creditedClassHours * MINUTES_PER_CLASS_HOUR,
    requiredClassHours: REQUIRED_CLASS_HOURS,
    subjectsCovered: Object.freeze([...new Set(credited.flatMap((module) => module.subjects))].sort()),
    instructionComplete,
    finalAssessmentPassed: Boolean(finalAssessmentPassed),
    courseComplete,
    certificateEligible: courseComplete && Boolean(approvalNumber),
    certificateBlockedBy: (() => {
      if (!instructionComplete) {
        return `18VAC135-20-400: not all ${REQUIRED_CLASS_HOURS} class hours completed (${creditedClassHours} of ${REQUIRED_CLASS_HOURS}).`;
      }
      if (!finalAssessmentPassed) {
        return "The monitored final assessment, administered after the sixtieth instructional hour and outside instructional time, has not been passed.";
      }
      if (!approvalNumber) {
        return "No Virginia Real Estate Board course approval number is recorded, so no pre-license credit exists to certify.";
      }
      return null;
    })()
  };
}

export const VIRGINIA_COURSE_ID = COURSE_ID;
export const VIRGINIA_MODULE_IDS = Object.freeze(MODULES.map((item) => item.id));
export const VIRGINIA_REQUIRED_SUBJECTS = REQUIRED_SUBJECTS;
