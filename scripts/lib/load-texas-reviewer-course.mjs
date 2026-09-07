/** Node-only loader. Never import into a public bundle: the definition contains protected keys.
 * A content-derived REVIEW-SNAPSHOT is reproducible test provenance, NOT an approved course freeze.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { TEXAS_COMPLETION_COURSES } from "../../config/texas/completion-courses.mjs";
import { validateTexasAssessments } from "./texas-assessment-evidence.mjs";
import { parseModule } from "./generate-complete-tx-block-maps.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export async function loadTexasReviewerCourse(slug) {
  const spec = TEXAS_COMPLETION_COURSES.find(course => course.slug === slug);
  if (!spec) throw new Error("Unknown Texas reviewer course");
  const files = [];
  const read = relative => {
    const bytes = fs.readFileSync(path.join(root, relative));
    files.push({ path: relative, sha256: createHash("sha256").update(bytes).digest("hex") });
    return bytes.toString("utf8");
  };
  const load = async relative => {
    read(relative);
    return import(pathToFileURL(path.join(root, relative)).href);
  };
  const outline = await load(spec.outlinePath);
  const [course, questions, scenarios, finals, forms] = await Promise.all([
    load(spec.coursePath), load(spec.questionBankPath), load(spec.scenarioPath), load(spec.finalBankPath), load(spec.finalFormsPath),
  ]);
  const misconceptions = fs.existsSync(path.join(root, spec.misconceptionPath))
    ? (await load(spec.misconceptionPath)).MISCONCEPTION_CHECKS : [];
  const chapters = outline.TOPICS.map((topic, index) => {
    const relative = `${spec.curriculumDir}/module-${String(index + 1).padStart(2, "0")}.md`;
    const markdown = read(relative);
    const parsed = parseModule(markdown, topic.units.map(unit => unit.code));
    for (const block of parsed.blocks) {
      if (!course.UNIT_OBJECTIVES?.[block.code]?.trim()) throw new Error(`Missing objective ${block.code}`);
      // Bind the generated retrieval screen to the real authored primary, not a fictitious legacy ID.
      const primary = questions.TOPIC_QUIZZES[topic.code]?.find(item => item.tests === block.code);
      if (!primary) throw new Error(`Missing primary retrieval for ${block.code}`);
      block.learningObjective = course.UNIT_OBJECTIVES[block.code];
      for (const screen of block.screens) if (screen.type === "retrieval") screen.questionId = primary.id;
    }
    return { path: relative, topicCode: topic.code, markdown, blocks: parsed.blocks };
  });
  const definition = { courseId: spec.courseId, topics: outline.TOPICS,
    quizzes: questions.TOPIC_QUIZZES, replacements: questions.REPLACEMENTS,
    scenarios: scenarios.SCENARIOS, bank: finals.FINAL_EXAM_BANK, forms: forms.FORMS, misconceptions };
  const assessment = validateTexasAssessments(definition);
  if (!assessment.pass) throw new Error(`Invalid Texas assessment definition: ${JSON.stringify(assessment.checks.filter(check => !check.pass))}`);
  const gates = ["enrollmentEnabled", "paymentEnabled", "creditReportingEnabled", "certificateIssuanceEnabled", "finalExaminationAdministrable"];
  if (gates.some(key => course.COURSE[key] !== false)) throw new Error("Reviewer loading requires every production gate closed");
  // Include local imported dependencies (split banks and source maps), not merely wrapper bytes.
  const seen = new Set(files.map(file => file.path));
  for (let index = 0; index < files.length; index++) {
    const relative = files[index].path;
    if (!relative.endsWith(".mjs")) continue;
    const code = fs.readFileSync(path.join(root, relative), "utf8");
    for (const match of code.matchAll(/(?:from\s*|import\s*)["'](\.[^"']+\.mjs)["']/g)) {
      const dependency = path.posix.normalize(path.posix.join(path.posix.dirname(relative), match[1]));
      if (dependency.startsWith("../")) throw new Error("Dependency escapes repository");
      if (!seen.has(dependency)) { seen.add(dependency); read(dependency); }
    }
  }
  for (const relative of ["config/texas/complete-course-reviewer-engine.mjs", "config/texas/complete-course-exam-delivery.mjs"]) {
    if (!seen.has(relative)) read(relative);
  }
  files.sort((a, b) => a.path.localeCompare(b.path));
  const digest = createHash("sha256").update(JSON.stringify(files)).digest("hex");
  definition.freeze = `REVIEW-SNAPSHOT-${digest}`;
  return { spec, course: course.COURSE, definition, chapters, assessment,
    provenance: { kind: "INTERNAL_REVIEW_SNAPSHOT_NOT_APPROVAL_OR_FREEZE", digest, files } };
}
