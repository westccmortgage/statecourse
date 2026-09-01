/** Measured authoring evidence for substantive Law of Contracts topic checkpoints. */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TOPICS } from "./law-of-contracts-course-form.mjs";
import { RATES, BUDGET } from "./law-of-contracts-time-budget.mjs";
import { TOPIC_1_QUIZ, TOPIC_2_QUIZ } from "./law-of-contracts-question-bank.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const MODULE_1_PATH = "texas/tx-law-of-contracts-30-v1/curriculum/module-01.md";
export const MODULE_2_PATH = "texas/tx-law-of-contracts-30-v1/curriculum/module-02.md";

const countWords = (value) => value.trim().split(/\s+/u).filter(Boolean).length;
const headingType = (heading) => {
  if (/^### Statute reading exercise:/u.test(heading)) return "statuteReadingExercise";
  if (/^### Applied exercise:/u.test(heading)) return "appliedExercise";
  if (/^### Scenario:/u.test(heading)) return "scenario";
  if (/^### Misconception check\b/u.test(heading)) return "misconceptionCheck";
  if (/^### Module recap\b/u.test(heading)) return "moduleRecap";
  return null;
};

const fixedActivityMinutes = (segments) =>
  segments.reduce((sum, segment) => sum + RATES.activityMinutes[segment.type], 0);

/** Exact cumulative activities that sit after the last unit but assess the whole topic. */
const TOPIC_WIDE_ACTIVITY_HEADINGS = Object.freeze({
  T01: Object.freeze(["### Misconception check"]),
  T02: Object.freeze([]),
});

const proseWordsWithin = (text, start, end, excludedSegments) => {
  const proseSlices = [];
  let cursor = start;
  for (const segment of excludedSegments) {
    proseSlices.push(text.slice(cursor, segment.start));
    cursor = segment.end;
  }
  proseSlices.push(text.slice(cursor, end));
  return proseSlices.reduce((sum, slice) => sum + countWords(slice), 0);
};

const buildEvidence = ({ topicCode, module, path, quiz }) => {
  const text = readFileSync(join(REPO_ROOT, path), "utf8");
  const lineAt = (offset) => text.slice(0, offset).split("\n").length;
  const headings = [...text.matchAll(/^#{1,3}\s+.+$/gmu)].map((match) =>
    Object.freeze({ heading: match[0], start: match.index, type: headingType(match[0]) }),
  );
  const activitySegments = [];
  for (const [index, heading] of headings.entries()) {
    if (!heading.type) continue;
    const end = headings[index + 1]?.start ?? text.length;
    activitySegments.push(
      Object.freeze({
        type: heading.type,
        heading: heading.heading,
        start: heading.start,
        end,
        startLine: lineAt(heading.start),
        endLine: lineAt(end),
        words: countWords(text.slice(heading.start, end)),
      }),
    );
  }

  const proseSlices = [];
  let cursor = 0;
  for (const segment of activitySegments) {
    proseSlices.push(text.slice(cursor, segment.start));
    cursor = segment.end;
  }
  proseSlices.push(text.slice(cursor));

  const counts = Object.freeze({
    statuteReadingExercises: activitySegments.filter((segment) => segment.type === "statuteReadingExercise").length,
    appliedExercises: activitySegments.filter((segment) => segment.type === "appliedExercise").length,
    scenarios: activitySegments.filter((segment) => segment.type === "scenario").length,
    misconceptionChecks: activitySegments.filter((segment) => segment.type === "misconceptionCheck").length,
    moduleRecaps: activitySegments.filter((segment) => segment.type === "moduleRecap").length,
    quizItems: quiz.length,
    conditionalReplacementItems: quiz.length,
  });
  const topic = TOPICS.find((entry) => entry.code === topicCode);
  const budget = BUDGET.find((entry) => entry.topicCode === topicCode);
  const unitHeadingMatches = [...text.matchAll(/^## Unit: (.+)$/gmu)];
  const unitHeadings = unitHeadingMatches.map((match) => match[1]);
  const proseWords = proseSlices.reduce((sum, slice) => sum + countWords(slice), 0);
  const activityWords = activitySegments.reduce((sum, segment) => sum + segment.words, 0);
  const activityMinutes =
    counts.statuteReadingExercises * RATES.activityMinutes.statuteReadingExercise +
    counts.appliedExercises * RATES.activityMinutes.appliedExercise +
    counts.scenarios * RATES.activityMinutes.scenario +
    counts.misconceptionChecks * RATES.activityMinutes.misconceptionCheck +
    counts.moduleRecaps * RATES.activityMinutes.moduleRecap +
    counts.quizItems * RATES.activityMinutes.quizItem;
  const firstPassReadingMinutes = proseWords / RATES.firstPassWordsPerMinute;
  const measuredRequiredMinutes = firstPassReadingMinutes + activityMinutes;
  const recapStart = activitySegments.find((segment) => segment.type === "moduleRecap")?.start ?? text.length;
  const topicWideHeadings = new Set(TOPIC_WIDE_ACTIVITY_HEADINGS[topicCode] ?? []);
  const sharedActivitySegments = Object.freeze(
    activitySegments.filter((segment) => segment.type === "moduleRecap" || topicWideHeadings.has(segment.heading)),
  );
  const unitEvidence = Object.freeze(
    unitHeadingMatches.map((match, index) => {
      const unit = topic.units[index];
      const start = match.index;
      const end = unitHeadingMatches[index + 1]?.index ?? recapStart;
      const sliceActivitySegments = activitySegments.filter((segment) => segment.start >= start && segment.start < end);
      const localSegments = sliceActivitySegments.filter((segment) => !sharedActivitySegments.includes(segment));
      const localProseWords = proseWordsWithin(text, start, end, sliceActivitySegments);
      const localActivityWords = localSegments.reduce((sum, segment) => sum + segment.words, 0);
      const primaryQuizItems = quiz.filter((item) => item.unit === unit?.code).length;
      const localActivityMinutes = fixedActivityMinutes(localSegments);
      const primaryQuizMinutes = primaryQuizItems * RATES.activityMinutes.quizItem;
      const localMeasuredMinutes = localProseWords / RATES.firstPassWordsPerMinute + localActivityMinutes + primaryQuizMinutes;
      return Object.freeze({
        code: unit?.code ?? null,
        unit: match[1],
        suggestedMinutes: unit?.minutes ?? null,
        proseWords: localProseWords,
        activityWords: localActivityWords,
        fixedActivityMinutes: localActivityMinutes,
        primaryQuizItems,
        primaryQuizMinutes,
        measuredRequiredMinutes: localMeasuredMinutes,
        alterationFromSuggestedMinutes: localMeasuredMinutes - (unit?.minutes ?? 0),
      });
    }),
  );
  const sharedProseWords = proseWords - unitEvidence.reduce((sum, unit) => sum + unit.proseWords, 0);
  const sharedActivityWords = activityWords - unitEvidence.reduce((sum, unit) => sum + unit.activityWords, 0);
  const sharedActivityMinutes = activityMinutes - unitEvidence.reduce(
    (sum, unit) => sum + unit.fixedActivityMinutes + unit.primaryQuizMinutes,
    0,
  );
  const sharedRequiredMinutes = sharedProseWords / RATES.firstPassWordsPerMinute + sharedActivityMinutes;

  return Object.freeze({
    module,
    topicCode,
    topic: topic.topic,
    path,
    sha256: createHash("sha256").update(text).digest("hex"),
    prescribedMinutes: topic.subtotalMinutes,
    methodLabel: RATES.label,
    firstPassWordsPerMinute: RATES.firstPassWordsPerMinute,
    totalWords: countWords(text),
    proseWords,
    activityWords,
    minimumProseWords: budget.minimumProseWords,
    firstPassReadingMinutes,
    activityMinutes,
    measuredRequiredMinutes,
    surplusMinutes: measuredRequiredMinutes - topic.subtotalMinutes,
    counts,
    unitHeadings: Object.freeze(unitHeadings),
    unitEvidence,
    sharedProseWords,
    sharedActivityWords,
    sharedActivityMinutes,
    sharedActivitySegments,
    sharedRequiredMinutes,
    unitTimePolicy:
      "LOC-0 unit minutes are suggested and may be altered under the held TREC rule reproduction; every unit remains authored in its topic, every unit has a primary quiz item, and the topic subtotal is the enforced minimum. Shared topic introduction, topic-wide activity, and recap time is disclosed separately.",
    activitySegments: Object.freeze(activitySegments),
    conditionalReplacementPolicy:
      `Replacement items are remediation shown only after an incorrect primary response; their ${Number.isInteger(budget.replacementMinutes) ? budget.replacementMinutes : budget.replacementMinutes.toFixed(2)} expected-path minutes under the disclosed one-third provider assumption are not counted toward the required ${topic.subtotalMinutes}-minute path.`,
  });
};

const validateEvidence = (evidence) => {
  const problems = [];
  const topic = TOPICS.find((entry) => entry.code === evidence.topicCode);
  const budget = BUDGET.find((entry) => entry.topicCode === evidence.topicCode);
  const expectedUnits = topic.units.map((unit) => unit.unit);
  if (JSON.stringify(evidence.unitHeadings) !== JSON.stringify(expectedUnits)) problems.push(`${topic.units.length} LOC-0 unit headings are missing, extra, or out of order`);
  if (evidence.totalWords !== evidence.proseWords + evidence.activityWords) problems.push("prose and activity segments do not partition the module exactly");
  if (evidence.proseWords < budget.minimumProseWords) problems.push(`prose is ${budget.minimumProseWords - evidence.proseWords} words below the ${evidence.topicCode} minimum`);
  if (evidence.counts.statuteReadingExercises !== budget.statuteReadingExercises) problems.push("statute-reading count differs from budget");
  if (evidence.counts.appliedExercises !== budget.appliedExercises) problems.push("applied-exercise count differs from budget");
  if (evidence.counts.scenarios !== budget.scenarios) problems.push("scenario count differs from budget");
  if (evidence.counts.misconceptionChecks !== budget.misconceptionChecks) problems.push("misconception count differs from budget");
  if (evidence.counts.moduleRecaps !== 1) problems.push("module recap count is not one");
  if (evidence.counts.quizItems !== budget.quizItems) problems.push("primary quiz count differs from budget");
  if (evidence.activityMinutes !== budget.activityMinutes) problems.push("measured required activity minutes differ from budget");
  if (evidence.measuredRequiredMinutes < topic.subtotalMinutes) problems.push(`measured required path is shorter than ${topic.subtotalMinutes} minutes`);
  if (JSON.stringify(evidence.unitEvidence.map((unit) => unit.code)) !== JSON.stringify(topic.units.map((unit) => unit.code))) problems.push("unit evidence does not match the LOC-0 unit codes");
  if (evidence.unitEvidence.some((unit) => unit.primaryQuizItems !== 1)) problems.push("each authored unit must have exactly one primary quiz item");
  if (evidence.unitEvidence.some((unit) => unit.proseWords <= 0)) problems.push("each authored unit must contain substantive teaching prose");
  if (evidence.unitEvidence.reduce((sum, unit) => sum + unit.proseWords, 0) + evidence.sharedProseWords !== evidence.proseWords) problems.push("unit and shared prose do not reconcile to topic prose");
  if (evidence.unitEvidence.reduce((sum, unit) => sum + unit.activityWords, 0) + evidence.sharedActivityWords !== evidence.activityWords) problems.push("unit and shared activity words do not reconcile to topic activities");
  const reconstructedMinutes = evidence.unitEvidence.reduce((sum, unit) => sum + unit.measuredRequiredMinutes, 0) + evidence.sharedRequiredMinutes;
  if (Math.abs(reconstructedMinutes - evidence.measuredRequiredMinutes) > 1e-9) problems.push("unit and shared minutes do not reconcile to the required topic path");
  if (evidence.sharedActivitySegments.filter((segment) => segment.type === "moduleRecap").length !== 1) problems.push("shared activity evidence must contain exactly one module recap");
  if (evidence.sharedActivityMinutes !== fixedActivityMinutes(evidence.sharedActivitySegments)) problems.push("shared activity minutes do not match the disclosed shared segments");
  for (const [index, segment] of evidence.activitySegments.entries()) {
    if (segment.end <= segment.start || (index > 0 && segment.start < evidence.activitySegments[index - 1].end)) problems.push("activity segments overlap or are empty");
  }
  return Object.freeze({
    status: problems.length ? "FAIL" : "PASS",
    module: evidence.module,
    totalWords: evidence.totalWords,
    proseWords: evidence.proseWords,
    activityWords: evidence.activityWords,
    measuredRequiredMinutes: evidence.measuredRequiredMinutes,
    prescribedMinutes: evidence.prescribedMinutes,
    activitySegments: evidence.activitySegments.length,
    problems: Object.freeze(problems),
  });
};

/** Backward-compatible Topic 01 names used by the existing checkpoint tests. */
export const AUTHORING_EVIDENCE = buildEvidence({ topicCode: "T01", module: "module-01", path: MODULE_1_PATH, quiz: TOPIC_1_QUIZ });
export const MODULE_2_AUTHORING_EVIDENCE = buildEvidence({ topicCode: "T02", module: "module-02", path: MODULE_2_PATH, quiz: TOPIC_2_QUIZ });
export const AUTHORING_EVIDENCE_BY_TOPIC = Object.freeze({ T01: AUTHORING_EVIDENCE, T02: MODULE_2_AUTHORING_EVIDENCE });

export const validateAuthoringEvidence = () => validateEvidence(AUTHORING_EVIDENCE);
export const validateModule2AuthoringEvidence = () => validateEvidence(MODULE_2_AUTHORING_EVIDENCE);

for (const evidence of Object.values(AUTHORING_EVIDENCE_BY_TOPIC)) {
  const validation = validateEvidence(evidence);
  if (validation.status !== "PASS") throw new Error(`LOC ${evidence.topicCode} authoring evidence: ${validation.problems.join("; ")}`);
}

export default Object.freeze({
  AUTHORING_EVIDENCE,
  MODULE_2_AUTHORING_EVIDENCE,
  AUTHORING_EVIDENCE_BY_TOPIC,
  validateAuthoringEvidence,
  validateModule2AuthoringEvidence,
});
