/**
 * Alaska Real Estate Salesperson Prelicense (40 contact hours) — course engine.
 *
 * Alaska is the first jurisdiction in this project where the regulator wrote the
 * syllabus. 12 AAC 64.063(c) names eight topics and fixes each one's contact hours,
 * and a course qualifying an applicant for an initial licence has to deliver exactly
 * them. So MODULES below is not a design decision — it is a transcription, and the
 * hour figures are the Commission's.
 *
 * Three Alaska rules shape the logic and differ from every earlier state:
 *
 *   12 AAC 64.063(g)(1)  a contact hour is a minimum of 50 minutes of instruction,
 *                        and modules carry different hour counts, so credit is
 *                        per-module rather than uniform.
 *   12 AAC 64.430(b)     a correspondence course must include an unanswered
 *                        examination or project activity turned in to the INSTRUCTOR
 *                        for grading upon completion. Machine scoring does not
 *                        satisfy this, so module completion alone never completes
 *                        the course.
 *   12 AAC 64.410(a)(8)  the student must complete the course AND an instructor
 *                        evaluation before a certificate may issue.
 *
 * The consequence is visible in alaskaCreditedContactHours below: a state in which
 * every module is complete is "instructionComplete", not "courseComplete", and the
 * certificate gate is a third thing again. Collapsing those three into one boolean
 * is how a school issues a certificate the rule does not authorise.
 *
 * Course version 1.0 submission draft — not certified. No Alaska credit is available.
 */

import MODULE_BANK from "./alaska/module-question-bank.mjs";

const COURSE_ID = "ak-salesperson-prelicense-40-v1";

/* 12 AAC 64.063(g)(1). Stated here because every contact-hour claim in the submission
   package resolves to this number, and a reviewer should be able to find it in code. */
const MINUTES_PER_CONTACT_HOUR = 50;

/* One instructional section per contact hour, so a reviewer counting sections is
   counting hours. That is a StateCourse design commitment, not an Alaska rule. */
const SECTIONS_PER_CONTACT_HOUR = 1;

/* StateCourse instructional standard, not an Alaska requirement. Alaska prescribes no
   passing score for in-course assessment; 12 AAC 64.430(b) requires an instructor-graded
   instrument and leaves its standard to the approved instructor. Every document that
   states this figure must say so. */
const ENGAGEMENT_PASSING_PERCENT = 80;
const APPLIED_PASSING_PERCENT = 100;

/* 12 AAC 64.063(c), verbatim in structure: the eight topics and the Commission's own
   contact-hour allocation. The total is 40 and the arithmetic is asserted below. */
const MODULES = Object.freeze([
  { id: "module-01", sequence: 1, contactHours: 6, topic: "Licensee relationships, disclosure, and conflict of interest" },
  { id: "module-02", sequence: 2, contactHours: 4, topic: "Forms of ownership" },
  { id: "module-03", sequence: 3, contactHours: 4, topic: "Property law, public and private rights and limitations" },
  { id: "module-04", sequence: 4, contactHours: 4, topic: "Forms of conveyances and recording of documents" },
  { id: "module-05", sequence: 5, contactHours: 8, topic: "Contracts and transaction documents" },
  { id: "module-06", sequence: 6, contactHours: 6, topic: "Financing instruments and accounting principles" },
  { id: "module-07", sequence: 7, contactHours: 6, topic: "Alaska real estate license law and Alaska landlord tenant law" },
  { id: "module-08", sequence: 8, contactHours: 2, topic: "Federal fair housing and RESPA laws" }
].map((item) => Object.freeze({
  ...item,
  title: item.topic,
  sectionCount: item.contactHours * SECTIONS_PER_CONTACT_HOUR,
  minimumMinutes: item.contactHours * MINUTES_PER_CONTACT_HOUR,
  curriculumPath: `alaska/${COURSE_ID}/curriculum/${item.id}.md`,
  regulatoryCitation: `12 AAC 64.063(c)(${item.sequence})`
})));

const REQUIRED_CONTACT_HOURS = MODULES.reduce((sum, item) => sum + item.contactHours, 0);

/* 12 AAC 64.063(c) totals 40. If a future edit to MODULES breaks that, the course stops
   being the course the Commission prescribed, and it should fail loudly at import rather
   than quietly award the wrong number of hours. */
if (REQUIRED_CONTACT_HOURS !== 40) {
  throw new Error(`Alaska course must total 40 contact hours under 12 AAC 64.063(c); got ${REQUIRED_CONTACT_HOURS}`);
}

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
   order is stable for as long as the item exists and a recorded selected_choice keeps its
   meaning permanently. Authoring puts the correct answer first for legibility; no student
   ever sees that order. */
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

export function getAlaskaCourse(courseId = COURSE_ID) {
  if (courseId !== COURSE_ID) return null;
  return Object.freeze({
    courseId: COURSE_ID,
    title: "Alaska Real Estate Salesperson Prelicense Education",
    version: "1.0-submission-draft",
    state: "AK",
    regulator: "Alaska Real Estate Commission, Department of Commerce, Community, and Economic Development",
    delivery: "correspondence",
    requiredContactHours: REQUIRED_CONTACT_HOURS,
    minutesPerContactHour: MINUTES_PER_CONTACT_HOUR,
    moduleCount: MODULES.length,
    outlineCitation: "12 AAC 64.063(c)",
    engagementPassingPercent: ENGAGEMENT_PASSING_PERCENT,
    instructorGradedInstrumentRequired: true,
    instructorGradedInstrumentCitation: "12 AAC 64.430(b)",
    instructorEvaluationCitation: "12 AAC 64.410(a)(8)",
    certificateFieldsCitation: "12 AAC 64.410(a)(9)",
    approvalStatus: "Not certified; no Alaska prelicense credit is available.",
    courseApprovalNumber: null,
    modules: MODULES
  });
}

export function getAlaskaModule(moduleId) {
  return MODULES.find((item) => item.id === moduleId) ?? null;
}

export function getAlaskaAssessment(moduleId, kind = "engagement") {
  const module = getAlaskaModule(moduleId);
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
export function publicAlaskaAssessment(assessment) {
  if (!assessment) return null;
  return {
    id: assessment.id,
    kind: assessment.kind,
    moduleId: assessment.moduleId,
    passingPercent: assessment.passingPercent,
    items: assessment.items.map((item) => ({ id: item.id, prompt: item.prompt, choices: [...item.choices] }))
  };
}

export function scoreAlaskaAssessment(assessment, answers) {
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

/**
 * Credit under the Alaska rules.
 *
 * Modules carry different hour counts, so credit is the sum of the completed modules'
 * hours rather than a count multiplied by a constant. Credit is all-or-nothing per
 * module: a module part-done credits nothing, because 12 AAC 64.410(a)(6) requires
 * students to be held to a strict attendance policy and a partly-viewed module is not
 * attendance at the whole of it.
 *
 * The three states are deliberately separate:
 *   instructionComplete  every module complete — the 40 hours have been delivered
 *   courseComplete       instruction complete AND the 12 AAC 64.430(b) instructor-graded
 *                        instrument submitted and graded
 *   certificateEligible  course complete AND the 12 AAC 64.410(a)(8) instructor
 *                        evaluation done AND a Commission course approval number exists,
 *                        because 12 AAC 64.410(a)(9) makes the approval number one of the
 *                        certificate's required fields
 */
export function alaskaCreditedContactHours(moduleStates = [], courseState = {}) {
  const completed = new Set(
    moduleStates.filter((state) => state?.status === "completed").map((state) => state.module_id ?? state.moduleId)
  );
  const credited = MODULES.filter((module) => completed.has(module.id));
  const creditedContactHours = credited.reduce((sum, module) => sum + module.contactHours, 0);
  const instructionComplete = credited.length === MODULES.length;

  const instrumentGraded = courseState?.instructor_graded_instrument_status === "graded"
    || courseState?.instructorGradedInstrumentStatus === "graded";
  const evaluationComplete = courseState?.instructor_evaluation_status === "completed"
    || courseState?.instructorEvaluationStatus === "completed";
  const approvalNumber = courseState?.course_approval_number ?? courseState?.courseApprovalNumber ?? null;

  const courseComplete = instructionComplete && instrumentGraded;

  return {
    completedModules: credited.length,
    moduleCount: MODULES.length,
    creditedContactHours,
    requiredContactHours: REQUIRED_CONTACT_HOURS,
    creditedMinimumMinutes: creditedContactHours * MINUTES_PER_CONTACT_HOUR,
    instructionComplete,
    instructorGradedInstrumentGraded: Boolean(instrumentGraded),
    instructorEvaluationComplete: Boolean(evaluationComplete),
    courseComplete,
    certificateEligible: courseComplete && Boolean(evaluationComplete) && Boolean(approvalNumber),
    /* Named so that a reviewer reading a rejected certificate request sees which rule
       stopped it rather than an unexplained false. */
    certificateBlockedBy: (() => {
      if (!instructionComplete) return "12 AAC 64.063(c): not all 40 contact hours completed";
      if (!instrumentGraded) return "12 AAC 64.430(b): end-of-course instrument not submitted and graded by the instructor";
      if (!evaluationComplete) return "12 AAC 64.410(a)(8): instructor evaluation not completed";
      if (!approvalNumber) return "12 AAC 64.410(a)(9): no Commission course approval number on the certification record";
      return null;
    })()
  };
}

export const ALASKA_COURSE_ID = COURSE_ID;
export const ALASKA_MODULE_IDS = Object.freeze(MODULES.map((item) => item.id));
export const ALASKA_CONTACT_HOUR_MINUTES = MINUTES_PER_CONTACT_HOUR;
