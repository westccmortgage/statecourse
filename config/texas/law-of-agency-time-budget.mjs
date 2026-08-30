/**
 * Texas Law of Agency — instructional time budget, derived from LOA-1's own prescribed minutes.
 *
 * WHY THIS FILE EXISTS. The first Law of Agency authoring brief carried a word quota — roughly
 * 102,000 words, apportioned across the twelve topics. That was the wrong control. A word target
 * tells an author to keep writing after the law has been taught, and the padding it produces is
 * indistinguishable, in a word count, from instruction. This file replaces the quota with the only
 * number that has any authority behind it: the minutes LOA-1 itself prescribes for each topic.
 *
 * HOW IT WORKS. Each topic's prescribed minutes are spent, not earned. Activities are budgeted
 * first — they are countable and their allowances are fixed by the provider time model — and
 * whatever minutes remain are reading minutes. Reading minutes times the first-pass rate give the
 * teaching prose that topic needs. That figure is a FLOOR for coverage, never a target to write
 * toward: a topic that teaches its units completely in fewer words has not failed, and a topic that
 * runs longer is fine when the excess is legally necessary and not repetition.
 *
 * NO DOUBLE COUNTING. Exercise and recap prose is paid for by its activity allowance and is NOT
 * also read at the first-pass rate. The word figures below are teaching prose only, which is what
 * scripts/check-loa-module-structure.mjs measures after excising exercise and recap blocks.
 *
 * THE T08 OVERRUN IS REAL AND IS NOT HIDDEN. Clarifying Agency Relationships carries 45 prescribed
 * minutes across two units. A module with the exercise load the other topics carry would spend more
 * than 45 minutes on activities alone, before a single word of instruction. T08 is therefore
 * budgeted with a reduced activity load, and the residual reading time is small. See T08's note.
 *
 * THE MINUTES ARE THE FORM'S; THE RATES ARE THE PROVIDER'S. LOA-1 prescribes 1,500 minutes and
 * calls it 30 hours — the form's own 50-minute credit hour. No Texas rule states a words-per-minute
 * figure. The rates here are StateCourse's documented methodology, identical to the model used for
 * Principles of Real Estate I and II, and are labelled as such wherever they appear.
 */

import { TOPICS, FORM } from "./law-of-agency-course-form.mjs";

/** Identical to the Principles I and II model. Two courses that price time differently are two
 *  courses somebody has to check twice. */
export const RATES = Object.freeze({
  label: "PROVIDER_METHODOLOGY",
  firstPassWordsPerMinute: 140,
  masteryStudyWordsPerMinute: 60,
  activityMinutes: Object.freeze({
    statuteReadingExercise: 12,
    appliedExercise: 10,
    quizItem: 2,
    scenario: 20,
    moduleRecap: 5,
  }),
  /* A replacement question is served only after an incorrect answer. Assuming every student sees
     every replacement overstates required time; assuming none understates it. One third is an
     assumption, stated here rather than buried in an arithmetic step. */
  replacementSeenFraction: 1 / 3,
});

/**
 * Planned activity load per topic. Quiz items are one per unit, floored at the three per topic the
 * work order requires, so T08's two units still carry three questions. Scenarios are placed on four
 * topics spread through the course rather than gathered at the end.
 */
const PLAN = {
  T01: { statuteReadingExercises: 2, appliedExercises: 3, scenarios: 0 },
  T02: { statuteReadingExercises: 2, appliedExercises: 3, scenarios: 0 },
  T03: { statuteReadingExercises: 2, appliedExercises: 3, scenarios: 1 },
  T04: { statuteReadingExercises: 2, appliedExercises: 3, scenarios: 0 },
  T05: { statuteReadingExercises: 2, appliedExercises: 3, scenarios: 0 },
  T06: { statuteReadingExercises: 2, appliedExercises: 3, scenarios: 1 },
  T07: { statuteReadingExercises: 2, appliedExercises: 3, scenarios: 0 },
  /* Reduced load. Two statute exercises and three applied exercises plus a recap would spend 59 of
     this topic's 45 prescribed minutes before any instruction. One of each keeps the topic inside
     its allocation and still gives the student something to do with the two rules it teaches. */
  T08: { statuteReadingExercises: 1, appliedExercises: 1, scenarios: 0 },
  T09: { statuteReadingExercises: 2, appliedExercises: 3, scenarios: 1 },
  T10: { statuteReadingExercises: 2, appliedExercises: 3, scenarios: 0 },
  T11: { statuteReadingExercises: 2, appliedExercises: 3, scenarios: 1 },
  T12: { statuteReadingExercises: 2, appliedExercises: 3, scenarios: 0 },
};

const a = RATES.activityMinutes;

export const BUDGET = Object.freeze(
  TOPICS.map((topic) => {
    const plan = PLAN[topic.code];
    const quizItems = Math.max(3, topic.units.length);
    const quizMinutes = quizItems * a.quizItem;
    const replacementMinutes = Math.round(quizItems * RATES.replacementSeenFraction * a.quizItem);
    const exerciseMinutes =
      plan.statuteReadingExercises * a.statuteReadingExercise + plan.appliedExercises * a.appliedExercise;
    const scenarioMinutes = plan.scenarios * a.scenario;
    const activityMinutes = quizMinutes + replacementMinutes + exerciseMinutes + scenarioMinutes + a.moduleRecap;
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
      recapMinutes: a.moduleRecap,
      activityMinutes,
      readingMinutes,
      /* The teaching prose this topic must carry for its reading minutes to be real. A FLOOR for
         coverage, not a writing target. Negative reading minutes mean the activity load alone
         exceeds the topic's allocation; the floor is then zero and the overrun is reported. */
      minimumProseWords: Math.max(0, readingMinutes) * RATES.firstPassWordsPerMinute,
      activityOverrunMinutes: readingMinutes < 0 ? -readingMinutes : 0,
    });
  }),
);

export const TOTALS = Object.freeze({
  prescribedMinutes: FORM.totalMinutes,
  budgetedMinutes: BUDGET.reduce((s, b) => s + b.prescribedMinutes, 0),
  activityMinutes: BUDGET.reduce((s, b) => s + b.activityMinutes, 0),
  readingMinutes: BUDGET.reduce((s, b) => s + Math.max(0, b.readingMinutes), 0),
  quizItems: BUDGET.reduce((s, b) => s + b.quizItems, 0),
  statuteReadingExercises: BUDGET.reduce((s, b) => s + b.statuteReadingExercises, 0),
  appliedExercises: BUDGET.reduce((s, b) => s + b.appliedExercises, 0),
  scenarios: BUDGET.reduce((s, b) => s + b.scenarios, 0),
  minimumProseWords: BUDGET.reduce((s, b) => s + b.minimumProseWords, 0),
  activityOverrunMinutes: BUDGET.reduce((s, b) => s + b.activityOverrunMinutes, 0),
});

/* ── load-time invariants ───────────────────────────────────────────────────────────────────── */

if (TOTALS.budgetedMinutes !== FORM.totalMinutes) {
  throw new Error(`LOA time budget: topic subtotals sum to ${TOTALS.budgetedMinutes}, form states ${FORM.totalMinutes}`);
}
if (BUDGET.length !== 12) throw new Error(`LOA time budget: ${BUDGET.length} topics, LOA-1 prescribes 12`);
if (TOTALS.quizItems < 57) throw new Error(`LOA time budget: ${TOTALS.quizItems} quiz items budgeted, 57 units require at least one each`);
for (const b of BUDGET) {
  if (b.quizItems < 3) throw new Error(`LOA time budget: ${b.topicCode} budgets ${b.quizItems} quiz items, the work order requires at least 3 per topic`);
}
if (TOTALS.scenarios < 3) throw new Error(`LOA time budget: ${TOTALS.scenarios} scenarios budgeted, at least 3 required`);

export default { RATES, BUDGET, TOTALS };
