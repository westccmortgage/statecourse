/**
 * CA-BLOCK — shared generator core, extracted unchanged from the Mortgage rollout script so all
 * three California courses (Mortgage, Principles, Practice) generate learning-block maps from the
 * exact same, already-proven logic. See scripts/generate-mortgage-block-maps.mjs for the original
 * design notes; nothing about screen derivation, chunking, or the B7 synthesis block changed here
 * — only the per-course inputs (curriculum directory, spec module, id prefix, output naming) were
 * pulled out into a config object so Principles and Practice can reuse it without duplicating the
 * parsing and rendering logic.
 *
 * WHAT STAYS HAND-AUTHORED, per course: each block's learning objective and the practice-problem
 * map (course's own *-block-specs.mjs), and the per-assignment retrieval banks (course's own
 * *-retrieval-banks.mjs, validated at registry load time, not here). This generator never invents
 * pedagogy — it refuses to run when a spec is missing or incomplete.
 */

import fs from "node:fs";
import path from "node:path";

const q = (value) => JSON.stringify(String(value));

function parseLesson(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const sections = [];
  let current = null;
  for (const line of lines) {
    const section = line.match(/^## (\d)\. (.+)$/);
    if (section) {
      current = { number: Number(section[1]), title: section[2].trim(), heading: line.trim(), subs: [] };
      sections.push(current);
      continue;
    }
    if (/^## /.test(line)) { current = null; continue; }
    const sub = line.match(/^### (\d\.\d+) (.+)$/);
    if (sub && current) current.subs.push({ label: sub[1], title: sub[2].trim(), heading: line.trim() });
  }
  const problems = lines.filter((line) => /^### Problem \d+$/.test(line.trim())).length;
  return { sections, problems };
}

/* Pairs of subsections per screen; a trailing odd subsection joins the final pair. */
function chunkSubs(subs) {
  const chunks = [];
  for (let index = 0; index < subs.length; index += 2) chunks.push(subs.slice(index, index + 2));
  if (chunks.length > 1 && chunks[chunks.length - 1].length === 1) {
    chunks[chunks.length - 2].push(...chunks.pop());
  }
  return chunks;
}

/**
 * course: {
 *   root,                 // repo root (absolute)
 *   curriculumDir,        // absolute path to the course's curriculum/ directory
 *   specs,                // the course's *_BLOCK_SPECS object, keyed by assignment number
 *   courseId,              // full course id, e.g. "ca-real-estate-principles-45"
 *   idPrefix,              // block/screen id prefix per assignment, e.g. "a" (mortgage), "pr" (principles)
 *   outFile: (assignment) => absolute path,
 *   exportPrefix: (assignment) => string,  // e.g. "A2" or "PR2" — the exported const's prefix
 *   generatorLabel,        // for the generated-file header comment, e.g. "Mortgage" / "Principles"
 * }
 */
export function generateCourseBlocks(course, assignment) {
  const nn = String(assignment).padStart(2, "0");
  const spec = course.specs[assignment];
  if (!spec) throw new Error(`no spec for assignment ${assignment}`);
  const lessonPath = path.join(course.curriculumDir, `lesson-${nn}.md`);
  const markdown = fs.readFileSync(lessonPath, "utf8");
  const { sections, problems } = parseLesson(markdown);
  if (sections.length !== 6) throw new Error(`lesson-${nn}: ${sections.length} sections`);
  if (problems !== 8) throw new Error(`lesson-${nn}: ${problems} problems`);
  if (spec.objectives.length !== 7) throw new Error(`assignment ${assignment}: need 7 block objectives`);
  const assigned = Object.values(spec.problemMap).flat().sort((a, b) => a - b);
  if (assigned.join(",") !== "1,2,3,4,5,6,7,8") {
    throw new Error(`assignment ${assignment}: problem map must assign each of problems 1..8 exactly once (got ${assigned.join(",")})`);
  }

  const prefix = `${course.idPrefix}${assignment}`;
  const blocks = [];
  for (const section of sections) {
    const blockId = `${prefix}-b${section.number}`;
    const screens = [];
    const chunks = chunkSubs(section.subs);
    const startOfNext = section.number < 6 ? sections[section.number].heading : "## Key terms";
    if (!chunks.length) {
      screens.push({ type: "instruction", title: section.title, from: section.number === 1 ? "^" : section.heading, to: startOfNext });
    } else {
      chunks.forEach((chunk, index) => {
        const from = index === 0 ? (section.number === 1 ? "^" : section.heading) : chunk[0].heading;
        const nextChunk = chunks[index + 1];
        const to = nextChunk ? nextChunk[0].heading : startOfNext;
        screens.push({ type: "instruction", title: chunk[0].title, from, to });
      });
    }
    for (const problem of spec.problemMap[section.number] ?? []) {
      const to = problem < 8 ? `### Problem ${problem + 1}` : "## Chapter summary";
      screens.push({ type: "practice", title: `Practice: problem ${problem}`, from: `### Problem ${problem}`, to, practiceProblem: problem });
    }
    screens.push({ type: "retrieval", title: "Retrieval check", questionId: `${blockId}-q1` });
    blocks.push({ id: blockId, sequence: section.number, title: section.title, objective: spec.objectives[section.number - 1], sourceSections: [section.number], screens });
  }

  const b7 = {
    id: `${prefix}-b7`, sequence: 7, title: "Synthesis and assignment mastery",
    objective: spec.objectives[6], sourceSections: [], regulatoryMastery: true,
    screens: [
      { type: "review", title: "Key terms", from: "## Key terms", to: "## Practice problems" },
      { type: "review", title: "Chapter summary", from: "## Chapter summary", to: "## Required applied assignment" },
      { type: "applied", title: "Applied assignment", from: "## Required applied assignment", to: "## Knowledge check and remediation" },
      { type: "mastery", title: "Assignment mastery check", from: "## Knowledge check and remediation", to: "## Assignment completion" },
      { type: "completion", title: "Assignment completion", from: "## Assignment completion", to: "$" },
    ],
  };
  blocks.push(b7);

  /* Hand-authored supplementary media (spec.screenMedia) attaches to generated screens by id;
     an entry naming a screen that does not exist refuses to generate. */
  const screenMedia = spec.screenMedia || {};
  const emittedIds = new Set(blocks.flatMap((block) => block.screens.map((_, index) => `${block.id}-s${index + 1}`)));
  for (const id of Object.keys(screenMedia)) {
    if (!emittedIds.has(id)) throw new Error(`assignment ${assignment}: screenMedia names unknown screen ${id}`);
  }

  const renderScreen = (blockId, screen, index) => {
    const id = `${blockId}-s${index + 1}`;
    if (screen.type === "retrieval") {
      return `        { id: ${q(id)}, sequence: ${index + 1}, type: "retrieval", title: ${q(screen.title)}, questionId: ${q(screen.questionId)} },`;
    }
    const practice = screen.practiceProblem ? `, practiceProblem: ${screen.practiceProblem}` : "";
    const mediaEntry = screenMedia[id];
    const videos = mediaEntry?.videos || (mediaEntry?.video ? [mediaEntry.video] : null);
    const documents = mediaEntry?.documents || null;
    if (documents) {
      for (const doc of documents) {
        if (!doc?.src?.startsWith("/media/") || !doc.label) {
          throw new Error(`assignment ${assignment}: screen ${id} document needs a /media/ src and a label`);
        }
      }
    }
    const media = `${videos ? `, videos: ${JSON.stringify(videos)}` : ""}${documents ? `, documents: ${JSON.stringify(documents)}` : ""}`;
    return `        { id: ${q(id)}, sequence: ${index + 1}, type: ${q(screen.type)}, title: ${q(screen.title)}, content: RANGE(${q(screen.from)}, ${q(screen.to)})${practice}${media} },`;
  };

  const rendered = blocks.map((block) => `    {
      id: ${q(block.id)}, sequence: ${block.sequence}, required: true,
      title: ${q(block.title)},
      learningObjective: ${q(block.objective)},
      sourceSections: [${block.sourceSections.join(", ")}],${block.regulatoryMastery ? "\n      regulatoryMastery: true," : ""}
      screens: [
${block.screens.map((screen, index) => renderScreen(block.id, screen, index)).join("\n")}
      ],
    },`).join("\n");

  const exportPrefix = course.exportPrefix(assignment);
  const body = `/**
 * GENERATED FILE — ${course.generatorLabel} Assignment ${assignment} learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by ${course.generatorScriptName}; learning
 * objectives and the practice-problem mapping come from the hand-authored spec, and the retrieval
 * bank lives in the course's own retrieval-banks module. Do not edit by hand — regenerate. The
 * delivery layer only: the regulatory layer (sections, applied exercise, knowledge check,
 * remediation, timing, final exam) is untouched.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const ${exportPrefix}_BLOCKS = Object.freeze({
  courseId: ${q(course.courseId)},
  assignmentId: "assignment-${nn}",
  version: "1.0",
  contentPath: "/content/california/${course.courseId}-v1/lesson-${nn}.md",
  blocks: [
${rendered}
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default ${exportPrefix}_BLOCKS;
`;
  fs.writeFileSync(course.outFile(assignment), body);
  return course.outFile(assignment);
}

export function generateAll(course) {
  const targets = Object.keys(course.specs).map(Number).sort((a, b) => a - b);
  const out = [];
  for (const assignment of targets) out.push(generateCourseBlocks(course, assignment));
  return out;
}
