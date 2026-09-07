import { TOPICS, FORM } from './promulgated-contract-forms-course-form.mjs';
import { TOPIC_QUIZZES } from './promulgated-contract-forms-question-bank.mjs';
import { SCENARIOS } from './promulgated-contract-forms-scenarios.mjs';

export const RATES = Object.freeze({
  label: 'PROVIDER_METHODOLOGY_NOT_TIME_STUDY', firstPassWordsPerMinute: 140,
  activityMinutes: Object.freeze({ statuteReadingExercise: 12, appliedExercise: 10, quizItem: 2, misconceptionCheck: 3, scenario: 20, moduleRecap: 5 }),
  timeStudyPerformed: false, observedLearnerMinutes: null,
});
/** Authored inventories, not a substitute for the audit's actual chapter parsing. A mismatch fails
 * the audit. These allowances include reading and feedback within the activity, excluded from
 * first-pass prose. No conditional replacement, final exam, retry, or optional work is credited. */
const INVENTORY = Object.freeze({
  T01: {statuteReadingExercises:2,appliedExercises:10}, T02: {statuteReadingExercises:4,appliedExercises:8},
  T03: {statuteReadingExercises:3,appliedExercises:10}, T04: {statuteReadingExercises:3,appliedExercises:9},
  T05: {statuteReadingExercises:3,appliedExercises:13}, T06: {statuteReadingExercises:6,appliedExercises:11},
  T07: {statuteReadingExercises:4,appliedExercises:13}, T08: {statuteReadingExercises:2,appliedExercises:7},
  T09: {statuteReadingExercises:1,appliedExercises:9},
});
export const BUDGET = Object.freeze(TOPICS.map(topic => {
  const inventory = INVENTORY[topic.code];
  const quizItems = TOPIC_QUIZZES[topic.code].length;
  const scenarios = SCENARIOS.filter(s => s.afterTopic === topic.code).length;
  const a = RATES.activityMinutes;
  const activityMinutes = inventory.statuteReadingExercises*a.statuteReadingExercise + inventory.appliedExercises*a.appliedExercise + quizItems*a.quizItem + scenarios*a.scenario + a.moduleRecap;
  return Object.freeze({topicCode:topic.code, topic:topic.topic, units:topic.units.length, prescribedMinutes:topic.subtotalMinutes,
    ...inventory, quizItems, scenarios, misconceptionChecks:0, recapMinutes:a.moduleRecap,
    activityMinutes, readingMinutes:Math.max(0,topic.subtotalMinutes-activityMinutes),
    minimumProseWords:Math.max(0,topic.subtotalMinutes-activityMinutes)*RATES.firstPassWordsPerMinute,
    activityOverrunMinutes:Math.max(0,activityMinutes-topic.subtotalMinutes),
  });
}));
export const MISCONCEPTION_CHECKS = Object.freeze([]);
export const COURSE_LEVEL = Object.freeze({ capstoneScenarios:0, minutes:0, note:'All four assessed scenarios are attributed once to their placement topics. No extra course-level time.' });
export const TOTALS = Object.freeze({prescribedMinutes:FORM.totalMinutes, budgetedMinutes:BUDGET.reduce((n,b)=>n+b.prescribedMinutes,0),
  activityMinutes:BUDGET.reduce((n,b)=>n+b.activityMinutes,0),minimumProseWords:BUDGET.reduce((n,b)=>n+b.minimumProseWords,0),
  statuteReadingExercises:BUDGET.reduce((n,b)=>n+b.statuteReadingExercises,0),appliedExercises:BUDGET.reduce((n,b)=>n+b.appliedExercises,0),
  quizItems:BUDGET.reduce((n,b)=>n+b.quizItems,0),scenarios:SCENARIOS.length,misconceptionChecks:0,
  activityOverrunMinutes:BUDGET.reduce((n,b)=>n+b.activityOverrunMinutes,0)});
if (TOTALS.budgetedMinutes !== 1500) throw new Error('PCF official budget does not sum to1500');

