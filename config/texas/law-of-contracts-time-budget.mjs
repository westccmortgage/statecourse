/**
 * Texas Law of Contracts — instructional time budget, derived from LOC-0's own prescribed minutes.
 *
 * WHY THIS FILE EXISTS. The control on authoring is not a word quota. A word target tells an author
 * to keep writing after the law has been taught, and the padding it produces is indistinguishable,
 * in a word count, from instruction. The control is the only number with authority behind it: the
 * minutes LOC-0 itself prescribes for each topic. This is the same model Principles I, Principles II
 * and Law of Agency use; the rates are deliberately identical, because two courses that price time
 * differently are two courses somebody has to check twice.
 *
 * HOW IT WORKS. Each topic's prescribed minutes are spent, not earned. Activities are budgeted
 * first — they are countable and their allowances are fixed by the provider time model — and
 * whatever minutes remain are reading minutes. Reading minutes times the first-pass rate give the
 * teaching prose that topic needs. That figure is a FLOOR for coverage, never a target to write
 * toward.
 *
 * EVERY ALLOCATION IS A TOPIC-SPECIFIC MINIMUM. LOC-0's eleven subtotals are not fungible
 * course-wide time. A surplus in Contracts Used in Real Estate may not cure a shortfall in
 * Conveyance of Title, and the time evidence report is required to show each topic meeting its own
 * allocation before it reports any total.
 *
 * NO DOUBLE COUNTING. Exercise and recap prose is paid for by its activity allowance and is NOT
 * also read at the first-pass rate. The word figures below are teaching prose only.
 *
 * THE MINUTES ARE THE FORM'S; THE RATES ARE THE PROVIDER'S. LOC-0 prescribes 1,500 minutes and
 * calls it 30 hours — the form's own 50-minute credit hour. No Texas rule states a words-per-minute
 * figure. The rates here are StateCourse's documented methodology and are labelled as such.
 */

import { TOPICS, FORM } from "./law-of-contracts-course-form.mjs";

export const RATES = Object.freeze({
  label: "PROVIDER_METHODOLOGY",
  firstPassWordsPerMinute: 140,
  masteryStudyWordsPerMinute: 60,
  activityMinutes: Object.freeze({
    statuteReadingExercise: 12,
    appliedExercise: 10,
    quizItem: 2,
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
 * Planned activity load per topic, proportional to the topic's own LOC-0 allocation rather than
 * uniform. A uniform load is what put 39% of Law of Agency's course time into exercises before a
 * word of instruction, and this course's spread of allocations — 60 minutes for Common Contract
 * Mistakes against 275 for Contracts Used in Real Estate — would make a uniform load worse still.
 *
 * SCENARIOS sit on the four topics where contract judgement is actually exercised across a whole
 * transaction: Contracts Used in Real Estate, The Sales Contract, Financing Real Estate, and
 * Transaction Process and Closing. A fifth is a course-level capstone reported outside the topic
 * table. Introduction to Contracts is deliberately not one of them: at 75 prescribed minutes a
 * twenty-minute scenario would consume more than a quarter of the topic before instruction, and the
 * doctrine it teaches is the input to the later scenarios rather than a scenario of its own.
 *
 * COMMON CONTRACT MISTAKES (T11) carries the heaviest applied load per prescribed minute, because
 * its two units — "Contract Examples" at 40 minutes and "Common Areas of Concern" at 20 — are
 * examples-and-diagnosis work by their own printed titles. Budgeting it like a doctrine topic would
 * mean writing prose about mistakes instead of having students find them.
 *
 * QUIZ ITEMS are one per unit, floored at three per topic, so T11's two units still carry three.
 */
const PLAN = {
  T01: { statuteReadingExercises: 2, appliedExercises: 2, scenarios: 0, misconceptionChecks: 1 },
  T02: { statuteReadingExercises: 1, appliedExercises: 2, scenarios: 0, misconceptionChecks: 1 },
  /* 75 minutes across five units — the second-smallest allocation. No scenario; see above. */
  T03: { statuteReadingExercises: 1, appliedExercises: 1, scenarios: 0, misconceptionChecks: 0 },
  T04: { statuteReadingExercises: 1, appliedExercises: 2, scenarios: 0, misconceptionChecks: 1 },
  /* The largest topic in the course, 275 minutes over fourteen units. Fullest load. */
  T05: { statuteReadingExercises: 2, appliedExercises: 3, scenarios: 1, misconceptionChecks: 1 },
  /* Nine units in 135 minutes. A second statute reading exercise here would push per-unit prose
     below what the units need, so the topic runs one statute exercise and keeps its scenario. */
  T06: { statuteReadingExercises: 1, appliedExercises: 2, scenarios: 1, misconceptionChecks: 0 },
  T07: { statuteReadingExercises: 1, appliedExercises: 2, scenarios: 0, misconceptionChecks: 1 },
  T08: { statuteReadingExercises: 2, appliedExercises: 3, scenarios: 1, misconceptionChecks: 1 },
  T09: { statuteReadingExercises: 1, appliedExercises: 1, scenarios: 0, misconceptionChecks: 0 },
  T10: { statuteReadingExercises: 1, appliedExercises: 2, scenarios: 1, misconceptionChecks: 0 },
  T11: { statuteReadingExercises: 1, appliedExercises: 2, scenarios: 0, misconceptionChecks: 0 },
};

const a = RATES.activityMinutes;

export const BUDGET = Object.freeze(
  TOPICS.map((topic) => {
    const plan = PLAN[topic.code];
    if (!plan) throw new Error(`LOC time budget: no activity plan for ${topic.code}`);
    const quizItems = Math.max(3, topic.units.length);
    const quizMinutes = quizItems * a.quizItem;
    const replacementMinutes = Math.round(quizItems * RATES.replacementSeenFraction * a.quizItem);
    const exerciseMinutes =
      plan.statuteReadingExercises * a.statuteReadingExercise + plan.appliedExercises * a.appliedExercise;
    const scenarioMinutes = plan.scenarios * a.scenario;
    /* Replacement minutes are NOT part of the activity load that determines how much reading time a
       topic has left. A replacement question is served only after a wrong answer, and the time
       evidence reports it as conditional rather than required. It is computed and reported, but it
       does not consume the topic's allocation. */
    const misconceptionMinutes = plan.misconceptionChecks * a.misconceptionCheck;
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
      misconceptionChecks: plan.misconceptionChecks,
      misconceptionMinutes,
      recapMinutes: a.moduleRecap,
      activityMinutes,
      readingMinutes,
      /* The teaching prose this topic must carry for its reading minutes to be real. A FLOOR for
         coverage, not a writing target. Negative reading minutes mean the activity load alone
         exceeds the topic's allocation; the floor is then zero and the overrun is reported. */
      minimumProseWords: Math.max(0, readingMinutes) * RATES.firstPassWordsPerMinute,
      minimumProseWordsPerUnit: Math.round((Math.max(0, readingMinutes) * RATES.firstPassWordsPerMinute) / topic.units.length),
      activityOverrunMinutes: readingMinutes < 0 ? -readingMinutes : 0,
    });
  }),
);

/**
 * THE CAPSTONE SCENARIO IS COURSE-LEVEL TIME, NOT ANY ONE TOPIC'S.
 *
 * It draws on the whole course. Attributing a cross-topic exercise to whichever module happens to
 * hold it is an accounting artefact, and it would also let a surplus in one topic appear to cure
 * shortfalls in others. It is reported here, outside the topic table, and every topic is required
 * to meet its own LOC-0 allocation without it.
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
  throw new Error(`LOC time budget: topic subtotals sum to ${TOTALS.budgetedMinutes}, form states ${FORM.totalMinutes}`);
}
if (BUDGET.length !== 11) throw new Error(`LOC time budget: ${BUDGET.length} topics, LOC-0 prescribes 11`);
const unitCount = TOPICS.reduce((s, t) => s + t.units.length, 0);
if (TOTALS.quizItems < unitCount) {
  throw new Error(`LOC time budget: ${TOTALS.quizItems} quiz items budgeted, ${unitCount} units require at least one each`);
}
for (const b of BUDGET) {
  if (b.quizItems < 3) throw new Error(`LOC time budget: ${b.topicCode} budgets ${b.quizItems} quiz items, at least 3 per topic are required`);
}
if (TOTALS.scenarios < 3) throw new Error(`LOC time budget: ${TOTALS.scenarios} scenarios budgeted, at least 3 required`);
/* An activity load that outruns its own topic's allocation is the failure mode this plan exists to
   prevent. It is reported rather than silently absorbed, and it may not happen at all. */
if (TOTALS.activityOverrunMinutes !== 0) {
  throw new Error(`LOC time budget: ${TOTALS.activityOverrunMinutes} minutes of activity load exceed their topics' own allocations`);
}

export default { RATES, BUDGET, COURSE_LEVEL, TOTALS };
