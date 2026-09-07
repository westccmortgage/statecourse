/** Read-only inventory and quantitative evidence. Missing artifacts are failures, not skipped tests. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { TEXAS_COMPLETION_COURSES } from "../config/texas/completion-courses.mjs";
import { buildTexasTimeEvidence } from "./lib/texas-course-evidence.mjs";
import { validateTexasAssessments } from "./lib/texas-assessment-evidence.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requested = process.argv.find(arg => arg.startsWith("--course="))?.slice(9);
if (requested && !TEXAS_COMPLETION_COURSES.some(course => course.slug === requested)) throw new Error("Unknown Texas completion course");
const results = [];
for (const spec of TEXAS_COMPLETION_COURSES.filter(course => !requested || course.slug === requested)) {
  const load = relative => import(pathToFileURL(path.join(root, relative)).href);
  const { FORM, TOPICS } = await load(spec.outlinePath);
  const required = [spec.coursePath, spec.questionBankPath, spec.scenarioPath, spec.finalBankPath, spec.finalFormsPath,
    ...TOPICS.map((_, index) => `${spec.curriculumDir}/module-${String(index + 1).padStart(2, "0")}.md`)];
  const missing = required.filter(file => !fs.existsSync(path.join(root, file)));
  if (missing.length) {
    results.push({ course: spec.title, status: "INCOMPLETE", missing });
    continue;
  }
  try {
    const [courseModule, questionModule, scenarioModule, finalModule, formsModule] = await Promise.all([
      load(spec.coursePath), load(spec.questionBankPath), load(spec.scenarioPath), load(spec.finalBankPath), load(spec.finalFormsPath),
    ]);
    const misconceptionModule = fs.existsSync(path.join(root, spec.misconceptionPath)) ? await load(spec.misconceptionPath) : null;
    const misconceptions = misconceptionModule?.MISCONCEPTION_CHECKS ?? [];
    const scenarios = scenarioModule.SCENARIOS;
    const isCourseLevel = scenario => scenario.courseLevel === true || scenario.placement?.timeAttribution === "COURSE_LEVEL";
    const placedAt = scenario => scenario.afterTopic ?? scenario.placement?.afterTopic;
    const timeScenario = scenario => ({ ...scenario, prompt: scenario.prompt ?? scenario.context ?? scenario.narrative });
    const chapters = TOPICS.map((topic, index) => ({ topicCode: topic.code,
      markdown: fs.readFileSync(path.join(root, spec.curriculumDir, `module-${String(index + 1).padStart(2, "0")}.md`), "utf8") }));
    const time = buildTexasTimeEvidence({ form: FORM, topics: TOPICS, chapters,
      assessments: TOPICS.map(topic => ({ topicCode: topic.code, quiz: questionModule.TOPIC_QUIZZES[topic.code],
        misconceptions: misconceptions.filter(item => item.topicCode === topic.code),
        scenarios: scenarios.filter(item => !isCourseLevel(item) && placedAt(item) === topic.code).map(timeScenario) })),
      courseScenarios: scenarios.filter(isCourseLevel).map(timeScenario) });
    const exercisePrompts = chapters.flatMap(chapter => [...chapter.markdown.matchAll(/^### (?:Statute reading exercise|Applied exercise): .+\n[\s\S]*?(?=^#{2,3} |$(?![\s\S]))/gm)]
      .map((match, index) => ({ id: `${chapter.topicCode}-EX${index + 1}`, prompt: match[0] })));
    const assessment = validateTexasAssessments({ topics: TOPICS, quizzes: questionModule.TOPIC_QUIZZES,
      replacements: questionModule.REPLACEMENTS, scenarios, bank: finalModule.FINAL_EXAM_BANK,
      forms: formsModule.FORMS, misconceptions, exercisePrompts });
    const objectiveFailures = TOPICS.flatMap(topic => topic.units.filter(unit => !courseModule.UNIT_OBJECTIVES?.[unit.code]?.trim()).map(unit => unit.code));
    const gateKeys = ["enrollmentEnabled", "paymentEnabled", "creditReportingEnabled", "certificateIssuanceEnabled", "finalExaminationAdministrable"];
    const gatesClosed = gateKeys.every(key => courseModule.COURSE?.[key] === false);
    const contentStructurePass = time.timeModelPass && time.assessmentCountPass && assessment.pass && !objectiveFailures.length && gatesClosed;
    results.push({ course: spec.title,
      status: contentStructurePass ? "STRUCTURE_AND_PROVIDER_TIME_MODEL_PASS_REVIEW_STILL_REQUIRED" : "INCOMPLETE",
      objectiveFailures, gatesClosed, time, assessment,
      notEstablished: ["independent legal accuracy of every claim", "semantic separation of every protected examination item", "observed learner timing", "TREC provider or course approval"] });
  } catch (error) {
    results.push({ course: spec.title, status: "INCOMPLETE", error: error.message });
  }
}
if (process.argv.includes("--json")) console.log(JSON.stringify({ schemaVersion: 1, results }, null, 2));
else for (const result of results) {
  console.log(`${result.course}: ${result.status}`);
  if (result.missing) console.log(`  Missing ${result.missing.length} required artifacts: ${result.missing.join(", ")}`);
  if (result.error) console.log(`  ${result.error}`);
  if (result.time) console.log(`  ${result.time.rows.length} topics; ${result.time.topicMinutes} provider-modeled topic minutes; structural assessments ${result.assessment.pass ? "PASS" : "FAIL"}`);
}
if (results.some(result => result.status === "INCOMPLETE")) process.exitCode = 1;
