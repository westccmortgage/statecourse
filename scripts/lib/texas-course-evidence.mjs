/**
 * Evidence for the three newly completed Texas curricula. No historical course is re-frozen.
 * Count actual artifacts, not planned quizzes/scenarios. Rates are provider estimates, not
 * observed student time or a TREC approval. Final exams and conditional remediation are excluded.
 */
import { createHash } from "node:crypto";

export const TEXAS_TIME_RATES = Object.freeze({
  wordsPerMinute: 140,
  statuteReadingExercise: 12,
  appliedExercise: 10,
  quizItem: 2,
  misconceptionCheck: 3,
  scenario: 20,
  moduleRecap: 5,
});
const words = text => (text.match(/\S+/g) || []).length;
const digest = text => createHash("sha256").update(text).digest("hex");
const minutes = seconds => Number((seconds / 60).toFixed(2));

/** Each line belongs to exactly one segment; nested exercise feedback cannot become prose. */
export function inspectTexasChapter(markdown, unitCodes) {
  if (!unitCodes.length || new Set(unitCodes).size !== unitCodes.length) throw new Error("Invalid expected unit codes");
  const totals = { instruction: 0, statuteReadingExercise: 0, appliedExercise: 0, recap: 0, optional: 0, metadata: 0, references: 0 };
  const units = [];
  const exercises = [];
  let active = "metadata", unit = null, optionalSeen = false, recapCount = 0, exercise = null;
  const lines = markdown.replace(/\r/g, "").split("\n");
  for (const [lineNumber, line] of lines.entries()) {
    const coded = line.match(/^## (T\d{2}U\d+) [—–-] (.+)$/);
    const legacy = line.match(/^## Unit: (.+)$/);
    const recap = /^### Module recap\s*$/.test(line);
    const optional = /^## Optional reference: .+/.test(line);
    const activity = line.match(/^### (Statute reading exercise|Applied exercise):\s*(.+)$/);
    let headingMetadata = false;
    if (coded || legacy) {
      if (recapCount || optionalSeen) throw new Error("A required unit follows the recap or optional reference");
      const expected = unitCodes[units.length];
      const code = coded?.[1] ?? expected;
      if (!expected || code !== expected) throw new Error(`Unit order mismatch: ${code}; expected ${expected}`);
      unit = { code, title: coded?.[2] ?? legacy[1], instructionWords: 0, line: lineNumber + 1 };
      units.push(unit);
      active = "instruction";
      exercise = null;
      headingMetadata = true;
    } else if (optional) {
      if (!recapCount || optionalSeen) throw new Error("Exactly one optional reference may follow the recap");
      optionalSeen = true;
      active = "optional";
      exercise = null;
    } else if (!optionalSeen && recap) {
      if (units.length !== unitCodes.length || ++recapCount !== 1) throw new Error("Missing units or duplicate recap");
      active = "recap";
      exercise = null;
    } else if (!optionalSeen && activity) {
      if (!unit || recapCount) throw new Error("Required exercise outside a required unit");
      active = activity[1] === "Statute reading exercise" ? "statuteReadingExercise" : "appliedExercise";
      exercise = { kind: active, unitCode: unit.code, title: activity[2], line: lineNumber + 1, words: 0, text: "" };
      exercises.push(exercise);
    } else if (!optionalSeen && /^#{2,3} (?:Sources|References|Source ledger)(?::|\s*$)/i.test(line)) {
      active = "references";
      exercise = null;
    }
    // A one-line bibliography isn't teaching, including a bibliography placed in a recap.
    const sourceLine = /^(?:Sources|References):\s*\[/.test(line);
    const segment = headingMetadata ? "metadata" : sourceLine && !optionalSeen ? "references" : active;
    const count = words(line);
    totals[segment] += count;
    if (segment === "instruction") unit.instructionWords += count;
    if (exercise && segment === exercise.kind) { exercise.words += count; exercise.text += `${line}\n`; }
  }
  if (units.length !== unitCodes.length) throw new Error(`Found ${units.length} units, expected ${unitCodes.length}`);
  if (recapCount !== 1) throw new Error("Missing module recap");
  if (units.some(u => u.instructionWords === 0)) throw new Error("An outline heading has no instructional prose");
  for (const activity of exercises) {
    if (activity.words <= words(activity.title) + 5) throw new Error(`Empty activity: ${activity.title}`);
  }
  if (Object.values(totals).reduce((a, b) => a + b, 0) !== words(markdown)) throw new Error("Non-disjoint word accounting");
  return {
    sha256: digest(markdown), totalWords: words(markdown), wordsBySegment: totals, units, recapCount,
    exercises: exercises.map(({ text, ...entry }) => ({ ...entry, sha256: digest(text) })),
  };
}

function instrumentIds(instruments, label, seen) {
  if (!Array.isArray(instruments)) throw new Error(`${label} must be an actual instrument array`);
  for (const item of instruments) {
    if (!item || typeof item.id !== "string" || !item.id || seen.has(item.id)) throw new Error(`Missing or duplicate instrument in ${label}`);
    seen.add(item.id);
    if (!String(item.prompt ?? item.narrative ?? item.situation ?? "").trim()) throw new Error(`${label} ${item.id} lacks its authored prompt`);
  }
  return instruments.length;
}

/** A count of three cases all placed at the end is not a case during each ten-hour span.
 * Credit positions use the official outline allocation, not unobserved wall-clock claims.
 * Modeled elapsed positions are reported separately so surplus instruction stays visible.
 */
export function inspectTexasScenarioSpacing({ form, rows, capstones = 0 }) {
  if (!(form.courseHours > 0) || !(form.totalMinutes > 0)) throw new Error("Invalid official course duration");
  let prescribedMinutes = 0, modeledMinutes = 0, lastCreditHour = 0;
  const checkpoints = [];
  for (const row of rows) {
    prescribedMinutes += row.prescribedMinutes;
    modeledMinutes += row.modeledMinutes;
    if (row.scenarios > 0) {
      const creditHour = prescribedMinutes / form.totalMinutes * form.courseHours;
      checkpoints.push({ afterTopic: row.topicCode, count: row.scenarios, outlineCreditHour: creditHour,
        outlineGapHours: creditHour - lastCreditHour, modeledEndMinutes: Number(modeledMinutes.toFixed(2)) });
      lastCreditHour = creditHour;
    }
  }
  const tailGapHours = form.courseHours - lastCreditHour;
  if (capstones > 0) checkpoints.push({ afterTopic: "COURSE", count: capstones, outlineCreditHour: form.courseHours,
    outlineGapHours: tailGapHours, modeledEndMinutes: Number((modeledMinutes + capstones * TEXAS_TIME_RATES.scenario).toFixed(2)) });
  const gaps = [...checkpoints.map(point => point.outlineGapHours), tailGapHours];
  return { pass: checkpoints.length > 0 && gaps.every(gap => gap >= 0 && gap <= 10 + 1e-9),
    checkpoints, tailGapHours, maximumGapHours: Math.max(...gaps),
    basis: "Official outline credit-hour placement; modeled positions are estimates, not measured learner time" };
}

export function buildTexasTimeEvidence({ form, topics, chapters, assessments, courseScenarios = [] }) {
  const r = TEXAS_TIME_RATES;
  const seen = new Set();
  if (chapters.length !== topics.length || assessments.length !== topics.length) throw new Error("Incomplete chapter or assessment inventory");
  const rows = topics.map((topic, index) => {
    const chapter = chapters[index];
    const assessment = assessments[index];
    if (chapter.topicCode !== topic.code || assessment.topicCode !== topic.code) throw new Error("Topic inventory is out of order");
    const measured = inspectTexasChapter(chapter.markdown, topic.units.map(u => u.code));
    const quizItems = instrumentIds(assessment.quiz, `${topic.code} quiz`, seen);
    const misconceptions = instrumentIds(assessment.misconceptions, `${topic.code} misconceptions`, seen);
    const scenarios = instrumentIds(assessment.scenarios, `${topic.code} scenarios`, seen);
    const statuteReadingExercises = measured.exercises.filter(x => x.kind === "statuteReadingExercise").length;
    const appliedExercises = measured.exercises.filter(x => x.kind === "appliedExercise").length;
    const readingSeconds = measured.wordsBySegment.instruction / r.wordsPerMinute * 60;
    const activitySeconds = 60 * (statuteReadingExercises * r.statuteReadingExercise + appliedExercises * r.appliedExercise
      + quizItems * r.quizItem + misconceptions * r.misconceptionCheck + scenarios * r.scenario + measured.recapCount * r.moduleRecap);
    const requiredSeconds = readingSeconds + activitySeconds;
    return {
      topicCode: topic.code, topic: topic.topic, prescribedMinutes: topic.subtotalMinutes,
      ...measured, quizItems, misconceptions, scenarios, statuteReadingExercises, appliedExercises,
      readingSeconds, activitySeconds, requiredSeconds, modeledMinutes: minutes(requiredSeconds),
      varianceMinutes: minutes(requiredSeconds - topic.subtotalMinutes * 60),
      meetsTopicTimeModel: requiredSeconds >= topic.subtotalMinutes * 60,
      meetsMinimumQuizCount: quizItems >= 3,
    };
  });
  const capstones = instrumentIds(courseScenarios, "course-level scenarios", seen);
  const topicSeconds = rows.reduce((sum, row) => sum + row.requiredSeconds, 0);
  const courseLevelSeconds = capstones * r.scenario * 60;
  const prescribed = topics.reduce((sum, topic) => sum + topic.subtotalMinutes, 0);
  if (prescribed !== form.totalMinutes) throw new Error("Outline topic minutes do not match the official total");
  const scenarioCount = capstones + rows.reduce((sum, row) => sum + row.scenarios, 0);
  const timeModelPass = rows.every(row => row.meetsTopicTimeModel);
  const scenarioSpacing = inspectTexasScenarioSpacing({ form, rows, capstones });
  const assessmentCountPass = rows.every(row => row.meetsMinimumQuizCount) && scenarioCount >= Math.ceil(form.courseHours / 10) && scenarioSpacing.pass;
  return {
    schemaVersion: 1, generatedBy: "scripts/lib/texas-course-evidence.mjs", form: form.formNumber,
    status: timeModelPass && assessmentCountPass ? "PROVIDER_ESTIMATE_MEETS_OUTLINE_NOT_APPROVAL" : "INCOMPLETE",
    rateBasis: { ...r, status: "PROVIDER_PLANNING_ASSUMPTIONS_NOT_OBSERVED_STUDENT_TIME", timeStudyPerformed: false },
    accounting: "Instruction, exercises, recap, optional content, references and metadata are disjoint. Only actual authored primary instruments count. Every topic must independently meet its outline allocation.",
    rows, scenarioCount, scenarioSpacing, capstones, topicSeconds, courseLevelSeconds,
    grandSeconds: topicSeconds + courseLevelSeconds,
    topicMinutes: minutes(topicSeconds), courseLevelMinutes: minutes(courseLevelSeconds),
    grandMinutes: minutes(topicSeconds + courseLevelSeconds), prescribedMinutes: prescribed,
    timeModelPass, assessmentCountPass,
    excluded: ["final examinations", "conditional replacement questions", "remediation and repeated attempts", "optional videos", "optional references", "front matter and bibliographies"],
    legalConclusion: "None. This report neither grants credit nor establishes course or provider approval. Pilot timing and regulatory review remain separate.",
  };
}
