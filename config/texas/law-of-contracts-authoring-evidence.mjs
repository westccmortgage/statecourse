/** Measured Topic 01 authoring evidence. Planned minutes are not counted as authored time. */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TOPICS } from "./law-of-contracts-course-form.mjs";
import { RATES, BUDGET } from "./law-of-contracts-time-budget.mjs";
import { TOPIC_1_QUIZ } from "./law-of-contracts-question-bank.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const MODULE_1_PATH = "texas/tx-law-of-contracts-30-v1/curriculum/module-01.md";
const text = readFileSync(join(REPO_ROOT, MODULE_1_PATH), "utf8");

const countWords = (value) => value.trim().split(/\s+/u).filter(Boolean).length;
const lineAt = (offset) => text.slice(0, offset).split("\n").length;
const headingType = (heading) => {
  if (/^### Statute reading exercise:/u.test(heading)) return "statuteReadingExercise";
  if (/^### Applied exercise:/u.test(heading)) return "appliedExercise";
  if (/^### Scenario:/u.test(heading)) return "scenario";
  if (/^### Misconception check\b/u.test(heading)) return "misconceptionCheck";
  if (/^### Module recap\b/u.test(heading)) return "moduleRecap";
  return null;
};

const headings = [...text.matchAll(/^#{1,3}\s+.+$/gmu)].map((match) =>
  Object.freeze({ heading: match[0], start: match.index, type: headingType(match[0]) }),
);

const activitySegments = [];
for (const [index, heading] of headings.entries()) {
  if (!heading.type) continue;
  const end = headings[index + 1]?.start ?? text.length;
  const content = text.slice(heading.start, end);
  activitySegments.push(
    Object.freeze({
      type: heading.type,
      heading: heading.heading,
      start: heading.start,
      end,
      startLine: lineAt(heading.start),
      endLine: lineAt(end),
      words: countWords(content),
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
  quizItems: TOPIC_1_QUIZ.length,
  conditionalReplacementItems: TOPIC_1_QUIZ.length,
});

const topic = TOPICS.find((entry) => entry.code === "T01");
const budget = BUDGET.find((entry) => entry.topicCode === "T01");
const unitHeadings = [...text.matchAll(/^## Unit: (.+)$/gmu)].map((match) => match[1]);
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

export const AUTHORING_EVIDENCE = Object.freeze({
  module: "module-01",
  topicCode: topic.code,
  topic: topic.topic,
  path: MODULE_1_PATH,
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
  activitySegments: Object.freeze(activitySegments),
  conditionalReplacementPolicy:
    "Replacement items are remediation shown only after an incorrect primary response; their four planned minutes are disclosed but not counted toward the required 155-minute path.",
});

export function validateAuthoringEvidence() {
  const problems = [];
  const expectedUnits = topic.units.map((unit) => unit.unit);
  if (JSON.stringify(unitHeadings) !== JSON.stringify(expectedUnits)) problems.push("six LOC-0 unit headings are missing, extra, or out of order");
  if (AUTHORING_EVIDENCE.totalWords !== proseWords + activityWords) problems.push("prose and activity segments do not partition the module exactly");
  if (proseWords < budget.minimumProseWords) problems.push(`prose is ${budget.minimumProseWords - proseWords} words below the Topic 01 minimum`);
  if (counts.statuteReadingExercises !== budget.statuteReadingExercises) problems.push("statute-reading count differs from budget");
  if (counts.appliedExercises !== budget.appliedExercises) problems.push("applied-exercise count differs from budget");
  if (counts.scenarios !== budget.scenarios) problems.push("scenario count differs from budget");
  if (counts.misconceptionChecks !== budget.misconceptionChecks) problems.push("misconception count differs from budget");
  if (counts.moduleRecaps !== 1) problems.push("module recap count is not one");
  if (counts.quizItems !== budget.quizItems) problems.push("primary quiz count differs from budget");
  if (activityMinutes !== budget.activityMinutes) problems.push("measured required activity minutes differ from budget");
  if (measuredRequiredMinutes < topic.subtotalMinutes) problems.push("measured required path is shorter than 155 minutes");
  for (const [index, segment] of activitySegments.entries()) {
    if (segment.end <= segment.start || (index > 0 && segment.start < activitySegments[index - 1].end)) problems.push("activity segments overlap or are empty");
  }
  return Object.freeze({
    status: problems.length ? "FAIL" : "PASS",
    module: AUTHORING_EVIDENCE.module,
    totalWords: AUTHORING_EVIDENCE.totalWords,
    proseWords,
    activityWords,
    measuredRequiredMinutes,
    prescribedMinutes: topic.subtotalMinutes,
    activitySegments: activitySegments.length,
    problems: Object.freeze(problems),
  });
}

const validation = validateAuthoringEvidence();
if (validation.status !== "PASS") throw new Error(`LOC Topic 01 authoring evidence: ${validation.problems.join("; ")}`);

export default Object.freeze({ AUTHORING_EVIDENCE, validateAuthoringEvidence });
