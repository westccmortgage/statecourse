/**
 * Texas Law of Contracts - pre-authoring instructional time budget derived from LOC-0.
 *
 * LOC-0 controls the 1,500 minutes and each topic subtotal. The rates and activity allowances below
 * are StateCourse methodology, not TREC figures. They reserve real learner work before prose is
 * written, then turn each topic's remaining minutes into a minimum first-pass reading allowance.
 * A topic-specific shortfall may not be offset with time from another topic.
 *
 * This is a build constraint, not evidence that instruction exists. Authored time evidence must
 * later replace planned counts with measurements from the files on disk.
 */

import { FORM, TOPICS, ALL_UNITS } from "./law-of-contracts-course-form.mjs";

export const RATES = Object.freeze({
  label: "PROVIDER_METHODOLOGY",
  firstPassWordsPerMinute: 140,
  activityMinutes: Object.freeze({
    statuteReadingExercise: 12,
    appliedExercise: 10,
    quizItem: 2,
    misconceptionCheck: 3,
    scenario: 20,
    moduleRecap: 5,
  }),
  replacementSeenFraction: 1 / 3,
});

/**
 * One primary topic-quiz item is reserved for every LOC-0 unit, with a floor of three per topic.
 * That exceeds 22 TAC § 535.62(b)(7)'s three-question topic-quiz minimum while keeping every printed
 * unit assessable. Five scenarios are distributed across formation, business contracts, the sales
 * contract, financing, and closing; none borrows another topic's prescribed time.
 */
const PLAN = Object.freeze({
  T01: Object.freeze({ statuteReadingExercises: 2, appliedExercises: 2, scenarios: 1, misconceptionChecks: 1 }),
  T02: Object.freeze({ statuteReadingExercises: 1, appliedExercises: 2, scenarios: 0, misconceptionChecks: 0 }),
  T03: Object.freeze({ statuteReadingExercises: 1, appliedExercises: 1, scenarios: 0, misconceptionChecks: 0 }),
  T04: Object.freeze({ statuteReadingExercises: 1, appliedExercises: 2, scenarios: 0, misconceptionChecks: 1 }),
  T05: Object.freeze({ statuteReadingExercises: 2, appliedExercises: 3, scenarios: 1, misconceptionChecks: 1 }),
  T06: Object.freeze({ statuteReadingExercises: 2, appliedExercises: 2, scenarios: 1, misconceptionChecks: 0 }),
  T07: Object.freeze({ statuteReadingExercises: 1, appliedExercises: 2, scenarios: 0, misconceptionChecks: 0 }),
  T08: Object.freeze({ statuteReadingExercises: 2, appliedExercises: 3, scenarios: 1, misconceptionChecks: 1 }),
  T09: Object.freeze({ statuteReadingExercises: 1, appliedExercises: 1, scenarios: 0, misconceptionChecks: 0 }),
  T10: Object.freeze({ statuteReadingExercises: 2, appliedExercises: 2, scenarios: 1, misconceptionChecks: 0 }),
  T11: Object.freeze({ statuteReadingExercises: 1, appliedExercises: 1, scenarios: 0, misconceptionChecks: 1 }),
});

const a = RATES.activityMinutes;

export const BUDGET = Object.freeze(
  TOPICS.map((topic) => {
    const plan = PLAN[topic.code];
    if (!plan) throw new Error(`LOC time budget: ${topic.code} has no activity plan`);

    const quizItems = Math.max(3, topic.units.length);
    const quizMinutes = quizItems * a.quizItem;
    const replacementMinutes = quizItems * a.quizItem * RATES.replacementSeenFraction;
    const exerciseMinutes =
      plan.statuteReadingExercises * a.statuteReadingExercise +
      plan.appliedExercises * a.appliedExercise;
    const scenarioMinutes = plan.scenarios * a.scenario;
    const misconceptionMinutes = plan.misconceptionChecks * a.misconceptionCheck;
    const activityMinutes =
      quizMinutes + exerciseMinutes + scenarioMinutes + misconceptionMinutes + a.moduleRecap;
    const readingMinutes = topic.subtotalMinutes - activityMinutes;

    return Object.freeze({
      topicCode: topic.code,
      topic: topic.topic,
      units: topic.units.length,
      prescribedMinutes: topic.subtotalMinutes,
      quizItems,
      quizMinutes,
      replacementMinutes,
      statuteReadingExercises: plan.statuteReadingExercises,
      appliedExercises: plan.appliedExercises,
      exerciseMinutes,
      scenarios: plan.scenarios,
      scenarioMinutes,
      misconceptionChecks: plan.misconceptionChecks,
      misconceptionMinutes,
      recapMinutes: a.moduleRecap,
      activityMinutes,
      readingMinutes,
      minimumProseWords: Math.max(0, readingMinutes) * RATES.firstPassWordsPerMinute,
      activityOverrunMinutes: readingMinutes < 0 ? -readingMinutes : 0,
    });
  }),
);

export const TOTALS = Object.freeze({
  prescribedMinutes: FORM.totalMinutes,
  budgetedMinutes: BUDGET.reduce((sum, topic) => sum + topic.prescribedMinutes, 0),
  activityMinutes: BUDGET.reduce((sum, topic) => sum + topic.activityMinutes, 0),
  readingMinutes: BUDGET.reduce((sum, topic) => sum + Math.max(0, topic.readingMinutes), 0),
  quizItems: BUDGET.reduce((sum, topic) => sum + topic.quizItems, 0),
  conditionalReplacementMinutes: BUDGET.reduce((sum, topic) => sum + topic.replacementMinutes, 0),
  statuteReadingExercises: BUDGET.reduce((sum, topic) => sum + topic.statuteReadingExercises, 0),
  appliedExercises: BUDGET.reduce((sum, topic) => sum + topic.appliedExercises, 0),
  scenarios: BUDGET.reduce((sum, topic) => sum + topic.scenarios, 0),
  misconceptionChecks: BUDGET.reduce((sum, topic) => sum + topic.misconceptionChecks, 0),
  minimumProseWords: BUDGET.reduce((sum, topic) => sum + topic.minimumProseWords, 0),
  activityOverrunMinutes: BUDGET.reduce((sum, topic) => sum + topic.activityOverrunMinutes, 0),
});

if (BUDGET.length !== TOPICS.length || Object.keys(PLAN).length !== TOPICS.length) {
  throw new Error(`LOC time budget: activity plan and LOC-0 must each carry ${TOPICS.length} topics`);
}
if (TOTALS.budgetedMinutes !== FORM.totalMinutes) {
  throw new Error(`LOC time budget: topic subtotals sum to ${TOTALS.budgetedMinutes}, LOC-0 states ${FORM.totalMinutes}`);
}
if (TOTALS.activityMinutes + TOTALS.readingMinutes !== FORM.totalMinutes) {
  throw new Error("LOC time budget: required activity and reading minutes must partition the form's 1,500 minutes exactly");
}
if (TOTALS.activityOverrunMinutes !== 0) {
  throw new Error(`LOC time budget: activity plan overruns topic allocations by ${TOTALS.activityOverrunMinutes} minutes`);
}
if (TOTALS.quizItems < ALL_UNITS.length) {
  throw new Error(`LOC time budget: ${TOTALS.quizItems} quiz items cannot assess ${ALL_UNITS.length} units`);
}
for (const topic of BUDGET) {
  if (topic.quizItems < 3) {
    throw new Error(`LOC time budget: ${topic.topicCode} budgets fewer than three primary topic-quiz items`);
  }
  if (topic.readingMinutes <= 0) {
    throw new Error(`LOC time budget: ${topic.topicCode} leaves no first-pass instruction time`);
  }
}
if (TOTALS.scenarios < 5) {
  throw new Error(`LOC time budget: only ${TOTALS.scenarios} applied scenarios are planned; StateCourse requires five`);
}

export default Object.freeze({ RATES, BUDGET, TOTALS });
