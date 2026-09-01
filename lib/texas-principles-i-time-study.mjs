/**
 * Texas Principles of Real Estate I — instructional time study.
 *
 * WHAT THIS COMPUTES. For each of the nine modules: the words of instructional text, the study
 * minutes those words support under the provider's documented time model, the minutes contributed
 * by each activity the module actually contains (counted from the files, never assumed), and the
 * comparison against the PRINS1-1 prescribed subtotal. A module SUPPORTS its prescription only if
 * supported minutes ≥ prescribed minutes; the course reconciles only if every module does and the
 * total meets the form's 1,500.
 *
 * WHY COUNTING FROM FILES MATTERS. The reconciliation is evidence, not intention: if an exercise
 * is deleted from a module the study recomputes and the gate fails, rather than a stale constant
 * continuing to claim time that no longer exists.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { TOPICS, ALL_UNITS } from "../config/texas/prins1-course-form.mjs";
import { COURSE, MODULES, TIME_MODEL } from "../config/texas/principles-i-course.mjs";
import { TOPIC_QUIZZES, SCENARIOS } from "../config/texas/principles-i-question-bank.mjs";

const countWords = (text) => (text.match(/\S+/g) ?? []).length;

export function studyModule(rootDir, moduleEntry) {
  const filePath = path.join(rootDir, COURSE.curriculumDir, moduleEntry.file);
  const body = readFileSync(filePath, "utf8");
  const words = countWords(body);
  const activity = TIME_MODEL.activityMinutes;

  const statuteExercises = (body.match(/^### Statute reading exercise/gm) ?? []).length;
  const appliedExercises = (body.match(/^### Applied exercise/gm) ?? []).length;
  const recaps = (body.match(/^### Module recap/gm) ?? []).length;
  const quizItems = (TOPIC_QUIZZES[moduleEntry.topicCode] ?? []).length;
  const scenarios = SCENARIOS.filter((s) => s.topicCode === moduleEntry.topicCode).length;

  const studyMinutes = words / TIME_MODEL.masteryStudyWordsPerMinute;
  const firstPassMinutes = words / TIME_MODEL.firstPassWordsPerMinute;
  const activityMinutes =
    statuteExercises * activity.statuteReadingExercise +
    appliedExercises * activity.appliedExercise +
    quizItems * activity.quizItem +
    scenarios * activity.scenario +
    recaps * activity.moduleRecap;
  const supportedMinutes = studyMinutes + activityMinutes;

  const units = ALL_UNITS.filter((unit) => unit.topicCode === moduleEntry.topicCode);
  const missingUnits = units.filter((unit) => !body.includes(unit.unit)).map((unit) => unit.code);

  return Object.freeze({
    module: moduleEntry.module,
    topicCode: moduleEntry.topicCode,
    topic: moduleEntry.topic,
    prescribedMinutes: moduleEntry.prescribedMinutes,
    words,
    firstPassMinutes: Math.round(firstPassMinutes),
    studyMinutes: Math.round(studyMinutes),
    statuteExercises,
    appliedExercises,
    recaps,
    quizItems,
    scenarios,
    activityMinutes,
    supportedMinutes: Math.round(supportedMinutes),
    shortfallMinutes: Math.max(0, Math.round(moduleEntry.prescribedMinutes - supportedMinutes)),
    supports: supportedMinutes >= moduleEntry.prescribedMinutes,
    missingUnits: Object.freeze(missingUnits),
  });
}

export function studyCourse(rootDir) {
  const modules = MODULES.map((entry) => studyModule(rootDir, entry));
  const totals = modules.reduce(
    (acc, m) => ({
      words: acc.words + m.words,
      studyMinutes: acc.studyMinutes + m.studyMinutes,
      activityMinutes: acc.activityMinutes + m.activityMinutes,
      supportedMinutes: acc.supportedMinutes + m.supportedMinutes,
      prescribedMinutes: acc.prescribedMinutes + m.prescribedMinutes,
    }),
    { words: 0, studyMinutes: 0, activityMinutes: 0, supportedMinutes: 0, prescribedMinutes: 0 },
  );
  const prescribedTotal = TOPICS.reduce((sum, t) => sum + t.subtotalMinutes, 0);
  return Object.freeze({
    modules: Object.freeze(modules),
    totals: Object.freeze(totals),
    prescribedTotal,
    everyModuleSupports: modules.every((m) => m.supports),
    everyUnitPresent: modules.every((m) => m.missingUnits.length === 0),
    reconciles:
      modules.every((m) => m.supports && m.missingUnits.length === 0) &&
      totals.supportedMinutes >= prescribedTotal &&
      totals.prescribedMinutes === prescribedTotal,
    timeModel: TIME_MODEL,
  });
}

export default Object.freeze({ studyModule, studyCourse });
