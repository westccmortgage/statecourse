/** Florida Course I periodic-assessment bank — formative only, never an end-course exam bank. */
import { SECTION_PLANS } from "./course-i-curriculum.mjs";

const promptFor = (objective) => {
  const text = objective.text.replace(/\.$/, "");
  if (/^(calculate|compute|prorate|convert|measure|demonstrate)/i.test(text)) {
    return `Complete a worked example that requires you to ${text.charAt(0).toLowerCase()}${text.slice(1)}. Show each input, formula or decision step, result, and one independent check.`;
  }
  if (/^(distinguish|compare|contrast|differentiate)/i.test(text)) {
    return `Build a comparison using at least two stated facts, then resolve a short scenario in which you must ${text.charAt(0).toLowerCase()}${text.slice(1)}.`;
  }
  if (/^(list|identify|recognize)/i.test(text)) {
    return `Without looking back, ${text.charAt(0).toLowerCase()}${text.slice(1)}; then apply the list to a supplied transaction fact and explain which element controls.`;
  }
  return `Explain and apply this objective to a supplied Florida transaction: ${text}. State the rule or concept, material facts, conclusion, and source used.`;
};

export const PERIODIC_ASSESSMENTS = Object.freeze(SECTION_PLANS.flatMap((section) =>
  section.learningObjectives.map((objective) => Object.freeze({
    id: `FL-PA-${String(section.number).padStart(2, "0")}-${String(objective.n).padStart(2, "0")}`,
    section: section.number,
    objective: `${section.number}.${objective.n}`,
    syllabusPage: objective.page,
    type: "constructed response / worked application",
    prompt: promptFor(objective),
    rubric: Object.freeze([
      "identifies the governing concept or calculation method",
      "uses every material fact and rejects irrelevant facts",
      "reaches a supported conclusion or verified numerical result",
      "cites the assigned curriculum page and, for a regulated proposition, the held primary source",
    ]),
    estimatedMinutes: 6,
    formativeOnly: true,
    eligibleForEndCourseExam: false,
  })),
));

export const MODULE_MASTERY_POLICY = Object.freeze({
  thresholdPercent: 80,
  isFloridaMinimum: false,
  remediationRequiredBelowThreshold: true,
  remediation: "return the learner to the cited curriculum page, require a new fact pattern, and record the second result without replacing the first attempt",
  finalExamEffect: "all 19 sections and their remediation must be complete before the end-course examination unlocks",
});

export default Object.freeze({ PERIODIC_ASSESSMENTS, MODULE_MASTERY_POLICY });
