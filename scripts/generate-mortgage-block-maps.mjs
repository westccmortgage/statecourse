/**
 * CA-BLOCK rollout — generate learning-block maps for Mortgage assignments 2–15.
 *
 * WHAT THIS GENERATES AND FROM WHAT. Every Mortgage lesson shares one apparatus: six numbered
 * `## N.` sections carrying `### n.m` subsections, `## Key terms`, `## Practice problems`
 * (### Problem 1..8), `## Chapter summary`, the applied assignment, the knowledge check, and the
 * completion statement. This script reads each frozen lesson file and emits the assignment's
 * block map as a literal config module — the same shape the hand-authored Assignment 1 pilot
 * established — so the screen ranges are DERIVED from the lesson's own headings and can never
 * drift from them. Regenerate with:  node scripts/generate-mortgage-block-maps.mjs
 *
 * WHAT STAYS HAND-AUTHORED. Two things require understanding, not parsing, and live in
 * config/california/mortgage-block-specs.mjs: each block's learning objective, and the mapping of
 * the eight practice problems to the blocks teaching their concepts. The per-assignment retrieval
 * banks (6 primary + 6 replacement delivery-layer items) are hand-authored in
 * config/california/mortgage-retrieval-banks.mjs. The generator refuses to run when a spec is
 * missing or incomplete — it never invents pedagogy.
 *
 * SCREEN DERIVATION RULE. Instruction screens chunk a section's subsections in pairs (the last
 * chunk takes three when the count is odd), preserving the pilot's short-screen delivery; each
 * block then carries its mapped practice screens and closes with its retrieval screen. B7 is the
 * fixed apparatus block hosting the EXISTING regulatory instruments, exactly as in the pilot.
 * The lesson text itself is never copied — every screen is a heading-addressed range over the
 * frozen file, and the engine's coverage invariant proves the ranges tile the whole file.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MORTGAGE_BLOCK_SPECS } from "../config/california/mortgage-block-specs.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const curriculum = path.join(root, "california/ca-mortgage-loan-brokering-lending-45-v1/curriculum");

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

function generate(assignment) {
  const nn = String(assignment).padStart(2, "0");
  const spec = MORTGAGE_BLOCK_SPECS[assignment];
  if (!spec) throw new Error(`no spec for assignment ${assignment}`);
  const lessonPath = path.join(curriculum, `lesson-${nn}.md`);
  const markdown = fs.readFileSync(lessonPath, "utf8");
  const { sections, problems } = parseLesson(markdown);
  if (sections.length !== 6) throw new Error(`lesson-${nn}: ${sections.length} sections`);
  if (problems !== 8) throw new Error(`lesson-${nn}: ${problems} problems`);
  if (spec.objectives.length !== 7) throw new Error(`assignment ${assignment}: need 7 block objectives`);
  const assigned = Object.values(spec.problemMap).flat().sort((a, b) => a - b);
  if (assigned.join(",") !== "1,2,3,4,5,6,7,8") {
    throw new Error(`assignment ${assignment}: problem map must assign each of problems 1..8 exactly once (got ${assigned.join(",")})`);
  }

  const prefix = `a${assignment}`;
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

  const body = `/**
 * GENERATED FILE — Mortgage Assignment ${assignment} learning-block map (CA-BLOCK rollout).
 * Derived from the frozen lesson's own headings by scripts/generate-mortgage-block-maps.mjs;
 * learning objectives and the practice-problem mapping come from the hand-authored spec in
 * mortgage-block-specs.mjs, and the retrieval bank lives in mortgage-retrieval-banks.mjs.
 * Do not edit by hand — regenerate. The delivery layer only: the regulatory layer (sections,
 * applied exercise, knowledge check, remediation, timing, final exam) is untouched, and B7's
 * mastery derives from the existing assignment record exactly as in the Assignment 1 pilot.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const A${assignment}_BLOCKS = Object.freeze({
  courseId: "ca-mortgage-loan-brokering-lending-45",
  assignmentId: "assignment-${nn}",
  version: "1.0",
  contentPath: "/content/california/ca-mortgage-loan-brokering-lending-45-v1/lesson-${nn}.md",
  blocks: [
${rendered}
  ],
  apparatusRanges: [RANGE("## Practice problems", "### Problem 1")],
});

export default A${assignment}_BLOCKS;
`;
  const outPath = path.join(root, `config/california/mortgage-a${assignment}-blocks.mjs`);
  fs.writeFileSync(outPath, body);
  return outPath;
}

const targets = Object.keys(MORTGAGE_BLOCK_SPECS).map(Number).sort((a, b) => a - b);
for (const assignment of targets) {
  console.log("generated", path.relative(root, generate(assignment)));
}
