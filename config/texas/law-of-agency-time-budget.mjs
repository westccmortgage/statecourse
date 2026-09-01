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
    /* A short required item that names a common error in this topic and asks the student to say why
       it is wrong, drawn from the topic's own units. Three minutes covers reading the misconception,
       deciding, and reading the rationale. It exists because several topics fell a minute or two
       below their LOA-1 allocation after the reduction, and LOA-1's topic subtotals are
       topic-specific minima, not fungible course-wide time — a surplus in one topic may not cure a
       shortfall in another. Restoring deleted repetition to close those gaps would have been
       padding; a misconception check is work a student actually does. */
    misconceptionCheck: 3,
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
/**
 * Planned activity load per topic.
 *
 * THE FIRST VERSION OF THIS PLAN WAS UNIFORM AND THAT WAS THE MISTAKE. It gave almost every topic
 * two statute reading exercises and three applied exercises regardless of how many minutes LOA-1
 * allocates to the topic, which put 60 exercises and 696 minutes of activity into a 1,500-minute
 * course — 39% of it — and made T07 spend 59 of its 85 prescribed minutes on exercises before a
 * word of instruction. That, not the prose, was the largest single cause of the 292-minute excess
 * the disjoint reconciliation found. The load is now proportional to the topic's own allocation.
 *
 * NOTHING IS DELETED TO ACHIEVE THIS. An exercise beyond a topic's budgeted count moves into the
 * module's "## Optional reference:" section as optional practice: still in the course, still
 * sourced, not charged to every student.
 *
 * Quiz items are one per unit, floored at the three per topic the work order requires, so T07 and
 * T08 still carry three. Scenarios sit on four topics spread through the course.
 */
const PLAN = {
  T01: { statuteReadingExercises: 2, appliedExercises: 2, scenarios: 0, misconceptionChecks: 1 },
  T02: { statuteReadingExercises: 2, appliedExercises: 2, scenarios: 0, misconceptionChecks: 1 },
  T03: { statuteReadingExercises: 1, appliedExercises: 2, scenarios: 1, misconceptionChecks: 0 },
  T04: { statuteReadingExercises: 2, appliedExercises: 2, scenarios: 0, misconceptionChecks: 0 },
  T05: { statuteReadingExercises: 2, appliedExercises: 2, scenarios: 0, misconceptionChecks: 1 },
  /* The largest topic in the course and the one whose law is least compressible; it keeps the
     fullest exercise load. */
  T06: { statuteReadingExercises: 2, appliedExercises: 3, scenarios: 1, misconceptionChecks: 1 },
  /* 85 minutes across three units. Two statute exercises and three applied ones plus a recap would
     spend 59 of them before any instruction. */
  T07: { statuteReadingExercises: 1, appliedExercises: 1, scenarios: 0, misconceptionChecks: 1 },
  /* 45 minutes across two units — the smallest allocation in the course. */
  T08: { statuteReadingExercises: 1, appliedExercises: 1, scenarios: 0, misconceptionChecks: 0 },
  T09: { statuteReadingExercises: 1, appliedExercises: 2, scenarios: 1, misconceptionChecks: 0 },
  T10: { statuteReadingExercises: 2, appliedExercises: 2, scenarios: 0, misconceptionChecks: 1 },
  T11: { statuteReadingExercises: 2, appliedExercises: 2, scenarios: 1, misconceptionChecks: 0 },
  /* A FIFTH SCENARIO, placed on the capstone. After the reduction passes the course measured 1,490
     required minutes against LOA-1's 1,500 — a ten-minute shortfall, which matters because 1,500 is
     the MINIMUM instruction TREC requires for credit, not a target to approach from either side.
     Padding prose to close it would be the very thing the reduction removed. A fifth scenario is
     real required work a student must complete, the work order sets a floor of three rather than a
     ceiling, and five across twelve topics is well distributed.
     Its minutes attribute to T12 because that is how this budget attributes scenarios, but a
     capstone scenario draws on the whole course rather than on T12's five units — so T12's +17
     per-topic variance overstates what this topic alone asks of a student. */
  T12: { statuteReadingExercises: 2, appliedExercises: 2, scenarios: 0, misconceptionChecks: 1 },
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
    /* Replacement minutes are NOT part of the activity load that determines how much reading time a
       topic has left. A replacement question is served only after a wrong answer, and the time
       evidence reports it as conditional rather than required — so including it here made the
       budget's prose floor disagree with the time script's zero-variance point by a couple of
       hundred words per topic, and an author trying to hit the floor was aiming at the wrong
       number. It is computed and reported, but it does not consume the topic's allocation. */
    const misconceptionMinutes = (plan.misconceptionChecks ?? 0) * a.misconceptionCheck;
    const activityMinutes = quizMinutes + exerciseMinutes + scenarioMinutes + misconceptionMinutes + a.moduleRecap;
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
      misconceptionChecks: plan.misconceptionChecks ?? 0,
      misconceptionMinutes,
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

/**
 * THE CAPSTONE SCENARIO IS COURSE-LEVEL TIME, NOT T12's.
 *
 * It was briefly budgeted to T12 because that is where the capstone module sits, which made T12 look
 * seventeen minutes over its allocation while the work the scenario asks for draws on the whole
 * course. Attributing a cross-topic exercise to whichever file happens to hold it is an accounting
 * artefact, and it also let a surplus in one topic appear to cure shortfalls in others. It is
 * reported here, outside the topic table, and every topic is required to meet its own LOA-1
 * allocation without it.
 */
export const COURSE_LEVEL = Object.freeze({
  capstoneScenarios: 1,
  minutes: 1 * RATES.activityMinutes.scenario,
  note: "An integrated scenario drawing on every topic. Counted once, at course level, and not attributed to any single topic's allocation.",
});

export const TOTALS = Object.freeze({
  prescribedMinutes: FORM.totalMinutes,
  budgetedMinutes: BUDGET.reduce((s, b) => s + b.prescribedMinutes, 0),
  activityMinutes: BUDGET.reduce((s, b) => s + b.activityMinutes, 0),
  readingMinutes: BUDGET.reduce((s, b) => s + Math.max(0, b.readingMinutes), 0),
  quizItems: BUDGET.reduce((s, b) => s + b.quizItems, 0),
  statuteReadingExercises: BUDGET.reduce((s, b) => s + b.statuteReadingExercises, 0),
  appliedExercises: BUDGET.reduce((s, b) => s + b.appliedExercises, 0),
  scenarios: BUDGET.reduce((s, b) => s + b.scenarios, 0) + COURSE_LEVEL.capstoneScenarios,
  topicScenarios: BUDGET.reduce((s, b) => s + b.scenarios, 0),
  misconceptionChecks: BUDGET.reduce((s, b) => s + b.misconceptionChecks, 0),
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
