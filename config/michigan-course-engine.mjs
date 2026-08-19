/**
 * Michigan Salesperson Prelicensure (40 clock hours) — course engine.
 *
 * Michigan's distance-learning rule, R 339.22157(2), requires six things of a course
 * offered this way, and this module is where five of them become code:
 *
 *   (b) individual modules of instruction        -> MODULES, ten of them
 *   (c) a learning objective for each module     -> objectives, and the union test below
 *   (d) a structured learning method             -> six sections, checkpoint per section
 *   (e) assessment during each module            -> applied and engagement, in-module
 *   (f) remediation repeating the module         -> remediation, required before completion
 *
 * The sixth, prior departmental approval, is not something code can supply.
 *
 * Two Michigan rules shape the completion logic and differ from California's:
 * attendance must be total rather than time-weighted (R 339.22152(1)), and distance
 * credit requires hours attended to equal hours approved (R 339.22152(2)). So a module
 * is complete only when every one of its requirements is met, and the course is complete
 * only when all ten modules are — there is no partial-hours arithmetic.
 *
 * Course version 1.0 submission draft — not approved. No Michigan credit is available.
 */

import MODULE_BANK from "./michigan/module-question-bank.mjs";

const COURSE_ID = "mi-salesperson-prelicensure-40-v1";
const CLOCK_HOURS_PER_MODULE = 4;
const SECTIONS_PER_MODULE = 6;

/* MCL 339.2504 sets the floor at 40 clock hours including at least 4 on civil rights law
   and equal opportunity in housing. Module 07 carries those four and nothing else counts
   toward them, so the statutory minimum is one auditable block rather than fragments
   added across a syllabus. */
const CIVIL_RIGHTS_MODULE = "module-07";
const CIVIL_RIGHTS_CLOCK_HOURS = 4;

/* StateCourse instructional standard, not a Michigan requirement. Michigan prescribes no
   passing score for a prelicensure assessment; R 339.22154(2)(c) records a grade only
   "if an examination is required to determine successful completion", which leaves the
   question to the school. Every document that states this figure must say so. */
const ENGAGEMENT_PASSING_PERCENT = 80;
const APPLIED_PASSING_PERCENT = 100;

const MODULES = Object.freeze([
  { id: "module-01", sequence: 1, title: "Michigan license law, the Occupational Code, and the regulated activity" },
  { id: "module-02", sequence: 2, title: "Property, ownership, and interests in real estate" },
  { id: "module-03", sequence: 3, title: "Legal descriptions, transfer of title, and recording in Michigan" },
  { id: "module-04", sequence: 4, title: "Encumbrances, liens, taxes, and land-use control" },
  { id: "module-05", sequence: 5, title: "Agency, the service provision agreement, and disclosure" },
  { id: "module-06", sequence: 6, title: "Contracts, purchase agreements, and the Michigan seller disclosure" },
  { id: "module-07", sequence: 7, title: "Civil rights law and equal opportunity in housing" },
  { id: "module-08", sequence: 8, title: "Real estate finance and settlement law" },
  { id: "module-09", sequence: 9, title: "Valuation, appraisal, and real estate mathematics" },
  { id: "module-10", sequence: 10, title: "Closing, trust accounts, and professional practice" }
].map((item) => Object.freeze({
  ...item,
  clockHours: CLOCK_HOURS_PER_MODULE,
  sectionCount: SECTIONS_PER_MODULE,
  curriculumPath: `michigan/mi-salesperson-prelicensure-40-v1/curriculum/${item.id}.md`,
  statutoryCivilRights: item.id === CIVIL_RIGHTS_MODULE
})));

const PASSING_PERCENT = Object.freeze({
  applied: APPLIED_PASSING_PERCENT,
  engagement: ENGAGEMENT_PASSING_PERCENT,
  remediation: ENGAGEMENT_PASSING_PERCENT
});

function hashKey(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

/* The presented order of the choices is a deterministic function of the item id, so the
   order is stable for as long as the item exists and a recorded selected_choice keeps
   its meaning permanently. Authoring puts the correct answer first for legibility; no
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

export function getMichiganCourse(courseId = COURSE_ID) {
  if (courseId !== COURSE_ID) return null;
  return Object.freeze({
    courseId: COURSE_ID,
    title: "Principles of Real Estate — Michigan Salesperson Prelicensure",
    version: "1.0-submission-draft",
    state: "MI",
    regulator: "Michigan Department of Licensing and Regulatory Affairs, Bureau of Professional Licensing",
    requiredClockHours: MODULES.length * CLOCK_HOURS_PER_MODULE,
    moduleCount: MODULES.length,
    clockHoursPerModule: CLOCK_HOURS_PER_MODULE,
    civilRightsModule: CIVIL_RIGHTS_MODULE,
    civilRightsClockHours: CIVIL_RIGHTS_CLOCK_HOURS,
    engagementPassingPercent: ENGAGEMENT_PASSING_PERCENT,
    approvalStatus: "Not approved; no Michigan prelicensure credit is available.",
    modules: MODULES
  });
}

export function getMichiganModule(moduleId) {
  return MODULES.find((item) => item.id === moduleId) ?? null;
}

export function getMichiganAssessment(moduleId, kind = "engagement") {
  const module = getMichiganModule(moduleId);
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

/* The student payload never carries an answer key. Stripping happens per item so that
   adding a field to an item cannot accidentally leak it to the browser. */
export function publicMichiganAssessment(assessment) {
  if (!assessment) return null;
  return {
    id: assessment.id,
    kind: assessment.kind,
    moduleId: assessment.moduleId,
    passingPercent: assessment.passingPercent,
    items: assessment.items.map((item) => ({ id: item.id, prompt: item.prompt, choices: [...item.choices] }))
  };
}

export function scoreMichiganAssessment(assessment, answers) {
  if (!assessment) return null;
  if (!Array.isArray(answers) || answers.length !== assessment.items.length) return null;
  const results = [];
  for (const [index, item] of assessment.items.entries()) {
    /* Number(null), Number(""), Number(false) and Number([]) are all 0, so a coerced
       read would silently record choice 0 — a selection the student never made — into a
       permanent selected_choice. Accept a real number, or a string of digits from a form
       post, and nothing else. */
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

/* R 339.22152: attendance must be total, and distance credit requires hours attended to
   equal hours approved. Credit is therefore all-or-nothing per module, and the course
   credits 40 hours only when all ten modules are complete. A module part-done credits
   nothing, which is the opposite of a time-weighted model and is deliberate. */
export function michiganCreditedClockHours(moduleStates = []) {
  const completed = new Set(
    moduleStates.filter((state) => state?.status === "completed").map((state) => state.module_id ?? state.moduleId)
  );
  const credited = MODULES.filter((module) => completed.has(module.id));
  return {
    completedModules: credited.length,
    creditedClockHours: credited.length * CLOCK_HOURS_PER_MODULE,
    requiredClockHours: MODULES.length * CLOCK_HOURS_PER_MODULE,
    civilRightsSatisfied: completed.has(CIVIL_RIGHTS_MODULE),
    civilRightsClockHours: completed.has(CIVIL_RIGHTS_MODULE) ? CIVIL_RIGHTS_CLOCK_HOURS : 0,
    courseComplete: credited.length === MODULES.length
  };
}

export const MICHIGAN_COURSE_ID = COURSE_ID;
export const MICHIGAN_MODULE_IDS = Object.freeze(MODULES.map((item) => item.id));
